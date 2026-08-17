# Notas de implementação — Modo Bug Hunter

## Objetivo
Modo "Bug Hunter": o jogo apresenta query com erros propositais (sintaxe, lógica, performance);
jogador identifica e corrige. Treina debugging.

## Decisões de arquitetura
- Jogo = SPA em módulos ES puros (sem framework), banco sql.js em memória, SPA servida por server.js.
- Missões data-driven em levels.js por caso; `executionMode` ('create_view', 'ddl') ramifica o validador.
- Novo modo implementado como um "caso especial" `bug-hunter` registrado em case-manager.js
  (type: 'bug-hunter'), dados em src/cases/bug-hunter.js, validador próprio em
  src/bug-hunter-validator.js. NÃO altera cases existentes.
- Banco usado: schema/seed do case001 (TechFin) — mesmo banco da investigação.
  BUG: ao entrar no modo, se db já carregado com outro caso, forçar reload do banco case001
  via initDB('case001', { force: true })? — melhor: registrar db do modo Bug Hunter como
  'bug-hunter' que usa a definição do case001 em getCaseDatabaseDefinition.

## Contrato do desafio (BUG_CHALLENGES em src/cases/bug-hunter.js)
Campos: id, number, title, concept, bugType ('sintaxe'|'logica'|'performance'|'logica+performance'),
context, buggyQuery, bugs[], objective, tables, expectedColumns, correctQuery, referenceQuery,
expectedResultQuery, requiredConcepts, hintBugs (progressivas, 1 por bug + solução),
hints (3 dicas genéricas), courseRefs, evidence, explanation. executionMode: 'ddl' quando o
desafio é criar índice.

## Feedback do validador Bug Hunter
correct / sql_error / blocked / wrong_result / wrong_columns / missing_concept / bug_not_fixed
(isIdenticalToBuggy: query enviada idêntica à quebrada).

## Integração UI
- Botão "MODO BUG HUNTER" no lobby (header da seleção de casos) — acesso direto, não bloqueado.
- Tela de briefing com os bugs listados (pill de tipo), a buggyQuery em pré-formatada.
- Mesmo editor SQL; botão EXECUTAR valida via validateBugChallenge.
- Dicas de bugs: botão "REVELAR BUG" consome hintBugs um a um (mesma mecânica de estrelas:
  3 bugs revelados por desafio = 0 estrelas; 0 revelados = 3 estrelas).
- Pontuação: 100 pts base por desafio + estrelas.
- Persistência: progressByCase['bug-hunter'] (adicionar a KNOWN_CASE_IDS, getDefaultCaseProgress
  não precisa mudar — campos existentes bastam).
- case-manager: isCaseComplete para type 'bug-hunter' = todos os desafios completados.
- Conclusão mostra BUG_HUNTER_CONCLUSION com modal padrão.

## Desafios criados (10) — banco case001
1. sintaxe: FORM/ORDEY → FROM/ORDER BY (funcionarios)
2. tabela errada: funcionarios → logs_acesso (acessos >22h)
3. lógica: HAVING sem agregação → WHERE (transações >5M)
4. lógica: INNER JOIN → LEFT JOIN (conta 0 transações)
5. lógica: LIKE case-sensitive → LOWER() (e-mails urgente)
6. lógica: subquery com GROUP BY retorna múltiplas médias → escalar (média global)
7. performance (ddl): criar índice idx_transacoes_origem em transacoes(conta_origem_id)
8. lógica: centavos → reais (salario_centavos/100.0)
9. lógica+performance: CROSS JOIN implícito (FROM t, c) → INNER JOIN ON conta_destino_id
10. lógica+performance: GROUP BY f.nome → f.id,f.nome + falta WHERE valor>5M

