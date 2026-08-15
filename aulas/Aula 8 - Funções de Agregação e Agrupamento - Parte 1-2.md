# Aula 8 - Funções de Agregação e Agrupamento - Parte 1-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:29:15

---

**[00:00]** Eu já terminei o script 01.

**[00:10]** O script 01 SQL no nível Baby.

**[00:14]** Eu vou começar agora o 02, que é SQL no nível Master, e daqui a pouco o 03, que é SQL no

**[00:22]** nível Ninja.

**[00:23]** Tudo bem?

**[00:25]** Se por acaso ainda tiver alguma dúvida sobre o script 01, que é a parte mais básica da

**[00:31]** linguagem SQL, eu recomendo que você vá até o curso gratuito.

**[00:35]** Foi isso mesmo que você ouviu.

**[00:37]** Gratuito de Power BI aqui na DSA.

**[00:40]** Tem um capítulo chamado SQL Analytics, onde eu trago uma introdução completa da linguagem

**[00:44]** SQL.

**[00:45]** Você pode ir direto nesse capítulo, acompanhar, tem lá o passo a passo, instrução DML, o

**[00:52]** mesmo, da linguagem, caso você queira praticar um pouco mais do que nós vimos no 01.

**[00:57]** Essa parte de introdução linguagem SQL, isso tem que estar bem claro pra você.

**[01:02]** Você sabe pra que serve o select, pra que serve o update, delete, como faz o insert,

**[01:08]** está bem claro, o que cada uma dessas instruções representa na hora de usar a linguagem SQL.

**[01:14]** Está claro que pra criar o objeto tem que usar o create.

**[01:17]** Você pode alterar ainda o objeto, ou então dropar.

**[01:20]** Isso é o básico do básico da linguagem SQL.

**[01:23]** Aqui neste capítulo eu quero trazer para você linguagem SQL e para engenheiros de

**[01:26]** dados.

**[01:27]** Então agora eu preciso aumentar um pouquinho o nível de complexidade, ok?

**[01:31]** Continue acompanhando as aulas sempre na sequência.

**[01:34]** Vamos então para o script02, lembrando que os scripts estão no final do capítulo.

**[01:39]** Pois bem, vamos lá para o pgAdmin.

**[01:41]** Eu tinha deletado a tabela no finalzinho do script01, não é isso?

**[01:45]** Então agora eu vou recriar a tabela, inserir de novo os registros e seguir adiante junto

**[01:50]** com você.

**[01:51]** Então vou abrir aqui um query tool, vou criar a mesma tabela que eu vim usando anteriormente.

**[01:57]** Daqui a pouco eu vou criar uma segunda tabela, tabela funcionários, com a chave primária,

**[02:02]** nome, departamento, data de contratação e salário.

**[02:04]** Executa, pronto, tabela criada com sucesso.

**[02:07]** Eu vou então inserir registros nessa tabela.

**[02:11]** Aqui estão as instruções de insert, não é isso?

**[02:14]** Executa, pronto, inserido com sucesso.

**[02:17]** Vamos agora checar se os dados estão lá na tabela como nós esperamos.

**[02:22]** Perfeito, todos os dados carregados com sucesso.

**[02:27]** Podemos então seguir adiante com o nosso trabalho em linguagem SQL.

**[02:32]** Este é um curso sobre Data Warehouse, certo?

**[02:35]** O Data Warehouse é um banco de dados consolidado, ou seja, você pega dados dos bancos transacionais,

**[02:43]** que são usados no dia a dia, da operação da empresa, você agrega, sumariza, agrupa

**[02:50]** os dados, cria o seu modelo de Data Warehouse, coloca os dados naquele modelo e disponibiliza

**[02:57]** isso para os relatórios, como faremos inclusive ao longo do curso, certo?

**[03:02]** Então muito provavelmente durante a preparação dos dados para carregar no Data Warehouse,

**[03:08]** você vai ter que fazer algum trabalho de agregação, sumarização, agrupamento dos dados.

**[03:13]** Vamos estudar o que a linguagem SQL nos oferece em relação a isso.

**[03:17]** Nós temos essencialmente cinco funções de agrupamento, vou trazê-las aqui para você.

**[03:23]** Temos a função min, max, avg, sum e count.

**[03:29]** O nome da função já diz mais ou menos para que ela serve, né?

**[03:33]** Eu consigo retornar o valor mínimo, o valor máximo, avg de average, então é a média,

**[03:39]** a soma e então a contagem.

**[03:42]** Eu aplico a função, indico a coluna onde eu quero executar a função e de onde eu

**[03:47]** vou extrair os dados, ou seja, o nome da tabela.

**[03:50]** Então executa e pronto, aí está o resultado.

**[03:53]** Você observa que no cálculo do avg, que é a média, veja que eu tenho várias casas

**[03:58]** decimais.

**[03:59]** Isso é normal quando trabalhamos especialmente com postgreSQL, ou seja, ele coloca o número

**[04:04]** máximo ali de casas decimais que está configurado por padrão no SGBD.

**[04:08]** Mas é muita casa decimal, não é?

**[04:11]** Então vamos usar uma outra função SQL para deixar a coisa um pouco mais enxuta,

**[04:16]** até porque estamos fazendo agrupamento.

**[04:18]** Então vamos usar a função round.

**[04:20]** Veja que eu estou usando avgsalário como argumento dentro da função round.

**[04:27]** Então uma função é argumento dentro de outra função.

**[04:31]** Daqui a pouco eu vou trazer mais exemplos.

**[04:33]** A função round, como você espera pelo nome, faz o arredondamento.

