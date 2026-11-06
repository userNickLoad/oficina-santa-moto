

const setHiddenContainer = (containerId: string | HTMLElement) => {

    const container_root = (containerId instanceof HTMLElement)? containerId : document.querySelector<HTMLElement>(`#${containerId}`);

    if(!container_root)
        throw new Error(`não foi possivel localizar ${containerId}`);

    const btn_activation = container_root.querySelector('[id^="activation-"]')

    if(!btn_activation)
        throw new Error(`não foi possivel localizar ${containerId}`);

    const hidden = container_root.querySelector('[id^="hidden-container-"]');

    if(!hidden)
        throw new Error(`não foi possivel localizar o hidden do ${containerId}`);

    btn_activation.addEventListener("click", ()=>{
        if(container_root.dataset.open === "true"){
            hidden.classList.add("h-[max-h]");
            hidden.classList.remove("h-0");

            container_root.dataset.open = "false";
        } else {
            hidden.classList.add("h-0");
            hidden.classList.remove("h-[max-h]");

            container_root.dataset.open = "false";
        }
    })

}

export {setHiddenContainer}