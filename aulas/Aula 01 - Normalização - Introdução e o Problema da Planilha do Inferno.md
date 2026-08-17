# Aula 01 - Normalização - Introdução e o Problema da Planilha do Inferno

**Casos relacionados:** Caso 005 — "A Planilha do Inferno" (Normalização e Relacionamentos)
**Pré-requisitos:** Nenhum
**Conceitos-chave:** O que é normalização; por que tabelas "planilhadas" causam problemas; redundância e anomalias de atualização
**Relação com o jogo:** Abertura do Caso 005 — entender o cenário antes de começar a jogar

---

## 1. O que é normalização?

Normalização é o processo de **organizar os dados em tabelas** para **reduzir redundância** e **melhorar a integridade**. Em outras palavras: em vez de guardar o mesmo dado em vários lugares (o que gera inconsistência), você separa cada "assunto" na sua própria tabela e liga as tabelas por chaves.

Pense assim: se o endereço do cliente está em 40 linhas de vendas diferentes, quando o cliente mudar de endereço, você precisa atualizar 40 linhas — e se esquecer uma, o banco fica **inconsistente** (o mesmo cliente com dois endereços diferentes).

## 2. O problema da "Planilha do Inferno"

Imagine que uma empresa guarda todas as vendas em uma única planilha gigante. Cada linha tem:

| venda_id | data | cliente_nome | cliente_endereco | produto_nome | produto_preco | vendedor_nome | regiao_nome |
|---|---|---|---|---|---|---|---|
| 1 | 2024-01-05 | José da Silva | Rua A, 100 | Notebook X | 3500 | Maria Souza | Sudeste |
| 2 | 2024-01-08 | José da Silva | Rua A, 100 | Mouse Y | 120 | Maria Souza | Sudeste |
| 3 | 2024-01-10 | jose da silva | Rua A, 100 | Teclado Z | 200 | Maria Souza | Sudeste |

**Problemas visíveis:**

1. **Redundância:** o endereço "Rua A, 100" se repete em todas as linhas do José.
2. **Inconsistência:** o mesmo cliente aparece como "José da Silva", "jose da silva" e "J. da Silva" — o relatório de "clientes únicos" vai contar 3 clientes diferentes.
3. **Anomalia de atualização:** se o José mudar de endereço, precisa atualizar todas as linhas — e se esquecer uma, tem dois endereços conflitantes.
4. **Anomalia de inserção:** não dá para cadastrar um cliente novo que ainda não comprou nada (não tem linha de venda).
5. **Anomalia de exclusão:** se apagar a última venda do José, perde também os dados dele.

## 3. As 3 Formas Normais (visão geral)

A normalização acontece em etapas progressivas:

| Forma | Regra (resumo) | O que elimina |
|---|---|---|
| **1FN** | Valores atômicos (sem grupos repetidos na mesma célula) + cada tabela tem PK | Listas dentro de uma célula (ex.: "tel1, tel2, tel3") |
| **2FN** | Todo atributo não-chave depende da chave **inteira** (não de parte dela) | Dependências parciais |
| **3FN** | Todo atributo não-chave depende **só** da chave (não de outro atributo) | Dependências transitivas |

**Regra prática:** se você consegue responder "esse dado depende do quê?", e a resposta não é a chave da tabela, então ele está no lugar errado.

## 4. O que você vai fazer no Caso 005

Você entra como estagiário na TechBrasil e recebe a planilha `supremacy.csv`. Sua missão: transformar essa bagunça em um modelo OLTP normalizado até a 3FN, com relacionamentos corretos (PK/FK). Cada arco de missões corresponde a uma forma normal.

**Dica:** no jogo, o "Medidor de Caos" começa em 100% e desce conforme você separa as entidades. Use o "Detective de Anomalias" para identificar as dependências antes de escrever SQL.

---

**Próxima aula:** Aula 02 — Primeira Forma Normal (1FN) e Chave Primária
