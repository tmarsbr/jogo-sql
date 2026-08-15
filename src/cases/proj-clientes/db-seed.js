/**
 * db-seed.js — Schema DDL e Seed SQL do Projeto 06: Gestão de Clientes
 */

export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE segmentos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT
);

CREATE TABLE planos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  mensalidade_centavos INTEGER NOT NULL
);

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  segmento_id INTEGER NOT NULL REFERENCES segmentos(id),
  plano_id INTEGER NOT NULL REFERENCES planos(id),
  data_cadastro TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ativo', 'inativo', 'cancelado'))
);

CREATE TABLE compras (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  valor_centavos INTEGER NOT NULL,
  data_compra TEXT NOT NULL,
  canal TEXT NOT NULL
);

CREATE TABLE tickets_atendimento (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data_abertura TEXT NOT NULL,
  motivo TEXT NOT NULL,
  resolvido INTEGER NOT NULL
);
`;

export const SEED_SQL = `
-- Segmentos
INSERT INTO segmentos (id, nome, descricao) VALUES
  (1, 'Enterprise', 'Grandes empresas e clientes corporativos de alto valor'),
  (2, 'PME', 'Pequenas e médias empresas em crescimento'),
  (3, 'Individual', 'Pessoas físicas e profissionais autônomos'),
  (4, 'Startup', 'Empresas em estágio inicial e incubadoras');

-- Planos
INSERT INTO planos (id, nome, mensalidade_centavos) VALUES
  (1, 'Starter', 4900),
  (2, 'Professional', 14900),
  (3, 'Enterprise Gold', 49900),
  (4, 'Enterprise Platinum', 99900);

-- Clientes
INSERT INTO clientes (id, nome, email, segmento_id, plano_id, data_cadastro, status) VALUES
  (1, 'TechCorp Soluções', 'contato@techcorp.com.br', 1, 4, '2023-01-10', 'ativo'),
  (2, 'Nexus Logística Integrada', 'diretoria@nexuslog.com', 1, 3, '2023-03-15', 'ativo'),
  (3, 'Padaria & Confeitaria Pão Dourado', 'contato@paodourado.com', 2, 2, '2023-05-20', 'ativo'),
  (4, 'Studio Foto & Arte', 'studio@fotoearte.com', 3, 1, '2023-06-01', 'inativo'),
  (5, 'Fintech Fácil Pagamentos', 'ops@fintechfacil.io', 4, 3, '2023-08-12', 'ativo'),
  (6, 'Consultoria Silva & Associados', 'silva@consultoriasilva.com', 2, 2, '2023-09-05', 'ativo'),
  (7, 'Mariana Oliveira Designer', 'mariana@designer.me', 3, 1, '2023-11-10', 'cancelado'),
  (8, 'BioHealth Medicamentos', 'compras@biohealth.com', 1, 4, '2024-01-15', 'ativo'),
  (9, 'Agência Viral Marketing', 'growth@agenciaviral.com', 4, 2, '2024-02-01', 'ativo'),
  (10, 'Supermercado Central Ltda', 'gestao@supercentral.com', 1, 3, '2024-03-10', 'ativo');

-- Compras adicionais / Upgrades / Serviços
INSERT INTO compras (id, cliente_id, valor_centavos, data_compra, canal) VALUES
  (1, 1, 350000, '2024-01-15 10:00:00', 'consultor'),
  (2, 1, 420000, '2024-02-18 14:30:00', 'consultor'),
  (3, 1, 180000, '2024-04-05 11:20:00', 'web'),
  (4, 2, 250000, '2024-01-20 16:45:00', 'web'),
  (5, 2, 290000, '2024-03-22 09:15:00', 'consultor'),
  (6, 3, 45000, '2024-02-10 13:00:00', 'web'),
  (7, 3, 52000, '2024-04-14 15:10:00', 'web'),
  (8, 4, 15000, '2023-06-15 18:00:00', 'web'),
  (9, 5, 120000, '2024-01-10 10:30:00', 'app'),
  (10, 5, 175000, '2024-03-01 14:00:00', 'web'),
  (11, 5, 210000, '2024-05-18 17:20:00', 'consultor'),
  (12, 6, 85000, '2024-02-25 11:00:00', 'web'),
  (13, 8, 550000, '2024-02-01 09:00:00', 'consultor'),
  (14, 8, 620000, '2024-04-20 16:00:00', 'consultor'),
  (15, 9, 95000, '2024-03-15 10:45:00', 'web'),
  (16, 10, 310000, '2024-04-10 15:30:00', 'consultor');

-- Tickets de Atendimento
INSERT INTO tickets_atendimento (id, cliente_id, data_abertura, motivo, resolvido) VALUES
  (1, 1, '2024-01-22 09:10:00', 'Dúvida sobre integração via API', 1),
  (2, 4, '2023-08-10 14:20:00', 'Solicitação de cancelamento de plano', 1),
  (3, 4, '2023-09-01 11:00:00', 'Cobrança indevida', 1),
  (4, 5, '2024-02-15 16:40:00', 'Erro 500 no webhook de pagamentos', 1),
  (5, 7, '2023-11-20 10:15:00', 'Instabilidade no painel', 0),
  (6, 7, '2023-12-05 15:30:00', 'Pedido de reembolso', 1),
  (7, 8, '2024-03-02 08:50:00', 'Upgrade de infraestrutura dedicada', 1),
  (8, 9, '2024-04-12 17:00:00', 'Dúvida sobre limite de envios', 1);
`;
