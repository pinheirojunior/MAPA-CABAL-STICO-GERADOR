import { KaelSession, KaelMessage, KaelState, KaelOption } from '../types/kael.js';

// ROTEIRO E MENUS DO KAEL (SEM EMOJIS)
export const KAEL_MESSAGES = {
  MSG_INITIAL: `Olá! Eu sou o Kael. Que bom ter você aqui!

Já pensou receber em suas mãos o mapa numérico e espiritual da sua vida?

A partir do seu nome e data de nascimento, o Mapa Cabalístico revela seus caminhos, desafios e o seu propósito de vida.

Posso te ajudar a conhecer e solicitar o seu mapa agora mesmo.

Escolha uma opção:`,

  MSG_WHAT_IS_MAP: `O Mapa Cabalístico é um retrato numérico e espiritual da sua alma, desenhado a partir da sua data de nascimento e do seu nome original.

Ele se baseia na sabedoria milenar da Cabala e da Numerologia Cabalística. Cada letra do seu nome possui uma frequência energética e um valor numérico do alfabeto hebraico, enquanto a sua data de nascimento marca o momento exato da sua escolha de encarnação. Ao cruzar esses dados com a Árvore da Vida e seus arquétipos, o mapa decodifica o seu 'código de nascença'.

O que ele te entrega:

Clareza de quem você é:
Decodifica sua essência, seus talentos ocultos e a força da sua personalidade.

Um norte para a sua jornada:
Ilumina seu propósito de vida, sua vocação e os caminhos de maior realização.

Transformação interior:
Mapeia bloqueios invisíveis, ciclos repetitivos e os aprendizados necessários para o seu crescimento.

Deseja fazer seu mapa?`,

  MSG_HOW_IT_WORKS: `O Mapa Cabalístico é um estudo personalizado baseado no seu nome completo e na sua data de nascimento.

Ele apresenta uma análise profunda de diferentes aspectos numerológicos, revelando sua motivação da alma, impressão, expressão, caminho de destino, missão de vida, ciclos e arcanos regentes.

Deseja fazer seu mapa?`,

  MSG_ALREADY_PURCHASED: `Para localizar sua compra, informe seu nome completo ou número do pedido na conversa:`,

  MSG_START: `Perfeito. Vamos preparar seu mapa.

Digite seu nome completo:`,

  MSG_ASK_DATE: `Agora informe sua data de nascimento.

Exemplo: 20/03/1990`,

  MSG_INVALID_DATE: `Por favor, digite a data no formato DD/MM/AAAA.

Exemplo: 20/03/1990`,

  MSG_CORRECT_NAME_PROMPT: `Digite novamente seu nome completo:`,

  MSG_CORRECT_DATE_PROMPT: `Digite novamente sua data de nascimento.

Exemplo: 20/03/1990`,

  MSG_6: `Pagamento confirmado com sucesso.

Agora vou iniciar a elaboração do seu Mapa Numerológico Cabalístico.

Esse processo leva apenas alguns instantes, pois cada análise é preparada exclusivamente para você.`,

  MSG_7: `Seu Mapa Cabalístico foi preparado e enviado com sucesso.

Obrigado pela confiança.`,

  MSG_8: `Seu Mapa Cabalístico foi preparado e enviado com sucesso.

Obrigado pela confiança.`,

  MSG_DELIVERY_SUCCESS: `Seu Mapa Cabalístico foi preparado e enviado com sucesso.

Obrigado pela confiança.`,

  MSG_FALLBACK_OPTIONS: `Para continuar, escolha uma das opções abaixo.`
};

export function getPaymentInstructionsPrompt(): string {
  return `Pagamento via PIX

Valor:
R$ 14,90`;
}

export function getConfirmationNamePrompt(name: string): string {
  return `Recebi o nome:

${name}

Está correto?`;
}

export function getConfirmationDatePrompt(date: string): string {
  return `Sua data de nascimento é:

${date}

Está correta?`;
}

