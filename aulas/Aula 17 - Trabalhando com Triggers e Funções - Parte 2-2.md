# Aula 17 - Trabalhando com Triggers e Funções - Parte 2-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:42:03

---

**[00:00]** Uma pergunta que você poderia fazer aqui é a seguinte, né?

**[00:10]** Instructor, eu poderia criar uma stop procedure?

**[00:14]** A stop procedure não é para isso que estamos fazendo.

**[00:17]** Para esse caso, que é quase uma auditoria, né, que eu estou fazendo na tabela, a function

**[00:23]** Ela vai trabalhar com a trigger juntas, porque a trigger vai ficar vigiando a tabela.

**[00:30]** Se acontecer um evento que eu quero vigiar, vai disparar a function.

**[00:35]** Essa junção fazemos com a function e trigger.

**[00:38]** O procedimento armazenado, a stop procedure, serve para outra coisa.

**[00:42]** É se você quiser, por exemplo, fazer validações de regra de negócio antes de inserir registros

**[00:46]** na tabela.

**[00:47]** Eu poderia ter uma SP para cadastrar dados nas tabelas e se tentar cadastrar um dado que

**[00:53]** não pode, ou seja, um projeto sem funcionário, dispara a trigger que dispara a function.

**[00:59]** Então eu teria os três objetos.

**[01:01]** Um para carregar os dados, a stop procedure, um objeto que vai vigiar a tabela, a trigger,

**[01:06]** e um que vai executar a ação de acordo com a trigger, que é a function.

**[01:10]** Está claro?

**[01:11]** Ótimo, excelente.

**[01:12]** Então vem para cá agora e vamos criar a trigger.

**[01:16]** Vou colocar aqui o código para você e aí está ela.

**[01:20]** Create trigger, mais uma vez DDL, para criação de objeto.

**[01:24]** E aí você coloca o nome.

**[01:25]** Aqui tem um detalhe.

**[01:27]** No nome da trigger não tem o schema, você não precisa colocar o nome do schema.

**[01:31]** De fato, nem pode colocar o nome do schema.

**[01:33]** Ok?

**[01:34]** Então aqui não precisa de schema, veja que é o único objeto que eu criei até aqui que

**[01:38]** não tem o schema.

**[01:39]** E aí eu coloco a regra dessa trigger.

**[01:42]** Before, insert.

**[01:43]** Before é antes em inglês.

**[01:45]** Insert, inserir, aonde?

**[01:48]** Na tabela de projetos.

**[01:49]** Então a trigger, ela será disparada antes de fazer a inserção.

**[01:53]** Eu não posso esperar inserir, né?

**[01:56]** Eu até tenho uma opção aqui que é o after, que é o depois.

**[02:00]** Mas se eu quiser validar outra regra.

**[02:03]** Neste caso eu não quero que o registro de projeto seja realizado se por acaso não tiver

**[02:08]** o Funcad.

**[02:09]** Então antes de inserir na tabela, vai fazer isso aqui.

**[02:13]** For each, que é um loop, para cada linha, execute a função.

**[02:18]** E aí nós chamamos a função que acabamos de criá-la em cima.

**[02:21]** Interessante, não?

**[02:22]** E aí nós temos várias opções aqui com a trigger.

**[02:26]** Eu posso usar o before, posso usar o after e essencialmente estou executando uma função

**[02:31]** de acordo com a regra.

**[02:32]** Então a trigger vai ficar agora monitorando a tabela de projetos.

**[02:35]** Criou já está valendo.

**[02:37]** Qualquer tentativa de insert, ela vai executar exatamente a função para cada linha.

**[02:42]** Então se eu inseri uma linha, vai chamar a função.

**[02:45]** Se eu tentar inserir 15 linhas de uma vez, vai chamar a função para cada linha e assim

**[02:50]** sucessivamente.

**[02:51]** Vamos então criar a trigger, executa, pronto.

**[02:55]** Trigger criada.

**[02:56]** Vamos validar se esse negócio funciona mesmo, né?

**[02:58]** Então o que eu vou fazer agora?

**[03:00]** Para apagar tudo isso aqui, vou tentar inserir um registro na tabela de projetos com nulo

**[03:06]** no funke ID.

**[03:07]** Então eu tenho o ID projeto, nome e o funcionário.

**[03:11]** Eu coloquei um ID, coloquei o nome do projeto, título e deixei nulo.

**[03:15]** Executa e veja a mágica acontecendo.

**[03:19]** Error, não é permitido inserir o projeto sem funcionário associado.

**[03:23]** Pronto, resolvido o problema.

**[03:26]** Pode voltar na área de negócio e já pede o aumento lá para eles, inclusive.

**[03:29]** Olha, já resolvi o problema, fique tranquilo, nenhum projeto será cadastrado sem funcionário

**[03:34]** associado.

**[03:35]** Tem uma trigger agora vigiando a tabela, isso não vai mais acontecer.

**[03:39]** Aí alguém pode perguntar, ah, ok, gostei, mas e os projetos que já foram cadastrados

**[03:45]** com erro?

