/**
 * load-source.js — Bridge ES Module → CommonJS para testes.
 *
 * Lê os módulos ES do src/, transforma import/export em CommonJS,
 * e avalia em contexto isolado via vm.runInNewContext.
 *
 * Isso garante que os testes exercitam o código real do navegador.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC_DIR = path.join(__dirname, '..', '..', 'src');

/**
 * Lê um arquivo do src/ e retorna seu conteúdo como string.
 * @param {string} filename — nome do arquivo (ex: 'executor.js')
 * @returns {string}
 */
function readSource(filename) {
  return fs.readFileSync(path.join(SRC_DIR, filename), 'utf-8');
}

/**
 * Transforma um módulo ES em código CommonJS avaliável.
 * Remove imports, converte exports para atribuições no objeto `exports`.
 * @param {string} code — código do módulo ES
 * @returns {string} — código CJS
 */
function transformESM(code) {
  let transformed = code;

  // Remove linhas de import (não precisamos delas — as dependências serão injetadas)
  transformed = transformed.replace(/^\s*import\s+.*?from\s+['"].*?['"];?\s*$/gm, '');
  transformed = transformed.replace(/^\s*import\s+['"].*?['"];?\s*$/gm, '');

  // Converte: export function name(...) { → function name(...) {; exports.name = name;
  // (fazemos em dois passos: remove export, depois coleta nomes)
  const exportedNames = [];

  // export async function name(
  transformed = transformed.replace(
    /^(\s*)export\s+async\s+function\s+(\w+)\s*\(/gm,
    (match, indent, name) => {
      exportedNames.push(name);
      return `${indent}async function ${name}(`;
    }
  );

  // export function name(
  transformed = transformed.replace(
    /^(\s*)export\s+function\s+(\w+)\s*\(/gm,
    (match, indent, name) => {
      exportedNames.push(name);
      return `${indent}function ${name}(`;
    }
  );

  // export const name = ...
  transformed = transformed.replace(
    /^(\s*)export\s+const\s+(\w+)\s*=/gm,
    (match, indent, name) => {
      exportedNames.push(name);
      return `${indent}const ${name} =`;
    }
  );

  // export let name = ...
  transformed = transformed.replace(
    /^(\s*)export\s+let\s+(\w+)\s*=/gm,
    (match, indent, name) => {
      exportedNames.push(name);
      return `${indent}let ${name} =`;
    }
  );

  // export { ... } (named re-exports — coleta nomes)
  transformed = transformed.replace(
    /^(\s*)export\s*\{([^}]+)\};?\s*$/gm,
    (match, indent, names) => {
      const parts = names.split(',').map(n => n.trim().split(/\s+as\s+/));
      for (const p of parts) {
        const exportName = p.length > 1 ? p[1] : p[0];
        const localName = p[0];
        exportedNames.push({ local: localName, exported: exportName });
      }
      return ''; // Remove a linha
    }
  );

  // Adiciona as atribuições de export no final
  let exportLines = '\n// === Auto-generated exports ===\n';
  for (const name of exportedNames) {
    if (typeof name === 'string') {
      exportLines += `exports.${name} = ${name};\n`;
    } else {
      exportLines += `exports.${name.exported} = ${name.local};\n`;
    }
  }
  transformed += exportLines;

  return transformed;
}

/**
 * Avalia um módulo transformado em contexto isolado.
 * @param {string} code — código CJS transformado
 * @param {object} [sandbox] — variáveis adicionais a injetar
 * @param {string} [filename] — nome do arquivo para stack traces
 * @returns {object} — exports do módulo
 */
function evalModule(code, sandbox = {}, filename = '<module>') {
  const exports = {};
  const module = { exports };

  const context = {
    exports,
    module,
    require,
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Error,
    RegExp,
    Array,
    Object,
    String,
    Number,
    JSON,
    Math,
    Set,
    Map,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    AbortController,
    AbortSignal,
    ...sandbox,
  };

  vm.runInNewContext(code, context, { filename });
  return exports;
}

// ====================================================================
// Módulos pré-carregados
// ====================================================================

/**
 * Carrega o executor.js real do src/.
 * @returns {object} — { executeQuery, stripComments, normalizeSQL, countStatements, getFirstKeyword, findBlockedKeyword, ... }
 */
function loadExecutor() {
  const code = readSource('executor.js');
  const transformed = transformESM(code);
  return evalModule(transformed, {}, 'executor.js');
}

/**
 * Carrega o validator.js real do src/.
 * Precisa de executeQuery injetado.
 * @param {Function} executeQuery — função executeQuery do executor
 * @returns {object}
 */
function loadValidator(executeQuery) {
  const code = readSource('validator.js');
  let transformed = transformESM(code);

  // O validator importa executeQuery de executor.js — já removemos o import,
  // mas precisamos injetar a função. Adicionamos no topo:
  transformed = `const executeQuery = __injected_executeQuery;\n` + transformed;

  return evalModule(transformed, { __injected_executeQuery: executeQuery }, 'validator.js');
}

/**
 * Carrega o scoring.js real do src/.
 * @returns {object}
 */
function loadScoring() {
  const code = readSource('scoring.js');
  const transformed = transformESM(code);
  return evalModule(transformed, {}, 'scoring.js');
}

/**
 * Carrega o storage.js real do src/.
 * Precisa de um mock de localStorage.
 * @param {object} localStorageMock
 * @returns {object}
 */
function loadStorage(localStorageMock) {
  const code = readSource('storage.js');
  const transformed = transformESM(code);
  return evalModule(transformed, { localStorage: localStorageMock }, 'storage.js');
}

/**
 * Carrega o levels.js real do src/.
 * @returns {object}
 */
function loadLevels() {
  const code = readSource('levels.js');
  const transformed = transformESM(code);
  return evalModule(transformed, {}, 'levels.js');
}

/**
 * Carrega o course-content.js real do src/.
 * @returns {object}
 */
function loadCourseContent() {
  const code = readSource('course-content.js');
  const transformed = transformESM(code);
  return evalModule(transformed, {}, 'course-content.js');
}

/**
 * Extrai SCHEMA_SQL e SEED_SQL de db.js via regex.
 * Não avaliamos db.js inteiro porque ele depende de DOM e sql.js browser.
 * @returns {{ SCHEMA_SQL: string, SEED_SQL: string }}
 */
function loadSeedData() {
  const code = readSource('db.js');

  // Extrai SCHEMA_SQL (template literal)
  const schemaMatch = code.match(/const SCHEMA_SQL\s*=\s*`([\s\S]*?)`;/);
  if (!schemaMatch) throw new Error('Não foi possível extrair SCHEMA_SQL de db.js');

  // Extrai SEED_SQL (template literal)
  const seedMatch = code.match(/const SEED_SQL\s*=\s*`([\s\S]*?)`;/);
  if (!seedMatch) throw new Error('Não foi possível extrair SEED_SQL de db.js');

  return {
    SCHEMA_SQL: schemaMatch[1],
    SEED_SQL: seedMatch[1],
  };
}

module.exports = {
  readSource,
  transformESM,
  evalModule,
  loadExecutor,
  loadValidator,
  loadScoring,
  loadStorage,
  loadLevels,
  loadCourseContent,
  loadSeedData,
};
