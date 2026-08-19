/**
 * test_interrogation.js — Testes do módulo puro interrogation.js
 * Executa com: node test/test_interrogation.js
 */

const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

const code = readSource('interrogation.js');
const mod = evalModule(transformESM(code), {}, 'interrogation.js');
const {
  createInterrogationState, normalizeInterrogationState, reconcileInterrogationState,
  isInterrogationAvailable, startInterrogation, presentEvidence,
} = mod;

const finalChallenge = {
  type: 'interrogation',
  suspectName: 'Camila Torres',
  requiredMission: 12,
  steps: [
    { statement: 'Não houve transferência irregular.', evidenceId: 'transfer-501', successMessage: 'Evidência 1 confirmada.' },
    { statement: 'Nunca acessei o sistema fora do horário.', evidenceId: 'access-701', successMessage: 'Evidência 2 confirmada.' },
    { statement: 'Nunca pedi que o pagamento fosse escondido.', evidenceId: 'email-801', successMessage: 'Evidência 3 confirmada. Confissão obtida.' },
  ],
};

const timelineConfig = {
  events: [
    { id: 'transfer-501', unlockedByMission: 3, sortKey: '2024-03-12T23:15:00' },
    { id: 'access-701', unlockedByMission: 4, sortKey: '2024-03-12T22:30:00' },
    { id: 'email-801', unlockedByMission: 9, sortKey: '2024-03-11T21:00:00' },
  ],
};

console.log('\n[1] createInterrogationState — estado inicial');
const initial = createInterrogationState();
assert(initial.status === 'locked', 'status=locked');
assert(initial.stepIndex === 0, 'stepIndex=0');
assert(Array.isArray(initial.presentedEvidenceIds) && initial.presentedEvidenceIds.length === 0, 'presentedEvidenceIds=[]');

console.log('\n[2] normalizeInterrogationState — save antigo recebe defaults');
const oldSave = null;
const normalized = normalizeInterrogationState(oldSave);
assert(normalized.status === 'locked', 'null -> status=locked');
assert(normalized.stepIndex === 0, 'null -> stepIndex=0');
assert(normalized.presentedEvidenceIds.length === 0, 'null -> presentedEvidenceIds=[]');

console.log('\n[3] normalizeInterrogationState — deduplica IDs');
const dupState = { status: 'active', stepIndex: 1, presentedEvidenceIds: ['a', 'a', 'b'] };
const deduped = normalizeInterrogationState(dupState);
assert(deduped.presentedEvidenceIds.length === 2, 'deduplicado -> 2 IDs');

console.log('\n[4] normalizeInterrogationState — rejeita status inválido');
const badState = { status: 'invalid', stepIndex: 0, presentedEvidenceIds: [] };
const badNorm = normalizeInterrogationState(badState);
assert(badNorm.status === 'locked', 'status inválido -> locked');

console.log('\n[5] isInterrogationAvailable — bloqueado antes da missão 12');
const stateLocked = createInterrogationState();
assert(isInterrogationAvailable(finalChallenge, [1, 5, 11], stateLocked) === false, 'missão 12 não concluída -> indisponível');

console.log('\n[6] isInterrogationAvailable — disponível após missão 12');
assert(isInterrogationAvailable(finalChallenge, [1, 5, 12], stateLocked) === true, 'missão 12 concluída -> disponível');

console.log('\n[7] isInterrogationAvailable — não disponível se já vencido');
const wonState = { status: 'won', stepIndex: 3, presentedEvidenceIds: ['a', 'b', 'c'] };
assert(isInterrogationAvailable(finalChallenge, [1, 5, 12], wonState) === false, 'já vencido -> indisponível');

console.log('\n[8] startInterrogation — inicia o confronto');
const startResult = startInterrogation(finalChallenge, [1, 5, 12], stateLocked);
assert(startResult.started === true, 'started=true');
assert(startResult.state.status === 'active', 'status=active');
assert(startResult.state.stepIndex === 0, 'stepIndex=0');

console.log('\n[9] startInterrogation — não inicia se não disponível');
const startFail = startInterrogation(finalChallenge, [1, 5], stateLocked);
assert(startFail.started === false, 'started=false');
assert(startFail.reason === 'not_available', 'reason=not_available');

console.log('\n[10] presentEvidence — prova errada não avança');
const activeState = { status: 'active', stepIndex: 0, presentedEvidenceIds: [] };
const wrongEv = presentEvidence(finalChallenge, [1, 3, 4, 5, 9, 12], timelineConfig, activeState, 'access-701');
assert(wrongEv.accepted === false, 'accepted=false');
assert(wrongEv.completed === false, 'completed=false');
assert(wrongEv.reason === 'wrong_evidence', 'reason=wrong_evidence');
assert(wrongEv.state.stepIndex === 0, 'stepIndex não avançou');

console.log('\n[11] presentEvidence — prova correta avança uma etapa');
const correctEv1 = presentEvidence(finalChallenge, [1, 3, 4, 5, 9, 12], timelineConfig, activeState, 'transfer-501');
assert(correctEv1.accepted === true, 'accepted=true');
assert(correctEv1.completed === false, 'completed=false (ainda há 2 etapas)');
assert(correctEv1.state.stepIndex === 1, 'stepIndex=1');
assert(correctEv1.state.presentedEvidenceIds.includes('transfer-501'), 'evidence registrada');

console.log('\n[12] presentEvidence — segunda etapa');
const stateAfter1 = correctEv1.state;
const correctEv2 = presentEvidence(finalChallenge, [1, 3, 4, 5, 9, 12], timelineConfig, stateAfter1, 'access-701');
assert(correctEv2.accepted === true, 'accepted=true');
assert(correctEv2.completed === false, 'completed=false (ainda há 1 etapa)');
assert(correctEv2.state.stepIndex === 2, 'stepIndex=2');

