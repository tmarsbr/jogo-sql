/**
 * er-diagram.js — Gera um diagrama ER em SVG a partir do schema do banco.
 *
 * Fase 9: diagrama ER legível mostrando tabelas, colunas, PK, FK e relações.
 * O diagrama é renderizado em um modal sobreposto — não bloqueia o editor.
 */

import { getDB, getSchemaDetailed } from './db.js';

/* --- Configuração visual do SVG --- */
const TABLE_WIDTH = 230;
const HEADER_HEIGHT = 28;
const ROW_HEIGHT = 20;
const PADDING = 16;
const TABLE_GAP_X = 80;
const TABLE_GAP_Y = 60;

/* --- Definição estática das tabelas e relações --- */
/* Evita consultar o banco toda vez e garante layout determinístico. */
const TABLES = [
  {
    name: 'departamentos',
    columns: [
      { name: 'id', type: 'INTEGER', pk: true, fk: null },
      { name: 'nome', type: 'TEXT', pk: false, fk: null },
      { name: 'andar', type: 'INTEGER', pk: false, fk: null },
    ],
  },
  {
    name: 'funcionarios',
    columns: [
      { name: 'id', type: 'INTEGER', pk: true, fk: null },
      { name: 'nome', type: 'TEXT', pk: false, fk: null },
      { name: 'cargo', type: 'TEXT', pk: false, fk: null },
      { name: 'departamento_id', type: 'INTEGER', pk: false, fk: 'departamentos.id' },
      { name: 'salario_centavos', type: 'INTEGER', pk: false, fk: null },
      { name: 'data_admissao', type: 'TEXT', pk: false, fk: null },
    ],
  },
  {
    name: 'contas',
    columns: [
      { name: 'id', type: 'INTEGER', pk: true, fk: null },
      { name: 'numero_conta', type: 'TEXT', pk: false, fk: null },
      { name: 'funcionario_id', type: 'INTEGER', pk: false, fk: 'funcionarios.id' },
      { name: 'titular_externo', type: 'TEXT', pk: false, fk: null },
      { name: 'banco', type: 'TEXT', pk: false, fk: null },
      { name: 'tipo', type: 'TEXT', pk: false, fk: null },
    ],
  },
  {
    name: 'transacoes',
    columns: [
      { name: 'id', type: 'INTEGER', pk: true, fk: null },
      { name: 'conta_origem_id', type: 'INTEGER', pk: false, fk: 'contas.id' },
      { name: 'conta_destino_id', type: 'INTEGER', pk: false, fk: 'contas.id' },
      { name: 'valor_centavos', type: 'INTEGER', pk: false, fk: null },
      { name: 'data_hora', type: 'TEXT', pk: false, fk: null },
      { name: 'descricao', type: 'TEXT', pk: false, fk: null },
      { name: 'operador_funcionario_id', type: 'INTEGER', pk: false, fk: 'funcionarios.id' },
    ],
  },
  {
    name: 'logs_acesso',
    columns: [
      { name: 'id', type: 'INTEGER', pk: true, fk: null },
      { name: 'funcionario_id', type: 'INTEGER', pk: false, fk: 'funcionarios.id' },
      { name: 'data_hora', type: 'TEXT', pk: false, fk: null },
      { name: 'tipo', type: 'TEXT', pk: false, fk: null },
      { name: 'local', type: 'TEXT', pk: false, fk: null },
    ],
  },
  {
    name: 'emails',
    columns: [
      { name: 'id', type: 'INTEGER', pk: true, fk: null },
      { name: 'remetente_id', type: 'INTEGER', pk: false, fk: 'funcionarios.id' },
      { name: 'destinatario_id', type: 'INTEGER', pk: false, fk: 'funcionarios.id' },
      { name: 'assunto', type: 'TEXT', pk: false, fk: null },
      { name: 'data_hora', type: 'TEXT', pk: false, fk: null },
      { name: 'conteudo', type: 'TEXT', pk: false, fk: null },
    ],
  },
];

/* --- Posições das tabelas no grid (layout manual para clareza) --- */
/* Grid 3 colunas x 2 linhas:
 *   [departamentos] [funcionarios] [contas]
 *   [transacoes]    [logs_acesso]  [emails]
 */
