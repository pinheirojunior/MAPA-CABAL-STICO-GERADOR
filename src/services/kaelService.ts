import { KaelSession, KaelMessage, KaelState, MessageIntent, ClientInterpretation } from '../types/kael.js';

// ROTEIRO OFICIAL DO KAEL
export const KAEL_MESSAGES = {
  MSG_1: `Olá! Que alegria receber o seu contato!

Se você chegou até aqui hoje, saiba que talvez isso não seja apenas uma coincidência. Muitas vezes, o universo nos conduz exatamente para as experiências que precisamos viver no momento certo.

Hoje pode ser o início de uma nova compreensão sobre você mesmo.`,

  MSG_2: `Minha missão é traduzir os códigos presentes no seu nome e na sua data de nascimento através da Numerologia Cabalística.

O seu Mapa Numerológico Cabalístico revela aspectos profundos da sua personalidade, seus talentos naturais, desafios, missão de vida, ciclos atuais, potencial profissional, prosperidade, relacionamentos e caminhos para o seu desenvolvimento pessoal e espiritual.

O Mapa Numerológico Cabalístico está em promoção no momento: de R$ 50,00 por apenas R$ 15,00.

Cada mapa é elaborado de forma personalizada com base exclusivamente nos seus dados.`,

  MSG_3: `Para iniciar a elaboração do seu mapa, preciso apenas de duas informações:

1. Nome completo de nascimento (com acentos e sem abreviações)
2. Data de nascimento (DD/MM/AAAA)

Assim que você enviar essas informações, vou conferir os dados e explicar como funciona a entrega do seu mapa.

Estou muito feliz por fazer parte dessa descoberta.`,

  MSG_4: `Perfeito! Recebi suas informações.

Já consigo preparar o seu Mapa Numerológico Cabalístico totalmente personalizado.

Antes de iniciar a geração, preciso apenas confirmar o pagamento.

O investimento promocional de hoje é de apenas R$15,00.`,

  MSG_5: `Chave PIX:
pagamento@mapacabalistico.com.br

Assim que o pagamento for realizado, envie o comprovante por aqui ou aguarde a confirmação automática.

Logo após a confirmação, seu mapa começará a ser elaborado.`,

  MSG_6: `Pagamento confirmado com sucesso.

Agora vou iniciar a elaboração do seu Mapa Numerológico Cabalístico.

Esse processo leva apenas alguns minutos, pois cada análise é preparada exclusivamente para você.

Assim que estiver finalizado, enviarei o PDF completo aqui mesmo.`,

  MSG_7: `Seu mapa está pronto.

Foi um prazer preparar esta análise para você.

Segue abaixo o seu Mapa Numerológico Cabalístico Completo em PDF.

Espero que esta leitura traga clareza, autoconhecimento e novas perspectivas para sua caminhada.

Tenha uma excelente leitura.`,

  MSG_8: `Gostaria de agradecer pela confiança em meu trabalho.

Se você gostar da experiência, ficarei muito feliz se compartilhar com amigos ou familiares que também tenham interesse em conhecer melhor seus potenciais e desafios através da Numerologia Cabalística.

Agradeço pela confiança e desejo muito sucesso para você.`,

  MSG_CLOSE: `Foi um prazer conversar com você. Quando decidir fazer seu Mapa Numerológico Cabalístico, basta retornar a esta conversa e poderemos continuar de onde paramos.

Desejo tudo de bom para você.`
};

// Lista de palavras funcionais que NÃO constituem nome próprio
const NON_NAME_WORDS = new Set([
  'que', 'tipo', 'de', 'informação', 'informacao', 'preciso', 'mandar', 'enviar',
  'mas', 'meu', 'nome', 'nao', 'não', 'tem', 'acento', 'acentos', 'sem', 'com',
  'entendeu', 'fala', 'sobre', 'relacionamento', 'quanto', 'custa', 'qual', 'valor',
  'porque', 'por', 'como', 'funciona', 'onde', 'quando', 'coisa', 'coisas', 'fazer', 'saber',
  'posso', 'ter', 'pode', 'gerar', 'agora', 'obrigado', 'obrigada', 'valeu', 'entendi',
  'voce', 'você', 'esta', 'está', 'tá', 'ta', 'sim', 'resposta', 'pergunta', 'duvida',
  'dúvida', 'significa', 'quais', 'esse', 'essa', 'este', 'esta', 'mudar', 'preço',
  'preco', 'pagar', 'pix', 'paguei', 'pago', 'cancelar', 'desisto', 'tchau', 'adeus',
  'falei', 'falou', 'falar', 'falare', 'disse', 'dizer', 'entender', 'estou', 'estamos',
  'certo', 'correto', 'confirmo', 'continuar', 'seguir', 'perfeito', 'tudo',
  'resetar', 'reset', 'reiniciar', 'reinicia', 'voltar', 'começo', 'comeco', 'inicio',
  'início', 'primeiras', 'mensagens', 'apaga', 'esquece', 'refazer', 'novamente',
  'mandei', 'errado', 'errada', 'dados', 'corrigir', 'alterar', 'mae', 'mãe',
  'pai', 'filho', 'filha', 'esposa', 'marido', 'amigo', 'amiga', 'outra', 'pessoa',
  'comprar', 'fazer', 'pedir', 'burro', 'repetindo', 'repetidas', 'repetido', 'repetidos', 'repetir',
  'confusao', 'confusão', 'cientifico', 'científico', 'serve', 'sirve', 'acreditar', 'astral',
  'revela', 'profissão', 'profissao', 'trabalho', 'carreira', 'amor', 'relacionamentos',
  'dinheiro', 'prosperidade', 'finanças', 'financas', 'resultado', 'impacto', 'diz',
  'faço', 'faco', 'tinha', 'digitado', 'coloquei', 'antes', 'depois', 'queria', 'quero',
  'verdade', 'realmente', 'mesmo', 'saber', 'diferença', 'diferenca', 'so', 'só',
  'alguem', 'alguém', 'humano', 'atendente', 'suporte', 'atendimento', 'ia', 'robo', 'robô', 'bot',
  'inteligencia', 'inteligência', 'artificial', 'responde', 'resposta',
  'janeiro', 'jan', 'fevereiro', 'fev', 'marco', 'março', 'mar', 'abril', 'abr',
  'maio', 'mai', 'junho', 'jun', 'julho', 'jul', 'agosto', 'ago', 'setembro', 'set',
  'outubro', 'out', 'novembro', 'nov', 'dezembro', 'dez', 'nasci', 'dia', 'mes', 'mês',
  'ano', 'data', 'nascimento', 'minha'
]);

// Dicionário expandido de palavras e verbos associados a medos, objeções, dúvidas e frases conversacionais
const OBJECTION_AND_FEAR_WORDS = new Set([
  'medo', 'medos', 'perder', 'perda', 'perco', 'perdi', 'dinheiro', 'receber', 'recebo', 'recebi',
  'pagar', 'paguei', 'pagamento', 'confiavel', 'confiável', 'seguro', 'segurança', 'garantia', 'garantir',
  'golpe', 'fraude', 'engano', 'enganação', 'enganacao', 'fraudar', 'duvida', 'dúvida', 'duvidas', 'dúvidas',
  'perguntar', 'pergunta', 'custa', 'custo', 'valor', 'preço', 'preco', 'investimento', 'reais', 'gratis',
  'grátis', 'promoção', 'promocao', 'comprar', 'comprei', 'compraria', 'adquirir', 'cancelar', 'desistir',
  'desisto', 'continuar', 'prosseguir', 'saber', 'sei', 'sabe', 'queria', 'quero', 'gostaria', 'acho',
  'achando', 'tenho', 'temos', 'estou', 'estamos', 'to', 'tô', 'tou', 'vou', 'vai', 'vamos', 'ficar',
  'ficaria', 'fazer', 'fiz', 'farei', 'funciona', 'funcionar', 'cientifico', 'científico', 'certeza',
  'dizer', 'falar', 'falou', 'disse', 'mandei', 'enviei', 'enviar', 'coloquei', 'digitei', 'escrevi',
  'pensar', 'pensei', 'sabia', 'ver', 'vi', 'olha', 'olhar', 'entender', 'entendi', 'entendeu', 'explicar',
  'explica', 'ajudar', 'ajuda', 'atender', 'atende', 'atendimento', 'meu', 'minha', 'seu', 'sua',
  'alguem', 'alguém', 'humano', 'atendente', 'pessoa', 'suporte', 'atendimento', 'verdade',
  'ia', 'robo', 'robô', 'bot', 'inteligencia', 'inteligência', 'artificial', 'coisas', 'repetidas', 'repetindo', 'repetir', 'responde'
]);

// Validação Determinística para Nomes Candidatos
export function isValidCandidateName(
  candidateName: string | null | undefined,
  originalText: string,
  currentState: KaelState,
  session: KaelSession
): boolean {
  if (!candidateName || typeof candidateName !== 'string') return false;

  const trimmedCandidate = candidateName.trim();
  if (trimmedCandidate.length < 2) return false;

  const normCandidate = trimmedCandidate.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normOriginal = originalText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Não pode conter pontuação de interrogação
  if (originalText.includes('?')) return false;

  // 2. Não pode conter dígitos numéricos
  if (/\d/.test(normCandidate)) return false;

  const hasExplicitNameIntro = /meu nome [ée]\s+/i.test(originalText) ||
    /me chamo\s+/i.test(originalText) ||
    /o nome correto [ée]\s+/i.test(originalText) ||
    /o correto [ée]\s+/i.test(originalText) ||
    /trocar para\s+/i.test(originalText) ||
    /mudar para\s+/i.test(originalText) ||
    /corrige para\s+/i.test(originalText) ||
    /corrigir para\s+/i.test(originalText);

  // 3. Verificação de palavras de dúvida/pergunta no texto original (permitido se houver introdução explícita de nome)
  const questionWords = [
    'o que', 'como', 'qual', 'quanto', 'porque', 'por que', 'onde', 'quando',
    'fala de', 'fala sobre', 'preciso', 'onde manda', 'posso', 'pode', 'duvida',
    'dúvida', 'funciona', 'cientifico', 'científico', 'serve', 'acreditar',
    'confiável', 'confiavel', 'saber se', 'será', 'seria', 'é seguro', 'e seguro'
  ];
  if (!hasExplicitNameIntro && questionWords.some(qw => normOriginal.includes(qw))) return false;

  // 4. Verificação de palavras/frases de objeção, medo, preço e conversa no texto original
  const objectionPhrases = [
    'medo', 'perder', 'dinheiro', 'perda', 'perco', 'confiavel', 'confiável',
    'custa', 'valor', 'preço', 'preco', 'comprar', 'pagar', 'receber', 'recebo',
    'duvida', 'dúvida', 'fraude', 'golpe', 'garantia', 'certeza', 'reais',
    'não quero', 'nao quero', 'não vou', 'nao vou', 'cancelar', 'desisto',
    'sim', 'não', 'nao', 'pode continuar', 'tudo certo', 'está certo', 'esta certo',
    'está correto', 'esta correto', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'tchau',
    'alguem', 'alguém', 'humano', 'atendente', 'pessoa', 'suporte', 'atendimento',
    'verdade', 'ia', 'robo', 'robô', 'bot', 'inteligencia', 'inteligência', 'artificial',
    'coisas', 'repetidas', 'repetindo', 'repetir', 'resposta', 'responde',
    'queria', 'quero', 'gostaria', 'posso', 'pode', 'como', 'porque', 'por que',
    'voce', 'você', 'estou', 'tenho', 'so responde', 'só responde', 'so fala', 'só fala'
  ];

  if (objectionPhrases.some(ok => normOriginal.includes(ok)) && !hasExplicitNameIntro) {
    return false;
  }

  // 5. Verificação das palavras do nome candidato contra palavras reservadas
  const words = normCandidate.split(/\s+/).filter(w => w.length > 0);
  const prepositions = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

  for (const w of words) {
    if (prepositions.has(w)) continue;
    if (NON_NAME_WORDS.has(w) || OBJECTION_AND_FEAR_WORDS.has(w)) {
      return false;
    }
  }

  // 6. Contagem de palavras válidas
  const nonPrepWords = words.filter(w => !prepositions.has(w));

  if (nonPrepWords.length === 1) {
    if (!hasExplicitNameIntro) {
      return false; // Nome de 1 única palavra sem introdução explícita não é aceito
    }
  } else if (nonPrepWords.length < 2) {
    return false; // Menos de 2 palavras não é um nome completo válido
  }

  // 7. PROTEÇÃO RÍGIDA CONTRA SUBSTITUIÇÃO DE NOME JÁ CONFIRMADO NA SESSÃO:
  // Se o nome e a data já estão salvos e confirmados na sessão,
  // NÃO SUBSTITUIR o nome a menos que haja um marcador EXPLÍCITO de correção de dados OU estejamos em um sub-estado de correção!
  const isCorrectionContext =
    session.subState === 'CORRIGINDO_NOME' ||
    session.pendingCorrection === 'fullName' ||
    session.subState === 'AGUARDANDO_QUAL_DADO';

  const hasConfirmedData = Boolean(session.fullName && session.birthDate);
  if (hasConfirmedData && !isCorrectionContext) {
    const isExplicitCorrection =
      /meu nome (est[aá]|era|ficou) errado/i.test(originalText) ||
      /nome (est[aá]|era|ficou) errado/i.test(originalText) ||
      /dados (est[aá]o|ficaram) errados/i.test(originalText) ||
      /mandei (o nome|os dados|errado)/i.test(originalText) ||
      /errei (o nome|meu nome)/i.test(originalText) ||
      /corrigir (o nome|meu nome)/i.test(originalText) ||
      /mudar (o nome|meu nome)/i.test(originalText) ||
      /alterar (o nome|meu nome)/i.test(originalText) ||
      /trocar (o nome|meu nome)/i.test(originalText) ||
      /coloquei (o nome|meu nome) errado/i.test(originalText) ||
      /o nome correto [ée]/i.test(originalText) ||
      /o correto [ée]/i.test(originalText) ||
      /correto [ée]/i.test(originalText) ||
      /meu nome [ée]/i.test(originalText) ||
      /me chamo/i.test(originalText) ||
      /corrige para/i.test(originalText) ||
      /corrigir para/i.test(originalText);

    if (!isExplicitCorrection) {
      const isCleanNameInConfirmation = currentState === 'CONFIRMACAO_DOS_DADOS' &&
        nonPrepWords.length >= 2;

      if (!isCleanNameInConfirmation) {
        return false;
      }
    }
  }

  return true;
}

// Helper para validar existência real da data no calendário
export function isValidCalendarDate(day: number, month: number, year: number): boolean {
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

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

// Helper para formatar data de nascimento para exibição (DD/MM/AAAA)
export function formatBirthDateForDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  const extracted = extractBirthDate(dateStr);
  if (extracted) {
    return extracted.formatted;
  }
  return dateStr;
}

