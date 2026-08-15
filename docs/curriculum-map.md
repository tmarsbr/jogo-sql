# Mapa Curricular — SQL Detective

> Mapeamento das transcrições em `aulas/` para o conteúdo pedagógico do jogo.
> Geração: Fase 10 da implementação.

---

## Trilha 1 — Fundamentos de SQL (CAP03/CAP04)

### Módulo 1: Introdução à Linguagem SQL

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 2 - Linguagem SQL - Mais Jovem do Que Nunca.md` |
| **Título** | Introdução à Linguagem SQL para Engenheiros de Dados |
| **Conceitos** | História do SQL (1974); importância em ciência/engenharia de dados; SQL como ferramenta essencial |
| **Objetivo** | Compreender a relevância histórica e prática da linguagem SQL |
| **Sintaxe** | — (aula conceitual) |
| **Erros comuns** | Achar que SQL é obsoleto; pensar que é possível fugir do SQL em tarefas de dados |
| **Pré-requisitos** | Nenhum |
| **Relação com o jogo** | Conceitual — contextualiza o jogo |
| **SQLite** | ✅ Compatível |
| **Adaptação** | Nenhuma |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum (não há sintaxe) |

### Módulo 2: Visão Geral — Programação de Banco de Dados (Nível Ninja)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 2 - Agora é Nível Ninja - Programação de Banco de Dados.md` |
| **Título** | Programação de BD — Visão Geral do Nível Avançado |
| **Conceitos** | Otimização via índices; Views; Views Materializadas; Stored Procedures; Functions; Triggers; Auditoria |
| **Objetivo** | Apresentar o escopo dos tópicos avançados do curso |
| **Sintaxe** | — (aula de visão geral) |
| **Erros comuns** | Não organizar scripts por capítulo/pasta |
| **Pré-requisitos** | Scripts 01 e 02 do capítulo anterior; PostgreSQL via Docker |
| **Relação com o jogo** | Conceitual — introduz tópicos avançados que aparecem como conteúdo conceitual |
| **SQLite** | ❌ Incompatível (procedures, functions, triggers com PL/pgSQL) |
| **Adaptação** | Triggers existem em SQLite com sintaxe diferente; SP e functions não são suportados |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

### Módulo 3: Preparando o Banco de Dados (CAP03)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 3 - Preparando o Banco de Dados.md` |
| **Título** | Schema e Ambiente PostgreSQL |
| **Conceitos** | Docker/PostgreSQL; pgAdmin; CREATE SCHEMA; schemas como divisão lógica; DDL |
| **Objetivo** | Criar um schema PostgreSQL para organizar objetos |
| **Sintaxe** | `CREATE SCHEMA cap03 AUTHORIZATION dsa;` |
| **Erros comuns** | Esquecer de ligar o container Docker; usar schema public para tudo |
| **Pré-requisitos** | Docker Desktop; pgAdmin |
| **Relação com o jogo** | Conceitual — o jogo usa SQLite sem schemas |
| **SQLite** | ❌ Incompatível (CREATE SCHEMA não existe) |
| **Adaptação** | Em SQLite, usar o banco diretamente sem schemas ou ATTACH DATABASE |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

### Módulo 4: Preparando o Banco de Dados (CAP04)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aaula 3 - Preparando o Banco de Dados.md` |
| **Título** | Novo Schema e Tabelas (CAP04) |
| **Conceitos** | CREATE SCHEMA; CREATE TABLE; INSERT INTO; SELECT de verificação |
| **Objetivo** | Criar tabelas de funcionários e projetos com dados iniciais |
| **Sintaxe** | `CREATE SCHEMA cap04;`, `CREATE TABLE cap04.funcionarios (...);`, `INSERT INTO ...` |
| **Erros comuns** | Esquecer refresh no pgAdmin; confundir schemas de capítulos diferentes |
| **Pré-requisitos** | Aula 3 (CAP03); pgAdmin |
| **Relação com o jogo** | Conceitual — modelo de dados inspirado nas tabelas do curso |
| **SQLite** | ❌ Incompatível (CREATE SCHEMA) |
| **Adaptação** | Criar tabelas diretamente sem prefixo de schema; adaptar tipos (SERIAL→INTEGER PK, VARCHAR→TEXT) |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

> **Nota:** `Aaula 3` (com dois A) não é duplicata — é a versão CAP04 (novo capítulo), enquanto `Aula 3` é CAP03.

---

## Trilha 2 — DDL: CREATE, ALTER, DROP

### Módulo 5: CREATE TABLE (Parte 1)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 4 - Instruções DDL - CREATE, ALTER, DROP - Parte 1-2.md` |
| **Título** | DDL — CREATE TABLE |
| **Conceitos** | DDL; CREATE TABLE; tipos (SERIAL, VARCHAR, DECIMAL); PRIMARY KEY |
| **Objetivo** | Criar tabelas definindo colunas, tipos e chave primária |
| **Sintaxe** | `CREATE TABLE cap03.funcionarios (id SERIAL PRIMARY KEY, nome VARCHAR(50), ...);` |
| **Erros comuns** | Esquecer tipo de dado; não definir PK; tentar adivinhar sintaxe |
| **Pré-requisitos** | Schema criado (Aula 3) |
| **Relação com o jogo** | Conceitual — o jogo cria o banco em db.js, não pelo jogador |
| **SQLite** | ❌ Incompatível (SERIAL) |
| **Adaptação** | SERIAL→INTEGER PRIMARY KEY; VARCHAR→TEXT; DECIMAL→REAL/NUMERIC |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

