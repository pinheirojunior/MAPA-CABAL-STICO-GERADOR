import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { generateMapData, CabalisticMapData } from './src/utils/cabalisticMap.js';
import { generateMapPDF } from './src/utils/pdfGenerator.js';

import { buildFullCabalisticMap } from './src/services/mapBuilder.js';
import { buildMapPDF } from './src/pdf/pdfBuilder.js';
import { runEngineTests } from './src/numerology/engine.test.js';

import {
  createKaelSession,
  handleKaelUserMessage,
  getOptionsForState,
  KAEL_MESSAGES
} from './src/services/kaelService.js';
import { runKaelNLUTests } from './src/services/kaelService.test.js';
import { KaelSession, KaelMessage, OrderPaymentStatus } from './src/types/kael.js';
import {
  createPixPayment,
  getPaymentDetails,
  getPixQrCode,
  validateWebhookToken,
  OFFICIAL_PRICE,
  AsaasWebhookEvent
} from './src/services/asaasService.js';
import {
  sendWhatsAppMessage,
  sendWhatsAppDocument
} from './src/services/whatsappService.js';
import { Order, OrderStatus } from './src/types.js';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const PDFS_DIR = path.join(DATA_DIR, 'pdfs');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const MAPS_FILE = path.join(DATA_DIR, 'maps.json');
const KAEL_FILE = path.join(DATA_DIR, 'kael_sessions.json');
const PIX_CONFIG_FILE = path.join(DATA_DIR, 'pix_config.json');
const EVENTS_FILE = path.join(DATA_DIR, 'processed_webhook_events.json');

// Garante que os diretórios e arquivos JSON essenciais existam
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR, { recursive: true });
}
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(MAPS_FILE)) {
  fs.writeFileSync(MAPS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(KAEL_FILE)) {
  fs.writeFileSync(KAEL_FILE, JSON.stringify({}, null, 2));
}
if (!fs.existsSync(EVENTS_FILE)) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2));
}

const DEFAULT_PIX_CODE = '00020101021126580014br.gov.bcb.pix01360efa1471-55ad-4ce9-9f7a-6cd5d173525c5204000053039865802BR5913JOSE P JUNIOR6009FORTALEZA62070503***6304F837';

if (!fs.existsSync(PIX_CONFIG_FILE)) {
  fs.writeFileSync(PIX_CONFIG_FILE, JSON.stringify({ pixKey: DEFAULT_PIX_CODE }, null, 2));
}

