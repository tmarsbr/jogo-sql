/**
 * test_bug_hunter.js — Testes do validador do modo Bug Hunter.
 *
 * Executa com: node test/test_bug_hunter.js
 * Requer: npm install sql.js
 *
 * Para CADA desafio:
 * - A solução correta (correctQuery) → FEEDBACK_CORRECT
 * - Soluções equivalentes (variações válidas) → FEEDBACK_CORRECT quando aplicável
 * - A query quebrada (buggyQuery) → FEEDBACK_BUG_NOT_FIXED ou erro de SQL
 * - Query com erro de sintaxe → FEEDBACK_SQL_ERROR
 * - Comando bloqueado → FEEDBACK_BLOCKED
 * - Query com resultado incorreto → FEEDBACK_WRONG_RESULT
 *
 * Também valida integridade dos dados dos desafios (campos obrigatórios).
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { loadExecutor, loadBugHunterChallenges, loadBugHunterValidator, loadSeedData } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

// === Carrega módulos reais ===
const executor = loadExecutor();
const validator = loadBugHunterValidator(executor.executeQuery);
const challenges = loadBugHunterChallenges();
const { SCHEMA_SQL, SEED_SQL } = loadSeedData();

const { validateBugChallenge, isIdenticalToBuggy, BH_FEEDBACK_CORRECT, BH_FEEDBACK_SQL_ERROR,
        BH_FEEDBACK_BLOCKED, BH_FEEDBACK_WRONG_RESULT, BH_FEEDBACK_BUG_NOT_FIXED } = validator;

// Desafios com variantes corretas equivalentes aceitas
const EQUIVALENT_SOLUTIONS = {
  'bug-2': [
    // Bug-2: tabela errada (funcionarios → logs_acesso); variante usa H (integer hour) e sem ORDER BY
    "SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 22;",
  ],
  'bug-3': [
    // Bug-3: HAVING onde deveria ser WHERE; variante mantém o JOIN e remove GROUP BY
    "SELECT f.nome, t.valor_centavos FROM transacoes t JOIN funcionarios f ON t.operador_funcionario_id = f.id WHERE t.valor_centavos > 5000000 ORDER BY t.id;",
  ],
  'bug-8': [
    // Bug-8: centavos → reais
    "SELECT nome, salario_centavos / 100.0 AS salario_reais FROM funcionarios WHERE departamento_id = 1 ORDER BY id;",
  ],
  'bug-9': [
    // Bug-9: CROSS JOIN implícito → INNER JOIN explícito; variante com JOIN (sem INNER) e sem ORDER BY
    "SELECT t.id AS transacao_id, c.banco FROM transacoes t JOIN contas c ON t.conta_destino_id = c.id WHERE t.valor_centavos > 5000000;",
  ],
};

async function run() {
  const wasmPath = path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) });

  // ====== Testes de integridade dos dados ======
  console.log('\n=== Integridade dos desafios ===');
  const allChallenges = challenges.BUG_CHALLENGES || [];
  assert(Array.isArray(allChallenges) && allChallenges.length >= 10,
    `Existem ${allChallenges.length} desafios registrados (esperado ≥ 10)`);

  const ids = new Set();
  for (const ch of allChallenges) {
    assert(['sintaxe', 'logica', 'performance', 'logica+performance'].includes(ch.bugType),
      `[${ch.id}] bugType válido: ${ch.bugType}`);
    assert(ch.id && ch.number && ch.title && ch.buggyQuery && ch.correctQuery &&
           ch.referenceQuery && ch.expectedResultQuery && ch.bugs && ch.bugs.length > 0,
      `[${ch.id}] campos obrigatórios presentes`);
    assert(!ids.has(ch.id), `[${ch.id}] id único`);
    ids.add(ch.id);
  }

  // ====== Testes funcionais por desafio ======
  console.log('\n=== Testes por desafio ===');
  let db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  db.run(SCHEMA_SQL);
  db.run(SEED_SQL);

  // Snapshot inicial: recria o banco para cada desafio (DDL de performance altera o estado)
  for (const ch of allChallenges) {
    console.log(`\n--- ${ch.id}: ${ch.title} (${ch.bugType}) ---`);

    // Recria o banco limpo
    db.close();
    const fresh = new SQL.Database();
    fresh.run('PRAGMA foreign_keys = ON;');
    fresh.run(SCHEMA_SQL);
    fresh.run(SEED_SQL);

    // 1. A solução canônica deve ser correta
    console.log(`[${ch.id}.1] Solução canônica (correctQuery)`);
    let r = validateBugChallenge(ch.correctQuery, ch, fresh);
    assert(r.type === BH_FEEDBACK_CORRECT, `correctQuery → ${r.type} (esperado correct)`);

    // 2. Variante equivalente, quando definida
    const variants = EQUIVALENT_SOLUTIONS[ch.id] || [];
    for (let i = 0; i < variants.length; i++) {
      console.log(`[${ch.id}.2.${i + 1}] Solução equivalente`);
      const r2 = validateBugChallenge(variants[i], ch, fresh);
      assert(r2.type === BH_FEEDBACK_CORRECT, `equivalente → ${r2.type} (esperado correct)`);
    }

    // 3. A query quebrada original não pode ser aceita
    console.log(`[${ch.id}.3] Query quebrada original (buggyQuery)`);
    const r3 = validateBugChallenge(ch.buggyQuery, ch, fresh);
    assert(r3.type === BH_FEEDBACK_BUG_NOT_FIXED || r3.type === BH_FEEDBACK_SQL_ERROR ||
           r3.type === BH_FEEDBACK_WRONG_RESULT,
      `buggyQuery → ${r3.type} (esperado bug_not_fixed/sql_error/wrong_result)`);

    // 4. Erro de sintaxe arbitrário → sql_error
    console.log(`[${ch.id}.4] Query com erro de sintaxe`);
    const r4 = validateBugChallenge('SELECT nome FORM funcionarios;', ch, fresh);
    assert(r4.type === BH_FEEDBACK_SQL_ERROR, `sintaxe inválida → ${r4.type} (esperado sql_error)`);

    // 5. Comando bloqueado → blocked
    console.log(`[${ch.id}.5] Comando bloqueado (DROP TABLE)`);
    const r5 = validateBugChallenge('DROP TABLE funcionarios;', ch, fresh);
    assert(r5.type === BH_FEEDBACK_BLOCKED, `DROP bloqueado → ${r5.type} (esperado blocked)`);

    // 6. Resultado incorreto (consulta válida mas com filtro errado) → wrong_result
    if (ch.id !== 'bug-7') {
      console.log(`[${ch.id}.6] Resultado incorreto (filtro diferente)`);
      const r6 = validateBugChallenge('SELECT nome, cargo FROM funcionarios WHERE id = 999999 ORDER BY id;', ch, fresh);
      assert(r6.type === BH_FEEDBACK_WRONG_RESULT, `filtro errado → ${r6.type} (esperado wrong_result)`);
    } else {
      console.log(`[${ch.id}.6] Resultado incorreto (índice criado, mas com o nome errado)`);
      // A conferência do desafio exige o índice com o nome exato 'idx_transacoes_origem';
      // criar um índice válido porém com outro nome deve reprovar a missão.
      // Banco isolado para não contaminar checks posteriores (índice duplicado).
      db.close();
      const isolated = new SQL.Database();
      isolated.run('PRAGMA foreign_keys = ON;');
      isolated.run(SCHEMA_SQL);
      isolated.run(SEED_SQL);
      const r6 = validateBugChallenge("CREATE INDEX idx_outro ON transacoes(conta_origem_id);", ch, isolated);
      assert(r6.type === BH_FEEDBACK_WRONG_RESULT, `índice com nome errado → ${r6.type} (esperado wrong_result)`);
      // Banco isolado: índice com o nome certo deve ser aceito.
      isolated.close();
      const isolated2 = new SQL.Database();
      isolated2.run('PRAGMA foreign_keys = ON;');
      isolated2.run(SCHEMA_SQL);
      isolated2.run(SEED_SQL);
      const r6b = validateBugChallenge("CREATE INDEX idx_transacoes_origem ON transacoes(conta_origem_id);", ch, isolated2);
      assert(r6b.type === BH_FEEDBACK_CORRECT, `índice correto (mesmo nome) → ${r6b.type} (esperado correct)`);
      // Retorna ao banco padrão para os checks restantes
      fresh.close();
      db = new SQL.Database();
      db.run('PRAGMA foreign_keys = ON;');
      db.run(SCHEMA_SQL);
      db.run(SEED_SQL);
    }

    // 7. isIdenticalToBuggy cobre variações triviais (whitespace, case, ponto e vírgula)
    console.log(`[${ch.id}.7] isIdenticalToBuggy`);
    assert(isIdenticalToBuggy(ch.buggyQuery, ch.buggyQuery), 'idêntica → true');
    assert(isIdenticalToBuggy(' ' + ch.buggyQuery + ' ', ch.buggyQuery), 'whitespace → true');
    assert(isIdenticalToBuggy(ch.buggyQuery.toUpperCase(), ch.buggyQuery), 'case → true');
    assert(!isIdenticalToBuggy(ch.correctQuery, ch.buggyQuery), 'correta ≠ quebrada → false');
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TOTAL: ${passed + failed} testes — ${passed} passaram, ${failed} falharam`);
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
