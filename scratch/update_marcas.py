import os
import re

# 1. Rename and update form
generico_path = r"frontend\paginas\parametros\formularios\formulario_generico.html"
marca_path = r"frontend\paginas\parametros\formularios\formulario_marca.html"

# If it happens to be renamed already or missing, create it from the skeleton we know
if os.path.exists(generico_path):
    with open(generico_path, "r", encoding="utf-8") as f:
        html = f.read()
    os.remove(generico_path)
else:
    html = """<!-- MODAL MARCA -->
<div id="modal-marca" class="fixed flex inset-0 bg-black/60 z-[99] justify-center items-center p-4 animate-opacity hidden">
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
                        <div id="box-margem">
                            <label class="sig-label-dense text-sig-blue">MARGEM PADRÃO (%) / MARKUP BASE</label>
                            <input type="number" id="marca-margem" class="sig-input-dense w-full font-black text-sig-blue bg-slate-50 border-slate-200" step="0.01" placeholder="0.00" value="0.00">
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 px-6">
            <button onclick="fecharModalMarca()" class="sig-btn text-slate-500 hover:bg-slate-200 uppercase text-[10px] font-bold px-6 py-2">Cancelar</button>
            <button id="btn-salvar-marca" onclick="salvarBdMarca()" type="button" class="sig-btn sig-btn-primary min-w-[180px] shadow-lg flex items-center justify-center gap-2">
                <span class="material-symbols-outlined !text-[18px]">save</span>
                <span class="tracking-widest font-black uppercase text-[10px]">Gravar Marca</span>
            </button>
        </div>
    </div>
</div>"""

html = html.replace('modal-generico', 'modal-marca')
html = html.replace('gen-', 'marca-')
html = html.replace('fecharModalGenerico()', 'fecharModalMarca()')
html = html.replace('titulo-modal-generico', 'titulo-modal-marca')
html = html.replace('Cadastro Auxiliar de Sistema', 'Cadastro de Marca')
html = html.replace('INFORMAÇÕES DO REGISTRO', 'INFORMAÇÕES DA MARCA')
# ensure box margem is not hidden:
html = html.replace('id="marca-box-margem" class="hidden"', 'id="marca-box-margem"')
html = html.replace('id="btn-salvar-marca" class="sig-btn', 'id="btn-salvar-marca" onclick="salvarBdMarca()" class="sig-btn')

with open(marca_path, "w", encoding="utf-8") as f:
    f.write(html)


# 2. Update marcas_tabela.html
tabela_path = r"frontend\paginas\parametros\tabelas\marcas_tabela.html"
with open(tabela_path, "r", encoding="utf-8") as f:
    tb = f.read()

tb = tb.replace("abrirModalGenerico('Marca', 'salvarBdMarca')", "abrirModalMarca()")
tb = re.sub(r'<th class="w-24 sig-text-center">Ações</th>', '<th class="w-32 sig-text-center">Ações</th>', tb)
tb = re.sub(r'<th class="w-20 sig-text-center">ID</th>', '<th class="w-16 sig-text-center">ID</th>', tb)

with open(tabela_path, "w", encoding="utf-8") as f:
    f.write(tb)

# 3. Modify parametros.js
js_path = r"frontend\paginas\parametros\parametros.js"
with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

# Replace carregarMarcas block
def replace_carregarMarcas(match):
    return """async function carregarMarcas() {
    const tb = document.getElementById('corpo-tabela-marcas');
    try {
        const engine = window.goEngine || window.go;
        let list = await engine.main.App.ListarMarcas() || [];
        window.marcasAtuais = list;
        let dom = "";
        if (list.length === 0) { dom = `<tr><td colspan="4" class="text-center py-4 text-slate-400">Nenhuma marca encontrada</td></tr>`; }
        list.forEach(i => {
            const mg = parseFloat(i.margem_padrao || i.mkp_balcao || 0).toFixed(2);
            dom += `
                <tr class="hover:bg-slate-50 border-b border-slate-100">
                    <td class="sig-text-center font-black text-slate-400">${i.id || '-'}</td>
                    <td class="font-bold text-[10px] uppercase">${i.nome || '-'}</td>
                    <td class="sig-text-center text-sig-blue font-black tracking-widest">${mg}%</td>
                    <td class="sig-text-center space-x-1">
                        <button onclick="editarMarca(${i.id})" title="Editar" class="w-6 h-6 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-colors"><span class="material-symbols-outlined !text-[14px]">edit</span></button>
                        <button onclick="desabilitarMarca(${i.id})" title="Desabilitar" class="w-6 h-6 rounded bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 transition-colors"><span class="material-symbols-outlined !text-[14px]">block</span></button>
                        <button onclick="excluirMarca(${i.id})" title="Excluir" class="w-6 h-6 rounded bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 transition-colors"><span class="material-symbols-outlined !text-[14px]">delete</span></button>
                    </td>
                </tr>
            `;
        });
        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = ''; }
}"""

