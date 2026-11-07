const buildClone = (clonable: HTMLElement, name: string,  iterator: number): HTMLElement => {
    const clone = clonable.cloneNode(true) as HTMLElement;

    clone.id += `-${iterator}`

    clone.classList.remove("hidden");
    clone.classList.add("flex");

    const btn_rm = clone.querySelector('[id^="remove-"]');
    if(!btn_rm)
        throw new Error(`não foi possivel localizar o botão remove`)

    btn_rm.id = `${name}[${iterator}][${btn_rm.id}]`;

    clone.querySelectorAll("input").forEach(input => {
        input.disabled = false;
        input.id = `${name}[${iterator}][${input.id}]`;
        input.name = `${name}[${iterator}][${input.name}]`;

        const parent = input.closest('[data-parent="inputbox"]')

        if(!parent)
            throw new Error("não foi possivel localizar o node raiz de " + input.id);

        const output = parent.querySelector('[id^="output"]');

        if(!output)
            throw new Error("não foi possivel localizar o output error de " + + input.id)
    });

    return clone;
}

const setAddble = (element: HTMLElement, name: string, iterator: number) => {
    const btn_add = element.querySelector('[id^="add-new-"]');

    if(!btn_add)
        throw new Error(`Não foi possivel localizar o botão de adição do ${element.id}`);

    const addble = element.querySelector<HTMLElement>('[id^="addble-element-"]');

    if(!addble)
        throw new Error(`não foi possivel localizar o elemento clonavel `);

    addble.querySelectorAll("input").forEach(input => {
        input.disabled = true;
    })

    const place = element.querySelector<HTMLElement>('[id^="addble-placement-"]');

    if(!place)
        throw new Error("não foi possivel localizar o placement");

    btn_add.addEventListener("click", ()=>{
        const clone = buildClone(addble, name, iterator);
        place.appendChild(clone);
    })

}

export {setAddble}