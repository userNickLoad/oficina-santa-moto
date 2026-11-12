import { Router, Response, Request } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { ClienteModel } from "../model/clienteModel.js";

const clienteModel = new ClienteModel()

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


export default router;