/**
 * client-real.js — Dados do modo "Cliente Real" do SQL Detective.
 *
 * Narrativa de consultoria: um cliente (NPC) chega com um pedido de
 * negócio vago ("quero saber se as vendas estão boas"). O jogador precisa:
 *   1. CLARIFICAR — interpretar o pedido com perguntas de escopo;
 *   2. ANALISAR — decidir quais queries executar para responder;
 *   3. APRESENTAR — comunicar a análise em linguagem de negócio.
 *
 * Cada desafio (consulta de consultoria) tem três fases. A validação das
 * queries segue o contrato padrão das missões (expectedColumns +
 * referenceQuery), permitindo múltiplas formas válidas de chegar ao mesmo
 * resultado. A apresentação é validada por heurística de comunicação:
 * palavras obrigatórias (dados concretos) e sinais de vago (feedback).
 *
 * Banco: "Aurora Varejo" (client-real/db-seed.js) — regiões, vendedores,
 * vendas diárias e metas mensais do 1º trimestre de 2024.
 */

/* Prefixo dos ids de desafio (ids de string, como bug-hunter e boss). */
export const CLIENT_REAL_PREFIX = 'cr-';

export const CLIENT_REAL_INTRO = {
  title: 'Modo Cliente Real',
  subtitle: 'Consultor de Dados — Comunicação Técnica',
  story: `Nem todo pedido chega pronto em forma de SQL. No mundo real, o cliente
chega com frases como "quero saber se as vendas estão boas" — e espera que
VOCÊ transforme essa vagueza em perguntas certas, queries certas e uma
resposta que ele entenda. Neste modo, você atende consultorias de clientes
fictícios da Aurora Varejo: primeiro clarifica o que ele realmente precisa
saber, depois investiga o banco e por fim apresenta a análise em linguagem
de negócio. O cliente vai reagir à sua comunicação: número na mão, contexto
e recomendação. Resposta vaga, cliente insatisfeito.`,
  mission: 'Atenda as 3 consultorias para concluir o modo.',
};

export const CLIENT_REAL_CONCLUSION = {
  title: 'Consultorias Concluídas',
  story: `Você atendeu todas as consultorias da Aurora Varejo. Transformou
pedidos vagos em perguntas certas, queries certeiras e análises que o
cliente entende — com número, contexto e recomendação. Essa tríade
(pergunta → dado → decisão) é exatamente o que separa quem "sabe SQL"
de quem atua como analista de verdade.`,
  nextSteps: 'As consultorias foram entregues. Pratique no Sandbox ou avance nos demais modos.',
};

export function getTotalLevels() {
  return ENGAGEMENTS.length;
}

/** Compatibilidade com código que usa activeCase.getLevel(id). */
export function getLevel(id) {
  return getEngagement(id);
}

export function getEngagement(id) {
  return ENGAGEMENTS.find(e => e.id === id) || null;
}

/**
 * Heurística de avaliação da apresentação em linguagem de negócio.
 * Retorna {passed, feedback} — o feedback já vem formatado como voz do cliente.
 * @param {string} report texto da apresentação do jogador
 * @param {object} engagement desafio da consultoria
 * @returns {{passed: boolean, feedback: string}}
 */
