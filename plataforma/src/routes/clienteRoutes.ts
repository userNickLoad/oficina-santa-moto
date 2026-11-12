import { Router } from "express";
import { buscarClientes, cadastrarCliente, cadastrarClienteServico } from "../controller/clienteController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/buscar", authMiddleware, buscarClientes);
router.post("/cadastrar", authMiddleware, cadastrarCliente);
router.post("/cadastrar-servico", cadastrarClienteServico);

export default router;