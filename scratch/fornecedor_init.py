import os

# -------------------------------------------------------------
# Fix Parametros.js
# -------------------------------------------------------------
with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_code = f.read()

nova_logica = """
// ==========================================
// ABA FORNECEDORES
// ==========================================
window.carregarFornecedores = async function() {
    const tbody = document.getElementById('corpo-tabela-fornecedores');
    if (!tbody) return;
    
    try {
        const engine = window.goEngine || window.go;
        const lista = await engine.main.App.ListarFornecedores() || [];
        
        if (lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-slate-400 font-bold text-[10px] uppercase">Nenhum fornecedor cadastrado.</td></tr>';
            return;
        }

        tbody.innerHTML = lista.map((f, i) => `
            <tr class="${i%2===0?'bg-white':'bg-slate-50/50'} hover:bg-blue-50/50 transition-colors group">
                <td class="sig-text-center font-mono text-[9px] text-slate-500">${String(f.id).padStart(4, '0')}</td>
                <td class="text-slate-700 px-2 font-bold uppercase text-[10px]">${f.fantasia || f.razao_social || 'SEM NOME'}</td>
                <td class="text-slate-500 px-2 font-mono text-[10px]">${f.documento || '-'}</td>
                <td class="sig-text-center">
                    <span class="px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${f.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${f.ativo ? 'ATIVO' : 'INATIVO'}</span>
                </td>
                <td class="flex items-center justify-center gap-2 p-1">
                    <button onclick="editarFornecedor(${f.id})" class="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded-sm hover:bg-blue-100" title="Editar">
                        <span class="material-symbols-outlined !text-[16px]">edit</span>
                    </button>
                    <button onclick="deletarFornecedor(${f.id})" class="text-red-500 hover:text-red-700 transition-colors p-1 rounded-sm hover:bg-red-100" title="Excluir">
                        <span class="material-symbols-outlined !text-[16px]">delete</span>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch(e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" class="py-12 text-center text-red-500 font-bold text-xs">Erro ao carregar dados.</td></tr>';
    }
}

// O Fornecedor já utiliza a infraestrutura de modal_fornecedor.js global
window.abrirModalFornecedor = async function() {
    // Carrega o container/html do formulario de fornecedor criado na pasta parametros
    const ex = document.getElementById('base-modal');
    if (ex) ex.remove();

    const div = document.createElement('div');
    div.id = 'base-modal';
    const res = await fetch('./formularios/formulario_fornecedor.html');
    div.innerHTML = await res.text();
    document.body.appendChild(div);
    
    // Isso deve executar script interno se tiver, mas como a logica global já abre o modal global:
    if(typeof abrirCadastroRapidoFornecedor === 'function') {
        abrirCadastroRapidoFornecedor(); 
        
        // E sobrescrever o salvar para atualizar a tabela do parametros
        const fnAntiga = window.carregarFornecedoresParametros;
        window.carregarFornecedoresParametros = () => {
            carregarFornecedores();
        };
    }
}

window.editarFornecedor = async function(id) {
    window.Toast.info("Edição global ainda em implementação...");
}

window.deletarFornecedor = async function(id) {
    if(confirm('Atenção: Deseja realmente excluir este Fornecedor?')) {
        try {
            const engine = window.goEngine || window.go;
            await engine.main.App.ExcluirFornecedor(parseInt(id));
            window.Toast.success("Fornecedor excluído com sucesso.");
            carregarFornecedores(); 
        } catch(e) {
            window.Toast.error("Falha ao excluir fornecedor.");
        }
    }
}
"""

if "window.carregarFornecedores" not in js_code:
    js_code += "\n" + nova_logica
    with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
        f.write(js_code)

# Cria o formulario_fornecedor.html proxy como pedido
os.makedirs("frontend/paginas/parametros/formularios", exist_ok=True)
with open("frontend/paginas/parametros/formularios/formulario_fornecedor.html", "w", encoding="utf-8") as f:
    f.write('<!-- HTML Organizacional Proxy de Fornecedor -->\n<!-- A logica e o layout real vem de ui_global/formulario_fornecedor_global.html -->\n<div class="hidden">Formulario Proxy Organizacional</div>')

