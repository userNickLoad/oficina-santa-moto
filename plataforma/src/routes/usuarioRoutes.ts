import { UsuarioController } from "../controller/usuarioController.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

const usuarioController = new UsuarioController();

router.post("/entrar", usuarioController.entrar);
router.post("/cadastrar", authMiddleware, usuarioController.cadastrar);
// router.get("/:id", getUsuarioById);

export default router;