/**
 * ui.js — Módulo de renderização e eventos da interface (Cyber Forensics).
 */

import { state } from './state.js';
import { getSuspectProfiles } from './suspect-meter.js';
import { renderGraphSVG } from './suspect-graph.js';

/* --- Referências de DOM (cache) --- */
const $ = (sel) => document.querySelector(sel);
let resetReturnFocus = null;
let conclusionReturnFocus = null;
let interrogationReturnFocus = null;

const dom = {
  loading: null,
  errorBanner: null,
  errorMsg: null,
  errorRetry: null,
  dbStatus: null,
  missionStatus: null,
  scoreStatus: null,
  headerProgressBar: null,
  headerProgressLabel: null,
  headerCaseTag: null,
  headerBadgeTag: null,
  missionNumBadge: null,
  briefingContent: null,
  schemaContent: null,
  sqlEditor: null,
  btnRun: null,
  btnClear: null,
  btnHint: null,
  btnAiReview: null,
  btnNext: null,
  resultsContainer: null,
  progressDisplay: null,
  hintsDisplay: null,
  hintChat: null,
  hintChatLog: null,
  hintChatForm: null,
  hintChatInput: null,
  btnHintChatSend: null,
  evidenceDisplay: null,
  tabsNav: null,
  timelineSection: null,
  timelineDisplay: null,
  btnTimelineCheck: null,
  suspectSection: null,
  suspectDisplay: null,
  graphSection: null,
  graphDisplay: null,
  interrogationSection: null,
  btnStartInterrogation: null,
  interrogationModal: null,
  interrogationSuspectName: null,
  interrogationStatement: null,
  interrogationEvidenceList: null,
  interrogationFeedback: null,
  btnInterrogationClose: null,
  railContainer: null,
};

/**
 * Inicializa cache de DOM.
 * Deve ser chamado após o DOM estar pronto.
 */
export function initDOM() {
  dom.loading = $('#app-loading');
  dom.errorBanner = $('#app-error');
  dom.errorMsg = $('#app-error-msg');
  dom.errorRetry = $('#app-error-retry');
  dom.dbStatus = $('#db-status');
  dom.missionStatus = $('#mission-status');
  dom.scoreStatus = $('#score-status');
  dom.headerProgressBar = $('#header-progress-bar');
  dom.headerProgressLabel = $('#header-progress-label');
  dom.headerCaseTag = $('#header-case-tag');
  dom.headerBadgeTag = $('#header-badge-tag');
  dom.missionNumBadge = $('#mission-num-badge');
  dom.btnRailToggleBriefing = $('#btn-rail-toggle-briefing');
  dom.btnCollapseBriefing = $('#btn-collapse-briefing');
  dom.btnToggleBriefing = $('#btn-toggle-briefing');
  dom.briefingContent = $('#briefing-content');
  dom.schemaContent = $('#schema-content');
  dom.sqlEditor = $('#sql-editor');
  dom.btnRun = $('#btn-run');
  dom.btnClear = $('#btn-clear');
  dom.btnHint = $('#btn-hint');
  dom.btnAiReview = $('#btn-ai-review');
  dom.btnNext = $('#btn-next');
  dom.resultsContainer = $('#results-container');
  dom.progressDisplay = $('#progress-display');
  dom.hintsDisplay = $('#hints-display');
  dom.hintChat = $('#hint-chat');
  dom.hintChatLog = $('#hint-chat-log');
  dom.hintChatForm = $('#hint-chat-form');
  dom.hintChatInput = $('#hint-chat-input');
  dom.btnHintChatSend = $('#btn-hint-chat-send');
  dom.evidenceDisplay = $('#evidence-display');
  dom.lessonDisplay = $('#lesson-display');
  dom.tabsNav = $('#tabs-nav');
  dom.timelineSection = $('#timeline-section');
  dom.timelineDisplay = $('#timeline-display');
  dom.btnTimelineCheck = $('#btn-timeline-check');
  dom.suspectSection = $('#suspect-section');
  dom.suspectDisplay = $('#suspect-display');
  dom.graphSection = $('#graph-section');
  dom.graphDisplay = $('#graph-display');
  dom.interrogationSection = $('#interrogation-section');
  dom.btnStartInterrogation = $('#btn-start-interrogation');
  dom.interrogationModal = $('#interrogation-modal');
  dom.interrogationSuspectName = $('#interrogation-suspect-name');
  dom.interrogationStatement = $('#interrogation-statement');
  dom.interrogationEvidenceList = $('#interrogation-evidence-list');
  dom.interrogationFeedback = $('#interrogation-feedback');
  dom.btnInterrogationClose = $('#btn-interrogation-close');
  dom.railContainer = $('#rail-buttons-container');
}

/* --- Loading --- */

export function hideLoading() {
  if (dom.loading) {
    dom.loading.classList.add('hidden');
    setTimeout(() => { dom.loading.style.display = 'none'; }, 300);
  }
}

/* --- Erro global --- */

export function showGlobalError(msg) {
  if (dom.errorBanner && dom.errorMsg) {
    dom.errorMsg.textContent = msg || 'Erro ao carregar o jogo.';
    dom.errorBanner.hidden = false;
  }
}

export function hideGlobalError() {
  if (dom.errorBanner) dom.errorBanner.hidden = true;
}

/* --- Status do banco --- */

export function setDbStatus(status, label) {
  if (!dom.dbStatus) return;
  dom.dbStatus.className = 'status-pill';
  if (status === 'ok') dom.dbStatus.classList.add('status-ok');
  else if (status === 'pending') dom.dbStatus.classList.add('status-pending');
  else if (status === 'error') dom.dbStatus.classList.add('status-error');
  dom.dbStatus.textContent = label || '● BANCO: —';
}

/* --- Status da missão & Header --- */

export function setMissionStatus(label) {
  if (dom.missionStatus) dom.missionStatus.textContent = label || 'Missão: —';
  if (dom.missionNumBadge && label) {
    const match = label.match(/Missão (\d+)/i);
    if (match) {
      const totalMatch = dom.headerProgressLabel?.textContent.match(/\/(\d+)/);
      const total = totalMatch ? `/${totalMatch[1]}` : '';
      dom.missionNumBadge.textContent = `MISSÃO ${String(match[1]).padStart(2, '0')}${total}`;
    } else {
      dom.missionNumBadge.textContent = label.toUpperCase();
    }
  }
}

export function setHeaderCaseInfo(tag, isConfidential = true, customBadge = null) {
  if (dom.headerCaseTag && tag) dom.headerCaseTag.textContent = tag;
  if (dom.headerBadgeTag) {
    if (customBadge) {
      dom.headerBadgeTag.textContent = customBadge;
      dom.headerBadgeTag.className = 'pill-badge concept-tag';
    } else if (isConfidential) {
      dom.headerBadgeTag.textContent = '🚨 CONFIDENCIAL';
      dom.headerBadgeTag.className = 'pill-badge confidential';
    } else {
      dom.headerBadgeTag.textContent = '📊 ANALYTICS';
      dom.headerBadgeTag.className = 'pill-badge concept-tag';
    }
  }
}

export function renderHeaderProgress(completedCount, totalCount) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  if (dom.headerProgressBar) {
    dom.headerProgressBar.style.width = `${pct}%`;
  }
  if (dom.headerProgressLabel) {
    dom.headerProgressLabel.textContent = `${completedCount}/${totalCount} MISSÕES`;
  }
  const lobbyStat = $('#lobby-missions-stat');
  if (lobbyStat) {
    lobbyStat.textContent = `${String(completedCount).padStart(2, '0')}/${totalCount}`;
  }
}

/* --- Rail de Missões --- */

export function renderMissionRail(allLevels, currentLevelId, completedLevels, onSelect, lessonsRead = [], lockedLevelIds = []) {
  const container = dom.railContainer || $('#rail-buttons-container');
  if (!container || !Array.isArray(allLevels)) return;
  const locked = new Set(lockedLevelIds);

  container.innerHTML = allLevels.map(level => {
    const isCurrent = level.id === currentLevelId;
    const isCompleted = completedLevels.includes(level.id);
    const isLocked = locked.has(level.id);
    const isLessonRead = Boolean(level.courseRefs?.[0] && lessonsRead.includes(level.courseRefs[0]));
    let cls = 'rail-btn';
    if (isCurrent) cls += ' active';
    else if (isCompleted) cls += ' completed';
    if (isLocked) cls += ' locked';
    if (isLessonRead) cls += ' lesson-read';
    const title = `${level.title}${isLessonRead ? ' · aula lida' : ''}${isLocked ? ' · conclua as missões anteriores' : ''}`;
    return `<button type="button" class="${cls}" data-level-id="${level.id}" title="${escapeHtml(title)}"${isLocked ? ' disabled aria-disabled="true"' : ''}>${level.id}${isLessonRead ? '<span class="rail-lesson-check" aria-hidden="true">✓</span><span class="sr-only"> Aula lida</span>' : ''}</button>`;
  }).join('');

  container.querySelectorAll('[data-level-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const levelId = parseInt(btn.dataset.levelId, 10);
      if (typeof onSelect === 'function') {
        onSelect(levelId);
      }
    });
  });
}

/* --- Briefing --- */

export function setBriefing(html) {
  if (dom.briefingContent) dom.briefingContent.innerHTML = html;
}

/* --- Esquema --- */

export function setSchema(text) {
  if (dom.schemaContent) dom.schemaContent.textContent = text;
}

/* --- Resultados --- */

export function setResults(html) {
  if (dom.resultsContainer) dom.resultsContainer.innerHTML = html;
}

