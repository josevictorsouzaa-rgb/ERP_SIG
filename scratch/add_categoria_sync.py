import os

# -------------------------------------------------------------
# 1. Update produtos.go (Backend)
# -------------------------------------------------------------
with open("motor/produtos.go", "r", encoding="utf-8") as f:
    bd_code = f.read()

nova_query = """
func (m *MotorBD) GetProximoIDCategoria() (int, error) {
	var nID int
	err := m.Conexao.QueryRow("SELECT COALESCE(MAX(id), 0) + 1 FROM categorias").Scan(&nID)
	return nID, err
}

func (m *MotorBD) GetProximoIDSubcategoria() (int, error) {
	var nID int
	err := m.Conexao.QueryRow("SELECT COALESCE(MAX(id), 0) + 1 FROM subcategorias").Scan(&nID)
	return nID, err
}
"""

if "func (m *MotorBD) GetProximoIDCategoria()" not in bd_code:
    bd_code = bd_code.replace(
        "func (m *MotorBD) SalvarCategoria(",
        nova_query + "\nfunc (m *MotorBD) SalvarCategoria("
    )
    with open("motor/produtos.go", "w", encoding="utf-8") as f:
        f.write(bd_code)


# -------------------------------------------------------------
# 2. Update ponte_principal.go
# -------------------------------------------------------------
with open("ponte_principal.go", "r", encoding="utf-8") as f:
    ponte_code = f.read()

nova_ponte = """
func (a *App) GetProximoIDCategoria() int {
	if a.banco == nil { return 1 }
	max, _ := a.banco.GetProximoIDCategoria()
	return max
}

func (a *App) GetProximoIDSubcategoria() int {
	if a.banco == nil { return 1 }
	max, _ := a.banco.GetProximoIDSubcategoria()
	return max
}
"""
if "func (a *App) GetProximoIDCategoria()" not in ponte_code:
    ponte_code += "\n" + nova_ponte
    with open("ponte_principal.go", "w", encoding="utf-8") as f:
        f.write(ponte_code)


# -------------------------------------------------------------
# 3. Update categorias_tabela.html
# -------------------------------------------------------------
with open("frontend/paginas/parametros/tabelas/categorias_tabela.html", "r", encoding="utf-8") as f:
    html_code = f.read()

# Make ID visible, remove cancel button just in case
html_code = html_code.replace(
    """                        <input type="hidden" id="categoria-id">
                        <input type="hidden" id="categoria-tipo"> <!-- 'CATEGORIA' ou 'SUBCATEGORIA' -->
                        <input type="hidden" id="categoria-pai-id">
                        
                        <div>
                            <label class="sig-label-dense">NOME / DESCRITIVO OFICIAL *</label>
                            <input type="text" id="categoria-nome" class="sig-input-dense w-full uppercase font-bold text-sig-blue" placeholder="EX: ELÉTRICA">
                        </div>""",
    """                        <input type="hidden" id="categoria-tipo"> <!-- 'CATEGORIA' ou 'SUBCATEGORIA' -->
                        <input type="hidden" id="categoria-pai-id">
                        
                        <div class="grid grid-cols-12 gap-3">
                            <div class="col-span-3">
                                <label class="sig-label-dense text-center">ID</label>
                                <input type="text" id="categoria-id" class="sig-input-dense w-full bg-slate-50 font-mono text-center text-slate-400" readonly placeholder="-">
                            </div>
                            <div class="col-span-9">
                                <label class="sig-label-dense">NOME / DESCRITIVO OFICIAL *</label>
                                <input type="text" id="categoria-nome" class="sig-input-dense w-full uppercase font-bold text-sig-blue" placeholder="EX: ELÉTRICA">
                            </div>
                        </div>"""
)
html_code = html_code.replace(
    """<button onclick="fecharModalCategoria()" class="sig-btn sig-btn-neutral w-28 uppercase text-[10px] font-bold">
                <span class="material-symbols-outlined !text-[16px]">close</span> Cancelar
            </button>""",
    ""
)
with open("frontend/paginas/parametros/tabelas/categorias_tabela.html", "w", encoding="utf-8") as f:
    f.write(html_code)


# -------------------------------------------------------------
# 4. Update parametros.js
# -------------------------------------------------------------
with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_code = f.read()

js_code = js_code.replace(
    """    document.getElementById('categoria-id').value = '';
    document.getElementById('categoria-tipo').value = 'CATEGORIA';""",
    """    
    try {
        const engine = window.goEngine || window.go;
        let prox = await engine.main.App.GetProximoIDCategoria();
        document.getElementById('categoria-id').value = prox;
    } catch(e) { document.getElementById('categoria-id').value = ''; }
    document.getElementById('categoria-tipo').value = 'CATEGORIA';
    window.isEdicaoCategoria = false;"""
)

js_code = js_code.replace(
    """    document.getElementById('categoria-id').value = '';
    document.getElementById('categoria-tipo').value = 'SUBCATEGORIA';""",
    """    
    try {
        const engine = window.goEngine || window.go;
        let prox = await engine.main.App.GetProximoIDSubcategoria();
        document.getElementById('categoria-id').value = prox;
    } catch(e) { document.getElementById('categoria-id').value = ''; }
    document.getElementById('categoria-tipo').value = 'SUBCATEGORIA';
    window.isEdicaoCategoria = false;"""
)

js_code = js_code.replace(
    "document.getElementById('titulo-modal-categoria').innerText = 'EDITAR CATEGORIA';",
    "window.isEdicaoCategoria = true;\n    document.getElementById('titulo-modal-categoria').innerText = 'EDITAR CATEGORIA';"
)

js_code = js_code.replace(
    "document.getElementById('titulo-modal-categoria').innerText = 'EDITAR SUBCATEGORIA';",
    "window.isEdicaoCategoria = true;\n    document.getElementById('titulo-modal-categoria').innerText = 'EDITAR SUBCATEGORIA';"
)

js_code = js_code.replace(
    "const id = document.getElementById('categoria-id').value;",
    "const id = window.isEdicaoCategoria ? document.getElementById('categoria-id').value : 0;"
)

with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
    f.write(js_code)
