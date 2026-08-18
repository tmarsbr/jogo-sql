/**
 * client-real-ui.js — Renderização do briefing e feedback do modo Cliente Real.
 *
 * Three-phase flow por consultoria:
 *   'clarify'  → card do cliente + pedido vago em balão + pergunta de escopo;
 *   'analyze'  → prompt da análise com tabelas em escopo (editor SQL ativo);
 *   'report'   → campo de texto para escrever a análise em linguagem de negócio.
 */
import { escapeHtml } from '../ui.js';

export function renderClientRealBriefing(engagement, engagementState, completedLevels) {
  const c = engagement.client;
  const total = (engagement.clarifications || []).length;
  const currentQ = engagement.clarifications[engagementState.clarificationIndex] || null;
  const analysis = (engagement.analyses || [])[engagementState.analysisIndex] || null;
  const phase = engagementState.phase;
  const done = phase === 'done';

  const phasePill = {
    clarify: ['CLIENTE NA SALA', 'client-real-phase-client'],
    analyze: ['EM ANÁLISE', 'client-real-phase-analyze'],
    report: ['APRESENTAÇÃO', 'client-real-phase-report'],
    done: ['CONSULTORIA CONCLUÍDA', 'client-real-phase-done'],
  }[phase] || ['CONSULTORIA', ''];

  let phaseHtml = '';
  if (phase === 'clarify' && currentQ) {
    phaseHtml = `
      <div class="client-real-question">
        <strong>${escapeHtml(engagementState.clarificationIndex + 1)}. ${escapeHtml(currentQ.question)}</strong>
        <div class="client-real-options">
          ${currentQ.options.map((opt, idx) => `
            <button type="button" class="client-real-option" data-cr-answer="${escapeHtml(engagement.id)}|${engagementState.clarificationIndex}|${escapeHtml(opt.id)}">
              <span class="client-real-option-letter">${String.fromCharCode(65 + idx)}</span>
              <span>${escapeHtml(opt.text)}</span>
            </button>
          `).join('')}
        </div>
        <div id="client-real-clarification-feedback"></div>
      </div>
    `;
  } else if (phase === 'analyze' && analysis) {
    phaseHtml = `
      <div class="mission-objective">
        <strong>${escapeHtml(analysis.label.toUpperCase())}</strong>
        <p>${escapeHtml(analysis.context)}</p>
      </div>
      <div class="mission-objective" style="margin-top: 10px;">
        <strong>OBJETIVO DA CONSULTORIA</strong>
        <p>${escapeHtml(analysis.objective)}</p>
      </div>
      <div class="mission-tables">
        <strong>TABELAS EM ESCOPO</strong>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
          ${analysis.tables.map(t => `<code>${escapeHtml(t)}</code>`).join('')}
        </div>
      </div>
      ${analysis.insight ? '<p class="client-real-hint-text">Dica: o insight final desta análise será revelado depois que a query for validada.</p>' : ''}
    `;
  } else if (phase === 'report') {
    phaseHtml = `
      <div class="mission-objective">
        <strong>FASE FINAL: APRESENTAR A ANÁLISE</strong>
        <p>${escapeHtml(engagement.reportPrompt)}</p>
      </div>
      <p class="client-real-hint-text">Escreva como se fosse o e-mail de volta ao cliente. Use os números que você encontrou — ele decide pela qualidade da sua comunicação, não pela sua SQL.</p>
    `;
  } else if (done) {
    phaseHtml = '<p class="client-real-done-text">Consultoria entregue. Explore no banco livremente ou avance para a próxima consultoria.</p>';
  }

  const completedCount = completedLevels.filter(id => id.startsWith('cr-')).length;

  let html = `
    <div class="mission-briefing client-real-briefing">
      <div class="bug-header-row">
        <span class="pill-badge concept-tag">${escapeHtml(engagement.difficulty || 'Consultoria')}</span>
        <span class="pill-badge client-real-phase-pill ${phasePill[1]}">${phasePill[0]}</span>
      </div>
      <h2 class="mission-title">${escapeHtml(engagement.title)}</h2>
      <div class="client-real-client-card">
        <div class="client-real-client-avatar">${escapeHtml(c.avatar)}</div>
        <div>
          <strong class="client-real-client-name">${escapeHtml(c.name)}</strong>
          <span class="client-real-client-role">${escapeHtml(c.role)} · ${escapeHtml(c.company)}</span>
          <span class="client-real-client-tone">${escapeHtml(c.tone)}</span>
        </div>
      </div>
      <div class="client-real-request-bubble">
        <div class="client-real-request-quote">${escapeHtml(engagement.briefing)}</div>
      </div>
      ${phaseHtml}
    </div>
  `;

  if (done || phase === 'analyze') {
    html += `
      <div class="client-real-progress">
        <div class="client-real-progress-bar">
          <div class="client-real-progress-fill" style="width: ${Math.round((engagementState.clarificationCorrectCount / Math.max(total, 1)) * 100)}%;"></div>
        </div>
        <span class="client-real-progress-label">${escapeHtml(c.name.split(' ')[0])} atendido · ${completedCount} consultoria(s) concluída(s)</span>
      </div>
    `;
  }
  return html;
}

