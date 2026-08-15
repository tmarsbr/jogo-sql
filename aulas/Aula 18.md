# Aula 18.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:11:06

---

**[00:00]** Podemos, então, concluir o nosso script.

**[00:10]** Aqui está para você.

**[00:12]** Eu tenho agora o job para tabela 2, que é a tabela de produto, e depois para tabela

**[00:17]** 3, que é a tabela fato.

**[00:20]** Essencialmente o mesmo que eu expliquei para você nos vídeos anteriores, agora apenas

**[00:25]** com cuidado de criar o dsa job 2, depois atribuir esse id, que exatamente é o label dsa job.

**[00:33]** Então lá no BigQuery será um único dsa job, mas internamente eu terei três ids,

**[00:41]** cada qual para uma tabela respectiva, exatamente as três tabelas com as quais iremos trabalhar.

**[00:46]** Veja que eu estou buscando cada arquivo CSV lá do storage, daqui a pouquinho nós vamos

**[00:52]** configurar, e sempre estou buscando o nome da tabela com o identificador único, que

**[00:57]** é o nome do projeto, o id do data set, então o id da tabela.

**[01:01]** Então identificação única para que o Terraform saiba exatamente aonde ele vai carregar os

**[01:08]** dados e carregue na tabela adequada.

**[01:11]** E assim nós temos o nosso script de automação.

**[01:15]** Instructor, eu achei que essa automatização fosse mais automatizada, Instructor.

**[01:20]** Então, eu me divirto muito quando eu vejo as pessoas falando de automação no mercado,

**[01:25]** como se fosse algo mágico, não é?

**[01:28]** Ok, algumas pessoas acham que sim, eu tenho uma visão um pouco diferente.

**[01:32]** Automação em geral, ela traz ainda mais trabalho, porque nós temos que construir o processo

**[01:37]** de automação, e detalhe, isso aqui não substitui o conhecimento com a tecnologia,

**[01:45]** que neste caso é o provedor de cloud computing.

**[01:47]** Eu vou repetir, isso aqui não substitui o conhecimento no provedor de cloud computing.

**[01:53]** Se você não conhecer o GCP, como você vai saber qual é o recurso que você busca, que

**[01:58]** tem que criar um job, que tem que configurar, por exemplo, a fonte de dados?

**[02:03]** Como vai saber de tudo isso?

**[02:05]** De fato, se você parar para analisar aqui friamente, o que nós temos de Terraform aqui

**[02:10]** é pouquíssimo, né?

**[02:12]** O Terraform é o aplicativo que vai processar esse script, que está em HCL.

**[02:17]** Tudo que nós fizemos aqui foi colocar blocos indicando os recursos, mas para poder saber

**[02:23]** quais blocos e quais recursos, tem que conhecer o provedor de cloud computing.

**[02:28]** No curso de AC, eu trago quase que um curso inteiro de AWS, por exemplo, logo no começo

**[02:33]** do treinamento.

**[02:34]** São mais de 10 capítulos só com AWS.

**[02:37]** Eu ensino como funciona lá no provedor de cloud computing, depois eu mostro como automatizar.

**[02:43]** Pelo menos acreditamos aqui na DSA que é a melhor estratégia para poder ensinar aos alunos.

**[02:47]** Se eu ensinasse isso aqui para você apenas mostrando o código, ok, mas aí você ia

**[02:52]** começar a perguntar, e agora, para que serve isso?

**[02:54]** Para que faz isso?

**[02:55]** O que é aquilo ali?

**[02:56]** Então, tem que conhecer o provedor.

**[02:58]** Por isso que eu sempre trago as explicações sobre a tecnologia.

**[03:01]** Isso vale para AWS, Microsoft Azure, GCP, Databricks e tantas outras plataformas suportadas

**[03:08]** pelo Terraform.

**[03:10]** Então, o seu trabalho aqui com o IAC é construir o script de automação.

**[03:14]** Isso aqui é só um script, não é?

**[03:16]** No curso de AC, eu trago projetos que têm 30 scripts diferentes.

**[03:21]** Você pode criar um script de variáveis, você pode criar um script de autenticação,

**[03:25]** um script somente de provedores, porque dá para trabalhar com Terraform com o conceito

**[03:30]** de multi-cloud.

**[03:31]** Então, você pode criar um recurso ao mesmo tempo em dois provedores de cloud computing.

**[03:36]** Então, eu poderia criar um DW em um provedor, por exemplo, configurar o ETR em outro provedor.

**[03:42]** Totalmente impossível, né?

**[03:43]** E aí fazer a integração entre eles.

**[03:45]** Tudo isso através dos arquivos aqui com o HCL.

**[03:49]** Sem falar em várias outras opções, como grupo de segurança, autenticação.

**[03:54]** Você pode configurar o storage, a fonte de dados, o destino, configurar as ferramentas.

**[03:58]** Dá para fazer muita coisa usando exatamente o HCL.

**[04:02]** Então, eu trouxe para você o script completo.

**[04:05]** Agora, vamos colocar tudo isso para funcionar.

**[04:08]** Vamos ver se esse negócio funciona mesmo.

**[04:09]** Obrigado e até a próxima aula.
