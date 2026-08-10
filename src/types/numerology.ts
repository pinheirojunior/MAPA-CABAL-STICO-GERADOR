/**
 * Tipos e interfaces fundamentais do MAPA CABALÍSTICO IA
 */

export interface NumberMeaning {
  number: number;
  title: string;
  centralMeaning: string;
  characteristics: string[];
  potentials: string[];
  challenges: string[];
  positiveAspects: string[];
  imbalanceAspects: string[];
  relationships: string;
  communication: string;
  work: string;
  personalDevelopment: string;
}

export interface TriangleRow {
  level: number;
  numbers: number[];
}

export interface LifeTriangleData {
  rows: TriangleRow[];
  baseVertex: number;
  description: string;
}

export interface DistributionData {
  occurrences: Record<number, number>; // 1 -> count, 2 -> count, ... 9 -> count
  repetitions: number[];               // números com frequência >= 3
  absences: number[];                  // números com 0 ocorrências
  predominances: number[];             // número(s) com maior contagem
}

export interface CycleInfo {
  cycleNumber: number;
  value: number;
  period: string;
  ageRange: string;
  title: string;
  symbolicInterpretation: string;
}

export interface ChallengeInfo {
  challengeType: string; // "Primeiro Desafio", "Segundo Desafio", "Desafio Principal"
  value: number;
  title: string;
  meaning: string;
  learnings: string[];
}

export interface PersonalYearInfo {
  yearNumber: number;
  currentYear: number;
  theme: string;
  interpretation: string;
}

export interface EngineOutput {
  inputs: {
    fullName: string;
    birthDate: string; // YYYY-MM-DD
    normalizedName: string;
    day: number;
    month: number;
    year: number;
  };
  indicators: {
    motivacao: number;  // Vogais
    impressao: number;  // Consoantes
    expressao: number;  // Todas as letras
    destino: number;    // Dia + Mês + Ano
    missao: number;     // Expressão + Destino
  };
  nameAnalysis: {
    distribution: DistributionData;
    lifeTriangle: LifeTriangleData;
  };
  dateAnalysis: {
    day: number;
    month: number;
    year: number;
    destino: number;
    cycles: CycleInfo[];
    challenges: ChallengeInfo[];
    personalYear: PersonalYearInfo;
  };
  calculatedAt: string;
}

export interface LifeAreaInterpretation {
  areaName: string;
  associatedNumber: number;
  text: string;
}

export interface CrossingInterpretation {
  title: string;
  numbersCombined: string;
  text: string;
}

export interface MapInterpretation {
  introducao: {
    cartaAbertura: string;
    oQueE: string;
    comoInterpretar: string;
    metodologia: string;
  };
  indicadoresTexto: {
    motivacaoText: string;
    impressaoText: string;
    expressaoText: string;
    destinoText: string;
    missaoText: string;
  };
  nomeEData: {
    distribuicaoText: string;
    trianguloText: string;
    dataIntegradaText: string;
  };
  desafiosECiclos: {
    desafiosTexto: string;
    ciclosTexto: string;
    anoPessoalTexto: string;
  };
  lifeAreas: LifeAreaInterpretation[];
  crossings: CrossingInterpretation[];
  sinteseFinal: {
    leituraIntegrada: string;
    potenciaisDestacados: string[];
    desafiosPrincipais: string[];
    reflexoesFinais: string;
    metricasValor: string;
  };
  isAiGenerated: boolean;
}

export interface FullCabalisticMap {
  id: string;
  createdAt: string;
  engineData: EngineOutput;
  interpretation: MapInterpretation;
  pdfUrl?: string;
}
