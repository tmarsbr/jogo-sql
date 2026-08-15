# aula 13.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:34:25

---

**[00:00]** Vejamos o próximo bloco dentro do nosso arquivo,

**[00:11]** que agora é um bloco de recurso, um resource.

**[00:14]** Então agora eu vou provisionar um recurso no meu provedor de Cloud Computing.

**[00:20]** Observe que eu tenho uma primeira expressão entre aspas,

**[00:24]** depois eu tenho uma segunda. Tome cuidado aqui, atenção.

**[00:28]** Essa primeira expressão, que é Google Big Query Dataset,

**[00:32]** é o nome do recurso na configuração do HCL.

**[00:36]** Então isso aqui não pode ser um nome aleatório.

**[00:39]** Tem que ir até a documentação do HCL e verificar qual é o nome que ele dá

**[00:43]** para o recurso chamado Dataset Big Query.

**[00:46]** Lembra que eu mostrei para você quando exploramos o Big Query?

**[00:50]** Não tinha que criar o Dataset? Então, eu estou dizendo, por gentileza, crie o recurso.

**[00:55]** Esse é o nome lá no Big Query.

**[00:57]** Esse nome que aparece aqui, até você perceber que está customizado,

**[01:01]** é o nome que você vai dar.

**[01:03]** Então neste caso estou dizendo o seguinte,

**[01:05]** querido Terraform, tudo bem com você? Como vai? Por gentileza.

**[01:10]** Provisiona aí para mim esse recurso, que é um Dataset no Big Query.

**[01:14]** Eu quero como nome de configuração, eu quero DSA Dataset.

**[01:19]** Mas tome cuidado, atenção agora, atenção máxima.

**[01:21]** Veja que tem um Dataset ID aqui embaixo.

**[01:24]** DSA DW Dataset. Mas como assim? Outro nome?

**[01:28]** Tem diferença, hein?

**[01:30]** Esse nome que aparece dentro de Chaves é um nome que vai para o Big Query.

**[01:36]** Esse nome aqui que está fora de aspas, DSA Dataset,

**[01:40]** é o nome de configuração para o Terraform.

**[01:43]** De fato, isso aqui é um apelido para o nome do recurso.

**[01:47]** Então esse recurso está na documentação do HCL, só para ficar bem claro para você.

**[01:52]** Eu estou dando um apelido, DSA Dataset.

**[01:55]** Entre Chaves eu coloco o que vai lá para o provedor de Cloud Computing.

**[02:00]** Aí vai esse nome, DSA DW Dataset.

**[02:02]** Que questão de colocar nome diferente para você entender exatamente a diferença.

**[02:06]** Eu então vou ter um nome amigável, Friendly Name, DSA Lab 1.

**[02:11]** Coloco uma descrição e coloco uma localidade, estou colocando apenas US,

**[02:16]** desde que o Google cuide disso para nós.

**[02:18]** Ele vai de fato trabalhar com multi-region, mas a partir do US West 1.

**[02:23]** Ou seja, isso aqui que nós estamos fazendo é basicamente olhando para o Big Query.

**[02:29]** Você vai lá, olha para o Big Query.

**[02:31]** E o que eu tenho que fazer agora?

**[02:32]** Tem que criar um Dataset.

**[02:34]** Aí você vem para HCL, ok.

**[02:36]** Como eu provisiono esse Dataset via linguagem?

**[02:39]** Vai ter a documentação, busca o nome correspondente,

**[02:42]** coloca o seu alias e depois os parâmetros de configuração.

**[02:46]** Pronto, isso aqui elimina a necessidade de você ir até o navegador,

**[02:51]** depois configurar manualmente.

**[02:53]** Não estou dizendo o que é para configurar.

**[02:55]** É interessante fazer aqui um paralelo.

**[02:57]** Eu já trabalho com tecnologia há quase 30 anos.

**[03:00]** Eu comecei bem cedo, com 17 anos de idade.

**[03:02]** São quase 30 anos de carreira nesse momento que estou aqui gravando as aulas para você.

**[03:06]** Já passei por muita coisa em tecnologia ao longo de toda a minha vida.

**[03:10]** E eu já trabalhei com automação de instalação de servidores do Windows NT.

**[03:16]** Isso é da antiga, é bem da antiga, eu sei.

**[03:19]** Você nunca ouviu falar do Windows NT?

**[03:21]** Então abra o Google aí e pesquisa.

**[03:23]** Nós tínhamos que fazer instalação do Windows NT em vários servidores simultaneamente.

**[03:27]** Nós automatizávamos essa tarefa através de um script

**[03:32]** com todos os comandos necessários para você responder ao Windows

**[03:36]** de maneira automática durante a instalação.

**[03:38]** Sabe quando que eu fiz isso?

**[03:40]** Há mais de 25 anos atrás.

**[03:42]** Estamos aqui de novo, automatizando alguma coisa.

**[03:46]** Só que agora é criação do DW da nuvem.

**[03:48]** Ou seja, essas experiências que você vai adquirindo no meio do caminho,

**[03:52]** isso vai servindo como degrau para o próximo passo, o próximo item.

**[03:56]** E aí você percebe que não muda muita coisa não.

**[03:59]** A tecnologia evoluiu aqui, evoluiu um pouco a colar,

**[04:03]** mas no final das contas estamos automatizando,

**[04:05]** só usando outra ferramenta, outro procedimento,

**[04:08]** uma outra alternativa de algo que já fazemos em tecnologia há três décadas pelo menos.

**[04:14]** Então isso aqui nada mais é do que um bloco de recurso

**[04:18]** para você criar o dataset, o que é mandatório no BigQuery.

**[04:21]** Eu só consigo criar as tabelas se eu criar o dataset primeiro.

**[04:25]** O dataset é só um nome bonito que o BigQuery dá para banco de dados, ok?

**[04:29]** Ele vai criar um banco de dados gerenciado e lá dentro você vai criar as tabelas.

**[04:33]** Mas eu tenho que criar um nome que é Darya Dataset, então é um nome que temos que usar.

**[04:37]** No próximo vídeo nós continuamos.
