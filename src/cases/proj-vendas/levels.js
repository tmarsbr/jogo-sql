/**
 * levels.js — Missões do Projeto 07: Desempenho de Vendas
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs) => ({
  id, title, concept, briefing: `Análise Comercial e Performance de Vendas. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs,
});

export const CASE_INTRO = {
  title: 'Evolução de Vendas e Atingimento de Metas',
  subtitle: 'Projeto #07 — Inteligência Comercial e Performance Regional',
  story: 'A gerência comercial quer acompanhar a trajetória de faturamento das filiais, comparar os resultados dos vendedores com as metas estipuladas e calcular as variações percentuais mês contra mês.',
  mission: 'Resolva as 10 missões para consolidar o painel gerencial de vendas.',
};

export const DATABASE_ANALYSIS = {
  title: 'Territórios, metas mensais e execução comercial',
  summary: 'O modelo separa o organograma regional dos vendedores e estipula metas mensais independentes, permitindo avaliar a aderência das vendas reais ao planejamento estratégico.',
  entities: [
    { name: 'regioes', role: 'Divisão geográfica e liderança comercial regional.', key: 'PK id', relations: [] },
    { name: 'vendedores', role: 'Equipe comercial vinculada a cada território.', key: 'PK id', relations: ['regiao_id → regioes.id'] },
    { name: 'metas_mensais', role: 'Teto/alvo de vendas por vendedor para cada mês.', key: 'PK id', relations: ['vendedor_id → vendedores.id'] },
    { name: 'vendas', role: 'Histórico de transações fechadas com data e descontos.', key: 'PK id', relations: ['vendedor_id → vendedores.id'] },
  ],
  decisions: [
    { title: 'Chave única composta para metas', explanation: 'A restrição UNIQUE(vendedor_id, ano_mes) garante uma meta única por vendedor a cada mês, impedindo metas concorrentes.' },
    { title: 'Desconto explícito por venda', explanation: 'Registra a concessão comercial para auditar margem de lucro e comportamento de concessão de descontos.' },
    { title: 'Vendas com granularidade de timestamp', explanation: 'Permite agregações temporais diárias, semanais, mensais e cálculo de médias móveis.' },
  ],
  checkpoints: [
    { question: 'Como comparar o desempenho real de um vendedor com sua meta?', answer: 'Agrupando as vendas de determinado ano-mês e fazendo JOIN com a tabela metas_mensais através de vendedor_id e ano_mes.' },
    { question: 'Por que usar LAG em análises temporais?', answer: 'A função de janela LAG() acessa a linha anterior sem necessidade de auto-junções complexas (SELF JOIN).' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Painel Comercial Estruturado',
  story: 'Sudeste e Sul atingiram 100% das metas mensais do primeiro trimestre; o Sudeste também liderou o faturamento acumulado.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou avance para os próximos módulos analíticos.',
};

export const LEVELS = [
  mission(
    1,
    'Faturamento Mensal Consolidado',
    'SUM + strftime',
    'Mostre o ano-mês da venda e a soma total do faturamento em centavos para cada mês.',
    ['vendas'],
    ['ano_mes', 'total_faturado_centavos'],
    "SELECT strftime('%Y-%m', data_venda) AS ano_mes, SUM(valor_centavos) AS total_faturado_centavos FROM vendas GROUP BY strftime('%Y-%m', data_venda) ORDER BY ano_mes ASC;",
    ['group by', 'sum'],
    ['Extraia o ano-mês com strftime(\'%Y-%m\', data_venda).', 'Some valor_centavos e agrupe pelo ano-mês.', 'Ordene por ano_mes ASC.'],
    'O faturamento mensal total cresceu consistentemente de Janeiro a Março.',
    'Agregações mensais são a base da análise de séries temporais de receita.',
    ['aggregation-groupby', 'dml-select-where']
  ),
  mission(
    2,
    'Faturamento por Vendedor e Região',
    'JOIN + GROUP BY',
    'Liste o nome do vendedor, o nome de sua região e o total faturado no trimestre.',
    ['vendedores', 'regioes', 'vendas'],
    ['vendedor', 'regiao', 'total_faturado_centavos'],
    'SELECT v.nome AS vendedor, r.nome AS regiao, SUM(ve.valor_centavos) AS total_faturado_centavos FROM vendedores v JOIN regioes r ON r.id = v.regiao_id JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY v.id, v.nome, r.nome ORDER BY total_faturado_centavos DESC;',
    ['join', 'group by', 'sum'],
    ['Junte vendedores com regioes e vendas.', 'Agrupe pelo vendedor e região.', 'Ordene pelo total_faturado_centavos DESC.'],
    'Lucas Prado (Sudeste) lidera o ranking geral, com R$ 181.000,00 faturados no trimestre.',
    'JOIN conecta vendedores ao contexto organizacional de suas diretorias regionais.',
    ['joins-inner-left', 'aggregation-groupby']
  ),
  mission(
    3,
    'Meta vs Realizado em Janeiro',
    'JOIN + Comparação',
    'Em janeiro de 2024 ("2024-01"), compare as vendas realizadas com a meta de cada vendedor. Exiba nome, valor realizado e valor da meta.',
    ['vendedores', 'vendas', 'metas_mensais'],
    ['vendedor', 'valor_realizado_centavos', 'meta_centavos'],
    "SELECT v.nome AS vendedor, SUM(ve.valor_centavos) AS valor_realizado_centavos, m.meta_centavos FROM vendedores v JOIN metas_mensais m ON m.vendedor_id = v.id AND m.ano_mes = '2024-01' JOIN vendas ve ON ve.vendedor_id = v.id AND strftime('%Y-%m', ve.data_venda) = '2024-01' GROUP BY v.id, v.nome, m.meta_centavos ORDER BY valor_realizado_centavos DESC;",
    ['join', 'group by', 'sum'],
    ["Junte vendedores, metas_mensais e vendas filtrando ano_mes = '2024-01'.", 'Some valor_centavos e inclua m.meta_centavos.', 'Ordene por valor_realizado_centavos DESC.'],
    'A maioria dos vendedores atingiu ou superou a meta estabelecida para o mês de janeiro.',
    'Cruzar fatos realizados com metas orçadas mede a acurácia do planejamento comercial.',
    ['joins-inner-left', 'aggregation-groupby']
  ),
  mission(
    4,
    'Vendedores Destaque',
    'HAVING',
    'Identifique os vendedores cujo faturamento total acumulado no trimestre foi superior a R$ 100.000,00 (10000000 centavos).',
    ['vendedores', 'vendas'],
    ['vendedor', 'total_faturado_centavos'],
    'SELECT v.nome AS vendedor, SUM(ve.valor_centavos) AS total_faturado_centavos FROM vendedores v JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY v.id, v.nome HAVING SUM(ve.valor_centavos) > 10000000 ORDER BY total_faturado_centavos DESC;',
    ['having', 'group by', 'sum'],
    ['Agrupe por vendedor.', 'Aplique HAVING SUM(ve.valor_centavos) > 10000000.', 'Ordene por total_faturado_centavos DESC.'],
    'Cinco vendedores superaram a marca de R$ 100 mil no período.',
    'HAVING filtra agregados sem afetar o cálculo das linhas individuais.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    5,
    'Evolução e Mês Anterior com LAG',
    'Window LAG',
    'Calcule o faturamento mensal total e o faturamento do mês anterior utilizando a função LAG.',
    ['vendas'],
    ['ano_mes', 'faturamento_atual', 'faturamento_anterior'],
    "WITH faturamento_mensal AS (SELECT strftime('%Y-%m', data_venda) AS ano_mes, SUM(valor_centavos) AS faturamento_atual FROM vendas GROUP BY strftime('%Y-%m', data_venda)) SELECT ano_mes, faturamento_atual, LAG(faturamento_atual) OVER(ORDER BY ano_mes ASC) AS faturamento_anterior FROM faturamento_mensal ORDER BY ano_mes ASC;",
    ['with', 'lag'],
    ['Crie uma CTE com faturamento agrupado por ano-mês.', 'Use LAG(faturamento_atual) OVER(ORDER BY ano_mes ASC) AS faturamento_anterior.', 'Ordene por ano_mes ASC.'],
    'O primeiro mês não possui histórico anterior (NULL), enquanto os subsequentes mostram crescimento.',
    'LAG() permite comparar períodos cronológicos de forma limpa e performática.',
    ['window-functions', 'cte-subqueries']
  ),
  mission(
    6,
    'Faturamento Acumulado Contínuo',
    'Window SUM OVER',
    'Liste o ID da venda, a data da venda, o valor em centavos e o faturamento acumulado progressivo (running total).',
    ['vendas'],
    ['id', 'data_venda', 'valor_centavos', 'acumulado_centavos'],
    'SELECT id, data_venda, valor_centavos, SUM(valor_centavos) OVER(ORDER BY data_venda ASC, id ASC) AS acumulado_centavos FROM vendas ORDER BY data_venda ASC, id ASC;',
    ['sum', 'over', 'order by'],
    ['Selecione cada venda sem agrupar as linhas.', 'Use SUM(valor_centavos) OVER(ORDER BY data_venda ASC, id ASC) AS acumulado_centavos.', 'Ordene por data_venda ASC, id ASC.'],
    'A curva de faturamento acumulada demonstra o ritmo constante de entradas.',
    'SUM() OVER sem PARTITION acumula linearmente sobre todo o conjunto de dados.',
    ['window-functions']
  ),
  mission(
    7,
    'Status da Meta em Março',
    'CASE WHEN',
    'Para as vendas de Março ("2024-03"), compare o total realizado com a meta e classifique cada vendedor como "Superou Meta" ou "Abaixo da Meta".',
    ['vendedores', 'vendas', 'metas_mensais'],
    ['vendedor', 'valor_realizado_centavos', 'meta_centavos', 'status_meta'],
    "SELECT v.nome AS vendedor, SUM(ve.valor_centavos) AS valor_realizado_centavos, m.meta_centavos, CASE WHEN SUM(ve.valor_centavos) >= m.meta_centavos THEN 'Superou Meta' ELSE 'Abaixo da Meta' END AS status_meta FROM vendedores v JOIN metas_mensais m ON m.vendedor_id = v.id AND m.ano_mes = '2024-03' JOIN vendas ve ON ve.vendedor_id = v.id AND strftime('%Y-%m', ve.data_venda) = '2024-03' GROUP BY v.id, v.nome, m.meta_centavos ORDER BY valor_realizado_centavos DESC;",
    ['case', 'group by', 'sum'],
    ["Filtre ano_mes = '2024-03'.", 'Compare SUM(ve.valor_centavos) com m.meta_centavos no CASE WHEN.', 'Ordene por valor_realizado_centavos DESC.'],
    'A quase totalidade da equipe superou o patamar de metas em Março.',
    'CASE WHEN traduz regras de negócios em sinalizadores textuais nos relatórios.',
    ['case-when', 'aggregation-groupby']
  ),
  mission(
    8,
    'Desempenho por Região e Mês',
    'GROUP BY múltiplo',
    'Mostre o nome da região, o ano-mês e o total faturado, ordenado por região e mês.',
    ['regioes', 'vendedores', 'vendas'],
    ['regiao', 'ano_mes', 'total_faturado_centavos'],
    "SELECT r.nome AS regiao, strftime('%Y-%m', ve.data_venda) AS ano_mes, SUM(ve.valor_centavos) AS total_faturado_centavos FROM regioes r JOIN vendedores v ON v.regiao_id = r.id JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY r.id, r.nome, strftime('%Y-%m', ve.data_venda) ORDER BY r.nome ASC, ano_mes ASC;",
    ['group by', 'join', 'sum', 'order by'],
    ['Junte regioes, vendedores e vendas.', 'Agrupe por r.id, r.nome e strftime(\'%Y-%m\', ve.data_venda).', 'Ordene por r.nome ASC, ano_mes ASC.'],
    'O Sudeste liderou o faturamento regional em cada um dos três meses analisados.',
    'Agrupamentos multidimensionais viabilizam gráficos de barras e linhas por categoria.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    9,
    'Região Campeã do Trimestre',
    'CTE + ORDER BY + LIMIT',
    'Utilizando uma CTE, descubra a região que obteve o maior faturamento total no trimestre e mostre seu nome e o total faturado.',
    ['regioes', 'vendedores', 'vendas'],
    ['regiao', 'faturamento_total_centavos'],
    'WITH faturamento_regioes AS (SELECT r.nome AS regiao, SUM(ve.valor_centavos) AS faturamento_total_centavos FROM regioes r JOIN vendedores v ON v.regiao_id = r.id JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY r.id, r.nome) SELECT regiao, faturamento_total_centavos FROM faturamento_regioes ORDER BY faturamento_total_centavos DESC LIMIT 1;',
    ['with', 'order by', 'limit'],
    ['Crie uma CTE com o total por região.', 'Junte regiões, vendedores e vendas antes de agrupar.', 'Ordene por faturamento_total_centavos DESC e aplique LIMIT 1.'],
    'O Sudeste foi a região campeã, com R$ 339.000,00 faturados no trimestre.',
    'CTEs simplificam consultas de ranking e relatórios gerenciais executivos.',
    ['cte-subqueries', 'aggregation-groupby']
  ),
  {
    ...mission(
      10,
      'View de Painel Gerencial',
      'CREATE VIEW + JOIN + GROUP BY',
      'Crie a view vw_painel_vendas_gerencial contendo vendedor_id, vendedor, regiao, total_faturado_centavos e total_vendas_fechadas.',
      ['vendedores', 'regioes', 'vendas'],
      ['vendedor_id', 'vendedor', 'regiao', 'total_faturado_centavos', 'total_vendas_fechadas'],
      'CREATE VIEW vw_painel_vendas_gerencial AS SELECT v.id AS vendedor_id, v.nome AS vendedor, r.nome AS regiao, SUM(ve.valor_centavos) AS total_faturado_centavos, COUNT(ve.id) AS total_vendas_fechadas FROM vendedores v JOIN regioes r ON r.id = v.regiao_id JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY v.id, v.nome, r.nome;',
      ['create view', 'join', 'group by'],
      ['Crie a view vw_painel_vendas_gerencial com CREATE VIEW.', 'Junte vendedores, regioes e vendas.', 'Agrupe por v.id, v.nome, r.nome.'],
      'A view consolidada foi criada com sucesso para alimentação de dashboards.',
      'Views disponibilizam relatórios complexos com consulta simplificada para usuários finais.',
      ['views', 'joins-inner-left', 'aggregation-groupby']
    ),
    executionMode: 'create_view',
    viewName: 'vw_painel_vendas_gerencial',
    verificationQuery: 'SELECT * FROM vw_painel_vendas_gerencial ORDER BY vendedor_id ASC;',
    expectedResultQuery: 'SELECT v.id AS vendedor_id, v.nome AS vendedor, r.nome AS regiao, SUM(ve.valor_centavos) AS total_faturado_centavos, COUNT(ve.id) AS total_vendas_fechadas FROM vendedores v JOIN regioes r ON r.id = v.regiao_id JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY v.id, v.nome, r.nome ORDER BY vendedor_id ASC;',
  },
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
