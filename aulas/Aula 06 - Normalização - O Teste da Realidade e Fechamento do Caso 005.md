# Aula 06 - Normalização - O Teste da Realidade e Fechamento do Caso 005

**Casos relacionados:** Caso 005 — Missões 13 a 14 (Fechamento)
**Pré-requisitos:** Aula 05 (PK, FK, cardinalidade)
**Conceitos-chave:** Anomalias de atualização em modelo normalizado vs. desnormalizado; custo de manutenção
**Relação com o jogo:** Fechamento — sentir na prática o benefício da normalização

---

## 1. O que é o "Teste da Realidade"?

Depois de normalizar, o jogo simula uma operação do mundo real para você **sentir** a diferença entre o modelo normalizado e o desnormalizado. O teste clássico: *"o cliente José mudou de endereço — quantas linhas você precisa atualizar?"*

## 2. No modelo desnormalizado (planilha original)

```sql
-- Atualizar o endereço do José em TODAS as vendas dele
UPDATE supremacy
SET cliente_endereco = 'Rua Nova, 200'
WHERE TRIM(cliente_nome) = 'José da Silva';
-- Resultado: 40 linhas atualizadas (uma por venda)
```

Se você esquecer uma linha, ou se o sistema travar no meio, fica com endereços conflitantes.

## 3. No modelo normalizado (3FN com FKs)

```sql
-- Atualizar o endereço do José UMA única vez
UPDATE clientes
SET endereco = 'Rua Nova, 200'
WHERE nome = 'José da Silva';
-- Resultado: 1 linha atualizada
```

Todas as vendas referenciam o cliente pela FK (`cliente_id`), então todas "enxergam" o endereço atualizado automaticamente.

## 4. Outros testes do mundo real

| Cenário | Desnormalizado | Normalizado |
|---|---|---|
| Mudar preço de um produto | Atualizar todas as linhas de venda (anterior) | Atualizar 1 linha em `produtos` |
| Mudar gerente de uma região | Atualizar todos os vendedores da região | Atualizar 1 linha em `regioes` |
| Cadastrar cliente novo sem venda | Impossível (não tem linha de venda) | `INSERT INTO clientes` direto |
| Apagar última venda sem perder cliente | Perde os dados do cliente | Cliente permanece em `clientes` |

## 5. Missão 13 — Aplicar o teste no jogo

No Caso 005, a missão 13 pede para atualizar o endereço do José no modelo normalizado. O validador verifica que apenas **1 linha** foi alterada em `clientes` (e que o endereço novo aparece em todas as vendas relacionadas via JOIN).

```sql
-- Solução esperada
UPDATE clientes
SET endereco = 'Av. Brasil, 500'
WHERE nome = 'José da Silva';
```

## 6. Missão 14 — Montar o diagrama ER final

A última missão pede para montar o diagrama ER completo com todas as FKs e cardinalidades corretas. Isso consolida o aprendizado:

```
supremacy (planilha original, desnormalizada)
    ↓ 1FN: separar entidades atômicas
clientes, produtos, vendedores, regioes
    ↓ 2FN: separar itens_venda
itens_venda (PK composta: venda_id + produto_id)
    ↓ 3FN: extrair regioes de vendedores
regioes (FK em vendedores)
    ↓ Relacionamentos: definir FKs e cardinalidade
Modelo final OLTP normalizado
```

## 7. Confronto final — as 4 perguntas do diretor

Ao concluir o Caso 005, você "apresenta o modelo" ao diretor respondendo com evidências:

1. *"Por que o cliente se repete em 40 linhas?"* → Porque a planilha não separava entidades (violação 1FN).
2. *"Por que a região não pode ficar na tabela de vendas?"* → Dependência transitiva (3FN) — a região não descreve a venda.
3. *"O que acontece quando o José muda de endereço?"* → No modelo normalizado, 1 UPDATE resolve; no desnormalizado, 40.
4. *"Por que precisamos da tabela `itens_venda`?"* → Relacionamento N:N exige tabela intermediária com PK composta.

**Ao vencer:** e-mail de promoção → Analista de Dados Jr → Caso 006 desbloqueado.

---

**Próxima aula:** Aula 07 — OLTP vs. OLAP: Entendendo os Dois Mundos (Caso 006 — Introdução)
