import os

marcas_html = """
<div class="mb-4 flex items-end justify-between border-b border-slate-100 pb-3 shrink-0 px-2 bg-slate-50/20">
    <div>
        <h2 class="sig-header-classic">Parâmetros de Marcas</h2>
        <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 opacity-70">Gerenciamento de marcas</p>
    </div>
    <button onclick="abrirModalGenerico('Marca', 'salvarBdMarca')" class="sig-btn sig-btn-primary shadow-sm flex items-center gap-2">
        <span class="text-xs">+</span> Nova Marca
    </button>
</div>
<div class="flex-1 overflow-y-auto border border-slate-200 rounded-sm bg-white">
    <table class="sig-table sig-table-sm w-full">
        <thead class="sticky top-0 bg-slate-100 shadow-sm z-10 border-b border-slate-200">
            <tr>
                <th class="w-20 sig-text-center">ID</th>
                <th>Nome da Marca</th>
                <th class="w-32 sig-text-center">Margem (%)</th>
                <th class="w-24 sig-text-center">Ações</th>
            </tr>
        </thead>
        <tbody id="corpo-tabela-marcas"></tbody>
    </table>
</div>
"""

categorias_html = """
<div class="mb-4 flex items-end justify-between border-b border-slate-100 pb-3 shrink-0 px-2 bg-slate-50/20">
    <div>
        <h2 class="sig-header-classic">Parâmetros de Categorias</h2>
        <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 opacity-70">Sessões e subcategorias</p>
    </div>
    <button onclick="abrirModalGenerico('Categoria', 'salvarBdCategoria')" class="sig-btn sig-btn-primary shadow-sm flex items-center gap-2">
        <span class="text-xs">+</span> Nova Categoria
    </button>
</div>
<div class="flex-1 overflow-y-auto border border-slate-200 rounded-sm bg-white">
    <table class="sig-table sig-table-sm w-full">
        <thead class="sticky top-0 bg-slate-100 shadow-sm z-10 border-b border-slate-200">
            <tr>
                <th class="w-20 sig-text-center">ID / PAI</th>
                <th>Estrutura do Sistema</th>
                <th class="w-24 sig-text-center">Ações</th>
            </tr>
        </thead>
        <tbody id="corpo-tabela-categorias"></tbody>
    </table>
</div>
"""

with open("frontend/paginas/parametros/tabelas/marcas_tabela.html", "w", encoding="utf-8") as f:
    f.write(marcas_html)

with open("frontend/paginas/parametros/tabelas/categorias_tabela.html", "w", encoding="utf-8") as f:
    f.write(categorias_html)

produtos_path = "frontend/paginas/parametros/tabelas/produtos_tabela.html"
if os.path.exists(produtos_path):
    os.remove(produtos_path)
