/**
 * test_er_diagram.js — Diagrama ER v2 (canvas interativo).
 *
 * Exercita o módulo real src/er-diagram.js sobre um DOM mínimo em memória:
 * montagem, schema dinâmico, badges PK/FK, cardinalidade, seleção, hover
 * tooltip, drag de tabelas, zoom e preservação da rolagem entre interações.
 */

const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let pass = 0, fail = 0;
function check(label, condition, extra) {
  if (condition) { pass++; console.log(`  PASS: ${label}`); }
  else { fail++; console.log(`  FAIL: ${label}${extra ? ` — ${extra}` : ''}`); }
}
function eq(label, actual, expected) {
  check(label, actual === expected, `esperado ${JSON.stringify(expected)}, veio ${JSON.stringify(actual)}`);
}

/* ================================================================
   DOM mínimo em memória
   ================================================================ */

class FakeNode {
  constructor(tag, ns) {
    this.tagName = String(tag).toUpperCase();
    this.namespaceURI = ns || null;
    this.className = '';
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.attributes = {};
    this.listeners = {};
    this.clientWidth = 0;
    this.scrollLeft = 0;
    this.scrollTop = 0;
    this._text = null;   // preenchido apenas em nós de texto
    this._html = '';     // markup cru atribuído via innerHTML (deve ficar vazio)
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }
  removeChild(node) {
    const i = this.children.indexOf(node);
    if (i >= 0) this.children.splice(i, 1);
    node.parentNode = null;
    return node;
  }
  contains(node) {
    if (node === this) return true;
    return this.children.some(c => c.contains(node));
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  removeEventListener(type, fn) {
    const list = this.listeners[type];
    if (!list) return;
    const i = list.indexOf(fn);
    if (i >= 0) list.splice(i, 1);
  }
  getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: 0 }; }

  set innerHTML(value) {
    this.children.length = 0;
    this._html = value === '' ? '' : String(value);
  }
  get innerHTML() { return this._html; }

  set textContent(value) {
    this.children.length = 0;
    this._text = String(value);
  }
  get textContent() {
    if (this._text !== null) return this._text;
    return this.children.map(c => c.textContent).join('');
  }

  /* --- utilidades de teste --- */
  dispatch(type, event) {
    const list = this.listeners[type] || [];
    const e = Object.assign({
      clientX: 0, clientY: 0, deltaY: 0,
      stopPropagation() {}, preventDefault() {},
    }, event);
    list.slice().forEach(fn => fn(e));
    return e;
  }
  all(predicate, out = []) {
    if (predicate(this)) out.push(this);
    this.children.forEach(c => c.all(predicate, out));
    return out;
  }
  byClass(name) {
    return this.all(n => String(n.className).split(/\s+/).includes(name));
  }
  first(name) { return this.byClass(name)[0] || null; }
}

function makeDocument() {
  const body = new FakeNode('body');
  return {
    body,
    listeners: {},
    createElement: (tag) => new FakeNode(tag),
    createElementNS: (ns, tag) => new FakeNode(tag, ns),
    createTextNode: (text) => { const n = new FakeNode('#text'); n._text = String(text); return n; },
    addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); },
    removeEventListener(type, fn) {
      const list = this.listeners[type];
      if (!list) return;
      const i = list.indexOf(fn);
      if (i >= 0) list.splice(i, 1);
    },
    dispatch(type, event) {
      const e = Object.assign({ clientX: 0, clientY: 0, stopPropagation() {}, preventDefault() {} }, event);
      (this.listeners[type] || []).slice().forEach(fn => fn(e));
      return e;
    },
  };
}

/* ================================================================
   Schemas de teste (formato de getSchemaDetailed)
   ================================================================ */

const col = (name, type, opts = {}) => ({
  name, type, pk: !!opts.pk, notnull: !!opts.notnull, fk: opts.fk || null,
});

const CASO_001 = [
  { tableName: 'departamentos', objectType: 'table', columns: [col('id', 'INTEGER', { pk: true }), col('nome', 'TEXT'), col('andar', 'INTEGER')] },
  { tableName: 'funcionarios', objectType: 'table', columns: [col('id', 'INTEGER', { pk: true }), col('nome', 'TEXT'), col('departamento_id', 'INTEGER', { fk: 'departamentos.id', notnull: true })] },
  { tableName: 'contas', objectType: 'table', columns: [col('id', 'INTEGER', { pk: true }), col('funcionario_id', 'INTEGER', { fk: 'funcionarios.id' })] },
  { tableName: 'logs_acesso', objectType: 'table', columns: [col('id', 'INTEGER', { pk: true }), col('funcionario_id', 'INTEGER', { fk: 'funcionarios.id' }), col('local', 'TEXT')] },
];

