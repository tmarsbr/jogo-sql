# 12 Projetos SQL End-to-End para Análise de Dados

Documento de especificação técnica, arquitetura de dados e matriz pedagógica dos **12 Projetos SQL** para o jogo **SQL Detective**.

---

## 1. Visão Geral e Filosofia

Diferente dos 4 casos investigativos originais (foco policial/fraude com grafo de suspeitos e interrogatório), os **12 Projetos de Análise de Dados** posicionam o jogador como um **Analista de Dados / Engenheiro de Analytics**.

### Diretrizes Centrais
1. **Acesso Livre e Independente**: Todos os 12 projetos ficam desbloqueados desde o início (`lockedByDefault: false`). O jogador pode escolher qualquer cenário de negócio para praticar.
2. **Foco 100% em SQL**: Sem mecânicas policiais (sem grafo de suspeitos, timeline investigativa ou interrogatório). O foco é na modelagem, consulta analítica e resposta a perguntas de negócio.
3. **Etapa 0 Obrigatória**: Cada projeto possui documentação do modelo relacional (entidades, decisões de design e checkpoints conceituais).
4. **Missões Finais Diversificadas**: Seis projetos terminam com `CREATE VIEW`; os demais consolidam os indicadores com combinações de `CTE`, `JOIN`, agregações e Window Functions.

---

## 2. Mapa dos 12 Projetos

| # | ID | Tema | Ícone | Pergunta Central de Negócio | Foco Técnico Principal | Tipo Missão 10 |
|---|---|---|---|---|---|---|
| **05** | `proj-ecommerce` | E-Commerce | 🛒 | Quais produtos geram mais receita? | JOINs, agregação, volume, receita | `CREATE VIEW` |
| **06** | `proj-clientes` | Clientes | 👥 | Quem são os clientes mais valiosos? | LTV, segmentação por valor, recorrência, suporte | `CTE + Window Functions + JOIN` |
| **07** | `proj-vendas` | Vendas | 📈 | Como o faturamento evoluiu por mês? | Séries temporais, `LAG()`, acumulado, metas | `CREATE VIEW` |
| **08** | `proj-marketing` | Marketing | 📣 | Qual campanha converte mais? | Funil, investimento, receita, ticket médio | `CTE + JOINs + Agregação` |
| **09** | `proj-logistica` | Logística | 🚚 | Quais regiões têm mais atrasos? | Lead time, SLA, `julianday()`, pontualidade por modal | `CREATE VIEW` |
| **10** | `proj-estoque` | Estoque | 📦 | Quais produtos estão parados? | Saldo físico, estoque mínimo, valor imobilizado, suprimentos | `CTE + JOINs` |
| **11** | `proj-educacao` | Educação | 🎓 | Quais disciplinas têm maior reprovação? | Médias, reprovações, `DENSE_RANK()`, desempenho | `CREATE VIEW` |
| **12** | `proj-saude` | Saúde | 🏥 | Quais especialidades têm maior demanda? | Demanda, No-Show, tempo de espera, convênios | `CTE + Window Functions` |
| **13** | `proj-financeiro` | Banking & Crédito | 💳 | Quais clientes gastam mais no cartão e qual o risco de inadimplência? | Gastos, Limites, Score, Running Total | `CREATE VIEW` |
| **14** | `proj-suporte` | Suporte | 🎧 | Qual o tempo médio de atendimento? | SLA, CSAT, Tempo de Resolução, Produtividade | `CTE + JOIN + COALESCE` |
| **15** | `proj-publico` | GovTech & Transparência | 🏛️ | Quais municípios têm maior gasto público e execução fiscal? | Despesa Per Capita, Liquidação, PIB, Ranking | `CREATE VIEW` |
| **16** | `proj-futebol` | Futebol | ⚽ | Quais atletas finalizam mais e têm maior pontaria? | Gols, Assistências, Pontaria, Scout | `CTE + Window Functions` |

---

## 3. Especificação Detalhada por Projeto

---

### Projeto 05: E-Commerce (`proj-ecommerce`)
> **Pergunta de Negócio**: *Quais produtos geram mais receita e impulsionam o crescimento da loja?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE categorias (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  margem_padrao REAL NOT NULL
);

