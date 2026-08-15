# Aula 5 - Instruções DDL - CREATE, ALTER, DROP - Parte 2-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:19:21

---

**[00:00]** Eu mostrei pra você como criar uma tabela usando uma instrução DDL, especificamente

**[00:14]** o Create Table.

**[00:16]** Pois bem, vai precisar criar um objeto no banco de dados?

**[00:21]** Você vai usar a instrução DDL Create.

**[00:24]** Create Function, Create View, Create Materialized View e assim por diante.

**[00:29]** Pra que você possa configurar e usar o objeto no banco de dados, é preciso, primeiro, criar

**[00:36]** o objeto.

**[00:37]** Não é isso?

**[00:38]** Mas, instructor, como eu vou saber a sintax completa pra criar cada objeto?

**[00:44]** Duas alternativas principais.

**[00:45]** Primeiro, você pode visitar a documentação oficial do SGBD.

**[00:50]** Vou colocar a documentação do PostgreSQL pra você na seção de links úteis ao final

**[00:53]** do capítulo.

**[00:54]** Outra alternativa é usar, por exemplo, uma ferramenta de acesso ao SGBD como o PG de

**[01:00]** Min.

**[01:01]** Você quer criar o que?

**[01:02]** Uma Procedure?

**[01:03]** É isso que você quer criar?

**[01:04]** Então vem aqui, botão direito, Create Procedure.

**[01:08]** Vamos dar um nome, vou chamar de Proc DSA.

**[01:10]** A Procedure, pra que você possa começar a criar, requer uma definição.

**[01:15]** Se eu clicar aqui em SQL agora, vai estar vazio, mas tudo bem.

**[01:19]** Vem aqui em Code, digita apenas isso, Teste.

**[01:22]** Só isso.

**[01:23]** Volta pra SQL, pronto.

**[01:25]** Já colocou pra você a sintax.

**[01:27]** Create Procedure, nome da Procedure, pertencente ao schema cap03, vai usar a linguagem SQL.

**[01:34]** Eu tenho opções, eu vou criar a Procedure, que eu vou trazer daqui a pouco exemplos pra

**[01:37]** você.

**[01:38]** Então, coloco o body.

**[01:40]** Body é o corpo da Procedure.

**[01:42]** Procedure é um programinha de banco de dados.

**[01:46]** Você pode colocar lógica de negócio, regras, o que você quer executar em uma ou mais tabelas.

**[01:52]** Cada vez que você quiser criar um objeto, você pode usar a ferramenta de acesso ao

**[01:57]** SGVD ou visita a documentação oficial.

**[02:00]** E aí nesse caso, pra criar o objeto, eu vou sair daqui sem salvar, você usa uma instrução

**[02:04]** DDL como instrução Create.

**[02:08]** Criou um objeto.

**[02:09]** Tabela foi criada, excelente.

**[02:11]** Vamos dar uma olhada?

**[02:12]** Vem aqui, tabela funcionários, botão direito, escolhe properties.

**[02:17]** Ele traz pra você uma série de abas lá em cima, entre elas SQL que tá vazia.

**[02:22]** Por quê?

**[02:24]** Porque nenhuma atualização foi feita.

**[02:26]** Então ele só mostra o Create quando você tá criando o objeto.

**[02:31]** Se você agora editar, você pode alterar o objeto.

**[02:34]** Você pode, por exemplo, vir aqui em colunas.

**[02:36]** Imagine que você queira, por exemplo, departamento.

**[02:39]** Eu não quero mais esse tipo.

**[02:40]** Ao invés de caractere variante, eu quero somente caractere.

**[02:44]** Ok?

**[02:45]** Vem aqui em SQL.

**[02:46]** Olha aí, olha o que vai aparecer.

**[02:47]** Alter table, que é outra instrução, DDL.

**[02:51]** Criou o objeto, tem agora uma instrução pra alterar o objeto.

**[02:55]** Então Create table, cria a tabela.

**[02:59]** Alter table, altera a tabela.

**[03:01]** Create procedure, cria procedure.

**[03:03]** Adivinha como é que é pra alterar?

**[03:06]** Alter procedure.

**[03:07]** Ou seja, a palavrinha no início é a mesma.

