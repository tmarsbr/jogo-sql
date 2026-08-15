# Aula 12 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 3-5.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:00:11

---

**[00:00]** Vamos continuar com as junções, e aí eu vou fazer o seguinte, hein?

**[00:10]** Vou até fechar esse query tool, vou abrir outro, dar um refresh aqui para mostrar as

**[00:16]** tabelas, abre outro, e aí eu vou colocando as queries aqui agora todas na sequência

**[00:21]** para ficar mais fácil para você compreender.

**[00:24]** Então olha só, a primeira query eu queria, nome e salário dos funcionários alocados

**[00:29]** em projetos.

**[00:30]** Então eu só quero retornar se houver correspondência.

**[00:33]** Então eu uso innerJoin.

**[00:35]** Depois, na outra query, eu quero nome e salário de todos os funcionários, independente de

**[00:41]** estarem alocados em projetos.

**[00:43]** Então eu quero todo mundo na tabela da esquerda, e se tiver correspondência, retorna na tabela

**[00:47]** da direita, se não tiver correspondência, coloca nulo.

**[00:50]** Foi exatamente o que aconteceu, executa, e aí está.

**[00:54]** Só que eu não vou colocar nulo no meu relatório, fica feio.

**[00:57]** Então eu uso a função colete, se tiver nulo, eu coloco uma string qualquer.

**[01:01]** Pronto, agora está bonito.

**[01:04]** Vamos então para a próxima query.

**[01:06]** Deixa eu chegar aqui para o lado, depois eu vou expandir aqui o resultado.

**[01:11]** O que eu quero agora é o seguinte, hein?

**[01:14]** Atenção, eu quero nome e salário de todos os funcionários alocados em projetos e os

**[01:20]** projetos sem funcionários alocados.

**[01:23]** Lembra que quando eu preenchi a tabela projetos, eu deixei um projeto sem funcionário alocado?

**[01:29]** Lembra disso?

**[01:30]** Pois bem, eu quero retornar, eu quero mostrar esse projeto na minha query no meu resultado.

**[01:35]** Bom, uma alternativa é você mudar as tabelas de lugar na sua query.

**[01:41]** Dá para fazer isso, você continua usando o left, ele vai retornar tudo na tabela da

**[01:45]** esquerda, e o que tiver correspondência na tabela da direita, ele retorna se não retorna nulo.

**[01:49]** É uma opção.

**[01:51]** Vou então uma opção mais elegante, que demonstra que você realmente conhece linguagem

**[01:56]** SQL, é isso aqui.

**[01:58]** Vou colocar aqui para você completo.

**[02:02]** Eu vou manter a mesma ordem das tabelas, observe aqui, só que agora eu vou usar o right.

**[02:08]** O raciocínio é o mesmo do left.

**[02:10]** O que eu vou fazer?

**[02:11]** Eu quero tudo na tabela da direita.

**[02:14]** Se tiver correspondência na tabela da esquerda, retorna, se não tiver correspondência, coloca

**[02:18]** nulo.

**[02:19]** Você já sabe que não vai deixar nulo, então já coloquei o colete aqui para você, para

**[02:23]** poder substituir o nulo por uma string.

**[02:25]** Pronto, executa a query, clica lá em cima, sobe aqui um pouquinho, pronto.

**[02:31]** Olha só que coisa bonita.

**[02:33]** Veja que ele trouxe todos os projetos.

**[02:36]** Se tinha funcionário alocado, ele trouxe o nome.

**[02:39]** Esse aqui, esse último projeto, não tinha ninguém.

**[02:41]** Eu cadastrei assim, lembra?

**[02:43]** Então ao invés de nulo eu coloco, sem funcionário alocado.

**[02:47]** A única coisa que eu fiz foi indicar ao motor da linguagem SQL que agora eu quero olhar

**[02:57]** para tudo na tabela da direita.

**[03:00]** Com left eu quero olhar para tudo na tabela da esquerda.

**[03:03]** Se eu quiser correspondência completa, eu uso inner join.

**[03:07]** Tudo bem até aqui?

**[03:08]** Tranquilo?

**[03:09]** E se eu quiser tudo na tabela da direita e da esquerda, se por acaso não tiver correspondência?

**[03:16]** Eu quero tudo agora, independente de ter ou não correspondência.

**[03:19]** Não posso usar o inner join.

**[03:20]** O inner join só retorna tudo se tiver correspondência.

**[03:24]** Eu quero retornar tudo tendo ou não correspondência.

**[03:28]** O que eu faço?

**[03:30]** Eu conto para você no próximo vídeo.

**[03:32]** Muito obrigado e até lá.
