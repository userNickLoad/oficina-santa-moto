import { Router } from "express";
import { criarProduto, buscarProdutos, getProdutoByIdMiddle, listarProdutosEstoque, update, baixa, entrada, consultarEstoqueProduto} from "../controller/produtoController.js";
import { upload } from "../middlewares/multerConfig.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = Router();

router.post("/", upload.array("imagem[]", 10), criarProduto);
router.get("/", buscarProdutos);
router.get("/estoque",  listarProdutosEstoque);
router.get("/:id/estoque", authMiddleware, consultarEstoqueProduto);
router.post("/:id/editar", upload.array("imagem[]", 10), update);

router.post("/:id/baixa", baixa);
router.post("/:id/entrada", entrada);




export default router;