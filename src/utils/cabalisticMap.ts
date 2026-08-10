/**
 * DEMONSTRAÇÃO TÉCNICA - MVP DE MAPA CABALÍSTICO
 * 
 * NOTA TÉCNICA: Esta implementação contém a lógica da Metodologia de Demonstração
 * para o MVP. Toda a estrutura de cálculo de Gematria, Número de Destino, Alma,
 * Expressão e Personalidade pode ser facilmente substituída ou estendida no futuro
 * pela metodologia definitiva do cliente ou integração com motor de IA.
 */

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

// Tabela de equivalência da Gematria Cabalística
const KABBALAH_LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 8, Q: 1, R: 2,
  S: 3, T: 4, U: 6, V: 6, W: 6, X: 6, Y: 1, Z: 7
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

/**
 * Reduz um número somando seus dígitos até restar 1 dígito de 1 a 9, 
 * preservando os números mestres 11, 22 e 33 quando aplicável.
 */
function reduceNumber(num: number, keepMaster = true): number {
  if (keepMaster && (num === 11 || num === 22 || num === 33)) {
    return num;
  }
  
  while (num > 9) {
    if (keepMaster && (num === 11 || num === 22 || num === 33)) {
      return num;
    }
    num = num.toString().split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  
  return num || 1;
}

/**
 * Remove acentos e caracteres especiais para cálculo das letras.
 */
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

/**
 * Função principal para geração de dados do Mapa Cabalístico.
 */
export function generateMapData(fullName: string, birthDate: string): CabalisticMapData {
  const cleanName = normalizeText(fullName);
  
  // Parse birth date (espera formato YYYY-MM-DD ou DD/MM/YYYY)
  let year = 1990, month = 1, day = 1;
  if (birthDate.includes('-')) {
    const parts = birthDate.split('-');
    year = parseInt(parts[0], 10) || 1990;
    month = parseInt(parts[1], 10) || 1;
    day = parseInt(parts[2], 10) || 1;
  } else if (birthDate.includes('/')) {
    const parts = birthDate.split('/');
    day = parseInt(parts[0], 10) || 1;
    month = parseInt(parts[1], 10) || 1;
    year = parseInt(parts[2], 10) || 1990;
  }

  const formattedBirthDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

  // 1. Número de Destino (Caminho de Vida)
  const sumDateDigits = `${day}${month}${year}`.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  const destino = reduceNumber(sumDateDigits);

  // 2. Número de Expressão (Nome Completo)
  let sumExpressao = 0;
  let sumAlma = 0;
  let sumPersonalidade = 0;

  for (const char of cleanName) {
    const val = KABBALAH_LETTER_VALUES[char] || 0;
    sumExpressao += val;
    if (VOWELS.has(char)) {
      sumAlma += val;
    } else {
      sumPersonalidade += val;
    }
  }

  const expressao = reduceNumber(sumExpressao);
  const alma = reduceNumber(sumAlma);
  const personalidade = reduceNumber(sumPersonalidade);

  // 3. Número de Missão (Destino + Expressão)
  const missao = reduceNumber(destino + expressao, false);

  // 4. Ano Pessoal Atual
  const currentYear = new Date().getFullYear();
  const anoPessoalSum = day + month + currentYear.toString().split('').reduce((a, b) => a + parseInt(b, 10), 0);
  const anoPessoal = reduceNumber(anoPessoalSum, false);

  // Elementos e Arcanos associados
  const elements = ["Fogo (Iniciativa & Paixão)", "Terra (Estrutura & Estabilidade)", "Ar (Intelecto & Comunicação)", "Água (Intuição & Sensibilidade)"];
  const element = elements[destino % elements.length];

  const arcanos = [
    "Arcanjo Miguel (Proteção e Força)",
    "Arcanjo Gabriel (Clareza e Comunicação)",
    "Arcanjo Rafael (Cura e Harmonia)",
    "Arcanjo Uriel (Sabedoria e Iluminação)",
    "Arcanjo Metatron (Transformação Espiritual)"
  ];
  const arcanoAnjo = arcanos[expressao % arcanos.length];

  const salmos = ["Salmo 23 (Abundância)", "Salmo 91 (Proteção Divina)", "Salmo 121 (Amparo)", "Salmo 27 (Luz e Coragem)", "Salmo 46 (Refúgio)"];
  const salmoProtecao = salmos[alma % salmos.length];

  // Dicionário de interpretações vibracionais para o MVP
  const destinoTexts: Record<number, string> = {
    1: "O seu Número de Destino é 1. Você traz a vibração da liderança, da inovação e da independência. Seu caminho é abrir caminhos novos e confiar na sua individualidade.",
    2: "O seu Número de Destino é 2. Sua energia vibra na diplomacia, parceria e sensibilidade. Você é um pacificador nato que conecta pessoas e harmoniza ambientes.",
    3: "O seu Número de Destino é 3. A criatividade, a autoexpressão e o otimismo guiam a sua jornada. Seu propósito é inspirar e comunicar alegria ao mundo.",
    4: "O seu Número de Destino é 4. Você vibra na estabilidade, disciplina e construção sólida. Seu dom é transformar ideias em estruturas reais e duradouras.",
    5: "O seu Número de Destino é 5. A liberdade, a adaptabilidade e o magnetismo são suas marcas. Seu caminho envolve constantes transformações e aprendizados práticos.",
    6: "O seu Número de Destino é 6. A vibração do amor familiar, da responsabilidade e da cura direcionam sua vida. Você busca trazer beleza e acolhimento.",
    7: "O seu Número de Destino é 7. O buscador da verdade, da sabedoria mística e do autoconhecimento. Sua jornada exige interiorização e análise profunda.",
    8: "O seu Número de Destino é 8. O poder da manifestação material, da justiça e do discernimento. Você veio para dominar a matéria com integridade.",
    9: "O seu Número de Destino é 9. A compaixão universal e a sabedoria acumulada. Seu destino é servir à humanidade e encerrar ciclos de vida com elevando o ambiente.",
    11: "O seu Número de Destino é Mestre 11. O canal de intuição e iluminação. Você possui uma antena espiritual elevada para guiar outros.",
    22: "O seu Número de Destino é Mestre 22. O grande construtor do mundo. Capacidade de realizar projetos de impacto em escala global.",
    33: "O seu Número de Destino é Mestre 33. A mestre da compaixão e cura espiritual suprema."
  };

  const expressaoTexts: Record<number, string> = {
    1: "Sua Expressão 1 destaca determinação visível, autoconfiança e atitude de pioneiro.",
    2: "Sua Expressão 2 demonstra gentileza, capacidade de escuta e grande inteligência emocional.",
    3: "Sua Expressão 3 confere carisma magnético, facilidade com as palavras e magnetismo social.",
    4: "Sua Expressão 4 reflete confiabilidade, método minucioso e ética de trabalho inabalável.",
    5: "Sua Expressão 5 mostra energia vibrante, mente rápida e paixão pelo desconhecido.",
    6: "Sua Expressão 6 transmite acolhimento imediato, senso estético apurado e generosidade.",
    7: "Sua Expressão 7 passa a impressão de mistério, intelectualidade elegante e perspicácia.",
    8: "Sua Expressão 8 inspira autoridade, foco em resultados e capacidade executiva.",
    9: "Sua Expressão 9 exala sabedoria, empatia genuína e visão ampla sem preconceitos.",
    11: "Sua Expressão 11 transmite magnetismo inspirador e visão além do tempo presente.",
    22: "Sua Expressão 22 mostra praticidade genial acompanhada de objetivos grandiosos.",
    33: "Sua Expressão 33 vibra em amor incondicional e altruísmo radiante."
  };

  const almaTexts: Record<number, string> = {
    1: "Sua Alma busca a independência absoluta e a satisfação de criar algo próprio.",
    2: "Sua Alma deseja paz interior, relacionamentos profundos e comunhão amorosa.",
    3: "Sua Alma anseia por alegria, liberdade criativa e celebração da vida.",
    4: "Sua Alma exige segurança, ordem e a certeza de um futuro planejado.",
    5: "Sua Alma busca experiências intensas, viagens e expansão sem amarras.",
    6: "Sua Alma vibra quando pode proteger, cuidar e harmonizar o seu lar.",
    7: "Sua Alma necessita de momentos de solitude, estudo e conexão espiritual.",
    8: "Sua Alma almeja o reconhecimento, a prosperidade e a maestria financeira.",
    9: "Sua Alma deseja contribuir para o bem coletivo e ver um mundo mais justo.",
    11: "Sua Alma anseia por despertar espiritual profundo e transmissão de conhecimento.",
    22: "Sua Alma quer deixar um legado duradouro para as futuras gerações.",
    33: "Sua Alma busca ser a manifestação viva da compaixão e do serviço."
  };

  const personalidadeTexts: Record<number, string> = {
    1: "Como as pessoas te veem: Uma pessoa firme, decidida e pronta para agir.",
    2: "Como as pessoas te veem: Alguém compreensivo, calmo e de boa convivência.",
    3: "Como as pessoas te veem: Expressivo, divertido, expansivo e envolvente.",
    4: "Como as pessoas te veem: Centrado, prático, pontual e muito sério.",
    5: "Como as pessoas te veem: Dinâmico, jovem de espírito e sempre pronto para mudanças.",
    6: "Como as pessoas te veem: Elegante, protetor e responsável pelas causas comuns.",
    7: "Como as pessoas te veem: Reservado, observador, profundo e analítico.",
    8: "Como as pessoas te veem: Forte, prático, bem-sucedido e líder nato.",
    9: "Como as pessoas te veem: Compreensivo, maduro e amigo de todas as horas.",
    11: "Como as pessoas te veem: Inspirador, intuitivo e com um brilho especial.",
    22: "Como as pessoas te veem: Capaz de realizar coisas difíceis com aparente facilidade.",
    33: "Como as pessoas te veem: Um verdadeiro porto seguro de sabedoria e amor."
  };

  const missaoTexts: Record<number, string> = {
    1: "Sua Missão é abrir caminhos e motivar pessoas a encontrarem sua própria força.",
    2: "Sua Missão é unificar contrários e trazer equilíbrio através do diálogo.",
    3: "Sua Missão é alegrar o mundo através da arte, comunicação e entusiasmo.",
    4: "Sua Missão é organizar o caos e construir fundações sólidas para a sociedade.",
    5: "Sua Missão é quebrar estagnações e ensinar a beleza da transformação contínua.",
    6: "Sua Missão é curar relacionamentos e promover a harmonia nos ambientes familiar e social.",
    7: "Sua Missão é pesquisar o invisível e trazer verdades profundas à luz da razão.",
    8: "Sua Missão é gerar riqueza com propósito e equilibrar o espiritual com o material.",
    9: "Sua Missão é ensinar o desapego saudável e a compaixão incondicional.",
    11: "Sua Missão é elevar a consciência coletiva e ser um farol de intuição.",
    22: "Sua Missão é manifestar sonhos em obras tangíveis de grande relevância.",
    33: "Sua Missão é elevar o padrão de amor e cuidado humano através do exemplo."
  };

  const anoPessoalTexts: Record<number, string> = {
    1: "Ano Pessoal 1: Ano de novos começos, plantio de sementes, coragem e inovação.",
    2: "Ano Pessoal 2: Ano de paciência, consolidação de parcerias e ritmo suave.",
    3: "Ano Pessoal 3: Ano de expansão social, criatividade, comunicação e boa sorte.",
    4: "Ano Pessoal 4: Ano de trabalho duro, foco na saúde e estruturação financeira.",
    5: "Ano Pessoal 5: Ano de mudanças rápidas, viagens, novos contatos e flexibilidade.",
    6: "Ano Pessoal 6: Ano voltado para a família, lar, relacionamentos afetivos e deveres.",
    7: "Ano Pessoal 7: Ano de reflexão, estudos, retiro espiritual e aprimoramento interno.",
    8: "Ano Pessoal 8: Ano de colheita financeira, reconhecimento profissional e justiça.",
    9: "Ano Pessoal 9: Ano de encerramentos, limpeza, perdoar o passado e renovação."
  };

  return {
    methodologyNote: "[DEMONSTRAÇÃO TÉCNICA - MVP CABALÍSTICO] Metodologia base configurada com sucesso.",
    calculatedAt: new Date().toISOString(),
    userInfo: {
      fullName,
      birthDate,
      formattedBirthDate
    },
    numbers: {
      destino,
      expressao,
      alma,
      personalidade,
      missao,
      anoPessoal
    },
    element,
    arcanoAnjo,
    salmoProtecao,
    interpretations: {
      title: `Mapa Cabalístico Pessoal de ${fullName}`,
      subtitle: `Análise Vibracional Gerada para Nascidos em ${formattedBirthDate}`,
      summary: `Através da análise da Gematria Cabalística aplicada ao seu nome e da redução sagrada da sua data de nascimento, identificamos a chave vibracional que rege seus caminhos.`,
      destinoText: destinoTexts[destino] || destinoTexts[1],
      expressaoText: expressaoTexts[expressao] || expressaoTexts[1],
      almaText: almaTexts[alma] || almaTexts[1],
      personalidadeText: personalidadeTexts[personalidade] || personalidadeTexts[1],
      missaoText: missaoTexts[missao] || missaoTexts[1],
      anoPessoalText: anoPessoalTexts[anoPessoal] || anoPessoalTexts[1],
      desafios: [
        `Desafio da Ansiedade por Resultados (associado à transição do ano pessoal ${anoPessoal}).`,
        `Necessidade de manter equilíbrio entre a energia de Alma (${alma}) e Personalidade (${personalidade}).`,
        `Atenção para não reprimir intuições místicas nas escolhas cotidianas.`
      ],
      recomendacoes: [
        `Medite diariamente mentalizando a luz do seu Arcanjo de regência: ${arcanoAnjo}.`,
        `Recite o ${salmoProtecao} nos momentos de decisão importante.`,
        `Aproveite as energias do elemento ${element} para recarregar sua vitalidade física.`
      ]
    }
  };
}
