# Aula 22 - Lab 1 - Executando a Automação da Infraestrutura do DW - Parte 2_3.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:16:26

---

**[00:00]** O procedimento que nós vamos fazer agora, eu não vou poder mostrar tudo que deve ser

**[00:14]** feito porque envolve as minhas credenciais.

**[00:18]** Então eu vou explicar o processo, vou mostrar a documentação e você vai executar aí

**[00:24]** no seu ambiente.

**[00:26]** Funciona perfeitamente, mas eu não posso mostrar, vou mostrar o que é possível, mas

**[00:31]** tem partes aqui que eu não vou poder mostrar porque envolvem as minhas credenciais.

**[00:35]** Então vamos lá.

**[00:36]** Observe que deu mensagem de erro.

**[00:39]** Ele diz aqui, não foi possível carregar as credenciais.

**[00:44]** Veja neste link o que deve ser feito.

**[00:46]** O que você faz?

**[00:47]** Clica no link.

**[00:48]** Eu já cliquei, abriu aqui a página do meu navegador.

**[00:52]** Aí você vai descendo, tem várias alternativas para você configurar as credenciais, pode

**[00:57]** criar arquivo, aqui do lado também tem um menu, você pode criar por exemplo conta de

**[01:01]** serviço, tem várias opções.

**[01:03]** Eu vou usar esta aqui.

**[01:05]** Isso aqui vai criar para você um arquivinho de credenciais.

**[01:09]** Quando você executar este comando, vou pegar este comando e vou colocar lá no container.

**[01:14]** Quando você executar, ele vai gerar um link.

**[01:18]** Se você clicar inclusive aqui, deixa eu mostrar para você.

**[01:20]** Clica nesse link.

**[01:22]** Você clica, veja que ele abre direto no seu navegador.

**[01:25]** O container está lá dentro do Docker, mas ele abre no meu navegador aqui na minha máquina.

**[01:30]** Eu estou gravando a aula para você.

**[01:32]** Quando você executar este comando, o que ele vai fazer é gerar um link.

**[01:37]** Você clica no link, ele vai abrir uma página com uma chave.

**[01:41]** Você copia essa chave e bota de volta no container.

**[01:44]** Pronto, só isso está autenticado.

**[01:46]** Vou repetir para você.

**[01:48]** Vamos executar este comando.

**[01:50]** Eu não vou poder mostrar a execução no vídeo por causa das minhas credenciais.

**[01:53]** Então, pega este comando, pode copiá-lo, traz para cá, vou limpar a tela.

**[02:00]** Você coloca o comando.

**[02:01]** Quando você pressionar enter, ele vai gerar um link.

**[02:05]** Você clica no link, ele vai abrir no seu navegador padrão.

**[02:09]** Quando abrir o navegador, ele vai te mostrar uma chave de segurança.

**[02:13]** Você copia essa chave e traz de volta para cá.

**[02:15]** Ele vai colocar aqui dizendo, digite a chave.

**[02:18]** Você coloca de volta a chave e pronto, vai estar autenticado.

**[02:21]** É claro que para que isso funcione, eu já estou com login feito no GCP.

**[02:26]** É uma forma super rápida e simples de você fazer a autenticação sem ter que criar

**[02:31]** arquivo de segurança, etc.

**[02:33]** O que também pode ser feito, fica à vontade para depois visitar aqui a documentação.

**[02:38]** Entendeu o procedimento?

**[02:39]** Então você pressiona enter com este comando, vai aparecer um link, você clica, vem para

**[02:46]** copia o código, traz de volta para cá, pressiona enter e acabou.

**[02:49]** Eu vou fazer isso agora, vou dar pausa no vídeo, vou fazer isso aqui no meu ambiente

**[02:53]** e já continuo junto com você.

**[02:55]** Prontinho, executou o procedimento.

**[02:58]** Se aparecer alguma mensagem sobre cota, é porque não está ativado na sua conta.

**[03:04]** Aí vai ter o procedimento para você aqui mesmo no terminal.

**[03:08]** Você executa o comando, coloca o ID do projeto e habilita o uso de cota.

**[03:13]** Aparece às vezes na primeira excepção.

**[03:16]** Lembrando que o Google Storage não é gratuito, mas você tem um crédito disponibilizado

**[03:21]** e por isso vai poder usar gratuitamente dentro do período do crédito, certo?

**[03:26]** Se por acaso tiver alguma dificuldade com relação às credenciais, vai até a documentação

**[03:31]** oficial e verifica por outras opções.

**[03:34]** O fato é, eu preciso das credenciais para então poder fazer o acesso e, via Terraform,

**[03:41]** conseguir criar a infraestrutura.

**[03:43]** Então pronto, já coloquei aqui as minhas credenciais.

**[03:47]** Terraform, apply.

**[03:49]** Uma coisa importante, se você deletar o container, é claro que perde as credenciais, não é?

**[03:55]** Então você vai ter que configurar de novo quando criar o container numa outra oportunidade

**[04:00]** para continuar o lab e assim por diante.

**[04:02]** Então Terraform, apply, pressiona enter, aguarde alguns instantes, veja que agora não

**[04:06]** teve mais mensagem de erro, porque as credenciais já estão configuradas, veja que oito recursos

**[04:13]** serão criados, não há modificação e nada a ser destruído.

**[04:18]** Vou destruir no final quando acabar o projeto.

**[04:20]** Aqui ele está perguntando, é isso mesmo?

**[04:23]** Posso realizar essa operação?

**[04:24]** Quando você digitar IES e pressionar enter, ele vai criar tudo lá para você no ambiente,

**[04:30]** no GCP.

**[04:31]** Vamos dar uma revisada aqui.

**[04:32]** Observe que ele leu todo o nosso arquivo mentf, colocou cada um dos itens, cada atributo

**[04:39]** para cada recurso.

**[04:40]** Quando eu não configurei um atributo, ele coloca um valor padrão ou em alguns casos

**[04:46]** ele só vai saber o valor do atributo depois que o recurso é criado, porque ele manda

**[04:50]** o recurso.

**[04:51]** O GCP aceita, configura opções como padrão para cada atributo e devolve.

**[04:56]** Olha, criei, esses são os valores.

**[04:59]** Então no primeiro momento talvez não tenha os atributos ou então ele completa para você

**[05:03]** com o valor padrão.

**[05:04]** Aí ele mostra aqui para você todos os detalhes, tudo aquilo que ele leu do arquivo mentf.

**[05:09]** Se não der mensagem de erro é porque a sintates está correta, pode ter algum erro de lógica.

**[05:15]** Neste caso vai dar erro depois que fizer o apply.

**[05:18]** Então mostra aqui para você todos os detalhes, digita IES e pressiona enter.

**[05:24]** Nesse momento você está criando a infraestrutura no BigQuery.

**[05:28]** O GCP DW foi criado com sucesso.

**[05:30]** No próximo vídeo eu mostro ele para você.

**[05:33]** Até lá.
