# Aula 7 - Instruções DML - SELECT, INSERT, UPDATE, DELETE - Parte 2-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:25:21

---

**[00:00]** Tudo bem até aqui, conseguindo acompanhar?

**[00:10]** Isso aqui é uma introdução da introdução.

**[00:13]** O objetivo aqui é trazer linguagem SQL para engenheiros de dados.

**[00:16]** Eu vou trazer alguns assuntos bem avançados daqui a pouco, mas antes de aprender a correr,

**[00:21]** tem que aprender a andar, não é isso?

**[00:23]** Então quem nunca viu antes, ótimo, está vendo agora aqui as primeiras instruções.

**[00:28]** Quem já viu aproveita para dar uma revisada também, vai acompanhando ao longo de todo

**[00:32]** este capítulo, tem bastante coisa para trazer para você.

**[00:35]** Então vamos lá.

**[00:37]** Agora eu quero inserir mais registros.

**[00:39]** Então vou aproveitar aqui a oportunidade, vou trazer outras instruções em search.

**[00:46]** Tem como automatizar isso?

**[00:47]** Sim, eu poderia criar uma procedure que vai ter uma lógica e aí tem que desenvolver

**[00:53]** um programa, um programinha com linguagem SQL por sinal, para que você possa usar

**[00:58]** o comando insert uma vez e inserir vários registros.

**[01:02]** Isso é possível com o stop procedure, vou trazer exemplo daqui a pouco para você.

**[01:06]** Por ora vamos repetindo a instrução insert com o devido cuidado de não repetir o ID.

**[01:13]** Por que eu não posso repetir o ID?

**[01:15]** Porque o ID é chave primária.

**[01:17]** Eu não posso ter dois registros com a mesma informação na chave primária.

**[01:23]** Já já provo para você.

**[01:25]** Vamos selecionar tudo isso aqui, o senho já inserido foi?

**[01:29]** Então do 101 até o 104, mesmo as citax que eu expliquei no vídeo anterior, executa pronto,

**[01:35]** executado com sucesso.

**[01:37]** Antes de checar os dados, vamos fazer um experimento aqui?

**[01:40]** Vou tentar inserir de novo o funcionário 104, a Clarice Lispector.

**[01:45]** Ok?

**[01:46]** São dados fictícios, mas com nomes de grandes escritores da literatura brasileira.

**[01:52]** Pois bem, vamos tentar inserir de novo o ID 104 para ver o que vai acontecer?

**[01:57]** Executa, opa, mensagem de erro.

**[01:59]** Mensagem de erro é oportunidade de aprendizado.

**[02:01]** O que está dizendo aqui?

**[02:03]** O ID funcionário 104 já existe.

**[02:06]** Tentativa de duplicar chave, isso é violação de constrente.

**[02:11]** Não pode.

**[02:12]** Pronto, é só isso.

**[02:13]** Na verdade não é necessariamente um erro, não é?

**[02:16]** É que não pode, eu estou tentando violar uma regra.

**[02:19]** Não dá para fazer isso, ele não pode permitir que isso aconteça, porque a coluna é chave

**[02:23]** primária.

**[02:25]** Como ele não deixa que aconteça, então ele explode para você uma mensagem de erro

**[02:29]** dizendo que está tentando violar chave primária.

**[02:32]** Ótimo.

**[02:33]** Agora eu quero checar se os dados foram realmente inseridos.

**[02:37]** Vou apagar isso aqui, já inseri os dados.

**[02:40]** Vou agora fazer um SELECT, que é outra instrução DML.

**[02:45]** Tem gente que gosta de colocar até o SELECT como uma instrução à parte.

**[02:49]** Mas é DML porque eu estou manipulando os dados, estou retornando os dados.

**[02:54]** SELECT é selecionar.

**[02:55]** Selecione tudo, asterisco, FROM, de onde eu vou selecionar, tabela funcionários.

**[03:02]** Executa e pronto.

**[03:04]** Olha lá que coisa linda.

**[03:06]** Todos os registros foram cadastrados com sucesso.

