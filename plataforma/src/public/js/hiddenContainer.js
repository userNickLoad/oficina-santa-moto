const setHiddenContainer = (containerId, opened_message = null) => {
    const container_root = (containerId instanceof HTMLElement) ? containerId : document.querySelector(`#${containerId}`);
    if (!container_root)
        throw new Error(`não foi possivel localizar ${containerId}`);
    const btn_activation = container_root.querySelector('[id^="activation-"]');
    if (!btn_activation)
        throw new Error(`não foi possivel localizar ${containerId}`);
    const btnMessage = (btn_activation.querySelector("p")) ? btn_activation.querySelector("p") : btn_activation;
    if (!btnMessage)
        throw new Error("Não foi possivel localizar a mensagem do botão");
    const closed_message = btnMessage?.textContent;
    opened_message = (opened_message) ? opened_message : closed_message;
    const hidden = container_root.querySelector('[id^="hidden-container-"]');
    if (!hidden)
        throw new Error(`não foi possivel localizar o hidden do ${containerId}`);
    hidden.querySelectorAll("input").forEach(input => {
        input.disabled = true;
    });
    btn_activation.addEventListener("click", () => {
        if (container_root.dataset.open === "true") {
            hidden.style.height = `${hidden.scrollHeight}px`;
            requestAnimationFrame(() => {
                hidden.style.height = "0px";
            });
            hidden.querySelectorAll("input").forEach(input => {
                input.disabled = true;
            });
            btnMessage.textContent = closed_message;
            container_root.dataset.open = "false";
        }
        else {
            hidden.style.height = `${hidden.scrollHeight}px`;
            hidden.querySelectorAll("input").forEach(input => {
                input.disabled = false;
            });
            btnMessage.textContent = opened_message;
            container_root.dataset.open = "true";
        }
    });
};
export { setHiddenContainer };
//# sourceMappingURL=hiddenContainer.js.map