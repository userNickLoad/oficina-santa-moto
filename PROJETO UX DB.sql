DROP TABLE IF EXISTS marca;
CREATE TABLE IF NOT EXISTS marca(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE,
	imagem TEXT
);

CREATE INDEX IF NOT EXISTS idx_marca_nome ON marca(nome);

DROP TABLE IF EXISTS categoria;
CREATE TABLE IF NOT EXISTS categoria(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(50) NOT NULL UNIQUE,
	descricao VARCHAR(250)
); 


CREATE INDEX IF NOT EXISTS idx_categoria_nome ON categoria(nome);

DROP TABLE IF EXISTS atributos;
CREATE IF NOT EXISTS atributos(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(20) NOT NULL,
	obrigatorio BOOLEAN NOT NULL,
	numerico BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_atributos_nome ON atributos(nome);

DROP TABLE IF EXISTS produto;
CREATE TABLE IF NOT EXISTS produto(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	preco_venda FLOAT NOT NULL,
	qtd_disponivel INT NOT NULL DEFAULT 0 CHECK (qtd_disponivel >= 0),
	codigo_barras TEXT,
	imagem TEXT,
	descricao TEXT,
	alerta_quantidade DEFAULT 0 CHECK (qtd_disponivel >= 0),
	comprimento INT DEFAULT 10,
	largura INT DEFAULT 10,
	altura INT DEFAULT 10,
	id_categoria INTEGER REFERENCES categoria(id);
	id_marca INTEGER REFERENCES marca(id),
);

DROP TABLE IF EXISTS produto_atributo;
CREATE TABLE IF NOT EXISTS produto_atributo(
	id_produto INTEGER REFERENCES produto(id),
	id_atributo INTEGER REFERENCES atributo(id),
	valor_texto TEXT,
	valor_numerico NUMERIC ,
	PRIMARY KEY(id_produto, id_atributo)
);







--ESQUERDA ->

DROP TABLE IF EXISTS usuario;
CREATE TABLE IF NOT EXISTS usuario (
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE,
	senha CHAR(50) NOT NULL,
	email VARCHAR(100),
	telefone VARCHAR(14) 
);

CREATE INDEX IF NOT EXISTS idx_usuario_nome ON usuario(nome);

DROP TABLE IF EXISTS permisao;
CREATE TABLE IF NOT EXISTS permissao (
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE
);


CREATE INDEX IF NOT EXISTS idx_permissao_nome ON permissao(nome);

DROP TABLE IF EXISTS usuario_permissao;
CREATE TABLE IF NOT EXISTS usuario_permissao (
	id_usuario INTEGER REFERENCES usuario(id),
	id_permissao INTEGER REFERENCES permissao(id),
	PRIMARY KEY (id_usuario, id_permissao)
);

DROP TABLE IF EXISTS fornecedor;
CREATE TABLE IF NOT EXISTS fornecedor(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE,
	telefone VARCHAR(14),
	link_site VARCHAR(250),
	email VARCHAR(100),
	descricao VARCHAR(500)
);

CREATE INDEX IF NOT EXISTS idx_fornecedor_nome ON fornecedor(nome);

DROP TABLE IF EXISTS compra;
CREATE TABLE IF NOT EXISTS compra(
	id SERIAL PRIMARY KEY,
	id_usuario INTEGER NOT NULL REFERENCES usuario(id),
	id_fornecedor INTEGER REFERENCES fornecedor(id),
	data TIMESTAMPTZ NOT NULL,
);

DROP TABLE IF EXISTS produto_compra;
CREATE TABLE IF NOT EXISTS produto_compra(
	id_produto INTEGER NOT NULL,
	id_compra INTEGER NOT NULL,
	preco_compra FLOAT NOT NULL,
	qtd_comprado INT NOT NULL DEFAULT 0 CHECK (qtd_vendido >= 0),
	PRIMARY KEY(id_produto, id_compra)
);






---Venda ->

DROP TABLE IF EXISTS cliente;
CREATE TABLE IF NOT EXISTS cliente(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	telefone VARCHAR(14),
	email VARCHAR(100)
);

DROP TABLE IF EXISTS modelo;
CREATE TABLE IF NOT EXISTS modelo(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(20) NOT NULL UNIQUE,
	id_marca INTEGE NOT NULL REFERENCES marca(id)
);

DROP TABLE IF EXISTS veiculo;
CREATE TABLE IF NOT EXISTS veiculo(
	id SERIAL PRIMARY KEY,
	ano INT NOT NULL,
	id_modelo NOT NULL REFERENCES veiculo(id)
);

DROP TABLE IF EXISTS venda;
CREATE TABLE IF NOT EXISTS venda(
	id SERIAL PRIMARY KEY,
	data TIMESTAMPTZ NOT NULL,
	preco_total FLOAT NOT NULL
	id_usuario INTEGER NOT NULL REFERENCES cliente(id), 
	id_cliente INTEGER REFERENCES cliente(id)
);


DROP TABLE IF EXISTS venda_produto;
CREATE TABLE IF NOT EXISTS venda_produto(
	id_venda INTEGER NOT NULL,
	id_produto INTEGER NOT NULL,
	quantidade INT NOT NULL CHECK (quantidade >= 0),
	preco FLOAT NOT NULL CHECK (preco >= 0.0),
	PRIMARY KEY(id_venda, id_produto)
);

DROP TABLE IF EXISTS servico;
CREATE TABLE IF NOT EXISTS servico(
	id SERIAL PRIMARY KEY,
	descricao TEXT,
	preco FLOAT NOT NULL,
	id_cliente INTEGER REFERENCES cliente(id),
	id_veiculo INTEGER REFERENCES veiculo(id),
);




-- ESTOQUE ->

DROP TABLE IF EXISTS estante;
CREATE TABLE IF NOT EXISTS estante(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(20) NOT NULL UNIQUE,
	qtd_colunas INT NOT NULL DEFAULT 0 CHECK (qtd_colunas >= 0),
	qtd_linhas INT NOT NULL DEFAULT 0 CHECK (qtd_colunas >= 0),
);


DROP TABLE IF EXISTS prateleira;
CREATE TABLE IF EXISTS prateleira(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(20) NOT NULL UNIQUE,
	comprimento INT DEFAULT 10,
	largura INT DEFAULT 10,
	altura INT DEFAULT 10
);

DROP TABLE IF EXISTS prateleira_estante;
CREATE TABLE IF NOT EXISTS prateleira_estante(
	id SERIAL PRIMARY KEY,
	id_prateleira INTEGER NOT NULL REFERENCES prateleira(id),
	id_estante INTEGER NOT NULL REFERENCES estante(id),
	coluna INT NOT NULL 
);
