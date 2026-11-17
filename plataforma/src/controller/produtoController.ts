import { NextFunction, Request, Response } from "express";
import { ProdutoCreateDTO, ProdutoModel } from "../model/produtoModel.js";
import { unlink } from "node:fs/promises";
import { AppError } from "../model/errors.js";

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
    const arquivos = req.files as Express.Multer.File[] | undefined;

    try {
        const contentString = (req.body.content ?? "");
        
        if(contentString == "")
            throw new Error("Content não achado")

        const content = JSON.parse(contentString);
        const {atributo, preco, marcaId, categoriaId, categoria, prateleira, marca, quantidade, alerta_quantidade, ...produto} = content

        if(produto["imagem[]"])
            delete produto["imagem[]"]

        const newProduto: ProdutoCreateDTO = {
            ...produto,
            codigo_barras: null,
            id_categoria: Number(categoriaId),
            id_marca: marcaId
                ? Number(marcaId)
                : null,
            altura: null,
            comprimento: null,
            largura: null,
            preco_venda: parseCurrency(preco),
            atributos: atributo,
            alerta_quantidade: Number(alerta_quantidade ?? ""),
            imagens: arquivos?.map(arquivo => arquivo.filename) ?? []
        };

        const prateleiras = prateleira?.map((p: any) => {
                const {estanteId, prateleiraRow, prateleiraCol, quantidade} = p;

                return {
                    id_estante: Number(estanteId),
                    linha: (prateleiraRow)? Number(prateleiraRow) : 1,
                    coluna: (prateleiraCol)? Number(prateleiraCol) : 1,
                    quantidade: Number(quantidade)
                }
            }) ?? []


        const produtoCriado = await produtoModel.create(newProduto, prateleiras, Number(quantidade ?? ""), marca);

        return res.status(201).json({
            confirm: "Produto cadastrado com sucesso",
            // produto: produtoCriado
        });

    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);

        if (arquivos?.length) {
            await Promise.allSettled(
                arquivos.map(arquivo => unlink(arquivo.path))
            );
        }

        return res.status(400).json({
            mensagem: error instanceof Error
                ? error.message
                : "Erro ao cadastrar produto"
        });
    }
}

export async function getProdutoByIdMiddle(req: Request, res: Response, next: NextFunction){
    const produtoId = Number(req.params.id ?? "")

    if(produtoId == 0){
        return next(new AppError("Volte para outra pagina e tente novamente", 400))
    }

    const produto = await produtoModel.getProduto(produtoId);

    if(!produto){
        return next(new AppError("Produto não encontrado", 404))
    }

    res.locals.produto = produto;

    return next()
}