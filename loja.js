async function carregarProdutos() {
    const tabela = document.getElementById("produtos-loja");
    const aviso = document.getElementById("aviso-loja");

    aviso.textContent = "Carregando produtos...";

    try {
        const resposta = await fetch("listar.php");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar produtos.");
        }

        const produtos = await resposta.json();

        tabela.replaceChildren();

        for (const produto of produtos) {
            const linha = document.createElement("tr");

            const precoFormatado = Number(produto.preco).toLocaleString(
                "pt-BR",
                { style: "currency", currency: "BRL" }
            );

            const valores = [
                produto.nome,
                precoFormatado,
                produto.quantidade
            ];

            for (const valor of valores) {
                const coluna = document.createElement("td");
                coluna.textContent = valor;
                linha.appendChild(coluna);
            }

            const colunaQuantidade = document.createElement("td");
            const campo = document.createElement("input");

            campo.type = "number";
            campo.min = "0";
            campo.max = produto.quantidade;
            campo.step = "1";
            campo.value = "0";

            campo.dataset.id = produto.id;
            campo.dataset.preco = produto.preco;

            campo.addEventListener("input", calcularTotal);

            campo.setAttribute(
                "aria-label",
                "Quantidade de " + produto.nome
            );

            campo.disabled = Number(produto.quantidade) === 0;

            colunaQuantidade.appendChild(campo);
            linha.appendChild(colunaQuantidade);
            tabela.appendChild(linha);
        }

        aviso.textContent = produtos.length === 0
            ? "Nenhum produto disponível."
            : "";

        return true;
    } catch (erro) {
        aviso.textContent = "Não foi possível carregar os produtos.";
        return false;
    }
}

function formatarMoeda(centavos) {
    return (centavos / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function calcularTotal() {
    const campos = document.querySelectorAll("#produtos-loja input");
    const aviso = document.getElementById("aviso-loja");

    let subtotal = 0;

    for (const campo of campos) {
        const quantidade = Number(campo.value);
        const estoque = Number(campo.max);

        if (
            !Number.isInteger(quantidade) ||
            quantidade < 0 ||
            quantidade > estoque
        ) {
            aviso.textContent =
                "Use quantidades inteiras entre zero e o estoque disponível.";

            document.getElementById("subtotal").textContent = "—";
            document.getElementById("desconto").textContent = "—";
            document.getElementById("total").textContent = "—";

            return;
        }

        const precoCentavos = Math.round(
            Number(campo.dataset.preco) * 100
        );

        subtotal += precoCentavos * quantidade;
    }

    let desconto = 0;

    if (subtotal > 20000) {
        desconto = Math.round(subtotal * 0.05);
    }

    const total = subtotal - desconto;

    document.getElementById("subtotal").textContent = formatarMoeda(subtotal);
    document.getElementById("desconto").textContent = formatarMoeda(desconto);
    document.getElementById("total").textContent = formatarMoeda(total);

    aviso.textContent = "";
}

const botaoComprar = document.getElementById("finalizar-compra");

botaoComprar.addEventListener("click", async function () {
    if (botaoComprar.disabled) {
        return;
    }

    const mensagem = document.getElementById("mensagem-compra");
    const campos = document.querySelectorAll("#produtos-loja input");
    const dados = new FormData();

    let quantidadeItens = 0;

    for (const campo of campos) {
        const quantidade = Number(campo.value);
        const estoque = Number(campo.max);

        if (
            !Number.isInteger(quantidade) ||
            quantidade < 0 ||
            quantidade > estoque
        ) {
            mensagem.textContent = "Confira as quantidades escolhidas.";
            return;
        }

        if (quantidade > 0) {
            dados.append(
                "produtos[" + campo.dataset.id + "]",
                quantidade
            );

            quantidadeItens++;
        }
    }

    if (quantidadeItens === 0) {
        mensagem.textContent = "Selecione pelo menos um produto.";
        return;
    }

    botaoComprar.disabled = true;
    mensagem.textContent = "Finalizando compra...";

    try {
        const resposta = await fetch("comprar.php", {
            method: "POST",
            body: dados
        });

        if (!resposta.ok) {
            throw new Error("Erro na resposta da compra.");
        }

        const resultado = await resposta.json();

        if (!resultado.sucesso) {
            mensagem.textContent = resultado.mensagem;
            botaoComprar.disabled = false;
            return;
        }

        mensagem.textContent =
            resultado.mensagem +
            " Subtotal: " + formatarMoeda(resultado.subtotal) +
            " | Desconto: " + formatarMoeda(resultado.desconto) +
            " | Total: " + formatarMoeda(resultado.total);

        // Limpa as quantidades da compra concluída.
        for (const campo of campos) {
            campo.value = "0";
        }

        document.getElementById("subtotal").textContent = formatarMoeda(0);
        document.getElementById("desconto").textContent = formatarMoeda(0);
        document.getElementById("total").textContent = formatarMoeda(0);

        const carregou = await carregarProdutos();

        if (carregou) {
            botaoComprar.disabled = false;
        } else {
            mensagem.textContent +=
                " Atualize a página para carregar o estoque antes de uma nova compra.";
        }
    } catch (erro) {
        mensagem.textContent =
            "Não foi possível confirmar a resposta. Confira o estoque na administração e atualize esta página antes de tentar novamente.";
    }
});

carregarProdutos();