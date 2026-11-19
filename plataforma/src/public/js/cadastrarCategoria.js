import { setAddble } from "./addble.js";
import { setForm } from "./form.js";
const add = document.querySelector('[id^="addble-container-"]');
console.log(add);
if (!add)
    throw new Error(`Não foi possivel localizar o botão de adicionar atributos`);
let iterator = 0;
setAddble(add, "atributo", iterator);
setForm(null, {
    obrigatorio: () => (null)
});
//# sourceMappingURL=cadastrarCategoria.js.map