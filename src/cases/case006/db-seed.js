/**
 * Caso 006 — "TechBrasil: Sua Primeira Semana como Analista de Dados"
 * Schema: modelo OLTP normalizado (do Caso 005) + staging sujo + tabelas DW
 */

export const SCHEMA_SQL = `
PRAGMA foreign_keys = OFF;

-- ═══ MODELO OLTP (normalizado — resultado do Caso 005) ═══
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf TEXT,
  endereco TEXT,
  telefone TEXT
);

CREATE TABLE produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  categoria TEXT,
  preco REAL
);

CREATE TABLE vendedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  regiao_id INTEGER
);

CREATE TABLE regioes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  gerente TEXT
);

CREATE TABLE vendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER,
  vendedor_id INTEGER,
  data_venda TEXT NOT NULL,
  valor_total REAL
);

CREATE TABLE itens_venda (
  venda_id INTEGER,
  produto_id INTEGER,
  quantidade INTEGER NOT NULL,
  preco_unitario REAL NOT NULL,
  PRIMARY KEY (venda_id, produto_id)
);

-- ═══ STAGING (dados sujos vindos do CSV) ═══
CREATE TABLE stg_clientes (
  id INTEGER,
  nome TEXT,
  cpf TEXT,
  endereco TEXT,
  telefone TEXT
);

CREATE TABLE stg_vendas (
  id INTEGER,
  cliente_nome TEXT,
  produto_nome TEXT,
  vendedor_nome TEXT,
  data_venda TEXT,
  quantidade TEXT,
  preco_venda TEXT
);

-- ═══ DATA WAREHOUSE (tabelas destino) ═══
CREATE TABLE dim_tempo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_completa TEXT NOT NULL,
  ano INTEGER,
  mes INTEGER,
  dia INTEGER
);

CREATE TABLE dim_clientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT,
  cidade TEXT
);

CREATE TABLE dim_produtos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT
);

CREATE TABLE dim_vendedores (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL
);

CREATE TABLE dim_regioes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  gerente TEXT
);

CREATE TABLE fct_vendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tempo_id INTEGER,
  cliente_id INTEGER,
  produto_id INTEGER,
  vendedor_id INTEGER,
  regiao_id INTEGER,
  quantidade INTEGER NOT NULL,
  valor_unitario REAL NOT NULL,
  valor_total REAL NOT NULL
);

-- ═══ AUDITORIA ═══
CREATE TABLE log_auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tabela_afetada TEXT NOT NULL,
  operacao TEXT NOT NULL,
  registro_id INTEGER,
  valor_antigo TEXT,
  valor_novo TEXT,
  data_hora TEXT DEFAULT (datetime('now'))
);
`;

