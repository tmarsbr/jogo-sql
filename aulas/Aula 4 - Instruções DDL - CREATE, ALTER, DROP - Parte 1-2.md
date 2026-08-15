# Aula 4 - Instruções DDL - CREATE, ALTER, DROP - Parte 1-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:17:01

---

**[00:00]** Eu vou trazer agora para você uma série de instruções SQL e eu vou aumentando gradativamente

**[00:14]** o nível de complexidade, sempre explicando tudo passo a passo.

**[00:19]** Pois bem, para organizar o nosso trabalho, toda e qualquer instrução SQL que eu vou

**[00:24]** mostrar durante as aulas, você vai encontrar nesses três arquivinhos SQL que estão disponíveis

**[00:31]** ao final do capítulo.

**[00:32]** Tem um zip no final do capítulo exatamente com os três scripts.

**[00:37]** Eu não fico digitando durante as aulas, durante os vídeos.

**[00:41]** Por quê?

**[00:42]** Porque é um tremendo desperdício de tempo, meu e seu, não é?

**[00:46]** Você ir do outro lado do vídeo e ficar esperando eu digitar durante as aulas, acompanhando,

**[00:50]** não faz o menor sentido.

**[00:52]** Então o que eu faço?

**[00:53]** Eu digito offline, trago para você o código durante os vídeos e assim eu explico de maneira

**[00:59]** mais clara, rápida, direta, objetiva, economizo o meu tempo, economizo o seu, todo mundo

**[01:04]** sai a ganhar.

**[01:05]** Perfeito?

**[01:06]** Se você preferir, você pode digitar na medida que vai acompanhando os vídeos, não tem

**[01:10]** problema algum.

**[01:11]** E, aliás, essa é uma das belezas de um curso online, não é?

**[01:15]** Cada aluno estuda de acordo com a sua disponibilidade, com seu nível de conhecimento, assim por

**[01:19]** diante.

**[01:20]** Você está assistindo a SQL agora a partir do zero, nunca viu antes?

**[01:24]** Então vai acompanhando as aulas e vai digitando a medida que eu vou mostrando em cada vídeo.

**[01:29]** Dê um pause no vídeo se necessário, digita, vai acompanhando, não tenha pressa.

**[01:33]** O aprendizado não está no final, está na jornada, então aproveite o máximo possível.

**[01:38]** Você já está confortável com a linguagem SQL, já conhece alguma coisa?

**[01:42]** Então você pode, até o final do capítulo, baixar os scripts e vai acompanhando junto

**[01:46]** comigo e executando no seu próprio ambiente.

**[01:49]** Ou seja, escolha a abordagem que você achar melhor para o seu aprendizado.

**[01:53]** Essa é uma das belezas de um curso online.

**[01:56]** Perfeito?

**[01:57]** Vamos começar com o script 01.

**[01:59]** Então eu já tenho aqui cada uma das instruções, vou colocando para você no PG de mim.

**[02:04]** Eu vou fechar essa janela só para mostrar de novo como chega até aqui.

**[02:08]** Então vou fechar, não vou salvar.

**[02:10]** Venho agora de novo aqui do lado esquerdo, vou em Cap03, botão direito e vou escolher

**[02:15]** Query Tool.

**[02:16]** Clica lá.

**[02:17]** Ele abre para você a janelinha.

**[02:18]** Aqui embaixo está exatamente a saída, você pode movimentar esse painel do jeito que você

**[02:22]** quiser.

**[02:23]** Eu vou mantê-lo aqui mais ou menos nessa parte inferior para que eu tenha mais espaço

**[02:27]** aqui e explicar para você cada um dos itens.

**[02:30]** Bom, vamos começar com as instruções DDL.

**[02:35]** O que exatamente é isso, não é?

**[02:37]** Lembrando que tudo que eu colocar aqui nos vídeos você vai encontrar nos scripts ao

**[02:41]** final do capítulo.

**[02:43]** Instruções DDL.

**[02:44]** A palavrinha, na verdade, a sigla DDL significa Data Definition Language, linguagem e definição

**[02:51]** de dados.

**[02:53]** Instruções DDL são instruções de criação, modificação ou deleção de objetos no SQL.

**[03:00]** Ok?

**[03:01]** Ou seja, você quer criar um objeto, você usa a palavra create.

**[03:06]** Quer alterar um objeto já criado, usa alter.

**[03:10]** Quer deletar um objeto criado, utiliza drop.

**[03:13]** São as principais instruções DDL.

**[03:16]** Eu usei uma no vídeo anterior, não foi?

**[03:18]** Que foi o create schema, usei uma instrução DDL.

