/**
 * Regras de Redução Numerológica (MÉTODO NUMEROLÓGICO PRÓPRIO MAPA CABALÍSTICO IA)
 * 
 * Regra:
 * - Somar os dígitos de um número repetidamente até obter um valor entre 1 e 9.
 * - Preservar MESTRES (11, 22 e 33) se a soma intermediária atingir exatamente esses valores.
 * - Se `preserveMaster` for false, reduz mesmo que seja 11, 22 ou 33 (ex: para ano pessoal ou ciclos quando aplicável).
 */

export function reduceNumber(val: number, preserveMaster = true): number {
  if (isNaN(val) || val <= 0) return 1;

  if (preserveMaster && (val === 11 || val === 22 || val === 33)) {
    return val;
  }

  let current = val;
  while (current > 9) {
    if (preserveMaster && (current === 11 || current === 22 || current === 33)) {
      return current;
    }
    const digitsSum = current
      .toString()
      .split('')
      .reduce((acc, d) => acc + parseInt(d, 10), 0);

    current = digitsSum;
  }

  return current || 1;
}

/**
 * Soma um array de números inteiros e reduz preservando números mestres.
 */
export function sumAndReduce(numbers: number[], preserveMaster = true): number {
  const total = numbers.reduce((acc, n) => acc + n, 0);
  return reduceNumber(total, preserveMaster);
}
