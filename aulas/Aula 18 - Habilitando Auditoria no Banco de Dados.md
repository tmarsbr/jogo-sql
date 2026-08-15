# Aula 18 - Habilitando Auditoria no Banco de Dados.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:44:59

---

**[00:00]** As Triggers e as Functions. Elas têm uma outra utilidade que pode ser importante

**[00:13]** para eventualmente resolver problemas em um banco de dados ou para você detectar alguma anomalia

**[00:20]** ou para você identificar eventualmente modificações não autorizadas em tabelas.

**[00:25]** Você pode habilitar a auditoria através de Triggers e Functions. Vou mostrar um exemplo

**[00:31]** completo aqui para você. Bem legal. Vou fechar isso aqui. Vou abrir um novo Query Tool. Então

**[00:37]** vou trazer para você primeiro a criação de uma tabela. Eu vou criar uma tabela no banco de dados

**[00:43]** para servir como histórico de salários. Então se tiver uma atualização de salário de qualquer

**[00:50]** salário eu vou gravar o resultado anterior nessa tabela de histórico. Ou seja, toda vez que tiver

**[00:57]** um novo salário o anterior vem para cá. Uma forma de você manter o histórico, ter uma auditoria,

**[01:02]** saber exatamente quem fez modificação naquele banco de dados, quando foi feita a modificação

**[01:07]** e assim por diante. Eu não recomendo você habilitar a auditoria se a tabela eventualmente é muito

**[01:14]** grande e tem muitos registros. Pode causar problemas de performance. Se quiser ainda assim a auditoria,

**[01:19]** habilite apenas por um período de tempo. Colete os dados durante o período e depois desligue a

**[01:25]** Trigger. Isso vai permitir que você evite qualquer problema de performance. Bom, cria a tabela

**[01:31]** histórico de salários no CAP04, que é o schema, a de funcionário, salário antigo e a data da

**[01:38]** mudança como timestamp. E aí eu vou colocar sempre a data corrente. Então ele vai cadastrar aqui a data

**[01:45]** visual do banco de dados. Então quando alguém tentar mudar vai pegar a data que a pessoa tentou

**[01:50]** mudar e vai colocar exatamente aqui para você nessa tabela. Então cria aqui a tabela criada com

**[01:56]** sucesso. Vamos agora criar a nossa function. Atenção, hein? Vou criar a function ao invés de que eu estou

**[02:03]** usando Create or Replace. A exemplo do que eu fiz também com outros objetos. Vou chamar de salva

**[02:10]** salário antigo no CAP04. Também vai ser retorno de Trigger. Exatamente o que eu tinha criado no

**[02:16]** exemplo anterior. Begin and, lá embaixo, Lenguas de PLPG SQA. E aí vou colocar um bloco condicional.

**[02:23]** If o salário antigo, esse objeto old é o objeto do banco de dados. Toda vez que está sendo feita

**[02:32]** uma atualização em uma tabela, você vai mudar o valor do registro, não é? Então o valor antigo

**[02:38]** você captura com old. O valor novo você captura com new. Isso é padrão no banco de dados. O old

**[02:44]** salário, se for distinto do salário novo, então vou fazer alguma coisa. Se estiver atualizando pelo

**[02:53]** mesmo número, mesmo valor, não precisa fazer nada, né? Talvez seja uma atualização de rotina,

**[02:58]** alguma coisa assim. Não vou fazer nada. Se por acaso o old salário antigo for diferente do novo

**[03:04]** salário atualizar, aí eu vou executar uma ação. Vou fazer um insert, então. Sim, um insert. Insere

**[03:10]** na tabela, não é isso? Ou seja, eu vou inserir na tabela de histórico para poder fazer um insert

**[03:17]** que eu preciso dos nomes das colunas. Então ID funcionário e salário antigo. Por que que não

**[03:23]** tem a data? Por que que não tem a data aqui? Deixa eu retornar o código do Create Table. Não tem a

**[03:29]** data porque nós colocamos o valor default. Olha aqui, ó. Quando você coloca o default, você não

**[03:35]** precisa explicitamente passar o valor para aquela coluna. Automaticamente você vai preenchido, nesse

**[03:41]** caso, com o current timestamp. Então o tipo da coluna timestamp tem o valor default, que é o current,

**[03:48]** é o horário do sistema, onde está o SGVD. E aí quais são os valores que eu vou inserir? O ID do

**[03:54]** funcionário old e o salário old. Então tem que pegar o ID do funcionário para saber quem foi que

**[03:59]** entendeu a atualização, a modificação e o salário antigo. Porque o salário novo, ele vai

**[04:05]** sobrescrever o antigo na tabela, certo? Então eu tenho que salvar o antigo, porque quando fizer o

**[04:11]** update, você perdeu o valor antigo. Não existe mais. Então imagine que alguém fez isso de maneira

