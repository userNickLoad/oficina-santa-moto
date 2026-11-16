import { Router } from "express";
import { criarProduto, buscarProdutos } from "../controller/produtoController.js";
import { upload } from "../middlewares/multerConfig.js";


const router = Router();

router.post("/", upload.array("imagem[]", 10), criarProduto);
router.get("/", buscarProdutos);

export default router;