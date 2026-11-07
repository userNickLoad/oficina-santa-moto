CREATE TABLE IF NOT EXISTS marca(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE,
	imagem TEXT
);

CREATE TABLE IF NOT EXISTS categoria(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(50) NOT NULL UNIQUE,
	descricao VARCHAR(250)
); 


CREATE TABLE IF NOT EXISTS atributo(
	id SERIAL PRIMARY KEY,
	id_categoria INTEGER NOT NULL REFERENCES categoria(id),
	nome VARCHAR(20) NOT NULL,
	obrigatorio BOOLEAN NOT NULL,
	numerico BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_atributo_nome ON atributo(nome);

CREATE TABLE IF NOT EXISTS produto(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	preco_venda NUMERIC(10,2) NOT NULL CHECK (qtd_disponivel >= 0),
	qtd_disponivel INT NOT NULL DEFAULT 0 CHECK (qtd_disponivel >= 0),
	codigo_barras TEXT,
	descricao TEXT,
	alerta_quantidade INT DEFAULT 0 CHECK (alerta_quantidade >= 0),
	comprimento INT DEFAULT 10 CHECK (comprimento > 0),
	largura INT DEFAULT 10 CHECK (largura > 0),
	altura INT DEFAULT 10 CHECK (altura > 0),
	id_categoria INTEGER REFERENCES categoria(id),
	id_marca INTEGER REFERENCES marca(id)
);

CREATE TABLE IF NOT EXISTS imagem (
	id SERIAL PRIMARY KEY,
	caminho TEXT
);

CREATE TABLE IF NOT EXISTS produto_imagem(
	id_produto INTEGER REFERENCES produto(id),
	id_imagem INTEGER UNIQUE REFERENCES imagem(id),
	PRIMARY KEY(id_produto, id_imagem)
);

CREATE INDEX IF NOT EXISTS idx_produto_nome ON produto(nome);
CREATE INDEX IF NOT EXISTS idx_produto_id_categoria ON produto(id_categoria);
CREATE INDEX IF NOT EXISTS idx_produto_id_marca ON produto(id_marca);


CREATE TABLE IF NOT EXISTS produto_atributo(
	id_produto INTEGER REFERENCES produto(id),
	id_atributo INTEGER REFERENCES atributo(id),
	valor_texto TEXT,
	valor_numerico NUMERIC,
	PRIMARY KEY(id_atributo, id_produto),
	CONSTRAINT chk_produto_atributo_valor_tipo CHECK (
	    (valor_texto IS NOT NULL AND valor_numerico IS NULL)
	    OR
	    (valor_texto IS NULL AND valor_numerico IS NOT NULL)
	)
);

CREATE OR REPLACE FUNCTION validar_atributo_tipo() 
RETURNS TRIGGER AS $$
	DECLARE
		v_numerico BOOLEAN;
		v_nome_atributo VARCHAR(20);
	BEGIN

    SELECT a.numerico, a.nome
    INTO v_numerico, v_nome_atributo
    FROM atributo AS a
    WHERE a.id = NEW.id_atributo;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Atributo com ID % não encontrado',
            NEW.id_atributo;
    END IF;

    IF v_numerico AND NEW.valor_numerico IS NULL THEN
        RAISE EXCEPTION
            'Atributo "%" deve receber um valor numérico',
            v_nome_atributo;

    ELSIF NOT v_numerico AND NEW.valor_texto IS NULL THEN
        RAISE EXCEPTION
            'Atributo "%" deve receber um valor textual',
            v_nome_atributo;
    END IF;

		RETURN NEW;
	END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_atributo_tipo
BEFORE INSERT OR UPDATE 
ON produto_atributo
FOR EACH ROW
EXECUTE FUNCTION validar_atributo_tipo();
