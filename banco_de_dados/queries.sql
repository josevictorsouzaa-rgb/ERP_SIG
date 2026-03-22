-- name: GetProdutoBySKU :one
SELECT * FROM produtos
WHERE sku = $1 LIMIT 1;

-- name: CreateProduto :one
INSERT INTO produtos (
    sku, ean, descricao_tecnica, marca, custo, venda, estoque_atual, estoque_minimo, localizacao, categoria
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
)
RETURNING *;

-- name: SearchProdutos :many
SELECT * FROM produtos
WHERE sku ILIKE '%' || $1 || '%' 
   OR descricao_tecnica ILIKE '%' || $1 || '%'
ORDER BY descricao_tecnica ASC;

-- name: UpdatePricesByBrand :exec
UPDATE produtos
SET venda = venda * (1 + $1::numeric),
    atualizado_em = CURRENT_TIMESTAMP
WHERE marca = $2;

-- name: UpdatePricesByCategory :exec
UPDATE produtos
SET venda = venda * (1 + $1::numeric),
    atualizado_em = CURRENT_TIMESTAMP
WHERE categoria = $2;


-- name: LogMovimentacao :one
INSERT INTO movimentacao_estoque (
    produto_id, quantidade, tipo, motivo, usuario_id
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING *;

-- name: UpdateEstoque :exec
UPDATE produtos
SET estoque_atual = estoque_atual + $1,
    atualizado_em = CURRENT_TIMESTAMP
WHERE id = $2;
