# Aula 19 - Lab 1 - Preparando a Fonte de Dados - Parte 1_2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:12:11

---

**[00:00]** Já construímos o processo de automação, vamos agora executá-lo. Eu preciso preparar

**[00:15]** a fonte de dados, ou seja, onde ficarão os arquivos CSV que serão usados para carregar

**[00:22]** as tabelas no momento que estivermos construindo o DW de maneira automatizada. Como eu expliquei

**[00:29]** para você nos vídeos anteriores, vamos colocar os arquivos CSV lá no ambiente em nuvem,

**[00:35]** no Google Storage. Vamos então preparar isso agora. Vamos lá para o GCP, efetuou o login

**[00:41]** com a sua conta, coloca aqui, seleciona exatamente o projeto, modelagem DW Lab 1, e clica aqui

**[00:48]** no canto superior esquerdo, em menu de navegação. Clica lá. Busca pelo Cloud Storage, passa

**[00:54]** no nosso mouse e seleciona buckets, clica. Vamos então criar um, criar buckets. Aqui eu

**[01:01]** vou colocar como nome exatamente o que eu coloquei aqui no main.tf, então DSA,

**[01:08]** modelo em P1, só que tem um detalhe, hein? Atenção, vou colocar aqui o nome e então vou clicar em

**[01:15]** continuar. Vou usar o multi-region, então ele que vai se encarregar de definir qual região esse bucket

**[01:22]** que foi criado, clique em continuar. Você pode escolher uma classe, só que define o nível de

**[01:29]** cobrança para o storage. O storage não é gratuito, né? Você vê o preço aqui, inclusive o custo do lado

**[01:35]** direito. Só que você tem os créditos, lembra disso? Você criou sua conta, você recebeu os

**[01:41]** créditos gratuitos para poder trabalhar exatamente com o serviço perimental de GCP. Então, para fazer

**[01:47]** o projeto não é necessário nenhum tipo de custo, mas lembrando que não é um serviço gratuito, né?

**[01:52]** Você tem os créditos para usar com GCP. Pode deixar a classe padrão, clique em continuar. Depois disso,

**[01:59]** ele pergunta se você quer controlar acesso a objetos, etc. Não é necessário nenhuma configuração,

**[02:04]** clique em continuar e então criar. Ele vai mostrar para você que o acesso público está bloqueado,

**[02:10]** sim, exatamente o que eu quero. Eu não quero que os arquivos da empresa fiquem disponíveis na internet,

**[02:15]** né? Claro que não, arquivos da empresa, internamente, DW, etc. Então vai lá e confirma. Aguarde alguns

**[02:21]** pontos, ele vai criar o bucket e pronto. A partir de agora, você não pode mais usar esse nome de

**[02:27]** bucket. Eu vou repetir para que não fique dúvidas. A partir de agora, você não pode mais usar esse

**[02:35]** nome, porque esse nome é único no GCP. Então, você vai criar o bucket com outro nome, você vai

**[02:42]** vir aqui no script e vai alterar uma, duas, três vezes. Se você tentar executar com esse nome de

**[02:51]** bucket, vai dar erro porque não tem acesso público ao meu bucket. Se você tentar criar o

**[02:56]** bucket com o mesmo nome, vai dar erro porque não dá para criar dois buckets com o mesmo nome em toda

**[03:01]** GCP. Isso também vale para o AWS, por exemplo, igualzinho. Então, você vai criar aqui com outro

**[03:06]** nome, você vai ajustar o script colocando o nome que você criou. Depois disso, o próximo passo é

**[03:12]** fazer o upload dos dados, que é o que faremos no próximo vídeo. Muito obrigado e até lá.