CREATE TABLE produtos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  preco_unitario_centavos INTEGER NOT NULL,
  custo_centavos INTEGER NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  data_cadastro TEXT NOT NULL
);

CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data_pedido TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pago', 'enviado', 'entregue', 'cancelado')),
  cupom_desconto TEXT
);

CREATE TABLE itens_pedido (
  id INTEGER PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL CHECK(quantidade > 0),
  preco_praticado_centavos INTEGER NOT NULL
);
```

#### Etapa 0 — Análise do Banco
- **Entidades**: `categorias` (hierarquia e margens), `produtos` (catálogo e precificação), `clientes` (dados demográficos), `pedidos` (cabeçalho de compra e status), `itens_pedido` (detalhe granular N:N).
- **Decisões**: Preço praticado histórico salvo no item (evita alteração retroativa quando o preço do catálogo muda); status do pedido isola pedidos cancelados de receitas reais.
- **Checkpoints**: Por que salvar `preco_praticado_centavos` em `itens_pedido`? Como evitar duplicidade ao calcular receita total?

#### Missões Pedagógicas (1 a 10)
1. `SELECT + WHERE`: Produtos ativos com preço acima de R$ 500,00 (`preco_unitario_centavos > 50000`).
2. `COUNT + GROUP BY`: Quantidade de produtos cadastrados por categoria.
3. `SUM + JOIN`: Faturamento total bruto por produto considerando pedidos pagos/entregues.
4. `ORDER BY + LIMIT`: Top 3 produtos mais vendidos em quantidade total nos pedidos não cancelados.
5. `JOIN múltiplo`: Pedidos entregues com nome do cliente, estado e quantidade total de itens.
6. `HAVING`: Categorias cuja receita em pedidos pagos/entregues ultrapassou R$ 5.000,00 (500000 centavos).
7. `strftime + GROUP BY`: Evolução mensal da receita dos pedidos válidos (`strftime('%Y-%m', pe.data_pedido)`).
8. `CASE WHEN`: Classificação de pedidos por faixa de valor (Pequeno, Médio, Grande).
9. `CTE + Subquery`: Produtos cuja receita em pedidos pagos/entregues supera a média de todos os produtos com vendas.
10. `CREATE VIEW + JOIN + GROUP BY`: Criar a view `vw_resumo_performance_produtos` com ID, nome do produto, categoria, total de itens vendidos e receita total em pedidos pagos/entregues.

---

### Projeto 06: Gestão de Clientes (`proj-clientes`)
> **Pergunta de Negócio**: *Quem são os clientes mais valiosos e como compras, plano e suporte compõem esse valor?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE segmentos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT
);

CREATE TABLE planos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  mensalidade_centavos INTEGER NOT NULL
);

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  segmento_id INTEGER NOT NULL REFERENCES segmentos(id),
  plano_id INTEGER NOT NULL REFERENCES planos(id),
  data_cadastro TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ativo', 'inativo', 'cancelado'))
);

CREATE TABLE compras (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  valor_centavos INTEGER NOT NULL,
  data_compra TEXT NOT NULL,
  canal TEXT NOT NULL
);

CREATE TABLE tickets_atendimento (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data_abertura TEXT NOT NULL,
  motivo TEXT NOT NULL,
  resolvido INTEGER NOT NULL
);
```

#### Missões Pedagógicas (1 a 10)
1. `SELECT + WHERE`: Clientes cadastrados no segmento Enterprise com status ativo.
2. `COUNT + GROUP BY`: Distribuição da base de clientes por plano contratado.
3. `SUM + JOIN`: Lifetime Value (LTV) acumulado por cliente em compras.
4. `MAX + DATE`: Identificar a data da última compra de cada cliente (Recência).
5. `COUNT + HAVING`: Clientes recorrentes com pelo menos 3 compras avulsas.
6. `LEFT JOIN + IS NULL`: Clientes ativos que nunca abriram nenhum ticket de suporte.
7. `CASE WHEN`: Classificação por valor total gasto: VIP, Fidelizado ou Standard.
8. `Subquery`: Clientes que gastaram mais do que a média geral de gastos.
9. `Window ROW_NUMBER`: Identificar a compra mais cara de cada cliente.
10. `CTE + Window + JOIN`: Matriz consolidada com cliente, plano, total gasto, quantidade de tickets e ranking de faturamento (`DENSE_RANK`).

