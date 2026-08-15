# Aula 14 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 5-5.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:05:14

---

**[00:00]** Tentou resolver esses dois exercícios que eu deixei aqui para você?

**[00:11]** Eu tenho certeza que sim, porque você sabe que o seu aprendizado também depende de você,

**[00:16]** não é isso?

**[00:17]** Perfeito.

**[00:18]** Vamos então para a solução do primeiro item.

**[00:21]** É importante sempre justificar as suas escolhas, porque isso demonstra o conhecimento.

**[00:27]** Então eu quero média de salário dos departamentos com funcionários alocados em projetos.

**[00:33]** Neste caso eu usei o InnerJoin.

**[00:36]** Por que eu usei InnerJoin?

**[00:38]** Porque aqui não fala nada sobre haver ou não correspondência.

**[00:43]** Nem sempre vai estar claro na requisição, na solicitação, na demanda.

**[00:49]** Você tem que interpretar e a partir daí decidir.

**[00:52]** Neste caso está dizendo o seguinte.

**[00:54]** Eu quero média de salário dos departamentos com funcionários alocados em projetos.

**[00:59]** Não diz nada sobre funcionário não alocado em projeto.

**[01:03]** Certo?

**[01:04]** Somente funcionário alocado é em projeto.

**[01:07]** Neste caso tem que haver correspondência.

**[01:09]** Então tem que usar InnerJoin.

**[01:11]** Ah, mas da minha empresa o pessoal também quer média, mesmo do pessoal que não está

**[01:17]** alocado em projeto.

**[01:18]** É, mas não é isso que está menunciado.

**[01:21]** Eu estou lendo e interpretando este enunciado.

**[01:24]** E é assim que você deve sempre se preocupar na hora de construir sua query SQL.

**[01:30]** Muita gente inverte essa ordem, por isso que não aprende SQL.

**[01:33]** O pessoal fica decorando os sintaxes, regrinhas, aquelas regrinhas.

**[01:37]** Quando usar left, right, ninguém aprende com aquilo.

**[01:40]** As pessoas insistem assim mesmo.

**[01:42]** Um dia eu não vou entender porque o ser humano faz isso.

**[01:45]** Mas não tem de decorar regrinha.

**[01:47]** Não é assim que funciona.

**[01:49]** Leia o enunciado aquilo que você precisa.

**[01:51]** Então, se não tiver enunciado você cria, porque você está montando a query.

**[01:54]** E a partir do enunciado você monta a instrução.

**[01:57]** Então vamos lá.

**[01:58]** Média de salário.

**[01:59]** Então eu já sei que eu tenho que usar o AVG.

**[02:02]** Certo?

**[02:03]** Porque a função de agregação calcula média.

**[02:05]** Vou colocar o round para colocar duas casas decimais.

**[02:08]** Eu quero essa média por departamento.

**[02:10]** Então eu já sei que tenho que retornar a departamento.

**[02:13]** Já sei que eu preciso de um grupo by.

**[02:15]** Porque você já sabe que coluna que não está na função de agregação vai para onde?

**[02:20]** Para o agrupamento.

**[02:21]** Estou usando um apelido carinhoso usando es.

**[02:24]** O es não é obrigatório.

**[02:26]** Mas é uma boa prática para indicar que ali tem exatamente um apelido, que é um alias.

**[02:32]** Ok?

**[02:33]** Bom, só que eu quero retornar isso somente se funcionário estiver alocado em projeto.

**[02:39]** Funcionário, ou seja, dado de funcionário, que é o departamento, está em uma tabela.

**[02:44]** A locação de projeto está em outra.

**[02:46]** Então eu tenho que fazer a junção das tabelas.

**[02:48]** Neste caso eu só quero que estiver alocado.

**[02:50]** Então eu faço inner join.

**[02:52]** E aí eu coloco as colunas que permitem o relacionamento na cláusula on.

**[02:57]** Pronto.

**[02:58]** Executa a query e aí está para você.

**[03:00]** Excelente.

**[03:01]** Tudo bem?

**[03:02]** Ficou claro?

**[03:03]** Siga a minha dica, o meu conselho.

**[03:06]** Ok?

**[03:07]** Eu já trabalho com a SQL há pelo menos quase 30 anos.

**[03:10]** Eu não lembro de um momento na minha vida profissional em que eu não tenho usado SQL

**[03:14]** em algum momento.

**[03:15]** Porque a SQL está presente o tempo inteiro, principalmente quando você trabalha com dados,

**[03:19]** não é?

**[03:20]** A dica é, não decore regrinha de sintaxe.

**[03:25]** Sempre compreenda o resultado que você precisa.

**[03:28]** O que você quer retornar.

**[03:30]** É isso que vai definir a maneira como você cria a sua instrução.

**[03:34]** Vamos para o outro item.

**[03:36]** Vou trazer já a query aqui para você.

**[03:38]** Isso aqui já era um desafio, porque eu não expliquei exatamente uma das funções que

**[03:43]** eu vou usar, mas é isso.

**[03:45]** Desafio no dia a dia você vai encontrar o tempo inteiro.

**[03:47]** Pesquise se necessário.

**[03:49]** Colocamos para você um link de um tutorial de SQL lá na seção de links úteis ao final

