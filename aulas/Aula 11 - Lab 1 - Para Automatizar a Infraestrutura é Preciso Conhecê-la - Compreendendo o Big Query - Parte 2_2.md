# Aula 11 - Lab 1 - Para Automatizar a Infraestrutura é Preciso Conhecê-la - Compreendendo o Big Query - Parte 2_2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:03:47

---

**[00:00]** Quando você entra nesta tela, isso aqui é o console do BigQuery, você cai normalmente

**[00:13]** no BigQuery Studio.

**[00:15]** Aqui tem alguns itens que eu já acessei recentemente, no seu caso deve estar vazio, se você tiver

**[00:20]** acessando pela primeira vez.

**[00:22]** Aqui você vai encontrar o nome do projeto, a partir daqui você cria infraestrutura,

**[00:27]** que eu já mostro para você.

**[00:28]** E no lado esquerdo tem o menu lateral com algumas opções.

**[00:31]** O BigQuery é um serviço relativamente simples.

**[00:34]** É para você criar o seu data warehouse, carregar os dados, vir aqui, começar a criar SQL.

**[00:40]** Olha lá, na tela branca você vem aqui, escreve sua SQL e já começa o trabalho.

**[00:46]** Eu poderia fazer tudo aqui mesmo por esse console.

**[00:49]** Eu venho aqui, preparo o dataset, preparo as tabelas, carrego, processo manual, obviamente.

**[00:55]** E então, talvez aí, em alguns poucos minutos ou poucas horas, eu tenha o DW funcionando.

**[01:00]** A proposta que eu quero trazer para você é automatizar tudo isso aqui.

**[01:05]** Ou seja, eu quero que você execute um script e quando acabar a execução você venha e

**[01:10]** já começa a executar SQL.

**[01:13]** Você, o usuário, a lista de dados e assim por diante.

**[01:17]** Que é uma tendência cada vez mais forte no mercado.

**[01:20]** À medida que aumenta a adoção de cloud computing, as empresas percebem que é importante

**[01:25]** automatizar uma série de tarefas.

**[01:28]** Não faz muito sentido hoje em dia você vir aqui e configurar manualmente.

**[01:31]** Você pode automatizar esse processo.

**[01:34]** E é isso que eu quero demonstrar neste lábio.

**[01:36]** Mas para que isso aconteça temos que fazer algumas coisas aqui.

**[01:40]** Este é o projeto.

**[01:42]** Para poder trabalhar neste projeto no BigQuery, eu tenho que vir aqui nos três pontinhos

**[01:47]** e criar um conjunto de dados.

**[01:51]** Esse conjunto de dados seria o banco de dados em um SGBD.

**[01:57]** Então, imagine um SGBD qualquer, sistema gerenciador de banco de dados.

**[02:00]** Postgresql, MySQL, Oracle, SQLiServ, DB2, se você quiser.

**[02:04]** Cada um deles é um SGBD, um software.

**[02:07]** Você cria um ou mais bancos de dados.

**[02:09]** Depois você cria os esquemas e cria as tabelas.

**[02:14]** No BigQuery você tem o projeto, você cria o conjunto de dados, que é essencialmente

**[02:18]** o seu banco de dados.

**[02:19]** Eu só dei um nome diferente.

**[02:21]** Chama diferente, mas é como se fosse o banco de dados.

**[02:24]** Clica lá.

**[02:25]** Ele vai te dar algumas opções.

**[02:27]** Eu vou colocar um nome, ele chama de código.

**[02:30]** Vou chamar de Lab 1.

**[02:32]** Ele pergunta, quer uma região ou multirregional?

**[02:35]** Quando você trabalha com cloud computing, você tem de fato os data centers.

**[02:41]** Isso vale para a AWS, Microsoft Azure, isso vale também para o GCP.

**[02:46]** Você pode criar o seu projeto, seu banco de dados, etc. somente em uma região, ou

**[02:51]** então ele pode ser multirregional.

**[02:54]** Quem vai gerenciar isso para você é o GCP.

**[02:56]** A vantagem é que se cair em uma região, é raro de acontecer, mas às vezes acontece.

**[03:01]** Se cair em uma região, você vai ter lá o seu banco de dados funcionando em outra

**[03:05]** região.

**[03:06]** Vai continuar acessando normalmente.

**[03:07]** Recentemente, mais ou menos um ano e meio antes da gravação deste vídeo, teve uma

**[03:12]** queda na AWS, que é o maior proveedor de cloud computing do mundo.

**[03:18]** Quase metade da internet parou de funcionar durante um dia por conta de uma queda no data

**[03:23]** center da AWS.

**[03:25]** Só para entender como hoje tudo isso aqui está conectado.

**[03:29]** Então é raríssimo de acontecer.

**[03:31]** Já usa a AWS há mais de uma década.

**[03:34]** Em dez anos deve ter acontecido isso duas vezes.

**[03:38]** Quando realmente cai alguma coisa, tem um problema que é normal.

**[03:41]** Pode ter problema.

**[03:42]** Problema de energia, queda de luz, servidor que deu problema, erro humano e assim por