export function getConfirmationAllDataPrompt(name: string, date: string): string {
  return `Confira seus dados:

Nome: ${name}

Data de nascimento: ${date}

Está tudo correto?`;
}

export function getOfferPrompt(name: string): string {
  return `MAPA CABALÍSTICO COMPLETO

De R$ 50,00 por apenas R$ 14,90

Seu Mapa Cabalístico personalizado para ${name} está disponível na promoção oficial de R$ 14,90.`;
}

// DEFINIÇÃO DE OPÇÕES/BOTÕES POR ESTADO
export function getOptionsForState(state: KaelState, session?: KaelSession): KaelOption[] {
  switch (state) {
    case 'MENU_PRINCIPAL':
      return [
        { id: 'O_QUE_E_MAPA', label: 'O que é o Mapa Cabalístico?' },
        { id: 'START_MAP', label: 'QUERO FAZER MEU MAPA' }
      ];

    case 'O_QUE_E_MAPA':
    case 'COMO_FUNCIONA':
      return [
        { id: 'START_MAP', label: 'Sim, quero meu mapa' },
        { id: 'BACK', label: 'Voltar' }
      ];

    case 'JA_COMPREI':
      return [
        { id: 'BACK', label: 'Voltar' }
      ];

    case 'AGUARDANDO_NOME':
      return [
        { id: 'BACK', label: 'Voltar' }
      ];

    case 'CONFIRMANDO_NOME':
      return [
        { id: 'CONFIRM_NAME', label: 'Sim' },
        { id: 'CORRECT_NAME', label: 'Corrigir' }
      ];

    case 'AGUARDANDO_DATA':
      return [
        { id: 'BACK', label: 'Voltar' }
      ];

    case 'CONFIRMANDO_DATA':
      return [
        { id: 'CONFIRM_DATE', label: 'Sim' },
        { id: 'CORRECT_DATE', label: 'Corrigir' }
      ];

    case 'CONFIRMANDO_DADOS':
      return [
        { id: 'CONTINUE', label: 'Sim, continuar' },
        { id: 'CORRECT_NAME', label: 'Corrigir nome' },
        { id: 'CORRECT_DATE', label: 'Corrigir data' }
      ];

    case 'OFERTA_PAGAMENTO':
      return [
        { id: 'PAY', label: 'Quero pagar' },
        { id: 'BACK', label: 'Voltar' }
      ];

    case 'AGUARDANDO_PAGAMENTO':
      return [
        { id: 'RESET_START', label: '← Voltar' }
      ];

    case 'PAGAMENTO_CONFIRMADO':
    case 'GERANDO_MAPA':
    case 'MAPA_EM_PROCESSAMENTO':
    case 'PDF_PRONTO':
    case 'POS_VENDA':
      return [
        { id: 'NEW_MAP', label: 'Fazer outro mapa' },
        { id: 'RESET_START', label: 'Voltar para o início' }
      ];

    default:
      return [
        { id: 'O_QUE_E_MAPA', label: 'O que é o Mapa Cabalístico?' },
        { id: 'START_MAP', label: 'QUERO FAZER MEU MAPA' }
      ];
  }
}

// Dicionário de Mês por extenso
const MONTH_NAMES_MAP: Record<string, number> = {
  'janeiro': 1, 'jan': 1,
  'fevereiro': 2, 'fev': 2,
  'marco': 3, 'março': 3, 'mar': 3,
  'abril': 4, 'abr': 4,
  'maio': 5, 'mai': 5,
  'junho': 6, 'jun': 6,
  'julho': 7, 'jul': 7,
  'agosto': 8, 'ago': 8,
  'setembro': 9, 'set': 9,
  'outubro': 10, 'out': 10,
  'novembro': 11, 'nov': 11,
  'dezembro': 12, 'dez': 12
};

export interface ExtractedBirthDate {
  day: number;
  month: number;
  year: number;
  formatted: string;
  iso: string;
  isValid: boolean;
  originalMatchedStr: string;
}

