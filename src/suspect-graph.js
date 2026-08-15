/**
 * suspect-graph.js — Lógica pura do grafo investigativo.
 *
 * Calcula layout, estados ativos e cores para o Suspect Graph Visualizer.
 * Não acessa DOM, document, window ou state.
 */

/** @typedef {{id: string, type: string, label: string, revealedLabel?: string, revealAtMission?: number, unlockEvidence?: string, detail?: string}} GraphNode */
/** @typedef {{source: string, target: string}} GraphEdge */
/** @typedef {{nodes: GraphNode[], edges: GraphEdge[]}} GraphConfig */
/** @typedef {{x: number, y: number, active: boolean, color: string, revealedLabel: string|null}} ComputedNode */

const COLORS = {
  suspect: '#ef4444',        // vermelho neon
  suspectGlow: '#00d9ff',    // ciano neon quando suspeita alta
  email: '#a855f7',            // roxo
  external_account: '#fbbf24', // âmbar
  access_log: '#22c55e',     // verde
  inactive: '#475569',       // cinza escuro
  edgeInactive: '#334155',
  edgeActive: '#00d9ff',
};

/**
 * Verifica se um nó deve estar ativo.
 * @param {GraphNode} node
 * @param {number[]} completedLevels
 * @param {string[]} evidence
 * @returns {boolean}
 */
function isNodeActive(node, completedLevels, evidence) {
  if (node.unlockEvidence) {
    return evidence.some(e => e.includes(node.unlockEvidence));
  }
  if (node.revealAtMission) {
    const maxCompleted = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
    return node.revealAtMission <= maxCompleted;
  }
  return false;
}

/**
 * Calcula o label exibido, respeitando revelação por missão.
 * @param {GraphNode} node
 * @param {number[]} completedLevels
 * @returns {string}
 */
function getNodeLabel(node, completedLevels) {
  const maxCompleted = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
  if (node.revealedLabel && node.revealAtMission && node.revealAtMission <= maxCompleted) {
    return node.revealedLabel;
  }
  return node.label;
}

/**
 * Calcula a cor de um nó baseado no tipo, estado ativo e suspeita.
 * @param {GraphNode} node
 * @param {boolean} active
 * @param {number} suspicion valor 0-100
 * @returns {string}
 */
function getNodeColor(node, active, suspicion) {
  if (!active) return COLORS.inactive;
  if (node.type === 'suspect') {
    if (suspicion >= 70) return COLORS.suspectGlow;
    if (suspicion >= 40) return COLORS.suspect;
    return '#f97316'; // laranja
  }
  return COLORS[node.type] || COLORS.edgeActive;
}

/**
 * Retorna o estado ativo de cada aresta (ativa se ambos os nós ativos).
 * @param {GraphEdge} edge
 * @param {Set<string>} activeIds
 * @returns {boolean}
 */
function isEdgeActive(edge, activeIds) {
  return activeIds.has(edge.source) && activeIds.has(edge.target);
}

/**
 * Calcula posições em círculo: nós do tipo suspect no centro, demais em anel.
 * @param {GraphNode[]} nodes
 * @param {number} width
 * @param {number} height
 * @returns {Map<string, {x: number, y: number}>}
 */
function calculateLayout(nodes, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.35;
  const positions = new Map();

  const suspects = nodes.filter(n => n.type === 'suspect');
  const satellites = nodes.filter(n => n.type !== 'suspect');

  // Suspeitos no centro, levemente espaçados verticalmente
  suspects.forEach((node, i) => {
    const offset = (i - (suspects.length - 1) / 2) * 30;
    positions.set(node.id, { x: cx, y: cy + offset });
  });

  // Satélites em anel
  satellites.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / Math.max(satellites.length, 1) - Math.PI / 2;
    positions.set(node.id, {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  });

  return positions;
}

