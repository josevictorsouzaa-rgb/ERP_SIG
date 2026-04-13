import re

js_path = r"frontend/paginas/parametros/parametros.js"
with open(js_path, "r", encoding="utf-8") as f:
    js = f.read()

append_code = """
// ==========================================
// MODAL FUNÇÕES / CARGOS
// ==========================================
window.abrirModalFuncao = async () => {
    try {
        if (!document.getElementById('modal-funcao')) {
            const res = await fetch('./formularios/formulario_funcao.html');
            const html = await res.text();
            document.body.insertAdjacentHTML('beforeend', html);
        }
        
        // Limpar campos
        document.getElementById('fun-id').value = '';
        document.getElementById('fun-nome').value = '';
        
        const modal = document.getElementById('modal-funcao');
        modal.classList.remove('hidden');
        modal.classList.add('flex', 'fixed', 'inset-0', 'bg-slate-900/40', 'backdrop-blur-sm', 'z-[99]', 'justify-center', 'items-center');
        
        document.getElementById('fun-nome').focus();
    } catch(e) {
        console.error("Erro ao carregar modal de funções:", e);
        alert("Erro interno ao abrir formulário de funções.");
    }
};

window.fecharModalFuncao = () => {
    const modal = document.getElementById('modal-funcao');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.salvarBdFuncao = async () => {
    const nome = document.getElementById('fun-nome').value.trim();
    if (!nome) {
        alert("O nome da função é obrigatório.");
        return;
    }
    
    // Fazer integração simulada ou real com Go
    let funcao = {
        id: parseInt(document.getElementById('fun-id').value) || 0,
        nome: nome,
        ativo: true
    };
    
    try {
        const engine = window.goEngine || window.go;
        if (engine && engine.main && engine.main.App && engine.main.App.SalvarFuncao) {
            await engine.main.App.SalvarFuncao(funcao);
        } else {
            console.warn("Backend não conectado. Apenas fechando modal.");
        }
        fecharModalFuncao();
        if (typeof carregarRoles === 'function') {
            carregarRoles();
        }
    } catch (e) {
        alert("Erro ao salvar função.");
        console.error(e);
    }
};
"""

with open(js_path, "a", encoding="utf-8") as f:
    f.write(append_code)
