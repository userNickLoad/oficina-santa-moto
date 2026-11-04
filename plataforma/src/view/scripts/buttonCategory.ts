const MAX_MENU_HEIGHT = window.innerHeight * 0.65;

function getPanelHeight(panel: HTMLElement): number {
    const height = panel.scrollHeight;

    if (panel.id === "categories-panel") {
        return Math.min(height, MAX_MENU_HEIGHT);
    }

    return height;
}

function updateAncestors(panel: HTMLElement): void {
    let ancestor = panel.parentElement?.closest<HTMLElement>(
        ".filter-panel"
    );

    while (ancestor) {
        if (ancestor.style.maxHeight !== "0px") {
            ancestor.style.maxHeight = `${getPanelHeight(ancestor)}px`;
        }

        ancestor =
            ancestor.parentElement?.closest<HTMLElement>(".filter-panel");
    }
}

function setPanelState(
    button: HTMLButtonElement,
    panel: HTMLElement,
    open: boolean
): void {
    const image = button.querySelector<HTMLElement>("[data-chevron]");

    panel.style.maxHeight = open
        ? `${getPanelHeight(panel)}px`
        : "0px";

    button.setAttribute("aria-expanded", String(open));

    image?.classList.toggle("rotate-180", open);

    updateAncestors(panel);
}

function togglePanel(button: HTMLButtonElement): void {
    const targetId = button.dataset.target;

    if (!targetId) {
        throw new Error(`Botão ${button.id} não possui data-target`);
    }

    const panel = document.getElementById(targetId);

    if (!panel) {
        throw new Error(`Painel ${targetId} não encontrado`);
    }

    const isOpen = button.getAttribute("aria-expanded") === "true";

    setPanelState(button, panel, !isOpen);
}

// Expansão e recolhimento dos painéis.
document.addEventListener("click", (event: MouseEvent) => {
    const target = event.target;

    if (!(target instanceof Element)) {
        return;
    }

    const button = target.closest<HTMLButtonElement>("[data-toggle]");

    if (!button) {
        return;
    }

    togglePanel(button);
});

// Seleção de categorias.
document.addEventListener("change", (event: Event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
        return;
    }

    if (!target.matches("[data-category-select]")) {
        return;
    }

    // Ao selecionar uma categoria, abre seus atributos.
    if (!target.checked) {
        return;
    }

    const panelId = target.dataset.categoryPanel;

    if (!panelId) {
        throw new Error("Categoria sem painel associado");
    }

    const panel = document.getElementById(panelId);

    if (!panel) {
        throw new Error(`Painel ${panelId} não encontrado`);
    }

    const button = document.querySelector<HTMLButtonElement>(
        `[data-target="${panelId}"]`
    );

    if (!button) {
        throw new Error(`Botão da categoria ${panelId} não encontrado`);
    }

    setPanelState(button, panel, true);
});