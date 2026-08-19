/**
 * test_schema_builder.js — Testes do modo Construtor de Schema.
 *
 * Executa com: node test/test_schema_builder.js
 * Requer: npm install sql.js
 *
 * Para CADA desafio:
 * - Modelo correto (cria todas as tabelas com PKs, FKs e cardinalidades) → SB_FEEDBACK_CORRECT
 * - Modelo incompleto (falta tabela/chave) → incomplete/missing_*
 * - Modelo com tabela auxiliar → continua válido
 * - SQL inválido → sql_error
 * - Comandos bloqueados (DROP, DELETE…) → blocked
 *
 * Também valida integridade dos dados dos desafios (campos obrigatórios).
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { loadExecutor, loadSchemaBuilderChallenges, loadSchemaBuilderValidator } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

// === Carrega módulos reais ===
const executor = loadExecutor();
const validator = loadSchemaBuilderValidator(executor.executeQuery);
const challenges = loadSchemaBuilderChallenges();

const { validateSchemaChallenge, SB_FEEDBACK_CORRECT, SB_FEEDBACK_INCOMPLETE,
        SB_FEEDBACK_SQL_ERROR, SB_FEEDBACK_BLOCKED, SB_FEEDBACK_MISSING_TABLE,
        SB_FEEDBACK_UNEXPECTED_TABLE, SB_FEEDBACK_MISSING_PK, SB_FEEDBACK_MISSING_FK,
        SB_FEEDBACK_MISSING_JUNCTION, SB_FEEDBACK_CONSTRAINT_MISSING,
        executeMultipleStatements, findForbiddenKeyword, splitStatements,
        getCreatedTableName, getDroppedTableName, getCreatedTableNames, mergeSchemaStatements,
        splitSchemaModelStatements,
        getExistingTables } = validator;

/**
 * Remove as FKs mantendo o DDL válido: apaga a cláusula e a vírgula que a precede.
 * @param {string} ddl
 * @returns {string}
 */
function stripForeignKeys(ddl) {
  return ddl.replace(/,\s*FOREIGN KEY\s*\([^)]*\)\s*REFERENCES\s*\w+\s*\([^)]*\)/gi, '');
}

/**
 * Remove as PKs mantendo o DDL válido (tanto de coluna quanto compostas).
 * @param {string} ddl
 * @returns {string}
 */
function stripPrimaryKeys(ddl) {
  return ddl
    .replace(/\s+PRIMARY\s+KEY\b(?!\s*\()/gi, '')
    .replace(/,\s*PRIMARY\s+KEY\s*\([^)]*\)/gi, '')
    .replace(/PRIMARY\s+KEY\s*\([^)]*\)\s*,\s*/gi, '');
}

/** Cria um banco vazio com foreign_keys habilitado. */
function freshDB(SQL) {
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  return db;
}

// === Modelos de solução por desafio ===

function ddlChallenge1() {
  return `
    CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
    CREATE TABLE funcionarios (
      id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cargo TEXT NOT NULL,
      departamento_id INTEGER,
      FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
    );
  `;
}

function ddlChallenge2() {
  return ddlChallenge1() + `
    CREATE TABLE projetos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, prazo TEXT NOT NULL);
    CREATE TABLE funcionario_projeto (
      funcionario_id INTEGER, projeto_id INTEGER,
      PRIMARY KEY (funcionario_id, projeto_id),
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
      FOREIGN KEY (projeto_id) REFERENCES projetos(id)
    );
  `;
}

function ddlChallenge3() {
  return `
    CREATE TABLE turmas (id INTEGER PRIMARY KEY, serie TEXT NOT NULL, ano_letivo TEXT NOT NULL);
    CREATE TABLE alunos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, turma_id INTEGER,
      FOREIGN KEY (turma_id) REFERENCES turmas(id));
    CREATE TABLE disciplinas (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
    CREATE TABLE matricula (
      aluno_id INTEGER, disciplina_id INTEGER,
      PRIMARY KEY (aluno_id, disciplina_id),
      FOREIGN KEY (aluno_id) REFERENCES alunos(id),
      FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id)
    );
  `;
}

