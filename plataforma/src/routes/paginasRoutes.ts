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
        title: "Produto",
        content: "../pages/cadastrar-produto",
        voltar: true
    });
})

router.get("/cadastrar-categoria", authMiddleware, (req: Request, res: Response) => {
    res.render("./layouts/index", {
        title: "Categoria",
        content: "../pages/cadastrar-categoria",
        voltar: true
    });
})

router.get("/cadastrar-marca", authMiddleware, (req: Request, res: Response) => {

    res.render("./layouts/index", {
        title: "Categoria",
        content: "../pages/cadastrar-marca",
        voltar: true
    });
})

router.get("/servicos", (req: Request, res: Response) => {

    res.render("./layouts/index", {
        title: "Serviços",
        content: "../pages/servicos",
        voltar: true
    });
})

router.get("/registrar-servico", (req: Request, res: Response) => {
    res.render("./layouts/index", {
        title: "Registrar Serviço",
        content: "../pages/registrar-servico",
        voltar: true
    });
});

router.get("/concluir-servico", (req: Request, res: Response) => {
    res.render("./layouts/index", {
        title: "Concluir Serviço",
        content: "../pages/concluir-servico",
        voltar: true
    });
});

export default router;