/**
 * test_scoring.js — Testes do sistema de pontuação e estrelas.
 *
 * Executa com: node test/test_scoring.js
 *
 * Importa as funções reais de src/scoring.js via load-source.js.
 */

const { loadScoring } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

// === Carrega módulo real ===
const scoring = loadScoring();
const { calculateStars, calculateScore, calculateTotalScore, updateLevelProgress, calculateTotalStars, calculateMaxStars } = scoring;

// === Teste 1: calculateStars ===
console.log('\n[1] calculateStars');
assert(calculateStars(0) === 3, '0 dicas = 3 estrelas');
assert(calculateStars(1) === 2, '1 dica = 2 estrelas');
assert(calculateStars(2) === 1, '2 dicas = 1 estrela');
assert(calculateStars(3) === 1, '3 dicas = 1 estrela');
assert(calculateStars(99) === 1, '99 dicas = 1 estrela');

// === Teste 2: calculateScore ===
console.log('\n[2] calculateScore');
assert(calculateScore(3) === 300, '3 estrelas = 300 pts');
assert(calculateScore(2) === 200, '2 estrelas = 200 pts');
assert(calculateScore(1) === 100, '1 estrela = 100 pts');
assert(calculateScore(0) === 0, '0 estrelas = 0 pts');

// === Teste 3: calculateTotalScore ===
console.log('\n[3] calculateTotalScore');
assert(calculateTotalScore({}) === 0, 'Vazio = 0');
assert(calculateTotalScore({ 1: { stars: 3 }, 2: { stars: 2 } }) === 500, '3+2 estrelas = 500');
assert(calculateTotalScore({ 1: { stars: 1 }, 2: { stars: 1 }, 3: { stars: 1 } }) === 300, '1+1+1 = 300');

// === Teste 3b: calculateTotalScore com bônus opcional ===
console.log('\n[3b] calculateTotalScore com bônus opcional');
assert(calculateTotalScore({ 1: { stars: 3 }, 2: { stars: 2 } }, 200) === 700, '500 + 200 bônus = 700');
assert(calculateTotalScore({ 1: { stars: 3 } }, 0) === 300, '300 + 0 bônus = 300');
assert(calculateTotalScore({ 1: { stars: 3 } }, undefined) === 300, 'undefined bônus = 300 (compatível)');
assert(calculateTotalScore({ 1: { stars: 3 } }, null) === 300, 'null bônus = 300 (compatível)');
assert(calculateTotalScore({ 1: { stars: 3 } }, 'abc') === 300, 'bônus inválido = 300 (ignorado)');

// === Teste 4: updateLevelProgress (primeiro registro) ===
console.log('\n[4] updateLevelProgress — primeiro registro');
const r1 = updateLevelProgress({}, 1, 3, 0);
assert(r1.updated === true, 'Primeiro registro: updated=true');
assert(r1.stars === 3, 'Primeiro registro: 3 estrelas');
assert(r1.levelProgress[1].stars === 3, 'Progresso atualizado com 3 estrelas');
assert(r1.levelProgress[1].hintsUsed === 0, 'Progresso: 0 dicas');

// === Teste 5: updateLevelProgress (melhor pontuação) ===
console.log('\n[5] updateLevelProgress — melhoria');
const existing = { 1: { stars: 2, hintsUsed: 1 } };
const r2 = updateLevelProgress(existing, 1, 3, 0);
assert(r2.updated === true, 'Melhoria: updated=true');
assert(r2.stars === 3, 'Melhoria: 3 estrelas');

// === Teste 6: updateLevelProgress (sem melhoria) ===
console.log('\n[6] updateLevelProgress — sem melhoria');
const existing2 = { 1: { stars: 3, hintsUsed: 0 } };
const r3 = updateLevelProgress(existing2, 1, 2, 1);
assert(r3.updated === false, 'Sem melhoria: updated=false');
assert(r3.stars === 3, 'Mantém 3 estrelas');

// === Teste 7: updateLevelProgress (mesma pontuação) ===
console.log('\n[7] updateLevelProgress — mesma pontuação');
const r4 = updateLevelProgress(existing2, 1, 3, 0);
assert(r4.updated === false, 'Mesma pontuação: updated=false');
assert(r4.stars === 3, 'Mantém 3 estrelas');

// === Teste 8: calculateTotalStars ===
console.log('\n[8] calculateTotalStars');
assert(calculateTotalStars({}) === 0, 'Vazio = 0 estrelas');
assert(calculateTotalStars({ 1: { stars: 3 }, 2: { stars: 2 }, 3: { stars: 1 } }) === 6, '3+2+1 = 6 estrelas');

// === Teste 9: calculateMaxStars ===
console.log('\n[9] calculateMaxStars');
assert(calculateMaxStars(12) === 36, '12 níveis = 36 estrelas max');
assert(calculateMaxStars(4) === 12, '4 níveis = 12 estrelas max');

// === Teste 10: Múltiplos níveis ===
console.log('\n[10] Múltiplos níveis');
let progress = {};
for (let i = 1; i <= 5; i++) {
  const stars = calculateStars(i % 3);
  const result = updateLevelProgress(progress, i, stars, i % 3);
  progress = result.levelProgress;
}
const total = calculateTotalScore(progress);
assert(total > 0, `Pontuação total > 0 (${total})`);
const totalStars = calculateTotalStars(progress);
assert(totalStars > 0, `Total de estrelas > 0 (${totalStars})`);

// === Resultado ===
console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);