console.log('\n[13] presentEvidence — terceira etapa encerra o caso');
const stateAfter2 = correctEv2.state;
const correctEv3 = presentEvidence(finalChallenge, [1, 3, 4, 5, 9, 12], timelineConfig, stateAfter2, 'email-801');
assert(correctEv3.accepted === true, 'accepted=true');
assert(correctEv3.completed === true, 'completed=true');
assert(correctEv3.state.status === 'won', 'status=won');
assert(correctEv3.state.stepIndex === 3, 'stepIndex=3');
assert(correctEv3.state.presentedEvidenceIds.length === 3, '3 evidências apresentadas');

console.log('\n[14] presentEvidence — não aceita evidência não desbloqueada');
const lockedEv = presentEvidence(finalChallenge, [1, 12], timelineConfig, activeState, 'transfer-501');
// transfer-501 é desbloqueado na missão 3; se missão 3 não foi concluída, não pode usar
const lockedEv2 = presentEvidence(finalChallenge, [1, 12], timelineConfig, activeState, 'email-801');
assert(lockedEv2.accepted === false, 'email-801 não desbloqueado (missão 9) -> rejected');
assert(lockedEv2.reason === 'evidence_locked', 'reason=evidence_locked');

console.log('\n[15] presentEvidence — não aceita se não está ativo');
const notActive = presentEvidence(finalChallenge, [1, 3, 4, 5, 9, 12], timelineConfig, stateLocked, 'transfer-501');
assert(notActive.accepted === false, 'estado locked -> rejected');
assert(notActive.reason === 'not_active', 'reason=not_active');

console.log('\n[16] presentEvidence — prova errada não penaliza (não reduz stepIndex nem pontos)');
const wrongEv2 = presentEvidence(finalChallenge, [1, 3, 4, 5, 9, 12], timelineConfig, activeState, 'fake-evidence-id');
assert(wrongEv2.accepted === false, 'accepted=false');
// O estado não deve ter mudado
assert(wrongEv2.state.stepIndex === 0, 'stepIndex não mudou');
assert(wrongEv2.state.presentedEvidenceIds.length === 0, 'presentedEvidenceIds não mudou');

console.log('\n[17] presentEvidence — já vencido retorna completed=true');
const wonResult = presentEvidence(finalChallenge, [1, 3, 4, 5, 9, 12], timelineConfig, correctEv3.state, 'transfer-501');
assert(wonResult.accepted === false, 'accepted=false (já vencido)');
assert(wonResult.completed === true, 'completed=true');
assert(wonResult.reason === 'already_won', 'reason=already_won');

console.log('\n[18] confrontation — casos avançados usam o mesmo motor até a vitória');
const confrontation = {
  ...finalChallenge,
  type: 'confrontation',
  requiredMission: 14,
};
const confrontationStart = startInterrogation(
  confrontation,
  [3, 4, 9, 14],
  createInterrogationState()
);
assert(confrontationStart.started === true, 'confrontation inicia após a missão exigida');
let confrontationState = confrontationStart.state;
for (const step of confrontation.steps) {
  confrontationState = presentEvidence(
    confrontation,
    [3, 4, 9, 14],
    timelineConfig,
    confrontationState,
    step.evidenceId
  ).state;
}
assert(confrontationState.status === 'won', 'confrontation chega ao estado won');

console.log('\n[19] reconcileInterrogationState — repara índice impossível de save corrompido');
const repaired = reconcileInterrogationState(finalChallenge, {
  status: 'active',
  stepIndex: 99,
  presentedEvidenceIds: ['transfer-501', 'id-inválido'],
});
assert(repaired.status === 'active', 'save reparado continua ativo');
assert(repaired.stepIndex === 1, 'índice é reconstruído pelas evidências válidas');
assert(repaired.presentedEvidenceIds.length === 1, 'IDs estranhos são removidos');

console.log('\n[20] presentEvidence — evidência já usada recebe motivo específico');
const repeated = presentEvidence(
  finalChallenge,
  [1, 3, 4, 5, 9, 12],
  timelineConfig,
  correctEv1.state,
  'transfer-501'
);
assert(repeated.accepted === false, 'evidência repetida não é aceita');
assert(repeated.reason === 'already_presented', 'reason=already_presented');

console.log('\n[21] desafio vazio ou de tipo desconhecido não fica disponível');
assert(
  isInterrogationAvailable({ type: 'confrontation', requiredMission: 14, steps: [] }, [14], stateLocked) === false,
  'confronto sem etapas permanece indisponível'
);
assert(
  isInterrogationAvailable({ ...finalChallenge, type: 'quiz' }, [12], stateLocked) === false,
  'tipo desconhecido permanece indisponível'
);

console.log('\n[22] configurações reais — casos 001, 005 e 006 chegam a won');
for (const [caseId, levelsPath] of [
  ['case001', 'levels.js'],
  ['case005', 'cases/case005/levels.js'],
  ['case006', 'cases/case006/levels.js'],
]) {
  const levelsModule = evalModule(transformESM(readSource(levelsPath)), {}, levelsPath);
  const challenge = levelsModule.GAMEPLAY.finalChallenge;
  const completedLevels = levelsModule.LEVELS.map(level => level.id);
  let actualState = startInterrogation(
    challenge,
    completedLevels,
    createInterrogationState()
  ).state;
  for (const step of challenge.steps) {
    actualState = presentEvidence(
      challenge,
      completedLevels,
      levelsModule.GAMEPLAY.timeline,
      actualState,
      step.evidenceId
    ).state;
  }
  assert(actualState.status === 'won', `${caseId}: fluxo real termina em won`);
}

console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
