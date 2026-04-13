# Documentação Técnica: Motor de Decisão Fiscal (Matriz e Parâmetros)

Esta documentação tem como objetivo orientar desenvolvedores e (especialmente) **Agentes de Inteligência Artificial** sobre a estrutura corporativa do "Motor Fiscal" e da "Matriz Fiscal" implementada no ERP SIG.

## 1. Visão Arquitetural

O Sistema Tributário foi modelado utilizando o padrão de **Motor de Regras (Rule Engine)** em duas fases complementares e desacopladas, escritas em Go (Backend).
Em vez de funções `if/else` hardcoded, as regras residem no Banco de Dados e são carregadas ativamente para resolução do contexto tributário de uma transação. As duas fases são:

- **Fase 1: Enquadramento Operacional (`MatrizFiscal`)**
  Decide as regras base da operação, como CFOP, CST/CSOSN e **quais tributos** sofrerão incidência (flags booleanas).
- **Fase 2: Precificação Tributária (`AliquotaFiscal`)**
  A partir da decisão da Fase 1 acoplada ao contexto, decide as **porcentagens (alíquotas)** reais que serão aplicadas sob aqueles tributos.

## 2. A Estrutura de Contexto (`ContextoFiscal`)

Toda requisição ao motor passa obrigatoriamente por transportar um snapshot do evento atual da aplicação no objeto `ContextoFiscal`.

```go
type ContextoFiscal struct {
	RegimeTributario string `json:"regime_tributario"` // SIMPLES, PRESUMIDO, REAL
	Operacao         string `json:"operacao"`          // ENTRADA, SAIDA
	UFOrigem         string `json:"uf_origem"`         // UF do Emitente
	UFDestino        string `json:"uf_destino"`        // UF do Destinatário
	TipoDestino      string `json:"tipo_destino"`      // INTERNA, INTERESTADUAL, INTERNACIONAL
	IncidenciaST     bool   `json:"incidencia_st"`     // True se Prod/NCM tem ST
	Ncm              string `json:"ncm"`               // NCM do Produto
}
```
*Dica de IA:* O motor é auto-suficiente: Se `TipoDestino` não for explicitado, ele fará a inferência automática verificando se `UFOrigem == UFDestino`.

## 3. Dinâmica de Resolução (O Algoritmo de Especificidade)

Tanto o `ResolverMatrizFiscal()` quanto o `ResolverAliquotas()` utilizam um algoritmo avançado de colisão conhecido como **Prioridade + Especificidade Ponderada**.

No processamento transacional, o motor itera todas as regras "Ativas" no banco e elimina as que derem mismatch.
Para as que sobreviverem (Derem *Match* perfeito em todas as condições não nulas daquela regra), pontos de **`Esp` (Especificidade)** são atribuídos:

### 3.1 Tabela de Pesos de Especificidade (Como a IA deve entender o ranking)
- Regime Tributário explicitado -> `+ 10 pontos`
- Operação explicitada -> `+ 10 pontos`
- Tipo de Destino explicitado -> `+ 5 pontos`
- Incidência ST explicitada -> `+ 5 pontos`
- NCM: Faz match via **Prefixo** (`strings.HasPrefix`). É somado o `len(NCM)` aos pontos de especificidade. *(Ou seja, NCM 8708 vale 4 pontos. NCM 87089900 vale 8 pontos).*
- CFOP (Somente em Alíquotas) -> `+ 20 pontos`
- CST/CSOSN (Somente em Alíquotas) -> `+ 20 pontos`

### 3.2 O Desempate Final (Tie-breaker)
Após pontuar todos os candidatos que deram Match, ocorre o "sort".
As regras possuem uma string textual de `Prioridade` (`PADRÃO`, `ALTA`, `CRÍTICA`), convertida para int (`10`, `50`, `100`).

**A Regra Principal (Ordem Absoluta):**
1. O que vale primeiro é a **`Prioridade`**. Uma regra `CRÍTICA` (mesmo genérica) smaga qualquer matriz `PADRÃO` ultradetalhada.
2. Em caso de empate de Prioridade (Ex: Duas matrizes `PADRÃO` colidiram), vence aquela que acumulou **a maior pontuação de Especificidade (`Esp`)** no ciclo anterior.

### 4. Entidades do Banco de Dados / Go Structs

#### 4.1. Struct da Tabela `MatrizFiscal`
Responsável por determinar **"O QUE DEVE SER FEITO"**.
```go
type MatrizFiscal struct {
	// ... dados de chave
    // Filtros:
	RegimeTributario string `json:"regime_tributario"`
	Operacao         string `json:"operacao"`
	TipoDestino      string `json:"tipo_destino"`
	IncidenciaST     string `json:"incidencia_st"`
	Ncm              string `json:"ncm"`
	Prioridade       string `json:"prioridade"`
    
    // Devoluções / Acionadores (Flags de incidência)
	Cfop             string `json:"cfop"`
	CstCsosn         string `json:"cst_csosn"`
	DestacaIcms      bool   `json:"destaca_icms"`
	CreditoIcms      bool   `json:"credito_icms"`
	IncideIpi        bool   `json:"incide_ipi"`
	IncidePis        bool   `json:"incide_pis"`
	IncideCofins     bool   `json:"incide_cofins"`
	IncideDifal      bool   `json:"incide_difal"`
}
```

#### 4.2. Struct da Tabela `AliquotaFiscal`
Responsável por determinar **"QUAL O VALOR DISSO"**.
*(Note que ela aceita CFOP e CST como "Gatilhos de Decisão")*
```go
type AliquotaFiscal struct {
	// Filtros extras atrelados aos Resultados Operacionais
	// ... (RegimeTributario, TipoDestino, IncidênciaST, NCM)
	Cfop             string  `json:"cfop"`     
	CstCsosn         string  `json:"cst_csosn"`

    // Devoluções de Rating (%)
	AliquotaIcms    float64 `json:"aliquota_icms"`
	AliquotaIcmsSt  float64 `json:"aliquota_icms_st"`
	AliquotaIpi     float64 `json:"aliquota_ipi"`
	AliquotaPis     float64 `json:"aliquota_pis"`
	AliquotaCofins  float64 `json:"aliquota_cofins"`
	AliquotaDifal   float64 `json:"aliquota_difal"`
	AliquotaFcp     float64 `json:"aliquota_fcp"`
}
```

## 5. Diretrizes para Modificações Futuras por IA
1. **Frontend / Modais:** Qualquer nova flag fiscal (ex: `AliquotaIIL` Imposto de Importação) deve ser adicionada à Struct em `banco.go`, na tabela PG respectiva, e injetada nos Modais do Design Industrial V3 em `fiscal/modais/`.
2. **Avaliação Regras Novas:** Não altere o comportamento base de pesos. Se precisar forçar um override para um cliente especial, sugira criar uma regra `Prioridade = CRÍTICA` via interface (ou BD) e não mudando o Motor.
3. **Erros:** Se `ResolverMatrizFiscal` não encontra nenhum item compatível, o motor falha propositalmente (com um Error de Go) informando que não achou regra compatível contendo o Log exato da Operação. Isso é *by-design* para barrar o ERP de fazer cálculos tributários em branco.
