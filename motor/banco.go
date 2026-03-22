package motor

import (
	"database/sql"
	"fmt"

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
	Bairro            string `json:"bairro"`
	Cidade            string `json:"cidade"`
	UF                string `json:"uf"`
	CEP               string `json:"cep"`
	Telefone          string `json:"telefone"`
	Tipo              string `json:"tipo"`
	IsMatriz          bool   `json:"is_matriz"`
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

	// Garantir colunas novas (Migração PostgreSQL)
	m.Conexao.Exec("ALTER TABLE empresas ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT;")

	// TABELA DE FORNECEDORES
	m.Conexao.Exec(`
		CREATE TABLE IF NOT EXISTS fornecedores (
			id SERIAL PRIMARY KEY,
			razao_social TEXT NOT NULL,
			fantasia TEXT,
			cnpj TEXT UNIQUE,
			ie TEXT,
			email TEXT,
			telefone TEXT,
			cidade TEXT,
			uf CHAR(2),
			criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
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
	`)

	return nil
}

// ListarEmpresas: Retorna todas as empresas do banco
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
			is_matriz 
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
			&e.IsMatriz,
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
		INSERT INTO empresas (razao_social, fantasia, cnpj, inscricao_estadual, regime_tributario, logradouro, numero, bairro, cidade, uf, cep, telefone, tipo, is_matriz)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
			tipo = EXCLUDED.tipo
	`
	_, err := m.Conexao.Exec(query, 
		e.RazaoSocial, e.Fantasia, e.CNPJ, e.InscricaoEstadual, e.RegimeTributario, 
		e.Logradouro, e.Numero, e.Bairro, e.Cidade, e.UF, e.CEP, e.Telefone, e.Tipo, e.IsMatriz)
	if err == nil {
		m.Notificar("sig_events", "empresas_changed")
	}
	return err
}

// ExcluirEmpresa: Remove uma empresa pelo ID
func (m *MotorBD) ExcluirEmpresa(id int) error {
	_, err := m.Conexao.Exec("DELETE FROM empresas WHERE id = $1 AND is_matriz = false", id)
	if err == nil {
		m.Notificar("sig_events", "empresas_changed")
	}
	return err
}

// --- MÓDULO DE USUÁRIOS ---

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
	PrecisaAlterarSenha bool   `json:"precisa_alterar_senha"`
	Ativo               bool   `json:"ativo"`
}

type Funcao struct {
	ID   int    `json:"id"`
	Nome string `json:"nome"`
}

func (m *MotorBD) ListarUsuarios() ([]Usuario, error) {
	query := `
		SELECT 
			u.id, u.nome, u.sobrenome, u.cpf, u.rg,
			u.data_nascimento::text, u.data_admissao::text,
			u.cep, u.logradouro, u.numero, u.complemento, u.bairro, u.cidade, u.uf,
			u.login, u.funcao_id, f.nome, u.precisa_alterar_senha, u.ativo 
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
		var sobrenome, cpf, rg, dNasc, dAdm, cep, log, num, comp, bairro, cidade, uf, nomeFuncao sql.NullString

		err := rows.Scan(
			&u.ID, &u.Nome, &sobrenome, &cpf, &rg,
			&dNasc, &dAdm, &cep, &log, &num, &comp, &bairro, &cidade, &uf,
			&u.Login, &u.FuncaoID, &nomeFuncao, &u.PrecisaAlterarSenha, &u.Ativo,
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
		u.NomeFuncao = nomeFuncao.String
		if u.NomeFuncao == "" {
			u.NomeFuncao = "N/A"
		}

		lista = append(lista, u)
	}
	return lista, nil
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
