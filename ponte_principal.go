package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"syscall"

	"strings"

	"core-erp/motor"

	"github.com/jackc/pgx/v5"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx           context.Context
	banco         *motor.MotorBD
	ModuloInicial string
}

func NovoApp(modulo string) *App {
	strCon := "postgres://postgres:123@localhost:5432/postgres?sslmode=disable"
	dbMotor, err := motor.NovoMotor(strCon)
	if err != nil {
		fmt.Printf("❌ ERRO FATAL DE BANCO: %v\n", err)
		// Aqui poderíamos emitir um alerta nativo se necessário via OS, 
		// mas o Wails cuidará de não subir se o App estiver inconsistente.
	}

	return &App{banco: dbMotor, ModuloInicial: modulo}
}

// Retorna qual módulo este processo deve carregar
func (a *App) GetModuloInicial() string {
	return a.ModuloInicial
}

func (a *App) CheckStatusConexao() map[string]interface{} {
	status := make(map[string]interface{})
	if a.banco == nil || a.banco.Conexao == nil {
		status["conectado"] = false
		status["erro"] = "Conexão nula ou não inicializada. Verifique se o Postgres está rodando."
		return status
	}
	err := a.banco.Conexao.Ping()
	if err != nil {
		status["conectado"] = false
		status["erro"] = fmt.Sprintf("Erro de Ping: %v", err)
	} else {
		status["conectado"] = true
	}
	return status
}

const schemaEmpresas = `
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    razao_social TEXT NOT NULL,
    fantasia TEXT,
    cnpj TEXT UNIQUE NOT NULL,
    inscricao_estadual TEXT,
    regime_tributario TEXT,
    logradouro TEXT,
    telefone TEXT,
    is_matriz BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO empresas (razao_social, cnpj, is_matriz) 
VALUES ('MINHA EMPRESA MATRIZ', '00.000.000/0001-00', true)
ON CONFLICT (cnpj) DO NOTHING;

CREATE TABLE IF NOT EXISTS funcoes (
    id SERIAL PRIMARY KEY,
    nome TEXT UNIQUE NOT NULL
);

INSERT INTO funcoes (nome) VALUES 
('GERENTE'), ('GESTOR'), ('ADMIN'), ('VENDEDOR'), 
('CAIXA'), ('SEPARADOR'), ('AUXILIAR'), ('ANALISTA')
ON CONFLICT (nome) DO NOTHING;

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    sobrenome TEXT,
    cpf TEXT,
    rg TEXT,
    data_nascimento DATE,
    data_admissao DATE,
    cep TEXT,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    uf TEXT,
    login TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    funcao_id INTEGER REFERENCES funcoes(id),
    precisa_alterar_senha BOOLEAN DEFAULT true,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, login, senha, precisa_alterar_senha)
VALUES ('ADMINISTRADOR', 'admin', 'admin123', true)
ON CONFLICT (login) DO NOTHING;
`

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	
	if a.banco == nil || a.banco.Conexao == nil {
		runtime.MessageDialog(ctx, runtime.MessageDialogOptions{
			Type:    runtime.ErrorDialog,
			Title:   "ERRO DE CONEXÃO",
			Message: "Não foi possível conectar ao banco de dados PostgreSQL.\nCertifique-se que o serviço está rodando na porta 5432 e a senha está correta.",
		})
		os.Exit(1)
		return
	}

	// Migrações graduais (Postgres)
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS sobrenome TEXT;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cpf TEXT;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rg TEXT;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS data_nascimento DATE;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS data_admissao DATE;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cep TEXT;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS logradouro TEXT;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS numero TEXT;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS complemento TEXT;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bairro TEXT;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cidade TEXT;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS uf TEXT;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS funcao_id INTEGER REFERENCES funcoes(id);")
		a.banco.Conexao.Exec("ALTER TABLE usuarios DROP COLUMN IF EXISTS id_terminal;")
		a.banco.Conexao.Exec("ALTER TABLE usuarios DROP COLUMN IF EXISTS endereco;")

		// Forçamos a criação da tabela e das colunas do schemaEmpresas
		err := a.banco.CriarTabelasIniciais(schemaEmpresas)
		if err != nil {
			fmt.Printf("Erro na migração inicial: %v\n", err)
		}

	// Garante que as tabelas de empresas existam
	err = a.banco.CriarTabelasIniciais("")
	if err != nil {
		fmt.Printf("Erro ao criar tabelas base: %v\n", err)
	}

	// Setup das tabelas Padrão de Produtos (Marcas, Categorias, Sub)
	err = a.banco.SetupProdutosData()
	if err != nil {
		fmt.Printf("Erro ao criar tabelas de produtos: %v\n", err)
	}

	fmt.Println("Conexão com PostgreSQL estabelecida com sucesso.")

	// Iniciar escuta de eventos em background
	go a.EscutarBanco()
}

