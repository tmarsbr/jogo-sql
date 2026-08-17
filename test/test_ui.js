/** Testes focados nas regressões de interface do tema Cyber Forensics. */
const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) { console.log(`  PASS: ${message}`); passed++; }
  else { console.log(`  FAIL: ${message}`); failed++; }
}

function createClassList(initial = []) {
  const values = new Set(initial);
  return {
    add: (...names) => names.forEach(name => values.add(name)),
    remove: (...names) => names.forEach(name => values.delete(name)),
    contains: name => values.has(name),
    toggle: (name, force) => {
      const add = force === undefined ? !values.has(name) : Boolean(force);
      if (add) values.add(name); else values.delete(name);
      return add;
    },
  };
}

function createElement(id, classes = []) {
  return {
    id,
    hidden: false,
    disabled: false,
    tabIndex: 0,
    dataset: {},
    textContent: '',
    innerHTML: '',
    style: { cssText: '' },
    classList: createClassList(classes),
    setAttribute(name, value) { this[name] = String(value); },
    removeAttribute(name) { delete this[name]; },
    addEventListener() {},
    focus() { this.focused = true; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    insertBefore() {},
  };
}

function createDocument() {
  const elements = new Map();
  const documentListeners = [];
  const sidebarTabs = ['lesson', 'evidence', 'graph', 'timeline', 'suspects', 'hints'].map((name, index) => {
    const el = createElement(`sidebar-tab-${name}`, index === 0 ? ['active'] : []);
    el.dataset.sidebarTab = name;
    return el;
  });
  const sidebarPanes = ['lesson', 'evidence', 'graph', 'timeline', 'suspects', 'hints'].map((name, index) =>
    createElement(`sidebar-pane-${name}`, index === 0 ? ['sidebar-tab-pane', 'active'] : ['sidebar-tab-pane'])
  );
  for (const el of [...sidebarTabs, ...sidebarPanes]) elements.set(el.id, el);
  const panels = ['briefing', 'editor', 'sidebar'].map((name, index) =>
    createElement(`panel-${name}`, ['panel', `panel-${name}`, ...(index === 0 ? ['active'] : [])])
  );
  const mobileTabs = ['briefing', 'editor', 'sidebar'].map((name, index) => {
    const el = createElement(`mobile-tab-${name}`, ['tab-btn', ...(index === 0 ? ['active'] : [])]);
    el.dataset.tab = name;
    return el;
  });
  for (const el of [...panels, ...mobileTabs]) elements.set(el.id, el);

  function get(id) {
    if (!elements.has(id)) elements.set(id, createElement(id));
    return elements.get(id);
  }

  const document = {
    activeElement: null,
    querySelector(selector) {
      if (selector.startsWith('#')) return get(selector.slice(1));
      const panelMatch = selector.match(/^\.panel-(\w+)$/);
      if (panelMatch) return panels.find(panel => panel.id === `panel-${panelMatch[1]}`) || null;
      const tabMatch = selector.match(/^\.tab-btn\[data-tab="(\w+)"\]$/);
      if (tabMatch) return mobileTabs.find(tab => tab.dataset.tab === tabMatch[1]) || null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '#sidebar-tabs-nav .sidebar-tab-btn') return sidebarTabs;
      if (selector === '.sidebar-tab-pane') return sidebarPanes;
      if (selector === '.panel') return panels;
      if (selector === '.tab-btn') return mobileTabs;
      return [];
    },
    getElementById: get,
    createElement() {
      const el = createElement('generated');
      Object.defineProperty(el, 'textContent', {
        get() { return this._text || ''; },
        set(value) {
          this._text = String(value);
          this.innerHTML = String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        },
      });
      return el;
    },
    addEventListener(type, listener) { documentListeners.push({ type, listener }); },
    dispatchEvent(event) {
      documentListeners.filter(item => item.type === event.type).forEach(item => item.listener(event));
    },
  };
  return { document, get, sidebarTabs, sidebarPanes, panels };
}

