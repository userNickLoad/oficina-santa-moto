console.log("LOGIN.TS CARREGADO");


type verifier = (value: string, input?: HTMLElement)=> string | null;

const verifyEmpty: verifier = (value) => {
    return (String(value).trim() === "")? "Campo vazio": null;
}

const verifyTelefone: verifier = (value: string) => {
    if(value.replace(/\D/g, "").length < 10){
        return "O telefone deve ter pelo menos 10 caracteres ou nenhum";
    }

    return null;
}

const verifyEmail: verifier = (value: string) => {
    const a = value.trim().split("@");
    console.log("email: ", a)
    if(a.length != 2)
        return `Use a extenção @gmail.com como ${a[0]}@gmail.com`

    if(a[1] != "gmail.com")
        return `Use a extenção @gmail.com como ${a[0]}@gmail.com`

    return null
}

const parseFormData = (formData: FormData) => {
    const result: Record<string, any> = {};
    const setArrays = new Set<string>();
    console.log("Entries: ")

    for (const [key, value] of formData.entries()) {
        console.log(key, value)
        const match = key.match(/^([^\[]+)\[(\d+)\]\[([^\]]+)\]$/);
        if (!match) {
            result[key] = value;
            continue;
        }

        const [, arrayName, index, property] = match;

        setArrays.add(arrayName)

        if(result[arrayName] === undefined){
            console.log(result)
            result[arrayName] ??= [];
        }

        result[arrayName][Number(index)] ??= {};

        result[arrayName][Number(index)][property] = value;
    }

    setArrays.forEach((arrayName: string) => {
        result[arrayName] = result[arrayName].filter((l: any) => (l != null))
    })

    console.log(result)


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
            if(input.disabled || input.classList.contains("hidden") || input.dataset.ignore)
                return;

            const parent = input.closest('[data-parent="inputbox"]');
            if(!parent){
                throw new Error(`não foi possivel localizar o pai de ${input}`)
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

            const issue = (issueVerifyier)? issueVerifyier(input.value, input): verifyEmpty(input.value);

            if(issue){
                console.log(issue, input.name)
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

        const contains_files =  form.querySelectorAll<HTMLInputElement>('input[type="file"]');

        const dados = parseFormData(formData);

        let body: FormData | string;
        let headers: HeadersInit | undefined;

        if (contains_files.length > 0) {
            const multipart = new FormData();

            // Adiciona o JSON com os demais campos
            multipart.append("content", JSON.stringify(dados));


            // Adiciona os arquivos individualmente
            contains_files.forEach(input => {
                if (!input.files) return;

                for (const file of input.files) {
                    multipart.append(input.name, file);
                }
            });

            body = multipart;


        } else {
            headers = {
                "Content-Type": "application/json"
            };

            body = JSON.stringify(dados);
        }

        try {
            const response = await fetch(form.action, {
                method: form.method,
                headers,
                body
            });

            console.log(response)
            const resultado = await response.json();


            if (!response.ok) {
                errorOutput.innerText = resultado.mensagem;
                return;
            }

            if(resultado.redirect){
                window.location = resultado.redirect;
            }

            if (resultado.confirm) {
                const confirm = document.querySelector<HTMLElement>("#confirm");

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