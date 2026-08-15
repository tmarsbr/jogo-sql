# Aula 3 - Preparando o Banco de Dados.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:14:31

---

**[00:00]** Vamos, então, começar a nossa caminhada. Vamos começar estudando linguagem SQL para

**[00:13]** engenheiros de dados. E é muito importante que você acompanhe as aulas na sequência.

**[00:21]** Todo curso foi pensado de maneira sequencial, ok? Pois bem, vamos começar preparando nosso

**[00:28]** sistema de banco de dados. De fato, nós já até fizemos isso no capítulo anterior. Vamos

**[00:33]** aproveitar para revisar e então criar o esquema. E aí iniciamos o trabalho direto lá com o PG de

**[00:39]** mim usando o PostgreSQL como nosso SGBD sistema gerenciador de banco de dados. Pois bem,

**[00:45]** primeiro passo é você ir até o Docker Desktop e verificar se o container está em execução.

**[00:53]** No meu caso, veja que aparece o Running, excelente. Nós criamos esse container no capítulo anterior.

**[01:00]** Acabou de estudar, vai desligar a máquina, vai descansar, etc. Vem aqui, clica no Stop,

**[01:06]** pronto, container parado. Quando for acompanhar de novo as aulas, tem que ligar o container. Vem

**[01:13]** aqui, clica no Play, aguarda nos stances e pronto, Running. Se não estiver com status Running,

**[01:19]** você vai conseguir acessar, certo? O que eu tenho dentro desse container? Eu tenho SGBD,

**[01:25]** o PostgreSQL. Bom, agora eu quero acessar o banco de dados, para isso eu vou usar o PG de mim.

**[01:33]** Mostrei no capítulo anterior também como você faz a conexão. Instalar o PG de mim localmente,

**[01:38]** faz a conexão e pronto, já estou conectado ao DSADB, está aqui, banco de dados. Um banco de dados,

**[01:46]** ele é dividido de maneira lógica em esquemas ou schemas, que é o termo em inglês. Quando você

**[01:54]** cria a parte do zero, automaticamente o SGBD, o PostgreSQL cria para você o schema public.

**[02:02]** Então tudo aquilo que você quiser compartilhar entre os schemas, você normalmente coloca no public,

**[02:08]** mas eu não vou usar o public, eu vou criar meu próprio schema. Então você pode vir aqui,

**[02:13]** a direção direito, esquemas, create schema, vai abrir para você uma telinha. Você coloca,

**[02:19]** por exemplo, CAP03. Veja que o proprietário é o DSA, que é o usuário que nós usamos na hora

**[02:26]** de criar o banco de dados, lá via container Docker. Quando você digita aqui, automaticamente,

**[02:33]** olha o que faz o PostgreSQL, cria para você a instrução SQL. Isso aqui é uma forma também

**[02:37]** de entender ainda mais. Então sempre que aparecer aqui em cima a aba SQL, dá uma olhada para ver como

**[02:44]** foi criada a instrução, aprendizado adicional. Ou ainda você pode fechar isso aqui, então vou fechar,

**[02:50]** não quero salvar, vem aqui com o botão direito em esquemas, escolhe query tool, clica lá. Isso aqui é

**[02:57]** só uma telinha para você executar queries SQL. Aqui você pode colocar direto sua primeira

**[03:04]** SQL do curso. Olha só que bonita. Create schema, nome do schema CAP03, authorization para o usuário

**[03:12]** DSA, que é o proprietário do banco de dados. Tudo que está em maiúsculo é sintaxe SQL. Neste caso,

**[03:19]** uma instrução DDL, estou criando objeto, estou criando esquema. O esquema é uma divisão lógica

**[03:25]** de objetos. Então, por exemplo, eu tenho esquema para uma aplicação web, aí eu crio esquema,

**[03:31]** eu vou criar tabelas, crio procedures, views, etc. Posso criar um outro esquema para uma outra aplicação,

**[03:37]** uma aplicação interna, por exemplo, da empresa. Aí lá eu vou ter também as tabelas, assim por diante.

**[03:43]** O esquema divide o banco de dados de maneira lógica. Você pode conceder privilégios, pode isolar cada

**[03:50]** esquema, pode colocar esquema inclusive em arquivos diferentes no próprio banco de dados. Aí são

**[03:55]** várias possibilidades. No nosso caso, eu quero esquema para este capítulo. Clique aqui em cima do

**[04:01]** tabuleiro de que eu quero executar ou pressiona a tecla F5, executa e pronto. Esquema criado com

**[04:07]** sucesso. Vem aqui do lado esquerdo e faz um refresh, botão direito, refresh, já aparece o cap03. Se você

**[04:14]** clicar na setinha para expandir, olha lá, tem vários grupos de objetos. E aí eu posso ir criando esquemas

**[04:20]** no banco de dados. Nos próximos capítulos, eu vou criar bancos de dados diferentes, vou trabalhar com

**[04:25]** esses esquemas à medida que vamos construindo os nossos DWs. E isso é tudo que eu preciso para

**[04:32]** começar a construção do banco de dados. Então você precisa ter o container de execução, você tem que

**[04:38]** abrir o PGA de mim, conectar no seu banco de dados e então vai criar o seu esquema. Dentro desse esquema

**[04:44]** agora faremos o nosso trabalho ao longo deste capítulo. Muito obrigado e até a próxima aula.
