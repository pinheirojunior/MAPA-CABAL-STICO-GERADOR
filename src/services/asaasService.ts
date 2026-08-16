/**
 * Serviço de Integração com a API do Asaas (PIX + Clientes + Cobranças + Webhook)
 * Suporta ambientes Sandbox e Produção configurados via variáveis de ambiente.
 */

export interface AsaasCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj?: string;
  externalReference?: string;
  deleted?: boolean;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue?: number;
  originalValue?: number | null;
  interestValue?: number | null;
  description?: string;
  billingType: string;
  status: string;
  dueDate: string;
  originalDueDate?: string;
  paymentDate?: string | null;
  clientPaymentDate?: string | null;
  invoiceUrl?: string;
  invoiceNumber?: string;
  externalReference?: string;
  deleted?: boolean;
  dateCreated?: string;
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string; // Imagem em Base64 do QR Code PNG
  payload: string;      // Código PIX Copia e Cola oficial
  expirationDate: string;
}

export interface AsaasWebhookEvent {
  id: string;
  event:
    | 'PAYMENT_CREATED'
    | 'PAYMENT_UPDATED'
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_OVERDUE'
    | 'PAYMENT_DELETED'
    | 'PAYMENT_REFUNDED'
    | string;
  dateCreated: string;
  payment: AsaasPayment;
}

export interface CreatePixPaymentParams {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerCpfCnpj?: string;
  existingPaymentId?: string;
  existingCustomerId?: string;
}

export interface PaymentCreationResult {
  success: boolean;
  paymentId?: string;
  customerId?: string;
  pixCode?: string;
  qrCodeImage?: string;
  value: number;
  status: 'payment_pending' | 'paid' | 'generating' | 'completed' | 'failed' | 'error';
  error?: string;
  isMockFallback?: boolean;
}

import crypto from 'crypto';

export const OFFICIAL_PRICE = 14.90;

/**
 * Retorna a URL base do Asaas de acordo com o ambiente configurado
 */
export function getAsaasBaseUrl(): string {
  const env = (process.env.ASAAS_ENV || 'production').trim().toLowerCase();
  if (env === 'sandbox') {
    return 'https://api-sandbox.asaas.com/v3';
  }
  return 'https://api.asaas.com/v3';
}

/**
 * Obtém a chave de API de forma segura a partir das variáveis de ambiente
 */
export function getAsaasApiKey(): string {
  return (process.env.ASAAS_API_KEY || '').trim();
}

/**
 * Obtém o token de segurança do webhook configurado
 */
export function getAsaasWebhookToken(): string {
  return (process.env.ASAAS_WEBHOOK_TOKEN || '').trim();
}

/**
 * Valida a autenticidade do webhook do Asaas verificando o header 'asaas-access-token'
 * de forma resistente a timing attacks
 */
export function validateWebhookToken(headerToken: string | undefined): boolean {
  const configuredToken = getAsaasWebhookToken();
  if (!configuredToken) {
    console.warn('[SECURITY] ASAAS_WEBHOOK_TOKEN não configurada no ambiente. Webhook recebido sem verificação estrita.');
    return true;
  }
  if (!headerToken || typeof headerToken !== 'string') {
    return false;
  }
  const cleanHeader = headerToken.trim();
  if (cleanHeader.length !== configuredToken.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cleanHeader, 'utf-8'),
      Buffer.from(configuredToken, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Executa requisição HTTP autenticada contra a API do Asaas
 */
async function asaasFetch<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    retries?: number;
  } = {}
): Promise<T> {
  const apiKey = getAsaasApiKey();
  if (!apiKey) {
    throw new Error('ASAAS_API_KEY não configurada no ambiente.');
  }

  const baseUrl = getAsaasBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const method = options.method || 'GET';
  const maxRetries = options.retries ?? 2;

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'access_token': apiKey,
          'User-Agent': 'KaelCabalisticMap/1.0'
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.errors?.[0]?.description || data?.message || `Erro HTTP ${response.status} na API Asaas`;
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (err: any) {
      lastError = err;
      // Se for erro de rede/timeout e ainda tiver tentativas, espera um pouco
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
      }
    }
  }

  throw lastError || new Error('Falha na comunicação com o Asaas.');
}

/**
 * Cria ou localiza um cliente no Asaas
 */
export async function findOrCreateCustomer(params: {
  name: string;
  email?: string;
  cpfCnpj?: string;
  externalReference?: string;
}): Promise<AsaasCustomer> {
  const cleanName = params.name.trim();
  
  // Tenta buscar cliente existente pelo nome se não tiver CPF/Email
  try {
    const searchUrl = `/customers?name=${encodeURIComponent(cleanName)}&limit=1`;
    const searchRes = await asaasFetch<{ data: AsaasCustomer[] }>(searchUrl);
    if (searchRes?.data && searchRes.data.length > 0) {
      return searchRes.data[0];
    }
  } catch (err) {
    // Ignora erro de busca e tenta criar
  }

  // Cria novo cliente
  const payload: any = {
    name: cleanName,
    notificationDisabled: true
  };

  if (params.email && params.email.includes('@')) {
    payload.email = params.email.trim();
  }
  if (params.cpfCnpj) {
    payload.cpfCnpj = params.cpfCnpj.replace(/\D/g, '');
  }
  if (params.externalReference) {
    payload.externalReference = params.externalReference;
  }

  const createdCustomer = await asaasFetch<AsaasCustomer>('/customers', {
    method: 'POST',
    body: payload
  });

  return createdCustomer;
}

