/**
 * er-diagram.js — Diagrama ER interativo v2 com canvas zoom/pan/drag.
 *
 * Renderiza tabelas como cards DOM + relações SVG com roteamento ortogonal,
 * cantos arredondados, labels de cardinalidade, badges PK/FK, seleção de
 * tabelas, hover tooltip nas linhas e controles de zoom.
 *
 * O DOM é montado uma única vez por schema; interações (zoom, pan, drag,
 * seleção, hover) apenas repintam atributos dos nós já existentes. Isso
 * preserva a rolagem do canvas e evita reconsultar o banco a cada frame.
 *
 * Mantém exports retrocompatíveis: renderERDiagram, generateERDiagramSVG,
 * getERTables, getERRelations.
 */

import { getSchemaDetailed } from './db.js';

/* ================================================================
   CONSTANTES DE LAYOUT
   ================================================================ */
const W = 252;            // largura fixa de cada card de tabela
const HEAD = 30;          // altura do header da tabela
const ROW = 22;           // altura de cada linha de coluna
const PAD = 30;           // padding do mundo
const GX = 110;           // gap horizontal entre colunas do grid
const GY = 84;            // gap vertical entre linhas do grid
const CORNER_RADIUS = 7;  // raio dos cantos arredondados das linhas
const GRID_COLUMNS = 3;   // colunas do grid automático do schema dinâmico

const REL_COLOR = '#8B5CF6';
const REL_COLOR_HOVER = '#A78BFA';
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.4;
const ZOOM_FIT_MAX = 1.5;
const NARROW_CANVAS = 420;  // abaixo disso o container é tratado como painel lateral

const SVG_NS = 'http://www.w3.org/2000/svg';

/* ================================================================
   DEFINIÇÃO ESTÁTICA — CASO 001 (FALLBACK)
   ================================================================ */
const STATIC_TABLES = [
  { name: 'departamentos', col: 0, row: 0, columns: [['id', 'INTEGER', 'pk'], ['nome', 'TEXT', ''], ['andar', 'INTEGER', '']] },
  { name: 'funcionarios', col: 1, row: 0, columns: [['id', 'INTEGER', 'pk'], ['nome', 'TEXT', ''], ['cargo', 'TEXT', ''], ['departamento_id', 'INTEGER', 'fk'], ['salario_centavos', 'INTEGER', ''], ['data_admissao', 'TEXT', '']] },
  { name: 'contas', col: 2, row: 0, columns: [['id', 'INTEGER', 'pk'], ['numero_conta', 'TEXT', ''], ['funcionario_id', 'INTEGER', 'fk'], ['titular_externo', 'TEXT', ''], ['banco', 'TEXT', ''], ['tipo', 'TEXT', '']] },
  { name: 'transacoes', col: 0, row: 1, columns: [['id', 'INTEGER', 'pk'], ['conta_origem_id', 'INTEGER', 'fk'], ['conta_destino_id', 'INTEGER', 'fk'], ['valor_centavos', 'INTEGER', ''], ['data_hora', 'TEXT', ''], ['descricao', 'TEXT', ''], ['operador_funcionario_id', 'INTEGER', 'fk']] },
  { name: 'logs_acesso', col: 1, row: 1, columns: [['id', 'INTEGER', 'pk'], ['funcionario_id', 'INTEGER', 'fk'], ['data_hora', 'TEXT', ''], ['tipo', 'TEXT', ''], ['local', 'TEXT', '']] },
  { name: 'emails', col: 2, row: 1, columns: [['id', 'INTEGER', 'pk'], ['remetente_id', 'INTEGER', 'fk'], ['destinatario_id', 'INTEGER', 'fk'], ['assunto', 'TEXT', ''], ['data_hora', 'TEXT', ''], ['conteudo', 'TEXT', '']] },
];
const STATIC_RELS = [
  ['funcionarios.departamento_id', 'departamentos.id', false],
  ['contas.funcionario_id', 'funcionarios.id', false],
  ['transacoes.conta_origem_id', 'contas.id', false],
  ['transacoes.conta_destino_id', 'contas.id', false],
  ['transacoes.operador_funcionario_id', 'funcionarios.id', false],
  ['logs_acesso.funcionario_id', 'funcionarios.id', false],
  ['emails.remetente_id', 'funcionarios.id', false],
  ['emails.destinatario_id', 'funcionarios.id', false],
];

/* ================================================================
   UTILITÁRIOS
   ================================================================ */

