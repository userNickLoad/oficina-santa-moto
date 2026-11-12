document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("lista-todas-os");
    const filtros = document.querySelectorAll(".filtro-os");

    let servicos = [];
    let filtroAtual = "TODOS";

    function mostrarMensagem(mensagem) {
        lista.replaceChildren();

        const paragrafo = document.createElement("p");
        paragrafo.className = "text-gray-500 text-center";
        paragrafo.textContent = mensagem;

        lista.appendChild(paragrafo);
    }

    function renderizarServicos() {
        lista.replaceChildren();

        const filtrados = filtroAtual === "TODOS"
            ? servicos
            : servicos.filter(servico => servico.status === filtroAtual);

        if (filtrados.length === 0) {
            mostrarMensagem("Nenhuma ordem de serviço encontrada.");
            return;
        }

        filtrados.forEach(servico => {
            const cliente = servico.cliente?.nome ?? "Não informado";
            const marca = servico.veiculo?.modelo?.marca?.nome ?? "";
            const modelo = servico.veiculo?.modelo?.nome ?? "";
            const moto = `${marca} ${modelo}`.trim() || "Não informada";

            const cartao = document.createElement("div");
            cartao.className =
                "border border-gray-300 rounded-[20px] p-5";

            const cabecalho = document.createElement("div");
            cabecalho.className =
                "flex justify-between items-center gap-3 mb-4";

            const numero = document.createElement("span");
            numero.className = "font-semibold";
            numero.textContent =
                `OS #${String(servico.id).padStart(3, "0")}`;

            const status = document.createElement("span");
            status.className =
                "rounded-full px-3 py-1 text-sm";

            const estilos = {
                EM_ANDAMENTO: {
                    texto: "Em andamento",
                    classe: "bg-orange-100 text-orange-800"
                },
                CONCLUIDO: {
                    texto: "Concluído",
                    classe: "bg-green-100 text-green-800"
                },
                CANCELADO: {
                    texto: "Cancelado",
                    classe: "bg-red-100 text-red-800"
                }
            };

            const situacao = estilos[servico.status] ?? {
                texto: servico.status || "Desconhecido",
                classe: "bg-gray-100 text-gray-700"
            };

            status.textContent = situacao.texto;
            status.className += ` ${situacao.classe}`;

            cabecalho.append(numero, status);
            cartao.appendChild(cabecalho);

            [
                `Cliente: ${cliente}`,
                `Moto: ${moto}`,
                `Serviço: ${servico.descricao || "Não informado"}`
            ].forEach(informacao => {
                const paragrafo = document.createElement("p");
                paragrafo.className = "text-sm mb-2";
                paragrafo.textContent = informacao;
                cartao.appendChild(paragrafo);
            });

            lista.appendChild(cartao);
        });
    }

    async function carregarServicos() {
        try {
            const resposta = await fetch("/api/servico/todos");

            if (!resposta.ok) {
                throw new Error("Erro ao buscar ordens de serviço");
            }

            servicos = await resposta.json();
            renderizarServicos();

        } catch (erro) {
            console.error(erro);
            mostrarMensagem("Não foi possível carregar as ordens de serviço.");
        }
    }

    filtros.forEach(botao => {
        botao.addEventListener("click", () => {
            filtroAtual = botao.dataset.filtro;

            filtros.forEach(item => {
                item.classList.remove("bg-primary", "font-semibold");
            });

            botao.classList.add("bg-primary", "font-semibold");

            renderizarServicos();
        });
    });

    filtros[0]?.classList.add("bg-primary", "font-semibold");

    carregarServicos();
});