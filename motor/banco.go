package motor

import (
	"database/sql"
	"fmt"
	"sort"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// MotorBD: Estrutura central para gerenciar o Banco de Dados (PostgreSQL)
type MotorBD struct {
	Conexao *sql.DB
}

// Empresa representa a estrutura da tabela no banco
type Empresa struct {
	ID                int    `json:"id"`
	RazaoSocial       string `json:"razao_social"`
	Fantasia          string `json:"fantasia"`
	CNPJ              string `json:"cnpj"`
	InscricaoEstadual string `json:"inscricao_estadual"`
	RegimeTributario  string `json:"regime_tributario"`
	Logradouro        string `json:"logradouro"`
	Numero            string `json:"numero"`
	Complemento       string `json:"complemento"`
	Bairro            string `json:"bairro"`
	Cidade            string `json:"cidade"`
	UF                string `json:"uf"`
	CEP               string `json:"cep"`
	Telefone          string `json:"telefone"`
	Tipo              string `json:"tipo"`
	CnaePrincipal     string `json:"cnae_principal"`
	CnaeSecundarios   string `json:"cnae_secundarios"`
	IsMatriz               bool   `json:"is_matriz"`
	MatrizID               int    `json:"matriz_id"`
	UsaEstoqueCompartilhado bool   `json:"usa_estoque_compartilhado"`
	EstoqueID               int    `json:"estoque_id"`
}

// Enderecamento representa um nível da árvore logística (Galpão, Rua, etc)
type Enderecamento struct {
	ID                int    `json:"id"`
	EmpresaID         int    `json:"empresa_id"`
	ParentID          *int   `json:"parent_id"` // Nulo se for filho direto da empresa
	Nome              string `json:"nome"`
	Codigo            string `json:"codigo"` // Código curto (Ex: G01, R10)
	Tipo              string `json:"tipo"`
	EnderecoLogistico string `json:"endereco_logistico"` // Caminho completo (Ex: G01-R10)
	Nivel             int    `json:"nivel"`
}

// ContextoFiscal: Conjunto de variáveis que definem uma operação em tempo real (Parte 2)
type ContextoFiscal struct {
	RegimeTributario string `json:"regime_tributario"` // SIMPLES, PRESUMIDO, REAL
	Operacao         string `json:"operacao"`          // ENTRADA, SAIDA
	UFOrigem         string `json:"uf_origem"`         // EX: SP
	UFDestino        string `json:"uf_destino"`        // EX: MG
	TipoDestino      string `json:"tipo_destino"`      // INTERNA, INTERESTADUAL, INTERNACIONAL
	IncidenciaST     bool   `json:"incidencia_st"`     // True se o item tem ST
	Ncm              string `json:"ncm"`               // EX: 8708.99.00
}

// MatrizFiscal: Tabela de decisão tributária simplificada (Regra de faturamento)
type MatrizFiscal struct {
	ID               int    `json:"id"`
	Nome             string `json:"nome"`
	Ativa            bool   `json:"ativa"`

	// CONDIÇÕES (Filtros de Decisão)
	RegimeTributario string `json:"regime_tributario"` // SIMPLES, PRESUMIDO, REAL, TODOS
	Operacao         string `json:"operacao"`          // ENTRADA, SAIDA, TODAS
	TipoDestino      string `json:"tipo_destino"`      // INTERNA, INTERESTADUAL, INTERNACIONAL, TODOS
	IncidenciaST     string `json:"incidencia_st"`     // SIM, NAO, TODOS
	Ncm              string `json:"ncm"`               // Prefixo ou Completo
	Prioridade       string `json:"prioridade"`        // PADRÃO, ALTA, CRÍTICA (Peso no DB: 10/50/100)

	// RESULTADOS (O que a regra devolve)
	Cfop             string `json:"cfop"`
	CstCsosn         string `json:"cst_csosn"`
	DestacaIcms      bool   `json:"destaca_icms"`
	CreditoIcms      bool   `json:"credito_icms"`
	IncideIpi        bool   `json:"incide_ipi"`
	IncidePis        bool   `json:"incide_pis"`
	IncideCofins     bool   `json:"incide_cofins"`
	IncideDifal      bool   `json:"incide_difal"`
}

// AliquotaFiscal: Define os percentuais dos impostos (Parte 3)
type AliquotaFiscal struct {
	ID               int     `json:"id"`
	Nome             string  `json:"nome"`

	// CONDIÇÕES (Filtros de Decisão)
	RegimeTributario string  `json:"regime_tributario"` // SIMPLES, PRESUMIDO, REAL, TODOS
	TipoDestino      string  `json:"tipo_destino"`      // INTERNA, INTERESTADUAL, INTERNACIONAL, TODOS
	IncidenciaST     string  `json:"incidencia_st"`     // SIM, NAO, TODOS
	Ncm              string  `json:"ncm"`               // Prefixo opcional
	Cfop             string  `json:"cfop"`              // Opcional
	CstCsosn         string  `json:"cst_csosn"`         // Opcional

	// RESULTADOS (Percentuais)
	AliquotaIcms    float64 `json:"aliquota_icms"`
	AliquotaIcmsSt  float64 `json:"aliquota_icms_st"`
	AliquotaIpi     float64 `json:"aliquota_ipi"`
	AliquotaPis     float64 `json:"aliquota_pis"`
	AliquotaCofins  float64 `json:"aliquota_cofins"`
	AliquotaDifal   float64 `json:"aliquota_difal"`
	AliquotaFcp     float64 `json:"aliquota_fcp"`

	// CONTROLE
	Prioridade      string  `json:"prioridade"`        // PADRÃO, ALTA, CRÍTICA
	Ativa           bool    `json:"ativa"`
}

// NovoMotor: Inicializa a conexão com o PostgreSQL
func NovoMotor(stringConexao string) (*MotorBD, error) {
	db, err := sql.Open("pgx", stringConexao)
	if err != nil {
		return nil, fmt.Errorf("Erro ao abrir conexão: %v", err)
	}

	// Testa a conexão
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("Erro ao conectar no Postgres: %v", err)
	}

	// Reset da sequência de usuários baseado no maior ID existente para garantir continuidade perfeita
	_, _ = db.Exec("SELECT setval('usuarios_id_seq', (SELECT COALESCE(MAX(id), 0) FROM usuarios) + 1, false)")

	return &MotorBD{Conexao: db}, nil
}

func (m *MotorBD) Notificar(canal string, payload string) {
	if m.Conexao != nil {
		m.Conexao.Exec(fmt.Sprintf("NOTIFY %s, '%s'", canal, payload))
	}
}

