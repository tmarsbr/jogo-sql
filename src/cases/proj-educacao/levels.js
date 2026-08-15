/**
 * levels.js — Missões do Projeto 11: Gestão Educacional
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs) => ({
  id, title, concept, briefing: `Análise de Desempenho e Indicadores Acadêmicos. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs,
});

export const CASE_INTRO = {
  title: 'Retenção Acadêmica, Reprovação e Rendimento Escolar',
  subtitle: 'Projeto #11 — Analytics Educacional e Sucesso do Aluno',
  story: 'A coordenação pedagógica universitária precisa analisar os índices de aprovação e reprovação por disciplina e professor para implementar programas de monitoria e nivelamento.',
  mission: 'Resolva as 10 missões para auditar o boletim geral e gerar o painel pedagógico.',
};

export const DATABASE_ANALYSIS = {
  title: 'Cursos, corpo docente, disciplinas e histórico de notas',
  summary: 'O modelo desacopla os dados cadastrais dos alunos das matrizes curriculares e dos registros de turmas, permitindo cruzar frequência, notas e evasão por período letivo.',
  entities: [
    { name: 'cursos', role: 'Departamentos e graduações da instituição.', key: 'PK id', relations: [] },
    { name: 'professores', role: 'Corpo docente e titulações acadêmicas.', key: 'PK id', relations: [] },
    { name: 'disciplinas', role: 'Cadeiras curriculares e cargas horárias.', key: 'PK id', relations: ['curso_id → cursos.id', 'professor_id → professores.id'] },
    { name: 'alunos', role: 'Cadastro de discentes e ano de ingresso.', key: 'PK id', relations: [] },
    { name: 'turmas_matriculas', role: 'Frequência, notas finais e status no semestre.', key: 'PK id', relations: ['aluno_id → alunos.id', 'disciplina_id → disciplinas.id'] },
  ],
  decisions: [
    { title: 'Status de matrícula detalhado', explanation: 'Distingue reprovação por nota de reprovação por infrequência, permitindo atuações pedagógicas distintas.' },
    { title: 'Nota e frequência separadas', explanation: 'Permite correlacionar presencialidade com aproveitamento escolar.' },
    { title: 'Semestre como dimensão de coorte', explanation: 'Viabiliza comparações históricas entre diferentes turmas de uma mesma matéria.' },
  ],
  checkpoints: [
    { question: 'Como calcular a taxa de reprovação de uma disciplina?', answer: 'Contando as matrículas com status reprovado_nota ou reprovado_falta e dividindo pelo total de matrículas da matéria.' },
    { question: 'Por que o modelo isola professores de turmas_matriculas?', answer: 'Porque a disciplina é ministrada por um docente responsável, normalizando o vínculo pedagógico.' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Diagnóstico Acadêmico Homologado',
  story: 'A disciplina de Cálculo Diferencial I apresentou índice de reprovação de 60%, exigindo abertura de turmas extras de monitoria e reforço de pré-cálculo.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou continue para os próximos cenários.',
};

export const LEVELS = [
  mission(
    1,
    'Média de Notas por Disciplina',
    'AVG + GROUP BY',
    'Mostre o código, o nome da disciplina e a média da nota final (arredondada para 1 casa decimal) em turmas concluídas.',
    ['disciplinas', 'turmas_matriculas'],
    ['codigo', 'disciplina', 'media_nota'],
    'SELECT d.codigo, d.nome AS disciplina, ROUND(AVG(tm.nota_final), 1) AS media_nota FROM disciplinas d JOIN turmas_matriculas tm ON tm.disciplina_id = d.id WHERE tm.nota_final IS NOT NULL GROUP BY d.id, d.codigo, d.nome ORDER BY media_nota ASC;',
    ['avg', 'group by', 'join', 'round'],
    ['Junte disciplinas e turmas_matriculas.', 'Use ROUND(AVG(tm.nota_final), 1) AS media_nota.', 'Ordene por media_nota ASC.'],
    'Cálculo I apresenta a média geral mais baixa do ciclo básico.',
    'AVG combinado com ROUND produz indicadores de rendimento limpos.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    2,
    'Total de Reprovações por Matéria',
    'SUM + CASE + GROUP BY',
    'Para cada disciplina, exiba o nome e a contagem total de alunos reprovados (status iniciando com "reprovado").',
    ['disciplinas', 'turmas_matriculas'],
    ['disciplina', 'total_reprovados'],
    "SELECT d.nome AS disciplina, SUM(CASE WHEN tm.status LIKE 'reprovado%' THEN 1 ELSE 0 END) AS total_reprovados FROM disciplinas d LEFT JOIN turmas_matriculas tm ON tm.disciplina_id = d.id GROUP BY d.id, d.nome ORDER BY total_reprovados DESC;",
    ['case', 'group by', 'sum', 'left join'],
    ['Parta de disciplinas e use LEFT JOIN para manter matérias sem matrículas.', "Use SUM(CASE WHEN tm.status LIKE 'reprovado%' THEN 1 ELSE 0 END).", 'Agrupe por disciplina e ordene por total_reprovados DESC.'],
    'Cálculo Diferencial e Integral I soma 3 reprovações; Algoritmos e Estatística registram 1 cada, e Matemática Financeira aparece com zero matrículas.',
    'Somas condicionais com LIKE filtram subgrupos categóricos.',
    ['case-when', 'aggregation-groupby', 'having-where-orderby-like']
  ),
  mission(
    3,
    'Alunos com Desempenho Notável',
    'JOIN múltiplo + WHERE',
    'Liste o nome do aluno, a disciplina, o nome do professor e a nota final para avaliações com nota >= 9.0.',
    ['alunos', 'disciplinas', 'professores', 'turmas_matriculas'],
    ['aluno', 'disciplina', 'professor', 'nota_final'],
    'SELECT a.nome AS aluno, d.nome AS disciplina, p.nome AS professor, tm.nota_final FROM turmas_matriculas tm JOIN alunos a ON a.id = tm.aluno_id JOIN disciplinas d ON d.id = tm.disciplina_id JOIN professores p ON p.id = d.professor_id WHERE tm.nota_final >= 9.0 ORDER BY tm.nota_final DESC, a.nome ASC;',
    ['join', 'where'],
    ['Junte turmas_matriculas, alunos, disciplinas e professores.', 'Filtre WHERE tm.nota_final >= 9.0.', 'Ordene por nota_final DESC, aluno ASC.'],
    'Caio Henrique, Enzo Gabriel e Helena Marcondes alcançaram notas de excelência; Caio aparece em duas disciplinas.',
    'JOINs de múltiplas tabelas conectam discentes, docentes e registros avaliativos.',
    ['joins-inner-left', 'dml-select-where']
  ),
  mission(
    4,
    'Disciplinas Críticas com Baixa Média',
    'HAVING',
    'Identifique as disciplinas cuja média geral de notas seja estritamente inferior a 6.0.',
    ['disciplinas', 'turmas_matriculas'],
    ['codigo', 'disciplina', 'media_nota'],
    'SELECT d.codigo, d.nome AS disciplina, ROUND(AVG(tm.nota_final), 1) AS media_nota FROM disciplinas d JOIN turmas_matriculas tm ON tm.disciplina_id = d.id WHERE tm.nota_final IS NOT NULL GROUP BY d.id, d.codigo, d.nome HAVING AVG(tm.nota_final) < 6.0 ORDER BY media_nota ASC;',
    ['having', 'group by', 'avg'],
    ['Calcule a média com AVG(tm.nota_final).', 'Aplique HAVING AVG(tm.nota_final) < 6.0.', 'Ordene por media_nota ASC.'],
    'Apenas Cálculo Diferencial e Integral I opera abaixo da nota de corte.',
    'HAVING isola matérias críticas para alocação de tutores e monitores.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    5,
    'Classificação de Aproveitamento Individual',
    'CASE WHEN',
    'Para todas as matrículas com nota, mostre o nome do aluno, a nota final e classifique como "Excelente" (>= 9.0), "Aprovado" (>= 7.0) ou "Insuficiente" (< 7.0).',
    ['alunos', 'turmas_matriculas'],
    ['aluno', 'nota_final', 'aproveitamento'],
    "SELECT a.nome AS aluno, tm.nota_final, CASE WHEN tm.nota_final >= 9.0 THEN 'Excelente' WHEN tm.nota_final >= 7.0 THEN 'Aprovado' ELSE 'Insuficiente' END AS aproveitamento FROM turmas_matriculas tm JOIN alunos a ON a.id = tm.aluno_id WHERE tm.nota_final IS NOT NULL ORDER BY tm.id ASC;",
    ['case', 'where', 'join'],
    ['Filtre WHERE tm.nota_final IS NOT NULL.', 'Use CASE WHEN para as 3 faixas de aproveitamento.', 'Ordene por tm.id ASC.'],
    'A classificação qualitativa traduz notas numéricas em conceitos didáticos.',
    'Estruturas CASE WHEN criam escalas conceituais acadêmicas.',
    ['case-when', 'joins-inner-left']
  ),
  mission(
    6,
    'Alunos com Coeficiente Acima da Média',
    'CTE + Subquery',
    'Liste os alunos cujo coeficiente médio de notas gerais seja superior à média geral de todos os registros de notas.',
    ['alunos', 'turmas_matriculas'],
    ['aluno', 'media_individual'],
    'WITH medias_alunos AS (SELECT a.id, a.nome AS aluno, ROUND(AVG(tm.nota_final), 2) AS media_individual FROM alunos a JOIN turmas_matriculas tm ON tm.aluno_id = a.id WHERE tm.nota_final IS NOT NULL GROUP BY a.id, a.nome) SELECT aluno, media_individual FROM medias_alunos WHERE media_individual > (SELECT AVG(nota_final) FROM turmas_matriculas) ORDER BY media_individual DESC;',
    ['with', 'subquery', 'avg'],
    ['Crie uma CTE com a média por aluno.', 'Filtre WHERE media_individual > (SELECT AVG(nota_final) FROM turmas_matriculas).', 'Ordene descendentemente.'],
    'Helena, Caio, Fernanda, Enzo e Guilherme ficaram acima da média geral de notas.',
    'Comparar coeficientes individuais com a média global identifica discentes de destaque.',
    ['cte-subqueries', 'aggregation-groupby']
  ),
  mission(
    7,
    'Ranking de Notas em Cálculo I',
    'Window DENSE_RANK',
    'Na disciplina "MAT101", mostre o nome do aluno, a nota final e o ranking (DENSE_RANK) das notas.',
    ['alunos', 'disciplinas', 'turmas_matriculas'],
    ['aluno', 'nota_final', 'ranking_turma'],
    "SELECT a.nome AS aluno, tm.nota_final, DENSE_RANK() OVER(ORDER BY tm.nota_final DESC) AS ranking_turma FROM turmas_matriculas tm JOIN alunos a ON a.id = tm.aluno_id JOIN disciplinas d ON d.id = tm.disciplina_id WHERE d.codigo = 'MAT101' ORDER BY ranking_turma ASC, a.nome ASC;",
    ['dense_rank', 'where', 'join'],
    ["Filtre WHERE d.codigo = 'MAT101'.", 'Use DENSE_RANK() OVER(ORDER BY tm.nota_final DESC) AS ranking_turma.', 'Ordene por ranking_turma ASC, a.nome ASC.'],
    'Enzo e Caio conquistaram as primeiras posições da turma.',
    'DENSE_RANK() ranqueia desempenhos com tratamento consistente de empates.',
    ['window-functions', 'joins-inner-left']
  ),
  mission(
    8,
    'Reprovações por Frequência Insuficiente',
    'WHERE + Filtro',
    'Liste o nome do aluno, a disciplina e a frequência percentual dos alunos reprovados por falta (status = "reprovado_falta" ou frequencia < 75.0).',
    ['alunos', 'disciplinas', 'turmas_matriculas'],
    ['aluno', 'disciplina', 'frequencia_percentual'],
    "SELECT a.nome AS aluno, d.nome AS disciplina, tm.frequencia_percentual FROM turmas_matriculas tm JOIN alunos a ON a.id = tm.aluno_id JOIN disciplinas d ON d.id = tm.disciplina_id WHERE tm.status = 'reprovado_falta' OR tm.frequencia_percentual < 75.0 ORDER BY a.nome ASC;",
    ['where', 'join'],
    ['Junte turmas_matriculas a alunos e disciplinas.', "Filtre status = 'reprovado_falta' OR frequencia_percentual < 75.0.", 'Ordene por a.nome ASC.'],
    'Bernardo Lima foi reprovado em Cálculo por excesso de faltas (65% de presença).',
    'Filtrar infrequência apoia políticas ativas contra o abandono e evasão escolar.',
    ['dml-select-where', 'joins-inner-left']
  ),
  mission(
    9,
    'Aproveitamento por Professor',
    'CTE + Agregação',
    'Para cada professor, calcule o total de alunos avaliados e a média geral de notas de suas disciplinas.',
    ['professores', 'disciplinas', 'turmas_matriculas'],
    ['professor', 'total_avaliados', 'media_geral_notas'],
    'WITH desempenho_professores AS (SELECT p.id AS professor_id, p.nome AS professor, COUNT(tm.id) AS total_avaliados, ROUND(AVG(tm.nota_final), 2) AS media_geral_notas FROM professores p JOIN disciplinas d ON d.professor_id = p.id JOIN turmas_matriculas tm ON tm.disciplina_id = d.id WHERE tm.nota_final IS NOT NULL GROUP BY p.id, p.nome) SELECT professor, total_avaliados, media_geral_notas FROM desempenho_professores ORDER BY media_geral_notas DESC;',
    ['with', 'group by', 'avg', 'count', 'join', 'round'],
    ['Crie uma CTE que junte professores, disciplinas e turmas_matriculas.', 'Na CTE, agrupe pelo professor e calcule COUNT e AVG.', 'Consulte a CTE e ordene por media_geral_notas DESC.'],
    'A Dra. Denise Alcantara lidera o aproveitamento com média 9.0 em UI/UX.',
    'Agregações no nível docente monitoram a consistência das avaliações pedagógicas.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  {
    ...mission(
      10,
      'View de Desempenho Pedagógico',
      'CREATE VIEW + JOIN + GROUP BY',
      'Crie a view vw_desempenho_pedagogico_disciplinas contendo codigo, disciplina, professor, total_matriculas e media_notas de todas as disciplinas, inclusive as que ainda não possuem matrículas.',
      ['disciplinas', 'professores', 'turmas_matriculas'],
      ['codigo', 'disciplina', 'professor', 'total_matriculas', 'media_notas'],
      'CREATE VIEW vw_desempenho_pedagogico_disciplinas AS SELECT d.codigo, d.nome AS disciplina, p.nome AS professor, COUNT(tm.id) AS total_matriculas, ROUND(AVG(tm.nota_final), 1) AS media_notas FROM disciplinas d JOIN professores p ON p.id = d.professor_id LEFT JOIN turmas_matriculas tm ON tm.disciplina_id = d.id GROUP BY d.id, d.codigo, d.nome, p.nome;',
      ['create view', 'left join', 'group by', 'round'],
      ['Crie a view com CREATE VIEW vw_desempenho_pedagogico_disciplinas AS SELECT ...', 'Use LEFT JOIN com turmas_matriculas para preservar disciplinas sem matrículas.', 'Agrupe por d.id, d.codigo, d.nome, p.nome.'],
      'A view de acompanhamento pedagógico está operacional para a reitoria.',
      'Views acadêmicas padronizam métricas de qualidade de ensino para órgãos regulatórios.',
      ['views', 'joins-inner-left', 'aggregation-groupby']
    ),
    executionMode: 'create_view',
    viewName: 'vw_desempenho_pedagogico_disciplinas',
    verificationQuery: 'SELECT * FROM vw_desempenho_pedagogico_disciplinas ORDER BY codigo ASC;',
    expectedResultQuery: 'SELECT d.codigo, d.nome AS disciplina, p.nome AS professor, COUNT(tm.id) AS total_matriculas, ROUND(AVG(tm.nota_final), 1) AS media_notas FROM disciplinas d JOIN professores p ON p.id = d.professor_id LEFT JOIN turmas_matriculas tm ON tm.disciplina_id = d.id GROUP BY d.id, d.codigo, d.nome, p.nome ORDER BY codigo ASC;',
  },
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