**[03:46]** Bom, aí é outro problema, calma, é um problema de cada vez, né?

**[03:51]** Vamos verificar a tabela.

**[03:52]** Isso que já foi inserido, você pode fazer uma limpeza.

**[03:56]** Então você poderia colocar aqui, por exemplo, um código genérico, 00, ou um código, por

**[04:01]** exemplo, 1000, alguma coisa que indique que isso aqui foi um erro prévio.

**[04:06]** Ou ainda, se já tiver algum funcionário associado, vem aqui, associa, vai ter que fazer

**[04:10]** o trabalho quase que manual, não é?

**[04:12]** Na verdade vai ter que fazer o trabalho manual.

**[04:14]** Aí você resolve o histórico.

**[04:16]** Daqui em diante isso não vai mais acontecer, porque agora tem uma trigger que está disponível

**[04:22]** e que então vai ficar vigiando exatamente essa tabela, não deixará mais inserir nenhum

**[04:25]** registro com o funcionário vazio.

**[04:29]** Interessante, não?

**[04:30]** Deixa que a trigger functions, elas vão aparecer aqui embaixo, está aqui.

**[04:35]** Neste caso foi uma trigger function.

**[04:37]** Então aparece aqui embaixo para você.

**[04:40]** Diferente das functions, eu posso criar a function que não está associada a trigger, é possível.

**[04:45]** É porque function e trigger tem uma relação muito próxima.

**[04:49]** Mas se você quiser, pode criar uma function independente de trigger, ficaria aqui em cima.

**[04:53]** No nosso caso criamos uma trigger functions e ela está aqui embaixo para você.

**[04:57]** Verifica funcionário projeto e pronto.

**[04:59]** Toda vez que tiver algum problema, ela será executada e então vai emitir a mensagem para

**[05:04]** quem estiver cadastrando.

**[05:05]** Daqui a pouco o pessoal que cuida do sistema vai ligar.

**[05:09]** Está dando um erro aqui, está dizendo que não pode cadastrar projeto.

**[05:13]** Aí você responde, é, é o seu sistema que está com problema.

**[05:16]** Corrija o seu sistema e não deixe cadastrar.

**[05:18]** No meu banco de dados ninguém vai cadastrar projeto sem funcionário, não.

**[05:22]** Aqui não vai ter inconsistência.

**[05:24]** Resolve o teu sistema aí.

**[05:25]** Pois bem, é isso.

**[05:26]** É assim que vai funcionar no dia a dia.

**[05:28]** Eu mesmo já falei isso algumas vezes para alguns desenvolvedores.

**[05:32]** Eles ligam lá para o banco de dados, não está funcionando.

**[05:34]** Está dando um erro.

**[05:35]** É, o seu sistema que está dando erro, corrige o sistema e pronto, não vai ter mais nenhum

**[05:39]** problema.

**[05:40]** Ah, mas no passado a regra de negócio era diferente.

**[05:43]** O passado passou.

**[05:45]** Hoje em dia qual é a regra que está valendo?

**[05:47]** Não pode cadastrar projeto sem funcionário.

**[05:49]** Eu resolvi no banco de dados o problema que está no sistema.

**[05:52]** Se corrigir no sistema, eu posso vir aqui e desativar a trigger.

**[05:56]** Porque eu não preciso mais se já tiver corrigido no sistema.

**[05:59]** A trigger é boa, mas ela também pode causar algum problema de performance, não é?

**[06:04]** Então se a tabela é muito grande ou se eu estou cadastrando muitos registros ao mesmo

**[06:08]** tempo, para cada registro eu vou executar a trigger.

**[06:11]** Isso pode eventualmente causar algum gargalo.

**[06:14]** Então o ideal é realmente só usar a trigger para algo bem específico.

**[06:18]** Talvez apenas por um período de tempo.

**[06:20]** A trigger não é a solução ideal para esse problema que temos aqui.

**[06:24]** Só estamos usando a trigger porque não tem ninguém para resolver o problema no sistema.

**[06:28]** Se tiver, corrige lá e não permite inserir o registro vazio lá no funcionário.

**[06:34]** Também é possível vir aqui e colocar func ad not null.

**[06:38]** Também uma outra opção, vai usar uma constraint.

**[06:41]** Só que aí, como já está cadastrado nulo, se você tentar ativar a constraint não vai

**[06:45]** deixar porque já tem nulo cadastrado.

**[06:47]** Então teria que ter feito isso antes de criar a tabela, pode recriar a tabela, enfim.

**[06:51]** Tem várias opções.

**[06:53]** Eu estou apresentando aqui para você uma alternativa via programação de banco de dados.

**[06:57]** Gostou da trigger function?

**[06:59]** Interessante, né?

**[07:00]** Que tal habilitarmos uma auditoria?

**[07:03]** Vamos criar uma auditoria no nosso banco de dados?

**[07:05]** Se alguém tentar fazer alguma coisa, nós saberemos.

**[07:09]** Também acompanhe no próximo vídeo.

**[07:10]** Vou mostrar para você um truque bem legal, hein?

**[07:12]** Muito obrigado, até a próxima aula.
