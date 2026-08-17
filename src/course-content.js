/**
 * course-content.js — Conteúdo didático estruturado do curso de SQL.
 *
 * Fase 10: Integração das transcrições em aulas/ ao jogo.
 * Cada item contém um resumo útil para o jogador, sem copiar as transcrições completas.
 * As referências (sourceLessons) apontam para os arquivos originais em aulas/.
 */

/**
 * @typedef {Object} LessonAnnotation
 * @property {number} line - linha do código (1-based) que a anotação explica
 * @property {string} text - o que aquela linha faz e por quê
 *
 * @typedef {Object} Lesson
 * @property {string} eyebrow - rótulo curto: 'AGREGAÇÃO', 'JUNÇÕES'
 * @property {string} headline - a ideia da aula em uma frase
 * @property {number} readingMinutes - 2 a 6
 * @property {string} why - por que importa (2-3 linhas)
 * @property {string[]} howItWorks - 2 a 3 parágrafos curtos
 * @property {{label: string, text: string}} mentalModel - analogia em destaque
 * @property {{intro: string, code: string, annotations: LessonAnnotation[], result: string}} walkthrough
 * @property {{engine: string, wrongCode: string, errorMessage: string, diagnosis: string, fix: string, rule: string}} classicError
 * @property {{question: string, answer: string}} checkpoint
 * @property {string} bridge - ponte com a missão
 * @property {string} [sqliteNote] - nota sobre compatibilidade com SQLite
 * @property {string} [sourceNote] - atribuição quando o conteúdo é uma síntese, não uma transcrição direta
 *
 * @typedef {Object} CourseItem
 * @property {string} id - identificador único
 * @property {string[]} sourceLessons - arquivos de origem em aulas/
 * @property {string} concept - conceito SQL ensinado
 * @property {string} learningObjective - objetivo de aprendizagem
 * @property {string} explanation - explicação curta e útil
 * @property {string} syntaxExample - exemplo de sintaxe essencial
 * @property {string} commonMistake - erro comum mencionado na aula
 * @property {'supported'|'partial'|'unsupported'} sqliteCompatibility
 * @property {number[]} relatedLevels - missões relacionadas
 * @property {'mission'|'lab'|'conceptual'} implementationType
 * @property {string} [note] - nota explicativa opcional
 * @property {Lesson} [lesson] - conteúdo didático estruturado da aula
 */

