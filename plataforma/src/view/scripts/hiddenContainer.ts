
type propReturns = {
    toggle: ()=>void
}

const setHiddenContainer = (containerId: string | HTMLElement, opened_message: string | null = null, func: (((value: boolean)=>void)) | null = null): propReturns => {

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

    const toggle = ()=>{
        if(container_root.dataset.open === "true"){
            hidden.style.height = `${hidden.scrollHeight}px`;

            requestAnimationFrame(() => {
                hidden.style.height = "0px";
            });

            hidden.querySelectorAll<HTMLInputElement>("input").forEach(input => {
                input.disabled = true;
            })
    
            container_root.dataset.open = "false";

            if(func)
                func(false)
        } else {
            hidden.style.height = `${hidden.scrollHeight}px`;
            
            hidden.querySelectorAll<HTMLInputElement>("input").forEach(input => {
                input.disabled = false;
            })

            container_root.dataset.open = "true";
            if(func)
                func(true)
        }
    }

    if(btn_activation){

        const btnMessage = (btn_activation.querySelector("p"))? btn_activation.querySelector("p"): btn_activation;
        if(!btnMessage)
            throw new Error("Não foi possivel localizar a mensagem do botão");

        const closed_message = btnMessage?.textContent;
        opened_message = (opened_message)? opened_message: closed_message;


        btn_activation.addEventListener("click", () => {
            if(container_root.dataset.open === "true"){
                btnMessage.textContent = closed_message;
            } else {
                btnMessage.textContent = opened_message;
            }
            toggle()

        })
    }
    
    return {toggle: toggle}
}

export {setHiddenContainer}