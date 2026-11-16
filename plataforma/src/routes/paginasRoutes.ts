import { Router, Response, Request } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { ClienteModel } from "../model/clienteModel.js";
import { title } from "node:process";
import { VendaModel } from "../model/vendaModel.js";

const clienteModel = new ClienteModel();
const vendaModel = new VendaModel();

const router = Router();

router.get("/", authMiddleware, (req: Request, res: Response) => {

    const userName = res.locals.usuario.nome;
    res.render("./layouts/index", {
        title: "inicio",
        userName,
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


router.get("/estoque", authMiddleware, (req: Request, res: Response) => {

    res.render("./layouts/index", {
        title: "estoque",
        content: "../pages/estoque",
        voltar: true
    });
})


router.get("/cadastrar-produto", authMiddleware, (req: Request, res: Response) => {

    res.render("./layouts/index", {
        title: "Produto",
        content: "../pages/cadastrar-produto",
        voltar: true
    });
})

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
            mensagem: "Erro ao carregar as vendas."
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

export default router;