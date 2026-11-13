import { cliente, marca, modelo, Prisma, veiculo } from "../../generated/prisma/client.js";
import prisma from "../database/prisma.js";
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

type VeiculoUpdateDTO = VeiculoCreateDTO & {id: number | null}

type ClienteUpdateDTO = Cliente & {veiculos: VeiculoUpdateDTO[]}

export class ClienteModel {

    async buscarPorNome(nome: string) {
        return await db.cliente.findMany({
            where: {
                nome: {
                    contains: nome,
                    mode: "insensitive"
                }
            },
            include: {
                veiculo: {
                    include: {
                        modelo: {
                            include: {
                                marca: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                nome: "asc"
            },
            take: 10
        });
    }

    async getClienteById(id: number) {
        return await db.cliente.findUnique({
            where: {
                id
            },
            include: {
                veiculo: {
                    include: {
                        modelo: {
                            include: {
                                marca: true
                            }
                        }
                    }
                }
            }
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

    async updateCliente(dados: ClienteUpdateDTO) {
        const {veiculos, ...cliente} = dados;

        console.log("updateCliente: ", dados);

        try{
            const result = await db.$transaction(async(tx)=> {
                const clienteDBPromise = tx.cliente.update({
                    where: {
                        id: cliente.id
                    },
                    data: cliente
                })

                const veiculosDBPromise = tx.veiculo.findMany({
                    where: {
                        id_cliente: cliente.id
                    },
                    include: {
                        modelo:{
                            include:{
                                marca: true
                            }
                        },
                        _count: {
                            select: {
                                servico: true
                            }
                        }
                    }
                })

                const [clienteDB, veiculosDB] = await Promise.all([clienteDBPromise, veiculosDBPromise]);


                const veiculosDelete: number[] = [];
                const veiculosDissosiete: number[] = [];
        
                veiculosDB.forEach( v => {
            
                    const aparece = veiculos.find((f) => (f.id === v.id));

                    if(v._count.servico == 0 && !aparece){
                        veiculosDelete.push(v.id);
                        return;
                    }

                    if(!aparece){
                        veiculosDissosiete.push(v.id)
                        return;
                    }
                });

                const updateVeiculos = []
                if(veiculosDelete.length > 0){

                    const deletePromise = prisma.veiculo.deleteMany({
                            where: {
                                id: {
                                    in: veiculosDelete
                                }
                            }
                        })
                    updateVeiculos.push(deletePromise);
                }

                
                if(veiculosDissosiete.length > 0){
                    const deletePromise = prisma.veiculo.updateMany({
                        where: {
                            id: {
                                in: veiculosDissosiete
                            }
                        },
                        data: {
                            id_cliente: undefined
                        }
                    });

                    updateVeiculos.push(deletePromise);
                }

                if(veiculos.length > 0){
                    const createPromise = veiculos.map(async (v) => {

                        const marcadb = await db.marca.upsert({
                            where: {
                                nome: v.modelo.marca.nome
                            },
                            update: {},
                            create: {
                                nome: v.modelo.marca.nome
                            }
                        });

                        const modelodb = (
                            await db.modelo.upsert({
                                where: {
                                    id_marca_nome: {
                                        id_marca: marcadb.id,
                                        nome: v.modelo.nome
                                    }
                                },
                                update: {},
                                create: {
                                    id_marca: marcadb.id,
                                    nome: v.modelo.nome
                                }
                            })
                        )
                        
                        if(v.id){
                            await db.veiculo.update({
                                where: {
                                    id: v.id,
                                    id_cliente: clienteDB.id
                                },
                                data: {
                                    ano: v.ano,
                                    id_modelo: modelodb.id
                                }
                            })
                        } else{
                            await db.veiculo.create({
                                data: {
                                    ano: v.ano,
                                    id_cliente: clienteDB.id,
                                    id_modelo: modelodb.id
                                }
                            })
                        }

                        
                    })

                    updateVeiculos.push(createPromise);
                }

                await Promise.all(updateVeiculos);


                return clienteDB;
            })

            return result;

        }catch(error){
            console.log(error)
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
                throw new UniqueError("O nome de cliente já existe");
            }
            
            throw error;
            
        }
    }
}

export {VeiculoCreateDTO, ModeloCreateDTO, MarcaCreateDTO, VeiculoUpdateDTO, ClienteUpdateDTO}