/**
 * app.js — Ponto de entrada do SQL Detective.
 *
 * Fase 5: pontuação, dicas e persistência.
 * - Carrega progresso salvo do localStorage no início
 * - Calcula estrelas ao acertar (3 sem dicas, 2 com 1, 1 com 2+)
 * - Preserva a melhor pontuação de cada nível
 * - Salva após cada ação importante
 * - Botão de reiniciar progresso com confirmação
 */

import { state, resetState, activateCaseProgress, syncActiveCaseProgress, createCaseProgress } from './state.js';
import { initDB, getSchemaText, getDB, getSchemaDetailed } from './db.js';
import { executeQuery } from './executor.js';
import { getAllCases, getCaseById, isCaseAvailable, isCaseComplete, getInvestigations, getProjects } from './case-manager.js';
import { validateLevel, FEEDBACK_CORRECT, FEEDBACK_WRONG_RESULT, FEEDBACK_MISSING_CONCEPT, FEEDBACK_SQL_ERROR, FEEDBACK_MISSING_COLUMNS, FEEDBACK_BLOCKED } from './validator.js';
import { calculateStars, calculateScore, calculateTotalScore, calculateTotalStars, calculateMaxStars, updateLevelProgress } from './scoring.js';
import { saveState, loadState, clearState } from './storage.js';
import {
  initDOM,
  hideLoading,
  showGlobalError,
  hideGlobalError,
  setDbStatus,
  setMissionStatus,
  setBriefing,
  setSchema,
  setResults,
  renderResults,
  getEditorValue,
  setEditorValue,
  clearEditor,
  enableEditorButtons,
  setProgress,
  setHints,
  setEvidence,
  showTabs,
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
} from './ui.js';
import { renderERDiagram } from './er-diagram.js';
import { getCourseContentByLevel, getCourseContentById } from './course-content.js';
import { buildHintContext, requestAiHint } from './ai-hints.js';
import { getUnlockedEvents, normalizeOrder, moveEvent, validateOrder, checkTimelineBonus } from './timeline.js';
import { deriveSuspicion, getSuspectProfiles } from './suspect-meter.js';
import { isInterrogationAvailable, startInterrogation, presentEvidence, normalizeInterrogationState } from './interrogation.js';
import { initSfx, setSfxEnabled, isSfxEnabled, playTypingSound, playAlertSound, playSuccessSound } from './sfx.js';

function getActiveCase() {
  return getCaseById(state.currentCase) || getCaseById('case001');
}

function configureIntro(caseDefinition) {
  const intro = caseDefinition.CASE_INTRO;
  const isProject = caseDefinition.type === 'project';
  const scenarioLabel = isProject ? 'Projeto' : 'Caso';
  const title = document.querySelector('.intro-subtitle');
  const story = document.querySelector('.intro-story');
  const mission = document.querySelector('.intro-mission');
  const appSubtitle = document.querySelector('.app-subtitle');
  const btnStart = document.getElementById('btn-start');
  const briefingTitle = document.getElementById('briefing-panel-title');
  const editorTitle = document.getElementById('editor-panel-title');
  const briefingTab = document.getElementById('briefing-tab-label');
  const erDescription = document.getElementById('er-description');
  if (title) title.textContent = intro.title;
  if (story) story.textContent = intro.story;
  if (mission) mission.textContent = intro.mission;
  if (appSubtitle) appSubtitle.textContent = `${intro.subtitle} — ${intro.title}`;
  if (btnStart) btnStart.textContent = isProject ? 'Iniciar projeto' : 'Iniciar investigação';
  if (briefingTitle) briefingTitle.textContent = scenarioLabel;
  if (editorTitle) editorTitle.textContent = isProject ? 'Análise SQL' : 'Investigação';
  if (briefingTab) briefingTab.textContent = scenarioLabel;
  if (erDescription) {
    erDescription.textContent = `Tabelas, colunas e relações do banco de dados ${isProject ? 'do projeto' : 'da investigação'}.`;
  }
}