/**
 * Busca detalhes de uma cobrança existente
 */
export async function getPaymentDetails(paymentId: string): Promise<AsaasPayment | null> {
  try {
    const payment = await asaasFetch<AsaasPayment>(`/payments/${paymentId}`);
    return payment;
  } catch (err) {
    return null;
  }
}

/**
 * Recupera o QR Code e código PIX Copia e Cola de uma cobrança
 */
export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCodeResponse | null> {
  try {
    const qrData = await asaasFetch<AsaasPixQrCodeResponse>(`/payments/${paymentId}/pixQrCode`);
    return qrData;
  } catch (err) {
    console.error(`Erro ao buscar PIX QR Code para cobrança ${paymentId}:`, err);
    return null;
  }
}

/**
 * Cria uma cobrança PIX real no Asaas de R$ 14,90 associada ao pedido interno
 * Evita duplicidade se já existir cobrança pendente.
 */
export async function createPixPayment(params: CreatePixPaymentParams): Promise<PaymentCreationResult> {
  const apiKey = getAsaasApiKey();

  // Se a API Key do Asaas não estiver configurada no ambiente, retorna erro seguro sem gerar PIX falso
  if (!apiKey) {
    console.error('[ASAAS] Variável ASAAS_API_KEY não configurada no ambiente.');
    return {
      success: false,
      value: OFFICIAL_PRICE,
      status: 'error',
      error: 'Serviço de pagamento Asaas indisponível. A chave de integração (ASAAS_API_KEY) não está configurada.'
    };
  }

  try {
    // 1. Verifica se já existe um pagamento pendente registrado para esse pedido
    if (params.existingPaymentId) {
      const existingPayment = await getPaymentDetails(params.existingPaymentId);
      if (existingPayment && !existingPayment.deleted) {
        // Se ainda estiver pendente ou pago, reaproveita o QR Code existente
        if (existingPayment.status === 'PENDING' || existingPayment.status === 'AWAITING_PAYMENT') {
          const qrCode = await getPixQrCode(existingPayment.id);
          if (qrCode) {
            return {
              success: true,
              paymentId: existingPayment.id,
              customerId: existingPayment.customer,
              pixCode: qrCode.payload,
              qrCodeImage: qrCode.encodedImage ? `data:image/png;base64,${qrCode.encodedImage}` : undefined,
              value: OFFICIAL_PRICE,
              status: 'payment_pending'
            };
          }
        } else if (existingPayment.status === 'RECEIVED' || existingPayment.status === 'CONFIRMED') {
          return {
            success: true,
            paymentId: existingPayment.id,
            customerId: existingPayment.customer,
            value: OFFICIAL_PRICE,
            status: 'paid'
          };
        }
      }
    }

    // 2. Localiza ou cria o cliente no Asaas
    let customerId = params.existingCustomerId;
    if (!customerId) {
      const customer = await findOrCreateCustomer({
        name: params.customerName,
        email: params.customerEmail,
        cpfCnpj: params.customerCpfCnpj,
        externalReference: params.orderId
      });
      customerId = customer.id;
    }

    // 3. Define a data de vencimento (amanhã para dar tempo ao usuário)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const formattedDueDate = dueDate.toISOString().split('T')[0];

    // 4. Cria a cobrança PIX oficial no Asaas (R$ 14,90)
    const paymentPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: OFFICIAL_PRICE,
      dueDate: formattedDueDate,
      description: `Mapa Cabalístico Personalizado - Pedido ${params.orderId}`,
      externalReference: params.orderId,
      postalService: false
    };

    const payment = await asaasFetch<AsaasPayment>('/payments', {
      method: 'POST',
      body: paymentPayload
    });

    // 5. Recupera o QR Code e o código Copia e Cola gerados pelo Asaas
    const qrCode = await getPixQrCode(payment.id);

    return {
      success: true,
      paymentId: payment.id,
      customerId: customerId,
      pixCode: qrCode?.payload || '',
      qrCodeImage: qrCode?.encodedImage ? `data:image/png;base64,${qrCode.encodedImage}` : undefined,
      value: OFFICIAL_PRICE,
      status: 'payment_pending'
    };
  } catch (error: any) {
    console.error('[ASAAS] Erro ao criar cobrança PIX no Asaas:', error);
    return {
      success: false,
      value: OFFICIAL_PRICE,
      status: 'failed',
      error: error?.message || 'Não foi possível gerar a cobrança PIX no Asaas.'
    };
  }
}
