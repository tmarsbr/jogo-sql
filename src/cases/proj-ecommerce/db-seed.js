/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 05: E-Commerce
 */

export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE categorias (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  margem_padrao REAL NOT NULL
);

CREATE TABLE produtos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  preco_unitario_centavos INTEGER NOT NULL,
  custo_centavos INTEGER NOT NULL,
  ativo INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  data_cadastro TEXT NOT NULL
);

CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data_pedido TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pago', 'enviado', 'entregue', 'cancelado')),
  cupom_desconto TEXT
);

CREATE TABLE itens_pedido (
  id INTEGER PRIMARY KEY,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL CHECK(quantidade > 0),
  preco_praticado_centavos INTEGER NOT NULL
);
`;

export const SEED_SQL = `
-- Categorias
INSERT INTO categorias (id, nome, margem_padrao) VALUES
  (1, 'Eletrônicos', 0.35),
  (2, 'Acessórios', 0.50),
  (3, 'Móveis & Escritório', 0.40),
  (4, 'Livros & Mídia', 0.25);

-- Produtos
INSERT INTO produtos (id, nome, categoria_id, preco_unitario_centavos, custo_centavos, ativo) VALUES
  (1, 'Notebook Pro 15', 1, 650000, 420000, 1),
  (2, 'Monitor UltraWide 29', 1, 140000, 91000, 1),
  (3, 'Teclado Mecânico RGB', 2, 35000, 17500, 1),
  (4, 'Mouse Sem Fio Ergonômico', 2, 18000, 9000, 1),
  (5, 'Cadeira Gamer Ergonômica', 3, 120000, 72000, 1),
  (6, 'Mesa Regulável Eletricamente', 3, 220000, 132000, 1),
  (7, 'Headset Noise Cancelling', 1, 85000, 55000, 1),
  (8, 'Webcam 4K Ultra HD', 1, 45000, 29000, 1),
  (9, 'Livro: Engenharia de Dados Moderna', 4, 9000, 6750, 1),
  (10, 'Livro: SQL para Negócios', 4, 7500, 5625, 1),
  (11, 'Suporte Articulado Monitor', 2, 22000, 11000, 1),
  (12, 'Mousepad Extra Grande', 2, 8000, 4000, 0);

-- Clientes
INSERT INTO clientes (id, nome, email, cidade, estado, data_cadastro) VALUES
  (1, 'Ana Clara Silva', 'ana.silva@email.com', 'São Paulo', 'SP', '2024-01-10'),
  (2, 'Bruno Henrique Costa', 'bruno.costa@email.com', 'Rio de Janeiro', 'RJ', '2024-01-15'),
  (3, 'Carla Cristina Souza', 'carla.souza@email.com', 'Belo Horizonte', 'MG', '2024-02-01'),
  (4, 'Diego Fernandes Lima', 'diego.lima@email.com', 'Curitiba', 'PR', '2024-02-18'),
  (5, 'Eduarda Martins Rocha', 'eduarda.rocha@email.com', 'Porto Alegre', 'RS', '2024-03-05'),
  (6, 'Felipe Augusto Santos', 'felipe.santos@email.com', 'Salvador', 'BA', '2024-03-12'),
  (7, 'Gabriela Pereira Neves', 'gabriela.neves@email.com', 'Recife', 'PE', '2024-04-02'),
  (8, 'Henrique Gabriel Ramos', 'henrique.ramos@email.com', 'Campinas', 'SP', '2024-04-14'),
  (9, 'Isabela Freitas Dias', 'isabela.dias@email.com', 'São Paulo', 'SP', '2024-05-01'),
  (10, 'João Pedro Guimarães', 'joao.guimaraes@email.com', 'Florianópolis', 'SC', '2024-05-20');

-- Pedidos
INSERT INTO pedidos (id, cliente_id, data_pedido, status, cupom_desconto) VALUES
  (1, 1, '2024-01-20 10:30:00', 'entregue', 'BEMVINDO10'),
  (2, 2, '2024-01-22 14:15:00', 'entregue', NULL),
  (3, 3, '2024-02-05 09:40:00', 'entregue', 'PROMO15'),
  (4, 4, '2024-02-25 16:20:00', 'cancelado', NULL),
  (5, 5, '2024-03-10 11:05:00', 'entregue', NULL),
  (6, 1, '2024-03-22 18:50:00', 'entregue', 'CLIENTEVIP'),
  (7, 6, '2024-04-05 13:10:00', 'entregue', NULL),
  (8, 7, '2024-04-18 15:45:00', 'entregue', NULL),
  (9, 8, '2024-05-02 08:30:00', 'pago', 'DESCONTO5'),
  (10, 9, '2024-05-15 17:00:00', 'enviado', NULL),
  (11, 2, '2024-05-28 12:40:00', 'entregue', NULL),
  (12, 10, '2024-06-02 10:15:00', 'pago', NULL);

-- Itens do Pedido
INSERT INTO itens_pedido (id, pedido_id, produto_id, quantidade, preco_praticado_centavos) VALUES
  (1, 1, 1, 1, 650000),
  (2, 1, 3, 1, 35000),
  (3, 2, 2, 2, 140000),
  (4, 2, 4, 1, 18000),
  (5, 3, 5, 1, 120000),
  (6, 3, 6, 1, 220000),
  (7, 4, 1, 1, 650000),
  (8, 5, 7, 2, 85000),
  (9, 5, 9, 3, 9000),
  (10, 6, 2, 1, 140000),
  (11, 6, 8, 1, 45000),
  (12, 6, 11, 1, 22000),
  (13, 7, 10, 4, 7500),
  (14, 7, 4, 2, 18000),
  (15, 8, 1, 1, 650000),
  (16, 8, 7, 1, 85000),
  (17, 9, 6, 1, 220000),
  (18, 9, 5, 1, 120000),
  (19, 10, 2, 1, 140000),
  (20, 10, 3, 2, 35000),
  (21, 11, 1, 1, 650000),
  (22, 11, 11, 2, 22000),
  (23, 12, 8, 2, 45000),
  (24, 12, 3, 1, 35000);
`;
