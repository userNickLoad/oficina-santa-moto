const campoBusca = document.getElementById("buscar-produto");
const resultadoBusca = document.getElementById("resultado-busca");
const produtosSelecionados = document.getElementById("produtos-selecionados");
const totalVenda = document.getElementById("total-venda");

const itensVenda = [];

const campoBuscaCliente = document.getElementById("buscar-cliente");
const resultadoBuscaCliente = document.getElementById("resultado-busca-cliente");
const clienteSelecionado = document.getElementById("cliente-selecionado");
const nomeClienteSelecionado = document.getElementById("nome-cliente-selecionado");
const removerCliente = document.getElementById("remover-cliente");

let idClienteSelecionado = null;
let buscaClienteAtual = 0;

campoBuscaCliente.addEventListener("input", async () => {
    const nome = campoBuscaCliente.value.trim();
    const numeroBusca = ++buscaClienteAtual;

    // Alterar a pesquisa invalida o cliente selecionado anteriormente
    idClienteSelecionado = null;
    clienteSelecionado.classList.add("hidden");

    resultadoBuscaCliente.replaceChildren();

    if (nome.length < 2) {
        resultadoBuscaCliente.classList.add("hidden");
        return;
    }

    try {
        const resposta = await fetch(
            `/api/cliente/buscar?nome=${encodeURIComponent(nome)}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar clientes");
        }

        const clientes = await resposta.json();

        if (numeroBusca !== buscaClienteAtual) return;

        resultadoBuscaCliente.replaceChildren();
        resultadoBuscaCliente.classList.remove("hidden");

        if (clientes.length === 0) {
            const mensagem = document.createElement("p");
            mensagem.className = "p-3 text-sm text-gray-500";
            mensagem.textContent = "Nenhum cliente encontrado";
            resultadoBuscaCliente.appendChild(mensagem);
            return;
        }

        clientes.forEach((cliente) => {
            const botao = document.createElement("button");

            botao.type = "button";
            botao.className =
                "block w-full text-left px-4 py-3 " +
                "hover:bg-gray-100 border-b border-gray-100";

            botao.textContent = cliente.nome;

            botao.addEventListener("click", () => {
                ++buscaClienteAtual;

                idClienteSelecionado = cliente.id;
                nomeClienteSelecionado.textContent = cliente.nome;

                campoBuscaCliente.value = "";
                campoBuscaCliente.classList.add("hidden");

                resultadoBuscaCliente.replaceChildren();
                resultadoBuscaCliente.classList.add("hidden");

                clienteSelecionado.classList.remove("hidden");
            });

            resultadoBuscaCliente.appendChild(botao);
        });

    } catch (error) {
        if (numeroBusca !== buscaClienteAtual) return;

        console.error("Erro ao buscar clientes:", error);
        resultadoBuscaCliente.textContent = "Erro ao pesquisar clientes";
        resultadoBuscaCliente.classList.remove("hidden");
    }
});

removerCliente.addEventListener("click", () => {
    ++buscaClienteAtual;

    idClienteSelecionado = null;
    nomeClienteSelecionado.textContent = "";

    clienteSelecionado.classList.add("hidden");
    campoBuscaCliente.classList.remove("hidden");
    campoBuscaCliente.value = "";
    campoBuscaCliente.focus();
});

const formatarMoeda = (valor) => {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
};

let buscaAtual = 0;

campoBusca.addEventListener("input", async () => {
    const nome = campoBusca.value.trim();
    const numeroBusca = ++buscaAtual;

    if (nome.length < 2) {
        resultadoBusca.innerHTML = "";
        resultadoBusca.classList.add("hidden");
        return;
    }

    try {
        const resposta = await fetch(
            `/api/produto/buscar?nome=${encodeURIComponent(nome)}`
        );

        if (!resposta.ok) {
            throw new Error("Erro na busca de produtos");
        }

        const produtos = await resposta.json();

        if (numeroBusca !== buscaAtual) return;

        resultadoBusca.innerHTML = "";
        resultadoBusca.classList.remove("hidden");

        if (produtos.length === 0) {
            resultadoBusca.textContent = "Nenhum produto encontrado";
            resultadoBusca.classList.add("p-4", "text-sm", "text-gray-500");
            return;
        }

        produtos.forEach((produto) => {
            const botao = document.createElement("button");

            botao.type = "button";
            botao.className = "w-full text-left px-4 py-3 border-b border-gray-100 " +
                "hover:bg-gray-50 flex justify-between gap-3";

            const informacoes = document.createElement("div");

            const nomeProduto = document.createElement("p");
            nomeProduto.className = "font-medium text-gray-800";
            nomeProduto.textContent = produto.nome;

            const estoque = document.createElement("p");
            estoque.className = "text-xs text-gray-500 mt-1";
            estoque.textContent =
                `Disponível: ${produto.qtd_disponivel}`;

            informacoes.append(nomeProduto, estoque);

            const preco = document.createElement("span");
            preco.className = "font-semibold text-gray-800";
            preco.textContent = formatarMoeda(produto.preco_venda);

            botao.append(informacoes, preco);

            if (produto.qtd_disponivel <= 0) {
                botao.disabled = true;
                botao.classList.add("opacity-50", "cursor-not-allowed");
            } else {
                botao.addEventListener("click", () => {
                    adicionarProduto(produto);
                });
            }

            resultadoBusca.appendChild(botao);
        });

    } catch (error) {
        if (numeroBusca !== buscaAtual) return;

        console.error("Erro ao buscar produtos:", error);
        resultadoBusca.textContent = "Erro ao pesquisar produtos";
        resultadoBusca.classList.remove("hidden");
    }
});

function adicionarProduto(produto) {
    const existente = itensVenda.find(
        (item) => item.id === produto.id
    );

    if (existente) {
        if (existente.quantidade < existente.qtd_disponivel) {
            existente.quantidade++;
        }
    } else {
        itensVenda.push({
            id: produto.id,
            nome: produto.nome,
            preco: Number(produto.preco_venda),
            qtd_disponivel: produto.qtd_disponivel,
            quantidade: 1
        });
    }

    campoBusca.value = "";
    resultadoBusca.innerHTML = "";
    resultadoBusca.classList.add("hidden");

    renderizarProdutos();
}

function renderizarProdutos() {
    produtosSelecionados.innerHTML = "";

    if (itensVenda.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.className = "text-sm text-gray-400 text-center py-8";
        mensagem.textContent = "Nenhum produto adicionado";
        produtosSelecionados.appendChild(mensagem);
    }

    itensVenda.forEach((item) => {
        const linha = document.createElement("div");
        linha.className =
            "flex items-center justify-between gap-3 " +
            "border border-gray-200 rounded-xl p-3";

        const informacoes = document.createElement("div");
        informacoes.className = "flex-1 min-w-0";

        const nome = document.createElement("p");
        nome.className = "font-medium text-gray-800";
        nome.textContent = item.nome;

        const preco = document.createElement("p");
        preco.className = "text-sm text-gray-500";
        preco.textContent = formatarMoeda(item.preco);

        informacoes.append(nome, preco);

        const controles = document.createElement("div");
        controles.className = "flex items-center gap-2";

        const diminuir = document.createElement("button");
        diminuir.type = "button";
        diminuir.className = "px-2 py-1 border rounded-lg";
        diminuir.textContent = "−";

        diminuir.addEventListener("click", () => {
            if (item.quantidade > 1) {
                item.quantidade--;
            } else {
                itensVenda.splice(itensVenda.indexOf(item), 1);
            }
            renderizarProdutos();
        });

        const quantidade = document.createElement("span");
        quantidade.className = "font-medium min-w-[20px] text-center";
        quantidade.textContent = item.quantidade;

        const aumentar = document.createElement("button");
        aumentar.type = "button";
        aumentar.className = "px-2 py-1 border rounded-lg";
        aumentar.textContent = "+";
        aumentar.disabled = item.quantidade >= item.qtd_disponivel;

        aumentar.addEventListener("click", () => {
            if (item.quantidade < item.qtd_disponivel) {
                item.quantidade++;
                renderizarProdutos();
            }
        });

        controles.append(diminuir, quantidade, aumentar);
        linha.append(informacoes, controles);
        produtosSelecionados.appendChild(linha);
    });

    const total = itensVenda.reduce(
        (soma, item) => soma + item.preco * item.quantidade,
        0
    );

    totalVenda.textContent = formatarMoeda(total);
}

let tempoToast;

function mostrarSucesso(mensagem) {
    const toast = document.getElementById("toast-sucesso");
    const texto = document.getElementById("mensagem-sucesso");

    texto.textContent = mensagem;
    toast.classList.remove("hidden");

    clearTimeout(tempoToast);

    tempoToast = setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);
}

const formularioVenda = document.getElementById("form-registrar-venda");

formularioVenda.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (itensVenda.length === 0) {
        alert("Adicione pelo menos um produto à venda.");
        return;
    }

    const botaoRegistrar = formularioVenda.querySelector(
        'button[type="submit"]'
    );

    botaoRegistrar.disabled = true;

    try {
        const resposta = await fetch("/api/venda", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_cliente: idClienteSelecionado,
                produtos: itensVenda.map((item) => ({
                    id_produto: item.id,
                    quantidade: item.quantidade
                }))
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.mensagem || "Erro ao registrar venda"
            );
        }

        sessionStorage.setItem(
            "mensagemVenda",
            "Venda registrada com sucesso!"
        );
        window.location.reload();

    } catch (error) {
        alert(error instanceof Error
            ? error.message
            : "Erro ao registrar venda"
        );
    } finally {
        botaoRegistrar.disabled = false;
    }
});

const mensagemVenda = sessionStorage.getItem("mensagemVenda");

if (mensagemVenda) {
    mostrarSucesso(mensagemVenda);
    sessionStorage.removeItem("mensagemVenda");
}