const { document, get, sidebarTabs, sidebarPanes, panels } = createDocument();
const state = { score: 0, hintsRevealed: [] };
const ui = evalModule(transformESM(readSource('ui.js')), {
  document,
  state,
  getSuspectProfiles: () => [],
  renderGraphSVG: () => '<svg></svg>',
}, 'ui.js');
ui.initDOM();

console.log('\n[1] Badge da missão mantém o total');
get('header-progress-label').textContent = '0/12 MISSÕES';
ui.setMissionStatus('Missão 7: Acima do limite');
assert(get('mission-num-badge').textContent === 'MISSÃO 07/12', 'badge mostra missão atual e total');

console.log('\n[2] Botão de dica preserva o contador');
state.hintsRevealed = [{ source: 'local', text: 'dica' }];
ui.setHintButtonLoading(false);
assert(get('btn-hint').textContent === 'SOLICITAR DICA (2 RESTANTES)', 'rótulo não é sobrescrito por texto genérico');

console.log('\n[3] Evidência concluída fora de ordem continua visível');
const levels = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: `Missão ${index + 1}`,
  evidence: `Evidência da missão ${index + 1}`,
}));
ui.renderEvidence(['Evidência da missão 12'], levels, [12]);
assert(get('evidence-display').innerHTML.includes('EVIDÊNCIA 12'), 'cartão da missão 12 foi incluído');

console.log('\n[4] Abas incompatíveis voltam para Evidências');
sidebarTabs.forEach(tab => tab.classList.remove('active'));
sidebarTabs.find(tab => tab.dataset.sidebarTab === 'timeline').classList.add('active');
ui.configureSidebarTabs({ graph: false, timeline: false, suspects: false, lesson: false });
assert(sidebarTabs.find(tab => tab.dataset.sidebarTab === 'timeline').hidden === true, 'aba Tempo é ocultada sem gameplay');
assert(sidebarTabs.find(tab => tab.dataset.sidebarTab === 'evidence').classList.contains('active'), 'Evidências volta a ser a aba ativa');
assert(sidebarPanes.find(pane => pane.id === 'sidebar-pane-evidence').hidden === false, 'painel de Evidências fica visível');

console.log('\n[5] Timeline só habilita verificação com todos os eventos');
const timeline = {
  events: [
    { id: 'a', label: 'A', type: 'acesso', sortKey: '1', unlockedByMission: 1 },
    { id: 'b', label: 'B', type: 'transação', sortKey: '2', unlockedByMission: 2 },
  ],
};
ui.renderTimeline(timeline, [1], ['a']);
assert(get('btn-timeline-check').disabled === true, 'verificação parcial permanece desabilitada');
ui.renderTimeline(timeline, [1, 2], ['a', 'b']);
assert(get('btn-timeline-check').disabled === false, 'verificação é liberada com todos os eventos');

console.log('\n[6] Estado de leitura aparece na aba, CTA e rail');
ui.updateLessonTabBadge(true);
assert(get('sidebar-tab-lesson').classList.contains('has-unread'), 'aba sinaliza aula não lida');
assert(get('sidebar-tab-lesson')['aria-label'] === 'Aula não lida', 'sinal da aba tem nome acessível');
const lessonLevel = { id: 2, title: 'Filtro', concept: 'WHERE', briefing: 'Teste', objective: 'Filtrar', tables: ['clientes'], courseRefs: ['dml-select-where'] };
const lessonItem = { id: 'dml-select-where', concept: 'SELECT e WHERE' };
ui.renderMission(lessonLevel, [lessonItem], ['dml-select-where']);
assert(get('briefing-content').innerHTML.includes('✓ LIDA'), 'CTA marca aula lida');
ui.renderMissionRail([lessonLevel], 2, [], null, ['dml-select-where']);
assert(get('rail-buttons-container').innerHTML.includes('rail-lesson-check'), 'rail marca aula lida');

console.log('\n[7] CTA da aula abre também o painel externo no mobile');
ui.initSidebarTabs();
document.dispatchEvent({
  type: 'click',
  target: { closest: selector => selector === '[data-open-lesson]' ? {} : null },
});
assert(panels.find(panel => panel.id === 'panel-sidebar').classList.contains('active'), 'painel sidebar é ativado pelo CTA');

console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
