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


export const registrarServico = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            descricao,
            preco,
            id_cliente,
            id_modelo,
            ano,
            produtos
        } = req.body;

        const idUsuario = Number(res.locals.usuario?.userId);
        const clienteId = Number(id_cliente);
        const modeloId = Number(id_modelo);
        const anoMoto = Number(ano);
        const valorServico = Number(preco);
        if(!Number.isInteger(idUsuario) || idUsuario <= 0){
            return res.status(401).json({
                mensagem: "Usuario não identificado"
            });
        }
        const produtosServico = produtos ??[];
    if (!Array.isArray(produtosServico) || !produtosServico.every((produto) => Number.isInteger(produto.id_produto) &&
        produto.id_produto > 0 && Number.isInteger(produto.quantidade) && produto.quantidade > 0 &&
        typeof produto.preco === "string" && /^\d+(\.\d{1,2})?$/.test(produto.preco)) ||
        new Set(produtosServico.map((produto) => produto.id_produto)).size !== produtosServico.length
    ) {
        return res.status(400).json({
            mensagem: "Produtos, quantidades ou preços inválidos"
        });
    }

        if (
            !descricao?.trim() ||
            !Number.isInteger(clienteId) || clienteId <= 0 ||
            !Number.isInteger(modeloId) || modeloId <= 0 ||
            !Number.isInteger(anoMoto) || anoMoto <= 0 ||
            !Number.isFinite(valorServico) || valorServico < 0
        ) {
            return res.status(400).json({
                mensagem: "Dados inválidos para registrar o serviço"
            });
        }

        const servico = await servicoModel.registrarServico({
            descricao: descricao.trim(),
            preco: String(preco),
            id_cliente: clienteId,
            id_modelo: modeloId,
            ano: anoMoto,
            id_usuario: idUsuario,
            produtos: produtosServico
        });

        return res.status(201).json({
            mensagem: "Serviço registrado com sucesso",
            servico
        });

    } catch (e) {
        console.log(e);

        return res.status(500).json({
            mensagem: "Erro ao registrar serviço"
        });
    }
};

