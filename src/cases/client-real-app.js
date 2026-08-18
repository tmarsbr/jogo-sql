/**
 * client-real-app.js — Integração do modo Cliente Real com o estado global.
 *
 * Gerencia o fluxo de três fases por consultoria (clarificar → analisar →
 * apresentar) e a persistência dentro de state.progressByCase['client-real'].
 * Lógica pura; a UI vive em ui.js (renderClientRealBriefing / renderClientRealFeedback).
 */
import { ENGAGEMENTS, getEngagement, CLIENT_REAL_PREFIX } from './client-real.js';
import { createEngagementState, normalizeEngagementState } from './client-real-validator.js';

/* Chave de persistência dentro de progressByCase */
export const CLIENT_REAL_PROGRESS_KEY = 'client-real';

/**
 * Retorna o estado de progresso do modo Cliente Real (mapa por engagement id).
 * @param {object} progressByCase
 * @returns {Object<string, object>}
 */
export function getClientRealProgress(progressByCase) {
  const raw = (progressByCase || {})[CLIENT_REAL_PROGRESS_KEY];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const byId = raw.byId || {};
  const out = {};
  for (const id of Object.keys(byId)) {
    out[id] = normalizeEngagementState(byId[id]);
  }
  return out;
}

/**
 * Persiste o estado do modo Cliente Real em progressByCase.
 * @param {object} progressByCase
 * @param {Object<string, object>} byId
 */
export function setClientRealProgress(progressByCase, byId) {
  if (!progressByCase || typeof progressByCase !== 'object') return;
  progressByCase[CLIENT_REAL_PROGRESS_KEY] = {
    version: 1,
    byId: { ...(byId || {}) },
  };
}

/**
 * Atualiza o estado de uma consultoria e devolve o novo mapa.
 * @param {object} progressByCase
 * @param {string} engagementId
 * @param {object} updater (state) => state
 * @returns {{byId: Object<string, object>, updated: object}}
 */
export function updateClientRealEngagement(progressByCase, engagementId, updater) {
  const byId = getClientRealProgress(progressByCase);
  const current = normalizeEngagementState(byId[engagementId] || null);
  const updated = updater(current);
  byId[engagementId] = updated;
  setClientRealProgress(progressByCase, byId);
  return { byId, updated };
}

/**
 * Ids de consultoria em ordem.
 * @returns {string[]}
 */
export function getClientRealEngagementIds() {
  return ENGAGEMENTS.map(e => e.id);
}

/**
 * Consultorias concluídas.
 * @param {object} progressByCase
 * @returns {string[]}
 */
export function getCompletedClientRealIds(progressByCase) {
  const byId = getClientRealProgress(progressByCase);
  return ENGAGEMENTS.filter(e => (byId[e.id] || {}).phase === 'done').map(e => e.id);
}

/**
 * É um id de consultoria do Cliente Real?
 * @param {string|number} levelId
 * @returns {boolean}
 */
export function isClientRealId(levelId) {
  return typeof levelId === 'string' && levelId.startsWith(CLIENT_REAL_PREFIX);
}

/**
 * Primeira consultoria não concluída (ou a atual, se em andamento).
 * @param {object} progressByCase
 * @returns {object|null} {engagement, engagementState}
 */
export function getNextClientRealEngagement(progressByCase) {
  const byId = getClientRealProgress(progressByCase);
  // Retoma a primeira em andamento
  for (const e of ENGAGEMENTS) {
    const s = byId[e.id];
    if (s && s.phase !== 'done') return { engagement: e, engagementState: s };
  }
  // Senão, primeira não iniciada
  for (const e of ENGAGEMENTS) {
    if (!byId[e.id]) return { engagement: e, engagementState: normalizeEngagementState(null) };
  }
  return null;
}