**[03:48]** diante.

**[03:49]** A ideia de você usar o multirregional é tentar evitar exatamente esse tipo de problema.

**[03:55]** Depois disso, se você escolher multirregional, pode deixar a sua opção.

**[03:58]** Tem aqui opções avançadas.

**[04:00]** Quer fazer criptografia, compilação padrão, não quer diferenciar maiúsculo e minúsculo,

**[04:05]** nada disso aqui é necessário para o nosso exemplo, pode deixar as configurações no

**[04:08]** formato que está.

**[04:09]** Clique então em criar conjunto de dados.

**[04:12]** Aguarde alguns instantes e pronto.

**[04:14]** Olha lá, lab 1 criado.

**[04:16]** Clique na setinha, observe que está vazio.

**[04:19]** Clique aqui nos três pontinhos e então Criar tabela.

**[04:23]** E agora basicamente é você criar cada tabela para o seu banco de dados.

**[04:28]** Se tiver um Data Warehouse, é provável que você tenha um tipo de modelo como Star

**[04:32]** Schema, Snowflake, já fez o trabalho de modelagem, já tem o DW pronto.

**[04:38]** Vem aqui e crie as tabelas.

**[04:40]** Tabela dimensão, tabela fato.

**[04:42]** As tabelas ficarão nesse banco de dados, que é o conjunto de dados.

**[04:46]** Depois tem que carregar os dados e pronto, começar a executar o processo de análise.

**[04:50]** Se você clicar aqui em criar tabela, ele vai te perguntar se você quer uma tabela

**[04:55]** fazer upload, quer copiar do Amazon S3.

**[04:58]** Isso mesmo, dá para você trazer os dados de outro provedor de cloud computing.

**[05:03]** Vai ter que, claro, configurar também a autenticação.

**[05:06]** Dá para trazer do Google Cloud Storage, fazer upload, do Google Drive, já que tudo isso

**[05:11]** aqui é do Google, entre outras opções.

**[05:14]** Depois disso, qual é o projeto, qual é o conjunto de dados?

**[05:17]** Dá o nome para a tabela, qual é o tipo que você quer, geral nativa é o padrão disponível.

**[05:23]** O esquema são as colunas de tipos de dados.

**[05:26]** Tem algumas opções de patricionamento, se a tabela ficar muito grande depois, e você

**[05:30]** cria.

**[05:31]** Não precisa criar agora, porque eu vou automatizar esse processo.

**[05:33]** Pode cancelar aqui, pode sair.

**[05:35]** E aí você tem o seu projeto, você tem o seu banco de dados, você tem as tabelas.

**[05:41]** As tabelas serão carregadas com dados e você estará em condições de começar a realizar

**[05:46]** o trabalho de análise com a SQL.

**[05:48]** Ou seja, eu teria que fazer um trabalho manual aqui.

**[05:51]** Mais tabelas, maior a quantidade de trabalho para poder preparar o dedado.

**[05:56]** Certo?

**[05:57]** Então, nós vamos fazer automatizar tudo isso aqui.

**[06:01]** Você vai subir toda essa infraestrutura, incluindo o data set, incluindo as tabelas.

**[06:07]** Vai subir tudo isso com terraform.

**[06:10]** Quando acabar de executar o código script.ac, é só vir aqui e já executar SQL.

**[06:16]** E pronto, o pessoal pode usar durante algumas horas, alguns dias, etc.

**[06:20]** Não está mais usando?

**[06:22]** Executa o comando, derruba tudo isso e pronto.

**[06:25]** Não usa mais o provedor de cloud computing, não tem problema de segurança e se por acaso

**[06:29]** não tiver na camada gratuita, também não tem risco de cobrança.

**[06:33]** Isso é uma tendência no mundo atual.

**[06:36]** Porque em geral, em cloud computing, nós pagamos pelas horas de uso.

**[06:41]** Então não faz sentido você deixar o DW lá à toa.

**[06:45]** Tem gente usando o DW, sabe, no domingo?

**[06:48]** Eu não sei, não pergunta para mim não.

**[06:49]** Pode perguntar lá na empresa.

**[06:51]** Tem gente usando o DW?

**[06:52]** Não?

**[06:53]** Então para que eu vou deixar o DW ligado na nuvem?

**[06:56]** Não faz sentido, além de ser uma possível falha de segurança, talvez eu seja cobrado

**[07:00]** por isso.

**[07:02]** Você desliga o DW na sexta-feira à noite e cria de novo, liga de novo no domingo à

**[07:08]** noite ou então na segunda-feira de manhã.

**[07:10]** E como tudo isso será feito via automação, você pode ligar e desligar de acordo com a

**[07:16]** conveniência, com quem for usar e assim por diante.

**[07:19]** Uma visão geral rápida do que nós temos no BigQuery, do que é necessário para você

**[07:24]** colocar esse DW para funcionar.

**[07:26]** E agora então vamos automatizar isso aqui usando o Terraforma.

**[07:30]** Muito obrigado e até a próxima aula.
