/**
 * test_app_integration.js — Testes de integração do app.js.
 *
 * Carrega app.js transformado em um sandbox com DOM mock, localStorage mock
 * e dependências injetadas, depois exercita as funções internas expostas via
 * globalThis.__SQLDetectiveApp para verificar persistência, timeline e troca
 * de caso.
 *
 * Executa com: node test/test_app_integration.js
 */

const vm = require('vm');
const path = require('path');
const fs = require('fs');
const {
  readSource,
  transformESM,
  evalModule,
  loadExecutor,
  loadValidator,
  loadScoring,
  loadStorage,
  loadLevels,
  loadCourseContent,
  loadLesson,
} = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

// ====================================================================
// Mocks de ambiente
// ====================================================================

class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] ?? null; }
  setItem(key, val) { this.store[key] = String(val); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

function createMockDocument() {
  const elements = new Map();
  const listeners = [];

  function $(id) {
    if (!elements.has(id)) {
      const classes = new Set();
      const el = {
        id,
        hidden: true,
        classList: {
          add: (c) => { classes.add(c); if (c === 'hidden') el.hidden = true; },
          remove: (c) => { classes.delete(c); if (c === 'hidden') el.hidden = false; },
          contains: (c) => classes.has(c),
          toggle: (c, force) => {
            const shouldAdd = force === undefined ? !classes.has(c) : Boolean(force);
            if (shouldAdd) classes.add(c); else classes.delete(c);
            return shouldAdd;
          },
        },
        dataset: {},
        textContent: '',
        innerHTML: '',
        disabled: false,
        tabIndex: 0,
        style: {},
        focus: () => {},
        setAttribute: (name, value) => { el[name] = String(value); },
        removeAttribute: (name) => { delete el[name]; },
        addEventListener: (type, fn) => { listeners.push({ el: id, type, fn }); },
        querySelectorAll: () => [],
      };
      elements.set(id, el);
    }
    return elements.get(id);
  }

  const document = {
    readyState: 'complete',
    querySelector: (sel) => {
      const id = sel.replace(/^#/, '');
      return $(id);
    },
    querySelectorAll: (sel) => {
      if (sel === '[data-case-id]') return [];
      return [];
    },
    getElementById: (id) => $(id),
    addEventListener: (type, fn) => { listeners.push({ el: 'document', type, fn }); },
    dispatchEvent: (ev) => {
      for (const l of listeners) {
        if (l.el === 'document' && l.type === ev.type) {
          try { l.fn(ev); } catch (e) {}
        }
      }
    },
    createElement: (tag) => ({ tag, hidden: false, addEventListener: () => {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    activeElement: null,
  };
  return { document, elements, listeners };
}

function createMockUI(document, elements) {
  const calls = {
    renderTimeline: [],
    renderSuspectMeter: [],
    renderGraph: [],
    showStartInterrogationButton: [],
    renderMission: [],
    renderScore: [],
    renderProgress: [],
    renderEvidence: [],
    renderHints: [],
    renderFromState: [],
    showConclusionModal: [],
    setLesson: [],
    activateSidebarTab: [],
    activatePanel: [],
  };

  const ui = {
    initDOM: () => {},
    hideLoading: () => {},
    showGlobalError: () => {},
    hideGlobalError: () => {},
    setDbStatus: () => {},
    setMissionStatus: (text) => {},
    setBriefing: () => {},
    setSchema: () => {},
    setResults: (html) => {
      const resultPanel = document.getElementById('result-panel');
      if (resultPanel) resultPanel.innerHTML = html;
    },
    renderResults: () => {},
    getEditorValue: () => '',
    setEditorValue: () => {},
    clearEditor: () => {},
    enableEditorButtons: () => {},
    setProgress: () => {},
    setHints: () => {},
    setEvidence: () => {},
    setLesson: (html) => { calls.setLesson.push(html); },
    showTabs: () => {},
    hideTabs: () => {},
    initTabs: () => {},
    activatePanel: (name) => { calls.activatePanel.push(name); },
    renderFromState: () => { calls.renderFromState.push(true); },
    renderMission: (...args) => { calls.renderMission.push(args); },
    renderFeedback: () => {},
    renderHints: (...args) => { calls.renderHints.push(args); },
    renderProgress: (...args) => { calls.renderProgress.push(args); },
    renderEvidence: (...args) => { calls.renderEvidence.push(args); },
    enableHintButton: () => {},
    setHintButtonLoading: () => {},
    showHintFallbackNotice: () => {},
    renderScore: (...args) => { calls.renderScore.push(args); },
    showResetConfirm: () => {},
    hideIntroScreen: () => {},
    showConclusionModal: (...args) => { calls.showConclusionModal.push(args); },
    hideConclusionModal: () => {},
    renderSchemaDetailed: () => {},
    activateSandboxMode: () => {},
    deactivateSandboxMode: () => {},
    renderTimeline: (timelineConfig, completedLevels, order) => {
      calls.renderTimeline.push({ timelineConfig, completedLevels, order });
      const section = document.getElementById('timeline-section');
      section.hidden = !timelineConfig;
    },
    renderSuspectMeter: (suspectsConfig, completedLevels) => {
      calls.renderSuspectMeter.push({ suspectsConfig, completedLevels });
      const section = document.getElementById('suspect-section');
      section.hidden = !suspectsConfig;
    },
    renderGraph: (graphConfig, completedLevels, evidence, suspicion) => {
      calls.renderGraph.push({ graphConfig, completedLevels, evidence, suspicion });
      const section = document.getElementById('graph-section');
      section.hidden = !graphConfig;
    },
    showInterrogationModal: () => {},
    hideInterrogationModal: () => {},
    setInterrogationFeedback: () => {},
    showStartInterrogationButton: (visible) => {
      calls.showStartInterrogationButton.push(visible);
      const btn = document.getElementById('btn-start-interrogation');
      btn.hidden = !visible;
    },
    initSidebarTabs: () => {},
    activateSidebarTab: (name) => { calls.activateSidebarTab.push(name); },
    configureSidebarTabs: () => {},
    updateLessonTabBadge: () => {},
    initLobbyTabs: () => {},
    activateLobbyTab: () => {},
    renderMissionRail: () => {},
    setHeaderCaseInfo: () => {},
    renderHeaderProgress: () => {},
    escapeHtml: (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
  };

  return { ui, calls };
}

function createMockDB() {
  return {
    initDB: async (caseId, opts) => {
      return {
        exec: (sql) => {
          if (/sqlite_master/i.test(sql)) return [{ columns: ['name', 'sql'], values: [['funcionarios', 'CREATE TABLE funcionarios (id INT)']] }];
          return [];
        },
      };
    },
    getSchemaText: () => 'CREATE TABLE funcionarios (id INT);',
    getDB: () => ({
      exec: (sql) => {
        if (/sqlite_master/i.test(sql)) return [{ columns: ['name', 'sql'], values: [['funcionarios', 'CREATE TABLE funcionarios (id INT)']] }];
        return [];
      },
    }),
    getSchemaDetailed: () => [],
  };
}

// ====================================================================
// Carrega app.js com todos os mocks
// ====================================================================

function loadAppWithMocks() {
  const { document, elements, listeners } = createMockDocument();
  const { ui, calls } = createMockUI(document, elements);
  const db = createMockDB();
  const localStorage = new LocalStorageMock();

  // Módulos puros carregados do src/
  const executor = loadExecutor();
  const validator = loadValidator(executor.executeQuery);
  const scoring = loadScoring();
  const storage = loadStorage(localStorage);
  const levels = loadLevels();
  const courseContent = loadCourseContent();
  const lesson = loadLesson();
  const timeline = evalModule(transformESM(readSource('timeline.js')), {}, 'timeline.js');
  const suspectMeter = evalModule(transformESM(readSource('suspect-meter.js')), {}, 'suspect-meter.js');
  const interrogation = evalModule(transformESM(readSource('interrogation.js')), {}, 'interrogation.js');
  const suspectGraph = evalModule(transformESM(readSource('suspect-graph.js')), {}, 'suspect-graph.js');

  // case-manager depende dos módulos levels de cada caso; simplificamos
  // carregando o case-manager real com as referências injetadas.
  const caseManager = loadCaseManager({
    case001Levels: levels,
    case002Levels: loadLevelsFrom('cases/case002/levels.js'),
    case003Levels: loadLevelsFrom('cases/case003/levels.js'),
    case004Levels: loadLevelsFrom('cases/case004/levels.js'),
    case005Levels: loadLevelsFrom('cases/case005/levels.js'),
    case006Levels: loadLevelsFrom('cases/case006/levels.js'),
    projEcommerceLevels: loadLevelsFrom('cases/proj-ecommerce/levels.js'),
    projClientesLevels: loadLevelsFrom('cases/proj-clientes/levels.js'),
    projVendasLevels: loadLevelsFrom('cases/proj-vendas/levels.js'),
    projMarketingLevels: loadLevelsFrom('cases/proj-marketing/levels.js'),
    projLogisticaLevels: loadLevelsFrom('cases/proj-logistica/levels.js'),
    projEstoqueLevels: loadLevelsFrom('cases/proj-estoque/levels.js'),
    projEducacaoLevels: loadLevelsFrom('cases/proj-educacao/levels.js'),
    projSaudeLevels: loadLevelsFrom('cases/proj-saude/levels.js'),
    projFinanceiroLevels: loadLevelsFrom('cases/proj-financeiro/levels.js'),
    projSuporteLevels: loadLevelsFrom('cases/proj-suporte/levels.js'),
    projPublicoLevels: loadLevelsFrom('cases/proj-publico/levels.js'),
    projFutebolLevels: loadLevelsFrom('cases/proj-futebol/levels.js'),
    bugHunterLevels: {
      BUG_HUNTER_INTRO: { title: 'Bug Hunter', subtitle: 'Debugging', story: 'Corrija os relatórios quebrados.' },
      BUG_HUNTER_CONCLUSION: { title: 'Modo concluído' },
      BUG_CHALLENGES: [],
    },
  });

  // er-diagram e ai-hints puros
  const erDiagram = evalModule(transformESM(readSource('er-diagram.js')), {}, 'er-diagram.js');
  const aiHints = evalModule(transformESM(readSource('ai-hints.js')), {
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ hint: 'dica mock' }) }),
  }, 'ai-hints.js');

  // state.js real
  const stateModule = evalModule(transformESM(readSource('state.js')), {}, 'state.js');

  const appRaw = readSource('app.js');
  const appCode = removeImportStatements(transformESM(appRaw));

  const context = {
    // runtime
    document,
    window: {
      innerWidth: 1024,
      addEventListener: () => {},
      SQL: null,
    },
    localStorage,
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ hint: 'dica mock' }) }),
    AbortController,
    AbortSignal,
    Event: class EventMock {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    CustomEvent: class CustomEventMock {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    Error,
    RegExp,
    Array,
    Object,
    String,
    Number,
    JSON,
    Math,
    Set,
    Map,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    Date,
    Promise,
    globalThis: undefined,
    __SQL_DETECTIVE_TEST__: true,

    // dependências injetadas (imports removidos)
    state: stateModule.state,
    resetState: stateModule.resetState,
    activateCaseProgress: stateModule.activateCaseProgress,
    syncActiveCaseProgress: stateModule.syncActiveCaseProgress,
    createCaseProgress: stateModule.createCaseProgress,
    initDB: db.initDB,
    getSchemaText: db.getSchemaText,
    getDB: db.getDB,
    getSchemaDetailed: db.getSchemaDetailed,
    executeQuery: executor.executeQuery,
    getAllCases: caseManager.getAllCases,
    getInvestigations: caseManager.getInvestigations,
    getProjects: caseManager.getProjects,
    getCaseById: caseManager.getCaseById,
    isCaseAvailable: caseManager.isCaseAvailable,
    isCaseComplete: caseManager.isCaseComplete,
    validateLevel: validator.validateLevel,
    FEEDBACK_CORRECT: validator.FEEDBACK_CORRECT,
    FEEDBACK_WRONG_RESULT: validator.FEEDBACK_WRONG_RESULT,
    FEEDBACK_MISSING_CONCEPT: validator.FEEDBACK_MISSING_CONCEPT,
    FEEDBACK_SQL_ERROR: validator.FEEDBACK_SQL_ERROR,
    FEEDBACK_MISSING_COLUMNS: validator.FEEDBACK_MISSING_COLUMNS,
    FEEDBACK_BLOCKED: validator.FEEDBACK_BLOCKED,
    calculateStars: scoring.calculateStars,
    calculateScore: scoring.calculateScore,
    calculateTotalScore: scoring.calculateTotalScore,
    calculateTotalStars: scoring.calculateTotalStars,
    calculateMaxStars: scoring.calculateMaxStars,
    updateLevelProgress: scoring.updateLevelProgress,
    saveState: storage.saveState,
    loadState: storage.loadState,
    clearState: storage.clearState,
    ...ui,
    renderLessonHtml: lesson.renderLessonHtml,
    renderERDiagram: erDiagram.renderERDiagram,
    getCourseContentByLevel: courseContent.getCourseContentByLevel,
    getCourseContentById: courseContent.getCourseContentById,
    buildHintContext: aiHints.buildHintContext,
    requestAiHint: aiHints.requestAiHint,
    getUnlockedEvents: timeline.getUnlockedEvents,
    normalizeOrder: timeline.normalizeOrder,
    moveEvent: timeline.moveEvent,
    validateOrder: timeline.validateOrder,
    checkTimelineBonus: timeline.checkTimelineBonus,
    deriveSuspicion: suspectMeter.deriveSuspicion,
    getSuspectProfiles: suspectMeter.getSuspectProfiles,
    isInterrogationAvailable: interrogation.isInterrogationAvailable,
    startInterrogation: interrogation.startInterrogation,
    presentEvidence: interrogation.presentEvidence,
    normalizeInterrogationState: interrogation.normalizeInterrogationState,
    renderGraphSVG: suspectGraph.renderGraphSVG,
    buildGraphState: suspectGraph.buildGraphState,
  };

  context.globalThis = context;

  const appExports = {};
  vm.runInNewContext(appCode, { ...context, exports: appExports }, { filename: 'app.js' });

  return {
    app: context.__SQLDetectiveApp,
    state: stateModule.state,
    localStorage,
    storage,
    elements,
    listeners,
    calls,
  };
}

