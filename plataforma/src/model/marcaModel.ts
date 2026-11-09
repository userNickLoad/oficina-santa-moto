import { marca, Prisma } from "../../generated/prisma/client.js";
import prisma from "../database/prisma.js";
import { UniqueError } from "./errors.js";

type Marca = marca;
type MarcaCreateDTO = Omit<Marca, "id">

class MarcaModel{
    async getByStartsWithName(marcaName: string): Promise<Marca[]>{
        return await prisma.marca.findMany({
            where: {
                nome: {
                    startsWith: marcaName,
                    mode: "insensitive"
                }
            }
        });
    }

    async create(newMarca: MarcaCreateDTO){
        try{
            return await prisma.marca.create({
                data: newMarca
            });
        }catch(error){
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
                throw new UniqueError("Marca ja existe");

            throw error;
        }
    }
}

export {MarcaModel, Marca, MarcaCreateDTO}