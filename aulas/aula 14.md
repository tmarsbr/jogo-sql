# aula 14.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:36:47

---

**[00:00]** Já temos o bloco do Provider, já temos o bloco do Dataset.

**[00:07]** Podemos agora preparar o bloco do quê?

**[00:10]** Da tabela, que é o que eu quero criar lá no DW, não é isso?

**[00:14]** Então aqui está a primeira tabela.

**[00:16]** Observe que mais uma vez é um resource, um recurso.

**[00:20]** Que, aliás, é o que se fala hoje o tempo inteiro, né?

**[00:23]** Vamos provisionar recurso, vamos fazer o que?

**[00:26]** Vamos fazer o que?

**[00:27]** Vamos verificar o preço do recurso, configure o recurso.

**[00:31]** Então isso aqui é um resource, cujo nome é Google Big Query Table.

**[00:36]** É uma tabela do Big Query.

**[00:38]** E eu vou dar um alias, um apelido carinhoso, DSA Table 1.

**[00:42]** Abre chaves aqui em cima, fecha lá embaixo.

**[00:45]** No Sublime Text, quando você coloca o mouse em abertura de parênteses,

**[00:50]** ou colchetes, ou chaves, ele mostra pra você onde está o fechamento.

**[00:54]** Outros editores também fazem isso, estou apenas mostrando aqui no Sublime.

**[00:58]** Então tudo que vier aqui dentro agora é configuração de uma tabela.

**[01:03]** E aí agora eu vou colocar o primeiro parâmetro.

**[01:06]** Proteção para deleção? Não.

**[01:08]** O que significa?

**[01:09]** Se alguém entrar no Big Query e deletar manualmente, vai conseguir.

**[01:14]** Então veja, eu estou automatizando via Terraform.

**[01:18]** Daqui a pouco eu vou executar o script de um novo parâmetro.

**[01:22]** Daqui a pouco eu vou executar o script junto com você.

**[01:25]** A tabela será criada.

**[01:27]** Eu não estou impedindo deleção lá pelo Big Query.

**[01:31]** Se alguém deletar pelo Big Query, quando eu desfizer aqui toda a configuração de infraestrutura,

**[01:37]** que também fazemos com Terraform, o estado vai estar inconsistente.

**[01:42]** Deixei dessa forma pra você pensar sobre isso.

**[01:44]** Para o nosso lab não vai fazer nenhuma diferença, porque eu não vou deletar manualmente lá.

**[01:48]** Mas no dia a dia temos que tomar precauções.

**[01:52]** Eu vou deixar deletar lá pelo Big Query?

**[01:55]** Deixa eu fazer isso por lá?

**[01:57]** Então se depois eu quiser atualizar a infraestrutura por aqui, eu terei problemas.

**[02:02]** Estrutou. Então esse negócio de automação é meio complicado.

**[02:06]** Então, automação. Tem muita gente que fica com medo.

**[02:09]** Eu adoro automação.

**[02:11]** Porque em geral isso me traz ainda mais trabalho.

**[02:14]** Às vezes alguém fala, vamos automatizar.

**[02:16]** Opa, trabalho garantido.

**[02:18]** Porque automatização dá um trabalho gigantesco.

**[02:21]** O fato de você não entrar lá no Big Query não significa que você vai ter menos trabalho.

**[02:27]** Não se iluda. A tecnologia não é assim que funciona.

**[02:30]** Automação costuma trazer ainda mais trabalho.

**[02:33]** Deixe de casa tem que construir todo o processo.

**[02:35]** Tem que pensar agora no seguinte.

**[02:37]** Eu vou entrar no Big Query por um caminho, que é o Terraform, que eu vou mostrar daqui a pouco.

**[02:43]** Já tem outro caminho que está aberto.

**[02:45]** Que é ir direto pelo navegador.

**[02:47]** Então se eu trabalho numa empresa, com uma equipe, por exemplo, profissionais, etc.

**[02:52]** Pessoas também vão mexer no Big Query.

**[02:54]** Bom, tem que tomar as cuidadas.

**[02:56]** Uma alternativa é você não permitir, por exemplo, deleção.

**[03:00]** Então você colocaria uma proteção nesse caso.

**[03:02]** Depois disso eu vou pegar o Dataset ID.

