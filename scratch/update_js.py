import re
import os

js_path = r"frontend/paginas/parametros/parametros.js"
with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

# REMOVE mudarSubAba logic from parametros.js
js = re.sub(r"window\.mudarSubAba = \(abaId\) => \{[\s\S]*?\}\n\};\n*", "", js)

# REPLACE mostrarAba ('produtos') with 'marcas' and 'categorias'
def replace_mostrarAba(match):
    return """} else if (abaId === 'marcas') {
        const abaEl = document.getElementById('aba-marcas');
        if (abaEl.innerHTML.includes('CONTEÚDO INJETADO') || abaEl.innerHTML.trim() === '') {
            abaEl.innerHTML = '<div class="p-10 flex flex-col items-center justify-center text-slate-400 gap-2 font-bold text-xs"><span class="material-symbols-outlined animate-spin text-2xl">sync</span> Carregando UI...</div>';
            fetch('./tabelas/marcas_tabela.html').then(r => r.text()).then(html => {
                abaEl.innerHTML = html;
                renderizarMockTabela('corpo-tabela-marcas', 4, 'Carregando Marcas...');
                setTimeout(() => carregarMarcas(), 100);
            }).catch(e => { abaEl.innerHTML = `<div class="p-10 text-red-500">Falha ao carregar componente: ${e.message}</div>`; });
        } else {
            renderizarMockTabela('corpo-tabela-marcas', 4, 'Carregando Marcas...');
            setTimeout(() => carregarMarcas(), 100);
        }
    } else if (abaId === 'categorias') {
        const abaEl = document.getElementById('aba-categorias');
        if (abaEl.innerHTML.includes('CONTEÚDO INJETADO') || abaEl.innerHTML.trim() === '') {
            abaEl.innerHTML = '<div class="p-10 flex flex-col items-center justify-center text-slate-400 gap-2 font-bold text-xs"><span class="material-symbols-outlined animate-spin text-2xl">sync</span> Carregando UI...</div>';
            fetch('./tabelas/categorias_tabela.html').then(r => r.text()).then(html => {
                abaEl.innerHTML = html;
                renderizarMockTabela('corpo-tabela-categorias', 3, 'Carregando Categorias...');
                setTimeout(() => carregarCategorias(), 100);
            }).catch(e => { abaEl.innerHTML = `<div class="p-10 text-red-500">Falha ao carregar componente: ${e.message}</div>`; });
        } else {
            renderizarMockTabela('corpo-tabela-categorias', 3, 'Carregando Categorias...');
            setTimeout(() => carregarCategorias(), 100);
        }
    }"""

js = re.sub(r"\} else if \(abaId === 'produtos'\) \{[\s\S]*?\}\n    \}", replace_mostrarAba, js)

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js)