**[04:17]** proposital, não é? Alguém que tem acesso à tabela lá do RH, que não deveria ter, mas tem, vai lá e

**[04:24]** você não vai entender que você perdeu o valor antigo, você não sabia. Muitas pessoas não vão lembrar

**[04:30]** de cabeça salário de todo mundo dentro da empresa. E agora, qual é o salário antigo do funcionário?

**[04:35]** Ah, não sei. Vou ter que buscar o histórico, ver lá, histórico de contra-cheque. Bom, uma complicação

**[04:42]** danada, né? Então salvamos aqui o salário e colocamos isso em nossa tabela de auditoria. Então

**[04:48]** cria a função, função criada com sucesso, vem aqui, faz o refresh, pronto, já foi criada. E agora

**[04:54]** nós criamos a trigger, que vai monitorar a tabela de funcionários. Create trigger, o nome, e vou usar

**[05:01]** agora um before update. Então veja, só vai funcionar isso aqui se for update na tabela. Ou seja, se for

**[05:09]** update é porque o funcionário já existe cadastrado. Se for insert, vai inserir pela primeira vez, não há

**[05:15]** por que fazer a auditoria a primeira vez, né? A menos que você queira. Quer fazer também a auditoria

**[05:20]** em um outro lugar, pode. Só você modificar aqui o código, nenhum problema. Nosso caso, before update,

**[05:25]** e aí para cada linha vou executar a função. Igualzinho o exemplo que eu tinha dado anteriormente,

**[05:30]** pronto, trigger criada com sucesso. Vamos agora checar, né? Vamos dar um aumento para o machado de

**[05:37]** assist. Então update cap04 funcionários, vou definir um novo valor para o machado de assist,

**[05:43]** e então aonde o nome for exatamente igual a esse. Deixa eu fazer um select aqui, para que possamos

**[05:49]** ganhar o salário atual do machado de assist, né? Select asterisco from cap04 funcionários.

**[05:56]** Executa, vamos ver quando está ganhando o machado de assist, hein? Está ganhando 19 mil reais. Vou

**[06:04]** aumentar para 36 mil e 500, hein? Então vou fazer o update. Vem aqui, executa, update e realizado com

**[06:12]** sucesso. Excelente. Vamos dar um select, pronto, lá está. Cadê o machado de assist? Agora ele ganha

**[06:18]** 16 mil e 500. Quem modificou a tabela não faz ideia do que está acontecendo, não é? Não sabe que tem

**[06:25]** auditoria. É para isso que estamos fazendo auditoria, exatamente para saber o que está acontecendo. Então

**[06:29]** quem fez o update não sabe. Não sabe, opa, não sabia que tinha auditoria. Sim, mas a editoria está lá.

**[06:37]** Então agora é só você fazer o quê? Exatamente o select na tabela. Vamos então buscar histórico de

**[06:43]** salários. Vou colocar aqui para você. Select asterisco da tabela histórico salários, coloca um ponto

**[06:50]** e vírgula e pronto, aí está para você. A ID do funcionário 101, que é o machado de assist, o salário

**[06:57]** antigo e a data corrente, a data atual. Pronto, agora nós mantemos o histórico. Se você quiser, dá para

**[07:05]** colocar ainda o ID do usuário conectado no banco de dados, dá para você colocar mais informações

**[07:10]** conectadas da sessão do usuário que fez o update. Você pode salvar o registro inteiro se você quiser,

**[07:17]** ao invés de salvar apenas o ID e o salário antigo e assim você habilita a auditoria no banco de dados.

**[07:22]** Isso aqui é muito comum. Eu cansei de fazer auditoria, faço até hoje, por sinal, porque às vezes quando a

**[07:29]** empresa é muito grande tem muito sistema rodando, né? E aí muitas empresas têm aquele entre-sai de

**[07:36]** funcionário. O funcionário vem, trabalha há um, dois anos, perde a demissão, vai embora, aí chega o funcionário novo, chega outro,

**[07:42]** aí você dá privilégio aqui, dá privilégio ali, daqui a pouco a empresa está perdida. Já nem sabe mais quem tem acesso

**[07:47]** ao banco de dados. E aí está tendo mudança na tabela. Você habilita a auditoria para saber de onde essas

**[07:54]** mudanças estão vindo. Às vezes não é necessariamente para pegar uma anomalia, um problema, um fraude, não.

**[07:59]** Pode ter um sistema, está perdido em algum lugar que ninguém sabe o que é, que está atualizando a tabela.

**[08:05]** Tem que saber de onde está vindo essa conexão. O que exatamente está atualizando a minha tabela? Você vai lá, habilita a auditoria,

**[08:11]** verifica e a partir daí toma alguma ação. E aí está para você um exemplo completo de auditoria no banco de dados

**[08:17]** usando programação, né? Exatamente criação de functions e triggers. Continuamos no próximo vídeo. Até lá!
