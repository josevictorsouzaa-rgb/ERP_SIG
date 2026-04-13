import re

# 1. Update form
html = """<!-- MODAL MARCA -->
<div id="modal-marca" class="fixed inset-0 bg-black/60 z-[99] hidden justify-center items-center p-4 animate-opacity">
    <div class="bg-white w-full max-w-[450px] rounded-md shadow-2xl overflow-hidden border border-slate-400">
        <div class="bg-slate-50 p-2 px-4 flex justify-between items-center border-b border-slate-300">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-slate-500 text-sm">settings_suggest</span>
                <h3 id="titulo-modal-marca" class="text-slate-700 font-bold text-[11px] uppercase tracking-wider">Cadastro de Marca</h3>
            </div>
            <button onclick="fecharModalMarca()" class="sig-btn-close !w-7 !h-7">
                <span class="material-symbols-outlined !text-base">close</span>
            </button>
        </div>
        <div class="p-8">
            <form id="form-marca" class="space-y-6">
                <div class="sig-fieldset-blueprint w-full">
                    <span class="sig-legend-blueprint w-auto font-black px-2">INFORMAÇÕES DA MARCA</span>
                    <div class="space-y-4 p-2">
                        <input type="hidden" id="marca-id">
                        <div>
                            <label class="sig-label-dense">NOME / DESCRITIVO OFICIAL *</label>
                            <input type="text" id="marca-nome" class="sig-input-dense w-full uppercase font-bold text-sig-blue" placeholder="EX: BOSCH">
                        </div>
                        <div id="marca-box-margem">
                            <label class="sig-label-dense text-sig-blue">MARGEM PADRÃO (%) / MARKUP BASE</label>
                            <div class="relative flex items-center">
                                <input type="number" id="marca-margem" class="sig-input-dense w-full pr-8 font-black text-sig-blue bg-slate-50 border-slate-200" step="0.01" placeholder="0.00" value="0.00">
                                <span class="absolute right-3 text-slate-400 font-bold">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 px-6">
            <button onclick="fecharModalMarca()" class="sig-btn sig-btn-neutral w-28 uppercase text-[10px] font-bold">
                <span class="material-symbols-outlined !text-[16px]">close</span> Cancelar
            </button>
            <button id="btn-salvar-marca" onclick="salvarBdMarca()" type="button" class="sig-btn sig-btn-primary min-w-[150px] shadow-sm flex items-center justify-center gap-2">
                <span class="material-symbols-outlined !text-[18px]">save</span>
                <span class="tracking-widest font-black uppercase text-[10px]">Gravar Marca</span>
            </button>
        </div>
    </div>
</div>"""

with open(r"frontend/paginas/parametros/formularios/formulario_marca.html", "w", encoding="utf-8") as f:
    f.write(html)


# 2. Update tabela HTML
tb_html = """
<div class="mb-4 flex items-end justify-between border-b border-slate-100 pb-3 shrink-0 px-2 bg-slate-50/20">
    <div>
        <h2 class="sig-header-classic">Parâmetros de Marcas</h2>
        <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 opacity-70">Gerenciamento de marcas</p>
    </div>
    <button onclick="abrirModalMarca()" class="sig-btn sig-btn-success shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined !text-[16px]">add_circle</span> NOVA MARCA
    </button>
</div>
<div class="flex-1 overflow-y-auto border border-slate-200 rounded-sm bg-white">
    <table class="sig-table sig-table-sm w-full">
        <thead class="sticky top-0 bg-slate-100 shadow-sm z-10 border-b border-slate-200">
            <tr>
                <th class="w-16 sig-text-center border-r border-slate-200">ID</th>
                <th>NOME DA MARCA</th>
                <th class="w-32 sig-text-center border-l border-slate-200">MARGEM (%)</th>
                <th class="w-32 sig-text-center border-l border-slate-200">STATUS</th>
                <th class="w-24 sig-text-center border-l border-slate-200">AÇÕES</th>
            </tr>
        </thead>
        <tbody id="corpo-tabela-marcas"></tbody>
    </table>
</div>
"""
with open(r"frontend/paginas/parametros/tabelas/marcas_tabela.html", "w", encoding="utf-8") as f:
    f.write(tb_html)

# 3. Modify parametros.js
js_path = r"frontend/paginas/parametros/parametros.js"
with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

def replace_carregarMarcas(match):
    return """async function carregarMarcas() {
    const tb = document.getElementById('corpo-tabela-marcas');
    try {
        const engine = window.goEngine || window.go;
        let list = await engine.main.App.ListarMarcas() || [];
        window.marcasAtuais = list;
        let dom = "";
        if (list.length === 0) { dom = `<tr><td colspan="5" class="text-center py-4 text-slate-400">Nenhuma marca encontrada</td></tr>`; }
        list.forEach(i => {
            const mg = parseFloat(i.margem_padrao || i.mkp_balcao || 0).toFixed(2);
            dom += `
                <tr class="hover:bg-blue-50 cursor-pointer border-b border-slate-100 transition-colors bg-white">
                    <td class="sig-text-center font-black sig-text-mono text-slate-400 border-r border-slate-100">${i.id || '-'}</td>
                    <td class="font-bold text-[11px] uppercase text-slate-700">${i.nome || '-'}</td>
                    <td class="sig-text-center text-sig-blue font-black tracking-widest border-l border-slate-100">${mg}%</td>
                    <td class="sig-text-center border-l border-slate-100">
                        <span class="${i.ativo ? 'sig-badge-success' : 'sig-badge-error'} block w-fit mx-auto" style="font-size: 8px; padding: 1px 4px;">${i.ativo ? 'ATIVO' : 'INATIVO'}</span>
                    </td>
                    <td class="sig-text-center border-l border-slate-100">
                        <div class="flex items-center justify-center gap-1">
                            <button class="sig-btn-icon text-blue-600 hover:bg-blue-100" style="width:20px; height:20px;" title="Editar" onclick="editarMarca(${i.id})"><span class="material-symbols-outlined text-[15px]">edit</span></button>
                            <button class="sig-btn-icon text-amber-600 hover:bg-amber-100" style="width:20px; height:20px;" title="Desabilitar" onclick="desabilitarMarca(${i.id})"><span class="material-symbols-outlined text-[15px]">block</span></button>
                            <button class="sig-btn-icon text-red-600 hover:bg-red-100" style="width:20px; height:20px;" title="Excluir" onclick="excluirMarca(${i.id})"><span class="material-symbols-outlined text-[15px]">delete</span></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = ''; }
}"""

# Use regex to replace block
js = re.sub(r"async function carregarMarcas\(\) \{.*?(?=async function carregarCategorias)", replace_carregarMarcas(None) + "\n\n", js, flags=re.DOTALL)

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js)