function ddlChallenge4() {
  return `
    CREATE TABLE livros (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, isbn TEXT NOT NULL);
    CREATE TABLE autores (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
    CREATE TABLE livro_autor (
      livro_id INTEGER, autor_id INTEGER,
      PRIMARY KEY (livro_id, autor_id),
      FOREIGN KEY (livro_id) REFERENCES livros(id),
      FOREIGN KEY (autor_id) REFERENCES autores(id)
    );
    CREATE TABLE exemplares (id INTEGER PRIMARY KEY, livro_id INTEGER,
      FOREIGN KEY (livro_id) REFERENCES livros(id));
    CREATE TABLE leitores (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL);
    CREATE TABLE emprestimos (
      id INTEGER PRIMARY KEY, exemplar_id INTEGER, leitor_id INTEGER, data_emprestimo TEXT NOT NULL,
      FOREIGN KEY (exemplar_id) REFERENCES exemplares(id),
      FOREIGN KEY (leitor_id) REFERENCES leitores(id)
    );
  `;
}

function ddlChallenge5() {
  return `
    CREATE TABLE especialidades (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
    CREATE TABLE pacientes (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cpf TEXT NOT NULL);
    CREATE TABLE medicos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, crm TEXT NOT NULL,
      especialidade_id INTEGER,
      FOREIGN KEY (especialidade_id) REFERENCES especialidades(id));
    CREATE TABLE consultas (
      id INTEGER PRIMARY KEY, paciente_id INTEGER, medico_id INTEGER,
      data_hora TEXT NOT NULL, status TEXT NOT NULL,
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
      FOREIGN KEY (medico_id) REFERENCES medicos(id)
    );
  `;
}

function ddlChallenge6() {
  return `
    CREATE TABLE contas (id INTEGER PRIMARY KEY, email TEXT NOT NULL);
    CREATE TABLE perfis (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, conta_id INTEGER,
      FOREIGN KEY (conta_id) REFERENCES contas(id));
    CREATE TABLE filmes (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, ano INTEGER);
    CREATE TABLE series (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL);
    CREATE TABLE episodios (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, serie_id INTEGER,
      FOREIGN KEY (serie_id) REFERENCES series(id));
    CREATE TABLE assistiu (
      perfil_id INTEGER, filme_id INTEGER,
      PRIMARY KEY (perfil_id, filme_id),
      FOREIGN KEY (perfil_id) REFERENCES perfis(id),
      FOREIGN KEY (filme_id) REFERENCES filmes(id)
    );
    CREATE TABLE favoritos (
      conta_id INTEGER, filme_id INTEGER,
      PRIMARY KEY (conta_id, filme_id),
      FOREIGN KEY (conta_id) REFERENCES contas(id),
      FOREIGN KEY (filme_id) REFERENCES filmes(id)
    );
  `;
}

const SOLUTIONS = {
  1: ddlChallenge1,
  2: ddlChallenge2,
  3: ddlChallenge3,
  4: ddlChallenge4,
  5: ddlChallenge5,
  6: ddlChallenge6,
};

