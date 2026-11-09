import db from "../database/prisma.js";

export class ClienteModel {

    async buscarPorNome(nome: string) {
        return await db.cliente.findMany({
            where: {
                nome: {
                    contains: nome,
                    mode: "insensitive"
                }
            },
            select: {
                id: true,
                nome: true,
                telefone: true
            },
            orderBy: {
                nome: "asc"
            },
            take: 10
        });
    }

    async cadastrarCliente(dados: {
    nome: string;
    telefone: string | null;
    }) {
        return await db.cliente.create({
            data: {
                nome: dados.nome,
                telefone: dados.telefone
            }
        });
    }
}