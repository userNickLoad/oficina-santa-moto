-- Database: santa_moto

-- DROP DATABASE IF EXISTS santa_moto;

-- CREATE DATABASE santa_moto
--     WITH
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'Portuguese_Brazil.1252'
--     LC_CTYPE = 'Portuguese_Brazil.1252'
--     LOCALE_PROVIDER = 'libc'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1
--     IS_TEMPLATE = False;

DROP FUNCTION IF EXISTS validar_posicao_modelo_estante();
DROP FUNCTION IF EXISTS validar_posicao_local();
DROP FUNCTION IF EXISTS validar_posicao_estante();
DROP FUNCTION IF EXISTS validar_posicao_prateleira();]

-- =========================================
-- 3. REMOVER TABELAS ASSOCIATIVAS E DEPENDENTES
-- =========================================

DROP TABLE IF EXISTS produto_prateleira;
DROP TABLE IF EXISTS prateleira;
DROP TABLE IF EXISTS estante;
DROP TABLE IF EXISTS modelo_prateleira_modelo_estante;

DROP TABLE IF EXISTS produto_compra;
DROP TABLE IF EXISTS venda_produto;
DROP TABLE IF EXISTS servico_venda;
DROP TABLE IF EXISTS usuario_permissao;
DROP TABLE IF EXISTS produto_atributo;


-- =========================================
-- 4. REMOVER TABELAS DE OPERAÇÕES
-- =========================================

DROP TABLE IF EXISTS compra;
DROP TABLE IF EXISTS servico;
DROP TABLE IF EXISTS venda;
DROP TABLE IF EXISTS veiculo;


-- =========================================
-- 5. REMOVER TABELAS DE PRODUTOS E ESTOQUE
-- =========================================

DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS modelo;

DROP TABLE IF EXISTS local;
DROP TABLE IF EXISTS modelo_prateleira;
DROP TABLE IF EXISTS modelo_estante;


-- =========================================
-- 6. REMOVER TABELAS DE CADASTRO
-- =========================================

DROP TABLE IF EXISTS fornecedor;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS permissao;
DROP TABLE IF EXISTS atributo;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS marca;


DROP TABLE IF EXISTS marca;
CREATE TABLE IF NOT EXISTS marca(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE,
	imagem TEXT
);

DROP TABLE IF EXISTS categoria;
CREATE TABLE IF NOT EXISTS categoria(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(50) NOT NULL UNIQUE,
	descricao VARCHAR(250)
); 

