import { Decimal } from "@prisma/client/runtime/client";
import { produto, produto_atributo, Prisma, imagem, local, prateleira, estante, atributo, marca } from "../../generated/prisma/client.js";
import prisma from "../database/prisma.js";
import { Atributo } from "./atributoModel.js";
import { FormFill } from "./errors.js";
import { Local, LocalModel } from "./localModel.js";
import { unlink } from "node:fs/promises"
import path from "node:path";

type Produto = produto;
type ProdutoGetDTO = produto & {imagens: imagem[]};
type EstanteDTO = estante & {local: Local[]};
type PrateleiraDTO = prateleira & {estante: EstanteDTO} & {quantidade: number};
type ProdutoImagemLocalizacaoDTO = produto & {imagens: imagem[], prateleiras: PrateleiraDTO[], atributos: Record<string, number | string | null>, marca: marca | null};

type PrateleiraAddDTO = {id_estante: number, coluna: number, linha: number, quantidade: number}

type ProdutoCreateDTO = Omit<
    Produto,
    "id" | "qtd_disponivel"
> & {
    atributos: Record<string, number | string>[];
    imagens: string[];
};

type ProdutoUpdateDTO = Omit<
    Produto,
     "qtd_disponivel"
> & {
    atributos: Record<string, number | string>[];
    imagens: string[];
};

type ProdutoFilterDTO = {
    nome?: string,
    id_categoria?: number | number[],
    id_marca?: number | number[],
    disponibilidade?: "em_estoque" | "sem_estoque";
    atributos?: {
        id_atributo: number,
        valor: number | string
    }[],
    pagina: number
}

const localModel = new LocalModel();

class ProdutoModel{

    async update(
        updateProduto: ProdutoUpdateDTO,
        marca: string | null,
        deleteImagens: number[]
    ): Promise<Produto | null>{
        const { atributos, imagens, ...produto } = updateProduto;

        let atributosToAdd: Prisma.produto_atributoCreateWithoutProdutoInput[] | null = null

        if (produto.id_categoria){
            const atributosDB = await prisma.atributo.findMany({
            where: {
                id_categoria: produto.id_categoria
            }
        });

        atributosToAdd = atributosDB.flatMap<
            Prisma.produto_atributoCreateWithoutProdutoInput
            >((atributo) => {

                const nome = atributo.nome.trim().toLowerCase();

                const at = atributos.find(
                    item => Object.keys(item).some(
                        chave => chave.trim().toLowerCase() === nome
                    )
                );

                let valor = at
                    ? at[Object.keys(at).find(
                        chave => chave.trim().toLowerCase() === nome
                    )!]
                    : undefined;

                if (valor === undefined || valor === "") {
                    if (atributo.obrigatorio) {
                        throw new FormFill(
                            `Atributo "${atributo.nome}" obrigatório não tem valor`
                        );
                    }

                    return [];
                }

                if (atributo.numerico) {
                    valor = Number(String(valor ?? "").replace(",", "."))
                    if (Number.isNaN(valor)) {
                        throw new FormFill(
                            `Atributo "${atributo.nome}" deveria ser numérico`
                        );
                    }

                    return [{
                        atributo: {
                            connect: { id: atributo.id }
                        },
                        valor_numerico: valor
                    }];
                }

                if (typeof valor !== "string") {
                    throw new FormFill(
                        `Atributo "${atributo.nome}" deveria ser textual`
                    );
                }

                return [{
                    atributo: {
                        connect: { id: atributo.id }
                    },
                    valor_texto: valor
                }];
            });
        }


        const result = await prisma.$transaction(async (tx)=>{
            const imageDB = await tx.produto_imagem.findMany({
                where: {
                    id_imagem: {
                        in: deleteImagens
                    },
                    id_produto: updateProduto.id
                },
                include: {
                    imagem: true
                }
            });

            const produto_imageDelete = await tx.produto_imagem.deleteMany({
                where: {
                    id_imagem: {
                        in: deleteImagens
                    },
                    id_produto: updateProduto.id
                }
            });

            const imageDelete = await tx.imagem.deleteMany({
                where: {
                    id: {
                        in: imageDB.map((i) => (i.imagem.id))
                    }
                }
            });

            let marcaId = updateProduto.id_marca;

            if(marca){
                marcaId = (await tx.marca.upsert({
                    where: {
                        nome: marca
                    },
                    update: {},
                    create: {
                        nome: marca
                    }
                })).id
            }

            const produtoDB = await tx.produto.findUnique({
                where: {
                    id: updateProduto.id
                }
            })

            if(!produtoDB)
                throw new Error("não foi possivel achar o produto")

            if(produtoDB.id_categoria && produtoDB.id_categoria != updateProduto.id_categoria){
                const produto_atributoDelete = await tx.produto_atributo.deleteMany({
                    where: {
                        id_produto: updateProduto.id
                    }
                })
            }

            const produtoUp = await tx.produto.update({
                where: {
                    id: updateProduto.id
                },
                data: {
                    ...produto,
                    produto_imagem: {
                        create: imagens.map(i => ({
                            imagem: {
                                create: {
                                    caminho: i
                                }
                            }
                        }))
                    },
                    ...((atributosToAdd)
                        ? {produto_atributo: {
                            upsert: atributosToAdd.filter(at => (at.atributo.connect?.id)).flatMap(at => {
                                const idAtributo = at.atributo.connect?.id;

                                if (idAtributo === undefined) {
                                    return [];
                                }

                                return [{
                                    where: {
                                        id_atributo_id_produto: {
                                            id_atributo: idAtributo,
                                            id_produto: updateProduto.id
                                        }
                                    },
                                    create: at,
                                    update: at
                                }];
                            })
                        }}
                        : {}
                    ),


                }
            })

            const imagesDiskDelete = await Promise.all(imageDB.map(i => {return unlink(path.resolve(`./images/${i.imagem.caminho}`))}));


            return produtoUp;

        })

        return result
    }

