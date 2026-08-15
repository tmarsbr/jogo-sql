/** Dados do Caso #004 — Sabotagem no E-Commerce. */
export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;
CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, categoria TEXT NOT NULL, preco_centavos INTEGER NOT NULL, estoque_atual INTEGER, estoque_minimo INTEGER NOT NULL, ativo INTEGER NOT NULL);
CREATE TABLE clientes_ecommerce (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL, data_cadastro TEXT NOT NULL);
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER NOT NULL REFERENCES clientes_ecommerce(id), data_hora TEXT NOT NULL, status TEXT NOT NULL, total_centavos INTEGER NOT NULL);
CREATE TABLE itens_pedido (id INTEGER PRIMARY KEY, pedido_id INTEGER NOT NULL REFERENCES pedidos(id), produto_id INTEGER NOT NULL REFERENCES produtos(id), quantidade INTEGER NOT NULL, preco_unitario_centavos INTEGER NOT NULL);
CREATE TABLE movimentacoes_estoque (id INTEGER PRIMARY KEY, produto_id INTEGER NOT NULL REFERENCES produtos(id), tipo TEXT NOT NULL, quantidade INTEGER, data_hora TEXT NOT NULL, responsavel_id INTEGER, motivo TEXT);
CREATE TABLE auditoria (id INTEGER PRIMARY KEY, tabela TEXT NOT NULL, operacao TEXT NOT NULL, registro_id INTEGER NOT NULL, dados_antes TEXT, dados_depois TEXT, data_hora TEXT NOT NULL, usuario TEXT NOT NULL);`;

export const SEED_SQL = `
INSERT INTO produtos VALUES
 (1,'Notebook Nitro','Informatica',450000,-4,5,1),
 (2,'Fone Pulse','Audio',18900,0,20,1),
 (3,'Monitor 27','Informatica',129900,8,10,1),
 (4,'Teclado Pro','Perifericos',29900,35,10,1),
 (5,'Mouse Air','Perifericos',15900,NULL,15,1);
INSERT INTO clientes_ecommerce VALUES
 (1,'Ana Dias','ana@cliente.com','2023-05-10'),(2,'Bruno Melo','bruno@cliente.com','2024-01-18'),(3,'Carla Reis','carla@cliente.com','2024-02-22');
INSERT INTO pedidos VALUES
 (1,1,'2024-11-29 09:10:00','pago',900000),(2,2,'2024-11-29 10:00:00','pago',37800),(3,3,'2024-11-30 12:40:00','pago',450000),(4,1,'2024-12-02 10:00:00','enviado',29900);
INSERT INTO itens_pedido VALUES
 (1,1,1,2,450000),(2,2,2,2,18900),(3,3,1,1,450000),(4,4,4,1,29900);
INSERT INTO movimentacoes_estoque VALUES
 (1,1,'saida',2,'2024-11-29 09:10:00',5,'pedido'),
 (2,1,'ajuste',-5,'2024-11-29 08:30:00',7,'ajuste manual - inventario'),
 (3,2,'ajuste',-20,'2024-11-29 08:35:00',7,'ajuste manual - inventario'),
 (4,3,'ajuste',-12,'2024-11-29 08:40:00',7,'ajuste manual - inventario'),
 (5,1,'ajuste',-3,'2024-11-30 08:30:00',7,'ajuste manual - correcao'),
 (6,4,'entrada',10,'2024-12-01 10:00:00',8,NULL),
 (7,2,'ajuste',0,'2024-11-30 09:00:00',8,'contagem');
WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 19)
INSERT INTO movimentacoes_estoque
SELECT 100 + x, ((x - 1) % 3) + 1, 'ajuste', -1, datetime('2024-11-30 10:00:00', '+' || x || ' minutes'), 7, 'ajuste manual - inventario' FROM n;
INSERT INTO auditoria VALUES
 (1,'produtos','UPDATE',1,'{"estoque_atual":4}','{"estoque_atual":0}','2024-11-29 08:30:01','Lucas Prado'),
 (2,'produtos','UPDATE',2,'{"estoque_atual":20}','{"estoque_atual":0}','2024-11-29 08:35:01','Lucas Prado'),
 (3,'produtos','UPDATE',3,'{"estoque_atual":20}','{"estoque_atual":8}','2024-11-29 08:40:01','Lucas Prado'),
 (4,'produtos','UPDATE',4,NULL,'{"estoque_atual":35}','2024-12-01 10:00:01','Julia Freitas');`;