### Módulo 6: ALTER TABLE e DROP (Parte 2)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 5 - Instruções DDL - CREATE, ALTER, DROP - Parte 2-2.md` |
| **Título** | DDL — ALTER TABLE e DROP |
| **Conceitos** | ALTER TABLE; DROP TABLE; padrão CREATE/ALTER/DROP; cuidado com DROP em produção |
| **Objetivo** | Modificar e deletar objetos, compreendendo os riscos |
| **Sintaxe** | `ALTER TABLE ... ADD COLUMN ...;`, `DROP TABLE ...;` |
| **Erros comuns** | Criar objeto que já existe; DROP sem backup; não ler mensagens de erro |
| **Pré-requisitos** | Aula 4 (CREATE TABLE) |
| **Relação com o jogo** | Laboratório isolado — DDL é bloqueado no banco principal do jogo |
| **SQLite** | ✅ Compatível (ALTER TABLE e DROP TABLE) |
| **Adaptação** | CREATE PROCEDURE não é suportado em SQLite |
| **Classificação** | Laboratório isolado (DDL) |
| **Testes** | Testar ALTER TABLE ADD COLUMN em cópia descartável |

---

## Trilha 3 — DML: SELECT, INSERT, UPDATE, DELETE

### Módulo 7: INSERT (Parte 1)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 6 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 1-2.md` |
| **Título** | DML — INSERT INTO |
| **Conceitos** | DML vs DDL; INSERT INTO; correspondência colunas/valores; tipos de dados |
| **Objetivo** | Inserir registros respeitando tipos e correspondência |
| **Sintaxe** | `INSERT INTO tabela (col1, col2) VALUES (val1, val2);` |
| **Erros comuns** | Número de valores ≠ colunas; esquecer aspas em texto/data; formato de data incorreto |
| **Pré-requisitos** | Aulas 4-5 (DDL) |
| **Relação com o jogo** | Laboratório isolado — INSERT é bloqueado no banco principal |
| **SQLite** | ✅ Compatível |
| **Adaptação** | Nenhuma |
| **Classificação** | Laboratório isolado (DML) |
| **Testes** | Testar INSERT em cópia descartável |

### Módulo 8: SELECT, UPDATE, DELETE (Parte 2)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 7 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 2-2.md` |
| **Título** | DML — SELECT, UPDATE, DELETE com WHERE |
| **Conceitos** | SELECT *; UPDATE com SET/WHERE; DELETE FROM com WHERE; WHERE como filtro; risco sem WHERE |
| **Objetivo** | Consultar, atualizar e deletar com filtro, compreendendo riscos |
| **Sintaxe** | `SELECT * FROM tabela;`, `UPDATE ... SET ... WHERE ...;`, `DELETE FROM ... WHERE ...;` |
| **Erros comuns** | Esquecer WHERE em UPDATE/DELETE; tentar ID duplicado; confundir constraint com sintaxe |
| **Pré-requisitos** | Aula 6 (INSERT) |
| **Relação com o jogo** | Missão 1 (SELECT), Missão 2 (WHERE) |
| **SQLite** | ✅ Compatível |
| **Adaptação** | Nenhuma |
| **Classificação** | Missão prática (SELECT/WHERE) + Laboratório isolado (UPDATE/DELETE) |
| **Testes** | Testes do validator (missões 1-2) |

---

## Trilha 4 — Funções de Agregação e Agrupamento

### Módulo 9: Agregação e GROUP BY (Parte 1)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 8 - Funções de Agregação e Agrupamento - Parte 1-2.md` |
| **Título** | Funções de Agregação e GROUP BY |
| **Conceitos** | MIN, MAX, AVG, SUM, COUNT; ROUND; GROUP BY; regra: coluna não agregada no GROUP BY |
| **Objetivo** | Usar funções de agregação e GROUP BY para segmentar resultados |
| **Sintaxe** | `SELECT departamento, ROUND(AVG(salario), 2) FROM tabela GROUP BY departamento;` |
| **Erros comuns** | Coluna não agregada fora do GROUP BY; não usar ROUND com AVG; confundir agregação global vs. segmentada |
| **Pré-requisitos** | Aulas 6-7 (DML) |
| **Relação com o jogo** | Missão 6 (GROUP BY + COUNT), Missão 10 (AVG) |
| **SQLite** | ✅ Compatível |
| **Adaptação** | Nenhuma |
| **Classificação** | Missão prática |
| **Testes** | Testes do validator (missões 6, 10) |

