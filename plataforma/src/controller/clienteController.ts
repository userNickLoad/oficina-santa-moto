import { Request, Response } from "express";
import { ClienteModel, VeiculoCreateDTO } from "../model/clienteModel.js";
import { UniqueError } from "../model/errors.js";

const clienteModel = new ClienteModel();

export const buscarClientes = async (req: Request, res: Response) => {
    try {
        const nome = String(req.query.nome ?? "").trim();

        if (nome.length < 2) {
            return res.status(400).json({
                mensagem: "Informe o nome do cliente"
            });
        }

        const clientes = await clienteModel.buscarPorNome(nome);

        return res.status(200).json(clientes);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensagem: "Erro ao buscar clientes."
        });
    }
};

export const cadastrarCliente = async(req: Request, res: Response) => {
    try{
        const nome = String(req.body.nome).trim();
        const telefone = (req.body.telefone)? "+55" + String(req.body.telefone).trim().replace(/\D/g, ''): null;
        const email = (req.body.email)? String(req.body.email).trim(): null;
        const vs = (req.body.veiculo)? req.body.veiculo : []

        const veiculos: VeiculoCreateDTO[] = vs.map((v: any) => {
            const {ano, modelo, marca} = v
            if(!ano)
                throw new Error("Ano não pode ser nulo")

            if(typeof modelo !== "string")
                throw new Error("modelo sem nome");

            if(typeof marca !== "string")
                throw new Error("marca sem nome")

            return {
                ano: Number(ano),
                modelo: {
                    nome: modelo,
                    marca: {
                        nome: marca
                    }
                }
            }
        })

        if(nome == "") {
            return res.status(400).json({
                mensagem: "Informe o nome do cliente."
            });
        }

        if(nome.length > 100){
            return res.status(400).json({
                mensagem: "Nome ou telefone excede o tamanho permitido."
            });
        }

        try{
            const cliente = await clienteModel.cadastrarCliente({
                nome,
                telefone,
                email,
                veiculos 
            });

            console.log(cliente)

            return res.status(200).json({confirm: "usuario cadastrado"})
        }catch(error){
            if(error instanceof UniqueError){
                return res.status(400).json({mensagem: error.message})
            }

            return res.status(500).json({mensagem: "Erro de servidor ou banco de dados"});
        }

    }catch (error){
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao cadastrar cliente."
        });
    }
};