// EscutarBanco: Mantém uma conexão paralela para capturar NOTIFY do Postgres
func (a *App) EscutarBanco() {
	// Usamos a mesma string de conexão (No futuro, carregar de arquivo)
	strCon := "postgres://postgres:123@localhost:5432/postgres?sslmode=disable"

	conn, err := pgx.Connect(context.Background(), strCon)
	if err != nil {
		fmt.Printf("Aviso: Listener não pôde conectar: %v\n", err)
		return
	}
	defer conn.Close(context.Background())

	_, err = conn.Exec(context.Background(), "LISTEN sig_events")
	if err != nil {
		fmt.Printf("Erro ao registrar LISTEN: %v\n", err)
		return
	}

	fmt.Println("📡 SIG-EVENT-BUS: Escuta de eventos em tempo real ativa.")

	for {
		// Bloqueia até receber uma notificação
		notif, err := conn.WaitForNotification(context.Background())
		if err != nil {
			fmt.Printf("Alerta: Event Bus desconectado: %v\n", err)
			return
		}

		// Propaga o evento para o Frontend (Wails Runtime)
		if a.ctx != nil {
			runtime.EventsEmit(a.ctx, "db_event", notif.Payload)
		}
	}
}

// --- MÉTODOS DE EMPRESA (BRIDGE) ---

func (a *App) BuscarEmpresas() []motor.Empresa {
	if a.banco == nil {
		return []motor.Empresa{}
	}
	
	empresas, err := a.banco.ListarEmpresas()
	if err != nil {
		fmt.Printf("❌ Erro ao buscar empresas: %v\n", err)
		return []motor.Empresa{}
	}
	return empresas
}

func (a *App) GravarEmpresa(e motor.Empresa) string {
	if a.banco == nil {
		return "Erro: Conexão com o banco não inicializada."
	}
	err := a.banco.SalvarEmpresa(e)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

// --- MÉTODOS DE ENDEREÇAMENTO (BRIDGE) ---

func (a *App) ListarEnderecamentos(empresaID int) []motor.Enderecamento {
	if a.banco == nil {
		return []motor.Enderecamento{}
	}
	lista, err := a.banco.ListarEnderecamentos(empresaID)
	if err != nil {
		fmt.Printf("Erro ao listar endereçamentos: %v\n", err)
		return []motor.Enderecamento{}
	}
	return lista
}

func (a *App) GravarEnderecamento(e motor.Enderecamento) int {
	if a.banco == nil {
		return 0
	}
	id, err := a.banco.SalvarEnderecamento(e)
	if err != nil {
		fmt.Printf("Erro ao gravar endereçamento: %v\n", err)
		return 0
	}
	return id
}

func (a *App) DeletarEnderecamento(id int) string {
	if a.banco == nil {
		return "Erro: Banco offline"
	}
	err := a.banco.ExcluirEnderecamento(id)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

// -----------------------------------------------------
// FUNÇÕES WAILS PARA PRODUTOS (MARCAS, CATEGORIAS, SUBS)
// -----------------------------------------------------

func (a *App) ListarMarcas() []motor.Marca {
	if a.banco == nil {
		return []motor.Marca{}
	}
	lista, _ := a.banco.ListarMarcas()
	return lista
}

func (a *App) SalvarMarca(nome string, margem float64) string {
	err := a.banco.SalvarMarca(nome, margem)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) ImportarMarcasCSV(csvData string) string {
	if a.banco == nil {
		return "Erro: Banco não inicializado"
	}

	// Helper local para parse manual simples ou usar o que o user passou
	lines := strings.Split(csvData, "\n")
	count := 0
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "\"MAR_COD\"") {
			continue
		}

		// Split simples por vírgula (considerando o formato: ID,NOME,MARGEM)
		parts := strings.Split(line, ",")
		if len(parts) < 3 {
			continue
		}

		nome := strings.Trim(parts[1], "\" ")
		margem := 0.0
		fmt.Sscanf(parts[2], "%f", &margem)

		err := a.banco.SalvarMarca(nome, margem)
		if err == nil {
			count++
		}
	}

	return fmt.Sprintf("OK|%d marcas importadas", count)
}

