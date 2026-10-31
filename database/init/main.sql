-- Database: santa_moto

-- DROP DATABASE IF EXISTS santa_moto;

-- CREATE DATABASE santa_moto
--     WITH
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'C.UTF-8'
--     LC_CTYPE = 'C.UTF-8'
--     LOCALE_PROVIDER = 'libc'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1
--     IS_TEMPLATE = False;


-- \ir ../00-drop.sql

-- \ir ../01-principais.sql
-- \ir ../02-esquesda.sql
-- \ir ../03-vendas.sql
-- \ir ../04-estoque.sql

-- Database: santa_moto

\ir /database/00-drop.sql
\ir /database/01-principais.sql
\ir /database/02-esquerda.sql
\ir /database/03-venda.sql
\ir /database/04-estoque.sql

