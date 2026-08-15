# Aula 10 - Junções (JOINs) - INNER, LEFT, RIGHT e FULL - Parte 1-5.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 16:56:05

---

**[00:00]** Tudo isso que eu estou explicando aqui para você está orientado às necessidades de

**[00:12]** um engenheiro de dados.

**[00:14]** Aquilo que ele vai precisar no seu dia a dia quando estiver trabalhando, por exemplo, com

**[00:18]** data warehouses.

**[00:19]** Daqui a pouco, aqui mesmo neste curso, nós vamos implementar nossos data warehouses e

**[00:24]** aí durante o procedimento de carga eu vou usar muito disso que eu estou explicando agora

**[00:29]** neste capítulo.

**[00:30]** Este capítulo serve exatamente como uma espécie de nivelamento para deixar todo mundo na mesma

**[00:35]** página e depois usarmos esses recursos quando realizarmos o procedimento de carga.

**[00:40]** Tudo bem?

**[00:41]** Vamos então avançar agora para outro tema que normalmente causa muitas dúvidas, as

**[00:47]** junções.

**[00:48]** Eu vou fechar aqui essa janela, vou abrir outra só para deixar a coisa ainda mais limpa

**[00:54]** para você, para facilitar a visualização.

**[00:57]** Então, queritoo, e aí está.

**[00:59]** Para poder mostrar junção, que é o join, eu preciso de pelo menos mais uma tabela.

**[01:05]** A junção é quando você une duas ou mais tabelas para retornar os dados que você precisa.

**[01:12]** Então eu vou criar uma segunda tabela, lembrando que todos os escritos estão ao final do capítulo.

**[01:17]** Não é isso?

**[01:18]** Você já sabe, só para lembrar.

**[01:20]** Vou criar a tabela de projetos.

**[01:22]** Tem o ID do projeto, que vai ser a chave primária, o nome do projeto e vai ter o ID do funcionário,

**[01:28]** que eu chamei de FuncID, que vai fazer uma referência ao ID funcionário da tabela de

**[01:33]** funcionários.

**[01:34]** E aí eu estou usando mais uma instrução SQL, o references.

**[01:38]** Ok?

**[01:39]** Eu estou fazendo uma referência.

**[01:41]** Olha só, esse FuncID é referente ao ID funcionário lá na tabela de funcionários.

**[01:46]** Isso aqui vai permitir fazer o casamento entre as tabelas exatamente a junção.

**[01:51]** Vamos criar a tabela.

**[01:54]** Tabela criada com sucesso e vamos inserir alguns registros.

**[01:58]** Eu vou trazer aqui para você a instrução DML, o insert e aí está.

**[02:03]** Vou inserir o projeto de ID 6001.

**[02:06]** Esse é o título, o nome do projeto.

**[02:08]** E o que é o 101?

**[02:09]** É o funcionário que está colocado neste projeto.

**[02:13]** Vou repetindo e aqui no finalzinho eu vou colocar NULL.

**[02:17]** Ou seja, eu vou criar um cadastro, um registro, aonde não vai ter um ID associado, nenhum

**[02:22]** ID de funcionário.

**[02:24]** Vamos então inserir aqui o primeiro, inserido com sucesso, insere o segundo, perfeito.

**[02:31]** Agora mais um registro, mais um projeto cadastrado.

**[02:35]** Cada projeto com um funcionário associado, exceto esse último projeto.

**[02:40]** Executa, pronto.

**[02:42]** Vamos agora fazer um select para ver se foi tudo inserido com sucesso.

**[02:46]** Executa e aí está para você projetos cadastrados, sendo que um projeto não tem funcionário

**[02:54]** associado.

**[02:55]** Aí aproveito aqui para trazer um conceito importante.

**[02:59]** Isso aqui está certo?

**[03:01]** Sim ou não?

**[03:02]** Sim ou não e por quê?

**[03:03]** Sempre tem que justificar a resposta.

**[03:05]** A resposta é, depende.

**[03:08]** A empresa permite cadastrar um projeto sem funcionário associado?

**[03:13]** Permite?

**[03:14]** Eu não sei, é uma regra de negócio, tem que perguntar a área de negócio.

**[03:17]** Se permitir, então está certo.

**[03:20]** Agora, a empresa não permite cadastrar um projeto se não tiver pelo menos um funcionário

**[03:25]** associado para tomar conta do projeto.

**[03:28]** Então isso aqui estaria errado.

**[03:29]** Ou seja, a regra de negócio é que vai definir a maneira como implementa o modelo, o que

**[03:35]** aliás você vai fazer daqui a pouquinho na prática junto comigo ao longo dos capítulos

**[03:39]** neste treinamento.

**[03:40]** É regra de negócio.

**[03:41]** É por isso que não dá para dizer está certo ou errado.

**[03:45]** Depende da regra.

**[03:46]** Tem empresa que só pode cadastrar o projeto com funcionário.

**[03:49]** Tem empresa que permite cadastrar o projeto sem funcionário.

**[03:53]** E agora?

**[03:54]** A regra de negócio que vai definir.

**[03:56]** Eu coloquei aqui as tabelas de uma forma aonde estou permitindo cadastrar projetos sem funcionário

**[04:02]** associado.

**[04:03]** A empresa talvez queira criar o projeto para poder cadastrar no sistema.

**[04:07]** Não tem isso?

**[04:08]** Cadastra no sistema.

