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
import { KaelSession, KaelMessage } from './src/types/kael.js';

interface Order {
  id: string;
  name: string;
  birthDate: string;
  price: number;
  status: 'aguardando_pagamento' | 'pago';
  createdAt: string;
  map?: CabalisticMapData | null;
}

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const PDFS_DIR = path.join(DATA_DIR, 'pdfs');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const MAPS_FILE = path.join(DATA_DIR, 'maps.json');
const KAEL_FILE = path.join(DATA_DIR, 'kael_sessions.json');
const PIX_CONFIG_FILE = path.join(DATA_DIR, 'pix_config.json');

// Garante que o diretório data, pdfs e os arquivos JSON existam
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
const DEFAULT_PIX_CODE = '00020101021126580014br.gov.bcb.pix01360efa1471-55ad-4ce9-9f7a-6cd5d173525c5204000053039865802BR5913JOSE P JUNIOR6009FORTALEZA62070503***6304F837';

if (!fs.existsSync(PIX_CONFIG_FILE)) {
  fs.writeFileSync(PIX_CONFIG_FILE, JSON.stringify({ pixKey: DEFAULT_PIX_CODE }, null, 2));
}

// Função auxiliar para leitura e escrita da chave PIX
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
      sessions[sessionId] = updatedSession;
      saveKaelSessions(sessions);

      return res.json({ success: true, session: updatedSession, newMessages, pixKey: pixConfig.pixKey });
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

  // 3. Simular/Confirmar Pagamento do Kael e gerar Mapa + PDF com os motores EXISTENTES
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

  // === API ROTAS DA APLICAÇÃO ANTERIOR (PIX/PEDIDOS) ===

  // 1. Criar novo pedido (POST /api/orders)
  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const { name, birthDate } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Nome completo é obrigatório.' });
      }

      if (!birthDate || typeof birthDate !== 'string') {
        return res.status(400).json({ error: 'Data de nascimento é obrigatória.' });
      }

      // Preço fixado estritamente no servidor como R$15
      const price = 15;
      const id = `MC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const newOrder: Order = {
        id,
        name: name.trim(),
        birthDate: birthDate.trim(),
        price,
        status: 'aguardando_pagamento',
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

      if (order.status !== 'pago') {
        return res.status(403).json({ error: 'O PDF só está disponível para pedidos com pagamento confirmado.' });
      }

      const pdfPath = path.join(DATA_DIR, 'pdfs', `mapa-${id}.pdf`);

      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ error: 'Arquivo PDF não encontrado. Tente simular novamente o pagamento.' });
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

      if (!order || order.status !== 'pago' || !order.map) {
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
        model: 'gemini-3.6-flash',
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
