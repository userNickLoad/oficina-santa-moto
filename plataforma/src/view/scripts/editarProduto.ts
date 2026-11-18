
import { setAddble } from "./addble.js";
import { setForm, verifyEmpty } from "./form.js";
import { setSearchBox } from "./searchBox.js";


// --------------------------------------------------
// Formulário
// --------------------------------------------------

const form = document.querySelector<HTMLFormElement>(
    "#form-editar-produto"
);

if (!form)
    throw new Error("Não foi possível localizar o formulário");

// --------------------------------------------------
// Categoria
// --------------------------------------------------

const searchCategoria = document.querySelector<HTMLElement>(
    "#search-categoria"
);

if (!searchCategoria)
    throw new Error("Não foi possível localizar #search-categoria");

const sectionCategoria = searchCategoria.closest("section") 

if( !sectionCategoria )
    throw new Error("Não foi possível localizar #search-categoria section")

const defaultCategoriaSet = sectionCategoria.dataset.categoria;

const defaultCategoria = (defaultCategoriaSet != undefined && defaultCategoriaSet != "")? JSON.parse(defaultCategoriaSet): null

const categoriaId = searchCategoria.querySelector<HTMLInputElement>(
    "#search-hidden-categoria"
);

if (!categoriaId)
    throw new Error("Não foi possível localizar #search-hidden-categoria");

const addbleAtributos = document.querySelector<HTMLElement>("#addble-container-atributos")
if(!addbleAtributos)
    throw new Error("#addble-container-atributos")

let i = 0
const { addELement, wipeout } = setAddble(addbleAtributos, "atributo", i);

setSearchBox(searchCategoria, "/api/categoria?nome=", null, "nome", (value, content)=>{
   
    if(content && content.length == 1 && value === content[0].nome){
        const categoria = content[0]

        categoriaId.value = (categoria.id ?? "")
        wipeout()
        console.log(defaultCategoria)

        categoria.atributos.map((at: any) => {
            const clone = addELement(undefined, at.nome)
            const label = clone.querySelector<HTMLElement>("label");
            const input = clone.querySelector<HTMLInputElement>("input")

            if(!label)
                throw new Error("label")

            if(!input)
                throw new Error("input")

            label.innerText = String(at.nome[0]).toLocaleUpperCase() + at.nome.slice(1, at.nome.length)

            if(value.trim().toLocaleUpperCase() == defaultCategoria.categoria.trim().toLocaleUpperCase())
                input.value = defaultCategoria.atributos[at.nome]

            if(at.obrigatorio){
                const btnRemove = clone.querySelector<HTMLElement>('button');
                if(!btnRemove)
                    throw new Error('button[id^="remove-"]')
                btnRemove.classList.add("hidden")

                label.innerText += " (Obrigatório)"
            }

            if(at.numerico){
                const input = clone.querySelector<HTMLInputElement>('input');
                if(!input)
                    throw new Error('input')
                input.inputMode = "decimal"


                input.addEventListener("input", event=>{
                    const t = event.target as HTMLInputElement

                        let valor = t.value.replace(/[^0-9,]/g, '');

                        // 2. Garante que exista no máximo um ponto decimal
                        const partes = valor.split(',');
                        if (partes.length > 2) {
                            valor = partes[0] + ',' + partes.slice(1).join('');
                        }

                        t.value = valor;
                })
            }
        })

    } else {
        wipeout()
        categoriaId.value = ""
    }
})

const inputCategorio =  searchCategoria.querySelector<HTMLInputElement>("#search-input-categoria");

if(!inputCategorio)
    throw new Error("#search-input-categoria");

inputCategorio.dispatchEvent(new Event("input"))

// Se o usuário apagar o texto manualmente, desassocia a categoria.
const inputCategoria = searchCategoria.querySelector<HTMLInputElement>(
    "#search-input-categoria"
);

inputCategoria?.addEventListener("input", () => {
    if (inputCategoria.value === "")
        categoriaId.value = "";
});

// --------------------------------------------------
// Marca
// --------------------------------------------------

const searchMarca = document.querySelector<HTMLElement>(
    "#search-marca"
);

if (!searchMarca)
    throw new Error("Não foi possível localizar #search-marca");

const marcaId = searchMarca.querySelector<HTMLInputElement>(
    "#search-hidden-marca"
);

if (!marcaId)
    throw new Error("Não foi possível localizar #search-hidden-marca");

setSearchBox(
    searchMarca,
    "/api/marca?nome=",
    null,
    "nome",
    (value, content) => {
        const marca = content.find(
            (item: any) => item.nome === value
        );

        marcaId.value = String(marca?.id ?? "");
    }
);

const inputMarca = searchMarca.querySelector<HTMLInputElement>(
    "#search-input-marca"
);

inputMarca?.addEventListener("input", () => {
    if (inputMarca.value === "")
        marcaId.value = "";
});

// --------------------------------------------------
// Imagens
// --------------------------------------------------

const inputImagem = document.querySelector<HTMLInputElement>(
    "#imagem"
);

const imagemPreview = document.querySelector<HTMLElement>(
    "#imagem-preview"
);

if (!inputImagem || !imagemPreview)
    throw new Error("Não foi possível localizar os elementos de imagem");

let urlsPreview: string[] = [];

const limparPreview = () => {
    urlsPreview.forEach(url => URL.revokeObjectURL(url));
    urlsPreview = [];
    imagemPreview.innerHTML = "";
};

inputImagem.addEventListener("change", () => {
    limparPreview();

    const arquivos = Array.from(inputImagem.files ?? []);

    arquivos.forEach((arquivo, index) => {
        if (!arquivo.type.startsWith("image/"))
            return;

        const url = URL.createObjectURL(arquivo);
        urlsPreview.push(url);

        const container = document.createElement("div");
        container.className = "flex flex-col gap-1";

        const imagem = document.createElement("img");
        imagem.src = url;
        imagem.alt = `Nova imagem ${index + 1}`;
        imagem.className = "w-full aspect-square object-cover rounded-lg";

        const nome = document.createElement("p");
        nome.className = "text-xs text-gray-500 truncate";
        nome.textContent = arquivo.name;

        container.append(imagem, nome);
        imagemPreview.appendChild(container);
    });
});

// --------------------------------------------------
// Validações
// --------------------------------------------------

setForm(null, {
    "nome": value => {
        const erro = verifyEmpty(value);

        if (erro)
            return erro;

        return null;
    },

    "search-input-categoria": value => {
        // Categoria é opcional.
        if (!value)
            return null;

        const erro = verifyEmpty(value);

        if (erro)
            return erro;

        if (!categoriaId.value)
            return "Selecione uma categoria válida da lista";

        return null;
    },

    "search-input-marca": value => {
        // Marca também é opcional.
        if (!marcaId.value)
            return "Selecione uma marca válida da lista";

        return null;
    },

    "quantidade": value => {
        const erro = verifyEmpty(value);

        if (erro)
            return erro;

        if (Number(value) < 0)
            return "A quantidade não pode ser negativa";

        return null;
    },

    "preco": value => {
        const erro = verifyEmpty(value);

        if (erro)
            return erro;

        return null;
    },

    "alerta_quantidade": value => {
        if (value === "")
            return null;

        if (Number(value) < 0)
            return "O alerta não pode ser negativo";

        return null;
    }
});