**[04:09]** Depois, aloca o funcionário.

**[04:11]** Tudo bem, é válido.

**[04:13]** Ok?

**[04:14]** Tabela criada com sucesso.

**[04:15]** Bom, agora eu quero o seguinte, isso aqui.

**[04:19]** Eu quero nome e salário dos funcionários que estão alocados em projetos.

**[04:25]** Então aonde está o nome de funcionário?

**[04:27]** Na tabela de funcionário.

**[04:28]** Aonde está o salário?

**[04:30]** Na tabela de funcionário.

**[04:32]** Mas aonde está a alocação em projetos?

**[04:35]** Na tabela de projetos.

**[04:37]** Então eu preciso fazer uma junção.

**[04:39]** Neste caso, não tem nenhum tipo de filtro.

**[04:41]** Então eu só quero nome e salário de quem estiver alocado em projeto.

**[04:45]** Eu resolvo isso usando o Inner Join, que é o join mais comum de todos, ok?

**[04:50]** O que normalmente você vai usar bastante também no seu dia a dia.

**[04:54]** O Inner Join é só você usar a cláusula Inner Join.

**[04:58]** Observe então o que eu estou fazendo.

**[05:00]** Eu estou selecionando nome e salário e aí tem um ezinho aqui na frente.

**[05:06]** E ponto.

**[05:07]** O que é esse e?

**[05:08]** O e é um alias.

**[05:10]** É um apelido carinhoso que eu estou dando para a tabela.

**[05:14]** Se eu não usar um alias, imagino que eu apague essa letra e aqui, ok?

**[05:19]** Neste caso, eu teria que usar isso aqui.

**[05:22]** Cap03.funcionários.nome.

**[05:26]** Teria que usar cap03.funcionário e salário.

**[05:30]** Não é obrigatório se o nome de coluna for único.

**[05:34]** Se eu tiver o mesmo nome de coluna nas duas tabelas, aí é obrigatório.

**[05:37]** Tem que usar essas sentaques.

**[05:38]** Se eu tiver o nome da coluna em apenas uma tabela, não seria obrigatório.

**[05:43]** Mas se amanhã eu modificar a query, aí eu vou ter problemas.

**[05:46]** Uma estratégia para você simplificar sua query e torná-la sempre legível e mais segura

**[05:51]** é você usar o alias.

**[05:53]** Foi o que eu trouxe aqui no início, olha só.

**[05:55]** Estou dando um apelido carinhoso.

**[05:57]** Tabela funcionário eu estou chamando de e.

**[05:59]** E aí eu digo, olha, eu quero nome salário da tabela e, que é a tabela funcionário.

**[06:04]** E eu estou fazendo uma junção com a tabela de projetos, que eu dei o apelido p.

**[06:08]** O apelido carinhoso.

**[06:09]** Bom, agora eu tenho que fazer a junção.

**[06:13]** Como que eu faço a junção?

**[06:15]** Usando colunas que sejam comuns nas duas tabelas.

**[06:19]** O id funcionário na tabela e tem que ser igual ao func id na tabela p.

**[06:23]** Executa e você vai ter exatamente o resultado perfeito.

**[06:28]** Algumas perguntas que podem surgir aqui.

**[06:30]** Primeira pergunta.

**[06:32]** É obrigatório usar a palavra inner?

**[06:35]** Não.

**[06:36]** Tira a palavra inner, executa o resultado exatamente o mesmo.

**[06:40]** Eu recomendo você deixar a palavra inner, porque daqui a pouco eu vou usar o left join,

**[06:45]** o right join, o full join.

**[06:48]** Então para garantir que você sabe exatamente que está usando inner, eu recomendo o uso

**[06:52]** explícito.

**[06:54]** Se não tiver inner, tiver apenas join, você já sabe que é inner.

**[06:59]** Mas eu recomendo o uso explícito para deixar sua query sempre legível.

**[07:03]** Outra pergunta.

**[07:04]** Estrutor, e se não houver relação entre as tabelas?

**[07:08]** Neste caso não dá para fazer o inner join.

**[07:11]** Aí eu teria que fazer, por exemplo, um cross join, que é outra coisa, que é o produto

**[07:15]** cartesiano.

**[07:16]** O que eu quero aqui é estabelecer o relacionamento entre tabelas.

**[07:20]** Para que exista relacionamento, tem que haver um campo que permita esse relacionamento.

**[07:25]** Neste caso, é funke-adi.

**[07:27]** Em que momento nós definimos que vai haver relacionamento?

**[07:32]** Durante a modelagem do banco de dados, como faremos daqui a pouco quando modelarmos nossos

**[07:36]** data houses.

**[07:37]** Observe ainda a cláusula on, que aparece aqui, que é a que permite você indicar o

**[07:42]** relacionamento.

**[07:43]** Isso aqui vale para duas tabelas, para três tabelas, para 15, 20, 50 tabelas.

**[07:49]** Se você quiser, o procedimento é exatamente o mesmo.

**[07:52]** Vai fazendo a junções, vai colocando exatamente o on, estabelecendo as colunas comuns nas

**[07:58]** duas tabelas, e aí você vai fazendo pares de relacionamentos à medida que você precisa

**[08:03]** de mais tabelas para retornar os dados que você precisa.

**[08:06]** Pois bem, no próximo vídeo, nós continuamos.

**[08:09]** Até lá.
