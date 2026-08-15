/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 12: Gestão em Saúde
 */

export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE especialidades (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  duracao_media_minutos INTEGER NOT NULL
);

CREATE TABLE unidades (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  bairro TEXT NOT NULL,
  capacidade_diaria INTEGER NOT NULL
);

CREATE TABLE medicos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  crm TEXT NOT NULL UNIQUE,
  especialidade_id INTEGER NOT NULL REFERENCES especialidades(id),
  unidade_id INTEGER NOT NULL REFERENCES unidades(id)
);

CREATE TABLE pacientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  data_nascimento TEXT NOT NULL,
  convenio TEXT NOT NULL
);

CREATE TABLE agendamentos (
  id INTEGER PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
  medico_id INTEGER NOT NULL REFERENCES medicos(id),
  data_agendamento TEXT NOT NULL,
  data_consulta TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('realizada', 'cancelada_paciente', 'cancelada_medico', 'no_show')),
  tempo_espera_minutos INTEGER
);
`;

export const SEED_SQL = `
-- Especialidades
INSERT INTO especialidades (id, nome, duracao_media_minutos) VALUES
  (1, 'Cardiologia', 30),
  (2, 'Ortopedia', 20),
  (3, 'Pediatria', 30),
  (4, 'Dermatologia', 20),
  (5, 'Neurologia', 45);

-- Unidades Hospitalares / Clínicas
INSERT INTO unidades (id, nome, bairro, capacidade_diaria) VALUES
  (1, 'Hospital Central', 'Centro', 150),
  (2, 'Clínica Zona Sul', 'Copacabana', 80),
  (3, 'Centro Médico Zona Norte', 'Tijuca', 60),
  (4, 'Unidade Avançada Oeste', 'Barra da Tijuca', 100);

-- Médicos
INSERT INTO medicos (id, nome, crm, especialidade_id, unidade_id) VALUES
  (1, 'Dr. Rodrigo Barcellos', 'CRM-RJ-54120', 1, 1),
  (2, 'Dra. Camila Nogueira', 'CRM-RJ-62310', 1, 2),
  (3, 'Dr. Marcelo Fontoura', 'CRM-RJ-48900', 2, 1),
  (4, 'Dra. Juliana Siqueira', 'CRM-RJ-71550', 3, 3),
  (5, 'Dr. Felipe Aragão', 'CRM-RJ-59420', 4, 2),
  (6, 'Dra. Renata Vasconcellos', 'CRM-RJ-80110', 5, 1);

-- Pacientes
INSERT INTO pacientes (id, nome, data_nascimento, convenio) VALUES
  (1, 'Antônio Carlos Silva', '1962-04-15', 'Unimed'),
  (2, 'Bruna Medeiros Lima', '1995-08-20', 'Bradesco Saúde'),
  (3, 'Cláudio Ferreira Ramos', '1958-11-03', 'SulAmérica'),
  (4, 'Daniela Prado Rocha', '2018-05-12', 'Amil'),
  (5, 'Eduardo Mendes Souza', '1984-02-28', 'Particular'),
  (6, 'Francisca Neves Pinto', '1947-09-10', 'Unimed'),
  (7, 'Gabriel Toledo Costa', '1990-12-05', 'Bradesco Saúde'),
  (8, 'Heloísa Guimarães Dias', '2001-07-19', 'Amil');

-- Agendamentos (Jan a Mar 2024)
INSERT INTO agendamentos (id, paciente_id, medico_id, data_agendamento, data_consulta, status, tempo_espera_minutos) VALUES
  -- Cardiologia (Dr. Rodrigo / Dra. Camila)
  (1, 1, 1, '2024-01-05', '2024-01-15', 'realizada', 25),
  (2, 3, 1, '2024-01-10', '2024-01-20', 'realizada', 40),
  (3, 6, 1, '2024-01-18', '2024-01-28', 'realizada', 35),
  (4, 1, 2, '2024-02-01', '2024-02-12', 'realizada', 15),
  (5, 3, 2, '2024-02-10', '2024-02-22', 'no_show', NULL),
  (6, 6, 1, '2024-03-01', '2024-03-10', 'realizada', 30),
  (7, 5, 2, '2024-03-05', '2024-03-18', 'realizada', 20),
  -- Ortopedia (Dr. Marcelo)
  (8, 2, 3, '2024-01-12', '2024-01-18', 'realizada', 10),
  (9, 7, 3, '2024-01-25', '2024-02-02', 'realizada', 15),
  (10, 5, 3, '2024-02-14', '2024-02-20', 'cancelada_paciente', NULL),
  (11, 2, 3, '2024-03-02', '2024-03-08', 'realizada', 20),
  -- Pediatria (Dra. Juliana)
  (12, 4, 4, '2024-01-08', '2024-01-10', 'realizada', 10),
  (13, 4, 4, '2024-02-05', '2024-02-07', 'realizada', 5),
  (14, 4, 4, '2024-03-12', '2024-03-14', 'realizada', 10),
  -- Dermatologia (Dr. Felipe)
  (15, 8, 5, '2024-01-20', '2024-02-05', 'realizada', 12),
  (16, 2, 5, '2024-02-18', '2024-03-05', 'no_show', NULL),
  (17, 8, 5, '2024-03-01', '2024-03-20', 'realizada', 15),
  -- Neurologia (Dra. Renata)
  (18, 6, 6, '2024-01-15', '2024-02-10', 'realizada', 50),
  (19, 1, 6, '2024-02-10', '2024-03-15', 'cancelada_medico', 120), -- paciente aguardou antes do cancelamento médico
  (20, 3, 6, '2024-02-20', '2024-03-25', 'realizada', 45);
`;
