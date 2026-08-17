/**
 * lesson.js — Renderizador puro de HTML para a aba AULA.
 *
 * Módulo puramente funcional: recebe dados do curso e missão, retorna string HTML.
 * Sem dependências de DOM ou estado global, testável diretamente no Node.js.
 */

const MARKERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

/**
 * Escapa caracteres HTML para exibição segura.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Normaliza um item do catálogo (com ou sem o campo `lesson`) para a estrutura padrão de aula.
 * Itens sem `lesson` recebem a flag `partial: true` e geram uma estrutura de transição.
 *
 * @param {object} item
 * @returns {object}
 */
export function toLesson(item) {
  if (!item) return null;
  if (item.lesson) {
    return {
      ...item.lesson,
      partial: false,
      sourceLessons: item.sourceLessons || [],
      sqliteCompatibility: item.sqliteCompatibility || 'supported',
      concept: item.concept,
    };
  }

  // Fallback para itens legados ainda não migrados
  return {
    partial: true,
    eyebrow: item.concept ? item.concept.toUpperCase() : 'AULA',
    headline: item.learningObjective || item.concept || 'Conceito SQL',
    readingMinutes: 2,
    why: item.explanation || '',
    howItWorks: item.explanation ? [item.explanation] : [],
    mentalModel: null,
    walkthrough: item.syntaxExample ? {
      intro: 'Exemplo de sintaxe essencial:',
      code: item.syntaxExample,
      annotations: [],
      result: '',
    } : null,
    classicError: item.commonMistake ? {
      engine: 'SQL',
      wrongCode: '',
      errorMessage: '',
      diagnosis: item.commonMistake,
      fix: '',
      rule: item.commonMistake,
    } : null,
    checkpoint: null,
    bridge: '',
    sourceLessons: item.sourceLessons || [],
    sqliteCompatibility: item.sqliteCompatibility || 'supported',
    concept: item.concept,
  };
}

/**
 * Renderiza o bloco de código passo a passo anotado.
 * @param {object} walkthrough
 * @param {object} [level]
 * @returns {string}
 */
function renderWalkthrough(walkthrough, level = null) {
  if (!walkthrough || !walkthrough.code) return '';

  const lines = walkthrough.code.split('\n');
  const annotations = Array.isArray(walkthrough.annotations) ? walkthrough.annotations : [];
  
  // Mapa de anotações por linha (1-based)
  const lineAnnotationMap = new Map();
  annotations.forEach((anno, index) => {
    const marker = MARKERS[index % MARKERS.length];
    lineAnnotationMap.set(anno.line, { marker, text: anno.text });
  });

  let codeHtml = '<ol class="lesson-code">';
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const anno = lineAnnotationMap.get(lineNum);
    if (anno) {
      codeHtml += `<li class="is-annotated"><span class="lesson-marker">${escapeHtml(anno.marker)}</span><code>${escapeHtml(lineText)}</code></li>`;
    } else {
      codeHtml += `<li><code>${escapeHtml(lineText)}</code></li>`;
    }
  });
  codeHtml += '</ol>';

  let notesHtml = '';
  if (annotations.length > 0) {
    notesHtml += '<ol class="lesson-notes">';
    annotations.forEach((anno, index) => {
      const marker = MARKERS[index % MARKERS.length];
      notesHtml += `<li><span class="lesson-marker">${escapeHtml(marker)}</span> ${escapeHtml(anno.text)}</li>`;
    });
    notesHtml += '</ol>';
  }

  let resultHtml = '';
  if (walkthrough.result) {
    resultHtml = `<p class="lesson-result"><strong>O que sai:</strong> ${escapeHtml(walkthrough.result)}</p>`;
  }

  const missionTables = Array.isArray(level?.tables) ? level.tables.filter(Boolean) : [];
  const contextHtml = missionTables.length > 0
    ? `<p class="lesson-context-note"><strong>EXEMPLO-BASE:</strong> aplique esta estrutura aos identificadores do esquema atual: ${missionTables.map(table => `<code>${escapeHtml(table)}</code>`).join(', ')}.</p>`
    : '';

  return `
    <section class="lesson-block">
      <h3 class="lesson-block-title">PASSO A PASSO</h3>
      ${walkthrough.intro ? `<p class="lesson-intro">${escapeHtml(walkthrough.intro)}</p>` : ''}
      ${contextHtml}
      ${codeHtml}
      ${notesHtml}
      ${resultHtml}
    </section>
  `;
}

/**
 * Renderiza o bloco do erro clássico.
 * @param {object} classicError
 * @returns {string}
 */