// Gera a mensagem de confirmação de dados
export function getConfirmationPrompt(fullName: string, birthDate: string, isCorrection = false): string {
  const formattedDate = formatBirthDateForDisplay(birthDate);

  if (isCorrection) {
    return `Entendido. Corrigi as suas informações.

Nome completo de nascimento: ${fullName}
Data de nascimento: ${formattedDate}

Agora confira novamente os dois dados.

Os dados estão corretos?`;
  }

  return `Perfeito. Antes de prosseguirmos para o pagamento, confira atentamente os dados que você informou:

Nome completo de nascimento: ${fullName}
Data de nascimento: ${formattedDate}

Esses dados serão utilizados para calcular e elaborar o seu Mapa Numerológico Cabalístico.

Confira com atenção antes de confirmar. Se algum dado estiver incorreto, me informe a correção agora.

Depois que o mapa for elaborado, informações incorretas podem comprometer a precisão do resultado.

Os dados estão corretos?`;
}

// Extrator flexível e determinístico de data de nascimento no texto
export function extractBirthDate(text: string): ExtractedBirthDate | null {
  if (!text || typeof text !== 'string') return null;

  // Pattern 1: Mês por extenso / abreviado (ex: "20 de março de 1990", "20 mar 1990", "20 de março de 90")
  const monthNamesRegex = /\b(\d{1,2})\s*(?:de\s*|[\/\.\-\s])?(janeiro|jan|fevereiro|fev|março|marco|mar|abril|abr|maio|mai|junho|jun|julho|jul|agosto|ago|setembro|set|outubro|out|novembro|nov|dezembro|dez)\s*(?:de\s*|[\/\.\-\s])?(\d{2,4})\b/i;
  const monthMatch = text.match(monthNamesRegex);

  if (monthMatch) {
    const day = parseInt(monthMatch[1], 10);
    const monthKey = monthMatch[2].toLowerCase();
    const month = MONTH_NAMES_MAP[monthKey];
    let year = parseInt(monthMatch[3], 10);
    if (year < 100) {
      year = year > 30 ? 1900 + year : 2000 + year;
    }

    if (month) {
      const isValid = isValidCalendarDate(day, month, year);
      const dayPadded = String(day).padStart(2, '0');
      const monthPadded = String(month).padStart(2, '0');
      return {
        day,
        month,
        year,
        formatted: `${dayPadded}/${monthPadded}/${year}`,
        iso: `${year}-${monthPadded}-${dayPadded}`,
        isValid: Boolean(isValid),
        originalMatchedStr: monthMatch[0]
      };
    }
  }

  // Pattern 2: Formato ISO (ex: "1990-03-20" ou "1990/03/20" ou "1990.03.20")
  const isoRegex = /\b(\d{4})[\/\.\-\s]+(\d{1,2})[\/\.\-\s]+(\d{1,2})\b/;
  const isoMatch = text.match(isoRegex);

  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);

    const isValid = isValidCalendarDate(day, month, year);
    const dayPadded = String(day).padStart(2, '0');
    const monthPadded = String(month).padStart(2, '0');
    return {
      day,
      month,
      year,
      formatted: `${dayPadded}/${monthPadded}/${year}`,
      iso: `${year}-${monthPadded}-${dayPadded}`,
      isValid: Boolean(isValid),
      originalMatchedStr: isoMatch[0]
    };
  }

  // Pattern 3: Data numérica com barras, pontos, traços ou ESPAÇOS (ex: "20 03 1990", "20/03/1990", "20-03-1990", "20.03.1990", "20-03-90")
  const numericRegex = /\b(\d{1,2})[\/\.\-\s]+(\d{1,2})[\/\.\-\s]+(\d{2,4})\b/;
  const numMatch = text.match(numericRegex);

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

    if ((p1 <= 31 && p2 <= 12) || (p1 <= 12 && p2 <= 31)) {
      const isValid = isValidCalendarDate(day, month, year);
      const dayPadded = String(day).padStart(2, '0');
      const monthPadded = String(month).padStart(2, '0');
      return {
        day,
        month,
        year,
        formatted: `${dayPadded}/${monthPadded}/${year}`,
        iso: `${year}-${monthPadded}-${dayPadded}`,
        isValid: Boolean(isValid),
        originalMatchedStr: numMatch[0]
      };
    }
  }

  // Pattern 4: Formato compacto de 8 dígitos sem separadores (ex: "20031990")
  const compactRegex = /\b(\d{2})(\d{2})(\d{4})\b/;
  const compactMatch = text.match(compactRegex);

  if (compactMatch) {
    const day = parseInt(compactMatch[1], 10);
    const month = parseInt(compactMatch[2], 10);
    const year = parseInt(compactMatch[3], 10);

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const isValid = isValidCalendarDate(day, month, year);
      const dayPadded = String(day).padStart(2, '0');
      const monthPadded = String(month).padStart(2, '0');
      return {
        day,
        month,
        year,
        formatted: `${dayPadded}/${monthPadded}/${year}`,
        iso: `${year}-${monthPadded}-${dayPadded}`,
        isValid: Boolean(isValid),
        originalMatchedStr: compactMatch[0]
      };
    }
  }

  return null;
}

