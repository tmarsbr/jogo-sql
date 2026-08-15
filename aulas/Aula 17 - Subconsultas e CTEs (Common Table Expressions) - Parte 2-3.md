# Aula 17 - Subconsultas e CTEs (Common Table Expressions) - Parte 2-3.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:09:30

---

**[00:00]** E então, consegue explicar essa mensagem de erro?

**[00:11]** Se você entendeu o que é essa expressão CTE, então você já entendeu porque o erro

**[00:17]** está acontecendo.

**[00:18]** Vamos interpretar juntos, ok?

**[00:22]** Error, coluna, data contratação, não existe.

**[00:27]** E aponta aqui na query onde está sendo usada a coluna data contratação.

**[00:32]** Mas espera aí, essa coluna existe, não é?

**[00:35]** Vamos dar uma olhada na tabela de funcionários.

**[00:37]** Vou retornar aqui para você.

**[00:39]** Tabela de funcionários, hein?

**[00:41]** Executa, olha lá, data contratação, existe a coluna.

**[00:47]** Então como ele pode estar reclamando que a coluna não existe?

**[00:51]** Sim, a coluna data contratação não existe aonde?

**[00:57]** Não existe na tabela temporária.

**[01:00]** Volta aqui em cima, olha a tabela temporária.

**[01:03]** Essa tabela é o resultado desta query.

**[01:06]** Eu estou retornando data contratação na query?

**[01:09]** Não.

**[01:10]** Então, essa tabela temporária, ela só tem duas colunas, nome e salário.

**[01:16]** Porque é isso que eu estou retornando nessa query interna.

**[01:20]** Quando eu tento aqui aplicar o error usando data de contratação, ele opa, mas não existe

**[01:25]** essa coluna na tabela temporária.

**[01:27]** Está certíssimo.

**[01:28]** E como resolvemos esse problema?

**[01:30]** É super fácil.

**[01:31]** Olha aqui, eu agora vou alterar meu CTE para colocar data de contratação na query interna.

**[01:38]** Então agora esse resultado vai ter a coluna.

**[01:42]** Quando eu fizer agora o SELECT usando a tabela temporária, pronto, agora vai funcionar perfeitamente.

**[01:49]** Entendeu o conceito agora?

**[01:52]** Se não tinha ficado antes, às vezes a mensagem de erro ajuda você a entender o conceito

**[01:57]** melhor do que quando tudo funciona.

**[02:01]** Eu estou tentando fazer aqui um trabalho na DSA, nos cursos que eu ministro, para tirar

**[02:05]** o medo que os alunos têm de mensagem de erro.

**[02:08]** Estou fazendo um trabalho de ajuste na mentalidade.

**[02:12]** Não tenha medo de mensagem de erro.

**[02:14]** Ela pode ser, na verdade, uma das melhores coisas que pode acontecer.

**[02:18]** Porque mensagem de erro vai mostrar para você o que está acontecendo claramente.

**[02:23]** Aí você lê a mensagem, você interpreta e fica bem mais fácil compreender o conceito.

**[02:29]** Se eu tiro daqui data contratação, a minha tabela temporária simplesmente não tem mais

**[02:35]** a coluna.

**[02:37]** Então consequentemente vai dar erro aqui no SELECT, porque eu estou usando a coluna

**[02:41]** para filtrar com a Clause of Aware.

**[02:44]** A forma de resolver isso é você adicionar a data contratação lá na tabela temporária.

**[02:49]** Você coloca isso dentro da query no seu CTL.

**[02:52]** Aprendeu mais uma?

**[02:53]** Anotou aí no seu caderninho.

**[02:55]** Isso aqui é valiosíssimo, hein?

**[02:57]** Quando usamos ETL, quando aplicamos processos ETL com linguagem SQL, isso aqui pode ser

**[03:03]** a diferença.

**[03:04]** Então um processo ETL que leva cinco horas e um processo ETL que leva cinco minutos.

**[03:10]** Por quê?

**[03:11]** Porque muita gente usa SQL fazendo a leitura dos dados no disco, o que é muito mais lento.

**[03:18]** Se eu posso fazer um agrupamento na memória do computador, isso é muito mais rápido.

**[03:24]** Então durante o processo de carga, um CTE pode simplesmente reduzir de forma drástica

**[03:30]** a maneira como você carrega dados, principalmente em um data warehouse, que em geral tem um

**[03:35]** volume de carga de dados muito alto.

**[03:37]** Vamos finalizar essa parte master agora com a subconsulta.

**[03:42]** Lembrando que tudo isso que eu estou mostrando estou no script 02.

**[03:46]** Então 01 é o baby, 02 é o master, daqui a pouco tem o ninja, que é o 03, ok?

**[03:52]** Aqui mesmo nesse capítulo, daqui a pouquinho, não perca.

**[03:55]** Vamos agora concluir o 02 com as subconsultas.

**[03:58]** Nos encontramos no próximo vídeo.

**[04:00]** Até lá.
