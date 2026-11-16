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

const parseCurrency = (value: string): number => {
    return Number(
        value.replace(/[^\d,.-]/g, "")
             .replace(/\./g, "")
             .replace(",", ".")
    );
};

export async function criarProduto(req: Request, res: Response) {
    console.log(req.body)
    try {
        const contentString = (req.body.content ?? "");

        if(contentString != "")
            throw new Error("Content não achado")

        const content = JSON.parse(contentString);

        const {atributo, marca, preco, marcaId, categoriaId, prateleira, ...produto} = content

        const arquivos = req.files as Express.Multer.File[] | undefined;

        const newProduto = {
            ...produto,
            id_categoria: Number(categoriaId),
            id_marca: marcaId
                ? Number(marcaId)
                : null,
            preco_venda: parseCurrency(preco),
            atributos: atributo,
            prateleiras: prateleira,
            imagens: arquivos?.map(arquivo => arquivo.filename) ?? []
        };

        console.log(newProduto)

        // const produtoCriado = await produtoModel.create(
        //     newProduto,
        //     localParsed ,
        //     Number(quantidade)
        // );

        return res.status(201).json({
            mensagem: "Produto cadastrado com sucesso",
            // produto: produtoCriado
        });

    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);

        return res.status(400).json({
            mensagem: error instanceof Error
                ? error.message
                : "Erro ao cadastrar produto"
        });
    }
}