/**
 * levels.js — Missões do Projeto 15: Dados Públicos e Municípios
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs) => ({
  id, title, concept, briefing: `Análise Orçamentária e Fiscal de Dados Públicos Municipais. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs,
});

export const CASE_INTRO = {
  title: 'Gastos Governamentais, Execução Orçamentária e Despesa Per Capita',
  subtitle: 'Projeto #15 — GovTech, Transparência & Dados Públicos',
  story: 'Auditores de um tribunal de contas municipal precisam consolidar a execução de despesas empenhadas e liquidadas nas áreas de saúde e educação, calculando o investimento real per capita por cidadão.',
  mission: 'Resolva as 10 missões de auditoria fiscal para gerar a visão de transparência governamental.',
};

export const DATABASE_ANALYSIS = {
  title: 'Federação, municípios brasileiros, áreas temáticas e execução fiscal',
  summary: 'O modelo desacopla os dados demográficos e econômicos das cidades das áreas temáticas e dos empenhos e liquidações fiscais, viabilizando análises de eficiência e cumprimento de mínimos constitucionais.',
  entities: [
    { name: 'estados', role: 'Unidades da Federação e macrorregiões do país.', key: 'PK id', relations: [] },
    { name: 'municipios', role: 'Cidades com código IBGE, população e PIB anual.', key: 'PK id', relations: ['estado_id → estados.id'] },
    { name: 'areas_governo', role: 'Funções orçamentárias (Saúde, Educação, Segurança, etc.).', key: 'PK id', relations: [] },
    { name: 'despesas_publicas', role: 'Valores empenhados e liquidados por ano fiscal.', key: 'PK id', relations: ['municipio_id → municipios.id', 'area_id → areas_governo.id'] },
  ],
  decisions: [
    { title: 'Empenhado vs Liquidado', explanation: 'Distingue o montante reservado em orçamento (empenho) da despesa efetivamente auditada e entregue (liquidação).' },
    { title: 'Código IBGE padronizado', explanation: 'Garante interoperabilidade com outros repositórios de dados abertos federais.' },
    { title: 'Valores em centavos inteiros', explanation: 'Assegura conformidade de fechamento contábil e balanço orçamentário público.' },
  ],
  checkpoints: [
    { question: 'Como calcular o investimento público per capita de um município?', answer: 'Dividindo a soma do valor_liquidado_centavos pela coluna populacao da tabela municipios.' },
    { question: 'O que representa a taxa de liquidação orçamentária?', answer: 'A razão percentual entre o valor efetivamente liquidado e o total inicialmente empenhado.' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Auditoria Fiscal e Contábil Concluída',
  story: 'A Educação Básica e Saúde Pública concentraram mais de 70% do orçamento municipal, mantendo taxa média de liquidação de 95% do valor empenhado.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou continue para o último projeto.',
};

export const LEVELS = [
  mission(
    1,
    'Execução Orçamentária por Área de Governo',
    'SUM + GROUP BY',
    'Mostre o nome da área de governo e o total liquidado (em centavos) em despesas públicas.',
    ['areas_governo', 'despesas_publicas'],
    ['area', 'total_liquidado_centavos'],
    'SELECT a.nome AS area, SUM(d.valor_liquidado_centavos) AS total_liquidado_centavos FROM areas_governo a JOIN despesas_publicas d ON d.area_id = a.id GROUP BY a.id, a.nome ORDER BY total_liquidado_centavos DESC;',
    ['group by', 'sum', 'join'],
    ['Junte areas_governo e despesas_publicas.', 'Agrupe pela área e some valor_liquidado_centavos.', 'Ordene descendentemente.'],
    'Educação Básica e Saúde Pública absorvem a maior parcela do orçamento.',
    'Agrupamentos funcionais demonstram as prioridades de políticas públicas.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    2,
    'Gasto Público Total por Município',
    'SUM + JOIN',
    'Calcule o valor total liquidado em despesas para cada município cadastrado.',
    ['municipios', 'despesas_publicas'],
    ['municipio', 'total_liquidado_centavos'],
    'SELECT m.nome AS municipio, SUM(d.valor_liquidado_centavos) AS total_liquidado_centavos FROM municipios m JOIN despesas_publicas d ON d.municipio_id = m.id GROUP BY m.id, m.nome ORDER BY total_liquidado_centavos DESC;',
    ['join', 'group by', 'sum'],
    ['Junte municipios e despesas_publicas.', 'Agrupe pelo município e some valor_liquidado_centavos.', 'Ordene por total_liquidado_centavos DESC.'],
    'São Paulo e Rio de Janeiro executam os maiores volumes orçamentários absolutos.',
    'JOINs fiscais totalizam a movimentação financeira por ente federado.',
    ['joins-inner-left', 'aggregation-groupby']
  ),
  mission(
    3,
    'Investimento Público Per Capita',
    'SUM + Divisão + CAST',
    'Calcule o gasto público total liquidado per capita (em centavos por habitante) para cada município.',
    ['municipios', 'despesas_publicas'],
    ['municipio', 'populacao', 'gasto_per_capita_centavos'],
    'SELECT m.nome AS municipio, m.populacao, CAST(SUM(d.valor_liquidado_centavos) / m.populacao AS INTEGER) AS gasto_per_capita_centavos FROM municipios m JOIN despesas_publicas d ON d.municipio_id = m.id GROUP BY m.id, m.nome, m.populacao ORDER BY gasto_per_capita_centavos DESC;',
    ['join', 'group by', 'sum'],
    ['Divida SUM(valor_liquidado_centavos) por m.populacao.', 'Agrupe pelo município e sua população.', 'Ordene por gasto_per_capita_centavos DESC.'],
    'Curitiba, São Paulo e Campinas apresentaram investimento público por cidadão superior à média da amostra.',
    'O cálculo per capita normaliza grandezas orçamentárias pelo tamanho demográfico.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    4,
    'Recursos Alocados em Saúde Pública',
    'WHERE + JOIN',
    'Liste o nome do município, a sigla do estado e o valor liquidado em "Saúde Pública".',
    ['municipios', 'estados', 'areas_governo', 'despesas_publicas'],
    ['municipio', 'estado', 'valor_saude_centavos'],
    "SELECT m.nome AS municipio, e.sigla AS estado, d.valor_liquidado_centavos AS valor_saude_centavos FROM despesas_publicas d JOIN municipios m ON m.id = d.municipio_id JOIN estados e ON e.id = m.estado_id JOIN areas_governo a ON a.id = d.area_id WHERE a.nome = 'Saúde Pública' ORDER BY valor_saude_centavos DESC;",
    ['where', 'join'],
    ["Filtre WHERE a.nome = 'Saúde Pública'.", 'Junte despesas_publicas, municipios, estados e areas_governo.', 'Ordene por valor_saude_centavos DESC.'],
    'A capital paulista e fluminense lideram os aportes no SUS municipal.',
    'Filtros de área direcionam auditorias de cumprimento de mínimos constitucionais.',
    ['joins-inner-left', 'dml-select-where']
  ),
  mission(
    5,
    'Municípios com Grande Volume Orçamentário',
    'HAVING',
    'Identifique os municípios cujo total liquidado ultrapassou R$ 10 bilhões (1.000.000.000.000 de centavos).',
    ['municipios', 'despesas_publicas'],
    ['municipio', 'total_liquidado_centavos'],
    'SELECT m.nome AS municipio, SUM(d.valor_liquidado_centavos) AS total_liquidado_centavos FROM municipios m JOIN despesas_publicas d ON d.municipio_id = m.id GROUP BY m.id, m.nome HAVING SUM(d.valor_liquidado_centavos) > 1000000000000 ORDER BY total_liquidado_centavos DESC;',
    ['having', 'group by', 'sum'],
    ['Junte municipios e despesas_publicas.', 'Agrupe por município e aplique HAVING SUM(d.valor_liquidado_centavos) > 1000000000000.', 'Ordene descendentemente.'],
    'São Paulo e Rio de Janeiro integram o grupo acima de R$ 10 bilhões liquidados.',
    'HAVING filtra orçamentos de grande magnitude para fiscalização especial.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    6,
    'Classificação de Porte Populacional',
    'CASE WHEN',
    'Para cada município, mostre o nome, a população e classifique como: "Metrópole" (>= 5.000.000), "Grande Porte" (>= 1.500.000) ou "Médio Porte" (< 1.500.000).',
    ['municipios'],
    ['municipio', 'populacao', 'porte_populacional'],
    "SELECT nome AS municipio, populacao, CASE WHEN populacao >= 5000000 THEN 'Metrópole' WHEN populacao >= 1500000 THEN 'Grande Porte' ELSE 'Médio Porte' END AS porte_populacional FROM municipios ORDER BY populacao DESC;",
    ['case'],
    ['Selecione o município e sua população.', 'Aplique CASE WHEN populacao >= 5000000 THEN \'Metrópole\' ... END.', 'Ordene por populacao DESC.'],
    'São Paulo e Rio figuram como as duas grandes metrópoles nacionais da amostra.',
    'Segmentações demográficas orientam repasses de fundos de participação (FPM).',
    ['case-when', 'dml-select-where']
  ),
  mission(
    7,
    'Ranking de Cidades por PIB',
    'Window DENSE_RANK',
    'Liste o nome do município, a sigla do estado, o PIB municipal e o ranking (DENSE_RANK) econômico.',
    ['municipios', 'estados'],
    ['municipio', 'estado', 'pib_milhares_reais', 'rank_pib'],
    'SELECT m.nome AS municipio, e.sigla AS estado, m.pib_milhares_reais, DENSE_RANK() OVER(ORDER BY m.pib_milhares_reais DESC) AS rank_pib FROM municipios m JOIN estados e ON e.id = m.estado_id ORDER BY rank_pib ASC;',
    ['dense_rank', 'join'],
    ['Junte municipios com estados.', 'Use DENSE_RANK() OVER(ORDER BY m.pib_milhares_reais DESC) AS rank_pib.', 'Ordene por rank_pib ASC.'],
    'A capital paulista concentra o maior PIB municipal da amostra.',
    'DENSE_RANK posiciona cidades no ranking de relevância socioeconômica.',
    ['window-functions', 'joins-inner-left']
  ),
  mission(
    8,
    'Gasto Per Capita em Educação Superior à Média',
    'CTE + Subquery',
    'Identifique os municípios cujo gasto per capita em "Educação Básica" está acima da média de gasto per capita em educação de todos os municípios.',
    ['municipios', 'areas_governo', 'despesas_publicas'],
    ['municipio', 'gasto_educacao_per_capita'],
    "WITH edu_per_capita AS (SELECT m.id, m.nome AS municipio, CAST(d.valor_liquidado_centavos / m.populacao AS INTEGER) AS gasto_educacao_per_capita FROM municipios m JOIN despesas_publicas d ON d.municipio_id = m.id JOIN areas_governo a ON a.id = d.area_id WHERE a.nome = 'Educação Básica') SELECT municipio, gasto_educacao_per_capita FROM edu_per_capita WHERE gasto_educacao_per_capita > (SELECT AVG(gasto_educacao_per_capita) FROM edu_per_capita) ORDER BY gasto_educacao_per_capita DESC;",
    ['with', 'subquery', 'where'],
    ['Calcule o gasto per capita em educação na CTE.', 'Compare com a média: WHERE gasto_educacao_per_capita > (SELECT AVG(...) FROM edu_per_capita).', 'Ordene descendentemente.'],
    'Curitiba, Campinas e Belo Horizonte lideram a alocação proporcional em educação.',
    'Comparações com médias setoriais subsidiam diagnósticos do FUNDEB.',
    ['cte-subqueries', 'aggregation-groupby']
  ),
  mission(
    9,
    'Eficiência de Execução Orçamentária por Estado',
    'CTE + Agregação',
    'Para cada estado, calcule a soma total empenhada, a soma total liquidada e a taxa percentual de liquidação (arredondada para 1 casa decimal).',
    ['estados', 'municipios', 'despesas_publicas'],
    ['estado', 'total_empenhado', 'total_liquidado', 'taxa_liquidacao_pct'],
    'WITH execucao_estadual AS (SELECT e.id AS estado_id, e.nome AS estado, SUM(d.valor_empenhado_centavos) AS total_empenhado, SUM(d.valor_liquidado_centavos) AS total_liquidado FROM estados e JOIN municipios m ON m.estado_id = e.id JOIN despesas_publicas d ON d.municipio_id = m.id GROUP BY e.id, e.nome) SELECT estado, total_empenhado, total_liquidado, ROUND((CAST(total_liquidado AS REAL) / total_empenhado) * 100, 1) AS taxa_liquidacao_pct FROM execucao_estadual ORDER BY taxa_liquidacao_pct DESC;',
    ['with', 'group by', 'sum', 'join', 'round'],
    ['Crie uma CTE que agregue os valores empenhados e liquidados por estado.', 'No SELECT principal, calcule a razão entre total_liquidado e total_empenhado multiplicada por 100.', 'Arredonde para uma casa decimal e ordene por taxa_liquidacao_pct DESC.'],
    'Paraná (96,8%) e Minas Gerais (96,1%) superaram 96% de efetividade de liquidação.',
    'Taxas de liquidação revelam a agilidade dos órgãos na conclusão de obras e serviços.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  {
    ...mission(
      10,
      'View de Análise Fiscal Municipal',
      'CREATE VIEW + JOIN + GROUP BY',
      'Crie a view vw_analise_fiscal_municipios contendo codigo_ibge, municipio, estado, populacao, total_empenhado e total_liquidado.',
      ['municipios', 'estados', 'despesas_publicas'],
      ['codigo_ibge', 'municipio', 'estado', 'populacao', 'total_empenhado', 'total_liquidado'],
      'CREATE VIEW vw_analise_fiscal_municipios AS SELECT m.codigo_ibge, m.nome AS municipio, e.sigla AS estado, m.populacao, SUM(d.valor_empenhado_centavos) AS total_empenhado, SUM(d.valor_liquidado_centavos) AS total_liquidado FROM municipios m JOIN estados e ON e.id = m.estado_id JOIN despesas_publicas d ON d.municipio_id = m.id GROUP BY m.id, m.codigo_ibge, m.nome, e.sigla, m.populacao;',
      ['create view', 'join', 'group by'],
      ['Crie a view com CREATE VIEW vw_analise_fiscal_municipios AS SELECT ...', 'Junte municipios, estados e despesas_publicas.', 'Agrupe por m.id, m.codigo_ibge, m.nome, e.sigla, m.populacao.'],
      'A view fiscal de prestação de contas governamentais foi criada com sucesso.',
      'Views consolidadas facilitam consultas de transparência pública para cidadãos e órgãos de controle.',
      ['views', 'joins-inner-left', 'aggregation-groupby']
    ),
    executionMode: 'create_view',
    viewName: 'vw_analise_fiscal_municipios',
    verificationQuery: 'SELECT * FROM vw_analise_fiscal_municipios ORDER BY codigo_ibge ASC;',
    expectedResultQuery: 'SELECT m.codigo_ibge, m.nome AS municipio, e.sigla AS estado, m.populacao, SUM(d.valor_empenhado_centavos) AS total_empenhado, SUM(d.valor_liquidado_centavos) AS total_liquidado FROM municipios m JOIN estados e ON e.id = m.estado_id JOIN despesas_publicas d ON d.municipio_id = m.id GROUP BY m.id, m.codigo_ibge, m.nome, e.sigla, m.populacao ORDER BY codigo_ibge ASC;',
  },
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
