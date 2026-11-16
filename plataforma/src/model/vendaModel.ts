import db from "../database/prisma.js";

export class VendaModel {

    async buscarResumoVendas() {
        const vendas = await db.venda.findMany({
            where: {
                venda_produto: {
                    some: {}
                }
            },
            include: {
                venda_produto: {
                    include: {
                        produto: true
                    }
                },
                cliente: true
            },
            orderBy: {
                data: "desc"
            }
        });
        let totalVendido = 0;
        const vendasRecentes = vendas.map((venda) => {
            const totalProdutos = venda.venda_produto.reduce(
                (total, item) => {
                    return total + Number(item.preco) * item.quantidade;
                },
                0
            );
            totalVendido += totalProdutos;
            return {
                id: venda.id,
                data: venda.data,
                cliente: venda.cliente?.nome ?? "Cliente não informado",
                total: totalProdutos,
                produtos: venda.venda_produto.map((item) => ({
                    nome: item.produto.nome,
                    quantidade: item.quantidade,
                    preco: Number(item.preco)
                }))
            };
        });
        return {
            totalVendido,
            quantidadeVendas: vendas.length,
            vendasRecentes: vendasRecentes.slice(0, 5)
        };
    }

    async buscarHistoricoVendas(filtros: {
        cliente?: string;
        dataInicial?: string;
        dataFinal?: string;
    } = {}) {

        const dataInicial = filtros.dataInicial
            ? new Date(`${filtros.dataInicial}T00:00:00-03:00`)
            : undefined;

        const dataFinal = filtros.dataFinal
            ? new Date(`${filtros.dataFinal}T23:59:59.999-03:00`)
            : undefined;

        const vendas = await db.venda.findMany({
            where: {
                venda_produto: {
                    some: {}
                },

                ...(filtros.cliente && {
                    cliente: {
                        is: {
                            nome: {
                                contains: filtros.cliente,
                                mode: "insensitive"
                            }
                        }
                    }
                }),

                ...((dataInicial || dataFinal) && {
                    data: {
                        ...(dataInicial && { gte: dataInicial }),
                        ...(dataFinal && { lte: dataFinal })
                    }
                })
            },

            include: {
                cliente: true,
                venda_produto: {
                    include: {
                        produto: true
                    }
                }
            },

            orderBy: {
                data: "desc"
            }
        });

        return vendas.map((venda) => ({
            id: venda.id,
            data: venda.data,
            cliente: venda.cliente?.nome ?? "Venda avulsa",

            produtos: venda.venda_produto.map((item) => ({
                nome: item.produto.nome,
                quantidade: item.quantidade,
                preco: Number(item.preco)
            })),

            total: venda.venda_produto.reduce(
                (total, item) =>
                    total + Number(item.preco) * item.quantidade,
                0
            )
        }));
    }

    async registrarVenda(dados: {
        id_usuario: number;
        id_cliente: number | null;
        produtos: {
            id_produto: number;
            quantidade: number;
        } [];
    }) {
        return await db.$transaction(async (tx) => {
            let totalProdutos = 0;
            const itens = [];

            for(const item of dados.produtos){
                if(!Number.isSafeInteger(item.quantidade) || item.quantidade <=0 ){
                    throw new Error("A quantidade vendida não pode ser negativa");
                }
                
                const produto = await tx.produto.findUnique({
                    where: {
                        id: item.id_produto
                    }
                });

                if(!produto){
                    throw new Error(`Produto ${item.id_produto} não encontrado`);
                }

                const atualizacao = await tx.produto.updateMany({
                    where: {
                        id: item.id_produto,
                        qtd_disponivel: {
                            gte: item.quantidade
                        }
                    },
                    data: {
                        qtd_disponivel: {
                            decrement: item.quantidade
                        }
                    }
                });

                if(atualizacao.count === 0){
                    throw new Error(`Estoque insuficiente para ${produto.nome}`);
                }

                const preco = produto.preco_venda;

                totalProdutos += Number(preco) * item.quantidade;

                itens.push({
                    id_produto: item.id_produto,
                    quantidade: item.quantidade,
                    preco,
                    preco_original: preco
                });
            }

            const venda = await tx.venda.create({
                data: {
                    data: new Date(),
                    preco_total: totalProdutos,
                    id_usuario: dados.id_usuario,
                    id_cliente: dados.id_cliente
                }
            });

            for(const item of itens){
                await tx.venda_produto.create({
                    data: {
                        id_venda: venda.id,
                        ...item
                    }
                });
            }
            return venda;
        });
    }

    async excluirVenda(idVenda: number) {
        return await db.$transaction(async (tx) => {

            const venda = await tx.venda.findUnique({
                where: {
                    id: idVenda
                },
                include: {
                    venda_produto: true,
                    servico: true
                }
            });

            if (!venda) {
                throw new Error("Venda não encontrada.");
            }

            if (venda.servico.length > 0) {
                throw new Error(
                    "Não é possível excluir uma venda vinculada a um serviço."
                );
            }

            for (const item of venda.venda_produto) {
                await tx.produto.update({
                    where: {
                        id: item.id_produto
                    },
                    data: {
                        qtd_disponivel: {
                            increment: item.quantidade
                        }
                    }
                });
            }

            await tx.venda_produto.deleteMany({
                where: {
                    id_venda: idVenda
                }
            });

            await tx.venda.delete({
                where: {
                    id: idVenda
                }
            });

            return {
                mensagem: "Venda excluída com sucesso."
            };
        });
    }
}
