import { UsuarioModel, Usuario } from "../model/usuarioModel.js";
import Router, { Request, Response } from "express";

const router = Router();

const usuarioModel = new UsuarioModel();

router.get("/:id", async (req: Request, res: Response) =>{
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
});

export default router;