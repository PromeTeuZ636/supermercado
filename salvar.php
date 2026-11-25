<?php

header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Use o formulário para cadastrar."
    ]);
    exit;
}

require "conexao.php";

$nome = trim($_POST["nome"] ?? "");
$preco = filter_input(INPUT_POST, "preco", FILTER_VALIDATE_FLOAT);
$quantidade = filter_input(INPUT_POST, "quantidade", FILTER_VALIDATE_INT);

if (
    $nome === "" ||
    $preco === false || $preco === null || $preco <= 0 ||
    $quantidade === false || $quantidade === null || $quantidade < 0
) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Preencha o nome, um preço maior que zero e uma quantidade válida."
    ]);
    exit;
}

$sql = "INSERT INTO produtos (nome, preco, quantidade) VALUES (?, ?, ?)";

$comando = mysqli_prepare($conexao, $sql);

mysqli_stmt_bind_param($comando, "sdi", $nome, $preco, $quantidade);

mysqli_stmt_execute($comando);

echo json_encode([
    "sucesso" => true,
    "mensagem" => "Produto cadastrado com sucesso!"
]);