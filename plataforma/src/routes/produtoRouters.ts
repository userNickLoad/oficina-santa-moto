import { Router } from "express";
import { criarProduto, buscarProdutos, listarProdutosEstoque } from "../controller/produtoController.js";
import { upload } from "../middlewares/multerConfig.js";


const router = Router();

router.post("/", upload.array("imagem[]", 10), criarProduto);
router.get("/", buscarProdutos);
router.get("/estoque", listarProdutosEstoque);

export default router;