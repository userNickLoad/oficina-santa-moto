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
    }): Promise<Servico> {
        return await db.$transaction(async (txt) => {
            const veiculo = await txt.veiculo.create({
                data: {
                    ano: dados.ano,
                    id_modelo: dados.id_modelo
                }
            });

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
