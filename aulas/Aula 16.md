# Aula 16.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:07:32

---

**[00:00]** Tudo bem até aqui? Conseguindo acompanhar? Eu sei que é muita coisa, mas é muita coisa mesmo,

**[00:13]** não tem jeito. Estou procurando trazer para você de maneira bem detalhada, explicando os conceitos.

**[00:18]** Você também está aprendendo um pouco sobre o BigQuery, o que é importante, que está sendo

**[00:23]** amplamente usado aí no mercado. E se depois quiser aprender sobre IAC e mais detalhes,

**[00:29]** tem o curso inteiro aqui na DSA, onde eu ensino do ponto mais básico até projetos bem avançados,

**[00:35]** trabalhando com a AWS, com a Microsoft Azure e com o Databricks. No curso de IAC,

**[00:41]** não abordamos o GCP, então esse material aqui está recebendo exclusivo para você neste curso.

**[00:48]** Achamos que era importante trazer esse material até para começar aqui nosso trabalho com

**[00:54]** as causas. Automação com IAC é cada vez mais comum no mercado de um modo geral.

**[00:59]** Mas Strutor, eu achei que esse negócio de automação fosse mais automatizado,

**[01:05]** Strutor. Estou vendo muita coisa manual nesse script, Strutor. Então, bem-vindo ao mundo real,

**[01:12]** lado de cá, não é? O outro lado do balcão tem o lado das pessoas que estão vendo a automação.

**[01:18]** Olha a automação, como é bonita, está tudo automatizado, que coisa linda. Agora o balcão

**[01:23]** do outro lado, não é? Nós que estamos automatizando sabemos que não é bem assim.

**[01:27]** Eu participei recentemente de um projeto de automação com IAC e a empresa, quando nós

**[01:33]** começamos o projeto, a empresa tinha dois engenheiros de dados. E aí fizemos um

**[01:37]** extenso trabalho de automação, toda a infraestrutura com IAC, o projeto levou três meses,

**[01:43]** um belo projeto por sinal. Quando acabou o projeto, a empresa contratou mais dois engenheiros de dados,

**[01:49]** ela duplicou, ficou com quatro pessoas, contratou mais um de nível júnior e um outro de nível pleno,

**[01:55]** junto com os dois que já existiam na empresa. Ou seja, automação duplicou a quantidade de

**[02:00]** empregos. Por quê? Porque muitas vezes as pessoas olham para automação como, ah, automação é para

**[02:06]** remover pessoas, não é? Automação é para substituir o ser humano. Não. Automação muitas vezes é para

**[02:14]** reduzir os erros humanos. Você automatiza para evitar erros manuais, erros que você manualmente

**[02:22]** acabaria cometendo. Automação visa muito mais isso do que substituir pessoas. Em geral, automação,

**[02:30]** pelo menos em tecnologia, claro que outras áreas podem ser um pouco diferentes, mas em tecnologia,

**[02:34]** automação normalmente gera mais trabalho. Veja, estamos aqui construindo script, né? Depois disso,

**[02:41]** eu tenho que manter o script, fazer manutenção, eu tenho que executar o script daqui a pouco,

**[02:46]** ele vai gerar o arquivo de estado, tem que controlar o arquivo de estado, tem que monitorar todo o

**[02:51]** ambiente. Eventualmente eu posso agendar esse processo para criar, destruir a infraestrutura.

**[02:55]** Pronto, já tem aí mais uma série de tarefas complementares. Então deixo para você pensar

**[03:01]** sobre isso também. Se quiser deixar sua opinião, fica à vontade só usar o fórum do treinamento.

**[03:06]** Vamos agora preparar a automação da carga de dados, né? Eu vou entregar a tabela vazia lá para o pessoal

**[03:13]** de relatórios, o pessoal vai vir atrás de mim. Então eu vou entregar o DW prontinho, carregado.

**[03:18]** E como vamos fazer isso? Observe, vou criar mais um recurso, o resource, daqui a pouco explico o

**[03:25]** random string aqui em cima. Primeiro olha para cá, resource, eu vou usar o Google Big Query Job,

**[03:30]** mas como assim, Strutor? O que é isso? Toda vez que você carrega uma tabela no Big Query,

**[03:38]** ele cria um job. Ele faz isso, ele mostra inclusive, criando job. Pois bem, eu quero automatizar esse

**[03:46]** trabalho, que é a carga de dados na tabela do Big Query. O que isso demonstra? Que você tem que

**[03:52]** conhecer sobre o provedor de cloud computing. Automação, como ia ser, qualquer ferramenta de

**[03:58]** estrutura como código, não substitui conhecimento sobre o provedor de cloud computing. O que eu estou

**[04:04]** explicando aqui, muito mais inclusive, é o próprio funcionamento do provedor. Ou seja, como o Big

**[04:10]** Query carrega uma tabela lá pela interface do navegador? Ele cria um job. Você só escolhe no

**[04:17]** menu qual é a tabela, de onde vem o arquivo, e ele vai criar o job para você. Só que aqui eu tenho

**[04:22]** que automatizar. Então tem um recurso para isso, que é o Google Big Query Job. Eu vou dar um apelido

**[04:27]** a todos, vou chamar de JobSQL 1. Eu então vou preparar o job ID. E nesse job ID eu vou colocar

**[04:36]** um valor randômico. E agora, por que eu vou fazer isso? Pergunta de um milhão de dólares. Vou deixar

**[04:44]** você pensando, e eu trago a resposta no próximo vídeo. Até lá!
