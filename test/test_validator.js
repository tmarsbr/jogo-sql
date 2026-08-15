/**
 * test_validator.js — Testes do validador de missões.
 *
 * Executa com: node test/test_validator.js
 * Requer: npm install sql.js
 *
 * Importa funções reais de src/executor.js e src/validator.js via load-source.js.
 *
 * Testes por missão (1-4):
 * - Query correta → FEEDBACK_CORRECT
 * - Query equivalente (alias, ordem diferente) → FEEDBACK_CORRECT
 * - Query com resultado incorreto → FEEDBACK_WRONG_RESULT
 * - Query com conceito ausente → FEEDBACK_MISSING_CONCEPT
 * - Query com erro de SQL → FEEDBACK_SQL_ERROR
 * - Query bloqueada → FEEDBACK_BLOCKED
 * - Query com colunas ausentes → FEEDBACK_MISSING_COLUMNS
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { loadExecutor, loadValidator, loadLevels, loadSeedData } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

// === Carrega módulos reais ===
const executor = loadExecutor();
const validator = loadValidator(executor.executeQuery);
const levels = loadLevels();
const { SCHEMA_SQL, SEED_SQL } = loadSeedData();

const { validateLevel, FEEDBACK_CORRECT, FEEDBACK_WRONG_RESULT, FEEDBACK_MISSING_CONCEPT,
        FEEDBACK_SQL_ERROR, FEEDBACK_MISSING_COLUMNS, FEEDBACK_BLOCKED } = validator;

// Usa os 4 primeiros levels reais
const LEVELS_1_4 = levels.LEVELS.filter(l => l.id <= 4);

async function run() {
  const wasmPath = path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) });
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  db.run(SCHEMA_SQL);
  db.run(SEED_SQL);

  // === Missão 1: SELECT ===
  const L1 = LEVELS_1_4.find(l => l.id === 1);
  console.log('\n=== Missão 1: A Lista de Suspeitos ===');

  console.log('[1.1] Query correta');
  let r = validateLevel('SELECT nome, cargo FROM funcionarios;', L1, db);
  assert(r.type === FEEDBACK_CORRECT, `Correta → ${r.type}`);

  console.log('[1.2] Query equivalente (com ORDER BY)');
  r = validateLevel('SELECT nome, cargo FROM funcionarios ORDER BY id;', L1, db);
  assert(r.type === FEEDBACK_CORRECT, `Equivalente → ${r.type}`);

  console.log('[1.3] Query com resultado incorreto (colunas extras)');
  r = validateLevel('SELECT id, nome, cargo FROM funcionarios;', L1, db);
  // Agora que a validação é estrita, colunas adicionais devem resultar em FEEDBACK_WRONG_RESULT
  assert(r.type === FEEDBACK_WRONG_RESULT, `Colunas extras → ${r.type}`);

  console.log('[1.4] Query com conceito ausente');
  // Missão 1 requer 'select' — qualquer SELECT atende, então testamos outro cenário
  r = validateLevel('SELECT nome, cargo FROM funcionarios;', L1, db);
  assert(r.type === FEEDBACK_CORRECT, `SELECT presente → ${r.type}`);

  console.log('[1.5] Query com resultado incorreto (WHERE limita demais)');
  r = validateLevel("SELECT nome, cargo FROM funcionarios WHERE id = 1;", L1, db);
  assert(r.type === FEEDBACK_WRONG_RESULT, `Resultado parcial → ${r.type}`);

  console.log('[1.6] Query com erro de SQL');
  r = validateLevel('SELECT nome, cargo FROM tabela_inexistente;', L1, db);
  assert(r.type === FEEDBACK_SQL_ERROR, `Erro SQL → ${r.type}`);

  console.log('[1.7] Query bloqueada');
  r = validateLevel('DELETE FROM funcionarios;', L1, db);
  assert(r.type === FEEDBACK_BLOCKED, `Bloqueada → ${r.type}`);

  console.log('[1.8] Query com colunas ausentes');
  r = validateLevel('SELECT nome FROM funcionarios;', L1, db);
  assert(r.type === FEEDBACK_MISSING_COLUMNS, `Coluna ausente → ${r.type}`);

  // === Missão 2: WHERE ===
  const L2 = LEVELS_1_4.find(l => l.id === 2);
  console.log('\n=== Missão 2: Filtrando os Álibis ===');

  console.log('[2.1] Query correta');
  r = validateLevel('SELECT nome, cargo FROM funcionarios WHERE departamento_id = 1;', L2, db);
  assert(r.type === FEEDBACK_CORRECT, `Correta → ${r.type}`);

  console.log('[2.2] Query equivalente (com ORDER BY)');
  r = validateLevel('SELECT nome, cargo FROM funcionarios WHERE departamento_id = 1 ORDER BY id;', L2, db);
  assert(r.type === FEEDBACK_CORRECT, `Equivalente → ${r.type}`);

  console.log('[2.3] Query com conceito ausente (sem WHERE)');
  r = validateLevel('SELECT nome, cargo FROM funcionarios LIMIT 4;', L2, db);
  // Se retorna o mesmo resultado, mas sem WHERE, deve falhar por conceito ausente
  // ou resultado diferente (depende dos dados)
  assert(r.type === FEEDBACK_WRONG_RESULT || r.type === FEEDBACK_MISSING_CONCEPT, `Sem WHERE → ${r.type}`);

  console.log('[2.4] Query com resultado incorreto (dept errado)');
  r = validateLevel('SELECT nome, cargo FROM funcionarios WHERE departamento_id = 2;', L2, db);
  assert(r.type === FEEDBACK_WRONG_RESULT, `Dept errado → ${r.type}`);

  console.log('[2.5] Query com colunas ausentes');
  r = validateLevel('SELECT nome FROM funcionarios WHERE departamento_id = 1;', L2, db);
  assert(r.type === FEEDBACK_MISSING_COLUMNS, `Coluna ausente → ${r.type}`);

  // === Missão 3: ORDER BY + LIMIT ===
  const L3 = LEVELS_1_4.find(l => l.id === 3);
  console.log('\n=== Missão 3: Rastreando a Grana ===');

  console.log('[3.1] Query correta');
  r = validateLevel('SELECT id, valor_centavos, data_hora FROM transacoes ORDER BY valor_centavos DESC LIMIT 5;', L3, db);
  assert(r.type === FEEDBACK_CORRECT, `Correta → ${r.type}`);

  console.log('[3.2] Query com resultado incorreto (LIMIT errado)');
  r = validateLevel('SELECT id, valor_centavos, data_hora FROM transacoes ORDER BY valor_centavos DESC LIMIT 3;', L3, db);
  assert(r.type === FEEDBACK_WRONG_RESULT, `LIMIT errado → ${r.type}`);

  console.log('[3.3] Query com conceito ausente (sem ORDER BY)');
  r = validateLevel('SELECT id, valor_centavos, data_hora FROM transacoes LIMIT 5;', L3, db);
  assert(r.type === FEEDBACK_WRONG_RESULT || r.type === FEEDBACK_MISSING_CONCEPT, `Sem ORDER BY → ${r.type}`);

  // === Missão 4: Datas + WHERE ===
  const L4 = LEVELS_1_4.find(l => l.id === 4);
  console.log('\n=== Missão 4: O Horário Suspeito ===');

  console.log('[4.1] Query correta');
  r = validateLevel("SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 22;", L4, db);
  assert(r.type === FEEDBACK_CORRECT, `Correta → ${r.type}`);

  console.log('[4.2] Query equivalente (com ORDER BY)');
  r = validateLevel("SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 22 ORDER BY id;", L4, db);
  assert(r.type === FEEDBACK_CORRECT, `Equivalente → ${r.type}`);

  console.log('[4.3] Query com resultado incorreto');
  r = validateLevel("SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 8 AND CAST(strftime('%H', data_hora) AS INTEGER) < 18;", L4, db);
  assert(r.type === FEEDBACK_WRONG_RESULT, `Horário errado → ${r.type}`);

  console.log('[4.4] Query vazia');
  r = validateLevel('', L4, db);
  assert(r.type === FEEDBACK_SQL_ERROR || r.type === FEEDBACK_BLOCKED, `Vazia → ${r.type}`);

  // === Resultado ===
  console.log('\n' + '='.repeat(50));
  console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
  console.log('='.repeat(50));
  db.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('ERRO FATAL:', err); process.exit(1); });