// Extrator de nome completo no texto com isolamento inteligente de cláusulas
export function extractFullName(text: string, birthDateMatchStr?: string): string | null {
  let cleanText = text;

  // Se houver uma data casada, remover do texto antes da busca
  if (birthDateMatchStr) {
    cleanText = cleanText.replace(birthDateMatchStr, '');
  }

  // Divisores de cláusula / frases que delimitam o nome do restante do texto
  const clauseSeparators = [
    /[,.?!;\n]/g,
    /\bmas\b/i,
    /\be nasci\b/i,
    /\bnasci em\b/i,
    /\bnasci no dia\b/i,
    /\be nascimento\b/i,
    /\bminha data\b/i,
    /\be depois\b/i,
    /\be queria\b/i,
    /\be quero\b/i,
    /\be tambem\b/i,
    /\be também\b/i,
    /\be sobre\b/i,
    /\besse mapa\b/i,
    /\bo mapa\b/i,
    /\bqueria saber\b/i,
    /\bquero saber\b/i,
    /\bisso muda\b/i,
    /\bmuda o\b/i,
    /\bonde faço\b/i,
    /\bonde faco\b/i,
    /\bagora que\b/i,
    /\bantes\b/i,
    /\bdepois\b/i,
    /\bpois\b/i
  ];

  let targetClause = cleanText;

  // Introduções explícitas de nome
  const nameIntroducers = [
    /meu nome [ée]\s+([^\n,.?!;]+)/i,
    /me chamo\s+([^\n,.?!;]+)/i,
    /sou o\s+([^\n,.?!;]+)/i,
    /sou a\s+([^\n,.?!;]+)/i,
    /corrige para\s+([^\n,.?!;]+)/i,
    /corrigir para\s+([^\n,.?!;]+)/i,
    /alterar para\s+([^\n,.?!;]+)/i,
    /mudar para\s+([^\n,.?!;]+)/i,
    /nome [ée]\s+([^\n,.?!;]+)/i,
    /o correto [ée]\s+([^\n,.?!;]+)/i,
    /o certo [ée]\s+([^\n,.?!;]+)/i,
    /correto [ée]\s+([^\n,.?!;]+)/i,
    /certo [ée]\s+([^\n,.?!;]+)/i,
    /nome correto [ée]\s+([^\n,.?!;]+)/i,
    /nome certo [ée]\s+([^\n,.?!;]+)/i,
    /nome completo [ée]\s+([^\n,.?!;]+)/i
  ];

  let hasExplicitIntro = false;
  for (const intro of nameIntroducers) {
    const match = cleanText.match(intro);
    if (match && match[1]) {
      targetClause = match[1];
      hasExplicitIntro = true;
      break;
    }
  }

  // Se nenhuma introdução explícita casou, isola o primeiro segmento de frase
  if (!hasExplicitIntro) {
    const normClean = cleanText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const conversationalMarkers = [
      'queria', 'quero', 'gostaria', 'posso', 'pode', 'como', 'porque', 'por que', 'porq', 'pq',
      'voce', 'você', 'estou', 'tenho', 'alguem', 'alguém', 'humano', 'atendente', 'pessoa',
      'ia', 'robo', 'robô', 'inteligencia', 'inteligência', 'repetidas', 'repetindo', 'repetir',
      'coisas', 'responde', 'falar', 'verdade', 'funciona', 'custa', 'medo', 'perder', 'dinheiro',
      'duvida', 'dúvida', 'ajuda', 'suporte', 'atendimento', 'so', 'só'
    ];

    if (conversationalMarkers.some(m => normClean.includes(m))) {
      return null;
    }

    let firstCut = cleanText;
    for (const sep of clauseSeparators) {
      const idx = firstCut.search(sep);
      if (idx > 0) {
        firstCut = firstCut.substring(0, idx);
      }
    }
    targetClause = firstCut;
  }

  const fillers = [
    /meu nome [ée]/gi,
    /me chamo/gi,
    /sou o/gi,
    /sou a/gi,
    /nasci em/gi,
    /nasci no dia/gi,
    /minha data de nascimento [ée]/gi,
    /data:/gi,
    /nome:/gi,
    /olá/gi,
    /ola/gi,
    /bom dia/gi,
    /boa tarde/gi,
    /boa noite/gi,
    /na verdade/gi,
    /está errado/gi,
    /esta errado/gi,
    /corrigindo/gi,
    /mandei errado/gi,
    /mandei o nome errado/gi,
    /corrige para/gi,
    /corrigir para/gi,
    /é o/gi,
    /é a/gi,
    /\bnão\b/gi,
    /\bnao\b/gi,
    /está tudo certo/gi,
    /esta tudo certo/gi,
    /tudo certo/gi,
    /está correto/gi,
    /esta correto/gi
  ];

  for (const filler of fillers) {
    targetClause = targetClause.replace(filler, '');
  }

  targetClause = targetClause.replace(/[^\w\s\u00C0-\u00FF]/gi, ' ').trim();
  targetClause = targetClause.replace(/\s+/g, ' ');

  const words = targetClause.split(' ').filter(w => w.length > 1);
  const validWords = words.filter(w => !/^\d+$/.test(w) && !NON_NAME_WORDS.has(w.toLowerCase()));

  const prepositions = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  if (validWords.length >= 2) {
    return validWords.map(w => {
      const lower = w.toLowerCase();
      if (prepositions.has(lower)) return lower;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
  } else if (validWords.length === 1 && hasExplicitIntro) {
    if (validWords[0].length >= 3 && !/^\d+$/.test(validWords[0]) && !NON_NAME_WORDS.has(validWords[0].toLowerCase())) {
      return validWords[0].charAt(0).toUpperCase() + validWords[0].slice(1).toLowerCase();
    }
  }

  return null;
}

// Respostas para perguntas frequentes e dúvidas do Kael
const FAQ_ANSWERS: { keywords: string[]; response: string }[] = [
  {
    keywords: ['medo de perder', 'medo de pagar', 'perder meu dinheiro', 'perder dinheiro', 'to com medo', 'estou com medo', 'tenho medo', 'com medo', 'receio de pagar', 'paguei e nao', 'golpe', 'fraude', 'seguro pagar'],
    response: 'Compreendo perfeitamente o seu receio. O valor de R$ 15,00 é processado com total segurança via PIX, e o seu Mapa Numerológico Cabalístico em PDF é elaborado e disponibilizado diretamente aqui nesta conversa logo após a confirmação.'
  },
  {
    keywords: ['confiavel', 'confiável', 'posso confiar', 'e confiavel', 'é confiável', 'e seguro', 'é seguro', 'garantia'],
    response: 'É uma pergunta totalmente legítima. O Mapa Numerológico Cabalístico é uma ferramenta de autoconhecimento e interpretação baseada nos cálculos tradicionais dos números do seu nome e data de nascimento. Ele não possui comprovação científica nem prevê o futuro com garantias exatas, mas oferece reflexões valiosas e clareza sobre suas tendências e potenciais.'
  },
  {
    keywords: ['funciona mesmo', 'funciona de verdade', 'funciona de fato', 'em duvida se funciona', 'em dúvida se funciona', 'sera que funciona', 'será que funciona', 'funciona'],
    response: 'É uma dúvida válida. A Numerologia Cabalística é uma prática de interpretação e autoconhecimento, e não um método científico comprovado. O mapa utiliza cálculos baseados no nome e na data de nascimento e apresenta interpretações dentro dessa tradição.'
  },
  {
    keywords: ['cientifico', 'científico', 'e cientifico', 'é científico', 'metodo cientifico', 'método científico', 'comprovado cientificamente'],
    response: 'A Numerologia Cabalística é uma tradição de interpretação e autoconhecimento, mas não é considerada um método científico comprovado. O mapa deve ser encarado como uma ferramenta de reflexão e auto-observação dentro dessa tradição.'
  },
  {
    keywords: ['pra que serve', 'para que serve', 'pra q serve', 'sirve pra que', 'qual a finalidade', 'finalidade do mapa'],
    response: 'O Mapa Numerológico Cabalístico serve como um guia de autoconhecimento e desenvolvimento pessoal. Ele revela seus talentos naturais, desafios, missão de vida, potenciais de carreira, finanças e dinâmicas nos relacionamentos.'
  },
  {
    keywords: ['dizer como eu sou', 'diz como eu sou', 'saber como eu sou', 'dizer quem eu sou', 'diz quem eu sou', 'minha personalidade', 'dizer algo sobre minha personalidade', 'dizer alguma coisa sobre minha personalidade'],
    response: 'Sim. O Mapa Numerológico Cabalístico analisa as combinações do seu nome e da sua data de nascimento para revelar traços marcantes da sua personalidade, talentos, tendências e comportamento. Ele funciona como uma ferramenta profunda de autoconhecimento.'
  },
  {
    keywords: ['mapa astral', 'astrologia', 'diferenca entre', 'diferença entre', 'diferenca do mapa', 'diferença do mapa'],
    response: 'O Mapa Astral utiliza a posição dos astros e planetas no momento exato do seu nascimento. Já o Mapa Numerológico Cabalístico utiliza o valor numérico das letras do seu nome completo de nascimento e os números da sua data para revelar seus padrões, missão de vida e ciclos.'
  },
  {
    keywords: ['acreditar', 'tem que acreditar', 'precisa acreditar', 'religiao', 'religião', 'religioso', 'crenca', 'crença'],
    response: 'Não é necessário ter nenhuma crença específica ou religião. O mapa é uma ferramenta prática de reflexão e autoconhecimento sobre seus padrões, potenciais e ciclos, podendo ser apreciado por qualquer pessoa.'
  },
  {
    keywords: ['quanto custa', 'preco', 'preço', 'valor', 'investimento', 'quanto e', 'quanto é'],
    response: 'O investimento promocional do mapa é R$ 15,00.'
  },
  {
    keywords: ['quanto tempo', 'demora', 'prazo', 'demora muito'],
    response: 'Depois que o pagamento for confirmado, o mapa é elaborado e o PDF é disponibilizado por aqui.'
  },
  {
    keywords: ['como recebo', 'como eu recebo', 'como vou receber', 'envia por onde', 'onde recebo'],
    response: 'O mapa é preparado em PDF e enviado diretamente por aqui após a confirmação do pagamento.'
  },
  {
    keywords: ['o que vem', 'conteudo', 'conteúdo', 'pagina', 'páginas', 'o que tem', 'que tipo de informacao', 'que tipo de informação'],
    response: 'O seu Mapa Numerológico Cabalístico traz uma análise profunda do seu Número de Destino, Expressão, Alma, Personalidade, Missão de Vida, Ano Pessoal, Triângulo da Vida, Desafios, Ciclos, Anjo da Guarda e Recomendações de Prosperidade.'
  },
  {
    keywords: ['amor', 'relacionamento', 'casal', 'afetivo', 'namorado', 'casamento'],
    response: 'Sim. O mapa inclui uma análise relacionada aos relacionamentos, além de outros aspectos da personalidade, desafios, talentos e ciclos.'
  },
  {
    keywords: ['dinheiro', 'prosperidade', 'trabalho', 'profissão', 'profissao', 'carreira', 'financeiro'],
    response: 'Sim. A numerologia cabalística analisa seu potencial profissional, seus talentos de prosperidade e os melhores caminhos para sua carreira.'
  },
  {
    keywords: ['outra pessoa', 'filho', 'esposa', 'marido', 'amigo', 'presente', 'mae', 'mãe', 'pai', 'posso fazer para'],
    response: 'Sim. Nesse caso, utilizamos o nome completo de nascimento e a data de nascimento da pessoa que será analisada.'
  },
  {
    keywords: ['batismo', 'nome de batismo'],
    response: 'Utilizamos o nome completo de nascimento, exatamente como consta no registro civil. O nome de batismo religioso não é necessário para a elaboração do mapa.'
  },
  {
    keywords: ['cartorio', 'cartório', 'registro civil', 'certidao', 'certidão'],
    response: 'Sim. É o nome completo de nascimento, exatamente como consta no registro civil.'
  },
  {
    keywords: ['casada', 'casado', 'sobrenome de casada'],
    response: 'Para o cálculo do Mapa Numerológico Cabalístico, utilizamos o nome completo de nascimento, exatamente como consta na sua certidão original de nascimento.'
  },
  {
    keywords: ['abreviar', 'sem abreviar', 'abreviacao', 'abreviação'],
    response: 'Precisamos do nome completo de nascimento, exatamente como foi registrado, sem abreviações.'
  },
  {
    keywords: ['de graça', 'gratuto', 'gratuita', 'amostra', 'gratis', 'grátis'],
    response: 'A consulta personalizada faz parte do Mapa Numerológico Cabalístico. O valor promocional de R$ 15,00 cobre a elaboração e emissão completa do documento em PDF.'
  },
  {
    keywords: ['pagar depois', 'depois do mapa', 'faturado'],
    response: 'Para garantir a elaboração personalizada do documento, a geração é iniciada logo após a confirmação do pagamento.'
  },
  {
    keywords: ['nome completo', 'o que e nome completo', 'o que é nome completo', 'significa nome completo'],
    response: 'Nome completo de nascimento é o nome registrado na sua certidão de nascimento original, exatamente como foi registrado pelos seus pais (sem abreviações).'
  },
  {
    keywords: ['confiavel', 'confiável', 'confiar', 'funciona mesmo', 'e seguro', 'é seguro', 'garantia'],
    response: 'O Mapa Numerológico Cabalístico é uma ferramenta de autoconhecimento e interpretação sobre seus padrões, potenciais e ciclos com base na tradição dos números. Não é um método científico nem prevê o futuro com garantias exatas, mas oferece reflexões valiosas e clareza sobre suas tendências.'
  },
  {
    keywords: ['medo', 'receio', 'perder meu dinheiro', 'perder dinheiro', 'preocupado com o pagamento', 'preocupada com o pagamento', 'segurança do pagamento', 'nao receber', 'não receber', 'golpe', 'fraude'],
    response: 'Compreendo perfeitamente o seu receio. O valor promocional de R$ 15,00 é processado com total segurança via PIX, e o seu Mapa Numerológico Cabalístico em PDF é elaborado e disponibilizado diretamente aqui nesta conversa logo após a confirmação do pagamento.'
  }
];

// Busca resposta para pergunta espontânea
export function answerSpontaneousQuestion(userText: string): string | null {
  const normalized = userText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const faq of FAQ_ANSWERS) {
    if (faq.keywords.some(kw => normalized.includes(kw))) {
      return faq.response;
    }
  }

  return null;
}

export interface GreetingDetectionResult {
  hasGreeting: boolean;
  greetingType: 'bom_dia' | 'boa_tarde' | 'boa_noite' | 'tudo_bem' | 'generic' | null;
  greetingPhrase: string | null;
  greetingTextToSpeak: string | null;
  cleanText: string;
}

export function detectAndExtractGreeting(text: string): GreetingDetectionResult {
  const trimmed = text.trim();
  const cleanedLeading = trimmed.replace(/^[\s,.\-!😊:]+/, '');

  const patterns: { regex: RegExp; type: GreetingDetectionResult['greetingType']; textToSpeak: string }[] = [
    { regex: /^(oi|ola|olá|oie)?\s*([,\.-]?\s*)?(boa tarde|boa-tarde)/i, type: 'boa_tarde', textToSpeak: 'Boa tarde! 😊' },
    { regex: /^(oi|ola|olá|oie)?\s*([,\.-]?\s*)?(bom dia|bom-dia)/i, type: 'bom_dia', textToSpeak: 'Bom dia! 😊' },
    { regex: /^(oi|ola|olá|oie)?\s*([,\.-]?\s*)?(boa noite|boa-noite)/i, type: 'boa_noite', textToSpeak: 'Boa noite! 😊' },
    { regex: /^(oi|ola|olá|oie)?\s*([,\.-]?\s*)?(tudo bem|tudo bom|tudo certo)/i, type: 'tudo_bem', textToSpeak: 'Oi! Tudo bem por aqui 😊' },
    { regex: /^(oi|oie|ola|olá|salve|e ai|e aí)\b/i, type: 'generic', textToSpeak: 'Olá! 😊' }
  ];

  for (const item of patterns) {
    const match = cleanedLeading.match(item.regex);
    if (match) {
      const matchedStr = match[0];
      let clean = cleanedLeading.slice(matchedStr.length).trim();
      clean = clean.replace(/^[,\.\!\?\:\;\-–\s]+/, '').trim();

      const hasAlphaNum = /[a-zA-Z0-9]/.test(clean);
      if (!hasAlphaNum) {
        clean = '';
      }

      return {
        hasGreeting: true,
        greetingType: item.type,
        greetingPhrase: matchedStr,
        greetingTextToSpeak: item.textToSpeak,
        cleanText: clean
      };
    }
  }

  return {
    hasGreeting: false,
    greetingType: null,
    greetingPhrase: null,
    greetingTextToSpeak: null,
    cleanText: trimmed
  };
}

export function buildPureGreetingResponse(greetingPrefix: string, session: KaelSession): string {
  if (session.subState === 'CORRIGINDO_NOME') {
    return `${greetingPrefix} Podemos continuar. Por favor, me informe o seu nome completo de nascimento correto.`;
  }
  if (session.subState === 'CORRIGINDO_DATA') {
    return `${greetingPrefix} Podemos continuar. Por favor, me informe a sua data de nascimento correta (DD/MM/AAAA).`;
  }
  if (session.subState === 'AGUARDANDO_QUAL_DADO') {
    return `${greetingPrefix} Podemos continuar. Qual dado você deseja corrigir: o seu nome completo ou a sua data de nascimento?`;
  }

  switch (session.currentState) {
    case 'PRIMEIRO_CONTATO':
    case 'AGUARDANDO_NOME_DATA': {
      if (!session.fullName && !session.birthDate) {
        if (!session.presentationAlreadyMade) {
          return `${greetingPrefix} Seja muito bem-vindo(a)! Para começarmos, me envie seu nome completo de nascimento e a sua data de nascimento (DD/MM/AAAA).`;
        }
        return `${greetingPrefix} Que bom receber você por aqui. Para darmos início, por favor me envie o seu nome completo de nascimento e a sua data de nascimento (DD/MM/AAAA).`;
      } else if (!session.fullName) {
        const formattedDate = formatBirthDateForDisplay(session.birthDate);
        return `${greetingPrefix} Recebi a sua data de nascimento (${formattedDate}). Agora, por favor, me informe o seu nome completo de nascimento (com acentos e sem abreviações).`;
      } else if (!session.birthDate) {
        return `${greetingPrefix} Recebi o seu nome (${session.fullName}). Agora, por favor, me informe a sua data de nascimento no formato DD/MM/AAAA.`;
      }
      return `${greetingPrefix} Para darmos início, por favor me envie o seu nome completo de nascimento e a sua data de nascimento (DD/MM/AAAA).`;
    }

    case 'CONFIRMACAO_DOS_DADOS': {
      const formattedDate = formatBirthDateForDisplay(session.birthDate);
      return `${greetingPrefix} Podemos continuar. Você pode me confirmar se os dados abaixo estão corretos?\n\nNome completo de nascimento: ${session.fullName || ''}\nData de nascimento: ${formattedDate || ''}\n\nOs dados estão corretos?`;
    }

    case 'AGUARDANDO_PAGAMENTO': {
      return `${greetingPrefix} Podemos continuar. Seus dados já foram confirmados! O valor promocional do seu Mapa Numerológico é de R$ 15,00. Posso te orientar sobre o pagamento por PIX (chave: pagamento@mapacabalistico.com.br).`;
    }

    case 'MAPA_EM_PROCESSAMENTO': {
      return `${greetingPrefix} O seu mapa já está sendo elaborado no momento. Em breve o PDF estará disponível diretamente nesta conversa!`;
    }

    case 'POS_VENDA':
    case 'PDF_PRONTO': {
      return `${greetingPrefix} Como posso te ajudar com o seu Mapa Numerológico hoje?`;
    }

    case 'CONVERSA_ENCERRADA': {
      return `${greetingPrefix} Que bom ter você de volta! Se desejar fazer o seu Mapa Numerológico Cabalístico, me avise para darmos início.`;
    }

    default: {
      return `${greetingPrefix} Como posso te ajudar hoje?`;
    }
  }
}

// Servico de Interpretacao Semantica da Mensagem do Cliente (NLU)
export async function interpretClientMessage(
  userText: string,
  currentState: KaelState,
  session: KaelSession,
  aiAnswerFn?: (prompt: string) => Promise<string>
): Promise<ClientInterpretation> {
  const greetingInfo = detectAndExtractGreeting(userText);

  if (greetingInfo.hasGreeting && greetingInfo.cleanText === '') {
    return {
      intent: 'GREETING',
      fullName: null,
      birthDate: null,
      confidence: 0.99,
      greetingTextToSpeak: greetingInfo.greetingTextToSpeak
    };
  }

  const textToAnalyze = greetingInfo.cleanText || userText;
  const result = await _interpretClientMessageCore(textToAnalyze, userText, currentState, session, aiAnswerFn);

  if (greetingInfo.hasGreeting) {
    result.greetingTextToSpeak = greetingInfo.greetingTextToSpeak;
  }

  return result;
}

async function _interpretClientMessageCore(
  userText: string,
  rawUserText: string,
  currentState: KaelState,
  session: KaelSession,
  aiAnswerFn?: (prompt: string) => Promise<string>
): Promise<ClientInterpretation> {
  const normalized = userText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Tentar classificação via IA Gemini (se aiAnswerFn estiver disponível)
  if (aiAnswerFn) {
    try {
      console.log(`\n==================================================`);
      console.log(`[KAEL NLU LOG] 1. MENSAGEM RECEBIDA: "${userText}" | ESTADO: ${currentState}`);

      const historySnippet = (session.messages || [])
        .slice(-6)
        .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
        .join('\n');

      const classificationPrompt = `Você é o interpretador de linguagem natural e inteligência conversacional (NLU) do assistente Kael.

SUA MISSÃO CRÍTICA:
Analisar a MENSAGEM DO CLIENTE considerando o HISTÓRICO, o ESTADO ATUAL e os DADOS JÁ CADASTRADOS para identificar a INTENÇÃO REAL do cliente e determinar se ele está FORNECENDO DADOS, FAZENDO UMA PERGUNTA, EXPRESSANDO PREOCUPAÇÃO/MEDO, SOLICITANDO ATENDIMENTO HUMANO, CHECANDO SE É IA, EXPRESSANDO FRUSTRAÇÃO, SOLICITANDO CORREÇÃO, REINICIANDO OU APENAS CONVERSANDO.

HISTÓRICO RECENTE DA CONVERSA:
${historySnippet}

ESTADO ATUAL DA CONVERSA: ${currentState}
DADOS JÁ CADASTRADOS NA SESSÃO:
- Nome completo: "${session.fullName || 'nenhum'}"
- Data de nascimento: "${session.birthDate || 'nenhuma'}"

MENSAGEM RECEBIDA DO CLIENTE: "${userText}"

==================================================
REGRAS FUNDAMENTAIS DE INTERPRETAÇÃO:
1. NUNCA extraia nome de frases de conversa, pergunta, apoio humano, verificação de IA, frustração, medo, dúvida, objeção ou preço.
   Exemplos que NUNCA SÃO NOME (fullName MUST BE null):
   - "queria falar com alguém de verdade" -> intent: HUMAN_SUPPORT_REQUEST, fullName: null!
   - "você é uma IA?" -> intent: AI_IDENTITY, fullName: null!
   - "PORQUE SÓ RESPONDE COISAS REPETIDAS?" -> intent: USER_FRUSTRATION, fullName: null!
   - "tô com medo de perder meu dinheiro" -> intent: FINANCIAL_CONCERN_OR_OBJECTION, fullName: null!
   - "oi tudo bem?" -> intent: GREETING, fullName: null!
   - "isso funciona?" -> intent: QUESTION, fullName: null!
   - "quanto custa?" -> intent: PAYMENT_QUESTION, fullName: null!

2. EXTRAÇÃO DE NOME: Somente extraia nome se houver evidência clara de que o usuário está informando seu nome real (ex: "meu nome é José Pinheiro Junior", "José Pinheiro Junior", "me chamo Gabriel Braga Silva").

3. EXTRAÇÃO DE DATA: Somente extraia data se houver evidência clara de que o usuário está informando sua data de nascimento (ex: "20/03/1990", "nasci em 20 de março de 1990", "20 03 1990").

4. PROTEÇÃO DE DADOS CONFIRMADOS: Se já existe um nome e data confirmados na sessão, mensagens genéricas (perguntas, objeções, preocupações) JAMAIS podem alterar o nome ou a data. A alteração só deve ocorrer se houver intenção explícita de correção ("meu nome está errado", "o nome correto é...", "quero corrigir").

5. MENSAGENS MISTAS: Se a mensagem contiver fornecimento de dados E também uma pergunta (ex: "Meu nome é Gabriel, nasci em 18/06/1996 e queria saber se o mapa fala sobre profissão"), marque isProvidingName: true, isProvidingBirthDate: true, isQuestion: true, e capture fullName, birthDateFormatted e a orientação de resposta.

6. DÚVIDAS E PREOCUPAÇÕES:
   - Para "você é uma IA?": Responder honestamente que é o Kael, assistente virtual criado para o Mapa Numerológico Cabalístico.
   - Para "PORQUE SÓ RESPONDE COISAS REPETIDAS?": Reconhecer a falha, pedir desculpas pela repetição e responder ao contexto.
   - Para "queria falar com alguém de verdade": Explicar que o atendimento e elaboração são 100% digitais diretamente com o Kael no chat.
   - Para "tô com medo de perder meu dinheiro": Reconhecer o receio, explicar que o PIX de R$ 15,00 é processado com segurança e o PDF é entregue no chat logo após a confirmação.

7. HIERARQUIA DE INTENÇÕES:
   - REQUEST_RESET / REQUEST_RESTART: "resetar", "começar do zero", "apagar tudo", "comece tudo de novo".
   - CORRECTION / REQUEST_CHANGE_DATA: "meu nome está errado", "corrigir a data", "o correto é...".
   - AI_IDENTITY: "você é uma IA?", "estou falando com um robô?", "é humano?".
   - USER_FRUSTRATION: "PORQUE SÓ RESPONDE COISAS REPETIDAS?", "você só repete".
   - HUMAN_SUPPORT_REQUEST: "queria falar com alguém de verdade", "quero um humano", "atendente".
   - FINANCIAL_CONCERN_OR_OBJECTION: "tô com medo de perder dinheiro", "tenho receio".
   - GREETING: "oi", "olá", "oi tudo bem?", "bom dia", "boa tarde".
   - QUESTION / PAYMENT_QUESTION: "isso funciona?", "quanto custa?", "como funciona?".
   - AFFIRMATION / CONFIRMATION: "sim", "está correto", "pode continuar", "confirmo".
   - NAME / BIRTH_DATE / NAME_AND_BIRTH_DATE: Fornecimento direto de dados reais.

Responda EXCLUSIVAMENTE em formato JSON puro com esta estrutura exata:
{
  "intent": "REQUEST_RESET" | "REQUEST_RESTART" | "REQUEST_CHANGE_DATA" | "CORRECTION" | "AI_IDENTITY" | "USER_FRUSTRATION" | "HUMAN_SUPPORT_REQUEST" | "FINANCIAL_CONCERN_OR_OBJECTION" | "COMPLAINT" | "CONFUSION" | "REQUEST_CANCEL" | "NO_PURCHASE" | "GOODBYE" | "PAYMENT_CLAIM" | "AFFIRMATION" | "CONFIRMATION" | "QUESTION" | "PAYMENT_QUESTION" | "CLARIFICATION" | "PURCHASE_INTENT" | "NAME" | "BIRTH_DATE" | "NAME_AND_BIRTH_DATE" | "GREETING" | "OFF_TOPIC" | "UNCLEAR",
  "confidence": 0.95,
  "isProvidingName": boolean,
  "isProvidingBirthDate": boolean,
  "isCorrectingData": boolean,
  "isConfirmation": boolean,
  "isQuestion": boolean,
  "isConcern": boolean,
  "needsHumanSupport": boolean,
  "fullName": string ou null,
  "birthDateFormatted": string ou null,
  "birthDateISO": string ou null,
  "explanation": "motivo curto da decisão",
  "responseGuidance": "orientação ou resposta sugerida para a pergunta/preocupação"
}`;

      const aiResponse = await aiAnswerFn(classificationPrompt);
      console.log(`[KAEL NLU LOG] 3. RESULTADO RAW DO GEMINI:`, aiResponse);

      const cleanJson = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      console.log(`[KAEL NLU LOG] 4. JSON PARSEADO:`, parsed);

      if (parsed && parsed.intent) {
        let extractedDate: ExtractedBirthDate | null = null;

        // Validação determinística de qualquer data extraída pela IA ou presente no texto do usuário
        if (parsed.birthDateFormatted) {
          extractedDate = extractBirthDate(parsed.birthDateFormatted);
        }
        if (!extractedDate && parsed.birthDateISO) {
          extractedDate = extractBirthDate(parsed.birthDateISO);
        }
        if (!extractedDate) {
          extractedDate = extractBirthDate(userText);
        }

        let finalIntent = parsed.intent as MessageIntent;
        // Se a IA marcou INVALID_DATE, UNCLEAR ou OFF_TOPIC mas o extrator encontrou uma data VÁLIDA real, corrige a intenção
        if (extractedDate && extractedDate.isValid && (finalIntent === 'INVALID_DATE' || finalIntent === 'UNCLEAR' || finalIntent === 'OFF_TOPIC')) {
          finalIntent = parsed.fullName ? 'NAME_AND_BIRTH_DATE' : 'BIRTH_DATE';
        }

        let finalFullName = parsed.fullName || null;
        if (!finalFullName) {
          const possibleName = extractFullName(userText, extractedDate?.formatted);
          if (possibleName && isValidCandidateName(possibleName, userText, currentState, session)) {
            finalFullName = possibleName;
          }
        } else {
          if (!isValidCandidateName(finalFullName, userText, currentState, session)) {
            console.log(`[KAEL NLU LOG] Candidate fullName "${finalFullName}" REJECTED by isValidCandidateName validation.`);
            finalFullName = null;
          }
        }

        const isProvidingName = Boolean(parsed.isProvidingName || finalFullName);
        const isProvidingBirthDate = Boolean(parsed.isProvidingBirthDate || (extractedDate && extractedDate.isValid));
        const isCorrectingData = Boolean(parsed.isCorrectingData || finalIntent === 'CORRECTION' || finalIntent === 'REQUEST_CHANGE_DATA');
        const isConfirmation = Boolean(parsed.isConfirmation || finalIntent === 'CONFIRMATION' || finalIntent === 'AFFIRMATION');
        const isQuestion = Boolean(parsed.isQuestion || finalIntent === 'QUESTION' || finalIntent === 'PAYMENT_QUESTION');
        const isConcern = Boolean(parsed.isConcern || finalIntent === 'COMPLAINT' || finalIntent === 'CONFUSION');

        // Se não houver fornecimento explícito de nome/data nem correção, zera campos de dados
        if (!isProvidingName && !isCorrectingData) {
          finalFullName = null;
        }
        if (!isProvidingBirthDate && !isCorrectingData && (!extractedDate || !extractedDate.isValid)) {
          extractedDate = null;
        }

        console.log(`[KAEL NLU LOG] 5. DATA EXTRAÍDA:`, extractedDate);
        console.log(`[KAEL NLU LOG] 6. DATA NORMALIZADA:`, extractedDate ? extractedDate.formatted : null);
        console.log(`[KAEL NLU LOG] 7. isValid:`, extractedDate ? extractedDate.isValid : false);
        console.log(`[KAEL NLU LOG] 8. INTENÇÃO FINAL: ${finalIntent}`);

        return {
          intent: finalIntent,
          fullName: finalFullName,
          birthDate: extractedDate,
          explanation: parsed.explanation || '',
          confidence: parsed.confidence || 0.95,
          isProvidingName,
          isProvidingBirthDate,
          isCorrectingData,
          isConfirmation,
          isQuestion,
          isConcern,
          responseGuidance: parsed.responseGuidance || ''
        };
      }
    } catch (err) {
      console.warn('Interpretador Gemini falhou ou não retornou JSON válido, utilizando heurísticas:', err);
    }
  }

  // 2. Classificação Determinística por Heurísticas (Segurança e Alta Precisão)

  // A. Intenção de RESET / RESTART (Seção 4, 5, 6)
  const resetKeywords = [
    'resetar', 'reset', 'comece tudo de novo', 'comecar tudo de novo', 'começar tudo de novo',
    'vamos comecar do zero', 'vamos começar do zero', 'comecar do zero', 'começar do zero',
    'apaga tudo', 'esquece o que eu falei', 'esquece o que falei', 'quero refazer', 'refazer',
    'volta para o comeco', 'volta para o começo', 'volta pro comeco', 'volta pro começo',
    'voltar para o comeco', 'voltar para o começo', 'voltar pro comeco', 'voltar pro começo',
    'volte para o comeco', 'volte para o começo', 'volte pro comeco', 'volte pro começo',
    'primeiras mensagens', 'comeca novamente desde o inicio', 'começa novamente desde o início',
    'comecar novamente desde o inicio', 'começar novamente desde o início',
    'reinicia', 'reiniciar', 'vamos reiniciar', 'recomendar do zero', 'recomecar', 'recomeçar', 'reinicie',
    'recomeca', 'recomeça'
  ];

  if (resetKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'REQUEST_RESET', fullName: null, birthDate: null, confidence: 0.99 };
  }

  // A2. Permissão para perguntar (ASK_PERMISSION_TO_ASK)
  const askPermissionPhrases = [
    'posso tirar uma duvida', 'posso tirar uma dúvida',
    'posso tirar duvida', 'posso tirar dúvida',
    'posso fazer uma pergunta', 'posso fazer uma duvida', 'posso fazer uma dúvida',
    'posso perguntar uma coisa', 'posso perguntar algo', 'posso perguntar',
    'tenho uma duvida', 'tenho uma dúvida', 'tenho uma pergunta',
    'queria tirar uma duvida', 'queria tirar uma dúvida',
    'queria fazer uma pergunta', 'uma duvida antes', 'uma dúvida antes'
  ];
  if (askPermissionPhrases.some(phrase => normalized.includes(phrase))) {
    return { intent: 'ASK_PERMISSION_TO_ASK', fullName: null, birthDate: null, confidence: 0.99, isQuestion: true };
  }

  // B1. Correção Específica de Nome (CORRECT_NAME / NAME_CORRECTION)
  const nameCorrectionKeywords = [
    'o nome', 'meu nome', 'mudar o nome', 'corrigir o nome', 'mudar meu nome',
    'corrigir meu nome', 'alterar o nome', 'alterar meu nome', 'o nome esta errado', 'o nome está errado',
    'meu nome esta errado', 'meu nome está errado', 'errei o nome', 'errei meu nome',
    'coloquei meu nome errado', 'coloquei o nome errado', 'mandei meu nome errado', 'mandei o nome errado',
    'quero corrigir meu nome', 'quero mudar meu nome', 'preciso corrigir meu nome', 'escrevi meu nome errado',
    'digitei meu nome errado', 'meu nome ta errado', 'meu nome tá errado', 'nome errado'
  ];
  const isExplicitNameCorrection = nameCorrectionKeywords.some(p => normalized === p || normalized.startsWith(p) || normalized.endsWith(p) || normalized.includes(p)) ||
    ((session.subState === 'AGUARDANDO_QUAL_DADO' || currentState === 'CONFIRMACAO_DOS_DADOS') && (normalized === 'o nome' || normalized === 'nome' || normalized === 'meu nome'));

  if (isExplicitNameCorrection) {
    const tempDate = extractBirthDate(userText);
    const tempName = extractFullName(userText, tempDate?.formatted);
    if (tempName && tempName.toLowerCase() !== 'o nome' && tempName.toLowerCase() !== 'meu nome' && tempName.toLowerCase() !== 'nome' && isValidCandidateName(tempName, userText, currentState, session)) {
      return { intent: 'REQUEST_CHANGE_DATA', fullName: tempName, birthDate: tempDate, confidence: 0.98 };
    }
    return { intent: 'CORRECT_NAME', fullName: null, birthDate: null, confidence: 0.99 };
  }

  // B2. Correção Específica de Data (CORRECT_DATE / DATE_CORRECTION)
  const dateCorrectionKeywords = [
    'a data', 'minha data', 'mudar a data', 'corrigir a data', 'mudar minha data',
    'corrigir minha data', 'alterar a data', 'alterar minha data', 'a data esta errada', 'a data está errada',
    'minha data esta errada', 'minha data está errada', 'errei a data', 'errei minha data',
    'coloquei minha data errada', 'coloquei a data errada', 'mandei minha data errada', 'mandei a data errada',
    'quero corrigir minha data', 'quero mudar minha data', 'preciso corrigir minha data', 'escrevi minha data errada',
    'digitei minha data errada', 'minha data ta errada', 'minha data tá errada', 'data errada'
  ];
  const isExplicitDateCorrection = dateCorrectionKeywords.some(p => normalized === p || normalized.startsWith(p) || normalized.endsWith(p) || normalized.includes(p)) ||
    ((session.subState === 'AGUARDANDO_QUAL_DADO' || currentState === 'CONFIRMACAO_DOS_DADOS') && (normalized === 'a data' || normalized === 'data' || normalized === 'minha data'));

  if (isExplicitDateCorrection) {
    const tempDate = extractBirthDate(userText);
    if (tempDate) {
      return { intent: 'REQUEST_CHANGE_DATA', fullName: null, birthDate: tempDate, confidence: 0.98 };
    }
    return { intent: 'CORRECT_DATE', fullName: null, birthDate: null, confidence: 0.99 };
  }

  // B3. Solicitação de Correção / Mudança de Dados Geral (REQUEST_CHANGE_DATA / CORRECTION)
  const correctionPhrases = [
    'mandei o nome errado', 'nome errado', 'data errada', 'mandei a data errada', 'dados errados',
    'mandei errado', 'digitei errado', 'escrevi errado', 'meu nome esta errado', 'meu nome está errado',
    'a data esta errada', 'a data está errada', 'quero corrigir', 'corrigir meu nome', 'corrigir a data',
    'corrigir meus dados', 'mudar meu nome', 'mudar a data', 'mudar dados', 'alterar meu nome',
    'alterar a data', 'alterar dados', 'eu mandei o nome errado', 'preciso corrigir', 'coloquei errado',
    'errei o nome', 'errei a data', 'errei'
  ];

  const isCorrectionPhrase = correctionPhrases.some(kw => normalized.includes(kw)) ||
    (currentState === 'CONFIRMACAO_DOS_DADOS' && (
      normalized.includes('esta errado') || normalized.includes('está errado') ||
      normalized.includes('nao e esse') || normalized.includes('não é esse') ||
      normalized.includes('nao meu nome') || normalized.includes('não, meu nome') ||
      normalized.includes('nao, meu nome') || normalized.includes('meu nome e') ||
      normalized.includes('meu nome é') || normalized.startsWith('nao') || normalized.startsWith('não') ||
      normalized.includes('nao esta correto') || normalized.includes('não está correto') ||
      normalized === 'nao' || normalized === 'não'
    ));

  if (isCorrectionPhrase) {
    const tempDate = extractBirthDate(userText);
    const tempName = extractFullName(userText, tempDate?.formatted);
    return {
      intent: 'REQUEST_CHANGE_DATA',
      fullName: tempName,
      birthDate: tempDate,
      confidence: 0.98
    };
  }

  // C1. Identidade de IA (AI_IDENTITY)
  const aiIdentityKeywords = [
    'voce e uma ia', 'você é uma ia', 'voce e ia', 'você é ia', 'voce e um robo', 'você é um robô',
    'voce e robo', 'você é robô', 'voce e bot', 'você é bot', 'voce e humano', 'você é humano',
    'e uma inteligencia artificial', 'é uma inteligência artificial', 'falando com um robo',
    'falando com um robô', 'falando com uma ia', 'falando com uma pessoa', 'falando com um humano'
  ];
  if (aiIdentityKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'AI_IDENTITY', fullName: null, birthDate: null, confidence: 0.99, isQuestion: true };
  }

  // C2. Frustração do Usuário (USER_FRUSTRATION)
  const frustrationKeywords = [
    'por que so responde', 'por que só responde', 'porque so responde', 'porque só responde',
    'so responde coisas repetidas', 'só responde coisas repetidas', 'coisas repetidas',
    'voce so repete', 'você só repete', 'por que repete', 'porque repete', 'so fala a mesma coisa',
    'só fala a mesma coisa', 'resposta repetida', 'respostas repetidas', 'so responde a mesma'
  ];
  if (frustrationKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'USER_FRUSTRATION', fullName: null, birthDate: null, confidence: 0.99, isConcern: true };
  }

  // C3. Solicitação de Atendimento Humano (HUMAN_SUPPORT_REQUEST)
  const humanSupportKeywords = [
    'falar com alguem de verdade', 'falar com alguém de verdade', 'queria falar com alguem',
    'queria falar com alguém', 'quero falar com um humano', 'quero falar com uma pessoa',
    'queria falar com um humano', 'queria falar com uma pessoa', 'atendente de verdade',
    'pessoa de verdade', 'tem algum atendente', 'atendimento humano', 'alguem de verdade', 'alguém de verdade'
  ];
  if (humanSupportKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'HUMAN_SUPPORT_REQUEST', fullName: null, birthDate: null, confidence: 0.99, needsHumanSupport: true };
  }

  // C4. Objeção ou Medo Financeiro (FINANCIAL_CONCERN_OR_OBJECTION)
  const financialConcernKeywords = [
    'medo de perder meu dinheiro', 'medo de perder dinheiro', 'com medo de perder',
    'medo de pagar', 'receio de pagar', 'golpe', 'fraude', 'perder meu dinheiro', 'perder dinheiro'
  ];
  if (financialConcernKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'FINANCIAL_CONCERN_OR_OBJECTION', fullName: null, birthDate: null, confidence: 0.99, isConcern: true };
  }

  // C. Reclamação / Frustração do Cliente (COMPLAINT / CONFUSION)
  const complaintKeywords = [
    'voce nao entende', 'você não entende', 'voce nao ta entendendo', 'você não tá entendendo',
    'ta repetindo', 'tá repetindo', 'voce e burro', 'você é burro', 'voce esta burro', 'você está burro',
    'nao foi isso que eu falei', 'não foi isso que eu falei', 'nao foi isso que eu disse', 'não foi isso que eu disse',
    'que confusao', 'que confusão', 'nao esta entendendo', 'não está entendendo'
  ];
  if (complaintKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'COMPLAINT', fullName: null, birthDate: null, confidence: 0.98 };
  }

  // D. Negação / Cancelamento / Não Quero Comprar Agora (NO_PURCHASE / REQUEST_CANCEL / NEGATION / GOODBYE)
  const noPurchaseKeywords = ['nao quero comprar', 'não quero comprar', 'nao quero mais', 'não quero mais', 'nao vou fazer', 'não vou fazer', 'deixa para la', 'deixa pra lá', 'nao tenho interesse', 'não tenho interesse'];
  if (noPurchaseKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'NO_PURCHASE', fullName: null, birthDate: null, confidence: 0.99 };
  }

  const cancelKeywords = ['cancelar', 'desisto', 'apagar'];
  if (cancelKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'REQUEST_CANCEL', fullName: null, birthDate: null, confidence: 0.99 };
  }

  const goodbyeKeywords = ['tchau', 'adeus', 'ate logo', 'até logo', 'tenha um bom dia'];
  if (goodbyeKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'GOODBYE', fullName: null, birthDate: null, confidence: 0.98 };
  }

  // E. Intenção de Compra (PURCHASE_INTENT)
  const purchaseKeywords = ['quero fazer', 'quero comprar', 'como faco pra pedir', 'como faço pra pedir', 'como faco pra ter', 'como faço pra ter', 'quero meu mapa', 'quero o mapa', 'vamos fazer'];
  if (purchaseKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'PURCHASE_INTENT', fullName: null, birthDate: null, confidence: 0.98 };
  }

  // F. Perguntas sobre Preço (PAYMENT_QUESTION)
  const priceKeywords = ['quanto custa', 'qual o valor', 'preco', 'preço', 'quanto e', 'quanto é', 'investimento', 'quanto custa o mapa'];
  if (priceKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'PAYMENT_QUESTION', fullName: null, birthDate: null, confidence: 0.98 };
  }

  // G. Esclarecimentos e Acentos (CLARIFICATION)
  const accentKeywords = ['acento', 'acentos', 'sem acento', 'nao tem acento', 'nao possui acento', 'sem acentos', 'o que e nome completo', 'o que é nome completo', 'eh o nome de batismo', 'é o nome de batismo'];
  if (accentKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'CLARIFICATION', fullName: null, birthDate: null, confidence: 0.99 };
  }

  // Respostas Ambíguas em CONFIRMACAO_DOS_DADOS (ex: "é...", "pode ser", "acho que sim", "talvez")
  const ambiguousPhrases = [
    'pode ser', 'é...', 'e...', 'acho que sim', 'talvez', 'deve estar',
    'creio que sim', 'deve ser', 'acho que é', 'parece que sim', 'supostamente', 'quem sabe'
  ];
  if (currentState === 'CONFIRMACAO_DOS_DADOS' && ambiguousPhrases.some(ap => normalized.includes(ap))) {
    return { intent: 'CLARIFICATION', fullName: null, birthDate: null, confidence: 0.95 };
  }

  // J. Afirmação / Confirmação Positiva (AFFIRMATION / CONFIRMATION)
  const affirmationKeywords = [
    'esta correto', 'está correto', 'estao corretos', 'estão corretos',
    'esta certo', 'está certo', 'estao certos', 'estão certos',
    'pode continuar', 'pode prosseguir', 'pode seguir', 'pode fazer', 'pode gerar',
    'confirmo', 'confirmado', 'confirmados', 'confirmei',
    'tudo certo', 'esta tudo certo', 'está tudo certo', 'tudo correto',
    'perfeito', 'com certeza', 'exato', 'exatamente',
    'sim esta correto', 'sim, esta correto', 'sim, está correto',
    'sim, tudo certo', 'sim, esta tudo certo', 'sim, está tudo certo',
    'dados corretos', 'dados certos', 'ta certo', 'tá certo',
    'estao sim', 'estão sim', 'esta sim', 'está sim',
    'certinho', 'tudo certinho', 'e isso mesmo', 'é isso mesmo', 'isso mesmo',
    'sim, conferi e esta tudo correto', 'sim, os dois dados estao certos',
    'pode continuar, esta tudo certo', 'confirmei e pode prosseguir',
    'sim, pode fazer meu mapa', 'esta tudo correto, pode continuar',
    'pode fazer meu mapa', 'pode fazer o mapa', 'pode mandar', 'pode enviar',
    'pode prosseguir com o mapa'
  ];
  const exactAffirmations = [
    'sim', 'ok', 'correto', 'corretos', 'certo', 'certos', 'confirmo', 'confirmei',
    'certinho', 'estao sim', 'estão sim', 'esta sim', 'está sim', 'tudo certo', 'e isso mesmo', 'isso mesmo'
  ];

  const isAffirmation = affirmationKeywords.some(kw => normalized.includes(kw)) ||
    exactAffirmations.includes(normalized) ||
    (currentState === 'CONFIRMACAO_DOS_DADOS' && (
      normalized.startsWith('sim') ||
      normalized.startsWith('confirmo') ||
      normalized.startsWith('confirmei') ||
      normalized.startsWith('pode') ||
      normalized.startsWith('tudo') ||
      normalized.includes('estao sim') ||
      normalized.includes('estão sim') ||
      normalized.includes('esta sim') ||
      normalized.includes('está sim') ||
      normalized.includes('correto') ||
      normalized.includes('corretos') ||
      normalized.includes('certo') ||
      normalized.includes('certos') ||
      normalized.includes('isso mesmo') ||
      normalized.includes('certinho') ||
      normalized.includes('pode prosseguir') ||
      normalized.includes('pode continuar') ||
      normalized.includes('pode fazer') ||
      normalized.includes('prosseguir') ||
      normalized.includes('confirmei')
    ));

  if (isAffirmation && !isCorrectionPhrase) {
    if (currentState === 'CONFIRMACAO_DOS_DADOS') {
      return { intent: 'AFFIRMATION', fullName: null, birthDate: null, confidence: 0.98 };
    }

    const tempDate = extractBirthDate(userText);
    const tempName = extractFullName(userText, tempDate?.formatted);

    if (!tempDate && (!tempName || tempName.toLowerCase() === session.fullName?.toLowerCase())) {
      return { intent: 'AFFIRMATION', fullName: null, birthDate: null, confidence: 0.98 };
    }
  }

  // H. Dúvidas Gerais ou Perguntas (QUESTION)
  const questionIndicators = [
    '?', 'o que', 'como', 'qual', 'quanto', 'porque', 'por que', 'onde', 'quando',
    'fala de', 'fala sobre', 'preciso', 'onde manda', 'posso fazer', 'para minha mae',
    'pra minha mae', 'outra pessoa', 'duvida', 'dúvida', 'funciona', 'cientifico',
    'científico', 'serve', 'acreditar', 'astral', 'dizer como', 'diz como', 'dizer quem',
    'diz quem', 'revela', 'certeza', 'confiável', 'confiavel', 'saber se'
  ];
  const isQuestion = questionIndicators.some(qi => normalized.includes(qi)) || answerSpontaneousQuestion(userText) !== null;

  if (isQuestion) {
    return { intent: 'QUESTION', fullName: null, birthDate: null, confidence: 0.95 };
  }

  // I. Afirmação de pagamento (PAYMENT_CLAIM)
  const paymentClaimKeywords = ['paguei', 'ja paguei', 'já paguei', 'comprovante', 'fiz o pix', 'mandei o pix', 'ta pago', 'tá pago', 'pago'];
  if (paymentClaimKeywords.some(kw => normalized.includes(kw))) {
    return { intent: 'PAYMENT_CLAIM', fullName: null, birthDate: null, confidence: 0.99 };
  }

  // K. Cumprimento isolado (GREETING)
  const greetings = ['ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'oi', 'oie'];
  if (greetings.includes(normalized)) {
    return { intent: 'GREETING', fullName: null, birthDate: null, confidence: 0.95 };
  }

  // L. Extração de Dados (Data de Nascimento e Nome Completo)
  const extractedDate = extractBirthDate(userText);

  if (extractedDate && !extractedDate.isValid) {
    return { intent: 'INVALID_DATE', fullName: null, birthDate: extractedDate, confidence: 0.99 };
  }

  let extractedName = extractFullName(userText, extractedDate?.originalMatchedStr || extractedDate?.formatted);

  if (extractedName) {
    if (!isValidCandidateName(extractedName, userText, currentState, session)) {
      extractedName = null;
    }
  }

  if (extractedName && extractedDate) {
    return { intent: 'NAME_AND_BIRTH_DATE', fullName: extractedName, birthDate: extractedDate, confidence: 0.98 };
  }
  if (extractedName && !extractedDate) {
    return { intent: 'NAME', fullName: extractedName, birthDate: null, confidence: 0.95 };
  }
  if (!extractedName && extractedDate) {
    return { intent: 'BIRTH_DATE', fullName: null, birthDate: extractedDate, confidence: 0.95 };
  }

  return { intent: 'UNCLEAR', fullName: null, birthDate: null, confidence: 0.5 };
}

