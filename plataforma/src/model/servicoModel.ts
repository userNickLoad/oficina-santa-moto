
import db from "../database/prisma.js";
import type { servico } from "../../generated/prisma/client.js";

export type Servico = servico;

export class ServicoModel {

    async getServicosEmAndamento(): Promise<Servico[]> {
        return await db.servico.findMany({
            where: {
                status: "EM_ANDAMENTO"
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
}
