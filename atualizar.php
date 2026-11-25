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
$nome = trim($_POST["nome"] ?? "");
$preco = filter_input(INPUT_POST, "preco", FILTER_VALIDATE_FLOAT);
$quantidade = filter_input(INPUT_POST, "quantidade", FILTER_VALIDATE_INT);

if (
    $id === false || $id === null || $id <= 0 ||
    $nome === "" ||
    $preco === false || $preco === null || $preco <= 0 ||
    $quantidade === false || $quantidade === null || $quantidade < 0
) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Preencha os dados corretamente."
    ]);
    exit;
}

$sql = "UPDATE produtos SET nome = ?, preco = ?, quantidade = ? WHERE id = ?";

$comando = mysqli_prepare($conexao, $sql);

mysqli_stmt_bind_param($comando, "sdii", $nome, $preco, $quantidade, $id);

mysqli_stmt_execute($comando);

$alterado = mysqli_stmt_affected_rows($comando) > 0;

echo json_encode([
    "sucesso" => $alterado,
    "mensagem" => $alterado
        ? "Produto atualizado com sucesso!"
        : "Nenhuma alteração realizada. Os dados são iguais ou o produto não existe mais."
]);