/**
 * certificate.js — Geração de certificado/portfolio exportável.
 * Usa window.print() com CSS @media print (zero dependências).
 */

import { loadState } from './storage.js';
import { CASE_REGISTRY } from './case-manager.js';

/**
 * Extrai dados do certificado para um caso específico.
 * @param {string} caseId id do caso
 * @returns {Object|null} dados do certificado
 */
export function gerarDadosCertificado(caseId) {
  const caseDef = CASE_REGISTRY.find(c => c.id === caseId);
  if (!caseDef) return null;

  const state = loadState();
  const progress = (state.progressByCase && state.progressByCase[caseId]) || {};
  const completed = Array.isArray(progress.completedLevels) ? progress.completedLevels : [];
  const totalLevels = caseDef.LEVELS ? caseDef.LEVELS.length : 0;

  const pct = totalLevels > 0 ? completed.length / totalLevels : 0;
  const stars = pct >= 1.0 ? 3 : pct >= 0.66 ? 2 : pct >= 0.33 ? 1 : 0;

  const pontuacao = progress.score || completed.length * 100;
  const cargo = caseDef.CASE_CONCLUSION?.cargo || 'Participante';
  const nome = state.playerName || state.nome || progress.playerName || progress.nome || 'Investigador(a)';

  return {
    caseId,
    casoTitulo: caseDef.title,
    categoria: caseDef.category || '',
    nome,
    cargo,
    pontuacao,
    estrelas: stars,
    data: new Date().toLocaleDateString('pt-BR'),
    hashSelo: gerarHashSelo(caseId, nome),
  };
}

/**
 * Gera um hash simples para o selo do certificado (identificação visual).
 * @param {string} caseId
 * @param {string} nome
 * @returns {string}
 */
function gerarHashSelo(caseId, nome) {
  const input = `${caseId}-${nome}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `SQL-DT-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
}

/**
 * Gera e exibe o certificado em uma nova janela para impressão/salvar como PDF.
 * @param {string} caseId
 */
