/**
 * app.js — Ponto de entrada do SQL Detective (Cyber Forensics).
 */

import { state, activateCaseProgress, syncActiveCaseProgress, createCaseProgress } from './state.js';
import { initDB, getSchemaText, getDB, getSchemaDetailed } from './db.js';
import { executeQuery } from './executor.js';
import { getCaseById, isCaseAvailable, isCaseComplete, getInvestigations, getProjects } from './case-manager.js';
import { validateLevel, FEEDBACK_CORRECT } from './validator.js';
import { calculateStars, calculateTotalScore, calculateTotalStars, calculateMaxStars, updateLevelProgress } from './scoring.js';
import { saveState, loadState } from './storage.js';
import {
  initDOM,
  hideLoading,
  showGlobalError,
  hideGlobalError,
  setDbStatus,
  setMissionStatus,
  setSchema,
  setResults,
  renderResults,
  getEditorValue,
  setEditorValue,
  clearEditor,
  enableEditorButtons,
  setHints,
  showTabs,
  hideTabs,
  initTabs,
  activatePanel,
  renderFromState,
  renderMission,
  renderFeedback,
  renderHints,
  renderProgress,
  renderEvidence,
  enableHintButton,
  setHintButtonLoading,
  showHintFallbackNotice,
  renderScore,
  showResetConfirm,
  hideIntroScreen,
  showConclusionModal,
  hideConclusionModal,
  renderSchemaDetailed,
  activateSandboxMode,
  deactivateSandboxMode,
  renderTimeline,
  renderSuspectMeter,
  showInterrogationModal,
  hideInterrogationModal,
  setInterrogationFeedback,
  showStartInterrogationButton,
  escapeHtml,
  renderGraph,
  renderMissionRail,
  initSidebarTabs,
  activateSidebarTab,
  configureSidebarTabs,
  updateLessonTabBadge,
  setLesson,
  initLobbyTabs,
  activateLobbyTab,
  setHeaderCaseInfo,
  renderHeaderProgress,
} from './ui.js';
import { renderLessonHtml } from './lesson.js';
import { renderERDiagram } from './er-diagram.js';
import { getCourseContentById } from './course-content.js';
import { buildHintContext, requestAiHint } from './ai-hints.js';
import { getUnlockedEvents, normalizeOrder, moveEvent, checkTimelineBonus } from './timeline.js';
import { showCertificateModal } from './certificate.js';
import { deriveSuspicion } from './suspect-meter.js';
import { startInterrogation, presentEvidence } from './interrogation.js';
import { initSfx, setSfxEnabled, isSfxEnabled, playTypingSound, playAlertSound, playSuccessSound } from './sfx.js';

function getActiveCase() {
  return getCaseById(state.currentCase) || getCaseById('case001');
}

function getLockedMissionIds(caseDefinition, completedLevels = state.completedLevels) {
  if (!caseDefinition?.SEQUENTIAL_MISSIONS) return [];
  const completed = new Set(completedLevels);
  const firstIncompleteIndex = caseDefinition.LEVELS.findIndex(level => !completed.has(level.id));
  if (firstIncompleteIndex < 0) return [];
  return caseDefinition.LEVELS
    .slice(firstIncompleteIndex + 1)
    .filter(level => !completed.has(level.id))
    .map(level => level.id);
}

function getCourseItemsForLevel(level) {
  return level?.courseRefs
    ? level.courseRefs.map(ref => getCourseContentById(ref)).filter(Boolean)
    : [];
}

/** Exibe uma aula principal ou uma revisão completa sem trocar de missão. */
function showCourseLesson(courseId) {
  const activeCase = getActiveCase();
  const level = activeCase?.getLevel(state.currentLevel);
  const courseItems = getCourseItemsForLevel(level);
  const selected = courseItems.find(item => item.id === courseId);
  if (!selected) return false;

  const orderedItems = [selected, ...courseItems.filter(item => item.id !== courseId)];
  setLesson(renderLessonHtml(orderedItems, level));
  updateLessonTabBadge(!state.lessonsRead.includes(selected.id));
  activateSidebarTab('lesson');
  activatePanel('sidebar');
  const pane = document.getElementById('sidebar-pane-lesson');
  if (pane) pane.scrollTop = 0;
  return true;
}

