document.addEventListener("DOMContentLoaded", () =>{
    const lista = document.getElementById("lista-servicos");
    const pesquisa = document.getElementById("pesquisar-servico");
    const botaoConcluir = document.getElementById("btn-concluir");
    const botaoCancelar = document.getElementById("btn-cancelar");

    let servicos = [];
    let servicoSelecionado = null;
    let tempoToast;

    function mostrarSucesso(mensagem){
        const toast = document.getElementById("toast-sucesso");
        const texto = document.getElementById("mensagem-sucesso");

        texto.textContent = mensagem;
        toast.classList.remove("hidden");
        clearTimeout(tempoToast);

        tempoToast = setTimeout(() => {
            toast.classList.add("hidden");
        }, 3000);
    }

    function mostrarMensagem(mensagem) {
        lista.replaceChildren();

        const paragrafo = document.createElement("p");

        paragrafo.className = "text-gray-500 text-center";
        paragrafo.textContent = mensagem;

        lista.appendChild(paragrafo);
    }

    function renderizarServicos(dados){
        lista.replaceChildren();
        servicoSelecionado = null;
        botaoConcluir.disabled = true;
        botaoCancelar.disabled = true;

        if(dados.length === 0){
            mostrarMensagem("Nenhum serviço em andamento encontrado");
            return;
        }

        dados.forEach((servico) => {
            const cliente = servico.cliente?.nome?? "Não informado";
            const marca = servico.veiculo?.modelo?.marca?.nome?? "";
            const modelo = servico.veiculo?.modelo?.nome ?? "";
            const moto = `${marca} ${modelo}`.trim() || "Não informada";

            const cartao = document.createElement("div");
            cartao.className = 
                "border border-gray-300 rounded-[20px] p-5 cursor-pointer transition-all";
            const titulo = document.createElement("div");
            titulo.className = "flex justify-between items-center gap-e mb-4";

            const numero = document.createElement("span");
            numero.className = "font-semibold";
            numero.textContent = `OS #${String(servico.id).padStart(3, "0")}`;
            const status = document.createElement("span");
            status.className = "bg-orange-100 rounded-full px-3 py-1 text-sm";
            status.textContent = "em andamento";

            titulo.append(numero, status);
            cartao.appendChild(titulo);

            [`Cliente: ${cliente}`, `Moto: ${moto}`, `Serviço: ${servico.descricao || "Não informado"}`
            ].forEach((informacao) =>{
                const paragrafo = document.createElement("p");
                paragrafo.className = "text-sm mb-2";
                paragrafo.textContent = informacao;
                cartao.appendChild(paragrafo);
            });

            cartao.addEventListener("click", () => {
                lista.querySelectorAll("[data-servico-id]").forEach((item) => {
                    item.classList.remove("border-yellow-500", "bg-yellow-50");
                    item.classList.add("border-gray-300");
                    item.setAttribute("aria-pressed", "false");
                });

                cartao.classList.remove("border-gray-300");
                cartao.classList.add("border-yellow-500", "bg-yellow-50");
                cartao.setAttribute("aria-pressed", "true");

                servicoSelecionado = servico.id;
                botaoConcluir.disabled = false;
                botaoCancelar.disabled = false;
            });

            cartao.dataset.servicoId = servico.id;
            cartao.setAttribute("role", "button");
            cartao.setAttribute("tabindex", 0);
            cartao.setAttribute("aria-pressed", "false");

            cartao.addEventListener("keydown", (evento) =>{
                if(evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    cartao.click();
                }
            });

            lista.appendChild(cartao);
        });
    }

    async function carregarServico() {
        try{
            const resposta = await fetch("/api/servico/em-andamento");

            if(!resposta.ok){
                throw new Error("Erro ao buscar serviços.");
            }

            servicos = await resposta.json();
            renderizarServicos(servicos);
        }catch(erro) {
            console.error(erro);
            mostrarMensagem("Não foi possível carregar os serviços.");
        }
    }

    pesquisa.addEventListener("input", () => {
        const termo = pesquisa.value.toLocaleLowerCase("pt-BR").trim();

        const filtrados = servicos.filter((servico) =>
            (servico.cliente?.nome ?? "").toLocaleLowerCase("pt-BR").includes(termo)
        );

        renderizarServicos(filtrados);
    });

    botaoConcluir.addEventListener("click", async() => {
        if(servicoSelecionado === null) return;

        const confirmado = window.confirm("Deseja concluir esta ordem de serviço?");

        if(!confirmado) return;

        botaoConcluir.disabled = true;

        try{
            const resposta = await fetch(`/api/servico/${servicoSelecionado}/concluir`, { method: "PATCH"});

            if(!resposta.ok){
                throw new Error("Erro ao concluir serviço");
            }

            await carregarServico();
            mostrarSucesso("✓ Ordem de serviço concluída com sucesso");
        }catch (erro){
            console.error(erro);
            alert("Não foi possível concluir o serviço");
            botaoConcluir.disabled = false;
        }
    });

    botaoCancelar.addEventListener("click", async() => {
        if(servicoSelecionado === null) return;

        const confirmado = window.confirm("Deseja cancelar esta ordem de serviço?");

        if(!confirmado) return;

        botaoCancelar.disabled = true;
        botaoConcluir.disabled = true;

        try{
            const resposta = await fetch(`/api/servico/${servicoSelecionado}/cancelar`,{method: "PATCH"});

            if(!resposta.ok){
                throw new Error("Erro ao cancelar serviço");
            }

            await carregarServico();
            mostrarSucesso("✓ Ordem de serviço cancelada com sucesso");
        }catch (erro){
            console.error(erro);
            alert("Não foi possível cancelar o serviço");

            botaoCancelar.disabled = false;
            botaoConcluir.disabled = false;
        }
    });
    carregarServico();
});