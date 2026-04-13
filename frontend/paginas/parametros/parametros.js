/**
 * SIG ERP V79 - MÓDULO ALFA DE PARÂMETROS E CADASTROS
 * Refatoração Industrial V2 | Layout: Dark Mode Headers | RBAC
 */

// GLOBAL: Carregamento do Motor Golang (Wails)
window.onload = () => {
    try {
        window.goEngine = window.parent.go || window.go;
        if (!window.goEngine) console.warn("Wails Engine offline. Mocks ativos.");
    } catch (e) { console.error("Erro na carga do motor:", e); }
    mostrarAba('empresa');
};

// ==========================================
// ROTEAMENTO DAS ABAS
// ==========================================
window.mostrarAba = (abaId) => {
    document.querySelectorAll('.sig-secao').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.sig-menu-item').forEach(el => el.classList.remove('ativa'));
    
    document.getElementById(`aba-${abaId}`).classList.remove('hidden');
    document.getElementById(`btn-${abaId}`).classList.add('ativa');

    // Inicializar carregamentos via GO (Reais)
    if (abaId === 'usuarios') {
        const abaEl = document.getElementById('aba-usuarios');
        if (abaEl.innerHTML.includes('CONTEÚDO INJETADO') || abaEl.innerHTML.trim() === '') {
            abaEl.innerHTML = '<div class="p-10 flex flex-col items-center justify-center text-slate-400 gap-2 font-bold text-xs"><span class="material-symbols-outlined animate-spin text-2xl">sync</span> Carregando UI...</div>';
            fetch('./tabelas/usuarios_tabela.html').then(r => r.text()).then(html => {
                abaEl.innerHTML = html;
                renderizarMockTabela('corpo-tabela-usuarios', 8, 'Carregando painel RBAC...');
        setTimeout(() => carregarUsuariosRBAC(), 100);
    
            }).catch(e => { abaEl.innerHTML = `<div class="p-10 text-red-500">Falha ao carregar componente tabela: ${e.message}</div>`; });
        } else {
            renderizarMockTabela('corpo-tabela-usuarios', 8, 'Carregando painel RBAC...');
        setTimeout(() => carregarUsuariosRBAC(), 100);
    
        }} else if (abaId === 'funcoes') {
        const abaEl = document.getElementById('aba-funcoes');
        if (abaEl.innerHTML.includes('CONTEÚDO INJETADO') || abaEl.innerHTML.trim() === '') {
            abaEl.innerHTML = '<div class="p-10 flex flex-col items-center justify-center text-slate-400 gap-2 font-bold text-xs"><span class="material-symbols-outlined animate-spin text-2xl">sync</span> Carregando UI...</div>';
            fetch('./tabelas/funcoes_tabela.html').then(r => r.text()).then(html => {
                abaEl.innerHTML = html;
                renderizarMockTabela('corpo-tabela-funcoes', 3, 'Analisando ACLs...');
        setTimeout(() => carregarRoles(), 100);
    
            }).catch(e => { abaEl.innerHTML = `<div class="p-10 text-red-500">Falha ao carregar componente tabela: ${e.message}</div>`; });
        } else {
            renderizarMockTabela('corpo-tabela-funcoes', 3, 'Analisando ACLs...');
        setTimeout(() => carregarRoles(), 100);
    
        }} else if (abaId === 'empresa') {
        const abaEl = document.getElementById('aba-empresa');
        // Se a tabela ainda não foi injetada, fazemos o fetch do novo arquivo
        if (abaEl.innerHTML.includes('CONTEÚDO INJETADO') || abaEl.innerHTML.trim() === '') {
            abaEl.innerHTML = '<div class="p-10 flex flex-col items-center justify-center text-slate-400 gap-2 font-bold text-xs"><span class="material-symbols-outlined animate-spin text-2xl">sync</span> Carregando UI...</div>';
            fetch('./tabelas/empresa_tabela.html').then(r => r.text()).then(html => {
                abaEl.innerHTML = html;
                renderizarMockTabela('corpo-tabela-empresas', 6, 'Carregando unidades...');
                carregarEmpresas();
            }).catch(e => {
                abaEl.innerHTML = `<div class="p-10 text-red-500">Falha ao carregar componente tabela: ${e.message}</div>`;
            });
        } else {
            renderizarMockTabela('corpo-tabela-empresas', 6, 'Carregando unidades...');
            setTimeout(() => carregarEmpresas(), 100);
        }
    } else if (abaId === 'fornecedores') {
        const abaEl = document.getElementById('aba-fornecedores');
        if (abaEl.innerHTML.includes('CONTEÚDO INJETADO') || abaEl.innerHTML.trim() === '') {
            abaEl.innerHTML = '<div class="p-10 flex flex-col items-center justify-center text-slate-400 gap-2 font-bold text-xs"><span class="material-symbols-outlined animate-spin text-2xl">sync</span> Carregando UI...</div>';
            fetch('./tabelas/fornecedores_tabela.html').then(r => r.text()).then(html => {
                abaEl.innerHTML = html;
                renderizarMockTabela('corpo-tabela-fornecedores', 5, 'Carregando fornecedores...');
        setTimeout(() => carregarFornecedores(), 100);
    
            }).catch(e => { abaEl.innerHTML = `<div class="p-10 text-red-500">Falha ao carregar componente tabela: ${e.message}</div>`; });
        } else {
            renderizarMockTabela('corpo-tabela-fornecedores', 5, 'Carregando fornecedores...');
        setTimeout(() => carregarFornecedores(), 100);
    
        }} else if (abaId === 'marcas') {
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
    }
};

// ==========================================
// RENDERIZAÇÃO ESTÉTICA DE CARREGAMENTO
// ==========================================
function renderizarMockTabela(tabelaId, colspan, mensagem) {
    const tb = document.getElementById(tabelaId);
    if (!tb) return;
    tb.innerHTML = `
        <tr>
            <td colspan="${colspan}" class="py-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest bg-white">
                <div class="flex flex-col items-center gap-2">
                    <span class="material-symbols-outlined animate-spin text-slate-200 text-3xl">sync</span>
                    ${mensagem}
                </div>
            </td>
        </tr>
    `;
}

