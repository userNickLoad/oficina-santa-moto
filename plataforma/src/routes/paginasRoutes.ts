import { Router, Response, Request, NextFunction } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { ClienteModel } from "../model/clienteModel.js";
import { VendaModel } from "../model/vendaModel.js";
import { AppError } from "../model/errors.js";
import { ProdutoImagemLocalizacaoDTO } from "../model/produtoModel.js";
import { getProdutoByIdMiddle } from "../controller/produtoController.js";
import { CategoriaModel } from "../model/categoriaModel.js";
import { MarcaModel } from "../model/marcaModel.js";
import { UsuarioController } from "../controller/usuarioController.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { UsuarioModel } from "../model/usuarioModel.js";
import { logout } from "../middlewares/logout.js";

const clienteModel = new ClienteModel();
const vendaModel = new VendaModel();
const categoriaModel = new CategoriaModel();
const marcaModel = new MarcaModel();
const usuarioController = new UsuarioController();

const router = Router();

router.get("/", authMiddleware, (req: Request, res: Response) => {

    const userName = res.locals.usuario.nome;
    const permissoes = res.locals.usuario.permissoes;
    res.render("./layouts/index", {
        title: "inicio",
        userName,
        permissoes,
        content: "../pages/inicio",
        voltar: false
    });
});

router.get("/entrar", (req: Request, res: Response) => {

    res.render("./layouts/index", {
        title: "entrar",
        content: "../pages/entrar",
        voltar: false
    });
});

router.post("/sair", logout);

router.get("/estoque", authMiddleware, async (req: Request, res: Response) => {
    try {
        const categoriasDB = await categoriaModel.getByStartsWithName("");
        const marcas = await marcaModel.getByStartsWithName("");

        const categories = categoriasDB.map(categoria => ({
            id: categoria.id,
            nome: categoria.nome,
            attributes: categoria.atributos.map(atributo => ({
                ...atributo,
                values: []
            }))
        }));

        res.render("./layouts/index", {
            title: "estoque",
            content: "../pages/estoque",
            voltar: true,
            categories,
            marcas
        });

    } catch (error) {
        console.error("Erro ao carregar filtros do estoque:", error);

        res.status(500).send("Erro ao carregar a página de estoque.");
    }
});


router.get("/cadastrar-produto", authMiddleware, (req: Request, res: Response) => {

    res.render("./layouts/index", {
        title: "Produto",
        content: "../pages/cadastrar-produto",
        voltar: true
    });
})


router.get("/estoque/produto/:id/baixa", authMiddleware, getProdutoByIdMiddle, (req: Request, res: Response) => {
    const produto = res.locals.produto as ProdutoImagemLocalizacaoDTO;

    return res.render("./layouts/index", {
        title: "Baixa de Produto",
        content: "../pages/baixa-estoque",
        voltar: true,
        voltarPara: `/estoque/produto/${produto.id}`,
        innerContent: { produto }
    });
});


router.get("/estoque/produto/:id/editar", authMiddleware, getProdutoByIdMiddle, (req: Request, res: Response) => {
    const produto = res.locals.produto as ProdutoImagemLocalizacaoDTO;

    res.render("./layouts/index", {
        title: "Produto",
        content: "../pages/editar-produto",
        voltar: true,
        innerContent: {produto}
    });
})

router.get("/estoque/produto/:id/baixa", authMiddleware, getProdutoByIdMiddle, (req: Request, res: Response) => {
    const produto = res.locals.produto as ProdutoImagemLocalizacaoDTO;

    res.render("./layouts/index", {
        title: "Produto",
        content: "../pages/produto-baixa",
        voltar: true,
        innerContent: {produto}
    });
})

router.get("/estoque/produto/:id/entrada", authMiddleware, getProdutoByIdMiddle, (req: Request, res: Response) => {
    const produto = res.locals.produto as ProdutoImagemLocalizacaoDTO;

    res.render("./layouts/index", {
        title: "Produto",
        content: "../pages/produto-entrada",
        voltar: true,
        innerContent: {produto}
    });
})

router.get("/estoque/produto/:id", authMiddleware, getProdutoByIdMiddle, (req: Request, res: Response) => {
    const produto = res.locals.produto as ProdutoImagemLocalizacaoDTO

    return  res.render("./layouts/index", {
        title: "Produto",
        content: "../pages/produto",
        voltar: true,
        innerContent: {produto}
    });
});

router.get("/cadastrar-categoria", authMiddleware, (req: Request, res: Response) => {
    res.render("./layouts/index", {
        title: "Categoria",
        content: "../pages/cadastrar-categoria",
        voltar: true
    });
})

router.get("/cadastrar-marca", authMiddleware, (req: Request, res: Response) => {

    res.render("./layouts/index", {
        title: "Categoria",
        content: "../pages/cadastrar-marca",
        voltar: true
    });
})

router.get("/servicos", authMiddleware, (req: Request, res: Response) => {

    res.render("./layouts/index", {
        title: "Serviços",
        content: "../pages/servicos",
        voltar: true,
        voltarPara: "/"
    });
});

router.get("/registrar-servico", authMiddleware, (req: Request, res: Response) => {
    res.render("./layouts/index", {
        title: "Registrar Serviço",
        content: "../pages/registrar-servico",
        voltar: true,
        voltarPara: "/servicos"
    });
});

