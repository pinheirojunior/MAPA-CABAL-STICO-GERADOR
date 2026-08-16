/**
 * Utilitários de Validação, Sanitização e Segurança para Produção
 */
import path from 'path';

// Regex de identificadores seguros (sem caracteres de path traversal, SQL injection ou comando)
export const SAFE_ID_REGEX = /^[A-Za-z0-9_\-]{3,100}$/;

// Regex de data de nascimento (DD/MM/AAAA ou AAAA-MM-DD)
export const SAFE_DATE_REGEX = /^(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})$/;

/**
 * Valida se um identificador é seguro contra Path Traversal e Injection
 */
export function isValidIdentifier(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  return SAFE_ID_REGEX.test(id.trim());
}

/**
 * Sanitiza e valida o nome do consulente
 */
export function sanitizeAndValidateName(name: unknown): { valid: boolean; name: string; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, name: '', error: 'Nome é obrigatório.' };
  }
  const clean = name
    .trim()
    .replace(/[<>'"`;\\]/g, '') // remove caracteres perigosos
    .replace(/\s+/g, ' ');

  if (clean.length < 2) {
    return { valid: false, name: clean, error: 'Nome deve ter pelo menos 2 caracteres.' };
  }
  if (clean.length > 120) {
    return { valid: false, name: clean.substring(0, 120), error: 'Nome muito longo (máximo 120 caracteres).' };
  }
  return { valid: true, name: clean };
}

/**
 * Valida o formato da data de nascimento
 */
export function validateBirthDate(birthDate: unknown): { valid: boolean; birthDate: string; error?: string } {
  if (!birthDate || typeof birthDate !== 'string') {
    return { valid: false, birthDate: '', error: 'Data de nascimento é obrigatória.' };
  }
  const clean = birthDate.trim();
  if (!SAFE_DATE_REGEX.test(clean)) {
    return { valid: false, birthDate: clean, error: 'Formato de data inválido. Utilize DD/MM/AAAA.' };
  }
  return { valid: true, birthDate: clean };
}

/**
 * Valida se um caminho de arquivo de PDF está contido estritamente dentro do diretório permitido de PDFs
 */
export function isPathInsideDir(targetPath: string, allowedDir: string): boolean {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedAllowed = path.resolve(allowedDir);
  return resolvedTarget.startsWith(resolvedAllowed + path.sep) || resolvedTarget === resolvedAllowed;
}
