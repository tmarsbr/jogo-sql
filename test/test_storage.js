/**
 * test_storage.js — Testes de persistência via localStorage.
 *
 * Executa com: node test/test_storage.js
 *
 * Importa as funções reais de src/storage.js via load-source.js.
 * Usa um mock de localStorage para simular o ambiente do navegador.
 */

const { loadStorage } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

// === Mock de localStorage ===
class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] ?? null; }
  setItem(key, val) { this.store[key] = String(val); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

// === Carrega módulo real com mock ===
const mockStorage = new LocalStorageMock();
const storage = loadStorage(mockStorage);
const { getDefaultState, saveState, loadState, clearState, hasSavedState } = storage;

// === Teste 1: Estado padrão ===
console.log('\n[1] Estado padrão');
const def = getDefaultState();
assert(def.currentLevel === null, 'currentLevel = null');
assert(Array.isArray(def.completedLevels), 'completedLevels é array');
assert(def.completedLevels.length === 0, 'completedLevels vazio');
assert(typeof def.levelProgress === 'object', 'levelProgress é objeto');
assert(def.score === 0, 'score = 0');
assert(Array.isArray(def.evidence), 'evidence é array');

// === Teste 2: loadState sem progresso salvo ===
console.log('\n[2] loadState sem progresso');
mockStorage.clear();
const empty = loadState();
assert(empty.currentLevel === null, 'Sem progresso: currentLevel null');
assert(empty.completedLevels.length === 0, 'Sem progresso: completedLevels vazio');

// === Teste 3: saveState + loadState ===
console.log('\n[3] saveState + loadState');
mockStorage.clear();
const state1 = { currentLevel: 3, completedLevels: [1, 2], levelProgress: { 1: { stars: 3, hintsUsed: 0 }, 2: { stars: 2, hintsUsed: 1 } }, score: 500, evidence: ['Evidência 1', 'Evidência 2'] };
const saved = saveState(state1);
assert(saved === true, 'saveState retorna true');
const loaded = loadState();
assert(loaded.currentLevel === 3, 'loadState: currentLevel=3');
assert(loaded.completedLevels.length === 2, 'loadState: 2 níveis concluídos');
assert(loaded.completedLevels.includes(1), 'loadState: inclui nível 1');
assert(loaded.completedLevels.includes(2), 'loadState: inclui nível 2');
assert(loaded.levelProgress[1].stars === 3, 'loadState: nível 1 = 3 estrelas');
assert(loaded.levelProgress[2].stars === 2, 'loadState: nível 2 = 2 estrelas');
assert(loaded.score === 500, 'loadState: score=500');
assert(loaded.evidence.length === 2, 'loadState: 2 evidências');

// === Teste 4: clearState ===
console.log('\n[4] clearState');
const cleared = clearState();
assert(cleared === true, 'clearState retorna true');
const afterClear = loadState();
assert(afterClear.currentLevel === null, 'Após clear: currentLevel null');
assert(afterClear.completedLevels.length === 0, 'Após clear: vazio');

// === Teste 5: hasSavedState ===
console.log('\n[5] hasSavedState');
mockStorage.clear();
assert(hasSavedState() === false, 'Sem progresso: false');
saveState({ currentLevel: 1, completedLevels: [], levelProgress: {}, score: 0, evidence: [] });
assert(hasSavedState() === true, 'Com progresso: true');

// === Teste 6: Dados corrompidos ===
console.log('\n[6] Dados corrompidos');
mockStorage.setItem('sql_detective_v2', '{invalid json');
const corrupted = loadState();
assert(corrupted.currentLevel === null, 'Corrompido: retorna padrão');
assert(corrupted.completedLevels.length === 0, 'Corrompido: vazio');

// === Teste 7: Dados parciais ===
console.log('\n[7] Dados parciais');
mockStorage.setItem('sql_detective_v2', JSON.stringify({ currentLevel: 5 }));
const partial = loadState();
assert(partial.currentLevel === 5, 'Parcial: currentLevel=5');
assert(partial.completedLevels.length === 0, 'Parcial: completedLevels padrão');
assert(partial.score === 0, 'Parcial: score padrão');

// === Teste 8: Tipos inválidos ===
console.log('\n[8] Tipos inválidos');
mockStorage.setItem('sql_detective_v2', JSON.stringify({ currentLevel: 'abc', completedLevels: 'nao_e_array', score: 'nao_e_numero' }));
const invalid = loadState();
assert(invalid.currentLevel === null, 'Tipo inválido: currentLevel → null');
assert(invalid.completedLevels.length === 0, 'Tipo inválido: completedLevels → []');
assert(invalid.score === 0, 'Tipo inválido: score → 0');
mockStorage.setItem('sql_detective_v2', JSON.stringify({ currentLevel: -3 }));
assert(loadState().currentLevel === null, 'Valor inválido: currentLevel negativo → null');
mockStorage.setItem('sql_detective_v2', JSON.stringify({ currentLevel: 2.5 }));
assert(loadState().currentLevel === null, 'Valor inválido: currentLevel fracionário → null');

// === Teste 9: completedLevels com tipos mistos ===
console.log('\n[9] completedLevels com tipos mistos');
mockStorage.setItem('sql_detective_v2', JSON.stringify({ completedLevels: [1, 'abc', 3, null, 5] }));
const mixed = loadState();
assert(mixed.completedLevels.length === 3, 'Filtra não-números: [1,3,5]');
assert(mixed.completedLevels.includes(1), 'Inclui 1');
assert(mixed.completedLevels.includes(3), 'Inclui 3');
assert(mixed.completedLevels.includes(5), 'Inclui 5');

// === Teste 10: evidence com tipos mistos ===
console.log('\n[10] evidence com tipos mistos');
mockStorage.setItem('sql_detective_v2', JSON.stringify({ evidence: ['ev1', 123, 'ev2', null] }));
const mixedEv = loadState();
assert(mixedEv.evidence.length === 2, 'Filtra não-strings: [ev1, ev2]');

// === Teste 11: levelProgress com entradas inválidas ===
console.log('\n[11] levelProgress inválido');
mockStorage.setItem('sql_detective_v2', JSON.stringify({ levelProgress: { 1: { stars: 3 }, 2: 'invalid', 3: { stars: 'abc' } } }));
const invalidProg = loadState();
assert(invalidProg.levelProgress[1].stars === 3, 'Válido: nível 1 preservado');
assert(invalidProg.levelProgress[2] === undefined, 'Inválido string: descartado');
assert(invalidProg.levelProgress[3] === undefined, 'Inválido stars: descartado');

// === Teste 12: Múltiplos saves ===
console.log('\n[12] Múltiplos saves');
mockStorage.clear();
saveState({ currentLevel: 1, completedLevels: [1], levelProgress: { 1: { stars: 2, hintsUsed: 1 } }, score: 200, evidence: ['E1'] });
saveState({ currentLevel: 2, completedLevels: [1, 2], levelProgress: { 1: { stars: 2, hintsUsed: 1 }, 2: { stars: 3, hintsUsed: 0 } }, score: 500, evidence: ['E1', 'E2'] });
const multi = loadState();
assert(multi.currentLevel === 2, 'Último save: currentLevel=2');
assert(multi.completedLevels.length === 2, 'Último save: 2 concluídos');
assert(multi.score === 500, 'Último save: score=500');

// === Teste 13: Migração v1 -> v2 e progresso separado por caso ===
console.log('\n[13] Migração multi-caso');
mockStorage.clear();
mockStorage.setItem('sql_detective_v1', JSON.stringify({ currentLevel: 4, completedLevels: [1, 2, 3], levelProgress: { 1: { stars: 3, hintsUsed: 0 } }, score: 700, evidence: ['E1'] }));
const migrated = loadState();
assert(migrated.currentCase === 'case001', 'v1 migra para case001');
assert(migrated.progressByCase.case001.currentLevel === 4, 'Progresso v1 preserva missão atual');
assert(mockStorage.getItem('sql_detective_v1') === null, 'Chave v1 é removida após migração');
assert(mockStorage.getItem('sql_detective_v2') !== null, 'Chave v2 é criada após migração');

saveState({
  currentCase: 'case002',
  progressByCase: {
    case001: migrated.progressByCase.case001,
    case002: { currentLevel: 2, completedLevels: [1], levelProgress: { 1: { stars: 2, hintsUsed: 1 } }, score: 200, evidence: ['E2'] },
  },
  currentLevel: 2, completedLevels: [1], levelProgress: { 1: { stars: 2, hintsUsed: 1 } }, score: 200, evidence: ['E2'],
});
const multiCase = loadState();
assert(multiCase.currentCase === 'case002', 'Caso ativo v2 é restaurado');
assert(multiCase.progressByCase.case001.completedLevels.length === 3, 'Progresso do case001 é independente');
assert(multiCase.completedLevels.length === 1, 'Campos ativos refletem somente case002');

// === Teste 14: Conflitos entre v1 e v2 ===
console.log('\n[14] Conflitos v1/v2');
mockStorage.clear();
saveState({
  currentCase: 'case003',
  progressByCase: {
    case001: { currentLevel: 1, completedLevels: [1], levelProgress: {}, score: 100, evidence: [] },
    case003: { currentLevel: 4, completedLevels: [1, 2, 3], levelProgress: {}, score: 300, evidence: ['E3'] },
  },
});
const canonicalOnly = loadState();
assert(canonicalOnly.currentCase === 'case003' && canonicalOnly.score === 300, 'Formato canônico sem campos espelho preserva o caso ativo');

mockStorage.clear();
mockStorage.setItem('sql_detective_v2', JSON.stringify({
  currentCase: 'case002',
  progressByCase: {
    case001: { currentLevel: 2, completedLevels: [1, 2], levelProgress: {}, score: 200, evidence: [] },
    case002: { currentLevel: 1, completedLevels: [], levelProgress: {}, score: 0, evidence: [] },
  },
}));
mockStorage.setItem('sql_detective_v1', JSON.stringify({ currentLevel: 9, completedLevels: [1, 2, 3], levelProgress: {}, score: 900, evidence: [] }));
const v2Wins = loadState();
assert(v2Wins.currentCase === 'case002' && v2Wins.progressByCase.case001.score === 200, 'v2 completo vence uma chave v1 residual');

mockStorage.clear();
mockStorage.setItem('sql_detective_v2', JSON.stringify({ currentCase: 'case002', progressByCase: { case001: { currentLevel: null, completedLevels: [], levelProgress: {}, score: 0, evidence: [] }, case002: { currentLevel: 1, completedLevels: [], levelProgress: {}, score: 0, evidence: [] } } }));
mockStorage.setItem('sql_detective_v1', JSON.stringify({ currentLevel: 5, completedLevels: [1], levelProgress: {}, score: 100, evidence: ['E1'] }));
const merged = loadState();
assert(merged.currentCase === 'case002' && merged.progressByCase.case001.currentLevel === 5, 'v1 é migrado quando o case001 de v2 está vazio');

mockStorage.clear();
mockStorage.setItem('sql_detective_v2', JSON.stringify({ currentCase: 'case002', progressByCase: { case002: { currentLevel: 3, completedLevels: [1, 2], levelProgress: {}, score: 200, evidence: [] } } }));
mockStorage.setItem('sql_detective_v1', '{invalid json');
const ignoresBadLegacy = loadState();
assert(ignoresBadLegacy.currentCase === 'case002' && ignoresBadLegacy.currentLevel === 3, 'v1 corrompido não bloqueia v2 válido');

// === Teste 15: Save antigo sem campos de gameplay recebe defaults ===
console.log('\n[15] Save antigo sem campos de gameplay recebe defaults');
mockStorage.clear();
mockStorage.setItem('sql_detective_v2', JSON.stringify({
  currentCase: 'case001',
  progressByCase: {
    case001: { currentLevel: 5, completedLevels: [1, 2, 3], levelProgress: { 1: { stars: 3, hintsUsed: 0 } }, score: 300, evidence: ['E1'] },
  },
}));
const oldSave = loadState();
assert(oldSave.progressByCase.case001.timelineOrder !== undefined, 'timelineOrder recebe default');
assert(Array.isArray(oldSave.progressByCase.case001.timelineOrder), 'timelineOrder é array');
assert(oldSave.progressByCase.case001.timelineOrder.length === 0, 'timelineOrder vazio');
assert(oldSave.progressByCase.case001.timelineBonusAwarded === false, 'timelineBonusAwarded=false');
assert(oldSave.progressByCase.case001.bonusPoints === 0, 'bonusPoints=0');
assert(oldSave.progressByCase.case001.interrogation !== undefined, 'interrogation recebe default');
assert(oldSave.progressByCase.case001.interrogation.status === 'locked', 'interrogation.status=locked');
assert(oldSave.progressByCase.case001.interrogation.stepIndex === 0, 'interrogation.stepIndex=0');
assert(Array.isArray(oldSave.progressByCase.case001.interrogation.presentedEvidenceIds), 'presentedEvidenceIds é array');

// === Teste 16: Isolamento entre casos — timeline, bônus e interrogatório ===
console.log('\n[16] Isolamento entre casos');
mockStorage.clear();
saveState({
  currentCase: 'case001',
  progressByCase: {
    case001: {
      currentLevel: 12, completedLevels: [1,2,3,4,5,6,7,8,9,10,11,12], levelProgress: {}, score: 1000, evidence: [],
      timelineOrder: ['transfer-501', 'access-701'], timelineBonusAwarded: true, bonusPoints: 200,
      interrogation: { status: 'won', stepIndex: 3, presentedEvidenceIds: ['transfer-501', 'access-701', 'email-801'] },
    },
    case002: {
      currentLevel: 2, completedLevels: [1], levelProgress: {}, score: 100, evidence: [],
      timelineOrder: [], timelineBonusAwarded: false, bonusPoints: 0,
      interrogation: { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] },
    },
  },
});
const isolated = loadState();
assert(isolated.progressByCase.case001.timelineBonusAwarded === true, 'case001: bônus concedido');
assert(isolated.progressByCase.case002.timelineBonusAwarded === false, 'case002: bônus não concedido');
assert(isolated.progressByCase.case001.interrogation.status === 'won', 'case001: interrogatório vencido');
assert(isolated.progressByCase.case002.interrogation.status === 'locked', 'case002: interrogatório bloqueado');
assert(isolated.progressByCase.case001.bonusPoints === 200, 'case001: 200 pontos de bônus');
assert(isolated.progressByCase.case002.bonusPoints === 0, 'case002: 0 pontos de bônus');

