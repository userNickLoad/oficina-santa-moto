import { Request, Response, NextFunction } from "express";
import { getSession } from "./getSession.js";
import { UsuarioModel } from "../model/usuarioModel.js";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const token: string | null = req.cookies?.session_id

        if(token == null){
            return  res.status(403).redirect("/entrar");
        }

        const session = await getSession(token);

        if(session == null){
            res.clearCookie("session_id", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/"
            });

            return res.redirect("/entrar");
        }

        const usuarioModel = new UsuarioModel();

        const funcionario = await usuarioModel.getFuncionarioById(
            Number(session.userId)
        );

        if (!funcionario || !funcionario.ativo) {
            res.clearCookie("session_id", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/"
            });

            return res.redirect("/entrar");
        }

        res.locals.usuario = {
            ...session,
            nome: funcionario.nome,
            permissoes: funcionario.usuario_permissao.map(
                ({ permissao }) => permissao.id
            )
        };

        next();
    }catch(e){
        console.log(e)
    }
}