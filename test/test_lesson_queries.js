/** Verifica se cada walkthrough roda no banco canônico usado pelo exemplo. */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { loadCourseContent, loadLesson, loadLevels, loadSeedData } = require('./helpers/load-source');

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) { console.log(`  PASS: ${message}`); passed++; }
  else { console.log(`  FAIL: ${message}`); failed++; }
}

function loadCaseSeed(caseId) {
  const filename = path.join(__dirname, '..', 'src', 'cases', caseId, 'db-seed.js');
  const source = fs.readFileSync(filename, 'utf-8');
  const schema = source.match(/export const SCHEMA_SQL\s*=\s*`([\s\S]*?)`;/);
  const seed = source.match(/export const SEED_SQL\s*=\s*`([\s\S]*?)`;/);
  if (!schema || !seed) throw new Error(`Não foi possível ler o banco de ${caseId}`);
  return { SCHEMA_SQL: schema[1], SEED_SQL: seed[1] };
}

async function run() {
  const wasmBinary = fs.readFileSync(path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm'));
  const SQL = await initSqlJs({ wasmBinary });
  const { COURSE_CONTENT, getCourseContentById } = loadCourseContent();
  const { renderLessonHtml } = loadLesson();
  const { LEVELS } = loadLevels();
  const databases = {
    case001: loadSeedData(),
    case002: loadCaseSeed('case002'),
    case003: loadCaseSeed('case003'),
    case004: loadCaseSeed('case004'),
  };
  const canonicalCaseByLesson = {
    'sql-intro': 'case001',
    'dml-select-where': 'case001',
    'aggregation-groupby': 'case001',
    'having-where-orderby-like': 'case001',
    'joins-inner-left': 'case001',
    'cte-subqueries': 'case001',
    'case-when': 'case001',
    views: 'case001',
    'string-functions': 'case002',
    'window-functions': 'case003',
    'null-handling': 'case004',
    'json-functions': 'case004',
  };

  console.log('\n[1] Walkthroughs executam no banco canônico do exemplo');
  for (const [lessonId, caseId] of Object.entries(canonicalCaseByLesson)) {
    const item = getCourseContentById(lessonId);
    const db = new SQL.Database();
    const data = databases[caseId];
    db.run(data.SCHEMA_SQL);
    db.run(data.SEED_SQL);
    try {
      db.exec(item.lesson.walkthrough.code);
      assert(true, `${lessonId} executa em ${caseId}`);
    } catch (error) {
      assert(false, `${lessonId} executa em ${caseId}: ${error.message}`);
    } finally {
      db.close();
    }
  }

  console.log('\n[2] Mensagens SQLite reproduzem o erro exibido');
  for (const lessonId of ['string-functions', 'json-functions']) {
    const caseId = canonicalCaseByLesson[lessonId];
    const item = getCourseContentById(lessonId);
    const db = new SQL.Database();
    const data = databases[caseId];
    db.run(data.SCHEMA_SQL);
    db.run(data.SEED_SQL);
    try {
      db.exec(item.lesson.classicError.wrongCode);
      assert(false, `${lessonId} deveria reproduzir um erro SQLite`);
    } catch (error) {
      assert(error.message === item.lesson.classicError.errorMessage,
        `${lessonId} usa a mensagem real do SQLite`);
    } finally {
      db.close();
    }
  }

  console.log('\n[3] Sínteses sem transcrição direta são identificadas');
  for (const lessonId of ['case-when', 'string-functions', 'window-functions', 'null-handling', 'json-functions']) {
    const item = getCourseContentById(lessonId);
    assert(Boolean(item.lesson.sourceNote), `${lessonId} informa que é síntese pedagógica`);
  }
  assert(!JSON.stringify(COURSE_CONTENT).includes('no such function: SUBSTRING'),
    'catálogo não afirma incorretamente que SQLite rejeita SUBSTRING');

  console.log('\n[4] As 12 missões renderizam uma aula completa e segura');
  const requiredTitles = ['POR QUE ISSO IMPORTA', 'COMO FUNCIONA', 'PASSO A PASSO', 'O ERRO CLÁSSICO', 'CHECKPOINT', 'NA MISSÃO'];
  for (const level of LEVELS) {
    const items = level.courseRefs.map(getCourseContentById).filter(Boolean);
    const html = renderLessonHtml(items, level);
    const detailsCount = (html.match(/<details\b/g) || []).length;
    assert(requiredTitles.every(title => html.includes(title)) && html.includes('class="lesson-foot"'),
      `missão ${level.id} contém a anatomia pedagógica completa`);
    assert(detailsCount === 1 && !html.includes('undefined') && !html.includes('style="'),
      `missão ${level.id} usa só o checkpoint expansível e não vaza HTML inválido`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
  console.log('='.repeat(50));
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
