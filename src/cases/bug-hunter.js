/**
 * bug-hunter.js — Dados do modo "Bug Hunter" do SQL Detective.
 *
 * O modo Bug Hunter apresenta uma query com erros propositais (sintaxe, lógica
 * ou performance) e o jogador precisa identificar o(s) bug(s), corrigir e
 * produzir o resultado esperado. Diferente de escrever do zero, treina
 * debugging — habilidade real do dia a dia.
 *
 * Formato de cada desafio:
 * - buggyQuery:      a query defeituosa entregue ao jogador (não executa ou
 *                    executa com resultado errado/lento)
 * - bugType:         'sintaxe' | 'logica' | 'performance' | 'logica+performance'
 * - bugs:            lista de descrições dos bugs propositais
 * - correctQuery:    a solução esperada (usado também como referência)
 * - expectedResultQuery: consulta que gera o resultado esperado para comparar
 * - context:         contexto narrativo/forense do desafio
 * - hintBugs:        dicas progressivas que expõem os bugs um a um
 * - expectedColumns, referenceQuery: contrato padrão das missões
 */

export const BUG_HUNTER_INTRO = {
  title: 'Modo Bug Hunter',
  subtitle: 'Caçador de Bugs SQL — Debugging Forense',
  story: `Um analista júnior da TechFin deixou um rastro de queries quebradas nos relatórios
de auditoria. Algumas não executam, outras retornam dados errados, e algumas rodam lentas demais
para o fechamento do mês. Cada relatório precisa ser corrigido antes do prazo.

Neste modo, você recebe uma query já escrita — mas com bugs propositais. Seu trabalho é
identificar o que está errado (sintaxe, lógica ou performance), corrigir o código e produzir
o resultado esperado. É assim que debugging funciona na vida real.`,
  mission: 'Corrija todos os relatórios com bugs para concluir o modo.',
};

export const BUG_HUNTER_CONCLUSION = {
  title: 'Caça aos Bugs Encerrada',
  story: `Todos os relatórios quebrados foram corrigidos e voltaram a rodar com o resultado certo.
Você diagnosticou erros de sintaxe que impediam a execução, bugs lógicos que distorciam os números
e gargalos de performance em queries que varriam tabelas inteiras sem precisar.
Essas três categorias — "não roda", "roda errado" e "roda lento" — são exatamente as que você
vai encontrar no trabalho real. Bem-vindo(a) ao clube dos caçadores de bugs.`,
  nextSteps: 'Os relatórios foram restituídos ao pipeline de auditoria.',
};

export function getTotalLevels() {
  return BUG_CHALLENGES.length;
}

/**
 * Desafios Bug Hunter sobre o banco do Caso #001 (TechFin).
 * Cada desafio tem a query quebrada, os bugs propositais e a solução correta.
 */
