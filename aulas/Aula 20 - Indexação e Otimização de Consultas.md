# Aula 20 - Indexação e Otimização de Consultas.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:50:09

---

**[00:00]** E para concluir este capítulo, vamos falar um pouquinho de performance.

**[00:12]** Eu vou tratar isso em alguns momentos durante o curso, quando estivermos consultando os

**[00:16]** dados que nós carregarmos nos data warehouses.

**[00:20]** Eu voltarei e falarei um pouquinho mais de otimização e performance.

**[00:23]** Bom, imagine que eu tenha esta query, vou colocá-la aqui para você.

**[00:28]** Eu vou executá-la, o que faz exatamente a query.

**[00:31]** Vamos subir aqui um pouquinho.

**[00:34]** Veja que ela retorna uma tabela temporária, que é exatamente o resultado do select, que

**[00:40]** traz o nome do funcionário, departamento e salário, o ID do projeto, o nome do projeto.

**[00:45]** Estou usando o collect, porque eu estou fazendo left join, e aí no left join eu posso não

**[00:49]** ter correspondência, então para não deixar nulo, eu uso collect.

**[00:54]** Estou fazendo join entre a tabela de projetos e de funcionário.

**[00:58]** Depois disso, eu faço o select nessa tabela temporária para retornar quem tem salário

**[01:04]** maior do que 20 mil.

**[01:05]** E aí está para você o resultado.

**[01:07]** Ou seja, são os funcionários alocados em projetos, mas somente quem tem salário acima

**[01:13]** de 20 mil.

**[01:14]** Tudo bem?

**[01:15]** Esta query tem boa performance?

**[01:18]** Para você responder essa pergunta, tem que checar o plano de execução.

**[01:23]** Você pode clicar aqui em cima, está vendo o botão E que aparece aqui em cima?

**[01:27]** Se você passar o mouse, ele vai mostrar se pode executar o F7 ou apenas clicar.

**[01:32]** Ele então vai abrir para você o plano de execução da query.

**[01:36]** Então veja que foi feito um hash na tabela de funcionários e um hash right join na tabela

**[01:41]** de projetos, para que ele pudesse retornar os resultados para você.

**[01:45]** Se você clicar aqui em cima em análises, ele mostra as operações que foram realizadas.

**[01:51]** Tem ainda as estatísticas, número de registros retornados, número de operações e assim

**[01:55]** por diante.

**[01:56]** Uma outra forma de você também visualizar o plano da query é você utilizar o Explain.

**[02:02]** Vem aqui no início e coloca a palavra Explain.

**[02:05]** Isso vale para qualquer query.

**[02:08]** Executa e ele já mostra direto o plano de execução.

**[02:11]** Quem criou esse plano de execução?

**[02:13]** O SGVD.

**[02:15]** Isso vale para qualquer consulta que você executar com a SQL.

**[02:19]** A sua consulta vai até as tabelas.

**[02:22]** As tabelas estão em arquivos do banco de dados.

**[02:25]** Quando você executa a query, o motor de execução SQL vai fazer uma checagem completa do que

**[02:30]** é necessário para retornar os registros.

**[02:32]** Ele cria um plano de execução.

**[02:35]** Como qualquer coisa na vida, precisamos de um plano.

**[02:37]** Aí está o plano.

**[02:39]** Como eu chego até o resultado e retorno.

**[02:41]** Só que o plano de execução tem um custo, como qualquer coisa na vida.

**[02:46]** Observe que aparece aqui a palavra Cost.

**[02:48]** Está vendo?

**[02:49]** Que aparece aqui em várias linhas.

**[02:51]** Esse Cost é o custo computacional para você executar aquela operação na consulta SQL.

**[02:58]** Sim, eu sei que é muita coisa.

**[03:00]** É muita coisa mesmo.

**[03:01]** Tem que estudar, aprender, isso mesmo.

**[03:03]** Não tem jeito.

**[03:04]** Quando trabalharmos nos DWs, eu vou executar algumas operações de consulta para poder

