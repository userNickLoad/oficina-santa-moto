import { Request, Response } from "express";
import { ProdutoModel } from "../model/produtoModel.js";

const produtoModel = new ProdutoModel();

export async function buscarProdutos(req: Request, res: Response) {
    try {
        const nome = String(req.query.nome ?? "").trim();

        if (nome.length < 2) {
            return res.json([]);
        }

        const produtos = await produtoModel.getByFilter({
            nome,
            pagina: 1
        });

        return res.json(produtos.map(produto => ({
            id: produto.id,
            nome: produto.nome,
            preco_venda: produto.preco_venda,
            qtd_disponivel: produto.qtd_disponivel
        })));

    } catch (error) {
        console.error("Erro ao buscar produtos:", error);

        return res.status(500).json({
            mensagem: "Erro ao pesquisar produtos"
        });
    }
}