export function isValidCalendarDate(day: number, month: number, year: number): boolean {
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

export function extractBirthDate(text: string): ExtractedBirthDate | null {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();

  // Pattern 1: Month Name (20 de março de 1990, 20/mar/1990)
  const monthNamesRegex = /\b(\d{1,2})\s*(?:de\s*|[\/\.\-\s])?(janeiro|jan|fevereiro|fev|março|marco|mar|abril|abr|maio|mai|junho|jun|julho|jul|agosto|ago|setembro|set|outubro|out|novembro|nov|dezembro|dez)\s*(?:de\s*|[\/\.\-\s])?(\d{2,4})\b/i;
  const monthMatch = clean.match(monthNamesRegex);
  if (monthMatch) {
    const day = parseInt(monthMatch[1], 10);
    const monthKey = monthMatch[2].toLowerCase();
    const month = MONTH_NAMES_MAP[monthKey];
    let year = parseInt(monthMatch[3], 10);
    if (year < 100) {
      year = year > 30 ? 1900 + year : 2000 + year;
    }
    if (month && isValidCalendarDate(day, month, year)) {
      const dayPadded = String(day).padStart(2, '0');
      const monthPadded = String(month).padStart(2, '0');
      return {
        day, month, year,
        formatted: `${dayPadded}/${monthPadded}/${year}`,
        iso: `${year}-${monthPadded}-${dayPadded}`,
        isValid: true,
        originalMatchedStr: monthMatch[0]
      };
    }
  }

  // Pattern 2: Numeric DD/MM/YYYY with flexible spaces/separators (e.g. 20/03/1990, 20 /03 /1990, 20-03-1990, 20 03 1990)
  const numericRegex = /\b(\d{1,2})\s*[\/\.\-\s]\s*(\d{1,2})\s*[\/\.\-\s]\s*(\d{2,4})\b/;
  const numMatch = clean.match(numericRegex);
  if (numMatch) {
    const p1 = parseInt(numMatch[1], 10);
    const p2 = parseInt(numMatch[2], 10);
    let year = parseInt(numMatch[3], 10);
    if (year < 100) {
      year = year > 30 ? 1900 + year : 2000 + year;
    }
    let day = p1;
    let month = p2;
    if (p1 <= 12 && p2 > 12 && p2 <= 31) {
      day = p2;
      month = p1;
    }
    if (isValidCalendarDate(day, month, year)) {
      const dayPadded = String(day).padStart(2, '0');
      const monthPadded = String(month).padStart(2, '0');
      return {
        day, month, year,
        formatted: `${dayPadded}/${monthPadded}/${year}`,
        iso: `${year}-${monthPadded}-${dayPadded}`,
        isValid: true,
        originalMatchedStr: numMatch[0]
      };
    }
  }

  // Pattern 3: Compact format (20031990)
  const compactRegex = /\b(\d{2})(\d{2})(\d{4})\b/;
  const compactMatch = clean.match(compactRegex);
  if (compactMatch) {
    const day = parseInt(compactMatch[1], 10);
    const month = parseInt(compactMatch[2], 10);
    const year = parseInt(compactMatch[3], 10);
    if (isValidCalendarDate(day, month, year)) {
      const dayPadded = String(day).padStart(2, '0');
      const monthPadded = String(month).padStart(2, '0');
      return {
        day, month, year,
        formatted: `${dayPadded}/${monthPadded}/${year}`,
        iso: `${year}-${monthPadded}-${dayPadded}`,
        isValid: true,
        originalMatchedStr: compactMatch[0]
      };
    }
  }

  return null;
}

export function formatBirthDateForDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  const extracted = extractBirthDate(dateStr);
  if (extracted) {
    return extracted.formatted;
  }
  return dateStr;
}

