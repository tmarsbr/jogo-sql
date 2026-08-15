# Aula 7 - Lab 1 - Preparando a Máquina Cliente com Terraform e GCloud - Parte 1_3.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:27:51

---

**[00:00]** Vamos então preparar a máquina cliente, onde teremos o Terraform e também o Gcloud,

**[00:15]** já vou explicar para você por que e para que serve.

**[00:18]** Bom, o Terraform é a nossa ferramenta para executar o script IAC, que é infraestrutura

**[00:25]** como código, certo?

**[00:27]** Eu posso instalar o Terraform em ambiente Mac, Windows ou Linux, fica à vontade para

**[00:32]** explorar depois a documentação lá no site oficial.

**[00:36]** Entretanto, nós vamos padronizar a nossa máquina cliente, eu, você e todos os alunos

**[00:43]** deste curso.

**[00:44]** O que isso quer dizer?

**[00:46]** Nós vamos criar um container Docker, vamos colocar o operacional Linux, ali nós vamos

**[00:52]** instalar as ferramentas e pronto, tudo vai funcionar que é uma beleza.

**[00:57]** E aí não temos que nos preocupar se não funcionou, porque está no Mac, está no Windows,

**[01:02]** está no Linux, etc.

**[01:03]** Não importa, todos nós vamos usar o mesmo sistema operacional, independente de qual

**[01:09]** seja o SO no seu computador.

**[01:11]** E detalhe, está tudo prontinho para você, está tudo aqui nesse Dockerfile, nós vamos

**[01:16]** criar uma imagem e a partir dessa imagem vamos criar o container.

**[01:21]** Quando criarmos o container, todas as ferramentas já estarão instaladas, está tudo pronto.

**[01:26]** É só você executar os comandos e a partir daí você já vai ter o seu ambiente automatizado.

**[01:31]** E todo o procedimento para você criar o container e também a imagem está aqui no layami.txt.

**[01:37]** Vamos abrir o layami e aqui estão as instruções.

**[01:41]** Abra o terminal pronto de comando e navega até a pasta onde você colocou os arquivos

**[01:46]** do Lab 1.

**[01:47]** Não use espaço ou acento no nome de pasta porque isso causa problemas.

**[01:52]** Observe aqui no meu rodapé o caminho da pasta no meu computador.

**[01:57]** Não tem espaço e não tem acento.

**[01:59]** Não é?

**[02:00]** Exatamente.

**[02:01]** Quando você abrir o terminal ou pronto de navegar até essa pasta, você vai executar

**[02:06]** este comando para quê?

**[02:09]** Para criar a imagem Docker.

**[02:11]** A imagem já tem tudo que você precisa.

**[02:13]** Eu já vou explicar exatamente o que tem lá no arquivo Dockerfile.

**[02:16]** Quando a imagem estiver criada, você executa este comando para então rodar o container.

**[02:23]** Sendo que se você é usuário Windows, tem que fazer aqui um ajuste nesse mapeamento.

**[02:28]** Isso aqui é o mapeamento de volume.

**[02:30]** Para que serve isso?

**[02:32]** Eu vou mapear essa pasta Lab 1 que está na minha máquina local para o container.

**[02:38]** Então eu posso colocar os arquivos aqui, modificar à vontade, automaticamente aparece

**[02:43]** no container.

**[02:45]** Este volume compartilhado facilita muito a nossa vida ao trabalhar com o container Docker.

**[02:51]** Exatamente isso que estamos fazendo aqui.

**[02:53]** Se você é usuário Windows, é só você ajustar os caminhos de pasta.

**[02:58]** E pronto.

**[02:59]** Quando acabar, você vai ter o Terraform e o Gcloud instalados.

**[03:03]** O Terraform serve para você executar o script main.tf, que é um script que tem as instruções

**[03:11]** para você construir a infraestrutura no BigQuery.

**[03:14]** Isso aqui pode ser usado também, claro, para outros provedores em nuvem.

**[03:17]** Para cada provedor em nuvem, tem que construir o script correspondente, não é adequado.

**[03:22]** Bom, o Gcloud serve para quê então?

**[03:26]** Gcloud ou Google Cloud?

**[03:28]** Vale para pensar junto comigo, hein?

**[03:31]** No nosso container eu vou ter o Terraform.

**[03:34]** O Terraform tem que se comunicar com o Google Cloud Platform para poder implementar a infraestrutura

**[03:40]** via código.

**[03:42]** Mas como ele vai se comunicar com a plataforma em nuvem?

**[03:46]** Através de um programinha auxiliar, que é o Gcloud.

**[03:49]** O Gcloud pode ser usado na sua máquina local.

**[03:52]** Você pode ir até o site do GCP, baixar o Gcloud e via linha de comando na sua máquina

**[03:58]** local você gerencia seu ambiente em nuvem.

**[04:01]** Isso também é igual com a AWS e o Microsoft Azure.

**[04:04]** O que nós vamos fazer é o seguinte, dizer ao Terraform como ele se comunica com o GCP.

**[04:10]** Neste caso via Gcloud.

**[04:12]** Vamos configurar a autenticação, obviamente, e a partir daí o Terraform vai poder enviar

**[04:17]** os comandos necessários para o ambiente em nuvem e provisionar a infraestrutura para

**[04:21]** o BigPen.

**[04:22]** Tudo bem até aqui?

**[04:23]** Está claro?

**[04:24]** Então vamos agora compreender o que nós temos aqui.

**[04:28]** Nesse Dockerfile, então pode abrir um editor de texto, vou abrir um novo aqui.

**[04:33]** Abre o editor de texto, pega o Dockerfile, arrasta e solta.

**[04:37]** Dockerfile que normalmente não tem extensão, não é?

**[04:40]** Vamos agora compreender tudo que está acontecendo aqui.

**[04:43]** Continuamos no próximo vídeo.

**[04:45]** Até lá.