router.get("/concluir-servico", authMiddleware, (req: Request, res: Response) => {
    res.render("./layouts/index", {
        title: "Concluir Serviço",
        content: "../pages/concluir-servico",
        voltar: true,
        voltarPara: "/servicos"
    });
});

router.get("/clientes", authMiddleware, async (req: Request, res: Response) => {
    const nome = req.query.nome?.toString().toLowerCase().trim();

    const clientes = await clienteModel.buscarPorNome((nome !== undefined)? nome: "");

    return res.render("./layouts/index", {
        title: "Clientes",
        content: "../pages/clientes",
        voltar: true,
        innerContent: { clientes }
    });

})

router.get("/clientes/cadastrar", authMiddleware, (req: Request, res: Response) => {
    return res.render("./layouts/index", {
        title: "Clientes",
        content: "../pages/cadastrar-cliente",
        voltar: true
    });
})

router.get("/clientes/editar/:id", authMiddleware, async(req: Request, res: Response) => {
    try{
        const id = Number(req.params.id ?? "")

        if(id < 1)
            throw new Error("O id n pode ser menor que 1");

        const cliente = await clienteModel.getClienteById(id);

        if(!cliente)
            return res.render("./layouts/index", {
                title: "Cliente",
                content: "../pages/error",
                innerContent: "404 cliente não encontrado",
                voltar: true
            });

        return res.render("./layouts/index", {
            title: "Cliente",
            content: "../pages/editar-cliente",
            innerContent: cliente,
            voltar: true
        });
    }catch(error){
        console.log(error)
        res.status(500).json({mensagem: "Erro de servidor."})
    }
})

router.get("/usuairo/atualizar-cadastro", authMiddleware, (req: Request, res: Response) => {
    return res.render("./layouts/index", {
        title: "Configurações",
        content: "../pages/configuracoes",
        voltar: true
    });
})

router.get("/vendas", authMiddleware, async (req: Request, res: Response) => {
    try {
        const resumo = await vendaModel.buscarResumoVendas();

        return res.render("./layouts/index", {
            title: "Vendas",
            content: "../pages/vendas",
            voltar: true,
            voltarPara: "/",
            innerContent: resumo
        });

    } catch (error) {
        console.error("Erro ao buscar vendas:", error);

        return res.status(500).json({
            mensagem: "Erro ao carregar as vendas"
        });
    }
});

router.get("/vendas/historico", authMiddleware, async(req: Request, res: Response) => {
    try{
        const cliente = String(req.query.cliente ?? "").trim();
        const dataInicial = String(req.query.dataInicial ?? "").trim();
        const dataFinal = String(req.query.dataFinal ?? "").trim();

        const vendas = await vendaModel.buscarHistoricoVendas({cliente, dataInicial, dataFinal});

        return res.render("./layouts/index", {
            title: "Histórico de vendas",
            content: "../pages/historico-vendas",
            voltar: true,
            voltarPara: "/vendas",
            innerContent: {
                vendas,
                filtros: {
                    cliente, dataInicial, dataFinal
                }
            }
        });
    } catch (error){
        console.error("Erro ao buscar histórico de vendas: ", error);
        return res.status(500).json({
            mensagem: "Erro ao carregar o histórico de vendas"
        });
    }
});

router.get("/funcionarios", authMiddleware, adminMiddleware, (req: Request, res: Response) =>
    usuarioController.listarFuncionarios(req, res)
);

router.get("/funcionarios/cadastrar", authMiddleware, adminMiddleware, (req: Request, res: Response) => {
    return res.render("./layouts/index", {
        title: "Cadastrar funcionário",
        userName: res.locals.usuario.nome,
        permissoes: res.locals.usuario.permissoes,
        content: "../pages/cadastrar-funcionario",
        innerContent: {},
        voltar: true
    });
});

router.post("/funcionarios/cadastrar", authMiddleware, adminMiddleware, (req: Request, res: Response) =>
    usuarioController.cadastrarFuncionario(req, res)
);

router.get("/funcionarios/editar/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send("ID de funcionario invalido");
    }

    try {
        const usuarioModel = new UsuarioModel();
        const funcionario = await usuarioModel.getFuncionarioById(id);

        if (!funcionario) {
            return res.status(404).send("Funcionario nao encontrado");
        }

        return res.render("./layouts/index", {
            title: "Editar funcionário",
            userName: res.locals.usuario.nome,
            permissoes: res.locals.usuario.permissoes,
            content: "../pages/editar-funcionario",
            innerContent: {
                funcionario
            },
            voltar: true
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send("Não foi possível carregar o funcionário");
    }
});

router.post(
    "/funcionarios/editar/:id",
    authMiddleware,
    adminMiddleware,
    (req: Request, res: Response) =>
        usuarioController.editarFuncionario(req, res)
);

// Tratamento global de erros
router.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || "Algo de errado ocorreu, entre em contato com a equipe tecnica";

    return res.status(statusCode).render("./layouts/index", {
        title: "Cliente",
        content: "../pages/error",
        innerContent: `${statusCode} ${message}`,
        voltar: true
    });
});

export default router;