/**
 * Renderiza uma tabela HTML a partir do resultado do executor.
 * @param {{type: string, columns: string[], rows: any[][], rowCount: number, message: string}} result
 */
export function renderResults(result) {
  if (!dom.resultsContainer) return;

  if (result.type === 'ok') {
    let html = '<div class="results-table-wrap"><table class="results-table"><thead><tr>';
    for (const col of result.columns) {
      html += `<th>${escapeHtml(col)}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (const row of result.rows) {
      html += '<tr>';
      for (const cell of row) {
        html += `<td>${escapeHtml(cell === null ? 'NULL' : String(cell))}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    html += `<p class="result-meta">${result.message}</p>`;
    dom.resultsContainer.innerHTML = html;
  } else if (result.type === 'empty') {
    dom.resultsContainer.innerHTML = `<p class="placeholder-text">${escapeHtml(result.message)}</p>`;
  } else {
    dom.resultsContainer.innerHTML = `<div class="feedback feedback-error">${escapeHtml(result.message)}</div>`;
  }
}

/**
 * Escapa HTML para evitar injeção de conteúdo.
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* --- Editor --- */

export function getEditorValue() {
  return dom.sqlEditor ? dom.sqlEditor.value : '';
}

export function setEditorValue(value) {
  if (dom.sqlEditor) dom.sqlEditor.value = value || '';
}

export function clearEditor() {
  if (dom.sqlEditor) dom.sqlEditor.value = '';
}

/* --- Botões --- */

export function enableEditorButtons(enabled) {
  if (dom.btnRun) dom.btnRun.disabled = !enabled;
  if (dom.btnClear) dom.btnClear.disabled = !enabled;
  if (dom.btnHint) dom.btnHint.disabled = !enabled;
}

/* --- Progresso / Dicas / Evidências --- */

export function setProgress(html) {
  if (dom.progressDisplay) dom.progressDisplay.innerHTML = html;
}

export function setHints(html) {
  if (dom.hintsDisplay) dom.hintsDisplay.innerHTML = html;
}

export function setEvidence(html) {
  if (dom.evidenceDisplay) dom.evidenceDisplay.innerHTML = html;
}

export function setLesson(html) {
  if (dom.lessonDisplay) dom.lessonDisplay.innerHTML = html;
}

/* --- Renderização de missão --- */

/**
 * Renderiza o briefing de uma missão no painel esquerdo.
 * @param {object} level dados da missão
 * @param {object[]} [courseItems] itens de conteúdo do curso relacionados
 */
export function buildMissionContract(level) {
  if (!level) return '';
  const rows = [];
  if (level.executionMode === 'create_view' && level.viewName) {
    rows.push(`<li><strong>VIEW:</strong> <code>${escapeHtml(level.viewName)}</code></li>`);
  }
  if (Array.isArray(level.expectedColumns) && level.expectedColumns.length > 0) {
    rows.push(`<li><strong>COLUNAS:</strong> ${level.expectedColumns.map(c => `<code>${escapeHtml(c)}</code>`).join(', ')}</li>`);
  }
  if (Array.isArray(level.requiredConcepts) && level.requiredConcepts.length > 0) {
    rows.push(`<li><strong>TÉCNICAS:</strong> ${level.requiredConcepts.map(c => `<code>${escapeHtml(c.toUpperCase())}</code>`).join(', ')}</li>`);
  }
  if (Array.isArray(level.requirements) && level.requirements.length > 0) {
    rows.push(`<li><strong>REGRAS:</strong> ${level.requirements.map(r => escapeHtml(r)).join('; ')}</li>`);
  }
  if (rows.length === 0) return '';
  return `
    <div class="mission-contract">
      <strong>SAÍDA ESPERADA</strong>
      <p class="mission-contract-lead">O validador automatizado espera exatamente esta assinatura:</p>
      <ul>${rows.join('')}</ul>
    </div>
  `;
}

export function renderMission(level, courseItems, lessonsRead = []) {
  if (!dom.briefingContent) return;
  let html = `
    <div class="mission-briefing">
      <span class="pill-badge concept-tag">${escapeHtml(level.concept)}</span>
      <h2 class="mission-title">${escapeHtml(level.title)}</h2>
      <p class="mission-briefing-text">${escapeHtml(level.briefing)}</p>
      <div class="mission-objective">
        <strong>OBJETIVO</strong>
        <p>${escapeHtml(level.objective)}</p>
      </div>
      <div class="mission-tables">
        <strong>TABELAS EM ESCOPO</strong>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
          ${level.tables.map(t => `<code>${escapeHtml(t)}</code>`).join('')}
        </div>
      </div>
  `;

  if (courseItems && courseItems.length > 0) {
    const isLessonRead = lessonsRead.includes(courseItems[0].id);
    html += `
      <div class="mission-lesson-link">
        <button type="button" class="btn btn-lesson${isLessonRead ? ' is-read' : ''}" data-open-lesson>
          VER AULA · ${escapeHtml(courseItems[0].concept)}${isLessonRead ? ' · ✓ LIDA' : ''}
        </button>
      </div>`;
  }

  html += buildMissionContract(level);
  html += '</div>';
  dom.briefingContent.innerHTML = html;
}

/**
 * Renderiza feedback específico após validar uma query.
 * @param {object} feedback resultado do validateLevel
 */
export function renderFeedback(feedback) {
  let cls = 'feedback';
  let label = '';

  switch (feedback.type) {
    case 'correct':
      cls = 'feedback feedback-success';
      label = '✓ CORRETO.';
      break;
    case 'wrong_result':
      cls = 'feedback feedback-warn';
      label = '✕ RESULTADO INCORRETO.';
      break;
    case 'missing_concept':
      cls = 'feedback feedback-warn';
      label = '⚠ CONCEITO AUSENTE.';
      break;
    case 'sql_error':
      cls = 'feedback feedback-error';
      label = '⚠ ERRO DE SQL.';
      break;
    case 'missing_columns':
      cls = 'feedback feedback-warn';
      label = '⚠ COLUNAS AUSENTES.';
      break;
    case 'blocked':
      cls = 'feedback feedback-error';
      label = '⛔ COMANDO BLOQUEADO.';
      break;
  }

  const container = dom.resultsContainer;
  if (container) {
    const existing = container.querySelector('.feedback');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = cls;
    div.innerHTML = `<strong style="font-family: var(--font-mono); letter-spacing: .06em;">${label}</strong> ${escapeHtml(feedback.message)}`;
    container.appendChild(div);
  }
}

/**
 * Renderiza as dicas reveladas.
 * @param {object} level dados da missão
 * @param {(string|{source: string, text: string})[]} revealed dicas já reveladas
 */
export function renderHints(level, revealed) {
  if (!dom.hintsDisplay) return;
  setHintChatVisible(revealed.length > 0);
  if (revealed.length === 0) {
    dom.hintsDisplay.innerHTML = '<p class="placeholder-text">Clique em "Solicitar dica" se precisar de auxílio investigativo.</p>';
    if (dom.btnHint) {
      dom.btnHint.textContent = 'SOLICITAR DICA (3 RESTANTES)';
    }
    return;
  }
  let html = '';
  for (let i = 0; i < revealed.length; i++) {
    const item = revealed[i];
    const isObj = typeof item === 'object' && item !== null;
    const text = isObj ? item.text : item;
    const source = isObj ? item.source : 'local';
    const label = source === 'local' ? 'BASE LOCAL' : 'IA FORENSE';
    html += `
      <div class="hint-item">
        <strong>DICA ${i + 1} · ${escapeHtml(label)}</strong>
        <span>${escapeHtml(text)}</span>
      </div>
    `;
  }
  dom.hintsDisplay.innerHTML = html;

  if (dom.btnHint) {
    const remaining = Math.max(0, 3 - revealed.length);
    dom.btnHint.textContent = remaining > 0
      ? `SOLICITAR DICA (${remaining} RESTANTES)`
      : 'LIMITE DE DICAS ATINGIDO';
  }
}

/**
 * Renderiza o progresso do jogador (para testes e retrocompatibilidade).
 * @param {object[]} allLevels todos os níveis
 * @param {number[]} completedLevels IDs dos níveis concluídos
 * @param {Object<number, {stars: number, hintsUsed: number}>} levelProgress progresso por nível
 */
export function renderProgress(allLevels, completedLevels, levelProgress) {
  if (!dom.progressDisplay) return;
  let html = '<div class="progress-list">';
  for (const level of allLevels) {
    const done = completedLevels.includes(level.id);
    const cls = done ? 'progress-item completed' : 'progress-item';
    const icon = done ? '✅' : '⬛';

    let starsHtml = '';
    if (done && levelProgress[level.id]) {
      const stars = levelProgress[level.id].stars;
      for (let i = 0; i < 3; i++) {
        starsHtml += i < stars ? '★' : '☆';
      }
      starsHtml = `<span class="progress-stars">${starsHtml}</span>`;
    }

    html += `<div class="${cls}">${icon} <span class="progress-label">Missão ${level.id}: ${escapeHtml(level.title)}</span>${starsHtml}</div>`;
  }
  html += '</div>';
  html += `<p class="progress-summary">${completedLevels.length} de ${allLevels.length} missões concluídas</p>`;
  dom.progressDisplay.innerHTML = html;
}

/**
 * Renderiza as evidências com suporte a cartões desclassificados e classificados (com blur).
 * @param {string[]|object[]} evidenceOrLevels lista de evidências ou níveis
 * @param {object[]} [allLevels] lista de todos os níveis do caso
 * @param {number[]} [completedLevels] IDs dos níveis concluídos
 */
export function renderEvidence(evidenceOrLevels, allLevels = null, completedLevels = []) {
  if (!dom.evidenceDisplay) return;

  if (Array.isArray(allLevels) && allLevels.length > 0) {
    const unlockedCount = completedLevels.length;
    const evidenceList = Array.isArray(evidenceOrLevels) ? evidenceOrLevels : [];
    // Mantém uma prévia do início e inclui evidências concluídas fora de ordem.
    const previewCount = Math.min(
      allLevels.length,
      Math.max(unlockedCount + 1, Math.min(5, allLevels.length))
    );
    const visibleIds = new Set(allLevels.slice(0, previewCount).map(level => level.id));
    for (const level of allLevels) {
      if (completedLevels.includes(level.id) || evidenceList.includes(level.evidence)) {
        visibleIds.add(level.id);
      }
    }
    const visibleLevels = allLevels.filter(level => visibleIds.has(level.id));

    let html = '';
    for (const level of visibleLevels) {
      const isUnlocked = completedLevels.includes(level.id) || (Array.isArray(evidenceOrLevels) && evidenceOrLevels.includes(level.evidence));
      const numStr = String(level.id).padStart(2, '0');
      if (isUnlocked) {
        html += `
          <div class="evidence-card unlocked">
            <div class="evidence-card-header">
              <span class="evidence-num">EVIDÊNCIA ${numStr}</span>
              <span class="pill-badge" style="border-color: rgba(34,197,94,.4); color: #4ADE80; background: rgba(34,197,94,.08);">✓ DESCLASSIFICADO</span>
            </div>
            <p class="evidence-text">${escapeHtml(level.evidence)}</p>
          </div>
        `;
      } else {
        html += `
          <div class="evidence-card locked">
            <div class="evidence-card-header">
              <span class="evidence-num">EVIDÊNCIA ${numStr}</span>
              <span class="pill-badge" style="border-color: rgba(239,68,68,.35); color: #FF6B7F; background: rgba(239,68,68,.07);">CLASSIFICADO</span>
            </div>
            <p class="evidence-text">${escapeHtml(level.evidence)}</p>
          </div>
        `;
      }
    }
    dom.evidenceDisplay.innerHTML = html;
    return;
  }

  // Fallback para quando é passado apenas o array simples de evidências
  const evidenceList = Array.isArray(evidenceOrLevels) ? evidenceOrLevels : [];
  if (evidenceList.length === 0) {
    dom.evidenceDisplay.innerHTML = '<p class="placeholder-text">Nenhuma evidência coletada ainda.</p>';
    return;
  }

  let html = '';
  for (let i = 0; i < evidenceList.length; i++) {
    const numStr = String(i + 1).padStart(2, '0');
    html += `
      <div class="evidence-card unlocked">
        <div class="evidence-card-header">
          <span class="evidence-num">EVIDÊNCIA ${numStr}</span>
          <span class="pill-badge" style="border-color: rgba(34,197,94,.4); color: #4ADE80; background: rgba(34,197,94,.08);">✓ DESCLASSIFICADO</span>
        </div>
        <p class="evidence-text">${escapeHtml(evidenceList[i])}</p>
      </div>
    `;
  }
  dom.evidenceDisplay.innerHTML = html;
}

/**
 * Renderiza as evidências do modo Bug Hunter.
 * Diferente das missões comuns, cada relatório tem sua evidência de lição;
 * apenas os desafios já corrigidos são desclassificados (completos) e o restante
 * aparece em prévia borrada (classified), revelando os próximos N itens para
 * não esconder a existência dos relatórios restantes.
 * @param {object[]} challenges lista de desafios BUG_CHALLENGES
 * @param {string[]} completedLevelIds ids concluídos
 */
export function renderBugEvidence(challenges, completedLevelIds) {
  if (!dom.evidenceDisplay) return;
  if (!challenges || challenges.length === 0) {
    dom.evidenceDisplay.innerHTML = '<p class="placeholder-text">Nenhuma evidência coletada ainda.</p>';
    return;
  }

  const completedSet = new Set(completedLevelIds);
  // Prévia: mostra os desafios concluídos + um número inicial (preview) para
  // dar visibilidade da existência dos relatórios restantes sem revelar o conteúdo.
  const previewCount = Math.max(
    completedLevelIds.length + 1,
    Math.min(3, challenges.length)
  );
  const visibleSet = new Set();
  challenges.forEach((ch, idx) => {
    if (completedSet.has(ch.id) || idx < previewCount) visibleSet.add(ch.id);
  });

  let html = '';
  for (const ch of challenges.filter(item => visibleSet.has(item.id))) {
    const isUnlocked = completedSet.has(ch.id);
    const numStr = String(ch.number).padStart(2, '0');
    if (isUnlocked) {
      html += `
        <div class="evidence-card unlocked">
          <div class="evidence-card-header">
            <span class="evidence-num">EVIDÊNCIA BH-${numStr}</span>
            <span class="pill-badge" style="border-color: rgba(34,197,94,.4); color: #4ADE80; background: rgba(34,197,94,.08);">✓ DESCLASSIFICADO</span>
          </div>
          <p class="evidence-text">${escapeHtml(ch.evidence)}</p>
        </div>
      `;
    } else {
      html += `
        <div class="evidence-card locked">
          <div class="evidence-card-header">
            <span class="evidence-num">EVIDÊNCIA BH-${numStr}</span>
            <span class="pill-badge" style="border-color: rgba(239,68,68,.35); color: #FF6B7F; background: rgba(239,68,68,.07);">CLASSIFICADO</span>
          </div>
          <p class="evidence-text" style="filter: blur(4px); user-select: none;">${escapeHtml(ch.evidence)}</p>
        </div>
      `;
    }
  }
  dom.evidenceDisplay.innerHTML = html;
}

export function enableHintButton(enabled) {
  if (dom.btnHint) dom.btnHint.disabled = !enabled;
}

export function setHintButtonLoading(loading) {
  if (!dom.btnHint) return;
  if (loading) {
    dom.btnHint.textContent = 'CONSULTANDO IA FORENSE…';
    dom.btnHint.disabled = true;
  } else {
    const remaining = Math.max(0, 3 - state.hintsRevealed.length);
    dom.btnHint.textContent = remaining > 0
      ? `SOLICITAR DICA (${remaining} RESTANTES)`
      : 'LIMITE DE DICAS ATINGIDO';
  }
}

/* --- UI do Modo Bug Hunter --- */

/** Atualiza o rótulo do botão de dica para o fluxo de revelação de bugs. */
export function setHintButtonBugMode(revealedCount, maxHints) {
  if (!dom.btnHint) return;
  const remaining = Math.max(0, maxHints - revealedCount);
  dom.btnHint.textContent = remaining > 0
    ? `REVELAR BUG (${remaining} RESTANTES)`
    : 'TODOS OS BUGS REVELADOS';
}

/**
 * Renderiza as dicas (revelação progressiva dos bugs) de um desafio Bug Hunter.
 * No modo Bug Hunter as dicas expõem os bugs um a um (hintBugs do desafio).
 * @param {object} challenge dados do desafio
 * @param {object[]} revealed dicas já reveladas
 */
export function renderBugHints(challenge, revealed) {
  if (!dom.hintsDisplay) return;
  setHintChatVisible(revealed.length > 0);
  const hints = challenge.hints || challenge.hintBugs || [];
  if (revealed.length === 0) {
    dom.hintsDisplay.innerHTML = '<p class="placeholder-text">Clique em "Revelar bug" para expor um bug de cada vez — a pontuação desce a cada revelação.</p>';
    setHintButtonBugMode(0, hints.length);
    return;
  }
  let html = '';
  for (let i = 0; i < revealed.length; i++) {
    const item = revealed[i];
    const isObj = typeof item === 'object' && item !== null;
    const text = isObj ? item.text : item;
    const source = isObj ? item.source : 'local';
    const label = source === 'local' ? 'BASE LOCAL' : 'IA FORENSE';
    html += `
      <div class="hint-item">
        <strong>DICA ${i + 1} · ${escapeHtml(label)}</strong>
        <span>${escapeHtml(text)}</span>
      </div>
    `;
  }
  dom.hintsDisplay.innerHTML = html;
  setHintButtonBugMode(revealed.length, hints.length);
}

/**
 * Renderiza o feedback da validação de um desafio Bug Hunter.
 * @param {object} feedback resultado do validateBugChallenge
 */
export function renderBugFeedback(feedback) {
  let cls = 'feedback';
  let label = '';

  switch (feedback.type) {
    case 'correct':
      cls = 'feedback feedback-success';
      label = '✓ BUG CORRIGIDO.';
      break;
    case 'bug_not_fixed':
      cls = 'feedback feedback-warn';
      label = '🐛 BUG NÃO CORRIGIDO.';
      break;
    case 'wrong_result':
      cls = 'feedback feedback-warn';
      label = '✕ RESULTADO INCORRETO.';
      break;
    case 'wrong_columns':
      cls = 'feedback feedback-warn';
      label = '⚠ COLUNAS AUSENTES OU EXTRA.';
      break;
    case 'missing_concept':
      cls = 'feedback feedback-warn';
      label = '⚠ CONCEITO AUSENTE.';
      break;
    case 'sql_error':
      cls = 'feedback feedback-error';
      label = '⚠ ERRO DE SQL.';
      break;
    case 'blocked':
      cls = 'feedback feedback-error';
      label = '⛔ COMANDO BLOQUEADO.';
      break;
  }

  const container = dom.resultsContainer;
  if (container) {
    const existing = container.querySelector('.feedback');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = cls;
    div.innerHTML = `<strong style="font-family: var(--font-mono); letter-spacing: .06em;">${label}</strong> ${escapeHtml(feedback.message)}`;
    container.appendChild(div);
  }
}

/**
 * Renderiza o progresso (lista de relatórios corrigidos) do modo Bug Hunter.
 * @param {object[]} challenges todos os desafios
 * @param {string} [currentId] id do desafio ativo
 * @param {number[]} completedLevels ids concluídos
 * @param {object} [levelProgress] progresso com estrelas por desafio
 */
export function renderBugProgress(challenges, currentId, completedLevels, levelProgress = {}) {
  if (!dom.progressDisplay) return;
  let html = '<div class="progress-list">';
  for (const challenge of challenges) {
    const done = completedLevels.includes(challenge.id);
    const active = challenge.id === currentId;
    const cls = done ? 'progress-item completed' : active ? 'progress-item active' : 'progress-item';
    const icon = done ? '✅' : active ? '🔍' : '⬛';

    let starsHtml = '';
    if (done && levelProgress[challenge.id]) {
      const stars = levelProgress[challenge.id].stars;
      for (let i = 0; i < 3; i++) {
        starsHtml += i < stars ? '★' : '☆';
      }
      starsHtml = `<span class="progress-stars">${starsHtml}</span>`;
    }

    const bugTypeTag = {
      sintaxe: 'BUG · SINTAXE',
      logica: 'BUG · LÓGICA',
      performance: 'PERFORMANCE',
      'logica+performance': 'BUG + PERFORMANCE',
    }[challenge.bugType] || 'BUG SQL';

    html += `<div class="${cls}">${icon} <span class="progress-label">Relatório ${challenge.number}: ${escapeHtml(challenge.title)}</span>${starsHtml} <span class="progress-bug-tag">${escapeHtml(bugTypeTag)}</span></div>`;
  }
  html += '</div>';
  html += `<p class="progress-summary">${completedLevels.length} de ${challenges.length} relatórios corrigidos</p>`;
  dom.progressDisplay.innerHTML = html;
}

/**
 * Renderiza o rail vertical de relatórios do modo Bug Hunter.
 * @param {object[]} challenges todos os desafios
 * @param {string} currentId id do desafio ativo
 * @param {number[]} completedLevels ids concluídos
 * @param {function(string): void} [onSelect] callback ao clicar em um relatório
 */
export function renderBugRail(challenges, currentId, completedLevels, onSelect) {
  const rail = document.getElementById('rail-buttons-container');
  if (!rail) return;
  rail.innerHTML = (challenges || [])
    .map(challenge => {
      const numStr = String(challenge.number || 1).padStart(2, '0');
      const done = completedLevels.includes(challenge.id);
      const active = challenge.id === currentId;
      const cls = ['rail-btn', active ? 'active' : '', done ? 'completed' : ''].filter(Boolean).join(' ');
      const label = `Relatório ${numStr}: ${challenge.title || ''}`;
      return `<button type="button" class="${cls}" data-bug-id="${challenge.id}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${numStr}</button>`;
    })
    .join('');
  if (typeof onSelect === 'function') {
    rail.querySelectorAll('[data-bug-id]').forEach(btn => {
      btn.addEventListener('click', () => onSelect(btn.dataset.bugId));
    });
  }
}

/* --- Chat de dúvidas com a IA --- */

/**
 * Mostra ou esconde o painel de chat da aba Dicas.
 * O chat só aparece depois que o jogador revela a primeira dica.
 * @param {boolean} visible
 */
export function setHintChatVisible(visible) {
  if (!dom.hintChat) return;
  dom.hintChat.hidden = !visible;
}

/**
 * Renderiza a conversa do chat de dúvidas.
 * @param {{role: 'user'|'model', text: string}[]} messages
 * @param {object} [options]
 * @param {boolean} [options.pending] mostra o balão "consultando"
 * @param {string} [options.notice] aviso de erro exibido no fim da conversa
 */
export function renderHintChat(messages, options = {}) {
  if (!dom.hintChatLog) return;
  const list = Array.isArray(messages) ? messages : [];

  if (list.length === 0 && !options.pending && !options.notice) {
    dom.hintChatLog.innerHTML = '<p class="placeholder-text">Escreva sua dúvida sobre o desafio — a IA responde sem entregar a consulta pronta.</p>';
    return;
  }

  let html = '';
  for (const message of list) {
    const isUser = message.role === 'user';
    html += `
      <div class="chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-ai'}">
        <strong>${isUser ? 'VOCÊ' : 'IA FORENSE'}</strong>
        <span>${escapeHtml(message.text)}</span>
      </div>
    `;
  }

  if (options.pending) {
    html += `
      <div class="chat-msg chat-msg-ai chat-msg-pending">
        <strong>IA FORENSE</strong>
        <span>Consultando o canal criptografado…</span>
      </div>
    `;
  }

  if (options.notice) {
    html += `<p class="chat-notice">${escapeHtml(options.notice)}</p>`;
  }

  dom.hintChatLog.innerHTML = html;
  dom.hintChatLog.scrollTop = dom.hintChatLog.scrollHeight;
}

/**
 * Alterna o estado de envio do chat (bloqueia input e botão).
 * @param {boolean} sending
 */
export function setHintChatSending(sending) {
  if (dom.btnHintChatSend) {
    dom.btnHintChatSend.disabled = Boolean(sending);
    dom.btnHintChatSend.textContent = sending ? 'CONSULTANDO…' : 'ENVIAR';
  }
  if (dom.hintChatInput) {
    dom.hintChatInput.disabled = Boolean(sending);
  }
}

export function showHintFallbackNotice(message) {
  if (!dom.hintsDisplay) return;
  const existing = dom.hintsDisplay.querySelector('.hint-fallback-notice');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'hint-fallback-notice';
  div.style.cssText = 'font-size: .75rem; color: var(--status-warning); margin-bottom: 8px;';
  div.textContent = message;
  dom.hintsDisplay.insertBefore(div, dom.hintsDisplay.firstChild);
}

/**
 * Renderiza a pontuação total e estrelas.
 * @param {number} score pontuação total
 * @param {number} totalStars estrelas obtidas
 * @param {number} maxStars estrelas máximas possíveis
 */
export function renderScore(score, totalStars, maxStars) {
  if (dom.scoreStatus) {
    dom.scoreStatus.textContent = `${score} PTS`;
  }
  if (dom.progressDisplay) {
    const existing = dom.progressDisplay.querySelector('.score-display');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'score-display';
    div.innerHTML = `<strong>Pontuação: ${score}</strong> | Estrelas: ${totalStars}/${maxStars}`;
    dom.progressDisplay.insertBefore(div, dom.progressDisplay.firstChild);
  }
}

export function showResetConfirm(show) {
  const modal = document.getElementById('reset-modal');
  if (!modal) return;
  if (show) {
    resetReturnFocus = document.activeElement;
    modal.hidden = false;
    document.getElementById('btn-reset-cancel')?.focus();
  } else {
    modal.hidden = true;
    resetReturnFocus?.focus?.();
    resetReturnFocus = null;
  }
}

export function hideIntroScreen() {
  const intro = document.getElementById('intro-screen');
  if (intro) intro.classList.add('hidden');
}

/**
 * Mostra o modal de conclusão com estatísticas e carimbo.
 * @param {string} title
 * @param {string} storyHtml
 * @param {{score?: number, stars?: string, missions?: string}} [stats]
 */
export function showConclusionModal(title, storyHtml, stats = null) {
  const modal = document.getElementById('conclusion-modal');
  const titleEl = document.getElementById('conclusion-title');
  const bodyEl = document.getElementById('conclusion-body');
  if (titleEl) titleEl.textContent = title || 'CASO #001 · ENCERRADO';

  if (bodyEl) {
    let html = `<div>${storyHtml}</div>`;
    if (stats) {
      html += `
        <div class="conclusion-stats-grid">
          <div class="conclusion-stat-card">
            <div class="conclusion-stat-val" style="color: var(--accent-cyan);">${stats.score ?? state.score}</div>
            <div class="conclusion-stat-label">PONTUAÇÃO FINAL</div>
          </div>
          <div class="conclusion-stat-card">
            <div class="conclusion-stat-val" style="color: var(--status-warning);">${stats.stars || '36/36'}</div>
            <div class="conclusion-stat-label">ESTRELAS</div>
          </div>
          <div class="conclusion-stat-card">
            <div class="conclusion-stat-val" style="color: var(--status-success-light);">${stats.missions || '12/12'}</div>
            <div class="conclusion-stat-label">MISSÕES</div>
          </div>
        </div>
      `;
    }
    bodyEl.innerHTML = html;
  }
  if (modal) {
    conclusionReturnFocus = document.activeElement;
    modal.hidden = false;
    document.getElementById('btn-conclusion-close')?.focus();
  }
}

export function hideConclusionModal() {
  const modal = document.getElementById('conclusion-modal');
  if (modal) modal.hidden = true;
  conclusionReturnFocus?.focus?.();
  conclusionReturnFocus = null;
}

/* --- Sandbox --- */

export function renderSchemaDetailed(schema) {
  if (!dom.resultsContainer) return;
  let html = '<div class="schema-detailed">';
  for (const table of schema) {
    const objectLabel = table.objectType === 'view' ? 'VIEW' : 'TABELA';
    html += `<div style="margin-bottom: 16px;"><h4 style="font-family: var(--font-mono); color: var(--accent-cyan); margin-bottom: 6px;">${escapeHtml(table.tableName)} <small style="color: var(--text-subdued);">(${objectLabel})</small></h4>`;
    html += '<table class="results-table"><thead><tr><th>Coluna</th><th>Tipo</th><th>PK</th><th>FK</th></tr></thead><tbody>';
    for (const col of table.columns) {
      html += `<tr><td>${escapeHtml(col.name)}</td><td>${escapeHtml(col.type)}</td><td>${col.pk ? 'PK' : ''}</td><td>${col.fk ? escapeHtml(col.fk) : ''}</td></tr>`;
    }
    html += '</tbody></table></div>';
  }
  html += '</div>';
  dom.resultsContainer.innerHTML = html;
}

export function activateSandboxMode() {
  const btnSandbox = document.getElementById('btn-sandbox');
  const btnMission = document.getElementById('btn-mission');
  const btnSchema = document.getElementById('btn-schema');
  const btnNext = document.getElementById('btn-next');
  const btnHint = document.getElementById('btn-hint');
  if (btnSandbox) btnSandbox.hidden = true;
  if (btnMission) btnMission.hidden = false;
  if (btnSchema) btnSchema.hidden = false;
  if (btnNext) btnNext.hidden = true;
  if (btnHint) btnHint.disabled = true;

  if (dom.briefingContent) {
    dom.briefingContent.innerHTML = `
      <div class="sandbox-info">
        <span class="pill-badge concept-tag">LIVRE</span>
        <h2 class="mission-title">Modo Sandbox</h2>
        <p class="mission-briefing-text">Você está no modo Sandbox. Escreva queries livres para explorar e auditar o banco de dados.</p>
        <div class="mission-objective" style="margin-top: 14px;">
          <strong>AVISO</strong>
          <p>O Sandbox não concede estrelas nem altera o progresso das missões.</p>
        </div>
      </div>
    `;
  }

  setEditorValue('');
  setResults('<p class="placeholder-text">Escreva qualquer query SELECT ou WITH e clique em Executar.</p>');
  setHints('<p class="placeholder-text">As dicas ficam disponíveis apenas durante uma missão.</p>');
  setMissionStatus('Sandbox');
}

export function deactivateSandboxMode() {
  const btnSandbox = document.getElementById('btn-sandbox');
  const btnMission = document.getElementById('btn-mission');
  const btnSchema = document.getElementById('btn-schema');
  if (btnSandbox) btnSandbox.hidden = false;
  if (btnMission) btnMission.hidden = true;
  if (btnSchema) btnSchema.hidden = true;
}

/* --- Abas do Painel Investigativo (Sidebar) --- */

export function activateSidebarTab(tabName = 'lesson') {
  const tabs = Array.from(document.querySelectorAll('#sidebar-tabs-nav .sidebar-tab-btn'));
  const availableTarget = tabs.find(btn => btn.dataset.sidebarTab === tabName && !btn.hidden)
    || tabs.find(btn => btn.dataset.sidebarTab === 'lesson' && !btn.hidden)
    || tabs.find(btn => btn.dataset.sidebarTab === 'diagram' && !btn.hidden)
    || tabs.find(btn => btn.dataset.sidebarTab === 'evidence' && !btn.hidden)
    || tabs.find(btn => !btn.hidden);
  if (!availableTarget) return;

  const activeName = availableTarget.dataset.sidebarTab;
  tabs.forEach(btn => {
    const active = btn === availableTarget;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
    btn.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll('.sidebar-tab-pane').forEach(pane => {
    const active = pane.id === `sidebar-pane-${activeName}`;
    pane.classList.toggle('active', active);
    pane.hidden = !active;
  });
  if (typeof CustomEvent !== 'undefined') {
    document.dispatchEvent(new CustomEvent('sidebar-tab-activated', { detail: { tab: activeName } }));
  } else if (typeof document.dispatchEvent === 'function') {
    document.dispatchEvent({ type: 'sidebar-tab-activated', detail: { tab: activeName } });
  }
}

export function configureSidebarTabs({ graph = false, timeline = false, suspects = false, lesson = true, diagram = true, suspectsLabel = 'SUSPEITOS' } = {}) {
  const tabsNav = document.getElementById('sidebar-tabs-nav');
  if (tabsNav) tabsNav.hidden = false;
  const availability = { lesson, diagram, evidence: true, graph, timeline, suspects, hints: true };
  const tabs = Array.from(document.querySelectorAll('#sidebar-tabs-nav .sidebar-tab-btn'));
  tabs.forEach(btn => {
    const available = Boolean(availability[btn.dataset.sidebarTab]);
    btn.hidden = !available;
    btn.disabled = !available;
  });
  const suspectsTab = document.getElementById('sidebar-tab-suspects');
  if (suspectsTab) suspectsTab.textContent = suspectsLabel;
  const current = tabs.find(btn => btn.classList.contains('active') && !btn.hidden);
  activateSidebarTab(current?.dataset.sidebarTab || (availability.lesson ? 'lesson' : availability.diagram ? 'diagram' : 'evidence'));
}

export function updateLessonTabBadge(isUnread) {
  const tabBtn = document.getElementById('sidebar-tab-lesson');
  if (tabBtn) {
    tabBtn.classList.toggle('has-unread', Boolean(isUnread));
    tabBtn.setAttribute('aria-label', isUnread ? 'Aula não lida' : 'Aula lida');
  }
}

export function initSidebarTabs() {
  const tabs = Array.from(document.querySelectorAll('#sidebar-tabs-nav .sidebar-tab-btn'));
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => activateSidebarTab(btn.dataset.sidebarTab));
    btn.addEventListener('keydown', (e) => {
      const visibleTabs = tabs.filter(t => !t.hidden);
      const currentIdx = visibleTabs.indexOf(btn);
      if (currentIdx === -1) return;
      let nextTab = null;
      if (e.key === 'ArrowRight') {
        nextTab = visibleTabs[(currentIdx + 1) % visibleTabs.length];
      } else if (e.key === 'ArrowLeft') {
        nextTab = visibleTabs[(currentIdx - 1 + visibleTabs.length) % visibleTabs.length];
      }
      if (nextTab) {
        e.preventDefault();
        activateSidebarTab(nextTab.dataset.sidebarTab);
        nextTab.focus();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (e.target?.closest?.('[data-open-lesson]')) {
      activateSidebarTab('lesson');
      activatePanel('sidebar');
      const pane = document.getElementById('sidebar-pane-lesson');
      if (pane) pane.scrollTop = 0;
    }
  });

  const active = tabs.find(btn => btn.classList.contains('active') && !btn.hidden);
  activateSidebarTab(active?.dataset.sidebarTab || 'lesson');
}

export function activateLobbyTab(tabName = 'investigations') {
  const tabInv = document.getElementById('lobby-tab-inv');
  const tabProj = document.getElementById('lobby-tab-proj');
  const secInv = document.getElementById('investigation-section');
  const secProj = document.getElementById('project-section');
  const showProjects = tabName === 'projects';

  if (tabInv) {
    tabInv.classList.toggle('active', !showProjects);
    tabInv.setAttribute('aria-selected', String(!showProjects));
    tabInv.tabIndex = showProjects ? -1 : 0;
  }
  if (tabProj) {
    tabProj.classList.toggle('active', showProjects);
    tabProj.setAttribute('aria-selected', String(showProjects));
    tabProj.tabIndex = showProjects ? 0 : -1;
  }
  if (secInv) secInv.hidden = showProjects;
  if (secProj) secProj.hidden = !showProjects;
}

export function initLobbyTabs() {
  const tabInv = document.getElementById('lobby-tab-inv');
  const tabProj = document.getElementById('lobby-tab-proj');

  if (tabInv && tabProj) {
    tabInv.addEventListener('click', () => activateLobbyTab('investigations'));
    tabProj.addEventListener('click', () => activateLobbyTab('projects'));
  }
}

/* --- Tabs Mobile --- */

export function showTabs() {
  if (dom.tabsNav) dom.tabsNav.hidden = false;
}

export function hideTabs() {
  if (dom.tabsNav) dom.tabsNav.hidden = true;
}

export function activatePanel(panelName) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
    b.tabIndex = -1;
  });

  const panel = document.querySelector(`.panel-${panelName}`);
  const btn = document.querySelector(`.tab-btn[data-tab="${panelName}"]`);
  if (panel) panel.classList.add('active');
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.tabIndex = 0;
  }
}

