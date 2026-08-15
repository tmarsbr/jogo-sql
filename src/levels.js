/**
 * levels.js — Configuração data-driven das missões do SQL Detective.
 *
 * Fase 8: 12 missões completas (MVP + avançadas).
 * Missão 12 usa o SPOILER.md como referência obrigatória.
 */

/** Narrativa de introdução do caso */
export const CASE_INTRO = {
  title: 'O Mistério das Transações Fantasmas',
  subtitle: 'Caso #001 — Departamento Financeiro',
  story: `Uma auditoria interna detectou transações bancárias suspeitas na empresa TechFin. 
Valores altos foram movimentados para uma conta externa misteriosa, fora do horário normal de trabalho. 
Você é o(a) detective(a) responsável por investigar o banco de dados e descobrir o que aconteceu.
Use suas habilidades de SQL para interrogar o banco e reunir evidências.`,
  mission: 'Resolva as 12 missões para concluir a investigação.',
};

/** Etapa 0 — leitura conceitual do modelo antes das missões. */
export const DATABASE_ANALYSIS = {
  title: 'Evidências separadas, identidades conectadas',
  summary: 'O banco do Caso 001 foi normalizado para que cada fato seja armazenado uma única vez. Funcionários, transações, acessos e e-mails têm responsabilidades diferentes; chaves estrangeiras preservam os relacionamentos sem repetir nomes, cargos ou departamentos em cada ocorrência.',
  entities: [
    {
      name: 'funcionarios',
      role: 'Mantém a identidade e os dados profissionais de cada pessoa.',
      key: 'PK id',
      relations: ['departamento_id → departamentos.id', 'É referenciada por transacoes, logs_acesso e emails'],
    },
    {
      name: 'transacoes',
      role: 'Registra cada movimentação financeira como um fato independente.',
      key: 'PK id',
      relations: ['conta_origem_id / conta_destino_id → contas.id', 'operador_funcionario_id → funcionarios.id'],
    },
    {
      name: 'logs_acesso',
      role: 'Preserva o histórico de entradas e saídas sem alterar o cadastro do funcionário.',
      key: 'PK id',
      relations: ['funcionario_id → funcionarios.id'],
    },
    {
      name: 'emails',
      role: 'Armazena mensagens e permite que uma pessoa apareça como remetente ou destinatária.',
      key: 'PK id',
      relations: ['remetente_id / destinatario_id → funcionarios.id'],
    },
    {
      name: 'contas',
      role: 'Representa contas internas e externas, reutilizadas por muitas transações.',
      key: 'PK id',
      relations: ['funcionario_id → funcionarios.id quando a conta é interna'],
    },
  ],
  decisions: [
    {
      title: 'Uma tabela por assunto',
      explanation: 'Separar cadastros de eventos reduz duplicação e aproxima o modelo da terceira forma normal: cada atributo descreve a chave da sua própria entidade.',
    },
    {
      title: 'Relacionamentos por chaves',
      explanation: 'Os IDs funcionam como referências estáveis. Se o cargo de alguém mudar, basta atualizar funcionarios; o histórico continua ligado à mesma pessoa.',
    },
    {
      title: 'Histórico sem sobrescrita',
      explanation: 'Transações, acessos e e-mails são relações um-para-muitos. Novos fatos viram novas linhas, em vez de novas colunas no cadastro.',
    },
  ],
  checkpoints: [
    {
      question: 'Por que não gravar nome e cargo do operador dentro de cada transação?',
      answer: 'Isso repetiria dados, permitiria versões conflitantes do mesmo funcionário e criaria anomalias de atualização. A FK operador_funcionario_id resolve a identidade sem duplicação.',
    },
    {
      question: 'Qual é a cardinalidade entre funcionarios e logs_acesso?',
      answer: 'Um-para-muitos: um funcionário pode gerar vários logs, enquanto cada log pertence a um único funcionário.',
    },
    {
      question: 'Por que JOIN será central nesta investigação?',
      answer: 'A normalização mantém cada evidência no lugar correto. JOIN recompõe o contexto quando precisamos cruzar identidade, dinheiro, horário e comunicação.',
    },
  ],
};