**[03:10]** O SELECT vai te acompanhar o tempo inteiro na linguagem SQL.

**[03:15]** Você usa o SELECT para retornar os dados.

**[03:17]** Você pode montar uma query tão simples como esta aqui, ou então queries cavernosas, gigantescas,

**[03:23]** monstruosas, com o próprio SELECT.

**[03:25]** Eu vou trazer alguns exemplos para você daqui a pouco também, aqui mesmo neste capítulo.

**[03:30]** Isso aqui talvez é a query mais simples e básica para o SELECT.

**[03:33]** Ela pode ficar bem mais complicada do que isso aqui que nós estamos vendo agora.

**[03:38]** Bom, veja que eu tenho a ID do funcionário, nome, departamento, data de contratação

**[03:43]** e salário.

**[03:45]** Se você observar o salário, o machado de Assis é o único que está ganhando menos de 20 mil.

**[03:50]** Não pode.

**[03:51]** Vamos dar um aumento ao machado de Assis, ok?

**[03:55]** Eu preciso aumentar o salário dele.

**[03:57]** E agora?

**[03:58]** Tenho que modificar a tabela e tenho que aumentar o salário.

**[04:02]** Então modificar só esse campo, somente o salário e somente do machado de Assis.

**[04:07]** Está vendo aqui o machado de Assis?

**[04:08]** Não encontrou?

**[04:09]** É o 101.

**[04:10]** Veja que o salário dele é o único abaixo de 20 mil.

**[04:13]** E agora?

**[04:14]** Coitado do machado de Assis.

**[04:15]** Vamos dar um aumento a ele, não é?

**[04:17]** Para isso eu vou usar outra instrução da EML, o UPDATE.

**[04:22]** Vou deixar o SELECT aqui para verificar a modificação.

**[04:26]** E aqui está o UPDATE.

**[04:28]** Tudo que estiver em maiúsculo lembre-se, exatamente instrução SQE.

**[04:31]** UPDATE é atualizar.

**[04:33]** Atualize a tabela funcionário do esquema CAP03.

**[04:37]** 7 é configurar.

**[04:39]** Configure o salário igual a 26 mil.

**[04:42]** Um bom aumento para o machado de Assis.

**[04:44]** Mas eu tenho que fazer isso estabelecendo a regra.

**[04:48]** Qual é a regra?

**[04:49]** O WHERE, onde o nome for igual ao machado de Assis.

**[04:54]** Se eu tirar este WHERE, o que você acha que vai acontecer?

**[04:59]** Ele vai atualizar o salário para todo mundo, não é?

**[05:02]** Porque eu não coloquei critério, eu não coloquei filtro.

**[05:05]** Isso é perigoso, hein?

**[05:07]** Então faça isso e se souber o que está fazendo.

**[05:09]** Se você quer alterar apenas um registro, tem que colocar o filtro.

**[05:14]** Caso contrário, vai atualizar todos os registros.

**[05:18]** Então dou um CTRL Z para voltar aqui.

**[05:21]** Vamos executar o UPDATE.

**[05:23]** Executa.

**[05:24]** UPDATE realizado com sucesso.

**[05:27]** Faz de novo SELECT.

**[05:28]** Pronto.

**[05:29]** Machado de Assis ganhou aumento agora.

**[05:31]** Ele tem 26 mil.

**[05:32]** Cadê?

**[05:33]** Está aqui embaixo.

**[05:34]** Perfeito.

**[05:35]** Está claro para você?

**[05:37]** E o que será que acontece, então, se eu tirar o WHERE?

**[05:39]** Vamos aproveitar, não é?

**[05:41]** Vamos fazer as experiências macabras aqui no ambiente de teste,

**[05:44]** para não fazer depois no ambiente de produção.

**[05:47]** No ambiente de produção, você vai ter problemas.

**[05:50]** Aqui é o seu ambiente de teste.

**[05:51]** Se der problema, a tabela cria de novo e encerra os registros.

**[05:54]** Tudo bem.

**[05:55]** Pois bem.

**[05:56]** Vamos então fazer o UPDATE sem WHERE.

**[05:59]** Executa.