export function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activatePanel(btn.dataset.tab);
    });
  });
}

/* --- Timeline --- */

export function renderTimeline(timelineConfig, completedLevels, order) {
  if (!dom.timelineSection || !dom.timelineDisplay) return;

  if (!timelineConfig) {
    dom.timelineSection.hidden = true;
    return;
  }
  dom.timelineSection.hidden = false;

  const unlockedEvents = timelineConfig.events
    .filter(e => completedLevels.includes(e.unlockedByMission))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  if (unlockedEvents.length === 0) {
    dom.timelineDisplay.innerHTML = '<p class="placeholder-text">Complete missões para desbloquear eventos.</p>';
    if (dom.btnTimelineCheck) dom.btnTimelineCheck.disabled = true;
    return;
  }

  const eventMap = new Map(unlockedEvents.map(e => [e.id, e]));
  let html = '';
  for (let i = 0; i < order.length; i++) {
    const event = eventMap.get(order[i]);
    if (!event) continue;
    const label = escapeHtml(event.label);
    const type = escapeHtml(event.type);
    html += `
      <div class="timeline-item" data-event-id="${escapeHtml(event.id)}">
        <span class="timeline-type timeline-type-${escapeHtml(event.type)}">${type}</span>
        <span class="timeline-label">${label}</span>
        <div class="timeline-controls">
          <button type="button" class="btn-timeline-move" data-action="up" data-index="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
          <button type="button" class="btn-timeline-move" data-action="down" data-index="${i}" ${i === order.length - 1 ? 'disabled' : ''} aria-label="Descer">↓</button>
        </div>
      </div>
    `;
  }
  dom.timelineDisplay.innerHTML = html;

  if (dom.btnTimelineCheck) {
    dom.btnTimelineCheck.disabled = unlockedEvents.length < timelineConfig.events.length
      || order.length < unlockedEvents.length;
  }
}

