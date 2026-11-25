const formulario = document.getElementById("form-produto");
const mensagem = document.getElementById("mensagem");

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const dados = new FormData(formulario);
    const botao = formulario.querySelector("button");

    botao.disabled = true;
    mensagem.textContent = "Salvando...";

    try {
       const id = document.getElementById("produto-id").value;
const arquivo = id === "" ? "salvar.php" : "atualizar.php";

const resposta = await fetch(arquivo, {
    method: "POST",
    body: dados
});

        const resultado = await resposta.json();

        mensagem.textContent = resultado.mensagem;
if (resultado.sucesso) {
    limparFormulario();
    await listarProdutos();
}
    } catch (erro) {
        mensagem.textContent = "Não foi possível concluir o cadastro. Confira a lista antes de tentar novamente.";
    } finally {
        botao.disabled = false;
    }
});
async function listarProdutos() {
    const lista = document.getElementById("lista-produtos");
    const aviso = document.getElementById("aviso-lista");

    aviso.textContent = "Carregando produtos...";

    try {
        const resposta = await fetch("listar.php");

        if (!resposta.ok) {
            throw new Error("Erro ao consultar produtos.");
        }

        const produtos = await resposta.json();

        lista.replaceChildren();

        for (const produto of produtos) {
            const linha = document.createElement("tr");

            const precoFormatado = Number(produto.preco).toLocaleString(
                "pt-BR",
                { style: "currency", currency: "BRL" }
            );

            const valores = [
                produto.id,
                produto.nome,
                precoFormatado,
                produto.quantidade
            ];

            for (const valor of valores) {
                const coluna = document.createElement("td");
                coluna.textContent = valor;
                linha.appendChild(coluna);
            }
const acoes = document.createElement("td");
const botaoEditar = document.createElement("button");

botaoEditar.type = "button";
botaoEditar.textContent = "Editar";

botaoEditar.addEventListener("click", function () {
    document.getElementById("produto-id").value = produto.id;
    document.getElementById("nome").value = produto.nome;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    document.getElementById("botao-salvar").textContent = "Salvar alterações";
    document.getElementById("cancelar-edicao").hidden = false;

    mensagem.textContent = "Editando: " + produto.nome;
    document.getElementById("nome").focus();
});

acoes.appendChild(botaoEditar);
const botaoExcluir = document.createElement("button");

botaoExcluir.type = "button";
botaoExcluir.textContent = "Excluir";

botaoExcluir.addEventListener("click", function () {
    excluirProduto(produto.id);
});

acoes.appendChild(botaoExcluir);
linha.appendChild(acoes);
            
            lista.appendChild(linha);
        }

        aviso.textContent = produtos.length === 0
            ? "Nenhum produto cadastrado."
            : "";
    } catch (erro) {
        aviso.textContent = "Não foi possível atualizar a lista de produtos.";
    }
}

listarProdutos();
async function excluirProduto(id) {
    const confirmou = confirm("Deseja excluir este produto?");

    if (!confirmou) {
        return;
    }

    const dados = new FormData();
    dados.append("id", id);

    try {
        const resposta = await fetch("excluir.php", {
            method: "POST",
            body: dados
        });

        const resultado = await resposta.json();

        mensagem.textContent = resultado.mensagem;

        if (resultado.sucesso) {
            await listarProdutos();
        }
    } catch (erro) {
        mensagem.textContent = "Não foi possível confirmar a exclusão. Atualize a página para conferir.";
    }
}
function limparFormulario() {
    formulario.reset();

    document.getElementById("produto-id").value = "";
    document.getElementById("botao-salvar").textContent = "Cadastrar";
    document.getElementById("cancelar-edicao").hidden = true;
}

document.getElementById("cancelar-edicao").addEventListener("click", function () {
    limparFormulario();
    mensagem.textContent = "";
});