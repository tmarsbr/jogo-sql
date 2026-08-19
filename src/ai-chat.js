/**
 * ai-chat.js — Módulo puro do browser para o chat de dúvidas com a IA (Gemini).
 *
 * Depois da primeira dica revelada, o jogador pode escrever perguntas livres sobre
 * a missão. O contexto enviado é o mesmo permitido para as dicas (missão, schema,
 * tentativa atual e dicas já reveladas), acrescido do histórico da conversa.
 *
 * buildChatContext: monta e trunca o contexto permitido.
 * sanitizeChatReply: valida a resposta do modelo, rejeitando HTML e query completa.
 * requestAiChat: faz a chamada same-origin POST /api/ai-chat e normaliza erros.
 *
 * Nenhuma credencial passa por este módulo.
 */

/* --- Limites de texto --- */
const MAX_SCHEMA_LEN = 1200;
const MAX_STUDENT_SQL_LEN = 800;
const MAX_HINT_LEN = 400;
const MAX_HISTORY_TEXT_LEN = 600;

export const MAX_CHAT_HISTORY = 10;
export const MAX_QUESTION_LEN = 500;

const VALID_MODES = ['mission', 'schema', 'bug'];

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
 * Normaliza uma dica revelada (string ou { source, text }) em texto puro.
 * @param {string|{text: string}} hint
 * @returns {string}
 */
function hintText(hint) {
  if (typeof hint === 'string') return hint;
  if (hint && typeof hint === 'object' && typeof hint.text === 'string') return hint.text;
  return '';
}

/**
 * Monta o contexto permitido para uma pergunta do chat.
 *
 * NUNCA inclui referenceQuery, referenceDdl, dicas ainda não reveladas, conteúdo de
 * outras missões, progresso do jogador ou dados das tabelas.
 *
 * @param {object} params
 * @param {string} [params.mode] 'mission' | 'schema' | 'bug'
 * @param {object} params.mission dados da missão/desafio ativo
 * @param {string} [params.schema] texto do schema ativo
 * @param {string} [params.studentSql] tentativa atual do jogador
 * @param {(string|object)[]} [params.hintsRevealed] dicas já reveladas
 * @param {{role: string, text: string}[]} [params.history] histórico da conversa
 * @param {string} params.question pergunta do jogador
 * @returns {object} contexto serializado para envio
 */
export function buildChatContext({ mode, mission, schema, studentSql, hintsRevealed, history, question }) {
  if (!mission || typeof mission !== 'object') {
    throw new Error('mission é obrigatório');
  }

  const text = String(question == null ? '' : question).trim();
  if (!text) {
    throw new Error('question é obrigatório');
  }

  const normalizedHistory = (Array.isArray(history) ? history : [])
    .filter(item => item && (item.role === 'user' || item.role === 'model'))
    .filter(item => typeof item.text === 'string' && item.text.trim().length > 0)
    .slice(-MAX_CHAT_HISTORY)
    .map(item => ({ role: item.role, text: truncate(item.text.trim(), MAX_HISTORY_TEXT_LEN) }));

  const normalizedHints = (Array.isArray(hintsRevealed) ? hintsRevealed : [])
    .map(hintText)
    .filter(item => item.trim().length > 0)
    .slice(-3)
    .map(item => truncate(item.trim(), MAX_HINT_LEN));

  return {
    mode: VALID_MODES.includes(mode) ? mode : 'mission',
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
    hintsRevealed: normalizedHints,
    history: normalizedHistory,
    question: truncate(text, MAX_QUESTION_LEN),
  };
}

/**
 * Sanitiza e valida a resposta do chat.
 * Rejeita HTML, blocos de código e padrões de query completa — as mesmas regras
 * das dicas, com limite de texto maior porque a resposta é conversacional.
 *
 * @param {string} reply texto retornado pelo modelo
 * @returns {{ok: boolean, reply?: string, reason?: string}}
 */
export function sanitizeChatReply(reply) {
  if (!reply || typeof reply !== 'string') {
    return { ok: false, reason: 'empty' };
  }

  const trimmed = reply.trim();

  if (trimmed.length === 0) {
    return { ok: false, reason: 'empty' };
  }

  if (trimmed.length > 1200) {
    return { ok: false, reason: 'too_long' };
  }

  if (/<[a-z][\s\S]*?>/i.test(trimmed)) {
    return { ok: false, reason: 'html' };
  }

  if (/```[\s\S]*?```/.test(trimmed)) {
    return { ok: false, reason: 'code_block' };
  }

  // Mesma heurística das dicas: SELECT/WITH ... FROM <identificador> indica query pronta.
  const PROSE_WORDS = /^(indica|a|o|as|os|um|uma|tabela|coluna|dados|resultado|que|de|do|da|dos|das|no|na|nos|nas|em|para|por|com|sem|após|antes|onde|quando|como|se|então|entao|mas|porém|porem|se|é|e|ou)$/i;
  const fromMatch = trimmed.match(/\b(select|with)\b[\s\S]*?\bfrom\b\s+(\w+)/i);
  if (fromMatch && !PROSE_WORDS.test(fromMatch[2])) {
    return { ok: false, reason: 'full_query' };
  }

  return { ok: true, reply: trimmed };
}

/**
 * Faz a chamada same-origin POST /api/ai-chat.
 *
 * @param {object} body contexto serializado (saída de buildChatContext)
 * @param {object} [options]
 * @param {string} [options.endpoint] URL do endpoint (default '/api/ai-chat')
 * @param {number} [options.timeoutMs] timeout em ms (default 70000)
 * @param {AbortSignal} [options.signal] signal externo para abortar
 * @param {typeof fetch} [options.fetchImpl] injeção para testes
 * @returns {Promise<{ok: boolean, reply?: string, source?: string, error?: {code: string, message: string}}>}
 */
export async function requestAiChat(body, options = {}) {
  const endpoint = options.endpoint || '/api/ai-chat';
  const timeoutMs = options.timeoutMs || 70000;
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
    reply: data.reply || '',
    source: data.source || 'gemini',
  };
}