/**
 * Renderiza feedback do modo Cliente Real no painel de resultados.
 * @param {object} feedback {type, message, result?}
 */
export function renderClientRealFeedback(feedback) {
  const container = document.getElementById('results-container');
  if (!container) return;
  const existing = container.querySelector('.client-real-feedback');
  if (existing) existing.remove();
  const cls = {
    clarification_correct: 'feedback feedback-success',
    clarification_wrong: 'feedback feedback-warn',
    correct: 'feedback feedback-success',
    wrong_result: 'feedback feedback-warn',
    wrong_columns: 'feedback feedback-warn',
    missing_concept: 'feedback feedback-warn',
    sql_error: 'feedback feedback-error',
    report_passed: 'feedback feedback-success',
    report_failed: 'feedback feedback-warn',
  }[feedback.type] || 'feedback';
  const div = document.createElement('div');
  div.className = `${cls} client-real-feedback`;
  if (feedback.message) {
    const message = document.createElement('span');
    message.textContent = String(feedback.message);
    div.appendChild(message);
  }
  if (feedback.result) {
    const result = document.createElement('div');
    result.style.marginTop = '8px';
    result.textContent = String(feedback.result);
    div.appendChild(result);
  }
  container.appendChild(div);
}

/**
 * Renderiza o campo de relatório (fase 'report') dentro do painel de resultados.
 * @param {string} engagementId
 * @param {string} savedDraft texto salvo anteriormente (vazio se nenhum)
 */
export function renderClientRealReportField(engagementId, savedDraft = '') {
  const container = document.getElementById('results-container');
  if (!container) return;
  const existing = container.querySelector('.client-real-report-box');
  if (existing) existing.remove();
  const box = document.createElement('div');
  box.className = 'client-real-report-box';
  box.innerHTML = `
    <div class="client-real-report-topbar">
      <span class="sql-editor-dot"></span>
      <span class="sql-editor-topbar-label">E-MAIL_PARA_O_CLIENTE.TXT</span>
    </div>
    <textarea id="client-real-report-input" class="client-real-report-input" placeholder="Escreva sua análise aqui... (mínimo 30 caracteres)">${escapeHtml(savedDraft)}</textarea>
    <button type="button" id="client-real-report-submit" class="btn btn-primary">ENVIAR ANÁLISE AO CLIENTE</button>
    <div id="client-real-report-feedback"></div>
  `;
  container.appendChild(box);
}

/**
 * Atualiza o feedback do relatório (abaixo do textarea) sem apagar o texto.
 * @param {object} feedback {type, message}
 * @param {boolean} clearDraft apaga o rascunho quando a apresentação passar
 */
export function renderClientRealReportFeedback(feedback, clearDraft = false) {
  const target = document.getElementById('client-real-report-feedback');
  const input = document.getElementById('client-real-report-input');
  const btn = document.getElementById('client-real-report-submit');
  if (clearDraft && input) input.value = '';
  if (btn) btn.disabled = clearDraft;
  if (target) {
    target.innerHTML = '';
    const cls = feedback.type === 'report_passed' ? 'feedback feedback-success' : 'feedback feedback-warn';
    const div = document.createElement('div');
    div.className = cls;
    div.textContent = feedback.message;
    target.appendChild(div);
  }
}

/**
 * Mostra o insight revelado após validação correta de uma análise.
 * @param {string} insight texto do insight
 */
export function renderClientRealInsight(insight) {
  const container = document.getElementById('results-container');
  if (!container) return;
  const existing = container.querySelector('.client-real-insight');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'feedback feedback-success client-real-insight';
  div.innerHTML = `<strong>💡 INSIGHT REVELADO</strong> ${escapeHtml(insight)}`;
  container.appendChild(div);
}
