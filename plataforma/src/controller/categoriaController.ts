import { Request, Response } from "express";
import { CategoriaCreateDTO, CategoriaModel } from "../model/categoriaModel.js";

const categoriaModel = new CategoriaModel();

class CategoriaController{
    async getByIdWithAtributos(req: Request, res: Response){
        const paramId = req.params.id;

        if(!paramId)
            return res.status(400).json({message: "id não fornecido"});

        try{
            const result = await categoriaModel.getByIdWithAtributos(Number(paramId));

            if(!result)
                return res.status(404).json({message: `Categoria ${paramId} não encontrada`});

            return res.status(200).json(result);
        }catch(error){
            console.log(error);

            return res.status(500).json({message: "algum erro ocorreu"});

        }
    }

    async getByStartsWithName(req: Request, res: Response){
        const { paramNome } = req.params;

        if(!(typeof paramNome === "string"))
            return res.status(400).json({message: "nome não fornecido"});

        try{

            const result = categoriaModel.getByStartsWithName(paramNome);
            return res.status(200).json(result);

        }catch(error){
            console.log(error);

            return res.status(500).json({message: "algum erro ocorreu"});
        } 
    }

    async create(req: Request, res: Response){
        const newCategoria: CategoriaCreateDTO = req.body;

        try{
            const result = await categoriaModel.create(newCategoria);

            return res.status(201).json(result);

        }catch(error){
            console.log(error);
            return res.status(500).json({message: "algum erro ocorreu"})
        }

    }
}