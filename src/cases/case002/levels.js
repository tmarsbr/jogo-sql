/** Missões do Caso #002 — Vazamento na Matriz. */
const mission = (id, title, concept, objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs) => ({
  id, title, concept, briefing: `A investigação do vazamento precisa de uma consulta precisa. ${objective}`,
  objective, tables, expectedColumns, referenceQuery, requiredConcepts, hints, evidence, explanation, courseRefs,
});

export const CASE_INTRO = {
  title: 'Vazamento na Matriz', subtitle: 'Caso #002 — Segurança de Dados e LGPD',
  story: 'Dados confidenciais de clientes apareceram no mercado negro. A equipe de TI suspeita que alguém de dentro exportou tabelas e apagou seus rastros.',
  mission: 'Resolva as 11 missões para identificar o insider e formalizar o relatório de segurança.',
};

export const DATABASE_ANALYSIS = {
  title: 'Dados pessoais de um lado, rastros de segurança do outro',
  summary: 'O desenho separa o cadastro sensível dos clientes das identidades internas e dos eventos de acesso, exportação e alerta. Essa divisão reduz exposição desnecessária e permite investigar cada ação sem copiar dados pessoais para os logs.',
  entities: [
    { name: 'clientes', role: 'Cadastro protegido com CPF, contato e plano.', key: 'PK id', relations: [] },
    { name: 'usuarios', role: 'Identidades internas, cargos e níveis de acesso.', key: 'PK id', relations: ['É referenciada por acessos, exportações e alertas'] },
    { name: 'acessos_sistema', role: 'Trilha cronológica de ações, tabelas e IPs.', key: 'PK id', relations: ['usuario_id → usuarios.id'] },
    { name: 'logs_exportacao', role: 'Detalha formato, volume e destino de cada extração.', key: 'PK id', relations: ['usuario_id → usuarios.id'] },
    { name: 'alertas_seguranca', role: 'Registra sinais automáticos e sua severidade.', key: 'PK id', relations: ['usuario_id → usuarios.id'] },
    { name: 'politicas_acesso', role: 'Centraliza o nível mínimo exigido por conjunto de dados.', key: 'PK id', relations: ['tabela é uma referência lógica ao recurso protegido'] },
  ],
  decisions: [
    { title: 'Privilégio e comportamento são fatos distintos', explanation: 'usuarios diz o que uma pessoa pode fazer; os logs mostram o que ela realmente fez. A investigação compara essas duas dimensões.' },
    { title: 'Logs enxutos', explanation: 'Eventos guardam usuario_id, não nome e cargo repetidos. Isso mantém a identidade consistente e evita espalhar dados pessoais.' },
    { title: 'View para consumo seguro', explanation: 'Uma view pode publicar somente as colunas necessárias e encapsular JOIN, agregação e filtros de um relatório recorrente.' },
  ],
  checkpoints: [
    { question: 'Por que acessos e exportações não ficam na mesma tabela?', answer: 'Acesso é qualquer ação no sistema; exportação possui formato, volume e destino próprios. Separar eventos com estruturas diferentes evita muitas colunas nulas e regras ambíguas.' },
    { question: 'O que uma view acrescenta ao relatório final?', answer: 'Ela salva a consulta com nome estável, padroniza colunas e filtros e reduz a necessidade de repetir uma lógica sensível em cada relatório.' },
  ],
};
export const CASE_CONCLUSION = {
  title: 'Insider Identificado',
  story: 'Rafael Mendes, DBA, exportou a tabela de clientes de madrugada em CSV e JSON por uma VPN não corporativa. O cruzamento de logs, volume e alertas confirma o vazamento.',
  nextSteps: 'O Caso #003 foi desbloqueado.',
};
export const LEVELS = [
  mission(1, 'Dados no Mercado Negro', 'SELECT + WHERE', 'Liste nome, CPF e e-mail dos clientes Premium.', ['clientes'], ['nome_completo','cpf','email'], "SELECT nome_completo, cpf, email FROM clientes WHERE plano = 'Premium' ORDER BY id;", ['where'], ['Comece pela tabela clientes.', 'Filtre o plano Premium com WHERE.', "SELECT nome_completo, cpf, email FROM clientes WHERE plano = 'Premium';"], 'Dados sensíveis estavam concentrados entre clientes Premium.', 'WHERE limita a consulta às linhas necessárias.', ['dml-select-where']),
  mission(2, 'Quem Tem Acesso?', 'JOIN', 'Mostre usuário, tabela e nível mínimo das políticas que ele pode acessar.', ['usuarios','politicas_acesso'], ['nome','tabela','nivel_minimo'], 'SELECT u.nome, p.tabela, p.nivel_minimo FROM usuarios u JOIN politicas_acesso p ON u.nivel_acesso >= p.nivel_minimo ORDER BY u.id, p.id;', ['join'], ['Compare o nível do usuário ao nível mínimo.', 'Use JOIN com a condição de acesso.', 'JOIN politicas_acesso p ON u.nivel_acesso >= p.nivel_minimo'], 'Apenas alguns usuários possuem privilégio para ler dados pessoais.', 'JOIN cruza tabelas usando uma condição de relacionamento.', ['joins-inner-left']),
  mission(3, 'Mascarando a Verdade', 'SUBSTR', 'Mostre CPF mascarado, com apenas os quatro últimos dígitos visíveis.', ['clientes'], ['nome_completo','cpf_mascarado'], "SELECT nome_completo, '***.***.***-' || SUBSTR(REPLACE(cpf, '-', ''), -4) AS cpf_mascarado FROM clientes ORDER BY id;", ['substr'], ['SUBSTR pode extrair o fim de um texto.', 'Remova o hífen antes de extrair os quatro últimos dígitos.', "'***.***.***-' || SUBSTR(REPLACE(cpf, '-', ''), -4)"], 'A análise pode preservar privacidade sem ocultar padrões.', 'SUBSTR extrai uma parte de uma string.', ['string-functions']),
  mission(4, 'O Rastro Digital', 'WHERE + datas', 'Liste os acessos feitos entre meia-noite e 5h.', ['acessos_sistema'], ['usuario_id','data_hora','acao'], "SELECT usuario_id, data_hora, acao FROM acessos_sistema WHERE CAST(strftime('%H', data_hora) AS INTEGER) < 5 ORDER BY id;", ['where'], ['strftime extrai a hora.', 'Compare a hora com 5.', "WHERE CAST(strftime('%H', data_hora) AS INTEGER) < 5"], 'Os acessos de madrugada pertencem ao mesmo usuário.', 'Funções de data permitem filtrar horários anômalos.', ['dml-select-where']),
  mission(5, 'Exportações em Massa', 'GROUP BY + HAVING', 'Liste usuários que exportaram mais de 100 registros, com o total exportado.', ['logs_exportacao','usuarios'], ['nome','total_registros'], 'SELECT u.nome, SUM(le.quantidade_registros) AS total_registros FROM logs_exportacao le JOIN usuarios u ON u.id = le.usuario_id GROUP BY u.id, u.nome HAVING SUM(le.quantidade_registros) > 100 ORDER BY u.id;', ['group by','having'], ['Some quantidade_registros por usuário.', 'Filtre grupos depois do GROUP BY.', 'Use HAVING SUM(...) > 100.'], 'Uma única conta acumulou exportações em massa.', 'HAVING filtra resultados agregados.', ['aggregation-groupby','having-where-orderby-like']),
  mission(6, 'O IP Fantasma', 'DISTINCT + COUNT', 'Encontre IPs com mais de um acesso e mostre sua quantidade.', ['acessos_sistema'], ['ip_origem','total_acessos'], 'SELECT DISTINCT ip_origem, COUNT(*) AS total_acessos FROM acessos_sistema GROUP BY ip_origem HAVING COUNT(*) > 1 ORDER BY ip_origem;', ['distinct','count'], ['Agrupe por IP.', 'COUNT(*) revela repetições.', 'DISTINCT mantém o IP sem duplicatas.'], 'Uma VPN externa foi usada repetidamente.', 'COUNT mede ocorrências; DISTINCT remove repetição no resultado.', ['aggregation-groupby']),
  mission(7, 'Padrão de Extração', 'REPLACE + LIKE', 'Liste os logs CSV ou JSON, exibindo o formato com a palavra "arquivo".', ['logs_exportacao'], ['id','formato_exibido'], "SELECT id, REPLACE(REPLACE(formato, 'CSV', 'arquivo CSV'), 'JSON', 'arquivo JSON') AS formato_exibido FROM logs_exportacao WHERE formato LIKE 'CSV' OR formato LIKE 'JSON' ORDER BY id;", ['replace','like'], ['LIKE filtra formatos.', 'REPLACE troca parte de um texto.', 'Use um REPLACE para cada formato.'], 'CSV e JSON foram usados para extrair dados de clientes.', 'LIKE encontra padrões e REPLACE transforma textos.', ['string-functions','having-where-orderby-like']),
  mission(8, 'Alerta Vermelho', 'CASE WHEN + ORDER BY', 'Classifique alertas como prioridade_alta ou prioridade_normal.', ['alertas_seguranca'], ['id','severidade','prioridade'], "SELECT id, severidade, CASE WHEN severidade IN ('critica','alta') THEN 'prioridade_alta' ELSE 'prioridade_normal' END AS prioridade FROM alertas_seguranca ORDER BY id;", ['case'], ['CASE cria categorias.', 'Critica e alta devem ficar juntas.', 'Finalize com END AS prioridade.'], 'Os alertas de Rafael receberam a maior prioridade.', 'CASE WHEN classifica linhas por condição.', ['case-when']),
  mission(9, 'A Janela do Crime', 'Subquery correlacionada', 'Mostre exportações feitas por usuários abaixo do nível exigido pela política.', ['logs_exportacao','usuarios','politicas_acesso'], ['nome','tabela'], 'SELECT u.nome, le.tabela FROM logs_exportacao le JOIN usuarios u ON u.id = le.usuario_id WHERE u.nivel_acesso < (SELECT p.nivel_minimo FROM politicas_acesso p WHERE p.tabela = le.tabela) ORDER BY le.id;', ['subquery'], ['A política depende da tabela de cada log.', 'A subquery deve consultar politicas_acesso.', 'Relacione p.tabela com le.tabela.'], 'As permissões formais não explicam todas as exportações — há desvio de privilégio.', 'Uma subquery correlacionada é avaliada no contexto da linha externa.', ['cte-subqueries']),
  mission(10, 'O Insider', 'CTEs + JOIN múltiplo + agregação', 'Identifique o usuário com exportações, alertas e total de registros, agregando cada fonte antes de cruzá-las.', ['usuarios','logs_exportacao','alertas_seguranca'], ['nome','total_exportado','total_alertas'], 'WITH exportacoes AS (SELECT usuario_id, SUM(quantidade_registros) AS total_exportado FROM logs_exportacao GROUP BY usuario_id), alertas AS (SELECT usuario_id, COUNT(*) AS total_alertas FROM alertas_seguranca GROUP BY usuario_id) SELECT u.nome, e.total_exportado, a.total_alertas FROM usuarios u JOIN exportacoes e ON e.usuario_id = u.id JOIN alertas a ON a.usuario_id = u.id WHERE e.total_exportado > 100 AND a.total_alertas >= 2 ORDER BY u.id;', ['with','join','group by'], ['Agregue logs_exportacao por usuario_id em uma CTE.', 'Crie outra CTE para contar alertas por usuário.', 'Junte as duas CTEs a usuarios e aplique os limites no WHERE.'], 'Rafael Mendes reúne todos os sinais do vazamento, com 650 registros exportados e três alertas.', 'Pré-agregar relações um-para-muitos antes dos JOINs evita multiplicar linhas e inflar totais.', ['cte-subqueries','joins-inner-left','aggregation-groupby']),
  {
    ...mission(
      11,
      'Relatório do Insider',
      'CREATE VIEW + JOIN + GROUP BY',
      'Crie a view vw_relatorio_seguranca com nome, total_registros e total_exportacoes apenas para usuários que exportaram mais de 100 registros.',
      ['usuarios','logs_exportacao'],
      ['nome','total_registros','total_exportacoes'],
      'CREATE VIEW vw_relatorio_seguranca AS SELECT u.nome, SUM(le.quantidade_registros) AS total_registros, COUNT(*) AS total_exportacoes FROM logs_exportacao le JOIN usuarios u ON u.id = le.usuario_id GROUP BY u.id, u.nome HAVING SUM(le.quantidade_registros) > 100;',
      ['create view','join','group by','having'],
      [
        'CREATE VIEW nome_da_view AS salva o SELECT que vem depois.',
        'Junte logs_exportacao a usuarios e agrupe por u.id e u.nome.',
        'Finalize com HAVING SUM(le.quantidade_registros) > 100. Execute somente o CREATE VIEW; a prévia será aberta automaticamente.',
      ],
      'A visão reutilizável do relatório aponta uma única conta com três exportações e 650 registros extraídos.',
      'CREATE VIEW transforma uma consulta validada em uma interface estável para os relatórios de segurança.',
      ['views','joins-inner-left','aggregation-groupby']
    ),
    executionMode: 'create_view',
    viewName: 'vw_relatorio_seguranca',
    verificationQuery: 'SELECT * FROM vw_relatorio_seguranca ORDER BY nome;',
    expectedResultQuery: 'SELECT u.nome, SUM(le.quantidade_registros) AS total_registros, COUNT(*) AS total_exportacoes FROM logs_exportacao le JOIN usuarios u ON u.id = le.usuario_id GROUP BY u.id, u.nome HAVING SUM(le.quantidade_registros) > 100 ORDER BY u.nome;',
  },
];
export function getLevel(id) { return LEVELS.find(level => level.id === id); }
export function getTotalLevels() { return LEVELS.length; }
