/**
 * app.js — Ponto de entrada do SQL Detective (Cyber Forensics).
 */

import { state, activateCaseProgress, syncActiveCaseProgress, createCaseProgress } from './state.js';
import { initDB, getSchemaText, getDB, getSchemaDetailed } from './db.js';
import { executeQuery } from './executor.js';
import { getCaseById, isCaseAvailable, isCaseComplete, getInvestigations, getProjects } from './case-manager.js';
import { validateLevel, FEEDBACK_CORRECT, FEEDBACK_SQL_ERROR } from './validator.js';
import { validateBugChallenge, BH_FEEDBACK_CORRECT, BH_FEEDBACK_BUG_NOT_FIXED } from './bug-hunter-validator.js';
import { validateSchemaChallenge, SB_FEEDBACK_CORRECT, SB_FEEDBACK_BLOCKED,
         executeMultipleStatements, findForbiddenKeyword, mergeSchemaStatements,
         getCreatedTableNames, splitStatements, getCreatedTableName } from './schema-builder-validator.js';
import { buildReviewContext, requestAiSchemaReview } from './ai-schema-review.js';
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
  setBriefing,
  activateSidebarTab,
  renderBugHints,
  renderBugFeedback,
  renderBugEvidence,
  renderBugProgress,
  renderBugRail,
  renderSchemaChallenge,
  renderSchemaHints,
  renderSchemaFeedback,
  renderSchemaEvidence,
  renderSchemaProgress,
  renderSchemaRail,
  setAiReviewButtonLoading,
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
import {
  getBattle, isBossCase, isBossStepId, isBossAvailable, getActiveStep,
  normalizeBossState, startBattle, validateBossStep, completeStep,
  isBattleWon, winBattle, elapsedMs as bossElapsedMs,
  computeBossScore, computeBossStars,
} from './boss-fight.js';
import {
  renderBossBriefing, renderBossRail, updateBossTimerReadout,
  renderBossHintsBanner, showBossInvitation, showBossVictoryModal,
  hideBossVictoryModal,
} from './ui.js';
import { deriveSuspicion } from './suspect-meter.js';
import { startInterrogation, presentEvidence } from './interrogation.js';
import { initSfx, setSfxEnabled, isSfxEnabled, playTypingSound, playAlertSound, playSuccessSound } from './sfx.js';

function getActiveCase() {
  return getCaseById(state.currentCase) || getCaseById('case001');
}

/**
 * Retorna a definição do desafio Bug Hunter ativo (desafios não são missões numeradas).
 * @returns {object|null}
 */
function getActiveBugChallenge() {
  const activeCase = getActiveCase();
  if (activeCase.type !== 'bug-hunter') return null;
  const challengeId = state.currentLevel;
  return (activeCase.BUG_CHALLENGES || []).find(c => c.id === challengeId) || null;
}

/** Verifica se o cenário ativo é o modo Bug Hunter. */
function isBugHunterMode() {
  return getActiveCase().type === 'bug-hunter';
}

/** Retorna a definição do desafio Construtor de Schema ativo. */
function getActiveSchemaChallenge() {
  const activeCase = getActiveCase();
  if (activeCase.type !== 'schema-builder') return null;
  const challengeId = state.currentLevel;
  return (activeCase.SCHEMA_CHALLENGES || []).find(c => c.id === challengeId) || null;
}

/** Verifica se o cenário ativo é o modo Construtor de Schema. */
function isSchemaBuilderMode() {
  return getActiveCase().type === 'schema-builder';
}

/** Obtém o DDL acumulado do desafio Construtor de Schema ativo. */
function getActiveSchemaDdl() {
  const challengeId = state.currentLevel;
  const saved = state.schemaBuilderDdl[challengeId];
  return Array.isArray(saved) ? saved.join('\n') : '';
}

/** Verifica se o cenário ativo é um step do Boss Fight. */
function isBossFightMode() {
  return isBossStepId(state.currentLevel) && Boolean(getBattle(state.currentCase));
}

/** Obtém a batalha do boss do caso ativo. */
function getActiveBossBattle() {
  return getBattle(state.currentCase);
}

let bossTimerHandle = null;

/**
 * Inicia (ou reinicia) o cronômetro do Boss Fight ativo. Atualiza o painel
 * a cada segundo e encerra o intervalo automaticamente quando o jogador sai
 * do modo boss.
 */
function startBossTimer() {
  if (bossTimerHandle) clearInterval(bossTimerHandle);
  if (!isBossFightMode()) return;
  bossTimerHandle = setInterval(() => {
    if (!isBossFightMode()) {
      clearInterval(bossTimerHandle);
      bossTimerHandle = null;
      return;
    }
    const battle = getActiveBossBattle();
    const bossState = normalizeBossState(state.bossByCase[state.currentCase] || {});
    updateBossTimerReadout(bossElapsedMs(battle, bossState));
  }, 1000);
  // Primeira atualização imediata.
  const battle = getActiveBossBattle();
  const bossState = normalizeBossState(state.bossByCase[state.currentCase] || {});
  updateBossTimerReadout(bossElapsedMs(battle, bossState));
}

