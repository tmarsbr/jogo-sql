/**
 * validator.js — Validação de resultados e conceitos SQL.
 *
 * Fase 4: valida execução, resultado, colunas e conceito central.
 * Aceita queries equivalentes (aliases, espaços, maiúsculas/minúsculas).
 */

import { executeQuery } from './executor.js';

/* --- Tipos de feedback --- */
export const FEEDBACK_CORRECT = 'correct';
export const FEEDBACK_WRONG_RESULT = 'wrong_result';
export const FEEDBACK_MISSING_CONCEPT = 'missing_concept';
export const FEEDBACK_SQL_ERROR = 'sql_error';
export const FEEDBACK_MISSING_COLUMNS = 'missing_columns';
export const FEEDBACK_BLOCKED = 'blocked';

/**
 * Normaliza um nome de coluna para comparação.
 * Remove espaços, aspas, e converte para minúsculo.
 * @param {string} name
 * @returns {string}
 */
function normalizeColumnName(name) {
  return String(name).trim().toLowerCase().replace(/^["'`]|["'`]$/g, '');
}

/**
 * Normaliza um conjunto de colunas para um array ordenado de strings.
 * @param {string[]} cols
 * @returns {string[]}
 */
function normalizeColumns(cols) {
  return cols.map(normalizeColumnName).sort();
}

/**
 * Compara duas matrizes de valores (linhas) ignorando ordem das linhas
 * e ordem das colunas (baseado no mapeamento de colunas esperadas).
 * @param {any[][]} actualRows
 * @param {any[][]} expectedRows
 * @param {string[]} actualCols
 * @param {string[]} expectedCols
 * @returns {boolean}
 */
function compareResults(actualRows, expectedRows, actualCols, expectedCols) {
  if (actualRows.length !== expectedRows.length) return false;

  // Mapeia colunas esperadas -> índice nas colunas atuais
  const expectedColMap = {};
  expectedCols.forEach((c, i) => { expectedColMap[normalizeColumnName(c)] = i; });

  const actualColMap = {};
  actualCols.forEach((c, i) => { actualColMap[normalizeColumnName(c)] = i; });

  // Verifica que todas as colunas esperadas existem no resultado
  for (const ec of Object.keys(expectedColMap)) {
    if (!(ec in actualColMap)) return false;
  }

  // Normaliza cada linha para o formato esperado (apenas colunas esperadas, na ordem)
  const normalizeRow = (row, colMap, targetCols) => {
    return targetCols.map(tc => {
      const idx = colMap[normalizeColumnName(tc)];
      if (idx === undefined) return null;
      const val = row[idx];
      return val === null ? null : String(val);
    });
  };

  const normActual = actualRows.map(r => JSON.stringify(normalizeRow(r, actualColMap, expectedCols)));
  const normExpected = expectedRows.map(r => JSON.stringify(normalizeRow(r, expectedColMap, expectedCols)));

  // Compara como conjuntos (ordem das linhas não importa)
  normActual.sort();
  normExpected.sort();

  return JSON.stringify(normActual) === JSON.stringify(normExpected);
}

/**
 * Verifica se a query contém todos os conceitos obrigatórios.
 * @param {string} sql query original do jogador (com comentários e strings)
 * @param {string[]} concepts lista de conceitos obrigatórios
 * @returns {string[]} conceitos ausentes
 */
function findMissingConcepts(sql, concepts) {
  // Remove comentários e strings literais antes de procurar conceitos,
  // para evitar que palavras em comentários ou strings sejam detectadas.
  const cleaned = stripForConceptCheck(sql);
  const lower = cleaned.toLowerCase();
  const missing = [];
  for (const concept of concepts) {
    if (concept === 'subquery') {
      // Subquery é um conceito estrutural: SELECT dentro de parênteses
      // que NÃO seja parte de uma CTE (WITH ... AS (SELECT ...)).
      // Remove o bloco WITH inteiro antes de procurar subquery.
      // O bloco WITH vai do keyword WITH até o SELECT principal (que não
      // está entre parênteses). Usamos um parser de parênteses para encontrar
      // o fim do bloco CTE.
      const withoutCTE = removeCTEBlock(cleaned);
      if (!/\(\s*select\b/i.test(withoutCTE)) {
        missing.push(concept);
      }
    } else if (concept === 'create view') {
      if (!/\bcreate\s+view\b/i.test(cleaned)) {
        missing.push(concept);
      }
    } else {
      // Busca o conceito como palavra (não substring) e aceita quebras de linha
      // ou múltiplos espaços em expressões como GROUP BY e LEFT JOIN.
      const pattern = concept
        .trim()
        .split(/\s+/)
        .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('\\s+');
      const re = new RegExp(`\\b${pattern}\\b`, 'i');
      if (!re.test(lower)) {
        missing.push(concept);
      }
    }
  }
  return missing;
}

/**
 * Remove comentários SQL e strings literais da query para verificação de conceitos.
 * Substitui strings por espaços vazios (preserva estrutura) para não detectar
 * palavras-chave dentro de strings ou comentários.
 * @param {string} sql
 * @returns {string} SQL sem comentários e sem conteúdo de strings
 */
function stripForConceptCheck(sql) {
  let result = '';
  let i = 0;
  let inString = false;
  let stringChar = null;

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];

    // Dentro de string literal — substitui por espaços
    if (inString) {
      if (ch === stringChar) {
        if (next === stringChar) {
          result += '  ';
          i += 2;
          continue;
        }
        inString = false;
        stringChar = null;
        result += ' ';
      } else {
        result += ' ';
      }
      i++;
      continue;
    }

    // Início de string literal
    if (ch === "'" || ch === '"') {
      inString = true;
      stringChar = ch;
      result += ' ';
      i++;
      continue;
    }

    // Comentário de linha (-- até fim da linha)
    if (ch === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }

    // Comentário de bloco (/* ... */)
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

/**
 * Remove o bloco CTE (WITH ... ) do SQL, preservando o SELECT principal.
 * Suporta múltiplas CTEs separadas por vírgula e CTEs com lista de colunas.
 * @param {string} sql SQL já sem comentários e strings
 * @returns {string} SQL sem o bloco WITH
 */
function removeCTEBlock(sql) {
  // Encontra o keyword WITH (não dentro de parênteses)
  const withMatch = sql.match(/\bwith\b\s+/i);
  if (!withMatch) return sql;

  const withStart = withMatch.index;
  let i = withStart + withMatch[0].length;
  let depth = 0;

  // Percorre o SQL a partir do WITH, rastreando parênteses.
  // O bloco CTE termina quando encontramos um keyword SELECT (ou INSERT/UPDATE/DELETE)
  // com depth === 0 — esse é o SELECT principal da query.
  while (i < sql.length) {
    const ch = sql[i];

    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
    } else if (depth === 0) {
      // Fora de parênteses: procura por SELECT (fim do bloco CTE)
      const rest = sql.substring(i);
      if (/^\bselect\b/i.test(rest) || /^\binsert\b/i.test(rest) || /^\bupdate\b/i.test(rest) || /^\bdelete\b/i.test(rest)) {
        // Encontrou o SELECT principal — remove tudo do WITH até aqui
        return sql.substring(i);
      }
    }

    i++;
  }

  // Se não encontrou SELECT principal, remove tudo do WITH em diante
  return sql.substring(withStart) === sql ? '' : sql.substring(0, withStart);
}

/**
 * Verifica se o resultado contém todas as colunas esperadas.
 * @param {string[]} actualCols
 * @param {string[]} expectedCols
 * @returns {string[]} colunas ausentes
 */
function findMissingColumns(actualCols, expectedCols) {
  const actualSet = new Set(actualCols.map(normalizeColumnName));
  return expectedCols.filter(c => !actualSet.has(normalizeColumnName(c)));
}

/** Extrai um identificador simples de uma instrução CREATE VIEW. */
function getCreatedViewName(sql) {
  const cleaned = stripForConceptCheck(String(sql || '')).trim();
  const match = cleaned.match(/^CREATE\s+VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z_][A-Za-z0-9_]*)\s+AS\b/i);
  return match ? match[1] : null;
}

