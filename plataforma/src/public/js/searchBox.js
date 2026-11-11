const clone = (element, iterator, value) => {
    const clone = element.cloneNode(true);
    clone.classList.remove("hidden");
    clone.classList.add("flex");
    clone.id += `[${iterator}]`;
    clone.textContent = value;
    return clone;
};
const setSearchBox = (root, action, onSearch) => {
    const input = root.querySelector('input[id^="search-input"]');
    console.log(root);
    if (!input)
        throw new Error("não foi possivel achar o input da caixa de pesquisa");
    const autocompleteBox = root.querySelector('div[id^="search-autocomplete-"]');
    if (!autocompleteBox)
        throw new Error("não foi possivel achar o autocompleteBox da caixa de pesquisa");
    const placement = root.querySelector("ul");
    if (!placement)
        throw new Error("não foi possivel achar o placement da caixa de pesquisa");
    const defaultElement = root.querySelector('li[id^="search-default-"]')?.cloneNode(true);
    if (!defaultElement)
        throw new Error("não foi possivel achar o defaultElement");
    const button = root.querySelector('button[id^="btn-search-"]');
    if (!button) {
        throw new Error("não foi possivel localizar o botão");
    }
    // Índice da opção atualmente selecionada
    let selectedIndex = -1;
    // Retorna todas as opções disponíveis
    const getOptions = () => Array.from(placement.querySelectorAll("li"));
    // Remove o destaque de todas as opções
    const clearSelection = () => {
        getOptions().forEach(option => {
            option.classList.remove("bg-gray-500", "text-white");
        });
        selectedIndex = -1;
    };
    const executeSearch = () => {
        const value = input.value.trim().toLowerCase();
        if (!value)
            return;
    };
    button.addEventListener("click", executeSearch);
    // Seleciona uma opção
    const selectOption = (index) => {
        const options = getOptions();
        if (index < 0 || index >= options.length)
            return;
        clearSelection();
        selectedIndex = index;
        const option = options[selectedIndex];
        option.classList.add("bg-gray-500", "text-white");
        option.scrollIntoView({
            block: "nearest"
        });
    };
    // Confirma a seleção
    const confirmSelection = () => {
        const options = getOptions();
        if (selectedIndex < 0 || selectedIndex >= options.length)
            return;
        input.value = options[selectedIndex].textContent?.trim() ?? "";
        autocompleteBox.classList.add("h-0");
        autocompleteBox.classList.remove("h-auto");
        clearSelection();
    };
    // Abre o autocomplete
    input.addEventListener("focusin", () => {
        autocompleteBox.classList.remove("h-0");
        autocompleteBox.classList.add("h-auto");
    });
    // Fecha o autocomplete
    input.addEventListener("focusout", () => {
        autocompleteBox.classList.add("h-0");
        autocompleteBox.classList.remove("h-auto");
        clearSelection();
    });
    // Navegação pelo teclado
    input.addEventListener("keydown", event => {
        const options = getOptions();
        if (autocompleteBox.classList.contains("h-0"))
            return;
        if (options.length === 0)
            return;
        switch (event.key) {
            case "ArrowDown": {
                event.preventDefault();
                const nextIndex = (selectedIndex + 1) % options.length;
                selectOption(nextIndex);
                break;
            }
            case "ArrowUp": {
                event.preventDefault();
                const previousIndex = (selectedIndex - 1 + options.length) % options.length;
                selectOption(previousIndex);
                break;
            }
            case "Enter": {
                if (selectedIndex !== -1) {
                    event.preventDefault();
                    confirmSelection();
                }
                else {
                    event.preventDefault();
                    executeSearch();
                }
                break;
            }
            case "Escape": {
                autocompleteBox.classList.add("h-0");
                autocompleteBox.classList.remove("h-auto");
                clearSelection();
                break;
            }
        }
    });
    // Pesquisa dinâmica
    input.addEventListener("input", async () => {
        const value = input.value.trim().toLowerCase();
        console.log(value);
        if (value === input.dataset.input)
            return;
        input.dataset.input = value;
        clearSelection();
        placement.innerHTML = "";
        if (value.length < 2)
            return;
        try {
            const result = await fetch(`${action}${encodeURIComponent(value)}`);
            console.log(result);
            if (!result.ok && result.status !== 404) {
                window.alert("Erro ao tentar pesquisar o input na searchbox");
                return;
            }
            if (result.status === 404) {
                console.log("Nenhum resultado encontrado para " + value);
                return;
            }
            const content = await result.json();
            if (onSearch)
                onSearch(content);
            for (let i = 0; i < content.length; i++) {
                const newElement = clone(defaultElement, i, content[i].nome);
                // Seleção pelo mouse
                newElement.addEventListener("mousedown", event => {
                    event.preventDefault();
                    input.value = newElement.textContent?.trim() ?? "";
                    autocompleteBox.classList.add("h-0");
                    autocompleteBox.classList.remove("h-auto");
                    clearSelection();
                });
                placement.appendChild(newElement);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
};
export { setSearchBox };
//# sourceMappingURL=searchBox.js.map