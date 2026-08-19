/**
 * test_ai_chat.js — Testes unitários do módulo de chat de dúvidas (src/ai-chat.js).
 *
 * Executa com: node test/test_ai_chat.js
 *
 * Importa as funções reais via load-source.js e injeta fetch — nenhuma rede real.
 */

const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

// === Carrega o módulo real ===
const code = readSource('ai-chat.js');
const mod = evalModule(transformESM(code), {}, 'ai-chat.js');
const { buildChatContext, sanitizeChatReply, requestAiChat, MAX_CHAT_HISTORY, MAX_QUESTION_LEN } = mod;

const mission = {
  title: 'A Lista de Suspeitos',
  concept: 'SELECT',
  briefing: 'Liste os funcionários.',
  objective: 'Retorne nome e cargo.',
  tables: ['funcionarios'],
  expectedColumns: ['nome', 'cargo'],
  requiredConcepts: ['select'],
  referenceQuery: 'SELECT nome, cargo FROM funcionarios;',
  hints: ['dica1', 'dica2', 'dica3'],
};

async function main() {

// ====================================================================
// buildChatContext
// ====================================================================
console.log('\n[1] buildChatContext — envia só os campos permitidos');
const ctx = buildChatContext({
  mode: 'mission',
  mission,
  schema: 'CREATE TABLE funcionarios (id INTEGER, nome TEXT);',
  studentSql: 'SELECT * FROM funcionarios;',
  hintsRevealed: [{ source: 'gemini', text: 'Comece pelo SELECT.' }, 'Filtre com WHERE.'],
  history: [{ role: 'user', text: 'oi' }, { role: 'model', text: 'olá' }],
  question: '  por que preciso do WHERE?  ',
});
assert(ctx.mission.title === 'A Lista de Suspeitos', 'title incluído');
assert(ctx.mission.referenceQuery === undefined, 'referenceQuery NÃO enviada');
assert(ctx.mission.hints === undefined, 'hints da missão NÃO enviadas');
assert(ctx.question === 'por que preciso do WHERE?', 'pergunta normalizada');
assert(ctx.mode === 'mission', 'mode preservado');
assert(ctx.hintsRevealed.length === 2 && ctx.hintsRevealed[0] === 'Comece pelo SELECT.', 'dicas convertidas em texto');
assert(ctx.history.length === 2 && ctx.history[0].role === 'user', 'histórico preservado');

console.log('\n[2] buildChatContext — mode inválido vira mission');
assert(buildChatContext({ mode: 'hack', mission, question: 'oi' }).mode === 'mission', 'mode inválido normalizado');
assert(buildChatContext({ mode: 'schema', mission, question: 'oi' }).mode === 'schema', 'mode schema aceito');

console.log('\n[3] buildChatContext — entradas obrigatórias');
let threw = false;
try { buildChatContext({ mission: null, question: 'oi' }); } catch { threw = true; }
assert(threw, 'mission ausente lança erro');
threw = false;
try { buildChatContext({ mission, question: '   ' }); } catch { threw = true; }
assert(threw, 'pergunta vazia lança erro');

console.log('\n[4] buildChatContext — limites de tamanho');
const bigCtx = buildChatContext({
  mission,
  schema: 'x'.repeat(5000),
  studentSql: 'y'.repeat(5000),
  question: 'z'.repeat(900),
  history: new Array(30).fill(0).map((_, i) => ({ role: i % 2 === 0 ? 'user' : 'model', text: 'msg ' + i })),
  hintsRevealed: ['a', 'b', 'c', 'd', 'e'],
});
assert(bigCtx.schema.length <= 1200, 'schema truncado');
assert(bigCtx.studentSql.length <= 800, 'tentativa truncada');
assert(bigCtx.question.length <= MAX_QUESTION_LEN, 'pergunta truncada');
assert(bigCtx.history.length === MAX_CHAT_HISTORY, 'histórico limitado às últimas mensagens');
assert(bigCtx.hintsRevealed.length === 3, 'no máximo 3 dicas no contexto');

console.log('\n[5] buildChatContext — descarta mensagens inválidas do histórico');
const cleaned = buildChatContext({
  mission,
  question: 'oi',
  history: [{ role: 'system', text: 'ignorar' }, { role: 'user', text: '' }, { role: 'model', text: 'válida' }],
});
assert(cleaned.history.length === 1 && cleaned.history[0].text === 'válida', 'só mensagens válidas seguem');

// ====================================================================
// sanitizeChatReply
// ====================================================================
console.log('\n[6] sanitizeChatReply — aceita explicação em prosa');
assert(sanitizeChatReply('Pense em qual coluna identifica o setor do funcionário.').ok === true, 'prosa aceita');
assert(sanitizeChatReply('Use SELECT ... FROM indica a tabela de origem.').ok === true, 'menção didática aceita');

console.log('\n[7] sanitizeChatReply — rejeita entrega da resposta');
assert(sanitizeChatReply('SELECT nome FROM funcionarios;').ok === false, 'query completa rejeitada');
assert(sanitizeChatReply('SELECT nome FROM funcionarios;').reason === 'full_query', 'reason=full_query');
assert(sanitizeChatReply('```sql\nSELECT 1\n```').ok === false, 'bloco de código rejeitado');
assert(sanitizeChatReply('<script>alert(1)</script>').ok === false, 'HTML rejeitado');
assert(sanitizeChatReply('').ok === false, 'vazio rejeitado');
assert(sanitizeChatReply('x'.repeat(1300)).reason === 'too_long', 'resposta longa rejeitada');

// ====================================================================
// requestAiChat
// ====================================================================
console.log('\n[8] requestAiChat — sucesso');
function mockFetchOk(responseData) {
  return async () => ({ ok: true, status: 200, json: async () => responseData });
}
const ok = await requestAiChat({ question: 'oi' }, { fetchImpl: mockFetchOk({ reply: 'Pense no filtro.', source: 'gemini' }) });
assert(ok.ok === true, 'sucesso -> ok=true');
assert(ok.reply === 'Pense no filtro.', 'resposta recebida');
assert(ok.source === 'gemini', 'source=gemini');

console.log('\n[9] requestAiChat — erro do servidor é normalizado');
const httpErr = await requestAiChat({ question: 'oi' }, {
  fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({ error: { code: 'AI_HINTS_DISABLED', message: 'IA não configurada.' } }) }),
});
assert(httpErr.ok === false, 'erro -> ok=false');
assert(httpErr.error.code === 'AI_HINTS_DISABLED', 'code preservado');

