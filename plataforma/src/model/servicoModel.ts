import db from "../database/prisma.js";
import type { servico } from "../../generated/prisma/client.js";

export type Servico = servico;

export class ServicoModel {
    async getServicosEmAndamento() {
        return await db.servico.findMany({
            where: {
                status: "EM_ANDAMENTO"
            },
            include: {
                cliente: true,
                veiculo: {
                    include: {
                        modelo: {
                            include: {
                                marca: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                id: "desc"
            }
        });
    }

    async getTodosServicos(){
        return await db.servico.findMany({
            include: {
                cliente: true,
                veiculo: {
                    include: {
                        modelo: {
                            include: {
                                marca: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                id: "desc"
            }
        });
    }

    async concluirServico(id: number): Promise<Servico | null> {
        const resultado = await db.servico.updateMany({
            where: {
                id: id,
                status: "EM_ANDAMENTO"
            },
            data: {
                status: "CONCLUIDO"
            }
        });

        if (resultado.count === 0) {
            return null;
        }

        return await db.servico.findUnique({
            where: {
                id: id
            }
        });
    }

    async cancelarServico(id: number): Promise<Servico | null> {
        return await db.$transaction(async (txt) => {

            const resultado = await txt.servico.updateMany({
                where: {
                    id: id,
                    status: "EM_ANDAMENTO"
                },
                data: {
                    status: "CANCELADO"
                }
            });

            if (resultado.count === 0) {
                return null;
            }

            const servico = await txt.servico.findUniqueOrThrow({
                where: {
                    id: id
                }
            });

            if (servico.id_venda !== null) {
                const produtos = await txt.venda_produto.findMany({
                    where: {
                        id_venda: servico.id_venda
                    }
                });

                for (const item of produtos) {
                    await txt.produto.update({
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
            }

            return servico;
        });
    }
    
    async registrarServico(dados: {
        descricao: string;
        preco: string;
        id_cliente: number;
        id_veiculo: number;
        id_usuario: number;
        produtos: {
            id_produto: number;
            quantidade: number;
            preco: string;
        }[];
    }): Promise<Servico> {
        return await db.$transaction(async (txt) => {
            const veiculo = await txt.veiculo.findFirst({
                where: {
                    id: dados.id_veiculo,
                    id_cliente: dados.id_cliente
                }
            });

            if (!veiculo) {
                throw new Error("Veículo não encontrado para o cliente informado");
            }

            let totalProdutos = 0;

            for(const item of dados.produtos){
                const produto = await txt.produto.findUnique({
                    where: {
                        id: item.id_produto
                    }
                });

                if(!produto){
                    throw new Error(`Produto ${item.id_produto} não encontrado`);
                }

                const atualizacao = await txt.produto.updateMany({
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

                totalProdutos += Number(item.preco) * item.quantidade;
            }
            const valorTotal = Number(dados.preco) + totalProdutos;
            const venda = await txt.venda.create({
                data: {
                    data: new Date(),
                    preco_total: valorTotal,
                    id_usuario: dados.id_usuario,
                    id_cliente: dados.id_cliente
                }
            });
            for(const item of dados.produtos){
                const produto = await txt.produto.findUniqueOrThrow({
                    where: {
                        id: item.id_produto
                    }
                });
                await txt.venda_produto.create({
                    data: {
                        id_venda: venda.id,
                        id_produto: item.id_produto,
                        quantidade: item.quantidade,
                        preco: item.preco,
                        preco_original: produto.preco_venda
                    }
                });
            }
            const servico = await txt.servico.create({
                data: {
                    descricao: dados.descricao,
                    preco_mao_obra: dados.preco,
                    preco_total: valorTotal,
                    id_venda: venda.id,
                    id_cliente: dados.id_cliente,
                    id_veiculo: veiculo.id,
                    status: "EM_ANDAMENTO"
                }
            });
            return servico;
        });
    }
}
