/**
 * ai-schema-review.js — Módulo puro do browser para revisão de schema com IA.
 *
 * O jogador clica em "Revisar com IA" e o DDL construído até o momento, junto com
 * os requisitos do desafio e o feedback do validador local, é enviado ao endpoint
 * same-origin POST /api/ai-schema-review. A resposta é sanitizada e exibida como
 * um comentário de arquiteto — nunca revela a solução completa.
 *
 * Nenhuma credencial passa por este módulo.
 */

/* --- Limites de texto --- */
const MAX_DDL_LEN = 3000;
const MAX_REQUIREMENTS_LEN = 1200;
const MAX_VALIDATION_MSG_LEN = 300;

function truncate(text, maxLen) {
  if (!text) return '';
  const s = String(text);
  if (s.length <= maxLen) return s;
  return s.substring(0, maxLen - 3) + '...';
}

/**
 * Extrai somente o mínimo necessário do feedback do validador.
 * @param {object} feedback resultado do validateSchemaChallenge
 * @returns {{type: string, message: string}|null}
 */
function extractValidationFeedback(feedback) {
  if (!feedback || typeof feedback !== 'object') return null;
  return {
    type: String(feedback.type || ''),
    message: truncate(feedback.message, MAX_VALIDATION_MSG_LEN),
  };
}

/**
 * Monta o contexto permitido para a revisão de schema.
 * Nunca inclui referenceDdl, dicas completas do desafio ou respostas anteriores.
 *
 * @param {object} params
 * @param {object} params.challenge dados do desafio ativo
 * @param {string} params.playerDdl DDL acumulado do jogador
 * @param {object|null} params.validationFeedback feedback do validador local
 * @returns {object} contexto serializado para envio
 */
export function buildReviewContext({ challenge, playerDdl, validationFeedback }) {
  if (!challenge || typeof challenge !== 'object') {
    throw new Error('challenge é obrigatório');
  }

  return {
    challenge: {
      title: String(challenge.title || ''),
      concept: String(challenge.concept || ''),
      requirements: String(challenge.requirements || ''),
      summary: String(challenge.summary || ''),
      expectedTables: Array.isArray(challenge.expectedTables) ? [...challenge.expectedTables] : [],
    },
    playerDdl: truncate(playerDdl, MAX_DDL_LEN),
    validationFeedback: extractValidationFeedback(validationFeedback),
  };
}

/**
 * Sanitiza e valida a resposta do modelo para revisão de schema.
 * Rejeita HTML, blocos de código extensos e DDL completo da solução.
 *
 * @param {string} review texto retornado pelo modelo
 * @returns {{ok: boolean, review?: string, reason?: string}}
 */
export function sanitizeModelReview(review) {
  if (!review || typeof review !== 'string') {
    return { ok: false, reason: 'empty' };
  }

  const trimmed = review.trim();

  if (trimmed.length === 0) {
    return { ok: false, reason: 'empty' };
  }

  if (trimmed.length > 800) {
    return { ok: false, reason: 'too_long' };
  }

  if (/<[a-z][\s\S]*?>/i.test(trimmed)) {
    return { ok: false, reason: 'html' };
  }

  // Rejeita blocos de código markdown (a revisão não deve entregar DDL pronto)
  if (/```[\s\S]*?```/.test(trimmed)) {
    return { ok: false, reason: 'code_block' };
  }

  // Rejeita instruções CREATE TABLE completas no corpo da resposta
  const looksLikeFullDdl = /create\s+table\s+(?:if\s+not\s+exists\s+)?["'`\[]?\w+["'`\]]?\s*\(\s*(?:["'`\[]?\w+["'`\]]?\s+(?:INT|INTEGER|TEXT|REAL|BLOB|NUMERIC|VARCHAR|CHAR|DECIMAL|BOOLEAN|DATE|DATETIME|TIMESTAMP)\b|PRIMARY\s+KEY|FOREIGN\s+KEY)/i;
  if (looksLikeFullDdl.test(trimmed)) {
    return { ok: false, reason: 'full_ddl' };
  }

  return { ok: true, review: trimmed };
}

/**
 * Faz a chamada same-origin POST /api/ai-schema-review.
 *
 * @param {object} body contexto serializado (saída de buildReviewContext)
 * @param {object} [options]
 * @param {string} [options.endpoint] URL do endpoint
 * @param {number} [options.timeoutMs] timeout em ms (default 30000)
 * @param {AbortSignal} [options.signal] signal externo para abortar
 * @param {typeof fetch} [options.fetchImpl] injeção para testes
 * @returns {Promise<{ok: boolean, review?: string, source?: string, error?: {code: string, message: string}}>}
 */
export async function requestAiSchemaReview(body, options = {}) {
  const endpoint = options.endpoint || '/api/ai-schema-review';
  const timeoutMs = options.timeoutMs || 30000;
  const fetchImpl = options.fetchImpl || ((typeof fetch !== 'undefined') ? fetch : null);

  if (!fetchImpl) {
    return { ok: false, error: { code: 'NO_FETCH', message: 'fetch não disponível.' } };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timer);
      return { ok: false, error: { code: 'ABORTED', message: 'Requisição cancelada.' } };
    }
    options.signal.addEventListener('abort', () => controller.abort());
  }

  let response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err && err.name === 'AbortError') {
      return { ok: false, error: { code: 'TIMEOUT', message: 'Tempo limite excedido.' } };
    }
    return { ok: false, error: { code: 'NETWORK_ERROR', message: 'Erro de rede.' } };
  }

  clearTimeout(timer);

  let data;
  try {
    data = await response.json();
  } catch {
    return { ok: false, error: { code: 'INVALID_JSON', message: 'Resposta inválida do servidor.' } };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: data.error || { code: 'HTTP_' + response.status, message: 'Erro do servidor.' },
    };
  }

  return {
    ok: true,
    review: data.review || '',
    source: data.source || 'ollama',
  };
}
