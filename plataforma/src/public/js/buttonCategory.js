"use strict";
const MAX_MENU_HEIGHT = window.innerHeight * 0.65;
// Calcula a altura necessária para expandir um painel.
function getPanelHeight(panel) {
    const height = panel.scrollHeight;
    if (panel.id === "categories-panel") {
        return Math.min(height, MAX_MENU_HEIGHT);
    }
    return height;
}
// Atualiza a altura dos painéis ancestrais que estão abertos.
function updateAncestors(panel) {
    let ancestor = panel.parentElement?.closest(".filter-panel");
    while (ancestor) {
        const button = document.querySelector(`[data-target="${ancestor.id}"]`);
        const isOpen = button?.getAttribute("aria-expanded") === "true";
        if (isOpen) {
            ancestor.style.maxHeight =
                `${getPanelHeight(ancestor)}px`;
        }
        ancestor =
            ancestor.parentElement?.closest(".filter-panel");
    }
}
// Abre ou fecha um painel.
function setPanelState(button, panel, open) {
    const image = button.querySelector("[data-chevron]");
    panel.style.maxHeight = open
        ? `${getPanelHeight(panel)}px`
        : "0px";
    button.setAttribute("aria-expanded", String(open));
    image?.classList.toggle("rotate-180", open);
    updateAncestors(panel);
}
// Alterna o estado de um painel.
function togglePanel(button) {
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
document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }
    const button = target.closest("[data-toggle]");
    if (!button) {
        return;
    }
    togglePanel(button);
});
// Seleção de categorias.
document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
        return;
    }
    if (!target.matches("[data-category-select]")) {
        return;
    }
    // Ao desmarcar, não fecha automaticamente o painel.
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
    const button = document.querySelector(`[data-target="${panelId}"]`);
    if (!button) {
        throw new Error(`Botão da categoria ${panelId} não encontrado`);
    }
    // Abre os atributos da categoria selecionada.
    setPanelState(button, panel, true);
});
//# sourceMappingURL=buttonCategory.js.map