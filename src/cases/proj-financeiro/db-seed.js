/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 13: Finanças e Cartões de Crédito
 */

export const SCHEMA_SQL = `
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
`;

export const SEED_SQL = `
-- Tipos de Conta
INSERT INTO tipos_conta (id, nome, taxa_manutencao_centavos) VALUES
  (1, 'Conta Corrente Digital', 0),
  (2, 'Conta Premium Black', 4990),
  (3, 'Conta Universitária', 0),
  (4, 'Conta Corporate PJ', 8900);

-- Clientes do Banco
INSERT INTO clientes_banco (id, nome, cpf, tipo_conta_id, score_credito, renda_mensal_centavos) VALUES
  (1, 'Maurício Dias Silveira', '111.222.333-44', 2, 820, 2500000),
  (2, 'Letícia Antunes Rocha', '222.333.444-55', 1, 680, 750000),
  (3, 'Gustavo Henrique Prado', '333.444.555-66', 2, 910, 3800000),
  (4, 'Camila Barbosa Vaz', '444.555.666-77', 3, 590, 220000),
  (5, 'Thiago Fernandes Costa', '555.666.777-88', 1, 450, 480000),
  (6, 'Patrícia Nogueira Ramos', '666.777.888-99', 4, 760, 15000000);

-- Cartões de Crédito
INSERT INTO cartoes (id, cliente_id, numero_mascarado, limite_centavos, status) VALUES
  (1, 1, '**** **** **** 1024', 2000000, 'ativo'),
  (2, 2, '**** **** **** 3345', 800000, 'ativo'),
  (3, 3, '**** **** **** 7789', 5000000, 'ativo'),
  (4, 4, '**** **** **** 9912', 200000, 'ativo'),
  (5, 5, '**** **** **** 4456', 300000, 'bloqueado'),
  (6, 6, '**** **** **** 8821', 10000000, 'ativo');

-- Categorias de Gastos
INSERT INTO categorias_gastos (id, nome, essencial) VALUES
  (1, 'Supermercado & Alimentação', 1),
  (2, 'Viagens & Turismo', 0),
  (3, 'Restaurantes & Lazer', 0),
  (4, 'Saúde & Farmácia', 1),
  (5, 'Eletrônicos & Informática', 0),
  (6, 'Combustível & Transporte', 1);

-- Faturas e Transações (Jan a Mar 2024)
INSERT INTO faturas_transacoes (id, cartao_id, categoria_id, data_transacao, valor_centavos, status_pagamento) VALUES
  -- Maurício
  (1, 1, 2, '2024-01-10 14:30:00', 450000, 'pago'),
  (2, 1, 3, '2024-01-18 20:00:00', 85000, 'pago'),
  (3, 1, 1, '2024-02-05 11:20:00', 120000, 'pago'),
  (4, 1, 5, '2024-03-12 16:45:00', 380000, 'pago'),
  -- Letícia
  (5, 2, 1, '2024-01-12 18:15:00', 65000, 'pago'),
  (6, 2, 4, '2024-02-14 10:00:00', 32000, 'pago'),
  (7, 2, 3, '2024-03-08 21:30:00', 140000, 'pendente'),
  -- Gustavo (High Ticket)
  (8, 3, 2, '2024-01-20 09:00:00', 1200000, 'pago'),
  (9, 3, 5, '2024-02-15 15:30:00', 950000, 'pago'),
  (10, 3, 3, '2024-03-20 22:00:00', 420000, 'pago'),
  -- Camila (Estudante)
  (11, 4, 1, '2024-01-25 12:40:00', 45000, 'pago'),
  (12, 4, 6, '2024-02-28 17:10:00', 80000, 'pago'),
  (13, 4, 3, '2024-03-15 19:30:00', 60000, 'pendente'),
  -- Thiago (Inadimplente)
  (14, 5, 5, '2024-01-08 16:00:00', 250000, 'inadimplente'),
  (15, 5, 3, '2024-01-15 21:00:00', 45000, 'inadimplente'),
  -- Patrícia (Corporate PJ)
  (16, 6, 2, '2024-01-28 10:00:00', 1800000, 'pago'),
  (17, 6, 5, '2024-02-20 14:00:00', 2400000, 'pago'),
  (18, 6, 1, '2024-03-25 16:00:00', 350000, 'pago');
`;
