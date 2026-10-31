import db from "../database/prisma.js";
import type { usuario } from "../../generated/prisma/client.js";

export type Usuario = usuario;

export class UsuarioModel{

    async getUsuarioById(id: number): Promise<usuario | null>{
        const usuario = await db.usuario.findUnique({
            where: {
                id: id
            }
        });

        return usuario;
    }
}