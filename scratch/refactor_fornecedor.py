import re
import os

js_path = r"frontend/componentes/modal_fornecedor.js"
with open(js_path, "r", encoding="utf-8") as f:
    content = f.read()

# Extract HTML string
html_match = re.search(r"window\.ModalFornecedorHTML = `([\s\S]*?)`;", content)
os.makedirs("frontend/componentes/ui_global", exist_ok=True)

if html_match:
    html_content = html_match.group(1)
    with open("frontend/componentes/ui_global/formulario_fornecedor_global.html", "w", encoding="utf-8") as html_f:
        html_f.write(html_content)

new_js = re.sub(r"window\.ModalFornecedorHTML = `[\s\S]*?`;", "", content)

fetch_logic = """
        if (!document.getElementById('modal-fornecedor-rapido')) {
            const res = await fetch('../../componentes/ui_global/formulario_fornecedor_global.html');
            const html = await res.text();
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            document.body.appendChild(wrapper.firstElementChild);
        }
"""
new_js = re.sub(r"if \(\!document\.getElementById\('modal-fornecedor-rapido'\)\) \{[\s\S]*?\}", fetch_logic.strip(), new_js)

with open("frontend/componentes/ui_global/modal_fornecedor.js", "w", encoding="utf-8") as js_f:
    js_f.write(new_js)

if os.path.exists(js_path):
    os.remove(js_path)
