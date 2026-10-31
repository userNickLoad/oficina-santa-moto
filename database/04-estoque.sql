
CREATE TABLE IF NOT EXISTS modelo_estante(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(20) NOT NULL UNIQUE,
	qtd_colunas INT NOT NULL DEFAULT 1 CHECK (qtd_colunas >0),
	qtd_linhas INT NOT NULL DEFAULT 1 CHECK (qtd_linhas >0)
);


CREATE TABLE IF NOT EXISTS modelo_prateleira(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(20) NOT NULL UNIQUE,
	comprimento INT DEFAULT 10,
	largura INT DEFAULT 10,
	altura INT DEFAULT 10
);

CREATE TABLE IF NOT EXISTS modelo_prateleira_modelo_estante(
	id SERIAL PRIMARY KEY,
	id_modelo_prateleira INTEGER NOT NULL REFERENCES modelo_prateleira(id),
	id_modelo_estante INTEGER NOT NULL REFERENCES modelo_estante(id),
	coluna INT NOT NULL CHECK (coluna > 0),
	linha INT NOT NULL CHECK (linha > 0),
	CONSTRAINT uq_modelo_prateleira_modelo_estante_posicao
	UNIQUE(id_modelo_estante, coluna, linha)
);

CREATE OR REPLACE FUNCTION validar_posicao_modelo_estante()
RETURNS TRIGGER AS $$
	DECLARE
	    max_linhas INTEGER;
	    max_colunas INTEGER;
	BEGIN
	    SELECT qtd_linhas, qtd_colunas
	    INTO max_linhas, max_colunas
	    FROM modelo_estante
	    WHERE id = NEW.id_modelo_estante;
	
	    IF NEW.linha < 1 OR NEW.linha > max_linhas
	       OR NEW.coluna < 1 OR NEW.coluna > max_colunas THEN
	        RAISE EXCEPTION
	            'Posição (%, %) fora dos limites do modelo de estante',
	            NEW.linha, NEW.coluna;
	    END IF;
	
	    RETURN NEW;
	END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_posicao_modelo_estante
BEFORE INSERT OR UPDATE
ON modelo_prateleira_modelo_estante
FOR EACH ROW
EXECUTE FUNCTION validar_posicao_modelo_estante();


CREATE TABLE IF NOT EXISTS local(
	id SERIAL PRIMARY KEY,
	id_local INTEGER REFERENCES local(id),
	nome VARCHAR(20) NOT NULL,
	linha INT NOT NULL CHECK (linha > 0),
	coluna INT NOT NULL CHECK (coluna > 0),
	linhas INT NOT NULL DEFAULT 1 CHECK (linhas > 0),
	colunas INT NOT NULL DEFAULT 1 CHECK (colunas > 0),
	CONSTRAINT uq_local_posicao
	UNIQUE(id_local, linha, coluna)
);

CREATE OR REPLACE FUNCTION validar_posicao_local()
RETURNS TRIGGER AS $$
DECLARE
    max_linhas INTEGER;
    max_colunas INTEGER;
BEGIN
    -- Locais raiz não possuem pai
    IF NEW.id_local IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT linhas, colunas
    INTO max_linhas, max_colunas
    FROM local
    WHERE id = NEW.id_local;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Local pai % não encontrado', NEW.id_local;
    END IF;

    IF NEW.linha > max_linhas OR NEW.coluna > max_colunas THEN
        RAISE EXCEPTION
            'Posição (%, %) fora dos limites do local pai',
            NEW.linha, NEW.coluna;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_posicao_local
BEFORE INSERT OR UPDATE ON local
FOR EACH ROW
EXECUTE FUNCTION validar_posicao_local();


CREATE TABLE IF NOT EXISTS estante(
	id SERIAL PRIMARY KEY,
	id_modelo_estante INTEGER NOT NULL REFERENCES modelo_estante(id),
	id_local INTEGER NOT NULL REFERENCES local(id),
	linha INT NOT NULL CHECK (linha > 0),
	coluna INT NOT NULL CHECK (coluna > 0),
	CONSTRAINT uq_estante_local_posisao 
	UNIQUE(id_local, linha, coluna)
);

CREATE OR REPLACE FUNCTION validar_posicao_estante()
RETURNS TRIGGER AS $$
DECLARE
    max_linhas INTEGER;
    max_colunas INTEGER;
BEGIN
    SELECT linhas, colunas
    INTO max_linhas, max_colunas
    FROM local
    WHERE id = NEW.id_local;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Local % não encontrado', NEW.id_local;
    END IF;

    IF NEW.linha > max_linhas OR NEW.coluna > max_colunas THEN
        RAISE EXCEPTION
            'Posição (%, %) fora dos limites do local',
            NEW.linha, NEW.coluna;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_posicao_estante
BEFORE INSERT OR UPDATE ON estante
FOR EACH ROW
EXECUTE FUNCTION validar_posicao_estante();


CREATE TABLE IF NOT EXISTS prateleira(
	id SERIAL PRIMARY KEY,
	id_estante INTEGER NOT NULL REFERENCES estante(id),
	id_modelo_prateleira INTEGER NOT NULL REFERENCES modelo_prateleira(id),
	linha INT NOT NULL CHECK (linha > 0),
	coluna INT NOT NULL CHECK (coluna > 0),
	CONSTRAINT uq_prateleira_estante_local_posisao 
	UNIQUE(id_estante, linha, coluna)
);

CREATE OR REPLACE FUNCTION validar_posicao_prateleira()
RETURNS TRIGGER AS $$
	DECLARE
	    max_linhas INTEGER;
	    max_colunas INTEGER;
	BEGIN

	    SELECT me.qtd_linhas, me.qtd_colunas
	    INTO max_linhas, max_colunas
	    FROM estante AS e
	    JOIN modelo_estante AS me
	        ON me.id = e.id_modelo_estante
	    WHERE e.id = NEW.id_estante;
	
	    IF NEW.linha < 1 OR NEW.linha > max_linhas
	       OR NEW.coluna < 1 OR NEW.coluna > max_colunas THEN
	        RAISE EXCEPTION
	            '(prateleira) Posição (%, %) fora dos limites do modelo de estante',
	            NEW.linha, NEW.coluna;
	    END IF;
	
	    RETURN NEW;
	END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_posicao_prateleira
BEFORE INSERT OR UPDATE
ON prateleira
FOR EACH ROW
EXECUTE FUNCTION validar_posicao_prateleira();


CREATE TABLE IF NOT EXISTS produto_prateleira(
	id_produto INTEGER REFERENCES produto(id),
	id_prateleira INTEGER REFERENCES prateleira(id),
	quantidade INT NOT NULL CHECK (quantidade > 0),
	PRIMARY KEY(id_produto, id_prateleira)
);