export const COURSE_CONTENT = [
  {
    id: 'sql-intro',
    sourceLessons: ['aulas/Aula 2 - Linguagem SQL - Mais Jovem do Que Nunca.md'],
    concept: 'Introdução à Linguagem SQL',
    learningObjective: 'Compreender a relevância do SQL como linguagem essencial para dados',
    explanation: 'SQL foi criada em 1974 e continua sendo a linguagem padrão para acessar bancos de dados. Em engenharia de dados, é impossível fugir do SQL — pipelines, cargas e consultas dependem dela.',
    syntaxExample: '-- SQL é a base de tudo no jogo\nSELECT * FROM funcionarios;',
    commonMistake: 'Achar que SQL é obsoleto ou que pode ser substituído por ferramentas visuais.',
    sqliteCompatibility: 'supported',
    relatedLevels: [1],
    implementationType: 'conceptual',
    lesson: {
      eyebrow: 'INTRODUÇÃO AO SQL',
      headline: 'A linguagem padrão para interrogar e auditar qualquer banco de dados',
      readingMinutes: 3,
      why: 'Na investigação forense digital e na engenharia de dados, todas as evidências passam por consultas. O SQL é a ferramenta universal para interrogar tabelas sem depender de interfaces intermediárias.',
      howItWorks: [
        'SQL (Structured Query Language) foi criada na década de 1970 e permanece insubstituível. Em vez de dizer COMO buscar os dados passo a passo (imperativo), você diz O QUE você quer (declarativo).',
        'O banco de dados recebe sua instrução, analisa o catálogo, monta um plano de execução otimizado e devolve exatamente o conjunto de linhas e colunas solicitado.',
      ],
      mentalModel: {
        label: 'O INTERROGATÓRIO DECLARATIVO',
        text: 'Pense no motor SQL como um arquivista perito: você não precisa vasculhar as gavetas do disco; você declara "traga nome e cargo de quem trabalha no departamento 1", e o motor busca os registros no menor tempo possível.',
      },
      walkthrough: {
        intro: 'Consulta básica para inspecionar colunas específicas de uma tabela:',
        code: `SELECT id, nome, cargo\nFROM funcionarios\nORDER BY id;`,
        annotations: [
          { line: 1, text: 'SELECT especifica quais colunas extrair. Evite SELECT * em consultas analíticas de grande porte.' },
          { line: 2, text: 'FROM indica a tabela de origem onde os registros estão armazenados.' },
          { line: 3, text: 'ORDER BY torna a ordem do resultado explícita e reproduzível.' },
        ],
        result: 'Retorna todas as linhas cadastradas na tabela funcionarios com as três colunas especificadas.',
      },
      classicError: {
        engine: 'PostgreSQL',
        wrongCode: 'SELECT nome, cargo\nFROM funcionarioss;',
        errorMessage: 'ERROR: relation "funcionarioss" does not exist',
        diagnosis: 'Erro de digitação no nome da tabela. O SGBD não encontrou nenhuma relação com esse identificador no catálogo.',
        fix: 'Corrigir o nome da tabela para "funcionarios". Sempre confira o esquema do banco antes de executar.',
        rule: 'Tabelas e colunas devem coincidir exatamente com os nomes definidos no esquema do banco.',
      },
      checkpoint: {
        question: 'Qual é a principal diferença entre SQL e linguagens tradicionais de programação (Python, C)?',
        answer: 'SQL é declarativa: você especifica o resultado desejado (o quê), e o motor de banco de dados decide a melhor estratégia de acesso aos dados (como).',
      },
      bridge: 'Nesta missão inicial você deve inspecionar os cadastros da base para começar a mapear a estrutura da organização e identificar as pessoas envolvidas.',
      sqliteNote: 'A sintaxe básica de SELECT e FROM é 100% idêntica em PostgreSQL, SQLite, MySQL e BigQuery.',
    },
  },
  {
    id: 'ddl-create-table',
    sourceLessons: [
      'aulas/Aula 4 - Instruções DDL - CREATE, ALTER, DROP - Parte 1-2.md',
      'aulas/Aula 5 - Instruções DDL - CREATE, ALTER, DROP - Parte 2-2.md',
    ],
    concept: 'DDL — CREATE TABLE, ALTER TABLE, DROP',
    learningObjective: 'Criar, modificar e remover tabelas definindo colunas, tipos e chaves',
    explanation: 'DDL (Data Definition Language) cria e modifica a estrutura do banco. CREATE TABLE define colunas e tipos. ALTER TABLE adiciona/remove colunas. DROP TABLE deleta a tabela inteira.',
    syntaxExample: 'CREATE TABLE funcionarios (\n  id INTEGER PRIMARY KEY,\n  nome TEXT NOT NULL,\n  salario REAL\n);\nALTER TABLE funcionarios ADD COLUMN data_contratacao TEXT;',
    commonMistake: 'Esquecer de definir PRIMARY KEY; tentar criar objeto que já existe; usar DROP sem backup.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'lab',
  },
  {
    id: 'dml-insert',
    sourceLessons: ['aulas/Aula 6 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 1-2.md'],
    concept: 'DML — INSERT INTO',
    learningObjective: 'Inserir registros respeitando tipos e correspondência de colunas',
    explanation: 'INSERT INTO adiciona linhas a uma tabela. O número de valores deve corresponder ao número de colunas. Texto e data usam aspas simples; números não.',
    syntaxExample: "INSERT INTO funcionarios (id, nome, cargo) VALUES (1, 'Ana Souza', 'Analista Financeiro');",
    commonMistake: 'Número de valores diferente de colunas; esquecer aspas em texto; formato de data incorreto.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'lab',
  },
  {
    id: 'dml-select-where',
    sourceLessons: ['aulas/Aula 7 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 2-2.md'],
    concept: 'DML — SELECT, UPDATE, DELETE com WHERE',
    learningObjective: 'Consultar, atualizar e deletar registros com filtro',
    explanation: 'SELECT retorna dados; UPDATE modifica; DELETE remove. WHERE filtra quais linhas são afetadas. Sem WHERE, UPDATE e DELETE afetam TODOS os registros.',
    syntaxExample: "SELECT nome, cargo FROM funcionarios WHERE departamento_id = 1;\nUPDATE funcionarios SET salario_centavos = 500000 WHERE nome = 'Ana';\nDELETE FROM funcionarios WHERE id = 99;",
    commonMistake: 'Esquecer WHERE em UPDATE/DELETE — afeta todos os registros; tentar inserir ID duplicado.',
    sqliteCompatibility: 'supported',
    relatedLevels: [1, 2, 4],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'CONSULTAS E FILTROS',
      headline: 'Filtre na origem — examine apenas o que interessa',
      readingMinutes: 4,
      why: 'Bancos reais contêm milhões de linhas. Trazer tudo para analisar no olho humano é inviável e lento. O filtro WHERE permite isolar com precisão cirúrgica apenas os registros suspeitos.',
      howItWorks: [
        'SELECT extrai dados de tabelas existentes. A cláusula WHERE avalia cada registro contra uma condição lógica: apenas as linhas cuja condição for VERDADEIRA são incluídas no retorno.',
        'Valores de texto e datas devem sempre ser delimitados por aspas simples (\'texto\'). Números são escritos diretamente sem aspas.',
        'AND (ambas verdadeiras) e OR (pelo menos uma) combinam critérios. Para datas gravadas como texto no SQLite, funções como strftime(\'%H\', data_hora) extraem a hora antes de o WHERE fazer a comparação.',
      ],
      mentalModel: {
        label: 'A PENEIRA FORENSE',
        text: 'O WHERE funciona como uma peneira de malha fina: a tabela inteira é despejada sobre ela, mas somente os registros que satisfazem a condição passam para o relatório final.',
      },
      walkthrough: {
        intro: 'Filtrando funcionários de um departamento específico com critério numérico:',
        code: `SELECT nome, cargo, salario_centavos\nFROM funcionarios\nWHERE departamento_id = 1\n  AND salario_centavos > 500000;`,
        annotations: [
          { line: 1, text: 'Projetamos apenas as colunas relevantes para a análise.' },
          { line: 2, text: 'Definimos a tabela de origem dos dados.' },
          { line: 3, text: 'Primeira condição: departamento_id precisa ser igual a 1.' },
          { line: 4, text: 'Segunda condição combinada com AND: salário superior a R$ 5.000, armazenado como 500000 centavos.' },
        ],
        result: 'Apenas funcionários lotados no departamento 1 que ganham mais de R$ 5.000.',
      },
      classicError: {
        engine: 'PostgreSQL',
        wrongCode: 'SELECT nome, cargo\nFROM funcionarios\nWHERE cargo = "Analista";',
        errorMessage: 'ERROR: column "Analista" does not exist',
        diagnosis: 'Uso de aspas duplas em texto literal. No padrão SQL, aspas duplas identificam nomes de colunas ou tabelas, enquanto aspas simples delimitam strings literais.',
        fix: 'Usar aspas simples: WHERE cargo = \'Analista\'.',
        rule: 'Texto e datas em SQL usam aspas simples (\'\'); aspas duplas ("") são reservadas para identificadores.',
      },
      checkpoint: {
        question: 'Se uma tabela tem 100 registros e você executa SELECT * FROM t WHERE 1 = 2;, quantas linhas retornam?',
        answer: 'Zero linhas. A condição 1 = 2 é falsa para todos os registros, logo nenhuma linha passa pelo filtro do WHERE.',
      },
      bridge: 'Nesta missão você precisará isolar registros com atributos específicos para verificar quem teve acesso aos sistemas no intervalo sob auditoria.',
      sqliteNote: 'SQLite aceita aspas duplas para strings em alguns contextos permissivos, mas seguir a norma ANSI de aspas simples garante compatibilidade com qualquer SGBD.',
    },
  },
  {
    id: 'aggregation-groupby',
    sourceLessons: [
      'aulas/Aula 8 - Funções de Agregação e Agrupamento - Parte 1-2.md',
      'aulas/Aula 24 - Lab 1 - Criação de Relatórios do DW com Linguagem SQL.md',
    ],
    concept: 'Funções de Agregação e GROUP BY',
    learningObjective: 'Usar MIN, MAX, AVG, SUM, COUNT e GROUP BY para segmentar resultados',
    explanation: 'Funções de agregação resumem múltiplas linhas em um valor. GROUP BY divide as linhas em grupos e a agregação é calculada por grupo. Toda coluna não agregada no SELECT deve aparecer no GROUP BY.',
    syntaxExample: "SELECT departamento_id, COUNT(*) AS total, ROUND(AVG(salario_centavos), 2) AS media_centavos\nFROM funcionarios GROUP BY departamento_id;",
    commonMistake: 'Colocar coluna não agregada no SELECT sem incluí-la no GROUP BY; não usar ROUND com AVG.',
    sqliteCompatibility: 'supported',
    relatedLevels: [6, 10, 12],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'AGREGAÇÃO',
      headline: 'Uma linha por grupo — não uma linha por registro',
      readingMinutes: 4,
      why: 'Investigar volume é diferente de investigar transações. Enquanto você olha linha a linha, um padrão de frequência atípica fica invisível: são 40 transações espalhadas. Agregado por operador, o padrão aparece em 6 linhas.',
      howItWorks: [
        'São cinco funções de agregação: MIN, MAX, AVG, SUM e COUNT. Cada uma pega várias linhas e devolve um valor só. Aplicada sozinha, a função olha para a tabela inteira e devolve o número geral.',
        'GROUP BY quebra a tabela em grupos antes da conta. A agregação então roda uma vez por grupo, e o resultado tem uma linha por grupo — não uma por registro.',
        'AVG é a única das cinco que envolve divisão, e por isso devolve muitas casas decimais. Por convenção, sempre embrulhe AVG em ROUND: ROUND(AVG(salario_centavos), 2). As outras quatro não dividem e não precisam.',
      ],
      mentalModel: {
        label: 'O PEDIDO AO MOTOR DE EXECUÇÃO',
        text: 'Leia a query como um pedido: "vá até funcionarios, separe os funcionários por departamento; para cada departamento, pegue os salários, some e divida pelo número de funcionários daquele departamento; me devolva uma linha por departamento". O GROUP BY é a parte do "separe por".',
      },
      walkthrough: {
        intro: 'Média salarial por departamento, arredondada, com a contagem de pessoas em cada um:',
        code: `SELECT departamento_id,\n       COUNT(*) AS total,\n       ROUND(AVG(salario_centavos), 2) AS media_centavos\nFROM funcionarios\nGROUP BY departamento_id;`,
        annotations: [
          { line: 1, text: 'departamento_id não está dentro de nenhuma função de agregação — guarde essa observação, ela reaparece na linha 5.' },
          { line: 2, text: 'COUNT(*) conta as linhas de cada grupo, não da tabela inteira.' },
          { line: 3, text: 'ROUND envolve AVG porque a média é uma divisão. salario_centavos é o nome real da coluna no banco do jogo.' },
          { line: 5, text: 'O grupo é o departamento_id. É esta cláusula que transforma "média geral" em "média por departamento".' },
        ],
        result: 'Sai uma linha por departamento distinto. Se há 4 departamentos e 40 funcionários, o resultado tem 4 linhas — nunca 40.',
      },
      classicError: {
        engine: 'PostgreSQL',
        wrongCode: 'SELECT departamento_id, ROUND(AVG(salario_centavos), 2)\nFROM funcionarios;',
        errorMessage: 'ERROR: column "funcionarios.departamento_id" must appear in the GROUP BY clause or be used in an aggregate function',
        diagnosis: 'A query pede duas coisas incompatíveis: "me dê UM número (a média geral)" e "me dê o departamento de cada linha". O motor não sabe qual departamento imprimir ao lado de um valor que resume a tabela inteira.',
        fix: 'Acrescentar GROUP BY departamento_id. Aí cada linha do resultado passa a ter um departamento próprio e uma média própria.',
        rule: 'Toda e qualquer coluna que não estiver dentro de uma função de agregação tem de ir para o GROUP BY.',
      },
      checkpoint: {
        question: 'Uma tabela tem 500 transações feitas por 6 operadores. Quantas linhas retorna SELECT operador_id, COUNT(*) FROM transacoes GROUP BY operador_id?',
        answer: 'Seis — uma por operador distinto. GROUP BY colapsa as 500 linhas em um resultado por grupo. Se você esperava 500, ainda está pensando em SELECT comum: agregação com GROUP BY sempre reduz o número de linhas.',
      },
      bridge: 'Nesta missão você vai contar quantas transações cada funcionário executou. É exatamente o padrão acima — GROUP BY no funcionário, COUNT(*) nas transações — só que a coluna de agrupamento vem de outra tabela, e por isso entra também o JOIN da aula ao lado.',
      sqliteNote: 'A aula usa PostgreSQL; a regra do GROUP BY vale igual em SQLite. A diferença: o SQLite é permissivo e aceita coluna fora do GROUP BY sem erro, devolvendo um valor arbitrário da linha. Não confie nisso — escreva como o Postgres exigiria.',
    },
  },
  {
    id: 'having-where-orderby-like',
    sourceLessons: [
      'aulas/Aula 9 - Funções de Agregação e Agrupamento - Parte 2-2.md',
      'aulas/Aula 24 - Lab 1 - Criação de Relatórios do DW com Linguagem SQL.md',
    ],
    concept: 'HAVING vs WHERE, ORDER BY, LIKE',
    learningObjective: 'Diferenciar WHERE (filtro de linhas) de HAVING (filtro de grupos) e usar ORDER BY e LIKE',
    explanation: 'WHERE filtra linhas ANTES do agrupamento. HAVING filtra grupos DEPOIS do GROUP BY. ORDER BY ordena o resultado. LIKE busca padrões de texto com % (curinga).',
    syntaxExample: "SELECT departamento_id, COUNT(*) AS total\nFROM funcionarios\nWHERE nome LIKE 'A%'\nGROUP BY departamento_id\nHAVING COUNT(*) > 2\nORDER BY total DESC;",
    commonMistake: 'Tentar usar agregação no WHERE (gera erro); confundir WHEN usar WHERE vs HAVING; reordenar cláusulas.',
    sqliteCompatibility: 'supported',
    relatedLevels: [3, 7, 9],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'FILTRO DE GRUPOS & ORDENAÇÃO',
      headline: 'WHERE filtra linhas antes; HAVING filtra grupos depois',
      readingMinutes: 4,
      why: 'Detectar comportamentos atípicos exige filtrar grupos agregados (por exemplo, operadores com mais de 20 transações ou somatório fora do normal). Tentar fazer isso com WHERE quebra a consulta.',
      howItWorks: [
        'O motor SQL executa em ordem rígida: primeiro FROM e WHERE (descartam linhas individuais), depois GROUP BY (agrupa), depois HAVING (descarta grupos inteiros) e por fim ORDER BY.',
        'Funções de agregação como COUNT, SUM e AVG só existem APÓS o agrupamento. Por isso, nunca podem aparecer no WHERE, mas são perfeitamente válidas no HAVING.',
        'LIKE busca padrões com % (qualquer sequência) e _ (um caractere). ORDER BY coluna DESC ordena do maior para o menor; LIMIT 5, escrito por último, mantém apenas os cinco primeiros resultados.',
      ],
      mentalModel: {
        label: 'A ORDEM DO MOTOR DE EXECUÇÃO',
        text: 'Imagine triar correspondências: o WHERE elimina cartas rasgadas antes de separá-las por destinatário. O GROUP BY empilha por destinatário. O HAVING elimina pilhas com menos de 5 cartas. Não dá para eliminar pilhas antes de empilhar!',
      },
      walkthrough: {
        intro: 'Agrupando por departamento, filtrando grupos volumosos e ordenando pelo total:',
        code: `SELECT departamento_id,\n       COUNT(*) AS total_func,\n       ROUND(AVG(salario_centavos), 2) AS media_salario_centavos\nFROM funcionarios\nWHERE cargo LIKE '%Analista%'\nGROUP BY departamento_id\nHAVING COUNT(*) >= 2\nORDER BY total_func DESC;`,
        annotations: [
          { line: 4, text: 'WHERE filtra linhas individuais ANTES do agrupamento (apenas cargos com a palavra Analista).' },
          { line: 5, text: 'GROUP BY monta os lotes por departamento_id.' },
          { line: 6, text: 'HAVING filtra os grupos DEPOIS de agregados (apenas departamentos com 2+ analistas).' },
          { line: 7, text: 'ORDER BY ordena os grupos remanescentes em ordem decrescente (DESC).' },
        ],
        result: 'Departamentos com 2 ou mais analistas, ordenados do maior contingente para o menor.',
      },
      classicError: {
        engine: 'PostgreSQL',
        wrongCode: 'SELECT departamento_id, COUNT(*)\nFROM funcionarios\nWHERE COUNT(*) > 2\nGROUP BY departamento_id;',
        errorMessage: 'ERROR: aggregate functions are not allowed in WHERE',
        diagnosis: 'Tentativa de usar a função de agregação COUNT(*) dentro da cláusula WHERE. No momento em que o WHERE é avaliado, a agregação ainda não foi computada.',
        fix: 'Mover a condição agregada para a cláusula HAVING: GROUP BY departamento_id HAVING COUNT(*) > 2.',
        rule: 'WHERE filtra linhas antes do agrupamento; HAVING filtra grupos agregados depois do GROUP BY.',
      },
      checkpoint: {
        question: 'Se você precisa filtrar apenas transações ocorridas em 2024 e depois mostrar apenas operadores que somaram mais de R$ 100.000, onde vai cada filtro?',
        answer: 'O filtro de ano (data) vai no WHERE (linha a linha, antes de somar). O filtro de soma (> 100.000) vai no HAVING (após o GROUP BY do operador).',
      },
      bridge: 'Use este padrão para segmentar o volume de operações e destacar quem ultrapassou limites operacionais estipulados.',
      sqliteNote: 'Tanto PostgreSQL quanto SQLite seguem estritamente a separação entre WHERE e HAVING.',
    },
  },
  {
    id: 'joins-inner-left',
    sourceLessons: [
      'aulas/Aula 10 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 1-5.md',
      'aulas/Aula 11 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 2-5.md',
      'aulas/Aula 24 - Lab 1 - Criação de Relatórios do DW com Linguagem SQL.md',
    ],
    concept: 'INNER JOIN e LEFT JOIN',
    learningObjective: 'Escolher o tipo de junção conforme a necessidade de correspondência',
    explanation: 'INNER JOIN retorna apenas linhas com correspondência em ambas as tabelas. LEFT JOIN retorna TODAS as linhas da tabela da esquerda, mesmo sem correspondência (NULL nos campos da direita). COALESCE substitui NULL por um valor padrão.',
    syntaxExample: "-- INNER JOIN: apenas quem tem correspondência\nSELECT f.nome, t.valor FROM transacoes t\n  INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id;\n\n-- LEFT JOIN: todos os funcionários, mesmo sem transação\nSELECT f.nome FROM funcionarios f\n  LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id\n  WHERE t.id IS NULL;",
    commonMistake: 'Esquecer a cláusula ON; decorar sintaxe sem entender o resultado; não tratar NULL no LEFT JOIN.',
    sqliteCompatibility: 'supported',
    relatedLevels: [5, 8, 12],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'JUNÇÕES DE TABELAS',
      headline: 'Conectando entidades — cruze registros sem perder dados essenciais',
      readingMinutes: 4,
      why: 'Em bancos relacionais, dados são distribuídos em tabelas para evitar redundância. Descobrir a autoria de uma fraude exige cruzar o log de transações com o cadastro de funcionários.',
      howItWorks: [
        'INNER JOIN compara duas tabelas e retorna apenas as linhas que possuem correspondência em ambos os lados na condição ON. Se um funcionário não fez transações, ele não aparece.',
        'LEFT JOIN (ou LEFT OUTER JOIN) preserva TODAS as linhas da tabela da esquerda. Se não houver par na direita, as colunas da direita são preenchidas com NULL.',
        'Sempre qualifique colunas ambíguas com o alias da tabela (ex.: f.id vs t.id) para evitar erros de identificação.',
      ],
      mentalModel: {
        label: 'O CASAMENTO POR CHAVE ESTRANGEIRA',
        text: 'O JOIN busca onde a chave estrangeira de uma tabela aperta a mão da chave primária da outra. INNER JOIN só deixa passar casais completos. LEFT JOIN traz todos os convidados da esquerda, mesmo os solteiros.',
      },
      walkthrough: {
        intro: 'Cruzando funcionários com suas contas vinculadas usando LEFT JOIN para auditar quem tem e quem não tem conta:',
        code: `SELECT f.id AS func_id,\n       f.nome,\n       c.numero_conta,\n       COALESCE(c.tipo, 'Sem Conta') AS status_conta\nFROM funcionarios f\nLEFT JOIN contas c ON c.funcionario_id = f.id;`,
        annotations: [
          { line: 1, text: 'Qualificamos f.id com alias para evitar ambiguidade com c.id.' },
          { line: 4, text: 'COALESCE substitui valores NULL da tabela da direita por um texto padrão legível.' },
          { line: 5, text: 'Tabela da esquerda (funcionarios): todos os funcionários serão listados.' },
          { line: 6, text: 'Condição ON define a ponte relacional entre a chave estrangeira c.funcionario_id e f.id.' },
        ],
        result: 'Lista completa de funcionários com os dados de suas contas bancárias, mantendo funcionários mesmo sem conta vinculada.',
      },
      classicError: {
        engine: 'PostgreSQL',
        wrongCode: 'SELECT id, nome, valor_centavos\nFROM funcionarios f\nINNER JOIN transacoes t ON t.operador_funcionario_id = f.id;',
        errorMessage: 'ERROR: column reference "id" is ambiguous',
        diagnosis: 'Tanto a tabela funcionarios quanto a tabela transacoes possuem uma coluna chamada "id". O motor não sabe qual das duas deve exibir.',
        fix: 'Qualificar a coluna explicitamente: f.id para o ID do funcionário ou t.id para o ID da transação.',
        rule: 'Sempre prefixe colunas com o alias da tabela ao trabalhar com consultas que unem 2 ou mais tabelas.',
      },
      checkpoint: {
        question: 'Uma tabela A tem 10 linhas e a tabela B tem 5 linhas com correspondência. Quantas linhas retorna um LEFT JOIN de A com B se cada registro de A casa com no máximo 1 de B?',
        answer: 'Exatamente 10 linhas. O LEFT JOIN nunca descarta linhas da tabela da esquerda (5 virão preenchidas de B e 5 virão com NULL).',
      },
      bridge: 'Nesta missão você cruzará os registros da auditoria com as tabelas cadastrais para descobrir os nomes por trás dos IDs operacionais.',
      sqliteNote: 'SQLite suporta INNER JOIN e LEFT JOIN perfeitamente com a mesma sintaxe ANSI.',
    },
  },
  {
    id: 'joins-right-full',
    sourceLessons: [
      'aulas/Aula 12 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 3-5.md',
      'aulas/Aula 13 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 4-5.md',
    ],
    concept: 'RIGHT JOIN, FULL JOIN e CROSS JOIN',
    learningObjective: 'Compreender os tipos adicionais de junção e quando usar cada um',
    explanation: 'RIGHT JOIN retorna todas as linhas da tabela da direita. FULL JOIN combina tudo de ambos os lados. CROSS JOIN faz produto cartesiano. SELF JOIN junta uma tabela com ela mesma. SQLite 3.39+ suporta RIGHT e FULL JOIN nativamente.',
    syntaxExample: "-- RIGHT JOIN (equivalente a LEFT JOIN invertido)\nSELECT f.nome, p.nome_projeto FROM funcionarios f\n  RIGHT JOIN projetos p ON f.id = p.func_id;\n\n-- FULL JOIN: tudo de ambos os lados\nSELECT COALESCE(f.nome, 'Sem funcionário') AS nome\n  FROM funcionarios f FULL JOIN projetos p ON f.id = p.func_id;",
    commonMistake: 'Confundir qual tabela está à esquerda/direita; esquecer COALESCE em ambos os lados do FULL JOIN.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'conceptual',
  },
  {
    id: 'cte-subqueries',
    sourceLessons: [
      'aulas/Aula 15 - Subconsultas e CTEs (Common Table Expressions) - Parte 1-3.md',
      'aulas/Aula 17 - Subconsultas e CTEs (Common Table Expressions) - Parte 2-3.md',
      'aulas/Aula 18 - Subconsultas e CTEs (Common Table Expressions) - Parte 3-3.md',
    ],
    concept: 'Subconsultas e CTEs (WITH)',
    learningObjective: 'Usar subqueries e CTEs para consultas aninhadas e tabelas temporárias',
    explanation: 'Uma subquery é um SELECT dentro de outro SELECT. CTE (Common Table Expression) usa WITH para criar uma tabela temporária em memória, tornando queries complexas mais legíveis. Ambas permitem reutilizar resultados intermediários.',
    syntaxExample: "-- Subquery: transações acima da média\nSELECT id, valor_centavos FROM transacoes\n  WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes);\n\n-- CTE: tabela temporária com WITH\nWITH alto_risco AS (\n  SELECT id, valor_centavos FROM transacoes WHERE valor_centavos > 5000000\n)\nSELECT * FROM alto_risco;",
    commonMistake: 'Executar SELECT sem o bloco WITH completo; esquecer colunas no SELECT interno do CTE; usar GROUP BY quando subquery é mais eficiente.',
    sqliteCompatibility: 'supported',
    relatedLevels: [10, 12],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'CONSULTAS AVANÇADAS',
      headline: 'Divida problemas complexos em etapas legíveis com WITH',
      readingMinutes: 4,
      why: 'Investigações reais exigem comparar um registro contra uma métrica calculada na hora (ex.: transações 3× maiores que a média global). CTEs tornam esse raciocínio limpo e modular.',
      howItWorks: [
        'Subqueries são consultas aninhadas dentro de parênteses. Podem retornar um valor escalar único para filtros no WHERE ou uma tabela virtual no FROM.',
        'CTE (Common Table Expression), declarada com a cláusula WITH, cria uma tabela temporária nomeada em memória que existe apenas durante a execução da consulta.',
        'Com CTEs, você lê a query de cima para baixo em ordem cronológica de raciocínio, eliminando o aninhamento confuso de múltiplas subqueries.',
      ],
      mentalModel: {
        label: 'A TABELA DE RASCUNHO FORENSE',
        text: 'Pense no WITH como um bloco de notas de investigação: você calcula primeiro a tabela de "operadores de alto volume" e a coloca de lado com um nome. Em seguida, usa essa anotação para cruzar com a lista de acessos.',
      },
      walkthrough: {
        intro: 'Usando CTE para calcular a média global e depois filtrar transações desproporcionais:',
        code: `WITH metrica_global AS (\n  SELECT AVG(valor_centavos) AS media_valor\n  FROM transacoes\n),\nalto_volume AS (\n  SELECT t.id, t.operador_funcionario_id, t.valor_centavos\n  FROM transacoes t, metrica_global m\n  WHERE t.valor_centavos > m.media_valor * 2\n)\nSELECT id, operador_funcionario_id, valor_centavos\nFROM alto_volume;`,
        annotations: [
          { line: 1, text: 'WITH inicia a declaração das expressões de tabela comuns.' },
          { line: 2, text: 'Primeiro rascunho: calcula a média escalar de todos os lançamentos.' },
          { line: 5, text: 'Segundo rascunho: isola transações com valor superior ao dobro da média.' },
          { line: 10, text: 'Consulta principal limpa que consome a CTE já filtrada.' },
        ],
        result: 'Apenas as transações cujo valor supera o dobro da média histórica do sistema.',
      },
      classicError: {
        engine: 'PostgreSQL',
        wrongCode: 'SELECT id, valor_centavos\nFROM transacoes\nWHERE valor_centavos > AVG(valor_centavos);',
        errorMessage: 'ERROR: aggregate functions are not allowed in WHERE',
        diagnosis: 'Não é possível chamar AVG diretamente no WHERE de uma mesma consulta sem isolá-la em uma subquery ou CTE.',
        fix: 'Substituir por subquery escalar: WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes).',
        rule: 'Para comparar uma linha individual contra uma agregação da tabela inteira, use uma subquery escalar ou CTE.',
      },
      checkpoint: {
        question: 'Qual a vantagem de usar WITH em vez de três subconsultas aninhadas uma dentro da outra?',
        answer: 'Legibilidade, manutenibilidade e modularidade. Cada etapa tem nome claro e o motor pode reutilizar resultados intermediários.',
      },
      bridge: 'Nesta missão você construirá uma consulta com cálculo comparativo para isolar anomalias financeiras que fogem do padrão médio.',
      sqliteNote: 'CTEs com WITH são suportadas nativamente no SQLite desde a versão 3.8.3.',
    },
  },
  {
    id: 'case-when',
    sourceLessons: [],
    concept: 'CASE WHEN — Lógica Condicional',
    learningObjective: 'Criar colunas condicionais para classificar dados',
    explanation: 'CASE WHEN cria valores condicionais dentro de um SELECT. Cada WHEN testa uma condição; THEN define o valor retornado; ELSE é o padrão. END fecha o bloco. É equivalente a um if/else dentro do SQL. O SQLite também suporta a função IIF() para casos simples de duas vias.',
    note: 'CASE WHEN não é ensinado explicitamente nas transcrições do curso. O conceito foi incluído como missão 11 do jogo por sua importância em SQL. A explicação acima é uma síntese pedagógica, não uma referência direta a uma aula.',
    syntaxExample: "SELECT id, valor_centavos,\n  CASE WHEN valor_centavos > 5000000 THEN 'alto'\n       WHEN valor_centavos > 1000000 THEN 'medio'\n       ELSE 'baixo' END AS nivel_risco\nFROM transacoes;",
    commonMistake: 'Esquecer END; confundir ordem das condições (avaliadas de cima para baixo); não incluir ELSE.',
    sqliteCompatibility: 'supported',
    relatedLevels: [11, 12],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'LÓGICA CONDICIONAL',
      headline: 'O if/else dentro do SQL — classifique e transforme dados no SELECT',
      readingMinutes: 3,
      sourceNote: 'Síntese pedagógica — conceito não coberto pelas transcrições do curso.',
      why: 'Dados brutos nem sempre vêm com rótulos explicativos. Classificar transações por faixas de risco ou categorizar horários permite criar relatórios periciais instantâneos.',
      howItWorks: [
        'CASE WHEN avalia condições sequencialmente, de cima para baixo. A primeira condição verdadeira define o resultado na cláusula THEN.',
        'Se nenhuma condição for atendida, o valor do bloco ELSE é retornado. Se o ELSE for omitido e nada bater, o resultado é NULL.',
        'O bloco SEMPRE termina com a palavra-chave END e normalmente recebe um alias com AS.',
      ],
      mentalModel: {
        label: 'A CHAVE SELETORA',
        text: 'O CASE WHEN funciona como uma esteira classificadora: a caixa passa pelo sensor 1 (é maior que 50k?); se sim, ganha a etiqueta "ALTO RISCO" e sai. Se não, vai para o sensor 2.',
      },
      walkthrough: {
        intro: 'Classificando lançamentos por faixa de criticidade e gravidade:',
        code: `SELECT id,\n       valor_centavos,\n       CASE\n         WHEN valor_centavos >= 5000000 THEN 'CRÍTICO'\n         WHEN valor_centavos >= 1000000 THEN 'ALTO'\n         ELSE 'NORMAL'\n       END AS nivel_risco\nFROM transacoes;`,
        annotations: [
          { line: 3, text: 'Início da estrutura condicional CASE.' },
          { line: 4, text: 'Primeira faixa: valores iguais ou acima de R$ 50.000 (5M centavos).' },
          { line: 5, text: 'Segunda faixa avaliada apenas se a primeira for falsa: acima de R$ 10.000.' },
          { line: 6, text: 'ELSE define o valor padrão para todos os demais casos.' },
          { line: 7, text: 'END fecha a condicional; AS nomeia a nova coluna calculada.' },
        ],
        result: 'Cada registro acompanhado de sua respectiva classificação de risco (CRÍTICO, ALTO ou NORMAL).',
      },
      classicError: {
        engine: 'PostgreSQL',
        wrongCode: 'SELECT id, CASE WHEN valor_centavos > 10000 THEN \'ALTO\' AS risco FROM transacoes;',
        errorMessage: 'ERROR: syntax error at or near "AS"',
        diagnosis: 'Falta da palavra-chave obrigatória END antes de fechar a expressão e definir o alias.',
        fix: 'Adicionar o END: CASE WHEN valor_centavos > 10000 THEN \'ALTO\' END AS risco.',
        rule: 'Toda instrução CASE deve ser obrigatoriamente fechada com END antes de receber o alias da coluna.',
      },
      checkpoint: {
        question: 'Se o valor for 6000000 e a primeira condição for WHEN valor >= 1000000 THEN "A" e a segunda for WHEN valor >= 5000000 THEN "B", qual rótulo sai?',
        answer: 'Sai "A". Como o CASE avalia na ordem, 6M satisfaz a primeira condição (>= 1M) e encerra a avaliação imediatamente.',
      },
      bridge: 'Nesta missão você categorizará movimentações por severidade para priorizar os indícios mais graves.',
      sqliteNote: 'CASE WHEN é universal e funciona igualmente no SQLite, Postgres, Oracle e BigQuery.',
    },
  },
  {
    id: 'views',
    sourceLessons: [
      'aulas/Aula 5 - Trabalhando com Views - Parte 1-2.md',
      'aulas/Aula 6 - Trabalhando com Views - Parte 2-2.md',
    ],
    concept: 'Views — Query Salva no Banco',
    learningObjective: 'Criar views para padronizar relatórios e esconder complexidade',
    explanation: 'Uma view é uma query salva no banco que pode ser consultada como se fosse uma tabela. Ela não armazena dados — executa a query a cada chamada. Nos Casos 002 e 004 e na missão 10 dos projetos que culminam em uma view, CREATE VIEW transforma consultas validadas em relatórios padronizados e reutilizáveis.',
    syntaxExample: 'CREATE VIEW vw_funcionarios_ti AS\n  SELECT nome, cargo FROM funcionarios WHERE departamento_id = 2;\n\nSELECT * FROM vw_funcionarios_ti;',
    commonMistake: 'Pensar que view armazena dados; omitir aliases das colunas calculadas; tentar usar CREATE OR REPLACE, que não é nativo no SQLite.',
    sqliteCompatibility: 'partial',
    relatedLevels: [10, 11],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'CONSULTAS SALVAS',
      headline: 'Salve a lógica, não os dados — relatórios padronizados e reutilizáveis',
      readingMinutes: 3,
      why: 'Consultas periciais complexas com múltiplos JOINs e filtros não precisam ser reescritas a cada análise. Uma VIEW encapsula essa complexidade em um objeto reutilizável no banco.',
      howItWorks: [
        'Uma VIEW é uma consulta SQL nomeada e salva no catálogo do banco de dados que pode ser consultada exatamente como se fosse uma tabela comum.',
        'A view não armazena dados físicos adicionais (salvo views materializadas). Toda vez que você roda SELECT * FROM minha_view, a query subjacente é executada dinamicamente.',
        'Views proporcionam segurança e abstração: você pode liberar acesso à view sem expor as tabelas brutas confidenciais.',
      ],
      mentalModel: {
        label: 'A JANELA COM FILTRO SOLAR',
        text: 'Uma VIEW é como uma janela com moldura fixa e vidro fumê: ela não cria um prédio novo; apenas oferece uma visão sob medida e segura do que existe lá fora.',
      },
      walkthrough: {
        intro: 'Criando uma view de auditoria para consolidar movimentações suspeitas:',
        code: `CREATE VIEW vw_transacoes_suspeitas AS\nSELECT t.id AS transacao_id,\n       f.nome AS operador_nome,\n       t.valor_centavos\nFROM transacoes t\nINNER JOIN funcionarios f ON f.id = t.operador_funcionario_id\nWHERE t.valor_centavos > 1000000;`,
        annotations: [
          { line: 1, text: 'CREATE VIEW registra o nome do relatório dinâmico no catálogo do banco.' },
          { line: 2, text: 'Projetamos as colunas finais com aliases claros para quem for consumir o relatório.' },
          { line: 5, text: 'Realizamos o JOIN interno para unir o operador.' },
          { line: 6, text: 'Fixamos a regra de corte para que qualquer SELECT na view já venha pré-filtrado.' },
        ],
        result: 'Cria o objeto vw_transacoes_suspeitas, que passa a responder a consultas com SELECT * FROM vw_transacoes_suspeitas.',
      },
      classicError: {
        engine: 'SQLite',
        wrongCode: 'CREATE OR REPLACE VIEW vw_relatorio AS SELECT * FROM funcionarios;',
        errorMessage: 'near "OR": syntax error (SQLite does not support CREATE OR REPLACE)',
        diagnosis: 'Tentativa de usar CREATE OR REPLACE VIEW no SQLite. O SQLite não suporta a cláusula OR REPLACE para views.',
        fix: 'No SQLite, execute DROP VIEW IF EXISTS vw_relatorio; seguido de CREATE VIEW vw_relatorio AS ...',
        rule: 'No SQLite use DROP VIEW IF EXISTS antes de CREATE VIEW, pois a instrução CREATE OR REPLACE VIEW não é nativa.',
      },
      checkpoint: {
        question: 'Se você atualizar o nome de um funcionário na tabela funcionarios, a consulta na VIEW já reflete o novo nome?',
        answer: 'Sim, imediatamente. Como a view consulta os dados reais em tempo de execução, qualquer alteração na tabela de origem aparece no próximo SELECT.',
      },
      bridge: 'Ao final da auditoria, você consolidará as conclusões da investigação em uma view de relatório que será entregue à diretoria.',
      sqliteNote: 'SQLite suporta CREATE VIEW e DROP VIEW, mas não permite views materializadas ou CREATE OR REPLACE.',
    },
  },
  {
    id: 'materialized-views',
    sourceLessons: [
      'aulas/Aula 8 - Trabalhando com Views Materializadas - Parte 1-2.md',
      'aulas/Aula 9 - Trabalhando com Views Materializadas - Parte 2-2.md',
    ],
    concept: 'Views Materializadas',
    learningObjective: 'Compreender quando usar views materializadas para performance',
    explanation: 'Uma view materializada (MView) armazena o resultado da query como uma tabela física. Resolve problemas de performance de views comuns, mas precisa de refresh manual (REFRESH MATERIALIZED VIEW) para se atualizar.',
    syntaxExample: 'CREATE MATERIALIZED VIEW mv_vendas AS\n  SELECT produto, SUM(valor) FROM vendas GROUP BY produto;\n\nREFRESH MATERIALIZED VIEW mv_vendas;',
    commonMistake: 'Esquecer de fazer refresh (dados desatualizados); usar MView quando não há problema de performance.',
    sqliteCompatibility: 'unsupported',
    relatedLevels: [],
    implementationType: 'conceptual',
  },
  {
    id: 'stored-procedures',
    sourceLessons: [
      'aulas/Aula 11 - Trabalhando com Stored Procedures - Parte 1-2.md',
      'aulas/Aula 12 - Trabalhando com Stored Procedures - Parte 2-2.md',
      'aulas/Aula 15 - Qual a Diferença Entre Stored Procedure e Function.md',
    ],
    concept: 'Stored Procedures e Functions',
    learningObjective: 'Diferenciar SP de Function e compreender programação de banco',
    explanation: 'Stored Procedures são blocos de código procedural (PL/pgSQL) executados com CALL. Functions retornam um valor e podem ser usadas dentro de SELECT. SP é procedural; Function é funcional. SQLite não suporta nenhum dos dois nativamente.',
    syntaxExample: "-- PostgreSQL (NÃO funciona em SQLite)\nCREATE OR REPLACE PROCEDURE relatorio()\n  LANGUAGE plpgsql AS $$ BEGIN ... END; $$;\nCALL relatorio();",
    commonMistake: 'Tentar usar SP dentro de SELECT; confundir PL/pgSQL com SQL puro; esquecer CALL.',
    sqliteCompatibility: 'unsupported',
    relatedLevels: [],
    implementationType: 'conceptual',
  },
  {
    id: 'triggers',
    sourceLessons: [
      'aulas/Aula 16 - Trabalhando com Triggers e Funções - Parte 1-2.md',
      'aulas/Aula 17 - Trabalhando com Triggers e Funções - Parte 2-2.md',
      'aulas/Aula 18 - Habilitando Auditoria no Banco de Dados.md',
    ],
    concept: 'Triggers e Auditoria',
    learningObjective: 'Criar gatilhos que executam automaticamente em eventos de tabela',
    explanation: 'Triggers são gatilhos que disparam automaticamente em INSERT/UPDATE/DELETE. BEFORE INSERT valida dados antes de gravar. BEFORE UPDATE pode salvar valores antigos para auditoria. Em SQLite, a lógica vai direto na trigger (sem PL/pgSQL).',
    syntaxExample: "-- SQLite: impedir projeto sem funcionário\nCREATE TRIGGER trg_check\n  BEFORE INSERT ON projetos\n  FOR EACH ROW WHEN NEW.func_id IS NULL\n  BEGIN SELECT RAISE(ABORT, 'Projeto precisa de funcionário'); END;",
    commonMistake: 'Usar AFTER quando precisa validar antes; deixar trigger ativa permanentemente (performance); esquecer FOR EACH ROW.',
    sqliteCompatibility: 'partial',
    relatedLevels: [],
    implementationType: 'conceptual',
  },
  {
    id: 'transactions',
    sourceLessons: ['aulas/Aula 19 - Controle de Transações - COMMIT, ROLLBACK.md'],
    concept: 'Transações — COMMIT e ROLLBACK',
    learningObjective: 'Garantir atomicidade em operações de múltiplas instruções',
    explanation: 'Uma transação é um bloco atômico: ou todas as operações succeed (COMMIT) ou nenhuma persiste (ROLLBACK). BEGIN inicia a transação. Útil quando múltiplos INSERTs dependem uns dos outros.',
    syntaxExample: 'BEGIN;\nINSERT INTO funcionarios VALUES (10, "Novo", "Analista", 1, 5000, "2024-01-01");\nINSERT INTO contas VALUES (200, "200-x", 10, NULL, "Banco X", "corrente");\nCOMMIT;  -- ou ROLLBACK para desfazer',
    commonMistake: 'Esquecer COMMIT (dados não persistem); não usar ROLLBACK quando uma operação falha no meio; tratar operações dependentes como transações separadas.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'lab',
  },
  {
    id: 'indexes-optimization',
    sourceLessons: ['aulas/Aula 20 - Indexação e Otimização de Consultas.md'],
    concept: 'Índices e Otimização',
    learningObjective: 'Analisar planos de execução e criar índices estrategicamente',
    explanation: 'Índices aceleram consultas em colunas usadas em WHERE e JOINs. EXPLAIN (ou EXPLAIN QUERY PLAN no SQLite) mostra o plano de execução. Trade-off: índices melhoram leitura mas prejudicam escrita (carga). Em ETL, desativar índices durante carga e recriar depois.',
    syntaxExample: "EXPLAIN QUERY PLAN SELECT * FROM transacoes WHERE valor_centavos > 5000000;\nCREATE INDEX idx_valor ON transacoes(valor_centavos);\nDROP INDEX idx_valor;",
    commonMistake: 'Criar índices sem critério; deixar índices ativos durante carga ETL; assumir que mais índices = sempre mais rápido.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'conceptual',
  },
  {
    id: 'string-functions',
    sourceLessons: ['aulas/Aula 7 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 2-2.md'],
    concept: 'Funções de texto — SUBSTR, INSTR e REPLACE',
    learningObjective: 'Extrair, localizar e transformar partes de textos sem alterar os dados originais',
    explanation: 'SUBSTR extrai uma parte do texto, INSTR encontra a posição de um termo e REPLACE substitui ocorrências. São úteis para mascarar dados pessoais e normalizar logs.',
    syntaxExample: "SELECT SUBSTR(cpf, -4), REPLACE(formato, 'CSV', 'arquivo CSV') FROM clientes;",
    commonMistake: 'Confundir a posição inicial com o tamanho em SUBSTR ou sobrescrever dados quando uma transformação no SELECT seria suficiente.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'FUNÇÕES DE TEXTO',
      headline: 'Limpeza e extração — formate logs e disfarces textuais',
      readingMinutes: 3,
      sourceNote: 'Síntese pedagógica — funções de texto não são cobertas diretamente pelas transcrições; exemplo adaptado ao Caso 002.',
      why: 'Logs de segurança, e-mails mascarados e descrições bancárias chegam despadronizados. Funções de string permitem extrair trechos de IPs, formatar documentos e cruzar mensagens criptografadas.',
      howItWorks: [
        'SUBSTR(texto, inicio, tamanho) extrai uma fatia de caracteres a partir de uma posição.',
        'INSTR(texto, termo) encontra a posição inicial de uma substring dentro do texto (retorna 0 se não encontrar).',
        'REPLACE(texto, de, para) substitui todas as ocorrências de um termo por outro. UPPER e LOWER complementam a limpeza ao padronizar maiúsculas e minúsculas.',
      ],
      mentalModel: {
        label: 'O BISTURI DE DADOS',
        text: 'Funções de string funcionam como ferramentas de precisão cirúrgica: recortam prefixos de logs, removem caracteres especiais de CPF e revelam padrões escondidos no corpo do texto.',
      },
      walkthrough: {
        intro: 'Mascarando e extraindo partes de e-mails para relatórios de conformidade:',
        code: `SELECT nome_completo,\n       email,\n       SUBSTR(email, 1, INSTR(email, '@') - 1) AS usuario,\n       REPLACE(email, '@exemplo.com', '@auditoria.local') AS email_seguro\nFROM clientes;`,
        annotations: [
          { line: 1, text: 'nome_completo identifica o cadastro do cliente sem alterar o dado original.' },
          { line: 2, text: 'Mantemos o e-mail original no resultado para comparar com as colunas derivadas.' },
          { line: 3, text: 'Combina SUBSTR com INSTR para isolar tudo o que vem antes do caractere @.' },
          { line: 4, text: 'REPLACE troca o domínio corporativo pelo domínio seguro de auditoria.' },
          { line: 5, text: 'O exemplo usa a tabela clientes, disponível no Caso 002.' },
        ],
        result: 'Lista de clientes com nome, e-mail original, usuário extraído e e-mail com domínio transformado.',
      },
      classicError: {
        engine: 'SQLite',
        wrongCode: 'SELECT INSTR(email) FROM clientes;',
        errorMessage: 'wrong number of arguments to function INSTR()',
        diagnosis: 'INSTR recebeu apenas o texto de origem, mas precisa também do termo que deve localizar.',
        fix: 'Informar os dois argumentos: INSTR(email, \'@\').',
        rule: 'INSTR(texto, termo) sempre recebe dois argumentos: onde procurar e o que procurar.',
      },
      checkpoint: {
        question: 'Qual o resultado de SUBSTR(\'AUDITORIA\', 1, 4)?',
        answer: 'Retorna "AUDI" (4 caracteres a partir da posição 1). Lembre-se: em SQL a indexação de strings começa em 1, não em 0.',
      },
      bridge: 'Essencial para processar logs de servidores, mensagens internas e identificar padrões de comunicação suspeitos.',
      sqliteNote: 'SQLite implementa SUBSTR, INSTR, REPLACE, UPPER, LOWER, LENGTH e TRIM nativamente.',
    },
  },
  {
    id: 'window-functions',
    sourceLessons: ['aulas/Aula 9 - Funções de Agregação e Agrupamento - Parte 2-2.md'],
    concept: 'Window Functions — ROW_NUMBER, LAG e SUM OVER',
    learningObjective: 'Calcular rankings, comparações e acumulados preservando cada linha do resultado',
    explanation: 'Funções de janela usam OVER. PARTITION BY cria grupos independentes e ORDER BY define a sequência. Diferente de GROUP BY, elas não reduzem o número de linhas.',
    syntaxExample: 'SELECT data_hora, LAG(data_hora) OVER (PARTITION BY origem ORDER BY data_hora) AS anterior FROM transferencias;',
    commonMistake: 'Usar GROUP BY quando precisa manter cada transação; esquecer ORDER BY em LAG ou em um acumulado.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'FUNÇÕES DE JANELA',
      headline: 'Cálculos analíticos sobre partições sem colapsar as linhas do resultado',
      readingMinutes: 4,
      sourceNote: 'Síntese pedagógica — funções de janela não são cobertas diretamente pelas transcrições; exemplo adaptado aos casos e projetos analíticos.',
      why: 'Para identificar lançamentos sucessivos em segundos ou calcular rankings de movimentações por conta, o GROUP BY não serve porque ele esconde as linhas individuais. Window functions resolvem isso.',
      howItWorks: [
        'Window functions realizam cálculos sobre um conjunto de linhas relacionadas (uma partição), mas mantém todas as linhas individuais no resultado final.',
        'A cláusula OVER define a janela: PARTITION BY divide os dados em grupos independentes, e ORDER BY define a sequência de cálculo dentro da partição.',
        'Funções como ROW_NUMBER() numeram registros, LAG() e LEAD() olham para a linha anterior/posterior, e SUM() OVER calcula acumulados.',
      ],
      mentalModel: {
        label: 'A LUPA DESLIZANTE',
        text: 'Enquanto o GROUP BY tritura a tabela inteira e devolve um resumo em pó, a Window Function desliza uma lupa sobre cada linha, calculando contexto (quem veio antes, qual o acumulado) sem apagar ninguém.',
      },
      walkthrough: {
        intro: 'Comparando o horário de cada transação com o lançamento imediatamente anterior do mesmo operador:',
        code: `SELECT carteira_origem_id,\n       data_hora,\n       LAG(data_hora) OVER (\n         PARTITION BY carteira_origem_id\n         ORDER BY data_hora\n       ) AS data_hora_anterior\nFROM transferencias\nORDER BY carteira_origem_id, data_hora;`,
        annotations: [
          { line: 3, text: 'LAG busca o valor de data_hora na linha imediatamente anterior da mesma partição.' },
          { line: 4, text: 'PARTITION BY reinicia a janela para cada carteira de origem.' },
          { line: 5, text: 'ORDER BY garante a ordem cronológica dentro de cada carteira.' },
          { line: 7, text: 'O exemplo usa a tabela transferencias, disponível no Caso 003.' },
          { line: 8, text: 'A ordenação externa deixa o resultado final na mesma sequência usada pela janela.' },
        ],
        result: 'Todas as transferências preservadas, acompanhadas do horário anterior da mesma carteira de origem; a primeira de cada carteira vem com NULL.',
      },
      classicError: {
        engine: 'PostgreSQL',
        wrongCode: 'SELECT id, LAG(data_hora) FROM transferencias;',
        errorMessage: 'ERROR: window function lag requires an OVER clause',
        diagnosis: 'Toda window function exige a cláusula OVER para especificar como as linhas devem ser particionadas e ordenadas.',
        fix: 'Adicionar a cláusula OVER (ORDER BY data_hora) ou com o particionamento desejado.',
        rule: 'Toda função de janela (ROW_NUMBER, LAG, LEAD, SUM OVER) exige obrigatoriamente a cláusula OVER.',
      },
      checkpoint: {
        question: 'Qual a diferença essencial entre COUNT(*) com GROUP BY e COUNT(*) OVER (PARTITION BY departamento)?',
        answer: 'GROUP BY colapsa as linhas em uma por departamento. COUNT(*) OVER preserva todas as linhas originais e apenas anexa o total do departamento em cada uma delas.',
      },
      bridge: 'Útil para analisar sequências temporais de acessos e transações na busca por ações automatizadas ou repetidas.',
      sqliteNote: 'Window functions são suportadas nativamente no SQLite desde a versão 3.25.0 (2018).',
    },
  },
  {
    id: 'null-handling',
    sourceLessons: ['aulas/Aula 7 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 2-2.md'],
    concept: 'Valores nulos — COALESCE e NULLIF',
    learningObjective: 'Tratar ausência de dados sem confundir NULL, texto vazio e zero',
    explanation: 'COALESCE devolve o primeiro valor não nulo. NULLIF converte dois valores iguais em NULL, útil para tratar texto vazio como ausência de informação.',
    syntaxExample: "SELECT COALESCE(quantidade, 0), NULLIF(motivo, '') FROM movimentacoes_estoque;",
    commonMistake: 'Comparar NULL com =; use IS NULL para testar ausência e COALESCE para definir um valor alternativo.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'TRATAMENTO DE NULOS',
      headline: 'NULL não é zero nem texto vazio — é a ausência de informação',
      readingMinutes: 3,
      sourceNote: 'Síntese pedagógica — COALESCE e NULLIF não são cobertos diretamente pelas transcrições; exemplo adaptado ao Caso 004.',
      why: 'Criminosos frequentemente exploram campos opcionais não preenchidos ou falhas de auditoria para esconder rastros. Tratar NULL incorretamente gera falsos positivos e queries silenciosamente vazias.',
      howItWorks: [
        'NULL representa dado desconhecido ou inexistente. Qualquer comparação com operadores normais (=, !=, <, >) contra NULL resulta em UNKNOWN (falso no WHERE).',
        'Para verificar se um campo é nulo, use exclusivamente IS NULL ou IS NOT NULL.',
        'A função COALESCE(coluna, valor_padrao) retorna o primeiro valor não nulo da lista, ideal para limpar relatórios.',
      ],
      mentalModel: {
        label: 'A CAIXA LACRADA',
        text: 'NULL é uma caixa fechada cujo conteúdo você não sabe: se perguntar "essa caixa é igual a 5?", a resposta é "não sei" (nem sim, nem não). Por isso coluna = NULL nunca retorna verdadeiro.',
      },
      walkthrough: {
        intro: 'Tratando quantidade ausente e convertendo motivo vazio em NULL no histórico de estoque:',
        code: `SELECT id,\n       COALESCE(quantidade, 0) AS quantidade_tratada,\n       NULLIF(motivo, '') AS motivo_tratado\nFROM movimentacoes_estoque\nORDER BY id;`,
        annotations: [
          { line: 2, text: 'COALESCE substitui quantidade NULL por 0 apenas no resultado da consulta.' },
          { line: 3, text: 'NULLIF transforma texto vazio em NULL e preserva motivos preenchidos.' },
          { line: 4, text: 'O exemplo usa movimentacoes_estoque, disponível no Caso 004.' },
          { line: 5, text: 'ORDER BY torna a saída determinística para conferência.' },
        ],
        result: 'Todas as movimentações, com quantidade padronizada e ausência de motivo representada de forma consistente por NULL.',
      },
      classicError: {
        engine: 'SQL (erro lógico)',
        wrongCode: 'SELECT * FROM movimentacoes_estoque WHERE motivo = NULL;',
        errorMessage: 'Resultado: 0 linhas retornadas, sem erro de sintaxe',
        diagnosis: 'Comparação usando = NULL. Como nada é estritamente igual a NULL (nem outro NULL), a expressão avalia como UNKNOWN e nunca retorna linhas.',
        fix: 'Substituir por WHERE motivo IS NULL.',
        rule: 'Nunca compare valores nulos com = NULL; use sempre a sintaxe IS NULL ou IS NOT NULL.',
      },
      checkpoint: {
        question: 'O que retorna a expressão SELECT COALESCE(NULL, NULL, \'Rastro\', \'Final\');?',
        answer: 'Retorna "Rastro", que é o primeiro argumento não nulo encontrado da esquerda para a direita.',
      },
      bridge: 'Permite auditar transações e registros com dados ausentes ou campos propositalmente deixados em branco.',
      sqliteNote: 'SQLite segue estritamente a semântica tri-valorada (TRUE, FALSE, NULL) do padrão ANSI SQL.',
    },
  },
  {
    id: 'json-functions',
    sourceLessons: ['aulas/Aula 18 - Habilitando Auditoria no Banco de Dados.md'],
    concept: 'Funções JSON — json_extract e json_each',
    learningObjective: 'Ler atributos estruturados salvos em colunas JSON',
    explanation: 'json_extract recebe um documento JSON e um caminho, como $.estoque_atual. Isso permite comparar o estado anterior e posterior guardado pela auditoria.',
    syntaxExample: "SELECT json_extract(dados_antes, '$.estoque_atual') FROM auditoria;",
    commonMistake: 'Esquecer o prefixo $ no caminho JSON ou tratar um campo ausente como se fosse uma string vazia.',
    sqliteCompatibility: 'supported',
    relatedLevels: [],
    implementationType: 'mission',
    lesson: {
      eyebrow: 'DADOS SEMIESTRUTURADOS',
      headline: 'Navegue em documentos JSON gravados nas colunas de auditoria',
      readingMinutes: 4,
      sourceNote: 'Síntese pedagógica — json_extract não é coberto diretamente pelas transcrições; exemplo adaptado ao Caso 004.',
      why: 'Sistemas modernos gravam payloads de eventos e logs de alteração em colunas JSON estruturadas. Investigar adulterações exige ler o antes e depois guardado dentro do JSON.',
      howItWorks: [
        'json_extract(coluna_json, \'$.caminho\') extrai um valor específico de um objeto JSON usando a notação com $ (raiz).',
        'Caminhos aninhados utilizam ponto: $.usuario.ip ou $.dados_antes.valor_centavos.',
        'json_each permite expandir arrays JSON em linhas relacionais individuais.',
      ],
      mentalModel: {
        label: 'A CHAVE DO COFRE JSON',
        text: 'Uma coluna JSON é como um envelope com fichas etiquetadas dentro. Com a chave json_extract(coluna, \'$.saldo\'), você puxa diretamente a ficha do saldo sem precisar rasgar o envelope.',
      },
      walkthrough: {
        intro: 'Extraindo dados de auditoria gravados em formato JSON para comparar alterações:',
        code: `SELECT id,\n       json_extract(dados_antes, '$.estoque_atual') AS estoque_antes,\n       json_extract(dados_depois, '$.estoque_atual') AS estoque_depois\nFROM auditoria\nORDER BY id;`,
        annotations: [
          { line: 2, text: 'Extrai o estoque anterior guardado no documento JSON dados_antes.' },
          { line: 3, text: 'Extrai o estoque posterior usando o mesmo caminho no documento dados_depois.' },
          { line: 4, text: 'auditoria é a tabela real que registra o antes e o depois no Caso 004.' },
          { line: 5, text: 'ORDER BY mantém os eventos na sequência em que foram registrados.' },
        ],
        result: 'Uma linha por evento de auditoria com o estoque anterior e o posterior em colunas comparáveis.',
      },
      classicError: {
        engine: 'SQLite',
        wrongCode: 'SELECT json_extract(dados_antes, \'estoque_atual\') FROM auditoria;',
        errorMessage: 'bad JSON path: \'estoque_atual\'',
        diagnosis: 'Esquecimento do prefixo obrigatório "$." no caminho do JSON. O motor exige que todo path JSON comece pelo cifrão ($).',
        fix: 'Corrigir o caminho para \'$.ip_origem\'.',
        rule: 'Caminhos JSON em json_extract devem sempre começar pelo símbolo de raiz ($).',
      },
      checkpoint: {
        question: 'Como extrair a propriedade "cargo" de um objeto aninhado em {"funcionario": {"cargo": "Analista"}}?',
        answer: 'json_extract(coluna, \'$.funcionario.cargo\').',
      },
      bridge: 'Permite inspecionar logs de alteração e rastros deixados em tabelas de auditoria semipreenchidas.',
      sqliteNote: 'Funções JSON como json_extract e json_valid são nativas no SQLite desde a versão 3.38.',
    },
  },
  {
    id: 'normalizacao-intro',
    sourceLessons: ['aulas/Aula 01 - Normalização - Introdução e o Problema da Planilha do Inferno.md'],
    concept: 'Normalização e anomalias de dados',
    learningObjective: 'Reconhecer redundância e anomalias de inserção, atualização e exclusão',
    explanation: 'Normalizar é separar assuntos diferentes em entidades próprias para reduzir repetição e impedir que a mesma informação fique contraditória em várias linhas.',
    syntaxExample: 'SELECT cliente_cpf, COUNT(DISTINCT TRIM(cliente_nome)) AS variacoes\nFROM supremacy\nGROUP BY cliente_cpf;',
    commonMistake: 'Tratar uma planilha larga como se já fosse um modelo relacional consistente.',
    sqliteCompatibility: 'supported',
    relatedLevels: [1],
    implementationType: 'conceptual',
  },
  {
    id: 'normalizacao-1fn',
    sourceLessons: ['aulas/Aula 02 - Normalização - Primeira Forma Normal (1FN) e Chave Primária.md'],
    concept: 'Primeira Forma Normal (1FN)',
    learningObjective: 'Garantir valores atômicos e identificar cada entidade por uma chave estável',
    explanation: 'A 1FN elimina grupos repetidos e exige valores atômicos. Na prática, CPF e códigos de produto ajudam a consolidar grafias duplicadas sem confundir pessoas diferentes.',
    syntaxExample: 'INSERT INTO clientes (nome, cpf)\nSELECT TRIM(cliente_nome), cliente_cpf\nFROM supremacy\nGROUP BY cliente_cpf;',
    commonMistake: 'Agrupar somente pelo nome quando o mesmo cliente possui grafias diferentes.',
    sqliteCompatibility: 'supported',
    relatedLevels: [1, 2, 3, 4],
    implementationType: 'mission',
  },
  {
    id: 'normalizacao-2fn',
    sourceLessons: ['aulas/Aula 03 - Normalização - Segunda Forma Normal (2FN) e Dependência Parcial.md'],
    concept: 'Segunda Forma Normal (2FN)',
    learningObjective: 'Remover atributos que dependem apenas de parte de uma chave composta',
    explanation: 'Em uma relação venda-produto, nome e categoria dependem apenas do produto; quantidade e preço negociado pertencem à combinação venda + produto.',
    syntaxExample: 'CREATE TABLE itens_venda (\n  venda_id INTEGER,\n  produto_id INTEGER,\n  quantidade INTEGER,\n  PRIMARY KEY (venda_id, produto_id)\n);',
    commonMistake: 'Repetir nome e categoria do produto em cada item da venda.',
    sqliteCompatibility: 'supported',
    relatedLevels: [5, 6, 7],
    implementationType: 'mission',
  },
  {
    id: 'normalizacao-3fn',
    sourceLessons: ['aulas/Aula 04 - Normalização - Terceira Forma Normal (3FN) e Dependência Transitiva.md'],
    concept: 'Terceira Forma Normal (3FN)',
    learningObjective: 'Eliminar dependências transitivas entre atributos não-chave',
    explanation: 'Se vendedor determina região e região determina gerente, o gerente pertence à tabela regioes. Assim uma troca de gerente exige uma única atualização.',
    syntaxExample: 'SELECT nome AS regiao, gerente\nFROM regioes\nORDER BY nome;',
    commonMistake: 'Armazenar o gerente em cada vendedor e criar várias cópias do mesmo dado.',
    sqliteCompatibility: 'supported',
    relatedLevels: [8, 9],
    implementationType: 'mission',
  },
  {
    id: 'relational-modeling',
    sourceLessons: ['aulas/Aula 05 - Relacionamentos - PK, FK e Cardinalidade (1N, N-N).md'],
    concept: 'PK, FK e cardinalidades 1:N e N:N',
    learningObjective: 'Modelar integridade referencial e resolver relações muitos-para-muitos',
    explanation: 'A FK fica no lado N de uma relação 1:N. Uma relação N:N exige uma tabela intermediária, normalmente com uma chave primária composta pelas duas FKs.',
    syntaxExample: 'FOREIGN KEY (cliente_id) REFERENCES clientes(id)',
    commonMistake: 'Criar colunas com sufixo _id sem declarar a FOREIGN KEY correspondente.',
    sqliteCompatibility: 'supported',
    relatedLevels: [9, 10, 11, 12, 14],
    implementationType: 'mission',
  },
  {
    id: 'normalization-validation',
    sourceLessons: ['aulas/Aula 06 - Normalização - O Teste da Realidade e Fechamento do Caso 005.md'],
    concept: 'Validação de um modelo normalizado',
    learningObjective: 'Comprovar o benefício da normalização com atualizações e consultas integradas',
    explanation: 'Um modelo normalizado reduz a manutenção: mudar um endereço exige uma única atualização e todas as vendas continuam ligadas ao cliente pela FK.',
    syntaxExample: "UPDATE clientes SET endereco = 'Av. Central, 500' WHERE cpf = '111.111.111-01';",
    commonMistake: 'Validar apenas a existência das tabelas sem testar seus relacionamentos e restrições.',
    sqliteCompatibility: 'supported',
    relatedLevels: [13, 14],
    implementationType: 'mission',
  },
  {
    id: 'oltp-olap',
    sourceLessons: [
      'aulas/Aula 07 - OLTP vs OLAP - Entendendo os Dois Mundos.md',
      'aulas/Aula 08 - Fase 1 - Explorando o Modelo OLTP.md',
    ],
    concept: 'OLTP versus OLAP',
    learningObjective: 'Distinguir o banco transacional do modelo otimizado para análise',
    explanation: 'OLTP prioriza escritas pequenas e consistentes; OLAP prioriza leitura agregada de grandes volumes. O DW recebe dados do OLTP sem substituir o sistema operacional.',
    syntaxExample: "SELECT strftime('%Y-%m', data_venda) AS mes, SUM(valor_total)\nFROM vendas\nGROUP BY mes;",
    commonMistake: 'Executar relatórios pesados diretamente no banco transacional de produção.',
    sqliteCompatibility: 'supported',
    relatedLevels: [1, 2],
    implementationType: 'conceptual',
  },
  {
    id: 'data-quality',
    sourceLessons: ['aulas/Aula 09 - Fase 2 - Limpeza de Dados (Data Quality).md'],
    concept: 'Limpeza e padronização de dados',
    learningObjective: 'Corrigir espaços, caixa e números em formato textual antes da carga',
    explanation: 'TRIM, LOWER, REPLACE e CAST convertem entradas heterogêneas em valores comparáveis e aptos a cálculos.',
    syntaxExample: "CAST(REPLACE(REPLACE(TRIM(preco), '.', ''), ',', '.') AS REAL)",
    commonMistake: 'Somar preços ainda armazenados como texto com separadores locais.',
    sqliteCompatibility: 'supported',
    relatedLevels: [3, 4],
    implementationType: 'mission',
  },
  {
    id: 'etl',
    sourceLessons: ['aulas/Aula 10 - Fase 3 - ETL (Extração Transformação e Carga).md'],
    concept: 'ETL e carga incremental',
    learningObjective: 'Extrair, transformar e carregar apenas registros ainda ausentes do destino',
    explanation: 'O pipeline ETL preserva chaves, aplica regras de qualidade e usa NOT EXISTS para evitar duplicação nas cargas seguintes.',
    syntaxExample: 'SELECT s.venda_id\nFROM staging s\nWHERE NOT EXISTS (SELECT 1 FROM destino d WHERE d.source_venda_id = s.venda_id);',
    commonMistake: 'Usar uma FK dimensional como se fosse a chave de origem da carga incremental.',
    sqliteCompatibility: 'supported',
    relatedLevels: [5, 6],
    implementationType: 'mission',
  },
  {
    id: 'star-schema',
    sourceLessons: ['aulas/Aula 11 - Fase 4 - Modelagem Dimensional (Star Schema).md'],
    concept: 'Modelagem dimensional e star schema',
    learningObjective: 'Separar métricas na fato e contextos de análise nas dimensões',
    explanation: 'A tabela fato define a granularidade e contém métricas e FKs. Dimensões descrevem tempo, cliente, produto, vendedor e região.',
    syntaxExample: 'fct_vendas(tempo_id, cliente_id, produto_id, quantidade, valor_total)',
    commonMistake: 'Misturar granularidades diferentes na mesma tabela fato.',
    sqliteCompatibility: 'supported',
    relatedLevels: [7, 8, 9],
    implementationType: 'mission',
  },
  {
    id: 'olap-bi',
    sourceLessons: ['aulas/Aula 12 - Fase 5 - OLAP (Consultas Analíticas e Views).md'],
    concept: 'OLAP, funções de janela e views de BI',
    learningObjective: 'Produzir indicadores temporais reutilizáveis para dashboards',
    explanation: 'Agregações mensais, LAG e views transformam a tabela fato em indicadores consistentes para consumo por relatórios.',
    syntaxExample: 'LAG(faturamento_mes) OVER (ORDER BY ano, mes)',
    commonMistake: 'Agrupar por cada id de data quando o relatório pede uma linha por mês.',
    sqliteCompatibility: 'supported',
    relatedLevels: [10, 11, 12],
    implementationType: 'mission',
  },
  {
    id: 'dw-governance',
    sourceLessons: ['aulas/Aula 13 - Fase 6 - Auditoria e Performance (Índices e Triggers).md'],
    concept: 'Performance e governança no DW',
    learningObjective: 'Indexar FKs críticas e auditar alterações com triggers',
    explanation: 'Índices aceleram filtros e JOINs recorrentes; triggers registram automaticamente o antes e o depois de operações sensíveis.',
    syntaxExample: 'CREATE INDEX idx_fct_regiao ON fct_vendas(regiao_id);',
    commonMistake: 'Criar um índice com o nome pedido, mas sobre a coluna errada.',
    sqliteCompatibility: 'supported',
    relatedLevels: [13, 14],
    implementationType: 'mission',
  },
  {
    id: 'certification',
    sourceLessons: ['aulas/Aula 14 - Certificação e Conclusão da Trilha de Dados.md'],
    concept: 'Certificação e portfólio técnico',
    learningObjective: 'Registrar a conclusão da trilha e comunicar as competências demonstradas',
    explanation: 'O certificado resume caso, cargo conquistado, pontuação e estrelas após a conclusão integral do cenário.',
    syntaxExample: '-- Evidência de portfólio: modelo, ETL, DW, consultas OLAP e governança',
    commonMistake: 'Emitir certificado antes de concluir todas as missões e o desafio final.',
    sqliteCompatibility: 'supported',
    relatedLevels: [14],
    implementationType: 'conceptual',
  },
];

/**
 * Retorna todos os itens de conteúdo do curso.
 * @returns {CourseItem[]}
 */
export function getAllCourseContent() {
  return COURSE_CONTENT;
}

/**
 * Retorna itens de conteúdo relacionados a um nível (missão) específico.
 * @param {number} levelId
 * @returns {CourseItem[]}
 */
export function getCourseContentByLevel(levelId) {
  return COURSE_CONTENT.filter(item => item.relatedLevels.includes(levelId));
}

/**
 * Retorna um item de conteúdo pelo seu ID.
 * @param {string} id
 * @returns {CourseItem|undefined}
 */
export function getCourseContentById(id) {
  return COURSE_CONTENT.find(item => item.id === id);
}

/**
 * Retorna itens de conteúdo por tipo de implementação.
 * @param {'mission'|'lab'|'conceptual'} type
 * @returns {CourseItem[]}
 */
export function getCourseContentByType(type) {
  return COURSE_CONTENT.filter(item => item.implementationType === type);
}
