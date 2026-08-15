# Aula 5 - Trabalhando com Views - Parte 1-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:52:05

---

**[00:00]** Vamos começar programação de banco de dados criando views ou visões.

**[00:14]** Algumas pessoas também chamam de vistas no banco de dados. Você leu aí a definição no

**[00:20]** item anterior e qual o grande objetivo ao criar uma view? Vou mostrar de forma super didática,

**[00:28]** uma tabela temporária e objetiva para você. Aqui eu tenho uma query. Essa query está usando

**[00:34]** o conceito de CTE que eu expliquei para você no finalzinho do capítulo anterior. Eu estou

**[00:39]** criando basicamente uma tabela temporária com a salário do departamento. A partir deste select,

**[00:44]** só que cria uma tabela temporária na memória da sessão do banco de dados. Depois eu faço um

**[00:50]** select na minha tabela de funcionários e fazendo um join com a tabela temporária que eu acabei de

**[00:56]** aplicar. E aí aplica um filtro. Isso aqui é uma query, que vai gerar basicamente um relatório

**[01:01]** com um objetivo. Eu quero saber quais funcionários têm salário acima da média. Então primeiro eu

**[01:09]** calculo aqui o agrupamento, calculando a média e arredondando para duas casas decimais. Depois eu

**[01:15]** faço uma junção da minha tabela de funcionários para a tabela temporária. Fazendo a junção eu

**[01:20]** coloco um filtro salário acima do salário médio. Dois funcionários ganham acima da média. Imagine

**[01:28]** que eu tenho que executar esta query periodicamente. Todo dia, toda semana tem que executar a query

**[01:33]** para gerar o relatório. Vou ficar executando a mesma query o tempo inteiro esse código? Não. Você

**[01:40]** vai fazer isso aqui. Vem aqui em cima, na parte superior aqui e coloca mais uma cláusula. Desta

**[01:47]** forma. Create ou replace view. E aí eu crio uma visão. Essa visão vai se chamar VW, detalhes

**[01:55]** funcionários, Eis, toda esta query. Para deixar de forma bem clara. A view é você salvar sua query

**[02:03]** no banco de dados. É isso. Estou salvando a query e deixando no banco. Em vez de deixar gravado no

**[02:08]** meu computador, no ScriptSkelly, eu salvo no banco de dados. Neste caso a nossa view vai retornar

**[02:14]** a query com um salário maior que a média do departamento. Executa. A view será criada. Pronto.

**[02:20]** Já pode fechar isso aqui. Pode inclusive apagar tudo isso. Toda vez que tiver que executar este

**[02:26]** relatório, você agora executa assim. A view é tratada como se fosse uma tabela. Você faz o select

**[02:33]** asterisco, direto na view e retorna o resultado. Ou seja, você salvou a query no banco de dados.

**[02:39]** É simples, né? Pois bem, a quantidade de pessoas que têm dúvidas sobre isso é algo impressionante.

**[02:44]** Porque o nome view, eu acho que ele não é muito intuitivo, né? Então as pessoas estão começando

**[02:50]** em SQL em geral. Tem muitas dúvidas. Mas como assim? Que a view exatamente? É só gravar uma

**[02:55]** query no banco? Sim, é só isso mesmo. É só gravar uma query no banco. Porque, aliás, é muito bom,

**[03:01]** dicas de passagem. Porque você que vai executar o usuário final ou uma aplicação que pode executar

**[03:08]** a query. Você não está vendo o código da view e não precisa ver. Você vai usar a view como se

**[03:13]** fosse uma tabela. Internamente o banco de dados vai executar a query e mostrar o resultado para

**[03:18]** você. Neste caso eu criei uma view acessando apenas uma tabela, que é a tabela de funcionários,

**[03:23]** e fazendo o join com a tabela temporária. Mas eu posso colocar a query que eu quiser dentro da view,

**[03:30]** inclusive fazendo join com outras tabelas físicas que eu tenha. Pois bem, vou mostrar o exemplo para

**[03:35]** você agora no próximo vídeo. Até lá.
