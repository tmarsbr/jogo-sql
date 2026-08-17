# Aula Integrada — SQL Detective

> **For Hermes:** implementar nativamente, sem dependências novas. Toda mudança visual usa os tokens do `DESIGN.md`.

**Goal:** Transformar o bloco "CONTEÚDO DO CURSO" — hoje um `<details>` cinza no rodapé do briefing — em uma **aba AULA** de primeira classe no Painel Investigativo, com anatomia pedagógica fixa de 7 blocos, alimentada por conteúdo extraído das transcrições em `aulas/`.

**Architecture:**
- Novo campo opcional `lesson` em cada item de `COURSE_CONTENT`. Itens sem `lesson` continuam funcionando via fallback montado a partir dos campos atuais — a migração é item a item, sem big bang.
- Novo módulo puro `src/lesson.js`: recebe `(courseItem, level)` e devolve string de HTML. Sem DOM, sem estado — testável direto no Node como os demais módulos puros do projeto.
- `src/ui.js` só faz `innerHTML` do resultado e cuida da aba. `src/app.js` só passa os dados.
- Nenhum estilo inline: componentes `.lesson-*` novos no `index.css`.

**Tech Stack:** ES modules nativos, CSS custom properties, `<details>` apenas onde é semanticamente correto (checkpoint). Sem bundler, sem libs.

---

## Diagnóstico — por que hoje não parece uma aula

Sete problemas, cada um com endereço no código:

1. **Componente errado, semântica errada.** `src/ui.js:334` reusa `.schema-section` (`index.css:1204`) — o componente do *esquema do banco*: `border-top` cinza + `summary` de 9px em `--text-subdued`. A aula herda o peso visual de um rodapé técnico e aparece imediatamente acima do bloco "ESQUEMA DO BANCO" com exatamente a mesma aparência. Visualmente, aula e dump de schema são a mesma coisa.

2. **Estilos inline.** `src/ui.js:331-345` carrega 8 atributos `style="…"` com cores, tamanhos e paddings hardcoded. Fora do design system, sem hover, sem foco, sem responsividade.

3. **A aula nasce fechada.** `<details>` sem `open`. O aluno vê o rótulo "CONTEÚDO DO CURSO" e dois títulos; o conteúdo exige dois cliques e não sinaliza que vale a pena.

4. **Hierarquia plana.** Título de seção em 9px, nome do conceito dentro de um `<summary>` no mesmo peso de "ESQUEMA DO BANCO". Nada na página diz "isto aqui é a aula".

5. **Modelo de dados raso.** `explanation` é um parágrafo único que empilha definição + regra + consequência (`course-content.js:83`). Não existe campo para: por que importa, raciocínio passo a passo, exemplo anotado, erro reproduzido, checkpoint, ponte com a missão. Não é problema de redação — é falta de estrutura onde escrever.

6. **Exemplo sem didática.** `syntaxExample` vira um `<pre>` ciano monocromático. Sem numeração de linha, sem anotação, sem separar "forma geral" de "aplicado ao caso", sem dizer o que sai do outro lado.

7. **A melhor parte da transcrição é descartada.** Comparando a Aula 8 com o item `aggregation-groupby`:

| Na transcrição (Aula 8) | No jogo hoje |
|---|---|
| A mensagem de erro real do SGBD: *"A coluna departamento, da tabela funcionários, precisa aparecer na cláusula GROUP BY, ou então ser usada na função de agregação"* | ausente |
| A regra memorável, repetida 3× pelo professor: *"toda e qualquer coluna que não estiver na função de agregação tem que ir para o GROUP BY"* | meia frase dentro de `commonMistake` |
| O *porquê* do ROUND com AVG: média envolve divisão → muitas casas decimais; as outras funções não dividem | "não usar ROUND com AVG" |
| A narração do motor de execução: *"querido motor, vá até funcionários, para cada departamento pegue o salário, some e divida pelo número de funcionários"* | ausente |
| A sequência didática: agregado global → tentativa segmentada → erro → GROUP BY | ausente |

O conteúdo bom já existe em `aulas/`. Ele só não tem onde morar no modelo atual.

---

## Direção — anatomia fixa da aula

Toda aula, para todo conceito, tem os mesmos 7 blocos na mesma ordem. Previsibilidade é o que faz parecer curso e não texto solto.

| # | Bloco | Papel | Campo |
|---|---|---|---|
| 0 | **Cabeçalho** | `AULA · AGREGAÇÃO` + manchete + tempo de leitura | `eyebrow`, `headline`, `readingMinutes` |
| 1 | **Por que isso importa** | Gancho de 2–3 linhas ligado ao trabalho de investigação | `why` |
| 2 | **Como funciona** | 2–3 parágrafos curtos + modelo mental / analogia em destaque | `howItWorks`, `mentalModel` |
| 3 | **Passo a passo** | Exemplo com linhas numeradas e anotações marcadas ①②③ + o que sai do outro lado | `walkthrough` |
| 4 | **O erro clássico** | Query que quebra → mensagem real do SGBD → diagnóstico → correção → regra em destaque | `classicError` |
| 5 | **Checkpoint** | 1 pergunta de autoavaliação, resposta em `<details>` (único uso legítimo) | `checkpoint` |
| 6 | **Na missão** | Ponte explícita: como o conceito aparece no objetivo atual | `bridge` |
| 7 | **Rodapé** | Fonte (`Aula 8 — …`), compatibilidade SQLite, nota de adaptação | `sourceLessons`, `sqliteCompatibility`, `sqliteNote` |

