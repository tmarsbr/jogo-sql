# Aula 07 - OLTP vs OLAP - Entendendo os Dois Mundos

**Casos relacionados:** Caso 006 — TechBrasil (Introdução / Fase 0)
**Pré-requisitos:** Caso 005 concluído (modelo OLTP normalizado)
**Conceitos-chave:** OLTP, OLAP, Data Warehouse, diferenças de propósito e design
**Relação com o jogo:** Abertura do Caso 006 — entender o contexto antes de começar

---

## 1. O que é OLTP?

**OLTP** = *Online Transaction Processing* (Processamento de Transações Online).

É o banco de dados que roda o **dia a dia** da empresa: cadastrar cliente, registrar venda, atualizar estoque. Características:

| Característica | OLTP |
|---|---|
| **Propósito** | Processar transações do dia a dia |
| **Operações** | Muitas INSERT/UPDATE/DELETE rápidas |
| **Design** | Normalizado (3FN) — minimiza redundância |
| **Velocidade** | Transações rápidas e concorrentes |
| **Exemplo** | Sistema de PDV, e-commerce, ERP |

O modelo que você construiu no Caso 005 (clientes, produtos, vendas, itens_venda, regioes, vendedores) é um **OLTP**.

## 2. O que é OLAP?

**OLAP** = *Online Analytical Processing* (Processamento Analítico Online).

É o sistema que **analisa** os dados para tomar decisões: relatórios gerenciais, dashboards, tendências. Características:

| Característica | OLAP |
|---|---|
| **Propósito** | Análise e tomada de decisão |
| **Operações** | Muitos SELECT com agregações (SUM, AVG, COUNT) |
| **Design** | Desnormalizado (star schema) — otimizado para leitura |
| **Velocidade** | Consultas complexas em grandes volumes |
| **Exemplo** | Data Warehouse, Power BI, Tableau |

## 3. Por que não usar o OLTP para análise?

O modelo OLTP é otimizado para **escrita rápida** (muitas transações simultâneas). Se você roda um `SELECT` gigante com 5 JOINs e GROUP BY em cima dele:

1. **Lentidão:** o modelo normalizado exige muitos JOINs para recompor o contexto.
2. **Concorrência:** a consulta pesada compete com as transações do dia a dia (vendas, cadastros).
3. **Histórico:** o OLTP guarda o estado atual, não o histórico para análise temporal.

**Solução:** copiar os dados do OLTP para um **Data Warehouse** otimizado para leitura.

## 4. O que é um Data Warehouse (DW)?

Um **Data Warehouse** é um banco de dados separado do OLTP, projetado especificamente para análise. Ele:

- **Consolida** dados de várias fontes (OLTP, planilhas, APIs).
- **Historiza** dados ao longo do tempo (para análise de tendências).
- **Otimiza** para leitura (modelagem dimensional, índices, views materializadas).

## 5. O pipeline completo: OLTP → ETL → DW → OLAP

```
┌─────────┐     ┌──────┐     ┌────────────┐     ┌─────────┐
│  OLTP   │ ──► │ ETL  │ ──► │ Data       │ ──► │  OLAP   │
│ (trans-)│     │(Extrai│     │ Warehouse  │     │(Análise │
│  ações) │     │Trans-│     │ (star      │     │reports, │
└─────────┘     │forma,│     │  schema)   │     │dashboards)
                │Carrega)     └────────────┘     └─────────┘
                └──────┘
```

| Etapa | O que faz |
|---|---|
| **OLTP** | Sistema transacional (dia a dia) |
| **ETL** | Extrai dados do OLTP, transforma (limpa, agrega), carrega no DW |
| **DW** | Armazena dados históricos em modelo dimensional |
| **OLAP** | Consultas analíticas sobre o DW (relatórios, dashboards) |

## 6. O que você vai fazer no Caso 006

Você foi promovido a **Analista de Dados Jr** da TechBrasil. Sua missão: construir o primeiro Data Warehouse da empresa, passando por 6 fases:

| Fase | O que você faz |
|---|---|
| 1. OLTP | Explorar o modelo que você construiu no Caso 005 |
| 2. Limpeza | Corrigir dados sujos no staging (CAST, TRIM, CASE WHEN) |
| 3. ETL | Carregar dados do staging para o DW |
| 4. Modelagem dimensional | Criar star schema (fatos + dimensões) |
| 5. OLAP | Criar views de relatório para a diretoria |
| 6. Auditoria/Performance | Otimizar com índices, criar triggers de auditoria |

---

**Próxima aula:** Aula 08 — Fase 1 do Caso 006: Explorando o Modelo OLTP
