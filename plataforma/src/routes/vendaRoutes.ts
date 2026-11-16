import { Router } from "express";
import { registrarVenda, excluirVenda } from "../controller/vendaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, registrarVenda);
router.delete("/:id", authMiddleware, excluirVenda);

export default router;
