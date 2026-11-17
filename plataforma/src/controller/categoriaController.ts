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
        const  paramNome  = req.query.nome;

        if(!(typeof paramNome === "string"))
            return res.status(400).json({message: "nome não fornecido"});

        try{

            const result = await categoriaModel.getByStartsWithName(paramNome);

            return res.status(200).json(result);

        }catch(error){
            console.log(error);

            return res.status(500).json({message: "algum erro ocorreu"});
        } 
    }

    async create(req: Request, res: Response){
        const {atributo = [], ...dados} = req.body;

        const newCategoria: CategoriaCreateDTO = {
            ...dados,
            atributos: atributo.map((a: any) => {
                const {obrigatorio, tipo, nome} = a

                return {
                    nome,
                    obrigatorio: (obrigatorio ?? "") == 'on',
                    numerico: (tipo ?? "") == 'numerico'

                }
            })
        }

        try{
            const result = await categoriaModel.create(newCategoria);

            return res.status(201).json({
                confirm: "Categoria cadastrada"
            });

        }catch(error){
            console.log(error);
            return res.status(500).json({mensagem: "algum erro ocorreu"})
        }

    }
}

export {CategoriaController}