import { local } from "../../generated/prisma/client.js";
import prisma from "../database/prisma.js";

type Local = {
                id: number;
                id_local: number | null;
                nome: string;
                linha: number;
                coluna: number;
            };

class LocalModel{
    async getHierarquiaLocal(idLocal: number){
        return await prisma.$queryRaw<
            Local[]
        >`
            WITH RECURSIVE hierarquia AS (
                SELECT id, id_local, nome, linha, coluna
                FROM local
                WHERE id = ${idLocal}

                UNION ALL

                SELECT
                    pai.id,
                    pai.id_local,
                    pai.nome,
                    pai.linha,
                    pai.coluna
                FROM local AS pai
                INNER JOIN hierarquia AS filho
                    ON filho.id_local = pai.id
            )
            SELECT *
            FROM hierarquia;
        `;
    }
}

export {LocalModel, Local}