/**
 * timeline.js — Funções puras para a linha do tempo de evidências.
 *
 * Nenhum acesso a document, localStorage ou state.
 */

/**
 * Obtém eventos desbloqueados a partir das missões concluídas.
 * @param {object} timelineConfig config da timeline ({ events: [...] })
 * @param {number[]} completedLevels IDs das missões concluídas
 * @returns {object[]} eventos desbloqueados, ordenados por sortKey
 */
export function getUnlockedEvents(timelineConfig, completedLevels) {
  if (!timelineConfig || !Array.isArray(timelineConfig.events)) return [];
  const completed = new Set(completedLevels);
  return timelineConfig.events
    .filter(e => completed.has(e.unlockedByMission))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

/**
 * Normaliza a ordem escolhida pelo jogador:
 * - Remove IDs duplicados
 * - Remove IDs não pertencentes aos eventos desbloqueados atuais
 * - Adiciona eventos recém-desbloqueados no fim
 * @param {object} timelineConfig
 * @param {number[]} completedLevels
 * @param {string[]} currentOrder IDs atuais na ordem escolhida
 * @returns {string[]} ordem normalizada
 */
export function normalizeOrder(timelineConfig, completedLevels, currentOrder) {
  const unlocked = getUnlockedEvents(timelineConfig, completedLevels);
  const validIds = new Set(unlocked.map(e => e.id));

  // Remove duplicados e IDs inválidos, preservando a ordem
  const seen = new Set();
  const result = [];
  for (const id of (currentOrder || [])) {
    if (validIds.has(id) && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }

  // Adiciona eventos recém-desbloqueados no fim
  for (const event of unlocked) {
    if (!seen.has(event.id)) {
      result.push(event.id);
    }
  }

  return result;
}

/**
 * Move um evento para cima ou baixo sem mutar o array de origem.
 * @param {string[]} order ordem atual
 * @param {number} index índice do evento a mover
 * @param {string} direction 'up' | 'down'
 * @returns {string[]} nova ordem
 */
export function moveEvent(order, index, direction) {
  if (!Array.isArray(order)) return [];
  if (index < 0 || index >= order.length) return [...order];

  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= order.length) return [...order];

  const result = [...order];
  [result[index], result[newIndex]] = [result[newIndex], result[index]];
  return result;
}

/**
 * Valida se a ordem escolhida corresponde à ordem cronológica exata.
 * @param {object} timelineConfig
 * @param {number[]} completedLevels
 * @param {string[]} order ordem escolhida pelo jogador
 * @returns {boolean} true se a ordem está correta
 */
export function validateOrder(timelineConfig, completedLevels, order) {
  const unlocked = getUnlockedEvents(timelineConfig, completedLevels);
  const correctOrder = unlocked.map(e => e.id);

  if (order.length !== correctOrder.length) return false;
  return order.every((id, i) => id === correctOrder[i]);
}

/**
 * Retorna uma transição de bônus idempotente.
 * Se a ordem estiver correta e o bônus ainda não foi concedido, marca como concedido.
 * Se já foi concedido, não concede novamente.
 * @param {object} timelineConfig
 * @param {number[]} completedLevels
 * @param {string[]} order
 * @param {boolean} alreadyAwarded se o bônus já foi concedido
 * @returns {{awarded: boolean, bonusPoints: number, message: string, allCorrect: boolean}}
 */
export function checkTimelineBonus(timelineConfig, completedLevels, order, alreadyAwarded) {
  const allCorrect = validateOrder(timelineConfig, completedLevels, order);
  const bonusPoints = timelineConfig?.bonusPoints || 200;

  if (!allCorrect) {
    return { awarded: false, bonusPoints: 0, message: '', allCorrect: false };
  }

  if (alreadyAwarded) {
    return { awarded: false, bonusPoints: 0, message: 'Bônus já concedido.', allCorrect: true };
  }

  return {
    awarded: true,
    bonusPoints,
    message: `Linha do tempo correta! +${bonusPoints} pontos.`,
    allCorrect: true,
  };
}