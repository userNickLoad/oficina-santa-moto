"use strict";
const phoneInputs = document.querySelectorAll('[data-mask="phone"]');
console.log("phoneMask loaded", phoneInputs);
const mask = (input) => {
    let digits = input.value.replace(/\D/g, "");
    // Limita a 11 dígitos
    digits = digits.slice(0, 11);
    if (digits.length === 0) {
        input.value = "";
        return;
    }
    if (digits.length <= 2) {
        input.value = `(${digits}`;
        return;
    }
    if (digits.length <= 6) {
        input.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return;
    }
    if (digits.length <= 10) {
        input.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        return;
    }
    input.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};
phoneInputs.forEach(input => {
    input.value = "11 9";
    mask(input);
    input.addEventListener("input", () => mask(input));
});
//# sourceMappingURL=phoneMask.js.map