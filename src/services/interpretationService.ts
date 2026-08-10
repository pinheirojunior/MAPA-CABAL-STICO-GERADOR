import { GoogleGenAI } from '@google/genai';
import { EngineOutput, MapInterpretation } from '../types/numerology';
import { getNumberKnowledge } from '../knowledge/numbersDatabase';

/**
 * SERVIÇO DE INTERPRETAÇÃO EDITORIAL DIDÁTICA E PROFUNDA (MAPA CABALÍSTICO PERSONALIZADO)
 * 
 * Este serviço pega os números calculados pelo motor determinístico e gera
 * uma leitura profunda, acolhedora, acessível para leigos, sem jargões e totalmente
 * estruturada em passos didáticos (O que é -> Resultado -> Significado -> Exemplos -> Potenciais -> Cuidados).
 */
export async function generateInterpretation(engineData: EngineOutput): Promise<MapInterpretation> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = buildGeminiPrompt(engineData);

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        const fallback = getLocalFallbackInterpretation(engineData);

        return {
          introducao: {
            cartaAbertura: parsed.introducao?.cartaAbertura || fallback.introducao.cartaAbertura,
            oQueE: parsed.introducao?.oQueE || fallback.introducao.oQueE,
            comoInterpretar: parsed.introducao?.comoInterpretar || fallback.introducao.comoInterpretar,
            metodologia: parsed.introducao?.metodologia || fallback.introducao.metodologia
          },
          indicadoresTexto: {
            motivacaoText: parsed.indicadoresTexto?.motivacaoText || fallback.indicadoresTexto.motivacaoText,
            impressaoText: parsed.indicadoresTexto?.impressaoText || fallback.indicadoresTexto.impressaoText,
            expressaoText: parsed.indicadoresTexto?.expressaoText || fallback.indicadoresTexto.expressaoText,
            destinoText: parsed.indicadoresTexto?.destinoText || fallback.indicadoresTexto.destinoText,
            missaoText: parsed.indicadoresTexto?.missaoText || fallback.indicadoresTexto.missaoText
          },
          nomeEData: {
            distribuicaoText: parsed.nomeEData?.distribuicaoText || fallback.nomeEData.distribuicaoText,
            trianguloText: parsed.nomeEData?.trianguloText || fallback.nomeEData.trianguloText,
            dataIntegradaText: parsed.nomeEData?.dataIntegradaText || fallback.nomeEData.dataIntegradaText
          },
          desafiosECiclos: {
            desafiosTexto: parsed.desafiosECiclos?.desafiosTexto || fallback.desafiosECiclos.desafiosTexto,
            ciclosTexto: parsed.desafiosECiclos?.ciclosTexto || fallback.desafiosECiclos.ciclosTexto,
            anoPessoalTexto: parsed.desafiosECiclos?.anoPessoalTexto || fallback.desafiosECiclos.anoPessoalTexto
          },
          lifeAreas: parsed.lifeAreas && parsed.lifeAreas.length >= 5 ? parsed.lifeAreas : fallback.lifeAreas,
          crossings: parsed.crossings && parsed.crossings.length >= 2 ? parsed.crossings : fallback.crossings,
          sinteseFinal: {
            leituraIntegrada: parsed.sinteseFinal?.leituraIntegrada || fallback.sinteseFinal.leituraIntegrada,
            potenciaisDestacados: parsed.sinteseFinal?.potenciaisDestacados || fallback.sinteseFinal.potenciaisDestacados,
            desafiosPrincipais: parsed.sinteseFinal?.desafiosPrincipais || fallback.sinteseFinal.desafiosPrincipais,
            reflexoesFinais: parsed.sinteseFinal?.reflexoesFinais || fallback.sinteseFinal.reflexoesFinais,
            metricasValor: fallback.sinteseFinal.metricasValor
          },
          isAiGenerated: true
        };
      }
    } catch (err) {
      console.warn('Gemini API indisponível ou resposta inválida. Utilizando motor editorial local:', err);
    }
  }

  return getLocalFallbackInterpretation(engineData);
}