// Retorna lembrete do estado atual para reancorar a conversa
export function getStateAnchorPrompt(state: KaelState, session: KaelSession): string {
  // Se o mapa já foi entregue, pós-venda, pergunta pendente ou em sub-estado de correção, não anexar lembretes automáticos
  if (session.mapDelivered || state === 'POS_VENDA' || state === 'PDF_PRONTO' || session.pendingUserQuestion || session.subState) {
    return '';
  }

  switch (state) {
    case 'AGUARDANDO_NOME_DATA':
      if (!session.fullName && !session.birthDate) {
        return '\n\nPara darmos início, por favor me envie o seu nome completo de nascimento e data de nascimento (DD/MM/AAAA).';
      } else if (!session.fullName) {
        return '\n\nPor favor, me informe o seu nome completo de nascimento para prosseguirmos.';
      } else if (!session.birthDate) {
        return '\n\nPor favor, me informe a sua data de nascimento (DD/MM/AAAA) para prosseguirmos.';
      }
      return '';
    case 'CONFIRMACAO_DOS_DADOS':
      return `\n\nPor favor, confira os dados abaixo:\n\nNome completo de nascimento: ${session.fullName || ''}\nData de nascimento: ${formatBirthDateForDisplay(session.birthDate)}\n\nOs dados estão corretos?`;
    case 'AGUARDANDO_PAGAMENTO':
      return '\n\nPara liberarmos a elaboração do seu mapa personalizado, basta realizar o PIX de R$ 15,00 pela chave informada acima.';
    case 'MAPA_EM_PROCESSAMENTO':
      return '\n\nO seu mapa já está sendo elaborado no momento. Em breve o PDF estará disponível aqui!';
    case 'CONVERSA_ENCERRADA':
      return '\n\nSe desejar retomar e fazer o seu Mapa Numerológico, basta avisar!';
    default:
      return '';
  }
}

