/**
 * executor.js — Executor SQL seguro do SQL Detective.
 *
 * Fase 3: permite que o jogador escreva uma query, execute-a e veja
 * os resultados com mensagens claras.
 *
 * Regras:
 * - Por padrão, apenas uma instrução de leitura iniciada por SELECT ou WITH.
 * - Missões específicas podem liberar somente CREATE VIEW, sem abrir outros DDLs.
 * - Bloqueia: INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, ATTACH, DETACH, PRAGMA, VACUUM.
 *   Exceções são opt-in e estreitas: DML controlado no sandbox e CREATE VIEW em missões próprias.
 * - Bloqueia múltiplas instruções na mesma execução.
 * - Trata comentários e strings antes de analisar.
 */

/* --- Comandos bloqueados --- */
const BLOCKED_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE',
  'ATTACH', 'DETACH', 'PRAGMA', 'VACUUM',
];

/* --- Tipos de retorno do executor --- */
export const RESULT_OK = 'ok';
export const RESULT_ERROR = 'error';
export const RESULT_BLOCKED = 'blocked';
export const RESULT_EMPTY = 'empty';

/**
 * Remove comentários SQL (-- ... e /* ... *\/) de uma string.
 * Preserva o conteúdo de strings literais.
 * @param {string} sql
 * @returns {string} SQL sem comentários
 */
function stripComments(sql) {
  let result = '';
  let i = 0;
  let inString = false;
  let stringChar = null;

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];

    // Dentro de string literal — copia até fechar
    if (inString) {
      result += ch;
      if (ch === stringChar) {
        // Dobro do mesmo char = escape dentro da string (SQL)
        if (next === stringChar) {
          result += next;
          i += 2;
          continue;
        }
        inString = false;
        stringChar = null;
      }
      i++;
      continue;
    }

    // Início de string literal
    if (ch === "'" || ch === '"') {
      inString = true;
      stringChar = ch;
      result += ch;
      i++;
      continue;
    }

    // Comentário de linha (-- até fim da linha)
    if (ch === '-' && next === '-') {
      // Pula até newline
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }

    // Comentário de bloco (/* ... */)
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      i += 2; // Pula o "*/"
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

/**
 * Normaliza o SQL para análise: remove comentários, espaços extras, faz trim.
 * @param {string} sql
 * @returns {string} SQL normalizado
 */
function normalizeSQL(sql) {
  const noComments = stripComments(sql);
  return noComments.trim();
}

/**
 * Conta o número de statements (instruções separadas por ponto-e-vírgula)
 * no SQL normalizado, ignorando o último se for vazio.
 * @param {string} sql SQL já sem comentários
 * @returns {number}
 */
