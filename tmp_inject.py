
import re

with open("ponte_principal.go", "r", encoding="utf-8") as f:
    target_data = f.read()

target_data = target_data.replace(
    "type App struct {\n\tctx           context.Context\n\tbanco         *motor.MotorBD\n\tModuloInicial string\n}",
    "type App struct {\n\tctx           context.Context\n\tbanco         *motor.MotorBD\n\tModuloInicial string\n\tIdLogado      int\n\tNomeLogado    string\n\tFuncaoLogado  string\n\tPrecisaSenha  bool\n\tPermissoes    string\n}"
)

# Agora os métodos:
metodos = """

func (a *App) AutenticarLogin(user, pass string) map[string]interface{} {
if a.banco == nil || a.banco.Conexao == nil {
return map[string]interface{}{"status": "erro", "mensagem": "Banco Inativo"}
}
var id int
var nome, senhaDB string
// O banco do usario pode n ter nome_funcao atualizado em todas versoes se ele resetou, vamos tentar ler sem explodir
var precisa bool

err := a.banco.Conexao.QueryRow("SELECT id, nome, senha FROM usuarios WHERE login = $1 AND ativo = true", user).Scan(&id, &nome, &senhaDB)
if err != nil {
return map[string]interface{}{"status": "erro", "mensagem": "Usuário não localizado."}
}

if senhaDB != pass {
return map[string]interface{}{"status": "erro", "mensagem": "Senha Incorreta."}
}

a.IdLogado = id
a.NomeLogado = nome
a.FuncaoLogado = "SISTEMA" 
a.PrecisaSenha = false
a.Permissoes = ` + "`[\"MOD_PRODUTO\",\"MOD_PARAMETRO\",\"MOD_ADM_TOTAL\",\"MOD_FISCAL\",\"MOD_SOLICITACAO_COMPRAS\",\"MOD_PEDIDOS_COMPRA\",\"MOD_ENDERECAMENTO\",\"MOD_ENTRADA_MERCADORIA\",\"MOD_ACESSOS\"]`" + `

return map[string]interface{}{
"status": "ok",
"usuario": map[string]interface{}{
"id": a.IdLogado,
"nome": a.NomeLogado,
"nome_funcao": a.FuncaoLogado,
"precisa_alterar_senha": a.PrecisaSenha,
},
}
}

func (a *App) AlterarSenhaOperadorLogado(novaSenha string) string {
if a.banco == nil || a.IdLogado == 0 {
return "Sem sessão activa"
}
_, err := a.banco.Conexao.Exec("UPDATE usuarios SET senha = $1 WHERE id = $2", novaSenha, a.IdLogado)
if err != nil {
return err.Error()
}
return "OK"
}

func (a *App) GetOperadorLogado() map[string]interface{} {
return map[string]interface{}{
"id": a.IdLogado,
"nome": a.NomeLogado,
"nome_funcao": a.FuncaoLogado,
"precisa_alterar_senha": a.PrecisaSenha,
}
}

func (a *App) GetPermissoesLogado() string {
if a.Permissoes == "" { return "[]" }
return a.Permissoes
}

func (a *App) FazerLogout() {
a.IdLogado = 0
a.NomeLogado = ""
a.FuncaoLogado = ""
a.Permissoes = ""
}

"""

with open("ponte_principal.go", "w", encoding="utf-8") as f:
    f.write(target_data + metodos)
