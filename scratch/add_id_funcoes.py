import os

# -------------------------------------------------------------
# 1. Update banco.go
# -------------------------------------------------------------
with open("motor/banco.go", "r", encoding="utf-8") as f:
    banco_code = f.read()

nova_funcao_banco = """
func (m *MotorBD) GetProximoIDFuncao() (int, error) {
	var nID int
	err := m.Conexao.QueryRow("SELECT COALESCE(MAX(id), 0) + 1 FROM funcoes").Scan(&nID)
	return nID, err
}
"""
if "func (m *MotorBD) GetProximoIDFuncao()" not in banco_code:
    banco_code = banco_code.replace(
        "func (m *MotorBD) ListarFuncoes() ([]Funcao, error) {",
        nova_funcao_banco + "\nfunc (m *MotorBD) ListarFuncoes() ([]Funcao, error) {"
    )
    with open("motor/banco.go", "w", encoding="utf-8") as f:
        f.write(banco_code)


# -------------------------------------------------------------
# 2. Update ponte_principal.go
# -------------------------------------------------------------
with open("ponte_principal.go", "r", encoding="utf-8") as f:
    ponte_code = f.read()

nova_funcao_ponte = """
func (a *App) GetProximoIDFuncao() int {
	if a.banco == nil { return 1 }
	max, _ := a.banco.GetProximoIDFuncao()
	return max
}
"""
if "func (a *App) GetProximoIDFuncao()" not in ponte_code:
    ponte_code += "\n" + nova_funcao_ponte
    with open("ponte_principal.go", "w", encoding="utf-8") as f:
        f.write(ponte_code)


# -------------------------------------------------------------
# 3. Update parametros.js
# -------------------------------------------------------------
with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_code = f.read()

js_code = js_code.replace(
    "document.getElementById('fun-id').value = '';",
    """try {
        const engine = window.goEngine || window.go;
        let proxM = await engine.main.App.GetProximoIDFuncao();
        document.getElementById('fun-id').value = proxM;
    } catch(e) { document.getElementById('fun-id').value = ''; }"""
)

with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
    f.write(js_code)


# -------------------------------------------------------------
# 4. Update formulario_funcao.html
# -------------------------------------------------------------
with open("frontend/paginas/parametros/formularios/formulario_funcao.html", "r", encoding="utf-8") as f:
    form_html = f.read()

form_html = form_html.replace(
    """                    <div class="p-2">
                        <input type="hidden" id="fun-id">
                        <div>
                            <label class="sig-label-dense">NOME DO CARGO / DESCRIÇÃO DA FUNÇÃO *</label>
                            <input type="text" id="fun-nome" class="sig-input-dense w-full uppercase font-black text-sig-blue" placeholder="EX: VENDEDOR EXTERNO">
                        </div>
                    </div>""",
    """                    <div class="p-2 grid grid-cols-12 gap-3">
                        <div class="col-span-3">
                            <label class="sig-label-dense text-center">ID</label>
                            <input type="text" id="fun-id" class="sig-input-dense w-full bg-slate-50 font-mono text-center text-slate-400" readonly placeholder="-">
                        </div>
                        <div class="col-span-9">
                            <label class="sig-label-dense">NOME DO CARGO / DESCRIÇÃO DA FUNÇÃO *</label>
                            <input type="text" id="fun-nome" class="sig-input-dense w-full uppercase font-black text-sig-blue" placeholder="EX: VENDEDOR EXTERNO">
                        </div>
                    </div>"""
)

with open("frontend/paginas/parametros/formularios/formulario_funcao.html", "w", encoding="utf-8") as f:
    f.write(form_html)
