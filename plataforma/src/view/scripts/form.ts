console.log("LOGIN.TS CARREGADO");


const verifyEmpty = (input: HTMLInputElement) => {
    return (input.value.trim() === "")? "Campo vazio": null;
}

const parseFormData = (formData: FormData) => {
    const result: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
        const match = key.match(/^([^\[]+)\[(\d+)\]\[([^\]]+)\]$/);

        if (match) {
            const [, arrayName, index, property] = match;

            result[arrayName] ??= [];

            result[arrayName][Number(index)] ??= {};

            result[arrayName][Number(index)][property] = value;

            continue;
        }

        result[key] = value;
    }

    return result;
};


const setForm = (formId: string | null = null, verifyIssues: ((inputElement: HTMLInputElement) => string | null) | null = null, multi: boolean = false) => {
    const form = document.querySelector<HTMLFormElement>(
    (formId)?`#${formId}` : "form"
    );

    if (!form) {
        throw new Error("Formulário não encontrado");
    }

    const errorOutput = document.querySelector<HTMLElement>("#error");

    if (!errorOutput) {
        throw new Error("ErrorOutput não localizado");
    } 


    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Limpa erros anteriores
        errorOutput.innerText = "";

        let errors = 0;


        form.querySelectorAll<HTMLInputElement>("input").forEach(input => {
            if(input.disabled)
                return;

            const parent = input.closest('[data-parent="inputbox"]');
            if(!parent){
                throw new Error(`não foi possivel localizar o pai de ${input.id}`)
            }
            const errorDisplay = parent.querySelector('[id^="output"]');

            if(!errorDisplay){
                throw new Error(`o errorOutput do ${input.id} não foi encontrado`)
            }

            errorDisplay.textContent = "";

            const issue = (verifyIssues)? verifyIssues(input): verifyEmpty(input);

            if(issue){
                errorDisplay.textContent = issue;
                errors += 1;
            }

        });

        if(errors > 0)
            return;

        // Obtém os dados do formulário
        const formData = new FormData(form);
        
        let dados;

        if(!multi)
            dados = Object.fromEntries(formData.entries());
        else 
            dados = parseFormData(formData);

        console.log(dados)

        const contains_files = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="file"]')).some((input => (input.files && input.files.length > 0)))

        try {
            const response = await fetch(form.action, {
                method: form.method,
                ...(
                    (contains_files)? {
                        body: formData
                    }:
                    {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(dados)
                    }
                )

            });

            const resultado = await response.json();

            if (!response.ok) {
                errorOutput.innerText = resultado.mensagem;
                return;
            }

            window.location = resultado.redirect;

            // Aqui você pode tratar o sucesso do login.

        } catch (error) {
            console.error("Erro ao enviar formulário:", error);
            errorOutput.innerText = "Não foi possível conectar ao servidor.";
        }
    });
}

export {setForm, verifyEmpty}