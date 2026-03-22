package motor

import (
	"encoding/xml"
	"fmt"
	"io"
	"os"
)

// Estruturas de Dados
type Marca struct {
	ID       int     `json:"id"`
	Nome     string  `json:"nome"`
	Margem   float64 `json:"margem"`
	CriadoEm string  `json:"criado_em"`
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
	ID         int     `json:"id"`
	Nome       string  `json:"nome"`
	Operacao   string  `json:"operacao"` // ENTRADA ou SAIDA
	IcmsAliq   float64 `json:"icms_aliq"`
	TemST      bool    `json:"tem_st"`
	IpiAliq    float64 `json:"ipi_aliq"`
	PisAliq    float64 `json:"pis_aliq"`
	CofinsAliq float64 `json:"cofins_aliq"`
	CfopPadrao string  `json:"cfop_padrao"`
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
}

type Fornecedor struct {
	ID          int    `json:"id"`
	RazaoSocial string `json:"razao_social"`
	Fantasia    string `json:"fantasia"`
	Cnpj        string `json:"cnpj"`
	IE          string `json:"ie"`
	Cidade      string `json:"cidade"`
	UF          string `json:"uf"`
}

type Entrada struct {
	ID             int           `json:"id"`
	NumeroNota     string        `json:"numero_nota"`
	Serie          string        `json:"serie"`
	FornecedorID   int           `json:"fornecedor_id"`
	FornecedorNome string        `json:"fornecedor_nome"`
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
	ValorUnitario float64 `json:"valor_unitario"`
	ValorTotal    float64 `json:"valor_total"`
	Cfop          string  `json:"cfop"`
	Cst           string  `json:"cst"`
	BaseIcms      float64 `json:"base_icms"`
	ValorIcms     float64 `json:"valor_icms"`
	BaseSt        float64 `json:"base_st"`
	ValorSt       float64 `json:"valor_st"`
	ValorIpi      float64 `json:"valor_ipi"`
	Ncm           string  `json:"ncm"`
	EnderecoID    int     `json:"endereco_id"`
	EnderecoNome  string  `json:"endereco_nome"`
}

