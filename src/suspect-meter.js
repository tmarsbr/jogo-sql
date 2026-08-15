/**
 * suspect-meter.js — Funções puras para o medidor de suspeita.
 *
 * Deriva o percentual de suspeita a partir das missões concluídas.
 * Não acessa document, localStorage ou state.
 */

/**
 * Deriva o valor do medidor de suspeita a partir das missões concluídas.
 * Soma os deltas declarados em cada missão e limita ao intervalo 0–100.
 * @param {object} suspectsConfig config de suspeitos ({ deltasByMission: {...} })
 * @param {number[]} completedLevels IDs das missões concluídas
 * @returns {number} valor entre 0 e 100
 */
export function deriveSuspicion(suspectsConfig, completedLevels) {
  if (!suspectsConfig || !suspectsConfig.deltasByMission) return 0;

  let total = 0;
  for (const missionId of completedLevels) {
    const deltas = suspectsConfig.deltasByMission[missionId];
    if (Array.isArray(deltas)) {
      for (const d of deltas) {
        total += d.delta;
      }
    }
  }

  return Math.max(0, Math.min(100, total));
}

/**
 * Retorna o rótulo seguro de cada perfil conforme as missões concluídas.
 * Antes de revealAtMission, usa initialLabel; depois, revealedLabel.
 * @param {object} suspectsConfig config de suspeitos ({ profiles: [...] })
 * @param {number[]} completedLevels
 * @returns {Array<{id: string, label: string, suspicion: number, revealed: boolean}>}
 */
export function getSuspectProfiles(suspectsConfig, completedLevels) {
  if (!suspectsConfig || !Array.isArray(suspectsConfig.profiles)) return [];

  const completed = new Set(completedLevels);

  // Calcula suspeita individual por perfil
  const suspicionById = {};
  if (suspectsConfig.deltasByMission) {
    for (const missionId of completedLevels) {
      const deltas = suspectsConfig.deltasByMission[missionId];
      if (Array.isArray(deltas)) {
        for (const d of deltas) {
          suspicionById[d.suspectId] = (suspicionById[d.suspectId] || 0) + d.delta;
        }
      }
    }
  }

  return suspectsConfig.profiles.map(profile => {
    const revealed = completed.has(profile.revealAtMission);
    const label = revealed ? profile.revealedLabel : profile.initialLabel;
    const suspicion = Math.max(0, Math.min(100, suspicionById[profile.id] || 0));
    return { id: profile.id, label, suspicion, revealed };
  });
}