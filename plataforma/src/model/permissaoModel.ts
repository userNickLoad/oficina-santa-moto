import type { permissao } from "../../generated/prisma/client.js";
import { NextFunction, Request, Response } from "express";
import { redisdb } from "../../redis.config.js";
import db from "../database/prisma.js";

export type Permissao = permissao;

export const getPerfisByCaminhoOut = (caminho: string) =>{
    const db_data = db.caminho.findMany({
        
    })
}