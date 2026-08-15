/** Dados do Caso #002 — Vazamento na Matriz. */
export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY, nome_completo TEXT NOT NULL, cpf TEXT NOT NULL,
  email TEXT NOT NULL, telefone TEXT, data_cadastro TEXT NOT NULL, plano TEXT NOT NULL
);
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY, nome TEXT NOT NULL, cargo TEXT NOT NULL,
  departamento TEXT NOT NULL, nivel_acesso INTEGER NOT NULL, data_criacao TEXT NOT NULL
);
CREATE TABLE acessos_sistema (
  id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  data_hora TEXT NOT NULL, acao TEXT NOT NULL, tabela_acessada TEXT NOT NULL,
  ip_origem TEXT NOT NULL, registros_exportados INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE logs_exportacao (
  id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  data_hora TEXT NOT NULL, formato TEXT NOT NULL, tabela TEXT NOT NULL,
  quantidade_registros INTEGER NOT NULL, destino TEXT NOT NULL
);
CREATE TABLE alertas_seguranca (
  id INTEGER PRIMARY KEY, tipo TEXT NOT NULL, descricao TEXT NOT NULL,
  data_hora TEXT NOT NULL, usuario_id INTEGER REFERENCES usuarios(id), severidade TEXT NOT NULL
);
CREATE TABLE politicas_acesso (
  id INTEGER PRIMARY KEY, tabela TEXT NOT NULL, nivel_minimo INTEGER NOT NULL, descricao TEXT NOT NULL
);`;

export const SEED_SQL = `
INSERT INTO clientes VALUES
 (1,'Ana Costa','123.456.789-01','ana@exemplo.com','11999990001','2023-01-12','Premium'),
 (2,'Bruno Lima','234.567.890-12','bruno@exemplo.com','11999990002','2023-02-18','Basico'),
 (3,'Carla Souza','345.678.901-23','carla@exemplo.com','11999990003','2023-04-02','Premium'),
 (4,'Diego Reis','456.789.012-34','diego@exemplo.com','11999990004','2024-01-20','Basico'),
 (5,'Elisa Moraes','567.890.123-45','elisa@exemplo.com','11999990005','2024-03-14','Premium');
INSERT INTO usuarios VALUES
 (1,'Marina Azevedo','Analista de Suporte','TI',2,'2021-02-10'),
 (2,'Rafael Mendes','DBA','TI',5,'2019-06-03'),
 (3,'Paula Nunes','Gerente de Dados','Dados',4,'2020-09-11'),
 (4,'Igor Santos','Estagiario','Marketing',1,'2024-01-08');
INSERT INTO politicas_acesso VALUES
 (1,'clientes',6,'Dados pessoais exigem nivel 6'),
 (2,'acessos_sistema',3,'Logs restritos a seguranca'),
 (3,'logs_exportacao',4,'Exportacoes restritas'),
 (4,'alertas_seguranca',3,'Alertas para a equipe de seguranca');
INSERT INTO acessos_sistema VALUES
 (1,1,'2024-06-10 09:12:00','SELECT','clientes','10.0.0.12',0),
 (2,2,'2024-06-11 03:02:00','EXPORT','clientes','185.220.101.4',250),
 (3,2,'2024-06-11 03:05:00','SELECT','logs_exportacao','185.220.101.4',0),
 (4,2,'2024-06-12 03:20:00','EXPORT','clientes','185.220.101.4',180),
 (5,3,'2024-06-12 14:00:00','SELECT','clientes','10.0.0.25',0),
 (6,4,'2024-06-13 10:30:00','SELECT','clientes','10.0.0.31',0),
 (7,2,'2024-06-13 03:30:00','EXPORT','clientes','185.220.101.4',220),
 (8,1,'2024-06-13 11:00:00','SELECT','alertas_seguranca','10.0.0.12',0);
INSERT INTO logs_exportacao VALUES
 (1,2,'2024-06-11 03:02:30','CSV','clientes',250,'vpn://drop-77'),
 (2,2,'2024-06-12 03:20:30','JSON','clientes',180,'vpn://drop-77'),
 (3,2,'2024-06-13 03:30:30','CSV','clientes',220,'vpn://drop-77'),
 (4,3,'2024-06-12 14:10:00','CSV','clientes',5,'relatorio-interno'),
 (5,1,'2024-06-13 11:10:00','JSON','alertas_seguranca',2,'backup-interno');
INSERT INTO alertas_seguranca VALUES
 (1,'horario_anomalo','Exportacao de madrugada','2024-06-11 03:03:00',2,'critica'),
 (2,'volume_anomalo','Mais de 100 registros exportados','2024-06-12 03:21:00',2,'alta'),
 (3,'ip_desconhecido','VPN fora da faixa corporativa','2024-06-13 03:31:00',2,'critica'),
 (4,'rotina','Consulta autorizada','2024-06-12 14:11:00',3,'baixa');`;