/**
 * Encerra o modo boss e decide o fluxo final: se o caso possui uma batalha
 * disponível (não vencida e, quando há interrogatório, vencido), oferece o
 * Boss Fight; caso contrário, exibe a conclusão do caso.
 * @param {object} activeCase
 */
function offerOrConclude(activeCase) {
  if (bossTimerHandle) {
    clearInterval(bossTimerHandle);
    bossTimerHandle = null;
  }
  const battle = getBattle(state.currentCase);
  const bossState = normalizeBossState(state.bossByCase[state.currentCase] || {});
  const interrogation = state.interrogation || {};
  if (battle && isBossAvailable(battle, bossState, interrogation)) {
    showBossInvitation(
      battle,
      () => {
        const startResult = startBattle(battle, bossState);
        state.bossByCase[state.currentCase] = startResult.state;
        persistState();
        const firstStep = battle.steps.find(s => !bossState.completedSteps.includes(s.id));
        if (firstStep) {
          loadMission(firstStep.id);
        } else {
          loadMission(battle.steps[0].id);
        }
        startBossTimer();
      },
      () => {
        showActiveCaseConclusion(activeCase);
      }
    );
  } else {
    showActiveCaseConclusion(activeCase);
  }
}

/**
 * Carrega um step do Boss Fight: briefing, trilha de steps, bloqueio de dicas
 * e painel de resultados em branco.
 * @param {string} stepId id do step (ex: boss-006-2)
 */
