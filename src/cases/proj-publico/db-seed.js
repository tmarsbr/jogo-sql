/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 15: Dados Públicos e Municípios
 */

export const SCHEMA_SQL = `
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
`;

export const SEED_SQL = `
-- Estados
INSERT INTO estados (id, sigla, nome, regiao) VALUES
  (1, 'SP', 'São Paulo', 'Sudeste'),
  (2, 'RJ', 'Rio de Janeiro', 'Sudeste'),
  (3, 'MG', 'Minas Gerais', 'Sudeste'),
  (4, 'BA', 'Bahia', 'Nordeste'),
  (5, 'PR', 'Paraná', 'Sul');

-- Municípios
INSERT INTO municipios (id, codigo_ibge, nome, estado_id, populacao, pib_milhares_reais) VALUES
  (1, '3550308', 'São Paulo', 1, 12300000, 800000000),
  (2, '3509502', 'Campinas', 1, 1200000, 65000000),
  (3, '3304557', 'Rio de Janeiro', 2, 6700000, 360000000),
  (4, '3106200', 'Belo Horizonte', 3, 2500000, 95000000),
  (5, '2927408', 'Salvador', 4, 2900000, 63000000),
  (6, '4106902', 'Curitiba', 5, 1900000, 90000000);

-- Áreas de Governo
INSERT INTO areas_governo (id, nome) VALUES
  (1, 'Saúde Pública'),
  (2, 'Educação Básica'),
  (3, 'Segurança & Defesa Social'),
  (4, 'Infraestrutura Urbana'),
  (5, 'Saneamento & Meio Ambiente');

-- Despesas Públicas (Ano 2023)
INSERT INTO despesas_publicas (id, municipio_id, area_id, ano, valor_empenhado_centavos, valor_liquidado_centavos) VALUES
  -- São Paulo (Capital)
  (1, 1, 1, 2023, 1500000000000, 1420000000000),
  (2, 1, 2, 2023, 1800000000000, 1750000000000),
  (3, 1, 4, 2023, 850000000000, 780000000000),
  -- Campinas
  (4, 2, 1, 2023, 180000000000, 172000000000),
  (5, 2, 2, 2023, 220000000000, 210000000000),
  -- Rio de Janeiro
  (6, 3, 1, 2023, 850000000000, 790000000000),
  (7, 3, 2, 2023, 920000000000, 880000000000),
  (8, 3, 3, 2023, 400000000000, 370000000000),
  -- Belo Horizonte
  (9, 4, 1, 2023, 350000000000, 335000000000),
  (10, 4, 2, 2023, 410000000000, 395000000000),
  -- Salvador
  (11, 5, 1, 2023, 280000000000, 260000000000),
  (12, 5, 2, 2023, 340000000000, 320000000000),
  -- Curitiba
  (13, 6, 1, 2023, 290000000000, 280000000000),
  (14, 6, 2, 2023, 360000000000, 350000000000),
  (15, 6, 5, 2023, 120000000000, 115000000000);
`;