function loadLevelsFrom(relativePath) {
  const fullPath = path.join(__dirname, '..', 'src', relativePath);
  const code = fs.readFileSync(fullPath, 'utf-8');
  return evalModule(transformESM(code), {}, relativePath);
}

function loadCaseManager(injected) {
  let code = readSource('case-manager.js');
  // Remove imports namespace e insere as variáveis injetadas no topo
  code = code.replace(/^\s*import\s+\*\s+as\s+(\w+)\s+from\s+['"].*?['"];?\s*$/gm, '');
  const declarations = Object.keys(injected)
    .map(name => `const ${name} = __injected_${name};`)
    .join('\n');
  code = declarations + '\n' + code;
  const sandbox = {};
  for (const name of Object.keys(injected)) {
    sandbox[`__injected_${name}`] = injected[name];
  }
  return evalModule(removeImportStatements(transformESM(code)), sandbox, 'case-manager.js');
}

function removeImportStatements(code) {
  // Remove imports simples e multi-line com chaves
  return code.replace(/^\s*import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?\s*$/gm, '');
}

// ====================================================================
// Testes
// ====================================================================

console.log('\n[1] persistState salva gameplay e aulas lidas');
{
  const { app, state, localStorage, storage } = loadAppWithMocks();
  state.currentCase = 'case001';
  state.progressByCase = { case001: storage.getDefaultState().progressByCase.case001 };
  state.timelineOrder = ['email-801', 'access-701', 'transfer-501'];
  state.timelineBonusAwarded = true;
  state.bonusPoints = 200;
  state.interrogation = { status: 'active', stepIndex: 1, presentedEvidenceIds: ['ev1'] };
  state.lessonsRead = ['sql-intro'];

  app.persistState();

  const raw = localStorage.getItem('sql_detective_v2');
  assert(raw !== null, 'save gerou chave v2');
  const saved = JSON.parse(raw);
  const p = saved.progressByCase.case001;
  assert(Array.isArray(p.timelineOrder), 'timelineOrder é array salvo');
  assert(p.timelineOrder.length === 3 && p.timelineOrder[0] === 'email-801', 'timelineOrder preservado');
  assert(p.timelineBonusAwarded === true, 'timelineBonusAwarded preservado');
  assert(p.bonusPoints === 200, 'bonusPoints preservado');
  assert(p.interrogation.status === 'active' && p.interrogation.stepIndex === 1, 'interrogation preservado');
  assert(p.lessonsRead.length === 1 && p.lessonsRead[0] === 'sql-intro', 'lessonsRead preservado');
}

console.log('\n[2] restoreProgress restaura gameplay e aulas lidas');
{
  const { app, state, localStorage } = loadAppWithMocks();
  localStorage.setItem('sql_detective_v2', JSON.stringify({
    currentCase: 'case001',
    progressByCase: {
      case001: {
        currentLevel: 5, completedLevels: [1, 2, 3], levelProgress: {}, score: 300, evidence: [],
        timelineOrder: ['transfer-501'], timelineBonusAwarded: true, bonusPoints: 200,
        interrogation: { status: 'won', stepIndex: 3, presentedEvidenceIds: ['a', 'b'] },
        lessonsRead: ['sql-intro'],
      },
    },
  }));
  app.restoreProgress();
  assert(state.currentCase === 'case001', 'caso ativo restaurado');
  assert(state.timelineOrder.length === 1 && state.timelineOrder[0] === 'transfer-501', 'timelineOrder restaurado no estado ativo');
  assert(state.timelineBonusAwarded === true, 'timelineBonusAwarded ativo restaurado');
  assert(state.bonusPoints === 200, 'bonusPoints ativo restaurado');
  assert(state.interrogation.status === 'won', 'interrogation ativo restaurado');
  assert(state.lessonsRead.length === 1 && state.lessonsRead[0] === 'sql-intro', 'lessonsRead ativo restaurado');
}

console.log('\n[3] loadMission oculta timeline, suspeitos e interrogatório para casos sem GAMEPLAY');
{
  const { app, state, elements, calls } = loadAppWithMocks();
  state.currentCase = 'case001';
  // Progresso do case001 completo para desbloquear case002
  state.progressByCase = {
    case001: {
      currentLevel: 12, completedLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      levelProgress: {}, score: 0, evidence: [],
      timelineOrder: [], timelineBonusAwarded: false, bonusPoints: 0,
      interrogation: { status: 'won', stepIndex: 3, presentedEvidenceIds: [] },
    },
  };
  state.completedLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  state.interrogation = { status: 'won', stepIndex: 3, presentedEvidenceIds: [] };

  // Carrega missão do case001 (tem GAMEPLAY): seções devem aparecer
  app.loadMission(1);
  const case001TimelineCall = calls.renderTimeline[calls.renderTimeline.length - 1];
  const case001SuspectCall = calls.renderSuspectMeter[calls.renderSuspectMeter.length - 1];
  const case001StartBtn = calls.showStartInterrogationButton[calls.showStartInterrogationButton.length - 1];
  assert(case001TimelineCall.timelineConfig !== null, 'case001: timeline renderizada');
  assert(case001SuspectCall.suspectsConfig !== null, 'case001: suspeitos renderizados');
  const case001GraphCall = calls.renderGraph[calls.renderGraph.length - 1];
  assert(case001GraphCall.graphConfig !== null, 'case001: grafo renderizado');
  assert(elements.get('timeline-section').hidden === false, 'case001: seção timeline visível');
  assert(elements.get('suspect-section').hidden === false, 'case001: seção suspeitos visível');
  assert(elements.get('graph-section').hidden === false, 'case001: seção grafo visível');
  assert(case001StartBtn === false, 'case001: botão interrogatório oculto (já vencido)');

  // Troca para case002 (sem GAMEPLAY): seções devem ser ocultadas
  app.selectCase('case002');
  // A seleção mostra a introdução; iniciar o caso carrega a primeira missão.
  app.loadMission(1);
  const case002TimelineCall = calls.renderTimeline[calls.renderTimeline.length - 1];
  const case002SuspectCall = calls.renderSuspectMeter[calls.renderSuspectMeter.length - 1];
  const case002GraphCall = calls.renderGraph[calls.renderGraph.length - 1];
  const case002StartBtn = calls.showStartInterrogationButton[calls.showStartInterrogationButton.length - 1];
  assert(case002TimelineCall.timelineConfig === null, 'case002: timeline ocultada');
  assert(case002SuspectCall.suspectsConfig === null, 'case002: suspeitos ocultados');
  assert(case002GraphCall.graphConfig === null, 'case002: grafo ocultado');
  assert(elements.get('timeline-section').hidden === true, 'case002: seção timeline hidden');
  assert(elements.get('suspect-section').hidden === true, 'case002: seção suspeitos hidden');
  assert(elements.get('graph-section').hidden === true, 'case002: seção grafo hidden');
  assert(case002StartBtn === false, 'case002: botão interrogatório ocultado');
}

console.log('\n[4] Concluir missão não concede bônus de timeline automaticamente');
{
  const { app, state, calls } = loadAppWithMocks();
  state.currentCase = 'case001';
  state.currentLevel = 3;
  state.completedLevels = [3];
  state.levelProgress = {};
  state.score = 0;
  state.bonusPoints = 0;
  state.timelineBonusAwarded = false;
  state.timelineOrder = [];
  state.evidence = [];
  state.hintsRevealed = [];
  state.interrogation = { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] };

  // Simula o fluxo de conclusão chamando loadMission(3), que normaliza a timeline
  // após conclusão (no fluxo real isso ocorre dentro do handler de Run).
  // Aqui verificamos que loadMission apenas normaliza e não concede bônus.
  app.loadMission(3);

  // timelineOrder deve conter os 4 eventos da missão 3, ainda na ordem padrão
  const timelineCall = calls.renderTimeline[calls.renderTimeline.length - 1];
  assert(timelineCall.order.length === 4, 'missão 3: 4 eventos na timeline');
  assert(state.bonusPoints === 0, 'bônus não concedido automaticamente');
  assert(state.timelineBonusAwarded === false, 'flag de bônus não alterada');
}

console.log('\n[5] Botão verificar ordem só concede bônus com todos os 9 eventos desbloqueados');
{
  const { state, listeners } = loadAppWithMocks();
  state.currentCase = 'case001';
  const gameplay = loadLevels().GAMEPLAY;
  state.completedLevels = [3];
  state.levelProgress = {};
  state.bonusPoints = 0;
  state.timelineBonusAwarded = false;
  // Ordem correta dos 4 eventos da missão 3
  state.timelineOrder = ['transfer-501', 'transfer-502', 'transfer-503', 'transfer-504'];

  const timelineModule = evalModule(transformESM(readSource('timeline.js')), {}, 'timeline.js');
  const checkListener = listeners.find(listener =>
    listener.el === 'btn-timeline-check' && listener.type === 'click'
  );
  assert(Boolean(checkListener), 'handler do botão verificar foi registrado');

  const unlocked = timelineModule.getUnlockedEvents(gameplay.timeline, state.completedLevels);
  const allUnlocked = unlocked.length === gameplay.timeline.events.length;
  assert(allUnlocked === false, 'apenas 4 de 9 eventos desbloqueados');
  checkListener.fn({ type: 'click' });
  assert(state.bonusPoints === 0, 'clique parcial não concede bônus');
  assert(state.timelineBonusAwarded === false, 'clique parcial não altera a flag');

  state.completedLevels = [3, 4, 9];
  state.timelineOrder = timelineModule
    .getUnlockedEvents(gameplay.timeline, state.completedLevels)
    .map(event => event.id);
  checkListener.fn({ type: 'click' });
  assert(state.bonusPoints === 200, 'todos desbloqueados e ordem correta concedem 200');
  assert(state.timelineBonusAwarded === true, 'flag é marcada após conceder o bônus');
}

console.log('\n[6] Etapa 0 renderiza a análise do banco antes das missões');
{
  const { app, state, elements } = loadAppWithMocks();
  state.currentCase = 'case001';
  const shown = app.showDatabaseAnalysis();
  assert(shown === true, 'análise configurada é exibida');
  assert(elements.get('database-analysis-title').textContent.includes('Evidências separadas'), 'título específico do Caso 001 renderizado');
  assert(elements.get('database-analysis-entities').innerHTML.includes('funcionarios'), 'mapa inclui funcionarios');
  assert(elements.get('database-analysis-entities').innerHTML.includes('transacoes'), 'mapa inclui transacoes');
  assert(elements.get('database-analysis-checkpoints').innerHTML.includes('Missão conceitual 1'), 'checkpoints conceituais renderizados');
  app.hideDatabaseAnalysis();
  assert(elements.get('database-analysis-screen').classList.contains('hidden'), 'análise pode ser encerrada antes de iniciar o jogo');
}

console.log('\n[7] Recalcular score preserva bonus de gameplay');
{
  const { app, state } = loadAppWithMocks();
  state.levelProgress = {
    1: { stars: 3, hintsUsed: 0 },
    2: { stars: 2, hintsUsed: 1 },
  };
  state.bonusPoints = 200;
  state.score = 0;

  const recalculated = app.recalculateScore();
  assert(recalculated === 700, 'score recalculado inclui os 200 pontos de bonus');
  assert(state.score === 700, 'estado mantem o bonus depois de melhorar uma missao');
}

console.log('\n[8] Views e mutacoes concluidas sao restauradas ao recriar o banco em memoria');
{
  const { app } = loadAppWithMocks();
  const executed = [];
  const db = {
    exec: sql => {
      executed.push(sql);
      return [];
    },
  };
  const caseDefinition = {
    LEVELS: [
      { id: 1, executionMode: 'select', referenceQuery: 'SELECT 1;' },
      { id: 2, executionMode: 'create_view', viewName: 'vw_concluida', referenceQuery: 'CREATE VIEW vw_concluida AS SELECT 1 AS valor;' },
      { id: 3, executionMode: 'create_view', viewName: 'vw_pendente', referenceQuery: 'CREATE VIEW vw_pendente AS SELECT 2 AS valor;' },
      { id: 4, executionMode: 'ddl', referenceQuery: 'INSERT INTO carga VALUES (1);' },
    ],
  };

  const restored = app.restoreCompletedMissionViews(caseDefinition, db, [1, 2, 4]);
  assert(restored.length === 2 && restored[0] === 'vw_concluida' && restored[1] === 4, 'restaura view e mutacao das missoes concluidas');
  assert(executed.length === 2 && executed[0].includes('vw_concluida') && executed[1].includes('INSERT INTO carga'), 'executa as definicoes canonicas em ordem de missao');
}

console.log('\n[9] Fluxo de projeto percorre selecao, Etapa 0 e primeira missao');
let projectFlow;
{
  const { app, state, elements, calls } = loadAppWithMocks();
  app.selectCase('proj-ecommerce');
  assert(state.currentCase === 'proj-ecommerce', 'seletor ativa um projeto real');
  assert(elements.get('btn-start').textContent === 'INICIAR PROJETO →', 'CTA inicial e adaptado ao projeto');
  assert(elements.get('briefing-panel-title').textContent === 'PROJETO', 'painel identifica o cenario como projeto');
  assert(elements.get('editor-panel-title').textContent === 'ANÁLISE SQL', 'editor usa rotulo analitico');

  const shown = app.showDatabaseAnalysis();
  assert(shown === true, 'Etapa 0 do projeto e exibida');
  assert(elements.get('database-analysis-entities').innerHTML.includes('pedidos'), 'Etapa 0 renderiza entidades do projeto');

  app.hideDatabaseAnalysis();
  projectFlow = app.startGame().then(async () => {
    assert(state.currentLevel === 1, 'inicio do projeto carrega a primeira missao');
    const lastMission = calls.renderMission[calls.renderMission.length - 1];
    assert(lastMission && lastMission[0].id === 1, 'missao real do projeto chega a interface');
    const lastTimeline = calls.renderTimeline[calls.renderTimeline.length - 1];
    assert(lastTimeline.timelineConfig === null, 'projeto permanece sem mecanicas policiais');

    state.currentLevel = 999;
    await app.startGame();
    assert(state.currentLevel === 1, 'missao salva fora do intervalo volta para a primeira pendente');
  });
}

console.log('\n[10] Reset limpa somente o cenário ativo');
{
  const { app, state, localStorage } = loadAppWithMocks();
  state.currentCase = 'proj-ecommerce';
  state.progressByCase = {
    case001: {
      currentLevel: 4, completedLevels: [1, 2, 3], levelProgress: { 1: { stars: 3, hintsUsed: 0 } },
      score: 300, evidence: ['evidência preservada'], timelineOrder: [], timelineBonusAwarded: false,
      bonusPoints: 0, interrogation: { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] },
    },
    'proj-ecommerce': {
      currentLevel: 3, completedLevels: [1, 2], levelProgress: { 1: { stars: 2, hintsUsed: 1 } },
      score: 200, evidence: ['evidência removida'], timelineOrder: [], timelineBonusAwarded: false,
      bonusPoints: 0, interrogation: { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] },
    },
  };
  state.currentLevel = 3;
  state.completedLevels = [1, 2];
  state.levelProgress = { 1: { stars: 2, hintsUsed: 1 } };
  state.score = 200;
  state.evidence = ['evidência removida'];

  const resetCaseId = app.resetActiveCaseProgress();
  const saved = JSON.parse(localStorage.getItem('sql_detective_v2'));

  assert(resetCaseId === 'proj-ecommerce' && state.currentCase === 'proj-ecommerce', 'reset mantém o cenário ativo');
  assert(state.completedLevels.length === 0 && state.score === 0 && state.evidence.length === 0, 'progresso ativo é zerado');
  assert(saved.progressByCase.case001.score === 300, 'progresso de outro cenário é preservado');
  assert(saved.progressByCase['proj-ecommerce'].completedLevels.length === 0, 'save persiste somente o cenário ativo zerado');
}

