# Aula 6 - Lab 1 - Consultas SQL no BigQuery Cloud Data Warehouse.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:26:13

---

**[00:00]** Já apresentei para você uma das ferramentas, o Terraform, vou apresentar a outra, o Big

**[00:13]** Query, vamos direto para o site oficial, e aqui está.

**[00:17]** O Big Query é um data warehouse corporativo sem servidor e econômico, que funciona em

**[00:24]** nuvens e pode ser escalonado de acordo com seus dados.

**[00:28]** São dois machine learning IA e BI integrados para insights em grande escala.

**[00:33]** Faz sentido o Big Query neste curso?

**[00:36]** Faz todo o sentido, afinal de contas é uma ferramenta para você construir um data warehouse.

**[00:41]** Aqui na DSA tem um curso inteiro de Terraform e tem um curso inteiro de Big Query.

**[00:47]** Eu ministro os dois treinamentos, eu ensino tudo sobre essas ferramentas.

**[00:50]** O objetivo do Lab 1 não é estudar tudo sobre as ferramentas, mas sim como você rapidamente

**[00:55]** sobe um ambiente de infraestrutura com seu DW, coloca isso para que usuários possam

**[01:01]** trabalhar com linguagem SQL e depois derruba aquele ambiente.

**[01:05]** Quero que você aprenda a automatizar a construção de um data warehouse usando uma das ferramentas

**[01:09]** mais comuns hoje no mercado para isso, que é o Big Query.

**[01:13]** O Big Query você consegue usar gratuitamente dentro de uma faixa de limite e você tem

**[01:19]** ainda US$300 em créditos quando você cria uma nova conta no GCP.

**[01:26]** Para usar o Terraform nós vamos usar localmente.

**[01:29]** Não é necessário criar conta.

**[01:31]** Então eu vou repetir, para o Terraform não precisa criar conta.

**[01:37]** Nós baixamos o software, instalamos e usamos.

**[01:40]** Pronto, resolvido.

**[01:41]** Para o Big Query você vai ter que criar sua conta no GCP.

**[01:46]** Você vai acessar aqui o endereço, vai ter uma opção aqui para você criar sua conta.

**[01:50]** No meu está aparecendo o console porque eu já estou logado com a minha conta.

**[01:54]** No seu caso vai aparecer aqui a opção, você vai lá, cria a conta, faz o cadastro e aí

**[01:59]** você quando cria essa conta nova recebe US$300 de créditos para gastar no Big Query.

**[02:06]** Entretanto, se você estiver na camada gratuita dentro do limite, nada é cobrado de você.

**[02:12]** Eu vou usar o volume de dados pequeno, não faz sentido aqui ultrapassar o limite.

**[02:16]** Com o volume de dados pequeno você vai conseguir trabalhar com o Big Query sem nenhum custo.

**[02:22]** Ainda assim, na conta gratuita tem US$300 também para você experimentar um pouco mais

**[02:27]** não só o Big Query como outras ferramentas no GCP.

**[02:31]** Então você vai precisar criar a sua conta.

**[02:33]** Não vou mostrar a criação porque é um cadastro que você faz o tempo inteiro na internet.

**[02:39]** Vem aqui, faz o cadastro, coloca o email válido, vai ter que fazer validação, email, celular,

**[02:44]** coloca lá, preenche o formulário e pronto.

**[02:46]** Rapidamente você cria a sua conta no GCP.

**[02:49]** Depois só seguir as instruções aqui durante as aulas e eu vou explicando passo a passo

**[02:53]** tudo que tem que ser feito.

**[02:54]** Ok?

**[02:55]** Uma excelente forma de você não só aprender um pouco sobre o Big Query, mas também como

**[03:00]** automatizar a implementação de um DW usando a ferramenta.

**[03:05]** E assim temos as duas ferramentas principais para o Lab Nº 1.

**[03:09]** Agora é só arregaçar as mangas e fazer acontecer.

**[03:12]** Obrigado, até a próxima aula.
