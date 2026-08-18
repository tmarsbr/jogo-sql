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
import * as case005Levels from './cases/case005/levels.js';
import * as case006Levels from './cases/case006/levels.js';
import * as bugHunterLevels from './cases/bug-hunter.js';
import * as schemaBuilderLevels from './cases/schema-challenges.js';
import * as clientRealLevels from './cases/client-real.js';

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
  {
    id: 'case005', number: '005', icon: '🗂️', lockedByDefault: true, type: 'investigation',
    title: 'A Planilha do Inferno', category: 'Normalização e Relacionamentos',
    description: 'Transforme uma planilha bagunçada em um modelo OLTP normalizado até a 3FN, com PKs, FKs e cardinalidades corretas.',
    ...case005Levels,
  },
  {
    id: 'case006', number: '006', icon: '🏢', lockedByDefault: true, type: 'investigation',
    title: 'TechBrasil: Sua Primeira Semana', category: 'OLTP, ETL e Data Warehouse',
    description: 'Construa o Data Warehouse completo: limpe dados sujos, monte o ETL, crie o star schema e entregue relatórios para o CFO.',
    ...case006Levels,
  },
  {
    id: 'bug-hunter', number: 'BH', icon: '🐛', lockedByDefault: false, type: 'bug-hunter',
    title: 'Modo Bug Hunter: Caçador de Bugs SQL', category: 'Debugging',
    description: 'Corrija queries quebradas com erros de sintaxe, lógica e performance. Treine debugging forense no dia a dia real.',
    CASE_INTRO: {
      title: bugHunterLevels.BUG_HUNTER_INTRO.title,
      subtitle: bugHunterLevels.BUG_HUNTER_INTRO.subtitle,
      story: bugHunterLevels.BUG_HUNTER_INTRO.story,
    },
    CASE_CONCLUSION: bugHunterLevels.BUG_HUNTER_CONCLUSION,
    ...bugHunterLevels,
  },
  {
    id: 'schema-builder', number: 'SB', icon: '🏗️', lockedByDefault: false, type: 'schema-builder',
    title: 'Modo Construtor de Schema', category: 'Modelagem de Dados',
    description: 'Desenhe modelos de dados do zero a partir de requisitos em linguagem natural: tabelas, PKs, FKs, cardinalidades N:N — com revisão de coerência pela IA arquiteta.',
    CASE_INTRO: {
      title: schemaBuilderLevels.SCHEMA_BUILDER_INTRO.title,
      subtitle: schemaBuilderLevels.SCHEMA_BUILDER_INTRO.subtitle,
      story: schemaBuilderLevels.SCHEMA_BUILDER_INTRO.story,
      mission: 'Desenhe todos os modelos de dados para concluir o modo.',
    },
    CASE_CONCLUSION: schemaBuilderLevels.SCHEMA_BUILDER_CONCLUSION,
    GAMEPLAY: {
      challenges: schemaBuilderLevels.SCHEMA_CHALLENGES,
    },
    ...schemaBuilderLevels,
  },
  {
    id: 'client-real', number: 'CR', icon: '🤝', lockedByDefault: false, type: 'client-real',
    title: 'Modo Cliente Real: Consultor de Dados', category: 'Comunicação Técnica',
    description: 'Atenda consultorias de clientes com pedidos vagos: clarifique o escopo, escolha as queries certas e apresente a análise em linguagem de negócio. Treina comunicação técnica.',
    CASE_INTRO: {
      title: clientRealLevels.CLIENT_REAL_INTRO.title,
      subtitle: clientRealLevels.CLIENT_REAL_INTRO.subtitle,
      story: clientRealLevels.CLIENT_REAL_INTRO.story,
      mission: clientRealLevels.CLIENT_REAL_INTRO.mission,
    },
    CASE_CONCLUSION: clientRealLevels.CLIENT_REAL_CONCLUSION,
    ...clientRealLevels,
  },
];

export function getAllCases() { return CASE_REGISTRY; }

export function getInvestigations() {
  return CASE_REGISTRY.filter(item => item.type === 'investigation' || !item.type || item.type === 'bug-hunter' || item.type === 'schema-builder' || item.type === 'client-real');
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

  // Modo Bug Hunter: conclui quando todos os desafios de bug foram corrigidos.
  if (caseDefinition.type === 'bug-hunter') {
    const completed = new Set(progress.completedLevels);
    return (caseDefinition.BUG_CHALLENGES || []).every(challenge => completed.has(challenge.id));
  }

  // Modo Cliente Real: conclui quando todas as consultorias foram entregues.
  if (caseDefinition.type === 'client-real') {
    const completed = new Set(progress.completedLevels);
    return (caseDefinition.ENGAGEMENTS || []).every(e => completed.has(e.id));
  }
  // Modo Construtor de Schema: conclui quando todos os desafios de modelagem foram concluídos.
  if (caseDefinition.type === 'schema-builder') {
    const completed = new Set(progress.completedLevels);
    return (caseDefinition.SCHEMA_CHALLENGES || []).every(challenge => completed.has(challenge.id));
  }

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
  // Os modos especiais também aparecem em getInvestigations para a tela de
  // catálogo, mas são adicionados abaixo como desbloqueios independentes.
  // Mantê-los nesta lista sequencial duplicaria cards no lobby.
  const investigations = getInvestigations().filter(item => item.type === 'investigation' || !item.type);
  const availableInvestigations = investigations.filter((caseDefinition, index) => {
    if (index === 0) return true;
    return isCaseComplete(investigations[index - 1], progressByCase);
  });

  const projects = getProjects();
  const availableProjects = projects.filter(project => !project.lockedByDefault);

  // Modos especiais (ex.: bug-hunter e schema-builder) desbloqueiam por disponibilidade própria,
  // sem depender do encadeamento investigativo.
  const specialModes = CASE_REGISTRY.filter(item =>
    (item.type === 'bug-hunter' || item.type === 'schema-builder' || item.type === 'client-real') && !item.lockedByDefault
  );

  return [...availableInvestigations, ...specialModes, ...availableProjects];
}

export function isCaseAvailable(caseId, progressByCase = {}) {
  return getAvailableCases(progressByCase).some(caseDefinition => caseDefinition.id === caseId);
}
