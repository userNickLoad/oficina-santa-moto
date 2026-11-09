
import { Request, Response } from "express";
import { MotoModel } from "../model/motoModel.js";

const motoModel = new MotoModel();

export const listarMarcas = async (req: Request, res: Response) => {
    try {
        const marcas = await motoModel.listarMarcas();

        return res.status(200).json(marcas);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensagem: "Erro ao buscar marcas."
        });
    }
};

export const listarModelos = async (req: Request, res: Response) => {
    try {
        const idMarca = Number(req.query.marca);

        if (!Number.isInteger(idMarca) || idMarca <= 0) {
            return res.status(400).json({
                mensagem: "ID da marca inválido."
            });
        }

        const modelos = await motoModel.listarModelos(idMarca);

        return res.status(200).json(modelos);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensagem: "Erro ao buscar modelos."
        });
    }
};
