package main

import (
	"context"
	_ "embed"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"

	"core-erp/motor"

	"github.com/jackc/pgx/v5"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed build/appicon.png
var iconBytes []byte

type App struct {
	ctx           context.Context
	banco         *motor.MotorBD
	ModuloInicial string
	OperadorAtual motor.Usuario
}

func NovoApp(modulo string, authID int) *App {
	strCon := "postgres://postgres:123@localhost:5432/postgres?sslmode=disable"
	dbMotor, err := motor.NovoMotor(strCon)
	if err != nil {
		fmt.Printf("❌ ERRO FATAL DE BANCO: %v\n", err)
	}

	app := &App{banco: dbMotor, ModuloInicial: modulo}
	
	if authID > 0 {
		usr, err := dbMotor.GetUsuarioPorID(authID)
		if err == nil {
			app.OperadorAtual = usr
		}
	}
	
	return app
}

func (a *App) GetModuloInicial() string {
	return a.ModuloInicial
}

func (a *App) MaximizarJanela() {
	if a.ctx != nil {
		runtime.WindowMaximise(a.ctx)
	}
}

func (a *App) MostrarAlerta(titulo string, mensagem string) {
	if a.ctx != nil {
		runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
			Type:          runtime.ErrorDialog,
			Title:         titulo,
			Message:       mensagem,
			Buttons:       []string{"OK"},
			DefaultButton: "OK",
		})
	}
}

func (a *App) AbrirModulo(nome string) {
	exePath, err := os.Executable()
	if err != nil {
		fmt.Println("Erro ao obter executável:", err)
		return
	}

	// Inicia o módulo em um novo processo
	cmd := exec.Command(exePath, "-module", nome, "-auth", fmt.Sprintf("%d", a.OperadorAtual.ID))
	
	// No Windows, podemos usar flags para ocultar o console se necessário, 
	// mas para o Wails o padrão costuma funcionar.
	err = cmd.Start()
	if err != nil {
		fmt.Printf("Erro ao abrir módulo %s: %v\n", nome, err)
		return
	}

	// Wait in background and notify parent Wails when child process window closes natively
	go func() {
		cmd.Wait()
		a.NotificarSelecao("MODULO_FECHADO|" + nome)
	}()
}

func (a *App) NotificarSelecao(payload string) {
	if a.banco != nil && a.banco.Conexao != nil {
		// Envia um push de notificação direto para o bus do postgres
		_, err := a.banco.Conexao.Exec("NOTIFY sig_events, '" + payload + "'")
		if err != nil {
			fmt.Println("Erro ao notificar banco:", err)
		}
	}
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
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    uf CHAR(2),
    cep TEXT,
    telefone TEXT,
    tipo TEXT,
    cnae_principal TEXT,
    cnae_secundarios TEXT,
    is_matriz BOOLEAN DEFAULT false,
    matriz_id INTEGER,
    usa_estoque_compartilhado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

	err := a.banco.CriarTabelasIniciais(schemaEmpresas)
	if err != nil {
		fmt.Printf("Erro na migração inicial: %v\n", err)
	}

	err = a.banco.SetupProdutosData()
	if err != nil {
		fmt.Printf("Erro ao criar tabelas de produtos: %v\n", err)
	}

	// Setup Compras
	err = a.banco.SetupTabelasCompras()
	if err != nil {
		fmt.Printf("Erro ao criar tabelas de compras: %v\n", err)
	}

	// Setup Grupos de Acesso
	err = a.banco.SetupTabelasAcesso()
	if err != nil {
		fmt.Printf("Erro ao criar tabelas de acessos: %v\n", err)
	}

	// Sincronizar Sequência de IDs de Produtos para evitar erro de ID duplicado
	a.banco.Conexao.Exec("SELECT setval('produtos_id_seq', (SELECT COALESCE(MAX(id), 0) FROM produtos) + 1, false)")

	fmt.Println("Conexão com PostgreSQL estabelecida com sucesso.")
	go a.EscutarBanco()
}

