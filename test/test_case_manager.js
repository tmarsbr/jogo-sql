/** Regressão do registry e do desbloqueio sequencial de casos. */
const { readSource, transformESM, evalModule, loadLevels, loadSchemaBuilderChallenges } = require('./helpers/load-source');

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) { console.log(`  PASS: ${message}`); passed++; }
  else { console.log(`  FAIL: ${message}`); failed++; }
}

function loadCaseModule(filename) {
  return evalModule(transformESM(readSource(filename)), {}, filename);
}

const legacyLevels = loadLevels();
const case002Levels = loadCaseModule('cases/case002/levels.js');
const case003Levels = loadCaseModule('cases/case003/levels.js');
const case004Levels = loadCaseModule('cases/case004/levels.js');
const case005Levels = loadCaseModule('cases/case005/levels.js');
const case006Levels = loadCaseModule('cases/case006/levels.js');
const projEcommerceLevels = loadCaseModule('cases/proj-ecommerce/levels.js');
const projClientesLevels = loadCaseModule('cases/proj-clientes/levels.js');
const projVendasLevels = loadCaseModule('cases/proj-vendas/levels.js');
const projMarketingLevels = loadCaseModule('cases/proj-marketing/levels.js');
const projLogisticaLevels = loadCaseModule('cases/proj-logistica/levels.js');
const projEstoqueLevels = loadCaseModule('cases/proj-estoque/levels.js');
const projEducacaoLevels = loadCaseModule('cases/proj-educacao/levels.js');
const projSaudeLevels = loadCaseModule('cases/proj-saude/levels.js');
const projFinanceiroLevels = loadCaseModule('cases/proj-financeiro/levels.js');
const projSuporteLevels = loadCaseModule('cases/proj-suporte/levels.js');
const projPublicoLevels = loadCaseModule('cases/proj-publico/levels.js');
const projFutebolLevels = loadCaseModule('cases/proj-futebol/levels.js');
const bugHunterLevels = {
  BUG_HUNTER_INTRO: { title: 'Bug Hunter', story: 'Corrija os relatórios quebrados.' },
  BUG_HUNTER_CONCLUSION: { title: 'Modo concluído' },
  BUG_CHALLENGES: [],
};
const schemaBuilderLevels = loadSchemaBuilderChallenges();
const managerCode = transformESM(readSource('case-manager.js'));
const manager = evalModule(managerCode, {
  case001Levels: legacyLevels,
  case002Levels: case002Levels,
  case003Levels: case003Levels,
  case004Levels: case004Levels,
  case005Levels: case005Levels,
  case006Levels: case006Levels,
  projEcommerceLevels: projEcommerceLevels,
  projClientesLevels: projClientesLevels,
  projVendasLevels: projVendasLevels,
  projMarketingLevels: projMarketingLevels,
  projLogisticaLevels: projLogisticaLevels,
  projEstoqueLevels: projEstoqueLevels,
  projEducacaoLevels: projEducacaoLevels,
  projSaudeLevels: projSaudeLevels,
  projFinanceiroLevels: projFinanceiroLevels,
  projSuporteLevels: projSuporteLevels,
  projPublicoLevels: projPublicoLevels,
  projFutebolLevels: projFutebolLevels,
  bugHunterLevels: bugHunterLevels,
  schemaBuilderLevels: schemaBuilderLevels,
}, 'case-manager.js');

