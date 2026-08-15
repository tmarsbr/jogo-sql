# Aula 11 - Trabalhando com Stored Procedures - Parte 1-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:35:33

---

**[00:00]** Mostrei para você as views e as views materializadas.

**[00:05]** Para quem trabalha, vai trabalhar com data warehouse.

**[00:08]** Você vai usar muito esses recursos e eu vou trazer também isso

**[00:11]** durante a construção dos nossos data warehouse.

**[00:15]** Na hora de montar os relatórios, o ideal é você trabalhar com views

**[00:18]** e materialize de views.

**[00:21]** Agora vamos subir o nosso relator.

**[00:24]** Vamos falar de stored procedures.

**[00:27]** Ou procedimentos armazenados, se você preferir.

**[00:30]** Vou fazer o seguinte, vou fechar aqui esta aba

**[00:33]** para deixar tudo limpinho aqui para gravar a aula para você.

**[00:36]** Vem para cá e abre o novo query tool.

**[00:39]** E o que eu quero agora é o seguinte, vou colocar aqui para você

**[00:42]** a minha necessidade, vou colocar aqui para você a minha necessidade

**[00:45]** e agora eu vou colocar aqui para você a minha necessidade

**[00:48]** e agora eu vou colocar aqui para você a minha necessidade

**[00:51]** e vou colocar aqui para você a minha necessidade.

**[00:54]** Vamos ver o que poderíamos fazer.

**[00:57]** Eu quero uma SP, uma stored procedure, que retorna

**[01:00]** o salário de cada funcionário com aumento de 5%.

**[01:03]** Ou seja, eu vou executar um procedimento

**[01:06]** que vai imprimir um relatório.

**[01:09]** Nesse relatório, eu quero visualizar cada funcionário

**[01:12]** com o salário com aumento de 5%.

**[01:15]** Para ter uma ideia, para ajudar o gestor, ajudar o RH,

**[01:18]** ou seja, eu quero olhar como ficaria o salário de cada colaborador

**[01:21]** concedendo o aumento de 5%.

**[01:24]** Bom, dá para fazer isso através de uma view, de uma query

**[01:27]** até possível.

**[01:30]** Só que aí eu vou ficar com o procedimento estático.

**[01:33]** Eu quero um procedimento dinâmico, algo que eu possa alterar

**[01:36]** a qualquer momento, porque é um relatório que pode mudar.

**[01:39]** Hoje é 5%, amanhã é 6%, 7%.

**[01:42]** Além disso, eu posso querer colocar regras,

**[01:45]** ou condicionais dentro desse código.

**[01:48]** Então, aí já não dá mais para usar view

**[01:51]** e view materializada.

**[01:54]** Temos que então criar um programa de banco de dados.

**[01:57]** Isso mesmo, programação de banco de dados.

**[02:00]** Quando alguém disser para você, com engenheiro de dados,

**[02:03]** qualquer profissional de dados, não precisa saber nada de programação,

**[02:06]** você corre. Corre para o mais longe que você puder

**[02:09]** dessa pessoa que não faz ideia que está falando.

**[02:12]** A programação vai estar com você em algum momento.

**[02:15]** Seja você um analista, um cientista, um engenheiro de dados,

**[02:18]** não importa, você vai ter que em algum momento se envolver

**[02:21]** com programação. Então não adianta fugir, aprenda a programação,

**[02:24]** que é bem mais fácil, por sinal.

**[02:27]** Como faríamos isso aqui no banco de dados?

**[02:30]** Via programação de banco de dados, essa é a ideia.

**[02:33]** Aqui eu tenho um exemplo completo para você,

**[02:36]** vamos chegar aqui para o lado.

**[02:39]** Bom, estamos criando uma procedure, um procedimento.

**[02:42]** Create or Replace.

**[02:45]** Isso aqui é um comando do tipo DDL, não é?

**[02:48]** Criação de objeto.

**[02:51]** Vou criar uma só procedure chamada aumenta salário.

**[02:54]** Vai ficar no schema, cap04, abre e fecha parênteses,

