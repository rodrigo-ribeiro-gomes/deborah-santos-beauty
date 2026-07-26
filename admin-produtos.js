function getApiBaseUrl() {
    const params = new URLSearchParams(window.location.search);
    const queryApiBaseUrl = params.get("apiBaseUrl");

    if (queryApiBaseUrl) {
        return queryApiBaseUrl.replace(/\/$/, "");
    }

    if (typeof window.__API_BASE_URL__ === "string" && window.__API_BASE_URL__) {
        return window.__API_BASE_URL__.replace(/\/$/, "");
    }

    return window.location.protocol === "file:" ? "http://localhost:8080" : "";
}

const API_BASE_URL = getApiBaseUrl();
const form = document.querySelector("#produto-form");
const mensagem = document.querySelector("#mensagem");
const submitButton = form.querySelector('button[type="submit"]');

function getProdutoPayload() {
    return {
        nome: document.querySelector("#nome").value.trim(),
        descricao: document.querySelector("#descricao").value.trim() || null,
        preco: Number(document.querySelector("#preco").value),
        categoria: document.querySelector("#categoria").value.trim(),
        estoque: Number(document.querySelector("#estoque").value),
        imagemUrl: document.querySelector("#imagemUrl").value.trim() || null
    };
}

function validarProduto(produto) {
    if (!produto.nome) {
        return "Informe o nome do produto.";
    }

    if (!produto.categoria) {
        return "Selecione a categoria do produto.";
    }

    if (!Number.isFinite(produto.preco) || produto.preco <= 0) {
        return "Informe um preço válido.";
    }

    if (!Number.isInteger(produto.estoque) || produto.estoque < 0) {
        return "Informe um estoque válido.";
    }

    return null;
}

async function cadastrarProduto(produto) {
    const response = await fetch(`${API_BASE_URL}/produtos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(produto)
    });

    const contentType = response.headers.get("content-type") || "";
    const responseBody = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const apiMessage =
            responseBody && typeof responseBody === "object"
                ? responseBody.message || responseBody.error
                : responseBody;

        throw new Error(apiMessage || "Não foi possível cadastrar o produto.");
    }

    return responseBody;
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensagem.textContent = "";

    const produto = getProdutoPayload();
    const erroValidacao = validarProduto(produto);

    if (erroValidacao) {
        mensagem.textContent = erroValidacao;
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Cadastrando...";

    try {
        const produtoCriado = await cadastrarProduto(produto);
        mensagem.textContent = `Produto ${produtoCriado.nome} cadastrado com sucesso.`;
        form.reset();
    } catch (error) {
        mensagem.textContent = error.message;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Cadastrar produto";
    }
});
