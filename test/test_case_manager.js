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
const clientRealLevels = evalModule(
  [`const SCHEMA_SQL = ''; const SEED_SQL = '';`, transformESM(readSource('cases/client-real.js').replace(/^export\s*\{\s*SCHEMA_SQL,\s*SEED_SQL\s*\}\s*from\s*['"][^'"]+['"];?\s*$/gm, ''))].join('\n'),
  {}, 'cases/client-real.js'
);

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
  clientRealLevels: clientRealLevels,
}, 'case-manager.js');

console.log('\n=== Case Manager ===');
const allCases = manager.getAllCases();
assert(allCases.length === 21, 'Registry contém vinte e um cenários no total (6 investigações + 12 projetos + Bug Hunter + Construtor de Schema + Cliente Real)');
assert(manager.getCaseById('client-real')?.id === 'client-real' && manager.getCaseById('client-real').type === 'client-real', 'Modo Cliente Real registrado com id client-real');
assert((manager.getCaseById('client-real').ENGAGEMENTS || []).length === 3, 'Modo Cliente Real expõe três consultorias');
assert(
  allCases.filter(item => !['bug-hunter', 'schema-builder', 'client-real'].includes(item.id)).every(item => item.DATABASE_ANALYSIS),
  'Todos os casos (exceto Bug Hunter, Construtor de Schema e Cliente Real) expõem a Etapa 0 de análise do banco',
);
assert(
  manager.getInvestigations().length === 9 && manager.getInvestigations().some(item => item.id === 'bug-hunter') && manager.getInvestigations().some(item => item.id === 'schema-builder') && manager.getInvestigations().some(item => item.id === 'client-real'),
  'getInvestigations retorna 9 itens investigativos incluindo o Bug Hunter, o Construtor de Schema e o Cliente Real',
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

const completedAllModes = {};
for (const item of allCases) {
  const levels = item.LEVELS || item.BUG_CHALLENGES || item.SCHEMA_CHALLENGES || item.ENGAGEMENTS || [];
  completedAllModes[item.id] = {
    completedLevels: levels.map(level => level.id),
    interrogation: { status: 'won' },
  };
}
const availableIds = manager.getAvailableCases(completedAllModes).map(item => item.id);
assert(new Set(availableIds).size === availableIds.length, 'lobby não duplica modos especiais após concluir os casos');

console.log(`\nRESULTADO: ${passed} passaram, ${failed} falharam`);
process.exit(failed ? 1 : 0);