func (a *App) EscutarBanco() {
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
		notif, err := conn.WaitForNotification(context.Background())
		if err != nil {
			fmt.Printf("Alerta: Event Bus desconectado: %v\n", err)
			return
		}

		if notif.Payload == "FazerLogout" {
			if a.ModuloInicial != "" {
				// Eu sou um módulo filho (executável secundário), devo me matar!
				os.Exit(0)
			}
		}

		if a.ctx != nil {
			runtime.EventsEmit(a.ctx, "db_event", notif.Payload)
		}
	}
}

func (a *App) FazerLogout() {
	if a.banco != nil {
		a.banco.Notificar("sig_events", "FazerLogout")
	}
}

func (a *App) ConfirmarSaida() string {
	res, err := runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:          runtime.QuestionDialog,
		Title:         "SIG | Encerramento de Sessão",
		Message:       "Deseja realmente sair do sistema?\nTodas as suas janelas de módulos abertas serão permanentemente fechadas.",
		DefaultButton: "Não",
		Icon:          iconBytes,
	})
	if err != nil {
		return "Yes"
	}
	return res
}

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

func (a *App) ObterEmpresa(id int) motor.Empresa {
	if a.banco == nil {
		return motor.Empresa{}
	}
	e, err := a.banco.ObterEmpresa(id)
	if err != nil {
		fmt.Printf("❌ Erro ao obter empresa: %v\n", err)
		return motor.Empresa{}
	}
	return e
}

func (a *App) GravarEmpresa(e motor.Empresa) string {
	if a.banco == nil {
		return "Erro: Conexão com o banco não inicializada."
	}
	err := a.banco.SalvarEmpresa(e)
	if err != nil {
		return err.Error()
	}
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "db_event", "empresas_changed")
	}
	return "OK"
}

func (a *App) DeletarEmpresa(id int) string {
	if a.banco == nil {
		return "Erro: Conexão com o banco não inicializada."
	}
	err := a.banco.ExcluirEmpresa(id)
	if err != nil {
		return err.Error()
	}
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "db_event", "empresas_changed")
	}
	return "OK"
}

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
	return "Descontinuado"
}

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

func (a *App) ObterDescricaoCFOP(codigo string) string {
	if a.banco == nil {
		return ""
	}
	return a.banco.ObterDescricaoCFOP(codigo)
}

func (a *App) BuscarDescricaoCFOP(codigo string) string {
	return a.ObterDescricaoCFOP(codigo)
}

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

// --- MÉTODOS DE MATRIZ FISCAL (AUTOMATION ENGINE V4) ---

func (a *App) SugerirFiscal(empresaID int, terceiroID int, produtoID int, operacao string) motor.MatrizFiscal {
	if a.banco == nil { return motor.MatrizFiscal{} }

	ctx := motor.ContextoFiscal{Operacao: operacao}

	// 1. Dados da Empresa (Empresa Logada ou Matriz)
	emp, err := a.banco.ObterEmpresa(empresaID)
	if err == nil {
		ctx.RegimeTributario = emp.RegimeTributario
		if operacao == "SAIDA" {
			ctx.UFOrigem = emp.UF
		} else {
			ctx.UFDestino = emp.UF
		}
	}

	// 2. Dados do Parceiro (Fornecedor/Cliente)
	terc, err := a.banco.ObterFornecedor(terceiroID)
	if err == nil {
		if operacao == "ENTRADA" {
			ctx.UFOrigem = terc.UF
		} else {
			ctx.UFDestino = terc.UF
		}
	}

	// 3. Dados do Produto
	prod, err := a.banco.ObterProduto(produtoID)
	if err == nil {
		ctx.Ncm = prod.Ncm
		ctx.IncidenciaST = prod.TemSt
	}

	// 4. Resolver Decisão
	res, err := a.banco.ResolverMatrizFiscal(ctx)
	if err != nil {
		// Retornamos o nome com erro para capturar no front
		return motor.MatrizFiscal{Nome: "ERRO_MATCH:" + err.Error()}
	}

	return res
}