### Módulo 10: HAVING, WHERE, ORDER BY, LIKE (Parte 2)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 9 - Funções de Agregação e Agrupamento - Parte 2-2.md` |
| **Título** | HAVING vs WHERE, ORDER BY, LIKE |
| **Conceitos** | HAVING (filtro pós-agregação); WHERE (filtro pré-agregação); ordem de execução; ORDER BY; LIKE com % |
| **Objetivo** | Diferenciar WHERE e HAVING e usar ORDER BY e LIKE |
| **Sintaxe** | `... GROUP BY ... HAVING AVG(salario) > 20000 ORDER BY ...;` |
| **Erros comuns** | Usar agregação no WHERE; não entender ordem de execução; reordenar cláusulas |
| **Pré-requisitos** | Aula 8 (agregação) |
| **Relação com o jogo** | Missão 3 (ORDER BY + LIMIT), Missão 7 (HAVING), Missão 9 (LIKE) |
| **SQLite** | ✅ Compatível |
| **Adaptação** | Nenhuma |
| **Classificação** | Missão prática |
| **Testes** | Testes do validator (missões 3, 7, 9) |

---

## Trilha 5 — Views

### Módulo 11: CREATE VIEW (Parte 1)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 5 - Trabalhando com Views - Parte 1-2.md` |
| **Título** | Views — CREATE VIEW |
| **Conceitos** | Views como query salva; CREATE OR REPLACE VIEW; CTE dentro de view; SELECT a partir de view |
| **Objetivo** | Criar views para padronizar relatórios |
| **Sintaxe** | `CREATE VIEW vw_detalhes AS SELECT ... FROM ...;` |
| **Erros comuns** | Confundir view com tabela física; pensar que view armazena dados |
| **Pré-requisitos** | Aulas 6-9 (DML, agregação) |
| **Relação com o jogo** | Missão 11 do Caso 002 (`vw_relatorio_seguranca`) e Missão 11 do Caso 004 (`vw_auditoria_estoque`) |
| **SQLite** | ⚠️ Parcialmente compatível |
| **Adaptação** | CREATE VIEW é suportado; CREATE OR REPLACE VIEW não é nativo (usar DROP + CREATE) |
| **Classificação** | Missão prática |
| **Testes** | Executor seguro e validação de criação, nome, conteúdo, prévia e nova tentativa em `test_executor.js` e `test_cases.js` |

### Módulo 12: Views com JOIN, COALESCE (Parte 2)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 6 - Trabalhando com Views - Parte 2-2.md` |
| **Título** | Views — JOINs, CTEs, Boas Práticas |
| **Conceitos** | Múltiplas views; LEFT JOIN em view; COALESCE; CTE + SELECT; performance; introdução a MView |
| **Objetivo** | Criar views complexas e entender o problema de performance |
| **Sintaxe** | `CREATE VIEW vw AS WITH cte AS (...) SELECT * FROM cte;` |
| **Erros comuns** | Pensar que CTE + SELECT são duas queries; deixar usuários executarem queries diretas |
| **Pré-requisitos** | Aula 5 Views Parte 1 |
| **Relação com o jogo** | Missões com JOIN nas views dos Casos 002 e 004, além das missões existentes de LEFT JOIN |
| **SQLite** | ✅ Compatível (CREATE VIEW, CTE, LEFT JOIN, COALESCE) |
| **Adaptação** | CREATE OR REPLACE VIEW não é nativo |
| **Classificação** | Conteúdo conceitual + missões práticas de CREATE VIEW e JOIN |
| **Testes** | Testes do validator e regressão dos casos |

---

## Trilha 6 — Views Materializadas

### Módulo 13: CREATE MATERIALIZED VIEW (Parte 1)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 8 - Trabalhando com Views Materializadas - Parte 1-2.md` |
| **Título** | Views Materializadas — CREATE MATERIALIZED VIEW |
| **Conceitos** | MView; diferença View vs MView; EXPLAIN; MView como solução de performance |
| **Objetivo** | Criar MViews que armazenam resultados como tabela física |
| **Sintaxe** | `CREATE MATERIALIZED VIEW mv AS SELECT ...;` |
| **Erros comuns** | Confundir View com MView; esperar auto-atualização |
| **Pré-requisitos** | Aulas 5-6 (Views) |
| **Relação com o jogo** | Conteúdo conceitual — SQLite não suporta MViews |
| **SQLite** | ❌ Incompatível |
| **Adaptação** | Alternativa: CREATE TABLE AS SELECT + refresh manual (DROP + CREATE) |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

### Módulo 14: REFRESH MATERIALIZED VIEW (Parte 2)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 9 - Trabalhando com Views Materializadas - Parte 2-2.md` |
| **Título** | MViews — Refresh e Quando Usar |
| **Conceitos** | Desatualização; REFRESH MATERIALIZED VIEW; automação; View vs MView |
| **Objetivo** | Fazer refresh e escolher entre View e MView |
| **Sintaxe** | `REFRESH MATERIALIZED VIEW mv;` |
| **Erros comuns** | Esquecer refresh; não monitorar falhas; usar MView sem necessidade |
| **Pré-requisitos** | Aula 8 MViews Parte 1 |
| **Relação com o jogo** | Conteúdo conceitual |
| **SQLite** | ❌ Incompatível |
| **Adaptação** | Simular refresh com DROP TABLE + CREATE TABLE AS SELECT |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