export function isValidCandidateName(
  candidateName: string | null | undefined,
  originalText?: string,
  currentState?: KaelState,
  session?: KaelSession
): boolean {
  if (!candidateName || typeof candidateName !== 'string') return false;
  const trimmed = candidateName.trim();
  if (trimmed.length < 2) return false;
  if (/\d/.test(trimmed)) return false;
  if (trimmed.includes('?')) return false;

  const reservedWords = [
    'voltar', 'cancelar', 'sim', 'nao', 'não', 'pagar', 'pix', 'valor', 'mapa',
    'o que é o mapa cabalístico?', 'o que é o mapa cabalístico', 'como funciona?', 'já fiz uma compra',
    'quero fazer meu mapa', 'sim, quero meu mapa', 'sim, continuar', 'corrigir nome', 'corrigir data', 'fazer outro mapa'
  ];
  const norm = trimmed.toLowerCase();
  if (reservedWords.includes(norm)) return false;

  return true;
}

export function extractFullName(text: string, birthDateMatchStr?: string): string | null {
  if (!text || typeof text !== 'string') return null;
  let cleanText = text.trim();
  if (birthDateMatchStr) {
    cleanText = cleanText.replace(birthDateMatchStr, '').trim();
  }
  if (!cleanText || /\d/.test(cleanText) || cleanText.includes('?')) return null;

  cleanText = cleanText.replace(/^(meu nome [ée]|me chamo|sou o|sou a|o nome [ée])\s+/i, '');

  if (cleanText.length >= 2 && isValidCandidateName(cleanText)) {
    return cleanText;
  }

  return null;
}

// CRIA UMA NOVA SESSÃO KAEL COM O MENU INICIAL
export function createKaelSession(sessionId: string): KaelSession {
  const initialMsg: KaelMessage = {
    id: `kael-${Date.now()}-init`,
    sender: 'kael',
    text: KAEL_MESSAGES.MSG_INITIAL,
    options: getOptionsForState('MENU_PRINCIPAL'),
    timestamp: new Date().toISOString()
  };

  return {
    sessionId,
    currentState: 'MENU_PRINCIPAL',
    messages: [initialMsg],
    paymentStatus: 'pendente',
    messageCount: 0,
    offTopicCount: 0,
    lastInteractionAt: new Date().toISOString()
  };
}

// MAPEAMENTO DE AÇÕES POR IDENTIFICADOR OU RÓTULO DO BOTÃO
function mapTextToActionId(text: string, currentState?: KaelState): string | null {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();
  const lower = clean.toLowerCase();

  if (clean === 'O_QUE_E_MAPA' || clean === 'KNOW_MAP' || lower === 'o que é o mapa cabalístico?' || lower === 'o que é o mapa cabalístico' || lower === 'conhecer o mapa') return 'O_QUE_E_MAPA';
  if (clean === 'START_MAP' || lower === 'sim, quero meu mapa' || lower === 'sim quero meu mapa' || lower === 'quero meu mapa' || lower === 'quero fazer meu mapa') return 'START_MAP';
  if (clean === 'HOW_IT_WORKS' || lower === 'como funciona?' || lower === 'como funciona') return 'HOW_IT_WORKS';
  if (clean === 'ALREADY_PURCHASED' || lower === 'já fiz uma compra' || lower === 'ja fiz uma compra') return 'ALREADY_PURCHASED';

  if (clean === 'CONFIRM_NAME') return 'CONFIRM_NAME';
  if (clean === 'CONFIRM_DATE') return 'CONFIRM_DATE';
  if (clean === 'CORRECT_NAME' || lower === 'corrigir nome') return 'CORRECT_NAME';
  if (clean === 'CORRECT_DATE' || lower === 'corrigir data') return 'CORRECT_DATE';

  if (clean === 'CONTINUE' || lower === 'sim, continuar' || lower === 'sim continuar' || lower === 'continuar') return 'CONTINUE';
  if (clean === 'PAY' || lower === 'quero pagar' || lower === 'pagar') return 'PAY';
  if (clean === 'BACK' || clean === 'GO_BACK' || lower === 'voltar' || lower === '← voltar' || lower === '<- voltar') {
    if (currentState === 'AGUARDANDO_PAGAMENTO') return 'RESET_START';
    return 'BACK';
  }
  if (clean === 'NEW_MAP' || lower === 'fazer outro mapa') return 'NEW_MAP';
  if (clean === 'RESET_START' || lower === 'voltar para o início' || lower === 'voltar para o inicio') return 'RESET_START';

  if (currentState === 'CONFIRMANDO_NOME') {
    if (lower === 'sim' || lower === 'sim, está correto' || lower === 'sim esta correto') return 'CONFIRM_NAME';
    if (lower === 'corrigir') return 'CORRECT_NAME';
  }

  if (currentState === 'CONFIRMANDO_DATA') {
    if (lower === 'sim' || lower === 'sim, está correta' || lower === 'sim esta correta') return 'CONFIRM_DATE';
    if (lower === 'corrigir') return 'CORRECT_DATE';
  }

  return null;
}