---

### Projeto 07: Desempenho de Vendas (`proj-vendas`)
> **Pergunta de Negócio**: *Como o faturamento evoluiu ao longo do tempo e quais regiões superaram as metas?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE regioes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  gerente_regional TEXT NOT NULL
);

CREATE TABLE vendedores (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  regiao_id INTEGER NOT NULL REFERENCES regioes(id),
  data_admissao TEXT NOT NULL
);

CREATE TABLE vendas (
  id INTEGER PRIMARY KEY,
  vendedor_id INTEGER NOT NULL REFERENCES vendedores(id),
  valor_centavos INTEGER NOT NULL,
  data_venda TEXT NOT NULL,
  desconto_percentual REAL DEFAULT 0
);

CREATE TABLE metas_mensais (
  id INTEGER PRIMARY KEY,
  vendedor_id INTEGER NOT NULL REFERENCES vendedores(id),
  ano_mes TEXT NOT NULL,
  meta_centavos INTEGER NOT NULL,
  UNIQUE(vendedor_id, ano_mes)
);
```

#### Missões Pedagógicas (1 a 10)
1. `SUM + strftime`: Faturamento mensal total da empresa agrupado por `YYYY-MM`.
2. `JOIN + GROUP BY`: Total faturado por vendedor com o nome da sua respectiva região.
3. `JOIN + Comparação`: Em janeiro de 2024, valor realizado e meta de cada vendedor.
4. `HAVING`: Vendedores cujo faturamento acumulado no trimestre ultrapassou R$ 100.000,00 (10000000 centavos).
5. `Window LAG`: Faturamento mensal total e valor do mês anterior com `LAG()`.
6. `Window SUM OVER`: Faturamento acumulado progressivo por venda (running total).
7. `CASE WHEN`: Em março de 2024, classificação de cada vendedor como Superou Meta ou Abaixo da Meta.
8. `GROUP BY múltiplo`: Faturamento cruzado por Região e Mês.
9. `CTE + ORDER BY + LIMIT`: Região com maior faturamento total no trimestre.
10. `CREATE VIEW + JOIN + GROUP BY`: View `vw_painel_vendas_gerencial` com vendedor, região, faturamento total e quantidade de vendas fechadas.

---

### Projeto 08: Análise de Marketing (`proj-marketing`)
> **Pergunta de Negócio**: *Quais campanhas e canais geram mais leads, conversões e receita dentro do orçamento?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE canais (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL
);

CREATE TABLE campanhas (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  canal_id INTEGER NOT NULL REFERENCES canais(id),
  orcamento_centavos INTEGER NOT NULL,
  data_inicio TEXT NOT NULL,
  data_fim TEXT NOT NULL
);

CREATE TABLE leads (
  id INTEGER PRIMARY KEY,
  campanha_id INTEGER NOT NULL REFERENCES campanhas(id),
  email TEXT NOT NULL,
  data_captura TEXT NOT NULL,
  qualificado INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE conversoes (
  id INTEGER PRIMARY KEY,
  lead_id INTEGER NOT NULL UNIQUE REFERENCES leads(id),
  valor_venda_centavos INTEGER NOT NULL,
  data_conversao TEXT NOT NULL
);

CREATE TABLE custos_diarios (
  id INTEGER PRIMARY KEY,
  campanha_id INTEGER NOT NULL REFERENCES campanhas(id),
  data TEXT NOT NULL,
  custo_centavos INTEGER NOT NULL,
  cliques INTEGER NOT NULL,
  impressoes INTEGER NOT NULL
);
```

#### Missões Pedagógicas (1 a 10)
1. `COUNT + GROUP BY`: Total de leads gerados por campanha.
2. `SUM + JOIN`: Custo total investido por canal de aquisição.
3. `COUNT + WHERE + GROUP BY`: Total de leads qualificados (`qualificado = 1`) por campanha.
4. `SUM + JOIN`: Receita total das conversões originadas em cada campanha.
5. `HAVING`: Campanhas cuja receita de conversão ultrapassou R$ 5.000,00 (500000 centavos).
6. `AVG + ORDER BY + LIMIT`: Top 2 campanhas por ticket médio das vendas convertidas.
7. `strftime + SUM`: Investimento mensal total em custos de mídia.
8. `CASE WHEN + CTE`: Comparação entre receita e custo, classificando a campanha como Lucrativa ou Prejuízo.
9. `CTE + Comparação`: Campanhas cujo custo de mídia realizado ficou abaixo do orçamento planejado.
10. `CTE + JOIN múltiplo + Agregação`: Funil consolidado com campanha, canal, leads, vendas convertidas e receita total.

