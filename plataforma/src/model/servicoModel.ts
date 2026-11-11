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

    async registrarServico(dados: {
        descricao: string;
        preco: string;
        id_cliente: number;
        id_modelo: number;
        ano: number;
        id_usuario: number;
        produtos: {
            id_produto: number;
            quantidade: number;
            preco: string;
        }[];
    }): Promise<Servico> {
        return await db.$transaction(async (txt) => {
            const veiculo = await txt.veiculo.create({
                data: {
                    ano: dados.ano,
                    id_modelo: dados.id_modelo
                }
            });

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

            const servico = await txt.servico.create({
                data: {
                    descricao: dados.descricao,
                    preco: dados.preco,
                    id_cliente: dados.id_cliente,
                    id_veiculo: veiculo.id,
                    status: "EM_ANDAMENTO"
                }
            });
            return servico;
        });
    }
}
