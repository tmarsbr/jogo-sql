/**
 * levels.js — Missões do Projeto 06: Gestão de Clientes
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs, requirements = []) => ({
  id, title, concept, briefing: `Análise de Base de Clientes e Retenção. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs, requirements,
});

export const CASE_INTRO = {
  title: 'Segmentação e Valor de Clientes (RFM & LTV)',
  subtitle: 'Projeto #06 — Inteligência de CRM e Retenção',
  story: 'O time de Customer Success precisa identificar quais clientes geram maior receita acumulada (LTV) e quais estão em risco de churn por inatividade ou excesso de chamados de suporte.',
  mission: 'Resolva as 10 missões para construir a matriz de valor e retenção da carteira de clientes.',
};

export const DATABASE_ANALYSIS = {
  title: 'Perfis, recorrência e histórico de relacionamento',
  summary: 'O modelo separa planos e segmentações do cadastro de clientes, registrando transações de compras e ocorrências de suporte de forma independente para permitir análises 360° do cliente.',
  entities: [
    { name: 'segmentos', role: 'Classificação comercial do porte do cliente.', key: 'PK id', relations: [] },
    { name: 'planos', role: 'Catálogo de planos de assinatura e valores mensais.', key: 'PK id', relations: [] },
    { name: 'clientes', role: 'Dados cadastrais, status e chaves de relacionamento.', key: 'PK id', relations: ['segmento_id → segmentos.id', 'plano_id → planos.id'] },
    { name: 'compras', role: 'Histórico de transações avulsas e serviços extras.', key: 'PK id', relations: ['cliente_id → clientes.id'] },
    { name: 'tickets_atendimento', role: 'Registros de suporte e pedidos de auxílio.', key: 'PK id', relations: ['cliente_id → clientes.id'] },
  ],
  decisions: [
    { title: 'Status cadastral e transações isoladas', explanation: 'Clientes inativos ou cancelados continuam vinculados ao seu histórico para cálculos de taxa de churn e perda de receita.' },
    { title: 'Relacionamento 1:N com suporte', explanation: 'Permite cruzar volume de atrito (tickets abertos) com o valor financeiro do cliente.' },
    { title: 'Preço de assinatura fixado no plano', explanation: 'A receita recorrente é modelada através do plano, permitindo projetar faturamento previsível.' },
  ],
  checkpoints: [
    { question: 'Como saber se um cliente é de alto valor?', answer: 'Cruzando a mensalidade do plano com a soma total de compras avulsas realizadas (LTV).' },
    { question: 'Por que usar LEFT JOIN ao buscar clientes sem tickets de suporte?', answer: 'Porque INNER JOIN excluiria os clientes que nunca tiveram problemas, ocultando os mais satisfeitos.' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Segmentação de Clientes Estruturada',
  story: 'Os clientes corporativos Enterprise representam mais de 70% da receita total de compras extras. O churn está concentrado em planos individuais com atrito de suporte.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou avance para os próximos desafios.',
};

export const LEVELS = [
  mission(
    1,
    'Clientes Corporativos Ativos',
    'SELECT + WHERE',
    'Liste o nome e e-mail dos clientes ativos que pertencem ao segmento "Enterprise" (segmento_id = 1).',
    ['clientes'],
    ['nome', 'email'],
    "SELECT nome, email FROM clientes WHERE segmento_id = 1 AND status = 'ativo' ORDER BY id ASC;",
    ['where'],
    ['Filtre na tabela clientes.', "Use WHERE segmento_id = 1 AND status = 'ativo'.", 'Ordene pelo id.'],
    'Os grandes clientes corporativos mantêm contratos ativos.',
    'WHERE com múltiplos predicados filtra registros com alta precisão.',
    ['dml-select-where']
  ),
  mission(
    2,
    'Distribuição da Base por Plano',
    'COUNT + GROUP BY',
    'Mostre o nome do plano e o total de clientes cadastrados em cada um deles.',
    ['planos', 'clientes'],
    ['plano', 'total_clientes'],
    'SELECT p.nome AS plano, COUNT(c.id) AS total_clientes FROM planos p LEFT JOIN clientes c ON c.plano_id = p.id GROUP BY p.id, p.nome ORDER BY total_clientes DESC;',
    ['group by', 'count', 'join'],
    ['Junte planos e clientes com LEFT JOIN.', 'Agrupe pelo plano e conte com COUNT(c.id).', 'Ordene por total_clientes DESC.'],
    'Os planos Enterprise concentram o maior número de adesões ativas.',
    'LEFT JOIN com COUNT evita ignorar categorias sem registros associados.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    3,
    'Lifetime Value (LTV) por Cliente',
    'SUM + JOIN',
    'Calcule o valor total gasto em compras avulsas por cada cliente com compras registradas.',
    ['clientes', 'compras'],
    ['cliente', 'total_gasto_centavos'],
    'SELECT cl.nome AS cliente, SUM(co.valor_centavos) AS total_gasto_centavos FROM clientes cl JOIN compras co ON co.cliente_id = cl.id GROUP BY cl.id, cl.nome ORDER BY total_gasto_centavos DESC;',
    ['sum', 'join', 'group by'],
    ['Junte clientes com compras.', 'Agrupe pelo id e nome do cliente.', 'Some o valor_centavos e ordene descendentemente.'],
    'BioHealth e TechCorp lideram o gasto acumulado em serviços e upgrades.',
    'A soma de compras históricas define o valor monetário do cliente para o negócio.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    4,
    'Última Interação de Compra (Recência)',
    'MAX + DATE',
    'Identifique a data da compra mais recente feita por cada cliente.',
    ['clientes', 'compras'],
    ['cliente', 'ultima_compra'],
    'SELECT cl.nome AS cliente, MAX(co.data_compra) AS ultima_compra FROM clientes cl LEFT JOIN compras co ON co.cliente_id = cl.id GROUP BY cl.id, cl.nome ORDER BY ultima_compra DESC;',
    ['max', 'left join', 'group by'],
    ['Parta de clientes e use LEFT JOIN para manter quem nunca comprou.', 'Use MAX(co.data_compra) para obter a data mais recente.', 'Ordene por ultima_compra DESC.'],
    'Clientes com compras recentes têm menor propensão imediata ao churn.',
    'A função de agregação MAX em campos de data extrai o registro cronológico mais novo.',
    ['aggregation-groupby', 'dml-select-where', 'joins-inner-left']
  ),
  mission(
    5,
    'Clientes Recorrentes',
    'COUNT + HAVING',
    'Liste os clientes que realizaram pelo menos 3 compras avulsas e mostre a quantidade de compras.',
    ['clientes', 'compras'],
    ['cliente', 'quantidade_compras'],
    'SELECT cl.nome AS cliente, COUNT(co.id) AS quantidade_compras FROM clientes cl JOIN compras co ON co.cliente_id = cl.id GROUP BY cl.id, cl.nome HAVING COUNT(co.id) >= 3 ORDER BY quantidade_compras DESC;',
    ['having', 'count', 'group by'],
    ['Agrupe por cliente e conte as compras.', 'Use HAVING COUNT(co.id) >= 3.', 'Ordene por quantidade_compras DESC.'],
    'TechCorp e Fintech Fácil demonstram forte recorrência de contratação de serviços.',
    'HAVING filtra grupos após a contagem agregada.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    6,
    'Clientes Satisfeitos sem Chamados',
    'LEFT JOIN + IS NULL',
    'Encontre os clientes ativos que nunca abriram nenhum ticket de atendimento.',
    ['clientes', 'tickets_atendimento'],
    ['id', 'nome', 'email'],
    "SELECT cl.id, cl.nome, cl.email FROM clientes cl LEFT JOIN tickets_atendimento t ON t.cliente_id = cl.id WHERE cl.status = 'ativo' AND t.id IS NULL ORDER BY cl.id ASC;",
    ['left join', 'where'],
    ['Faça LEFT JOIN entre clientes e tickets_atendimento.', "Filtre com WHERE cl.status = 'ativo' AND t.id IS NULL.", 'Ordene por cl.id ASC.'],
    'Nexus Logística e Padaria Pão Dourado utilizam a plataforma sem atritos.',
    'LEFT JOIN com IS NULL identifica ausência de correspondência na tabela da direita.',
    ['joins-inner-left', 'dml-select-where']
  ),
  mission(
    7,
    'Classificação de Valor do Cliente',
    'CASE WHEN',
    'Para cada cliente com compras, calcule o total gasto e classifique-o como: "VIP" (gasto > R$ 5.000 / 500000 centavos), "Fidelizado" (gasto entre 100000 e 500000 centavos) ou "Standard" (< 100000 centavos).',
    ['clientes', 'compras'],
    ['cliente', 'total_gasto_centavos', 'categoria_valor'],
    "SELECT cl.nome AS cliente, SUM(co.valor_centavos) AS total_gasto_centavos, CASE WHEN SUM(co.valor_centavos) > 500000 THEN 'VIP' WHEN SUM(co.valor_centavos) >= 100000 THEN 'Fidelizado' ELSE 'Standard' END AS categoria_valor FROM clientes cl JOIN compras co ON co.cliente_id = cl.id GROUP BY cl.id, cl.nome ORDER BY total_gasto_centavos DESC;",
    ['case', 'group by', 'sum'],
    ['Agrupe por cliente e calcule SUM(co.valor_centavos).', 'Aplique CASE WHEN nas faixas de centavos.', 'Ordene por total_gasto_centavos DESC.'],
    'A categoria VIP concentra a maior parte do resultado financeiro.',
    'CASE WHEN viabiliza a criação de tiers e categorias analíticas no SQL.',
    ['case-when', 'aggregation-groupby']
  ),
  mission(
    8,
    'Clientes Acima da Média Geral',
    'Subquery',
    'Liste os clientes cujo total acumulado em compras seja maior do que a média de compras de todos os clientes que já compraram.',
    ['clientes', 'compras'],
    ['cliente', 'total_gasto_centavos'],
    'SELECT cl.nome AS cliente, SUM(co.valor_centavos) AS total_gasto_centavos FROM clientes cl JOIN compras co ON co.cliente_id = cl.id GROUP BY cl.id, cl.nome HAVING SUM(co.valor_centavos) > (SELECT AVG(total_cliente) FROM (SELECT SUM(valor_centavos) AS total_cliente FROM compras GROUP BY cliente_id)) ORDER BY total_gasto_centavos DESC;',
    ['subquery', 'having', 'group by'],
    ['Use HAVING SUM(co.valor_centavos) > (subquery).', 'Na subquery, calcule a média do total por cliente.', 'Ordene por total_gasto_centavos DESC.'],
    'Apenas clientes institucionais superam a média global de consumo.',
    'Subqueries em cláusulas HAVING permitem comparar agregações grupais com métricas globais.',
    ['cte-subqueries', 'having-where-orderby-like']
  ),
  mission(
    9,
    'Maior Compra Individual por Cliente',
    'Window ROW_NUMBER',
    'Para cada cliente com compras, exiba o nome do cliente, o valor da sua maior compra individual e o canal utilizado.',
    ['clientes', 'compras'],
    ['cliente', 'valor_centavos', 'canal'],
    'WITH compras_ranqueadas AS (SELECT cl.nome AS cliente, co.valor_centavos, co.canal, ROW_NUMBER() OVER(PARTITION BY co.cliente_id ORDER BY co.valor_centavos DESC, co.id ASC) AS rn FROM compras co JOIN clientes cl ON cl.id = co.cliente_id) SELECT cliente, valor_centavos, canal FROM compras_ranqueadas WHERE rn = 1 ORDER BY valor_centavos DESC;',
    ['with', 'row_number'],
    ['Crie uma CTE usando ROW_NUMBER() OVER(PARTITION BY co.cliente_id ORDER BY co.valor_centavos DESC).', 'Filtre no SELECT principal com WHERE rn = 1.', 'Ordene por valor_centavos DESC.'],
    'As maiores compras individuais ocorrem majoritariamente pelo canal consultor.',
    'Window Functions particionadas ordenam subconjuntos sem perder colunas detalhadas.',
    ['window-functions', 'cte-subqueries']
  ),
  mission(
    10,
    'Matriz Consolidada de Valor e Risco',
    'CTE + Window + JOIN',
    'Gere um relatório consolidado com o nome do cliente, plano, total gasto em compras avulsas, quantidade de tickets de suporte e o ranking de faturamento (DENSE_RANK) entre os clientes que já compraram.',
    ['clientes', 'planos', 'compras', 'tickets_atendimento'],
    ['cliente', 'plano', 'total_gasto_centavos', 'total_tickets', 'rank_faturamento'],
    'WITH gastos AS (SELECT cliente_id, SUM(valor_centavos) AS total_gasto_centavos FROM compras GROUP BY cliente_id), suporte AS (SELECT cliente_id, COUNT(*) AS total_tickets FROM tickets_atendimento GROUP BY cliente_id) SELECT cl.nome AS cliente, p.nome AS plano, g.total_gasto_centavos, COALESCE(s.total_tickets, 0) AS total_tickets, DENSE_RANK() OVER(ORDER BY g.total_gasto_centavos DESC) AS rank_faturamento FROM clientes cl JOIN planos p ON p.id = cl.plano_id JOIN gastos g ON g.cliente_id = cl.id LEFT JOIN suporte s ON s.cliente_id = cl.id ORDER BY rank_faturamento ASC;',
    ['with', 'dense_rank', 'join'],
    ['Crie CTEs separadas para agregar gastos e suporte por cliente.', 'Junte clientes, planos e as CTEs.', 'Aplique DENSE_RANK() OVER(ORDER BY g.total_gasto_centavos DESC) AS rank_faturamento.'],
    'A matriz analítica fornece a visão completa de LTV e fricção operacional de cada conta.',
    'Múltiplas CTEs pré-agregadas evitam duplicação de linhas (fan-out) ao cruzar métricas distintas.',
    ['cte-subqueries', 'window-functions', 'joins-inner-left'],
    [
      'Só entram no relatório os clientes que já registraram alguma compra.',
      'Clientes sem tickets de suporte devem exibir 0 em total_tickets — nunca NULL.',
      'O rank_faturamento é calculado com DENSE_RANK() sobre o total gasto, do maior para o menor.',
    ]
  ),
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
