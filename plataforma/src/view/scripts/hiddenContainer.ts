

const setHiddenContainer = (containerId: string | HTMLElement, opened_message: string | null = null, openFunc: ((()=>void)) | null = null) => {

    const container_root = (containerId instanceof HTMLElement)? containerId : document.querySelector<HTMLElement>(`#${containerId}`);

    if(!container_root)
        throw new Error(`não foi possivel localizar ${containerId}`);

    const btn_activation = container_root.querySelector<HTMLButtonElement>('[id^="activation-"]')

    const hidden = container_root.querySelector<HTMLElement>('[id^="hidden-container-"]');

    if(!hidden)
        throw new Error(`não foi possivel localizar o hidden do ${containerId}`);

    hidden.querySelectorAll<HTMLInputElement>("input").forEach(input => {
        input.disabled = true;
    });

    if(btn_activation){

        const btnMessage = (btn_activation.querySelector("p"))? btn_activation.querySelector("p"): btn_activation;
        if(!btnMessage)
            throw new Error("Não foi possivel localizar a mensagem do botão");

        const closed_message = btnMessage?.textContent;
        opened_message = (opened_message)? opened_message: closed_message;

        btn_activation.addEventListener("click", ()=>{
            if(container_root.dataset.open === "true"){
                hidden.style.height = `${hidden.scrollHeight}px`;

                requestAnimationFrame(() => {
                    hidden.style.height = "0px";
                });

                hidden.querySelectorAll<HTMLInputElement>("input").forEach(input => {
                    input.disabled = true;
                })

                btnMessage.textContent = closed_message;
        
                container_root.dataset.open = "false";
            } else {
                hidden.style.height = `${hidden.scrollHeight}px`;
                
                hidden.querySelectorAll<HTMLInputElement>("input").forEach(input => {
                    input.disabled = false;
                })

                btnMessage.textContent = opened_message;

                container_root.dataset.open = "true";
            }
        })
    }
    

}

export {setHiddenContainer}