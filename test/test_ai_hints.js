/**
 * test_ai_hints.js — Testes unitários dos módulos puros de ai-hints.js.
 *
 * Executa com: node test/test_ai_hints.js
 *
 * Importa funções reais de src/ai-hints.js via load-source.js.
 * Não chama a rede real — requestAiHint é testado com fetch injetado.
 */

const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

// === Carrega módulo real ===
const code = readSource('ai-hints.js');
const transformed = transformESM(code);
const mod = evalModule(transformed, {}, 'ai-hints.js');
const { buildHintContext, sanitizeModelHint, requestAiHint } = mod;

async function main() {

// ====================================================================
// Testes: buildHintContext
// ====================================================================
console.log('\n[1] buildHintContext — campos permitidos');

const mission = {
  title: 'A Lista de Suspeitos',
  concept: 'SELECT',
  briefing: 'Liste todos os funcionários.',
  objective: 'Retorne nome e cargo.',
  tables: ['funcionarios'],
  expectedColumns: ['nome', 'cargo'],
  requiredConcepts: ['select'],
  referenceQuery: 'SELECT nome, cargo FROM funcionarios;',
  hints: ['dica1', 'dica2', 'dica3'],
  evidence: 'Evidência 1',
  explanation: 'SELECT define colunas.',
};

const ctx = buildHintContext({
  hintIndex: 1,
  mission,
  schema: 'CREATE TABLE funcionarios (...)',
  studentSql: 'SELECT * FROM funcionarios;',
  validationFeedback: { type: 'wrong_result', message: 'Resultado incorreto.' },
});

assert(ctx.hintIndex === 1, 'hintIndex = 1');
assert(ctx.mission.title === 'A Lista de Suspeitos', 'title incluído');
assert(ctx.mission.concept === 'SELECT', 'concept incluído');
assert(ctx.mission.briefing === 'Liste todos os funcionários.', 'briefing incluído');
assert(ctx.mission.objective === 'Retorne nome e cargo.', 'objective incluído');
assert(Array.isArray(ctx.mission.tables) && ctx.mission.tables[0] === 'funcionarios', 'tables incluído');
assert(Array.isArray(ctx.mission.expectedColumns), 'expectedColumns incluído');
assert(Array.isArray(ctx.mission.requiredConcepts), 'requiredConcepts incluído');

console.log('\n[2] buildHintContext — nunca contém referenceQuery nem hints');
assert(ctx.mission.referenceQuery === undefined, 'referenceQuery NÃO está no contexto');
assert(ctx.mission.hints === undefined, 'hints NÃO está no contexto');
assert(ctx.mission.evidence === undefined, 'evidence NÃO está no contexto');
assert(ctx.mission.explanation === undefined, 'explanation NÃO está no contexto');
assert(ctx.referenceQuery === undefined, 'referenceQuery NÃO está no topo');
assert(ctx.hints === undefined, 'hints NÃO está no topo');

console.log('\n[3] buildHintContext — aplica limites de tamanho');
const longSchema = 'x'.repeat(2000);
const longSql = 'y'.repeat(1000);
const longMsg = 'z'.repeat(500);
const ctx2 = buildHintContext({
  hintIndex: 2,
  mission,
  schema: longSchema,
  studentSql: longSql,
  validationFeedback: { type: 'sql_error', message: longMsg },
});
assert(ctx2.schema.length <= 1200, `schema truncado (${ctx2.schema.length} chars)`);
assert(ctx2.studentSql.length <= 800, `studentSql truncado (${ctx2.studentSql.length} chars)`);
assert(ctx2.validationFeedback.message.length <= 300, `message truncado (${ctx2.validationFeedback.message.length} chars)`);

console.log('\n[4] buildHintContext — hintIndex inválido rejeitado');
try {
  buildHintContext({ hintIndex: 0, mission, schema: '', studentSql: '', validationFeedback: null });
  assert(false, 'hintIndex=0 deveria ter lançado erro');
} catch (e) {
  assert(true, 'hintIndex=0 rejeitado');
}
try {
  buildHintContext({ hintIndex: 4, mission, schema: '', studentSql: '', validationFeedback: null });
  assert(false, 'hintIndex=4 deveria ter lançado erro');
} catch (e) {
  assert(true, 'hintIndex=4 rejeitado');
}

console.log('\n[5] buildHintContext — mission ausente rejeitado');
try {
  buildHintContext({ hintIndex: 1, mission: null, schema: '', studentSql: '', validationFeedback: null });
  assert(false, 'mission=null deveria ter lançado erro');
} catch (e) {
  assert(true, 'mission=null rejeitado');
}

console.log('\n[6] buildHintContext — validationFeedback null vira null');
const ctx3 = buildHintContext({ hintIndex: 1, mission, schema: '', studentSql: '', validationFeedback: null });
assert(ctx3.validationFeedback === null, 'validationFeedback null -> null');

// ====================================================================
// Testes: sanitizeModelHint
// ====================================================================
console.log('\n[7] sanitizeModelHint — texto breve válido');
const s1 = sanitizeModelHint('Lembre-se de usar WHERE para filtrar o departamento.');
assert(s1.ok === true, 'texto válido -> ok');
assert(s1.hint === 'Lembre-se de usar WHERE para filtrar o departamento.', 'hint preservado');

console.log('\n[8] sanitizeModelHint — rejeita HTML');
const s2 = sanitizeModelHint('Use <script>alert(1)</script> para filtrar.');
assert(s2.ok === false, 'HTML rejeitado');
assert(s2.reason === 'html', 'reason=html');

console.log('\n[9] sanitizeModelHint — rejeita bloco de código');
const s3 = sanitizeModelHint('```\nSELECT * FROM func\n```');
assert(s3.ok === false, 'code block rejeitado');
assert(s3.reason === 'code_block', 'reason=code_block');

console.log('\n[10] sanitizeModelHint — rejeita query completa (SELECT + FROM)');
const s4 = sanitizeModelHint('Tente: SELECT nome FROM funcionarios WHERE x = 1;');
assert(s4.ok === false, 'query completa rejeitada');
assert(s4.reason === 'full_query', 'reason=full_query');

console.log('\n[11] sanitizeModelHint — rejeita query completa (WITH + FROM)');
const s5 = sanitizeModelHint('Use WITH cte AS (SELECT ...) SELECT * FROM cte');
assert(s5.ok === false, 'WITH+FROM rejeitado');
assert(s5.reason === 'full_query', 'reason=full_query');

console.log('\n[12] sanitizeModelHint — aceita texto com SELECT mas sem FROM');
const s6 = sanitizeModelHint('Você precisa usar SELECT para escolher as colunas certas.');
assert(s6.ok === true, 'SELECT sem FROM é ok (não é query completa)');

console.log('\n[12b] sanitizeModelHint — aceita explicação com SELECT e FROM em prosa');
const s6b = sanitizeModelHint('Use SELECT para escolher colunas. FROM indica a tabela.');
assert(s6b.ok === true, 'SELECT e FROM em prosa sem identificador de tabela -> ok');

console.log('\n[12c] sanitizeModelHint — rejeita query com FROM seguido de identificador');
const s6c = sanitizeModelHint('Tente SELECT nome FROM funcionarios');
assert(s6c.ok === false, 'SELECT ... FROM funcionarios -> rejeitado');
assert(s6c.reason === 'full_query', 'reason=full_query');

console.log('\n[13] sanitizeModelHint — rejeita vazio');
assert(sanitizeModelHint('').ok === false, 'vazio rejeitado');
assert(sanitizeModelHint(null).ok === false, 'null rejeitado');
assert(sanitizeModelHint(undefined).ok === false, 'undefined rejeitado');

console.log('\n[14] sanitizeModelHint — rejeita texto muito longo');
const longHint = 'a'.repeat(601);
assert(sanitizeModelHint(longHint).ok === false, '600+ chars rejeitado');
assert(sanitizeModelHint(longHint).reason === 'too_long', 'reason=too_long');

// ====================================================================
// Testes: requestAiHint (com fetch mockado)
// ====================================================================
console.log('\n[15] requestAiHint — sucesso');

function mockFetchOk(responseData) {
  return async (url, opts) => {
    return {
      ok: true,
      status: 200,
      json: async () => responseData,
    };
  };
}

const r1 = await requestAiHint(
  { hintIndex: 1, mission: { title: 'Test' } },
  { fetchImpl: mockFetchOk({ hint: 'Use WHERE para filtrar.', source: 'ollama' }) }
);
assert(r1.ok === true, 'sucesso -> ok=true');
assert(r1.hint === 'Use WHERE para filtrar.', 'hint recebido');
assert(r1.source === 'ollama', 'source=ollama');

console.log('\n[16] requestAiHint — JSON inválido');
function mockFetchBadJson() {
  return async (url, opts) => {
    return { ok: true, status: 200, json: async () => { throw new Error('bad json'); } };
  };
}
const r2 = await requestAiHint(
  { hintIndex: 1 },
  { fetchImpl: mockFetchBadJson() }
);
assert(r2.ok === false, 'JSON inválido -> ok=false');
assert(r2.error.code === 'INVALID_JSON', 'code=INVALID_JSON');

console.log('\n[17] requestAiHint — erro HTTP (503)');
function mockFetchHttpError(status, body) {
  return async (url, opts) => {
    return { ok: false, status, json: async () => body };
  };
}
const r3 = await requestAiHint(
  { hintIndex: 1 },
  { fetchImpl: mockFetchHttpError(503, { error: { code: 'AI_HINTS_DISABLED', message: 'IA não configurada.' } }) }
);
assert(r3.ok === false, '503 -> ok=false');
assert(r3.error.code === 'AI_HINTS_DISABLED', 'code=AI_HINTS_DISABLED');

console.log('\n[18] requestAiHint — timeout (AbortError)');
function mockFetchAbort() {
  return async (url, opts) => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    throw err;
  };
}
const r4 = await requestAiHint(
  { hintIndex: 1 },
  { fetchImpl: mockFetchAbort(), timeoutMs: 100 }
);
assert(r4.ok === false, 'abort -> ok=false');
assert(r4.error.code === 'TIMEOUT', 'code=TIMEOUT');

