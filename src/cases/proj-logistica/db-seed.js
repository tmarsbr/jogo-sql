/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 09: Otimização Logística
 */

export const SCHEMA_SQL = `
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
`;

export const SEED_SQL = `
-- Centros de Distribuição
INSERT INTO centros_distribuicao (id, codigo, cidade, estado) VALUES
  (1, 'CD-SP-CAJAMAR', 'Cajamar', 'SP'),
  (2, 'CD-RJ-DUQUE', 'Duque de Caxias', 'RJ'),
  (3, 'CD-MG-CONTAGEM', 'Contagem', 'MG'),
  (4, 'CD-PR-CURITIBA', 'Curitiba', 'PR');

-- Transportadoras
INSERT INTO transportadoras (id, nome, modal, sla_dias_padrao) VALUES
  (1, 'Expresso Rápido Brasil', 'rodoviario', 3),
  (2, 'AeroCargas Log', 'aereo', 1),
  (3, 'Velocita Express', 'rodoviario', 4),
  (4, 'NorteSul Transportes', 'rodoviario', 6);

-- Rotas
INSERT INTO rotas (id, cd_origem_id, estado_destino, distancia_km) VALUES
  (1, 1, 'SP', 80),
  (2, 1, 'RJ', 430),
  (3, 1, 'MG', 580),
  (4, 1, 'BA', 1450),
  (5, 1, 'PE', 2100),
  (6, 4, 'SC', 300),
  (7, 4, 'RS', 700),
  (8, 2, 'ES', 500);

-- Envios (Jan a Mar 2024)
INSERT INTO envios (id, codigo_rastreio, rota_id, transportadora_id, data_despacho, data_estimada, data_entrega, status) VALUES
  (1, 'BR10001SP', 1, 1, '2024-01-05', '2024-01-08', '2024-01-07', 'entregue'),
  (2, 'BR10002RJ', 2, 1, '2024-01-06', '2024-01-10', '2024-01-09', 'entregue'),
  (3, 'BR10003BA', 4, 3, '2024-01-08', '2024-01-15', '2024-01-18', 'entregue'), -- atrasado
  (4, 'BR10004PE', 5, 4, '2024-01-10', '2024-01-18', '2024-01-22', 'entregue'), -- atrasado
  (5, 'BR10005SP', 1, 2, '2024-01-15', '2024-01-16', '2024-01-16', 'entregue'),
  (6, 'BR10006MG', 3, 1, '2024-01-20', '2024-01-24', '2024-01-23', 'entregue'),
  (7, 'BR10007RS', 7, 3, '2024-02-01', '2024-02-07', '2024-02-10', 'entregue'), -- atrasado
  (8, 'BR10008SC', 6, 1, '2024-02-05', '2024-02-08', '2024-02-08', 'entregue'),
  (9, 'BR10009ES', 8, 3, '2024-02-10', '2024-02-15', '2024-02-14', 'devolvido'), -- entregue ao destino e depois devolvido
  (10, 'BR10010BA', 4, 4, '2024-02-12', '2024-02-20', '2024-02-25', 'entregue'), -- atrasado
  (11, 'BR10011PE', 5, 2, '2024-02-18', '2024-02-20', '2024-02-19', 'entregue'),
  (12, 'BR10012SP', 1, 1, '2024-03-01', '2024-03-04', '2024-03-05', 'entregue'), -- atrasado; caso negativo para HAVING > 1
  (13, 'BR10013RJ', 2, 3, '2024-03-05', '2024-03-10', '2024-03-12', 'entregue'), -- atrasado
  (14, 'BR10014BA', 4, 4, '2024-03-10', '2024-03-18', '2024-03-24', 'entregue'), -- atrasado
  (15, 'BR10015MG', 3, 1, '2024-03-15', '2024-03-19', '2024-03-19', 'entregue'),
  (16, 'BR10016RS', 7, 4, '2024-03-20', '2024-03-27', NULL, 'em_transito');

-- Ocorrências de Entrega
INSERT INTO ocorrencias_entrega (id, envio_id, data_ocorrencia, tipo, descricao) VALUES
  (1, 3, '2024-01-14', 'problema_veiculo', 'Quebra mecânica do caminhão na BR-116'),
  (2, 4, '2024-01-17', 'chuvas_fortes', 'Bloqueio parcial de rodovia por alagamento'),
  (3, 7, '2024-02-06', 'destinatario_ausente', 'Primeira tentativa de entrega sem sucesso'),
  (4, 10, '2024-02-18', 'atraso_fiscal', 'Retenção temporária no posto fiscal de divisa'),
  (5, 13, '2024-03-08', 'tributacao', 'Conferência de documentação de carga');
`;
