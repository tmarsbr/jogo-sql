# Aula 6 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 1-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:21:58

---

**[00:00]** Mostrei para você instruções DDL que servem para você criar e manipular objetos no banco

**[00:16]** de dados.

**[00:17]** Então você cria, você altera, você deleta, você trabalha no nível do objeto, ok?

**[00:24]** Só que agora eu quero acessar e manipular o conteúdo de um objeto, especificamente

**[00:31]** de uma tabela.

**[00:33]** Neste caso não dá para usar DDL, eu tenho que usar DML.

**[00:37]** Pois bem, vamos lá para o PGA de mim.

**[00:40]** Bom, primeiro eu preciso criar uma tabela, ok?

**[00:44]** Então eu vou criar aqui a tabela, porque eu vou manipular agora o conteúdo da tabela.

**[00:50]** Então aproveitei a oportunidade, trouxe de novo o Create Table.

**[00:54]** Dizem que agora eu estou usando o tipo int.

**[00:56]** Cada vez que eu trouxer a instrução eu vou tentar trazer para você o máximo de conteúdo

**[01:00]** possível para que você leve bastante conhecimento para casa, ok?

**[01:04]** Acompanhe sempre com muita atenção.

**[01:06]** Int indica que eu vou colocar um valor inteiro.

**[01:10]** Anteriormente eu tinha usado aqui serial, assim ó, serial.

**[01:15]** Isso aqui indica que o próprio SGBD vai criar uma numeração sequencial.

**[01:22]** Isso é uma opção.

**[01:23]** Se você não quiser ter o trabalho digital ID.

**[01:25]** Só que agora eu quero.

**[01:26]** Então por isso que eu coloquei agora diretamente o int.

**[01:29]** Aí eu coloquei nome, departamento, data de contratação como date e salário.

**[01:33]** Então executa, tabela criada com sucesso, faz o refresh, pronto.

**[01:39]** O DDL é para você manipular o objeto.

**[01:43]** Eu então criei um objeto, tabela funcionar.

**[01:46]** Eu agora uso o DDL para poder manipular o conteúdo desta tabela.

**[01:52]** Eu posso inserir registros, eu posso atualizar, eu posso deletar e eu posso selecionar, pesquisar

**[01:58]** os registros.

**[01:59]** Bom, como a tabela acabou de ser criada, ela está vazia, certo?

**[02:03]** É isso mesmo?

**[02:04]** Está vazia?

**[02:05]** Se tiver alguma dúvida, verifique.

**[02:07]** Botão direito aqui em funcionários.

**[02:10]** Escolhe essa opção aqui, view edit data.

**[02:12]** E aí all rows para você visualizar todas as linhas.

**[02:16]** Sabe o que ele vai trazer para você?

**[02:18]** Uma instrução, DML, que é o select, provavelmente que você mais vai usar no seu dia a dia.

**[02:24]** Então ele foi buscar na tabela para ver se tinha alguma coisa.

**[02:27]** Trouxe o select, está completamente vazia a tabela.

**[02:31]** Excelente.

**[02:32]** Pode fechar isso aqui e vamos então estudar as instruções DML.

**[02:36]** Vou colocar aqui para você o título e vamos começar com insert, porque eu preciso inserir

**[02:43]** registros, não é isso?

**[02:44]** Observe a sintax.

**[02:45]** Insert into.

**[02:46]** Inserir dentro.

**[02:47]** Então inserir em alguma coisa.

**[02:51]** Sim, parece redundante, é redundante mesmo, não é isso?

**[02:55]** Inserir dentro de alguma coisa.

**[02:57]** Neste caso eu vou inserir na tabela funcionários.

**[03:01]** A tabela funcionários tem quais colunas?

**[03:03]** Nome, departamento, data de contratação, salário.

**[03:06]** Certo?

**[03:07]** Espero que vai acontecer uma coisa, já já.

**[03:11]** Eu então coloco os valores.

**[03:14]** Coloco ID, coloco nome, departamento, data de contratação e salário.

**[03:19]** Excelente, não?

**[03:21]** Refeito.

**[03:22]** Executa.

**[03:23]** Opa!

**[03:24]** Mensagem de erro.

**[03:25]** Atenção.

**[03:26]** Mensagem de erro, o que você faz?

**[03:28]** Senta e chora.

**[03:29]** Sai correndo e gritando desesperado.

**[03:30]** Não.

**[03:31]** Você lê a mensagem de erro e resolve o problema.

**[03:34]** Não é isso?

**[03:35]** Vamos aqui para resolver o problema.

**[03:37]** Vamos ler a mensagem de erro juntos, ok?

