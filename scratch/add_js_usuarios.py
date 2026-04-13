import os

with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_content = f.read()

new_user_code = """
// -----------------------------------------------------
// FUNÇÕES DE USUÁRIO
// -----------------------------------------------------
window.abrirModalUsuario = async function() {
    document.getElementById('form-usuario').reset();
    document.getElementById('usr-id').value = '';
    document.getElementById('modal-usuario').classList.remove('hidden');
    document.getElementById('modal-usuario').classList.add('flex');
    
    // Carregar combo de funções
    try {
        const engine = window.goEngine || window.go;
        let funcoes = await engine.main.App.ListarFuncoes() || [];
        let dom = `<option value="0">SELECIONE O PERFIL...</option>`;
        funcoes.forEach(f => {
            dom += `<option value="${f.id}">${f.nome}</option>`;
        });
        document.getElementById('usr-funcao').innerHTML = dom;
    } catch(e) { console.error("Erro ao carregar funcoes", e); }
    
    setTimeout(() => document.getElementById('usr-nome').focus(), 100);
}

window.fecharModalUsuario = function() {
    document.getElementById('modal-usuario').classList.add('hidden');
    document.getElementById('modal-usuario').classList.remove('flex');
}

window.consultarCEP = async function() {
    let cep = document.getElementById('usr-cep').value.replace(/\D/g, '');
    if (cep.length !== 8) {
        if(window.Toast) window.Toast.error("CEP Incompleto");
        return;
    }
    try {
        let resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        let data = await resp.json();
        if(!data.erro) {
            document.getElementById('usr-logradouro').value = data.logradouro.toUpperCase();
            document.getElementById('usr-bairro').value = data.bairro.toUpperCase();
            document.getElementById('usr-cidade').value = data.localidade.toUpperCase();
            document.getElementById('usr-uf').value = data.uf.toUpperCase();
            document.getElementById('usr-numero').focus();
        } else {
            if(window.Toast) window.Toast.error("CEP Não Encontrado");
        }
    } catch(e) {
        console.error(e);
        if(window.Toast) window.Toast.error("Erro ao buscar CEP");
    }
}

window.salvarBdUsuario = async function() {
    const nome = document.getElementById('usr-nome').value.trim();
    const login = document.getElementById('usr-login').value.trim();
    
    if(!nome || !login) {
        if(window.Toast) window.Toast.error("Nome e Login são obrigatórios.");
        return;
    }
    
    let u = {
        id: parseInt(document.getElementById('usr-id').value) || 0,
        nome: nome.toUpperCase(),
        sobrenome: document.getElementById('usr-sobrenome').value.trim().toUpperCase(),
        cpf: document.getElementById('usr-cpf').value.trim(),
        rg: document.getElementById('usr-rg').value.trim(),
        data_nascimento: document.getElementById('usr-data-nascimento').value,
        cep: document.getElementById('usr-cep').value.trim(),
        logradouro: document.getElementById('usr-logradouro').value.trim().toUpperCase(),
        numero: document.getElementById('usr-numero').value.trim(),
        complemento: document.getElementById('usr-complemento').value.trim().toUpperCase(),
        bairro: document.getElementById('usr-bairro').value.trim().toUpperCase(),
        cidade: document.getElementById('usr-cidade').value.trim().toUpperCase(),
        uf: document.getElementById('usr-uf').value.trim().toUpperCase(),
        login: login.toLowerCase(),
        senha: document.getElementById('usr-senha').value,
        data_admissao: document.getElementById('usr-data-admissao').value,
        funcao_id: parseInt(document.getElementById('usr-funcao').value) || 0,
        ativo: document.getElementById('usr-ativo').checked
    };
    
    try {
        const engine = window.goEngine || window.go;
        await engine.main.App.SalvarUsuario(u);
        if(window.Toast) window.Toast.success("Usuário salvo com sucesso.");
        fecharModalUsuario();
        carregarUsuariosRBAC();
    } catch(e) {
        console.error("Erro ao salvar", e);
        if(window.Toast) window.Toast.error("Falha ao salvar usuário no banco.");
    }
}

window.editarUsuarioObj = async function(id) {
    // Primeiro vamos baixar a lista ou pegar do objeto atual.
    // Como list ta em carregarUsuariosRBAC, vamos buscar a lista dinamicamente
    const engine = window.goEngine || window.go;
    let list = await engine.main.App.ListarUsuarios() || [];
    let u = list.find(x => x.id === id);
    if(!u) return;

    await abrirModalUsuario(); // limpa e carrega combo
    
    document.getElementById('usr-id').value = u.id;
    document.getElementById('usr-nome').value = u.nome;
    document.getElementById('usr-sobrenome').value = u.sobrenome;
    document.getElementById('usr-cpf').value = u.cpf;
    document.getElementById('usr-rg').value = u.rg;
    
    // YYYY-MM-DD pra tag date
    if(u.data_nascimento && u.data_nascimento.length > 0) {
        document.getElementById('usr-data-nascimento').value = u.data_nascimento.split("T")[0];
    }
    if(u.data_admissao && u.data_admissao.length > 0) {
        document.getElementById('usr-data-admissao').value = u.data_admissao.split("T")[0];
    }
        
    document.getElementById('usr-cep').value = u.cep;
    document.getElementById('usr-logradouro').value = u.logradouro;
    document.getElementById('usr-numero').value = u.numero;
    document.getElementById('usr-complemento').value = u.complemento;
    document.getElementById('usr-bairro').value = u.bairro;
    document.getElementById('usr-cidade').value = u.cidade;
    document.getElementById('usr-uf').value = u.uf;
    
    document.getElementById('usr-login').value = u.login;
    document.getElementById('usr-funcao').value = u.funcao_id;
    document.getElementById('usr-ativo').checked = u.ativo;
    
    // Esconde div de senha na edição
    let bs = document.getElementById('usr-box-senha');
    if(bs) bs.classList.add('hidden');
    document.getElementById('titulo-modal-categoria').innerText = 'EDIÇÃO DE USUÁRIO';
}

window.desativarUsuario = async function(id) {
    if(await (window.goEngine || window.go).main.App.MostrarConfirmacao("Confirmação", "Ativar/Desativar o acesso deste usuário?")) {
        try {
            const engine = window.goEngine || window.go;
            let list = await engine.main.App.ListarUsuarios() || [];
            let u = list.find(x => x.id === id);
            if(u) {
                u.ativo = !u.ativo;
                // We keep password blank so Go layer ignores it ideally,
                // But wait, motorBD's update doesn't touch password!
                await engine.main.App.SalvarUsuario(u);
                carregarUsuariosRBAC();
            }
        } catch(e) {}
    }
}
"""

if "window.salvarBdUsuario" not in js_content:
    js_content += "\n" + new_user_code
    with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
        f.write(js_content)
