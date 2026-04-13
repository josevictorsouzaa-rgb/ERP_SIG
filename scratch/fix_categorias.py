import sys
import re

html_tabela = """
<div class="mb-4 flex items-end justify-between border-b border-slate-100 pb-3 shrink-0 px-2 bg-slate-50/20">
    <div>
        <h2 class="sig-header-classic">Estrutura de Categorias</h2>
        <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5 opacity-70">Árvore de categorias e subcategorias</p>
    </div>
    <button onclick="abrirModalCategoria()" class="sig-btn sig-btn-success shadow-sm flex items-center gap-2">
        <span class="material-symbols-outlined !text-[16px]">add_circle</span> NOVA CATEGORIA
    </button>
</div>
<div class="flex-1 overflow-y-auto border border-slate-200 rounded-sm bg-white">
    <table class="sig-table w-full">
        <thead class="sticky top-0 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] z-10">
            <tr>
                <th class="w-20 border-r border-slate-200">ID / PAI</th>
                <th>ESTRUTURA HIERÁRQUICA</th>
                <th class="w-36 sig-text-center border-l border-slate-200">AÇÕES</th>
            </tr>
        </thead>
        <tbody id="corpo-tabela-categorias"></tbody>
    </table>
</div>

<!-- Modal Compartilhado para Categoria/Subcategoria -->
<div id="modal-categoria" class="fixed inset-0 bg-black/60 z-[99] hidden justify-center items-center p-4 animate-opacity">
    <div class="bg-white w-full max-w-[450px] rounded-md shadow-2xl overflow-hidden border border-slate-400">
        <div class="bg-slate-50 p-2 px-4 flex justify-between items-center border-b border-slate-300">
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-slate-500 text-sm">account_tree</span>
                <h3 id="titulo-modal-categoria" class="text-slate-700 font-bold text-[11px] uppercase tracking-wider">Cadastro de Categoria</h3>
            </div>
            <button onclick="fecharModalCategoria()" class="sig-btn-close !w-7 !h-7">
                <span class="material-symbols-outlined !text-base">close</span>
            </button>
        </div>
        <div class="p-8">
            <form id="form-categoria" class="space-y-6">
                <div class="sig-fieldset-blueprint w-full">
                    <span class="sig-legend-blueprint w-auto font-black px-2" id="legend-categoria">INFORMAÇÕES</span>
                    <div class="space-y-4 p-2">
                        <input type="hidden" id="categoria-id">
                        <input type="hidden" id="categoria-tipo"> <!-- 'CATEGORIA' ou 'SUBCATEGORIA' -->
                        <input type="hidden" id="categoria-pai-id">
                        
                        <div>
                            <label class="sig-label-dense">NOME / DESCRITIVO OFICIAL *</label>
                            <input type="text" id="categoria-nome" class="sig-input-dense w-full uppercase font-bold text-sig-blue" placeholder="EX: ELÉTRICA">
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 px-6">
            <button onclick="fecharModalCategoria()" class="sig-btn sig-btn-neutral w-28 uppercase text-[10px] font-bold">
                <span class="material-symbols-outlined !text-[16px]">close</span> Cancelar
            </button>
            <button id="btn-salvar-categoria" onclick="salvarBdCategoriaSub()" type="button" class="sig-btn sig-btn-primary min-w-[150px] shadow-sm flex items-center justify-center gap-2">
                <span class="material-symbols-outlined !text-[18px]">save</span>
                <span class="tracking-widest font-black uppercase text-[10px]">Gravar Dados</span>
            </button>
        </div>
    </div>
</div>
"""

with open("frontend/paginas/parametros/tabelas/categorias_tabela.html", "w", encoding="utf-8") as f:
    f.write(html_tabela)

# Now inject logic into parametros.js
with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_content = f.read()