/**
 * Gera um path SVG ortogonal com cantos arredondados.
 * @param {number[][]} pts Sequência de pontos [x, y]
 * @param {number} r Raio dos cantos
 * @returns {string} atributo `d` do path SVG
 */
function roundedPath(pts, r) {
  if (pts.length < 2) return '';
  const f = (n) => n.toFixed(1);
  if (r <= 0) return 'M ' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join(' L ');
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
    const l1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    if (!isFinite(rr) || rr < 0.8) { d += ` L ${f(p1[0])} ${f(p1[1])}`; continue; }
    const a = [p1[0] + (p0[0] - p1[0]) / l1 * rr, p1[1] + (p0[1] - p1[1]) / l1 * rr];
    const b = [p1[0] + (p2[0] - p1[0]) / l2 * rr, p1[1] + (p2[1] - p1[1]) / l2 * rr];
    d += ` L ${f(a[0])} ${f(a[1])} Q ${f(p1[0])} ${f(p1[1])} ${f(b[0])} ${f(b[1])}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L ${f(last[0])} ${f(last[1])}`;
}

/** Escapa texto para interpolação segura em markup (SVG/HTML). */
function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Cria um elemento HTML com classe opcional, já anexado ao pai. */
function el(tag, className, parent) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (parent) parent.appendChild(node);
  return node;
}

/** Cria um elemento SVG, já anexado ao pai. */
function svgEl(tag, parent) {
  const node = document.createElementNS(SVG_NS, tag);
  if (parent) parent.appendChild(node);
  return node;
}

/* ================================================================
   EXTRAÇÃO DE SCHEMA
   ================================================================ */

/**
 * Lê o schema do banco ativo e normaliza para o formato do diagrama.
 *
 * @returns {{status: string, tables: object[], rels: Array}}
 *   - `ok`: schema real do banco;
 *   - `empty`: banco sem tabelas (construtor antes do primeiro CREATE TABLE);
 *   - `fallback`: banco indisponível — usa a definição estática do caso 001.
 */
function loadSchema() {
  let detailed;
  try {
    detailed = getSchemaDetailed();
  } catch {
    return { status: 'fallback', tables: STATIC_TABLES, rels: STATIC_RELS };
  }
  if (!Array.isArray(detailed)) {
    return { status: 'fallback', tables: STATIC_TABLES, rels: STATIC_RELS };
  }
  if (detailed.length === 0) return { status: 'empty', tables: [], rels: [] };

  const tables = [];
  const rawRels = [];
  const pkByTable = {};
  let idx = 0;

  detailed.forEach(table => {
    if (table.objectType === 'view') return;  // views não entram no modelo relacional

    const columns = table.columns.map(col => {
      let kind = '';
      if (col.pk && col.fk) kind = 'pkfk';
      else if (col.pk) kind = 'pk';
      else if (col.fk) kind = 'fk';
      return [col.name, col.type || 'ANY', kind];
    });

    const pkCol = table.columns.find(c => c.pk);
    if (pkCol) pkByTable[table.tableName] = pkCol.name;

    tables.push({
      name: table.tableName,
      col: idx % GRID_COLUMNS,
      row: Math.floor(idx / GRID_COLUMNS),
      columns,
    });
    idx++;

    table.columns.forEach(col => {
      if (!col.fk) return;
      const [targetTable, targetCol] = String(col.fk).split('.');
      rawRels.push([`${table.tableName}.${col.name}`, targetTable, targetCol, !!col.notnull]);
    });
  });

  if (tables.length === 0) return { status: 'empty', tables: [], rels: [] };

  // O SQLite devolve a coluna-alvo vazia quando a FK aponta para a PK implícita.
  const rels = rawRels.map(([from, targetTable, targetCol, req]) => {
    const col = targetCol && targetCol !== 'null' ? targetCol : (pkByTable[targetTable] || 'id');
    return [from, `${targetTable}.${col}`, req];
  });

  return { status: 'ok', tables, rels };
}

/** Assinatura da forma do schema — muda só quando tabelas/colunas/FKs mudam. */
function schemaSignature(schema) {
  const t = schema.tables.map(x => x.name + '(' + x.columns.map(c => c.join('~')).join(',') + ')').join('|');
  const r = schema.rels.map(x => x.join('>')).join('|');
  return t + '#' + r;
}

/* ================================================================
   DIAGRAMA INTERATIVO
   ================================================================ */