function buildGeminiPrompt(data: EngineOutput): string {
  const motiv = getNumberKnowledge(data.indicators.motivacao);
  const impr = getNumberKnowledge(data.indicators.impressao);
  const expr = getNumberKnowledge(data.indicators.expressao);
  const dest = getNumberKnowledge(data.indicators.destino);
  const miss = getNumberKnowledge(data.indicators.missao);

  return `
Você é o assistente analítico responsável pelo MAPA CABALÍSTICO PERSONALIZADO.
Sua missão é gerar um relatório profundo, didático, acolhedor e perfeitamente compreensível para uma pessoa LEIGA em numerologia.

CLIENTE:
- Nome Completo: "${data.inputs.fullName}"
- Data de Nascimento: ${data.inputs.day}/${data.inputs.month}/${data.inputs.year}

NÚMEROS CALCULADOS DETERMINISTICAMENTE (MANTENHA OS VALORES EXATOS):
- Motivação (Soma das Vogais): ${data.indicators.motivacao} (${motiv.title})
- Impressão (Soma das Consoantes): ${data.indicators.impressao} (${impr.title})
- Expressão (Soma do Nome Completo): ${data.indicators.expressao} (${expr.title})
- Destino (Soma da Data de Nascimento): ${data.indicators.destino} (${dest.title})
- Missão (Expressão + Destino): ${data.indicators.missao} (${miss.title})
- Vértice do Triângulo da Vida: ${data.nameAnalysis.lifeTriangle.baseVertex}
- Ano Pessoal Atual: ${data.dateAnalysis.personalYear.yearNumber} (${data.dateAnalysis.personalYear.theme})
- Desafios: ${data.dateAnalysis.challenges.map(c => `${c.challengeType}: ${c.value}`).join(', ')}
- Ciclos: ${data.dateAnalysis.cycles.map(c => `${c.period}: ${c.value}`).join(', ')}

REGRAS DE LINGUAGEM E DIDÁTICA (MUITO IMPORTANTES):
1. REGRAS DE IDENTIDADE E PROIBIÇÃO DE IA: NUNCA se refira a si mesmo como "seu numerólogo", "como numerólogo", "inteligência artificial", "IA", "AI", "modelo", "prompt" ou qualquer tecnologia. NUNCA mencione que este mapa foi gerado por computador ou IA. Refira-se exclusivamente a "este mapa", "esta leitura", "o MAPA CABALÍSTICO PERSONALIZADO", "o método utilizado".
2. ESCREVA PARA UMA PESSOA LEIGA: Antes de apresentar qualquer resultado ou interpretação, EXPLIQUE O CONCEITO em termos simples do dia a dia.
   Exemplo: Para a Motivação, explique primeiro: "Na numerologia cabalística, a Motivação representa aquilo que move a alma por dentro, os desejos íntimos e os valores que orientam suas escolhas mais profundas." Só depois apresente o resultado e os significados.
3. ESTRUTURA DIDÁTICA DE CADA INDICADOR:
   - O que é este indicador? (Explicação clara)
   - Qual é o seu resultado? (O número)
   - O que ele pode representar? (Significado geral)
   - Como isso aparece no cotidiano? (Exemplos práticos de situações da vida real)
   - Principais potenciais (Pontos fortes)
   - Pontos de atenção / cuidados (Sem ser alarmista ou fatalista)
4. LINGUAGEM RESPONSÁVEL E NÃO DETERMINISTA: Use sempre "pode indicar", "tende a", "dentro desta leitura simbólica", "é interessante observar". NUNCA faça previsões absolutas do tipo "você vai se divorciar" ou "ficará rico".
5. EVITE JARGÕES ACADÊMICOS OU MÍSTICOS EXAGERADOS: Prefira "uma pessoa que valoriza momentos de reflexão" em vez de "introspecção vibracional".

Retorne EXATAMENTE um JSON válido com a seguinte estrutura:
{
  "introducao": {
    "cartaAbertura": "Texto acolhedor e respeitoso apresentando o mapa...",
    "oQueE": "Explicação completa e simples sobre o que é o mapa cabalístico e como ele funciona...",
    "comoInterpretar": "Guia simples de leitura para o leitor tirar o melhor proveito...",
    "metodologia": "Explicação transparente da matemática alfabética e da data..."
  },
  "indicadoresTexto": {
    "motivacaoText": "Texto explicativo completo da Motivação (O que é -> Número ${data.indicators.motivacao} -> Significado -> Exemplos -> Potenciais -> Cuidados)...",
    "impressaoText": "Texto explicativo completo da Impressão (O que é -> Número ${data.indicators.impressao} -> Significado -> Exemplos -> Potenciais -> Cuidados)...",
    "expressaoText": "Texto explicativo completo da Expressão (O que é -> Número ${data.indicators.expressao} -> Significado -> Exemplos -> Potenciais -> Cuidados)...",
    "destinoText": "Texto explicativo completo do Destino (O que é -> Número ${data.indicators.destino} -> Significado -> Exemplos -> Potenciais -> Cuidados)...",
    "missaoText": "Texto explicativo completo da Missão (O que é -> Número ${data.indicators.missao} -> Significado -> Exemplos -> Potenciais -> Cuidados)..."
  },
  "nomeEData": {
    "distribuicaoText": "Explicação para leigos sobre a contagem dos números de 1 a 9 no nome, repetições e ausências...",
    "trianguloText": "Explicação simples sobre o Triângulo da Vida e o significado do Vértice ${data.nameAnalysis.lifeTriangle.baseVertex}...",
    "dataIntegradaText": "Explicação de como o dia natal, mês e ano se somam para formar o Destino..."
  },
  "desafiosECiclos": {
    "desafiosTexto": "Análise dos Desafios em tom didático, orientando como superá-los...",
    "ciclosTexto": "Análise das fases da vida (Ciclos) com linguagem fluida e clara...",
    "anoPessoalTexto": "Explicação do Ano Pessoal ${data.dateAnalysis.personalYear.yearNumber} e dicas práticas para o momento..."
  },
  "lifeAreas": [
    { "areaName": "Relacionamentos & Afeto", "associatedNumber": ${data.indicators.motivacao}, "text": "Texto explicativo e prático..." },
    { "areaName": "Família & Lar", "associatedNumber": ${data.indicators.impressao}, "text": "Texto explicativo e prático..." },
    { "areaName": "Comunicação & Expressão", "associatedNumber": ${data.indicators.expressao}, "text": "Texto explicativo e prático..." },
    { "areaName": "Profissão & Vocação", "associatedNumber": ${data.indicators.expressao}, "text": "Texto explicativo e prático..." },
    { "areaName": "Finanças & Prosperidade", "associatedNumber": ${data.indicators.destino}, "text": "Texto explicativo e prático..." },
    { "areaName": "Criatividade & Inovação", "associatedNumber": ${data.indicators.motivacao}, "text": "Texto explicativo e prático..." },
    { "areaName": "Desenvolvimento Pessoal", "associatedNumber": ${data.indicators.missao}, "text": "Texto explicativo e prático..." }
  ],
  "crossings": [
    { "title": "Motivação x Destino (Desejos da Alma x Caminho de Vida)", "numbersCombined": "${data.indicators.motivacao} & ${data.indicators.destino}", "text": "Explicação do diálogo entre a vontade interna e as oportunidades do caminho..." },
    { "title": "Expressão x Destino (Talentos Práticos x Propósito de Vida)", "numbersCombined": "${data.indicators.expressao} & ${data.indicators.destino}", "text": "Explicação de como usar os talentos no cotidiano..." }
  ],
  "sinteseFinal": {
    "leituraIntegrada": "Texto de conclusão unificando os aprendizados do mapa...",
    "potenciaisDestacados": ["Potencial 1", "Potencial 2", "Potencial 3", "Potencial 4"],
    "desafiosPrincipais": ["Ponto de atenção 1", "Ponto de atenção 2", "Ponto de atenção 3"],
    "reflexoesFinais": "Mensagem inspiradora e acolhedora de encerramento...",
    "metricasValor": "Mapa gerado com base em 5 indicadores mestres, matriz alfabética de 9 frequências e 7 áreas da vida."
  }
}
`;
}