function loadBossFight(stepId) {
  const battle = getActiveBossBattle();
  if (!battle) return;
  const rawState = state.bossByCase[state.currentCase] || {};
  const bossState = normalizeBossState(rawState);
  if (bossState.status !== 'active') return;
  const step = battle.steps.find(s => s.id === stepId);
  if (!step) return;

  state.currentLevel = stepId;
  state.hintsRevealed = [];
  state.queryExecuted = false;
  state.lastValidationFeedback = null;
  state.hintRequestInFlight = false;
  state.activeHintRequestToken = null;
  document.dispatchEvent(new CustomEvent('mission-changed'));

  const elapsed = bossElapsedMs(battle, bossState);
  const remaining = battle.steps.length - bossState.completedSteps.length - (bossState.completedSteps.includes(stepId) ? 0 : 1);
  renderBossBriefing(battle, step, elapsed, Math.max(0, remaining));
  renderBossRail(battle, step, bossState.completedSteps);
  renderBossHintsBanner();

  setMissionStatus('⚔ BOSS FIGHT');
  setResults('<p class="placeholder-text">Aguardando comando. Escreva sua query e execute.</p>');
  clearEditor();
  enableEditorButtons(true);

  const activeStep = getActiveStep(battle, bossState);
  const btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.hidden = !activeStep || activeStep.id !== stepId;

  showTabs();
  configureSidebarTabs({ graph: false, timeline: false, suspects: false, lesson: false });

  // Esconde os painéis laterais de gameplay: o boss usa apenas o editor.
  const sidebarPanes = [
    'sidebar-pane-lesson', 'sidebar-pane-graph', 'sidebar-pane-timeline',
    'sidebar-pane-suspects', 'sidebar-pane-hints',
  ];
  for (const paneId of sidebarPanes) {
    const pane = document.getElementById(paneId);
    if (pane) pane.hidden = true;
  }
  const sidebarTabsNav = document.getElementById('sidebar-tabs-nav');
  if (sidebarTabsNav) sidebarTabsNav.hidden = true;
  const tabsNav = document.getElementById('tabs-nav');
  if (tabsNav) tabsNav.hidden = true;

  // O banco do boss já contém as views das missões concluídas (restaurado no startGame).
  setSchema(getSchemaText());
  renderFromState();

  startBossTimer();
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

  // Botões de assistência exclusivos do modo Construtor de Schema.
  const buttonAiReview = document.getElementById('btn-ai-review');
  const buttonHint = document.getElementById('btn-hint');
  const willUseSchemaButtons = getActiveCase()?.type === 'schema-builder';
  if (buttonAiReview) buttonAiReview.hidden = !willUseSchemaButtons;
  if (buttonHint) {
    if (!willUseSchemaButtons && getActiveCase()?.type !== 'bug-hunter') {
      buttonHint.hidden = true;
    }
    if (buttonHint.textContent.startsWith('REVELAR DICA')) {
      buttonHint.textContent = 'SOLICITAR DICA (3 RESTANTES)';
    }
  }
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
    schemaBuilderDdl: state.schemaBuilderDdl,
    completedAt: state.completedAt,
    bossByCase: state.bossByCase,
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

  // --- Boss Fight: battle multi-etapas pós-caso (ids de string 'boss-NNN-M') ---
  if (isBossStepId(levelId)) {
    loadBossFight(levelId);
    return;
  }

  // --- Modo Bug Hunter: desafios de debug (ids de string 'bug-N') ---
  if (activeCase.type === 'bug-hunter') {
    loadBugChallenge(levelId);
    return;
  }

  // --- Modo Construtor de Schema: desafios de modelagem (ids numéricos) ---
  if (activeCase.type === 'schema-builder') {
    loadSchemaChallenge(levelId);
    return;
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

/**
 * Carrega um desafio do modo Construtor de Schema: briefing com requisitos
 * em linguagem natural, banco vazio e DDL acumulado restaurado do progresso.
 * @param {number} challengeId id numérico do desafio (1..6)
 */
function loadSchemaChallenge(challengeId) {
  const activeCase = getActiveCase();
  const challenges = activeCase.SCHEMA_CHALLENGES || [];
  const challenge = challenges.find(c => c.id === challengeId) || challenges[0];
  if (!challenge) return;

  state.currentLevel = challenge.id;
  state.hintsRevealed = [];
  state.queryExecuted = false;
  state.lastValidationFeedback = null;
  state.hintRequestInFlight = false;
  state.activeHintRequestToken = null;
  document.dispatchEvent(new CustomEvent('mission-changed'));
  const btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.hidden = true;

  const ddlRestored = getActiveSchemaDdl();
  setEditorValue(ddlRestored);

  renderSchemaChallenge(challenge, ddlRestored, state.completedLevels, getCreatedTableNames(ddlRestored));
  renderSchemaHints(challenge, state.hintsRevealed);
  renderSchemaFeedback(null);
  renderSchemaEvidence(activeCase.SCHEMA_CHALLENGES, state.completedLevels);
  renderSchemaProgress(activeCase.SCHEMA_CHALLENGES, challenge.id, state.completedLevels, state.levelProgress);
  renderSchemaRail(activeCase.SCHEMA_CHALLENGES, state.currentLevel, state.completedLevels, (id) => loadMission(id));
  renderScore(state.score, calculateTotalStars(state.levelProgress), calculateMaxStars(activeCase.SCHEMA_CHALLENGES.length));
  renderHeaderProgress(state.completedLevels.length, activeCase.SCHEMA_CHALLENGES.length);

  configureSidebarTabs({
    graph: false,
    timeline: false,
    suspects: false,
    lesson: false,
  });

  const schemaButtonHint = document.getElementById('btn-hint');
  const schemaButtonAiReview = document.getElementById('btn-ai-review');
  if (schemaButtonHint) schemaButtonHint.hidden = false;
  if (schemaButtonAiReview) schemaButtonAiReview.hidden = false;

  if (ddlRestored) {
    // Recria o banco do desafio com o DDL salvo, sem tocar no progresso.
    rebuildSchemaChallengeDb(ddlRestored).catch((err) => {
      console.error('Erro ao reconstruir banco do desafio:', err);
      setDbStatus('error', 'Banco: erro ao restaurar');
    });
  } else {
    initDB('schema-builder', { force: true }).then(() => {
      enableHintButton(true);
    }).catch((err) => {
      console.error('Erro ao iniciar banco do desafio:', err);
      setDbStatus('error', 'Banco: erro');
    });
  }
  if (ddlRestored) enableHintButton(true);
}

/**
 * Reconstrói o banco do desafio com o DDL salvo.
 * Não modifica estado de conclusão — apenas recria o cenário de trabalho.
 * @param {string} ddl DDL acumulado
 * @returns {Promise<void>}
 */
async function rebuildSchemaChallengeDb(ddl) {
  await initDB('schema-builder', { force: true });
  const db = getDB();
  db.run(ddl);
  setSchema(getSchemaText());
  setDbStatus('ok', `Banco: ${state.completedLevels.includes(state.currentLevel) ? 'concluído' : 'em construção'}`);
  try { renderSchemaDetailed(db); } catch { /* banco vazio não gera diagrama */ }
}

/**
 * Carrega um desafio do modo Bug Hunter: introdução do relatório,
 * lista de bugs, query defeituosa no editor e painel de correção.
 * @param {string} challengeId id do desafio ('bug-1' ... 'bug-N')
 */
function loadBugChallenge(challengeId) {
  const activeCase = getActiveCase();
  const challenges = activeCase.BUG_CHALLENGES || [];
  const challenge = challenges.find(c => c.id === challengeId) || challenges[0];
  if (!challenge) return;

  state.currentLevel = challenge.id;
  state.hintsRevealed = [];
  state.queryExecuted = false;
  state.lastValidationFeedback = null;
  state.hintRequestInFlight = false;
  state.activeHintRequestToken = null;
  document.dispatchEvent(new CustomEvent('mission-changed'));
  const btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.hidden = true;

  renderBugChallenge(challenge);
  renderBugHints(challenge, state.hintsRevealed);
  renderBugProgress(challenges, challenge.id, state.completedLevels, state.levelProgress);
  renderEvidence(state.evidence, challenges, state.completedLevels);
  renderScore(state.score, calculateTotalStars(state.levelProgress), calculateMaxStars(challenges.length));
  renderHeaderProgress(state.completedLevels.length, challenges.length);
  renderBugEvidence(challenges, state.completedLevels);
  renderBugRail(challenges, challenge.id, state.completedLevels, (id) => loadMission(id));

  configureSidebarTabs({
    graph: false,
    timeline: false,
    suspects: false,
    lesson: false,
  });

  const completedChallenge = state.completedLevels.includes(challenge.id);
  enableEditorButtons(!completedChallenge);
  enableHintButton(!completedChallenge);
  setHintButtonLoading(false);
  setMissionStatus(`Relatório ${challenge.number}: ${challenge.title}`);

  const editorHelp = document.getElementById('editor-help');
  if (editorHelp) {
    editorHelp.textContent = challenge.executionMode === 'ddl'
      ? 'Aponte o gargalo e aplique a correção de performance no banco.'
      : 'Corrija a query e execute para gerar o resultado esperado.';
  }

  // O editor inicia com a query quebrada para o jogador auditar
  setEditorValue(challenge.buggyQuery);
  setResults(completedChallenge
    ? '<p class="placeholder-text">Relatório já corrigido e validado. Avance para o próximo relatório ou experimente no banco.</p>'
    : '<p class="placeholder-text">Esta é a query quebrada. Execute para ver o erro e corrija no editor.</p>');

  renderFromState();
  persistState();
}

/**
 * Renderiza o briefing do desafio Bug Hunter no painel esquerdo.
 * @param {object} challenge dados do desafio
 */
function renderBugChallenge(challenge) {

  const bugTypeClass = {
    sintaxe: 'bug-type-syntax',
    logica: 'bug-type-logic',
    performance: 'bug-type-performance',
    'logica+performance': 'bug-type-mixed',
  }[challenge.bugType] || 'bug-type-logic';
  const bugTypeLabel = {
    sintaxe: 'ERRO DE SINTAXE',
    logica: 'ERRO DE LÓGICA',
    performance: 'GARGALO DE PERFORMANCE',
    'logica+performance': 'ERRO + PERFORMANCE',
  }[challenge.bugType] || 'BUG SQL';

  const completed = state.completedLevels.includes(challenge.id);

  let html = `
    <div class="mission-briefing bug-hunter-briefing">
      <div class="bug-header-row">
        <span class="pill-badge concept-tag">${escapeHtml(challenge.concept)}</span>
        <span class="pill-badge bug-type-badge ${bugTypeClass}">${escapeHtml(bugTypeLabel)}</span>
      </div>
      <h2 class="mission-title">${escapeHtml(challenge.title)}</h2>
      <p class="mission-briefing-text">${escapeHtml(challenge.context)}</p>
      <div class="bug-list-section">
        <strong>BUGS CONHECIDOS A INVESTIGAR</strong>
        <ul class="bug-list">
          ${challenge.bugs.map((bug, idx) => `<li><span class="bug-number">#${idx + 1}</span> ${escapeHtml(bug)}</li>`).join('')}
        </ul>
      </div>
      <div class="bug-query-box">
        <div class="bug-query-topbar">
          <span class="sql-editor-dot bug-dot"></span>
          <span class="sql-editor-topbar-label">RELATORIO_QUEBRADO.SQL</span>
        </div>
        <pre class="bug-query-code"><code>${escapeHtml(challenge.buggyQuery)}</code></pre>
      </div>
      <div class="mission-objective">
        <strong>MISSÃO</strong>
        <p>${escapeHtml(challenge.objective)}</p>
      </div>
      <div class="mission-tables">
        <strong>TABELAS EM ESCOPO</strong>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
          ${challenge.tables.map(t => `<code>${escapeHtml(t)}</code>`).join('')}
        </div>
      </div>
  `;

  if (completed) {
    html += `<div class="mission-lesson-link"><span class="pill-badge" style="border-color: rgba(34,197,94,.4); color: #4ADE80; background: rgba(34,197,94,.08);">✓ RELATÓRIO CORRIGIDO</span></div>`;
  }

  html += '</div>';
  setBriefing(html);
}

function restoreProgress() {
  const saved = loadState();
  state.progressByCase = saved.progressByCase || { case001: saved };
  // Gameplay: restaura o estado das batalhas de boss por caso (fonte de verdade: nível superior do LS).
  state.bossByCase = saved.bossByCase || {};
  // NOTE: activateCaseProgress copia progress.bossFight para state.bossByCase;
  // o estado de nível superior é aplicado DEPOIS para prevalecer sobre o espelho antigo.
  activateCaseProgress(saved.currentCase || 'case001');
  state.bossByCase = saved.bossByCase || {};
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

    // Navegação pelo rail do Boss Fight: cada step do rail carrega a etapa correspondente.
    const railContainer = document.getElementById('rail-buttons-container');
    if (railContainer) {
      railContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-boss-step]');
        if (!btn || btn.disabled) return;
        if (isBossFightMode()) {
          loadMission(btn.dataset.bossStep);
        }
      });
    }

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

    if (isBugHunterMode()) {
      // Desafios Bug Hunter usam ids de string ('bug-1' .. 'bug-N'), em sequência.
      const challenges = activeCase.BUG_CHALLENGES || [];
      const completed = new Set(state.completedLevels);
      const firstIncomplete = challenges.find(challenge => !completed.has(challenge.id));
      const savedChallenge = challenges.find(challenge => challenge.id === levelToLoad);
      if (!savedChallenge || completed.has(savedChallenge.id) || !firstIncomplete) {
        levelToLoad = (firstIncomplete || challenges[challenges.length - 1]).id;
      }
    } else if (isSchemaBuilderMode()) {
      // Desafios Construtor de Schema usam ids numéricos (1..N), em sequência.
      const challenges = activeCase.SCHEMA_CHALLENGES || [];
      const completed = new Set(state.completedLevels);
      const firstIncomplete = challenges.find(challenge => !completed.has(challenge.id));
      const savedChallenge = challenges.find(challenge => challenge.id === levelToLoad);
      if (!savedChallenge || completed.has(savedChallenge.id) || !firstIncomplete) {
        levelToLoad = (firstIncomplete || challenges[challenges.length - 1]).id;
      }
    } else {
      const bossBattle = getBattle(state.currentCase);
      const bossState = normalizeBossState(state.bossByCase[state.currentCase]);
      if (isBossStepId(levelToLoad)) {
        // Retomada de batalha de boss em andamento: restaura o step ativo.
        if (bossBattle && bossState.status === 'active' && bossBattle.steps.some(s => s.id === levelToLoad)) {
          // levelToLoad já é o step salvo; nada a ajustar.
        } else if (bossBattle && bossState.status === 'active') {
          levelToLoad = getActiveStep(bossBattle, bossState)?.id || null;
        } else {
          levelToLoad = null;
        }
      } else if (bossBattle && bossState.status === 'active') {
        // Caso salvo em missão normal, mas com batalha ativa: se todas as missões
        // já foram concluídas, retoma a batalha do boss; senão mantém a missão normal.
        const allDone = state.completedLevels.length >= totalLevels;
        if (allDone) {
          levelToLoad = getActiveStep(bossBattle, bossState)?.id || null;
        } else {
          levelToLoad = null;
          for (let i = 1; i <= totalLevels; i++) {
            if (!state.completedLevels.includes(i)) {
              levelToLoad = i;
              break;
            }
          }
          if (!levelToLoad) levelToLoad = totalLevels;
        }
      }
      if (!isBossStepId(levelToLoad)) {
        // Nivel salvo inválido (null, fora do intervalo ou tipo inesperado) volta à primeira missão pendente.
        const invalidSavedLevel = !levelToLoad || !Number.isInteger(levelToLoad) || levelToLoad < 1 || levelToLoad > totalLevels;
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
      }
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
  const btnAiReview = document.getElementById('btn-ai-review');
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
    btnRun.addEventListener('click', async () => {
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
      // --- Boss Fight: validação de step contra o banco do caso ---
      if (isBossFightMode()) {
        try {
        const battle = getActiveBossBattle();
        const bossState = normalizeBossState(state.bossByCase[state.currentCase] || {});
        const step = getActiveStep(battle, bossState);
        if (!step) { setResults('<div class="feedback feedback-error">Batalha encerrada. Retorne às missões.</div>'); return; }

        const { feedback, state: updatedBoss } = validateBossStep(sql, step, db, bossState);
        state.bossByCase[state.currentCase] = updatedBoss;
        persistState();

        if (feedback.result) renderResults(feedback.result);
        renderBossFeedback(feedback);

        state.lastValidationFeedback = {
          type: feedback.type,
          message: feedback.message,
          missingConcepts: feedback.missingConcepts || undefined,
          missingColumns: feedback.missingColumns || undefined,
        };

        if (feedback.type === FEEDBACK_CORRECT) {
          const withStep = completeStep(updatedBoss, step);
          state.bossByCase[state.currentCase] = withStep;

          if (step.executionMode === 'create_view' || step.executionMode === 'ddl') {
            setSchema(getSchemaText());
          }

          if (isBattleWon(battle, withStep)) {
            const elapsed = bossElapsedMs(battle, withStep);
            const won = winBattle(battle, withStep, elapsed);
            state.bossByCase[state.currentCase] = won;
            state.score += won.scoreAwarded;
            state.bossByCase[state.currentCase] = won;
            persistState();
            renderScore(state.score, calculateTotalStars(state.levelProgress), calculateMaxStars(activeCase.getTotalLevels()));
            playSuccessSound();
            enableEditorButtons(false);
            const help = document.getElementById('editor-help');
            if (help) help.textContent = 'Batalha vencida! O bônus foi registrado no placar.';
            showBossVictoryModal(battle, {
              elapsedMs: elapsed,
              attempts: won.executionAttempts,
              sqlErrors: won.sqlErrors,
              score: won.scoreAwarded,
              stars: computeBossStars(won.sqlErrors),
            });
            return;
          }

          persistState();
          const nextStep = getActiveStep(battle, withStep);
          if (nextStep) {
            loadMission(nextStep.id);
          } else {
            loadBossFight(step.id);
          }
          startBossTimer();
          return;
        }

        if (feedback.type === FEEDBACK_SQL_ERROR) {
          playAlertSound();
        } else {
          playTypingSound();
        }
        updateBossTimerReadout(bossElapsedMs(battle, updatedBoss));
        return;
        } catch (err) { console.error('Erro ao validar etapa do Boss Fight:', err); }
      }

      // --- Modo Bug Hunter: validação de correção de bugs ---
      if (isBugHunterMode()) {
        const challenge = getActiveBugChallenge();
        if (!challenge) { setResults('<div class="feedback feedback-error">Nenhum desafio ativo.</div>'); return; }

        const feedback = validateBugChallenge(sql, challenge, db);

        if (feedback.result) {
          renderResults(feedback.result);
        }
        renderBugFeedback(feedback);

        state.lastValidationFeedback = {
          type: feedback.type,
          message: feedback.message,
          missingConcepts: feedback.missingConcepts || undefined,
          missingColumns: feedback.missingColumns || undefined,
        };

        if (feedback.type === BH_FEEDBACK_CORRECT) {
          const hintsUsed = state.hintsRevealed.length;
          const stars = calculateStars(hintsUsed);

          const result = updateLevelProgress(state.levelProgress, state.currentLevel, stars, hintsUsed);
          state.levelProgress = result.levelProgress;
          if (result.updated) recalculateScore();

          if (!state.completedLevels.includes(state.currentLevel)) {
            state.completedLevels.push(state.currentLevel);
          }

          if (!state.evidence.includes(challenge.evidence)) {
            state.evidence.push(challenge.evidence);
            playAlertSound();
          } else {
            playSuccessSound();
          }

          if (challenge.executionMode === 'ddl' && /^\s*CREATE\b/i.test(sql)) {
            setSchema(getSchemaText());
          }

          renderBugEvidence(activeCase.BUG_CHALLENGES, state.completedLevels);
          renderBugProgress(activeCase.BUG_CHALLENGES, challenge.id, state.completedLevels, state.levelProgress);
          renderScore(state.score, calculateTotalStars(state.levelProgress), calculateMaxStars(activeCase.BUG_CHALLENGES.length));
          renderHeaderProgress(state.completedLevels.length, activeCase.BUG_CHALLENGES.length);
          renderBugRail(activeCase.BUG_CHALLENGES, state.currentLevel, state.completedLevels, (id) => loadMission(id));

          if (challenge.executionMode === 'ddl') {
            enableEditorButtons(false);
            const currentEditorHelp = document.getElementById('editor-help');
            if (currentEditorHelp) currentEditorHelp.textContent = 'Correção aplicada e validada. Avance para o próximo relatório.';
          }

          const nextChallenge = (activeCase.BUG_CHALLENGES || [])
            .find(ch => Number(ch.number) === Number(challenge.number) + 1);
          if (nextChallenge && !state.completedLevels.includes(nextChallenge.id)) {
            const btnNextEl = document.getElementById('btn-next');
            if (btnNextEl) btnNextEl.hidden = false;
          }

          persistState();

          if (state.completedLevels.length >= (activeCase.BUG_CHALLENGES || []).length) {
            state.completedAt = state.completedAt || new Date().toISOString();
            persistState();
            setTimeout(() => showActiveCaseConclusion(activeCase), 500);
          }
        }
        return;
      }

      // --- Modo Construtor de Schema: validação do modelo de dados ---
      if (isSchemaBuilderMode()) {
        const challenge = getActiveSchemaChallenge();
        if (!challenge) { setResults('<div class="feedback feedback-error">Nenhum desafio ativo.</div>'); return; }

        // 1. Bloqueia comandos proibidos ANTES de tocar no banco ou persistir
        // qualquer coisa. Sem isso o comando roda, entra no modelo salvo e trava
        // o desafio: toda validação seguinte reencontra a palavra proibida no
        // DDL acumulado e devolve "bloqueado" para sempre.
        const forbidden = findForbiddenKeyword(sql);
        if (forbidden) {
          const blockedFeedback = {
            type: SB_FEEDBACK_BLOCKED,
            message: `Comando "${forbidden}" não é permitido neste modo. Aqui você apenas cria tabelas (CREATE TABLE) e consulta.`,
          };
          renderSchemaFeedback(blockedFeedback);
          state.lastValidationFeedback = blockedFeedback;
          return;
        }

        // 2. O modelo acumulado é a fonte da verdade. Um CREATE TABLE para uma
        // tabela já presente substitui a definição anterior, o que permite ao
        // jogador corrigir um erro sem recomeçar o desafio.
        const mergedStatements = mergeSchemaStatements(state.schemaBuilderDdl[challenge.id], sql);
        const updatedDdl = mergedStatements.join('\n');

        // 3. Recria o banco vazio e aplica o modelo inteiro do zero. Sem isso, as
        // instruções já aplicadas em execuções anteriores voltariam a rodar e
        // falhariam com "table X already exists" já na segunda execução.
        await initDB('schema-builder', { force: true });
        const schemaDb = getDB();
        if (!schemaDb) { setResults('<div class="feedback feedback-error">Banco não carregado.</div>'); return; }

        const { errors } = executeMultipleStatements(updatedDdl, schemaDb);
        if (errors.length > 0) {
          renderSchemaFeedback({
            type: 'sql_error',
            message: `Erro na execução: ${errors[0].message}`,
          });
          state.lastValidationFeedback = { type: 'sql_error', message: errors[0].message };
          // Modelo com erro não é persistido: o jogador corrige e roda de novo.
          return;
        }

        // Só CREATE TABLE entra no modelo. O que sobra (uma consulta, ou um
        // CREATE TABLE escrito errado) precisa rodar mesmo assim — caso contrário
        // uma instrução inválida seria descartada em silêncio e o jogador veria
        // "modelo validado" sem que o que ele digitou tivesse efeito algum.
        const extraStatements = splitStatements(sql).filter(item => getCreatedTableName(item) === null);
        if (extraStatements.length > 0) {
          const extra = executeMultipleStatements(extraStatements.join('\n'), schemaDb);
          if (extra.errors.length > 0) {
            renderSchemaFeedback({
              type: 'sql_error',
              message: `Erro na execução: ${extra.errors[0].message}`,
            });
            state.lastValidationFeedback = { type: 'sql_error', message: extra.errors[0].message };
            return;
          }
        }

        // 4. Só agora o modelo válido é persistido e devolvido ao editor.
        state.schemaBuilderDdl[challenge.id] = mergedStatements;
        persistState();
        setEditorValue(updatedDdl);
        renderSchemaChallenge(challenge, updatedDdl, state.completedLevels, getCreatedTableNames(updatedDdl));
        setSchema(getSchemaText());
        // O banco já contém o modelo aplicado acima; validar por introspecção.
        const feedback = validateSchemaChallenge(updatedDdl, challenge, schemaDb, { applyDdl: false });
        renderSchemaFeedback(feedback);
        state.lastValidationFeedback = {
          type: feedback.type,
          message: feedback.message,
        };

        if (feedback.type === SB_FEEDBACK_CORRECT) {
          const hintsUsed = state.hintsRevealed.length;
          const stars = calculateStars(hintsUsed);

          const result = updateLevelProgress(state.levelProgress, challenge.id, stars, hintsUsed);
          state.levelProgress = result.levelProgress;
          if (result.updated) recalculateScore();

          if (!state.completedLevels.includes(challenge.id)) {
            state.completedLevels.push(challenge.id);
          }

          if (!state.evidence.includes(challenge.evidence)) {
            state.evidence.push(challenge.evidence);
            playAlertSound();
          } else {
            playSuccessSound();
          }

          setSchema(getSchemaText());
          enableEditorButtons(false);
          const currentEditorHelp = document.getElementById('editor-help');
          if (currentEditorHelp) currentEditorHelp.textContent = 'Modelo validado pela IA arquiteta local. Avance para o próximo desafio.';

          renderSchemaEvidence(activeCase.SCHEMA_CHALLENGES, state.completedLevels);
          renderSchemaProgress(activeCase.SCHEMA_CHALLENGES, challenge.id, state.completedLevels, state.levelProgress);
          renderScore(state.score, calculateTotalStars(state.levelProgress), calculateMaxStars(activeCase.SCHEMA_CHALLENGES.length));
          renderHeaderProgress(state.completedLevels.length, activeCase.SCHEMA_CHALLENGES.length);
          renderSchemaRail(activeCase.SCHEMA_CHALLENGES, state.currentLevel, state.completedLevels, (id) => loadMission(id));

          const nextChallenge = (activeCase.SCHEMA_CHALLENGES || [])
            .find(ch => Number(ch.number) === Number(challenge.number) + 1);
          if (nextChallenge && !state.completedLevels.includes(nextChallenge.id)) {
            const btnNextEl = document.getElementById('btn-next');
            if (btnNextEl) btnNextEl.hidden = false;
          }

          persistState();

          if (state.completedLevels.length >= (activeCase.SCHEMA_CHALLENGES || []).length) {
            state.completedAt = state.completedAt || new Date().toISOString();
            persistState();
            setTimeout(() => showActiveCaseConclusion(activeCase), 500);
          }
        } else {
          // Mesmo em feedback negativo, o banco continua com o DDL aplicado para o jogador continuar.
          try { renderSchemaDetailed(schemaDb); } catch { /* banco pode estar vazio */ }
          persistState();
        }
        return;
      }

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
              offerOrConclude(activeCase);
            }
          } else {
            offerOrConclude(activeCase);
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
      if (state.hintRequestInFlight) return;
      const activeCase = getActiveCase();

      // --- Boss Fight: sem dicas. O botão é bloqueado na UI e o fluxo é abortado aqui. ---
      if (isBossFightMode()) return;

      // --- Modo Bug Hunter: revelação progressiva dos bugs (sem IA) ---
      if (isBugHunterMode()) {
        const challenge = getActiveBugChallenge();
        if (!challenge) return;
        const availableHints = challenge.hints || challenge.hintBugs || [];
        if (state.hintsRevealed.length >= availableHints.length) return;
        state.hintsRevealed.push({ source: 'local', text: availableHints[state.hintsRevealed.length] });
        renderBugHints(challenge, state.hintsRevealed);
        if (state.hintsRevealed.length >= availableHints.length) {
          enableHintButton(false);
        }
        persistState();
        return;
      }

      // --- Modo Construtor de Schema: revelação progressiva das dicas de modelagem ---
      if (isSchemaBuilderMode()) {
        const challenge = getActiveSchemaChallenge();
        if (!challenge) return;
        const availableHints = challenge.hints || [];
        if (state.hintsRevealed.length >= availableHints.length) return;
        state.hintsRevealed.push({ source: 'local', text: availableHints[state.hintsRevealed.length] });
        renderSchemaHints(challenge, state.hintsRevealed);
        if (state.hintsRevealed.length >= availableHints.length) {
          enableHintButton(false);
        }
        persistState();
        return;
      }

      const level = activeCase.getLevel(state.currentLevel);
      if (!level) return;
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

  if (btnAiReview) {
    btnAiReview.addEventListener('click', async () => {
      const challenge = getActiveSchemaChallenge();
      if (!challenge) return;
      if (!isSchemaBuilderMode()) return;
      if (state.hintRequestInFlight) return;

      const requestToken = `schema:${challenge.id}:${Date.now()}`;
      state.activeHintRequestToken = requestToken;
      state.hintRequestInFlight = true;
      setAiReviewButtonLoading(true);

      const abortController = new AbortController();
      const onMissionChange = () => abortController.abort();
      document.addEventListener('mission-changed', onMissionChange, { once: true });

      try {
        const ddl = getActiveSchemaDdl();
        const currentSql = getEditorValue().trim();
        const ctx = buildReviewContext({
          challenge,
          playerDdl: currentSql ? (ddl ? `${ddl}\n${currentSql}` : currentSql) : ddl,
          validationFeedback: state.lastValidationFeedback,
        });

        const result = await requestAiSchemaReview(ctx, { signal: abortController.signal });

        if (state.activeHintRequestToken !== requestToken) return;

        if (result.ok && result.review) {
          state.hintsRevealed.push({ source: 'ai-architect', text: result.review });
          renderSchemaHints(challenge, state.hintsRevealed);
          showHintFallbackNotice('Revisão da IA arquiteta registrada na aba de dicas.');
          persistState();
        } else {
          const code = result.error?.code || 'UNKNOWN';
          if (code === 'TIMEOUT') {
            showHintFallbackNotice('Tempo esgotado ao contatar a IA arquiteta. Tente novamente.');
          } else if (code === 'RATE_LIMITED') {
            showHintFallbackNotice('Muitas consultas à IA em pouco tempo. Aguarde um minuto e tente novamente.');
          } else if (code === 'NETWORK_ERROR' || code === 'NO_FETCH') {
            showHintFallbackNotice('IA arquiteta indisponível. Use as dicas locais de modelagem.');
          } else {
            showHintFallbackNotice('A IA arquiteta não pôde revisar agora. Use as dicas locais de modelagem.');
          }
        }
      } catch {
        if (state.activeHintRequestToken !== requestToken) return;
        showHintFallbackNotice('IA arquiteta indisponível. Use as dicas locais de modelagem.');
      } finally {
        document.removeEventListener('mission-changed', onMissionChange);
        if (state.activeHintRequestToken === requestToken) {
          state.hintRequestInFlight = false;
          state.activeHintRequestToken = null;
          setAiReviewButtonLoading(false);
        }
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      const activeCase = getActiveCase();
      if (isBossFightMode()) {
        const battle = getActiveBossBattle();
        if (!battle) return;
        const bossState = normalizeBossState(state.bossByCase[state.currentCase] || {});
        const activeStep = getActiveStep(battle, bossState);
        if (!activeStep) return;
        // Marca o step atual como concluído manualmente? Não: a conclusão ocorre
        // somente via validação. O btn-next aqui apenas avança para o step ativo
        // quando a validação o liberou (hidden/show controlado por loadBossFight).
        loadMission(activeStep.id);
        const btnNextEl = document.getElementById('btn-next');
        if (btnNextEl) btnNextEl.hidden = true;
        return;
      }
      if (isBugHunterMode()) {
        const challenge = getActiveBugChallenge();
        if (!challenge) return;
        const nextChallenge = (activeCase.BUG_CHALLENGES || []).find(ch => Number(ch.number) === Number(challenge.number) + 1);
        if (nextChallenge && !state.completedLevels.includes(nextChallenge.id)) {
          loadMission(nextChallenge.id);
          const btnNextEl = document.getElementById('btn-next');
          if (btnNextEl) btnNextEl.hidden = true;
        }
        return;
      }
      if (isSchemaBuilderMode()) {
        const challenge = getActiveSchemaChallenge();
        if (!challenge) return;
        const nextChallenge = (activeCase.SCHEMA_CHALLENGES || []).find(ch => Number(ch.number) === Number(challenge.number) + 1);
        if (nextChallenge && !state.completedLevels.includes(nextChallenge.id)) {
          loadMission(nextChallenge.id);
          const btnNextEl = document.getElementById('btn-next');
          if (btnNextEl) btnNextEl.hidden = true;
        }
        return;
      }
      const nextLevel = state.currentLevel + 1;
      if (nextLevel <= activeCase.getTotalLevels()) {
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
          offerOrConclude(activeCase);
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
    loadBossFight,
    startBossTimer,
    offerOrConclude,
    isBossFightMode,
    getActiveBossBattle,
    getBossTimerHandle: () => bossTimerHandle,
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