    async create(
        newProduto: ProdutoCreateDTO,
        estante: PrateleiraAddDTO[],
        quantidade: number,
        marca: string | null
    ): Promise<Produto> {

        const { atributos, imagens, ...produto } = newProduto;

        let qtd_disponivel = quantidade

        estante.map(e => {qtd_disponivel += e.quantidade})

        let atributosToAdd: Prisma.produto_atributoCreateWithoutProdutoInput[] | null = null

        if (produto.id_categoria){
            const atributosDB = await prisma.atributo.findMany({
            where: {
                id_categoria: produto.id_categoria
            }
        });

        atributosToAdd = atributosDB.flatMap<
            Prisma.produto_atributoCreateWithoutProdutoInput
            >((atributo) => {

                const nome = atributo.nome.trim().toLowerCase();

                const at = atributos.find(
                    item => Object.keys(item).some(
                        chave => chave.trim().toLowerCase() === nome
                    )
                );

                let valor = at
                    ? at[Object.keys(at).find(
                        chave => chave.trim().toLowerCase() === nome
                    )!]
                    : undefined;

                if (valor === undefined || valor === "") {
                    if (atributo.obrigatorio) {
                        throw new FormFill(
                            `Atributo "${atributo.nome}" obrigatório não tem valor`
                        );
                    }

                    return [];
                }

                if (atributo.numerico) {
                    valor = Number(String(valor ?? "").replace(",", "."))
                    if (Number.isNaN(valor)) {
                        throw new FormFill(
                            `Atributo "${atributo.nome}" deveria ser numérico`
                        );
                    }

                    return [{
                        atributo: {
                            connect: { id: atributo.id }
                        },
                        valor_numerico: valor
                    }];
                }

                if (typeof valor !== "string") {
                    throw new FormFill(
                        `Atributo "${atributo.nome}" deveria ser textual`
                    );
                }

                return [{
                    atributo: {
                        connect: { id: atributo.id }
                    },
                    valor_texto: valor
                }];
            });
        }

        // Lógica original dos atributos (preservada)

        // Evita posições duplicadas
        const posicoes = new Set<string>();

        for (const p of estante) {
            const key = `${p.id_estante}-${p.linha}-${p.coluna}`;

            if (posicoes.has(key))
                throw new FormFill(`Prateleira duplicada na posição ${key}`);

            posicoes.add(key);
        }

        const result = await prisma.$transaction(async (tx) => {

            // 1. Buscar as estantes e os modelos das posições solicitadas
            const estanteDB = await Promise.all(
                estante.map(async (l) => {
                    const estante = await tx.estante.findUnique({
                        where: {
                            id: l.id_estante
                        },
                        include: {
                            modelo_estante: {
                                include: {
                                    modelo_prateleira_modelo_estante: {
                                        where: {
                                            coluna: l.coluna,
                                            linha: l.linha
                                        }
                                    }
                                }
                            }
                        }
                    });

                    if (!estante)
                        throw new FormFill(
                            `Não foi localizada a estante ${l.id_estante}`
                        );

                    const modeloPosicao =
                        estante.modelo_estante.modelo_prateleira_modelo_estante[0];

                    if (!modeloPosicao)
                        throw new FormFill(
                            `Não existe modelo de prateleira na posição (${l.linha}, ${l.coluna})`
                        );

                    return {
                        estante,
                        modeloPosicao,
                        local: l
                    };
                })
            );

            // 2. Resolver as prateleiras
            const prateleiraDB = await Promise.all(
                estanteDB.map(async ({ estante, modeloPosicao, local: l }) => {
                    const prateleiraCadastrada = await tx.prateleira.findUnique({
                        where: {
                            id_estante_linha_coluna: {
                                id_estante: l.id_estante,
                                coluna: l.coluna,
                                linha: l.linha
                            }
                        }
                    })

                    // Prateleira já cadastrada
                    if (prateleiraCadastrada) {
                        return {
                            id: prateleiraCadastrada.id,
                            quantidade: l.quantidade
                        };
                    }

                    // Prateleira ainda não cadastrada: criar pelo modelo
                    const prateleira = await tx.prateleira.upsert({
                        where: {
                            id_estante_linha_coluna: {
                                id_estante: estante.id,
                                coluna: l.coluna,
                                linha: l.linha
                            }
                        },
                        create: {
                            id_estante: estante.id,
                            coluna: l.coluna,
                            linha: l.linha,
                            id_modelo_prateleira:
                                modeloPosicao.id_modelo_prateleira
                        },
                        update: {}
                    });

                    if (
                        prateleira.id_modelo_prateleira !==
                        modeloPosicao.id_modelo_prateleira
                    ) {
                        throw new Error(
                            "A prateleira existente não corresponde ao modelo configurado"
                        );
                    }

                    return {
                        id: prateleira.id,
                        quantidade: l.quantidade
                    };
                })
            );

            let marcaId = newProduto.id_marca

            if((marcaId == null || marcaId == 0) && marca != null)
                marcaId =  (await tx.marca.upsert({
                        where: {
                            nome: marca
                        },
                        create: {
                            nome: marca
                        },
                        update: {}
                    })).id

            produto.id_marca = (marcaId == 0) ? null: marcaId;

            // Evita associar o produto duas vezes à mesma prateleira
            const idsPrateleiras = prateleiraDB.map(p => p.id);

            if (new Set(idsPrateleiras).size !== idsPrateleiras.length)
                throw new FormFill(
                    "Uma mesma prateleira foi informada mais de uma vez"
                );

            // 3. Criar o produto e suas relações
            const produtoDB = await tx.produto.create({
                data: {
                    ...produto,

                    qtd_disponivel,

                    produto_imagem: {
                        create: imagens.map(caminho => ({
                            imagem: {
                                create: {
                                    caminho
                                }
                            }
                        }))
                    },
                    ...((atributosToAdd)?({produto_atributo: {
                        create: atributosToAdd
                    }}) : {}),

                    produto_prateleira: {
                        create: prateleiraDB.map(p => ({
                            quantidade: p.quantidade,
                            prateleira: {
                                connect: {
                                    id: p.id
                                }
                            }
                        }))
                    }
                }
            });

            return produtoDB;
        });

        return result;
    }