// === Teste 17: Validação de tipos inválidos nos novos campos ===
console.log('\n[17] Validação de tipos inválidos nos novos campos');
mockStorage.setItem('sql_detective_v2', JSON.stringify({
  currentCase: 'case001',
  progressByCase: {
    case001: {
      currentLevel: 1, completedLevels: [1], levelProgress: {}, score: 0, evidence: [],
      timelineOrder: [123, 'valid-id', null, 'another-valid'],
      timelineBonusAwarded: 'not-boolean',
      bonusPoints: 'not-number',
      interrogation: { status: 'invalid-status', stepIndex: 'abc', presentedEvidenceIds: [123, 'valid', null, 'valid'] },
      lessonsRead: [123, 'sql-intro', null, 'sql-intro'],
    },
  },
}));
const badTypes = loadState();
const p = badTypes.progressByCase.case001;
assert(p.timelineOrder.length === 2, 'timelineOrder filtra não-strings');
assert(p.timelineBonusAwarded === false, 'timelineBonusAwarded inválido -> false');
assert(p.bonusPoints === 0, 'bonusPoints inválido -> 0');
assert(p.interrogation.status === 'locked', 'interrogation.status inválido -> locked');
assert(p.interrogation.stepIndex === 0, 'interrogation.stepIndex inválido -> 0');
assert(p.interrogation.presentedEvidenceIds.length === 1, 'presentedEvidenceIds dedup e filtra');
assert(p.lessonsRead.length === 1 && p.lessonsRead[0] === 'sql-intro', 'lessonsRead dedup e filtra');

