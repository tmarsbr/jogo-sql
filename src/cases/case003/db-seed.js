/** Dados do Caso #003 — A Rota da Cripto-Ativo. */
export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;
CREATE TABLE exchanges (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, pais TEXT NOT NULL, regulamentada INTEGER NOT NULL);
CREATE TABLE carteiras (id INTEGER PRIMARY KEY, endereco_hash TEXT NOT NULL UNIQUE, tipo TEXT NOT NULL, titular TEXT NOT NULL, data_criacao TEXT NOT NULL, exchange INTEGER REFERENCES exchanges(id));
CREATE TABLE transferencias (id INTEGER PRIMARY KEY, carteira_origem_id INTEGER NOT NULL REFERENCES carteiras(id), carteira_destino_id INTEGER NOT NULL REFERENCES carteiras(id), valor_btc REAL NOT NULL, taxa_btc REAL NOT NULL, data_hora TEXT NOT NULL, status TEXT NOT NULL, hash_transacao TEXT NOT NULL UNIQUE);
CREATE TABLE alertas_bancarios (id INTEGER PRIMARY KEY, transferencia_id INTEGER NOT NULL REFERENCES transferencias(id), tipo_alerta TEXT NOT NULL, data_hora TEXT NOT NULL, resolvido INTEGER NOT NULL);
CREATE TABLE kyc_registros (id INTEGER PRIMARY KEY, carteira_id INTEGER NOT NULL REFERENCES carteiras(id), documento_tipo TEXT NOT NULL, documento_numero TEXT NOT NULL, nome_titular TEXT NOT NULL, data_verificacao TEXT NOT NULL, status TEXT NOT NULL);`;

export const SEED_SQL = `
INSERT INTO exchanges VALUES (1,'BitBrasil','Brasil',1),(2,'ShadowX','Ilhas Cayman',0),(3,'GlobalCoin','Portugal',1);
INSERT INTO carteiras VALUES
 (1,'0xA11...901','custodia','Empresa Origem','2023-01-01',1),
 (2,'0xAF7...3B2','externa','Marcos Duarte','2024-04-11',2),
 (3,'0xB22...444','custodia','Ana Mercado','2022-06-05',3),
 (4,'0xC33...777','externa','Joana Silva','2023-08-20',1),
 (5,'0xD44...888','externa','Conta Sem KYC','2024-06-01',2);
INSERT INTO kyc_registros VALUES
 (1,1,'CNPJ','12.345.678/0001-90','Empresa Origem','2023-01-01','aprovado'),
 (2,3,'CPF','111.222.333-44','Ana Mercado','2022-06-05','aprovado'),
 (3,4,'CPF','222.333.444-55','Joana Silva','2023-08-20','aprovado');
WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x < 47)
INSERT INTO transferencias
SELECT 1000+x, 1, 2, 0.01, 0.00001, datetime('2024-06-10 00:00:00', '+' || (x * 90) || ' minutes'), 'confirmada', 'hash-smurf-' || x FROM n;
INSERT INTO transferencias VALUES
 (2001,3,4,0.50,0.0001,'2024-06-15 12:00:00','confirmada','hash-normal-1'),
 (2002,4,3,0.20,0.0001,'2024-06-16 13:00:00','confirmada','hash-normal-2'),
 (2003,2,5,0.03,0.0001,'2024-06-17 14:00:00','pendente','hash-lateral-1');
INSERT INTO alertas_bancarios VALUES
 (1,1001,'microtransferencias','2024-06-10 01:31:00',0),
 (2,1010,'frequencia','2024-06-10 15:01:00',0),
 (3,2001,'rotina','2024-06-15 12:01:00',1);`;