**[03:09]** gerar os relatórios e aí eu vou gerar o plano de execução e vou utilizar a query

**[03:13]** junto com você.

**[03:14]** Estou fazendo uma introdução nesse momento.

**[03:17]** Dá para melhorar essa query?

**[03:19]** Bom, podemos tentar, pelo menos.

**[03:22]** Nós criamos as tabelas e nós, em momento algum, criamos índices.

**[03:27]** Imagine um livro.

**[03:28]** Para que tem um índice no livro?

**[03:30]** Para que você possa ter uma ideia das páginas onde tem cada tópico.

**[03:35]** Ele cria um índice que é um roteiro.

**[03:38]** Se eu quiser aquele tópico, eu vou ter aquela página, que é o outro tópico, aquela outra

**[03:41]** página.

**[03:42]** O índice é um atalho para você poder ir direto onde você precisa.

**[03:46]** Não é assim no livro?

**[03:48]** Então, no banco de dados é a mesma coisa.

**[03:50]** Eu vou criar um índice para que eu possa ter a indexação completa em uma coluna e isso

**[03:55]** ajudar o motor de execução na hora que ele estiver montando o plano.

**[04:00]** Como criamos um índice no banco de dados?

**[04:02]** Utilizando o createIndex.

**[04:03]** Deixa eu trazer aqui para você.

**[04:06]** Coloca aqui no finalzinho.

**[04:08]** CreateIndex idxFuncionáriosId com tabela de funcionários na coluna id funcionário.

**[04:15]** Essa coluna é chave primária, mas não tem um índice propriamente dito criado.

**[04:19]** Então, vou criar um agora.

**[04:21]** Pronto.

**[04:22]** Criei um índice que dá uma ajudinha, dá um empurrãozinho para tentar melhorar a performance

**[04:27]** da query.

**[04:28]** No nosso caso, o volume de dados é muito baixo.

**[04:30]** Não vai fazer nenhuma grande diferença, mas vamos verificar agora o plano de execução.

**[04:34]** Executa.

**[04:36]** Você percebe que houve uma mudança nos valores de custo, porque agora estou influenciando

**[04:42]** o motor de execução SQE.

**[04:43]** É por isso que os índices são tão importantes.

**[04:46]** Um banco de dados, e aliás, são importantíssimos em um DW.

**[04:49]** Porque, em geral, o DW, Data Warehouse, tem volume de dados imenso.

**[04:53]** Então, para um DW, inclusive, temos uma coisa chamada plano de índices.

**[04:58]** O ser humano adora criar essas coisas.

**[05:01]** Plano de índices.

**[05:02]** Quais os índices são importantes de acordo com as consultas que eu quero a partir do DW?

**[05:07]** Pois bem.

**[05:08]** Não é só sair criando um índice sem critério, não.

**[05:10]** Temos que analisar se o índice é necessário ou não.

**[05:13]** Por que?

**[05:14]** Se o índice não for necessário, ou não melhorar o custo, de fato, ele pode causar

**[05:19]** mais problemas de lentidão do que resolvê-los.

**[05:22]** Então, tem que saber como criar um índice, onde criar, avaliar o plano de execução e

**[05:26]** verificar se aquilo gerou um resultado ou não.

**[05:29]** Eu posso criar índices para diferentes colunas.

**[05:32]** Vou criar um outro aqui embaixo.

**[05:34]** Por exemplo, vou criar um índice na coluna de salário.

**[05:38]** Por quê?

**[05:39]** Porque o salário está na cláusula WHERE.

**[05:41]** A cláusula WHERE é usada para você aplicar o filtro.

**[05:45]** Essa cláusula normalmente se beneficia de índices nas colunas que você coloca no WHERE.

**[05:51]** Então eu posso, por exemplo, tentar criar um índice para ver se eu consigo ou não

**[05:55]** melhorar a performance da minha query, executar de novo o plano de execução.

**[06:00]** A expectativa é tentar reduzir o custo.

