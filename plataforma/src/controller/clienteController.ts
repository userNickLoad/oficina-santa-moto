import { Request, Response } from "express";
import { ClienteModel } from "../model/clienteModel.js";

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
        console.log(req.body)
        const nome = String(req.body.nome ?? "").trim();
        const telefone = String(req.body.telefone ?? "").trim();

        if(!nome) {
            return res.status(400).json({
                mensagem: "Informe o nome do cliente."
            });
        }

        if(nome.length > 100 || telefone.length > 14){
            return res.status(400).json({
                mensagem: "Nome ou telefone excede o tamanho permitido."
            });
        }

        const cliente = await clienteModel.cadastrarCliente({
            nome,
            telefone: telefone || null
        });

        return res.status(201).json(cliente);
    }catch (error){
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao cadastrar cliente."
        });
    }
};