/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 16: Futebol e Performance Esportiva
 */

export const SCHEMA_SQL = `
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
`;

export const SEED_SQL = `
-- Clubes
INSERT INTO clubes (id, nome, sigla, estado) VALUES
  (1, 'Flamengo', 'FLA', 'RJ'),
  (2, 'Palmeiras', 'PAL', 'SP'),
  (3, 'Atlético Mineiro', 'CAM', 'MG'),
  (4, 'Grêmio', 'GRE', 'RS');

-- Jogadores
INSERT INTO jogadores (id, nome, clube_id, posicao, numero_camisa) VALUES
  -- Flamengo
  (1, 'Pedro Guilherme', 1, 'Atacante', 9),
  (2, 'Giorgian De Arrascaeta', 1, 'Meio-Campo', 14),
  (3, 'Gerson Santos', 1, 'Meio-Campo', 8),
  (4, 'Fabrício Bruno', 1, 'Zagueiro', 15),
  -- Palmeiras
  (5, 'Raphael Veiga', 2, 'Meio-Campo', 23),
  (6, 'Endrick Felipe', 2, 'Atacante', 9),
  (7, 'Gustavo Gómez', 2, 'Zagueiro', 15),
  -- Atlético Mineiro
  (8, 'Hulk Paraíba', 3, 'Atacante', 7),
  (9, 'Paulinho Henrique', 3, 'Atacante', 10),
  (10, 'Guilherme Arana', 3, 'Lateral', 13),
  -- Grêmio
  (11, 'Franco Cristaldo', 4, 'Meio-Campo', 10),
  (12, 'Diego Costa', 4, 'Atacante', 19);

-- Partidas (Campeonato)
INSERT INTO partidas (id, rodada, clube_mandante_id, clube_visitante_id, gols_mandante, gols_visitante, data_partida) VALUES
  (1, 1, 1, 2, 2, 1, '2024-04-14'), -- FLA 2 x 1 PAL
  (2, 1, 3, 4, 1, 1, '2024-04-14'), -- CAM 1 x 1 GRE
  (3, 2, 2, 3, 2, 0, '2024-04-21'), -- PAL 2 x 0 CAM
  (4, 2, 4, 1, 0, 2, '2024-04-21'); -- GRE 0 x 2 FLA

-- Estatísticas Individuais por Partida
INSERT INTO estatisticas_partida (id, partida_id, jogador_id, minutos_jogados, finalizacoes_total, finalizacoes_no_gol, gols, assistencias, passes_certos) VALUES
  -- Partida 1: FLA x PAL
  (1, 1, 1, 90, 5, 3, 2, 0, 18), -- Pedro: 2 gols
  (2, 1, 2, 85, 2, 1, 0, 2, 42), -- Arrascaeta: 2 assist
  (3, 1, 5, 90, 3, 2, 1, 0, 35), -- Veiga: 1 gol
  (4, 1, 6, 75, 4, 2, 0, 0, 12), -- Endrick
  -- Partida 2: CAM x GRE
  (5, 2, 8, 90, 6, 4, 1, 0, 22), -- Hulk: 1 gol
  (6, 2, 9, 80, 3, 1, 0, 1, 19), -- Paulinho: 1 assist
  (7, 2, 11, 90, 2, 1, 0, 1, 48), -- Cristaldo: 1 assist
  (8, 2, 12, 70, 3, 2, 1, 0, 8), -- Diego Costa: 1 gol
  -- Partida 3: PAL x CAM
  (9, 3, 5, 90, 4, 3, 1, 1, 40), -- Veiga: 1 gol, 1 assist
  (10, 3, 6, 85, 3, 2, 1, 0, 15), -- Endrick: 1 gol
  (11, 3, 8, 90, 4, 1, 0, 0, 20), -- Hulk
  (12, 3, 9, 90, 2, 0, 0, 0, 14), -- Paulinho
  -- Partida 4: GRE x FLA
  (13, 4, 1, 90, 4, 3, 1, 0, 20), -- Pedro: 1 gol
  (14, 4, 2, 80, 1, 1, 1, 0, 38), -- Arrascaeta: 1 gol
  (15, 4, 3, 90, 1, 0, 0, 1, 55), -- Gerson: 1 assist
  (16, 4, 11, 90, 2, 1, 0, 0, 45), -- Cristaldo
  (17, 4, 12, 65, 2, 1, 0, 0, 10); -- Diego Costa
`;
