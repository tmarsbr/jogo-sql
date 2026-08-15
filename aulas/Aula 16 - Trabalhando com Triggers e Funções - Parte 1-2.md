# Aula 16 - Trabalhando com Triggers e Funções - Parte 1-2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:39:14

---

**[00:00]** Vamos então criar uma function, e aí eu vou aproveitar e explicar o conceito de trigger,

**[00:12]** que está muito associado ao conceito de função.

**[00:15]** Vamos lá para o pgAdmin, vamos dar uma olhada em nossa tabela de projetos, hein?

**[00:20]** Nós criamos aí nas aulas anteriores, executa, veja que foi cadastrado um projeto sem funcionar

**[00:29]** associado, ou seja, criaram cadastro, criaram projeto, mas não tem ninguém alocado ainda

**[00:34]** naquele projeto.

**[00:37]** Isso é uma regra de negócio, a empresa permite ou não você cadastrar um projeto sem funcionário

**[00:44]** associado, tem que na área de negócio perguntar.

**[00:46]** Aí você foi lá e perguntou a área de negócio e disse, não, não pode cadastrar, não é

**[00:51]** permitido cadastrar projeto sem funcionário.

**[00:56]** Aí você dá aquela coçadinha na cabeça, né?

**[00:58]** Opa, então pera aí, então vou te contar uma coisa, tem um problema, porque estão

**[01:02]** cadastrando o projeto sem funcionário associado.

**[01:06]** Ah, então o sistema está errado.

**[01:08]** Ok, tem alguém aí para alterar o sistema?

**[01:10]** Não, não tem ninguém para alterar o sistema, tem que resolver o problema.

**[01:15]** Compreendeu o cenário?

**[01:17]** Não pode cadastrar projeto sem funcionário, isso é um problema, é um erro, área de negócio

**[01:22]** acabou de dizer.

**[01:24]** Só que o cadastro é feito através de um sistema e não tem ninguém para alterar o

**[01:28]** sistema, ninguém sabe nem quem é que desenvolveu o sistema, isso é muito comum no dia a dia.

**[01:33]** Sim, mas não pode permitir o cadastro de projeto sem funcionário, e agora?

**[01:38]** Dá para resolver direto no banco de dados?

**[01:40]** Sim, dá para resolver, nós podemos criar uma function para isso, olha aí, conhecimento

**[01:45]** mais uma vez nos ajudando, né?

**[01:48]** Conhecimento é a chave que abre muitas portas, na verdade.

**[01:51]** Olha aqui, função que vai verificar se um projeto está sendo cadastrado sem funcionário

**[01:57]** associado.

**[01:58]** Create, replace e function, olha aí mais uma vez, instrução DDL, né?

**[02:03]** Criação do objeto.

**[02:04]** Vou chamar de verifica funcionário projeto, CAP04, abre e fecha aparentes, igualzinho

**[02:11]** com o procedure, mesma coisa.

**[02:13]** O que vai mudar é que você coloca o dedo do código e o retorno.

**[02:17]** Depois disso, eu vou colocar return trigger.

**[02:21]** Hum, interessante, hein?

**[02:23]** A function só vai verificar a regra.

**[02:28]** Quem vai manipular a regra é a trigger, trigger é gatilho, não é em inglês?

**[02:33]** Então a trigger é que vai ficar vigiando a tabela.

**[02:37]** Se acontecer na tabela tentativa de cadastrar o projeto sem funcionário, a trigger vai

**[02:43]** disparar e vai acionar a function.

**[02:46]** Então o que essa function faz é retornar uma trigger, retorna exatamente a verificação

**[02:52]** e o que ela faz?

**[02:53]** Begin end, igualzinho com o procedure, estamos usando aqui a linguagem PLPG SQL, atenção.

**[03:01]** Olha aqui agora o bloco condicional, if, new func id, func id é exatamente essa coluna.

**[03:09]** Então se o novo func id é nulo, eu vou levantar então, então, né?

**[03:15]** Eu levanto uma exception, uma exceção, ou seja, um erro.

**[03:20]** Não é permitido inserir o projeto sem o funcionário associado.

**[03:23]** Finalizo end if e retorno new.

**[03:26]** O new nesse caso é o novo registro sendo inserido na tabela.

**[03:31]** Não pode, você não pode inserir projeto sem funcionário.

**[03:35]** Então eu finalizo o bloco end e coloco language PLPG SQL aqui embaixo.

**[03:40]** Pronto, isso aqui é criação da função.

**[03:43]** Deixa eu apagar isso aqui, cria aqui a função, a função será criada no banco de dados,

**[03:49]** pronto, função criada com sucesso.

**[03:51]** A função sozinha, ela não está fazendo muita coisa.

**[03:56]** Eu preciso agora criar exatamente um gatilho que vai verificar com essa função.

**[04:03]** Se você observar a função, ela está dizendo em algum momento qual é a tabela que ela

**[04:08]** está manipulando, em algum momento nesse código tem a tabela, a função não sabe

**[04:13]** qual é a tabela.

**[04:14]** Então a função sozinha, ela não faz nada, pelo menos nessa situação que eu estou mostrando.

**[04:20]** Eu preciso de algo que dispare a função.

**[04:24]** Esse algo é exatamente a trigger.

**[04:27]** Não perca o próximo vídeo.

**[04:28]** Até lá.
