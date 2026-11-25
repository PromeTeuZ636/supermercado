<?php

header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Requisição inválida."
    ]);
    exit;
}

require "conexao.php";

$id = filter_input(INPUT_POST, "id", FILTER_VALIDATE_INT);

if ($id === false || $id === null || $id <= 0) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Produto inválido."
    ]);
    exit;
}

$sql = "DELETE FROM produtos WHERE id = ?";

$comando = mysqli_prepare($conexao, $sql);

mysqli_stmt_bind_param($comando, "i", $id);

mysqli_stmt_execute($comando);

$excluido = mysqli_stmt_affected_rows($comando) > 0;

echo json_encode([
    "sucesso" => $excluido,
    "mensagem" => $excluido
        ? "Produto excluído com sucesso!"
        : "Produto não encontrado."
]);