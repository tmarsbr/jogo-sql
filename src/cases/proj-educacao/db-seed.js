/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 11: Gestão Educacional
 */

export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE cursos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  departamento TEXT NOT NULL
);

CREATE TABLE professores (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  titulacao TEXT NOT NULL
);

CREATE TABLE disciplinas (
  id INTEGER PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  curso_id INTEGER NOT NULL REFERENCES cursos(id),
  professor_id INTEGER NOT NULL REFERENCES professores(id),
  carga_horaria INTEGER NOT NULL
);

CREATE TABLE alunos (
  id INTEGER PRIMARY KEY,
  matricula TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  ano_ingresso INTEGER NOT NULL
);

CREATE TABLE turmas_matriculas (
  id INTEGER PRIMARY KEY,
  aluno_id INTEGER NOT NULL REFERENCES alunos(id),
  disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id),
  semestre TEXT NOT NULL,
  nota_final REAL,
  frequencia_percentual REAL,
  status TEXT CHECK(status IN ('aprovado', 'reprovado_nota', 'reprovado_falta', 'cursando'))
);
`;

export const SEED_SQL = `
-- Cursos
INSERT INTO cursos (id, nome, departamento) VALUES
  (1, 'Engenharia de Software', 'Exatas & Tecnologia'),
  (2, 'Ciência de Dados', 'Exatas & Tecnologia'),
  (3, 'Administração de Empresas', 'Ciências Sociais'),
  (4, 'Design Digital', 'Artes & Comunicação');

-- Professores
INSERT INTO professores (id, nome, titulacao) VALUES
  (1, 'Dr. Arnaldo Vasconcelos', 'Doutor'),
  (2, 'Dra. Beatriz Montenegro', 'Doutora'),
  (3, 'Me. Carlos Eduardo Prado', 'Mestre'),
  (4, 'Dra. Denise Alcantara', 'Doutora');

-- Disciplinas
INSERT INTO disciplinas (id, codigo, nome, curso_id, professor_id, carga_horaria) VALUES
  (1, 'MAT101', 'Cálculo Diferencial e Integral I', 1, 1, 80),
  (2, 'PROG102', 'Algoritmos e Estruturas de Dados', 1, 2, 80),
  (3, 'BD201', 'Bancos de Dados Relacionais', 2, 2, 60),
  (4, 'EST301', 'Estatística Aplicada à Ciência de Dados', 2, 1, 60),
  (5, 'ADM101', 'Teoria Geral da Administração', 3, 3, 60),
  (6, 'FIN202', 'Matemática Financeira', 3, 3, 60),
  (7, 'DSG101', 'Fundamentos de UI/UX', 4, 4, 60);

-- Alunos
INSERT INTO alunos (id, matricula, nome, ano_ingresso) VALUES
  (1, '20230101', 'Alice Fontes de Souza', 2023),
  (2, '20230102', 'Bernardo Lima Rezende', 2023),
  (3, '20230103', 'Caio Henrique Ramos', 2023),
  (4, '20230104', 'Debora Castro Nogueira', 2023),
  (5, '20230105', 'Enzo Gabriel Silveira', 2023),
  (6, '20240101', 'Fernanda Paiva Rocha', 2024),
  (7, '20240102', 'Guilherme Toledo Dias', 2024),
  (8, '20240103', 'Helena Marcondes Vaz', 2024);

-- Turmas e Matrículas (Semestre 2023.2)
INSERT INTO turmas_matriculas (id, aluno_id, disciplina_id, semestre, nota_final, frequencia_percentual, status) VALUES
  -- Cálculo I (Alto índice de reprovação)
  (1, 1, 1, '2023.2', 4.5, 82.0, 'reprovado_nota'),
  (2, 2, 1, '2023.2', 3.0, 65.0, 'reprovado_falta'),
  (3, 3, 1, '2023.2', 7.5, 90.0, 'aprovado'),
  (4, 4, 1, '2023.2', 4.0, 85.0, 'reprovado_nota'),
  (5, 5, 1, '2023.2', 8.5, 95.0, 'aprovado'),
  -- Algoritmos
  (6, 1, 2, '2023.2', 8.0, 92.0, 'aprovado'),
  (7, 2, 2, '2023.2', 7.0, 88.0, 'aprovado'),
  (8, 3, 2, '2023.2', 9.2, 98.0, 'aprovado'),
  (9, 4, 2, '2023.2', 6.0, 78.0, 'reprovado_nota'),
  -- Banco de Dados
  (10, 3, 3, '2023.2', 9.5, 100.0, 'aprovado'),
  (11, 4, 3, '2023.2', 8.8, 92.0, 'aprovado'),
  (12, 5, 3, '2023.2', 7.8, 88.0, 'aprovado'),
  -- Estatística Aplicada
  (13, 1, 4, '2023.2', 5.5, 80.0, 'reprovado_nota'),
  (14, 3, 4, '2023.2', 8.2, 90.0, 'aprovado'),
  (15, 5, 4, '2023.2', 9.0, 95.0, 'aprovado'),
  -- TGA
  (16, 6, 5, '2024.1', 8.5, 90.0, 'aprovado'),
  (17, 7, 5, '2024.1', 7.5, 85.0, 'aprovado'),
  -- UI/UX
  (18, 8, 7, '2024.1', 9.0, 96.0, 'aprovado'),
  (19, 7, 7, '2024.1', NULL, NULL, 'cursando'); -- matrícula ainda sem avaliação final
`;
