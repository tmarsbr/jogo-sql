/**
 * test_sfx.js — Testes do módulo de efeitos sonoros.
 * Executa com: node test/test_sfx.js
 */

const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

function createAudioContextMock() {
  const oscillators = [];
  const gains = [];
  return {
    oscillators,
    gains,
    currentTime: 0,
    destination: {},
    state: 'suspended',
    createOscillator() {
      const osc = {
        type: 'sine',
        frequency: { value: 0 },
        connect: () => {},
        start: () => { osc.started = true; },
        stop: () => { osc.stopped = true; },
        started: false,
        stopped: false,
      };
      oscillators.push(osc);
      return osc;
    },
    createGain() {
      const gain = {
        gain: {
          value: 0,
          setValueAtTime(v) { gain.gain.value = v; },
          exponentialRampToValueAtTime(v) { gain.gain.value = v; },
        },
        connect: () => {},
      };
      gains.push(gain);
      return gain;
    },
    resume() { this.state = 'running'; },
  };
}

function createWindowMock(overrides = {}) {
  const localStorageData = {};
  const audioCtx = createAudioContextMock();
  return {
    AudioContext: function() { return audioCtx; },
    webkitAudioContext: function() { return audioCtx; },
    matchMedia: (q) => ({ matches: overrides.reducedMotion === true && q.includes('reduced-motion') }),
    localStorage: {
      getItem(k) { return localStorageData[k] || null; },
      setItem(k, v) { localStorageData[k] = v; },
    },
    audioCtx,
    ...overrides,
  };
}

const code = readSource('sfx.js');
let mod;
function load(overrides = {}) {
  const win = createWindowMock(overrides);
  mod = evalModule(transformESM(code), { window: win }, 'sfx.js');
  return { mod, win };
}

console.log('\n[1] initSfx cria AudioContext e resume');
const { win: win1 } = load();
mod.initSfx(win1);
assert(win1.audioCtx.state === 'running', 'AudioContext foi resumido');
assert(mod.isSfxEnabled() === true, 'sfx habilitado após init');

console.log('\n[2] playTypingSound cria oscilador');
mod.playTypingSound(800, 0.03);
assert(win1.audioCtx.oscillators.length === 1, 'typing cria 1 oscilador');
assert(win1.audioCtx.oscillators[0].type === 'square', 'tipo square para digitação');

console.log('\n[3] playAlertSound cria 2 osciladores');
mod.playAlertSound();
assert(win1.audioCtx.oscillators.length === 3, 'typing + alert = 3 osciladores');

console.log('\n[4] playSuccessSound cria 4 osciladores');
mod.playSuccessSound();
assert(win1.audioCtx.oscillators.length === 7, 'total de 7 osciladores');

console.log('\n[5] setSfxEnabled desativa som');
mod.setSfxEnabled(false);
assert(mod.isSfxEnabled() === false, 'sfx desabilitado');
const before = win1.audioCtx.oscillators.length;
mod.playTypingSound();
assert(win1.audioCtx.oscillators.length === before, 'nenhum oscilador adicional quando desabilitado');

console.log('\n[6] setSfxEnabled persiste em localStorage');
assert(win1.localStorage.getItem('sql-detective-sfx-enabled') === 'false', 'preferência salva');

console.log('\n[7] reduced motion desliga som');
const { win: win2 } = load({ reducedMotion: true });
mod.resetSfx();
mod.initSfx(win2);
assert(mod.isSfxEnabled() === false, 'reduced-motion desabilita sfx');

console.log('\n[8] sem AudioContext não quebra');
const win3 = { AudioContext: undefined, webkitAudioContext: undefined, localStorage: {}, matchMedia: () => ({ matches: false }) };
mod.resetSfx();
mod.initSfx(win3);
assert(mod.isSfxEnabled() === false, 'sem AudioContext fica desabilitado');
mod.playTypingSound();
mod.playAlertSound();
mod.playSuccessSound();
assert(true, 'chamadas sem AudioContext não quebram');

console.log('\n[9] resetSfx limpa estado');
const { win: win4 } = load();
mod.initSfx(win4);
mod.resetSfx();
assert(mod.isSfxEnabled() === false, 'após reset sfx desabilitado até init');

console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
