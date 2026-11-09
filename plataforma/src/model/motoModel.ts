
import db from "../database/prisma.js";

export class MotoModel {

    async listarMarcas() {
        return await db.marca.findMany({
            select: {
                id: true,
                nome: true
            },
            orderBy: {
                nome: "asc"
            }
        });
    }

    async listarModelos(idMarca: number) {
        return await db.modelo.findMany({
            where: {
                id_marca: idMarca
            },
            select: {
                id: true,
                nome: true
            },
            orderBy: {
                nome: "asc"
            }
        });
    }

    async cadastrarVeiculo(ano: number, idModelo: number) {
    return await db.veiculo.create({
        data: {
            ano: ano,
            id_modelo: idModelo
        }
    });
    }
}