Quando a missão referencia 2+ conceitos (ex.: missão 6 → `aggregation-groupby` + `joins-inner-left`), o primeiro `courseRef` é a **aula principal** (renderizada aberta e inteira) e os demais viram **revisão** — cartão compacto com headline + regra + link "abrir aula completa".

---

## Contexto atual

- `src/app.js:409-413` resolve `level.courseRefs` → `getCourseContentById` → passa para `renderMission`.
- `src/ui.js:311-350` renderiza briefing + o bloco de curso com estilos inline.
- `src/ui.js:721-761` controla as abas da sidebar (`activateSidebarTab`, `configureSidebarTabs`, `initSidebarTabs`); disponibilidade vem de `activeCase.GAMEPLAY`.
- `index.html:252-317` tem a `<aside>` com 5 abas: EVIDÊNCIAS, REDE, TEMPO, SUSPEITOS, DICAS.
- `test/helpers/load-source.js:216` avalia `course-content.js` inteiro — objetos aninhados funcionam sem ajuste no loader.
- `test/test_course_content.js` valida campos obrigatórios, `sourceLessons` existentes, e **bloqueia spoilers** (nomes de suspeitos não podem aparecer em nenhum campo).

---

## Tarefas

### Task 1: Estender o modelo com o campo `lesson`

**Objective:** Criar onde escrever a aula, sem quebrar nenhum item existente.

**Files:**
- Modify: `src/course-content.js` (typedef no topo + campo `lesson` nos itens)

**Details:**

Adicionar ao bloco de typedef:

```js
/**
 * @typedef {Object} LessonAnnotation
 * @property {number} line   - linha do código (1-based) que a anotação explica
 * @property {string} text   - o que aquela linha faz e por quê
 *
 * @typedef {Object} Lesson
 * @property {string} eyebrow          - rótulo curto: 'AGREGAÇÃO', 'JUNÇÕES'
 * @property {string} headline         - a ideia da aula em uma frase
 * @property {number} readingMinutes   - 2 a 5
 * @property {string} why              - por que importa (2-3 linhas)
 * @property {string[]} howItWorks     - 2 a 3 parágrafos curtos
 * @property {{label: string, text: string}} mentalModel - analogia em destaque
 * @property {{intro: string, code: string, annotations: LessonAnnotation[], result: string}} walkthrough
 * @property {{engine: string, wrongCode: string, errorMessage: string, diagnosis: string, fix: string, rule: string}} classicError
 * @property {{question: string, answer: string}} checkpoint
 * @property {string} bridge           - ponte com a missão
 * @property {string} [sqliteNote]     - só quando o SGBD da aula difere do SQLite
 */
```

E acrescentar `lesson` ao `CourseItem` como **opcional**. Item de referência já preenchido, extraído da Aula 8 (usar como molde para todos os outros):

```js
{
  id: 'aggregation-groupby',
  // ... campos atuais permanecem intactos ...
  lesson: {
    eyebrow: 'AGREGAÇÃO',
    headline: 'Uma linha por grupo — não uma linha por registro',
    readingMinutes: 4,
    why: 'Investigar volume é diferente de investigar transações. Enquanto você olha linha a linha, um padrão de frequência atípica fica invisível: são 40 transações espalhadas. Agregado por operador, o padrão aparece em 6 linhas.',
    howItWorks: [
      'São cinco funções de agregação: MIN, MAX, AVG, SUM e COUNT. Cada uma pega várias linhas e devolve um valor só. Aplicada sozinha, a função olha para a tabela inteira e devolve o número geral.',
      'GROUP BY quebra a tabela em grupos antes da conta. A agregação então roda uma vez por grupo, e o resultado tem uma linha por grupo — não uma por registro.',
      'AVG é a única das cinco que envolve divisão, e por isso devolve muitas casas decimais. Por convenção, sempre embrulhe AVG em ROUND: ROUND(AVG(salario), 2). As outras quatro não dividem e não precisam.',
    ],
    mentalModel: {
      label: 'O pedido ao motor de execução',
      text: 'Leia a query como um pedido: "vá até funcionarios, separe os funcionários por departamento; para cada departamento, pegue os salários, some e divida pelo número de funcionários daquele departamento; me devolva uma linha por departamento". O GROUP BY é a parte do "separe por".',
    },
    walkthrough: {
      intro: 'Média salarial por departamento, arredondada, com a contagem de pessoas em cada um:',
      code: `SELECT departamento,
       COUNT(*) AS total,
       ROUND(AVG(salario), 2) AS media