/* --- UI do Modo Construtor de Schema --- */

/**
 * Renderiza o briefing do desafio Construtor de Schema (exibido na aba CENÁRIO).
 * Os requisitos, a história e a checklist de tabelas esperadas são montados aqui.
 * @param {object} challenge dados do desafio
 * @param {string} currentDdl DDL atual do jogador
 * @param {number[]} completedLevels ids concluídos
 * @param {string[]} createdTables tabelas que o modelo realmente cria. Precisa vir
 *   da análise das instruções (ou do banco): procurar o nome no texto do DDL marca
 *   como "criada" uma tabela apenas citada numa FK ou num comentário.
 */
export function renderSchemaChallenge(challenge, currentDdl = '', completedLevels = [], createdTables = []) {
  if (!dom.briefingContent) return;
  const done = completedLevels.includes(challenge.id);
  const created = new Set((createdTables || []).map(name => String(name).trim().toLowerCase()));
  const expected = (challenge.expectedTables || []).map(table => {
    const found = created.has(String(table).trim().toLowerCase());
    return `  <li class="schema-check-item ${found ? 'found' : 'missing'}">${found ? '🟢' : '⚪'} ${escapeHtml(table)}${found ? ' <span class="schema-check-status">criada</span>' : ' <span class="schema-check-status">pendente</span>'}</li>`;
  }).join('');

  dom.briefingContent.innerHTML = `
    <div class="feedback feedback-info">
      <strong>Desafio ${challenge.number} · ${escapeHtml(challenge.title)}</strong><br>
      <em>Conceito: ${escapeHtml(challenge.concept)}</em>
    </div>
    <p>${escapeHtml(challenge.story)}</p>
    <div class="feedback feedback-warn"><strong>Requisitos do cliente:</strong><br>${escapeHtml(challenge.requirements)}</div>
    <p><strong>Cardinalidades esperadas:</strong> ${escapeHtml(challenge.summary)}</p>
    ${expected ? `<div class="schema-checklist"><strong>Checklist de tabelas:</strong><ul>${expected}</ul></div>` : ''}
    <p class="schema-builder-tip">Escreva um <code>CREATE TABLE</code> por execução e clique em <strong>VALIDAR MODELO</strong> — o banco acumula suas criações. Ao concluir, use <strong>REVISAR COM IA</strong> para checar a coerência do modelo.</p>
    ${done ? `<p class="feedback feedback-success">✓ Modelo validado e arquivado.</p>` : ''}
  `;
}

