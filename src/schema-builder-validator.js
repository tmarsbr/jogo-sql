/**
 * schema-builder-validator.js — Validação de desafios do modo Construtor de Schema.
 *
 * Módulo puro (sem DOM, sem localStorage): inspeciona o estado do banco SQLite
 * via PRAGMAs e o DDL digitado pelo jogador, e retorna feedback explícito sobre
 * o modelo criado (tabelas, PKs, FKs, cardinalidades).
 *
 * Tipos de retorno:
 * - 'correct'              modelo atende a todos os requisitos
 * - 'incomplete'           DDL vazio ou sem tabelas criadas
 * - 'sql_error'            DDL tem erro de sintaxe/execução
 * - 'blocked'              comando não permitido (DROP, ALTER, DML...)
 * - 'missing_table'        tabela obrigatória ausente
 * - 'unexpected_table'     tabela que não deveria existir foi criada
 * - 'missing_pk'           tabela sem primary key declarada
 * - 'missing_column'       coluna obrigatória ausente
 * - 'missing_fk'           FK obrigatória ausente (lado N do 1:N)
 * - 'missing_junction'     tabela de junção do N:N ausente
 * - 'cardinality_wrong'    cardinalidade violada (ex.: FK solta no lado errado)
 * - 'constraint_missing'   restrição (NOT NULL / UNIQUE) ausente
 */

import { executeQuery, RESULT_ERROR, RESULT_BLOCKED, RESULT_EMPTY } from './executor.js';

export const SB_FEEDBACK_CORRECT = 'correct';
export const SB_FEEDBACK_INCOMPLETE = 'incomplete';
export const SB_FEEDBACK_SQL_ERROR = 'sql_error';
export const SB_FEEDBACK_BLOCKED = 'blocked';
export const SB_FEEDBACK_MISSING_TABLE = 'missing_table';
export const SB_FEEDBACK_UNEXPECTED_TABLE = 'unexpected_table';
export const SB_FEEDBACK_MISSING_PK = 'missing_pk';
export const SB_FEEDBACK_MISSING_COLUMN = 'missing_column';
export const SB_FEEDBACK_MISSING_FK = 'missing_fk';
export const SB_FEEDBACK_MISSING_JUNCTION = 'missing_junction';
export const SB_FEEDBACK_CARDINALITY_WRONG = 'cardinality_wrong';
export const SB_FEEDBACK_CONSTRAINT_MISSING = 'constraint_missing';

function normalizeIdentifier(name) {
  return String(name).trim().toLowerCase().replace(/^["'`]|["'`]$/g, '');
}

/* --- Sanitização e bloqueio de comandos --- */

/**
 * Substitui por espaços tudo que não é código executável — literais de string
 * ('...'), comentários de linha (--) e comentários de bloco. Preserva o
 * comprimento original do texto, para servir de máscara posicional sobre o SQL.
 *
 * Aspas duplas e crases NÃO são apagadas: em SQL elas delimitam identificador
 * (CREATE TABLE "minha_tabela"), e apagá-las faria o nome da tabela sumir.
 * @param {string} sql
 * @returns {string} texto do mesmo tamanho, com literais e comentários apagados
 */
function stripNoise(sql) {
  const source = String(sql);
  let result = '';
  let mode = 'code'; // 'code' | 'string' | 'line-comment' | 'block-comment'
  let quote = null;

  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    const next = source[index + 1];

    if (mode === 'string') {
      if (character === quote) {
        // Aspa duplicada ('') escapa o delimitador e segue dentro do literal.
        if (next === quote) { result += '  '; index++; continue; }
        mode = 'code';
        quote = null;
      }
      result += ' ';
      continue;
    }

    if (mode === 'line-comment') {
      // Preserva a quebra de linha para não fundir instruções distintas.
      result += (character === '\n') ? '\n' : ' ';
      if (character === '\n') mode = 'code';
      continue;
    }

    if (mode === 'block-comment') {
      if (character === '*' && next === '/') { result += '  '; index++; mode = 'code'; continue; }
      result += (character === '\n') ? '\n' : ' ';
      continue;
    }

    if (character === '-' && next === '-') { result += '  '; index++; mode = 'line-comment'; continue; }
    if (character === '/' && next === '*') { result += '  '; index++; mode = 'block-comment'; continue; }
    if (character === "'") { mode = 'string'; quote = character; result += ' '; continue; }

    result += character;
  }

  return result;
}

/**
 * Apaga as ações referenciais de uma chave estrangeira (ON DELETE CASCADE,
 * ON UPDATE SET NULL...). Sem isso, as palavras DELETE e UPDATE que fazem parte
 * de um FOREIGN KEY legítimo seriam confundidas com comandos DML proibidos.
 * @param {string} sql
 * @returns {string}
 */
function stripReferentialActions(sql) {
  return String(sql).replace(
    /\bON\s+(?:DELETE|UPDATE)\s+(?:CASCADE|RESTRICT|NO\s+ACTION|SET\s+NULL|SET\s+DEFAULT)\b/gi,
    ' '
  );
}

function findForbiddenKeyword(sql) {
  // No modo Construtor de Schema só CREATE TABLE/INDEX/TRIGGER e consultas são
  // permitidos. Comentários, literais e ações referenciais de FK não são comandos.
  const searchable = stripReferentialActions(stripNoise(sql));
  const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'ATTACH', 'DETACH', 'PRAGMA', 'VACUUM'];
  for (const kw of forbidden) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(searchable)) return kw;
  }
  return null;
}

