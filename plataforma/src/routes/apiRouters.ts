import Router from "express";
import usuarioRoutes from "./usuarioRoutes.js";
import servicoRoutes from "./servicoRoutes.js";
import clienteRoutes from "./clienteRoutes.js";
import motoRoutes from "./motoRoutes.js";
import categoriaRoutes from "./categoriaRouters.js";
import produtoRouters from "./produtoRouters.js"

import { buscarProdutos } from "../controller/produtoController.js";
import marcaRouters from "./marcaRouters.js";
import { LocalController } from "../controller/localController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use("/usuario", usuarioRoutes);
router.use("/servico", servicoRoutes);
router.use("/cliente", clienteRoutes);
router.use("/moto", motoRoutes);
router.use("/produto/buscar", buscarProdutos);
router.use("/marca", marcaRouters);
router.use("/categoria", categoriaRoutes);
router.use("/produto", authMiddleware, produtoRouters);

const localController = new LocalController;
router.get("/local", authMiddleware, localController.getLocal)

export default router;
