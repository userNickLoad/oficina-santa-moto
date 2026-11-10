
CREATE TABLE IF NOT EXISTS cliente(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	telefone VARCHAR(14),
	email VARCHAR(100)
);


CREATE TABLE IF NOT EXISTS modelo(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(20) NOT NULL,
	id_marca INTEGER NOT NULL REFERENCES marca(id),
	UNIQUE (id_marca, nome)
);


CREATE TABLE IF NOT EXISTS veiculo(
	id SERIAL PRIMARY KEY,
	ano INT NOT NULL,
	id_modelo INTEGER NOT NULL REFERENCES modelo(id)
);


CREATE TABLE IF NOT EXISTS venda(
	id SERIAL PRIMARY KEY,
	data TIMESTAMPTZ NOT NULL,
	preco_total NUMERIC(10,2) NOT NULL,
	id_usuario INTEGER NOT NULL REFERENCES usuario(id), 
	id_cliente INTEGER REFERENCES cliente(id)
);



CREATE TABLE IF NOT EXISTS venda_produto(
	id_venda INTEGER NOT NULL REFERENCES venda(id),
	id_produto INTEGER NOT NULL REFERENCES produto(id),
	quantidade INT NOT NULL CHECK (quantidade > 0),
	preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0.0),
	PRIMARY KEY(id_venda, id_produto)
);


CREATE TABLE IF NOT EXISTS servico(
	id SERIAL PRIMARY KEY,
	descricao TEXT,
	preco NUMERIC(10,2) NOT NULL 
        CHECK (preco >= 0),
	id_cliente INTEGER REFERENCES cliente(id),
	id_veiculo INTEGER REFERENCES veiculo(id),
	status VARCHAR(20) /*concluido/finalizado*/
);


CREATE TABLE IF NOT EXISTS servico_venda(
	id_servico INTEGER REFERENCES servico(id),
	id_venda INTEGER REFERENCES venda(id),
	PRIMARY KEY(id_servico, id_venda)
);