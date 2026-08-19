/**
 * test_panel_resizer.js - Testes unitarios do redimensionador acessivel.
 */

const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.log(`  FAIL: ${message}`);
    failed++;
  }
}

class FakeClassList {
  constructor(initial = []) {
    this.values = new Set(initial);
  }

  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) {
    const add = force === undefined ? !this.values.has(value) : Boolean(force);
    if (add) this.values.add(value); else this.values.delete(value);
    return add;
  }
}

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }

  removeEventListener(type, listener) {
    if (this.listeners.has(type)) this.listeners.get(type).delete(listener);
  }

  dispatch(type, eventProps = {}) {
    const event = {
      type,
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; },
      ...eventProps,
    };
    const set = this.listeners.get(type);
    if (set) {
      for (const listener of Array.from(set)) {
        listener(event);
      }
    }
    return event;
  }
}

class FakeElement extends FakeEventTarget {
  constructor(width = 0) {
    super();
    this.width = width;
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.textContent = '';
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  getBoundingClientRect() {
    return { width: this.width, height: 600, top: 0, left: 0, right: this.width, bottom: 600 };
  }

  setPointerCapture(id) { this.captured = id; }
  releasePointerCapture(id) { if (this.captured === id) this.captured = null; }
  querySelector(selector) {
    if (selector === '.rail-toggle-icon' && this.icon) return this.icon;
    return null;
  }
}

class FakeStorage {
  constructor(initial = {}) {
    this.data = { ...initial };
  }

