# DOCUMENTAÇÃO TÉCNICA - ERP SIG (SISTEMA INTEGRADO DE GESTÃO)

> **Versão:** 1.0 (Build V61_REGRAS)  
> **Data:** 21 de Março de 2026  
> **Status:** Em Desenvolvimento Ativo  

---

## 1. VISÃO GERAL DO SISTEMA

### O que é o ERP SIG?
O **ERP SIG** é um sistema de gestão empresarial focado no setor de **Autopeças**, projetado para rodar como uma aplicação desktop de alta performance. O objetivo central é fornecer controle absoluto sobre a cadeia de suprimentos, desde a compra (XML) até o endereçamento logístico e a venda final.

### Filosofia e Diferenciais
Ao contrário de sistemas simples de estoque, o SIG foi construído com mentalidade de **ERP/WMS Real**:
*   **Estoque Endereçado**: Cada peça deve ter um endereço físico (Rua, Prateleira, Gaveta).
*   **Saldo por Situação**: Suporte a estados de estoque (Disponível, Reservado, Separação, Defeito).
*   **Custo Médio Dinâmico**: O custo é recalculado a cada entrada, garantindo precisão financeira.
*   **Rastreabilidade (Ledger)**: Todas as alterações de saldo vêm de uma "tabela de movimentações", permitindo auditoria total.

### Fluxo Operacional Pensado
`Cadastro Base (Marcas/Categorias)` -> `Cadastro de Produto (Master)` -> `Entrada de Mercadoria (Importação XML)` -> `Armazenagem Logística` -> `Pedido de Venda` -> `Reserva` -> `Separação` -> `Expedição` -> `Faturamento`.

---

## 2. ARQUITETURA TÉCNICA

*   **Backend**: Linguagem **Go (Golang)** - Foco em velocidade e concorrência.
*   **Frontend**: **HTML5, Vanilla JavaScript e Vanilla CSS**. Foco em leveza e customização total (Aesthetics Pro).
*   **Bridge/Framework**: **Wails v2**. Permite que o Go chame funções JS e vice-versa, gerando um binário nativo.
*   **Banco de Dados**: **PostgreSQL**. Robustez relacional para grandes volumes de dados.
*   **Comunicação**: Funções expostas via `App` struct no Wails (interfase de ponte).
*   **Padrão de Código**: Modularizado. `motor/` (Lógica de DB e Regras), `frontend/` (Interface).

---

## 3. MÓDULOS DO SISTEMA

| Módulo | Finalidade | Status |
| :--- | :--- | :--- |
| **Cadastro de Produtos** | Gestão de SKUs, Marcas, Categorias e Tributação. | ✅ Funcional |
| **Endereçamento (Logística)** | Árvore hierárquica de posições físicas no armazém. | ✅ Funcional |
| **Gestão de Fornecedores** | Registro de emitentes e parceiros comerciais. | ✅ Funcional |
| **Entrada de Mercadorias** | Registro de notas fiscais e atualização de estoque. | ✅ Funcional |
| **Importação de XML** | Leitura automática de arquivos NF-e da SEFAZ. | ✅ Funcional |
| **Motor de Estoque** | Controle de saldos, movimentações e custos. | ✅ Funcional |
| **Vendas / Pedidos** | Fluxo de saída de mercadorias. | 🛠️ Em Planejamento |
| **Financeiro** | Contas a pagar/receber vinculados às notas. | ⏳ Não iniciado |
| **Fiscal** | Perfis de tributação e preparação SPED. | 🛠️ Estrutura base pronta |

---

## 4. TELAS DO SISTEMA (FRONTEND)

*   **Hub Central (`hub.html`)**: Menu principal onde todos os módulos são disparados como janelas independentes.
*   **Cadastro Master de Produtos (`modal_produto.js`)**: Componente global (modal) usado em todo o sistema para editar detalhes técnicos.
*   **Gestão de Endereços (`enderecamento.html`)**: Interface visual para gerenciar Galpões -> Ruas -> Prateleiras.
*   **Entrada de NF (`entradas.html`)**: Tela de conferência de notas, vinculação de fornecedor e destino de estoque.
*   **Parâmetros (`parametros.html`)**: Configurações de Marcas, Categorias e Unidades de Medida.

---

## 5. BANCO DE DADOS - ESTRUTURA PRINCIPAL

### Grupo: Cadastros
*   `produtos`: Armazena SKU, EAN, NCM, Descrição, Custo e Preço.
*   `marcas` / `categorias` / `unidade_medida`: Tabelas controladas para taxonomia.
*   `fornecedores`: Dados cadastrais de quem você compra.

### Grupo: Estoque e Logística
*   `enderecamentos`: Tabela hierárquica (Tree-structure) para endereços físicos.
*   `saldos_estoque`: Tabela de "foto" atual. (Produto ID + Endereço ID + Situação ID).
*   `movimentacoes_estoque`: O histórico de DEBITO/CREDITO de cada peça.

### Grupo: Compras
*   `entradas`: Cabeçalho das Notas Fiscais (Número, Série, Fornecedor).
*   `entradas_itens`: Detalhes da nota, vínculos com produtos e valores de impostos do XML.

---

## 6. MOTOR DE ESTOQUE - O CORAÇÃO DO SIG

O motor de estoque do SIG não permite edição direta de saldo. O processo é:

1.  **Movimentação**: Qualquer entrada (XML) ou saída (Venda) gera uma linha na tabela `movimentacoes_estoque`.
2.  **Saldo por Endereço**: A tabela `saldos_estoque` é incrementada/decrementada com base na movimentação. Nunca existe saldo "boiando" no sistema; ele sempre está em um ID de endereço.
3.  **Custo Médio**: No momento da confirmação da entrada, o Go executa:
    `Custo Novo = ((Estoque Atual * Custo Médio) + (Qtd Entrada * Custo Entrada)) / (Estoque Atual + Qtd Entrada)`
4.  **Fonte da Verdade**: Todas as consultas de saldo do sistema olham para os agregadores da `saldos_estoque`, que são validados periodicamente pelo histórico de movimentações.

---

## 7. REGRAS DE NEGÓCIO IMPLEMENTADAS

*   **Validação de Fornecedor**: O XML só é processado se o CNPJ do fornecedor já estiver cadastrado ou for validado pelo usuário.
*   **Markup por Marca**: O preço de venda sugerido na entrada é calculado com base na porcentagem de lucro definida na tabela `marcas`.
*   **Mapeamento de XML**: O sistema vincula códigos do fornecedor (`cProd`) aos SKUs internos do SIG, lembrando da relação para futuras compras.
*   **Endereçamento Obrigatório**: Nenhuma peça entra no estoque sem um endereço de destino válido.

---

## 8. STATUS ATUAL E PRÓXIMOS PASSOS

### O que já está sólido no SIG?
A base de **Dados Cadastrais** e o **Motor de Compras (XML)**. O sistema já é capaz de "abastecer" o estoque com precisão absoluta de custo e localização.

### Próximo Objetivo: Módulo de Vendas (Balcão)
A próxima grande fase envolve o "Consumo" desse estoque:
1.  **Pedido em espera**: Gera uma **Reserva** (muda a situação do estoque sem tirar o saldo físico).
2.  **Separação**: Gera um mapa de colheita para o almoxarifado (Picking list).
3.  **Expedição**: Confirma a saída e gera a baixa definitiva do saldo.

---

**Assinado:**  
*Antigravity - AI Coding Assistant*