// ==========================================
// ENGINE DO MODELO "BLUEPRINT V3" (MODAIS GLOBAIS)
// ==========================================
function injetarModalUI(titulo, icon, formHTML, actionScript) {
    // Apaga modal anterior se existir
    const ex = document.getElementById('base-modal');
    if (ex) ex.remove();

    const div = document.createElement('div');
    div.id = 'base-modal';
    div.className = 'fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99] flex justify-center items-center p-4 animate-opacity';
    
    div.innerHTML = `
        <div class="bg-white w-full max-w-[850px] rounded-md shadow-2xl overflow-hidden border border-slate-400">
            <!-- Header do Modal -->
            <div class="bg-slate-50 p-2 px-4 flex justify-between items-center border-b border-slate-300">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-slate-500 text-sm">${icon}</span>
                    <h3 class="text-slate-700 font-bold text-[11px] uppercase tracking-wider">${titulo}</h3>
                </div>
                <button onclick="document.getElementById('base-modal').remove()" class="sig-btn-close !w-7 !h-7">
                    <span class="material-symbols-outlined !text-base">close</span>
                </button>
            </div>

            <!-- Conteúdo do Modal -->
            <div class="p-6 max-h-[80vh] overflow-y-auto">
                <form class="space-y-6" onsubmit="event.preventDefault()">
                    ${formHTML}
                </form>
            </div>

            <!-- Footer do Modal -->
            <div class="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 px-6">
                <button onclick="document.getElementById('base-modal').remove()" class="sig-btn text-slate-500 hover:bg-slate-200 uppercase tracking-widest text-[10px] font-bold px-4 py-2">Cancelar</button>
                <button onclick="${actionScript}" class="sig-btn sig-btn-primary min-w-[180px] shadow-lg flex gap-2 items-center justify-center">
                    <span class="material-symbols-outlined !text-[14px]">save</span>
                    <span class="uppercase tracking-widest font-black text-[10px]">Gravar Cadastro (F10)</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

// ==========================================
// 1. MODAL: USUÁRIOS E CONTROLE RBAC (ACESSO)
// ==========================================
window.abrirModalUsuario = () => {
    const html = `
        <fieldset class="sig-fieldset-blueprint border-slate-300 bg-white">
            <legend class="text-[9px] font-black tracking-widest text-sig-blue bg-white px-2">DADOS DO OPERADOR</legend>
            <div class="grid grid-cols-12 gap-3 py-3 px-2">
                
                <div class="col-span-12">
                    <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1">Nome Completo</label>
                    <input type="text" id="usr-nome" class="sig-input-dense w-full font-bold uppercase text-slate-700">
                </div>

                <div class="col-span-6">
                    <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1">CPF (Documento)</label>
                    <input type="text" id="usr-cpf" class="sig-input-dense w-full font-mono text-slate-600 bg-slate-50">
                </div>

                <div class="col-span-6">
                    <label class="text-[9px] font-bold text-amber-600 uppercase block mb-1 flex items-center gap-1"><span class="material-symbols-outlined !text-[12px]">admin_panel_settings</span> Função RBAC</label>
                    <select id="usr-role" class="sig-input-dense w-full font-black text-amber-800 bg-amber-50">
                        <option value="1">ADMINISTRADOR MASTER</option>
                        <option value="2">COMPRADOR SUPRIMENTOS</option>
                        <option value="3">OPERADOR DE LOGÍSTICA</option>
                        <option value="4">ANALISTA FISCAL</option>
                    </select>
                </div>

                <div class="col-span-6">
                    <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1">Login App</label>
                    <input type="text" id="usr-login" class="sig-input-dense w-full font-mono font-black text-sig-blue tracking-widest bg-blue-50">
                </div>

                <div class="col-span-6">
                    <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1">Senha Primária</label>
                    <input type="password" id="usr-senha" class="sig-input-dense w-full font-mono">
                </div>

            </div>
        </fieldset>
    `;
    injetarModalUI('NOVO USUÁRIO DE SISTEMA', 'person_add', html, 'alert("Injetando Operador no DB VMASTER..."); document.getElementById("base-modal").remove();');
};

// ==========================================
// 2. MODAL: CONTROLE DE EMPRESAS MATRIZ (V2)
// ==========================================
window.abrirSelecaoTipo = async () => {
    let matrices = [];
    try {
        const engine = window.goEngine || window.go;
        if (engine?.main?.App?.BuscarEmpresas) {
            let list = await engine.main.App.BuscarEmpresas();
            matrices = list.filter(e => e.is_matriz);
        }
    } catch(e) {}

    let optionsMatriz = '<option value="">SELECIONE A MATRIZ...</option>';
    matrices.forEach(m => {
        optionsMatriz += `<option value="${m.id}">${m.razao_social}</option>`;
    });

    try {
        const response = await fetch('./formularios/formulario_empresa.html');
        if (!response.ok) throw new Error("Fragmento não encontrado.");
        const html = await response.text();

        const ext = document.getElementById('modal-empresa-wrapper');
        if(ext) ext.remove();

        document.body.insertAdjacentHTML('beforeend', html);
        
        document.getElementById('emp-matriz-id').innerHTML = optionsMatriz;

        // Resetar Formulário base
        document.getElementById('emp-id-hidden').value = 0;
        document.getElementById('emp-cnpj').value = '';
        document.getElementById('label-submit-empresa').textContent = 'GRAVAR EMPRESA';
        window.setTipoEmpresa(true);
        window.contatosEmpresa = [];
        window.renderizarGridContatosEmpresa();

        // Lock form natively instead of CSS opacity hack
        document.querySelectorAll('.campos-destravaveis-container input, .campos-destravaveis-container select, .campos-destravaveis-container button').forEach(el => {
            el.disabled = true;
            el.classList.add('bg-slate-100', 'cursor-not-allowed', 'opacity-70');
        });

        // Resetar view do Wizard para Passo 1
        document.getElementById('passo-2-cadastro').classList.add('hidden');
        document.getElementById('passo-1-hierarquia').classList.remove('hidden');
        document.getElementById('modal-empresa-window').className = "bg-white w-full max-w-[400px] transition-all duration-300 ease-in-out rounded-md shadow-2xl overflow-hidden border border-slate-400 flex flex-col max-h-[90vh]";
        
        // Remove a classe hidden (caso ela venha via HTML) para exibir visualmente
        document.getElementById('modal-empresa-wrapper').classList.remove('hidden');

    } catch(err) {
        alert("Erro fatal ao abrir o modal de empresa: " + err.message);
    }
};

window.liberarCamposEmpresa = async () => {
    const docInput = document.getElementById('emp-cnpj');
    const cnpjRaw = docInput.value.replace(/\D/g, '');
    
    // 1. TAMANHO
    if (cnpjRaw.length < 14) {
        window.Toast.warning("Atenção: O CNPJ digitado está incompleto.");
        return;
    }

    // 2. REGRA DE NEGÓCIO: MATRIZ / FILIAL
    // (A validação estrita de sufixo 0001 foi removida para garantir flexibilidade no cadastro)
    const is_matriz = document.getElementById('emp-ismatriz').value === 'true';

    // 3. REGRA BÁSICA: DUPLICIDADE
    try {
        const engine = window.goEngine || window.go;
        if (engine && engine.main && engine.main.App && engine.main.App.BuscarEmpresas) {
            let list = await engine.main.App.BuscarEmpresas() || [];
            const repetido = list.find(e => e.cnpj && e.cnpj.replace(/\D/g, '') === cnpjRaw);
            if (repetido) {
                window.Toast.error("Ops! Este CNPJ já está cadastrado no sistema.");
                return;
            }
        }
    } catch(e) {
        console.warn("Ignorando checagem de duplicidade (offline).", e);
    }

    // 4. INTEGRAÇÃO BRASIL API
    fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjRaw}`)
    .then(res => res.json())
    .then(data => {
        if(data.name === 'BadRequestError' || data.message === "CNPJ inválido" || data.message === "CNPJ não encontrado") {
            window.Toast.error("O CNPJ digitado é inválido na Receita Federal.");
            return;
        }

        // DESTRAVAR
        const locks = document.querySelectorAll('.campos-destravaveis-container input, .campos-destravaveis-container select, .campos-destravaveis-container button');
        locks.forEach(lk => {
            lk.disabled = false;
            lk.classList.remove('bg-slate-100', 'cursor-not-allowed', 'opacity-70');
        });

        if(data && !data.error) {
            if(data.razao_social) document.getElementById('emp-razao').value = data.razao_social;
            if(data.nome_fantasia) document.getElementById('emp-fantasia').value = data.nome_fantasia;
            if(data.cep) document.getElementById('emp-cep').value = data.cep;
            if(data.logradouro) document.getElementById('emp-logradouro').value = data.logradouro;
            if(data.numero) document.getElementById('emp-numero').value = data.numero;
            if(data.bairro) document.getElementById('emp-bairro').value = data.bairro;
            if(data.municipio) document.getElementById('emp-cidade').value = data.municipio;
            if(data.uf)  document.getElementById('emp-uf').value = data.uf;
            if(data.complemento) document.getElementById('emp-complemento').value = data.complemento;
            
            if(data.ddd_telefone_1) {
                window.contatosEmpresa.push({
                    nome: "GERAL",
                    telefone: data.ddd_telefone_1,
                    departamento: "RECEPCAO"
                });
                window.renderizarGridContatosEmpresa();
            }
        }
    })
    .catch(e => {
        window.Toast.warning("Falha de rede. Liberação manual ativada.");
        const locks = document.querySelectorAll('.campos-destravaveis-container input, .campos-destravaveis-container select, .campos-destravaveis-container button');
        locks.forEach(lk => {
            lk.disabled = false;
            lk.classList.remove('bg-slate-100', 'cursor-not-allowed', 'opacity-70');
        });
    });
};