func (m *MotorBD) CriarTabelasIniciais(schema string) error {
	if schema != "" {
		_, err := m.Conexao.Exec(schema)
		if err != nil {
			return fmt.Errorf("Erro ao executar schema: %v", err)
		}
	}

	// m.Conexao.Exec("DROP TABLE IF EXISTS empresas CASCADE;")
	// m.Conexao.Exec("TRUNCATE TABLE empresas RESTART IDENTITY CASCADE;")
	m.Conexao.Exec("ALTER TABLE empresas ADD COLUMN IF NOT EXISTS tipo TEXT;")
	m.Conexao.Exec("ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cnae_principal TEXT;")
	m.Conexao.Exec("ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cnae_secundarios TEXT;")
	m.Conexao.Exec("ALTER TABLE empresas ADD COLUMN IF NOT EXISTS is_matriz BOOLEAN DEFAULT false;")
	m.Conexao.Exec("ALTER TABLE empresas ADD COLUMN IF NOT EXISTS matriz_id INTEGER;")
	m.Conexao.Exec("ALTER TABLE empresas ADD COLUMN IF NOT EXISTS usa_estoque_compartilhado BOOLEAN DEFAULT FALSE;")
	m.Conexao.Exec("ALTER TABLE empresas ADD COLUMN IF NOT EXISTS estoque_id INTEGER DEFAULT 0;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS tipo_destino TEXT DEFAULT 'TODAS';")
    
	// Auto-migrations de Usuários
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS sobrenome TEXT;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cpf TEXT;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rg TEXT;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS data_nascimento DATE;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS data_admissao DATE;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cep TEXT;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS logradouro TEXT;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS numero TEXT;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS complemento TEXT;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bairro TEXT;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cidade TEXT;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS uf TEXT;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS funcao_id INTEGER;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMP;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS precisa_alterar_senha BOOLEAN DEFAULT true;")
	m.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;")

	// Trigger para ID de Usuários 100% Sequencial (livre de Gaps de Serial)
	m.Conexao.Exec(`
		CREATE OR REPLACE FUNCTION set_usuario_seq_id() RETURNS TRIGGER AS $$
		BEGIN
			NEW.id := COALESCE((SELECT MAX(id) FROM usuarios), 0) + 1;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
		
		DROP TRIGGER IF EXISTS trg_usuarios_seq ON usuarios;
		CREATE TRIGGER trg_usuarios_seq BEFORE INSERT ON usuarios 
		FOR EACH ROW EXECUTE FUNCTION set_usuario_seq_id();
	`)
	
    // TABELA DE ALÍQUOTAS (TERCEIRO PILAR - Parte 3)
	m.Conexao.Exec(`
		CREATE TABLE IF NOT EXISTS aliquotas_fiscais (
			id SERIAL PRIMARY KEY,
			nome TEXT NOT NULL,
			regime_tributario TEXT DEFAULT 'TODOS',
			tipo_destino TEXT DEFAULT 'TODOS',
			incidencia_st TEXT DEFAULT 'TODOS',
			ncm TEXT,
			cfop TEXT,
			cst_csosn TEXT,
			aliquota_icms DECIMAL(10,2) DEFAULT 0,
			aliquota_icms_st DECIMAL(10,2) DEFAULT 0,
			aliquota_ipi DECIMAL(10,2) DEFAULT 0,
			aliquota_pis DECIMAL(10,2) DEFAULT 0,
			aliquota_cofins DECIMAL(10,2) DEFAULT 0,
			aliquota_difal DECIMAL(10,2) DEFAULT 0,
			aliquota_fcp DECIMAL(10,2) DEFAULT 0,
			prioridade TEXT DEFAULT 'PADRÃO',
			ativa BOOLEAN DEFAULT TRUE,
			criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	
	// Carga Automática de Matriz Fiscal (V4 Full Automation)
	_ = m.ConfigurarMatrizPadraoSimplesNacional()

    // Carga Automática de Alíquotas (Parte 3)
    _ = m.ConfigurarAliquotasPadrao()

	// Limpar tabela de empresas e resetar IDs (PROCESSO CONCLUÍDO)
	// m.Conexao.Exec("TRUNCATE TABLE empresas RESTART IDENTITY CASCADE;") 

	// TABELA DE FORNECEDORES
	m.Conexao.Exec(`
		DROP TABLE IF EXISTS fornecedores CASCADE;
		CREATE TABLE fornecedores (
			id SERIAL PRIMARY KEY,
			ativo BOOLEAN DEFAULT true,
			tipo_pessoa VARCHAR(1) DEFAULT 'J',
			logo TEXT,
			documento TEXT UNIQUE,
			ie TEXT,
			razao_social TEXT NOT NULL,
			fantasia TEXT,
			cep TEXT,
			endereco TEXT,
			numero TEXT,
			bairro TEXT,
			cidade TEXT,
			uf CHAR(2),
			contatos JSONB DEFAULT '[]'::jsonb,
			criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)

	// Trigger para ID de Fornecedores 100% Sequencial livre de Gaps
	m.Conexao.Exec(`
		CREATE OR REPLACE FUNCTION set_fornecedor_seq_id() RETURNS TRIGGER AS $$
		BEGIN
			NEW.id := COALESCE((SELECT MAX(id) FROM fornecedores), 0) + 1;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
		
		DROP TRIGGER IF EXISTS trg_fornecedores_seq ON fornecedores;
		CREATE TRIGGER trg_fornecedores_seq BEFORE INSERT ON fornecedores 
		FOR EACH ROW EXECUTE FUNCTION set_fornecedor_seq_id();
	`)

	// TABELA DE ENTRADAS (NOTAS)
	m.Conexao.Exec(`
		CREATE TABLE IF NOT EXISTS entradas (
			id SERIAL PRIMARY KEY,
			numero_nota TEXT NOT NULL,
			serie TEXT,
			fornecedor_id INTEGER REFERENCES fornecedores(id),
			data_emissao DATE,
			data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			valor_produtos DECIMAL(15,2) DEFAULT 0,
			valor_frete DECIMAL(15,2) DEFAULT 0,
			valor_ipi DECIMAL(15,2) DEFAULT 0,
			valor_st DECIMAL(15,2) DEFAULT 0,
			valor_total DECIMAL(15,2) DEFAULT 0,
			observacao TEXT,
			status TEXT DEFAULT 'PENDENTE',
			criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)

	// TABELA DE ITENS DA ENTRADA
	m.Conexao.Exec(`
		CREATE TABLE IF NOT EXISTS entradas_itens (
			id SERIAL PRIMARY KEY,
			entrada_id INTEGER REFERENCES entradas(id) ON DELETE CASCADE,
			produto_id INTEGER REFERENCES produtos(id),
			quantidade DECIMAL(15,4) DEFAULT 0,
			valor_unitario DECIMAL(15,4) DEFAULT 0,
			valor_total DECIMAL(15,4) DEFAULT 0,
			cfop TEXT,
			cst TEXT,
			base_icms DECIMAL(15,2) DEFAULT 0,
			valor_icms DECIMAL(15,2) DEFAULT 0,
			base_st DECIMAL(15,2) DEFAULT 0,
			valor_st DECIMAL(15,2) DEFAULT 0,
			valor_ipi DECIMAL(15,2) DEFAULT 0,
			ncm TEXT,
			endereco_id INTEGER REFERENCES enderecamentos(id)
		);
	`)

	// TABELA DE ENDEREÇAMENTO (Galpões, Ruas, Estantes, Prateleiras)
	_, err := m.Conexao.Exec(`
		CREATE TABLE IF NOT EXISTS enderecamentos (
			id SERIAL PRIMARY KEY,
			empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
			parent_id INTEGER REFERENCES enderecamentos(id) ON DELETE CASCADE,
			nome TEXT NOT NULL,
			codigo TEXT,
			tipo TEXT NOT NULL,
			endereco_logistico TEXT,
			nivel INTEGER NOT NULL
		);
		-- Migração: Adicionar coluna codigo se não existir
		ALTER TABLE enderecamentos ADD COLUMN IF NOT EXISTS codigo TEXT;
	`)
	if err != nil {
		fmt.Printf("Erro ao criar tabela enderecamentos: %v\n", err)
	}

	// TABELA DE MOVIMENTAÇÕES DE ESTOQUE (LEDGER)
	m.Conexao.Exec(`
		CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
			id SERIAL PRIMARY KEY,
			data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			produto_id INTEGER REFERENCES produtos(id),
			endereco_id INTEGER REFERENCES enderecamentos(id),
			tipo_movimentacao TEXT NOT NULL,
			quantidade DECIMAL(15,4) NOT NULL,
			situacao_origem TEXT,
			situacao_destino TEXT,
			documento_origem TEXT,
			modulo_origem TEXT,
			usuario_id INTEGER,
			observacao TEXT
		);
	`)

	// TABELA DE SALDOS DE ESTOQUE (SNAPSHOT)
	m.Conexao.Exec(`
		CREATE TABLE IF NOT EXISTS saldos_estoque (
			produto_id INTEGER REFERENCES produtos(id),
			endereco_id INTEGER REFERENCES enderecamentos(id),
			situacao TEXT NOT NULL DEFAULT 'DISPONIVEL',
			saldo DECIMAL(15,4) DEFAULT 0,
			atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (produto_id, endereco_id, situacao)
		);
	`)

	// TABELA DE PERFIS FISCAIS
	m.Conexao.Exec(`
		CREATE TABLE IF NOT EXISTS perfis_fiscais (
			id SERIAL PRIMARY KEY,
			nome TEXT NOT NULL,
			operacao TEXT NOT NULL, -- ENTRADA ou SAIDA
			icms_aliq DECIMAL(15,2) DEFAULT 0,
			tem_st BOOLEAN DEFAULT false,
			ipi_aliq DECIMAL(15,2) DEFAULT 0,
			pis_aliq DECIMAL(15,2) DEFAULT 0,
			cofins_aliq DECIMAL(15,2) DEFAULT 0,
			cfop_padrao TEXT,
			criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)	// TABELA DE MATRIZ FISCAL (SISTEMA DE RESOLUÇÃO TRIBUTÁRIA V2)
	m.Conexao.Exec(`
		CREATE TABLE IF NOT EXISTS matriz_fiscal (
			id SERIAL PRIMARY KEY,
			nome TEXT NOT NULL,
			prioridade INTEGER DEFAULT 0,
			ativo BOOLEAN DEFAULT true,

			-- CONDIÇÕES
			regime_tributario TEXT,
			operacao TEXT,
			movimentacao TEXT,
			tipo_documento TEXT,
			uf_origem CHAR(2),
			uf_destino CHAR(2),
			tipo_item TEXT,
			finalidade TEXT,
			incidencia_st TEXT,
			ncm TEXT,
			perfil_fiscal_id INTEGER REFERENCES perfis_fiscais(id),

			-- RESULTADOS
			cfop_final TEXT,
			cst_csosn TEXT,
			destaca_icms BOOLEAN DEFAULT true,
			gera_credito_icms BOOLEAN DEFAULT false,
			incide_icms_st BOOLEAN DEFAULT false,
			incide_ipi BOOLEAN DEFAULT false,
			incide_pis BOOLEAN DEFAULT false,
			incide_cofins BOOLEAN DEFAULT false,
			incide_difal BOOLEAN DEFAULT false,
			observacao_fiscal TEXT,
			
			criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	// Migração gradual de colunas (V2 Expansion)
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS operacao TEXT;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS movimentacao TEXT;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS tipo_documento TEXT;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS uf_origem CHAR(2);")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS uf_destino CHAR(2);")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS incidencia_st TEXT;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS cfop_final TEXT;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS cst_csosn TEXT;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS destaca_icms BOOLEAN DEFAULT true;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS gera_credito_icms BOOLEAN DEFAULT false;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS incide_icms_st BOOLEAN DEFAULT false;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS incide_ipi BOOLEAN DEFAULT false;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS incide_pis BOOLEAN DEFAULT false;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS incide_cofins BOOLEAN DEFAULT false;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS incide_difal BOOLEAN DEFAULT false;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal ADD COLUMN IF NOT EXISTS observacao_fiscal TEXT;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal DROP COLUMN IF EXISTS tipo_operacao;") // Cleanup antiga
	m.Conexao.Exec("ALTER TABLE matriz_fiscal DROP COLUMN IF EXISTS natureza_operacao;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal DROP COLUMN IF EXISTS tipo_parceiro;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal DROP COLUMN IF EXISTS contribuinte_icms;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal DROP COLUMN IF EXISTS consumidor_final;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal DROP COLUMN IF EXISTS cest;")
	m.Conexao.Exec("ALTER TABLE matriz_fiscal DROP COLUMN IF EXISTS tem_st;")

	return nil
}

// ListarEmpresas: Retorna todas as empresas do banco
func (m *MotorBD) ObterEmpresa(id int) (Empresa, error) {
	var e Empresa
	err := m.Conexao.QueryRow(`
		SELECT id, razao_social, fantasia, cnpj, inscricao_estadual, uf, regime_tributario 
		FROM empresas WHERE id = $1`, id).Scan(
		&e.ID, &e.RazaoSocial, &e.Fantasia, &e.CNPJ, &e.InscricaoEstadual, &e.UF, &e.RegimeTributario,
	)
	return e, err
}

func (m *MotorBD) ListarEmpresas() ([]Empresa, error) {
	// Usamos COALESCE para evitar erros de Scan caso o campo no banco esteja NULL
	query := `
		SELECT 
			id, 
			razao_social, 
			COALESCE(fantasia, ''), 
			cnpj, 
			COALESCE(inscricao_estadual, ''), 
			COALESCE(regime_tributario, ''), 
			COALESCE(logradouro, ''), 
			COALESCE(numero, ''), 
			COALESCE(bairro, ''), 
			COALESCE(cidade, ''), 
			COALESCE(uf, ''), 
			COALESCE(cep, ''), 
			COALESCE(telefone, ''), 
			COALESCE(tipo, 'JURÍDICA'), 
			COALESCE(complemento, ''),
			COALESCE(cnae_principal, ''),
			COALESCE(cnae_secundarios, ''),
			is_matriz,
			COALESCE(matriz_id, 0),
			COALESCE(usa_estoque_compartilhado, false),
			COALESCE(estoque_id, 0)
		FROM empresas 
		ORDER BY id ASC
	`
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var empresas []Empresa
	for rows.Next() {
		var e Empresa
		err := rows.Scan(
			&e.ID,
			&e.RazaoSocial,
			&e.Fantasia,
			&e.CNPJ,
			&e.InscricaoEstadual,
			&e.RegimeTributario,
			&e.Logradouro,
			&e.Numero,
			&e.Bairro,
			&e.Cidade,
			&e.UF,
			&e.CEP,
			&e.Telefone,
			&e.Tipo,
			&e.Complemento,
			&e.CnaePrincipal,
			&e.CnaeSecundarios,
			&e.IsMatriz,
			&e.MatrizID,
			&e.UsaEstoqueCompartilhado,
			&e.EstoqueID,
		)
		if err != nil {
			fmt.Printf("Erro no Scan de Empresa: %v\n", err)
			return nil, err
		}
		empresas = append(empresas, e)
	}
	return empresas, nil
}

// SalvarEmpresa: Insere ou atualiza uma empresa no PostgreSQL
func (m *MotorBD) SalvarEmpresa(e Empresa) error {
	query := `
		INSERT INTO empresas (razao_social, fantasia, cnpj, inscricao_estadual, regime_tributario, logradouro, numero, bairro, cidade, uf, cep, telefone, tipo, complemento, cnae_principal, cnae_secundarios, is_matriz, matriz_id, usa_estoque_compartilhado, estoque_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
		ON CONFLICT (cnpj) DO UPDATE SET
			razao_social = EXCLUDED.razao_social,
			fantasia = EXCLUDED.fantasia,
			inscricao_estadual = EXCLUDED.inscricao_estadual,
			regime_tributario = EXCLUDED.regime_tributario,
			logradouro = EXCLUDED.logradouro,
			numero = EXCLUDED.numero,
			bairro = EXCLUDED.bairro,
			cidade = EXCLUDED.cidade,
			uf = EXCLUDED.uf,
			cep = EXCLUDED.cep,
			telefone = EXCLUDED.telefone,
			tipo = EXCLUDED.tipo,
			complemento = EXCLUDED.complemento,
			cnae_principal = EXCLUDED.cnae_principal,
			cnae_secundarios = EXCLUDED.cnae_secundarios,
			is_matriz = EXCLUDED.is_matriz,
			matriz_id = EXCLUDED.matriz_id,
			usa_estoque_compartilhado = EXCLUDED.usa_estoque_compartilhado,
			estoque_id = EXCLUDED.estoque_id
	`
	fmt.Printf("💾 SQL-DEBUG: Gravando empresa CNPJ=%s, Matriz=%v, EstoqueID=%d\n", e.CNPJ, e.IsMatriz, e.EstoqueID)
	_, err := m.Conexao.Exec(query, 
		e.RazaoSocial, e.Fantasia, e.CNPJ, e.InscricaoEstadual, e.RegimeTributario, 
		e.Logradouro, e.Numero, e.Bairro, e.Cidade, e.UF, e.CEP, e.Telefone, e.Tipo,
		e.Complemento, e.CnaePrincipal, e.CnaeSecundarios, e.IsMatriz, e.MatrizID, e.UsaEstoqueCompartilhado, e.EstoqueID)
	if err != nil {
		fmt.Printf("❌ ERRO SQL AO GRAVAR EMPRESA: %v\n", err)
		return err
	}
	m.Notificar("sig_events", "empresas_changed")
	fmt.Println("✅ SQL-DEBUG: Empresa gravada com sucesso.")
	return nil
}

// ExcluirEmpresa: Remove uma empresa pelo ID
func (m *MotorBD) ExcluirEmpresa(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM empresas WHERE id = $1", id)
	if err == nil {
		m.Notificar("sig_events", "empresas_changed")
	}
	return err
}

// --- MÓDULO DE USUÁRIOS ---

type GrupoAcesso struct {
	ID         int    `json:"id"`
	Nome       string `json:"nome"`
	Descricao  string `json:"descricao"`
	Permissoes string `json:"permissoes"` // Representação JSONB
	Ativo      bool   `json:"ativo"`
}

type Usuario struct {
	ID                  int    `json:"id"`
	Nome                string `json:"nome"`
	Sobrenome           string `json:"sobrenome"`
	CPF                 string `json:"cpf"`
	RG                  string `json:"rg"`
	DataNascimento      string `json:"data_nascimento"`
	DataAdmissao        string `json:"data_admissao"`
	CEP                 string `json:"cep"`
	Logradouro          string `json:"logradouro"`
	Numero              string `json:"numero"`
	Complemento         string `json:"complemento"`
	Bairro              string `json:"bairro"`
	Cidade              string `json:"cidade"`
	UF                  string `json:"uf"`
	Login               string `json:"login"`
	Senha               string `json:"senha"`
	FuncaoID            int    `json:"funcao_id"`
	NomeFuncao          string `json:"nome_funcao"`
	GrupoAcessoID       int    `json:"grupo_acesso_id"`
	NomeGrupo           string `json:"nome_grupo"`
	PrecisaAlterarSenha bool   `json:"precisa_alterar_senha"`
	Ativo               bool   `json:"ativo"`
	UltimoAcesso        string `json:"ultimo_acesso"`
}

type Funcao struct {
	ID   int    `json:"id"`
	Nome string `json:"nome"`
}

func (m *MotorBD) GetProximoIDUsuario() (int, error) {
	var nID int
	err := m.Conexao.QueryRow("SELECT COALESCE(MAX(id), 0) + 1 FROM usuarios").Scan(&nID)
	return nID, err
}

func (m *MotorBD) ListarUsuarios() ([]Usuario, error) {
	query := `
		SELECT 
			u.id, u.nome, u.sobrenome, u.cpf, u.rg,
			u.data_nascimento::text, u.data_admissao::text,
			u.cep, u.logradouro, u.numero, u.complemento, u.bairro, u.cidade, u.uf,
			u.login, COALESCE(u.funcao_id, 0), f.nome, COALESCE(u.grupo_acesso_id, 0), u.precisa_alterar_senha, u.ativo,
			TO_CHAR(u.ultimo_acesso, 'DD/MM/YYYY HH24:MI') as ultimo_acesso 
		FROM usuarios u
		LEFT JOIN funcoes f ON u.funcao_id = f.id
		ORDER BY u.id ASC`
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Usuario
	for rows.Next() {
		var u Usuario
		var sobrenome, cpf, rg, dNasc, dAdm, cep, log, num, comp, bairro, cidade, uf, nomeFuncao, ultimoAcesso sql.NullString

		err := rows.Scan(
			&u.ID, &u.Nome, &sobrenome, &cpf, &rg,
			&dNasc, &dAdm, &cep, &log, &num, &comp, &bairro, &cidade, &uf,
			&u.Login, &u.FuncaoID, &nomeFuncao, &u.GrupoAcessoID, &u.PrecisaAlterarSenha, &u.Ativo, &ultimoAcesso,
		)
		if err != nil {
			fmt.Printf("⚠️ Erro scan usuario ID %d: %v\n", u.ID, err)
			continue // Pula o erro mas continua listando os outros
		}

		u.Sobrenome = sobrenome.String
		u.CPF = cpf.String
		u.RG = rg.String
		u.DataNascimento = dNasc.String
		u.DataAdmissao = dAdm.String
		u.CEP = cep.String
		u.Logradouro = log.String
		u.Numero = num.String
		u.Complemento = comp.String
		u.Bairro = bairro.String
		u.Cidade = cidade.String
		u.UF = uf.String
		u.UltimoAcesso = ultimoAcesso.String
		u.NomeFuncao = nomeFuncao.String
		if u.NomeFuncao == "" {
			u.NomeFuncao = "N/A"
		}

		lista = append(lista, u)
	}
	return lista, nil
}
func (m *MotorBD) GetUsuarioPorID(id int) (Usuario, error) {
	var u Usuario
	var sobrenome, cpf, rg, dNasc, dAdm, cep, log, num, comp, bairro, cidade, uf, nomeFuncao, ultimoAcesso sql.NullString
	query := `
		SELECT 
			u.id, u.nome, u.sobrenome, u.cpf, u.rg,
			u.data_nascimento::text, u.data_admissao::text,
			u.cep, u.logradouro, u.numero, u.complemento, u.bairro, u.cidade, u.uf,
			u.login, COALESCE(u.funcao_id, 0), f.nome, COALESCE(u.grupo_acesso_id, 0), u.precisa_alterar_senha, u.ativo,
			TO_CHAR(u.ultimo_acesso, 'DD/MM/YYYY HH24:MI') as ultimo_acesso 
		FROM usuarios u
		LEFT JOIN funcoes f ON u.funcao_id = f.id
		WHERE u.id = $1
	`
	err := m.Conexao.QueryRow(query, id).Scan(
		&u.ID, &u.Nome, &sobrenome, &cpf, &rg,
		&dNasc, &dAdm, &cep, &log, &num, &comp, &bairro, &cidade, &uf,
		&u.Login, &u.FuncaoID, &nomeFuncao, &u.GrupoAcessoID, &u.PrecisaAlterarSenha, &u.Ativo, &ultimoAcesso,
	)
	if err != nil {
		return u, err
	}

	u.Sobrenome = sobrenome.String
	u.CPF = cpf.String
	u.RG = rg.String
	u.DataNascimento = dNasc.String
	u.DataAdmissao = dAdm.String
	u.CEP = cep.String
	u.Logradouro = log.String
	u.Numero = num.String
	u.Complemento = comp.String
	u.Bairro = bairro.String
	u.Cidade = cidade.String
	u.UF = uf.String
	u.UltimoAcesso = ultimoAcesso.String
	u.NomeFuncao = nomeFuncao.String
	if u.NomeFuncao == "" {
		u.NomeFuncao = "N/A"
	}
	return u, nil
}

func (m *MotorBD) Autenticar(login string, senha string) (Usuario, error) {
	var u Usuario
	var sobrenome, cpf, rg, dNasc, dAdm, cep, log, num, comp, bairro, cidade, uf, nomeFuncao, ultimoAcesso sql.NullString
	var dbSenha sql.NullString
	query := `
		SELECT 
			u.id, u.nome, u.sobrenome, u.cpf, u.rg,
			u.data_nascimento::text, u.data_admissao::text,
			u.cep, u.logradouro, u.numero, u.complemento, u.bairro, u.cidade, u.uf,
			u.login, u.senha, COALESCE(u.funcao_id, 0), f.nome, COALESCE(u.grupo_acesso_id, 0), u.precisa_alterar_senha, u.ativo,
			TO_CHAR(u.ultimo_acesso, 'DD/MM/YYYY HH24:MI') as ultimo_acesso 
		FROM usuarios u
		LEFT JOIN funcoes f ON u.funcao_id = f.id
		WHERE u.login = $1
	`
	err := m.Conexao.QueryRow(query, login).Scan(
		&u.ID, &u.Nome, &sobrenome, &cpf, &rg,
		&dNasc, &dAdm, &cep, &log, &num, &comp, &bairro, &cidade, &uf,
		&u.Login, &dbSenha, &u.FuncaoID, &nomeFuncao, &u.GrupoAcessoID, &u.PrecisaAlterarSenha, &u.Ativo, &ultimoAcesso,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return u, fmt.Errorf("USUÁRIO INEXISTENTE NO SGC")
		}
		return u, err
	}

	if !u.Ativo {
		return u, fmt.Errorf("CREDENCIAL BLOQUEADA PELO ADMINISTRADOR")
	}

	if dbSenha.String != senha {
		return u, fmt.Errorf("CHAVE DE ACESSO INCORRETA")
	}

	u.Sobrenome = sobrenome.String
	u.CPF = cpf.String
	u.RG = rg.String
	u.DataNascimento = dNasc.String
	u.DataAdmissao = dAdm.String
	u.CEP = cep.String
	u.Logradouro = log.String
	u.Numero = num.String
	u.Complemento = comp.String
	u.Bairro = bairro.String
	u.Cidade = cidade.String
	u.UF = uf.String
	u.UltimoAcesso = ultimoAcesso.String
	u.NomeFuncao = nomeFuncao.String

	// Atualizar o Último Acesso do Usuário no Sucesso do Login
	m.Conexao.Exec("UPDATE usuarios SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = $1", u.ID)
	// Como modificado silenciosamente, disparamos a rede para a HUD atualizar quem tá online
	m.Notificar("sig_events", "usuarios_changed")

	return u, nil
}

func (m *MotorBD) SalvarUsuario(u Usuario) error {
	// Tratamento de datas vazias para o Postgres
	dNasc := sql.NullString{String: u.DataNascimento, Valid: u.DataNascimento != ""}
	dAdm := sql.NullString{String: u.DataAdmissao, Valid: u.DataAdmissao != ""}

	if u.ID > 0 {
		query := `
			UPDATE usuarios SET 
				nome=$1, sobrenome=$2, cpf=$3, rg=$4, data_nascimento=$5, data_admissao=$6,
				cep=$7, logradouro=$8, numero=$9, complemento=$10, bairro=$11, cidade=$12, uf=$13,
				login=$14, funcao_id=$15, ativo=$16 
			WHERE id=$17`
		_, err := m.Conexao.Exec(query,
			u.Nome, u.Sobrenome, u.CPF, u.RG, dNasc, dAdm,
			u.CEP, u.Logradouro, u.Numero, u.Complemento, u.Bairro, u.Cidade, u.UF,
			u.Login, u.FuncaoID, u.Ativo, u.ID)
		if err == nil {
			m.Notificar("sig_events", "usuarios_changed")
		}
		return err
	}
	query := `
		INSERT INTO usuarios (
			nome, sobrenome, cpf, rg, data_nascimento, data_admissao,
			cep, logradouro, numero, complemento, bairro, cidade, uf,
			login, senha, funcao_id, precisa_alterar_senha
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true)`
	_, err := m.Conexao.Exec(query,
		u.Nome, u.Sobrenome, u.CPF, u.RG, dNasc, dAdm,
		u.CEP, u.Logradouro, u.Numero, u.Complemento, u.Bairro, u.Cidade, u.UF,
		u.Login, u.Senha, u.FuncaoID)

	if err == nil {
		fmt.Println("✅ USUÁRIO GRAVADO: Notificando barramento...")
		m.Notificar("sig_events", "usuarios_changed")
	} else {
		fmt.Println("❌ ERRO AO GRAVAR USUÁRIO:", err)
	}
	return err
}

// --- MÓDULO DE FUNÇÕES ---

func (m *MotorBD) ListarFuncoes() ([]Funcao, error) {
	rows, err := m.Conexao.Query("SELECT id, nome FROM funcoes ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Funcao
	for rows.Next() {
		var f Funcao
		if err := rows.Scan(&f.ID, &f.Nome); err != nil {
			return nil, err
		}
		lista = append(lista, f)
	}
	return lista, nil
}

func (m *MotorBD) SalvarFuncao(f Funcao) error {
	if f.ID > 0 {
		_, err := m.Conexao.Exec("UPDATE funcoes SET nome=$1 WHERE id=$2", f.Nome, f.ID)
		return err
	}
	_, err := m.Conexao.Exec("INSERT INTO funcoes (nome) VALUES ($1)", f.Nome)
	return err
}

func (m *MotorBD) ExcluirFuncao(id int) error {
	// Checar se há usuários usando essa função
	var count int
	m.Conexao.QueryRow("SELECT COUNT(*) FROM usuarios WHERE funcao_id = $1", id).Scan(&count)
	if count > 0 {
		return fmt.Errorf("NÃO É POSSÍVEL EXCLUIR: EXISTEM USUÁRIOS VINCULADOS A ESTA FUNÇÃO.")
	}
	_, err := m.Conexao.Exec("DELETE FROM funcoes WHERE id = $1", id)
	return err
}

func (m *MotorBD) ExcluirUsuario(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM usuarios WHERE id = $1", id)
	return err
}

func (m *MotorBD) ResetarSenha(id int, novaSenha string) error {
	_, err := m.Conexao.Exec("UPDATE usuarios SET senha=$1, precisa_alterar_senha=true WHERE id=$2", novaSenha, id)
	return err
}

func (m *MotorBD) RedefinirPropriaSenha(id int, novaSenha string) error {
	_, err := m.Conexao.Exec("UPDATE usuarios SET senha=$1, precisa_alterar_senha=false WHERE id=$2", novaSenha, id)
	return err
}

// --- MÓDULO DE ENDEREÇAMENTO ---

func (m *MotorBD) ListarEnderecamentos(empresaID int) ([]Enderecamento, error) {
	query := `
		SELECT id, empresa_id, parent_id, nome, COALESCE(codigo, ''), tipo, COALESCE(endereco_logistico, ''), nivel 
		FROM enderecamentos 
		WHERE empresa_id = $1 
		ORDER BY nivel ASC, codigo ASC, id ASC`
	
	rows, err := m.Conexao.Query(query, empresaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []Enderecamento
	for rows.Next() {
		var e Enderecamento
		err := rows.Scan(&e.ID, &e.EmpresaID, &e.ParentID, &e.Nome, &e.Codigo, &e.Tipo, &e.EnderecoLogistico, &e.Nivel)
		if err != nil {
			return nil, err
		}
		lista = append(lista, e)
	}
	return lista, nil
}

func (m *MotorBD) SalvarEnderecamento(e Enderecamento) (int, error) {
	if e.ID > 0 {
		query := `
			UPDATE enderecamentos SET 
				nome=$1, codigo=$2, tipo=$3, endereco_logistico=$4, nivel=$5 
			WHERE id=$6`
		_, err := m.Conexao.Exec(query, e.Nome, e.Codigo, e.Tipo, e.EnderecoLogistico, e.Nivel, e.ID)
		return e.ID, err
	}
	
	query := `
		INSERT INTO enderecamentos (empresa_id, parent_id, nome, codigo, tipo, endereco_logistico, nivel) 
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`
	
	var lastID int
	err := m.Conexao.QueryRow(query, e.EmpresaID, e.ParentID, e.Nome, e.Codigo, e.Tipo, e.EnderecoLogistico, e.Nivel).Scan(&lastID)
	return lastID, err
}

func (m *MotorBD) ExcluirEnderecamento(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM enderecamentos WHERE id = $1", id)
	return err
}

// --- MÓDULO DE MATRIZ FISCAL ---

func (m *MotorBD) ListarMatrizesFiscais() ([]MatrizFiscal, error) {
	query := `
		SELECT 
			id, nome, ativa,
			regime_tributario, operacao, tipo_destino, incidencia_st, ncm, prioridade,
			cfop, cst_csosn, destaca_icms, credito_icms, incide_ipi, incide_pis, incide_cofins, incide_difal
		FROM matriz_fiscal 
		ORDER BY prioridade DESC, id ASC`
	
	rows, err := m.Conexao.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []MatrizFiscal
	for rows.Next() {
		var mf MatrizFiscal
		var pInt int
		err := rows.Scan(
			&mf.ID, &mf.Nome, &mf.Ativa,
			&mf.RegimeTributario, &mf.Operacao, &mf.TipoDestino, &mf.IncidenciaST, &mf.Ncm, &pInt,
			&mf.Cfop, &mf.CstCsosn, &mf.DestacaIcms, &mf.CreditoIcms, &mf.IncideIpi, &mf.IncidePis, &mf.IncideCofins, &mf.IncideDifal,
		)
		if err != nil {
			return nil, err
		}
		
		// Conversão de Prioridade (Número -> Texto)
		if pInt >= 100 {
			mf.Prioridade = "CRÍTICA"
		} else if pInt >= 50 {
			mf.Prioridade = "ALTA"
		} else {
			mf.Prioridade = "PADRÃO"
		}

		lista = append(lista, mf)
	}
	return lista, nil
}

func (m *MotorBD) SalvarMatrizFiscal(mf MatrizFiscal) (int, error) {
	pInt := mapPrioridadeParaInt(mf.Prioridade)

	// 1. Verificação de Conflito Potencial (Mesma Prioridade + Mesmas Condições)
	var conflitoID int
	queryCheck := `
		SELECT id FROM matriz_fiscal 
		WHERE id != $1 AND prioridade = $2 AND ativa = true
		  AND regime_tributario = $3
		  AND operacao = $4
		  AND tipo_destino = $5
		  AND incidencia_st = $6
		  AND ncm = $7
		LIMIT 1`
	
	err := m.Conexao.QueryRow(queryCheck, 
		mf.ID, pInt, mf.RegimeTributario, mf.Operacao, 
		mf.TipoDestino, mf.IncidenciaST, mf.Ncm,
	).Scan(&conflitoID)

	if err == nil {
		return 0, fmt.Errorf("CONFLITO: Já existe a Regra ID %d com a mesma Prioridade e Condições desta regra.", conflitoID)
	}

	if mf.ID > 0 {
		query := `
			UPDATE matriz_fiscal SET 
				nome=$1, prioridade=$2, ativa=$3, regime_tributario=$4,
				operacao=$5, tipo_destino=$6, incidencia_st=$7, ncm=$8,
				cfop=$9, cst_csosn=$10, destaca_icms=$11, credito_icms=$12,
				incide_ipi=$13, incide_pis=$14, incide_cofins=$15, incide_difal=$16
			WHERE id=$17`
		_, err = m.Conexao.Exec(query, 
			mf.Nome, pInt, mf.Ativa, mf.RegimeTributario,
			mf.Operacao, mf.TipoDestino, mf.IncidenciaST, mf.Ncm,
			mf.Cfop, mf.CstCsosn, mf.DestacaIcms, mf.CreditoIcms,
			mf.IncideIpi, mf.IncidePis, mf.IncideCofins, mf.IncideDifal, mf.ID,
		)
		return mf.ID, err
	}
	
	query := `
		INSERT INTO matriz_fiscal (
			nome, prioridade, ativa, regime_tributario,
			operacao, tipo_destino, incidencia_st, ncm,
			cfop, cst_csosn, destaca_icms, credito_icms,
			incide_ipi, incide_pis, incide_cofins, incide_difal
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
		RETURNING id`
	
	var lastID int
	err = m.Conexao.QueryRow(query, 
		mf.Nome, pInt, mf.Ativa, mf.RegimeTributario,
		mf.Operacao, mf.TipoDestino, mf.IncidenciaST, mf.Ncm,
		mf.Cfop, mf.CstCsosn, mf.DestacaIcms, mf.CreditoIcms,
		mf.IncideIpi, mf.IncidePis, mf.IncideCofins, mf.IncideDifal,
	).Scan(&lastID)
	return lastID, err
}

// ResolverMatrizFiscal: Motor reativo de decisão tributária (Parte 2: Especificidade + Prioridade)
func (m *MotorBD) ResolverMatrizFiscal(ctx ContextoFiscal) (MatrizFiscal, error) {
	// 1. Geração Automática de Contexto Geográfico (Se vazio)
	if ctx.TipoDestino == "" && ctx.UFOrigem != "" && ctx.UFDestino != "" {
		if ctx.UFOrigem == ctx.UFDestino {
			ctx.TipoDestino = "INTERNA"
		} else {
			ctx.TipoDestino = "INTERESTADUAL"
		}
	}

	// 2. Normalização de dados de entrada
	ncmCtx := strings.ReplaceAll(ctx.Ncm, ".", "")
	stCtx := "NAO"
	if ctx.IncidenciaST { stCtx = "SIM" }

	// 3. Buscar todas as regras ativas
	regras, err := m.ListarMatrizesFiscais()
	if err != nil {
		return MatrizFiscal{}, err
	}

	type resultadoComEsp struct {
		MF   MatrizFiscal
		Esp  int
	}
	var resultados []resultadoComEsp

	for _, r := range regras {
		if !r.Ativa { continue }

		match := true
		esp := 0 

		// --- CONDIÇÃO 1: Regime Tributário ---
		if r.RegimeTributario != "" && r.RegimeTributario != "TODOS" {
			if r.RegimeTributario != ctx.RegimeTributario {
				match = false
			} else {
				esp += 10 // Peso maior para regime explícito
			}
		}

		// --- CONDIÇÃO 2: Operação ---
		if match && r.Operacao != "" && r.Operacao != "TODAS" {
			if r.Operacao != ctx.Operacao {
				match = false
			} else {
				esp += 10
			}
		}

		// --- CONDIÇÃO 3: Tipo Destino ---
		if match && r.TipoDestino != "" && r.TipoDestino != "TODOS" {
			if r.TipoDestino != ctx.TipoDestino {
				match = false
			} else {
				esp += 5
			}
		}

		// --- CONDIÇÃO 4: Incidência de ST ---
		if match && r.IncidenciaST != "" && r.IncidenciaST != "TODOS" {
			if r.IncidenciaST != stCtx {
				match = false
			} else {
				esp += 5
			}
		}

		// --- CONDIÇÃO 5: NCM (Match por prefixo) ---
		if match && r.Ncm != "" {
			ncmRegra := strings.ReplaceAll(r.Ncm, ".", "")
			if !strings.HasPrefix(ncmCtx, ncmRegra) {
				match = false
			} else {
				// Quanto mais longo o NCM da regra, mais específica ela é
				esp += len(ncmRegra) 
			}
		}

		if match {
			resultados = append(resultados, resultadoComEsp{MF: r, Esp: esp})
		}
	}

	if len(resultados) == 0 {
		return MatrizFiscal{}, fmt.Errorf("⚠️ NENHUMA REGRA FISCAL ENCONTRADA\nContexto: %s | %s | %s | NCM: %s\nVerifique o Cadastro da Matriz Fiscal.", 
			ctx.Operacao, ctx.RegimeTributario, ctx.TipoDestino, ctx.Ncm)
	}

	// 4. Ranking de Decisão (Prioridade Absoluta > Especificidade)
	sort.Slice(resultados, func(i, j int) bool {
		pI := mapPrioridadeParaInt(resultados[i].MF.Prioridade)
		pJ := mapPrioridadeParaInt(resultados[j].MF.Prioridade)
		
		if pI != pJ {
			return pI > pJ
		}
		// Se as prioridades forem iguais, vence a mais específica (maior esp)
		return resultados[i].Esp > resultados[j].Esp
	})

	return resultados[0].MF, nil
}

func (m *MotorBD) ObterFornecedor(id int) (Fornecedor, error) {
	var f Fornecedor
	err := m.Conexao.QueryRow(`SELECT id, razao_social, uf FROM fornecedores WHERE id = $1`, id).Scan(
		&f.ID, &f.RazaoSocial, &f.UF,
	)
	return f, err
}

func (m *MotorBD) ObterProduto(id int) (Produto, error) {
	var p Produto
	err := m.Conexao.QueryRow(`SELECT id, ncm, tem_st FROM produtos WHERE id = $1`, id).Scan(
		&p.ID, &p.Ncm, &p.TemSt,
	)
	return p, err
}

func (m *MotorBD) ExcluirMatrizFiscal(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM matriz_fiscal WHERE id = $1", id)
	return err
}

func mapPrioridadeParaInt(p string) int {
	switch p {
	case "CRÍTICA": return 100
	case "ALTA": return 50
	default: return 10
	}
}

func (m *MotorBD) ConfigurarMatrizPadraoSimplesNacional() error {
	regras := []MatrizFiscal{
		{Nome: "VENDA INTERNA SIMPLES", Prioridade: "PADRÃO", Ativa: true, RegimeTributario: "SIMPLES", Operacao: "SAIDA", TipoDestino: "INTERNA", IncidenciaST: "NAO", Cfop: "5102", CstCsosn: "102", DestacaIcms: true},
		{Nome: "VENDA INTERESTADUAL SIMPLES", Prioridade: "PADRÃO", Ativa: true, RegimeTributario: "SIMPLES", Operacao: "SAIDA", TipoDestino: "INTERESTADUAL", IncidenciaST: "NAO", Cfop: "6102", CstCsosn: "102", DestacaIcms: true, IncideDifal: true},
		{Nome: "VENDA INTERNA COM ST", Prioridade: "ALTA", Ativa: true, RegimeTributario: "SIMPLES", Operacao: "SAIDA", TipoDestino: "INTERNA", IncidenciaST: "SIM", Cfop: "5405", CstCsosn: "500"},
		{Nome: "VENDA INTERESTADUAL COM ST", Prioridade: "ALTA", Ativa: true, RegimeTributario: "SIMPLES", Operacao: "SAIDA", TipoDestino: "INTERESTADUAL", IncidenciaST: "SIM", Cfop: "6404", CstCsosn: "500"},
		{Nome: "COMPRA INTERNA REVENDA", Prioridade: "PADRÃO", Ativa: true, RegimeTributario: "TODOS", Operacao: "ENTRADA", TipoDestino: "INTERNA", IncidenciaST: "NAO", Cfop: "1102", CstCsosn: "102"},
	}

	for _, r := range regras {
		var count int
		m.Conexao.QueryRow("SELECT COUNT(*) FROM matriz_fiscal WHERE nome = $1", r.Nome).Scan(&count)
		if count == 0 {
			if _, err := m.SalvarMatrizFiscal(r); err != nil {
				fmt.Printf("⚠️ Erro ao carregar regra padrão %s: %v\n", r.Nome, err)
			}
		}
	}
	return nil
}

func (m *MotorBD) ConfigurarAliquotasPadrao() error {
	regras := []AliquotaFiscal{
		{Nome: "INTERNA SIMPLES NACIONAL", RegimeTributario: "SIMPLES", TipoDestino: "INTERNA", AliquotaIcms: 18.0, AliquotaPis: 0.65, AliquotaCofins: 3.0, Prioridade: "PADRÃO", Ativa: true},
		{Nome: "INTERESTADUAL SIMPLES NACIONAL", RegimeTributario: "SIMPLES", TipoDestino: "INTERESTADUAL", AliquotaIcms: 12.0, AliquotaPis: 0.65, AliquotaCofins: 3.0, Prioridade: "PADRÃO", Ativa: true},
	}

	for _, r := range regras {
		var count int
		m.Conexao.QueryRow("SELECT COUNT(*) FROM aliquotas_fiscais WHERE nome = $1", r.Nome).Scan(&count)
		if count == 0 {
			query := `
				INSERT INTO aliquotas_fiscais (nome, regime_tributario, tipo_destino, aliquota_icms, aliquota_pis, aliquota_cofins, prioridade, ativa)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
			m.Conexao.Exec(query, r.Nome, r.RegimeTributario, r.TipoDestino, r.AliquotaIcms, r.AliquotaPis, r.AliquotaCofins, r.Prioridade, r.Ativa)
		}
	}
	return nil
}

func (m *MotorBD) ListarAliquotasFiscais() ([]AliquotaFiscal, error) {
	rows, err := m.Conexao.Query(`
		SELECT id, nome, regime_tributario, tipo_destino, incidencia_st, COALESCE(ncm,''), COALESCE(cfop,''), COALESCE(cst_csosn,''),
		       aliquota_icms, aliquota_icms_st, aliquota_ipi, aliquota_pis, aliquota_cofins, aliquota_difal, aliquota_fcp,
		       prioridade, ativa FROM aliquotas_fiscais ORDER BY prioridade DESC, id ASC`)
	if err != nil { return nil, err }
	defer rows.Close()

	var lista []AliquotaFiscal
	for rows.Next() {
		var a AliquotaFiscal
		rows.Scan(&a.ID, &a.Nome, &a.RegimeTributario, &a.TipoDestino, &a.IncidenciaST, &a.Ncm, &a.Cfop, &a.CstCsosn,
			&a.AliquotaIcms, &a.AliquotaIcmsSt, &a.AliquotaIpi, &a.AliquotaPis, &a.AliquotaCofins, &a.AliquotaDifal, &a.AliquotaFcp,
			&a.Prioridade, &a.Ativa)
		lista = append(lista, a)
	}
	return lista, nil
}

func (m *MotorBD) SalvarAliquotaFiscal(a AliquotaFiscal) (int, error) {
	if a.ID > 0 {
		_, err := m.Conexao.Exec(`
			UPDATE aliquotas_fiscais SET nome=$1, regime_tributario=$2, tipo_destino=$3, incidencia_st=$4, ncm=$5, cfop=$6, cst_csosn=$7,
			aliquota_icms=$8, aliquota_icms_st=$9, aliquota_ipi=$10, aliquota_pis=$11, aliquota_cofins=$12, aliquota_difal=$13, aliquota_fcp=$14,
			prioridade=$15, ativa=$16 WHERE id=$17`,
			a.Nome, a.RegimeTributario, a.TipoDestino, a.IncidenciaST, a.Ncm, a.Cfop, a.CstCsosn,
			a.AliquotaIcms, a.AliquotaIcmsSt, a.AliquotaIpi, a.AliquotaPis, a.AliquotaCofins, a.AliquotaDifal, a.AliquotaFcp,
			a.Prioridade, a.Ativa, a.ID)
		return a.ID, err
	}
	var newID int
	err := m.Conexao.QueryRow(`
		INSERT INTO aliquotas_fiscais (nome, regime_tributario, tipo_destino, incidencia_st, ncm, cfop, cst_csosn,
		aliquota_icms, aliquota_icms_st, aliquota_ipi, aliquota_pis, aliquota_cofins, aliquota_difal, aliquota_fcp,
		prioridade, ativa) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
		a.Nome, a.RegimeTributario, a.TipoDestino, a.IncidenciaST, a.Ncm, a.Cfop, a.CstCsosn,
		a.AliquotaIcms, a.AliquotaIcmsSt, a.AliquotaIpi, a.AliquotaPis, a.AliquotaCofins, a.AliquotaDifal, a.AliquotaFcp,
		a.Prioridade, a.Ativa).Scan(&newID)
	return newID, err
}

func (m *MotorBD) ExcluirAliquotaFiscal(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM aliquotas_fiscais WHERE id = $1", id)
	return err
}

func (m *MotorBD) ResolverAliquotas(ctx ContextoFiscal, mf MatrizFiscal) (AliquotaFiscal, error) {
	regras, _ := m.ListarAliquotasFiscais()
	var resultados []struct {
		AF AliquotaFiscal
		Esp int
	}

	stCtx := "NAO"
	if ctx.IncidenciaST { stCtx = "SIM" }
	ncmCtx := strings.ReplaceAll(ctx.Ncm, ".", "")

	for _, r := range regras {
		if !r.Ativa { continue }
		match := true
		esp := 0

		// Regime
		if r.RegimeTributario != "" && r.RegimeTributario != "TODOS" {
			if r.RegimeTributario != ctx.RegimeTributario { match = false } else { esp += 10 }
		}
		// Destino
		if match && r.TipoDestino != "" && r.TipoDestino != "TODOS" {
			if r.TipoDestino != ctx.TipoDestino { match = false } else { esp += 5 }
		}
		// ST
		if match && r.IncidenciaST != "" && r.IncidenciaST != "TODOS" {
			if r.IncidenciaST != stCtx { match = false } else { esp += 5 }
		}
		// NCM
		if match && r.Ncm != "" {
			ncmRegra := strings.ReplaceAll(r.Ncm, ".", "")
			if !strings.HasPrefix(ncmCtx, ncmRegra) { match = false } else { esp += len(ncmRegra) }
		}
		// CFOP
		if match && r.Cfop != "" && r.Cfop != "TODOS" {
			if r.Cfop != mf.Cfop { match = false } else { esp += 20 }
		}
		// CST
		if match && r.CstCsosn != "" && r.CstCsosn != "TODOS" {
			if r.CstCsosn != mf.CstCsosn { match = false } else { esp += 20 }
		}

		if match {
			resultados = append(resultados, struct{AF AliquotaFiscal; Esp int}{AF: r, Esp: esp})
		}
	}

	if len(resultados) == 0 {
		return AliquotaFiscal{}, fmt.Errorf("Nenhuma regra de alíquota encontrada para o contexto.")
	}

	sort.Slice(resultados, func(i, j int) bool {
		pI := mapPrioridadeParaInt(resultados[i].AF.Prioridade)
		pJ := mapPrioridadeParaInt(resultados[j].AF.Prioridade)
		if pI != pJ { return pI > pJ }
		return resultados[i].Esp > resultados[j].Esp
	})

	return resultados[0].AF, nil
}

// Model e Funções para Solicitações de Compras
type SolicitacaoCompra struct {
	ID              int    `json:"id"`
	Produto         string `json:"produto"`
	Marca           string `json:"marca"`
	Observacao      string `json:"observacao"`
	Quantidade      string `json:"quantidade"`
	Urgencia        string `json:"urgencia"`
	TipoSolicitacao string `json:"tipo_solicitacao"`
	SolicitanteID   int    `json:"solicitante_id"`
	SolicitanteNome string `json:"solicitante_nome"`
	DataSolicitacao string `json:"data_solicitacao"`
	CodigoErp       string `json:"codigo_erp"`
	Status          string `json:"status"` // PENDENTES, EM ANDAMENTO, CONCLUIDAS
}

func (m *MotorBD) SetupTabelasCompras() error {
	query := `
	CREATE TABLE IF NOT EXISTS solicitacoes_compras (
		id SERIAL PRIMARY KEY,
		produto TEXT NOT NULL,
		marca TEXT,
		observacao TEXT,
		quantidade TEXT,
		urgencia TEXT,
		tipo_solicitacao TEXT,
		solicitante_id INTEGER,
		data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		codigo_erp TEXT,
		status TEXT DEFAULT 'PENDENTES'
	);
	`
	_, err := m.Conexao.Exec(query)
	return err
}

func (m *MotorBD) SalvarSolicitacaoCompra(s SolicitacaoCompra) error {
	q := `INSERT INTO solicitacoes_compras (produto, marca, observacao, quantidade, urgencia, tipo_solicitacao, solicitante_id, codigo_erp, status)
	      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	status := "PENDENTES"
	if s.Status != "" { status = s.Status }
	_, err := m.Conexao.Exec(q, s.Produto, s.Marca, s.Observacao, s.Quantidade, s.Urgencia, s.TipoSolicitacao, s.SolicitanteID, s.CodigoErp, status)
	return err
}

func (m *MotorBD) ListarSolicitacoesCompra() ([]SolicitacaoCompra, error) {
	q := `
		SELECT s.id, s.produto, COALESCE(s.marca, ''), COALESCE(s.observacao, ''), s.quantidade, s.urgencia, s.tipo_solicitacao, s.solicitante_id,
		COALESCE(u.nome, 'SISTEMA') || ' ' || COALESCE(u.sobrenome, ''),
		TO_CHAR(s.data_solicitacao, 'DD/MM/YY HH24:MI'), COALESCE(s.codigo_erp, ''), s.status
		FROM solicitacoes_compras s
		LEFT JOIN usuarios u ON s.solicitante_id = u.id
		ORDER BY s.id DESC
	`
	var lista []SolicitacaoCompra
	rows, err := m.Conexao.Query(q)
	if err != nil { return nil, err }
	defer rows.Close()
	for rows.Next() {
		var s SolicitacaoCompra
		err := rows.Scan(&s.ID, &s.Produto, &s.Marca, &s.Observacao, &s.Quantidade, &s.Urgencia, &s.TipoSolicitacao, &s.SolicitanteID, &s.SolicitanteNome, &s.DataSolicitacao, &s.CodigoErp, &s.Status)
		if err != nil { continue }
		lista = append(lista, s)
	}
	return lista, nil
}

// --- MÓDULO DE ACESSOS (RBAC) ---

func (m *MotorBD) SetupTabelasAcesso() error {
	query := `
	CREATE TABLE IF NOT EXISTS grupos_acesso (
		id SERIAL PRIMARY KEY,
		nome TEXT NOT NULL UNIQUE,
		descricao TEXT,
		permissoes JSONB DEFAULT '[]'::jsonb,
		ativo BOOLEAN DEFAULT true
	);
	
	DO $$ 
	BEGIN 
		IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='grupo_acesso_id') THEN
			ALTER TABLE usuarios ADD COLUMN grupo_acesso_id INTEGER DEFAULT 0;
		END IF;
	END $$;
	`
	_, err := m.Conexao.Exec(query)
	return err
}

func (m *MotorBD) ListarGruposAcesso() ([]GrupoAcesso, error) {
	q := `SELECT id, nome, COALESCE(descricao, ''), permissoes::text, ativo FROM grupos_acesso ORDER BY id ASC`
	var lista []GrupoAcesso
	rows, err := m.Conexao.Query(q)
	if err != nil { return nil, err }
	defer rows.Close()
	
	for rows.Next() {
		var g GrupoAcesso
		err := rows.Scan(&g.ID, &g.Nome, &g.Descricao, &g.Permissoes, &g.Ativo)
		if err == nil { lista = append(lista, g) }
	}
	return lista, nil
}

func (m *MotorBD) SalvarGrupoAcesso(g GrupoAcesso) error {
	if g.ID == 0 {
		_, err := m.Conexao.Exec("INSERT INTO grupos_acesso (nome, descricao, permissoes, ativo) VALUES ($1, $2, CAST($3 AS jsonb), $4)",
			g.Nome, g.Descricao, g.Permissoes, g.Ativo)
		return err
	}
	_, err := m.Conexao.Exec("UPDATE grupos_acesso SET nome=$1, descricao=$2, permissoes=CAST($3 AS jsonb), ativo=$4 WHERE id=$5",
		g.Nome, g.Descricao, g.Permissoes, g.Ativo, g.ID)
	return err
}

func (m *MotorBD) VincularUsuariosGrupo(idGrupo int, idsUsuarios []int) error {
	tx, err := m.Conexao.Begin()
	if err != nil { return err }
	
	// Remove os usuários que estavam neste grupo (regra: 1 usuário = 1 grupo)
	_, err = tx.Exec("UPDATE usuarios SET grupo_acesso_id = NULL WHERE grupo_acesso_id = $1", idGrupo)
	if err != nil {
		tx.Rollback()
		return err
	}
	
	// Atrela os novos usuários
	for _, id := range idsUsuarios {
		_, err = tx.Exec("UPDATE usuarios SET grupo_acesso_id = $1 WHERE id = $2", idGrupo, id)
		if err != nil {
			tx.Rollback()
			return err
		}
	}
	
	return tx.Commit()
}

func (m *MotorBD) RemoverVinculoUsuarioGrupo(idUsuario int) error {
	_, err := m.Conexao.Exec("UPDATE usuarios SET grupo_acesso_id = NULL WHERE id = $1", idUsuario)
	return err
}

func (m *MotorBD) GetPermissoesGrupo(idGrupo int) (string, error) {
	var permissoes string
	err := m.Conexao.QueryRow("SELECT permissoes::text FROM grupos_acesso WHERE id = $1 AND ativo = true", idGrupo).Scan(&permissoes)
	if err != nil {
		return "", err
	}
	return permissoes, nil
}