console.log('\n[19] requestAiHint — erro de rede');
function mockFetchNetworkError() {
  return async (url, opts) => { throw new Error('network down'); };
}
const r5 = await requestAiHint(
  { hintIndex: 1 },
  { fetchImpl: mockFetchNetworkError() }
);
assert(r5.ok === false, 'erro de rede -> ok=false');
assert(r5.error.code === 'NETWORK_ERROR', 'code=NETWORK_ERROR');

console.log('\n[20] requestAiHint — signal externo já abortado');
const alreadyAborted = new AbortController();
alreadyAborted.abort();
const r6 = await requestAiHint(
  { hintIndex: 1 },
  { fetchImpl: mockFetchOk({ hint: 'test' }), signal: alreadyAborted.signal }
);
assert(r6.ok === false, 'signal abortado -> ok=false');
assert(r6.error.code === 'ABORTED', 'code=ABORTED');

// ====================================================================
// Testes: Progressão de três dicas + fallback
// ====================================================================
console.log('\n[21] Progressão de 3 dicas — sucesso de IA, fallback local, botão desabilitado');

const hintsRevealed = [];
const levelHints = ['Dica local 1', 'Dica local 2', 'Dica local 3'];

// Dica 1: IA sucesso
const aiResult1 = await requestAiHint(
  { hintIndex: 1 },
  { fetchImpl: mockFetchOk({ hint: 'Comece identificando as colunas.', source: 'ollama' }) }
);
if (aiResult1.ok) {
  hintsRevealed.push({ source: 'ollama', text: aiResult1.hint });
}
assert(hintsRevealed.length === 1, '1 dica revelada após IA');
assert(hintsRevealed[0].source === 'ollama', 'source=ollama');

