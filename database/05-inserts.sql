INSERT INTO permissao (nome) VALUES ('admin');
INSERT INTO caminho (path) VALUES ('/');
INSERT INTO permissao_caminho (id_caminho, id_permissao) values (1, 1);

INSERT INTO usuario ('nome', 'senha')
VALUES ('teste', '$argon2id$v=19$m=19456,p=1,t=2$8ZgUPaTytbRSEJTG1Erdjw$zFjVuKjmvqXfZW6Ju9whqV3S7NKUd7DBXP9IOXcZtZQ');

INSERT INTO usuario_permissao ('id_usuario', 'id_permissao')
VALUES (1, 1);