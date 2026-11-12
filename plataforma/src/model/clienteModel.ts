import { cliente, marca, modelo, Prisma, veiculo } from "../../generated/prisma/client.js";
import db from "../database/prisma.js";
import { UniqueError } from "./errors.js";

type Cliente = cliente;
type MarcaCreateDTO = Omit<marca, "id"> ;

type ModeloCreateDTO = Omit<modelo, "id" | "id_marca"> & {
    marca: MarcaCreateDTO;
};

type VeiculoCreateDTO = Omit<
    veiculo,
    "id" | "id_modelo" | "id_cliente"
> & {
    modelo: ModeloCreateDTO;
};

export type ClienteCreateDTO = Omit<Cliente, "id"> & {
    veiculos: VeiculoCreateDTO[];
};

export class ClienteModel {

    async buscarPorNome(nome: string) {
        return await db.cliente.findMany({
            where: {
                nome: {
                    contains: nome,
                    mode: "insensitive"
                }
            },
            select: {
                id: true,
                nome: true,
                telefone: true
            },
            orderBy: {
                nome: "asc"
            },
            take: 10
        });
    }

    
    async cadastrarCliente(dados: ClienteCreateDTO) {
        const { veiculos, ...cliente } = dados;
        console.log(JSON.stringify(dados))
        try{
            const result =  await db.$transaction(async (tx) => {
                // 1. Cria o cliente
                const novoCliente = await tx.cliente.create({
                    data: cliente
                });
                
                // 2. Processa os veículos
                for (const { modelo, ...veiculo } of (veiculos ?? [])) {

                    const { marca, ...modeloData } = modelo;

                    // 3. Busca ou cria a marca
                    const marcaDB = await tx.marca.upsert({
                        where: {
                            nome: marca.nome
                        },
                        update: {},
                        create: {
                            ...marca
                        }
                    });
                    console.log(marcaDB)


                    // 4. Busca ou cria o modelo
                    const modeloDB = await tx.modelo.upsert({
                        where: {
                            id_marca_nome: {
                                id_marca: marcaDB.id,
                                nome: modeloData.nome
                            }
                        },
                        update: {},
                        create: {
                            ...modeloData,
                            id_marca: marcaDB.id
                        }
                    });
                    console.log(modeloDB)


                    // 5. Cria o veículo associado ao cliente e modelo
                    await tx.veiculo.create({
                        data: {
                            ...veiculo,
                            id_cliente: novoCliente.id,
                            id_modelo: modeloDB.id
                        }
                    });
                }

                return novoCliente;
            });

            return result;
            
        }catch(error){

            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
                throw new UniqueError("O cliente já existe");
            }
            
            console.log(error)
            throw error;
            
        }

    }
}

export {VeiculoCreateDTO, ModeloCreateDTO, MarcaCreateDTO}