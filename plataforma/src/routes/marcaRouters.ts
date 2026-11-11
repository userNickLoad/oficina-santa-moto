import { MarcaController } from "../controller/marcaController.js";
import { Router } from "express";

const router = Router();

const marcaController = new MarcaController();

router.get("/", marcaController.getByStartsWithName)

export default router;