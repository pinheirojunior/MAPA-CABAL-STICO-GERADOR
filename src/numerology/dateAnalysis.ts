import { reduceNumber } from './reduction';
import { CycleInfo, ChallengeInfo, PersonalYearInfo } from '../types/numerology';

export interface DateAnalysisResult {
  day: number;
  month: number;
  year: number;
  destino: number;
  cycles: CycleInfo[];
  challenges: ChallengeInfo[];
  personalYear: PersonalYearInfo;
}

/**
 * Realiza a análise numerológica completa da data de nascimento.
 */
export function analyzeDate(birthDate: string): DateAnalysisResult {
  let day = 1, month = 1, year = 1990;

  if (birthDate) {
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
  }

  // 1. Destino (Dia + Mês + Ano)
  const dayReduced = reduceNumber(day);
  const monthReduced = reduceNumber(month);
  const yearSum = year.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  const yearReduced = reduceNumber(yearSum);

  const destino = reduceNumber(dayReduced + monthReduced + yearReduced);

  // 2. Os Três Ciclos Principais de Vida
  // Ciclo 1: Formativo (Mês) - ~0 a 28 anos
  // Ciclo 2: Produtivo (Dia) - ~28 a 56 anos
  // Ciclo 3: Colheita (Ano) - ~56 anos em diante
  const cycle1Val = reduceNumber(month);
  const cycle2Val = reduceNumber(day);
  const cycle3Val = reduceNumber(yearSum);

  const cycles: CycleInfo[] = [
    {
      cycleNumber: 1,
      value: cycle1Val,
      period: 'Primeiro Ciclo (Formativo)',
      ageRange: '0 a 28 anos',
      title: `Ciclo Formativo - Vibração ${cycle1Val}`,
      symbolicInterpretation: `Período inicial focado na construção da identidade, aprendizados familiares e assimilação dos valores do Mês ${month}.`
    },
    {
      cycleNumber: 2,
      value: cycle2Val,
      period: 'Segundo Ciclo (Produtivo)',
      ageRange: '28 a 56 anos',
      title: `Ciclo Produtivo - Vibração ${cycle2Val}`,
      symbolicInterpretation: `Fase central da vida caracterizada pela busca de realizações pessoais, construção de carreira e maturidade sob regência do Dia ${day}.`
    },
    {
      cycleNumber: 3,
      value: cycle3Val,
      period: 'Terceiro Ciclo (Maturidade / Colheita)',
      ageRange: '56 anos em diante',
      title: `Ciclo da Colheita - Vibração ${cycle3Val}`,
      symbolicInterpretation: `Período de consolidação da sabedoria acumulada, síntese espiritual e legado sob influência do Ano ${year}.`
    }
  ];

  // 3. Os Três Desafios Numerológicos
  const ch1Raw = Math.abs(monthReduced - dayReduced);
  const challenge1Val = reduceNumber(ch1Raw, false);

  const ch2Raw = Math.abs(dayReduced - yearReduced);
  const challenge2Val = reduceNumber(ch2Raw, false);

  const mainChRaw = Math.abs(challenge1Val - challenge2Val);
  const mainChallengeVal = reduceNumber(mainChRaw, false);

  const challenges: ChallengeInfo[] = [
    {
      challengeType: 'Primeiro Desafio',
      value: challenge1Val,
      title: `Desafio da Juventude - Vibração ${challenge1Val}`,
      meaning: `Aprender a lidar com os conflitos emocionais e impulsos das fases iniciais.`,
      learnings: [
        'Desenvolver flexibilidade e paciência',
        'Evitar reações precipitadas',
        'Cultivar a autoconfiança'
      ]
    },
    {
      challengeType: 'Segundo Desafio',
      value: challenge2Val,
      title: `Desafio da Maturidade - Vibração ${challenge2Val}`,
      meaning: `Equilibrar ambições profissionais com estabilidade interna e inteligência emocional.`,
      learnings: [
        'Estabelecer limites saudáveis',
        'Fortalecer a resiliência em momentos de mudança',
        'Manter o foco nos objetivos de longo prazo'
      ]
    },
    {
      challengeType: 'Desafio Principal',
      value: mainChallengeVal,
      title: `Desafio Maior de Vida - Vibração ${mainChallengeVal}`,
      meaning: `O grande aprendizado central que atravessa todas as fases da existência.`,
      learnings: [
        'Transformar fragilidades em fortalezas conscientes',
        'Buscar harmonia constante entre razão e intuição',
        'Superar padrões de repetição'
      ]
    }
  ];

  // 4. Ano Pessoal
  const currentYear = new Date().getFullYear();
  const currentYearSum = currentYear.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  const anoPessoalVal = reduceNumber(dayReduced + monthReduced + reduceNumber(currentYearSum), false);

  const personalYearThemes: Record<number, { theme: string; text: string }> = {
    1: {
      theme: 'Novos Começos e Iniciativa',
      text: 'Momento ideal para plantar novas sementes, iniciar projetos, tomar decisões corajosas e liderar sua própria caminhada.'
    },
    2: {
      theme: 'Paciência, Parcerias e Cooperação',
      text: 'Fase de consolidação, fortalecimento de laços afetivos e escuta atenta. Momento de germinação suave do que foi plantado.'
    },
    3: {
      theme: 'Expressão, Criatividade e Expansão',
      text: 'Ano de comunicação fluida, otimismo, contatos sociais enriquecedores e alegria no desenvolvimento de talentos.'
    },
    4: {
      theme: 'Estruturação, Trabalho e Organização',
      text: 'Período focado em construir bases sólidas, organizar finanças, cuidar da saúde e cultivar a disciplina.'
    },
    5: {
      theme: 'Transformação, Liberdade e Mudanças',
      text: 'Ano dinâmico com oportunidades de renovação, viagens, quebra de rotinas estagnadas e novos aprendizados.'
    },
    6: {
      theme: 'Harmonia Familiar, Amor e Responsabilidade',
      text: 'Fase voltada para o acolhimento do lar, ajustes em relacionamentos e busca por beleza e equilíbrio interno.'
    },
    7: {
      theme: 'Autoconhecimento, Estudo e Solitude',
      text: 'Período de reflexão profunda, aprimoramento espiritual, estudos e escuta da intuição mística.'
    },
    8: {
      theme: 'Prosperidade, Justiça e Colheita Material',
      text: 'Ano de colheita dos frutos do trabalho, conquistas financeiras, equilíbrio de poder e autoridade consciente.'
    },
    9: {
      theme: 'Encerramentos, Desapego e Renovação',
      text: 'Fase de conclusão de ciclos, descarte do desnecessário, compaixão e preparação para o novo nascimento numérico.'
    }
  };

  const currentTheme = personalYearThemes[anoPessoalVal] || personalYearThemes[1];

  const personalYear: PersonalYearInfo = {
    yearNumber: anoPessoalVal,
    currentYear,
    theme: currentTheme.theme,
    interpretation: currentTheme.text
  };

  return {
    day,
    month,
    year,
    destino,
    cycles,
    challenges,
    personalYear
  };
}