function configureIntro(caseDefinition) {
  const intro = caseDefinition.CASE_INTRO;
  const isProject = caseDefinition.type === 'project';
  const scenarioTag = isProject ? `PROJETO #${caseDefinition.number}` : `CASO #${caseDefinition.number}`;

  const title = document.querySelector('.intro-subtitle');
  const story = document.querySelector('.intro-story');
  const mission = document.querySelector('.intro-mission');
  const btnStart = document.getElementById('btn-start');
  const briefingTitle = document.getElementById('briefing-panel-title');
  const editorTitle = document.getElementById('editor-panel-title');
  const briefingTab = document.getElementById('briefing-tab-label');
  const erDescription = document.getElementById('er-description');
  const erModalTitle = document.getElementById('er-modal-title');

  const dossierCase = document.getElementById('dossier-header-case');
  const dossierBadge = document.getElementById('dossier-header-badge');
  const dossierEmpresa = document.getElementById('dossier-meta-empresa');
  const dossierEmpresaLabel = document.getElementById('dossier-meta-empresa-label');
  const dossierJanela = document.getElementById('dossier-meta-janela');
  const dossierJanelaLabel = document.getElementById('dossier-meta-janela-label');
  const dossierClassificacao = document.getElementById('dossier-meta-classificacao');
  const dossierMissoes = document.getElementById('dossier-meta-missoes');
  const conclusionStamp = document.getElementById('conclusion-stamp');
  const conclusionHeading = document.getElementById('conclusion-heading');
  const conclusionClose = document.getElementById('btn-conclusion-close');
  const resetDescription = document.getElementById('reset-modal-description');

  document.title = `${caseDefinition.title} — SQL Detective`;

  if (title) title.textContent = intro.title;
  if (story) {
    story.innerHTML = intro.story.split('\n').filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`).join('');
  }
  if (mission) mission.textContent = `RESOLVA AS ${caseDefinition.getTotalLevels()} MISSÕES PARA CONCLUIR A ${isProject ? 'ANÁLISE' : 'INVESTIGAÇÃO'}`;
  if (btnStart) btnStart.textContent = isProject ? 'INICIAR PROJETO →' : 'ABRIR INQUÉRITO →';
  if (briefingTitle) briefingTitle.textContent = isProject ? 'PROJETO' : 'INQUÉRITO';
  if (editorTitle) editorTitle.textContent = isProject ? 'ANÁLISE SQL' : 'CONSOLE FORENSE';
  if (briefingTab) briefingTab.textContent = isProject ? 'Projeto' : 'Cenário';
  if (erDescription) {
    erDescription.textContent = `Tabelas, colunas e relações do banco de dados ${isProject ? 'do projeto' : 'da investigação'}.`;
  }
  if (erModalTitle) {
    erModalTitle.textContent = `DIAGRAMA ER · ${scenarioTag}`;
  }

  if (dossierCase) {
    dossierCase.textContent = `${scenarioTag} · ${caseDefinition.category?.toUpperCase() || 'FINANCEIRO'}`;
  }
  if (dossierBadge) {
    if (isProject) {
      dossierBadge.textContent = '📊 ANALYTICS';
      dossierBadge.className = 'pill-badge concept-tag';
    } else {
      dossierBadge.textContent = '🚨 CONFIDENCIAL';
      dossierBadge.className = 'pill-badge confidential';
    }
  }
  const investigationContexts = {
    case001: { context: 'TechFin S.A.', period: 'MAR/2024' },
    case002: { context: 'MATRIZ CORPORATIVA', period: 'INCIDENTE ATIVO' },
    case003: { context: 'REDE CRIPTO', period: 'JANELA DE 72H' },
    case004: { context: 'TechStore', period: 'BLACK FRIDAY' },
  };
  const dossierContext = investigationContexts[caseDefinition.id];
  if (dossierEmpresaLabel) dossierEmpresaLabel.textContent = isProject ? 'DOMÍNIO' : 'CONTEXTO';
  if (dossierEmpresa) dossierEmpresa.textContent = isProject
    ? (caseDefinition.category?.toUpperCase() || 'ANÁLISE DE DADOS')
    : (dossierContext?.context || caseDefinition.title);
  if (dossierJanelaLabel) dossierJanelaLabel.textContent = isProject ? 'MODALIDADE' : 'JANELA';
  if (dossierJanela) dossierJanela.textContent = isProject
    ? 'PROJETO ANALÍTICO'
    : (dossierContext?.period || 'DOSSIÊ ATIVO');
  if (dossierClassificacao) {
    dossierClassificacao.textContent = caseDefinition.category?.toUpperCase() || (isProject ? 'ANALYTICS' : 'FRAUDE FINANCEIRA');
    dossierClassificacao.style.color = isProject ? 'var(--accent-purple-light)' : 'var(--status-danger-light)';
  }
  if (dossierMissoes) {
    dossierMissoes.textContent = `${caseDefinition.getTotalLevels()} CONSULTAS SQL`;
  }
  if (conclusionStamp) conclusionStamp.textContent = isProject ? 'PROJETO CONCLUÍDO' : 'INQUÉRITO ARQUIVADO';
  if (conclusionHeading) conclusionHeading.textContent = isProject ? 'Análise Concluída' : 'Investigação Concluída';
  if (conclusionClose) conclusionClose.textContent = isProject ? 'VOLTAR AOS PROJETOS →' : 'PRÓXIMO CASO →';
  if (resetDescription) {
    resetDescription.textContent = `Todo o seu progresso (estrelas, pontuação e evidências) deste ${isProject ? 'projeto' : 'caso'} será apagado. Os demais cenários serão preservados. Esta ação não pode ser desfeita.`;
  }

  setHeaderCaseInfo(scenarioTag, !isProject);
}

/**
 * Exibe a Etapa 0 com o desenho do banco e os checkpoints conceituais do caso.
 */
function showDatabaseAnalysis(caseDefinition = getActiveCase()) {
  const analysis = caseDefinition?.DATABASE_ANALYSIS;
  const screen = document.getElementById('database-analysis-screen');
  if (!analysis || !screen) return false;

  const title = document.getElementById('database-analysis-title');
  const summary = document.getElementById('database-analysis-summary');
  const entities = document.getElementById('database-analysis-entities');
  const decisions = document.getElementById('database-analysis-decisions');
  const checkpoints = document.getElementById('database-analysis-checkpoints');

  if (title) title.textContent = analysis.title;
  if (summary) summary.textContent = analysis.summary;

  if (entities) {
    entities.innerHTML = (analysis.entities || []).map(entity => {
      const relations = (entity.relations || []).length > 0
        ? `<ul class="database-analysis-relations">${entity.relations.map(relation => `<li>${escapeHtml(relation)}</li>`).join('')}</ul>`
        : '';
      return `<article class="database-analysis-entity">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <h3>${escapeHtml(entity.name)}</h3>
          <span class="pill-badge" style="border: 1px solid rgba(0, 240, 255, 0.3); color: var(--accent-cyan); font-size: 8px;">TABELA</span>
        </div>
        <p>${escapeHtml(entity.role)}</p>
        <span class="database-analysis-key">${escapeHtml(entity.key)}</span>
        ${relations}
      </article>`;
    }).join('');
  }

  if (decisions) {
    decisions.innerHTML = (analysis.decisions || []).map(decision => `
      <article class="database-analysis-decision">
        <h3>${escapeHtml(decision.title)}</h3>
        <p>${escapeHtml(decision.explanation)}</p>
      </article>
    `).join('');
  }

  if (checkpoints) {
    checkpoints.innerHTML = (analysis.checkpoints || []).map((checkpoint, index) => `
      <details class="database-analysis-checkpoint">
        <summary>Missão conceitual ${index + 1}: ${escapeHtml(checkpoint.question || checkpoint.label || '')}</summary>
        <p>${escapeHtml(checkpoint.answer)}</p>
      </details>
    `).join('');
  }

  screen.classList.remove('hidden');
  screen.scrollTop = 0;
  if (title) title.focus({ preventScroll: true });
  return true;
}

function hideDatabaseAnalysis() {
  const screen = document.getElementById('database-analysis-screen');
  if (screen) screen.classList.add('hidden');
}

function showCaseSelection() {
  const screen = document.getElementById('case-select-screen');
  if (screen) screen.classList.remove('hidden');
  document.title = 'SQL Detective — Cyber Forensics';
  activateLobbyTab(getActiveCase().type === 'project' ? 'projects' : 'investigations');
  renderCaseSelection();
}

function hideCaseSelection() {
  const screen = document.getElementById('case-select-screen');
  if (screen) screen.classList.add('hidden');
}

function renderCaseCard(caseDefinition) {
  const available = isCaseAvailable(caseDefinition.id, state.progressByCase);
  const completed = isCaseComplete(caseDefinition, state.progressByCase);
  const isProject = caseDefinition.type === 'project';
  const tag = isProject ? `PROJETO #${caseDefinition.number}` : `CASO #${caseDefinition.number}`;
  const disabled = available ? '' : 'disabled';
  const cardClass = `case-card ${isProject ? 'project-card' : ''} ${available ? '' : 'case-card-locked'}`;

  const badgeText = completed ? 'CONCLUÍDO' : available ? 'LIBERADO' : '🔒 RESTRITO';
  const badgeStyle = completed
    ? 'border-color: rgba(34, 197, 94, .4); color: #4ADE80; background: rgba(34, 197, 94, .08);'
    : available
      ? 'border-color: rgba(0, 240, 255, .4); color: #00F0FF; background: rgba(0, 240, 255, .08);'
      : 'border-color: rgba(139, 92, 246, .35); color: #A78BFA; background: rgba(139, 92, 246, .08);';

  const actionText = available ? 'ABRIR →' : 'TOP SECRET';
  const categoryText = caseDefinition.category?.toUpperCase() || (isProject ? 'ANALYTICS' : 'INVESTIGAÇÃO');

  return `
    <button type="button" class="${cardClass}" data-case-id="${caseDefinition.id}" ${disabled}>
      <div class="case-card-header">
        <span class="case-number">${tag}</span>
        <span class="pill-badge" style="${badgeStyle}">${badgeText}</span>
      </div>
      <span class="case-icon">${caseDefinition.icon}</span>
      <strong>${escapeHtml(caseDefinition.title)}</strong>
      <span>${escapeHtml(caseDefinition.description)}</span>
      <div class="case-card-footer">
        <span class="case-category">${escapeHtml(categoryText)}</span>
        <span class="case-action-label">${actionText}</span>
      </div>
    </button>
  `;
}

function renderCaseSelection() {
  const casesContainer = document.getElementById('case-cards');
  const projectsContainer = document.getElementById('project-cards');
  const projectSection = document.getElementById('project-section');

  const investigations = getInvestigations();
  const projects = getProjects();

  if (casesContainer) {
    casesContainer.innerHTML = investigations.map(renderCaseCard).join('');
  }

  if (projectsContainer) {
    if (projects.length > 0) {
      projectsContainer.innerHTML = projects.map(renderCaseCard).join('');
    }
  }

  const screen = document.getElementById('case-select-screen');
  if (screen) {
    screen.querySelectorAll('[data-case-id]').forEach(button => {
      button.addEventListener('click', () => selectCase(button.dataset.caseId));
    });
  }

  const activeCase = getActiveCase();
  renderHeaderProgress(state.completedLevels.length, activeCase.getTotalLevels());
}

async function selectCase(caseId) {
  if (!isCaseAvailable(caseId, state.progressByCase)) return;
  syncActiveCaseProgress();
  state.sandboxMode = false;
  state.savedLevel = null;
  state.hintsRevealed = [];
  state.lastResult = null;
  state.queryExecuted = false;
  state.lastValidationFeedback = null;
  state.hintRequestInFlight = false;
  state.activeHintRequestToken = null;
  document.dispatchEvent(new CustomEvent('mission-changed'));
  deactivateSandboxMode();
  if (!state.progressByCase[caseId]) state.progressByCase[caseId] = createCaseProgress();
  activateCaseProgress(caseId);
  configureIntro(getActiveCase());
  persistState();
  hideDatabaseAnalysis();
  hideCaseSelection();
  const intro = document.getElementById('intro-screen');
  if (intro) intro.classList.remove('hidden');
}

/**
 * Salva o estado atual no localStorage.
 */
function persistState() {
  syncActiveCaseProgress();
  saveState({
    currentCase: state.currentCase,
    progressByCase: state.progressByCase,
    currentLevel: state.currentLevel,
    completedLevels: state.completedLevels,
    levelProgress: state.levelProgress,
    score: state.score,
    evidence: state.evidence,
    timelineOrder: state.timelineOrder,
    timelineBonusAwarded: state.timelineBonusAwarded,
    bonusPoints: state.bonusPoints,
    interrogation: state.interrogation,
    lessonsRead: state.lessonsRead,
    completedAt: state.completedAt,
  });
}

function recalculateScore() {
  state.score = calculateTotalScore(state.levelProgress, state.bonusPoints);
  return state.score;
}

function showActiveCaseConclusion(activeCase) {
  const totalStars = calculateTotalStars(state.levelProgress);
  const maxStars = calculateMaxStars(activeCase.getTotalLevels());
  const conclusionBody = `
    <p>${activeCase.CASE_CONCLUSION.story}</p>
    <p style="margin-top: 12px;">${activeCase.CASE_CONCLUSION.nextSteps}</p>
  `;

  showConclusionModal(
    `${activeCase.CASE_INTRO.subtitle?.toUpperCase() || 'CASO #001'} · ENCERRADO`,
    conclusionBody,
    {
      score: state.score,
      stars: `${totalStars}/${maxStars}`,
      missions: `${state.completedLevels.length}/${activeCase.getTotalLevels()}`,
    }
  );

  const certificateButton = document.getElementById('btn-conclusion-certificate');
  if (certificateButton) certificateButton.hidden = false;
}

/** Apaga somente o progresso do cenário ativo, preservando os demais. */
function resetActiveCaseProgress() {
  const activeCaseId = state.currentCase;
  syncActiveCaseProgress();
  state.progressByCase[activeCaseId] = createCaseProgress();
  activateCaseProgress(activeCaseId);
  state.sandboxMode = false;
  state.savedLevel = null;
  state.hintsRevealed = [];
  state.lastResult = null;
  state.queryExecuted = false;
  state.lastValidationFeedback = null;
  state.hintRequestInFlight = false;
  state.activeHintRequestToken = null;
  persistState();
  return activeCaseId;
}

function restoreCompletedMissionViews(caseDefinition, db, completedLevels = state.completedLevels) {
  if (!caseDefinition || !db || !Array.isArray(completedLevels)) return [];

  const completed = new Set(completedLevels);
  const restored = [];
  for (const level of caseDefinition.LEVELS || []) {
    const isView = level.executionMode === 'create_view';
    const isMutation = level.executionMode === 'ddl';
    if ((!isView && !isMutation) || !completed.has(level.id)) continue;

    const result = executeQuery(level.referenceQuery, db, {
      allowCreateView: isView,
      allowDml: isMutation,
      allowDdl: isMutation,
    });
    if (result.type === 'empty') {
      restored.push(isView ? level.viewName : level.id);
    } else {
      const artifact = isView ? `a view ${level.viewName}` : `a alteração da missão ${level.id}`;
      console.warn(`Não foi possível restaurar ${artifact}: ${result.message}`);
    }
  }
  return restored;
}

/**
 * Carrega uma missão no estado e na UI.
 * @param {number} levelId
 */
function loadMission(levelId) {
  const activeCase = getActiveCase();
  const lockedMissionIds = getLockedMissionIds(activeCase);
  if (lockedMissionIds.includes(levelId)) {
    const completed = new Set(state.completedLevels);
    levelId = activeCase.LEVELS.find(level => !completed.has(level.id))?.id ?? levelId;
  }
  const level = activeCase.getLevel(levelId);
  if (!level) return;

  state.currentLevel = levelId;
  state.hintsRevealed = [];
  state.queryExecuted = false;
  state.lastValidationFeedback = null;
  state.hintRequestInFlight = false;
  state.activeHintRequestToken = null;
  document.dispatchEvent(new CustomEvent('mission-changed'));
  const btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.hidden = true;

  const courseItems = getCourseItemsForLevel(level);

  renderMission(level, courseItems, state.lessonsRead);
  setLesson(renderLessonHtml(courseItems, level));
  renderHints(level, state.hintsRevealed);
  renderProgress(activeCase.LEVELS, state.completedLevels, state.levelProgress);
  renderEvidence(state.evidence, activeCase.LEVELS, state.completedLevels);
  renderScore(state.score, calculateTotalStars(state.levelProgress), calculateMaxStars(activeCase.getTotalLevels()));
  renderHeaderProgress(state.completedLevels.length, activeCase.getTotalLevels());

  // Renderiza Rail vertical de missões
  renderMissionRail(activeCase.LEVELS, levelId, state.completedLevels, (selectedId) => {
    loadMission(selectedId);
  }, state.lessonsRead, getLockedMissionIds(activeCase));

  configureSidebarTabs({
    graph: Boolean(activeCase.GAMEPLAY?.graph),
    timeline: Boolean(activeCase.GAMEPLAY?.timeline),
    suspects: Boolean(activeCase.GAMEPLAY?.suspects),
    lesson: courseItems.length > 0,
  });

  const primaryItem = courseItems[0];
  const isLessonRead = primaryItem ? state.lessonsRead.includes(primaryItem.id) : true;
  if (primaryItem && !state.completedLevels.includes(levelId) && !isLessonRead) {
    activateSidebarTab('lesson');
  }

  // Atualiza estado de leitura da aula atual
  updateLessonTabBadge(!isLessonRead);

  // Timeline
  if (activeCase.GAMEPLAY?.timeline) {
    state.timelineOrder = normalizeOrder(activeCase.GAMEPLAY.timeline, state.completedLevels, state.timelineOrder);
    renderTimeline(activeCase.GAMEPLAY.timeline, state.completedLevels, state.timelineOrder);
  } else {
    renderTimeline(null, state.completedLevels, []);
  }

  // Suspeitos
  if (activeCase.GAMEPLAY?.suspects) {
    renderSuspectMeter(activeCase.GAMEPLAY.suspects, state.completedLevels);
  } else {
    renderSuspectMeter(null, state.completedLevels);
  }

  // Grafo de rede
  if (activeCase.GAMEPLAY?.graph) {
    const suspicion = deriveSuspicion(activeCase.GAMEPLAY.suspects, state.completedLevels);
    renderGraph(activeCase.GAMEPLAY.graph, state.completedLevels, state.evidence, suspicion);
  } else {
    renderGraph(null, state.completedLevels, state.evidence, 0);
  }

  // Interrogatório
  if (activeCase.GAMEPLAY?.finalChallenge) {
    const allDone = state.completedLevels.length >= activeCase.getTotalLevels();
    const interrogationPending = state.interrogation.status !== 'won';
    showStartInterrogationButton(allDone && interrogationPending);
  } else {
    showStartInterrogationButton(false);
  }

  const completedMutation = level.executionMode === 'ddl' && state.completedLevels.includes(level.id);
  enableEditorButtons(!completedMutation);
  enableHintButton(!completedMutation);
  setHintButtonLoading(false);
  setMissionStatus(`Missão ${levelId}: ${level.title}`);

  const editorHelp = document.getElementById('editor-help');
  if (editorHelp) {
    if (level.executionMode === 'create_view') {
      editorHelp.textContent = `Crie somente a view ${level.viewName}; a prévia será consultada automaticamente.`;
    } else if (completedMutation) {
      editorHelp.textContent = 'Alteração já aplicada ao banco. Avance para a próxima missão ou revise a aula.';
    } else if (level.executionMode === 'ddl') {
      editorHelp.textContent = 'Execute uma única operação INSERT, UPDATE, CREATE INDEX ou CREATE TRIGGER, conforme o objetivo.';
    } else {
      editorHelp.textContent = 'Use SELECT ou WITH para consultar o banco.';
    }
  }
  setEditorValue('');
  setResults(completedMutation
    ? '<p class="placeholder-text">Esta alteração já faz parte do estado restaurado do banco.</p>'
    : '<p class="placeholder-text">Aguardando consulta. Escreva sua query e execute.</p>');
  renderFromState();

  persistState();
}

function restoreProgress() {
  const saved = loadState();
  state.progressByCase = saved.progressByCase || { case001: saved };
  activateCaseProgress(saved.currentCase || 'case001');
}

/**
 * Inicializa a aplicação.
 */
async function init() {
  try {
    initDOM();
    initBasicEvents();
    initTabs();
    initSidebarTabs();
    initLobbyTabs();

    restoreProgress();
    configureIntro(getActiveCase());
    showCaseSelection();
    hideLoading();

    renderEvidence(state.evidence, getActiveCase().LEVELS, state.completedLevels);

    const syncResponsiveNavigation = () => {
      if (window.innerWidth <= 640) {
        showTabs();
        if (!document.querySelector('.panel.active')) activatePanel('briefing');
      } else {
        hideTabs();
      }
    };
    syncResponsiveNavigation();
    window.addEventListener('resize', syncResponsiveNavigation);

    document.addEventListener('click', (event) => {
      const trigger = event.target?.closest?.('[data-open-course-lesson]');
      if (trigger) showCourseLesson(trigger.dataset.openCourseLesson);
    });

    // Registro de progresso de leitura da aula
    const markActiveLessonAsRead = () => {
      const activeCase = getActiveCase();
      const activeLevel = activeCase?.LEVELS?.find(l => l.id === state.currentLevel);
      const primaryRef = activeLevel?.courseRefs?.[0];
      const displayedLesson = document.querySelector('#lesson-display .lesson');
      const lessonId = displayedLesson?.dataset?.lessonId || primaryRef;
      if (lessonId && !state.lessonsRead.includes(lessonId)) {
        state.lessonsRead.push(lessonId);
        syncActiveCaseProgress();
        persistState();
        updateLessonTabBadge(false);
        const courseItems = getCourseItemsForLevel(activeLevel);
        renderMission(activeLevel, courseItems, state.lessonsRead);
        renderMissionRail(activeCase.LEVELS, state.currentLevel, state.completedLevels, (selectedId) => {
          loadMission(selectedId);
        }, state.lessonsRead, getLockedMissionIds(activeCase));
      }
    };

    const lessonPane = document.getElementById('sidebar-pane-lesson');
    if (lessonPane) {
      lessonPane.addEventListener('scroll', () => {
        if (lessonPane.scrollTop + lessonPane.clientHeight >= lessonPane.scrollHeight - 40) {
          markActiveLessonAsRead();
        }
      });
      lessonPane.addEventListener('toggle', (e) => {
        if (e.target && e.target.tagName === 'DETAILS' && e.target.open) {
          markActiveLessonAsRead();
        }
      }, true);
    }

    const initAudioOnGesture = () => {
      initSfx(window);
      updateSoundButtonIcon();
      document.removeEventListener('click', initAudioOnGesture);
      document.removeEventListener('keydown', initAudioOnGesture);
      document.removeEventListener('touchstart', initAudioOnGesture);
    };
    document.addEventListener('click', initAudioOnGesture, { once: true });
    document.addEventListener('keydown', initAudioOnGesture, { once: true });
    document.addEventListener('touchstart', initAudioOnGesture, { once: true });

    // Botão Iniciar da tela inicial
    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
      btnStart.addEventListener('click', async () => {
        hideIntroScreen();
        if (!showDatabaseAnalysis(getActiveCase())) {
          await startGame();
        }
      });
    }

    const btnIntroBack = document.getElementById('btn-intro-back');
    if (btnIntroBack) {
      btnIntroBack.addEventListener('click', () => {
        hideIntroScreen();
        showCaseSelection();
      });
    }

    const btnAnalysisStart = document.getElementById('btn-analysis-start');
    if (btnAnalysisStart) {
      btnAnalysisStart.addEventListener('click', async () => {
        hideDatabaseAnalysis();
        await startGame();
      });
    }

    const btnConclusionClose = document.getElementById('btn-conclusion-close');
    if (btnConclusionClose) {
      btnConclusionClose.addEventListener('click', () => {
        hideConclusionModal();
        showCaseSelection();
      });
    }

    const btnConclusionSandbox = document.getElementById('btn-conclusion-sandbox');
    if (btnConclusionSandbox) {
      btnConclusionSandbox.addEventListener('click', () => {
        hideConclusionModal();
        const btnSandbox = document.getElementById('btn-sandbox');
        if (btnSandbox) btnSandbox.click();
      });
    }

    const btnConclusionCertificate = document.getElementById('btn-conclusion-certificate');
    if (btnConclusionCertificate) {
      btnConclusionCertificate.addEventListener('click', () => {
        showCertificateModal(getActiveCase());
      });
    }

  } catch (err) {
    console.error('Erro na inicialização:', err);
    showGlobalError('Falha ao carregar o jogo. Verifique o console para detalhes.');
    hideLoading();
  }
}

