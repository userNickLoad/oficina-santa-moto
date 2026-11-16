INSERT INTO permissao (nome) VALUES ('admin');
INSERT INTO caminho (path) VALUES ('/');
INSERT INTO permissao_caminho (id_caminho, id_permissao) values (1, 1);

INSERT INTO usuario (nome, senha)
VALUES ('teste', '$argon2id$v=19$m=19456,p=1,t=2$8ZgUPaTytbRSEJTG1Erdjw$zFjVuKjmvqXfZW6Ju9whqV3S7NKUd7DBXP9IOXcZtZQ');

INSERT INTO usuario_permissao (id_usuario, id_permissao)
VALUES (1, 1);

INSERT INTO public.produto (
    nome,
    preco_venda,
    qtd_disponivel
)
VALUES (
    'Pastilha de freio',
    80.00,
    10
);

INSERT INTO local (nome, colunas, linhas) VALUES 
('estoque', 4, 5);

insert into modelo_prateleira (nome) values ('padrão');

insert into modelo_estante (nome, qtd_linhas, qtd_colunas ) values ('padrão', 9, 1);

insert into modelo_prateleira_modelo_estante (id_modelo_estante, id_modelo_prateleira, linha, coluna) values 
(1, 1, 1, 1),
(1, 1, 2, 1),
(1, 1, 3, 1),
(1, 1, 4, 1),
(1, 1, 5, 1),
(1, 1, 6, 1),
(1, 1, 7, 1),
(1, 1, 8, 1),
(1, 1, 9, 1);

insert into estante (id_local, id_modelo_estante, coluna, linha) values
(1, 1, 1, 1),
(1, 1, 1, 2),
(1, 1, 1, 3),
(1, 1, 1, 4),
(1, 1, 1, 5),
(1, 1, 2, 1),
(1, 1, 2, 2),
(1, 1, 2, 3),
(1, 1, 2, 4),
(1, 1, 2, 5),
(1, 1, 3, 1),
(1, 1, 3, 2),
(1, 1, 3, 3),
(1, 1, 3, 4),
(1, 1, 3, 5),
(1, 1, 4, 1),
(1, 1, 4, 2),
(1, 1, 4, 3),
(1, 1, 4, 4),
(1, 1, 4, 5);