FROM funcionarios
GROUP BY departamento;`,
      annotations: [
        { line: 1, text: 'departamento não está dentro de nenhuma função de agregação — guarde essa observação, ela reaparece na linha 5.' },
        { line: 2, text: 'COUNT(*) conta as linhas de cada grupo, não da tabela inteira.' },
        { line: 3, text: 'ROUND envolve AVG porque a média é uma divisão. Uma função como argumento de outra.' },
        { line: 5, text: 'O grupo é o departamento. É esta cláusula que transforma "média geral" em "média por departamento".' },
      ],
      result: 'Sai uma linha por departamento distinto. Se há 4 departamentos e 40 funcionários, o resultado tem 4 linhas — nunca 40.',
    },
    classicError: {
      engine: 'PostgreSQL',
      wrongCode: 'SELECT departamento, ROUND(AVG(salario), 2)\nFROM funcionarios;',
      errorMessage: 'ERROR: column "funcionarios.departamento" must appear in the GROUP BY clause or be used in an aggregate function',
      diagnosis: 'A query pede duas coisas incompatíveis: "me dê UM número (a média geral)" e "me dê o departamento de cada linha". O motor não sabe qual departamento imprimir ao lado de um valor que resume a tabela inteira.',
      fix: 'Acrescentar GROUP BY departamento. Aí cada linha do resultado passa a ter um departamento próprio e uma média própria.',
      rule: 'Toda e qualquer coluna que não estiver dentro de uma função de agregação tem de ir para o GROUP BY.',
    },
    checkpoint: {
      question: 'Uma tabela tem 500 transações feitas por 6 operadores. Quantas linhas retorna SELECT operador_id, COUNT(*) FROM transacoes GROUP BY operador_id?',
      answer: 'Seis — uma por operador distinto. GROUP BY colapsa as 500 linhas em um resultado por grupo. Se você esperava 500, ainda está pensando em SELECT comum: agregação com GROUP BY sempre reduz o número de linhas.',
    },
    bridge: 'Nesta missão você vai contar quantas transações cada funcionário executou. É exatamente o padrão acima — GROUP BY no funcionário, COUNT(*) nas transações — só que a coluna de agrupamento vem de outra tabela, e por isso entra também o JOIN da aula ao lado.',
    sqliteNote: 'A aula usa PostgreSQL; a regra do GROUP BY vale igual em SQLite. A diferença: o SQLite é permissivo e aceita coluna fora do GROUP BY sem erro, devolvendo um valor arbitrário da linha. Não confie nisso — escreva como o Postgres exigiria.',
  },
}
```

**Verification:**
- `node test/test_course_content.js` continua passando (o campo é opcional e o loader avalia o módulo inteiro).
- Nenhum campo de `lesson` contém nome de suspeito (Teste 8 do arquivo de testes).

---

### Task 2: Validar o formato `lesson` nos testes

**Objective:** Impedir aula pela metade, anotação apontando para linha inexistente e regressão de spoiler.

**Files:**
- Modify: `test/test_course_content.js` (novo bloco de testes, após o Teste 8)

**Details:**

```js
// --- Teste 13: Itens com lesson têm a anatomia completa ---
console.log('13. Anatomia das aulas (campo lesson):');
const LESSON_FIELDS = ['eyebrow','headline','readingMinutes','why','howItWorks','mentalModel','walkthrough','classicError','checkpoint','bridge'];
for (const item of course.COURSE_CONTENT) {
  if (!item.lesson) continue;
  for (const f of LESSON_FIELDS) {
    assert(item.lesson[f] !== undefined, `Aula "${item.id}" tem lesson.${f}`);
  }
  assert(Array.isArray(item.lesson.howItWorks) && item.lesson.howItWorks.length >= 2,
    `Aula "${item.id}" tem ao menos 2 parágrafos em howItWorks`);

  const lines = item.lesson.walkthrough.code.split('\n').length;
  for (const a of item.lesson.walkthrough.annotations) {
    assert(a.line >= 1 && a.line <= lines,
      `Aula "${item.id}" anotação aponta para linha válida (${a.line} de ${lines})`);
  }
  assert(item.lesson.classicError.errorMessage.length > 20,
    `Aula "${item.id}" tem mensagem de erro real, não um resumo`);
  assert(item.lesson.readingMinutes >= 2 && item.lesson.readingMinutes <= 6,
    `Aula "${item.id}" tem tempo de leitura plausível`);
}

// --- Teste 14: Cobertura — toda missão tem aula completa no courseRef principal ---
console.log('14. Cobertura de aulas nas missões:');
for (const level of levels.LEVELS) {
  const primary = course.getCourseContentById(level.courseRefs[0]);
  assert(primary && primary.lesson,
    `Missão ${level.id} tem aula completa no courseRef principal ("${level.courseRefs[0]}")`);
}
```