**[03:10]** O que muda é o objeto.

**[03:13]** Criar, função, procedure, view, view materializada, qualquer objeto de banco de dados.

**[03:18]** Ok?

**[03:19]** Pode sair daqui por enquanto que eu vou trazer direto a instrução SQL.

**[03:23]** Cria a tabela.

**[03:24]** Se eu tentar criar de novo, você já sabe o que vai acontecer, né?

**[03:28]** Vai dar mensagem de erro, claro.

**[03:30]** E aí precisamos sempre ler a mensagem de erro.

**[03:34]** É importantíssima.

**[03:35]** Error, a relação funcionários já existe.

**[03:39]** Não dá pra criar uma tabela que já tenha criado no banco de dados, né?

**[03:44]** Mas eu posso alterar a tabela usando exatamente o alter table.

**[03:47]** Olha só o que eu vou fazer.

**[03:49]** Vou trazer aqui pra você a instrução.

**[03:51]** Coloca ela aqui.

**[03:52]** Alter table, o nome da tabela no schema, sempre colocar o schema antes.

**[03:58]** E aí eu vou adicionar uma coluna.

**[04:00]** Olha só.

**[04:01]** Eu não preciso deletar a tabela e criar de novo.

**[04:04]** Eu posso apenas alterar a tabela que já foi criada previamente.

**[04:07]** Adiciona coluna chamada data contratação.

**[04:10]** Inclui o tipo, né?

**[04:12]** Neste caso, date.

**[04:13]** Seleciona, executa, tabela alterada.

**[04:17]** Vem aqui em funcionários, botão direito, propriedades, colunas.

**[04:21]** Olha lá quem tá aparecendo.

**[04:23]** Data contratação.

**[04:24]** Tanto o create quanto o alter são instruções DDL.

**[04:28]** Permitem você criar ou alterar objetos.

**[04:31]** Estou mostrando pra tabela, mas é igualzinho pra qualquer outro objeto.

**[04:35]** Você cria uma view, altera uma view.

**[04:37]** Cria uma view materializada, altera view materializada.

**[04:40]** Cria a função, altera a função e assim sucessivamente.

**[04:44]** Pois bem, pode fechar.

**[04:45]** Pra concluir aqui as instruções DDL, eu também posso dropar um objeto.

**[04:51]** Vai ter que ser feito sempre com muito cuidado, hein?

**[04:54]** Principalmente quando estiver dentro da empresa, no ambiente de produção.

**[04:58]** Tome cuidado.

**[04:59]** Drop é dropar, deletar.

**[05:01]** Drop table indica o nome da tabela.

**[05:04]** Como eu sou o proprietário do banco de dados, quando executar este comando não tem conversa.

**[05:10]** Ok?

**[05:11]** Vai deletar a tabela.

**[05:12]** Ah, mas não era pra deletar, etc.

**[05:15]** Aí tem que voltar o backup.

**[05:17]** Tem que torcer pra que tenha um backup disponível, né?

**[05:20]** Se não tiver backup, já era.

**[05:22]** Perdeu.

**[05:23]** Esse, portanto, é um comando a ser usado com muito cuidado.

**[05:26]** Então executa, dá um refresh aqui do lado esquerdo.

**[05:30]** Pronto.

**[05:31]** Tabela se foi.

**[05:32]** Se foi para o além.

**[05:33]** Se não tiver backup, já era.

**[05:35]** Você perde a tabela.

**[05:36]** No nosso ambiente de teste aqui, claro que não tem nenhum problema, não é?

**[05:40]** Mas no ambiente de produção, no dia a dia, dentro das empresas, tome cuidado.

**[05:44]** Esses três comandos aqui, as três instruções, você vai usar com qualquer objeto.

**[05:49]** É só você tirar o table, colocar o objeto que você quer, criar, alterar ou dropar.

**[05:54]** E claro, tem que colocar a especificação daquele objeto.

**[05:57]** Seja procedure, function, view, materialized view, ou trazer exemplos pra você também

**[06:02]** durante esse capítulo.

**[06:03]** E assim você manipula o objeto, criando, alterando ou deletando.

**[06:10]** No próximo vídeo, nós continuamos.

**[06:12]** Até lá.
