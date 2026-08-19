/**
 * boss-definitions.js — Definições das batalhas de chefe (Boss Fights).
 *
 * Cada caso de investigação (case001..case006) possui uma batalha final
 * opcional: um problema complexo multi-etapas construído sobre o banco
 * que o jogador acabou de montar. Regras do modo:
 * - SEM dicas (painel DICAS exibe aviso fixo).
 * - COM timer (cronômetro decorrido é componente da pontuação).
 * - Pontuação baseada em eficiência: base fixa + bônus de tempo − penalidade
 *   por execuções incorretas.
 *
 * Um step usa o mesmo shape de validação das missões comuns
 * (validateLevel de validator.js), então pode ser uma consulta SELECT comum,
 * uma missão de view (executionMode 'create_view') ou uma mutação controlada
 * (executionMode 'ddl').
 */

/**
 * Shape de um step de boss (compatível com o validador de missões):
 * - id: string única ('boss-001-1')
 * - title / concept / briefing / objective / tables
 * - expectedColumns, referenceQuery
 * - verificationQuery / expectedResultQuery / viewName (create_view)
 * - exerciseQuery / referenceQuery + expectedResultQuery (ddl)
 * - executionMode: undefined | 'create_view' | 'ddl'
 * - requiredConcepts
 * - explanation
 */

/* ============================================================
   BOSS 001 — Transações Fantasmas (caso da Camila Torres)
   Forense avançada: correlacionar transações, logs e e-mails.
   ============================================================ */
export const BOSS_001 = {
  id: 'boss-001',
  caseId: 'case001',
  caseTitle: 'Transações Fantasmas',
  title: 'BOSS FIGHT: Dossiê da Camila Torres',
  story: `O interrogatório confirmou o suspeito. Agora a diretoria exige o DOSSIÊ COMPLETO antes do inquérito civil: o valor total desviado, a cronologia oficial dos acessos noturnos e a cadeia de comunicação usada para ocultar os pagamentos. Sem ajuda externa — só seu SQL. O relógio está correndo.`,
  steps: [
    {
      id: 'boss-001-1',
      number: 1,
      title: 'O Butim Total',
      concept: 'Agregação com múltiplos JOINs',
      briefing: `A defesa quer saber exatamente quanto foi desviado para a conta externa da Nexus Consultoria. Cruze transacoes, contas e funcionarios para isolar cada pagamento suspeito e somá-lo.`,
      objective: `Retorne em uma única linha: o nome da titular da conta externa, o número da conta externa (coluna 'numero_conta') e o valor total desviado em centavos (coluna 'valor_total_desviado'), somando apenas as transações cujo operador é o mesmo funcionário dono da conta de origem que enviou para a conta de destino de titular externo 'Nexus Consultoria Ltda'.`,
      tables: ['transacoes', 'contas', 'funcionarios'],
      expectedColumns: ['titular_externo', 'numero_conta', 'valor_total_desviado'],
      referenceQuery: `SELECT c2.titular_externo, c2.numero_conta, SUM(t.valor_centavos) AS valor_total_desviado FROM transacoes t INNER JOIN contas c1 ON c1.id = t.conta_origem_id INNER JOIN contas c2 ON c2.id = t.conta_destino_id INNER JOIN funcionarios f ON f.id = c1.funcionario_id WHERE c2.titular_externo = 'Nexus Consultoria Ltda' AND t.operador_funcionario_id = c1.funcionario_id GROUP BY c2.titular_externo, c2.numero_conta;`,
      requiredConcepts: ['inner join', 'sum'],
      explanation: 'Três JOINs amarram transação → conta de origem → funcionário titular e transação → conta de destino. O SUM agrega os pagamentos, e a condição de que o operador é o próprio dono da conta de origem isola o desvio.',
    },
    {
      id: 'boss-001-2',
      number: 2,
      title: 'A Cronologia Noturna',
      concept: 'Subquery + HAVING em agregação temporal',
      briefing: `A perícia precisa da lista oficial dos acessos noturnos (depois das 22h) feitos pela mesma pessoa que operou as transações suspeitas — comprovando o modus operandi.`,
      objective: `Retorne, em ordem crescente de data: o nome do funcionário, a data (somente 'YYYY-MM-DD') e a quantidade de acessos daquela data, considerando apenas acessos noturnos (hora >= '22:00:00') de funcionários que também apareceram como operador em alguma transação suspeita (conta de destino 'CC-9999').`,
      tables: ['logs_acesso', 'funcionarios', 'transacoes', 'contas'],
      expectedColumns: ['nome', 'data_acesso', 'acessos_na_data'],
      referenceQuery: `SELECT f.nome, DATE(l.data_hora) AS data_acesso, COUNT(*) AS acessos_na_data FROM logs_acesso l INNER JOIN funcionarios f ON f.id = l.funcionario_id WHERE TIME(l.data_hora) >= '22:00:00' AND l.funcionario_id IN (SELECT DISTINCT t.operador_funcionario_id FROM transacoes t INNER JOIN contas c ON c.id = t.conta_destino_id WHERE c.numero_conta = 'CC-9999') GROUP BY f.nome, DATE(l.data_hora) ORDER BY data_acesso;`,
      requiredConcepts: ['subquery', 'group by'],
      explanation: 'A subquery identifica os operadores das transações para a conta CC-9999; o IN filtra os logs noturnos desses funcionários; GROUP BY + COUNT quantifica os acessos por dia.',
    },
    {
      id: 'boss-001-3',
      number: 3,
      title: 'A Cadeia de Ocultação',
      concept: 'LEFT JOIN com agregação condicional',
      briefing: `O Ministério Público quer saber se algum destinatário dos e-mails da investigada nunca confirmou resposta — indício de comunicação unilateral de ocultação.`,
      objective: `Retorne o nome de cada funcionário destinatário de e-mails enviados pela Camila Torres, com a contagem de e-mails recebidos dela (coluna 'qtd_e-mails') e a contagem de respostas daquele destinatário para a Camila (coluna 'qtd_respostas'), usando LEFT JOIN para incluir destinatários que jamais responderam (0 respostas). Ordenado pelo nome do destinatário.`,
      tables: ['emails', 'funcionarios'],
      expectedColumns: ['destinatario_nome', 'qtd_e-mails', 'qtd_respostas'],
      referenceQuery: `SELECT f2.nome AS destinatario_nome, COUNT(e1.id) AS "qtd_e-mails", COUNT(e2.id) AS "qtd_respostas" FROM emails e1 INNER JOIN funcionarios f2 ON f2.id = e1.destinatario_id LEFT JOIN emails e2 ON e2.remetente_id = e1.destinatario_id AND e2.destinatario_id = e1.remetente_id WHERE e1.remetente_id = 7 GROUP BY f2.nome ORDER BY destinatario_nome;`,
      requiredConcepts: ['left join', 'group by'],
      explanation: 'O primeiro JOIN identifica os destinatários; o LEFT JOIN emparelha respostas (destinatário → remetente) permitindo valores NULL, que o COUNT ignora — gerando o zero quando não houve resposta.',
    },
  ],
  scoring: {
    base: 1000,
    bonuses: [
      { maxElapsedSec: 300, points: 500, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 600, points: 300, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 900, points: 150, label: 'Bônus de Velocidade' },
    ],
    errorPenalty: 50,
    maxErrorPenalty: 600,
  },
  conclusion: 'Dossiê forense completo: valor exato do desvio, cronologia noturna documentada e cadeia de comunicação unilateral exposta. A perícia não encontrou uma única brecha no seu dossiê.',
};