func (a *App) ResolverMatrizFiscal(ctx motor.ContextoFiscal) motor.MatrizFiscal {
	if a.banco == nil { return motor.MatrizFiscal{} }
	res, err := a.banco.ResolverMatrizFiscal(ctx)
	if err != nil {
		fmt.Printf("⚠️ ResolverMatrizFiscal: %v\n", err)
		return motor.MatrizFiscal{}
	}
	return res
}

func (a *App) ListarAliquotasFiscais() []motor.AliquotaFiscal {
	if a.banco == nil { return []motor.AliquotaFiscal{} }
	lista, _ := a.banco.ListarAliquotasFiscais()
	return lista
}

func (a *App) SalvarAliquotaFiscal(aliquota motor.AliquotaFiscal) string {
	if a.banco == nil { return "ERRO: Banco não conectado" }
	id, err := a.banco.SalvarAliquotaFiscal(aliquota)
	if err != nil { return "ERRO: " + err.Error() }
	return fmt.Sprintf("OK|%d", id)
}

func (a *App) ExcluirAliquotaFiscal(id int) string {
	if a.banco == nil { return "ERRO: Banco não conectado" }
	err := a.banco.ExcluirAliquotaFiscal(id)
	if err != nil { return "ERRO: " + err.Error() }
	return "OK"
}

func (a *App) ResolverAliquotas(ctx motor.ContextoFiscal, mf motor.MatrizFiscal) motor.AliquotaFiscal {
	if a.banco == nil { return motor.AliquotaFiscal{} }
	res, err := a.banco.ResolverAliquotas(ctx, mf)
	if err != nil { return motor.AliquotaFiscal{Nome: "ERRO: " + err.Error()} }
	return res
}

func (a *App) ListarMatrizesFiscais() []motor.MatrizFiscal {
	if a.banco == nil { return []motor.MatrizFiscal{} }
	lista, err := a.banco.ListarMatrizesFiscais()
	if err != nil {
		fmt.Printf("❌ Erro ao listar matrizes: %v\n", err)
		return []motor.MatrizFiscal{}
	}
	return lista
}

func (a *App) SalvarMatrizFiscal(mf motor.MatrizFiscal) string {
	if a.banco == nil { return "Erro: Banco offline" }
	_, err := a.banco.SalvarMatrizFiscal(mf)
	if err != nil {
		return err.Error()
	}
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "db_event", "matriz_changed")
	}
	return "OK"
}

func (a *App) ExcluirMatrizFiscal(id int) string {
	if a.banco == nil { return "Erro: Banco offline" }
	err := a.banco.ExcluirMatrizFiscal(id)
	if err != nil {
		return err.Error()
	}
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "db_event", "matriz_changed")
	}
	return "OK"
}
func (a *App) ConfigurarMatrizPadrao(ramo string) string {
	err := a.banco.ConfigurarMatrizPadraoSimplesNacional()
	if err != nil {
		return fmt.Sprintf("Erro ao configurar: %v", err)
	}
	return "OK"
}

// --- MÓDULO DE ACESSO (USUÁRIOS E FUNÇÕES) ---
func (a *App) GetProximoIDUsuario() int {
	if a.banco == nil { return 0 }
	id, _ := a.banco.GetProximoIDUsuario()
	return id
}

func (a *App) ListarUsuarios() []motor.Usuario {
	if a.banco == nil { return []motor.Usuario{} }
	lista, _ := a.banco.ListarUsuarios()
	return lista
}