export function evaluateReport(report, engagement) {
  const text = String(report || '').trim();
  if (text.length < 30) {
    return {
      passed: false,
      feedback: `"${escapeForFeedback(text)}" — isso é pouco para um relatório. Uma análise de consultoria precisa apresentar os números com contexto. Escreva ao menos 2-3 frases completas.`,
    };
  }
  const lower = text.toLowerCase();
  const words = lower.match(/[a-záéíóúâêôãõç0-9]+/g) || [];
  const wordSet = new Set(words);

  // 1. Dados concretos (valores/entidades que só aparecem com análise real).
  // Os requiredWords incluem formas alternativas (ex.: '30.700'/'30700', 'março'/'marco');
  // o jogador só precisa citar ALGUMAS dessas formas — exige-se no mínimo a metade.
  const requiredDataWords = engagement.reportRequiredWords || [];
  const matchedDataWords = requiredDataWords.filter(word => lower.includes(word));
  const missingDataWords = requiredDataWords.filter(word => !lower.includes(word));
  // 2. Sinais de comunicação vaga (sem números, sem conclusão)
  const vagueSignals = (engagement.reportVagueSignals || []).filter(sig =>
    lower.includes(sig)
  );
  // 3. Recomendações obrigatórias (fase consultiva) — basta UM indicativo de orientação.
  const matchedAdviceWords = (engagement.reportAdviceWords || []).filter(word =>
    lower.includes(word)
  );

  if (requiredDataWords.length > 0 && matchedDataWords.length < Math.ceil(requiredDataWords.length / 2)) {
    return {
      passed: false,
      feedback: `"${escapeForFeedback(text)}" — o cliente não encontrou os dados que pediu (${missingDataWords.slice(0, 5).join(', ')}...). Uma boa apresentação cita os números da sua própria análise — quem viu o resultado da query sabe responder com dados concretos.`,
    };
  }
  if ((engagement.reportAdviceWords || []).length > 0 && matchedAdviceWords.length === 0) {
    return {
      passed: false,
      feedback: `"${escapeForFeedback(text)}" — bom, você trouxe os números, mas um consultor também orienta a decisão. Faltou indicar o que fazer com o que foi descoberto (ex.: recomendar, sugerir um plano, investir, monitorar).`,
    };
  }
  if (vagueSignals.length >= 2) {
    return {
      passed: false,
      feedback: `"${escapeForFeedback(text)}" — o tom está vago demais. Evite expressões como ${vagueSignals.slice(0, 2).map(s => `"${s}"`).join(' e ')} sem número junto: o cliente quer fatos, não impressões.`,
    };
  }
  return {
    passed: true,
    feedback: `${engagement.reportPraise} Excelente comunicação técnica: dados concretos, contexto e recomendação.`,
  };
}

