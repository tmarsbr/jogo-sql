# Aula 12 - Fase 5 - OLAP (Consultas Analíticas e Views)

**Casos relacionados:** Caso 006 — Fase 5 (Criar views de relatório)
**Pré-requisitos:** Aula 11 (star schema), funções de agregação, JOINs, CTEs
**Conceitos-chave:** GROUP BY, HAVING, window functions (LAG, LEAD, ROW_NUMBER), CTE, CREATE VIEW
**Relação com o jogo:** Fase 5 — entregar relatórios para a diretoria via views

---

## 1. O que é OLAP na prática?

OLAP é fazer **consultas analíticas** sobre o Data Warehouse: agregar, comparar, segmentar, ranquear. As perguntas típicas:

- Qual o faturamento por mês?
- Qual região mais vende?
- Qual produto cresceu mais em relação ao mês anterior?
- Quais vendedores estão abaixo da meta?

## 2. Agregação com GROUP BY e HAVING

```sql
-- Faturamento por região e mês
SELECT
  r.nome AS regiao,
  t.ano,
  t.mes,
  SUM(f.valor_total) AS faturamento,
  COUNT(*) AS total_itens
FROM fct_vendas f
JOIN dim_regioes r ON f.regiao_id = r.id
JOIN dim_tempo t ON f.tempo_id = t.id
GROUP BY r.nome, t.ano, t.mes
HAVING SUM(f.valor_total) > 100000
ORDER BY faturamento DESC;
```

## 3. Window Functions — a arma secreta da análise

Window functions permitem calcular valores **sobre um conjunto de linhas relacionado** sem agrupar (GROUP BY):

### LAG — valor da linha anterior

```sql
-- Faturamento mensal com comparativo do mês anterior
SELECT
  t.ano,
  t.mes,
  SUM(f.valor_total) AS faturamento_mes,
  LAG(SUM(f.valor_total)) OVER (ORDER BY t.ano, t.mes) AS faturamento_mes_anterior,
  ROUND(
    (SUM(f.valor_total) - LAG(SUM(f.valor_total)) OVER (ORDER BY t.ano, t.mes))
    / LAG(SUM(f.valor_total)) OVER (ORDER BY t.ano, t.mes) * 100, 2
  ) AS variacao_percentual
FROM fct_vendas f
JOIN dim_tempo t ON f.tempo_id = t.id
GROUP BY t.ano, t.mes
ORDER BY t.ano, t.mes;
```

### ROW_NUMBER — ranking

```sql
-- Top 3 vendedores por região
SELECT
  regiao,
  vendedor,
  faturamento,
  ranking
FROM (
  SELECT
    r.nome AS regiao,
    v.nome AS vendedor,
    SUM(f.valor_total) AS faturamento,
    ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY SUM(f.valor_total) DESC) AS ranking
  FROM fct_vendas f
  JOIN dim_vendedores v ON f.vendedor_id = v.id
  JOIN dim_regioes r ON f.regiao_id = r.id
  GROUP BY r.id, r.nome, v.id, v.nome
)
WHERE ranking <= 3;
```

### DENSE_RANK — ranking sem gaps

```sql
-- Classificar produtos por receita (empates ficam no mesmo ranking)
SELECT
  p.nome,
  SUM(f.valor_total) AS receita,
  DENSE_RANK() OVER (ORDER BY SUM(f.valor_total) DESC) AS posicao
FROM fct_vendas f
JOIN dim_produtos p ON f.produto_id = p.id
GROUP BY p.id, p.nome;
```

## 4. CTE (Common Table Expression) para organizar queries complexas

```sql
-- Faturamento por região com meta
WITH faturamento_regional AS (
  SELECT
    r.id AS regiao_id,
    r.nome AS regiao,
    SUM(f.valor_total) AS faturamento
  FROM fct_vendas f
  JOIN dim_regioes r ON f.regiao_id = r.id
  JOIN dim_tempo t ON f.tempo_id = t.id
  WHERE t.ano = 2024 AND t.mes = 3
  GROUP BY r.id, r.nome
),
metas AS (
  SELECT regiao_id, meta_valor FROM metas_regionais WHERE ano_mes = '2024-03'
)
SELECT
  fr.regiao,
  fr.faturamento,
  m.meta_valor,
  CASE
    WHEN fr.faturamento >= m.meta_valor THEN 'Atingida'
    ELSE 'Não atingida'
  END AS status_meta
FROM faturamento_regional fr
LEFT JOIN metas m ON fr.regiao_id = m.regiao_id
ORDER BY fr.faturamento DESC;
```

## 5. CREATE VIEW — o relatório reutilizável

```sql
-- View: faturamento regional mensal (para o dashboard do CFO)
CREATE VIEW vw_faturamento_regional AS
SELECT
  r.nome AS regiao,
  t.ano,
  t.mes,
  SUM(f.valor_total) AS faturamento,
  COUNT(DISTINCT f.cliente_id) AS clientes_unicos,
  COUNT(*) AS total_itens
FROM fct_vendas f
JOIN dim_regioes r ON f.regiao_id = r.id
JOIN dim_tempo t ON f.tempo_id = t.id
GROUP BY r.nome, t.ano, t.mes;
```

Depois, para consultar:

```sql
SELECT * FROM vw_faturamento_regional
WHERE ano = 2024 AND mes = 3
ORDER BY faturamento DESC;
```

## 6. Missão do jogo (Fase 5)

O ticket do CFO: *"Preciso do faturamento líquido por região e por mês do último trimestre, comparado com o mês anterior. Me entrega uma view pronta chamada `vw_faturamento_regional`."*

O validador verifica:
- A view existe com o nome correto.
- As colunas esperadas estão presentes.
- Os valores batem com o seed.
- Bônus: usar CTE em vez de subquery = +100 pts.

---

**Próxima aula:** Aula 13 — Fase 6 do Caso 006: Auditoria e Performance
