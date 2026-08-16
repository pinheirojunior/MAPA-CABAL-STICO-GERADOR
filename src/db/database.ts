import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { Order, OrderStatus } from '../types.js';
import { KaelSession } from '../types/kael.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'app.sqlite');
const PDFS_DIR = path.join(DATA_DIR, 'pdfs');

// Arquivos legados para migração única
const LEGACY_ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const LEGACY_KAEL_FILE = path.join(DATA_DIR, 'kael_sessions.json');
const LEGACY_EVENTS_FILE = path.join(DATA_DIR, 'processed_webhook_events.json');
const LEGACY_PIX_FILE = path.join(DATA_DIR, 'pix_config.json');

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let isInitialized = false;

// Garante pastas essenciais
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR, { recursive: true });
}

/**
 * Salva o estado atual do banco SQLite no arquivo binário app.sqlite de forma atômica
 */
function persistDb(): void {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, buffer);
    fs.renameSync(tempPath, DB_PATH);
  } catch (error) {
    console.error('[DATABASE] Erro ao persistir app.sqlite:', error);
  }
}

/**
 * Inicializa o banco de dados SQLite e executa migrações automáticas
 */
export async function initDatabase(): Promise<Database> {
  if (db && isInitialized) return db;

  if (!SQL) {
    SQL = await initSqlJs();
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      console.log('[DATABASE] Banco de dados SQLite carregado com sucesso.');
    } catch (err) {
      console.warn('[DATABASE] Erro ao carregar app.sqlite existente. Criando novo banco...', err);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log('[DATABASE] Novo banco de dados SQLite criado.');
  }

  // Criação das tabelas
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      asaas_customer_id TEXT,
      asaas_payment_id TEXT,
      pix_code TEXT,
      qr_code_image TEXT,
      pdf_url TEXT,
      pdf_path TEXT,
      map_data TEXT,
      created_at TEXT NOT NULL,
      payment_received_at TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(asaas_payment_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      full_name TEXT,
      birth_date TEXT,
      current_state TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      order_id TEXT,
      map_id TEXT,
      pdf_url TEXT,
      pdf_path TEXT,
      map_delivered INTEGER DEFAULT 0,
      conversation_mode TEXT,
      pix_code TEXT,
      qr_code_image TEXT,
      payment_value REAL,
      payment_created_at TEXT,
      payment_received_at TEXT,
      messages TEXT NOT NULL,
      raw_session_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_order_id ON sessions(order_id);

    CREATE TABLE IF NOT EXISTS processed_webhook_events (
      event_id TEXT PRIMARY KEY,
      event_type TEXT,
      payment_id TEXT,
      payload TEXT,
      processed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Executa migração dos arquivos JSON legados se aplicável
  runLegacyMigrations(db);

  persistDb();
  isInitialized = true;
  return db;
}

/**
 * Migra dados de JSON legados para as novas tabelas SQLite
 */
function runLegacyMigrations(database: Database): void {
  const checkConfig = database.exec("SELECT value FROM app_config WHERE key = 'legacy_migrated'");
  if (checkConfig.length > 0 && checkConfig[0].values.length > 0) {
    // Migração já executada anteriormente
    return;
  }

  console.log('[DATABASE] Iniciando migração automática de JSON para SQLite...');

  // 1. Migração de Orders
  if (fs.existsSync(LEGACY_ORDERS_FILE)) {
    try {
      const ordersRaw = fs.readFileSync(LEGACY_ORDERS_FILE, 'utf-8');
      const orders: Order[] = JSON.parse(ordersRaw);
      if (Array.isArray(orders)) {
        for (const o of orders) {
          database.run(
            `INSERT OR IGNORE INTO orders (
              id, name, birth_date, price, status, payment_status,
              asaas_customer_id, asaas_payment_id, pix_code, qr_code_image,
              pdf_url, pdf_path, map_data, created_at, payment_received_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              o.id,
              o.name || '',
              o.birthDate || '',
              o.price || 14.9,
              o.status || 'payment_pending',
              o.paymentStatus || o.status || 'payment_pending',
              o.asaasCustomerId || null,
              o.asaasPaymentId || null,
              o.pixCode || null,
              o.qrCodeImage || null,
              o.pdfUrl || null,
              o.pdfPath || null,
              o.map ? JSON.stringify(o.map) : null,
              o.createdAt || new Date().toISOString(),
              o.paymentReceivedAt || null,
              new Date().toISOString()
            ]
          );
        }
        console.log(`[DATABASE] ${orders.length} pedidos migrados com sucesso.`);
      }
    } catch (e) {
      console.error('[DATABASE] Erro ao migrar orders.json:', e);
    }
  }

  // 2. Migração de Sessions
  if (fs.existsSync(LEGACY_KAEL_FILE)) {
    try {
      const kaelRaw = fs.readFileSync(LEGACY_KAEL_FILE, 'utf-8');
      const sessions: Record<string, KaelSession> = JSON.parse(kaelRaw);
      if (sessions && typeof sessions === 'object') {
        for (const [sId, sess] of Object.entries(sessions)) {
          database.run(
            `INSERT OR IGNORE INTO sessions (
              session_id, full_name, birth_date, current_state, payment_status,
              order_id, map_id, pdf_url, pdf_path, map_delivered,
              conversation_mode, pix_code, qr_code_image, payment_value,
              payment_created_at, payment_received_at, messages, raw_session_json,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              sId,
              sess.fullName || null,
              sess.birthDate || null,
              sess.currentState || 'MENU_PRINCIPAL',
              sess.paymentStatus || 'pending',
              sess.orderId || null,
              sess.mapId || null,
              sess.pdfUrl || null,
              sess.pdfPath || null,
              sess.mapDelivered ? 1 : 0,
              sess.conversationMode || null,
              sess.pixCode || null,
              sess.qrCodeImage || null,
              sess.paymentValue || 14.9,
              sess.paymentCreatedAt || null,
              sess.paymentReceivedAt || null,
              JSON.stringify(sess.messages || []),
              JSON.stringify(sess),
              sess.sessionStartedAt || new Date().toISOString(),
              sess.lastInteractionAt || new Date().toISOString()
            ]
          );
        }
        console.log(`[DATABASE] Sessões Kael migradas com sucesso.`);
      }
    } catch (e) {
      console.error('[DATABASE] Erro ao migrar kael_sessions.json:', e);
    }
  }

  // 3. Migração de Eventos de Webhook
  if (fs.existsSync(LEGACY_EVENTS_FILE)) {
    try {
      const eventsRaw = fs.readFileSync(LEGACY_EVENTS_FILE, 'utf-8');
      const events: string[] = JSON.parse(eventsRaw);
      if (Array.isArray(events)) {
        for (const ev of events) {
          database.run(
            `INSERT OR IGNORE INTO processed_webhook_events (event_id, processed_at) VALUES (?, ?)`,
            [ev, new Date().toISOString()]
          );
        }
        console.log(`[DATABASE] ${events.length} eventos de webhook migrados.`);
      }
    } catch (e) {
      console.error('[DATABASE] Erro ao migrar processed_webhook_events.json:', e);
    }
  }

  // 4. Migração de Chave PIX
  if (fs.existsSync(LEGACY_PIX_FILE)) {
    try {
      const pixRaw = fs.readFileSync(LEGACY_PIX_FILE, 'utf-8');
      const parsed = JSON.parse(pixRaw);
      if (parsed && parsed.pixKey) {
        database.run(
          `INSERT OR REPLACE INTO app_config (key, value, updated_at) VALUES ('pix_key', ?, ?)`,
          [parsed.pixKey, new Date().toISOString()]
        );
      }
    } catch (e) {
      console.error('[DATABASE] Erro ao migrar pix_config.json:', e);
    }
  }

  // Marca migração como concluída
  database.run(
    `INSERT OR REPLACE INTO app_config (key, value, updated_at) VALUES ('legacy_migrated', 'true', ?)`,
    [new Date().toISOString()]
  );
  console.log('[DATABASE] Migração para SQLite concluída com integridade.');
}

/**
 * Garante que o banco está aberto
 */
function getDb(): Database {
  if (!db) {
    throw new Error('Banco de dados SQLite não inicializado. Chame initDatabase() antes.');
  }
  return db;
}

/**
 * Executa uma função dentro de uma transação SQLite atômica
 */
export function runTransaction<T>(callback: () => T): T {
  const database = getDb();
  database.run('BEGIN TRANSACTION;');
  try {
    const result = callback();
    database.run('COMMIT;');
    persistDb();
    return result;
  } catch (error) {
    database.run('ROLLBACK;');
    throw error;
  }
}

// ==========================================
// MÉTODOS DE PEDIDOS (ORDERS)
// ==========================================

function rowToOrder(row: any[]): Order {
  const [
    id,
    name,
    birthDate,
    price,
    status,
    paymentStatus,
    asaasCustomerId,
    asaasPaymentId,
    pixCode,
    qrCodeImage,
    pdfUrl,
    pdfPath,
    mapDataStr,
    createdAt,
    paymentReceivedAt
  ] = row;

  let map = null;
  if (mapDataStr && typeof mapDataStr === 'string') {
    try {
      map = JSON.parse(mapDataStr);
    } catch {
      map = null;
    }
  }

  return {
    id,
    name,
    birthDate,
    price: Number(price),
    status: status as OrderStatus,
    paymentStatus: paymentStatus as OrderStatus,
    asaasCustomerId: asaasCustomerId || undefined,
    asaasPaymentId: asaasPaymentId || undefined,
    pixCode: pixCode || undefined,
    qrCodeImage: qrCodeImage || undefined,
    pdfUrl: pdfUrl || undefined,
    pdfPath: pdfPath || undefined,
    map,
    createdAt,
    paymentReceivedAt: paymentReceivedAt || undefined
  };
}

export function getOrderById(id: string): Order | null {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM orders WHERE id = ? LIMIT 1;');
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.get();
    stmt.free();
    return rowToOrder(row);
  }
  stmt.free();
  return null;
}

export function getOrderByAsaasPayment(paymentId: string): Order | null {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM orders WHERE asaas_payment_id = ? LIMIT 1;');
  stmt.bind([paymentId]);
  if (stmt.step()) {
    const row = stmt.get();
    stmt.free();
    return rowToOrder(row);
  }
  stmt.free();
  return null;
}

export function getAllOrders(): Order[] {
  const database = getDb();
  const res = database.exec('SELECT * FROM orders ORDER BY created_at DESC;');
  if (!res.length || !res[0].values) return [];
  return res[0].values.map(row => rowToOrder(row));
}

export function upsertOrder(order: Order): void {
  const database = getDb();
  const now = new Date().toISOString();
  database.run(
    `INSERT INTO orders (
      id, name, birth_date, price, status, payment_status,
      asaas_customer_id, asaas_payment_id, pix_code, qr_code_image,
      pdf_url, pdf_path, map_data, created_at, payment_received_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      birth_date = excluded.birth_date,
      price = excluded.price,
      status = excluded.status,
      payment_status = excluded.payment_status,
      asaas_customer_id = coalesce(excluded.asaas_customer_id, orders.asaas_customer_id),
      asaas_payment_id = coalesce(excluded.asaas_payment_id, orders.asaas_payment_id),
      pix_code = coalesce(excluded.pix_code, orders.pix_code),
      qr_code_image = coalesce(excluded.qr_code_image, orders.qr_code_image),
      pdf_url = coalesce(excluded.pdf_url, orders.pdf_url),
      pdf_path = coalesce(excluded.pdf_path, orders.pdf_path),
      map_data = coalesce(excluded.map_data, orders.map_data),
      payment_received_at = coalesce(excluded.payment_received_at, orders.payment_received_at),
      updated_at = excluded.updated_at;`,
    [
      order.id,
      order.name,
      order.birthDate,
      order.price || 14.9,
      order.status,
      order.paymentStatus || order.status,
      order.asaasCustomerId || null,
      order.asaasPaymentId || null,
      order.pixCode || null,
      order.qrCodeImage || null,
      order.pdfUrl || null,
      order.pdfPath || null,
      order.map ? JSON.stringify(order.map) : null,
      order.createdAt || now,
      order.paymentReceivedAt || null,
      now
    ]
  );
  persistDb();
}

// ==========================================
// MÉTODOS DE SESSÕES (SESSIONS)
// ==========================================

export function getSessionById(sessionId: string): KaelSession | null {
  const database = getDb();
  const stmt = database.prepare('SELECT raw_session_json FROM sessions WHERE session_id = ? LIMIT 1;');
  stmt.bind([sessionId]);
  if (stmt.step()) {
    const raw = stmt.get()[0] as string;
    stmt.free();
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  stmt.free();
  return null;
}

export function getSessionByOrderId(orderId: string): KaelSession | null {
  const database = getDb();
  const stmt = database.prepare('SELECT raw_session_json FROM sessions WHERE order_id = ? OR session_id = ? LIMIT 1;');
  stmt.bind([orderId, orderId]);
  if (stmt.step()) {
    const raw = stmt.get()[0] as string;
    stmt.free();
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  stmt.free();
  return null;
}

export function getSessionByPaymentId(paymentId: string): KaelSession | null {
  const database = getDb();
  const stmt = database.prepare('SELECT raw_session_json FROM sessions WHERE raw_session_json LIKE ? LIMIT 1;');
  stmt.bind([`%"asaasPaymentId":"${paymentId}"%`]);
  if (stmt.step()) {
    const raw = stmt.get()[0] as string;
    stmt.free();
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  stmt.free();
  return null;
}

export function getAllSessions(): Record<string, KaelSession> {
  const database = getDb();
  const res = database.exec('SELECT session_id, raw_session_json FROM sessions;');
  const map: Record<string, KaelSession> = {};
  if (!res.length || !res[0].values) return map;

  for (const row of res[0].values) {
    const sId = row[0] as string;
    const raw = row[1] as string;
    try {
      map[sId] = JSON.parse(raw);
    } catch {
      // Ignora registros corrompidos
    }
  }
  return map;
}

export function upsertSession(session: KaelSession): void {
  const database = getDb();
  const now = new Date().toISOString();
  const rawJson = JSON.stringify(session);
  const messagesJson = JSON.stringify(session.messages || []);

  database.run(
    `INSERT INTO sessions (
      session_id, full_name, birth_date, current_state, payment_status,
      order_id, map_id, pdf_url, pdf_path, map_delivered,
      conversation_mode, pix_code, qr_code_image, payment_value,
      payment_created_at, payment_received_at, messages, raw_session_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET
      full_name = excluded.full_name,
      birth_date = excluded.birth_date,
      current_state = excluded.current_state,
      payment_status = excluded.payment_status,
      order_id = coalesce(excluded.order_id, sessions.order_id),
      map_id = coalesce(excluded.map_id, sessions.map_id),
      pdf_url = coalesce(excluded.pdf_url, sessions.pdf_url),
      pdf_path = coalesce(excluded.pdf_path, sessions.pdf_path),
      map_delivered = excluded.map_delivered,
      conversation_mode = excluded.conversation_mode,
      pix_code = coalesce(excluded.pix_code, sessions.pix_code),
      qr_code_image = coalesce(excluded.qr_code_image, sessions.qr_code_image),
      payment_value = excluded.payment_value,
      payment_created_at = coalesce(excluded.payment_created_at, sessions.payment_created_at),
      payment_received_at = coalesce(excluded.payment_received_at, sessions.payment_received_at),
      messages = excluded.messages,
      raw_session_json = excluded.raw_session_json,
      updated_at = excluded.updated_at;`,
    [
      session.sessionId,
      session.fullName || null,
      session.birthDate || null,
      session.currentState || 'MENU_PRINCIPAL',
      session.paymentStatus || 'pending',
      session.orderId || null,
      session.mapId || null,
      session.pdfUrl || null,
      session.pdfPath || null,
      session.mapDelivered ? 1 : 0,
      session.conversationMode || null,
      session.pixCode || null,
      session.qrCodeImage || null,
      session.paymentValue || 14.9,
      session.paymentCreatedAt || null,
      session.paymentReceivedAt || null,
      messagesJson,
      rawJson,
      session.sessionStartedAt || now,
      now
    ]
  );
  persistDb();
}

export function deleteSessionById(sessionId: string): void {
  const database = getDb();
  database.run('DELETE FROM sessions WHERE session_id = ?;', [sessionId]);
  persistDb();
}

// ==========================================
// MÉTODOS DE EVENTOS DO WEBHOOK (IDEMPOTÊNCIA)
// ==========================================

export function isEventProcessed(eventId: string): boolean {
  const database = getDb();
  const stmt = database.prepare('SELECT 1 FROM processed_webhook_events WHERE event_id = ? LIMIT 1;');
  stmt.bind([eventId]);
  const exists = stmt.step();
  stmt.free();
  return exists;
}

export function markEventAsProcessed(
  eventId: string,
  eventType?: string,
  paymentId?: string,
  payload?: any
): void {
  const database = getDb();
  database.run(
    `INSERT OR IGNORE INTO processed_webhook_events (event_id, event_type, payment_id, payload, processed_at)
     VALUES (?, ?, ?, ?, ?);`,
    [
      eventId,
      eventType || null,
      paymentId || null,
      payload ? JSON.stringify(payload) : null,
      new Date().toISOString()
    ]
  );
  persistDb();
}

// ==========================================
// MÉTODOS DE CONFIGURAÇÃO (APP CONFIG)
// ==========================================

const DEFAULT_PIX_CODE = '00020101021126580014br.gov.bcb.pix01360efa1471-55ad-4ce9-9f7a-6cd5d173525c5204000053039865802BR5913JOSE P JUNIOR6009FORTALEZA62070503***6304F837';

export function getPixConfig(): { pixKey: string } {
  const database = getDb();
  const stmt = database.prepare("SELECT value FROM app_config WHERE key = 'pix_key' LIMIT 1;");
  if (stmt.step()) {
    const val = stmt.get()[0] as string;
    stmt.free();
    return { pixKey: val || DEFAULT_PIX_CODE };
  }
  stmt.free();
  return { pixKey: DEFAULT_PIX_CODE };
}

export function savePixConfig(pixKey: string): void {
  const database = getDb();
  const cleanKey = pixKey.trim();
  database.run(
    "INSERT OR REPLACE INTO app_config (key, value, updated_at) VALUES ('pix_key', ?, ?);",
    [cleanKey, new Date().toISOString()]
  );
  persistDb();
}
