# Aula 21 - Lab 1 - Executando a Automação da Infraestrutura do DW - Parte 1_3.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:14:24

---

**[00:00]** Já temos tudo o que precisamos, então vamos executar o processo de automação.

**[00:12]** Eu vou usar o container Docker como máquina cliente.

**[00:17]** Não é obrigatório isso aqui para que todos no curso, eu, você, todos os alunos, utilizem

**[00:23]** o mesmo sistema operacional como máquina cliente.

**[00:26]** Isso aqui também é uma ajuda para o pessoal do Windows, para que o pessoal não fique sofrendo,

**[00:31]** instalando ferramenta, não funciona, conflita e dá problema.

**[00:34]** Só usar Linux, tudo funciona perfeitamente.

**[00:36]** Então vem aqui, clica nos três pontinhos e abre o terminal.

**[00:40]** Digita Bash.

**[00:42]** Nós já criamos esse container com o mapeamento para pasta.

**[00:47]** Digita ls.

**[00:49]** Veja que eu tenho a pasta lab1.

**[00:52]** Isso aqui foi feito no mapeamento que eu mostrei, inclusive, nas aulas anteriores, mas no início

**[00:56]** do capítulo.

**[00:57]** Então acessa a pasta cd lab1.

**[01:00]** Lá dentro eu tenho mentf.

**[01:02]** É aqui que eu vou executar agora os comandos.

**[01:05]** Atenção.

**[01:06]** O primeiro comando é o terraform init.

**[01:10]** Isso aqui é para inicializar o ambiente, onde tem o arquivo mentf, e então baixar também

**[01:17]** o provider, porque nesse momento eu não tenho absolutamente nada.

**[01:22]** Eu só tenho um arquivo mentf.

**[01:24]** Então o terraform init vai checar o arquivo, ele vai baixar o provedor, nesse caso é para

**[01:31]** o GCP, para Google Cloud Platform, e vai colocar isso em arquivos ocultos para você.

**[01:35]** Para que ele saiba onde ele vai conectar.

**[01:38]** Então digita terraform init.

**[01:40]** Isso aqui é obrigatório para inicializar o diretório onde estão os seus arquivos

**[01:44]** de configuração.

**[01:45]** Pressiona enter.

**[01:46]** Veja que ele está inicializando, está fazendo download, por exemplo, do pacote random, fazendo

**[01:52]** também o download lá do Google.

**[01:53]** Pronto, excelente.

**[01:55]** Tem que aparecer essa mensagem aqui.

**[01:57]** Foi inicializado com sucesso.

**[01:58]** Muito bom.

**[01:59]** Dá um clear na tela, pode limpar a tela.

**[02:02]** E agora o que eu faço?

**[02:03]** Eu utilizo a instrução, deixa eu usar a setinha para cima para botar o último comando, terraform

**[02:09]** apply, ou seja, aplicar automação.

**[02:13]** Ele vai ler o arquivo mentf, vai verificar o que ele tem que criar, e vai mandar tudo

**[02:19]** isso para o GCP.

**[02:20]** A essa altura é bem provável que você esteja se perguntando, mas peraí, cadê a autenticação?

**[02:26]** Se estivesse perguntando, ótimo, excelente, o sinal é que você está atento a tudo isso,

**[02:31]** né?

**[02:32]** Precisamos da autenticação.

**[02:33]** Eu poderia ter configurado antes.

**[02:35]** Eu vou deixar acontecer a mensagem de erro, porque também se aprende com erro.

**[02:39]** O erro é um excelente professor para o sinal.

**[02:41]** Então vamos deixar o erro acontecer, vamos entender o que está acontecendo, e aí vamos

**[02:45]** configurar a autenticação para o GCP.

**[02:48]** Então digita terraform apply, pressiona enter, aguarde alguns instantes, e lá está

**[02:53]** o erro.

**[02:54]** Vamos entender o que aconteceu.

**[02:56]** Tentando carregar a aplicação com as credenciais, opa, mas não encontrou nem credencial, não

**[03:02]** encontrou o token de acesso.

**[03:04]** E agora, o que ele faz?

**[03:05]** Ele não sabe o que fazer.

**[03:07]** De fato, isso aqui está corretíssimo, né?

**[03:09]** Nem erro deveria nos chamar isso aqui, por quê?

**[03:12]** Porque na prática, eu não posso autenticar no provedor de cloud computing sem ter as

**[03:16]** credenciais, sem ter o login, assim por diante.

**[03:19]** Não seria algo minimamente arrasoável.

**[03:21]** Então temos que configurar a autenticação.

**[03:24]** Tem várias formas de fazer isso.

**[03:27]** Você pode configurar uma conta de serviço, você pode configurar o arquivo de credenciais,

**[03:33]** ou você pode fazer a autenticação via navegador.

**[03:37]** Mas espera aí, Strutor.

**[03:38]** Como assim navegador?

**[03:40]** Eu estou no container Docker, eu estou com o terminal Linux.

**[03:44]** Esse container não tem nem interface gráfica.

**[03:48]** Como que eu vou usar um navegador para fazer a autenticação?

**[03:51]** Mas não é possível?

**[03:52]** É possível sim.

**[03:54]** E vou mostrar para você no próximo vídeo.

**[03:57]** Muito obrigado e até lá.
