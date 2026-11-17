async function carregarProdutosEstoque() {
    const lista = document.getElementById("lista-produtos");
    const mensagem = document.getElementById("mensagem-estoque");
    const pesquisa = document.querySelector('input[name="nomeProduto"]');
    const itemPesquisa = pesquisa?.value.trim().toLowerCase() ?? "";
    const categoriaSelecionada = document.querySelector('input[name="categorias"]:checked');
    const idCategoria = categoriaSelecionada?.value;
    const marcaSelecionada = document.querySelector('input[name="filtros[1]"]:checked');
    const idMarca = marcaSelecionada?.value;
    const disponibilidadeSelecionada = Array.from(document.querySelectorAll('input[name="filtros[2]"]:checked')).map(input => input.value);

    if (!lista || !mensagem) return;

    mensagem.classList.add("hidden");

    try {
        const url = new URL("/api/produto/estoque", window.location.origin);

        if(idCategoria){
            url.searchParams.set("id_categoria", idCategoria);
        }

        if(idMarca){
            url.searchParams.set("id_marca", idMarca);
        }

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar produtos");
        }

        const produtos = await resposta.json();
        const produtosFiltrados = produtos.filter(produto => {
            const correspondeNome = produto.nome.toLowerCase().includes(itemPesquisa);
            const quantidade = Number(produto.qtd_disponivel);

            const correspondeDisponibilidade = disponibilidadeSelecionada.length === 0 || disponibilidadeSelecionada.length === 2 ||
                (disponibilidadeSelecionada.includes("20") && quantidade > 0) || (disponibilidadeSelecionada.includes("21") && quantidade === 0);

            return correspondeNome && correspondeDisponibilidade;
        });
        
        lista.replaceChildren();
        mensagem.classList.add("hidden");
        mensagem.style.display = "none";

        if (produtosFiltrados.length === 0) {
            mensagem.replaceChildren();
            const imagem = document.createElement("img");
            imagem.src = "/assets/estoque.png";
            imagem.alt = "Estoque vazio";
            imagem.className = "w-16 h-16 object-contain mx-auto mb-4";
            const texto = document.createElement("span");
            texto.textContent = "Nenhum produto encontrado no estoque";
            texto.className = "text-gray-500 text-center";
            mensagem.append(imagem, texto);
            mensagem.classList.remove("hidden");
            mensagem.style.display = "flex";
            mensagem.style.flexDirection = "column";
            mensagem.style.alignItems = "center";
            
            return;
        }

        const formatarPreco = valor =>
            Number(valor).toLocaleString("pt-BR", {style: "currency", currency: "BRL"});

        produtosFiltrados.forEach(produto => {
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

document.addEventListener("DOMContentLoaded", () => {
    const pesquisa = document.querySelector('input[name="nomeProduto"]');
    const formulario = document.getElementById("filters-form");

    carregarProdutosEstoque();

    pesquisa?.addEventListener("input", carregarProdutosEstoque);

    formulario?.addEventListener("submit", (evento) => {
        evento.preventDefault();
        carregarProdutosEstoque();
    });

    const categorias = document.querySelectorAll('input[name="categorias"]');
    categorias.forEach(categoria => {
        categoria.addEventListener("change", carregarProdutosEstoque);
    });

    const marcas = document.querySelectorAll('input[name="filtros[1]"]');
    marcas.forEach(marca => {
        marca.addEventListener("change", carregarProdutosEstoque);
    });   

    const disponibilidades = document.querySelectorAll('input[name="filtros[2]"]');
    disponibilidades.forEach(disponibilidade => {
        disponibilidade.addEventListener("change", carregarProdutosEstoque);
    });   

});