function dropMissionView(db, viewName) {
  if (!db || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(viewName || '')) return;
  db.run(`DROP VIEW IF EXISTS "${viewName}";`);
}

/**
 * Valida uma missão de CREATE VIEW sem liberar DDL genérico.
 * A criação não retorna linhas; por isso comparamos uma prévia da view com
 * uma consulta equivalente executada diretamente nas tabelas-base.
 */
function validateCreateViewLevel(sql, level, db) {
  const expectedViewName = level.viewName;
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(expectedViewName || '') || !level.verificationQuery || !level.expectedResultQuery) {
    return { type: FEEDBACK_SQL_ERROR, message: 'Erro interno: configuração incompleta da missão de view.' };
  }

  const actualViewName = getCreatedViewName(sql);
  if (!actualViewName) {
    const attempted = executeQuery(sql, db, { allowCreateView: true });
    if (attempted.type === 'blocked') return { type: FEEDBACK_BLOCKED, message: attempted.message };
    if (attempted.type === 'error') return { type: FEEDBACK_SQL_ERROR, message: attempted.message, result: attempted };
    return {
      type: FEEDBACK_MISSING_CONCEPT,
      message: `Esta missão requer CREATE VIEW ${expectedViewName} AS ... em uma única instrução.`,
      result: attempted.type === 'ok' ? attempted : undefined,
      missingConcepts: ['create view'],
    };
  }

  if (actualViewName.toLowerCase() !== expectedViewName.toLowerCase()) {
    return {
      type: FEEDBACK_WRONG_RESULT,
      message: `Nome da view diferente do solicitado. Use exatamente: ${expectedViewName}.`,
    };
  }

  try {
    // Permite corrigir e reenviar a mesma missão sem depender de DROP manual.
    dropMissionView(db, expectedViewName);
  } catch (error) {
    return { type: FEEDBACK_SQL_ERROR, message: `Não foi possível preparar uma nova tentativa. ${error.message}` };
  }

  const createResult = executeQuery(sql, db, { allowCreateView: true });
  if (createResult.type === 'blocked') return { type: FEEDBACK_BLOCKED, message: createResult.message };
  if (createResult.type === 'error') return { type: FEEDBACK_SQL_ERROR, message: createResult.message, result: createResult };
  if (createResult.type !== 'empty') {
    dropMissionView(db, expectedViewName);
    return { type: FEEDBACK_WRONG_RESULT, message: 'A instrução deve apenas criar a view solicitada.' };
  }

  const viewRecord = db.exec(`SELECT name FROM sqlite_master WHERE type = 'view' AND lower(name) = lower('${expectedViewName}');`);
  if (viewRecord.length === 0 || viewRecord[0].values.length === 0) {
    dropMissionView(db, expectedViewName);
    return { type: FEEDBACK_WRONG_RESULT, message: `A view ${expectedViewName} não foi criada.` };
  }

  const previewResult = executeQuery(level.verificationQuery, db);
  const expectedResult = executeQuery(level.expectedResultQuery, db);
  if (previewResult.type !== 'ok') {
    dropMissionView(db, expectedViewName);
    return { type: FEEDBACK_SQL_ERROR, message: `A view foi criada, mas sua prévia falhou. ${previewResult.message}`, result: previewResult };
  }
  if (expectedResult.type !== 'ok') {
    dropMissionView(db, expectedViewName);
    return { type: FEEDBACK_SQL_ERROR, message: `Erro interno: a consulta de conferência falhou. ${expectedResult.message}` };
  }

  const missingCols = findMissingColumns(previewResult.columns, level.expectedColumns);
  if (missingCols.length > 0) {
    dropMissionView(db, expectedViewName);
    return {
      type: FEEDBACK_MISSING_COLUMNS,
      message: `Colunas esperadas ausentes na view: ${missingCols.join(', ')}.`,
      result: previewResult,
      missingColumns: missingCols,
    };
  }

  if (previewResult.columns.length > level.expectedColumns.length) {
    const expectedNormalized = level.expectedColumns.map(normalizeColumnName);
    const extraCols = previewResult.columns.filter(column => !expectedNormalized.includes(normalizeColumnName(column)));
    dropMissionView(db, expectedViewName);
    return {
      type: FEEDBACK_WRONG_RESULT,
      message: `A view possui colunas adicionais não solicitadas: ${extraCols.join(', ')}.`,
      result: previewResult,
    };
  }

  if (!compareResults(previewResult.rows, expectedResult.rows, previewResult.columns, expectedResult.columns)) {
    dropMissionView(db, expectedViewName);
    return {
      type: FEEDBACK_WRONG_RESULT,
      message: `A prévia da view não corresponde ao relatório esperado. Foram retornadas ${previewResult.rowCount} linha(s), mas eram esperadas ${expectedResult.rowCount}.`,
      result: previewResult,
    };
  }

  const missingConcepts = findMissingConcepts(sql, level.requiredConcepts);
  if (missingConcepts.length > 0) {
    dropMissionView(db, expectedViewName);
    return {
      type: FEEDBACK_MISSING_CONCEPT,
      message: `A view retorna os dados corretos, mas a missão requer: ${missingConcepts.join(', ')}.`,
      result: previewResult,
      missingConcepts,
    };
  }

  return {
    type: FEEDBACK_CORRECT,
    message: `Missão concluída! ${level.explanation}`,
    result: previewResult,
  };
}

