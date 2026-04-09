# 💎 BLUEPRINT FISCAL V3: Manual Técnico e Operacional

Este documento detalha o funcionamento do **Motor de Decisão Fiscal** e do **Gerenciador de Perfis** do ERP SIG, arquitetado sob o padrão de alta densidade industrial **Blueprint V3**.

---

## 1. Visão Geral da Arquitetura

O sistema fiscal do SIG baseia-se em uma separação clara entre **Lógica de Decisão (Matriz)** e **Comportamento Operacional (Perfil)**.

*   **Matriz Fiscal:** Atua como um "Roteador Inteligente". Ela analisa o contexto da nota fiscal (UF, NCM, Operação, Regime) e decide qual regra aplicar.
*   **Perfil Fiscal:** Atua como o "Preset de Execução". Ele define o que acontece com o estoque, financeiro e custos após a decisão da Matriz.

---

## 2. Matriz Fiscal (Decision Engine)

A Matriz Fiscal é o cérebro tributário do sistema. Ela resolve a tributação baseada em condições de entrada e devolve resultados fiscais prontos.

### 📥 Entradas (Condições de match)
O motor valida as seguintes variáveis em tempo real:
1.  **Regime Tributário:** Simples Nacional, Lucro Presumido, Real ou TODOS.
2.  **Operação:** Entrada ou Saída (Sentido da nota).
3.  **Tipo Destino:** Operação Interna ou Interestadual/Exterior.
4.  **Incidência de ST:** Se o produto possui ou não Substituição Tributária.
5.  **NCM:** Prefixo ou código completo do produto (ex: `8708`).

### 📤 Saídas (Resultados Gerados)
Uma vez feito o match, a matriz injeta na nota:
*   **CFOP:** O código de operação oficial (Ex: `5102`, `6404`).
*   **CST / CSOSN:** O código de situação tributária.
*   **Flags de Cálculo:** Indica se deve calcular IPI, PIS, COFINS, DIFAL, destacar ICMS ou gerar CRÉDITO.

### ⚡ Hierarquia de Prioridade (Peso Numérico)
Padronizada visualmente como Texto, mas resolvida internamente por pesos:
*   **CRÍTICA (100):** Prioridade total (ex: Devoluções).
*   **ALTA (50):** Regras de exceção (ex: NCM específico com ST).
*   **PADRÃO (10):** Regras gerais (fallback).

---

## 3. Perfil Fiscal (Operational Behavior)

O Perfil Fiscal remove a complexidade do faturamento ao automatizar as rotinas de retaguarda:
1.  **Gestão de Estoque:** Atualização de saldo físico (baixa/reserva).
2.  **Fluxo Financeiro:** Geração automática de títulos no CR/CP.
3.  **Engenharia de Custos:** Composição do custo unitário (IPI/ST no custo).

---

## 4. Estrutura de Dados (PostgreSQL)

### Tabela `matriz_fiscal` (Arquitetura Simplificada v4)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `SERIAL` | Identificador sequencial único. |
| `nome` | `TEXT` | Descrição amigável. |
| `ativa` | `BOOLEAN` | Status da regra. |
| `prioridade` | `INTEGER` | Peso de decisão (10, 50, 100). |
| `ncm` | `TEXT` | Prefixo ou Código NCM. |
| `cfop` | `TEXT` | CFOP de resultado. |

---

## 5. Interface Blueprint V3

A interface foi projetada para **Alta Densidade de Dados** e **Esforço Cognitivo Zero**:
*   **IDs Limpos:** Exibição puramente numérica (sem `#`), otimizada para leitura rápida.
*   **Badges Semânticos:** Cores vibrantes indicam o status (`ENTRADA` em verde, `SAIDA` em azul).
*   **Tooltips Dinâmicos:** Explicações em tempo real simplificam a operação.
*   **Design Industrial:** Layout compacto Blueprint V3.

---
**SIG ERP BLUEPRINT V3 - 2026**
*Motor de Inteligência Fiscal para o Setor Automotivo.*
