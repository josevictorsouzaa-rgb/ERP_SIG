package motor

import (
	"encoding/json"
	"encoding/xml"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// Estruturas de Dados
type Marca struct {
	ID          int     `json:"id"`
	Nome        string  `json:"nome"`
	Margem      float64 `json:"margem"` // Mantido para compatibilidade (MKP Balcão padrão)
	MkpBalcao   float64 `json:"mkp_balcao"`
	MkpExterno  float64 `json:"mkp_externo"`
	MkpOficina  float64 `json:"mkp_oficina"`
	CriadoEm    string  `json:"criado_em"`
	Ativo       bool    `json:"ativo"`
}

type FiltrosProdutos struct {
	Descricao      string `json:"descricao"`
	CodFabricante  string `json:"cod_fabricante"`
	MarcaVeiculo   string `json:"marca_veiculo"`
	ModeloVeiculo  string `json:"modelo_veiculo"`
	VersaoVeiculo  string `json:"versao_veiculo"`
	AnoVeiculo     string `json:"ano_veiculo"`
	MarcaPeca      string `json:"marca_peca"`
	GrupoFamilia   string `json:"grupo_familia"`
	Localizacao    string `json:"localizacao"`
	CodBarras      string `json:"cod_barras"`
	SimilarDe      string `json:"similar_de"`
	FiltrarSaldo   string `json:"filtrar_saldo"` // "TODOS", "COM_SALDO", "SEM_SALDO"
}

type Categoria struct {
	ID       int    `json:"id"`
	Nome     string `json:"nome"`
	CriadoEm string `json:"criado_em"`
}

type Subcategoria struct {
	ID             int    `json:"id"`
	CategoriaID    int    `json:"categoria_id"`
	CategoriaNome  string `json:"categoria_nome"`
	Nome           string `json:"nome"`
	CriadoEm       string `json:"criado_em"`
}

type UnidadeMedida struct {
	ID        int    `json:"id"`
	Sigla     string `json:"sigla"`
	Descricao string `json:"descricao"`
}

type PerfilFiscal struct {
	// BLOCO 01: REGRAS ESTRUTURAIS (NOVA ARQUITETURA SIG MASTER)
	TipoMovimentacao string `json:"tipo_movimentacao"` // COMPRA, VENDA, DEVOLUCAO, TRANSFERENCIA, AJUSTE
	ComNotaFiscal    bool   `json:"com_nota_fiscal"`
	IncideSt         bool   `json:"incide_st"`

	// BLOCO 02: CLASSIFICAÇÃO
	CfopPadrao    string `json:"cfop_padrao"`
	CfopDescricao string `json:"cfop_descricao"`
	TipoItem      string `json:"tipo_item"`      // REVENDA, USO_CONSUMO, ATIVO
	Finalidade    string `json:"finalidade"`     // COMERCIALIZACAO, CONSUMO, IMOBILIZADO
	CstIcmsBase   string `json:"cst_icms"`       // Campo base para CST/CSOSN

	// BLOCO 03: ICMS (COMPORTAMENTO SEM PERCENTUAIS)
	TemIcmsProprio     bool `json:"tem_icms_proprio"`   // Possui ICMS próprio?
	DestacaIcms        bool `json:"destaca_icms"`       // Destacar ICMS na NF?
	GeraCreditoIcms    bool `json:"gera_credito_icms"`  // Gera crédito de ICMS?
	TemIcmsSt          bool `json:"tem_icms_st"`        // Possui ICMS-ST?
	DestacaIcmsSt      bool `json:"destaca_icms_st"`    // Destacar ICMS-ST na NF?
	TemReducaoBase     bool `json:"tem_reducao_base"`
	TemDifal           bool `json:"tem_difal"`          // Possui DIFAL?
	DestacaDifal       bool `json:"destaca_difal"`      // Destacar DIFAL?
	IcmsTipoCalculo    string `json:"icms_tipo_calculo"` // NORMAL, ST, ISENTO
	IndicadorPresenca  string `json:"indicador_presenca"`
	IcmsStCredito      bool `json:"icms_st_credito"`
	DifalResponsavel   string `json:"difal_responsavel"`
	DifalConsideraFcp  bool `json:"difal_considera_fcp"`
	TemFcp             bool `json:"tem_fcp"`

	// BLOCO 04: IPI (COMPORTAMENTO SEM PERCENTUAIS)
	TemIpi         bool   `json:"tem_ipi"`
	DestacaIpi     bool   `json:"destaca_ipi"`
	IpiSomaCusto   bool   `json:"ipi_soma_custo"`
	IpiGeraCredito bool   `json:"ipi_gera_credito"`
	CstIpi         string `json:"cst_ipi"`
	IpiTipoCalculo string `json:"ipi_tipo_calculo"`

	// BLOCO 05: PIS / COFINS (COMPORTAMENTO SEM PERCENTUAIS)
	CalculaPis     bool   `json:"calcula_pis"`
	CstPis         string `json:"cst_pis"`
	CalculaCofins  bool   `json:"calcula_cofins"`
	CstCofins      string `json:"cst_cofins"`
	PisCofinsRegime string `json:"piscofins_regime"`
	PisCofinsBase   string `json:"piscofins_base"`

	// BLOCO 06: COMPOSIÇÃO DE CUSTO (ENTRADAS)
	SomaStCusto       bool `json:"soma_st_custo"`
	SomaIpiCusto      bool `json:"soma_ipi_custo"`
	SomaFreteCusto    bool `json:"soma_frete_custo"`
	SomaDespesasCusto bool `json:"soma_despesas_custo"`
	SomaDifalCusto    bool `json:"soma_difal_custo"`
	FormaCustoMedio   bool `json:"forma_custo_medio"` // Liga ao motor de preço

	// BLOCO 07: COMPORTAMENTO OPERACIONAL
	AtualizaEstoque       bool   `json:"atualiza_estoque"`
	TipoMovimentoEstoque  string `json:"tipo_movimento_estoque"` // ENTRADA, SAIDA, NAO_MOVIMENTA
	GeraFinanceiro        bool   `json:"gera_financeiro"`
	ReservaEstoque        bool   `json:"reserva_estoque"`
	BaixaEstoque          bool   `json:"baixa_estoque"`
	PermiteVendaNegativa  bool   `json:"permite_venda_negativa"`

	// BLOCO 08: TRAVAS DE SEGURANÇA
	TravaSemNcm  bool `json:"trava_sem_ncm"`
	TravaSemCest bool `json:"trava_sem_cest"`
	TravaSemCfop bool `json:"trava_sem_cfop"`
	TravaSemCst  bool `json:"trava_sem_cst"`

	// Identificação e Ativo
	ID                int    `json:"id"`
	Nome              string `json:"nome"`
	TipoOperacao      string `json:"tipo_operacao"`     // ENTRADA, SAIDA
	NaturezaOperacao  string `json:"natureza_operacao"` // FISCAL, DEVOLUCAO, AJUSTE, etc
	RegimeEmpresa     string `json:"regime_empresa"`
	FinalidadeNFe     int    `json:"finalidade_nfe"`
	Ativo             bool   `json:"ativo"`
	ObservacaoInterna string `json:"observacao_interna"`
}

type Deposito struct {
	ID        int    `json:"id"`
	EmpresaID int    `json:"empresa_id"`
	Nome      string `json:"nome"`
	Descricao string `json:"descricao"`
	Ativo     bool   `json:"ativo"`
	CriadoEm  string `json:"criado_em"`
}

type Produto struct {
	ID                int     `json:"id"`
	Sku               string  `json:"sku"`
	Ean               string  `json:"ean"`
	DescricaoTecnica  string  `json:"descricao_tecnica"`
	NomePopular       string  `json:"nome_popular"`
	MarcaID           int     `json:"marca_id"`
	MarcaNome         string  `json:"marca_nome"`
	CategoriaID       int     `json:"categoria_id"`
	CategoriaNome     string  `json:"categoria_nome"`
	SubcategoriaID    int     `json:"subcategoria_id"`
	SubcategoriaNome  string  `json:"subcategoria_nome"`
	UnidadeID         int     `json:"unidade_id"`
	UnidadeSigla      string  `json:"unidade_sigla"`
	FatorConversao    float64 `json:"fator_conversao"`
	Peso              float64 `json:"peso"`
	Altura            float64 `json:"altura"`
	Largura           float64 `json:"largura"`
	Comprimento       float64 `json:"comprimento"`
	DepositoID        int     `json:"deposito_id"`
	Custo             float64 `json:"custo"`
	Venda             float64 `json:"venda"`
	EstoqueAtual      int     `json:"estoque_atual"`
	EstoqueMinimo     int     `json:"estoque_minimo"`
	Localizacao       string  `json:"localizacao"`
	CriadoEm          string  `json:"criado_em"`
	AtualizadoEm      string  `json:"atualizado_em"`
	Ativo             bool    `json:"ativo"`

	// CAMPOS FISCAIS (BASE CADASTRAL)
	Ncm             string  `json:"ncm"`
	Cest            string  `json:"cest"`
	Origem          int     `json:"origem"` // 0-Nacional, 1-Estrangeira...
	PerfilFiscalID  int     `json:"perfil_fiscal_id"`
	PerfilFiscalNome string `json:"perfil_fiscal_nome"`
	
	// INDICADORES FISCAIS
	TemIcms         bool    `json:"tem_icms"`
	TemSt           bool    `json:"tem_st"`
	TemIpi          bool    `json:"tem_ipi"`
	TemPisCofins    bool    `json:"tem_pis_cofins"`

	// Campos legados (agora opcionais ou calculados dinamicamente)
	Cfop            string  `json:"cfop"`
	CstCsosn        string  `json:"cst_csosn"`
	AliquotaIcms    float64 `json:"aliquota_icms"`
	AliquotaIpi     float64 `json:"aliquota_ipi"`
	AliquotaPis     float64 `json:"aliquota_pis"`
	AliquotaCofins  float64 `json:"aliquota_cofins"`
	ReducaoBc       float64 `json:"reducao_bc"`

	// RELACIONAMENTOS (APLICAÇÕES E SIMILARES)
	Aplicacoes []AplicacaoProduto `json:"aplicacoes"`
	Conversoes []ProdutoConversao `json:"conversoes"`
}

type AplicacaoProduto struct {
	ID        int    `json:"id"`
	ProdutoID int    `json:"produto_id"`
	Marca     string `json:"marca"`
	Modelo    string `json:"modelo"`
	Motor     string `json:"motor"`
	AnoInicio string `json:"ano_inicio"`
	AnoFim    string `json:"ano_fim"`
}

type ProdutoConversao struct {
	ID        int    `json:"id"`
	ProdutoID int    `json:"produto_id"`
	Marca     string `json:"marca"`
	Codigo    string `json:"codigo"`
}

type HistoricoProduto struct {
	ID          int    `json:"id"`
	ProdutoID   int    `json:"produto_id"`
	DataHora    string `json:"data_hora"`
	Tipo        string `json:"tipo"`
	Descricao   string `json:"descricao"`
	SnapshotRaw []byte `json:"-"`
	Usuario     string `json:"usuario"`
}

type Fornecedor struct {
	ID          int    `json:"id"`
	Ativo       bool   `json:"ativo"`
	TipoPessoa  string `json:"tipo_pessoa"`
	Logo        string `json:"logo"`
	Documento   string `json:"documento"`
	IE          string `json:"ie"`
	RazaoSocial string `json:"razao_social"`
	Fantasia    string `json:"fantasia"`
	CEP         string `json:"cep"`
	Endereco    string `json:"endereco"`
	Numero      string `json:"numero"`
	Bairro      string `json:"bairro"`
	Cidade      string `json:"cidade"`
	UF          string `json:"uf"`
	Contatos    string `json:"contatos"`
	CriadoEm    string `json:"criado_em"`
}

type Entrada struct {
	ID             int           `json:"id"`
	NumeroNota     string        `json:"numero_nota"`
	Serie          string        `json:"serie"`
	ChaveAcesso    string        `json:"chave_acesso"`
	EmpresaID      int           `json:"empresa_id"`
	EmpresaNome    string        `json:"empresa_nome"`
	CnpjDestino    string        `json:"cnpj_destino"`
	FornecedorID   int           `json:"fornecedor_id"`
	FornecedorNome string        `json:"fornecedor_nome"`
	Cnpj           string        `json:"cnpj"`
	DataEmissao    string        `json:"data_emissao"`
	DataEntrada    string        `json:"data_entrada"`
	ValorProdutos  float64       `json:"valor_produtos"`
	ValorFrete     float64       `json:"valor_frete"`
	ValorIPI       float64       `json:"valor_ipi"`
	ValorST        float64       `json:"valor_st"`
	ValorTotal     float64       `json:"valor_total"`
	Observacao     string        `json:"observacao"`
	Status         string        `json:"status"` // PENDENTE, CONFIRMADA, CANCELADA
	Itens          []EntradaItem `json:"itens"`
	CriadoEm       string        `json:"criado_em"`
}

type EntradaItem struct {
	ID            int     `json:"id"`
	EntradaID     int     `json:"entrada_id"`
	ProdutoID     int     `json:"produto_id"`
	ProdutoSku    string  `json:"produto_sku"`
	ProdutoNome   string  `json:"produto_nome"`
	Quantidade    float64 `json:"quantidade"`
	Unidade       string  `json:"unidade"`
	Ean           string  `json:"ean"`
	ValorUnitario float64 `json:"valor_unitario"`
	ValorDesconto float64 `json:"valor_desconto"`
	ValorTotal    float64 `json:"valor_total"`
	Cfop          string  `json:"cfop"`
	Cst           string  `json:"cst"`
	BaseIcms      float64 `json:"base_icms"`
	ValorIcms     float64 `json:"valor_icms"`
	AliquotaIcms  float64 `json:"aliquota_icms"`
	BaseSt        float64 `json:"base_st"`
	ValorSt       float64 `json:"valor_st"`
	ValorIpi      float64 `json:"valor_ipi"`
	AliquotaIpi   float64 `json:"aliquota_ipi"`
	Ncm           string  `json:"ncm"`
	EnderecoID    int     `json:"endereco_id"`
	EnderecoNome  string  `json:"endereco_nome"`
}

// Estrutura para leitura de XML NF-e (Simplificada para ERP)
type NFeXML struct {
	NFe struct {
		InfNFe struct {
			Id  string `xml:"Id,attr"`
			Ide struct {
				NNF   string `xml:"nNF"`
				Serie string `xml:"serie"`
				DhEmi string `xml:"dhEmi"`
			} `xml:"ide"`
			Emit struct {
				CNPJ  string `xml:"CNPJ"`
				XNome string `xml:"xNome"`
				XFant string `xml:"xFant"`
				IE    string `xml:"IE"`
			} `xml:"emit"`
			Dest struct {
				CNPJ  string `xml:"CNPJ"`
				CPF   string `xml:"CPF"`
				XNome string `xml:"xNome"`
			} `xml:"dest"`
			Det []struct {
				Prod struct {
					CProd  string  `xml:"cProd"`
					XProd  string  `xml:"xProd"`
					NCM    string  `xml:"NCM"`
					CFOP   string  `xml:"CFOP"`
					UCom   string  `xml:"uCom"`
					QCom   float64 `xml:"qCom"`
					VUnCom float64 `xml:"vUnCom"`
					VProd  float64 `xml:"vProd"`
					VDesc  float64 `xml:"vDesc"`
					CEAN   string  `xml:"cEAN"`
				} `xml:"prod"`
				Imposto struct {
					IPI struct {
						IPITrib struct {
							PIPI float64 `xml:"pIPI"`
							VIPI float64 `xml:"vIPI"`
						} `xml:"IPITrib"`
					} `xml:"IPI"`
					ICMS struct {
						ICMS00 struct {
							CST   string  `xml:"CST"`
							VBC   float64 `xml:"vBC"`
							PICMS float64 `xml:"pICMS"`
							VICMS float64 `xml:"vICMS"`
						} `xml:"ICMS00"`
						ICMS10 struct {
							CST   string  `xml:"CST"`
							VBC   float64 `xml:"vBC"`
							PICMS float64 `xml:"pICMS"`
							VICMS float64 `xml:"vICMS"`
						} `xml:"ICMS10"`
						ICMS20 struct {
							CST   string  `xml:"CST"`
							VBC   float64 `xml:"vBC"`
							PICMS float64 `xml:"pICMS"`
							VICMS float64 `xml:"vICMS"`
						} `xml:"ICMS20"`
						ICMS90 struct {
							CST   string  `xml:"CST"`
							VBC   float64 `xml:"vBC"`
							PICMS float64 `xml:"pICMS"`
							VICMS float64 `xml:"vICMS"`
						} `xml:"ICMS90"`
						ICMSSN101 struct {
							CSOSN string `xml:"CSOSN"`
						} `xml:"ICMSSN101"`
						ICMSSN102 struct {
							CSOSN string `xml:"CSOSN"`
						} `xml:"ICMSSN102"`
						ICMSSN900 struct {
							CSOSN string `xml:"CSOSN"`
							VBC   float64 `xml:"vBC"`
							PICMS float64 `xml:"pICMS"`
							VICMS float64 `xml:"vICMS"`
						} `xml:"ICMSSN900"`
						ICMSST struct {
							VICMSST float64 `xml:"vICMSST"`
						} `xml:"ICMSST"`
					} `xml:"ICMS"`
				} `xml:"imposto"`
			} `xml:"det"`
			Total struct {
				ICMSTot struct {
					VProd  float64 `xml:"vProd"`
					VFrete float64 `xml:"vFrete"`
					VIPI   float64 `xml:"vIPI"`
					VST    float64 `xml:"vST"`
					VNF    float64 `xml:"vNF"`
				} `xml:"ICMSTot"`
			} `xml:"total"`
		} `xml:"infNFe"`
	} `xml:"NFe"`
	ProtNFe struct {
		InfProt struct {
			ChNFe string `xml:"chNFe"`
		} `xml:"infProt"`
	} `xml:"protNFe"`
}

// -----------------------------------------------------
// MARCAS
// -----------------------------------------------------

func (m *MotorBD) ListarMarcas() ([]Marca, error) {
	query := `SELECT id, nome, margem, COALESCE(mkp_balcao, 0), COALESCE(mkp_externo, 0), COALESCE(mkp_oficina, 0), to_char(criado_em, 'DD/MM/YYYY'), COALESCE(ativo, TRUE) FROM marcas ORDER BY id ASC`
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Marca
	for rows.Next() {
		var item Marca
		if err := rows.Scan(&item.ID, &item.Nome, &item.Margem, &item.MkpBalcao, &item.MkpExterno, &item.MkpOficina, &item.CriadoEm, &item.Ativo); err != nil {
			return nil, err
		}
		lista = append(lista, item)
	}
	if lista == nil {
		lista = []Marca{}
	}
	return lista, nil
}

func (m *MotorBD) SalvarMarca(nome string, margem float64) error {
	_, err := m.Conexao.Exec(`
		INSERT INTO marcas (nome, margem, mkp_balcao, mkp_externo, mkp_oficina, ativo) VALUES ($1, $2, $2, $2, $2, TRUE)
		ON CONFLICT (nome) DO UPDATE SET margem = EXCLUDED.margem, mkp_balcao = EXCLUDED.margem, mkp_externo = EXCLUDED.margem, mkp_oficina = EXCLUDED.margem
	`, nome, margem)
	if err == nil {
		m.Notificar("sig_events", "marcas_changed")
	}
	return err
}

func (m *MotorBD) ExcluirMarca(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM marcas WHERE id = $1", id)
	if err == nil {
		m.Notificar("sig_events", "marcas_changed")
	}
	return err
}

// -----------------------------------------------------
// CATEGORIAS
// -----------------------------------------------------

func (m *MotorBD) ListarCategorias() ([]Categoria, error) {
	query := `SELECT id, nome, to_char(criado_em, 'DD/MM/YYYY') FROM categorias ORDER BY id ASC`
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Categoria
	for rows.Next() {
		var item Categoria
		if err := rows.Scan(&item.ID, &item.Nome, &item.CriadoEm); err != nil {
			return nil, err
		}
		lista = append(lista, item)
	}
	if lista == nil {
		lista = []Categoria{}
	}
	return lista, nil
}

func (m *MotorBD) SalvarCategoria(id int, nome string) error {
	var err error
	if id > 0 {
		_, err = m.Conexao.Exec(`UPDATE categorias SET nome = $1 WHERE id = $2`, nome, id)
	} else {
		m.Conexao.Exec("SELECT setval(pg_get_serial_sequence('categorias', 'id'), COALESCE((SELECT MAX(id) FROM categorias), 0))")
		_, err = m.Conexao.Exec(`INSERT INTO categorias (nome) VALUES ($1)`, nome)
	}
	return err
}

func (m *MotorBD) ExcluirCategoria(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM categorias WHERE id = $1", id)
	return err
}

// -----------------------------------------------------
// SUBCATEGORIAS
// -----------------------------------------------------

func (m *MotorBD) ListarSubcategorias() ([]Subcategoria, error) {
	query := `
		SELECT s.id, s.categoria_id, c.nome, s.nome, to_char(s.criado_em, 'DD/MM/YYYY') 
		FROM subcategorias s
		INNER JOIN categorias c ON s.categoria_id = c.id
		ORDER BY s.id ASC
	`
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Subcategoria
	for rows.Next() {
		var item Subcategoria
		if err := rows.Scan(&item.ID, &item.CategoriaID, &item.CategoriaNome, &item.Nome, &item.CriadoEm); err != nil {
			return nil, err
		}
		lista = append(lista, item)
	}
	if lista == nil {
		lista = []Subcategoria{}
	}
	return lista, nil
}

func (m *MotorBD) SalvarSubcategoria(id int, categoriaId int, nome string) error {
	var err error
	if id > 0 {
		_, err = m.Conexao.Exec(`UPDATE subcategorias SET nome = $1, categoria_id = $2 WHERE id = $3`, nome, categoriaId, id)
	} else {
		m.Conexao.Exec("SELECT setval(pg_get_serial_sequence('subcategorias', 'id'), COALESCE((SELECT MAX(id) FROM subcategorias), 0))")
		_, err = m.Conexao.Exec(`INSERT INTO subcategorias (categoria_id, nome) VALUES ($1, $2)`, categoriaId, nome)
	}
	return err
}

func (m *MotorBD) ExcluirSubcategoria(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM subcategorias WHERE id = $1", id)
	return err
}

// ContextoDeterminacao: Dados necessários para escolher o perfil fiscal correto
type ContextoDeterminacao struct {
	RegimeTributario string `json:"regime_tributario"`
	TipoOperacao     string `json:"tipo_operacao"`
	Finalidade       string `json:"finalidade"`
	NaturezaOperacao string `json:"natureza_operacao"`
	TipoParceiro     string `json:"tipo_parceiro"`
	ContribuinteIcms bool   `json:"contribuinte_icms"`
	ConsumidorFinal  bool   `json:"consumidor_final"`
	OrigemUF         string `json:"origem_uf"`
	DestinoUF        string `json:"destino_uf"`
	TipoItem         string `json:"tipo_item"`
	Ncm              string `json:"ncm"`
	Cest             string `json:"cest"`
	TemSt            bool   `json:"tem_st"`
	ProdutoID        int    `json:"produto_id"`
}

// DeterminarPerfilFiscal: Algoritmo central de decisão (Matriz > Produto > Default)
func (m *MotorBD) DeterminarPerfilFiscal(ctx ContextoDeterminacao) (int, error) {
	// 1. Tentar regra específica na MATRIZ FISCAL (Decision Engine)
	// Ordenamos por prioridade DESC e por especificidade (NCM primeiro)
	query := `
		SELECT perfil_fiscal_id 
		FROM matriz_fiscal 
		WHERE ativo = TRUE
		  AND (regime_tributario = $1 OR regime_tributario = 'TODOS' OR regime_tributario IS NULL OR regime_tributario = '')
		  AND (tipo_operacao = $2 OR tipo_operacao IS NULL OR tipo_operacao = '')
		  AND (origem_uf = $3 OR origem_uf = '' OR origem_uf IS NULL)
		  AND (destino_uf = $4 OR destino_uf = '' OR destino_uf IS NULL)
		  AND (contribuinte_icms = $5 OR contribuinte_icms IS NULL)
		  AND (consumidor_final = $6 OR consumidor_final IS NULL)
		  AND (ncm = $7 OR ncm = '' OR ncm IS NULL)
		ORDER BY prioridade DESC, (CASE WHEN ncm IS NOT NULL AND ncm != '' THEN 100 ELSE 0 END) DESC
		LIMIT 1`

	var perfilID int
	err := m.Conexao.QueryRow(query, 
		ctx.RegimeTributario, ctx.TipoOperacao, ctx.OrigemUF, ctx.DestinoUF, 
		ctx.ContribuinteIcms, ctx.ConsumidorFinal, ctx.Ncm,
	).Scan(&perfilID)

	if err == nil && perfilID > 0 {
		return perfilID, nil
	}

	// 2. Se não achou na matriz, tentar Perfil do Produto
	if ctx.ProdutoID > 0 {
		err = m.Conexao.QueryRow("SELECT perfil_fiscal_id FROM produtos WHERE id = $1", ctx.ProdutoID).Scan(&perfilID)
		if err == nil && perfilID > 0 {
			return perfilID, nil
		}
	}

	// 3. Fallback: Perfil Padrão do Sistema (ID 1 geralmente)
	return 1, nil
}

// Setup Inicial de Dados
func (m *MotorBD) SetupProdutosData() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS depositos (
			id SERIAL PRIMARY KEY,
			empresa_id INT REFERENCES empresas(id),
			nome VARCHAR(100) UNIQUE NOT NULL,
			descricao TEXT,
			fantasia TEXT,
			cnpj TEXT,
			inscricao_estadual TEXT,
			telefone TEXT,
			logradouro TEXT,
			numero TEXT,
			bairro TEXT,
			cidade TEXT,
			uf TEXT,
			ativo BOOLEAN DEFAULT TRUE,
			ruas INT DEFAULT 0,
			estantes INT DEFAULT 0,
			prateleiras INT DEFAULT 0,
			criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`ALTER TABLE depositos ADD COLUMN IF NOT EXISTS ruas INT DEFAULT 0;`,
		`ALTER TABLE depositos ADD COLUMN IF NOT EXISTS estantes INT DEFAULT 0;`,
		`ALTER TABLE depositos ADD COLUMN IF NOT EXISTS prateleiras INT DEFAULT 0;`,
		`CREATE TABLE IF NOT EXISTS marcas (
			id SERIAL PRIMARY KEY,
			nome VARCHAR(100) UNIQUE NOT NULL,
			margem DECIMAL(12, 2) DEFAULT 0.00,
			ativo BOOLEAN DEFAULT TRUE,
			criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`ALTER TABLE marcas ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;`,
		`UPDATE marcas SET ativo = TRUE WHERE ativo IS NULL;`,
		`CREATE TABLE IF NOT EXISTS categorias (
			id SERIAL PRIMARY KEY,
			nome VARCHAR(100) UNIQUE NOT NULL,
			criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS subcategorias (
			id SERIAL PRIMARY KEY,
			categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
			nome VARCHAR(100) NOT NULL,
			criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(categoria_id, nome)
		);`,
		`CREATE TABLE IF NOT EXISTS produtos (
			id SERIAL PRIMARY KEY,
			sku VARCHAR(50) UNIQUE NOT NULL,
			ean VARCHAR(13),
			descricao_tecnica TEXT NOT NULL,
			marca_id INT NOT NULL REFERENCES marcas(id),
			categoria_id INT NOT NULL REFERENCES categorias(id),
			subcategoria_id INT NOT NULL REFERENCES subcategorias(id),
			deposito_id INT REFERENCES depositos(id),
			custo DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
			venda DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
			estoque_atual INT NOT NULL DEFAULT 0,
			estoque_minimo INT NOT NULL DEFAULT 0,
			localizacao VARCHAR(100),
			nome_popular TEXT,
			criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
		ALTER TABLE produtos ADD COLUMN IF NOT EXISTS nome_popular TEXT;
	`,
		`CREATE TABLE IF NOT EXISTS aplicacoes_produto (
			id SERIAL PRIMARY KEY,
			produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
			marca VARCHAR(100),
			modelo VARCHAR(100),
			motor VARCHAR(100),
			ano_inicio VARCHAR(10),
			ano_fim VARCHAR(10),
			criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS conversoes (
			id SERIAL PRIMARY KEY,
			produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
			codigo_concorrente VARCHAR(100) NOT NULL,
			marca_concorrente VARCHAR(100) NOT NULL,
			UNIQUE(produto_id, codigo_concorrente, marca_concorrente)
		);`,
		`CREATE TABLE IF NOT EXISTS historico_produto (
			id SERIAL PRIMARY KEY,
			produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
			data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			tipo VARCHAR(50) NOT NULL,
			descricao TEXT NOT NULL,
			snapshot_json JSONB,
			usuario VARCHAR(100)
		);`,
		`CREATE TABLE IF NOT EXISTS produtos_imagens (
			id SERIAL PRIMARY KEY,
			produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
			caminho TEXT NOT NULL,
			criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS unidades_medida (
			id SERIAL PRIMARY KEY,
			sigla VARCHAR(10) UNIQUE NOT NULL,
			descricao VARCHAR(100) NOT NULL
		);`,
		`INSERT INTO unidades_medida (sigla, descricao) VALUES 
		('UN', 'UNIDADE'), ('PC', 'PEÇA'), ('KG', 'QUILOGRAMA'), ('MT', 'METRO'), 
		('CX', 'CAIXA'), ('JG', 'JOGO'), ('LT', 'LITRO'), ('PR', 'PAR'),
		('ML', 'MILILITRO'), ('BD', 'BALDE'), ('GL', 'GALÃO'), ('CM', 'CENTÍMETRO'),
		('CT', 'CARTELA'), ('RL', 'ROLO'), ('DZ', 'DÚZIA')
		ON CONFLICT (sigla) DO NOTHING;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS marca_id INT;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS categoria_id INT;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS subcategoria_id INT;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS deposito_id INT;`,
		`ALTER TABLE produtos DROP COLUMN IF EXISTS marca CASCADE;`,
		`ALTER TABLE produtos DROP COLUMN IF EXISTS categoria CASCADE;`,
		`ALTER TABLE produtos DROP COLUMN IF EXISTS subcategoria CASCADE;`,
		`ALTER TABLE produtos DROP COLUMN IF EXISTS deposito CASCADE;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS unidade_id INT REFERENCES unidades_medida(id);`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS fator_conversao DECIMAL(12, 4) DEFAULT 1.0000;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS peso DECIMAL(12, 3) DEFAULT 0.000;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS altura DECIMAL(12, 2) DEFAULT 0.00;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS largura DECIMAL(12, 2) DEFAULT 0.00;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS comprimento DECIMAL(12, 2) DEFAULT 0.00;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS nome_popular TEXT;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ncm VARCHAR(10);`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS cest VARCHAR(10);`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS origem INT DEFAULT 0;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS cfop VARCHAR(10);`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS cst_csosn VARCHAR(10);`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS aliquota_icms DECIMAL(12, 2) DEFAULT 0.00;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS aliquota_ipi DECIMAL(12, 2) DEFAULT 0.00;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS aliquota_pis DECIMAL(12, 2) DEFAULT 0.00;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS aliquota_cofins DECIMAL(12, 2) DEFAULT 0.00;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS reducao_bc DECIMAL(12, 2) DEFAULT 0.00;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;`,
		
		// NOVOS CAMPOS FISCAIS COMPLETE (V55)
		`CREATE TABLE IF NOT EXISTS perfis_fiscais (
			id SERIAL PRIMARY KEY,
			nome VARCHAR(100) UNIQUE NOT NULL,
			operacao VARCHAR(20) DEFAULT 'SAIDA',
			tipo_item VARCHAR(50),
			finalidade VARCHAR(50),
			ativo BOOLEAN DEFAULT TRUE,
			observacao_interna TEXT,
			calcula_icms BOOLEAN DEFAULT TRUE,
			cst_icms VARCHAR(10),
			tem_st BOOLEAN DEFAULT FALSE,
			tem_difal BOOLEAN DEFAULT FALSE,
			tem_fcp BOOLEAN DEFAULT FALSE,
			tem_reducao_base BOOLEAN DEFAULT FALSE,
			permite_credito_icms BOOLEAN DEFAULT TRUE,
			calcula_ipi BOOLEAN DEFAULT FALSE,
			cst_ipi VARCHAR(10),
			gera_credito_ipi BOOLEAN DEFAULT FALSE,
			ipi_no_custo BOOLEAN DEFAULT FALSE,
			calcula_pis BOOLEAN DEFAULT TRUE,
			cst_pis VARCHAR(10),
			calcula_cofins BOOLEAN DEFAULT TRUE,
			cst_cofins VARCHAR(10),
			gera_credito_pis BOOLEAN DEFAULT TRUE,
			gera_credito_cofins BOOLEAN DEFAULT TRUE,
			soma_st_no_custo BOOLEAN DEFAULT TRUE,
			soma_ipi_no_custo BOOLEAN DEFAULT FALSE,
			soma_difal_no_custo BOOLEAN DEFAULT FALSE,
			soma_frete_no_custo BOOLEAN DEFAULT TRUE,
			soma_despesas_no_custo BOOLEAN DEFAULT TRUE,
			usa_matriz_fiscal BOOLEAN DEFAULT TRUE,
			exige_ncm BOOLEAN DEFAULT TRUE,
			exige_cest BOOLEAN DEFAULT FALSE,
			permite_overwrite_cfop BOOLEAN DEFAULT TRUE,
			permite_overwrite_cst BOOLEAN DEFAULT TRUE,
			cfop_padrao VARCHAR(10) DEFAULT '',
			cfop_descricao TEXT DEFAULT ''
		);`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tipo_item VARCHAR(50);`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS finalidade VARCHAR(50);`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS observacao_interna TEXT;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS calcula_icms BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS cst_icms VARCHAR(10);`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tem_st BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tem_difal BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tem_fcp BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tem_reducao_base BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS permite_credito_icms BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS calcula_ipi BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS cst_ipi VARCHAR(10);`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS gera_credito_ipi BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS ipi_no_custo BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS calcula_pis BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS cst_pis VARCHAR(10);`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS calcula_cofins BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS cst_cofins VARCHAR(10);`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS gera_credito_pis BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS gera_credito_cofins BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS soma_st_no_custo BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS soma_ipi_no_custo BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS soma_difal_no_custo BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS soma_frete_no_custo BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS soma_despesas_no_custo BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS usa_matriz_fiscal BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS exige_ncm BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS exige_cest BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS permite_overwrite_cfop BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS permite_overwrite_cst BOOLEAN DEFAULT TRUE;`,

		// CAMPOS NOVOS MOTOR TRIBUTÁRIO V65
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS icms_tipo_calculo VARCHAR(50) DEFAULT 'NORMAL';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS icms_consumidor_final BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS icms_contribuinte BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS icms_st_credito BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS indicador_presenca VARCHAR(50) DEFAULT '1';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS difal_tipo VARCHAR(50) DEFAULT 'N/A';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS difal_responsavel VARCHAR(50) DEFAULT 'ORIGEM';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS difal_considera_fcp BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS ipi_tipo_calculo VARCHAR(50) DEFAULT 'PERCENTUAL';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS piscofins_regime VARCHAR(50) DEFAULT 'CUMULATIVO';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS piscofins_base VARCHAR(50) DEFAULT 'TOTAL NOTA';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS entrada_estoque BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS entrada_custo BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS entrada_financeiro BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS entrada_xml BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS entrada_credito BOOLEAN DEFAULT TRUE;`,

		// CAMPOS MOTOR TRIBUTÁRIO V76.1 (SIG MASTER)
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tipo_operacao TEXT DEFAULT 'SAIDA';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS natureza_operacao TEXT DEFAULT 'FISCAL';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS consumidor_final BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS regime_empresa TEXT DEFAULT 'SIMPLES';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS finalidade_nfe INT DEFAULT 1;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS destaca_icms BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS destaca_icms_st BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS forma_custo_medio BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tem_icms_proprio BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tem_icms_st BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS destaca_difal BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tem_ipi BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS destaca_ipi BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS ipi_soma_custo BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS ipi_gera_credito BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tipo_movimento_estoque TEXT DEFAULT 'NAO_MOVIMENTA';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS reserva_estoque BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS baixa_estoque BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS trava_sem_ncm BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS trava_sem_cest BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS trava_sem_cfop BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS trava_sem_cst BOOLEAN DEFAULT TRUE;`,

		// ALINHAMENTO V76.1 — Colunas referenciadas no Go mas faltantes no banco
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS gera_credito_icms BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS soma_st_custo BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS soma_ipi_custo BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS soma_frete_custo BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS soma_despesas_custo BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS soma_difal_custo BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS atualiza_estoque BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS gera_financeiro BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS permite_venda_negativa BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS tipo_movimentacao TEXT DEFAULT 'COMPRA';`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS com_nota_fiscal BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE perfis_fiscais ADD COLUMN IF NOT EXISTS incide_st BOOLEAN DEFAULT FALSE;`,

		`ALTER TABLE marcas ADD COLUMN IF NOT EXISTS mkp_balcao DECIMAL(12, 2) DEFAULT 0.00;`,
		`ALTER TABLE marcas ADD COLUMN IF NOT EXISTS mkp_externo DECIMAL(12, 2) DEFAULT 0.00;`,
		`ALTER TABLE marcas ADD COLUMN IF NOT EXISTS mkp_oficina DECIMAL(12, 2) DEFAULT 0.00;`,

		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS perfil_fiscal_id INT REFERENCES perfis_fiscais(id);`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tem_icms BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tem_st BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tem_ipi BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tem_pis_cofins BOOLEAN DEFAULT TRUE;`,

		// TABELA MATRIZ FISCAL VMASTER (DECISION ENGINE)
		`CREATE TABLE IF NOT EXISTS matriz_fiscal (
			id SERIAL PRIMARY KEY,
			nome VARCHAR(100) UNIQUE NOT NULL,
			regime_tributario VARCHAR(20),
			tipo_operacao VARCHAR(20),
			finalidade VARCHAR(30),
			natureza_operacao VARCHAR(20),
			tipo_parceiro VARCHAR(20),
			contribuinte_icms BOOLEAN DEFAULT TRUE,
			consumidor_final BOOLEAN DEFAULT FALSE,
			origem_uf VARCHAR(2),
			destino_uf VARCHAR(2),
			tipo_item VARCHAR(20),
			ncm VARCHAR(10),
			cest VARCHAR(10),
			tem_st BOOLEAN DEFAULT FALSE,
			perfil_fiscal_id INT REFERENCES perfis_fiscais(id),
			prioridade INT DEFAULT 0,
			ativo BOOLEAN DEFAULT TRUE,
			criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS nome VARCHAR(100);`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS regime_tributario VARCHAR(20);`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS finalidade VARCHAR(30);`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS natureza_operacao VARCHAR(20);`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS tipo_parceiro VARCHAR(20);`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS contribuinte_icms BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS consumidor_final BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS tipo_item VARCHAR(20);`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS ncm VARCHAR(10);`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS cest VARCHAR(10);`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS tem_st BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS prioridade INT DEFAULT 0;`,
		`ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS perfil_fiscal_id INT REFERENCES perfis_fiscais(id);`,
	}

	for _, q := range queries {
		if _, err := m.Conexao.Exec(q); err != nil {
			return fmt.Errorf("Erro ao criar motor de produtos: %v", err)
		}
	}
	return nil
}

// -----------------------------------------------------
// PRODUTOS
// -----------------------------------------------------

func (m *MotorBD) ObterProximoIdProduto() (int, error) {
	var proxId int
	err := m.Conexao.QueryRow("SELECT COALESCE(MAX(id), 0) + 1 FROM produtos").Scan(&proxId)
	if err != nil {
		return 1, err
	}
	return proxId, nil
}

func (m *MotorBD) ListarProdutos() ([]Produto, error) {
	query := `
		SELECT 
			p.id, p.sku, COALESCE(p.ean, ''), COALESCE(p.descricao_tecnica, ''),
			COALESCE(p.marca_id, 0), COALESCE(mrc.nome, '') as marca_nome,
			COALESCE(p.categoria_id, 0), COALESCE(c.nome, '') as categoria_nome,
			COALESCE(p.subcategoria_id, 0), COALESCE(s.nome, '') as subcategoria_nome,
			COALESCE(p.deposito_id, 0),
			COALESCE(p.custo, 0.0), COALESCE(p.venda, 0.0), COALESCE(p.estoque_atual, 0), COALESCE(p.estoque_minimo, 0), COALESCE(p.localizacao, ''),
			COALESCE(p.nome_popular, ''),
			COALESCE(to_char(p.criado_em, 'DD/MM/YYYY'), ''), COALESCE(to_char(p.atualizado_em, 'DD/MM/YYYY'), ''),
			COALESCE(p.unidade_id, 0), COALESCE(u.sigla, 'UN'),
			COALESCE(p.fator_conversao, 1.0), COALESCE(p.peso, 0.0),
			COALESCE(p.altura, 0.0), COALESCE(p.largura, 0.0), COALESCE(p.comprimento, 0.0),
			COALESCE(p.ncm, ''), COALESCE(p.cest, ''), COALESCE(p.origem, 0),
			COALESCE(p.cfop, ''), COALESCE(p.cst_csosn, ''),
			COALESCE(p.aliquota_icms, 0.0), COALESCE(p.aliquota_ipi, 0.0),
			COALESCE(p.aliquota_pis, 0.0), COALESCE(p.aliquota_cofins, 0.0),
			COALESCE(p.reducao_bc, 0.0),
			COALESCE(p.perfil_fiscal_id, 0), COALESCE(pf.nome, ''),
			COALESCE(p.tem_icms, true), COALESCE(p.tem_st, false),
			COALESCE(p.tem_ipi, false), COALESCE(p.tem_pis_cofins, true), COALESCE(p.ativo, true)
		FROM produtos p
		LEFT JOIN marcas mrc ON p.marca_id = mrc.id
		LEFT JOIN categorias c ON p.categoria_id = c.id
		LEFT JOIN subcategorias s ON p.subcategoria_id = s.id
		LEFT JOIN unidades_medida u ON p.unidade_id = u.id
		LEFT JOIN perfis_fiscais pf ON p.perfil_fiscal_id = pf.id
		ORDER BY p.id ASC`
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Produto
	for rows.Next() {
		var item Produto
		if err := rows.Scan(
			&item.ID, &item.Sku, &item.Ean, &item.DescricaoTecnica,
			&item.MarcaID, &item.MarcaNome,
			&item.CategoriaID, &item.CategoriaNome,
			&item.SubcategoriaID, &item.SubcategoriaNome,
			&item.DepositoID,
			&item.Custo, &item.Venda, &item.EstoqueAtual, &item.EstoqueMinimo, &item.Localizacao,
			&item.NomePopular,
			&item.CriadoEm, &item.AtualizadoEm,
			&item.UnidadeID, &item.UnidadeSigla,
			&item.FatorConversao, &item.Peso,
			&item.Altura, &item.Largura, &item.Comprimento,
			&item.Ncm, &item.Cest, &item.Origem, &item.Cfop, &item.CstCsosn,
			&item.AliquotaIcms, &item.AliquotaIpi, &item.AliquotaPis, &item.AliquotaCofins, &item.ReducaoBc,
			&item.PerfilFiscalID, &item.PerfilFiscalNome,
			&item.TemIcms, &item.TemSt, &item.TemIpi, &item.TemPisCofins, &item.Ativo,
		); err != nil {
			return nil, err
		}
		lista = append(lista, item)
	}
	if lista == nil {
		lista = []Produto{}
	}
	return lista, nil
}

func (m *MotorBD) VerificarSKUExistente(sku string, idAtual int) bool {
	var count int
	err := m.Conexao.QueryRow("SELECT COUNT(*) FROM produtos WHERE UPPER(sku) = UPPER($1) AND id != $2", sku, idAtual).Scan(&count)
	if err != nil {
		return false
	}
	return count > 0
}

func (m *MotorBD) SalvarProduto(p Produto) (int, error) {
	var id int
	tipoHist := "CADASTRO"
	if p.ID == 0 {
		err := m.Conexao.QueryRow(`
			INSERT INTO produtos (
				sku, ean, descricao_tecnica, marca_id, categoria_id, subcategoria_id,
				deposito_id, custo, venda, estoque_atual, estoque_minimo, localizacao, 
				nome_popular, unidade_id, fator_conversao, peso, altura, largura, comprimento,
				ncm, cest, origem, cfop, cst_csosn, aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, reducao_bc,
				perfil_fiscal_id, tem_icms, tem_st, tem_ipi, tem_pis_cofins, ativo
			) VALUES ($1, $2, $3, NULLIF($4, 0), NULLIF($5, 0), NULLIF($6, 0), NULLIF($7, 0), $8, $9, $10, $11, $12, $13, NULLIF($14, 0), $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, NULLIF($30, 0), $31, $32, $33, $34, $35) RETURNING id
		`, p.Sku, p.Ean, p.DescricaoTecnica, p.MarcaID, p.CategoriaID, p.SubcategoriaID,
			p.DepositoID, p.Custo, p.Venda, p.EstoqueAtual, p.EstoqueMinimo, p.Localizacao, 
			p.NomePopular, p.UnidadeID, p.FatorConversao, p.Peso, p.Altura, p.Largura, p.Comprimento,
			p.Ncm, p.Cest, p.Origem, p.Cfop, p.CstCsosn, p.AliquotaIcms, p.AliquotaIpi, p.AliquotaPis, p.AliquotaCofins, p.ReducaoBc,
			p.PerfilFiscalID, p.TemIcms, p.TemSt, p.TemIpi, p.TemPisCofins, p.Ativo).Scan(&id)
		if err != nil {
			return 0, err
		}
	} else {
		_, err := m.Conexao.Exec(`
			UPDATE produtos SET 
				sku = $1, ean = $2, descricao_tecnica = $3, marca_id = NULLIF($4, 0),
				categoria_id = NULLIF($5, 0), subcategoria_id = NULLIF($6, 0), deposito_id = NULLIF($7, 0), custo = $8, venda = $9,
				estoque_atual = $10, estoque_minimo = $11, localizacao = $12, nome_popular = $13,
				unidade_id = NULLIF($14, 0), fator_conversao = $15, peso = $16, altura = $17, largura = $18, comprimento = $19,
				ncm = $20, cest = $21, origem = $22, cfop = $23, cst_csosn = $24,
				aliquota_icms = $25, aliquota_ipi = $26, aliquota_pis = $27, aliquota_cofins = $28, reducao_bc = $29,
				perfil_fiscal_id = NULLIF($30, 0), tem_icms = $31, tem_st = $32, tem_ipi = $33, tem_pis_cofins = $34,
				ativo = $35, atualizado_em = CURRENT_TIMESTAMP
			WHERE id = $36
		`, p.Sku, p.Ean, p.DescricaoTecnica, p.MarcaID, p.CategoriaID, p.SubcategoriaID,
			p.DepositoID, p.Custo, p.Venda, p.EstoqueAtual, p.EstoqueMinimo, p.Localizacao, 
			p.NomePopular, p.UnidadeID, p.FatorConversao, p.Peso, p.Altura, p.Largura, p.Comprimento,
			p.Ncm, p.Cest, p.Origem, p.Cfop, p.CstCsosn, p.AliquotaIcms, p.AliquotaIpi, p.AliquotaPis, p.AliquotaCofins, p.ReducaoBc,
			p.PerfilFiscalID, p.TemIcms, p.TemSt, p.TemIpi, p.TemPisCofins, p.Ativo, p.ID)
		if err != nil {
			return 0, err
		}
		id = p.ID
		tipoHist = "ALTERACAO"
	}

	// 1. Salvar Aplicações
	m.Conexao.Exec("DELETE FROM aplicacoes_produto WHERE produto_id = $1", id)
	for _, app := range p.Aplicacoes {
		m.Conexao.Exec(`
			INSERT INTO aplicacoes_produto (produto_id, marca, modelo, motor, ano_inicio, ano_fim)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, id, app.Marca, app.Modelo, app.Motor, app.AnoInicio, app.AnoFim)
	}

	// 2. Salvar Similares/Conversões
	m.Conexao.Exec("DELETE FROM conversoes WHERE produto_id = $1", id)
	for _, conv := range p.Conversoes {
		m.Conexao.Exec(`
			INSERT INTO conversoes (produto_id, codigo_concorrente, marca_concorrente)
			VALUES ($1, $2, $3)
		`, id, conv.Codigo, conv.Marca)
	}

	// 3. Salvar Histórico Snapshot
	snapshotJSON, _ := json.Marshal(p)
	m.Conexao.Exec(`
		INSERT INTO historico_produto (produto_id, tipo, descricao, snapshot_json, usuario)
		VALUES ($1, $2, $3, $4, $5)
	`, id, tipoHist, "Cadastro/Atualização via Formulário Principal (F3)", snapshotJSON, "SISTEMA")

	// 4. Gravar na Tela de Movimentações (Ledger Integrado) de forma que a equipe veja a modificação
	m.Conexao.Exec(`
		INSERT INTO movimentacoes_estoque (produto_id, tipo_movimentacao, quantidade, documento_origem, usuario_id)
		VALUES ($1, $2, 0, $3, NULL)
	`, id, tipoHist, "Cadastro/Atualização F3")

	return id, nil
}

func (m *MotorBD) ExcluirProduto(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM produtos WHERE id = $1", id)
	return err
}

func (m *MotorBD) ListarSimilaresDoProduto(produtoID int) ([]int, error) {
	rows, err := m.Conexao.Query(`
		SELECT similar_id FROM produtos_similares WHERE produto_id = $1
		UNION
		SELECT produto_id FROM produtos_similares WHERE similar_id = $1
	`, produtoID)
	if err != nil {
		return []int{}, err
	}
	defer rows.Close()

	var lista []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			continue
		}
		if id != produtoID {
			lista = append(lista, id)
		}
	}
	if lista == nil {
		lista = []int{}
	}
	return lista, nil
}

func (m *MotorBD) ListarAplicacoesDoProduto(produtoID int) ([]AplicacaoProduto, error) {
	query := `SELECT id, produto_id, marca, modelo, motor, ano_inicio, ano_fim FROM aplicacoes_produto WHERE produto_id = $1 ORDER BY id ASC`
	rows, err := m.Conexao.Query(query, produtoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []AplicacaoProduto
	for rows.Next() {
		var a AplicacaoProduto
		if err := rows.Scan(&a.ID, &a.ProdutoID, &a.Marca, &a.Modelo, &a.Motor, &a.AnoInicio, &a.AnoFim); err == nil {
			lista = append(lista, a)
		}
	}
	if lista == nil {
		lista = []AplicacaoProduto{}
	}
	return lista, nil
}

func (m *MotorBD) ListarConversoesDoProduto(produtoID int) ([]ProdutoConversao, error) {
	query := `SELECT id, produto_id, codigo_concorrente, marca_concorrente FROM conversoes WHERE produto_id = $1 ORDER BY id ASC`
	rows, err := m.Conexao.Query(query, produtoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []ProdutoConversao
	for rows.Next() {
		var a ProdutoConversao
		if err := rows.Scan(&a.ID, &a.ProdutoID, &a.Codigo, &a.Marca); err == nil {
			lista = append(lista, a)
		}
	}
	if lista == nil {
		lista = []ProdutoConversao{}
	}
	return lista, nil
}

func (m *MotorBD) ListarImagensProduto(produtoID int) []string {
	rows, err := m.Conexao.Query("SELECT caminho FROM produtos_imagens WHERE produto_id = $1 ORDER BY id ASC", produtoID)
	var lista []string
	if err == nil && rows != nil {
		defer rows.Close()
		for rows.Next() {
			var c string
			if err := rows.Scan(&c); err == nil {
				lista = append(lista, c)
			}
		}
	}
	return lista
}

func (m *MotorBD) SalvarImagensProduto(produtoID int, imagensBase64 []string) error {
	// Apagar antigas
	velhas := m.ListarImagensProduto(produtoID)
	for _, v := range velhas {
		os.Remove(v)
	}
	m.Conexao.Exec("DELETE FROM produtos_imagens WHERE produto_id = $1", produtoID)

	sigImgDir := `C:\sig_img`
	os.MkdirAll(sigImgDir, 0755)

	for i, imgData := range imagensBase64 {
		// ignora paths locais normais ou strings inválidas
		if !strings.HasPrefix(imgData, "data:image") && !strings.HasPrefix(imgData, "http") {
			continue
		}
		
		var bytesImg []byte
		var err error

		if strings.HasPrefix(imgData, "http") {
			resp, httpErr := http.Get(imgData)
			if httpErr != nil {
				continue
			}
			bytesImg, err = io.ReadAll(resp.Body)
			resp.Body.Close()
			if err != nil {
				continue
			}
		} else {
			dados := strings.SplitN(imgData, ",", 2)
			if len(dados) != 2 {
				continue
			}
			bytesImg, err = base64.StdEncoding.DecodeString(dados[1])
			if err != nil {
				continue
			}
		}
		
		fileName := fmt.Sprintf(`C:\sig_img\prod_%d_%d.png`, produtoID, time.Now().UnixNano()+int64(i))
		err = os.WriteFile(fileName, bytesImg, 0644)
		if err == nil {
			m.Conexao.Exec("INSERT INTO produtos_imagens (produto_id, caminho) VALUES ($1, $2)", produtoID, fileName)
		}
	}
	return nil
}

// ObterDescricoesUnicas retorna todas as descrições técnicas distintas cadastradas no banco (V56)
func (m *MotorBD) ObterDescricoesUnicas() ([]string, error) {
	rows, err := m.Conexao.Query("SELECT DISTINCT descricao_tecnica FROM produtos WHERE descricao_tecnica != '' ORDER BY descricao_tecnica ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []string
	for rows.Next() {
		var s string
		if err := rows.Scan(&s); err == nil {
			lista = append(lista, s)
		}
	}
	if lista == nil {
		lista = []string{}
	}
	return lista, nil
}

func (m *MotorBD) VincularSimilar(produtoIDA int, produtoIDB int) error {
	if produtoIDA == produtoIDB {
		return fmt.Errorf("produto não pode ser similar a si mesmo")
	}
	id1, id2 := produtoIDA, produtoIDB
	if id1 > id2 {
		id1, id2 = id2, id1
	}
	_, err := m.Conexao.Exec(`
		INSERT INTO produtos_similares (produto_id, similar_id) VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, id1, id2)
	return err
}

func (m *MotorBD) DesvincularSimilar(produtoIDA int, produtoIDB int) error {
	id1, id2 := produtoIDA, produtoIDB
	if id1 > id2 {
		id1, id2 = id2, id1
	}
	_, err := m.Conexao.Exec(`DELETE FROM produtos_similares WHERE produto_id = $1 AND similar_id = $2`, id1, id2)
	return err
}

// -----------------------------------------------------
// DEPÓSITOS / ESTOQUES
// -----------------------------------------------------

func (m *MotorBD) ListarDepositos() ([]Deposito, error) {
	query := `SELECT id, empresa_id, nome, descricao, ativo, to_char(criado_em, 'DD/MM/YYYY') FROM depositos ORDER BY id ASC`
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Deposito
	for rows.Next() {
		var item Deposito
		if err := rows.Scan(&item.ID, &item.EmpresaID, &item.Nome, &item.Descricao, &item.Ativo, &item.CriadoEm); err != nil {
			return nil, err
		}
		lista = append(lista, item)
	}
	if lista == nil {
		lista = []Deposito{}
	}
	return lista, nil
}

func (m *MotorBD) SalvarDeposito(d Deposito) error {
	if d.ID > 0 {
		_, err := m.Conexao.Exec(`
			UPDATE depositos SET empresa_id = $1, nome = $2, descricao = $3, ativo = $4 WHERE id = $5
		`, d.EmpresaID, d.Nome, d.Descricao, d.Ativo, d.ID)
		return err
	}
	_, err := m.Conexao.Exec(`
		INSERT INTO depositos (empresa_id, nome, descricao, ativo) VALUES ($1, $2, $3, $4)
	`, d.EmpresaID, d.Nome, d.Descricao, d.Ativo)
	return err
}

func (m *MotorBD) ExcluirDeposito(id int) error {
	var count int
	err := m.Conexao.QueryRow("SELECT COUNT(*) FROM produtos WHERE deposito_id = $1", id).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("não é possível excluir um depósito que possui itens vinculados")
	}
	_, err = m.Conexao.Exec("DELETE FROM depositos WHERE id = $1", id)
	return err
}

func (m *MotorBD) ListarUnidadesMedida() ([]UnidadeMedida, error) {
	query := `SELECT id, sigla, descricao FROM unidades_medida ORDER BY sigla ASC`
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []UnidadeMedida
	for rows.Next() {
		var item UnidadeMedida
		if err := rows.Scan(&item.ID, &item.Sigla, &item.Descricao); err != nil {
			return nil, err
		}
		lista = append(lista, item)
	}
	if lista == nil {
		lista = []UnidadeMedida{}
	}
	return lista, nil
}

func (m *MotorBD) SalvarUnidadeMedida(sigla, descricao string) error {
	_, err := m.Conexao.Exec(`
		INSERT INTO unidades_medida (sigla, descricao) VALUES ($1, $2)
		ON CONFLICT (sigla) DO UPDATE SET descricao = EXCLUDED.descricao
	`, sigla, descricao)
	return err
}

func (m *MotorBD) ExcluirUnidadeMedida(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM unidades_medida WHERE id = $1", id)
	return err
}
func (m *MotorBD) ListarPerfisFiscais() ([]PerfilFiscal, error) {
	rows, err := m.Conexao.Query(`
		SELECT 
			id, nome, tipo_operacao, natureza_operacao, COALESCE(regime_empresa, 'SIMPLES'), 
			finalidade_nfe, ativo, COALESCE(observacao_interna, ''),
			COALESCE(cfop_padrao, ''), COALESCE(cfop_descricao, ''), COALESCE(tipo_item, 'REVENDA'), 
			COALESCE(finalidade, 'COMERCIALIZACAO'), COALESCE(cst_icms, ''),
			tem_icms_proprio, destaca_icms, gera_credito_icms, tem_icms_st, destaca_icms_st, 
			tem_reducao_base, tem_difal, destaca_difal, COALESCE(icms_tipo_calculo, 'NORMAL'), 
			COALESCE(indicador_presenca, '1'), icms_st_credito, COALESCE(difal_responsavel, 'ORIGEM'), 
			difal_considera_fcp, tem_fcp,
			tem_ipi, destaca_ipi, ipi_soma_custo, ipi_gera_credito, COALESCE(cst_ipi, ''), 
			COALESCE(ipi_tipo_calculo, 'PERCENTUAL'),
			calcula_pis, COALESCE(cst_pis, ''), calcula_cofins, COALESCE(cst_cofins, ''), 
			COALESCE(piscofins_regime, 'CUMULATIVO'), COALESCE(piscofins_base, 'TOTAL NOTA'),
			soma_st_custo, soma_ipi_custo, soma_frete_custo, soma_despesas_custo, soma_difal_custo, forma_custo_medio,
			atualiza_estoque, COALESCE(tipo_movimento_estoque, 'NAO_MOVIMENTA'), gera_financeiro, 
			reserva_estoque, baixa_estoque, permite_venda_negativa,
			trava_sem_ncm, trava_sem_cest, trava_sem_cfop, trava_sem_cst,
			COALESCE(tipo_movimentacao, 'COMPRA'), com_nota_fiscal, incide_st
		FROM perfis_fiscais ORDER BY id ASC`)
	if err != nil {
		fmt.Printf("Erro ao listar perfis fiscais: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var lista []PerfilFiscal
	for rows.Next() {
		var item PerfilFiscal
		err := rows.Scan(
			&item.ID, &item.Nome, &item.TipoOperacao, &item.NaturezaOperacao, 
			&item.RegimeEmpresa, &item.FinalidadeNFe, &item.Ativo, &item.ObservacaoInterna,
			&item.CfopPadrao, &item.CfopDescricao, &item.TipoItem, &item.Finalidade, &item.CstIcmsBase,
			&item.TemIcmsProprio, &item.DestacaIcms, &item.GeraCreditoIcms, &item.TemIcmsSt, &item.DestacaIcmsSt,
			&item.TemReducaoBase, &item.TemDifal, &item.DestacaDifal, &item.IcmsTipoCalculo,
			&item.IndicadorPresenca, &item.IcmsStCredito, &item.DifalResponsavel, &item.DifalConsideraFcp, &item.TemFcp,
			&item.TemIpi, &item.DestacaIpi, &item.IpiSomaCusto, &item.IpiGeraCredito, &item.CstIpi, &item.IpiTipoCalculo,
			&item.CalculaPis, &item.CstPis, &item.CalculaCofins, &item.CstCofins, &item.PisCofinsRegime, &item.PisCofinsBase,
			&item.SomaStCusto, &item.SomaIpiCusto, &item.SomaFreteCusto, &item.SomaDespesasCusto, &item.SomaDifalCusto, &item.FormaCustoMedio,
			&item.AtualizaEstoque, &item.TipoMovimentoEstoque, &item.GeraFinanceiro, &item.ReservaEstoque, &item.BaixaEstoque, &item.PermiteVendaNegativa,
			&item.TravaSemNcm, &item.TravaSemCest, &item.TravaSemCfop, &item.TravaSemCst,
			&item.TipoMovimentacao, &item.ComNotaFiscal, &item.IncideSt,
		)
		if err != nil {
			fmt.Printf("Erro no scan de perfil fiscal: %v\n", err)
			continue
		}
		lista = append(lista, item)
	}
	if lista == nil {
		lista = []PerfilFiscal{}
	}
	return lista, nil
}

func (m *MotorBD) SalvarPerfilFiscal(p PerfilFiscal) error {
	if p.ID > 0 {
		query := `
			UPDATE perfis_fiscais SET 
				nome=$1, tipo_operacao=$2, natureza_operacao=$3, 
				regime_empresa=$4, finalidade_nfe=$5, ativo=$6, observacao_interna=$7,
				cfop_padrao=$8, cfop_descricao=$9, tipo_item=$10, finalidade=$11, cst_icms=$12,
				tem_icms_proprio=$13, destaca_icms=$14, gera_credito_icms=$15, tem_icms_st=$16, destaca_icms_st=$17,
				tem_reducao_base=$18, tem_difal=$19, destaca_difal=$20, icms_tipo_calculo=$21,
				indicador_presenca=$22, icms_st_credito=$23, difal_responsavel=$24, difal_considera_fcp=$25, tem_fcp=$26,
				tem_ipi=$27, destaca_ipi=$28, ipi_soma_custo=$29, ipi_gera_credito=$30, cst_ipi=$31, ipi_tipo_calculo=$32,
				calcula_pis=$33, cst_pis=$34, calcula_cofins=$35, cst_cofins=$36, piscofins_regime=$37, piscofins_base=$38,
				soma_st_custo=$39, soma_ipi_custo=$40, soma_frete_custo=$41, soma_despesas_custo=$42, soma_difal_custo=$43, forma_custo_medio=$44,
				atualiza_estoque=$45, tipo_movimento_estoque=$46, gera_financeiro=$47, reserva_estoque=$48, baixa_estoque=$49,
				permite_venda_negativa=$50,
				trava_sem_ncm=$51, trava_sem_cest=$52, trava_sem_cfop=$53, trava_sem_cst=$54,
				tipo_movimentacao=$55, com_nota_fiscal=$56, incide_st=$57
			WHERE id=$58`
		_, err := m.Conexao.Exec(query,
			p.Nome, p.TipoOperacao, p.NaturezaOperacao,
			p.RegimeEmpresa, p.FinalidadeNFe, p.Ativo, p.ObservacaoInterna,
			p.CfopPadrao, p.CfopDescricao, p.TipoItem, p.Finalidade, p.CstIcmsBase,
			p.TemIcmsProprio, p.DestacaIcms, p.GeraCreditoIcms, p.TemIcmsSt, p.DestacaIcmsSt,
			p.TemReducaoBase, p.TemDifal, p.DestacaDifal, p.IcmsTipoCalculo,
			p.IndicadorPresenca, p.IcmsStCredito, p.DifalResponsavel, p.DifalConsideraFcp, p.TemFcp,
			p.TemIpi, p.DestacaIpi, p.IpiSomaCusto, p.IpiGeraCredito, p.CstIpi, p.IpiTipoCalculo,
			p.CalculaPis, p.CstPis, p.CalculaCofins, p.CstCofins, p.PisCofinsRegime, p.PisCofinsBase,
			p.SomaStCusto, p.SomaIpiCusto, p.SomaFreteCusto, p.SomaDespesasCusto, p.SomaDifalCusto, p.FormaCustoMedio,
			p.AtualizaEstoque, p.TipoMovimentoEstoque, p.GeraFinanceiro, p.ReservaEstoque, p.BaixaEstoque,
			p.PermiteVendaNegativa,
			p.TravaSemNcm, p.TravaSemCest, p.TravaSemCfop, p.TravaSemCst,
			p.TipoMovimentacao, p.ComNotaFiscal, p.IncideSt,
			p.ID)
		return err
	}
	query := `
		INSERT INTO perfis_fiscais (
			nome, tipo_operacao, natureza_operacao, 
			regime_empresa, finalidade_nfe, ativo, observacao_interna,
			cfop_padrao, cfop_descricao, tipo_item, finalidade, cst_icms,
			tem_icms_proprio, destaca_icms, gera_credito_icms, tem_icms_st, destaca_icms_st,
			tem_reducao_base, tem_difal, destaca_difal, icms_tipo_calculo,
			indicador_presenca, icms_st_credito, difal_responsavel, difal_considera_fcp, tem_fcp,
			tem_ipi, destaca_ipi, ipi_soma_custo, ipi_gera_credito, cst_ipi, ipi_tipo_calculo,
			calcula_pis, cst_pis, calcula_cofins, cst_cofins, piscofins_regime, piscofins_base,
			soma_st_custo, soma_ipi_custo, soma_frete_custo, soma_despesas_custo, soma_difal_custo, forma_custo_medio,
			atualiza_estoque, tipo_movimento_estoque, gera_financeiro, reserva_estoque, baixa_estoque,
			permite_venda_negativa,
			trava_sem_ncm, trava_sem_cest, trava_sem_cfop, trava_sem_cst,
			tipo_movimentacao, com_nota_fiscal, incide_st
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
			$21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
			$41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57
		)`
	_, err := m.Conexao.Exec(query,
		p.Nome, p.TipoOperacao, p.NaturezaOperacao,
		p.RegimeEmpresa, p.FinalidadeNFe, p.Ativo, p.ObservacaoInterna,
		p.CfopPadrao, p.CfopDescricao, p.TipoItem, p.Finalidade, p.CstIcmsBase,
		p.TemIcmsProprio, p.DestacaIcms, p.GeraCreditoIcms, p.TemIcmsSt, p.DestacaIcmsSt,
		p.TemReducaoBase, p.TemDifal, p.DestacaDifal, p.IcmsTipoCalculo,
		p.IndicadorPresenca, p.IcmsStCredito, p.DifalResponsavel, p.DifalConsideraFcp, p.TemFcp,
		p.TemIpi, p.DestacaIpi, p.IpiSomaCusto, p.IpiGeraCredito, p.CstIpi, p.IpiTipoCalculo,
		p.CalculaPis, p.CstPis, p.CalculaCofins, p.CstCofins, p.PisCofinsRegime, p.PisCofinsBase,
		p.SomaStCusto, p.SomaIpiCusto, p.SomaFreteCusto, p.SomaDespesasCusto, p.SomaDifalCusto, p.FormaCustoMedio,
		p.AtualizaEstoque, p.TipoMovimentoEstoque, p.GeraFinanceiro, p.ReservaEstoque, p.BaixaEstoque,
		p.PermiteVendaNegativa,
		p.TravaSemNcm, p.TravaSemCest, p.TravaSemCfop, p.TravaSemCst,
		p.TipoMovimentacao, p.ComNotaFiscal, p.IncideSt)
	return err
}

func (m *MotorBD) ExcluirPerfilFiscal(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM perfis_fiscais WHERE id = $1", id)
	return err
}

func (m *MotorBD) ObterDescricaoCFOP(codigo string) string {
	cfops := map[string]string{
		"1101": "Compra para industrialização",
		"1102": "Compra para comercialização",
		"1124": "Industrialização efetuada por outra empresa",
		"1403": "Compra para comercialização em operação com mercadoria sujeita ao regime de substituição tributária",
		"1551": "Compra de bem para o ativo imobilizado",
		"1556": "Compra de material para uso ou consumo",
		"2101": "Compra para industrialização (Interestadual)",
		"2102": "Compra para comercialização (Interestadual)",
		"2403": "Compra para comercialização com ST (Interestadual)",
		"5101": "Venda de produção do estabelecimento",
		"5102": "Venda de mercadoria adquirida ou recebida de terceiros",
		"5401": "Venda de produção do estabelecimento em operação com mercadoria sujeita ao regime de substituição tributária",
		"5403": "Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária, na condição de contribuinte substituto",
		"5405": "Venda de mercadoria com substituição tributária, na condição de contribuinte substituído",
		"5656": "Venda de combustível ou lubrificante para consumidor ou usuário final",
		"5910": "Remessa em bonificação, doação ou brinde",
		"5911": "Remessa de mercadoria em demonstração",
		"5927": "Lançamento efetuado a título de baixa de estoque decorrente de perda, roubo ou deterioração",
		"6101": "Venda de produção do estabelecimento (Interestadual)",
		"6102": "Venda de mercadoria adquirida ou recebida de terceiros (Interestadual)",
		"6403": "Venda de mercadoria com ST (Interestadual)",
		"6404": "Venda de mercadoria sujeita ao regime de substituição tributária, cujo imposto já tenha sido retido anteriormente",
	}
	if desc, ok := cfops[codigo]; ok {
		return desc
	}
	return "CFOP NÃO LOCALIZADO NO DICIONÁRIO INTERNO"
}

// -----------------------------------------------------
// FORNECEDORES
// -----------------------------------------------------

func (m *MotorBD) ListarFornecedores() ([]Fornecedor, error) {
	rows, err := m.Conexao.Query("SELECT id, ativo, tipo_pessoa, COALESCE(logo, ''), documento, COALESCE(ie, ''), razao_social, COALESCE(fantasia, ''), COALESCE(cep, ''), COALESCE(endereco, ''), COALESCE(numero, ''), COALESCE(bairro, ''), COALESCE(cidade, ''), COALESCE(uf, ''), COALESCE(contatos::text, '[]'), COALESCE(criado_em::text, '') FROM fornecedores ORDER BY razao_social ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Fornecedor
	for rows.Next() {
		var f Fornecedor
		rows.Scan(&f.ID, &f.Ativo, &f.TipoPessoa, &f.Logo, &f.Documento, &f.IE, &f.RazaoSocial, &f.Fantasia, &f.CEP, &f.Endereco, &f.Numero, &f.Bairro, &f.Cidade, &f.UF, &f.Contatos, &f.CriadoEm)
		lista = append(lista, f)
	}
	if lista == nil { 
		lista = []Fornecedor{} 
	}
	return lista, nil
}

func (m *MotorBD) GetProximoIDFornecedor() (int, error) {
	var nID int
	err := m.Conexao.QueryRow("SELECT COALESCE(MAX(id), 0) + 1 FROM fornecedores").Scan(&nID)
	return nID, err
}

// -----------------------------------------------------
// ENTRADAS (COMPRAS)
// -----------------------------------------------------

func (m *MotorBD) ListarEntradas() ([]Entrada, error) {
	query := `
		SELECT 
			e.id, e.numero_nota, e.serie, e.fornecedor_id, COALESCE(f.razao_social, 'FORNECEDOR AVULSO'),
			to_char(e.data_emissao, 'DD/MM/YYYY'), to_char(e.data_entrada, 'DD/MM/YYYY HH24:MI'),
			e.valor_produtos, e.valor_frete, e.valor_ipi, e.valor_st, e.valor_total,
			e.status, COALESCE(e.observacao, '')
		FROM entradas e
		LEFT JOIN fornecedores f ON e.fornecedor_id = f.id
		ORDER BY e.data_entrada DESC
	`
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Entrada
	for rows.Next() {
		var e Entrada
		rows.Scan(
			&e.ID, &e.NumeroNota, &e.Serie, &e.FornecedorID, &e.FornecedorNome,
			&e.DataEmissao, &e.DataEntrada,
			&e.ValorProdutos, &e.ValorFrete, &e.ValorIPI, &e.ValorST, &e.ValorTotal,
			&e.Status, &e.Observacao,
		)
		lista = append(lista, e)
	}
	if lista == nil { 
		lista = []Entrada{} 
	}
	return lista, nil
}

func (m *MotorBD) ObterEntrada(id int) (Entrada, error) {
	var e Entrada
	err := m.Conexao.QueryRow(`
		SELECT 
			e.id, e.numero_nota, e.serie, e.fornecedor_id, COALESCE(f.razao_social, ''),
			to_char(e.data_emissao, 'YYYY-MM-DD'), e.valor_produtos, e.valor_frete, 
			e.valor_ipi, e.valor_st, e.valor_total, e.status, COALESCE(e.observacao, '')
		FROM entradas e
		LEFT JOIN fornecedores f ON e.fornecedor_id = f.id
		WHERE e.id = $1
	`, id).Scan(
		&e.ID, &e.NumeroNota, &e.Serie, &e.FornecedorID, &e.FornecedorNome,
		&e.DataEmissao, &e.ValorProdutos, &e.ValorFrete, &e.ValorIPI, &e.ValorST, &e.ValorTotal,
		&e.Status, &e.Observacao,
	)
	if err != nil {
		return e, err
	}

	// Buscar Itens
	rows, err := m.Conexao.Query(`
		SELECT 
			ei.id, ei.produto_id, p.sku, p.descricao_tecnica,
			ei.quantidade, ei.valor_unitario, ei.valor_total,
			ei.cfop, ei.cst, ei.base_icms, ei.valor_icms,
			ei.base_st, ei.valor_st, ei.valor_ipi, ei.ncm,
			COALESCE(ei.endereco_id, 0), COALESCE(end.nome, '')
		FROM entradas_itens ei
		INNER JOIN produtos p ON ei.produto_id = p.id
		LEFT JOIN enderecamentos end ON ei.endereco_id = end.id
		WHERE ei.entrada_id = $1
	`, id)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var it EntradaItem
			rows.Scan(
				&it.ID, &it.ProdutoID, &it.ProdutoSku, &it.ProdutoNome,
				&it.Quantidade, &it.ValorUnitario, &it.ValorTotal,
				&it.Cfop, &it.Cst, &it.BaseIcms, &it.ValorIcms,
				&it.BaseSt, &it.ValorSt, &it.ValorIpi, &it.Ncm,
				&it.EnderecoID, &it.EnderecoNome,
			)
			e.Itens = append(e.Itens, it)
		}
	}

	return e, nil
}

func (m *MotorBD) SalvarEntrada(e Entrada) (int, error) {
	tx, err := m.Conexao.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	var id int
	if e.ID == 0 {
		err = tx.QueryRow(`
			INSERT INTO entradas (
				numero_nota, serie, fornecedor_id, data_emissao, 
				valor_produtos, valor_frete, valor_ipi, valor_st, valor_total, observacao
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
		`, e.NumeroNota, e.Serie, e.FornecedorID, e.DataEmissao,
			e.ValorProdutos, e.ValorFrete, e.ValorIPI, e.ValorST, e.ValorTotal, e.Observacao).Scan(&id)
	} else {
		id = e.ID
		_, err = tx.Exec(`
			UPDATE entradas SET 
				numero_nota = $1, serie = $2, fornecedor_id = $3, data_emissao = $4,
				valor_produtos = $5, valor_frete = $6, valor_ipi = $7, valor_st = $8, 
				valor_total = $9, observacao = $10
			WHERE id = $11
		`, e.NumeroNota, e.Serie, e.FornecedorID, e.DataEmissao,
			e.ValorProdutos, e.ValorFrete, e.ValorIPI, e.ValorST, e.ValorTotal, e.Observacao, id)

		// Limpa itens para reinserir
		tx.Exec("DELETE FROM entradas_itens WHERE entrada_id = $1", id)
	}

	if err != nil {
		return 0, err
	}

	for _, it := range e.Itens {
		_, err = tx.Exec(`
			INSERT INTO entradas_itens (
				entrada_id, produto_id, quantidade, valor_unitario, valor_total,
				cfop, cst, base_icms, valor_icms, base_st, valor_st, valor_ipi, ncm, endereco_id
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
		`, id, it.ProdutoID, it.Quantidade, it.ValorUnitario, it.ValorTotal,
			it.Cfop, it.Cst, it.BaseIcms, it.ValorIcms, it.BaseSt, it.ValorSt, it.ValorIpi, it.Ncm, it.EnderecoID)
		if err != nil {
			return 0, err
		}
	}

	return id, tx.Commit()
}

func (m *MotorBD) ConfirmarEntrada(id int) error {
	tx, err := m.Conexao.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Obter Status atual
	var status string
	err = tx.QueryRow("SELECT status FROM entradas WHERE id = $1", id).Scan(&status)
	if err != nil {
		return err
	}
	if status != "PENDENTE" {
		return fmt.Errorf("apenas notas PENDENTES podem ser confirmadas")
	}

	// 2. Buscar Itens
	rows, err := tx.Query("SELECT produto_id, quantidade, valor_unitario, endereco_id FROM entradas_itens WHERE entrada_id = $1", id)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var prodID, endID int
		var qtd, valorUnit float64
		rows.Scan(&prodID, &qtd, &valorUnit, &endID)

		// A. Registrar Movimentação
		_, err = tx.Exec(`
			INSERT INTO movimentacoes_estoque (
				produto_id, endereco_id, tipo_movimentacao, quantidade, 
				situacao_origem, situacao_destino, documento_origem, modulo_origem
			) VALUES ($1, $2, 'ENTRADA', $3, 'DISPONIVEL', 'DISPONIVEL', $4, 'ENTRADAS')
		`, prodID, endID, qtd, fmt.Sprintf("NFE-%d", id))
		if err != nil {
			return err
		}

		// B. Atualizar Saldo (Snapshot)
		_, err = tx.Exec(`
			INSERT INTO saldos_estoque (produto_id, endereco_id, situacao, saldo)
			VALUES ($1, $2, 'DISPONIVEL', $3)
			ON CONFLICT (produto_id, endereco_id, situacao) 
			DO UPDATE SET saldo = saldos_estoque.saldo + EXCLUDED.saldo, atualizado_em = CURRENT_TIMESTAMP
		`, prodID, endID, qtd)
		if err != nil {
			return err
		}

		// C. Recalcular Custo Médio e Atualizar Custo Última Compra
		var custoAtual, estoqueAtual float64
		tx.QueryRow("SELECT custo, estoque_atual FROM produtos WHERE id = $1", prodID).Scan(&custoAtual, &estoqueAtual)

		novoCustoMedio := valorUnit
		if (estoqueAtual + qtd) > 0 {
			novoCustoMedio = ((custoAtual * estoqueAtual) + (valorUnit * qtd)) / (estoqueAtual + qtd)
		}

		_, err = tx.Exec(`
			UPDATE produtos SET 
				custo = $1, 
				estoque_atual = estoque_atual + $2,
				atualizado_em = CURRENT_TIMESTAMP
			WHERE id = $3
		`, novoCustoMedio, int(qtd), prodID)
		if err != nil {
			return err
		}
	}

	// 3. Atualizar Status da Nota
	_, err = tx.Exec("UPDATE entradas SET status = 'CONFIRMADA' WHERE id = $1", id)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (m *MotorBD) ParsearXMLNFe(caminho string) (Entrada, error) {
	fmt.Println("🔍 Abrindo arquivo:", caminho)
	xmlFile, err := os.Open(caminho)
	if err != nil {
		fmt.Println("❌ Erro ao abrir arquivo:", err)
		return Entrada{}, err
	}
	defer xmlFile.Close()

	byteValue, _ := io.ReadAll(xmlFile)
	var nfe NFeXML
	
	err = xml.Unmarshal(byteValue, &nfe)
	if err != nil {
		fmt.Println("❌ Erro no Unmarshal:", err)
	}

	var e Entrada
	e.ChaveAcesso = nfe.ProtNFe.InfProt.ChNFe
	e.NumeroNota = nfe.NFe.InfNFe.Ide.NNF
	e.Serie = nfe.NFe.InfNFe.Ide.Serie
	if e.ChaveAcesso == "" {
		// As vezes o xml root não é nfeProc, tenta pegar do Id da NFe
		if len(nfe.NFe.InfNFe.Id) > 3 {
			e.ChaveAcesso = nfe.NFe.InfNFe.Id[3:]
		}
	}
	
	if len(nfe.NFe.InfNFe.Ide.DhEmi) >= 10 {
		e.DataEmissao = nfe.NFe.InfNFe.Ide.DhEmi[:10]
		// Converte YYYY-MM-DD para DD/MM/YYYY
		e.DataEmissao = e.DataEmissao[8:10] + "/" + e.DataEmissao[5:7] + "/" + e.DataEmissao[:4]
	}

	e.ValorProdutos = nfe.NFe.InfNFe.Total.ICMSTot.VProd
	e.ValorFrete = nfe.NFe.InfNFe.Total.ICMSTot.VFrete
	e.ValorIPI = nfe.NFe.InfNFe.Total.ICMSTot.VIPI
	e.ValorST = nfe.NFe.InfNFe.Total.ICMSTot.VST
	e.ValorTotal = nfe.NFe.InfNFe.Total.ICMSTot.VNF

	if e.NumeroNota == "" {
		return e, fmt.Errorf("XML inválido ou vazio")
	}

	// BUSCAR FORNECEDOR (CONFRONTO DE CNPJ IGNORANDO PONTUAÇÃO)
	cnpjXML := nfe.NFe.InfNFe.Emit.CNPJ
	e.Cnpj = cnpjXML // Salva sempre o que veio no XML
	if cnpjXML != "" {
		var idExistente int
		var nomeExistente string
		queryF := `SELECT id, razao_social FROM fornecedores WHERE REPLACE(REPLACE(REPLACE(documento, '.', ''), '/', ''), '-', '') = $1`
		errF := m.Conexao.QueryRow(queryF, cnpjXML).Scan(&idExistente, &nomeExistente)
		if errF == nil {
			e.FornecedorID = idExistente
			e.FornecedorNome = nomeExistente
		} else {
			e.FornecedorID = 0
			e.FornecedorNome = nfe.NFe.InfNFe.Emit.XNome
			e.Observacao = "AVISO: FORNECEDOR NÃO CADASTRADO NO SISTEMA (CNPJ: " + cnpjXML + ")"
		}
	}

	// BUSCAR EMPRESA DESTINO (CONFRONTO EXATO DE LUGAR DE ENTRADA)
	cnpjDest := nfe.NFe.InfNFe.Dest.CNPJ
	e.CnpjDestino = cnpjDest
	if cnpjDest != "" {
		var idEmpresa int
		var nomeEmpresa string
		queryE := `SELECT id, razao_social FROM empresas WHERE REPLACE(REPLACE(REPLACE(cnpj, '.', ''), '/', ''), '-', '') = $1`
		errE := m.Conexao.QueryRow(queryE, cnpjDest).Scan(&idEmpresa, &nomeEmpresa)
		if errE == nil {
			e.EmpresaID = idEmpresa
			e.EmpresaNome = nomeEmpresa
		} else {
			e.EmpresaID = 0 // Empresa destino não cadastrada
			e.EmpresaNome = nfe.NFe.InfNFe.Dest.XNome
		}
	}

	for _, det := range nfe.NFe.InfNFe.Det {
		var it EntradaItem
		it.ProdutoSku = det.Prod.CProd
		it.ProdutoNome = det.Prod.XProd
		it.Quantidade = det.Prod.QCom
		it.Unidade = det.Prod.UCom
		it.Ean = det.Prod.CEAN
		it.ValorUnitario = det.Prod.VUnCom
		it.ValorDesconto = det.Prod.VDesc
		it.ValorTotal = det.Prod.VProd
		it.Ncm = det.Prod.NCM
		it.Cfop = det.Prod.CFOP
		
		// Coleta de CST e Impostos
		it.ValorIpi = det.Imposto.IPI.IPITrib.VIPI
		it.AliquotaIpi = det.Imposto.IPI.IPITrib.PIPI
		it.ValorSt = det.Imposto.ICMS.ICMSST.VICMSST
		
		// Descobrir o CST/CSOSN e bases que vieram no ICMS (heurística simples lendo as structs instanciadas)
		if det.Imposto.ICMS.ICMS00.CST != "" {
			it.Cst = det.Imposto.ICMS.ICMS00.CST
			it.BaseIcms = det.Imposto.ICMS.ICMS00.VBC
			it.ValorIcms = det.Imposto.ICMS.ICMS00.VICMS
			it.AliquotaIcms = det.Imposto.ICMS.ICMS00.PICMS
		} else if det.Imposto.ICMS.ICMS10.CST != "" {
			it.Cst = det.Imposto.ICMS.ICMS10.CST
			it.BaseIcms = det.Imposto.ICMS.ICMS10.VBC
			it.ValorIcms = det.Imposto.ICMS.ICMS10.VICMS
			it.AliquotaIcms = det.Imposto.ICMS.ICMS10.PICMS
		} else if det.Imposto.ICMS.ICMS20.CST != "" {
			it.Cst = det.Imposto.ICMS.ICMS20.CST
			it.BaseIcms = det.Imposto.ICMS.ICMS20.VBC
			it.ValorIcms = det.Imposto.ICMS.ICMS20.VICMS
			it.AliquotaIcms = det.Imposto.ICMS.ICMS20.PICMS
		} else if det.Imposto.ICMS.ICMS90.CST != "" {
			it.Cst = det.Imposto.ICMS.ICMS90.CST
			it.BaseIcms = det.Imposto.ICMS.ICMS90.VBC
			it.ValorIcms = det.Imposto.ICMS.ICMS90.VICMS
			it.AliquotaIcms = det.Imposto.ICMS.ICMS90.PICMS
		} else if det.Imposto.ICMS.ICMSSN101.CSOSN != "" {
			it.Cst = det.Imposto.ICMS.ICMSSN101.CSOSN
		} else if det.Imposto.ICMS.ICMSSN102.CSOSN != "" {
			it.Cst = det.Imposto.ICMS.ICMSSN102.CSOSN
		} else if det.Imposto.ICMS.ICMSSN900.CSOSN != "" {
			it.Cst = det.Imposto.ICMS.ICMSSN900.CSOSN
			it.BaseIcms = det.Imposto.ICMS.ICMSSN900.VBC
			it.ValorIcms = det.Imposto.ICMS.ICMSSN900.VICMS
			it.AliquotaIcms = det.Imposto.ICMS.ICMSSN900.PICMS
		}
		e.Itens = append(e.Itens, it)
	}

	return e, nil
}

func (m *MotorBD) GarantirFornecedor(cnpj, razao, fantasia, ie string) (int, string, error) {
	var id int
	var nomeReal string
	err := m.Conexao.QueryRow(`
		INSERT INTO fornecedores (documento, razao_social, fantasia, ie) 
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (documento) DO UPDATE SET razao_social = EXCLUDED.razao_social
		RETURNING id, razao_social
	`, cnpj, razao, fantasia, ie).Scan(&id, &nomeReal)
	return id, nomeReal, err
}


type MovimentacaoEstoqueDto struct {
	DataHora      string  `json:"data_hora"`
	Tipo          string  `json:"tipo"`
	Descricao     string  `json:"descricao"`
	Quantidade    float64 `json:"quantidade"`
	SaldoMomento  float64 `json:"saldo_momento"`
	Usuario       string  `json:"usuario"`
}

func (m *MotorBD) ListarMovimentacoesProduto(produtoID int) ([]MovimentacaoEstoqueDto, error) {
	query := `
		SELECT TO_CHAR(data_movimentacao, 'DD/MM/YYYY HH24:MI:SS'), tipo_movimentacao, 
		COALESCE(documento_origem, 'AJUSTE MANUAL'), quantidade, usuario, saldo_momento 
		FROM (
			SELECT 
				x.id, x.data_movimentacao, x.tipo_movimentacao, x.documento_origem, x.quantidade, 
				x.usuario,
				SUM(x.quantidade) OVER (ORDER BY x.data_movimentacao ASC, x.id ASC) as saldo_momento
			FROM (
				SELECT 
					m.id, m.data as data_movimentacao, m.tipo_movimento as tipo_movimentacao, m.documento_origem, m.quantidade, 
					COALESCE(u.nome, 'SISTEMA') as usuario
				FROM movimentacoes_estoque m
				LEFT JOIN usuarios u ON m.usuario_id = u.id
				WHERE m.produto_id = $1
				
				UNION ALL
				
				SELECT 
					(99999 + h.id) as id, h.data_hora as data_movimentacao, h.tipo as tipo_movimentacao, 
					h.descricao as documento_origem, 0.00 as quantidade, 
					COALESCE(h.usuario, 'SISTEMA') as usuario
				FROM historico_produto h
				WHERE h.produto_id = $1 AND NOT EXISTS (
					SELECT 1 FROM movimentacoes_estoque me 
					WHERE me.produto_id = h.produto_id AND me.tipo_movimento = h.tipo AND me.quantidade = 0
				)
			) x
		) sub
		ORDER BY sub.data_movimentacao DESC, sub.id DESC LIMIT 50;
	`
	rows, err := m.Conexao.Query(query, produtoID)
	if err != nil { return nil, err }
	defer rows.Close()

	var lista []MovimentacaoEstoqueDto
	for rows.Next() {
		var mov MovimentacaoEstoqueDto
		rows.Scan(&mov.DataHora, &mov.Tipo, &mov.Descricao, &mov.Quantidade, &mov.Usuario, &mov.SaldoMomento)
		lista = append(lista, mov)
	}
	return lista, nil
}

// --- MÉTODOS DE FILTROS AVANÇADOS RELACIONAIS (V60) ---

func (m *MotorBD) ObterMarcasVeiculos() ([]string, error) {
	rows, err := m.Conexao.Query("SELECT DISTINCT marca FROM aplicacoes_produto WHERE marca != '' ORDER BY marca ASC")
	if err != nil { return nil, err }
	defer rows.Close()
	var lista []string
	for rows.Next() {
		var s string
		rows.Scan(&s)
		lista = append(lista, s)
	}
	return lista, nil
}

func (m *MotorBD) ObterModelosVeiculos(marca string) ([]string, error) {
	query := "SELECT DISTINCT modelo FROM aplicacoes_produto WHERE modelo != ''"
	var args []interface{}
	if marca != "" && marca != "Todas" {
		query += " AND marca = $1"
		args = append(args, marca)
	}
	query += " ORDER BY modelo ASC"
	rows, err := m.Conexao.Query(query, args...)
	if err != nil { return nil, err }
	defer rows.Close()
	var lista []string
	for rows.Next() {
		var s string
		rows.Scan(&s)
		lista = append(lista, s)
	}
	return lista, nil
}

func (m *MotorBD) ObterVersoesAnosVeiculos(marca, modelo string) ([]string, error) {
	query := "SELECT DISTINCT motor FROM aplicacoes_produto WHERE motor != ''"
	var args []interface{}
	idx := 1
	if marca != "" && marca != "Todas" {
		query += fmt.Sprintf(" AND marca = $%d", idx)
		args = append(args, marca)
		idx++
	}
	if modelo != "" && modelo != "Todos" {
		query += fmt.Sprintf(" AND modelo = $%d", idx)
		args = append(args, modelo)
		idx++
	}
	query += " ORDER BY motor ASC"
	rows, err := m.Conexao.Query(query, args...)
	if err != nil { return nil, err }
	defer rows.Close()
	var lista []string
	for rows.Next() {
		var s string
		rows.Scan(&s)
		lista = append(lista, s)
	}
	return lista, nil
}

func (m *MotorBD) PesquisarProdutosAvancado(f FiltrosProdutos) ([]Produto, error) {
	sql := `
		SELECT DISTINCT
			p.id, p.sku, COALESCE(p.ean, ''), COALESCE(p.descricao_tecnica, ''),
			COALESCE(p.marca_id, 0), COALESCE(mrc.nome, '') as marca_nome,
			COALESCE(p.categoria_id, 0), COALESCE(c.nome, '') as categoria_nome,
			COALESCE(p.subcategoria_id, 0), COALESCE(s.nome, '') as subcategoria_nome,
			COALESCE(p.deposito_id, 0),
			COALESCE(p.custo, 0.0), COALESCE(p.venda, 0.0), COALESCE(p.estoque_atual, 0), COALESCE(p.estoque_minimo, 0), COALESCE(p.localizacao, ''),
			COALESCE(p.nome_popular, ''),
			COALESCE(to_char(p.criado_em, 'DD/MM/YYYY'), ''), COALESCE(to_char(p.atualizado_em, 'DD/MM/YYYY'), ''),
			COALESCE(p.unidade_id, 0), COALESCE(u.sigla, 'UN'),
			COALESCE(p.fator_conversao, 1.0), COALESCE(p.peso, 0.0),
			COALESCE(p.ncm, ''), COALESCE(p.cest, ''), COALESCE(p.origem, 0),
			COALESCE(p.cfop, ''), COALESCE(p.cst_csosn, ''),
			COALESCE(p.perfil_fiscal_id, 0), COALESCE(pf.nome, ''),
			COALESCE(p.ativo, true)
		FROM produtos p
		LEFT JOIN marcas mrc ON p.marca_id = mrc.id
		LEFT JOIN categorias c ON p.categoria_id = c.id
		LEFT JOIN subcategorias s ON p.subcategoria_id = s.id
		LEFT JOIN unidades_medida u ON p.unidade_id = u.id
		LEFT JOIN perfis_fiscais pf ON p.perfil_fiscal_id = pf.id
		LEFT JOIN aplicacoes_produto ap ON p.id = ap.produto_id
		LEFT JOIN conversoes conv ON p.id = conv.produto_id
		WHERE 1=1
	`
	var args []interface{}
	argIdx := 1

	if f.Descricao != "" {
		sql += fmt.Sprintf(" AND (p.descricao_tecnica ILIKE $%d OR p.nome_popular ILIKE $%d)", argIdx, argIdx)
		args = append(args, "%"+f.Descricao+"%")
		argIdx++
	}
	if f.CodFabricante != "" {
		sql += fmt.Sprintf(" AND p.sku ILIKE $%d", argIdx)
		args = append(args, "%"+f.CodFabricante+"%")
		argIdx++
	}
	if f.MarcaVeiculo != "" && f.MarcaVeiculo != "Todas" {
		sql += fmt.Sprintf(" AND ap.marca = $%d", argIdx)
		args = append(args, f.MarcaVeiculo)
		argIdx++
	}
	if f.ModeloVeiculo != "" && f.ModeloVeiculo != "Todos" {
		sql += fmt.Sprintf(" AND ap.modelo = $%d", argIdx)
		args = append(args, f.ModeloVeiculo)
		argIdx++
	}
	if f.MarcaPeca != "" && f.MarcaPeca != "Todas" {
		sql += fmt.Sprintf(" AND mrc.nome = $%d", argIdx)
		args = append(args, f.MarcaPeca)
		argIdx++
	}
	if f.Localizacao != "" {
		sql += fmt.Sprintf(" AND p.localizacao ILIKE $%d", argIdx)
		args = append(args, "%"+f.Localizacao+"%")
		argIdx++
	}
	if f.CodBarras != "" {
		sql += fmt.Sprintf(" AND p.ean ILIKE $%d", argIdx)
		args = append(args, "%"+f.CodBarras+"%")
		argIdx++
	}
	if f.SimilarDe != "" {
		sql += fmt.Sprintf(" AND (conv.codigo_concorrente ILIKE $%d)", argIdx)
		args = append(args, "%"+f.SimilarDe+"%")
		argIdx++
	}
	if f.FiltrarSaldo == "COM_SALDO" {
		sql += " AND p.estoque_atual > 0"
	} else if f.FiltrarSaldo == "SEM_SALDO" {
		sql += " AND p.estoque_atual <= 0"
	}

	sql += " ORDER BY p.id ASC LIMIT 100"

	rows, err := m.Conexao.Query(sql, args...)
	if err != nil { return nil, err }
	defer rows.Close()

	var lista []Produto
	for rows.Next() {
		var p Produto
		err := rows.Scan(
			&p.ID, &p.Sku, &p.Ean, &p.DescricaoTecnica,
			&p.MarcaID, &p.MarcaNome,
			&p.CategoriaID, &p.CategoriaNome,
			&p.SubcategoriaID, &p.SubcategoriaNome,
			&p.DepositoID,
			&p.Custo, &p.Venda, &p.EstoqueAtual, &p.EstoqueMinimo, &p.Localizacao,
			&p.NomePopular,
			&p.CriadoEm, &p.AtualizadoEm,
			&p.UnidadeID, &p.UnidadeSigla,
			&p.FatorConversao, &p.Peso,
			&p.Ncm, &p.Cest, &p.Origem, &p.Cfop, &p.CstCsosn,
			&p.PerfilFiscalID, &p.PerfilFiscalNome,
			&p.Ativo,
		)
		if err == nil {
			lista = append(lista, p)
		}
	}
	return lista, nil
}


func (m *MotorBD) SalvarFornecedor(f Fornecedor) (int, error) {
var id int
	err := m.Conexao.QueryRow(`
INSERT INTO fornecedores (ativo, tipo_pessoa, logo, documento, ie, razao_social, fantasia, cep, endereco, numero, bairro, cidade, uf, contatos) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)
ON CONFLICT (documento) DO UPDATE SET 
            ativo = EXCLUDED.ativo,
            tipo_pessoa = EXCLUDED.tipo_pessoa,
            logo = EXCLUDED.logo,
            ie = EXCLUDED.ie,
            razao_social = EXCLUDED.razao_social,
            fantasia = EXCLUDED.fantasia,
            cep = EXCLUDED.cep,
            endereco = EXCLUDED.endereco,
            numero = EXCLUDED.numero,
            bairro = EXCLUDED.bairro,
            cidade = EXCLUDED.cidade,
            uf = EXCLUDED.uf,
            contatos = EXCLUDED.contatos
RETURNING id
	`, f.Ativo, f.TipoPessoa, f.Logo, f.Documento, f.IE, f.RazaoSocial, f.Fantasia, f.CEP, f.Endereco, f.Numero, f.Bairro, f.Cidade, f.UF, f.Contatos).Scan(&id)
return id, err
}