const TABLE_POSITIONS = {
  departamentos:  { col: 0, row: 0 },
  funcionarios:   { col: 1, row: 0 },
  contas:         { col: 2, row: 0 },
  transacoes:     { col: 0, row: 1 },
  logs_acesso:    { col: 1, row: 1 },
  emails:         { col: 2, row: 1 },
};

/* --- Relações FK (de -> para) --- */
const RELATIONS = [
  { from: 'funcionarios.departamento_id',   to: 'departamentos.id' },
  { from: 'contas.funcionario_id',           to: 'funcionarios.id' },
  { from: 'transacoes.conta_origem_id',      to: 'contas.id' },
  { from: 'transacoes.conta_destino_id',     to: 'contas.id' },
  { from: 'transacoes.operador_funcionario_id', to: 'funcionarios.id' },
  { from: 'logs_acesso.funcionario_id',      to: 'funcionarios.id' },
  { from: 'emails.remetente_id',             to: 'funcionarios.id' },
  { from: 'emails.destinatario_id',          to: 'funcionarios.id' },
];

/**
 * Calcula as coordenadas (x, y) de cada tabela no SVG.
 * Usa altura máxima por linha para alinhar todas as tabelas da mesma linha.
 * @returns {Object<string, {x: number, y: number, width: number, height: number}>}
 */
function computeLayout() {
  // Calcula a altura máxima de cada linha do grid
  const rowHeights = {};
  for (const table of TABLES) {
    const pos = TABLE_POSITIONS[table.name];
    const h = computeTableHeight(table);
    if (!rowHeights[pos.row] || rowHeights[pos.row] < h) {
      rowHeights[pos.row] = h;
    }
  }

  // Calcula o offset Y acumulado de cada linha
  const rowOffsets = {};
  let accumY = PADDING;
  const maxRow = Math.max(...Object.values(TABLE_POSITIONS).map(p => p.row));
  for (let r = 0; r <= maxRow; r++) {
    rowOffsets[r] = accumY;
    accumY += rowHeights[r] + TABLE_GAP_Y;
  }

  const layout = {};
  for (const table of TABLES) {
    const pos = TABLE_POSITIONS[table.name];
    const x = PADDING + pos.col * (TABLE_WIDTH + TABLE_GAP_X);
    const y = rowOffsets[pos.row];
    layout[table.name] = {
      x,
      y,
      width: TABLE_WIDTH,
      height: computeTableHeight(table),
    };
  }
  return layout;
}

/**
 * Calcula a altura de uma tabela no SVG.
 * @param {object} table
 * @returns {number}
 */
function computeTableHeight(table) {
  return HEADER_HEIGHT + table.columns.length * ROW_HEIGHT;
}

/**
 * Encontra a posição Y de uma coluna dentro de uma tabela.
 * @param {object} table
 * @param {string} colName
 * @returns {number} offset Y relativo ao topo da tabela
 */
function findColumnY(table, colName) {
  const idx = table.columns.findIndex(c => c.name === colName);
  if (idx === -1) return HEADER_HEIGHT + ROW_HEIGHT / 2;
  return HEADER_HEIGHT + idx * ROW_HEIGHT + ROW_HEIGHT / 2;
}

/**
 * Encontra a tabela pelo nome.
 * @param {string} name
 * @returns {object|null}
 */
function findTable(name) {
  return TABLES.find(t => t.name === name) || null;
}

/**
 * Escapa texto para uso seguro em SVG.
 * @param {string} text
 * @returns {string}
 */
