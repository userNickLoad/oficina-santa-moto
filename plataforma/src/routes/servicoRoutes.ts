import { Router } from "express";
import { getServicosEmAndamento,getTodosServicos, concluirServico, cancelarServico,registrarServico} from "../controller/servicoController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/em-andamento", authMiddleware, getServicosEmAndamento);
router.get("/todos", authMiddleware, getTodosServicos);
router.patch("/:id/concluir", authMiddleware, concluirServico);
router.patch("/:id/cancelar", authMiddleware, cancelarServico);
router.post("/", authMiddleware, registrarServico);

export default router;