---

## Trilha 7 — Junções (JOINs)

### Módulo 15: INNER JOIN (Parte 1)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 10 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 1-5.md` |
| **Título** | JOINs — Introdução ao INNER JOIN |
| **Conceitos** | JOIN de tabelas; FOREIGN KEY; INNER JOIN; alias; cláusula ON; CROSS JOIN (mencionado) |
| **Objetivo** | Aplicar INNER JOIN com ON para retornar registros com correspondência |
| **Sintaxe** | `SELECT e.nome FROM func e INNER JOIN proj p ON e.id = p.func_id;` |
| **Erros comuns** | Esquecer alias; não usar ON; assumir sem consultar regra de negócio |
| **Pré-requisitos** | SELECT, CREATE TABLE, INSERT |
| **Relação com o jogo** | Missão 5 (INNER JOIN), Missão 6 (JOIN + GROUP BY) |
| **SQLite** | ✅ Compatível |
| **Adaptação** | Nenhuma |
| **Classificação** | Missão prática |
| **Testes** | Testes do validator (missões 5, 6) |

### Módulo 16: LEFT JOIN e COALESCE (Parte 2)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 11 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 2-5.md` |
| **Título** | JOINs — LEFT JOIN e COALESCE |
| **Conceitos** | LEFT JOIN; ordem das tabelas; COALESCE para NULL; entender resultado vs. decorar sintaxe |
| **Objetivo** | Aplicar LEFT JOIN e tratar NULL com COALESCE |
| **Sintaxe** | `SELECT e.nome, COALESCE(p.nome, 'Sem projeto') FROM func e LEFT JOIN proj p ON ...;` |
| **Erros comuns** | Decorar sintaxe em vez de entender; entregar NULL sem tratamento; inverter ordem |
| **Pré-requisitos** | INNER JOIN (Aula 10) |
| **Relação com o jogo** | Missão 8 (LEFT JOIN + IS NULL) |
| **SQLite** | ✅ Compatível |
| **Adaptação** | Nenhuma |
| **Classificação** | Missão prática |
| **Testes** | Testes do validator (missão 8) |

### Módulo 17: RIGHT JOIN (Parte 3)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 12 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 3-5.md` |
| **Título** | JOINs — RIGHT JOIN |
| **Conceitos** | RIGHT JOIN; alternativa ao LEFT JOIN com ordem invertida; COALESCE |
| **Objetivo** | Aplicar RIGHT JOIN para retornar todos os registros da direita |
| **Sintaxe** | `SELECT ... FROM func e RIGHT JOIN proj p ON ...;` |
| **Erros comuns** | Confundir esquerda/direita; esquecer COALESCE |
| **Pré-requisitos** | INNER JOIN, LEFT JOIN |
| **Relação com o jogo** | Conteúdo conceitual — SQLite 3.49.1 suporta RIGHT JOIN |
| **SQLite** | ✅ Compatível (SQLite 3.39+) |
| **Adaptação** | Nenhuma — o sql.js atual suporta nativamente |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Verificar versão do SQLite do sql.js |

### Módulo 18: FULL JOIN e CROSS JOIN (Parte 4)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 13 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 4-5.md` |
| **Título** | JOINs — FULL JOIN, CROSS JOIN, SELF JOIN |
| **Conceitos** | FULL JOIN; CROSS JOIN (produto cartesiano); SELF JOIN (mencionado) |
| **Objetivo** | Aplicar FULL JOIN e diferenciar os quatro tipos principais |
| **Sintaxe** | `SELECT ... FROM func e FULL JOIN proj p ON ...;` |
| **Erros comuns** | Confundir FULL com INNER; esquecer COALESCE nas duas colunas |
| **Pré-requisitos** | INNER, LEFT, RIGHT JOIN |
| **Relação com o jogo** | Conteúdo conceitual |
| **SQLite** | ✅ Compatível (SQLite 3.39+) |
| **Adaptação** | Nenhuma — o sql.js atual suporta nativamente |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

### Módulo 19: Exercícios com JOIN, AVG, EXTRACT (Parte 5)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 14 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 5-5.md` |
| **Título** | JOINs — Resolução de Exercícios |
| **Conceitos** | AVG com ROUND; GROUP BY; HAVING vs WHERE; EXTRACT; alias AS; interpretação do enunciado |
| **Objetivo** | Resolver exercícios combinando JOIN, AVG, GROUP BY, WHERE, EXTRACT |
| **Sintaxe** | `SELECT ROUND(AVG(salario), 2) FROM func e INNER JOIN proj p ON ... GROUP BY dept;` |
| **Erros comuns** | Usar HAVING quando filtro não é agregação; escolher JOIN errado; decorar em vez de compreender |
| **Pré-requisitos** | Todos os JOINs, AVG, GROUP BY |
| **Relação com o jogo** | Missão 6 (JOIN + COUNT), Missão 7 (HAVING) |
| **SQLite** | ✅ Compatível (EXTRACT → strftime) |
| **Adaptação** | EXTRACT(DAY FROM data) → strftime('%d', data) |
| **Classificação** | Missão prática |
| **Testes** | Testes do validator (missões 6, 7) |