function escSvg(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Gera o SVG completo do diagrama ER.
 * @returns {string} HTML string com o SVG
 */
export function generateERDiagramSVG() {
  const layout = computeLayout();

  // Calcula dimensões do SVG
  let maxX = 0, maxY = 0;
  for (const key in layout) {
    const pos = layout[key];
    maxX = Math.max(maxX, pos.x + pos.width);
    maxY = Math.max(maxY, pos.y + pos.height);
  }
  const svgWidth = maxX + PADDING;
  const svgHeight = maxY + PADDING;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="Diagrama de entidades e relacionamentos" style="max-width: none; height: auto;">`;

  // --- Desenha relações primeiro (fica atrás das tabelas) ---
  for (const rel of RELATIONS) {
    const [fromTable, fromCol] = rel.from.split('.');
    const [toTable, toCol] = rel.to.split('.');

    const fromLayout = layout[fromTable];
    const toLayout = layout[toTable];
    if (!fromLayout || !toLayout) continue;

    const fromT = findTable(fromTable);
    const toT = findTable(toTable);
    if (!fromT || !toT) continue;

    const fromY = fromLayout.y + findColumnY(fromT, fromCol);
    const toY = toLayout.y + findColumnY(toT, toCol);

    // Ponto de saída: borda direita ou esquerda da tabela de origem
    const fromX = fromLayout.x + fromLayout.width;
    // Ponto de chegada: borda esquerda da tabela de destino
    const toX = toLayout.x;

    // Curva de Bezier para a relação
    const midX = (fromX + toX) / 2;
    svg += `<path class="er-relation" d="M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}" />`;
    // Ponto na extremidade da FK
    svg += `<circle class="er-relation-dot" cx="${fromX}" cy="${fromY}" r="3" />`;
    // Ponto na extremidade da PK referenciada
    svg += `<circle class="er-relation-dot" cx="${toX}" cy="${toY}" r="3" />`;
  }

  // --- Desenha tabelas ---
  for (const table of TABLES) {
    const pos = layout[table.name];
    const h = computeTableHeight(table);

    // Fundo da tabela
    svg += `<rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${h}" rx="8" ry="8" fill="rgba(17,24,39,0.9)" stroke="#2a3a5c" stroke-width="1" />`;

    // Header
    svg += `<rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${HEADER_HEIGHT}" rx="8" ry="8" class="er-table-header" />`;
    // Corrige cantos inferiores do header (retângulo sobreposto)
    svg += `<rect x="${pos.x}" y="${pos.y + HEADER_HEIGHT - 8}" width="${pos.width}" height="8" fill="rgba(0,217,255,0.15)" />`;
    svg += `<line x1="${pos.x}" y1="${pos.y + HEADER_HEIGHT}" x2="${pos.x + pos.width}" y2="${pos.y + HEADER_HEIGHT}" stroke="#00d9ff" stroke-width="1" opacity="0.5" />`;
    svg += `<text x="${pos.x + 10}" y="${pos.y + 18}" class="er-table-title">${escSvg(table.name)}</text>`;

    // Colunas
    for (let i = 0; i < table.columns.length; i++) {
      const col = table.columns[i];
      const colY = pos.y + HEADER_HEIGHT + i * ROW_HEIGHT + 14;
      const colX = pos.x + 10;

      // Indicador PK/FK
      let marker = '';
      let markerClass = '';
      if (col.pk) {
        marker = 'PK';
        markerClass = 'er-pk';
      } else if (col.fk) {
        marker = 'FK';
        markerClass = 'er-fk';
      }

      // Nome da coluna com indicador
      if (marker) {
        svg += `<text x="${colX}" y="${colY}" class="er-col-name ${markerClass}">${marker} ${escSvg(col.name)}</text>`;
      } else {
        svg += `<text x="${colX}" y="${colY}" class="er-col-name">${escSvg(col.name)}</text>`;
      }

      // Tipo (alinhado à direita)
      svg += `<text x="${pos.x + pos.width - 10}" y="${colY}" class="er-col-type" text-anchor="end">${escSvg(col.type)}</text>`;

      // Linha separadora entre colunas
      if (i < table.columns.length - 1) {
        svg += `<line x1="${pos.x + 8}" y1="${colY + 6}" x2="${pos.x + pos.width - 8}" y2="${colY + 6}" stroke="#2a3a5c" stroke-width="0.5" opacity="0.4" />`;
      }
    }
  }

  svg += '</svg>';
  return svg;
}

