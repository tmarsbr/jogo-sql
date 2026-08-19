/**
 * test_schema_builder_app.js — Integração do modo Construtor de Schema com o app.js.
 *
 * Diferente de test_schema_builder.js (que testa o validador isolado), aqui o
 * app.js real é carregado num sandbox com DOM mock e um banco sql.js de verdade,
 * e o handler de clique do botão VALIDAR MODELO é acionado como no navegador.
 *
 * Cobre o fluxo que quebrava em produção: várias execuções no mesmo desafio.
 *
 * Executa com: node test/test_schema_builder_app.js
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
  loadSchemaBuilderChallenges,
  loadSchemaBuilderValidator,
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

function createMockDocument() {
  const elements = new Map();
  const listeners = [];

  function $(id) {
    if (!elements.has(id)) {
      const classes = new Set();
      const el = {
        id, hidden: true, dataset: {}, textContent: '', innerHTML: '',
        disabled: false, tabIndex: 0, style: {},
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
        appendChild: () => {},
      };
      elements.set(id, el);
    }
    return elements.get(id);
  }

  const document = {
    readyState: 'complete',
    querySelector: (sel) => $(String(sel).replace(/^#/, '')),
    querySelectorAll: () => [],
    getElementById: (id) => $(id),
    addEventListener: (type, fn) => { listeners.push({ el: 'document', type, fn }); },
    dispatchEvent: (ev) => {
      for (const l of listeners) {
        if (l.el === 'document' && l.type === ev.type) { try { l.fn(ev); } catch { /* ignora */ } }
      }
    },
    createElement: (tag) => ({ tag, hidden: false, style: {}, addEventListener: () => {}, appendChild: () => {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    activeElement: null,
  };

  return { document, elements, listeners };
}

/** Extrai os nomes importados pelo app.js, para nenhum stub ficar como string. */
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
/* Carga do app.js com banco real                                      */
/* ================================================================== */

function loadApp(SQL) {
  const { document, elements, listeners } = createMockDocument();
  const localStorage = new LocalStorageMock();

  const executor = loadExecutor();
  const validator = loadSchemaBuilderValidator(executor.executeQuery);
  const challenges = loadSchemaBuilderChallenges();
  const storage = loadStorage(localStorage);
  const scoring = loadScoring();
  const stateModule = evalModule(transformESM(readSource('state.js')), {}, 'state.js');

  // --- Banco sql.js real, com o mesmo contrato de db.js ---
  let db = null;
  const dbApi = {
    initDB: async (caseId, { force = false } = {}) => {
      if (force || !db) {
        if (db) db.close();
        db = new SQL.Database();
        db.run('PRAGMA foreign_keys = ON;');
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

  // --- Caso ativo do modo Construtor de Schema ---
  const schemaCase = {
    id: 'schema-builder', number: 'SB', type: 'schema-builder',
    title: 'Modo Construtor de Schema',
    CASE_INTRO: { title: 'Construtor', subtitle: 'Modelagem', story: '...', mission: '...' },
    CASE_CONCLUSION: { title: 'Concluído', story: '...', nextSteps: '...' },
    SCHEMA_CHALLENGES: challenges.SCHEMA_CHALLENGES,
    getTotalLevels: challenges.getTotalLevels,
  };

  // --- Espiões da UI ---
  const spy = {
    feedback: null,
    checklist: null,
    editor: '',
    results: '',
    diagram: '',
    nextHidden: true,
    editorButtonsEnabled: null,
  };

  const appSource = readSource('app.js');
  const context = {
    document,
    window: { innerWidth: 1024, addEventListener: () => {}, SQL: null },
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

  // Todo nome importado vira no-op antes das injeções reais: assim nenhum stub
  // automático de string é chamado como função durante o init().
  for (const name of collectImportedNames(appSource)) {
    if (!(name in context)) context[name] = () => {};
  }

  Object.assign(context, {
    // módulos reais que o fluxo exercita
    state: stateModule.state,
    resetState: stateModule.resetState,
    activateCaseProgress: stateModule.activateCaseProgress,
    syncActiveCaseProgress: stateModule.syncActiveCaseProgress,
    createCaseProgress: stateModule.createCaseProgress,
    saveState: storage.saveState,
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
    renderERDiagram: (container) => {
      spy.diagram = dbApi.getSchemaText();
      container.textContent = spy.diagram;
    },

    // validador real do modo
    validateSchemaChallenge: validator.validateSchemaChallenge,
    executeMultipleStatements: validator.executeMultipleStatements,
    findForbiddenKeyword: validator.findForbiddenKeyword,
    mergeSchemaStatements: validator.mergeSchemaStatements,
    getCreatedTableNames: validator.getCreatedTableNames,
    splitStatements: validator.splitStatements,
    splitSchemaModelStatements: validator.splitSchemaModelStatements,
    stripNoise: validator.stripNoise,
    getCreatedTableName: validator.getCreatedTableName,
    getDroppedTableName: validator.getDroppedTableName,
    SB_FEEDBACK_CORRECT: validator.SB_FEEDBACK_CORRECT,
    SB_FEEDBACK_INCOMPLETE: validator.SB_FEEDBACK_INCOMPLETE,
    SB_FEEDBACK_BLOCKED: validator.SB_FEEDBACK_BLOCKED,
    SB_FEEDBACK_UNEXPECTED_TABLE: validator.SB_FEEDBACK_UNEXPECTED_TABLE,

    // case-manager reduzido ao caso em teste
    getCaseById: () => schemaCase,
    getAllCases: () => [schemaCase],
    getInvestigations: () => [schemaCase],
    getProjects: () => [],
    isCaseAvailable: () => true,
    isCaseComplete: () => false,

    // UI espionada
    getEditorValue: () => spy.editor,
    setEditorValue: (v) => { spy.editor = String(v); },
    clearEditor: () => { spy.editor = ''; },
    renderSchemaFeedback: (fb) => { spy.feedback = fb; },
    renderSchemaChallenge: (ch, ddl, done, created) => { spy.checklist = created; },
    setResults: (html) => { spy.results = String(html); },
    enableEditorButtons: (enabled) => {
      spy.editorButtonsEnabled = Boolean(enabled);
      document.getElementById('btn-run').disabled = !enabled;
      document.getElementById('btn-clear').disabled = !enabled;
    },
    escapeHtml: (s) => String(s),
  });

  context.globalThis = context;

  const code = transformESM(appSource).replace(/^\s*import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?\s*$/gm, '');
  // Remove os stubs automáticos do transformESM que sombreariam as injeções.
  let appCode = code;
  for (const name of Object.keys(context)) {
    appCode = appCode.replace(
      new RegExp(`^const\\s+${name}\\s*=\\s*(?:'[^']*'|new Proxy\\(\\{\\}, \\{ get: \\(\\) => undefined \\}\\));\\s*$`, 'm'),
      ''
    );
  }

  vm.runInNewContext(appCode, { ...context, exports: {} }, { filename: 'app.js' });

  const runListener = listeners.find(l => l.el === 'btn-run' && l.type === 'click');
  const clearListener = listeners.find(l => l.el === 'btn-clear' && l.type === 'click');
  const erListener = listeners.find(l => l.el === 'btn-er' && l.type === 'click');
  return { app: context.__SQLDetectiveApp, state: stateModule.state, spy, runListener, clearListener, erListener, elements, listeners, localStorage, dbApi, validator };
}

/* ================================================================== */
/* Testes                                                              */
/* ================================================================== */

async function run() {
  const wasmPath = path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) });

  console.log('\n[1] O handler de VALIDAR MODELO está registrado');
  const env = loadApp(SQL);
  assert(typeof env.runListener?.fn === 'function', 'listener de clique do btn-run existe');

  // Prepara o modo Construtor de Schema no desafio 1.
  const { state, spy, clearListener } = env;
  state.currentCase = 'schema-builder';
  state.currentLevel = 1;
  state.sandboxMode = false;
  state.schemaBuilderDdl = {};
  state.completedLevels = [];
  state.levelProgress = {};
  state.hintsRevealed = [];
  state.evidence = [];
  await env.dbApi.initDB('schema-builder', { force: true });

  const clickRun = async (typed) => {
    spy.editor = typed;
    await env.runListener.fn();
    return spy.feedback;
  };

  console.log('\n[2] Execução 1: cria a primeira tabela');
  let fb = await clickRun('CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL)');
  assert(fb && fb.type === 'missing_table', `feedback → ${fb?.type} (esperado missing_table)`);
  assert(state.schemaBuilderDdl[1]?.length === 1, `modelo salvo com 1 instrução (${state.schemaBuilderDdl[1]?.length})`);
  assert(Array.isArray(spy.checklist) && spy.checklist.includes('departamentos'),
    `checklist marca departamentos como criada (${JSON.stringify(spy.checklist)})`);
  assert(!spy.checklist.includes('funcionarios'), 'checklist ainda não marca funcionarios');

  console.log('\n[2b] Limpar apaga somente o rascunho e validar vazio não o restaura');
  clearListener.fn();
  assert(spy.editor === '', 'LIMPAR RASCUNHO deixa o editor vazio');
  assert(state.schemaBuilderDdl[1]?.length === 1, 'limpar preserva a tabela acumulada');
  assert(spy.results.includes('Rascunho limpo'), 'resultado diferencia rascunho de modelo salvo');

  fb = await clickRun('');
  assert(fb?.type === 'incomplete', `validar vazio recebe orientação → ${fb?.type}`);
  assert(spy.editor === '', 'validar vazio não repõe o modelo no editor');
  assert(state.schemaBuilderDdl[1]?.length === 1, 'validar vazio não duplica nem altera o modelo');

  console.log('\n[3] Execução 2: acrescenta a segunda tabela após limpar o editor');
  const funcionariosDraft = `CREATE TABLE funcionarios (
    id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cargo TEXT NOT NULL,
    departamento_id INTEGER, FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
  )`;
  fb = await clickRun(funcionariosDraft);
  assert(fb && fb.type !== 'sql_error',
    `execução 2 sem ponto e vírgula preserva o modelo → ${fb?.type} ${fb?.type === 'sql_error' ? fb.message : ''}`);
  assert(fb && fb.type === 'correct', `execução 2 conclui o modelo → ${fb?.type}`);
  assert(state.completedLevels.includes(1), 'desafio 1 marcado como concluído');
  assert(state.schemaBuilderDdl[1]?.length === 2, `modelo salvo com 2 instruções (${state.schemaBuilderDdl[1]?.length})`);
  assert(spy.editor === funcionariosDraft, 'editor preserva apenas o rascunho enviado');
  assert(!spy.editor.includes('CREATE TABLE departamentos'), 'modelo acumulado não é despejado de volta no editor');

  console.log('\n[4] Execução 3: reexecutar o mesmo modelo é idempotente');
  fb = await clickRun(spy.editor);
  assert(fb && fb.type === 'correct', `reexecução → ${fb?.type} (esperado correct)`);
  assert(state.schemaBuilderDdl[1]?.length === 2, `modelo não duplica instruções (${state.schemaBuilderDdl[1]?.length})`);

  console.log('\n[5] Próximo modelo reabilita o editor');
  const nextListener = env.listeners.find(listener => listener.el === 'btn-next' && listener.type === 'click');
  assert(env.elements.get('btn-next').hidden === false, 'CTA aparece após validar o primeiro modelo');
  assert(spy.editorButtonsEnabled === false, 'editor fica bloqueado enquanto aguarda o avanço');
  nextListener.fn();
  assert(state.currentLevel === 2, 'CTA abre o segundo modelo');
  assert(spy.editorButtonsEnabled === true, 'Run e Limpar são reabilitados no novo modelo');
  assert(env.elements.get('btn-next').textContent === 'PRÓXIMO MODELO →', 'CTA restaura o rótulo do Construtor de Schema');
  assert(state.schemaBuilderDdl[2]?.length === 2, 'modelo 2 herda as duas tabelas validadas no modelo 1');
  assert(spy.editor === '', 'novo desafio inicia com um rascunho vazio');
  assert(spy.checklist.includes('departamentos') && spy.checklist.includes('funcionarios'),
    'checklist mostra o modelo herdado sem despejá-lo no editor');

  console.log('\n[6] Comando proibido não executa nem entra no modelo salvo');
  const env2 = loadApp(SQL);
  const s2 = env2.state;
  s2.currentCase = 'schema-builder';
  s2.currentLevel = 1;
  s2.sandboxMode = false;
  s2.schemaBuilderDdl = {};
  s2.completedLevels = [];
  s2.levelProgress = {};
  s2.hintsRevealed = [];
  s2.evidence = [];
  await env2.dbApi.initDB('schema-builder', { force: true });

  const clickRun2 = async (typed) => { env2.spy.editor = typed; await env2.runListener.fn(); return env2.spy.feedback; };

  let fb2 = await clickRun2("INSERT INTO departamentos VALUES (1, 'RH');");
  assert(fb2 && fb2.type === 'blocked', `comando proibido → ${fb2?.type} (esperado blocked)`);
  assert(!s2.schemaBuilderDdl[1] || s2.schemaBuilderDdl[1].length === 0,
    `comando proibido não entra no modelo (${JSON.stringify(s2.schemaBuilderDdl[1])})`);

  console.log('\n[7] Depois do bloqueio, o desafio continua concluível');
  fb2 = await clickRun2(`
    CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
    CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cargo TEXT NOT NULL,
      departamento_id INTEGER, FOREIGN KEY (departamento_id) REFERENCES departamentos(id));`);
  assert(fb2 && fb2.type === 'correct', `modelo correto após bloqueio → ${fb2?.type}`);

  console.log('\n[8] FK com ON DELETE CASCADE é aceita pelo handler');
  const env3 = loadApp(SQL);
  const s3 = env3.state;
  s3.currentCase = 'schema-builder';
  s3.currentLevel = 1;
  s3.sandboxMode = false;
  s3.schemaBuilderDdl = {};
  s3.completedLevels = [];
  s3.levelProgress = {};
  s3.hintsRevealed = [];
  s3.evidence = [];
  await env3.dbApi.initDB('schema-builder', { force: true });
  env3.spy.editor = `
    CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
    CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cargo TEXT NOT NULL,
      departamento_id INTEGER,
      FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE);`;
  await env3.runListener.fn();
  assert(env3.spy.feedback?.type === 'correct',
    `modelo com ON DELETE CASCADE → ${env3.spy.feedback?.type} (esperado correct)`);

  console.log('\n[9] Erro de sintaxe não corrompe o modelo já salvo');
  const antes = JSON.stringify(s3.schemaBuilderDdl[1]);
  env3.spy.editor = 'CREATE TABELA errada (id INTEGER;';
  await env3.runListener.fn();
  assert(env3.spy.feedback?.type === 'sql_error', `DDL inválido → ${env3.spy.feedback?.type}`);
  assert(JSON.stringify(s3.schemaBuilderDdl[1]) === antes, 'modelo salvo permanece intacto após erro');

  console.log('\n[10] Tabelas auxiliares são preservadas no modelo e no diagrama');
  const envDrop = loadApp(SQL);
  const sDrop = envDrop.state;
  sDrop.currentCase = 'schema-builder';
  sDrop.currentLevel = 1;
  sDrop.sandboxMode = false;
  sDrop.schemaBuilderDdl = {
    1: [
      'CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);',
      'CREATE TABLE turma (id INTEGER PRIMARY KEY, serie INTEGER NOT NULL, ano_letivo INTEGER NOT NULL);',
    ],
  };
  sDrop.completedLevels = [];
  sDrop.levelProgress = {};
  sDrop.hintsRevealed = [];
  sDrop.evidence = [];
  await envDrop.dbApi.initDB('schema-builder', { force: true });

  envDrop.spy.editor = `CREATE TABLE turmas (
    id INTEGER PRIMARY KEY,
    serie INTEGER NOT NULL,
    ano_letivo INTEGER NOT NULL
  )
  DROP TABLE turma`;
  await envDrop.runListener.fn();
  assert(envDrop.spy.feedback?.type === 'missing_table',
    `modelo continua validavel depois do DROP -> ${envDrop.spy.feedback?.type}`);
  assert(sDrop.schemaBuilderDdl[1]?.some(statement => /CREATE TABLE turmas\b/i.test(statement)),
    'CREATE do mesmo rascunho entra no modelo');
  assert(!sDrop.schemaBuilderDdl[1]?.some(statement => /CREATE TABLE turma\b/i.test(statement)),
    'DROP remove a definicao antiga do modelo acumulado');
  assert(!envDrop.dbApi.getSchemaText().includes('TABLE turma\n'),
    'tabela removida desaparece do banco reconstruido');
  assert(envDrop.spy.diagram.includes('turmas') && !envDrop.spy.diagram.includes('TABLE turma\n'),
    'diagrama e atualizado depois da remocao');

  const stateBeforeMissingDrop = JSON.stringify(sDrop.schemaBuilderDdl[1]);
  envDrop.spy.editor = 'DROP TABLE tabela_inexistente';
  await envDrop.runListener.fn();
  assert(envDrop.spy.feedback?.type === 'sql_error', 'DROP inexistente retorna erro explicito');
  assert(JSON.stringify(sDrop.schemaBuilderDdl[1]) === stateBeforeMissingDrop,
    'DROP inexistente nao altera o modelo salvo');

  envDrop.spy.editor = 'DROP VIEW alguma_view';
  await envDrop.runListener.fn();
  assert(envDrop.spy.feedback?.type === 'blocked', 'DROP VIEW continua bloqueado');

  const env4 = loadApp(SQL);
  const s4 = env4.state;
  s4.currentCase = 'schema-builder';
  s4.currentLevel = 1;
  s4.sandboxMode = false;
  s4.schemaBuilderDdl = {};
  s4.completedLevels = [];
  s4.levelProgress = {};
  s4.hintsRevealed = [];
  s4.evidence = [];
  await env4.dbApi.initDB('schema-builder', { force: true });

  env4.spy.editor = 'CREATE TABLE auditoria_modelo (id INTEGER PRIMARY KEY)';
  await env4.runListener.fn();
  assert(env4.spy.feedback?.type === 'missing_table',
    `tabela auxiliar fora do briefing é aceita → ${env4.spy.feedback?.type}`);
  assert(Array.isArray(s4.schemaBuilderDdl[1]) && s4.schemaBuilderDdl[1].length === 1,
    'tabela auxiliar entra no modelo acumulado');
  assert(env4.dbApi.getSchemaText().includes('auditoria_modelo'), 'tabela auxiliar aparece no banco usado pelo diagrama');
  env4.erListener.fn();
  assert(env4.elements.get('er-modal').hidden === false, 'DIAGRAMA ER abre depois de criar a tabela auxiliar');
  assert(env4.spy.diagram.includes('auditoria_modelo'), 'DIAGRAMA ER recebe a tabela auxiliar do banco ativo');
  assert(env4.spy.editor.includes('auditoria_modelo'), 'editor preserva somente o rascunho da tabela auxiliar');

  env4.spy.editor = `
    CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
    CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cargo TEXT NOT NULL,
      departamento_id INTEGER, FOREIGN KEY (departamento_id) REFERENCES departamentos(id));`;
  await env4.runListener.fn();
  assert(env4.spy.feedback?.type === 'correct', 'desafio continua concluível com a tabela auxiliar presente');
  assert(s4.schemaBuilderDdl[1]?.length === 3, 'modelo final preserva as duas tabelas pedidas e a auxiliar');
  env4.erListener.fn();
  assert(env4.spy.diagram.includes('auditoria_modelo'), 'tabela auxiliar continua no diagrama após concluir o desafio');

  console.log('\n[11] Progresso legado com CREATEs colados é reparado automaticamente');
  const env5 = loadApp(SQL);
  const s5 = env5.state;
  s5.currentCase = 'schema-builder';
  s5.currentLevel = 1;
  s5.sandboxMode = false;
  s5.schemaBuilderDdl = {
    1: [`CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL)
        CREATE TABLE funcionarios (id INTEGER PRIMARY KEY)`],
  };
  s5.completedLevels = [];
  s5.levelProgress = {};
  s5.hintsRevealed = [];
  s5.evidence = [];
  await env5.dbApi.initDB('schema-builder', { force: true });

  env5.spy.editor = `CREATE TABLE funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT
  );`;
  await env5.runListener.fn();
  assert(env5.spy.feedback?.type !== 'sql_error',
    `comando exato do relato não retorna erro SQL → ${env5.spy.feedback?.type}`);
  assert(s5.schemaBuilderDdl[1]?.length === 2,
    `modelo legado foi separado e salvo com 2 instruções (${s5.schemaBuilderDdl[1]?.length})`);

  console.log('\n[12] Reload preserva tabelas auxiliares e abre rascunho vazio');
  const env6 = loadApp(SQL);
  const s6 = env6.state;
  s6.currentCase = 'schema-builder';
  s6.currentLevel = 1;
  s6.sandboxMode = false;
  s6.schemaBuilderDdl = {
    1: [
      'CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);',
      'CREATE TABLE departamento (id INTEGER PRIMARY KEY);',
      'CREATE TABLE departament (id INTEGER PRIMARY KEY);',
      'CREATE TABLE departamen (id INTEGER PRIMARY KEY);',
      'CREATE TABLE pessoa (id INTEGER PRIMARY KEY);',
    ],
  };
  s6.completedLevels = [];
  s6.levelProgress = {};
  s6.hintsRevealed = [];
  s6.evidence = [];

  env6.app.loadMission(1);
  assert(s6.schemaBuilderDdl[1]?.length === 5,
    `estado restaurado preserva tabelas auxiliares (${s6.schemaBuilderDdl[1]?.length})`);
  assert(s6.schemaBuilderDdl[1][0].includes('CREATE TABLE departamentos'),
    'migração preserva departamentos');
  assert(s6.schemaBuilderDdl[1].some(statement => statement.includes('CREATE TABLE pessoa')),
    'reload não remove tabelas auxiliares pelo nome');
  assert(env6.spy.editor === '', 'reload não despeja o modelo acumulado no rascunho');
  assert(env6.spy.checklist.includes('departamento') && env6.spy.checklist.includes('departament'),
    `modelo restaurado mantém tabelas usadas no diagrama (${JSON.stringify(env6.spy.checklist)})`);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TOTAL: ${passed + failed} testes — ${passed} passaram, ${failed} falharam`);
  if (failed > 0) process.exit(1);
}

run().catch(err => { console.error('Erro fatal:', err); process.exit(1); });
