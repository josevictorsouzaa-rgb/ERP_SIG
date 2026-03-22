# DETALHAMENTO TÉCNICO: MOTOR DE ESTOQUE E CUSTOS (SIG-WMS)

Este documento descreve as especificações de engenharia do motor de estoque do ERP SIG, detalhando as tabelas, regras de atualização e lógica financeira de custos.

---

## 1. TABELA `movimentacoes_estoque` (O Livro-Razão)
Esta é a tabela de **verdade absoluta**. Nenhum saldo é alterado no sistema sem um registro correspondente nesta tabela.

| Coluna | Tipo | Finalidade |
| :--- | :--- | :--- |
| `id` | SERIAL | Identificador único da movimentação. |
| `data_movimentacao` | TIMESTAMP | Data/hora em que o evento ocorreu. |
| `produto_id` | INTEGER | FK para `produtos`. |
| `endereco_id` | INTEGER | FK para `enderecamentos` (Local físico). |
| `tipo_movimentacao` | TEXT | Natureza do evento (ENTRADA, SAIDA, TRANSF, RESERVA). |
| `quantidade` | DECIMAL | Volume movimentado (aceita 4 casas decimais). |
| `situacao_origem` | TEXT | Estado anterior do item. |
| `situacao_destino` | TEXT | Estado posterior do item. |
| `documento_origem` | TEXT | Chave de busca (Ex: "NFE-558", "PED-10"). |
| `modulo_origem` | TEXT | De qual parte do sistema veio (ENTRADAS, VENDAS). |
| `usuario_id` | INTEGER | Identificador de quem operou. |
| `observacao` | TEXT | Justificativa ou notas adicionais. |

**Status dos campos:** Todos os listados acima estão **implementados** na versão V62.

---

## 2. TIPOS DE MOVIMENTAÇÃO (Implementados vs Planejados)
O sistema utiliza uma estrutura extensível para tipos de eventos:

*   **ENTRADA (Implementado)**: Registro de compra via XML ou manual.
*   **SAIDA (Planejado)**: Baixa definitiva do estoque (venda ou consumo).
*   **TRANSFERENCIA (Planejado)**: Mudança entre dois endereços físicos.
*   **AJUSTE (Planejado)**: Correção via Inventário (Positivo/Negativo).
*   **RESERVA (Planejado)**: Bloqueio de saldo de "Disponível" para "Reservado".

---

## 3. TABELA `saldos_estoque` (Snapshot de Performance)
Tabela otimizada para consultas rápidas de disponibilidade. É o resumo consolidado das movimentações.

*   `produto_id` (PK): Código do item.
*   `endereco_id` (PK): Código do local físico (Gaveta, Prateleira).
*   `situacao` (PK): Estado (DISPONIVEL, RESERVADO, SEPARACAO, EXPEDICAO).
*   `saldo`: Quantidade atual.
*   `atualizado_em`: Timestamp da última modificação.

---

## 4. REGRA DE ATUALIZAÇÃO (Fluxo no Backend)
Quando uma nota é confirmada (`ConfirmarEntrada`), o motor executa as seguintes etapas no banco (dentro de uma única **Transação SQL**):

1.  **Validação**: Verifica se o status da nota é `PENDENTE`.
2.  **Inserção de Ledger**: Grava o histórico em `movimentacoes_estoque`.
3.  **Upsert de Saldo**: Executa um `INSERT ... ON CONFLICT DO UPDATE` na tabela `saldos_estoque`. Se o item já existir naquele endereço e situação, o saldo é somado.
4.  **Cálculo de Custo Médio**: O custo unitário da nota é processado contra o saldo global do produto na tabela `produtos`.
5.  **Atualização do Produto**: O `estoque_atual` (global) e o `custo_medio` são atualizados.
6.  **Comprometimento**: `COMMIT` da transação. Se qualquer passo falhar, o estoque permanece intacto.

---

## 5. CUSTO MÉDIO E FINANCEIRO
*   **Frequência**: O custo médio é recalculado **exclusivamente** em movimentações do tipo **ENTRADA** (Compra).
*   **Escopo**: O custo médio hoje é **Global por Produto**.
*   **Composição**: O cálculo considera o valor líquido do item + IPI + ST + Frete rateado (conforme lido no XML).
*   **Fórmula**: `Custo_Novo = (Custo_Antigo * Qtd_Antiga + Custo_NF * Qtd_NF) / (Qtd_Antiga + Qtd_NF)`.

---

## 6. LÓGICA DE SITUAÇÕES (Workflow de Expedição)
A "Mudança de Situação" no SIG funciona da seguinte forma:

1.  **Venda (Reserva)**: Gera movimentação `tipo=RESERVA` saindo de `situacao=DISPONIVEL` e entrando em `situacao=RESERVADO`.
2.  **Separação**: O saldo sai de `RESERVADO` e entra em `SEPARACAO`.
3.  **Saída**: Ao faturar, gera `tipo=SAIDA` e o saldo é removido da tabela `saldos_estoque`.

---

## 7. INTEGRIDADE E AUDITORIA
O sistema foi projetado para permitir a reconstrução total do saldo a partir das movimentações.
*   **Auditoria**: Uma rotina de "Rebuild de Saldo" pode ser executada para somar todas as movimentações e comparar com a tabela de `saldos_estoque`. Havendo divergência, o sistema aponta erro de integridade.

---

## 8. FUNÇÕES DO MOTOR (Principais Funções Go)
Funções reais no arquivo `motor/produtos.go`:

*   `ConfirmarEntrada(id int)`: Orquestra o recebimento e custos.
*   `ParsearXMLNFe(caminho string)`: Extrai dados fiscais e de itens do XML.
*   `SalvarEntrada(e Entrada)`: Persiste o rascunho da nota.
*   `ListarProdutos()`: Consulta a tabela mestra com saldos globais.
*   `ObterArvoreLogistica()`: Carrega a hierarquia para endereçamento de entradas.

---

**Objetivo Garantido**: Esta arquitetura impossibilita o "sumiço" de peças sem registro e garante que o custo médio da empresa reflita a realidade exata de suas compras.
