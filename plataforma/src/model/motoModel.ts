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

    async cadastrarVeiculo(ano: number, idModelo: number, idCliente: number) {
        return await db.veiculo.create({
            data: {
                ano: ano,
                id_modelo: idModelo,
                id_cliente: idCliente
            }
        });
    }

    async cadastrarVeiculoCompleto(marcaNome: string, modeloNome: string,ano: number, idCliente: number) {
        return await db.$transaction(async (tx) => {
            let marca = await tx.marca.findFirst({
                where: {
                    nome: {
                        equals: marcaNome,
                        mode: "insensitive"
                    }
                }
            });

            if (!marca) {
                marca = await tx.marca.create({
                    data: {
                        nome: marcaNome
                    }
                });
            }

            let modelo = await tx.modelo.findFirst({
                where: {
                    nome: {
                        equals: modeloNome,
                        mode: "insensitive"
                    },
                    id_marca: marca.id
                }
            });

            if (!modelo) {
                modelo = await tx.modelo.create({
                    data: {
                        nome: modeloNome,
                        id_marca: marca.id
                    }
                });
            }

            return await tx.veiculo.create({
                data: {
                    ano,
                    id_modelo: modelo.id,
                    id_cliente: idCliente
                }
            });
        });
    }
}