/* ============================================================
   BOSS 002 — Vazamento na Matriz (LGPD)
   Auditoria de acessos e conformidade.
   ============================================================ */
export const BOSS_002 = {
  id: 'boss-002',
  caseId: 'case002',
  caseTitle: 'Vazamento na Matriz',
  title: 'BOSS FIGHT: Relatório de Conformidade LGPD',
  story: `O vazamento foi contido, mas o Conselho de Dados exige um RELATÓRIO DE CONFORMIDADE para a autoridade nacional: o inventário completo das exportações irregulares, a violação de políticas por usuário e o impacto total em registros pessoais. Três entregas técnicas — sem reforços.`,
  steps: [
    {
      id: 'boss-002-1',
      number: 1,
      title: 'Inventário das Exportações Irregulares',
      concept: 'JOIN + filtragem com condições múltiplas',
      briefing: `A autoridade exige o detalhamento de cada exportação feita fora do horário comercial (antes das 8h ou depois das 18h). Cruze os logs de exportação com os usuários responsáveis.`,
      objective: `Retorne o nome do usuário, a data-hora completa da exportação, o formato, a quantidade de registros e o destino, para todas as exportações realizadas em horário irregular (hora < '08:00:00' OU hora >= '18:00:00'). Ordenado pela data-hora.`,
      tables: ['logs_exportacao', 'usuarios'],
      expectedColumns: ['nome', 'data_hora', 'formato', 'quantidade_registros', 'destino'],
      referenceQuery: `SELECT u.nome, l.data_hora, l.formato, l.quantidade_registros, l.destino FROM logs_exportacao l INNER JOIN usuarios u ON u.id = l.usuario_id WHERE TIME(l.data_hora) < '08:00:00' OR TIME(l.data_hora) >= '18:00:00' ORDER BY l.data_hora;`,
      requiredConcepts: ['inner join', 'or'],
      explanation: 'O JOIN entre logs_exportacao e usuarios traz o nome do responsável; a condição OR cobre os dois extremos do horário não comercial.',
    },
    {
      id: 'boss-002-2',
      number: 2,
      title: 'Violações por Usuário',
      concept: 'Agregação com contagem condicional',
      briefing: `O relatório precisa quantificar, por usuário, quantas exportações foram feitas em IP fora da faixa corporativa (IPs que NÃO começam com '10.0.0.') e quantas foram internas.`,
      objective: `Retorne o nome do usuário, o total de exportações, a quantidade em IP externo (IP que não inicia com '10.0.0.') e a quantidade em IP interno, apenas para usuários com ao menos uma exportação. Ordenado pelo total descendente.`,
      tables: ['acessos_sistema', 'usuarios'],
      expectedColumns: ['nome', 'total_exportacoes', 'exportacoes_ip_externo', 'exportacoes_ip_interno'],
      referenceQuery: `SELECT u.nome, COUNT(a.id) AS total_exportacoes, SUM(CASE WHEN a.ip_origem NOT LIKE '10.0.0.%' THEN 1 ELSE 0 END) AS exportacoes_ip_externo, SUM(CASE WHEN a.ip_origem LIKE '10.0.0.%' THEN 1 ELSE 0 END) AS exportacoes_ip_interno FROM acessos_sistema a INNER JOIN usuarios u ON u.id = a.usuario_id WHERE a.acao = 'EXPORT' GROUP BY u.nome HAVING COUNT(a.id) >= 1 ORDER BY total_exportacoes DESC;`,
      requiredConcepts: ['group by', 'case when'],
      explanation: 'O CASE WHEN dentro do SUM realiza a contagem condicional: cada linha incrementa o contador externo ou interno conforme o prefixo do IP. HAVING garante que apenas usuários com exportações apareçam.',
    },
    {
      id: 'boss-002-3',
      number: 3,
      title: 'Impacto Total em Dados Pessoais',
      concept: 'Subquery com soma agregada',
      briefing: `A sanção da LGPD é proporcional ao volume. Calcule o total de registros pessoais exportados ilegalmente: apenas as exportações feitas por usuários cujo nível de acesso é inferior ao nível mínimo exigido pela política da tabela acessada.`,
      objective: `Retorne o total de registros pessoais expostos (coluna 'total_expostos') somando a quantidade_registros de cada log de exportação cujo usuário tenha nivel_acesso menor que o nivel_minimo da política da tabela acessada. Use a política da tabela de logs_exportacao como critério.`,
      tables: ['logs_exportacao', 'usuarios', 'politicas_acesso'],
      expectedColumns: ['total_expostos'],
      referenceQuery: `SELECT SUM(l.quantidade_registros) AS total_expostos FROM logs_exportacao l INNER JOIN usuarios u ON u.id = l.usuario_id INNER JOIN politicas_acesso p ON p.tabela = l.tabela WHERE u.nivel_acesso < p.nivel_minimo;`,
      requiredConcepts: ['sum'],
      explanation: 'O JOIN tripartite amarra o log ao usuário e à política da tabela; WHERE filtra as violações de privilégio e SUM acumula o dano total.',
    },
  ],
  scoring: {
    base: 1000,
    bonuses: [
      { maxElapsedSec: 300, points: 500, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 600, points: 300, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 900, points: 150, label: 'Bônus de Velocidade' },
    ],
    errorPenalty: 50,
    maxErrorPenalty: 600,
  },
  conclusion: 'Relatório de conformidade entregue ao Conselho: inventário das exportações irregulares, violações quantificadas por usuário e o impacto total em dados pessoais. A auditoria LGPD está encerrada.',
};

