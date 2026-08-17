# Aula 05 - Relacionamentos - PK, FK e Cardinalidade (1:N e N:N)

**Casos relacionados:** Caso 005 — Missões 10 a 12 (Arco Relacionamentos)
**Pré-requisitos:** Aula 04 (3FN)
**Conceitos-chave:** PK, FK, cardinalidade (1:1, 1:N, N:N), tabela intermediária, JOINs
**Relação com o jogo:** Arco 4 — definir chaves e resolver cardinalidade

---

## 1. Chave Primária (PK) e Chave Estrangeira (FK)

| Conceito | O que é | Exemplo |
|---|---|---|
| **PK** | Identifica cada linha de forma única dentro da tabela | `clientes.id` |
| **FK** | Aponta para a PK de outra tabela, criando o relacionamento | `vendas.cliente_id → clientes.id` |

A FK é o que "cola" as tabelas normalizadas de volta. Sem ela, você tem tabelas separadas sem conexão.

```sql
CREATE TABLE vendas (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL,
  data_venda TEXT NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

## 2. Cardinalidade — quantos de cada lado?

Cardinalidade descreve **quantas linhas de uma tabela se relacionam com quantas linhas da outra**.

| Tipo | Descrição | Exemplo no jogo |
|---|---|---|
| **1:1** | Um para um | Um funcionário tem um crachá |
| **1:N** | Um para muitos | Um cliente faz **várias** vendas; cada venda é de **um** cliente |
| **N:N** | Muitos para muitos | Um produto está em **várias** vendas; uma venda tem **vários** produtos |

## 3. Relacionamento 1:N — o mais comum

```sql
-- Um cliente (1) pode ter muitas vendas (N)
-- A FK fica na tabela do lado "N" (vendas)
CREATE TABLE vendas (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL,  -- ← FK aponta para clientes
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

**Regra:** a FK sempre fica na tabela do lado "N".

## 4. Relacionamento N:N — precisa de tabela intermediária

Não dá para colocar uma FK de "muitos produtos" em uma linha de venda (violaria 1FN). A solução é uma **tabela intermediária** (também chamada de "tabela de junção"):

```sql
-- Um produto pode estar em várias vendas (N)
-- Uma venda pode ter vários produtos (N)
-- Solução: tabela intermediária "itens_venda"
CREATE TABLE itens_venda (
  venda_id INTEGER,
  produto_id INTEGER,
  quantidade INTEGER NOT NULL,
  preco_unitario REAL NOT NULL,
  PRIMARY KEY (venda_id, produto_id),       -- PK composta
  FOREIGN KEY (venda_id) REFERENCES vendas(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);
```

A tabela intermediária tem:
- **PK composta** (venda_id + produto_id) — cada combinação é única.
- **Duas FKs** — uma para cada tabela original.
- **Atributos do relacionamento** (quantidade, preço) — que pertencem à relação, não a nenhuma das duas entidades.

## 5. Relacionamento opcional vs. obrigatório

Nem todo relacionamento é obrigatório:

- **Obrigatório:** a FK não pode ser NULL (`NOT NULL`) — toda venda **precisa** ter um cliente.
- **Opcional:** a FK pode ser NULL — um cliente pode existir **sem** ter feito compras ainda.

```sql
-- Cliente opcional (pode existir sem vendas)
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL
  -- sem FK de venda — o relacionamento é opcional do lado do cliente
);

-- Para listar clientes que AINDA NÃO compraram:
SELECT c.nome
FROM clientes c
LEFT JOIN vendas v ON c.id = v.cliente_id
WHERE v.id IS NULL;
```

O `LEFT JOIN` + `WHERE IS NULL` é a técnica para encontrar registros **sem correspondência** no outro lado.

## 6. Como aplicar no jogo (Missões 10–12)

- **Missão 10:** definir PKs e FKs nas tabelas já criadas (1:N).
- **Missão 11:** criar a tabela intermediária `itens_venda` para o relacionamento N:N entre vendas e produtos. O validador exige PK composta + 2 FKs.
- **Missão 12:** usar `LEFT JOIN` para encontrar clientes sem compras (relacionamento opcional).

## 7. Diagrama ER — o mapa visual

O diagrama ER mostra as tabelas como caixas e os relacionamentos como linhas com cardinalidade:

```
clientes (1) ───< vendas (N) ───< itens_venda (N) >─── (1) produtos
```

- `(1)` = um
- `<` ou `>` = muitos
- `───` = relacionamento

No jogo, o **Diagrama Vivo** (Mecânica 4) deixa você arrastar as FKs para as tabelas certas e ver a cardinalidade em tempo real.

---

**Próxima aula:** Aula 06 — O Teste da Realidade: Por Que Normalizar? (Caso 005 — Fechamento)
