import { setHiddenContainer } from "./hiddenContainer.js";
import { setAddble } from "./addble.js";
import { setForm, verifyEmpty } from "./form.js";
import { setSearchBox } from "./searchBox.js";
// --------------------------------------------------
// Produto
// --------------------------------------------------
const form = document.querySelector("#form-editar-produto");
if (!form)
    throw new Error("Não foi possível localizar o formulário de edição");
// --------------------------------------------------
// Categoria
// --------------------------------------------------
const containerCategoria = document.querySelector("#container-h-categoria");
if (!containerCategoria)
    throw new Error("Não foi possível localizar containerCategoria");
const { update } = setHiddenContainer(containerCategoria, "desassociar");
const searchCategoria = containerCategoria.querySelector("#search-categoria");
if (!searchCategoria)
    throw new Error("Não foi possível localizar searchCategoria");
const addbleAtributos = containerCategoria.querySelector("#addble-container-atributos");
if (!addbleAtributos)
    throw new Error("Não foi possível localizar addbleAtributos");
const categoriaId = searchCategoria.querySelector("#search-hidden-categoria");
if (!categoriaId)
    throw new Error("Não foi possível localizar categoriaId");
let atributoIndex = 0;
const { addELement, wipeout } = setAddble(addbleAtributos, "atributo", atributoIndex);
const preencherAtributos = (categoria, valores = {}) => {
    wipeout();
    categoria.atributos.forEach((at) => {
        const clone = addELement(undefined, at.nome);
        const label = clone.querySelector("label");
        if (!label)
            throw new Error("Não foi possível localizar label do atributo");
        label.innerText =
            String(at.nome[0]).toLocaleUpperCase() +
                at.nome.slice(1);
        if (at.obrigatorio) {
            const btnRemove = clone.querySelector("button");
            if (!btnRemove)
                throw new Error("Não foi possível localizar botão de remoção");
            btnRemove.classList.add("hidden");
            label.innerText += " (Obrigatório)";
        }
        const input = clone.querySelector("input");
        if (!input)
            throw new Error("Não foi possível localizar input do atributo");
        input.value = String(valores[at.nome.trim().toLowerCase()] ?? "");
        if (at.numerico) {
            input.inputMode = "decimal";
            input.addEventListener("input", event => {
                const target = event.target;
                let valor = target.value.replace(/[^0-9,]/g, "");
                const partes = valor.split(",");
                if (partes.length > 2)
                    valor = partes[0] + "," + partes.slice(1).join("");
                target.value = valor;
            });
        }
    });
};
setSearchBox(searchCategoria, "/api/categoria?nome=", null, "nome", (value, content) => {
    if (content && content.length === 1 && value === content[0].nome) {
        const categoria = content[0];
        categoriaId.value = String(categoria.id ?? "");
        preencherAtributos(categoria);
    }
    else {
        wipeout();
        categoriaId.value = "";
    }
    update();
});
// --------------------------------------------------
// Marca
// --------------------------------------------------
const containerMarca = document.querySelector("#container-h-marca");
if (!containerMarca)
    throw new Error("Não foi possível localizar containerMarca");
setHiddenContainer(containerMarca, "desassociar");
const searchMarca = containerMarca.querySelector("#search-marca");
if (!searchMarca)
    throw new Error("Não foi possível localizar searchMarca");
setSearchBox(searchMarca, "/api/marca?nome=");
// --------------------------------------------------
// Inicialização dos dados existentes
// --------------------------------------------------
const inicializarBusca = async (endpoint, nome) => {
    if (!nome)
        return null;
    const response = await fetch(`${endpoint}${encodeURIComponent(nome)}`);
    if (!response.ok)
        throw new Error(`Erro ao buscar ${nome}`);
    const content = await response.json();
    if (!Array.isArray(content) || content.length !== 1)
        return null;
    return content[0];
};
const inicializarCategoria = async () => {
    const input = searchCategoria.querySelector("#search-input-categoria");
    if (!input)
        return;
    const nome = input.value;
    if (!nome)
        return;
    const categoria = await inicializarBusca("/api/categoria?nome=", nome);
    if (!categoria)
        return;
    categoriaId.value = String(categoria.id);
    // Os atributos serão preenchidos com os valores que o backend
    // disponibilizar no objeto inicial do produto.
    const atributosIniciais = JSON.parse(form.dataset.atributos ?? "{}");
    preencherAtributos(categoria, atributosIniciais);
    update();
};
const inicializarMarca = async () => {
    const input = searchMarca.querySelector("#search-input-marca");
    if (!input || !input.value)
        return;
    await inicializarBusca("/api/marca?nome=", input.value);
};
// --------------------------------------------------
// Prateleiras novas
// --------------------------------------------------
const prateleiras = document.querySelector("#addble-container-prateleiras");
if (!prateleiras)
    throw new Error("Não foi possível localizar prateleiras");
