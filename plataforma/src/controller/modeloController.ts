import { Request, Response } from "express";
import { Modelo, ModeloDTO, ModeloModel } from "../model/modeloModel.js"

const modeloModel = new ModeloModel(); 

class ModeloController {
    async getModeloByNome(req: Request, res: Response){
        const nome = req.query.nome

        if(!(typeof nome === "string"))
            return res.status(400).json({message: "nome invalido"})

        try{

            const result = await modeloModel.getModeloByNome(nome);

            if(result.length == 0){
                return res.status(404).json({message: `modelo de nome ${nome} não encontrado`})
            }

            return res.status(200).json(result);

        }catch(error){
            console.log(error);

            return res.status(500).json({message: "erro interno do servidor"})
        }
    }
}

export {ModeloController}