**[03:39]** Eu sempre vou trazer isso durante as aulas, porque essa é uma das maiores deficiências

**[03:43]** que eu tenho nos alunos.

**[03:44]** Diante de mensagem de erro, muita gente congela.

**[03:47]** Não sabe o que fazer.

**[03:48]** E agora, o que eu faço?

**[03:49]** Vamos ler a mensagem, vamos resolver o problema.

**[03:52]** Se necessário, fazemos pesquisa adicional.

**[03:55]** Mostra que é um erro.

**[03:56]** Interessante.

**[03:57]** Aí vamos ler a mensagem.

**[03:59]** O insert tem mais expressões do que colunas target.

**[04:04]** O instructor, eu não sei inglês, o instructor.

**[04:07]** Não sabe, aprende.

**[04:09]** Excelente oportunidade, não é?

**[04:10]** Abre um tradutor de texto, vai traduzindo, vai aprendendo inglês por tabela.

**[04:15]** Excelente, não?

**[04:16]** O que está dizendo aqui?

**[04:17]** Que o insert tem simplesmente mais expressões do que coluna alvo.

**[04:26]** Vamos contar junto comigo?

**[04:28]** Colunas.

**[04:29]** Uma, duas, três, quatro.

**[04:31]** Ok.

**[04:32]** Eu estou tentando inserir um valor, dois, três, quatro, cinco.

**[04:37]** É claro que vai dar erro, não é?

**[04:39]** O que ficou faltando aqui?

**[04:41]** Eu não coloquei o ID do funcionário, não é isso?

**[04:45]** Coloquei exatamente para chamar a sua atenção para o erro.

**[04:47]** Você aprende muito com erro.

**[04:49]** Não tenha medo do erro.

**[04:50]** O erro é uma fonte de aprendizado.

**[04:53]** Para que eu pudesse ter correspondência aqui, eu teria que ter colocado a de funcionário,

**[04:58]** como estou fazendo agora.

**[04:59]** Então agora eu tenho uma, duas, três, quatro, cinco colunas.

**[05:03]** Estou inserindo um, dois, três, quatro, cinco valores.

**[05:07]** Adivinha o que vai acontecer agora quando eu executar?

**[05:09]** Vai funcionar, claro.

**[05:11]** Perfeito, excelente, não?

**[05:13]** É um pequeno detalhe, mas o detalhe faz toda a diferença.

**[05:17]** Na hora que você monta a sua instrução em search, você precisa ter o número de

**[05:21]** colunas aqui em cima, o nome das colunas, para poder corresponder com os valores aqui

**[05:26]** embaixo.

**[05:27]** Tem alternativas para isso, se eu uso serial ou não, mas é uma outra história.

**[05:31]** Conversamos sobre isso depois.

**[05:32]** Por ora, o importante é o seguinte.

**[05:34]** Sua tabela tem quantas colunas?

**[05:36]** Cinco?

**[05:37]** Então eu preciso colocar as cinco aqui em cima e ter cinco valores para inserir aqui

**[05:42]** na parte de baixo.

**[05:44]** Sempre atento também à questão do tipo de dado.

**[05:47]** A de funcionário é do tipo int, então eu coloco o número inteiro.

**[05:51]** O nome e o departamento são do tipo caractere, então eu coloco entre aspas simples.

**[05:58]** Data contratação é o tipo data.

**[06:01]** Também tem que ir com aspas simples e o formato de data adequado.

**[06:05]** Já o salário é tipo decimal, então ele aceita o ponto na hora que você estiver cadastrando.

**[06:09]** Esses detalhes fazem parte das sintaxes.

**[06:12]** Se tiver dúvidas, também tem uma forma aqui no PgAdmin de você validar.

**[06:17]** Vem aqui em funcionários, botão direito, escolha essa opção aqui, scripts.

**[06:22]** Escolhe então o insert.

**[06:24]** Ele vai abrir para você uma telinha e vai montar exatamente a instrução.

**[06:28]** Olha só que legal.

**[06:29]** Então quando tiver dúvida, o PgAdmin pode te ajudar.

**[06:33]** E aí, ele colocou aqui em outra linha, vou ajustar.

**[06:37]** Olha lá, esse ponto de interrogação é exatamente o valor que você vai colocar para cada coluna.

**[06:44]** Dependendo do seu tipo inteiro, decimal ou string, você ajusta conforme necessário,

**[06:49]** colocando não aspas aonde for necessário.

**[06:52]** Ok?

**[06:53]** Pode fechar isso aqui.

**[06:54]** Vamos então inserir mais registros para que depois eu possa também mostrar para você

**[06:59]** o update, delete e o insert.

**[07:01]** No próximo vídeo, nós continuamos.
