/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 10: Controle de Estoque
 */

export const SCHEMA_SQL = `
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
`;

export const SEED_SQL = `
-- Armazéns
INSERT INTO armazens (id, nome, localizacao) VALUES
  (1, 'Armazém Central SP', 'São Paulo - SP'),
  (2, 'Galpão Logístico Sul', 'Curitiba - PR'),
  (3, 'Hub de Distribuição Nordeste', 'Recife - PE');

-- Fornecedores
INSERT INTO fornecedores (id, razao_social, lead_time_dias) VALUES
  (1, 'TechComponents Brasil Ltda', 15),
  (2, 'Móveis Corporativos do Brasil', 25),
  (3, 'Global Importadora de Periféricos', 40),
  (4, 'Papelaria & Embalagens Industriais', 7);

-- Produtos
INSERT INTO produtos (id, codigo_sku, nome, fornecedor_id, custo_unitario_centavos, estoque_minimo) VALUES
  (1, 'SKU-001', 'Placa Mãe Industrial ATX', 1, 45000, 20),
  (2, 'SKU-002', 'Processador Octa-Core 3.8GHz', 1, 85000, 15),
  (3, 'SKU-003', 'Memória RAM 16GB DDR4', 1, 18000, 40),
  (4, 'SKU-004', 'Cadeira Presidente Couro', 2, 65000, 10),
  (5, 'SKU-005', 'Mesa Executiva L', 2, 80000, 8),
  (6, 'SKU-006', 'Cabo HDMI Blindado 3m', 3, 1200, 100),
  (7, 'SKU-007', 'Adaptador USB-C Gigabit', 3, 3500, 50),
  (8, 'SKU-008', 'Caixa Papelão Reforçada G', 4, 450, 200),
  (9, 'SKU-009', 'Fita Adesiva Industrial 50m', 4, 300, 150),
  (10, 'SKU-010', 'Monitor Curvo 34 Polegadas', 1, 190000, 5);

-- Movimentações de Estoque
INSERT INTO movimentacoes (id, produto_id, armazem_id, tipo, quantidade, data_movimento) VALUES
  -- Entradas Iniciais
  (1, 1, 1, 'entrada', 50, '2024-01-05 08:00:00'),
  (2, 2, 1, 'entrada', 40, '2024-01-05 08:30:00'),
  (3, 3, 1, 'entrada', 100, '2024-01-05 09:00:00'),
  (4, 4, 1, 'entrada', 25, '2024-01-06 10:00:00'),
  (5, 5, 1, 'entrada', 15, '2024-01-06 10:30:00'),
  (6, 6, 2, 'entrada', 300, '2024-01-10 11:00:00'),
  (7, 7, 2, 'entrada', 150, '2024-01-10 11:30:00'),
  (8, 8, 3, 'entrada', 500, '2024-01-12 14:00:00'),
  (9, 9, 3, 'entrada', 400, '2024-01-12 14:30:00'),
  (10, 10, 1, 'entrada', 10, '2024-01-15 15:00:00'),
  -- Saídas em Janeiro
  (11, 1, 1, 'saida', 20, '2024-01-20 16:00:00'),
  (12, 2, 1, 'saida', 30, '2024-01-22 17:00:00'),
  (13, 3, 1, 'saida', 70, '2024-01-25 10:00:00'),
  (14, 6, 2, 'saida', 180, '2024-01-28 11:00:00'),
  (15, 8, 3, 'saida', 250, '2024-01-30 15:00:00'),
  -- Movimentações em Fevereiro
  (16, 2, 1, 'saida', 5, '2024-02-05 10:00:00'), -- estoque fica em 5 (abaixo de 15)
  (17, 3, 1, 'entrada', 50, '2024-02-10 09:00:00'),
  (18, 4, 1, 'saida', 5, '2024-02-15 14:00:00'),
  (19, 7, 2, 'saida', 30, '2024-02-20 16:00:00'),
  (20, 8, 3, 'perda', 10, '2024-02-25 11:00:00'),
  -- Movimentações em Março
  (21, 1, 1, 'saida', 15, '2024-03-05 13:00:00'), -- estoque fica em 15 (abaixo de 20)
  (22, 6, 2, 'saida', 50, '2024-03-12 10:30:00'),
  (23, 9, 3, 'saida', 120, '2024-03-18 15:30:00'),
  (24, 10, 1, 'saida', 2, '2024-03-22 16:00:00');
  -- Nota: SKU-005 (Mesa Executiva L) não teve nenhuma saída após a entrada (estoque parado).
`;
