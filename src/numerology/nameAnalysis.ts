import {
  normalizeName,
  getLetterReducedValue,
  isVowel
} from './alphabetTable';
import { reduceNumber } from './reduction';
import { DistributionData, LifeTriangleData, TriangleRow } from '../types/numerology';

export interface NameAnalysisResult {
  motivacao: number;
  impressao: number;
  expressao: number;
  distribution: DistributionData;
  lifeTriangle: LifeTriangleData;
}

/**
 * Realiza toda a análise numerológica do nome completo de nascimento.
 */
export function analyzeName(fullName: string): NameAnalysisResult {
  const cleanName = normalizeName(fullName);

  let sumVowels = 0;
  let sumConsonants = 0;
  let sumAll = 0;

  const occurrences: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  };

  const nameReducedValues: number[] = [];

  for (let i = 0; i < cleanName.length; i++) {
    const char = cleanName[i];
    const val = getLetterReducedValue(char);
    nameReducedValues.push(val);

    sumAll += val;
    if (val >= 1 && val <= 9) {
      occurrences[val] = (occurrences[val] || 0) + 1;
    }

    if (isVowel(char)) {
      sumVowels += val;
    } else {
      sumConsonants += val;
    }
  }

  // Indicadores
  const motivacao = reduceNumber(sumVowels);
  const impressao = reduceNumber(sumConsonants);
  const expressao = reduceNumber(sumAll);

  // Distribuição numérica
  const repetitions: number[] = [];
  const absences: number[] = [];
  let maxCount = 0;

  for (let num = 1; num <= 9; num++) {
    const count = occurrences[num] || 0;
    if (count >= 3) {
      repetitions.push(num);
    }
    if (count === 0) {
      absences.push(num);
    }
    if (count > maxCount) {
      maxCount = count;
    }
  }

  const predominances: number[] = [];
  if (maxCount > 0) {
    for (let num = 1; num <= 9; num++) {
      if (occurrences[num] === maxCount) {
        predominances.push(num);
      }
    }
  }

  const distribution: DistributionData = {
    occurrences,
    repetitions,
    absences,
    predominances
  };

  // Cálculo do Triângulo da Vida
  const lifeTriangle = calculateLifeTriangle(nameReducedValues);

  return {
    motivacao,
    impressao,
    expressao,
    distribution,
    lifeTriangle
  };
}

/**
 * Calcula o Triângulo da Vida:
 * Regra Matemática:
 * - A 1ª linha contém os números reduzidos (1..9) de cada letra do nome.
 * - Cada linha subsequente é gerada somando pares adjacentes da linha anterior e reduzindo (sem mestre na base intermediária).
 * - O processo repete até que reste um único número no vértice inferior.
 * - Limita a no máximo 9 linhas para manter boa legibilidade visual e performance.
 */
function calculateLifeTriangle(initialValues: number[]): LifeTriangleData {
  if (!initialValues || initialValues.length === 0) {
    return {
      rows: [{ level: 1, numbers: [1] }],
      baseVertex: 1,
      description: 'Triângulo da Vida padrão gerado por nome em branco.'
    };
  }

  // Para nomes muito curtos ou muito longos, trunca ou ajusta
  const firstRow = initialValues.slice(0, 15); // limita a 15 letras para renderização elegante no PDF/UI
  const rows: TriangleRow[] = [{ level: 1, numbers: firstRow }];

  let currentRow = [...firstRow];
  let currentLevel = 1;

  while (currentRow.length > 1 && currentLevel < 9) {
    const nextRow: number[] = [];
    for (let i = 0; i < currentRow.length - 1; i++) {
      const pairSum = currentRow[i] + currentRow[i + 1];
      const reducedPair = reduceNumber(pairSum, false); // redução estrita sem mestre no corpo do triângulo
      nextRow.push(reducedPair);
    }
    currentLevel++;
    rows.push({ level: currentLevel, numbers: nextRow });
    currentRow = nextRow;
  }

  const baseVertex = currentRow[currentRow.length - 1] || 1;

  return {
    rows,
    baseVertex,
    description: `O Triângulo da Vida condensa a vibração alfabética até o vértice ${baseVertex}, indicando a síntese energética da expressão do nome.`
  };
}