## Estado da implementação (progresso)
- [x] CRIADO: src/cases/bug-hunter.js (10 desafios + INTRO/CONCLUSION, exports BUG_CHALLENGES, BUG_HUNTER_INTRO, BUG_HUNTER_CONCLUSION, BUG_HUNTER_GAMEPLAY)
- [x] CRIADO: src/bug-hunter-validator.js (validador puro; feedbacks correct/sql_error/blocked/wrong_result/wrong_columns/missing_concept/bug_not_fixed; isIdenticalToBuggy exportada)
- [x] case-manager.js: registro bug-hunter (type 'bug-hunter', icon 🐛, number 'BH', lockedByDefault false) + isCaseComplete para bug-hunter usa BUG_CHALLENGES
- [x] db.js: 'bug-hunter' mapeado para schema/seed do case001
- [x] storage.js: bug-hunter em KNOWN_CASE_IDS + getDefaultCaseProgress em getDefaultState
- [x] app.js: import validateBugChallenge/BH_FEEDBACK_CORRECT/BH_FEEDBACK_BUG_NOT_FIXED; helpers getActiveBugChallenge() e isBugHunterMode();
  loadMission ramifica para loadBugChallenge(challengeId) quando type==='bug-hunter'; loadBugChallenge implementado
  (briefing com bugType pill, lista de bugs, buggyQuery no editor via setEditorValue, rail/progress/score/header);
  handler Executar ramifica isBugHunterMode com validateBugChallenge (usa renderBugFeedback, renderBugProgress, renderBugRail — AINDA NÃO EXISTEM);
  startGame ramifica isBugHunterMode para achar primeiro desafio incompleto por number.

