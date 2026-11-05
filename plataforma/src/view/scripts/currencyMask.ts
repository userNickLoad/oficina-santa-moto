const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const inputs = document.querySelectorAll<HTMLInputElement>(
    '[data-mask="currency"]'
);

inputs.forEach(input => {
    input.addEventListener("input", () => {
        const digits = input.value.replace(/\D/g, "");

        const value = Number(digits) / 100;

        input.value = currencyFormatter.format(value);
    });
});