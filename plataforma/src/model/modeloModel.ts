import { marca, modelo } from "../../generated/prisma/client.js"
import prisma from "../database/prisma.js"

type Modelo = modelo;
type ModeloDTO = Modelo & {marca: marca};

class ModeloModel{
    async getModeloByNome(modeloNome: string): Promise<ModeloDTO[]> {
        const result = await prisma.modelo.findMany({
            where: {
                nome: {
                    startsWith: modeloNome,
                    mode: "insensitive"
                }
            },
            include: {
                marca: true
            },
            take: 20
        });

       
        return result;
    }
}

export {Modelo, ModeloDTO, ModeloModel}