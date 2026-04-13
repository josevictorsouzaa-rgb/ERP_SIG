import os

with open("ponte_principal.go", "r", encoding="utf-8") as f:
    go_code = f.read()

nova_funcao = """
func (a *App) ListarFuncoes() []motor.Funcao {
	if a.banco == nil { return []motor.Funcao{} }
	lista, _ := a.banco.ListarFuncoes()
	return lista
}
"""

if "func (a *App) ListarFuncoes" not in go_code:
    go_code += "\n" + nova_funcao
    with open("ponte_principal.go", "w", encoding="utf-8") as f:
        f.write(go_code)
