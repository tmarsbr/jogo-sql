/**
 * db.js — Criação, seed e execução do SQLite via sql.js.
 *
 * Fase 2: schema completo + seed determinístico.
 * Os dados seguem o SPOILER.md como fonte canônica.
 */

import { state } from './state.js';
import { setDbStatus } from './ui.js';
import { SCHEMA_SQL as CASE002_SCHEMA_SQL, SEED_SQL as CASE002_SEED_SQL } from './cases/case002/db-seed.js';
import { SCHEMA_SQL as CASE003_SCHEMA_SQL, SEED_SQL as CASE003_SEED_SQL } from './cases/case003/db-seed.js';
import { SCHEMA_SQL as CASE004_SCHEMA_SQL, SEED_SQL as CASE004_SEED_SQL } from './cases/case004/db-seed.js';
import { SCHEMA_SQL as PROJ_ECOMMERCE_SCHEMA_SQL, SEED_SQL as PROJ_ECOMMERCE_SEED_SQL } from './cases/proj-ecommerce/db-seed.js';
import { SCHEMA_SQL as PROJ_CLIENTES_SCHEMA_SQL, SEED_SQL as PROJ_CLIENTES_SEED_SQL } from './cases/proj-clientes/db-seed.js';
import { SCHEMA_SQL as PROJ_VENDAS_SCHEMA_SQL, SEED_SQL as PROJ_VENDAS_SEED_SQL } from './cases/proj-vendas/db-seed.js';
import { SCHEMA_SQL as PROJ_MARKETING_SCHEMA_SQL, SEED_SQL as PROJ_MARKETING_SEED_SQL } from './cases/proj-marketing/db-seed.js';
import { SCHEMA_SQL as PROJ_LOGISTICA_SCHEMA_SQL, SEED_SQL as PROJ_LOGISTICA_SEED_SQL } from './cases/proj-logistica/db-seed.js';
import { SCHEMA_SQL as PROJ_ESTOQUE_SCHEMA_SQL, SEED_SQL as PROJ_ESTOQUE_SEED_SQL } from './cases/proj-estoque/db-seed.js';
import { SCHEMA_SQL as PROJ_EDUCACAO_SCHEMA_SQL, SEED_SQL as PROJ_EDUCACAO_SEED_SQL } from './cases/proj-educacao/db-seed.js';
import { SCHEMA_SQL as PROJ_SAUDE_SCHEMA_SQL, SEED_SQL as PROJ_SAUDE_SEED_SQL } from './cases/proj-saude/db-seed.js';
import { SCHEMA_SQL as PROJ_FINANCEIRO_SCHEMA_SQL, SEED_SQL as PROJ_FINANCEIRO_SEED_SQL } from './cases/proj-financeiro/db-seed.js';
import { SCHEMA_SQL as PROJ_SUPORTE_SCHEMA_SQL, SEED_SQL as PROJ_SUPORTE_SEED_SQL } from './cases/proj-suporte/db-seed.js';
import { SCHEMA_SQL as PROJ_PUBLICO_SCHEMA_SQL, SEED_SQL as PROJ_PUBLICO_SEED_SQL } from './cases/proj-publico/db-seed.js';
import { SCHEMA_SQL as PROJ_FUTEBOL_SCHEMA_SQL, SEED_SQL as PROJ_FUTEBOL_SEED_SQL } from './cases/proj-futebol/db-seed.js';
import { SCHEMA_SQL as CASE005_SCHEMA_SQL, SEED_SQL as CASE005_SEED_SQL } from './cases/case005/db-seed.js';
import { SCHEMA_SQL as CASE006_SCHEMA_SQL, SEED_SQL as CASE006_SEED_SQL } from './cases/case006/db-seed.js';
import { SCHEMA_SQL as CLIENT_REAL_SCHEMA_SQL, SEED_SQL as CLIENT_REAL_SEED_SQL } from './cases/client-real/db-seed.js';

/* --- Caminho do wasm --- */
const WASM_PATH = 'vendor/sql-wasm.wasm';

/* --- Schema SQL --- */
export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE departamentos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  andar INTEGER
);

