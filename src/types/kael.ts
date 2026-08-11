export type KaelState =
  | 'PRIMEIRO_CONTATO'
  | 'AGUARDANDO_NOME_DATA'
  | 'DADOS_RECEBIDOS'
  | 'CONFIRMACAO_DOS_DADOS'
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGAMENTO_CONFIRMADO'
  | 'MAPA_EM_PROCESSAMENTO'
  | 'PDF_PRONTO'
  | 'POS_VENDA'
  | 'CONVERSA_ENCERRADA';

export interface KaelMessage {
  id: string;
  sender: 'kael' | 'user' | 'system';
  text: string;
  timestamp: string;
  pdfUrl?: string;
  pixCode?: string;
}

export interface KaelSession {
  sessionId: string;
  fullName?: string;
  birthDate?: string;
  currentState: KaelState;
  messages: KaelMessage[];
  paymentStatus: 'pendente' | 'pago';
  orderId?: string;
  mapId?: string;
  pdfPath?: string;
  pdfUrl?: string;
  messageCount: number;
  offTopicCount: number;
  lastInteractionAt: string;
  lastIntent?: MessageIntent;
  conversationMode?: 'PURCHASE_FLOW' | 'DATA_COLLECTION' | 'CONFIRMATION' | 'PAYMENT' | 'SUPORTE_MAPA' | 'POS_VENDA' | 'RESET_FLOW';
  priceAlreadyPresented?: boolean;
  pixAlreadyPresented?: boolean;
  presentationAlreadyMade?: boolean;
  mapDelivered?: boolean;
  sessionStartedAt?: string;
  lastTopic?: string;
  lastKaelReply?: string;
}

export interface PaymentService {
  createPayment(orderId: string, amount: number): Promise<{ pixCode: string; qrCodeUrl?: string }>;
  checkPaymentStatus(orderId: string): Promise<'pendente' | 'pago'>;
  simulatePaymentApproval(sessionId: string): Promise<boolean>;
}

export type MessageIntent =
  | 'GREETING'
  | 'QUESTION'
  | 'CLARIFICATION'
  | 'CORRECTION'
  | 'NAME'
  | 'BIRTH_DATE'
  | 'NAME_AND_BIRTH_DATE'
  | 'INVALID_DATE'
  | 'CONFIRMATION'
  | 'AFFIRMATION'
  | 'NEGATION'
  | 'PAYMENT_QUESTION'
  | 'PAYMENT_CLAIM'
  | 'PAYMENT_CONFIRMED'
  | 'REQUEST_RESET'
  | 'REQUEST_RESTART'
  | 'REQUEST_REPEAT'
  | 'REQUEST_GO_BACK'
  | 'REQUEST_CANCEL'
  | 'REQUEST_CHANGE_DATA'
  | 'REQUEST_HELP'
  | 'COMPLAINT'
  | 'CONFUSION'
  | 'OFF_TOPIC'
  | 'PURCHASE_INTENT'
  | 'NO_PURCHASE'
  | 'GOODBYE'
  | 'UNCLEAR';

export interface ClientInterpretation {
  intent: MessageIntent;
  fullName: string | null;
  birthDate: { formatted: string; iso: string; isValid?: boolean } | null;
  explanation?: string;
  confidence: number;
  targetField?: 'fullName' | 'birthDate' | 'both';
}