// Funções globais na janela para manipulação UI
window.setTipoEmpresa = (isMatriz) => {
    const el = document.getElementById('emp-ismatriz');
    if(!el) return;
    el.value = isMatriz ? 'true' : 'false';
    
    const btnM = document.getElementById('btn-tipo-matriz');
    const btnF = document.getElementById('btn-tipo-filial');
    const boxF = document.getElementById('box-filial-destrinchar');

    if(isMatriz) {
        btnM.className = "flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all bg-white text-blue-800 shadow-[0_1px_2px_rgba(0,0,0,0.1)]";
        btnF.className = "flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all text-slate-500 bg-transparent";
        boxF.classList.add('hidden');
        boxF.classList.remove('flex');
        document.getElementById('emp-matriz-id').value = '';
        document.getElementById('emp-estoquecomp').checked = false;
    } else {
        btnF.className = "flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all bg-white text-blue-800 shadow-[0_1px_2px_rgba(0,0,0,0.1)]";
        btnM.className = "flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all text-slate-500 bg-transparent";
        boxF.classList.remove('hidden');
        boxF.classList.add('flex');
    }
};

window.contatosEmpresa = [];

window.renderizarGridContatosEmpresa = () => {
    const tb = document.getElementById('lista-contatos-empresa');
    if(!tb) return;
    tb.innerHTML = '';
    if (window.contatosEmpresa.length === 0) {
        tb.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-400 font-bold text-[9px] uppercase tracking-widest">NENHUM CONTATO REGISTRADO</td></tr>`;
        return;
    }
    window.contatosEmpresa.forEach((c, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors';
        tr.innerHTML = `
            <td class="py-1 px-2 uppercase">${c.nome}</td>
            <td class="py-1 px-2 text-center tracking-wider">${c.telefone}</td>
            <td class="py-1 px-2 text-center uppercase">${c.departamento}</td>
            <td class="py-1 px-2 text-center">
                <button type="button" onclick="window.removerContatoEmpresa(${idx})" class="text-red-500 hover:text-red-700 bg-red-50 p-1 py-0.5 rounded shadow-sm">
                    <span class="material-symbols-outlined !text-[14px]">delete</span>
                </button>
            </td>
        `;
        tb.appendChild(tr);
    });
};

window.adicionarContatoEmpresa = () => {
    const iNome = document.getElementById('emp-contato-nome');
    const iTel = document.getElementById('emp-contato-tel');
    const iDept = document.getElementById('emp-contato-dept');
    
    if(!iNome.value.trim() || !iTel.value.trim()) {
        alert("Preencha ao menos Nome e Telefone.");
        return;
    }
    window.contatosEmpresa.push({
        nome: iNome.value.trim(),
        telefone: iTel.value.trim(),
        departamento: iDept.value.trim() || 'GERAL'
    });
    iNome.value = '';
    iTel.value = '';
    iDept.value = '';
    window.renderizarGridContatosEmpresa();
};

window.removerContatoEmpresa = (idx) => {
    window.contatosEmpresa.splice(idx, 1);
    window.renderizarGridContatosEmpresa();
};