> O Teste 14 vai **falhar de propósito** até a Task 8 terminar. Ele é o placar da migração — mantenha-o rodando e veja o número de falhas cair de 12 para 0.

**Verification:**
- Rodar `node test/test_course_content.js`: Teste 13 passa para o item já escrito; Teste 14 aponta exatamente quais missões faltam.

---

### Task 3: Criar `src/lesson.js` — o renderizador puro

**Objective:** Toda a montagem do HTML da aula em um módulo sem DOM, testável no Node.

**Files:**
- Create: `src/lesson.js`

**Details:**

Assinatura pública:

```js
/**
 * Monta o HTML da aba AULA.
 * @param {object[]} courseItems - primeiro item = aula principal; demais = revisão
 * @param {object} level - missão ativa (para o bloco "na missão" e o cabeçalho)
 * @returns {string} HTML
 */
export function renderLessonHtml(courseItems, level) { … }

/** Normaliza item legado (sem lesson) para a mesma forma. */
export function toLesson(item) { … }
```

`toLesson(item)` é a ponte de retrocompatibilidade: se `item.lesson` existe, devolve; senão monta um objeto mínimo a partir de `concept`, `learningObjective`, `explanation`, `syntaxExample` e `commonMistake`, marcando `partial: true`. O renderizador então omite os blocos que não têm dado (sem espaço vazio) e mostra o selo `AULA RESUMIDA` no cabeçalho. Assim nada some enquanto a redação avança.

Regras de implementação:
- `escapeHtml` — importar de `ui.js` ou duplicar local (o módulo precisa ficar independente de DOM; duplicar 5 linhas é aceitável).
- Bloco de código: renderizar como `<ol class="lesson-code">` com um `<li>` por linha; linhas anotadas recebem `class="is-annotated"` e um `<span class="lesson-marker">①</span>`. Marcadores em `['①','②','③','④','⑤','⑥']`, indexados pela ordem das anotações.
- As anotações vão numa `<ol class="lesson-notes">` logo abaixo do código, com o mesmo marcador — o olho liga os dois sem interação.
- Checkpoint: `<details class="lesson-checkpoint">` com `<summary>VER RESPOSTA</summary>`. É o único `<details>` da aula.
- Nenhum atributo `style` no output. Zero.
- Se `courseItems` estiver vazio, devolver `<p class="placeholder-text">Nenhuma aula vinculada a esta missão.</p>`.

Esqueleto do HTML gerado (a referência de classes para a Task 5):

```html
<article class="lesson">
  <header class="lesson-head">
    <span class="lesson-eyebrow">AULA · AGREGAÇÃO</span>
    <h2 class="lesson-headline">Uma linha por grupo — não uma linha por registro</h2>
    <p class="lesson-meta">4 min de leitura · Missão 06 · Fonte: Aula 8</p>
  </header>

  <section class="lesson-block lesson-why">
    <h3 class="lesson-block-title">POR QUE ISSO IMPORTA</h3>
    <p>…</p>
  </section>

  <section class="lesson-block">
    <h3 class="lesson-block-title">COMO FUNCIONA</h3>
    <p>…</p><p>…</p>
    <aside class="lesson-model">
      <span class="lesson-model-label">O PEDIDO AO MOTOR DE EXECUÇÃO</span>
      <p>…</p>
    </aside>
  </section>

  <section class="lesson-block">
    <h3 class="lesson-block-title">PASSO A PASSO</h3>
    <p class="lesson-intro">…</p>
    <ol class="lesson-code">
      <li class="is-annotated"><span class="lesson-marker">①</span><code>SELECT departamento,</code></li>
      <li><code>       COUNT(*) AS total,</code></li>
    </ol>
    <ol class="lesson-notes">
      <li><span class="lesson-marker">①</span> departamento não está dentro de…</li>
    </ol>
    <p class="lesson-result"><strong>O que sai:</strong> …</p>
  </section>

  <section class="lesson-block lesson-error">
    <h3 class="lesson-block-title">O ERRO CLÁSSICO</h3>
    <pre class="lesson-code-bad">SELECT departamento, ROUND(AVG(salario), 2) FROM funcionarios;</pre>
    <p class="lesson-engine-msg">ERROR: column "funcionarios.departamento" must appear in the GROUP BY clause…</p>
    <p class="lesson-diagnosis">…</p>
    <p class="lesson-fix"><strong>Correção:</strong> …</p>
    <p class="lesson-rule">Toda e qualquer coluna que não estiver dentro de uma função de agregação tem de ir para o GROUP BY.</p>
  </section>

  <section class="lesson-block">
    <h3 class="lesson-block-title">CHECKPOINT</h3>
    <p class="lesson-question">…</p>
    <details class="lesson-checkpoint"><summary>VER RESPOSTA</summary><p>…</p></details>
  </section>

  <section class="lesson-block lesson-bridge">
    <h3 class="lesson-block-title">NA MISSÃO 06</h3>
    <p>…</p>
  </section>

  <footer class="lesson-foot">
    <span class="lesson-source">Fonte: Aula 8 — Funções de Agregação e Agrupamento (Parte 1/2)</span>
    <span class="lesson-compat is-supported">SQLITE: COMPATÍVEL</span>
    <p class="lesson-sqlite-note">…</p>
  </footer>
</article>

<section class="lesson-review">
  <h3 class="lesson-block-title">REVISÃO NESTA MISSÃO</h3>
  <article class="lesson-review-card">
    <h4>INNER JOIN e LEFT JOIN</h4>
    <p>…headline…</p>
    <p class="lesson-rule">…rule…</p>
  </article>
</section>
```

