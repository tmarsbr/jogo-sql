/** Missões do Caso #004 — Sabotagem no E-Commerce. */
const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs, requirements = []) => ({ id, title, concept, briefing: `A Black Friday deixou rastros no banco. ${objective}`, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs, requirements });
export const CASE_INTRO = { title: 'Sabotagem no E-Commerce', subtitle: 'Caso #004 — Estoque Fantasma', story: 'Durante a Black Friday, produtos sumiram do estoque da TechStore enquanto clientes continuavam pagando. Há inconsistências entre pedidos, estoque e auditoria.', mission: 'Resolva 11 missões para revelar a sabotagem e publicar o dossiê de auditoria.' };
export const DATABASE_ANALYSIS = {
  title: 'Venda, estoque e auditoria contam partes diferentes da história',
  summary: 'O modelo separa catálogo, pedidos, itens vendidos, movimentos de estoque e registros de auditoria. Assim, o valor atual de um produto pode ser confrontado com fatos históricos sem misturar o estado do cadastro com os eventos que o alteraram.',
  entities: [
    { name: 'produtos', role: 'Estado atual do catálogo, preço e estoque.', key: 'PK id', relations: ['É referenciada por itens e movimentações'] },
    { name: 'pedidos', role: 'Cabeçalho comercial com cliente, data, status e total.', key: 'PK id', relations: ['cliente_id → clientes_ecommerce.id'] },
    { name: 'itens_pedido', role: 'Resolve a relação entre pedidos e produtos, incluindo quantidade e preço histórico.', key: 'PK id', relations: ['pedido_id → pedidos.id', 'produto_id → produtos.id'] },
    { name: 'movimentacoes_estoque', role: 'Histórico operacional de entradas, saídas e ajustes.', key: 'PK id', relations: ['produto_id → produtos.id'] },
    { name: 'auditoria', role: 'Captura antes, depois, operação e usuário responsável.', key: 'PK id', relations: ['tabela + registro_id formam uma referência lógica ao registro auditado'] },
  ],
  decisions: [
    { title: 'Pedido e item não são a mesma entidade', explanation: 'Um pedido pode conter vários produtos. itens_pedido representa essa cardinalidade e preserva quantidade e preço da compra.' },
    { title: 'Estado atual versus histórico', explanation: 'produtos mostra o estoque agora; movimentacoes_estoque e auditoria explicam como ele chegou a esse valor.' },
    { title: 'Auditoria polimórfica', explanation: 'auditoria pode registrar várias tabelas. Ao relacioná-la a produtos, a consulta deve filtrar tabela = produtos antes de usar registro_id.' },
  ],
  checkpoints: [
    { question: 'Por que o preço unitário também aparece em itens_pedido?', answer: 'O preço do catálogo pode mudar. Guardar o valor praticado no item preserva a verdade histórica da venda sem sobrescrever o produto.' },
    { question: 'Por que uma view é útil sobre auditoria?', answer: 'Ela encapsula o filtro da tabela correta, o JOIN com produtos e a leitura do JSON, entregando um relatório consistente para novas consultas.' },
  ],
};
export const CASE_CONCLUSION = { title: 'Sabotagem Revelada', story: 'Lucas Prado fez ajustes manuais em produtos populares durante a Black Friday, derrubando o estoque e abrindo espaço para um marketplace paralelo.', nextSteps: 'Todos os casos estão concluídos. Explore os bancos no Sandbox.' };
export const LEVELS = [
  mission(1,'Estoque Fantasma','SELECT + WHERE','Liste produtos cujo estoque é zero ou negativo.',['produtos'],['nome','estoque_atual'],'SELECT nome, estoque_atual FROM produtos WHERE estoque_atual <= 0 ORDER BY id;',['where'],['Compare estoque_atual com zero.','Use <= para incluir negativos.','WHERE estoque_atual <= 0'],'Produtos populares foram zerados ou ficaram negativos.','WHERE filtra a anomalia de estoque.',['dml-select-where']),
  mission(2,'Black Friday Suspeita','WHERE + datas','Liste pedidos feitos nos dias 29 e 30 de novembro de 2024.',['pedidos'],['id','data_hora','total_centavos'],"SELECT id, data_hora, total_centavos FROM pedidos WHERE date(data_hora) BETWEEN '2024-11-29' AND '2024-11-30' ORDER BY id;",['where'],['date(data_hora) remove a hora.','Use BETWEEN para o período.','WHERE date(data_hora) BETWEEN ...'],'Os pedidos afetados se concentram na Black Friday.','Funções de data tornam filtros de período claros.',['dml-select-where']),
  mission(3,'Produto Mais Vendido','GROUP BY + SUM + ORDER BY','Mostre produto e quantidade vendida em ordem decrescente.',['itens_pedido','produtos'],['nome','quantidade_vendida'],'SELECT p.nome, SUM(i.quantidade) AS quantidade_vendida FROM itens_pedido i JOIN produtos p ON p.id = i.produto_id GROUP BY p.id, p.nome ORDER BY quantidade_vendida DESC, p.id;',['group by','sum','order by'],['Junte itens_pedido a produtos.','Some a quantidade.', 'Ordene pelo alias em ordem decrescente.'],'O Notebook Nitro lidera as vendas mesmo com estoque inconsistente.','SUM e GROUP BY criam rankings.',['aggregation-groupby','joins-inner-left']),
  mission(4,'O Buraco no Estoque','JOIN','Mostre pedido, produto, quantidade e estoque atual dos itens vendidos.',['itens_pedido','produtos'],['pedido_id','nome','quantidade','estoque_atual'],'SELECT i.pedido_id, p.nome, i.quantidade, p.estoque_atual FROM itens_pedido i JOIN produtos p ON p.id = i.produto_id ORDER BY i.id;',['join'],['O produto está em itens_pedido por produto_id.','Junte com produtos por id.','Selecione somente as quatro colunas.'],'Vendas continuam ocorrendo apesar do estoque zerado.','JOIN conecta a venda ao estado atual do produto.',['joins-inner-left']),
  mission(5,'Vendas vs. Estoque','Subquery','Liste produtos cujo total vendido é maior que o estoque registrado.',['produtos','itens_pedido'],['nome','estoque_atual','total_vendido'],'SELECT p.nome, p.estoque_atual, (SELECT SUM(i.quantidade) FROM itens_pedido i WHERE i.produto_id = p.id) AS total_vendido FROM produtos p WHERE (SELECT COALESCE(SUM(i.quantidade), 0) FROM itens_pedido i WHERE i.produto_id = p.id) > p.estoque_atual ORDER BY p.id;',['subquery'],['A subquery deve somar itens por produto.', 'Compare o total com p.estoque_atual.', 'Use uma subquery também no SELECT.'],'A discrepância confirma vendas acima do estoque disponível.','Subqueries permitem comparar cada produto com seu próprio total vendido.',['cte-subqueries'],['Produtos sem nenhuma venda não entram no resultado: trate a soma vazia como 0 na comparação.','Compare o total vendido com estoque_atual usando "maior que" (estritamente).']),
  mission(6,'Ajustes Misteriosos','WHERE + LIKE','Liste ajustes manuais de estoque.',['movimentacoes_estoque'],['id','produto_id','responsavel_id'],'SELECT id, produto_id, responsavel_id FROM movimentacoes_estoque WHERE motivo LIKE \'%ajuste manual%\' ORDER BY id;',['where','like'],['O motivo guarda a expressão ajuste manual.','LIKE usa % como curinga.','WHERE motivo LIKE \'%ajuste manual%\''],'Os ajustes manuais se concentram em um responsável.','LIKE encontra texto parcial.',['having-where-orderby-like']),
  mission(7,'O Nulo Revelador','COALESCE + NULLIF','Mostre movimentações com quantidade e motivo tratados para valores nulos.',['movimentacoes_estoque'],['id','quantidade_tratada','motivo_tratado'],"SELECT id, COALESCE(quantidade, 0) AS quantidade_tratada, NULLIF(motivo, '') AS motivo_tratado FROM movimentacoes_estoque ORDER BY id;",['coalesce','nullif'],['COALESCE substitui NULL por um padrão.', 'NULLIF transforma valor vazio em NULL.', 'Dê aliases às colunas tratadas.'],'Campos ausentes deixam rastros que precisam ser tratados explicitamente.','COALESCE e NULLIF lidam com ausência de dados.',['null-handling']),
  mission(8,'Antes e Depois','Funções JSON','Mostre o estoque anterior e posterior registrado na auditoria.',['auditoria'],['id','estoque_antes','estoque_depois'],"SELECT id, json_extract(dados_antes, '$.estoque_atual') AS estoque_antes, json_extract(dados_depois, '$.estoque_atual') AS estoque_depois FROM auditoria ORDER BY id;",['json_extract'],['Os campos são textos JSON.', 'json_extract recebe a coluna e o caminho.', "O caminho do estoque é '$.estoque_atual'."],'A auditoria mostra estoques sendo levados a zero.','json_extract lê um atributo dentro de JSON.',['json-functions']),
  mission(9,'Quem Mexeu?','GROUP BY + HAVING','Encontre responsáveis com mais de três ajustes manuais.',['movimentacoes_estoque'],['responsavel_id','total_ajustes'],"SELECT responsavel_id, COUNT(*) AS total_ajustes FROM movimentacoes_estoque WHERE motivo LIKE '%ajuste manual%' GROUP BY responsavel_id HAVING COUNT(*) > 3 ORDER BY responsavel_id;",['group by','having'],['Filtre ajustes manuais antes de agrupar.', 'Conte por responsavel_id.', 'HAVING filtra o total.'],'O responsável 7 lidera os ajustes suspeitos.','HAVING filtra grupos após COUNT.',['aggregation-groupby','having-where-orderby-like']),
  mission(10,'A Sabotagem Revelada','CTE + JOIN múltiplo','Identifique o usuário da auditoria com ajustes manuais em produtos vendidos na Black Friday.',['auditoria','movimentacoes_estoque','itens_pedido','produtos'],['usuario','ajustes_auditados'],'WITH ajustes AS (SELECT a.usuario, a.registro_id FROM auditoria a WHERE a.tabela = \'produtos\' AND a.operacao = \'UPDATE\') SELECT aj.usuario, COUNT(DISTINCT m.id) AS ajustes_auditados FROM ajustes aj JOIN movimentacoes_estoque m ON m.produto_id = aj.registro_id JOIN itens_pedido i ON i.produto_id = m.produto_id JOIN produtos p ON p.id = m.produto_id WHERE m.motivo LIKE \'%ajuste manual%\' GROUP BY aj.usuario HAVING COUNT(DISTINCT m.id) >= 3 ORDER BY aj.usuario;',['with','join'],['A CTE deve isolar a auditoria de produtos.', 'Junte as movimentações pelo produto.', 'Garanta que o produto foi vendido.'],'Lucas Prado aparece em auditoria, ajustes e produtos vendidos.','CTE e JOIN múltiplo conectam a cadeia de evidências.',['cte-subqueries','joins-inner-left']),
  {
    ...mission(
      11,
      'Dossiê de Auditoria',
      'CREATE VIEW + JOIN + JSON',
      'Crie a view vw_auditoria_estoque com id, usuario, produto, estoque_antes e estoque_depois para as atualizações auditadas em produtos.',
      ['auditoria','produtos'],
      ['id','usuario','produto','estoque_antes','estoque_depois'],
      "CREATE VIEW vw_auditoria_estoque AS SELECT a.id, a.usuario, p.nome AS produto, json_extract(a.dados_antes, '$.estoque_atual') AS estoque_antes, json_extract(a.dados_depois, '$.estoque_atual') AS estoque_depois FROM auditoria a JOIN produtos p ON p.id = a.registro_id WHERE a.tabela = 'produtos' AND a.operacao = 'UPDATE';",
      ['create view','join','json_extract','where'],
      [
        'A view deve salvar um SELECT que una auditoria a produtos.',
        "Filtre a referência polimórfica com a.tabela = 'produtos' e a.operacao = 'UPDATE'.",
        "Extraia $.estoque_atual dos dois campos JSON. Execute somente o CREATE VIEW; a prévia será aberta automaticamente.",
      ],
      'O dossiê padronizado preserva cada alteração de estoque, o produto atingido e o usuário registrado pela auditoria.',
      'A view encapsula o JOIN, o filtro de segurança e a extração de JSON em um relatório reutilizável.',
      ['views','joins-inner-left','json-functions']
    ),
    executionMode: 'create_view',
    viewName: 'vw_auditoria_estoque',
    verificationQuery: 'SELECT * FROM vw_auditoria_estoque ORDER BY id;',
    expectedResultQuery: "SELECT a.id, a.usuario, p.nome AS produto, json_extract(a.dados_antes, '$.estoque_atual') AS estoque_antes, json_extract(a.dados_depois, '$.estoque_atual') AS estoque_depois FROM auditoria a JOIN produtos p ON p.id = a.registro_id WHERE a.tabela = 'produtos' AND a.operacao = 'UPDATE' ORDER BY a.id;",
  },
];
export function getLevel(id) { return LEVELS.find(level => level.id === id); }
export function getTotalLevels() { return LEVELS.length; }
