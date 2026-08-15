/**
 * case-manager.js — Registry e regras de acesso dos casos do SQL Detective.
 * Cada definição encapsula sua narrativa, missões e dados SQLite.
 */
import * as case001Levels from './levels.js';
import * as case002Levels from './cases/case002/levels.js';
import * as case003Levels from './cases/case003/levels.js';
import * as case004Levels from './cases/case004/levels.js';
import * as projEcommerceLevels from './cases/proj-ecommerce/levels.js';
import * as projClientesLevels from './cases/proj-clientes/levels.js';
import * as projVendasLevels from './cases/proj-vendas/levels.js';
import * as projMarketingLevels from './cases/proj-marketing/levels.js';
import * as projLogisticaLevels from './cases/proj-logistica/levels.js';
import * as projEstoqueLevels from './cases/proj-estoque/levels.js';
import * as projEducacaoLevels from './cases/proj-educacao/levels.js';
import * as projSaudeLevels from './cases/proj-saude/levels.js';
import * as projFinanceiroLevels from './cases/proj-financeiro/levels.js';
import * as projSuporteLevels from './cases/proj-suporte/levels.js';
import * as projPublicoLevels from './cases/proj-publico/levels.js';
import * as projFutebolLevels from './cases/proj-futebol/levels.js';

export const CASE_REGISTRY = [
  {
    id: 'case001', number: '001', icon: '💸', lockedByDefault: false, type: 'investigation',
    title: 'O Mistério das Transações Fantasmas', category: 'Fraude financeira',
    description: 'Rastreie transações, acessos e e-mails para revelar um desvio no Financeiro.',
    ...case001Levels,
  },
  {
    id: 'case002', number: '002', icon: '🔒', lockedByDefault: true, type: 'investigation',
    title: 'Vazamento na Matriz', category: 'Segurança de dados e LGPD',
    description: 'Descubra quem exportou dados pessoais para fora da empresa.',
    ...case002Levels,
  },
  {
    id: 'case003', number: '003', icon: '₿', lockedByDefault: true, type: 'investigation',
    title: 'A Rota da Cripto-Ativo', category: 'Lavagem de dinheiro',
    description: 'Siga a pulverização de transferências entre carteiras.',
    ...case003Levels,
  },
  {
    id: 'case004', number: '004', icon: '📦', lockedByDefault: true, type: 'investigation',
    title: 'Sabotagem no E-Commerce', category: 'Estoque e auditoria',
    description: 'Reconstrua a sabotagem que criou estoque fantasma na Black Friday.',
    ...case004Levels,
  },
  {
    id: 'proj-ecommerce', number: '05', icon: '🛒', lockedByDefault: false, type: 'project',
    title: 'E-Commerce: Produtos & Receita', category: 'Comércio eletrônico',
    description: 'Descubra quais produtos e categorias geram maior faturamento e volume de vendas.',
    ...projEcommerceLevels,
  },
  {
    id: 'proj-clientes', number: '06', icon: '👥', lockedByDefault: false, type: 'project',
    title: 'Clientes: Segmentação & LTV', category: 'Inteligência de CRM',
    description: 'Identifique os clientes mais valiosos (RFM) e analise riscos de churn e retenção.',
    ...projClientesLevels,
  },
  {
    id: 'proj-vendas', number: '07', icon: '📈', lockedByDefault: false, type: 'project',
    title: 'Vendas: Evolução & Metas', category: 'Performance comercial',
    description: 'Acompanhe o faturamento mensal, calcule crescimento com LAG e audite metas regionais.',
    ...projVendasLevels,
  },
  {
    id: 'proj-marketing', number: '08', icon: '📣', lockedByDefault: false, type: 'project',
    title: 'Marketing: Funil & ROI', category: 'Growth & Aquisição',
    description: 'Analise o funil de leads, taxas de conversão e calcule o ROI de campanhas de mídia.',
    ...projMarketingLevels,
  },
  {
    id: 'proj-logistica', number: '09', icon: '🚚', lockedByDefault: false, type: 'project',
    title: 'Logística: Rotas & Atrasos', category: 'Supply Chain & SLAs',
    description: 'Mapeie atrasos por região, analise lead times reais com julianday e monitore transportadoras.',
    ...projLogisticaLevels,
  },
  {
    id: 'proj-estoque', number: '10', icon: '📦', lockedByDefault: false, type: 'project',
    title: 'Estoque: Giro & Curva ABC', category: 'Armazenagem & Materiais',
    description: 'Identifique produtos parados sem saídas, monitore estoques mínimos e valor imobilizado.',
    ...projEstoqueLevels,
  },
  {
    id: 'proj-educacao', number: '11', icon: '🎓', lockedByDefault: false, type: 'project',
    title: 'Educação: Rendimento & Evasão', category: 'Analytics acadêmico',
    description: 'Avalie taxas de reprovação por matéria e professor e identifique disciplinas críticas.',
    ...projEducacaoLevels,
  },
  {
    id: 'proj-saude', number: '12', icon: '🏥', lockedByDefault: false, type: 'project',
    title: 'Saúde: Demanda & Espera', category: 'Gestão clínica & Hospitais',
    description: 'Monitore filas de agendamento, tempo de espera na recepção e taxas de absenteísmo (no-show).',
    ...projSaudeLevels,
  },
  {
    id: 'proj-financeiro', number: '13', icon: '💳', lockedByDefault: false, type: 'project',
    title: 'Finanças: Cartões & Risco', category: 'Banking & Crédito',
    description: 'Audite faturas de cartão de crédito, identifique inadimplência e meça o comprometimento de limite.',
    ...projFinanceiroLevels,
  },
  {
    id: 'proj-suporte', number: '14', icon: '🎧', lockedByDefault: false, type: 'project',
    title: 'Suporte: Help Desk & CSAT', category: 'Customer Experience (CX)',
    description: 'Monitore tempos de resolução, conformidade de SLA por atendente e notas de satisfação CSAT.',
    ...projSuporteLevels,
  },
  {
    id: 'proj-publico', number: '15', icon: '🏛️', lockedByDefault: false, type: 'project',
    title: 'Público: Cidades & Orçamento', category: 'GovTech & Transparência',
    description: 'Analise despesas públicas empenhadas e liquidadas em saúde e educação e calcule o gasto per capita.',
    ...projPublicoLevels,
  },
  {
    id: 'proj-futebol', number: '16', icon: '⚽', lockedByDefault: false, type: 'project',
    title: 'Futebol: Scouts & Finalização', category: 'Sports Analytics',
    description: 'Avalie artilharia, pontaria de finalizações, criação de jogadas e ranking de participação em gols.',
    ...projFutebolLevels,
  },
];

