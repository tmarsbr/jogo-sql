# Aula 15 - Subconsultas e CTEs (Common Table Expressions) - Parte 1-3.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:08:08

---

**[00:00]** O outro aspecto da linguagem SQL é que em muitos casos você vai ter mais de uma solução

**[00:15]** possível para o mesmo problema.

**[00:19]** Não é uma única solução o tempo inteiro.

**[00:22]** Você pode resolver de maneiras diferentes.

**[00:25]** Por exemplo, eu usei o left join e eu usei o right join.

**[00:29]** Eu poderia ter resolvido tudo com left join apenas mudando a ordem das tabelas.

**[00:35]** Ou seja, ou eu uso right join, não muda a ordem das tabelas.

**[00:39]** Ou eu uso left join e eu mudo a ordem das tabelas.

**[00:42]** São duas possibilidades para chegar à solução do problema.

**[00:46]** Isso é muito comum quando trabalhamos com SQL.

**[00:49]** Então, observe o que eu tenho aqui agora para você.

**[00:52]** Eu quero algo simples.

**[00:55]** Eu quero funcionários com um salário maior do que 21,900.

**[01:01]** Retorna isso aí para mim.

**[01:02]** Lembrando que sempre tem mais de uma forma de fazer a mesma coisa.

**[01:06]** Nós temos que nos preocupar também com a questão da performance da query.

**[01:12]** Eu não estou tratando isso ainda.

**[01:13]** Eu vou trazer já já para você um exemplo.

**[01:16]** Mas primeiro, se preocupe em entender como montar a query.

**[01:21]** Depois, se preocupe em como montar a melhor query possível de acordo com a performance

**[01:26]** que você deseja.

**[01:28]** São dois passos.

**[01:29]** Tem muita gente que tenta fazer tudo ao mesmo tempo.

**[01:31]** E é claro que demora para aprender SQL.

**[01:34]** Primeiro se preocupe em aprender como montar uma query.

**[01:37]** Aprendeu?

**[01:38]** Consegue agora estruturar a lógica?

**[01:41]** Ótimo, excelente.

**[01:42]** Agora então vamos nos preocupar com performance.

**[01:45]** Daqui a pouco eu também vou discutir isso aqui com você.

**[01:48]** Porque quando você vai trabalhar com ETL ou efetuar a carga em um data warehouse ou

**[01:52]** banco de dados qualquer, a performance é um fator determinante.

**[01:57]** Mas antes de aprender a correr, tem que aprender a andar.

**[01:59]** Não tem jeito.

**[02:00]** Então aprenda primeiro a montar a sequência da sua query, montar a lógica.

**[02:05]** Depois se preocupe com performance.

**[02:07]** Tente resolver isso aí para mim.

**[02:08]** Dá um pause no vídeo, tenta resolver.

**[02:11]** Vou trazer uma proposta de solução.

**[02:13]** Vou trazer para você o CTE.

**[02:16]** Vou colocar aqui agora.

**[02:18]** Você vai encontrar uma nó em PDF na sequência explicando exatamente o que são os CTEs.

**[02:22]** E aqui está.

**[02:24]** Tudo isso aqui é uma instrução SQL.

**[02:27]** Mas como assim estruturou?

**[02:29]** Tem um SELECT ali embaixo.

**[02:31]** Eu vou executar o SELECT apenas.

**[02:33]** Ok?

**[02:34]** Só o SELECT.

**[02:35]** Opa!

**[02:36]** Mensagem de erro.

**[02:37]** Então aparentemente é alguma coisa estranha.

**[02:41]** De fato eu não tenho o SELECT apenas.

**[02:43]** Eu tenho isso aqui.

**[02:46]** Tudo isso aqui é uma query que é chamada de CTE.

**[02:49]** Já tem uma nó em PDF para você explicando o conceito e escrevendo em mais detalhes o

**[02:53]** que é isso.

**[02:54]** Mas vejamos aqui o que estamos fazendo.

**[02:57]** Em alguns cenários pode ser interessante você criar uma tabela temporária.

**[03:03]** Você não quer criar outra tabela no seu banco de dados.

**[03:06]** Ok?

**[03:07]** Por quê?

**[03:08]** Porque de repente a tabela vai ficar muito grande, vai ter que gravar isso em disco.

**[03:12]** Não faz sentido.

**[03:14]** Você pode criar uma tabela temporária que vai existir somente na memória do computador

**[03:19]** no momento que você estiver executando a query.

**[03:22]** Isso pode ser mais rápido.

**[03:24]** Uma alternativa é sempre criar uma tabela depois no disco.

**[03:27]** Você pode criar uma cópia de uma tabela, você pode criar uma outra tabela a partir

**[03:31]** de um SELECT.

**[03:32]** Acabou que eu vou trazer um exemplo também.

**[03:34]** Mas eu posso criar tabelas temporárias.

**[03:36]** E é isso que eu estou fazendo com o CTE.

**[03:39]** Observe que eu tenho primeiro aqui a cláusula WITH.

**[03:42]** Depois disso eu tenho um nome.

**[03:44]** Esse nome é de uma tabela temporária.

**[03:48]** Essa tabela aqui, funcionários, salários mais altos, só vai existir na memória do

**[03:53]** computador durante a execução.

