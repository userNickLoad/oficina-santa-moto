DROP FUNCTION IF EXISTS validar_posicao_modelo_estante();
DROP FUNCTION IF EXISTS validar_posicao_local();
DROP FUNCTION IF EXISTS validar_posicao_estante();
DROP FUNCTION IF EXISTS validar_posicao_prateleira();

-- =========================================
-- 3. REMOVER TABELAS ASSOCIATIVAS E DEPENDENTES
-- =========================================
DROP TABLE IF EXISTS permissao_caminho;
DROP TABLE IF EXISTS produto_imagem;
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

DROP TABLE IF EXISTS imagem;
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
DROP TABLE IF EXISTS caminho;
DROP TABLE IF EXISTS atributo;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS marca;