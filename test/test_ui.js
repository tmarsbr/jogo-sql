/** Testes focados nas regressões de interface do tema Cyber Forensics. */
const fs = require('fs');
const path = require('path');
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
  const sidebarTabs = ['lesson', 'diagram', 'evidence', 'graph', 'timeline', 'suspects', 'hints'].map((name, index) => {
    const el = createElement(`sidebar-tab-${name}`, index === 0 ? ['active'] : []);
    el.dataset.sidebarTab = name;
    return el;
  });
  const sidebarPanes = ['lesson', 'diagram', 'evidence', 'graph', 'timeline', 'suspects', 'hints'].map((name, index) =>
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
get('sidebar-tabs-nav').hidden = true;
ui.configureSidebarTabs({ graph: false, timeline: false, suspects: false, lesson: false, diagram: false });
assert(get('sidebar-tabs-nav').hidden === false, 'barra de Aula, Evidências e Dicas volta a ficar visível');
assert(sidebarTabs.find(tab => tab.dataset.sidebarTab === 'timeline').hidden === true, 'aba Tempo é ocultada sem gameplay');
assert(sidebarTabs.find(tab => tab.dataset.sidebarTab === 'evidence').classList.contains('active'), 'Evidências volta a ser a aba ativa');
assert(sidebarPanes.find(pane => pane.id === 'sidebar-pane-evidence').hidden === false, 'painel de Evidências fica visível');

console.log('\n[4b] Aba de Diagrama é configurada e ativada');
ui.configureSidebarTabs({ graph: false, timeline: false, suspects: false, lesson: false, diagram: true });
assert(sidebarTabs.find(tab => tab.dataset.sidebarTab === 'diagram').hidden === false, 'aba Diagrama está visível');
ui.activateSidebarTab('diagram');
assert(sidebarTabs.find(tab => tab.dataset.sidebarTab === 'diagram').classList.contains('active'), 'aba Diagrama fica ativa');
assert(sidebarPanes.find(pane => pane.id === 'sidebar-pane-diagram').hidden === false, 'painel do Diagrama fica visível');

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
ui.renderMissionRail([lessonLevel], 2, [], null, [], [2]);
assert(get('rail-buttons-container').innerHTML.includes('disabled aria-disabled="true"'), 'rail desabilita missão sequencial ainda bloqueada');

console.log('\n[6b] Rails especiais permanecem compactos e acessíveis');
ui.renderSchemaRail([
  { id: 1, number: 1, title: 'TechStart: Funcionários e Departamentos' },
  { id: 2, number: 2, title: 'TechStart: Projetos e Relação N:N' },
], 1, [2]);
let compactRailHtml = get('rail-buttons-container').innerHTML;
assert(compactRailHtml.includes('class="rail-btn active"'), 'Schema Builder reutiliza o botão compacto no item ativo');
assert(compactRailHtml.includes('class="rail-btn completed"'), 'Schema Builder sinaliza item concluído');
assert(compactRailHtml.includes('aria-label="Modelo 01: TechStart:'), 'título completo do modelo permanece acessível');
assert(/>01<\/button>/.test(compactRailHtml), 'modelo pendente mostra somente o número dentro do rail');

ui.renderBugRail([
  { id: 'bug-1', number: 1, title: 'Consulta com JOIN incorreto' },
], 'bug-1', []);
compactRailHtml = get('rail-buttons-container').innerHTML;
assert(compactRailHtml.includes('class="rail-btn active"'), 'Bug Hunter reutiliza o botão compacto');
assert(compactRailHtml.includes('aria-label="Relatório 01: Consulta com JOIN incorreto'), 'título completo do relatório permanece acessível');
assert(/>01<\/button>/.test(compactRailHtml), 'relatório mostra somente o número dentro do rail');

console.log('\n[7] Briefing publica o contrato de saída da missão');
const contractLevel = {
  id: 2,
  title: 'Investimento por Canal',
  concept: 'SUM + JOIN',
  briefing: 'Teste',
  objective: 'Calcule o custo total investido em cada canal.',
  tables: ['canais', 'custos_diarios'],
  expectedColumns: ['canal', 'custo_total_centavos'],
  requiredConcepts: ['left join', 'coalesce'],
  requirements: ['Canais sem investimento devem exibir 0 — nunca NULL.'],
  courseRefs: ['dml-select-where'],
};
ui.renderMission(contractLevel, [lessonItem], []);
const contractHtml = get('briefing-content').innerHTML;
assert(contractHtml.includes('SAÍDA ESPERADA'), 'briefing anuncia o contrato de saída');
assert(contractHtml.includes('custo_total_centavos'), 'briefing revela os aliases exigidos pelo validador');
assert(contractHtml.includes('nunca NULL'), 'briefing lista as regras que mudam o resultado');
assert(contractHtml.includes('LEFT JOIN'), 'briefing lista as técnicas obrigatórias');

const viewContract = ui.buildMissionContract({
  expectedColumns: ['codigo', 'media_notas'],
  executionMode: 'create_view',
  viewName: 'vw_teste',
});
assert(viewContract.includes('vw_teste'), 'missão de view informa o nome exato exigido');
assert(ui.buildMissionContract({ title: 'Sem contrato' }) === '', 'missão sem contrato não renderiza o bloco');

console.log('\n[8] Confronto final identifica opções e remove evidências já usadas');
ui.showInterrogationModal({
  type: 'confrontation',
  suspectName: 'Diretoria TechBrasil',
  steps: [
    { statement: 'Primeira pergunta', evidenceId: 'ev-a' },
    { statement: 'Segunda pergunta', evidenceId: 'ev-b' },
    { statement: 'Terceira pergunta', evidenceId: 'ev-c' },
  ],
}, {
  status: 'active',
  stepIndex: 1,
  presentedEvidenceIds: ['ev-a'],
}, [
  { id: 'ev-a', label: 'Transferência de alto valor', type: 'transação', sortKey: '2024-03-11T21:00:00' },
  { id: 'ev-b', label: 'Transferência de alto valor', type: 'transação', sortKey: '2024-03-12T23:15:00' },
  { id: 'ev-c', label: 'Transferência de alto valor', type: 'transação', sortKey: '2024-03-15T22:45:00' },
]);
const interrogationHtml = get('interrogation-evidence-list').innerHTML;
assert(!interrogationHtml.includes('data-evidence-id="ev-a"'), 'evidência já apresentada sai das opções');
assert(interrogationHtml.includes('data-evidence-id="ev-b"'), 'evidência ainda disponível permanece');
assert(interrogationHtml.includes('12/03/2024 · 23:15'), 'data e hora distinguem rótulos repetidos');
assert(get('interrogation-step-progress').textContent === 'CONTRADIÇÃO 2/3', 'progresso mostra a etapa ativa');
assert(get('interrogation-title').textContent.includes('CONFRONTO FINAL'), 'título acompanha o tipo do desafio');
assert(get('interrogation-avatar').textContent === 'DT', 'avatar deriva iniciais do participante atual');
assert(get('interrogation-suspect-role').hidden === true, 'cargo antigo não vaza para outro caso');
assert(get('btn-interrogation-advance').hidden === true, 'avanço começa oculto antes de um acerto');
ui.setInterrogationFeedback('Etapa aceita.', true);
ui.showInterrogationAdvanceButton(false);
assert(get('btn-interrogation-advance').hidden === false, 'acerto libera avanço explícito');
assert(get('btn-interrogation-advance').textContent.includes('PRÓXIMA'), 'etapa intermediária anuncia a próxima contradição');
ui.showInterrogationAdvanceButton(true);
assert(get('btn-interrogation-advance').textContent.includes('CONCLUIR CASO'), 'último acerto libera conclusão explícita');

const css = fs.readFileSync(path.join(__dirname, '..', 'index.css'), 'utf8');
const evidenceButtonRule = css.match(/\.interrogation-evidence-btn\s*\{([\s\S]*?)\}/)?.[1] || '';
assert(/white-space:\s*normal/.test(evidenceButtonRule), 'botão permite quebra de linha');
assert(/justify-content:\s*space-between/.test(evidenceButtonRule), 'conteúdo não fica centralizado para fora do card');
assert(css.includes('minmax(min(100%, 220px), 1fr)'), 'grade respeita a largura disponível');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(/src\/app\.js\?v=[^"']+/.test(indexHtml), 'módulo principal usa versão para invalidar runtime antigo');
assert((indexHtml.match(/data-panel-resizer=/g) || []).length === 2, 'layout inclui duas divisórias ajustáveis');
assert(indexHtml.includes('role="separator"'), 'divisórias expõem semântica acessível');
assert(css.includes('var(--briefing-panel-width)'), 'grade usa a largura ajustável do briefing');
assert(css.includes('var(--sidebar-panel-width)'), 'grade usa a largura ajustável da lateral investigativa');
assert(/@media\s*\(max-width:\s*1180px\)[\s\S]*?\.panel-resizer\s*\{[\s\S]*?display:\s*none/.test(css), 'divisórias somem antes de a grade ultrapassar a viewport');
assert(/\.app-grid\s*>\s*\.panel-editor\s*\{\s*grid-column:\s*4/.test(css), 'editor permanece na coluna correta sem o briefing');
assert(/\.app-grid\s*>\s*\.panel-sidebar\s*\{\s*grid-column:\s*6/.test(css), 'sidebar permanece na coluna correta sem o briefing');
assert(/briefing-collapsed\s+\.panel-editor\s*\{[\s\S]*?grid-row:\s*1/.test(css), 'tablet remove a linha vazia ao recolher o briefing');
assert(/\.app-grid\.briefing-collapsed\s*\{[\s\S]*?grid-template-columns:\s*56px\s+minmax\(0,\s*1fr\)/.test(css), 'tablet sobrescreve o template desktop quando o briefing esta recolhido');
assert(/\.app-grid\s*>\s*\.panel-briefing,[\s\S]*?\.app-grid\s*>\s*\.panel-sidebar\s*\{\s*grid-column:\s*2/.test(css), 'tablet recoloca todos os paineis na coluna de conteudo');
assert(/briefing-collapsed\s+\.panel-briefing\.active\s*\{[\s\S]*?display:\s*flex\s*!important/.test(css), 'mobile consegue reabrir o briefing recolhido');
const appGridRule = css.match(/\.app-grid\s*\{([^}]*)\}/)?.[1] || '';
assert(!/min-height:\s*680px/.test(appGridRule), 'grade principal não força altura maior que a viewport');

console.log('\n[9] Feedback do Schema Builder substitui o estado de espera');
const resultsContainer = get('results-container');
let resultsHtml = '<p class="placeholder-text">Aguardando consulta.</p>';
let renderedFeedback = null;
let resultClearCount = 0;
Object.defineProperty(resultsContainer, 'innerHTML', {
  configurable: true,
  get() { return resultsHtml; },
  set(value) {
    resultsHtml = String(value);
    if (resultsHtml === '') {
      renderedFeedback = null;
      resultClearCount++;
    }
  },
});
resultsContainer.appendChild = element => { renderedFeedback = element; };
ui.renderSchemaFeedback(null);
assert(resultsHtml.includes('placeholder-text'), 'ausÃªncia de feedback preserva o estado inicial do painel');
assert(resultClearCount === 0, 'ausÃªncia de feedback nÃ£o limpa o painel');
ui.renderSchemaFeedback({ type: 'sql_error', message: 'near "create": syntax error' });
assert(!resultsHtml.includes('placeholder-text'), 'erro remove o placeholder contraditório');
assert(renderedFeedback?.className.includes('feedback-error'), 'erro renderiza um único feedback de falha');
ui.renderSchemaFeedback({ type: 'missing_table', message: 'Falta funcionarios.' });
assert(resultClearCount === 2, 'novo feedback substitui integralmente o anterior');
assert(renderedFeedback?.className.includes('feedback-warn'), 'feedback mais recente permanece visível');

console.log('\n[10] CTA da aula abre também o painel externo no mobile');
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