**[02:57]** porque na prática isso aqui é um procedimento,

**[03:00]** um bloco de código, diferentemente de uma view

**[03:03]** ou de uma view materializada, que são instruções SQL.

**[03:06]** Aqui é mais do que SQL, ok?

**[03:09]** Na sequência eu vou indicar qual linguagem eu vou usar

**[03:12]** para criar o meu programa.

**[03:15]** Eu vou usar PL, PGSQL.

**[03:18]** Quase todo o SGBD tem uma linguagem de programação.

**[03:21]** Por exemplo, no caso do Banco Oracle,

**[03:24]** é PL SQL, famosíssima, né?

**[03:27]** Que te permite fazer o que você imaginar

**[03:30]** em termos de programação no banco de dados.

**[03:33]** É aqui que você vai colocar sua lógica,

**[03:36]** você vai criar um cursor, um loop,

**[03:39]** vai colocar um condicional, vai usar estrutura de programação

**[03:42]** para poder gerar relatórios ou na hora de carregar

**[03:45]** o banco de dados ou qualquer outra atividade

**[03:48]** que você tem que fazer no seu SGBD.

**[03:51]** Neste caso, como estamos trabalhando com o SGBD PostgreSQL,

**[03:54]** a linguagem é PLPGSQL.

**[03:57]** Na sequência eu vou começar a declaração.

**[04:00]** Coloco o S, coloco o sinal de cifra duas vezes,

**[04:03]** indicando que eu vou começar a declarar um bloco de código.

**[04:06]** Aí eu uso a palavra reservada, declare.

**[04:09]** Tudo que está aqui em maiúsculo é a instrução SQL

**[04:12]** ou PLPGSQL.

**[04:15]** Dentro do declare eu vou criar um cursor.

**[04:18]** O cursor é um famoso objeto em programação de computadores

**[04:21]** que essencialmente permite você criar

**[04:24]** uma lista de objetos.

**[04:27]** Nesse caso eu vou criar uma lista de quê?

**[04:30]** Disso aqui, um select.

**[04:33]** Agora eu estou unindo linguagem SQL

**[04:36]** dentro do meu bloco de programação com PLPGSQL.

**[04:39]** Isso aqui, aliás, causa muitas dúvidas.

**[04:42]** O PLPGSQL é uma linguagem de programação

**[04:45]** do banco de dados, do SGBD especificamente.

**[04:48]** Neste tema, é o direitador de banco de dados.

**[04:51]** Com essa linguagem de programação,

**[04:54]** eu consigo colocar comandos que vão interagir

**[04:57]** com queries SQL. No meu caso eu coloquei o select.

**[05:00]** Quando executar esse select aqui, ele vai retornar

**[05:03]** várias linhas, não vai? Eu vou criar uma lista

**[05:06]** com essas linhas. Então eu estou criando um cursor,

**[05:09]** que eu estou dando um apelido, chamando de CURR,

**[05:12]** sendo uma abreviação, uma palavra de fato,

**[05:15]** isso aqui é uma variável. Então essa variável

**[05:18]** será do tipo cursor para o resultado desse select.

**[05:21]** Isso aqui é uma lista agora. Se é uma lista,

**[05:24]** eu posso criar um loop para percorrer a lista.

**[05:27]** Olha aí, programação de computadores.

**[05:30]** Aí eu coloco um bloco, begin, end, indicando que

**[05:33]** eu tenho o início e tenho o final. Vou criar um loop.

**[05:36]** Para cada record, cada registro, dentro da minha

**[05:39]** lista de registro, vou fazer um loop.

**[05:42]** E aí eu vou colocar aqui um raise notice,

**[05:45]** que é uma mensagem para indicar uma saída do relatório,

**[05:48]** uma saída da stock procedure. Vou colocar o seguinte,

**[05:51]** o funcionário tal, tem o salário atual tal,

**[05:54]** e o novo salário tal. Está vendo o percent?

**[05:57]** Isso aqui é um placeholder, é um marcador de lugar.

**[06:00]** Olha lá em cima na minha query.