---

### Projeto 09: Otimização Logística (`proj-logistica`)
> **Pergunta de Negócio**: *Quais rotas e transportadoras geram mais atrasos e gargalos na entrega?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE centros_distribuicao (
  id INTEGER PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL
);

CREATE TABLE transportadoras (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  modal TEXT NOT NULL,
  sla_dias_padrao INTEGER NOT NULL
);

CREATE TABLE rotas (
  id INTEGER PRIMARY KEY,
  cd_origem_id INTEGER NOT NULL REFERENCES centros_distribuicao(id),
  estado_destino TEXT NOT NULL,
  distancia_km INTEGER NOT NULL
);

CREATE TABLE envios (
  id INTEGER PRIMARY KEY,
  codigo_rastreio TEXT NOT NULL UNIQUE,
  rota_id INTEGER NOT NULL REFERENCES rotas(id),
  transportadora_id INTEGER NOT NULL REFERENCES transportadoras(id),
  data_despacho TEXT NOT NULL,
  data_estimada TEXT NOT NULL,
  data_entrega TEXT,
  status TEXT NOT NULL CHECK(status IN ('em_transito', 'entregue', 'extraviado', 'devolvido'))
);

CREATE TABLE ocorrencias_entrega (
  id INTEGER PRIMARY KEY,
  envio_id INTEGER NOT NULL REFERENCES envios(id),
  data_ocorrencia TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT
);
```

#### Missões Pedagógicas (1 a 10)
1. `WHERE + DATE`: Identificar envios entregues com atraso (`data_entrega > data_estimada`).
2. `COUNT + GROUP BY`: Volume de envios por transportadora.
3. `AVG + ROUND + julianday`: Tempo médio real de entrega (em dias) por rota, arredondado para 1 casa decimal.
4. `HAVING`: Transportadoras com mais de 1 envio entregue com atraso.
5. `JOIN múltiplo`: Detalhamento dos envios com CD de origem, destino e transportadora.
6. `CASE WHEN`: Classificação dos envios entregues como No Prazo ou Atrasado.
7. `COUNT + LEFT JOIN`: Total de ocorrências de entrega registradas por transportadora.
8. `Window DENSE_RANK`: Ranking das rotas mais demoradas em cada estado de destino, pelo tempo médio real de entrega.
9. `CTE + Agregação`: Por modal, total de envios entregues e total de entregas no prazo.
10. `CREATE VIEW + JOIN + GROUP BY`: View `vw_kpis_logistica` com transportadora, modal, total de envios entregues e total de atrasos.

---

### Projeto 10: Controle de Estoque (`proj-estoque`)
> **Pergunta de Negócio**: *Quais produtos estão parados e qual o valor imobilizado em estoque sem giro?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE armazens (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  localizacao TEXT NOT NULL
);

CREATE TABLE fornecedores (
  id INTEGER PRIMARY KEY,
  razao_social TEXT NOT NULL UNIQUE,
  lead_time_dias INTEGER NOT NULL
);

CREATE TABLE produtos (
  id INTEGER PRIMARY KEY,
  codigo_sku TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id),
  custo_unitario_centavos INTEGER NOT NULL,
  estoque_minimo INTEGER NOT NULL
);

CREATE TABLE movimentacoes (
  id INTEGER PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  armazem_id INTEGER NOT NULL REFERENCES armazens(id),
  tipo TEXT NOT NULL CHECK(tipo IN ('entrada', 'saida', 'perda', 'ajuste')),
  quantidade INTEGER NOT NULL CHECK(quantidade > 0),
  data_movimento TEXT NOT NULL
);
```