**[03:54]** do capítulo.

**[03:55]** Ok?

**[03:56]** Um tutorial bem completo.

**[03:57]** Você pode inclusive fazer o tutorial, se quiser revisar.

**[04:00]** É gratuito, é disponível na internet gratuitamente.

**[04:02]** Uma forma de você praticar um pouco mais também.

**[04:05]** Deixa eu quebrar aqui a linha para ficar mais fácil a leitura.

**[04:08]** Olha só.

**[04:09]** Eu quero média de salário dos departamentos, com funcionários alocados em projetos.

**[04:14]** A mesma questão do item anterior.

**[04:17]** Só que aí adicionamos um filtro.

**[04:19]** Eu quero isso cuja data de contratação do funcionário tenha sido no dia 10 de qualquer

**[04:25]** mês ou ano.

**[04:26]** Se o cara for contratar no dia 10, eu quero incluir isso como filtro.

**[04:31]** É um filtro que envolve a agregação?

**[04:33]** Não.

**[04:35]** Então se não envolve a agregação, vai para onde?

**[04:38]** Para Causalware.

**[04:39]** Se envolver essa agregação no filtro, eu tinha que usar o que?

**[04:43]** O having.

**[04:44]** Não é isso?

**[04:45]** Mostrei nos vídeos anteriores.

**[04:46]** Excelente.

**[04:47]** Então veja o que nós vamos fazer aqui.

**[04:49]** Eu quero a média de salário.

**[04:50]** Lá está.

**[04:51]** Faço arredondamento.

**[04:52]** Excelente.

**[04:53]** Coloco um apelido carinhoso que é um alias.

**[04:55]** Eu quero essa média por departamento.

**[04:57]** O departamento vai aqui no select, não está na função de agregação, vai para onde?

**[05:01]** Vai para o grupo By.

**[05:02]** Para que eu possa verificar quem está alocado em projeto, eu tenho que fazer a junção

**[05:07]** das tabelas.

**[05:08]** Aqui não diz nada sobre estar ou não alocado.

**[05:12]** Então eu estou considerando que tem que estar alocado.

**[05:15]** Sendo assim, eu vou usar o innerJoin.

**[05:18]** Está faltando apenas o filtro.

**[05:20]** Esse filtro diz o seguinte.

**[05:22]** Data de contratação tem a sido no dia 10.

**[05:25]** Bom, eu tenho a coluna, data de contratação.

**[05:28]** Eu tenho que extrair um item da data, que é o dia.

**[05:32]** Então eu vou usar a função extracting.

**[05:35]** Mais uma função SQL para você.

**[05:37]** A função extract, como o nome sugere, é extrair.

**[05:41]** Eu vou extrair o quê?

**[05:42]** O dia.

**[05:43]** Os termos têm que estar em inglês, ok?

**[05:45]** Porque a sintaxe SQL é em inglês.

**[05:47]** Eu vou extrair o dia, from, coluna, data de contratação.

**[05:52]** Eu vou extrair o dia e vou comparar.

**[05:53]** O dia é igual a 10?

**[05:55]** Sim.

**[05:56]** Então por gentileza retorne, pronto.

**[05:58]** Aí está para você.

**[06:00]** Ou seja, eu retornei a média de departamento do pessoal que está alocado em projeto.

**[06:07]** Só que eu fiz isso somente se a data de contratação do funcionário foi igual ao

**[06:11]** dia 10, de qualquer mês ou ano.

**[06:13]** Eu fiz o inner join, eu retornei a média de departamento, eu agrupei e eu apliquei

**[06:18]** um filtro extraindo o dia da data.

**[06:22]** Veja como nós fizemos a leitura do enunciado.

**[06:26]** E a partir daí montamos a nossa instrução SQL.

**[06:30]** Recomendo que você siga essa sequência no seu dia a dia.

**[06:34]** Então a gente já começa direto com a instrução SQL, tentando lembrar das regrinhas que tentou

**[06:38]** decorar.

**[06:39]** Aí se perde no meio do caminho.

**[06:42]** Porque para você montar a lógica da sua query, eu tenho que saber o que eu vou retornar.

**[06:47]** Isso é o mais importante.

**[06:49]** Você rapidamente vai no Google e você pesquisa exatamente qual é a sintaxe.

**[06:54]** Não precisa decorar sintaxe de nada, nem de linguagem de programação nenhuma.

**[06:57]** Tem documentação à sua disposição, tem chat GPT, tem Google, tem o que você quiser.

**[07:03]** Para que vai ficar decorando sintaxe?

**[07:05]** Não precisa.

**[07:06]** Agora, compreender o cenário de negócio e a partir daí montar a sua query já é outra questão.

**[07:13]** E é assim que você aprende a trabalhar com linguagem SQL.

**[07:17]** Posso aumentar um pouquinho o nível de complexidade?

**[07:20]** Aí você responde, se instrutor, claro que pode.

**[07:23]** Vim aqui para aprender o máximo possível.

**[07:25]** Aumente o grau de complexidade.

**[07:27]** Ótimo, porque é o que eu vou fazer agora no próximo vídeo.

**[07:30]** Muito obrigado e até lá.
