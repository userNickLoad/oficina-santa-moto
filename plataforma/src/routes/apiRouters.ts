import Router, { Request, Response } from "express";
import usuarioRoutes from "./usuarioRoutes.js"
import servicoRoutes from "./servicoRoutes.js";
import clienteRoutes from "./clienteRoutes.js";
import motoRoutes from "./motoRoutes.js";
import marcaRouters from "./marcaRouters.js"

const router = Router();

router.use("/usuario", usuarioRoutes);
router.use("/servico", servicoRoutes);
router.use("/cliente", clienteRoutes);
router.use("/moto", motoRoutes);
router.use("/marca", marcaRouters)

export default router;