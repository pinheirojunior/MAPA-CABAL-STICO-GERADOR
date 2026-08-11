import { interpretClientMessage, createKaelSession, handleKaelUserMessage } from './kaelService.js';

export async function runKaelNLUTests() {
  console.log('--- EXECUTANDO TESTES DE INTELIGÊNCIA E NLU DO KAEL ---');

  const baseSession = createKaelSession('test-session-1');

  // TESTE 1: Clarificação sobre acentos
  console.log('\n[TESTE 1] Cliente: "mas meu nome nao tem acento"');
  const t1 = await interpretClientMessage('mas meu nome nao tem acento', 'AGUARDANDO_NOME_DATA', baseSession);
  console.log('Intent:', t1.intent, '| fullName:', t1.fullName);
  if (t1.intent === 'CLARIFICATION' && t1.fullName === null) {
    console.log('✅ TESTE 1 PASSOU! (Não armazenou como nome)');
  } else {
    console.error('❌ TESTE 1 FALHOU!', t1);
  }

  // TESTE 2: Envio de Nome Apenas
  console.log('\n[TESTE 2] Cliente: "meu nome é João da Silva"');
  const t2 = await interpretClientMessage('meu nome é João da Silva', 'AGUARDANDO_NOME_DATA', baseSession);
  console.log('Intent:', t2.intent, '| fullName:', t2.fullName);
  if (t2.intent === 'NAME' && t2.fullName === 'João da Silva') {
    console.log('✅ TESTE 2 PASSOU! (Salvo como João da Silva)');
  } else {
    console.error('❌ TESTE 2 FALHOU!', t2);
  }

  // TESTE 3: Envio de Data Apenas
  console.log('\n[TESTE 3] Cliente: "nasci em 20/03/1990"');
  const t3 = await interpretClientMessage('nasci em 20/03/1990', 'AGUARDANDO_NOME_DATA', baseSession);
  console.log('Intent:', t3.intent, '| birthDate:', t3.birthDate?.formatted, '| fullName:', t3.fullName);
  if (t3.intent === 'BIRTH_DATE' && t3.birthDate?.formatted === '20/03/1990' && t3.fullName === null) {
    console.log('✅ TESTE 3 PASSOU! (Salvo apenas a data)');
  } else {
    console.error('❌ TESTE 3 FALHOU!', t3);
  }

  // TESTE 4: Envio de Nome e Data na mesma mensagem
  console.log('\n[TESTE 4] Cliente: "João da Silva 20/03/1990"');
  const t4 = await interpretClientMessage('João da Silva 20/03/1990', 'AGUARDANDO_NOME_DATA', baseSession);
  console.log('Intent:', t4.intent, '| fullName:', t4.fullName, '| birthDate:', t4.birthDate?.formatted);
  if (t4.intent === 'NAME_AND_BIRTH_DATE' && t4.fullName === 'João da Silva' && t4.birthDate?.formatted === '20/03/1990') {
    console.log('✅ TESTE 4 PASSOU! (Salvo nome e data)');
  } else {
    console.error('❌ TESTE 4 FALHOU!', t4);
  }

  // TESTE 5: Pergunta sobre "nome completo"
  console.log('\n[TESTE 5] Cliente: "o que significa nome completo?"');
  const t5 = await interpretClientMessage('o que significa nome completo?', 'AGUARDANDO_NOME_DATA', baseSession);
  console.log('Intent:', t5.intent, '| fullName:', t5.fullName);
  if (t5.intent === 'QUESTION' && t5.fullName === null) {
    console.log('✅ TESTE 5 PASSOU! (Identificado como pergunta, não salvou nome)');
  } else {
    console.error('❌ TESTE 5 FALHOU!', t5);
  }

  // TESTE 6: Reclamação / Reclamação de entendimento
  console.log('\n[TESTE 6] Cliente: "você não está entendendo"');
  const t6 = await interpretClientMessage('você não está entendendo', 'AGUARDANDO_NOME_DATA', baseSession);
  console.log('Intent:', t6.intent, '| fullName:', t6.fullName);
  if ((t6.intent === 'COMPLAINT' || t6.intent === 'CORRECTION') && t6.fullName === null) {
    console.log('✅ TESTE 6 PASSOU! (Identificado como reclamação/insatisfação, não salvou nome)');
  } else {
    console.error('❌ TESTE 6 FALHOU!', t6);
  }

  // TESTE 7: Afirmação de pagamento "paguei"
  console.log('\n[TESTE 7] Cliente: "paguei"');
  const t7 = await interpretClientMessage('paguei', 'AGUARDANDO_PAGAMENTO', baseSession);
  console.log('Intent:', t7.intent);
  if (t7.intent === 'PAYMENT_CLAIM') {
    console.log('✅ TESTE 7 PASSOU! (Identificado como PAYMENT_CLAIM)');
  } else {
    console.error('❌ TESTE 7 FALHOU!', t7);
  }

  // TESTE 8: Dúvida sobre o produto
  console.log('\n[TESTE 8] Cliente: "esse mapa fala de relacionamento?"');
  const t8 = await interpretClientMessage('esse mapa fala de relacionamento?', 'AGUARDANDO_NOME_DATA', baseSession);
  console.log('Intent:', t8.intent, '| fullName:', t8.fullName);
  if (t8.intent === 'QUESTION' && t8.fullName === null) {
    console.log('✅ TESTE 8 PASSOU! (Respondido como pergunta, mantendo estado)');
  } else {
    console.error('❌ TESTE 8 FALHOU!', t8);
  }

  // TESTE 9: Fluxo de Confirmação dos Dados e Afirmação
  console.log('\n[TESTE 9] Fluxo de recebimento e confirmação dos dados');
  const s1 = createKaelSession('test-session-confirm');
  const res1 = await handleKaelUserMessage(s1, 'João da Silva 20/03/1990');
  console.log('Estado pós envio de dados:', res1.updatedSession.currentState);
  const t9a = res1.updatedSession.currentState === 'CONFIRMACAO_DOS_DADOS';

  const res2 = await handleKaelUserMessage(res1.updatedSession, 'sim, está tudo certo');
  console.log('Estado pós confirmação:', res2.updatedSession.currentState);
  const t9b = res2.updatedSession.currentState === 'AGUARDANDO_PAGAMENTO';

  if (t9a && t9b) {
    console.log('✅ TESTE 9 PASSOU! (AGUARDANDO_NOME_DATA -> CONFIRMACAO_DOS_DADOS -> AGUARDANDO_PAGAMENTO)');
  } else {
    console.error('❌ TESTE 9 FALHOU!', { stateAfterData: res1.updatedSession.currentState, stateAfterConfirm: res2.updatedSession.currentState });
  }

  // TESTE 10: Correção de Nome no Estado CONFIRMACAO_DOS_DADOS
  console.log('\n[TESTE 10] Correção de nome na confirmação');
  const s2 = createKaelSession('test-session-correction');
  await handleKaelUserMessage(s2, 'João da Silva 20/03/1990');
  const resCorrection = await handleKaelUserMessage(s2, 'Não, meu nome é Gabriel Braga Silva');
  console.log('Novo Nome:', resCorrection.updatedSession.fullName, '| Estado:', resCorrection.updatedSession.currentState);
  if (resCorrection.updatedSession.fullName === 'Gabriel Braga Silva' && resCorrection.updatedSession.currentState === 'CONFIRMACAO_DOS_DADOS') {
    console.log('✅ TESTE 10 PASSOU! (Nome atualizado para Gabriel Braga Silva, mantendo estado de confirmação)');
  } else {
    console.error('❌ TESTE 10 FALHOU!', { fullName: resCorrection.updatedSession.fullName, state: resCorrection.updatedSession.currentState });
  }

  // TESTE 11: Solicitação de Reset em Estado de Pagamento ("vamos resetar comece tudo de novo")
  console.log('\n[TESTE 11] Cliente em AGUARDANDO_PAGAMENTO diz: "vamos resetar comece tudo de novo"');
  const s3 = createKaelSession('test-session-reset');
  await handleKaelUserMessage(s3, 'Gabriel Braga Silva 18/06/1996');
  await handleKaelUserMessage(s3, 'sim, tudo certo'); // vai para AGUARDANDO_PAGAMENTO
  console.log('Estado antes do reset:', s3.currentState, '| Nome:', s3.fullName);

  const resReset = await handleKaelUserMessage(s3, 'vamos resetar comece tudo de novo');
  console.log('Estado após reset:', resReset.updatedSession.currentState, '| Nome:', resReset.updatedSession.fullName);
  const resetResponseMsg = resReset.newMessages.map(m => m.text).join('\n');
  console.log('Primeira resposta do Kael:', resReset.newMessages[0]?.text);

  if (
    resReset.updatedSession.currentState === 'AGUARDANDO_NOME_DATA' &&
    resReset.updatedSession.fullName === undefined &&
    resReset.newMessages[0]?.text.includes('Claro. Vamos começar novamente do início.')
  ) {
    console.log('✅ TESTE 11 PASSOU! (Reset limpou os dados e reiniciou o roteiro sem insistir no PIX)');
  } else {
    console.error('❌ TESTE 11 FALHOU!', { state: resReset.updatedSession.currentState, fullName: resReset.updatedSession.fullName, msg: resReset.newMessages[0]?.text });
  }

  // TESTE 12: Voltar para as primeiras mensagens ("quero que volte pras primeiras mensagens")
  console.log('\n[TESTE 12] Cliente: "quero que volte pras primeiras mensagens"');
  const s4 = createKaelSession('test-session-back');
  await handleKaelUserMessage(s4, 'Carlos Souza 10/10/1985');
  const resBack = await handleKaelUserMessage(s4, 'quero que volte pras primeiras mensagens');
  if (
    resBack.updatedSession.currentState === 'AGUARDANDO_NOME_DATA' &&
    resBack.updatedSession.fullName === undefined &&
    resBack.newMessages[0]?.text.includes('Claro. Vamos começar novamente do início.')
  ) {
    console.log('✅ TESTE 12 PASSOU! (Voltou para as primeiras mensagens com sucesso)');
  } else {
    console.error('❌ TESTE 12 FALHOU!', { state: resBack.updatedSession.currentState, fullName: resBack.updatedSession.fullName });
  }

  // TESTE 13: Notificação de nome errado ("eu mandei o nome errado")
  console.log('\n[TESTE 13] Cliente: "eu mandei o nome errado"');
  const s5 = createKaelSession('test-session-wrong-name');
  await handleKaelUserMessage(s5, 'Carlos Souza 10/10/1985');
  const resWrong = await handleKaelUserMessage(s5, 'eu mandei o nome errado');
  console.log('Resposta do Kael:', resWrong.newMessages[0]?.text);
  if (resWrong.newMessages[0]?.text.includes('nome completo de nascimento correto')) {
    console.log('✅ TESTE 13 PASSOU! (Kael perguntou o nome correto gentilmente)');
  } else {
    console.error('❌ TESTE 13 FALHOU!', resWrong.newMessages[0]?.text);
  }

  // TESTE 14: Não quero comprar agora ("não quero comprar agora")
  console.log('\n[TESTE 14] Cliente: "não quero comprar agora"');
  const s6 = createKaelSession('test-session-no-buy');
  const resNoBuy = await handleKaelUserMessage(s6, 'não quero comprar agora');
  if (resNoBuy.updatedSession.currentState === 'CONVERSA_ENCERRADA') {
    console.log('✅ TESTE 14 PASSOU! (Conversa encerrada cordial e sem insistência)');
  } else {
    console.error('❌ TESTE 14 FALHOU!', resNoBuy.updatedSession.currentState);
  }

  // TESTE 15: Pergunta sobre valor ("quanto custa?")
  console.log('\n[TESTE 15] Cliente: "quanto custa?"');
  const s7 = createKaelSession('test-session-price');
  const resPrice = await handleKaelUserMessage(s7, 'quanto custa?');
  console.log('Resposta:', resPrice.newMessages[0]?.text);
  if (resPrice.newMessages[0]?.text.includes('R$ 15,00') && resPrice.updatedSession.currentState === 'AGUARDANDO_NOME_DATA') {
    console.log('✅ TESTE 15 PASSOU! (Informa R$ 15,00 e mantém estado aguardando dados)');
  } else {
    console.error('❌ TESTE 15 FALHOU!', resPrice.newMessages[0]?.text);
  }

  // TESTE 16: Pergunta sobre mapa para terceiros ("posso fazer o mapa para minha mãe?")
  console.log('\n[TESTE 16] Cliente: "posso fazer o mapa para minha mãe?"');
  const s8 = createKaelSession('test-session-mother');
  const resMother = await handleKaelUserMessage(s8, 'posso fazer o mapa para minha mãe?');
  console.log('Resposta:', resMother.newMessages[0]?.text);
  if (resMother.newMessages[0]?.text.includes('dados da pessoa') || resMother.newMessages[0]?.text.includes('nome completo')) {
    console.log('✅ TESTE 16 PASSOU! (Informa que pode fazer para a pessoa com os dados dela)');
  } else {
    console.error('❌ TESTE 16 FALHOU!', resMother.newMessages[0]?.text);
  }

  // TESTE 17: Pergunta sobre nome de batismo
  console.log('\n[TESTE 17] Cliente: "precisa ser o nome de batismo?"');
  const s9 = createKaelSession('test-session-baptism');
  const resBaptism = await handleKaelUserMessage(s9, 'precisa ser o nome de batismo?');
  console.log('Resposta:', resBaptism.newMessages[0]?.text);
  if (resBaptism.newMessages[0]?.text.includes('registro civil') && !resBaptism.newMessages[0]?.text.includes('R$ 15,00')) {
    console.log('✅ TESTE 17 PASSOU! (Explica registro civil sem mencionar batismo religioso nem preço)');
  } else {
    console.error('❌ TESTE 17 FALHOU!', resBaptism.newMessages[0]?.text);
  }

  // TESTE 18: Pergunta sobre nome de cartório
  console.log('\n[TESTE 18] Cliente: "é nome de cartório?"');
  const s10 = createKaelSession('test-session-cartorio');
  const resCartorio = await handleKaelUserMessage(s10, 'é nome de cartório?');
  console.log('Resposta:', resCartorio.newMessages[0]?.text);
  if (resCartorio.newMessages[0]?.text.includes('registro civil') && !resCartorio.newMessages[0]?.text.includes('R$ 15,00')) {
    console.log('✅ TESTE 18 PASSOU! (Confirma registro civil sem preço)');
  } else {
    console.error('❌ TESTE 18 FALHOU!', resCartorio.newMessages[0]?.text);
  }

  // TESTE 19: Correção de data
  console.log('\n[TESTE 19] Cliente: "mandei a data errada, nasci em 15/05/1992"');
  const s11 = createKaelSession('test-session-corr-date');
  await handleKaelUserMessage(s11, 'João da Silva 20/03/1990');
  const resCorrDate = await handleKaelUserMessage(s11, 'mandei a data errada, nasci em 15/05/1992');
  console.log('Novo Estado:', resCorrDate.updatedSession.currentState, '| Nova Data:', resCorrDate.updatedSession.birthDate);
  if (resCorrDate.updatedSession.birthDate === '1992-05-15' && resCorrDate.updatedSession.currentState === 'CONFIRMACAO_DOS_DADOS') {
    console.log('✅ TESTE 19 PASSOU! (Data atualizada para 15/05/1992, mantendo nome e pedindo confirmação)');
  } else {
    console.error('❌ TESTE 19 FALHOU!', { birthDate: resCorrDate.updatedSession.birthDate, state: resCorrDate.updatedSession.currentState });
  }

  // TESTE 20: Múltiplas perguntas seguidas sem mudar estado
  console.log('\n[TESTE 20] Cliente fazendo duas perguntas seguidas');
  const s12 = createKaelSession('test-session-multi-questions');
  const q1 = await handleKaelUserMessage(s12, 'quanto tempo demora?');
  console.log('R1:', q1.newMessages[0]?.text);
  const q2 = await handleKaelUserMessage(s12, 'como eu recebo?');
  console.log('R2:', q2.newMessages[0]?.text);
  if (
    s12.currentState === 'AGUARDANDO_NOME_DATA' &&
    q1.newMessages[0]?.text.includes('disponibilizado por aqui') &&
    q2.newMessages[0]?.text.includes('enviado diretamente por aqui')
  ) {
    console.log('✅ TESTE 20 PASSOU! (Respondeu ambas as dúvidas mantendo AGUARDANDO_NOME_DATA sem spam de preço)');
  } else {
    console.error('❌ TESTE 20 FALHOU!', { state: s12.currentState, r1: q1.newMessages[0]?.text, r2: q2.newMessages[0]?.text });
  }

  // TESTE 21: Suporte pós-venda - "não entendi alguns pontos do meu mapa"
  console.log('\n[TESTE 21] Pós-venda: "não entendi alguns pontos do meu mapa"');
  const s13 = createKaelSession('test-session-post-sale-1');
  s13.mapDelivered = true;
  s13.currentState = 'POS_VENDA';
  const res21 = await handleKaelUserMessage(s13, 'não entendi alguns pontos do meu mapa');
  console.log('Resposta:', res21.newMessages[0]?.text);
  if (
    !res21.newMessages[0]?.text.includes('Sou o Kael') &&
    !res21.newMessages[0]?.text.includes('R$ 15,00') &&
    (res21.newMessages[0]?.text.includes('trecho ou o número') || res21.newMessages[0]?.text.includes('explico'))
  ) {
    console.log('✅ TESTE 21 PASSOU! (Respondeu sem se re-apresentar nem tentar vender o mapa entregue)');
  } else {
    console.error('❌ TESTE 21 FALHOU!', res21.newMessages[0]?.text);
  }

  // TESTE 22: Suporte pós-venda - "não entendi o que são esses números"
  console.log('\n[TESTE 22] Pós-venda: "não entendi o que são esses números"');
  const res22 = await handleKaelUserMessage(s13, 'não entendi o que são esses números');
  console.log('Resposta:', res22.newMessages[0]?.text);
  if (
    !res22.newMessages[0]?.text.includes('Sou o Kael') &&
    (res22.newMessages[0]?.text.includes('número') || res22.newMessages[0]?.text.includes('trecho'))
  ) {
    console.log('✅ TESTE 22 PASSOU! (Entendeu que "esses números" se refere ao mapa e explicou sem re-apresentação)');
  } else {
    console.error('❌ TESTE 22 FALHOU!', res22.newMessages[0]?.text);
  }

  // TESTE 23: Suporte pós-venda - "e o número 7?"
  console.log('\n[TESTE 23] Pós-venda: "e o número 7?"');
  const res23 = await handleKaelUserMessage(s13, 'e o número 7?');
  console.log('Resposta:', res23.newMessages[0]?.text);
  if (
    !res23.newMessages[0]?.text.includes('Sou o Kael') &&
    res23.newMessages[0]?.text.includes('sabedoria interior')
  ) {
    console.log('✅ TESTE 23 PASSOU! (Explicou o número 7 sem "Olá! Sou o Kael")');
  } else {
    console.error('❌ TESTE 23 FALHOU!', res23.newMessages[0]?.text);
  }

  // TESTE 24: Suporte pós-venda - "e esse outro aqui?"
  console.log('\n[TESTE 24] Pós-venda: "e esse outro aqui?"');
  const res24 = await handleKaelUserMessage(s13, 'e esse outro aqui?');
  console.log('Resposta:', res24.newMessages[0]?.text);
  if (
    !res24.newMessages[0]?.text.includes('Sou o Kael') &&
    res24.newMessages[0]?.text.includes('outro número')
  ) {
    console.log('✅ TESTE 24 PASSOU! (Utilizou o contexto anterior para pedir o outro número)');
  } else {
    console.error('❌ TESTE 24 FALHOU!', res24.newMessages[0]?.text);
  }

  // TESTE 25: Suporte pós-venda - "quanto custa o mapa?"
  console.log('\n[TESTE 25] Pós-venda: "quanto custa o mapa?"');
  const res25 = await handleKaelUserMessage(s13, 'quanto custa o mapa?');
  console.log('Resposta:', res25.newMessages[0]?.text);
  if (
    res25.newMessages[0]?.text.includes('já foi entregue') &&
    res25.newMessages[0]?.text.includes('outra pessoa')
  ) {
    console.log('✅ TESTE 25 PASSOU! (Percebeu que o mapa já foi entregue e esclareceu)');
  } else {
    console.error('❌ TESTE 25 FALHOU!', res25.newMessages[0]?.text);
  }

  // TESTE 26: Suporte pós-venda - "não entendi essa parte"
  console.log('\n[TESTE 26] Pós-venda: "não entendi essa parte"');
  const res26 = await handleKaelUserMessage(s13, 'não entendi essa parte');
  console.log('Resposta:', res26.newMessages[0]?.text);
  if (
    !res26.newMessages[0]?.text.includes('R$ 15,00') &&
    res26.newMessages[0]?.text.includes('qual é o outro número')
  ) {
    console.log('✅ TESTE 26 PASSOU! (Entrou em modo de suporte e não tentou vender novamente)');
  } else {
    console.error('❌ TESTE 26 FALHOU!', res26.newMessages[0]?.text);
  }

  // TESTE 27: Continuous Conversation sem repetir saudações preenchimento
  console.log('\n[TESTE 27] Saudação durante conversa ativa');
  const s14 = createKaelSession('test-session-active');
  const res27 = await handleKaelUserMessage(s14, 'olá');
  console.log('Resposta:', res27.newMessages[0]?.text);
  if (
    !res27.newMessages[0]?.text.includes('Sou o Kael') &&
    res27.newMessages[0]?.text.includes('Olá! Como posso te ajudar?')
  ) {
    console.log('✅ TESTE 27 PASSOU! (Saudação curta sem se re-apresentar)');
  } else {
    console.error('❌ TESTE 27 FALHOU!', res27.newMessages[0]?.text);
  }

  // TESTE 28: Mensagem Longa com Múltiplas Intenções no Suporte pós-venda (Exemplo 21 da regra)
  console.log('\n[TESTE 28] Suporte Pós-Venda com Múltiplas Intenções');
  const sLongSupport = createKaelSession('test-session-long-support');
  sLongSupport.mapDelivered = true;
  sLongSupport.currentState = 'POS_VENDA';
  const longSupportText = "Eu li meu mapa ontem e gostei bastante, mas fiquei meio confuso com algumas coisas. Tem vários números e eu não sei exatamente o que cada um representa. O número 7 aparece algumas vezes e queria saber se isso é positivo ou negativo. Também vi uma parte falando de missão e outra sobre profissão, mas não consegui entender qual delas é mais importante. Você pode explicar?";
  const res28 = await handleKaelUserMessage(sLongSupport, longSupportText);
  console.log('Resposta do Kael:\n', res28.newMessages[0]?.text);
  const r28Text = res28.newMessages[0]?.text || '';
  if (
    r28Text.includes('Os números do mapa') &&
    r28Text.includes('número 7') &&
    r28Text.includes('Missão de Vida vs. Profissão') &&
    !r28Text.includes('R$ 15,00') &&
    !r28Text.includes('Sou o Kael')
  ) {
    console.log('✅ TESTE 28 PASSOU! (Respondeu a todas as intenções da mensagem longa de forma organizada e sem propaganda)');
  } else {
    console.error('❌ TESTE 28 FALHOU!', r28Text);
  }

  // TESTE 29: Dados + Múltiplas Perguntas na mesma mensagem
  console.log('\n[TESTE 29] Dados + Perguntas na mesma mensagem');
  const sDataQuestions = createKaelSession('test-session-data-q');
  const textDataQ = "Meu nome é Gabriel Braga Silva, nasci em 18/06/1996. Esse mapa fala de profissão? E também queria saber se dá para entender meus relacionamentos por ele.";
  const res29 = await handleKaelUserMessage(sDataQuestions, textDataQ);
  console.log('Resposta:', res29.newMessages[0]?.text);
  const r29Text = res29.newMessages[0]?.text || '';
  if (
    sDataQuestions.fullName === 'Gabriel Braga Silva' &&
    sDataQuestions.birthDate === '1996-06-18' &&
    sDataQuestions.currentState === 'CONFIRMACAO_DOS_DADOS' &&
    r29Text.includes('potencial profissional') &&
    r29Text.includes('área afetiva')
  ) {
    console.log('✅ TESTE 29 PASSOU! (Extraiu nome e data, respondeu sobre profissão e relacionamentos e pediu confirmação)');
  } else {
    console.error('❌ TESTE 29 FALHOU!', { state: sDataQuestions.currentState, name: sDataQuestions.fullName, text: r29Text });
  }

  // TESTE 30: Correção + Pergunta de Impacto ("isso muda o resultado do mapa?")
  console.log('\n[TESTE 30] Correção de Nome + Pergunta de Impacto');
  const sCorrImpact = createKaelSession('test-session-corr-impact');
  await handleKaelUserMessage(sCorrImpact, 'Gabriel Sila 18/06/1996');
  const textCorrImpact = "Na verdade meu nome correto é Gabriel Braga Silva, eu tinha digitado Sila antes. Agora que corrigi queria saber se isso muda o resultado do mapa.";
  const res30 = await handleKaelUserMessage(sCorrImpact, textCorrImpact);
  console.log('Resposta:', res30.newMessages[0]?.text);
  const r30Text = res30.newMessages[0]?.text || '';
  if (
    sCorrImpact.fullName === 'Gabriel Braga Silva' &&
    r30Text.includes('qualquer alteração no nome muda os resultados') &&
    r30Text.includes('Gabriel Braga Silva')
  ) {
    console.log('✅ TESTE 30 PASSOU! (Atualizou o nome, explicou que altera os resultados e mostrou dados atualizados)');
  } else {
    console.error('❌ TESTE 30 FALHOU!', { name: sCorrImpact.fullName, text: r30Text });
  }

  // TESTE 31: Desabafo + Pergunta no Suporte
  console.log('\n[TESTE 31] Contexto / Desabafo + Pergunta');
  const sDesabafo = createKaelSession('test-session-desabafo');
  sDesabafo.mapDelivered = true;
  sDesabafo.currentState = 'POS_VENDA';
  const textDesabafo = "Eu sempre tive muita dificuldade no trabalho, já mudei de área algumas vezes e agora olhando meu mapa fiquei curioso porque apareceu esse número várias vezes. Queria saber se isso tem alguma relação com minha vida profissional.";
  const res31 = await handleKaelUserMessage(sDesabafo, textDesabafo);
  console.log('Resposta:', res31.newMessages[0]?.text);
  const r31Text = res31.newMessages[0]?.text || '';
  if (
    r31Text.includes('número') &&
    (r31Text.includes('aparece') || r31Text.includes('explicar'))
  ) {
    console.log('✅ TESTE 31 PASSOU! (Acolheu o contexto de trabalho e perguntou qual número apareceu sem ignorar a dúvida)');
  } else {
    console.error('❌ TESTE 31 FALHOU!', r31Text);
  }

  // TESTE 32: Pergunta com número não especificado
  console.log('\n[TESTE 32] Número não especificado');
  const sUnspec = createKaelSession('test-session-unspec');
  sUnspec.mapDelivered = true;
  sUnspec.currentState = 'POS_VENDA';
  const res32 = await handleKaelUserMessage(sUnspec, 'esse número aparece muito');
  console.log('Resposta:', res32.newMessages[0]?.text);
  if (res32.newMessages[0]?.text.includes('Qual número aparece várias vezes')) {
    console.log('✅ TESTE 32 PASSOU! (Perguntou de forma natural qual é o número que aparece muito)');
  } else {
    console.error('❌ TESTE 32 FALHOU!', res32.newMessages[0]?.text);
  }

  // TESTE 33: Detecção de Contradição nos Dados
  console.log('\n[TESTE 33] Detecção de Contradição');
  const sContradiction = createKaelSession('test-session-contradiction');
  const res33 = await handleKaelUserMessage(sContradiction, 'Meu nome é João, mas acho que coloquei Pedro antes.');
  console.log('Resposta:', res33.newMessages[0]?.text);
  if (res33.newMessages[0]?.text.includes('o nome correto a ser considerado é João?')) {
    console.log('✅ TESTE 33 PASSOU! (Detectou contradição e pediu confirmação)');
  } else {
    console.error('❌ TESTE 33 FALHOU!', res33.newMessages[0]?.text);
  }

  // TESTE 34: Prioridade - Correção + Solicitação de PIX
  console.log('\n[TESTE 34] Prioridade - Correção de Dados antes de PIX');
  const sPriority = createKaelSession('test-session-priority');
  await handleKaelUserMessage(sPriority, 'Gabriel Silva 18/06/1996');
  const res34 = await handleKaelUserMessage(sPriority, 'Meu nome estava errado, corrige para Gabriel Braga Silva, e depois me diz onde faço o PIX.');
  console.log('Resposta:', res34.newMessages[0]?.text);
  const r34Text = res34.newMessages[0]?.text || '';
  if (
    sPriority.fullName === 'Gabriel Braga Silva' &&
    sPriority.currentState === 'CONFIRMACAO_DOS_DADOS' &&
    r34Text.includes('Gabriel Braga Silva') &&
    !r34Text.includes('chave PIX')
  ) {
    console.log('✅ TESTE 34 PASSOU! (Atualizou nome e solicitou confirmação de dados antes de enviar o PIX)');
  } else {
    console.error('❌ TESTE 34 FALHOU!', { name: sPriority.fullName, state: sPriority.currentState, text: r34Text });
  }

  // TESTE 35: Reset total da sessão do Kael (Criação de nova sessão independente)
  console.log('\n[TESTE 35] Reset total e independente de sessão');
  const oldSessionId = 'test-session-old-123';
  const sOld = createKaelSession(oldSessionId);
  await handleKaelUserMessage(sOld, 'Carlos Eduardo 15/04/1985');
  await handleKaelUserMessage(sOld, 'sim, tudo certo');
  await handleKaelUserMessage(sOld, 'quanto custa?');

  // Simula criação de nova sessão após clicar em Reiniciar Chat
  const newSessionId = `kael-new-${Date.now()}`;
  const sNew = createKaelSession(newSessionId);

  if (
    sNew.sessionId === newSessionId &&
    sNew.fullName === undefined &&
    sNew.birthDate === undefined &&
    sNew.currentState === 'AGUARDANDO_NOME_DATA' &&
    sNew.messages.length === 3 &&
    sNew.messages[0].text.includes('Olá! Que alegria receber o seu contato!') &&
    sNew.paymentStatus === 'pendente' &&
    sNew.messageCount === 0 &&
    sNew.lastIntent === undefined &&
    sNew.lastTopic === undefined
  ) {
    console.log('✅ TESTE 35 PASSOU! (Nova sessão criada completamente zerada e independente)');
  } else {
    console.error('❌ TESTE 35 FALHOU!', sNew);
  }

  // TESTE 36: Dúvida de eficácia no estado AGUARDANDO_NOME_DATA
  console.log('\n[TESTE 36] Dúvida "Eu tô em dúvida se isso funciona de verdade."');
  const sDoubt1 = createKaelSession('test-session-doubt1');
  const res36 = await handleKaelUserMessage(sDoubt1, 'Eu tô em dúvida se isso funciona de verdade.');
  const r36Text = res36.newMessages[0]?.text || '';
  if (r36Text.includes('É uma dúvida válida') && r36Text.includes('Numerologia Cabalística') && (r36Text.includes('por favor me envie') || r36Text.includes('Para darmos início'))) {
    console.log('✅ TESTE 36 PASSOU! (Respondeu a dúvida com empatia e transparência e reancorou no fluxo)');
  } else {
    console.error('❌ TESTE 36 FALHOU!', r36Text);
  }

  // TESTE 37: Pergunta "Isso é científico?"
  console.log('\n[TESTE 37] Pergunta "Isso é científico?"');
  const sDoubt2 = createKaelSession('test-session-doubt2');
  const res37 = await handleKaelUserMessage(sDoubt2, 'Isso é científico?');
  const r37Text = res37.newMessages[0]?.text || '';
  if (r37Text.includes('não é considerada um método científico comprovado') && (r37Text.includes('para darmos início') || r37Text.includes('Para darmos início'))) {
    console.log('✅ TESTE 37 PASSOU! (Explicou com transparência que não é científico e reancorou no fluxo)');
  } else {
    console.error('❌ TESTE 37 FALHOU!', r37Text);
  }

  // TESTE 38: Pergunta "Para que serve esse mapa?"
  console.log('\n[TESTE 38] Pergunta "Para que serve esse mapa?"');
  const sDoubt3 = createKaelSession('test-session-doubt3');
  const res38 = await handleKaelUserMessage(sDoubt3, 'Para que serve esse mapa?');
  const r38Text = res38.newMessages[0]?.text || '';
  if (r38Text.includes('serve como um guia de autoconhecimento') && (r38Text.includes('para darmos início') || r38Text.includes('Para darmos início'))) {
    console.log('✅ TESTE 38 PASSOU! (Explicou a finalidade do mapa e reancorou no fluxo)');
  } else {
    console.error('❌ TESTE 38 FALHOU!', r38Text);
  }

  // TESTE 39: Clarificação "Meu nome não tem acento, pode mandar assim?"
  console.log('\n[TESTE 39] Clarificação "Meu nome não tem acento, pode mandar assim?"');
  const sDoubt4 = createKaelSession('test-session-doubt4');
  const res39 = await handleKaelUserMessage(sDoubt4, 'Meu nome não tem acento, pode mandar assim?');
  const r39Text = res39.newMessages[0]?.text || '';
  if (r39Text.includes('Não tem problema') && (r39Text.includes('para darmos início') || r39Text.includes('Para darmos início'))) {
    console.log('✅ TESTE 39 PASSOU! (Respondeu sobre acentos e continuou aguardando os dados)');
  } else {
    console.error('❌ TESTE 39 FALHOU!', r39Text);
  }

  // TESTE 40: Dúvida de preço isolada "Quanto custa?"
  console.log('\n[TESTE 40] Pergunta "Quanto custa?"');
  const sDoubt5 = createKaelSession('test-session-doubt5');
  const res40 = await handleKaelUserMessage(sDoubt5, 'Quanto custa?');
  const r40Text = res40.newMessages[0]?.text || '';
  if (r40Text.includes('R$ 15,00') && (r40Text.includes('para darmos início') || r40Text.includes('Para darmos início'))) {
    console.log('✅ TESTE 40 PASSOU! (Respondeu o preço promocional e reancorou no fluxo)');
  } else {
    console.error('❌ TESTE 40 FALHOU!', r40Text);
  }

  // TESTE 41: Formato "20/03/1990"
  console.log('\n[TESTE 41] "20/03/1990"');
  const s41 = createKaelSession('test-session-41');
  const res41 = await interpretClientMessage('20/03/1990', 'AGUARDANDO_NOME_DATA', s41);
  if (res41.intent === 'BIRTH_DATE' && res41.birthDate?.formatted === '20/03/1990' && res41.fullName === null) {
    console.log('✅ TESTE 41 PASSOU! (Reconheceu 20/03/1990 como data)');
  } else {
    console.error('❌ TESTE 41 FALHOU!', res41);
  }

  // TESTE 42: Formato com espaços "20 03 1990"
  console.log('\n[TESTE 42] "20 03 1990"');
  const s42 = createKaelSession('test-session-42');
  const res42 = await interpretClientMessage('20 03 1990', 'AGUARDANDO_NOME_DATA', s42);
  if (res42.intent === 'BIRTH_DATE' && res42.birthDate?.formatted === '20/03/1990' && res42.fullName === null) {
    console.log('✅ TESTE 42 PASSOU! (Reconheceu "20 03 1990" como data e NÃO como nome)');
  } else {
    console.error('❌ TESTE 42 FALHOU!', res42);
  }

  // TESTE 43: Formato com traços "20-03-1990"
  console.log('\n[TESTE 43] "20-03-1990"');
  const s43 = createKaelSession('test-session-43');
  const res43 = await interpretClientMessage('20-03-1990', 'AGUARDANDO_NOME_DATA', s43);
  if (res43.intent === 'BIRTH_DATE' && res43.birthDate?.formatted === '20/03/1990') {
    console.log('✅ TESTE 43 PASSOU! (Reconheceu "20-03-1990" como data)');
  } else {
    console.error('❌ TESTE 43 FALHOU!', res43);
  }

  // TESTE 44: Formato com pontos "20.03.1990"
  console.log('\n[TESTE 44] "20.03.1990"');
  const s44 = createKaelSession('test-session-44');
  const res44 = await interpretClientMessage('20.03.1990', 'AGUARDANDO_NOME_DATA', s44);
  if (res44.intent === 'BIRTH_DATE' && res44.birthDate?.formatted === '20/03/1990') {
    console.log('✅ TESTE 44 PASSOU! (Reconheceu "20.03.1990" como data)');
  } else {
    console.error('❌ TESTE 44 FALHOU!', res44);
  }

  // TESTE 45: Mês por extenso "20 de março de 1990"
  console.log('\n[TESTE 45] "20 de março de 1990"');
  const s45 = createKaelSession('test-session-45');
  const res45 = await interpretClientMessage('20 de março de 1990', 'AGUARDANDO_NOME_DATA', s45);
  if (res45.intent === 'BIRTH_DATE' && res45.birthDate?.formatted === '20/03/1990' && res45.fullName === null) {
    console.log('✅ TESTE 45 PASSOU! (Reconheceu "20 de março de 1990" como data)');
  } else {
    console.error('❌ TESTE 45 FALHOU!', res45);
  }

  // TESTE 46: "20 março 1990"
  console.log('\n[TESTE 46] "20 março 1990"');
  const s46 = createKaelSession('test-session-46');
  const res46 = await interpretClientMessage('20 março 1990', 'AGUARDANDO_NOME_DATA', s46);
  if (res46.intent === 'BIRTH_DATE' && res46.birthDate?.formatted === '20/03/1990') {
    console.log('✅ TESTE 46 PASSOU! (Reconheceu "20 março 1990" como data)');
  } else {
    console.error('❌ TESTE 46 FALHOU!', res46);
  }

  // TESTE 47: Frase com contexto "nasci em 20 de março de 1990"
  console.log('\n[TESTE 47] "nasci em 20 de março de 1990"');
  const s47 = createKaelSession('test-session-47');
  const res47 = await interpretClientMessage('nasci em 20 de março de 1990', 'AGUARDANDO_NOME_DATA', s47);
  if (res47.intent === 'BIRTH_DATE' && res47.birthDate?.formatted === '20/03/1990') {
    console.log('✅ TESTE 47 PASSOU! (Reconheceu data com frase)');
  } else {
    console.error('❌ TESTE 47 FALHOU!', res47);
  }

  // TESTE 48: Nome apenas "José Pinheiro Junior"
  console.log('\n[TESTE 48] "José Pinheiro Junior"');
  const s48 = createKaelSession('test-session-48');
  const res48 = await interpretClientMessage('José Pinheiro Junior', 'AGUARDANDO_NOME_DATA', s48);
  if (res48.intent === 'NAME' && res48.fullName === 'José Pinheiro Junior') {
    console.log('✅ TESTE 48 PASSOU! (Reconheceu "José Pinheiro Junior" como nome)');
  } else {
    console.error('❌ TESTE 48 FALHOU!', res48);
  }

  // TESTE 49: Nome e Data com espaços "José Pinheiro Junior 20 03 1990"
  console.log('\n[TESTE 49] "José Pinheiro Junior 20 03 1990"');
  const s49 = createKaelSession('test-session-49');
  const res49 = await interpretClientMessage('José Pinheiro Junior 20 03 1990', 'AGUARDANDO_NOME_DATA', s49);
  if (res49.intent === 'NAME_AND_BIRTH_DATE' && res49.fullName === 'José Pinheiro Junior' && res49.birthDate?.formatted === '20/03/1990') {
    console.log('✅ TESTE 49 PASSOU! (Reconheceu Nome e Data com formato com espaços)');
  } else {
    console.error('❌ TESTE 49 FALHOU!', res49);
  }

  // TESTE 50: Nome e Data em frase completa
  console.log('\n[TESTE 50] "Meu nome é José Pinheiro Junior e nasci em 20 de março de 1990."');
  const s50 = createKaelSession('test-session-50');
  const res50 = await interpretClientMessage('Meu nome é José Pinheiro Junior e nasci em 20 de março de 1990.', 'AGUARDANDO_NOME_DATA', s50);
  if (res50.intent === 'NAME_AND_BIRTH_DATE' && res50.fullName === 'José Pinheiro Junior' && res50.birthDate?.formatted === '20/03/1990') {
    console.log('✅ TESTE 50 PASSOU! (Reconheceu Nome e Data em frase completa)');
  } else {
    console.error('❌ TESTE 50 FALHOU!', res50);
  }

  // TESTE 51: Nome, Data e Pergunta
  console.log('\n[TESTE 51] "Meu nome é Gabriel Braga Silva, nasci em 18 de junho de 1996 e queria saber se o mapa fala sobre profissão."');
  const s51 = createKaelSession('test-session-51');
  const res51 = await handleKaelUserMessage(s51, 'Meu nome é Gabriel Braga Silva, nasci em 18 de junho de 1996 e queria saber se o mapa fala sobre profissão.');
  const r51Text = res51.newMessages[0]?.text || '';
  if (
    s51.fullName === 'Gabriel Braga Silva' &&
    s51.birthDate === '1996-06-18' &&
    s51.currentState === 'CONFIRMACAO_DOS_DADOS' &&
    r51Text.includes('potencial profissional')
  ) {
    console.log('✅ TESTE 51 PASSOU! (Armazenou nome/data, respondeu sobre profissão e pediu confirmação)');
  } else {
    console.error('❌ TESTE 51 FALHOU!', { fullName: s51.fullName, birthDate: s51.birthDate, state: s51.currentState, text: r51Text });
  }

  // TESTE 52: Data inválida "31 de fevereiro de 1990"
  console.log('\n[TESTE 52] "31 de fevereiro de 1990"');
  const s52 = createKaelSession('test-session-52');
  const res52 = await handleKaelUserMessage(s52, '31 de fevereiro de 1990');
  const r52Text = res52.newMessages[0]?.text || '';
  if (
    s52.birthDate === undefined &&
    s52.fullName === undefined &&
    r52Text.includes('inválida')
  ) {
    console.log('✅ TESTE 52 PASSOU! (Detectou data inexistente 31/02/1990, alertou e não salvou)');
  } else {
    console.error('❌ TESTE 52 FALHOU!', { birthDate: s52.birthDate, fullName: s52.fullName, text: r52Text });
  }

  // TESTE 53: Correção de Nome "Meu nome estava errado, o correto é Gabriel Braga Silva."
  console.log('\n[TESTE 53] "Meu nome estava errado, o correto é Gabriel Braga Silva."');
  const s53 = createKaelSession('test-session-53');
  await handleKaelUserMessage(s53, 'José 20/03/1990');
  const res53 = await handleKaelUserMessage(s53, 'Meu nome estava errado, o correto é Gabriel Braga Silva.');
  if (s53.fullName === 'Gabriel Braga Silva' && s53.currentState === 'CONFIRMACAO_DOS_DADOS') {
    console.log('✅ TESTE 53 PASSOU! (Corrigiu nome para Gabriel Braga Silva e reancorou em CONFIRMACAO_DOS_DADOS)');
  } else {
    console.error('❌ TESTE 53 FALHOU!', { fullName: s53.fullName, state: s53.currentState });
  }

  // TESTE 54: Correção de Data "Na verdade nasci em 21 de março de 1990."
  console.log('\n[TESTE 54] "Na verdade nasci em 21 de março de 1990."');
  const s54 = createKaelSession('test-session-54');
  await handleKaelUserMessage(s54, 'Gabriel Braga Silva 20/03/1990');
  const res54 = await handleKaelUserMessage(s54, 'Na verdade nasci em 21 de março de 1990.');
  if (s54.birthDate === '1990-03-21' && s54.currentState === 'CONFIRMACAO_DOS_DADOS') {
    console.log('✅ TESTE 54 PASSOU! (Corrigiu data para 21/03/1990 e pediu confirmação)');
  } else {
    console.error('❌ TESTE 54 FALHOU!', { birthDate: s54.birthDate, state: s54.currentState });
  }

  // TESTE 55: Dúvida enquanto AGUARDANDO_NOME_DATA ("Eu estou em dúvida se isso funciona de verdade.")
  console.log('\n[TESTE 55] Dúvida "Eu estou em dúvida se isso funciona de verdade."');
  const s55 = createKaelSession('test-session-55');
  const res55 = await handleKaelUserMessage(s55, 'Eu estou em dúvida se isso funciona de verdade.');
  const r55Text = res55.newMessages[0]?.text || '';
  if (
    s55.currentState === 'AGUARDANDO_NOME_DATA' &&
    r55Text.includes('É uma dúvida válida') &&
    (r55Text.includes('por favor me envie') || r55Text.includes('Para darmos início'))
  ) {
    console.log('✅ TESTE 55 PASSOU! (Respondeu dúvida e reancorou suavemente sem repetir comando seco)');
  } else {
    console.error('❌ TESTE 55 FALHOU!', { state: s55.currentState, text: r55Text });
  }

  // TESTE 56: Sequência Completa (Nome -> "qual é o meu nome?" -> "20 03 1990")
  console.log('\n[TESTE 56] Sequência: "meu nome é José Pinheiro Junior" -> "qual é o meu nome?" -> "20 03 1990"');
  const s56 = createKaelSession('test-session-56');
  await handleKaelUserMessage(s56, 'meu nome é José Pinheiro Junior');
  const step2 = await handleKaelUserMessage(s56, 'qual é o meu nome?');
  const step2Text = step2.newMessages[0]?.text || '';
  const step3 = await handleKaelUserMessage(s56, '20 03 1990');
  if (
    s56.fullName === 'José Pinheiro Junior' &&
    step2Text.includes('José Pinheiro Junior') &&
    s56.birthDate === '1990-03-20' &&
    s56.currentState === 'CONFIRMACAO_DOS_DADOS'
  ) {
    console.log('✅ TESTE 56 PASSOU! (Identificou o nome, respondeu "qual é o meu nome?", aceitou "20 03 1990" e avançou para confirmação)');
  } else {
    console.error('❌ TESTE 56 FALHOU!', { fullName: s56.fullName, birthDate: s56.birthDate, state: s56.currentState, step2Text });
  }

  // TESTE 57: Pergunta sobre invalidade "porque esta invalida?"
  console.log('\n[TESTE 57] Pergunta "porque esta invalida?"');
  const s57 = createKaelSession('test-session-57');
  s57.fullName = 'José Pinheiro Junior';
  const res57 = await handleKaelUserMessage(s57, 'porque esta invalida?');
  const r57Text = res57.newMessages[0]?.text || '';
  if (r57Text.includes('válida') && r57Text.includes('20/03/1990')) {
    console.log('✅ TESTE 57 PASSOU! (Explicou a validade da data e respondeu ao contexto)');
  } else {
    console.error('❌ TESTE 57 FALHOU!', r57Text);
  }

  // TESTE 58: Data em frase "eu nasci no dia 20 de março de 1990"
  console.log('\n[TESTE 58] "eu nasci no dia 20 de março de 1990"');
  const s58 = createKaelSession('test-session-58');
  await handleKaelUserMessage(s58, 'José Pinheiro Junior');
  await handleKaelUserMessage(s58, 'eu nasci no dia 20 de março de 1990');
  if (s58.birthDate === '1990-03-20' && s58.currentState === 'CONFIRMACAO_DOS_DADOS') {
    console.log('✅ TESTE 58 PASSOU! (Reconheceu "eu nasci no dia 20 de março de 1990" como data e avançou)');
  } else {
    console.error('❌ TESTE 58 FALHOU!', { birthDate: s58.birthDate, state: s58.currentState });
  }

  // TESTE 59: Respostas Afirmativas e de Correção no Estado CONFIRMACAO_DOS_DADOS
  console.log('\n[TESTE 59] Validação de Respostas em CONFIRMACAO_DOS_DADOS');
  const affirmativePhrases = [
    'sim',
    'estão sim',
    'sim, estão corretos',
    'está correto',
    'tudo certo',
    'pode prosseguir',
    'confirmo',
    'é isso mesmo',
    'sim, pode fazer meu mapa',
    'sim, conferi e está tudo correto',
    'sim, os dois dados estão certos',
    'pode continuar, está tudo certo',
    'confirmei e pode prosseguir',
    'está tudo correto, pode continuar'
  ];

  let allAffirmativePassed = true;
  for (const phrase of affirmativePhrases) {
    const sTest = createKaelSession(`test-aff-${phrase}`);
    sTest.fullName = 'José Pinheiro Junior';
    sTest.birthDate = '1990-03-20';
    sTest.currentState = 'CONFIRMACAO_DOS_DADOS';

    const res = await handleKaelUserMessage(sTest, phrase);
    if (res.updatedSession.currentState !== 'AGUARDANDO_PAGAMENTO') {
      console.error(`❌ TESTE 59 FALHOU para a frase afirmativa: "${phrase}". Estado retornado: ${res.updatedSession.currentState}`);
      allAffirmativePassed = false;
    }
  }

  if (allAffirmativePassed) {
    console.log(`✅ TESTE 59.1 PASSOU! Todas as ${affirmativePhrases.length} frases afirmativas avançaram para AGUARDANDO_PAGAMENTO`);
  }

  const correctionPhrasesTest = [
    { text: 'não', expectedAsk: 'corrigir' },
    { text: 'está errado', expectedAsk: 'corrigir' },
    { text: 'errei o nome', expectedAsk: 'nome' },
    { text: 'errei a data', expectedAsk: 'data' },
    { text: 'quero corrigir', expectedAsk: 'corrigir' }
  ];

  let allCorrectionsPassed = true;
  for (const item of correctionPhrasesTest) {
    const sCorr = createKaelSession(`test-corr-${item.text}`);
    sCorr.fullName = 'José Pinheiro Junior';
    sCorr.birthDate = '1990-03-20';
    sCorr.currentState = 'CONFIRMACAO_DOS_DADOS';

    const res = await handleKaelUserMessage(sCorr, item.text);
    const textMsg = res.newMessages[0]?.text || '';
    if (res.updatedSession.currentState === 'CONVERSA_ENCERRADA') {
      console.error(`❌ TESTE 59 FALHOU para a correção: "${item.text}". A conversa foi encerrada indevidamente.`);
      allCorrectionsPassed = false;
    } else if (!textMsg.toLowerCase().includes(item.expectedAsk)) {
      console.error(`❌ TESTE 59 FALHOU para a correção: "${item.text}". Mensagem retornada: "${textMsg}"`);
      allCorrectionsPassed = false;
    }
  }

  if (allCorrectionsPassed) {
    console.log(`✅ TESTE 59.2 PASSOU! Todas as correções foram devidamente tratadas sem encerrar a conversa`);
  }

  // TESTE 60: Proteção de Dados de Sessão contra Frases de Medo/Objeção/Conversa ("to com medo de perder meu dinheiro")
  console.log('\n[TESTE 60] Proteção de Dados de Sessão contra Objeções/Medo pós-confirmação');
  const s60 = createKaelSession('test-session-fear-objection');
  await handleKaelUserMessage(s60, 'José Pinheiro Junior');
  await handleKaelUserMessage(s60, '20 03 1990');
  console.log('Dados antes da objeção:', { fullName: s60.fullName, birthDate: s60.birthDate, state: s60.currentState });

  const resFear = await handleKaelUserMessage(s60, 'to com medo de perder meu dinheiro');
  console.log('Dados após a objeção:', { fullName: resFear.updatedSession.fullName, birthDate: resFear.updatedSession.birthDate, state: resFear.updatedSession.currentState });
  const fearMsg = resFear.newMessages.map(m => m.text).join('\n');
  console.log('Resposta do Kael:', fearMsg);

  if (
    resFear.updatedSession.fullName === 'José Pinheiro Junior' &&
    resFear.updatedSession.birthDate === '1990-03-20' &&
    !fearMsg.includes('To Medo Perder') &&
    (fearMsg.toLowerCase().includes('receio') || fearMsg.toLowerCase().includes('segurança') || fearMsg.toLowerCase().includes('pix') || fearMsg.toLowerCase().includes('confira'))
  ) {
    console.log('✅ TESTE 60 PASSOU! Nome mantido como "José Pinheiro Junior", data mantida como "1990-03-20", e resposta acolhedora de segurança enviada.');
  } else {
    console.error('❌ TESTE 60 FALHOU!', {
      fullName: resFear.updatedSession.fullName,
      birthDate: resFear.updatedSession.birthDate,
      reply: fearMsg
    });
  }

  // --- TESTES MANDATÓRIOS DO ROTEIRO OFICIAL (1 a 10) ---
  console.log('\n==================================================');
  console.log('--- EXECUTANDO OS 10 TESTES MANDATÓRIOS DE INTELIGÊNCIA CONTEXTUAL ---');

  // MANDATÓRIO 1: Saudação ("oi tudo bem?")
  console.log('\n[MANDATÓRIO 1] Cliente: "oi tudo bem?"');
  const m1Session = createKaelSession('m1');
  const m1Res = await handleKaelUserMessage(m1Session, 'oi tudo bem?');
  const m1Text = m1Res.newMessages.map(m => m.text).join('\n');
  console.log('Resposta M1:', m1Text);
  if (m1Res.updatedSession.fullName === undefined && (m1Text.toLowerCase().includes('olá') || m1Text.toLowerCase().includes('ajudar') || m1Text.toLowerCase().includes('tudo bem'))) {
    console.log('✅ MANDATÓRIO 1 PASSOU! (Saudação natural, nome não extraído)');
  } else {
    console.error('❌ MANDATÓRIO 1 FALHOU!', { fullName: m1Res.updatedSession.fullName, reply: m1Text });
  }

  // MANDATÓRIO 2: Entendimento da Funcionalidade ("isso funciona?")
  console.log('\n[MANDATÓRIO 2] Cliente: "isso funciona?"');
  const m2Session = createKaelSession('m2');
  const m2Res = await handleKaelUserMessage(m2Session, 'isso funciona?');
  const m2Text = m2Res.newMessages.map(m => m.text).join('\n');
  console.log('Resposta M2:', m2Text);
  if (m2Res.updatedSession.fullName === undefined && (m2Text.toLowerCase().includes('autoconhecimento') || m2Text.toLowerCase().includes('mapa') || m2Text.toLowerCase().includes('numerologia'))) {
    console.log('✅ MANDATÓRIO 2 PASSOU! (Explicação sobre funcionalidade prestada, nome não extraído)');
  } else {
    console.error('❌ MANDATÓRIO 2 FALHOU!', { fullName: m2Res.updatedSession.fullName, reply: m2Text });
  }

  // MANDATÓRIO 3: Identidade de IA ("você é uma IA?")
  console.log('\n[MANDATÓRIO 3] Cliente: "você é uma IA?"');
  const m3Session = createKaelSession('m3');
  const m3Res = await handleKaelUserMessage(m3Session, 'você é uma IA?');
  const m3Text = m3Res.newMessages.map(m => m.text).join('\n');
  console.log('Resposta M3:', m3Text);
  if (m3Res.updatedSession.fullName === undefined && (m3Text.toLowerCase().includes('kael') || m3Text.toLowerCase().includes('assistente') || m3Text.toLowerCase().includes('virtual'))) {
    console.log('✅ MANDATÓRIO 3 PASSOU! (Identidade de IA esclarecida com transparência, nome não extraído)');
  } else {
    console.error('❌ MANDATÓRIO 3 FALHOU!', { fullName: m3Res.updatedSession.fullName, reply: m3Text });
  }

  // MANDATÓRIO 4: Frustração do Usuário ("PORQUE SÓ RESPONDE COISAS REPETIDAS?")
  console.log('\n[MANDATÓRIO 4] Cliente: "PORQUE SÓ RESPONDE COISAS REPETIDAS?"');
  const m4Session = createKaelSession('m4');
  const m4Res = await handleKaelUserMessage(m4Session, 'PORQUE SÓ RESPONDE COISAS REPETIDAS?');
  const m4Text = m4Res.newMessages.map(m => m.text).join('\n');
  console.log('Resposta M4:', m4Text);
  if (m4Res.updatedSession.fullName === undefined && (m4Text.toLowerCase().includes('desculpas') || m4Text.toLowerCase().includes('repetição') || m4Text.toLowerCase().includes('compreendido'))) {
    console.log('✅ MANDATÓRIO 4 PASSOU! (Acolheu frustração, pediu desculpas pela repetição, nome não extraído)');
  } else {
    console.error('❌ MANDATÓRIO 4 FALHOU!', { fullName: m4Res.updatedSession.fullName, reply: m4Text });
  }

  // MANDATÓRIO 5: Solicitação de Suporte Humano ("queria falar com alguém de verdade")
  console.log('\n[MANDATÓRIO 5] Cliente: "queria falar com alguém de verdade"');
  const m5Session = createKaelSession('m5');
  const m5Res = await handleKaelUserMessage(m5Session, 'queria falar com alguém de verdade');
  const m5Text = m5Res.newMessages.map(m => m.text).join('\n');
  console.log('Resposta M5:', m5Text);
  if (m5Res.updatedSession.fullName === undefined && m5Res.updatedSession.fullName !== 'Falare Alguem' && (m5Text.toLowerCase().includes('digital') || m5Text.toLowerCase().includes('kael') || m5Text.toLowerCase().includes('chat') || m5Text.toLowerCase().includes('atendimento'))) {
    console.log('✅ MANDATÓRIO 5 PASSOU! (Explicou atendimento digital do Kael sem jamais salvar "Falare Alguem" como nome)');
  } else {
    console.error('❌ MANDATÓRIO 5 FALHOU!', { fullName: m5Res.updatedSession.fullName, reply: m5Text });
  }

  // MANDATÓRIO 6: Extração Correta de Nome ("José Pinheiro Junior")
  console.log('\n[MANDATÓRIO 6] Cliente: "José Pinheiro Junior"');
  const m6Session = createKaelSession('m6');
  const m6Res = await handleKaelUserMessage(m6Session, 'José Pinheiro Junior');
  console.log('Nome salvo M6:', m6Res.updatedSession.fullName);
  if (m6Res.updatedSession.fullName === 'José Pinheiro Junior') {
    console.log('✅ MANDATÓRIO 6 PASSOU! (Nome "José Pinheiro Junior" extraído perfeitamente)');
  } else {
    console.error('❌ MANDATÓRIO 6 FALHOU!', m6Res.updatedSession.fullName);
  }

  // MANDATÓRIO 7: Extração Correta de Data ("20 03 1990")
  console.log('\n[MANDATÓRIO 7] Cliente: "20 03 1990"');
  const m7Session = createKaelSession('m7');
  await handleKaelUserMessage(m7Session, 'José Pinheiro Junior');
  const m7Res = await handleKaelUserMessage(m7Session, '20 03 1990');
  console.log('Data salva M7:', m7Res.updatedSession.birthDate);
  if (m7Res.updatedSession.birthDate === '1990-03-20') {
    console.log('✅ MANDATÓRIO 7 PASSOU! (Data "20 03 1990" extraída como "1990-03-20")');
  } else {
    console.error('❌ MANDATÓRIO 7 FALHOU!', m7Res.updatedSession.birthDate);
  }

  // MANDATÓRIO 8: Objeção Financeira ("to com medo de perder meu dinheiro")
  console.log('\n[MANDATÓRIO 8] Cliente: "to com medo de perder meu dinheiro"');
  const m8Session = createKaelSession('m8');
  const m8Res = await handleKaelUserMessage(m8Session, 'to com medo de perder meu dinheiro');
  const m8Text = m8Res.newMessages.map(m => m.text).join('\n');
  console.log('Resposta M8:', m8Text);
  if (m8Res.updatedSession.fullName === undefined && (m8Text.toLowerCase().includes('receio') || m8Text.toLowerCase().includes('segurança') || m8Text.toLowerCase().includes('pix'))) {
    console.log('✅ MANDATÓRIO 8 PASSOU! (Objeção tratada acolhedoramente, nome não corrompido)');
  } else {
    console.error('❌ MANDATÓRIO 8 FALHOU!', { fullName: m8Res.updatedSession.fullName, reply: m8Text });
  }

  // MANDATÓRIO 9: Confirmação Ambígua ("pode ser")
  console.log('\n[MANDATÓRIO 9] Cliente em CONFIRMACAO_DOS_DADOS: "pode ser"');
  const m9Session = createKaelSession('m9');
  m9Session.fullName = 'José Pinheiro Junior';
  m9Session.birthDate = '1990-03-20';
  m9Session.currentState = 'CONFIRMACAO_DOS_DADOS';
  const m9Res = await handleKaelUserMessage(m9Session, 'pode ser');
  console.log('Estado M9:', m9Res.updatedSession.currentState);
  if (m9Res.updatedSession.currentState === 'CONFIRMACAO_DOS_DADOS') {
    console.log('✅ MANDATÓRIO 9 PASSOU! (Mantido em CONFIRMACAO_DOS_DADOS pedindo confirmação clara sem avançar indevidamente)');
  } else {
    console.error('❌ MANDATÓRIO 9 FALHOU!', m9Res.updatedSession.currentState);
  }

  // MANDATÓRIO 10: Pergunta durante Confirmação ("está correto, mas quanto tempo demora?")
  console.log('\n[MANDATÓRIO 10] Cliente em CONFIRMACAO_DOS_DADOS: "está correto, mas quanto tempo demora?"');
  const m10Session = createKaelSession('m10');
  m10Session.fullName = 'José Pinheiro Junior';
  m10Session.birthDate = '1990-03-20';
  m10Session.currentState = 'CONFIRMACAO_DOS_DADOS';
  const m10Res = await handleKaelUserMessage(m10Session, 'está correto, mas quanto tempo demora?');
  const m10Text = m10Res.newMessages.map(m => m.text).join('\n');
  console.log('Resposta M10:', m10Text);
  if (m10Text.toLowerCase().includes('elaborado') || m10Text.toLowerCase().includes('pagamento') || m10Text.toLowerCase().includes('pdf') || m10Text.toLowerCase().includes('conversa')) {
    console.log('✅ MANDATÓRIO 10 PASSOU! (Respondeu sobre o tempo/entrega e reancorou o fluxo)');
  } else {
    console.error('❌ MANDATÓRIO 10 FALHOU!', m10Text);
  }

  // MANDATÓRIO 11: Fluxo Completo de Correção do Nome
  console.log('\n[MANDATÓRIO 11] Fluxo de Correção de Nome');
  const m11Session = createKaelSession('m11');
  await handleKaelUserMessage(m11Session, 'José Pinheiro Juniore');
  await handleKaelUserMessage(m11Session, '20 03 1990');
  console.log('Pós dados iniciais -> Nome:', m11Session.fullName, '| Data:', m11Session.birthDate, '| Estado:', m11Session.currentState);

  const m11ErrRes = await handleKaelUserMessage(m11Session, 'meu nome está errado');
  console.log('Resposta após "meu nome está errado":', m11ErrRes.newMessages[0]?.text);
  console.log('SubState após "meu nome está errado":', m11Session.subState);

  const m11CorrRes = await handleKaelUserMessage(m11Session, 'José Pinheiro Junior');
  console.log('Resposta após "José Pinheiro Junior":', m11CorrRes.newMessages[0]?.text);
  console.log('Resultado final -> Nome:', m11Session.fullName, '| Data:', m11Session.birthDate, '| Estado:', m11Session.currentState);

  if (
    m11Session.fullName === 'José Pinheiro Junior' &&
    m11Session.birthDate === '1990-03-20' &&
    m11Session.currentState === 'CONFIRMACAO_DOS_DADOS' &&
    m11CorrRes.newMessages[0]?.text.includes('José Pinheiro Junior') &&
    m11CorrRes.newMessages[0]?.text.includes('20/03/1990')
  ) {
    console.log('✅ MANDATÓRIO 11 PASSOU! (Nome corrigido com sucesso, data mantida intacta, e resumo re-apresentado)');
  } else {
    console.error('❌ MANDATÓRIO 11 FALHOU!', {
      fullName: m11Session.fullName,
      birthDate: m11Session.birthDate,
      state: m11Session.currentState,
      subState: m11Session.subState,
      reply: m11CorrRes.newMessages[0]?.text
    });
  }

  // TESTE MANDATÓRIO 12: SAUDAÇÃO + CONTINUIDADE IMEDIATA DO FLUXO
  console.log('\n[TESTE MANDATÓRIO 12] Saudações com continuidade imediata do fluxo');

  // Case A: Greeting at conversation start
  const m12aSession = createKaelSession('m12a');
  const m12aRes = await handleKaelUserMessage(m12aSession, 'Oi, boa tarde!');
  console.log('Case A Reply:', m12aRes.newMessages[0]?.text);
  const m12aPassed = m12aRes.newMessages[0]?.text.includes('Boa tarde!') &&
    m12aRes.newMessages[0]?.text.includes('nome completo de nascimento') &&
    m12aSession.currentState === 'AGUARDANDO_NOME_DATA';

  // Case B: Greeting mid-flow when name already registered
  const m12bSession = createKaelSession('m12b');
  await handleKaelUserMessage(m12bSession, 'José Pinheiro Junior');
  const m12bRes = await handleKaelUserMessage(m12bSession, 'Oi, boa tarde!');
  console.log('Case B Reply:', m12bRes.newMessages[0]?.text);
  const m12bPassed = m12bRes.newMessages[0]?.text.includes('Boa tarde!') &&
    m12bRes.newMessages[0]?.text.includes('Recebi o seu nome (José Pinheiro Junior)') &&
    m12bRes.newMessages[0]?.text.includes('data de nascimento') &&
    m12bSession.fullName === 'José Pinheiro Junior';

  // Case C: Greeting + Question combined
  const m12cSession = createKaelSession('m12c');
  const m12cRes = await handleKaelUserMessage(m12cSession, 'Oi, boa tarde. Esse mapa funciona mesmo?');
  console.log('Case C Reply:', m12cRes.newMessages[0]?.text);
  const m12cPassed = m12cRes.newMessages[0]?.text.includes('Boa tarde!') &&
    (m12cRes.newMessages[0]?.text.includes('Numerologia') || m12cRes.newMessages[0]?.text.includes('mapa')) &&
    m12cRes.newMessages[0]?.text.includes('nome completo');

  // Case D: Greeting + Data combined
  const m12dSession = createKaelSession('m12d');
  await handleKaelUserMessage(m12dSession, 'José Pinheiro Junior');
  const m12dRes = await handleKaelUserMessage(m12dSession, 'Boa tarde, 20 03 1990');
  console.log('Case D Reply:', m12dRes.newMessages[0]?.text);
  const m12dPassed = m12dRes.newMessages[0]?.text.includes('Boa tarde!') &&
    m12dRes.newMessages[0]?.text.includes('20/03/1990') &&
    m12dSession.currentState === 'CONFIRMACAO_DOS_DADOS';

  if (m12aPassed && m12bPassed && m12cPassed && m12dPassed) {
    console.log('✅ MANDATÓRIO 12 PASSOU! (Saudações reconhecidas e fluxo mantido sem interrupções ou estagnação)');
  } else {
    console.error('❌ MANDATÓRIO 12 FALHOU!', {
      a: m12aPassed,
      b: m12bPassed,
      c: m12cPassed,
      d: m12dPassed
    });
  }

  console.log('\n--- FIM DOS TESTES DE NLU ---');
}

runKaelNLUTests().catch(err => console.error('Erro nos testes:', err));