func (a *App) SalvarUsuario(u motor.Usuario) string {
	if a.banco == nil { return "Erro: Banco offline" }
	err := a.banco.SalvarUsuario(u)
	if err != nil {
		return err.Error()
	}
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "db_event", "usuarios_changed")
	}
	return "OK"
}

func (a *App) AutenticarLogin(login string, senha string) map[string]interface{} {
	resp := make(map[string]interface{})
	if a.banco == nil {
		resp["status"] = "erro"
		resp["mensagem"] = "SISTEMA OFFLINE"
		return resp
	}
	
	usr, err := a.banco.Autenticar(login, senha)
	if err != nil {
		resp["status"] = "erro"
		resp["mensagem"] = err.Error()
		return resp
	}
	
	a.OperadorAtual = usr // Guarda sessão na Bridge
	resp["status"] = "ok"
	resp["usuario"] = usr
	return resp
}

func (a *App) GetOperadorLogado() motor.Usuario {
	return a.OperadorAtual
}

func (a *App) AlterarSenhaOperadorLogado(novaSenha string) string {
	if a.banco == nil { return "Erro: Banco offline" }
	if a.OperadorAtual.ID <= 0 { return "Nenhum usuário logado" }
	
	err := a.banco.RedefinirPropriaSenha(a.OperadorAtual.ID, novaSenha)
	if err != nil {
		return err.Error()
	}
	
	a.OperadorAtual.PrecisaAlterarSenha = false
	return "OK"
}

func (a *App) ExcluirUsuario(id int) string {
	if a.banco == nil { return "Erro: Banco offline" }
	err := a.banco.ExcluirUsuario(id)
	if err != nil {
		return err.Error()
	}
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "db_event", "usuarios_changed")
	}
	return "OK"
}

func (a *App) ListarFuncoes() []motor.Funcao {
	if a.banco == nil { return []motor.Funcao{} }
	lista, _ := a.banco.ListarFuncoes()
	return lista
}

func (a *App) ResetarSenhaUsuario(id int) string {
	if a.banco == nil { return "Erro: Banco offline" }
	err := a.banco.ResetarSenha(id, "sig123")
	if err != nil {
		return err.Error()
	}
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "db_event", "usuarios_changed")
	}
	return "OK"
}

// --- MÉTODOS DE PRODUTOS (CADASTRADOS NO BANCO REAL) ---

func (a *App) ObterProximoIdProduto() int {
	if a.banco == nil { return 1 }
	id, _ := a.banco.ObterProximoIdProduto()
	return id
}

func (a *App) ListarProdutos() []motor.Produto {
	if a.banco == nil { return []motor.Produto{} }
	lista, err := a.banco.ListarProdutos()
	if err != nil {
		fmt.Println("CRITICAL Erro ListarProdutos BD:", err)
		os.WriteFile("debug_prod.txt", []byte(err.Error()), 0644)
	}
	if len(lista) > 0 {
		import_json, _ := json.MarshalIndent(lista[0], "", "  ")
		os.WriteFile("debug_json.txt", import_json, 0644)
	}
	return lista
}

func (a *App) ObterProduto(id int) motor.Produto {
	if a.banco == nil { return motor.Produto{} }
	p, _ := a.banco.ObterProduto(id)
	return p
}

func (a *App) ListarAplicacoesDoProduto(id int) []motor.AplicacaoProduto {
	if a.banco == nil { return []motor.AplicacaoProduto{} }
	lista, _ := a.banco.ListarAplicacoesDoProduto(id)
	return lista
}

func (a *App) ListarConversoesDoProduto(id int) []motor.ProdutoConversao {
	if a.banco == nil { return []motor.ProdutoConversao{} }
	lista, _ := a.banco.ListarConversoesDoProduto(id)
	return lista
}

func (a *App) VerificarSKUExistente(sku string, idAtual int) bool {
	if a.banco == nil { return false }
	return a.banco.VerificarSKUExistente(sku, idAtual)
}

