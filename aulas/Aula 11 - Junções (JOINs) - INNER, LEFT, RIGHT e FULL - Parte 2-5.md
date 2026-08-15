# Aula 11 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 2-5.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 16:58:51

---

**[00:00]** Um erro bastante comum que impede muitas pessoas de aprenderem a linguagem SQL é ficar decorando

**[00:14]** sintaxes.

**[00:15]** Quando na verdade não precisa decorar, não é?

**[00:18]** Se você tiver uma ferramenta como o PGAdmin, ele gera uns bolsos iniciais para você, outras

**[00:23]** ferramentas também geram os bolsos iniciais de sintaxe SQL.

**[00:27]** Não adianta, não faz sentido ficar decorando sintaxe, é perda de tempo.

**[00:32]** Entenda o que estamos querendo retornar.

**[00:36]** É aí que está a chave para você aprender a linguagem SQL.

**[00:39]** Neste caso, o que eu queria?

**[00:41]** Nome e salário de todo mundo alocado em projeto.

**[00:45]** Observe que retornou quatro funcionários.

**[00:48]** Mas quantos funcionários eu tenho lá na minha tabela de funcionários?

**[00:52]** Você lembra?

**[00:53]** Vamos dar uma olhada?

**[00:54]** Vamos retornar aqui com o SELECT.

**[00:57]** Olha só, eu tenho cinco funcionários, não é isso?

**[01:01]** Está todo mundo cadastrado.

**[01:02]** Quando eu quis retornar somente quem está alocado em projeto, eu busquei exatamente

**[01:08]** correspondência do ID funcionário.

**[01:11]** Um dos funcionários não está alocado em projeto.

**[01:14]** Tudo bem?

**[01:15]** Sim, tudo bem.

**[01:16]** Em algum momento talvez não tenha, não é?

**[01:18]** Um funcionário alocado em um projeto.

**[01:21]** O InnerJoin vai retornar para você os registros se houver correspondência.

**[01:27]** Então o ID funcionário tem que existir em uma tabela e o FUNC ID tem que existir na

**[01:31]** outra.

**[01:32]** É igual?

**[01:33]** Então estabelece o relacionamento e retorna.

**[01:35]** Pronto.

**[01:36]** Isso é o que eu quero retornar com o InnerJoin.

**[01:39]** Sempre que houver correspondência, eu quero retornar.

**[01:42]** Só que a necessidade pode ser diferente, não é?

**[01:46]** Posso mudar a necessidade.

**[01:47]** Então, por exemplo, olha só o que eu tenho aqui agora para você.

**[01:50]** Eu quero isso aqui, hein?

**[01:53]** Atenção.

**[01:54]** Vou colocar aqui para você.

**[01:56]** Tem salário de todos os funcionários independente de estarem alocados em projetos.

**[02:04]** Agora ficou bacana.

**[02:06]** Eu tenho funcionário que não está alocado?

**[02:08]** Sim, eu tenho.

**[02:09]** Já vimos, não é?

**[02:11]** Eu quero mostrar todo mundo que está e todo mundo que não está alocado em projeto.

**[02:16]** Bom, eu posso usar esta query aqui para responder a essa questão?

**[02:21]** Não.

**[02:23]** Porque essa query só vai retornar quem estiver alocado.

**[02:27]** Mas eu também quero o pessoal que não está alocado.

**[02:30]** Eu quero mostrar para a gerência.

**[02:31]** A gerência precisa dessa informação.

**[02:33]** Então não dá para usar o InnerJoin.

**[02:36]** Veja a diferença do que é ficar decorando sintax do que você entender aquilo que está

**[02:41]** sendo retornado.

**[02:42]** Basicamente o que eu quero é o seguinte.

**[02:44]** Eu quero todo mundo que tiver a tabela funcionários.

**[02:48]** Ou seja, na tabela funcionário tem pessoas que estão alocadas em projetos e pessoas

**[02:54]** que não estão alocadas.

**[02:55]** Tudo bem, eu quero todo mundo.

**[02:58]** Mas e agora?

**[02:59]** Como que eu faço?

**[03:00]** Bom, de fato é super simples.

**[03:02]** Tira aqui o Inner e coloca o Left.

**[03:07]** Executa.

**[03:08]** Veja a mágica acontecendo.

**[03:09]** Olha lá.

**[03:10]** O que nós fizemos exatamente?

**[03:12]** Atenção.

**[03:14]** Com o LeftJoin eu estou dizendo o seguinte.

**[03:17]** Querido motor de execução SQL.

**[03:19]** Tudo bem com você?

**[03:20]** Tudo bem.

**[03:21]** Pois bem.

**[03:22]** O que eu quero é o seguinte.

**[03:24]** Retorne todo mundo da tabela da esquerda.

**[03:27]** Left é esquerda em inglês, não é isso?

**[03:29]** Todo mundo da tabela da esquerda.

**[03:31]** Se tiver correspondência na tabela da direita você traz.

**[03:34]** Se não tiver coloca nulo.

**[03:36]** Vou repetir para que não fique dúvidas.

**[03:38]** Querido motor da linguagem SQL.

**[03:41]** Retorne todo mundo na tabela da esquerda.

**[03:44]** Então a ordem das tabelas aqui é importante.

**[03:48]** Tabela da esquerda.

