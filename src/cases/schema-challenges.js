/**
 * schema-challenges.js — Dados dos desafios do modo Construtor de Schema.
 *
 * Cada desafio traz requisitos em linguagem natural e a validação é feita
 * sobre o banco construído pelo jogador (tabelas, PKs, FKs, cardinalidades).
 * O jogador escreve um CREATE TABLE por execução — o banco acumula as criações.
 */

export const SCHEMA_BUILDER_INTRO = {
  title: 'Modo Construtor de Schema',
  subtitle: 'Modelagem de Dados',
  story: 'Bem-vindo ao lado criativo do SQL. Agora você não analisa um banco — você o desenha. Um cliente chegou com uma necessidade em linguagem natural e cabe a você traduzi-la em tabelas, chaves primárias, chaves estrangeiras e cardinalidades corretas. Sem esquema pronto, sem seed: o banco começa vazio e cada CREATE TABLE é uma peça do seu modelo. Ao final de cada desafio, revise seu schema com a IA arquiteta para validar a coerência conceitual.',
};

export const SCHEMA_BUILDER_CONCLUSION = {
  title: 'Modo concluído',
  story: 'Seis modelos de dados desenhados do zero, seis domínios diferentes — de uma startup a uma plataforma de streaming. Você treinou a habilidade mais disputada do mercado: traduzir necessidade de negócio em schema. Chaves primárias, estrangeiras, tabelas de junção N:N e cardinalidades — tudo escolhido por você. Continue evoluindo com os demais casos e domine a modelagem como um verdadeiro arquiteto de dados.',
  nextSteps: 'Explore os casos 005 e 006 para aprofundar normalização e Data Warehouse, ou volte ao modo Bug Hunter para afiar seu debugging.',
};

/**
 * Shape do desafio:
 * - id: número (1..6)
 * - number: rótulo exibido ("01" etc.)
 * - title: nome do desafio
 * - concept: conceito central
 * - story: contexto narrativo
 * - requirements: requisitos em linguagem natural (exibidos ao jogador)
 * - summary: resumo curto das cardinalidades para o briefing (exibido)
 * - inheritsFrom: id de outro desafio cujo modelo deve ser copiado na primeira abertura
 * - expectedTables: nomes de tabelas obrigatórias
 * - unexpectedTables: nomes de tabelas que NÃO deveriam existir
 * - allowExtraTables: false somente quando o desafio exigir um modelo fechado (padrão: true)
 * - tableChecks: { [tableName]: { columns: [{name, constraints}], pk: [...], fk: [...] } }
 * - junctionTables: { [junctionName]: { connects: [t1, t2] } } (N:N obrigatório)
 * - hints: dicas locais progressivas (4)
 * - explanation: texto didático exibido na aba DICAS ao concluir
 * - evidence: texto curto exibido no painel de evidências
 */