// Analisador de Mensagens Longas e Múltiplas Intenções
export interface MultiIntentAnalysis {
  hasReset: boolean;
  hasCorrection: boolean;
  hasContradiction: boolean;
  hasImpactQuestion: boolean;
  hasUnspecifiedNumber: boolean;
  hasGeneralNumbersQuestion: boolean;
  hasNumber7Question: boolean;
  hasRepetitionQuestion: boolean;
  hasMissionVsProfession: boolean;
  hasProfessionQuestion: boolean;
  hasFinancesQuestion: boolean;
  hasRelationshipsQuestion: boolean;
  hasPriceQuestion: boolean;
  hasDeliveryQuestion: boolean;
  hasDesabafo: boolean;
  extractedName: string | null;
  extractedDate: { formatted: string; iso: string } | null;
  topicCount: number;
}

export function analyzeMultiIntentMessage(
  userText: string,
  session: KaelSession
): MultiIntentAnalysis {
  const normalized = userText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const extractedDate = extractBirthDate(userText);
  let extractedName = extractFullName(userText, extractedDate?.formatted);
  if (extractedName) {
    if (!isValidCandidateName(extractedName, userText, session.currentState, session)) {
      extractedName = null;
    }
  }

  // Resets
  const resetKeywords = [
    'resetar', 'reset', 'comece tudo de novo', 'comecar tudo de novo', 'começar tudo de novo',
    'vamos comecar do zero', 'vamos começar do zero', 'comecar do zero', 'começar do zero',
    'apaga tudo', 'esquece o que eu falei', 'esquece o que falei', 'quero refazer', 'refazer',
    'volta para o comeco', 'volta para o começo', 'volta pro comeco', 'volta pro começo',
    'voltar para o comeco', 'voltar para o começo', 'voltar pro comeco', 'voltar pro começo',
    'volte para o comeco', 'volte para o começo', 'volte pro comeco', 'volte pro começo',
    'primeiras mensagens', 'comeca novamente desde o inicio', 'começa novamente desde o início',
    'reinicia', 'reiniciar', 'recomecar', 'recomeçar'
  ];
  const hasReset = resetKeywords.some(kw => normalized.includes(kw));

  // Correções
  const correctionPhrases = [
    'mandei o nome errado', 'nome errado', 'data errada', 'mandei a data errada', 'dados errados',
    'mandei errado', 'digitei errado', 'escrevi errado', 'meu nome esta errado', 'meu nome está errado',
    'a data esta errada', 'a data está errada', 'quero corrigir', 'corrigir meu nome', 'corrigir a data',
    'corrigir meus dados', 'mudar meu nome', 'mudar a data', 'mudar dados', 'alterar meu nome',
    'alterar a data', 'alterar dados', 'na verdade meu nome', 'eu tinha digitado', 'tinha colocado antes',
    'estava errado'
  ];
  const hasCorrection = correctionPhrases.some(kw => normalized.includes(kw));

  // Contradição de nome ("Meu nome é João, mas acho que coloquei Pedro antes")
  const hasContradiction = (normalized.includes('acho que coloquei') || normalized.includes('tinha digitado') || normalized.includes('antes')) &&
    (normalized.includes('mas meu nome') || normalized.includes('meu nome e') || normalized.includes('meu nome e joao') || normalized.includes('meu nome e pedro'));

  // Pergunta sobre impacto da correção ("muda o resultado", "muda o mapa")
  const hasImpactQuestion = normalized.includes('muda o resultado') || normalized.includes('muda o mapa') || normalized.includes('altera o resultado') || normalized.includes('muda alguma coisa') || normalized.includes('muda o calculo') || normalized.includes('muda algo');

  // Tópicos / Perguntas
  const hasGeneralNumbersQuestion = normalized.includes('esses numeros') || normalized.includes('os numeros') || normalized.includes('quais sao os numeros') || normalized.includes('o que significam esses') || normalized.includes('o que cada um representa') || normalized.includes('varios numeros') || normalized.includes('que sao esses numeros');

  const hasNumber7Question = normalized.includes('numero 7') || normalized.includes('numero sete') || normalized.includes('o 7') || normalized.endsWith('7') || normalized.includes('7 que aparece') || normalized.includes('7 aparece');

  const hasRepetitionQuestion = normalized.includes('aparece varias vezes') || normalized.includes('aparece mais de uma vez') || normalized.includes('aparece muito') || normalized.includes('repete') || normalized.includes('repetido') || normalized.includes('varias vezes');

  const hasMissionVsProfession = (normalized.includes('missao') || normalized.includes('missão')) && (normalized.includes('profissao') || normalized.includes('profissão') || normalized.includes('trabalho') || normalized.includes('carreira')) && (normalized.includes('diferenca') || normalized.includes('diferença') || normalized.includes('qual delas') || normalized.includes('mais importante') || normalized.includes('uma parte falando de missao') || normalized.includes('falandode missao'));

  const hasProfessionQuestion = (normalized.includes('profissao') || normalized.includes('profissão') || normalized.includes('trabalho') || normalized.includes('carreira') || normalized.includes('emprego') || normalized.includes('profissional')) && !hasMissionVsProfession;

  const hasFinancesQuestion = normalized.includes('dinheiro') || normalized.includes('prosperidade') || normalized.includes('financeiro') || normalized.includes('financas') || normalized.includes('finanças');

  const hasRelationshipsQuestion = normalized.includes('relacionamento') || normalized.includes('relacionamentos') || normalized.includes('amor') || normalized.includes('casamento') || normalized.includes('afetivo') || normalized.includes('parceiro');

  const hasPriceQuestion = normalized.includes('quanto custa') || normalized.includes('qual o valor') || normalized.includes('preco') || normalized.includes('preço') || normalized.includes('investimento');

  const hasDeliveryQuestion = normalized.includes('quanto tempo demora') || normalized.includes('como eu recebo') || normalized.includes('como recebo');

  const hasDesabafo = normalized.includes('dificuldade no trabalho') || normalized.includes('mudei de area') || normalized.includes('fiquei com algumas duvidas') || normalized.includes('mudei de emprego') || normalized.includes('sempre tive') || (userText.length > 120 && (normalized.includes('gostei') || normalized.includes('dificuldade') || normalized.includes('curioso')));

  const hasUnspecifiedNumber = (normalized.includes('esse numero') || normalized.includes('aquele numero') || normalized.includes('tem um numero')) && !hasNumber7Question && !normalized.match(/numero \d+/) && !normalized.match(/número \d+/);

  let topicCount = 0;
  if (hasGeneralNumbersQuestion) topicCount++;
  if (hasNumber7Question) topicCount++;
  if (hasRepetitionQuestion) topicCount++;
  if (hasMissionVsProfession) topicCount++;
  if (hasProfessionQuestion) topicCount++;
  if (hasFinancesQuestion) topicCount++;
  if (hasRelationshipsQuestion) topicCount++;
  if (hasPriceQuestion) topicCount++;
  if (hasDeliveryQuestion) topicCount++;

  return {
    hasReset,
    hasCorrection,
    hasContradiction,
    hasImpactQuestion,
    hasUnspecifiedNumber,
    hasGeneralNumbersQuestion,
    hasNumber7Question,
    hasRepetitionQuestion,
    hasMissionVsProfession,
    hasProfessionQuestion,
    hasFinancesQuestion,
    hasRelationshipsQuestion,
    hasPriceQuestion,
    hasDeliveryQuestion,
    hasDesabafo,
    extractedName,
    extractedDate,
    topicCount
  };
}

