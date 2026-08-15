# Aula 12 - Trabalhando com Stored Procedures - Parte 2-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:36:29

---

**[00:00]** Já temos a nossa StoreProcedure devidamente criada, vamos agora executá-la.

**[00:12]** Para você executar a SP, a StoreProcedure, só você fazer uma chamada utilizando a instrução

**[00:18]** call.

**[00:19]** Qual é chamar, ligar, não é?

**[00:21]** Então call, aumenta a salar, tem que colocar abre e fecha aparentes, ok?

**[00:26]** O que eu estou chamando de procedimento pertence ao esquema CAP04, executa e pronto, vai estar

**[00:32]** para você o relatório.

**[00:34]** Funcionário José de Alencar, salário atual, salário com 5% de aumento, assim sucessivamente.

**[00:40]** Ou seja, eu poderia usar essa saída agora, poderia gerar um arquivo TXT, depois levar

**[00:46]** isso para um outro banco de dados, gravar isso em outro sistema ou usar uma ferramenta

**[00:51]** para pegar esse resultado e carregar em algum outro banco de dados no DW, ou gerar um relatório,

**[00:58]** alimentar o Power BI, enfim, as possibilidades são inúmeras.

**[01:01]** A StoreProcedure permite que você tenha flexibilidade na hora de gerar reglas de negócio, criar

**[01:09]** condicionais, criar loops, te dá uma flexibilidade imensa.

**[01:14]** E detalhe, você pode criar sua StoreProcedure no banco de dados e depois fazer uma chamada

**[01:20]** usando algumas ferramentas de ETL.

**[01:22]** Tem ferramenta ETL no mercado que permite que você faça chamada direto ao seu StoreProcedure,

**[01:27]** ao invés de preparar todo o procedimento, etc.

**[01:30]** Ah, mas eu prefiro a ferramenta que eu só uso mouse, instrutor?

**[01:34]** Ok, temos várias ferramentas no mercado, eu vou trazer aqui no curso ferramentas que

**[01:38]** só uso mouse também.

**[01:40]** Mas é interessante saber que você pode customizar completamente a maneira como você extrai

**[01:45]** relatório do banco de dados ou mesmo como você gera regra de negócio para poder carregar

**[01:50]** os dados ou num banco transacional ou então em um data warehouse.

**[01:53]** Depois visite a documentação oficial do PostgreSQL, vou deixar o link para você

**[01:58]** na seção de links úteis, tem lá inclusive vários exemplos de como você constrói outras

**[02:03]** StoreProcedures.

**[02:04]** Isso aqui pode salvar às vezes um projeto, hein?

**[02:07]** Tem muito projeto por aí, pessoal contrata a ferramenta ETL, crente crente que vai funcionar,

**[02:13]** que é uma beleza.

**[02:14]** A ferramenta ETL não consegue implementar uma regra de negócio que você precisa, aí

**[02:18]** o pessoal recorre sempre para o StoreProcedure porque ali é puramente uma questão de programação.

**[02:23]** Por falar em programação, tem mais exemplos para você, já já vou ensinar como fazer

**[02:28]** auditoria no banco de dados usando Triggers e Functions.

**[02:32]** Leia o item que está na sequência e encontre comigo no próximo vídeo.

**[02:34]** Até lá!