#### Missões Pedagógicas (1 a 10)
1. `SUM + CASE + GROUP BY`: Cálculo do saldo atual de estoque por produto (`entradas - saídas - perdas`).
2. `CTE + WHERE + Comparação`: Produtos cujo saldo físico atual está abaixo do `estoque_minimo`.
3. `MAX + WHERE`: Data/hora da última movimentação de saída de cada produto que já teve saídas.
4. `LEFT JOIN + IS NULL`: Produtos que receberam entradas, mas nunca registraram uma saída.
5. `SUM + CASE + Multiplicação`: Valor financeiro imobilizado por produto (`saldo * custo_unitario_centavos`).
6. `CASE WHEN + CTE`: Classificação de cada produto como Abaixo do Mínimo ou Adequado.
7. `SUM + JOIN`: Quantidade total de entradas agrupada por fornecedor.
8. `COUNT + GROUP BY`: Total de registros de movimentação por armazém.
9. `CTE + Subquery`: Produtos cujo valor imobilizado supera a média dos produtos com estoque.
10. `CTE + JOIN múltiplo`: Posição consolidada com SKU, produto, fornecedor, lead time, saldo físico e valor imobilizado.

---

### Projeto 11: Gestão Educacional (`proj-educacao`)
> **Pergunta de Negócio**: *Quais disciplinas apresentam maior taxa de reprovação e demandam intervenção pedagógica?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE cursos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  departamento TEXT NOT NULL
);

CREATE TABLE professores (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  titulacao TEXT NOT NULL
);

CREATE TABLE disciplinas (
  id INTEGER PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  curso_id INTEGER NOT NULL REFERENCES cursos(id),
  professor_id INTEGER NOT NULL REFERENCES professores(id),
  carga_horaria INTEGER NOT NULL
);

CREATE TABLE alunos (
  id INTEGER PRIMARY KEY,
  matricula TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  ano_ingresso INTEGER NOT NULL
);

CREATE TABLE turmas_matriculas (
  id INTEGER PRIMARY KEY,
  aluno_id INTEGER NOT NULL REFERENCES alunos(id),
  disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id),
  semestre TEXT NOT NULL,
  nota_final REAL,
  frequencia_percentual REAL,
  status TEXT CHECK(status IN ('aprovado', 'reprovado_nota', 'reprovado_falta', 'cursando'))
);
```

#### Missões Pedagógicas (1 a 10)
1. `AVG + GROUP BY`: Média geral de notas finais por disciplina.
2. `SUM + CASE + GROUP BY`: Total de alunos reprovados por disciplina.
3. `JOIN múltiplo + WHERE`: Alunos com nota final maior ou igual a 9,0, com disciplina e professor.
4. `HAVING`: Disciplinas cuja média geral de notas é inferior a 6,0.
5. `CASE WHEN`: Classificação individual como Excelente, Aprovado ou Insuficiente.
6. `CTE + Subquery`: Alunos cuja média de notas supera a média geral de todos os registros de notas.
7. `Window DENSE_RANK`: Ranking das notas dos alunos na disciplina `MAT101` (Cálculo I).
8. `WHERE + Filtro`: Alunos reprovados por falta ou com frequência inferior a 75%, com a respectiva disciplina.
9. `CTE + Agregação`: Total de alunos avaliados e média geral de notas por professor.
10. `CREATE VIEW + JOIN + GROUP BY`: View `vw_desempenho_pedagogico_disciplinas` com código, disciplina, professor, total de matrículas e média das notas, incluindo disciplinas sem matrícula.

---

### Projeto 12: Gestão em Saúde (`proj-saude`)
> **Pergunta de Negócio**: *Quais especialidades médicas têm maior demanda e quais unidades sofrem com tempo de espera excessivo?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE especialidades (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  duracao_media_minutos INTEGER NOT NULL
);

CREATE TABLE unidades (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  bairro TEXT NOT NULL,
  capacidade_diaria INTEGER NOT NULL
);

CREATE TABLE medicos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  crm TEXT NOT NULL UNIQUE,
  especialidade_id INTEGER NOT NULL REFERENCES especialidades(id),
  unidade_id INTEGER NOT NULL REFERENCES unidades(id)
);

CREATE TABLE pacientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  data_nascimento TEXT NOT NULL,
  convenio TEXT NOT NULL
);

CREATE TABLE agendamentos (
  id INTEGER PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
  medico_id INTEGER NOT NULL REFERENCES medicos(id),
  data_agendamento TEXT NOT NULL,
  data_consulta TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('realizada', 'cancelada_paciente', 'cancelada_medico', 'no_show')),
  tempo_espera_minutos INTEGER
);
```