  getItem(key) { return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null; }
  setItem(key, value) { this.data[key] = String(value); }
}

function makeEnvironment(storedValue, gridWidth = 0) {
  const documentRef = new FakeEventTarget();
  const grid = new FakeElement(gridWidth);
  grid.clientWidth = gridWidth;
  grid.style = {
    values: {},
    setProperty(name, value) { this.values[name] = value; },
  };
  const briefingHandle = new FakeElement();
  const sidebarHandle = new FakeElement();
  const briefingPanel = new FakeElement(320);
  const sidebarPanel = new FakeElement(340);
  const body = { classList: new FakeClassList() };

  const btnRailToggle = new FakeElement();
  const railIcon = new FakeElement();
  btnRailToggle.icon = railIcon;
  const btnCollapse = new FakeElement();
  const btnToggle = new FakeElement();

  const selectorMap = {
    '.app-grid': grid,
    '[data-panel-resizer="briefing"]': briefingHandle,
    '[data-panel-resizer="sidebar"]': sidebarHandle,
    '#panel-briefing': briefingPanel,
    '#panel-sidebar': sidebarPanel,
    '#btn-rail-toggle-briefing': btnRailToggle,
    '#btn-collapse-briefing': btnCollapse,
    '#btn-toggle-briefing': btnToggle,
  };
  documentRef.querySelector = selector => selectorMap[selector] || null;
  documentRef.getElementById = id => selectorMap[`#${id}`] || null;
  documentRef.body = body;

  const storage = new FakeStorage(storedValue === undefined ? {} : {
    'sql-detective-panel-widths': storedValue,
  });
  const windowRef = new FakeEventTarget();
  windowRef.localStorage = storage;

  return {
    documentRef,
    windowRef,
    storage,
    grid,
    body,
    briefingHandle,
    sidebarHandle,
    btnRailToggle,
    railIcon,
    btnCollapse,
    btnToggle,
  };
}

const source = readSource('panel-resizer.js');
const { initPanelResizers } = evalModule(transformESM(source), {}, 'panel-resizer.js');

console.log('\n[1] Inicializacao e acessibilidade');
const env = makeEnvironment();
const cleanup = initPanelResizers(env);
assert(typeof cleanup === 'function', 'retorna uma funcao de cleanup');
assert(env.grid.style.values['--briefing-panel-width'] === '320px', 'aplica largura inicial do briefing');
assert(env.grid.style.values['--sidebar-panel-width'] === '340px', 'aplica largura inicial da sidebar');
assert(env.briefingHandle.getAttribute('role') === 'separator', 'handle recebe role separator');
assert(env.briefingHandle.getAttribute('aria-valuemin') === '240', 'informa minimo via ARIA');
assert(env.briefingHandle.getAttribute('aria-valuemax') === '520', 'informa maximo via ARIA');
assert(env.briefingHandle.getAttribute('aria-valuenow') === '320', 'informa valor atual via ARIA');
assert(env.sidebarHandle.getAttribute('aria-valuemax') === '760', 'informa o novo maximo da sidebar via ARIA');

console.log('\n[2] Drag do briefing aumenta para a direita e respeita limites');
const startEvent = env.briefingHandle.dispatch('pointerdown', { clientX: 100, pointerId: 5 });
assert(startEvent.defaultPrevented, 'pointerdown evita selecao acidental');
assert(env.body.classList.contains('is-panel-resizing'), 'body sinaliza drag ativo');
assert(env.briefingHandle.classList.contains('is-dragging'), 'handle sinaliza o estado visual de arraste');
assert(env.briefingHandle.captured === 5, 'captura o ponteiro quando suportado');
env.documentRef.dispatch('pointermove', { clientX: 200, pointerId: 5 });
assert(env.grid.style.values['--briefing-panel-width'] === '420px', 'delta positivo aumenta briefing');
env.documentRef.dispatch('pointermove', { clientX: 900, pointerId: 5 });
assert(env.grid.style.values['--briefing-panel-width'] === '520px', 'briefing e limitado ao maximo');
env.documentRef.dispatch('pointerup', { pointerId: 5 });
assert(!env.body.classList.contains('is-panel-resizing'), 'remove classe ao terminar o drag');
assert(!env.briefingHandle.classList.contains('is-dragging'), 'remove estado visual do handle ao terminar');
assert(env.briefingHandle.captured === null, 'libera a captura do ponteiro');

console.log('\n[3] Drag da sidebar usa delta invertido e persiste');
env.sidebarHandle.dispatch('pointerdown', { clientX: 500, pointerId: 8 });
env.documentRef.dispatch('pointermove', { clientX: 450, pointerId: 8 });
env.documentRef.dispatch('pointerup', { pointerId: 8 });
assert(env.grid.style.values['--sidebar-panel-width'] === '390px', 'mover divisor para esquerda aumenta sidebar');
const saved = JSON.parse(env.storage.getItem('sql-detective-panel-widths'));
assert(saved.briefing === 520 && saved.sidebar === 390, 'salva ambos os tamanhos em chave propria');

console.log('\n[4] Teclado, Home, End e reset por duplo clique');
const arrow = env.sidebarHandle.dispatch('keydown', { key: 'ArrowRight' });
assert(arrow.defaultPrevented, 'seta tratada evita o scroll da pagina');
assert(env.grid.style.values['--sidebar-panel-width'] === '380px', 'ArrowRight reduz o painel que fica a direita');
env.sidebarHandle.dispatch('keydown', { key: 'Home' });
assert(env.grid.style.values['--sidebar-panel-width'] === '280px', 'Home aplica o minimo');
env.sidebarHandle.dispatch('keydown', { key: 'End' });
assert(env.grid.style.values['--sidebar-panel-width'] === '760px', 'End aplica o novo maximo');
env.sidebarHandle.dispatch('dblclick');
assert(env.grid.style.values['--sidebar-panel-width'] === '340px', 'duplo clique restaura o padrao');

console.log('\n[5] Restaura storage valido e limita valores persistidos');
const restored = makeEnvironment(JSON.stringify({ briefing: 410, sidebar: 9999 }));
initPanelResizers(restored);
assert(restored.grid.style.values['--briefing-panel-width'] === '410px', 'restaura briefing persistido');
assert(restored.grid.style.values['--sidebar-panel-width'] === '760px', 'limita valor persistido invalido para a faixa');
assert(restored.sidebarHandle.getAttribute('aria-valuenow') === '760', 'ARIA acompanha valor restaurado');

console.log('\n[6] Larguras combinadas preservam o espaço mínimo do editor');
const constrained = makeEnvironment(JSON.stringify({ briefing: 520, sidebar: 520 }), 1366);
initPanelResizers(constrained);
const constrainedBriefing = parseInt(constrained.grid.style.values['--briefing-panel-width'], 10);
const constrainedSidebar = parseInt(constrained.grid.style.values['--sidebar-panel-width'], 10);
assert(constrainedBriefing + constrainedSidebar === 894,
  'storage largo é reduzido ao orçamento combinado da grade');
assert(constrainedBriefing >= 240 && constrainedSidebar >= 280,
  'orçamento combinado preserva os mínimos dos painéis laterais');

constrained.grid.clientWidth = 1181;
constrained.grid.width = 1181;
constrained.windowRef.dispatch('resize');
const narrowBriefing = parseInt(constrained.grid.style.values['--briefing-panel-width'], 10);
const narrowSidebar = parseInt(constrained.grid.style.values['--sidebar-panel-width'], 10);
assert(narrowBriefing + narrowSidebar === 709,
  'resize recalcula as laterais e reserva 400px para o editor');

constrained.grid.clientWidth = 1512;
constrained.grid.width = 1512;
constrained.windowRef.dispatch('resize');
assert(constrained.grid.style.values['--briefing-panel-width'] === '520px'
  && constrained.grid.style.values['--sidebar-panel-width'] === '520px',
  'preferências reaparecem quando a viewport volta a comportá-las');

console.log('\n[7] Cleanup e ambientes parciais');
cleanup();
cleanup();
env.briefingHandle.dispatch('keydown', { key: 'Home' });
assert(env.grid.style.values['--briefing-panel-width'] === '520px', 'cleanup idempotente remove listeners');
let missingDomDidThrow = false;
try {
  const emptyCleanup = initPanelResizers({ documentRef: null, windowRef: null, storage: null });
  emptyCleanup();
} catch (_) {
  missingDomDidThrow = true;
}
assert(!missingDomDidThrow, 'DOM ausente nao causa erro');

const throwingStorage = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); },
};
let storageDidThrow = false;
try {
  const fragile = makeEnvironment();
  initPanelResizers({ ...fragile, storage: throwingStorage });
  fragile.briefingHandle.dispatch('keydown', { key: 'ArrowRight' });
} catch (_) {
  storageDidThrow = true;
}
assert(!storageDidThrow, 'storage indisponivel nao interrompe a interface');

