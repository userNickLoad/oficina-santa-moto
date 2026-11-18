import { FormFill } from "../model/errors.js";
import { UsuarioModel, Usuario, UsuarioEntraDTO, UsuarioIncorreto, UsuarioCadastroDTO, UsuarioJaExiste, UsuarioUpdateDTO } from "../model/usuarioModel.js";
import { Request, Response } from "express";
import db from "../database/prisma.js";

const usuarioModel = new UsuarioModel();

class UsuarioController{
    async getUsuarioById(req: Request, res: Response){
        try{
            const id = Number(req.params.id);
            const usuario: Usuario | null = await usuarioModel.getUsuarioById(id);

            if(usuario == null){
                return res.status(404).json({"mensagem": "usuario não encontrado"});

            }

            return res.status(200).json(usuario);
        }catch(e){
            console.log(e);

            return res.status(501).json({"mensagem": "algo deu errado"});
        }
    }

    async listarFuncionarios(req: Request, res: Response){
        try{
            const funcionarios = await usuarioModel.getFuncionario();

            return res.status(200).render("./layouts/index", {
                title: "Gerenciar funcionários",
                userName: res.locals.usuario.nome,
                permissoes: res.locals.usuario.permissoes,
                content: "../pages/funcionarios",
                innerContent: {
                    funcionarios
                },
                voltar: true
            });
        } catch(e){
            console.log(e);
            return res.status(500).send("Não foi possível carregar os funcionarios");
        }
    }

    async entrar(req: Request, res: Response){
        try{
            const usuario: UsuarioEntraDTO = req.body;

            const token = await usuarioModel.singUsuarioIn(usuario)
            return res.status(200).cookie("session_id", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 1000
            }).json({
                mensagem: "Login realizado com sucesso",
                redirect: "/"
            });

        }catch(e){
            if(e instanceof UsuarioIncorreto){
                console.log(e);
                return res.status(403).json({"mensagem": e.message});
            }

            return res.status(501).json({"mensagem": "algo deu errado"});
        }
    }

    async cadastrar(req: Request, res: Response){
        try{
            const usuario: UsuarioCadastroDTO = req.body;

            await usuarioModel.singUsuarioUp(usuario, [{id: 1, nome: "admin"}])
            return res.status(200).redirect("/entrar");

        }catch(e){
            console.log(e)
            if(e instanceof UsuarioJaExiste){
                return res.status(403).json({"mensagem": e.message});
            }

            return res.status(501).json({"mensagem": "algo deu errado"});
        }
    }

    async update(req: Request, res: Response){
        try{
            const id = Number(res.locals.usuario.userId ?? "")
            const token = req.cookies.session_id;
            const {senhaRepeate = null, passwordOld, ...dados} = req.body;

            if(id < 1 || typeof token != "string")
                return res.status(400).json({mensagem: "id do usuario n encontrado, faça login seu hackerzinho"})

            if(!passwordOld)
                return res.status(400).json({mensagem: "a senha antiga deve ser informada"})

            if(!passwordOld)
                return res.status(400).json({mensagem: "a senha antiga deve ser informada"})

            const usuario: UsuarioUpdateDTO = dados;
            usuario.id = id;

            if(usuario.telefone){
                usuario.telefone = "+55"+usuario.telefone.replace("(", "").replace(")", "").replace(" ", "").replace("-", "")
            }

            const result = await usuarioModel.update(usuario, passwordOld, token)

            console.log(result)

            return res.status(200).json({redirect: "/"});

        }catch(e){
            console.log(e)
            if(e instanceof UsuarioJaExiste || e instanceof FormFill){
                return res.status(403).json({"mensagem": e.message});
            }

            return res.status(501).json({"mensagem": "algo deu errado"});
        }

    }

    async cadastrarFuncionario(req: Request, res: Response) {
        try {
            const { permissao, ...dados } = req.body;

            if(typeof dados.nome !== "string" || !dados.nome.trim() || typeof dados.senha !== "string" || dados.senha.length < 8){
                return res.status(400).json({
                    mensagem: "Informe um nome válido e uma senha com pelo menos 8 caracteres"
                });
            }

            const usuario: UsuarioCadastroDTO = {
                nome: dados.nome,
                senha: dados.senha,
                email: dados.email || null,
                telefone: typeof dados.telefone === "string" ? dados.telefone.replace(/\D/g, "") || null : null,
                ativo: true
            };

            if (permissao !== "admin" && permissao !== "funcionario") {
                return res.status(400).json({
                    mensagem: "Permissão inválida."
                });
            }

            const permissoesDisponiveis = await db.permissao.findMany({
                where: {
                    nome: permissao
                },
                select: {
                    id: true,
                    nome: true
                }
            });

            if (permissoesDisponiveis.length !== 1) {
                return res.status(400).json({
                    mensagem: "Permissão não encontrada."
                });
            }

            await usuarioModel.singUsuarioUp(
                usuario,
                permissoesDisponiveis
            );

            return res.redirect("/funcionarios?sucesso=cadastro");

        } catch (e) {
            console.log(e);

            if (e instanceof UsuarioJaExiste) {
                return res.status(409).json({
                    mensagem: e.message
                });
            }

            return res.status(500).json({
                mensagem: "Não foi possível cadastrar o funcionário."
            });
        }
    }

    async editarFuncionario(req: Request, res: Response) {
        const id = Number(req.params.id);
        try {

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).send("ID de funcionário inválido");
            }

            const { nome, email, telefone, permissao, ativo } = req.body;

            if (typeof nome !== "string" || !nome.trim() || typeof permissao !== "string" || !["admin", "funcionario"].includes(permissao) ||
                !["true", "false"].includes(ativo) || (email != null && typeof email !== "string") || (telefone != null && typeof telefone !== "string")) {

                    return res.redirect(`/funcionarios/editar/${id}?erro=dados`);
            }

            const funcionarioAtual = await usuarioModel.getFuncionarioById(id);

            if (!funcionarioAtual) {
                return res.status(404).send("Funcionário não encontrado");
            }

            const eraAdministrador = funcionarioAtual.usuario_permissao.some(
                ({ permissao }) => permissao.nome === "admin"
            );

            const vaiPerderAcessoAdmin =
                ativo === "false" || permissao !== "admin";

            if (funcionarioAtual.ativo && eraAdministrador && vaiPerderAcessoAdmin) {
                const totalAdministradores =
                    await usuarioModel.contarAdministradoresAtivos();

                if (totalAdministradores <= 1) {
                    return res.redirect(`/funcionarios/editar/${id}?erro=administrador`);
                }
            }

            const idUsuarioLogado = Number(res.locals.usuario.userId);
            if(id === idUsuarioLogado && (ativo === "false" || permissao !== "admin")){
                return res.redirect(`/funcionarios/editar/${id}?erro=propriaConta`);
            }

            await usuarioModel.editarFuncionario(id, {
                nome: nome.trim(),
                email: email?.trim() || null,
                telefone: telefone?.replace(/\D/g, "") || null,
                permissao,
                ativo: ativo === "true"
            });

            return res.redirect("/funcionarios?sucesso=edicao");

        } catch (e) {
            console.log(e);

            if(e instanceof Error && e.message === "ULTIMO_ADMIN"){
                return res.redirect(`/funcionarios/editar/${id}?erro=administrador`);
            }

            if (e instanceof UsuarioJaExiste) {
                return res.redirect(`/funcionarios/editar/${id}?erro=duplicado`);
            }

            return res.redirect(`/funcionarios/editar/${id}?erro=servidor`);
        }
    }
}

export { UsuarioController }