/**
 * Renderiza as dicas de modelagem reveladas (locais e da IA arquiteta).
 * @param {object} challenge dados do desafio
 * @param {object[]} revealed dicas já reveladas
 */
export function renderSchemaHints(challenge, revealed) {
  if (!dom.hintsDisplay) return;
  setHintChatVisible(revealed.length > 0);
  const hints = challenge.hints || [];
  if (revealed.length === 0) {
    dom.hintsDisplay.innerHTML = '<p class="placeholder-text">Use "Revelar dica" para receber orientações progressivas de modelagem — cada revelação reduz a pontuação do desafio. A IA arquiteta pode revisar seu modelo completo de uma vez.</p>';
    setHintButtonSchemaMode(0, hints.length);
    return;
  }
  let html = '';
  for (let i = 0; i < revealed.length; i++) {
    const item = revealed[i];
    const isObj = typeof item === 'object' && item !== null;
    const text = isObj ? item.text : item;
    const source = isObj ? item.source : 'local';
    const label = source === 'local' ? 'BASE LOCAL' : 'IA ARQUITETA';
    html += `
      <div class="hint-item">
        <strong>DICA ${i + 1} · ${escapeHtml(label)}</strong>
        <span>${escapeHtml(text)}</span>
      </div>
    `;
  }
  dom.hintsDisplay.innerHTML = html;
  setHintButtonSchemaMode(revealed.length, hints.length);
}

