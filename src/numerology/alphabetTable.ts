/**
 * Tabela alfabética do MÉTODO NUMEROLÓGICO PRÓPRIO (MVP MAPA CABALÍSTICO IA)
 * 
 * Regra de mapeamento de letras de A a Z:
 * 1=A, 2=B, 3=C, 4=D, 5=E, 6=F, 7=G, 8=H, 9=I
 * 10=J, 11=K, 12=L, 13=M, 14=N, 15=O, 16=P, 17=Q, 18=R, 19=S
 * 20=T, 21=U, 22=V, 23=W, 24=X, 25=Y, 26=Z
 * 
 * Para redução numerológica de cada letra:
 * J=1, K=2, L=3, M=4, N=5, O=6, P=7, Q=8, R=9, S=1, T=2, U=3, V=4, W=5, X=6, Y=7, Z=8
 */

export const ALPHABET_VALUES: Record<string, number> = {
  A: 1,  B: 2,  C: 3,  D: 4,  E: 5,  F: 6,  G: 7,  H: 8,  I: 9,
  J: 10, K: 11, L: 12, M: 13, N: 14, O: 15, P: 16, Q: 17, R: 18, S: 19,
  T: 20, U: 21, V: 22, W: 23, X: 24, Y: 25, Z: 26
};

// Mapeamento reduzido direto (1 a 9) para consulta rápida por letra
export const REDUCED_LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};

export const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

/**
 * Normaliza uma string de nome removendo acentos, cedilhas, caracteres especiais e números.
 * Converte para maiúsculas sem alterar o valor semântico das letras.
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toUpperCase()
    .replace(/[^A-Z]/g, ''); // Garante somente A-Z sem espaços ou pontuações
}

/**
 * Retorna o valor bruto (1..26) de uma letra.
 */
export function getLetterRawValue(letter: string): number {
  const char = letter.toUpperCase();
  return ALPHABET_VALUES[char] || 0;
}

/**
 * Retorna o valor reduzido (1..9) de uma letra.
 */
export function getLetterReducedValue(letter: string): number {
  const char = letter.toUpperCase();
  return REDUCED_LETTER_VALUES[char] || 0;
}

/**
 * Verifica se o caractere é uma vogal (incluindo Y conforme convenção do motor).
 */
export function isVowel(letter: string): boolean {
  return VOWELS.has(letter.toUpperCase());
}
