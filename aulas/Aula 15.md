# Aula 15.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:05:52

---

**[00:00]** Já definimos o recurso de uma tabela, vamos agora definir as outras duas.

**[00:12]** Então aqui eu tenho DSA table 1, aí eu coloquei o DSA table 2, e então table 3.

**[00:20]** Observe que a 2 será a tabela de produtos, o restante é igual, né?

**[00:24]** Então eu tenho a tabela de produtos, e aí eu tenho as colunas respectivas dessa tabela,

**[00:29]** onde eu peguei esses nomes? Aqui, ó, do arquivo.

**[00:31]** Então TB produto DSA, exatamente os dados de exemplo, né?

**[00:35]** Nome de cada uma das colunas, você configura com os tipos correspondentes.

**[00:39]** Para a terceira tabela, que é uma tabela fato, tem mais colunas.

**[00:44]** É basicamente você colocar o tipo de dado, INTG nas três primeiras, float e o último que é o timestamp.

**[00:51]** Para esse exemplo, teremos uma tabela fato e duas dimensões, que é suficiente, né?

**[00:55]** Para que você veja tudo isso funcionando.

**[00:57]** Mas observe que tivemos que provisionar cada recurso, né?

**[01:01]** Então provisionamos o dataset, depois provisionamos cada uma das tabelas.

**[01:06]** Dá um trabalho inicial, é claro que dá, não tem jeito.

**[01:09]** Mas uma vez que você tenha concluído esse trabalho,

**[01:12]** bom, esse script pode ser usado depois quantas vezes você quiser para subir o seu DW, não é?

**[01:18]** Exatamente para provisionar infraestrutura, DW vai estar pronto, o pessoal vai lá, faz as análises,

**[01:23]** você executa um outro comando e derruba toda a infraestrutura.

**[01:27]** Mas tem o trabalho inicial, claro, de construir o script.

**[01:30]** Então já temos até aqui o provedor, já temos o dataset, que é o banco de dados no BigQuery,

**[01:36]** já temos as tabelas.

**[01:38]** Me diga, eu vou criar as tabelas vazias lá no DW?

**[01:42]** Se eu fizer isso, o pessoal da hora de negócio vai vir atrás de mim, não é?

**[01:46]** Vem cá, para que você me deu um DW com tabela vazia?

**[01:49]** Para que serve isso? Não serve para nada, não é?

**[01:51]** Eu quero DW com tabela cheia, recheada de dados, para que eu possa fazer a minha análise, concorda?

**[01:58]** Então o que nós temos que fazer agora?

**[02:00]** Vamos automatizar aqui mesmo no script a carga de dados para as tabelas,

**[02:05]** que serão criadas também com automação, isso mesmo.

**[02:08]** Vou automatizar tudo o que for possível.

**[02:10]** Então estou automatizando a criação do banco de dados, que é o dataset, criação das tabelas,

**[02:15]** e agora a carga de dados.

**[02:17]** Muito obrigado e até a próxima aula.
