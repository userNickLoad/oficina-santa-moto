import { estante, local, modelo_estante } from "../../generated/prisma/client.js";
import prisma from "../database/prisma.js";

type Local = {
                id: number;
                id_local: number | null;
                nome: string;
                linha: number;
                coluna: number;
            };

type LocalPathDTO = {id: number, nome: string, path: string}

type EstanteWithModeloDTO = estante & {qtd_linhas: number, qtd_colunas: number}

type LocalPathEstanteDTO = Local & {path: string, estantes: EstanteWithModeloDTO[]}

class LocalModel{
    async getHierarquiaLocal(idLocal: number){
        return await prisma.$queryRaw<
            Local[]
        >`
            WITH RECURSIVE hierarquia AS (
                SELECT id, id_local, nome, linha, coluna
                FROM local
                WHERE id = ${idLocal}

                UNION ALL

                SELECT
                    pai.id,
                    pai.id_local,
                    pai.nome,
                    pai.linha,
                    pai.coluna
                FROM local AS pai
                INNER JOIN hierarquia AS filho
                    ON filho.id_local = pai.id
            )
            SELECT *
            FROM hierarquia;
        `;
    }

    async getLocalsFromOutside(path: string): Promise<LocalPathDTO[]>{
        const normalizedPath = path.trim().replace(/^\/+|\/+$/g, "");

        if (!normalizedPath) return [];

        return await prisma.$queryRaw<
            LocalPathDTO[]
        >`
            WITH RECURSIVE

            entrada AS (
                SELECT string_to_array(${normalizedPath}, '/') AS partes
            ),

            -- Encontra o caminho exato até o pai
            ancestrais AS (
                SELECT
                    l.id,
                    l.id_local,
                    l.nome,
                    1 AS nivel,
                    l.nome::TEXT AS path
                FROM local l
                CROSS JOIN entrada e
                WHERE cardinality(e.partes) > 1
                  AND l.id_local IS NULL
                  AND l.nome = e.partes[1]

                UNION ALL

                SELECT
                    filho.id,
                    filho.id_local,
                    filho.nome,
                    pai.nivel + 1,
                    pai.path || '/' || filho.nome
                FROM local filho
                INNER JOIN ancestrais pai
                    ON filho.id_local = pai.id
                CROSS JOIN entrada e
                WHERE pai.nivel < cardinality(e.partes) - 1
                  AND filho.nome = e.partes[pai.nivel + 1]
            ),

            -- Encontra os locais que correspondem ao prefixo
            correspondentes AS (
                -- Pesquisa diretamente nas raízes
                SELECT
                    l.id,
                    l.id_local,
                    l.nome,
                    l.nome::TEXT AS path
                FROM local l
                CROSS JOIN entrada e
                WHERE cardinality(e.partes) = 1
                  AND l.id_local IS NULL
                  AND l.nome ILIKE (e.partes[1] || '%')

                UNION ALL

                -- Pesquisa dentro do pai encontrado
                SELECT
                    filho.id,
                    filho.id_local,
                    filho.nome,
                    pai.path || '/' || filho.nome
                FROM ancestrais pai
                INNER JOIN local filho
                    ON filho.id_local = pai.id
                CROSS JOIN entrada e
                WHERE pai.nivel = cardinality(e.partes) - 1
                  AND filho.nome ILIKE (
                      e.partes[cardinality(e.partes)] || '%'
                  )
            ),

            -- Busca todos os descendentes dos locais encontrados
            resultados AS (
                SELECT 
                    *,
                    0 AS profundidade
                FROM correspondentes

                UNION ALL

                SELECT
                    filho.id,
                    filho.id_local,
                    filho.nome,
                    resultado.path || '/' || filho.nome,
                    resultado.profundidade + 1
                FROM local filho
                INNER JOIN resultados resultado
                    ON filho.id_local = resultado.id
            )

            SELECT
                id,
                nome,
                path
            FROM resultados
            ORDER BY 
                profundidade ASC,
                path ASC
            LIMIT 20;
        `;
    }

    async getLocalsWithEstantes(path: string): Promise<LocalPathEstanteDTO[]>{
        const locais = await this.getLocalsFromOutside(path);

        const locaisMap = new Map<number, LocalPathDTO>()

        const locaisWithEstantes = await prisma.local.findMany({
            where: {
                id: {
                    in: locais.map(l => {
                        locaisMap.set(l.id, l)
                        return l.id
                    })
                }
            },
            include: {
                estante: {
                    include: {
                        modelo_estante: true
                    }
                }
            }
        });

        const locaisWithEstantesMap = new Map<number, {
            estante: {
                id: number;
                id_local: number;
                linha: number;
                coluna: number;
                id_modelo_estante: number;
                modelo_estante: modelo_estante;

            }[];
        } & {
            id: number;
            id_local: number | null;
            nome: string;
            linha: number;
            coluna: number;
            linhas: number;
            colunas: number;
        }>(locaisWithEstantes.map(l => [l.id, l]))

        return locais.map((l)=>{
            const {id, path} = l;

            const lwe = locaisWithEstantesMap.get(id)
            if(!lwe)
                throw new Error("path não encontrado")
            
            const {estante, ...dados} = lwe;

            return {
                    path,
                    estantes: estante.map(e => {
                        const {modelo_estante, ...es} = e;

                        return{
                            ...es,
                            qtd_linhas: modelo_estante.qtd_linhas,
                            qtd_colunas: modelo_estante.qtd_colunas
                        }
                    }),
                ...dados
            }
            
            
        })

    }

}

export {LocalModel, Local}