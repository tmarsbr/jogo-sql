/**
 * Caso 005 — "A Planilha do Inferno" (Normalização e Relacionamentos)
 * Schema: planilha desnormalizada (supremacy) + tabelas alvo vazias
 */

export const SCHEMA_SQL = `
-- Tabela única desnormalizada (a "Planilha do Inferno")
CREATE TABLE supremacy (
  id INTEGER PRIMARY KEY,
  data_venda TEXT NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_cpf TEXT,
  cliente_endereco TEXT,
  cliente_telefone TEXT,
  produto_nome TEXT NOT NULL,
  produto_categoria TEXT,
  produto_preco TEXT,
  vendedor_nome TEXT NOT NULL,
  vendedor_regiao TEXT,
  regiao_gerente TEXT,
  quantidade INTEGER NOT NULL,
  preco_venda TEXT NOT NULL
);

-- Tabelas alvo (vazias — o jogador vai preenchê-las)
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  endereco TEXT,
  telefone TEXT
);

CREATE TABLE produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  categoria TEXT,
  preco REAL
);

CREATE TABLE vendedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  regiao_id INTEGER NOT NULL,
  FOREIGN KEY (regiao_id) REFERENCES regioes(id)
);

CREATE TABLE regioes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  gerente TEXT
);

CREATE TABLE vendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER,
  vendedor_id INTEGER,
  data_venda TEXT NOT NULL,
  valor_total REAL NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id)
);

CREATE TABLE itens_venda (
  venda_id INTEGER,
  produto_id INTEGER,
  quantidade INTEGER NOT NULL,
  preco_unitario REAL NOT NULL,
  PRIMARY KEY (venda_id, produto_id),
  FOREIGN KEY (venda_id) REFERENCES vendas(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);
`;

