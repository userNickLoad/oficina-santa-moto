import { UsuarioModel, Usuario, UsuarioEntraDTO, UsuarioIncorreto, UsuarioCadastroDTO, UsuarioJaExiste } from "../model/usuarioModel.js";
import { Request, Response } from "express";


const usuarioModel = new UsuarioModel();

export const getUsuarioById = async (req: Request, res: Response) =>{
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
};

export const entrar = async (req: Request, res: Response) => {
    try{
        const usuario: UsuarioEntraDTO = req.body;

        const token = await usuarioModel.singUsuarioIn(usuario)
        return res.status(200).cookie("session_id", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 1000
        }).redirect("/");

    }catch(e){
        if(e instanceof UsuarioIncorreto){
            return res.status(403).json({"mensagem": e.message});
        }

        return res.status(501).json({"mensagem": "algo deu errado"});
    }
}

export const cadastrar = async (req: Request, res: Response) => {
    try{
        const usuario: UsuarioCadastroDTO = req.body;

        await usuarioModel.singUsuarioUp(usuario, [{id: 1, nome: "admin"}])
        return res.status(200).redirect("/entrar");

    }catch(e){
        if(e instanceof UsuarioJaExiste){
            return res.status(403).json({"mensagem": e.message});
        }

        return res.status(501).json({"mensagem": "algo deu errado"});
    }
}