window.avancarCadastroEmpresa = () => {
    const is_matriz = document.getElementById('emp-ismatriz').value === 'true';
    const matriz_id = document.getElementById('emp-matriz-id').value;
    
    if (!is_matriz && (!matriz_id || matriz_id === '0')) {
        window.Toast.warning("Você precisa indicar a qual Matriz esta Filial pertence.");
        return;
    }

    document.getElementById('passo-1-hierarquia').classList.add('hidden');
    document.getElementById('passo-2-cadastro').classList.remove('hidden');
    document.getElementById('passo-2-cadastro').classList.add('flex');
    
    // Aumentar janela para 850px para abrigar o form completo
    document.getElementById('modal-empresa-window').className = "bg-white w-full max-w-[850px] transition-all duration-300 ease-in-out rounded-md shadow-2xl overflow-hidden border border-slate-400 flex flex-col max-h-[90vh]";
};

window.voltarCadastroEmpresa = () => {
    document.getElementById('passo-2-cadastro').classList.add('hidden');
    document.getElementById('passo-2-cadastro').classList.remove('flex');
    document.getElementById('passo-1-hierarquia').classList.remove('hidden');
    
    // Encolher janela para 400px
    document.getElementById('modal-empresa-window').className = "bg-white w-full max-w-[400px] transition-all duration-300 ease-in-out rounded-md shadow-2xl overflow-hidden border border-slate-400 flex flex-col max-h-[90vh]";
};

window.salvarEmpresaCompleta = async () => {
    const is_matriz = document.getElementById('emp-ismatriz').value === 'true';
    const matriz_id = is_matriz ? 0 : (parseInt(document.getElementById('emp-matriz-id').value) || 0);

    if(!is_matriz && matriz_id === 0) {
        alert("Uma filial DEVE possuir uma Matriz gestora selecionada.");
        return;
    }

    const obj = {
        id: parseInt(document.getElementById('emp-id-hidden').value) || 0,
        razao_social: document.getElementById('emp-razao').value,
        fantasia: document.getElementById('emp-fantasia').value,
        cnpj: document.getElementById('emp-cnpj').value,
        inscricao_estadual: document.getElementById('emp-ie').value,
        regime_tributario: document.getElementById('emp-regime').value,
        
        cep: document.getElementById('emp-cep').value,
        logradouro: document.getElementById('emp-logradouro').value,
        numero: document.getElementById('emp-numero').value,
        bairro: document.getElementById('emp-bairro').value,
        cidade: document.getElementById('emp-cidade').value,
        uf: document.getElementById('emp-uf').value,
        complemento: document.getElementById('emp-complemento').value,
        telefone: window.contatosEmpresa.length > 0 ? window.contatosEmpresa[0].telefone : '',
        contatos: JSON.stringify(window.contatosEmpresa),

        is_matriz: is_matriz,
        matriz_id: matriz_id,
        usa_estoque_compartilhado: document.getElementById('emp-estoquecomp').checked
    };

    if(!obj.razao_social || !obj.cnpj) {
        window.Toast.warning("Os campos CNPJ e Razão Social são obrigatórios.");
        return;
    }

    try {
        const engine = window.goEngine || window.go;
        const res = await engine.main.App.GravarEmpresa(obj);
        if(res === "OK") {
            const ext = document.getElementById('modal-empresa-wrapper');
            if(ext) ext.remove();
            carregarEmpresas();
        } else {
            alert("Erro ao gravar: " + res);
        }
    } catch(e) {
        alert("Erro fatal ao acessar Engine.");
        console.error(e);
    }
};

window.toggleTree = function(sysId, masterRow) {
    const children = document.querySelectorAll('.tree-child-' + sysId);
    const icon = document.getElementById('icon-' + sysId);
    if (children.length > 0) {
        let isHidden = children[0].classList.contains('hidden');
        children.forEach(el => {
            if (isHidden) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });
        
        if (isHidden) {
            if(icon) icon.style.transform = 'rotate(90deg)';
            masterRow.classList.add('shadow-[inset_4px_0_0_#10B981]', 'bg-[#eff6ff]');
            masterRow.classList.remove('shadow-[inset_4px_0_0_#1e40af]', 'bg-slate-50');
        } else {
            if(icon) icon.style.transform = 'rotate(0deg)';
            masterRow.classList.remove('shadow-[inset_4px_0_0_#10B981]', 'bg-[#eff6ff]');
            masterRow.classList.add('shadow-[inset_4px_0_0_#1e40af]', 'bg-slate-50');
        }
    }
};