/**
 * Motor editorial local de altíssima qualidade e didática para leigos.
 */
export function getLocalFallbackInterpretation(data: EngineOutput): MapInterpretation {
  const motiv = getNumberKnowledge(data.indicators.motivacao);
  const impr = getNumberKnowledge(data.indicators.impressao);
  const expr = getNumberKnowledge(data.indicators.expressao);
  const dest = getNumberKnowledge(data.indicators.destino);
  const miss = getNumberKnowledge(data.indicators.missao);

  const name = data.inputs.fullName;
  const day = data.inputs.day;
  const month = data.inputs.month;
  const year = data.inputs.year;

  const dist = data.nameAnalysis.distribution;
  const repStr = dist.repetitions.length > 0 ? dist.repetitions.join(', ') : 'Nenhum número em excesso';
  const absStr = dist.absences.length > 0 ? dist.absences.join(', ') : 'Todos os números de 1 a 9 estão presentes';
  const predStr = dist.predominances.length > 0 ? dist.predominances.join(', ') : 'Distribuição harmoniosa';

  return {
    introducao: {
      cartaAbertura: `Seja muito bem-vindo(a) ao seu MAPA CABALÍSTICO PERSONALIZADO, preparado especialmente para ${name}, com base no seu nome de nascimento e na sua data de nascimento (${day}/${month}/${year}).\n\n` +
        `Este documento foi concebido para ser um guia prático, claro e enriquecedor. Nosso objetivo não é fazer previsões mágicas ou adivinhações, mas sim oferecer uma ferramenta valiosa de autoconhecimento. Através da leitura simbólica dos números, você poderá compreender com mais clareza seus talentos naturais, suas motivações internas e as oportunidades de desenvolvimento ao longo da sua caminhada.\n\n` +
        `Desejamos que esta leitura traga reflexões úteis para o seu dia a dia e ajude a tomar decisões mais alinhadas com quem você realmente é.`,

      oQueE: `A Numerologia Cabalística é um sistema tradicional de estudos que relaciona as letras do nome e os números da data de nascimento a padrões de comportamento e tendências de personalidade.\n\n` +
        `Neste método, cada letra do seu nome é convertida em um valor numérico correspondente. A partir daí, calculamos indicadores específicos que ajudam a entender diferentes camadas de uma pessoa: o que ela deseja internamente (vogais), como ela é percebida socialmente (consoantes) e quais habilidades práticas ela possui (total do nome). Da mesma forma, a soma da sua data de nascimento revela o caminho e as fases da sua vida.`,

      comoInterpretar: `Para aproveitar ao máximo esta leitura, lembre-se de que nenhum número atua de forma isolada. O ser humano é dinâmico e multifacetado. Por isso, ao ler cada capítulo:\n\n` +
        `1. Observe como os números se complementam: por exemplo, sua motivação interna ganha força quando se alinha com seus talentos práticos.\n` +
        `2. Encare os pontos de atenção não como defeitos, mas como oportunidades de equilíbrio e maturidade.\n` +
        `3. Reflita sobre os exemplos do cotidiano trazidos no texto e veja onde eles se encaixam na sua vivência atual.`,

      metodologia: `Este estudo foi processado pelo MAPA CABALÍSTICO PERSONALIZADO utilizando a tabela alfabética tradicional e mantendo intactos os Números Mestres (11, 22 e 33). Todos os cálculos foram checados deterministicamente antes da elaboração do texto interpretativo.`
    },

    indicadoresTexto: {
      motivacaoText: `1. O QUE É A MOTIVAÇÃO?\n` +
        `Na leitura numerológica, a Motivação é calculada somando-se exclusivamente as VOGAIS do seu nome completo de nascimento. As vogais representam o som interior — aquilo que está guardado no seu coração, o seu combustível de vida, os valores íntimos e os desejos profundos que movem suas escolhas antes mesmo de você falar ou agir.\n\n` +
        `2. QUAL É O SEU RESULTADO?\n` +
        `No seu mapa, o cálculo das vogais resultou no NÚMERO ${data.indicators.motivacao} (${motiv.title}).\n\n` +
        `3. O QUE ESSA ENERGIA REPRESENTA?\n` +
        `O número ${data.indicators.motivacao} indica que a sua alma busca de maneira muito clara por ${motiv.centralMeaning.toLowerCase()}. Para você se sentir verdadeiramente realizado(a) por dentro, é essencial que suas atividades e relações respeitem esse desejo interior.\n\n` +
        `4. COMO ISSO PODE APARECER NO DIA A DIA?\n` +
        `No cotidiano, essa motivação pode se manifestar, por exemplo, em escolhas que priorizam a autenticidade e a independência de pensamento. ${motiv.relationships} Você tende a se sentir desmotivado(a) em ambientes onde há muita pressão sem propósito ou onde você não pode ser transparente.\n\n` +
        `5. SEUS PRINCIPAIS POTENCIAIS:\n` +
        `• ${motiv.potentials.join('\n• ')}\n\n` +
        `6. PONTOS DE ATENÇÃO E CUIDADOS:\n` +
        `Em momentos de estresse, vale a pena observar para não cair no excesso de ${motiv.challenges.join(' ou ')}. O equilíbrio dessa energia vem ao cultivar a paciência e a empatia.`,

      impressaoText: `1. O QUE É A IMPRESSÃO?\n` +
        `A Impressão é obtida através da soma das CONSOANTES do seu nome de nascimento. As consoantes formam a estrutura externa das palavras — por isso, na numerologia, este indicador representa a sua "vestimenta social". É a primeira imagem que você transmite quando chega a um ambiente e como as pessoas costumam perceber você antes de um contato mais íntimo.\n\n` +
        `2. QUAL É O SEU RESULTADO?\n` +
        `A soma das consoantes do seu nome resulta no NÚMERO ${data.indicators.impressao} (${impr.title}).\n\n` +
        `3. O QUE ESSA ENERGIA REPRESENTA?\n` +
        `Com a Impressão ${data.indicators.impressao}, o ambiente ao seu redor tende a ver você como alguém ${impr.characteristics.slice(0, 3).join(', ')}. Essa vibração passa uma imagem de ${impr.centralMeaning.toLowerCase()}.\n\n` +
        `4. COMO ISSO APARECE NAS SUAS INTERAÇÕES?\n` +
        `Nas primeiras conversas e reuniões de trabalho, seu estilo de comunicação tende a ser ${impr.communication.toLowerCase()}. É comum que as pessoas sintam confiança e procurem você buscando ${impr.potentials[0] || 'clareza e orientação'}.\n\n` +
        `5. CUIDADOS COM A IMAGEM PROJETADA:\n` +
        `É importante garantir que a imagem percebida pelos outros não crie um tom de distanciamento. Busque sempre permitir que a sua verdadeira motivação interna (${data.indicators.motivacao}) transpareça com naturalidade nas suas conversas.`,

      expressaoText: `1. O QUE É A EXPRESSÃO?\n` +
        `A Expressão é a soma de TODAS AS LETRAS do seu nome completo (vogais + consoantes). Ela junta o seu desejo interno (vogais) com a sua imagem externa (consoantes) para mostrar o conjunto dos seus talentos práticos, aptidões de trabalho e a forma como você coloca suas ideias em ação no mundo real.\n\n` +
        `2. QUAL É O SEU RESULTADO?\n` +
        `A soma total das letras do seu nome resulta no NÚMERO ${data.indicators.expressao} (${expr.title}).\n\n` +
        `3. O QUE ESSA ENERGIA REPRESENTA?\n` +
        `A Expressão ${data.indicators.expressao} destaca habilidades naturais para ${expr.centralMeaning.toLowerCase()}. Você possui capacidade de realizar projetos que exigem ${expr.potentials.join(', ')}.\n\n` +
        `4. APLICAÇÃO PRÁTICA NO TRABALHO E PROJETOS:\n` +
        `${expr.work} No dia a dia, sua forma de resolver problemas é marcada por uma abordagem ${expr.characteristics.slice(0, 2).join(' e ')}.\n\n` +
        `5. POTENCIAIS E PONTOS DE DESENVOLVIMENTO:\n` +
        `Seus maiores talentos ganham destaque quando você atua com foco. Para aproveitar melhor sua Expressão ${data.indicators.expressao}, evite ${expr.challenges.join(' e ')}.`,

      destinoText: `1. O QUE É O DESTINO NUMEROLÓGICO?\n` +
        `O Destino (também conhecido como Caminho de Vida) é obtido somando-se os números da sua data natal (${day}/${month}/${year}). Enquanto o nome mostra quem você é, a data de nascimento indica o "cenário de vida" — as oportunidades, os aprendizados constantes e o caminho que o ambiente apresenta para você evoluir.\n\n` +
        `2. QUAL É O SEU RESULTADO?\n` +
        `A soma da sua data de nascimento resulta no NÚMERO DE DESTINO ${data.indicators.destino} (${dest.title}).\n\n` +
        `3. O QUE ISSO SIGNIFICA PARA A SUA TRAJETÓRIA?\n` +
        `Caminhar pelo Destino ${data.indicators.destino} significa ser convidado(a) constantemente pela vida a desenvolver ${dest.centralMeaning.toLowerCase()}. As situações cotidianas trarão desafios e oportunidades para você praticar ${dest.characteristics.join(', ')}.\n\n` +
        `4. EXEMPLOS PRÁTICOS NO DIA A DIA:\n` +
        `Esse caminho exige de você ${dest.relationships.toLowerCase()}. Nas tomadas de decisão importantes, o maior aprendizado será: ${dest.personalDevelopment}\n\n` +
        `5. COMO APROVEITAR MELHOR ESSE CAMINHO:\n` +
        `Ao acolher de forma consciente os aprendizados do Destino ${data.indicators.destino}, você transforma momentos difíceis em degraus de maturidade e sabedoria.`,

      missaoText: `1. O QUE É A MISSÃO DE VIDA?\n` +
        `A Missão é a síntese máxima do seu mapa numerológico. Ela é calculada somando o número da sua Expressão (seus talentos práticos) com o número do seu Destino (o seu caminho de vida). Ela representa o ponto em que suas capacidades individuais se conectam com o seu propósito geral no mundo.\n\n` +
        `2. QUAL É O SEU RESULTADO?\n` +
        `A combinação da sua Expressão com o seu Destino resulta na MISSÃO NÚMERO ${data.indicators.missao} (${miss.title}).\n\n` +
        `3. SIGNIFICAADO E PROPÓSITO:\n` +
        `A sua Missão realiza-se quando você coloca seus talentos a serviço de ${miss.centralMeaning.toLowerCase()}. Não se trata de uma obrigação pesada, mas sim daquela atividade que traz um sentimento profundo de realização pessoal ao ser concluída.\n\n` +
        `4. APLICAÇÃO NO DIA A DIA:\n` +
        `Você cumpre sua missão quando utiliza suas aptidões para ${miss.potentials.join(', ')}. Esse propósito inspira e impacta positivamente as pessoas que convivem com você.`
    },

    nomeEData: {
      distribuicaoText: `1. O QUE É A DISTRIBUIÇÃO NUMÉRICA?\n` +
        `A Distribuição Numérica é a contagem de quantas vezes cada número (de 1 a 9) aparece nas letras do seu nome de nascimento. Essa contagem mostra a intensidade de cada característica no seu perfil.\n\n` +
        `2. O QUE INDICAM AS REPETIÇÕES E AUSÊNCIAS NO SEU NOME?\n` +
        `• Números que aparecem várias vezes (${repStr}): Indicam características muito fortes em você, talentos marcantes que surgem espontaneamente no seu dia a dia.\n` +
        `• Números ausentes no nome (${absStr}): É fundamental esclarecer que um número ausente NÃO é um defeito ou falta de capacidade. Ele representa apenas uma habilidade que talvez não seja tão natural para você e que pode ser aprendida de forma consciente ao longo da vida.\n` +
        `• Frequência predominante (${predStr}): Funciona como um tom constante que dá direção à sua forma de agir.`,

      trianguloText: `1. O QUE É O TRIÂNGULO DA VIDA?\n` +
        `O Triângulo da Vida é uma representação em pirâmide obtida ao combinar sequencialmente as letras do seu nome até chegar a um único número final no topo da pirâmide (chamado de Vértice).\n\n` +
        `2. RESULTADO E INTERPRETAÇÃO:\n` +
        `O Vértice do seu Triângulo é a Vibração ${data.nameAnalysis.lifeTriangle.baseVertex}. Este número atua como um ponto de ancoragem, mostrando como suas intenções e ideias se concretizam na prática. ${data.nameAnalysis.lifeTriangle.description}`,

      dataIntegradaText: `1. COMO A DATA DE NASCIMENTO É ANALISADA?\n` +
        `Sua data de nascimento (${day}/${month}/${year}) é composta por três partes que se integram harmoniosamente:\n\n` +
        `• O Dia (${day}): Mostra suas reações imediatas no dia a dia e seu estilo de ação diária.\n` +
        `• O Mês (${month}): Relaciona-se com a sua forma de sentir e lidar com as emoções.\n` +
        `• O Ano (${year}): Reflete a influência do seu tempo e do contexto em que você nasceu.\n\n` +
        `A união do dia, mês e ano resulta no seu Destino ${data.indicators.destino}, garantindo que suas experiências diárias estejam alinhadas com o seu aprendizado geral.`
    },

    desafiosECiclos: {
      desafiosTexto: `1. O QUE SÃO OS DESAFIOS NUMEROLÓGICOS?\n` +
        `Os Desafios são números que apontam os testes de maturidade e os aprendizados mais importantes ao longo da vida. Eles mostram onde vale a pena dedicar um cuidado especial para não cometer os mesmos erros em momentos de decisão.\n\n` +
        `2. SEUS DESAFIOS CALCULADOS:\n\n` +
        data.dateAnalysis.challenges.map(ch => `• ${ch.challengeType} (Número ${ch.value}): ${ch.meaning}. O aprendizado principal aqui é: ${ch.learnings.join(', ')}.`).join('\n\n'),

      ciclosTexto: `1. O QUE SÃO OS CICLOS DE VIDA?\n` +
        `A vida é dividida didaticamente em Três Grandes Ciclos evolutivos: o Primeiro Ciclo (infância e juventude), o Segundo Ciclo (maturidade produtiva) e o Terceiro Ciclo (fase de consolidação e sabedoria).\n\n` +
        `2. SEUS CICLOS CALCULADOS:\n\n` +
        data.dateAnalysis.cycles.map(cyc => `• ${cyc.period} (${cyc.ageRange}) - Número ${cyc.value}: ${cyc.symbolicInterpretation}`).join('\n\n'),

      anoPessoalTexto: `1. O QUE É O ANO PESSOAL?\n` +
        `O Ano Pessoal indica o clima geral e o tema prioritário para os seus próximos doze meses (calculado a partir do seu último aniversário até o próximo).\n\n` +
        `2. SEU ANO PESSOAL ATUAL:\n` +
        `Você está no ANO PESSOAL NÚMERO ${data.dateAnalysis.personalYear.yearNumber} (Tema: ${data.dateAnalysis.personalYear.theme}).\n\n` +
        `3. ORIENTAÇÃO PRÁTICA:\n` +
        `${data.dateAnalysis.personalYear.interpretation} Aproveite este momento para focar nas escolhas que mais combinam com a energia do seu ano atual.`
    },

    lifeAreas: [
      {
        areaName: 'Relacionamentos & Afeto',
        associatedNumber: data.indicators.motivacao,
        text: `O QUE É ANALISADO AQUI: A forma como você vivencia o amor, a intimidade e a parceria afetiva.\n\n` +
          `INTERPRETAÇÃO: Regida pela sua Motivação ${data.indicators.motivacao}, a sua vida afetiva pede autenticidade e respeito mútuo. ${motiv.relationships} O diálogo aberto e a confiança são a base para relacionamentos duradouros.`
      },
      {
        areaName: 'Família & Lar',
        associatedNumber: data.indicators.impressao,
        text: `O QUE É ANALISADO AQUI: Seu papel na convivência familiar e no ambiente doméstico.\n\n` +
          `INTERPRETAÇÃO: Com regência da sua Impressão ${data.indicators.impressao}, no lar você busca construir um ambiente de ${impr.centralMeaning.toLowerCase()}. As pessoas da família tendem a ver você como um porto seguro.`
      },
      {
        areaName: 'Comunicação & Expressão',
        associatedNumber: data.indicators.expressao,
        text: `O QUE É ANALISADO AQUI: Sua capacidade de se expor, dialogar e defender suas ideias.\n\n` +
          `INTERPRETAÇÃO: Influenciada pela sua Expressão ${data.indicators.expressao}, sua comunicação é mais eficiente quando você utiliza ${expr.communication.toLowerCase()}. Sua fala ganha força quando acompanhada de clareza e empatia.`
      },
      {
        areaName: 'Profissão & Vocação',
        associatedNumber: data.indicators.expressao,
        text: `O QUE É ANALISADO AQUI: Seus talentos profissionais e os ambientes de trabalho mais adequados.\n\n` +
          `INTERPRETAÇÃO: No campo profissional, sua Expressão ${data.indicators.expressao} indica excelente capacidade em atividades que exijam ${expr.work.toLowerCase()}. Você se destaca quando tem liberdade para aplicar suas ideias com organização.`
      },
      {
        areaName: 'Finanças & Prosperidade',
        associatedNumber: data.indicators.destino,
        text: `O QUE É ANALISADO AQUI: Sua relação com o dinheiro, o trabalho produtivo e a segurança material.\n\n` +
          `INTERPRETAÇÃO: Sob a influência do seu Destino ${data.indicators.destino}, a prosperidade financeira vem como fruto da persistência, da responsabilidade e do planejamento de longo prazo.`
      },
      {
        areaName: 'Criatividade & Inovação',
        associatedNumber: data.indicators.motivacao,
        text: `O QUE É ANALISADO AQUI: Sua capacidade de inventar, solucionar problemas e criar coisas novas.\n\n` +
          `INTERPRETAÇÃO: Sua centelha de inovação ganha força quando alinhada à sua Motivação ${data.indicators.motivacao}. Permitir-se momentos de inspiração e estudo renova suas energias.`
      },
      {
        areaName: 'Desenvolvimento Pessoal',
        associatedNumber: data.indicators.missao,
        text: `O QUE É ANALISADO AQUI: Sua busca por maturidade, autoconhecimento e paz interior.\n\n` +
          `INTERPRETAÇÃO: A regência da sua Missão ${data.indicators.missao} convida a buscar constantemente o aprendizado e o equilíbrio pessoal. Viver em sintonia com seus valores é o seu maior trunfo.`
      }
    ],

    crossings: [
      {
        title: 'Motivação x Destino (O Desejo Interno Encontrando o Caminho)',
        numbersCombined: `${data.indicators.motivacao} & ${data.indicators.destino}`,
        text: `O QUE SIGNIFICA ESTE CRUZAMENTO: Este estudo analisa como os seus desejos íntimos (Motivação ${data.indicators.motivacao}) conversam com as oportunidades que o caminho da vida apresenta (Destino ${data.indicators.destino}).\n\n` +
          `INTERPRETAÇÃO INTEGRADA: Quando você utiliza a força da sua Motivação para caminhar pela estrada do seu Destino, a vida ganha fluidez. Você consegue tomar decisões mais conscientes e transformar os obstáculos em aprendizados valiosos.`
      },
      {
        title: 'Expressão x Destino (Os Talentos Práticos Aplicados no Caminho)',
        numbersCombined: `${data.indicators.expressao} & ${data.indicators.destino}`,
        text: `O QUE SIGNIFICA ESTE CRUZAMENTO: Mostra como suas habilidades de trabalho e ação (Expressão ${data.indicators.expressao}) podem ser usadas no dia a dia para cumprir o seu propósito de vida (Destino ${data.indicators.destino}).\n\n` +
          `INTERPRETAÇÃO INTEGRADA: Seus talentos naturais funcionam como ferramentas feitas sob medida para o seu caminho. Utilizar suas aptidões com disciplina garante um progresso consistente em todas as áreas.`
      }
    ],

    sinteseFinal: {
      leituraIntegrada: `SÍNTESE DA LEITURA INTEGRADA DO SEU MAPA:\n\n` +
        `O estudo numerológico de ${name} revela uma combinação muito rica e equilibrada de características. Ao observar em conjunto sua Motivação (${data.indicators.motivacao}), Impressão (${data.indicators.impressao}), Expressão (${data.indicators.expressao}), Destino (${data.indicators.destino}) e Missão (${data.indicators.missao}), percebe-se uma pessoa com enorme potencial de realização, inteligência prática e capacidade de aprendizado contínuo.\n\n` +
        `O segredo para extrair o melhor deste mapa é viver de forma alinhada aos seus valores, usando seus talentos com equilíbrio e mantendo a atenção nos pontos de desenvolvimento identificados.`,
      potenciaisDestacados: [
        `Capacidade natural de realização e organização (Expressão ${data.indicators.expressao})`,
        `Busca constante por autenticidade e propósito nas ações (Motivação ${data.indicators.motivacao})`,
        `Boa presença social e capacidade de transmitir confiança (Impressão ${data.indicators.impressao})`,
        `Abertura para os aprendizados contínuos do caminho da vida (Destino ${data.indicators.destino})`
      ],
      desafiosPrincipais: [
        `Manter o equilíbrio emocional e o foco nas metas do seu Ano Pessoal ${data.dateAnalysis.personalYear.yearNumber}`,
        `Conciliar momentos de ação intensa com momentos necessários de descanso e reflexão`,
        `Trabalhar com calma e consciência o aprendizado do seu Desafio Principal`
      ],
      reflexoesFinais: `Esperamos que esta leitura do MAPA CABALÍSTICO PERSONALIZADO sirva como um farol permanente de clareza, inspirando suas escolhas e fortalecendo a sua jornada de autoconhecimento.`,
      metricasValor: `Estudo elaborado a partir de 5 indicadores mestres, análise frequencial do nome, 7 áreas de vida e matriz de 3 ciclos temporais.`
    },
    isAiGenerated: false
  };
}
