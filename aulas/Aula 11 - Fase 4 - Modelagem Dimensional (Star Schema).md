# Aula 11 - Fase 4 - Modelagem Dimensional (Star Schema)

**Casos relacionados:** Caso 006 — Fase 4 (Criar fatos e dimensões)
**Pré-requisitos:** Aula 10 (ETL), normalização (Caso 005)
**Conceitos-chave:** Star schema, tabela de fatos, tabela de dimensão, granularidade, SCD
**Relação com o jogo:** Fase 4 — desenhar o modelo dimensional do DW

---

## 1. O que é modelagem dimensional?

Modelagem dimensional é uma técnica de design de Data Warehouse que organiza os dados em dois tipos de tabelas:

| Tipo | O que armazena | Exemplo |
|---|---|---|
| **Tabela de Fatos** | Métricas/medidas (números que você quer analisar) | Vendas, receita, quantidade |
| **Tabela de Dimensão** | Contexto/descrição (quem, o quê, onde, quando) | Cliente, produto, região, tempo |

O nome "star schema" (esquema estrela) vem do visual: a tabela de fatos no centro, com as dimensões ao redor como pontas de uma estrela.

```
            dim_tempo
                |
dim_regiao ── fct_vendas ── dim_produto
                |
           dim_vendedor
                |
           dim_cliente
```

## 2. Tabela de Fatos — o centro da estrela

A tabela de fatos contém:

- **Chaves estrangeiras** para cada dimensão.
- **Medidas** (métricas numéricas que você quer agregar).

```sql
CREATE TABLE fct_vendas (
  id INTEGER PRIMARY KEY,
  -- Chaves para as dimensões
  tempo_id INTEGER NOT NULL,      -- quando
  cliente_id INTEGER NOT NULL,    -- quem comprou
  produto_id INTEGER NOT NULL,    -- o quê
  vendedor_id INTEGER NOT NULL,   -- quem vendeu
  regiao_id INTEGER NOT NULL,     -- onde
  -- Medidas
  quantidade INTEGER NOT NULL,
  valor_unitario REAL NOT NULL,
  valor_total REAL NOT NULL,
  desconto REAL DEFAULT 0,
  FOREIGN KEY (tempo_id) REFERENCES dim_tempo(id),
  FOREIGN KEY (cliente_id) REFERENCES dim_clientes(id),
  FOREIGN KEY (produto_id) REFERENCES dim_produtos(id),
  FOREIGN KEY (vendedor_id) REFERENCES dim_vendedores(id),
  FOREIGN KEY (regiao_id) REFERENCES dim_regioes(id)
);
```

**Granularidade:** cada linha da `fct_vendas` representa **um item de uma venda** (a menor unidade de detalhe). Se uma venda tem 3 produtos, são 3 linhas na fato.

## 3. Tabela de Dimensão — o contexto

As dimensões descrevem o contexto das métricas:

```sql
CREATE TABLE dim_tempo (
  id INTEGER PRIMARY KEY,
  data_completa TEXT NOT NULL,
  ano INTEGER,
  mes INTEGER,
  dia INTEGER,
  trimestre TEXT,
  dia_semana TEXT
);

CREATE TABLE dim_clientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT,
  estado TEXT
);

CREATE TABLE dim_produtos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT,
  preco_atual REAL
);

CREATE TABLE dim_vendedores (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  regiao_id INTEGER,
  data_admissao TEXT,
  FOREIGN KEY (regiao_id) REFERENCES dim_regioes(id)
);

CREATE TABLE dim_regioes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  gerente TEXT
);
```

## 4. Diferença: OLTP (3FN) vs. DW (Star Schema)

| Aspecto | OLTP (3FN) | DW (Star Schema) |
|---|---|---|
| **Objetivo** | Transações rápidas | Análise rápida |
| **Design** | Normalizado (muitas tabelas, FKs) | Desnormalizado (poucos JOINs) |
| **Leitura** | Precisa de muitos JOINs | Poucos JOINs (fato + dimensões) |
| **Histórico** | Estado atual | Histórico completo |
| **Exemplo** | `vendas` + `itens_venda` + `clientes` + `produtos` | `fct_vendas` + `dim_*` |

**Por que desnormalizar no DW?** Porque para análise, você quer responder perguntas como "faturamento por região e mês" com o mínimo de JOINs possível. No OLTP, isso exigiria 5+ JOINs. No star schema, são 2–3.

## 5. Missão do jogo (Fase 4)

No Caso 006, a missão pede para:

1. Criar as dimensões (`dim_*`) a partir das tabelas do OLTP.
2. Criar a `fct_vendas` com as FKs para todas as dimensões.
3. Preencher com dados via `INSERT...SELECT`.
4. Resolver um cenário SCD: *"o vendedor 'R. Souza' virou 'Rodrigo Souza' — atualize sem perder histórico."*

O validador verifica:
- Estrutura correta (FKs apontando para as dimensões).
- Granularidade (1 linha por item de venda).
- Dados coerentes (sem FKs órfãs).

---

**Próxima aula:** Aula 12 — Fase 5 do Caso 006: OLAP (Consultas Analíticas e Views)
