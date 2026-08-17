/**
 * state.js — Estado global da aplicação SQL Detective.
 *
 * Objeto singleton importado pelos módulos que precisam ler ou
 * modificar o estado do jogo. Fase 1: apenas estrutura mínima.
 */

export const state = {
  /** @type {string} caso ativo */
  currentCase: 'case001',

  /** @type {Object<string, object>} progresso isolado por caso */
  progressByCase: { case001: createCaseProgress() },
  /** @type {boolean} banco carregado e pronto */
  dbReady: false,

  /** @type {string|null} erro global, se houver */
  error: null,

  /** @type {number|null} nível/missão atual (1-12) */
  currentLevel: null,

  /** @type {number[]} níveis concluídos */
  completedLevels: [],

  /** @type {Object<number, {stars: number, hintsUsed: number}>} progresso por nível */
  levelProgress: {},

  /** @type {number} pontuação total */
  score: 0,

  /** @type {string[]} evidências desbloqueadas */
  evidence: [],

  /** @type {string[]} dicas já reveladas na missão atual */
  hintsRevealed: [],

  /** @type {boolean} modo sandbox ativo */
  sandboxMode: false,

  /** @type {number|null} nível salvo antes de entrar no sandbox */
  savedLevel: null,

  /** @type {{columns: string[], rows: any[][]}|null} último resultado */
  lastResult: null,

  /** @type {boolean} uma query foi executada */
  queryExecuted: false,

  /** @type {{type: string, message: string, missingConcepts?: string[], missingColumns?: string[]}|null} último feedback do validador */
  lastValidationFeedback: null,

  /** @type {boolean} requisição de dica de IA em andamento */
  hintRequestInFlight: false,

  /** @type {string|null} token da requisição de dica ativa (caso:missão:timestamp) */
  activeHintRequestToken: null,

  /** @type {string[]} ordem escolhida pelo jogador para a linha do tempo */
  timelineOrder: [],

  /** @type {boolean} se o bônus da timeline já foi concedido */
  timelineBonusAwarded: false,

  /** @type {number} pontos de bônus acumulados */
  bonusPoints: 0,

  /** @type {{status: string, stepIndex: number, presentedEvidenceIds: string[]}} estado do interrogatório */
  interrogation: { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] },

  /** @type {string[]} ids de itens de curso já lidos */
  lessonsRead: [],

  /** @type {string|null} instante ISO em que o caso foi concluído */
  completedAt: null,
};

/**
 * Reseta o estado para os valores iniciais.
 * Usado por storage.js ao reiniciar o progresso.
 */
export function resetState() {
  state.currentCase = 'case001';
  state.progressByCase = { case001: createCaseProgress() };
  state.dbReady = false;
  state.error = null;
  state.currentLevel = null;
  state.completedLevels = [];
  state.levelProgress = {};
  state.score = 0;
  state.evidence = [];
  state.hintsRevealed = [];
  state.sandboxMode = false;
  state.savedLevel = null;
  state.lastResult = null;
  state.queryExecuted = false;
  state.lastValidationFeedback = null;
  state.hintRequestInFlight = false;
  state.activeHintRequestToken = null;
  state.timelineOrder = [];
  state.timelineBonusAwarded = false;
  state.bonusPoints = 0;
  state.interrogation = { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] };
  state.lessonsRead = [];
  state.completedAt = null;
}

/** Cria a estrutura de progresso de um caso ainda não iniciado. */
export function createCaseProgress() {
  return {
    currentLevel: null, completedLevels: [], levelProgress: {}, score: 0, evidence: [],
    timelineOrder: [], timelineBonusAwarded: false, bonusPoints: 0,
    interrogation: { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] },
    lessonsRead: [],
    completedAt: null,
  };
}

/** Copia o progresso do caso ativo para os campos usados pela UI legado. */
export function activateCaseProgress(caseId) {
  const progress = state.progressByCase[caseId] || createCaseProgress();
  state.currentCase = caseId;
  state.progressByCase[caseId] = progress;
  state.currentLevel = progress.currentLevel;
  state.completedLevels = [...progress.completedLevels];
  state.levelProgress = { ...progress.levelProgress };
  state.score = progress.score;
  state.evidence = [...progress.evidence];
  state.timelineOrder = [...(progress.timelineOrder || [])];
  state.timelineBonusAwarded = progress.timelineBonusAwarded || false;
  state.bonusPoints = progress.bonusPoints || 0;
  state.interrogation = progress.interrogation
    ? { ...progress.interrogation, presentedEvidenceIds: [...(progress.interrogation.presentedEvidenceIds || [])] }
    : { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] };
  state.lessonsRead = [...(progress.lessonsRead || [])];
  state.completedAt = progress.completedAt || null;
}

/** Persiste os campos ativos no mapa de progresso por caso. */
export function syncActiveCaseProgress() {
  state.progressByCase[state.currentCase] = {
    currentLevel: state.currentLevel,
    completedLevels: [...state.completedLevels],
    levelProgress: { ...state.levelProgress },
    score: state.score,
    evidence: [...state.evidence],
    timelineOrder: [...(state.timelineOrder || [])],
    timelineBonusAwarded: state.timelineBonusAwarded || false,
    bonusPoints: state.bonusPoints || 0,
    interrogation: state.interrogation
      ? { ...state.interrogation, presentedEvidenceIds: [...(state.interrogation.presentedEvidenceIds || [])] }
      : { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] },
    lessonsRead: [...(state.lessonsRead || [])],
    completedAt: state.completedAt || null,
  };
}