let prateleiraIt = 0;
const deactivate = (ele) => {
    const parent = ele.closest('[data-parent="inputbox"]');
    if (!parent)
        throw new Error("Não foi possível localizar o parente do input");
    parent.classList.add("opacity-50");
    if (ele instanceof HTMLInputElement) {
        ele.value = "";
        ele.disabled = true;
    }
    else {
        ele.querySelectorAll("input").forEach(input => {
            input.disabled = true;
            input.value = "";
        });
    }
};
const activate = (ele) => {
    const parent = ele.closest('[data-parent="inputbox"]');
    if (!parent)
        throw new Error("Não foi possível localizar o parente do input");
    parent.classList.remove("opacity-50");
    if (ele instanceof HTMLInputElement) {
        ele.disabled = false;
    }
    else {
        ele.querySelectorAll("input").forEach(input => {
            input.disabled = false;
        });
    }
};
setAddble(prateleiras, "prateleira", prateleiraIt, (clone) => {
    clone.querySelectorAll("input").forEach(input => {
        if (input.id === "search-input-local" ||
            input.id === "search-hidden-local")
            return;
        deactivate(input);
    });
    const localSearch = clone.querySelector("#search-local");
    if (!localSearch)
        throw new Error("Não foi possível localizar localSearch");
    const localId = clone.querySelector("#search-hidden-local");
    if (!localId)
        throw new Error("Não foi possível localizar localId");
    const estanteId = clone.querySelector("#estanteId");
    if (!estanteId)
        throw new Error("Não foi possível localizar estanteId");
    estanteId.disabled = false;
    const estanteRow = clone.querySelector("#search-estanteRow");
    const estanteCol = clone.querySelector("#search-estanteCol");
    const prateleiraRow = clone.querySelector("#search-prateleiraRow");
    const prateleiraCol = clone.querySelector("#search-prateleiraCol");
    const quantidade = clone.querySelector("#quantidade");
    if (!estanteRow ||
        !estanteCol ||
        !prateleiraRow ||
        !prateleiraCol ||
        !quantidade)
        throw new Error("Não foi possível localizar campos da prateleira");
    let prateleira = {
        linha: 0,
        coluna: 0
    };
    let estante = {
        id: 0,
        linha: 0,
        coluna: 0,
        qtd_linhas: 0,
        qtd_colunas: 0
    };
    let local = null;
    let p = { row: false, col: false };
    let e = { row: false, col: false };
    let q = false;
    const setQuantidade = () => {
        if (prateleira.coluna !== 0 && prateleira.linha !== 0) {
            activate(quantidade);
            q = true;
        }
        else if (q) {
            deactivate(quantidade);
            q = false;
        }
    };
    const destruirPrateleira = () => {
        if (p.col) {
            deactivate(prateleiraCol);
            p.col = false;
        }
        if (p.row) {
            deactivate(prateleiraRow);
            p.row = false;
        }
        if (q) {
            deactivate(quantidade);
            q = false;
        }
    };
    const setPrateleira = (rows, cols) => {
        if (rows > 1) {
            activate(prateleiraRow);
            setSearchBox(prateleiraRow, Array.from(Array(rows + 1).keys()).slice(1), null, undefined, value => {
                prateleira.linha = Number(value ?? "");
                setQuantidade();
            }, true);
            p.row = true;
        }
        else if (rows === 1) {
            prateleira.linha = 1;
        }
        if (cols > 1) {
            activate(prateleiraCol);
            setSearchBox(prateleiraCol, Array.from(Array(cols + 1).keys()).slice(1), null, undefined, value => {
                prateleira.coluna = Number(value ?? "");
                setQuantidade();
            }, true);
            p.col = true;
        }
        else if (cols === 1) {
            prateleira.coluna = 1;
        }
    };
    const destruirEstante = () => {
        deactivate(estanteRow);
        deactivate(estanteCol);
        destruirPrateleira();
    };
    const setEstante = () => {
        if (estante.linha !== 0 && estante.coluna !== 0) {
            if (!local)
                throw new Error("Local não selecionado");
            const encontrada = local.estantes.find((item) => item.coluna === estante.coluna &&
                item.linha === estante.linha);
            if (encontrada) {
                estanteId.value = String(encontrada.id);
                estante = encontrada;
                setPrateleira(estante.qtd_linhas, estante.qtd_colunas);
            }
            else {
                estanteId.value = "";
                destruirPrateleira();
            }
        }
        else {
            estanteId.value = "";
            destruirPrateleira();
        }
    };
    setSearchBox(localSearch, "/api/local?path=", null, "path", (value, content) => {
        if (content.length === 1 && value === content[0].path) {
            localId.value = String(content[0].id);
            local = content[0];
            if (local.linhas > 1) {
                activate(estanteRow);
                setSearchBox(estanteRow, Array.from(Array(local.linhas + 1).keys()).slice(1), null, undefined, value => {
                    estante.linha = Number(value ?? "");
                    setEstante();
                }, true);
                e.row = true;
            }
            else {
                estante.linha = 1;
            }
            if (local.colunas > 1) {
                activate(estanteCol);
                setSearchBox(estanteCol, Array.from(Array(local.colunas + 1).keys()).slice(1), null, undefined, value => {
                    estante.coluna = Number(value ?? "");
                    setEstante();
                }, true);
                e.col = true;
            }
            else {
                estante.coluna = 1;
            }
        }
        else {
            localId.value = "";
            destruirEstante();
        }
    });
});
// --------------------------------------------------
// Validações
// --------------------------------------------------
setForm(null, {
    "search-input-categoria": value => {
        if (!value)
            return null;
        const emp = verifyEmpty(value);
        if (emp)
            return emp;
        if (!categoriaId.value)
            return "A categoria deve ser válida e previamente criada";
        return null;
    },
    "search-input-local": (value, input) => {
        const emp = verifyEmpty(value);
        if (emp)
            return emp;
        if (!input)
            throw new Error("Input de local não encontrado");
        const localId = input
            .closest("div")
            ?.querySelector("#search-hidden-local");
        if (!localId || !localId.value)
            return "O local deve ser válido";
        return null;
    }
});
// --------------------------------------------------
// Inicialização
// --------------------------------------------------
await Promise.all([
    inicializarCategoria(),
    inicializarMarca()
]);
//# sourceMappingURL=editarProoduto.js.map