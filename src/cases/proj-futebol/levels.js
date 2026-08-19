/**
 * levels.js — Missões do Projeto 16: Futebol e Performance Esportiva
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs, requirements = []) => ({
  id, title, concept, briefing: `Analytics Esportivo e Scout de Futebol. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs, requirements,
});

export const CASE_INTRO = {
  title: 'Scout de Atletas, Eficiência de Finalização e Estatísticas de Jogo',
  subtitle: 'Projeto #16 — Football Analytics & Ciência de Dados no Esporte',
  story: 'O departamento de análise de desempenho de uma liga de futebol precisa auditar os scouts individuais dos atletas, mapeando artilheiros, precisão de finalização ao gol e volume de criação de jogadas.',
  mission: 'Resolva as 10 missões de scout esportivo para gerar o relatório consolidado de performance.',
};

export const DATABASE_ANALYSIS = {
  title: 'Clubes, elenco de jogadores, partidas e estatísticas granulares de jogo',
  summary: 'O modelo desacopla os cadastros dos clubes e atletas dos confrontos e dos dados de performance por jogo, permitindo calcular métricas avançadas por minuto jogado e mapas de volume ofensivo.',
  entities: [
    { name: 'clubes', role: 'Equipes do campeonato com sigla e estado de origem.', key: 'PK id', relations: [] },
    { name: 'jogadores', role: 'Atletas com clube de registro, posição tática e número da camisa.', key: 'PK id', relations: ['clube_id → clubes.id'] },
    { name: 'partidas', role: 'Confrontos com rodada, mandante, visitante e placar final.', key: 'PK id', relations: ['clube_mandante_id → clubes.id', 'clube_visitante_id → clubes.id'] },
    { name: 'estatisticas_partida', role: 'Métricas de cada atleta por jogo (gols, finalizações, assistências, passes).', key: 'PK id', relations: ['partida_id → partidas.id', 'jogador_id → jogadores.id'] },
  ],
  decisions: [
    { title: 'Finalizações no gol segregadas', explanation: 'Distingue chutes totais de finalizações com endereço certo para cálculo de precisão (pontaria).' },
    { title: 'Minutos jogados por confronto', explanation: 'Permite normalizar estatísticas pelo tempo real em campo (métricas per 90 minutos).' },
    { title: 'Partidas com duplo relacionamento de clube', explanation: 'Permite cruzar desempenho atuando como mandante versus visitante.' },
  ],
  checkpoints: [
    { question: 'Como calcular a taxa de pontaria nas finalizações?', answer: 'Multiplicando a soma de finalizacoes_no_gol por 100.0 e dividindo pela soma de finalizacoes_total.' },
    { question: 'Por que métricas de futebol usam CTEs com DENSE_RANK?', answer: 'Porque a artilharia e tabelas de líderes esportivos frequentemente possuem múltiplos atletas empatados com o mesmo número de gols.' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Scout do Campeonato Homologado',
  story: 'Pedro Guilherme liderou a artilharia com 3 gols; De Arrascaeta liderou as assistências com 2; Pedro, Raphael Veiga e De Arrascaeta dividiram o topo de participações diretas em gols, com 3 cada.',
  nextSteps: 'Parabéns! Você concluiu com maestria todos os 12 projetos analíticos do Blog do SQL!',
};

export const LEVELS = [
  mission(
    1,
    'Artilharia do Campeonato',
    'SUM + GROUP BY',
    'Mostre o nome do jogador e a quantidade total de gols marcados por ele no campeonato.',
    ['jogadores', 'estatisticas_partida'],
    ['jogador', 'total_gols'],
    'SELECT j.nome AS jogador, SUM(e.gols) AS total_gols FROM jogadores j JOIN estatisticas_partida e ON e.jogador_id = j.id GROUP BY j.id, j.nome ORDER BY total_gols DESC, jogador ASC;',
    ['group by', 'sum', 'join'],
    ['Junte jogadores com estatisticas_partida.', 'Agrupe pelo jogador e some os gols.', 'Ordene por total_gols DESC, jogador ASC.'],
    'Pedro Guilherme lidera a artilharia com 3 gols em duas partidas.',
    'Agrupamentos simples calculam a tabela oficial de artilheiros.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    2,
    'Líderes em Assistências para Gol',
    'SUM + JOIN',
    'Mostre o nome do jogador, a posição e o total de assistências distribuídas.',
    ['jogadores', 'estatisticas_partida'],
    ['jogador', 'posicao', 'total_assistencias'],
    'SELECT j.nome AS jogador, j.posicao, SUM(e.assistencias) AS total_assistencias FROM jogadores j JOIN estatisticas_partida e ON e.jogador_id = j.id GROUP BY j.id, j.nome, j.posicao ORDER BY total_assistencias DESC, jogador ASC;',
    ['join', 'group by', 'sum'],
    ['Junte jogadores e estatisticas_partida.', 'Agrupe pelo jogador e some assistencias.', 'Ordene descendentemente.'],
    'Arrascaeta distribuiu 2 assistências decisivas para seus companheiros.',
    'Métricas de passe para gol avaliam a capacidade criativa dos meias e atacantes.',
    ['joins-inner-left', 'aggregation-groupby']
  ),
  mission(
    3,
    'Precisão e Pontaria nas Finalizações',
    'SUM + Divisão + ROUND',
    'Para jogadores com ao menos 3 finalizações totais, calcule o total de finalizações, finalizações no gol e a pontaria percentual (arredondada para 1 casa decimal).',
    ['jogadores', 'estatisticas_partida'],
    ['jogador', 'finalizacoes_total', 'finalizacoes_no_gol', 'pontaria_pct'],
    'SELECT j.nome AS jogador, SUM(e.finalizacoes_total) AS finalizacoes_total, SUM(e.finalizacoes_no_gol) AS finalizacoes_no_gol, ROUND((CAST(SUM(e.finalizacoes_no_gol) AS REAL) / SUM(e.finalizacoes_total)) * 100, 1) AS pontaria_pct FROM jogadores j JOIN estatisticas_partida e ON e.jogador_id = j.id GROUP BY j.id, j.nome HAVING SUM(e.finalizacoes_total) >= 3 ORDER BY pontaria_pct DESC, finalizacoes_total DESC;',
    ['having', 'round', 'group by', 'sum', 'join'],
    ['Divida a soma de finalizacoes_no_gol por finalizacoes_total e multiplique por 100.', 'Aplique HAVING SUM(e.finalizacoes_total) >= 3.', 'Ordene por pontaria_pct DESC.'],
    'Raphael Veiga lidera com 71,4%; Pedro e Arrascaeta registram 66,7% de pontaria.',
    'O índice de pontaria separa finalizadores precisos de chutadores de baixo aproveitamento.',
    ['aggregation-groupby', 'having-where-orderby-like']
  ),
  mission(
    4,
    'Jogadores com Alto Volume de Finalizações',
    'HAVING',
    'Identifique os atletas que somaram mais de 5 finalizações totais ao longo das partidas.',
    ['jogadores', 'estatisticas_partida'],
    ['jogador', 'total_finalizacoes'],
    'SELECT j.nome AS jogador, SUM(e.finalizacoes_total) AS total_finalizacoes FROM jogadores j JOIN estatisticas_partida e ON e.jogador_id = j.id GROUP BY j.id, j.nome HAVING SUM(e.finalizacoes_total) > 5 ORDER BY total_finalizacoes DESC;',
    ['having', 'group by', 'sum'],
    ['Junte jogadores a estatisticas_partida.', 'Agrupe por jogador e aplique HAVING SUM(e.finalizacoes_total) > 5.', 'Ordene por total_finalizacoes DESC.'],
    'Hulk e Pedro lideram o volume absoluto de finalizações totais.',
    'HAVING isola os principais atacantes que concentram as jogadas ofensivas.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    5,
    'Classificação de Papel Tático Ofensivo',
    'CASE WHEN + CTE',
    'Classifique o perfil ofensivo do atleta como: "Goleador" (gols >= 2), "Criador" (assistencias >= 1 e gols < 2) ou "Apoio" (demais).',
    ['jogadores', 'estatisticas_partida'],
    ['jogador', 'total_gols', 'total_assistencias', 'perfil_ofensivo'],
    "WITH totais AS (SELECT j.id, j.nome AS jogador, SUM(e.gols) AS total_gols, SUM(e.assistencias) AS total_assistencias FROM jogadores j JOIN estatisticas_partida e ON e.jogador_id = j.id GROUP BY j.id, j.nome) SELECT jogador, total_gols, total_assistencias, CASE WHEN total_gols >= 2 THEN 'Goleador' WHEN total_assistencias >= 1 THEN 'Criador' ELSE 'Apoio' END AS perfil_ofensivo FROM totais ORDER BY total_gols DESC, total_assistencias DESC, jogador ASC;",
    ['with', 'case'],
    ['Crie uma CTE somando gols e assistências.', 'Aplique a lógica CASE WHEN para as 3 classes.', 'Ordene por total_gols DESC, total_assistencias DESC.'],
    'Pedro e Veiga enquadram-se como Goleadores, enquanto Arrascaeta e Cristaldo são Criadores.',
    'Classificações condicionais automatizam a geração de relatórios de scout de atletas.',
    ['cte-subqueries', 'case-when']
  ),
  mission(
    6,
    'Top Atletas em Volume de Passes Certos',
    'ORDER BY + LIMIT',
    'Liste os 3 jogadores com o maior número total de passes certos no campeonato.',
    ['jogadores', 'estatisticas_partida'],
    ['jogador', 'posicao', 'total_passes_certos'],
    'SELECT j.nome AS jogador, j.posicao, SUM(e.passes_certos) AS total_passes_certos FROM jogadores j JOIN estatisticas_partida e ON e.jogador_id = j.id GROUP BY j.id, j.nome, j.posicao ORDER BY total_passes_certos DESC LIMIT 3;',
    ['order by', 'limit', 'group by', 'sum'],
    ['Some passes_certos e agrupe por jogador.', 'Ordene por total_passes_certos DESC.', 'Aplique LIMIT 3.'],
    'Franco Cristaldo, Giorgian De Arrascaeta e Raphael Veiga comandam o controle de posse de bola.',
    'Métricas de passe mapeiam os condutores do ritmo de jogo da equipe.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    7,
    'Resultados Detalhados dos Confrontos',
    'JOIN múltiplo',
    'Exiba a rodada, a data da partida, o nome do clube mandante, os gols do mandante, os gols do visitante e o nome do clube visitante.',
    ['partidas', 'clubes'],
    ['rodada', 'data_partida', 'mandante', 'gols_mandante', 'gols_visitante', 'visitante'],
    'SELECT p.rodada, p.data_partida, cm.nome AS mandante, p.gols_mandante, p.gols_visitante, cv.nome AS visitante FROM partidas p JOIN clubes cm ON cm.id = p.clube_mandante_id JOIN clubes cv ON cv.id = p.clube_visitante_id ORDER BY p.rodada ASC, p.id ASC;',
    ['join'],
    ['Junte a tabela partidas duas vezes com a tabela clubes.', 'Use aliases diferentes para os clubes mandante e visitante.', 'Ordene por p.rodada ASC, p.id ASC.'],
    'Flamengo e Palmeiras venceram seus jogos em casa.',
    'JOIN duplo na mesma tabela dimensional resolve relações de confrontos bilaterais.',
    ['joins-inner-left']
  ),
  mission(
    8,
    'Ranking Oficial de Artilharia (DENSE_RANK)',
    'Window DENSE_RANK',
    'Exiba o nome do jogador, o total de gols e o ranking oficial de artilharia (DENSE_RANK).',
    ['jogadores', 'estatisticas_partida'],
    ['jogador', 'total_gols', 'posicao_artilharia'],
    'WITH gols_jogadores AS (SELECT j.id, j.nome AS jogador, SUM(e.gols) AS total_gols FROM jogadores j JOIN estatisticas_partida e ON e.jogador_id = j.id GROUP BY j.id, j.nome) SELECT jogador, total_gols, DENSE_RANK() OVER(ORDER BY total_gols DESC) AS posicao_artilharia FROM gols_jogadores ORDER BY posicao_artilharia ASC, jogador ASC;',
    ['with', 'dense_rank'],
    ['Some os gols em uma CTE.', 'Use DENSE_RANK() OVER(ORDER BY total_gols DESC) AS posicao_artilharia.', 'Ordene por posicao_artilharia ASC, jogador ASC.'],
    'Pedro lidera com 3 gols, seguido por Raphael Veiga com 2 gols na 2ª colocação.',
    'DENSE_RANK() ranqueia tabelas de líderes esportivos tratando empates de forma oficial.',
    ['window-functions', 'cte-subqueries']
  ),
  mission(
    9,
    'Passadores com Volume Acima da Média',
    'CTE + Subquery',
    'Liste os jogadores cujo total de passes certos está acima da média de passes de todos os jogadores que atuaram.',
    ['jogadores', 'estatisticas_partida'],
    ['jogador', 'total_passes_certos'],
    'WITH passes AS (SELECT j.id, j.nome AS jogador, SUM(e.passes_certos) AS total_passes_certos FROM jogadores j JOIN estatisticas_partida e ON e.jogador_id = j.id GROUP BY j.id, j.nome) SELECT jogador, total_passes_certos FROM passes WHERE total_passes_certos > (SELECT AVG(total_passes_certos) FROM passes) ORDER BY total_passes_certos DESC;',
    ['with', 'subquery'],
    ['Calcule os passes na CTE.', 'Compare com a média: WHERE total_passes_certos > (SELECT AVG(...) FROM passes).', 'Ordene descendentemente.'],
    'Cristaldo, Arrascaeta, Veiga e Gerson formam o quarteto de maior circulação de jogo.',
    'Comparações com médias globais identificam peças-chave de articulação tática.',
    ['cte-subqueries', 'aggregation-groupby']
  ),
  mission(
    10,
    'Relatório Consolidado de Scout e Performance',
    'CTE + Window Functions + JOIN',
    'Gere o relatório final de scout contendo nome do atleta, clube, posição, total de minutos jogados, total de gols, total de assistências e ranking de participação em gols (gols + assistências).',
    ['jogadores', 'clubes', 'estatisticas_partida'],
    ['jogador', 'clube', 'posicao', 'minutos_totais', 'gols', 'assistencias', 'rank_participacao'],
    'WITH scout AS (SELECT j.id AS jogador_id, j.nome AS jogador, c.nome AS clube, j.posicao, SUM(e.minutos_jogados) AS minutos_totais, SUM(e.gols) AS gols, SUM(e.assistencias) AS assistencias, (SUM(e.gols) + SUM(e.assistencias)) AS participacoes FROM jogadores j JOIN clubes c ON c.id = j.clube_id JOIN estatisticas_partida e ON e.jogador_id = j.id GROUP BY j.id, j.nome, c.nome, j.posicao) SELECT jogador, clube, posicao, minutos_totais, gols, assistencias, DENSE_RANK() OVER(ORDER BY participacoes DESC) AS rank_participacao FROM scout ORDER BY rank_participacao ASC, gols DESC, jogador ASC;',
    ['with', 'dense_rank', 'join'],
    ['Crie uma CTE com soma de minutos, gols e assistências.', 'Calcule participações e aplique DENSE_RANK() OVER(ORDER BY participacoes DESC).', 'Ordene pelo rank e pela quantidade de gols.'],
    'Pedro, Raphael Veiga e De Arrascaeta dividem o topo das participações diretas em gols do campeonato.',
    'Scouts consolidados sintetizam o impacto real dos atletas no resultado coletivo da equipe.',
    ['cte-subqueries', 'window-functions', 'joins-inner-left']
  ),
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