export const SEED_SQL = `
-- ═══ OLTP: Regiões ═══
INSERT INTO regioes VALUES (1, 'Sudeste', 'Carlos Mendes');
INSERT INTO regioes VALUES (2, 'Sul', 'Patricia Lima');
INSERT INTO regioes VALUES (3, 'Nordeste', 'Fernanda Alves');

-- ═══ OLTP: Clientes ═══
INSERT INTO clientes VALUES (1, 'José da Silva', '111.111.111-01', 'Rua A, 100', '11-9999-0001');
INSERT INTO clientes VALUES (2, 'Ana Pereira', '222.222.222-02', 'Av. Brasil, 500', '21-8888-0002');
INSERT INTO clientes VALUES (3, 'Carlos Oliveira', '333.333.333-03', 'Rua C, 50', '31-7777-0003');
INSERT INTO clientes VALUES (4, 'Beatriz Lima', '444.444.444-04', 'Rua D, 200', '41-6666-0004');
INSERT INTO clientes VALUES (5, 'Eduardo Rocha', '555.555.555-05', 'Av. Paulista, 1000', '11-5555-0005');
INSERT INTO clientes VALUES (6, 'Fernanda Costa', '666.666.666-06', 'Rua E, 75', '51-4444-0006');
INSERT INTO clientes VALUES (7, 'Gabriel Souza', '777.777.777-07', 'Rua F, 300', '61-3333-0007');
INSERT INTO clientes VALUES (8, 'Helena Martins', '888.888.888-08', 'Av. Goiás, 150', '71-2222-0008');
INSERT INTO clientes VALUES (9, 'Igor Almeida', '999.999.999-09', 'Rua G, 400', '81-1111-0009');

-- ═══ OLTP: Produtos ═══
INSERT INTO produtos VALUES (1, 'Notebook X', 'Informática', 3500.00);
INSERT INTO produtos VALUES (2, 'Mouse Y', 'Periféricos', 120.50);
INSERT INTO produtos VALUES (3, 'Teclado Z', 'Periféricos', 200.00);
INSERT INTO produtos VALUES (4, 'Monitor W', 'Informática', 890.00);
INSERT INTO produtos VALUES (5, 'Webcam V', 'Periféricos', 150.00);
INSERT INTO produtos VALUES (6, 'Impressora P', 'Informática', 650.00);

-- ═══ OLTP: Vendedores ═══
INSERT INTO vendedores VALUES (1, 'Maria Souza', 1);
INSERT INTO vendedores VALUES (2, 'João Santos', 2);
INSERT INTO vendedores VALUES (3, 'Pedro Costa', 3);

-- ═══ OLTP: Vendas ═══
INSERT INTO vendas VALUES (1, 1, 1, '2024-01-05', 7000.00);
INSERT INTO vendas VALUES (2, 1, 1, '2024-01-08', 602.50);
INSERT INTO vendas VALUES (3, 1, 1, '2024-01-10', 600.00);
INSERT INTO vendas VALUES (4, 1, 1, '2024-01-12', 890.00);
INSERT INTO vendas VALUES (5, 2, 2, '2024-01-15', 3500.00);
INSERT INTO vendas VALUES (6, 2, 2, '2024-01-18', 300.00);
INSERT INTO vendas VALUES (7, 3, 3, '2024-01-20', 650.00);
INSERT INTO vendas VALUES (8, 3, 3, '2024-01-22', 1205.00);
INSERT INTO vendas VALUES (9, 4, 1, '2024-01-25', 200.00);
INSERT INTO vendas VALUES (10, 4, 1, '2024-01-28', 1780.00);
INSERT INTO vendas VALUES (11, 5, 2, '2024-02-01', 10500.00);
INSERT INTO vendas VALUES (12, 5, 2, '2024-02-03', 150.00);
INSERT INTO vendas VALUES (13, 6, 3, '2024-02-05', 1300.00);
INSERT INTO vendas VALUES (14, 6, 3, '2024-02-08', 361.50);
INSERT INTO vendas VALUES (15, 7, 1, '2024-02-10', 3500.00);
INSERT INTO vendas VALUES (16, 7, 1, '2024-02-12', 800.00);
INSERT INTO vendas VALUES (17, 8, 2, '2024-02-15', 890.00);
INSERT INTO vendas VALUES (18, 8, 2, '2024-02-18', 450.00);
INSERT INTO vendas VALUES (19, 9, 3, '2024-02-20', 650.00);
INSERT INTO vendas VALUES (20, 9, 3, '2024-02-22', 7000.00);

-- ═══ OLTP: Itens da Venda ═══
INSERT INTO itens_venda VALUES (1, 1, 2, 3500.00);
INSERT INTO itens_venda VALUES (2, 2, 5, 120.50);
INSERT INTO itens_venda VALUES (3, 3, 3, 200.00);
INSERT INTO itens_venda VALUES (4, 4, 1, 890.00);
INSERT INTO itens_venda VALUES (5, 1, 1, 3500.00);
INSERT INTO itens_venda VALUES (6, 5, 2, 150.00);
INSERT INTO itens_venda VALUES (7, 6, 1, 650.00);
INSERT INTO itens_venda VALUES (8, 2, 10, 120.50);
INSERT INTO itens_venda VALUES (9, 3, 1, 200.00);
INSERT INTO itens_venda VALUES (10, 4, 2, 890.00);
INSERT INTO itens_venda VALUES (11, 1, 3, 3500.00);
INSERT INTO itens_venda VALUES (12, 5, 1, 150.00);
INSERT INTO itens_venda VALUES (13, 6, 2, 650.00);
INSERT INTO itens_venda VALUES (14, 2, 3, 120.50);
INSERT INTO itens_venda VALUES (15, 1, 1, 3500.00);
INSERT INTO itens_venda VALUES (16, 3, 4, 200.00);
INSERT INTO itens_venda VALUES (17, 4, 1, 890.00);
INSERT INTO itens_venda VALUES (18, 5, 3, 150.00);
INSERT INTO itens_venda VALUES (19, 6, 1, 650.00);
INSERT INTO itens_venda VALUES (20, 1, 2, 3500.00);

-- ═══ STAGING: Dados sujos (simulando CSV importado) ═══
INSERT INTO stg_clientes VALUES (1, ' José da Silva ', '111.111.111-01', 'Rua A, 100', '11-9999-0001');
INSERT INTO stg_clientes VALUES (2, 'ana pereira', '222.222.222-02', 'Av. Brasil, 500', NULL);
INSERT INTO stg_clientes VALUES (3, 'CARLOS OLIVEIRA', '333.333.333-03', 'Rua C, 50', '31-7777-0003');
INSERT INTO stg_clientes VALUES (4, 'beatriz lima', '444.444.444-04', 'Rua D, 200', '41-6666-0004');
INSERT INTO stg_clientes VALUES (5, ' Eduardo Rocha', '555.555.555-05', 'Av. Paulista, 1000', '11-5555-0005');

INSERT INTO stg_vendas VALUES (1, 'José da Silva', 'Notebook X', 'Maria Souza', '05/01/2024', '2', '3.500,00');
INSERT INTO stg_vendas VALUES (2, 'ana pereira', 'Mouse Y', 'João Santos', '15/01/2024', '1', '120,50');
INSERT INTO stg_vendas VALUES (3, ' CARLOS OLIVEIRA', 'Impressora P', 'Pedro Costa', '20/01/2024', '1', '650,00');
INSERT INTO stg_vendas VALUES (4, 'jose da silva', 'Teclado Z', 'Maria Souza', '10/01/2024', '3', '200,00');
INSERT INTO stg_vendas VALUES (5, 'Eduardo Rocha', 'Notebook X', 'João Santos', '01/02/2024', '3', '3.500,00');
`;

