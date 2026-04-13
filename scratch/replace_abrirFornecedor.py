import re
import os

js_path = r"frontend/paginas/parametros/parametros.js"
with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

# Delete local modal logic for Fornecedor
js = re.sub(r"// MODAL FORNECEDORES\s*window\.abrirModalFornecedor[\s\S]*?(?=\n// MODAL )", "", js)

replacement = """
// MODAL FORNECEDORES REFERÊNCIA GLOBAL
window.carregarFornecedoresParametros = () => {
    carregarFornecedores();
};

window.abrirModalFornecedor = () => {
    if (typeof abrirCadastroRapidoFornecedor === 'function') {
        abrirCadastroRapidoFornecedor();
    } else {
        alert("Componente Global de Fornecedores não carregado!");
    }
};
"""
js += replacement + "\n"

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js)

# Delete local fornecedor HTML
local_form = "frontend/paginas/parametros/formularios/formulario_fornecedor.html"
if os.path.exists(local_form):
    os.remove(local_form)
