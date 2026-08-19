/**
 * Valida as queries canônicas dos Boss Fights contra o banco restaurado de
 * cada caso. A suíte unitária do módulo puro não exercita o validator real.
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const {
  readSource,
  transformESM,
  evalModule,
  loadExecutor,
  loadValidator,
  loadSeedData,
} = require('./helpers/load-source');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.log(`  FAIL: ${message}`);
    failed++;
  }
}

function loadCaseDefinition(caseId) {
  if (caseId === 'case001') return loadSeedData();
  const source = readSource(path.join('cases', caseId, 'db-seed.js'));
  const module = evalModule(transformESM(source), {}, `cases/${caseId}/db-seed.js`);
  return { SCHEMA_SQL: module.SCHEMA_SQL, SEED_SQL: module.SEED_SQL };
}

function loadCaseLevels(caseId) {
  const filename = caseId === 'case001'
    ? 'levels.js'
    : path.join('cases', caseId, 'levels.js');
  return evalModule(transformESM(readSource(filename)), {}, filename).LEVELS || [];
}

async function run() {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm')) });
  const executor = loadExecutor();
  const validator = loadValidator(executor.executeQuery);
  const definitions = evalModule(transformESM(readSource('boss-definitions.js')), {}, 'boss-definitions.js');

  console.log('\n=== Boss Fights — integração com validator e bancos restaurados ===');

  for (const [caseId, battle] of Object.entries(definitions.BATTLE_BY_CASE)) {
    const db = new SQL.Database();
    const definition = loadCaseDefinition(caseId);
    db.run(definition.SCHEMA_SQL);
    db.run(definition.SEED_SQL);

    // Simula o startGame: missões DDL/view concluídas são reaplicadas antes do boss.
    for (const level of loadCaseLevels(caseId)) {
      if (level.executionMode === 'create_view') {
        const result = executor.executeQuery(level.referenceQuery, db, { allowCreateView: true });
        assert(result.type === 'empty', `${caseId}/${level.id}: mutação de view restaurada`);
      } else if (level.executionMode === 'ddl') {
        const result = executor.executeQuery(level.referenceQuery, db, { allowDml: true, allowDdl: true });
        assert(result.type === 'empty', `${caseId}/${level.id}: mutação DDL restaurada`);
      }
    }

    for (const step of battle.steps) {
      const feedback = validator.validateLevel(step.referenceQuery, step, db);
      assert(feedback.type === 'correct', `${caseId}/${step.id}: query canônica aceita (${feedback.type})`);

      if (step.id === 'boss-001-1') {
        const screenshotQuery = `SELECT c_dest.titular_externo, c_dest.numero_conta, SUM(t.valor_centavos) AS valor_total_desviado
          FROM transacoes t
          INNER JOIN contas c_orig ON t.conta_origem_id = c_orig.id
          INNER JOIN contas c_dest ON t.conta_destino_id = c_dest.id
          WHERE c_orig.funcionario_id = t.operador_funcionario_id
            AND c_dest.titular_externo = 'Nexus Consultoria Ltda'
          GROUP BY c_dest.titular_externo, c_dest.numero_conta;`;
        const screenshotFeedback = validator.validateLevel(screenshotQuery, step, db);
        assert(
          screenshotFeedback.type === 'correct',
          `${caseId}/${step.id}: coluna numero_conta da consulta do jogador é aceita (${screenshotFeedback.type})`
        );
      }
    }

    db.close();
  }

  console.log(`\nRESULTADO: ${passed} passaram, ${failed} falharam`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch(error => {
  console.error('ERRO FATAL:', error);
  process.exit(1);
});