**[06:03]** Veja que não houve grande diferença porque o primeiro índice já resolveu o problema.

**[06:07]** Então eu não precisaria do segundo.

**[06:09]** Seria uma questão de apenas deletar o segundo índice.

**[06:12]** Por quê?

**[06:13]** Se eu deixar o índice.

**[06:14]** Cada vez que eu carregar os dados, eu vou ter também que mexer no índice.

**[06:18]** Isso pode causar problema de performance.

**[06:21]** O índice muito pesado, ele deixa a query mais lenta do que sem o índice.

**[06:26]** Então o índice tem que ser tratado com cuidado.

**[06:29]** A gente cria índice.

**[06:30]** Não, cria isso.

**[06:31]** A criada vai resolver.

**[06:32]** Às vezes a lentidão é causada pelo índice.

**[06:35]** É isso, é conhecimento para poder resolver os problemas conforme necessário.

**[06:39]** Se você não quiser mais o índice, adivinha o que você faz?

**[06:43]** Você dropa o índice.

**[06:44]** Só você fazer o drop, drop index e aí o nome do índice que você quer deletar, deleta

**[06:50]** índice deletado com sucesso, se por acaso não é mais necessário.

**[06:55]** Outra coisa que fazemos na carga de um dedado, no processo ATL, desativamos todos os índices.

**[07:00]** Primeiro você pode desativar ou até deletar também se você quiser.

**[07:04]** Carrega os dados seu índice, porque é mais rápido a carga de dados.

**[07:08]** Depois você habilita, ativa ou recria os índices.

**[07:11]** O índice tem que ser atualizado periodicamente à medida que a tabela recebe novos dados.

**[07:17]** Mais ou menos no livro.

**[07:18]** Pensa no livro.

**[07:19]** Você comprou, tem o índice e as páginas.

**[07:22]** Por alguma razão você adicionou mais páginas ao livro.

**[07:25]** O que tem que fazer com o índice?

**[07:26]** Tem que atualizar.

**[07:27]** Não é?

**[07:28]** Não posso saber quais são as páginas com os tópicos respectivos.

**[07:31]** Então mesma coisa, igualzinho, mesma analogia aqui nesse caso.

**[07:35]** Se eu modifiquei a tabela, eu tenho que fazer a atualização do índice, aí eu tenho que

**[07:40]** eventualmente acionar a manutenção do banco de dados para fazer o refresh do índice

**[07:45]** periodicamente.

**[07:46]** Isso é comum em quase qualquer SGBD.

**[07:49]** As empresas fazem o trabalho de manutenção toda sexta-feira à noite ou final de semana,

**[07:55]** para que possa atualizar os índices e mantê-los sempre saudáveis.

**[07:58]** Dá então poder realizar as consultas com a maior velocidade possível.

**[08:03]** O FA.

**[08:05]** Que capítulo foi esse?

**[08:06]** Um passeio completo pela programação de banco de dados.

**[08:11]** Trouxe para você os principais conceitos explicados passo a passo, com uma série de

**[08:16]** Para que você possa usar isso como referência no seu dia a dia, que também usaremos aqui

**[08:19]** mesmo neste curso.

**[08:20]** Nós vamos criar os DWs, vamos ter que fazer a carga de dados.

**[08:25]** Então quando realizarmos as consultas, vamos trabalhar também com os índices.

**[08:29]** Vou trazer dicas sobre stock procedures, vamos usar ferramentas de ETL, vou mostrar como

**[08:34]** você pode fazer uma chamada, uma stock procedure que esteja no seu banco de dados, você pode

**[08:38]** customizar isso.

**[08:40]** Ou seja, temos bastante diversão ainda pela frente.

**[08:43]** Volte, revise o material deste capítulo, faça mudanças nas queries, nas views, views

**[08:49]** materializadas, stock procedure, trigger.

**[08:51]** Vou praticar bastante isso que eu trouxe para você neste capítulo.

**[08:55]** Então encontre comigo no próximo.

**[08:57]** Muito obrigado e até lá.
