# Aula 9 - Funções de Agregação e Agrupamento - Parte 2-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:32:14

---

**[00:00]** Ficou claro pra você porque usamos a cláusula groupBy? Nós usamos pra poder agrupar os

**[00:13]** dados de maneira segmentada. Então, neste caso, o agrupamento que eu quero é o cálculo

**[00:19]** da média. Só que eu quero ir segmentado por departamento. Eu poderia ter outras colunas

**[00:25]** aqui no select, e aí tudo que não estiver na função de agregação tem que vir para o

**[00:30]** groupBy. Além do groupBy, você também pode ordenar os dados. De fato, a ordenação pode

**[00:36]** ser feita com qualquer cláusula SQL. Ou seja, eu vou agrupar, como eu acabei de fazer, só que

**[00:43]** agora eu quero ordenar o resultado. Aí eu vou usar a cláusula orderBy. Observe que agora eu tenho

**[00:48]** uma ordem de ordenação, neste caso, por departamento. Com isso eu vou unindo mais e mais

**[00:53]** instruções SQL. Pois bem, vamos agora fazer o seguinte, hein? Atenção, atenção máxima. Eu quero

**[01:01]** a média salarial por departamento somente se a média for maior do que 20 mil. Eu quero ordenado

**[01:09]** por departamento. Eu vou colocar aqui a query anterior, que eu acabei de colocar, inclusive,

**[01:15]** aqui pra você. Então, olha só, quando você executa esta query, você tem a média salarial

**[01:21]** pra qualquer departamento, né? Então ele vai contar os funcionários em cada departamento,

**[01:25]** vai somar os salários, vai dividir pelo número de funcionários, vai ter a média do departamento,

**[01:31]** vai fazendo isso, departamento a departamento. Tudo bem? Só que agora eu gostaria de fazer essa

**[01:38]** regração aplicando um filtro somente se a média for maior do que 20 mil. Pois bem, como fazemos isso?

**[01:47]** Eu poderia fazer isso aqui, ó. Dá uma olhada. O where permite você aplicar filtros na sua instrução

**[01:54]** SQL. Assim como eu usei no update, no delete, não é ainda pouco? Nós usamos também com select. O

**[02:01]** where é onde, não é? Em inglês. Neste caso, eu vou aplicar um filtro. Aí eu posso colocar os filtros,

**[02:07]** colocar as colunas que eu tenho e usar os operadores, tanto relacionais quanto lógicos,

**[02:12]** ok? Pois bem, eu tô pedindo média maior do que 20 mil. Então, eu vou fazer o seguinte,

**[02:18]** eu vou pegar a média, assim que eu calculo a média aqui em cima, vou colocar aqui no where.

**[02:24]** E aí eu vou colocar um sinal que é exatamente um operador relacional. Tô relacionando a média

**[02:30]** maior do que 20 mil. Vou copiar aqui, ó. Pronto. Faz sentido essa query? Aparentemente sim, não é?

**[02:38]** Ou seja, tô aplicando filtro. Eu quero agrupamento, mas quando tiver o resultado, eu quero exatamente,

**[02:45]** somente onde o salário, a média do salário, for maior do que 20 mil. Executa. Opa, mensagem de erro.

**[02:53]** Vamos ler a mensagem de erro, ok? Eu tô fazendo esse exercício por conta da deficiência de

**[03:00]** meus alunos em ler a mensagem de erro. A mensagem de erro muitas vezes diz o que tá acontecendo.

**[03:04]** Aliás, as mensagens de erro estão cada vez melhores. Ler junto comigo. Error. Aggregate functions,

**[03:11]** funções de agregação não são permitidas no where. Pronto, é isso. Essa função de agregação

**[03:18]** aqui, a VG, assim como a max, min, count e sum, não podem ser usadas na clausula where. Isso tem uma

**[03:27]** forma lógica, não é? Observe como funciona a ordem de execução de uma query SQR. Ele vai fazer o

**[03:35]** select, certo? Aí ele vai buscar os dados da tabela funcionários. Quando chegar no where,

**[03:41]** eu pergunto pra você, a média já foi calculada? Ainda não. A média só vai ser calculada quando

**[03:51]** chegar na clausula group by. Mas a clausula group by é a próxima. Então, quando eu tentar

**[03:58]** usar o cálculo da média no where, não dá, porque ainda não foi calculada a média. Só vai ser

**[04:04]** calculada daqui a pouco no group by. Ou seja, essa é a razão pela qual não dá pra usar a função

**[04:10]** de agregação no where. Aí alguém pode dizer, ok, Strutor, então vai lá e muda de lugar. Sempre

**[04:17]** é aquele que opa, só mudar de lugar que resolve. Tudo bem, muda de lugar e veja o erro mudar também.