function renderClassicError(classicError) {
  if (!classicError) return '';

  const { engine, wrongCode, errorMessage, diagnosis, fix, rule } = classicError;
  if (!wrongCode && !errorMessage && !diagnosis && !rule) return '';

  let html = `
    <section class="lesson-block lesson-error">
      <h3 class="lesson-block-title">O ERRO CLÁSSICO</h3>
  `;

  if (engine) {
    html += `<p class="lesson-engine-label">MOTOR: ${escapeHtml(engine)}</p>`;
  }
  if (wrongCode) {
    html += `<pre class="lesson-code-bad">${escapeHtml(wrongCode)}</pre>`;
  }
  if (errorMessage) {
    html += `<p class="lesson-engine-msg">${escapeHtml(errorMessage)}</p>`;
  }
  if (diagnosis) {
    html += `<p class="lesson-diagnosis">${escapeHtml(diagnosis)}</p>`;
  }
  if (fix) {
    html += `<p class="lesson-fix"><strong>Correção:</strong> ${escapeHtml(fix)}</p>`;
  }
  if (rule) {
    html += `<p class="lesson-rule">${escapeHtml(rule)}</p>`;
  }

  html += '</section>';
  return html;
}

/**
 * Renderiza o rodapé com informações de fonte e compatibilidade.
 * @param {object} lesson
 * @param {object} primaryItem
 * @returns {string}
 */