#### Missões Pedagógicas (1 a 10)
1. `COUNT + GROUP BY`: Volume total de consultas agendadas por especialidade médica.
2. `AVG + ROUND + JOIN`: Tempo médio de espera na sala de atendimento por unidade de saúde, arredondado para 1 casa decimal.
3. `SUM + CASE + GROUP BY`: Contagem de faltas (`no_show`) por especialidade.
4. `COUNT + ORDER BY + LIMIT`: Top 3 médicos com maior volume de atendimentos realizados.
5. `AVG + ROUND + julianday`: Média de dias entre a data de marcação e a data efetiva da consulta por especialidade, arredondada para 1 casa decimal.
6. `CASE WHEN + strftime`: Classificação etária como Idoso (60+), Adulto ou Jovem/Criança.
7. `HAVING + AVG + ROUND`: Especialidades cujo tempo médio de espera em consultas realizadas supera 20 minutos, com a média arredondada para 1 casa decimal.
8. `Window ROW_NUMBER`: Identificar a última consulta realizada de cada paciente.
9. `COUNT + GROUP BY`: Total de consultas realizadas por convênio de saúde.
10. `CTE + Window Functions`: Painel por especialidade com agendamentos, consultas realizadas, faltas e ranking de demanda (`DENSE_RANK`).

---

### Projeto 13: Finanças e Cartões de Crédito (`proj-financeiro`)
> **Pergunta de Negócio**: *Quais clientes gastam mais no cartão e onde está concentrado o risco de inadimplência?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE tipos_conta (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  taxa_manutencao_centavos INTEGER NOT NULL
);

CREATE TABLE clientes_banco (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  tipo_conta_id INTEGER NOT NULL REFERENCES tipos_conta(id),
  score_credito INTEGER NOT NULL,
  renda_mensal_centavos INTEGER NOT NULL
);

CREATE TABLE cartoes (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes_banco(id),
  numero_mascarado TEXT NOT NULL UNIQUE,
  limite_centavos INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ativo', 'bloqueado', 'cancelado'))
);

CREATE TABLE categorias_gastos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  essencial INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE faturas_transacoes (
  id INTEGER PRIMARY KEY,
  cartao_id INTEGER NOT NULL REFERENCES cartoes(id),
  categoria_id INTEGER NOT NULL REFERENCES categorias_gastos(id),
  data_transacao TEXT NOT NULL,
  valor_centavos INTEGER NOT NULL,
  status_pagamento TEXT NOT NULL CHECK(status_pagamento IN ('pago', 'pendente', 'inadimplente'))
);
```

#### Missões Pedagógicas (1 a 10)
1. `SUM + GROUP BY`: Faturamento por categoria de gasto.
2. `SUM + JOIN`: Volume total de compras por cliente.
3. `WHERE + SUM + COUNT`: Quantidade e valor das transações inadimplentes.
4. `HAVING`: Clientes com mais de R$ 10.000,00 em compras.
5. `CASE WHEN`: Classificação de risco por score de crédito.
6. `ORDER BY + LIMIT`: Top 3 transações de maior valor.
7. `strftime + SUM`: Faturamento mensal dos cartões.
8. `CTE + JOIN + Comparação`: Clientes que consumiram mais de 50% do limite.
9. `Window SUM OVER`: Total acumulado das compras do cliente Maurício Dias Silveira.
10. `CREATE VIEW + JOIN + GROUP BY`: View `vw_perfil_financeiro_clientes` com cadastro, limite, score e gastos.

---

### Projeto 14: Atendimento e Suporte (`proj-suporte`)
> **Pergunta de Negócio**: *Qual o tempo médio de resolução e como estão o SLA e a satisfação (CSAT)?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE departamentos_suporte (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  sla_horas INTEGER NOT NULL
);

CREATE TABLE atendentes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  departamento_id INTEGER NOT NULL REFERENCES departamentos_suporte(id),
  nivel TEXT NOT NULL CHECK(nivel IN ('N1', 'N2', 'N3', 'Especialista'))
);

CREATE TABLE tickets (
  id INTEGER PRIMARY KEY,
  protocolo TEXT NOT NULL UNIQUE,
  cliente_id INTEGER NOT NULL,
  atendente_id INTEGER NOT NULL REFERENCES atendentes(id),
  prioridade TEXT NOT NULL CHECK(prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  data_abertura TEXT NOT NULL,
  data_fechamento TEXT,
  status TEXT NOT NULL CHECK(status IN ('aberto', 'em_andamento', 'resolvido', 'cancelado')),
  tempo_resolucao_horas INTEGER
);

CREATE TABLE avaliacoes_csat (
  id INTEGER PRIMARY KEY,
  ticket_id INTEGER NOT NULL UNIQUE REFERENCES tickets(id),
  nota_csat INTEGER NOT NULL CHECK(nota_csat BETWEEN 1 AND 5),
  comentario TEXT
);
```