**Verification:**
- Novo `test/test_lesson.js`: `renderLessonHtml` com item completo contém `lesson-headline`, os 7 blocos e nenhuma ocorrência de `style="`; com item legado contém `AULA RESUMIDA` e não quebra; com array vazio devolve o placeholder.

---

### Task 4: Adicionar a aba AULA ao HTML

**Objective:** Dar lugar à aula no Painel Investigativo.

**Files:**
- Modify: `index.html:253-317`

**Details:**

Inserir o botão **como primeiro** da nav (a aula vem antes das evidências — é o que se lê antes de investigar), ajustando `active`/`aria-selected` para que AULA seja a aba padrão ao abrir uma missão nova:

```html
<button id="sidebar-tab-lesson" type="button" class="sidebar-tab-btn active"
        data-sidebar-tab="lesson" role="tab" aria-selected="true"
        aria-controls="sidebar-pane-lesson">AULA</button>
```

E o painel correspondente, antes de `#sidebar-pane-evidence`:

```html
<div id="sidebar-pane-lesson" class="sidebar-tab-pane active" role="tabpanel" aria-labelledby="sidebar-tab-lesson">
  <div id="lesson-display">
    <p class="placeholder-text">A aula aparecerá aqui ao carregar a missão.</p>
  </div>
</div>
```

Com 6 abas em `flex: 1`, cada rótulo fica com ~16% da largura. "EVIDÊNCIAS" é o mais longo — verificar no viewport mínimo do desktop; se quebrar, aplicar o ajuste de `letter-spacing`/`font-size` previsto na Task 5.

**Verification:**
- Abrir o jogo: 6 abas visíveis, AULA ativa por padrão, nenhuma quebra de layout.

---

### Task 5: CSS dos componentes `.lesson-*`

**Objective:** Fazer a aula parecer aula — hierarquia real, respiro, sem herdar o visual de rodapé técnico.

**Files:**
- Modify: `index.css` (novo bloco após "Tab Evidências", ~linha 1470)

**Details:**

