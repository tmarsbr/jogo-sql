/**
 * test_course_content.js — Testes do catálogo curricular e integração com missões.
 *
 * Executa com: node test/test_course_content.js
 *
 * Valida:
 * - Todos os itens de COURSE_CONTENT têm campos obrigatórios
 * - Cada courseRef nas missões aponta para um item existente
 * - Cada missão tem pelo menos uma referência de aula
 * - Cada item de conteúdo tem uma classificação de implementação
 * - sourceLessons apontam para arquivos existentes em aulas/
 * - Recursos incompatíveis com SQLite estão marcados corretamente
 * - O conteúdo do curso não expõe o SPOILER
 */

const fs = require('fs');
const path = require('path');
const { loadLevels, loadCourseContent } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) { if (cond) { console.log(`  PASS: ${msg}`); passed++; } else { console.log(`  FAIL: ${msg}`); failed++; } }

const levels = loadLevels();
const course = loadCourseContent();

const AULAS_DIR = path.join(__dirname, '..', 'aulas');

// Lista todos os arquivos .md em aulas/
const aulaFiles = fs.existsSync(AULAS_DIR)
  ? fs.readdirSync(AULAS_DIR).filter(f => f.endsWith('.md'))
  : [];

console.log('=== Testes do Catálogo Curricular (Fase 10) ===\n');

// --- Teste 1: Todos os itens têm campos obrigatórios ---
console.log('1. Estrutura dos itens de COURSE_CONTENT:');
const requiredFields = ['id', 'sourceLessons', 'concept', 'learningObjective', 'explanation', 'syntaxExample', 'commonMistake', 'sqliteCompatibility', 'relatedLevels', 'implementationType'];
for (const item of course.COURSE_CONTENT) {
  for (const field of requiredFields) {
    assert(item[field] !== undefined && item[field] !== null, `Item "${item.id}" tem campo "${field}"`);
  }
}
console.log();

// --- Teste 2: IDs únicos ---
console.log('2. IDs únicos em COURSE_CONTENT:');
const ids = course.COURSE_CONTENT.map(i => i.id);
const uniqueIds = new Set(ids);
assert(ids.length === uniqueIds.size, `Todos os ${ids.length} IDs são únicos`);
console.log();

// --- Teste 3: Cada missão tem courseRefs ---
console.log('3. Cada missão tem pelo menos uma referência de aula:');
for (const level of levels.LEVELS) {
  assert(
    level.courseRefs && level.courseRefs.length > 0,
    `Missão ${level.id} (${level.title}) tem courseRefs`
  );
}
console.log();

// --- Teste 4: Cada courseRef aponta para um item existente ---
console.log('4. Cada courseRef aponta para um item existente em COURSE_CONTENT:');
const courseIds = new Set(course.COURSE_CONTENT.map(i => i.id));
for (const level of levels.LEVELS) {
  if (level.courseRefs) {
    for (const ref of level.courseRefs) {
      assert(courseIds.has(ref), `Missão ${level.id} courseRef "${ref}" existe em COURSE_CONTENT`);
    }
  }
}
console.log();

// --- Teste 4b: Verifica courseRefs sem aula de origem (documenta limitação) ---
console.log('4b. CourseRefs sem aula de origem (sourceLessons vazio):');
let refsWithoutLessons = [];
for (const level of levels.LEVELS) {
  if (level.courseRefs) {
    for (const ref of level.courseRefs) {
      const item = course.getCourseContentById(ref);
      if (item && item.sourceLessons.length === 0) {
        refsWithoutLessons.push({ level: level.id, ref, note: item.note || 'sem nota' });
      }
    }
  }
}
if (refsWithoutLessons.length > 0) {
  for (const r of refsWithoutLessons) {
    console.log(`  NOTA: Missão ${r.level} courseRef "${r.ref}" não tem aula de origem — ${r.note.substring(0, 60)}...`);
  }
  const uniqueRefsWithout = new Set(refsWithoutLessons.map(r => r.ref));
  assert(uniqueRefsWithout.size === 1 && uniqueRefsWithout.has('case-when'),
    `Apenas CASE WHEN não tem aula de origem (${uniqueRefsWithout.size} item(ns) sem aula, referenciado(s) por ${refsWithoutLessons.length} missão(ões))`);
} else {
  assert(true, 'Todos os courseRefs têm aula de origem');
}
console.log();

// --- Teste 5: Cada item tem uma classificação de implementação válida ---
console.log('5. Classificação de implementação válida:');
const validTypes = ['mission', 'lab', 'conceptual'];
for (const item of course.COURSE_CONTENT) {
  assert(validTypes.includes(item.implementationType), `Item "${item.id}" tem implementationType válido ("${item.implementationType}")`);
}
console.log();

