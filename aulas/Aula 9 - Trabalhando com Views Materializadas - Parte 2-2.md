# Aula 9 - Trabalhando com Views Materializadas - Parte 2-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:58:35

---

**[00:00]** Vejamos então o problema da mVille, da biomaterializada, que não é necessariamente um problema,

**[00:14]** uma característica do objeto, mas se você não estiver atento a isso, vai se tornar

**[00:19]** um problema.

**[00:20]** Olha só o que eu vou fazer, hein?

**[00:22]** Eu vou inserir mais um registro na tabela de funcionários.

**[00:27]** Vou inserir agora o funcionário Cora Coralina, que é Analytics Engineer, que aí tem a data

**[00:32]** de contratação, salário, etc.

**[00:35]** Pronto, acabei de inserir o novo funcionário, hein?

**[00:40]** Bom, se eu executar o meu relatório utilizando a Ville, o que eu espero encontrar?

**[00:46]** O novo funcionário, não é isso?

**[00:48]** Então executa, veja que Cora Coralina já está aparecendo, ou seja, isso prova que

**[00:55]** a Ville de fato executa query.

**[00:57]** Então eu inserir o registro na tabela original, a Ville foi executada, executa query dentro

**[01:03]** dela, busca direto da fonte.

**[01:06]** Excelente!

**[01:07]** E o que será que vai acontecer quando eu executar a mVille?

**[01:12]** Agora é mVille, hein?

**[01:14]** Atenção, executa...

**[01:16]** Opa!

**[01:17]** Cadê a Cora Coralina?

**[01:20]** Sumiu?

**[01:21]** Não!

**[01:22]** A Cora Coralina está lá na tabela original, a qualquer momento você executa Ville, ela

**[01:27]** vai aparecer no seu relatório.

**[01:29]** Só que a mVille, como eu disse, não está executando query, ela está executando uma

**[01:35]** consulta tabela criada pela query.

**[01:38]** Só que essa tabela criada pela query agora está desatualizada.

**[01:43]** Por quê?

**[01:44]** Porque tem registro novo na tabela original, só que a mVille não se atualiza sozinha.

**[01:49]** Esse é um processo manual ou então você automatiza o refresh da mVille?

**[01:55]** Como eu disse, temos um problema, encontramos a solução e a solução gera um novo problema.

**[02:00]** E é uma cadeia infinita, eu trabalho com tecnologia há quase 30 anos, tem sido assim

**[02:05]** ao longo de todo esse tempo.

**[02:07]** Cada solução para um problema em geral gera um ou dois novos problemas, é impressionante.

**[02:11]** Bom, a mVille é muito boa porque ela evita problemas de performance no banco de dados.

**[02:18]** Você pega o relatório e coloca uma tabela, essencialmente é isso.

**[02:21]** Em contrapartida, tem um outro lado, a mVille pode ficar desatualizada.

**[02:27]** E aí o pessoal está olhando o relatório, olha, não tem aqui cora coralina.

**[02:31]** Sim, é porque agora o relatório está desatualizado.

**[02:35]** E aí o que temos que fazer?

**[02:37]** Atualizar a mVille, que aí é um processo chamado de refresh.

**[02:42]** Basicamente você executa este comando, refresh materialize de Ville.

**[02:47]** E quando você faz isso, aí o banco de dados vai até a tabela, ou tabelas, não é, originais,

**[02:53]** que estão mencionadas na query, ele volta às tabelas originais, executa a query neste

**[02:58]** momento e alimenta de novo a tabela gerada pela query da materialize de Ville.

**[03:04]** Interessante, não?

**[03:05]** Eu já sei a sua pergunta, não tenho bola de cristal, mas já conheço as perguntas dos

**[03:09]** alunos aqui, são muitos anos me estalando o curso na DSA.

**[03:13]** Distrutor, eu quero automatizar então esse refresh.

**[03:17]** Tem várias formas de fazer isso.

**[03:18]** Você pode criar um job no próprio banco de dados, no nosso caso o SGBD, que é o Postgre,