**[04:37]** Neste caso eu quero duas casas decimais.

**[04:40]** Veja que para as outras colunas eu não preciso, porque o avg é o único que é calculado

**[04:45]** usando uma divisão.

**[04:46]** Como se calcula a média?

**[04:49]** Você soma os elementos e divide pelo número de elementos.

**[04:52]** Como há uma divisão, nós temos muitas casas decimais.

**[04:56]** As outras colunas não têm divisão, por isso tem menos casas decimais.

**[05:00]** Pois bem, vamos executar com round.

**[05:03]** Pronto, agora ficou um pouco mais amigável, não é o seu resultado?

**[05:08]** Sempre usaremos round quando trabalharmos com avg.

**[05:11]** Na sequência, vamos agora estudar exatamente como fazemos agrupamentos.

**[05:16]** Atenção que tem mais regrinhas aqui importantes.

**[05:19]** Tudo que eu vou mostrar agora eu vou usar avg.

**[05:22]** Mas a regra se aplica para min, max, sum e count.

**[05:26]** Mas eu vou concentrar exatamente na média, porque é algo bastante comum, principalmente

**[05:31]** quando preparamos data houses.

**[05:33]** Então aqui está.

**[05:35]** Quera salarial geral.

**[05:37]** O que nós vamos fazer aqui?

**[05:39]** Nós vamos olhar para a coluna de salário, nós vamos somar todas as linhas nesta coluna

**[05:46]** e dividir pelo número de linhas.

**[05:48]** É assim, calculamos a média aritmética, certo?

**[05:51]** Neste momento, quando você executar o cálculo, opa, selecionei salário, agora sim executa,

**[05:56]** lá está.

**[05:57]** Neste momento, quando você executa esta query, isso aqui olha para toda a sua tabela.

**[06:04]** Então ele vai olhar especificamente na tabela funcionários, vai na coluna salário, vai

**[06:09]** calcular a média considerando todas as linhas.

**[06:12]** Então isso aqui é a média geral.

**[06:15]** Neste caso, eu não estou fazendo nenhum tipo de segmentação.

**[06:19]** Eu estou apenas calculando uma função de agregação, só isso.

**[06:22]** Só que no dia a dia, você provavelmente vai querer segmentar o resultado.

**[06:28]** Por exemplo, ao invés de salário geral, eu quero salário por departamento.

**[06:34]** Não temos vários departamentos lá dos funcionários?

**[06:36]** Então eu poderia vir aqui agora e colocar o departamento.

**[06:40]** Só que é importante, muitas pessoas têm dúvida com relação a isso, principalmente

**[06:45]** quando iniciam em SQL.

**[06:47]** Eu quero a média de salário por departamento.

**[06:50]** Ou seja, para cada departamento, ele vai pegar os funcionários daquele departamento,

**[06:56]** vai buscar o salário, vai somar e dividir pelo número de funcionários daquele departamento.

**[07:00]** Certo?

**[07:01]** Isso é agregação, só que agora de maneira segmentada.

**[07:05]** Executa, opa, mensagem de erro.

**[07:09]** E agora?

**[07:10]** O que a gente faz?

**[07:11]** Senta e chora.

**[07:12]** Sai correndo gritando desesperado.

**[07:15]** É mensagem de erro, mensagem de erro.

**[07:16]** Não, a gente lê a mensagem, compreende e resolve o problema.

**[07:21]** Observe a mensagem, o que ela diz.

**[07:23]** A coluna departamento, da tabela funcionários, precisa aparecer na cláusula group by, ou

**[07:30]** então ser usada na função de agregação.

**[07:33]** Esta é uma regra, você vai encontrar isso em linguagem SQL em qualquer SGBD, que as

**[07:39]** pessoas têm muitas dúvidas.

**[07:42]** Ou seja, simplificando para você para anotar no seu caderninho, todo e qualquer coluna

**[07:47]** que não estiver na função de agregação tem que ir para o group by.

**[07:52]** Vou repetir.

**[07:53]** Todo e qualquer coluna que não estiver na função de agregação tem que ir para o

**[07:57]** group by.

**[07:58]** Quais são as funções de agregação?

**[08:00]** Me, Max, AVG, Sun e Count.

**[08:03]** Tudo bem?

**[08:04]** Então, com isso, nós temos que usar exatamente a cláusula group by.

**[08:10]** Eu estou dizendo o seguinte.

**[08:12]** Querido motor de execução da linguagem SQL, por favor, vá até a tabela funcionários,

**[08:18]** verifique os funcionários de cada departamento.

**[08:21]** Para cada departamento, você vai pegar o salário dos funcionários, você vai calcular a média,

**[08:26]** você vai somar e dividir pelo número de funcionários do departamento e vai mostrar

**[08:30]** isso para mim de maneira totalmente agregada e segmentada.

**[08:34]** Está claro?

**[08:36]** Se você usar apenas a média ou qualquer função de agregação, você não precisa

**[08:42]** do group by, porque nesse caso é a média global, geral.

**[08:47]** Bastou você fazer qualquer tipo de segmentação, neste caso, o que não estiver, a coluna que

**[08:53]** não estiver na função de agregação vai para o group by.

**[08:56]** Você pode colocar 15 colunas aqui, 13, 14, 20, 50, todas elas terão que ir para o group

**[09:03]** by.

**[09:05]** Toda e qualquer coluna que não estiver na função de agregação vai para o group by,

**[09:09]** senão você não estará fazendo agrupamento e, consequentemente, vai pegar aquela mensagem

**[09:13]** de erro que eu acabei de mostrar para você.

**[09:15]** No próximo vídeo, nós continuamos até lá.