#### Missões Pedagógicas (1 a 10)
1. `AVG + ROUND + GROUP BY`: Tempo médio de resolução por departamento, arredondado para 2 casas decimais.
2. `AVG + ROUND + JOIN`: Nota média de CSAT por atendente.
3. `WHERE + Comparação + JOIN`: Tickets que ultrapassaram o SLA do departamento.
4. `HAVING`: Atendentes com mais de três tickets resolvidos.
5. `CASE WHEN`: Classificação das avaliações em Promotor, Neutro ou Detrator.
6. `AVG + ORDER BY + LIMIT`: Top 2 atendentes por CSAT com amostra mínima.
7. `COUNT + GROUP BY`: Volume de chamados por prioridade.
8. `Window DENSE_RANK`: Ranking de rapidez dos atendentes N1.
9. `CTE + Agregação`: Conformidade de SLA por atendente.
10. `CTE + JOIN + COALESCE + ROUND`: Painel executivo de resolução e CSAT.

---

### Projeto 15: GovTech e Transparência (`proj-publico`)
> **Pergunta de Negócio**: *Quais municípios têm maior gasto público per capita e melhor execução orçamentária?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE estados (
  id INTEGER PRIMARY KEY,
  sigla TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  regiao TEXT NOT NULL
);

CREATE TABLE municipios (
  id INTEGER PRIMARY KEY,
  codigo_ibge TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  estado_id INTEGER NOT NULL REFERENCES estados(id),
  populacao INTEGER NOT NULL,
  pib_milhares_reais INTEGER NOT NULL
);

