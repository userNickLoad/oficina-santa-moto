import { Router, Response, Request } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, (req: Request, res: Response) => {

    const userName = res.locals.usuario.nome;
    res.render("./layouts/index", {
        title: "inicio",
        userName,
        content: "../pages/inicio",
        voltar: true
    });
})

router.get("/entrar", (req: Request, res: Response) => {
    
    res.render("./layouts/index", {
        title: "entrar",
        content: "../pages/entrar",
        voltar: false
    });
})

export default router;