console.log('\n[8] Recolhimento e expansao do painel de inquerito/briefing');
const collapseEnv = makeEnvironment();
initPanelResizers(collapseEnv);

// Inicia expandido
assert(!collapseEnv.grid.classList.contains('briefing-collapsed'), 'inicia expandido por padrao');
assert(collapseEnv.btnRailToggle.getAttribute('aria-expanded') === 'true', 'rail indica expandido');
assert(collapseEnv.railIcon.textContent === '◀', 'icone do rail indica recolhimento');

// Clica no botao de fechar no cabecalho do inquerito
collapseEnv.btnCollapse.dispatch('click');
assert(collapseEnv.grid.classList.contains('briefing-collapsed'), 'adiciona briefing-collapsed na grade');
assert(collapseEnv.btnRailToggle.getAttribute('aria-expanded') === 'false', 'rail indica recolhido');
assert(collapseEnv.railIcon.textContent === '▶', 'icone do rail vira seta para a direita');
assert(collapseEnv.btnToggle.classList.contains('active'), 'botao do editor fica ativo quando recolhido');
const savedCollapse1 = JSON.parse(collapseEnv.storage.getItem('sql-detective-panel-widths'));
assert(savedCollapse1.briefingCollapsed === true, 'persiste briefingCollapsed = true');

// Clica no botao do rail para expandir de volta
collapseEnv.btnRailToggle.dispatch('click');
assert(!collapseEnv.grid.classList.contains('briefing-collapsed'), 'remove briefing-collapsed');
assert(collapseEnv.btnRailToggle.getAttribute('aria-expanded') === 'true', 'rail indica expandido novamente');
assert(collapseEnv.railIcon.textContent === '◀', 'icone do rail volta para seta para a esquerda');

// Clica no botao do editor para alternar
collapseEnv.btnToggle.dispatch('click');
assert(collapseEnv.grid.classList.contains('briefing-collapsed'), 'botao do editor recolhe o inquerito');

// Atalho Ctrl+B para alternar
const ctrlB = collapseEnv.documentRef.dispatch('keydown', { key: 'b', ctrlKey: true });
assert(ctrlB.defaultPrevented, 'Ctrl+B tem default prevenido');
assert(!collapseEnv.grid.classList.contains('briefing-collapsed'), 'Ctrl+B expande de volta o inquerito');

// Restaura estado inicial quando salvo no storage
const restoredCollapsed = makeEnvironment(JSON.stringify({ briefing: 320, sidebar: 340, briefingCollapsed: true }));
initPanelResizers(restoredCollapsed);
assert(restoredCollapsed.grid.classList.contains('briefing-collapsed'), 'restaura briefing recolhido do storage');
assert(restoredCollapsed.railIcon.textContent === '▶', 'icone do rail inicia como seta para a direita');

console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