---

## Trilha 8 — Subconsultas e CTEs

### Módulo 20: CTE com WITH (Parte 1)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 15 - Subconsultas e CTEs (Common Table Expressions) - Parte 1-3.md` |
| **Título** | Subconsultas e CTEs — Introdução a CTE (WITH) |
| **Conceitos** | Múltiplas soluções; CTE com WITH; tabela temporária em memória; performance; filtro interno vs externo |
| **Objetivo** | Criar CTEs com WITH para gerar tabelas temporárias |
| **Sintaxe** | `WITH cte AS (SELECT ... FROM ... WHERE ...) SELECT * FROM cte;` |
| **Erros comuns** | Executar SELECT sem o bloco WITH; esperar CTE como tabela física; assumir que é sempre mais rápido |
| **Pré-requisitos** | SELECT, WHERE, JOINs, agregação |
| **Relação com o jogo** | Missão 10 (subquery), Missão 12 (subquery correlacionada) |
| **SQLite** | ✅ Compatível (SQLite 3.8.3+) |
| **Adaptação** | Nenhuma |
| **Classificação** | Missão prática |
| **Testes** | Testes do validator (missões 10, 12) |

### Módulo 21: Debug de CTE (Parte 2)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 17 - Subconsultas e CTEs (Common Table Expressions) - Parte 2-3.md` |
| **Título** | CTEs — Debug e Colunas da Tabela Temporária |
| **Conceitos** | Debug de erro em CTE; colunas do SELECT interno; mensagens de erro como ferramenta |
| **Objetivo** | Diagnosticar e resolver erros de coluna inexistente em CTEs |
| **Sintaxe** | `WITH cte AS (SELECT nome, salario, data FROM ...) SELECT * FROM cte WHERE ...;` |
| **Erros comuns** | Esquecer coluna no SELECT interno; não ler mensagem de erro; ter medo de erros |
| **Pré-requisitos** | CTE com WITH (Aula 15) |
| **Relação com o jogo** | Conteúdo conceitual — debug de queries |
| **SQLite** | ✅ Compatível (EXTRACT → strftime) |
| **Adaptação** | EXTRACT → strftime |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

### Módulo 22: Subconsulta Aninhada (Parte 3)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 18 - Subconsultas e CTEs (Common Table Expressions) - Parte 3-3.md` |
| **Título** | Subconsultas — SELECT dentro de SELECT |
| **Conceitos** | CTE como subconsulta; subconsulta aninhada; subquery vs GROUP BY; MAX com subquery; múltiplas soluções |
| **Objetivo** | Aplicar subconsultas para resultados específicos eliminando GROUP BY desnecessário |
| **Sintaxe** | `SELECT nome FROM func WHERE salario = (SELECT MAX(salario) FROM func WHERE ...);` |
| **Erros comuns** | Usar GROUP BY quando subquery é mais eficiente; retornar granularidade excessiva |
| **Pré-requisitos** | CTE, funções de agregação, GROUP BY |
| **Relação com o jogo** | Missão 10 (subquery com AVG), Missão 12 (subquery correlacionada) |
| **SQLite** | ✅ Compatível (EXTRACT → strftime) |
| **Adaptação** | EXTRACT → strftime |
| **Classificação** | Missão prática |
| **Testes** | Testes do validator (missões 10, 12) |

---

## Trilha 9 — Stored Procedures e Functions

### Módulo 23: Stored Procedures com PL/pgSQL (Parte 1)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 11 - Trabalhando com Stored Procedures - Parte 1-2.md` |
| **Título** | Stored Procedures — Criação com PL/pgSQL |
| **Conceitos** | SP; PL/pgSQL; CREATE OR REPLACE PROCEDURE; cursor; loop; RAISE NOTICE; DECLARE/BEGIN/END |
| **Objetivo** | Criar SP com cursor, loop e RAISE NOTICE para relatório dinâmico |
| **Sintaxe** | `CREATE OR REPLACE PROCEDURE ... LANGUAGE plpgsql AS $$ ... $$;` |
| **Erros comuns** | Confundir PL/pgSQL com SQL puro; esquecer DECLARE; não entender cursor |
| **Pré-requisitos** | SELECT, INSERT, UPDATE, views |
| **Relação com o jogo** | Conteúdo conceitual — SQLite não suporta SP |
| **SQLite** | ❌ Incompatível |
| **Adaptação** | SQLite não suporta SP nem CALL. Lógica externa via JavaScript. |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

### Módulo 24: Execução de SP com CALL (Parte 2)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 12 - Trabalhando com Stored Procedures - Parte 2-2.md` |
| **Título** | Stored Procedures — Execução com CALL |
| **Conceitos** | CALL; saída como relatório; integração com ETL; flexibilidade de SP |
| **Objetivo** | Executar SP com CALL e integrar resultado |
| **Sintaxe** | `CALL cap04.aumenta_salario();` |
| **Erros comuns** | Usar SELECT em vez de CALL; esquecer parênteses |
| **Pré-requisitos** | Criação de SP (Aula 11 SP) |
| **Relação com o jogo** | Conteúdo conceitual |
| **SQLite** | ❌ Incompatível |
| **Adaptação** | Sem equivalência em SQLite |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