class ERDiagram {
  /** @param {HTMLElement} container */
  constructor(container) {
    this.container = container;
    this.state = { zoom: 1, offsets: {}, sel: null, hover: null };
    this.schema = { status: 'empty', tables: [], rels: [] };
    this.signature = null;
    this.els = null;
    this.tipEl = null;
    this.tipSqlEl = null;
    this.tipCardEl = null;
    this.drag = null;
    this.moved = false;
    this.docBound = false;

    this._onDocMove = this._onDocMove.bind(this);
    this._onDocUp = this._onDocUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
  }

  /* ---------------- Ciclo de vida ---------------- */

  /** Recarrega o schema do banco e redesenha o diagrama. */
  refresh() {
    const schema = loadSchema();

    if (schema.status === 'empty') {
      this.schema = schema;
      this.signature = null;
      this._renderEmpty();
      return;
    }

    const signature = schemaSignature(schema);
    const mounted = !!(this.els && this.container.contains(this.els.canvas));
    this.schema = schema;

    if (!mounted || signature !== this.signature) {
      // Schema novo (ou DOM perdido): remonta e reposiciona do zero.
      this.signature = signature;
      this.state.offsets = {};
      this.state.sel = null;
      this.state.hover = null;
      this._buildDOM();
      this._sync();
      this.fit();
    } else {
      // Mesma forma: preserva zoom, pan, offsets e seleção do usuário.
      this._sync();
    }
  }

  /** Ajusta o zoom para o diagrama caber na largura visível. */
  fit() {
    const canvas = this.els && this.els.canvas;
    if (!canvas) return;
    const { canvasW } = this._geometry();
    const width = canvas.clientWidth || 0;
    const available = width - 14;
    if (available <= 0 || !canvasW) return;
    const floor = width < NARROW_CANVAS ? 0.5 : 0.32;
    this.state.zoom = Math.min(ZOOM_FIT_MAX, Math.max(floor, available / canvasW));
    this._sync();
  }

  /** Desmonta listeners e limpa o container. */
  destroy() {
    this._unbindDoc();
    if (this.tipEl && this.tipEl.parentNode) this.tipEl.parentNode.removeChild(this.tipEl);
    this.tipEl = null;
    if (this.els && this.els.canvas) this.els.canvas.removeEventListener('wheel', this._onWheel);
    this.els = null;
    this.signature = null;
    this.container.innerHTML = '';
  }

  _bindDoc() {
    if (this.docBound) return;
    document.addEventListener('mousemove', this._onDocMove);
    document.addEventListener('mouseup', this._onDocUp);
    this.docBound = true;
  }

  _unbindDoc() {
    if (!this.docBound) return;
    document.removeEventListener('mousemove', this._onDocMove);
    document.removeEventListener('mouseup', this._onDocUp);
    this.docBound = false;
  }

  /* ---------------- Layout e geometria ---------------- */

  /** Posição absoluta de cada tabela (grid + offsets de drag). */
  _layout() {
    const { tables } = this.schema;
    const off = this.state.offsets;
    const rowH = {}, rowY = {};

    tables.forEach(t => {
      rowH[t.row] = Math.max(rowH[t.row] || 0, HEAD + t.columns.length * ROW);
    });

    let acc = PAD;
    const maxRow = Math.max(0, ...tables.map(t => t.row));
    for (let r = 0; r <= maxRow; r++) {
      rowY[r] = acc;
      acc += (rowH[r] || 0) + GY;
    }

    const L = {};
    tables.forEach(t => {
      const o = off[t.name] || { dx: 0, dy: 0 };
      L[t.name] = {
        x: PAD + t.col * (W + GX) + o.dx,
        y: rowY[t.row] + o.dy,
        h: HEAD + t.columns.length * ROW,
        col: t.col,
        row: t.row,
        table: t,
      };
    });
    return L;
  }

  /** Y (relativo ao card) do centro da linha de uma coluna. */
  _colY(table, colName) {
    const i = table.columns.findIndex(c => c[0] === colName);
    return HEAD + (i < 0 ? 0 : i) * ROW + ROW / 2;
  }

