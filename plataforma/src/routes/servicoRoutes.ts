import { Router } from "express";
import {
    getServicosEmAndamento,
    concluirServico,
    registrarServico
} from "../controller/servicoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/em-andamento", authMiddleware, getServicosEmAndamento);

router.patch("/:id/concluir", authMiddleware, concluirServico);
router.post("/", authMiddleware, registrarServico);

export default router;
