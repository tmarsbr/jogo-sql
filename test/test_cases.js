/** Regressão dos casos e projetos: seeds, contratos e queries de referência. */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const {
  readSource,
  transformESM,
  evalModule,
  loadExecutor,
  loadValidator,
  loadCourseContent,
} = require('./helpers/load-source');

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) { console.log(`  PASS: ${message}`); passed++; }
  else { console.log(`  FAIL: ${message}`); failed++; }
}

function loadCaseModule(file) {
  return evalModule(transformESM(readSource(file)), {}, file);
}

function loadSeed(file) {
  const code = readSource(file);
  const schema = code.match(/export const SCHEMA_SQL\s*=\s*`([\s\S]*?)`;/);
  const seed = code.match(/export const SEED_SQL\s*=\s*`([\s\S]*?)`;/);
  if (!schema || !seed) throw new Error(`Seed inválido: ${file}`);
  return { schema: schema[1], seed: seed[1] };
}

async function run() {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(__dirname, '..', 'vendor', 'sql-wasm.wasm')) });
  const executor = loadExecutor();
  const validator = loadValidator(executor.executeQuery);
  const courseContentIds = new Set(loadCourseContent().COURSE_CONTENT.map(item => item.id));
  const windowRequiredConcepts = new Set([
    'over',
    'row_number',
    'dense_rank',
    'rank',
    'lag',
    'lead',
    'ntile',
    'first_value',
    'last_value',
  ]);
  const cases = [
    ['case002', 'cases/case002/levels.js', 'cases/case002/db-seed.js'],
    ['case003', 'cases/case003/levels.js', 'cases/case003/db-seed.js'],
    ['case004', 'cases/case004/levels.js', 'cases/case004/db-seed.js'],
    ['case005', 'cases/case005/levels.js', 'cases/case005/db-seed.js'],
    ['case006', 'cases/case006/levels.js', 'cases/case006/db-seed.js'],
    ['proj-ecommerce', 'cases/proj-ecommerce/levels.js', 'cases/proj-ecommerce/db-seed.js'],
    ['proj-clientes', 'cases/proj-clientes/levels.js', 'cases/proj-clientes/db-seed.js'],
    ['proj-vendas', 'cases/proj-vendas/levels.js', 'cases/proj-vendas/db-seed.js'],
    ['proj-marketing', 'cases/proj-marketing/levels.js', 'cases/proj-marketing/db-seed.js'],
    ['proj-logistica', 'cases/proj-logistica/levels.js', 'cases/proj-logistica/db-seed.js'],
    ['proj-estoque', 'cases/proj-estoque/levels.js', 'cases/proj-estoque/db-seed.js'],
    ['proj-educacao', 'cases/proj-educacao/levels.js', 'cases/proj-educacao/db-seed.js'],
    ['proj-saude', 'cases/proj-saude/levels.js', 'cases/proj-saude/db-seed.js'],
    ['proj-financeiro', 'cases/proj-financeiro/levels.js', 'cases/proj-financeiro/db-seed.js'],
    ['proj-suporte', 'cases/proj-suporte/levels.js', 'cases/proj-suporte/db-seed.js'],
    ['proj-publico', 'cases/proj-publico/levels.js', 'cases/proj-publico/db-seed.js'],
    ['proj-futebol', 'cases/proj-futebol/levels.js', 'cases/proj-futebol/db-seed.js'],
  ];
  const expectedMissionCounts = {
    case002: 11,
    case003: 10,
    case004: 11,
    case005: 14,
    case006: 14,
    'proj-ecommerce': 10,
    'proj-clientes': 10,
    'proj-vendas': 10,
    'proj-marketing': 10,
    'proj-logistica': 10,
    'proj-estoque': 10,
    'proj-educacao': 10,
    'proj-saude': 10,
    'proj-financeiro': 10,
    'proj-suporte': 10,
    'proj-publico': 10,
    'proj-futebol': 10,
  };

  for (const [caseId, levelsFile, seedFile] of cases) {
    console.log(`\n=== ${caseId} ===`);
    const levels = loadCaseModule(levelsFile);
    const { schema, seed } = loadSeed(seedFile);
    const db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON;');
    db.run(schema);
    db.run(seed);
    assert(levels.LEVELS.length === expectedMissionCounts[caseId], `${caseId} tem ${expectedMissionCounts[caseId]} missões`);
    assert(
      levels.LEVELS.every((level, index) => level.id === index + 1),
      `${caseId} possui IDs de missão sequenciais de 1 a ${levels.LEVELS.length}`
    );
    assert(Boolean(levels.DATABASE_ANALYSIS), `${caseId} possui a Etapa 0 de análise do banco`);
    assert(levels.DATABASE_ANALYSIS.entities.length >= 4, `${caseId} explica suas entidades principais`);
    assert(levels.DATABASE_ANALYSIS.decisions.length >= 3, `${caseId} documenta decisões de design`);
    assert(levels.DATABASE_ANALYSIS.checkpoints.length >= 2, `${caseId} inclui missões conceituais`);
    if (levels.GAMEPLAY?.finalChallenge) {
      const timelineIds = new Set((levels.GAMEPLAY.timeline?.events || []).map(event => event.id));
      const challengeEvidenceIds = levels.GAMEPLAY.finalChallenge.steps.map(step => step.evidenceId);
      assert(challengeEvidenceIds.every(id => timelineIds.has(id)), `${caseId}: desafio final usa somente evidências existentes`);
      assert(new Set(challengeEvidenceIds).size === challengeEvidenceIds.length, `${caseId}: cada etapa do desafio exige uma evidência própria`);
    }
    for (const level of levels.LEVELS) {
      const requiredConcepts = Array.isArray(level.requiredConcepts)
        ? level.requiredConcepts.map(concept => String(concept).trim().toLowerCase())
        : [];
      const courseRefs = Array.isArray(level.courseRefs) ? level.courseRefs : [];
      const missingCourseRefs = courseRefs.filter(ref => !courseContentIds.has(ref));

      assert(level.hints.length === 3, `Missão ${level.id}: possui exatamente 3 dicas locais`);
      assert(
        courseRefs.length > 0 && missingCourseRefs.length === 0,
        `Missão ${level.id}: courseRefs apontam para conteúdos existentes${missingCourseRefs.length > 0 ? ` (${missingCourseRefs.join(', ')})` : ''}`
      );

      if (/\bcte\b/i.test(level.concept || '')) {
        assert(/\bwith\b/i.test(level.referenceQuery), `Missão ${level.id}: conceito CTE usa WITH na referência`);
        assert(requiredConcepts.includes('with'), `Missão ${level.id}: conceito CTE exige requiredConcepts com WITH`);
      }

      if (/\bwindow\b/i.test(level.concept || '')) {
        assert(/\bover\s*\(/i.test(level.referenceQuery), `Missão ${level.id}: conceito Window usa OVER na referência`);
        assert(
          requiredConcepts.some(concept => windowRequiredConcepts.has(concept)),
          `Missão ${level.id}: conceito Window exige OVER ou função de janela em requiredConcepts`
        );
      }

      if (level.executionMode === 'create_view') {
        const wrongName = validator.validateLevel(
          'CREATE VIEW vw_nome_errado AS SELECT 1 AS valor;',
          level,
          db
        );
        assert(wrongName.type === validator.FEEDBACK_WRONG_RESULT, `Missão ${level.id}: rejeita nome de view incorreto`);

        const wrongDefinition = `CREATE VIEW ${level.viewName} AS SELECT 1 AS coluna_errada;`;
        const wrongResult = validator.validateLevel(wrongDefinition, level, db);
        assert(wrongResult.type !== validator.FEEDBACK_CORRECT, `Missão ${level.id}: rejeita definição incorreta`);
        const leftover = db.exec(`SELECT name FROM sqlite_master WHERE type='view' AND name='${level.viewName}';`);
        assert(leftover.length === 0 || leftover[0].values.length === 0, `Missão ${level.id}: remove view inválida antes da nova tentativa`);
      }

      const result = validator.validateLevel(level.referenceQuery, level, db);
      assert(result.type === validator.FEEDBACK_CORRECT, `Missão ${level.id}: referência valida (${result.type})`);
      if (level.executionMode === 'create_view') {
        const created = db.exec(`SELECT name FROM sqlite_master WHERE type='view' AND name='${level.viewName}';`);
        assert(created.length === 1 && created[0].values.length === 1, `Missão ${level.id}: view correta permanece disponível`);
        assert(result.result && result.result.rowCount > 0, `Missão ${level.id}: devolve a prévia da view para a interface`);
        const repeated = validator.validateLevel(level.referenceQuery, level, db);
        assert(repeated.type === validator.FEEDBACK_CORRECT, `Missão ${level.id}: a mesma solução pode ser reenviada`);
      }
    }
    if (caseId === 'case003') {
      const count = db.exec('SELECT COUNT(*) FROM transferencias WHERE carteira_destino_id = 2;')[0].values[0][0];
      assert(count === 47, 'Carteira suspeita recebeu 47 microtransferências');
    }
    if (caseId === 'case002') {
      const insider = db.exec('SELECT * FROM vw_relatorio_seguranca;')[0].values;
      assert(insider.length === 1 && insider[0][0] === 'Rafael Mendes', 'Relatório de segurança identifica apenas Rafael Mendes');
      assert(insider[0][1] === 650 && insider[0][2] === 3, 'Relatório evita fan-out e totaliza 650 registros em 3 exportações');
    }
    if (caseId === 'case004') {
      const auditPreview = db.exec('SELECT COUNT(*) FROM vw_auditoria_estoque;')[0].values[0][0];
      assert(auditPreview === 4, 'View de auditoria inclui as quatro atualizações de produtos');
      const count = db.exec("SELECT COUNT(*) FROM movimentacoes_estoque WHERE responsavel_id = 7 AND motivo LIKE '%ajuste manual%';")[0].values[0][0];
      assert(count === 23, 'Responsável suspeito possui 23 ajustes manuais');
      const dml = executor.executeQuery('UPDATE produtos SET estoque_atual = 1 WHERE id = 5;', db, { allowDml: true });
      assert(dml.type === executor.RESULT_EMPTY, 'Sandbox DML permite uma alteração controlada');
      assert(db.exec('SELECT estoque_atual FROM produtos WHERE id = 5;')[0].values[0][0] === 1, 'Alteração DML ficou restrita ao banco do caso em memória');
    }
    if (caseId === 'case005') {
      const fkViolations = db.exec('PRAGMA foreign_key_check;');
      assert(fkViolations.length === 0 || fkViolations[0].values.length === 0, 'Caso 005 termina sem violações de FK');
      assert(db.exec('SELECT COUNT(*) FROM clientes;')[0].values[0][0] === 10, 'Caso 005 consolida 9 clientes da planilha e preserva 1 prospect');
      assert(db.exec("SELECT nome FROM clientes WHERE cpf = '111.111.111-01';")[0].values[0][0] === 'José da Silva', 'Caso 005 escolhe deterministicamente o primeiro cadastro de cada CPF');
      assert(db.exec('SELECT COUNT(*) FROM vendas;')[0].values[0][0] === 20, 'Caso 005 possui 20 cabeçalhos de venda');
      assert(db.exec('SELECT COUNT(*) FROM vendas WHERE cliente_id IS NULL OR vendedor_id IS NULL;')[0].values[0][0] === 0, 'Caso 005 preenche todas as FKs obrigatórias do modelo final');
      assert(db.exec('SELECT COUNT(*) FROM itens_venda;')[0].values[0][0] === 20, 'Caso 005 possui 20 itens ligados por FKs');
      const noPurchase = db.exec('SELECT COUNT(*) FROM clientes c LEFT JOIN vendas v ON v.cliente_id = c.id WHERE v.id IS NULL;')[0].values[0][0];
      assert(noPurchase === 1, 'LEFT JOIN do Caso 005 encontra o prospect sem compras');
    }
    if (caseId === 'case006') {
      const fkViolations = db.exec('PRAGMA foreign_key_check;');
      assert(fkViolations.length === 0 || fkViolations[0].values.length === 0, 'Caso 006 termina sem violações de FK');
      assert(db.exec('SELECT COUNT(*) FROM dim_clientes;')[0].values[0][0] === 9, 'ETL carrega os 9 clientes na dimensão');
      assert(db.exec('SELECT COUNT(*) FROM dim_tempo;')[0].values[0][0] === 20, 'Dimensão tempo possui 20 datas sem duplicação');
      assert(db.exec('SELECT COUNT(*) FROM fct_vendas;')[0].values[0][0] === 20, 'Tabela fato possui exatamente 20 linhas na granularidade definida');
      const incrementalRows = db.exec(levels.LEVELS.find(level => level.id === 6).referenceQuery)[0].values;
      assert(incrementalRows.length === 5 && incrementalRows[0][0] === 21 && incrementalRows[4][0] === 25, 'Carga incremental preserva cinco novos ids sem colidir com as vendas 1–20 do OLTP');
      let duplicateFactRejected = false;
      try {
        db.run('INSERT INTO fct_vendas (source_venda_id, tempo_id, cliente_id, produto_id, vendedor_id, regiao_id, quantidade, valor_unitario, valor_total) SELECT source_venda_id, tempo_id, cliente_id, produto_id, vendedor_id, regiao_id, quantidade, valor_unitario, valor_total FROM fct_vendas WHERE id = 1;');
      } catch {
        duplicateFactRejected = true;
      }
      assert(duplicateFactRejected, 'Granularidade da fato rejeita a mesma combinação venda de origem + produto');
      const monthly = db.exec(levels.LEVELS.find(level => level.id === 11).referenceQuery)[0].values;
      assert(monthly.length === 2 && monthly[0][0] === '2024-01' && monthly[1][0] === '2024-02', 'LAG compara os dois meses, não cada dia da dimensão tempo');
      db.run('UPDATE fct_vendas SET valor_total = valor_total + 1 WHERE id = 1;');
      assert(db.exec('SELECT COUNT(*) FROM log_auditoria;')[0].values[0][0] === 1, 'Trigger final registra uma alteração real na fato');
    }
    if (caseId === 'proj-vendas') {
      const level = levels.LEVELS.find(item => item.id === 6);
      const withoutWindow = validator.validateLevel(
        'SELECT v.id, v.data_venda, v.valor_centavos, (SELECT SUM(anterior.valor_centavos) FROM vendas anterior WHERE anterior.data_venda < v.data_venda OR (anterior.data_venda = v.data_venda AND anterior.id <= v.id)) AS acumulado_centavos FROM vendas v ORDER BY v.data_venda ASC, v.id ASC;',
        level,
        db
      );
      assert(
        withoutWindow.type === validator.FEEDBACK_MISSING_CONCEPT && withoutWindow.missingConcepts.includes('over'),
        'Running total de vendas exige uma window function com OVER'
      );

      const regionalLevel = levels.LEVELS.find(item => item.id === 8);
      const withoutOrder = validator.validateLevel(
        "SELECT r.nome AS regiao, strftime('%Y-%m', ve.data_venda) AS ano_mes, SUM(ve.valor_centavos) AS total_faturado_centavos FROM regioes r JOIN vendedores v ON v.regiao_id = r.id JOIN vendas ve ON ve.vendedor_id = v.id GROUP BY r.id, r.nome, strftime('%Y-%m', ve.data_venda);",
        regionalLevel,
        db
      );
      assert(
        withoutOrder.type === validator.FEEDBACK_MISSING_CONCEPT && withoutOrder.missingConcepts.includes('order by'),
        'Desempenho regional mensal exige ORDER BY explícito'
      );
    }
    if (caseId === 'proj-financeiro') {
      const level = levels.LEVELS.find(item => item.id === 9);
      const withoutWindow = validator.validateLevel(
        "SELECT ft.data_transacao, ft.valor_centavos, (SELECT SUM(anterior.valor_centavos) FROM faturas_transacoes anterior WHERE anterior.cartao_id = ft.cartao_id AND (anterior.data_transacao < ft.data_transacao OR (anterior.data_transacao = ft.data_transacao AND anterior.id <= ft.id))) AS total_acumulado_centavos FROM faturas_transacoes ft JOIN cartoes c ON c.id = ft.cartao_id JOIN clientes_banco cb ON cb.id = c.cliente_id WHERE cb.nome = 'Maurício Dias Silveira' ORDER BY ft.data_transacao ASC;",
        level,
        db
      );
      assert(
        withoutWindow.type === validator.FEEDBACK_MISSING_CONCEPT && withoutWindow.missingConcepts.includes('over'),
        'Running total financeiro exige uma window function com OVER'
      );
    }
    if (caseId === 'proj-logistica') {
      const transitLevel = levels.LEVELS.find(item => item.id === 3);
      const ignoresDeliveryStatus = validator.validateLevel(
        'SELECT r.id AS rota_id, r.estado_destino, r.distancia_km, ROUND(AVG(julianday(e.data_entrega) - julianday(e.data_despacho)), 1) AS media_dias_entrega FROM rotas r JOIN envios e ON e.rota_id = r.id WHERE 1 = 1 GROUP BY r.id, r.estado_destino, r.distancia_km ORDER BY media_dias_entrega DESC;',
        transitLevel,
        db
      );
      assert(
        ignoresDeliveryStatus.type !== validator.FEEDBACK_CORRECT,
        'Tempo de trânsito rejeita filtro degenerado que inclui envio devolvido'
      );

      const delaysLevel = levels.LEVELS.find(item => item.id === 4);
      const delayRows = db.exec(delaysLevel.referenceQuery)[0].values;
      assert(delayRows.length === 2, 'Corte de atrasos seleciona somente transportadoras com mais de uma ocorrência');
      const ignoresDelayCutoff = validator.validateLevel(
        "SELECT t.nome AS transportadora, COUNT(e.id) AS total_atrasos FROM transportadoras t JOIN envios e ON e.transportadora_id = t.id WHERE e.status = 'entregue' AND e.data_entrega > e.data_estimada GROUP BY t.id, t.nome HAVING COUNT(e.id) > 0 ORDER BY total_atrasos DESC;",
        delaysLevel,
        db
      );
      assert(ignoresDelayCutoff.type !== validator.FEEDBACK_CORRECT, 'Missão de atrasos rejeita HAVING que não aplica o corte solicitado');

      const rankingLevel = levels.LEVELS.find(item => item.id === 8);
      const rankingIgnoresStatus = validator.validateLevel(
        'WITH medias AS (SELECT r.estado_destino, ROUND(AVG(julianday(e.data_entrega) - julianday(e.data_despacho)), 1) AS media_dias FROM rotas r JOIN envios e ON e.rota_id = r.id WHERE 1 = 1 GROUP BY r.estado_destino) SELECT estado_destino, media_dias, DENSE_RANK() OVER(ORDER BY media_dias DESC) AS rank_demora FROM medias ORDER BY rank_demora ASC;',
        rankingLevel,
        db
      );
      assert(rankingIgnoresStatus.type !== validator.FEEDBACK_CORRECT, 'Ranking de rotas rejeita envio devolvido no cálculo de entregas');
    }
    if (caseId === 'proj-educacao') {
      const result = db.exec(levels.LEVELS.find(item => item.id === 2).referenceQuery)[0].values;
      const noEnrollments = result.find(row => row[0] === 'Matemática Financeira');
      assert(result.length === 7, 'Reprovações preservam todas as disciplinas, inclusive sem matrículas');
      assert(noEnrollments && noEnrollments[1] === 0, 'Disciplina sem matrícula recebe zero reprovações');

      const classificationLevel = levels.LEVELS.find(item => item.id === 5);
      const includesOngoingEnrollment = validator.validateLevel(
        "SELECT a.nome AS aluno, tm.nota_final, CASE WHEN tm.nota_final >= 9.0 THEN 'Excelente' WHEN tm.nota_final >= 7.0 THEN 'Aprovado' ELSE 'Insuficiente' END AS aproveitamento FROM turmas_matriculas tm JOIN alunos a ON a.id = tm.aluno_id WHERE 1 = 1 ORDER BY tm.id ASC;",
        classificationLevel,
        db
      );
      assert(includesOngoingEnrollment.type !== validator.FEEDBACK_CORRECT, 'Classificação de notas rejeita matrícula ainda em andamento');

      const professorLevel = levels.LEVELS.find(item => item.id === 9);
      const countsOngoingEnrollment = validator.validateLevel(
        'WITH desempenho_professores AS (SELECT p.id AS professor_id, p.nome AS professor, COUNT(tm.id) AS total_avaliados, ROUND(AVG(tm.nota_final), 2) AS media_geral_notas FROM professores p JOIN disciplinas d ON d.professor_id = p.id JOIN turmas_matriculas tm ON tm.disciplina_id = d.id GROUP BY p.id, p.nome) SELECT professor, total_avaliados, media_geral_notas FROM desempenho_professores ORDER BY media_geral_notas DESC;',
        professorLevel,
        db
      );
      assert(countsOngoingEnrollment.type !== validator.FEEDBACK_CORRECT, 'Aproveitamento docente não conta matrícula sem avaliação final');

      const pedagogicalView = db.exec('SELECT disciplina, total_matriculas, media_notas FROM vw_desempenho_pedagogico_disciplinas ORDER BY disciplina;')[0].values;
      const emptyDiscipline = pedagogicalView.find(row => row[0] === 'Matemática Financeira');
      assert(pedagogicalView.length === 7, 'View pedagógica preserva todas as sete disciplinas');
      assert(emptyDiscipline && emptyDiscipline[1] === 0 && emptyDiscipline[2] === null, 'View pedagógica representa disciplina sem matrículas com zero e média nula');
    }
    if (caseId === 'proj-clientes') {
      const result = db.exec(levels.LEVELS.find(item => item.id === 4).referenceQuery)[0].values;
      assert(result.length === 10, 'Recência preserva todos os clientes, inclusive sem compras');
      assert(result.some(row => row[1] === null), 'Cliente sem compras recebe ultima_compra nula');
    }
    if (caseId === 'proj-marketing') {
      const channelRows = db.exec(levels.LEVELS.find(item => item.id === 2).referenceQuery)[0].values;
      const organic = channelRows.find(row => row[0] === 'Orgânico / SEO');
      assert(channelRows.length === 5 && organic && organic[1] === 0, 'Investimento inclui canal orgânico com custo zero');

      const budgetLevel = levels.LEVELS.find(item => item.id === 9);
      const budgetRows = db.exec(budgetLevel.referenceQuery)[0].values;
      assert(budgetRows.length === 4 && !budgetRows.some(row => row[0] === 'Branding & Stories Verão'), 'Seed contém campanha acima do orçamento para tornar o filtro discriminante');
      const ignoresBudget = validator.validateLevel(
        'WITH custos AS (SELECT campanha_id, SUM(custo_centavos) AS custo_realizado_centavos FROM custos_diarios GROUP BY campanha_id) SELECT c.nome AS campanha, c.orcamento_centavos, cu.custo_realizado_centavos FROM campanhas c JOIN custos cu ON cu.campanha_id = c.id WHERE 1 = 1 ORDER BY c.id ASC;',
        budgetLevel,
        db
      );
      assert(ignoresBudget.type !== validator.FEEDBACK_CORRECT, 'Missão de orçamento rejeita filtro degenerado WHERE 1 = 1');
    }
    if (caseId === 'proj-saude') {
      const receptionLevel = levels.LEVELS.find(item => item.id === 2);
      const receptionIgnoresStatus = validator.validateLevel(
        'SELECT u.nome AS unidade, ROUND(AVG(a.tempo_espera_minutos), 1) AS tempo_medio_espera_minutos FROM unidades u JOIN medicos m ON m.unidade_id = u.id JOIN agendamentos a ON a.medico_id = m.id WHERE 1 = 1 GROUP BY u.id, u.nome ORDER BY tempo_medio_espera_minutos DESC;',
        receptionLevel,
        db
      );
      assert(receptionIgnoresStatus.type !== validator.FEEDBACK_CORRECT, 'Espera na recepção rejeita atendimento cancelado depois do check-in');

      const waitLevel = levels.LEVELS.find(item => item.id === 5);
      const waitRows = db.exec(waitLevel.referenceQuery)[0].values;
      assert(waitRows[0][0] === 'Neurologia' && waitRows[0][1] === 30, 'Tempo de fila considera somente consultas efetivamente realizadas');
      const includesCancelled = validator.validateLevel(
        'SELECT e.nome AS especialidade, CAST(AVG(julianday(a.data_consulta) - julianday(a.data_agendamento)) AS INTEGER) AS media_dias_fila FROM especialidades e JOIN medicos m ON m.especialidade_id = e.id JOIN agendamentos a ON a.medico_id = m.id GROUP BY e.id, e.nome ORDER BY media_dias_fila DESC;',
        waitLevel,
        db
      );
      assert(includesCancelled.type !== validator.FEEDBACK_CORRECT, 'Tempo de fila rejeita consultas canceladas e no-show');

      const specialtyWaitLevel = levels.LEVELS.find(item => item.id === 7);
      const specialtyWaitIgnoresStatus = validator.validateLevel(
        'SELECT e.nome AS especialidade, ROUND(AVG(a.tempo_espera_minutos), 1) AS tempo_medio_espera FROM especialidades e JOIN medicos m ON m.especialidade_id = e.id JOIN agendamentos a ON a.medico_id = m.id WHERE 1 = 1 GROUP BY e.id, e.nome HAVING AVG(a.tempo_espera_minutos) > 20 ORDER BY tempo_medio_espera DESC;',
        specialtyWaitLevel,
        db
      );
      assert(specialtyWaitIgnoresStatus.type !== validator.FEEDBACK_CORRECT, 'Espera por especialidade rejeita consulta cancelada após longa espera');
    }
    if (caseId === 'proj-suporte') {
      const topCsatLevel = levels.LEVELS.find(item => item.id === 6);
      const topCsatRows = db.exec(topCsatLevel.referenceQuery)[0].values;
      assert(
        topCsatRows.length === 2 && topCsatRows.some(row => row[0] === 'Mariana Costa Silveira'),
        'Top CSAT aplica amostra mínima e preserva Mariana no resultado'
      );
      const ignoresMinimumSample = validator.validateLevel(
        'SELECT a.nome AS atendente, ROUND(AVG(c.nota_csat), 2) AS media_csat FROM atendentes a JOIN tickets t ON t.atendente_id = a.id JOIN avaliacoes_csat c ON c.ticket_id = t.id GROUP BY a.id, a.nome HAVING COUNT(c.id) > 0 ORDER BY media_csat DESC LIMIT 2;',
        topCsatLevel,
        db
      );
      assert(ignoresMinimumSample.type !== validator.FEEDBACK_CORRECT, 'Top CSAT rejeita HAVING que ignora a amostra mínima');
    }
    if (caseId === 'proj-publico') {
      const budgetLevel = levels.LEVELS.find(item => item.id === 5);
      const budgetRows = db.exec(budgetLevel.referenceQuery)[0].values;
      assert(budgetRows.length === 2, 'Corte orçamentário separa apenas municípios acima de R$ 10 bilhões');
      const ignoresCutoff = validator.validateLevel(
        'SELECT m.nome AS municipio, SUM(d.valor_liquidado_centavos) AS total_liquidado_centavos FROM municipios m JOIN despesas_publicas d ON d.municipio_id = m.id GROUP BY m.id, m.nome HAVING COUNT(*) > 0 ORDER BY total_liquidado_centavos DESC;',
        budgetLevel,
        db
      );
      assert(ignoresCutoff.type !== validator.FEEDBACK_CORRECT, 'Missão orçamentária rejeita HAVING que não aplica o corte');
    }
    if (caseId === 'proj-vendas') {
      const targetLevel = levels.LEVELS.find(item => item.id === 7);
      const targetRows = db.exec(targetLevel.referenceQuery)[0].values;
      assert(targetRows.filter(row => row[3] === 'Abaixo da Meta').length === 1, 'Seed de metas inclui ao menos um vendedor abaixo da meta');
      const alwaysMet = validator.validateLevel(
        "SELECT v.nome AS vendedor, SUM(ve.valor_centavos) AS valor_realizado_centavos, m.meta_centavos, CASE WHEN 1 = 1 THEN 'Superou Meta' ELSE 'Abaixo da Meta' END AS status_meta FROM vendedores v JOIN metas_mensais m ON m.vendedor_id = v.id AND m.ano_mes = '2024-03' JOIN vendas ve ON ve.vendedor_id = v.id AND strftime('%Y-%m', ve.data_venda) = '2024-03' GROUP BY v.id, v.nome, m.meta_centavos ORDER BY valor_realizado_centavos DESC;",
        targetLevel,
        db
      );
      assert(alwaysMet.type !== validator.FEEDBACK_CORRECT, 'Missão de metas rejeita CASE degenerado sempre verdadeiro');
    }
    db.close();
  }
  console.log(`\nRESULTADO: ${passed} passaram, ${failed} falharam`);
  process.exit(failed ? 1 : 0);
}

run().catch(error => { console.error(error); process.exit(1); });