/** Atualiza o rótulo do botão de dica para o fluxo do Construtor de Schema. */
export function setHintButtonSchemaMode(revealedCount, maxHints) {
  if (!dom.btnHint) return;
  const remaining = Math.max(0, maxHints - revealedCount);
  dom.btnHint.textContent = remaining > 0
    ? `REVELAR DICA (${remaining} RESTANTES)`
    : 'TODAS AS DICAS REVELADAS';
}

/** Atualiza o rótulo e estado do botão de revisão com IA. */
export function setAiReviewButtonLoading(loading) {
  if (!dom.btnAiReview) return;
  if (loading) {
    dom.btnAiReview.textContent = 'REVISANDO…';
    dom.btnAiReview.disabled = true;
  } else {
    dom.btnAiReview.textContent = 'REVISAR COM IA';
    dom.btnAiReview.disabled = false;
  }
}

/**
 * Renderiza o feedback da validação de um desafio Construtor de Schema.
 * @param {object} feedback resultado do validateSchemaChallenge
 */
export function renderSchemaFeedback(feedback) {
  const container = document.getElementById('results-container');
  if (!container || !feedback) return;
  container.innerHTML = '';
  const div = document.createElement('div');
  const typeCls = feedback.type === 'sql_error' || feedback.type === 'blocked'
    ? 'feedback-error'
    : (feedback.type === 'correct' ? 'feedback-success' : 'feedback-warn');
  div.className = `feedback ${typeCls}`;
  div.innerHTML = `<p>${escapeHtml(feedback.message)}</p>`;
  container.appendChild(div);
}

/**
 * Renderiza as evidências do modo Construtor de Schema.
 * @param {object[]} challenges todos os desafios
 * @param {number[]} completedLevelIds ids concluídos
 */
export function renderSchemaEvidence(challenges, completedLevelIds) {
  if (!dom.evidenceDisplay) return;
  if (!challenges || challenges.length === 0) {
    dom.evidenceDisplay.innerHTML = '<p class="placeholder-text">Nenhuma evidência coletada ainda.</p>';
    return;
  }

  const completedSet = new Set(completedLevelIds);
  const previewCount = Math.max(
    completedLevelIds.length + 1,
    Math.min(3, challenges.length)
  );
  const visibleSet = new Set();
  challenges.forEach((ch, idx) => {
    if (completedSet.has(ch.id) || idx < previewCount) visibleSet.add(ch.id);
  });

  let html = '';
  for (const ch of challenges.filter(item => visibleSet.has(item.id))) {
    const isUnlocked = completedSet.has(ch.id);
    const numStr = String(ch.number).padStart(2, '0');
    if (isUnlocked) {
      html += `
        <div class="evidence-card unlocked">
          <div class="evidence-card-header">
            <span class="evidence-num">MODELO SB-${numStr}</span>
            <span class="pill-badge" style="border-color: rgba(34,197,94,.4); color: #4ADE80; background: rgba(34,197,94,.08);">✓ ARQUIVADO</span>
          </div>
          <p class="evidence-text">${escapeHtml(ch.evidence)}</p>
        </div>
      `;
    } else {
      html += `
        <div class="evidence-card locked">
          <div class="evidence-card-header">
            <span class="evidence-num">MODELO SB-${numStr}</span>
            <span class="pill-badge" style="border-color: rgba(239,68,68,.35); color: #FF6B7F; background: rgba(239,68,68,.07);">CLASSIFICADO</span>
          </div>
          <p class="evidence-text" style="filter: blur(4px); user-select: none;">${escapeHtml(ch.evidence)}</p>
        </div>
      `;
    }
  }
  dom.evidenceDisplay.innerHTML = html;
}

/**
 * Renderiza o progresso por desafio (estrelas e status).
 * @param {object[]} challenges todos os desafios
 * @param {number} currentId id do desafio ativo
 * @param {number[]} completedLevels ids concluídos
 * @param {object} [levelProgress] progresso com estrelas por desafio
 */
export function renderSchemaProgress(challenges, currentId, completedLevels, levelProgress = {}) {
  if (!dom.progressDisplay) return;
  let html = '<div class="progress-list">';
  for (const challenge of challenges) {
    const done = completedLevels.includes(challenge.id);
    const active = challenge.id === currentId;
    const cls = done ? 'progress-item completed' : active ? 'progress-item active' : 'progress-item';
    const icon = done ? '✅' : active ? '🏗️' : '⬛';

    let starsHtml = '';
    if (done && levelProgress[challenge.id]) {
      const stars = levelProgress[challenge.id].stars;
      for (let i = 0; i < 3; i++) {
        starsHtml += i < stars ? '★' : '☆';
      }
      starsHtml = `<span class="progress-stars">${starsHtml}</span>`;
    }

    html += `<div class="${cls}">${icon} <span class="progress-label">Modelo ${challenge.number}: ${escapeHtml(challenge.title)}</span>${starsHtml} <span class="progress-bug-tag">${escapeHtml(challenge.concept)}</span></div>`;
  }
  html += '</div>';
  html += `<p class="progress-summary">${completedLevels.length} de ${challenges.length} modelos concluídos</p>`;
  dom.progressDisplay.innerHTML = html;
}