function renderFooter(lesson, primaryItem) {
  const sourceLessons = lesson.sourceLessons && lesson.sourceLessons.length > 0
    ? lesson.sourceLessons
    : (primaryItem?.sourceLessons || []);

  const sourcesText = lesson.sourceNote
    ? escapeHtml(lesson.sourceNote)
    : sourceLessons.length > 0
      ? sourceLessons.map(s => {
        const base = s.replace(/^aulas\//, '').replace(/\.md$/, '');
        return escapeHtml(base);
      }).join(' · ')
      : 'Síntese pedagógica — conceito não coberto pelas transcrições do curso';

  const compat = lesson.sqliteCompatibility || primaryItem?.sqliteCompatibility || 'supported';
  let compatClass = 'is-supported';
  let compatLabel = 'SQLITE: COMPATÍVEL';

  if (compat === 'partial') {
    compatClass = 'is-partial';
    compatLabel = 'SQLITE: PARCIAL';
  } else if (compat === 'unsupported') {
    compatClass = 'is-unsupported';
    compatLabel = 'SQLITE: INCOMPATÍVEL';
  }

  let noteHtml = '';
  if (lesson.sqliteNote) {
    noteHtml = `<p class="lesson-sqlite-note">${escapeHtml(lesson.sqliteNote)}</p>`;
  }

  return `
    <footer class="lesson-foot">
      <span class="lesson-source">Fonte: ${sourcesText}</span>
      <span class="lesson-compat ${compatClass}">${compatLabel}</span>
      ${noteHtml}
    </footer>
  `;
}

/**
 * Renderiza os cards de revisão para conceitos secundários vinculados à missão.
 * @param {object[]} secondaryItems
 * @returns {string}
 */
function renderReviewSection(secondaryItems) {
  if (!secondaryItems || secondaryItems.length === 0) return '';

  let cardsHtml = '';
  for (const item of secondaryItems) {
    const lesson = toLesson(item);
    if (!lesson) continue;

    const title = escapeHtml(item.concept || lesson.headline);
    const text = escapeHtml(lesson.headline || lesson.why || item.explanation || '');
    const rule = lesson.classicError?.rule ? `<p class="lesson-rule">${escapeHtml(lesson.classicError.rule)}</p>` : '';

    cardsHtml += `
      <article class="lesson-review-card">
        <h4>${title}</h4>
        <p>${text}</p>
        ${rule}
        ${item.id ? `<button type="button" class="lesson-review-open" data-open-course-lesson="${escapeHtml(item.id)}">ABRIR AULA COMPLETA</button>` : ''}
      </article>
    `;
  }

  if (!cardsHtml) return '';

  return `
    <section class="lesson-review">
      <h3 class="lesson-block-title">REVISÃO NESTA MISSÃO</h3>
      ${cardsHtml}
    </section>
  `;
}

/**
 * Monta o HTML da aba AULA.
 *
 * @param {object[]} courseItems - Primeiro item = aula principal; demais = revisão
 * @param {object} [level] - Missão ativa (para cabeçalho e ponte com o caso)
 * @returns {string} HTML sanitizado para innerHTML
 */
export function renderLessonHtml(courseItems, level = null) {
  if (!courseItems || courseItems.length === 0) {
    return '<p class="placeholder-text">Nenhuma aula vinculada a esta missão.</p>';
  }

  const primaryItem = courseItems[0];
  const lesson = toLesson(primaryItem);
  if (!lesson) {
    return '<p class="placeholder-text">Nenhuma aula vinculada a esta missão.</p>';
  }

  const levelNumStr = level?.id ? String(level.id).padStart(2, '0') : null;
  const metaMission = levelNumStr ? `Missão ${levelNumStr}` : null;
  const metaTime = `${lesson.readingMinutes || 3} min de leitura`;
  
  let sourceShort = '';
  if (lesson.sourceNote) {
    sourceShort = 'Síntese pedagógica';
  } else if (lesson.sourceLessons && lesson.sourceLessons.length > 0) {
    const first = lesson.sourceLessons[0].replace(/^aulas\//, '').replace(/\.md$/, '');
    const match = first.match(/Aula\s+\d+/i);
    sourceShort = match ? `Fonte: ${match[0]}` : `Fonte: ${first.slice(0, 20)}`;
  } else {
    sourceShort = 'Síntese Pedagógica';
  }

  const metaParts = [metaTime, metaMission, sourceShort].filter(Boolean).join(' · ');
  const partialBadge = lesson.partial ? '<span class="lesson-partial-badge">AULA RESUMIDA</span>' : '';

  let html = `
    <article class="lesson" data-lesson-id="${escapeHtml(primaryItem.id || '')}">
      <header class="lesson-head">
        <span class="lesson-eyebrow">AULA · ${escapeHtml(lesson.eyebrow || primaryItem.concept || 'SQL')}${partialBadge}</span>
        <h2 class="lesson-headline">${escapeHtml(lesson.headline || primaryItem.concept)}</h2>
        <p class="lesson-meta">${escapeHtml(metaParts)}</p>
      </header>
  `;

  // Bloco 1: Por que isso importa
  if (lesson.why) {
    html += `
      <section class="lesson-block lesson-why">
        <h3 class="lesson-block-title">POR QUE ISSO IMPORTA</h3>
        <p>${escapeHtml(lesson.why)}</p>
      </section>
    `;
  }

  // Bloco 2: Como funciona + Modelo Mental
  const howItWorks = Array.isArray(lesson.howItWorks) ? lesson.howItWorks : (lesson.howItWorks ? [lesson.howItWorks] : []);
  if (howItWorks.length > 0 || lesson.mentalModel) {
    html += `
      <section class="lesson-block">
        <h3 class="lesson-block-title">COMO FUNCIONA</h3>
        ${howItWorks.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
        ${lesson.mentalModel ? `
          <aside class="lesson-model">
            <span class="lesson-model-label">${escapeHtml(lesson.mentalModel.label || 'MODELO MENTAL')}</span>
            <p>${escapeHtml(lesson.mentalModel.text || '')}</p>
          </aside>
        ` : ''}
      </section>
    `;
  }

  // Bloco 3: Passo a passo
  if (lesson.walkthrough) {
    html += renderWalkthrough(lesson.walkthrough, level);
  }

  // Bloco 4: O erro clássico
  if (lesson.classicError) {
    html += renderClassicError(lesson.classicError);
  }

  // Bloco 5: Checkpoint
  if (lesson.checkpoint && lesson.checkpoint.question && lesson.checkpoint.answer) {
    html += `
      <section class="lesson-block">
        <h3 class="lesson-block-title">CHECKPOINT</h3>
        <p class="lesson-question">${escapeHtml(lesson.checkpoint.question)}</p>
        <details class="lesson-checkpoint">
          <summary>VER RESPOSTA</summary>
          <p>${escapeHtml(lesson.checkpoint.answer)}</p>
        </details>
      </section>
    `;
  }

  // Bloco 6: Na missão
  const bridgeTitle = levelNumStr ? `NA MISSÃO ${levelNumStr}` : 'NA MISSÃO';
  const bridgeText = level?.objective
    ? `Aplique o conceito desta aula ao objetivo atual: ${level.objective}`
    : lesson.bridge;
  if (bridgeText) {
    html += `
      <section class="lesson-block lesson-bridge">
        <h3 class="lesson-block-title">${escapeHtml(bridgeTitle)}</h3>
        <p>${escapeHtml(bridgeText)}</p>
      </section>
    `;
  }

  // Bloco 7: Rodapé
  html += renderFooter(lesson, primaryItem);
  html += '</article>';

  // Revisão de itens secundários
  if (courseItems.length > 1) {
    html += renderReviewSection(courseItems.slice(1));
  }

  return html;
}
