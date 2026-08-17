/**
 * test_lesson.js — Testes unitários do renderizador puro de aulas (src/lesson.js).
 *
 * Executa com: node test/test_lesson.js
 */

const { loadLesson } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`  PASS: ${msg}`);
    passed++;
  } else {
    console.log(`  FAIL: ${msg}`);
    failed++;
  }
}

const { renderLessonHtml, toLesson, escapeHtml } = loadLesson();

console.log('=== Testes do Renderizador de Aulas (src/lesson.js) ===\n');

// Mock de aula completa
const mockFullItem = {
  id: 'mock-lesson',
  concept: 'Agregação e GROUP BY',
  sqliteCompatibility: 'supported',
  sourceLessons: ['aulas/Aula 8 - Funções de Agregação e Agrupamento - Parte 1-2.md'],
  lesson: {
    eyebrow: 'AGREGAÇÃO',
    headline: 'Uma linha por grupo — não uma linha por registro',
    readingMinutes: 4,
    why: 'Investigar volume é diferente de investigar transações individuais.',
    howItWorks: [
      'Funções de agregação pegam várias linhas e devolvem um valor só.',
      'GROUP BY quebra a tabela em grupos antes da conta.',
    ],
    mentalModel: {
      label: 'O PEDIDO AO MOTOR DE EXECUÇÃO',
      text: 'Leia a query como um pedido: separe por departamento e calcule.',
    },
    walkthrough: {
      intro: 'Média salarial por departamento com contagem:',
      code: `SELECT departamento,\n       COUNT(*) AS total,\n       ROUND(AVG(salario), 2) AS media\nFROM funcionarios\nGROUP BY departamento;`,
      annotations: [
        { line: 1, text: 'Coluna de agrupamento.' },
        { line: 5, text: 'Cláusula de agrupamento.' },
      ],
      result: 'Uma linha por departamento distinto.',
    },
    classicError: {
      engine: 'PostgreSQL',
      wrongCode: 'SELECT departamento, ROUND(AVG(salario), 2) FROM funcionarios;',
      errorMessage: 'ERROR: column "funcionarios.departamento" must appear in the GROUP BY clause',
      diagnosis: 'A query pede média geral mas inclui departamento.',
      fix: 'Acrescentar GROUP BY departamento.',
      rule: 'Toda coluna fora de função agregada vai para o GROUP BY.',
    },
    checkpoint: {
      question: 'Quantas linhas retorna SELECT cargo, COUNT(*) FROM funcionarios GROUP BY cargo?',
      answer: 'Uma por cargo distinto.',
    },
    bridge: 'Nesta missão você vai agrupar operadores para identificar desvios de frequência.',
    sqliteNote: 'SQLite aceita coluna fora do GROUP BY sem erro, mas devolve valor arbitrário.',
  },
};

const mockSecondaryItem = {
  id: 'mock-secondary',
  concept: 'INNER JOIN e LEFT JOIN',
  sqliteCompatibility: 'supported',
  sourceLessons: ['aulas/Aula 10 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 1-5.md'],
  lesson: {
    eyebrow: 'JUNÇÕES',
    headline: 'Combinando tabelas relacionadas',
    readingMinutes: 3,
    why: 'Dados normalizados ficam em tabelas separadas.',
    howItWorks: ['INNER JOIN traz apenas correspondências.'],
    mentalModel: { label: 'DIAGRAMA DE VENN', text: 'Interseção entre tabelas.' },
    walkthrough: {
      intro: 'Exemplo de INNER JOIN:',
      code: 'SELECT f.nome, t.valor FROM transacoes t INNER JOIN funcionarios f ON t.op_id = f.id;',
      annotations: [],
      result: 'Transações com o nome do operador.',
    },
    classicError: {
      engine: 'PostgreSQL',
      wrongCode: 'SELECT nome, valor FROM transacoes t JOIN funcionarios f;',
      errorMessage: 'ERROR: syntax error at end of input',
      diagnosis: 'Falta cláusula ON.',
      fix: 'Adicionar ON.',
      rule: 'Todo JOIN relacional precisa de cláusula ON.',
    },
    checkpoint: { question: 'O que acontece sem ON?', answer: 'Produto cartesiano.' },
    bridge: 'Cruzar transações com funcionários.',
  },
};

const mockLevel = { id: 6, title: 'Volume Atípico', objective: 'Contar operações por responsável.', tables: ['transacoes'] };

// --- 1. Aula Completa ---
console.log('1. Renderização de aula completa:');
const fullHtml = renderLessonHtml([mockFullItem, mockSecondaryItem], mockLevel);