**[03:21]** Vou usar outra agora, vou usar o create table.

**[03:25]** Tudo que está aqui em maiúsculo significa sintaxe SQL.

**[03:29]** O que está em minúsculo são nomes que nós definimos.

**[03:33]** Então, create table é uma instrução DDL para criar uma tabela.

**[03:38]** Eu vou colocar a tabela no schema cap03.

**[03:42]** O nome da tabela será funcionários.

**[03:45]** Uma tabela é composta de colunas.

**[03:47]** Eu então terei as colunas id funcionário, nome, departamento e salário.

**[03:52]** Cada coluna precisa ter um tipo de dado.

**[03:56]** Para a primeira coluna eu vou usar o tipo serial, que é um tipo inteiro, de número

**[04:01]** inteiro, criado de maneira serial pelo SGABD.

**[04:05]** Ele vai preencher os valores para mim.

**[04:07]** E aí eu vou colocar esta coluna como primary key, como chave primária.

**[04:12]** O que significa?

**[04:13]** Que eu não posso ter repetição na coluna id funcionário.

**[04:17]** Faz sentido eu ter dois funcionários com o mesmo id?

**[04:20]** Não faz sentido, não é?

**[04:22]** Então coluna id funcionário vai ser chave primária, não pode ter repetição.

**[04:26]** Vírgula próxima coluna, nome.

**[04:30]** Nome é tipo texto, não é?

**[04:31]** Então vai ser varchar de 50 posições.

**[04:34]** Por que varchar?

**[04:35]** É porque caractere variável.

**[04:38]** Eu posso ter uma pessoa cujo nome, nome sobre nome, nome completo, tem 50 caracteres?

**[04:44]** Sim.

**[04:45]** Posso ter uma pessoa cujo nome completo tem 40 caracteres?

**[04:49]** Sim.

**[04:50]** A pessoa pode ter um nome completo com 10 caracteres?

**[04:52]** Sim.

**[04:53]** Não importa, até 50 vai caber na coluna.

**[04:56]** Se tiver 51 caracteres no nome, não cabe nessa coluna.

**[05:00]** Aí eu preciso depois usar, por exemplo, o alter para alterar o tipo de dado e permitir

**[05:06]** incluir nomes com mais caracteres, por exemplo.

**[05:09]** Vírgula departamento também vai ser o tipo caractere variável, com até 50 posições.

**[05:15]** Vírgula salário.

**[05:16]** Salário não é caractere, não é?

**[05:18]** Não é tipo texto.

**[05:20]** Salário vai ser numérico, então vou colocar decimal.

**[05:23]** Eu vou permitir até 10 números antes da vírgula e até 2 números depois da vírgula,

**[05:29]** até 2 valores.

**[05:30]** Isso aqui é uma forma de você criar tabela com linguagem SQL usando direto instrução

**[05:36]** do DDE.

**[05:37]** Só que o PG de Min é seu amigo, ele traz uma outra alternativa.

**[05:42]** Olha aqui, DS, botão direito aqui em Tables, Create Table.

**[05:48]** Ali abre para você uma interface, você pode colocar, por exemplo, aqui, funcionários.

**[05:52]** Isso aqui é útil para quem está aprendendo.

**[05:55]** Não lembra sintaxe.

**[05:56]** Antes de sair pesquisando por aí, vem direto aqui e a partir desta tela começa a criar

**[06:02]** sua tabela.

**[06:03]** Olha que aparece aqui em cima, a bin SQL.

**[06:05]** E aí você já sabe.

**[06:07]** Ele vai começar a desenhar para você aqui exatamente a instrução SQL completa.

**[06:12]** Isso é muito útil.

**[06:13]** Aliás, eu uso o tempo inteiro.

**[06:15]** Você acha que eu decoro instrução SQL?

**[06:18]** Claro que não.

**[06:19]** Quando eu não lembro eventualmente uma instrução, uma sintaxe, eu uso direto isso aqui no PG

**[06:23]** de Min.

**[06:24]** Quando eu começo a criar um objeto, ele já me traz a sintaxe, opa, daí eu complemento

**[06:28]** e sigo em frente.

**[06:29]** Isso é uma dica para acelerar ainda mais o seu trabalho.

**[06:32]** Então depois, explore essa opção, pode fechar por agora, não precisa salvar.

**[06:37]** Basta você agora executar e pronto.

**[06:40]** Tabela criada com sucesso.

**[06:41]** Vem aqui, botão direito, dá um refresh, atualiza, tabela funcionários foi criada.

**[06:47]** Utilizando uma instrução DDL.

**[06:49]** No próximo vídeo, nós continuamos.

**[06:51]** Até lá.
