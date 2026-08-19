/**
 * levels.js — Missões do Projeto 12: Gestão em Saúde
 */

const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs, requirements = []) => ({
  id, title, concept, briefing: `Analytics em Saúde e Gestão Ambulatorial. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs, requirements,
});

export const CASE_INTRO = {
  title: 'Demanda Ambulatorial, Tempo de Espera e Absenteísmo Hospitalar',
  subtitle: 'Projeto #12 — Health Analytics & Gestão Clínica',
  story: 'A diretoria médica de uma rede hospitalar precisa avaliar a sobrecarga de especialidades, o tempo de fila de espera dos pacientes e os impactos do absenteísmo (no-show) na ocupação dos consultórios.',
  mission: 'Resolva as 10 missões para auditar a capacidade ambulatorial e gerar a matriz de eficiência clínica.',
};

export const DATABASE_ANALYSIS = {
  title: 'Especialidades, corpo clínico, unidades de saúde e agendamentos',
  summary: 'O modelo separa os dados dos pacientes e médicos das unidades físicas e dos registros de consultas, permitindo avaliar tempos de espera e índices de cancelamento em múltiplos níveis.',
  entities: [
    { name: 'especialidades', role: 'Áreas da medicina e duração padrão de consulta.', key: 'PK id', relations: [] },
    { name: 'unidades', role: 'Hospitais e clínicas com capacidade diária instalada.', key: 'PK id', relations: [] },
    { name: 'medicos', role: 'Corpo clínico vinculado à unidade e especialidade.', key: 'PK id', relations: ['especialidade_id → especialidades.id', 'unidade_id → unidades.id'] },
    { name: 'pacientes', role: 'Cadastro de usuários e planos de saúde.', key: 'PK id', relations: [] },
    { name: 'agendamentos', role: 'Histórico de consultas com status e tempo de espera.', key: 'PK id', relations: ['paciente_id → pacientes.id', 'medico_id → medicos.id'] },
  ],
  decisions: [
    { title: 'Status do agendamento com no_show', explanation: 'Distingue consultas realizadas de cancelamentos e faltas não justificadas (no_show) para cálculo de ociosidade.' },
    { title: 'Tempo de espera registrado em minutos', explanation: 'Permite medir o atraso real no atendimento em relação à hora agendada.' },
    { title: 'Duração estimada na especialidade', explanation: 'Serve de base para simular capacidade e taxa de ocupação máxima diária.' },
  ],
  checkpoints: [
    { question: 'O que define a taxa de no-show em uma especialidade?', answer: 'A proporção de agendamentos com status no_show dividida pelo total de consultas agendadas.' },
    { question: 'Como medir a fila de espera do agendamento até a consulta?', answer: 'Calculando a diferença em dias corridos entre data_consulta e data_agendamento usando julianday().' },
  ],
};

export const CASE_CONCLUSION = {
  title: 'Auditoria Hospitalar Concluída',
  story: 'Cardiologia liderou a demanda com 7 agendamentos. Neurologia registrou a maior fila até a consulta, com média de 30,0 dias, e a maior espera na recepção, com 47,5 minutos; o Hospital Central teve a maior média entre as unidades, com 30,0 minutos.',
  nextSteps: 'Explore o projeto livremente no Sandbox ou avance para os próximos módulos.',
};

export const LEVELS = [
  mission(
    1,
    'Demanda por Especialidade Médica',
    'COUNT + GROUP BY',
    'Mostre o nome da especialidade e o total de agendamentos registrados para ela.',
    ['especialidades', 'medicos', 'agendamentos'],
    ['especialidade', 'total_agendamentos'],
    'SELECT e.nome AS especialidade, COUNT(a.id) AS total_agendamentos FROM especialidades e JOIN medicos m ON m.especialidade_id = e.id JOIN agendamentos a ON a.medico_id = m.id GROUP BY e.id, e.nome ORDER BY total_agendamentos DESC;',
    ['group by', 'count', 'join'],
    ['Junte especialidades, medicos e agendamentos.', 'Agrupe pela especialidade e conte os agendamentos.', 'Ordene descendentemente.'],
    'Cardiologia lidera a procura com o maior volume de marcações.',
    'Agrupamentos básicos identificam gargalos de demanda no sistema de saúde.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    2,
    'Tempo Médio de Espera na Recepção',
    'AVG + ROUND + JOIN',
    'Calcule o tempo médio de espera em minutos para consultas realizadas em cada unidade hospitalar, arredondado para 1 casa decimal.',
    ['unidades', 'medicos', 'agendamentos'],
    ['unidade', 'tempo_medio_espera_minutos'],
    "SELECT u.nome AS unidade, ROUND(AVG(a.tempo_espera_minutos), 1) AS tempo_medio_espera_minutos FROM unidades u JOIN medicos m ON m.unidade_id = u.id JOIN agendamentos a ON a.medico_id = m.id WHERE a.status = 'realizada' GROUP BY u.id, u.nome ORDER BY tempo_medio_espera_minutos DESC;",
    ['avg', 'round', 'group by', 'join', 'where'],
    ["Filtre status = 'realizada'.", 'Calcule ROUND(AVG(a.tempo_espera_minutos), 1).', 'Agrupe pela unidade e ordene descendentemente.'],
    'O Hospital Central possui o maior tempo de espera de consultório.',
    'A média de tempo de espera na sala monitora a qualidade da assistência médica.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    3,
    'Absenteísmo (No-Show) por Especialidade',
    'SUM + CASE + GROUP BY',
    'Para cada especialidade, exiba o nome e a contagem total de faltas sem aviso prévio (status = "no_show").',
    ['especialidades', 'medicos', 'agendamentos'],
    ['especialidade', 'total_no_show'],
    "SELECT e.nome AS especialidade, SUM(CASE WHEN a.status = 'no_show' THEN 1 ELSE 0 END) AS total_no_show FROM especialidades e JOIN medicos m ON m.especialidade_id = e.id JOIN agendamentos a ON a.medico_id = m.id GROUP BY e.id, e.nome ORDER BY total_no_show DESC, e.nome ASC;",
    ['case', 'group by', 'sum', 'join'],
    ["Use SUM(CASE WHEN a.status = 'no_show' THEN 1 ELSE 0 END).", 'Agrupe pela especialidade.', 'Ordene por total_no_show DESC.'],
    'Cardiologia e Dermatologia registraram faltas que geraram ociosidade de agenda.',
    'Somas condicionais medem perdas de capacidade hospitalar por absenteísmo.',
    ['case-when', 'aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    4,
    'Top Médicos com Mais Atendimentos',
    'COUNT + ORDER BY + LIMIT',
    'Liste os 3 médicos com o maior número de consultas com status "realizada".',
    ['medicos', 'agendamentos'],
    ['medico', 'total_realizadas'],
    "SELECT m.nome AS medico, COUNT(a.id) AS total_realizadas FROM medicos m JOIN agendamentos a ON a.medico_id = m.id WHERE a.status = 'realizada' GROUP BY m.id, m.nome ORDER BY total_realizadas DESC, m.nome ASC LIMIT 3;",
    ['order by', 'limit', 'count', 'where', 'group by'],
    ["Filtre status = 'realizada'.", 'Agrupe por médico e conte com COUNT(a.id).', 'Ordene por total_realizadas DESC e aplique LIMIT 3.'],
    'Dr. Rodrigo lidera com 4 consultas; Dr. Marcelo e Dra. Juliana empatam em seguida, com 3 cada.',
    'LIMIT isola os profissionais de maior produtividade clínica na rede.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    5,
    'Tempo de Fila até a Consulta',
    'AVG + ROUND + julianday',
    'Para consultas realizadas, calcule a média de dias corridos entre o agendamento e a data efetiva da consulta por especialidade, arredondada para 1 casa decimal.',
    ['especialidades', 'medicos', 'agendamentos'],
    ['especialidade', 'media_dias_fila'],
    "SELECT e.nome AS especialidade, ROUND(AVG(julianday(a.data_consulta) - julianday(a.data_agendamento)), 1) AS media_dias_fila FROM especialidades e JOIN medicos m ON m.especialidade_id = e.id JOIN agendamentos a ON a.medico_id = m.id WHERE a.status = 'realizada' GROUP BY e.id, e.nome ORDER BY media_dias_fila DESC;",
    ['avg', 'round', 'group by', 'join', 'where'],
    ["Filtre primeiro WHERE a.status = 'realizada'.", 'Calcule ROUND(AVG(julianday(a.data_consulta) - julianday(a.data_agendamento)), 1).', 'Agrupe pela especialidade e ordene pela média.'],
    'Neurologia apresenta a maior fila de espera prévia (mais de 25 dias).',
    'O cálculo de dias de fila dimensiona a necessidade de contratação de novos especialistas.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    6,
    'Perfil Etário dos Pacientes',
    'CASE WHEN + strftime',
    'Para cada paciente, liste seu nome, ano de nascimento e classifique como: "Idoso (60+)" (nascidos até 1964), "Adulto" (1965 a 2005) ou "Jovem/Criança" (após 2005).',
    ['pacientes'],
    ['nome', 'ano_nascimento', 'faixa_etaria'],
    "SELECT nome, CAST(strftime('%Y', data_nascimento) AS INTEGER) AS ano_nascimento, CASE WHEN CAST(strftime('%Y', data_nascimento) AS INTEGER) <= 1964 THEN 'Idoso (60+)' WHEN CAST(strftime('%Y', data_nascimento) AS INTEGER) <= 2005 THEN 'Adulto' ELSE 'Jovem/Criança' END AS faixa_etaria FROM pacientes ORDER BY id ASC;",
    ['case'],
    ["Extraia o ano com strftime('%Y', data_nascimento).", 'Use CASE WHEN para as 3 faixas etárias.', 'Ordene por id ASC.'],
    'Pacientes idosos representam a maioria dos atendimentos de cardiologia e neurologia.',
    'Classificações etárias no SQL direcionam programas de medicina preventiva.',
    ['case-when', 'dml-select-where']
  ),
  mission(
    7,
    'Especialidades com Longa Espera na Recepção',
    'HAVING + AVG + ROUND',
    'Identifique as especialidades cujo tempo médio de espera em consultas realizadas seja superior a 20 minutos e exiba a média arredondada para 1 casa decimal.',
    ['especialidades', 'medicos', 'agendamentos'],
    ['especialidade', 'tempo_medio_espera'],
    "SELECT e.nome AS especialidade, ROUND(AVG(a.tempo_espera_minutos), 1) AS tempo_medio_espera FROM especialidades e JOIN medicos m ON m.especialidade_id = e.id JOIN agendamentos a ON a.medico_id = m.id WHERE a.status = 'realizada' GROUP BY e.id, e.nome HAVING AVG(a.tempo_espera_minutos) > 20 ORDER BY tempo_medio_espera DESC;",
    ['having', 'group by', 'avg', 'round', 'where'],
    ["Filtre status = 'realizada'.", 'Aplique HAVING AVG(a.tempo_espera_minutos) > 20.', 'Exiba ROUND(AVG(a.tempo_espera_minutos), 1) e ordene pela média.'],
    'Neurologia e Cardiologia exigem maior tempo de triagem e consulta.',
    'HAVING detecta especialidades com atrasos recorrentes no consultório.',
    ['having-where-orderby-like', 'aggregation-groupby']
  ),
  mission(
    8,
    'Último Atendimento de Cada Paciente',
    'Window ROW_NUMBER',
    'Para cada paciente com consultas realizadas, mostre o nome do paciente, a data da consulta e o médico do atendimento mais recente.',
    ['pacientes', 'medicos', 'agendamentos'],
    ['paciente', 'data_consulta', 'medico'],
    "WITH consultas_ordenadas AS (SELECT p.nome AS paciente, a.data_consulta, m.nome AS medico, ROW_NUMBER() OVER(PARTITION BY p.id ORDER BY a.data_consulta DESC, a.id DESC) AS rn FROM pacientes p JOIN agendamentos a ON a.paciente_id = p.id JOIN medicos m ON m.id = a.medico_id WHERE a.status = 'realizada') SELECT paciente, data_consulta, medico FROM consultas_ordenadas WHERE rn = 1 ORDER BY paciente ASC;",
    ['with', 'row_number'],
    ['Crie uma CTE com ROW_NUMBER() OVER(PARTITION BY p.id ORDER BY a.data_consulta DESC).', 'Filtre WHERE rn = 1.', 'Ordene por paciente ASC.'],
    'O histórico clínico consolidado preserva o último profissional responsável pelo paciente.',
    'ROW_NUMBER particionado recupera a linha mais recente de cada entidade.',
    ['window-functions', 'cte-subqueries']
  ),
  mission(
    9,
    'Consultas por Convênio de Saúde',
    'COUNT + GROUP BY',
    'Calcule o total de consultas realizadas agrupadas pelo nome do convênio de saúde.',
    ['pacientes', 'agendamentos'],
    ['convenio', 'total_consultas_realizadas'],
    "SELECT p.convenio, COUNT(a.id) AS total_consultas_realizadas FROM pacientes p JOIN agendamentos a ON a.paciente_id = p.id WHERE a.status = 'realizada' GROUP BY p.convenio ORDER BY total_consultas_realizadas DESC;",
    ['group by', 'count', 'where', 'join'],
    ["Filtre WHERE a.status = 'realizada'.", 'Agrupe por p.convenio e conte as consultas.', 'Ordene descendentemente.'],
    'Unimed e Amil lideram o volume de consultas realizadas, com 5 atendimentos cada.',
    'Agregações por operadora de saúde alimentam o repasse de honorários médicos.',
    ['aggregation-groupby', 'joins-inner-left']
  ),
  mission(
    10,
    'Painel Consolidado de Eficiência Clínica',
    'CTE + Window Functions',
    'Gere o relatório final contendo o nome da especialidade, total de agendamentos, total de consultas realizadas, total de faltas (no_show) e o ranking de demanda (DENSE_RANK).',
    ['especialidades', 'medicos', 'agendamentos'],
    ['especialidade', 'total_agendamentos', 'total_realizadas', 'total_no_show', 'rank_demanda'],
    "WITH stats AS (SELECT e.nome AS especialidade, COUNT(a.id) AS total_agendamentos, SUM(CASE WHEN a.status = 'realizada' THEN 1 ELSE 0 END) AS total_realizadas, SUM(CASE WHEN a.status = 'no_show' THEN 1 ELSE 0 END) AS total_no_show FROM especialidades e JOIN medicos m ON m.especialidade_id = e.id JOIN agendamentos a ON a.medico_id = m.id GROUP BY e.id, e.nome) SELECT especialidade, total_agendamentos, total_realizadas, total_no_show, DENSE_RANK() OVER(ORDER BY total_agendamentos DESC) AS rank_demanda FROM stats ORDER BY rank_demanda ASC, especialidade ASC;",
    ['with', 'dense_rank', 'case', 'sum'],
    ['Crie uma CTE com contagens agregadas por especialidade.', 'Aplique DENSE_RANK() OVER(ORDER BY total_agendamentos DESC) AS rank_demanda.', 'Ordene por rank_demanda ASC, especialidade ASC.'],
    'O relatório executivo consolida demanda, consultas realizadas e faltas por especialidade.',
    'CTEs com funções de janela constroem visões analíticas 360° completas.',
    ['cte-subqueries', 'window-functions', 'case-when']
  ),
];

export function getLevel(id) {
  return LEVELS.find(level => level.id === id) || null;
}

export function getTotalLevels() {
  return LEVELS.length;
}
