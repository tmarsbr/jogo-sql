/**
 * test_db.js — Testes do schema, seed e CHECK de contas.
 *
 * Executa com: node test/test_db.js
 * Requer: npm install sql.js
 *
 * Importa SCHEMA_SQL e SEED_SQL reais de src/db.js via load-source.js.
 *
 * Testes:
 * 1. Banco carrega sem erro
 * 2. Tabelas e colunas principais existem
 * 3. Seed é determinístico (igual em todas as execuções)
 * 4. Query simples de teste funciona
 * 5. CHECK de contas rejeita registro sem titular válido
 * 6. CHECK de contas rejeita os dois tipos de titular ao mesmo tempo
 * 7. Foreign keys ativas
 * 8. Dados seguem SPOILER.md (Camila ID=7, transações 501-504, logs 701-703, e-mails 801-802)
 * 9. Funcionários do dept Financeiro existem
 * 10. Há acessos depois das 22h
 * 11. Há contas internas e externas
 * 12. Registros suficientes para JOIN, ORDER BY, LIMIT e filtros de data
 * 13. Há funcionários sem transações (para LEFT JOIN)
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { loadSeedData } = require('./helpers/load-source');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  PASS: ${msg}`);
    passed++;
  } else {
    console.log(`  FAIL: ${msg}`);
    failed++;
  }
}

function assertThrows(fn, msg) {
  try {
    fn();
    console.log(`  FAIL: ${msg} (esperava erro)`);
    failed++;
  } catch (e) {
    console.log(`  PASS: ${msg} (${e.message.split('\n')[0]})`);
    passed++;
  }
}

// Importa SCHEMA e SEED reais de db.js
const { SCHEMA_SQL, SEED_SQL } = loadSeedData();

async function run() {
  const wasmPath = path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm');
  const wasmBinary = fs.readFileSync(wasmPath);
  const SQL = await initSqlJs({ wasmBinary });

  function createDB() {
    const db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON;');
    db.run(SCHEMA_SQL);
    db.run(SEED_SQL);
    return db;
  }

  // === Teste 1: Banco carrega sem erro ===
  console.log('\n[1] Banco carrega sem erro');
  let db;
  try {
    db = createDB();
    assert(true, 'Banco criado e populado sem erro');
  } catch (e) {
    assert(false, `Banco criado sem erro — ${e.message}`);
    process.exit(1);
  }

  // === Teste 2: Tabelas e colunas principais existem ===
  console.log('\n[2] Tabelas e colunas principais existem');
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
  const tableNames = tables[0].values.map(r => r[0]);
  const expectedTables = ['departamentos', 'funcionarios', 'contas', 'transacoes', 'logs_acesso', 'emails'];
  for (const t of expectedTables) {
    assert(tableNames.includes(t), `Tabela '${t}' existe`);
  }

  // Verifica colunas
  const checkCols = (table, expectedCols) => {
    const cols = db.exec(`PRAGMA table_info(${table});`)[0].values.map(r => r[1]);
    for (const c of expectedCols) {
      assert(cols.includes(c), `Coluna '${table}.${c}' existe`);
    }
  };
  checkCols('departamentos', ['id', 'nome', 'andar']);
  checkCols('funcionarios', ['id', 'nome', 'cargo', 'departamento_id', 'salario_centavos', 'data_admissao']);
  checkCols('contas', ['id', 'numero_conta', 'funcionario_id', 'titular_externo', 'banco', 'tipo']);
  checkCols('transacoes', ['id', 'conta_origem_id', 'conta_destino_id', 'valor_centavos', 'data_hora', 'descricao', 'operador_funcionario_id']);
  checkCols('logs_acesso', ['id', 'funcionario_id', 'data_hora', 'tipo', 'local']);
  checkCols('emails', ['id', 'remetente_id', 'destinatario_id', 'assunto', 'data_hora', 'conteudo']);

  // === Teste 3: Seed é determinístico ===
  console.log('\n[3] Seed determinístico');
  const hash1 = db.exec("SELECT COUNT(*) as c FROM funcionarios; SELECT COUNT(*) as c FROM transacoes; SELECT COUNT(*) as c FROM emails; SELECT COUNT(*) as c FROM logs_acesso;");
  const counts1 = hash1.map(r => r.values[0][0]);

  const db2 = createDB();
  const hash2 = db2.exec("SELECT COUNT(*) as c FROM funcionarios; SELECT COUNT(*) as c FROM transacoes; SELECT COUNT(*) as c FROM emails; SELECT COUNT(*) as c FROM logs_acesso;");
  const counts2 = hash2.map(r => r.values[0][0]);

  assert(JSON.stringify(counts1) === JSON.stringify(counts2), `Contagens iguais em duas execuções (${counts1.join(', ')})`);

  // Verifica que os IDs específicos do SPOILER existem
  const camila = db.exec("SELECT id, nome FROM funcionarios WHERE id=7;");
  assert(camila[0].values[0][0] === 7 && camila[0].values[0][1] === 'Camila Torres', 'Camila Torres existe com ID=7');

  // === Teste 4: Query simples de teste ===
  console.log('\n[4] Query simples de teste');
  const res = db.exec("SELECT nome, cargo FROM funcionarios WHERE id=7;");
  assert(res[0].columns.length === 2, `Retorna 2 colunas (nome, cargo)`);
  assert(res[0].values[0][0] === 'Camila Torres', `Query retorna nome correto`);
  assert(res[0].values[0][1] === 'Coordenadora de Tesouraria', `Query retorna cargo correto`);

  // === Teste 5: CHECK de contas rejeita registro sem titular válido ===
  console.log('\n[5] CHECK de contas: rejeita sem titular');
  assertThrows(
    () => db.run("INSERT INTO contas (id, numero_conta, funcionario_id, titular_externo, banco, tipo) VALUES (500, 'CC-X1', NULL, NULL, 'Banco X', 'corrente');"),
    'Rejeita conta sem funcionario_id e sem titular_externo'
  );

  // === Teste 6: CHECK rejeita os dois tipos de titular ao mesmo tempo ===
  console.log('\n[6] CHECK de contas: rejeita dois titulares');
  assertThrows(
    () => db.run("INSERT INTO contas (id, numero_conta, funcionario_id, titular_externo, banco, tipo) VALUES (501, 'CC-X2', 1, 'Externo X', 'Banco X', 'corrente');"),
    'Rejeita conta com funcionario_id E titular_externo simultaneamente'
  );

  // === Teste 7: Foreign keys ativas ===
  console.log('\n[7] Foreign keys ativas');
  const fk = db.exec("PRAGMA foreign_keys;")[0].values[0][0];
  assert(fk === 1, 'PRAGMA foreign_keys = ON');

  assertThrows(
    () => db.run("INSERT INTO funcionarios (id, nome, cargo, departamento_id, salario_centavos, data_admissao) VALUES (99, 'Teste', 'Teste', 999, 1000, '2024-01-01');"),
    'FK rejeita departamento inexistente'
  );

  // === Teste 8: Dados seguem SPOILER.md ===
  console.log('\n[8] Dados seguem SPOILER.md');

  // Transações 501-504
  const susTrans = db.exec("SELECT id, operador_funcionario_id, conta_origem_id, conta_destino_id, valor_centavos FROM transacoes WHERE id IN (501,502,503,504) ORDER BY id;");
  assert(susTrans[0].values.length === 4, '4 transações suspeitas (501-504)');
  for (const t of susTrans[0].values) {
    assert(t[1] === 7, `Transação ${t[0]}: operador=7`);
    assert(t[3] === 999, `Transação ${t[0]}: conta_destino=999`);
    assert(t[4] > 5000000, `Transação ${t[0]}: valor > R$50.000 (${t[4]})`);
  }

  // Logs 701-703
  const susLogs = db.exec("SELECT id, funcionario_id, data_hora FROM logs_acesso WHERE id IN (701,702,703) ORDER BY id;");
  assert(susLogs[0].values.length === 3, '3 logs suspeitos (701-703)');
  for (const l of susLogs[0].values) {
    assert(l[1] === 7, `Log ${l[0]}: funcionaria=7`);
    const hour = parseInt(l[2].split(' ')[1].split(':')[0]);
    assert(hour >= 22, `Log ${l[0]}: depois das 22h (${l[2]})`);
  }

  // E-mails 801-802
  const susEmails = db.exec("SELECT id, remetente_id FROM emails WHERE id IN (801,802) ORDER BY id;");
  assert(susEmails[0].values.length === 2, '2 e-mails suspeitos (801-802)');
  for (const e of susEmails[0].values) {
    assert(e[1] === 7, `E-mail ${e[0]}: remetente=7 (Camila)`);
  }

  // Conta interna 107 da Camila
  const conta107 = db.exec("SELECT funcionario_id FROM contas WHERE id=107;");
  assert(conta107[0].values[0][0] === 7, 'Conta 107 pertence a Camila (ID=7)');

  // Conta externa 999
  const conta999 = db.exec("SELECT titular_externo FROM contas WHERE id=999;");
  assert(conta999[0].values[0][0] === 'Nexus Consultoria Ltda', 'Conta 999 = Nexus Consultoria');

  // Suspeitos falsos
  const bruno = db.exec("SELECT id, nome FROM funcionarios WHERE id=4;");
  assert(bruno[0].values[0][1] === 'Bruno Alves', 'Suspeito falso Bruno Alves (ID=4)');

  const dani = db.exec("SELECT id, nome FROM funcionarios WHERE id=9;");
  assert(dani[0].values[0][1] === 'Daniela Rocha', 'Suspeito falso Daniela Rocha (ID=9)');

  // Bruno Oliveira (ID=2) — nome único, sem duplicata
  const brunoOl = db.exec("SELECT id, nome FROM funcionarios WHERE id=2;");
  assert(brunoOl[0].values[0][1] === 'Bruno Oliveira', 'Bruno Oliveira (ID=2) — nome único');

  // Sem nomes duplicados entre Bruno Oliveira e Bruno Alves
  const brunoCount = db.exec("SELECT COUNT(*) FROM funcionarios WHERE nome='Bruno Alves';");
  assert(brunoCount[0].values[0][0] === 1, 'Apenas 1 Bruno Alves (ID=4, sem duplicata)');

  // Bruno tem acesso noturno
  const brunoNoturno = db.exec("SELECT COUNT(*) FROM logs_acesso WHERE funcionario_id=4 AND CAST(strftime('%H', data_hora) AS INTEGER) >= 22;");
  assert(brunoNoturno[0].values[0][0] >= 1, 'Bruno Alves tem acesso noturno (suspeito falso)');

  // Daniela tem e-mail com palavra-chave mas poucas transações
  const daniEmail = db.exec("SELECT COUNT(*) FROM emails WHERE remetente_id=9;");
  assert(daniEmail[0].values[0][0] >= 1, 'Daniela Rocha tem e-mail (palavra-chave)');

  // === Teste 9: Funcionários do dept Financeiro ===
  console.log('\n[9] Funcionários do dept Financeiro');
  const finDept = db.exec("SELECT COUNT(*) FROM funcionarios WHERE departamento_id=1;");
  const finCount = finDept[0].values[0][0];
  assert(finCount >= 4, `Dept Financeiro tem ${finCount} funcionarios (>=4)`);

  // === Teste 10: Acessos depois das 22h ===
  console.log('\n[10] Acessos depois das 22h');
  const lateAccess = db.exec("SELECT COUNT(*) FROM logs_acesso WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 22;");
  const lateCount = lateAccess[0].values[0][0];
  assert(lateCount >= 4, `Acessos depois das 22h: ${lateCount} (>=4: Camila + Bruno)`);

  // === Teste 11: Contas internas e externas ===
  console.log('\n[11] Contas internas e externas');
  const internas = db.exec("SELECT COUNT(*) FROM contas WHERE funcionario_id IS NOT NULL;");
  const externas = db.exec("SELECT COUNT(*) FROM contas WHERE titular_externo IS NOT NULL;");
  assert(internas[0].values[0][0] >= 10, `Contas internas: ${internas[0].values[0][0]} (>=10)`);
  assert(externas[0].values[0][0] >= 3, `Contas externas: ${externas[0].values[0][0]} (>=3)`);

  // === Teste 12: Registros para JOIN, ORDER BY, LIMIT, filtros ===
  console.log('\n[12] Registros suficientes para JOIN/ORDER BY/LIMIT/filtros');
  const transCount = db.exec("SELECT COUNT(*) FROM transacoes;");
  assert(transCount[0].values[0][0] >= 15, `Transações suficientes: ${transCount[0].values[0][0]} (>=15)`);

  const joinTest = db.exec("SELECT f.nome, t.valor_centavos FROM transacoes t JOIN funcionarios f ON t.operador_funcionario_id = f.id LIMIT 5;");
  assert(joinTest[0].values.length === 5, 'JOIN funciona e retorna 5 linhas');

  const orderByTest = db.exec("SELECT valor_centavos FROM transacoes ORDER BY valor_centavos DESC LIMIT 3;");
  assert(orderByTest[0].values[0][0] > orderByTest[0].values[1][0], 'ORDER BY DESC funciona');

  const dateFilter = db.exec("SELECT COUNT(*) FROM transacoes WHERE data_hora >= '2024-03-01' AND data_hora < '2024-04-01';");
  assert(dateFilter[0].values[0][0] >= 5, `Filtro de data funciona: ${dateFilter[0].values[0][0]} transações em marco`);

  // === Teste 13: Funcionários sem transações (LEFT JOIN) ===
  console.log('\n[13] Funcionários sem transações (para LEFT JOIN)');
  const noTrans = db.exec(`
    SELECT f.id, f.nome
    FROM funcionarios f
    LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id
    WHERE t.id IS NULL
    ORDER BY f.id;
  `);
  const noTransIds = noTrans[0].values.map(r => r[0]);
  assert(noTransIds.length >= 1, `Funcionários sem transações: ${noTransIds.length} (>=1: IDs ${noTransIds.join(', ')})`);

  // === Resultado final ===
  console.log('\n' + '='.repeat(50));
  console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
  console.log('='.repeat(50));

  db.close();
  db2.close();

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('ERRO FATAL:', err);
  process.exit(1);
});