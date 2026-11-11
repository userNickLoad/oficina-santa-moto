console.log("LOGIN.TS CARREGADO");


type verifier = (value: string)=> string | null;

const verifyEmpty: verifier = (value) => {
    return (value.trim() === "")? "Campo vazio": null;
}

const verifyTelefone: verifier = (value: string) => {
    if(value.replace(/\D/g, "").length < 10){
        return "O telefone deve ter pelo menos 10 caracteres ou nenhum";
    } 

    return null;
}

const verifyEmail: verifier = (value: string) => {
    if(value.search(/@gmail.com/))
        return `Use a extenção @gmail.com como ${value.split("@")[0]}@gmail.com`

    return null
}

const parseFormData = (formData: FormData) => {
    const result: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
        const match = key.match(/^([^\[]+)\[(\d+)\]\[([^\]]+)\]$/);

        if (!match) {
            result[key] = value;
            continue;
        }

        const [, arrayName, index, property] = match;

        result[arrayName] ??= [];

        result[arrayName][Number(index)] ??= {};

        result[arrayName][Number(index)][property] = value;
    }

    return result;
};



const setForm = (formId: string | null = null, verifyIssues: Record<string, verifier> | null = null) => {
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

            const reset = ()=>{
                errorDisplay.textContent = "";
                input.classList.remove("border-red-400")
                input.classList.add("border-gray-400")

            }

            if(errorDisplay.textContent != "")
                reset()
            
            input.addEventListener("click", reset)

            let issueVerifyier: verifier | undefined  = undefined;

            if(verifyIssues)
                issueVerifyier = verifyIssues[input.id.match(/\[([^\]]+)\]$/)?.[1] ?? input.id]

            const issue = (issueVerifyier)? issueVerifyier(input.value): verifyEmpty(input.value);

            if(issue){
                errorDisplay.textContent = issue;
                input.classList.add("border-red-400")
                input.classList.remove("border-gray-400")
                errors += 1;
            }

        });

        if(errors > 0)
            return;

        // Obtém os dados do formulário
        const formData = new FormData(form);
        
        const dados = parseFormData(formData);


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
            console.log("foi -1")
            
            const resultado = await response.json();

            console.log("foi")

            if (!response.ok) {
                errorOutput.innerText = resultado.mensagem;
                return;
            }

            console.log("foi 2")
            
            if(resultado.redirect){
                window.location = resultado.redirect;
            }

            if (resultado.confirm) {
                const confirm = document.querySelector<HTMLElement>("#confirm");
                console.log(confirm)
                if (!confirm)
                    throw new Error("Não foi possível encontrar o #confirm");

                confirm.innerText = resultado.confirm;

                confirm.classList.remove("hidden");

                confirm.classList.remove("animate-confirm");
                void confirm.offsetWidth;
                confirm.classList.add("animate-confirm");
            }
            

            // Aqui você pode tratar o sucesso do login.

        } catch (error) {
            console.error("Erro ao enviar formulário:", error);
            errorOutput.innerText = "Não foi possível conectar ao servidor.";
        }
    });
}

export {setForm, verifyEmpty, verifyTelefone, verifyEmail}