/**
 * Exibe a Etapa 0 com o desenho do banco e os checkpoints conceituais do caso.
 * Retorna false quando o caso não fornece essa configuração.
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
        <h3>${escapeHtml(entity.name)}</h3>
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
        <summary>Missão conceitual ${index + 1}: ${escapeHtml(checkpoint.question)}</summary>
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
  renderCaseSelection();
}

function hideCaseSelection() {
  const screen = document.getElementById('case-select-screen');
  if (screen) screen.classList.add('hidden');
}

function renderCaseCard(caseDefinition) {
  const available = isCaseAvailable(caseDefinition.id, state.progressByCase);
  const completed = isCaseComplete(caseDefinition, state.progressByCase);
  const status = completed ? 'Concluído' : available ? 'Disponível' : 'Bloqueado';
  const disabled = available ? '' : 'disabled';
  const tag = caseDefinition.type === 'project'
    ? `PROJETO #${caseDefinition.number}`
    : `CASO #${caseDefinition.number}`;
  const isProject = caseDefinition.type === 'project';
  return `<button type="button" class="case-card ${isProject ? 'project-card' : ''} ${available ? '' : 'case-card-locked'}" data-case-id="${caseDefinition.id}" ${disabled}>
    <span class="case-icon">${caseDefinition.icon}</span><span class="case-number">${tag}</span>
    <strong>${escapeHtml(caseDefinition.title)}</strong><span>${escapeHtml(caseDefinition.description)}</span><em>${status}</em>
  </button>`;
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
      if (projectSection) projectSection.hidden = false;
    } else {
      if (projectSection) projectSection.hidden = true;
    }
  }

  const screen = document.getElementById('case-select-screen');
  if (screen) {
    screen.querySelectorAll('[data-case-id]').forEach(button => {
      button.addEventListener('click', () => selectCase(button.dataset.caseId));
    });
  }
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
  });
}

/** Recalcula a pontuacao sem perder bonus ja concedidos. */
function recalculateScore() {
  state.score = calculateTotalScore(state.levelProgress, state.bonusPoints);
  return state.score;
}

