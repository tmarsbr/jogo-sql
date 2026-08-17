# Aula 02 - Normalização - Primeira Forma Normal (1FN) e Chave Primária

**Casos relacionados:** Caso 005 — Missões 1 a 4 (Arco 1FN)
**Pré-requisitos:** Aula 01 (conceito geral de normalização)
**Conceitos-chave:** 1FN, valores atômicos, chave primária (PK), DISTINCT, GROUP BY
**Relação com o jogo:** Arco 1 — separar a planilha em tabelas com valores atômicos e PKs

---

## 1. O que é a Primeira Forma Normal (1FN)?

Uma tabela está na **1FN** quando:

1. **Cada célula contém um único valor** (atômico) — não há listas, múltiplos telefones ou "produto1, produto2" na mesma célula.
2. **Cada coluna tem um único tipo de dado** — não misturar "preço" e "descrição" na mesma coluna.
3. **A tabela tem uma chave primária (PK)** que identifica cada linha de forma única.

## 2. Exemplo de violação da 1FN

```sql
-- VIOLAÇÃO: coluna "telefones" tem múltiplos valores
CREATE TABLE clientes_ruim (
  id INTEGER,
  nome TEXT,
  telefones TEXT  -- "11-9999-0000, 11-8888-1111"
);
```

```sql
-- CORRETO: um registro por telefone
CREATE TABLE telefones (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL,
  telefone TEXT NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

## 3. Como aplicar no jogo (Missões 1–4)

No Caso 005, a planilha `supremacy.csv` tem dados de clientes, produtos, vendedores e regiões tudo misturado. A primeira tarefa é **extrair entidades únicas**:

```sql
-- Criar tabela de clientes únicos a partir da planilha
CREATE TABLE clientes AS
SELECT DISTINCT
  TRIM(cliente_nome) AS nome,
  TRIM(cliente_endereco) AS endereco
FROM supremacy;
```

O validador verifica que `COUNT(*)` da tabela `clientes` é igual ao número de clientes distintos na planilha original.

## 4. Chave Primária (PK) — por que é obrigatória?

A PK é o que **identifica cada linha de forma única**. Sem ela, não há como referenciar um registro específico de outra tabela (não tem como criar FK).

```sql
-- Adicionar PK (auto-incremento no SQLite)
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  endereco TEXT
);
```

**Regra do jogo:** toda tabela que você criar precisa ter PK definida. O validador do Caso 005 exige isso.

## 5. Funções úteis para o arco 1FN

| Função | Uso |
|---|---|
| `DISTINCT` | Eliminar linhas duplicadas |
| `TRIM()` | Remover espaços extras (corrige " jose " → "jose") |
| `COUNT(*)` | Contar registros |
| `COUNT(DISTINCT coluna)` | Contar valores únicos |

---

**Próxima aula:** Aula 03 — Segunda Forma Normal (2FN) e Dependência Parcial