function escapeForFeedback(text) {
  return text.slice(0, 120).replace(/"/g, "'");
}

/* ------------------------------------------------------------------ */
/* Consultorias                                                        */
/* ------------------------------------------------------------------ */

export const ENGAGEMENTS = [
  {
    id: 'cr-1',
    number: 1,
    title: 'Consultoria 01 — "Estão as vendas boas?"',
    difficulty: 'Iniciante',
    client: {
      name: 'Sérgio Almeida',
      role: 'Diretor Comercial',
      company: 'Aurora Varejo',
      avatar: '👔',
      tone: 'Executivo prático: quer resposta rápida e números na mesa.',
    },
    briefing: `Sérgio entrou na sala sem marcar reunião. "Preciso que você me diga
se as vendas estão boas. Não tenho tempo para planilha — me traz o essencial."
Um pedido desses exige método: primeiro você entende O QUE "boas" significa
para ele (quanto vendeu? comparado a quê? em que período?), depois investiga
e por fim apresenta a conclusão com números.`,
    /* --- Fase 1: clarificação --- */
    clarifications: [
      {
        question: 'Para responder "se as vendas estão boas", o que você precisa saber primeiro?',
        options: [
          { id: 'a', text: 'O período de análise e a referência de comparação (meta ou histórico).', correct: true, feedback: 'Correto — sem período e sem régua, "boas" não significa nada.' },
          { id: 'b', text: 'O nome completo de todos os vendedores.', correct: false, feedback: 'Nomes sozinhos não respondem "boas ou ruins" — isso vem depois, se necessário.' },
          { id: 'c', text: 'Os e-mails internos da empresa.', correct: false, feedback: 'E-mails não medem vendas. Foque nos dados de faturamento.' },
        ],
      },
      {
        question: 'Sérgio pergunta "quanto vendemos?". Qual pergunta de escopo você faz a ele?',
        options: [
          { id: 'a', text: '"Boa pergunta! Vou verificar tudo o que o banco tem."', correct: false, feedback: 'Responder vagueza com vagueza não ajuda o cliente. Delimite o escopo.' },
          { id: 'b', text: '"Quer o total por mês, por região ou por vendedor — e de qual período?"', correct: true, feedback: 'Exatamente — isso transforma o pedido vago em consultas objetivas.' },
          { id: 'c', text: '"Isso é confidencial, preciso de autorização do jurídico."', correct: false, feedback: 'Ele é o diretor comercial; o dado é dele. Sua função é entregar a análise.' },
        ],
      },
    ],
    /* --- Fase 2: análises (queries) --- */
    analyses: [
      {
        id: 'a1',
        label: 'Pergunta 1 — Panorama mensal',
        context: `Sérgio quer ver a evolução. Ele diz: "me mostra quanto a gente vendeu em cada mês."
Traga o faturamento total de cada mês do banco.`,
        objective: 'Retorne o ano-mês e o total faturado (em centavos) de cada mês, ordenado do mais antigo ao mais recente.',
        tables: ['vendas'],
        expectedColumns: ['ano_mes', 'total_faturado_centavos'],
        referenceQuery: "SELECT strftime('%Y-%m', data_venda) AS ano_mes, SUM(valor_centavos) AS total_faturado_centavos FROM vendas GROUP BY strftime('%Y-%m', data_venda) ORDER BY ano_mes ASC;",
        requiredConcepts: ['group by', 'sum'],
        insight: 'O faturamento cresceu de R$ 23.450,00 em janeiro e fevereiro para R$ 30.700,00 em março — salto de 31% no último mês.',
      },
      {
        id: 'a2',
        label: 'Pergunta 2 — Realizado vs. meta',
        context: `"Boas" também significa "dentro do planejado". Cruze as vendas de março
com as metas mensais dos vendedores para mostrar realizado e meta lado a lado.`,
        objective: 'Em março de 2024 ("2024-03"), retorne o nome do vendedor, o total realizado e a meta de cada um, ordenado pelo realizado em ordem decrescente.',
        tables: ['vendedores', 'vendas', 'metas_mensais'],
        expectedColumns: ['vendedor', 'valor_realizado_centavos', 'meta_centavos'],
        referenceQuery: "SELECT v.nome AS vendedor, COALESCE(SUM(ve.valor_centavos), 0) AS valor_realizado_centavos, m.meta_centavos FROM vendedores v JOIN metas_mensais m ON m.vendedor_id = v.id AND m.ano_mes = '2024-03' LEFT JOIN vendas ve ON ve.vendedor_id = v.id AND strftime('%Y-%m', ve.data_venda) = '2024-03' GROUP BY v.id, v.nome, m.meta_centavos ORDER BY valor_realizado_centavos DESC;",
        requiredConcepts: ['join', 'group by'],
        insight: 'Lucas Prado liderou março com R$ 13.300,00 (meta de R$ 7.000,00); Fernanda Costa (R$ 1.700,00) e Camila Rocha (R$ 2.400,00) ficaram abaixo das metas de R$ 3.000,00 e R$ 4.000,00.'
      },
    ],
    /* --- Fase 3: apresentação --- */
    reportPrompt: `Escreva a mensagem de volta ao Sérgio: 2 a 4 frases respondendo se as vendas
estão boas, com os números que você encontrou (faturamento por mês, comparativo com as metas)
e uma recomendação prática.`,
    reportRequiredWords: ['30.700', '23.450', 'cresc', 'março', 'fernanda', 'lucas', 'meta', '13.300', '1.700'],
    reportAdviceWords: ['recomend', 'sugest', 'acompanh', 'investig', 'apoio', 'plano', 'ação'],
    reportVagueSignals: ['acho que', 'deve estar', 'mais ou menos', 'acho que sim', 'talvez esteja', 'não sei'],
    reportPraise: `"Ótimo trabalho — isso sim é uma resposta de consultor."`,
    clientReactionPassed: `Sérgio leu e respondeu: "Perfeito. Faturamento subiu para R$ 30.700,00 em março e a Fernanda fora da meta — vou chamar ela. Manda o relatório no meu e-mail."`,
    clientReactionFailed: `Sérgio respondeu: "Isso não me diz nada. 'Acho que está bom' não fecha contrato com diretoria — me traz números na próxima."`,
  },
  {
    id: 'cr-2',
    number: 2,
    title: 'Consultoria 02 — "Quem puxa a carroça?"',
    difficulty: 'Intermediário',
    client: {
      name: 'Marina Duarte',
      role: 'Gerente Regional Sudeste',
      company: 'Aurora Varejo',
      avatar: '👩‍💼',
      tone: 'Analítica e exigente: adora ranking e comparações entre regiões.',
    },
    briefing: `Marina quer saber "quem puxa a carroça" na rede — quais regiões e
vendedores sustentam o faturamento. O pedido é informal, mas por trás dele
existem perguntas precisas: total por região, ranking de vendedores e a
participação de cada um. Decida as queries na ordem certa e monte o ranking.`,
    clarifications: [
      {
        question: 'Marina fala em "quem puxa a carroça". Como você traduz isso em escopo de dados?',
        options: [
          { id: 'a', text: 'Faturamento agrupado por região e ranking individual de vendedores.', correct: true, feedback: 'Certo — "quem sustenta" vira agregação por região + ranking por pessoa.' },
          { id: 'b', text: 'Listar todos os produtos vendidos na rede.', correct: false, feedback: 'Não existe tabela de produtos no banco — e o pedido é sobre quem vende, não o quê.' },
          { id: 'c', text: 'Verificar quais vendedores chegaram atrasados.', correct: false, feedback: 'Pontualidade não está nos dados nem no pedido. Foque no faturamento.' },
        ],
      },
    ],
    analyses: [
      {
        id: 'a1',
        label: 'Pergunta 1 — Ranking de regiões',
        context: `Marina quer comparar as três regiões sob sua supervisão corporativa.
Traga o total faturado no trimestre por região.`,
        objective: 'Retorne o nome da região e o faturamento total do trimestre (centavos), ordenado do maior para o menor.',
        tables: ['regioes', 'vendedores', 'vendas'],
        expectedColumns: ['regiao', 'faturamento_total_centavos'],
        referenceQuery: 'SELECT r.nome AS regiao, SUM(ve.valor_centavos) AS faturamento_total_centavos FROM regioes r JOIN vendedores v ON v.regiao_id = r.id JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY r.id, r.nome ORDER BY faturamento_total_centavos DESC;',
        requiredConcepts: ['join', 'group by', 'sum'],
        insight: 'O Sudeste lidera com R$ 39.750,00 no trimestre, seguido do Sul (R$ 26.150,00) e do Norte (R$ 11.700,00).',
      },
      {
        id: 'a2',
        label: 'Pergunta 2 — Ranking individual',
        context: `"Quero ver quem são meus melhores vendedores, sem enrolação."
Monte o ranking do trimestre por vendedor com sua região.`,
        objective: 'Retorne o nome do vendedor, sua região e o total faturado no trimestre, ordenado do maior para o menor.',
        tables: ['vendedores', 'regioes', 'vendas'],
        expectedColumns: ['vendedor', 'regiao', 'total_faturado_centavos'],
        referenceQuery: 'SELECT v.nome AS vendedor, r.nome AS regiao, SUM(ve.valor_centavos) AS total_faturado_centavos FROM vendedores v JOIN regioes r ON r.id = v.regiao_id JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY v.id, v.nome, r.nome ORDER BY total_faturado_centavos DESC;',
        requiredConcepts: ['join', 'group by', 'order by'],
        insight: 'Lucas Prado (Sudeste) lidera com R$ 32.750,00 no trimestre — mais do que Sul e Norte juntos (R$ 37.850,00).',
      },
      {
        id: 'a3',
        label: 'Pergunta 3 — Participação (share)',
        context: `Marina gosta de percentuais: "qual a fatia do meu top vendedor no total?"
Calcule a participação de cada vendedor no faturamento do trimestre.`,
        objective: 'Retorne o nome do vendedor e sua participação percentual no faturamento total do trimestre (use ROUND(x, 2) para exibir com 2 casas), ordenado pela participação em ordem decrescente.',
        tables: ['vendedores', 'vendas'],
        expectedColumns: ['vendedor', 'participacao_percentual'],
        referenceQuery: "SELECT v.nome AS vendedor, ROUND(SUM(ve.valor_centavos) * 100.0 / (SELECT SUM(valor_centavos) FROM vendas), 2) AS participacao_percentual FROM vendedores v JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY v.id, v.nome ORDER BY participacao_percentual DESC;",
        requiredConcepts: ['group by', 'sum', 'round'],
        insight: 'Lucas Prado responde por 42,2% de todo o faturamento do trimestre — concentração alta em um único vendedor.',
      },
    ],
    reportPrompt: `Escreva a mensagem para a Marina: apresente o ranking (quem lidera região e vendedor),
a participação do top vendedor e uma recomendação sobre a dependência (ou não) de poucos vendedores.`,
    reportRequiredWords: ['sudeste', '39.750', 'lucas', '32.750', '42', 'participa'],
    reportAdviceWords: ['depend', 'risc', 'distribu', 'invest', 'refor', 'contrat', 'trein', 'desenvolv'],
    reportVagueSignals: ['acho que', 'deve ser bom', 'mais ou menos', 'parece que', 'sei lá'],
    reportPraise: `"Exatamente o que eu precisava — ranking, números e alerta de risco."`,
    clientReactionPassed: `Marina aprovou: "O Sudeste carrega a operação e o Lucas sozinho é 42% — vou pedir plano de desenvolvimento para o time do Norte."`,
    clientReactionFailed: `Marina respondeu: "Ranking sem números não é ranking. Na próxima, quero percentuais e nomes, não adjetivos."`,
  },
  {
    id: 'cr-3',
    number: 3,
    title: 'Consultoria 03 — "O desconto está comendo a margem?"',
    difficulty: 'Avançado',
    client: {
      name: 'Roberto Alves',
      role: 'Gerente Regional Sul',
      company: 'Aurora Varejo',
      avatar: '🧔',
      tone: 'Desconfiado: suspeita de que vendedores dão desconto demais.',
    },
    briefing: `Roberto ouviu um boato: "meus vendedores estão comprando venda com
desconto para bater meta". Ele quer saber se o comportamento de desconto é
anormal — e em qual região. Agora o pedido tem suspeita embutida: você
precisa medir o desconto médio por região e por vendedor, comparar com o
contexto e concluir se a suspeita se confirma.`,
    clarifications: [
      {
        question: 'A suspeita é sobre desconto. Como você estruturaria a investigação?',
        options: [
          { id: 'a', text: 'Desconto médio por região e por vendedor, comparando as regiões entre si.', correct: true, feedback: 'Certo — a comparação entre regiões revela se o comportamento é localizado.' },
          { id: 'b', text: 'Contar quantas vendas cada vendedor fez por dia.', correct: false, feedback: 'Volume diário não mede desconto. A coluna desconto_percentual está nas vendas.' },
          { id: 'c', text: 'Verificar se as metas estão altas demais.', correct: false, feedback: 'Metas não explicam desconto concedido. Meça o que está nos dados de venda.' },
        ],
      },
    ],
    analyses: [
      {
        id: 'a1',
        label: 'Pergunta 1 — Desconto médio por região',
        context: `Compare o desconto médio concedido em cada região. Use AVG sobre
desconto_percentual das vendas de cada região.`,
        objective: 'Retorne o nome da região e o desconto médio (AVG, com ROUND de 2 casas), ordenado pelo desconto médio em ordem decrescente.',
        tables: ['regioes', 'vendedores', 'vendas'],
        expectedColumns: ['regiao', 'desconto_medio'],
        referenceQuery: 'SELECT r.nome AS regiao, ROUND(AVG(ve.desconto_percentual), 2) AS desconto_medio FROM regioes r JOIN vendedores v ON v.regiao_id = r.id JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY r.id, r.nome ORDER BY desconto_medio DESC;',
        requiredConcepts: ['join', 'group by', 'avg'],
        insight: 'O Norte lidera o desconto médio (7,00%), seguido do Sul (4,56%) e do Sudeste (2,82%).',
      },
      {
        id: 'a2',
        label: 'Pergunta 2 — Desconto por vendedor',
        context: `Desça o detalhe: dentro de cada região, quem concede mais desconto?
Traga vendedor, região e desconto médio individual.`,
        objective: 'Retorne o nome do vendedor, sua região e o desconto médio concedido (ROUND 2 casas), ordenado do maior desconto para o menor.',
        tables: ['vendedores', 'regioes', 'vendas'],
        expectedColumns: ['vendedor', 'regiao', 'desconto_medio'],
        referenceQuery: 'SELECT v.nome AS vendedor, r.nome AS regiao, ROUND(AVG(ve.desconto_percentual), 2) AS desconto_medio FROM vendedores v JOIN regioes r ON r.id = v.regiao_id JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY v.id, v.nome, r.nome ORDER BY desconto_medio DESC;',
        requiredConcepts: ['join', 'group by', 'avg', 'round'],
        insight: 'Fernanda Costa (Norte) concede 9% de desconto médio — o maior da rede — e ainda assim é a vendedora com menor faturamento.',
      },
    ],
    reportPrompt: `Escreva a mensagem para o Roberto: apresente o desconto médio por região e por vendedor,
diga se a suspeita dele se confirma (e onde), e recomende uma ação de gestão comercial.`,
    reportRequiredWords: ['4,56', '2,82', '7,00', 'norte', 'sul', 'sudeste', 'fernanda'],
    reportAdviceWords: ['política', 'politica', 'regra', 'limite', 'aprova', 'teto', 'máximo', 'maximo', 'monitor', 'acompanh'],
    reportVagueSignals: ['acho que', 'deve estar', 'não sei se', 'talvez', 'meio', 'mais ou menos'],
    reportPraise: `"Agora tenho dados para agir — não só um boato."`,
    clientReactionPassed: `Roberto respondeu: "O Norte é o problema, não o Sul. Fernanda dá 9% de desconto e não bate meta. Vou propor teto de desconto por região."`,
    clientReactionFailed: `Roberto respondeu: "Isso não responde nada. Onde está o número do meu Sul? Onde está o nome de quem dá desconto? Tenta de novo."`,
  },
];

export { SCHEMA_SQL, SEED_SQL } from './client-real/db-seed.js';
