import { UsuarioController } from "../controller/usuarioController.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";



const router = Router();

const usuarioController = new UsuarioController();

router.post("/entrar", usuarioController.entrar);
router.post("/cadastrar", authMiddleware, adminMiddleware, usuarioController.cadastrar);
router.post("/atualizar", authMiddleware, usuarioController.update);

export default router;