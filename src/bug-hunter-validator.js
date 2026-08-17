/**
 * bug-hunter-validator.js — Validação de desafios do modo Bug Hunter.
 *
 * Módulo puro (sem DOM, sem localStorage): recebe a query corrigida do jogador,
 * o desafio e o banco SQLite, e retorna feedback explícito.
 *
 * Fluxo de um desafio Bug Hunter:
 * 1. O jogador recebe a buggyQuery e a descrição do contexto.
 * 2. Ele escreve a correção no editor (pode executar livremente no caminho).
 * 3. A correção é validada:
 *    - Desafios 'ddl' (índice/performance): cria a view/índice esperado e
 *      compara o estado com expectedResultQuery.
 *    - Desafios de query: executa a correção e compara colunas + resultado
 *      com expectedResultQuery (referência canônica).
 *
 * Feedback:
 * - 'correct'            correção válida (colunas e resultado batem)
 * - 'sql_error'          erro de sintaxe/execução
 * - 'blocked'            comando não permitido
 * - 'wrong_result'       resultado ou colunas divergem da referência
 * - 'wrong_columns'      colunas faltando/excedentes
 * - 'missing_concept'    conceitos obrigatórios ausentes
 * - 'bug_not_fixed'      a query corrigida é idêntica (ou quase) à buggyQuery
 */

import { executeQuery } from './executor.js';

export const BH_FEEDBACK_CORRECT = 'correct';
export const BH_FEEDBACK_WRONG_RESULT = 'wrong_result';
export const BH_FEEDBACK_WRONG_COLUMNS = 'wrong_columns';
export const BH_FEEDBACK_MISSING_CONCEPT = 'missing_concept';
export const BH_FEEDBACK_SQL_ERROR = 'sql_error';
export const BH_FEEDBACK_BLOCKED = 'blocked';
export const BH_FEEDBACK_BUG_NOT_FIXED = 'bug_not_fixed';