**[03:56]** Se você observar o SELECT aqui embaixo, veja que eu estou fazendo o SELECT exatamente nessa

**[04:00]** tabela.

**[04:01]** Quando eu executo apenas o SELECT, dá o erro.

**[04:05]** Por que dá o erro?

**[04:06]** Vamos ler aqui o erro.

**[04:08]** Essa relação, chamada funcionários, salários mais altos, não existe.

**[04:12]** Sim, não existe.

**[04:14]** Porque é uma tabela temporária.

**[04:16]** Ela não existe em disco.

**[04:17]** Está vendo aqui a tabela?

**[04:18]** Vamos dar um refresh.

**[04:19]** Vem aqui e dá um refresh.

**[04:20]** Tem essa tabela aqui?

**[04:22]** Não.

**[04:23]** É por isso que o SELECT sozinho não funciona.

**[04:26]** De fato, o que eu estou dizendo aqui é o motor execução, esse que é o seguinte.

**[04:30]** Crie essa tabela temporária como sendo o resultado desta query.

**[04:35]** Aí eu estou fazendo nome e salário, nome e salário da tabela de funcionários, onde

**[04:40]** o salário é maior que 21,900, que é o que eu quero.

**[04:43]** Então o que ele vai fazer?

**[04:44]** Ele vai executar esse SELECT interno, vai retornar algumas linhas, não é isso?

**[04:50]** Essas linhas eu vou chamar de tabela, funcionários, salários mais altos.

**[04:54]** E aí eu venho aqui embaixo e faço o SELECT.

**[04:58]** Seleciona tudo isso aqui, executa e pronto.

**[05:00]** Aí está o resultado para você.

**[05:03]** Muitas vezes isso aqui vai te salvar em termos de performance.

**[05:07]** Dá para resolver de outras formas, mas que talvez vão te dar uma performance inferior.

**[05:13]** Não há regra mágica, ok?

**[05:16]** Sempre que eu usar o CTE vai ser melhor, escritor?

**[05:19]** Não.

**[05:20]** Sempre tem que analisar o plano de execução, que eu vou ensinar daqui a pouco para você.

**[05:24]** O plano de execução vai te dizer se a sua query é boa ou não em termos de performance

**[05:29]** para esse banco de dados, para essas tabelas, para esse computador.

**[05:35]** Você pode pegar os mesmos dados, levar para outro computador, em outro SGBD, e essa query

**[05:40]** ser pior ou melhor.

**[05:42]** Muita gente ignora o fato de que tudo isso aqui que nós estamos fazendo é executado

**[05:47]** aonde?

**[05:48]** No computador, não é?

**[05:49]** Tem aluno que, de vez em quando, manda mensagem aqui na DSA, porque ele conseguiu uma performance

**[05:55]** sim melhor ou pior do que eu mostro em algumas aulas.

**[05:59]** Ele pergunta, mas como isso é possível?

**[06:02]** A minha query no meu computador executou em mais ou menos tempo.

**[06:06]** Por que isso aconteceu?

**[06:07]** É porque o computador faz parte desse processo, concorda?

**[06:13]** Dentro do computador você tem o seu processador, o Core i5, o Core i7, tem o M1, o M2, tem

**[06:19]** a AMD.

**[06:20]** Cada processador tem uma capacidade computacional.

**[06:24]** Então uma query pode ser muito boa ao executar em um computador e pode ser terrível em outro

**[06:31]** computador.

**[06:32]** Então não dá pra dizer que o CTE vai ser sempre melhor ou pior.

**[06:37]** Eu sempre tenho que analisar o plano de execução.

**[06:40]** É ele que vai me dizer se a query está boa ou não.

**[06:42]** Daqui a pouquinho eu vou ensinar você como ler o plano de execução.

**[06:46]** Tudo bem?

**[06:47]** Só que além da questão de performance, essa instrução CTE me permite aplicar filtros

**[06:54]** aos dados, colocar isso em uma tabela temporária na memória, que é muito mais veloz do que

**[07:00]** a leitura do disco, e executar uma query talvez de forma mais rápida.

**[07:05]** Desta forma eu coloco o filtro que eu quero dentro da ClaslaWiF, observe que eu tenho

**[07:10]** abre e fecha parênteses, ele cria a tabela temporária, depois eu dou o select nessa

**[07:15]** tabela.

**[07:16]** Agora observe isso aqui, hein?

**[07:19]** Atenção, vou deixar pra você ficar pensando sobre isso.

**[07:24]** Eu modifiquei o CTE, modifiquei a query.

**[07:27]** Eu quero agora funcionários com um salário maior que R$ 21.900.

**[07:32]** Eu vou complementar aqui pra você.

**[07:35]** Contratados no dia 10.

**[07:38]** Aí eu usei o Stracty com Wair, que eu tinha usado anteriormente, não foi?

**[07:43]** Aí eu vou executar e vai ter um erro.

**[07:47]** Por que deu essa mensagem de erro?

**[07:49]** Explique o porquê.

**[07:51]** Dê um pause no vídeo, reflita sobre a query, leia o erro e diga por que este erro aconteceu,

**[07:58]** melhor ainda, não é?

**[07:59]** Como resolvemos?

**[08:00]** No próximo vídeo eu trago a resposta pra você.

**[08:04]** Até lá.
