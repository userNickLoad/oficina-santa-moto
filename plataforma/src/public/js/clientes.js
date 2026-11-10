import { setSearchBox } from "./searchBox.js";
const searchBox = document.querySelector("#search-client");
if (!searchBox)
    throw new Error("não foi possivel acha a caixa de pesquisa");
setSearchBox(searchBox, "/api/cliente/buscar?nome=", async (value) => {
    window.location.replace(`http://localhost:3000/clientes?nome=${value}`);
});
//# sourceMappingURL=clientes.js.map