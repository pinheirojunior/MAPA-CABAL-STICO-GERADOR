import { numerologyEngine } from '../numerology/engine';
import { generateInterpretation } from './interpretationService';
import { FullCabalisticMap } from '../types/numerology';

/**
 * SERVIÇO CONSTRUTOR DO MAPA CABALÍSTICO COMPLETO
 */
export async function buildFullCabalisticMap(fullName: string, birthDate: string): Promise<FullCabalisticMap> {
  const engineData = numerologyEngine(fullName, birthDate);
  const interpretation = await generateInterpretation(engineData);

  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const id = `MAP-${randomSuffix}`;

  return {
    id,
    createdAt: new Date().toISOString(),
    engineData,
    interpretation
  };
}
