/**
 * levels.js — Missões do Projeto 14: Suporte ao Cliente e Help Desk
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs, requirements = []) => ({
  id, title, concept, briefing: `Análise de Eficiência e CSAT no Atendimento ao Cliente. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs, requirements,
});

export const CASE_INTRO = {
  title: 'Tempo de Resolução, SLAs de Atendimento e Satisfação (CSAT)',
  subtitle: 'Projeto #14 — Customer Experience (CX) & Help Desk Analytics',
  story: 'A gerência de Customer Support precisa avaliar a produtividade dos agentes, o cumprimento dos prazos contratuais (SLA) e a nota média de satisfação dos clientes após o fechamento dos chamados.',
  mission: 'Resolva as 10 missões para auditar o backlog e homologar o painel executivo de suporte.',
};

export const DATABASE_ANALYSIS = {
  title: 'Departamentos, atendentes, tickets de suporte e avaliações de CSAT',
  summary: 'O modelo separa os prazos de SLA de cada área funcional dos atendentes e do ciclo de vida dos tickets, viabilizando o cálculo de First Contact Resolution (FCR) e desvios de SLA.',
  entities: [
    { name: 'departamentos_suporte', role: 'Áreas de atendimento e limites de SLA em horas.', key: 'PK id', relations: [] },
    { name: 'atendentes', role: 'Agentes de suporte com nível de senioridade (N1 a Especialista).', key: 'PK id', relations: ['departamento_id → departamentos_suporte.id'] },
    { name: 'tickets', role: 'Chamados com protocolo, prioridade e tempo de resolução.', key: 'PK id', relations: ['atendente_id → atendentes.id'] },
    { name: 'avaliacoes_csat', role: 'Notas de 1 a 5 e feedbacks qualitativos dos clientes.', key: 'PK id', relations: ['ticket_id → tickets.id'] },
  ],
  decisions: [
    { title: 'SLA configurado por departamento', explanation: 'Permite que áreas técnicas complexas tenham prazos maiores (ex: 72h em Engenharia vs 24h em N1).' },
    { title: 'Tempo de resolução explícito', explanation: 'Registra a duração líquida do atendimento em horas para análises estatísticas diretas.' },
    { title: 'CSAT desacoplado com chave única', explanation: 'Garante que cada chamado possua no máximo uma avaliação válida, prevenindo duplicidade de métricas.' },
  ],
  checkpoints: [
    { question: 'Como detectar um chamado fora do SLA?', answer: 'Verificando se tickets.tempo_resolucao_horas é estritamente maior que departamentos_suporte.sla_horas.' },
    { question: 'Como calcular a nota média de CSAT por atendente?', answer: 'Agrupando por atendente e calculando a média aritmética com AVG(nota_csat) a partir do JOIN com avaliacoes_csat.' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Auditoria de Atendimento Homologada',
  story: 'A equipe de Suporte N1 atingiu média CSAT de 4,3 estrelas. A Ouvidoria resolveu 100% dos casos críticos em até 8 horas.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou continue para os próximos cenários.',
};

export const LEVELS = [
  mission(
    1,
    'Tempo Médio de Resolução por Departamento',
    'AVG + ROUND + GROUP BY',
    'Calcule a média de horas de resolução (tempo_resolucao_horas), arredondada para 2 casas decimais, para chamados resolvidos em cada departamento de suporte.',
    ['departamentos_suporte', 'atendentes', 'tickets'],
    ['departamento', 'media_resolucao_horas'],
    "SELECT d.nome AS departamento, ROUND(AVG(t.tempo_resolucao_horas), 2) AS media_resolucao_horas FROM departamentos_suporte d JOIN atendentes a ON a.departamento_id = d.id JOIN tickets t ON t.atendente_id = a.id WHERE t.status = 'resolvido' GROUP BY d.id, d.nome ORDER BY media_resolucao_horas ASC;",
    ['avg', 'round', 'group by', 'join', 'where'],
    ["Filtre WHERE t.status = 'resolvido'.", 'Use ROUND(AVG(t.tempo_resolucao_horas), 2).', 'Agrupe pelo departamento e ordene por media_resolucao_horas ASC.'],
    'Ouvidoria e Suporte N1 apresentam as resoluções mais velozes.',
    'Agrupamentos por departamento mapeiam a eficiência de cada nível operacional.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    2,
    'Satisfação Média (CSAT) por Atendente',
    'AVG + ROUND + JOIN',
    'Mostre o nome do atendente e sua nota média de CSAT arredondada para 2 casas decimais.',
    ['atendentes', 'tickets', 'avaliacoes_csat'],
    ['atendente', 'media_csat'],
    'SELECT a.nome AS atendente, ROUND(AVG(c.nota_csat), 2) AS media_csat FROM atendentes a JOIN tickets t ON t.atendente_id = a.id JOIN avaliacoes_csat c ON c.ticket_id = t.id GROUP BY a.id, a.nome ORDER BY media_csat DESC;',
    ['avg', 'round', 'group by', 'join'],
    ['Junte atendentes, tickets e avaliacoes_csat.', 'Use ROUND(AVG(c.nota_csat), 2) AS media_csat.', 'Ordene por media_csat DESC.'],
    'Diego Martins e Vanessa Guimarães obtiveram média CSAT 5,0; Vanessa, porém, tem apenas uma avaliação.',
    'ROUND combinado com AVG produz indicadores de qualidade de atendimento claros.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    3,
    'Chamados com Estouro de SLA',
    'WHERE + Comparação + JOIN',
    'Liste o protocolo, a prioridade, o tempo de resolução e o SLA contratual dos tickets cujo tempo de resolução ultrapassou o SLA do departamento.',
    ['departamentos_suporte', 'atendentes', 'tickets'],
    ['protocolo', 'prioridade', 'tempo_resolucao_horas', 'sla_horas'],
    'SELECT t.protocolo, t.prioridade, t.tempo_resolucao_horas, d.sla_horas FROM tickets t JOIN atendentes a ON a.id = t.atendente_id JOIN departamentos_suporte d ON d.id = a.departamento_id WHERE t.tempo_resolucao_horas > d.sla_horas ORDER BY t.id ASC;',
    ['where', 'join'],
    ['Junte tickets, atendentes e departamentos_suporte.', 'Filtre WHERE t.tempo_resolucao_horas > d.sla_horas.', 'Ordene por t.id ASC.'],
    'Foram identificados 3 chamados que ultrapassaram a janela máxima de SLA.',
    'Comparações diretas de campos cruzados auditam o cumprimento de metas de serviço.',
    ['dml-select-where', 'joins-inner-left']
  ),
  mission(
    4,
    'Atendentes com Alta Produtividade',
    'HAVING',
    'Identifique os atendentes que resolveram mais de 3 chamados no período.',
    ['atendentes', 'tickets'],
    ['atendente', 'total_resolvidos'],
    "SELECT a.nome AS atendente, COUNT(t.id) AS total_resolvidos FROM atendentes a JOIN tickets t ON t.atendente_id = a.id WHERE t.status = 'resolvido' GROUP BY a.id, a.nome HAVING COUNT(t.id) > 3 ORDER BY total_resolvidos DESC;",
    ['having', 'group by', 'count', 'where'],
    ["Filtre status = 'resolvido'.", 'Agrupe por atendente e use HAVING COUNT(t.id) > 3.', 'Ordene descendentemente.'],
    'Lucas Gabriel lidera a quantidade de tickets concluídos no suporte N1.',
    'HAVING valida metas individuais de fechamento de chamados.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    5,
    'Classificação de Satisfação (NPS/CSAT)',
    'CASE WHEN',
    'Para cada avaliação de CSAT, mostre o ID da avaliação, a nota e classifique como: "Promotor" (nota = 5), "Neutro" (nota = 4) ou "Detrator" (nota <= 3).',
    ['avaliacoes_csat'],
    ['id', 'nota_csat', 'classificacao'],
    "SELECT id, nota_csat, CASE WHEN nota_csat = 5 THEN 'Promotor' WHEN nota_csat = 4 THEN 'Neutro' ELSE 'Detrator' END AS classificacao FROM avaliacoes_csat ORDER BY id ASC;",
    ['case'],
    ['Selecione o ID e a nota de cada avaliação.', 'Aplique CASE WHEN nota_csat = 5 THEN \'Promotor\' WHEN nota_csat = 4 THEN \'Neutro\' ELSE \'Detrator\' END.', 'Ordene por id ASC.'],
    'A esmagadora maioria dos chamados foi classificada como Promotor ou Neutro.',
    'Categorizações baseadas em faixas de nota alimentam métricas executivas de satisfação.',
    ['case-when', 'dml-select-where']
  ),
  mission(
    6,
    'Top Atendentes por Nota de Satisfação',
    'AVG + ORDER BY + LIMIT',
    'Liste os 2 atendentes com a maior média de CSAT entre aqueles com pelo menos 2 avaliações.',
    ['atendentes', 'tickets', 'avaliacoes_csat'],
    ['atendente', 'media_csat'],
    'SELECT a.nome AS atendente, ROUND(AVG(c.nota_csat), 2) AS media_csat FROM atendentes a JOIN tickets t ON t.atendente_id = a.id JOIN avaliacoes_csat c ON c.ticket_id = t.id GROUP BY a.id, a.nome HAVING COUNT(c.id) >= 2 ORDER BY media_csat DESC LIMIT 2;',
    ['order by', 'limit', 'avg', 'having', 'round'],
    ['Agrupe por atendente com HAVING COUNT(c.id) >= 2.', 'Ordene por media_csat DESC.', 'Aplique LIMIT 2.'],
    'Diego Martins e Mariana Costa lideram a preferência e elogios dos usuários.',
    'HAVING associado a LIMIT garante relevância estatística na premiação de operadores.',
    ['having-where-orderby-like', 'aggregation-groupby'],
    [
      'Considere apenas atendentes com 2 ou mais avaliações de CSAT (filtro no HAVING).',
      'Exiba media_csat arredondada para 2 casas decimais: ROUND(AVG(...), 2).',
      'Devolva exatamente 2 linhas, as de maior média.',
    ]
  ),
  mission(
    7,
    'Volume de Chamados por Prioridade',
    'COUNT + GROUP BY',
    'Exiba a prioridade do chamado e a contagem total de tickets abertos em cada nível.',
    ['tickets'],
    ['prioridade', 'total_tickets'],
    'SELECT prioridade, COUNT(id) AS total_tickets FROM tickets GROUP BY prioridade ORDER BY total_tickets DESC;',
    ['group by', 'count'],
    ['Selecione a prioridade dos tickets.', 'Agrupe pela coluna prioridade e conte com COUNT(id).', 'Ordene por total_tickets DESC.'],
    'Chamados de prioridade baixa e urgente formam os maiores volumes da fila.',
    'Agregações de prioridade definem a escala de plantões técnicos.',
    ['aggregation-groupby', 'dml-select-where']
  ),
  mission(
    8,
    'Ranking de Eficiência no Nível 1',
    'Window DENSE_RANK',
    'Para atendentes de nível "N1", exiba o nome, a média de horas de resolução arredondada para 2 casas decimais e o ranking de rapidez (DENSE_RANK) em chamados resolvidos.',
    ['atendentes', 'tickets'],
    ['atendente', 'media_horas', 'ranking_rapidez'],
    "WITH medias AS (SELECT a.id, a.nome AS atendente, ROUND(AVG(t.tempo_resolucao_horas), 2) AS media_horas FROM atendentes a JOIN tickets t ON t.atendente_id = a.id WHERE a.nivel = 'N1' AND t.status = 'resolvido' GROUP BY a.id, a.nome) SELECT atendente, media_horas, DENSE_RANK() OVER(ORDER BY media_horas ASC) AS ranking_rapidez FROM medias ORDER BY ranking_rapidez ASC, atendente ASC;",
    ['with', 'dense_rank', 'round', 'where'],
    ["Filtre nível 'N1' e status 'resolvido' na CTE.", 'Calcule ROUND(AVG(t.tempo_resolucao_horas), 2) por atendente.', 'Aplique DENSE_RANK() OVER(ORDER BY media_horas ASC).'],
    'Mariana Costa conquistou o primeiro lugar em agilidade no suporte N1.',
    'DENSE_RANK() ranqueia tempos de atendimento premiando menores durações.',
    ['window-functions', 'cte-subqueries']
  ),
  mission(
    9,
    'Conformidade de SLA por Atendente',
    'CTE + Agregação',
    'Para cada atendente com chamados resolvidos, calcule o total de chamados resolvidos e o total de chamados resolvidos dentro do SLA contratual.',
    ['atendentes', 'departamentos_suporte', 'tickets'],
    ['atendente', 'total_resolvidos', 'resolvidos_no_sla'],
    "WITH tickets_sla AS (SELECT a.id AS atendente_id, a.nome AS atendente, CASE WHEN t.tempo_resolucao_horas <= d.sla_horas THEN 1 ELSE 0 END AS no_sla FROM atendentes a JOIN departamentos_suporte d ON d.id = a.departamento_id JOIN tickets t ON t.atendente_id = a.id WHERE t.status = 'resolvido') SELECT atendente, COUNT(*) AS total_resolvidos, SUM(no_sla) AS resolvidos_no_sla FROM tickets_sla GROUP BY atendente_id, atendente ORDER BY total_resolvidos DESC;",
    ['with', 'case', 'sum', 'group by'],
    ['Crie uma CTE com a flag no_sla = 1 quando tempo <= sla_horas.', 'Agrupe pelo atendente e some os casos no SLA.', 'Ordene por total_resolvidos DESC.'],
    'Mariana Costa e Diego Martins mantiveram 100% de conformidade com os SLAs.',
    'CTEs com variáveis binárias auxiliam no cálculo de aderência operacional.',
    ['cte-subqueries', 'case-when', 'aggregation-groupby']
  ),
  mission(
    10,
    'Painel Consolidado de Desempenho do Help Desk',
    'CTE + JOIN + COALESCE + ROUND',
    'Gere o relatório final contendo nome do atendente, departamento, total de tickets resolvidos, tempo médio de resolução e média de CSAT, com as duas médias arredondadas para 2 casas decimais.',
    ['atendentes', 'departamentos_suporte', 'tickets', 'avaliacoes_csat'],
    ['atendente', 'departamento', 'total_resolvidos', 'media_resolucao_horas', 'media_csat'],
    "WITH tickets_agg AS (SELECT atendente_id, COUNT(id) AS total_resolvidos, ROUND(AVG(tempo_resolucao_horas), 2) AS media_resolucao_horas FROM tickets WHERE status = 'resolvido' GROUP BY atendente_id), csat_agg AS (SELECT t.atendente_id, ROUND(AVG(c.nota_csat), 2) AS media_csat FROM tickets t JOIN avaliacoes_csat c ON c.ticket_id = t.id GROUP BY t.atendente_id) SELECT a.nome AS atendente, d.nome AS departamento, COALESCE(ta.total_resolvidos, 0) AS total_resolvidos, COALESCE(ta.media_resolucao_horas, 0) AS media_resolucao_horas, COALESCE(ca.media_csat, 0.0) AS media_csat FROM atendentes a JOIN departamentos_suporte d ON d.id = a.departamento_id LEFT JOIN tickets_agg ta ON ta.atendente_id = a.id LEFT JOIN csat_agg ca ON ca.atendente_id = a.id ORDER BY media_csat DESC, total_resolvidos DESC;",
    ['with', 'join', 'coalesce', 'round'],
    ['Crie CTEs para agregar tickets e CSAT por atendente, arredondando ambas as médias para 2 casas.', 'Junte atendentes e departamentos com as CTEs usando LEFT JOIN.', 'Trate nulos com COALESCE e ordene descendentemente.'],
    'O relatório executivo de atendimento ao cliente foi concluído com sucesso.',
    'CTEs pré-agregadas com COALESCE entregam painéis de gestão robustos e auditáveis.',
    ['cte-subqueries', 'joins-inner-left', 'aggregation-groupby', 'null-handling'],
    [
      'Liste todos os atendentes, inclusive quem não resolveu tickets nem recebeu avaliação.',
      'Sem tickets resolvidos ou sem CSAT, as três colunas numéricas exibem 0 — nunca NULL.',
      'total_resolvidos conta apenas tickets com status "resolvido".',
    ]
  ),
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
