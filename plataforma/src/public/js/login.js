"use strict";
console.log("LOGIN.TS CARREGADO");
const form = document.querySelector("form");
if (!form) {
    throw new Error("Formulário não encontrado");
}
const errorOutput = document.querySelector("#error");
if (!errorOutput) {
    throw new Error("ErrorOutput não localizado");
}
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Limpa erros anteriores
    errorOutput.innerText = "";
    let errors = 0;
    document.querySelectorAll("[id$='Output']").forEach(element => {
        element.textContent = "";
        const parent = element.parentNode;
        const input = parent?.querySelector("input");
        console.log(input);
        if (input?.value.trim() == "") {
            element.textContent = "Preencha o campo";
            errors += 1;
        }
    });
    if (errors > 0)
        return;
    // Obtém os dados do formulário
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData.entries());
    try {
        const response = await fetch(form.action, {
            method: form.method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });
        const resultado = await response.json();
        if (!response.ok) {
            errorOutput.innerText = resultado.mensagem;
            return;
        }
        window.location = resultado.redirect;
        // Aqui você pode tratar o sucesso do login.
    }
    catch (error) {
        console.error("Erro ao enviar formulário:", error);
        errorOutput.innerText = "Não foi possível conectar ao servidor.";
    }
});
//# sourceMappingURL=login.js.map