/** Gera um diagrama a partir do schema carregado do caso ativo. */
function generateActiveCaseERDiagramSVG() {
  const tables = getSchemaDetailed();
  if (tables.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="140" viewBox="0 0 420 140" role="img" aria-label="Nenhuma tabela criada ainda" style="max-width: none; height: auto;">
      <rect x="0" y="0" width="420" height="140" rx="8" fill="rgba(17,24,39,0.9)" stroke="#2a3a5c" />
      <text x="210" y="60" class="er-table-title" text-anchor="middle">O desenho começa vazio.</text>
      <text x="210" y="90" font-family="Inter, sans-serif" font-size="12" fill="#8b99b8" text-anchor="middle">Escreva seu primeiro CREATE TABLE e o diagrama surge aqui.</text>
    </svg>`;
  }
  const columns = 3;
  const positions = {};
  const rowHeights = [];
  tables.forEach((table, index) => {
    const row = Math.floor(index / columns);
    positions[table.tableName] = { col: index % columns, row };
    rowHeights[row] = Math.max(rowHeights[row] || 0, HEADER_HEIGHT + table.columns.length * ROW_HEIGHT);
  });
  const rowOffsets = [];
  let y = PADDING;
  rowHeights.forEach((height, row) => { rowOffsets[row] = y; y += height + TABLE_GAP_Y; });
  const layout = {};
  tables.forEach(table => {
    const pos = positions[table.tableName];
    layout[table.tableName] = { x: PADDING + pos.col * (TABLE_WIDTH + TABLE_GAP_X), y: rowOffsets[pos.row], width: TABLE_WIDTH, height: HEADER_HEIGHT + table.columns.length * ROW_HEIGHT };
  });
  const svgWidth = PADDING * 2 + Math.min(columns, tables.length) * TABLE_WIDTH + Math.max(0, Math.min(columns, tables.length) - 1) * TABLE_GAP_X;
  const svgHeight = y - TABLE_GAP_Y + PADDING;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="Diagrama de entidades e relacionamentos" style="max-width: none; height: auto;">`;
  tables.forEach(table => table.columns.filter(column => column.fk).forEach(column => {
    const [targetName] = column.fk.split('.');
    const from = layout[table.tableName]; const target = layout[targetName];
    if (!target) return;
    const rowIndex = table.columns.findIndex(item => item.name === column.name);
    const fromY = from.y + HEADER_HEIGHT + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
    const toY = target.y + HEADER_HEIGHT + ROW_HEIGHT / 2;
    const fromX = from.x + from.width; const toX = target.x;
    svg += `<path class="er-relation" d="M ${fromX} ${fromY} L ${toX} ${toY}" /><circle class="er-relation-dot" cx="${fromX}" cy="${fromY}" r="3" />`;
  }));
  tables.forEach(table => {
    const pos = layout[table.tableName];
    svg += `<rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" rx="8" fill="rgba(17,24,39,0.9)" stroke="#2a3a5c" />`;
    svg += `<rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${HEADER_HEIGHT}" rx="8" class="er-table-header" /><text x="${pos.x + 10}" y="${pos.y + 18}" class="er-table-title">${escSvg(table.tableName)}</text>`;
    table.columns.forEach((column, index) => {
      const colY = pos.y + HEADER_HEIGHT + index * ROW_HEIGHT + 14;
      const marker = column.pk ? 'PK ' : column.fk ? 'FK ' : '';
      const cls = column.pk ? ' er-pk' : column.fk ? ' er-fk' : '';
      svg += `<text x="${pos.x + 10}" y="${colY}" class="er-col-name${cls}">${marker}${escSvg(column.name)}</text><text x="${pos.x + pos.width - 10}" y="${colY}" class="er-col-type" text-anchor="end">${escSvg(column.type)}</text>`;
    });
  });
  return svg + '</svg>';
}

/**
 * Renderiza o diagrama ER no container especificado.
 * @param {HTMLElement} container elemento onde o SVG será inserido
 */
export function renderERDiagram(container) {
  if (!container) return;
  const svg = generateActiveCaseERDiagramSVG();
  container.innerHTML = svg;
}

/**
 * Retorna a definição estática das tabelas (para teste).
 * @returns {object[]}
 */
export function getERTables() {
  return TABLES;
}

/**
 * Retorna a definição estática das relações (para teste).
 * @returns {object[]}
 */
export function getERRelations() {
  return RELATIONS;
}