```css
/* --- Tab Aula --- */
.lesson {
  font-family: var(--font-body);
}

.lesson-head {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}
.lesson-eyebrow {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--accent-purple-light);
}
.lesson-headline {
  margin-top: 10px;
  font-family: var(--font-mono);
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--text-primary);
}
.lesson-meta {
  margin-top: 8px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--text-disabled);
}

.lesson-block { margin-top: 26px; }
.lesson-block-title {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--accent-cyan);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.14);
}
.lesson-block p {
  margin-top: 12px;
  font-size: 0.875rem;
  line-height: 1.75;
  color: var(--text-body);
}

/* Modelo mental */
.lesson-model {
  margin-top: 14px;
  padding: 14px;
  border-left: 2px solid var(--accent-purple);
  background: rgba(139, 92, 246, 0.06);
}
.lesson-model-label {
  font-family: var(--font-mono);
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--accent-purple-light);
}
.lesson-model p {
  margin-top: 8px;
  font-size: 0.8125rem;
  font-style: italic;
  color: var(--text-table);
}

/* Código anotado */
.lesson-code {
  margin-top: 12px;
  padding: 12px 12px 12px 0;
  list-style: none;
  counter-reset: ln;
  background: rgba(5, 8, 16, 0.86);
  border: 1px solid var(--border-highlight);
  overflow-x: auto;
}
.lesson-code li {
  counter-increment: ln;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 1px 10px 1px 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.7;
  white-space: pre;
}
.lesson-code li::before {
  content: counter(ln);
  flex: 0 0 30px;
  text-align: right;
  color: var(--text-disabled);
  font-size: 0.6875rem;
}
.lesson-code code { color: var(--accent-cyan); background: none; padding: 0; }
.lesson-code li.is-annotated { background: rgba(0, 240, 255, 0.05); }

.lesson-marker {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--accent-cyan);
  flex-shrink: 0;
}

.lesson-notes {
  margin-top: 10px;
  list-style: none;
  display: grid;
  gap: 7px;
}
.lesson-notes li {
  display: flex;
  gap: 8px;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-muted);
}
.lesson-result {
  margin-top: 12px;
  font-size: 0.8125rem !important;
  color: var(--status-success-light) !important;
}

/* Erro clássico */
.lesson-error .lesson-block-title {
  color: var(--status-danger-light);
  border-bottom-color: rgba(239, 68, 68, 0.18);
}
.lesson-code-bad {
  margin-top: 12px;
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.7;
  white-space: pre-wrap;
  color: var(--text-table);
  background: var(--status-danger-bg);
  border-left: 2px solid var(--status-danger);
}
.lesson-engine-msg {
  margin-top: 0 !important;
  padding: 10px 12px;
  font-family: var(--font-mono);
  font-size: 0.7rem !important;
  line-height: 1.6;
  color: var(--status-danger-light) !important;
  background: rgba(5, 8, 16, 0.86);
  border-left: 2px solid var(--status-danger);
  word-break: break-word;
}
.lesson-fix strong { color: var(--status-success-light); }
.lesson-rule {
  margin-top: 14px !important;
  padding: 12px 14px;
  font-family: var(--font-mono);
  font-size: 0.8125rem !important;
  line-height: 1.6;
  font-weight: 700;
  color: var(--status-warning) !important;
  background: var(--status-warning-bg);
  border: 1px solid rgba(251, 191, 36, 0.28);
}

/* Checkpoint */
.lesson-question { font-weight: 600; color: var(--text-primary) !important; }
.lesson-checkpoint { margin-top: 12px; }
.lesson-checkpoint summary {
  cursor: pointer;
  display: inline-block;
  padding: 7px 12px;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--accent-cyan);
  border: 1px solid rgba(0, 240, 255, 0.32);
  background: rgba(0, 240, 255, 0.05);
  transition: all 150ms ease;
}
.lesson-checkpoint summary:hover { background: rgba(0, 240, 255, 0.12); }
.lesson-checkpoint[open] summary { color: var(--text-subdued); border-color: var(--border-highlight); background: none; }
.lesson-checkpoint p {
  margin-top: 12px;
  padding: 12px;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--text-body);
  border-left: 2px solid var(--status-success);
  background: var(--status-success-bg);
}

/* Ponte com a missão */
.lesson-bridge .lesson-block-title { color: var(--status-success-light); border-bottom-color: rgba(34, 197, 94, 0.2); }

/* Rodapé */
.lesson-foot {
  margin-top: 28px;
  padding-top: 14px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.lesson-source, .lesson-compat {
  font-family: var(--font-mono);
  font-size: 8.5px;
  letter-spacing: 0.12em;
  color: var(--text-disabled);
}
.lesson-compat { padding: 3px 7px; border: 1px solid var(--border-highlight); }
.lesson-compat.is-supported  { color: var(--status-success); border-color: rgba(34, 197, 94, 0.3); }
.lesson-compat.is-partial    { color: var(--status-warning); border-color: rgba(251, 191, 36, 0.3); }
.lesson-compat.is-unsupported{ color: var(--status-danger-light); border-color: rgba(239, 68, 68, 0.3); }
.lesson-sqlite-note {
  flex-basis: 100%;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--text-muted);
}

/* Revisão (courseRefs secundários) */
.lesson-review { margin-top: 30px; }
.lesson-review-card {
  margin-top: 10px;
  padding: 12px 14px;
  border: 1px solid var(--border-card);
  background: var(--bg-surface);
}
.lesson-review-card h4 {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--accent-purple-light);
}
.lesson-review-card p { margin-top: 7px; font-size: 0.8125rem; line-height: 1.6; color: var(--text-muted); }

/* Selo de aula ainda não redigida */
.lesson-partial-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 0.14em;
  color: var(--text-subdued);
  border: 1px dashed var(--border-highlight);
}

/* 6 abas cabem no rail */
.sidebar-tab-btn { padding: 13px 2px; letter-spacing: 0.08em; }
```

**Verification:**
- `grep -c 'style="' src/lesson.js` → `0`.
- Inspecionar a aba com um item completo: cada bloco tem título próprio, o código tem números de linha e destaque nas linhas anotadas, a regra aparece em âmbar.

---

### Task 6: Ligar tudo — `ui.js` e `app.js`

**Objective:** Renderizar a aula na aba e limpar o briefing.

**Files:**
- Modify: `src/ui.js:311-350` (remover o bloco `course-refs`; adicionar `setLesson`)
- Modify: `src/ui.js:742-752` (`configureSidebarTabs` reconhece `lesson`)
- Modify: `src/app.js:409-429`

**Details:**

Em `ui.js`, registrar o novo nó em `dom` (junto dos demais, ~linha 86):

```js
dom.lessonDisplay = $('#lesson-display');
```

Substituir o bloco `if (courseItems && courseItems.length > 0) { … }` de `renderMission` por um ponteiro discreto, mantendo a assinatura da função:

```js
if (courseItems && courseItems.length > 0) {
  html += `
    <div class="mission-lesson-link">
      <button type="button" class="btn btn-lesson" data-open-lesson>
        VER AULA · ${escapeHtml(courseItems[0].concept)}
      </button>
    </div>`;
}
```

