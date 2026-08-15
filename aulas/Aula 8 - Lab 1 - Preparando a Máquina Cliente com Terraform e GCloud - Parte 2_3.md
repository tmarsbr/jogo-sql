# Aula 8 - Lab 1 - Preparando a Máquina Cliente com Terraform e GCloud - Parte 2_3.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:30:18

---

**[00:00]** Algumas perguntas que podem surgir neste ponto. Primeira pergunta, é obrigatório usar um

**[00:14]** container Docker para rodar o Terraform? Não, não é obrigatório. Você pode instalar o Terraform local

**[00:21]** no seu computador se você quiser e o Lab vai funcionar da mesma maneira. Então, segunda pergunta,

**[00:27]** por que estamos usando o container Docker? Bom, por algumas razões. Primeiro, para padronizar a

**[00:34]** maneira como eu e você executamos o Lab, porque tiramos da frente qualquer dúvida ligada ao

**[00:40]** sistema operacional. Segunda razão, é porque deixando a nossa máquina limpa. Você não precisa

**[00:46]** instalar Terraform no seu computador local, você está no container Docker. Deu algum problema?

**[00:52]** Deleta o container e cria de novo. Você ainda pode ter vários containers com diferentes

**[00:58]** versões do Terraform para fazer diferentes experimentos. Outra razão, se eu estar localmente,

**[01:05]** eu tenho que demonstrar também para o pessoal do Windows. No Windows, como em qualquer ferramenta,

**[01:11]** o Terraform é problemático. Então, o pessoal do Windows vai ficar mais tempo tentando resolver

**[01:16]** sistemas relacionados a Terraform no Windows do que executando o Lab. Isso não vai acontecer,

**[01:22]** porque vamos rodar no ambiente Linux. Então, só tem vantagens em trabalhar com o container Docker.

**[01:28]** Se tiver mais alguma dúvida, só você usar os canais de comunicação e suporte da DSA.

**[01:34]** O que nós temos no Dockerfile? O Dockerfile é um arquivo para você criar uma imagem do Docker.

**[01:41]** Vamos abrir aqui o Docker Desktop. Veja que eu tenho aqui e a imagem está vazia no meu ambiente,

**[01:47]** certo? Eu vou criar uma imagem aqui. Desta imagem, eu vou criar o container, que é a imagem em execução.

**[01:54]** O Dockerfile é para você criar a imagem, como se fosse o template, não é? Eu então vou usar como

**[02:02]** SO o Ubuntu, na última versão, a versão mais nova, neste caso não vai fazer diferença. Depois

**[02:09]** eu tenho o mantenedor do Dockerfile, da SAA. Quando você baixar a imagem padrão, que é a imagem base

**[02:16]** do Ubuntu, algumas ferramentas provavelmente não estarão disponíveis, mas são ferramentas que eu

**[02:22]** vou precisar. Então, vou fazer o seguinte, vou rodar um apt-get, vou fazer um update para atualizar

**[02:29]** a lista de mirrors, vou concatenar com o comando apt-get install e aí install, eu vou instalar o

**[02:35]** apt-get para poder fazer download, unzip para descompactar arquivo, o curr para poder fazer

**[02:41]** experimento, rodar API via linha de comando, o pssh client para que eu tenha o ssh local e

**[02:49]** ptus para que eu tenha ferramenta de ping e gestão de redes, o gnupg para poder validar chave de acesso

**[02:57]** para fazer o download do gcloud que eu estou fazendo aqui embaixo. E por último, o lsb release,

**[03:03]** caso eu queira verificar a versão do processador, informações sobre o hardware. Isso que está em

**[03:09]** maiúsculo aqui no início, isso é comando Docker, ok? O que está depois do maiúsculo, em geral,

**[03:17]** é comando Linux. Então, por exemplo, from, isso aqui é do Docker, eu vou indicar qual é a imagem base,

**[03:24]** nesse caso o Ubuntu na última versão, label, o mantenedor, run e aí vou executar comando Linux.

**[03:31]** Depois disso, eu vou definir uma variável de ambiente com a versão que eu vou usar do terraform.

**[03:37]** Na sequência, eu vou usar o wget, que eu já instalei lá em cima, olha lá, tudo faz sentido,

**[03:43]** vou usar o wget para fazer o download dessa versão do terraform, essa url está apenas automatizando

**[03:51]** o processo, você altera aqui a versão e pronto, vai sempre fazer o download da versão que você

**[03:56]** quer. Eu então vou fazer um unzip, porque quando você faz o download do terraform,

**[04:01]** ele vem no formato zip, tem que descompactar, certo? Eu então vou usar o mv, mais um comando

**[04:08]** Linux, para mover os binários do terraform para o sr localbin e aí eu vou usar o rm,

**[04:15]** mais um comando Linux, para apagar o arquivo zip. Próxima etapa, vou usar o run, que é comando

**[04:22]** container, para executar um comando Linux, que é um mkd, para quê? Para criar uma pasta chamada

**[04:28]** barra lab1. Depois disso, volume para fazer o mapeamento para o lab1, inclusive aqui está aí a c,

**[04:35]** deixa eu ajustar aqui, lab1, pronto. Esse mapeamento de volume serve para quê? Essa pasta lab1 com l

**[04:45]** minúsculo será mapeada para pasta lab1 com l minúsculo no container. Quando eu acessar pelo

**[04:53]** container, todo o conteúdo de lab1 eu vou poder visualizar. Quando acessar por aqui, tudo que eu

**[04:59]** fizer no container também vai aparecer aqui em lab1. É basicamente o mapeamento de volume.

**[05:04]** Por fim, eu vou baixar o Google Cloud SDK, que é o gcloud, que é uma ferramenta que permite você

**[05:12]** verificar com o gcp via linha de comando. Também tem isso na AWS, a AWS Clip, por exemplo, também

**[05:19]** tem o cliente da Microsoft Azure e assim por diante. Eu então adiciono o repositório, isso aqui é padrão

**[05:25]** Linux, não é? Isso aqui não tem nada a ver com Docker agora, isso aqui é Linux. O run é só para o Docker executar o comando

**[05:31]** Linux. Eu adiciono então o repositório, eu faço o curr, lembra que eu instalei aqui em cima, para quê?

**[05:37]** Para executar a chave, que será validada pelo guia no pg. Eu então uso a pt get update, o install,

**[05:44]** para instalar o Google Cloud SDK. Tudo isso no container. Quando terminar, eu apenas mando ele executar

**[05:51]** o bin bash. Vou usar isso aqui como é o ambiente shell, para poder executar eventualmente todo

**[05:57]** qualquer script bash. E pronto, criamos um Dockerfile maravilhoso. Quando acabar de executar esse

**[06:05]** Dockerfile, vamos rodar um container com todas as ferramentas instaladas. Eu vou usar isso aqui como

**[06:10]** máquina cliente para poder realizar a automação lá no BigQuery. No próximo vídeo então, nós

**[06:16]** executamos o procedimento. Muito obrigado e até a próxima aula.