/** Narrativa de conclusão do caso */
export const CASE_CONCLUSION = {
  title: 'Investigação Concluída',
  story: `Você cruzou todas as evidências e chegou ao veredito final. A culpada é Camila Torres, 
Coordenadora de Tesouraria (ID=7). Ela operou transações de alto valor para a conta externa "Nexus Consultoria" 
após as 22h, nos mesmos dias em que acessou o sistema financeiro à noite. Os e-mails interceptados 
confirmam a intenção: "urgente", "não registrar como desvio", "transferência ponte". 
Bruno Alves e Daniela Rocha foram descartados: Bruno trabalha em operações (não tem acesso a transações financeiras), 
e o e-mail de Daniela sobre "fornecedor" era sobre café da empresa.`,
  nextSteps: 'O caso está encerrado. Você pode continuar no Sandbox para explorar o banco livremente.',
};

export const LEVELS = [
  {
    id: 1,
    title: 'A Lista de Suspeitos',
    concept: 'SELECT',
    briefing: `A comissão de ética pediu um relatório completo: quem são os funcionários da empresa e o que cada um faz? 
Sem essa lista, não temos como saber quem tinha acesso aos sistemas na época das transações suspeitas. 
Comece pelo princípio: liste todos os funcionários e seus cargos.`,
    objective: 'Retorne o nome e o cargo de todos os funcionários.',
    tables: ['funcionarios'],
    expectedColumns: ['nome', 'cargo'],
    referenceQuery: 'SELECT nome, cargo FROM funcionarios ORDER BY id;',
    requiredConcepts: ['select'],
    hints: [
      'Você precisa escolher colunas específicas. Quais colunas mostram quem é a pessoa e o que ela faz?',
      'A tabela se chama funcionarios. Use SELECT para escolher as colunas.',
      'SELECT nome, cargo FROM funcionarios;',
    ],
    courseRefs: ['sql-intro', 'dml-select-where'],
    evidence: `Evidência 1 — Lista de Suspeitos: Você obteve a lista completa de 10 funcionários. Entre eles estão analistas, coordenadores e gerentes — todos com acesso a algum sistema da empresa. A lista inclui nomes como Ana Souza, Bruno Oliveira, Bruno Alves, Daniela Rocha e outros. A partir de agora, qualquer um deles pode ser cruzado com outras evidências.`,
    explanation: 'SELECT define quais colunas serão retornadas. Aqui usamos SELECT nome, cargo para obter apenas o nome e o cargo de cada funcionário.',
  },
  {
    id: 2,
    title: 'Filtrando os Álibis',
    concept: 'WHERE',
    briefing: `A investigação precisa focar. As transações suspeitas envolveram valores financeiros — então o departamento Financeiro é o palpite principal. 
Isole apenas os funcionários desse departamento para análise posterior. Eles são os que tinham acesso direto ao dinheiro.`,
    objective: 'Retorne o nome e o cargo dos funcionários do departamento Financeiro (departamento_id = 1).',
    tables: ['funcionarios'],
    expectedColumns: ['nome', 'cargo'],
    referenceQuery: 'SELECT nome, cargo FROM funcionarios WHERE departamento_id = 1 ORDER BY id;',
    requiredConcepts: ['where'],
    hints: [
      'Use WHERE para filtrar linhas. Qual condição identifica o departamento Financeiro?',
      'O departamento Financeiro tem departamento_id = 1.',
      'SELECT nome, cargo FROM funcionarios WHERE departamento_id = 1;',
    ],
    courseRefs: ['dml-select-where'],
    evidence: `Evidência 2 — Álibis Filtrados: O departamento Financeiro tem 4 funcionários: Ana Souza, Diego Ferreira, Camila Torres e Daniela Rocha. Todos eles manipulam dinheiro no dia a dia. Qualquer um teria conhecimento técnico para mover fundos entre contas — mas as transações suspeitas só podem ter sido feitas por alguém deste grupo.`,
    explanation: 'WHERE filtra as linhas retornadas. Aqui, WHERE departamento_id = 1 seleciona apenas os funcionários do departamento Financeiro.',
  },
  {
    id: 3,
    title: 'Rastreando a Grana',
    concept: 'ORDER BY + LIMIT',
    briefing: `Os auditores detectaram movimentações incomuns de grandes valores. Precisamos identificar as 5 maiores transações registradas no sistema para entender para onde o dinheiro foi. 
Ordene por valor decrescente e pegue as 5 primeiras — elas contam uma história diferente das transações do dia a dia.`,
    objective: 'Retorne o id, valor_centavos e data_hora das 5 maiores transações, ordenadas pelo valor (do maior para o menor).',
    tables: ['transacoes'],
    expectedColumns: ['id', 'valor_centavos', 'data_hora'],
    referenceQuery: 'SELECT id, valor_centavos, data_hora FROM transacoes ORDER BY valor_centavos DESC LIMIT 5;',
    requiredConcepts: ['order by', 'limit'],
    hints: [
      'Ordenar do maior para o menor significa ORDER BY ... DESC. Como limitar a 5 resultados?',
      'Use ORDER BY valor_centavos DESC e depois LIMIT 5.',
      'SELECT id, valor_centavos, data_hora FROM transacoes ORDER BY valor_centavos DESC LIMIT 5;',
    ],
    courseRefs: ['having-where-orderby-like'],
    evidence: `Evidência 3 — As Maiores Transferências: As 5 maiores transações são todas acima de R$50.000. Curiosamente, as 4 maiores foram para a mesma conta externa de destino — e as datas coincidem com os dias 12, 15, 18 e 22 de março de 2024. Transações tão grandes e tão próximas no tempo são um padrão atípico que exige investigação mais profunda.`,
    explanation: 'ORDER BY ordena os resultados e LIMIT restringe a quantidade de linhas. ORDER BY valor_centavos DESC ordena do maior para o menor, e LIMIT 5 pega apenas os 5 primeiros.',
  },
  {
    id: 4,
    title: 'O Horário Suspeito',
    concept: 'Datas + WHERE',
    briefing: `Os registros de acesso mostram que alguém entrou no sistema fora do horário normal de trabalho. A segurança reportou que os acessos após as 22h são raros e sempre justificados por plantão. 
Precisamos descobrir quem esteve no sistema tarde da noite — especialmente nos dias em que as transações suspeitas ocorreram.`,
    objective: 'Retorne o funcionario_id e a data_hora dos logs de acesso que ocorreram após as 22h (hora >= 22).',
    tables: ['logs_acesso'],
    expectedColumns: ['funcionario_id', 'data_hora'],
    referenceQuery: "SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 22 ORDER BY id;",
    requiredConcepts: ['where'],
    hints: [
      'As datas estão no formato "YYYY-MM-DD HH:MM:SS". Como extrair apenas a hora?',
      "Use strftime('%H', data_hora) para extrair a hora e CAST(... AS INTEGER) para comparar numericamente.",
      "SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 22;",
    ],
    courseRefs: ['dml-select-where'],
    evidence: `Evidência 4 — Acesso Noturno: Alguns funcionários acessaram o sistema após as 22h. A maioria é justificada (plantão de TI ou operações), mas há um padrão suspeito: o(a) funcionário(a) de ID 7 acessou o sistema financeiro tarde da noite nos mesmos dias das transações suspeitas — 12, 15 e 18 de março. Outro funcionário (ID 4) também entrou à noite, mas trabalha em operações e não tem acesso a transações financeiras. Quem é o ID 7?`,
    explanation: 'strftime extrai parte de uma data/hora. Aqui usamos strftime(\'%H\', data_hora) para obter a hora e filtramos com WHERE para encontrar acessos após as 22h.',
  },
  {
    id: 5,
    title: 'Conectando os Pontos',
    concept: 'INNER JOIN',
    briefing: `As transações suspeitas têm um operador registrado. Precisamos cruzar as transações com os funcionários para descobrir quem executou cada operação. 
Use INNER JOIN para conectar a tabela de transações com a de funcionários e revelar o nome de quem operou cada transferência.`,
    objective: 'Retorne o nome do funcionário e o valor_centavos das transações, unindo transações e funcionários pelo operador.',
    tables: ['transacoes', 'funcionarios'],
    expectedColumns: ['nome', 'valor_centavos'],
    referenceQuery: 'SELECT f.nome, t.valor_centavos FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id ORDER BY t.id;',
    requiredConcepts: ['join'],
    hints: [
      'INNER JOIN conecta duas tabelas por uma coluna em comum. Qual coluna liga transacoes a funcionarios?',
      'A coluna operador_funcionario_id em transacoes corresponde ao id em funcionarios.',
      'SELECT f.nome, t.valor_centavos FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id;',
    ],
    courseRefs: ['joins-inner-left'],
    evidence: `Evidência 5 — Operadores Identificados: Ao cruzar as transações com os funcionários, vemos que a maioria das transações grandes foi operada pela mesma pessoa: Camila Torres. Ela aparece como operadora de todas as transações acima de R$50.000 para a conta externa 999. Outros funcionários operaram transações menores e para fornecedores normais.`,
    explanation: 'INNER JOIN combina linhas de duas tabelas quando há correspondência em uma coluna comum. Aqui, ligamos transacoes.operador_funcionario_id com funcionarios.id.',
  },
  {
    id: 6,
    title: 'O Contador Sombrio',
    concept: 'GROUP BY + COUNT',
    briefing: `Precisamos saber quantas transações cada funcionário executou. Isso nos ajuda a identificar quem movimentou dinheiro com frequência atípica. 
Use GROUP BY para agrupar por funcionário e COUNT para contar as transações de cada um.`,
    objective: 'Retorne o nome do funcionário e a quantidade de transações que ele executou. Considere apenas transações que têm operador (operador_funcionario_id IS NOT NULL).',
    tables: ['transacoes', 'funcionarios'],
    expectedColumns: ['nome', 'total_transacoes'],
    referenceQuery: 'SELECT f.nome, COUNT(*) AS total_transacoes FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome ORDER BY f.id;',
    requiredConcepts: ['group by', 'count'],
    hints: [
      'GROUP BY agrupa as linhas por uma coluna. COUNT(*) conta quantas linhas há em cada grupo.',
      'Agrupe pelo funcionário (f.id, f.nome) e use COUNT(*) AS total_transacoes.',
      'SELECT f.nome, COUNT(*) AS total_transacoes FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome;',
    ],
    courseRefs: ['aggregation-groupby', 'joins-inner-left'],
    evidence: `Evidência 6 — Frequência de Operações: Camila Torres executou 7 transações — mais do que qualquer outro funcionário. Ana Souza executou 2, Diego 2, e os outros 1 cada. O volume de Camila está acima da média, e suas transações de maior valor foram todas para a mesma conta externa.`,
    explanation: 'GROUP BY agrupa as linhas por uma ou mais colunas, e COUNT(*) conta as linhas em cada grupo. Aqui agrupamos por funcionário e contamos suas transações.',
  },
  {
    id: 7,
    title: 'Acima do Limite',
    concept: 'HAVING',
    briefing: `A comissão de ética definiu um critério: qualquer funcionário que tenha executado mais de 3 transações precisa ser investigado mais de perto. 
Use GROUP BY com HAVING para filtrar apenas os grupos que ultrapassam esse limite.`,
    objective: 'Retorne o nome do funcionário e a quantidade de transações, apenas para funcionários com mais de 3 transações (operador não nulo).',
    tables: ['transacoes', 'funcionarios'],
    expectedColumns: ['nome', 'total_transacoes'],
    referenceQuery: 'SELECT f.nome, COUNT(*) AS total_transacoes FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome HAVING COUNT(*) > 3 ORDER BY f.id;',
    requiredConcepts: ['group by', 'having'],
    hints: [
      'HAVING filtra grupos (como WHERE filtra linhas). Como filtrar grupos com mais de 3 transações?',
      'Use HAVING COUNT(*) > 3 depois do GROUP BY.',
      'SELECT f.nome, COUNT(*) AS total_transacoes FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome HAVING COUNT(*) > 3;',
    ],
    courseRefs: ['having-where-orderby-like', 'aggregation-groupby'],
    evidence: `Evidência 7 — Acima do Limite: Apenas uma pessoa executou mais de 3 transações: Camila Torres, com 7. Todos os outros funcionários ficaram abaixo do limite. Isso reforça que o padrão de atividade dela é atípico e merece investigação detalhada.`,
    explanation: 'HAVING filtra grupos após o GROUP BY, enquanto WHERE filtra linhas antes do agrupamento. Aqui usamos HAVING COUNT(*) > 3 para manter apenas funcionários com mais de 3 transações.',
  },
  {
    id: 8,
    title: 'Os Álibis Perfeitos',
    concept: 'LEFT JOIN + IS NULL',
    briefing: `Nem todos os funcionários executaram transações. Precisamos identificar quem nunca operou uma transação — eles estão fora da lista de suspeitos. 
Use LEFT JOIN para incluir todos os funcionários e IS NULL para filtrar aqueles sem nenhuma transação associada.`,
    objective: 'Retorne o nome dos funcionários que não executaram nenhuma transação (não aparecem como operador em transacoes).',
    tables: ['funcionarios', 'transacoes'],
    expectedColumns: ['nome'],
    referenceQuery: 'SELECT f.nome FROM funcionarios f LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id WHERE t.id IS NULL ORDER BY f.id;',
    requiredConcepts: ['left join', 'is null'],
    hints: [
      'LEFT JOIN inclui todos os funcionários, mesmo sem transação. Como identificar os que não têm nenhuma?',
      'Quando um funcionário não tem transação, as colunas de transacoes ficam NULL. Use WHERE t.id IS NULL.',
      'SELECT f.nome FROM funcionarios f LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id WHERE t.id IS NULL;',
    ],
    courseRefs: ['joins-inner-left'],
    evidence: `Evidência 8 — Álibis Verificados: Carla Mendes (RH) e Gustavo Barbosa (Comercial) nunca executaram transações. Eles estão descartados como suspeitos. Todos os outros funcionários do departamento Financeiro aparecem como operadores de pelo menos uma transação.`,
    explanation: 'LEFT JOIN inclui todas as linhas da tabela da esquerda, mesmo sem correspondência. IS NULL identifica as linhas sem correspondência — funcionários sem transações.',
  },
  {
    id: 9,
    title: 'E-mails Comprometedores',
    concept: 'JOIN + LIKE',
    briefing: `A equipe de TI interceptou e-mails entre funcionários que podem conter pistas. Procure mensagens com palavras-chave suspeitas como "urgente", "fornecedor", "ponte" ou "não registrar". 
Use JOIN para conectar e-mails com funcionários e LIKE para buscar palavras no conteúdo.`,
    objective: 'Retorne o nome do remetente e o assunto dos e-mails cujo conteúdo contenha a palavra "urgente" (case-insensitive).',
    tables: ['emails', 'funcionarios'],
    expectedColumns: ['nome', 'assunto'],
    referenceQuery: "SELECT f.nome, e.assunto FROM emails e INNER JOIN funcionarios f ON e.remetente_id = f.id WHERE LOWER(e.conteudo) LIKE '%urgente%' ORDER BY e.id;",
    requiredConcepts: ['join', 'like'],
    hints: [
      'LIKE busca padrões de texto. Como tornar a busca case-insensitive?',
      'Use LOWER(e.conteudo) LIKE \'%urgente%\' para buscar a palavra em qualquer posição.',
      "SELECT f.nome, e.assunto FROM emails e INNER JOIN funcionarios f ON e.remetente_id = f.id WHERE LOWER(e.conteudo) LIKE '%urgente%';",
    ],
    courseRefs: ['having-where-orderby-like', 'joins-inner-left'],
    evidence: `Evidência 9 — E-mail Comprometedor: Apenas um e-mail contém a palavra "urgente": o de ID 801, enviado por Camila Torres para Diego Ferreira. O conteúdo diz: "Preciso que o pagamento da Nexus seja processado amanhã. É urgente, não registrar como desvio." A palavra "desvio" sugere que ela sabia que algo estava errado.`,
    explanation: 'LIKE busca padrões de texto em strings. LOWER() torna a busca case-insensitive. % é um curinga que representa qualquer sequência de caracteres.',
  },
  {
    id: 10,
    title: 'Acima da Média',
    concept: 'Subquery',
    briefing: `A média das transações pode nos ajudar a identificar quais valores estão acima do normal. Use uma subquery para calcular a média e depois filtrar as transações que a excedem. 
Transações muito acima da média são fortes candidatos a investigação.`,
    objective: 'Retorne o id, valor_centavos e data_hora das transações cujo valor é maior que a média de todas as transações.',
    tables: ['transacoes'],
    expectedColumns: ['id', 'valor_centavos', 'data_hora'],
    referenceQuery: 'SELECT id, valor_centavos, data_hora FROM transacoes WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes) ORDER BY id;',
    requiredConcepts: ['select', 'avg', 'subquery'],
    hints: [
      'Uma subquery é uma query dentro de outra. Como calcular a média dentro do WHERE?',
      'Use (SELECT AVG(valor_centavos) FROM transacoes) como critério de comparação.',
      'SELECT id, valor_centavos, data_hora FROM transacoes WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes);',
    ],
    courseRefs: ['cte-subqueries', 'aggregation-groupby'],
    evidence: `Evidência 10 — Acima da Média: As transações acima da média incluem todas as 5 maiores (IDs 501-504, 313). As 4 maiores transações suspeitas (acima de R$50.000) estão muito acima da média geral, que é de aproximadamente R$1.9 milhão em centavos. Isso confirma que essas transações são outliers estatísticos.`,
    explanation: 'Uma subquery é uma query aninhada dentro de outra. Aqui usamos (SELECT AVG(valor_centavos) FROM transacoes) para calcular a média e filtrar as transações que a excedem.',
  },
  {
    id: 11,
    title: 'Classificando o Risco',
    concept: 'CASE WHEN',
    briefing: `Precisamos classificar as transações por nível de risco para priorizar a investigação. Transações acima de 5.000.000 centavos (R$50.000) são de "alto risco"; entre 1.000.000 e 5.000.000 são "médio risco"; e abaixo disso são "baixo risco". 
Use CASE WHEN para criar essa classificação.`,
    objective: 'Retorne o id, valor_centavos e uma coluna "nivel_risco" com "alto", "medio" ou "baixo" baseado no valor da transação.',
    tables: ['transacoes'],
    expectedColumns: ['id', 'valor_centavos', 'nivel_risco'],
    referenceQuery: "SELECT id, valor_centavos, CASE WHEN valor_centavos > 5000000 THEN 'alto' WHEN valor_centavos > 1000000 THEN 'medio' ELSE 'baixo' END AS nivel_risco FROM transacoes ORDER BY id;",
    requiredConcepts: ['case', 'when'],
    hints: [
      'CASE WHEN cria colunas condicionais. Como classificar em três níveis?',
      'Use CASE WHEN valor_centavos > 5000000 THEN \'alto\' WHEN valor_centavos > 1000000 THEN \'medio\' ELSE \'baixo\' END.',
      "SELECT id, valor_centavos, CASE WHEN valor_centavos > 5000000 THEN 'alto' WHEN valor_centavos > 1000000 THEN 'medio' ELSE 'baixo' END AS nivel_risco FROM transacoes;",
    ],
    courseRefs: ['case-when'],
    evidence: `Evidência 11 — Classificação de Risco: As transações de "alto risco" são exatamente as 5 maiores (IDs 501-504, 313). Todas as 4 transações para a conta 999 (Nexus) foram classificadas como alto risco. Isso confirma que o critério de valor é um bom indicador de risco e que as transações suspeitas se destacam claramente das operações normais.`,
    explanation: 'CASE WHEN cria valores condicionais. Cada WHEN testa uma condição e retorna um valor. ELSE é o padrão. Aqui classificamos as transações em três níveis de risco baseado no valor.',
  },
  {
    id: 12,
    title: 'O Veredito Final',
    concept: 'JOIN múltiplo + agregação',
    briefing: `Chegou a hora de cruzar todas as evidências. Reúna transações, acessos noturnos e e-mails suspeitos em uma única query para identificar a culpada. 
O resultado deve mostrar o nome do funcionário, o total de transações de alto risco que executou, quantas vezes acessou o sistema após as 22h e quantos e-mails suspeitos enviou. 
A culpada é aquela que combina todas as evidências.`,
    objective: 'Retorne o nome, total_transacoes_alto_risco, total_acessos_noturnos e total_emails_suspeitos. Apenas funcionários que têm pelo menos 1 transação de alto risco (valor > 5000000), pelo menos 1 acesso após as 22h e pelo menos 1 e-mail com palavra "urgente" ou "ponte".',
    tables: ['funcionarios', 'transacoes', 'logs_acesso', 'emails'],
    expectedColumns: ['nome', 'total_transacoes_alto_risco', 'total_acessos_noturnos', 'total_emails_suspeitos'],
    referenceQuery: `SELECT f.nome,
  SUM(CASE WHEN t.valor_centavos > 5000000 THEN 1 ELSE 0 END) AS total_transacoes_alto_risco,
  (SELECT COUNT(*) FROM logs_acesso l WHERE l.funcionario_id = f.id AND CAST(strftime('%H', l.data_hora) AS INTEGER) >= 22) AS total_acessos_noturnos,
  (SELECT COUNT(*) FROM emails e WHERE e.remetente_id = f.id AND (LOWER(e.conteudo) LIKE '%urgente%' OR LOWER(e.conteudo) LIKE '%ponte%')) AS total_emails_suspeitos
FROM funcionarios f
INNER JOIN transacoes t ON t.operador_funcionario_id = f.id
WHERE t.valor_centavos > 5000000
GROUP BY f.id, f.nome
HAVING (SELECT COUNT(*) FROM logs_acesso l WHERE l.funcionario_id = f.id AND CAST(strftime('%H', l.data_hora) AS INTEGER) >= 22) >= 1
  AND (SELECT COUNT(*) FROM emails e WHERE e.remetente_id = f.id AND (LOWER(e.conteudo) LIKE '%urgente%' OR LOWER(e.conteudo) LIKE '%ponte%')) >= 1
ORDER BY f.id;`,
    requiredConcepts: ['join', 'group by'],
    hints: [
      'Combine as três fontes: transações de alto risco (JOIN), acessos noturnos (subquery em logs_acesso) e e-mails suspeitos (subquery em emails).',
      'Use subqueries correlacionadas para contar acessos noturnos e e-mails suspeitos de cada funcionário. HAVING garante que todos os critérios são atendidos.',
      'A query completa cruza funcionários com transações de alto risco, e usa subqueries correlacionadas para verificar acessos noturnos e e-mails. A única funcionária que atende a todos os critérios é a culpada.',
    ],
    courseRefs: ['joins-inner-left', 'aggregation-groupby', 'cte-subqueries', 'case-when'],
    evidence: `Evidência Final — O Veredito: A única funcionária que combina transações de alto risco, acessos noturnos após as 22h e e-mails com palavras suspeitas é Camila Torres (ID=7). Ela executou 5 transações acima de R$50.000 (todas para a conta Nexus), acessou o sistema 5 vezes tarde da noite nos dias das transações, e enviou 2 e-mails com as palavras "urgente" e "ponte". O caso está resolvido.`,
    explanation: 'Esta query combina JOIN, subqueries correlacionadas, GROUP BY, HAVING e CASE WHEN em uma única consulta. Cada subquery conta uma dimensão de evidência para cada funcionário. O HAVING garante que apenas quem satisfaz todos os critérios aparece no resultado.',
  },
];