// --- Teste 6: sourceLessons apontam para arquivos existentes ---
console.log('6. sourceLessons apontam para arquivos existentes em aulas/:');
for (const item of course.COURSE_CONTENT) {
  for (const lesson of item.sourceLessons) {
    const filename = path.basename(lesson);
    const found = aulaFiles.some(f => f === filename);
    assert(found, `Item "${item.id}" sourceLesson "${filename}" existe em aulas/`);
  }
}
console.log();

// --- Teste 7: sqliteCompatibility é um valor válido ---
console.log('7. sqliteCompatibility é válido:');
const validCompat = ['supported', 'partial', 'unsupported'];
for (const item of course.COURSE_CONTENT) {
  assert(validCompat.includes(item.sqliteCompatibility), `Item "${item.id}" tem sqliteCompatibility válido ("${item.sqliteCompatibility}")`);
}
console.log();

// --- Teste 8: Conteúdo não expõe o SPOILER ---
console.log('8. Conteúdo do curso não expõe o SPOILER:');
const spoilerPath = path.join(__dirname, '..', 'SPOILER.md');
const spoilerContent = fs.readFileSync(spoilerPath, 'utf-8');
// Extrair nomes e IDs do SPOILER que não devem aparecer no conteúdo do curso
const spoilerNames = ['Camila Torres', 'Camila', 'ID=7', 'ID 7', 'funcionária 7'];
for (const item of course.COURSE_CONTENT) {
  const fullText = JSON.stringify(item);
  for (const name of spoilerNames) {
    assert(!fullText.includes(name), `Item "${item.id}" não expõe "${name}" do SPOILER`);
  }
}
console.log();

// --- Teste 9: getCourseContentByLevel funciona ---
console.log('9. getCourseContentByLevel funciona:');
const itemsLevel1 = course.getCourseContentByLevel(1);
assert(itemsLevel1.length > 0, 'Missão 1 retorna itens de conteúdo');
assert(itemsLevel1.every(i => i.relatedLevels.includes(1)), 'Todos os itens retornados incluem nível 1');

const itemsLevel12 = course.getCourseContentByLevel(12);
assert(itemsLevel12.length >= 3, 'Missão 12 retorna pelo menos 3 itens de conteúdo (JOIN + GROUP BY + subquery + CASE)');
console.log();

// --- Teste 10: getCourseContentById funciona ---
console.log('10. getCourseContentById funciona:');
const item = course.getCourseContentById('joins-inner-left');
assert(item !== undefined, 'getCourseContentById("joins-inner-left") retorna item');
assert(item.concept.includes('INNER JOIN'), 'Item retornado tem conceito correto');

const notFound = course.getCourseContentById('nonexistent-id');
assert(notFound === undefined, 'getCourseContentById("nonexistent-id") retorna undefined');

const viewsItem = course.getCourseContentById('views');
assert(viewsItem.implementationType === 'mission', 'Views está classificado como conteúdo de missão prática');
assert(viewsItem.relatedLevels.includes(11), 'Views está relacionado às novas missões 11');
console.log();

// --- Teste 11: Todos os arquivos de aulas aparecem no curriculum-map.md ou são marcados ---
console.log('11. Curriculum map cobre todos os arquivos de aulas:');
const curriculumPath = path.join(__dirname, '..', 'docs', 'curriculum-map.md');
const curriculumContent = fs.readFileSync(curriculumPath, 'utf-8');
let coveredCount = 0;
let uncoveredFiles = [];
for (const file of aulaFiles) {
  if (curriculumContent.includes(file)) {
    coveredCount++;
  } else {
    uncoveredFiles.push(file);
  }
}
assert(coveredCount >= aulaFiles.length * 0.8, `Pelo menos 80% dos arquivos estão no curriculum-map.md (${coveredCount}/${aulaFiles.length})`);
if (uncoveredFiles.length > 0) {
  console.log(`  NOTA: ${uncoveredFiles.length} arquivos não referenciados diretamente (podem estar agrupados)`);
}
console.log();

// --- Teste 12: Missões existentes continuam validando (sanity check) ---
console.log('12. Missões ainda têm campos obrigatórios (não quebraram):');
const levelFields = ['id', 'title', 'concept', 'briefing', 'objective', 'tables', 'expectedColumns', 'referenceQuery', 'requiredConcepts', 'hints', 'evidence', 'explanation'];
for (const level of levels.LEVELS) {
  for (const field of levelFields) {
    assert(level[field] !== undefined, `Missão ${level.id} tem campo "${field}"`);
  }
}
console.log();

// --- Resumo ---
console.log('=== Resumo ===');
console.log(`Passou: ${passed}`);
console.log(`Falhou: ${failed}`);
if (failed > 0) {
  console.log('HÁ FALHAS!');
  process.exit(1);
} else {
  console.log('Todos os testes passaram!');
}