export function getAllCases() { return CASE_REGISTRY; }

export function getInvestigations() {
  return CASE_REGISTRY.filter(item => item.type === 'investigation' || !item.type);
}

export function getProjects() {
  return CASE_REGISTRY.filter(item => item.type === 'project');
}

export function getCaseById(id) {
  return CASE_REGISTRY.find(caseDefinition => caseDefinition.id === id) || null;
}

export function isCaseComplete(caseDefinition, progressByCase = {}) {
  const progress = progressByCase[caseDefinition.id];
  if (!progress || !Array.isArray(progress.completedLevels)) return false;
  const completed = new Set(progress.completedLevels);
  const allLevelsDone = caseDefinition.LEVELS.every(level => completed.has(level.id));

  // Casos com finalChallenge (interrogatório) exigem vitória do desafio
  if (caseDefinition.GAMEPLAY?.finalChallenge) {
    if (!allLevelsDone) return false;
    return progress.interrogation?.status === 'won';
  }

  return allLevelsDone;
}

export function getAvailableCases(progressByCase = {}) {
  const investigations = getInvestigations();
  const availableInvestigations = investigations.filter((caseDefinition, index) => {
    if (index === 0) return true;
    return isCaseComplete(investigations[index - 1], progressByCase);
  });

  const projects = getProjects();
  const availableProjects = projects.filter(project => !project.lockedByDefault);

  return [...availableInvestigations, ...availableProjects];
}

export function isCaseAvailable(caseId, progressByCase = {}) {
  return getAvailableCases(progressByCase).some(caseDefinition => caseDefinition.id === caseId);
}