/**
 * Renderiza o rail vertical de desafios do modo Construtor de Schema.
 * @param {object[]} challenges todos os desafios
 * @param {number} currentId id do desafio ativo
 * @param {number[]} completedLevels ids concluídos
 * @param {function(number): void} [onSelect] callback ao clicar em um desafio
 */
export function renderSchemaRail(challenges, currentId, completedLevels, onSelect) {
  const rail = document.getElementById('rail-buttons-container');
  if (!rail) return;
  rail.innerHTML = (challenges || [])
    .map(challenge => {
      const numStr = String(challenge.number || challenge.id).padStart(2, '0');
      const done = completedLevels.includes(challenge.id);
      const active = challenge.id === currentId;
      const cls = ['rail-btn', active ? 'active' : '', done ? 'completed' : ''].filter(Boolean).join(' ');
      const label = `Modelo ${numStr}: ${challenge.title || ''}`;
      return `<button type="button" class="${cls}" data-sb-id="${challenge.id}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${numStr}</button>`;
    })
    .join('');
  if (typeof onSelect === 'function') {
    rail.querySelectorAll('[data-sb-id]').forEach(btn => {
      btn.addEventListener('click', () => onSelect(Number(btn.dataset.sbId)));
    });
  }
}

/* --- Suspect Meter --- */

export function renderSuspectMeter(suspectsConfig, completedLevels) {
  if (!dom.suspectSection || !dom.suspectDisplay) return;

  if (!suspectsConfig) {
    dom.suspectSection.hidden = true;
    return;
  }
  dom.suspectSection.hidden = false;

  const profiles = getSuspectProfiles(suspectsConfig, completedLevels);

  if (profiles.length === 0) {
    dom.suspectDisplay.innerHTML = '<p class="placeholder-text">Nenhum suspeito identificado ainda.</p>';
    return;
  }

  let html = '';
  for (const p of profiles) {
    html += `
      <div class="suspect-item">
        <div class="suspect-item-header">
          <span class="suspect-label">${escapeHtml(p.label)}</span>
          <span class="suspect-value">${p.suspicion}%</span>
        </div>
        <div class="suspect-bar">
          <div class="suspect-bar-fill" style="width: ${p.suspicion}%;"></div>
        </div>
      </div>
    `;
  }
  dom.suspectDisplay.innerHTML = html;
}

/* --- Suspect Graph --- */

export function renderGraph(graphConfig, completedLevels, evidence, suspicion) {
  if (!dom.graphSection || !dom.graphDisplay) return;

  if (!graphConfig || !Array.isArray(graphConfig.nodes)) {
    dom.graphSection.hidden = true;
    return;
  }

  dom.graphSection.hidden = false;

  if (graphConfig.nodes.length === 0) {
    dom.graphDisplay.innerHTML = '<p class="placeholder-text">Nenhuma conexão disponível para este caso.</p>';
    return;
  }

  const svg = renderGraphSVG(graphConfig, completedLevels, evidence, suspicion, 340, 270);
  dom.graphDisplay.innerHTML = svg;
}

/* --- Interrogation Modal --- */

