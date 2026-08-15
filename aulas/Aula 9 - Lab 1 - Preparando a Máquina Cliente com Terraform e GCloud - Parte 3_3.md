# Aula 9 - Lab 1 - Preparando a Máquina Cliente com Terraform e GCloud - Parte 3_3.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:32:39

---

**[00:00]** Tudo bem até aqui? Conseguiu compreender o objetivo do que estamos fazendo? Conseguiu

**[00:12]** compreender o Dockerfile? Se não conseguiu compreender, pergunte. Isso aqui é um ambiente

**[00:16]** de aprendizado, está aqui para aprender, certo? Se você estiver fazendo a formação completa,

**[00:21]** tem um curso gratuito, isso mesmo, gratuito de Linux com Docker, onde eu ensino os fundamentos,

**[00:27]** tempo racional quanto da ferramenta do Docker. Lá eu ensino também como criar um Dockerfile

**[00:32]** a partir do zero. Vamos então executar exatamente o Laynmtxt. Primeiro passo,

**[00:40]** abra o terminal prompt command e aí você vai navegar até a pasta onde colocou os

**[00:45]** arquivos. No meu caso esta é a pasta, vou vir aqui, vou copiar o pathname,

**[00:51]** se tiver Windows, só você copiar na barra de endereço lá em cima. Vou para o terminal,

**[00:55]** já abrir, CD e aí vou dar um Ctrl V. Essa é a pasta no meu computador. Na sua máquina,

**[01:02]** é claro que será diferente. Então pressione Enter, observe que eu estou na pasta onde estão

**[01:06]** os arquivos. Volta para o Leia. Execute este comando. Para quê? Para você criar a imagem

**[01:13]** Docker. Para você executar este comando, tem que estar conectado à internet, hein? Ele

**[01:19]** vai baixar uma série de pacotes. O que faz isso aqui? Docker, porque é o comando do

**[01:24]** Docker, né? Então faz sentido. Build para você criar. Menos T, eu vou criar exatamente

**[01:30]** esta imagem nesta versão. E o ponto? O que é o ponto? Ponto é final de linha? O instrutor

**[01:38]** esqueceu esse ponto aí? O que está acontecendo? Ponto é o diretório corrente. É o diretório

**[01:45]** onde está o seu Dockerfile. Aqui está o Dockerfile? Então esse é o meu diretório corrente,

**[01:51]** diretório ponto. Se eu digitar CD ponto, olha o que acontece? Eu fico no mesmo diretório.

**[01:57]** Esse é o meu diretório corrente. É o ponto. Por isso que estamos aqui dizendo, ei Docker,

**[02:03]** tudo bem? Cria para mim essa imagem e o Dockerfile está no meu diretório corrente. Por isso

**[02:07]** que eu pedi para você navegar até a parte onde estão os arquivos. Pois bem, dá um

**[02:11]** click na tela, executa o comando e pronto. Neste momento ele vai baixar todos os arquivos

**[02:18]** necessários, vai preparar a imagem base com um Ubuntu, depois vai executar cada uma

**[02:24]** daquelas ações para instalar o Terraform, vai instalar o Gcloud, vai instalar aquelas

**[02:28]** ferramentas antes, não é? E assim ao final, teremos a imagem completinha com todas as

**[02:33]** ferramentas instaladas. Não é bom? Muito bom, não é? Se tiver que fazer isso local,

**[02:41]** você provavelmente vai ter bem mais trabalho. Não faz sentido, não é? Use o container

**[02:45]** e depois você vai ver. O Docker deu algum problema depois? O que você faz? Você deleta

**[02:49]** a imagem, deleta o container e cria de novo. Se quiser criar uma outra imagem com uma outra

**[02:55]** versão, por exemplo, ou se você quiser criar uma outra imagem com mais ferramentas, você

**[03:00]** pode criar várias imagens para isso depois no Docker criando diferentes containers. O Docker

**[03:06]** é uma excelente ferramenta não só para o mercado de trabalho, mas também para quem está aprendendo,

**[03:10]** porque você monta sua mente em laboratório sem precisar modificar nada no seu computador local.

**[03:16]** Ele está acabando de fazer a configuração, está fazendo lá o download dos arquivos,

**[03:21]** configurando já vai acabar, como está mostrando ali que export layers, já está quase no final.

**[03:26]** Está exportando a imagem e pronto, concluído com sucesso. Vamos dar uma olhada? Vamos lá para o

**[03:32]** Docker Desktop, clicar em imagens e pronto. Olha lá que coisa linda, sua imagem criada com sucesso.

**[03:38]** Vamos agora criar o container. Então vai lá para o script, lembra txt e executa este comando,

**[03:45]** tem que estar na pasta onde está o Docker File, hein? Atenção, tem que estar nesta pasta. Isso aqui é um

**[03:52]** comando Docker, ele então vai fazer o run, run é rodar, executar, menos dit, o menos d é para rodar

**[04:02]** o container em modo background, que é o detached, por isso letra d, e t porque eu quero modo

**[04:07]** definitivo, menos menos name, o nome que eu vou dar para o container, menos v e o mapeamento que

**[04:14]** eu estou fazendo de volume, lab1 com l maiúsculo está na minha máquina local, lab1 com l minúsculo

**[04:20]** está no container, coloquei assim propositalmente, exatamente para você entender a diferença. E aí

**[04:25]** eu tenho que criar um container da parte de uma imagem, será image modelagem dsa lab1, e aí eu quero

**[04:31]** fazer o detached para poder executar depois lá no container. Pressiona enter, aguarde alguns instantes

**[04:37]** e pronto. Temos o container prontinho, com todas as ferramentas à nossa disposição. Clica aqui em

**[04:43]** containers e lá está ele, está em execução. Vem aqui, clica aqui nos três pontinhos, open terminal,

**[04:50]** digita detached e observe, se você der um ls, olha quem aparece aqui, lab1, se você entrar em lab1,

**[04:58]** cd, lab1 dá um ls, olha quem está lá, o mentf, que exatamente este arquivo que está aqui. Então olha só que legal,

**[05:07]** eu posso editar o arquivo na minha máquina física, que é bem mais fácil, e depois eu executo lá no

**[05:15]** container, que é onde eu tenho terraform, eu tenho gcloud, daqui a pouquinho vou configurar a

**[05:19]** autenticação, isso já tem uma outra vantagem que é a segurança, não é? Então você não vai ter nenhuma

**[05:25]** potencial configurada na sua máquina física, vai estar tudo lá no container. Você pode a qualquer

**[05:31]** momento deletar esse container no caso de algum problema, etc, criar outro a partir do zero e pronto.

**[05:36]** Para concluir aqui o nosso lei m, execute agora os dois comandos, verifique as versões que você tem

**[05:43]** no terraform do gcloud e aí a partir do próximo vídeo eu vou agora explicar para você o que nós

**[05:48]** temos aqui, o mentf, vou explicar passo a passo, no final executamos e teremos então a automação

**[05:56]** do nosso data house para consultas SQL com BigQuery. Muito obrigado e até a próxima aula.