async function carregarEmpresas() {
    const tb = document.getElementById('corpo-tabela-empresas');
    try {
        const engine = window.goEngine || window.go;
        if (!engine?.main?.App?.BuscarEmpresas) return tb.innerHTML = `<tr><td colspan="6" class="text-center font-bold text-red-500 py-4">Wails Engine Offline</td></tr>`;
        
        let list = await engine.main.App.BuscarEmpresas() || [];
        let dom = "";
        
        if (list.length === 0) {
            tb.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400 font-bold tracking-widest text-[10px] uppercase">Ainda não existem empresas neste sistema.</td></tr>`;
            return;
        }

        const matrizes = list.filter(e => e.is_matriz);
        const filiais = list.filter(e => !e.is_matriz);

        matrizes.forEach(m => {
            const fList = filiais.filter(f => f.matriz_id === m.id);
            const numF = fList.length;

            dom += `
                <tr class="group bg-slate-50 transition-colors border-y border-slate-200 cursor-pointer hover:bg-[#eff6ff] shadow-[inset_4px_0_0_#1e40af]" onclick="window.toggleTree('emp-${m.id}', this)">
                    <td class="font-mono text-[#1e40af] text-xs text-center font-bold border-r border-slate-200">${m.id}</td>
                    <td class="font-bold text-slate-800 text-[11px] tracking-wide">
                        <div class="flex items-center gap-2 uppercase">
                            <span class="material-symbols-outlined text-[#1e40af] text-[20px] transition-transform duration-200" id="icon-emp-${m.id}">chevron_right</span>
                            ${m.razao_social || m.fantasia || '-'}
                            <span class="text-[9px] text-slate-400 font-medium ml-2 normal-case tracking-normal border border-slate-200 px-1.5 rounded bg-white shadow-sm">${numF} FILIAIS NOMEADAS</span>
                        </div>
                    </td>
                    <td class="font-mono text-slate-500 text-[11px] border-l border-slate-200/50">${m.cnpj || '-'}</td>
                    <td class="font-black text-[9px] text-[#1e40af] uppercase tracking-wider border-l border-slate-200/50 px-2 text-center bg-[#eff6ff]/30">UNIFICAÇÃO MATRIZ</td>
                    <td class="font-bold text-[9px] text-slate-500 uppercase tracking-widest border-l border-slate-200/50 px-2">${m.regime_tributario || '-'}</td>
                    <td class="sig-text-center border-l border-slate-200">
                        <div class="flex items-center justify-center gap-1">
                            <button class="sig-btn-icon text-slate-400 hover:text-[#1e40af] hover:bg-blue-50" title="Editar Matriz" onclick="event.stopPropagation(); window.editarEmpresa(${m.id})">
                                <span class="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button class="sig-btn-icon text-slate-400 hover:text-red-600 hover:bg-red-50" title="Excluir Matriz" onclick="event.stopPropagation(); window.deletarEmpresa(${m.id})">
                                <span class="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            if (numF === 0) {
                dom += `
                <tr class="bg-white tree-child-emp-${m.id} hidden border-b border-slate-100">
                    <td class="text-center border-r border-slate-100">
                        <div class="flex items-center justify-end pr-3 gap-1.5 opacity-50 text-[#1e40af]">
                            <span class="text-[10px]">↳</span>
                        </div>
                    </td>
                    <td colspan="5" class="font-semibold text-slate-400 text-[10px] uppercase tracking-widest pl-6 py-2 border-l-2 border-slate-200 italic">
                        Esta matriz não possui ramificações ativas de filiais integradas.
                    </td>
                </tr>
                `;
            } else {
                fList.forEach(f => {
                    const estLabel = f.usa_estoque_compartilhado 
                        ? '<span class="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 rounded-sm shadow-sm py-0.5">COMPARTILHADO (MATRIZ)</span>' 
                        : '<span class="text-orange-700 bg-orange-50 border border-orange-200 px-1.5 rounded-sm shadow-sm py-0.5">ESTOQUE INDIVIDUAL E.A.</span>';
                    
                    dom += `
                    <tr class="bg-white hover:bg-slate-50 tree-child-emp-${m.id} hidden transition-colors border-b border-slate-100">
                        <td class="text-center border-r border-slate-100">
                            <div class="flex items-center justify-end pr-3 gap-1.5 opacity-50 text-[#1e40af]">
                                <span class="text-[10px]">↳</span>
                                <span class="material-symbols-outlined text-[14px]">storefront</span>
                            </div>
                        </td>
                        <td class="font-bold text-slate-600 text-[10px] uppercase">
                            <div class="flex items-center gap-2 pl-6 border-l-2 border-[#1e40af]/30 py-1 uppercase">
                                ${f.razao_social || f.fantasia || '-'}
                            </div>
                        </td>
                        <td class="font-mono text-slate-400 text-[10px] border-l border-slate-100 pl-2 opacity-80">${f.cnpj || '-'}</td>
                        <td class="font-black text-[8px] uppercase tracking-widest border-l border-slate-100 px-2 text-center">${estLabel}</td>
                        <td class="font-bold text-[9px] text-slate-400 uppercase tracking-widest border-l border-slate-100 px-2">${f.regime_tributario || '-'}</td>
                        <td class="sig-text-center border-l border-slate-100">
                            <div class="flex items-center justify-center gap-1">
                                <button class="sig-btn-icon text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Editar Filial" onclick="event.stopPropagation(); window.editarEmpresa(${f.id})">
                                    <span class="material-symbols-outlined text-[16px]">tune</span>
                                </button>
                                <button class="sig-btn-icon text-slate-400 hover:text-red-600 hover:bg-red-50" title="Excluir Filial" onclick="event.stopPropagation(); window.deletarEmpresa(${f.id})">
                                    <span class="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                    `;
                });
            }
        });

        // Caso existam filiais órfãs (não deve ocorrer se API block estiver correto)
        const orfas = filiais.filter(f => !matrizes.some(m => m.id === f.matriz_id));
        if (orfas.length > 0) {
           orfas.forEach(o => {
              dom += `
                <tr class="bg-rose-50 border-b border-rose-200">
                    <td class="font-mono text-rose-500 text-xs text-center border-r border-rose-200">${o.id}</td>
                    <td class="font-bold text-rose-800 text-[11px] uppercase">${o.razao_social || '-'} <span class="sig-badge-warning ml-2">ÓRFÃ</span></td>
                    <td class="font-mono text-rose-600 text-[11px]">${o.cnpj || '-'}</td>
                    <td class="font-black text-[9px] text-rose-700">DESVINCULADA</td>
                    <td class="font-bold text-[9px] text-rose-600">${o.regime_tributario || '-'}</td>
                    <td class="sig-text-center">
                        <button class="sig-btn-icon text-slate-400 hover:text-red-500 hover:bg-red-50" title="Excluir Órfã" onclick="event.stopPropagation(); window.deletarEmpresa(${o.id})">
                            <span class="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </td>
                </tr>
              `;
           });
        }

        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4 font-bold">Erro de Sincronia: ${e.message}</td></tr>`; }
}

window.deletarEmpresa = async (id) => {
    if(!await (window.goEngine || window.go).main.App.MostrarConfirmacao("Confirmação de Ação", "Tem certeza que deseja EXCLUIR esta empresa? (Se for matriz, removerá filiais também)")) return;
    try {
        const engine = window.goEngine || window.go;
        const res = await engine.main.App.DeletarEmpresa(id);
        if(res === "OK") {
            window.Toast.success("Empresa excluída com sucesso!");
            carregarEmpresas();
        } else {
            window.Toast.error("Erro ao excluir: " + res);
        }
    } catch(e) {
        window.Toast.error("Falha ao comunicar com o sistema.");
    }
}