func (a *App) ExcluirMarca(id int) string {
	err := a.banco.ExcluirMarca(id)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) ListarCategorias() []motor.Categoria {
	if a.banco == nil {
		return []motor.Categoria{}
	}
	lista, _ := a.banco.ListarCategorias()
	return lista
}

func (a *App) SalvarCategoria(nome string) string {
	err := a.banco.SalvarCategoria(nome)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) ExcluirCategoria(id int) string {
	err := a.banco.ExcluirCategoria(id)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) ListarSubcategorias() []motor.Subcategoria {
	if a.banco == nil {
		return []motor.Subcategoria{}
	}
	lista, _ := a.banco.ListarSubcategorias()
	return lista
}

func (a *App) SalvarSubcategoria(categoriaId int, nome string) string {
	err := a.banco.SalvarSubcategoria(categoriaId, nome)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) ExcluirSubcategoria(id int) string {
	err := a.banco.ExcluirSubcategoria(id)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

// -----------------------------------------------------
// FUNÇÕES WAILS PARA PRODUTOS E SIMILARES
// -----------------------------------------------------

func (a *App) ListarProdutos() []motor.Produto {
	if a.banco == nil {
		return []motor.Produto{}
	}
	lista, _ := a.banco.ListarProdutos()
	return lista
}

func (a *App) ObterProximoIdProduto() int {
	if a.banco == nil {
		return 1
	}
	id, _ := a.banco.ObterProximoIdProduto()
	return id
}

func (a *App) SalvarProduto(p motor.Produto) string {
	id, err := a.banco.SalvarProduto(p)
	if err != nil {
		return err.Error()
	}
	return fmt.Sprintf("OK|%d", id)
}

func (a *App) ListarUnidadesMedida() []motor.UnidadeMedida {
	if a.banco == nil {
		return []motor.UnidadeMedida{}
	}
	lista, _ := a.banco.ListarUnidadesMedida()
	return lista
}

func (a *App) ExcluirProduto(id int) string {
	err := a.banco.ExcluirProduto(id)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) VincularSimilar(produtoIdA int, produtoIdB int) string {
	err := a.banco.VincularSimilar(produtoIdA, produtoIdB)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) DesvincularSimilar(produtoIdA int, produtoIdB int) string {
	err := a.banco.DesvincularSimilar(produtoIdA, produtoIdB)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) DeletarEmpresa(id int) bool {
	if a.banco == nil {
		return false
	}
	err := a.banco.ExcluirEmpresa(id)
	return err == nil
}

// Função auxiliar para clonar o executável
func CopiarArquivo(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}

// --- CONTROLE DE JANELAS (NAV) ---

func (a *App) AbrirModulo(nome string) {
	exePath, err := os.Executable()
	if err != nil {
		fmt.Println("Erro ao descobrir executável:", err)
		return
	}

	// 1. DISPARO VIA MESMO EXECUTÁVEL (Grouping fix)
	// Usamos o próprio caminho deste .exe mas passamos o -module nome
	// Isso faz o Windows agrupar no mesmo ícone pois o PROCESSO tem o mesmo nome de arquivo.
	cmd := exec.Command(exePath, "-module", nome)

	// 2. ELIMINAÇÃO DO FLASH CMD (Silent Start)
	// Escondemos a janela de console que o Windows tenta criar ao abrir o processo
	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow: true,
	}

	err = cmd.Start()
	if err != nil {
		fmt.Printf("Erro ao disparar módulo %s: %v\n", nome, err)
	}
}
func (a *App) MaximizarJanela() {
	if a.ctx != nil {
		// Dispara o HUB como um processo totalmente novo e apartado
		a.AbrirModulo("hub")

		// Fecha a tela de login imediatamente
		runtime.Quit(a.ctx)
	}
}

// --- MÉTODOS DE USUÁRIOS (BRIDGE) ---

func (a *App) ListarUsuarios() []motor.Usuario {
	if a.banco == nil {
		return []motor.Usuario{}
	}
	lista, _ := a.banco.ListarUsuarios()
	return lista
}