### Módulo 25: SP vs Function

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 15 - Qual a Diferença Entre Stored Procedure e Function.md` |
| **Título** | Diferença entre Stored Procedure e Function |
| **Conceitos** | SP vs Function: propósito, retorno, uso em SELECT, natureza procedural vs funcional |
| **Objetivo** | Diferenciar SP de Function quanto a propósito e uso |
| **Sintaxe** | — (conceitual) |
| **Erros comuns** | Tentar usar SP em SELECT; confundir quando usar cada |
| **Pré-requisitos** | Stored Procedures |
| **Relação com o jogo** | Conteúdo conceitual |
| **SQLite** | ❌ Incompatível |
| **Adaptação** | SQLite não suporta SP nem functions via SQL DDL (apenas UDF via API C) |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

---

## Trilha 10 — Triggers e Funções

### Módulo 26: Function para Validação (Parte 1)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 16 - Trabalhando com Triggers e Funções - Parte 1-2.md` |
| **Título** | Triggers e Funções — Function para Validação |
| **Conceitos** | CREATE FUNCTION; RETURN TRIGGER; IF/END IF; objeto NEW; RAISE EXCEPTION; function precisa de trigger |
| **Objetivo** | Criar function que valida regras de negócio |
| **Sintaxe** | `CREATE OR REPLACE FUNCTION ... RETURNS TRIGGER LANGUAGE plpgsql AS $$ ... $$;` |
| **Erros comuns** | Esperar que function valide sem trigger; confundir NEW com OLD; esquecer RETURN NEW |
| **Pré-requisitos** | Stored Procedures, PL/pgSQL |
| **Relação com o jogo** | Conteúdo conceitual — o jogo não cria triggers |
| **SQLite** | ❌ Incompatível (PL/pgSQL) |
| **Adaptação** | SQLite: `CREATE TRIGGER ... WHEN NEW.col IS NULL BEGIN SELECT RAISE(ABORT, 'msg'); END;` |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

### Módulo 27: Trigger e Validação Prática (Parte 2)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 17 - Trabalhando com Triggers e Funções - Parte 2-2.md` |
| **Título** | Triggers — Criação e Validação |
| **Conceitos** | CREATE TRIGGER; BEFORE vs AFTER; FOR EACH ROW; trigger + function; impacto de performance |
| **Objetivo** | Criar trigger BEFORE INSERT que impede registros inválidos |
| **Sintaxe** | `CREATE TRIGGER ... BEFORE INSERT ON ... FOR EACH ROW EXECUTE FUNCTION ...;` |
| **Erros comuns** | Usar AFTER quando precisa validar antes; deixar trigger ativa permanentemente; esquecer FOR EACH ROW |
| **Pré-requisitos** | Function (Aula 16 Triggers) |
| **Relação com o jogo** | Conteúdo conceitual |
| **SQLite** | ❌ Incompatível (EXECUTE FUNCTION) |
| **Adaptação** | SQLite: `CREATE TRIGGER ... BEFORE INSERT ON ... FOR EACH ROW WHEN ... BEGIN SELECT RAISE(ABORT, 'msg'); END;` |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

### Módulo 28: Auditoria com Triggers

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 18 - Habilitando Auditoria no Banco de Dados.md` |
| **Título** | Auditoria no Banco de Dados |
| **Conceitos** | Auditoria; tabela de histórico; OLD vs NEW; BEFORE UPDATE; DEFAULT CURRENT_TIMESTAMP; INSERT em function; comparação OLD != NEW |
| **Objetivo** | Implementar auditoria de alterações com trigger + function |
| **Sintaxe** | `CREATE TRIGGER ... BEFORE UPDATE ON ... FOR EACH ROW EXECUTE FUNCTION ...;` |
| **Erros comuns** | Auditar sem comparar OLD vs NEW; deixar auditoria ativa permanentemente; esquecer DEFAULT timestamp |
| **Pré-requisitos** | Triggers e Functions |
| **Relação com o jogo** | Conteúdo conceitual — o jogo tem logs_acesso como tabela, não auditoria via trigger |
| **SQLite** | ❌ Incompatível (PL/pgSQL) |
| **Adaptação** | SQLite: trigger com WHEN OLD.salario != NEW.salario BEGIN INSERT INTO log ... END; |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

---

## Trilha 11 — Transações

### Módulo 29: COMMIT e ROLLBACK

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 19 - Controle de Transações - COMMIT, ROLLBACK.md` |
| **Título** | Controle de Transações — COMMIT e ROLLBACK |
| **Conceitos** | Transação atômica; BEGIN; COMMIT; ROLLBACK; consistência; transferência bancária; ETL |
| **Objetivo** | Usar BEGIN, COMMIT e ROLLBACK para atomicidade |
| **Sintaxe** | `BEGIN; INSERT ...; INSERT ...; COMMIT;` / `... ROLLBACK;` |
| **Erros comuns** | Esquecer COMMIT; não usar ROLLBACK em falha; separar operações dependentes |
| **Pré-requisitos** | INSERT, UPDATE |
| **Relação com o jogo** | Laboratório isolado — o jogo bloqueia BEGIN/COMMIT/ROLLBACK no banco principal |
| **SQLite** | ✅ Compatível |
| **Adaptação** | Nenhuma |
| **Classificação** | Laboratório isolado (transações) |
| **Testes** | Testar BEGIN/ROLLBACK em cópia descartável |

