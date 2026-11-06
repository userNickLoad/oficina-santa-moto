console.log("LOGIN.TS CARREGADO");
const verifyEmpty = (input) => {
    return (input.value.trim() === "") ? "Campo vazio" : null;
};
const setForm = (formId = null, verifyIssues = null) => {
    const form = document.querySelector((formId) ? `#${formId}` : "form");
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
        form.querySelectorAll("input").forEach(input => {
            if (input.disabled)
                return;
            const parent = (input.type != "file") ? input.parentElement : input.parentElement?.parentElement;
            if (!parent) {
                throw new Error(`não foi possivel localizar o pai de ${input.id}`);
            }
            const errorDisplay = parent.querySelector('[id^="output"]');
            if (!errorDisplay) {
                throw new Error(`o errorOutput do ${input.id} não foi encontrado`);
            }
            errorDisplay.textContent = "";
            const issue = (verifyIssues) ? verifyIssues(input) : verifyEmpty(input);
            if (issue) {
                errorDisplay.textContent = issue;
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
};
export { setForm, verifyEmpty };
//# sourceMappingURL=form.js.map