export const SEED_SQL = `
-- Dados da "Planilha do Inferno" (20 registros para simplicidade didática)
INSERT INTO supremacy VALUES (1, '2024-01-05', 'José da Silva', '111.111.111-01', 'Rua A, 100', '11-9999-0001', 'Notebook X', 'Informática', '3500,00', 'Maria Souza', 'Sudeste', 'Carlos Mendes', 2, '3500,00');
INSERT INTO supremacy VALUES (2, '2024-01-08', 'José da Silva', '111.111.111-01', 'Rua A, 100', '11-9999-0001', 'Mouse Y', 'Periféricos', '120,50', 'Maria Souza', 'Sudeste', 'Carlos Mendes', 5, '120,50');
INSERT INTO supremacy VALUES (3, '2024-01-10', 'jose da silva', '111.111.111-01', 'Rua A, 100', '11-9999-0001', 'Teclado Z', 'Periféricos', '200,00', 'Maria Souza', 'Sudeste', 'Carlos Mendes', 3, '200,00');
INSERT INTO supremacy VALUES (4, '2024-01-12', 'J. da Silva', '111.111.111-01', 'Rua A, 100', '11-9999-0001', 'Monitor W', 'Informática', '890,00', 'Maria Souza', 'Sudeste', 'Carlos Mendes', 1, '890,00');
INSERT INTO supremacy VALUES (5, '2024-01-15', 'Ana Pereira', '222.222.222-02', 'Av. Brasil, 500', '21-8888-0002', 'Notebook X', 'Informática', '3500,00', 'João Santos', 'Sul', 'Patricia Lima', 1, '3500,00');
INSERT INTO supremacy VALUES (6, '2024-01-18', 'Ana Pereira', '222.222.222-02', 'Av. Brasil, 500', '21-8888-0002', 'Webcam V', 'Periféricos', '150,00', 'João Santos', 'Sul', 'Patricia Lima', 2, '150,00');
INSERT INTO supremacy VALUES (7, '2024-01-20', 'Carlos Oliveira', '333.333.333-03', 'Rua C, 50', '31-7777-0003', 'Impressora P', 'Informática', '650,00', 'Pedro Costa', 'Nordeste', 'Fernanda Alves', 1, '650,00');
INSERT INTO supremacy VALUES (8, '2024-01-22', 'Carlos Oliveira', '333.333.333-03', 'Rua C, 50', '31-7777-0003', 'Mouse Y', 'Periféricos', '120,50', 'Pedro Costa', 'Nordeste', 'Fernanda Alves', 10, '120,50');
INSERT INTO supremacy VALUES (9, '2024-01-25', 'Beatriz Lima', '444.444.444-04', 'Rua D, 200', '41-6666-0004', 'Teclado Z', 'Periféricos', '200,00', 'Maria Souza', 'Sudeste', 'Carlos Mendes', 1, '200,00');
INSERT INTO supremacy VALUES (10, '2024-01-28', 'Beatriz Lima', '444.444.444-04', 'Rua D, 200', '41-6666-0004', 'Monitor W', 'Informática', '890,00', 'Maria Souza', 'Sudeste', 'Carlos Mendes', 2, '890,00');
INSERT INTO supremacy VALUES (11, '2024-02-01', 'Eduardo Rocha', '555.555.555-05', 'Av. Paulista, 1000', '11-5555-0005', 'Notebook X', 'Informática', '3500,00', 'João Santos', 'Sul', 'Patricia Lima', 3, '3500,00');
INSERT INTO supremacy VALUES (12, '2024-02-03', 'Eduardo Rocha', '555.555.555-05', 'Av. Paulista, 1000', '11-5555-0005', 'Webcam V', 'Periféricos', '150,00', 'João Santos', 'Sul', 'Patricia Lima', 1, '150,00');
INSERT INTO supremacy VALUES (13, '2024-02-05', 'Fernanda Costa', '666.666.666-06', 'Rua E, 75', '51-4444-0006', 'Impressora P', 'Informática', '650,00', 'Pedro Costa', 'Nordeste', 'Fernanda Alves', 2, '650,00');
INSERT INTO supremacy VALUES (14, '2024-02-08', 'Fernanda Costa', '666.666.666-06', 'Rua E, 75', '51-4444-0006', 'Mouse Y', 'Periféricos', '120,50', 'Pedro Costa', 'Nordeste', 'Fernanda Alves', 3, '120,50');
INSERT INTO supremacy VALUES (15, '2024-02-10', 'Gabriel Souza', '777.777.777-07', 'Rua F, 300', '61-3333-0007', 'Notebook X', 'Informática', '3500,00', 'Maria Souza', 'Sudeste', 'Carlos Mendes', 1, '3500,00');
INSERT INTO supremacy VALUES (16, '2024-02-12', 'Gabriel Souza', '777.777.777-07', 'Rua F, 300', '61-3333-0007', 'Teclado Z', 'Periféricos', '200,00', 'Maria Souza', 'Sudeste', 'Carlos Mendes', 4, '200,00');
INSERT INTO supremacy VALUES (17, '2024-02-15', 'Helena Martins', '888.888.888-08', 'Av. Goiás, 150', '71-2222-0008', 'Monitor W', 'Informática', '890,00', 'João Santos', 'Sul', 'Patricia Lima', 1, '890,00');
INSERT INTO supremacy VALUES (18, '2024-02-18', 'Helena Martins', '888.888.888-08', 'Av. Goiás, 150', '71-2222-0008', 'Webcam V', 'Periféricos', '150,00', 'João Santos', 'Sul', 'Patricia Lima', 3, '150,00');
INSERT INTO supremacy VALUES (19, '2024-02-20', 'Igor Almeida', '999.999.999-09', 'Rua G, 400', '81-1111-0009', 'Impressora P', 'Informática', '650,00', 'Pedro Costa', 'Nordeste', 'Fernanda Alves', 1, '650,00');
INSERT INTO supremacy VALUES (20, '2024-02-22', 'Igor Almeida', '999.999.999-09', 'Rua G, 400', '81-1111-0009', 'Notebook X', 'Informática', '3500,00', 'Pedro Costa', 'Nordeste', 'Fernanda Alves', 2, '3500,00');

-- ═══ Entidades de apoio já normalizadas ═══
-- Regiões e vendedores são a referência para a etapa de 3FN. O jogador
-- normaliza clientes, produtos, vendas e itens ao longo das missões.
-- Um prospect sem venda permite demonstrar o relacionamento opcional com LEFT JOIN.
INSERT INTO clientes (nome, cpf, endereco, telefone)
VALUES ('Luciana Freitas', '000.000.000-00', 'Rua Sem Compra, 10', '11-0000-0000');

INSERT INTO regioes (nome, gerente) VALUES ('Sudeste', 'Carlos Mendes');
INSERT INTO regioes (nome, gerente) VALUES ('Sul', 'Patricia Lima');
INSERT INTO regioes (nome, gerente) VALUES ('Nordeste', 'Fernanda Alves');

INSERT INTO vendedores (nome, regiao_id) VALUES ('Maria Souza', 1);
INSERT INTO vendedores (nome, regiao_id) VALUES ('João Santos', 2);
INSERT INTO vendedores (nome, regiao_id) VALUES ('Pedro Costa', 3);
`;