/** Carrega o módulo real com um schema controlado. */
function load(schemaProvider) {
  const doc = makeDocument();
  const module = evalModule(
    transformESM(readSource('er-diagram.js')),
    { document: doc, WeakMap, getSchemaDetailed: schemaProvider },
    'er-diagram.js'
  );
  return { doc, module };
}

function mount(schemaProvider) {
  const { doc, module } = load(schemaProvider);
  const container = doc.createElement('div');
  doc.body.appendChild(container);
  module.renderERDiagram(container);
  return { doc, module, container };
}

console.log('\n=== Diagrama ER v2 ===');

/* ---------------------------------------------------------------- */
console.log('\n[1] Estado vazio (construtor antes do primeiro CREATE TABLE)');
{
  const { container } = mount(() => []);
  const empty = container.first('erd-empty');
  check('mostra o estado vazio', !!empty);
  check('texto convida a criar a primeira tabela',
    empty.textContent.includes('O desenho começa vazio') &&
    empty.textContent.includes('CREATE TABLE'));
  check('não monta canvas sem tabelas', container.first('erd-canvas') === null);
}

/* ---------------------------------------------------------------- */
console.log('\n[2] Montagem com schema dinâmico');
const base = mount(() => CASO_001);
{
  const { container } = base;
  check('barra de controles montada', !!container.first('erd-controls'));
  check('canvas montado', !!container.first('erd-canvas'));
  check('mundo com transform montado', !!container.first('erd-world'));
  check('legenda montada', !!container.first('erd-legend'));
  eq('um card por tabela', container.byClass('erd-table').length, 4);
  eq('linha de resumo', container.first('erd-hint').textContent, '4 TABELAS · 3 RELAÇÕES');

  const nomes = container.byClass('erd-table-name').map(n => n.textContent);
  check('nomes das tabelas renderizados', nomes.join(',') === 'departamentos,funcionarios,contas,logs_acesso', nomes.join(','));
  eq('contagem de colunas no header', container.byClass('erd-table-count')[1].textContent, '3 COL');

  const svg = container.all(n => n.tagName === 'SVG')[0];
  eq('um grupo SVG por relação', svg.children.length, 3);
  const paths = container.all(n => n.tagName === 'PATH' && n.getAttribute('stroke') === '#8B5CF6');
  eq('paths visíveis desenhados', paths.length, 3);
  check('path é ortogonal com cantos arredondados', /^M [\d.]+ [\d.]+( L [\d.]+ [\d.]+ Q )/.test(paths[0].getAttribute('d')), paths[0].getAttribute('d'));

  check('nenhum conteúdo injetado via innerHTML',
    container.all(n => n._html !== '').length === 0);
}

/* ---------------------------------------------------------------- */
console.log('\n[3] Badges PK/FK e cardinalidade');
{
  const { container } = base;
  eq('badges PK', container.byClass('erd-badge--pk').length, 4);
  eq('badges FK', container.byClass('erd-badge--fk').length, 3);
  const labels = container.byClass('erd-card-label-text').map(n => n.textContent);
  check('cardinalidade (0,n) no lado FK', labels.includes('(0,n)'), labels.join(' '));
  check('cardinalidade (1,n) para FK NOT NULL', labels.includes('(1,n)'), labels.join(' '));
  check('cardinalidade (1,1) no lado PK', labels.includes('(1,1)'), labels.join(' '));
}

/* ---------------------------------------------------------------- */
console.log('\n[4] Seleção de tabela (isola vizinhos)');
{
  const { container } = base;
  const cards = container.byClass('erd-table');
  const contas = cards[2];
  contas.dispatch('click', {});

  eq('glow visível na tabela selecionada', contas.first('erd-table-glow').style.display, 'block');
  eq('vizinha (funcionarios) permanece visível', cards[1].style.opacity, 1);
  eq('não-vizinha (departamentos) esmaece', cards[0].style.opacity, 0.2);

  contas.dispatch('click', {});
  eq('segundo clique limpa a seleção', contas.first('erd-table-glow').style.display, 'none');
  eq('todas as tabelas voltam ao normal', cards[0].style.opacity, 1);
}