# We completely replace carregarCategorias
def js_replace(m):
    return """
// UTILITARIO DE ARVORE
window.toggleTree = window.toggleTree || function(id, row) {
    const children = document.querySelectorAll(`.tree-child-${id}`);
    const icon = row.querySelector(`#icon-${id}`);
    // O icone default é keyboard_arrow_down. Se estiver recolhido, fica chevron_right
    const isExpanded = (icon.innerText === 'keyboard_arrow_down');
    
    icon.innerText = isExpanded ? 'chevron_right' : 'keyboard_arrow_down';
    
    children.forEach(child => {
        child.style.display = isExpanded ? 'none' : 'table-row';
    });
}

// MODAL CATEGORIA / SUBCATEGORIA
window.abrirModalCategoria = function() {
    document.getElementById('categoria-id').value = '';
    document.getElementById('categoria-tipo').value = 'CATEGORIA';
    document.getElementById('categoria-pai-id').value = '';
    document.getElementById('categoria-nome').value = '';
    document.getElementById('titulo-modal-categoria').innerText = 'NOVA CATEGORIA';
    document.getElementById('legend-categoria').innerText = 'INFORMAÇÕES DA CATEGORIA (MÃE)';
    document.getElementById('modal-categoria').classList.remove('hidden');
    document.getElementById('modal-categoria').classList.add('flex');
    setTimeout(() => document.getElementById('categoria-nome').focus(), 100);
}

window.abrirModalSubcategoria = function(categoriaId, categoriaNome) {
    document.getElementById('categoria-id').value = '';
    document.getElementById('categoria-tipo').value = 'SUBCATEGORIA';
    document.getElementById('categoria-pai-id').value = categoriaId;
    document.getElementById('categoria-nome').value = '';
    document.getElementById('titulo-modal-categoria').innerText = 'NOVA SUBCATEGORIA';
    document.getElementById('legend-categoria').innerText = 'SUB DE: ' + categoriaNome;
    document.getElementById('modal-categoria').classList.remove('hidden');
    document.getElementById('modal-categoria').classList.add('flex');
    setTimeout(() => document.getElementById('categoria-nome').focus(), 100);
}

window.editarCategoriaObj = function(id, nome) {
    document.getElementById('categoria-id').value = id;
    document.getElementById('categoria-tipo').value = 'CATEGORIA';
    document.getElementById('categoria-pai-id').value = '';
    document.getElementById('categoria-nome').value = nome;
    document.getElementById('titulo-modal-categoria').innerText = 'EDITAR CATEGORIA';
    document.getElementById('legend-categoria').innerText = 'INFORMAÇÕES DA CATEGORIA';
    document.getElementById('modal-categoria').classList.remove('hidden');
    document.getElementById('modal-categoria').classList.add('flex');
}

window.editarSubcategoriaObj = function(id, catId, nome) {
    document.getElementById('categoria-id').value = id;
    document.getElementById('categoria-tipo').value = 'SUBCATEGORIA';
    document.getElementById('categoria-pai-id').value = catId;
    document.getElementById('categoria-nome').value = nome;
    document.getElementById('titulo-modal-categoria').innerText = 'EDITAR SUBCATEGORIA';
    document.getElementById('legend-categoria').innerText = 'INFORMAÇÕES DA SUBCATEGORIA';
    document.getElementById('modal-categoria').classList.remove('hidden');
    document.getElementById('modal-categoria').classList.add('flex');
}

window.fecharModalCategoria = function() {
    document.getElementById('modal-categoria').classList.add('hidden');
    document.getElementById('modal-categoria').classList.remove('flex');
}

window.salvarBdCategoriaSub = async function() {
    const id = document.getElementById('categoria-id').value;
    const tipo = document.getElementById('categoria-tipo').value;
    const paiId = document.getElementById('categoria-pai-id').value;
    const nome = document.getElementById('categoria-nome').value.trim().toUpperCase();

    if(!nome) {
        window.Toast.error("O NOME é obrigatório!");
        return;
    }

    try {
        const engine = window.goEngine || window.go;
        if(tipo === 'CATEGORIA') {
            const list = await engine.main.App.ListarCategorias() || [];
            const rep = list.find(x => x.nome === nome && x.id.toString() !== id);
            if(rep) { window.Toast.error("Já existe categoria com esse nome."); return; }
            await engine.main.App.SalvarCategoria(nome);
        } else {
            const list = await engine.main.App.ListarSubcategorias() || [];
            const rep = list.find(x => x.nome === nome && x.id.toString() !== id && x.categoria_id.toString() === paiId);
            if(rep) { window.Toast.error("Esta subcategoria já existe nesta categoria!"); return; }
            await engine.main.App.SalvarSubcategoria(parseInt(paiId), nome);
        }
        
        window.Toast.success("Configuração salva!");
        fecharModalCategoria();
        carregarCategorias(); // Recarrega a árvore master detail
        
    } catch(e) {
        window.Toast.error("Erro interno ao gravar dados.");
        console.error(e);
    }
}

window.excluirCategoria = async function(id) {
    if(confirm("Confirma exclusão irreversível desta CATEGORIA MÃE e de TODAS as suas subcategorias ligadas?")) {
        try {
            const engine = window.goEngine || window.go;
            await engine.main.App.ExcluirCategoria(id);
            window.Toast.success("Categoria inteira apagada.");
            carregarCategorias();
        }catch(e) {
            window.Toast.error("Erro ao apagar, verifique as dependências.");
        }
    }
}

window.excluirSubcategoria = async function(id) {
    if(confirm("Confirma exclusão desta SUBCATEGORIA?")) {
        try {
            const engine = window.goEngine || window.go;
            await engine.main.App.ExcluirSubcategoria(id);
            window.Toast.success("Subcategoria apagada.");
            carregarCategorias();
        }catch(e) {
            window.Toast.error("Erro ao apagar subcategoria.");
        }
    }
}

async function carregarCategorias() {
    const tb = document.getElementById('corpo-tabela-categorias');
    if(!tb) return;
    try {
        const engine = window.goEngine || window.go;
        let cats = await engine.main.App.ListarCategorias() || [];
        let subs = await engine.main.App.ListarSubcategorias() || [];
        
        let dom = "";
        if (cats.length === 0) { dom = `<tr><td colspan="3" class="text-center py-4 text-slate-400">Nenhuma estrutura encontrada</td></tr>`; }
        
        cats.forEach(c => {
            // MASTER
            dom += `
            <tr class="group bg-slate-50 border-y border-slate-200 cursor-pointer hover:bg-[#eff6ff] transition-colors shadow-[inset_4px_0_0_#1e40af]" onclick="toggleTree('cat-${c.id}', this)">
                <td class="font-mono text-[#1e40af] text-xs sig-text-center font-bold border-r border-slate-200">${c.id || '-'}</td>
                <td class="font-bold text-slate-800 text-sm tracking-wide">
                    <div class="flex items-center gap-2 uppercase">
                        <span class="material-symbols-outlined text-[#1e40af] text-[20px] transition-transform duration-200" id="icon-cat-${c.id}">keyboard_arrow_down</span>
                        ${c.nome || '-'}
                    </div>
                </td>
                <td class="sig-text-center border-l border-slate-200">
                    <div class="flex items-center justify-center gap-1" onclick="event.stopPropagation()">
                        <button class="sig-btn-icon hover:!border-emerald-500 hover:!text-emerald-600 hover:!bg-emerald-50" title="Nova Subcategoria" onclick="abrirModalSubcategoria(${c.id}, '${c.nome}')"><span class="material-symbols-outlined text-[16px]">add</span></button>
                        <button class="sig-btn-icon" title="Editar" onclick="editarCategoriaObj(${c.id}, '${c.nome}')"><span class="material-symbols-outlined text-[16px]">edit</span></button>
                        <button class="sig-btn-icon hover:!border-red-500 hover:!text-red-600 hover:!bg-red-50" title="Excluir" onclick="excluirCategoria(${c.id})"><span class="material-symbols-outlined text-[16px]">delete</span></button>
                    </div>
                </td>
            </tr>
            `;
            
            // DETAILS
            let subChildren = subs.filter(s => s.categoria_id === c.id);
            subChildren.forEach(s => {
                dom += `
                <tr class="group bg-white hover:bg-[#eff6ff] tree-child-cat-${c.id} transition-all border-b border-slate-50/50">
                    <td class="sig-text-center border-r border-slate-100">
                        <div class="flex items-center justify-end pr-3 gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity text-[#1e40af]">
                            <span class="text-[10px]">↳</span>
                            <span class="font-mono text-[10px] font-bold">${s.id || '-'}</span>
                        </div>
                    </td>
                    <td class="uppercase font-semibold text-slate-600 group-hover:text-[#1e40af] text-[11px] transition-colors">
                        <div class="flex items-center gap-2 pl-6 border-l-2 border-slate-200 group-hover:border-[#1e40af] py-1 transition-colors">
                            ${s.nome || '-'}
                        </div>
                    </td>
                    <td class="sig-text-center border-l border-slate-100">
                        <div class="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="sig-btn-icon hover:!text-[#1e40af] hover:!bg-blue-50 hover:!border-[#1e40af]" title="Editar Subcategoria" onclick="editarSubcategoriaObj(${s.id}, ${c.id}, '${s.nome}')">
                                <span class="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button class="sig-btn-icon hover:!text-red-500 hover:!bg-red-50 hover:!border-red-500" title="Remover Subcategoria" onclick="excluirSubcategoria(${s.id})">
                                <span class="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>
                    </td>
                </tr>
                `;
            });
        });
        
        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = ''; }
}"""

js_content = re.sub(r"async function carregarCategorias\(\) \{.*?(?=async function carregarUsuarios|\Z)", js_replace(None) + "\n\n", js_content, flags=re.DOTALL)

with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
    f.write(js_content)
