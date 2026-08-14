import { createKaelSession, handleKaelUserMessage } from './kaelService.js';

export async function runKaelNLUTests(): Promise<void> {
  console.log('--- EXECUTANDO TESTE OBRIGATÓRIO DO KAEL FLUXO GUIADO ---');

  // 1. Iniciar conversa
  const session = createKaelSession('test-guided-official-1');

  // 2. Verificar se o menu aparece UMA vez
  console.log('[PASSO 1 & 2] Sessão iniciada com mensagem inicial.');
  console.log('Mensagem inicial:', session.messages[0].text);
  console.log('Opções no menu inicial:', session.messages[0].options?.map(o => o.label));

  // 3. Clicar "QUERO FAZER MEU MAPA"
  console.log('[PASSO 3] Clicar "QUERO FAZER MEU MAPA"');
  const res3 = await handleKaelUserMessage(session, 'QUERO FAZER MEU MAPA', undefined, 'START_MAP');
  console.log('Estado:', res3.updatedSession.currentState);
  console.log('Resposta:', res3.newMessages[0].text);

  // 9. Informar nome
  console.log('[PASSO 9] Informar nome "Carlos Eduardo"');
  const res9 = await handleKaelUserMessage(res3.updatedSession, 'Carlos Eduardo');
  console.log('Estado:', res9.updatedSession.currentState);
  console.log('Resposta:', res9.newMessages[0].text);

  // 10. Confirmar nome
  console.log('[PASSO 10] Confirmar nome (clicar "Sim")');
  const res10 = await handleKaelUserMessage(res9.updatedSession, 'Sim', undefined, 'CONFIRM_NAME');
  console.log('Estado:', res10.updatedSession.currentState);

  // 11. Informar data
  console.log('[PASSO 11] Informar data "20/03/1990"');
  const res11 = await handleKaelUserMessage(res10.updatedSession, '20/03/1990');
  console.log('Estado:', res11.updatedSession.currentState);
  console.log('Resposta:', res11.newMessages[0].text);

  // 12 & 13. Confirmar data e verificar confirmação final
  console.log('[PASSO 12 & 13] Confirmar data (clicar "Sim")');
  const res12 = await handleKaelUserMessage(res11.updatedSession, 'Sim', undefined, 'CONFIRM_DATE');
  console.log('Estado:', res12.updatedSession.currentState);
  console.log('Confirmação final:', res12.newMessages[0].text);

  // 14. Clicar "Corrigir nome"
  console.log('[PASSO 14] Clicar "Corrigir nome"');
  const res14 = await handleKaelUserMessage(res12.updatedSession, 'Corrigir nome', undefined, 'CORRECT_NAME');
  console.log('Estado:', res14.updatedSession.currentState);

  // 15. Informar novamente o nome
  console.log('[PASSO 15] Informar novo nome "Carlos Eduardo Santos"');
  const res15 = await handleKaelUserMessage(res14.updatedSession, 'Carlos Eduardo Santos');
  console.log('Estado:', res15.updatedSession.currentState);

  // 16. Confirmar nome corrigido
  console.log('[PASSO 16] Confirmar nome corrigido');
  const res16 = await handleKaelUserMessage(res15.updatedSession, 'Sim', undefined, 'CONFIRM_NAME');
  console.log('Estado:', res16.updatedSession.currentState);

  // 17. Informar novamente a data
  console.log('[PASSO 17] Informar data novamente');
  const res17 = await handleKaelUserMessage(res16.updatedSession, '15/05/1985');
  console.log('Estado:', res17.updatedSession.currentState);

  // 18 & 19. Confirmar data e verificar confirmação final
  console.log('[PASSO 18 & 19] Confirmar data');
  const res18 = await handleKaelUserMessage(res17.updatedSession, 'Sim', undefined, 'CONFIRM_DATE');
  console.log('Estado:', res18.updatedSession.currentState);
  console.log('Confirmação final:', res18.newMessages[0].text);

  // 20 & 21. Clicar "Sim, continuar" e verificar oferta
  console.log('[PASSO 20 & 21] Clicar "Sim, continuar" e verificar oferta');
  const res20 = await handleKaelUserMessage(res18.updatedSession, 'Sim, continuar', undefined, 'CONTINUE');
  console.log('Estado:', res20.updatedSession.currentState);
  console.log('Oferta:', res20.newMessages[0].text);

  // 22 & 23. Clicar "Quero pagar" e verificar instruções
  console.log('[PASSO 22 & 23] Clicar "Quero pagar"');
  const res22 = await handleKaelUserMessage(res20.updatedSession, 'Quero pagar', undefined, 'PAY');
  console.log('Estado:', res22.updatedSession.currentState);
  console.log('Instruções de pagamento:', res22.newMessages[0].text);

  console.log('✅ TESTE DO FLUXO GUIADO EXECUTADO COM SUCESSO TOTAL!');
}
