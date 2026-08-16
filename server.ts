import express, { Request, Response, NextFunction } from 'express';
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
import { Order, OrderStatus } from './src/types.js';
import {
  initDatabase,
  getOrderById,
  getOrderByAsaasPayment,
  getAllOrders,
  upsertOrder,
  getSessionById,
  getSessionByOrderId,
  getSessionByPaymentId,
  upsertSession,
  deleteSessionById,
  isEventProcessed,
  markEventAsProcessed,
  getPixConfig,
  savePixConfig,
  runTransaction
} from './src/db/database.js';
import {
  isValidIdentifier,
  sanitizeAndValidateName,
  validateBirthDate,
  isPathInsideDir
} from './src/utils/security.js';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const PDFS_DIR = path.join(DATA_DIR, 'pdfs');

// Garante que o diretório de PDFs exista
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR, { recursive: true });
}

async function startServer() {
  // ETAPA 2: Inicializa persistência segura com SQLite e executa migrações automáticas
  await initDatabase();

  const app = express();

  // ETAPA 10: Configuração de Segurança e Headers HTTP
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // CORS configurado para origens autorizadas da aplicação
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, asaas-access-token');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  app.use(express.json({ limit: '2mb' }));

  // === ROTAS DO MAPA CABALÍSTICO IA ===

  // POST /api/generate-map : Gera o Mapa Cabalístico completo + PDF
  app.post('/api/generate-map', async (req: Request, res: Response) => {
    try {
      const { fullName, birthDate } = req.body;

      const nameVal = sanitizeAndValidateName(fullName);
      if (!nameVal.valid) {
        return res.status(400).json({ success: false, error: nameVal.error || 'Nome completo inválido.' });
      }

      const dateVal = validateBirthDate(birthDate);
      if (!dateVal.valid) {
        return res.status(400).json({ success: false, error: dateVal.error || 'Data de nascimento inválida.' });
      }

      // 1. Constrói o mapa numerológico + interpretação
      const mapData = await buildFullCabalisticMap(nameVal.name, dateVal.birthDate);

      // 2. Gera o arquivo PDF no servidor (com verificação de arquivo existente)
      await buildMapPDF(mapData);

      mapData.pdfUrl = `/api/pdf/${mapData.id}`;

      return res.status(200).json({ success: true, map: mapData });
    } catch (error) {
      console.error('[MAPA-IA] Erro ao gerar Mapa Cabalístico:', error);
      return res.status(500).json({ success: false, error: 'Erro interno ao processar e gerar o Mapa Cabalístico.' });
    }
  });

  // GET /api/pdf/:id : Download do PDF gerado pelo mapa (com proteção contra Path Traversal)
  app.get('/api/pdf/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // ETAPA 5 & 11: Validação rigorosa de identificador
      if (!isValidIdentifier(id)) {
        return res.status(400).json({ success: false, error: 'Identificador de mapa inválido.' });
      }

      const pdfPath = path.join(PDFS_DIR, `mapa-${id}.pdf`);

      // Previne qualquer escape de diretório
      if (!isPathInsideDir(pdfPath, PDFS_DIR)) {
        console.warn(`[SECURITY] Tentativa de Path Traversal detectada com ID: ${id}`);
        return res.status(403).json({ success: false, error: 'Acesso não permitido.' });
      }

      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ success: false, error: 'Arquivo PDF não encontrado.' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=Mapa-Cabalistico-${id}.pdf`);

      const stream = fs.createReadStream(pdfPath);
      stream.on('error', (err) => {
        console.error('[PDF-STREAM] Erro no stream do PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: 'Erro ao transmitir arquivo PDF.' });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error('[PDF] Erro ao servir PDF:', error);
      return res.status(500).json({ success: false, error: 'Erro ao carregar o arquivo PDF.' });
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

      const nameVal = sanitizeAndValidateName(name);
      if (!nameVal.valid) {
        return res.status(400).json({ success: false, error: nameVal.error || 'Nome do cliente é obrigatório.' });
      }
      const customerName = nameVal.name;

      if (orderId && !isValidIdentifier(orderId)) {
        return res.status(400).json({ success: false, error: 'Formato de orderId inválido.' });
      }
      if (sessionId && !isValidIdentifier(sessionId)) {
        return res.status(400).json({ success: false, error: 'Formato de sessionId inválido.' });
      }

      const internalId = orderId || sessionId || `MC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Localiza pedido ou sessão existente no SQLite
      let order = getOrderById(internalId);
      let session = sessionId ? getSessionById(sessionId) : null;

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
          success: false,
          error: result.error || 'Não foi possível gerar a cobrança PIX no Asaas.',
          status: 'failed'
        });
      }

      // ETAPA 3: Transação atômica para salvar pedido e atualizar sessão
      runTransaction(() => {
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
        } else {
          order.asaasPaymentId = result.paymentId;
          order.asaasCustomerId = result.customerId;
          order.pixCode = result.pixCode;
          order.qrCodeImage = result.qrCodeImage;
          order.price = OFFICIAL_PRICE;
          order.paymentStatus = 'payment_pending';
        }
        upsertOrder(order);

        // Atualiza sessão do Kael se aplicável
        if (session && sessionId) {
          session.orderId = internalId;
          session.asaasPaymentId = result.paymentId;
          session.asaasCustomerId = result.customerId;
          session.pixCode = result.pixCode;
          session.qrCodeImage = result.qrCodeImage;
          session.paymentValue = OFFICIAL_PRICE;
          session.paymentStatus = 'payment_pending';
          session.paymentCreatedAt = new Date().toISOString();
          upsertSession(session);
        }
      });

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
      console.error('[PAYMENTS] Erro em POST /api/payments/create:', error);
      return res.status(500).json({ success: false, error: 'Erro interno ao processar criação da cobrança PIX.' });
    }
  });

  // 2. GET /api/orders/:orderId/status (e GET /api/orders/:id/status): Consulta do status do pedido
  const handleOrderStatus = (req: Request, res: Response) => {
    try {
      const orderId = req.params.orderId || req.params.id;

      if (!isValidIdentifier(orderId)) {
        return res.status(400).json({ success: false, error: 'Identificador inválido.' });
      }

      const order = getOrderById(orderId);

      if (!order) {
        // Tenta buscar em sessões Kael se id for um sessionId
        const session = getSessionById(orderId);
        if (session) {
          const isCompleted = session.currentState === 'POS_VENDA' || session.mapDelivered;
          const isPaid = session.paymentStatus === 'pago' || session.paymentStatus === 'paid';
          let statusStr: OrderPaymentStatus = session.paymentStatus;
          if (isCompleted) statusStr = 'completed';
          else if (isPaid) statusStr = 'paid';

          return res.json({
            success: true,
            paymentStatus: statusStr,
            pdfAvailable: !!session.pdfUrl,
            pdfUrl: session.pdfUrl || null,
            orderId: session.orderId || session.sessionId
          });
        }

        return res.status(404).json({ success: false, error: 'Pedido não encontrado.' });
      }

      const isCompleted = order.status === 'completed' || order.paymentStatus === 'completed' || (order.status === 'pago' && !!order.map);
      const isPaid = order.status === 'paid' || order.status === 'pago' || order.paymentStatus === 'paid';

      let statusStr: OrderStatus = order.paymentStatus || order.status;
      if (isCompleted) statusStr = 'completed';
      else if (isPaid) statusStr = 'paid';

      return res.json({
        success: true,
        paymentStatus: statusStr,
        pdfAvailable: isCompleted,
        pdfUrl: order.pdfUrl || (order.map ? `/api/pdf/${order.id}` : null),
        orderId: order.id
      });
    } catch (error) {
      console.error('[ORDERS] Erro ao consultar status do pedido:', error);
      return res.status(500).json({ success: false, error: 'Erro interno ao consultar status do pedido.' });
    }
  };

  app.get('/api/orders/:orderId/status', handleOrderStatus);
  app.get('/api/orders/:id/status', handleOrderStatus);

  // 3. GET /api/kael/session/:sessionId/status : Consulta de status específica do Kael
  app.get('/api/kael/session/:sessionId/status', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      if (!isValidIdentifier(sessionId)) {
        return res.status(400).json({ success: false, error: 'ID de sessão inválido.' });
      }

      const session = getSessionById(sessionId);

      if (!session) {
        return res.status(404).json({ success: false, error: 'Sessão não encontrada.' });
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
        success: true,
        sessionId: session.sessionId,
        orderId: session.orderId || null,
        paymentStatus: statusStr,
        currentState: session.currentState,
        pdfAvailable: isCompleted && !!session.pdfUrl,
        pdfUrl: session.pdfUrl || null,
        mapId: session.mapId || null
      });
    } catch (error) {
      console.error('[KAEL] Erro ao consultar status da sessão Kael:', error);
      return res.status(500).json({ success: false, error: 'Erro interno ao consultar status da sessão.' });
    }
  });

  // 4. POST /api/webhooks/asaas : Endpoint oficial de Webhook do Asaas com Idempotência, Transações e Validação
  app.post('/api/webhooks/asaas', async (req: Request, res: Response) => {
    try {
      // ETAPA 1: Validação de Segurança do Token do Webhook (Timing-Safe)
      const tokenHeader = req.headers['asaas-access-token'] as string | undefined;
      const isValid = validateWebhookToken(tokenHeader);
      if (!isValid) {
        console.warn(`[SECURITY] Webhook rejeitado: Token inválido ou ausente recebido de ${req.ip}`);
        return res.status(401).json({ success: false, error: 'Token de autenticação do webhook inválido.' });
      }

      const webhookEvent = req.body as AsaasWebhookEvent;
      if (!webhookEvent || !webhookEvent.event || !webhookEvent.payment) {
        console.warn('[WEBHOOK-ASAAS] Payload incompleto ou inválido recebido.');
        return res.status(400).json({ success: false, error: 'Payload de webhook inválido.' });
      }

      const eventId = webhookEvent.id || `${webhookEvent.event}-${webhookEvent.payment.id}-${webhookEvent.dateCreated}`;

      // ETAPA 4: Verificação de Idempotência no SQLite
      if (isEventProcessed(eventId)) {
        console.log(`[WEBHOOK-ASAAS] Evento ${eventId} já processado anteriormente no SQLite. Ignorando duplicação.`);
        return res.status(200).json({ received: true, alreadyProcessed: true });
      }

      const eventType = webhookEvent.event;
      const payment = webhookEvent.payment;

      console.log(`[WEBHOOK-ASAAS] Recebido evento: ${eventType} para pagamento ${payment.id} (Valor: R$ ${payment.value})`);

      // ETAPA 3 & 4: Processamento de Pagamento Confirmado / Recebido (PAYMENT_RECEIVED / PAYMENT_CONFIRMED)
      if (eventType === 'PAYMENT_RECEIVED' || eventType === 'PAYMENT_CONFIRMED') {
        // Validação do valor da cobrança (R$ 14,90)
        const paymentVal = Number(payment.value);
        if (Math.abs(paymentVal - OFFICIAL_PRICE) > 0.05) {
          console.error(`[WEBHOOK-ASAAS] Divergência de valor no pagamento ${payment.id}: esperado R$ ${OFFICIAL_PRICE}, recebido R$ ${paymentVal}. Não liberando mapa automaticamente.`);
          markEventAsProcessed(eventId, eventType, payment.id, webhookEvent);
          return res.status(200).json({ received: true, warning: 'Valor divergente do esperado.' });
        }

        const externalRef = payment.externalReference || '';
        const paymentId = payment.id;

        // Localiza pedido no SQLite
        let currentOrder = (externalRef ? getOrderById(externalRef) : null) || getOrderByAsaasPayment(paymentId);

        // Localiza sessão do Kael no SQLite
        let session = (externalRef ? getSessionById(externalRef) || getSessionByOrderId(externalRef) : null) || getSessionByPaymentId(paymentId);

        let customerFullName = currentOrder?.name || session?.fullName || '';
        let customerBirthDate = currentOrder?.birthDate || session?.birthDate || '';

        // Se o pedido já estiver concluído e com PDF gerado, evita dupla geração
        if (currentOrder && (currentOrder.status === 'completed' || currentOrder.paymentStatus === 'completed') && currentOrder.pdfUrl && fs.existsSync(currentOrder.pdfPath || '')) {
          console.log(`[WEBHOOK-ASAAS] Pedido ${currentOrder.id} já possui PDF gerado e concluído. Marcando evento como processado.`);
          markEventAsProcessed(eventId, eventType, paymentId, webhookEvent);
          return res.status(200).json({ received: true, status: 'already_completed' });
        }

        // 1. Atualiza status inicial para 'paid' dentro de transação atômica
        runTransaction(() => {
          if (currentOrder) {
            currentOrder.status = 'pago';
            currentOrder.paymentStatus = 'paid';
            currentOrder.paymentReceivedAt = new Date().toISOString();
            upsertOrder(currentOrder);
          }

          if (session) {
            session.paymentStatus = 'pago';
            session.currentState = 'MAPA_EM_PROCESSAMENTO';
            upsertSession(session);
          }
        });

        // 2. Executa o gerador de Mapa Cabalístico e PDF EXISTENTES
        if (customerFullName && customerBirthDate) {
          console.log(`[WEBHOOK-ASAAS] Iniciando geração do Mapa Cabalístico para "${customerFullName}"...`);

          const mapData = await buildFullCabalisticMap(customerFullName, customerBirthDate);
          await buildMapPDF(mapData);

          const pdfUrl = `/api/pdf/${mapData.id}`;
          const pdfPath = path.join(PDFS_DIR, `mapa-${mapData.id}.pdf`);

          // 3. Atualiza pedido e sessão para 'completed' de forma atômica
          runTransaction(() => {
            if (currentOrder) {
              currentOrder.status = 'completed';
              currentOrder.paymentStatus = 'completed';
              currentOrder.pdfUrl = pdfUrl;
              currentOrder.pdfPath = pdfPath;
              currentOrder.map = mapData as any;
              upsertOrder(currentOrder);
            }

            if (session) {
              session.mapId = mapData.id;
              session.pdfUrl = pdfUrl;
              session.pdfPath = pdfPath;
              session.paymentStatus = 'pago';
              session.currentState = 'POS_VENDA';
              session.mapDelivered = true;
              session.conversationMode = 'SUPORTE_MAPA';

              // Mensagem 6 (Confirmação) e Mensagem 7 (Entrega do PDF)
              const hasMsg6 = session.messages.some((m) => m.text === KAEL_MESSAGES.MSG_6);
              if (!hasMsg6) {
                session.messages.push({
                  id: `kael-${Date.now()}-msg6`,
                  sender: 'kael',
                  text: KAEL_MESSAGES.MSG_6,
                  timestamp: new Date().toISOString()
                });
              }

              const hasMsg7 = session.messages.some((m) => m.text === KAEL_MESSAGES.MSG_7);
              if (!hasMsg7) {
                session.messages.push({
                  id: `kael-${Date.now()}-msg7`,
                  sender: 'kael',
                  text: KAEL_MESSAGES.MSG_7,
                  options: getOptionsForState('POS_VENDA'),
                  pdfUrl: pdfUrl,
                  timestamp: new Date().toISOString()
                });
              }

              upsertSession(session);
            }

            // Registra evento de webhook como processado de forma atômica
            markEventAsProcessed(eventId, eventType, paymentId, webhookEvent);
          });

          console.log(`[WEBHOOK-ASAAS] Mapa Cabalístico gerado e persistido com sucesso: ${pdfUrl}`);
        } else {
          console.warn(`[WEBHOOK-ASAAS] Nome ou data de nascimento não encontrados para o pagamento ${payment.id}.`);
          markEventAsProcessed(eventId, eventType, paymentId, webhookEvent);
        }

        return res.status(200).json({ success: true, message: 'Pagamento processado com sucesso.' });
      }

      // 4. Trata outros eventos (OVERDUE, DELETED)
      if (eventType === 'PAYMENT_OVERDUE' || eventType === 'PAYMENT_DELETED') {
        const order = (payment.externalReference ? getOrderById(payment.externalReference) : null) || getOrderByAsaasPayment(payment.id);
        if (order) {
          order.status = 'cancelled';
          order.paymentStatus = 'cancelled';
          upsertOrder(order);
        }
      }

      markEventAsProcessed(eventId, eventType, payment.id, webhookEvent);
      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('[WEBHOOK-ASAAS] Erro ao processar webhook do Asaas:', error);
      return res.status(500).json({ success: false, error: 'Erro interno ao processar webhook.' });
    }
  });

  // === ROTAS DO KAEL (ASSISTENTE DE VENDAS) ===

  // 1. Iniciar/Obter Sessão Kael
  app.post('/api/kael/session', (req: Request, res: Response) => {
    try {
      let { sessionId } = req.body;

      if (sessionId && !isValidIdentifier(sessionId)) {
        return res.status(400).json({ success: false, error: 'Formato de sessionId inválido.' });
      }

      if (!sessionId) {
        sessionId = `kael-sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      }

      let session = getSessionById(sessionId);
      if (!session) {
        session = createKaelSession(sessionId);
        upsertSession(session);
      }

      return res.json({ success: true, session });
    } catch (error) {
      console.error('[KAEL] Erro na sessão Kael:', error);
      return res.status(500).json({ success: false, error: 'Erro ao iniciar sessão do Kael.' });
    }
  });

  // 2. Enviar Mensagem ao Kael
  app.post('/api/kael/chat', async (req: Request, res: Response) => {
    try {
      const { sessionId, message, actionId } = req.body;

      if (!sessionId || !isValidIdentifier(sessionId)) {
        return res.status(400).json({ success: false, error: 'Sessão é obrigatória e deve ter formato válido.' });
      }

      let session = getSessionById(sessionId);
      if (!session) {
        session = createKaelSession(sessionId);
      }

      const { updatedSession, newMessages } = await handleKaelUserMessage(
        session,
        message || '',
        undefined,
        actionId
      );

      // Se o usuário entrou no estado de pagamento, cria ou recupera cobrança PIX do Asaas
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
          } else {
            console.error('[KAEL-PIX] Não foi possível obter PIX dinâmico do Asaas:', pixResult.error);
          }
        } catch (asaasErr) {
          console.error('[KAEL-PIX] Erro ao gerar cobrança Asaas no chat do Kael:', asaasErr);
        }
      }

      // ETAPA 8: Persistência imediata da sessão no SQLite
      upsertSession(updatedSession);

      return res.json({
        success: true,
        session: updatedSession,
        newMessages,
        pixCode: updatedSession.pixCode,
        qrCodeImage: updatedSession.qrCodeImage
      });
    } catch (error) {
      console.error('[KAEL] Erro no chat Kael:', error);
      return res.status(500).json({ success: false, error: 'Erro ao processar mensagem com o Kael.' });
    }
  });

  // === ROTAS ADMINISTRATIVAS PIX ===

  // GET /api/admin/pix-config
  app.get('/api/admin/pix-config', (req: Request, res: Response) => {
    try {
      const config = getPixConfig();
      return res.json(config);
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Erro ao ler configuração PIX.' });
    }
  });

  // POST /api/admin/pix-config
  app.post('/api/admin/pix-config', (req: Request, res: Response) => {
    try {
      const { pixKey } = req.body;
      if (!pixKey || typeof pixKey !== 'string' || !pixKey.trim()) {
        return res.status(400).json({ success: false, error: 'Chave PIX inválida.' });
      }
      savePixConfig(pixKey);
      return res.json({ success: true, pixKey: pixKey.trim() });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Erro ao salvar configuração PIX.' });
    }
  });

  // 3. Simular/Confirmar Pagamento do Kael (Usado em testes locais de desenvolvimento)
  app.post('/api/kael/confirm-payment', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId || !isValidIdentifier(sessionId)) {
        return res.status(400).json({ success: false, error: 'Sessão inválida.' });
      }

      const session = getSessionById(sessionId);

      if (!session) {
        return res.status(404).json({ success: false, error: 'Sessão não encontrada.' });
      }

      if (!session.fullName || !session.birthDate) {
        return res.status(400).json({ success: false, error: 'Nome e data de nascimento são necessários para gerar o mapa.' });
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

      upsertSession(session);

      return res.json({ success: true, session });
    } catch (error) {
      console.error('[KAEL] Erro ao confirmar pagamento Kael:', error);
      return res.status(500).json({ success: false, error: 'Erro interno ao processar e gerar o Mapa Cabalístico.' });
    }
  });

  // 4. Resetar Sessão do Kael
  app.post('/api/kael/reset', (req: Request, res: Response) => {
    try {
      const { sessionId, oldSessionId, newSessionId } = req.body;
      const targetOldSessionId = oldSessionId || sessionId;
      const targetNewSessionId = newSessionId || `kael-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      if (targetOldSessionId && isValidIdentifier(targetOldSessionId)) {
        deleteSessionById(targetOldSessionId);
      }
      if (sessionId && sessionId !== targetNewSessionId && isValidIdentifier(sessionId)) {
        deleteSessionById(sessionId);
      }

      // Cria uma nova sessão de atendimento completamente independente e zerada
      const newSession = createKaelSession(targetNewSessionId);
      upsertSession(newSession);

      return res.json({ success: true, session: newSession });
    } catch (error) {
      console.error('[KAEL] Erro ao resetar sessão Kael:', error);
      return res.status(500).json({ success: false, error: 'Erro ao resetar a sessão do Kael.' });
    }
  });

  // === API ROTAS DE PEDIDOS ===

  // 1. Criar novo pedido (POST /api/orders)
  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const { name, birthDate, email, cpfCnpj } = req.body;

      const nameVal = sanitizeAndValidateName(name);
      if (!nameVal.valid) {
        return res.status(400).json({ success: false, error: nameVal.error || 'Nome completo é obrigatório.' });
      }

      const dateVal = validateBirthDate(birthDate);
      if (!dateVal.valid) {
        return res.status(400).json({ success: false, error: dateVal.error || 'Data de nascimento é obrigatória.' });
      }

      const id = `MC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Cria cobrança PIX no Asaas para este pedido (R$ 14,90)
      const pixResult = await createPixPayment({
        orderId: id,
        customerName: nameVal.name,
        customerEmail: email,
        customerCpfCnpj: cpfCnpj
      });

      const newOrder: Order = {
        id,
        name: nameVal.name,
        birthDate: dateVal.birthDate,
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

      upsertOrder(newOrder);

      return res.status(201).json(newOrder);
    } catch (error) {
      console.error('[ORDERS] Erro ao criar pedido:', error);
      return res.status(500).json({ success: false, error: 'Erro interno do servidor ao processar pedido.' });
    }
  });

  // 2. Consultar pedido por ID (GET /api/orders/:id)
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!isValidIdentifier(id)) {
        return res.status(400).json({ success: false, error: 'Identificador inválido.' });
      }

      const order = getOrderById(id);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Pedido não encontrado.' });
      }

      return res.json(order);
    } catch (error) {
      console.error('[ORDERS] Erro ao buscar pedido:', error);
      return res.status(500).json({ success: false, error: 'Erro ao buscar dados do pedido.' });
    }
  });

  // 3. Simular pagamento aprovado (POST /api/orders/:id/test-payment)
  app.post('/api/orders/:id/test-payment', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!isValidIdentifier(id)) {
        return res.status(400).json({ success: false, error: 'Identificador inválido.' });
      }

      const order = getOrderById(id);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Pedido não encontrado.' });
      }

      // Gerar dados numerológicos do mapa
      const mapData = generateMapData(order.name, order.birthDate);

      // Gerar PDF correspondente no servidor
      await generateMapPDF(order.id, mapData);

      // Atualizar status e mapa do pedido
      order.status = 'pago';
      order.paymentStatus = 'completed';
      order.map = mapData;

      upsertOrder(order);

      return res.json({
        success: true,
        message: 'Pagamento simulado e aprovado com sucesso! Mapa e PDF gerados.',
        order
      });
    } catch (error) {
      console.error('[ORDERS] Erro ao simular pagamento:', error);
      return res.status(500).json({ success: false, error: 'Erro ao processar simulação de pagamento.' });
    }
  });

  // 4. Download / visualização segura do PDF (GET /api/orders/:id/pdf)
  app.get('/api/orders/:id/pdf', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // ETAPA 5: Validação rigorosa contra Path Traversal
      if (!isValidIdentifier(id)) {
        return res.status(400).json({ success: false, error: 'Identificador inválido.' });
      }

      const order = getOrderById(id);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Pedido não encontrado.' });
      }

      const isPaid = order.status === 'pago' || order.status === 'completed' || order.paymentStatus === 'completed' || order.paymentStatus === 'paid';
      if (!isPaid) {
        return res.status(403).json({ success: false, error: 'O PDF só está disponível para pedidos com pagamento confirmado.' });
      }

      // Procura primeiro em mapa-${id}.pdf
      let pdfPath = path.join(PDFS_DIR, `mapa-${id}.pdf`);
      if (!fs.existsSync(pdfPath) && order.pdfPath && fs.existsSync(order.pdfPath)) {
        pdfPath = order.pdfPath;
      }

      if (!isPathInsideDir(pdfPath, PDFS_DIR)) {
        console.warn(`[SECURITY] Tentativa de Path Traversal no download de PDF para o pedido: ${id}`);
        return res.status(403).json({ success: false, error: 'Acesso negado.' });
      }

      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ success: false, error: 'Arquivo PDF não encontrado.' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=mapa-${id}.pdf`);

      const fileStream = fs.createReadStream(pdfPath);
      fileStream.on('error', (err) => {
        console.error('[PDF-STREAM] Erro ao ler PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: 'Erro ao transmitir arquivo PDF.' });
        }
      });
      fileStream.pipe(res);
    } catch (error) {
      console.error('[ORDERS] Erro ao servir PDF:', error);
      return res.status(500).json({ success: false, error: 'Erro ao carregar o arquivo PDF.' });
    }
  });

  // 5. Chat com IA sobre o próprio mapa (POST /api/orders/:id/chat)
  app.post('/api/orders/:id/chat', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!isValidIdentifier(id)) {
        return res.status(400).json({ success: false, error: 'Identificador inválido.' });
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Mensagem inválida.' });
      }

      const order = getOrderById(id);

      const isPaid = order && (order.status === 'pago' || order.status === 'completed' || order.paymentStatus === 'completed');
      if (!order || !isPaid || !order.map) {
        return res.status(403).json({ success: false, error: 'O suporte por IA só está ativo para pedidos pagos.' });
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
      console.error('[GEMINI] Erro no chat Gemini:', error);
      return res.status(500).json({ success: false, error: 'Erro ao processar consulta de IA.' });
    }
  });

  // ETAPA 6: Middleware Global de Tratamento de Erros
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[SERVER-ERROR] Erro não tratado:', err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(500).json({ success: false, error: 'Ocorreu um erro interno no processamento da solicitação.' });
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
    console.log(`✨ Servidor Mapa Cabalístico rodando com segurança na porta ${PORT}`);
  });
}

startServer();
