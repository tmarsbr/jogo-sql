/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 08: Análise de Marketing
 */

export const SCHEMA_SQL = `
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
`;

export const SEED_SQL = `
-- Canais de Aquisição
INSERT INTO canais (id, nome, tipo) VALUES
  (1, 'Google Search', 'pago'),
  (2, 'Meta Ads (Instagram/FB)', 'pago'),
  (3, 'LinkedIn Ads', 'pago'),
  (4, 'E-mail Marketing', 'proprio'),
  (5, 'Orgânico / SEO', 'organico');

-- Campanhas
INSERT INTO campanhas (id, nome, canal_id, orcamento_centavos, data_inicio, data_fim) VALUES
  (1, 'Black Friday Antecipada', 1, 500000, '2024-01-01', '2024-01-31'),
  (2, 'Geração de Leads B2B Q1', 3, 800000, '2024-01-15', '2024-02-28'),
  (3, 'Branding & Stories Verão', 2, 300000, '2024-02-01', '2024-02-28'),
  (4, 'Nutrição Base Inativa', 4, 100000, '2024-02-10', '2024-03-10'),
  (5, 'Lançamento Produto Pro', 1, 600000, '2024-03-01', '2024-03-31');

-- Custos Diários / Métricas de Mídia
INSERT INTO custos_diarios (id, campanha_id, data, custo_centavos, cliques, impressoes) VALUES
  (1, 1, '2024-01-10', 150000, 1200, 25000),
  (2, 1, '2024-01-20', 250000, 1800, 38000),
  (3, 2, '2024-01-25', 300000, 450, 12000),
  (4, 2, '2024-02-15', 400000, 600, 15000),
  (5, 3, '2024-02-10', 200000, 2500, 80000),
  (6, 3, '2024-02-20', 180000, 2100, 70000),
  (7, 4, '2024-02-15', 50000, 800, 5000),
  (8, 4, '2024-03-01', 40000, 700, 4500),
  (9, 5, '2024-03-10', 280000, 2000, 42000),
  (10, 5, '2024-03-22', 290000, 2200, 46000);

-- Leads Capturados
INSERT INTO leads (id, campanha_id, email, data_captura, qualificado) VALUES
  (1, 1, 'lead1@empresa.com', '2024-01-10 10:20:00', 1),
  (2, 1, 'lead2@gmail.com', '2024-01-11 14:15:00', 0),
  (3, 1, 'lead3@hotmail.com', '2024-01-12 18:30:00', 1),
  (4, 1, 'lead4@yahoo.com', '2024-01-15 09:00:00', 1),
  (5, 2, 'ceo@startup.io', '2024-01-26 11:30:00', 1),
  (6, 2, 'cto@tech.com', '2024-01-28 15:45:00', 1),
  (7, 2, 'analista@corp.br', '2024-02-16 10:10:00', 0),
  (8, 3, 'comprador1@gmail.com', '2024-02-11 13:20:00', 0),
  (9, 3, 'comprador2@gmail.com', '2024-02-12 17:00:00', 1),
  (10, 3, 'comprador3@uol.com.br', '2024-02-14 20:30:00', 0),
  (11, 4, 'cliente_antigo1@terra.com', '2024-02-16 08:40:00', 1),
  (12, 4, 'cliente_antigo2@bol.com.br', '2024-02-18 16:15:00', 1),
  (13, 5, 'interessado1@pro.com', '2024-03-11 12:00:00', 1),
  (14, 5, 'interessado2@pro.com', '2024-03-15 14:25:00', 1),
  (15, 5, 'interessado3@empresa.com', '2024-03-23 10:50:00', 1);

-- Conversões em Vendas
INSERT INTO conversoes (id, lead_id, valor_venda_centavos, data_conversao) VALUES
  (1, 1, 180000, '2024-01-15 16:00:00'),
  (2, 3, 250000, '2024-01-18 11:20:00'),
  (3, 4, 320000, '2024-01-22 15:40:00'),
  (4, 5, 1200000, '2024-02-05 14:10:00'),
  (5, 6, 950000, '2024-02-20 10:30:00'),
  (6, 9, 150000, '2024-02-18 18:00:00'),
  (7, 11, 280000, '2024-02-22 09:15:00'),
  (8, 12, 190000, '2024-02-25 16:50:00'),
  (9, 13, 650000, '2024-03-18 11:00:00'),
  (10, 14, 720000, '2024-03-25 15:30:00');
`;
