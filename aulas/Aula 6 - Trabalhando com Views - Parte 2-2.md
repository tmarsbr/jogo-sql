# Aula 6 - Trabalhando com Views - Parte 2-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:54:22

---

**[00:00]** Vejamos um outro exemplo de Vue. Primeiro, deixa eu mostrar para você as tabelas físicas

**[00:13]** que nós temos aqui, que somente funcionários e projetos nós criamos durante a preparação

**[00:18]** do banco de dados. Aquela tabela temporária que está na Vue, ela não existe fisicamente,

**[00:24]** só existe no momento que a query é executada, no nosso caso quando a Vue é executada. Se quiser

**[00:30]** fazer qualquer verificação na Vue, veja que aparece uma categoria aqui embaixo, views, clica

**[00:35]** lá, já está aparecendo a nossa Vue, vou chegar aqui um pouquinho para o lado, você chegar esse

**[00:40]** painel para o lado, aí está ele, vem aqui com o botão direito na Vue e então properties,

**[00:45]** ou propriedades. Mostra aqui para você alguns detalhes e mostra também o código SQL, tem aqui

**[00:51]** o código de security, o código SQL para você criar e alterar a view. O código está aqui dentro,

**[00:56]** isso aqui é o que está salvo no banco de dados, exatamente a view, com a query que nós utilizamos,

**[01:03]** ou seja, ao invés de salvar a query local no seu computador, você salva direto no banco de dados,

**[01:08]** de fato uma das boas práticas ao usar um banco de dados é você não executar as queries diretamente,

**[01:15]** você criar views e entregar as views para as aplicações, para usuários finais, isso é uma

**[01:21]** forma de deixar a coisa um pouco mais organizada, mais segura, só vai ter acesso ao código da view,

**[01:27]** quem tiver certo é o administrador do banco de dados, então quem criou a view. Se eu não der o

**[01:32]** acesso, o usuário final não consegue ver o código, não consegue ver a query, ele vai usar apenas isso

**[01:38]** que está aqui, exatamente o selete. Pois bem, vejamos um outro exemplo, você observou que eu

**[01:44]** criei a view anterior, vou trazer aqui novamente o código, utilizando create or replace, então se

**[01:52]** por acaso você quiser alterar o código da view, você pode alterar, executa, se não existir a view,

**[01:58]** ele cria, se já existir, ele faz o replace, tem umas pequenas regrinhas, se você tentar alterar

**[02:05]** algumas colunas, etc, o banco de dados não vai deixar você fazer o replace, aí você vai ter que

**[02:09]** usar a view e criar de novo, para deletar, botão direito e delete, ou então faz o drop, usar o comando

**[02:15]** drop, e aí você cria de novo a view, dependendo do tipo de modificação, você consegue usar o

**[02:21]** replace, ou então apenas cria a view diretamente, sem necessariamente usar o replace, vou mostrar

**[02:27]** aqui o exemplo para você, quero uma view para retornar a funcionários alocados em projetos,

**[02:32]** então create view, você não é obrigado a usar o replace, é opcional, aqui o nome da view, o esquema,

**[02:39]** aí vem a query, essa query vai basicamente criar uma tabela temporária chamada funcionários projetos,

**[02:47]** essa tabela é o resultado desta query que faz um left join entre tabela de projetos e tabela de

**[02:55]** funcionário, eu quero buscar funcionários alocados em projetos, eu então crio a tabela temporária,

**[03:00]** depois faço o select, importante, isso aqui que eu estou marcando com o mouse, tudo isso aqui é uma

**[03:07]** única query, não são duas queries não, tome cuidado, é sempre bom botar o ponto e vírgula no

**[03:13]** final para saber onde a query termina, então tudo isso aqui é uma única query, deixa eu provar para

**[03:19]** você, embora eu já tenha mostrado isso, é sempre bom revisar, executa a query primeiro, aí está ela,

**[03:24]** funcionários alocados em projetos, certo? Acho que eu coloquei aqui o colete, então se por acaso

**[03:31]** não tiver projeto associado, vou preencher com zero para o ID e N, para o nome do projeto,

**[03:36]** se eu tentar executar apenas a parte de cima, seleciona somente esta parte, executa, mensagem de

**[03:44]** erro, está errado a sintaxe, porque na prática isso aqui não é uma outra query, toda a sintaxe,

**[03:51]** do jeito que está aqui, representa uma query única, exatamente onde termina o ponto e vírgula,

**[03:56]** isso é importante porque parece que são coisas diferentes, mas não, é uma query única que está

**[04:02]** criando uma tabela temporária e logo depois faz select nessa tabela, vamos então criar a view,

**[04:07]** utilizo o create view, executa, view criada com sucesso, e então na sequência para você executar,

**[04:14]** exatamente chamar o select, a view agora tratada como se fosse uma tabela, executa e aí está o

**[04:21]** resultado para você, perfeito, faz um refresh aqui do lado para ver se a view já aparece,

**[04:27]** sim já aparece e aí está ela. A view é ótima para você guardar sua query no banco de dados,

**[04:33]** para você esconder a lógica da query, para você organizar melhor aquilo que o usuário pode fazer,

**[04:39]** porque se você deixar o usuário final executar a query que ele quiser e ele não tiver conhecimento

**[04:46]** de item SQL, o que vai acontecer? Ele pode criar relatórios errados, não é? Imagine que o usuário

**[04:53]** não conhece o conceito de left join, right join, full join, ele está lá, simplesmente vai criando

**[04:59]** de qualquer jeito, cria um relatório errado, manda para a diretoria, vai dar problema, muitas

**[05:05]** empresas evitam isso criando a view, alguém que tem conhecimento SQL, preferencialmente,

**[05:11]** vai construir a query, você vai gravar isso como uma view e o usuário final acessa a view,

**[05:17]** de forma que todo mundo que tiver acesso ao banco de dados vai ver sempre o mesmo relatório,

**[05:22]** é uma forma segura, não é? Você entregar os resultados, ok? Só que a view tem um pequeno

**[05:29]** problema, não sei se você já percebeu, qual é o problema? Quando você faz select aqui,

**[05:35]** você está dizendo ao banco de dados, e aí banco de dados, tudo bem? Execute a view, lá dentro tem

**[05:41]** a query e retorne o resultado. Então, cada vez que você executa esse select na view, a query dentro

**[05:49]** da view é executada. Se o banco de dados tiver tabelas muito grandes, volume grande de linhas

**[05:56]** em cada tabela, se a query é muito complexa, você pode ter problemas de performance, faz sentido?

**[06:02]** A view é só uma caixa, ok? A view mesmo é como se fosse uma caixinha, um repositório para você

**[06:09]** executar a query. Cada vez que você executa esse comando, é a query que está sendo executada.

**[06:13]** Isso pode causar problemas de performance se a query não foi bem construída, se o volume de dados

**[06:19]** é muito grande, se tem muito usuário executando essa view, então você pode ter problemas de

**[06:24]** performance. Aí o pessoal pensou, ok, como resolvemos isso? Resolvemos com a view materializada.

**[06:32]** Leia o item que você vai encontrar na sequência com a definição e eu já trago os exemplos para

**[06:37]** você no próximo vídeo. Muito obrigado e até lá.
