/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 14: Suporte ao Cliente e Help Desk
 */

export const SCHEMA_SQL = `
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
`;

export const SEED_SQL = `
-- Departamentos de Suporte
INSERT INTO departamentos_suporte (id, nome, sla_horas) VALUES
  (1, 'Suporte Técnico N1', 24),
  (2, 'Suporte de Cobrança & Faturamento', 48),
  (3, 'Engenharia de Sistemas N3', 72),
  (4, 'Ouvidoria & Casos Críticos', 12);

-- Atendentes
INSERT INTO atendentes (id, nome, departamento_id, nivel) VALUES
  (1, 'Lucas Gabriel Ferreira', 1, 'N1'),
  (2, 'Mariana Costa Silveira', 1, 'N1'),
  (3, 'Renan Albuquerque Lima', 2, 'N2'),
  (4, 'Vanessa Guimarães Ramos', 3, 'N3'),
  (5, 'Diego Martins Toledo', 4, 'Especialista');

-- Tickets de Atendimento (Jan a Mar 2024)
INSERT INTO tickets (id, protocolo, cliente_id, atendente_id, prioridade, data_abertura, data_fechamento, status, tempo_resolucao_horas) VALUES
  (1, 'TCK-1001', 101, 1, 'baixa', '2024-01-05 09:00:00', '2024-01-05 15:00:00', 'resolvido', 6),
  (2, 'TCK-1002', 102, 1, 'media', '2024-01-08 10:30:00', '2024-01-09 14:30:00', 'resolvido', 28), -- estourou SLA de 24h
  (3, 'TCK-1003', 103, 2, 'baixa', '2024-01-12 11:00:00', '2024-01-12 17:00:00', 'resolvido', 6),
  (4, 'TCK-1004', 104, 3, 'alta', '2024-01-15 14:00:00', '2024-01-16 16:00:00', 'resolvido', 26),
  (5, 'TCK-1005', 105, 4, 'urgente', '2024-01-20 08:00:00', '2024-01-22 18:00:00', 'resolvido', 58),
  (6, 'TCK-1006', 106, 1, 'baixa', '2024-02-01 09:30:00', '2024-02-01 13:30:00', 'resolvido', 4),
  (7, 'TCK-1007', 107, 2, 'media', '2024-02-05 10:00:00', '2024-02-06 08:00:00', 'resolvido', 22),
  (8, 'TCK-1008', 108, 3, 'alta', '2024-02-10 15:00:00', '2024-02-12 19:00:00', 'resolvido', 52), -- estourou SLA de 48h
  (9, 'TCK-1009', 109, 5, 'urgente', '2024-02-15 11:00:00', '2024-02-15 19:00:00', 'resolvido', 8),
  (10, 'TCK-1010', 110, 4, 'urgente', '2024-02-20 13:00:00', '2024-02-23 15:00:00', 'resolvido', 74), -- estourou SLA de 72h
  (11, 'TCK-1011', 111, 1, 'media', '2024-03-01 08:30:00', '2024-03-01 18:30:00', 'resolvido', 10),
  (12, 'TCK-1012', 112, 2, 'baixa', '2024-03-05 14:00:00', '2024-03-05 19:00:00', 'resolvido', 5),
  (13, 'TCK-1013', 113, 3, 'alta', '2024-03-10 09:00:00', '2024-03-11 11:00:00', 'resolvido', 26),
  (14, 'TCK-1014', 114, 5, 'urgente', '2024-03-15 10:00:00', '2024-03-15 16:00:00', 'resolvido', 6),
  (15, 'TCK-1015', 115, 1, 'baixa', '2024-03-20 16:00:00', NULL, 'em_andamento', NULL);

-- Avaliações de Satisfação (CSAT)
INSERT INTO avaliacoes_csat (id, ticket_id, nota_csat, comentario) VALUES
  (1, 1, 5, 'Atendimento rápido e eficiente!'),
  (2, 2, 2, 'Demorou mais que o esperado para responder.'),
  (3, 3, 5, 'Muito prestativa, resolveu de primeira.'),
  (4, 4, 4, 'Boa explicação sobre a fatura.'),
  (5, 5, 5, 'Excelente atuação da engenharia no bug.'),
  (6, 6, 5, 'Perfeito!'),
  (7, 7, 4, 'Resolvido dentro do prazo.'),
  (8, 8, 3, 'Tive que cobrar posição duas vezes.'),
  (9, 9, 5, 'Apoio impecável da ouvidoria.'),
  -- O ticket 10 não recebeu avaliação; evita tratar uma única nota como amostra representativa.
  (11, 11, 4, 'Atendimento cordial.'),
  (12, 12, 5, 'Super rápido e claro.'),
  (13, 13, 4, 'Estorno realizado corretamente.'),
  (14, 14, 5, 'Resolução excelente em tempo recorde.');
`;