// Funções auxiliares para leitura e escrita da chave PIX de contingência
function readPixConfig(): { pixKey: string } {
  try {
    if (fs.existsSync(PIX_CONFIG_FILE)) {
      const data = fs.readFileSync(PIX_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && parsed.pixKey) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler pix_config.json:', err);
  }
  return { pixKey: DEFAULT_PIX_CODE };
}

function savePixConfig(config: { pixKey: string }): void {
  try {
    fs.writeFileSync(PIX_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar pix_config.json:', err);
  }
}

// Funções para controle de Idempotência dos Webhooks do Asaas
function readProcessedEvents(): Set<string> {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const data = fs.readFileSync(EVENTS_FILE, 'utf-8');
      const arr = JSON.parse(data);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (err) {
    console.error('Erro ao ler processed_webhook_events.json:', err);
  }
  return new Set();
}

function markEventAsProcessed(eventId: string): void {
  try {
    const events = readProcessedEvents();
    events.add(eventId);
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(Array.from(events), null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar evento processado:', err);
  }
}

// Funções auxiliares para manipulação de sessões do Kael no JSON
function readKaelSessions(): Record<string, KaelSession> {
  try {
    const data = fs.readFileSync(KAEL_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler kael_sessions.json:', err);
    return {};
  }
}

function saveKaelSessions(sessions: Record<string, KaelSession>): void {
  try {
    fs.writeFileSync(KAEL_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar kael_sessions.json:', err);
  }
}

// Funções auxiliares para manipulação de pedidos no JSON
function readOrders(): Order[] {
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler orders.json:', err);
    return [];
  }
}

function saveOrders(orders: Order[]): void {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar orders.json:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // === ROTAS DO MAPA CABALÍSTICO IA ===

  // POST /api/generate-map : Gera o Mapa Cabalístico completo + PDF
  app.post('/api/generate-map', async (req: Request, res: Response) => {
    try {
      const { fullName, birthDate } = req.body;

      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        return res.status(400).json({ error: 'Nome completo de nascimento é obrigatório.' });
      }

      if (!birthDate || typeof birthDate !== 'string') {
        return res.status(400).json({ error: 'Data de nascimento é obrigatória.' });
      }

      // 1. Constrói o mapa numerológico + interpretação IA
      const mapData = await buildFullCabalisticMap(fullName.trim(), birthDate.trim());

      // 2. Gera o arquivo PDF no servidor
      await buildMapPDF(mapData);

      mapData.pdfUrl = `/api/pdf/${mapData.id}`;

      return res.status(200).json({ success: true, map: mapData });
    } catch (error) {
      console.error('Erro ao gerar Mapa Cabalístico IA:', error);
      return res.status(500).json({ error: 'Erro interno ao processar e gerar o Mapa Cabalístico IA.' });
    }
  });

  // GET /api/pdf/:id : Download do PDF gerado pelo mapa
  app.get('/api/pdf/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pdfPath = path.join(DATA_DIR, 'pdfs', `mapa-${id}.pdf`);

      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ error: 'Arquivo PDF não encontrado.' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=Mapa-Cabalistico-${id}.pdf`);

      const stream = fs.createReadStream(pdfPath);
      stream.pipe(res);
    } catch (error) {
      console.error('Erro ao servir PDF:', error);
      return res.status(500).json({ error: 'Erro ao carregar o arquivo PDF.' });
    }
  });

  // GET /api/test-engine : Executa os testes automatizados do motor numerológico
  app.get('/api/test-engine', (req: Request, res: Response) => {
    try {
      const result = runEngineTests();
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ passed: false, logs: [error?.message || 'Erro nos testes'] });
    }
  });

  // === ROTAS DE PAGAMENTO OFICIAL COM ASAAS ===

  // 1. POST /api/payments/create : Cria ou reutiliza cobrança PIX de R$ 14,90 no Asaas
  app.post('/api/payments/create', async (req: Request, res: Response) => {
    try {
      const { orderId, sessionId, name, birthDate, email, cpfCnpj } = req.body;

      const customerName = (name || '').trim();
      if (!customerName || customerName.length < 2) {
        return res.status(400).json({ error: 'Nome do cliente é obrigatório para gerar o pagamento.' });
      }

      const internalId = orderId || sessionId || `MC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Localiza pedido ou sessão existente
      const orders = readOrders();
      let order = orders.find((o) => o.id === internalId);

      const sessions = readKaelSessions();
      let session = sessionId ? sessions[sessionId] : null;

      const existingPaymentId = order?.asaasPaymentId || session?.asaasPaymentId;
      const existingCustomerId = order?.asaasCustomerId || session?.asaasCustomerId;

      // Chama a integração oficial do Asaas para criar cobrança PIX
      const result = await createPixPayment({
        orderId: internalId,
        customerName,
        customerEmail: email,
        customerCpfCnpj: cpfCnpj,
        existingPaymentId,
        existingCustomerId
      });

      if (!result.success) {
        return res.status(500).json({
          error: result.error || 'Não foi possível gerar a cobrança PIX no Asaas.',
          status: 'failed'
        });
      }

      // Atualiza ou registra pedido no arquivo orders.json
      if (!order) {
        order = {
          id: internalId,
          name: customerName,
          birthDate: (birthDate || session?.birthDate || '').trim(),
          price: OFFICIAL_PRICE,
          status: 'payment_pending',
          paymentStatus: 'payment_pending',
          createdAt: new Date().toISOString(),
          asaasPaymentId: result.paymentId,
          asaasCustomerId: result.customerId,
          pixCode: result.pixCode,
          qrCodeImage: result.qrCodeImage,
          map: null
        };
        orders.push(order);
      } else {
        order.asaasPaymentId = result.paymentId;
        order.asaasCustomerId = result.customerId;
        order.pixCode = result.pixCode;
        order.qrCodeImage = result.qrCodeImage;
        order.price = OFFICIAL_PRICE;
        order.paymentStatus = 'payment_pending';
      }
      saveOrders(orders);

      // Atualiza sessão do Kael se aplicável
      if (session) {
        session.orderId = internalId;
        session.asaasPaymentId = result.paymentId;
        session.asaasCustomerId = result.customerId;
        session.pixCode = result.pixCode;
        session.qrCodeImage = result.qrCodeImage;
        session.paymentValue = OFFICIAL_PRICE;
        session.paymentStatus = 'payment_pending';
        session.paymentCreatedAt = new Date().toISOString();
        sessions[sessionId] = session;
        saveKaelSessions(sessions);
      }

      return res.json({
        success: true,
        orderId: internalId,
        paymentId: result.paymentId,
        pixCode: result.pixCode,
        qrCodeImage: result.qrCodeImage,
        value: OFFICIAL_PRICE,
        status: result.status,
        isMockFallback: result.isMockFallback
      });
    } catch (error: any) {
      console.error('Erro em POST /api/payments/create:', error);
      return res.status(500).json({ error: 'Erro interno ao processar criação da cobrança PIX.' });
    }
  });

  // 2. GET /api/orders/:orderId/status (e GET /api/orders/:id/status): Consulta do status do pedido
  const handleOrderStatus = (req: Request, res: Response) => {
    try {
      const orderId = req.params.orderId || req.params.id;
      const orders = readOrders();
      const order = orders.find((o) => o.id === orderId);

      if (!order) {
        // Tenta buscar também em sessões Kael se id for um sessionId
        const sessions = readKaelSessions();
        const session = sessions[orderId];
        if (session) {
          const isCompleted = session.currentState === 'POS_VENDA' || session.mapDelivered;
          const isPaid = session.paymentStatus === 'pago' || session.paymentStatus === 'paid';
          let statusStr: OrderPaymentStatus = session.paymentStatus;
          if (isCompleted) statusStr = 'completed';
          else if (isPaid) statusStr = 'paid';

          return res.json({
            paymentStatus: statusStr,
            pdfAvailable: !!session.pdfUrl,
            pdfUrl: session.pdfUrl || null,
            orderId: session.orderId || session.sessionId
          });
        }

        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      const isCompleted = order.status === 'completed' || order.paymentStatus === 'completed' || (order.status === 'pago' && !!order.map);
      const isPaid = order.status === 'paid' || order.status === 'pago' || order.paymentStatus === 'paid';

      let statusStr: OrderStatus = order.paymentStatus || order.status;
      if (isCompleted) statusStr = 'completed';
      else if (isPaid) statusStr = 'paid';

      return res.json({
        paymentStatus: statusStr,
        pdfAvailable: isCompleted,
        pdfUrl: order.pdfUrl || (order.map ? `/api/pdf/${order.id}` : null),
        orderId: order.id
      });
    } catch (error) {
      console.error('Erro ao consultar status do pedido:', error);
      return res.status(500).json({ error: 'Erro interno ao consultar status do pedido.' });
    }
  };

  app.get('/api/orders/:orderId/status', handleOrderStatus);
  app.get('/api/orders/:id/status', handleOrderStatus);

  // 3. GET /api/kael/session/:sessionId/status : Consulta de status específica do Kael
  app.get('/api/kael/session/:sessionId/status', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const sessions = readKaelSessions();
      const session = sessions[sessionId];

      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada.' });
      }

      const isCompleted = session.currentState === 'POS_VENDA' || session.mapDelivered;
      const isPaid = session.paymentStatus === 'pago' || session.paymentStatus === 'paid';

      let statusStr: OrderPaymentStatus = session.paymentStatus;
      if (isCompleted) statusStr = 'completed';
      else if (session.currentState === 'GERANDO_MAPA' || session.currentState === 'MAPA_EM_PROCESSAMENTO') {
        statusStr = 'generating';
      } else if (isPaid) {
        statusStr = 'paid';
      }

      return res.json({
        sessionId: session.sessionId,
        orderId: session.orderId || null,
        paymentStatus: statusStr,
        currentState: session.currentState,
        pdfAvailable: isCompleted && !!session.pdfUrl,
        pdfUrl: session.pdfUrl || null,
        mapId: session.mapId || null
      });
    } catch (error) {
      console.error('Erro ao consultar status da sessão Kael:', error);
      return res.status(500).json({ error: 'Erro interno ao consultar status da sessão.' });
    }
  });

  // 4. POST /api/webhooks/asaas : Endpoint oficial de Webhook do Asaas com Idempotência e Validação
  app.post('/api/webhooks/asaas', async (req: Request, res: Response) => {
    try {
      // 1. Validação de Segurança do Token do Webhook
      const tokenHeader = req.headers['asaas-access-token'] as string | undefined;
      const isValid = validateWebhookToken(tokenHeader);
      if (!isValid) {
        console.warn('[WEBHOOK-ASAAS] Requisição rejeitada: token de webhook inválido ou ausente.');
        return res.status(401).json({ error: 'Token de autenticação do webhook inválido.' });
      }

      const webhookEvent = req.body as AsaasWebhookEvent;
      if (!webhookEvent || !webhookEvent.event || !webhookEvent.payment) {
        return res.status(400).json({ error: 'Payload de webhook inválido.' });
      }

      const eventId = webhookEvent.id || `${webhookEvent.event}-${webhookEvent.payment.id}-${webhookEvent.dateCreated}`;

      // 2. Verificação de Idempotência OBRIGATÓRIA
      const processedEvents = readProcessedEvents();
      if (processedEvents.has(eventId)) {
        console.log(`[WEBHOOK-ASAAS] Evento ${eventId} já processado anteriormente. Ignorando duplicação.`);
        return res.status(200).json({ received: true, alreadyProcessed: true });
      }

      const eventType = webhookEvent.event;
      const payment = webhookEvent.payment;

      console.log(`[WEBHOOK-ASAAS] Recebido evento: ${eventType} para pagamento ${payment.id} (Valor: R$ ${payment.value})`);

      // 3. Processamento de Pagamento Confirmado / Recebido (PAYMENT_RECEIVED / PAYMENT_CONFIRMED)
      if (eventType === 'PAYMENT_RECEIVED' || eventType === 'PAYMENT_CONFIRMED') {
        // Validação do valor da cobrança (R$ 14,90)
        const paymentVal = Number(payment.value);
        if (Math.abs(paymentVal - OFFICIAL_PRICE) > 0.05) {
          console.error(`[WEBHOOK-ASAAS] Divergência de valor no pagamento ${payment.id}: esperado R$ ${OFFICIAL_PRICE}, recebido R$ ${paymentVal}. Não liberando mapa automaticamente.`);
          markEventAsProcessed(eventId);
          return res.status(200).json({ received: true, warning: 'Valor divergente do esperado.' });
        }

        const externalRef = payment.externalReference || '';
        const paymentId = payment.id;

        // Localiza o pedido correspondente no orders.json
        const orders = readOrders();
        const orderIndex = orders.findIndex((o) => o.id === externalRef || o.asaasPaymentId === paymentId);

        // Localiza sessão do Kael correspondente no kael_sessions.json
        const sessions = readKaelSessions();
        let matchedSessionKey: string | null = null;
        for (const [key, sess] of Object.entries(sessions)) {
          if (sess.orderId === externalRef || sess.sessionId === externalRef || sess.asaasPaymentId === paymentId) {
            matchedSessionKey = key;
            break;
          }
        }

        let customerFullName = '';
        let customerBirthDate = '';

        if (orderIndex !== -1) {
          const currentOrder = orders[orderIndex];
          customerFullName = currentOrder.name;
          customerBirthDate = currentOrder.birthDate;

          // Se o pedido já estiver concluído e com PDF gerado, evita dupla geração
          if ((currentOrder.status === 'completed' || currentOrder.paymentStatus === 'completed') && currentOrder.pdfUrl && fs.existsSync(currentOrder.pdfPath || '')) {
            console.log(`[WEBHOOK-ASAAS] Pedido ${currentOrder.id} já possui PDF gerado e concluído. Pulando regeneração.`);
            markEventAsProcessed(eventId);
            return res.status(200).json({ received: true, status: 'already_completed' });
          }

          // 1. Atualiza status para 'paid'
          currentOrder.status = 'pago';
          currentOrder.paymentStatus = 'paid';
          currentOrder.paymentReceivedAt = new Date().toISOString();
          saveOrders(orders);
        }

        if (matchedSessionKey) {
          const sess = sessions[matchedSessionKey];
          if (!customerFullName) customerFullName = sess.fullName || '';
          if (!customerBirthDate) customerBirthDate = sess.birthDate || '';

          sess.paymentStatus = 'pago';
          sess.currentState = 'MAPA_EM_PROCESSAMENTO';
          saveKaelSessions(sessions);
        }

        // 2. Executa o gerador de Mapa Cabalístico e PDF EXISTENTES
        if (customerFullName && customerBirthDate) {
          console.log(`[WEBHOOK-ASAAS] Iniciando geração do Mapa Cabalístico para "${customerFullName}"...`);

          const mapData = await buildFullCabalisticMap(customerFullName, customerBirthDate);
          await buildMapPDF(mapData);

          const pdfUrl = `/api/pdf/${mapData.id}`;
          const pdfPath = path.join(PDFS_DIR, `mapa-${mapData.id}.pdf`);

          // 3. Atualiza pedido para 'completed'
          if (orderIndex !== -1) {
            orders[orderIndex].status = 'completed';
            orders[orderIndex].paymentStatus = 'completed';
            orders[orderIndex].pdfUrl = pdfUrl;
            orders[orderIndex].pdfPath = pdfPath;
            orders[orderIndex].map = mapData as any;
            saveOrders(orders);
          }

          // Atualiza sessão Kael e envia mensagens automáticas de entrega
          if (matchedSessionKey) {
            const sess = sessions[matchedSessionKey];
            sess.mapId = mapData.id;
            sess.pdfUrl = pdfUrl;
            sess.pdfPath = pdfPath;
            sess.paymentStatus = 'pago';
            sess.currentState = 'POS_VENDA';
            sess.mapDelivered = true;
            sess.conversationMode = 'SUPORTE_MAPA';

            // Mensagem 6 (Confirmação) e Mensagem 7 (Entrega do PDF)
            const hasMsg6 = sess.messages.some((m) => m.text === KAEL_MESSAGES.MSG_6);
            if (!hasMsg6) {
              sess.messages.push({
                id: `kael-${Date.now()}-msg6`,
                sender: 'kael',
                text: KAEL_MESSAGES.MSG_6,
                timestamp: new Date().toISOString()
              });
            }

            const hasMsg7 = sess.messages.some((m) => m.text === KAEL_MESSAGES.MSG_7);
            if (!hasMsg7) {
              sess.messages.push({
                id: `kael-${Date.now()}-msg7`,
                sender: 'kael',
                text: KAEL_MESSAGES.MSG_7,
                options: getOptionsForState('POS_VENDA'),
                pdfUrl: pdfUrl,
                timestamp: new Date().toISOString()
              });
            }

            saveKaelSessions(sessions);
          }

          console.log(`[WEBHOOK-ASAAS] Mapa Cabalístico gerado com sucesso: ${pdfUrl}`);
        } else {
          console.warn(`[WEBHOOK-ASAAS] Nome ou data de nascimento não encontrados para o pagamento ${payment.id}.`);
        }

        markEventAsProcessed(eventId);
        return res.status(200).json({ success: true, message: 'Pagamento processado com sucesso.' });
      }

      // 4. Trata outros eventos (OVERDUE, DELETED, CREATED, etc.)
      if (eventType === 'PAYMENT_OVERDUE' || eventType === 'PAYMENT_DELETED') {
        const orders = readOrders();
        const order = orders.find((o) => o.asaasPaymentId === payment.id || o.id === payment.externalReference);
        if (order) {
          order.status = 'cancelled';
          order.paymentStatus = 'cancelled';
          saveOrders(orders);
        }
      }

      markEventAsProcessed(eventId);
      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('[WEBHOOK-ASAAS] Erro ao processar webhook do Asaas:', error);
      return res.status(500).json({ error: 'Erro interno ao processar webhook.' });
    }
  });

  // === ROTAS DO KAEL (ASSISTENTE DE VENDAS) ===

  // 1. Iniciar/Obter Sessão Kael
  app.post('/api/kael/session', (req: Request, res: Response) => {
    try {
      let { sessionId } = req.body;
      if (!sessionId) {
        sessionId = `kael-sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      }

      const sessions = readKaelSessions();
      if (!sessions[sessionId]) {
        sessions[sessionId] = createKaelSession(sessionId);
        saveKaelSessions(sessions);
      }

      return res.json({ success: true, session: sessions[sessionId] });
    } catch (error) {
      console.error('Erro na sessão Kael:', error);
      return res.status(500).json({ error: 'Erro ao iniciar sessão do Kael.' });
    }
  });

  // 2. Enviar Mensagem ao Kael
  app.post('/api/kael/chat', async (req: Request, res: Response) => {
    try {
      const { sessionId, message, actionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Sessão é obrigatória.' });
      }

      const sessions = readKaelSessions();
      let session = sessions[sessionId];

      if (!session) {
        session = createKaelSession(sessionId);
      }

      const pixConfig = readPixConfig();
      const { updatedSession, newMessages } = await handleKaelUserMessage(
        session,
        message || '',
        undefined,
        actionId,
        pixConfig.pixKey
      );

      // Se o usuário entrou no estado de pagamento (ex: clicou em Quero pagar / actionId PAY),
      // cria ou recupera automaticamente a cobrança PIX do Asaas se fullName e birthDate estiverem preenchidos
      if (updatedSession.currentState === 'AGUARDANDO_PAGAMENTO' && updatedSession.fullName) {
        try {
          const internalOrderId = updatedSession.orderId || `MC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          updatedSession.orderId = internalOrderId;

          const pixResult = await createPixPayment({
            orderId: internalOrderId,
            customerName: updatedSession.fullName,
            existingPaymentId: updatedSession.asaasPaymentId,
            existingCustomerId: updatedSession.asaasCustomerId
          });

          if (pixResult.success && pixResult.pixCode) {
            updatedSession.asaasPaymentId = pixResult.paymentId;
            updatedSession.asaasCustomerId = pixResult.customerId;
            updatedSession.pixCode = pixResult.pixCode;
            updatedSession.qrCodeImage = pixResult.qrCodeImage;
            updatedSession.paymentValue = OFFICIAL_PRICE;
            updatedSession.paymentStatus = 'payment_pending';
          }
        } catch (asaasErr) {
          console.error('Erro ao gerar cobrança Asaas no chat do Kael:', asaasErr);
        }
      }

      sessions[sessionId] = updatedSession;
      saveKaelSessions(sessions);

      return res.json({
        success: true,
        session: updatedSession,
        newMessages,
        pixKey: updatedSession.pixCode || pixConfig.pixKey,
        qrCodeImage: updatedSession.qrCodeImage
      });
    } catch (error) {
      console.error('Erro no chat Kael:', error);
      return res.status(500).json({ error: 'Erro ao processar mensagem com o Kael.' });
    }
  });

  // === ROTAS ADMINISTRATIVAS PIX ===

  // GET /api/admin/pix-config
  app.get('/api/admin/pix-config', (req: Request, res: Response) => {
    const config = readPixConfig();
    return res.json(config);
  });

  // POST /api/admin/pix-config
  app.post('/api/admin/pix-config', (req: Request, res: Response) => {
    const { pixKey } = req.body;
    if (!pixKey || typeof pixKey !== 'string' || !pixKey.trim()) {
      return res.status(400).json({ error: 'Chave PIX inválida.' });
    }
    const cleanKey = pixKey.trim();
    savePixConfig({ pixKey: cleanKey });
    return res.json({ success: true, pixKey: cleanKey });
  });

  // 3. Simular/Confirmar Pagamento do Kael (Usado em testes locais de desenvolvimento)
  app.post('/api/kael/confirm-payment', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Sessão é obrigatória.' });
      }

      const sessions = readKaelSessions();
      const session = sessions[sessionId];

      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada.' });
      }

      if (!session.fullName || !session.birthDate) {
        return res.status(400).json({ error: 'Nome e data de nascimento são necessários para gerar o mapa.' });
      }

      const now = new Date().toISOString();

      // 1. Pagamento aprovado
      session.paymentStatus = 'pago';
      session.currentState = 'PAGAMENTO_CONFIRMADO';

      const msg6: KaelMessage = {
        id: `kael-${Date.now()}-6`,
        sender: 'kael',
        text: KAEL_MESSAGES.MSG_6,
        timestamp: now
      };
      session.messages.push(msg6);

      // 2. Estado em processamento e geração com os motores EXISTENTES
      session.currentState = 'MAPA_EM_PROCESSAMENTO';

      const mapData = await buildFullCabalisticMap(session.fullName, session.birthDate);
      await buildMapPDF(mapData);

      session.mapId = mapData.id;
      session.pdfUrl = `/api/pdf/${mapData.id}`;
      session.currentState = 'POS_VENDA';
      session.mapDelivered = true;
      session.conversationMode = 'SUPORTE_MAPA';

      const msg7: KaelMessage = {
        id: `kael-${Date.now()}-7`,
        sender: 'kael',
        text: KAEL_MESSAGES.MSG_7,
        options: getOptionsForState('POS_VENDA'),
        pdfUrl: session.pdfUrl,
        timestamp: new Date().toISOString()
      };
      session.messages.push(msg7);

      sessions[sessionId] = session;
      saveKaelSessions(sessions);

      return res.json({ success: true, session });
    } catch (error) {
      console.error('Erro ao confirmar pagamento Kael:', error);
      return res.status(500).json({ error: 'Erro interno ao processar e gerar o Mapa Cabalístico.' });
    }
  });

  // 4. Resetar Sessão do Kael
  app.post('/api/kael/reset', (req: Request, res: Response) => {
    try {
      const { sessionId, oldSessionId, newSessionId } = req.body;
      const targetOldSessionId = oldSessionId || sessionId;
      const targetNewSessionId = newSessionId || `kael-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const sessions = readKaelSessions();

      // Deleta a sessão anterior do histórico e da memória
      if (targetOldSessionId && sessions[targetOldSessionId]) {
        delete sessions[targetOldSessionId];
      }
      if (sessionId && sessions[sessionId] && sessionId !== targetNewSessionId) {
        delete sessions[sessionId];
      }

      // Cria uma nova sessão de atendimento completamente independente e zerada
      const newSession = createKaelSession(targetNewSessionId);
      sessions[targetNewSessionId] = newSession;
      saveKaelSessions(sessions);

      return res.json({ success: true, session: newSession });
    } catch (error) {
      console.error('Erro ao resetar sessão Kael:', error);
      return res.status(500).json({ error: 'Erro ao resetar a sessão do Kael.' });
    }
  });

  // === API ROTAS DE PEDIDOS ===

  // 1. Criar novo pedido (POST /api/orders)
  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const { name, birthDate, email, cpfCnpj } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Nome completo é obrigatório.' });
      }

      if (!birthDate || typeof birthDate !== 'string') {
        return res.status(400).json({ error: 'Data de nascimento é obrigatória.' });
      }

      const id = `MC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Cria cobrança PIX no Asaas para este pedido (R$ 14,90)
      const pixResult = await createPixPayment({
        orderId: id,
        customerName: name.trim(),
        customerEmail: email,
        customerCpfCnpj: cpfCnpj
      });

      const newOrder: Order = {
        id,
        name: name.trim(),
        birthDate: birthDate.trim(),
        price: OFFICIAL_PRICE,
        status: 'payment_pending',
        paymentStatus: 'payment_pending',
        asaasPaymentId: pixResult.paymentId,
        asaasCustomerId: pixResult.customerId,
        pixCode: pixResult.pixCode,
        qrCodeImage: pixResult.qrCodeImage,
        createdAt: new Date().toISOString(),
        map: null
      };

      const orders = readOrders();
      orders.push(newOrder);
      saveOrders(orders);

      return res.status(201).json(newOrder);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return res.status(500).json({ error: 'Erro interno do servidor ao processar pedido.' });
    }
  });

  // 2. Consultar pedido por ID (GET /api/orders/:id)
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const orders = readOrders();
      const order = orders.find((o) => o.id === id);

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      return res.json(order);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados do pedido.' });
    }
  });

  // 3. Simular pagamento aprovado (POST /api/orders/:id/test-payment)
  app.post('/api/orders/:id/test-payment', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const orders = readOrders();
      const orderIndex = orders.findIndex((o) => o.id === id);

      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      const order = orders[orderIndex];

      // Gerar dados numerológicos do mapa
      const mapData = generateMapData(order.name, order.birthDate);

      // Gerar PDF correspondente no servidor
      await generateMapPDF(order.id, mapData);

      // Atualizar status e mapa do pedido
      order.status = 'pago';
      order.paymentStatus = 'completed';
      order.map = mapData;
      orders[orderIndex] = order;

      saveOrders(orders);

      return res.json({
        message: 'Pagamento simulado e aprovado com sucesso! Mapa e PDF gerados.',
        order
      });
    } catch (error) {
      console.error('Erro ao simular pagamento:', error);
      return res.status(500).json({ error: 'Erro ao processar simulação de pagamento.' });
    }
  });

  // 4. Download / visualização segura do PDF (GET /api/orders/:id/pdf)
  app.get('/api/orders/:id/pdf', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const orders = readOrders();
      const order = orders.find((o) => o.id === id);

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }

      const isPaid = order.status === 'pago' || order.status === 'completed' || order.paymentStatus === 'completed' || order.paymentStatus === 'paid';
      if (!isPaid) {
        return res.status(403).json({ error: 'O PDF só está disponível para pedidos com pagamento confirmado.' });
      }

      // Procura primeiro em mapa-${id}.pdf
      let pdfPath = path.join(DATA_DIR, 'pdfs', `mapa-${id}.pdf`);
      if (!fs.existsSync(pdfPath) && order.pdfPath && fs.existsSync(order.pdfPath)) {
        pdfPath = order.pdfPath;
      }

      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ error: 'Arquivo PDF não encontrado.' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=mapa-${id}.pdf`);

      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Erro ao servir PDF:', error);
      return res.status(500).json({ error: 'Erro ao carregar o arquivo PDF.' });
    }
  });

  // 5. Chat com IA sobre o próprio mapa (POST /api/orders/:id/chat)
  app.post('/api/orders/:id/chat', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Mensagem inválida.' });
      }

      const orders = readOrders();
      const order = orders.find((o) => o.id === id);

      const isPaid = order && (order.status === 'pago' || order.status === 'completed');
      if (!order || !isPaid || !order.map) {
        return res.status(403).json({ error: 'O suporte por IA só está ativo para pedidos pagos.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          reply: 'Olá! O serviço de IA está em modo offline no momento. Seus números principais são: Destino ' + order.map.numbers.destino + ', Expressão ' + order.map.numbers.expressao + ' e Alma ' + order.map.numbers.alma + '.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const systemInstruction = `Você é um sábio e acolhedor Consultor de Cabala e Numerologia Mística.
