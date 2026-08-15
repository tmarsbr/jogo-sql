/**
 * test_executor.js — Testes do executor SQL seguro.
 *
 * Executa com: node test/test_executor.js
 * Requer: npm install sql.js
 *
 * Importa as funções reais de src/executor.js via load-source.js.
 *
 * Testes obrigatórios (Fase 3):
 * 1. SELECT válido
 * 2. SELECT com WHERE
 * 3. Query com erro de sintaxe
 * 4. Tabela inexistente
 * 5. DELETE, DROP, UPDATE e INSERT bloqueados
 * 6. Duas queries na mesma execução bloqueadas
 * 7. Query que retorna zero linhas
 *
 * Extras:
 * 8. WITH (CTE) válido
 * 9. SELECT com comentários
 * 10. PRAGMA, VACUUM, ATTACH, DETACH, CREATE, ALTER bloqueados
 * 11. Query vazia
 * 12. Query só com comentários
 * 13. SELECT com string que contém ponto-e-vírgula
 * 14. CASE-INSENSITIVE (select minúsculo)
 * 15. SELECT com aliases
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { loadExecutor, loadSeedData } = require('./helpers/load-source');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

// Importa funções reais do executor
const executor = loadExecutor();
const { executeQuery, stripComments, normalizeSQL, countStatements, getFirstKeyword, isCreateViewStatement, findBlockedKeyword,
        getComparisonSyntaxHint, RESULT_OK, RESULT_ERROR, RESULT_BLOCKED, RESULT_EMPTY } = executor;

// Importa schema/seed reais
const { SCHEMA_SQL, SEED_SQL } = loadSeedData();

async function run() {
  const wasmPath = path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm');
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(wasmPath) });
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON;');
  db.run(SCHEMA_SQL);
  db.run(SEED_SQL);

  // === Teste 1: SELECT válido ===
  console.log('\n[1] SELECT válido');
  let r = executeQuery('SELECT * FROM funcionarios;', db);
  assert(r.type === RESULT_OK, `Tipo: ${r.type} = ok`);
  assert(r.columns.length > 0, `Tem colunas: ${r.columns.length}`);
  assert(r.rowCount >= 10, `Tem linhas: ${r.rowCount} >= 10`);

  // === Teste 2: SELECT com WHERE ===
  console.log('\n[2] SELECT com WHERE');
  r = executeQuery("SELECT nome FROM funcionarios WHERE id = 7;", db);
  assert(r.type === RESULT_OK, `Tipo: ok`);
  assert(r.rowCount === 1, '1 resultado');
  assert(r.rows[0][0] === 'Camila Torres', 'Camila Torres');

  // === Teste 2b: Operadores de comparação ===
  r = executeQuery('SELECT id FROM funcionarios WHERE id >= 7 ORDER BY id;', db);
  assert(r.type === RESULT_OK, 'Operador >= funciona');
  assert(r.rowCount === 4, 'Operador >= retorna as linhas esperadas');
  r = executeQuery('SELECT id FROM funcionarios WHERE id <= 2 ORDER BY id;', db);
  assert(r.type === RESULT_OK, 'Operador <= funciona');
  assert(r.rowCount === 2, 'Operador <= retorna as linhas esperadas');
  r = executeQuery('SELECT id FROM funcionarios WHERE >= 7;', db);
  assert(r.type === RESULT_ERROR, 'Comparador sem expressão é erro SQL');
  assert(r.message.includes('operador ">="') && r.message.includes('coluna ou expressão'), 'Erro de comparador explica como corrigir');
  assert(getComparisonSyntaxHint('SELECT * FROM funcionarios WHERE >= 7;') !== null, 'Detecta comparador sem expressão');

  // === Teste 3: Query com erro de sintaxe ===
  console.log('\n[3] Erro de sintaxe');
  r = executeQuery('SLECT * FROM funcionarios;', db);
  assert(r.type === RESULT_BLOCKED || r.type === RESULT_ERROR, `Tipo: ${r.type} (bloqueado ou erro)`);

  // === Teste 4: Tabela inexistente ===
  console.log('\n[4] Tabela inexistente');
  r = executeQuery('SELECT * FROM tabela_fantasma;', db);
  assert(r.type === RESULT_ERROR, `Tipo: error`);
  assert(r.message.includes('tabela_fantasma') || r.message.includes('no such table'), `Mensagem: ${r.message}`);

  // === Teste 5: Comandos bloqueados ===
  console.log('\n[5] Comandos bloqueados');
  const blocked = [
    "DELETE FROM funcionarios;",
    "DROP TABLE funcionarios;",
    "UPDATE funcionarios SET nome='X' WHERE id=1;",
    "INSERT INTO funcionarios VALUES (99, 'X', 'X', 1, 0, '2024-01-01');",
  ];
  for (const q of blocked) {
    r = executeQuery(q, db);
    assert(r.type === RESULT_BLOCKED, `Bloqueado: ${q.substring(0, 30)}...`);
  }

  // === Teste 6: Múltiplas instruções ===
  console.log('\n[6] Múltiplas instruções');
  r = executeQuery('SELECT 1; SELECT 2;', db);
  assert(r.type === RESULT_BLOCKED, 'Múltiplas instruções bloqueadas');

  // === Teste 7: Query que retorna zero linhas ===
  console.log('\n[7] Zero linhas');
  r = executeQuery("SELECT * FROM funcionarios WHERE id = 9999;", db);
  assert(r.type === RESULT_EMPTY, `Tipo: empty`);
  assert(r.rowCount === 0, '0 linhas');

  // === Teste 8: WITH (CTE) válido ===
  console.log('\n[8] WITH (CTE)');
  r = executeQuery('WITH cte AS (SELECT nome FROM funcionarios LIMIT 3) SELECT * FROM cte;', db);
  assert(r.type === RESULT_OK, `CTE funciona: ${r.type}`);
  assert(r.rowCount === 3, 'CTE retorna 3 linhas');

  // === Teste 9: SELECT com comentários ===
  console.log('\n[9] Comentários');
  r = executeQuery('-- comentário\nSELECT nome FROM funcionarios WHERE id=7;', db);
  assert(r.type === RESULT_OK, 'Comentário de linha ignorado');
  r = executeQuery('/* bloco */ SELECT nome FROM funcionarios WHERE id=7;', db);
  assert(r.type === RESULT_OK, 'Comentário de bloco ignorado');

  // === Teste 10: Mais comandos bloqueados ===
  console.log('\n[10] Mais comandos bloqueados');
  const moreBlocked = ['PRAGMA foreign_keys;', 'VACUUM;', "ATTACH ':memory:' AS test;", 'DETACH test;', 'CREATE TABLE x(id INT);', 'ALTER TABLE funcionarios ADD COLUMN x;'];
  for (const q of moreBlocked) {
    r = executeQuery(q, db);
    assert(r.type === RESULT_BLOCKED, `Bloqueado: ${q.substring(0, 40)}`);
  }

  // === Teste 11: Query vazia ===
  console.log('\n[11] Query vazia');
  r = executeQuery('', db);
  assert(r.type === RESULT_ERROR, 'Vazia: error');
  r = executeQuery('   ', db);
  assert(r.type === RESULT_ERROR, 'Só espaços: error');

  // === Teste 12: Só comentários ===
  console.log('\n[12] Só comentários');
  r = executeQuery('-- nada aqui', db);
  assert(r.type === RESULT_ERROR, 'Só comentário: error');
  r = executeQuery('/* nada */', db);
  assert(r.type === RESULT_ERROR, 'Só bloco: error');

  // === Teste 13: String com ponto-e-vírgula ===
  console.log('\n[13] String com ponto-e-vírgula');
  r = executeQuery("SELECT 'a;b' AS teste;", db);
  assert(r.type === RESULT_OK, 'String com ; aceita');
  assert(r.rows[0][0] === 'a;b', 'Valor correto');

  // === Teste 14: Case-insensitive ===
  console.log('\n[14] Case-insensitive');
  r = executeQuery('select nome from funcionarios where id=7;', db);
  assert(r.type === RESULT_OK, 'select minúsculo funciona');

  // === Teste 15: Aliases ===
  console.log('\n[15] Aliases');
  r = executeQuery('SELECT nome AS n, cargo AS c FROM funcionarios LIMIT 1;', db);
  assert(r.type === RESULT_OK, 'Com aliases funciona');
  assert(r.columns.includes('n'), 'Coluna alias n');
  assert(r.columns.includes('c'), 'Coluna alias c');

  // === Teste 16: Banco não inicializado ===
  console.log('\n[16] Sem banco');
  r = executeQuery('SELECT 1;', null);
  assert(r.type === RESULT_ERROR, 'Sem banco: error');

  // === Teste 17: stripComments ===
  console.log('\n[17] stripComments');
  assert(stripComments('-- test\nSELECT 1').trim() === 'SELECT 1', 'Remove comentário de linha');
  assert(stripComments('/* test */SELECT 1').trim() === 'SELECT 1', 'Remove comentário de bloco');
  assert(stripComments("SELECT '--not comment'").includes('--not comment'), 'Preserva string');

  // === Teste 18: countStatements ===
  console.log('\n[18] countStatements');
  assert(countStatements('SELECT 1') === 1, '1 statement');
  assert(countStatements('SELECT 1; SELECT 2') === 2, '2 statements');
  assert(countStatements("SELECT 'a;b'") === 1, 'Ponto-e-vírgula em string = 1');

  // === Teste 19: getFirstKeyword ===
  console.log('\n[19] getFirstKeyword');
  assert(getFirstKeyword('SELECT 1') === 'SELECT', 'SELECT');
  assert(getFirstKeyword('  with cte') === 'WITH', 'WITH');
  assert(getFirstKeyword('DELETE FROM x') === 'DELETE', 'DELETE');

  // === Teste 20: findBlockedKeyword ===
  console.log('\n[20] findBlockedKeyword');
  assert(findBlockedKeyword('DROP TABLE x') === 'DROP', 'Detecta DROP');
  assert(findBlockedKeyword('INSERT INTO x') === 'INSERT', 'Detecta INSERT');
  assert(findBlockedKeyword('SELECT * FROM x') === null, 'SELECT não bloqueado');

  // === Teste 21: CREATE VIEW com permissão estreita ===
  console.log('\n[21] CREATE VIEW controlado');
  r = executeQuery(
    'CREATE VIEW vw_teste_executor AS SELECT id, nome FROM funcionarios WHERE departamento_id = 1;',
    db,
    { allowCreateView: true }
  );
  assert(r.type === RESULT_EMPTY, `CREATE VIEW permitido retorna empty (${r.type})`);
  const viewPreview = executeQuery('SELECT * FROM vw_teste_executor;', db);
  assert(viewPreview.type === RESULT_OK && viewPreview.rowCount >= 1, 'View criada pode ser consultada');
  assert(isCreateViewStatement('CREATE VIEW vw_x AS SELECT 1') === true, 'Reconhece CREATE VIEW + SELECT');
  assert(isCreateViewStatement('CREATE TABLE x(id INT)') === false, 'Não confunde CREATE TABLE com CREATE VIEW');

  // === Teste 22: a opção não libera outros DDLs nem múltiplos statements ===
  console.log('\n[22] CREATE VIEW não abre DDL genérico');
  const stillBlocked = [
    'CREATE TABLE tabela_perigosa(id INT);',
    'CREATE TRIGGER gatilho AFTER INSERT ON funcionarios BEGIN SELECT 1; END;',
    'DROP TABLE funcionarios;',
    'ALTER TABLE funcionarios ADD COLUMN segredo TEXT;',
    'CREATE VIEW vw_dupla AS SELECT 1; SELECT 2;',
    'CREATE VIEW vw_dml AS DELETE FROM funcionarios;',
  ];
  for (const query of stillBlocked) {
    r = executeQuery(query, db, { allowCreateView: true });
    assert(r.type === RESULT_BLOCKED, `Continua bloqueado: ${query.substring(0, 42)}`);
  }

  // === Resultado ===
  console.log('\n' + '='.repeat(50));
  console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
  console.log('='.repeat(50));

  db.close();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('ERRO FATAL:', err);
  process.exit(1);
});
