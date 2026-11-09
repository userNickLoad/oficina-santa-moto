import { atributo } from "../../generated/prisma/client.js";
import prisma from "../database/prisma.js";

type Atributo = atributo;
type AtributoCreateDTO = Omit<Atributo, "id">
type AtributoUpdateDTO = {id: number} & Partial<AtributoCreateDTO>

class AtributoModel{
    async create(newAtribuotos: AtributoCreateDTO[]): Promise<Atributo[]>{
        const result = await prisma.atributo.createManyAndReturn({
            data: newAtribuotos
        });

        return result;
    }

    async update(newAtributos: AtributoUpdateDTO[]){
        const result = await prisma.atributo.updateManyAndReturn({
            data: newAtributos
        });

        return result;
    }
}

export {Atributo, AtributoCreateDTO, AtributoModel}