CREATE TABLE funcionarios (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  departamento_id INTEGER NOT NULL REFERENCES departamentos(id),
  salario_centavos INTEGER NOT NULL,
  data_admissao TEXT NOT NULL
);

CREATE TABLE contas (
  id INTEGER PRIMARY KEY,
  numero_conta TEXT NOT NULL UNIQUE,
  funcionario_id INTEGER REFERENCES funcionarios(id),
  titular_externo TEXT,
  banco TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('corrente', 'poupanca', 'investimento')),
  CHECK (
    (funcionario_id IS NOT NULL AND titular_externo IS NULL)
    OR
    (funcionario_id IS NULL AND titular_externo IS NOT NULL AND length(trim(titular_externo)) > 0)
  )
);

CREATE TABLE transacoes (
  id INTEGER PRIMARY KEY,
  conta_origem_id INTEGER NOT NULL REFERENCES contas(id),
  conta_destino_id INTEGER NOT NULL REFERENCES contas(id),
  valor_centavos INTEGER NOT NULL CHECK(valor_centavos > 0),
  data_hora TEXT NOT NULL,
  descricao TEXT,
  operador_funcionario_id INTEGER REFERENCES funcionarios(id)
);

CREATE TABLE logs_acesso (
  id INTEGER PRIMARY KEY,
  funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
  data_hora TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('entrada', 'saida')),
  local TEXT NOT NULL
);

CREATE TABLE emails (
  id INTEGER PRIMARY KEY,
  remetente_id INTEGER NOT NULL REFERENCES funcionarios(id),
  destinatario_id INTEGER NOT NULL REFERENCES funcionarios(id),
  assunto TEXT NOT NULL,
  data_hora TEXT NOT NULL,
  conteudo TEXT NOT NULL
);
`;

/* --- Seed SQL determinístico ---
 * Segue o SPOILER.md como fonte canônica.
 * Culpada: Camila Torres (ID=7), dept Financeiro, conta interna 107, conta externa 999.
 * Transações 501-504: operador=7, >5000000 centavos, da conta 107 para 999.
 * Logs 701-703: funcionária 7, depois das 22h.
 * E-mails 801-802: Camila como remetente, palavras-chave.
 * Suspeitos falsos: Bruno Alves (ID=4, acesso noturno legítimo),
 *                   Daniela Rocha (ID=9, e-mail com palavra-chave).
 */
export const SEED_SQL = `
-- Departamentos (1-5)
INSERT INTO departamentos VALUES
  (1, 'Financeiro',    3),
  (2, 'TI',            2),
  (3, 'Recursos Humanos', 1),
  (4, 'Operacoes',     4),
  (5, 'Comercial',     5);

-- Funcionários (1-10)
-- 7 = Camila Torres (culpada)
-- 4 = Bruno Alves (suspeito falso: acesso noturno legítimo)
-- 9 = Daniela Rocha (suspeito falso: e-mail com palavra-chave)
INSERT INTO funcionarios VALUES
  (1, 'Ana Souza',      'Analista Financeiro',    1, 5500000,  '2021-03-15'),
  (2, 'Bruno Oliveira', 'Analista de TI',         2, 6200000,  '2020-07-01'),
  (3, 'Carla Mendes',   'Gerente de RH',          3, 8500000,  '2019-01-10'),
  (4, 'Bruno Alves',    'Analista de Operacoes',  4, 4800000,  '2022-06-01'),
  (5, 'Diego Ferreira', 'Analista Financeiro',    1, 5800000,  '2021-09-20'),
  (6, 'Eduarda Lima',   'Coordenadora de TI',     2, 9200000,  '2018-04-05'),
  (7, 'Camila Torres',  'Coordenadora de Tesouraria', 1, 10500000, '2017-11-15'),
  (8, 'Fernando Dias',  'Analista de Operacoes',  4, 5100000,  '2021-02-28'),
  (9, 'Daniela Rocha',  'Analista Financeiro',    1, 5300000,  '2022-01-15'),
  (10,'Gustavo Barbosa','Vendedor',              5, 4500000,  '2023-03-01');