O seu cliente se chama ${order.name}, nascido em ${order.map.userInfo.formattedBirthDate}.
Os números cabalísticos calculados dele são:
- Número de Destino (Caminho): ${order.map.numbers.destino}
- Número de Expressão (Talento): ${order.map.numbers.expressao}
- Número de Alma (Desejo): ${order.map.numbers.alma}
- Número de Personalidade: ${order.map.numbers.personalidade}
- Número de Missão: ${order.map.numbers.missao}
- Ano Pessoal Atual: ${order.map.numbers.anoPessoal}
- Elemento: ${order.map.element}
- Arcanjo/Anjo Guia: ${order.map.arcanoAnjo}
- Salmo de Proteção: ${order.map.salmoProtecao}

Responda às dúvidas de ${order.name} com sabedoria, tom místico porem claro, encorajador e acolhedor em português do Brasil.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      const reply = response.text || 'Não consegui interpretar a pergunta no momento. Tente novamente em instantes.';
      return res.json({ reply });
    } catch (error) {
      console.error('Erro no chat Gemini:', error);
      return res.status(500).json({ error: 'Erro ao processar consulta de IA.' });
    }
  });

  // === SUPORTE VITE / STATIC FILES ===
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Executa testes do motor numerológico e do interpretador NLU do Kael
  runEngineTests();
  await runKaelNLUTests();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Servidor Mapa Cabalístico rodando na porta ${PORT}`);
  });
}

startServer();
