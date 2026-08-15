# Aula 24 - Lab 1 - Criação de Relatórios do DW com Linguagem SQL.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:19:33

---

**[00:00]** O que você acha de aproveitarmos a oportunidade e então praticarmos um pouquinho de linguagem

**[00:14]** SQL?

**[00:15]** Já que é uma das propostas também deste capítulo.

**[00:19]** Nós automatizamos a criação do DW, mas para que serve o DW?

**[00:24]** Para fazer consultas, para você extrair relatórios.

**[00:28]** Então o que você acha de agora responder a essas três consultas?

**[00:33]** Uma consulta simples, uma intermediária e uma avançada.

**[00:37]** Gostaria de listar o total de vendas por cliente.

**[00:41]** Listar o total de vendas por categoria para cliente do tipo 1.

**[00:46]** Produtos com média de vendas superior a 600 no ano de 2023.

**[00:52]** Que tal?

**[00:53]** Dê um pause no vídeo e construa as queries.

**[00:57]** Eu vou entregar as três para você, vou mostrar agora e vou entregar.

**[01:01]** Mas é a chance de praticar, não é?

**[01:03]** Então dê agora um pause no vídeo, crie as suas queries, até para você experimentar

**[01:07]** também um pouco o BigQuery.

**[01:09]** Eu vou trazer agora as respostas para você.

**[01:12]** Está tudo aqui neste arquivinho.

**[01:13]** Relatórios.txt na pasta de dados.

**[01:17]** Vamos começar com a primeira consulta simples.

**[01:20]** Eu tenho aqui as três queries prontinhas para você.

**[01:23]** Vou copiar aqui a query, trago para cá.

**[01:26]** Select, nome cliente, soma do valor de venda, arredondando para duas casas decimais.

**[01:32]** E aí eu vou fazer um from para tabela de cliente e colocar o caminho completo.

**[01:37]** Então coloco o nome do projeto, o nome do dataset, o nome da tabela.

**[01:42]** Igualzinho eu fiz lá com o script ac.

**[01:45]** Faço join com a outra tabela que é a tabela fato.

**[01:49]** Porque a tabela de cliente tem o nome do cliente.

**[01:51]** A tabela fato tem o total de venda.

**[01:54]** Para não ficar usando esses nomes gigantescos, eu coloco apelidos.

**[01:57]** Alias, faço então o join com a cláusula 1 e agrupo pelo nome de cliente.

**[02:04]** A coluna que não está na função de agregação, ela vem para o group by.

**[02:08]** Certo?

**[02:09]** Perfeito.

**[02:10]** Então só você executar, é só você aguardar alguns instantes e pronto.

**[02:14]** A mágica acontece.

**[02:15]** Olha lá que coisa bacana.

**[02:17]** Temos a tabelinha de dados com a resposta com o total de vendas para cada cliente.

**[02:23]** E você pode ainda clicar nisso aqui, gráfico.

**[02:26]** Clica lá.

**[02:27]** Adivinha o que vai fazer?

**[02:29]** Isso mesmo você pensou.

**[02:30]** Vai criar o gráfico completinho para você.

**[02:33]** Não é à toa que o pessoal está apaixonado pelo BigQuery.

**[02:37]** Não é de hoje.

**[02:38]** O BigQuery é uma ferramenta que está há algum tempinho aí no mercado, mas que facilita

**[02:42]** bastante o trabalho de quem vai usar linguagem SQL no dia a dia.

**[02:46]** Ou seja, rapidamente você levanta um DW de maneira automatizada, jaca os dados carregados

**[02:51]** e começa a extrair o que é mais valioso para a empresa, que é a análise, entregar

**[02:56]** resultados e assim por diante.

**[02:58]** Pois bem, vamos para a próxima.

**[03:00]** Então aqui eu tenho a consulta intermediária.

**[03:03]** Neste caso tem que fazer mais joins entre mais tabelas.

**[03:08]** Vou chegar um pouquinho aqui para baixo.

**[03:10]** Veja que eu tenho select, categoria de produto, total de venda, a soma redondando para duas

**[03:15]** casas.

**[03:16]** Eu busco as três tabelas fazendo os respectivos joins.

**[03:20]** Eu vou filtrar pela causalware, onde tipo cliente é igual a tipo 1, e faço o agrupamento.

**[03:27]** Então executa.

**[03:28]** Veja que ele já vai direto aqui para a criação do gráfico, mas você pode aqui, claro, visualizar

**[03:33]** os resultados e aí está para você.

**[03:35]** Vamos para o último item.

**[03:37]** Agora a query um pouquinho mais de trabalho, utilizando having.

**[03:41]** Então vem para cá, coloca a query.

**[03:44]** O que nós queremos?

**[03:46]** Produtos com média de vendas superior a 600 no ano 2023.

**[03:50]** Eu fui buscar os dados nas tabelas, depois disso eu usei a causalware para buscar o intervalo

**[03:56]** de data entre 1 do 1 de 2023 e 31 do 12 de 2023.

**[04:02]** Eu faço o agrupamento com a coluna que não está na função de agregação.

**[04:06]** Quando você aplica um filtro pela agregação, não posso fazer isso no where, tem que fazer

**[04:12]** isso no having.

**[04:13]** Porque quando chega no where, a média não foi calculada ainda.

**[04:18]** Então não posso colocar filtro de média, nem total, nem valor máximo, mínimo, etc. no where.

**[04:24]** Eu só posso usar o filtro no having, porque aqui é executado depois do group buy.

**[04:31]** Eu então quero somente a média de valor venda maior do que 600, então faço a ordenação.

**[04:38]** Executa e ele vai trazer o resultado completo para vocês.

**[04:41]** Se quiser também visualizar no formato de gráfico, aí está.

**[04:45]** Aproveitamos a oportunidade e ainda trouxemos também linguagem SQL para poder experimentar

**[04:51]** o nosso data warehouse.

**[04:52]** Fique à vontade para explorar um pouco mais a linguagem SQL.

**[04:57]** Você pode até alterar as tabelas se quiser, você pode trazer outras tabelas, é só refazer

**[05:02]** todo o processo de automação e aproveite para explorar um pouco mais esse ambiente

**[05:06]** que nós criamos.

**[05:07]** Vou falar nisso, está na hora de destruir.

**[05:11]** Pois bem, acabou o trabalho.

**[05:14]** Os analistas já extraíram os relatórios, já extraíram a informação para o tomador

**[05:18]** de decisão, está todo mundo feliz.

**[05:21]** Então agora eu vou destruir esse ambiente, não preciso mais da infraestrutura.

**[05:25]** Como fazemos isso?

**[05:27]** Eu conto para você no próximo vídeo.

**[05:29]** Até lá.
