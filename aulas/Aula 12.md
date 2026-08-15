# Aula 12.MP4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:05:02

---

**[00:00]** Vamos agora construir o processo de automação de criação do DW com IAC,

**[00:15]** com infraestrutura como código.

**[00:17]** Ao invés de abrir o navegador, acessar o Google Big Query,

**[00:22]** fazer toda a configuração manual, tudo isso será substituído por um único script.

**[00:28]** Exatamente este aqui, que é o main.tf.

**[00:31]** Esse é um arquivo de texto, então você pode abrir em qualquer editor de texto que você preferir.

**[00:36]** E lá dentro nós colocamos sintaxe HCL, que é a linguagem usada pelo Terraform.

**[00:44]** Existe uma curva de aprendizado, que é exatamente aprender HCL, que eu ensino no curso de IAC aqui na DSA.

**[00:51]** Uma vez aprendida a linguagem, você então constrói o script,

**[00:56]** que é basicamente indicar os recursos que serão criados lá no ambiente em nuvem.

**[01:01]** E agora eu vou explicar passo a passo para você esse script.

**[01:05]** Eu já abri aqui no meu editor de texto, eu estou usando o Sublime Text,

**[01:10]** e esse editor de texto tem uma extensão para HCL do Terraform.

**[01:15]** Então você pode experimentar o Sublime se você quiser gratuitamente.

**[01:19]** Quando você está lá no seu computador, você busca na internet o Sublime Text,

**[01:23]** tem para Linux, Mac e também Windows, busca no menu superior a opção de extensões.

**[01:29]** Aí você pesquisa por HCL Terraform e instala. Tem várias extensões para várias linguagens.

**[01:34]** Uma delas é HCL e vai colorir o código, que facilita muito, sem dúvida, o nosso trabalho.

**[01:39]** E aqui dentro o que nós vamos fazer é colocar uma série de blocos de configuração.

**[01:45]** Eu vou trazer cada um deles para vocês, estou começando com o primeiro bloco, que é o Provider.

**[01:50]** Aquela palavra que está aparecendo em AILIES, a palavra Provider, isso já é sintaxe HCL.

**[01:57]** Por isso que é bom usar a extensão do Sublime Text, porque aí você diferencia,

**[02:01]** porque é sintaxe do que é realmente comando, por exemplo.

**[02:04]** Depois disso, veja que eu tenho a palavrinha Google. Então o que significa isso aqui?

**[02:08]** Eu estou indicando para o Terraform qual provider de cloud computing que eu vou usar.

**[02:14]** Essa palavra aqui não é aleatória, isso aqui está na documentação da HCL.

**[02:19]** Então eu vou usar Google, indicando que eu quero usar o Google Cloud Platform.

**[02:23]** Eu abro chaves e fecho lá embaixo. Aqui dentro eu coloco os atributos desse bloco, desse recurso.

**[02:30]** Dois atributos, projeto e região. Esse projeto é aquele que nós criamos lá no GCP.

**[02:37]** Então se por acaso quiser usar outro projeto, tem que criar lá no GCP, que é o ID do projeto, que é o nome.

**[02:43]** E aqui eu indico a região, por exemplo, vou usar US West 1.

**[02:47]** Ou seja, tudo que eu configurar aqui para esse DW vai estar nesta região e vai estar associado a este projeto.

**[02:54]** Pronto, isso aqui é a configuração do Provider.

**[02:57]** É possível você colocar a autenticação por aqui, mas eu não recomendo que o faça.

**[03:03]** Eu vou ensinar para você daqui a pouco como fazer a autenticação via linha de comando

**[03:08]** dentro do Container Docker, que é bem mais seguro.

**[03:12]** Porque se você colocar suas credenciais aqui, perder esse arquivo, suas credenciais estarão aqui.

**[03:17]** Credenciais de acesso ao GCP. Então não recomendo que o faça, a gente sabe exatamente o que está fazendo.

**[03:23]** O ideal é você fazer a autenticação via linha de comando, que vai acontecer dentro do Container, que é a nossa máquina cliente.

**[03:30]** Então aqui eu apenas indico o Provider.

**[03:33]** Quando eu for executar o script, aí eu vou fazer a autenticação junto com você.

**[03:37]** Pronto, já temos o primeiro bloco. Vamos para o próximo. Obrigado e até a próxima aula.