/**
 * Constrói o estado computado do grafo.
 * @param {GraphConfig|null} graphConfig
 * @param {number[]} completedLevels
 * @param {string[]} evidence
 * @param {number} suspicion valor 0-100
 * @param {number} [width=320]
 * @param {number} [height=240]
 * @returns {{nodes: Array<ComputedNode & GraphNode & {label: string}>, edges: Array<GraphEdge & {active: boolean}>, activeIds: Set<string>}}
 */
export function buildGraphState(graphConfig, completedLevels, evidence, suspicion, width = 320, height = 240) {
  if (!graphConfig || !Array.isArray(graphConfig.nodes)) {
    return { nodes: [], edges: [], activeIds: new Set() };
  }

  const activeIds = new Set(
    graphConfig.nodes
      .filter(node => isNodeActive(node, completedLevels, evidence))
      .map(node => node.id)
  );

  const positions = calculateLayout(graphConfig.nodes, width, height);

  const nodes = graphConfig.nodes.map(node => {
    const active = activeIds.has(node.id);
    const pos = positions.get(node.id) || { x: width / 2, y: height / 2 };
    return {
      ...node,
      label: getNodeLabel(node, completedLevels),
      x: pos.x,
      y: pos.y,
      active,
      color: getNodeColor(node, active, suspicion),
    };
  });

  const edges = (graphConfig.edges || []).map(edge => ({
    ...edge,
    active: isEdgeActive(edge, activeIds),
  }));

  return { nodes, edges, activeIds };
}

/**
 * Gera a string SVG do grafo.
 * @param {GraphConfig|null} graphConfig
 * @param {number[]} completedLevels
 * @param {string[]} evidence
 * @param {number} suspicion
 * @param {number} [width=320]
 * @param {number} [height=240]
 * @returns {string}
 */
export function renderGraphSVG(graphConfig, completedLevels, evidence, suspicion, width = 320, height = 240) {
  const { nodes, edges } = buildGraphState(graphConfig, completedLevels, evidence, suspicion, width, height);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="suspect-graph-svg" aria-label="Rede de conexões investigativa">`;

  // Defs para glow
  svg += `
    <defs>
      <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;

  // Arestas
  const posMap = new Map(nodes.map(n => [n.id, { x: n.x, y: n.y }]));
  for (const edge of edges) {
    const src = posMap.get(edge.source);
    const tgt = posMap.get(edge.target);
    if (!src || !tgt) continue;
    const cls = edge.active ? 'graph-edge graph-edge-active' : 'graph-edge';
    const stroke = edge.active ? COLORS.edgeActive : COLORS.edgeInactive;
    svg += `<line x1="${src.x.toFixed(1)}" y1="${src.y.toFixed(1)}" x2="${tgt.x.toFixed(1)}" y2="${tgt.y.toFixed(1)}" class="${cls}" stroke="${stroke}" />`;
  }

  // Nós
  for (const node of nodes) {
    const r = node.type === 'suspect' ? 24 : 16;
    const cls = node.active ? `graph-node graph-node-${node.type} graph-node-active` : `graph-node graph-node-${node.type}`;
    const filter = node.active ? 'url(#node-glow)' : 'none';
    svg += `<circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${r}" class="${cls}" fill="${node.color}" filter="${filter}">`;
    svg += `<title>${escapeSvgText(node.label)}${node.detail ? ` — ${escapeSvgText(node.detail)}` : ''}</title>`;
    svg += `</circle>`;

    // Label
    const labelY = node.y + r + 14;
    svg += `<text x="${node.x.toFixed(1)}" y="${labelY.toFixed(1)}" class="graph-node-label" text-anchor="middle" fill="#e2e8f0">${escapeSvgText(node.label)}</text>`;
  }

  svg += '</svg>';
  return svg;
}

/**
 * Escapa texto para uso em SVG.
 * @param {string} text
 * @returns {string}
 */
function escapeSvgText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Exporta constantes de cor para uso no CSS/JS.
 */
export { COLORS };
