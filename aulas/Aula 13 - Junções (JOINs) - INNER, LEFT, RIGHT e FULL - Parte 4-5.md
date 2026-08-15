# Aula 13 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 4-5.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:02:13

---

**[00:00]** Eu vou explicar agora para você o full join, que resolve o problema que eu citei no finalzinho

**[00:13]** do vídeo anterior.

**[00:14]** Para explicar, vou mostrar aqui a historinha de tudo que fizemos ao longo dos vídeos anteriores,

**[00:19]** hein?

**[00:20]** Atenção!

**[00:21]** Primeiro eu queria nome e salário, 12 funcionários alocados em projetos.

**[00:26]** Então, se existir correspondência na tabela funcionário e tabela projetos, eu retorno

**[00:32]** essa correspondência.

**[00:34]** Neste caso eu uso o winner join.

**[00:36]** Vamos executar esta query, perfeito.

**[00:40]** Depois eu pedi o seguinte, nome e salário de todos funcionários, independente de estarem

**[00:46]** alocados em projetos.

**[00:48]** Então eu quero tudo na tabela da esquerda e se houver correspondência na tabela da

**[00:52]** direita, ele traz.

**[00:53]** Se não houver, deixa nulo.

**[00:55]** Excelente!

**[00:56]** Mudou o requerimento, retornei, não vou deixar nulo, resolvi esse problema usando

**[01:02]** collect.

**[01:03]** Tem outras formas de resolver usando case, por exemplo.

**[01:06]** Bom, depois mudou o requerimento.

**[01:09]** Nome de todos os funcionários alocados em projetos e os projetos sem funcionários alocados.

**[01:14]** Eu vou até melhorar isso aqui, ó.

**[01:16]** E os projetos com ou sem funcionários alocados.

**[01:21]** Pronto, fica ainda melhor aqui o título.

**[01:24]** Perfeito!

**[01:25]** Neste caso eu mantenho a ordem das tabelas, mas eu uso write, porque eu quero tudo na

**[01:29]** tabela da direita, se houver correspondência na tabela da esquerda, ele traz.

**[01:33]** Se não tiver, coloca nulo.

**[01:35]** Não vou deixar nulo, já coloco collect.

**[01:37]** Excelente!

**[01:38]** Agora observe o requerimento, hein?

**[01:41]** Nome de todos os funcionários alocados ou não em projetos e todos os projetos com ou

**[01:47]** sem funcionários alocados.

**[01:49]** Ou seja, aqui é uma mistura de left e right join.

**[01:53]** Tem uma instrução para isso que é o full join.

**[01:56]** Como eu já sei que vai acontecer valor nulo, eu já estou tomando uma decisão proativa.

**[02:02]** Já coloco collect para as duas colunas, porque eu sei que tem valor nulo neste caso.

**[02:07]** Mas a única diferença agora é exatamente o full join, que é bem diferente do inner

**[02:13]** join, hein?

**[02:14]** Retorna aqui, executa.

**[02:15]** Olha que relatório lindo.

**[02:17]** Olha só.

**[02:18]** Retornou o nome dos funcionários, retornou o nome dos projetos.

**[02:23]** Quando existe correspondência, ele mostra.

**[02:26]** O machado de Assis está alocado neste projeto.

**[02:30]** Aqui embaixo, veja que tem um projeto sem funcionário alocado.

**[02:33]** Aí ele coloca o texto que eu coloquei no collect.

**[02:36]** Bem como o José de Alencar não está alocado em projeto.

**[02:40]** Também colocou o texto conforme eu coloquei aqui em cima no collect.

**[02:43]** Deixa eu dar um enter aqui para subir a query.

**[02:46]** Pronto.

**[02:47]** Veja que é exatamente o texto alternativo que eu coloquei.

**[02:50]** Você concorda comigo que o full join é bem diferente do inner join?

**[02:56]** Muita gente confunde isso, hein?

**[02:57]** Muita gente.

**[02:58]** O inner join só retorna se existir correspondência.

**[03:04]** Só isso.

**[03:05]** Se não existir correspondência, aí você tem que escolher.

**[03:09]** Você quer tudo da tabela da esquerda?

**[03:11]** Usa left.

**[03:12]** Tudo da tabela da direita?

**[03:14]** Usa right.

**[03:15]** Quer tudo da tabela da direita e da esquerda?

**[03:17]** Usa o full join.

**[03:19]** Se não tiver a palavra inner, tiver apenas join, isso aqui é o inner join por padrão

**[03:25]** na linguagem SQAV.

**[03:27]** Eu espero que esses vídeos tenham servido para explicar de maneira bem clara, direta

**[03:33]** e objetiva algo que as pessoas têm muitas dúvidas, que é exatamente o uso das junções.

**[03:39]** Existe ainda o cross join, só que é um produto cartesiano.

**[03:43]** É algo que só faz sentido em situações muito específicas.

**[03:47]** Não é necessário aqui para o nosso contexto neste curso.

**[03:51]** E temos ainda o self join, que não tem uma cláusula específica, o inner join de uma

**[03:56]** tabela com ela mesma.

**[03:57]** O self join é quando eu faço isso aqui em cima, o inner join de uma tabela com ela mesma.

**[04:04]** Isso é útil quando eu quero aplicar algum tipo de recursividade, mas também não é

**[04:07]** relevante aqui para este curso, mas eu ensino no curso de SQL aqui na DSA.

**[04:12]** Está claro?

**[04:13]** Inner, left, join, right join, full join?

**[04:17]** Está claro mesmo?

**[04:18]** Então agora vamos fazer o seguinte.

**[04:20]** Você agora vai fazer o exercício, ok?

**[04:23]** Não pegue o script ao final do capítulo, está pronto?

**[04:27]** Ninguém vai ficar vigiando se você está fazendo ou não o exercício, ok?

**[04:30]** É você com você mesmo, você com a sua consciência.

**[04:33]** Dê um pause no vídeo, tente resolver esse primeiro item e tente resolver este segundo item, ok?

**[04:41]** Tenta resolver.

**[04:42]** Se não conseguir, ótimo, está aqui para aprender.

**[04:45]** Daqui a pouquinho eu vou explicar para você no próximo vídeo, então clique de distância.

**[04:49]** Mas tente resolver, até para você verificar o gap de conhecimento, a lacuna de conhecimento

**[04:54]** do que você já entendeu ou não.

**[04:56]** Se necessário, faça uma pesquisa complementar.

**[04:59]** Tente resolver esses dois itens aqui, ok?

**[05:01]** Eu quero média de salário nos departamentos com funcionários alocados em projetos e eu

**[05:06]** quero média de salário nos departamentos com funcionários alocados em projetos, cuja

**[05:10]** data de contratação do funcionário tem a si no dia 10 de qualquer mês ou ano.

**[05:15]** Só para deixar mais animado, não é?

**[05:17]** Se facilitar, não tem graça, não é?

**[05:20]** Tente resolver, coloca aí as duas queries, decida se você vai usar inner join, left,

**[05:26]** right, full.

**[05:28]** Não decore a sintaxe, escolha de acordo com aquilo que eu quero retornar.

**[05:33]** Tente montar as queries aí, eu já trago o resultado no próximo vídeo.

**[05:36]** Muito obrigado e até lá.
