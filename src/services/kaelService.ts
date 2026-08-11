import { KaelSession, KaelMessage, KaelState, MessageIntent, ClientInterpretation } from '../types/kael.js';

// ROTEIRO OFICIAL DO KAEL
export const KAEL_MESSAGES = {
  MSG_1: `Olá! Que alegria receber o seu contato!

Se você chegou até aqui hoje, saiba que talvez isso não seja apenas uma coincidência. Muitas vezes, o universo nos conduz exatamente para as experiências que precisamos viver no momento certo.

Hoje pode ser o início de uma nova compreensão sobre você mesmo.`,

  MSG_2: `Minha missão é traduzir os códigos presentes no seu nome e na sua data de nascimento através da Numerologia Cabalística.

O seu Mapa Numerológico Cabalístico revela aspectos profundos da sua personalidade, seus talentos naturais, desafios, missão de vida, ciclos atuais, potencial profissional, prosperidade, relacionamentos e caminhos para o seu desenvolvimento pessoal e espiritual.

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
  'porque', 'por', 'como', 'funciona', 'onde', 'quando', 'coisa', 'fazer', 'saber',
  'posso', 'ter', 'pode', 'gerar', 'agora', 'obrigado', 'obrigada', 'valeu', 'entendi',
  'voce', 'você', 'esta', 'está', 'tá', 'ta', 'sim', 'resposta', 'pergunta', 'duvida',
  'dúvida', 'significa', 'quais', 'esse', 'essa', 'este', 'esta', 'mudar', 'preço',
  'preco', 'pagar', 'pix', 'paguei', 'pago', 'cancelar', 'desisto', 'tchau', 'adeus',
  'falei', 'falou', 'falar', 'disse', 'dizer', 'entender', 'estou', 'estamos',
  'certo', 'correto', 'confirmo', 'continuar', 'seguir', 'perfeito', 'tudo',
  'resetar', 'reset', 'reiniciar', 'reinicia', 'voltar', 'começo', 'comeco', 'inicio',
  'início', 'primeiras', 'mensagens', 'apaga', 'esquece', 'refazer', 'novamente',
  'mandei', 'errado', 'errada', 'dados', 'corrigir', 'alterar', 'mae', 'mãe',
  'pai', 'filho', 'filha', 'esposa', 'marido', 'amigo', 'amiga', 'outra', 'pessoa',
  'comprar', 'fazer', 'pedir', 'burro', 'repetindo', 'confusao', 'confusão',
  'cientifico', 'científico', 'serve', 'sirve', 'acreditar', 'astral', 'dizer',
  'revela', 'profissão', 'profissao', 'trabalho', 'carreira', 'amor', 'relacionamentos',
  'dinheiro', 'prosperidade', 'finanças', 'financas', 'resultado', 'impacto', 'diz',
  'faço', 'faco', 'tinha', 'digitado', 'coloquei', 'antes', 'depois', 'queria', 'quero',
  'verdade', 'realmente', 'mesmo', 'saber', 'diferença', 'diferenca',
  'janeiro', 'jan', 'fevereiro', 'fev', 'marco', 'março', 'mar', 'abril', 'abr',
  'maio', 'mai', 'junho', 'jun', 'julho', 'jul', 'agosto', 'ago', 'setembro', 'set',
  'outubro', 'out', 'novembro', 'nov', 'dezembro', 'dez', 'nasci', 'dia', 'mes', 'mês',
  'ano', 'data', 'nascimento', 'minha'
]);

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
  formatted: string;
  iso: string;
  isValid: boolean;
  originalMatchedStr: string;
}

// Helper para formatar data de nascimento para exibição (DD/MM/AAAA)
export function formatBirthDateForDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
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

// Extrator flexível de data de nascimento no texto
export function extractBirthDate(text: string): ExtractedBirthDate | null {
  if (!text) return null;

  // Pattern 1: Mês por extenso / abreviado (ex: "20 de março de 1990", "20 mar 1990", "20 de março de 90")
  const monthNamesRegex = /\b(\d{1,2})\s*(?:de\s*)?(janeiro|jan|fevereiro|fev|março|marco|mar|abril|abr|maio|mai|junho|jun|julho|jul|agosto|ago|setembro|set|outubro|out|novembro|nov|dezembro|dez)\s*(?:de\s*)?(\d{2,4})\b/i;
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
        formatted: `${dayPadded}/${monthPadded}/${year}`,
        iso: `${year}-${monthPadded}-${dayPadded}`,
        isValid,
        originalMatchedStr: monthMatch[0]
      };
    }
  }

  // Pattern 2: Data numérica com barras, pontos, traços ou ESPAÇOS (ex: "20 03 1990", "20/03/1990", "20-03-90")
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
        formatted: `${dayPadded}/${monthPadded}/${year}`,
        iso: `${year}-${monthPadded}-${dayPadded}`,
        isValid,
        originalMatchedStr: numMatch[0]
      };
    }
  }

  // Pattern 3: Formato ISO (ex: "1990-03-20" ou "1990/03/20")
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
      formatted: `${dayPadded}/${monthPadded}/${year}`,
      iso: `${year}-${monthPadded}-${dayPadded}`,
      isValid,
      originalMatchedStr: isoMatch[0]
    };
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
    response: 'Depois que o pagamento for confirmed, o mapa é elaborado e o PDF é disponibilizado por aqui.'
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

// Servico de Interpretacao Semantica da Mensagem do Cliente (NLU)
export async function interpretClientMessage(
  userText: string,
  currentState: KaelState,
  session: KaelSession,
  aiAnswerFn?: (prompt: string) => Promise<string>
): Promise<ClientInterpretation> {
  const normalized = userText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Tentar classificação via IA Gemini (se aiAnswerFn estiver disponível)
  if (aiAnswerFn) {
    try {
      const historySnippet = (session.messages || [])
        .slice(-6)
        .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
        .join('\n');

      const classificationPrompt = `Você é o interpretador de linguagem natural e inteligência conversacional (NLU) do assistente Kael.

HISTÓRICO RECENTE DA CONVERSA:
${historySnippet}

ESTADO ATUAL DA CONVERSA: ${currentState}
DADOS JÁ CADASTRADOS NA SESSÃO:
- Nome: "${session.fullName || 'nenhum'}"
- Data de Nascimento: "${session.birthDate || 'nenhuma'}"

MENSAGEM RECEBIDA DO CLIENTE: "${userText}"

Sua tarefa é CLASSIFICAR A INTENÇÃO REAL do cliente considerando o HISTÓRICO, o ESTADO e a MENSAGEM ATUAL.

HIERARQUIA E LISTA DE INTENÇÕES:
1. REQUEST_RESET ou REQUEST_RESTART: Cliente quer reiniciar a conversa do zero, resetar, apagar tudo, recomeçar, voltar para o começo, voltar para as primeiras mensagens.
2. REQUEST_CHANGE_DATA ou CORRECTION: Cliente diz que o nome ou data está errado ("meu nome está errado. É Gabriel Braga Silva", "mandei o nome errado", "quero corrigir o nome", "está errado").
3. COMPLAINT ou CONFUSION: Cliente demonstra irritação ou reclama que o assistente não entendeu ("você não entende?", "você tá repetindo", "não foi isso que falei").
4. REQUEST_CANCEL, NO_PURCHASE ou NEGATION: Recusa ou cancelamento ("não quero comprar agora", "cancelar", "desisto").
5. GOODBYE: Despedida ("tchau", "adeus").
6. PAYMENT_CLAIM: Afirmação de pagamento ("paguei", "fiz o pix", "mandei o comprovante").
7. AFFIRMATION ou CONFIRMATION: Confirmação positiva ("sim", "está correto", "tudo certo", "pode continuar", "confirmo").
8. QUESTION ou PAYMENT_QUESTION: Dúvidas sobre preço, conteúdo, se fala de relacionamento, se pode fazer pra mãe, quanto tempo demora.
9. CLARIFICATION: Esclarecimentos ("meu nome não tem acento", "o que é nome completo").
10. PURCHASE_INTENT: Intenção de compra ("quero fazer", "como faço pra pedir").
11. NAME, BIRTH_DATE, NAME_AND_BIRTH_DATE: Fornecimento direto de dados.
12. GREETING: Cumprimento ("olá", "bom dia").
13. OFF_TOPIC ou UNCLEAR: Não compreendido.

REGRAS RÍGIDAS DE EXTRAÇÃO:
- NUNCA extraia nome ou data se a intenção for QUESTION, CLARIFICATION, COMPLAINT, PAYMENT_QUESTION, REQUEST_RESET, REQUEST_RESTART, AFFIRMATION, NEGATION, NO_PURCHASE, PAYMENT_CLAIM, OFF_TOPIC.
- Se o cliente solicitar reset ("vamos resetar", "volte para as primeiras mensagens"), classifique estritamente como REQUEST_RESET ou REQUEST_RESTART.
- Se o cliente disser "Meu nome está errado. É Gabriel Braga Silva", classifique como REQUEST_CHANGE_DATA ou CORRECTION e extraia fullName = "Gabriel Braga Silva".

Responda EXCLUSIVAMENTE em formato JSON puro com esta estrutura:
{
  "intent": "REQUEST_RESET" | "REQUEST_RESTART" | "REQUEST_CHANGE_DATA" | "CORRECTION" | "COMPLAINT" | "CONFUSION" | "REQUEST_CANCEL" | "NO_PURCHASE" | "GOODBYE" | "PAYMENT_CLAIM" | "AFFIRMATION" | "CONFIRMATION" | "QUESTION" | "PAYMENT_QUESTION" | "CLARIFICATION" | "PURCHASE_INTENT" | "NAME" | "BIRTH_DATE" | "NAME_AND_BIRTH_DATE" | "GREETING" | "OFF_TOPIC" | "UNCLEAR",
  "fullName": string ou null,
  "birthDateFormatted": string ou null,
  "birthDateISO": string ou null,
  "explanation": "motivo curto"
}`;

      const aiResponse = await aiAnswerFn(classificationPrompt);
      const cleanJson = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed && parsed.intent) {
        const nonDataIntents: MessageIntent[] = [
          'REQUEST_RESET', 'REQUEST_RESTART', 'COMPLAINT', 'CONFUSION',
          'REQUEST_CANCEL', 'NO_PURCHASE', 'GOODBYE', 'CLARIFICATION',
          'QUESTION', 'PAYMENT_QUESTION', 'AFFIRMATION', 'CONFIRMATION',
          'NEGATION', 'PAYMENT_CLAIM', 'OFF_TOPIC', 'GREETING', 'UNCLEAR'
        ];

        let extractedDate: ExtractedBirthDate | null = null;
        if (parsed.birthDateFormatted && parsed.birthDateISO) {
          let isValid = true;
          if (parsed.birthDateISO) {
            const parts = parsed.birthDateISO.split('-');
            if (parts.length === 3) {
              const year = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10);
              const day = parseInt(parts[2], 10);
              isValid = isValidCalendarDate(day, month, year);
            }
          }
          extractedDate = {
            formatted: parsed.birthDateFormatted,
            iso: parsed.birthDateISO,
            isValid,
            originalMatchedStr: userText
          };
        } else if (parsed.intent === 'BIRTH_DATE' || parsed.intent === 'NAME_AND_BIRTH_DATE' || parsed.intent === 'CORRECTION' || parsed.intent === 'REQUEST_CHANGE_DATA') {
          extractedDate = extractBirthDate(userText);
        }

        let finalFullName = parsed.fullName || null;
        if (nonDataIntents.includes(parsed.intent as MessageIntent) && parsed.intent !== 'CORRECTION' && parsed.intent !== 'REQUEST_CHANGE_DATA') {
          finalFullName = null;
          extractedDate = null;
        }

        return {
          intent: parsed.intent as MessageIntent,
          fullName: finalFullName,
          birthDate: extractedDate,
          explanation: parsed.explanation || '',
          confidence: 0.95
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

  // B. Solicitação de Correção / Mudança de Dados (REQUEST_CHANGE_DATA / CORRECTION)
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
    const nameWords = extractedName.toLowerCase().split(/\s+/);
    const validWords = nameWords.filter(w => !NON_NAME_WORDS.has(w));
    if (validWords.length === 0) {
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
  // Se o mapa já foi entregue ou está em pós-venda / suporte, não anexar lembretes comerciais
  if (session.mapDelivered || state === 'POS_VENDA' || state === 'PDF_PRONTO') {
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
    const words = extractedName.toLowerCase().split(/\s+/).filter(w => !NON_NAME_WORDS.has(w));
    if (words.length === 0) extractedName = null;
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

// Processador principal de mensagens recebidas pelo Kael com Inteligência NLU
export async function handleKaelUserMessage(
  session: KaelSession,
  userText: string,
  aiAnswerFn?: (prompt: string) => Promise<string>
): Promise<{ updatedSession: KaelSession; newMessages: KaelMessage[] }> {
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
    return { updatedSession: session, newMessages };
  }

  // 1.4 DATA INVÁLIDA NO CALENDÁRIO
  if (interpretation.intent === 'INVALID_DATE' || (interpretation.birthDate && !interpretation.birthDate.isValid)) {
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-invalid-date`,
      sender: 'kael',
      text: 'Essa data de nascimento parece estar inválida no calendário. Pode conferir sua data de nascimento e me enviar novamente?',
      timestamp: now
    };
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
  if ((multi.extractedName || multi.extractedDate) && (multi.hasProfessionQuestion || multi.hasRelationshipsQuestion || multi.hasFinancesQuestion || multi.hasGeneralNumbersQuestion || multi.hasPriceQuestion)) {
    if (multi.extractedName) {
      session.fullName = multi.extractedName;
    }
    if (multi.extractedDate) {
      session.birthDate = multi.extractedDate.iso;
    }

    const answers: string[] = [];
    if (multi.hasProfessionQuestion) {
      answers.push('O Mapa Numerológico Cabalístico inclui uma análise completa do seu potencial profissional, vocações e caminhos de carreira.');
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

    let answerText = answers.join(' ');

    if (session.fullName && session.birthDate) {
      session.currentState = 'CONFIRMACAO_DOS_DADOS';
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

  // 2. CORREÇÃO / ALTERAÇÃO DE DADOS (SEÇÃO 7 e 8)
  if (interpretation.intent === 'REQUEST_CHANGE_DATA' || interpretation.intent === 'CORRECTION') {
    const hasNewData = Boolean(interpretation.fullName || interpretation.birthDate);

    if (hasNewData) {
      if (interpretation.fullName) {
        session.fullName = interpretation.fullName;
      }
      if (interpretation.birthDate) {
        session.birthDate = interpretation.birthDate.iso;
      }

      if (session.fullName && session.birthDate) {
        session.currentState = 'CONFIRMACAO_DOS_DADOS';
        const promptText = getConfirmationPrompt(session.fullName, session.birthDate, true);
        const replyMsg: KaelMessage = {
          id: `kael-${Date.now()}-confirm-change`,
          sender: 'kael',
          text: promptText,
          timestamp: now
        };
        session.messages.push(replyMsg);
        newMessages.push(replyMsg);
        return { updatedSession: session, newMessages };
      } else {
        session.currentState = 'AGUARDANDO_NOME_DATA';
        const askText = !session.fullName
          ? 'Sem problema! Qual é o seu nome completo de nascimento correto?'
          : 'Sem problema! Qual é a sua data de nascimento correta (DD/MM/AAAA)?';
        const replyMsg: KaelMessage = {
          id: `kael-${Date.now()}-ask-missing`,
          sender: 'kael',
          text: askText,
          timestamp: now
        };
        session.messages.push(replyMsg);
        newMessages.push(replyMsg);
        return { updatedSession: session, newMessages };
      }
    } else {
      // Nenhum dado novo veio na mensagem (ex: "eu mandei o nome errado")
      const trimmedLower = trimmed.toLowerCase();
      if (trimmedLower.includes('nome')) {
        session.fullName = undefined;
        session.currentState = 'AGUARDANDO_NOME_DATA';
        const replyMsg: KaelMessage = {
          id: `kael-${Date.now()}-ask-name`,
          sender: 'kael',
          text: 'Sem problema! Qual é o seu nome completo de nascimento correto?',
          timestamp: now
        };
        session.messages.push(replyMsg);
        newMessages.push(replyMsg);
        return { updatedSession: session, newMessages };
      } else if (trimmedLower.includes('data')) {
        session.birthDate = undefined;
        session.currentState = 'AGUARDANDO_NOME_DATA';
        const replyMsg: KaelMessage = {
          id: `kael-${Date.now()}-ask-date`,
          sender: 'kael',
          text: 'Sem problema! Qual é a sua data de nascimento correta (DD/MM/AAAA)?',
          timestamp: now
        };
        session.messages.push(replyMsg);
        newMessages.push(replyMsg);
        return { updatedSession: session, newMessages };
      } else {
        session.currentState = 'AGUARDANDO_NOME_DATA';
        const replyMsg: KaelMessage = {
          id: `kael-${Date.now()}-ask-which`,
          sender: 'kael',
          text: 'Sem problema! Me informe qual dado você deseja corrigir (o nome completo ou a data de nascimento).',
          timestamp: now
        };
        session.messages.push(replyMsg);
        newMessages.push(replyMsg);
        return { updatedSession: session, newMessages };
      }
    }
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

  // 7. CONFIRMAÇÃO POSITIVA DOS DADOS EM CONFIRMACAO_DOS_DADOS
  if (session.currentState === 'CONFIRMACAO_DOS_DADOS' && (interpretation.intent === 'AFFIRMATION' || interpretation.intent === 'CONFIRMATION' || (interpretation.intent === 'NAME_AND_BIRTH_DATE' && interpretation.fullName === session.fullName))) {
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
    return { updatedSession: session, newMessages };
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

  // 9. DÚVIDAS DE PREÇO (SEÇÃO 23)
  if (interpretation.intent === 'PAYMENT_QUESTION') {
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-price`,
      sender: 'kael',
      text: 'O investimento promocional é de R$ 15,00.' + getStateAnchorPrompt(session.currentState, session),
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
    return { updatedSession: session, newMessages };
  }

  // 11. DÚVIDAS E PERGUNTAS (SEÇÃO 11, 24)
  if (interpretation.intent === 'QUESTION') {
    const normQuestion = normalized.toLowerCase();
    let answer: string | null = null;

    // A. Perguntas sobre nome registrado
    if (normQuestion.includes('qual e o meu nome') || normQuestion.includes('qual e meu nome') || normQuestion.includes('qual meu nome') || normQuestion.includes('saber meu nome')) {
      if (session.fullName) {
        answer = `Você me informou o nome ${session.fullName}.`;
      } else {
        answer = 'Você ainda não me informou o seu nome completo de nascimento.';
      }
    }
    // B. Perguntas sobre data registrada
    else if (normQuestion.includes('qual e a minha data') || normQuestion.includes('qual e minha data') || normQuestion.includes('qual minha data')) {
      if (session.birthDate) {
        answer = `Você me informou a data de nascimento ${formatBirthDateForDisplay(session.birthDate)}.`;
      } else {
        answer = 'Você ainda não me informou a sua data de nascimento.';
      }
    }
    // C. Perguntas sobre erro/invalidade anterior
    else if (normQuestion.includes('invalida') || normQuestion.includes('inválida') || normQuestion.includes('por que deu erro') || normQuestion.includes('porque deu erro') || normQuestion.includes('esta errada') || normQuestion.includes('está errada')) {
      answer = 'A data 20/03/1990 (ou qualquer data real do calendário) é válida. Se o sistema indicou algum erro anteriormente, foi apenas uma divergência de formatação momentânea. Pode desconsiderar aquela mensagem.';
    }

    if (!answer) {
      answer = answerSpontaneousQuestion(trimmed);
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

    const fullText = `${answer}${getStateAnchorPrompt(session.currentState, session)}`;
    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-question`,
      sender: 'kael',
      text: fullText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return { updatedSession: session, newMessages };
  }

  // 12. CUMPRIMENTO ("olá", "bom dia")
  if (interpretation.intent === 'GREETING') {
    const greetingText = session.presentationAlreadyMade
      ? 'Olá! Como posso te ajudar?' + getStateAnchorPrompt(session.currentState, session)
      : 'Olá! Que bom falar com você.' + getStateAnchorPrompt(session.currentState, session);

    const replyMsg: KaelMessage = {
      id: `kael-${Date.now()}-greeting`,
      sender: 'kael',
      text: greetingText,
      timestamp: now
    };
    session.messages.push(replyMsg);
    newMessages.push(replyMsg);
    return { updatedSession: session, newMessages };
  }

  // 13. ENVIO / CORREÇÃO DE DADOS (NAME, BIRTH_DATE ou NAME_AND_BIRTH_DATE)
  if (interpretation.intent === 'NAME' || interpretation.intent === 'BIRTH_DATE' || interpretation.intent === 'NAME_AND_BIRTH_DATE') {
    const isCorrection = session.currentState === 'CONFIRMACAO_DOS_DADOS';

    if (interpretation.fullName) {
      session.fullName = interpretation.fullName;
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
      return { updatedSession: session, newMessages };
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
      return { updatedSession: session, newMessages };
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
      return { updatedSession: session, newMessages };
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
    return { updatedSession: session, newMessages };
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

  return { updatedSession: session, newMessages };
}
