/** Regressão do certificado: conclusão, selo estável e saída segura. */
const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) { console.log(`  PASS: ${message}`); passed++; }
  else { console.log(`  FAIL: ${message}`); failed++; }
}

const caseDefinition = {
  id: 'case-test',
  title: 'Caso <Seguro>',
  category: 'Dados & BI',
  LEVELS: [{ id: 1 }, { id: 2 }],
  CASE_CONCLUSION: { cargo: 'Analista de BI' },
  GAMEPLAY: { finalChallenge: { requiredMission: 2 } },
};

let savedState = {
  progressByCase: {
    'case-test': {
      completedLevels: [1],
      levelProgress: { 1: { stars: 3 } },
      score: 300,
      interrogation: { status: 'active' },
    },
  },
};

function isCaseComplete(definition, progressByCase) {
  const progress = progressByCase[definition.id];
  const completed = new Set(progress?.completedLevels || []);
  const levelsDone = definition.LEVELS.every(level => completed.has(level.id));
  return levelsDone && (!definition.GAMEPLAY?.finalChallenge || progress.interrogation?.status === 'won');
}

const printDocument = { html: '', write(value) { this.html += value; }, close() {} };
const printWindow = { document: printDocument, printCalled: false, print() { this.printCalled = true; } };
let popupAllowed = true;
const windowMock = { open: () => (popupAllowed ? printWindow : null) };

const code = transformESM(readSource('certificate.js'));
const certificate = evalModule(code, {
  loadState: () => savedState,
  getAllCases: () => [caseDefinition],
  getCaseById: id => (id === caseDefinition.id ? caseDefinition : null),
  isCaseComplete: isCaseComplete,
  window: windowMock,
  document: { getElementById: () => null },
}, 'certificate.js');

console.log('\n=== Certificado ===');
assert(certificate.gerarDadosCertificado('case-test') === null, 'Cenário incompleto não emite certificado');

savedState.progressByCase['case-test'] = {
  completedLevels: [1, 2],
  levelProgress: { 1: { stars: 3 }, 2: { stars: 2 } },
  score: 500,
  completedAt: '2026-08-17T12:00:00.000Z',
  interrogation: { status: 'won' },
};

const data = certificate.gerarDadosCertificado('case-test', '  Ana   <Silva>  ');
assert(data && data.nome === 'Ana <Silva>', 'Nome é normalizado sem perder o texto informado');
assert(data.pontuacao === 500 && data.estrelasObtidas === 5 && data.estrelasMaximas === 6, 'Pontuação e estrelas vêm do progresso real');
assert(data.data === '17/08/2026', 'Data de conclusão persistida é usada no certificado');

const hashA = certificate.gerarHashSelo('case-test', 'Ana', savedState.progressByCase['case-test']);
const hashB = certificate.gerarHashSelo('case-test', 'Ana', savedState.progressByCase['case-test']);
const hashC = certificate.gerarHashSelo('case-test', 'Bia', savedState.progressByCase['case-test']);
assert(hashA === hashB, 'Selo é estável para os mesmos dados');
assert(hashA !== hashC, 'Selo muda quando a identidade muda');

printDocument.html = '';
assert(certificate.baixarCertificado('case-test', 'Ana <Silva>') === true, 'Certificado concluído abre a impressão');
assert(printDocument.html.includes('Ana &lt;Silva&gt;'), 'Nome é escapado no HTML de impressão');
assert(printDocument.html.includes('Caso &lt;Seguro&gt;'), 'Título do caso é escapado no HTML de impressão');

popupAllowed = false;
assert(certificate.baixarCertificado('case-test', 'Ana') === false, 'Bloqueio de popup é comunicado pelo retorno');
assert(certificate.listarCertificados().length === 1, 'Portfólio lista somente o cenário concluído');

console.log(`\nRESULTADO: ${passed} passaram, ${failed} falharam`);
process.exit(failed ? 1 : 0);
