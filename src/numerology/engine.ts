import { analyzeName } from './nameAnalysis';
import { analyzeDate } from './dateAnalysis';
import { reduceNumber } from './reduction';
import { normalizeName } from './alphabetTable';
import { EngineOutput } from '../types/numerology';

/**
 * MOTOR NUMEROLÓGICO DETERMINÍSTICO (MÉTODO NUMEROLÓGICO PRÓPRIO)
 * 
 * Este módulo é o único responsável pelos cálculos do MAPA CABALÍSTICO IA.
 * Ele garante resultados 100% determinísticos para o mesmo nome e mesma data de nascimento.
 * A IA NÃO PODE alterar nem re-calcular nenhum dos números emitidos por este motor.
 */
export function numerologyEngine(fullName: string, birthDate: string): EngineOutput {
  const normalizedName = normalizeName(fullName);
  const nameAnalysis = analyzeName(fullName);
  const dateAnalysis = analyzeDate(birthDate);

  // Missão = Expressão + Destino
  // Regra do MVP: Soma dos valores de Expressão e Destino com redução e preservação de mestres
  const missao = reduceNumber(nameAnalysis.expressao + dateAnalysis.destino);

  return {
    inputs: {
      fullName: fullName ? fullName.trim() : '',
      birthDate: birthDate ? birthDate.trim() : '',
      normalizedName,
      day: dateAnalysis.day,
      month: dateAnalysis.month,
      year: dateAnalysis.year
    },
    indicators: {
      motivacao: nameAnalysis.motivacao,
      impressao: nameAnalysis.impressao,
      expressao: nameAnalysis.expressao,
      destino: dateAnalysis.destino,
      missao
    },
    nameAnalysis: {
      distribution: nameAnalysis.distribution,
      lifeTriangle: nameAnalysis.lifeTriangle
    },
    dateAnalysis: {
      day: dateAnalysis.day,
      month: dateAnalysis.month,
      year: dateAnalysis.year,
      destino: dateAnalysis.destino,
      cycles: dateAnalysis.cycles,
      challenges: dateAnalysis.challenges,
      personalYear: dateAnalysis.personalYear
    },
    calculatedAt: new Date().toISOString()
  };
}
