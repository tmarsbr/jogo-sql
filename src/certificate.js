/**
 * certificate.js — certificado exportável dos cenários concluídos.
 * Usa a janela de impressão do navegador, sem dependências externas.
 */

import { loadState } from './storage.js';
import { getAllCases, getCaseById, isCaseComplete } from './case-manager.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeName(value) {
  const name = String(value || '').trim().replace(/\s+/g, ' ');
  return name ? name.slice(0, 100) : 'Investigador(a)';
}

/** Gera um identificador determinístico para o mesmo certificado. */
export function gerarHashSelo(caseId, nome, progress = {}) {
  const completed = Array.isArray(progress.completedLevels)
    ? [...progress.completedLevels].sort((a, b) => a - b).join(',')
    : '';
  const input = [caseId, nome, progress.score || 0, progress.completedAt || '', completed].join('|');
  let hash = 2166136261;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `SQL-DT-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

/**
 * Extrai os dados do certificado. Cenários incompletos não emitem certificado.
 * @param {string} caseId
 * @param {string} [nomeInformado]
 * @returns {Object|null}
 */
export function gerarDadosCertificado(caseId, nomeInformado = '') {
  const caseDefinition = getCaseById(caseId);
  if (!caseDefinition) return null;

  const savedState = loadState();
  if (!isCaseComplete(caseDefinition, savedState.progressByCase)) return null;

  const progress = savedState.progressByCase[caseId] || {};
  const earnedStars = (caseDefinition.LEVELS || []).reduce((total, level) => {
    const stars = Number(progress.levelProgress?.[level.id]?.stars) || 0;
    return total + Math.max(0, Math.min(3, stars));
  }, 0);
  const maxStars = Math.max(1, (caseDefinition.LEVELS || []).length * 3);
  const starRatio = earnedStars / maxStars;
  const stars = starRatio >= 0.9 ? 3 : starRatio >= 0.6 ? 2 : 1;
  const nome = normalizeName(nomeInformado || progress.playerName);
  const completionDate = progress.completedAt ? new Date(progress.completedAt) : new Date();
  const validCompletionDate = Number.isFinite(completionDate.getTime()) ? completionDate : new Date();
  const pontuacao = Number.isFinite(progress.score) ? progress.score : 0;

  return {
    caseId,
    casoTitulo: caseDefinition.title,
    categoria: caseDefinition.category || '',
    nome,
    cargo: caseDefinition.CASE_CONCLUSION?.cargo || 'Participante',
    pontuacao,
    estrelas: stars,
    estrelasObtidas: earnedStars,
    estrelasMaximas: maxStars,
    data: validCompletionDate.toLocaleDateString('pt-BR'),
    hashSelo: gerarHashSelo(caseId, nome, progress),
  };
}

/** Abre a versão de impressão do certificado. Retorna false se o popup falhar. */
export function baixarCertificado(caseId, nomeInformado = '') {
  const dados = gerarDadosCertificado(caseId, nomeInformado);
  if (!dados) return false;

  const starsDisplay = '★'.repeat(dados.estrelas) + '☆'.repeat(3 - dados.estrelas);
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Certificado — ${escapeHtml(dados.casoTitulo)}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Courier New", Consolas, monospace; background: #0a0a0a; color: #00ff41; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
    .certificado { border: 3px solid #00ff41; border-radius: 8px; padding: 40px 60px; text-align: center; max-width: 900px; width: 100%; position: relative; }
    .certificado::before { content: ""; position: absolute; inset: 8px; border: 1px solid rgba(0, 255, 65, .3); border-radius: 4px; pointer-events: none; }
    .logo { font-size: 14px; letter-spacing: 4px; margin-bottom: 20px; opacity: .8; }
    h1 { font-size: 32px; margin-bottom: 8px; letter-spacing: 2px; }
    .subtitle { font-size: 14px; color: #888; margin-bottom: 30px; }
    .nome { font-size: 28px; color: #fff; margin: 20px 0; border-bottom: 2px solid #00ff41; display: inline-block; padding-bottom: 10px; }
    .descricao { font-size: 16px; color: #ccc; margin: 20px 0; line-height: 1.6; }
    .cargo { font-size: 20px; color: #00ff41; font-weight: bold; margin: 15px 0; }
    .metas { display: flex; justify-content: center; gap: 40px; margin: 25px 0; font-size: 14px; color: #999; }
    .meta-item { display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .meta-value { font-size: 22px; color: #fff; }
    .selo { margin-top: 30px; padding-top: 15px; border-top: 1px solid rgba(0, 255, 65, .2); }
    .hash { font-size: 10px; color: #777; letter-spacing: 1px; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
    @media print { body { padding: 0; print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <main class="certificado">
    <div class="logo">SQL DETECTIVE</div>
    <h1>CERTIFICADO DE CONCLUSÃO</h1>
    <div class="subtitle">Trilha de Dados — ${escapeHtml(dados.categoria)}</div>
    <div class="nome">${escapeHtml(dados.nome)}</div>
    <div class="descricao">concluiu com sucesso o <strong>${escapeHtml(dados.caseId)}</strong>:<br><strong>${escapeHtml(dados.casoTitulo)}</strong></div>
    <div class="cargo">Cargo: ${escapeHtml(dados.cargo)}</div>
    <div class="metas">
      <div class="meta-item"><span class="meta-value">${starsDisplay}</span><span>${dados.estrelasObtidas}/${dados.estrelasMaximas} estrelas</span></div>
      <div class="meta-item"><span class="meta-value">${dados.pontuacao.toLocaleString('pt-BR')}</span><span>Pontos</span></div>
      <div class="meta-item"><span class="meta-value">${escapeHtml(dados.data)}</span><span>Conclusão</span></div>
    </div>
    <div class="selo"><div class="hash">SEL ${escapeHtml(dados.hashSelo)}</div></div>
    <div class="footer">SQL Detective — ${escapeHtml(dados.data)}</div>
  </main>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 300);
  return true;
}

/** Lista apenas certificados realmente concluídos. */
export function listarCertificados() {
  return getAllCases()
    .map(caseDefinition => gerarDadosCertificado(caseDefinition.id))
    .filter(Boolean);
}

/** Exibe uma prévia e permite informar o nome antes da impressão. */
export function showCertificateModal(activeCase) {
  const caseId = activeCase?.id;
  const dados = gerarDadosCertificado(caseId);
  if (!dados) return false;

  document.getElementById('certificate-modal')?.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'certificate-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'certificate-title');
  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 640px;">
      <div class="modal-header-bar"><h3 id="certificate-title">🏆 CERTIFICADO</h3></div>
      <div class="modal-body">
        <label for="certificate-name" style="display:block; margin-bottom:8px;">Nome no certificado</label>
        <input id="certificate-name" type="text" maxlength="100" class="sql-editor" style="min-height:auto; width:100%; padding:10px; margin-bottom:16px;" value="${escapeHtml(dados.nome)}">
        <div style="border:2px solid #00ff41; border-radius:6px; padding:20px; text-align:center; margin-bottom:16px;">
          <div style="font-size:12px; letter-spacing:2px; opacity:.7; margin-bottom:8px;">SQL DETECTIVE</div>
          <h2 style="font-size:18px; margin-bottom:8px;">CERTIFICADO DE CONCLUSÃO</h2>
          <div style="font-size:13px; color:#ccc; margin-bottom:8px;">${escapeHtml(dados.caseId)} · ${escapeHtml(dados.casoTitulo)}</div>
          <div style="color:#00ff41; font-size:14px; margin-bottom:8px;">Cargo: ${escapeHtml(dados.cargo)}</div>
          <div style="font-size:14px; margin-bottom:4px;">${'★'.repeat(dados.estrelas)}${'☆'.repeat(3 - dados.estrelas)}</div>
          <div style="font-size:12px; color:#999;">${dados.pontuacao.toLocaleString('pt-BR')} pts · ${escapeHtml(dados.data)}</div>
          <div style="font-size:9px; color:#777; margin-top:8px;">SEL ${escapeHtml(dados.hashSelo)}</div>
        </div>
        <div id="certificate-feedback" role="status" style="min-height:20px; color:var(--status-warning);"></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-certificate-close>FECHAR</button>
          <button type="button" class="btn btn-primary" data-certificate-download>IMPRIMIR / SALVAR PDF</button>
        </div>
      </div>
    </div>`;

  const close = () => modal.remove();
  modal.querySelector('[data-certificate-close]')?.addEventListener('click', close);
  modal.querySelector('[data-certificate-download]')?.addEventListener('click', () => {
    const name = modal.querySelector('#certificate-name')?.value || '';
    const opened = baixarCertificado(caseId, name);
    if (opened) close();
    else {
      const feedback = modal.querySelector('#certificate-feedback');
      if (feedback) feedback.textContent = 'O navegador bloqueou a nova janela. Permita popups e tente novamente.';
    }
  });
  modal.addEventListener('click', event => {
    if (event.target === modal) close();
  });
  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });

  document.body.appendChild(modal);
  modal.querySelector('#certificate-name')?.focus();
  return true;
}
