import { Request, Response } from "express";
import { MarcaModel, Marca } from "../model/marcaModel.js"
import { UniqueError } from "../model/errors.js";

const marcaModel = new MarcaModel();

class MarcaController{
    async create(req: Request, res: Response){
        const imagem = req.file?.filename ?? null;
        const nome = req.body.nome;

        try{
            const result = await marcaModel.create({nome, imagem});

            return res.status(201).json(result)
        }catch(error){
            if(error instanceof UniqueError){
                return res.status(400).json({message: error.message});
            }

            return res.status(500).json({message: "alguma coisa de errado"})
        }
    }

    async getByStartsWithName(req: Request, res: Response){
        const nome = req.query.nome;

        if(!(typeof nome === "string"))
            return res.status(400).json({message: "nome incorreto"});

        try{
            const result = await marcaModel.getByStartsWithName(nome);

            if((result).length === 0){
                return res.status(404).json({message: "Nenhuma marca foi encontrada."})
            }

            return res.status(200).json(result);
        }catch(error){
            console.log(error);
            return res.status(500).json({mesasge: "Algo deu errado"});
        }
    }

}

export {MarcaController}