DROP TABLE IF EXISTS atributo;
CREATE TABLE IF NOT EXISTS atributo(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(20) NOT NULL,
	obrigatorio BOOLEAN NOT NULL,
	numerico BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_atributo_nome ON atributo(nome);

DROP TABLE IF EXISTS produto;
CREATE TABLE IF NOT EXISTS produto(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	preco_venda NUMERIC(10,2) NOT NULL CHECK (qtd_disponivel >= 0),
	qtd_disponivel INT NOT NULL DEFAULT 0 CHECK (qtd_disponivel >= 0),
	codigo_barras TEXT,
	imagem TEXT,
	descricao TEXT,
	alerta_quantidade INT DEFAULT 0 CHECK (alerta_quantidade >= 0),
	comprimento INT DEFAULT 10 CHECK (comprimento > 0),
	largura INT DEFAULT 10 CHECK (largura > 0),
	altura INT DEFAULT 10 CHECK (altura > 0),
	id_categoria INTEGER REFERENCES categoria(id),
	id_marca INTEGER REFERENCES marca(id)
);

CREATE INDEX IF NOT EXISTS idx_produto_nome ON produto(nome);
CREATE INDEX IF NOT EXISTS idx_produto_id_categoria ON produto(id_categoria);
CREATE INDEX IF NOT EXISTS idx_produto_id_marca ON produto(id_marca);


DROP TABLE IF EXISTS produto_atributo;
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




--ESQUERDA ->

DROP TABLE IF EXISTS usuario;
CREATE TABLE IF NOT EXISTS usuario (
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE,
	senha TEXT NOT NULL,
	email VARCHAR(100),
	telefone VARCHAR(14) 
);

DROP TABLE IF EXISTS permisao;
CREATE TABLE IF NOT EXISTS permissao (
	id SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL UNIQUE
);

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

DROP TABLE IF EXISTS compra;
CREATE TABLE IF NOT EXISTS compra(
	id SERIAL PRIMARY KEY,
	id_usuario INTEGER NOT NULL REFERENCES usuario(id),
	id_fornecedor INTEGER REFERENCES fornecedor(id),
	data TIMESTAMPTZ NOT NULL
);

DROP TABLE IF EXISTS produto_compra;
CREATE TABLE IF NOT EXISTS produto_compra(
	id_produto INTEGER NOT NULL REFERENCES produto(id),
	id_compra INTEGER NOT NULL REFERENCES compra(id),
	preco_compra NUMERIC(10,2) NOT NULL CHECK (preco_compra >= 0),
	qtd_comprado INT NOT NULL DEFAULT 0 CHECK (qtd_comprado >= 0),
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
	nome VARCHAR(20) NOT NULL,
	id_marca INTEGER NOT NULL REFERENCES marca(id),
	UNIQUE (id_marca, nome)
);

DROP TABLE IF EXISTS veiculo;
CREATE TABLE IF NOT EXISTS veiculo(
	id SERIAL PRIMARY KEY,
	ano INT NOT NULL,
	id_modelo INTEGER NOT NULL REFERENCES modelo(id)
);

DROP TABLE IF EXISTS venda;
CREATE TABLE IF NOT EXISTS venda(
	id SERIAL PRIMARY KEY,
	data TIMESTAMPTZ NOT NULL,
	preco_total NUMERIC(10,2) NOT NULL,
	id_usuario INTEGER NOT NULL REFERENCES usuario(id), 
	id_cliente INTEGER REFERENCES cliente(id)
);


DROP TABLE IF EXISTS venda_produto;
CREATE TABLE IF NOT EXISTS venda_produto(
	id_venda INTEGER NOT NULL REFERENCES venda(id),
	id_produto INTEGER NOT NULL REFERENCES produto(id),
	quantidade INT NOT NULL CHECK (quantidade > 0),
	preco NUMERIC(10,2) NOT NULL CHECK (preco >= 0.0),
	PRIMARY KEY(id_venda, id_produto)
);

DROP TABLE IF EXISTS servico;
CREATE TABLE IF NOT EXISTS servico(
	id SERIAL PRIMARY KEY,
	descricao TEXT,
	preco NUMERIC(10,2) NOT NULL 
        CHECK (preco >= 0),
	id_cliente INTEGER REFERENCES cliente(id),
	id_veiculo INTEGER REFERENCES veiculo(id)
);

DROP TABLE IF EXISTS servico_venda;
CREATE TABLE IF NOT EXISTS servico_venda(
	id_servico INTEGER REFERENCES servico(id),
	id_venda INTEGER REFERENCES venda(id),
	PRIMARY KEY(id_servico, id_venda)
);



-- ESTOQUE ->

DROP TABLE IF EXISTS modelo_estante;
CREATE TABLE IF NOT EXISTS modelo_estante(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(20) NOT NULL UNIQUE,
	qtd_colunas INT NOT NULL DEFAULT 1 CHECK (qtd_colunas >0),
	qtd_linhas INT NOT NULL DEFAULT 1 CHECK (qtd_linhas >0)
);


DROP TABLE IF EXISTS modelo_prateleira;
CREATE TABLE IF NOT EXISTS modelo_prateleira(
	id SERIAL PRIMARY KEY,
	nome VARCHAR(20) NOT NULL UNIQUE,
	comprimento INT DEFAULT 10,
	largura INT DEFAULT 10,
	altura INT DEFAULT 10
);

DROP TABLE IF EXISTS modelo_prateleira_modelo_estante;
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




DROP TABLE IF EXISTS local;
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

DROP TRIGGER IF EXISTS trg_validar_posicao_local ON local;
CREATE TRIGGER trg_validar_posicao_local
BEFORE INSERT OR UPDATE ON local
FOR EACH ROW
EXECUTE FUNCTION validar_posicao_local();



DROP TABLE IF EXISTS estante;
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

DROP TRIGGER IF EXISTS trg_validar_posicao_estante ON estante;
CREATE TRIGGER trg_validar_posicao_estante
BEFORE INSERT OR UPDATE ON estante
FOR EACH ROW
EXECUTE FUNCTION validar_posicao_estante();



DROP TABLE IF EXISTS prateleira;
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


DROP TRIGGER IF EXISTS trg_validar_posicao_prateleira ON prateleira;
CREATE TRIGGER trg_validar_posicao_prateleira
BEFORE INSERT OR UPDATE
ON prateleira
FOR EACH ROW
EXECUTE FUNCTION validar_posicao_prateleira();




DROP TABLE IF EXISTS produto_prateleira;
CREATE TABLE IF NOT EXISTS produto_prateleira(
	id_produto INTEGER REFERENCES produto(id),
	id_prateleira INTEGER REFERENCES prateleira(id),
	quantidade INT NOT NULL CHECK (quantidade > 0),
	PRIMARY KEY(id_produto, id_prateleira)
);






