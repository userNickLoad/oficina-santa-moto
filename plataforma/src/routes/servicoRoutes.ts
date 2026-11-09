
import { Router } from "express";
import {
    getServicosEmAndamento,
    concluirServico
} from "../controller/servicoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/em-andamento", authMiddleware, getServicosEmAndamento);

router.patch("/:id/concluir", authMiddleware, concluirServico);

export default router;
