"use strict";
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});
const inputs = document.querySelectorAll('[data-mask="currency"]');
const mark = (input) => {
    const digits = input.value.replace(/\D/g, "");
    const value = Number(digits) / 100;
    input.value = currencyFormatter.format(value);
};
inputs.forEach(input => {
    input.addEventListener("input", () => mark(input));
});
//# sourceMappingURL=currencyMask.js.map