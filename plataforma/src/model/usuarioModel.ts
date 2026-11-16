import db from "../database/prisma.js";
import { Prisma, type usuario, type usuario_permissao } from "../../generated/prisma/client.js";
import type { Permissao } from "./permissaoModel.js";
import { hashPassword, verifyPassword, generateSessionToken, hashSessionToken } from "./criptografia.js";
import { redisdb } from "../../redis.config.js"
import { FormFill } from "./errors.js";

export type Usuario = usuario;
export type UsuarioCadastroDTO = Omit<Usuario, "id">;
export type UsuarioEntraDTO = Pick<Usuario, "nome" | "senha">;
export type UsuarioPublicoDTO = Pick<Usuario, "nome" | "email" | "telefone">;
export type UsuarioPermissoesDTO = Omit<Usuario, "senha" | "usuario_permissao"> & { permissoes: Permissao[] | null };
export type UsuaioPermissao = usuario_permissao;
export type UsuarioUpdateDTO = Partial<Omit<Usuario, "id">> & {id: number}

export interface SessionData {
    userId: number;
    nome: string;
    permissoes: number[];
}

const SESSION_TTL = 60 * 60;

export class UsuarioJaExiste extends Error {
    constructor() {
        super("O usuario ja existe");
        this.name = 'UsuarioJaExisteError';
    }
};

export class UsuarioIncorreto extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UsuarioIncorretoError';
    }
};

export class UsuarioModel {

    async getUsuarioById(id: number): Promise<Usuario | null> {
        const usuario = await db.usuario.findUnique({
            where: {
                id: id
            }
        });

        return usuario;
    }

    async getAllUsuarios(): Promise<Usuario[]> {
        return await db.usuario.findMany();
    }

    async update(usuarioUpdate: UsuarioUpdateDTO, senhaCurrent: string, token: string): Promise<Usuario | null>{
        const {id, senha, ...dados} = usuarioUpdate;

        try{
            const usuario = await db.usuario.findUnique({
                where: {
                    id
                }
            });

            if(!usuario)
                throw new Error("Usuario não encontrado");

            if(!(await verifyPassword(usuario?.senha, senhaCurrent)))
                throw new FormFill("Senha incorreta");

            let hash = senha
            if(hash)
                hash = await hashPassword(hash)

            
            await this.revokeSession(token)

            const result = await db.usuario.update({
                where: {
                    id: id
                },
                data: {
                    ...dados,
                    ...((hash)? {
                        senha: hash
                    }: {})
                }
            });

            return result;

        } catch(error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new UsuarioJaExiste()
            }

            throw error
        }
    }

    async createSession(
        token: string,
        usuario: UsuarioPermissoesDTO
    ): Promise<void> {
        const sessionKey = `session:${hashSessionToken(token)}`;

        await redisdb.hSet(sessionKey, {
            userId: String(usuario.id),
            nome: usuario.nome,
            permissoes: JSON.stringify(usuario.permissoes)
        });

        await redisdb.expire(sessionKey, SESSION_TTL);
    }

    async getUsuarioPermissoes(newUsuario: UsuarioEntraDTO): Promise<UsuarioPermissoesDTO> {
        //Verifique se usuario não existe
        const usuario = await db.usuario.findUnique({
            where: {
                nome: newUsuario.nome
            },
            select: {
                id: true,
                nome: true,
                senha: true,
                email: true,
                telefone: true,
                usuario_permissao: {
                    select: {
                        permissao: {
                            select: {
                                id: true,
                                nome: true
                            }
                        }
                    }
                }
            }
        });

        //Se nao existe, lança uma exceção
        if (usuario == null) {
            throw new UsuarioIncorreto("Senha ou nome incorretos");
        }

        //se a senha está incorreta lança o mesmo erro
        if (!(await verifyPassword(usuario.senha, newUsuario.senha))) {
            throw new UsuarioIncorreto("Senha ou nome incorretos");
        }

        return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            permissoes: usuario.usuario_permissao.map(
                ({ permissao }) => permissao
            )
        };
    }

    async singUsuarioIn(newUsuario: UsuarioEntraDTO): Promise<string> {
        const usuario = await this.getUsuarioPermissoes(newUsuario);

        const token = generateSessionToken()

        await this.createSession(token, usuario)

        return token;
    }

    async singUsuarioUp(newUsuario: UsuarioCadastroDTO, permisoes: Permissao[]): Promise<Usuario> {
        console.log(permisoes)
        //criptografa a senha do usuario
        newUsuario.senha = await hashPassword(newUsuario.senha);
        try {
            // cria o usuario e configura suas permisoes
            const usuario = await db.usuario.create({
                data: {
                    ...newUsuario,
                    usuario_permissao: {
                        create: permisoes.map((permissao) => ({
                            permissao: {
                                connect: { id: permissao.id }
                            }
                        }))
                    }
                }
            });

            return usuario;
        } catch (error) {
            // se o erro eh uma restrição de unique, lança o erro tipificado
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new UsuarioJaExiste()
            }

            throw error;
        }
    }

    async revokeSession(
        token: string
    ){
        const sessionKey = `session:${hashSessionToken(token)}`;

        await redisdb.DEL(sessionKey);

    }
}