// Cria uma nova sessão do Kael
export function createKaelSession(sessionId: string): KaelSession {
  const now = new Date().toISOString();
  const session: KaelSession = {
    sessionId,
    currentState: 'PRIMEIRO_CONTATO',
    messages: [],
    paymentStatus: 'pendente',
    messageCount: 0,
    offTopicCount: 0,
    lastInteractionAt: now,
    sessionStartedAt: now,
    presentationAlreadyMade: true,
    mapDelivered: false,
    conversationMode: 'PURCHASE_FLOW',
    priceAlreadyPresented: false,
    pixAlreadyPresented: false
  };

  const msg1: KaelMessage = {
    id: `kael-${Date.now()}-1`,
    sender: 'kael',
    text: KAEL_MESSAGES.MSG_1,
    timestamp: now
  };
  const msg2: KaelMessage = {
    id: `kael-${Date.now()}-2`,
    sender: 'kael',
    text: KAEL_MESSAGES.MSG_2,
    timestamp: now
  };
  const msg3: KaelMessage = {
    id: `kael-${Date.now()}-3`,
    sender: 'kael',
    text: KAEL_MESSAGES.MSG_3,
    timestamp: now
  };

  session.messages.push(msg1, msg2, msg3);
  session.currentState = 'AGUARDANDO_NOME_DATA';
  return session;
}

// Helper de log estruturado do fluxo (Steps 9 a 12)
function logFlowDecisionAndReturn(
  initialState: KaelState,
  decision: string,
  session: KaelSession,
  newMessages: KaelMessage[],
  greetingTextToSpeak?: string | null
): { updatedSession: KaelSession; newMessages: KaelMessage[] } {
  if (greetingTextToSpeak && newMessages.length > 0) {
    const firstMsg = newMessages[0];
    const lowerText = firstMsg.text.trim().toLowerCase();
    if (
      !lowerText.startsWith('boa tarde') &&
      !lowerText.startsWith('bom dia') &&
      !lowerText.startsWith('boa noite') &&
      !lowerText.startsWith('olá') &&
      !lowerText.startsWith('ola') &&
      !lowerText.startsWith('oi!') &&
      !lowerText.startsWith('oi,')
    ) {
      firstMsg.text = `${greetingTextToSpeak} ${firstMsg.text.trim()}`;
    }
  }

  const replyText = newMessages.map(m => m.text).join('\n\n');
  console.log(`[KAEL FLOW LOG] 9. ESTADO ANTES: ${initialState}`);
  console.log(`[KAEL FLOW LOG] 10. DECISÃO DO FLUXO: ${decision}`);
  console.log(`[KAEL FLOW LOG] 11. RESPOSTA ENVIADA:\n"${replyText}"`);
  console.log(`[KAEL FLOW LOG] 12. ESTADO DEPOIS: ${session.currentState}`);
  console.log(`==================================================\n`);
  return { updatedSession: session, newMessages };
}

