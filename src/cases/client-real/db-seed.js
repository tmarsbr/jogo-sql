/**
 * db-seed.js — Schema DDL e Seed SQL do modo "Cliente Real".
 *
 * Banco: "Aurora Varejo" — rede de lojas com 3 regiões, vendedores,
 * vendas diárias e metas mensais. Mesma estrutura conceitual do
 * Projeto de Desempenho de Vendas, com dados próprios determinísticos.
 *
 * Fatos-chave embutidos nos dados (usados nas respostas das consultorias):
 * - Faturamento mensal: jan R$ 23.450,00 → fev R$ 23.450,00 → mar R$ 30.700,00
 *   (+30,98% de janeiro a março).
 * - Melhor vendedor: Lucas Prado (Sudeste), R$ 32.750,00 no trimestre.
 * - Menor faturamento: Fernanda Costa (Norte), R$ 4.300,00; em março ela
 *   realizou R$ 1.700,00 contra meta de R$ 3.000,00.
 * - Desconto médio: Norte 7,00%, Sul 4,56% e Sudeste 2,82%.
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
  valor_centavos INTEGER NOT NULL CHECK(valor_centavos > 0),
  data_venda TEXT NOT NULL,
  desconto_percentual REAL DEFAULT 0 CHECK(desconto_percentual >= 0 AND desconto_percentual <= 100)
);
CREATE TABLE metas_mensais (
  id INTEGER PRIMARY KEY,
  vendedor_id INTEGER NOT NULL REFERENCES vendedores(id),
  ano_mes TEXT NOT NULL,
  meta_centavos INTEGER NOT NULL CHECK(meta_centavos > 0),
  UNIQUE(vendedor_id, ano_mes)
);
`;

export const SEED_SQL = `
-- Regiões (1-3)
INSERT INTO regioes VALUES
  (1, 'Sudeste', 'Marina Duarte'),
  (2, 'Sul',     'Roberto Alves'),
  (3, 'Norte',   'Juliana Pires');

-- Vendedores (1-6)
INSERT INTO vendedores VALUES
  (1, 'Lucas Prado',      1, '2021-02-10'),
  (2, 'Ana Vieira',       1, '2022-05-03'),
  (3, 'Pedro Ibarra',     2, '2020-08-17'),
  (4, 'Camila Rocha',     2, '2023-01-09'),
  (5, 'Fernanda Costa',   3, '2023-06-21'),
  (6, 'Diego Martins',    3, '2021-11-30');

-- Metas mensais (6 vendedores x 3 meses = 18 linhas)
INSERT INTO metas_mensais VALUES
  ( 1, 1, '2024-01', 700000), ( 2, 1, '2024-02', 700000), ( 3, 1, '2024-03', 700000),
  ( 4, 2, '2024-01', 500000), ( 5, 2, '2024-02', 500000), ( 6, 2, '2024-03', 500000),
  ( 7, 3, '2024-01', 600000), ( 8, 3, '2024-02', 600000), ( 9, 3, '2024-03', 600000),
  (10, 4, '2024-01', 400000), (11, 4, '2024-02', 400000), (12, 4, '2024-03', 400000),
  (13, 5, '2024-01', 300000), (14, 5, '2024-02', 300000), (15, 5, '2024-03', 300000),
  (16, 6, '2024-01', 450000), (17, 6, '2024-02', 450000), (18, 6, '2024-03', 450000);

-- Vendas (determinísticas, valores em centavos)
-- Janeiro (mês 01): total 925.000 centavos
INSERT INTO vendas VALUES
  ( 1, 1, 420000, '2024-01-05', 2.0),
  ( 2, 1, 380000, '2024-01-18', 5.0),
  ( 3, 2, 210000, '2024-01-12', 3.0),
  ( 4, 3, 330000, '2024-01-09', 4.0),
  ( 5, 3, 250000, '2024-01-22', 2.0),
  ( 6, 4, 180000, '2024-01-15', 6.0),
  ( 7, 5, 120000, '2024-01-20', 8.0),
  ( 8, 6, 210000, '2024-01-25', 5.0),
  ( 9, 1, 245000, '2024-01-27', 1.0);

-- Fevereiro (mês 02): total 1.045.000 centavos
INSERT INTO vendas VALUES
  (10, 1, 510000, '2024-02-03', 3.0),
  (11, 2, 230000, '2024-02-10', 2.0),
  (12, 3, 290000, '2024-02-06', 5.0),
  (13, 3, 340000, '2024-02-19', 3.0),
  (14, 4, 195000, '2024-02-14', 7.0),
  (15, 5, 140000, '2024-02-17', 9.0),
  (16, 6, 250000, '2024-02-23', 4.0),
  (17, 1, 390000, '2024-02-26', 2.0);

-- Março (mês 03): total 1.295.000 centavos
INSERT INTO vendas VALUES
  (18, 1, 600000, '2024-03-04', 4.0),
  (19, 1, 380000, '2024-03-15', 2.0),
  (20, 2, 260000, '2024-03-08', 4.0),
  (21, 3, 370000, '2024-03-02', 3.0),
  (22, 3, 420000, '2024-03-20', 5.0),
  (23, 4, 240000, '2024-03-11', 6.0),
  (24, 5, 170000, '2024-03-13', 10.0),
  (25, 6, 280000, '2024-03-18', 6.0),
  (26, 1, 350000, '2024-03-28', 3.0);
`;