function formatEvidenceDate(sortKey) {
  if (!sortKey || typeof sortKey !== 'string') return '';
  const d = new Date(sortKey);
  if (isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function showInterrogationModal(finalChallenge, interrogationState, unlockedEvidences) {
  const modal = document.getElementById('interrogation-modal');
  if (!modal) return;
  if (modal.hidden) interrogationReturnFocus = document.activeElement;
  modal.hidden = false;

  const isConfrontation = finalChallenge.type === 'confrontation';
  const title = document.getElementById('interrogation-title');
  if (title) {
    title.textContent = isConfrontation ? 'CONFRONTO FINAL' : 'INTERROGATÓRIO';
  }

  const suspectName = finalChallenge.suspectName || 'Camila Torres';
  const suspectEl = document.getElementById('interrogation-suspect-name');
  if (suspectEl) {
    suspectEl.textContent = suspectName;
  }
  const avatar = document.getElementById('interrogation-avatar');
  if (avatar) {
    const initials = suspectName.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
    avatar.textContent = initials || 'CT';
  }
  const role = document.getElementById('interrogation-suspect-role');
  if (role) {
    if (finalChallenge.suspectRole) {
      role.textContent = finalChallenge.suspectRole;
      role.hidden = false;
    } else {
      role.hidden = true;
    }
  }

  const stepIndex = interrogationState.stepIndex || 0;
  const currentStep = finalChallenge.steps?.[stepIndex];
  const stepProgress = document.getElementById('interrogation-step-progress');
  if (stepProgress && Array.isArray(finalChallenge.steps)) {
    const term = isConfrontation ? 'CONTRADIÇÃO' : 'ETAPA';
    stepProgress.textContent = `${term} ${stepIndex + 1}/${finalChallenge.steps.length}`;
  }

  const stmt = document.getElementById('interrogation-statement');
  if (stmt && currentStep) {
    stmt.textContent = currentStep.statement;
  }

  const evList = document.getElementById('interrogation-evidence-list');
  if (evList) {
    const presented = interrogationState.presentedEvidenceIds || [];
    const available = (unlockedEvidences || []).filter(ev => !presented.includes(ev.id));
    let html = '';
    for (const ev of available) {
      const datePart = formatEvidenceDate(ev.sortKey);
      const label = datePart ? `${escapeHtml(ev.label)} · ${datePart}` : escapeHtml(ev.label);
      html += `<button type="button" class="btn btn-secondary interrogation-evidence-btn" data-evidence-id="${escapeHtml(ev.id)}">${label}</button>`;
    }
    evList.innerHTML = html;
  }

  const feedbackEl = document.getElementById('interrogation-feedback');
  if (feedbackEl) {
    feedbackEl.textContent = '';
    feedbackEl.style.cssText = 'margin-top: 14px;';
  }

  const btnAdvance = document.getElementById('btn-interrogation-advance');
  if (btnAdvance) {
    btnAdvance.hidden = true;
  }

  const btnClose = document.getElementById('btn-interrogation-close');
  if (btnClose) {
    btnClose.focus();
  }
}

export function showInterrogationAdvanceButton(isFinal = false) {
  const btnAdvance = document.getElementById('btn-interrogation-advance');
  if (!btnAdvance) return;
  btnAdvance.hidden = false;
  btnAdvance.textContent = isFinal ? 'CONCLUIR CASO →' : 'PRÓXIMA CONTRADIÇÃO →';
  if (typeof btnAdvance.focus === 'function') btnAdvance.focus();
}

export function hideInterrogationModal() {
  if (dom.interrogationModal) dom.interrogationModal.hidden = true;
  interrogationReturnFocus?.focus?.();
  interrogationReturnFocus = null;
}

export function setInterrogationFeedback(message, isSuccess) {
  if (!dom.interrogationFeedback) return;
  dom.interrogationFeedback.textContent = message;
  dom.interrogationFeedback.style.cssText = isSuccess
    ? 'margin-top: 14px; padding: 10px 14px; border: 1px solid rgba(34,197,94,.4); background: rgba(34,197,94,.08); color: #4ADE80; font-size: .8125rem;'
    : 'margin-top: 14px; padding: 10px 14px; border: 1px solid rgba(239,68,68,.4); background: rgba(239,68,68,.08); color: #FF6B7F; font-size: .8125rem;';
}

export function showStartInterrogationButton(show) {
  if (dom.interrogationSection) dom.interrogationSection.hidden = !show;
}

export function renderFromState() {
  setMissionStatus(state.currentLevel ? `Missão ${state.currentLevel}` : 'Missão: —');
}

/* --- Boss Fight UI --- */

/**
 * Renderiza o briefing do step ativo do Boss Fight no painel principal.
 * @param {object} battle dados da batalha
 * @param {object} step step ativo
 * @param {number} elapsedMs tempo decorrido total (ms)
 * @param {number} remaining número de steps restantes (0 na vitória)
 */
export function renderBossBriefing(battle, step, elapsedMs, remaining) {
  if (!dom.briefingContent) return;

  const isView = step.executionMode === 'create_view';
  const isMutation = step.executionMode === 'ddl';
  const modeTag = isView ? 'CRIAR VIEW' : isMutation ? 'ALTERAR BANCO' : 'CONSULTA';
  const tables = (step.tables || []).map(name => `<span class="table-tag">${escapeHtml(name)}</span>`).join(' ');

  dom.briefingContent.innerHTML = `
    <div class="boss-briefing">
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
        <span class="pill-badge boss-tag">⚔ BOSS FIGHT</span>
        <span class="pill-badge" style="border-color: rgba(244,114,182,.4); color: #F9A8D4; background: rgba(244,114,182,.08);">${escapeHtml(battle.caseTitle)}</span>
        <span class="pill-badge concept-tag">${escapeHtml(modeTag)}</span>
        <span class="pill-badge timer-pill" style="border-color: rgba(250,204,21,.45); color: #FCD34D; background: rgba(250,204,21,.08); font-variant-numeric: tabular-nums;">⏱ <span id="boss-timer-readout">${formatBossTime(elapsedMs)}</span></span>
      </div>
      <h1 class="mission-title" style="margin-bottom: 2px;">${escapeHtml(battle.title)} · <span style="color: var(--accent-cyan);">${escapeHtml(step.title)}</span></h1>
      <p class="mission-briefing-text" style="margin-top: 10px;">${escapeHtml(step.briefing)}</p>
      ${remaining > 0 ? `<p class="mission-briefing-text" style="color: var(--text-subdued); margin-top: 6px;">${remaining} etapa(s) restantes nesta batalha.</p>` : ''}
      <div class="mission-objective" style="margin-top: 14px;">
        <strong>OBJETIVO</strong>
        <p style="margin: 0;">${escapeHtml(step.objective)}</p>
      </div>
      ${tables ? `<p class="tables-list" style="margin-top: 12px;"><strong>TABELAS:</strong> ${tables}</p>` : ''}
      <div class="mission-objective" style="margin-top: 14px; background: rgba(244,114,182,.05); border-color: rgba(244,114,182,.35);">
        <strong>⚠ REGRA DO BOSS FIGHT</strong>
        <p style="margin: 0;">Sem dicas. Sem salvamento parcial. Pontuação por eficiência: bônus de tempo, penalidade por erros de SQL.</p>
      </div>
    </div>
  `;
}

/**
 * Renderiza a trilha de steps do boss no rail (seção de ações do briefing).
 * @param {object} battle
 * @param {object} step step ativo
 * @param {string[]} completedSteps ids concluídos
 */
export function renderBossRail(battle, step, completedSteps) {
  if (!dom.railContainer) return;
  const done = new Set(completedSteps || []);
  let html = '';
  for (let i = 0; i < battle.steps.length; i++) {
    const s = battle.steps[i];
    const isDone = done.has(s.id);
    const isActive = s.id === (step && step.id);
    const icon = isDone ? '✓' : isActive ? '▸' : `${i + 1}`;
    const cls = isActive ? 'rail-step active' : isDone ? 'rail-step done' : 'rail-step pending';
    const badge = isActive ? ' <span class="pill-badge" style="font-size: 8.5px; padding: 2px 6px; border-color: rgba(34,197,94,.5); color: #4ADE80;">EM CURSO</span>' : '';
    html += `<button type="button" class="btn ${cls}" data-boss-step="${escapeHtml(s.id)}" ${isActive ? '' : 'disabled style="opacity:.55; cursor: not-allowed;"'}>STEP ${i + 1}: ${escapeHtml(s.title)}${badge}</button>`;
  }
  dom.railContainer.innerHTML = `<div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">${html}</div>`;
}

/**
 * Atualiza apenas a leitura do timer (pill), sem reconstruir o briefing.
 * @param {number} elapsedMs
 */
export function updateBossTimerReadout(elapsedMs) {
  const readout = document.getElementById('boss-timer-readout');
  if (readout) readout.textContent = formatBossTime(elapsedMs);
}

/**
 * Renderiza o feedback do validador de missões no painel de resultados
 * durante a batalha de boss (mesmo contrato visual dos demais modos).
 * @param {{type: string, message: string}} feedback
 */
export function renderBossFeedback(feedback) {
  if (!dom.resultsContainer || !feedback) return;
  let cls = 'feedback';
  let label = '';

  switch (feedback.type) {
    case 'correct':
      cls = 'feedback feedback-success';
      label = '✓ CORRETO.';
      break;
    case 'wrong_result':
      cls = 'feedback feedback-warn';
      label = '✕ RESULTADO INCORRETO.';
      break;
    case 'missing_concept':
      cls = 'feedback feedback-warn';
      label = '⚠ CONCEITO AUSENTE.';
      break;
    case 'sql_error':
      cls = 'feedback feedback-error';
      label = '⚠ ERRO DE SQL.';
      break;
    case 'missing_columns':
      cls = 'feedback feedback-warn';
      label = '⚠ COLUNAS AUSENTES.';
      break;
    case 'blocked':
      cls = 'feedback feedback-error';
      label = '⛔ COMANDO BLOQUEADO.';
      break;
    default:
      cls = 'feedback feedback-warn';
      label = '⚠ RESULTADO.';
  }

  const existing = dom.resultsContainer.querySelector('.feedback');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = cls;
  div.innerHTML = `<strong style="font-family: var(--font-mono); letter-spacing: .06em;">${label}</strong> ${escapeHtml(feedback.message)}`;
  dom.resultsContainer.appendChild(div);
}

/**
 * Renderiza o painel DICAS no modo boss: aviso fixo, sem revelações.
 */
export function renderBossHintsBanner() {
  if (dom.hintsDisplay) {
    dom.hintsDisplay.innerHTML = `
      <div class="mission-objective" style="margin-top: 4px; background: rgba(244,114,182,.05); border-color: rgba(244,114,182,.35);">
        <strong>⚔ BOSS MODE</strong>
        <p style="margin: 0;">Sem reforços. Um investigador de verdade resolve sem ajuda externa.</p>
      </div>
    `;
  }
  if (dom.btnHint) {
    dom.btnHint.textContent = 'BOSS MODE — SEM DICAS';
    dom.btnHint.disabled = true;
    dom.btnHint.hidden = true;
  }
}

function formatBossTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Mostra a tela de convite para a batalha de boss ao concluir um caso.
 * @param {object} battle
 * @param {function} onStart callback ao aceitar
 * @param {function} [onSkip] callback ao dispensar
 */
export function showBossInvitation(battle, onStart, onSkip) {
  if (!dom.briefingContent) return;
  dom.briefingContent.innerHTML = `
    <div class="boss-briefing">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <span class="pill-badge boss-tag">⚔ BOSS FIGHT</span>
        <span class="pill-badge" style="border-color: rgba(250,204,21,.45); color: #FCD34D; background: rgba(250,204,21,.08);">DESBLOQUEADO</span>
      </div>
      <h1 class="mission-title">${escapeHtml(battle.title)}</h1>
      <p class="mission-briefing-text" style="margin-top: 10px;">${escapeHtml(battle.story)}</p>
      <div class="mission-objective" style="margin-top: 14px;">
        <strong>COMO FUNCIONA</strong>
        <p style="margin: 0;">${battle.steps.length} etapas encadeadas sobre o banco que você acabou de montar. Sem dicas, com cronômetro e pontuação por eficiência. É bônus: pular não bloqueia o próximo caso.</p>
      </div>
    </div>
    <div style="display: flex; gap: 10px; margin-top: 16px;">
      <button type="button" id="btn-boss-start" class="btn btn-primary" style="flex: 1;">INICIAR BOSS FIGHT</button>
      <button type="button" id="btn-boss-skip" class="btn btn-secondary">PULAR (BÔNUS)</button>
    </div>
  `;
  const btnStart = document.getElementById('btn-boss-start');
  const btnSkip = document.getElementById('btn-boss-skip');
  if (btnStart) btnStart.addEventListener('click', onStart);
  if (btnSkip && onSkip) btnSkip.addEventListener('click', onSkip);
}

/**
 * Modal de vitória do Boss Fight com estatísticas de eficiência.
 * @param {object} battle
 * @param {{elapsedMs: number, attempts: number, sqlErrors: number, score: number, stars: number}} stats
 */
export function showBossVictoryModal(battle, stats) {
  let modal = document.getElementById('boss-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'boss-modal';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'boss-modal-title');
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 480px; border-color: var(--accent-purple);">
        <h2 id="boss-modal-title" class="modal-title"></h2>
        <div id="boss-modal-body"></div>
        <div class="modal-actions" style="margin-top: 16px; display: flex; justify-content: flex-end;">
          <button type="button" id="btn-boss-victory-ok" class="btn btn-success">VITÓRIA! ✅</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  const titleEl = document.getElementById('boss-modal-title');
  const bodyEl = document.getElementById('boss-modal-body');

  if (titleEl) titleEl.textContent = battle.title;
  if (bodyEl) {
    const starsHtml = '★'.repeat(stats.stars) + '☆'.repeat(3 - stats.stars);
    const m = Math.floor(stats.elapsedMs / 60000);
    const s = Math.floor((stats.elapsedMs % 60000) / 1000);
    const accuracy = stats.attempts > 0
      ? Math.round((1 - stats.sqlErrors / stats.attempts) * 100)
      : 100;
    bodyEl.innerHTML = `
      <div style="margin-bottom: 12px;">${escapeHtml(battle.conclusion)}</div>
      <div class="conclusion-stats-grid">
        <div class="conclusion-stat-card">
          <div class="conclusion-stat-val" style="color: var(--accent-cyan);">${stats.score}</div>
          <div class="conclusion-stat-label">PONTOS DE EFICIÊNCIA</div>
        </div>
        <div class="conclusion-stat-card">
          <div class="conclusion-stat-val" style="color: var(--status-warning);">${starsHtml}</div>
          <div class="conclusion-stat-label">PRECISÃO</div>
        </div>
        <div class="conclusion-stat-card">
          <div class="conclusion-stat-val" style="color: var(--status-success-light);">${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</div>
          <div class="conclusion-stat-label">TEMPO TOTAL</div>
        </div>
        <div class="conclusion-stat-card">
          <div class="conclusion-stat-val" style="color: #F9A8D4;">${accuracy}%</div>
          <div class="conclusion-stat-label">TAXA DE ACERTO</div>
        </div>
      </div>
    `;
  }
  modal.hidden = false;

  // Fecha o modal ao clicar no botão de confirmação, no overlay ou na tecla Escape.
  const btnOk = document.getElementById('btn-boss-victory-ok');
  if (btnOk) btnOk.addEventListener('click', hideBossVictoryModal, { once: true });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideBossVictoryModal();
  }, { once: true });
  const onEscape = (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      hideBossVictoryModal();
      document.removeEventListener('keydown', onEscape);
    }
  };
  document.addEventListener('keydown', onEscape);
}

export function hideBossVictoryModal() {
  const modal = document.getElementById('boss-modal');
  if (modal) modal.hidden = true;
}
