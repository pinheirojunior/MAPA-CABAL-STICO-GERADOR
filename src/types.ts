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

export interface Order {
  id: string;
  name: string;
  birthDate: string;
  price: number;
  status: 'aguardando_pagamento' | 'pago';
  createdAt: string;
  map?: CabalisticMapData | null;
}

export interface ChatMessage {
  sender: 'user' | 'ia';
  text: string;
  timestamp: string;
}