export function baixarCertificado(caseId) {
  const dados = gerarDadosCertificado(caseId);
  if (!dados) return;

  const starsDisplay = '\u2605'.repeat(dados.estrelas) + '\u2606'.repeat(3 - dados.estrelas);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Certificado — ${dados.casoTitulo}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', 'Consolas', monospace;
      background: #0a0a0a;
      color: #00ff41;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .certificado {
      border: 3px solid #00ff41;
      border-radius: 8px;
      padding: 40px 60px;
      text-align: center;
      max-width: 900px;
      width: 100%;
      position: relative;
    }
    .certificado::before {
      content: '';
      position: absolute;
      top: 8px; left: 8px; right: 8px; bottom: 8px;
      border: 1px solid rgba(0, 255, 65, 0.3);
      border-radius: 4px;
      pointer-events: none;
    }
    .logo { font-size: 14px; letter-spacing: 4px; margin-bottom: 20px; opacity: 0.8; }
    h1 { font-size: 32px; margin-bottom: 8px; letter-spacing: 2px; }
    .subtitle { font-size: 14px; color: #666; margin-bottom: 30px; }
    .nome {
      font-size: 28px;
      color: #fff;
      margin: 20px 0;
      border-bottom: 2px solid #00ff41;
      display: inline-block;
      padding-bottom: 10px;
    }
    .descricao { font-size: 16px; color: #ccc; margin: 20px 0; line-height: 1.6; }
    .cargo { font-size: 20px; color: #00ff41; font-weight: bold; margin: 15px 0; }
    .metas { display: flex; justify-content: center; gap: 40px; margin: 25px 0; font-size: 14px; color: #999; }
    .meta-item { display: flex; flex-direction: column; align-items: center; gap: 5px; }
    .meta-value { font-size: 22px; color: #fff; }
    .selo { margin-top: 30px; padding-top: 15px; border-top: 1px solid rgba(0, 255, 65, 0.2); }
    .hash { font-size: 10px; color: #555; letter-spacing: 1px; }
    .footer { margin-top: 20px; font-size: 12px; color: #444; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="certificado">
    <div class="logo">SQL DETECTIVE</div>
    <h1>CERTIFICADO DE CONCLUSÃO</h1>
    <div class="subtitle">Trilha de Dados — ${dados.categoria}</div>
    <div class="nome">${dados.nome}</div>
    <div class="descricao">
      concluiu com sucesso o <strong>${dados.caseId}</strong>:<br>
      <strong>${dados.casoTitulo}</strong>
    </div>
    <div class="cargo">Cargo: ${dados.cargo}</div>
    <div class="metas">
      <div class="meta-item"><span class="meta-value">${starsDisplay}</span><span>Estrelas</span></div>
      <div class="meta-item"><span class="meta-value">${dados.pontuacao.toLocaleString('pt-BR')}</span><span>Pontos</span></div>
      <div class="meta-item"><span class="meta-value">${dados.data}</span><span>Data</span></div>
    </div>
    <div class="selo">
      <div class="hash">SEL ${dados.hashSelo}</div>
    </div>
    <div class="footer">SQL Detective — Trilha de Dados &amp; Normalização &mdash; ${dados.data}</div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 300);
  }
}

/**
 * Lista todos os certificados disponíveis (para a tela de Portfolio).
 * @returns {Array} lista de certificados
 */
export function listarCertificados() {
  const state = loadState();
  const certificados = [];

  for (const caseDef of CASE_REGISTRY) {
    const progress = (state.progressByCase && state.progressByCase[caseDef.id]) || {};
    const completed = Array.isArray(progress.completedLevels) ? progress.completedLevels : [];
    if (completed.length === 0) continue;

    const dados = gerarDadosCertificado(caseDef.id);
    if (dados) certificados.push(dados);
  }

  return certificados;
}

/**
 * Exibe modal com certificado do caso atual (chamado pelo app.js).
 * @param {object} activeCase objeto do caso ativo (com id, title, LEVELS etc)
 */
export function showCertificateModal(activeCase) {
  const caseId = activeCase.id || state.currentCase || 'case001';
  const dados = gerarDadosCertificado(caseId);
  if (!dados) return;

  const starsDisplay = '\u2605'.repeat(dados.estrelas) + '\u2606'.repeat(3 - dados.estrelas);

  // Cria um modal simples
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'certificate-modal';
  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 600px; background: #1a1a2e; border: 1px solid #00ff41; border-radius: 8px; padding: 24px;">
      <h3 style="color: #00ff41; margin-bottom: 12px;">🏆 Certificado</h3>
      <div style="border: 2px solid #00ff41; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 16px;">
        <div style="font-size: 12px; letter-spacing: 2px; opacity: 0.7; margin-bottom: 8px;">SQL DETECTIVE</div>
        <h2 style="font-size: 18px; margin-bottom: 4px;">CERTIFICADO DE CONCLUSÃO</h2>
        <div style="font-size: 12px; color: #999; margin-bottom: 12px;">${dados.categoria}</div>
        <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">${dados.nome}</div>
        <div style="font-size: 13px; color: #ccc; margin-bottom: 8px;">concluiu o ${dados.caseId}: ${dados.casoTitulo}</div>
        <div style="color: #00ff41; font-size: 14px; margin-bottom: 8px;">Cargo: ${dados.cargo}</div>
        <div style="font-size: 14px; margin-bottom: 4px;">${starsDisplay}</div>
        <div style="font-size: 12px; color: #999;">${dados.pontuacao.toLocaleString('pt-BR')} pts &nbsp;|&nbsp; ${dados.data}</div>
        <div style="font-size: 9px; color: #555; margin-top: 8px;">SEL ${dados.hashSelo}</div>
      </div>
      <div class="modal-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('certificate-modal').remove();">Fechar</button>
        <button type="button" class="btn btn-primary" onclick="window.__certDownload('${caseId}')">Baixar PDF</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Callback para download
  window.__certDownload = (cid) => {
    modal.remove();
    baixarCertificado(cid);
  };

  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Import state para o showCertificateModal
import { state } from './state.js';
