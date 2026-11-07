import { setAddble } from "./addble.js";
import { setForm } from "./form.js";
const add = document.querySelector('[id^="addble-container-"]');
if (!add)
    throw new Error(`Não foi possivel localizar o botão de adicionar atributos`);
let iterator = 0;
setAddble(add, "atributos", iterator);
setForm();
//# sourceMappingURL=cadastrarCategoria.js.map