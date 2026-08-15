/**
 * sfx.js — Efeitos sonoros temáticos via Web Audio API.
 *
 * Módulo puro de lógica de áudio. Não acessa DOM diretamente,
 * mas espera receber `window` (ou mock) em initSfx.
 */

const STORAGE_KEY = 'sql-detective-sfx-enabled';

let audioContext = null;
let enabled = true;
let reducedMotion = false;
let globalWindow = null;

/**
 * Inicializa o sistema de SFX.
 * @param {Window|null} win objeto window do navegador (ou mock em testes)
 */
export function initSfx(win) {
  globalWindow = win;
  if (!win) return;

  try {
    if (!win.AudioContext && !win.webkitAudioContext) return;
    if (!audioContext) {
      audioContext = new (win.AudioContext || win.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  } catch (err) {
    // Falha silenciosa — som opcional
  }

  // Preferência do usuário por movimento reduzido também desliga som
  reducedMotion = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Carrega preferência salva
  try {
    const stored = win.localStorage ? win.localStorage.getItem(STORAGE_KEY) : null;
    if (stored !== null) {
      enabled = stored === 'true';
    }
  } catch (err) {
    // localStorage pode estar indisponível
  }
}

/**
 * Habilita/desabilita os efeitos sonoros.
 * @param {boolean} value
 */
export function setSfxEnabled(value) {
  enabled = !!value;
  if (globalWindow && globalWindow.localStorage) {
    try {
      globalWindow.localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch (err) {
      // ignore
    }
  }
}

/**
 * Retorna se o som está habilitado e disponível.
 * @returns {boolean}
 */
export function isSfxEnabled() {
  return enabled && !reducedMotion && !!audioContext;
}

/**
 * Reproduz um beep curto (som de digitação).
 * @param {number} [frequency=800]
 * @param {number} [duration=0.03]
 */
export function playTypingSound(frequency = 800, duration = 0.03) {
  if (!isSfxEnabled()) return;
  playOscillator(frequency, duration, 'square', 0.04);
}

/**
 * Reproduz bipe de alerta quando uma evidência importante é encontrada.
 */
export function playAlertSound() {
  if (!isSfxEnabled()) return;
  const now = audioContext.currentTime;
  [880, 1100].forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    const start = now + i * 0.12;
    osc.start(start);
    gain.gain.setValueAtTime(0.15, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osc.stop(start + 0.18);
  });
}

/**
 * Reproduz som triunfal ao concluir uma missão.
 */
export function playSuccessSound() {
  if (!isSfxEnabled()) return;
  const now = audioContext.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    const start = now + i * 0.12;
    osc.start(start);
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
    osc.stop(start + 0.35);
  });
}

/**
 * Helper: cria oscilador com envelope simples.
 */
function playOscillator(frequency, duration, type = 'sine', volume = 0.05) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.connect(audioContext.destination);
  const now = audioContext.currentTime;
  osc.start(now);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.stop(now + duration);
}

/**
 * Reseta o estado interno (útil em testes).
 */
export function resetSfx() {
  audioContext = null;
  enabled = true;
  reducedMotion = false;
  globalWindow = null;
}

export { STORAGE_KEY };
