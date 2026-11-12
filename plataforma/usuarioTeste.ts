import { UsuarioModel } from "./src/model/usuarioModel.js";

const usuarioModel = new UsuarioModel();

async function criarUsuarioTeste() {
    try {
        const usuario = await usuarioModel.singUsuarioUp(
            {
                nome: "teste",
                senha: "Teste@123",
                email: "teste@example.com",
                telefone: null
            },
            [{ id: 1, nome: "admin" }]
        );

        console.log("Usuário criado com sucesso:", usuario.nome);
    } catch (erro) {
        console.error("Erro ao criar usuário:", erro);
        process.exitCode = 1;
    }
}

await criarUsuarioTeste();
