const buildClone = (clonable, name, iterator) => {
    const clone = clonable.cloneNode(true);
    const btn_rm = clone.querySelector('[id^="remove-"]');
    if (!btn_rm)
        throw new Error(`não foi possivel localizar o botão remove`);
    btn_rm.id = `${name}[${iterator}][${btn_rm.id}]`;
    clone.querySelectorAll("input").forEach(input => {
        input.id = `${name}[${iterator}][${input.id}]`;
        input.name = `${name}[${iterator}][${input.name}]`;
    });
    return clone;
};
const setAddble = (element, name, iterator) => {
    const btn_add = element.querySelector('[id^="add-new-"]');
    if (!btn_add)
        throw new Error(`Não foi possivel localizar o botão de adição do ${element.id}`);
    const addble = element.querySelector('[id^="addble-element-"]');
    if (!addble)
        throw new Error(`não foi possivel localizar o elemento clonavel `);
    btn_add.addEventListener("click", () => {
        const clone = buildClone(addble, name, iterator);
        element.appendChild(clone);
    });
};
export { setAddble };
//# sourceMappingURL=addble.js.map