assert(fullHtml.includes('class="lesson"'), 'Possui container principal .lesson');
assert(fullHtml.includes('class="lesson-eyebrow"'), 'Possui eyebrow');
assert(fullHtml.includes('AULA · AGREGAÇÃO'), 'Eyebrow identifica explicitamente a aula');
assert(fullHtml.includes('Uma linha por grupo — não uma linha por registro'), 'Exibe a headline correta');
assert(fullHtml.includes('Missão 06'), 'Exibe metadados com número da missão formatado');
assert(fullHtml.includes('POR QUE ISSO IMPORTA'), 'Bloco 1 (why) renderizado');
assert(fullHtml.includes('COMO FUNCIONA'), 'Bloco 2 (howItWorks) renderizado');
assert(fullHtml.includes('O PEDIDO AO MOTOR DE EXECUÇÃO'), 'Modelo mental renderizado');
assert(fullHtml.includes('class="lesson-code"'), 'Bloco 3 (walkthrough) com lista ordenada de código');
assert(fullHtml.includes('EXEMPLO-BASE:') && fullHtml.includes('<code>transacoes</code>'), 'Exemplo orienta a adaptação ao schema atual');
assert(fullHtml.includes('class="is-annotated"'), 'Linhas anotadas recebem classe .is-annotated');
assert(fullHtml.includes('class="lesson-marker"'), 'Marcador ① renderizado no código e anotação');
assert(fullHtml.includes('class="lesson-notes"'), 'Anotações renderizadas em lista');
assert(fullHtml.includes('O que sai:'), 'Resultado esperado renderizado');
assert(fullHtml.includes('O ERRO CLÁSSICO'), 'Bloco 4 (classicError) renderizado');
assert(fullHtml.includes('MOTOR: PostgreSQL'), 'Identifica o motor da mensagem de erro');
assert(fullHtml.includes('ERROR: column &quot;funcionarios.departamento&quot;'), 'Mensagem de erro do motor renderizada com escape');
assert(fullHtml.includes('class="lesson-rule"'), 'Regra memorável renderizada em destaque');
assert(fullHtml.includes('CHECKPOINT'), 'Bloco 5 (checkpoint) renderizado');
assert(fullHtml.includes('<details class="lesson-checkpoint">') && fullHtml.includes('<summary>VER RESPOSTA</summary>'), 'Checkpoint usa details/summary');
assert(fullHtml.includes('NA MISSÃO 06'), 'Bloco 6 (bridge) contextualizado com número da missão');
assert(fullHtml.includes('Contar operações por responsável.'), 'Ponte usa o objetivo da missão ativa');
assert(fullHtml.includes('class="lesson-foot"'), 'Bloco 7 (rodapé) renderizado');
assert(fullHtml.includes('SQLITE: COMPATÍVEL'), 'Selo de compatibilidade SQLite presente');
assert(fullHtml.includes('REVISÃO NESTA MISSÃO'), 'Seção de revisão para curso secundário renderizada');
assert(fullHtml.includes('class="lesson-review-card"'), 'Card de revisão renderizado');
assert(fullHtml.includes('data-open-course-lesson="mock-secondary"'), 'Card de revisão permite abrir a aula completa');
assert(!fullHtml.includes('style="'), 'ZERO estilos inline gerados no HTML');
const synthesisHtml = renderLessonHtml([{ ...mockFullItem, lesson: { ...mockFullItem.lesson, sourceNote: 'Síntese pedagógica de teste.' } }], mockLevel);
assert(synthesisHtml.includes('Fonte: Síntese pedagógica de teste.'), 'Rodapé identifica conteúdo sem transcrição direta');
console.log();

// --- 2. Item Legado / Parcial ---
console.log('2. Normalização de item legado via toLesson:');
const legacyItem = {
  id: 'legacy-item',
  concept: 'Conceito Antigo',
  learningObjective: 'Aprender conceito antigo',
  explanation: 'Explicação legada.',
  syntaxExample: 'SELECT 1;',
  commonMistake: 'Erro legado comum.',
  sqliteCompatibility: 'supported',
  sourceLessons: [],
};
const legacyLesson = toLesson(legacyItem);
assert(legacyLesson.partial === true, 'Item legado marcado como partial');
assert(legacyLesson.headline === 'Aprender conceito antigo', 'Headline gerada do learningObjective');

const legacyHtml = renderLessonHtml([legacyItem]);
assert(legacyHtml.includes('AULA RESUMIDA'), 'Item legado exibe badge de AULA RESUMIDA');
assert(legacyHtml.includes('CONCEITO ANTIGO') || legacyHtml.includes('Aprender conceito antigo'), 'Renderiza conceito legado');
assert(!legacyHtml.includes('style="'), 'Item legado não introduz inline styles');
console.log();

// --- 3. Lista Vazia ---
console.log('3. Renderização com lista vazia ou nula:');
const emptyHtml = renderLessonHtml([]);
assert(emptyHtml.includes('Nenhuma aula vinculada a esta missão'), 'Retorna placeholder para lista vazia');
const nullHtml = renderLessonHtml(null);
assert(nullHtml.includes('Nenhuma aula vinculada a esta missão'), 'Retorna placeholder para nulo');
console.log();

// --- 4. escapeHtml ---
console.log('4. Função auxiliar escapeHtml:');
assert(escapeHtml('<script>alert("xss") & \'foo\'</script>') === '&lt;script&gt;alert(&quot;xss&quot;) &amp; &#039;foo&#039;&lt;/script&gt;', 'Caracteres especiais devidamente escapados');
assert(escapeHtml(null) === '', 'Retorna string vazia para null');
assert(escapeHtml(undefined) === '', 'Retorna string vazia para undefined');
console.log();

console.log('='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
