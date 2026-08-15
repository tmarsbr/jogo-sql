/**
 * ai-hints.js — Módulo puro do browser para dicas com IA via Ollama.
 *
 * buildHintContext: monta o contexto permitido a partir da missão e tentativa.
 * sanitizeModelHint: valida/limpa a resposta do modelo, rejeitando HTML e queries completas.
 * requestAiHint: faz a chamada same-origin POST /api/ai-hint e normaliza erros.
 *
 * Nenhuma credencial passa por este módulo.
 */

/* --- Limites de texto --- */
const MAX_SCHEMA_LEN = 1200;
const MAX_STUDENT_SQL_LEN = 800;
const MAX_VALIDATION_MSG_LEN = 300;

/**
 * Trunca um texto para no máximo `maxLen` caracteres, adicionando reticências.
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
function truncate(text, maxLen) {
  if (!text) return '';
  const s = String(text);
  if (s.length <= maxLen) return s;
  return s.substring(0, maxLen - 3) + '...';
}

/**
 * Extrai somente o mínimo necessário do feedback do validador.
 * @param {object} feedback resultado do validateLevel
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
 * Monta o contexto permitido para enviar ao tutor de IA.
 * Inclui somente: missão ativa, objetivo, conceitos obrigatórios, tabelas/colunas,
 * schema ativo (truncado), tentativa atual do aluno (truncada) e feedback do validador.
 *
 * NUNCA inclui referenceQuery, level.hints, conteúdo de outras missões, progresso,
 * dados inteiros das tabelas, ou resultados de referência.
 *
 * @param {object} params
 * @param {number} params.hintIndex 1, 2 ou 3
 * @param {object} params.mission dados da missão ativa
 * @param {string} params.schema texto do schema ativo
 * @param {string} params.studentSql tentativa atual do aluno
 * @param {object|null} params.validationFeedback feedback do validador
 * @returns {object} contexto serializado para envio
 */
export function buildHintContext({ hintIndex, mission, schema, studentSql, validationFeedback }) {
  const index = Number(hintIndex);
  if (!Number.isInteger(index) || index < 1 || index > 3) {
    throw new Error('hintIndex deve ser 1, 2 ou 3');
  }
  if (!mission || typeof mission !== 'object') {
    throw new Error('mission é obrigatório');
  }

  return {
    hintIndex: index,
    mission: {
      title: String(mission.title || ''),
      concept: String(mission.concept || ''),
      briefing: String(mission.briefing || ''),
      objective: String(mission.objective || ''),
      tables: Array.isArray(mission.tables) ? [...mission.tables] : [],
      expectedColumns: Array.isArray(mission.expectedColumns) ? [...mission.expectedColumns] : [],
      requiredConcepts: Array.isArray(mission.requiredConcepts) ? [...mission.requiredConcepts] : [],
    },
    schema: truncate(schema, MAX_SCHEMA_LEN),
    studentSql: truncate(studentSql, MAX_STUDENT_SQL_LEN),
    validationFeedback: extractValidationFeedback(validationFeedback),
  };
}

/**
 * Sanitiza e valida a resposta do modelo.
 * Rejeita HTML, blocos de código e padrões de query completa.
 *
 * @param {string} hint texto retornado pelo modelo
 * @returns {{ok: boolean, hint?: string, reason?: string}}
 */
export function sanitizeModelHint(hint) {
  if (!hint || typeof hint !== 'string') {
    return { ok: false, reason: 'empty' };
  }

  const trimmed = hint.trim();

  if (trimmed.length === 0) {
    return { ok: false, reason: 'empty' };
  }

  if (trimmed.length > 600) {
    return { ok: false, reason: 'too_long' };
  }

  // Rejeita tags HTML
  if (/<[a-z][\s\S]*?>/i.test(trimmed)) {
    return { ok: false, reason: 'html' };
  }

  // Rejeita blocos de código markdown (``` ... ```)
  if (/```[\s\S]*?```/.test(trimmed)) {
    return { ok: false, reason: 'code_block' };
  }

  // Rejeita padrão de query executável.
  // Heurística: SELECT/WITH ... FROM <identificador> onde o identificador após FROM
  // não é uma palavra comum de prosa em português.
  // Isso permite explicações como "use SELECT ... FROM indica a tabela" mas rejeita
  // "SELECT nome FROM funcionarios".
  const PROSE_WORDS = /^(indica|a|o|as|os|um|uma|tabela|coluna|dados|resultado|que|de|do|da|dos|das|no|na|nos|nas|em|para|por|com|sem|após|antes|onde|quando|como|se|então|entao|mas|porém|porem|se|é|e|ou)$/i;
  const fromQueryPattern = /\b(select|with)\b[\s\S]*?\bfrom\b\s+(\w+)/i;
  const fromMatch = trimmed.match(fromQueryPattern);
  if (fromMatch) {
    const tableIdent = fromMatch[2];
    // Se o identificador após FROM não é uma palavra de prosa, é provavelmente uma query
    if (!PROSE_WORDS.test(tableIdent)) {
      return { ok: false, reason: 'full_query' };
    }
  }

  return { ok: true, hint: trimmed };
}

/**
 * Faz a chamada same-origin POST /api/ai-hint.
 *
 * @param {object} body contexto serializado (saída de buildHintContext)
 * @param {object} [options]
 * @param {string} [options.endpoint] URL do endpoint (default '/api/ai-hint')
 * @param {number} [options.timeoutMs] timeout em ms (default 25000)
 * @param {AbortSignal} [options.signal] signal externo para abortar
 * @param {typeof fetch} [options.fetchImpl] injeção para testes
 * @returns {Promise<{ok: boolean, hint?: string, source?: string, error?: {code: string, message: string}}>}
 */
export async function requestAiHint(body, options = {}) {
  const endpoint = options.endpoint || '/api/ai-hint';
  const timeoutMs = options.timeoutMs || 25000;
  const fetchImpl = options.fetchImpl || ((typeof fetch !== 'undefined') ? fetch : null);

  if (!fetchImpl) {
    return { ok: false, error: { code: 'NO_FETCH', message: 'fetch não disponível.' } };
  }

  // Cria um AbortController para o timeout, encadeando com signal externo se houver
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
    hint: data.hint || '',
    source: data.source || 'ollama',
  };
}