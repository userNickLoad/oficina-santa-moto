let paginaAtual = 1;
let carregandoProdutos = false;
let existemMaisProdutos = true;

let versaoFiltros = 0;

function reiniciarListagem(){
    versaoFiltros++;
    paginaAtual = 1;
    existemMaisProdutos = true;

    const lista = document.getElementById("lista-produtos");
    lista?.replaceChildren();

    if(!carregandoProdutos){
        carregarProdutosEstoque();
    }
}

async function carregarProdutosEstoque() {
    if(carregandoProdutos || !existemMaisProdutos) return;

    const lista = document.getElementById("lista-produtos");
    const mensagem = document.getElementById("mensagem-estoque");   

    if(!lista || !mensagem) return;

    carregandoProdutos = true;
    const versaoRequisicao = versaoFiltros;

    let carregamentoConcluido = false;

    const pesquisa = document.querySelector('input[name="nomeProduto"]');
    const itemPesquisa = pesquisa?.value.trim().toLowerCase() ?? "";
    const categoriaSelecionada = document.querySelectorAll('input[name="categorias"]:checked');
    const marcaSelecionada = document.querySelectorAll('input[name="filtros[1]"]:checked');
    const disponibilidadeSelecionada = Array.from(document.querySelectorAll('input[name="filtros[2]"]:checked')).map(input => input.value);

    mensagem.classList.add("hidden");

    try {
        const url = new URL("/api/produto/estoque", window.location.origin);
        url.searchParams.set("pagina", paginaAtual);
        if(itemPesquisa){
            url.searchParams.set("nome", itemPesquisa);
        }

        categoriaSelecionada.forEach(categoria => {
            url.searchParams.append("id_categoria", categoria.value);
        });

        marcaSelecionada.forEach(marca => {
            url.searchParams.append("id_marca", marca.value);
        });

        if(disponibilidadeSelecionada.length === 1){
            const disponibilidade = disponibilidadeSelecionada[0] === "20" ? "em_estoque" : "sem_estoque";
            url.searchParams.set("disponibilidade", disponibilidade);
        }

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar produtos");
        }

        const produtos = await resposta.json();
        if(versaoRequisicao !== versaoFiltros){return;}
        existemMaisProdutos = produtos.length === 20;
        const produtosFiltrados = produtos;
        
        mensagem.classList.add("hidden");
        mensagem.style.display = "none";

        if (produtosFiltrados.length === 0 && lista.children.length === 0) {
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
            existemMaisProdutos = false;
            return;
        }

        const formatarPreco = valor =>
            Number(valor).toLocaleString("pt-BR", {style: "currency", currency: "BRL"});

        produtosFiltrados.forEach(produto => {
            const card = document.createElement("a");
            card.href = "/estoque/produto/" + produto.id
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

        paginaAtual++;
        carregamentoConcluido = true;

    } catch (erro) {
        console.error("Erro ao carregar estoque:", erro);
        if(versaoRequisicao === versaoFiltros){
            existemMaisProdutos = false;
            
            mensagem.textContent = "Não foi possível carregar os produtos";
            mensagem.classList.remove("hidden");
            mensagem.style.display = "flex";
        }
        
    } finally{
        carregandoProdutos = false;

        if(versaoRequisicao !== versaoFiltros){
            carregarProdutosEstoque();
        }else if(carregamentoConcluido && existemMaisProdutos){
            const marcador = document.getElementById("marcador-scroll");

            if(marcador){
                const posicao = marcador.getBoundingClientRect();

                if(posicao.top <= window.innerHeight + 200 && posicao.bottom >= -200){
                    carregarProdutosEstoque();
                }
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const pesquisa = document.querySelector('input[name="nomeProduto"]');
    const formulario = document.getElementById("filters-form");

    reiniciarListagem();

    pesquisa?.addEventListener("input", reiniciarListagem);

    formulario?.addEventListener("submit", (evento) => {
        evento.preventDefault();
        reiniciarListagem();
    });

    const categorias = document.querySelectorAll('input[name="categorias"]');
    categorias.forEach(categoria => {
        categoria.addEventListener("change", reiniciarListagem);
    });

    const marcas = document.querySelectorAll('input[name="filtros[1]"]');
    marcas.forEach(marca => {
        marca.addEventListener("change", reiniciarListagem);
    });   

    const disponibilidades = document.querySelectorAll('input[name="filtros[2]"]');
    disponibilidades.forEach(disponibilidade => {
        disponibilidade.addEventListener("change", reiniciarListagem);
    });
    
    const botaoLimpar = document.getElementById("limpar-filtros");
    botaoLimpar?.addEventListener("click", () => {
        formulario?.reset();
        reiniciarListagem();
    });

    const observador = new IntersectionObserver((entradas) => {
        if(entradas[0].isIntersecting && !carregandoProdutos && existemMaisProdutos){
            carregarProdutosEstoque();  
        }
    }, {rootMargin: "200px"});

    const marcador = document.createElement("div");
    marcador.id = "marcador-scroll";
    marcador.style.height = "1px";

    const lista = document.getElementById("lista-produtos");

    if(lista){
        lista.insertAdjacentElement("afterend", marcador);
        observador.observe(marcador);   
    }

});