console.log('\n[11] Card de revisão abre a aula completa sem trocar de missão');
{
  const { app, state, calls } = loadAppWithMocks();
  state.currentCase = 'case001';
  state.currentLevel = 6;
  state.lessonsRead = [];

  const opened = app.showCourseLesson('joins-inner-left');
  const rendered = calls.setLesson[calls.setLesson.length - 1] || '';
  assert(opened === true, 'courseRef secundário é encontrado');
  assert(rendered.includes('Conectando entidades'), 'a revisão vira a aula principal renderizada');
  assert(calls.activateSidebarTab.includes('lesson'), 'aba AULA é ativada');
  assert(calls.activatePanel.includes('sidebar'), 'painel externo é ativado para mobile');
}

console.log('\n[12] Aula lida não é forçada novamente em missão incompleta');
{
  const { app, state, calls } = loadAppWithMocks();
  state.currentCase = 'case001';
  state.completedLevels = [];
  state.lessonsRead = ['dml-select-where'];
  const before = calls.activateSidebarTab.length;
  app.loadMission(2);
  assert(calls.activateSidebarTab.length === before, 'retorno à missão preserva a aba escolhida quando a aula já foi lida');

  state.lessonsRead = [];
  app.loadMission(2);
  assert(calls.activateSidebarTab[calls.activateSidebarTab.length - 1] === 'lesson', 'missão com aula não lida abre em AULA');
}