---

## Trilha 12 — Indexação e Otimização

### Módulo 30: EXPLAIN, CREATE INDEX, DROP INDEX

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 20 - Indexação e Otimização de Consultas.md` |
| **Título** | Indexação e Otimização de Consultas |
| **Conceitos** | EXPLAIN; custo computacional; CREATE INDEX; DROP INDEX; índices em WHERE/PK; trade-off leitura/escrita; manutenção |
| **Objetivo** | Analisar planos de execução e criar/remover índices |
| **Sintaxe** | `EXPLAIN SELECT ...;`, `CREATE INDEX idx ON tabela(col);`, `DROP INDEX idx;` |
| **Erros comuns** | Criar índices sem critério; deixar índices em carga ETL; não fazer manutenção; assumir que mais = melhor |
| **Pré-requisitos** | SELECT, JOIN, WHERE, CTE |
| **Relação com o jogo** | Conteúdo conceitual — o jogo não expõe EXPLAIN/CREATE INDEX ao jogador |
| **SQLite** | ✅ Compatível |
| **Adaptação** | EXPLAIN QUERY PLAN é o equivalente mais próximo em SQLite |
| **Classificação** | Conteúdo conceitual |
| **Testes** | Nenhum |

---

## Trilha 13 — Labs GCP/Terraform/BigQuery

> As 23 aulas de Lab cobrem infraestrutura GCP, Terraform, Docker e BigQuery.
> Apenas a **Aula 24** ensina SQL prático aplicável ao jogo.
> As demais são classificadas como conteúdo conceitual ou sem relação direta.

### Módulo 31: Visão Geral do Lab 1

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 3 - Lab 1 - Visão Geral.md` |
| **Título** | Lab 1 — Visão Geral |
| **Conceitos** | DW na nuvem; Modern Data Stack; IaC; GCP |
| **Objetivo** | Apresentar o objetivo do Lab 1 |
| **Relação com o jogo** | Conceitual — contextualiza SQL em DW real |
| **SQLite** | ❌ (infraestrutura) |
| **Classificação** | Conteúdo conceitual |

