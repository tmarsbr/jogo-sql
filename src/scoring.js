/**
 * scoring.js — Sistema de pontuação e estrelas do SQL Detective.
 *
 * Fase 5:
 * - 3 estrelas sem utilizar dicas;
 * - 2 estrelas usando uma dica;
 * - 1 estrela usando duas ou mais dicas.
 * - Pontuação: 100 * estrelas por missão.
 * - A melhor pontuação de cada nível é preservada.
 * - Erros de sintaxe e tentativas extras NÃO penalizam.
 */

/**
 * Calcula a quantidade de estrelas com base no número de dicas usadas.
 * @param {number} hintsUsed
 * @returns {number} 1, 2 ou 3
 */
export function calculateStars(hintsUsed) {
  if (hintsUsed === 0) return 3;
  if (hintsUsed === 1) return 2;
  return 1;
}

/**
 * Calcula a pontuação de uma missão com base nas estrelas.
 * @param {number} stars
 * @returns {number}
 */
export function calculateScore(stars) {
  return stars * 100;
}

/**
 * Calcula a pontuação total a partir do progresso de todos os níveis.
 * @param {Object<number, {stars: number, hintsUsed: number}>} levelProgress
 * @returns {number}
 */
export function calculateTotalScore(levelProgress, bonusPoints = 0) {
  let total = 0;
  for (const key of Object.keys(levelProgress)) {
    total += calculateScore(levelProgress[key].stars);
  }
  return total + (Number.isFinite(bonusPoints) ? bonusPoints : 0);
}

/**
 * Atualiza o progresso de um nível, preservando a melhor pontuação.
 * Se o novo resultado for melhor (mais estrelas), substitui o anterior.
 * Se for igual ou pior, mantém o anterior.
 *
 * @param {Object<number, {stars: number, hintsUsed: number}>} levelProgress
 * @param {number} levelId
 * @param {number} stars
 * @param {number} hintsUsed
 * @returns {{updated: boolean, levelProgress: object, stars: number}}
 */
export function updateLevelProgress(levelProgress, levelId, stars, hintsUsed) {
  const existing = levelProgress[levelId];
  const newEntry = { stars, hintsUsed };

  if (!existing || stars > existing.stars) {
    return {
      updated: true,
      levelProgress: { ...levelProgress, [levelId]: newEntry },
      stars,
    };
  }

  return {
    updated: false,
    levelProgress,
    stars: existing.stars,
  };
}

/**
 * Calcula o total de estrelas obtidas em todos os níveis.
 * @param {Object<number, {stars: number, hintsUsed: number}>} levelProgress
 * @returns {number}
 */
export function calculateTotalStars(levelProgress) {
  let total = 0;
  for (const key of Object.keys(levelProgress)) {
    total += levelProgress[key].stars;
  }
  return total;
}

/**
 * Calcula o total máximo possível de estrelas.
 * @param {number} totalLevels
 * @returns {number}
 */
export function calculateMaxStars(totalLevels) {
  return totalLevels * 3;
}