  /**
   * Calcula paths das relações, labels de cardinalidade, posição/estado das
   * tabelas e o tamanho do mundo. Não toca no DOM.
   */
  _geometry() {
    const schema = this.schema;
    const L = this._layout();
    const st = this.state;
    const gap = 26;

    // Classifica cada relação: lado a lado, contorno ou corredor longo.
    const raw = [];
    schema.rels.forEach(([from, to, req]) => {
      const [ft, fc] = from.split('.');
      const [tt, tc] = to.split('.');
      const fl = L[ft], tl = L[tt];
      if (!fl || !tl) return;

      const fy = fl.y + this._colY(fl.table, fc);
      const ty = tl.y + this._colY(tl.table, tc);

      let mode, dir, ex, en;
      if (fl.x + W + gap <= tl.x) { mode = 'side'; dir = 1; ex = fl.x + W; en = tl.x; }
      else if (tl.x + W + gap <= fl.x) { mode = 'side'; dir = -1; ex = fl.x; en = tl.x + W; }
      else { mode = 'around'; dir = -1; ex = fl.x; en = tl.x; }

      const far = mode === 'side' && Math.abs(fl.x - tl.x) > W + GX + 40;
      const key = mode + (far ? 'far' : 'near') + Math.round((ex + en) / 60);
      raw.push({ ft, fc, tt, tc, req, fl, tl, fy, ty, mode, dir, ex, en, far, key });
    });

    // Canaletas: relações no mesmo corredor ganham lanes distintas.
    const lanes = {};
    raw.forEach(r => { r.lane = (lanes[r.key] = (lanes[r.key] || 0) + 1) - 1; });

    const labels = [];
    const pkAnchors = new Map();

    const rels = raw.map(r => {
      const spread = r.lane * 13;
      let pts;
      if (r.mode === 'around') {
        const chX = Math.max(12, Math.min(r.fl.x, r.tl.x) - 38 - spread);
        pts = [[r.ex, r.fy], [chX, r.fy], [chX, r.ty], [r.en, r.ty]];
      } else if (r.far) {
        const g1 = r.ex + r.dir * (46 + spread);
        const g2 = r.en - r.dir * (46 + spread);
        const sameRow = r.fl.row === r.tl.row;
        const corridorY = sameRow
          ? Math.max(r.fl.y + r.fl.h, r.tl.y + r.tl.h) + 42 + spread
          : (Math.min(r.fl.y + r.fl.h, r.tl.y + r.tl.h) + Math.max(r.fl.y, r.tl.y)) / 2 + (r.lane - 1) * 12;
        pts = [[r.ex, r.fy], [g1, r.fy], [g1, corridorY], [g2, corridorY], [g2, r.ty], [r.en, r.ty]];
      } else {
        const mid = (r.ex + r.en) / 2 + (r.lane - 1) * 13;
        pts = [[r.ex, r.fy], [mid, r.fy], [mid, r.ty], [r.en, r.ty]];
      }

      const id = r.ft + '.' + r.fc + '>' + r.tt + '.' + r.tc;
      const isHover = st.hover === id;
      const touchesSel = !st.sel || r.ft === st.sel || r.tt === st.sel;
      let opacity = 1;
      if (st.hover) opacity = isHover ? 1 : 0.09;
      else if (st.sel) opacity = touchesSel ? 1 : 0.07;

      const lbl = (x, y, text, anchorRight) => ({
        text,
        x: x + (anchorRight ? -8 : 8),
        y: y - 15,
        anchorRight,
        opacity,
      });

      // Lado FK: (0,n) ou (1,n) conforme a coluna aceitar NULL.
      labels.push(lbl(r.ex, r.fy, r.req ? '(1,n)' : '(0,n)', r.dir < 0));

      // Lado PK: (1,1) — FKs que chegam no mesmo ponto compartilham o label.
      const pkKey = `${r.tt}.${r.tc}:${r.dir > 0 ? 'L' : 'R'}:${Math.round(r.en)}:${Math.round(r.ty)}`;
      const shared = pkAnchors.get(pkKey);
      if (shared) {
        shared.opacity = Math.max(shared.opacity, opacity);
      } else {
        const label = lbl(r.en, r.ty, '(1,1)', r.dir > 0);
        pkAnchors.set(pkKey, label);
        labels.push(label);
      }

      return {
        id,
        d: roundedPath(pts, CORNER_RADIUS),
        fx: r.ex, fy: r.fy, tx: r.en, ty: r.ty,
        stroke: isHover ? REL_COLOR_HOVER : REL_COLOR,
        width: isHover ? 2.5 : 1.5,
        opacity,
        ft: r.ft, fc: r.fc, tt: r.tt, tc: r.tc, req: r.req,
      };
    });

    let maxX = 0, maxY = 0;
    Object.values(L).forEach(p => {
      maxX = Math.max(maxX, p.x + W);
      maxY = Math.max(maxY, p.y + p.h);
    });
    const canvasW = Math.round(maxX + PAD + 40);
    const canvasH = Math.round(maxY + PAD + 40);

    // Tabelas fora da vizinhança da seleção ficam esmaecidas.
    const neighbors = new Set();
    if (st.sel) {
      schema.rels.forEach(([from, to]) => {
        const a = from.split('.')[0], b = to.split('.')[0];
        if (a === st.sel) neighbors.add(b);
        if (b === st.sel) neighbors.add(a);
      });
    }

    const tables = schema.tables.map(t => {
      const p = L[t.name];
      const isSel = st.sel === t.name;
      return {
        name: t.name,
        x: p.x, y: p.y,
        selected: isSel,
        dim: !!st.sel && !isSel && !neighbors.has(t.name),
      };
    });

    return { tables, rels, labels, canvasW, canvasH };
  }

