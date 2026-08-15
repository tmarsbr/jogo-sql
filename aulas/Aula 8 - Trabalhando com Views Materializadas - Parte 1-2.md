# Aula 8 - Trabalhando com Views Materializadas - Parte 1-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:56:17

---

**[00:00]** As views que eu mostrei para você nos vídeos anteriores

**[00:10]** são amplamente usadas em bancos de dados e também amplamente usadas em data houses,

**[00:16]** uma forma de você padronizar os relatórios.

**[00:19]** Ou seja, ao invés de ter cada usuário criando os relatórios com queries diferentes

**[00:26]** e correndo risco de um usuário que não tem conhecimento em SQL gerar relatórios errados,

**[00:31]** você padroniza os relatórios através de views.

**[00:35]** Então alguém cria as queries, alguém com conhecimento em SQL, claro, coloca lá os

**[00:40]** campos necessários, faz os joins entre as tabelas, coloca os filtros e você cria uma view.

**[00:46]** O usuário final vai acessar sempre a view. Independente de quem estiver acessando,

**[00:52]** a view será sempre o mesmo, porque assim você consegue, não é padronizar o uso de relatórios.

**[00:57]** Só que as views têm um problema, cada vez que executar uma view, a query dentro da view é executada.

**[01:04]** Então se tiver muita gente executando a view, isso pode causar problemas de performance.

**[01:09]** Se as tabelas que compõem a query dentro da view forem grandes, pode causar problemas de performance.

**[01:16]** E agora, como resolvemos isso? Resolvemos com as views materializadas, ou materialize de views.

**[01:23]** Observe que tem um grupo aqui, aparece aqui em cima, aqui embaixo são as views,

**[01:27]** aqui as materialize de views.

**[01:29]** Primeiro, deixa eu mostrar aqui de novo pra você, exatamente o código para criar a view.

**[01:36]** Create view, o nome e a query, certo?

**[01:41]** Agora eu vou trazer pra você o código para criar a materialize de view.

**[01:45]** Você não vai acreditar, hein? Atenção, aqui está.

**[01:49]** Compara os dois códigos aí pra mim. Percebeu que são idênticos, com apenas uma diferença?

**[01:56]** Eu usei a mesma query, não tem problema, pode usar a mesma query.

**[01:59]** Eu vou criar dois objetos diferentes no banco de dados com a mesma query.

**[02:03]** A única diferença de um bloco de código pra outro qual é?

**[02:06]** Essa palavrinha aqui, materialized, é um detalhe, mas um detalhe que faz uma diferença absurda.

**[02:14]** Vai tornar aqui o objeto completamente diferente no banco de dados.

**[02:18]** Então quando você cria a view, você está salvando a query no banco.

**[02:23]** Fez uma chamada, aquela view executou um select, a query será executada.

**[02:28]** Só que isso pode causar problemas. Então qual é a ideia?

**[02:32]** Vamos executar a mesma query e vamos salvar o resultado como uma tabela no banco de dados.

**[02:39]** Só que essa tabela é chamada de view materializado.

**[02:42]** É basicamente esse o conceito. Eu estou dando o nome MV e funcionar os projetos.

**[02:47]** Então executa, pronto, view materializada, criada com sucesso, faz um refresh aqui do lado, veja que já aparece.

**[02:54]** Agora vamos selecionar os dados a partir da MView. MView é view materializada, né?

**[02:59]** Aí está o resultado pra você, certo?

**[03:01]** Olha lá, excelente o relatório com os funcionários alocados em projetos.

**[03:06]** Agora eu vou trazer pra você o select da view, hein?

**[03:12]** Olha aqui, uma diferença sutil. Aqui é VW, aqui é MV, VW é a view.

**[03:19]** Opa, os dois relatórios são idênticos, não é, instructor?

**[03:22]** Ou seja, a mesma coisa, instructor? Não, não é a mesma coisa. Isso é que é legal.

**[03:28]** Quando você executa view, a query lá dentro é que foi executada.

**[03:33]** Quando você executou o select, ele não executou a query.

**[03:38]** Ele executou de fato a consulta tabela criada pela query.

**[03:43]** Vou provar isso já já pra você dentro de alguns instantes.

**[03:46]** Pra ficar ainda mais claro, vamos fazer o seguinte, eu vou mostrar isso daqui a pouquinho.

**[03:50]** Mas vamos colocar aqui na frente, explain, ok? Vem aqui na frente do select, digita, explain.

**[03:58]** Ou seja, é de explicar, não é em inglês. Só colocar aqui na frente, explain.

**[04:02]** Coloca, executa view. Executa, olha lá.

**[04:06]** Esses passos são os passos necessários do banco de dados pra poder retornar o resultado.

**[04:12]** Isso aqui é execução da query dentro da view.

**[04:15]** Agora faz a mesma coisa com a view materializada.

**[04:20]** Uso explain. Executa, opa, apenas uma consulta.

**[04:26]** É porque de fato eu fui a tabelinha criada com o resultado da query.

**[04:32]** Eu não executei mais a query que tá na view.

**[04:35]** Eu executei uma consulta tabela criada pela query.

**[04:38]** Isso resolve o problema, excelente.

**[04:41]** Não tenho mais que ficar executando aquela query o tempo inteiro.

**[04:45]** Basta você fazer uma chamada diretamente a view.

**[04:49]** Ele não executa a query e vai direto no seu relatório. Vai ficar muito mais rápido.

**[04:53]** Quando criamos MViews, por sinal, em geral, os usuários finais ficam maravilhados.

**[04:58]** Nossa, meu relatório agora tá muito mais rápido.

**[05:01]** Eu nem acredito. Você parece um mágico.

**[05:04]** Você resolveu um problema de performance que tava aqui conosco há tanto tempo.

**[05:07]** O que você fez?

**[05:09]** Aí eu respondo, eu só criei uma MView.

**[05:12]** É porque eu conheço do banco de dados, eu sei que MView resolve o problema.

**[05:15]** E às vezes é tudo que o cliente precisa. É curioso, não é?

**[05:18]** Pois bem, mas peraí.

**[05:21]** Temos um problema. Você sabe, tecnologia é assim, não é?

**[05:24]** Tem um problema, você encontra a solução, a solução gera um novo problema.

**[05:27]** Aí você resolve, tem a solução que gera um novo problema numa cadeia infinita.

**[05:31]** É por isso que tecnologia sempre traz muita empregabilidade.

**[05:34]** Temos um problema.

**[05:37]** Vou mostrar o problema pra você no próximo vídeo.

**[05:40]** Não perca, hein?
