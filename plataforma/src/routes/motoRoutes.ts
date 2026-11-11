
import { Router } from "express";
import { listarMarcas, listarModelos } from "../controller/motoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { ModeloController } from "../controller/modeloController.js";

const router = Router();

const modeloController = new ModeloController();

router.get("/marcas", authMiddleware, listarMarcas);

router.get("/modelos", authMiddleware, listarModelos);

router.get("/modelo", authMiddleware, modeloController.getModeloByNome);

export default router;