-- Contas (100-999)
-- 107 = conta interna da Camila (funcionária 7)
-- 999 = conta externa (Nexus Consultoria)
-- Outras contas internas de funcionários e contas externas normais
INSERT INTO contas VALUES
  (100, 'CC-1001', 1,  NULL,                          'Banco Alpha', 'corrente'),
  (101, 'CC-1002', 2,  NULL,                          'Banco Alpha', 'corrente'),
  (102, 'CC-1003', 3,  NULL,                          'Banco Beta',  'corrente'),
  (103, 'CC-1004', 4,  NULL,                          'Banco Alpha', 'corrente'),
  (104, 'CC-1005', 5,  NULL,                          'Banco Beta',  'corrente'),
  (105, 'CC-1006', 6,  NULL,                          'Banco Alpha', 'poupanca'),
  (106, 'CC-1007', 8,  NULL,                          'Banco Beta',  'corrente'),
  (107, 'CC-1008', 7,  NULL,                          'Banco Alpha', 'corrente'),
  (108, 'CC-1009', 9,  NULL,                          'Banco Alpha', 'corrente'),
  (109, 'CC-1010', 10, NULL,                          'Banco Beta',  'corrente'),
  -- Conta externa usada no desvio
  (999, 'CC-9999', NULL, 'Nexus Consultoria Ltda',     'Banco Gamma', 'investimento'),
  -- Outras contas externas (supridores legítimos)
  (200, 'CC-2001', NULL, 'TechSupply Solutions',       'Banco Delta', 'corrente'),
  (201, 'CC-2002', NULL, 'LogExpress Transportes',    'Banco Delta', 'corrente');

-- Transações
-- 501-504: transações suspeitas da Camila (operador=7, conta 107 -> 999, >R$50.000)
-- Outras transações para enriquecer a investigação
INSERT INTO transacoes VALUES
  -- Transações suspeitas (seguem SPOILER.md)
  (501, 107, 999, 7500000, '2024-03-12 23:15:00', 'Pagamento urgente fornecedor Nexus', 7),
  (502, 107, 999, 6200000, '2024-03-15 22:45:00', 'Adiantamento contrato consultoria', 7),
  (503, 107, 999, 5800000, '2024-03-18 23:30:00', 'Transferencia investimento Nexus', 7),
  (504, 107, 999, 6500000, '2024-03-22 01:10:00', 'Pagamento servicos especializados', 7),
  -- Transações normais da empresa (para ter volume e contraste)
  (301, 100, 200, 350000,  '2024-02-05 14:00:00', 'Pagamento TechSupply',    5),
  (302, 100, 201, 280000,  '2024-02-10 11:00:00', 'Frete LogExpress',        5),
  (303, 101, 200, 420000,  '2024-02-15 15:30:00', 'Compra equipamentos TI',  2),
  (304, 104, 200, 190000, '2024-02-20 09:00:00', 'Materiais operacionais',  8),
  (305, 108, 201, 310000, '2024-02-25 13:00:00', 'Servicos logisticos',     8),
  (306, 100, 200, 530000, '2024-03-01 10:00:00', 'Insumos TechSupply',      1),
  (307, 105, 200, 890000, '2024-03-03 16:00:00', 'Upgrade infraestrutura',  6),
  (308, 107, 200, 450000, '2024-03-05 14:30:00', 'Pagamento fornecedor',    7),
  (309, 109, 200, 220000, '2024-03-08 11:30:00', 'Compra suprimentos',      9),
  (310, 100, 201, 380000, '2024-03-10 10:30:00', 'Despesa logistica',       1),
  -- Transação do Bruno Alves (suspeito falso: tem acesso noturno mas não opera transações grandes)
  (311, 103, 200, 150000, '2024-03-14 08:00:00', 'Material escritorio',     4),
  -- Mais transações para GROUP BY / HAVING
  (312, 107, 200, 300000, '2024-03-25 15:00:00', 'Pagamento regular',      7),
  (313, 107, 999, 5200000, '2024-03-27 22:20:00', 'Pagamento ponte Nexus',   7),
  -- Transações da Daniela Rocha (suspeito falso: aparece em e-mail mas poucas transações)
  (314, 109, 200, 270000, '2024-03-29 09:00:00', 'Insumos',                 9),
  (315, 109, 201, 340000, '2024-04-01 14:00:00', 'Frete',                   9),
  -- Transação sem operador (para testar NULL)
  (316, 102, 200, 410000, '2024-04-02 12:00:00', 'Servicos',               NULL);

