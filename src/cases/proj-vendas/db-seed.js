/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 07: Desempenho de Vendas
 */

export const SCHEMA_SQL = `
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
`;

export const SEED_SQL = `
-- Regiões
INSERT INTO regioes (id, nome, gerente_regional) VALUES
  (1, 'Sudeste', 'Marcos Valério'),
  (2, 'Sul', 'Patrícia Albuquerque'),
  (3, 'Nordeste', 'Roberto Cavalcanti'),
  (4, 'Centro-Oeste', 'Luciana Meireles');

-- Vendedores
INSERT INTO vendedores (id, nome, regiao_id, data_admissao) VALUES
  (1, 'Lucas Prado', 1, '2023-01-15'),
  (2, 'Juliana Mendes', 1, '2023-02-01'),
  (3, 'Rodrigo Tavares', 2, '2023-03-10'),
  (4, 'Camila Silveira', 2, '2023-04-05'),
  (5, 'Thiago Barreto', 3, '2023-05-12'),
  (6, 'Vanessa Ribeiro', 4, '2023-06-20');

-- Metas Mensais (2024-01 a 2024-03)
INSERT INTO metas_mensais (id, vendedor_id, ano_mes, meta_centavos) VALUES
  (1, 1, '2024-01', 5000000),
  (2, 1, '2024-02', 5500000),
  (3, 1, '2024-03', 6000000),
  (4, 2, '2024-01', 4500000),
  (5, 2, '2024-02', 5000000),
  (6, 2, '2024-03', 5500000),
  (7, 3, '2024-01', 4000000),
  (8, 3, '2024-02', 4200000),
  (9, 3, '2024-03', 4500000),
  (10, 4, '2024-01', 3500000),
  (11, 4, '2024-02', 3800000),
  (12, 4, '2024-03', 4000000),
  (13, 5, '2024-01', 3000000),
  (14, 5, '2024-02', 3200000),
  (15, 5, '2024-03', 3500000),
  (16, 6, '2024-01', 3000000),
  (17, 6, '2024-02', 3200000),
  (18, 6, '2024-03', 4000000);

-- Vendas Realizadas
INSERT INTO vendas (id, vendedor_id, valor_centavos, data_venda, desconto_percentual) VALUES
  -- Janeiro 2024
  (1, 1, 2800000, '2024-01-05 10:00:00', 0.05),
  (2, 1, 2700000, '2024-01-20 15:30:00', 0.00),
  (3, 2, 2100000, '2024-01-10 11:15:00', 0.02),
  (4, 2, 2600000, '2024-01-25 16:45:00', 0.00),
  (5, 3, 4200000, '2024-01-18 14:20:00', 0.05),
  (6, 4, 3900000, '2024-01-22 09:30:00', 0.00),
  (7, 5, 2900000, '2024-01-15 13:40:00', 0.03),
  (8, 6, 3100000, '2024-01-28 17:10:00', 0.00),
  -- Fevereiro 2024
  (9, 1, 3100000, '2024-02-08 10:20:00', 0.00),
  (10, 1, 2900000, '2024-02-22 16:00:00', 0.04),
  (11, 2, 2800000, '2024-02-14 11:50:00', 0.00),
  (12, 2, 2400000, '2024-02-27 15:10:00', 0.02),
  (13, 3, 4500000, '2024-02-12 14:00:00', 0.00),
  (14, 4, 4100000, '2024-02-20 10:15:00', 0.05),
  (15, 5, 3400000, '2024-02-18 16:30:00', 0.00),
  (16, 6, 2800000, '2024-02-25 12:00:00', 0.02),
  -- Março 2024
  (17, 1, 3400000, '2024-03-05 09:30:00', 0.00),
  (18, 1, 3200000, '2024-03-25 17:45:00', 0.05),
  (19, 2, 3000000, '2024-03-12 10:00:00', 0.00),
  (20, 2, 2900000, '2024-03-28 14:15:00', 0.03),
  (21, 3, 4900000, '2024-03-15 11:30:00', 0.00),
  (22, 4, 4300000, '2024-03-22 15:40:00', 0.00),
  (23, 5, 3800000, '2024-03-10 13:10:00', 0.00),
  (24, 6, 3600000, '2024-03-27 16:20:00', 0.02);
`;
