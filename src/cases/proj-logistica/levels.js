/**
 * levels.js — Missões do Projeto 09: Otimização Logística
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs) => ({
  id, title, concept, briefing: `Análise de Eficiência e Pontualidade Logística. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs,
});

export const CASE_INTRO = {
  title: 'Eficiência de Entrega e Cumprimento de SLA',
  subtitle: 'Projeto #09 — Logística, Rotas e Transportadoras',
  story: 'A gerência de supply chain precisa mapear quais rotas e parceiros logísticos apresentam maior índice de atrasos e quais ocorrências operacionais impactam os prazos de entrega ao cliente final.',
  mission: 'Resolva as 10 missões para auditar a malha logística e gerar a visão consolidada de KPIs.',
};

export const DATABASE_ANALYSIS = {
  title: 'Centros de expedição, malha rodoviária e rastreamento',
  summary: 'O modelo desacopla os centros de distribuição e transportadoras das rotas de atendimento e registros de envio, permitindo medir o lead time real contra os SLAs contratuais.',
  entities: [
    { name: 'centros_distribuicao', role: 'Polos de expedição e armazenagem primária.', key: 'PK id', relations: [] },
    { name: 'transportadoras', role: 'Parceiros de transporte, modais e SLAs de contrato.', key: 'PK id', relations: [] },
    { name: 'rotas', role: 'Conexões entre origem e estado de destino com quilometragem.', key: 'PK id', relations: ['cd_origem_id → centros_distribuicao.id'] },
    { name: 'envios', role: 'Pacotes despachados com datas de saída, previsão e entrega.', key: 'PK id', relations: ['rota_id → rotas.id', 'transportadora_id → transportadoras.id'] },
    { name: 'ocorrencias_entrega', role: 'Eventos atípicos (avarias, quebras, fiscalização).', key: 'PK id', relations: ['envio_id → envios.id'] },
  ],
  decisions: [
    { title: 'Datas no formato ISO (YYYY-MM-DD)', explanation: 'Permite comparações diretas de atraso (data_entrega > data_estimada) e cálculos precisos com a função julianday().' },
    { title: 'Ocorrências independentes do envio', explanation: 'Um mesmo envio pode registrar múltiplos incidentes sem sobrecarregar a tabela principal com colunas nulas.' },
    { title: 'Status do envio segregado', explanation: 'Separa pacotes em trânsito daqueles já entregues para não distorcer médias de pontualidade.' },
  ],
  checkpoints: [
    { question: 'Como detectar um atraso na entrega?', answer: 'Verificando se data_entrega é estritamente maior que data_estimada para envios com status entregue.' },
    { question: 'Por que calcular a diferença de dias usando julianday()?', answer: 'julianday(data_fim) - julianday(data_inicio) retorna o número exato de dias corridos entre duas datas no SQLite.' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Diagnóstico da Malha Logística Concluído',
  story: 'A Bahia concentrou 3 entregas atrasadas em 3 concluídas e registrou o maior tempo médio de trânsito, com 12,3 dias. O modal aéreo entregou 2 de 2 cargas no prazo, contra 5 de 12 no rodoviário.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou continue para os próximos desafios.',
};

export const LEVELS = [
  mission(
    1,
    'Envios Entregues com Atraso',
    'WHERE + DATE',
    'Liste o código de rastreio, data estimada e data real de entrega dos envios entregues após a data prevista.',
    ['envios'],
    ['codigo_rastreio', 'data_estimada', 'data_entrega'],
    "SELECT codigo_rastreio, data_estimada, data_entrega FROM envios WHERE status = 'entregue' AND data_entrega > data_estimada ORDER BY id ASC;",
    ['where'],
    ['Compare diretamente as datas ISO em envios.', "Filtre status = 'entregue' AND data_entrega > data_estimada.", 'Ordene por id ASC.'],
    'Há pacotes com atrasos substanciais em rotas interestaduais.',
    'Comparação direta de datas em formato ISO identifica desvios de SLA.',
    ['dml-select-where']
  ),
  mission(
    2,
    'Volume de Cargas por Transportadora',
    'COUNT + GROUP BY',
    'Mostre o nome da transportadora e a quantidade total de envios atribuídos a ela.',
    ['transportadoras', 'envios'],
    ['transportadora', 'total_envios'],
    'SELECT t.nome AS transportadora, COUNT(e.id) AS total_envios FROM transportadoras t LEFT JOIN envios e ON e.transportadora_id = t.id GROUP BY t.id, t.nome ORDER BY total_envios DESC;',
    ['group by', 'count', 'join'],
    ['Junte transportadoras com envios via LEFT JOIN.', 'Agrupe pelo id e nome da transportadora.', 'Ordene por total_envios DESC.'],
    'Expresso Rápido lidera com 6 envios; NorteSul e Velocita empatam em seguida, com 4 cada.',
    'COUNT agregado revela a concentração de demanda por fornecedor logístico.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    3,
    'Tempo Médio de Trânsito por Rota',
    'AVG + ROUND + julianday',
    'Para cada rota com envios entregues, calcule a distância em km e a média de dias reais de entrega (julianday), arredondada para 1 casa decimal.',
    ['rotas', 'envios'],
    ['rota_id', 'estado_destino', 'distancia_km', 'media_dias_entrega'],
    "SELECT r.id AS rota_id, r.estado_destino, r.distancia_km, ROUND(AVG(julianday(e.data_entrega) - julianday(e.data_despacho)), 1) AS media_dias_entrega FROM rotas r JOIN envios e ON e.rota_id = r.id WHERE e.status = 'entregue' GROUP BY r.id, r.estado_destino, r.distancia_km ORDER BY media_dias_entrega DESC;",
    ['avg', 'round', 'group by', 'join', 'where'],
    ["Junte rotas e envios e filtre status = 'entregue'.", 'Calcule ROUND(AVG(julianday(e.data_entrega) - julianday(e.data_despacho)), 1).', 'Ordene por media_dias_entrega DESC.'],
    'A rota da Bahia tem a maior média de trânsito, com 12,3 dias; a rota mais distante, para Pernambuco, registra 6,5 dias.',
    'julianday calcula intervalos de tempo entre datas no SQLite de forma nativa.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    4,
    'Transportadoras com Múltiplos Atrasos',
    'HAVING',
    'Identifique as transportadoras que acumulam mais de 1 envio entregue com atraso.',
    ['transportadoras', 'envios'],
    ['transportadora', 'total_atrasos'],
    "SELECT t.nome AS transportadora, COUNT(e.id) AS total_atrasos FROM transportadoras t JOIN envios e ON e.transportadora_id = t.id WHERE e.status = 'entregue' AND e.data_entrega > e.data_estimada GROUP BY t.id, t.nome HAVING COUNT(e.id) > 1 ORDER BY total_atrasos DESC;",
    ['having', 'group by', 'count', 'where'],
    ["Filtre WHERE e.status = 'entregue' AND e.data_entrega > e.data_estimada.", 'Agrupe por transportadora e use HAVING COUNT(e.id) > 1.', 'Ordene por total_atrasos DESC.'],
    'NorteSul e Velocita acumulam a maior quantidade de quebras de SLA.',
    'HAVING combinado com filtros WHERE prévios analisa anomalias operacionais recorrentes.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    5,
    'Rastreamento Completo de Envio',
    'JOIN múltiplo',
    'Liste o código de rastreio, código do CD de origem, estado de destino e nome da transportadora dos envios.',
    ['envios', 'rotas', 'centros_distribuicao', 'transportadoras'],
    ['codigo_rastreio', 'cd_origem', 'estado_destino', 'transportadora'],
    'SELECT e.codigo_rastreio, cd.codigo AS cd_origem, r.estado_destino, t.nome AS transportadora FROM envios e JOIN rotas r ON r.id = e.rota_id JOIN centros_distribuicao cd ON cd.id = r.cd_origem_id JOIN transportadoras t ON t.id = e.transportadora_id ORDER BY e.id ASC;',
    ['join'],
    ['Junte envios, rotas, centros_distribuicao e transportadoras.', 'Selecione as colunas com os devidos aliases.', 'Ordene por e.id ASC.'],
    'O centro de Cajamar despacha mercadorias para cinco destinos da amostra: SP, RJ, MG, BA e PE.',
    'JOINs em cadeia unem a topologia de CDs até a transportadora final.',
    ['joins-inner-left']
  ),
  mission(
    6,
    'Classificação de SLA de Entrega',
    'CASE WHEN',
    'Para todos os envios entregues, exiba o código de rastreio e classifique a entrega como "No Prazo" (data_entrega <= data_estimada) ou "Atrasado" (data_entrega > data_estimada).',
    ['envios'],
    ['codigo_rastreio', 'status_sla'],
    "SELECT codigo_rastreio, CASE WHEN data_entrega <= data_estimada THEN 'No Prazo' ELSE 'Atrasado' END AS status_sla FROM envios WHERE status = 'entregue' ORDER BY id ASC;",
    ['case', 'where'],
    ["Filtre status = 'entregue'.", 'Aplique CASE WHEN data_entrega <= data_estimada THEN \'No Prazo\' ELSE \'Atrasado\' END.', 'Ordene por id ASC.'],
    'A maioria dos envios no Sudeste é entregue dentro da janela contratual.',
    'CASE WHEN sintetiza status operacionais binários ou multiclasse no SQL.',
    ['case-when', 'dml-select-where']
  ),
  mission(
    7,
    'Ocorrências por Transportadora',
    'COUNT + LEFT JOIN',
    'Mostre o nome da transportadora e a quantidade total de ocorrências de entrega registradas para suas cargas.',
    ['transportadoras', 'envios', 'ocorrencias_entrega'],
    ['transportadora', 'total_ocorrencias'],
    'SELECT t.nome AS transportadora, COUNT(o.id) AS total_ocorrencias FROM transportadoras t JOIN envios e ON e.transportadora_id = t.id LEFT JOIN ocorrencias_entrega o ON o.envio_id = e.id GROUP BY t.id, t.nome ORDER BY total_ocorrencias DESC;',
    ['group by', 'count', 'left join'],
    ['Junte transportadoras com envios e faça LEFT JOIN com ocorrencias_entrega.', 'Agrupe por transportadora e conte COUNT(o.id).', 'Ordene descendentemente.'],
    'AeroCargas Log e Expresso Rápido não possuem ocorrências registradas na amostra.',
    'LEFT JOIN preserva entidades mesmo na ausência de registros de incidentes.',
    ['joins-inner-left', 'aggregation-groupby']
  ),
  mission(
    8,
    'Ranking de Rotas mais Demoradas',
    'Window DENSE_RANK',
    'Para cada estado de destino com envios entregues, exiba o estado, o tempo médio real de entrega em dias arredondado para 1 casa decimal e seu ranking (DENSE_RANK).',
    ['rotas', 'envios'],
    ['estado_destino', 'media_dias', 'rank_demora'],
    "WITH medias AS (SELECT r.estado_destino, ROUND(AVG(julianday(e.data_entrega) - julianday(e.data_despacho)), 1) AS media_dias FROM rotas r JOIN envios e ON e.rota_id = r.id WHERE e.status = 'entregue' GROUP BY r.estado_destino) SELECT estado_destino, media_dias, DENSE_RANK() OVER(ORDER BY media_dias DESC) AS rank_demora FROM medias ORDER BY rank_demora ASC;",
    ['with', 'round', 'dense_rank', 'where'],
    ['Crie uma CTE com ROUND(AVG(...), 1) por estado de destino.', 'Aplique DENSE_RANK() OVER(ORDER BY media_dias DESC) AS rank_demora.', 'Ordene por rank_demora ASC.'],
    'Bahia lidera o ranking com 12,3 dias, seguida por Rio Grande do Sul com 9,0 e Pernambuco com 6,5.',
    'DENSE_RANK() atribui posições ordinais sem pular números em empates.',
    ['window-functions', 'cte-subqueries']
  ),
  mission(
    9,
    'Pontualidade por Modal de Transporte',
    'CTE + Agregação',
    'Compare os modais de transporte ("aereo" vs "rodoviario") exibindo o modal, o total de envios entregues e o total de entregas no prazo.',
    ['transportadoras', 'envios'],
    ['modal', 'total_entregues', 'entregas_no_prazo'],
    "WITH entregas AS (SELECT t.modal, e.id, CASE WHEN e.data_entrega <= e.data_estimada THEN 1 ELSE 0 END AS no_prazo FROM envios e JOIN transportadoras t ON t.id = e.transportadora_id WHERE e.status = 'entregue') SELECT modal, COUNT(id) AS total_entregues, SUM(no_prazo) AS entregas_no_prazo FROM entregas GROUP BY modal ORDER BY total_entregues DESC;",
    ['with', 'group by', 'sum', 'case'],
    ['Crie uma CTE sinalizando no_prazo = 1 quando pontual.', 'Agrupe pelo modal e some as entregas no prazo.', 'Ordene por total_entregues DESC.'],
    'O modal aéreo possui 100% de pontualidade, enquanto o rodoviário sofre com malha extensa.',
    'CTEs com variáveis indicadoras (0/1) simplificam cálculos de taxas de conformidade.',
    ['cte-subqueries', 'case-when', 'aggregation-groupby']
  ),
  {
    ...mission(
      10,
      'View de Painel de Indicadores Logísticos',
      'CREATE VIEW + JOIN + GROUP BY',
      'Crie a view vw_kpis_logistica com transportadora_id, transportadora, modal, total_envios e total_atrasos para todos os envios entregues.',
      ['transportadoras', 'envios'],
      ['transportadora_id', 'transportadora', 'modal', 'total_envios', 'total_atrasos'],
      "CREATE VIEW vw_kpis_logistica AS SELECT t.id AS transportadora_id, t.nome AS transportadora, t.modal, COUNT(e.id) AS total_envios, SUM(CASE WHEN e.data_entrega > e.data_estimada THEN 1 ELSE 0 END) AS total_atrasos FROM transportadoras t JOIN envios e ON e.transportadora_id = t.id WHERE e.status = 'entregue' GROUP BY t.id, t.nome, t.modal;",
      ['create view', 'join', 'group by', 'case'],
      ['Crie a view com CREATE VIEW vw_kpis_logistica AS SELECT ...', 'Junte transportadoras e envios filtrando status = entregue.', 'Use SUM(CASE WHEN e.data_entrega > e.data_estimada THEN 1 ELSE 0 END) AS total_atrasos.'],
      'A view consolidada foi gerada para alimentação dos painéis de controle de supply chain.',
      'Views salvam agregações operacionais avançadas para consultas padronizadas.',
      ['views', 'joins-inner-left', 'aggregation-groupby', 'case-when']
    ),
    executionMode: 'create_view',
    viewName: 'vw_kpis_logistica',
    verificationQuery: 'SELECT * FROM vw_kpis_logistica ORDER BY transportadora_id ASC;',
    expectedResultQuery: "SELECT t.id AS transportadora_id, t.nome AS transportadora, t.modal, COUNT(e.id) AS total_envios, SUM(CASE WHEN e.data_entrega > e.data_estimada THEN 1 ELSE 0 END) AS total_atrasos FROM transportadoras t JOIN envios e ON e.transportadora_id = t.id WHERE e.status = 'entregue' GROUP BY t.id, t.nome, t.modal ORDER BY transportadora_id ASC;",
  },
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