/**
 * Retorna o nível pelo ID.
 * @param {number} id
 * @returns {object|undefined}
 */
export function getLevel(id) {
  return LEVELS.find(l => l.id === id);
}

/**
 * Retorna o total de níveis disponíveis.
 * @returns {number}
 */
export function getTotalLevels() {
  return LEVELS.length;
}

/**
 * Configuração de gameplay investigativo do Caso #001.
 * Exportada como GAMEPLAY — case-manager.js propaga via spread (...case001Levels).
 * Casos sem GAMEPLAY ficam com undefined, preservando o comportamento legado.
 */
export const GAMEPLAY = {
  graph: {
    nodes: [
      { id: 'suspeito-07', type: 'suspect', label: 'Pessoa de interesse #7', revealedLabel: 'Camila Torres', revealAtMission: 5 },
      { id: 'suspeito-04', type: 'suspect', label: 'Pessoa de interesse #4', revealedLabel: 'Bruno Alves', revealAtMission: 99 },
      { id: 'email-801', type: 'email', label: 'E-mail urgente', detail: '"Não registrar como desvio"', unlockEvidence: 'Evidência 9' },
      { id: 'email-802', type: 'email', label: 'E-mail ponte', detail: '"transferência ponte"', unlockEvidence: 'Evidência 9' },
      { id: 'conta-999', type: 'external_account', label: 'Conta Nexus', detail: 'Conta externa 999', unlockEvidence: 'Evidência 3' },
      { id: 'log-701', type: 'access_log', label: 'Acesso 12/03 22:30', detail: 'Financeiro após 22h', unlockEvidence: 'Evidência 4' },
      { id: 'log-702', type: 'access_log', label: 'Acesso 15/03 22:10', detail: 'Tesouraria após 22h', unlockEvidence: 'Evidência 4' },
      { id: 'log-703', type: 'access_log', label: 'Acesso 18/03 23:00', detail: 'Financeiro após 22h', unlockEvidence: 'Evidência 4' },
    ],
    edges: [
      { source: 'suspeito-07', target: 'email-801' },
      { source: 'suspeito-07', target: 'email-802' },
      { source: 'suspeito-07', target: 'conta-999' },
      { source: 'suspeito-07', target: 'log-701' },
      { source: 'suspeito-07', target: 'log-702' },
      { source: 'suspeito-07', target: 'log-703' },
      { source: 'suspeito-04', target: 'log-701' },
    ],
  },
  timeline: {
    bonusPoints: 200,
    events: [
      { id: 'email-801', unlockedByMission: 9, sortKey: '2024-03-11T21:00:00', type: 'e-mail', label: 'Pedido urgente enviado' },
      { id: 'access-701', unlockedByMission: 4, sortKey: '2024-03-12T22:30:00', type: 'acesso', label: 'Acesso noturno ao Financeiro' },
      { id: 'transfer-501', unlockedByMission: 3, sortKey: '2024-03-12T23:15:00', type: 'transação', label: 'Transferência de alto valor' },
      { id: 'email-802', unlockedByMission: 9, sortKey: '2024-03-14T20:30:00', type: 'e-mail', label: 'Mensagem sobre transferência ponte' },
      { id: 'access-702', unlockedByMission: 4, sortKey: '2024-03-15T22:10:00', type: 'acesso', label: 'Acesso noturno à Tesouraria' },
      { id: 'transfer-502', unlockedByMission: 3, sortKey: '2024-03-15T22:45:00', type: 'transação', label: 'Transferência de alto valor' },
      { id: 'access-703', unlockedByMission: 4, sortKey: '2024-03-18T23:00:00', type: 'acesso', label: 'Acesso noturno ao Financeiro' },
      { id: 'transfer-503', unlockedByMission: 3, sortKey: '2024-03-18T23:30:00', type: 'transação', label: 'Transferência de alto valor' },
      { id: 'transfer-504', unlockedByMission: 3, sortKey: '2024-03-22T01:10:00', type: 'transação', label: 'Transferência de alto valor' },
    ],
  },
  suspects: {
    profiles: [
      { id: 'pessoa-07', initialLabel: 'Pessoa de interesse #7', revealedLabel: 'Camila Torres', revealAtMission: 5 },
      { id: 'pessoa-04', initialLabel: 'Pessoa de interesse #4', revealedLabel: 'Bruno Alves', revealAtMission: 99 },
    ],
    deltasByMission: {
      2: [{ suspectId: 'pessoa-07', delta: 10 }],
      4: [{ suspectId: 'pessoa-07', delta: 25 }, { suspectId: 'pessoa-04', delta: 15 }],
      5: [{ suspectId: 'pessoa-07', delta: 15 }],
      6: [{ suspectId: 'pessoa-07', delta: 10 }],
      7: [{ suspectId: 'pessoa-07', delta: 10 }],
      9: [{ suspectId: 'pessoa-07', delta: 10 }],
      10: [{ suspectId: 'pessoa-07', delta: 10 }],
      11: [{ suspectId: 'pessoa-07', delta: 5 }],
      12: [{ suspectId: 'pessoa-07', delta: 5 }],
    },
  },
  finalChallenge: {
    type: 'interrogation',
    suspectName: 'Camila Torres',
    requiredMission: 12,
    steps: [
      { statement: 'Não houve transferência irregular.', evidenceId: 'transfer-501', successMessage: 'A transferência de 12/03 prova o contrário.' },
      { statement: 'Nunca acessei o sistema fora do horário.', evidenceId: 'access-701', successMessage: 'O log de acesso noturno confirma a presença.' },
      { statement: 'Nunca pedi que o pagamento fosse escondido.', evidenceId: 'email-801', successMessage: 'O e-mail pedindo urgência foi recuperado. Confissão obtida.' },
    ],
  },
};