func (a *App) SalvarProduto(p motor.Produto) string {
	if a.banco == nil { return "Erro: Banco offline" }
	id, err := a.banco.SalvarProduto(p)
	if err != nil {
		return err.Error()
	}
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "db_event", "produtos_changed")
	}
	return fmt.Sprintf("ID:%d", id)
}

func (a *App) SalvarImagensProduto(produtoID int, imagensBase64 []string) string {
	if a.banco == nil { return "Erro: Banco offline" }
	err := a.banco.SalvarImagensProduto(produtoID, imagensBase64)
	if err != nil {
		return err.Error()
	}
	return "OK"
}

func (a *App) ListarImagensProduto(produtoID int) []string {
	if a.banco == nil { return []string{} }
	return a.banco.ListarImagensProduto(produtoID)
}

func (a *App) ObterPrimeiraImagemB64(produtoID int) string {
	if a.banco == nil { return "" }
	lista := a.banco.ListarImagensProduto(produtoID)
	if len(lista) == 0 { return "" }
	b, err := os.ReadFile(lista[0])
	if err != nil { return "" }
	return "data:image/jpeg;base64," + base64.StdEncoding.EncodeToString(b)
}

func (a *App) ExcluirProduto(id int) string {
	if a.banco == nil { return "Erro: Banco offline" }
	err := a.banco.ExcluirProduto(id)
	if err != nil {
		return err.Error()
	}
	if a.ctx != nil {
		runtime.EventsEmit(a.ctx, "db_event", "produtos_changed")
	}
	return "OK"
}

func (a *App) ListarCategorias() []motor.Categoria {
	if a.banco == nil { return []motor.Categoria{} }
	lista, _ := a.banco.ListarCategorias()
	return lista
}

func (a *App) ListarSubcategorias() []motor.Subcategoria {
	if a.banco == nil { return []motor.Subcategoria{} }
	lista, _ := a.banco.ListarSubcategorias()
	return lista
}

func (a *App) ListarUnidadesMedida() []motor.UnidadeMedida {
	if a.banco == nil { return []motor.UnidadeMedida{} }
	lista, _ := a.banco.ListarUnidadesMedida()
	return lista
}

func (a *App) ListarMovimentacoesProduto(produtoID int) []motor.MovimentacaoEstoqueDto {
	if a.banco == nil { return []motor.MovimentacaoEstoqueDto{} }
	lista, err := a.banco.ListarMovimentacoesProduto(produtoID)
	if err != nil {
		fmt.Printf("Erro ao listar historico: %v\n", err)
		return []motor.MovimentacaoEstoqueDto{}
	}
	return lista
}

func (a *App) ObterMarcasVeiculos() []string {
	if a.banco == nil { return []string{} }
	lista, _ := a.banco.ObterMarcasVeiculos()
	return lista
}

func (a *App) ObterModelosVeiculos(marca string) []string {
	if a.banco == nil { return []string{} }
	lista, _ := a.banco.ObterModelosVeiculos(marca)
	return lista
}

func (a *App) ObterVersoesAnosVeiculos(marca, modelo string) []string {
	if a.banco == nil { return []string{} }
	lista, _ := a.banco.ObterVersoesAnosVeiculos(marca, modelo)
	return lista
}

func (a *App) PesquisarProdutosAvancado(f motor.FiltrosProdutos) []motor.Produto {
	if a.banco == nil { return []motor.Produto{} }
	lista, err := a.banco.PesquisarProdutosAvancado(f)
	if err != nil {
		fmt.Println("CRITICAL Erro Pesquisa BD:", err)
		os.WriteFile("debug_search.txt", []byte(err.Error()), 0644)
	}
	if len(lista) > 0 {
		import_json, _ := json.MarshalIndent(lista[0], "", "  ")
		os.WriteFile("debug_search_json.txt", import_json, 0644)
	}
	return lista
}

