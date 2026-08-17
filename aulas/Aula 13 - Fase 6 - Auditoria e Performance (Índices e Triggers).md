# Aula 13 - Fase 6 - Auditoria e Performance (Índices e Triggers)

**Casos relacionados:** Caso 006 — Fase 6 (Otimização e auditoria do DW)
**Pré-requisitos:** Aula 12 (OLAP e views)
**Conceitos-chave:** EXPLAIN QUERY PLAN, CREATE INDEX, CREATE TRIGGER, auditoria de dados
**Relação com o jogo:** Fase 6 — otimizar o DW lento e criar trilha de auditoria

---

## 1. O problema: o DW ficou lento

Depois de carregar milhares de registros, as queries analíticas começaram a demorar. O fechamento mensal está travando. Hora de otimizar.

## 2. EXPLAIN QUERY PLAN — entender o custo

Antes de otimizar, você precisa saber **onde** está o gargalo:

```sql
-- Ver o plano de execução de uma query
EXPLAIN QUERY PLAN
SELECT r.nome, SUM(f.valor_total)
FROM fct_vendas f
JOIN dim_regioes r ON f.regiao_id = r.id
GROUP BY r.nome;
```

Resultado típico:

```
QUERY PLAN
├── SCAN fct_vendas          ← varre a tabela inteira (lento!)
└── SEARCH dim_regioes USING INTEGER PRIMARY KEY
```

Se aparece **"SCAN"** em vez de **"SEARCH USING INDEX"**, significa que o banco está lendo todas as linhas — e isso fica mais lento conforme a tabela cresce.

## 3. CREATE INDEX — acelerar consultas

Um índice é uma estrutura que permite ao banco **encontrar registros sem varrer a tabela inteira**:

```sql
-- Criar índice na coluna mais usada em WHERE/JOIN
CREATE INDEX idx_fct_vendas_regiao ON fct_vendas(regiao_id);
CREATE INDEX idx_fct_vendas_tempo ON fct_vendas(tempo_id);
CREATE INDEX idx_fct_vendas_cliente ON fct_vendas(cliente_id);

-- Índice composto (para queries que filtram por duas colunas)
CREATE INDEX idx_fct_vendas_regiao_tempo ON fct_vendas(regiao_id, tempo_id);
```

Depois do índice, o plano muda:

```
QUERY PLAN
├── SEARCH fct_vendas USING INDEX idx_fct_vendas_regiao  ← rápido!
└── SEARCH dim_regioes USING INTEGER PRIMARY KEY
```

### Quando criar índice?

| Situação | Criar índice? |
|---|---|
| Coluna usada em `WHERE` frequentemente | ✅ Sim |
| Coluna usada em `JOIN` (FK) | ✅ Sim |
| Coluna usada em `ORDER BY` / `GROUP BY` | ✅ Às vezes |
| Tabela pequena (< 1000 linhas) | ❌ Não necessário |
| Coluna que muda com frequência (UPDATE constante) | ⚠️ Cuidado (índice precisa ser atualizado) |

### Trade-off

Índices aceleram **leitura** mas desaceleram **escrita** (INSERT/UPDATE/DELETE), porque o índice precisa ser atualizado a cada modificação. Em um DW (leitura pesada), índices valem muito a pena.

## 4. DROP INDEX — remover índice

```sql
-- Remover índice que não é mais necessário
DROP INDEX idx_fct_vendas_regiao;
```

## 5. CREATE TRIGGER — auditoria automática

Um **trigger** é um gatilho que executa SQL automaticamente quando algo acontece (INSERT, UPDATE, DELETE). Usamos para **auditar** alterações:

```sql
-- Tabela de log de auditoria
CREATE TABLE log_auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tabela_afetada TEXT NOT NULL,
  operacao TEXT NOT NULL,       -- 'INSERT', 'UPDATE', 'DELETE'
  registro_id INTEGER,
  coluna_alterada TEXT,
  valor_antigo TEXT,
  valor_novo TEXT,
  data_hora TEXT DEFAULT (datetime('now'))
);

-- Trigger: registrar toda alteração em fct_vendas
CREATE TRIGGER trg_audit_fct_vendas
AFTER UPDATE ON fct_vendas
FOR EACH ROW
BEGIN
  INSERT INTO log_auditoria (tabela_afetada, operacao, registro_id, valor_antigo, valor_novo)
  VALUES ('fct_vendas', 'UPDATE', OLD.id, OLD.valor_total, NEW.valor_total);
END;
```

Agora, toda vez que alguém atualizar `fct_vendas`, o trigger grava automaticamente no log:

```sql
-- Alguém altera um valor
UPDATE fct_vendas SET valor_total = 5000 WHERE id = 100;

-- O trigger registrou:
SELECT * FROM log_auditoria WHERE registro_id = 100;
-- tabela: fct_vendas | operacao: UPDATE | antigo: 3500 | novo: 5000 | data: 2024-03-15 14:30:00
```

## 6. Missão do jogo (Fase 6)

No Caso 006, a fase 6 tem 3 partes:

1. **Otimização:** usar `EXPLAIN QUERY PLAN` para identificar o gargalo, criar índices nas FKs mais usadas, e comparar o custo antes/depois.
2. **Auditoria:** criar um trigger que registra alterações na `fct_vendas` no `log_auditoria`.
3. **Entrega final:** apresentar o relatório à diretoria (confronto com 3 perguntas, no padrão do interrogatório do Caso 001).

O validador verifica:
- O plano de execução mostra `SEARCH USING INDEX` após a criação dos índices.
- O trigger existe e grava no `log_auditoria` quando um UPDATE ocorre.

---

**Próxima aula:** Aula 14 — Certificação e Portfolio (Conclusão da Trilha)