CREATE TABLE areas_governo (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE despesas_publicas (
  id INTEGER PRIMARY KEY,
  municipio_id INTEGER NOT NULL REFERENCES municipios(id),
  area_id INTEGER NOT NULL REFERENCES areas_governo(id),
  ano INTEGER NOT NULL,
  valor_empenhado_centavos INTEGER NOT NULL,
  valor_liquidado_centavos INTEGER NOT NULL
);
```

#### Missões Pedagógicas (1 a 10)
1. `SUM + GROUP BY`: Execução orçamentária por área de governo.
2. `SUM + JOIN`: Gasto público total por município.
3. `SUM + Divisão + CAST`: Investimento público liquidado per capita.
4. `WHERE + JOIN`: Recursos liquidados em Saúde Pública.
5. `HAVING`: Municípios acima de R$ 10 bilhões liquidados.
6. `CASE WHEN`: Classificação de porte populacional.
7. `Window DENSE_RANK`: Ranking de municípios por PIB.
8. `CTE + Subquery`: Gasto per capita em educação acima da média.
9. `CTE + Agregação`: Eficiência de liquidação orçamentária por estado.
10. `CREATE VIEW + JOIN + GROUP BY`: View fiscal `vw_analise_fiscal_municipios`.

---

### Projeto 16: Analytics no Futebol (`proj-futebol`)
> **Pergunta de Negócio**: *Quais atletas mais participam de gols e apresentam maior precisão nas finalizações?*

#### Modelo de Dados (DDL)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE clubes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  sigla TEXT NOT NULL UNIQUE,
  estado TEXT NOT NULL
);

CREATE TABLE jogadores (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  clube_id INTEGER NOT NULL REFERENCES clubes(id),
  posicao TEXT NOT NULL CHECK(posicao IN ('Goleiro', 'Zagueiro', 'Lateral', 'Meio-Campo', 'Atacante')),
  numero_camisa INTEGER NOT NULL
);

CREATE TABLE partidas (
  id INTEGER PRIMARY KEY,
  rodada INTEGER NOT NULL,
  clube_mandante_id INTEGER NOT NULL REFERENCES clubes(id),
  clube_visitante_id INTEGER NOT NULL REFERENCES clubes(id),
  gols_mandante INTEGER NOT NULL,
  gols_visitante INTEGER NOT NULL,
  data_partida TEXT NOT NULL
);

CREATE TABLE estatisticas_partida (
  id INTEGER PRIMARY KEY,
  partida_id INTEGER NOT NULL REFERENCES partidas(id),
  jogador_id INTEGER NOT NULL REFERENCES jogadores(id),
  minutos_jogados INTEGER NOT NULL,
  finalizacoes_total INTEGER NOT NULL DEFAULT 0,
  finalizacoes_no_gol INTEGER NOT NULL DEFAULT 0,
  gols INTEGER NOT NULL DEFAULT 0,
  assistencias INTEGER NOT NULL DEFAULT 0,
  passes_certos INTEGER NOT NULL DEFAULT 0
);
```

#### Missões Pedagógicas (1 a 10)
1. `SUM + GROUP BY`: Artilharia do campeonato.
2. `SUM + JOIN`: Líderes em assistências.
3. `SUM + Divisão + ROUND`: Pontaria percentual nas finalizações.
4. `HAVING`: Jogadores com alto volume de finalizações.
5. `CASE WHEN + CTE`: Classificação de papel ofensivo.
6. `ORDER BY + LIMIT`: Top 3 em passes certos.
7. `JOIN múltiplo`: Resultados detalhados dos confrontos.
8. `Window DENSE_RANK`: Ranking oficial de artilharia.
9. `CTE + Subquery`: Passadores com volume acima da média.
10. `CTE + Window Functions + JOIN`: Scout consolidado e ranking de participações em gols.

---

## 4. Estrutura de Arquivos no Repositório

```
src/
  cases/
    case001/ ... case004/      # Casos Investigativos (História Policial + Grafo)
    proj-ecommerce/            # Projeto 05 — E-Commerce
      db-seed.js
      levels.js
    proj-clientes/             # Projeto 06 — Clientes & LTV
      db-seed.js
      levels.js
    proj-vendas/               # Projeto 07 — Desempenho de Vendas
      db-seed.js
      levels.js
    proj-marketing/            # Projeto 08 — Métricas de Marketing
      db-seed.js
      levels.js
    proj-logistica/            # Projeto 09 — Otimização Logística
      db-seed.js
      levels.js
    proj-estoque/              # Projeto 10 — Controle de Estoque
      db-seed.js
      levels.js
    proj-educacao/             # Projeto 11 — Gestão Educacional
      db-seed.js
      levels.js
    proj-saude/                # Projeto 12 — Gestão em Saúde
      db-seed.js
      levels.js
    proj-financeiro/           # Projeto 13 — Banking & Crédito
      db-seed.js
      levels.js
    proj-suporte/              # Projeto 14 — Suporte & SLA
      db-seed.js
      levels.js
    proj-publico/              # Projeto 15 — GovTech & Transparência
      db-seed.js
      levels.js
    proj-futebol/              # Projeto 16 — Analytics no Futebol
      db-seed.js
      levels.js
  case-manager.js              # Registry com Casos + Projetos (unlocked independentes)
  db.js                        # Carregamento dos 16 schemas e seeds
  ui.js                        # Renderização categorizada (Investigações vs Projetos)
```

---

## 5. Roteiro de Implementação por Lotes

- **Lote 0**: Infraestrutura base (`case-manager.js`, `db.js`, `ui.js`, tela de seleção bipartida).
- **Lote 1**: Projetos 05 a 08 (E-Commerce, Clientes, Vendas, Marketing) — 40 missões.
- **Lote 2**: Projetos 09 a 12 (Logística, Estoque, Educação, Saúde) — 40 missões.
- **Lote 3**: Projetos 13 a 16 (Banking & Crédito, Suporte, GovTech, Futebol) — 40 missões.
- **Validação**: Testes automatizados em `test/test_cases.js` executam as 120 consultas de referência dos projetos, além das missões dos quatro casos investigativos. A suíte também verifica invariantes estruturais e regressões semânticas independentes; isso não equivale a afirmar cobertura de código de 100%.
