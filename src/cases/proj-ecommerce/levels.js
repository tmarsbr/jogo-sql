/**
 * levels.js — Missões do Projeto 05: E-Commerce
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs) => ({
  id, title, concept, briefing: `Análise de Dados de E-Commerce. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs,
});

export const CASE_INTRO = {
  title: 'Análise de Desempenho de E-Commerce',
  subtitle: 'Projeto #05 — Métricas de Produtos e Receita',
  story: 'A diretoria da loja virtual precisa entender quais produtos e categorias geram maior faturamento e quais estão com baixa saída para planejar as compras do próximo trimestre.',
  mission: 'Resolva as 10 missões de análise para estruturar o dashboard de performance de vendas.',
};

export const DATABASE_ANALYSIS = {
  title: 'Catálogo, pedidos e itens: granularidade de ponta a ponta',
  summary: 'O modelo separa categorias e produtos do histórico de pedidos e itens vendidos. Salvar o preço praticado em itens_pedido garante a integridade histórica da receita mesmo se o catálogo mudar.',
  entities: [
    { name: 'categorias', role: 'Segmentação do catálogo e margens de lucro padrão.', key: 'PK id', relations: [] },
    { name: 'produtos', role: 'Cadastro de itens com custo e preço de tabela.', key: 'PK id', relations: ['categoria_id → categorias.id'] },
    { name: 'clientes', role: 'Cadastro de compradores com localização geográfica.', key: 'PK id', relations: [] },
    { name: 'pedidos', role: 'Cabeçalho da venda com status, data e cupom.', key: 'PK id', relations: ['cliente_id → clientes.id'] },
    { name: 'itens_pedido', role: 'Linhas detalhadas com quantidade e preço histórico.', key: 'PK id', relations: ['pedido_id → pedidos.id', 'produto_id → produtos.id'] },
  ],
  decisions: [
    { title: 'Preço histórico no item', explanation: 'O campo preco_praticado_centavos em itens_pedido congela o valor na data da compra, evitando distorções contábeis se o produto for reajustado.' },
    { title: 'Status do pedido explícito', explanation: 'Permite filtrar vendas confirmadas (pagas/entregues) e isolar pedidos cancelados das métricas de faturamento.' },
    { title: 'Chaves estrangeiras em cascata lógica', explanation: 'Relacionamentos claros entre itens, pedidos e clientes viabilizam análises de ticket médio e coorte.' },
  ],
  checkpoints: [
    { question: 'Por que não calcular a receita usando apenas a tabela produtos?', answer: 'Porque a tabela produtos guarda apenas o preço atual de tabela, não a quantidade realmente vendida nem os descontos praticados no momento da compra.' },
    { question: 'Como desconsiderar pedidos cancelados nas consultas?', answer: 'Filtrando com WHERE p.status != "cancelado" ou p.status IN ("pago", "enviado", "entregue").' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Relatório Executivo de E-Commerce Concluído',
  story: 'Notebooks e Monitores concentram 64,3% do faturamento dos pedidos válidos, enquanto SP e RJ lideram a receita por estado.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou avance para outros cenários de análise.',
};

export const LEVELS = [
  mission(
    1,
    'Catálogo Premium',
    'SELECT + WHERE',
    'Liste o nome e o preço (em centavos) de todos os produtos ativos com preço acima de R$ 500,00 (50000 centavos).',
    ['produtos'],
    ['nome', 'preco_unitario_centavos'],
    'SELECT nome, preco_unitario_centavos FROM produtos WHERE ativo = 1 AND preco_unitario_centavos > 50000 ORDER BY preco_unitario_centavos DESC;',
    ['where'],
    ['Filtre na tabela produtos.', 'Use WHERE ativo = 1 AND preco_unitario_centavos > 50000.', 'Ordene pelo preço para facilitar a leitura.'],
    'Existem produtos de alto valor agregado no catálogo ativo.',
    'WHERE permite filtrar linhas por múltiplos critérios com operadores lógicos.',
    ['dml-select-where']
  ),
  mission(
    2,
    'Produtos por Categoria',
    'COUNT + GROUP BY',
    'Mostre o nome da categoria e a quantidade total de produtos cadastrados em cada uma.',
    ['categorias', 'produtos'],
    ['categoria', 'total_produtos'],
    'SELECT c.nome AS categoria, COUNT(p.id) AS total_produtos FROM categorias c LEFT JOIN produtos p ON p.categoria_id = c.id GROUP BY c.id, c.nome ORDER BY total_produtos DESC;',
    ['group by', 'count', 'join'],
    ['Faça JOIN entre categorias e produtos.', 'Agrupe pelo nome ou ID da categoria.', 'Use COUNT(p.id) AS total_produtos.'],
    'Acessórios e Eletrônicos empatam na maior variedade do catálogo, com 4 produtos cada.',
    'GROUP BY combina linhas com base em valores comuns e calcula métricas agregadas.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    3,
    'Receita Bruta por Produto',
    'SUM + JOIN',
    'Calcule a receita total (quantidade * preço praticado) gerada por cada produto em pedidos pagos ou entregues.',
    ['produtos', 'itens_pedido', 'pedidos'],
    ['produto', 'receita_total_centavos'],
    "SELECT pr.nome AS produto, SUM(ip.quantidade * ip.preco_praticado_centavos) AS receita_total_centavos FROM itens_pedido ip JOIN produtos pr ON pr.id = ip.produto_id JOIN pedidos pe ON pe.id = ip.pedido_id WHERE pe.status IN ('pago', 'entregue') GROUP BY pr.id, pr.nome ORDER BY receita_total_centavos DESC;",
    ['sum', 'join', 'group by'],
    ['Junte itens_pedido com produtos e pedidos.', "Filtre WHERE pe.status IN ('pago', 'entregue').", 'Multiplique quantidade por preco_praticado_centavos dentro de SUM.'],
    'O Notebook Pro 15 é o líder absoluto de faturamento da loja.',
    'Multiplicar colunas dentro da função SUM agrega o total financeiro exato.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    4,
    'Campeões de Vendas',
    'ORDER BY + LIMIT',
    'Liste os 3 produtos mais vendidos em quantidade total de unidades nos pedidos não cancelados.',
    ['produtos', 'itens_pedido', 'pedidos'],
    ['nome', 'total_unidades_vendidas'],
    "SELECT pr.nome, SUM(ip.quantidade) AS total_unidades_vendidas FROM itens_pedido ip JOIN produtos pr ON pr.id = ip.produto_id JOIN pedidos pe ON pe.id = ip.pedido_id WHERE pe.status != 'cancelado' GROUP BY pr.id, pr.nome ORDER BY total_unidades_vendidas DESC, pr.id ASC LIMIT 3;",
    ['order by', 'limit', 'group by'],
    ['Agrupe por produto e some a quantidade.', "Filtre pedidos cancelados com WHERE pe.status != 'cancelado'.", 'Ordene por total_unidades_vendidas DESC e adicione LIMIT 3.'],
    'Monitor UltraWide 29, Teclado Mecânico RGB e Livro: SQL para Negócios lideram o ranking, com 4 unidades vendidas cada.',
    'LIMIT restringe o número de linhas devolvidas, ideal para rankings.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    5,
    'Detalhamento de Pedidos',
    'JOIN múltiplo',
    'Liste o ID do pedido, nome do cliente, estado e quantidade total de itens de cada pedido entregue.',
    ['pedidos', 'clientes', 'itens_pedido'],
    ['pedido_id', 'cliente_nome', 'estado', 'total_itens'],
    "SELECT pe.id AS pedido_id, cl.nome AS cliente_nome, cl.estado, SUM(ip.quantidade) AS total_itens FROM pedidos pe JOIN clientes cl ON cl.id = pe.cliente_id JOIN itens_pedido ip ON ip.pedido_id = pe.id WHERE pe.status = 'entregue' GROUP BY pe.id, cl.nome, cl.estado ORDER BY pe.id ASC;",
    ['join', 'group by', 'sum'],
    ['Junte pedidos com clientes e itens_pedido.', "Filtre WHERE pe.status = 'entregue'.", 'Agrupe pelo ID do pedido e some os itens.'],
    'A maioria dos pedidos entregues contém múltiplos itens combinados.',
    'JOIN múltiplo conecta entidades ponta a ponta sem perder contexto.',
    ['joins-inner-left', 'aggregation-groupby']
  ),
  mission(
    6,
    'Categorias com Alta Receita',
    'HAVING',
    'Liste o nome da categoria e o faturamento total em pedidos pagos/entregues, apenas para categorias com receita superior a R$ 5.000,00 (500000 centavos).',
    ['categorias', 'produtos', 'itens_pedido', 'pedidos'],
    ['categoria', 'receita_total_centavos'],
    "SELECT c.nome AS categoria, SUM(ip.quantidade * ip.preco_praticado_centavos) AS receita_total_centavos FROM categorias c JOIN produtos pr ON pr.categoria_id = c.id JOIN itens_pedido ip ON ip.produto_id = pr.id JOIN pedidos pe ON pe.id = ip.pedido_id WHERE pe.status IN ('pago', 'entregue') GROUP BY c.id, c.nome HAVING SUM(ip.quantidade * ip.preco_praticado_centavos) > 500000 ORDER BY receita_total_centavos DESC;",
    ['having', 'group by', 'join'],
    ['Agrupe por categoria e calcule a receita total.', 'Use HAVING para filtrar a agregação.', 'HAVING SUM(ip.quantidade * ip.preco_praticado_centavos) > 500000'],
    'Eletrônicos e Móveis de Escritório ultrapassam a meta de receita.',
    'HAVING filtra após a agregação, enquanto WHERE filtra linhas antes do GROUP BY.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    7,
    'Evolução Mensal de Vendas',
    'strftime + GROUP BY',
    'Mostre o ano-mês do pedido e o faturamento total arrecadado mês a mês (pedidos válidos).',
    ['pedidos', 'itens_pedido'],
    ['ano_mes', 'faturamento_centavos'],
    "SELECT strftime('%Y-%m', pe.data_pedido) AS ano_mes, SUM(ip.quantidade * ip.preco_praticado_centavos) AS faturamento_centavos FROM pedidos pe JOIN itens_pedido ip ON ip.pedido_id = pe.id WHERE pe.status != 'cancelado' GROUP BY strftime('%Y-%m', pe.data_pedido) ORDER BY ano_mes ASC;",
    ['group by', 'sum'],
    ['Use strftime(\'%Y-%m\', pe.data_pedido) para extrair o ano-mês.', 'Agrupe pelo ano-mês.', 'Ordene cronologicamente por ano_mes ASC.'],
    'O faturamento oscila ao longo da série e atinge o pico em maio, com R$ 12.440,00, antes de recuar em junho.',
    'Funções de formatação de data transformam timestamps em dimensões temporais.',
    ['aggregation-groupby', 'dml-select-where']
  ),
  mission(
    8,
    'Classificação de Pedidos por Porte',
    'CASE WHEN',
    'Para cada pedido, mostre o ID, o valor total e classifique como "Pequeno" (< 50000), "Médio" (50000 a 300000) ou "Grande" (> 300000 centavos).',
    ['pedidos', 'itens_pedido'],
    ['pedido_id', 'valor_total_centavos', 'porte_pedido'],
    "SELECT pe.id AS pedido_id, SUM(ip.quantidade * ip.preco_praticado_centavos) AS valor_total_centavos, CASE WHEN SUM(ip.quantidade * ip.preco_praticado_centavos) > 300000 THEN 'Grande' WHEN SUM(ip.quantidade * ip.preco_praticado_centavos) >= 50000 THEN 'Médio' ELSE 'Pequeno' END AS porte_pedido FROM pedidos pe JOIN itens_pedido ip ON ip.pedido_id = pe.id GROUP BY pe.id ORDER BY pe.id ASC;",
    ['case', 'group by'],
    ['Calcule a soma do valor total por pedido.', 'Use CASE WHEN no SELECT com as faixas de valor.', 'Finalize com END AS porte_pedido.'],
    'Pedidos de porte Grande concentram a maior fatia do faturamento.',
    'CASE WHEN permite segmentação condicional de registros no SQL.',
    ['case-when', 'aggregation-groupby']
  ),
  mission(
    9,
    'Produtos Acima da Média',
    'CTE + Subquery',
    'Liste os produtos cuja receita total em pedidos pagos/entregues seja superior à média de receita de todos os produtos com vendas.',
    ['produtos', 'itens_pedido', 'pedidos'],
    ['produto', 'receita_total_centavos'],
    "WITH receita_produtos AS (SELECT pr.id, pr.nome AS produto, SUM(ip.quantidade * ip.preco_praticado_centavos) AS receita_total_centavos FROM produtos pr JOIN itens_pedido ip ON ip.produto_id = pr.id JOIN pedidos pe ON pe.id = ip.pedido_id WHERE pe.status IN ('pago', 'entregue') GROUP BY pr.id, pr.nome) SELECT produto, receita_total_centavos FROM receita_produtos WHERE receita_total_centavos > (SELECT AVG(receita_total_centavos) FROM receita_produtos) ORDER BY receita_total_centavos DESC;",
    ['with', 'subquery', 'group by'],
    ['Crie uma CTE com a receita por produto.', 'No SELECT principal, compare com a subquery (SELECT AVG(receita_total_centavos) FROM receita_produtos).', 'Ordene por receita_total_centavos DESC.'],
    'Apenas produtos com alto valor unitário superam a média global de vendas.',
    'CTEs com subqueries isolam cálculos intermediários e tornam o código analítico legível.',
    ['cte-subqueries', 'aggregation-groupby']
  ),
  {
    ...mission(
      10,
      'View Executiva de Performance',
      'CREATE VIEW + JOIN + GROUP BY',
      'Crie a view vw_resumo_performance_produtos contendo produto_id, nome_produto, categoria, total_itens_vendidos e receita_total_centavos de todos os produtos em pedidos pagos ou entregues.',
      ['produtos', 'categorias', 'itens_pedido', 'pedidos'],
      ['produto_id', 'nome_produto', 'categoria', 'total_itens_vendidos', 'receita_total_centavos'],
      "CREATE VIEW vw_resumo_performance_produtos AS SELECT pr.id AS produto_id, pr.nome AS nome_produto, c.nome AS categoria, SUM(ip.quantidade) AS total_itens_vendidos, SUM(ip.quantidade * ip.preco_praticado_centavos) AS receita_total_centavos FROM produtos pr JOIN categorias c ON c.id = pr.categoria_id JOIN itens_pedido ip ON ip.produto_id = pr.id JOIN pedidos pe ON pe.id = ip.pedido_id WHERE pe.status IN ('pago', 'entregue') GROUP BY pr.id, pr.nome, c.nome;",
      ['create view', 'join', 'group by'],
      ['Use CREATE VIEW vw_resumo_performance_produtos AS SELECT ...', 'Junte produtos, categorias, itens_pedido e pedidos.', 'Agrupe por pr.id, pr.nome e c.nome.'],
      'A view consolidada foi disponibilizada para o time de BI e inteligência de mercado.',
      'Views encapsulam transformações e cálculos complexos em tabelas virtuais reutilizáveis.',
      ['views', 'joins-inner-left', 'aggregation-groupby']
    ),
    executionMode: 'create_view',
    viewName: 'vw_resumo_performance_produtos',
    verificationQuery: 'SELECT * FROM vw_resumo_performance_produtos ORDER BY produto_id ASC;',
    expectedResultQuery: "SELECT pr.id AS produto_id, pr.nome AS nome_produto, c.nome AS categoria, SUM(ip.quantidade) AS total_itens_vendidos, SUM(ip.quantidade * ip.preco_praticado_centavos) AS receita_total_centavos FROM produtos pr JOIN categorias c ON c.id = pr.categoria_id JOIN itens_pedido ip ON ip.produto_id = pr.id JOIN pedidos pe ON pe.id = ip.pedido_id WHERE pe.status IN ('pago', 'entregue') GROUP BY pr.id, pr.nome, c.nome ORDER BY produto_id ASC;",
  },
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
