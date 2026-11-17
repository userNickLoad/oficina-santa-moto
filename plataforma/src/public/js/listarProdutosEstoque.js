
async function carregarProdutosEstoque() {
    const lista = document.getElementById("lista-produtos");
    const mensagem = document.getElementById("mensagem-estoque");

    if (!lista || !mensagem) return;

    mensagem.classList.add("hidden");

    try {
        const resposta = await fetch("/api/produto/estoque");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar produtos");
        }

        const produtos = await resposta.json();

        lista.replaceChildren();

        if (produtos.length === 0) {
            const imagem = document.createElement("img");
            imagem.src = "/assets/estoque.png";
            imagem.alt = "Estoque vazio";
            imagem.className = "w-8 h-8 object-contain mx-auto mb-4";
            const texto = document.createElement("span");
            texto.textContent = "Nenhum produto encontrado no estoque";
            mensagem.append(imagem, texto);
            mensagem.classList.remove("hidden");
            return;
        }

        const formatarPreco = valor =>
            Number(valor).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        produtos.forEach(produto => {
            const card = document.createElement("article");
            card.className = "border border-gray-200 rounded-2xl p-3 bg-white shadow-sm max-w-[340px] w-full";

            if (produto.imagem) {
                const imagem = document.createElement("img");
                imagem.src = `/files/${produto.imagem}`;
                imagem.alt = produto.nome;
                imagem.className = "w-full h-32 object-contain rounded-xl mb-3";
                card.appendChild(imagem);
            }

            const nome = document.createElement("h3");
            nome.className = "font-bold text-lg";
            nome.textContent = produto.nome;

            const quantidade = document.createElement("p");
            quantidade.className = "text-gray-600 mt-2";
            quantidade.textContent =
                `Quantidade disponível: ${produto.qtd_disponivel}`;

            const preco = document.createElement("p");
            preco.className = "font-bold mt-2";
            preco.textContent =
                formatarPreco(produto.preco_venda);

            card.append(nome, quantidade, preco);
            lista.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro ao carregar estoque:", erro);
        mensagem.textContent = "Não foi possível carregar os produtos";
        mensagem.classList.remove("hidden");
    }
}

document.addEventListener("DOMContentLoaded", carregarProdutosEstoque);
