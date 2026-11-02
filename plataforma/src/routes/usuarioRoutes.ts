import { cadastrar, entrar, getUsuarioById } from "../controller/usuarioController.js";
import { Router } from "express";

const router = Router();

router.post("/entrar", entrar);
router.post("/cadastrar", cadastrar);
// router.get("/:id", getUsuarioById);

export default router;