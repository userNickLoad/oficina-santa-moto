import { setHiddenContainer } from "./hiddenContainer.js";
import { setAddble } from "./addble.js";
import { setForm, verifyEmpty } from "./form.js";
import { setSearchBox } from "./searchBox.js";
const containerCategoria = document.querySelector("#container-h-categoria");
if (!containerCategoria)
    throw new Error("não foi possivel localizar containerCategoria");
const { update } = setHiddenContainer(containerCategoria, "desassociar");
const searchCategoria = containerCategoria.querySelector("#search-categoria");
if (!searchCategoria)
    throw new Error("não");
const addbleAtributos = containerCategoria.querySelector("#addble-container-atributos");
if (!addbleAtributos)
    throw new Error("#addble-container-atributos");
const categoriaId = searchCategoria.querySelector('#search-hidden-categoria');
if (!categoriaId)
    throw new Error("#search-hidden-categoria");
let i = 0;
const { addELement, wipeout } = setAddble(addbleAtributos, "atributo", i);
setSearchBox(searchCategoria, "/api/categoria?nome=", null, "nome", (value, content) => {
    if (content && content.length == 1 && value === content[0].nome) {
        const categoria = content[0];
        categoriaId.value = (categoria.id ?? "");
        categoria.atributos.map((at) => {
            const clone = addELement(undefined, at.nome);
            const label = clone.querySelector("label");
            if (!label)
                throw new Error("label");
            label.innerText = String(at.nome[0]).toLocaleUpperCase() + at.nome.slice(1, at.nome.length - 1);
            if (at.obrigatorio) {
                const btnRemove = clone.querySelector('button');
                if (!btnRemove)
                    throw new Error('button[id^="remove-"]');
                btnRemove.classList.add("hidden");
                label.innerText += " (Obrigatório)";
            }
            if (at.numerico) {
                const input = clone.querySelector('input');
                if (!input)
                    throw new Error('input');
                input.inputMode = "decimal";
                input.addEventListener("input", event => {
                    const t = event.target;
                    let valor = t.value.replace(/[^0-9,]/g, '');
                    // 2. Garante que exista no máximo um ponto decimal
                    const partes = valor.split(',');
                    if (partes.length > 2) {
                        valor = partes[0] + ',' + partes.slice(1).join('');
                    }
                    t.value = valor;
                });
            }
        });
    }
    else {
        wipeout();
        categoriaId.value = "";
    }
    update();
});
const containerMarca = document.querySelector("#container-h-marca");
if (!containerMarca)
    throw new Error("não foi possivel localizar containerMarca");
setHiddenContainer(containerMarca, "desassociar");
const searchMarca = containerMarca.querySelector("#search-marca");
if (!searchMarca)
    throw new Error("não");
setSearchBox(searchMarca, "/api/marca?nome=");
const hiddenPrateleira = document.querySelector('#container-h-prateleiras');
if (!hiddenPrateleira)
    throw new Error("não foi possivel localizar #container-h-prateleiras");
const prateleirasH = setHiddenContainer(hiddenPrateleira, "não editar");
const prateleiras = document.querySelector('#addble-container-prateleiras');
if (!prateleiras)
    throw new Error("não foi possivel localizar #addble-container-prateleiras");
