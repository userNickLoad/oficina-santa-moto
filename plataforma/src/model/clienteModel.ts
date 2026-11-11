import { cliente, marca, modelo, veiculo } from "../../generated/prisma/client.js";
import db from "../database/prisma.js";

type Cliente = cliente;
type MarcaCreateDTO = Omit<marca, "id">;

type ModeloCreateDTO = Omit<modelo, "id" | "id_marca"> & {
    marca: MarcaCreateDTO;
};

type VeiculoCreateDTO = Omit<veiculo, "id" | "id_modelo"> & {
    modelo: ModeloCreateDTO;
};

type ClienteCreateDTO = Omit<Cliente, "id"> & {
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

    
    const result =  await db.cliente.create({
        data: {
            ...cliente,

            veiculos: {
                create: veiculos.map(({ modelo, ...veiculo }) => {
                    const { marca, ...modeloData } = modelo;

                    return {
                        ...veiculo,

                        modelo: {
                            connectOrCreate: {
                                where: {
                                    nome: modeloData.nome
                                },

                                create: {
                                    ...modeloData,

                                    marca: {
                                        connectOrCreate: {
                                            where: {
                                                nome: marca.nome
                                            },

                                            create: {
                                                ...marca
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                })
            }
        }
    });
}

}