// Processador principal de mensagens recebidas pelo Kael com Inteligência NLU
export async function handleKaelUserMessage(
  session: KaelSession,
  userText: string,
  aiAnswerFn?: (prompt: string) => Promise<string>
): Promise<{ updatedSession: KaelSession; newMessages: KaelMessage[] }> {
  const initialState = session.currentState;
  const now = new Date().toISOString();
  const trimmed = userText.trim();
  const normalized = trimmed.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const newMessages: KaelMessage[] = [];

  // Registra mensagem do usuário
  const userMsg: KaelMessage = {
    id: `user-${Date.now()}`,
    sender: 'user',
    text: trimmed,
    timestamp: now
  };
  session.messages.push(userMsg);
  session.messageCount += 1;
  session.lastInteractionAt = now;

  // Atualiza estado de entrega do mapa
  const isMapDelivered = Boolean(session.mapDelivered || session.currentState === 'POS_VENDA' || session.currentState === 'PDF_PRONTO');
  if (isMapDelivered) {
    session.mapDelivered = true;
    session.conversationMode = 'SUPORTE_MAPA';
  }

  // Análise de Múltiplas Intenções e Tópicos na Mensagem
  const multi = analyzeMultiIntentMessage(trimmed, session);

  // 1. Interpretação Semântica da Mensagem (NLU)
  const interpretation = await interpretClientMessage(trimmed, session.currentState, session, aiAnswerFn);
  session.lastIntent = interpretation.intent;

  // HIERARQUIA DE DECISÃO

  // 1. SOLICITAÇÃO DE RESET / RESTART (SEÇÕES 4, 5, 6, 19, 20)
  if (interpretation.intent === 'REQUEST_RESET' || interpretation.intent === 'REQUEST_RESTART' || multi.hasReset) {
    // A. Limpar dados temporários da sessão
    session.fullName = undefined;
    session.birthDate = undefined;
    session.paymentStatus = 'pendente';
    session.orderId = undefined;
    session.mapId = undefined;
    session.pdfPath = undefined;
    session.pdfUrl = undefined;
    session.offTopicCount = 0;
    session.messageCount = 0;
    session.currentState = 'PRIMEIRO_CONTATO';
    session.mapDelivered = false;
    session.presentationAlreadyMade = true;
    session.conversationMode = 'PURCHASE_FLOW';
    session.priceAlreadyPresented = false;
    session.pixAlreadyPresented = false;

    // B. Confirmação breve
    const resetConfirmMsg: KaelMessage = {
      id: `kael-${Date.now()}-reset`,
      sender: 'kael',
      text: 'Claro. Vamos começar novamente do início.',
      timestamp: now
    };
    session.messages.push(resetConfirmMsg);
    newMessages.push(resetConfirmMsg);

    // C. Reiniciar roteiro oficial
    const msg1: KaelMessage = {
      id: `kael-${Date.now()}-1`,
      sender: 'kael',
      text: KAEL_MESSAGES.MSG_1,
      timestamp: now
    };
    const msg2: KaelMessage = {
      id: `kael-${Date.now()}-2`,
      sender: 'kael',
      text: KAEL_MESSAGES.MSG_2,
      timestamp: now
    };
    const msg3: KaelMessage = {
      id: `kael-${Date.now()}-3`,
      sender: 'kael',
      text: KAEL_MESSAGES.MSG_3,
      timestamp: now
    };

    session.messages.push(msg1, msg2, msg3);
    newMessages.push(msg1, msg2, msg3);

    session.currentState = 'AGUARDANDO_NOME_DATA';
    return logFlowDecisionAndReturn(initialState, 'REQUEST_RESET / RESTART', session, newMessages);
  }

  // 1.4 DATA INVÁLIDA NO CALENDÁRIO
  const isInvalidDate = interpretation.intent === 'INVALID_DATE' || (interpretation.birthDate && !interpretation.birthDate.isValid);
  console.log(`[KAEL FLOW LOG] 7. IF INVALID_DATE verificado: ${isInvalidDate} | intent: ${interpretation.intent} | birthDate:`, interpretation.birthDate);

  if (isInvalidDate) {
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-invalid-date`,
      sender: 'kael',
      text: 'Essa data de nascimento parece estar inválida no calendário. Pode conferir sua data de nascimento e me enviar novamente?',
      timestamp: now
    };
    console.log(`[KAEL FLOW LOG] 8. RESPOSTA ENVIADA:`, replyMsg.text);
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return { updatedSession: session, newMessages };
  }

  // 1.5 MODO DE SUPORTE PÓS-ENTREGA DO MAPA (SUPORTE_MAPA)
  if (isMapDelivered) {
    session.conversationMode = 'SUPORTE_MAPA';

    // Pergunta isolada sobre preço após entrega
    if (multi.hasPriceQuestion && multi.topicCount === 1) {
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-price-delivered`,
        sender: 'kael',
        text: 'Como o seu mapa já foi entregue, você já possui acesso completo a ele! Caso deseje encomendar um novo mapa para outra pessoa, o valor promocional é R$ 15,00.',
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return { updatedSession: session, newMessages };
    }

    // Pergunta sobre número não especificado ("esse número aparece muito")
    if (multi.hasUnspecifiedNumber) {
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-unspec-num`,
        sender: 'kael',
        text: 'Entendi. Qual número aparece várias vezes no seu mapa? Se você me disser qual é o número, consigo te explicar exatamente o significado dele.',
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return { updatedSession: session, newMessages };
    }

    // Pergunta isolada e curta sobre o número 7
    if (multi.hasNumber7Question && multi.topicCount === 1 && !multi.hasMissionVsProfession && !multi.hasGeneralNumbersQuestion) {
      session.lastTopic = 'NUMERO_7';
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-num7-direct`,
        sender: 'kael',
        text: 'Na Numerologia Cabalística, o número 7 representa a sabedoria interior, a busca pela verdade, a introspecção, a intuição e o desenvolvimento espiritual e analítico. Se ele aparece no seu mapa, indica uma mente analítica e profunda reflexão.',
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return { updatedSession: session, newMessages };
    }

    // Múltiplas perguntas / Dúvidas estruturadas / Desabafo no Suporte do Mapa
    if (multi.topicCount >= 2 || multi.hasMissionVsProfession || (multi.hasGeneralNumbersQuestion && multi.hasNumber7Question) || multi.hasDesabafo) {
      const parts: string[] = [];

      if (multi.hasGeneralNumbersQuestion) {
        parts.push('• **Os números do mapa**: Eles são resultados dos cálculos feitos a partir do seu nome e da sua data de nascimento. Dentro da Numerologia Cabalística, cada número representa um aspecto da sua personalidade, talentos, missão ou ciclos.');
      }

      if (multi.hasNumber7Question || multi.hasRepetitionQuestion) {
        parts.push('• **O número 7 e a repetição**: Ter o número 7 aparecendo mais de uma vez não significa simplesmente que seja algo positivo ou negativo. O 7 representa a sabedoria interior, a intuição, a introspecção e a mente analítica. A interpretação depende da posição em que ele aparece e do conjunto do mapa.');
      }

      if (multi.hasMissionVsProfession) {
        parts.push('• **Missão de Vida vs. Profissão**: A Missão de Vida está relacionada ao seu propósito evolutivo e caminho de aprendizados nesta existência. Já a análise Profissional observa seus talentos práticos, aptidões e potenciais para a carreira. Ambas têm funções diferentes e se complementam.');
      }

      if (multi.hasProfessionQuestion) {
        parts.push('• **Vida Profissional**: O mapa analisa seus talentos para o trabalho, tendências de carreira e melhores caminhos de realização profissional.');
      }

      if (multi.hasFinancesQuestion) {
        parts.push('• **Prosperidade e Finanças**: O mapa aborda suas energias financeiras, relação com o dinheiro e orientações para prosperidade.');
      }

      if (multi.hasRelationshipsQuestion) {
        parts.push('• **Relacionamentos**: O mapa analisa a área afetiva, como você se relaciona e suas dinâmicas de parceria.');
      }

      let text = '';
      if (parts.length > 0) {
        text = 'Claro! Vamos por partes para esclarecer cada ponto:\n\n' + parts.join('\n\n') + '\n\nSe você quiser, me diga em quais posições o número aparece ou envie o trecho do seu mapa que ficou confuso que explicamos com mais detalhes!';
      } else if (multi.hasDesabafo) {
        text = 'Entendi a sua situação. Na Numerologia Cabalística, os números e desafios analisados no mapa refletem justamente suas inclinações, talentos e possíveis bloqueios ou ciclos na vida profissional.\n\nSe você me disser qual é o número que apareceu repetido no seu mapa ou em qual seção ele está, consigo te explicar exatamente como ele se relaciona com a sua trajetória.';
      }

      if (text) {
        const replyMsg: KaelMessage = {
          id: `kael-${Date.now()}-multi-support`,
          sender: 'kael',
          text,
          timestamp: now
        };
        session.messages.push(replyMsg);
        newMessages.push(replyMsg);
        return { updatedSession: session, newMessages };
      }
    }

    // Pergunta de contexto "e esse outro aqui?" ou "não entendi essa parte"
    if (normalized.includes('esse outro') || normalized.includes('essa parte') || normalized.includes('e o outro')) {
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-context-other`,
        sender: 'kael',
        text: 'Claro! Me informe qual é o outro número, título da seção ou trecho do seu mapa para eu te explicar exatamente o significado dele.',
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return { updatedSession: session, newMessages };
    }

    // Outra dúvida genérica em modo de suporte
    let supportAnswer = answerSpontaneousQuestion(trimmed);
    if (!supportAnswer) {
      supportAnswer = 'Claro! Pode me enviar o trecho ou o número do seu mapa que ficou confuso que eu explico para você com todo o prazer.';
    }
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-support-ans`,
      sender: 'kael',
      text: supportAnswer,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return { updatedSession: session, newMessages };
  }

  // 1.8 CONTRADIÇÃO DE DADOS (ex: "Meu nome é João, mas acho que coloquei Pedro antes")
  if (multi.hasContradiction) {
    const candidateName = multi.extractedName || session.fullName || 'João';
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-contradiction`,
      sender: 'kael',
      text: `Entendi. Para evitar qualquer erro na elaboração do seu mapa, por favor confirme: o nome correto a ser considerado é ${candidateName}?`,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return { updatedSession: session, newMessages };
  }

  // 1.9 MENSAGENS MISTAS DE DADOS + PERGUNTAS (ex: "Meu nome é Gabriel Braga Silva, nasci em 18/06/1996. Esse mapa fala de profissão? E sobre relacionamentos?")
  const candidateName19 = interpretation.fullName || multi.extractedName;
  const candidateDate19 = interpretation.birthDate || multi.extractedDate;

  if (candidateName19 && isValidCandidateName(candidateName19, trimmed, session.currentState, session)) {
    session.fullName = candidateName19;
  }
  if (candidateDate19) {
    session.birthDate = candidateDate19.iso;
  }

  if (session.fullName && session.birthDate && (session.currentState === 'PRIMEIRO_CONTATO' || session.currentState === 'AGUARDANDO_NOME_DATA')) {
    session.currentState = 'CONFIRMACAO_DOS_DADOS';

    const answers: string[] = [];
    if (multi.hasProfessionQuestion) {
      answers.push('Sim. A numerologia cabalística analisa seu potencial profissional, seus talentos de prosperidade e os melhores caminhos para sua carreira.');
    }
    if (multi.hasRelationshipsQuestion) {
      answers.push('O mapa também examina a sua área afetiva, dinâmicas de relacionamento e padrões de convivência.');
    }
    if (multi.hasFinancesQuestion) {
      answers.push('O mapa traz orientações sobre suas energias de prosperidade e finanças.');
    }
    if (multi.hasPriceQuestion) {
      answers.push('O investimento promocional para a elaboração do mapa completo é R$ 15,00.');
    }
    if (answers.length === 0 && interpretation.isQuestion) {
      const qAns = answerSpontaneousQuestion(trimmed);
      if (qAns) answers.push(qAns);
    }

    let answerText = answers.join(' ');
    const promptText = getConfirmationPrompt(session.fullName, session.birthDate, false);
    const fullText = answerText ? `${answerText}\n\n${promptText}` : promptText;
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-data-questions`,
      sender: 'kael',
      text: fullText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return { updatedSession: session, newMessages };
  }

  // 1.95 CORREÇÃO DE DADOS + PERGUNTA DE IMPACTO (ex: "Na verdade meu nome correto é Gabriel Braga Silva... isso muda o resultado do mapa?")
  if ((multi.hasCorrection || interpretation.intent === 'REQUEST_CHANGE_DATA' || interpretation.intent === 'CORRECTION') && multi.hasImpactQuestion) {
    if (multi.extractedName) {
      session.fullName = multi.extractedName;
    }
    if (multi.extractedDate) {
      session.birthDate = multi.extractedDate.iso;
    }

    const explanation = 'Sim. Como a Numerologia Cabalística calcula os números a partir do valor numérico de cada letra do seu nome completo de nascimento, qualquer alteração no nome muda os resultados e os números gerados para o mapa.';

    if (session.fullName && session.birthDate) {
      session.currentState = 'CONFIRMACAO_DOS_DADOS';
      const promptText = getConfirmationPrompt(session.fullName, session.birthDate, true);
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-corr-impact`,
        sender: 'kael',
        text: `${explanation}\n\n${promptText}`,
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return { updatedSession: session, newMessages };
    }
  }

  // 1.96 TRATAMENTO DE SUB-ESTADOS DE CORREÇÃO PENDENTE (AGUARDANDO_QUAL_DADO, CORRIGINDO_NOME, CORRIGINDO_DATA)
  if (session.subState === 'AGUARDANDO_QUAL_DADO') {
    if (interpretation.intent === 'CORRECT_NAME' || normalized === 'o nome' || normalized === 'nome' || normalized === 'meu nome') {
      session.subState = 'CORRIGINDO_NOME';
      session.pendingCorrection = 'fullName';
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-ask-correct-name`,
        sender: 'kael',
        text: 'Claro! Por favor, me informe o seu nome completo de nascimento correto.',
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return logFlowDecisionAndReturn(initialState, 'ASK_CORRECT_NAME', session, newMessages);
    }

    if (interpretation.intent === 'CORRECT_DATE' || normalized === 'a data' || normalized === 'data' || normalized === 'minha data') {
      session.subState = 'CORRIGINDO_DATA';
      session.pendingCorrection = 'birthDate';
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-ask-correct-date`,
        sender: 'kael',
        text: 'Claro! Por favor, me informe a sua data de nascimento correta (DD/MM/AAAA).',
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return logFlowDecisionAndReturn(initialState, 'ASK_CORRECT_DATE', session, newMessages);
    }
  }

  if (session.subState === 'CORRIGINDO_NOME' && interpretation.intent !== 'QUESTION' && interpretation.intent !== 'ASK_PERMISSION_TO_ASK') {
    const candidateName = interpretation.fullName || extractFullName(trimmed, undefined) || (isValidCandidateName(trimmed, trimmed, session.currentState, session) ? trimmed : null);
    if (candidateName && isValidCandidateName(candidateName, trimmed, session.currentState, session)) {
      session.fullName = candidateName;
      session.subState = null;
      session.pendingCorrection = null;
      session.currentState = 'CONFIRMACAO_DOS_DADOS';
      const formattedDate = formatBirthDateForDisplay(session.birthDate);
      const replyText = `Perfeito, corrigi o seu nome.

Nome completo de nascimento: ${session.fullName}${formattedDate ? `\nData de nascimento: ${formattedDate}` : ''}

Agora os dados estão corretos?`;
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-name-updated`,
        sender: 'kael',
        text: replyText,
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return logFlowDecisionAndReturn(initialState, 'NAME_UPDATED', session, newMessages);
    }
  }

  if (session.subState === 'CORRIGINDO_DATA' && interpretation.intent !== 'QUESTION' && interpretation.intent !== 'ASK_PERMISSION_TO_ASK') {
    const extractedDate = interpretation.birthDate || extractBirthDate(trimmed);
    if (extractedDate && extractedDate.isValid) {
      session.birthDate = extractedDate.iso;
      session.subState = null;
      session.pendingCorrection = null;
      session.currentState = 'CONFIRMACAO_DOS_DADOS';
      const formattedDate = formatBirthDateForDisplay(session.birthDate);
      const replyText = `Perfeito, corrigi a sua data de nascimento.

${session.fullName ? `Nome completo de nascimento: ${session.fullName}\n` : ''}Data de nascimento: ${formattedDate}

Agora os dados estão corretos?`;
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-date-updated`,
        sender: 'kael',
        text: replyText,
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return logFlowDecisionAndReturn(initialState, 'DATE_UPDATED', session, newMessages);
    }
  }

  // 1.97 INTENÇÕES EXPLÍCITAS DE CORREÇÃO DE NOME OU DATA
  if (interpretation.intent === 'CORRECT_NAME' || interpretation.intent === 'NAME_CORRECTION') {
    session.subState = 'CORRIGINDO_NOME';
    session.pendingCorrection = 'fullName';
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-correct-name-intent`,
      sender: 'kael',
      text: 'Claro! Por favor, me informe o seu nome completo de nascimento correto.',
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return logFlowDecisionAndReturn(initialState, 'CORRECT_NAME_INTENT', session, newMessages);
  }

  if (interpretation.intent === 'CORRECT_DATE' || interpretation.intent === 'DATE_CORRECTION') {
    session.subState = 'CORRIGINDO_DATA';
    session.pendingCorrection = 'birthDate';
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-correct-date-intent`,
      sender: 'kael',
      text: 'Claro! Por favor, me informe a sua data de nascimento correta (DD/MM/AAAA).',
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return logFlowDecisionAndReturn(initialState, 'CORRECT_DATE_INTENT', session, newMessages);
  }

  // 2. CORREÇÃO / ALTERAÇÃO DE DADOS GERAL (REQUEST_CHANGE_DATA / CORRECTION)
  if (interpretation.intent === 'REQUEST_CHANGE_DATA' || interpretation.intent === 'CORRECTION') {
    const hasNewData = Boolean(interpretation.fullName || interpretation.birthDate);

    if (hasNewData) {
      if (interpretation.fullName) {
        session.fullName = interpretation.fullName;
      }
      if (interpretation.birthDate) {
        session.birthDate = interpretation.birthDate.iso;
      }
      session.subState = null;
      session.pendingCorrection = null;
      session.currentState = 'CONFIRMACAO_DOS_DADOS';

      const replyText = `Perfeito! Atualizei os seus dados.${session.fullName ? ` Nome: ${session.fullName}.` : ''}${session.birthDate ? ` Data: ${formatBirthDateForDisplay(session.birthDate)}.` : ''}\n\nOs dados estão corretos agora?`;
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-confirm-change`,
        sender: 'kael',
        text: replyText,
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return logFlowDecisionAndReturn(initialState, 'DATA_UPDATED_DIRECTLY', session, newMessages);
    } else {
      session.subState = 'AGUARDANDO_QUAL_DADO';
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-ask-which-data`,
        sender: 'kael',
        text: 'Sem problema! Qual dado você deseja corrigir: o nome completo ou a data de nascimento?',
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return logFlowDecisionAndReturn(initialState, 'ASK_WHICH_DATA_TO_CORRECT', session, newMessages);
    }
  }

  // 2.2 PERMISSÃO PARA FAZER DÚVIDA / PERGUNTA (ASK_PERMISSION_TO_ASK)
  if (interpretation.intent === 'ASK_PERMISSION_TO_ASK') {
    session.pendingUserQuestion = true;
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-permission-granted`,
      sender: 'kael',
      text: 'Claro! Pode perguntar. Estou aqui para esclarecer sua dúvida antes de você decidir.',
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return logFlowDecisionAndReturn(initialState, 'ASK_PERMISSION_TO_ASK', session, newMessages);
  }

  // 2.3 TRATAMENTO DE PERGUNTAS E DÚVIDAS DO USUÁRIO
  if (interpretation.intent === 'QUESTION' || interpretation.intent === 'PAYMENT_QUESTION') {
    session.pendingUserQuestion = false;

    const normQuestion = normalized.toLowerCase();
    let answer: string | null = null;

    if (interpretation.intent === 'PAYMENT_QUESTION') {
      answer = 'O investimento promocional para a elaboração do seu Mapa Numerológico Cabalístico completo é de R$ 15,00.';
    }

    // A. Perguntas sobre nome registrado
    if (!answer && (normQuestion.includes('qual e o meu nome') || normQuestion.includes('qual e meu nome') || normQuestion.includes('qual meu nome') || normQuestion.includes('saber meu nome'))) {
      if (session.fullName) {
        answer = `Você me informou o nome ${session.fullName}.`;
      } else {
        answer = 'Você ainda não me informou o seu nome completo de nascimento.';
      }
    }
    // B. Perguntas sobre data registrada
    else if (!answer && (normQuestion.includes('qual e a minha data') || normQuestion.includes('qual e minha data') || normQuestion.includes('qual minha data'))) {
      if (session.birthDate) {
        answer = `Você me informou a data de nascimento ${formatBirthDateForDisplay(session.birthDate)}.`;
      } else {
        answer = 'Você ainda não me informou a sua data de nascimento.';
      }
    }
    // C. Perguntas sobre trabalho / profissão / carreira
    else if (!answer && (normQuestion.includes('trabalho') || normQuestion.includes('profissao') || normQuestion.includes('profissão') || normQuestion.includes('carreira'))) {
      answer = 'Sim. O mapa pode trazer interpretações relacionadas a aspectos profissionais, talentos, desafios e tendências dentro da tradição da Numerologia Cabalística. Lembrando que se trata de uma prática de interpretação e autoconhecimento, não de uma previsão científica.';
    }
    // D. Perguntas sobre erro/invalidade anterior
    else if (!answer && (normQuestion.includes('invalida') || normQuestion.includes('inválida') || normQuestion.includes('por que deu erro') || normQuestion.includes('porque deu erro') || normQuestion.includes('esta errada') || normQuestion.includes('está errada'))) {
      answer = 'A data 20/03/1990 (ou qualquer data real do calendário) é válida. Se o sistema indicou algum erro anteriormente, foi apenas uma divergência de formatação momentânea. Pode desconsiderar aquela mensagem.';
    }

    if (!answer) {
      answer = answerSpontaneousQuestion(trimmed) || interpretation.responseGuidance;
    }

    if (!answer && aiAnswerFn) {
      try {
        const prompt = `Você é o Kael, assistente virtual calmo, educado e acolhedor do Mapa Numerológico Cabalístico.
O cliente está com a seguinte dúvida: "${trimmed}"
Responda de forma clara, amigável e concisa (máximo 2 parágrafos). Não mude o preço promocional de R$ 15,00 nem prometa nada fora do roteiro.`;
        answer = await aiAnswerFn(prompt);
      } catch (err) {
        console.error('Erro ao responder dúvida via Gemini:', err);
      }
    }

    if (!answer) {
      answer = 'Estou aqui para esclarecer qualquer dúvida sobre o seu Mapa Numerológico Cabalístico.';
    }

    let fullText = answer;
    if (session.currentState === 'CONFIRMACAO_DOS_DADOS') {
      fullText += '\n\nSe quiser, podemos voltar à confirmação dos seus dados.';
    } else {
      fullText += getStateAnchorPrompt(session.currentState, session);
    }

    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-question-answered`,
      sender: 'kael',
      text: fullText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return logFlowDecisionAndReturn(initialState, 'QUESTION_ANSWERED', session, newMessages);
  }

  // 2.5 IDENTIDADE DE IA, FRUSTRAÇÃO E SUPORTE HUMANO
  if (interpretation.intent === 'AI_IDENTITY') {
    const aiText = 'Sou o Kael, assistente virtual inteligente desenvolvido para te auxiliar na solicitação e esclarecimento de dúvidas sobre o seu Mapa Numerológico Cabalístico.' + getStateAnchorPrompt(session.currentState, session);
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-ai-identity`,
      sender: 'kael',
      text: aiText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return logFlowDecisionAndReturn(initialState, 'AI_IDENTITY', session, newMessages);
  }

  if (interpretation.intent === 'USER_FRUSTRATION') {
    const frustText = 'Peço desculpas pela repetição e por não ter compreendido perfeitamente o que você quis dizer antes. Não quero te enviar respostas prontas. Por favor, me diga exatamente o que você gostaria de saber ou corrigir que eu respondo diretamente a você.' + getStateAnchorPrompt(session.currentState, session);
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-frustration`,
      sender: 'kael',
      text: frustText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return logFlowDecisionAndReturn(initialState, 'USER_FRUSTRATION', session, newMessages);
  }

  if (interpretation.intent === 'HUMAN_SUPPORT_REQUEST' || interpretation.needsHumanSupport) {
    const humanText = 'No momento, todo o atendimento e a elaboração do Mapa Numerológico Cabalístico são realizados 100% de forma digital e automatizada por mim (Kael) diretamente aqui no chat. Estou à disposição para tirar qualquer dúvida que você tiver sobre o mapa!' + getStateAnchorPrompt(session.currentState, session);
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-human-support`,
      sender: 'kael',
      text: humanText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return logFlowDecisionAndReturn(initialState, 'HUMAN_SUPPORT_REQUEST', session, newMessages);
  }

  // 3. FRUSTRAÇÃO / RECLAMAÇÃO DO CLIENTE (SEÇÃO 15)
  if (interpretation.intent === 'COMPLAINT' || interpretation.intent === 'CONFUSION') {
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-complaint`,
      sender: 'kael',
      text: 'Entendi agora. Peço desculpas pela confusão! Vamos continuar com atenção.' + getStateAnchorPrompt(session.currentState, session),
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return { updatedSession: session, newMessages };
  }

  // 4. DESISTÊNCIA / DESPEDIDA / NÃO QUERO COMPRAR (SEÇÃO 22)
  if (interpretation.intent === 'NO_PURCHASE' || interpretation.intent === 'REQUEST_CANCEL' || interpretation.intent === 'GOODBYE' || interpretation.intent === 'NEGATION') {
    session.currentState = 'CONVERSA_ENCERRADA';
    const closeMsg: KaelMessage = {
      id: `kael-${Date.now()}-close`,
      sender: 'kael',
      text: 'Compreendo perfeitamente. Se decidir fazer o seu Mapa Numerológico Cabalístico no futuro, estarei por aqui. Tenha um excelente dia!',
      timestamp: now
    };
    session.messages.push(closeMsg);
    newMessages.push(closeMsg);
    return { updatedSession: session, newMessages };
  }

  // 5. TRATAR CONVERSA ENCERRADA
  if (session.currentState === 'CONVERSA_ENCERRADA') {
    if (interpretation.intent === 'AFFIRMATION' || interpretation.intent === 'GREETING' || interpretation.intent === 'PURCHASE_INTENT') {
      if (session.fullName && session.birthDate) {
        session.currentState = 'CONFIRMACAO_DOS_DADOS';
        const confirmMsg: KaelMessage = {
          id: `kael-${Date.now()}-confirm-return`,
          sender: 'kael',
          text: 'Que bom ter você de volta!\n\n' + getConfirmationPrompt(session.fullName, session.birthDate, false),
          timestamp: now
        };
        session.messages.push(confirmMsg);
        newMessages.push(confirmMsg);
      } else {
        session.currentState = 'AGUARDANDO_NOME_DATA';
        const msg3: KaelMessage = {
          id: `kael-${Date.now()}-3`,
          sender: 'kael',
          text: 'Que bom ter você de volta!\n\n' + KAEL_MESSAGES.MSG_3,
          timestamp: now
        };
        session.messages.push(msg3);
        newMessages.push(msg3);
      }
      return { updatedSession: session, newMessages };
    } else {
      const closeMsg: KaelMessage = {
        id: `kael-${Date.now()}-close`,
        sender: 'kael',
        text: KAEL_MESSAGES.MSG_CLOSE,
        timestamp: now
      };
      session.messages.push(closeMsg);
      newMessages.push(closeMsg);
      return { updatedSession: session, newMessages };
    }
  }

  // 6. AFIRMAÇÃO DE PAGAMENTO ("paguei", "fiz o pix")
  if (interpretation.intent === 'PAYMENT_CLAIM') {
    if (session.currentState === 'CONFIRMACAO_DOS_DADOS' || session.currentState === 'AGUARDANDO_NOME_DATA') {
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-paguei-before-confirm`,
        sender: 'kael',
        text: `Antes de prosseguirmos para a verificação do pagamento, precisamos primeiro confirmar se os seus dados de nascimento estão corretos:\n\nNome completo de nascimento: ${session.fullName || 'Pendente'}\nData de nascimento: ${formatBirthDateForDisplay(session.birthDate) || 'Pendente'}\n\nOs dados estão corretos?`,
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return { updatedSession: session, newMessages };
    }

    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-paguei`,
      sender: 'kael',
      text: 'Obrigado por avisar! O sistema está aguardando a confirmação automática do pagamento via PIX.\n\nAssim que o pagamento for confirmado pelo nosso sistema, o seu mapa começará a ser elaborado automaticamente. Se preferir, você também pode simular a confirmação no painel de testes acima.',
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return { updatedSession: session, newMessages };
  }

  // 6.5 TRATAMENTO DE PREOCUPAÇÕES / MEDO DE PERDER DINHEIRO / OBJEÇÕES FINANCEIRAS
  if (interpretation.isConcern || normalized.includes('medo') || normalized.includes('perder meu dinheiro') || normalized.includes('perder dinheiro') || normalized.includes('receio')) {
    let concernAnswer = answerSpontaneousQuestion(trimmed) || interpretation.responseGuidance;
    if (!concernAnswer) {
      concernAnswer = 'Compreendo perfeitamente o seu receio. O valor de R$ 15,00 é processado com total segurança via PIX, e o seu Mapa Numerológico Cabalístico em PDF é elaborado e disponibilizado diretamente aqui nesta conversa logo após a confirmação do pagamento.';
    }

    const anchor = getStateAnchorPrompt(session.currentState, session);
    const fullText = `${concernAnswer}${anchor}`;
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-concern`,
      sender: 'kael',
      text: fullText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return logFlowDecisionAndReturn(initialState, 'FINANCIAL_CONCERN_OR_OBJECTION', session, newMessages);
  }

  // 7. CONFIRMAÇÃO POSITIVA DOS DADOS EM CONFIRMACAO_DOS_DADOS
  if (session.currentState === 'CONFIRMACAO_DOS_DADOS' && (interpretation.intent === 'AFFIRMATION' || interpretation.intent === 'CONFIRMATION' || (interpretation.intent === 'NAME_AND_BIRTH_DATE' && interpretation.fullName === session.fullName))) {
    // Se a mensagem contiver uma dúvida ou pergunta adicional (ex: "está certo, mas quanto tempo demora?"), responde à dúvida e re-pede a confirmação sem mudar de estado
    const hasQuestionInAffirmation = interpretation.isQuestion || multi.topicCount >= 1 || trimmed.includes('?') || normalized.includes('mas') || normalized.includes('quanto') || normalized.includes('como') || normalized.includes('demora');

    if (hasQuestionInAffirmation && (multi.hasDeliveryQuestion || multi.hasPriceQuestion || multi.hasProfessionQuestion || interpretation.isQuestion || trimmed.includes('?'))) {
      let answer = answerSpontaneousQuestion(trimmed);
      if (!answer && multi.hasDeliveryQuestion) {
        answer = 'Depois que o pagamento for confirmado, o mapa é elaborado e o PDF é disponibilizado por aqui nesta conversa.';
      }
      if (!answer) {
        answer = 'Esclarecendo sua dúvida: o seu mapa é elaborado com total precisão após a confirmação do pagamento.';
      }

      const promptText = getConfirmationPrompt(session.fullName || '', session.birthDate || '', false);
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-affirmation-with-question`,
        sender: 'kael',
        text: `${answer}\n\n${promptText}`,
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return logFlowDecisionAndReturn(initialState, 'AFFIRMATION_WITH_QUESTION', session, newMessages);
    }

    session.currentState = 'AGUARDANDO_PAGAMENTO';
    const msg4: KaelMessage = {
      id: `kael-${Date.now()}-4`,
      sender: 'kael',
      text: KAEL_MESSAGES.MSG_4,
      timestamp: now
    };
    const msg5: KaelMessage = {
      id: `kael-${Date.now()}-5`,
      sender: 'kael',
      text: KAEL_MESSAGES.MSG_5,
      timestamp: now
    };
    session.messages.push(msg4, msg5);
    newMessages.push(msg4, msg5);
    return logFlowDecisionAndReturn(initialState, 'CONFIRMATION_GOTO_PAYMENT', session, newMessages);
  }

  // 8. ESCLARECIMENTO DE ACENTOS / REGRAS
  if (interpretation.intent === 'CLARIFICATION') {
    const isAccentTopic = trimmed.toLowerCase().includes('acento');
    const replyText = isAccentTopic
      ? 'Não tem problema! Se o seu nome de nascimento não possui acentos, pode enviá-lo exatamente dessa forma.' + getStateAnchorPrompt(session.currentState, session)
      : 'Compreendo perfeitamente o seu ponto.' + getStateAnchorPrompt(session.currentState, session);

    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-clarification`,
      sender: 'kael',
      text: replyText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return { updatedSession: session, newMessages };
  }

  // 10. INTENÇÃO DE COMPRA
  if (interpretation.intent === 'PURCHASE_INTENT') {
    let replyText = 'Fico muito feliz com o seu interesse!';
    if (!session.fullName || !session.birthDate) {
      session.currentState = 'AGUARDANDO_NOME_DATA';
      replyText += '\n\nPara darmos início, por favor me envie o seu nome completo de nascimento e a sua data de nascimento (DD/MM/AAAA).';
    } else if (session.currentState === 'CONFIRMACAO_DOS_DADOS') {
      replyText += '\n\n' + getConfirmationPrompt(session.fullName, session.birthDate, false);
    } else if (session.currentState === 'AGUARDANDO_PAGAMENTO') {
      replyText += '\n\nPara liberar a geração do seu mapa, basta realizar o PIX de R$ 15,00 pela chave pagamento@mapacabalistico.com.br.';
    }

    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-purchase`,
      sender: 'kael',
      text: replyText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return logFlowDecisionAndReturn(initialState, 'PURCHASE_INTENT', session, newMessages, interpretation.greetingTextToSpeak);
  }

  // 12. CUMPRIMENTO ("olá", "bom dia")
  if (interpretation.intent === 'GREETING') {
    const greetingSpeak = interpretation.greetingTextToSpeak || 'Olá! 😊';
    const greetingText = buildPureGreetingResponse(greetingSpeak, session);

    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-greeting`,
      sender: 'kael',
      text: greetingText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return logFlowDecisionAndReturn(initialState, 'GREETING', session, newMessages, interpretation.greetingTextToSpeak);
  }

  // 13. ENVIO / CORREÇÃO DE DADOS (NAME, BIRTH_DATE ou NAME_AND_BIRTH_DATE)
  if (interpretation.intent === 'NAME' || interpretation.intent === 'BIRTH_DATE' || interpretation.intent === 'NAME_AND_BIRTH_DATE') {
    const isCorrection = session.currentState === 'CONFIRMACAO_DOS_DADOS';

    if (interpretation.fullName) {
      if (isValidCandidateName(interpretation.fullName, trimmed, session.currentState, session)) {
        session.fullName = interpretation.fullName;
      }
    }
    if (interpretation.birthDate) {
      session.birthDate = interpretation.birthDate.iso;
    }

    if (session.fullName && session.birthDate) {
      session.currentState = 'CONFIRMACAO_DOS_DADOS';

      const promptText = getConfirmationPrompt(session.fullName, session.birthDate, isCorrection);
      const confirmMsg: KaelMessage = {
        id: `kael-${Date.now()}-confirm`,
        sender: 'kael',
        text: promptText,
        timestamp: now
      };
      session.messages.push(confirmMsg);
      newMessages.push(confirmMsg);
      return logFlowDecisionAndReturn(initialState, 'NAME_AND_BIRTH_DATE', session, newMessages, interpretation.greetingTextToSpeak);
    }

    if (session.birthDate && !session.fullName) {
      const formattedDate = formatBirthDateForDisplay(session.birthDate);
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-dateok`,
        sender: 'kael',
        text: `Recebi a sua data de nascimento (${formattedDate}).\n\nAgora, por favor, me informe o seu nome completo de nascimento (com acentos e sem abreviações).`,
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return logFlowDecisionAndReturn(initialState, 'BIRTH_DATE', session, newMessages, interpretation.greetingTextToSpeak);
    }

    if (session.fullName && !session.birthDate) {
      const replyMsg: KaelMessage = {
        id: `kael-${Date.now()}-nameok`,
        sender: 'kael',
        text: `Recebi o seu nome (${session.fullName}).\n\nAgora, por favor, me informe a sua data de nascimento no formato DD/MM/AAAA.`,
        timestamp: now
      };
      session.messages.push(replyMsg);
      newMessages.push(replyMsg);
      return logFlowDecisionAndReturn(initialState, 'NAME', session, newMessages, interpretation.greetingTextToSpeak);
    }
  }

  // 14. FALLBACK GENÉRICO / UNCLEAR
  session.offTopicCount += 1;

  if (session.offTopicCount >= 8) {
    session.currentState = 'CONVERSA_ENCERRADA';
    const closeMsg: KaelMessage = {
      id: `kael-${Date.now()}-excess`,
      sender: 'kael',
      text: KAEL_MESSAGES.MSG_CLOSE,
      timestamp: now
    };
    session.messages.push(closeMsg);
    newMessages.push(closeMsg);
    return logFlowDecisionAndReturn(initialState, 'EXCESS_OFFTOPIC_CLOSE', session, newMessages, interpretation.greetingTextToSpeak);
  }

  const anchor = getStateAnchorPrompt(session.currentState, session);
  const fallbackText = 'Compreendo. Estou aqui para ajudar.' + anchor;
  const fallbackMsg: KaelMessage = {
    id: `kael-${Date.now()}-fallback`,
    sender: 'kael',
    text: fallbackText,
    timestamp: now
  };
  session.messages.push(fallbackMsg);
  newMessages.push(fallbackMsg);
  return logFlowDecisionAndReturn(initialState, 'FALLBACK', session, newMessages, interpretation.greetingTextToSpeak);
}