js = re.sub(r"async function carregarMarcas\(\) \{[\s\S]*?\}\n\}", replace_carregarMarcas, js)

# In case my previous regex delete the '}' char let me fix the pattern:
# Actually a simpler match: 
import re
js = re.sub(r"async function carregarMarcas\(\) \{.*?(?=async function carregarCategorias)", replace_carregarMarcas(None) + "\n\n", js, flags=re.DOTALL)


# Append new modal marca logic at end
marca_logic = """
// ==========================================
// MODAL MARCA
// ==========================================
window.abrirModalMarca = async (id = 0) => {
    try {
        if (!document.getElementById('modal-marca')) {
            const res = await fetch('./formularios/formulario_marca.html');
            const html = await res.text();
            document.body.insertAdjacentHTML('beforeend', html);
        }
        
        document.getElementById('marca-id').value = id > 0 ? id : 0;
        document.getElementById('marca-nome').value = '';
        document.getElementById('marca-margem').value = '0.00';
        document.getElementById('titulo-modal-marca').innerText = id > 0 ? 'Editar Marca' : 'Cadastro de Marca';
        
        if (id > 0 && window.marcasAtuais) {
            const marca = window.marcasAtuais.find(m => m.id === id);
            if (marca) {
                document.getElementById('marca-nome').value = marca.nome;
                document.getElementById('marca-margem').value = parseFloat(marca.margem_padrao || marca.mkp_balcao || 0).toFixed(2);
            }
        }
        
        const modal = document.getElementById('modal-marca');
        modal.classList.remove('hidden');
        modal.classList.add('flex', 'fixed', 'inset-0', 'bg-black/60', 'z-[99]', 'justify-center', 'items-center');
        document.getElementById('marca-nome').focus();
    } catch(err) {
        if(window.sigToast) window.sigToast("Erro interno ao carregar a interface da marca.", "error");
        console.error(err);
    }
};

window.fecharModalMarca = () => {
    const m = document.getElementById('modal-marca');
    if(m){ m.classList.add('hidden'); m.classList.remove('flex'); }
};

window.salvarBdMarca = async () => {
    const id = parseInt(document.getElementById('marca-id').value) || 0;
    let nome = document.getElementById('marca-nome').value.trim();
    let margem = parseFloat(document.getElementById('marca-margem').value) || 0;
    
    if (!nome) {
        if(window.sigToast) window.sigToast("O nome da Marca é obrigatório.", "error");
        else alert("Nome obrigatório");
        return;
    }
    
    // Verificacao de nome duplicado (case insensitive)
    if (window.marcasAtuais) {
        const existente = window.marcasAtuais.find(m => m.nome.toUpperCase() === nome.toUpperCase() && m.id !== id);
        if (existente) {
            if(window.sigToast) window.sigToast("Erro: Esta marca já está cadastrada.", "error");
            else alert("Erro: Marca já cadastrada.");
            return;
        }
    }
    
    let marcaData = {
        id: id,
        nome: nome.toUpperCase(),
        margem_padrao: margem,
        mkp_balcao: margem,
        ativo: true
    };
    
    try {
        const engine = window.goEngine || window.go;
        if (engine && engine.main && engine.main.App && engine.main.App.SalvarMarca) {
            const res = await engine.main.App.SalvarMarca(marcaData);
            if (res && res.startsWith("Erro")) {
                if(window.sigToast) window.sigToast(res, "error");
            } else {
                fecharModalMarca();
                carregarMarcas();
            }
        } else {
            console.warn("API de Marcas não conectada.");
            fecharModalMarca();
        }
    } catch(e) {
        if(window.sigToast) window.sigToast("Erro de comunicação ao salvar Marca.", "error");
        console.error(e);
    }
};

window.editarMarca = (id) => {
    abrirModalMarca(id);
};

window.excluirMarca = async (id) => {
    if(confirm("Deseja realmente deletar esta marca de forma permanente?")) {
        try {
            const engine = window.goEngine || window.go;
            if(engine && engine.main && engine.main.App && engine.main.App.DeletarMarca) {
                await engine.main.App.DeletarMarca(id);
                if(window.sigToast) window.sigToast("Marca deletada com sucesso.", "success");
                carregarMarcas();
            } else {
                 if(window.sigToast) window.sigToast("Função DeletarMarca não encontrada.", "error");
            }
        } catch(e) {
            if(window.sigToast) window.sigToast("Falha ao deletar.", "error");
        }
    }
};

window.desabilitarMarca = async (id) => {
    if(window.sigToast) window.sigToast("Desabilitar ainda não implementado no Backend", "warning");
};

"""
js += "\n" + marca_logic

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js)
