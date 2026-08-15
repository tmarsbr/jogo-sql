/**
 * ui.js — Módulo de renderização e eventos da interface.
 *
 * Fase 4: renderização de missões, dicas, feedback, progresso e evidências.
 */

import { state } from './state.js';
import { getSuspectProfiles } from './suspect-meter.js';
import { renderGraphSVG, buildGraphState } from './suspect-graph.js';

/* --- Referências de DOM (cache) --- */
const $ = (sel) => document.querySelector(sel);

const dom = {
  loading: null,
  errorBanner: null,
  errorMsg: null,
  errorRetry: null,
  dbStatus: null,
  missionStatus: null,
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
  if (status === 'ok')      dom.dbStatus.classList.add('status-ok');
  else if (status === 'pending') dom.dbStatus.classList.add('status-pending');
  else if (status === 'error')   dom.dbStatus.classList.add('status-error');
  dom.dbStatus.textContent = label || 'Banco: —';
}

/* --- Status da missão --- */

export function setMissionStatus(label) {
  if (dom.missionStatus) dom.missionStatus.textContent = label || 'Missão: —';
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
    // Tabela com rolagem horizontal
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
    dom.resultsContainer.innerHTML = `<p class="result-empty">${escapeHtml(result.message)}</p>`;
  } else if (result.type === 'blocked') {
    dom.resultsContainer.innerHTML = `<div class="result-error">${escapeHtml(result.message)}</div>`;
  } else {
    // error
    dom.resultsContainer.innerHTML = `<div class="result-error">${escapeHtml(result.message)}</div>`;
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

/* --- Renderização de missão (Fase 4) --- */

/**
 * Renderiza o briefing de uma missão no painel esquerdo.
 * @param {object} level dados da missão
 * @param {CourseItem[]} [courseItems] itens de conteúdo do curso relacionados
 */
export function renderMission(level, courseItems) {
  if (!dom.briefingContent) return;
  let html = `
    <div class="mission-briefing">
      <h3 class="mission-title">${escapeHtml(level.title)}</h3>
      <p class="mission-concept"><strong>Conceito:</strong> <code>${escapeHtml(level.concept)}</code></p>
      <p class="mission-briefing-text">${escapeHtml(level.briefing)}</p>
      <div class="mission-objective">
        <strong>Objetivo:</strong>
        <p>${escapeHtml(level.objective)}</p>
      </div>
      <div class="mission-tables">
        <strong>Tabelas:</strong>
        <code>${level.tables.map(escapeHtml).join(', ')}</code>
      </div>
  `;

  if (courseItems && courseItems.length > 0) {
    html += '<div class="course-refs">';
    html += '<strong>Conteúdo do curso:</strong>';
    for (const item of courseItems) {
      html += `<div class="course-ref-item">`;
      html += `<details class="course-ref-details">`;
      html += `<summary>${escapeHtml(item.concept)}</summary>`;
      html += `<p class="course-ref-explanation">${escapeHtml(item.explanation)}</p>`;
      if (item.syntaxExample) {
        html += `<pre class="course-ref-syntax">${escapeHtml(item.syntaxExample)}</pre>`;
      }
      if (item.commonMistake) {
        html += `<p class="course-ref-mistake"><strong>Erro comum:</strong> ${escapeHtml(item.commonMistake)}</p>`;
      }
      html += `</details>`;
      html += `</div>`;
    }
    html += '</div>';
  }

  html += '</div>';
  dom.briefingContent.innerHTML = html;
}

/**
 * Renderiza feedback específico após validar uma query.
 * @param {object} feedback resultado do validateLevel
 */
export function renderFeedback(feedback) {
  // Feedback aparece abaixo dos resultados
  let cls = 'feedback';
  let icon = '';
  let label = '';

  switch (feedback.type) {
    case 'correct':
      cls = 'feedback feedback-success';
      icon = '\u2705';
      label = 'Correto!';
      break;
    case 'wrong_result':
      cls = 'feedback feedback-warn';
      icon = '\u274C';
      label = 'Resultado incorreto';
      break;
    case 'missing_concept':
      cls = 'feedback feedback-warn';
      icon = '\u26A0\uFE0F';
      label = 'Conceito ausente';
      break;
    case 'sql_error':
      cls = 'feedback feedback-error';
      icon = '\u26A0\uFE0F';
      label = 'Erro de SQL';
      break;
    case 'missing_columns':
      cls = 'feedback feedback-warn';
      icon = '\u26A0\uFE0F';
      label = 'Colunas ausentes';
      break;
    case 'blocked':
      cls = 'feedback feedback-error';
      icon = '\u26D4';
      label = 'Comando bloqueado';
      break;
  }

  // Adiciona mensagem de feedback abaixo dos resultados
  const container = dom.resultsContainer;
  if (container) {
    const existing = container.querySelector('.feedback');
    if (existing) existing.remove();

    // O executor já renderiza o erro SQL. Atualiza o mesmo bloco para não
    // repetir a mensagem em um segundo cartão de feedback.
    if (feedback.type === 'sql_error') {
      const existingError = container.querySelector('.result-error');
      if (existingError) {
        existingError.textContent = `${icon} ${label} ${feedback.message}`;
        return;
      }
    }

    const div = document.createElement('div');
    div.className = cls;
    div.innerHTML = `<strong>${icon} ${label}</strong> ${escapeHtml(feedback.message)}`;
    container.appendChild(div);
  }
}

/**
 * Renderiza as dicas reveladas.
 * Aceita strings (compatibilidade) ou objetos { source: 'ollama'|'local', text: string }.
 * Todo texto é escapado — nunca inserido como HTML.
 * @param {object} level dados da missão
 * @param {(string|{source: string, text: string})[]} revealed dicas já reveladas
 */
export function renderHints(level, revealed) {
  if (!dom.hintsDisplay) return;
  if (revealed.length === 0) {
    dom.hintsDisplay.innerHTML = '<p class="placeholder-text">Clique em "Pedir dica" se precisar de ajuda.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < revealed.length; i++) {
    const item = revealed[i];
    const isObj = typeof item === 'object' && item !== null;
    const text = isObj ? item.text : item;
    const source = isObj ? item.source : 'local';
    const label = source === 'ollama' ? 'Dica IA' : 'Dica local';
    const cls = source === 'ollama' ? 'hint-item hint-ai' : 'hint-item hint-local';
    html += `<div class="${cls}"><strong>Dica ${i + 1}</strong> <span class="hint-source">${escapeHtml(label)}</span> ${escapeHtml(text)}</div>`;
  }
  dom.hintsDisplay.innerHTML = html;
}

/**
 * Renderiza o progresso do jogador.
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
    const icon = done ? '\u2705' : '\u2B1B';

    // Estrelas
    let starsHtml = '';
    if (done && levelProgress[level.id]) {
      const stars = levelProgress[level.id].stars;
      for (let i = 0; i < 3; i++) {
        starsHtml += i < stars ? '\u2605' : '\u2606';
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
 * Renderiza as evidências coletadas.
 * @param {string[]} evidence lista de evidências
 */
export function renderEvidence(evidence) {
  if (!dom.evidenceDisplay) return;
  if (!evidence || evidence.length === 0) {
    dom.evidenceDisplay.innerHTML = '<p class="placeholder-text">Nenhuma evidência coletada ainda.</p>';
    return;
  }
  let html = '';
  for (let i = 0; i < evidence.length; i++) {
    html += `<div class="evidence-item"><span class="evidence-icon">\u{1F50E}</span> ${escapeHtml(evidence[i])}</div>`;
  }
  dom.evidenceDisplay.innerHTML = html;
}

/**
 * Habilita/desabilita o botão de dica.
 * @param {boolean} enabled
 */
export function enableHintButton(enabled) {
  if (dom.btnHint) dom.btnHint.disabled = !enabled;
}

/**
 * Define o texto do botão de dica e se mostra estado de carregamento.
 * @param {boolean} loading se true, mostra "Gerando dica…"
 */
export function setHintButtonLoading(loading) {
  if (!dom.btnHint) return;
  if (loading) {
    dom.btnHint.textContent = 'Gerando dica…';
    dom.btnHint.disabled = true;
  } else {
    dom.btnHint.textContent = 'Pedir dica';
  }
}

/**
 * Mostra um aviso não intrusivo de contingência (dica local).
 * @param {string} message
 */
export function showHintFallbackNotice(message) {
  if (!dom.hintsDisplay) return;
  const existing = dom.hintsDisplay.querySelector('.hint-fallback-notice');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'hint-fallback-notice';
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
  // Atualiza o status da missão para incluir score
  // Ou usa um elemento separado — vamos injetar no progressDisplay
  if (dom.progressDisplay) {
    const existing = dom.progressDisplay.querySelector('.score-display');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'score-display';
    div.innerHTML = `<strong>Pontuação: ${score}</strong> | Estrelas: ${totalStars}/${maxStars}`;
    dom.progressDisplay.insertBefore(div, dom.progressDisplay.firstChild);
  }
}

/**
 * Mostra/oculta o diálogo de confirmação de reiniciar progresso.
 * @param {boolean} show
 */
export function showResetConfirm(show) {
  const modal = document.getElementById('reset-modal');
  if (modal) modal.hidden = !show;
}

/**
 * Esconde a tela inicial.
 */
export function hideIntroScreen() {
  const intro = document.getElementById('intro-screen');
  if (intro) intro.classList.add('hidden');
}

/**
 * Mostra o modal de conclusão do MVP.
 * @param {string} title
 * @param {string} bodyHtml
 */
export function showConclusionModal(title, bodyHtml) {
  const modal = document.getElementById('conclusion-modal');
  const titleEl = document.getElementById('conclusion-title');
  const bodyEl = document.getElementById('conclusion-body');
  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = bodyHtml;
  if (modal) modal.hidden = false;
}

/**
 * Esconde o modal de conclusão.
 */
export function hideConclusionModal() {
  const modal = document.getElementById('conclusion-modal');
  if (modal) modal.hidden = true;
}

/* --- Sandbox (Fase 7) --- */

/**
 * Renderiza o esquema detalhado das tabelas no painel de resultados.
 * @param {{tableName: string, objectType?: 'table'|'view', columns: {name: string, type: string, pk: boolean, fk: string|null}[]}[]} schema
 */
export function renderSchemaDetailed(schema) {
  if (!dom.resultsContainer) return;
  let html = '<div class="schema-detailed">';
  for (const table of schema) {
    const objectLabel = table.objectType === 'view' ? 'VIEW' : 'TABELA';
    html += `<div class="schema-table"><h4>${escapeHtml(table.tableName)} <small>${objectLabel}</small></h4>`;
    html += '<table class="results-table"><thead><tr><th>Coluna</th><th>Tipo</th><th>PK</th><th>FK</th></tr></thead><tbody>';
    for (const col of table.columns) {
      html += `<tr><td>${escapeHtml(col.name)}</td><td>${escapeHtml(col.type)}</td><td>${col.pk ? '\u2705' : ''}</td><td>${col.fk ? escapeHtml(col.fk) : ''}</td></tr>`;
    }
    html += '</tbody></table></div>';
  }
  html += '</div>';
  dom.resultsContainer.innerHTML = html;
}

/**
 * Ativa o modo Sandbox na UI.
 */
export function activateSandboxMode() {
  // Esconde botões de missão, mostra botões de sandbox
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

  // Limpa briefing e mostra aviso de sandbox
  if (dom.briefingContent) {
    dom.briefingContent.innerHTML = `
      <div class="sandbox-info">
        <h3 class="mission-title">Modo Sandbox</h3>
        <p class="mission-briefing-text">Você está no modo Sandbox. Escreva queries livres para explorar o banco de dados.</p>
        <div class="mission-objective">
          <strong>Aviso:</strong>
          <p>O Sandbox não concede estrelas nem altera o progresso das missões.</p>
        </div>
        <p class="mission-briefing-text">Clique em "Mostrar esquema" para ver tabelas, colunas e tipos.</p>
      </div>
    `;
  }

  // Limpa editor e resultados
  setEditorValue('');
  setResults('<p class="placeholder-text">Escreva qualquer query SELECT ou WITH e clique em Executar.</p>');
  setMissionStatus('Sandbox');
  if (dom.hintsDisplay) dom.hintsDisplay.innerHTML = '<p class="placeholder-text">Dicas não disponíveis no Sandbox.</p>';
}

/**
 * Volta ao modo Missão na UI.
 */
export function deactivateSandboxMode() {
  const btnSandbox = document.getElementById('btn-sandbox');
  const btnMission = document.getElementById('btn-mission');
  const btnSchema = document.getElementById('btn-schema');
  if (btnSandbox) btnSandbox.hidden = false;
  if (btnMission) btnMission.hidden = true;
  if (btnSchema) btnSchema.hidden = true;
}

/* --- Tabs (mobile) --- */

export function showTabs() {
  if (dom.tabsNav) dom.tabsNav.hidden = false;
}

export function activatePanel(panelName) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const panel = document.querySelector(`.panel-${panelName}`);
  const btn = document.querySelector(`.tab-btn[data-tab="${panelName}"]`);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
}

