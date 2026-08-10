import { numerologyEngine } from './engine';
import { normalizeName, getLetterRawValue, REDUCED_LETTER_VALUES } from './alphabetTable';
import { reduceNumber } from './reduction';

/**
 * TESTES DO MOTOR NUMEROLÓGICO
 * Executáveis via script de verificação do backend ou endpoint de diagnóstico.
 */
export function runEngineTests(): { passed: boolean; logs: string[] } {
  const logs: string[] = [];
  let passed = true;

  function assertEqual(actual: any, expected: any, message: string) {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      logs.push(`✅ PASS: ${message}`);
    } else {
      logs.push(`❌ FAIL: ${message} -> Esperado: ${JSON.stringify(expected)}, Recebido: ${JSON.stringify(actual)}`);
      passed = false;
    }
  }

  // Teste 1: Determinismo do mesmo nome e mesma data
  const res1 = numerologyEngine('Maria das Dores da Silva', '1995-03-12');
  const res2 = numerologyEngine('Maria das Dores da Silva', '1995-03-12');
  assertEqual(res1.indicators, res2.indicators, 'Resultados iguais para entradas idênticas');

  // Teste 2: Insensibilidade a acentos e espaços extras
  const resWithAccents = numerologyEngine('  María   dâs Dóres  da Sîlva ', '1995-03-12');
  assertEqual(resWithAccents.indicators, res1.indicators, 'Acentos e espaços extras não alteram os cálculos');

  // Teste 3: Verificação das regras de letras A=1, B=2 ... J=1, K=2, L=3...
  assertEqual(REDUCED_LETTER_VALUES['A'], 1, 'A = 1');
  assertEqual(REDUCED_LETTER_VALUES['I'], 9, 'I = 9');
  assertEqual(REDUCED_LETTER_VALUES['J'], 1, 'J = 1');
  assertEqual(REDUCED_LETTER_VALUES['S'], 1, 'S = 1');
  assertEqual(REDUCED_LETTER_VALUES['Z'], 8, 'Z = 8');

  // Teste 4: Preservação de números mestres (11, 22, 33)
  assertEqual(reduceNumber(11), 11, 'Redução preserva Mestre 11');
  assertEqual(reduceNumber(22), 22, 'Redução preserva Mestre 22');
  assertEqual(reduceNumber(33), 33, 'Redução preserva Mestre 33');
  assertEqual(reduceNumber(29), 11, '29 reduz para 2+9=11 -> Mestre 11');

  // Teste 5: Cálculo dos indicadores obrigatórios
  logs.push(`📊 Indicadores de teste para "Maria das Dores da Silva" (12/03/1995):`);
  logs.push(`   Motivação: ${res1.indicators.motivacao}`);
  logs.push(`   Impressão: ${res1.indicators.impressao}`);
  logs.push(`   Expressão: ${res1.indicators.expressao}`);
  logs.push(`   Destino: ${res1.indicators.destino}`);
  logs.push(`   Missão: ${res1.indicators.missao}`);

  return { passed, logs };
}