/* --- Execução de múltiplos statements --- */

/**
 * Divide um texto SQL em instruções individuais.
 * Usa stripNoise como máscara posicional: apenas os ';' que estão em código real
 * separam instruções — os que aparecem dentro de literais de string ou de
 * comentários são ignorados.
 * @param {string} sql DDL/consultas do jogador
 * @returns {string[]}
 */
function splitStatements(sql) {
  const source = String(sql);
  const mask = stripNoise(source);
  const statements = [];
  let cursor = 0;

  for (let index = 0; index < mask.length; index++) {
    if (mask[index] !== ';') continue;
    const piece = source.slice(cursor, index + 1).trim();
    if (piece.length > 0 && piece !== ';') statements.push(piece);
    cursor = index + 1;
  }

  const remaining = source.slice(cursor).trim();
  // Sobra sem ';' final só conta se houver código de fato (não apenas comentário).
  if (remaining.length > 0 && mask.slice(cursor).trim().length > 0) statements.push(remaining);
  return statements;
}

function terminateStatement(statement) {
  const source = String(statement || '').trim();
  if (!source) return '';

  const mask = stripNoise(source);
  let lastCodeIndex = -1;
  for (let index = mask.length - 1; index >= 0; index--) {
    if (!/\s/.test(mask[index])) {
      lastCodeIndex = index;
      break;
    }
  }

  if (lastCodeIndex < 0 || mask[lastCodeIndex] === ';') return source;
  return `${source.slice(0, lastCodeIndex + 1)};${source.slice(lastCodeIndex + 1)}`;
}

/**
 * Separa CREATE TABLE e DROP TABLE no nível superior, inclusive quando o
 * rascunho não contém ';' entre os comandos. Ocorrências em strings,
 * comentários ou dentro da lista de colunas são ignoradas.
 * @param {string} sql
 * @returns {string[]}
 */
function splitSchemaModelStatements(sql) {
  const result = [];

  for (const statement of splitStatements(sql || '')) {
    const source = String(statement).trim();
    const mask = stripNoise(source);
    const depthAt = new Int32Array(mask.length);
    let depth = 0;

    for (let index = 0; index < mask.length; index++) {
      depthAt[index] = depth;
      if (mask[index] === '(') depth++;
      else if (mask[index] === ')') depth = Math.max(0, depth - 1);
    }

    const starts = [];
    const createTable = /\b(?:CREATE\s+(?:TEMP(?:ORARY)?\s+)?TABLE|DROP\s+TABLE)\b/gi;
    let match;
    while ((match = createTable.exec(mask)) !== null) {
      if (depthAt[match.index] === 0) starts.push(match.index);
    }

    if (starts.length <= 1) {
      result.push(source);
      continue;
    }

    for (let index = 0; index < starts.length; index++) {
      const from = index === 0 ? 0 : starts[index];
      const to = starts[index + 1] ?? source.length;
      const fragment = source.slice(from, to).trim();
      if (fragment) result.push(fragment);
    }
  }

  return result;
}