func (a *App) GetProximoIDUsuario() int {
	if a.banco == nil {
		return 0
	}
	var nextID int
	// No Postgres, pegamos o próximo valor da sequência da tabela usuarios
	err := a.banco.Conexao.QueryRow("SELECT last_value + 1 FROM usuarios_id_seq").Scan(&nextID)
	if err != nil {
		// Fallback caso a sequência tenha nome diferente ou falhe
		a.banco.Conexao.QueryRow("SELECT COALESCE(MAX(id), 0) + 1 FROM usuarios").Scan(&nextID)
	}
	return nextID
}

func (a *App) SalvarUsuario(u motor.Usuario) string {
	if a.banco == nil {
		return "Erro: Banco não inicializado"
	}
	err := a.banco.SalvarUsuario(u)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) ExcluirUsuario(id int) string {
	if a.banco == nil {
		return "Erro: Banco não inicializado"
	}
	err := a.banco.ExcluirUsuario(id)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) ResetarSenha(id int, novaSenha string) string {
	if a.banco == nil {
		return "Erro: Banco não inicializado"
	}
	err := a.banco.ResetarSenha(id, novaSenha)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

// --- BRIDGE FUNÇÕES ---

func (a *App) ListarFuncoes() []motor.Funcao {
	if a.banco == nil {
		return []motor.Funcao{}
	}
	res, err := a.banco.ListarFuncoes()
	if err != nil {
		return []motor.Funcao{}
	}
	return res
}

func (a *App) SalvarFuncao(f motor.Funcao) string {
	if a.banco == nil {
		return "Erro: Banco não inicializado"
	}
	err := a.banco.SalvarFuncao(f)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) ExcluirFuncao(id int) string {
	if a.banco == nil {
		return "Erro: Banco não inicializado"
	}
	err := a.banco.ExcluirFuncao(id)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

// --- MÉTODOS FISCAIS ---

func (a *App) ListarPerfisFiscais() []motor.PerfilFiscal {
	if a.banco == nil {
		return []motor.PerfilFiscal{}
	}
	lista, _ := a.banco.ListarPerfisFiscais()
	return lista
}

func (a *App) SalvarPerfilFiscal(p motor.PerfilFiscal) string {
	if a.banco == nil {
		return "Erro: Banco não inicializado"
	}
	err := a.banco.SalvarPerfilFiscal(p)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) ExcluirPerfilFiscal(id int) string {
	if a.banco == nil {
		return "Erro: Banco não inicializado"
	}
	err := a.banco.ExcluirPerfilFiscal(id)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

// --- MÉTODOS DE ENTRADAS (BRIDGE) ---

func (a *App) ListarEntradas() []motor.Entrada {
	if a.banco == nil {
		return []motor.Entrada{}
	}
	lista, _ := a.banco.ListarEntradas()
	return lista
}

func (a *App) ObterEntrada(id int) motor.Entrada {
	if a.banco == nil {
		return motor.Entrada{}
	}
	e, _ := a.banco.ObterEntrada(id)
	return e
}

func (a *App) SalvarEntrada(e motor.Entrada) string {
	if a.banco == nil {
		return "banco não inicializado"
	}
	id, err := a.banco.SalvarEntrada(e)
	if err != nil {
		return err.Error()
	}
	return fmt.Sprintf("OK|%d", id)
}

func (a *App) ConfirmarEntrada(id int) string {
	if a.banco == nil {
		return "banco não inicializado"
	}
	err := a.banco.ConfirmarEntrada(id)
	if err != nil {
		return err.Error()
	}
	// Emitir evento para o HUB e Janelas de Produto atualizarem estoques
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "estoque_mudou")
	}
	return "OK"
}

func (a *App) ListarFornecedores() []motor.Fornecedor {
	if a.banco == nil {
		return []motor.Fornecedor{}
	}
	lista, _ := a.banco.ListarFornecedores()
	return lista
}

func (a *App) ImportarXML() motor.Entrada {
	if a.ctx == nil || a.banco == nil {
		return motor.Entrada{}
	}

	caminho, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Selecionar XML de Nota Fiscal",
		Filters: []runtime.FileFilter{
			{DisplayName: "Arquivos XML (*.xml)", Pattern: "*.xml"},
		},
	})

	if err != nil || caminho == "" {
		return motor.Entrada{}
	}

	entrada, err := a.banco.ParsearXMLNFe(caminho)
	if err != nil {
		fmt.Println("Erro ao ler XML:", err)
		return motor.Entrada{}
	}

	return entrada
}
