type prop = {
    addELement: (values?: Record<string, any>, selfName?: string)=>HTMLElement, 
    wipeout: ()=>void
}

const setAddble = function (element: HTMLElement, name: string, iterator: number, cloneExpecific: ((clone: HTMLElement) => void) | null = null): prop  {
    const btn_add = element.querySelector('button[id^="add-new-"]');

    const addble = element.querySelector<HTMLElement>('[id^="addble-element-"]');
    if(!addble)
        throw new Error(`não foi possivel localizar o elemento clonavel `);

    addble.querySelectorAll("input").forEach(input => {
        input.disabled = true;
    })

    const place = element.querySelector<HTMLElement>('[id^="addble-placement-"]');

    if(!place)
        throw new Error("não foi possivel localizar o placement");


    const buildClone = (selfName: string | null = null): HTMLElement => {
        const clone = addble.cloneNode(true) as HTMLElement;

        clone.classList.remove("hidden");
        clone.classList.add("flex");

        const btn_rm = clone.querySelector('[id^="remove-"]');
        if(!btn_rm)
            throw new Error(`não foi possivel localizar o botão remove`)

        btn_rm.id = `${name}[${iterator}][${btn_rm.id}]`;

        btn_rm.addEventListener("click", () => {
            clone.remove()
        })

        clone.querySelectorAll("input").forEach(input => {
            input.disabled = false;
            input.name = `${name}[${iterator}][${(selfName)? selfName: input.name}]`;

            const parent = input.closest('[data-parent="inputbox"]')

            if(!parent)
                return;

            const output = parent.querySelector('[id^="output"]');

            if(!output)
                throw new Error("não foi possivel localizar o output error de " + input.id)
        });

        if(cloneExpecific)
            cloneExpecific(clone);

        return clone;
    }

    if(btn_add)
    btn_add.addEventListener("click", ()=>{
        const clone = buildClone();
        place.appendChild(clone);
        iterator++;
    })

    const addELement = (values: Record<string, any> | null = null, selfName: string | null = null): HTMLElement => {
        const clone = buildClone(selfName);
        place.appendChild(clone);
        iterator++
        if(values != null)
        clone.querySelectorAll("input").forEach(input => {
            input.value = values[input.id] ?? "";
        })

        return clone
    }

    const wipeout = () => {
        place.innerHTML = ""
    }

    return {addELement, wipeout}

}

export {setAddble}