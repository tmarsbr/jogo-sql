# Aula 10 - Lab 1 - Para Automatizar a Infraestrutura é Preciso Conhecê-la - Compreendendo o Big Query - Parte 1_2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:01:02

---

**[00:00]** Acompanhe o raciocínio junto comigo. Imagine que você foi contratado por uma empresa e aí o

**[00:14]** pessoal te chama lá para uma reunião com os gestores e um deles pede para você automatizar

**[00:21]** um determinado processo. Olha, aplica lá seu conhecimento, vai lá e automatiza o processo. Qual

**[00:28]** é a coisa que você tem que perguntar para o gestor? Ok. E como funciona o processo? Tem alguma

**[00:35]** documentação? Tem alguém que conheça o processo? Quem hoje trabalha com o processo? Poderia por

**[00:41]** gentileza fornecer informações para que eu possa então entender o processo e automatizá-lo? Faz

**[00:48]** sentido para você esse raciocínio? Ou seja, para automatizar o processo eu tenho que conhecê-lo.

**[00:54]** Pois bem, traz o raciocínio agora aqui para este capítulo. O que nós queremos fazer com IAC?

**[01:01]** Nós queremos automatizar a infraestrutura. Ou seja, eu não quero ficar entrando em uma página,

**[01:08]** um console, ficar configurando manualmente. Eu quero automatizar a criação da infraestrutura

**[01:13]** para então rapidamente poder oferecer aquela infraestrutura para o meu usuário, para um serviço,

**[01:19]** ou seja, para um cliente. Então, mesma coisa, né? Para automatizar a infraestrutura é preciso

**[01:27]** conhecê-la. Faz sentido para você? Como que você vai automatizar a infraestrutura do Big Query se

**[01:35]** você não conhecer a infraestrutura do Big Query? É por isso que eu vou trazer agora uma visão

**[01:40]** geral para você de como funciona a plataforma DW na nuvem do Google Cloud Platform. E isso vale

**[01:46]** para qualquer provedor de cloud computing. IAC até parece mágica, mas não é. Com IAC,

**[01:53]** já já nós vamos construir juntos o script, eu vou colocar no script o passo a passo para criar a

**[02:00]** infraestrutura lá no provedor de cloud computing. Para que eu possa fazer isso, eu tenho que conhecer

**[02:05]** a infraestrutura, não é? Mas estrutura, a infraestrutura em cloud computing pode ser bem

**[02:11]** complexa, não é? Posso ter vários e vários serviços. Sim, parabéns, bem-vindo ao mundo real,

**[02:17]** é isso mesmo. Quanto mais coisas você automatizar, ou você quiser automatizar, mais complexo será

**[02:24]** o processo com IAC. No curso de IAC aqui na DSC, eu sempre vou explicando lábia a lábia, vou aumentando

**[02:31]** o grau de complexidade. Chega um determinado momento, nós automatizamos mais de 30 recursos,

**[02:36]** e aí os scripts ficam gigantescos. Então eu vou ter o trabalho para criar o script de automação,

**[02:43]** mas depois basta executar com dois comandos e pronto. Infraestrutura sobe, resolve o problema

**[02:49]** que eu preciso, um comando derruba a infraestrutura, sequer preciso efetuar login no provedor de cloud

**[02:55]** computing. Então, o que eu vou fazer agora? Vou apresentar para você uma visão geral sobre o

**[03:01]** library, para você entender quais são os componentes mínimos necessários, e aí depois,

**[03:07]** então, poderemos automatizar com bem mais tranquilidade. Tudo bem? Vamos lá para o navegador.

**[03:12]** Imagino que você já tenha criado sua conta lá no GCP, já passou por todo o processo, validação do

**[03:19]** email, celular, etc. Já fez todo cadastro, já efetuou login, vai cair na sua página de boas-vindas lá no

**[03:28]** GCP. Aqui, o primeiro passo é você criar um projeto, porque toda a infraestrutura que você

**[03:34]** configurar está associada a um projeto. Observe que eu já criei um aqui, vou mostrar agora para você

**[03:41]** como fazer a criação, ok? Pode criar com o mesmo nome, inclusive. Vem aqui em cima, onde está aparecendo

**[03:46]** o nome do meu projeto, clica aqui em cima, onde está aparecendo aqui o nome do meu projeto, clica

**[03:53]** aqui no botão da caixinha, vai abrir para você uma caixa, ok? No meu caso, já está aparecendo o nome

**[04:01]** do projeto que eu já criei. Você agora pode criar um projeto aí também no seu ambiente, não paga

**[04:06]** nada para criar o projeto, é só uma organização lógica da sua infraestrutura. Então, vem aqui,

**[04:11]** nesse botão na parte de cima, novo projeto. Veja que existe um limite de projetos que você pode

**[04:18]** criar no GCP. Se precisar criar mais do que isso, você pode pedir a extensão de cota, mas eu não vou

**[04:25]** criar muito mais do que o limite do GCP, então não se preocupe. Vem aqui, coloca o nome para o seu

**[04:31]** projeto, pode ser o mesmo nome que eu estou usando, nenhum problema, e não é necessário configurar a

**[04:35]** organização. Clique em Criar e pronto, só isso. Eu tenho que criar o projeto, porque toda a infraestrutura

**[04:41]** que você criar no GCP estará associada ao projeto. Quando terminar, ele vai levar você para a página

**[04:47]** principal, e aí no meu caso já vou acessar direto, vou clicar aqui em Google Cloud, pronto, volto para

**[04:53]** a página, vou selecionar o projeto, é só clicar no nome do projeto, veja que ele já carrega e mostra

**[05:00]** para você. Então esse é o primeiro passo, ok? Criar o projeto aí no seu ambiente no GCP, usaremos o mesmo

**[05:06]** projeto agora na sequência do laboratório. Bom, depois disso, recomendo que você explore um pouco

**[05:13]** o que eu quero é o console do BigQuery. Você pode ir pelo menu de navegação, só você clicar, acessa

**[05:19]** aqui BigQuery, ou então usa a caixa de busca. O GCP é do Google, se a caixa de busca é do Google,

**[05:27]** você vai ver que ele vai abrir o menu lateral, e aí você vai ver que ele vai abrir o menu lateral.

**[05:32]** Então, você pode ir para o menu lateral, você pode abrir o menu lateral, você pode abrir o menu

**[05:39]** de caixa de busca, o GCP é do Google, né? Se a caixa de busca não funcionar, imagina, não faz sentido.

**[05:46]** Então, caixa de busca funciona e funciona bem. Vem aqui, só você colocar o mouse, ele vai colocar as

**[05:52]** pesquisas mais frequentes, o BigQuery deve estar no topo da lista. Se não tiver, você vem aqui, digita

**[05:59]** BigQuery, aí você clica, ele vai te levar direto para o console da ferramenta. E pronto, bem-vindo ao

**[06:06]** GCP. E se por acaso nunca acessou antes? Acho que tem bastante coisa acontecendo aqui nesta tela.

**[06:12]** Então, já continuamos no próximo vídeo. Até lá!