**[06:00]** Opa!

**[06:01]** Isso que foi feito com sucesso, hein?

**[06:04]** O que não necessariamente é uma coisa boa.

**[06:06]** Então volta aqui no SELECT e aconteceu exatamente o que eu disse que ia acontecer.

**[06:12]** Olha lá.

**[06:13]** Você não colocou o filtro?

**[06:14]** Ele então não tem mágica, não é?

**[06:17]** Se você não disse aonde era para atualizar, ele atualizou e foi tudo.

**[06:22]** Isso aqui é perigoso, hein?

**[06:23]** Tome cuidado.

**[06:24]** Em alguns casos, é isso que você quer.

**[06:27]** Você quer colocar um valor igual em todas as linhas.

**[06:32]** Mas isso é raro.

**[06:33]** Normalmente você quer alterar um registro.

**[06:35]** Então tem que aplicar o filtro com a causal WHERE.

**[06:38]** Caso contrário, você vai estar em apuros.

**[06:42]** E agora, Strutor?

**[06:44]** Então agora tem que deletar a tabela e criar e depois carregar de novo.

**[06:49]** Não precisa agora, porque já já eu vou deletar e vou continuar aqui o nosso exemplo.

**[06:53]** Eu quero mostrar agora para você o DELETE.

**[06:55]** Também podemos deletar um registro especificamente.

**[06:58]** Vou colocar aqui para você o DELETE.

**[07:01]** Olha lá.

**[07:02]** DELETE FROM funcionários, que é a tabela do schema cap03.

**[07:07]** WHERE, que é o filtro.

**[07:09]** O nome for igual ao machado de assist.

**[07:11]** Não tem aqui o usuário machado de assist?

**[07:14]** Aqui a regra é a mesma do update.

**[07:17]** Vai fazer update, coloca o filtro.

**[07:19]** Vai fazer WHERE, coloca o filtro.

**[07:22]** Vamos executar.

**[07:23]** Executa.

**[07:24]** Pronto.

**[07:25]** Deletado com sucesso.

**[07:27]** Faz o SELECT.

**[07:28]** Observe que agora não tem mais o machado de assist.

**[07:31]** E o que acontece se eu tirar o WHERE?

**[07:34]** Vamos fazer a experiência macabra.

**[07:37]** Seleciona, executa.

**[07:39]** Opa!

**[07:40]** DELETE.

**[07:41]** E agora?

**[07:42]** Vamos verificar com SELECT.

**[07:44]** Executa tabela vazia.

**[07:46]** Eu estou mostrando para que você não cometa esse equívoco no seu dia a dia.

**[07:51]** Ok?

**[07:52]** Quando usar o update, quando usar o DELETE, a menos que você saiba o que está fazendo

**[07:57]** e tenha uma boa razão, use o filtro com WHERE.

**[08:01]** O filtro vai te dar segurança para que você altere exatamente o que você precisa.

**[08:06]** Dá para colocar vários critérios no filtro, etc.

**[08:09]** Mas use o filtro com WHERE.

**[08:11]** Caso contrário, vai acontecer isso.

**[08:13]** Ou atualiza a tabela inteira, todo o campo, ou deleta a tabela inteira.

**[08:18]** Por falar em deletar, também podemos fazer isso aqui como PG de mim.

**[08:22]** Vem aqui mesmo, botão esquerdo, no nome da tabela.

**[08:25]** No nome da tabela, tem a opção DELETE e DELETE Cascade.

**[08:28]** O DELETE Cascade é quando você tem a tabela com vários relacionamentos.

**[08:32]** No nosso caso não temos, só temos uma.

**[08:34]** Então você escolhe a opção DELETE e então ele confirma.

**[08:38]** É isso mesmo?

**[08:39]** Sim.

**[08:40]** Pronto.

**[08:41]** Tabela deletada com sucesso.

**[08:42]** Para o nosso ambiente de teste, não tem problema algum.

**[08:44]** Para o ambiente de produção, claro, tem que tomar o máximo de cuidado.

**[08:48]** No próximo vídeo, nós continuamos.

**[08:50]** Até lá.
