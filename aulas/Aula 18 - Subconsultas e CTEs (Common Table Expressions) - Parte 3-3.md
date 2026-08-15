# Aula 18 - Subconsultas e CTEs (Common Table Expressions) - Parte 3-3.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:12:04

---

**[00:00]** O CTE é um tipo de subconsulta, ok?

**[00:12]** Na prática nós temos uma subconsulta que vai gerar uma tabela temporária e aí eu

**[00:18]** faço uma consulta na tabela temporária.

**[00:21]** Isso é o CTE.

**[00:23]** Nesta subconsulta aqui dentro que fica entre parênteses, você pode colocar o que você

**[00:28]** quiser em SQL.

**[00:29]** Você pode usar a junção, você pode usar o group by, você pode usar o having para

**[00:34]** filtrar a agregação com o group by.

**[00:36]** Você pode fazer a junção de várias tabelas.

**[00:39]** É linguagem SQL, normal.

**[00:41]** Você usa a subconsulta para criar a tabela temporária e faz a consulta na tabela temporária.

**[00:46]** É um tipo de subconsulta.

**[00:48]** Tudo bem?

**[00:49]** Só que eu tenho outra alternativa.

**[00:51]** Como eu disse há pouco, não é?

**[00:53]** Em geral nós temos várias formas de fazer alguma coisa em linguagem SQL.

**[00:59]** Isso é complicado no início, mas com o tempo você percebe que as melhores coisas da linguagem

**[01:04]** SQL é a sua flexibilidade.

**[01:06]** Sempre dá para encontrar formas diferentes de resolver um determinado problema.

**[01:10]** Só que eu tenho aqui agora para você.

**[01:13]** Considerando os funcionários contratados no meio de fevereiro, retorne nome departamento

**[01:19]** de quem tem o maior salário.

**[01:22]** Quer tentar resolver isso aqui?

**[01:23]** Dá uma pausa no vídeo.

**[01:25]** O que é fazer funcionários contratados em fevereiro?

**[01:29]** Retorne nome departamento de quem tem o maior salário.

**[01:32]** Interessante, não?

**[01:34]** Primeiro, eu preciso fazer alguma junção?

**[01:38]** Sim ou não e por quê?

**[01:39]** Não, não preciso de junção, porque os dados que eu preciso estão todos em uma única tabela.

**[01:44]** Então não preciso fazer junção.

**[01:45]** Tudo bem?

**[01:48]** Eu tenho que fazer a agregação?

**[01:49]** Sim, eu tenho.

**[01:51]** Por que eu quero fazer a agregação?

**[01:53]** Porque eu tenho que retornar o maior salário.

**[01:55]** Para retornar o maior salário, eu tenho uma função de agregação para isso que é a

**[01:58]** função max.

**[01:59]** Então, eu já sei que eu vou ter que fazer a agregação.

**[02:02]** Olha o que estamos fazendo, exercício valiosíssimo.

**[02:06]** Estamos interpretando a necessidade para, a partir daí, montar nossa query.

**[02:10]** Bom, vou trazer uma primeira proposta de solução.

**[02:15]** Observe esta aqui.

**[02:16]** Quem não conhece Subconsulta provavelmente vai tentar resolver desta forma.

**[02:21]** Select nome, departamento, que está pedindo lá, não é?

**[02:25]** Não é anunciado.

**[02:26]** E o salário max, maior salário da tabela funcionários.

**[02:31]** Estou aplicando o filtro porque eu quero o mês.

**[02:34]** Olha aqui, estou extraindo o mês agora.

**[02:36]** Eu quero o mês igual ao 2, que é o mês de fevereiro.

**[02:40]** E eu estou agrupando pelas duas colunas que não estão na função de agregação.

**[02:45]** Então, sintaticamente, parece que a query está correta.

**[02:49]** Executa.

**[02:51]** E aí eu pergunto para você.

**[02:53]** Era esse o resultado que eu queria?

**[02:56]** Vamos ver o anunciado mais uma vez.

**[02:58]** Considerando os funcionários contratados no mês de fevereiro, ok, coloquei lá a minha

**[03:02]** regrinha, retorne o nome departamento, ok, retornei, de quem tem o maior salário.

**[03:08]** Mas espera aí, quem tem o maior salário agora?

**[03:11]** Instructor, eu estou vendo daqui.

**[03:13]** O Carlos Drummond de Andrade, ele tem o maior salário, olha lá, 23,400.

**[03:18]** Sim, mas se eu tivesse nessa tabela 8 milhões de registros, eu vou ficar olhando para os

**[03:23]** 8 milhões de registros para achar o maior salário?

**[03:27]** Então me parece que essa query não é a ideal.