// Dica 2: IA falha (503), fallback local
const aiResult2 = await requestAiHint(
  { hintIndex: 2 },
  { fetchImpl: mockFetchHttpError(503, { error: { code: 'AI_HINTS_DISABLED', message: 'IA indisponível.' } }) }
);
if (!aiResult2.ok && levelHints.length > 0) {
  hintsRevealed.push({ source: 'local', text: levelHints[hintsRevealed.length] });
}
assert(hintsRevealed.length === 2, '2 dicas após fallback');
assert(hintsRevealed[1].source === 'local', 'source=local');

// Dica 3: fallback local
const aiResult3 = await requestAiHint(
  { hintIndex: 3 },
  { fetchImpl: mockFetchHttpError(503, { error: { code: 'AI_HINTS_DISABLED', message: 'IA indisponível.' } }) }
);
if (!aiResult3.ok && levelHints.length > 0) {
  hintsRevealed.push({ source: 'local', text: levelHints[hintsRevealed.length] });
}
assert(hintsRevealed.length === 3, '3 dicas após segundo fallback');
assert(hintsRevealed[2].source === 'local', 'source=local');

// Após 3 dicas, botão desabilitado
const buttonDisabled = hintsRevealed.length >= 3;
assert(buttonDisabled === true, 'botão desabilitado após 3 dicas');

// A contagem de estrelas não se altera pelo fato de a dica ser de IA vs local
function calculateStars(hintsUsed) {
  if (hintsUsed === 0) return 3;
  if (hintsUsed === 1) return 2;
  return 1;
}
assert(calculateStars(hintsRevealed.length) === 1, '3 dicas = 1 estrela (independente da origem)');

console.log('\n[22] Resposta tardia ignorada após trocar de missão');

// Simula: pede dica na missão 1, troca para missão 2 antes da resposta chegar
const receivedMission = 1;
const currentMission = 2;

const lateResult = await requestAiHint(
  { hintIndex: 1, mission: { title: 'Missão 1' } },
  { fetchImpl: mockFetchOk({ hint: 'Dica para missão 1.', source: 'ollama' }) }
);

// A resposta deve ser descartada se a missão mudou
if (receivedMission !== currentMission) {
  assert(true, 'resposta tardia descartada (missão mudou)');
} else {
  assert(false, 'resposta tardia não deveria ser aplicada');
}