**[03:49]** Na tabela da direita retorne o que tiver de correspondência.

**[03:52]** O que não tiver você coloca nulo.

**[03:54]** Não foi isso que ele fez aqui?

**[03:56]** Trouxe todo mundo da tabela da esquerda, que é a tabela de funcionários, e na tabela

**[04:01]** da direita ele foi trazendo correspondência.

**[04:03]** Só que tem um funcionário que não está alocado em projeto.

**[04:06]** Então não tem como retornar um projeto.

**[04:08]** Ele coloca nulo.

**[04:10]** Simples, não?

**[04:11]** Mas o que acontece se eu inverter a ordem das tabelas?

**[04:16]** Aí você não pode mais usar o left.

**[04:17]** A lógica muda.

**[04:19]** Vamos fazer isso rapidamente?

**[04:21]** Nem estava previsto aqui, mas é sempre bom mostrar porque isso causa muitas dúvidas.

**[04:25]** Ok?

**[04:26]** Então vou fazer o seguinte.

**[04:27]** Daqui a pouco vou mostrar o right join.

**[04:28]** Mas vamos ainda para o left.

**[04:30]** Vou trazer para cá funcionários.

**[04:32]** Aqui eu vou colocar projetos.

**[04:35]** Aí aqui eu vou colocar o P.

**[04:37]** E aqui eu vou colocar o E.

**[04:39]** Pronto, mudei a ordem das tabelas.

**[04:41]** Mantive o restante igual.

**[04:42]** Estou fazendo aqui em tempo real durante a gravação do vídeo.

**[04:45]** Seleciona, executa.

**[04:48]** Opa!

**[04:49]** Mudou completamente o resultado.

**[04:51]** Concorda comigo?

**[04:52]** Neste caso o left mudou.

**[04:55]** O que nós queremos agora?

**[04:57]** Eu quero que ele retorne tudo na tabela da esquerda, que é a tabela de projetos.

**[05:02]** E eu quero que ele retorne o que tiver correspondência na tabela de funcionários.

**[05:06]** Pois bem.

**[05:08]** Mudou completamente o resultado.

**[05:10]** Veja que em termos de sintax é a mesma, não é?

**[05:14]** Mudou apenas a ordem das tabelas, mudou o resultado.

**[05:18]** O que eu observo no dia a dia é exatamente as pessoas tentando decorar sintax, por isso

**[05:22]** não conseguem aprender linguagem SQL.

**[05:24]** Quando na verdade tem que aprender isso aqui em cima.

**[05:27]** O que você quer retornar?

**[05:30]** Faça essa pergunta mil vezes se for necessário.

**[05:32]** O que você quer retornar?

**[05:34]** Quer retornar tudo que tiver correspondência?

**[05:36]** Usa inner join.

**[05:38]** Quer retornar tudo que tem na tabela da esquerda e se tiver correspondência na tabela da direita?

**[05:43]** Então você vai usar o left join.

**[05:46]** Pronto.

**[05:47]** Só que tem um problema.

**[05:49]** Está parecendo nulo.

**[05:51]** Você não vai entregar nulo no seu relatório, não é?

**[05:54]** Não faça isso.

**[05:55]** É horrível.

**[05:57]** Não entregue nulo, em hipótese alguma.

**[05:59]** Então resolvemos um problema e causamos outro, que é normal em tecnologia, não é?

**[06:04]** Cada vez que resolve um problema, a solução causa um novo problema.

**[06:08]** E aí nós temos um ciclo quase infinito.

**[06:10]** E por isso que tecnologia oferece sempre muita empregabilidade, não é?

**[06:14]** Bom, eu não vou entregar nulo para o meu gerente.

**[06:16]** Eu vou fazer isso.

**[06:17]** Então tem que resolver isso aqui.

**[06:19]** Eu preciso do relatório, mas não pode mostrar nulo.

**[06:22]** Bom, temos uma forma elegante de resolver isso aqui.

**[06:27]** Eu vou colocar outra função SQL para funcionar.

**[06:30]** A colete.

**[06:31]** O que a colete faz?

**[06:33]** Essa função vai retornar o nome do projeto quando existir.

**[06:37]** Se tiver nulo, eu vou colocar uma string, não alocado em projeto.

**[06:42]** Veja se não é uma solução mais elegante.

**[06:44]** Olha lá que coisa linda.

**[06:46]** Agora sim dá para você gerar o relatório e mandar para o seu gerente.

**[06:50]** Eu continuo com a mesma query.

**[06:52]** A diferença é que quando você usa o left ou right join, você provavelmente vai retornar

**[06:58]** valor nulo, porque pode não ter correspondência, não é?

**[07:02]** Com inner join, se tiver correspondência, ele vai retornar.

**[07:05]** Então a chance de ter nulo é quase nenhuma, não é?

**[07:08]** Quando você usa o left ou right, provavelmente vai ter algum valor nulo se não existir correspondência.

**[07:13]** Ele vai retornar, mas vai colocar o nulo.

**[07:16]** Você não pode deixar o nulo porque fica feio no relatório.

**[07:19]** Você vai lá e usa o colete, por exemplo, resolve o problema.

**[07:23]** Problema resolvido.

**[07:24]** Seguimos em frente.

**[07:25]** Muito obrigado e até a próxima aula.
