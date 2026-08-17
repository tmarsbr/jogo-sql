# Aula 10 - Fase 3 - ETL (Extração, Transformação e Carga)

**Casos relacionados:** Caso 006 — Fase 3 (ETL: staging → DW)
**Pré-requisitos:** Aula 09 (limpeza de dados)
**Conceitos-chave:** ETL, INSERT...SELECT, CREATE TABLE AS SELECT, carga incremental, evitar duplicatas
**Relação com o jogo:** Fase 3 — carregar dados do staging para o Data Warehouse

---

## 1. O que é ETL?

**ETL** = *Extract, Transform, Load* (Extrair, Transformar, Carregar).

É o processo de mover dados de uma fonte (OLTP, CSV, API) para um destino (Data Warehouse), aplicando transformações no caminho:

| Etapa | O que faz |
|---|---|
| **E**xtrair | Ler dados da fonte (staging) |
| **T**ransformar | Limpar, converter, agregar, enriquecer |
| **L**oad (Carregar) | Inserir no destino (DW) |

## 2. Técnicas de carga no SQLite

### Carga total (CREATE TABLE AS SELECT)

Cria a tabela de destino diretamente a partir de uma query:

```sql
-- Criar dimensão de clientes a partir do staging limpo
CREATE TABLE dim_clientes AS
SELECT
  id,
  nome,
  endereco,
  cidade,
  estado
FROM stg_clientes_limpo;
```

### Carga incremental (INSERT...SELECT com WHERE NOT EXISTS)

Adiciona apenas registros novos, sem duplicar os que já existem:

```sql
-- Carregar apenas vendas que ainda não estão no DW
INSERT INTO fct_vendas (venda_id, cliente_id, vendedor_id, data_venda, valor_total)
SELECT
  s.venda_id,
  s.cliente_id,
  s.vendedor_id,
  s.data_venda,
  s.valor_total
FROM stg_vendas_limpo s
WHERE NOT EXISTS (
  SELECT 1 FROM fct_vendas f WHERE f.venda_id = s.venda_id
);
```

### Carga com atualização (UPSERT simulado)

Se o registro já existe, atualiza; se não, insere:

```sql
-- Atualizar dimensão quando atributo muda (SCD Type 1)
UPDATE dim_clientes
SET endereco = s.endereco,
    cidade = s.cidade
FROM stg_clientes_limpo s
WHERE dim_clientes.id = s.id
  AND (dim_clientes.endereco != s.endereco OR dim_clientes.cidade != s.cidade);

-- Depois, inserir novos
INSERT INTO dim_clientes (id, nome, endereco, cidade, estado)
SELECT s.id, s.nome, s.endereco, s.cidade, s.estado
FROM stg_clientes_limpo s
WHERE NOT EXISTS (SELECT 1 FROM dim_clientes d WHERE d.id = s.id);
```

## 3. O que o jogo pede na Fase 3

No Caso 006, a missão de ETL pede para criar a "carga noturna": mover dados do staging para as tabelas de destino do DW, sem duplicar o que já foi carregado.

O validador verifica:
1. Contagem de registros na tabela destino = contagem esperada.
2. Unicidade (sem duplicatas de chave primária).
3. Ausência de NULLs em colunas obrigatórias.

## 4. Conceito: SCD Type 1 (Slowly Changing Dimension)

Quando um atributo da dimensão muda (ex.: cliente mudou de cidade), você tem opções:

| Tipo | Comportamento | Uso |
|---|---|---|
| **SCD 1** | Sobrescreve o valor antigo | Quando o histórico não importa |
| **SCD 2** | Cria nova linha com datas de vigência | Quando o histórico importa |
| **SCD 3** | Mantém coluna "valor anterior" | Quando só precisa do último anterior |

No jogo, usamos **SCD Type 1** (mais simples): atualizar o valor atual sem preservar histórico.

## 5. Estrutura do DW após o ETL

Após a carga, o DW tem:

| Tabela | Tipo | Origem |
|---|---|---|
| `dim_clientes` | Dimensão | `stg_clientes_limpo` |
| `dim_produtos` | Dimensão | `stg_produtos_limpo` |
| `dim_vendedores` | Dimensão | `stg_vendedores_limpo` |
| `dim_regioes` | Dimensão | `stg_regioes_limpo` |
| `dim_tempo` | Dimensão | Gerada (datas únicas do staging) |
| `fct_vendas` | Fato | `stg_vendas_limpo` + `stg_itens_limpo` (agregado) |

---

**Próxima aula:** Aula 11 — Fase 4 do Caso 006: Modelagem Dimensional (Star Schema)
