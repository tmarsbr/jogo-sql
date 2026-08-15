/**
 * interrogation.js — Funções puras para o interrogatório final.
 *
 * Não acessa document, localStorage ou state.
 */

/**
 * Cria estado inicial do interrogatório.
 * @returns {{status: string, stepIndex: number, presentedEvidenceIds: string[]}}
 */
export function createInterrogationState() {
  return {
    status: 'locked',
    stepIndex: 0,
    presentedEvidenceIds: [],
  };
}

/**
 * Normaliza um estado de interrogatório recebido (ex: de um save antigo).
 * @param {object|null} state
 * @returns {{status: string, stepIndex: number, presentedEvidenceIds: string[]}}
 */
export function normalizeInterrogationState(state) {
  if (!state || typeof state !== 'object') {
    return createInterrogationState();
  }
  const status = ['locked', 'active', 'won'].includes(state.status) ? state.status : 'locked';
  const stepIndex = Number.isInteger(state.stepIndex) ? state.stepIndex : 0;
  const presentedEvidenceIds = Array.isArray(state.presentedEvidenceIds)
    ? [...new Set(state.presentedEvidenceIds.filter(id => typeof id === 'string'))]
    : [];
  return { status, stepIndex, presentedEvidenceIds };
}

/**
 * Verifica se o interrogatório está disponível.
 * @param {object} finalChallenge config do desafio final
 * @param {number[]} completedLevels
 * @param {object} interrogationState
 * @returns {boolean}
 */
export function isInterrogationAvailable(finalChallenge, completedLevels, interrogationState) {
  if (!finalChallenge || finalChallenge.type !== 'interrogation') return false;
  if (interrogationState.status === 'won') return false;
  const requiredMission = finalChallenge.requiredMission;
  return completedLevels.includes(requiredMission);
}

/**
 * Inicia o confronto, mudando o status de 'locked' para 'active'.
 * @param {object} finalChallenge
 * @param {number[]} completedLevels
 * @param {object} interrogationState
 * @returns {{started: boolean, state: object, reason?: string}}
 */
export function startInterrogation(finalChallenge, completedLevels, interrogationState) {
  const state = normalizeInterrogationState(interrogationState);

  if (!isInterrogationAvailable(finalChallenge, completedLevels, state)) {
    return { started: false, state, reason: 'not_available' };
  }

  if (state.status === 'active') {
    return { started: true, state, reason: 'already_active' };
  }

  return {
    started: true,
    state: { ...state, status: 'active', stepIndex: 0 },
  };
}

/**
 * Apresenta uma evidência durante o interrogatório.
 * @param {object} finalChallenge config do desafio final
 * @param {number[]} completedLevels missões concluídas (para validar desbloqueio)
 * @param {object} timelineConfig config da timeline (para validar desbloqueio de evidências)
 * @param {object} interrogationState estado atual
 * @param {string} evidenceId ID da evidência apresentada
 * @returns {{accepted: boolean, completed: boolean, state: object, reason?: string, message?: string}}
 */
export function presentEvidence(finalChallenge, completedLevels, timelineConfig, interrogationState, evidenceId) {
  const state = normalizeInterrogationState(interrogationState);

  if (state.status === 'won') {
    return { accepted: false, completed: true, state, reason: 'already_won' };
  }

  if (state.status !== 'active') {
    return { accepted: false, completed: false, state, reason: 'not_active' };
  }

  if (!evidenceId || typeof evidenceId !== 'string') {
    return { accepted: false, completed: false, state, reason: 'invalid_evidence' };
  }

  const steps = finalChallenge?.steps;
  if (!Array.isArray(steps) || steps.length === 0) {
    return { accepted: false, completed: false, state, reason: 'no_steps' };
  }

  const stepIndex = state.stepIndex;
  if (stepIndex < 0 || stepIndex >= steps.length) {
    return { accepted: false, completed: false, state, reason: 'invalid_step' };
  }

  // Valida que a evidência está desbloqueada
  const unlockedEvents = timelineConfig?.events || [];
  const unlockedIds = new Set(
    unlockedEvents
      .filter(e => completedLevels.includes(e.unlockedByMission))
      .map(e => e.id)
  );
  if (!unlockedIds.has(evidenceId)) {
    return { accepted: false, completed: false, state, reason: 'evidence_locked' };
  }

  const currentStep = steps[stepIndex];

  if (evidenceId !== currentStep.evidenceId) {
    // Evidência errada — não avança, não penaliza
    return {
      accepted: false,
      completed: false,
      state,
      reason: 'wrong_evidence',
      message: 'Essa evidência não corresponde à contradição atual.',
    };
  }

  // Evidência correta
  const newPresentedIds = [...state.presentedEvidenceIds, evidenceId];
  const newStepIndex = stepIndex + 1;
  const isCompleted = newStepIndex >= steps.length;

  if (isCompleted) {
    return {
      accepted: true,
      completed: true,
      state: {
        status: 'won',
        stepIndex: newStepIndex,
        presentedEvidenceIds: newPresentedIds,
      },
      message: currentStep.successMessage,
    };
  }

  return {
    accepted: true,
    completed: false,
    state: {
      status: 'active',
      stepIndex: newStepIndex,
      presentedEvidenceIds: newPresentedIds,
    },
    message: currentStep.successMessage,
  };
}