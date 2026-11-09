import { categoria, Prisma } from "../../generated/prisma/client.js";
import prisma from "../database/prisma.js";
import { Atributo, AtributoCreateDTO } from "./atributoModel.js";
import { UniqueError } from "./errors.js";

type Categoria = categoria;
type CategoriaAtributosDTO = Categoria & {atributos: Atributo[]};
type CategoriaCreateDTO = Omit<Categoria, "id"> & {atributos: AtributoCreateDTO[]};
type CategoriaUpdateDTO = {
    id: number,
    nome?: string,
    descricao?: string | null
}



class CategoriaModel {
    async getByIdWithAtributos(categoriaId: number): Promise<CategoriaAtributosDTO | null> {
        const categoria = await prisma.categoria.findUnique({
            where: {
                id: categoriaId
            },
            include:{
                atributo: true
            }
        });

        if(!categoria)
            return null;

        const {atributo, ...dados } = categoria;

        return {
            ...dados,
            atributos: atributo
        }
    }

    async getByStartsWithName(categoriaName: string): Promise<Categoria[]>{
        try{
            return await prisma.categoria.findMany({
                where: {
                    nome: {
                        startsWith: categoriaName,
                        mode: "insensitive"
                    }
                }
            })
        }catch(error){
            throw error;
        }
        
    }

    async create(newCategoria: CategoriaCreateDTO): Promise<CategoriaAtributosDTO>{
        const {atributos, ...categoria} = newCategoria;

        try{
            const result = await prisma.categoria.create({
                data: {
                    ...categoria,
                    atributo: {
                        createMany: {
                            data: atributos
                        }
                    }
                },
                include: {
                    atributo: true
                }
            });

            const {atributo, ...dados} = result;

            return {
                ...dados,
                atributos: atributo
            }

        }catch(error){
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
                throw new UniqueError("O nome de categoria ja existe em outra categoria")
            }

            throw error
        }

    }

    async update(categoriaUpdate: CategoriaUpdateDTO): Promise<Categoria>{
        try{
            const {id, ...categoria} = categoriaUpdate;
            const result = await prisma.categoria.update({
                where: {
                    id
                },
                data: categoria
            });

            return result;
        }catch(error){

            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
                throw new UniqueError("O nome de categoria ja existe em outra categoria")
            }

            throw error;
        }

    }
}

export {Categoria, CategoriaModel, CategoriaAtributosDTO, CategoriaCreateDTO}