console.log('\n[13] Fim da rolagem marca e persiste a aula atual');
{
  const { state, elements, listeners, localStorage } = loadAppWithMocks();
  state.currentCase = 'case001';
  state.currentLevel = 1;
  state.lessonsRead = [];
  const pane = elements.get('sidebar-pane-lesson');
  pane.scrollTop = 900;
  pane.clientHeight = 100;
  pane.scrollHeight = 1000;
  const onScroll = listeners.find(listener => listener.el === 'sidebar-pane-lesson' && listener.type === 'scroll');
  assert(Boolean(onScroll), 'listener observa o pane que realmente rola');
  onScroll.fn();
  const saved = JSON.parse(localStorage.getItem('sql_detective_v2'));
  assert(state.lessonsRead.includes('sql-intro'), 'aula atual é marcada como lida');
  assert(saved.progressByCase.case001.lessonsRead.includes('sql-intro'), 'leitura permanece no estado salvo');
}

console.log('\n[14] Casos com mutações mantêm a sequência obrigatória');
{
  const { app, state } = loadAppWithMocks();
  state.currentCase = 'case005';
  state.completedLevels = [];
  app.loadMission(14);
  assert(state.currentLevel === 1, 'tentativa de abrir missão futura redireciona para a primeira pendente');

  state.completedLevels = [1, 2];
  app.loadMission(4);
  assert(state.currentLevel === 3, 'sequência avança somente até a próxima missão ainda não concluída');
}

// ====================================================================
// Resultado
// ====================================================================

projectFlow
  .catch(error => {
    console.error(error);
    failed++;
  })
  .finally(() => {
    console.log('\n' + '='.repeat(50));
    console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
    console.log('='.repeat(50));
    process.exit(failed > 0 ? 1 : 0);
  });
