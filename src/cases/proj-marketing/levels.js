/**
 * levels.js — Missões do Projeto 08: Análise de Marketing
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs) => ({
  id, title, concept, briefing: `Análise de Aquisição, Funil e ROI de Marketing. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs,
});

export const CASE_INTRO = {
  title: 'Performance de Campanhas e Retorno sobre Investimento (ROI)',
  subtitle: 'Projeto #08 — Growth Marketing & Analytics de Aquisição',
  story: 'O time de Growth precisa avaliar quais canais e campanhas trazem leads qualificados com menor custo de aquisição e maior taxa de conversão em vendas reais.',
  mission: 'Resolva as 10 missões para auditar o funil completo e a eficiência dos investimentos de marketing.',
};

export const DATABASE_ANALYSIS = {
  title: 'Canais de mídia, leads do funil e conversões em vendas',
  summary: 'O modelo separa os custos diários de tráfego pago da captura individual de leads e das conversões financeiras em vendas, viabilizando o cálculo exato de CAC, ROI e taxas de passagem do funil.',
  entities: [
    { name: 'canais', role: 'Mídias e origens de tráfego (Google, Meta, LinkedIn, etc.).', key: 'PK id', relations: [] },
    { name: 'campanhas', role: 'Ações de marketing com datas e orçamentos definidos.', key: 'PK id', relations: ['canal_id → canais.id'] },
    { name: 'custos_diarios', role: 'Investimento diário em centavos, cliques e impressões.', key: 'PK id', relations: ['campanha_id → campanhas.id'] },
    { name: 'leads', role: 'Contatos capturados com indicador de qualificação.', key: 'PK id', relations: ['campanha_id → campanhas.id'] },
    { name: 'conversoes', role: 'Vendas fechadas originadas a partir de um lead.', key: 'PK id', relations: ['lead_id → leads.id'] },
  ],
  decisions: [
    { title: 'Custos agregados por dia', explanation: 'Registra o investimento de mídia por data e campanha, permitindo calcular CPC e CPM ao longo do tempo.' },
    { title: 'Lead como entidade única intermediária', explanation: 'Conecta a campanha de origem à conversão final em vendas, preservando a atribuição ponta a ponta.' },
    { title: 'Qualificação binária no lead', explanation: 'Separa o volume bruto de contatos da qualidade real do tráfego capturado (MQL vs Lead Comum).' },
  ],
  checkpoints: [
    { question: 'Como calcular o Retorno sobre Investimento (ROI) de uma campanha?', answer: 'Subtraindo o custo total da campanha da receita total gerada por suas conversões e dividindo pelo custo total.' },
    { question: 'Por que o Custo de Aquisição de Clientes (CAC) depende de cruzar custos_diarios com conversoes?', answer: 'Porque CAC é o valor total investido dividido pelo número de leads que efetivamente converteram em clientes pagantes.' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Auditoria de Marketing Finalizada',
  story: 'Nutrição Base Inativa apresentou o maior ROI, com 422,2%. B2B Leads Enterprise e Lançamento Produto Pro registraram os dois maiores tickets médios por venda convertida.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou continue sua jornada em outros domínios de negócio.',
};

export const LEVELS = [
  mission(
    1,
    'Volume de Leads por Campanha',
    'COUNT + GROUP BY',
    'Mostre o nome da campanha e a quantidade total de leads capturados em cada uma.',
    ['campanhas', 'leads'],
    ['campanha', 'total_leads'],
    'SELECT c.nome AS campanha, COUNT(l.id) AS total_leads FROM campanhas c LEFT JOIN leads l ON l.campanha_id = c.id GROUP BY c.id, c.nome ORDER BY total_leads DESC;',
    ['group by', 'count', 'join'],
    ['Junte campanhas e leads.', 'Agrupe pelo id e nome da campanha.', 'Conte com COUNT(l.id) e ordene descendentemente.'],
    'Black Friday lidera com 4 leads; B2B, Branding e Lançamento Pro vêm em seguida, com 3 cada.',
    'Agrupamentos simples medem o topo do funil de marketing.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    2,
    'Investimento por Canal de Mídia',
    'SUM + JOIN',
    'Calcule o custo total investido (em centavos) em cada canal de aquisição.',
    ['canais', 'campanhas', 'custos_diarios'],
    ['canal', 'custo_total_centavos'],
    'SELECT ca.nome AS canal, COALESCE(SUM(cd.custo_centavos), 0) AS custo_total_centavos FROM canais ca LEFT JOIN campanhas c ON c.canal_id = ca.id LEFT JOIN custos_diarios cd ON cd.campanha_id = c.id GROUP BY ca.id, ca.nome ORDER BY custo_total_centavos DESC;',
    ['left join', 'group by', 'sum', 'coalesce'],
    ['Parta de canais e use LEFT JOIN até custos_diarios.', 'Use COALESCE(SUM(cd.custo_centavos), 0) para canais sem mídia paga.', 'Agrupe por canal e ordene pelo custo total.'],
    'Google Search e LinkedIn Ads concentram os maiores investimentos financeiros.',
    'JOINs múltiplos consolidam custos operacionais por nível hierárquico.',
    ['joins-inner-left', 'aggregation-groupby']
  ),
  mission(
    3,
    'Qualidade dos Leads (MQLs)',
    'COUNT + WHERE + GROUP BY',
    'Para cada campanha, mostre o nome e o total de leads qualificados (qualificado = 1).',
    ['campanhas', 'leads'],
    ['campanha', 'leads_qualificados'],
    'SELECT c.nome AS campanha, COUNT(l.id) AS leads_qualificados FROM campanhas c JOIN leads l ON l.campanha_id = c.id WHERE l.qualificado = 1 GROUP BY c.id, c.nome ORDER BY leads_qualificados DESC;',
    ['where', 'group by', 'count', 'join'],
    ['Junte campanhas e leads.', 'Filtre WHERE l.qualificado = 1.', 'Agrupe por campanha e conte os leads.'],
    'Black Friday e Lançamento Pro lideram o volume de leads qualificados, com 3 cada.',
    'Filtrar no WHERE antes do agrupamento isola o subconjunto qualificado.',
    ['dml-select-where', 'aggregation-groupby']
  ),
  mission(
    4,
    'Receita Gerada por Campanha',
    'SUM + JOIN',
    'Calcule a receita total arrecadada em vendas a partir das conversões originadas em cada campanha.',
    ['campanhas', 'leads', 'conversoes'],
    ['campanha', 'receita_total_centavos'],
    'SELECT c.nome AS campanha, SUM(cv.valor_venda_centavos) AS receita_total_centavos FROM campanhas c JOIN leads l ON l.campanha_id = c.id JOIN conversoes cv ON cv.lead_id = l.id GROUP BY c.id, c.nome ORDER BY receita_total_centavos DESC;',
    ['join', 'group by', 'sum'],
    ['Junte campanhas com leads e conversoes.', 'Agrupe pelo id e nome da campanha.', 'Some valor_venda_centavos e ordene descendentemente.'],
    'A campanha de Geração de Leads B2B gerou o maior faturamento total em vendas.',
    'Rastrear conversões conecta o marketing diretamente ao fluxo de caixa.',
    ['joins-inner-left', 'aggregation-groupby']
  ),
  mission(
    5,
    'Campanhas de Alto Faturamento',
    'HAVING',
    'Liste as campanhas cuja receita total de conversão ultrapassou R$ 5.000,00 (500000 centavos).',
    ['campanhas', 'leads', 'conversoes'],
    ['campanha', 'receita_total_centavos'],
    'SELECT c.nome AS campanha, SUM(cv.valor_venda_centavos) AS receita_total_centavos FROM campanhas c JOIN leads l ON l.campanha_id = c.id JOIN conversoes cv ON cv.lead_id = l.id GROUP BY c.id, c.nome HAVING SUM(cv.valor_venda_centavos) > 500000 ORDER BY receita_total_centavos DESC;',
    ['having', 'group by', 'sum'],
    ['Agrupe por campanha e calcule a soma da receita.', 'Aplique HAVING SUM(cv.valor_venda_centavos) > 500000.', 'Ordene descendentemente.'],
    'Campanhas corporativas de ticket alto geram retorno financeiro rápido.',
    'HAVING valida metas de corte sobre grandezas agregadas.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    6,
    'Top Campanhas por Ticket Médio',
    'AVG + ORDER BY + LIMIT',
    'Liste as 2 campanhas com o maior ticket médio por venda convertida.',
    ['campanhas', 'leads', 'conversoes'],
    ['campanha', 'ticket_medio_centavos'],
    'SELECT c.nome AS campanha, CAST(AVG(cv.valor_venda_centavos) AS INTEGER) AS ticket_medio_centavos FROM campanhas c JOIN leads l ON l.campanha_id = c.id JOIN conversoes cv ON cv.lead_id = l.id GROUP BY c.id, c.nome ORDER BY ticket_medio_centavos DESC LIMIT 2;',
    ['avg', 'group by', 'order by', 'limit'],
    ['Calcule a média com AVG(cv.valor_venda_centavos).', 'Ordene por ticket_medio_centavos DESC.', 'Aplique LIMIT 2.'],
    'Leads B2B e Lançamento Pro fecham contratos de valor unitário superior.',
    'AVG combinado com LIMIT isola os segmentos mais lucrativos por transação.',
    ['aggregation-groupby', 'having-where-orderby-like']
  ),
  mission(
    7,
    'Investimento Mensal em Mídia',
    'strftime + SUM',
    'Mostre o ano-mês e o total investido em custos diários de tráfego.',
    ['custos_diarios'],
    ['ano_mes', 'investimento_total_centavos'],
    "SELECT strftime('%Y-%m', data) AS ano_mes, SUM(custo_centavos) AS investimento_total_centavos FROM custos_diarios GROUP BY strftime('%Y-%m', data) ORDER BY ano_mes ASC;",
    ['group by', 'sum'],
    ['Extraia o ano-mês com strftime(\'%Y-%m\', data).', 'Agrupe pelo ano-mês e some custo_centavos.', 'Ordene por ano_mes ASC.'],
    'Fevereiro recebeu o maior aporte, com R$ 8.300,00, seguido por janeiro, com R$ 7.000,00; março totalizou R$ 6.100,00.',
    'Agregações mensais de despesas de marketing alimentam a conciliação financeira.',
    ['aggregation-groupby', 'dml-select-where']
  ),
  mission(
    8,
    'Classificação de Eficiência Financeira',
    'CASE WHEN + CTE',
    'Para cada campanha com custos e receitas, compare a receita total com o custo total e classifique como "Lucrativa" ou "Prejuízo".',
    ['campanhas', 'custos_diarios', 'leads', 'conversoes'],
    ['campanha', 'receita_centavos', 'custo_centavos', 'resultado'],
    "WITH custos AS (SELECT campanha_id, SUM(custo_centavos) AS custo_centavos FROM custos_diarios GROUP BY campanha_id), receitas AS (SELECT l.campanha_id, SUM(cv.valor_venda_centavos) AS receita_centavos FROM leads l JOIN conversoes cv ON cv.lead_id = l.id GROUP BY l.campanha_id) SELECT c.nome AS campanha, r.receita_centavos, cu.custo_centavos, CASE WHEN r.receita_centavos > cu.custo_centavos THEN 'Lucrativa' ELSE 'Prejuízo' END AS resultado FROM campanhas c JOIN custos cu ON cu.campanha_id = c.id JOIN receitas r ON r.campanha_id = c.id ORDER BY r.receita_centavos DESC;",
    ['with', 'case', 'join'],
    ['Crie CTEs separadas para somar custos e receitas por campanha.', 'Junte com a tabela campanhas.', 'Use CASE WHEN r.receita_centavos > cu.custo_centavos THEN \'Lucrativa\' ELSE \'Prejuízo\' END.'],
    'A campanha de Branding gerou prejuízo direto, enquanto B2B gerou expressivo lucro.',
    'CTEs isolam métricas de origens diferentes evitando produtos cartesianos indesejados.',
    ['cte-subqueries', 'case-when', 'joins-inner-left']
  ),
  mission(
    9,
    'Campanhas Dentro do Orçamento',
    'CTE + Comparação',
    'Liste as campanhas cujo custo total de mídia realizado ficou estritamente abaixo do orçamento planejado (orcamento_centavos).',
    ['campanhas', 'custos_diarios'],
    ['campanha', 'orcamento_centavos', 'custo_realizado_centavos'],
    'WITH custos AS (SELECT campanha_id, SUM(custo_centavos) AS custo_realizado_centavos FROM custos_diarios GROUP BY campanha_id) SELECT c.nome AS campanha, c.orcamento_centavos, cu.custo_realizado_centavos FROM campanhas c JOIN custos cu ON cu.campanha_id = c.id WHERE cu.custo_realizado_centavos < c.orcamento_centavos ORDER BY c.id ASC;',
    ['with', 'join', 'where'],
    ['Agregue os custos por campanha em uma CTE.', 'Junte com a tabela campanhas.', 'Filtre WHERE cu.custo_realizado_centavos < c.orcamento_centavos.'],
    'Quase todas as campanhas operaram com folga orçamentária.',
    'Comparar teto orçamentário com gastos reais evita estouros de verba.',
    ['cte-subqueries', 'joins-inner-left', 'dml-select-where']
  ),
  mission(
    10,
    'Relatório Consolidado de Funil de Marketing',
    'CTE + JOIN múltiplo + Agregação',
    'Gere o relatório final de funil contendo nome da campanha, nome do canal, total de leads capturados, total de vendas convertidas e receita total gerada.',
    ['campanhas', 'canais', 'leads', 'conversoes'],
    ['campanha', 'canal', 'total_leads', 'total_conversoes', 'receita_total_centavos'],
    'WITH leads_agg AS (SELECT campanha_id, COUNT(*) AS total_leads FROM leads GROUP BY campanha_id), conv_agg AS (SELECT l.campanha_id, COUNT(cv.id) AS total_conversoes, SUM(cv.valor_venda_centavos) AS receita_total_centavos FROM leads l JOIN conversoes cv ON cv.lead_id = l.id GROUP BY l.campanha_id) SELECT c.nome AS campanha, ca.nome AS canal, COALESCE(la.total_leads, 0) AS total_leads, COALESCE(ca_agg.total_conversoes, 0) AS total_conversoes, COALESCE(ca_agg.receita_total_centavos, 0) AS receita_total_centavos FROM campanhas c JOIN canais ca ON ca.id = c.canal_id LEFT JOIN leads_agg la ON la.campanha_id = c.id LEFT JOIN conv_agg ca_agg ON ca_agg.campanha_id = c.id ORDER BY receita_total_centavos DESC;',
    ['with', 'join', 'coalesce'],
    ['Crie CTEs separadas para agregar leads e conversões por campanha.', 'Junte campanhas, canais e as duas CTEs com LEFT JOIN.', 'Trate possíveis nulos com COALESCE.'],
    'O relatório de atribuição de funil está completo e validado para a diretoria.',
    'A união de CTEs pré-agregadas com COALESCE garante relatórios robustos e livres de distorção.',
    ['cte-subqueries', 'joins-inner-left', 'aggregation-groupby']
  ),
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