### Módulo 32: IaC com Terraform

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 4 - Lab 1 - Infraestrutura Como Código (IaC) com Terraform.md` |
| **Título** | Lab 1 — IaC com Terraform |
| **Conceitos** | IaC; Terraform/HCL; provisionamento; Docker; multi-cloud |
| **Relação com o jogo** | Sem relação direta |
| **SQLite** | ❌ |
| **Classificação** | Conteúdo conceitual |

### Módulos 33-39: Setup GCP, Docker, BigQuery Console, Terraform Script

| Arquivos | Título | Relação | Classificação |
|---|---|---|---|
| `Aula 6 - Lab 1 - Consultas SQL no BigQuery Cloud Data Warehouse.md` | BigQuery como DW | Conceitual | Conteúdo conceitual |
| `Aula 7 - Lab 1 - Preparando a Máquina Cliente com Terraform e GCloud - Parte 1_3.md` | Docker + Terraform + GCloud | Sem relação | Conteúdo conceitual |
| `Aula 8 - Lab 1 - Preparando a Máquina Cliente com Terraform e GCloud - Parte 2_3.md` | Anatomia do Dockerfile | Sem relação | Conteúdo conceitual |
| `Aula 9 - Lab 1 - Preparando a Máquina Cliente com Terraform e GCloud - Parte 3_3.md` | Build e Run do Container | Sem relação | Conteúdo conceitual |
| `Aula 10 - Lab 1 - Para Automatizar a Infraestrutura é Preciso Conhecê-la - Compreendendo o Big Query - Parte 1_2.md` | Projetos GCP e Console | Conceitual | Conteúdo conceitual |
| `Aula 11 - Lab 1 - Para Automatizar a Infraestrutura é Preciso Conhecê-la - Compreendendo o Big Query - Parte 2_2.md` | Datasets, Tabelas, Modelagem | Conceitual | Conteúdo conceitual |
| `Aula 12.md` | Script Terraform: Provider | Sem relação | Conteúdo conceitual |

### Módulos 40-46: Terraform Resources, Carga de Dados, Storage

| Arquivos | Título | Relação | Classificação |
|---|---|---|---|
| `aula 13.md` | Terraform: Resource Dataset | Sem relação | Conteúdo conceitual |
| `aula 14.md` | Terraform: Tabelas e Schema | Conceitual (tipos de dados) | Conteúdo conceitual |
| `Aula 15.md` | Terraform: Demais Tabelas | Conceitual (modelagem) | Conteúdo conceitual |
| `Aula 16.md` | Terraform: Carga com BigQuery Job | Sem relação | Conteúdo conceitual |
| `Aula 17.md` | Terraform: Random ID, Storage, CSV | Sem relação | Conteúdo conceitual |
| `Aula 18.md` | Terraform: Conclusão do Script | Sem relação | Conteúdo conceitual |
| `Aula 19 - Lab 1 - ...Fonte de Dados...Parte 1_2.md` | Google Storage Bucket | Sem relação | Conteúdo conceitual |

### Módulos 47-48: Execução e Verificação

| Arquivos | Título | Relação | Classificação |
|---|---|---|---|
| `Aula 19 - Lab 1 - Preparando a Fonte de Dados - Parte 1_2.md` | Google Storage Bucket | Sem relação | Conteúdo conceitual |
| `Aula 20 - Lab 1 - Preparando a Fonte de Dados - Parte 2_2.md` | Upload de CSVs | Sem relação | Conteúdo conceitual |
| `Aula 21 - Lab 1 - Executando a Automação da Infraestrutura do DW - Parte 1_3.md` | terraform init e apply | Sem relação | Conteúdo conceitual |
| `Aula 22 - Lab 1 - Executando a Automação da Infraestrutura do DW - Parte 2_3.md` | Autenticação GCP e Apply | Sem relação | Conteúdo conceitual |
| `Aula 23 - Lab 1 - Executando a Automação da Infraestrutura do DW - Parte 3_3.md` | Verificação do DW e SELECT * | Lab isolado (SELECT *) | Laboratório isolado |

### Módulo 49: Criação de Relatórios com SQL (DESTAQUE)

| Campo | Valor |
|---|---|
| **Arquivo** | `Aula 24 - Lab 1 - Criação de Relatórios do DW com Linguagem SQL.md` |
| **Título** | Lab 1 — Criação de Relatórios com SQL |
| **Conceitos** | SELECT multi-colunas; JOIN; SUM com ROUND; GROUP BY; WHERE; múltiplos JOINs (3 tabelas); HAVING; ORDER BY; aliases; filtro de datas; WHERE vs HAVING |
| **Objetivo** | Praticar SQL criando 3 consultas no BigQuery: simples, intermediária e avançada |
| **Sintaxe** | `SELECT nome, ROUND(SUM(valor), 2) FROM t1 JOIN t2 ON ... GROUP BY nome HAVING ... ORDER BY ...;` |
| **Erros comuns** | Colocar filtro de agregação no WHERE em vez de HAVING; esquecer colunas não agregadas no GROUP BY |
| **Pré-requisitos** | SELECT/FROM/WHERE básico |
| **Relação com o jogo** | Missões 5-7, 9, 12 (JOIN, GROUP BY, HAVING, ORDER BY) |
| **SQLite** | ✅ Compatível |
| **Adaptação** | Caminho completo da tabela (projeto.dataset.tabela) → nome_tabela |
| **Classificação** | Missão prática |
| **Testes** | Testes do validator (missões 5-7, 9, 12) |

### Módulos 50-53: Destruir e Conclusão

| Arquivos | Título | Relação | Classificação |
|---|---|---|---|
| `Aula 25 - Lab 1 - Destruindo a Infraestrutura.md` | terraform destroy | Lab isolado (SELECT *) | Conteúdo conceitual |
| `Aula 26 - Lab 1 - Conclusão.md` | Conclusão e Encerramento | Conceitual | Conteúdo conceitual |

---

## Resumo de Classificação

| Classificação | Módulos | Missões relacionadas |
|---|---|---|
| **Missão prática** | 8, 9, 10, 15, 16, 19, 20, 22, 49 | 1-12 |
| **Laboratório isolado** | 6, 7, 29, 47 | — |
| **Conteúdo conceitual** | 1-5, 11-14, 17-18, 21, 23-28, 30, 31-46, 48, 50-53 | — |

## Compatibilidade SQLite

| Status | Módulos |
|---|---|
| ✅ Compatível | 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 29, 30, 49 |
| ⚠️ Parcial | 11 (CREATE OR REPLACE VIEW) |
| ❌ Incompatível | 2, 3, 4, 5, 13, 14, 23-28 |
| ❌ Infraestrutura | 31-46, 50-53 |

## Cobertura de Temas do Curso

| Tema | Presente? | Módulos |
|---|---|---|
| Preparação do banco | ✅ | 3, 4, 5 |
| DDL: CREATE, ALTER, DROP | ✅ | 5, 6 |
| DML: SELECT, INSERT, UPDATE, DELETE | ✅ | 7, 8 |
| Views | ✅ | 11, 12 |
| Views materializadas | ✅ | 13, 14 |
| Funções de agregação e GROUP BY | ✅ | 9, 10 |
| INNER, LEFT, RIGHT, FULL, CROSS, SELF JOIN | ✅ | 15-19 |
| Subconsultas e CTEs | ✅ | 20-22 |
| Stored procedures | ✅ | 23, 24 |
| Functions | ✅ | 25, 26 |
| Triggers | ✅ | 26, 27, 28 |
| Auditoria | ✅ | 28 |
| COMMIT e ROLLBACK | ✅ | 29 |
| Índices e otimização | ✅ | 30 |
| CASE WHEN | ❌ | — (não ensinado explicitamente nas transcrições; implementado como missão 11 no jogo) |