/**
 * Extrai o nome da tabela criada por uma instrução CREATE TABLE.
 * @param {string} statement uma única instrução SQL
 * @returns {string|null} nome da tabela, ou null se não for um CREATE TABLE
 */
function getCreatedTableName(statement) {
  const code = stripNoise(statement);
  const match = code.match(/\bCREATE\s+(?:TEMP(?:ORARY)?\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"\[]?([A-Za-z_][\w$]*)/i);
  return match ? match[1] : null;
}

/** Extrai o nome removido por um comando DROP TABLE isolado. */
function getDroppedTableName(statement) {
  const code = stripNoise(statement);
  const match = code.match(/^\s*DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?[`"\[]?([A-Za-z_][\w$]*)[`"\]]?\s*;?\s*$/i);
  return match ? match[1] : null;
}

/**
 * Lista as tabelas que um DDL cria, na ordem em que aparecem. Permite montar o
 * checklist do briefing sem depender do estado do banco.
 * @param {string} ddlSql
 * @returns {string[]}
 */
function getCreatedTableNames(ddlSql) {
  const names = [];
  for (const statement of splitStatements(ddlSql || '')) {
    const name = getCreatedTableName(statement);
    if (name && !names.some(existing => normalizeIdentifier(existing) === normalizeIdentifier(name))) {
      names.push(name);
    }
  }
  return names;
}

/**
 * Funde as instruções do editor no modelo acumulado do desafio.
 *
 * Um CREATE TABLE para uma tabela já presente SUBSTITUI a definição anterior —
 * é assim que o jogador corrige um erro de modelagem sem recomeçar o desafio.
 * Instruções que não criam tabela (consultas, por exemplo) não entram no modelo.
 *
 * @param {string[]} accumulated instruções já acumuladas no desafio
 * @param {string} incomingSql conteúdo do editor
 * @returns {string[]} novo modelo acumulado
 */
function mergeSchemaStatements(accumulated, incomingSql) {
  const model = [];
  const upsert = (statement) => {
    const normalizedStatement = terminateStatement(statement);
    const tableName = getCreatedTableName(normalizedStatement);
    if (!tableName) return;
    const index = model.findIndex(existing =>
      normalizeIdentifier(getCreatedTableName(existing) || '') === normalizeIdentifier(tableName)
    );
    if (index >= 0) model[index] = normalizedStatement;
    else model.push(normalizedStatement);
  };

  if (Array.isArray(accumulated)) {
    for (const saved of accumulated) {
      for (const statement of splitSchemaModelStatements(saved)) upsert(statement);
    }
  }

  for (const statement of splitSchemaModelStatements(incomingSql || '')) {
    upsert(statement);
  }

  return model;
}

/**
 * Executa um DDL com múltiplas instruções, aplicando cada statement em ordem.
 * Continua mesmo após o primeiro erro para informar todos os problemas.
 * @param {string} ddlSql DDL do jogador
 * @param {Database} db instância do SQLite
 * @returns {{applied: string[], errors: {statement: string, message: string}[]}}
 */
function executeMultipleStatements(ddlSql, db) {
  const statements = splitStatements(ddlSql);
  const applied = [];
  const errors = [];
  for (const stmt of statements) {
    try {
      db.exec(stmt);
      applied.push(stmt);
    } catch (err) {
      errors.push({ statement: stmt, message: err.message || 'Erro de execução.' });
    }
  }
  return { applied, errors };
}

/* --- Introspecção do banco via PRAGMA --- */

function getExistingTables(db) {
  try {
    const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
    if (!result.length) return [];
    return result[0].values.map(row => String(row[0]));
  } catch {
    return [];
  }
}

function getColumnsOfTable(db, tableName) {
  try {
    const result = db.exec(`PRAGMA table_info("${tableName}");`);
    if (!result.length) return [];
    return result[0].values.map(row => ({
      name: String(row[1]),
      type: String(row[2]),
      notnull: Boolean(row[3]),
      pk: Boolean(row[5]),
    }));
  } catch {
    return [];
  }
}

function getPrimaryKeys(db, tableName) {
  return getColumnsOfTable(db, tableName)
    .filter(col => col.pk)
    .map(col => col.name);
}

function getForeignKeys(db, tableName) {
  try {
    const result = db.exec(`PRAGMA foreign_key_list("${tableName}");`);
    if (!result.length) return [];
    return result[0].values.map(row => ({
      column: String(row[3]),
      referencesTable: String(row[2]),
      referencesColumn: String(row[4]),
    }));
  } catch {
    return [];
  }
}

/* --- Helpers de feedback --- */

/**
 * Uma tabela é de junção (N:N) quando o desafio a declara em junctionTables ou
 * quando exige PK composta e ao menos duas FKs — o formato canônico da tabela
 * associativa.
 * @param {object} challenge desafio ativo
 * @param {string} tableName nome da tabela
 * @returns {boolean}
 */
function isJunctionTable(challenge, tableName) {
  const declared = challenge.junctionTables || {};
  for (const name of Object.keys(declared)) {
    if (normalizeIdentifier(name) === normalizeIdentifier(tableName)) return true;
  }
  const check = (challenge.tableChecks || {})[tableName];
  if (!check) return false;
  return (check.pk || []).length >= 2 && (check.fk || []).length >= 2;
}

function feedback(type, message, missing = []) {
  return { type, message, missing };
}

function firstMissingColumn(table, required) {
  const existing = new Set(table.map(col => normalizeIdentifier(col.name)));
  for (const col of required) {
    if (!existing.has(normalizeIdentifier(col.name))) return col.name;
  }
  return null;
}

function hasConstraint(table, columnName, constraint) {
  const normalized = normalizeIdentifier(columnName);
  for (const col of table) {
    if (normalizeIdentifier(col.name) === normalized) {
      if (constraint === 'pk') return col.pk;
      if (constraint === 'notnull') return col.notnull;
      // FKs não são checadas aqui — vêm de PRAGMA foreign_key_list.
      return false;
    }
  }
  return false;
}

function hasForeignKey(db, tableName, column, referencesTable) {
  const fks = getForeignKeys(db, tableName);
  return fks.some(fk =>
    normalizeIdentifier(fk.column) === normalizeIdentifier(column) &&
    normalizeIdentifier(fk.referencesTable) === normalizeIdentifier(referencesTable)
  );
}

/**
 * Ordena os tipos de feedback por gravidade de "menos completo" a "mais grave",
 * para que a primeira verificação que falhar dê o feedback mais útil.
 */
const FEEDBACK_ORDER = [
  SB_FEEDBACK_MISSING_TABLE,
  SB_FEEDBACK_UNEXPECTED_TABLE,
  SB_FEEDBACK_MISSING_JUNCTION,
  SB_FEEDBACK_MISSING_PK,
  SB_FEEDBACK_MISSING_FK,
  SB_FEEDBACK_CARDINALITY_WRONG,
  SB_FEEDBACK_MISSING_COLUMN,
  SB_FEEDBACK_CONSTRAINT_MISSING,
];

/**
 * Valida o modelo criado pelo jogador contra os requisitos do desafio.
 *
 * @param {string} ddlSql DDL executado pelo jogador (pode ser vazio/consulta)
 * @param {object} challenge dados do desafio (schema-challenges.js)
 * @param {Database} db instância do SQLite
 * @param {{applyDdl?: boolean}} [options] aplicaDdl=true (padrão) re-executa o DDL no banco
 *   antes de validar; false assume que o banco já contém o DDL aplicado (usado pelo app
 *   para evitar execução duplicada na mesma sessão).
 * @returns {{type: string, message: string, missing: any[]}}
 */
export function validateSchemaChallenge(ddlSql, challenge, db, options = {}) {
  if (!db) {
    return feedback(SB_FEEDBACK_SQL_ERROR, 'Banco não inicializado.');
  }

  if (!ddlSql || ddlSql.trim().length === 0) {
    return feedback(SB_FEEDBACK_INCOMPLETE, 'O banco ainda está vazio. Comece criando sua primeira tabela com CREATE TABLE.');
  }

  // Executa o DDL do jogador statement por statement (suporta vários
  // CREATE TABLE no editor). Comandos proibidos bloqueiam; erros de
  // sintaxe capturam por statement.
  if (findForbiddenKeyword(ddlSql)) {
    return feedback(SB_FEEDBACK_BLOCKED,
      `Comando não permitido neste modo (DROP, DML, ALTER...). Aqui você apenas cria e consulta.`);
  }
  const applyDdl = options.applyDdl !== false;
  let applied = [];
  let errors = [];
  if (applyDdl) {
    const result = executeMultipleStatements(ddlSql, db);
    applied = result.applied;
    errors = result.errors;
    if (applied.length === 0 && errors.length > 0) {
      return feedback(SB_FEEDBACK_SQL_ERROR, `Não foi possível aplicar o modelo: ${errors[0].message}`);
    }
    if (errors.length > 0) {
      return feedback(SB_FEEDBACK_SQL_ERROR,
        `Parte do modelo foi aplicada, mas ${errors.length} instrução(ões) falharam: ${errors[0].message}`);
    }
  }

  const existing = getExistingTables(db).map(t => normalizeIdentifier(t));
  const missingTables = [];
  for (const expected of challenge.expectedTables) {
    if (!existing.includes(normalizeIdentifier(expected))) {
      missingTables.push(expected);
    }
  }
  if (missingTables.length > 0) {
    // Se o que falta é a tabela de junção do N:N, o feedback específico ensina
    // mais do que um "tabela ausente" genérico.
    const missingJunction = missingTables.find(table => isJunctionTable(challenge, table));
    if (missingJunction) {
      return feedback(SB_FEEDBACK_MISSING_JUNCTION,
        `A relação muitos-para-muitos exige uma tabela de junção ("${missingJunction}") com chave primária composta e uma chave estrangeira para cada lado.`,
        missingTables);
    }
    const joined = missingTables.join(', ');
    const hint = missingTables.length === 1
      ? ` A tabela "${missingTables[0]}" ainda não existe.`
      : ` Faltam as tabelas: ${joined}.`;
    return feedback(SB_FEEDBACK_MISSING_TABLE,
      `Modelo incompleto:${hint} Crie as tabelas que faltam para atender os requisitos.`,
      missingTables);
  }

  if (challenge.allowExtraTables === false && challenge.unexpectedTables && challenge.unexpectedTables.length > 0) {
    const unexpected = [];
    for (const t of challenge.unexpectedTables) {
      if (existing.includes(normalizeIdentifier(t))) unexpected.push(t);
    }
    if (unexpected.length > 0) {
      return feedback(SB_FEEDBACK_UNEXPECTED_TABLE,
        `Tabela inesperada: "${unexpected[0]}". Os requisitos não pedem essa entidade — revise a modelagem.`,
        unexpected);
    }
  }

  // Verificações por tabela, na ordem de gravidade.
  const tableResults = [];

  // Junções N:N obrigatórias.
  for (const junctionName of Object.keys(challenge.tableChecks)) {
    const check = challenge.tableChecks[junctionName];
    if (check.pk.length >= 2) {
      // Tabela de junção com PK composta: verifica existência e as FKs
      const existingTable = getColumnsOfTable(db, junctionName);
      if (existingTable.length === 0) continue; // missing_table já cobriu
      const pkNames = getPrimaryKeys(db, junctionName);
      if (pkNames.length < 2) {
        tableResults.push({ table: junctionName, check, issue: SB_FEEDBACK_MISSING_PK, missing: pkNames });
        continue;
      }
      for (const fk of check.fk) {
        if (!hasForeignKey(db, junctionName, fk.column, fk.references)) {
          tableResults.push({ table: junctionName, check, issue: SB_FEEDBACK_MISSING_FK, missing: [`${fk.column} → ${fk.references}`] });
        }
      }
    }
  }

  for (const tableName of Object.keys(challenge.tableChecks)) {
    const check = challenge.tableChecks[tableName];
    const existingTable = getColumnsOfTable(db, tableName);
    if (existingTable.length === 0) continue; // missing_table já cobriu

    // PK obrigatória.
    if (check.pk.length > 0) {
      const pkNames = getPrimaryKeys(db, tableName);
      if (pkNames.length === 0) {
        tableResults.push({ table: tableName, check, issue: SB_FEEDBACK_MISSING_PK, missing: check.pk });
        continue;
      }
      const pkNormalized = new Set(pkNames.map(p => normalizeIdentifier(p)));
      const requiredPkMissing = check.pk.filter(pk => !pkNormalized.has(normalizeIdentifier(pk)));
      if (requiredPkMissing.length > 0) {
        tableResults.push({ table: tableName, check, issue: SB_FEEDBACK_MISSING_PK, missing: requiredPkMissing });
        continue;
      }
    }

    // FKs obrigatórias (cardinalidade 1:N — FK no lado N).
    for (const fk of check.fk) {
      if (!hasForeignKey(db, tableName, fk.column, fk.references)) {
        tableResults.push({ table: tableName, check, issue: SB_FEEDBACK_MISSING_FK, missing: [`${fk.column} → ${fk.references}`] });
      }
    }

    // Colunas obrigatórias.
    const missingColumn = firstMissingColumn(existingTable, check.columns);
    if (missingColumn !== null) {
      tableResults.push({ table: tableName, check, issue: SB_FEEDBACK_MISSING_COLUMN, missing: [missingColumn] });
    }

    // Restrições NOT NULL obrigatórias (colunas marcadas com 'notnull' e ainda não reportadas).
    const alreadyMissing = new Set((tableResults.find(r => r.table === tableName) || { missing: [] }).missing.map(String));
    for (const col of check.columns) {
      if (col.constraints.includes('notnull') && !alreadyMissing.has(col.name) && !hasConstraint(existingTable, col.name, 'notnull')) {
        tableResults.push({ table: tableName, check, issue: SB_FEEDBACK_CONSTRAINT_MISSING, missing: [`${col.name} NOT NULL`] });
      }
    }
  }

  // Retorna o problema mais grave segundo a ordem definida.
  for (const issueType of FEEDBACK_ORDER) {
    const issues = tableResults.filter(r => r.issue === issueType);
    if (issues.length > 0) {
      const first = issues[0];
      const messages = {
        [SB_FEEDBACK_MISSING_JUNCTION]: `A relação muitos-para-muitos exige uma tabela de junção (ex.: "${first.table}") com chave primária composta e as duas chaves estrangeiras.`,
        [SB_FEEDBACK_MISSING_PK]: `A tabela "${first.table}" precisa de chave primária declarada (PRIMARY KEY${first.missing.length > 1 ? ' composta' : ''}).`,
        [SB_FEEDBACK_MISSING_FK]: `A tabela "${first.table}" precisa de uma chave estrangeira: ${first.missing[0]}.`,
        [SB_FEEDBACK_CARDINALITY_WRONG]: `Cardinalidade incorreta na tabela "${first.table}".`,
        [SB_FEEDBACK_MISSING_COLUMN]: `A tabela "${first.table}" está sem a coluna "${first.missing[0]}".`,
        [SB_FEEDBACK_CONSTRAINT_MISSING]: `A tabela "${first.table}" está sem a restrição "${first.missing[0]}" — as colunas de dados devem recusar valores nulos (NOT NULL).`,
      };
      return feedback(issueType, messages[issueType], first.missing);
    }
  }

  return feedback(SB_FEEDBACK_CORRECT,
    `Modelo concluído! Todas as tabelas, chaves e cardinalidades atendem aos requisitos. ${challenge.explanation}`);
}

/* Exporta helpers de introspecção para testes */
export { getExistingTables, getColumnsOfTable, getPrimaryKeys, getForeignKeys, normalizeIdentifier,
         findForbiddenKeyword, executeMultipleStatements, splitStatements, splitSchemaModelStatements, stripNoise,
         getCreatedTableName, getDroppedTableName, getCreatedTableNames, mergeSchemaStatements };
