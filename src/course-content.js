/**
 * course-content.js — Conteúdo didático estruturado do curso de SQL.
 *
 * Fase 10: Integração das transcrições em aulas/ ao jogo.
 * Cada item contém um resumo útil para o jogador, sem copiar as transcrições completas.
 * As referências (sourceLessons) apontam para os arquivos originais em aulas/.
 */

/**
 * @typedef {Object} CourseItem
 * @property {string} id - identificador único
 * @property {string[]} sourceLessons - arquivos de origem em aulas/
 * @property {string} concept - conceito SQL ensinado
 * @property {string} learningObjective - objetivo de aprendizagem
 * @property {string} explanation - explicação curta e útil
 * @property {string} syntaxExample - exemplo de sintaxe essencial
 * @property {string} commonMistake - erro comum mencionado na aula
 * @property {'supported'|'partial'|'unsupported'} sqliteCompatibility
 * @property {number[]} relatedLevels - missões relacionadas
 * @property {'mission'|'lab'|'conceptual'} implementationType
 */

export const COURSE_CONTENT = [
  {
    id: 'sql-intro',
    sourceLessons: ['aulas/Aula 2 - Linguagem SQL - Mais Jovem do Que Nunca.md'],
    concept: 'Introdução à Linguagem SQL',
    learningObjective: 'Compreender a relevância do SQL como linguagem essencial para dados',
    explanation: 'SQL foi criada em 1974 e continua sendo a linguagem padrão para acessar bancos de dados. Em engenharia de dados, é impossível fugir do SQL — pipelines, cargas e consultas dependem dela.',
    syntaxExample: '-- SQL é a base de tudo no jogo\nSELECT * FROM funcionarios;',
    commonMistake: 'Achar que SQL é obsoleto ou que pode ser substituído por ferramentas visuais.',
    sqliteCompatibility: 'supported',
    relatedLevels: [1],
    implementationType: 'conceptual',
  },
  {
    id: 'ddl-create-table',
    sourceLessons: [
      'aulas/Aula 4 - Instruções DDL - CREATE, ALTER, DROP - Parte 1-2.md',
      'aulas/Aula 5 - Instruções DDL - CREATE, ALTER, DROP - Parte 2-2.md',
    ],
    concept: 'DDL — CREATE TABLE, ALTER TABLE, DROP',
    learningObjective: 'Criar, modificar e remover tabelas definindo colunas, tipos e chaves',
    explanation: 'DDL (Data Definition Language) cria e modifica a estrutura do banco. CREATE TABLE define colunas e tipos. ALTER TABLE adiciona/remove colunas. DROP TABLE deleta a tabela inteira.',
    syntaxExample: 'CREATE TABLE funcionarios (\n  id INTEGER PRIMARY KEY,\n  nome TEXT NOT NULL,\n  salario REAL\n);\nALTER TABLE funcionarios ADD COLUMN data_contratacao TEXT;',
    commonMistake: 'Esquecer de definir PRIMARY KEY; tentar criar objeto que já existe; usar DROP sem backup.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'lab',
  },
  {
    id: 'dml-insert',
    sourceLessons: ['aulas/Aula 6 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 1-2.md'],
    concept: 'DML — INSERT INTO',
    learningObjective: 'Inserir registros respeitando tipos e correspondência de colunas',
    explanation: 'INSERT INTO adiciona linhas a uma tabela. O número de valores deve corresponder ao número de colunas. Texto e data usam aspas simples; números não.',
    syntaxExample: "INSERT INTO funcionarios (id, nome, cargo) VALUES (1, 'Ana Souza', 'Analista Financeiro');",
    commonMistake: 'Número de valores diferente de colunas; esquecer aspas em texto; formato de data incorreto.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'lab',
  },
  {
    id: 'dml-select-where',
    sourceLessons: ['aulas/Aula 7 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 2-2.md'],
    concept: 'DML — SELECT, UPDATE, DELETE com WHERE',
    learningObjective: 'Consultar, atualizar e deletar registros com filtro',
    explanation: 'SELECT retorna dados; UPDATE modifica; DELETE remove. WHERE filtra quais linhas são afetadas. Sem WHERE, UPDATE e DELETE afetam TODOS os registros.',
    syntaxExample: "SELECT nome, cargo FROM funcionarios WHERE departamento_id = 1;\nUPDATE funcionarios SET salario = 5000 WHERE nome = 'Ana';\nDELETE FROM funcionarios WHERE id = 99;",
    commonMistake: 'Esquecer WHERE em UPDATE/DELETE — afeta todos os registros; tentar inserir ID duplicado.',
    sqliteCompatibility: 'supported',
    relatedLevels: [1, 2, 4],
    implementationType: 'mission',
  },
  {
    id: 'aggregation-groupby',
    sourceLessons: [
      'aulas/Aula 8 - Funções de Agregação e Agrupamento - Parte 1-2.md',
      'aulas/Aula 24 - Lab 1 - Criação de Relatórios do DW com Linguagem SQL.md',
    ],
    concept: 'Funções de Agregação e GROUP BY',
    learningObjective: 'Usar MIN, MAX, AVG, SUM, COUNT e GROUP BY para segmentar resultados',
    explanation: 'Funções de agregação resumem múltiplas linhas em um valor. GROUP BY divide as linhas em grupos e a agregação é calculada por grupo. Toda coluna não agregada no SELECT deve aparecer no GROUP BY.',
    syntaxExample: "SELECT departamento, COUNT(*) AS total, ROUND(AVG(salario), 2) AS media\nFROM funcionarios GROUP BY departamento;",
    commonMistake: 'Colocar coluna não agregada no SELECT sem incluí-la no GROUP BY; não usar ROUND com AVG.',
    sqliteCompatibility: 'supported',
    relatedLevels: [6, 10, 12],
    implementationType: 'mission',
  },
  {
    id: 'having-where-orderby-like',
    sourceLessons: [
      'aulas/Aula 9 - Funções de Agregação e Agrupamento - Parte 2-2.md',
      'aulas/Aula 24 - Lab 1 - Criação de Relatórios do DW com Linguagem SQL.md',
    ],
    concept: 'HAVING vs WHERE, ORDER BY, LIKE',
    learningObjective: 'Diferenciar WHERE (filtro de linhas) de HAVING (filtro de grupos) e usar ORDER BY e LIKE',
    explanation: 'WHERE filtra linhas ANTES do agrupamento. HAVING filtra grupos DEPOIS do GROUP BY. ORDER BY ordena o resultado. LIKE busca padrões de texto com % (curinga).',
    syntaxExample: "SELECT departamento, COUNT(*) AS total\nFROM funcionarios\nWHERE nome LIKE 'A%'\nGROUP BY departamento\nHAVING COUNT(*) > 2\nORDER BY total DESC;",
    commonMistake: 'Tentar usar agregação no WHERE (gera erro); confundir WHEN usar WHERE vs HAVING; reordenar cláusulas.',
    sqliteCompatibility: 'supported',
    relatedLevels: [3, 7, 9],
    implementationType: 'mission',
  },
  {
    id: 'joins-inner-left',
    sourceLessons: [
      'aulas/Aula 10 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 1-5.md',
      'aulas/Aula 11 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 2-5.md',
      'aulas/Aula 24 - Lab 1 - Criação de Relatórios do DW com Linguagem SQL.md',
    ],
    concept: 'INNER JOIN e LEFT JOIN',
    learningObjective: 'Escolher o tipo de junção conforme a necessidade de correspondência',
    explanation: 'INNER JOIN retorna apenas linhas com correspondência em ambas as tabelas. LEFT JOIN retorna TODAS as linhas da tabela da esquerda, mesmo sem correspondência (NULL nos campos da direita). COALESCE substitui NULL por um valor padrão.',
    syntaxExample: "-- INNER JOIN: apenas quem tem correspondência\nSELECT f.nome, t.valor FROM transacoes t\n  INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id;\n\n-- LEFT JOIN: todos os funcionários, mesmo sem transação\nSELECT f.nome FROM funcionarios f\n  LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id\n  WHERE t.id IS NULL;",
    commonMistake: 'Esquecer a cláusula ON; decorar sintaxe sem entender o resultado; não tratar NULL no LEFT JOIN.',
    sqliteCompatibility: 'supported',
    relatedLevels: [5, 8, 12],
    implementationType: 'mission',
  },
  {
    id: 'joins-right-full',
    sourceLessons: [
      'aulas/Aula 12 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 3-5.md',
      'aulas/Aula 13 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 4-5.md',
    ],
    concept: 'RIGHT JOIN, FULL JOIN e CROSS JOIN',
    learningObjective: 'Compreender os tipos adicionais de junção e quando usar cada um',
    explanation: 'RIGHT JOIN retorna todas as linhas da tabela da direita. FULL JOIN combina tudo de ambos os lados. CROSS JOIN faz produto cartesiano. SELF JOIN junta uma tabela com ela mesma. SQLite 3.39+ suporta RIGHT e FULL JOIN nativamente.',
    syntaxExample: "-- RIGHT JOIN (equivalente a LEFT JOIN invertido)\nSELECT f.nome, p.nome_projeto FROM funcionarios f\n  RIGHT JOIN projetos p ON f.id = p.func_id;\n\n-- FULL JOIN: tudo de ambos os lados\nSELECT COALESCE(f.nome, 'Sem funcionário') AS nome\n  FROM funcionarios f FULL JOIN projetos p ON f.id = p.func_id;",
    commonMistake: 'Confundir qual tabela está à esquerda/direita; esquecer COALESCE em ambos os lados do FULL JOIN.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'conceptual',
  },
  {
    id: 'cte-subqueries',
    sourceLessons: [
      'aulas/Aula 15 - Subconsultas e CTEs (Common Table Expressions) - Parte 1-3.md',
      'aulas/Aula 17 - Subconsultas e CTEs (Common Table Expressions) - Parte 2-3.md',
      'aulas/Aula 18 - Subconsultas e CTEs (Common Table Expressions) - Parte 3-3.md',
    ],
    concept: 'Subconsultas e CTEs (WITH)',
    learningObjective: 'Usar subqueries e CTEs para consultas aninhadas e tabelas temporárias',
    explanation: 'Uma subquery é um SELECT dentro de outro SELECT. CTE (Common Table Expression) usa WITH para criar uma tabela temporária em memória, tornando queries complexas mais legíveis. Ambas permitem reutilizar resultados intermediários.',
    syntaxExample: "-- Subquery: transações acima da média\nSELECT id, valor_centavos FROM transacoes\n  WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes);\n\n-- CTE: tabela temporária com WITH\nWITH alto_risco AS (\n  SELECT id, valor_centavos FROM transacoes WHERE valor_centavos > 5000000\n)\nSELECT * FROM alto_risco;",
    commonMistake: 'Executar SELECT sem o bloco WITH completo; esquecer colunas no SELECT interno do CTE; usar GROUP BY quando subquery é mais eficiente.',
    sqliteCompatibility: 'supported',
    relatedLevels: [10, 12],
    implementationType: 'mission',
  },
  {
    id: 'case-when',
    sourceLessons: [],
    concept: 'CASE WHEN — Lógica Condicional',
    learningObjective: 'Criar colunas condicionais para classificar dados',
    explanation: 'CASE WHEN cria valores condicionais dentro de um SELECT. Cada WHEN testa uma condição; THEN define o valor retornado; ELSE é o padrão. END fecha o bloco. É equivalente a um if/else dentro do SQL. O SQLite também suporta a função IIF() para casos simples de duas vias.',
    note: 'CASE WHEN não é ensinado explicitamente nas transcrições do curso. O conceito foi incluído como missão 11 do jogo por sua importância em SQL. A explicação acima é uma síntese pedagógica, não uma referência direta a uma aula.',
    syntaxExample: "SELECT id, valor_centavos,\n  CASE WHEN valor_centavos > 5000000 THEN 'alto'\n       WHEN valor_centavos > 1000000 THEN 'medio'\n       ELSE 'baixo' END AS nivel_risco\nFROM transacoes;",
    commonMistake: 'Esquecer END; confundir ordem das condições (avaliadas de cima para baixo); não incluir ELSE.',
    sqliteCompatibility: 'supported',
    relatedLevels: [11, 12],
    implementationType: 'mission',
  },
  {
    id: 'views',
    sourceLessons: [
      'aulas/Aula 5 - Trabalhando com Views - Parte 1-2.md',
      'aulas/Aula 6 - Trabalhando com Views - Parte 2-2.md',
    ],
    concept: 'Views — Query Salva no Banco',
    learningObjective: 'Criar views para padronizar relatórios e esconder complexidade',
    explanation: 'Uma view é uma query salva no banco que pode ser consultada como se fosse uma tabela. Ela não armazena dados — executa a query a cada chamada. Nos Casos 002 e 004 e na missão 10 dos projetos que culminam em uma view, CREATE VIEW transforma consultas validadas em relatórios padronizados e reutilizáveis.',
    syntaxExample: 'CREATE VIEW vw_funcionarios_ti AS\n  SELECT nome, cargo FROM funcionarios WHERE departamento_id = 2;\n\nSELECT * FROM vw_funcionarios_ti;',
    commonMistake: 'Pensar que view armazena dados; omitir aliases das colunas calculadas; tentar usar CREATE OR REPLACE, que não é nativo no SQLite.',
    sqliteCompatibility: 'partial',
    relatedLevels: [10, 11],
    implementationType: 'mission',
  },
  {
    id: 'materialized-views',
    sourceLessons: [
      'aulas/Aula 8 - Trabalhando com Views Materializadas - Parte 1-2.md',
      'aulas/Aula 9 - Trabalhando com Views Materializadas - Parte 2-2.md',
    ],
    concept: 'Views Materializadas',
    learningObjective: 'Compreender quando usar views materializadas para performance',
    explanation: 'Uma view materializada (MView) armazena o resultado da query como uma tabela física. Resolve problemas de performance de views comuns, mas precisa de refresh manual (REFRESH MATERIALIZED VIEW) para se atualizar.',
    syntaxExample: 'CREATE MATERIALIZED VIEW mv_vendas AS\n  SELECT produto, SUM(valor) FROM vendas GROUP BY produto;\n\nREFRESH MATERIALIZED VIEW mv_vendas;',
    commonMistake: 'Esquecer de fazer refresh (dados desatualizados); usar MView quando não há problema de performance.',
    sqliteCompatibility: 'unsupported',
    relatedLevels: [],
    implementationType: 'conceptual',
  },
  {
    id: 'stored-procedures',
    sourceLessons: [
      'aulas/Aula 11 - Trabalhando com Stored Procedures - Parte 1-2.md',
      'aulas/Aula 12 - Trabalhando com Stored Procedures - Parte 2-2.md',
      'aulas/Aula 15 - Qual a Diferença Entre Stored Procedure e Function.md',
    ],
    concept: 'Stored Procedures e Functions',
    learningObjective: 'Diferenciar SP de Function e compreender programação de banco',
    explanation: 'Stored Procedures são blocos de código procedural (PL/pgSQL) executados com CALL. Functions retornam um valor e podem ser usadas dentro de SELECT. SP é procedural; Function é funcional. SQLite não suporta nenhum dos dois nativamente.',
    syntaxExample: "-- PostgreSQL (NÃO funciona em SQLite)\nCREATE OR REPLACE PROCEDURE relatorio()\n  LANGUAGE plpgsql AS $$ BEGIN ... END; $$;\nCALL relatorio();",
    commonMistake: 'Tentar usar SP dentro de SELECT; confundir PL/pgSQL com SQL puro; esquecer CALL.',
    sqliteCompatibility: 'unsupported',
    relatedLevels: [],
    implementationType: 'conceptual',
  },
  {
    id: 'triggers',
    sourceLessons: [
      'aulas/Aula 16 - Trabalhando com Triggers e Funções - Parte 1-2.md',
      'aulas/Aula 17 - Trabalhando com Triggers e Funções - Parte 2-2.md',
      'aulas/Aula 18 - Habilitando Auditoria no Banco de Dados.md',
    ],
    concept: 'Triggers e Auditoria',
    learningObjective: 'Criar gatilhos que executam automaticamente em eventos de tabela',
    explanation: 'Triggers são gatilhos que disparam automaticamente em INSERT/UPDATE/DELETE. BEFORE INSERT valida dados antes de gravar. BEFORE UPDATE pode salvar valores antigos para auditoria. Em SQLite, a lógica vai direto na trigger (sem PL/pgSQL).',
    syntaxExample: "-- SQLite: impedir projeto sem funcionário\nCREATE TRIGGER trg_check\n  BEFORE INSERT ON projetos\n  FOR EACH ROW WHEN NEW.func_id IS NULL\n  BEGIN SELECT RAISE(ABORT, 'Projeto precisa de funcionário'); END;",
    commonMistake: 'Usar AFTER quando precisa validar antes; deixar trigger ativa permanentemente (performance); esquecer FOR EACH ROW.',
    sqliteCompatibility: 'partial',
    relatedLevels: [],
    implementationType: 'conceptual',
  },
  {
    id: 'transactions',
    sourceLessons: ['aulas/Aula 19 - Controle de Transações - COMMIT, ROLLBACK.md'],
    concept: 'Transações — COMMIT e ROLLBACK',
    learningObjective: 'Garantir atomicidade em operações de múltiplas instruções',
    explanation: 'Uma transação é um bloco atômico: ou todas as operações succeed (COMMIT) ou nenhuma persiste (ROLLBACK). BEGIN inicia a transação. Útil quando múltiplos INSERTs dependem uns dos outros.',
    syntaxExample: 'BEGIN;\nINSERT INTO funcionarios VALUES (10, "Novo", "Analista", 1, 5000, "2024-01-01");\nINSERT INTO contas VALUES (200, "200-x", 10, NULL, "Banco X", "corrente");\nCOMMIT;  -- ou ROLLBACK para desfazer',
    commonMistake: 'Esquecer COMMIT (dados não persistem); não usar ROLLBACK quando uma operação falha no meio; tratar operações dependentes como transações separadas.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'lab',
  },
  {
    id: 'indexes-optimization',
    sourceLessons: ['aulas/Aula 20 - Indexação e Otimização de Consultas.md'],
    concept: 'Índices e Otimização',
    learningObjective: 'Analisar planos de execução e criar índices estrategicamente',
    explanation: 'Índices aceleram consultas em colunas usadas em WHERE e JOINs. EXPLAIN (ou EXPLAIN QUERY PLAN no SQLite) mostra o plano de execução. Trade-off: índices melhoram leitura mas prejudicam escrita (carga). Em ETL, desativar índices durante carga e recriar depois.',
    syntaxExample: "EXPLAIN QUERY PLAN SELECT * FROM transacoes WHERE valor_centavos > 5000000;\nCREATE INDEX idx_valor ON transacoes(valor_centavos);\nDROP INDEX idx_valor;",
    commonMistake: 'Criar índices sem critério; deixar índices ativos durante carga ETL; assumir que mais índices = sempre mais rápido.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'conceptual',
  },
  {
    id: 'string-functions',
    sourceLessons: ['aulas/Aula 7 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 2-2.md'],
    concept: 'Funções de texto — SUBSTR, INSTR e REPLACE',
    learningObjective: 'Extrair, localizar e transformar partes de textos sem alterar os dados originais',
    explanation: 'SUBSTR extrai uma parte do texto, INSTR encontra a posição de um termo e REPLACE substitui ocorrências. São úteis para mascarar dados pessoais e normalizar logs.',
    syntaxExample: "SELECT SUBSTR(cpf, -4), REPLACE(formato, 'CSV', 'arquivo CSV') FROM clientes;",
    commonMistake: 'Confundir a posição inicial com o tamanho em SUBSTR ou sobrescrever dados quando uma transformação no SELECT seria suficiente.',
    sqliteCompatibility: 'supported', relatedLevels: [], implementationType: 'mission',
  },
  {
    id: 'window-functions',
    sourceLessons: ['aulas/Aula 9 - Funções de Agregação e Agrupamento - Parte 2-2.md'],
    concept: 'Window Functions — ROW_NUMBER, LAG e SUM OVER',
    learningObjective: 'Calcular rankings, comparações e acumulados preservando cada linha do resultado',
    explanation: 'Funções de janela usam OVER. PARTITION BY cria grupos independentes e ORDER BY define a sequência. Diferente de GROUP BY, elas não reduzem o número de linhas.',
    syntaxExample: 'SELECT data_hora, LAG(data_hora) OVER (PARTITION BY origem ORDER BY data_hora) AS anterior FROM transferencias;',
    commonMistake: 'Usar GROUP BY quando precisa manter cada transação; esquecer ORDER BY em LAG ou em um acumulado.',
    sqliteCompatibility: 'supported', relatedLevels: [], implementationType: 'mission',
  },
  {
    id: 'null-handling',
    sourceLessons: ['aulas/Aula 7 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 2-2.md'],
    concept: 'Valores nulos — COALESCE e NULLIF',
    learningObjective: 'Tratar ausência de dados sem confundir NULL, texto vazio e zero',
    explanation: 'COALESCE devolve o primeiro valor não nulo. NULLIF converte dois valores iguais em NULL, útil para tratar texto vazio como ausência de informação.',
    syntaxExample: "SELECT COALESCE(quantidade, 0), NULLIF(motivo, '') FROM movimentacoes_estoque;",
    commonMistake: 'Comparar NULL com =; use IS NULL para testar ausência e COALESCE para definir um valor alternativo.',
    sqliteCompatibility: 'supported', relatedLevels: [], implementationType: 'mission',
  },
  {
    id: 'json-functions',
    sourceLessons: ['aulas/Aula 18 - Habilitando Auditoria no Banco de Dados.md'],
    concept: 'Funções JSON — json_extract e json_each',
    learningObjective: 'Ler atributos estruturados salvos em colunas JSON',
    explanation: 'json_extract recebe um documento JSON e um caminho, como $.estoque_atual. Isso permite comparar o estado anterior e posterior guardado pela auditoria.',
    syntaxExample: "SELECT json_extract(dados_antes, '$.estoque_atual') FROM auditoria;",
    commonMistake: 'Esquecer o prefixo $ no caminho JSON ou tratar um campo ausente como se fosse uma string vazia.',
    sqliteCompatibility: 'supported', relatedLevels: [], implementationType: 'mission',
  },
];

/**
 * Retorna todos os itens de conteúdo do curso.
 * @returns {CourseItem[]}
 */
export function getAllCourseContent() {
  return COURSE_CONTENT;
}

/**
 * Retorna itens de conteúdo relacionados a um nível (missão) específico.
 * @param {number} levelId
 * @returns {CourseItem[]}
 */
export function getCourseContentByLevel(levelId) {
  return COURSE_CONTENT.filter(item => item.relatedLevels.includes(levelId));
}

/**
 * Retorna um item de conteúdo pelo seu ID.
 * @param {string} id
 * @returns {CourseItem|undefined}
 */
export function getCourseContentById(id) {
  return COURSE_CONTENT.find(item => item.id === id);
}

/**
 * Retorna itens de conteúdo por tipo de implementação.
 * @param {'mission'|'lab'|'conceptual'} type
 * @returns {CourseItem[]}
 */
export function getCourseContentByType(type) {
  return COURSE_CONTENT.filter(item => item.implementationType === type);
}