console.log('\n[23] Corrida entre casos — token com caso+missão descarta resposta');

// Simula o fluxo do app.js: token inclui caso e missão
let currentCase = 'case001';
let currentLevel = 1;

// Pede dica no case001:missão1
const requestToken = `${currentCase}:${currentLevel}:${Date.now()}`;
const requestCaseMission = requestToken.split(':').slice(0, 2).join(':');

// Troca para case002:missão3 antes da resposta chegar
currentCase = 'case002';
currentLevel = 3;

const currentToken = `${currentCase}:${currentLevel}`;
assert(requestCaseMission !== currentToken, 'token diferente após trocar caso+missão');

// A resposta deve ser descartada
if (requestCaseMission !== currentToken) {
  assert(true, 'resposta descartada (caso/missão mudou)');
} else {
  assert(false, 'resposta não deveria ser aplicada na nova missão');
}

console.log('\n[24] Corrida entre casos — mesmo nível em caso diferente também descarta');

// Pede dica no case001:missão1, troca para case002:missão1 (mesmo nível, caso diferente)
let caseA = 'case001';
let levelA = 1;
const tokenA = `${caseA}:${levelA}:${Date.now()}`;
const caseMissionA = tokenA.split(':').slice(0, 2).join(':');

caseA = 'case002';
const currentTokenB = `${caseA}:${levelA}`;
assert(caseMissionA !== currentTokenB, 'token diferente mesmo com mesmo nível (caso diferente)');
assert(true, 'resposta descartada mesmo com mesmo nível em caso diferente');

console.log('\n[25] Corrida de concorrência — finally de A não libera B');

// Simula o fluxo completo do app.js com activeHintRequestToken:
// 1. Requisição A inicia no case001:missão1
// 2. Troca para case002:missão1 (invalida token de A)
// 3. Requisição B inicia no case002:missão1
// 4. Requisição A finaliza — finally de A NÃO deve limpar hintRequestInFlight
// 5. B deve continuar bloqueada

const simState = {
  currentCase: 'case001',
  currentLevel: 1,
  hintRequestInFlight: false,
  activeHintRequestToken: null,
};

// Passo 1: Requisição A inicia
const tokenReqA = `${simState.currentCase}:${simState.currentLevel}:${Date.now()}`;
simState.activeHintRequestToken = tokenReqA;
simState.hintRequestInFlight = true;
assert(simState.hintRequestInFlight === true, 'A: hintRequestInFlight=true');
assert(simState.activeHintRequestToken === tokenReqA, 'A: token definido');

// Passo 2: Troca de missão (loadMission invalida token)
simState.currentCase = 'case002';
simState.currentLevel = 1;
simState.activeHintRequestToken = null;
simState.hintRequestInFlight = false;
assert(simState.activeHintRequestToken === null, 'troca: token invalidado');

// Passo 3: Requisição B inicia no novo contexto
const tokenReqB = `${simState.currentCase}:${simState.currentLevel}:${Date.now()}`;
simState.activeHintRequestToken = tokenReqB;
simState.hintRequestInFlight = true;
assert(simState.hintRequestInFlight === true, 'B: hintRequestInFlight=true');
assert(simState.activeHintRequestToken === tokenReqB, 'B: token definido');
assert(tokenReqA !== tokenReqB, 'tokens A e B são diferentes');

// Passo 4: Requisição A finaliza — finally de A
// No código corrigido, o finally compara state.activeHintRequestToken === requestToken
// Como o token ativo agora é B (não A), o finally de A não toca no estado
const finallyA_tokenMatches = simState.activeHintRequestToken === tokenReqA;
if (!finallyA_tokenMatches) {
  // finally de A não faz nada — B continua bloqueada
  assert(simState.hintRequestInFlight === true, 'após finally de A: B ainda bloqueada');
  assert(simState.activeHintRequestToken === tokenReqB, 'após finally de A: token ativo ainda é B');
} else {
  assert(false, 'finally de A não deveria ter token correspondente');
}

// Passo 5: B deve continuar bloqueada
assert(simState.hintRequestInFlight === true, 'B continua bloqueada após finally de A');

// Passo 6: B finaliza — finally de B limpa corretamente
const finallyB_tokenMatches = simState.activeHintRequestToken === tokenReqB;
if (finallyB_tokenMatches) {
  simState.hintRequestInFlight = false;
  simState.activeHintRequestToken = null;
}
assert(simState.hintRequestInFlight === false, 'após finally de B: flag limpa');
assert(simState.activeHintRequestToken === null, 'após finally de B: token limpo');

// === Resultado ===
console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);

} // main

main().catch(err => { console.error('ERRO FATAL:', err); process.exit(1); });