console.log('\n[10] requestAiChat — JSON inválido e erro de rede');
const badJson = await requestAiChat({ question: 'oi' }, {
  fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new Error('bad json'); } }),
});
assert(badJson.error.code === 'INVALID_JSON', 'code=INVALID_JSON');
const netErr = await requestAiChat({ question: 'oi' }, {
  fetchImpl: async () => { throw new Error('offline'); },
});
assert(netErr.error.code === 'NETWORK_ERROR', 'code=NETWORK_ERROR');

console.log('\n[11] requestAiChat — timeout aborta a requisição');
const timeout = await requestAiChat({ question: 'oi' }, {
  timeoutMs: 20,
  fetchImpl: (url, opts) => new Promise((resolve, reject) => {
    opts.signal.addEventListener('abort', () => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      reject(err);
    });
  }),
});
assert(timeout.error.code === 'TIMEOUT', 'code=TIMEOUT');

console.log('\n[12] requestAiChat — signal já abortado não chama a rede');
const controller = new AbortController();
controller.abort();
let called = false;
const aborted = await requestAiChat({ question: 'oi' }, {
  signal: controller.signal,
  fetchImpl: async () => { called = true; return { ok: true, status: 200, json: async () => ({}) }; },
});
assert(aborted.error.code === 'ABORTED', 'code=ABORTED');
assert(called === false, 'fetch não foi chamado');

console.log('\n[13] requestAiChat — envia POST JSON para /api/ai-chat');
let capturedUrl = null, capturedOpts = null;
await requestAiChat({ question: 'oi' }, {
  fetchImpl: async (url, opts) => {
    capturedUrl = url; capturedOpts = opts;
    return { ok: true, status: 200, json: async () => ({ reply: 'ok' }) };
  },
});
assert(capturedUrl === '/api/ai-chat', 'endpoint same-origin');
assert(capturedOpts.method === 'POST', 'método POST');
assert(capturedOpts.headers['Content-Type'] === 'application/json', 'content-type JSON');
assert(JSON.parse(capturedOpts.body).question === 'oi', 'corpo serializado');

console.log('\n[14] Ligação com a interface — markup, ui.js e app.js');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf-8');
const uiCode = fs.readFileSync(path.join(root, 'src', 'ui.js'), 'utf-8');
const appCode = fs.readFileSync(path.join(root, 'src', 'app.js'), 'utf-8');

for (const id of ['hint-chat', 'hint-chat-log', 'hint-chat-form', 'hint-chat-input', 'btn-hint-chat-send']) {
  assert(html.includes(`id="${id}"`), `index.html tem #${id}`);
}
assert(html.indexOf('id="hint-chat"') > html.indexOf('id="sidebar-pane-hints"'), 'chat fica dentro da aba Dicas');
assert(uiCode.includes('export function renderHintChat'), 'ui.js exporta renderHintChat');
assert(uiCode.includes('export function setHintChatVisible'), 'ui.js exporta setHintChatVisible');
assert(uiCode.includes('export function setHintChatSending'), 'ui.js exporta setHintChatSending');
assert((uiCode.match(/setHintChatVisible\(revealed\.length > 0\)/g) || []).length === 3, 'os três renderizadores de dica controlam a visibilidade do chat');
assert(appCode.includes("from './ai-chat.js'"), 'app.js importa o módulo de chat');
assert(appCode.includes('sendHintChatMessage'), 'app.js envia perguntas do chat');
assert(appCode.includes('state.hintsRevealed.length === 0) return'), 'chat exige ao menos uma dica revelada');

// === Resultado ===
console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);

} // main

main().catch(err => { console.error('ERRO FATAL:', err); process.exit(1); });