/**
 * Registra os event listeners dos tabs (mobile).
 */
export function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activatePanel(btn.dataset.tab);
    });
  });
}

/* --- Timeline --- */

/**
 * Renderiza a linha do tempo com botões subir/descer.
 * @param {object} timelineConfig config da timeline
 * @param {number[]} completedLevels missões concluídas
 * @param {string[]} order ordem atual
 */
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
    html += `<div class="timeline-item" data-event-id="${escapeHtml(event.id)}">`;
    html += `<span class="timeline-type timeline-type-${escapeHtml(event.type)}">${type}</span>`;
    html += `<span class="timeline-label">${label}</span>`;
    html += `<div class="timeline-controls">`;
    html += `<button type="button" class="btn-timeline-move" data-action="up" data-index="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Mover para cima">↑</button>`;
    html += `<button type="button" class="btn-timeline-move" data-action="down" data-index="${i}" ${i === order.length - 1 ? 'disabled' : ''} aria-label="Mover para baixo">↓</button>`;
    html += `</div></div>`;
  }
  dom.timelineDisplay.innerHTML = html;

  if (dom.btnTimelineCheck) {
    dom.btnTimelineCheck.disabled = order.length < unlockedEvents.length;
  }
}

/* --- Suspect meter --- */

/**
 * Renderiza o medidor de suspeita.
 * @param {object} suspectsConfig
 * @param {number[]} completedLevels
 */
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
    html += `<div class="suspect-item">`;
    html += `<span class="suspect-label">${escapeHtml(p.label)}</span>`;
    html += `<div class="suspect-bar"><div class="suspect-bar-fill" style="width: ${p.suspicion}%"></div></div>`;
    html += `<span class="suspect-value">${p.suspicion}%</span>`;
    html += `</div>`;
  }
  dom.suspectDisplay.innerHTML = html;
}