let prateleiraIt = 0;
const deactivate = (ele) => {
    const parent = ele.closest('[data-parent="inputbox"]');
    if (!parent)
        throw new Error("Não foi possivel localizar o parente do input");
    parent.classList.add("opacity-50");
    if (ele instanceof HTMLInputElement) {
        ele.value = "";
        ele.disabled = true;
    }
    else {
        const i = ele.querySelectorAll("input");
        if (i)
            i.forEach(j => { j.disabled = true; j.value = ""; });
    }
};
const activate = (ele) => {
    const parent = ele.closest('[data-parent="inputbox"]');
    if (!parent)
        throw new Error("Não foi possivel localizar o parente do input");
    parent.classList.remove("opacity-50");
    if (ele instanceof HTMLInputElement)
        ele.disabled = false;
    else {
        const i = ele.querySelectorAll("input");
        console.log(i, "ativado");
        if (i)
            i.forEach(j => { j.disabled = false; });
    }
};
setAddble(prateleiras, "prateleira", prateleiraIt, (clone) => {
    const { update } = prateleirasH;
    clone.querySelectorAll("input").forEach(input => {
        if (input.id == "search-input-local" || "search-hidden-local" == input.id)
            return;
        deactivate(input);
    });
    const localSearch = clone.querySelector("#search-local");
    console.log(localSearch?.innerHTML);
    if (!localSearch)
        throw new Error("Não foi possivel achar o #search-local");
    const localId = clone.querySelector('#search-hidden-local');
    if (!localId)
        throw new Error("Não foi possivel achar localId");
    const estanteId = clone.querySelector('#estanteId');
    if (!estanteId)
        throw new Error("Não foi possivel achar estanteId");
    estanteId.disabled = false;
    const estanteRow = clone.querySelector('#search-estanteRow');
    if (!estanteRow)
        throw new Error("Não foi possivel achar estanteRow");
    const estanteCol = clone.querySelector('#search-estanteCol');
    if (!estanteCol)
        throw new Error("Não foi possivel achar estanteCol");
    const prateleiraRow = clone.querySelector('#search-prateleiraRow');
    if (!prateleiraRow)
        throw new Error("Não foi possivel achar prateleiraRow");
    const prateleiraCol = clone.querySelector('#search-prateleiraCol');
    if (!prateleiraCol)
        throw new Error("Não foi possivel achar prateleiraCol");
    const quantidade = clone.querySelector('#quantidade');
    if (!quantidade)
        throw new Error("Não foi possivel achar quantidade");
    let p = { row: false, col: false };
    let e = { row: false, col: false };
    let q = false;
    let prateleira = { id: 0, linha: 0, coluna: 0 };
    let estante = {
        id: 0,
        coluna: 0,
        qtd_colunas: 0,
        linha: 0,
        qtd_linhas: 0
    };
    let local = null;
    const setQuantidade = () => {
        if (prateleira.coluna != 0 && prateleira.linha != 0) {
            activate(quantidade);
            q = true;
        }
        else {
            if (q) {
                q = false;
                deactivate(quantidade);
            }
        }
    };
    const setPrateleira = (rows, cols) => {
        if (rows > 1) {
            activate(prateleiraRow);
            setSearchBox(prateleiraRow, Array.from(Array(rows + 1).keys()).slice(1), null, undefined, (value, content) => {
                prateleira.linha = Number(value ?? "");
                setQuantidade();
            }, true);
            p.row = true;
        }
        else if (rows == 1) {
            prateleira.linha = 1;
        }
        if (cols > 1) {
            activate(prateleiraCol);
            setSearchBox(prateleiraCol, Array.from(Array(cols + 1).keys()).slice(1), null, undefined, (value, content) => {
                prateleira.coluna = Number(value ?? "");
                setQuantidade();
            }, true);
            p.col = true;
        }
        else if (cols == 1) {
            prateleira.coluna = 1;
        }
    };
    const destoryEstante = () => {
        deactivate(estanteRow);
        deactivate(estanteCol);
    };
    const destroyEstante = () => {
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
    const setEstante = () => {
        if (estante.linha != 0 && estante.coluna != 0) {
            if (!local) {
                throw Error("error");
            }
            const es = local.estantes.find((f) => (f.coluna == estante.coluna && f.linha == estante.linha));
            console.log("Status estante: ", es != undefined);
            if (es) {
                estanteId.value = String(es.id);
                console.log(estanteId, estanteId.value);
                estante = es;
                setPrateleira(estante.qtd_linhas, estante.qtd_colunas);
            }
            else {
                estanteId.value = "";
                destroyEstante();
            }
        }
        else {
            estanteId.value = "";
            destroyEstante();
        }
    };
    setSearchBox(localSearch, "/api/local?path=", null, "path", (value, content) => {
        const v = value;
        if (content.length == 1 && v == content[0].path) {
            localId.value = content[0].id;
            local = content[0];
            // estante = content[0].estantes.filter((f: {id: number, linha: number, coluna: number}) => (f.coluna == ))
            if (local == null)
                return;
            const rows = local.linhas;
            const cols = local.colunas;
            if (rows > 1) {
                activate(estanteRow);
                setSearchBox(estanteRow, Array.from(Array(rows + 1).keys()).slice(1), null, undefined, (value, content) => {
                    estante.linha = (typeof value == "string") ? Number(value ?? "") : 0;
                    setEstante();
                }, true);
                e.row = true;
            }
            else if (rows == 1) {
                estante.linha = 1;
            }
            if (cols > 1) {
                activate(estanteCol);
                console.log("ativando coluna");
                setSearchBox(estanteCol, Array.from(Array(cols + 1).keys()).slice(1), null, undefined, (value, content) => {
                    estante.coluna = (typeof value == "string") ? Number(value ?? "") : 0;
                    setEstante();
                }, true);
                e.col = true;
            }
            else if (cols == 1) {
                estante.coluna = 1;
            }
        }
        else {
            localId.value = "";
            console.log("estatos: ", e);
            if (e.col) {
                console.log("Desativando coluna");
                deactivate(estanteCol);
                e.col = false;
            }
            if (e.row) {
                deactivate(estanteRow);
                e.row = false;
            }
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
        }
    });
    update();
});
setForm(null, {
    "search-input-categoria": (value) => {
        const emp = verifyEmpty(value);
        if (emp)
            return emp;
        const empId = verifyEmpty(categoriaId.value);
        if (empId)
            return "A categoria deve ser valida e previamente criada";
        return null;
    },
    "search-input-local": (value, input) => {
        const emp = verifyEmpty(value);
        if (emp)
            return emp;
        if (!input)
            throw new Error("fuck");
        const localId = input.closest("div")?.querySelector("#search-hidden-local");
        if (!localId)
            throw new Error("fuck 2");
        const idEmp = verifyEmpty(localId.value);
        if (idEmp)
            return "O local deve ser valido";
        return null;
    },
    "quantidade": (value, input) => {
        const prateleiras = document.querySelectorAll('[id$="[remove-prateleiras]"]').length;
        if (prateleiras)
            return null;
        const emp = verifyEmpty(value);
        if (emp)
            return "Preencha ou associe a prateleiras";
        return null;
    }
});
//# sourceMappingURL=editarProduto.js.map