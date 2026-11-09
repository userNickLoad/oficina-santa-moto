
import { Router } from "express";
import { listarMarcas, listarModelos } from "../controller/motoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/marcas", authMiddleware, listarMarcas);

router.get("/modelos", authMiddleware, listarModelos);

export default router;
