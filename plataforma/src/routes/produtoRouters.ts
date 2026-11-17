import { Router } from "express";
import { criarProduto, buscarProdutos, getProdutoByIdMiddle} from "../controller/produtoController.js";
import { upload } from "../middlewares/multerConfig.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = Router();

router.post("/", upload.array("imagem[]", 10), criarProduto);
router.get("/", authMiddleware, buscarProdutos);

export default router;