  /* ---------------- Montagem do DOM ---------------- */

  /** Estado vazio — banco sem tabelas (modo construtor). */
  _renderEmpty() {
    if (this.els && this.els.canvas) this.els.canvas.removeEventListener('wheel', this._onWheel);
    this._hideTip();
    this.els = null;
    this.container.innerHTML = '';
    const box = el('div', 'erd-empty', this.container);
    el('div', 'erd-empty-title', box).textContent = 'O desenho começa vazio.';
    el('p', 'erd-empty-text', box).textContent =
      'Escreva seu primeiro CREATE TABLE e o diagrama surge aqui.';
  }

  /** Monta o esqueleto do diagrama (uma vez por schema). */
  _buildDOM() {
    if (this.els && this.els.canvas) this.els.canvas.removeEventListener('wheel', this._onWheel);
    this._hideTip();
    this.container.innerHTML = '';

    /* --- Barra de controles --- */
    const controls = el('div', 'erd-controls', this.container);
    const btn = (className, label, title, onClick) => {
      const b = el('button', className, controls);
      b.type = 'button';
      b.textContent = label;
      b.title = title;
      b.addEventListener('click', onClick);
      return b;
    };
    btn('erd-ctrl-btn', '−', 'Diminuir zoom', () => this._zoomBy(1 / 1.15));
    const zoomLabel = el('span', 'erd-zoom-label', controls);
    btn('erd-ctrl-btn', '+', 'Aumentar zoom', () => this._zoomBy(1.15));
    btn('erd-ctrl-btn erd-ctrl-text', 'AJUSTAR', 'Ajustar o diagrama à largura visível', () => this.fit());
    btn('erd-ctrl-btn erd-ctrl-text', 'RESETAR', 'Voltar ao layout original', () => {
      this.state.offsets = {};
      this.state.sel = null;
      this.state.hover = null;
      this._hideTip();
      this._sync();
      this.fit();
    });
    const hint = el('span', 'erd-hint', controls);

    /* --- Canvas rolável --- */
    const canvas = el('div', 'erd-canvas', this.container);
    canvas.addEventListener('wheel', this._onWheel, { passive: false });

    const sizer = el('div', 'erd-sizer', canvas);
    sizer.addEventListener('mousedown', (e) => {
      // Clique no fundo: limpa a seleção e inicia o pan.
      if (this.state.sel) {
        this.state.sel = null;
        this._sync();
      }
      this.moved = false;
      this.drag = { kind: 'pan', sx: e.clientX, sy: e.clientY, sl: canvas.scrollLeft, st: canvas.scrollTop };
    });

    const world = el('div', 'erd-world', sizer);
    const svg = svgEl('svg', world);
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;';
    const labelsLayer = el('div', 'erd-labels', world);

    /* --- Relações (criadas uma vez; a geometria é repintada no _sync) --- */
    const { rels, tables } = this._geometry();
    const relEls = rels.map(r => {
      const g = svgEl('g', svg);

      const path = svgEl('path', g);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linejoin', 'round');

      const hit = svgEl('path', g);
      hit.setAttribute('fill', 'none');
      hit.setAttribute('stroke', 'rgba(0,0,0,0)');
      hit.setAttribute('stroke-width', '15');
      hit.style.cssText = 'cursor:help;pointer-events:stroke;';
      hit.addEventListener('mouseenter', (e) => this._showTip(r.id, e));
      hit.addEventListener('mousemove', (e) => this._moveTip(e));
      hit.addEventListener('mouseleave', () => {
        if (this.state.hover === null) return;
        this.state.hover = null;
        this._hideTip();
        this._sync();
      });

      const dotFk = svgEl('circle', g);
      dotFk.setAttribute('r', '3.2');

      const dotPk = svgEl('circle', g);
      dotPk.setAttribute('r', '4');
      dotPk.setAttribute('fill', '#0B111D');
      dotPk.setAttribute('stroke-width', '1.7');

      return { g, path, hit, dotFk, dotPk };
    });

    /* --- Cards das tabelas --- */
    const tableEls = new Map();
    tables.forEach(t => {
      const def = this.schema.tables.find(x => x.name === t.name);
      const card = el('div', 'erd-table', world);
      card.style.width = W + 'px';

      const inner = el('div', 'erd-table-inner', card);
      const header = el('div', 'erd-table-header', inner);
      el('span', 'erd-table-name', header).textContent = t.name;
      el('span', 'erd-table-count', header).textContent = def.columns.length + ' COL';

      def.columns.forEach(([name, type, kind]) => {
        const row = el('div', 'erd-table-col', inner);
        if (kind) {
          const modifier = kind === 'fk' ? 'fk' : kind === 'pkfk' ? 'pkfk' : 'pk';
          el('span', 'erd-badge erd-badge--' + modifier, row).textContent =
            kind === 'pk' ? 'PK' : kind === 'fk' ? 'FK' : 'PK·FK';
        }
        el('span', 'erd-col-name' + (kind ? ' erd-col-name--key' : ''), row).textContent = name;
        el('span', 'erd-col-type', row).textContent = type;
      });

      const glow = el('div', 'erd-table-glow', card);

      card.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const o = this.state.offsets[t.name] || { dx: 0, dy: 0 };
        this.moved = false;
        this.drag = { kind: 'table', name: t.name, sx: e.clientX, sy: e.clientY, bdx: o.dx, bdy: o.dy };
      });
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.moved) { this.moved = false; return; }
        this.state.sel = this.state.sel === t.name ? null : t.name;
        this._sync();
      });

      tableEls.set(t.name, { card, glow });
    });

    /* --- Legenda --- */
    const legend = el('div', 'erd-legend', this.container);
    [
      ['pk', 'PK'],
      ['fk', 'FK'],
      ['fk-dot', 'LADO FK · (0,n)'],
      ['pk-dot', 'LADO PK · (1,1)'],
      ['table', 'TABELA'],
    ].forEach(([modifier, text]) => {
      const item = el('span', 'erd-legend-item', legend);
      el('span', 'erd-legend-swatch erd-legend-swatch--' + modifier, item);
      item.appendChild(document.createTextNode(text));
    });

    this.els = { controls, zoomLabel, hint, canvas, sizer, world, svg, labelsLayer, relEls, tableEls };
    this._bindDoc();
  }

  /* ---------------- Repintura ---------------- */

  /** Aplica a geometria e o estado atuais ao DOM já montado. */
  _sync() {
    if (!this.els) return;
    const { sizer, world, svg, labelsLayer, relEls, tableEls, zoomLabel, hint } = this.els;
    const { tables, rels, labels, canvasW, canvasH } = this._geometry();
    const zoom = this.state.zoom;

    sizer.style.width = Math.round(canvasW * zoom) + 'px';
    sizer.style.height = Math.round(canvasH * zoom) + 'px';
    world.style.width = canvasW + 'px';
    world.style.height = canvasH + 'px';
    world.style.transform = `scale(${zoom})`;

    svg.setAttribute('width', canvasW);
    svg.setAttribute('height', canvasH);
    svg.setAttribute('viewBox', `0 0 ${canvasW} ${canvasH}`);

    rels.forEach((r, i) => {
      const e = relEls[i];
      if (!e) return;
      e.g.style.opacity = r.opacity;
      e.path.setAttribute('d', r.d);
      e.path.setAttribute('stroke', r.stroke);
      e.path.setAttribute('stroke-width', r.width);
      e.hit.setAttribute('d', r.d);
      e.dotFk.setAttribute('cx', r.fx);
      e.dotFk.setAttribute('cy', r.fy);
      e.dotFk.setAttribute('fill', r.stroke);
      e.dotPk.setAttribute('cx', r.tx);
      e.dotPk.setAttribute('cy', r.ty);
      e.dotPk.setAttribute('stroke', r.stroke);
    });
    // Sobras (relação sem alvo no layout atual) ficam invisíveis.
    for (let i = rels.length; i < relEls.length; i++) relEls[i].g.style.opacity = 0;

    labelsLayer.innerHTML = '';
    labels.forEach(l => {
      const wrap = el('div', 'erd-card-label', labelsLayer);
      wrap.style.cssText =
        `position:absolute;left:${l.x}px;top:${l.y}px;opacity:${l.opacity};` +
        `${l.anchorRight ? 'transform:translateX(-100%);' : ''}pointer-events:none;line-height:12px;`;
      el('span', 'erd-card-label-text', wrap).textContent = l.text;
    });

    tables.forEach(t => {
      const e = tableEls.get(t.name);
      if (!e) return;
      e.card.style.left = t.x + 'px';
      e.card.style.top = t.y + 'px';
      e.card.style.opacity = t.dim ? 0.2 : 1;
      e.card.style.zIndex = t.selected ? 3 : 2;
      e.glow.style.display = t.selected ? 'block' : 'none';
    });

    zoomLabel.textContent = Math.round(zoom * 100) + '%';
    hint.textContent = `${tables.length} TABELAS · ${rels.length} RELAÇÕES`;
  }

  /* ---------------- Tooltip ---------------- */

  _relById(id) {
    const { rels } = this._geometry();
    return rels.find(r => r.id === id) || null;
  }

  _showTip(id, e) {
    const r = this._relById(id);
    if (!r) return;
    this.state.hover = id;
    if (!this.tipEl) {
      this.tipEl = el('div', 'erd-tooltip');
      el('div', 'erd-tooltip-label', this.tipEl).textContent = 'RELACIONAMENTO';
      this.tipSqlEl = el('div', 'erd-tooltip-sql', this.tipEl);
      this.tipCardEl = el('div', 'erd-tooltip-card', this.tipEl);
      document.body.appendChild(this.tipEl);
    }
    this.tipSqlEl.textContent = `FOREIGN KEY (${r.fc}) REFERENCES ${r.tt}(${r.tc})`;
    this.tipCardEl.textContent = `${r.ft} ${r.req ? '(1,n)' : '(0,n)'} —— (1,1) ${r.tt}`;
    this._moveTip(e);
    this._sync();
  }

  _moveTip(e) {
    if (!this.tipEl) return;
    this.tipEl.style.cssText =
      `position:fixed;left:${e.clientX + 16}px;top:${e.clientY + 16}px;z-index:9999;pointer-events:none;display:block;`;
  }

  _hideTip() {
    if (this.tipEl) this.tipEl.style.display = 'none';
  }

  /* ---------------- Interações ---------------- */

  _zoomBy(factor) {
    this.state.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, this.state.zoom * factor));
    this._sync();
  }

  _onWheel(e) {
    e.preventDefault();
    const canvas = this.els && this.els.canvas;
    if (!canvas) return;
    const z = this.state.zoom;
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z * (e.deltaY < 0 ? 1.12 : 0.89)));
    if (next === z) return;

    // Mantém sob o cursor o mesmo ponto do diagrama.
    const box = canvas.getBoundingClientRect();
    const px = e.clientX - box.left, py = e.clientY - box.top;
    const cx = (canvas.scrollLeft + px) / z, cy = (canvas.scrollTop + py) / z;
    this.state.zoom = next;
    this._sync();
    canvas.scrollLeft = cx * next - px;
    canvas.scrollTop = cy * next - py;
  }

  _onDocMove(e) {
    const d = this.drag;
    if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 3) this.moved = true;
    if (d.kind === 'table') {
      const z = this.state.zoom || 1;
      this.state.offsets[d.name] = {
        dx: d.bdx + (e.clientX - d.sx) / z,
        dy: d.bdy + (e.clientY - d.sy) / z,
      };
      this._sync();
    } else if (d.kind === 'pan') {
      const canvas = this.els && this.els.canvas;
      if (canvas) {
        canvas.scrollLeft = d.sl - (e.clientX - d.sx);
        canvas.scrollTop = d.st - (e.clientY - d.sy);
      }
    }
  }

  _onDocUp() {
    this.drag = null;
  }
}