-- ═══ DW: Dimensões pré-populadas (o jogador vai atualizar/transformar) ═══
INSERT INTO dim_vendedores VALUES (1, 'Maria Souza');
INSERT INTO dim_vendedores VALUES (2, 'R. Souza');
INSERT INTO dim_vendedores VALUES (3, 'Pedro Costa');

INSERT INTO dim_regioes VALUES (1, 'Sudeste', 'Carlos Mendes');
INSERT INTO dim_regioes VALUES (2, 'Sul', 'Patricia Lima');
INSERT INTO dim_regioes VALUES (3, 'Nordeste', 'Fernanda Alves');

INSERT INTO dim_produtos VALUES (1, 'Notebook X', 'Informática');
INSERT INTO dim_produtos VALUES (2, 'Mouse Y', 'Periféricos');
INSERT INTO dim_produtos VALUES (3, 'Teclado Z', 'Periféricos');
INSERT INTO dim_produtos VALUES (4, 'Monitor W', 'Informática');
INSERT INTO dim_produtos VALUES (5, 'Webcam V', 'Periféricos');
INSERT INTO dim_produtos VALUES (6, 'Impressora P', 'Informática');

-- ═══ DW: dim_tempo pré-populada com datas únicas das vendas ═══
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-01-05', 2024, 1, 5);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-01-08', 2024, 1, 8);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-01-10', 2024, 1, 10);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-01-12', 2024, 1, 12);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-01-15', 2024, 1, 15);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-01-18', 2024, 1, 18);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-01-20', 2024, 1, 20);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-01-22', 2024, 1, 22);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-01-25', 2024, 1, 25);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-01-28', 2024, 1, 28);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-02-01', 2024, 2, 1);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-02-03', 2024, 2, 3);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-02-05', 2024, 2, 5);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-02-08', 2024, 2, 8);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-02-10', 2024, 2, 10);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-02-12', 2024, 2, 12);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-02-15', 2024, 2, 15);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-02-18', 2024, 2, 18);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-02-20', 2024, 2, 20);
INSERT INTO dim_tempo (data_completa, ano, mes, dia) VALUES ('2024-02-22', 2024, 2, 22);
