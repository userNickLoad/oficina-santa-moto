const setAddble = (element, name, iterator, cloneExpecific = null) => {
    const btn_add = element.querySelector('button[id^="add-new-"]');
    if (!btn_add)
        throw new Error(`Não foi possivel localizar o botão de adição do ${element.id}`);
    const addble = element.querySelector('[id^="addble-element-"]');
    if (!addble)
        throw new Error(`não foi possivel localizar o elemento clonavel `);
    addble.querySelectorAll("input").forEach(input => {
        input.disabled = true;
    });
    const place = element.querySelector('[id^="addble-placement-"]');
    if (!place)
        throw new Error("não foi possivel localizar o placement");
    const buildClone = () => {
        const clone = addble.cloneNode(true);
        //clone.id += `-${iterator}`
        clone.classList.remove("hidden");
        clone.classList.add("flex");
        const btn_rm = clone.querySelector('[id^="remove-"]');
        if (!btn_rm)
            throw new Error(`não foi possivel localizar o botão remove`);
        btn_rm.id = `${name}[${iterator}][${btn_rm.id}]`;
        btn_rm.addEventListener("click", () => {
            clone.remove();
        });
        clone.querySelectorAll("input").forEach(input => {
            input.disabled = false;
            //input.id = `${name}[${iterator}][${input.id}]`;
            input.name = `${name}[${iterator}][${input.name}]`;
            const parent = input.closest('[data-parent="inputbox"]');
            if (!parent)
                return;
            const output = parent.querySelector('[id^="output"]');
            if (!output)
                throw new Error("não foi possivel localizar o output error de " + +input.id);
        });
        if (cloneExpecific)
            cloneExpecific(clone);
        return clone;
    };
    btn_add.addEventListener("click", () => {
        const clone = buildClone();
        place.appendChild(clone);
    });
};
export { setAddble };
//# sourceMappingURL=addble.js.map