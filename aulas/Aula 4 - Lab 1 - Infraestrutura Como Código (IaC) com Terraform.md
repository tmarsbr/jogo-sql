# Aula 4 - Lab 1 - Infraestrutura Como Código (IaC) com Terraform.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:25:05

---

**[00:00]** Eu vou começar o Lab apresentando para você as duas ferramentas principais que usaremos

**[00:13]** ao longo das próximas aulas, o Terraform e o BigQueb.

**[00:18]** Para explicar primeiro Terraform, deixa eu mostrar para você os arquivos do Lab 1.

**[00:23]** Está na pasta CAP05, você vai encontrar o final do capítulo, entra aqui nessa pasta,

**[00:29]** o Terraform 1. Está vendo esse arquivinho? main.tf, tf, extensão para Terraform.

**[00:34]** Isso aqui é um script. Esse script automatiza toda a infraestrutura para o BigQueb lá no GCP,

**[00:44]** no Google Cloud Platform. Ou seja, eu vou executar este arquivo através de dois comandos

**[00:49]** e eu terei o BigQueb pronto para uso. Isso, em resumo, é o conceito de IAC, infraestrutura

**[00:57]** e código. Ao invés de você acessar o console daquele serviço, acessar o provedor em nuvem,

**[01:04]** fazer as configurações manualmente, você vai de fato executar um script que obviamente tem que ser

**[01:09]** desenvolvido, não é? Tem que construir o script. Esse script tem a linguagem HCL, que é a linguagem

**[01:17]** por trás disso aqui, Terraform. Ou seja, com esta ferramenta eu vou executar um script que

**[01:26]** vai basicamente subir a infraestrutura. O que é subir a infraestrutura? É provisionar os servidores,

**[01:33]** configurar a segurança, fazer as integrações de dados necessárias e assim por diante. E o

**[01:39]** Terraform funciona com a AWS, com o Microsoft Azure, com o GCP, que é o Google Cloud Platform,

**[01:45]** entre outras plataformas. E esse conceito vem se tornando cada vez mais comum no dia a dia.

**[01:51]** Ou seja, como nós temos hoje uma quantidade imensa de tarefas que executamos em nuvem,

**[01:57]** o ambiente cloud computing é cada vez mais comum, por que não automatizar esse trabalho? Essa é a

**[02:03]** proposta do Terraform que pertence a essa empresa. Observe o logo aqui no canto superior esquerdo,

**[02:08]** que é a REST Corp. O Terraform é gratuito, você pode usar livremente no seu computador ou ainda

**[02:15]** você pode usar o Terraform na nuvem usando Terraform Cloud. Só que legal, hein? Atenção,

**[02:22]** você pode usar o Terraform na nuvem para automatizar sua infraestrutura em uma outra nuvem,

**[02:30]** como por exemplo a AWS, Microsoft Azure, GCP e assim por diante. Se não quiser usar o ambiente

**[02:37]** em nuvem, neste caso é cobrado, claro, pela Terraform, você pode fazer um download e então

**[02:43]** fazer o download localmente no seu computador. O Terraform pode ser instalado no Mac,

**[02:48]** no Windows e no Linux, só que eu vou preparar um container Docker para servir como nossa máquina

**[02:54]** cliente com Terraform. Por que eu vou fazer isso? Vou fazer isso para ajudar o pessoal do Windows,

**[03:00]** que é para o pessoal do Windows não ficar sofrendo, ok? Vou preparar um container Docker com Linux,

**[03:06]** então eu, você e todo mundo neste curso vai usar ao mesmo tempo internacional e tudo vai

**[03:10]** funcionar, porque no Windows tudo funciona sem problemas. Se tentar rodar no Windows,

**[03:15]** acredite, vai dar vontade de chorar, porque dá trabalho, não funciona, tem problema,

**[03:20]** compatibilidade, não vamos fazer isso, né? Então vamos usar o sistema internacional que funciona

**[03:25]** muito bem, lá eu vou preparar a máquina cliente, tá tudo prontinho para você, seu trabalho executar

**[03:30]** alguns comandos, só isso. Vamos subir o container Docker, vai ser nossa máquina cliente, a partir

**[03:36]** de aqui eu vou executar o ScriptMain.f e vou criar a infraestrutura do BigQuery para o nosso

**[03:43]** Data Warehouse. Aí o usuário pode trabalhar com Data Warehouse, aplicar lá suas consultas SQL,

**[03:48]** não quer mais o ambiente? Você executa de novo Terraform com um comando, destrói todo o ambiente

**[03:54]** de infraestrutura na nuvem. E assim você pode pagar somente pelo tempo de uso, o que ainda ajuda a

**[03:59]** você a conseguir reduzir custos, não é? Para este projeto, para este lavo número 1, não haverá

**[04:05]** custo algum para você, eu vou usar camadas gratuitas, você vai poder experimentar livremente a

**[04:10]** ferramenta sem nenhum custo, uma excelente oportunidade de aprendizado. Então aqui está

**[04:15]** nossa primeira ferramenta de trabalho, o Terraform, vamos instalar em um container Docker, daqui a pouco

**[04:21]** eu trago passo a passo explicando o procedimento para você. Vamos agora visitar o site da outra

**[04:26]** ferramenta do BigQuery. Até lá!