export const BUG_CHALLENGES = [
  {
    id: 'bug-1',
    number: 1,
    title: 'Relatório 01 — Lista de Funcionários Não Executa',
    concept: 'Debugging de Sintaxe',
    bugType: 'sintaxe',
    context: `O relatório diário de funcionários da TechFin não executa mais. O analista júnior
editou a query ontem e quebrou a sintaxe. O sistema nem tenta mostrar o resultado.`,
    buggyQuery: `SELECT nome, cargo FORM funcionarios ORDEY BY id;`,
    bugs: [
      'FORM não existe: a palavra-chave correta é FROM.',
      'ORDEY está escrito errado: o correto é ORDER BY.',
    ],
    objective: 'Identifique e corrija os erros de sintaxe para que a query retorne o nome e o cargo de todos os funcionários, ordenada por id.',
    tables: ['funcionarios'],
    expectedColumns: ['nome', 'cargo'],
    correctQuery: 'SELECT nome, cargo FROM funcionarios ORDER BY id;',
    referenceQuery: 'SELECT nome, cargo FROM funcionarios ORDER BY id;',
    expectedResultQuery: 'SELECT nome, cargo FROM funcionarios ORDER BY id;',
    requiredConcepts: ['from'],
    hintBugs: [
      'Dica de sintaxe: revise as palavras-chave da query — FROM e ORDER BY são obrigatórias.',
      'As palavras "FORM" e "ORDEY" não existem em SQL. Substitua por FROM e ORDER.',
      'Solução: SELECT nome, cargo FROM funcionarios ORDER BY id;',
    ],
    hints: [
      'Execute a query como está: o SQLite vai apontar a posição do erro.',
      'Compare cada palavra-chave da query com o vocabulário SQL: SELECT, FROM, ORDER BY.',
      'SELECT nome, cargo FROM funcionarios ORDER BY id;',
    ],
    courseRefs: ['dml-select-where'],
    evidence: `Evidência BH-1 — Sintaxe Corrigida: A query agora usa FROM e ORDER BY corretamente.
Regra de bolso: o SQLite quase sempre indica a posição aproximada do erro de sintaxe na mensagem.
Comece o debug por ela.`,
    explanation: 'Erros de sintaxe impedem a execução da query. Palavras-chave digitadas erradas (FROM → FORM, ORDER → ORDEY) são os bugs mais comuns em quem está começando.',
  },
  {
    id: 'bug-2',
    number: 2,
    title: 'Relatório 02 — Acesso Noturno na Tabela Errada',
    concept: 'Debugging de Lógica',
    bugType: 'logica',
    context: `A segurança pediu os acessos após as 22h. A query escrita pelo júnior usa exatamente
o filtro de hora correto — mas não executa, porque foi aplicada na tabela errada.`,
    buggyQuery: `SELECT funcionario_id, data_hora FROM funcionarios WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 22 ORDER BY id;`,
    bugs: [
      'A query filtra por hora de acesso, mas consulta a tabela funcionarios, que não tem data_hora nem registra acessos — a tabela correta é logs_acesso.',
      'O filtro estava certo para o objetivo; o erro foi consultar a tabela errada, que não armazena horários. A query nem executa.',
    ],
    objective: 'Corrija a query para retornar funcionario_id e data_hora dos acessos que ocorreram após as 22h, usando a tabela certa.',
    tables: ['logs_acesso'],
    expectedColumns: ['funcionario_id', 'data_hora'],
    correctQuery: "SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 22 ORDER BY id;",
    referenceQuery: "SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 22 ORDER BY id;",
    expectedResultQuery: "SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime('%H', data_hora) AS INTEGER) >= 22 ORDER BY id;",
    requiredConcepts: ['where'],
    hintBugs: [
      'Pergunte-se: a tabela escolhida realmente contém a coluna data_hora? Verifique o esquema.',
      'funcionarios é um cadastro — quem registra horários é a tabela logs_acesso.',
      'Solução: SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime(\'%H\', data_hora) AS INTEGER) >= 22 ORDER BY id;',
    ],
    hints: [
      'A query executa? Confira o esquema: quais tabelas têm a coluna data_hora?',
      'A tabela funcionarios não registra horários de acesso. Qual tabela faz isso?',
      'SELECT funcionario_id, data_hora FROM logs_acesso WHERE CAST(strftime(\'%H\', data_hora) AS INTEGER) >= 22;',
    ],
    courseRefs: ['dml-select-where'],
    evidence: `Evidência BH-2 — Tabela Correta: O bug estava na fonte dos dados, não na condição.
A lógica do filtro estava certa; o erro foi consultar a tabela errada. Sempre confira o esquema
antes de confiar no resultado.`,
    explanation: 'Bugs de lógica produzem resultados errados sem gerar mensagem de erro. Query errada que executa é mais perigosa que query que falha — porque o número errado parece confiável.',
  },
  {
    id: 'bug-3',
    number: 3,
    title: 'Relatório 03 — Transações de Alto Risco Esqueceu o Filtro',
    concept: 'Debugging de Lógica (WHERE vs HAVING)',
    bugType: 'logica',
    context: `O relatório de transações de alto risco deveria listar apenas as transações acima de
R$ 50.000 (5.000.000 centavos) com o nome do operador. Em vez disso, está retornando TODAS as
transações, incluindo as de R$ 150. No filtro, alguém usou HAVING onde deveria usar WHERE.`,
    buggyQuery: `SELECT f.nome, t.valor_centavos FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id GROUP BY f.nome, t.valor_centavos HAVING t.valor_centavos > 5000000 ORDER BY t.id;`,
    bugs: [
      'HAVING filtra grupos agregados; para filtrar linhas individuais (valor da transação) o correto é WHERE.',
      'Com GROUP BY f.nome, t.valor_centavos, cada grupo tem uma linha e o HAVING funciona por coincidência em algumas engines — mas GROUP BY sem agregação distorce a semântica e pode retornar duplicatas ou agrupamentos errados.',
    ],
    objective: 'Corrija a query para retornar nome do operador e valor_centavos das transações acima de 5.000.000 centavos, usando WHERE antes do GROUP BY (ou sem GROUP BY).',
    tables: ['transacoes', 'funcionarios'],
    expectedColumns: ['nome', 'valor_centavos'],
    correctQuery: 'SELECT f.nome, t.valor_centavos FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id WHERE t.valor_centavos > 5000000 ORDER BY t.id;',
    referenceQuery: 'SELECT f.nome, t.valor_centavos FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id WHERE t.valor_centavos > 5000000 ORDER BY t.id;',
    expectedResultQuery: 'SELECT f.nome, t.valor_centavos FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id WHERE t.valor_centavos > 5000000 ORDER BY t.id;',
    requiredConcepts: ['join', 'where'],
    hintBugs: [
      'WHERE filtra linhas ANTES de qualquer agrupamento; HAVING filtra grupos DEPOIS do GROUP BY.',
      'Não há função de agregação na query. Para filtrar linhas individuais, o filtro deve vir com WHERE.',
      'Solução: mova "t.valor_centavos > 5000000" para um WHERE e remova o GROUP BY.',
    ],
    hints: [
      'Compare o número de linhas retornadas com o esperado: o relatório deve ter apenas 5 linhas.',
      'Regra: WHERE filtra linhas; HAVING filtra grupos (COUNT, SUM...). Qual dos dois faz sentido aqui?',
      'SELECT f.nome, t.valor_centavos FROM transacoes t INNER JOIN funcionarios f ON t.operador_funcionario_id = f.id WHERE t.valor_centavos > 5000000;',
    ],
    courseRefs: ['having-where-orderby-like', 'joins-inner-left'],
    evidence: `Evidência BH-3 — WHERE vs HAVING: O filtro de linha pertence ao WHERE. HAVING só entra em cena
depois do GROUP BY, para filtrar grupos agregados. Misturar os dois é um dos bugs lógicos mais
clássicos do SQL.`,
    explanation: 'WHERE avalia cada linha antes do agrupamento; HAVING avalia cada grupo depois do GROUP BY. Filtrar um atributo de linha com HAVING + GROUP BY produz resultados inesperados.',
  },
  {
    id: 'bug-4',
    number: 4,
    title: 'Relatório 04 — Total de Transações Ignora Operador Nulo',
    concept: 'Debugging de Lógica (INNER JOIN vs LEFT JOIN)',
    bugType: 'logica',
    context: `O relatório deveria mostrar a quantidade de transações por funcionário, incluindo os
que nunca operaram (total 0). Com o INNER JOIN atual, esses funcionários simplesmente somem do
relatório — a diretoria não enxerga quem está "limpo" no sistema.`,
    buggyQuery: `SELECT f.nome, COUNT(t.id) AS total_transacoes FROM funcionarios f INNER JOIN transacoes t ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome ORDER BY f.id;`,
    bugs: [
      'INNER JOIN descarta funcionários sem nenhuma transação — exatamente os que o relatório precisa mostrar com total 0.',
      'O filtro correto é LEFT JOIN com t.id IS NULL para os "sem transações", ou manter o LEFT JOIN e aceitar COUNT 0.',
    ],
    objective: 'Corrija a query para listar TODOS os funcionários e seus totais de transações — incluindo os que nunca operaram (total_transacoes = 0).',
    tables: ['funcionarios', 'transacoes'],
    expectedColumns: ['nome', 'total_transacoes'],
    correctQuery: 'SELECT f.nome, COUNT(t.id) AS total_transacoes FROM funcionarios f LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome ORDER BY f.id;',
    referenceQuery: 'SELECT f.nome, COUNT(t.id) AS total_transacoes FROM funcionarios f LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome ORDER BY f.id;',
    expectedResultQuery: 'SELECT f.nome, COUNT(t.id) AS total_transacoes FROM funcionarios f LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome ORDER BY f.id;',
    requiredConcepts: ['left join', 'group by', 'count'],
    hintBugs: [
      'Conte as linhas retornadas: o esperado é 10 funcionários. Quantos o relatório atual mostra?',
      'INNER JOIN só mantém linhas com correspondência nas duas tabelas. Funcionários sem transação não têm correspondência.',
      'Solução: troque INNER JOIN por LEFT JOIN — funcionários sem transação permanecem com total 0.',
    ],
    hints: [
      'Compare o número de linhas: todos os 10 funcionários deveriam aparecer.',
      'Qual JOIN preserva as linhas da tabela da esquerda mesmo sem correspondência?',
      'SELECT f.nome, COUNT(t.id) AS total_transacoes FROM funcionarios f LEFT JOIN transacoes t ON t.operador_funcionario_id = f.id GROUP BY f.id, f.nome;',
    ],
    courseRefs: ['joins-inner-left', 'aggregation-groupby'],
    evidence: `Evidência BH-4 — JOIN Certo para o Objetivo: INNER JOIN remove linhas sem correspondência;
LEFT JOIN as preserva. Se o objetivo é "todos os funcionários, mesmo sem transações", o LEFT JOIN
é obrigatório.`,
    explanation: 'O tipo de JOIN muda o resultado. LEFT JOIN preserva a tabela da esquerda e preenche com NULL onde não há correspondência — COUNT(t.id) então retorna 0 corretamente.',
  },
  {
    id: 'bug-5',
    number: 5,
    title: 'Relatório 05 — E-mails Suspeitos Usam LIKE Sem LOWER',
    concept: 'Debugging de Lógica (case-sensitive)',
    bugType: 'logica',
    context: `O relatório de e-mails com a palavra "urgente" deveria capturar todos, mas está
deixando escapar mensagens que escrevem "Urgente" ou "URGENTE". O LIKE foi aplicado direto na
coluna, sem normalizar a caixa.`,
    buggyQuery: `SELECT f.nome, e.assunto FROM emails e INNER JOIN funcionarios f ON e.remetente_id = f.id WHERE e.conteudo LIKE '%urgente%' ORDER BY e.id;`,
    bugs: [
      'LIKE é case-sensitive para caracteres não-ASCII; "Urgente" e "URGENTE" não casam com "%urgente%".',
      'A correção é normalizar a caixa com LOWER(e.conteudo) LIKE "%urgente%".',
    ],
    objective: 'Corrija a query para capturar todos os e-mails cujo conteúdo contenha "urgente" em qualquer caixa (maiúsculas ou minúsculas).',
    tables: ['emails', 'funcionarios'],
    expectedColumns: ['nome', 'assunto'],
    correctQuery: "SELECT f.nome, e.assunto FROM emails e INNER JOIN funcionarios f ON e.remetente_id = f.id WHERE LOWER(e.conteudo) LIKE '%urgente%' ORDER BY e.id;",
    referenceQuery: "SELECT f.nome, e.assunto FROM emails e INNER JOIN funcionarios f ON e.remetente_id = f.id WHERE LOWER(e.conteudo) LIKE '%urgente%' ORDER BY e.id;",
    expectedResultQuery: "SELECT f.nome, e.assunto FROM emails e INNER JOIN funcionarios f ON e.remetente_id = f.id WHERE LOWER(e.conteudo) LIKE '%urgente%' ORDER BY e.id;",
    requiredConcepts: ['join', 'like', 'lower'],
    hintBugs: [
      'Execute a query e conte as linhas. Compare com o esperado. Alguma mensagem em caixa diferente ficou de fora?',
      'LIKE sem normalização diferencia "u" de "U". Aplique LOWER() no lado da coluna.',
      'Solução: WHERE LOWER(e.conteudo) LIKE \'%urgente%\'.',
    ],
    hints: [
      'O resultado esperado tem mais linhas que o atual? A palavra "urgente" pode estar como "Urgente".',
      'Como tornar a comparação insensível a maiúsculas/minúsculas?',
      'SELECT f.nome, e.assunto FROM emails e INNER JOIN funcionarios f ON e.remetente_id = f.id WHERE LOWER(e.conteudo) LIKE \'%urgente%\';',
    ],
    courseRefs: ['having-where-orderby-like'],
    evidence: `Evidência BH-5 — Busca Case-Insensitive: Sem LOWER(), o LIKE falha para variações de caixa.
Sempre normalize o texto (LOWER/UPPER) nos dois lados da comparação em buscas de conteúdo.`,
    explanation: 'LOWER() converte o texto para minúsculas antes da comparação. Como "%urgente%" já está em minúsculas, qualquer variação de caixa na coluna passa a casar.',
  },
  {
    id: 'bug-6',
    number: 6,
    title: 'Relatório 06 — Subquery Retorna Múltiplas Médias',
    concept: 'Debugging de Lógica (agregação equivocada)',
    bugType: 'logica',
    context: `O relatório deveria listar as transações acima da média geral da empresa. O analista
calculou a média por funcionário (com GROUP BY) em vez da média global — e a subquery de
comparação falha ou compara com um valor errado.`,
    buggyQuery: `SELECT id, valor_centavos FROM transacoes WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes GROUP BY operador_funcionario_id) ORDER BY id;`,
    bugs: [
      'A subquery com GROUP BY retorna MÚLTIPLAS médias (uma por funcionário), mas ">" compara com um único valor — o SQLite usa apenas a primeira linha, um número arbitrário.',
      'A média correta é a GLOBAL: SELECT AVG(valor_centavos) FROM transacoes, sem GROUP BY.',
    ],
    objective: 'Corrija a query para retornar id e valor_centavos das transações acima da média GLOBAL de todas as transações.',
    tables: ['transacoes'],
    expectedColumns: ['id', 'valor_centavos'],
    correctQuery: 'SELECT id, valor_centavos FROM transacoes WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes) ORDER BY id;',
    referenceQuery: 'SELECT id, valor_centavos FROM transacoes WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes) ORDER BY id;',
    expectedResultQuery: 'SELECT id, valor_centavos FROM transacoes WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes) ORDER BY id;',
    requiredConcepts: ['subquery', 'avg'],
    hintBugs: [
      'Execute a subquery sozinha: quantas linhas ela retorna? Uma comparação ">" precisa de UM valor.',
      'GROUP BY dentro do AVG divide a média em pedaços. Para a média da empresa inteira, remova o GROUP BY.',
      'Solução: WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes).',
    ],
    hints: [
      'Teste isolado: SELECT AVG(valor_centavos) FROM transacoes GROUP BY operador_funcionario_id; — quantas médias?',
      'Uma subquery de comparação escalar deve retornar exatamente uma linha.',
      'SELECT id, valor_centavos FROM transacoes WHERE valor_centavos > (SELECT AVG(valor_centavos) FROM transacoes);',
    ],
    courseRefs: ['cte-subqueries', 'aggregation-groupby'],
    evidence: `Evidência BH-6 — Subquery Escalar: Uma subquery usada em comparação (>, =, <) deve
retornar UM valor. GROUP BY dentro dela multiplica o resultado e corrompe a comparação — muitas
vezes sem gerar erro, apenas números errados.`,
    explanation: 'Subqueries escalares retornam uma linha e uma coluna. Adicionar GROUP BY transforma em múltiplas linhas e a comparação passa a usar valor arbitrário.',
  },
  {
    id: 'bug-7',
    number: 7,
    title: 'Relatório 07 — Transações Lentas: Falta o Índice',
    concept: 'Debugging de Performance',
    bugType: 'performance',
    context: `O filtro de transações por conta de origem ficou extremamente lento com o crescimento
da base. O plano de execução mostra varredura completa da tabela (SCAN) em um filtro que sempre
usa a mesma coluna: conta_origem_id.`,
    buggyQuery: `-- Relatorio de transacoes por conta de origem (sem indice)
SELECT id, conta_origem_id, valor_centavos, data_hora FROM transacoes WHERE conta_origem_id = 107 ORDER BY id;`,
    bugs: [
      'A query em si está correta, mas roda lenta: não existe índice na coluna conta_origem_id, então cada consulta varre a tabela inteira (full table scan).',
      'A correção de performance é criar CREATE INDEX idx_transacoes_origem ON transacoes(conta_origem_id); a query permanece igual.',
    ],
    objective: 'A query está sintaticamente correta mas lenta. Crie o índice idx_transacoes_origem na coluna conta_origem_id da tabela transacoes e, em seguida, execute a mesma query filtrando conta_origem_id = 107.',
    tables: ['transacoes'],
    expectedColumns: ['id', 'conta_origem_id', 'valor_centavos', 'data_hora'],
    correctQuery: "CREATE INDEX idx_transacoes_origem ON transacoes(conta_origem_id);",
    referenceQuery: "CREATE INDEX idx_transacoes_origem ON transacoes(conta_origem_id);",
    expectedResultQuery: "SELECT m.name AS idx_name FROM sqlite_master m WHERE m.type = 'index' AND m.name = 'idx_transacoes_origem';",
    executionMode: 'ddl',
    requiredConcepts: ['create index'],
    hintBugs: [
      'Dica de performance: quando a mesma coluna é filtrada repetidamente, um índice evita varrer a tabela inteira.',
      'Verifique o esquema: existe algum índice em transacoes? A coluna usada no WHERE não está indexada.',
      'Solução: CREATE INDEX idx_transacoes_origem ON transacoes(conta_origem_id);',
    ],
    hints: [
      'Conte os índices: SELECT name FROM sqlite_master WHERE type = \'index\'; — há algum em transacoes?',
      'Qual comando cria índice em uma coluna específica?',
      'CREATE INDEX idx_transacoes_origem ON transacoes(conta_origem_id);',
    ],
    courseRefs: ['dw-governance', 'indexes-optimization'],
    evidence: `Evidência BH-7 — Índice Criado: Com o índice em conta_origem_id, o banco localiza as linhas
sem varrer a tabela inteira. Índices são a primeira linha de defesa contra consultas lentas — e
têm custo de escrita.`,
    explanation: 'CREATE INDEX cria uma estrutura de busca para a coluna. Consultas com WHERE na coluna indexada deixam de fazer full table scan. Trade-off: escrita mais lenta e espaço extra.',
  },
  {
    id: 'bug-8',
    number: 8,
    title: 'Relatório 08 — Salário em Centavos Mostrado Errado',
    concept: 'Debugging de Lógica (unidade de medida)',
    bugType: 'logica',
    context: `O relatório financeiro deveria exibir o salário em reais, mas o banco armazena em
CENTAVOS e a query mostra o número bruto: "10500000" em vez de "R$ 105.000,00". Os números estão
100 vezes maiores que deveriam.`,
    buggyQuery: `SELECT nome, salario_centavos AS salario FROM funcionarios WHERE departamento_id = 1 ORDER BY id;`,
    bugs: [
      'O banco armazena salário em CENTAVOS (ex.: 10500000 = R$ 105.000,00), mas a query retorna o valor bruto sem converter para reais.',
      'A correção é dividir por 100.0 e rotular a coluna como salario_reais.',
    ],
    objective: 'Corrija a query para retornar nome e salário EM REAIS (dividir centavos por 100) dos funcionários do departamento Financeiro (departamento_id = 1). A coluna deve se chamar salario_reais.',
    tables: ['funcionarios'],
    expectedColumns: ['nome', 'salario_reais'],
    correctQuery: 'SELECT nome, salario_centavos / 100.0 AS salario_reais FROM funcionarios WHERE departamento_id = 1 ORDER BY id;',
    referenceQuery: 'SELECT nome, salario_centavos / 100.0 AS salario_reais FROM funcionarios WHERE departamento_id = 1 ORDER BY id;',
    expectedResultQuery: 'SELECT nome, salario_centavos / 100.0 AS salario_reais FROM funcionarios WHERE departamento_id = 1 ORDER BY id;',
    requiredConcepts: ['where', 'select'],
    hintBugs: [
      'Compare um número retornado com o salário real esperado: 10500000 centavos são R$ 105.000,00. Falta uma conversão.',
      'Para converter centavos em reais, divida por 100 (use 100.0 para preservar casas decimais).',
      'Solução: SELECT nome, salario_centavos / 100.0 AS salario_reais FROM funcionarios WHERE departamento_id = 1;',
    ],
    hints: [
      'O valor 10500000 faz sentido como salário? Em que unidade o banco armazena?',
      'Como converter centavos em reais dentro do SELECT?',
      'SELECT nome, salario_centavos / 100.0 AS salario_reais FROM funcionarios WHERE departamento_id = 1;',
    ],
    courseRefs: ['dml-select-where'],
    evidence: `Evidência BH-8 — Unidade de Medida: O bug não estava na sintaxe nem no JOIN, mas na
unidade: centavos vs reais. Bugs de unidade (100x, 1000x) são silenciosos e distorcem relatórios
financeiros sem gerar nenhum erro.`,
    explanation: 'Dividir por 100.0 (com decimal) preserva as casas centavos no resultado. Sem o ".0", o SQLite pode truncar para inteiro.',
  },
  {
    id: 'bug-9',
    number: 9,
    title: 'Relatório 09 — Duplicatas do CROSS JOIN',
    concept: 'Debugging de Performance/Lógica (produto cartesiano)',
    bugType: 'logica+performance',
    context: `O relatório de transações com o banco de destino deveria juntar transacoes com contas.
O analista usou duas tabelas no FROM sem condição de junção — um CROSS JOIN implícito que gera um
produto cartesiano: 16 transações × 13 contas = 208 linhas falsas.`,
    buggyQuery: `SELECT t.id AS transacao_id, c.banco FROM transacoes t, contas c WHERE t.valor_centavos > 5000000 ORDER BY t.id;`,
    bugs: [
      'Dois tabelas no FROM sem condição ON produzem produto cartesiano: cada transação combina com TODAS as contas (16 × 13 = 208 linhas).',
      'A correção é usar JOIN explícito com a condição t.conta_destino_id = c.id.',
    ],
    objective: 'Corrija a query para retornar transacao_id e banco apenas das transações acima de 5.000.000 centavos, ligando transacoes à conta de destino correta (sem duplicatas).',
    tables: ['transacoes', 'contas'],
    expectedColumns: ['transacao_id', 'banco'],
    correctQuery: 'SELECT t.id AS transacao_id, c.banco FROM transacoes t INNER JOIN contas c ON t.conta_destino_id = c.id WHERE t.valor_centavos > 5000000 ORDER BY t.id;',
    referenceQuery: 'SELECT t.id AS transacao_id, c.banco FROM transacoes t INNER JOIN contas c ON t.conta_destino_id = c.id WHERE t.valor_centavos > 5000000 ORDER BY t.id;',
    expectedResultQuery: 'SELECT t.id AS transacao_id, c.banco FROM transacoes t INNER JOIN contas c ON t.conta_destino_id = c.id WHERE t.valor_centavos > 5000000 ORDER BY t.id;',
    requiredConcepts: ['join', 'where'],
    hintBugs: [
      'Conte as linhas retornadas: 5 transações de alto valor × N contas = duplicatas. Um JOIN precisa de condição.',
      'O FROM t, c sem ON é um CROSS JOIN implícito. Substitua por JOIN ... ON t.conta_destino_id = c.id.',
      'Solução: SELECT t.id AS transacao_id, c.banco FROM transacoes t INNER JOIN contas c ON t.conta_destino_id = c.id WHERE t.valor_centavos > 5000000;',
    ],
    hints: [
      'Quantas linhas o relatório retorna? Quantas transações de alto valor existem?',
      'Qual condição liga transacoes à conta de destino?',
      'SELECT t.id AS transacao_id, c.banco FROM transacoes t INNER JOIN contas c ON t.conta_destino_id = c.id WHERE t.valor_centavos > 5000000;',
    ],
    courseRefs: ['joins-inner-left'],
    evidence: `Evidência BH-9 — Produto Cartesiano Eliminada: JOIN sem condição multiplica linhas
(carteasiano); o JOIN com ON traz apenas as combinações válidas. Verifique sempre o rowCount
quando duas tabelas entram no FROM.`,
    explanation: 'FROM a, b sem ON é sintaxe antiga de produto cartesiano. O JOIN explícito com ON restringe às combinações relacionadas, eliminando duplicatas e reduzindo o custo.',
  },
  {
    id: 'bug-10',
    number: 10,
    title: 'Relatório 10 — O Veredito Incompleto (bug duplo)',
    concept: 'Debugging Avançado (2 bugs: JOIN + condição)',
    bugType: 'logica+performance',
    context: `Último relatório: o veredito final do Caso #001. A query deveria cruzar funcionários
com suas transações de alto risco e mostrar o total por funcionário. Dois bugs escondidos:
a condição do ON usa a coluna errada e um filtro essencial foi perdido.`,
    buggyQuery: `SELECT f.nome, COUNT(*) AS total_alto_risco FROM funcionarios f INNER JOIN transacoes t ON f.id = t.operador_funcionario_id GROUP BY f.nome ORDER BY f.nome;`,
    bugs: [
      'O GROUP BY usa f.nome, que não é único: dois funcionários com o mesmo nome seriam agrupados juntos. O correto é GROUP BY f.id, f.nome.',
      'Falta o filtro de alto risco: a query conta TODAS as transações, não apenas as acima de 5.000.000 centavos. Adicione WHERE t.valor_centavos > 5000000.',
    ],
    objective: 'Corrija os dois bugs: agrupe por f.id, f.nome e adicione o filtro de alto risco (valor_centavos > 5000000) para contar apenas transações de alto risco.',
    tables: ['funcionarios', 'transacoes'],
    expectedColumns: ['nome', 'total_alto_risco'],
    correctQuery: 'SELECT f.nome, COUNT(*) AS total_alto_risco FROM funcionarios f INNER JOIN transacoes t ON f.id = t.operador_funcionario_id WHERE t.valor_centavos > 5000000 GROUP BY f.id, f.nome ORDER BY f.id;',
    referenceQuery: 'SELECT f.nome, COUNT(*) AS total_alto_risco FROM funcionarios f INNER JOIN transacoes t ON f.id = t.operador_funcionario_id WHERE t.valor_centavos > 5000000 GROUP BY f.id, f.nome ORDER BY f.id;',
    expectedResultQuery: 'SELECT f.nome, COUNT(*) AS total_alto_risco FROM funcionarios f INNER JOIN transacoes t ON f.id = t.operador_funcionario_id WHERE t.valor_centavos > 5000000 GROUP BY f.id, f.nome ORDER BY f.id;',
    requiredConcepts: ['join', 'group by', 'where'],
    hintBugs: [
      'Bug 1: conte o total de cada funcionário — está incluindo transações de baixo valor que não deveriam entrar.',
      'Bug 2: GROUP BY só por nome é frágil; use o id como chave de agrupamento.',
      'Solução: WHERE t.valor_centavos > 5000000 e GROUP BY f.id, f.nome.',
    ],
    hints: [
      'Compare os totais: o relatório deve mostrar SOMENTE transações de alto risco. O filtro WHERE sumiu.',
      'O GROUP BY apenas por nome agrupa pessoas diferentes com nomes iguais. Inclua f.id.',
      'SELECT f.nome, COUNT(*) AS total_alto_risco FROM funcionarios f INNER JOIN transacoes t ON f.id = t.operador_funcionario_id WHERE t.valor_centavos > 5000000 GROUP BY f.id, f.nome;',
    ],
    courseRefs: ['joins-inner-left', 'aggregation-groupby', 'having-where-orderby-like'],
    evidence: `Evidência BH-10 — Dois Bugs, Uma Correção: Este relatório tinha um filtro perdido (WHERE)
e um agrupamento frágil (só por nome). Bugs compostos são comuns em queries reais — revise uma
condição de cada vez, do filtro até o agrupamento.`,
    explanation: 'O filtro WHERE restringe as linhas antes de COUNT; GROUP BY f.id, f.nome garante identidade única mesmo com nomes repetidos. Ordenar por f.id mantém a ordem estável.',
  },
];

export const BUG_HUNTER_GAMEPLAY = {
  bonusPointsPerChallenge: 150,
  challenges: BUG_CHALLENGES,
};
