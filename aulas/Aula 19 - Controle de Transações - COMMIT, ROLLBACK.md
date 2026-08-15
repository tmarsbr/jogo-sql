# Aula 19 - Controle de Transações - COMMIT, ROLLBACK.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:46:01

---

**[00:00]** Imagine que você tenha uma conta corrente e uma conta poupança no seu banco.

**[00:13]** E aí você quer transferir mil reais da conta corrente para a conta poupança para deixar

**[00:18]** lá o investimento.

**[00:19]** Certo?

**[00:20]** Você deve concordar comigo que isso é uma transação única.

**[00:25]** Quando o dinheiro sair da conta corrente, ele tem que ser automaticamente colocado na

**[00:29]** conta poupança.

**[00:30]** É uma transação única.

**[00:32]** A transação não pode parar no meio do caminho.

**[00:35]** Você não pode tirar o dinheiro da conta corrente e ele ficar no limbo.

**[00:38]** Assim como o dinheiro que vai entrar na poupança tem que vir de algum lugar.

**[00:43]** Então é uma transação única.

**[00:45]** Simplesmente o dinheiro saiu de uma conta e entrou na outra.

**[00:48]** Não é isso?

**[00:49]** É uma transação?

**[00:50]** Então, se eu quiser reproduzir isso no banco de dados, eu posso fazer o contato

**[00:55]** corrente de transações usando um bloco completo com o begin.

**[00:58]** Tome cuidado, tem ponto e vírgula aqui no início.

**[01:01]** E então lá embaixo eu coloco commit se eu quiser gravar realmente no banco de dados.

**[01:07]** E se tiver algum problema eu simplesmente utilizo o rollback.

**[01:11]** O rollback indica que, opa, deu problema, volta, volta, volta, desfaz a operação.

**[01:16]** Por quê?

**[01:17]** Uma das características de um SGBD é que você tenha sempre a consistência no banco

**[01:22]** de dados.

**[01:23]** O banco de dados tem que estar em estado consistente, pelo menos sempre que possível.

**[01:29]** Se por acaso você precisa tratar algo como uma transação única, então você pode colocar

**[01:34]** isso dentro de um bloco begin.

**[01:36]** Que é o que eu estou fazendo aqui no exemplo.

**[01:38]** Eu estou inserindo um funcionário, estou inserindo um projeto para aquele funcionário.

**[01:43]** Tudo isso aqui é uma coisa única.

**[01:45]** Eu não posso apenas cadastrar o funcionário sem cadastrar o projeto.

**[01:50]** Visciversa também não é possível.

**[01:52]** Eu não posso cadastrar o projeto sem ter o funcionário que acabou de ser contratado

**[01:56]** pela empresa.

**[01:57]** Ou seja, isso aqui não é algo parcial.

**[02:01]** Isso aqui é algo único, completo.

**[02:02]** É uma transação.

**[02:03]** E aí você pode usar um bloco begin para isso.

**[02:06]** Você pode colocar isso dentro do seu script, por exemplo.

**[02:08]** Isso é muito útil no processo de carga de dados.

**[02:11]** Se tiver algum problema você aplica o rollback e retorna ao banco de dados ao estado anterior.

**[02:15]** Que é o estado consistente antes de ter ocorrido algum problema.

**[02:20]** Ou seja, imagine que fez um insert no funcionário.

**[02:24]** Na hora que foi inserir o projeto deu erro.

**[02:27]** O que tem que fazer?

**[02:28]** Tem que desfazer o cadastro do funcionário.

**[02:32]** Não posso deixar o funcionário porque deu erro no projeto.

**[02:34]** Tem que ir lá na tabela entender o que aconteceu, corrigir o problema e então realizar o cadastro

**[02:38]** completo novamente.

**[02:40]** Exatamente o exemplo que eu dei da conta corrente com a conta poupança.

**[02:44]** Posso tratar isso aqui como uma transação única.

**[02:47]** No próximo vídeo nós continuamos.