/* ============================================================
   BOSS 003 — A Rota da Cripto-Ativo (smurfing)
   Rastreamento de transações fragmentadas.
   ============================================================ */
export const BOSS_003 = {
  id: 'boss-003',
  caseId: 'case003',
  caseTitle: 'A Rota da Cripto-Ativo',
  title: 'BOSS FIGHT: Desmontando o Smurfing',
  story: `A carteira de destino foi identificada, mas o banco central exige o LAUDO TÉCNICO do esquema de smurfing: quantificação das microtransferências, a rota lateral de liquidez e o mapeamento das carteiras sem KYC que sustentaram a lavagem. Três consultas — cronometradas.`,
  steps: [
    {
      id: 'boss-003-1',
      number: 1,
      title: 'A Quantificação do Enxame',
      concept: 'Agregação em massa (CTE ou subquery)',
      briefing: `Os 47 "smurfs" transferiram frações de 0.01 BTC em intervalos regulares. Quantifique o enxame completo: total transferido, total de taxas e janela temporal.`,
      objective: `Retorne em uma única linha: o endereço_hash da carteira de origem, o endereço_hash da carteira de destino, a quantidade de transferências, o total em BTC (coluna 'total_btc') e o total de taxas (coluna 'total_taxas'), somando todas as transferências de valor_btc = 0.01.`,
      tables: ['transferencias', 'carteiras'],
      expectedColumns: ['origem', 'destino', 'quantidade_transferencias', 'total_btc', 'total_taxas'],
      referenceQuery: `SELECT c1.endereco_hash AS origem, c2.endereco_hash AS destino, COUNT(t.id) AS quantidade_transferencias, SUM(t.valor_btc) AS total_btc, SUM(t.taxa_btc) AS total_taxas FROM transferencias t INNER JOIN carteiras c1 ON c1.id = t.carteira_origem_id INNER JOIN carteiras c2 ON c2.id = t.carteira_destino_id WHERE t.valor_btc = 0.01 GROUP BY c1.endereco_hash, c2.endereco_hash;`,
      requiredConcepts: ['inner join', 'sum'],
      explanation: 'As microtransferências de 0.01 BTC formam um grupo homogêneo; SUM + COUNT + JOIN com carteiras nos dois lados produzem o retrato completo do enxame.',
    },
    {
      id: 'boss-003-2',
      number: 2,
      title: 'A Rota Lateral de Liquidez',
      concept: 'Subquery com MIN/MAX temporal',
      briefing: `A defesa alega que os movimentos são "rotina comercial". Prove o contrário: mostre todas as transferências (qualquer valor) entre carteiras conectadas à exchange NÃO regulamentada 'ShadowX', com a primeira e a última movimentação de cada rota.`,
      objective: `Retorne a rota (origem → destino com endereços_hash), a quantidade de transferências e a primeira e a última data-hora de cada rota, considerando apenas transferências em que a carteira de destino pertence à exchange não regulamentada. Ordenado pela última movimentação.`,
      tables: ['transferencias', 'carteiras', 'exchanges'],
      expectedColumns: ['origem', 'destino', 'quantidade_transferencias', 'primeira_movimentacao', 'ultima_movimentacao'],
      referenceQuery: `SELECT c1.endereco_hash AS origem, c2.endereco_hash AS destino, COUNT(t.id) AS quantidade_transferencias, MIN(t.data_hora) AS primeira_movimentacao, MAX(t.data_hora) AS ultima_movimentacao FROM transferencias t INNER JOIN carteiras c1 ON c1.id = t.carteira_origem_id INNER JOIN carteiras c2 ON c2.id = t.carteira_destino_id INNER JOIN exchanges e ON e.id = c2.exchange WHERE e.regulamentada = 0 GROUP BY c1.endereco_hash, c2.endereco_hash ORDER BY ultima_movimentacao;`,
      requiredConcepts: ['min', 'max'],
      explanation: 'MIN e MAX agregam a janela temporal de cada rota; o filtro regulamentada = 0 isola a exchange offshore. A combinação fecha a tese de lavagem estruturada.',
    },
    {
      id: 'boss-003-3',
      number: 3,
      title: 'As Carteiras Fantasmas',
      concept: 'LEFT JOIN anti-padrão',
      briefing: `O relatório final precisa mapear o risco: quais carteiras de destino de transferências pendentes ou confirmadas não possuem registro KYC aprovado?`,
      objective: `Retorne o endereço_hash e o tipo de cada carteira que recebeu transferências (como destino), mas que NÃO possui registro KYC com status 'aprovado'. Use LEFT JOIN com a tabela kyc_registros. Ordenado pelo endereço.`,
      tables: ['carteiras', 'transferencias', 'kyc_registros'],
      expectedColumns: ['endereco_hash', 'tipo'],
      referenceQuery: `SELECT c.endereco_hash, c.tipo FROM carteiras c INNER JOIN transferencias t ON t.carteira_destino_id = c.id LEFT JOIN kyc_registros k ON k.carteira_id = c.id AND k.status = 'aprovado' WHERE k.id IS NULL GROUP BY c.endereco_hash, c.tipo ORDER BY c.endereco_hash;`,
      requiredConcepts: ['left join', 'is null'],
      explanation: 'O LEFT JOIN condicionado ao status “aprovado” traz NULL para carteiras sem KYC válido; o IS NULL as isola. Agrupar evita duplicação quando uma carteira recebeu várias transferências.',
    },
  ],
  scoring: {
    base: 1000,
    bonuses: [
      { maxElapsedSec: 300, points: 500, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 600, points: 300, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 900, points: 150, label: 'Bônus de Velocidade' },
    ],
    errorPenalty: 50,
    maxErrorPenalty: 600,
  },
  conclusion: 'Laudo técnico protocolado: enxame quantificado em 47 microtransferências, rota lateral via exchange offshore documentada e as carteiras sem KYC expostas. O esquema de smurfing está desmontado.',
};

