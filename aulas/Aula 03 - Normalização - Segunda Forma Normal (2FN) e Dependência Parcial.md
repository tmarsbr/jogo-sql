# Aula 03 - Normalização - Segunda Forma Normal (2FN) e Dependência Parcial

**Casos relacionados:** Caso 005 — Missões 5 a 7 (Arco 2FN)
**Pré-requisitos:** Aula 02 (1FN e PK)
**Conceitos-chave:** 2FN, dependência parcial, chave composta, separação de atributos
**Relação com o jogo:** Arco 2 — separar atributos que dependem de parte da chave composta

---

## 1. O que é a Segunda Forma Normal (2FN)?

Uma tabela está na **2FN** quando:

1. Já está na **1FN**.
2. Todo atributo que **não é chave** depende da chave **inteira**, não de apenas **parte** dela.

Isso só se aplica quando a tabela tem uma **chave composta** (PK formada por mais de uma coluna). Se a PK é simples (uma coluna só), a tabela já está automaticamente na 2FN.

## 2. Dependência parcial — o que é?

Imagine a tabela de detalhes de venda:

```sql
-- Tabela com chave composta (venda_id + produto_id)
CREATE TABLE detalhes_venda (
  venda_id INTEGER,
  produto_id INTEGER,
  quantidade INTEGER,
  preco_unitario REAL,
  produto_nome TEXT,        -- ← VIOLAÇÃO: depende só de produto_id, não da chave inteira
  produto_categoria TEXT,   -- ← VIOLAÇÃO: depende só de produto_id
  PRIMARY KEY (venda_id, produto_id)
);
```

**`produto_nome` e `produto_categoria`** não dependem da venda — dependem **só do produto**. Se o mesmo produto aparece em 5 vendas diferentes, o nome se repete 5 vezes. Isso é **dependência parcial**.

## 3. Como corrigir: separar em tabelas

```sql
-- Tabela de produtos (nome depende só do produto_id)
CREATE TABLE produtos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT
);

-- Tabela de itens da venda (quantidade e preço dependem da combinação venda+produto)
CREATE TABLE itens_venda (
  venda_id INTEGER,
  produto_id INTEGER,
  quantidade INTEGER NOT NULL,
  preco_unitario REAL NOT NULL,
  PRIMARY KEY (venda_id, produto_id),
  FOREIGN KEY (venda_id) REFERENCES vendas(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);
```

Agora:
- `quantidade` e `preco_unitario` dependem da chave composta (venda + produto) ✅
- `produto_nome` e `categoria` estão na tabela `produtos`, onde dependem só do `id` ✅

## 4. Como aplicar no jogo (Missões 5–7)

No Caso 005, a missão 6 pede para separar `detalhes_venda` (quantidade, preço) da tabela de `vendas` (data, cliente). O validador exige que **nenhum atributo de produto exista na tabela de venda** — ou seja, `produto_nome`, `produto_preco` etc. precisam estar em `produtos`, referenciados por FK.

```sql
-- Exemplo de separação no jogo
CREATE TABLE produtos AS
SELECT DISTINCT produto_id, produto_nome, produto_preco, produto_categoria
FROM detalhes_venda;

CREATE TABLE itens_venda AS
SELECT venda_id, produto_id, quantidade, preco_unitario
FROM detalhes_venda;
```

## 5. Dica para identificar dependência parcial

Faça a pergunta: *"Se eu mudar o valor deste atributo, a chave inteira muda ou só uma parte?"*

- Se só **uma parte** da chave muda → dependência parcial → separar em outra tabela.

---

**Próxima aula:** Aula 04 — Terceira Forma Normal (3FN) e Dependência Transitiva
