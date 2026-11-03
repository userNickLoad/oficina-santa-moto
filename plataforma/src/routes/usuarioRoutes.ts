import { cadastrar, entrar, getUsuarioById } from "../controller/usuarioController.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/entrar", entrar);
router.post("/cadastrar", authMiddleware, cadastrar);
// router.get("/:id", getUsuarioById);

export default router;