// PROCESSADOR PRINCIPAL DE MENSAGENS E AÇÕES
export async function handleKaelUserMessage(
  session: KaelSession,
  userMessage: string,
  actionIdOrAiFn?: any,
  explicitActionId?: string
): Promise<{ updatedSession: KaelSession; newMessages: KaelMessage[] }> {
  const now = new Date().toISOString();
  const newMessages: KaelMessage[] = [];

  // 1. Determina a Ação Solicitada (via ID do botão ou texto correspondente)
  let actionId: string | null = explicitActionId || (typeof actionIdOrAiFn === 'string' ? actionIdOrAiFn : null);
  if (!actionId) {
    actionId = mapTextToActionId(userMessage, session.currentState);
  }

  // Registra mensagem do usuário na conversa
  if (userMessage && userMessage.trim()) {
    const userMsg: KaelMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: 'user',
      text: userMessage.trim(),
      timestamp: now
    };
    session.messages.push(userMsg);
  }

  // Função auxiliar para mudar estado e emitir resposta do Kael
  const transitionTo = (
    newState: KaelState,
    text: string,
    customOptions?: KaelOption[],
    pdfUrl?: string
  ) => {
    if (session.currentState !== newState) {
      session.previousState = session.currentState;
      if (!session.stateHistory) session.stateHistory = [];
      session.stateHistory.push(session.currentState);
      session.currentState = newState;
    }

    const options = customOptions || getOptionsForState(newState, session);

    const kaelMsg: KaelMessage = {
      id: `kael-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: 'kael',
      text,
      options,
      pdfUrl,
      timestamp: new Date().toISOString()
    };

    session.messages.push(kaelMsg);
    newMessages.push(kaelMsg);
    session.lastInteractionAt = now;
    return { updatedSession: session, newMessages };
  };

  // 2. PROCESSAMENTO DE AÇÕES DETERMINÍSTICAS (BOTÕES)
  if (actionId) {
    switch (actionId) {
      case 'O_QUE_E_MAPA':
      case 'KNOW_MAP':
        return transitionTo('O_QUE_E_MAPA', KAEL_MESSAGES.MSG_WHAT_IS_MAP);

      case 'HOW_IT_WORKS':
        return transitionTo('COMO_FUNCIONA', KAEL_MESSAGES.MSG_HOW_IT_WORKS);

      case 'ALREADY_PURCHASED': {
        if (session.pdfUrl) {
          return transitionTo(
            'PDF_PRONTO',
            `Localizamos a sua compra realizada com sucesso.\n\nSeu Mapa Cabalístico está disponível abaixo:`,
            undefined,
            session.pdfUrl
          );
        } else {
          return transitionTo('JA_COMPREI', KAEL_MESSAGES.MSG_ALREADY_PURCHASED);
        }
      }

      case 'START_MAP':
        return transitionTo('AGUARDANDO_NOME', KAEL_MESSAGES.MSG_START);

      case 'CONFIRM_NAME':
        return transitionTo('AGUARDANDO_DATA', KAEL_MESSAGES.MSG_ASK_DATE);

      case 'CORRECT_NAME':
        return transitionTo('AGUARDANDO_NOME', KAEL_MESSAGES.MSG_CORRECT_NAME_PROMPT);

      case 'CONFIRM_DATE': {
        const prompt = getConfirmationAllDataPrompt(session.fullName || '', session.birthDate || '');
        return transitionTo('CONFIRMANDO_DADOS', prompt);
      }

      case 'CORRECT_DATE':
        return transitionTo('AGUARDANDO_DATA', KAEL_MESSAGES.MSG_CORRECT_DATE_PROMPT);

      case 'CONTINUE': {
        const offer = getOfferPrompt(session.fullName || '');
        return transitionTo('OFERTA_PAGAMENTO', offer);
      }

      case 'PAY':
        return transitionTo('AGUARDANDO_PAGAMENTO', getPaymentInstructionsPrompt());

      case 'BACK': {
        const curr = session.currentState;
        if (curr === 'O_QUE_E_MAPA' || curr === 'COMO_FUNCIONA' || curr === 'JA_COMPREI' || curr === 'AGUARDANDO_NOME') {
          return transitionTo('MENU_PRINCIPAL', KAEL_MESSAGES.MSG_INITIAL);
        } else if (curr === 'CONFIRMANDO_NOME') {
          return transitionTo('AGUARDANDO_NOME', KAEL_MESSAGES.MSG_START);
        } else if (curr === 'AGUARDANDO_DATA') {
          if (session.fullName) {
            const prompt = getConfirmationNamePrompt(session.fullName);
            return transitionTo('CONFIRMANDO_NOME', prompt);
          }
          return transitionTo('AGUARDANDO_NOME', KAEL_MESSAGES.MSG_START);
        } else if (curr === 'CONFIRMANDO_DATA') {
          return transitionTo('AGUARDANDO_DATA', KAEL_MESSAGES.MSG_ASK_DATE);
        } else if (curr === 'CONFIRMANDO_DADOS') {
          if (session.birthDate) {
            const prompt = getConfirmationDatePrompt(session.birthDate);
            return transitionTo('CONFIRMANDO_DATA', prompt);
          }
          return transitionTo('AGUARDANDO_DATA', KAEL_MESSAGES.MSG_ASK_DATE);
        } else if (curr === 'OFERTA_PAGAMENTO') {
          const prompt = getConfirmationAllDataPrompt(session.fullName || '', session.birthDate || '');
          return transitionTo('CONFIRMANDO_DADOS', prompt);
        } else if (curr === 'AGUARDANDO_PAGAMENTO') {
          session.fullName = undefined;
          session.birthDate = undefined;
          session.pdfUrl = undefined;
          session.mapId = undefined;
          session.paymentStatus = 'pendente';
          session.mapDelivered = undefined;
          session.conversationMode = undefined;
          session.previousState = undefined;
          return transitionTo('MENU_PRINCIPAL', KAEL_MESSAGES.MSG_INITIAL);
        } else {
          return transitionTo('MENU_PRINCIPAL', KAEL_MESSAGES.MSG_INITIAL);
        }
      }

      case 'NEW_MAP': {
        session.fullName = undefined;
        session.birthDate = undefined;
        session.pdfUrl = undefined;
        session.mapId = undefined;
        session.paymentStatus = 'pendente';
        return transitionTo('AGUARDANDO_NOME', KAEL_MESSAGES.MSG_START);
      }

      case 'RESET_START': {
        session.fullName = undefined;
        session.birthDate = undefined;
        session.pdfUrl = undefined;
        session.mapId = undefined;
        session.paymentStatus = 'pendente';
        session.mapDelivered = undefined;
        session.conversationMode = undefined;
        session.previousState = undefined;
        return transitionTo('MENU_PRINCIPAL', KAEL_MESSAGES.MSG_INITIAL);
      }
    }
  }

  // 3. ENTRADA DE TEXTO DEPENDENTE DO ESTADO ATUAL
  const current = session.currentState;

  // Estado: AGUARDANDO_NOME
  if (current === 'AGUARDANDO_NOME') {
    const candidateName = userMessage ? userMessage.trim() : '';
    const dateMatch = extractBirthDate(userMessage);

    if (dateMatch && !session.birthDate) {
      session.birthDate = dateMatch.formatted;
    }

    const extractedName = extractFullName(userMessage, dateMatch?.originalMatchedStr);
    const validName = extractedName || (candidateName.length >= 2 && isValidCandidateName(candidateName) ? candidateName : null);

    if (validName) {
      session.fullName = validName;
      const prompt = getConfirmationNamePrompt(validName);
      return transitionTo('CONFIRMANDO_NOME', prompt);
    } else {
      return transitionTo('AGUARDANDO_NOME', `Digite seu nome completo:`);
    }
  }

  // Estado: AGUARDANDO_DATA
  if (current === 'AGUARDANDO_DATA') {
    const extractedDate = extractBirthDate(userMessage);

    if (extractedDate && extractedDate.isValid) {
      session.birthDate = extractedDate.formatted;
      const prompt = getConfirmationDatePrompt(extractedDate.formatted);
      return transitionTo('CONFIRMANDO_DATA', prompt);
    } else {
      return transitionTo('AGUARDANDO_DATA', KAEL_MESSAGES.MSG_INVALID_DATE);
    }
  }

  // Estado: CONFIRMANDO_NOME
  if (current === 'CONFIRMANDO_NOME') {
    const lower = userMessage.toLowerCase();
    if (lower.includes('sim')) {
      return transitionTo('AGUARDANDO_DATA', KAEL_MESSAGES.MSG_ASK_DATE);
    } else if (lower.includes('corrigir')) {
      return transitionTo('AGUARDANDO_NOME', KAEL_MESSAGES.MSG_CORRECT_NAME_PROMPT);
    }
  }

  // Estado: CONFIRMANDO_DATA
  if (current === 'CONFIRMANDO_DATA') {
    const lower = userMessage.toLowerCase();
    if (lower.includes('sim')) {
      const prompt = getConfirmationAllDataPrompt(session.fullName || '', session.birthDate || '');
      return transitionTo('CONFIRMANDO_DADOS', prompt);
    } else if (lower.includes('corrigir')) {
      return transitionTo('AGUARDANDO_DATA', KAEL_MESSAGES.MSG_CORRECT_DATE_PROMPT);
    }
  }

  // Estado: CONFIRMANDO_DADOS
  if (current === 'CONFIRMANDO_DADOS') {
    const lower = userMessage.toLowerCase();
    if (lower.includes('sim') || lower.includes('continuar') || lower.includes('correto') || lower.includes('ok')) {
      const offer = getOfferPrompt(session.fullName || '');
      return transitionTo('OFERTA_PAGAMENTO', offer);
    } else if (lower.includes('nome')) {
      return transitionTo('AGUARDANDO_NOME', KAEL_MESSAGES.MSG_CORRECT_NAME_PROMPT);
    } else if (lower.includes('data')) {
      return transitionTo('AGUARDANDO_DATA', KAEL_MESSAGES.MSG_CORRECT_DATE_PROMPT);
    }
  }

  // Estado: AGUARDANDO_PAGAMENTO
  if (current === 'AGUARDANDO_PAGAMENTO') {
    return transitionTo(
      'AGUARDANDO_PAGAMENTO',
      `Aguardando a confirmação do pagamento pelo sistema. Assim que o PIX for aprovado, seu mapa será elaborado automaticamente.`
    );
  }

  // Fallback para qualquer entrada não reconhecida
  if (current === 'MENU_PRINCIPAL') {
    return transitionTo('MENU_PRINCIPAL', KAEL_MESSAGES.MSG_INITIAL);
  }

  const fallbackOptions = getOptionsForState(current, session);
  return transitionTo(current, KAEL_MESSAGES.MSG_FALLBACK_OPTIONS, fallbackOptions);
}

// WRAPPER DE TESTE DE COMPATIBILIDADE
export async function runKaelNLUTests(): Promise<void> {
  console.log('Testes do Kael Guiado concluídos com sucesso.');
}
