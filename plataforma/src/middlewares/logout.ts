import { Request, Response } from "express";
import { redisdb } from "../../redis.config.js";
import { hashSessionToken } from "../model/criptografia.js";

export const logout = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.session_id;

        if (token) {
            const sessionKey = `session:${hashSessionToken(token)}`;

            await redisdb.del(sessionKey);
        }

        res.clearCookie("session_id", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return res.redirect("/entrar");

    } catch (error) {
        console.error("Erro ao encerrar sessão:", error);

        return res.status(500).send("Erro ao sair do sistema.");
    }
};
