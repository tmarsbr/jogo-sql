# Aula 15 - Qual a Diferença Entre Stored Procedure e Function.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 17:37:46

---

**[00:00]** Você leu aí nos itens anteriores sobre mais dois objetos de banco de dados, triggers e

**[00:14]** functions, que de fato são criados através de programação de banco de dados.

**[00:19]** Antes de mostrar os exemplos para você, eu gostaria de discutir um pouquinho a diferença

**[00:24]** entre stored procedure e function.

**[00:27]** Coloquei aqui um resumo para você, você vai encontrar também lá no script, no script 03

**[00:32]** que eu estou usando aqui para trazer os exemplos, e fica como referência quando você tiver alguma

**[00:36]** dúvida, já que esse é um tema que em geral causa bastante dúvida.

**[00:40]** Ok?

**[00:41]** Vejamos então as diferenças.

**[00:42]** Primeiro, propósito e uso.

**[00:45]** Stored procedure, geralmente usada para realizar um conjunto de operações no banco de dados,

**[00:51]** como inserções, atualizações, deleções e consultas complexas.

**[00:56]** Se você quer fazer uma

**[01:00]** recolagem ou não retornar um valor.

**[01:02]** Se você precisar efetuar um procedimento ETL, uma carga de dados no banco de dados, e você

**[01:09]** precisa criar uma lógica para validar regras de negócio, stored procedure é a solução para você.

**[01:14]** Function, projetada para calcular e retornar um valor.

**[01:18]** É frequentemente usada em consultas SQL para realizar cálculos, formatar dados, etc.

**[01:25]** Se você quiser manipular os dados a fim de realizar, por exemplo, inserções, deleções,

**[01:32]** atualizações, etc.

**[01:33]** Você vai usar stored procedure.

**[01:35]** Se você quer gerar um relatório e precisa de um cálculo específico, ou algum tipo

**[01:40]** de formatação específica, aí a function é o ideal.

**[01:45]** Com relação ao retorno de valores, stored procedure pode retornar 0, 1 ou mais valores.

**[01:51]** Tem um parâmetro, que é o parâmetro alt que permite você dizer qual é a saída da stored procedure.

**[01:57]** Ou então apenas executa, como eu mostrei nos vídeos anteriores, e retorna os conjuntos de resultados.

**[02:01]** A function sempre retorna um único valor.

**[02:05]** Então aqui tem uma diferença considerável, né?

**[02:08]** Então, sp retorna 0, 1 ou vários.

**[02:13]** Você decide ao criar o seu programa de banco de dados.

**[02:16]** A function sempre vai retornar um valor e ela não pode retornar múltiplos conjuntos de resultados.

**[02:21]** Se precisar disso, tem que usar a stored procedure.

**[02:24]** Isso vale aqui para o PostgreSQL e também para quase todos os SGBDs do mercado.

**[02:29]** Usem SQL.

**[02:30]** Stored procedure não pode ser utilizado diretamente em instruções SQL como selectware.

**[02:37]** Tome cuidado, hein?

**[02:38]** Você pode usar o select dentro da stored procedure.

**[02:43]** Não pode usar a stored procedure em um select.

**[02:47]** Tá claro?

**[02:48]** Isso é o contrário, inclusive, da function.

**[02:50]** A function pode ser incorporada em instruções SQL.

**[02:54]** Você pode colocar a function dentro da causalware.

**[02:57]** Para retornar, por exemplo, algum tipo de resultado, você comparar e filtrar os dados.

**[03:02]** Ou seja, são propósitos diferentes.

**[03:05]** Natureza.

**[03:06]** Stored procedure mais procedimental, ideal para executar sequências de comandos e lógicas

**[03:11]** complexas, principalmente para carga de dados.

**[03:14]** Function.

**[03:15]** É mais funcional, concentrado em cálculos ou operações de dados.

**[03:20]** Ambos os objetos são resultados de programação de banco de dados.

**[03:24]** Só que eles têm características diferentes, que são úteis de acordo com a sua necessidade

**[03:29]** e a regra é a mesma para praticamente qualquer SGBD.

**[03:33]** Dependendo do SGBD, pode ter pequenas modificações, hein?

**[03:37]** Então o que eu recomendo é você consultar a documentação do SGBD para verificar exatamente

**[03:41]** o comportamento de cada um desses objetos, mas isso aqui vale para quase todo SGBD.

**[03:45]** Pois bem, vejamos então como criar uma function.

**[03:49]** Me acompanhe no próximo vídeo.

**[03:50]** Até lá.