**[06:03]** Eu estou retornando a id do funcionário, o nome,

**[06:06]** salário e o salário multiplicado por 1.05

**[06:09]** para ter o aumento de 5%.

**[06:12]** Então vou fazer o seguinte, do meu record,

**[06:15]** que é o meu registro, eu vou pegar o nome do funcionário

**[06:18]** e vou colocar nesse primeiro percent.

**[06:21]** O salário atual, vou colocar no segundo percent.

**[06:24]** O novo salário, que é a multiplicação,

**[06:27]** o salário por 1.05, está aqui inclusive, o salário novo,

**[06:30]** eu vou colocar no terceiro percent.

**[06:33]** Então estou criando um loop pela lista, imprimindo

**[06:36]** cada elemento da lista. Depois disso eu finalizo o loop,

**[06:39]** finalizo o end, finalizo o bloco com os dois

**[06:42]** sinais de cifra. Acabei de criar um programa

**[06:45]** de banco de dados, daqui a pouquinho vou criar outros também,

**[06:48]** com triggers e funções.

**[06:51]** Eu não sei se você percebeu, mas isso aqui te dá um poder imenso.

**[06:54]** Imenso! Você pode construir

**[06:57]** procedimentos completos de carga em banco de dados

**[07:00]** usando stop procedure.

**[07:03]** Inclusive, já fiz muito isso na minha carreira.

**[07:06]** Hoje nós temos ferramentas ETL que automatizam bastante

**[07:09]** nosso trabalho.

**[07:12]** Mas uns 15, 20 anos atrás não era assim.

**[07:15]** Há 15, 20 anos atrás, tínhamos que fazer carga em banco de dados

**[07:18]** usando isso aqui, stop procedure. Aliás, muitas empresas

**[07:21]** ainda fazem assim. Não há nada de errado em fazer isso.

**[07:24]** Quando você usa uma stop procedure, você pode

**[07:27]** customizar todas as regras de negócio que você quiser.

**[07:30]** Você tem total controle sobre isso. É que como é difícil

**[07:33]** encontrar no mercado profissionais que saem em programação de banco de dados,

**[07:36]** as empresas acabam recorrendo a ferramentas que não requerem

**[07:39]** programação, mas que são muito mais limitadas.

**[07:42]** O fato de não ter programação não é necessariamente uma vantagem.

**[07:45]** Tem várias limitações.

**[07:48]** Com programação de banco de dados, a limitação

**[07:51]** é o conhecimento profissional para desenvolver o código.

**[07:54]** Eu trabalhei um projeto que nós usávamos

**[07:57]** 8 stop procedures para fazer a carga em várias tabelas

**[08:00]** do banco de dados. Cada stop procedure

**[08:03]** tinha aproximadamente 800 a 900 linhas de código.

**[08:06]** Cada uma. Mas nós tínhamos uma quantidade

**[08:09]** imensa de verificações, de validações, regras de

**[08:12]** negócio, gerávamos arquivos TXT com log, auditoria.

**[08:15]** Tínhamos total flexibilidade.

**[08:18]** E o procedimento funcionava bem quando tinha um problema e ia direto

**[08:21]** na linha de código e resolvia seguir em frente.

**[08:24]** Dá trabalho desenvolver essas procedures? Claro que dá.

**[08:27]** Não é como qualquer coisa na vida. Mas eles têm mais flexibilidade.

**[08:30]** Se usar uma ferramenta TL que não requer programação,

**[08:33]** vai ser bem mais fácil, mas também menos flexível.

**[08:36]** Como sempre, é uma questão de trade.

**[08:39]** Vamos criar a nossa stop procedure.

**[08:42]** Criada com sucesso.

**[08:45]** Create procedure. Ela também fica aqui do lado.

**[08:48]** Vem aqui, dá um refresh. Já vai aparecer aqui para você.

**[08:51]** Chega um pouquinho para o lado. Procedures.

**[08:54]** Aumenta salário. Vamos então

**[08:57]** aumentar o salário do pessoal. Vamos executar a nossa procedure

**[09:00]** no próximo vídeo. Até lá.
