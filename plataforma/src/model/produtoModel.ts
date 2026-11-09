import { produto, produto_atributo, Prisma, imagem, local, prateleira, estante } from "../../generated/prisma/client.js";
import prisma from "../database/prisma.js";
import { Atributo } from "./atributoModel.js";
import { Local, LocalModel } from "./localModel.js";

type Produto = produto;
type ProdutoGetDTO = produto & {imagens: imagem[]};
type EstanteDTO = estante & {local: Local[]};
type PrateleiraDTO = prateleira & {estante: EstanteDTO};
type ProdutoImagemLocalizacaoDTO = produto & {imagens: imagem[], prateleiras: PrateleiraDTO[]};

type ProdutoAtributo = produto_atributo;
type ProdutoCreateDTO = Omit<Produto, "id"> 
    & {atributos: {id_atributo: number, valor: number | string}[]} 
    & {imagens: string[]};
type ProdutoFilterDTO = {
    nome?: string,
    id_categoria?: number,
    id_marca?: number,
    atributos?: {
        id_atributo: number,
        valor: number | string
    }[],
    pagina: number
}

const localModel = new LocalModel();

class ProdutoModel{
    async create(newProduto: ProdutoCreateDTO, prateleira: {prateleiraId: number, qtd: number}[] | null): Promise<Produto>{
        const {atributos, imagens, ...produto} = newProduto;

        if(!newProduto.id_categoria)
            throw new Error();

        const atributosDB = await prisma.atributo.findMany({
            where: {
                id_categoria: newProduto.id_categoria
            }
        })

        const atributosToAdd = atributosDB.flatMap<
                Prisma.produto_atributoCreateWithoutProdutoInput
            >((atributo) => {
                const at = atributos.find(
                    at => at.id_atributo === atributo.id
                );

                if (at === undefined || at.valor === "") {
                    if (atributo.obrigatorio) {
                        throw new Error(
                            `Atributo "${atributo.nome}" obrigatório não tem valor`
                        );
                    }

                    return [];
                }

                if (atributo.numerico) {
                    if (typeof at.valor !== "number") {
                        throw new Error(
                            `Atributo "${atributo.nome}" deveria ser numérico`
                        );
                    }

                    return [{
                        atributo: {
                            connect: { id: atributo.id }
                        },
                        valor_numerico: at.valor
                    }];
                }

                if (typeof at.valor !== "string") {
                    throw new Error(
                        `Atributo "${atributo.nome}" deveria ser textual`
                    );
                }

                return [{
                    atributo: {
                        connect: { id: atributo.id }
                    },
                    valor_texto: at.valor
                }];
            });

        const result = await prisma.produto.create({
            data: {
                ...produto,
                produto_imagem: {
                    create: imagens.map(caminho => ({
                        imagem: {
                            create: {
                                caminho
                            }
                        }
                    }))
                },
                produto_atributo: {
                    create: atributosToAdd
                },
                ...(prateleira?.length && {
                    produto_prateleira: {
                        create: prateleira.map(p => ({
                            id_prateleira: p.prateleiraId,
                            quantidade: p.qtd
                        }))
                    }
                })
                
            },
        });

        return result;
    }

    async getByFilter(filter: ProdutoFilterDTO): Promise<ProdutoGetDTO[]>{

        const where: Prisma.produtoWhereInput = {
            ...(filter.nome && {
                nome: {
                    startsWith: filter.nome,
                    mode: "insensitive"
                }
            }),
            ...(filter.id_categoria !== undefined && {
                id_categoria: filter.id_categoria
            }),
            ...(filter.id_marca !== undefined && {
                id_marca: filter.id_marca
            }),
            ...(filter.atributos?.length && {
                AND: filter.atributos.map(at => ({
                    produto_atributo: {
                        some: {
                            id_atributo: at.id_atributo,
                            ...(typeof at.valor === "number"
                                ? { valor_numerico: at.valor }
                                : { valor_texto: at.valor })
                        }
                    }
                })) 
            })
        }

        const result = await prisma.produto.findMany({
            where,
            include: {
                produto_imagem: {
                    include: {
                        imagem: true
                    }
                }
            },
            take: 20,
            skip: (filter.pagina -1) * 20,
            orderBy: {
                nome: "asc"
            }
        })

        return result.map(r => {
            const {produto_imagem, ...dados} = r;
            return {
                ...dados,
                imagens: produto_imagem.map(pi => (pi.imagem)),

            }
        });
    }


    async getProduto(produtoId: number): Promise<ProdutoImagemLocalizacaoDTO | null>{

        const result = await prisma.produto.findUnique({
            where: {id: produtoId},
            include: {
                produto_imagem: {
                    include: {
                        imagem: true
                    }
                },
                produto_prateleira: {
                    include: {
                        prateleira: {
                            include: {
                                estante: true
                            }
                        }
                    }
                }
            }
        })

        if(!result)
            return null;

        const {produto_prateleira, produto_imagem, ...dados} = result;

        const prateleiras = (await Promise.all(produto_prateleira.map(async pp => {    
            const localId = pp.prateleira.estante.id_local;          
                return {
                    ...pp.prateleira,
                    estante: {
                        ...pp.prateleira.estante,
                        local: (localId)? await localModel.getHierarquiaLocal(localId): []
                    }
                    
                }
    
        }))).filter((p): p is PrateleiraDTO => p !== null)

        return {
            ...dados,
            imagens: produto_imagem.map(pi => (pi.imagem)),
            prateleiras: prateleiras
        }
    }

    async assingToPrateleira(produtoId: number, prateleiraId: number, qtd: number){
        const result = await prisma.produto_prateleira.upsert({
            where: {
                id_produto_id_prateleira: {id_prateleira: prateleiraId, id_produto: produtoId}
            },
            create: {
                    quantidade: qtd,
                    id_prateleira: prateleiraId,
                    id_produto: produtoId
                },
            update: {quantidade: {increment: qtd}}
        })

        return result;
    }
}

export {ProdutoModel }