console.log('\n=== Case Manager ===');
const allCases = manager.getAllCases();
assert(allCases.length === 20, 'Registry contém vinte cenários no total (6 investigações + 12 projetos + Bug Hunter + Construtor de Schema)');
assert(
  allCases.filter(item => !['bug-hunter', 'schema-builder'].includes(item.id)).every(item => item.DATABASE_ANALYSIS),
  'Todos os casos (exceto Bug Hunter e Construtor de Schema) expõem a Etapa 0 de análise do banco',
);
assert(
  manager.getInvestigations().length === 8 && manager.getInvestigations().some(item => item.id === 'bug-hunter') && manager.getInvestigations().some(item => item.id === 'schema-builder'),
  'getInvestigations retorna 8 itens investigativos incluindo o Bug Hunter e o Construtor de Schema',
);
assert(manager.getProjects().length === 12, 'getProjects retorna 12 projetos de análise de dados');
assert(manager.getCaseById('case005').number === '005' && manager.getCaseById('case006').number === '006', 'Novos casos mantêm numeração investigativa com três dígitos');
const case001Entities = manager.getCaseById('case001').DATABASE_ANALYSIS.entities.map(item => item.name);
assert(['funcionarios', 'transacoes', 'logs_acesso', 'emails'].every(name => case001Entities.includes(name)), 'Caso 001 introduz as quatro entidades centrais da normalização');
assert(manager.getCaseById('case003').title === 'A Rota da Cripto-Ativo', 'Busca caso por ID');
assert(manager.getCaseById('proj-ecommerce').title === 'E-Commerce: Produtos & Receita', 'Busca projeto por ID');
assert(manager.getCaseById('proj-futebol').title === 'Futebol: Scouts & Finalização', 'Busca projeto de futebol');
assert(manager.isCaseAvailable('proj-ecommerce', {}), 'Projetos iniciam desbloqueados sem depender de progresso prévio');
assert(manager.isCaseAvailable('proj-futebol', {}), 'Todos os 12 projetos analíticos estão livres desde o início');

const completed001 = { case001: { completedLevels: legacyLevels.LEVELS.map(level => level.id), interrogation: { status: 'won', stepIndex: 3, presentedEvidenceIds: [] } } };
assert(manager.isCaseAvailable('case002', completed001), 'Case002 desbloqueia ao concluir case001 + interrogatório');
assert(!manager.isCaseAvailable('case003', completed001), 'Case003 continua bloqueado sem case002');

// Sem interrogatório vencido, case002 não desbloqueia
const completed001NoInterrogation = { case001: { completedLevels: legacyLevels.LEVELS.map(level => level.id), interrogation: { status: 'locked', stepIndex: 0, presentedEvidenceIds: [] } } };
assert(!manager.isCaseAvailable('case002', completed001NoInterrogation), 'Case002 bloqueado sem interrogatório vencido');
assert(!manager.isCaseAvailable('case003', completed001), 'Case003 continua bloqueado sem case002');

const duplicated = { case001: { completedLevels: Array(12).fill(1), interrogation: { status: 'won', stepIndex: 3, presentedEvidenceIds: [] } } };
assert(!manager.isCaseAvailable('case002', duplicated), 'Níveis duplicados não desbloqueiam o próximo caso');

const completed002 = { ...completed001, case002: { completedLevels: case002Levels.LEVELS.map(level => level.id) } };
assert(manager.isCaseAvailable('case003', completed002), 'Case003 desbloqueia após case002');

const completedThrough004 = {
  ...completed002,
  case003: { completedLevels: case003Levels.LEVELS.map(level => level.id) },
  case004: { completedLevels: case004Levels.LEVELS.map(level => level.id) },
};
assert(manager.isCaseAvailable('case005', completedThrough004), 'Case005 desbloqueia após os quatro casos anteriores');
assert(!manager.isCaseAvailable('case006', completedThrough004), 'Case006 permanece bloqueado sem concluir case005');

const completed005WithoutChallenge = {
  ...completedThrough004,
  case005: { completedLevels: case005Levels.LEVELS.map(level => level.id), interrogation: { status: 'active', stepIndex: 3, presentedEvidenceIds: [] } },
};
assert(!manager.isCaseAvailable('case006', completed005WithoutChallenge), 'Case006 exige o desafio final do case005');

const completed005 = {
  ...completedThrough004,
  case005: { completedLevels: case005Levels.LEVELS.map(level => level.id), interrogation: { status: 'won', stepIndex: 4, presentedEvidenceIds: [] } },
};
assert(manager.isCaseAvailable('case006', completed005), 'Case006 desbloqueia após as 14 missões e o desafio do case005');

console.log(`\nRESULTADO: ${passed} passaram, ${failed} falharam`);
process.exit(failed ? 1 : 0);
