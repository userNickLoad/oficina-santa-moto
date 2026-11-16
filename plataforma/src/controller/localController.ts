import { Request, Response } from "express";
import { LocalModel } from "../model/localModel.js";

const localModel = new LocalModel();

class LocalController{
    async getLocal(req: Request, res: Response){
        console.log("HIT", req.query)

        const { path } = req.query;

        if (typeof path !== "string") {
            return res.status(400).json({
                mensagem: "Parâmetro path inválido"
            });
        }

        try{
            const result = await localModel.getLocalsWithEstantes(path);

            if(!result)
                return res.status(404).json({
                    mensagem: "nenhum local encontrado."
                });

            return res.status(200).json(result);
        }catch(error){
            console.log(error)

            return res.status(500).json({
                mensagem: "erro no servidor"
            })

        }
    }
}

export {LocalController}