window.editarEmpresa = async (id) => {
    try {
        const engine = window.goEngine || window.go;
        const e = await engine.main.App.ObterEmpresa(id);
        if(!e || !e.id) {
            window.Toast.error("Empresa não encontrada no banco de dados.");
            return;
        }

        // Abre o modal
        await typeof abrirSelecaoTipo === 'function' ? abrirSelecaoTipo() : alert("Função não definida");
        
        // Simula clique tipo
        if(e.is_matriz) window.setTipoEmpresa(true);
        else window.setTipoEmpresa(false);

        // Preenche campos
        setTimeout(() => {
            document.getElementById('emp-id-hidden').value = e.id;
            document.getElementById('emp-cnpj').value = e.cnpj;
            document.getElementById('emp-razao').value = e.razao_social;
            document.getElementById('emp-fantasia').value = e.fantasia || '';
            document.getElementById('emp-ie').value = e.inscricao_estadual || '';
            document.getElementById('emp-regime').value = e.regime_tributario || 'SIMPLES NACIONAL';
            document.getElementById('emp-cep').value = e.cep || '';
            document.getElementById('emp-logradouro').value = e.logradouro || '';
            document.getElementById('emp-numero').value = e.numero || '';
            document.getElementById('emp-bairro').value = e.bairro || '';
            document.getElementById('emp-cidade').value = e.cidade || '';
            document.getElementById('emp-uf').value = e.uf || '';
            document.getElementById('emp-complemento').value = e.complemento || '';
            document.getElementById('emp-estoquecomp').checked = e.usa_estoque_compartilhado;
            
            if(!e.is_matriz) {
                document.getElementById('emp-matriz-id').value = e.matriz_id;
            }

            document.getElementById('label-submit-empresa').textContent = 'SALVAR ALTERAÇÕES';

            try {
                if(e.contatos) window.contatosEmpresa = JSON.parse(e.contatos);
                window.renderizarGridContatosEmpresa();
            }catch(err){}

            // Destrava campos
            const locks = document.querySelectorAll('.campos-destravaveis-container input, .campos-destravaveis-container select, .campos-destravaveis-container button');
            locks.forEach(lk => {
                lk.disabled = false;
                lk.classList.remove('bg-slate-100', 'cursor-not-allowed', 'opacity-70');
            });
            
            // Avança para o passo 2
            window.avancarCadastroEmpresa();
        }, 300);

    } catch(err) {
        console.error(err);
        window.Toast.error("Erro ao carregar os dados da empresa.");
    }
}

async function carregarUsuariosRBAC() {
    const tb = document.getElementById('corpo-tabela-usuarios');
    try {
        const engine = window.goEngine || window.go;
        if (!engine?.main?.App?.ListarUsuarios) return tb.innerHTML = `<tr><td colspan="8" class="text-center font-bold text-red-500 py-4">Wails Engine Offline</td></tr>`;
        
        let list = await engine.main.App.ListarUsuarios() || [];
        let dom = "";
        
        if (list.length === 0) { dom = `<tr><td colspan="8" class="text-center py-4 text-slate-400">Nenhum operador encontrado</td></tr>`; }
        
        list.forEach(i => {
            // Se "i.ativo" não existir no modelo, simulamos "ATIVO"
            let isAtivo = true;
            let stClass = isAtivo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';
            let txtSt = isAtivo ? 'ATIVO' : 'INATIVO';
            let doc = i.cpf || i.rg || '-';
            
            dom += `
                <tr class="hover:bg-slate-50">
                    <td class="sig-text-center font-mono font-bold text-slate-400">${i.id}</td>
                    <td class="font-bold text-xs uppercase">${i.nome || '-'} ${i.sobrenome || ''}</td>
                    <td class="font-mono text-slate-500">${doc}</td>
                    <td class="font-black text-[10px] text-sig-blue uppercase tracking-widest">${i.nome_funcao || '-'}</td>
                    <td class="font-mono font-black text-slate-700">${i.login || '-'}</td>
                    <td class="sig-text-center font-mono text-[10px] text-slate-500">${i.ultimo_acesso || '-'}</td>
                    <td class="sig-text-center"><span class="${stClass} px-1.5 py-0.5 rounded text-[8px] font-black">${txtSt}</span></td>
                    <td class="sig-text-center">
                        <div class="flex items-center justify-center gap-1">
                            <button class="sig-btn-icon" title="Editar" onclick="editarUsuarioObj(${i.id})"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                            <button class="sig-btn-icon hover:!border-orange-500 hover:!text-orange-600 hover:!bg-orange-50" title="Desativar" onclick="desativarUsuario(${i.id})"><span class="material-symbols-outlined text-[18px]">block</span></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tb.innerHTML = dom;
        let sts = document.getElementById('status-usuarios');
        if(sts) sts.remove(); // Removemos o loader
    } catch(e) { console.error(e); tb.innerHTML = `<tr><td colspan="8" class="text-center text-red-500 py-4">Erro ao buscar usuarios</td></tr>`; }
}

async function carregarRoles() {
    const tb = document.getElementById('corpo-tabela-funcoes');
    try {
        const engine = window.goEngine || window.go;
        let list = await engine.main.App.ListarGruposAcesso() || [];
        let dom = "";
        if (list.length === 0) { dom = `<tr><td colspan="3" class="text-center py-4 text-slate-400">Nenhuma função encontrada</td></tr>`; }
        list.forEach(i => {
            dom += `
                <tr class="hover:bg-slate-50">
                    <td class="sig-text-center font-mono font-bold text-slate-400">#${i.id}</td>
                    <td class="font-bold text-xs uppercase">${i.nome || '-'}</td>
                    <td class="sig-text-center">
                        <button class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200"><span class="material-symbols-outlined !text-[14px]">edit</span></button>
                    </td>
                </tr>
            `;
        });
        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = ''; }
}

async function carregarFornecedores() {
    const tb = document.getElementById('corpo-tabela-fornecedores');
    try {
        const engine = window.goEngine || window.go;
        let list = await engine.main.App.ListarFornecedores() || [];
        let dom = "";
        if (list.length === 0) { dom = `<tr><td colspan="5" class="text-center py-4 text-slate-400">Nenhum fornecedor encontrado</td></tr>`; }
        list.forEach(i => {
            let rs = i.razao_social || i.fantasia || '-';
            let doc = i.documento || '-';
            let statusBadge = i.ativo ? '<span class="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-black">ATIVO</span>' : '<span class="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[8px] font-black">INATIVO</span>';
            
            dom += `
                <tr class="hover:bg-slate-50">
                    <td class="sig-text-center font-mono font-bold text-slate-400">#${i.id}</td>
                    <td class="font-bold text-xs uppercase">${rs}</td>
                    <td class="font-mono text-slate-500">${doc}</td>
                    <td class="sig-text-center">${statusBadge}</td>
                    <td class="sig-text-center">
                        <button class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200"><span class="material-symbols-outlined !text-[14px]">edit</span></button>
                    </td>
                </tr>
            `;
        });
        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = ''; }
}

async function carregarMarcas() {
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
                            <button class="sig-btn-icon" title="Editar" onclick="editarMarca(${i.id})"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                            <button class="sig-btn-icon hover:!border-orange-500 hover:!text-orange-600 hover:!bg-orange-50" title="Desabilitar" onclick="desabilitarMarca(${i.id})"><span class="material-symbols-outlined text-[18px]">block</span></button>
                            <button class="sig-btn-icon hover:!border-red-500 hover:!text-red-600 hover:!bg-red-50" title="Excluir" onclick="excluirMarca(${i.id})"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = ''; }
}


// UTILITARIO DE ARVORE
window.toggleTree = window.toggleTree || function(id, row) {
    const children = document.querySelectorAll(`.tree-child-${id}`);
    const icon = row.querySelector(`.icon-tree`);
    if(!icon) return;
    
    const isExpanded = icon.classList.contains('rotate-90');
    if (isExpanded) {
        icon.classList.remove('rotate-90');
        children.forEach(child => child.classList.add('hidden'));
    } else {
        icon.classList.add('rotate-90');
        children.forEach(child => child.classList.remove('hidden'));
    }
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
            const rep = list.find(x => x.nome.toUpperCase() === nome && x.id.toString() !== id);
            if(rep) { window.Toast.error("Já existe categoria com esse nome."); return; }
            await engine.main.App.SalvarCategoria(parseInt(id) || 0, nome);
        } else {
            const list = await engine.main.App.ListarSubcategorias() || [];
            const rep = list.find(x => x.nome.toUpperCase() === nome && x.id.toString() !== id && x.categoria_id.toString() === paiId);
            if(rep) { window.Toast.error("Esta subcategoria já existe nesta categoria!"); return; }
            await engine.main.App.SalvarSubcategoria(parseInt(id) || 0, parseInt(paiId), nome);
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
    if(await (window.goEngine || window.go).main.App.MostrarConfirmacao("Confirmação de Ação", "Confirma exclusão irreversível desta CATEGORIA MÃE e de TODAS as suas subcategorias ligadas?")) {
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
    if(await (window.goEngine || window.go).main.App.MostrarConfirmacao("Confirmação de Ação", "Confirma exclusão desta SUBCATEGORIA?")) {
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
                        <span class="material-symbols-outlined text-[#1e40af] text-[20px] transition-transform duration-200 icon-tree" id="icon-cat-${c.id}">chevron_right</span>
                        ${c.nome || '-'}
                    </div>
                </td>
                <td class="sig-text-center border-l border-slate-200">
                    <div class="flex items-center justify-center gap-1" onclick="event.stopPropagation()">
                        <button class="sig-btn-icon" title="Nova Subcategoria" onclick="abrirModalSubcategoria(${c.id}, '${c.nome}')"><span class="material-symbols-outlined text-[18px]">add</span></button>
                        <button class="sig-btn-icon" title="Editar" onclick="editarCategoriaObj(${c.id}, '${c.nome}')"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                        <button class="sig-btn-icon hover:!border-orange-500 hover:!text-orange-600 hover:!bg-orange-50" title="Desabilitar"><span class="material-symbols-outlined text-[18px]">block</span></button>
                        <button class="sig-btn-icon hover:!border-red-500 hover:!text-red-600 hover:!bg-red-50" title="Excluir" onclick="excluirCategoria(${c.id})"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                    </div>
                </td>
            </tr>
            `;
            
            // DETAILS
            let subChildren = subs.filter(s => s.categoria_id === c.id);
            subChildren.forEach(s => {
                dom += `
                <tr class="group bg-white hover:bg-[#eff6ff] tree-child-cat-${c.id} transition-all border-b border-slate-50/50 hidden">
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
                            <button class="sig-btn-icon" title="Editar Subcategoria" onclick="editarSubcategoriaObj(${s.id}, ${c.id}, '${s.nome}')">
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button class="sig-btn-icon hover:!border-orange-500 hover:!text-orange-600 hover:!bg-orange-50" title="Desabilitar Subcategoria" onclick="event.stopPropagation()">
                                <span class="material-symbols-outlined text-[18px]">block</span>
                            </button>
                            <button class="sig-btn-icon hover:!border-red-500 hover:!text-red-600 hover:!bg-red-50" title="Remover Subcategoria" onclick="excluirSubcategoria(${s.id})">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
                `;
            });
        });
        
        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = ''; }
}



