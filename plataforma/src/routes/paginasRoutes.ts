import { Router, Response, Request } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    const userName = "Nicolas";
    res.render("./layouts/index", {
        title: "inicio",
        userName,
        content: "../pages/inicio"
    });
})

router.get("/entrar", (req: Request, res: Response) => {
    
    res.render("./layouts/index", {
        title: "entrar",
        content: "../pages/entrar"
    });
})

export default router;