/**
 * Inicia o jogo: carrega banco, restaura progresso, carrega missão.
 */
async function startGame(caseId = state.currentCase) {
  try {
    if (caseId !== state.currentCase) activateCaseProgress(caseId);
    if (state.completedLevels.length > 0) {
      console.log(`Progresso restaurado: ${state.completedLevels.length} missões concluídas, ${state.score} pontos.`);
    }

    setDbStatus('pending', '● BANCO: CARREGANDO…');
    await initDB(state.currentCase, { force: true });

    const db = getDB();
    restoreCompletedMissionViews(getActiveCase(), db);

    const schema = getSchemaText();
    setSchema(schema);
    enableEditorButtons(true);
    setDbStatus('ok', '● BANCO PRONTO');

    const activeCase = getActiveCase();
    const totalLevels = activeCase.getTotalLevels();
    let levelToLoad = state.currentLevel;
    const invalidSavedLevel = !Number.isInteger(levelToLoad) || levelToLoad < 1 || levelToLoad > totalLevels;
    if (invalidSavedLevel || (state.completedLevels.includes(levelToLoad) && levelToLoad < totalLevels)) {
      levelToLoad = null;
      for (let i = 1; i <= totalLevels; i++) {
        if (!state.completedLevels.includes(i)) {
          levelToLoad = i;
          break;
        }
      }
      if (!levelToLoad) levelToLoad = totalLevels;
    }
    loadMission(levelToLoad);

    hideLoading();
    renderFromState();

  } catch (err) {
    console.error('Erro ao iniciar jogo:', err);
    showGlobalError('Falha ao carregar o banco de dados. Verifique o console para detalhes.');
    hideLoading();
  }
}