// -----------------------------------------------------
// FUNÇÕES DE USUÁRIO
// -----------------------------------------------------
window.isEdicaoUsuario = false;

window.abrirModalUsuario = async function() {
    window.isEdicaoUsuario = false;
    let modal = document.getElementById('modal-usuario');
    if (!modal) {
        try {
            const resp = await fetch('./formularios/formulario_usuario.html');
            const html = await resp.text();
            const div = document.createElement('div');
            div.innerHTML = html;
            document.body.appendChild(div);
            modal = document.getElementById('modal-usuario');
        } catch(e) {
            console.error("Falha ao injetar modal de usuario:", e);
            return;
        }
    }
    document.getElementById('form-usuario').reset();
    try {
        const engine = window.goEngine || window.go;
        let proxM = await engine.main.App.GetProximoIDUsuario();
        document.getElementById('usr-id').value = proxM;
    } catch(e) { document.getElementById('usr-id').value = ''; }
    
    // Mostra o container se a função for de edição, ou exibe sempre
    let bs = document.getElementById('usr-box-senha');
    if(bs) bs.classList.remove('hidden');
    document.getElementById('titulo-modal-usuario') ? document.getElementById('titulo-modal-usuario').innerText = 'Cadastro Completo de Operador / Usuário' : null;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
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
        id: window.isEdicaoUsuario ? parseInt(document.getElementById('usr-id').value) || 0 : 0,
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
    
    window.isEdicaoUsuario = true;
    // Esconde div de senha na edição
    let bs = document.getElementById('usr-box-senha');
    if(bs) bs.classList.add('hidden');
    document.getElementById('titulo-modal-usuario') ? document.getElementById('titulo-modal-usuario').innerText = 'EDIÇÃO DE USUÁRIO' : null;
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


window.verificarLoginUsuarios = async function(el) {
    let login = el.value.trim().toLowerCase();
    if (!login) return;
    
    // Obter próprio ID se for edição para não conflitar com a si próprio
    let selfId = parseInt(document.getElementById('usr-id').value) || 0;

    try {
        const engine = window.goEngine || window.go;
        let list = await engine.main.App.ListarUsuarios() || [];
        
        // Verifica duplicidade no front ignorando o próprio id
        let dup = list.find(x => x.login.toLowerCase() === login && x.id !== selfId);
        
        if (dup) {
            if (window.Toast) window.Toast.error("Login escolhido já pertence a outro usuário!");
            el.value = '';
            setTimeout(() => el.focus(), 100);
        }
    } catch(e) {
        console.error("Erro ao validar login", e);
    }
}


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
                            <button class="sig-btn-icon" title="Editar" onclick="editarFuncaoObj(${i.id}, '${i.nome.replace(/'/g, "\\'")}')"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                            <button class="sig-btn-icon hover:!border-red-500 hover:!text-red-600 hover:!bg-red-50" title="Excluir" onclick="excluirFuncaoObj(${i.id})"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = `<tr><td colspan="3" class="text-center text-red-500 py-4">Erro ao buscar funções</td></tr>`; }
}