-- Logs de acesso
-- 701-703: acessos suspeitos da Camila (depois das 22h)
-- 710: acesso noturno legítimo do Bruno Alves (suspeito falso)
INSERT INTO logs_acesso VALUES
  (701, 7, '2024-03-12 22:30:00', 'entrada', 'Servidor Financeiro'),
  (702, 7, '2024-03-15 22:10:00', 'entrada', 'Tesouraria'),
  (703, 7, '2024-03-18 23:00:00', 'entrada', 'Servidor Financeiro'),
  -- Acesso noturno legítimo do Bruno Alves (suspeito falso)
  (710, 4, '2024-03-14 22:45:00', 'entrada', 'Servidor Operacoes'),
  -- Acessos normais (diurnos)
  (711, 1, '2024-03-10 08:00:00', 'entrada', 'Andar Financeiro'),
  (712, 5, '2024-03-10 08:15:00', 'entrada', 'Andar Financeiro'),
  (713, 7, '2024-03-10 08:30:00', 'entrada', 'Tesouraria'),
  (714, 9, '2024-03-10 08:45:00', 'entrada', 'Andar Financeiro'),
  (715, 2, '2024-03-10 09:00:00', 'entrada', 'Andar TI'),
  (716, 6, '2024-03-10 09:10:00', 'entrada', 'Andar TI'),
  (717, 8, '2024-03-10 09:20:00', 'entrada', 'Andar Operacoes'),
  (718, 3, '2024-03-10 09:30:00', 'entrada', 'Andar RH'),
  (719, 10, '2024-03-10 09:45:00', 'entrada', 'Andar Comercial'),
  (720, 1, '2024-03-10 18:00:00', 'saida',   'Andar Financeiro'),
  (721, 7, '2024-03-12 23:45:00', 'saida',   'Servidor Financeiro'),
  (722, 7, '2024-03-15 23:10:00', 'saida',   'Tesouraria');

-- E-mails
-- 801-802: e-mails suspeitos da Camila (palavras-chave: fornecedor, urgente, ponte, não registrar)
-- Outros e-mails: irrelevantes e de outros funcionários
INSERT INTO emails VALUES
  (801, 7, 5, 'Re: Pagamento urgente fornecedor',         '2024-03-11 21:00:00',
   'Preciso que o pagamento da Nexus seja processado amanha. E urgente, nao registrar como desvio.'),
  (802, 7, 1, 'Assunto: Transferencia ponte',              '2024-03-14 20:30:00',
   'A transferencia ponte para a conta externa precisa sair hoje. Favor nao comentar na reuniao.'),
  -- E-mail suspeito da Daniela Rocha (suspeito falso: palavra-chave mas sem contexto)
  (803, 9, 5, 'Duvida sobre fornecedor',                  '2024-03-05 10:00:00',
   'Oi Diego, voce sabe qual e o fornecedor do cafe da empresa? Preciso pedir mais.'),
  -- E-mails irrelevantes
  (804, 2, 6, 'Problema na rede',                          '2024-03-08 14:00:00',
   'A rede esta lenta hoje. Pode verificar o servidor?'),
  (805, 3, 1, 'Reuniao de RH',                             '2024-03-01 09:00:00',
   'Lembrando que teremos reuniao de RH amanha as 10h.'),
  (806, 8, 4, 'Material de escritorio',                    '2024-03-20 11:00:00',
   'Preciso de mais material de escritorio para a area de operacoes.'),
  (807, 10, 1, 'Meta de vendas',                           '2024-03-15 16:00:00',
   'Bateu a meta de vendas deste mes! Parabens a todos.'),
  (808, 5, 7, 'Confirmacao pagamento TechSupply',          '2024-03-06 10:30:00',
   'O pagamento da TechSupply foi confirmado. Valor dentro do esperado.'),
  (809, 6, 2, 'Manutencao servidor',                      '2024-03-02 15:00:00',
   'O servidor passara por manutencao neste fim de semana.');
