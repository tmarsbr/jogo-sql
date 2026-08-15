/**
 * test_timeline.js — Testes do módulo puro timeline.js
 * Executa com: node test/test_timeline.js
 */

const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

const code = readSource('timeline.js');
const mod = evalModule(transformESM(code), {}, 'timeline.js');
const { getUnlockedEvents, normalizeOrder, moveEvent, validateOrder, checkTimelineBonus } = mod;

const timelineConfig = {
  bonusPoints: 200,
  events: [
    { id: 'transfer-501', unlockedByMission: 3, sortKey: '2024-03-12T23:15:00', type: 'transação', label: 'Transferência de alto valor' },
    { id: 'access-701', unlockedByMission: 4, sortKey: '2024-03-12T22:30:00', type: 'acesso', label: 'Acesso noturno ao Financeiro' },
    { id: 'email-801', unlockedByMission: 9, sortKey: '2024-03-11T21:00:00', type: 'e-mail', label: 'Pedido urgente enviado' },
    { id: 'transfer-502', unlockedByMission: 3, sortKey: '2024-03-15T22:45:00', type: 'transação', label: 'Transferência de alto valor' },
    { id: 'access-702', unlockedByMission: 4, sortKey: '2024-03-15T22:10:00', type: 'acesso', label: 'Acesso noturno à Tesouraria' },
    { id: 'email-802', unlockedByMission: 9, sortKey: '2024-03-14T20:30:00', type: 'e-mail', label: 'Mensagem sobre transferência ponte' },
    { id: 'access-703', unlockedByMission: 4, sortKey: '2024-03-18T23:00:00', type: 'acesso', label: 'Acesso noturno ao Financeiro' },
    { id: 'transfer-503', unlockedByMission: 3, sortKey: '2024-03-18T23:30:00', type: 'transação', label: 'Transferência de alto valor' },
    { id: 'transfer-504', unlockedByMission: 3, sortKey: '2024-03-22T01:10:00', type: 'transação', label: 'Transferência de alto valor' },
  ],
};

// [1] Eventos desbloqueados por missão
console.log('\n[1] getUnlockedEvents — filtra por missões concluídas');
const ev3 = getUnlockedEvents(timelineConfig, [3]);
assert(ev3.length === 4, `missão 3 desbloqueia 4 eventos (got ${ev3.length})`);
assert(ev3.every(e => e.unlockedByMission === 3), 'todos os eventos são da missão 3');

const ev39 = getUnlockedEvents(timelineConfig, [3, 9]);
assert(ev39.length === 6, `missões 3+9 desbloqueiam 6 eventos (got ${ev39.length})`);

const evAll = getUnlockedEvents(timelineConfig, [3, 4, 9]);
assert(evAll.length === 9, `missões 3+4+9 desbloqueiam 9 eventos (got ${evAll.length})`);

console.log('\n[2] getUnlockedEvents — ordena por sortKey');
assert(ev3[0].id === 'transfer-501', `primeiro por sortKey = transfer-501 (got ${ev3[0].id})`);
assert(ev3[3].id === 'transfer-504', `último por sortKey = transfer-504 (got ${ev3[3].id})`);

console.log('\n[3] normalizeOrder — preserva ordem escolhida, remove inválidos');
const order = ['transfer-504', 'transfer-501'];
const normalized = normalizeOrder(timelineConfig, [3], order);
assert(normalized[0] === 'transfer-504', 'ordem preservada');
assert(normalized[1] === 'transfer-501', 'ordem preservada');
assert(normalized.length === 4, `eventos novos adicionados no fim (got ${normalized.length})`);

console.log('\n[4] normalizeOrder — remove duplicados');
const dupOrder = ['transfer-501', 'transfer-501', 'transfer-503'];
const deduped = normalizeOrder(timelineConfig, [3], dupOrder);
assert(deduped.filter(id => id === 'transfer-501').length === 1, 'duplicado removido');