/* ================================================================
   API PÚBLICA (RETROCOMPATÍVEL)
   ================================================================ */

/** Uma instância por container — preserva zoom/pan entre re-renders. */
const instances = new WeakMap();

/**
 * Renderiza (ou atualiza) o diagrama ER interativo no container.
 * @param {HTMLElement} container
 */
export function renderERDiagram(container) {
  if (!container) return;
  let instance = instances.get(container);
  if (!instance) {
    instance = new ERDiagram(container);
    instances.set(container, instance);
  }
  instance.refresh();
}

/**
 * Reajusta o zoom do diagrama do container à largura visível.
 * @param {HTMLElement} container
 */
export function fitERDiagram(container) {
  if (!container) return;
  const instance = instances.get(container);
  if (instance) instance.fit();
}

/**
 * Remove o diagrama do container e desfaz seus listeners.
 * @param {HTMLElement} container
 */
export function destroyERDiagram(container) {
  if (!container) return;
  const instance = instances.get(container);
  if (!instance) return;
  instance.destroy();
  instances.delete(container);
}

/**
 * Gera uma versão estática do diagrama em SVG (export/impressão).
 * @returns {string} markup SVG
 */
export function generateERDiagramSVG() {
  const schema = loadSchema();
  const tables = schema.status === 'empty' ? STATIC_TABLES : schema.tables;

  const rowH = {}, rowY = {};
  tables.forEach(t => {
    rowH[t.row] = Math.max(rowH[t.row] || 0, HEAD + t.columns.length * ROW);
  });
  let acc = PAD;
  const maxRow = Math.max(0, ...tables.map(t => t.row));
  for (let r = 0; r <= maxRow; r++) { rowY[r] = acc; acc += (rowH[r] || 0) + GY; }

  const L = {};
  tables.forEach(t => {
    L[t.name] = { x: PAD + t.col * (W + GX), y: rowY[t.row], h: HEAD + t.columns.length * ROW };
  });

  let maxX = 0, maxY = 0;
  Object.values(L).forEach(p => { maxX = Math.max(maxX, p.x + W); maxY = Math.max(maxY, p.y + p.h); });
  const svgW = maxX + PAD;
  const svgH = maxY + PAD;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="Diagrama de entidades e relacionamentos" style="max-width:none;height:auto;">`;
  tables.forEach(t => {
    const p = L[t.name];
    svg += `<rect x="${p.x}" y="${p.y}" width="${W}" height="${p.h}" rx="5" fill="rgba(11,17,29,.9)" stroke="#1B2A47"/>`;
    svg += `<rect x="${p.x}" y="${p.y}" width="${W}" height="${HEAD}" rx="5" fill="rgba(0,240,255,.07)" stroke="rgba(0,240,255,.42)"/>`;
    svg += `<text x="${p.x + 11}" y="${p.y + 20}" font-family="'JetBrains Mono',monospace" font-size="12.5" font-weight="700" fill="#00F0FF">${esc(t.name)}</text>`;
    t.columns.forEach(([name, type, kind], i) => {
      const marker = kind === 'pk' ? 'PK ' : kind === 'fk' ? 'FK ' : kind === 'pkfk' ? 'PK·FK ' : '';
      svg += `<text x="${p.x + 11}" y="${p.y + HEAD + i * ROW + 15}" font-family="'JetBrains Mono',monospace" font-size="11" fill="#C6D4E6">${esc(marker + name)}</text>`;
      svg += `<text x="${p.x + W - 11}" y="${p.y + HEAD + i * ROW + 15}" font-family="'JetBrains Mono',monospace" font-size="9.5" fill="#4E6183" text-anchor="end">${esc(type)}</text>`;
    });
  });
  return svg + '</svg>';
}

/** Helper: alvo da FK estática de uma coluna. */
function findFkTarget(tableName, colName) {
  const key = `${tableName}.${colName}`;
  const match = STATIC_RELS.find(([from]) => from === key);
  return match ? match[1] : null;
}

/**
 * Retorna a definição estática das tabelas (para teste).
 * @returns {object[]}
 */
export function getERTables() {
  return STATIC_TABLES.map(t => ({
    name: t.name,
    columns: t.columns.map(([name, type, kind]) => ({
      name,
      type,
      pk: kind === 'pk' || kind === 'pkfk',
      fk: kind === 'fk' || kind === 'pkfk' ? findFkTarget(t.name, name) : null,
    })),
  }));
}

/**
 * Retorna a definição estática das relações (para teste).
 * @returns {object[]}
 */
export function getERRelations() {
  return STATIC_RELS.map(([from, to]) => ({ from, to }));
}