window.isEdicaoFuncao = false;

window.abrirModalFuncao = async function() {
    window.isEdicaoFuncao = false;
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
    try {
        const engine = window.goEngine || window.go;
        let proxM = await engine.main.App.GetProximoIDFuncao();
        document.getElementById('fun-id').value = proxM;
    } catch(e) { document.getElementById('fun-id').value = ''; }
    
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
        id: window.isEdicaoFuncao ? parseInt(idStr) : 0,
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
    window.isEdicaoFuncao = true;
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
                <td class="sig-text-center font-mono text-[9px] text-slate-500">${String(f.id)}</td>
                <td class="text-slate-700 px-2 font-bold uppercase text-[10px]">${f.fantasia || f.razao_social || 'SEM NOME'}</td>
                <td class="text-slate-500 px-2 font-mono text-[10px]">${f.documento || '-'}</td>
                <td class="sig-text-center">
                    <span class="px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${f.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${f.ativo ? 'ATIVO' : 'INATIVO'}</span>
                </td>
                <td class="sig-text-center border-l border-slate-100">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="editarFornecedor(${f.id})" class="sig-btn-icon" title="Editar"><span class="material-symbols-outlined text-[16px]">edit</span></button>
                        <button onclick="desabilitarFornecedor(${f.id})" class="sig-btn-icon hover:!border-orange-500 hover:!text-orange-600 hover:!bg-orange-50" title="Desabilitar"><span class="material-symbols-outlined text-[16px]">block</span></button>
                        <button onclick="deletarFornecedor(${f.id})" class="sig-btn-icon hover:!border-red-500 hover:!text-red-600 hover:!bg-red-50" title="Excluir"><span class="material-symbols-outlined text-[16px]">delete</span></button>
                    </div>
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
    try {
        const engine = window.goEngine || window.go;
        const lista = await engine.main.App.ListarFornecedores() || [];
        const f = lista.find(x => x.id === id);
        if (!f) throw new Error("Não encontrado na lista local");

        // Abre modal
        const ex = document.getElementById('base-modal');
        if (ex) ex.remove();
        const div = document.createElement('div');
        div.id = 'base-modal';
        const res = await fetch('./formularios/formulario_fornecedor.html');
        div.innerHTML = await res.text();
        document.body.appendChild(div);

        if(typeof abrirCadastroRapidoFornecedor === 'function') {
            await abrirCadastroRapidoFornecedor(); 
            // Agora sobrepõe os valores!
            document.getElementById('forn-completo-id').value = String(f.id);
            document.getElementById('forn-completo-tipo').value = f.tipo_pessoa || 'J';
            document.getElementById('forn-completo-documento').value = f.documento || '';
            document.getElementById('forn-completo-ie').value = f.ie || '';
            document.getElementById('forn-completo-razao').value = f.razao_social || '';
            document.getElementById('forn-completo-fantasia').value = f.fantasia || '';
            document.getElementById('forn-completo-cep').value = f.cep || '';
            document.getElementById('forn-completo-endereco').value = f.endereco || '';
            document.getElementById('forn-completo-numero').value = f.numero || '';
            document.getElementById('forn-completo-bairro').value = f.bairro || '';
            document.getElementById('forn-completo-cidade').value = f.cidade || '';
            document.getElementById('forn-completo-uf').value = f.uf || '';
            
            if(f.logo) {
                document.getElementById('forn-logo-preview').src = f.logo;
                document.getElementById('forn-logo-preview').classList.remove('hidden');
                document.getElementById('forn-logo-placeholder').classList.add('hidden');
            }

            if(typeof setTipoFornecedor === 'function') {
                setTipoFornecedor(f.tipo_pessoa || 'J');
                document.getElementById('forn-completo-documento').value = f.documento || ''; // Refaz valor pois mask apaga
            }
            if(typeof bloquearCampos === 'function') bloquearCampos(false);

            window.carregarFornecedoresParametros = () => { carregarFornecedores(); };
        }
    } catch(e) {
        window.Toast.error("Erro ao carregar dados do fornecedor: " + e.message);
    }
}

window.deletarFornecedor = async function(id) {
    if(confirm('Atenção: Deseja realmente excluir este Fornecedor?')) {
        try {
            const engine = window.goEngine || window.go;
            await engine.main.App.ExcluirFornecedor(parseInt(id));
            if (typeof Toast !== 'undefined' && Toast.show) Toast.show('success', "Fornecedor excluído com sucesso.");
            carregarFornecedores(); 
        } catch(e) {
            if (typeof Toast !== 'undefined' && Toast.show) Toast.show('error', "Falha ao excluir fornecedor.");
        }
    }
}

window.desabilitarFornecedor = async function(id) {
    if(confirm('Tem certeza que deseja alterar o status (Habilitar/Desabilitar) deste Fornecedor?')) {
        try {
            const engine = window.goEngine || window.go;
            const ls = await engine.main.App.ListarFornecedores() || [];
            const f = ls.find(x => x.id === parseInt(id));
            if(!f) return;
            
            f.ativo = !f.ativo;
            const resp = await engine.main.App.SalvarFornecedor(f);
            
            if (resp && resp.startsWith('Erro')) {
                if (typeof Toast !== 'undefined' && Toast.show) Toast.show('error', resp);
                else alert(resp);
            } else {
                if (typeof Toast !== 'undefined' && Toast.show) Toast.show('success', f.ativo ? 'Fornecedor HABILITADO.' : 'Fornecedor DESABILITADO.');
                carregarFornecedores();
            }
        } catch(e) {
            console.error(e);
            if (typeof Toast !== 'undefined' && Toast.show) Toast.show('error', 'Falha ao alterar status.');
        }
    }
}