console.log('\n[5] normalizeOrder — remove IDs não desbloqueados');
const badOrder = ['transfer-501', 'email-801', 'fake-id'];
const cleaned = normalizeOrder(timelineConfig, [3], badOrder);
assert(!cleaned.includes('email-801'), 'email-801 não desbloqueado removido');
assert(!cleaned.includes('fake-id'), 'ID inválido removido');
assert(cleaned.includes('transfer-501'), 'transfer-501 mantido');

console.log('\n[6] normalizeOrder — simula reload com ordem salva');
const savedOrder = ['access-701', 'transfer-501', 'transfer-503', 'transfer-502', 'transfer-504'];
const afterReload = normalizeOrder(timelineConfig, [3, 4], savedOrder);
assert(afterReload.includes('access-701'), 'access-701 preservado do save');
assert(afterReload.includes('access-702'), 'access-702 adicionado (recém-desbloqueado)');

console.log('\n[7] moveEvent — move para cima');
const arr = ['a', 'b', 'c'];
assert(JSON.stringify(moveEvent(arr, 1, 'up')) === '["b","a","c"]', 'move up');
assert(JSON.stringify(moveEvent(arr, 2, 'up')) === '["a","c","b"]', 'move up do último');

console.log('\n[8] moveEvent — move para baixo');
assert(JSON.stringify(moveEvent(arr, 0, 'down')) === '["b","a","c"]', 'move down');
assert(JSON.stringify(moveEvent(arr, 1, 'down')) === '["a","c","b"]', 'move down do meio');

console.log('\n[9] moveEvent — não muta array original');
assert(JSON.stringify(arr) === '["a","b","c"]', 'array original intacto');

console.log('\n[10] moveEvent — limites');
assert(JSON.stringify(moveEvent(arr, 0, 'up')) === '["a","b","c"]', 'move up no início não altera');
assert(JSON.stringify(moveEvent(arr, 2, 'down')) === '["a","b","c"]', 'move down no fim não altera');

console.log('\n[11] validateOrder — ordem correta');
const correctOrder = evAll.map(e => e.id);
assert(validateOrder(timelineConfig, [3, 4, 9], correctOrder) === true, 'ordem correta -> true');

console.log('\n[12] validateOrder — ordem incorreta');
const wrongOrder = [...correctOrder].reverse();
assert(validateOrder(timelineConfig, [3, 4, 9], wrongOrder) === false, 'ordem reversa -> false');

console.log('\n[13] validateOrder — ordem incompleta');
assert(validateOrder(timelineConfig, [3, 4, 9], correctOrder.slice(0, 5)) === false, 'ordem incompleta -> false');

console.log('\n[14] checkTimelineBonus — concede bônus na primeira vez');
const bonus1 = checkTimelineBonus(timelineConfig, [3, 4, 9], correctOrder, false);
assert(bonus1.awarded === true, 'awarded=true');
assert(bonus1.bonusPoints === 200, 'bonusPoints=200');
assert(bonus1.allCorrect === true, 'allCorrect=true');

console.log('\n[15] checkTimelineBonus — idempotente: não concede segunda vez');
const bonus2 = checkTimelineBonus(timelineConfig, [3, 4, 9], correctOrder, true);
assert(bonus2.awarded === false, 'awarded=false (já concedido)');
assert(bonus2.bonusPoints === 0, 'bonusPoints=0 (já concedido)');
assert(bonus2.allCorrect === true, 'allCorrect=true (mesmo assim)');

console.log('\n[16] checkTimelineBonus — ordem incorreta não concede');
const bonus3 = checkTimelineBonus(timelineConfig, [3, 4, 9], wrongOrder, false);
assert(bonus3.awarded === false, 'awarded=false (ordem errada)');
assert(bonus3.allCorrect === false, 'allCorrect=false');

console.log('\n[17] normalizeOrder — simula reload: ordem correta persiste');
// Simula: jogador acertou, recarregou, ordem salva deve continuar válida
const persistedOrder = correctOrder;
const reNormalized = normalizeOrder(timelineConfig, [3, 4, 9], persistedOrder);
assert(JSON.stringify(reNormalized) === JSON.stringify(correctOrder), 'ordem persiste após reload');
assert(validateOrder(timelineConfig, [3, 4, 9], reNormalized) === true, 'ordem re-normalizada é válida');

console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);