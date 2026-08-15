/**
 * levels.js — Missões do Projeto 10: Controle de Estoque
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs) => ({
  id, title, concept, briefing: `Auditoria e Gestão de Estoque. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs,
});

export const CASE_INTRO = {
  title: 'Giro de Estoque, Ponto de Pedido e Curva de Valor',
  subtitle: 'Projeto #10 — Gestão de Armazéns e Materiais',
  story: 'O departamento de suprimentos precisa identificar quais mercadorias estão com estoque crítico abaixo do ponto de reposição, quais itens estão sem giro há meses e qual o montante financeiro imobilizado nos armazéns.',
  mission: 'Resolva as 10 missões de auditoria para consolidar a posição física e financeira do estoque.',
};

export const DATABASE_ANALYSIS = {
  title: 'Cadastro de SKUs, múltiplos armazéns e fluxo de movimentações',
  summary: 'O modelo registra entradas, saídas e perdas de forma transacional em movimentacoes, permitindo recalcular o saldo físico e o valor contábil imobilizado de forma auditável e sem sobrescrever dados.',
  entities: [
    { name: 'armazens', role: 'Galpões físicos de estocagem e distribuição.', key: 'PK id', relations: [] },
    { name: 'fornecedores', role: 'Parceiros de suprimentos e seus respectivos lead times.', key: 'PK id', relations: [] },
    { name: 'produtos', role: 'Catálogo de SKUs com custo de reposição e estoque mínimo.', key: 'PK id', relations: ['fornecedor_id → fornecedores.id'] },
    { name: 'movimentacoes', role: 'Histórico de entradas, saídas, perdas e ajustes.', key: 'PK id', relations: ['produto_id → produtos.id', 'armazem_id → armazens.id'] },
  ],
  decisions: [
    { title: 'Saldo derivado por movimentações', explanation: 'Não armazenamos o saldo estático em produtos; ele é calculado pela soma algébrica de entradas menos saídas e perdas, evitando anomalias de sincronização.' },
    { title: 'Estoque mínimo parametrizado', explanation: 'Permite consultas automáticas de ponto de pedido baseadas no lead time do fornecedor.' },
    { title: 'Histórico granular com armazém', explanation: 'Viabiliza transferências entre filiais e visão segregada por centro de estocagem.' },
  ],
  checkpoints: [
    { question: 'Como calcular o saldo atual de um produto?', answer: 'Somando as quantidades de tipo entrada e subtraindo as quantidades de tipo saida, perda e ajuste.' },
    { question: 'Por que o modelo utiliza uma tabela de movimentações em vez de apenas uma coluna de saldo?', answer: 'Porque a tabela transacional fornece rastreabilidade, auditoria de perdas e cálculo de séries temporais de consumo.' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Auditoria de Estoque Finalizada',
  story: 'Foram identificados 3 SKUs abaixo do estoque mínimo — placa-mãe, processador e cabo HDMI — além de R$ 12.000,00 imobilizados em mesas executivas sem qualquer saída no trimestre.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou continue para os próximos cenários.',
};

export const LEVELS = [
  mission(
    1,
    'Saldo Físico Atual por Produto',
    'SUM + CASE + GROUP BY',
    'Calcule o saldo atual em estoque para cada produto (entradas menos saídas e perdas).',
    ['produtos', 'movimentacoes'],
    ['codigo_sku', 'nome', 'saldo_atual'],
    "SELECT p.codigo_sku, p.nome, SUM(CASE WHEN m.tipo = 'entrada' THEN m.quantidade WHEN m.tipo IN ('saida', 'perda', 'ajuste') THEN -m.quantidade ELSE 0 END) AS saldo_atual FROM produtos p JOIN movimentacoes m ON m.produto_id = p.id GROUP BY p.id, p.codigo_sku, p.nome ORDER BY p.id ASC;",
    ['case', 'group by', 'sum', 'join'],
    ['Use CASE WHEN m.tipo = \'entrada\' THEN m.quantidade ELSE -m.quantidade END.', 'Agrupe pelo id, codigo_sku e nome do produto.', 'Ordene por p.id ASC.'],
    'O saldo atual reflete com precisão todas as entradas e baixas do período.',
    'A soma algébrica com CASE WHEN transforma registros transacionais em saldos instantâneos.',
    ['case-when', 'aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    2,
    'Alerta de Estoque Crítico',
    'CTE + WHERE + Comparação',
    'Utilizando uma CTE, liste os produtos cujo saldo físico atual está estritamente abaixo do estoque mínimo configurado.',
    ['produtos', 'movimentacoes'],
    ['codigo_sku', 'nome', 'saldo_atual', 'estoque_minimo'],
    "WITH saldos AS (SELECT p.id, p.codigo_sku, p.nome, p.estoque_minimo, SUM(CASE WHEN m.tipo = 'entrada' THEN m.quantidade ELSE -m.quantidade END) AS saldo_atual FROM produtos p JOIN movimentacoes m ON m.produto_id = p.id GROUP BY p.id, p.codigo_sku, p.nome, p.estoque_minimo) SELECT codigo_sku, nome, saldo_atual, estoque_minimo FROM saldos WHERE saldo_atual < estoque_minimo ORDER BY codigo_sku ASC;",
    ['with', 'where'],
    ['Calcule os saldos em uma CTE.', 'Filtre no SELECT principal com WHERE saldo_atual < estoque_minimo.', 'Ordene por codigo_sku ASC.'],
    'Placa Mãe Industrial ATX, Processador Octa-Core e Cabo HDMI Blindado estão abaixo do estoque mínimo.',
    'CTEs isolam a lógica de agregação antes de aplicar regras de corte comparativas.',
    ['cte-subqueries', 'dml-select-where']
  ),
  mission(
    3,
    'Data da Última Saída (Giro)',
    'MAX + WHERE',
    'Exiba o código SKU, o nome e a data/hora da última movimentação do tipo "saida" para cada produto que já teve saídas.',
    ['produtos', 'movimentacoes'],
    ['codigo_sku', 'nome', 'ultima_saida'],
    "SELECT p.codigo_sku, p.nome, MAX(m.data_movimento) AS ultima_saida FROM produtos p JOIN movimentacoes m ON m.produto_id = p.id WHERE m.tipo = 'saida' GROUP BY p.id, p.codigo_sku, p.nome ORDER BY ultima_saida DESC;",
    ['max', 'group by', 'where', 'join'],
    ["Filtre WHERE m.tipo = 'saida'.", 'Use MAX(m.data_movimento) AS ultima_saida.', 'Agrupe pelo produto e ordene por ultima_saida DESC.'],
    'Monitor Curvo, Fita Adesiva e Cabo HDMI registraram as três saídas mais recentes do período.',
    'MAX em colunas temporais extrai o evento mais recente de consumo.',
    ['aggregation-groupby', 'dml-select-where']
  ),
  mission(
    4,
    'Produtos com Estoque Parado (Sem Saídas)',
    'LEFT JOIN + IS NULL',
    'Identifique os produtos que receberam entradas de estoque mas nunca registraram nenhuma movimentação do tipo "saida".',
    ['produtos', 'movimentacoes'],
    ['codigo_sku', 'nome'],
    "SELECT DISTINCT p.codigo_sku, p.nome FROM produtos p JOIN movimentacoes m ON m.produto_id = p.id AND m.tipo = 'entrada' LEFT JOIN movimentacoes s ON s.produto_id = p.id AND s.tipo = 'saida' WHERE s.id IS NULL ORDER BY p.codigo_sku ASC;",
    ['left join', 'where', 'distinct'],
    ['Junte com entradas e faça LEFT JOIN com saídas onde s.id IS NULL.', 'Use DISTINCT para evitar duplicatas.', 'Ordene por codigo_sku ASC.'],
    'A Mesa Executiva L está totalmente parada no armazém desde Janeiro.',
    'LEFT JOIN com condição composta e filtro IS NULL localiza ausência de ocorrências de determinado tipo.',
    ['joins-inner-left', 'dml-select-where']
  ),
  mission(
    5,
    'Valor Imobilizado por Produto',
    'SUM + CASE + Multiplicação',
    'Calcule o valor financeiro total imobilizado em estoque (em centavos) para cada produto (`saldo * custo_unitario_centavos`).',
    ['produtos', 'movimentacoes'],
    ['codigo_sku', 'nome', 'valor_imobilizado_centavos'],
    "SELECT p.codigo_sku, p.nome, SUM(CASE WHEN m.tipo = 'entrada' THEN m.quantidade ELSE -m.quantidade END) * p.custo_unitario_centavos AS valor_imobilizado_centavos FROM produtos p JOIN movimentacoes m ON m.produto_id = p.id GROUP BY p.id, p.codigo_sku, p.nome, p.custo_unitario_centavos ORDER BY valor_imobilizado_centavos DESC;",
    ['sum', 'case', 'group by'],
    ['Multiplique a soma do saldo por p.custo_unitario_centavos.', 'Agrupe pelo produto.', 'Ordene por valor_imobilizado_centavos DESC.'],
    'Monitores Curvos e Memórias RAM representam o maior montante de capital parado.',
    'Cálculos financeiros sobre saldos em estoque fundamentam a auditoria contábil.',
    ['aggregation-groupby', 'case-when']
  ),
  mission(
    6,
    'Classificação de Nível de Estoque',
    'CASE WHEN + CTE',
    'Classifique a situação de estoque de cada produto como "Abaixo do Mínimo" ou "Adequado".',
    ['produtos', 'movimentacoes'],
    ['codigo_sku', 'nome', 'saldo_atual', 'situacao_estoque'],
    "WITH saldos AS (SELECT p.id, p.codigo_sku, p.nome, p.estoque_minimo, SUM(CASE WHEN m.tipo = 'entrada' THEN m.quantidade ELSE -m.quantidade END) AS saldo_atual FROM produtos p JOIN movimentacoes m ON m.produto_id = p.id GROUP BY p.id, p.codigo_sku, p.nome, p.estoque_minimo) SELECT codigo_sku, nome, saldo_atual, CASE WHEN saldo_atual < estoque_minimo THEN 'Abaixo do Mínimo' ELSE 'Adequado' END AS situacao_estoque FROM saldos ORDER BY codigo_sku ASC;",
    ['with', 'case'],
    ['Crie uma CTE com os saldos.', 'Aplique CASE WHEN saldo_atual < estoque_minimo THEN \'Abaixo do Mínimo\' ELSE \'Adequado\' END.', 'Ordene por codigo_sku ASC.'],
    'O sinalizador alerta a necessidade de novas ordens de compra.',
    'Classificações condicionais automatizam a geração de relatórios de compras.',
    ['cte-subqueries', 'case-when']
  ),
  mission(
    7,
    'Entradas por Fornecedor',
    'SUM + JOIN',
    'Calcule a quantidade total de unidades recebidas (tipo = "entrada") agrupadas pela razão social do fornecedor.',
    ['fornecedores', 'produtos', 'movimentacoes'],
    ['fornecedor', 'total_unidades_recebidas'],
    "SELECT f.razao_social AS fornecedor, SUM(m.quantidade) AS total_unidades_recebidas FROM fornecedores f JOIN produtos p ON p.fornecedor_id = f.id JOIN movimentacoes m ON m.produto_id = p.id WHERE m.tipo = 'entrada' GROUP BY f.id, f.razao_social ORDER BY total_unidades_recebidas DESC;",
    ['join', 'where', 'group by', 'sum'],
    ["Junte fornecedores, produtos e movimentacoes e filtre WHERE m.tipo = 'entrada'.", 'Some a quantidade e agrupe pelo fornecedor.', 'Ordene por total_unidades_recebidas DESC.'],
    'A empresa de Embalagens e a Importadora Global entregaram os maiores volumes físicos.',
    'Consolidar entradas por fornecedor avalia a dependência de capacidade da cadeia de suprimentos.',
    ['joins-inner-left', 'aggregation-groupby']
  ),
  mission(
    8,
    'Volume de Movimentações por Armazém',
    'COUNT + GROUP BY',
    'Mostre o nome do armazém e o total de registros de movimentações operados em cada um.',
    ['armazens', 'movimentacoes'],
    ['armazem', 'total_movimentacoes'],
    'SELECT a.nome AS armazem, COUNT(m.id) AS total_movimentacoes FROM armazens a LEFT JOIN movimentacoes m ON m.armazem_id = a.id GROUP BY a.id, a.nome ORDER BY total_movimentacoes DESC;',
    ['group by', 'count', 'join'],
    ['Junte armazens com movimentacoes.', 'Agrupe pelo nome do armazém e conte as movimentações.', 'Ordene descendentemente.'],
    'O Armazém Central em SP concentra a maior intensidade operacional.',
    'Contagem de movimentações mede o esforço de picking e handling de cada galpão.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    9,
    'Produtos Acima da Média de Valor Imobilizado',
    'CTE + Subquery',
    'Liste os produtos cujo valor imobilizado em estoque é superior à média do valor imobilizado de todos os produtos com estoque.',
    ['produtos', 'movimentacoes'],
    ['codigo_sku', 'nome', 'valor_imobilizado_centavos'],
    "WITH valores AS (SELECT p.id, p.codigo_sku, p.nome, SUM(CASE WHEN m.tipo = 'entrada' THEN m.quantidade ELSE -m.quantidade END) * p.custo_unitario_centavos AS valor_imobilizado_centavos FROM produtos p JOIN movimentacoes m ON m.produto_id = p.id GROUP BY p.id, p.codigo_sku, p.nome, p.custo_unitario_centavos) SELECT codigo_sku, nome, valor_imobilizado_centavos FROM valores WHERE valor_imobilizado_centavos > (SELECT AVG(valor_imobilizado_centavos) FROM valores) ORDER BY valor_imobilizado_centavos DESC;",
    ['with', 'subquery'],
    ['Calcule os valores em uma CTE.', 'Compare com a subquery de média: WHERE valor_imobilizado_centavos > (SELECT AVG(...) FROM valores).', 'Ordene por valor_imobilizado_centavos DESC.'],
    'Monitores Curvos, Cadeiras, Mesas e Memórias RAM formam o grupo acima da média de valor imobilizado.',
    'Comparação contra médias em subqueries isola o topo da Curva ABC de estoques.',
    ['cte-subqueries', 'aggregation-groupby']
  ),
  mission(
    10,
    'Posição Consolidada de Estoque e Suprimentos',
    'CTE + JOIN múltiplo',
    'Gere o relatório final consolidado contendo código SKU, nome do produto, razão social do fornecedor, lead time em dias, saldo físico atual e valor total imobilizado em centavos.',
    ['produtos', 'fornecedores', 'movimentacoes'],
    ['codigo_sku', 'nome', 'fornecedor', 'lead_time_dias', 'saldo_atual', 'valor_imobilizado_centavos'],
    "WITH saldos AS (SELECT p.id, SUM(CASE WHEN m.tipo = 'entrada' THEN m.quantidade ELSE -m.quantidade END) AS saldo_atual FROM produtos p JOIN movimentacoes m ON m.produto_id = p.id GROUP BY p.id) SELECT p.codigo_sku, p.nome, f.razao_social AS fornecedor, f.lead_time_dias, s.saldo_atual, s.saldo_atual * p.custo_unitario_centavos AS valor_imobilizado_centavos FROM produtos p JOIN fornecedores f ON f.id = p.fornecedor_id JOIN saldos s ON s.id = p.id ORDER BY valor_imobilizado_centavos DESC, p.codigo_sku ASC;",
    ['with', 'join'],
    ['Calcule os saldos em uma CTE.', 'Junte produtos com fornecedores e a CTE de saldos.', 'Calcule o valor imobilizado e ordene descendentemente.'],
    'A posição consolidada de estoque foi auditada e homologada para o inventário fiscal.',
    'Relatórios completos integram cadastros, parâmetros de lead time e cálculos volumétricos.',
    ['cte-subqueries', 'joins-inner-left', 'case-when']
  ),
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