// === Teste 18: Progresso dos projetos analiticos persiste ===
console.log('\n[18] Persistencia dos projetos analiticos');
mockStorage.clear();
saveState({
  currentCase: 'proj-ecommerce',
  progressByCase: {
    case001: getDefaultState().progressByCase.case001,
    'proj-ecommerce': {
      currentLevel: 4,
      completedLevels: [1, 2, 3],
      levelProgress: {
        1: { stars: 3, hintsUsed: 0 },
        2: { stars: 2, hintsUsed: 1 },
        3: { stars: 3, hintsUsed: 0 },
      },
      score: 800,
      evidence: ['E-commerce 1', 'E-commerce 2', 'E-commerce 3'],
      lessonsRead: ['aggregation-groupby'],
    },
  },
  currentLevel: 4,
  completedLevels: [1, 2, 3],
  levelProgress: {
    1: { stars: 3, hintsUsed: 0 },
    2: { stars: 2, hintsUsed: 1 },
    3: { stars: 3, hintsUsed: 0 },
  },
  score: 800,
  evidence: ['E-commerce 1', 'E-commerce 2', 'E-commerce 3'],
  lessonsRead: ['aggregation-groupby'],
});
const projectSave = loadState();
assert(projectSave.currentCase === 'proj-ecommerce', 'Projeto ativo e restaurado apos recarregar');
assert(projectSave.progressByCase['proj-ecommerce'].currentLevel === 4, 'Missao atual do projeto e preservada');
assert(projectSave.progressByCase['proj-ecommerce'].completedLevels.length === 3, 'Missoes concluidas do projeto sao preservadas');
assert(projectSave.progressByCase['proj-ecommerce'].score === 800, 'Pontuacao do projeto e preservada');
assert(projectSave.progressByCase['proj-ecommerce'].lessonsRead[0] === 'aggregation-groupby', 'Aulas lidas do projeto sao preservadas');

// === Resultado ===
console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