/** Recria views de missões já concluídas depois que o banco em memória é recarregado. */
function restoreCompletedMissionViews(caseDefinition, db, completedLevels = state.completedLevels) {
  if (!caseDefinition || !db || !Array.isArray(completedLevels)) return [];

  const completed = new Set(completedLevels);
  const restored = [];
  for (const level of caseDefinition.LEVELS || []) {
    if (level.executionMode !== 'create_view' || !completed.has(level.id)) continue;

    const result = executeQuery(level.referenceQuery, db, { allowCreateView: true });
    if (result.type === 'empty') {
      restored.push(level.viewName);
    } else {
      console.warn(`Não foi possível restaurar a view ${level.viewName}: ${result.message}`);
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
  const level = activeCase.getLevel(levelId);
  if (!level) return;

  state.currentLevel = levelId;
  state.hintsRevealed = [];
  state.queryExecuted = false;
  state.lastValidationFeedback = null;
  state.hintRequestInFlight = false;
  state.activeHintRequestToken = null;
  // Notifica handlers que podem abortar requisições em voo
  document.dispatchEvent(new CustomEvent('mission-changed'));
  const btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.hidden = true;

  const courseItems = level.courseRefs
    ? level.courseRefs.map(ref => getCourseContentById(ref)).filter(Boolean)
    : [];
  renderMission(level, courseItems);
  renderHints(level, state.hintsRevealed);
  renderProgress(activeCase.LEVELS, state.completedLevels, state.levelProgress);
  renderEvidence(state.evidence);
  renderScore(state.score, calculateTotalStars(state.levelProgress), calculateMaxStars(activeCase.getTotalLevels()));

  // Renderiza timeline, medidor e interrogatório apenas se o caso tem gameplay
  if (activeCase.GAMEPLAY?.timeline) {
    state.timelineOrder = normalizeOrder(activeCase.GAMEPLAY.timeline, state.completedLevels, state.timelineOrder);
    renderTimeline(activeCase.GAMEPLAY.timeline, state.completedLevels, state.timelineOrder);
  } else {
    renderTimeline(null, state.completedLevels, []);
  }

  if (activeCase.GAMEPLAY?.suspects) {
    renderSuspectMeter(activeCase.GAMEPLAY.suspects, state.completedLevels);
  } else {
    renderSuspectMeter(null, state.completedLevels);
  }

  // Renderiza grafo investigativo, se disponível
  if (activeCase.GAMEPLAY?.graph) {
    const suspicion = deriveSuspicion(activeCase.GAMEPLAY.suspects, state.completedLevels);
    renderGraph(activeCase.GAMEPLAY.graph, state.completedLevels, state.evidence, suspicion);
  } else {
    renderGraph(null, state.completedLevels, state.evidence, 0);
  }

  // Botão "Iniciar interrogatório" para saves com todas as missões concluídas mas interrogatório pendente
  if (activeCase.GAMEPLAY?.finalChallenge) {
    const fc = activeCase.GAMEPLAY.finalChallenge;
    const allDone = state.completedLevels.length >= activeCase.getTotalLevels();
    const interrogationPending = state.interrogation.status !== 'won';
    showStartInterrogationButton(allDone && interrogationPending);
  } else {
    showStartInterrogationButton(false);
  }

  enableHintButton(true);
  setHintButtonLoading(false);
  setMissionStatus(`Missão ${levelId}: ${level.title}`);
  const editorHelp = document.getElementById('editor-help');
  if (editorHelp) {
    editorHelp.textContent = level.executionMode === 'create_view'
      ? `Crie somente a view ${level.viewName}; a prévia será consultada automaticamente.`
      : 'Use SELECT ou WITH para consultar o banco.';
  }
  setEditorValue('');
  setResults('<p class="placeholder-text">Escreva sua query e clique em Executar.</p>');
  renderFromState();

  persistState();
}

/**
 * Restaura o progresso salvo do localStorage para o estado.
 */
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

    restoreProgress();
    configureIntro(getActiveCase());
    showCaseSelection();
    hideLoading();

    // Placeholders
    setEvidence('<p class="placeholder-text">Nenhuma evidência coletada ainda.</p>');

    if (window.innerWidth <= 640) {
      showTabs();
      activatePanel('briefing');
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 640) {
        showTabs();
        if (!document.querySelector('.panel.active')) activatePanel('briefing');
      }
    });

    // Inicializa SFX no primeiro gesto do usuário (Web Audio requer interação)
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

    const btnAnalysisStart = document.getElementById('btn-analysis-start');
    if (btnAnalysisStart) {
      btnAnalysisStart.addEventListener('click', async () => {
        hideDatabaseAnalysis();
        await startGame();
      });
    }

    // Botão fechar modal de conclusão
    const btnConclusionClose = document.getElementById('btn-conclusion-close');
    if (btnConclusionClose) {
      btnConclusionClose.addEventListener('click', () => {
        hideConclusionModal();
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

    // Carrega o banco
    setDbStatus('pending', 'Banco: carregando…');
    await initDB(state.currentCase, { force: true });

    const db = getDB();
    restoreCompletedMissionViews(getActiveCase(), db);

    const schema = getSchemaText();
    setSchema(schema);
    enableEditorButtons(true);

    console.log('Banco carregado para', state.currentCase);

    // Carrega a missão atual ou a primeira não concluída
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

  // Botão de som
  function updateSoundButtonIcon() {
    if (!btnSound) return;
    btnSound.textContent = isSfxEnabled() ? '🔊' : '🔇';
    btnSound.classList.toggle('muted', !isSfxEnabled());
  }

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
      if (!db) { setResults('<div class="result-error">Banco não carregado.</div>'); return; }

      // Modo Sandbox: executa sem validação de missão
      if (state.sandboxMode) {
        const result = executeQuery(sql, db, { allowDml: state.currentCase === 'case004' });
        renderResults(result);
        return;
      }

      // Modo Missão
      if (!state.currentLevel) { setResults('<div class="result-error">Nenhuma missão ativa.</div>'); return; }

      const activeCase = getActiveCase();
      const level = activeCase.getLevel(state.currentLevel);
      const feedback = validateLevel(sql, level, db);

      if (feedback.result) {
        renderResults(feedback.result);
      }
      renderFeedback(feedback);

      // Guarda o mínimo necessário para tutoria de IA
      state.lastValidationFeedback = {
        type: feedback.type,
        message: feedback.message,
        missingConcepts: feedback.missingConcepts || undefined,
        missingColumns: feedback.missingColumns || undefined,
      };

      // Se correto, calcula estrelas e atualiza progresso
      if (feedback.type === FEEDBACK_CORRECT) {
        const hintsUsed = state.hintsRevealed.length;
        const stars = calculateStars(hintsUsed);
        const score = calculateScore(stars);

        // Atualiza progresso (preserva melhor)
        const result = updateLevelProgress(state.levelProgress, state.currentLevel, stars, hintsUsed);
        state.levelProgress = result.levelProgress;

        // Se atualizou, recalcula score total
        if (result.updated) {
          recalculateScore();
        }

        // Marca como concluído
        if (!state.completedLevels.includes(state.currentLevel)) {
          state.completedLevels.push(state.currentLevel);
        }

        // Adiciona evidência
        if (!state.evidence.includes(level.evidence)) {
          state.evidence.push(level.evidence);
          playAlertSound(); // bipe de evidência importante descoberta
        } else {
          playSuccessSound(); // missão já concluída, som de triunfo ao repetir
        }

        if (level.executionMode === 'create_view') {
          // A view recém-criada passa a aparecer no esquema e no diagrama ER.
          setSchema(getSchemaText());
        }

        // Atualiza UI
        renderEvidence(state.evidence);
        renderProgress(activeCase.LEVELS, state.completedLevels, state.levelProgress);
        renderScore(state.score, calculateTotalStars(state.levelProgress), calculateMaxStars(activeCase.getTotalLevels()));

        // Re-renderiza grafo com novas evidências
        if (activeCase.GAMEPLAY?.graph) {
          const suspicion = deriveSuspicion(activeCase.GAMEPLAY.suspects, state.completedLevels);
          renderGraph(activeCase.GAMEPLAY.graph, state.completedLevels, state.evidence, suspicion);
        }

        // Mostra botão "Próxima missão" se houver próxima
        const nextLevel = state.currentLevel + 1;
        if (nextLevel <= activeCase.getTotalLevels()) {
          const btnNextEl = document.getElementById('btn-next');
          if (btnNextEl) btnNextEl.hidden = false;
        }

        persistState();

        // Normaliza timeline após conclusão de missão (mantém a ordem escolhida,
        // adiciona eventos recém-desbloqueados no fim). O bônus só é avaliado
        // pelo botão "Verificar ordem" e apenas quando todos os eventos estão
        // desbloqueados.
        if (activeCase.GAMEPLAY?.timeline) {
          state.timelineOrder = normalizeOrder(
            activeCase.GAMEPLAY.timeline,
            state.completedLevels,
            state.timelineOrder
          );
          renderTimeline(activeCase.GAMEPLAY.timeline, state.completedLevels, state.timelineOrder);
          persistState();
        }

        // Verifica se todas as missões foram concluídas
        if (state.completedLevels.length >= activeCase.getTotalLevels()) {
          // Caso #001 com interrogatório: inicia o confronto em vez do modal
          if (activeCase.GAMEPLAY?.finalChallenge) {
            const fc = activeCase.GAMEPLAY.finalChallenge;
            const startResult = startInterrogation(fc, state.completedLevels, state.interrogation);
            if (startResult.started) {
              state.interrogation = startResult.state;
              persistState();
              // Abre modal de interrogatório (UI será implementada em H4)
              document.dispatchEvent(new CustomEvent('interrogation-start'));
            } else if (state.interrogation.status === 'won') {
              // Já vencido — mostra conclusão
              const totalStars = calculateTotalStars(state.levelProgress);
              const maxStars = calculateMaxStars(activeCase.getTotalLevels());
              const conclusionBody = `
                <p>${activeCase.CASE_CONCLUSION.story}</p>
                <p><strong>Pontuação final:</strong> ${state.score} pontos</p>
                <p><strong>Estrelas:</strong> ${totalStars}/${maxStars}</p>
                <p>${activeCase.CASE_CONCLUSION.nextSteps}</p>
              `;
              setTimeout(() => {
                showConclusionModal(activeCase.CASE_CONCLUSION.title, conclusionBody);
              }, 500);
            }
          } else {
            // Casos sem interrogatório: fluxo legado
            const totalStars = calculateTotalStars(state.levelProgress);
            const maxStars = calculateMaxStars(activeCase.getTotalLevels());
            const conclusionBody = `
              <p>${activeCase.CASE_CONCLUSION.story}</p>
              <p><strong>Pontuação final:</strong> ${state.score} pontos</p>
              <p><strong>Estrelas:</strong> ${totalStars}/${maxStars}</p>
              <p>${activeCase.CASE_CONCLUSION.nextSteps}</p>
            `;
            setTimeout(() => {
              showConclusionModal(activeCase.CASE_CONCLUSION.title, conclusionBody);
            }, 500);
          }
        }
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      clearEditor();
      setResults('<p class="placeholder-text">Escreva sua query e clique em Executar.</p>');
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
      // Token único para esta requisição: caso + missão + timestamp.
      // Permite descartar respostas tardias mesmo entre trocas de caso.
      // O token completo (com timestamp) é guardado no estado e comparado
      // no finally — assim o finally de A não limpa a flag de B.
      const requestToken = `${state.currentCase}:${state.currentLevel}:${Date.now()}`;
      state.activeHintRequestToken = requestToken;

      // Bloqueia cliques repetidos e mostra estado de carregamento
      state.hintRequestInFlight = true;
      setHintButtonLoading(true);

      // Aborta se a missão/caso mudar enquanto a requisição está em voo
      const abortController = new AbortController();
      const onMissionChange = () => abortController.abort();
      document.addEventListener('mission-changed', onMissionChange, { once: true });

      try {
        // Monta o contexto permitido
        const schema = getSchemaText();
        const studentSql = getEditorValue();
        const ctx = buildHintContext({
          hintIndex,
          mission: level,
          schema,
          studentSql,
          validationFeedback: state.lastValidationFeedback,
        });

        // Faz a chamada same-origin
        const result = await requestAiHint(ctx, { signal: abortController.signal });

        // Descarta se o token ativo mudou (troca de caso/missão ou nova dica)
        if (state.activeHintRequestToken !== requestToken) return;

        if (result.ok && result.hint) {
          state.hintsRevealed.push({ source: 'ollama', text: result.hint });
          renderHints(level, state.hintsRevealed);
        } else {
          // Fallback: revela a próxima dica local
          if (state.hintsRevealed.length < level.hints.length) {
            state.hintsRevealed.push({ source: 'local', text: level.hints[state.hintsRevealed.length] });
            renderHints(level, state.hintsRevealed);
            showHintFallbackNotice('IA indisponível — exibindo dica local.');
          }
        }

        // Desabilita o botão após a terceira dica
        if (state.hintsRevealed.length >= 3) {
          enableHintButton(false);
        }
      } catch {
        // Fallback em caso de erro inesperado
        if (state.activeHintRequestToken !== requestToken) return;
        if (state.hintsRevealed.length < level.hints.length) {
          state.hintsRevealed.push({ source: 'local', text: level.hints[state.hintsRevealed.length] });
          renderHints(level, state.hintsRevealed);
          showHintFallbackNotice('IA indisponível — exibindo dica local.');
        }
        if (state.hintsRevealed.length >= 3) {
          enableHintButton(false);
        }
      } finally {
        document.removeEventListener('mission-changed', onMissionChange);
        // Só limpa flag/botão se esta requisição ainda é a ativa.
        // Se o token mudou (troca de missão ou nova dica), não tocar no estado.
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
      clearState();
      resetState();
      deactivateSandboxMode();
      const help = document.getElementById('editor-help');
      if (help) help.textContent = 'Use SELECT ou WITH para consultar o banco.';
      showResetConfirm(false);
      activateCaseProgress('case001');
      configureIntro(getActiveCase());
      startGame('case001');
      console.log('Progresso reiniciado.');
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
        setResults('<p class="placeholder-text">Use SELECT/WITH ou uma única alteração DML controlada no banco temporário deste caso.</p>');
      }
    });
  }

  if (btnMission) {
    btnMission.addEventListener('click', async () => {
      state.sandboxMode = false;
      deactivateSandboxMode();
      const help = document.getElementById('editor-help');
      if (help) help.textContent = 'Use SELECT ou WITH para consultar o banco.';
      // Recarrega a missão que estava ativa
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

  // Ctrl+Enter no editor executa a query
  if (sqlEditor) {
    let lastTypingSound = 0;
    sqlEditor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btn-run').click();
        return;
      }
      // Som de digitação sutil (throttle 60ms)
      const now = Date.now();
      if (now - lastTypingSound > 60 && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        lastTypingSound = now;
        // Varia levemente a frequência para soar mais orgânico
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

  // --- Diagrama ER (Fase 9) ---
  const btnER = document.getElementById('btn-er');
  const btnERClose = document.getElementById('btn-er-close');
  const erModal = document.getElementById('er-modal');
  const erContent = document.getElementById('er-diagram-content');

  if (btnER) {
    btnER.addEventListener('click', () => {
      if (erContent) {
        renderERDiagram(erContent);
      }
      if (erModal) erModal.hidden = false;
    });
  }

  if (btnERClose) {
    btnERClose.addEventListener('click', () => {
      if (erModal) erModal.hidden = true;
    });
  }

  // Fechar modal ER clicando no overlay
  if (erModal) {
    erModal.addEventListener('click', (e) => {
      if (e.target === erModal) erModal.hidden = true;
    });
  }

  // --- Gameplay: timeline, medidor, interrogatório ---

  // Delega cliques dos botões de mover da timeline
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

  // Botão verificar ordem da timeline
  const btnTimelineCheck = document.getElementById('btn-timeline-check');
  if (btnTimelineCheck) {
    btnTimelineCheck.addEventListener('click', () => {
      const activeCase = getActiveCase();
      if (!activeCase.GAMEPLAY?.timeline) return;

      // Só permite verificação quando todos os eventos da timeline estão desbloqueados
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
        setResults(`<p class="placeholder-text" style="color: var(--color-success)">${escapeHtml(bonusResult.message)}</p>`);
      } else if (bonusResult.allCorrect) {
        setResults('<p class="placeholder-text">Bônus já concedido. Ordem correta!</p>');
      } else {
        setResults('<p class="placeholder-text" style="color: var(--color-warning)">Ordem incorreta. Tente novamente.</p>');
      }
    });
  }

  // Listener para evento de início de interrogatório
  document.addEventListener('interrogation-start', () => {
    const activeCase = getActiveCase();
    if (!activeCase.GAMEPLAY?.finalChallenge) return;
    const fc = activeCase.GAMEPLAY.finalChallenge;
    const unlockedEvidences = getUnlockedEvents(activeCase.GAMEPLAY.timeline, state.completedLevels);
    showInterrogationModal(fc, state.interrogation, unlockedEvidences);
  });

  // Delega cliques nos botões de evidência do interrogatório
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.interrogation-evidence-btn');
    if (!btn) return;
    const activeCase = getActiveCase();
    if (!activeCase.GAMEPLAY?.finalChallenge) return;
    const fc = activeCase.GAMEPLAY.finalChallenge;
    const evidenceId = btn.dataset.evidenceId;
    const result = presentEvidence(fc, state.completedLevels, activeCase.GAMEPLAY.timeline, state.interrogation, evidenceId);
    state.interrogation = result.state;
    persistState();

    if (result.accepted) {
      setInterrogationFeedback(result.message || 'Evidência aceita.', true);
      if (result.completed) {
        // Interrogatório vencido — fecha modal e mostra conclusão
        setTimeout(() => {
          hideInterrogationModal();
          const totalStars = calculateTotalStars(state.levelProgress);
          const maxStars = calculateMaxStars(activeCase.getTotalLevels());
          const conclusionBody = `
            <p>${activeCase.CASE_CONCLUSION.story}</p>
            <p><strong>Pontuação final:</strong> ${state.score} pontos</p>
            <p><strong>Estrelas:</strong> ${totalStars}/${maxStars}</p>
            <p>${activeCase.CASE_CONCLUSION.nextSteps}</p>
          `;
          showConclusionModal(activeCase.CASE_CONCLUSION.title, conclusionBody);
        }, 1500);
      } else {
        // Avança para próxima etapa
        const unlockedEvidences = getUnlockedEvents(activeCase.GAMEPLAY.timeline, state.completedLevels);
        showInterrogationModal(fc, state.interrogation, unlockedEvidences);
      }
    } else {
      setInterrogationFeedback(result.message || 'Evidência incorreta.', false);
    }
  });

  // Botão fechar modal de interrogatório
  const btnInterrogationClose = document.getElementById('btn-interrogation-close');
  if (btnInterrogationClose) {
    btnInterrogationClose.addEventListener('click', () => {
      hideInterrogationModal();
    });
  }

  // Escape fecha modal de interrogatório (mas não se já venceu)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dom_interrogationModal_visible()) {
      hideInterrogationModal();
    }
  });

  // Botão "Iniciar interrogatório" para saves com 12 missões
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

/** Helper para verificar se o modal de interrogatório está visível */
function dom_interrogationModal_visible() {
  const modal = document.getElementById('interrogation-modal');
  return modal && !modal.hidden;
}

// Ponte para testes de integração: expõe funções internas quando solicitado.
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
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
