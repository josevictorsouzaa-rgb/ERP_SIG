import os

# -------------------------------------------------------------
# 1. Update ponte_principal.go
# -------------------------------------------------------------
with open("ponte_principal.go", "r", encoding="utf-8") as f:
    ponte_code = f.read()

nova_funcao = """
func (a *App) SalvarFuncao(f motor.Funcao) string {
	if a.banco == nil { return "Erro DB" }
	err := a.banco.SalvarFuncao(f)
	if err != nil { return err.Error() }
	return "OK"
}

func (a *App) ExcluirFuncao(id int) string {
	if a.banco == nil { return "Erro DB" }
	err := a.banco.ExcluirFuncao(id)
	if err != nil { return err.Error() }
	return "OK"
}
"""

if "func (a *App) SalvarFuncao" not in ponte_code:
    ponte_code += "\n" + nova_funcao
    with open("ponte_principal.go", "w", encoding="utf-8") as f:
        f.write(ponte_code)


# -------------------------------------------------------------
# 2. Update parametros.js
# -------------------------------------------------------------
with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_code = f.read()

funcs = """
// -----------------------------------------------------
// FUNÇÕES DE CARGOS E FUNÇÕES (ROLES)
// -----------------------------------------------------
window.carregarRoles = async function() {
    const tb = document.getElementById('corpo-tabela-funcoes');
    try {
        const engine = window.goEngine || window.go;
        if (!engine?.main?.App?.ListarFuncoes) return tb.innerHTML = `<tr><td colspan="3" class="text-center font-bold text-red-500 py-4">API Offline</td></tr>`;
        
        let list = await engine.main.App.ListarFuncoes() || [];
        let dom = "";
        
        if (list.length === 0) { dom = `<tr><td colspan="3" class="text-center py-4 text-slate-400">Nenhuma função encontrada</td></tr>`; }
        
        list.forEach(i => {
            dom += `
                <tr class="hover:bg-slate-50">
                    <td class="sig-text-center font-mono font-bold text-slate-400">${i.id}</td>
                    <td class="font-bold text-sm uppercase text-slate-700">${i.nome}</td>
                    <td class="sig-text-center">
                        <div class="flex items-center justify-center gap-1">
                            <button class="sig-btn-icon" title="Editar" onclick="editarFuncaoObj(${i.id}, '${i.nome.replace(/'/g, "\\\\'")}')"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                            <button class="sig-btn-icon hover:!border-red-500 hover:!text-red-600 hover:!bg-red-50" title="Excluir" onclick="excluirFuncaoObj(${i.id})"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = `<tr><td colspan="3" class="text-center text-red-500 py-4">Erro ao buscar funções</td></tr>`; }
}

window.abrirModalFuncao = async function() {
    let modal = document.getElementById('modal-funcao');
    if (!modal) {
        try {
            const resp = await fetch('./formularios/formulario_funcao.html');
            const html = await resp.text();
            const div = document.createElement('div');
            div.innerHTML = html;
            document.body.appendChild(div);
            modal = document.getElementById('modal-funcao');
        } catch(e) {
            console.error("Falha ao injetar modal:", e);
            return;
        }
    }
    document.getElementById('form-funcao').reset();
    document.getElementById('fun-id').value = '';
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => document.getElementById('fun-nome').focus(), 100);
}

window.fecharModalFuncao = function() {
    let modal = document.getElementById('modal-funcao');
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

window.salvarBdFuncao = async function() {
    let idStr = document.getElementById('fun-id').value;
    let obj = {
        id: idStr ? parseInt(idStr) : 0,
        nome: document.getElementById('fun-nome').value.trim().toUpperCase()
    };
    if(!obj.nome) {
        if(window.Toast) window.Toast.error("Nome é obrigatório.");
        return;
    }
    
    try {
        const engine = window.goEngine || window.go;
        let res = await engine.main.App.SalvarFuncao(obj);
        if(res !== "OK" && window.Toast) {
            window.Toast.error("Erro: " + res);
            return;
        }
        if(window.Toast) window.Toast.success("Função salva com sucesso!");
        fecharModalFuncao();
        carregarRoles();
    } catch(e) { console.error(e); }
}

window.editarFuncaoObj = async function(id, nome) {
    await abrirModalFuncao();
    document.getElementById('fun-id').value = id;
    document.getElementById('fun-nome').value = nome;
}

window.excluirFuncaoObj = async function(id) {
    const engine = window.goEngine || window.go;
    if(await engine.main.App.MostrarConfirmacao("Confirmação", "Excluir definitivamente esta função? Isto pode afetar os acessos de quem está usando-a.")) {
        try {
            let res = await engine.main.App.ExcluirFuncao(id);
            if(res !== "OK" && window.Toast) {
                window.Toast.error(res); // O Backend bloqueia caso um usuario esteja usando, e manda msg de erro via Golang
                return;
            }
            if(window.Toast) window.Toast.success("Excluído com sucesso!");
            carregarRoles();
        } catch(e) {}
    }
}
"""

if "window.carregarRoles" not in js_code:
    js_code += "\n" + funcs
    with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
        f.write(js_code)
