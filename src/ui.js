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
  btnNext: null,
  resultsContainer: null,
  progressDisplay: null,
  hintsDisplay: null,
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
  dom.briefingContent = $('#briefing-content');
  dom.schemaContent = $('#schema-content');
  dom.sqlEditor = $('#sql-editor');
  dom.btnRun = $('#btn-run');
  dom.btnClear = $('#btn-clear');
  dom.btnHint = $('#btn-hint');
  dom.btnNext = $('#btn-next');
  dom.resultsContainer = $('#results-container');
  dom.progressDisplay = $('#progress-display');
  dom.hintsDisplay = $('#hints-display');
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
    const label = source === 'ollama' ? 'IA FORENSE' : 'BASE LOCAL';
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
}

export function configureSidebarTabs({ graph = false, timeline = false, suspects = false, lesson = true } = {}) {
  const availability = { lesson, evidence: true, graph, timeline, suspects, hints: true };
  const tabs = Array.from(document.querySelectorAll('#sidebar-tabs-nav .sidebar-tab-btn'));
  tabs.forEach(btn => {
    const available = Boolean(availability[btn.dataset.sidebarTab]);
    btn.hidden = !available;
    btn.disabled = !available;
  });
  const current = tabs.find(btn => btn.classList.contains('active') && !btn.hidden);
  activateSidebarTab(current?.dataset.sidebarTab || (availability.lesson ? 'lesson' : 'evidence'));
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

export function showInterrogationModal(finalChallenge, interrogationState, unlockedEvidences) {
  if (!dom.interrogationModal) return;
  if (dom.interrogationModal.hidden) interrogationReturnFocus = document.activeElement;
  dom.interrogationModal.hidden = false;

  if (dom.interrogationSuspectName) {
    dom.interrogationSuspectName.textContent = finalChallenge.suspectName || 'Camila Torres';
  }

  const stepIndex = interrogationState.stepIndex;
  const currentStep = finalChallenge.steps[stepIndex];

  if (dom.interrogationStatement && currentStep) {
    dom.interrogationStatement.textContent = currentStep.statement;
  }

  if (dom.interrogationEvidenceList) {
    let html = '';
    for (const ev of unlockedEvidences) {
      html += `<button type="button" class="btn btn-secondary interrogation-evidence-btn" data-evidence-id="${escapeHtml(ev.id)}">${escapeHtml(ev.label)}</button>`;
    }
    dom.interrogationEvidenceList.innerHTML = html;
  }

  if (dom.interrogationFeedback) {
    dom.interrogationFeedback.textContent = '';
    dom.interrogationFeedback.style.cssText = 'margin-top: 14px;';
  }

  if (dom.btnInterrogationClose) {
    dom.btnInterrogationClose.focus();
  }
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
