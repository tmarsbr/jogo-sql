/**
 * test_client_real.js — Testes do modo "Cliente Real" (Consultor de Dados).
 *
 * Cobre:
 * - Dados das consultorias (cr-1, cr-2, cr-3) e registro no case-manager.
 * - Validação de clarificação (validateClarification).
 * - Validação de análise (queries corretas/erradas via validateLevel real).
 * - Heurística de relatório (evaluateReport): passed/failed por conteúdo.
 * - Score e estrelas (computeEngagementScore/computeEngagementStars).
 * - Persistência (getClientRealProgress/updateClientRealEngagement).
 * - Integração app.js: fluxo clarificar → analisar → apresentar com
 *   banco sql.js real e DOM mock (listener de clique do btn-run acionado).
 *
 * Executa com: node test/test_client_real.js
 */

const vm = require('vm');
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const {
  readSource,
  transformESM,
  evalModule,
  loadExecutor,
  loadStorage,
  loadScoring,
} = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

/* ================================================================== */
/* Mocks de ambiente                                                   */
/* ================================================================== */

class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] ?? null; }
  setItem(key, val) { this.store[key] = String(val); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

function createMockDocument(spy) {
  const elements = new Map();
  const listeners = [];
  function $(id) {
    if (!elements.has(id)) {
      const classes = new Set();
      const el = {
        id, hidden: true, dataset: {}, textContent: '', innerHTML: '',
        disabled: false, tabIndex: 0, style: {}, value: '',
        classList: {
          add: (c) => { classes.add(c); if (c === 'hidden') el.hidden = true; },
          remove: (c) => { classes.delete(c); if (c === 'hidden') el.hidden = false; },
          contains: (c) => classes.has(c),
          toggle: (c, force) => {
            const add = force === undefined ? !classes.has(c) : Boolean(force);
            if (add) classes.add(c); else classes.delete(c);
            return add;
          },
        },
        focus: () => {},
        setAttribute: (n, v) => { el[n] = String(v); },
        removeAttribute: (n) => { delete el[n]; },
        addEventListener: (type, fn) => { listeners.push({ el: id, type, fn }); },
        querySelectorAll: () => [],
        querySelector: () => null,
        appendChild: () => {},
        remove: () => {},
      };
      elements.set(id, el);
    }
    return elements.get(id);
  }
  const document = {
    readyState: 'complete',
    querySelector: (sel) => $(String(sel).replace(/^#/, '')),
    querySelectorAll: () => [],
    getElementById: (id) => {
      const el = $(id);
      if (id === 'client-real-report-input') el.value = spy.reportInput;
      return el;
    },
    addEventListener: (type, fn) => { listeners.push({ el: 'document', type, fn }); },
    dispatchEvent: (ev) => {
      for (const l of listeners) {
        if (l.el === 'document' && l.type === ev.type) { try { l.fn(ev); } catch { /* ignora */ } }
      }
    },
    createElement: (tag) => ({ tag, hidden: false, style: {}, addEventListener: () => {}, appendChild: () => {}, remove: () => {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    activeElement: null,
  };
  return { document, elements, listeners };
}

function collectImportedNames(source) {
  const names = new Set();
  const braceImport = /import\s*\{([\s\S]*?)\}\s*from\s+['"][^'"]+['"]/g;
  let match;
  while ((match = braceImport.exec(source)) !== null) {
    for (const part of match[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (name) names.add(name.trim());
    }
  }
  return [...names];
}

/* ================================================================== */
/* Módulos do modo Client Real                                         */
/* ================================================================== */

const dbSeed = evalModule(transformESM(readSource(path.join('cases', 'client-real', 'db-seed.js'))), {}, 'cases/client-real/db-seed.js');
const clientRealData = evalModule(
  [transformESM(readSource(path.join('cases', 'client-real.js')))].join('\n').replace(
    /^export\s*\{\s*SCHEMA_SQL,\s*SEED_SQL\s*\}\s*from\s*['"][^'"]+['"];?\s*$/gm,
    ''
  ),
  { SCHEMA_SQL: dbSeed.SCHEMA_SQL, SEED_SQL: dbSeed.SEED_SQL, SCHEMA_SQL_REEXPORTED: dbSeed.SCHEMA_SQL },
  'cases/client-real.js'
);
const { ENGAGEMENTS } = clientRealData;
const executorMod = loadExecutor();
const commonValidator = evalModule(
  `const executeQuery = __injected_executeQuery;\n` + transformESM(readSource('validator.js')),
  { __injected_executeQuery: executorMod.executeQuery },
  'validator.js'
);
const crValidator = evalModule(
  [
    `const executeQuery = __injected_executeQuery;`,
    `const validateLevel = __injected_validateLevel;`,
    `const FEEDBACK_CORRECT = __injected_FEEDBACK_CORRECT;`,
    `const FEEDBACK_SQL_ERROR = __injected_FEEDBACK_SQL_ERROR;`,
    `const evaluateReport = __injected_evaluateReport;`,
    transformESM(readSource('cases/client-real-validator.js')),
  ].join('\n'),
  {
    __injected_executeQuery: executorMod.executeQuery,
    __injected_validateLevel: commonValidator.validateLevel,
    __injected_FEEDBACK_CORRECT: 'correct',
    __injected_FEEDBACK_SQL_ERROR: 'sql_error',
    __injected_evaluateReport: clientRealData.evaluateReport,
  },
  'cases/client-real-validator.js'
);
// Re-expõe os helpers de estado para o crApp
const __createEngagementState = crValidator.createEngagementState;
const __normalizeEngagementState = crValidator.normalizeEngagementState;
const crApp = evalModule(
  [
    `const ENGAGEMENTS = __injected_ENGAGEMENTS;`,
    `const getEngagement = __injected_getEngagement;`,
    `const CLIENT_REAL_PREFIX = __injected_CLIENT_REAL_PREFIX;`,
    `const createEngagementState = __injected_createEngagementState;`,
    `const normalizeEngagementState = __injected_normalizeEngagementState;`,
    transformESM(readSource(path.join('cases', 'client-real-app.js'))),
  ].join('\n'),
  {
    __injected_ENGAGEMENTS: ENGAGEMENTS,
    __injected_getEngagement: clientRealData.getEngagement,
    __injected_CLIENT_REAL_PREFIX: clientRealData.CLIENT_REAL_PREFIX,
    __injected_createEngagementState: __createEngagementState,
    __injected_normalizeEngagementState: __normalizeEngagementState,
  },
  'cases/client-real-app.js'
);

function makeEngagementState(overrides = {}) {
  return {
    phase: 'clarify',
    clarificationIndex: 0,
    clarificationCorrectCount: 0,
    clarificationAttempts: 0,
    analysisIndex: 0,
    sqlErrors: 0,
    analysisAttempts: 0,
    analysisHints: [],
    reportSubmitted: false,
    reportPassed: false,
    reportAttempts: 0,
    completedAt: null,
    ...overrides,
  };
}

/* ================================================================== */
/* Carga do app.js com banco real                                      */
/* ================================================================== */

function loadApp(SQL) {
  const spy = { briefing: '', feedback: null, results: '', editor: '', reportInput: '', nextHidden: true, persistCalls: 0 };
  const { document, elements, listeners } = createMockDocument(spy);
  const localStorage = new LocalStorageMock();
  const executor = loadExecutor();
  const storage = loadStorage(localStorage);
  const scoring = loadScoring();
  const stateModule = evalModule(transformESM(readSource('state.js')), {}, 'state.js');
  const validatorModule = evalModule(
    `const executeQuery = __injected_executeQuery;\n` + transformESM(readSource('validator.js')),
    { __injected_executeQuery: executor.executeQuery }, 'validator.js'
  );
  const clientRealValidator = crValidator;
  const clientRealApp = crApp;
  const uiHelpers = evalModule(transformESM(readSource('ui.js')), {}, 'ui.js');
  const crUi = evalModule(
    [
      `const escapeHtml = __injected_escapeHtml;`,
      transformESM(readSource('cases/client-real-ui.js')),
    ].join('\n'),
    { __injected_escapeHtml: escapeHtmlSpy },
    'cases/client-real-ui.js'
  );
  function escapeHtmlSpy(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- Banco sql.js real ---
  let db = null;
  const dbApi = {
    initDB: async (caseId, { force = false } = {}) => {
      if (force || !db) {
        if (db) db.close();
        db = new SQL.Database();
        db.run('PRAGMA foreign_keys = ON;');
        db.run(dbSeed.SCHEMA_SQL);
        db.run(dbSeed.SEED_SQL);
      }
      return db;
    },
    getDB: () => db,
    getSchemaText: () => {
      if (!db) return '';
      const rows = db.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      return rows.length ? rows[0].values.map(r => r[0]).join(';\n') : '';
    },
    getSchemaDetailed: () => [],
  };

  // --- Caso ativo do modo Cliente Real ---
  const clientRealCase = {
    id: 'client-real', number: 'CR', type: 'client-real',
    title: 'Modo Cliente Real: Consultor de Dados',
    CASE_INTRO: { title: 'Intro', subtitle: 'Sub', story: '...', mission: '...' },
    CASE_CONCLUSION: { title: 'Concluído', story: '...', nextSteps: '...' },
    ENGAGEMENTS,
    getTotalLevels: clientRealData.getTotalLevels,
    getLevel: clientRealData.getLevel,
  };

  // --- Espiões da UI ---

  const appSource = readSource('app.js');
  const context = {
    document,
    window: { innerWidth: 1024, addEventListener: () => {}, SQL: null, dispatchEvent: () => {} },
    localStorage, console, setTimeout, clearTimeout, setInterval, clearInterval,
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    AbortController, AbortSignal,
    Event: class { constructor(t, o = {}) { this.type = t; this.detail = o.detail; } },
    CustomEvent: class { constructor(t, o = {}) { this.type = t; this.detail = o.detail; } },
    Error, RegExp, Array, Object, String, Number, JSON, Math, Set, Map,
    parseInt, parseFloat, isNaN, isFinite, Date, Promise, Boolean, Symbol,
    globalThis: undefined,
    __SQL_DETECTIVE_TEST__: true,
  };
  for (const name of collectImportedNames(appSource)) {
    if (!(name in context)) context[name] = () => {};
  }
  Object.assign(context, {
    state: stateModule.state,
    resetState: stateModule.resetState,
    activateCaseProgress: stateModule.activateCaseProgress,
    syncActiveCaseProgress: stateModule.syncActiveCaseProgress,
    createCaseProgress: stateModule.createCaseProgress,
    saveState: (...args) => { spy.persistCalls += 1; return storage.saveState(...args); },
    loadState: storage.loadState,
    clearState: storage.clearState,
    calculateStars: scoring.calculateStars,
    calculateScore: scoring.calculateScore,
    calculateTotalScore: scoring.calculateTotalScore,
    calculateTotalStars: scoring.calculateTotalStars,
    calculateMaxStars: scoring.calculateMaxStars,
    updateLevelProgress: scoring.updateLevelProgress,
    executeQuery: executor.executeQuery,
    initDB: dbApi.initDB,
    getDB: dbApi.getDB,
    getSchemaText: dbApi.getSchemaText,
    getSchemaDetailed: dbApi.getSchemaDetailed,
    validateLevel: validatorModule.validateLevel,
    FEEDBACK_CORRECT: 'correct',
    FEEDBACK_SQL_ERROR: 'sql_error',
    validateBugChallenge: () => ({ type: 'sql_error', message: 'não utilizado', result: null }),
    BH_FEEDBACK_CORRECT: 'correct',
    validateSchemaChallenge: () => ({ type: 'sql_error', message: 'não utilizado' }),
    executeMultipleStatements: () => ({ errors: [] }),
    findForbiddenKeyword: () => null,
    mergeSchemaStatements: () => [],
    getCreatedTableNames: () => [],
    splitStatements: () => [],
    getCreatedTableName: () => null,
    SB_FEEDBACK_CORRECT: 'correct',
    SB_FEEDBACK_BLOCKED: 'blocked',
    buildReviewContext: () => ({}),
    requestAiSchemaReview: async () => ({ ok: false }),
    initSfx: () => {}, setSfxEnabled: () => {}, isSfxEnabled: () => false,
    playTypingSound: () => {}, playAlertSound: () => {}, playSuccessSound: () => {},
    validateBossStep: () => ({ feedback: { type: 'sql_error' }, state: {} }),
    getBattle: () => null, isBattleWon: () => false, completeStep: () => ({}),
    bossElapsedMs: () => 0, winBattle: () => ({}), computeBossStars: () => 1,
    normalizeBossState: () => ({ status: 'idle' }), getActiveStep: () => null,
    initDOM: () => ({}), hideLoading: () => {}, showGlobalError: () => {},
    hideGlobalError: () => {}, setDbStatus: () => {}, setMissionStatus: () => {},
    setEditorValue: (v) => { spy.editor = String(v); },
    getEditorValue: () => spy.editor,
    clearEditor: () => { spy.editor = ''; },
    setResults: (html) => { spy.results = String(html); },
    enableEditorButtons: () => {}, enableHintButton: () => {},
    setHintButtonLoading: () => {}, setBriefing: (html) => { spy.briefing = String(html); },
    setLesson: () => {}, setSchema: () => {}, renderResults: () => {},
    renderFeedback: () => {}, renderMission: () => {}, renderHints: () => {},
    renderProgress: () => {}, renderEvidence: () => {}, renderScore: () => {},
    renderHeaderProgress: () => {}, renderMissionRail: () => {}, renderFromState: () => {},
    getCourseItemsForLevel: () => [], renderLessonHtml: () => '',
    renderGraph: () => {}, renderTimeline: () => {}, renderSuspects: () => {},
    renderCourseLessons: () => {}, showCourseLesson: () => {},
    updateLessonTabBadge: () => {}, showResetConfirm: () => {},
    showActiveCaseConclusion: () => {}, showBossVictoryModal: () => {},
    configureSidebarTabs: () => {}, activateSidebarTab: () => {}, initSidebarTabs: () => {},
    renderBossFeedback: () => {}, showBossDefeatModal: () => {}, loadBossFight: () => {},
    startBossTimer: () => {}, updateBossTimerReadout: () => {},
    renderBossRail: () => {}, renderBossHints: () => {}, renderBossEvidence: () => {},
    renderBossProgress: () => {}, isBossStepId: () => false,
    renderBugChallenge: () => {}, renderBugHints: () => {}, renderBugFeedback: () => {},
    renderBugEvidence: () => {}, renderBugProgress: () => {}, renderBugRail: () => {},
    renderSchemaChallenge: () => {}, renderSchemaHints: () => {}, renderSchemaFeedback: () => {},
    renderSchemaEvidence: () => {}, renderSchemaProgress: () => {}, renderSchemaRail: () => {},
    renderSchemaDetailed: () => {},
    renderClientRealBriefing: crUi.renderClientRealBriefing,
    renderClientRealFeedback: (fb) => { spy.feedback = fb; },
    renderClientRealReportField: (id, v) => { spy.reportInput = String(v); },
    renderClientRealReportFeedback: () => {},
    renderClientRealInsight: () => {},
    renderClientRealProgress: () => {},
    renderHeaderProgress: () => {},
    renderScore: () => {},
    setMissionStatus: (t) => { spy.missionStatus = String(t); },
    clearEditor: () => { spy.editor = ''; },
    renderResults: () => {},
    configureSidebarTabs: () => {},
    enableEditorButtons: () => {},
    enableHintButton: () => {},
    showTabs: () => {},
    hideTabs: () => {},
    renderFromState: () => {},
    persistState: () => {},
    isClientRealId: clientRealApp.isClientRealId,
    validateClientRealAnalysis: clientRealValidator.validateClientRealAnalysis,
    validateClientRealReport: clientRealValidator.validateClientRealReport,
    validateClarification: clientRealValidator.validateClarification,
    computeEngagementScore: clientRealValidator.computeEngagementScore,
    computeEngagementStars: clientRealValidator.computeEngagementStars,
    createEngagementState: clientRealValidator.createEngagementState,
    getClientRealProgress: clientRealApp.getClientRealProgress,
    updateClientRealEngagement: clientRealApp.updateClientRealEngagement,
    setClientRealProgress: clientRealApp.setClientRealProgress,
    getCaseById: () => clientRealCase,
    getAllCases: () => [clientRealCase],
    getInvestigations: () => [clientRealCase],
    getProjects: () => [],
    isCaseAvailable: () => true,
    isCaseComplete: () => false,
  });
  context.globalThis = context;
  const code = transformESM(appSource).replace(/^\s*import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?\s*$/gm, '');
  let appCode = code;
  for (const name of Object.keys(context)) {
    appCode = appCode.replace(
      new RegExp(`^const\\s+${name}\\s*=\\s*(?:'[^']*'|new Proxy\\(\\{\\}, \\{ get: \\(\\) => undefined \\}\\));\\s*$`, 'm'),
      ''
    );
  }
  vm.runInNewContext(appCode, { ...context, exports: {} }, { filename: 'app.js' });
  context.__vmContext = context;
  const runListener = listeners.find(l => l.el === 'btn-run' && l.type === 'click');
  return { app: context, state: stateModule.state, spy, listeners, elements, localStorage, dbApi, clientRealValidator };
}

/* ================================================================== */
/* Tests                                                               */
/* ================================================================== */

(async () => {
  const wasmPath = path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) });

  console.log('\n[1] Dados das consultorias e registro no case-manager');
  const { getTotalLevels, getLevel, getEngagement } = clientRealData;
  assert(ENGAGEMENTS.length === 3, 'há 3 consultorias (cr-1, cr-2, cr-3)');
  assert(getTotalLevels() === 3, 'getTotalLevels() = 3');
  assert(getLevel('cr-2') && getLevel('cr-2').id === 'cr-2', 'getLevel funciona');
  assert(getEngagement('cr-x') === null, 'getEngagement com id inválido retorna null');
  for (const e of ENGAGEMENTS) {
    assert((e.clarifications || []).length >= 1, `${e.id}: tem pergunta(s) de clarificação`);
    assert(e.clarifications.some(q => q.options.some(o => o.correct)), `${e.id}: cada pergunta tem opção correta`);
    assert((e.analyses || []).length >= 2, `${e.id}: tem ao menos 2 análises`);
    assert(e.reportPrompt && e.reportRequiredWords && e.reportAdviceWords, `${e.id}: configuração de relatório completa`);
  }

  console.log('\n[2] Validação de clarificação');
  const e1 = ENGAGEMENTS[0];
  const ok = crValidator.validateClarification(e1, 0, e1.clarifications[0].options.find(o => o.correct).id);
  const bad = crValidator.validateClarification(e1, 0, e1.clarifications[0].options.find(o => !o.correct).id);
  assert(ok.correct === true, 'opção correta validada como correta');
  assert(bad.correct === false, 'opção errada validada como incorreta');
  const outOfRange = crValidator.validateClarification(e1, 99, 'a');
  assert(outOfRange.correct === false, 'índice inválido é incorreto');

  console.log('\n[3] Validação de análise (queries) com banco real');
  const db = new SQL.Database();
  db.run(dbSeed.SCHEMA_SQL);
  db.run(dbSeed.SEED_SQL);
  const a1 = ENGAGEMENTS[0].analyses[0];
  const correct1 = crValidator.validateClientRealAnalysis(a1.referenceQuery, a1, db);
  assert(correct1.type === 'correct', 'query de referência da análise 1 é aceita');
  const wrongCol = "SELECT strftime('%Y-%m', data_venda) AS ano_mes, COUNT(*) AS total_vendas FROM vendas GROUP BY ano_mes ORDER BY ano_mes ASC;";
  const wrong1 = crValidator.validateClientRealAnalysis(wrongCol, a1, db);
  assert(wrong1.type !== 'correct', 'query com coluna/valor errado é rejeitada');
  const syntaxErr = 'SELECTT BOGUS FROM vendas;';
  const err1 = crValidator.validateClientRealAnalysis(syntaxErr, a1, db);
  assert(err1.type === 'sql_error' || err1.type === 'blocked', `query inválida é rejeitada (type: ${err1.type})`);
  const a2 = ENGAGEMENTS[0].analyses[1];
  const alt2 = crValidator.validateClientRealAnalysis(
    "SELECT v.nome AS vendedor, COALESCE(SUM(ve.valor_centavos), 0) AS valor_realizado_centavos, m.meta_centavos FROM vendedores v JOIN metas_mensais m ON m.vendedor_id = v.id AND m.ano_mes = '2024-03' LEFT JOIN vendas ve ON ve.vendedor_id = v.id AND ve.data_venda BETWEEN '2024-03-01' AND '2024-03-31' GROUP BY v.nome, m.meta_centavos ORDER BY valor_realizado_centavos DESC;",
    a2, db
  );
  assert(alt2.type === 'correct', 'variação semântica equivalente da análise 2 é aceita');

  console.log('\n[4] Heurística de relatório (comunicação técnica)');
  const good1 = `As vendas estão boas e crescendo: o faturamento subiu de R$ 23.450 nos primeiros meses para R$ 30.700 em março, um crescimento de 31%. O Lucas bateu a meta com R$ 13.300, mas a Fernanda vendeu apenas R$ 1.700, ficando abaixo da meta. Sugiro montar um plano de acompanhamento do desempenho dela nas próximas semanas.`;
  assert(clientRealData.evaluateReport(good1, e1).passed === true, 'cr-1: relatório completo com dados + recomendação passa');
  const vague = `Acho que as vendas estão mais ou menos boas. Deve estar tudo certo, acho que sim.`;
  assert(clientRealData.evaluateReport(vague, e1).passed === false, 'cr-1: relatório vago com múltiplos sinais falha');
  assert(clientRealData.evaluateReport(`Tudo bem.`, e1).passed === false, 'cr-1: relatório curto demais falha');
  const noAdvice = `O faturamento foi de R$ 30.700 em março, acima dos R$ 23.450 de janeiro. A Fernanda ficou abaixo da meta de R$ 3.000.`;
  assert(clientRealData.evaluateReport(noAdvice, e1).passed === false, 'cr-1: números sem recomendação falham');
  const good2 = `O Sudeste lidera com faturamento de R$ 39.750 no trimestre. O Lucas é o top vendedor com R$ 32.750, uma participação de 42% do total. Essa dependência de um só vendedor é um risco: sugiro investir no treinamento do restante do time.`;
  assert(clientRealData.evaluateReport(good2, ENGAGEMENTS[1]).passed === true, 'cr-2: relatório completo passa');
  const good3 = `O desconto médio do Sul é 4,56%, abaixo do Norte (7,00%) e acima do Sudeste (2,82%). A Fernanda, no Norte, dá os maiores descontos e é quem menos fatura. Recomendo criar um limite de desconto por região e monitorar a margem nas próximas semanas.`;
  assert(clientRealData.evaluateReport(good3, ENGAGEMENTS[2]).passed === true, 'cr-3: relatório completo passa');
  const good3SqlNotation = `O desconto médio do Sul é 4.56%, abaixo do Norte (7.00%) e acima do Sudeste (2.82%). A Fernanda, no Norte, dá os maiores descontos e é quem menos fatura. Recomendo criar um limite de desconto por região e monitorar a margem.`;
  assert(clientRealData.evaluateReport(good3SqlNotation, ENGAGEMENTS[2]).passed === true, 'cr-3: aceita decimais na notação do SQLite');

  console.log('\n[5] Score e estrelas');
  const perfect = crValidator.computeEngagementScore(makeEngagementState(), e1);
  assert(perfect.score === 1000, 'score perfeito = 1000');
  assert(crValidator.computeEngagementStars(1000) === 3, '3 estrelas com score 1000');
  const penalized = crValidator.computeEngagementScore(makeEngagementState({ sqlErrors: 3, reportAttempts: 2 }), e1);
  assert(penalized.score < 1000 && penalized.score >= 300, `score penalizado entre 300 e 999 (atual: ${penalized.score})`);
  const bonus = crValidator.computeEngagementScore(makeEngagementState({ clarificationCorrectCount: 2, sqlErrors: 0, reportAttempts: 1 }), e1);
  assert(bonus.score === 1200, `bônus de comunicação aplicado (atual: ${bonus.score})`);
  assert(bonus.perfectCommunication === true, 'perfectCommunication = true em cenário impecável');

  console.log('\n[6] Persistência (progressByCase)');
  const progressByCase = { 'client-real': {} };
  crApp.updateClientRealEngagement(progressByCase, 'cr-1', (s) => ({
    ...(crValidator.createEngagementState()),
    ...s,
    phase: 'analyze',
  }));
  assert(progressByCase['client-real'].byId['cr-1'].phase === 'analyze', 'estado persistido em byId');
  assert(crApp.getClientRealEngagementIds().includes('cr-3'), 'getClientRealEngagementIds inclui cr-3');
  assert(crApp.isClientRealId('cr-2') === true, 'isClientRealId cr-2 = true');
  assert(crApp.isClientRealId('bug-1') === false, 'isClientRealId bug-1 = false');

  console.log('\n[7] Integração app.js: fluxo completo com DOM mock');
  const env = loadApp(SQL);
  assert(typeof env.listeners.find(l => l.el === 'btn-run')?.fn === 'function', 'listener de clique do btn-run existe');
  // Ativa o caso client-real e carrega a consultoria 1
  const { state } = env;
  env.app.initDB('client-real');
  state.currentCase = 'client-real';
  env.app.__SQLDetectiveApp.loadClientRealChallenge('cr-1');
  assert(state.currentLevel === 'cr-1', 'loadClientRealChallenge define currentLevel = cr-1');
  assert(env.spy.briefing.includes('Sérgio'), 'briefing mostra o cliente da consultoria 1');
  assert(env.spy.briefing.includes('CLIENTE NA SALA'), 'fase clarify exibida no briefing');
  // Responde a clarificação correta via handler de delegação
  const docClick = env.listeners.find(l => l.el === 'document' && l.type === 'click' && l.fn.toString().includes('handleClientReal'));
  const wrongOpt = ENGAGEMENTS[0].clarifications[0].options.find(o => !o.correct);
  const persistBeforeWrongClarification = env.spy.persistCalls;
  docClick.fn({ target: { closest: (sel) => (sel === '[data-cr-answer]' ? { dataset: { crAnswer: `cr-1|0|${wrongOpt.id}` } } : null) } });
  assert(env.app.getClientRealProgress(state.progressByCase)['cr-1'].clarificationAttempts === 1, 'clarificacao errada incrementa tentativas');
  assert(env.spy.persistCalls > persistBeforeWrongClarification, 'clarificacao errada e persistida');
  for (let q = 0; q < ENGAGEMENTS[0].clarifications.length; q++) {
    const opt = ENGAGEMENTS[0].clarifications[q].options.find(o => o.correct);
    const fakeClick = { target: { closest: (sel) => (sel === '[data-cr-answer]' ? { dataset: { crAnswer: `cr-1|${q}|${opt.id}` } } : null) } };
    docClick.fn(fakeClick);
    if (q === 0) docClick.fn(fakeClick);
  }
  const progressed = env.app.getClientRealProgress(state.progressByCase)['cr-1'];
  assert(progressed.clarificationIndex === ENGAGEMENTS[0].clarifications.length, 'todas as clarificações respondidas avançam o índice');
  assert(progressed.phase === 'analyze', 'fase avança para analyze após todas as clarificações');
  // Fase analyze: executa as queries corretas via listener do btn-run
  state.currentLevel = 'cr-1';
  const runListener = env.listeners.find(l => l.el === 'btn-run' && l.type === 'click');
  const persistBeforeWrongAnalysis = env.spy.persistCalls;
  env.spy.editor = 'SELECT 1;';
  await runListener.fn();
  const afterWrongAnalysis = env.app.getClientRealProgress(state.progressByCase)['cr-1'];
  assert(afterWrongAnalysis.analysisIndex === 0 && afterWrongAnalysis.analysisAttempts === 1, 'query errada nao avanca a analise, mas registra tentativa');
  assert(env.spy.persistCalls > persistBeforeWrongAnalysis, 'query errada e persistida');
  env.spy.editor = a1.referenceQuery;
  await runListener.fn();
  const afterA1 = env.app.getClientRealProgress(state.progressByCase)['cr-1'];
  assert(afterA1.phase === 'analyze' && afterA1.analysisIndex === 1, `query correta da análise 1 avança o índice (atual: ${afterA1.phase}|${afterA1.analysisIndex})`);
  env.spy.editor = a2.referenceQuery;
  await runListener.fn();
  const afterRun = env.app.getClientRealProgress(state.progressByCase)['cr-1'];
  assert(afterRun.phase === 'report', `após query correta na última análise, fase vira 'report' (atual: ${afterRun.phase})`);
  // Fase report: envia o relatório
  env.spy.reportInput = good1;
  const submitEl = { closest: (sel) => (sel === '#client-real-report-submit' ? { dataset: {} } : null) };
  const fakeSubmit = { target: { closest: (sel) => (sel === '#client-real-report-submit' ? submitEl : (sel === '[data-cr-answer]' ? null : null)) } };
  const persistBeforeWrongReport = env.spy.persistCalls;
  env.spy.reportInput = 'Acho que esta tudo bem, mas talvez seja melhor acompanhar.';
  docClick.fn(fakeSubmit);
  const afterWrongReport = env.app.getClientRealProgress(state.progressByCase)['cr-1'];
  assert(afterWrongReport.phase === 'report' && afterWrongReport.reportAttempts === 1, 'relatorio reprovado permite nova tentativa');
  assert(env.spy.persistCalls > persistBeforeWrongReport, 'relatorio reprovado e persistido');
  env.spy.reportInput = good1;
  docClick.fn(fakeSubmit);
  const afterReport = env.app.getClientRealProgress(state.progressByCase)['cr-1'];
  assert(afterReport.phase === 'done' && state.completedLevels.includes('cr-1'), 'relatório aprovado conclui a consultoria e registra no completedLevels');

  console.log('\n=== Resultado ===');
  console.log(`${passed} PASS | ${failed} FAIL`);
  if (db) db.close();
  process.exit(failed > 0 ? 1 : 0);
})().catch(err => {
  console.error('Erro fatal no teste:', err);
  process.exit(2);
});
