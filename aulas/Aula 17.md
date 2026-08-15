# Aula 17.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:09:39

---

**[00:00]** E então, por que você acha que eu coloquei um random ID para criar o nome do job?

**[00:15]** Esse é o job de carga de dados na tabela.

**[00:17]** Detalhe, isso aqui é para carregar uma tabela.

**[00:20]** Já já mostro aqui a continuidade para você.

**[00:23]** Mas por que o random ID?

**[00:25]** A questão é simples.

**[00:26]** Quando você cria o job, o BigQuery automaticamente cria um número para você e usa aquele número

**[00:32]** para a mesma tabela.

**[00:34]** Internamente ele faz o controle dele.

**[00:36]** Se eu não colocasse aqui um valor randômico, quando eu tentasse executar uma segunda vez,

**[00:42]** ele ia dar erro dizendo que o job já existia.

**[00:45]** Ele internamente faz um outro controle.

**[00:47]** O que eu estou fazendo aqui é um meu controle dizendo que cada vez que eu criar o job, eu

**[00:51]** quero um número aleatório para evitar conflito.

**[00:54]** Porque ele sempre vai usar o mesmo nome e ele faz o controle interno dele.

**[00:58]** Então o que eu estou fazendo aqui é evitando conflito na hora de criar novos jobs.

**[01:03]** E como eu vou trazer esse random ID?

**[01:05]** Você não vai acreditar.

**[01:07]** Tem um recurso para isso com IAC.

**[01:09]** Olha que legal.

**[01:10]** A linguagem HCL do Terraform tem um recurso chamado random string.

**[01:15]** Eu vou dar um apelido canhoso.

**[01:16]** Vou chamar de random ID.

**[01:18]** Vou definir exatamente o comprimento.

**[01:20]** Então vou colocar um número bem longo, de 8 bits nesse caso.

**[01:24]** Não é necessário caractere especial, nem maiúsculo.

**[01:26]** Ele vai gerar essa numeração para mim e então eu vou usar isso para nomear o job.

**[01:31]** Isso vai evitar conflito, correndo o risco de não conseguir executar o job, porque já

**[01:36]** existe um com aquele nome.

**[01:38]** Pronto, resolvido o problema.

**[01:40]** Agora eu vou indicar o seguinte.

**[01:42]** Qual é o label?

**[01:44]** Eu vou dar um label chamado dsa-job para o job-sql1.

**[01:49]** E eu vou usar esse label também nas próximas tabelas.

**[01:52]** Ou seja, vou colocar um único label para o job, mas internamente o ID vai ser diferente.

**[01:57]** É basicamente o mesmo controle que faz o BigQuery.

**[02:01]** Só que eu estou fazendo o meu controle através desse número random.

**[02:04]** Pronto.

**[02:05]** Agora eu vou para o load.

**[02:07]** O que você acha que faz isso aqui?

**[02:09]** Carrega, não é isso?

**[02:10]** Vai carregar os dados.

**[02:11]** Como eu vou levar esses dados para o BigQuery?

**[02:14]** Vamos pensar juntos.

**[02:16]** Eu poderia levar os dados direto da minha máquina local, como está aqui?

**[02:21]** Sim, temos opções para isso.

**[02:24]** Entretanto, o mais seguro é o que?

**[02:27]** Você vai até o BigQuery, faremos isso daqui a pouquinho, você vai criar um gs.

**[02:32]** O que é um gs?

**[02:34]** É um Google Storage.

**[02:35]** Isso mesmo, Google Storage, que é um outro serviço para o GCP.

**[02:40]** Você vai dar um nome para esse storage, dsa-modeling-p1, daqui a pouco eu vou criar junto com você,

**[02:46]** e lá eu vou colocar o arquivo CSV, vou colocar todos eles.

**[02:50]** Olha só que legal que nós vamos fazer.

**[02:52]** Quando eu subir o DW, eu vou até o storage, que está lá também na nuvem, eu vou buscar

**[02:58]** o arquivo e vou carregar na tabela.

**[03:01]** Pronto.

**[03:02]** O usuário vai estar liberado, vai poder montar as queries e relatórios.

**[03:05]** Quando eu deletar o DW, que eu também vou fazer com você, o arquivo de origem vai ficar

**[03:10]** intacto, porque eu não vou deletar o storage, eu vou deletar somente o data warehouse.

**[03:15]** Ou seja, eu vou usar o Google Storage apenas para armazenar o arquivo fonte.

**[03:21]** Poderia ser várias alternativas, eu poderia trazer isso de um outro banco de dados, eu

**[03:25]** poderia trazer isso inclusive de um outro provedor de cloud computing.

**[03:29]** Isso é uma estratégia segura, de modo que a única coisa que você precisa manter é

**[03:34]** o seu script main.tab.

**[03:37]** Todo o restante já está na nuvem, aliás, o próprio arquivo main.tab também pode colocar

**[03:41]** na nuvem.

**[03:43]** Você pode criar o estado remoto, colocar na nuvem, enfim, são várias opções.

**[03:46]** Mas a ideia é, o main.tf é a única coisa que eu terei local, por exemplo.

**[03:53]** Os meus arquivos fonte já estarão no storage.

**[03:56]** E aí eu posso atualizar esses arquivos com outro processo, um outro job, por exemplo.

**[04:01]** Toda vez que eu subir o DW, eu vou até esse storage, pego o arquivo e carrego na tabela.

**[04:06]** A tabela vai estar carregada e disponível para o usuário.

**[04:09]** Usuário acabou?

**[04:10]** Eu vou deletar a tabela, mas o arquivo fonte continua disponível no storage.

**[04:15]** Eu poderia também criar o storage aqui, direto pelo script.

**[04:19]** Mas decidimos manter de forma separada, até você entender que realmente será algo separado

**[04:23]** em relação à automação que estamos fazendo.

**[04:26]** Observe que eu vou colocar exatamente o arquivo CSV, olha lá, TB cliente dsa.

**[04:32]** Esse arquivo daqui a pouquinho eu vou colocar na nuvem e vou mostrar passo a passo para você.

**[04:36]** Eu então tenho que dizer qual é a tabela de destino.

**[04:39]** Como eu identifico a tabela de destino?

**[04:41]** Ela tem nome sobre nome.

**[04:43]** Eu busco projeto, eu busco dataset, eu busco a tabela.

**[04:48]** Pronto, esse será o meu destino.

**[04:50]** Por quê?

**[04:51]** Porque você pode ter vários projetos, você pode ter vários datasets, você pode ter várias

**[04:55]** tabelas.

**[04:56]** Mas eu só posso ter uma tabela com o nome em um dataset em um projeto.

**[05:01]** Então é uma identificação única para garantir que não tenha problema de carregar os dados,

**[05:05]** por exemplo, na tabela errada.

**[05:07]** Não é?

**[05:08]** Isso vai causar muitos problemas, concorda?

**[05:11]** Então eu estou identificando de maneira única a tabela.

**[05:14]** Depois disso eu coloco apenas alguns parâmetros de configuração de segurança para poder

**[05:18]** carregar os dados.

**[05:20]** Você pode ajustar esses parâmetros, depois eu recomendo que você visite a documentação

**[05:23]** lá do Google Cloud Platform para entender como isso pode ser customizado na hora que

**[05:27]** você estiver trazendo os dados diretamente para o seu Datum in House.

**[05:31]** Mas isso aqui é para uma tabela.

**[05:33]** Eu tenho mais duas, não é?

**[05:35]** Então continue comigo no próximo vídeo.

**[05:37]** Até lá.
