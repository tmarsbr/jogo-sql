/** Regressão do registry e do desbloqueio sequencial de casos. */
const { readSource, transformESM, evalModule, loadLevels } = require('./helpers/load-source');

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
const managerCode = `
const case001Levels = __case001Levels;
const case002Levels = __case002Levels;
const case003Levels = __case003Levels;
const case004Levels = __case004Levels;
const projEcommerceLevels = __projEcommerceLevels;
const projClientesLevels = __projClientesLevels;
const projVendasLevels = __projVendasLevels;
const projMarketingLevels = __projMarketingLevels;
const projLogisticaLevels = __projLogisticaLevels;
const projEstoqueLevels = __projEstoqueLevels;
const projEducacaoLevels = __projEducacaoLevels;
const projSaudeLevels = __projSaudeLevels;
const projFinanceiroLevels = __projFinanceiroLevels;
const projSuporteLevels = __projSuporteLevels;
const projPublicoLevels = __projPublicoLevels;
const projFutebolLevels = __projFutebolLevels;
${transformESM(readSource('case-manager.js'))}`;
const manager = evalModule(managerCode, {
  __case001Levels: legacyLevels,
  __case002Levels: case002Levels,
  __case003Levels: case003Levels,
  __case004Levels: case004Levels,
  __projEcommerceLevels: projEcommerceLevels,
  __projClientesLevels: projClientesLevels,
  __projVendasLevels: projVendasLevels,
  __projMarketingLevels: projMarketingLevels,
  __projLogisticaLevels: projLogisticaLevels,
  __projEstoqueLevels: projEstoqueLevels,
  __projEducacaoLevels: projEducacaoLevels,
  __projSaudeLevels: projSaudeLevels,
  __projFinanceiroLevels: projFinanceiroLevels,
  __projSuporteLevels: projSuporteLevels,
  __projPublicoLevels: projPublicoLevels,
  __projFutebolLevels: projFutebolLevels,
}, 'case-manager.js');

console.log('\n=== Case Manager ===');
const allCases = manager.getAllCases();
assert(allCases.length === 16, 'Registry contém dezesseis casos no total (4 investigações + 12 projetos)');
assert(allCases.every(item => item.DATABASE_ANALYSIS), 'Todos os casos expõem a Etapa 0 de análise do banco');
assert(manager.getInvestigations().length === 4, 'getInvestigations retorna 4 casos investigativos');
assert(manager.getProjects().length === 12, 'getProjects retorna 12 projetos de análise de dados');
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

console.log(`\nRESULTADO: ${passed} passaram, ${failed} falharam`);
process.exit(failed ? 1 : 0);