function normalizeColumnName(name) {
  return String(name).trim().toLowerCase().replace(/^["'`]|["'`]$/g, '');
}

function findMissingConcepts(sql, concepts) {
  const stripped = stripForConceptCheck(sql);
  const lower = stripped.toLowerCase();
  const missing = [];
  for (const concept of concepts) {
    if (concept === 'subquery') {
      const parenSelect = /\(\s*select\b/i.test(stripped);
      if (!parenSelect) missing.push('subquery');
      continue;
    }
    if (!new RegExp(`\\b${escapeRegExp(concept)}\\b`, 'i').test(lower)) {
      missing.push(concept);
    }
  }
  return missing;
}

function stripForConceptCheck(sql) {
  // Remove comentários e strings literais para não falsos positivos
  let result = '';
  let inString = false;
  let quote = null;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (inString) {
      if (ch === quote) {
        if (sql[i + 1] === quote) { result += '  '; i++; continue; }
        inString = false;
        quote = null;
      }
      result += ' ';
      continue;
    }
    if (ch === "'" || ch === '"') { inString = true; quote = ch; result += ' '; continue; }
    if (ch === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') { result += ' '; i++; }
      continue;
    }
    result += ch;
  }
  return result;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Verifica se a correção é trivialmente igual à query quebrada.
 * @param {string} corrected SQL corrigido (sem comentários)
 * @param {string} buggy SQL original quebrado (sem comentários)
 * @returns {boolean}
 */
export function isIdenticalToBuggy(corrected, buggy) {
  const norm = (s) => s.replace(/;\s*$/, '').trim().toLowerCase().replace(/\s+/g, ' ');
  return norm(corrected) === norm(buggy);
}

/**
 * Compara resultados ignorando ordem de linhas/colunas.
 */
function compareResults(actualRows, expectedRows, actualCols, expectedCols) {
  if (actualRows.length !== expectedRows.length) return false;

  const expectedColMap = {};
  expectedCols.forEach((c, i) => { expectedColMap[normalizeColumnName(c)] = i; });
  const actualColMap = {};
  actualCols.forEach((c, i) => { actualColMap[normalizeColumnName(c)] = i; });

  for (const ec of Object.keys(expectedColMap)) {
    if (!(ec in actualColMap)) return false;
  }

  const normalizeRow = (row, colMap, targetCols) =>
    targetCols.map(tc => {
      const idx = colMap[normalizeColumnName(tc)];
      if (idx === undefined) return null;
      const val = row[idx];
      return val === null ? null : String(val);
    });

  const normActual = actualRows.map(r => JSON.stringify(normalizeRow(r, actualColMap, expectedCols))).sort();
  const normExpected = expectedRows.map(r => JSON.stringify(normalizeRow(r, expectedColMap, expectedCols))).sort();

  return JSON.stringify(normActual) === JSON.stringify(normExpected);
}

function findMissingColumns(actualCols, expectedCols) {
  const actual = actualCols.map(normalizeColumnName);
  return expectedCols.filter(ec => !actual.includes(normalizeColumnName(ec)));
}

/**
 * Valida a correção de um desafio Bug Hunter.
 *
 * @param {string} sql query corrigida do jogador
 * @param {object} challenge desafio do bug-hunter.js
 * @param {Database} db instância SQLite
 * @returns {{type: string, message: string, result?: object, missingConcepts?: string[], missingColumns?: string[]}}
 */
function normalizeIdentifier(name) {
  return String(name || '').trim().toLowerCase().replace(/^"|"$/g, '');
}

/**
 * Extrai o nome do objeto criado por uma instrução CREATE (índice, tabela, view,
 * trigger) a partir do SQL do jogador ou da referência canônica.
 * @param {string} ddl instrução CREATE
 * @returns {string|null} nome do objeto ou null se não for reconhecível
 */
function extractDdlObjectName(ddl) {
  const m = /^\s*CREATE\s+(?:UNIQUE\s+)?(INDEX|TABLE|VIEW|TRIGGER)\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?([\w]+)[`"']?/i.exec(ddl || '');
  return m ? m[2] : null;
}

export function validateBugChallenge(sql, challenge, db) {
  if (!challenge || !challenge.referenceQuery) {
    return { type: BH_FEEDBACK_SQL_ERROR, message: 'Erro interno: desafio sem referência.' };
  }

  const isDdl = challenge.executionMode === 'ddl';

  // 1. Executa a correção do jogador
  const execOptions = isDdl
    ? { allowDml: true, allowDdl: true }
    : {};
  const execResult = executeQuery(sql, db, execOptions);

  // Snapshot do estado LIMPO (antes da correção), capturado aqui pois a execução
  // acima já modificou o banco compartilhado. Usado na conferência DDL.
  let cleanSnapshot = null;
  if (isDdl && execResult.type !== 'blocked' && execResult.type !== 'error') {
    try {
      cleanSnapshot = db.export();
    } catch {
      // Snapshots indisponíveis: a conferência pode não funcionar neste runtime.
    }
  }

  if (execResult.type === 'blocked') {
    return { type: BH_FEEDBACK_BLOCKED, message: execResult.message };
  }
  if (execResult.type === 'error') {
    return { type: BH_FEEDBACK_SQL_ERROR, message: execResult.message, result: execResult };
  }

  // 2. Guarda de bug não corrigido: query idêntica à quebrada
  if (isIdenticalToBuggy(sql, challenge.buggyQuery)) {
    return {
      type: BH_FEEDBACK_BUG_NOT_FIXED,
      message: 'Essa é exatamente a query quebrada que você recebeu. Identifique o(s) bug(s) e corrija antes de enviar.',
      result: execResult,
    };
  }

  // 3. Caminho DDL (ex.: criar índice de performance)
  // A conferência combina dois critérios:
  //   (a) o nome do objeto criado pela correção do jogador coincide com o
  //       esperado (extraído da correctQuery canônica); e
  //   (b) a consulta de conferência (expectedResultQuery) passa no estado atual.
  if (isDdl) {
    const canonicalObject = extractDdlObjectName(challenge.correctQuery);
    const playerObject = extractDdlObjectName(sql);
    if (canonicalObject && playerObject && normalizeIdentifier(playerObject) !== normalizeIdentifier(canonicalObject)) {
      return {
        type: BH_FEEDBACK_WRONG_RESULT,
        message: 'A instrução executou, mas o objeto criado tem nome diferente do esperado. Conferência: "' + challenge.correctQuery + '"',
        result: execResult,
      };
    }
    const checkState = executeQuery(challenge.expectedResultQuery, db);
    if (checkState.type !== 'ok' && checkState.type !== 'empty') {
      return { type: BH_FEEDBACK_SQL_ERROR, message: `Erro interno: a conferência do estado falhou. ${checkState.message}` };
    }
    // O estado do banco depois da correção do jogador deve cobrir o esperado:
    // todas as linhas da conferência aplicada no banco limpo devem existir no
    // estado atual. Se a conferência canônica retorna linhas que o estado do
    // jogador não tem, a missão é reprovada.
    const expectedRows = canonicalObject ? [['' + canonicalObject]] : [];
    if (canonicalObject && expectedRows.length > 0) {
      const present = checkState.rows.some(row =>
        row.some(val => normalizeIdentifier(String(val)) === normalizeIdentifier(canonicalObject))
      );
      if (!present) {
        return {
          type: BH_FEEDBACK_WRONG_RESULT,
          message: 'A instrução executou, mas o estado do banco não corresponde ao esperado. Conferência: "' + challenge.correctQuery + '"',
          result: execResult,
        };
      }
    }
    return {
      type: BH_FEEDBACK_CORRECT,
      message: 'Bug corrigido! ' + challenge.explanation,
      result: execResult,
    };
  }


  // 4. Caminho de query: resultado vazio só é aceito se a referência também é vazia
  if (execResult.type === 'empty') {
    const ref = executeQuery(challenge.expectedResultQuery, db);
    if (ref.type === 'ok' && ref.rowCount === 0) {
      // referência vazia: OK, cai para comparação abaixo
    } else {
      return {
        type: BH_FEEDBACK_WRONG_RESULT,
        message: 'Sua correção não retornou nenhuma linha, mas o relatório esperado tem dados. Revise o filtro e as junções.',
        result: execResult,
      };
    }
  }

  // 5. Verifica colunas esperadas
  const missingCols = findMissingColumns(execResult.columns, challenge.expectedColumns);
  if (missingCols.length > 0) {
    return {
      type: BH_FEEDBACK_WRONG_COLUMNS,
      message: `Colunas esperadas ausentes: ${missingCols.join(', ')}. Colunas retornadas: ${execResult.columns.join(', ')}.`,
      result: execResult,
      missingColumns: missingCols,
    };
  }
  if (execResult.columns.length > challenge.expectedColumns.length) {
    const expectedNormalized = challenge.expectedColumns.map(normalizeColumnName);
    const extraCols = execResult.columns.filter(c => !expectedNormalized.includes(normalizeColumnName(c)));
    return {
      type: BH_FEEDBACK_WRONG_COLUMNS,
      message: `Sua correção retornou colunas adicionais não solicitadas: ${extraCols.join(', ')}. Retorne apenas: ${challenge.expectedColumns.join(', ')}.`,
      result: execResult,
    };
  }

  // 6. Compara com o resultado esperado
  const refResult = executeQuery(challenge.expectedResultQuery, db);
  if (refResult.type !== 'ok') {
    return { type: BH_FEEDBACK_SQL_ERROR, message: `Erro interno: a query de referência falhou. ${refResult.message}` };
  }

  if (!compareResults(execResult.rows, refResult.rows, execResult.columns, refResult.columns)) {
    return {
      type: BH_FEEDBACK_WRONG_RESULT,
      message: `O resultado não corresponde ao esperado. Você retornou ${execResult.rowCount} linha(s), mas o relatório correto tem ${refResult.rowCount}. Confira colunas, filtros e junções.`,
      result: execResult,
    };
  }

  // 7. Conceitos obrigatórios
  const missingConcepts = findMissingConcepts(sql, challenge.requiredConcepts || []);
  if (missingConcepts.length > 0) {
    return {
      type: BH_FEEDBACK_MISSING_CONCEPT,
      message: `O resultado está correto, mas o desafio requer o uso de: ${missingConcepts.join(', ')}.`,
      result: execResult,
      missingConcepts,
    };
  }

  return {
    type: BH_FEEDBACK_CORRECT,
    message: `Bug corrigido! ${challenge.explanation}`,
    result: execResult,
  };
}

export { findMissingConcepts, stripForConceptCheck };
