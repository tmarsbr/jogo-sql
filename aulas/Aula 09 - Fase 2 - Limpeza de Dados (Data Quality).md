# Aula 09 - Fase 2 - Limpeza de Dados (Data Quality)

**Casos relacionados:** Caso 006 — Fase 2 (Limpeza de dados no staging)
**Pré-requisitos:** Aula 08 (exploração do OLTP)
**Conceitos-chave:** CAST, TRIM, REPLACE, NULLIF, CASE WHEN, COALESCE, dados sujos
**Relação com o jogo:** Fase 2 — corrigir dados sujos antes de carregar o DW

---

## 1. Por que os dados chegam "sujos"?

No mundo real, dados vêm de várias fontes (CSV, planilhas, APIs, sistemas legados) e quase sempre têm problemas:

| Problema | Exemplo | Causa comum |
|---|---|---|
| **Espaços extras** | `" José "` | Digitação manual |
| **Vírgula em decimal** | `"3.500,00"` | Sistema brasileiro vs. americano |
| **NULLs** | `NULL` em campo obrigatório | Formulário não preenchido |
| **Duplicatas** | Mesmo cliente cadastrado 2x | Sem validação de unicidade |
| **Caixa inconsistente** | `"jose"`, `"JOSE"`, `"José"` | Sem padronização |
| **Datas em formatos diferentes** | `"05/01/2024"`, `"2024-01-05"` | Sistemas diferentes |

## 2. Funções de limpeza essenciais

### TRIM — remover espaços

```sql
-- "  José  " → "José"
SELECT TRIM('  José  ');
-- 'José'
```

### REPLACE — substituir texto

```sql
-- "3.500,00" → "3500.00" (remover ponto de milhar e trocar vírgula por ponto)
SELECT REPLACE(REPLACE('3.500,00', '.', ''), ',', '.');
-- '3500.00'
```

### CAST — converter tipo de dado

```sql
-- "3500.00" (texto) → 3500.00 (numérico)
SELECT CAST('3500.00' AS REAL);
```

### NULLIF — tratar valores "falsos"

```sql
-- Se o campo é vazio (''), tratar como NULL
SELECT NULLIF('', '') IS NULL;
-- 1 (true)

SELECT NULLIF('valor', '') IS NULL;
-- 0 (false)
```

### COALESCE — valor padrão para NULL

```sql
-- Se telefone é NULL, usar 'Não informado'
SELECT COALESCE(telefone, 'Não informado') FROM clientes;
```

### CASE WHEN — lógica condicional

```sql
-- Classificar vendas por valor
SELECT
  venda_id,
  valor,
  CASE
    WHEN valor > 10000 THEN 'Alto'
    WHEN valor > 5000 THEN 'Médio'
    ELSE 'Baixo'
  END AS classificacao
FROM vendas;
```

## 3. Pipeline de limpeza no jogo (Fase 2)

No Caso 006, o staging recebe dados do CSV original (o mesmo `supremacy.csv` do Caso 005, mas agora com mais problemas para corrigir). O jogador aplica as funções de limpeza para transformar os dados sujos em dados prontos para o DW.

**Exemplo de missão:** corrigir a coluna `preco_venda` que veio como texto com vírgula:

```sql
-- Dados sujos no staging
-- preco_venda: "3.500,00", "120,50", " 890,00 "

-- Limpeza
CREATE TABLE stg_vendas_limpo AS
SELECT
  venda_id,
  cliente_id,
  TRIM(preco_venda) AS preco_raw,
  CAST(REPLACE(REPLACE(TRIM(preco_venda), '.', ''), ',', '.') AS REAL) AS preco_limpo
FROM stg_vendas;
```

O validador verifica que `preco_limpo` é numérico e que não há NULLs ou valores inválidos.

## 4. Regra de ouro: validar antes de carregar

Nunca carregue dados no DW sem validar. Uma boa prática é criar uma query de "contagem de problemas":

```sql
SELECT
  COUNT(*) AS total,
  SUM(CASE WHEN preco_limpo IS NULL THEN 1 ELSE 0 END) AS nulls,
  SUM(CASE WHEN preco_limpo <= 0 THEN 1 ELSE 0 END) AS negativos_ou_zero,
  SUM(CASE WHEN cliente_id IS NULL THEN 1 ELSE 0 END) AS sem_cliente
FROM stg_vendas_limpo;
```

Se qualquer contagem de problema for > 0, corrija antes de prosseguir.

---

**Próxima aula:** Aula 10 — Fase 3 do Caso 006: ETL (Extração, Transformação e Carga)
