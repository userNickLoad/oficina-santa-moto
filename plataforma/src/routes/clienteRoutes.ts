import { Router } from "express";
import { buscarClientes, cadastrarCliente, updateCliente } from "../controller/clienteController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/buscar", authMiddleware, buscarClientes);
router.post("/cadastrar", authMiddleware, cadastrarCliente);
router.post("/editar/:id", authMiddleware, updateCliente);

export default router;