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


export const cadastrarVeiculo = async (req: Request, res: Response) => {
    try {
        const marca = String(req.body.marca ?? "").trim();
        const modelo = String(req.body.modelo ?? "").trim();
        const ano = Number(req.body.ano);
        const idCliente = Number(req.body.id_cliente);

        if (
            !marca ||
            !modelo ||
            marca.length > 100 ||
            modelo.length > 20 ||
            !Number.isInteger(ano) ||
            ano < 1900 ||
            ano > new Date().getFullYear() + 1 ||
            !Number.isInteger(idCliente) ||
            idCliente <= 0
        ) {
            return res.status(400).json({
                mensagem: "Informe os dados válidos do veículo."
            });
        }

        const veiculo = await motoModel.cadastrarVeiculoCompleto(
            marca,
            modelo,
            ano,
            idCliente
        );

        return res.status(201).json(veiculo);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar veículo."
        });
    }
};

