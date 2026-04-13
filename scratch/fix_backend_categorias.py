import re

# 1. Update motor/produtos.go
with open("motor/produtos.go", "r", encoding="utf-8") as f:
    go_content = f.read()

# SalvarCategoria
salvar_cat_old = """func (m *MotorBD) SalvarCategoria(nome string) error {
	_, err := m.Conexao.Exec(`
		INSERT INTO categorias (nome) VALUES ($1)
		ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
	`, nome)
	return err
}"""
salvar_cat_new = """func (m *MotorBD) SalvarCategoria(id int, nome string) error {
	var err error
	if id > 0 {
		_, err = m.Conexao.Exec(`UPDATE categorias SET nome = $1 WHERE id = $2`, nome, id)
	} else {
		_, err = m.Conexao.Exec(`INSERT INTO categorias (nome) VALUES ($1)`, nome)
	}
	return err
}"""
go_content = go_content.replace(salvar_cat_old, salvar_cat_new)

# SalvarSubcategoria
salvar_sub_old = """func (m *MotorBD) SalvarSubcategoria(categoriaId int, nome string) error {
	_, err := m.Conexao.Exec(`
		INSERT INTO subcategorias (categoria_id, nome) VALUES ($1, $2)
		ON CONFLICT (categoria_id, nome) DO UPDATE SET nome = EXCLUDED.nome
	`, categoriaId, nome)
	return err
}"""
salvar_sub_new = """func (m *MotorBD) SalvarSubcategoria(id int, categoriaId int, nome string) error {
	var err error
	if id > 0 {
		_, err = m.Conexao.Exec(`UPDATE subcategorias SET nome = $1, categoria_id = $2 WHERE id = $3`, nome, categoriaId, id)
	} else {
		_, err = m.Conexao.Exec(`INSERT INTO subcategorias (categoria_id, nome) VALUES ($1, $2)`, categoriaId, nome)
	}
	return err
}"""
go_content = go_content.replace(salvar_sub_old, salvar_sub_new)

with open("motor/produtos.go", "w", encoding="utf-8") as f:
    f.write(go_content)

# 2. Update ponte_principal.go
with open("ponte_principal.go", "r", encoding="utf-8") as f:
    ponte_content = f.read()

# We need to add the methods to App struct in ponte_principal.go
new_methods = """
func (a *App) SalvarCategoria(id int, nome string) error {
	if a.banco == nil { return nil }
	return a.banco.SalvarCategoria(id, nome)
}

func (a *App) ExcluirCategoria(id int) error {
	if a.banco == nil { return nil }
	return a.banco.ExcluirCategoria(id)
}

func (a *App) SalvarSubcategoria(id int, categoriaId int, nome string) error {
	if a.banco == nil { return nil }
	return a.banco.SalvarSubcategoria(id, categoriaId, nome)
}

func (a *App) ExcluirSubcategoria(id int) error {
	if a.banco == nil { return nil }
	return a.banco.ExcluirSubcategoria(id)
}
"""

if "SalvarCategoria(" not in ponte_content:
    ponte_content = ponte_content.replace(
        """func (a *App) ListarSubcategorias() []motor.Subcategoria {""",
        new_methods + "\n" + """func (a *App) ListarSubcategorias() []motor.Subcategoria {"""
    )
    with open("ponte_principal.go", "w", encoding="utf-8") as f:
        f.write(ponte_content)

# 3. Update parametros.js
with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_content = f.read()

# Update the JS caller for the new signatures
js_content = js_content.replace("await engine.main.App.SalvarCategoria(nome)", "await engine.main.App.SalvarCategoria(parseInt(id) || 0, nome)")
js_content = js_content.replace("await engine.main.App.SalvarSubcategoria(parseInt(paiId), nome)", "await engine.main.App.SalvarSubcategoria(parseInt(id) || 0, parseInt(paiId), nome)")

with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
    f.write(js_content)