**[03:06]** Eu poderia pegar diretamente isso aqui, que é o nome, e colocar aqui embaixo.

**[03:11]** Mas não, estamos automatizando, lembre-se, não é?

**[03:14]** Então tudo que puder ser automatizado será.

**[03:17]** Então eu vou buscar do Google Big Query Dataset.

**[03:20]** O meu Dataset que eu criei.

**[03:22]** Esse aqui é o nome aqui na configuração do Terraform.

**[03:26]** E o Dataset ID que vai vir lá do Big Query.

**[03:30]** Então eu estou colocando o caminho completo.

**[03:32]** Para quê? Para poder identificar qual é o Dataset que é o banco de dados no Big Query.

**[03:37]** Eu então vou colocar o nome da minha tabela.

**[03:39]** A primeira será TB Cliente da SA.

**[03:42]** Mas peraí.

**[03:43]** Eu tenho que dizer também ao Big Query qual é a configuração de esquema da minha tabela.

**[03:50]** Claro.

**[03:51]** O que é o esquema? A organização das colunas.

**[03:54]** Então eu vou abrir aqui um esquema do tipo GZone Encoding.

**[03:59]** Observe que abre aqui parentes, fecha lá embaixo, abre colchetes, fecha lá embaixo.

**[04:04]** E aí eu vou colocando blocos de chave separados por vírgula.

**[04:07]** Para cada bloco é um dicionário.

**[04:09]** Então eu tenho chave e valor.

**[04:11]** Chave será a identificação daquela coluna.

**[04:15]** Então eu tenho nome, aí o nome da coluna.

**[04:17]** Eu tenho type, que é o tipo, molde, neste caso, requerido.

**[04:22]** Mas de onde eu tirei isso? Tirei isso aqui do além?

**[04:25]** Não, nada vem do além.

**[04:27]** Vem para cá, acessa aqui a pasta de dados.

**[04:31]** Eu vou fornecer os dados para você.

**[04:32]** Abre aqui o cliente da SA.

**[04:34]** Isso aqui são dados de exemplo.

**[04:36]** Dados de exemplo, né?

**[04:37]** Para essa tabela de cliente.

**[04:38]** Olha o que eu tenho lá.

**[04:39]** Primeira coluna, segunda coluna, terceira coluna.

**[04:42]** Para cada coluna eu tenho que dizer qual é o nome,

**[04:45]** qual é o tipo de dado que o BigQuery vai tratar

**[04:49]** e se a coluna é requerida ou não.

**[04:51]** Não é possível, escritor.

**[04:53]** Tem que fazer tudo isso mesmo, hein?

**[04:54]** Sim, lá no BigQuery também tem que fazer.

**[04:57]** Quando você cria a tabela para você poder carregar os dados,

**[05:00]** tem que definir o esquema.

**[05:02]** A diferença no BigQuery é que ele tem uma opção

**[05:05]** para detectar de maneira automática.

**[05:07]** Quando você vai criar uma tabela

**[05:09]** e vai carregar os dados de um arquivo CSV, por exemplo,

**[05:11]** ele pergunta, detecção automática de esquema, sim ou não?

**[05:15]** Você marca uma caixinha e ele detecta para você.

**[05:17]** Ou então você configura manualmente,

**[05:19]** que é como estamos fazendo aqui.

**[05:20]** Isso te dá liberdade, te dá flexibilidade,

**[05:23]** você consegue ajustar o tipo de dado de maneira correta.

**[05:26]** Esse tipo de dado que está aqui, esse integer e string,

**[05:30]** também tem que consultar a documentação de quem?

**[05:32]** Do BigQuery, não é?

**[05:34]** Isso aqui é BigQuery, hein? Atenção!

**[05:36]** Isso aqui é BigQuery.

**[05:38]** Então o tipo de dado, se é requerido ou não, que é o modo,

**[05:42]** tem que ir lá na documentação do BigQuery

**[05:44]** e verificar o que ele espera receber.

**[05:46]** E aí você vai entregar exatamente o esquema como necessário.

**[05:50]** Mas, se você percebeu aqui, eu tenho três tabelas, não é?

**[05:54]** Isso aqui é um recurso de apenas uma tabela.

**[05:57]** Vamos então criar das outras duas.

**[05:59]** Me acompanhe no próximo vídeo. Até lá.