Nova função exportada:

```js
export function setLesson(html) {
  if (dom.lessonDisplay) dom.lessonDisplay.innerHTML = html;
}
```

Em `configureSidebarTabs`, `lesson` entra na disponibilidade — sempre visível quando a missão tem `courseRefs`:

```js
export function configureSidebarTabs({ graph = false, timeline = false, suspects = false, lesson = true } = {}) {
  const availability = { lesson, evidence: true, graph, timeline, suspects, hints: true };
  …
}
```

Em `initSidebarTabs`, delegar o clique do botão do briefing:

```js
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-open-lesson]')) activateSidebarTab('lesson');
});
```

Em `app.js`, importar e chamar logo após `renderMission`:

```js
import { renderLessonHtml } from './lesson.js';
…
renderMission(level, courseItems);
setLesson(renderLessonHtml(courseItems, level));
…
configureSidebarTabs({
  graph: Boolean(activeCase.GAMEPLAY?.graph),
  timeline: Boolean(activeCase.GAMEPLAY?.timeline),
  suspects: Boolean(activeCase.GAMEPLAY?.suspects),
  lesson: courseItems.length > 0,
});
```

**Regra de aba ativa:** ao entrar em uma missão **não concluída** pela primeira vez, abrir em AULA. Ao voltar para uma missão já concluída, preservar a aba anterior. Implementar em `app.js`, logo após `configureSidebarTabs`:

```js
if (courseItems.length > 0 && !state.completedLevels.includes(levelId)) {
  activateSidebarTab('lesson');
}
```

**Verification:**
- Carregar a missão 1: aba AULA ativa com a aula renderizada; briefing termina com o botão VER AULA.
- Concluir e voltar: a aba escolhida antes é preservada.
- Missão sem `courseRefs` (se houver): aba AULA some, sem erro no console.

---

### Task 7: Estado de leitura (opcional, mas barato)

**Objective:** Fazer a aula ter progressão visível, como um curso.

**Files:**
- Modify: `src/storage.js`, `src/state.js`, `src/ui.js`

**Details:**
- `state.lessonsRead: string[]` — ids de `COURSE_CONTENT` já lidos; persistir junto do progresso existente em `storage.js`.
- Marcar como lido quando o pane da aula for rolado até o fim **ou** quando o checkpoint for aberto (evento `toggle` no `<details>`), o que vier primeiro.
- Ponto verde de 5px no botão da aba quando a aula da missão atual ainda não foi lida (`.sidebar-tab-btn.has-unread::after`).
- No rail de missões e no botão VER AULA, marcar as já lidas com `✓`.

Não bloqueia nada — é sinalização, não gate.

**Verification:**
- Ler uma aula, recarregar a página: o ponto de "não lida" não volta.

---

### Task 8: Redigir as 11 aulas restantes a partir de `aulas/`

**Objective:** Preencher `lesson` em todo item com `implementationType: 'mission'`.

**Files:**
- Modify: `src/course-content.js`

**Details:**

**Processo por item** (repetir; ~40 min cada):

1. Abrir os `sourceLessons` do item e ler a transcrição inteira.
2. Extrair literalmente, sem parafrasear:
   - a **mensagem de erro** que o professor provoca na tela (vira `classicError.errorMessage`);
   - a **regra que ele repete** ou manda anotar (vira `classicError.rule`);
   - a **analogia / narração do motor** (vira `mentalModel`);
   - o **porquê** por trás de cada convenção (ex.: ROUND com AVG) — vai para `howItWorks`, nunca some.
3. Escrever `why` e `bridge` ligando ao caso — **sem citar suspeitos** (ver regra abaixo).
4. Montar `walkthrough` a partir do exemplo da aula, adaptado ao schema do jogo, com 3–5 anotações.
5. Escrever o `checkpoint`: pergunta que separa quem entendeu de quem decorou. Bom checkpoint pergunta *quantas linhas saem*, *o que muda se eu trocar X por Y*, *por que isso dá erro* — nunca "o que significa GROUP BY".
6. Rodar `node test/test_course_content.js`.

**Regra anti-spoiler (não negociável):** o Teste 8 rejeita `Camila Torres`, `Camila`, `ID=7`, `ID 7`, `funcionária 7` em qualquer campo do item. `why` e `bridge` falam de *padrões* ("um operador com frequência atípica"), nunca de pessoas.

**Ordem de execução** — pelo impacto (missões que o aluno encontra primeiro):

| # | Item | Aulas-fonte | Missões |
|---|---|---|---|
| 1 | `dml-select-where` | Aula 7 (DML Parte 2/2) | 1, 2, 4 |
| 2 | `having-where-orderby-like` | Aula 9 (Agregação Parte 2/2) | 3, 7, 9 |
| 3 | `joins-inner-left` | Aulas 10 e 11 (JOINs Partes 1–2/5) | 5, 8, 12 |
| 4 | `cte-subqueries` | Aulas 15, 17, 18 (Subconsultas e CTEs) | 10, 12 |
| 5 | `case-when` | — sem transcrição | 11, 12 |
| 6 | `views` | Aulas 5 e 6 (Views Partes 1–2) | 10, 11 |
| 7 | `window-functions` | Aula 9 | projetos |
| 8 | `null-handling` | Aula 7 | projetos |
| 9 | `string-functions` | Aula 7 | projetos |
| 10 | `json-functions` | Aula 18 (Auditoria) | projetos |
| 11 | `sql-intro` | Aula 2 | 1 |

