import { NextFunction, Request, Response } from "express";
import { redisdb } from "../../redis.config.js";
import db from "../database/prisma.js";
import { sessionInfo } from "./getSession.js";

const TTL = 60 * 60;

type caminhoPerfis = {
    perfis: number[];
}

export const permissoesMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const session: sessionInfo = res.locals?.usuario;

    if(session == null){
        return res.redirect("/entrar");
    }

    //esse eh o admin
    if(session.permissoes.includes(1)){
        next()
    }

    const url = req.path.split("/").filter(Boolean)


    var funcao = (url[0] == "api")? url[1] : url[0] 
    const key = `caminho:${funcao}`

    const data = redisdb.hGetAll(key)

    if(Object.keys(data).length === 0){
        const db_data = db.caminho.findMany({
            
        })
    }
}