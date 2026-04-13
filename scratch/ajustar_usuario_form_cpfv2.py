import re

# -------------------------------------------------------------
# 1. Update ponte_principal.go to expose GetProximoIDUsuario
# -------------------------------------------------------------
with open("ponte_principal.go", "r", encoding="utf-8") as f:
    ponte_code = f.read()

nova_funcao = """
func (a *App) GetProximoIDUsuario() int {
	if a.banco == nil { return 1 }
	max, _ := a.banco.GetProximoIDUsuario()
	return max
}
"""

if "func (a *App) GetProximoIDUsuario()" not in ponte_code:
    ponte_code += "\n" + nova_funcao
    with open("ponte_principal.go", "w", encoding="utf-8") as f:
        f.write(ponte_code)

# -------------------------------------------------------------
# 2. Update formulario_usuario.html
# -------------------------------------------------------------
with open("frontend/paginas/parametros/formularios/formulario_usuario.html", "r", encoding="utf-8") as f:
    form_html = f.read()

# Make CPF auto format
form_html = form_html.replace(
    """<input type="text" id="usr-cpf" class="sig-input-dense w-full font-mono font-bold" placeholder="000.000.000-00">""",
    """<input type="text" id="usr-cpf" class="sig-input-dense w-full font-mono font-bold" placeholder="000.000.000-00" oninput="this.value = this.value.replace(/\\D/g, '').replace(/(\\d{3})(\\d)/, '$1.$2').replace(/(\\d{3})(\\d)/, '$1.$2').replace(/(\\d{3})(\\d{1,2})$/, '$1-$2')" maxlength="14">"""
)

# Remove CEP Button and add onblur config
form_html = form_html.replace(
    """<label class="sig-label-dense flex justify-between items-center">CEP <button type="button" onclick="consultarCEP()" class="text-[8px] text-sig-blue font-black hover:underline uppercase">BUSCAR</button></label>""",
    """<label class="sig-label-dense flex justify-between items-center">CEP</label>"""
)
form_html = form_html.replace(
    """<input type="text" id="usr-cep" class="sig-input-dense w-full font-mono font-bold" placeholder="00000-000">""",
    """<input type="text" id="usr-cep" class="sig-input-dense w-full font-mono font-bold" placeholder="00000-000" onblur="consultarCEP()" oninput="this.value = this.value.replace(/\\D/g, '').replace(/^(\\d{5})(\\d)/, '$1-$2')" maxlength="9">"""
)

# Initial Password readonly
form_html = form_html.replace(
    """<input type="text" id="usr-senha" class="sig-input-dense w-full font-mono text-sig-blue" value="sig123">""",
    """<input type="text" id="usr-senha" class="sig-input-dense w-full font-mono text-sig-blue bg-slate-100 placeholder-slate-400" value="sig123" readonly>"""
)

with open("frontend/paginas/parametros/formularios/formulario_usuario.html", "w", encoding="utf-8") as f:
    f.write(form_html)

# -------------------------------------------------------------
# 3. Update parametros.js
# -------------------------------------------------------------
with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_code = f.read()

# Add getProximoIDUsuario to abrirModalUsuario
if "let proxM = await engine.main.App.GetProximoIDUsuario();" not in js_code:
    js_code = js_code.replace(
        """    document.getElementById('usr-id').value = '';""",
        """    try {
        const engine = window.goEngine || window.go;
        let proxM = await engine.main.App.GetProximoIDUsuario();
        document.getElementById('usr-id').value = proxM;
    } catch(e) { document.getElementById('usr-id').value = ''; }"""
    )

with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
    f.write(js_code)