/* ---------------------------------------------------------------- */
console.log('\n[5] Hover na relação: tooltip e rolagem preservada');
{
  const { doc, container } = base;
  const canvas = container.first('erd-canvas');
  canvas.scrollLeft = 120;
  canvas.scrollTop = 45;

  const hit = container.all(n => n.tagName === 'PATH' && n.getAttribute('stroke') === 'rgba(0,0,0,0)')[0];
  hit.dispatch('mouseenter', { clientX: 200, clientY: 150 });

  const tip = doc.body.all(n => String(n.className) === 'erd-tooltip')[0];
  check('tooltip criado no body', !!tip);
  check('tooltip mostra a FK em SQL',
    tip.first('erd-tooltip-sql').textContent === 'FOREIGN KEY (departamento_id) REFERENCES departamentos(id)',
    tip.first('erd-tooltip-sql').textContent);
  check('tooltip mostra a cardinalidade',
    tip.first('erd-tooltip-card').textContent.includes('funcionarios (1,n)'),
    tip.first('erd-tooltip-card').textContent);
  check('tooltip segue o cursor', tip.style.cssText.includes('left:216px'), tip.style.cssText);

  eq('rolagem horizontal preservada no hover', canvas.scrollLeft, 120);
  eq('rolagem vertical preservada no hover', canvas.scrollTop, 45);

  const visiveis = container.all(n => n.tagName === 'PATH' && n.getAttribute('stroke') === '#A78BFA');
  eq('relação sob o cursor destacada', visiveis.length, 1);

  hit.dispatch('mouseleave', {});
  eq('tooltip escondido ao sair', tip.style.display, 'none');
  eq('destaque removido', container.all(n => n.tagName === 'PATH' && n.getAttribute('stroke') === '#A78BFA').length, 0);
}

/* ---------------------------------------------------------------- */
console.log('\n[6] Drag de tabela');
{
  const { doc, container } = base;
  const canvas = container.first('erd-canvas');
  const card = container.byClass('erd-table')[0];
  const antes = card.style.left;

  canvas.scrollLeft = 80;
  card.dispatch('mousedown', { clientX: 100, clientY: 100 });
  doc.dispatch('mousemove', { clientX: 160, clientY: 130 });

  eq('card move no eixo X', card.style.left, (parseFloat(antes) + 60) + 'px');
  eq('rolagem preservada durante o drag', canvas.scrollLeft, 80);

  doc.dispatch('mouseup', {});
  doc.dispatch('mousemove', { clientX: 400, clientY: 400 });
  eq('mouseup encerra o drag', card.style.left, (parseFloat(antes) + 60) + 'px');

  card.dispatch('click', {});
  eq('clique após arrastar não seleciona', card.first('erd-table-glow').style.display, 'none');
}

/* ---------------------------------------------------------------- */
console.log('\n[7] Pan pelo fundo do canvas');
{
  const { doc, container } = base;
  const canvas = container.first('erd-canvas');
  const sizer = container.first('erd-sizer');
  canvas.scrollLeft = 100;
  canvas.scrollTop = 100;

  sizer.dispatch('mousedown', { clientX: 300, clientY: 300 });
  doc.dispatch('mousemove', { clientX: 260, clientY: 280 });
  eq('pan move a rolagem horizontal', canvas.scrollLeft, 140);
  eq('pan move a rolagem vertical', canvas.scrollTop, 120);
  doc.dispatch('mouseup', {});
}

/* ---------------------------------------------------------------- */
console.log('\n[8] Zoom (botões, roda e AJUSTAR)');
{
  const { module, container } = base;
  const canvas = container.first('erd-canvas');
  const zoomLabel = container.first('erd-zoom-label');
  const botoes = container.byClass('erd-ctrl-btn');

  botoes[1].dispatch('click', {});
  eq('botão + aumenta o zoom', zoomLabel.textContent, '115%');
  botoes[0].dispatch('click', {});
  eq('botão − volta ao zoom anterior', zoomLabel.textContent, '100%');

  canvas.dispatch('wheel', { deltaY: -100, clientX: 50, clientY: 50 });
  eq('roda para cima aplica zoom in', zoomLabel.textContent, '112%');
  canvas.dispatch('wheel', { deltaY: 100, clientX: 50, clientY: 50 });
  eq('roda para baixo aplica zoom out', zoomLabel.textContent, '100%');

  const world = container.first('erd-world');
  const escala = parseFloat(String(world.style.transform).replace(/[^\d.]/g, ''));
  check('mundo escalado pelo zoom', Math.abs(escala - 1) < 0.01, world.style.transform);

  canvas.clientWidth = 300;   // painel lateral estreito
  module.fitERDiagram(container);
  const estreito = parseInt(zoomLabel.textContent, 10);
  check('AJUSTAR respeita o piso do painel lateral', estreito >= 50, zoomLabel.textContent);

  canvas.clientWidth = 1200;  // modal
  module.fitERDiagram(container);
  check('AJUSTAR usa a largura disponível no modal',
    parseInt(zoomLabel.textContent, 10) > estreito, zoomLabel.textContent);

  botoes[3].dispatch('click', {});  // RESETAR
  const card = container.byClass('erd-table')[0];
  eq('RESETAR devolve a tabela arrastada à posição do grid', card.style.left, '30px');
}