`;

/* --- Instância do banco --- */
let db = null;
let dbCaseId = null;

function getCaseDatabaseDefinition(caseId) {
  const definitions = {
    case001: { schema: SCHEMA_SQL, seed: SEED_SQL },
    case002: { schema: CASE002_SCHEMA_SQL, seed: CASE002_SEED_SQL },
    case003: { schema: CASE003_SCHEMA_SQL, seed: CASE003_SEED_SQL },
    case004: { schema: CASE004_SCHEMA_SQL, seed: CASE004_SEED_SQL },
    'proj-ecommerce': { schema: PROJ_ECOMMERCE_SCHEMA_SQL, seed: PROJ_ECOMMERCE_SEED_SQL },
    'proj-clientes': { schema: PROJ_CLIENTES_SCHEMA_SQL, seed: PROJ_CLIENTES_SEED_SQL },
    'proj-vendas': { schema: PROJ_VENDAS_SCHEMA_SQL, seed: PROJ_VENDAS_SEED_SQL },
    'proj-marketing': { schema: PROJ_MARKETING_SCHEMA_SQL, seed: PROJ_MARKETING_SEED_SQL },
    'proj-logistica': { schema: PROJ_LOGISTICA_SCHEMA_SQL, seed: PROJ_LOGISTICA_SEED_SQL },
    'proj-estoque': { schema: PROJ_ESTOQUE_SCHEMA_SQL, seed: PROJ_ESTOQUE_SEED_SQL },
    'proj-educacao': { schema: PROJ_EDUCACAO_SCHEMA_SQL, seed: PROJ_EDUCACAO_SEED_SQL },
    'proj-saude': { schema: PROJ_SAUDE_SCHEMA_SQL, seed: PROJ_SAUDE_SEED_SQL },
    'proj-financeiro': { schema: PROJ_FINANCEIRO_SCHEMA_SQL, seed: PROJ_FINANCEIRO_SEED_SQL },
    'proj-suporte': { schema: PROJ_SUPORTE_SCHEMA_SQL, seed: PROJ_SUPORTE_SEED_SQL },
    'proj-publico': { schema: PROJ_PUBLICO_SCHEMA_SQL, seed: PROJ_PUBLICO_SEED_SQL },
    'proj-futebol': { schema: PROJ_FUTEBOL_SCHEMA_SQL, seed: PROJ_FUTEBOL_SEED_SQL },
    case005: { schema: CASE005_SCHEMA_SQL, seed: CASE005_SEED_SQL },
    case006: { schema: CASE006_SCHEMA_SQL, seed: CASE006_SEED_SQL },
    // O modo Bug Hunter reutiliza o banco do Caso #001 (TechFin) para os desafios de debug.
    'bug-hunter': { schema: SCHEMA_SQL, seed: SEED_SQL },
    // O modo Construtor de Schema começa com o banco vazio — o jogador constrói tudo.
    'client-real': { schema: CLIENT_REAL_SCHEMA_SQL, seed: CLIENT_REAL_SEED_SQL },
    'schema-builder': { schema: '', seed: '' },
  };
  return definitions[caseId] || definitions.case001;
}

/**
 * Carrega o sql.js e cria/inicializa o banco em memória.
 * @returns {Promise<Database>} instância do SQLite
 */
export async function initDB(caseId = state.currentCase || 'case001', { force = false } = {}) {
  if (db && dbCaseId === caseId && !force) {
    state.dbReady = true;
    return db;
  }

  if (db) {
    db.close();
    db = null;
    dbCaseId = null;
  }

  try {
    setDbStatus('pending', 'Banco: carregando…');

    // Carrega sql.js via script não-módulo (compatibilidade)
    await loadScript('vendor/sql-wasm.js');

    // Configura o caminho do wasm
    window.SQL = await initSqlJs({
      locateFile: () => WASM_PATH,
    });

    // Cria banco em memória
    db = new SQL.Database();

    // Ativa foreign keys
    db.run('PRAGMA foreign_keys = ON;');

    const definition = getCaseDatabaseDefinition(caseId);

    // Executa schema do caso ativo (casos como o Construtor de Schema começam vazios)
    if (definition.schema && String(definition.schema).trim().length > 0) {
      db.run(definition.schema);
    }

    // Executa dados determinísticos do caso ativo
    if (definition.seed && String(definition.seed).trim().length > 0) {
      db.run(definition.seed);
    }

    state.dbReady = true;
    dbCaseId = caseId;
    setDbStatus('ok', 'Banco: pronto');
    return db;
  } catch (err) {
    console.error('Erro ao inicializar banco:', err);
    state.dbReady = false;
    setDbStatus('error', 'Banco: erro');
    throw err;
  }
}

/**
 * Carrega um script não-módulo dinamicamente.
 * Necessário porque sql.js é um UMD, não um ES module.
 * @param {string} src
 * @returns {Promise<void>}
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Se já foi carregado, não recarrega
    if (window.SQL) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Executa uma query SQL de leitura e retorna colunas e linhas.
 * @param {string} sql
 * @returns {{columns: string[], rows: any[][]}}
 */
export function execQuery(sql) {
  if (!db) throw new Error('Banco não inicializado.');
  const result = db.exec(sql);
  if (result.length === 0) {
    return { columns: [], rows: [] };
  }
  return {
    columns: result[0].columns,
    rows: result[0].values,
  };
}

/**
 * Retorna o esquema das tabelas em formato legível.
 * @returns {string}
 */
export function getSchemaText() {
  const tables = db.exec(`
    SELECT name, sql, type
    FROM sqlite_master
    WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
    ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name;
  `);
  if (tables.length === 0) return 'Nenhuma tabela ou view encontrada.';
  let out = '';
  for (const t of tables[0].values) {
    const name = t[0];
    const sql = t[1];
    const type = t[2];
    out += `${type === 'view' ? `-- VIEW ${name}\n` : ''}${sql}\n\n`;
  }
  return out.trim();
}

/**
 * Retorna a instância do banco (para uso interno).
 * @returns {Database|null}
 */
export function getDB() {
  return db;
}

/** Identificador do caso atualmente carregado no SQLite. */
export function getActiveDatabaseCase() {
  return dbCaseId;
}

/**
 * Retorna o esquema detalhado das tabelas: nome, colunas, tipos, PK, FK.
 * Usado pelo modo Sandbox (botão Mostrar esquema).
 * @returns {{tableName: string, objectType: 'table'|'view', columns: {name: string, type: string, pk: boolean, fk: string|null}[]}[]}
 */
export function getSchemaDetailed() {
  if (!db) return [];

  const tablesResult = db.exec(`
    SELECT name, type FROM sqlite_master
    WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
    ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name;
  `);

  if (tablesResult.length === 0) return [];

  const schema = [];
  for (const [tableName, objectType] of tablesResult[0].values) {
    const colsResult = db.exec(`PRAGMA table_info(${tableName});`);
    const columns = [];
    if (colsResult.length > 0) {
      for (const row of colsResult[0].values) {
        // row: [cid, name, type, notnull, dflt_value, pk]
        const colName = row[1];
        const colType = row[2] || 'ANY';
        const isPk = row[5] > 0;

        // Busca FK
        let fk = null;
        const fkResult = db.exec(`PRAGMA foreign_key_list(${tableName});`);
        if (fkResult.length > 0) {
          for (const fkRow of fkResult[0].values) {
            // fkRow: [id, seq, table, from, to, on_update, on_delete, match]
            if (fkRow[3] === colName) {
              fk = `${fkRow[2]}.${fkRow[4]}`;
              break;
            }
          }
        }

        columns.push({ name: colName, type: colType, pk: isPk, fk });
      }
    }
    schema.push({ tableName, objectType, columns });
  }
  return schema;
}