/* ============================================================
   BOSS 004 — Sabotagem no E-Commerce (auditoria de estoque)
   Dossiê de auditoria: movimentações + trilha de auditoria.
   ============================================================ */
export const BOSS_004 = {
  id: 'boss-004',
  caseId: 'case004',
  caseTitle: 'Sabotagem no E-Commerce',
  title: 'BOSS FIGHT: Dossiê da Auditoria de Estoque',
  story: `O estoque foi sabotado por dentro. O conselho quer o DOSSIÊ FINAL de auditoria antes da denúncia: o mapa dos ajustes manuais, o impacto financeiro por produto e a trilha completa das alterações registradas. Sem atalhos — cada ponto conta.`,
  steps: [
    {
      id: 'boss-004-1',
      number: 1,
      title: 'O Mapa dos Ajustes Manuais',
      concept: 'Agregação com JOIN e HAVING',
      briefing: `A perícia detectou dezenas de "ajustes manuais de inventário". Quantifique por produto: quantos ajustes foram feitos, a quantidade total subtraída e por qual responsável — isolando apenas os responsáveis com mais de 5 ajustes.`,
      objective: `Retorne o nome do produto, o responsável (nome extraído de movimentacoes_estoque.responsavel_id via junção com a tabela que contém nomes... use o id do responsável como coluna 'responsavel_id'), a quantidade de ajustes e o total subtraído (soma negativa da quantidade, como valor positivo na coluna 'total_subtraido'), apenas para movimentações do tipo 'ajuste' cujo responsável acumulou mais de 5 ajustes. Use: produtos.nome, movimentacoes_estoque.responsavel_id, COUNT(id) como 'qtd_ajustes', ABS(SUM(quantidade)) como 'total_subtraido'. Ordenado por qtd_ajustes descendente.`,
      tables: ['produtos', 'movimentacoes_estoque'],
      expectedColumns: ['nome', 'responsavel_id', 'qtd_ajustes', 'total_subtraido'],
      referenceQuery: `SELECT p.nome, m.responsavel_id, COUNT(m.id) AS qtd_ajustes, ABS(SUM(m.quantidade)) AS total_subtraido FROM movimentacoes_estoque m INNER JOIN produtos p ON p.id = m.produto_id WHERE m.tipo = 'ajuste' AND m.quantidade < 0 GROUP BY p.nome, m.responsavel_id HAVING COUNT(m.id) > 5 ORDER BY qtd_ajustes DESC;`,
      requiredConcepts: ['group by', 'having'],
      explanation: 'WHERE filtra o tipo e o sinal do ajuste; HAVING seleciona os responsáveis acima do limiar; ABS transforma a soma negativa em valor positivo legível.',
    },
    {
      id: 'boss-004-2',
      number: 2,
      title: 'O Impacto Financeiro',
      concept: 'Subquery ou JOIN agregado com cálculo monetário',
      briefing: `Quanto custou ao caixa a diferença entre o estoque físico real e o registrado? Calcule, por produto ativo, o valor potencial perdido: estoque abaixo do mínimo, avaliado pelo preço unitário.`,
      objective: `Retorne o nome do produto, a categoria, o preço unitário em reais (preco_centavos/100.0, coluna 'preco_unitario'), o estoque atual e o déficit de estoque (estoque_minimo - estoque_atual, coluna 'deficit'), apenas para produtos ativos (ativo = 1) cujo estoque atual está abaixo do estoque mínimo. Ordenado pelo déficit descendente.`,
      tables: ['produtos'],
      expectedColumns: ['nome', 'categoria', 'preco_unitario', 'estoque_atual', 'deficit'],
      referenceQuery: `SELECT nome, categoria, preco_centavos / 100.0 AS preco_unitario, estoque_atual, estoque_minimo - estoque_atual AS deficit FROM produtos WHERE ativo = 1 AND estoque_atual < estoque_minimo ORDER BY deficit DESC;`,
      requiredConcepts: ['arithmetic'],
      explanation: 'A aritmética de colunas (divisão e subtração) produz as métricas financeiras diretamente na projeção; o filtro AND combina as duas condições de exposição.',
    },
    {
      id: 'boss-004-3',
      number: 3,
      title: 'A Trilha da Auditoria',
      concept: 'Criação de view de dossiê',
      briefing: `O dossiê precisa de uma VIEW permanente para o comitê de auditoria: 'vw_dossie_estoque', consolidando a trilha de alterações de produtos registradas na tabela auditoria.`,
      objective: `Crie a view 'vw_dossie_estoque' retornando: tabela, operacao, registro_id, o usuário e a data-hora da alteração, apenas para alterações na tabela 'produtos' feitas pelo usuário 'Lucas Prado'. A view deve ter exatamente as colunas: tabela, operacao, registro_id, usuario, data_hora.`,
      tables: ['auditoria'],
      executionMode: 'create_view',
      viewName: 'vw_dossie_estoque',
      referenceQuery: `CREATE VIEW vw_dossie_estoque AS SELECT tabela, operacao, registro_id, usuario, data_hora FROM auditoria WHERE tabela = 'produtos' AND usuario = 'Lucas Prado';`,
      verificationQuery: 'SELECT * FROM vw_dossie_estoque;',
      expectedResultQuery: `SELECT tabela, operacao, registro_id, usuario, data_hora FROM auditoria WHERE tabela = 'produtos' AND usuario = 'Lucas Prado' ORDER BY id;`,
      expectedColumns: ['tabela', 'operacao', 'registro_id', 'usuario', 'data_hora'],
      requiredConcepts: ['create view', 'where'],
      explanation: 'Views consolidam trilha de auditoria em um objeto consultável permanente — o formato que comitês exigem para revisão contínua.',
    },
  ],
  scoring: {
    base: 1000,
    bonuses: [
      { maxElapsedSec: 300, points: 500, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 600, points: 300, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 900, points: 150, label: 'Bônus de Velocidade' },
    ],
    errorPenalty: 50,
    maxErrorPenalty: 600,
  },
  conclusion: 'Dossiê de auditoria encerrado: mapa dos ajustes manuais com responsável identificado, impacto financeiro por produto calculado e a view de trilha registrada para o comitê. A denúncia tem agora base documental.',
};

