/**
 * test_levels_advanced.js — Testes das missões 5-12.
 *
 * Executa com: node test/test_levels_advanced.js
 * Requer: npm install sql.js
 *
 * Importa funções reais de src/executor.js, src/validator.js e src/levels.js
 * via load-source.js. Importa SCHEMA/SEED reais de src/db.js.
 *
 * Para cada missão: query correta, query equivalente, query errada.
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { loadExecutor, loadValidator, loadLevels, loadSeedData } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) { if (cond) { console.log(`  PASS: ${msg}`); passed++; } else { console.log(`  FAIL: ${msg}`); failed++; } }

// === Carrega módulos reais ===
const executor = loadExecutor();
const validator = loadValidator(executor.executeQuery);
const levels = loadLevels();
const { SCHEMA_SQL, SEED_SQL } = loadSeedData();

const { executeQuery } = executor;
const { validateLevel } = validator;

// Usa levels 5-12 reais
const LEVELS_5_12 = levels.LEVELS.filter(l => l.id >= 5 && l.id <= 12);

async function run() {
  const wasmPath = path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) });
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  db.run(SCHEMA_SQL);
  db.run(SEED_SQL);

  // Queries corretas para cada missão
  const correctQueries = [
    // 5: INNER JOIN
    'SELECT f.nome, t.valor_centavos FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id ORDER BY t.id;',
    // 6: GROUP BY + COUNT
    'SELECT f.nome, COUNT(*) AS total_transacoes FROM transacoes t JOIN funcionarios f ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome ORDER BY f.id;',
    // 7: HAVING
    'SELECT f.nome, COUNT(*) AS total_transacoes FROM transacoes t JOIN funcionarios f ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome HAVING COUNT(*) > 3 ORDER BY f.id;',
    // 8: LEFT JOIN + IS NULL
    'SELECT f.nome FROM funcionarios f LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id WHERE t.id IS NULL ORDER BY f.id;',
    // 9: JOIN + LIKE
    "SELECT f.nome, e.assunto FROM emails e JOIN funcionarios f ON e.remetente_id = f.id WHERE LOWER(e.conteudo) LIKE '%urgente%' ORDER BY e.id;",
    // 10: Subquery (com AVG obrigatório)
    'SELECT id, valor_centavos, data_hora FROM transacoes WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes) ORDER BY id;',
    // 11: CASE WHEN
    "SELECT id, valor_centavos, CASE WHEN valor_centavos > 5000000 THEN 'alto' WHEN valor_centavos > 1000000 THEN 'medio' ELSE 'baixo' END AS nivel_risco FROM transacoes ORDER BY id;",
    // 12: Veredito final
    `SELECT f.nome,
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
  ];

  const equivalentQueries = [
    // 5: equivalente (aliases diferentes)
    'SELECT funcionarios.nome AS nome, t.valor_centavos FROM transacoes t JOIN funcionarios ON t.operador_funcionario_id = funcionarios.id ORDER BY t.id;',
    // 6: equivalente (sem ORDER BY)
    'SELECT f.nome, COUNT(*) AS total_transacoes FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome;',
    // 7: equivalente (HAVING com alias)
    'SELECT f.nome, COUNT(*) AS total_transacoes FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome HAVING total_transacoes > 3 ORDER BY f.id;',
    // 8: equivalente (sem ORDER BY)
    'SELECT f.nome FROM funcionarios f LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id WHERE t.id IS NULL;',
    // 9: equivalente
    "SELECT f.nome, e.assunto FROM emails e JOIN funcionarios f ON e.remetente_id = f.id WHERE LOWER(e.conteudo) LIKE '%urgente%' ORDER BY e.id;",
    // 10: equivalente (com alias — inclui AVG)
    'SELECT t.id, t.valor_centavos, t.data_hora FROM transacoes t WHERE t.valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes) ORDER BY t.id;',
    // 11: equivalente (com alias t.)
    "SELECT t.id, t.valor_centavos, CASE WHEN t.valor_centavos > 5000000 THEN 'alto' WHEN t.valor_centavos > 1000000 THEN 'medio' ELSE 'baixo' END AS nivel_risco FROM transacoes t ORDER BY t.id;",
    // 12: equivalente (sem ORDER BY)
    `SELECT f.nome,
  SUM(CASE WHEN t.valor_centavos > 5000000 THEN 1 ELSE 0 END) AS total_transacoes_alto_risco,
  (SELECT COUNT(*) FROM logs_acesso l WHERE l.funcionario_id = f.id AND CAST(strftime('%H', l.data_hora) AS INTEGER) >= 22) AS total_acessos_noturnos,
  (SELECT COUNT(*) FROM emails e WHERE e.remetente_id = f.id AND (LOWER(e.conteudo) LIKE '%urgente%' OR LOWER(e.conteudo) LIKE '%ponte%')) AS total_emails_suspeitos
FROM funcionarios f
INNER JOIN transacoes t ON t.operador_funcionario_id = f.id
WHERE t.valor_centavos > 5000000
GROUP BY f.id, f.nome
HAVING (SELECT COUNT(*) FROM logs_acesso l WHERE l.funcionario_id = f.id AND CAST(strftime('%H', l.data_hora) AS INTEGER) >= 22) >= 1
  AND (SELECT COUNT(*) FROM emails e WHERE e.remetente_id = f.id AND (LOWER(e.conteudo) LIKE '%urgente%' OR LOWER(e.conteudo) LIKE '%ponte%')) >= 1;`,
  ];

  const wrongQueries = [
    // 5: errada (sem JOIN, só funcionarios)
    'SELECT nome, salario_centavos FROM funcionarios;',
    // 6: errada (sem GROUP BY)
    'SELECT f.nome, COUNT(*) AS total_transacoes FROM transacoes t JOIN funcionarios f ON t.operador_funcionario_id = f.id;',
    // 7: errada (HAVING > 10 — ninguém tem)
    'SELECT f.nome, COUNT(*) AS total_transacoes FROM transacoes t JOIN funcionarios f ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome HAVING COUNT(*) > 10 ORDER BY f.id;',
    // 8: errada (INNER JOIN — não inclui sem transações)
    'SELECT f.nome FROM funcionarios f INNER JOIN transacoes t ON t.operador_funcionario_id = f.id WHERE t.id IS NULL ORDER BY f.id;',
    // 9: errada (palavra inexistente)
    "SELECT f.nome, e.assunto FROM emails e JOIN funcionarios f ON e.remetente_id = f.id WHERE LOWER(e.conteudo) LIKE '%inexistente%' ORDER BY e.id;",
    // 10: errada (< média)
    'SELECT id, valor_centavos, data_hora FROM transacoes WHERE valor_centavos < (SELECT AVG(valor_centavos) FROM transacoes) ORDER BY id;',
    // 11: errada (limites diferentes)
    "SELECT id, valor_centavos, CASE WHEN valor_centavos > 10000000 THEN 'alto' ELSE 'baixo' END AS nivel_risco FROM transacoes ORDER BY id;",
    // 12: errada (inclui todas as transações, não só alto risco)
    `SELECT f.nome,
  COUNT(*) AS total_transacoes_alto_risco,
  (SELECT COUNT(*) FROM logs_acesso l WHERE l.funcionario_id = f.id AND CAST(strftime('%H', l.data_hora) AS INTEGER) >= 22) AS total_acessos_noturnos,
  (SELECT COUNT(*) FROM emails e WHERE e.remetente_id = f.id AND (LOWER(e.conteudo) LIKE '%urgente%' OR LOWER(e.conteudo) LIKE '%ponte%')) AS total_emails_suspeitos
FROM funcionarios f
INNER JOIN transacoes t ON t.operador_funcionario_id = f.id
GROUP BY f.id, f.nome
HAVING (SELECT COUNT(*) FROM logs_acesso l WHERE l.funcionario_id = f.id AND CAST(strftime('%H', l.data_hora) AS INTEGER) >= 22) >= 1
ORDER BY f.id;`,
  ];

  // === Executa testes ===
  for (let i = 0; i < LEVELS_5_12.length; i++) {
    const level = LEVELS_5_12[i];
    console.log(`\n=== Missão ${level.id}: ${level.title} ===`);

    // Query correta
    console.log(`[${level.id}.1] Query correta`);
    let r = validateLevel(correctQueries[i], level, db);
    assert(r.type === 'correct', `Query correta → correct (recebeu ${r.type}${r.message ? ': ' + r.message.substring(0, 60) : ''})`);

    // Query equivalente
    console.log(`[${level.id}.2] Query equivalente`);
    r = validateLevel(equivalentQueries[i], level, db);
    assert(r.type === 'correct', `Query equivalente → correct (recebeu ${r.type}${r.message ? ': ' + r.message.substring(0, 60) : ''})`);

    // Query errada
    console.log(`[${level.id}.3] Query errada`);
    r = validateLevel(wrongQueries[i], level, db);
    assert(r.type !== 'correct', `Query errada → não correct (recebeu ${r.type})`);
  }

  // === Teste específico da missão 10: exige AVG e subquery ===
  console.log('\n=== Missão 10: Deve exigir AVG e subquery ===');
  const level10 = LEVELS_5_12.find(l => l.id === 10);
  // Query sem AVG mas que tenta obter resultado semelhante (hardcoded threshold)
  const noAvgQuery = "SELECT id, valor_centavos, data_hora FROM transacoes WHERE valor_centavos > 1000000 ORDER BY id;";
  let r10 = validateLevel(noAvgQuery, level10, db);
  assert(r10.type !== 'correct', `Sem AVG → não correct (recebeu ${r10.type}${r10.missingConcepts ? ': falta ' + r10.missingConcepts.join(', ') : ''})`);
  // Query com AVG mas usando CTE (WITH) em vez de subquery entre parênteses
  const cteQuery = "WITH media AS (SELECT AVG(valor_centavos) AS m FROM transacoes) SELECT id, valor_centavos, data_hora FROM transacoes, media WHERE valor_centavos > m ORDER BY id;";
  let r10cte = validateLevel(cteQuery, level10, db);
  // CTE não tem (SELECT ...) — deve falhar por falta de subquery
  assert(r10cte.type !== 'correct', `CTE sem subquery entre parênteses → não correct (recebeu ${r10cte.type}${r10cte.missingConcepts ? ': falta ' + r10cte.missingConcepts.join(', ') : ''})`);
  // CTE com lista de colunas: WITH media(m) AS (SELECT AVG...)
  const cteWithCols = "WITH media(m) AS (SELECT AVG(valor_centavos) FROM transacoes) SELECT id, valor_centavos, data_hora FROM transacoes, media WHERE valor_centavos > m ORDER BY id;";
  let r10cteCols = validateLevel(cteWithCols, level10, db);
  assert(r10cteCols.type !== 'correct', `CTE com lista de colunas sem subquery → não correct (recebeu ${r10cteCols.type}${r10cteCols.missingConcepts ? ': falta ' + r10cteCols.missingConcepts.join(', ') : ''})`);
  // Múltiplas CTEs: WITH a AS (...), b AS (...) SELECT ...
  const multiCte = "WITH a AS (SELECT AVG(valor_centavos) AS m FROM transacoes), b AS (SELECT id, valor_centavos, data_hora FROM transacoes) SELECT b.id, b.valor_centavos, b.data_hora FROM b, a WHERE b.valor_centavos > a.m ORDER BY b.id;";
  let r10multi = validateLevel(multiCte, level10, db);
  assert(r10multi.type !== 'correct', `Múltiplas CTEs sem subquery → não correct (recebeu ${r10multi.type}${r10multi.missingConcepts ? ': falta ' + r10multi.missingConcepts.join(', ') : ''})`);
  // Query com CASE WHEN em comentário não deve ser detectada como conceito
  const fakeCaseQuery = "SELECT id, valor_centavos, data_hora FROM transacoes WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes) /* CASE WHEN */ ORDER BY id;";
  let r10fake = validateLevel(fakeCaseQuery, level10, db);
  assert(r10fake.type === 'correct', `Query com comentário CASE WHEN → correct (não detecta conceito em comentário)`);
  // Query com IIF e CASE WHEN em comentário para missão 11
  console.log('\n=== Missão 11: CASE WHEN em comentário não deve contar ===');
  const level11 = LEVELS_5_12.find(l => l.id === 11);
  const fakeCase11 = "SELECT id, valor_centavos, IIF(valor_centavos > 5000000, 'alto', 'baixo') AS nivel_risco FROM transacoes ORDER BY id;";
  let r11fake = validateLevel(fakeCase11, level11, db);
  assert(r11fake.type !== 'correct', `IIF sem CASE WHEN real → não correct (recebeu ${r11fake.type}${r11fake.missingConcepts ? ': falta ' + r11fake.missingConcepts.join(', ') : ''})`);

  // === Teste específico da missão 12: veredito final ===
  console.log('\n=== Missão 12: Veredito Final específico ===');
  const r12 = executeQuery(correctQueries[7], db);
  assert(r12.type === 'ok', `Query 12 executou com sucesso`);
  assert(r12.rowCount === 1, `Apenas 1 suspeita (recebeu ${r12.rowCount})`);
  assert(r12.rows[0][0] === 'Camila Torres', `Culpada: Camila Torres (recebeu ${r12.rows[0][0]})`);
  assert(r12.rows[0][1] >= 4, `Total transações alto risco >= 4 (recebeu ${r12.rows[0][1]})`);
  assert(r12.rows[0][2] >= 1, `Total acessos noturnos >= 1 (recebeu ${r12.rows[0][2]})`);
  assert(r12.rows[0][3] >= 1, `Total emails suspeitos >= 1 (recebeu ${r12.rows[0][3]})`);

  // === Verifica que evidência da missão 4 NÃO menciona "Camila Torres" ===
  console.log('\n=== Missão 4: Não revela culpada ===');
  const level4 = levels.LEVELS.find(l => l.id === 4);
  assert(!level4.evidence.includes('Camila Torres'), 'Evidência 4 não menciona "Camila Torres"');
  assert(!level4.evidence.includes('Coordenadora de Tesouraria'), 'Evidência 4 não menciona o cargo');
  assert(level4.evidence.includes('ID 7'), 'Evidência 4 menciona ID 7 (sem nome)');

  // === Verifica que Bruno Oliveira e Bruno Alves são distintos ===
  console.log('\n=== Nomes únicos: Bruno Oliveira vs Bruno Alves ===');
  const brunoCheck = db.exec("SELECT id, nome FROM funcionarios WHERE nome LIKE 'Bruno%' ORDER BY id;");
  assert(brunoCheck[0].values.length === 2, '2 Brunos no sistema');
  assert(brunoCheck[0].values[0][1] === 'Bruno Oliveira', 'ID 2 = Bruno Oliveira');
  assert(brunoCheck[0].values[1][1] === 'Bruno Alves', 'ID 4 = Bruno Alves');

  console.log('\n' + '='.repeat(50));
  console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
  console.log('='.repeat(50));
  db.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('ERRO FATAL:', err); process.exit(1); });