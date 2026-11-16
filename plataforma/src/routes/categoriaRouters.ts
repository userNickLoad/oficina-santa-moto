import { CategoriaController } from "../controller/categoriaController.js"; 
import { Router } from "express";

const router = Router();

const categoriaController = new CategoriaController();

router.get("/", categoriaController.getByStartsWithName);
router.post("/", categoriaController.create);


export default router;