/**
 * client-real-validator.js — Validação das três fases do modo Cliente Real.
 *
 * Lógica pura (sem DOM/localStorage): valida clarificação (escolha),
 * análise (query via validateLevel do validador comum) e apresentação
 * (relatório via evaluateReport do client-real.js).
 */
import { validateLevel, FEEDBACK_CORRECT } from './validator.js';
import { evaluateReport } from './client-real.js';

/* Tipos de retorno específicos do modo */
export const CR_FEEDBACK_CORRECT = 'correct';
export const CR_FEEDBACK_WRONG = 'wrong';
export const CR_FEEDBACK_CLARIFICATION_WRONG = 'clarification_wrong';
export const CR_FEEDBACK_REPORT_PASSED = 'report_passed';
export const CR_FEEDBACK_REPORT_FAILED = 'report_failed';

/**
 * Valida a resposta de clarificação de uma consultoria.
 * @param {object} engagement
 * @param {number} questionIndex índice da pergunta respondida
 * @param {string} optionId id da opção escolhida
 * @returns {{correct: boolean, option: object, feedback: string}}
 */
export function validateClarification(engagement, questionIndex, optionId) {
  const question = engagement.clarifications[questionIndex];
  if (!question) {
    return { correct: false, option: null, feedback: 'Pergunta de clarificação não encontrada.' };
  }
  const option = question.options.find(o => o.id === optionId);
  if (!option) {
    return { correct: false, option: null, feedback: 'Escolha uma das opções apresentadas.' };
  }
  return {
    correct: option.correct === true,
    option,
    feedback: option.feedback,
  };
}

/**
 * Valida uma query de análise de uma consultoria (contrato padrão de missão).
 * @param {string} sql
 * @param {object} analysis shape de missão (expectedColumns, referenceQuery, ...)
 * @param {object} db instância sql.js
 * @returns feedback do validateLevel
 */
export function validateClientRealAnalysis(sql, analysis, db) {
  return validateLevel(sql, analysis, db);
}

/**
 * Valida o relatório escrito pelo jogador para o cliente.
 * @param {string} report
 * @param {object} engagement
 * @returns {{passed: boolean, feedback: string}}
 */
export function validateClientRealReport(report, engagement) {
  const result = evaluateReport(report, engagement);
  return {
    passed: result.passed,
    feedback: result.feedback,
    type: result.passed ? CR_FEEDBACK_REPORT_PASSED : CR_FEEDBACK_REPORT_FAILED,
  };
}

/**
 * Estado inicial de uma consultoria.
 * phase: 'clarify' | 'analyze' | 'report' | 'done'
 * @returns {object}
 */
export function createEngagementState() {
  return {
    phase: 'clarify',
    clarificationIndex: 0,
    clarificationCorrectCount: 0,
    clarificationAttempts: 0,
    analysisIndex: 0,
    sqlErrors: 0,
    analysisAttempts: 0,
    analysisHints: [],
    reportSubmitted: false,
    reportPassed: false,
    reportAttempts: 0,
    completedAt: null,
  };
}

/**
 * Normaliza estado salvo de uma consultoria (tolerância a save corrompido).
 * @param {object|null} saved
 * @returns {object}
 */
export function normalizeEngagementState(saved) {
  const def = createEngagementState();
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return def;
  const state = { ...def };
  if (['clarify', 'analyze', 'report', 'done'].includes(saved.phase)) state.phase = saved.phase;
  if (Number.isInteger(saved.clarificationIndex) && saved.clarificationIndex >= 0) {
    state.clarificationIndex = Math.min(saved.clarificationIndex, 10);
  }
  if (Number.isInteger(saved.clarificationCorrectCount) && saved.clarificationCorrectCount >= 0) {
    state.clarificationCorrectCount = saved.clarificationCorrectCount;
  }
  if (Number.isInteger(saved.clarificationAttempts) && saved.clarificationAttempts >= 0) {
    state.clarificationAttempts = saved.clarificationAttempts;
  }
  if (Number.isInteger(saved.analysisIndex) && saved.analysisIndex >= 0) {
    state.analysisIndex = Math.min(saved.analysisIndex, 10);
  }
  if (Number.isInteger(saved.sqlErrors) && saved.sqlErrors >= 0) state.sqlErrors = saved.sqlErrors;
  if (Number.isInteger(saved.analysisAttempts) && saved.analysisAttempts >= 0) {
    state.analysisAttempts = saved.analysisAttempts;
  }
  if (Array.isArray(saved.analysisHints)) {
    state.analysisHints = saved.analysisHints.filter(h => typeof h === 'number');
  }
  if (saved.reportSubmitted === true) state.reportSubmitted = true;
  if (saved.reportPassed === true) state.reportPassed = true;
  if (Number.isInteger(saved.reportAttempts) && saved.reportAttempts >= 0) {
    state.reportAttempts = saved.reportAttempts;
  }
  if (typeof saved.completedAt === 'string' && Number.isFinite(Date.parse(saved.completedAt))) {
    state.completedAt = new Date(saved.completedAt).toISOString();
  }
  return state;
}

/**
 * Calcula o score da consultoria (0-1000):
 * - base 1000, penaliza erros de SQL (200 cada, mín. 300) e tentativas de relatório (>1: -150 cada),
 * - bônus de comunicação: +100 por clarificação correta (máx. +300).
 * @param {object} engagementState
 * @param {object} engagement definição
 * @returns {number}
 */
export function computeEngagementScore(engagementState, engagement) {
  let score = 1000;
  score -= Math.min(engagementState.sqlErrors * 200, 700);
  if (engagementState.reportAttempts > 1) {
    score -= (engagementState.reportAttempts - 1) * 150;
  }
  if (score < 300) score = 300;
  score += Math.min(engagementState.clarificationCorrectCount * 100, 300);
  const maxClarifications = (engagement.clarifications || []).length;
  const perfectCommunication = maxClarifications > 0
    && engagementState.clarificationCorrectCount >= maxClarifications
    && engagementState.sqlErrors === 0
    && engagementState.reportAttempts === 1;
  return { score: Math.round(score), perfectCommunication };
}

/**
 * Estrelas da consultoria (1-3) pelo score.
 * @param {number} score
 * @returns {number}
 */
export function computeEngagementStars(score) {
  if (score >= 900) return 3;
  if (score >= 600) return 2;
  return 1;
}

export { FEEDBACK_CORRECT };