**Caso especial `case-when`:** não tem transcrição (o `note` no item já documenta isso, e o Teste 4b depende de ele continuar sendo o único). A aula é escrita como síntese pedagógica e o rodapé deve dizer **"Síntese pedagógica — conceito não coberto pelas transcrições do curso"** em vez de citar uma fonte. Manter o `note` intacto.

**Conceituais e labs** (`materialized-views`, `stored-procedures`, `triggers`, `transactions`, `indexes-optimization`, `ddl-create-table`, `dml-insert`, `joins-right-full`): ficam para depois. Não têm missão, então a aba nunca os mostra hoje. Quando forem escritos, `classicError` pode ser omitido — para conteúdo não executável no SQLite, o bloco vira "POR QUE NÃO FUNCIONA AQUI", explicando a diferença PostgreSQL × SQLite. Ajustar `toLesson` para tratar essa variante.

**Verification:**
- Teste 14 chega a 0 falhas.
- Ler as 12 aulas em sequência: nenhum parágrafo se repete entre elas; cada `rule` é distinta.

---

### Task 9: Responsivo e acessibilidade

**Objective:** A aula funcionar no mobile e no teclado.

**Files:**
- Modify: `index.css` (media queries existentes)

**Details:**
- No mobile, a sidebar já vira aba ("Dicas & Evidências", `index.html:324`) — atualizar o rótulo para **"Aula & Evidências"**, já que a aula passa a ser o conteúdo de entrada.
- Abaixo de 640px: `.lesson-code` com `font-size: 0.6875rem`; `.lesson-headline` com `1rem`; `.lesson-code li::before` com `flex-basis: 22px`.
- Com 6 abas, abaixo de 900px o rail da sidebar precisa de `overflow-x: auto` e `flex: 0 0 auto` nos botões, senão os rótulos truncam.
- Navegação por setas ←/→ entre as abas (padrão ARIA de tablist) — hoje `initSidebarTabs` só trata clique.
- `.lesson-checkpoint summary` precisa de `:focus-visible` com outline ciano.
- Contraste: `--text-muted` (#7D90AD) sobre `--bg-base` dá ~5.2:1 — passa em AA para texto normal. Não usar `--text-disabled` para nada além de metadados.

**Verification:**
- DevTools em 375px: nenhum overflow horizontal na aba AULA.
- Tab + Enter alcança e abre o checkpoint; setas trocam de aba.

---

### Task 10: Verificação final

**Objective:** Fechar sem regressão.

**Details:**

Checklist de aceite:

- [ ] `npm test` passa inteiro, incluindo os testes 13 e 14 novos.
- [ ] `grep -rn 'style="' src/lesson.js` → vazio.
- [ ] `grep -n 'course-refs' src/ui.js` → vazio (bloco antigo removido).
- [ ] `.schema-section` volta a ser usado só pelo esquema do banco.
- [ ] Abrir cada uma das 12 missões do Caso 001: aba AULA renderiza os 7 blocos, sem `undefined` na tela e sem erro no console.
- [ ] Um caso de projeto (ex.: `proj-vendas`) também renderiza — os projetos usam os mesmos `courseRefs`.
- [ ] Nenhum nome de suspeito aparece em qualquer aula.
- [ ] Antes/depois: screenshot da missão 6 no estado atual e no novo, lado a lado.

**Teste de fumaça do objetivo:** abrir a missão 6 sem saber SQL e ler só a aba AULA. Se ao final der para escrever a query sem clicar em DICAS, o plano cumpriu o que prometeu.

---

## Fora de escopo (deliberadamente)

- **Syntax highlight real de SQL.** Tokenizar exigiria um mini-parser; as anotações por linha resolvem a compreensão sem isso. Se um dia entrar, é um enhancement isolado do `.lesson-code`.
- **Exercício interativo dentro da aula.** O console já é o exercício; duplicar cria dois lugares para errar.
- **Reescrever os briefings das missões.** A narrativa está boa — o problema era a aula, não o caso.
- **Áudio/vídeo das aulas originais.** Fora do escopo do jogo.

---

## Ordem sugerida de execução

Tasks 1 → 3 → 4 → 5 → 6 entregam **uma** aula completa e bonita na tela (a de agregação, já escrita na Task 1). Rode o jogo aí e valide a direção antes de investir nas outras 11.

Depois: Task 2 (testes), Task 8 (redação, a parte longa), Tasks 7 e 9 (polimento), Task 10 (fechamento).
