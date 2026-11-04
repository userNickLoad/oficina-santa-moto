import { Router, Response, Request } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, (req: Request, res: Response) => {

    const userName = res.locals.usuario.nome;
    res.render("./layouts/index", {
        title: "inicio",
        userName,
        content: "../pages/inicio",
        voltar: false
    });
});

router.get("/entrar", (req: Request, res: Response) => {
    
    res.render("./layouts/index", {
        title: "entrar",
        content: "../pages/entrar",
        voltar: false
    });
});


router.get("/estoque", authMiddleware, (req: Request, res: Response) => {

    res.render("./layouts/index", {
        title: "estoque",
        content: "../pages/estoque",
        voltar: true
    });
})


router.get("/cadastrar-produto", authMiddleware, (req: Request, res: Response) => {

    res.render("./layouts/index", {
        title: "Cadastrar produto",
        content: "../pages/cadastrar-produto",
        voltar: true
    });
})

export default router;