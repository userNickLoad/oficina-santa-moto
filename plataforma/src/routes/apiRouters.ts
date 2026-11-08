import Router, { Request, Response } from "express";
import usuarioRoutes from "./usuarioRoutes.js"
import servicoRoutes from "./servicoRouters.js";

const router = Router();

router.use("/usuario", usuarioRoutes);
router.use("/servico", servicoRoutes);

export default router;