**[03:30]** Ela está correta em termos de sintaxe da linguagem, retornou ali o maior salário,

**[03:35]** mas não me parece que é algo razoável se eu tiver uma tabela com 8 milhões de registros,

**[03:41]** não é?

**[03:42]** Então talvez eu tenha que reescrever a minha query.

**[03:45]** Olha só que legal.

**[03:47]** Muita gente tenta resolver o problema com a única ferramenta que conhece.

**[03:52]** Não importa se é prego ou parafuso, vai sempre usar o martelo, sendo que temos a ferramenta

**[03:59]** apropriada para o prego e a ferramenta apropriada para o parafuso, não é isso?

**[04:05]** Então esta query, embora até retorne o resultado, não me parece a ideal.

**[04:11]** Então vamos mudar a query, vamos mudar a ferramenta.

**[04:14]** É aí que entra, por exemplo, a subconsulta.

**[04:17]** Olha só que legal, hein?

**[04:19]** Vou colocar aqui a solução completa com a query anterior e agora a solução.

**[04:25]** Aqui embaixo eu tenho a solução usando subconsulta.

**[04:28]** Já vou executar?

**[04:29]** E aí discutimos aqui a sintaxe.

**[04:31]** Opa, me parece que agora retornou algo mais interessante, não?

**[04:36]** Considerando, todos os funcionários contratados em fevereiro retornem nome e departamento

**[04:42]** de quem tem o maior salário.

**[04:44]** Se tiver duas pessoas, tudo bem.

**[04:45]** Nós vimos aqui na query anterior quem é que tem o maior salário?

**[04:49]** Não é o Caldo Mondo e Andrade?

**[04:51]** Então a minha query de baixo agora retorna somente esse funcionário.

**[04:57]** Mas como chegamos até aqui?

**[04:59]** Usamos uma subconsulta, um select dentro de outro.

**[05:03]** Primeiro eu crio este select interno.

**[05:06]** Esse select vai retornar o maior salário a partir da tabela de funcionários, considerando

**[05:13]** quem foi contratado no meio de fevereiro.

**[05:15]** Para essa query aqui eu preciso fazer group by?

**[05:19]** Não.

**[05:20]** Por quê?

**[05:21]** Porque eu só tenho a função de agregação no select.

**[05:23]** Olha lá.

**[05:24]** Então eu tirei o group by.

**[05:27]** O group by, em geral, traz problemas de performance.

**[05:30]** Ok?

**[05:31]** Então a subconsulta aqui me permitiu eliminar o group by e ainda assim usar a função

**[05:36]** max que é a função de agregação.

**[05:38]** Quando eu tivesse resultado, o que eu vou ter aqui?

**[05:41]** O maior salário, não é?

**[05:42]** Aí o que eu faço?

**[05:43]** Eu vou lá na tabela de funcionários, retorno o nome departamento aonde o salário foi igual

**[05:49]** o maior valor.

**[05:50]** Pronto.

**[05:51]** Exatamente a query que nós acabamos de criar e que retorna o resultado que nós precisamos.

**[05:58]** Em termos de sintaxe, as duas queries estão corretas.

**[06:02]** Mas observe que a primeira query com group by está retornando vários maiores valores.

**[06:08]** Na prática, veja que o resultado será muito granular, muito detalhado.

**[06:13]** Por quê?

**[06:14]** Porque eu tenho que fazer o agrupamento pelas outras duas colunas.

**[06:17]** Eu poderia ainda criar mais filtros nessa query.

**[06:20]** Aí o que vai acontecer?

**[06:22]** Essa query aqui vai ficar com uma performance ruim.

**[06:26]** Sendo que na outra query aqui embaixo eu consegui simplificar e tirei, por exemplo, a operação

**[06:30]** de group by.

**[06:32]** Viu como não adianta decorar?

**[06:34]** Se tentar decorar, já era.

**[06:36]** Não vai conseguir aprender SQL.

**[06:39]** Então decore.

**[06:40]** O curso vai trazer para você uma série de exemplos.

**[06:42]** Tem outros cursos de SQL aqui também na DSA.

**[06:45]** Aprenda sempre SQL olhando para o que você quer retornar.

**[06:49]** É a melhor forma de aprender a linguagem.

**[06:52]** Quando trabalharmos na criação dos DWs, eu vou trazer mais exemplos para você.

**[06:56]** Vamos usar a linguagem SQL e você vai levar o máximo de exemplos para casa.

**[07:00]** Pronto.

**[07:01]** Terminamos o script 02, onde já passamos pelo Baby, pelo Master.

**[07:06]** Vamos agora para o nível Ninja.

**[07:08]** Não perca.

**[07:09]** Nos encontramos no próximo vídeo.

**[07:10]** Até lá.
