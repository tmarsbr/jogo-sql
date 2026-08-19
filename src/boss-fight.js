/**
 * boss-fight.js — Lógica pura do modo Boss Fight.
 *
 * Não acessa document, localStorage ou state: apenas funções determinísticas
 * que operam sobre os dados das batalhas (boss-definitions.js) e sobre o
 * estado de batalha persistido em progressByCase.bossFight.
 */

import { BATTLE_BY_CASE, BOSS_STEP_PREFIX } from './boss-definitions.js';
import { validateLevel, FEEDBACK_CORRECT } from './validator.js';

/* --- Tipos de retorno --- */
export const BOSS_FEEDBACK_CORRECT = 'boss_correct';
export const BOSS_FEEDBACK_WRONG = 'boss_wrong';

/* --- Constantes de score --- */
export const BOSS_BASE_SCORE = 1000;

/**
 * Normaliza o estado de boss fight de um caso (de save antigo ou corrompido).
 * Shape: { status, startedAt, timerElapsedMs, executionAttempts, sqlErrors,
 *          completedSteps, scoreAwarded, completedAt }
 * @param {object|null} saved
 * @returns {object}
 */
export function normalizeBossState(saved) {
  const defaultState = {
    status: 'available',
    startedAt: null,
    timerElapsedMs: 0,
    executionAttempts: 0,
    sqlErrors: 0,
    completedSteps: [],
    scoreAwarded: null,
    completedAt: null,
  };
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaultState;
  const status = ['available', 'active', 'won'].includes(saved.status) ? saved.status : defaultState.status;
  const startedAt = typeof saved.startedAt === 'string' && Number.isFinite(Date.parse(saved.startedAt))
    ? new Date(saved.startedAt).toISOString()
    : null;
  const timerElapsedMs = Number.isInteger(saved.timerElapsedMs) && saved.timerElapsedMs >= 0 ? saved.timerElapsedMs : 0;
  const executionAttempts = Number.isInteger(saved.executionAttempts) && saved.executionAttempts >= 0 ? saved.executionAttempts : 0;
  const sqlErrors = Number.isInteger(saved.sqlErrors) && saved.sqlErrors >= 0 ? saved.sqlErrors : 0;
  const completedSteps = Array.isArray(saved.completedSteps)
    ? [...new Set(saved.completedSteps.filter(id => typeof id === 'string'))]
    : [];
  const scoreAwarded = Number.isInteger(saved.scoreAwarded) ? saved.scoreAwarded : null;
  const completedAt = typeof saved.completedAt === 'string' && Number.isFinite(Date.parse(saved.completedAt))
    ? new Date(saved.completedAt).toISOString()
    : null;
  return { status, startedAt, timerElapsedMs, executionAttempts, sqlErrors, completedSteps, scoreAwarded, completedAt };
}

/**
 * Retorna a batalha de boss do caso, ou null.
 * @param {string} caseId
 * @returns {object|null}
 */
export function getBattle(caseId) {
  return (BATTLE_BY_CASE || {})[caseId] || null;
}

/**
 * Verifica se o caseId possui batalha de boss.
 * @param {string} caseId
 * @returns {boolean}
 */
export function isBossCase(caseId) {
  return Boolean(BATTLE_BY_CASE[caseId]);
}

/**
 * Um step id é de boss se começa com o prefixo.
 * @param {string|number} levelId
 * @returns {boolean}
 */
export function isBossStepId(levelId) {
  return typeof levelId === 'string' && levelId.startsWith(BOSS_STEP_PREFIX);
}

/**
 * Retorna o step ativo da batalha para o caso.
 * stepIndex é o índice do próximo step não concluído.
 * @param {object} battle
 * @param {object} bossState estado normalizado
 * @returns {object|null} step ou null se batalha encerrada
 */
export function getActiveStep(battle, bossState) {
  if (!battle || !Array.isArray(battle.steps) || battle.steps.length === 0) return null;
  const done = new Set(bossState.completedSteps || []);
  const next = battle.steps.find(step => !done.has(step.id));
  return next || null;
}

/**
 * O boss está disponível para o caso: caso possui batalha, estado não é 'won'
 * e (se o caso tem interrogação) ela foi vencida. O encadeamento de casos é
 * tratado pelo case-manager: o boss é bônus pós-conclusão.
 * @param {object} battle
 * @param {object} bossState estado normalizado
 * @param {object} interrogation estado do interrogatório do caso
 * @returns {boolean}
 */
export function isBossAvailable(battle, bossState, interrogation) {
  if (!battle) return false;
  if (bossState.status === 'won') return false;
  // Se o caso tem interrogatório e ele não foi vencido, o boss fica em espera.
  if (interrogation && interrogation.status !== 'won' && interrogation.status !== 'locked') return false;
  return bossState.status === 'available' || bossState.status === 'active';
}

/**
 * Inicia (ou retoma) a batalha: status -> 'active' e startedAt definido.
 * Se já ativa, apenas retorna o estado retocado (retomada).
 * @param {object} battle
 * @param {object} bossState estado normalizado
 * @returns {{state: object, reason: string}}
 */
