/**
 * levels.js — Missões do Projeto 13: Finanças e Cartões de Crédito
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs) => ({
  id, title, concept, briefing: `Análise de Transações Financeiras e Cartões de Crédito. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs,
});

export const CASE_INTRO = {
  title: 'Comportamento de Gastos, Inadimplência e Risco de Crédito',
  subtitle: 'Projeto #13 — Finanças Pessoais e Banking Analytics',
  story: 'A divisão de risco e crédito do banco digital precisa auditar o comportamento de compras dos portadores de cartão, calcular o volume de inadimplência e traçar o perfil patrimonial por faixa de score.',
  mission: 'Resolva as 10 missões para gerar a visão de risco e faturamento consolidada.',
};

export const DATABASE_ANALYSIS = {
  title: 'Contas correntes, cartões de crédito, faturas e categorias de consumo',
  summary: 'O modelo desacopla os dados de renda e pontuação de crédito dos limites concedidos nos cartões e dos registros de faturamento diário, permitindo calcular alavancagem financeira e calotes.',
  entities: [
    { name: 'tipos_conta', role: 'Modalidades de conta e pacotes de tarifas mensais.', key: 'PK id', relations: [] },
    { name: 'clientes_banco', role: 'Cadastro de correntistas com score de crédito e renda.', key: 'PK id', relations: ['tipo_conta_id → tipos_conta.id'] },
    { name: 'cartoes', role: 'Cartões emitidos, limites disponíveis e status de bloqueio.', key: 'PK id', relations: ['cliente_id → clientes_banco.id'] },
    { name: 'categorias_gastos', role: 'Segmentos de compra e classificação de essencialidade.', key: 'PK id', relations: [] },
    { name: 'faturas_transacoes', role: 'Lançamentos de compras com datas, valores e status de liquidação.', key: 'PK id', relations: ['cartao_id → cartoes.id', 'categoria_id → categorias_gastos.id'] },
  ],
  decisions: [
    { title: 'Valores em centavos inteiros', explanation: 'Evita problemas de arredondamento de ponto flutuante em somas contábeis e de conciliação bancária.' },
    { title: 'Status de liquidação na transação', explanation: 'Registra se o lançamento foi pago, está pendente ou entrou em inadimplência (default).' },
    { title: 'Cartão desacoplado do cliente', explanation: 'Permite que um correntista possua múltiplos plásticos (titular, adicional, virtual) mantendo o histórico individual.' },
  ],
  checkpoints: [
    { question: 'Como calcular o percentual de comprometimento do limite do cartão?', answer: 'Dividindo o total de transações faturadas no período pelo limite_centavos do cartão.' },
    { question: 'Por que o status de pagamento é relevante na análise de risco?', answer: 'Transações com status inadimplente revelam perdas diretas que exigem provisionamento contra calote (PCLD).' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Auditoria de Crédito Finalizada',
  story: 'Contas Premium e Corporate concentraram 91,9% do volume transacionado. Thiago, único cliente da amostra com score inferior a 500, concentrou as 2 transações inadimplentes, que somam R$ 2.950,00.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou continue para os próximos cenários.',
};

export const LEVELS = [
  mission(
    1,
    'Faturamento por Categoria de Gasto',
    'SUM + GROUP BY',
    'Mostre o nome da categoria e o valor total faturado (em centavos) em compras com cartão.',
    ['categorias_gastos', 'faturas_transacoes'],
    ['categoria', 'total_gasto_centavos'],
    'SELECT c.nome AS categoria, SUM(t.valor_centavos) AS total_gasto_centavos FROM categorias_gastos c JOIN faturas_transacoes t ON t.categoria_id = c.id GROUP BY c.id, c.nome ORDER BY total_gasto_centavos DESC;',
    ['group by', 'sum', 'join'],
    ['Junte categorias_gastos e faturas_transacoes.', 'Agrupe pelo id e nome da categoria.', 'Some valor_centavos e ordene descendentemente.'],
    'Eletrônicos e Viagens lideram o montante financeiro transacionado.',
    'Agregações por categoria revelam os hábitos de consumo dos clientes.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    2,
    'Volume Total de Gastos por Cliente',
    'SUM + JOIN',
    'Calcule a soma de gastos no cartão (em centavos) para cada cliente cadastrado.',
    ['clientes_banco', 'cartoes', 'faturas_transacoes'],
    ['cliente', 'total_compras_centavos'],
    'SELECT cb.nome AS cliente, SUM(ft.valor_centavos) AS total_compras_centavos FROM clientes_banco cb JOIN cartoes c ON c.cliente_id = cb.id JOIN faturas_transacoes ft ON ft.cartao_id = c.id GROUP BY cb.id, cb.nome ORDER BY total_compras_centavos DESC;',
    ['join', 'group by', 'sum'],
    ['Junte clientes_banco, cartoes e faturas_transacoes.', 'Agrupe por cliente e some valor_centavos.', 'Ordene descendentemente.'],
    'Patrícia Nogueira e Gustavo Prado concentram as maiores faturas.',
    'JOINs cruzados medem o faturamento total por conta bancária.',
    ['joins-inner-left', 'aggregation-groupby']
  ),
  mission(
    3,
    'Transações Inadimplentes e Prejuízo',
    'WHERE + SUM + COUNT',
    'Calcule a quantidade de transações inadimplentes e o montante financeiro total em centavos não quitado.',
    ['faturas_transacoes'],
    ['total_inadimplentes', 'prejuizo_total_centavos'],
    "SELECT COUNT(id) AS total_inadimplentes, SUM(valor_centavos) AS prejuizo_total_centavos FROM faturas_transacoes WHERE status_pagamento = 'inadimplente';",
    ['where', 'sum', 'count'],
    ["Filtre WHERE status_pagamento = 'inadimplente'.", 'Calcule COUNT(id) e SUM(valor_centavos).', 'Use os aliases total_inadimplentes e prejuizo_total_centavos.'],
    'As transações inadimplentes geraram R$ 2.950,00 de prejuízo direto.',
    'Identificar calotes direciona as ações do setor de cobrança e renegociação.',
    ['dml-select-where', 'aggregation-groupby']
  ),
  mission(
    4,
    'Clientes com Alto Volume de Compras',
    'HAVING',
    'Liste os clientes cujo total faturado no cartão ultrapassou R$ 10.000,00 (1000000 centavos).',
    ['clientes_banco', 'cartoes', 'faturas_transacoes'],
    ['cliente', 'total_gasto_centavos'],
    'SELECT cb.nome AS cliente, SUM(ft.valor_centavos) AS total_gasto_centavos FROM clientes_banco cb JOIN cartoes c ON c.cliente_id = cb.id JOIN faturas_transacoes ft ON ft.cartao_id = c.id GROUP BY cb.id, cb.nome HAVING SUM(ft.valor_centavos) > 1000000 ORDER BY total_gasto_centavos DESC;',
    ['having', 'group by', 'sum'],
    ['Junte clientes_banco, cartoes e faturas_transacoes.', 'Agrupe por cliente e aplique HAVING SUM(ft.valor_centavos) > 1000000.', 'Ordene por total_gasto_centavos DESC.'],
    'Maurício, Gustavo e Patrícia compõem a carteira de alto valor do banco.',
    'HAVING filtra clientes de alto patrimônio para ofertas de produtos exclusivos.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    5,
    'Classificação de Risco de Crédito',
    'CASE WHEN',
    'Para cada cliente, exiba o nome, score de crédito e classifique como: "Excelente" (score >= 800), "Bom" (score >= 650) ou "Risco Alto" (score < 650).',
    ['clientes_banco'],
    ['cliente', 'score_credito', 'risco_credito'],
    "SELECT nome AS cliente, score_credito, CASE WHEN score_credito >= 800 THEN 'Excelente' WHEN score_credito >= 650 THEN 'Bom' ELSE 'Risco Alto' END AS risco_credito FROM clientes_banco ORDER BY score_credito DESC;",
    ['case'],
    ['Selecione o nome e o score de cada cliente.', 'Use CASE WHEN score_credito >= 800 THEN \'Excelente\' ... END.', 'Ordene por score_credito DESC.'],
    'Clientes com Risco Alto devem passar por análise manual de limite.',
    'Classificações condicionais de score automatizam motores de decisão de crédito.',
    ['case-when', 'dml-select-where']
  ),
  mission(
    6,
    'Top 3 Transações de Maior Valor',
    'ORDER BY + LIMIT',
    'Liste as 3 transações de maior valor registradas no cartão, exibindo nome do cliente, nome da categoria e valor em centavos.',
    ['clientes_banco', 'cartoes', 'categorias_gastos', 'faturas_transacoes'],
    ['cliente', 'categoria', 'valor_centavos'],
    'SELECT cb.nome AS cliente, cg.nome AS categoria, ft.valor_centavos FROM faturas_transacoes ft JOIN cartoes c ON c.id = ft.cartao_id JOIN clientes_banco cb ON cb.id = c.cliente_id JOIN categorias_gastos cg ON cg.id = ft.categoria_id ORDER BY ft.valor_centavos DESC LIMIT 3;',
    ['order by', 'limit', 'join'],
    ['Junte faturas_transacoes com cartoes, clientes_banco e categorias_gastos.', 'Ordene por ft.valor_centavos DESC.', 'Aplique LIMIT 3.'],
    'Compras de eletrônicos e viagens lideram o ticket unitário da amostra.',
    'Identificar outliers de alto valor previne fraudes e monitora limites transacionais.',
    ['having-where-orderby-like', 'joins-inner-left']
  ),
  mission(
    7,
    'Faturamento Mensal com Cartão',
    'strftime + SUM',
    'Mostre o ano-mês da transação e a soma total transacionada em centavos.',
    ['faturas_transacoes'],
    ['ano_mes', 'total_faturado_centavos'],
    "SELECT strftime('%Y-%m', data_transacao) AS ano_mes, SUM(valor_centavos) AS total_faturado_centavos FROM faturas_transacoes GROUP BY strftime('%Y-%m', data_transacao) ORDER BY ano_mes ASC;",
    ['group by', 'sum'],
    ['Extraia o ano-mês com strftime(\'%Y-%m\', data_transacao).', 'Agrupe pelo ano-mês e some valor_centavos.', 'Ordene por ano_mes ASC.'],
    'O mês de Janeiro registrou a maior concentração de compras de início de ano.',
    'Agrupamentos cronológicos apoiam a projeção de fluxo de caixa e receita de intercâmbio.',
    ['aggregation-groupby', 'dml-select-where']
  ),
  mission(
    8,
    'Comprometimento de Limite do Cartão',
    'CTE + JOIN + Comparação',
    'Identifique os clientes que consumiram mais de 50% do limite total do cartão em compras.',
    ['clientes_banco', 'cartoes', 'faturas_transacoes'],
    ['cliente', 'limite_centavos', 'total_gasto_centavos'],
    'WITH gastos AS (SELECT cartao_id, SUM(valor_centavos) AS total_gasto_centavos FROM faturas_transacoes GROUP BY cartao_id) SELECT cb.nome AS cliente, c.limite_centavos, g.total_gasto_centavos FROM clientes_banco cb JOIN cartoes c ON c.cliente_id = cb.id JOIN gastos g ON g.cartao_id = c.id WHERE g.total_gasto_centavos > (c.limite_centavos * 0.5) ORDER BY g.total_gasto_centavos DESC;',
    ['with', 'join', 'where'],
    ['Crie uma CTE somando os gastos por cartão.', 'Junte com clientes_banco e cartoes.', 'Filtre WHERE total_gasto_centavos > (limite_centavos * 0.5) e ordene descendentemente.'],
    'Maurício, Gustavo, Camila e Thiago comprometeram mais da metade do limite concedido.',
    'Comparar saldo devedor com limite mede a propensão a endividamento do cliente.',
    ['cte-subqueries', 'joins-inner-left']
  ),
  mission(
    9,
    'Gastos Acumulados por Cliente (Running Total)',
    'Window SUM OVER',
    'Para as compras do cliente "Maurício Dias Silveira", exiba a data da transação, o valor da compra em centavos e o total acumulado até aquele momento.',
    ['clientes_banco', 'cartoes', 'faturas_transacoes'],
    ['data_transacao', 'valor_centavos', 'total_acumulado_centavos'],
    "SELECT ft.data_transacao, ft.valor_centavos, SUM(ft.valor_centavos) OVER(ORDER BY ft.data_transacao ASC, ft.id ASC) AS total_acumulado_centavos FROM faturas_transacoes ft JOIN cartoes c ON c.id = ft.cartao_id JOIN clientes_banco cb ON cb.id = c.cliente_id WHERE cb.nome = 'Maurício Dias Silveira' ORDER BY ft.data_transacao ASC;",
    ['sum', 'over', 'join', 'where'],
    ["Filtre pelo cliente Maurício.", 'Use SUM(ft.valor_centavos) OVER(ORDER BY ft.data_transacao ASC, ft.id ASC) AS total_acumulado_centavos.', 'Ordene por ft.data_transacao ASC.'],
    'A evolução acumulada mostra o ritmo acelerado de consumo ao longo do trimestre.',
    'SUM() OVER com ORDER BY cria séries temporais acumuladas sem necessidade de auto-joins.',
    ['window-functions', 'joins-inner-left']
  ),
  {
    ...mission(
      10,
      'View de Perfil Financeiro dos Clientes',
      'CREATE VIEW + JOIN + GROUP BY',
      'Crie a view vw_perfil_financeiro_clientes contendo cliente_id, cliente, tipo_conta, score_credito, limite_centavos e total_gasto_centavos.',
      ['clientes_banco', 'tipos_conta', 'cartoes', 'faturas_transacoes'],
      ['cliente_id', 'cliente', 'tipo_conta', 'score_credito', 'limite_centavos', 'total_gasto_centavos'],
      'CREATE VIEW vw_perfil_financeiro_clientes AS SELECT cb.id AS cliente_id, cb.nome AS cliente, tc.nome AS tipo_conta, cb.score_credito, c.limite_centavos, COALESCE(SUM(ft.valor_centavos), 0) AS total_gasto_centavos FROM clientes_banco cb JOIN tipos_conta tc ON tc.id = cb.tipo_conta_id JOIN cartoes c ON c.cliente_id = cb.id LEFT JOIN faturas_transacoes ft ON ft.cartao_id = c.id GROUP BY cb.id, cb.nome, tc.nome, cb.score_credito, c.limite_centavos;',
      ['create view', 'join', 'group by', 'coalesce'],
      ['Crie a view com CREATE VIEW vw_perfil_financeiro_clientes AS SELECT ...', 'Junte clientes_banco, tipos_conta, cartoes e faturas_transacoes.', 'Use COALESCE(SUM(ft.valor_centavos), 0) AS total_gasto_centavos.'],
      'A view de consolidação financeira está homologada para auditoria do Banco Central.',
      'Views corporativas unificam o histórico transacional com as características cadastrais.',
      ['views', 'joins-inner-left', 'aggregation-groupby']
    ),
    executionMode: 'create_view',
    viewName: 'vw_perfil_financeiro_clientes',
    verificationQuery: 'SELECT * FROM vw_perfil_financeiro_clientes ORDER BY cliente_id ASC;',
    expectedResultQuery: 'SELECT cb.id AS cliente_id, cb.nome AS cliente, tc.nome AS tipo_conta, cb.score_credito, c.limite_centavos, COALESCE(SUM(ft.valor_centavos), 0) AS total_gasto_centavos FROM clientes_banco cb JOIN tipos_conta tc ON tc.id = cb.tipo_conta_id JOIN cartoes c ON c.cliente_id = cb.id LEFT JOIN faturas_transacoes ft ON ft.cartao_id = c.id GROUP BY cb.id, cb.nome, tc.nome, cb.score_credito, c.limite_centavos ORDER BY cliente_id ASC;',
  },
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
