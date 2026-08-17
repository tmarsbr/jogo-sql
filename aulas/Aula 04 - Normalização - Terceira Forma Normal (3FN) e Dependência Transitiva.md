# Aula 04 - Normalização - Terceira Forma Normal (3FN) e Dependência Transitiva

**Casos relacionados:** Caso 005 — Missões 8 a 9 (Arco 3FN)
**Pré-requisitos:** Aula 03 (2FN e dependência parcial)
**Conceitos-chave:** 3FN, dependência transitiva, atributo não-chave dependendo de outro atributo não-chave
**Relação com o jogo:** Arco 3 — separar atributos que dependem de outro atributo não-chave

---

## 1. O que é a Terceira Forma Normal (3FN)?

Uma tabela está na **3FN** quando:

1. Já está na **2FN**.
2. Nenhum atributo não-chave depende de **outro atributo não-chave** — todos dependem **diretamente** da chave primária.

Essa segunda regra elimina a **dependência transitiva**: quando A → B → C, e C não depende diretamente de A (depende de B, que depende de A).

## 2. Dependência transitiva — o que é?

Imagine a tabela de vendedores:

```sql
CREATE TABLE vendedores (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  regiao_id INTEGER,
  regiao_nome TEXT,       -- ← VIOLAÇÃO: depende de regiao_id, não diretamente do vendedor
  regiao_gerente TEXT     -- ← VIOLAÇÃO: depende de regiao_id, não diretamente do vendedor
);
```

**`regiao_nome` e `regiao_gerente`** não descrevem o vendedor — descrevem a **região**. Eles dependem de `regiao_id`, que por sua vez depende do vendedor. Isso é transitividade: vendedor → regiao_id → regiao_nome.

**Consequência prática:** se a região "Sudeste" mudar de gerente, você precisa atualizar todos os vendedores daquela região. Se esquecer um, tem dois gerentes diferentes para a mesma região.

## 3. Como corrigir: extrair para tabela própria

```sql
-- Tabela de regiões (gerente depende do id da região)
CREATE TABLE regioes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  gerente TEXT
);

-- Tabela de vendedores (só atributos que dependem diretamente do vendedor)
CREATE TABLE vendedores (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  regiao_id INTEGER NOT NULL,
  FOREIGN KEY (regiao_id) REFERENCES regioes(id)
);
```

Agora:
- `regiao_nome` e `gerente` estão em `regioes`, onde dependem diretamente do `id` ✅
- `vendedores` só tem atributos que descrevem o vendedor ✅

## 4. Como aplicar no jogo (Missões 8–9)

No Caso 005, a missão 9 pede para tirar `regiao_nome` e `regiao_gerente` de `vendedores` e colocar em uma tabela `regioes`. O validador exige:

1. **FK** em `vendedores.regiao_id` apontando para `regioes.id`.
2. **Ausência** das colunas transitivas (`regiao_nome`, `regiao_gerente`) na tabela `vendedores`.

```sql
-- No jogo
CREATE TABLE regioes AS
SELECT DISTINCT regiao_id, regiao_nome, regiao_gerente
FROM vendedores;

ALTER TABLE vendedores DROP COLUMN regiao_nome;
ALTER TABLE vendedores DROP COLUMN regiao_gerente;
```

> **Nota:** SQLite não suporta `DROP COLUMN` em versões antigas (anteriores a 3.35.0). O sql.js usado no jogo é recente o suficiente, mas se der erro, a alternativa é recriar a tabela sem as colunas.

## 5. Regra de ouro para identificar dependência transitiva

Pergunte: *"Este atributo descreve a entidade da tabela ou descreve outra entidade?"*

- Se descreve **outra entidade** → dependência transitiva → mover para a tabela dessa entidade.

---

**Próxima aula:** Aula 05 — Relacionamentos: Chave Primária, Chave Estrangeira e Cardinalidade
