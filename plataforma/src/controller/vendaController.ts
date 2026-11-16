import { Request, Response } from "express";
import { VendaModel } from "../model/vendaModel.js";

const vendaModel = new VendaModel();

export const registrarVenda = async (req: Request, res: Response) => {
    try {
        const idUsuario = Number(res.locals.usuario?.userId);
        const {produtos, id_cliente} = req.body;

        const clienteId = id_cliente == null ? null : Number(id_cliente);

        if(clienteId !== null && (!Number.isInteger(clienteId) || clienteId <= 0)){
            return res.status(400).json({
                mensagem: "Cliente inválido"
            });
        }

        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            return res.status(401).json({
                mensagem: "Usuário não identificado"
            });
        }

        if (!Array.isArray(produtos) || produtos.length === 0 || !produtos.every((produto) =>
                Number.isInteger(produto.id_produto) && produto.id_produto > 0 &&
                Number.isInteger(produto.quantidade) && produto.quantidade > 0) || new Set
                (produtos.map((produto) => produto.id_produto)).size !== produtos.length) {
                    
                return res.status(400).json({
                mensagem: "Produtos ou quantidades inválidos"
            });
        }

        const venda = await vendaModel.registrarVenda({id_usuario: idUsuario, id_cliente: clienteId, produtos});

        return res.status(201).json({
            mensagem: "Venda registrada com sucesso",venda});

    } catch (error) {
        console.error("Erro ao registrar venda:", error);

        const mensagem = error instanceof Error ? error.message: "Erro ao registrar venda";

        if (mensagem.startsWith("Estoque insuficiente") || mensagem.includes("não encontrado")) {
            return res.status(400).json({ mensagem });
        }

        return res.status(500).json({mensagem: "Erro ao registrar venda"});
    }
};
