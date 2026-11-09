
import { Request, Response } from "express";
import { ServicoModel } from "../model/servicoModel.js";

const servicoModel = new ServicoModel();

export const getServicosEmAndamento = async (
    req: Request,
    res: Response
) => {
    try {
        const servicos = await servicoModel.getServicosEmAndamento();

        return res.status(200).json(servicos);

    } catch (e) {
        console.log(e);

        return res.status(500).json({
            mensagem: "Erro ao buscar serviços em andamento"
        });
    }
};

export const concluirServico = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID do serviço inválido"
            });
        }

        const servico = await servicoModel.concluirServico(id);

        if (servico == null) {
            return res.status(404).json({
                mensagem: "Serviço não encontrado ou já concluído"
            });
        }

        return res.status(200).json({
            mensagem: "Serviço concluído com sucesso",
            servico: servico
        });

    } catch (e) {
        console.log(e);

        return res.status(500).json({
            mensagem: "Erro ao concluir serviço"
        });
    }
};
