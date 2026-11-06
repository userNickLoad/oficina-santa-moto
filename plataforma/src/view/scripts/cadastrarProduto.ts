import { setHiddenContainer } from "./hiddenContainer.js";
import { setForm } from "./form.js";

document.querySelectorAll<HTMLElement>('[id^="container-h-"').forEach(container => {
    setHiddenContainer(container);
})

setForm()