export const SCHEMA_CHALLENGES = [
  {
    id: 1,
    number: '01',
    title: 'TechStart: Funcionários e Departamentos',
    concept: 'PK, FK e cardinalidade 1:N',
    story: 'A startup TechStart cresceu rápido e seus dados vivem em planilhas. O CTO pediu a você o primeiro modelo relacional oficial: organizar funcionários e departamentos.',
    requirements: 'Uma empresa tem departamentos e funcionários. Cada departamento tem um código único e um nome. Cada funcionário pertence a exatamente um departamento e possui um código único, nome e cargo. Um departamento pode ter vários funcionários.',
    summary: 'departamentos 1 ──── N funcionários (FK em funcionários)',
    expectedTables: ['departamentos', 'funcionarios'],
    unexpectedTables: ['pessoa', 'empregado', 'empresas'],
    tableChecks: {
      departamentos: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'nome', constraints: ['notnull'] },
        ],
        pk: ['id'],
        fk: [],
      },
      funcionarios: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'nome', constraints: ['notnull'] },
          { name: 'cargo', constraints: ['notnull'] },
          { name: 'departamento_id', constraints: ['fk'] },
        ],
        pk: ['id'],
        fk: [{ column: 'departamento_id', references: 'departamentos' }],
      },
    },
    hints: [
      'Comece pela tabela "departamentos": ela é o lado "1" do relacionamento e não depende de ninguém.',
      'Dê a cada tabela uma coluna identificadora declarada como PRIMARY KEY (id).',
      'Para o 1:N, a chave estrangeira (FK) mora no lado "N": funcionarios precisa de uma coluna departamento_id com FOREIGN KEY ... REFERENCES departamentos(id).',
      'Garanta que nome (e cargo) aceitem apenas valores não nulos: use NOT NULL nas colunas de dados.',
    ],
    explanation: 'Em um relacionamento 1:N, a FK sempre fica na tabela do lado "N". O lado "1" (departamentos) define o contrato de identificação, e as referências garantem que nenhum funcionário aponte para um departamento inexistente.',
    evidence: 'Modelo TechStart: departamentos e funcionários ligados por FK com cardinalidade 1:N. Base sólida de modelagem OLTP aplicada.',
  },
  {
    id: 2,
    number: '02',
    title: 'TechStart 2: Projetos e a Relação N:N',
    concept: 'Tabela de junção para cardinalidade N:N',
    story: 'A TechStart agora administra projetos. O CTO notou um problema: um funcionário pode participar de vários projetos e um projeto tem vários funcionários. As planilhas viraram um caos.',
    inheritsFrom: 1,
    requirements: 'Mantenha departamentos e funcionários do desafio anterior. Adicione projetos, com código único, nome e prazo. Um funcionário pode participar de vários projetos e um projeto pode ter vários funcionários. Crie uma tabela de associação para essa relação muitos-para-muitos, com referência tanto ao funcionário quanto ao projeto.',
    summary: 'funcionarios N ──── N projetos (tabela de junção funcionario_projeto com duas FKs)',
    expectedTables: ['departamentos', 'funcionarios', 'projetos', 'funcionario_projeto'],
    unexpectedTables: ['pessoa', 'empregado', 'equipes'],
    tableChecks: {
      departamentos: {
        columns: [{ name: 'id', constraints: ['pk'] }],
        pk: ['id'],
        fk: [],
      },
      funcionarios: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'departamento_id', constraints: ['fk'] },
        ],
        pk: ['id'],
        fk: [{ column: 'departamento_id', references: 'departamentos' }],
      },
      projetos: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'nome', constraints: ['notnull'] },
          { name: 'prazo', constraints: ['notnull'] },
        ],
        pk: ['id'],
        fk: [],
      },
      funcionario_projeto: {
        columns: [
          { name: 'funcionario_id', constraints: ['pk', 'fk'] },
          { name: 'projeto_id', constraints: ['pk', 'fk'] },
        ],
        pk: ['funcionario_id', 'projeto_id'],
        fk: [
          { column: 'funcionario_id', references: 'funcionarios' },
          { column: 'projeto_id', references: 'projetos' },
        ],
      },
    },
    junctionTables: {
      funcionario_projeto: { connects: ['funcionarios', 'projetos'] },
    },
    hints: [
      'Você já tem departamentos e funcionarios; continue de onde parou. Falta a gestão de projetos.',
      'Crie a tabela "projetos" com id, nome e prazo, com id como PRIMARY KEY.',
      'Relação muitos-para-muitos se modela com uma tabela de junção: "funcionario_projeto", com uma coluna referenciando cada lado.',
      'Na tabela de junção, ambas as colunas recebem FOREIGN KEY (uma para funcionarios, outra para projetos) e juntas formam a PRIMARY KEY composta.',
    ],
    explanation: 'O SQL relacional não permite FK direta em N:N. A tabela de junção (também chamada de tabela associativa) resolve: cada linha representa uma participação, com PK composta garantindo que a mesma combinação funcionário-projeto não se repita.',
    evidence: 'Tabela de junção funcionario_projeto criada com PK composta e duas FKs — cardinalidade N:N entre funcionários e projetos resolvida.',
  },
  {
    id: 3,
    number: '03',
    title: 'Colégio Ávila: Alunos, Turmas e Disciplinas',
    concept: 'Modelo escolar completo com dois 1:N e um N:N',
    story: 'A secretaria do Colégio Ávila quer aposentar o caderno de matrículas. Você vai desenhar o modelo: alunos matriculados em turmas e cursando várias disciplinas ao longo do ano.',
    requirements: 'O colégio tem turmas (série, ano letivo) e alunos. Cada aluno pertence a exatamente uma turma no ano letivo. Há disciplinas, e um aluno pode cursar várias disciplinas, enquanto uma disciplina é cursada por vários alunos. Use uma tabela de matrícula para registrar quais alunos cursam quais disciplinas.',
    summary: 'turmas 1:N alunos · alunos N:N disciplinas (matricula como junção)',
    expectedTables: ['turmas', 'alunos', 'disciplinas', 'matricula'],
    unexpectedTables: ['estudantes', 'escolas', 'professores'],
    tableChecks: {
      turmas: {
        columns: [{ name: 'id', constraints: ['pk'] }],
        pk: ['id'],
        fk: [],
      },
      alunos: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'nome', constraints: ['notnull'] },
          { name: 'turma_id', constraints: ['fk'] },
        ],
        pk: ['id'],
        fk: [{ column: 'turma_id', references: 'turmas' }],
      },
      disciplinas: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'nome', constraints: ['notnull'] },
        ],
        pk: ['id'],
        fk: [],
      },
      matricula: {
        columns: [
          { name: 'aluno_id', constraints: ['pk', 'fk'] },
          { name: 'disciplina_id', constraints: ['pk', 'fk'] },
        ],
        pk: ['aluno_id', 'disciplina_id'],
        fk: [
          { column: 'aluno_id', references: 'alunos' },
          { column: 'disciplina_id', references: 'disciplinas' },
        ],
      },
    },
    junctionTables: {
      matricula: { connects: ['alunos', 'disciplinas'] },
    },
    hints: [
      'Identifique as entidades: turmas, alunos e disciplinas. Comece pelas duas que não dependem de ninguém.',
      'Cada aluno pertence a exatamente uma turma — cardinalidade 1:N com a FK em alunos.',
      'Aluno cursa várias disciplinas e uma disciplina tem vários alunos — isso é um muitos-para-muitos.',
      'Crie a tabela "matricula" com aluno_id e disciplina_id, ambas como FK e juntas como PK composta.',
    ],
    explanation: 'Modelos do dia a dia combinam cardinalidades: 1:N (aluno-turma) e N:N (aluno-disciplina). A regra de ouro segue a mesma: FK no lado N do 1:N e tabela de junção para o N:N — aqui materializada em "matricula".',
    evidence: 'Modelo escolar completo: turmas → alunos (1:N) e matrícula como junção do N:N alunos-disciplinas.',
  },
  {
    id: 4,
    number: '04',
    title: 'Biblioteca Vértice: Livros, Autores e Empréstimos',
    concept: 'N:N com atributo (livro_autor) e cadeia 1:N (exemplares)',
    story: 'A Biblioteca Vértice recebeu uma doação de 3 mil livros e percebeu que não sabe quem escreveu o quê — nem quem está com qual exemplar. Hora de modelar.',
    requirements: 'O acervo tem livros (título, ISBN) e autores. Um livro pode ter vários autores e um autor pode escrever vários livros — crie uma tabela de associação. Cada livro pode ter vários exemplares físicos (1:N), e cada exemplar pertence a um único livro. Crie leitores (nome, e-mail) e uma tabela de empréstimos ligando cada exemplar emprestado a um leitor, com data do empréstimo.',
    summary: 'livros N:N autores (livro_autor) · livros 1:N exemplares · exemplares → empréstimos → leitores',
    expectedTables: ['livros', 'autores', 'livro_autor', 'exemplares', 'leitores', 'emprestimos'],
    unexpectedTables: ['biblioteca', 'catalogo', 'editoras'],
    tableChecks: {
      livros: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'titulo', constraints: ['notnull'] },
          { name: 'isbn', constraints: ['notnull'] },
        ],
        pk: ['id'],
        fk: [],
      },
      autores: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'nome', constraints: ['notnull'] },
        ],
        pk: ['id'],
        fk: [],
      },
      livro_autor: {
        columns: [
          { name: 'livro_id', constraints: ['pk', 'fk'] },
          { name: 'autor_id', constraints: ['pk', 'fk'] },
        ],
        pk: ['livro_id', 'autor_id'],
        fk: [
          { column: 'livro_id', references: 'livros' },
          { column: 'autor_id', references: 'autores' },
        ],
      },
      exemplares: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'livro_id', constraints: ['fk'] },
        ],
        pk: ['id'],
        fk: [{ column: 'livro_id', references: 'livros' }],
      },
      leitores: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'nome', constraints: ['notnull'] },
          { name: 'email', constraints: ['notnull'] },
        ],
        pk: ['id'],
        fk: [],
      },
      emprestimos: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'exemplar_id', constraints: ['fk'] },
          { name: 'leitor_id', constraints: ['fk'] },
          { name: 'data_emprestimo', constraints: ['notnull'] },
        ],
        pk: ['id'],
        fk: [
          { column: 'exemplar_id', references: 'exemplares' },
          { column: 'leitor_id', references: 'leitores' },
        ],
      },
    },
    junctionTables: {
      livro_autor: { connects: ['livros', 'autores'] },
    },
    hints: [
      'Comece com as entidades independentes: livros, autores e leitores, cada uma com PK própria.',
      'Livros e autores se relacionam N:N — crie "livro_autor" com livro_id e autor_id (PK composta + 2 FKs).',
      'Exemplares são cópias físicas de livros: 1 livro → N exemplares, FK livro_id em exemplares.',
      'Emprestimos conecta o mundo físico ao leitor: FK exemplar_id e FK leitor_id, com data do empréstimo não nula.',
    ],
    explanation: 'Este modelo encadeia 1:N (livro → exemplar → empréstimo) com um N:N rico (livro ↔ autor). Repare como o empréstimo referencia o exemplar — e não o livro: é a peça física que circula, nunca a obra abstrata.',
    evidence: 'Modelo de biblioteca: livro_autor resolve o N:N e a cadeia exemplares-empréstimos rastreia cada peça física.',
  },
  {
    id: 5,
    number: '05',
    title: 'Clínica Saúde+: Consultas com Atributos',
    concept: 'N:N com atributos na junção (data, status)',
    story: 'A Clínica Saúde+ atende pacientes com vários médicos, e a recepção precisa saber quando foi cada consulta e se ela foi concluída ou faltada.',
    requirements: 'A clínica tem pacientes (nome, CPF) e médicos (nome, CRM). Crie especialidades e cada médico tem exatamente uma especialidade. Médicos atendem vários pacientes e pacientes consultam vários médicos — mas toda consulta tem data/hora e um status (agendada, realizada, faltada). Modele consultas como entidade que carrega esses atributos, com FK para médico e para paciente.',
    summary: 'especialidades ← médicos · pacientes N:N médicos via consultas (atributos: data, status)',
    expectedTables: ['pacientes', 'medicos', 'especialidades', 'consultas'],
    unexpectedTables: ['hospital', 'medicamentos', 'enfermeiros'],
    tableChecks: {
      especialidades: {
        columns: [{ name: 'id', constraints: ['pk'] }],
        pk: ['id'],
        fk: [],
      },
      pacientes: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'nome', constraints: ['notnull'] },
          { name: 'cpf', constraints: ['notnull'] },
        ],
        pk: ['id'],
        fk: [],
      },
      medicos: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'nome', constraints: ['notnull'] },
          { name: 'crm', constraints: ['notnull'] },
          { name: 'especialidade_id', constraints: ['fk'] },
        ],
        pk: ['id'],
        fk: [{ column: 'especialidade_id', references: 'especialidades' }],
      },
      consultas: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'paciente_id', constraints: ['fk'] },
          { name: 'medico_id', constraints: ['fk'] },
          { name: 'data_hora', constraints: ['notnull'] },
          { name: 'status', constraints: ['notnull'] },
        ],
        pk: ['id'],
        fk: [
          { column: 'paciente_id', references: 'pacientes' },
          { column: 'medico_id', references: 'medicos' },
        ],
      },
    },
    hints: [
      'Três entidades independentes primeiro: pacientes, medicos e especialidades, cada uma com PK.',
      'Cada médico tem exatamente uma especialidade — 1:N com FK especialidade_id em medicos.',
      'Paciente consulta vários médicos e médico atende vários pacientes — isso sugere uma junção N:N.',
      'Mas a relação carrega dados próprios (data/hora e status) — então a junção vira entidade: "consultas" com FKs para paciente e médico e PK simples com id.',
    ],
    explanation: 'Quando a relação N:N carrega atributos que pertencem ao relacionamento (data, status, valor), ela é promovida a entidade própria. "Consultas" é esse caso clássico: a tabela resolve o N:N e guarda os fatos do atendimento.',
    evidence: 'Tabela consultas materializa o N:N paciente-médico com atributos de data e status — N:N rico modelado como entidade.',
  },
  {
    id: 6,
    number: '06',
    title: 'StreamMax: Plataforma de Streaming',
    concept: 'Modelo grande: hierarquia 1:N + N:N múltiplos',
    story: 'A startup StreamMax quer sair do planilhão e criar o catálogo e a gestão de contas da plataforma. É o desafio final: um modelo de verdade.',
    requirements: 'A plataforma tem contas de assinatura, e cada conta pode ter vários perfis de usuário (1:N). Há filmes e séries; séries possuem episódios (1:N). Perfis assistem vários filmes e um filme pode ser assistido por vários perfis — crie uma tabela "assistiu" para registrar. Por fim, contas podem marcar filmes como favoritos (N:N): crie uma tabela "favoritos" ligando conta a filme.',
    summary: 'contas 1:N perfis · series 1:N episodios · perfis N:N filmes (assistiu) · contas N:N filmes (favoritos)',
    expectedTables: ['contas', 'perfis', 'filmes', 'series', 'episodios', 'assistiu', 'favoritos'],
    unexpectedTables: ['usuarios', 'generos', 'categorias', 'temporadas'],
    tableChecks: {
      contas: {
        columns: [{ name: 'id', constraints: ['pk'] }],
        pk: ['id'],
        fk: [],
      },
      perfis: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'nome', constraints: ['notnull'] },
          { name: 'conta_id', constraints: ['fk'] },
        ],
        pk: ['id'],
        fk: [{ column: 'conta_id', references: 'contas' }],
      },
      filmes: {
        columns: [{ name: 'id', constraints: ['pk'] }],
        pk: ['id'],
        fk: [],
      },
      series: {
        columns: [{ name: 'id', constraints: ['pk'] }],
        pk: ['id'],
        fk: [],
      },
      episodios: {
        columns: [
          { name: 'id', constraints: ['pk'] },
          { name: 'titulo', constraints: ['notnull'] },
          { name: 'serie_id', constraints: ['fk'] },
        ],
        pk: ['id'],
        fk: [{ column: 'serie_id', references: 'series' }],
      },
      assistiu: {
        columns: [
          { name: 'perfil_id', constraints: ['pk', 'fk'] },
          { name: 'filme_id', constraints: ['pk', 'fk'] },
        ],
        pk: ['perfil_id', 'filme_id'],
        fk: [
          { column: 'perfil_id', references: 'perfis' },
          { column: 'filme_id', references: 'filmes' },
        ],
      },
      favoritos: {
        columns: [
          { name: 'conta_id', constraints: ['pk', 'fk'] },
          { name: 'filme_id', constraints: ['pk', 'fk'] },
        ],
        pk: ['conta_id', 'filme_id'],
        fk: [
          { column: 'conta_id', references: 'contas' },
          { column: 'filme_id', references: 'filmes' },
        ],
      },
    },
    junctionTables: {
      assistiu: { connects: ['perfis', 'filmes'] },
      favoritos: { connects: ['contas', 'filmes'] },
    },
    hints: [
      'Divida o problema em blocos: contas/perfis (hierarquia), catálogo (filmes/series/episodios) e depois os relacionamentos.',
      'Contas → perfis e series → episódios são dois 1:N independentes: FK conta_id em perfis e FK serie_id em episódios.',
      'Perfis assistem vários filmes — N:N resolvido com a tabela "assistiu" (perfil_id + filme_id).',
      'Contas marcam favoritos de filmes — outro N:N: tabela "favoritos" (conta_id + filme_id), com PK composta e 2 FKs.',
    ],
    explanation: 'Modelos grandes se constroem por blocos: hierarquias 1:N primeiro (contas-perfis, series-episodios), depois as junções N:N (assistiu, favoritos). Duas junções distintas sobre a mesma entidade "filmes" mostram que FKs identificam papéis diferentes — um filme é "assistido por perfis" e "favoritado por contas".',
    evidence: 'Modelo StreamMax entregue: duas hierarquias 1:N e duas junções N:N sobre o catálogo de filmes — modelagem completa.',
  },
];

export function getTotalLevels() {
  return SCHEMA_CHALLENGES.length;
}

/** Retorna o desafio por id numérico ou null. */
export function getSchemaChallengeById(id) {
  return SCHEMA_CHALLENGES.find(challenge => challenge.id === id) || null;
}

export const TOTAL_SCHEMA_CHALLENGES = SCHEMA_CHALLENGES.length;
