import { Request, Response } from "express";
import { ProdutoCreateDTO, ProdutoModel } from "../model/produtoModel.js";
import { unlink } from "node:fs/promises";

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
        console.log(content)
        const {atributo= [], preco, marcaId, categoriaId, categoria, prateleira = [], marca, quantidade, alerta_quantidade, ...produto} = content;

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

        const prateleiras = prateleira.map((p: any) => {
                const {estanteId, prateleiraRow, prateleiraCol, quantidade} = p;

                return {
                    id_estante: Number(estanteId),
                    linha: (prateleiraRow)? Number(prateleiraRow) : 1,
                    coluna: (prateleiraCol)? Number(prateleiraCol) : 1,
                    quantidade: Number(quantidade)
                }
            })


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

export async function listarProdutosEstoque(req: Request, res: Response) {
    try {
        const pagina = Math.max(1, Number(req.query.pagina) || 1);

        const disponibilidadeParam = req.query.disponibilidade;

        if(disponibilidadeParam !== undefined && disponibilidadeParam !== "em_estoque" && disponibilidadeParam !== "sem_estoque"){
            return res.status(400).json({
                mensagem: "Disponibilidade inválida"
            });
        }

        const disponibilidade = disponibilidadeParam as "em_estoque" | "sem_estoque" | undefined;

        const nomeParam = req.query.nome;

        if(nomeParam !== undefined && typeof nomeParam !== "string"){
            return res.status(400).json({
                mensagem: "Nome do produto inválido"
            });
        }
        const nome = nomeParam?.trim() || undefined;

        const categoriaParam = req.query.id_categoria;

        let id_categoria: number[] | undefined;

        if (categoriaParam !== undefined) {
            const categorias = Array.isArray(categoriaParam) ? categoriaParam : [categoriaParam];
            if (categorias.some( categoria => typeof categoria !== "string" ||
                !/^\d+$/.test(categoria) || !Number.isSafeInteger(Number(categoria)) || Number(categoria) < 1)
            ) {
                return res.status(400).json({
                    mensagem: "Categoria inválida."
                });
            }

            id_categoria = categorias.map(categoria => Number(categoria));
        }

        const marcaParam = req.query.id_marca;

        let id_marca: number[] | undefined;

        if (marcaParam !== undefined) {
            const marcas = Array.isArray(marcaParam) ? marcaParam : [marcaParam];
            if (marcas.some(marca => typeof marca !== "string" || !/^\d+$/.test(marca)
                 || !Number.isSafeInteger(Number(marca)) || Number(marca) < 1))
                {
                    return res.status(400).json({
                        mensagem: "Marca inválida."
                });
            }

            id_marca = marcas.map(marca => Number(marca));
        }

        const produtos = await produtoModel.getByFilter({
            pagina,
            nome,
            id_categoria,
            id_marca,
            disponibilidade
        });

        return res.status(200).json(
            produtos.map(produto => ({
                id: produto.id,
                nome: produto.nome,
                preco_venda: produto.preco_venda,
                qtd_disponivel: produto.qtd_disponivel,
                imagem: produto.imagens[0]?.caminho ?? null
            }))
        );

    } catch (error) {
        console.error("Erro ao listar produtos do estoque:", error);

        return res.status(500).json({
            mensagem: "Erro ao carregar produtos do estoque."
        });
    }
}