function countStatements(sql) {
  // Divide por ponto-e-vírgula que não estão dentro de strings
  let inString = false;
  let stringChar = null;
  let statements = [];
  let current = '';

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];

    if (inString) {
      current += ch;
      if (ch === stringChar) {
        if (sql[i + 1] === stringChar) {
          current += sql[i + 1];
          i++;
          continue;
        }
        inString = false;
        stringChar = null;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }

    if (ch === ';') {
      statements.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  // Adiciona o último segmento se não for vazio
  if (current.trim().length > 0) {
    statements.push(current);
  }

  return statements.filter(s => s.trim().length > 0).length;
}

/**
 * Extrai a primeira palavra-chave do SQL (deve ser SELECT ou WITH).
 * @param {string} sql SQL normalizado
 * @returns {string|null}
 */
function getFirstKeyword(sql) {
  const match = sql.match(/^\s*(\w+)/);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Reconhece apenas a forma segura de CREATE VIEW usada pelas missões.
 * O corpo continua limitado a SELECT ou WITH e passa pela lista de palavras bloqueadas.
 * @param {string} sql SQL normalizado, sem ponto-e-vírgula final
 * @returns {boolean}
 */
function isCreateViewStatement(sql) {
  return /^CREATE\s+VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?[A-Za-z_][A-Za-z0-9_]*\s+AS\s+(?:SELECT|WITH)\b/i.test(sql);
}

/**
 * Verifica se o SQL contém palavras-chave bloqueadas.
 * Busca por palavras inteiras (não substrings).
 * @param {string} sql SQL sem comentários
 * @returns {string|null} palavra bloqueada encontrada, ou null
 */
function stripStringLiterals(sql) {
  let result = '';
  let inString = false;
  let quote = null;
  for (let index = 0; index < sql.length; index++) {
    const character = sql[index];
    if (inString) {
      if (character === quote) {
        if (sql[index + 1] === quote) { result += '  '; index++; continue; }
        inString = false;
        quote = null;
      }
      result += ' ';
      continue;
    }
    if (character === "'" || character === '"') {
      inString = true;
      quote = character;
      result += ' ';
      continue;
    }
    result += character;
  }
  return result;
}

function findBlockedKeyword(sql, allowedKeywords = []) {
  // Regex para palavras inteiras, case-insensitive
  const searchable = stripStringLiterals(sql);
  for (const kw of BLOCKED_KEYWORDS) {
    if (allowedKeywords.includes(kw)) continue;
    const re = new RegExp(`\\b${kw}\\b`, 'i');
    if (re.test(searchable)) {
      return kw;
    }
  }
  return null;
}

/**
 * Identifica o erro comum de usar um comparador sem expressão à esquerda.
 * Por exemplo, `WHERE >= 22` faz o SQLite reportar "near >=" embora `>=`
 * seja um operador válido.
 * @param {string} sql SQL sem comentários
 * @returns {string|null}
 */
function getComparisonSyntaxHint(sql) {
  const searchable = stripStringLiterals(sql);
  const match = searchable.match(/(?:^|\b(?:WHERE|HAVING|ON|WHEN|AND|OR)\b|\()\s*(>=|<=|<>|=|>|<)(?=\s*(?:\d|['"(A-Za-z_]))/i);
  if (!match) return null;

  const operator = match[1];
  return `Erro de sintaxe: o operador "${operator}" precisa de uma coluna ou expressão antes dele. Exemplo: WHERE coluna ${operator} valor.`;
}

/**
 * Valida e executa uma query SQL contra o banco.
 *
 * @param {string} sql texto da query do jogador
 * @param {Database} db instância do SQLite (sql.js)
 * @param {{allowDml?: boolean, allowCreateView?: boolean}} [options]
 * @returns {{type: string, columns: string[], rows: any[][], rowCount: number, message: string}}
 */
export function executeQuery(sql, db, options = {}) {
  if (!db) {
    return { type: RESULT_ERROR, columns: [], rows: [], rowCount: 0, message: 'Banco não inicializado.' };
  }

  if (!sql || sql.trim().length === 0) {
    return { type: RESULT_ERROR, columns: [], rows: [], rowCount: 0, message: 'Query vazia. Escreva uma consulta SQL.' };
  }

  // Remove comentários
  const clean = normalizeSQL(sql);

  if (clean.length === 0) {
    return { type: RESULT_ERROR, columns: [], rows: [], rowCount: 0, message: 'Query vazia (apenas comentários).' };
  }

  // Verifica múltiplas instruções
  const stmtCount = countStatements(clean);
  if (stmtCount > 1) {
    return { type: RESULT_BLOCKED, columns: [], rows: [], rowCount: 0, message: 'Múltiplas instruções não são permitidas. Execute uma query por vez.' };
  }

  // Remove ponto-e-vírgula final (se houver) para análise
  const trimmed = clean.replace(/;\s*$/, '').trim();

  // Verifica primeira palavra-chave
  const firstKw = getFirstKeyword(trimmed);
  const writable = Boolean(options.allowDml) && ['INSERT', 'UPDATE', 'DELETE'].includes(firstKw);
  const createView = Boolean(options.allowCreateView) && isCreateViewStatement(trimmed);
  if (firstKw !== 'SELECT' && firstKw !== 'WITH' && !writable && !createView) {
    const allowed = options.allowCreateView ? 'SELECT, WITH ou CREATE VIEW' : 'SELECT ou WITH';
    return { type: RESULT_BLOCKED, columns: [], rows: [], rowCount: 0, message: `Comando "${firstKw}" não permitido. Use ${allowed}.` };
  }

  // Verifica palavras-chave bloqueadas
  const allowedKeywords = [];
  if (writable) allowedKeywords.push(firstKw);
  if (createView) allowedKeywords.push('CREATE');
  const blocked = findBlockedKeyword(trimmed, allowedKeywords);
  if (blocked) {
    return { type: RESULT_BLOCKED, columns: [], rows: [], rowCount: 0, message: `Comando "${blocked}" não é permitido neste jogo.` };
  }

  // Executa a query
  try {
    const result = db.exec(trimmed);

    if (result.length === 0) {
      const message = createView
        ? 'View criada com sucesso. A prévia será consultada automaticamente.'
        : 'Query executada com sucesso. Nenhuma linha retornada.';
      return { type: RESULT_EMPTY, columns: [], rows: [], rowCount: 0, message };
    }

    const columns = result[0].columns;
    const rows = result[0].values;
    return {
      type: RESULT_OK,
      columns,
      rows,
      rowCount: rows.length,
      message: `${rows.length} ${rows.length === 1 ? 'linha' : 'linhas'} retornada(s).`,
    };
  } catch (err) {
    // Erro de sintaxe ou execução do SQLite
    const msg = getComparisonSyntaxHint(trimmed) || err.message || 'Erro de execução.';
    return { type: RESULT_ERROR, columns: [], rows: [], rowCount: 0, message: msg };
  }
}

/**
 * Versão para Node.js (exporta funções puras para teste).
 * Recebe uma instância db do sql.js (Node) e executa a query.
 */
export function executeQueryRaw(sql, db) {
  return executeQuery(sql, db);
}

// Exporta funções auxiliares para testes
export { stripComments, normalizeSQL, countStatements, getFirstKeyword, isCreateViewStatement, findBlockedKeyword, stripStringLiterals, getComparisonSyntaxHint };