/* ============================================================
   BOSS 005 — A Planilha do Inferno (executivo sobre modelo normalizado)
   Relatório executivo sobre clientes/produtos/vendedores/regiões.
   ============================================================ */
export const BOSS_005 = {
  id: 'boss-005',
  caseId: 'case005',
  caseTitle: 'A Planilha do Inferno',
  title: 'BOSS FIGHT: Painel Executivo V3',
  story: `A normalização está de pé — clientes, produtos, vendedores, regiões, vendas e itens. A diretoria quer o PAINEL EXECUTIVO consolidado sobre o modelo normalizado: desempenho por região, ranking de clientes e a exposição de clientes sem compra. Sem planilha para se esconder.`,
  steps: [
    {
      id: 'boss-005-1',
      number: 1,
      title: 'Faturamento por Região',
      concept: 'JOIN em cadeia com agregação',
      briefing: `O modelo normalizado permite cruzar quatro tabelas. Calcule o faturamento total de cada região, somando o valor_total das vendas atribuídas ao vendedor da região.`,
      objective: `Retorne o nome da região, o gerente e o faturamento total (coluna 'faturamento_total', soma de vendas.valor_total), juntando regioes → vendedores → vendas. Inclua regiões SEM nenhuma venda com valor 0 (use COALESCE). Ordenado pelo faturamento descendente.`,
      tables: ['regioes', 'vendedores', 'vendas'],
      expectedColumns: ['regiao', 'gerente', 'faturamento_total'],
      referenceQuery: `SELECT r.nome AS regiao, r.gerente, COALESCE(SUM(v.valor_total), 0) AS faturamento_total FROM regioes r LEFT JOIN vendedores vd ON vd.regiao_id = r.id LEFT JOIN vendas v ON v.vendedor_id = vd.id GROUP BY r.id, r.nome, r.gerente ORDER BY faturamento_total DESC;`,
      requiredConcepts: ['left join', 'coalesce'],
      explanation: 'O LEFT JOIN preserva regiões sem vendedores e vendedores sem vendas; COALESCE converte o SUM nulo em zero — o padrão do painel executivo.',
    },
    {
      id: 'boss-005-2',
      number: 2,
      title: 'O Ranking de Clientes',
      concept: 'LEFT JOIN anti-padrão + ordenação',
      briefing: `A equipe comercial quer saber quem compra e quem apenas está cadastrado. Liste todos os clientes com seu total gasto — incluindo os prospects que nunca compraram.`,
      objective: `Retorne o nome do cliente, seu CPF e o total gasto (coluna 'total_gasto', soma das vendas, usando COALESCE para 0 quando o cliente não tem vendas), juntando clientes → vendas via LEFT JOIN. Inclua o prospect sem venda. Ordenado pelo total_gasto descendente e depois pelo nome.`,
      tables: ['clientes', 'vendas'],
      expectedColumns: ['cliente_nome', 'cpf', 'total_gasto'],
      referenceQuery: `SELECT c.nome AS cliente_nome, c.cpf, COALESCE(SUM(v.valor_total), 0) AS total_gasto FROM clientes c LEFT JOIN vendas v ON v.cliente_id = c.id GROUP BY c.id, c.nome, c.cpf ORDER BY total_gasto DESC, cliente_nome;`,
      requiredConcepts: ['left join'],
      explanation: 'Clientes sem venda permanecem no resultado graças ao LEFT JOIN; o GROUP BY pelo cliente agrega as compras, e COALESCE(SUM(...), 0) zera os prospects.',
    },
    {
      id: 'boss-005-3',
      number: 3,
      title: 'A View do Painel',
      concept: 'Criação de view executiva',
      briefing: `Para o painel fixo da diretoria, consolide o desempenho por categoria de produto em uma view permanente.`,
      objective: `Crie a view 'vw_painel_categorias' retornando a categoria, a quantidade de itens vendidos (coluna 'itens_vendidos', soma de itens_venda.quantidade) e o faturamento da categoria (coluna 'faturamento_categoria', soma de itens_venda.quantidade * itens_venda.preco_unitario), juntando produtos → itens_venda. Colunas exatas: categoria, itens_vendidos, faturamento_categoria.`,
      tables: ['produtos', 'itens_venda'],
      executionMode: 'create_view',
      viewName: 'vw_painel_categorias',
      referenceQuery: `CREATE VIEW vw_painel_categorias AS SELECT p.categoria, SUM(iv.quantidade) AS itens_vendidos, SUM(iv.quantidade * iv.preco_unitario) AS faturamento_categoria FROM produtos p INNER JOIN itens_venda iv ON iv.produto_id = p.id GROUP BY p.categoria;`,
      verificationQuery: 'SELECT * FROM vw_painel_categorias;',
      expectedResultQuery: `SELECT p.categoria, SUM(iv.quantidade) AS itens_vendidos, SUM(iv.quantidade * iv.preco_unitario) AS faturamento_categoria FROM produtos p INNER JOIN itens_venda iv ON iv.produto_id = p.id GROUP BY p.categoria ORDER BY p.categoria;`,
      expectedColumns: ['categoria', 'itens_vendidos', 'faturamento_categoria'],
      requiredConcepts: ['create view', 'sum'],
      explanation: 'A view encapsula o join produtos-×-itens com a agregação por categoria — o painel da diretoria passa a consultar um único objeto.',
    },
  ],
  scoring: {
    base: 1000,
    bonuses: [
      { maxElapsedSec: 300, points: 500, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 600, points: 300, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 900, points: 150, label: 'Bônus de Velocidade' },
    ],
    errorPenalty: 50,
    maxErrorPenalty: 600,
  },
  conclusion: 'Painel executivo entregue: faturamento por região com COALESCE, ranking completo de clientes incluindo prospects e a view de categorias registrada. A planilha do inferno não volta mais.',
};

