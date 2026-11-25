<?php

header("Content-Type: application/json; charset=utf-8");

require "conexao.php";

$sql = "SELECT id, nome, preco, quantidade FROM produtos ORDER BY id DESC";

$resultado = mysqli_query($conexao, $sql);

$produtos = [];

while ($produto = mysqli_fetch_assoc($resultado)) {
    $produtos[] = $produto;
}

echo json_encode($produtos);