## A FAZER (ordem atualizada — itens 5 já feito em ui.js: renderBugHints, renderBugFeedback, renderBugProgress, renderBugRail, setHintButtonBugMode)
1. IMPORT: app.js precisa importar renderBugHints, renderBugFeedback, renderBugProgress, renderBugRail de ui.js (setHintButtonBugMode não usado diretamente)
2. app.js: adaptar handler btnHint — no modo bug-hunter, revelar hintBugs do desafio local (sem IA) progressivamente
3. app.js: adaptar btnNext para bug-hunter: achar challenge.number+1 e loadMission(ch.id)
4. app.js: configurar CASE_INTRO/CASE_CONCLUSION do bug-hunter (spread BUG_HUNTER_INTRO/BUG_HUNTER_CONCLUSION no registro ou tratar configureIntro/showActiveCaseConclusion com fallback) — configurarIntro usa intro.story.split('\n'), dossierMissoes usa getTotalLevels(), isProject? — bug-hunter é tratado como investigação (não project)
5. case-manager.js: getInvestigations() só inclui type investigation ou undefined → adicionar 'bug-hunter' à lista (para aparecer no lobby)
6. index.css: estilos .bug-hunter-briefing, .bug-header-row, .bug-type-badge (syntax=vermelho #FF6B7F, logic=laranja #FFB020, performance=roxo #A78BFA, mixed=gradiente), .bug-list, .bug-list .bug-number, .bug-query-box (fundo avermelhado rgba(239,68,68,.07), borda), .bug-query-topbar, .bug-dot, .progress-bug-tag, .rail-mission-btn-done, .rail-mission-btn-active
7. test/test_bug_hunter.js: testes do validador puro para os 10 desafios (correct com solution, buggy→bug_not_fixed, wrong result, sql_error, blocked) usando sql.js + seed case001 (loadSeedData do harness retorna SCHEMA_SQL/SEED_SQL do case001)
8. npm test: conferir scripts em package.json e rodar
9. Testar no navegador (server.js porta 3000, usar expose)
10. Commit + push para tmarsbr/jogo-sql (sync com /mnt/desktop/jogo-sql se necessário)

## Detalhe importante (descoberto)
- getInvestigations() filtra type 'investigation' | undefined → bug-hunter NÃO aparece no lobby sem ajuste
- showActiveCaseConclusion usa activeCase.CASE_CONCLUSION.story/nextSteps e CASE_INTRO.subtitle → registrar BUG_HUNTER_INTRO/CASE_CONCLUSION no case-manager spread

## Estado de testes baseline
npm test: 71 passaram, 0 falharam (antes das mudanças).

## Estado atual (fase 5)
- DONE: helpers/load-source.js + loadBugHunterChallenges / loadBugHunterValidator
- DONE: test/test_bug_hunter.js criado (10 desafios x 7 checks + integridade). NOTA: as 'EQUIVALENT_SOLUTIONS' do teste referem-se aos desafios 2,3,8,9 — PRECISO VERIFICAR o conteúdo real de bug-2, bug-3, bug-8, bug-9 no src/cases/bug-hunter.js para que as queries dos testes batam com as corretQuery desses desafios (o teste usa queries fixas que assumem schema). Se não baterem, o teste falha em 2.x.
- PRÓXIMO: rodar `node test/test_bug_hunter.js`, corrigir variantes conforme necessário, rodar npm test completo.
- ATENÇÃO: desafio bug-9 (CROSS JOIN → INNER JOIN) e bug-2 (WHERE + JOIN) — conferir queries reais antes de rodar.

## Diagnóstico snapshot DDL (em andamento)
- validador DDL agora usa snapshot: db.export() → new SQL.Database(clone) → aplica correctQuery → compara expectedResultQuery.
- FALHA: corretQuery no bug-7 dá sql_error no snapshot. Causa provável: no snapshot, o índice idx_transacoes_origem JÁ EXISTE no db do jogador (correctQuery cria duplicata → "index already exists" → error).
  - bug-7.1: banco fresh, jogador envia correctQuery primeiro → atualState OK, mas o snapshot clona o MESMO db que JÁ TEM o índice (o banco do jogador já foi modificado pela correção ANTES do snapshot!) → correctQuery duplica no snapshot → error.
  - bug-7.6b: igual, índice correto já existe no db do jogador → snapshot duplica.
- CORREÇÃO NEEDED: o snapshot deve ser criado ANTES da execução da correção do jogador (estado limpo) — mas validateBugChallenge executa a correção primeiro. Solução: clonar o db antes do execResult no início do caminho DDL (clone inicial), e usar esse clone como base do snapshot.
- Alternativa mais simples e robusta: no caminho DDL, comparar o estado final do jogador contra o estado obtido aplicando correctQuery a partir de um banco SEM modificações do jogador — ou seja, reverter as mudanças? Complexo. Melhor: capturar o snapshot ANTES de executeQuery(sql) e usar o snapshot para aplicar a correctQuery.
  → Mover o clone para antes da execução (guardar db.export() antes de executeQuery) OU passar um "initialState" — a execução da correção do jogador altera o db compartilhado, o que é inevitável nesse contrato. Como o executor já aceitou a correção (execResult.type ok/empty), precisamos do estado pré-correção: fazer o clone no início do caminho DDL.

## Estado do teste no navegador (fase 6)
- Bug Hunter aparece no lobby como CASO #BH LIBERADO (fix: getAvailableCases inclui type bug-hunter com !lockedByDefault fora do encadeamento investigativo).
- Export duplicado isIdenticalToBuggy corrigido no bug-hunter-validator.js.
- Testes npm: todos verdes (126 no test_bug_hunter + suites existentes).
- Servidor local: python http.server porta 8899, exposto em https://8899-ihucc1ly5hxcvs5lx61eb-7e63a09d.us5.manus.computer
- Próximo: clicar ABRIR no card BH → verificar tela de introdução, rail de 10 relatórios, query quebrada no editor, execução, feedback, dicas, conclusão.
- Pendências pós-teste: commit + push no repo tmarsbr/jogo-sql (repo do GitHub integrado).

## Teste navegador — tela de missão bug-1 OK
A tela de missão carrega corretamente: rail com 10 relatórios, badges (DEBUGGING DE SINTAXE / ERRO DE SINTAXE), bugs conhecidos listados, caixa RELATORIO_QUEBRADO.SQL com a query quebrada, editor preenchido com a buggyQuery, missão e tabelas em escopo. Banco pronto.

### Problema identificado
A sidebar de EVIDÊNCIAS mostra todas as evidências (bug-1 a bug-5) com status "CLASSIFICADO" desde o início — renderBugEvidence parece estar renderizando tudo como concluído. Precisa filtrar por desafios realmente concluídos (progressByCase bug-hunter completedLevels).

## Diagnóstico btnNext (fase 6, pendente de fix)
Fatos verificados no navegador:
1. Feedback "✓ BUG CORRIGIDO" aparece ao executar a correção correta (bug-9 com INNER JOIN correto; bug-8 com divisão por 100.0).
2. MAS o progresso no header NÃO atualizou (ficou 5/10 após concluir bug-9, que era a 6ª conclusão... na verdade rail mostrava ✅ em bug-1,3,7,8,10 = 5/10 — bug-9 corretamente ainda não contou) → o bloco BH_FEEDBACK_CORRECT NÃO está sendo executado, apesar de renderBugFeedback mostrar "✓ BUG CORRIGIDO".
3. Hipótese: renderBugFeedback mostra label com base em feedback.type, e o feedback.type retornado é mesmo 'correct'? renderBugFeedback no ui.js usa feedback.type 'correct'. Sim é correto.
4. Suspeita principal: feedback do bug-9 com query 'SELECT t.id AS transacao_id, c.banco FROM transacoes t INNER JOIN contas c ON t.conta_destino_id = c.id WHERE t.valor_centavos > 5000000 ORDER BY t.id;' → o resultado bate (mesma referência); mas talvez o compareResults use expectedColumns e a query tem AS transacao_id (correto). Estranho que o bloco não execute.
5. Próximo passo: adicionar console.log temporário no bloco `if (feedback.type === BH_FEEDBACK_CORRECT)` para confirmar, ou conferir se renderBugFeedback é chamado com outro objeto.
6. Rail com ✅ nos concluídos, evidências DESCLASSIFICADO/CLASSIFICADO com blur funcionam. Editor bloqueado em desafio concluído funciona. Falta só btnNext + progresso.

Estado atual do repo local /home/ubuntu/jogo-sql (sandbox): tudo testado, npm test verde. Falta commit+push ao GitHub tmarsbr/jogo-sql após fix do btnNext.
## ESTADO FINAL (resolução)
- Causa raiz do bug crítico ENCONTRADA E CORRIGIDA: chamada renderBugProgress no handler do EXECUTAR (app.js, bloco BH_FEEDBACK_CORRECT) passava os argumentos na ordem errada — faltava challenge.id como 2º argumento. Corrigido para renderBugProgress(activeCase.BUG_CHALLENGES, challenge.id, state.completedLevels, state.levelProgress).
- Console.log '[BH debug]' removido do app.js; servidor python 8899/nocache_server.py removido — agora usando server.js do próprio jogo (porta 3000).
- test_bug_hunter.js adicionado ao script "test" do package.json; npm test 20/20 suítes verdes.
- Validação end-to-end no browser OK: bug-1 (300pts, 1/10), bug-2 (600pts, 2/10, btn PRÓXIMA MISSÃO), bugs 3-9 via console (2700pts, 9/10), bug-10 carregado — PENDING: executar correctQuery do bug-10 e verificar modal de conclusão do caso.
- Correção do bug-10: SELECT f.nome, COUNT(*) AS total_alto_risco FROM funcionarios f INNER JOIN transacoes t ON f.id = t.operador_funcionario_id WHERE t.valor_centavos > 5000000 GROUP BY f.id, f.nome ORDER BY f.nome;
- PRÓXIMO: commit+push (git add -A; commit "feat: implementa modo Bug Hunter com 10 desafios de debugging SQL (sintaxe, lógica, performance)"; push origin main).
