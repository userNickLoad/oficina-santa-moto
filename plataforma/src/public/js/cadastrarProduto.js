import { setHiddenContainer } from "./hiddenContainer.js";
import { setForm } from "./form.js";
document.querySelectorAll('[id^="container-h-"').forEach(container => {
    setHiddenContainer(container);
});
setForm();
//# sourceMappingURL=cadastrarProduto.js.map