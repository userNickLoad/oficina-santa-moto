const setHiddenContainer = (containerId, opened_message = null, func = null) => {
    const container_root = (containerId instanceof HTMLElement) ? containerId : document.querySelector(`#${containerId}`);
    if (!container_root)
        throw new Error(`não foi possivel localizar ${containerId}`);
    const btn_activation = container_root.querySelector('[id^="activation-"]');
    const hidden = container_root.querySelector('[id^="hidden-container-"]');
    if (!hidden)
        throw new Error(`não foi possivel localizar o hidden do ${containerId}`);
    hidden.querySelectorAll("input").forEach(input => {
        input.disabled = true;
    });
    const toggle = () => {
        if (container_root.dataset.open === "true") {
            hidden.style.height = `${hidden.scrollHeight}px`;
            requestAnimationFrame(() => {
                hidden.style.height = "0px";
            });
            hidden.querySelectorAll("input").forEach(input => {
                input.disabled = true;
            });
            container_root.dataset.open = "false";
            if (func)
                func(false);
        }
        else {
            hidden.style.height = `${hidden.scrollHeight}px`;
            hidden.querySelectorAll("input").forEach(input => {
                input.disabled = false;
            });
            container_root.dataset.open = "true";
            if (func)
                func(true);
        }
    };
    if (btn_activation) {
        const btnMessage = (btn_activation.querySelector("p")) ? btn_activation.querySelector("p") : btn_activation;
        if (!btnMessage)
            throw new Error("Não foi possivel localizar a mensagem do botão");
        const closed_message = btnMessage?.textContent;
        opened_message = (opened_message) ? opened_message : closed_message;
        btn_activation.addEventListener("click", () => {
            if (container_root.dataset.open === "true") {
                btnMessage.textContent = closed_message;
            }
            else {
                btnMessage.textContent = opened_message;
            }
            toggle();
        });
    }
    const update = () => {
        if (container_root.dataset.open === "true") {
            const currentHeight = hidden.offsetHeight;
            hidden.style.height = `${currentHeight}px`;
            requestAnimationFrame(() => {
                hidden.style.height = `${hidden.scrollHeight}px`;
            });
        }
    };
    return { toggle: toggle, update };
};
export { setHiddenContainer };
//# sourceMappingURL=hiddenContainer.js.map