export function startBattle(battle, bossState) {
  if (!battle) return { state: bossState, reason: 'no_battle' };
  const state = normalizeBossState(bossState);
  if (state.status === 'won') return { state, reason: 'already_won' };
  if (state.status === 'active') return { state, reason: 'already_active' };
  return {
    state: {
      ...state,
      status: 'active',
      startedAt: state.startedAt || new Date().toISOString(),
      timerElapsedMs: state.timerElapsedMs || 0,
    },
    reason: 'started',
  };
}

/**
 * Valida uma tentativa contra o step ativo. Registra a tentativa e o erro de
 * SQL no contador de eficiência (sem hints, a eficiência é tudo).
 * Usa o validador de missões comum — o step tem o mesmo shape.
 * @param {string} sql
 * @param {object} step
 * @param {object} db
 * @param {object} bossState estado atual (será clonado e atualizado)
 * @returns {{feedback: object, state: object}} feedback do validador + estado atualizado
 */
export function validateBossStep(sql, step, db, bossState) {
  const feedback = validateLevel(sql, step, db);
  const state = normalizeBossState(bossState);
  const updated = {
    ...state,
    executionAttempts: state.executionAttempts + 1,
    sqlErrors: state.sqlErrors + (feedback.type === 'sql_error' ? 1 : 0),
  };
  return { feedback, state: updated };
}

/**
 * Marca um step como concluído.
 * @param {object} bossState estado atualizado
 * @param {object} step
 * @returns {object}
 */
export function completeStep(bossState, step) {
  const state = normalizeBossState(bossState);
  if (!state.completedSteps.includes(step.id)) {
    state.completedSteps = [...state.completedSteps, step.id];
  }
  return state;
}

/**
 * Verifica se a batalha foi totalmente concluída.
 * @param {object} battle
 * @param {object} bossState
 * @returns {boolean}
 */
export function isBattleWon(battle, bossState) {
  if (!battle) return false;
  const done = new Set(bossState.completedSteps || []);
  return battle.steps.every(step => done.has(step.id));
}

/**
 * Conclui a batalha: status won, completedAt e score final.
 * @param {object} battle
 * @param {object} bossState
 * @param {number} elapsedMs tempo total decorrido (ms)
 * @returns {object}
 */
export function winBattle(battle, bossState, elapsedMs) {
  const state = normalizeBossState(bossState);
  const finalElapsedMs = Number.isFinite(elapsedMs) && elapsedMs >= 0
    ? Math.floor(elapsedMs)
    : state.timerElapsedMs;
  return {
    ...state,
    status: 'won',
    startedAt: null,
    timerElapsedMs: finalElapsedMs,
    completedAt: new Date().toISOString(),
    scoreAwarded: computeBossScore(battle, finalElapsedMs, state.sqlErrors),
  };
}

/**
 * Calcula o tempo decorrido total (ms): o acumulado persistido + o tempo
 * desde o startedAt (se a batalha está ativa). A batalha é usada apenas
 * para localizar o estado persistente caso o parâmetro seja o id do caso.
 * @param {object} battle definição da batalha
 * @param {object} bossState estado normalizado
 * @returns {number}
 */
export function elapsedMs(battle, bossState) {
  void battle;
  const state = normalizeBossState(bossState);
  if (!state.startedAt) return state.timerElapsedMs || 0;
  const live = Date.now() - new Date(state.startedAt).getTime();
  return (state.timerElapsedMs || 0) + Math.max(0, live);
}

/**
 * Calcula o score do boss com base em eficiência:
 * base (1000) + melhor bônus de tempo aplicável − penalidade por erros de SQL
 * (limitada pelo teto da batalha e nunca abaixo de zero).
 * @param {object} battle
 * @param {number} elapsedMs tempo total em ms
 * @param {number} sqlErrors erros de SQL cometidos
 * @returns {number}
 */
export function computeBossScore(battle, elapsedMs, sqlErrors) {
  const config = battle.scoring || { base: BOSS_BASE_SCORE, bonuses: [], errorPenalty: 50, maxErrorPenalty: 600 };
  const base = typeof config.base === 'number' ? config.base : BOSS_BASE_SCORE;
  const elapsedSec = Math.floor((elapsedMs || 0) / 1000);
  let bonus = 0;
  for (const b of config.bonuses || []) {
    if (elapsedSec <= b.maxElapsedSec) {
      bonus = Math.max(bonus, b.points);
    }
  }
  const penalty = Math.min(
    Math.max(0, (Number(sqlErrors) || 0)) * (config.errorPenalty || 50),
    config.maxErrorPenalty || 600
  );
  return Math.max(0, base + bonus - penalty);
}

/**
 * Calcula as estrelas do boss com base na precisão:
 * 3 estrelas: nenhum erro de SQL; 2 estrelas: até 3 erros; 1 estrela caso contrário.
 * @param {number} sqlErrors
 * @returns {number} 1-3
 */
export function computeBossStars(sqlErrors) {
  const errors = Math.max(0, Number(sqlErrors) || 0);
  if (errors === 0) return 3;
  if (errors <= 3) return 2;
  return 1;
}

/**
 * Formata ms em MM:SS para o cronômetro.
 * @param {number} ms
 * @returns {string}
 */
export function formatElapsed(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export { validateLevel, FEEDBACK_CORRECT };