// Estrutura para leitura de XML NF-e (Simplificada para ERP)
type NFeXML struct {
	NFe struct {
		InfNFe struct {
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
					CEAN   string  `xml:"cEAN"`
				} `xml:"prod"`
				Imposto struct {
					IPI struct {
						IPITrib struct {
							VIPI float64 `xml:"vIPI"`
						} `xml:"IPITrib"`
					} `xml:"IPI"`
					ICMS struct {
						ICMS00 struct {
							VBC   float64 `xml:"vBC"`
							VICMS float64 `xml:"vICMS"`
						} `xml:"ICMS00"`
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
}

// -----------------------------------------------------
// MARCAS
// -----------------------------------------------------

func (m *MotorBD) ListarMarcas() ([]Marca, error) {
	query := `SELECT id, nome, margem, to_char(criado_em, 'DD/MM/YYYY') FROM marcas ORDER BY id ASC`
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Marca
	for rows.Next() {
		var item Marca
		if err := rows.Scan(&item.ID, &item.Nome, &item.Margem, &item.CriadoEm); err != nil {
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
		INSERT INTO marcas (nome, margem) VALUES ($1, $2)
		ON CONFLICT (nome) DO UPDATE SET margem = EXCLUDED.margem
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

func (m *MotorBD) SalvarCategoria(nome string) error {
	_, err := m.Conexao.Exec(`
		INSERT INTO categorias (nome) VALUES ($1)
		ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
	`, nome)
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

func (m *MotorBD) SalvarSubcategoria(categoriaId int, nome string) error {
	_, err := m.Conexao.Exec(`
		INSERT INTO subcategorias (categoria_id, nome) VALUES ($1, $2)
		ON CONFLICT (categoria_id, nome) DO UPDATE SET nome = EXCLUDED.nome
	`, categoriaId, nome)
	return err
}

func (m *MotorBD) ExcluirSubcategoria(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM subcategorias WHERE id = $1", id)
	return err
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
			criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
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
		`CREATE TABLE IF NOT EXISTS produtos_similares (
			produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
			similar_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
			PRIMARY KEY (produto_id, similar_id)
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
		
		// NOVOS CAMPOS FISCAIS (V55)
		`CREATE TABLE IF NOT EXISTS perfis_fiscais (
			id SERIAL PRIMARY KEY,
			nome VARCHAR(100) UNIQUE NOT NULL,
			descricao TEXT
		);`,
		`INSERT INTO perfis_fiscais (nome, descricao) VALUES 
		('Autopeça com ST', 'Peças automotivas sujeitas a Substituição Tributária'),
		('Autopeça sem ST', 'Peças automotivas com tributação normal de ICMS'),
		('Lubrificante', 'Óleos e lubrificantes com regramento ANP'),
		('Uso e Consumo', 'Itens destinados ao consumo interno ou imobilizado'),
		('Importado', 'Itens com origem estrangeira e tributação diferenciada')
		ON CONFLICT (nome) DO NOTHING;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS perfil_fiscal_id INT REFERENCES perfis_fiscais(id);`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tem_icms BOOLEAN DEFAULT TRUE;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tem_st BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tem_ipi BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tem_pis_cofins BOOLEAN DEFAULT TRUE;`,
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
			p.id, p.sku, COALESCE(p.ean, ''), p.descricao_tecnica,
			p.marca_id, mrc.nome as marca_nome,
			p.categoria_id, c.nome as categoria_nome,
			p.subcategoria_id, s.nome as subcategoria_nome,
			COALESCE(p.deposito_id, 0),
			p.custo, p.venda, p.estoque_atual, p.estoque_minimo, COALESCE(p.localizacao, ''),
			COALESCE(p.nome_popular, ''),
			to_char(p.criado_em, 'DD/MM/YYYY'), to_char(p.atualizado_em, 'DD/MM/YYYY'),
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
			COALESCE(p.tem_ipi, false), COALESCE(p.tem_pis_cofins, true)
		FROM produtos p
		INNER JOIN marcas mrc ON p.marca_id = mrc.id
		INNER JOIN categorias c ON p.categoria_id = c.id
		INNER JOIN subcategorias s ON p.subcategoria_id = s.id
		LEFT JOIN unidades_medida u ON p.unidade_id = u.id
		LEFT JOIN perfis_fiscais pf ON p.perfil_fiscal_id = pf.id
		ORDER BY p.id DESC`
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
			&item.TemIcms, &item.TemSt, &item.TemIpi, &item.TemPisCofins,
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

func (m *MotorBD) SalvarProduto(p Produto) (int, error) {
	var id int
	if p.ID == 0 {
		err := m.Conexao.QueryRow(`
			INSERT INTO produtos (
				sku, ean, descricao_tecnica, marca_id, categoria_id, subcategoria_id,
				deposito_id, custo, venda, estoque_atual, estoque_minimo, localizacao, 
				nome_popular, unidade_id, fator_conversao, peso, altura, largura, comprimento,
				ncm, cest, origem, cfop, cst_csosn, aliquota_icms, aliquota_ipi, aliquota_pis, aliquota_cofins, reducao_bc,
				perfil_fiscal_id, tem_icms, tem_st, tem_ipi, tem_pis_cofins
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34) RETURNING id
		`, p.Sku, p.Ean, p.DescricaoTecnica, p.MarcaID, p.CategoriaID, p.SubcategoriaID,
			p.DepositoID, p.Custo, p.Venda, p.EstoqueAtual, p.EstoqueMinimo, p.Localizacao, 
			p.NomePopular, p.UnidadeID, p.FatorConversao, p.Peso, p.Altura, p.Largura, p.Comprimento,
			p.Ncm, p.Cest, p.Origem, p.Cfop, p.CstCsosn, p.AliquotaIcms, p.AliquotaIpi, p.AliquotaPis, p.AliquotaCofins, p.ReducaoBc,
			p.PerfilFiscalID, p.TemIcms, p.TemSt, p.TemIpi, p.TemPisCofins).Scan(&id)
		if err != nil {
			return 0, err
		}
	} else {
		_, err := m.Conexao.Exec(`
			UPDATE produtos SET 
				sku = $1, ean = $2, descricao_tecnica = $3, marca_id = $4,
				categoria_id = $5, subcategoria_id = $6, deposito_id = $7, custo = $8, venda = $9,
				estoque_atual = $10, estoque_minimo = $11, localizacao = $12, nome_popular = $13,
				unidade_id = $14, fator_conversao = $15, peso = $16, altura = $17, largura = $18, comprimento = $19,
				ncm = $20, cest = $21, origem = $22, cfop = $23, cst_csosn = $24,
				aliquota_icms = $25, aliquota_ipi = $26, aliquota_pis = $27, aliquota_cofins = $28, reducao_bc = $29,
				perfil_fiscal_id = $30, tem_icms = $31, tem_st = $32, tem_ipi = $33, tem_pis_cofins = $34,
				atualizado_em = CURRENT_TIMESTAMP
			WHERE id = $35
		`, p.Sku, p.Ean, p.DescricaoTecnica, p.MarcaID, p.CategoriaID, p.SubcategoriaID,
			p.DepositoID, p.Custo, p.Venda, p.EstoqueAtual, p.EstoqueMinimo, p.Localizacao, 
			p.NomePopular, p.UnidadeID, p.FatorConversao, p.Peso, p.Altura, p.Largura, p.Comprimento,
			p.Ncm, p.Cest, p.Origem, p.Cfop, p.CstCsosn, p.AliquotaIcms, p.AliquotaIpi, p.AliquotaPis, p.AliquotaCofins, p.ReducaoBc,
			p.PerfilFiscalID, p.TemIcms, p.TemSt, p.TemIpi, p.TemPisCofins, p.ID)
		if err != nil {
			return 0, err
		}
		id = p.ID
	}
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
		SELECT id, nome, operacao, icms_aliq, tem_st, ipi_aliq, pis_aliq, cofins_aliq, COALESCE(cfop_padrao, '') 
		FROM perfis_fiscais ORDER BY id ASC`)
	if err != nil {
		fmt.Printf("Erro ao listar perfis fiscais: %v\n", err)
		return nil, err
	}
	defer rows.Close()

	var lista []PerfilFiscal
	for rows.Next() {
		var item PerfilFiscal
		if err := rows.Scan(&item.ID, &item.Nome, &item.Operacao, &item.IcmsAliq, &item.TemST, &item.IpiAliq, &item.PisAliq, &item.CofinsAliq, &item.CfopPadrao); err != nil {
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
		_, err := m.Conexao.Exec(`
			UPDATE perfis_fiscais SET 
				nome=$1, operacao=$2, icms_aliq=$3, tem_st=$4, ipi_aliq=$5, pis_aliq=$6, cofins_aliq=$7, cfop_padrao=$8
			WHERE id=$9`, 
			p.Nome, p.Operacao, p.IcmsAliq, p.TemST, p.IpiAliq, p.PisAliq, p.CofinsAliq, p.CfopPadrao, p.ID)
		return err
	}
	_, err := m.Conexao.Exec(`
		INSERT INTO perfis_fiscais (nome, operacao, icms_aliq, tem_st, ipi_aliq, pis_aliq, cofins_aliq, cfop_padrao)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		p.Nome, p.Operacao, p.IcmsAliq, p.TemST, p.IpiAliq, p.PisAliq, p.CofinsAliq, p.CfopPadrao)
	return err
}

func (m *MotorBD) ExcluirPerfilFiscal(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM perfis_fiscais WHERE id = $1", id)
	return err
}

// -----------------------------------------------------
// FORNECEDORES
// -----------------------------------------------------

func (m *MotorBD) ListarFornecedores() ([]Fornecedor, error) {
	rows, err := m.Conexao.Query("SELECT id, razao_social, fantasia, cnpj, ie, cidade, uf FROM fornecedores ORDER BY razao_social ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Fornecedor
	for rows.Next() {
		var f Fornecedor
		rows.Scan(&f.ID, &f.RazaoSocial, &f.Fantasia, &f.Cnpj, &f.IE, &f.Cidade, &f.UF)
		lista = append(lista, f)
	}
	if lista == nil { 
		lista = []Fornecedor{} 
	}
	return lista, nil
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
	e.NumeroNota = nfe.NFe.InfNFe.Ide.NNF
	e.Serie = nfe.NFe.InfNFe.Ide.Serie
	
	if len(nfe.NFe.InfNFe.Ide.DhEmi) >= 10 {
		e.DataEmissao = nfe.NFe.InfNFe.Ide.DhEmi[:10]
	}

	e.ValorProdutos = nfe.NFe.InfNFe.Total.ICMSTot.VProd
	e.ValorFrete = nfe.NFe.InfNFe.Total.ICMSTot.VFrete
	e.ValorIPI = nfe.NFe.InfNFe.Total.ICMSTot.VIPI
	e.ValorST = nfe.NFe.InfNFe.Total.ICMSTot.VST
	e.ValorTotal = nfe.NFe.InfNFe.Total.ICMSTot.VNF

	if e.NumeroNota == "" {
		return e, fmt.Errorf("XML inválido ou vazio")
	}

	// BUSCAR FORNECEDOR (SEM CADASTRAR SOZINHO)
	cnpjXML := nfe.NFe.InfNFe.Emit.CNPJ
	if cnpjXML != "" {
		var idExistente int
		var nomeExistente string
		errF := m.Conexao.QueryRow(`SELECT id, razao_social FROM fornecedores WHERE cnpj = $1`, cnpjXML).Scan(&idExistente, &nomeExistente)
		if errF == nil {
			e.FornecedorID = idExistente
			e.FornecedorNome = nomeExistente
		} else {
			// Não achou. Retornamos o nome que veio no XML para o frontend saber quem é
			e.FornecedorID = 0
			e.FornecedorNome = nfe.NFe.InfNFe.Emit.XNome
			e.Observacao = "AVISO: FORNECEDOR NÃO CADASTRADO NO SISTEMA (CNPJ: " + cnpjXML + ")"
		}
	}

	for _, det := range nfe.NFe.InfNFe.Det {
		var it EntradaItem
		it.ProdutoSku = det.Prod.CProd
		it.ProdutoNome = det.Prod.XProd
		it.Quantidade = det.Prod.QCom
		it.ValorUnitario = det.Prod.VUnCom
		it.ValorTotal = det.Prod.VProd
		it.Ncm = det.Prod.NCM
		it.Cfop = det.Prod.CFOP
		it.ValorIpi = det.Imposto.IPI.IPITrib.VIPI
		it.ValorSt = det.Imposto.ICMS.ICMSST.VICMSST
		e.Itens = append(e.Itens, it)
	}

	return e, nil
}

func (m *MotorBD) GarantirFornecedor(cnpj, razao, fantasia, ie string) (int, string, error) {
	var id int
	var nomeReal string
	err := m.Conexao.QueryRow(`
		INSERT INTO fornecedores (cnpj, razao_social, fantasia, ie) 
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (cnpj) DO UPDATE SET razao_social = EXCLUDED.razao_social
		RETURNING id, razao_social
	`, cnpj, razao, fantasia, ie).Scan(&id, &nomeReal)
	return id, nomeReal, err
}
