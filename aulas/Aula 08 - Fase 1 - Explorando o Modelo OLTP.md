# Aula 08 - Fase 1 - Explorando o Modelo OLTP

**Casos relacionados:** Caso 006 — Fase 1 (Explorar o sistema transacional)
**Pré-requisitos:** Aula 07 (OLTP vs OLAP), Caso 005 concluído
**Conceitos-chave:** Modelo relacional, consultas básicas, agregação, JOINs
**Relação com o jogo:** Fase 1 — conhecer as tabelas do sistema antes de construir o DW

---

## 1. O modelo OLTP da TechBrasil

Após a normalização do Caso 005, o sistema transacional da TechBrasil tem estas tabelas:

| Tabela | Entidade | PK | FKs |
|---|---|---|---|
| `clientes` | Clientes | `id` | — |
| `produtos` | Produtos | `id` | `categoria_id` |
| `vendedores` | Vendedores | `id` | `regiao_id` |
| `regioes` | Regiões | `id` | — |
| `vendas` | Vendas (cabeçalho) | `id` | `cliente_id`, `vendedor_id` |
| `itens_venda` | Itens da venda | `venda_id` + `produto_id` | `venda_id`, `produto_id` |

## 2. Consultas essenciais para conhecer o modelo

Antes de construir o DW, você precisa entender o volume e a distribuição dos dados.

### Contar registros por tabela

```sql
SELECT 'clientes' AS tabela, COUNT(*) AS total FROM clientes
UNION ALL
SELECT 'produtos', COUNT(*) FROM produtos
UNION ALL
SELECT 'vendedores', COUNT(*) FROM vendedores
UNION ALL
SELECT 'regioes', COUNT(*) FROM regioes
UNION ALL
SELECT 'vendas', COUNT(*) FROM vendas
UNION ALL
SELECT 'itens_venda', COUNT(*) FROM itens_venda;
```

### Faturamento total

```sql
SELECT SUM(iv.quantidade * iv.preco_unitario) AS faturamento_total
FROM itens_venda iv;
```

### Vendas por mês

```sql
SELECT
  strftime('%Y-%m', v.data_venda) AS mes,
  COUNT(*) AS total_vendas,
  SUM(iv.quantidade * iv.preco_unitario) AS faturamento
FROM vendas v
JOIN itens_venda iv ON v.id = iv.venda_id
GROUP BY strftime('%Y-%m', v.data_venda)
ORDER BY mes;
```

### Top 5 produtos mais vendidos

```sql
SELECT
  p.nome AS produto,
  SUM(iv.quantidade) AS total_vendido,
  SUM(iv.quantidade * iv.preco_unitario) AS receita
FROM itens_venda iv
JOIN produtos p ON iv.produto_id = p.id
GROUP BY p.id, p.nome
ORDER BY total_vendido DESC
LIMIT 5;
```

## 3. O que a Fase 1 valida no jogo

A missão da Fase 1 pede consultas de exploração básica: contar vendas por mês, faturamento por região, top produtos. O validador verifica que os resultados batem com os dados do seed.

## 4. Conceito ACID — por que OLTP é confiável

OLTP segue as propriedades **ACID** para garantir integridade:

| Propriedade | Significado | Exemplo |
|---|---|---|
| **A**tomicidade | A transação é "tudo ou nada" | Transferência bancária: ou debita E credita, ou nada acontece |
| **C**onsistência | O banco nunca fica em estado inválido | FK impede venda sem cliente |
| **I**solamento | Transações simultâneas não interferem | Dois vendedores não vendem o último item ao mesmo tempo |
| **D**urabilidade | Dados confirmados (COMMIT) persistem | Após COMMIT, mesmo se o servidor cair, os dados estão salvos |

---

**Próxima aula:** Aula 09 — Fase 2 do Caso 006: Limpeza de Dados (Data Quality)
