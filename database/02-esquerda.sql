CREATE TABLE IF NOT EXISTS usuario (
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE,
	senha TEXT NOT NULL,
	email VARCHAR(100),
	telefone VARCHAR(14),
	ativo Boolean DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS permissao (
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS caminho (
	id SERIAL PRIMARY KEY,
	path TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS permissao_caminho(
	id_permissao INTEGER REFERENCES permissao(id),
	id_caminho INTEGER REFERENCES caminho(id),
	PRIMARY KEY(id_caminho, id_permissao)
);

CREATE INDEX IF NOT EXISTS idx_id_permissao ON permissao_caminho(id_permissao);


CREATE TABLE IF NOT EXISTS usuario_permissao (
	id_usuario INTEGER REFERENCES usuario(id),
	id_permissao INTEGER REFERENCES permissao(id),
	PRIMARY KEY (id_usuario, id_permissao)
);


CREATE TABLE IF NOT EXISTS fornecedor(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE,
	telefone VARCHAR(14),
	link_site VARCHAR(250),
	email VARCHAR(100),
	descricao VARCHAR(500)
);


CREATE TABLE IF NOT EXISTS compra(
	id SERIAL PRIMARY KEY,
	id_usuario INTEGER NOT NULL REFERENCES usuario(id),
	id_fornecedor INTEGER REFERENCES fornecedor(id),
	data TIMESTAMPTZ NOT NULL
);


CREATE TABLE IF NOT EXISTS produto_compra(
	id_produto INTEGER NOT NULL REFERENCES produto(id),
	id_compra INTEGER NOT NULL REFERENCES compra(id),
	preco_compra NUMERIC(10,2) NOT NULL CHECK (preco_compra >= 0),
	qtd_comprado INT NOT NULL DEFAULT 0 CHECK (qtd_comprado >= 0),
	PRIMARY KEY(id_produto, id_compra)
);