**[04:23]** Agora eu estou com erro de sintaxe. O group by não pode vir antes da clausula where. Bom, e agora,

**[04:31]** então, Strutor, como que eu resolvo isso? Meu chefe está esperando um relatório, eu preciso entregar

**[04:36]** exatamente a média salarial por departamento somente se a média for maior do que 20 mil.

**[04:41]** Bom, nós temos uma forma de fazer isso usando outra clausula SQL. Nós usamos exatamente o

**[04:48]** having. O having foi criado exatamente para suprir esse problema da clausula where. O having, ele vem

**[04:57]** depois do group by. É mais ou menos como se fosse where, veja que é a mesma regrinha que eu acabei

**[05:02]** de colocar, só que é outra clausula, porque ela vem depois do group by. Então vai ser feito o

**[05:08]** agrupamento, depois que é feito o agrupamento é o filtro. Aí eu uso a clausula having, executa e

**[05:15]** veja a mágica acontecer. Pronto, funcionou. Muita gente, eu repito, muita gente não compreende isso,

**[05:23]** não sabe exatamente por que está usando o having. Sai usando por aí e não faz ideia do que está

**[05:28]** acontecendo. O having é um filtro depois do group by. O where é um filtro antes do group by. Então

**[05:37]** eu posso usar a função de agregação no where, porque eu não cheguei no group by ainda. Então se eu

**[05:41]** colocar isso aqui, vou colocar aqui só para que fique bem claro para você, olha só que interessante,

**[05:47]** o where é executado antes do group by. Só que antes do group by, eu não fiz ainda o cálculo de

**[05:55]** agregação. Então eu não posso usar isso aqui. O having é usado depois do group by. Então eu posso

**[06:02]** usar ali o filtro de agregação, nenhum problema. Eu posso usar o where com outros filtros, mas não

**[06:08]** posso usar com função de agregação. Tudo bem? Está claro para você? Daqui a pouco eu mostro um

**[06:14]** exemplo inclusive com filtro também usando o where. Então quando você tiver que calcular a

**[06:19]** agregação e a partir daí aplicar um filtro, você vai usar a clausula having, que é o filtro depois

**[06:27]** da agregação. Está claro? Executo aqui mais uma vez e aí está para você. Vamos deixar então a

**[06:33]** coisa um pouco mais animada. Eu quero agora isso aqui, fica à vontade inclusive para dar um pause no

**[06:40]** vídeo e tentar resolver. Vou chegar um pouquinho para o lado. Isso aqui é o que eu quero. Vou colocar

**[06:46]** inclusive aqui outra linha. Eu quero a meta salarial por departamento, somente se a média for maior

**[06:54]** ou menor, o filtro que eu acabei de explicar. E somente se o nome do departamento tiver a palavra

**[07:00]** engenharia e eu quero ordenado por departamento. Eu agora tenho um filtro depois do group by e eu

**[07:07]** tenho um filtro antes do group by. Neste caso eu uso o where e eu uso o having. Eu tenho que usar as

**[07:13]** duas cláusulas. Olha aqui o exemplo, só que interessante, para ficar bem claro para você aquilo

**[07:19]** que é geral, causa muitas dúvidas em muitas pessoas. Eu vou selecionar o departamento,

**[07:24]** média de salário, na tabela funcionários. Eu então coloco a clausula where e eu vou dizer onde

**[07:31]** o departamento for like. Isso aqui é um outro operador SQL. O que é o like? Permite você

**[07:38]** filtrar usando strings, caracteres. Observe a sintaxe. Você coloca entre aspas simples e coloca

**[07:46]** o curinga, que é o percente. Ou seja, se na coluna departamento ele vai olhar para cada linha,

**[07:52]** então nessa coluna, se por acaso tiver alguma coisa com o nome engenharia, ele vai filtrar.

**[07:58]** É isso que eu quero. Vai ter o agrupamento por departamento e o outro filtro. Esse outro filtro

**[08:05]** é depois do group by. Esse filtro aqui é antes do group by. Pronto, executa a query e aí está para

**[08:12]** verificar. Vamos verificar de novo e anunciar. Média salarial por departamento somente se a média

**[08:18]** for maior que 20 mil. Olha lá, a média é maior que 20 mil? Sim, perfeito. E somente se o nome

**[08:23]** departamento tiver a palavra engenharia. Tem palavra engenharia? Sim, excelente. E ordenado por departamento,

**[08:29]** nesse caso só tem um. Então ok, ótimo. Eu poderia até tirar a ordenação inclusive se eu quisesse.

**[08:33]** Está claro para você o where e o having? Tem que aplicar filtro na agregação? Tem que ser feito

**[08:40]** no grupo by? Você vai usar having? Tem que aplicar qualquer outro filtro que não seja agregação?

**[08:45]** Você coloca no where. No próximo vídeo nós continuamos. Até lá.