/* ---------------------------------------------------------------- */
console.log('\n[9] Re-render: mesmo schema preserva estado, schema novo remonta');
{
  let tabelas = CASO_001;
  const { module, container } = mount(() => tabelas);
  const canvas = container.first('erd-canvas');
  canvas.clientWidth = 1000;
  canvas.scrollLeft = 60;
  container.byClass('erd-ctrl-btn')[1].dispatch('click', {});
  const zoom = container.first('erd-zoom-label').textContent;

  module.renderERDiagram(container);
  eq('mesmo schema mantém o zoom', container.first('erd-zoom-label').textContent, zoom);
  eq('mesmo schema mantém a rolagem', container.first('erd-canvas').scrollLeft, 60);
  eq('mesmo schema não duplica cards', container.byClass('erd-table').length, 4);

  tabelas = CASO_001.concat([
    { tableName: 'emails', objectType: 'table', columns: [col('id', 'INTEGER', { pk: true }), col('remetente_id', 'INTEGER', { fk: 'funcionarios.id' })] },
  ]);
  module.renderERDiagram(container);
  eq('schema novo remonta com a tabela extra', container.byClass('erd-table').length, 5);
  eq('resumo atualizado', container.first('erd-hint').textContent, '5 TABELAS · 4 RELAÇÕES');

  tabelas = [];
  module.renderERDiagram(container);
  check('banco esvaziado volta ao estado vazio', !!container.first('erd-empty'));
  check('canvas removido no estado vazio', container.first('erd-canvas') === null);

  tabelas = CASO_001;
  module.renderERDiagram(container);
  eq('banco repovoado remonta o diagrama', container.byClass('erd-table').length, 4);

  module.destroyERDiagram(container);
  eq('destroy limpa o container', container.children.length, 0);
}

/* ---------------------------------------------------------------- */
console.log('\n[10] Normalização do schema');
{
  const { container } = mount(() => [
    { tableName: 'vendas', objectType: 'table', columns: [col('id', 'INTEGER', { pk: true }), col('cliente_id', 'INTEGER', { fk: 'clientes.null' })] },
    { tableName: 'clientes', objectType: 'table', columns: [col('codigo', 'INTEGER', { pk: true }), col('nome', 'TEXT')] },
    { tableName: 'vw_resumo', objectType: 'view', columns: [col('total', 'INTEGER')] },
  ]);
  eq('views ficam fora do modelo relacional', container.byClass('erd-table').length, 2);

  const hit = container.all(n => n.tagName === 'PATH' && n.getAttribute('stroke') === 'rgba(0,0,0,0)')[0];
  hit.dispatch('mouseenter', { clientX: 10, clientY: 10 });
  const sql = container.parentNode.all(n => String(n.className) === 'erd-tooltip-sql')[0].textContent;
  eq('FK sem coluna-alvo resolve para a PK da tabela referenciada',
    sql, 'FOREIGN KEY (cliente_id) REFERENCES clientes(codigo)');
}

/* ---------------------------------------------------------------- */
console.log('\n[11] Fallback e API retrocompatível');
{
  const { module, container } = mount(() => { throw new Error('banco indisponível'); });
  eq('banco indisponível cai no schema estático do caso 001', container.byClass('erd-table').length, 6);
  eq('relações do caso 001', container.first('erd-hint').textContent, '6 TABELAS · 8 RELAÇÕES');

  const tables = module.getERTables();
  eq('getERTables mantém o formato antigo', tables.length, 6);
  const funcionarios = tables.find(t => t.name === 'funcionarios');
  const dept = funcionarios.columns.find(c => c.name === 'departamento_id');
  eq('coluna FK aponta para o alvo', dept.fk, 'departamentos.id');
  eq('coluna PK marcada', funcionarios.columns[0].pk, true);

  const relations = module.getERRelations();
  eq('getERRelations mantém o formato antigo', relations.length, 8);
  eq('relação com from/to', relations[0].from, 'funcionarios.departamento_id');
}

/* ---------------------------------------------------------------- */
console.log('\n[12] generateERDiagramSVG (export estático)');
{
  const { module } = load(() => [
    { tableName: 'a<script>', objectType: 'table', columns: [col('nome"x', 'TEXT', { pk: true })] },
  ]);
  const svg = module.generateERDiagramSVG();
  check('gera SVG', svg.startsWith('<svg') && svg.endsWith('</svg>'));
  check('escapa nome de tabela', svg.includes('a&lt;script&gt;') && !svg.includes('<script>'), svg.slice(0, 400));
  check('escapa aspas em nome de coluna', svg.includes('nome&quot;x'));
  check('marca a PK', svg.includes('PK nome'));
}

/* ---------------------------------------------------------------- */
console.log(`\n=== Resultado: ${pass} passaram, ${fail} falharam ===`);
process.exit(fail === 0 ? 0 : 1);
