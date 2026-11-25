<?php

header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Requisição inválida."
    ]);
    exit;
}

$itens = $_POST["produtos"] ?? [];

if (!is_array($itens) || count($itens) === 0) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Selecione pelo menos um produto."
    ]);
    exit;
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

require "conexao.php";

mysqli_begin_transaction($conexao);

try {
    $subtotal = 0;

    ksort($itens);

    foreach ($itens as $codigo => $valor) {
        $id = filter_var($codigo, FILTER_VALIDATE_INT);
        $quantidade = filter_var($valor, FILTER_VALIDATE_INT);

        if (
            $id === false || $id <= 0 ||
            $quantidade === false || $quantidade <= 0
        ) {
            throw new Exception("Produto ou quantidade inválida.");
        }

        $sql = "SELECT nome, preco, quantidade
                FROM produtos
                WHERE id = ?
                FOR UPDATE";

        $consulta = mysqli_prepare($conexao, $sql);
        mysqli_stmt_bind_param($consulta, "i", $id);
        mysqli_stmt_execute($consulta);

        $resultado = mysqli_stmt_get_result($consulta);
        $produto = mysqli_fetch_assoc($resultado);

        if (!$produto) {
            throw new Exception("Um dos produtos não está mais disponível.");
        }

        if ($quantidade > $produto["quantidade"]) {
            throw new Exception(
                "Estoque insuficiente para: " . $produto["nome"]
            );
        }

        $precoCentavos = (int) round($produto["preco"] * 100);

        $subtotal += $precoCentavos * $quantidade;

        $sql = "UPDATE produtos
                SET quantidade = quantidade - ?
                WHERE id = ?";

        $atualizacao = mysqli_prepare($conexao, $sql);
        mysqli_stmt_bind_param($atualizacao, "ii", $quantidade, $id);
        mysqli_stmt_execute($atualizacao);
    }

    $desconto = 0;

    if ($subtotal > 20000) {
        $desconto = (int) round($subtotal * 0.05);
    }

    $total = $subtotal - $desconto;

    mysqli_commit($conexao);

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Compra realizada com sucesso!",
        "subtotal" => $subtotal,
        "desconto" => $desconto,
        "total" => $total
    ]);
} catch (Exception $erro) {
    mysqli_rollback($conexao);

    $mensagem = $erro instanceof mysqli_sql_exception
        ? "Não foi possível concluir a compra no banco de dados."
        : $erro->getMessage();

    echo json_encode([
        "sucesso" => false,
        "mensagem" => $mensagem
    ]);
}