/**
 * test_suspect_meter.js — Testes do módulo puro suspect-meter.js
 * Executa com: node test/test_suspect_meter.js
 */

const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

const code = readSource('suspect-meter.js');
const mod = evalModule(transformESM(code), {}, 'suspect-meter.js');
const { deriveSuspicion, getSuspectProfiles } = mod;

const suspectsConfig = {
  profiles: [
    { id: 'pessoa-07', initialLabel: 'Pessoa de interesse #7', revealedLabel: 'Camila Torres', revealAtMission: 5 },
    { id: 'pessoa-04', initialLabel: 'Pessoa de interesse #4', revealedLabel: 'Diego Fernandes', revealAtMission: 99 },
  ],
  deltasByMission: {
    2: [{ suspectId: 'pessoa-07', delta: 10 }],
    4: [{ suspectId: 'pessoa-07', delta: 25 }, { suspectId: 'pessoa-04', delta: 15 }],
    5: [{ suspectId: 'pessoa-07', delta: 15 }],
    6: [{ suspectId: 'pessoa-07', delta: 10 }],
    7: [{ suspectId: 'pessoa-07', delta: 10 }],
    9: [{ suspectId: 'pessoa-07', delta: 10 }],
    10: [{ suspectId: 'pessoa-07', delta: 10 }],
    11: [{ suspectId: 'pessoa-07', delta: 5 }],
    12: [{ suspectId: 'pessoa-07', delta: 5 }],
  },
};

console.log('\n[1] deriveSuspicion — 0 missões = 0');
assert(deriveSuspicion(suspectsConfig, []) === 0, '0 missões -> 0');

console.log('\n[2] deriveSuspicion — soma corretamente');
assert(deriveSuspicion(suspectsConfig, [2]) === 10, 'missão 2 -> 10');
assert(deriveSuspicion(suspectsConfig, [2, 4]) === 50, 'missões 2+4 -> 50 (10+25+15)');
assert(deriveSuspicion(suspectsConfig, [2, 4, 5]) === 65, 'missões 2+4+5 -> 65');

console.log('\n[3] deriveSuspicion — limita a 100');
assert(deriveSuspicion(suspectsConfig, [2, 4, 5, 6, 7, 9, 10, 11, 12]) === 100, 'todas as missões -> 100');

console.log('\n[4] deriveSuspicion — determinístico (recarregar não duplica)');
assert(deriveSuspicion(suspectsConfig, [2, 4]) === deriveSuspicion(suspectsConfig, [2, 4]), 'mesma entrada = mesma saída');

console.log('\n[5] deriveSuspicion — missão sem delta = 0');
assert(deriveSuspicion(suspectsConfig, [1]) === 0, 'missão 1 (sem delta) -> 0');
assert(deriveSuspicion(suspectsConfig, [3]) === 0, 'missão 3 (sem delta) -> 0');

console.log('\n[6] getSuspectProfiles — não revela Camila antes da missão 5');
const profilesBefore = getSuspectProfiles(suspectsConfig, [1, 2, 3, 4]);
const p07Before = profilesBefore.find(p => p.id === 'pessoa-07');
assert(p07Before.label === 'Pessoa de interesse #7', 'antes da missão 5: label neutro');
assert(p07Before.revealed === false, 'antes da missão 5: revealed=false');

console.log('\n[7] getSuspectProfiles — revela Camila na missão 5');
const profilesAt5 = getSuspectProfiles(suspectsConfig, [1, 2, 3, 4, 5]);
const p07At5 = profilesAt5.find(p => p.id === 'pessoa-07');
assert(p07At5.label === 'Camila Torres', 'após missão 5: label revelado');
assert(p07At5.revealed === true, 'após missão 5: revealed=true');

console.log('\n[8] getSuspectProfiles — suspeita individual correta');
assert(p07At5.suspicion === 50, 'pessoa-07 após missões 2+4+5 = 50');
const p04At5 = profilesAt5.find(p => p.id === 'pessoa-04');
assert(p04At5.suspicion === 15, 'pessoa-04 após missão 4 = 15');

console.log('\n[9] getSuspectProfiles — pessoa-04 nunca é revelada (revealAtMission=99)');
assert(p04At5.label === 'Pessoa de interesse #4', 'pessoa-04 mantém label neutro');
assert(p04At5.revealed === false, 'pessoa-04 revealed=false');

console.log('\n[10] getSuspectProfiles — determinístico');
const profiles1 = getSuspectProfiles(suspectsConfig, [2, 4, 5]);
const profiles2 = getSuspectProfiles(suspectsConfig, [2, 4, 5]);
assert(JSON.stringify(profiles1) === JSON.stringify(profiles2), 'mesma entrada = mesma saída');

console.log('\n[11] getSuspectProfiles — ordem das missões não importa');
const profiles3 = getSuspectProfiles(suspectsConfig, [5, 4, 2]);
const profiles4 = getSuspectProfiles(suspectsConfig, [2, 4, 5]);
assert(JSON.stringify(profiles3) === JSON.stringify(profiles4), 'ordem não importa');

console.log('\n[12] deriveSuspicion — config nula retorna 0');
assert(deriveSuspicion(null, [1, 2]) === 0, 'config null -> 0');

console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);