    async getByFilter(filter: ProdutoFilterDTO): Promise<ProdutoGetDTO[]>{

        const where: Prisma.produtoWhereInput = {
            ...(filter.nome && {
                nome: {
                    contains: filter.nome,
                    mode: "insensitive"
                }
            }),
            ...(filter.id_categoria !== undefined && {
                id_categoria: Array.isArray(filter.id_categoria) ? { in: filter.id_categoria } : filter.id_categoria
            }),
            ...(filter.id_marca !== undefined && {
                id_marca: Array.isArray(filter.id_marca) ? { in: filter.id_marca} : filter.id_marca
            }),
            ...(filter.disponibilidade === "em_estoque" && {
                qtd_disponivel: {
                    gt: 0
                }
            }),
            ...(filter.disponibilidade === "sem_estoque" && {
                qtd_disponivel: {
                    equals: 0
                }
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
                },
                categoria: true,
                produto_atributo: {
                    include: {
                        atributo: true
                    }
                },
                marca: true
            }
        })

        if(!result)
            return null;

        const {produto_prateleira, produto_imagem, produto_atributo = [], ...dados} = result;

        const prateleiras = (await Promise.all(produto_prateleira.map(async pp => {
            const localId = pp.prateleira.estante.id_local;
                return {
                    ...pp.prateleira,
                    quantidade: pp.quantidade,
                    estante: {
                        ...pp.prateleira.estante,
                        local: (localId)? await localModel.getHierarquiaLocal(localId): []
                    }

                }

        }))).filter((p): p is PrateleiraDTO => p !== null)

        const atributos: Record<string, number | string | null> = {};
        produto_atributo.map((p) => {
            const {atributo, valor_numerico, valor_texto} = p
            if(atributo.numerico && valor_numerico){
                atributos[atributo.nome] = Number(valor_numerico)
                return
            }else if(valor_texto){
                atributos[atributo.nome] = valor_texto
                return
            }
            atributos[atributo.nome] = null
        })

        return {
            ...dados,
            imagens: produto_imagem.map(pi => (pi.imagem)),
            prateleiras: prateleiras,
            atributos: atributos
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

export {ProdutoModel, ProdutoCreateDTO, ProdutoImagemLocalizacaoDTO, ProdutoUpdateDTO}