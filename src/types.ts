export interface CabalisticMapData {
  methodologyNote: string;
  calculatedAt: string;
  userInfo: {
    fullName: string;
    birthDate: string;
    formattedBirthDate: string;
  };
  numbers: {
    destino: number;
    expressao: number;
    alma: number;
    personalidade: number;
    missao: number;
    anoPessoal: number;
  };
  element: string;
  arcanoAnjo: string;
  salmoProtecao: string;
  interpretations: {
    title: string;
    subtitle: string;
    summary: string;
    destinoText: string;
    expressaoText: string;
    almaText: string;
    personalidadeText: string;
    missaoText: string;
    anoPessoalText: string;
    desafios: string[];
    recomendacoes: string[];
  };
}

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'aguardando_pagamento'
  | 'pago';

export interface Order {
  id: string;
  name: string;
  birthDate: string;
  price: number;
  status: OrderStatus;
  createdAt: string;
  asaasCustomerId?: string;
  asaasPaymentId?: string;
  paymentStatus?: OrderStatus;
  paymentValue?: number;
  paymentCreatedAt?: string;
  paymentReceivedAt?: string;
  pixCode?: string;
  qrCodeImage?: string;
  pdfUrl?: string;
  pdfPath?: string;
  map?: CabalisticMapData | null;
}

export interface ChatMessage {
  sender: 'user' | 'ia';
  text: string;
  timestamp: string;
}
