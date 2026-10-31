import Router, { Request, Response } from "express";
import usuarioController from "../controller/usuarioController.js"

const router = Router();

router.use("/usuario", usuarioController);

export default router;