func (a *App) SalvarSolicitacaoCompra(s motor.SolicitacaoCompra) string {
	if a.banco == nil { return "Erro: Banco não conectado" }
	err := a.banco.SalvarSolicitacaoCompra(s)
	if err != nil {
		fmt.Printf("Erro ao salvar: %v\n", err)
		return "Erro: " + err.Error()
	}
	return "OK"
}

func (a *App) ListarSolicitacoesCompra() []motor.SolicitacaoCompra {
	if a.banco == nil { return []motor.SolicitacaoCompra{} }
	lista, err := a.banco.ListarSolicitacoesCompra()
	if err != nil {
		fmt.Printf("Erro ao listar compras: %v\n", err)
		return []motor.SolicitacaoCompra{}
	}
	return lista
}

// --- CONTROLE DE ACESSOS (RBAC) ---

func (a *App) SalvarGrupoAcesso(g motor.GrupoAcesso) string {
	if a.banco == nil { return "Erro: Banco não conectado" }
	err := a.banco.SalvarGrupoAcesso(g)
	if err != nil { return "Erro: " + err.Error() }
	
	// Utiliza o Event Bus cross-processo do Postgres!
	a.banco.Notificar("sig_events", "atualizacao_permissoes")
	
	return "OK"
}

func (a *App) ListarGruposAcesso() []motor.GrupoAcesso {
	if a.banco == nil { return []motor.GrupoAcesso{} }
	lista, err := a.banco.ListarGruposAcesso()
	if err != nil { return []motor.GrupoAcesso{} }
	return lista
}

func (a *App) VincularUsuariosGrupo(idGrupo int, idsUsuarios []int) string {
	if a.banco == nil { return "Erro: Banco não conectado" }
	err := a.banco.VincularUsuariosGrupo(idGrupo, idsUsuarios)
	if err != nil { return "Erro: " + err.Error() }
	
	a.banco.Notificar("sig_events", "atualizacao_permissoes")
	
	return "OK"
}

func (a *App) RemoverVinculoUsuarioGrupo(idUsuario int) string {
	if a.banco == nil { return "Erro: Banco não conectado" }
	err := a.banco.RemoverVinculoUsuarioGrupo(idUsuario)
	if err != nil { return "Erro: " + err.Error() }
	
	a.banco.Notificar("sig_events", "atualizacao_permissoes")
	
	return "OK"
}

func (a *App) GetPermissoesLogado() string {
	if a.banco == nil || a.OperadorAtual.ID <= 0 {
		return "[]"
	}
	
	// Para garantir sincronia absoluta via IPC multi-janela, atualizamos o ID na base ativamente.
	usrDB, err := a.banco.GetUsuarioPorID(a.OperadorAtual.ID)
	if err == nil {
		a.OperadorAtual.GrupoAcessoID = usrDB.GrupoAcessoID
	}

	if a.OperadorAtual.GrupoAcessoID == 0 {
		return "[]"
	}

	permissoes, err := a.banco.GetPermissoesGrupo(a.OperadorAtual.GrupoAcessoID)
	if err != nil || permissoes == "" {
		return "[]"
	}
	return permissoes
}

// --- FORNECEDORES ---
func (a *App) GetProximoIDFornecedor() int {
	if a.banco == nil { return 1 }
	id, _ := a.banco.GetProximoIDFornecedor()
	return id
}

func (a *App) SalvarFornecedor(f motor.Fornecedor) string {
	if a.banco == nil { return "Erro: Sem BD" }
	id, err := a.banco.SalvarFornecedor(f)
	if err != nil { return err.Error() }
	return fmt.Sprintf("ID:%d", id)
}

func (a *App) ExcluirFornecedor(id int) string {
	if a.banco == nil { return "Erro: Sem BD" }
	_, err := a.banco.Conexao.Exec("DELETE FROM fornecedores WHERE id=$1", id)
	if err != nil { return err.Error() }
	return "OK"
}
