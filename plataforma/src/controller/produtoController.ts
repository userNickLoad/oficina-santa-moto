import { NextFunction, Request, Response } from "express";
import { ProdutoCreateDTO, ProdutoModel, ProdutoUpdateDTO } from "../model/produtoModel.js";
import { unlink } from "node:fs/promises";
import { AppError, FormFill } from "../model/errors.js";

const produtoModel = new ProdutoModel();

export async function entrada(req: Request, res: Response){
    const id = Number(req.params.id ?? "")

    console.log(req.body)

    const naoAlocado = String(req.body['desalocado[check]'] ?? "")

    console.log(req.body)

    const qtdNaoAlocado = (naoAlocado == "true")? Number(req.body['desalocado[quantidade]'] ?? ""): 0;

    console.log(qtdNaoAlocado)

    const prateleiras = req.body.prateleira?.map(({id, check, quantidade}: {id: string, check?: string, quantidade?: string}) => {
        if(check){
            return {
                id: Number(id ?? ""),
                quantidade: Number(quantidade ?? "")
            }
        } else 
            return null
    }).filter((p: any) => (p != null)) || [];

    const realocarEmprateleira = req.body.prateleira?.map(({id, desalocar, quantidade}: {id: string, desalocar?: string, quantidade?: string}) => {
        if(desalocar){
            return {
                id: Number(id ?? ""),
                quantidade: Number(quantidade ?? "")
            }
        } else 
            return null
    }).filter((p: any) => (p != null)) || [];

    const newPrateleiras = req.body.newPrateleiras?.map((p: any) => {
                const {estanteId, prateleiraRow, prateleiraCol, quantidade} = p;

                return {
                    id_estante: Number(estanteId),
                    linha: (prateleiraRow)? Number(prateleiraRow) : 1,
                    coluna: (prateleiraCol)? Number(prateleiraCol) : 1,
                    quantidade: Number(quantidade)
                }
            }) ?? []

    try{
        const result = await produtoModel.entrada(id, qtdNaoAlocado, prateleiras, realocarEmprateleira, newPrateleiras);

        if(!result)
            throw new Error("Algo deu errado")

        return res.status(200).json({confirm: "Entrada registrada no estoque"})

    }catch(error){
        console.log(error)
        return res.status(400).json({
            mensagem: error instanceof Error
                ? error.message
                : "Erro ao atualizar produto"
        });
    }
}

export async function baixa(req: Request, res: Response) {
    const id = Number(req.params.id ?? "")
    
    try {
        const naoAlocado = String(req.body['nao-alocado[check]'] ?? "")

        console.log(req.body)

        const qtdNaoAlocado = (naoAlocado == "true")? Number(req.body['nao-alocado[quantidade]'] ?? ""): 0;

        const prateleiras = req.body.prateleira?.map(({id, check, quantidade}: {id: string, check?: string, quantidade?: string}) => {
            if(check){
                return {
                    id: Number(id ?? ""),
                    quantidade: Number(quantidade ?? "")
                }
            } else 
                return null
        }).filter((p: any) => (p != null)) || [];

        const realocarEmprateleira = req.body.prateleira?.map(({id, desalocar, quantidade}: {id: string, desalocar?: string, quantidade?: string}) => {
            if(desalocar){
                return {
                    id: Number(id ?? ""),
                    quantidade: Number(quantidade ?? "")
                }
            } else 
                return null
        }).filter((p: any) => (p != null)) || [];

        console.log(id, qtdNaoAlocado, prateleiras)

        const result = await produtoModel.baixa(id, qtdNaoAlocado, prateleiras, realocarEmprateleira)

        if(!result){
            throw new Error()
        }

        return res.status(200).json({confirm: "Baixas registradas"})

    } catch (error) {

        console.log(error)
        return res.status(400).json({
            mensagem: error instanceof Error
                ? error.message
                : "Erro ao atualizar produto"
        });
    }

}

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id ?? "")

    const arquivos = req.files as Express.Multer.File[] | undefined;

    try {
        const contentString = (req.body.content ?? "");

        if(!id){
            throw new Error("produto invalido")
        }

        if(contentString == "")
            throw new Error("Content não achado")

        const content = JSON.parse(contentString);
        const {atributo = [], preco, marcaId, categoriaId, categoria, marca, alerta_quantidade, images = [], ...produto} = content;

        if(produto["imagem[]"])
            delete produto["imagem[]"]

        const updateProduto: ProdutoUpdateDTO = {
            id: id,
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

        const result = await produtoModel.update(updateProduto, marca, images.map((i: {remove: string}) => (Number(i.remove))))


        if(!result){
            throw new Error()
        }

        return res.status(200).json({confirm: "Produto atualizado"})

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
                : "Erro ao atualizar produto"
        });

    }
}

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
                    mensagem: "Categoria inválida"
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
                        mensagem: "Marca inválida"
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
        console.error("Erro ao listar produtos do estoque: ", error);

        return res.status(500).json({
            mensagem: "Erro ao carregar produtos do estoque"
        });
    }
}

export async function consultarEstoqueProduto(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID do produto inválido."
            });
        }

        const produto = await produtoModel.getProduto(id);

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        const totalAlocado = produto.prateleiras.reduce(
            (total, prateleira) => total + prateleira.quantidade,
            0
        );

        const quantidadeSemAlocacao = produto.qtd_disponivel - totalAlocado;

        if (quantidadeSemAlocacao < 0) {
            return res.status(409).json({
                mensagem: "Inconsistência nas quantidades do estoque"
            });
        }

        return res.status(200).json({
            id: produto.id,
            nome: produto.nome,
            qtd_disponivel: produto.qtd_disponivel,
            quantidade_sem_alocacao: quantidadeSemAlocacao,
            prateleiras: produto.prateleiras
        });

    } catch (error) {
        console.error("Erro ao consultar estoque do produto: ", error);

        return res.status(500).json({
            mensagem: "Erro ao consultar estoque do produto"
        });
    }
}

export async function darBaixaProduto(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const { quantidade, id_prateleira } = req.body;

        const quantidadeNumero = Number(quantidade);

        const prateleiraId =
            id_prateleira === null
                ? null
                : Number(id_prateleira);

        if (
            !Number.isSafeInteger(id) ||
            id <= 0 ||
            !Number.isSafeInteger(quantidadeNumero) ||
            quantidadeNumero <= 0 ||
            (
                prateleiraId !== null &&
                (
                    !Number.isSafeInteger(prateleiraId) ||
                    prateleiraId <= 0
                )
            )
        ) {
            return res.status(400).json({
                mensagem: "Dados da baixa inválidos"
            });
        }

        const resultado = await produtoModel.darBaixa(
            id,
            quantidadeNumero,
            prateleiraId
        );

        return res.status(200).json({
            confirm: "Baixa realizada com sucesso!",
            produto: resultado
        });

    } catch (error) {
        console.error("Erro ao dar baixa no produto:", error);

        if (error instanceof FormFill) {
            return res.status(400).json({
                mensagem: error.message
            });
        }

        return res.status(500).json({
            mensagem: "Não foi possível realizar a baixa"
        });
    }
}