function updateSoundButtonIcon() {
  const btnSound = document.getElementById('btn-sound');
  if (!btnSound) return;
  btnSound.textContent = isSfxEnabled() ? '🔊' : '🔇';
  btnSound.classList.toggle('muted', !isSfxEnabled());
}

/**
 * Registra event listeners dos botões.
 */
function initBasicEvents() {
  const btnRun = document.getElementById('btn-run');
  const btnClear = document.getElementById('btn-clear');
  const btnHint = document.getElementById('btn-hint');
  const btnNext = document.getElementById('btn-next');
  const btnReset = document.getElementById('btn-reset');
  const btnResetConfirm = document.getElementById('btn-reset-confirm');
  const btnResetCancel = document.getElementById('btn-reset-cancel');
  const btnSandbox = document.getElementById('btn-sandbox');
  const btnMission = document.getElementById('btn-mission');
  const btnSchema = document.getElementById('btn-schema');
  const btnCases = document.getElementById('btn-cases');
  const sqlEditor = document.getElementById('sql-editor');
  const errorRetry = document.getElementById('app-error-retry');
  const btnSound = document.getElementById('btn-sound');

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      initSfx(window);
      setSfxEnabled(!isSfxEnabled());
      updateSoundButtonIcon();
    });
  }

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      const sql = getEditorValue();
      const db = getDB();
      if (!db) { setResults('<div class="feedback feedback-error">Banco não carregado.</div>'); return; }

      if (state.sandboxMode) {
        const isModelingCase = ['case005', 'case006'].includes(state.currentCase);
        const result = executeQuery(sql, db, {
          allowDml: state.currentCase === 'case004' || isModelingCase,
          allowDdl: isModelingCase,
        });
        renderResults(result);
        return;
      }

      if (!state.currentLevel) { setResults('<div class="feedback feedback-error">Nenhuma missão ativa.</div>'); return; }

      const activeCase = getActiveCase();
      const level = activeCase.getLevel(state.currentLevel);

      const feedback = validateLevel(sql, level, db);

      if (feedback.result) {
        renderResults(feedback.result);
      }
      renderFeedback(feedback);

      state.lastValidationFeedback = {
        type: feedback.type,
        message: feedback.message,
        missingConcepts: feedback.missingConcepts || undefined,
        missingColumns: feedback.missingColumns || undefined,
      };

      if (feedback.type === FEEDBACK_CORRECT) {
        const hintsUsed = state.hintsRevealed.length;
        const stars = calculateStars(hintsUsed);

        const result = updateLevelProgress(state.levelProgress, state.currentLevel, stars, hintsUsed);
        state.levelProgress = result.levelProgress;

        if (result.updated) {
          recalculateScore();
        }

        if (!state.completedLevels.includes(state.currentLevel)) {
          state.completedLevels.push(state.currentLevel);
        }

        if (
          state.completedLevels.length >= activeCase.getTotalLevels()
          && !activeCase.GAMEPLAY?.finalChallenge
          && !state.completedAt
        ) {
          state.completedAt = new Date().toISOString();
        }

        if (!state.evidence.includes(level.evidence)) {
          state.evidence.push(level.evidence);
          playAlertSound();
        } else {
          playSuccessSound();
        }

        if (level.executionMode === 'create_view' || (level.executionMode === 'ddl' && /^\s*CREATE\b/i.test(sql))) {
          setSchema(getSchemaText());
        }

        renderEvidence(state.evidence, activeCase.LEVELS, state.completedLevels);
        renderProgress(activeCase.LEVELS, state.completedLevels, state.levelProgress);
        renderScore(state.score, calculateTotalStars(state.levelProgress), calculateMaxStars(activeCase.getTotalLevels()));
        renderHeaderProgress(state.completedLevels.length, activeCase.getTotalLevels());

        renderMissionRail(activeCase.LEVELS, state.currentLevel, state.completedLevels, (selectedId) => {
          loadMission(selectedId);
        }, state.lessonsRead, getLockedMissionIds(activeCase));

        if (level.executionMode === 'ddl') {
          enableEditorButtons(false);
          const currentEditorHelp = document.getElementById('editor-help');
          if (currentEditorHelp) currentEditorHelp.textContent = 'Alteração aplicada e validada. Avance para a próxima missão.';
        }

        if (activeCase.GAMEPLAY?.graph) {
          const suspicion = deriveSuspicion(activeCase.GAMEPLAY.suspects, state.completedLevels);
          renderGraph(activeCase.GAMEPLAY.graph, state.completedLevels, state.evidence, suspicion);
        }
        if (activeCase.GAMEPLAY?.suspects) {
          renderSuspectMeter(activeCase.GAMEPLAY.suspects, state.completedLevels);
        }

        const nextLevel = state.currentLevel + 1;
        if (nextLevel <= activeCase.getTotalLevels()) {
          const btnNextEl = document.getElementById('btn-next');
          if (btnNextEl) btnNextEl.hidden = false;
        }

        persistState();

        if (activeCase.GAMEPLAY?.timeline) {
          state.timelineOrder = normalizeOrder(
            activeCase.GAMEPLAY.timeline,
            state.completedLevels,
            state.timelineOrder
          );
          renderTimeline(activeCase.GAMEPLAY.timeline, state.completedLevels, state.timelineOrder);
          persistState();
        }

        if (state.completedLevels.length >= activeCase.getTotalLevels()) {
          if (activeCase.GAMEPLAY?.finalChallenge) {
            const fc = activeCase.GAMEPLAY.finalChallenge;
            const startResult = startInterrogation(fc, state.completedLevels, state.interrogation);
            if (startResult.started) {
              state.interrogation = startResult.state;
              showStartInterrogationButton(true);
              persistState();
              document.dispatchEvent(new CustomEvent('interrogation-start'));
            } else if (state.interrogation.status === 'won') {
              setTimeout(() => showActiveCaseConclusion(activeCase), 500);
            }
          } else {
            setTimeout(() => showActiveCaseConclusion(activeCase), 500);
          }
        }
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      clearEditor();
      setResults('<p class="placeholder-text">Aguardando consulta. Escreva sua query e execute.</p>');
    });
  }

  if (btnHint) {
    btnHint.addEventListener('click', async () => {
      if (!state.currentLevel) return;
      const level = getActiveCase().getLevel(state.currentLevel);
      if (!level) return;
      if (state.hintRequestInFlight) return;
      if (state.hintsRevealed.length >= 3) return;

      const hintIndex = state.hintsRevealed.length + 1;
      const requestToken = `${state.currentCase}:${state.currentLevel}:${Date.now()}`;
      state.activeHintRequestToken = requestToken;

      state.hintRequestInFlight = true;
      setHintButtonLoading(true);

      const abortController = new AbortController();
      const onMissionChange = () => abortController.abort();
      document.addEventListener('mission-changed', onMissionChange, { once: true });

      try {
        const schema = getSchemaText();
        const studentSql = getEditorValue();
        const ctx = buildHintContext({
          hintIndex,
          mission: level,
          schema,
          studentSql,
          validationFeedback: state.lastValidationFeedback,
        });

        const result = await requestAiHint(ctx, { signal: abortController.signal });

        if (state.activeHintRequestToken !== requestToken) return;

        if (result.ok && result.hint) {
          state.hintsRevealed.push({ source: 'ollama', text: result.hint });
          renderHints(level, state.hintsRevealed);
        } else {
          if (state.hintsRevealed.length < level.hints.length) {
            state.hintsRevealed.push({ source: 'local', text: level.hints[state.hintsRevealed.length] });
            renderHints(level, state.hintsRevealed);
            showHintFallbackNotice('IA indisponível — exibindo dica forense local.');
          }
        }

        if (state.hintsRevealed.length >= 3) {
          enableHintButton(false);
        }
      } catch {
        if (state.activeHintRequestToken !== requestToken) return;
        if (state.hintsRevealed.length < level.hints.length) {
          state.hintsRevealed.push({ source: 'local', text: level.hints[state.hintsRevealed.length] });
          renderHints(level, state.hintsRevealed);
          showHintFallbackNotice('IA indisponível — exibindo dica forense local.');
        }
        if (state.hintsRevealed.length >= 3) {
          enableHintButton(false);
        }
      } finally {
        document.removeEventListener('mission-changed', onMissionChange);
        if (state.activeHintRequestToken === requestToken) {
          state.hintRequestInFlight = false;
          state.activeHintRequestToken = null;
          if (state.hintsRevealed.length < 3) {
            setHintButtonLoading(false);
            enableHintButton(true);
          }
        }
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      const nextLevel = state.currentLevel + 1;
      if (nextLevel <= getActiveCase().getTotalLevels()) {
        loadMission(nextLevel);
        const btnNextEl = document.getElementById('btn-next');
        if (btnNextEl) btnNextEl.hidden = true;
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      showResetConfirm(true);
    });
  }

  if (btnResetConfirm) {
    btnResetConfirm.addEventListener('click', () => {
      const activeCaseId = resetActiveCaseProgress();
      deactivateSandboxMode();
      const help = document.getElementById('editor-help');
      if (help) help.textContent = 'Use SELECT ou WITH para consultar o banco.';
      showResetConfirm(false);
      configureIntro(getActiveCase());
      startGame(activeCaseId);
      console.log(`Progresso de ${activeCaseId} reiniciado.`);
    });
  }

  if (btnResetCancel) {
    btnResetCancel.addEventListener('click', () => {
      showResetConfirm(false);
    });
  }

  if (btnSandbox) {
    btnSandbox.addEventListener('click', () => {
      state.sandboxMode = true;
      state.savedLevel = state.currentLevel;
      activateSandboxMode();
      if (state.currentCase === 'case004') {
        const help = document.getElementById('editor-help');
        if (help) help.textContent = 'No sandbox deste caso, SELECT, WITH, INSERT, UPDATE e DELETE são permitidos.';
        setResults('<p class="placeholder-text">Use SELECT/WITH ou uma alteração DML controlada no banco temporário.</p>');
      } else if (['case005', 'case006'].includes(state.currentCase)) {
        const help = document.getElementById('editor-help');
        if (help) help.textContent = 'No sandbox deste caso, SELECT, WITH, INSERT, UPDATE e CREATE TABLE/INDEX/TRIGGER são permitidos.';
        setResults('<p class="placeholder-text">Explore consultas e alterações no banco temporário; ao voltar à missão, o progresso canônico será restaurado.</p>');
      }
    });
  }

  if (btnMission) {
    btnMission.addEventListener('click', async () => {
      state.sandboxMode = false;
      deactivateSandboxMode();
      const help = document.getElementById('editor-help');
      if (help) help.textContent = 'Use SELECT ou WITH para consultar o banco.';
      await initDB(state.currentCase, { force: true });
      restoreCompletedMissionViews(getActiveCase(), getDB());
      setSchema(getSchemaText());
      const levelToLoad = state.savedLevel || state.currentLevel || 1;
      state.savedLevel = null;
      loadMission(levelToLoad);
    });
  }

  if (btnSchema) {
    btnSchema.addEventListener('click', () => {
      const schema = getSchemaDetailed();
      renderSchemaDetailed(schema);
    });
  }

  if (btnCases) {
    btnCases.addEventListener('click', () => {
      persistState();
      showCaseSelection();
    });
  }

  if (sqlEditor) {
    let lastTypingSound = 0;
    sqlEditor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btn-run').click();
        return;
      }
      const now = Date.now();
      if (now - lastTypingSound > 60 && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        lastTypingSound = now;
        playTypingSound(750 + Math.random() * 150, 0.03);
      }
    });
  }

  if (errorRetry) {
    errorRetry.addEventListener('click', () => {
      hideGlobalError();
      location.reload();
    });
  }

  const btnER = document.getElementById('btn-er');
  const btnERClose = document.getElementById('btn-er-close');
  const erModal = document.getElementById('er-modal');
  const erContent = document.getElementById('er-diagram-content');

  if (btnER) {
    btnER.addEventListener('click', () => {
      if (erContent) {
        renderERDiagram(erContent);
      }
      if (erModal) {
        erModal.hidden = false;
        btnERClose?.focus();
      }
    });
  }

  if (btnERClose) {
    btnERClose.addEventListener('click', () => {
      if (erModal) erModal.hidden = true;
      btnER?.focus();
    });
  }

  if (erModal) {
    erModal.addEventListener('click', (e) => {
      if (e.target === erModal) {
        erModal.hidden = true;
        btnER?.focus();
      }
    });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-timeline-move');
    if (!btn) return;
    const activeCase = getActiveCase();
    if (!activeCase.GAMEPLAY?.timeline) return;
    const index = parseInt(btn.dataset.index, 10);
    const direction = btn.dataset.action;
    state.timelineOrder = moveEvent(state.timelineOrder, index, direction);
    renderTimeline(activeCase.GAMEPLAY.timeline, state.completedLevels, state.timelineOrder);
    persistState();
  });

  const btnTimelineCheck = document.getElementById('btn-timeline-check');
  if (btnTimelineCheck) {
    btnTimelineCheck.addEventListener('click', () => {
      const activeCase = getActiveCase();
      if (!activeCase.GAMEPLAY?.timeline) return;

      const unlockedEvents = getUnlockedEvents(activeCase.GAMEPLAY.timeline, state.completedLevels);
      const allEventsUnlocked = unlockedEvents.length === activeCase.GAMEPLAY.timeline.events.length;
      if (!allEventsUnlocked) {
        setResults('<p class="placeholder-text">Complete todas as missões do caso para liberar a verificação da linha do tempo.</p>');
        return;
      }

      const bonusResult = checkTimelineBonus(
        activeCase.GAMEPLAY.timeline,
        state.completedLevels,
        state.timelineOrder,
        state.timelineBonusAwarded
      );
      if (bonusResult.allCorrect && bonusResult.awarded) {
        state.timelineBonusAwarded = true;
        state.bonusPoints += bonusResult.bonusPoints;
        recalculateScore();
        renderScore(state.score, calculateTotalStars(state.levelProgress), calculateMaxStars(activeCase.getTotalLevels()));
        persistState();
        setResults(`<p class="placeholder-text" style="color: var(--status-success-light)">${escapeHtml(bonusResult.message)}</p>`);
      } else if (bonusResult.allCorrect) {
        setResults('<p class="placeholder-text">Bônus já concedido. Ordem cronológica correta!</p>');
      } else {
        setResults('<p class="placeholder-text" style="color: var(--status-warning)">Ordem incorreta. Revise as datas e tente novamente.</p>');
      }
    });
  }

  document.addEventListener('interrogation-start', () => {
    const activeCase = getActiveCase();
    if (!activeCase.GAMEPLAY?.finalChallenge) return;
    const fc = activeCase.GAMEPLAY.finalChallenge;
    const unlockedEvidences = getUnlockedEvents(activeCase.GAMEPLAY.timeline, state.completedLevels);
    showInterrogationModal(fc, state.interrogation, unlockedEvidences);
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.interrogation-evidence-btn');
    if (!btn) return;
    const activeCase = getActiveCase();
    if (!activeCase.GAMEPLAY?.finalChallenge) return;
    const fc = activeCase.GAMEPLAY.finalChallenge;
    const evidenceId = btn.dataset.evidenceId;
    const result = presentEvidence(fc, state.completedLevels, activeCase.GAMEPLAY.timeline, state.interrogation, evidenceId);
    state.interrogation = result.state;
    if (result.completed && !state.completedAt) state.completedAt = new Date().toISOString();
    persistState();

    if (result.accepted) {
      if (result.completed) {
        showStartInterrogationButton(false);
        setInterrogationFeedback(result.message || 'Evidência aceita.', true);
        setTimeout(() => {
          hideInterrogationModal();
          showActiveCaseConclusion(activeCase);
        }, 1500);
      } else {
        const unlockedEvidences = getUnlockedEvents(activeCase.GAMEPLAY.timeline, state.completedLevels);
        showInterrogationModal(fc, state.interrogation, unlockedEvidences);
        setInterrogationFeedback(result.message || 'Evidência aceita.', true);
      }
    } else {
      setInterrogationFeedback(result.message || 'Evidência incorreta. O suspeito refutou a alegação.', false);
    }
  });

  const btnInterrogationClose = document.getElementById('btn-interrogation-close');
  if (btnInterrogationClose) {
    btnInterrogationClose.addEventListener('click', () => {
      hideInterrogationModal();
      const activeCase = getActiveCase();
      const canResume = Boolean(
        activeCase.GAMEPLAY?.finalChallenge
        && state.completedLevels.length >= activeCase.getTotalLevels()
        && state.interrogation.status !== 'won'
      );
      showStartInterrogationButton(canResume);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dom_interrogationModal_visible()) {
      hideInterrogationModal();
    }
  });

  const btnStartInterrogation = document.getElementById('btn-start-interrogation');
  if (btnStartInterrogation) {
    btnStartInterrogation.addEventListener('click', () => {
      const activeCase = getActiveCase();
      if (!activeCase.GAMEPLAY?.finalChallenge) return;
      const fc = activeCase.GAMEPLAY.finalChallenge;
      const startResult = startInterrogation(fc, state.completedLevels, state.interrogation);
      if (startResult.started) {
        state.interrogation = startResult.state;
        persistState();
        document.dispatchEvent(new CustomEvent('interrogation-start'));
      }
    });
  }
}

function dom_interrogationModal_visible() {
  const modal = document.getElementById('interrogation-modal');
  return modal && !modal.hidden;
}

if (typeof globalThis !== 'undefined' && globalThis.__SQL_DETECTIVE_TEST__) {
  globalThis.__SQLDetectiveApp = {
    persistState,
    loadMission,
    selectCase,
    restoreProgress,
    startGame,
    showDatabaseAnalysis,
    hideDatabaseAnalysis,
    recalculateScore,
    restoreCompletedMissionViews,
    resetActiveCaseProgress,
    showCourseLesson,
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
