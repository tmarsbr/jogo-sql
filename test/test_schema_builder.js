/**
 * test_schema_builder.js — Testes do modo Construtor de Schema.
 *
 * Executa com: node test/test_schema_builder.js
 * Requer: npm install sql.js
 *
 * Para CADA desafio:
 * - Modelo correto (cria todas as tabelas com PKs, FKs e cardinalidades) → SB_FEEDBACK_CORRECT
 * - Modelo incompleto (falta tabela/chave) → incomplete/missing_*
 * - Modelo com tabela não esperada → unexpected_table
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
        SB_FEEDBACK_MISSING_JUNCTION } = validator;

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

    // 3. Tabela não esperada → unexpected_table
    console.log(`[${ch.id}.3] Tabela não esperada`);
    const unexpectedName = (ch.unexpectedTables && ch.unexpectedTables[0]) || 'tabela_estranha';
    const r3 = validateSchemaChallenge(SOLUTIONS[ch.id]() +
      `CREATE TABLE ${unexpectedName} (id INTEGER PRIMARY KEY);`, ch, freshDB(SQL));
    if ((ch.unexpectedTables || []).length === 0) {
      // Sem lista de proibidas, qualquer tabela extra é tolerada.
      assert(r3.type === SB_FEEDBACK_CORRECT,
        `tabela extra tolerada (sem lista de proibidas) → ${r3.type}`);
    } else {
      assert(r3.type === SB_FEEDBACK_UNEXPECTED_TABLE,
        `tabela ${unexpectedName} → ${r3.type} (esperado unexpected_table)`);
    }

    // 4. SQL inválido → sql_error
    console.log(`[${ch.id}.4] SQL inválido`);
    const r4 = validateSchemaChallenge('CREATE TABELA errada (id INTEGER PRIMARY KEY;', ch, freshDB(SQL));
    assert(r4.type === SB_FEEDBACK_SQL_ERROR, `sql inválido → ${r4.type} (esperado sql_error)`);

    // 5. Comando bloqueado → blocked
    console.log(`[${ch.id}.5] Comando bloqueado`);
    const r5 = validateSchemaChallenge('DROP TABLE usuarios;', ch, freshDB(SQL));
    assert(r5.type === SB_FEEDBACK_BLOCKED, `DROP bloqueado → ${r5.type} (esperado blocked)`);

    // 6. Sem FK no lado N → missing_fk/incomplete
    console.log(`[${ch.id}.6] Sem chave estrangeira`);
    let ddlNoFk = SOLUTIONS[ch.id]();
    ddlNoFk = ddlNoFk.replace(/FOREIGN KEY\s*\([^)]*\)\s*REFERENCES\s*\w+\s*\([^)]*\),?/gi, '');
    const r6 = validateSchemaChallenge(ddlNoFk, ch, freshDB(SQL));
    assert(r6.type !== SB_FEEDBACK_CORRECT,
      `sem FKs não deve ser accepted → ${r6.type} (esperado ≠ correct)`);

    // 7. N:N exige junção com duas FKs → missing_junction (desafios 2-6 com N:N)
    if (Object.keys(ch.junctionTables || {}).length > 0) {
      console.log(`[${ch.id}.7] Tabela de junção ausente`);
      let ddlNoJunction = SOLUTIONS[ch.id]();
      const junctionName = Object.keys(ch.junctionTables)[0];
      ddlNoJunction = ddlNoJunction.replace(
        new RegExp(`CREATE TABLE\\s+${junctionName}[^;]*;`, 'i'), '');
      const r7 = validateSchemaChallenge(ddlNoJunction, ch, freshDB(SQL));
      assert(r7.type === SB_FEEDBACK_MISSING_JUNCTION || r7.type === SB_FEEDBACK_MISSING_TABLE,
        `junção ${junctionName} ausente → ${r7.type} (esperado missing_junction/missing_table)`);
    }

    // 8. Sem PK na tabela principal → missing_pk
    console.log(`[${ch.id}.8] Sem chave primária`);
    let ddlNoPk = SOLUTIONS[ch.id]();
    // Remove declarações de PK de coluna única (id INTEGER PRIMARY KEY → id INTEGER)
    // e linhas de PK composta (PRIMARY KEY (a, b),) sem quebrar a sintaxe.
    ddlNoPk = ddlNoPk.replace(/\b(\w+)\s+(INTEGER|TEXT|REAL)\s+PRIMARY\s+KEY\b/i, '$1 $2');
    ddlNoPk = ddlNoPk.replace(/PRIMARY\s+KEY\s*\([^)]*\)\s*,?\s*\n?/gi, '');
    ddlNoPk = ddlNoPk.replace(/,\s*\)/g, ')'); // limpa vírgulas penduradas
    const r8 = validateSchemaChallenge(ddlNoPk, ch, freshDB(SQL));
    assert(r8.type === SB_FEEDBACK_MISSING_PK || r8.type === SB_FEEDBACK_INCOMPLETE || r8.type === SB_FEEDBACK_SQL_ERROR,
      `sem PK → ${r8.type} (esperado missing_pk/incomplete/sql_error)`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TOTAL: ${passed + failed} testes — ${passed} passaram, ${failed} falharam`);
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
