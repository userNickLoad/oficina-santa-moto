
function setupImageUpload(
    inputId: string,
    previewId: string,
    cancelId: string
): void {

    const input = document.getElementById(inputId) as HTMLInputElement | null;
    const preview = document.getElementById(previewId);
    const cancel = document.getElementById(cancelId);

    if (!input || !preview || !cancel) {
        console.error("Elementos do upload não encontrados.");
        return;
    }

    let files = new DataTransfer();

    // Atualiza os arquivos do input
    function updateInput(): void {
        if (!input || !preview || !cancel) {
            console.error("Elementos do upload não encontrados.");
            return;
        }
        input.files = files.files;
    }

    // Renderiza as imagens selecionadas
    function renderPreview(): void {
        if (!input || !preview || !cancel) {
            console.error("Elementos do upload não encontrados.");
            return;
        }
        // Libera as URLs anteriores
        preview.querySelectorAll("img").forEach(img => {
            URL.revokeObjectURL(img.src);
        });

        preview.innerHTML = "";

        Array.from(files.files).forEach((file, index) => {

            const url = URL.createObjectURL(file);

            const container = document.createElement("div");
            container.className = "relative aspect-square";

            const img = document.createElement("img");
            img.src = url;
            img.alt = file.name;
            img.className = "w-full h-full object-cover rounded-xl";

            const remove = document.createElement("button");
            remove.type = "button";
            remove.textContent = "×";
            remove.setAttribute("aria-label", `Remover ${file.name}`);
            remove.className = `
                absolute top-2 right-2
                bg-red-600 text-white
                rounded-full w-7 h-7
                cursor-pointer
            `;

            remove.addEventListener("click", () => {
                removeFile(index);
            });

            container.append(img, remove);
            preview.appendChild(container);

        });
    }

    // Remove uma imagem específica
    function removeFile(index: number): void {

        const newFiles = new DataTransfer();

        Array.from(files.files).forEach((file, i) => {
            if (i !== index) {
                newFiles.items.add(file);
            }
        });

        files = newFiles;

        updateInput();
        renderPreview();
    }

    // Adiciona novas imagens
    input.addEventListener("change", () => {

        const selectedFiles = Array.from(input.files ?? []);

        selectedFiles.forEach(file => {

            // Evita arquivos duplicados
            const exists = Array.from(files.files).some(current =>
                current.name === file.name &&
                current.size === file.size &&
                current.lastModified === file.lastModified
            );

            if (!exists) {
                files.items.add(file);
            }
        });

        // Permite selecionar novamente o mesmo arquivo
        input.value = "";

        updateInput();
        renderPreview();
    });

    // Cancela todo o upload
    cancel.addEventListener("click", () => {

        files = new DataTransfer();

        updateInput();
        renderPreview();

    });

}

document.addEventListener("DOMContentLoaded", () => {

    setupImageUpload(
        "imagem",
        "imagem-preview",
        "cancel-imagem"
    );

});