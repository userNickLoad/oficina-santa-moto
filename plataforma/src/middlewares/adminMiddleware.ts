import { Request, Response, NextFunction } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const permissoes = res.locals.usuario?.permissoes ?? [];

    const ehAdmin = permissoes.some(
        (permissao: number | { id: number }) => typeof permissao === "number" ? permissao === 1 : permissao.id === 1
    );

    if (!ehAdmin) {
        res.status(403).send(
            "Você não tem permissão para acessar esta funcionalidade"
        );
        return;
    }

    next();
};