/**
 * Valida a execução de uma query contra uma missão.
 *
 * @param {string} sql query do jogador
 * @param {object} level configuração da missão (de levels.js)
 * @param {Database} db instância do SQLite
 * @returns {{type: string, message: string, result?: object, missingConcepts?: string[], missingColumns?: string[]}}
 */
export function validateLevel(sql, level, db) {
  if (level?.executionMode === 'create_view') {
    return validateCreateViewLevel(sql, level, db);
  }

  // 1. Executa a query
  const execResult = executeQuery(sql, db);

  // Se a query foi bloqueada, propaga
  if (execResult.type === 'blocked') {
    return { type: FEEDBACK_BLOCKED, message: execResult.message };
  }

  // Se houve erro de SQL
  if (execResult.type === 'error') {
    return { type: FEEDBACK_SQL_ERROR, message: execResult.message, result: execResult };
  }

  // Se a query foi executada mas retornou vazio
  if (execResult.type === 'empty') {
    return { type: FEEDBACK_WRONG_RESULT, message: 'A query não retornou nenhuma linha. Verifique se a condição está correta.', result: execResult };
  }

  // 2. Verifica colunas esperadas
  const missingCols = findMissingColumns(execResult.columns, level.expectedColumns);
  if (missingCols.length > 0) {
    return {
      type: FEEDBACK_MISSING_COLUMNS,
      message: `Colunas esperadas ausentes: ${missingCols.join(', ')}. Colunas retornadas: ${execResult.columns.join(', ')}.`,
      result: execResult,
      missingColumns: missingCols,
    };
  }

  // Verifica se há colunas extras não solicitadas
  if (execResult.columns.length > level.expectedColumns.length) {
    const expectedNormalized = level.expectedColumns.map(normalizeColumnName);
    const extraCols = execResult.columns.filter(c => !expectedNormalized.includes(normalizeColumnName(c)));
    return {
      type: FEEDBACK_WRONG_RESULT,
      message: `Sua query retornou colunas adicionais que não foram solicitadas pelo objetivo: ${extraCols.join(', ')}. Certifique-se de retornar apenas as colunas: ${level.expectedColumns.join(', ')}.`,
      result: execResult,
    };
  }

  // 3. Executa a query de referência para obter o resultado esperado
  const refResult = executeQuery(level.referenceQuery, db);
  if (refResult.type !== 'ok') {
    // Se a query de referência falhar, é um bug nos dados da missão
    return { type: FEEDBACK_SQL_ERROR, message: `Erro interno: a query de referência falhou. ${refResult.message}` };
  }

  // 4. Compara resultados (aceitando ordem diferente de linhas e colunas equivalentes)
  const resultsMatch = compareResults(execResult.rows, refResult.rows, execResult.columns, refResult.columns);

  if (!resultsMatch) {
    return {
      type: FEEDBACK_WRONG_RESULT,
      message: `O resultado não corresponde ao esperado. Você retornou ${execResult.rowCount} linha(s), mas o esperado era ${refResult.rowCount} linha(s).`,
      result: execResult,
    };
  }

  // 5. Verifica conceitos obrigatórios
  const missingConcepts = findMissingConcepts(sql, level.requiredConcepts);
  if (missingConcepts.length > 0) {
    return {
      type: FEEDBACK_MISSING_CONCEPT,
      message: `O resultado está correto, mas a missão requer o uso de: ${missingConcepts.join(', ')}. Tente usar esses conceitos na sua query.`,
      result: execResult,
      missingConcepts,
    };
  }

  // 6. Tudo certo!
  return {
    type: FEEDBACK_CORRECT,
    message: `Missão concluída! ${level.explanation}`,
    result: execResult,
  };
}

export { getCreatedViewName, validateCreateViewLevel };
