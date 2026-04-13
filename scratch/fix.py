import re
import glob
import os

js_path = r"frontend/paginas/parametros/parametros.js"
with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

# Restore mudarSubAba
js = re.sub(
    r"(window\.mudarSubAba = \(abaId\) => \{[\s\S]*?if\s*\(abaId === 'marcas'\)\s*\{)[\s\S]*?(} else if \(abaId === 'categorias'\) \{)[\s\S]*?(}\n\};)",
    r"\1\n        renderizarMockTabela('corpo-tabela-marcas', 4, 'Carregando Marcas...');\n        setTimeout(() => carregarMarcas(), 100);\n    \2\n        renderizarMockTabela('corpo-tabela-categorias', 3, 'Carregando Categorias...');\n        setTimeout(() => carregarCategorias(), 100);\n    \3",
    js
)

# Insert fetch for produtos in mostrarAba
js = re.sub(
    r"(} // abaId === 'produtos' uses 'mudarSubAba' to fetch specifically what's visible)",
    r"""} else if (abaId === 'produtos') {
        const abaEl = document.getElementById('aba-produtos');
        if (abaEl.innerHTML.includes('CONTEÚDO INJETADO') || abaEl.innerHTML.trim() === '') {
            abaEl.innerHTML = '<div class="p-10 flex flex-col items-center justify-center text-slate-400 gap-2 font-bold text-xs"><span class="material-symbols-outlined animate-spin text-2xl">sync</span> Carregando UI...</div>';
            fetch('./tabelas/produtos_tabela.html').then(r => r.text()).then(html => {
                abaEl.innerHTML = html;
                mudarSubAba('marcas');
            }).catch(e => { abaEl.innerHTML = `<div class="p-10 text-red-500">Falha ao carregar componente tabela: ${e.message}</div>`; });
        } else {
            mudarSubAba('marcas');
        }
    }""",
    js
)

# Fix open modal paths
js = js.replace("fetch('./modais/modal_", "fetch('./formularios/formulario_")
js = js.replace("fetch('./modais/", "fetch('./formularios/")
js = js.replace("formulario_empresa", "formulario_cadastro_de_empresa")

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js)

# Rename files in formularios starting with modal_ to formulario_
for f_path in glob.glob("frontend/paginas/parametros/formularios/modal_*.html"):
    new_name = os.path.basename(f_path).replace("modal_", "formulario_")
    new_path = os.path.join(os.path.dirname(f_path), new_name)
    os.rename(f_path, new_path)

# Delete modal_empresa.html if it exists
if os.path.exists("frontend/paginas/parametros/formularios/formulario_empresa.html"):
    os.remove("frontend/paginas/parametros/formularios/formulario_empresa.html")
if os.path.exists("frontend/paginas/parametros/formularios/modal_empresa.html"):
    os.remove("frontend/paginas/parametros/formularios/modal_empresa.html")