/* ============================================================
   BOSS 006 — TechBrasil: Dashboard Completo (o boss canônico)
   Limpeza de staging → carga do DW → 3 views → índice.
   ============================================================ */
export const BOSS_006 = {
  id: 'boss-006',
  caseId: 'case006',
  caseTitle: 'TechBrasil: Sua Primeira Semana',
  title: 'BOSS FIGHT: Dashboard Executivo Completo',
  story: `Sua primeira semana está no fim. O CEO marcou uma reunião amanhã e pediu o DASHBOARD EXECUTIVO completo: os dados sujos do staging precisam ser higienizados e carregados no DW, três views de leitura precisam existir, e o índice de consulta regional precisa estar no ar. São quatro entregas encadeadas — sem uma única dica. Boa sorte.`,
  steps: [
    {
      id: 'boss-006-1',
      number: 1,
      title: 'Higienização do Staging',
      concept: 'UPDATE com expressão de limpeza',
      briefing: `O staging está cheio de nomes sujos: espaços, maiúsculas e minúsculas misturadas. Higienize a coluna nome de stg_clientes para o padrão Title Case com espaços removidos nas pontas.`,
      objective: `Atualize stg_clientes.nome para a forma padronizada: remova espaços nas pontas, deixe a primeira letra maiúscula e o restante minúsculo. Use UPPER(SUBSTR(TRIM(nome),1,1)) || LOWER(SUBSTR(TRIM(nome),2)); assim ' José da Silva ' vira 'José da silva'. Execute o UPDATE.`,
      tables: ['stg_clientes'],
      executionMode: 'ddl',
      referenceQuery: `UPDATE stg_clientes SET nome = UPPER(SUBSTR(TRIM(nome),1,1)) || LOWER(SUBSTR(TRIM(nome),2));`,
      verificationQuery: `SELECT id, nome FROM stg_clientes ORDER BY id;`,
      expectedResultQuery: `SELECT id, UPPER(SUBSTR(TRIM(nome),1,1)) || LOWER(SUBSTR(TRIM(nome),2)) AS nome FROM stg_clientes ORDER BY id;`,
      expectedColumns: ['id', 'nome'],
      requiredConcepts: ['update'],
      explanation: 'UPDATE com expressões de string higieniza colunas inteiras: TRIM remove espaços, SUBSTR segmenta e UPPER/LOWER normalizam a capitalização.',
    },
    {
      id: 'boss-006-2',
      number: 2,
      title: 'Carga da dim_tempo',
      concept: 'INSERT ... SELECT de dimensão',
      briefing: `O DW está sem a dimensão de tempo. Carregue stg_vendas para dim_tempo: cada data_venda distinta do staging vira uma linha de dim_tempo com ano, mês e dia extraídos.`,
      objective: `Insira em dim_tempo (data_completa, ano, mes, dia) as datas distintas de stg_vendas.data_venda convertidas ao formato ISO 'YYYY-MM-DD', extraindo ano (substr(data,1,4)), mês (substr(data,6,2)) e dia (substr(data,9,2)) — ou seja: use substr(data_venda,1,4) como ano, substr(data_venda,6,2) como mes e substr(data_venda,9,2) como dia, com CAST para INTEGER. A data_venda do staging está no formato 'DD/MM/YYYY'. Use: SUBSTR(data_venda,7,4) || '-' || SUBSTR(data_venda,4,2) || '-' || SUBSTR(data_venda,1,2) como data_completa. Execute o INSERT ... SELECT com DISTINCT.`,
      tables: ['dim_tempo', 'stg_vendas'],
      executionMode: 'ddl',
      referenceQuery: `INSERT OR IGNORE INTO dim_tempo (data_completa, ano, mes, dia) SELECT DISTINCT SUBSTR(data_venda,7,4) || '-' || SUBSTR(data_venda,4,2) || '-' || SUBSTR(data_venda,1,2), CAST(SUBSTR(data_venda,7,4) AS INTEGER), CAST(SUBSTR(data_venda,4,2) AS INTEGER), CAST(SUBSTR(data_venda,1,2) AS INTEGER) FROM stg_vendas;`,
      verificationQuery: `SELECT COUNT(*) AS total FROM dim_tempo;`,
      expectedResultQuery: `SELECT COUNT(*) AS total FROM dim_tempo;`,
      expectedColumns: ['total'],
      requiredConcepts: ['insert', 'distinct'],
      explanation: 'INSERT ... SELECT com DISTINCT transforma o staging em dimensão: a manipulação de strings rearranja DD/MM/YYYY em ISO e CAST converte os componentes numéricos.',
    },
    {
      id: 'boss-006-3',
      number: 3,
      title: 'A View Regional do Dashboard',
      concept: 'View com dimensão e fato',
      briefing: `O dashboard precisa de uma view de leitura para o CFO: faturamento por região usando a tabela fato e a dimensão regional, preservando regiões sem venda.`,
      objective: `Crie a view 'vw_vendas_regiao' retornando: regiao (dim_regioes.nome), gerente e faturamento (soma de fct_vendas.valor_total, coluna 'faturamento'), com COALESCE para regiões sem venda.`,
      tables: ['dim_regioes', 'fct_vendas'],
      executionMode: 'create_view',
      viewName: 'vw_vendas_regiao',
      referenceQuery: `CREATE VIEW vw_vendas_regiao AS SELECT r.nome AS regiao, r.gerente, COALESCE(SUM(f.valor_total), 0) AS faturamento FROM dim_regioes r LEFT JOIN fct_vendas f ON f.regiao_id = r.id GROUP BY r.id, r.nome, r.gerente;`,
      verificationQuery: 'SELECT * FROM vw_vendas_regiao;',
      expectedResultQuery: `SELECT r.nome AS regiao, r.gerente, COALESCE(SUM(f.valor_total), 0) AS faturamento FROM dim_regioes r LEFT JOIN fct_vendas f ON f.regiao_id = r.id GROUP BY r.id, r.nome, r.gerente ORDER BY faturamento DESC;`,
      expectedColumns: ['regiao', 'gerente', 'faturamento'],
      requiredConcepts: ['create view', 'left join'],
      explanation: 'A primeira view do dashboard cruza dimensões com fatos via LEFT JOIN; COALESCE mantém regiões sem venda com faturamento zero.',
    },
    {
      id: 'boss-006-4',
      number: 4,
      title: 'O Índice Regional',
      concept: 'CREATE INDEX de performance',
      briefing: `As consultas do dashboard sobre fct_vendas ficaram lentas. O último item do backlog: criar o índice idx_fct_regiao na coluna regiao_id da fct_vendas para acelerar os filtros regionais.`,
      objective: `Crie o índice 'idx_fct_regiao' na coluna regiao_id da tabela fct_vendas. A consulta de conferência filtra fct_vendas por regiao_id = 1; o índice deve existir no catálogo.`,
      tables: ['fct_vendas'],
      executionMode: 'ddl',
      referenceQuery: 'CREATE INDEX IF NOT EXISTS idx_fct_regiao ON fct_vendas(regiao_id);',
      verificationQuery: `SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_fct_regiao';`,
      expectedResultQuery: `SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_fct_regiao';`,
      expectedColumns: ['name'],
      requiredConcepts: ['create index'],
      explanation: 'Índices em colunas de filtro frequente (regiao_id) transformam varreduras completas em buscas diretas — o último toque de performance do dashboard.',
    },
  ],
  scoring: {
    base: 1000,
    bonuses: [
      { maxElapsedSec: 480, points: 500, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 900, points: 300, label: 'Bônus de Velocidade' },
      { maxElapsedSec: 1200, points: 150, label: 'Bônus de Velocidade' },
    ],
    errorPenalty: 50,
    maxErrorPenalty: 600,
  },
  conclusion: 'Dashboard executivo completo entregue: staging higienizado, dimensão de tempo carregada, view de faturamento regional registrada e o índice regional no ar. O CEO não teve o que reclamar. Bem-vindo à equipe.',
};

/**
 * Registro central das batalhas, indexado por caseId.
 * Casos sem batalha definida (projetos, bug-hunter, schema-builder) não
 * aparecem aqui e nunca entram no modo boss fight.
 */
export const BATTLE_BY_CASE = {
  'case001': BOSS_001,
  'case002': BOSS_002,
  'case003': BOSS_003,
  'case004': BOSS_004,
  'case005': BOSS_005,
  'case006': BOSS_006,
};

/** Prefixo que identifica steps de boss no state.currentLevel. */
export const BOSS_STEP_PREFIX = 'boss-';
