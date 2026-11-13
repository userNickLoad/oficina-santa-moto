import { FormFill } from "../model/errors.js";
import { UsuarioModel, Usuario, UsuarioEntraDTO, UsuarioIncorreto, UsuarioCadastroDTO, UsuarioJaExiste, UsuarioUpdateDTO } from "../model/usuarioModel.js";
import { Request, Response } from "express";

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
}

export { UsuarioController }