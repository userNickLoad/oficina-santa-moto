import { Router } from "express";
import { criarProduto, buscarProdutos, getProdutoByIdMiddle, listarProdutosEstoque, update} from "../controller/produtoController.js";
import { upload } from "../middlewares/multerConfig.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = Router();

router.post("/", upload.array("imagem[]", 10), criarProduto);
router.get("/", buscarProdutos);
router.get("/estoque",  listarProdutosEstoque);

router.post("/:id/editar", upload.array("imagem[]", 10), update);


export default router;