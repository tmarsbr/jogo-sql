/**
 * test_suspect_graph.js — Testes do módulo puro suspect-graph.js
 * Executa com: node test/test_suspect_graph.js
 */

const { readSource, transformESM, evalModule } = require('./helpers/load-source');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS: ${msg}`); passed++; }
  else { console.log(`  FAIL: ${msg}`); failed++; }
}

const code = readSource('suspect-graph.js');
const mod = evalModule(transformESM(code), {}, 'suspect-graph.js');
const { buildGraphState, renderGraphSVG, COLORS } = mod;

const graphConfig = {
  nodes: [
    { id: 'suspeito-07', type: 'suspect', label: 'Pessoa de interesse #7', revealedLabel: 'Camila Torres', revealAtMission: 5 },
    { id: 'suspeito-04', type: 'suspect', label: 'Pessoa de interesse #04', revealedLabel: 'Bruno Alves', revealAtMission: 99 },
    { id: 'email-801', type: 'email', label: 'E-mail urgente', detail: '"Não registrar como desvio"', unlockEvidence: 'Evidência 9' },
    { id: 'email-802', type: 'email', label: 'E-mail ponte', detail: '"transferência ponte"', unlockEvidence: 'Evidência 9' },
    { id: 'conta-999', type: 'external_account', label: 'Conta Nexus', detail: 'Conta externa 999', unlockEvidence: 'Evidência 3' },
    { id: 'log-701', type: 'access_log', label: 'Acesso 12/03 22:30', detail: 'Financeiro após 22h', unlockEvidence: 'Evidência 4' },
    { id: 'log-702', type: 'access_log', label: 'Acesso 15/03 22:10', detail: 'Tesouraria após 22h', unlockEvidence: 'Evidência 4' },
  ],
  edges: [
    { source: 'suspeito-07', target: 'email-801' },
    { source: 'suspeito-07', target: 'email-802' },
    { source: 'suspeito-07', target: 'conta-999' },
    { source: 'suspeito-07', target: 'log-701' },
    { source: 'suspeito-07', target: 'log-702' },
    { source: 'suspeito-04', target: 'log-701' },
  ],
};

console.log('\n[1] buildGraphState — config nula retorna vazio');
assert(buildGraphState(null, [], [], 0).nodes.length === 0, 'config null -> nodes vazio');

console.log('\n[2] buildGraphState — nó ativa por evidência');
const state1 = buildGraphState(graphConfig, [], ['Evidência 3'], 0);
const conta = state1.nodes.find(n => n.id === 'conta-999');
assert(conta.active === true, 'conta-999 ativa com Evidência 3');
assert(conta.color === COLORS.external_account, 'cor da conta externa');

console.log('\n[3] buildGraphState — nó inativo sem evidência');
const email = state1.nodes.find(n => n.id === 'email-801');
assert(email.active === false, 'email-801 inativo sem Evidência 9');
assert(email.color === COLORS.inactive, 'cor inativa');

console.log('\n[4] buildGraphState — suspeito revelado após missão 5');
const state2 = buildGraphState(graphConfig, [1, 2, 3, 4, 5], [], 50);
const suspeito = state2.nodes.find(n => n.id === 'suspeito-07');
assert(suspeito.label === 'Camila Torres', 'label revelado Camila Torres');
assert(suspeito.active === true, 'suspeito ativo por revealAtMission');

console.log('\n[5] buildGraphState — suspeito não revelado antes da missão 5');
const state3 = buildGraphState(graphConfig, [1, 2, 3, 4], [], 10);
const suspeito3 = state3.nodes.find(n => n.id === 'suspeito-07');
assert(suspeito3.label === 'Pessoa de interesse #7', 'label neutro antes da missão 5');
assert(suspeito3.active === false, 'não ativo antes da missão 5');

console.log('\n[6] buildGraphState — cor do suspeito muda com suspeita');
const state4 = buildGraphState(graphConfig, [5], [], 75);
const suspeito4 = state4.nodes.find(n => n.id === 'suspeito-07');
assert(suspeito4.color === COLORS.suspectGlow, 'cor ciano neon quando suspeita >= 70');

console.log('\n[7] buildGraphState — arestas ativas apenas entre nós ativos');
const state5 = buildGraphState(graphConfig, [5], ['Evidência 3'], 50);
const edgeToConta = state5.edges.find(e => e.source === 'suspeito-07' && e.target === 'conta-999');
const edgeToEmail = state5.edges.find(e => e.source === 'suspeito-07' && e.target === 'email-801');
assert(edgeToConta.active === true, 'aresta para conta ativa');
assert(edgeToEmail.active === false, 'aresta para email inativa');

console.log('\n[8] buildGraphState — layout retorna coordenadas');
const state6 = buildGraphState(graphConfig, [], [], 0, 320, 240);
const centro = state6.nodes.find(n => n.id === 'suspeito-07');
assert(Math.abs(centro.x - 160) < 1 && Math.abs(centro.y - 120) < 40, 'suspeito próximo ao centro');
const sat = state6.nodes.find(n => n.id === 'conta-999');
assert(Math.abs(sat.x - 160) > 10 || Math.abs(sat.y - 120) > 10, 'satélite fora do centro');

console.log('\n[9] renderGraphSVG — gera SVG não vazio com elementos esperados');
const svg = renderGraphSVG(graphConfig, [3, 4, 5], ['Evidência 3', 'Evidência 4'], 80);
assert(svg.startsWith('<svg'), 'inicia com <svg');
assert(svg.includes('Camila Torres'), 'SVG inclui nome revelado');
assert(svg.includes('Conta Nexus'), 'SVG inclui label de conta');
assert(svg.includes('filter="url(#node-glow)"'), 'nós ativos usam glow');

console.log('\n[10] renderGraphSVG — escape de caracteres especiais');
const escapeConfig = {
  nodes: [{ id: 'x', type: 'email', label: 'A & B <> C', detail: '"quoted"', unlockEvidence: 'Evidência 1' }],
  edges: [],
};
const svg2 = renderGraphSVG(escapeConfig, [], ['Evidência 1'], 0);
assert(svg2.includes('A &amp; B &lt;&gt; C'), 'escape correto de & e <>');
assert(!svg2.includes('A & B <> C'), 'caracteres originais não presentes no SVG');

console.log('\n' + '='.repeat(50));
console.log(`RESULTADO: ${passed} passaram, ${failed} falharam`);
console.log('='.repeat(50));
process.exit(failed > 0 ? 1 : 0);