async function run() {
  const wasmPath = path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) });

  // ====== Integridade dos dados ======
  console.log('\n=== Integridade dos desafios ===');
  const all = challenges.SCHEMA_CHALLENGES || [];
  assert(Array.isArray(all) && all.length === 6,
    `Existem ${all.length} desafios registrados (esperado 6)`);
  assert(challenges.getTotalLevels() === 6, 'getTotalLevels() === 6');

  const ids = new Set();
  for (const ch of all) {
    assert(ch.id && ch.number && ch.title && ch.concept && ch.story &&
           ch.requirements && ch.summary && Array.isArray(ch.expectedTables) &&
           ch.expectedTables.length > 0 && typeof ch.tableChecks === 'object' &&
           ch.tableChecks !== null && Array.isArray(ch.hints) && ch.hints.length >= 4 &&
           ch.explanation && ch.evidence,
      `[${ch.id}] campos obrigatórios presentes`);
    assert(!ids.has(ch.id), `[${ch.id}] id único`);
    ids.add(ch.id);
  }

  // ====== Cada desafio contra sua solução ======
  console.log('\n=== Validação por desafio ===');
  for (const ch of all) {
    console.log(`\n--- ${ch.title} ---`);
    const db = freshDB(SQL);

    // 1. Solução completa → correct
    console.log(`[${ch.id}.1] Modelo completo`);
    const r1 = validateSchemaChallenge(SOLUTIONS[ch.id](), ch, db);
    assert(r1.type === SB_FEEDBACK_CORRECT, `solução completa → ${r1.type} (esperado correct)`);

    // 2. Sem a primeira tabela esperada → missing_table
    console.log(`[${ch.id}.2] Tabela principal ausente`);
    const firstTable = ch.expectedTables[0];
    const ddlWithoutFirst = SOLUTIONS[ch.id]().replace(
      new RegExp(`CREATE TABLE\\s+${firstTable}[^;]*;`, 'i'), '');
    const r2 = validateSchemaChallenge(ddlWithoutFirst, ch, freshDB(SQL));
    assert(r2.type === SB_FEEDBACK_MISSING_TABLE || r2.type === SB_FEEDBACK_INCOMPLETE,
      `tabela ${firstTable} ausente → ${r2.type} (esperado missing_table/incomplete)`);

    // 3. Tabelas auxiliares são permitidas para apoiar o Diagrama ER.
    console.log(`[${ch.id}.3] Tabela auxiliar`);
    const unexpectedName = (ch.unexpectedTables && ch.unexpectedTables[0]) || 'tabela_estranha';
    const r3 = validateSchemaChallenge(SOLUTIONS[ch.id]() +
      `CREATE TABLE ${unexpectedName} (id INTEGER PRIMARY KEY);`, ch, freshDB(SQL));
    assert(r3.type === SB_FEEDBACK_CORRECT,
      `tabela auxiliar ${unexpectedName} é tolerada → ${r3.type}`);

    // 4. SQL inválido → sql_error
    console.log(`[${ch.id}.4] SQL inválido`);
    const r4 = validateSchemaChallenge('CREATE TABELA errada (id INTEGER PRIMARY KEY;', ch, freshDB(SQL));
    assert(r4.type === SB_FEEDBACK_SQL_ERROR, `sql inválido → ${r4.type} (esperado sql_error)`);

    // 5. Comando bloqueado → blocked
    console.log(`[${ch.id}.5] Comando bloqueado`);
    const r5 = validateSchemaChallenge('DROP TABLE usuarios;', ch, freshDB(SQL));
    assert(r5.type === SB_FEEDBACK_BLOCKED, `DROP bloqueado → ${r5.type} (esperado blocked)`);

    // 6. Sem FK no lado N → missing_fk.
    // O DDL precisa continuar VÁLIDO: se a remoção das FKs deixar vírgulas
    // penduradas, o resultado vira sql_error e o caminho missing_fk nunca é testado.
    console.log(`[${ch.id}.6] Sem chave estrangeira`);
    const ddlNoFk = stripForeignKeys(SOLUTIONS[ch.id]());
    const dbNoFk = freshDB(SQL);
    const applyNoFk = executeMultipleStatements(ddlNoFk, dbNoFk);
    assert(applyNoFk.errors.length === 0,
      `DDL sem FKs continua sintaticamente válido${applyNoFk.errors.length ? ' — ' + applyNoFk.errors[0].message : ''}`);
    const r6 = validateSchemaChallenge(ddlNoFk, ch, dbNoFk, { applyDdl: false });
    assert(r6.type === SB_FEEDBACK_MISSING_FK,
      `sem FKs → ${r6.type} (esperado missing_fk)`);

    // 7. N:N exige junção com duas FKs → missing_junction (desafios 2-6 com N:N)
    if (Object.keys(ch.junctionTables || {}).length > 0) {
      console.log(`[${ch.id}.7] Tabela de junção ausente`);
      let ddlNoJunction = SOLUTIONS[ch.id]();
      const junctionName = Object.keys(ch.junctionTables)[0];
      ddlNoJunction = ddlNoJunction.replace(
        new RegExp(`CREATE TABLE\\s+${junctionName}[^;]*;`, 'i'), '');
      const r7 = validateSchemaChallenge(ddlNoJunction, ch, freshDB(SQL));
      assert(r7.type === SB_FEEDBACK_MISSING_JUNCTION,
        `junção ${junctionName} ausente → ${r7.type} (esperado missing_junction)`);
    }

    // 8. Sem PK na tabela principal → missing_pk (com DDL válido, ver nota acima).
    console.log(`[${ch.id}.8] Sem chave primária`);
    const ddlNoPk = stripPrimaryKeys(SOLUTIONS[ch.id]());
    const dbNoPk = freshDB(SQL);
    const applyNoPk = executeMultipleStatements(ddlNoPk, dbNoPk);
    assert(applyNoPk.errors.length === 0,
      `DDL sem PKs continua sintaticamente válido${applyNoPk.errors.length ? ' — ' + applyNoPk.errors[0].message : ''}`);
    const r8 = validateSchemaChallenge(ddlNoPk, ch, dbNoPk, { applyDdl: false });
    assert(r8.type === SB_FEEDBACK_MISSING_PK,
      `sem PK → ${r8.type} (esperado missing_pk)`);
  }

  // ====== Regressões dos bugs encontrados na avaliação ======
  console.log('\n=== Regressões: sanitização de comandos ===');
  const ch1 = all[0];

  // BUG: ON DELETE/UPDATE CASCADE fazia o validador ler DELETE/UPDATE como DML.
  const ddlCascade = `
    CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);
    CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cargo TEXT NOT NULL,
      departamento_id INTEGER,
      FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE);`;
  const rCascade = validateSchemaChallenge(ddlCascade, ch1, freshDB(SQL));
  assert(rCascade.type === SB_FEEDBACK_CORRECT,
    `FK com ON DELETE CASCADE é aceita → ${rCascade.type} (esperado correct)`);

  const rCascadeUpdate = validateSchemaChallenge(
    ddlCascade.replace('ON DELETE CASCADE', 'ON UPDATE SET NULL'), ch1, freshDB(SQL));
  assert(rCascadeUpdate.type === SB_FEEDBACK_CORRECT,
    `FK com ON UPDATE SET NULL é aceita → ${rCascadeUpdate.type} (esperado correct)`);

  // BUG: palavra proibida dentro de comentário bloqueava um DDL legítimo.
  const rComment = validateSchemaChallenge(
    `-- ainda vou INSERT os dados de teste depois
     /* nada de DROP aqui */
     ${ddlChallenge1()}`, ch1, freshDB(SQL));
  assert(rComment.type === SB_FEEDBACK_CORRECT,
    `palavra proibida em comentário não bloqueia → ${rComment.type} (esperado correct)`);

  // Comandos realmente proibidos continuam bloqueados.
  for (const bad of ['DROP TABLE departamentos;', 'DELETE FROM departamentos;',
                     "INSERT INTO departamentos VALUES (1, 'x');", 'ALTER TABLE departamentos RENAME TO d;']) {
    const rBad = validateSchemaChallenge(bad, ch1, freshDB(SQL));
    assert(rBad.type === SB_FEEDBACK_BLOCKED, `"${bad}" continua bloqueado → ${rBad.type}`);
  }

  console.log('\n=== Regressões: fluxo incremental (uma tabela por execução) ===');

  // BUG: o app reaplicava o DDL já acumulado e quebrava com "already exists"
  // na segunda execução. O modelo acumulado precisa ser idempotente.
  const incDb = freshDB(SQL);
  let model = [];
  const runStep = (typed) => {
    model = mergeSchemaStatements(model, typed);
    const ddl = model.join('\n');
    const stepDb = freshDB(SQL);
    const { errors } = executeMultipleStatements(ddl, stepDb);
    return { errors, feedback: validateSchemaChallenge(ddl, ch1, stepDb, { applyDdl: false }), ddl };
  };

  const step1 = runStep(
    'CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL) -- primeira tabela'
  );
  assert(step1.errors.length === 0, 'execução 1 (departamentos) aplica sem erro');
  assert(step1.feedback.type === SB_FEEDBACK_MISSING_TABLE,
    `execução 1 → ${step1.feedback.type} (esperado missing_table)`);

  // O jogador limpa o editor e envia apenas a segunda tabela, também sem ';'.
  const step2 = runStep(`CREATE TABLE funcionarios (
    id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cargo TEXT NOT NULL,
    departamento_id INTEGER, FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
  )`);
  assert(step2.errors.length === 0,
    `execução 2 sem ponto e vírgula preserva a fronteira dos CREATE${step2.errors.length ? ' — ' + step2.errors[0].message : ''}`);
  assert(step2.feedback.type === SB_FEEDBACK_CORRECT,
    `execução 2 conclui o modelo → ${step2.feedback.type} (esperado correct)`);

  // Rodar de novo sem digitar nada é idempotente.
  const step3 = runStep(step2.ddl);
  assert(step3.errors.length === 0 && step3.feedback.type === SB_FEEDBACK_CORRECT,
    `reexecutar o mesmo modelo é idempotente → ${step3.feedback.type}`);
  assert(model.length === 2, `modelo acumulado não duplica instruções (${model.length} instruções)`);

  // Versões antigas podiam persistir dois CREATEs sem delimitador dentro do
  // mesmo item. A migração precisa recuperar as duas fronteiras sem reset.
  const legacyModel = mergeSchemaStatements([
    `CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL)
     CREATE TABLE funcionarios (id INTEGER PRIMARY KEY)`
  ], 'CREATE TABLE funcionarios (id INTEGER PRIMARY KEY AUTOINCREMENT);');
  const legacyDb = freshDB(SQL);
  const legacyDdl = legacyModel.join('\n');
  const legacyRun = executeMultipleStatements(legacyDdl, legacyDb);
  assert(legacyModel.length === 2, `bloco legado vira 2 instruções (${legacyModel.length})`);
  assert(legacyRun.errors.length === 0,
    `AUTOINCREMENT após modelo legado executa sem near CREATE${legacyRun.errors.length ? ' — ' + legacyRun.errors[0].message : ''}`);

  // Redefinir uma tabela substitui a definição anterior (corrigir sem recomeçar).
  const corrigido = mergeSchemaStatements(
    ['CREATE TABLE departamentos (id INTEGER);'],
    'CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL);');
  assert(corrigido.length === 1 && /PRIMARY KEY/.test(corrigido[0]),
    'redefinir uma tabela substitui a definição anterior');

  console.log('\n=== Regressões: parsing de instruções ===');
  assert(splitStatements("CREATE TABLE a (nome TEXT DEFAULT 'x;y');").length === 1,
    "';' dentro de literal não divide instrução");
  assert(splitStatements('CREATE TABLE a (id INT); -- comentário; com ponto e vírgula').length === 1,
    "';' dentro de comentário não vira instrução");
  assert(getCreatedTableName('CREATE TABLE IF NOT EXISTS "minha_tabela" (id INT);') === 'minha_tabela',
    'getCreatedTableName lê nome com aspas e IF NOT EXISTS');
  assert(getCreatedTableName('SELECT * FROM departamentos;') === null,
    'getCreatedTableName ignora consultas');
  assert(getDroppedTableName('DROP TABLE IF EXISTS "turma";') === 'turma',
    'getDroppedTableName le DROP TABLE com IF EXISTS e aspas');
  const createThenDrop = splitSchemaModelStatements(
    'CREATE TABLE turmas (id INT PRIMARY KEY)\nDROP TABLE turma');
  assert(createThenDrop.length === 2 && getDroppedTableName(createThenDrop[1]) === 'turma',
    'DROP TABLE sem ponto e virgula anterior vira uma instrucao separada');

  // BUG: o checklist procurava o nome da tabela no texto do DDL, então uma tabela
  // apenas citada numa FK aparecia como "criada".
  const criadas = getCreatedTableNames(
    'CREATE TABLE funcionarios (id INT, departamento_id INT, FOREIGN KEY (departamento_id) REFERENCES departamentos(id));');
  assert(criadas.length === 1 && criadas[0] === 'funcionarios',
    `checklist conta só tabelas criadas, não as citadas em FK (${JSON.stringify(criadas)})`);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TOTAL: ${passed + failed} testes — ${passed} passaram, ${failed} falharam`);
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
