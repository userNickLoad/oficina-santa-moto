import { Request, Response, NextFunction } from "express";
import { getSession } from "./getSession.js";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const token: string | null = req.cookies?.session_id

        if(token == null){
            return; // res.status(403).redirect("/entrar")
        }

        const session = await getSession(token);

        if(session == null){
            res.clearCookie("session_id", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/"
            });

            return res.redirect("/entrar");
        }

        res.locals.usuario = session;

        next();
    }catch(e){
        console.log(e)
    }
}