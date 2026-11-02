import { redisdb } from "../../redis.config.js";
import { hashSessionToken } from "../model/criptografia.js";

export type sessionInfo = {
    userId: string;
    nome: string;
    permissoes: number[];
}

export const getSession = async (token: string): Promise<sessionInfo | null> => {
    const sessionKey = `session:${hashSessionToken(token)}`;
    
    const data = await redisdb.hGetAll(sessionKey);

    if (Object.keys(data).length === 0) {
        return null;
    }

    return {
        userId: data.userId,
        nome: data.nome,
        permissoes: JSON.parse(data.permissoes)
    }
}