**[03:23]** ou então você pode criar um script e agendar por um agendador de tarefa operacional, no

**[03:28]** Windows, por exemplo, no Mac, no Linux.

**[03:30]** O fato é, esse refresh aqui tem que ser realizado.

**[03:35]** Ou você faz de maneira manual, como eu vou fazer agora, ou você pega este comando e

**[03:39]** coloca algum script e automatiza o processo.

**[03:43]** Os SGBDs oferecem recursos para você automatizar o refresh de views materializadas.

**[03:48]** Agora, quando você executar a query, olha lá quem vai aparecer, Cora Coralina.

**[03:54]** Pronto, agora os dois entregam a mesma coisa.

**[03:57]** Entendeu o problema?

**[03:59]** Como eu disse, não é necessariamente um problema, é uma característica da MView, mas pra que

**[04:04]** você está criando tudo isso aqui?

**[04:06]** Pra quê?

**[04:07]** Pra criar relatórios, não é?

**[04:08]** Então se o relatório fica desatualizado, acaba se tornando um problema.

**[04:12]** Então você usa uma ou outra, não é essa agora a próxima pergunta natural.

**[04:17]** Você usa as views pra que você possa padronizar, consolidar os seus relatórios.

**[04:23]** Ou seja, todo mundo vai ter a mesma visão, exatamente esse é o objetivo da view.

**[04:28]** Ali dentro você vai colocar a lógica, vai colocar os joins, os filtros e vai executar

**[04:33]** aquele relatório quantas vezes você quiser.

**[04:35]** O usuário final não deve ficar executando query diretamente, deve executar a chamada

**[04:41]** view e a sua view está padronizada.

**[04:44]** Pra relatório não é nada melhor.

**[04:46]** Para view materializada, a questão é, você está tendo um problema de performance com

**[04:51]** a view?

**[04:52]** Se não tiver tendo problema de performance, use a view, tudo bem, vai adicionar normalmente.

**[04:56]** Excelente, até porque você não tem a etapa adicionar do refresh, não é?

**[05:00]** Então está tendo um problema de performance?

**[05:02]** Não?

**[05:03]** Use a view.

**[05:04]** Está tendo problema de performance?

**[05:05]** Começou a ficar lenta a consulta, etc?

**[05:08]** Então você cria a view materializada.

**[05:10]** Só que aí você sabe, vai ter um passo adicional que é fazer o refresh periódico.

**[05:15]** Tem empresa que faz o refresh uma vez por dia, à noite, tem empresa que faz o refresh

**[05:19]** a cada hora, dependendo do volume de dados, tem empresa que faz duas vezes por dia, meio

**[05:24]** dia, meia noite, por exemplo.

**[05:26]** Mas se não fizer o refresh, aí você vai ficar com seu relatório desatualizado, pense

**[05:31]** nisso.

**[05:32]** Tem ainda uma outra questão.

**[05:34]** Às vezes o refresh falha?

**[05:37]** Então quando você automatiza o processo, cria um job, por exemplo, pode ser que fale,

**[05:42]** por alguma razão, o seu refresh.

**[05:45]** Então tem que tomar esse cuidado.

**[05:47]** Mas a view materializada resolve problemas de performance, porque não vai estar executando

**[05:52]** aquela query da view o tempo inteiro.

**[05:54]** De fato, só precisa executar a query dentro da view quando faz o refresh, somente nesse

**[05:59]** momento.

**[06:00]** Quando o usuário fizer o select, ele não está indo às tabelas originais, está indo

**[06:05]** à tabela que nós criamos.

**[06:07]** Como nesse caso já é uma tabela consolidada, então a performance é simplesmente absurda,

**[06:12]** muito maior do que se você usar a view, principalmente para grandes volumes de dados.

**[06:16]** Aprendeu mais uma?

**[06:18]** Anotou aí no seu caderninho?

**[06:20]** Então continue comigo, nós temos mais.

**[06:22]** Já nos encontramos no próximo vídeo.

**[06:24]** Até lá.
