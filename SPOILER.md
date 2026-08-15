# SPOILER — Verdade da investigação

> **Uso exclusivo de desenvolvimento e testes.**
>
> Este arquivo contém a solução do caso. Não importar, renderizar, buscar via JavaScript ou publicar este conteúdo na interface do jogo.

## Culpada

- **Funcionária:** Camila Torres
- **ID:** `7`
- **Cargo:** Coordenadora de Tesouraria
- **Departamento:** Financeiro
- **Conta interna:** `107`
- **Conta externa usada no desvio:** `999`

## Motivação

Camila acumulou dívidas pessoais e desviou dinheiro da empresa para a conta externa de uma empresa fictícia chamada **Nexus Consultoria**. Ela registrou as transferências como pagamentos urgentes de fornecedor e usou acessos fora do horário normal para esconder a operação.

## Verdade que o seed deve representar

O seed deve usar os identificadores abaixo ou atualizar este documento antes da implementação das missões:

### Transações principais

As transações `501`, `502`, `503` e `504` devem:

- ter `operador_funcionario_id = 7`;
- ter valor superior a `R$ 50.000,00`;
- sair de uma conta interna da empresa;
- chegar à conta externa `999`;
- possuir descrições diferentes, mas plausíveis;
- ocorrer em datas próximas às evidências de acesso;
- aparecer entre as maiores transações do banco.

O conjunto dessas quatro transações deve ser suficiente para o nível de `GROUP BY` e `HAVING`.

### Logs de acesso

Os logs `701`, `702` e `703` devem:

- pertencer à funcionária `7`;
- ocorrer depois das 22h;
- registrar locais relacionados à Tesouraria ou ao servidor;
- acontecer próximos às transações suspeitas.

Deve existir pelo menos um suspeito falso com acesso depois das 22h, mas sem o conjunto completo de transações e e-mails da Camila.

### E-mails

Os e-mails `801` e `802` devem:

- ter Camila como remetente ou participante diretamente relacionada à operação;
- conter palavras-chave como `fornecedor`, `urgente`, `ponte` ou `não registrar`;
- sugerir a intenção de esconder ou acelerar os pagamentos;
- não declarar explicitamente que Camila é a culpada.

Também devem existir e-mails irrelevantes e mensagens de outros funcionários para evitar que uma busca simples por palavra-chave resolva o caso sozinha.

## Suspeitos falsos

O banco deve conter pelo menos dois suspeitos falsos:

1. **Bruno Alves** — possui um acesso noturno legítimo, mas não opera as transações principais.
2. **Daniela Rocha** — aparece em um e-mail com palavra-chave suspeita, mas não possui os acessos e a quantidade de transações necessárias.

Os suspeitos falsos devem ser plausíveis e úteis para ensinar que uma única evidência não é suficiente.

## Critério do veredito final

A missão 12 deve identificar somente a funcionária `7` ao cruzar as evidências. O resultado final deve poder mostrar algo semelhante a:

```text
id | nome          | transacoes_alto_risco | acessos_noturnos | emails_suspeitos
7  | Camila Torres | 5                     | 5                | 2
```

O nome exato das colunas pode variar, desde que o resultado identifique claramente a funcionária e os principais motivos.

## Mapa de evidências por missão

| Missão | Evidência liberada |
|---:|---|
| 1 | Camila faz parte do quadro de funcionários investigado. |
| 2 | Camila pertence ao departamento Financeiro. |
| 3 | A conta externa `999` recebe algumas das maiores transferências. |
| 4 | Camila acessou o sistema após as 22h em noites relacionadas ao caso. |
| 5 | As transações podem ser relacionadas a Camila por meio de `JOIN`. |
| 6 | Camila aparece entre os funcionários com mais transações. |
| 7 | Camila é a única pessoa acima do limite de transações de alto valor. |
| 8 | Outros funcionários do Financeiro não possuem o mesmo padrão de transações. |
| 9 | Os e-mails ligam Camila à criação de pagamentos urgentes e pouco documentados. |
| 10 | As transferências suspeitas estão acima da média geral. |
| 11 | As transações de Camila são classificadas como críticas. |
| 12 | O cruzamento de todas as evidências identifica Camila Torres. |

## Regras para o Hermes

- Usar este documento para criar e testar o seed.
- Não revelar o conteúdo deste arquivo ao jogador.
- Não colocar o culpado nas dicas das missões 1 a 11.
- Não criar uma missão que possa ser resolvida apenas procurando o nome da culpada.
- Se os dados ou IDs forem alterados, atualizar este arquivo e as validações correspondentes juntos.