/* --- Suspect Graph Visualizer --- */

/**
 * Renderiza o grafo investigativo no painel lateral.
 * @param {object} graphConfig configuração de nós e arestas
 * @param {number[]} completedLevels missões concluídas
 * @param {string[]} evidence evidências desbloqueadas
 * @param {number} suspicion valor 0-100 do medidor de suspeita
 */
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

  const svg = renderGraphSVG(graphConfig, completedLevels, evidence, suspicion, 300, 220);
  dom.graphDisplay.innerHTML = svg;
}

/* --- Interrogation modal --- */

/**
 * Abre o modal de interrogatório.
 * @param {object} finalChallenge config do desafio final
 * @param {object} interrogationState estado atual
 * @param {object[]} unlockedEvidences eventos desbloqueados
 */
export function showInterrogationModal(finalChallenge, interrogationState, unlockedEvidences) {
  if (!dom.interrogationModal) return;
  dom.interrogationModal.hidden = false;

  if (dom.interrogationSuspectName) {
    dom.interrogationSuspectName.textContent = finalChallenge.suspectName || '';
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
  }

  // Foco inicial
  if (dom.btnInterrogationClose) {
    dom.btnInterrogationClose.focus();
  }
}

/**
 * Fecha o modal de interrogatório.
 */
export function hideInterrogationModal() {
  if (dom.interrogationModal) dom.interrogationModal.hidden = true;
}

/**
 * Mostra feedback no modal de interrogatório.
 * @param {string} message
 * @param {boolean} isSuccess
 */
export function setInterrogationFeedback(message, isSuccess) {
  if (!dom.interrogationFeedback) return;
  dom.interrogationFeedback.textContent = message;
  dom.interrogationFeedback.className = 'interrogation-feedback' + (isSuccess ? ' feedback-success' : ' feedback-error');
}

/**
 * Mostra ou esconde o botão de iniciar interrogatório.
 * @param {boolean} show
 */
export function showStartInterrogationButton(show) {
  if (dom.interrogationSection) dom.interrogationSection.hidden = !show;
}

/**
 * Atualiza a UI com base no estado atual.
 */
export function renderFromState() {
  setMissionStatus(state.currentLevel ? `Missão ${state.currentLevel}` : 'Missão: —');
}
