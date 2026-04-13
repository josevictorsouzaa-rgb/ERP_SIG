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
        renderizarMockTabela('corpo-tabela-usuarios', 8, 'Carregando painel RBAC...');
        setTimeout(() => carregarUsuariosRBAC(), 100);
    } else if (abaId === 'funcoes') {
        renderizarMockTabela('corpo-tabela-funcoes', 3, 'Analisando ACLs...');
        setTimeout(() => carregarRoles(), 100);
    } else if (abaId === 'empresa') {
        const abaEl = document.getElementById('aba-empresa');
        // Se a tabela ainda não foi injetada, fazemos o fetch do novo arquivo
        if (abaEl.innerHTML.includes('CONTEÚDO INJETADO') || abaEl.innerHTML.trim() === '') {
            abaEl.innerHTML = '<div class="p-10 flex flex-col items-center justify-center text-slate-400 gap-2 font-bold text-xs"><span class="material-symbols-outlined animate-spin text-2xl">sync</span> Carregando UI...</div>';
            fetch('./tabela_empresa/empresa_tabela.html').then(r => r.text()).then(html => {
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
        renderizarMockTabela('corpo-tabela-fornecedores', 5, 'Carregando fornecedores...');
        setTimeout(() => carregarFornecedores(), 100);
    } // abaId === 'produtos' uses 'mudarSubAba' to fetch specifically what's visible
};

window.mudarSubAba = (abaId) => {
    document.getElementById('sub-marcas').classList.add('hidden');
    document.getElementById('sub-categorias').classList.add('hidden');
    document.getElementById('btn-sub-marcas').classList.remove('ativa');
    document.getElementById('btn-sub-categorias').classList.remove('ativa');

    document.getElementById(`sub-${abaId}`).classList.remove('hidden');
    document.getElementById(`btn-sub-${abaId}`).classList.add('ativa');
    
    if (abaId === 'marcas') {
        renderizarMockTabela('corpo-tabela-marcas', 4, 'Carregando Marcas...');
        setTimeout(() => carregarMarcas(), 100);
    } else if (abaId === 'categorias') {
        renderizarMockTabela('corpo-tabela-categorias', 3, 'Carregando Categorias...');
        setTimeout(() => carregarCategorias(), 100);
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
        const response = await fetch('./formulario/formulario_cadastro_de_empresa.html');
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
    if(!confirm("Tem certeza que deseja EXCLUIR esta empresa? (Se for matriz, removerá filiais também)")) return;
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
                    <td class="sig-text-center font-mono font-bold text-slate-400">#${i.id}</td>
                    <td class="font-bold text-xs uppercase">${i.nome || '-'} ${i.sobrenome || ''}</td>
                    <td class="font-mono text-slate-500">${doc}</td>
                    <td class="font-black text-[10px] text-amber-700 uppercase tracking-widest">GRUPO ID: ${i.grupo_acesso_id || 0}</td>
                    <td class="font-mono font-black text-sig-blue">${i.login || '-'}</td>
                    <td class="sig-text-center font-mono text-[9px]">-</td>
                    <td class="sig-text-center"><span class="${stClass} px-1.5 py-0.5 rounded text-[8px] font-black">${txtSt}</span></td>
                    <td class="sig-text-center">
                        <button class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200" title="Editar"><span class="material-symbols-outlined !text-[14px]">edit</span></button>
                        <button class="w-6 h-6 rounded bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-400 ml-1" title="Revogar"><span class="material-symbols-outlined !text-[14px]">block</span></button>
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
        let dom = "";
        if (list.length === 0) { dom = `<tr><td colspan="4" class="text-center py-4 text-slate-400">Nenhuma marca encontrada</td></tr>`; }
        list.forEach(i => {
            dom += `
                <tr class="hover:bg-slate-50">
                    <td class="sig-text-center font-mono font-bold text-slate-400">#${i.id || '-'}</td>
                    <td class="font-bold text-xs uppercase">${i.nome || '-'}</td>
                    <td class="sig-text-center text-slate-500 font-mono">${i.margem_padrao || i.mkp_balcao || '0'}%</td>
                    <td class="sig-text-center">
                        <button class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200"><span class="material-symbols-outlined !text-[14px]">edit</span></button>
                    </td>
                </tr>
            `;
        });
        tb.innerHTML = dom;
    } catch(e) { console.error(e); tb.innerHTML = ''; }
}

async function carregarCategorias() {
    const tb = document.getElementById('corpo-tabela-categorias');
    try {
        const engine = window.goEngine || window.go;
        let list = await engine.main.App.ListarCategorias() || [];
        let dom = "";
        if (list.length === 0) { dom = `<tr><td colspan="3" class="text-center py-4 text-slate-400">Nenhuma categoria encontrada</td></tr>`; }
        list.forEach(i => {
            dom += `
                <tr class="hover:bg-slate-50">
                    <td class="sig-text-center font-mono font-bold text-slate-400">#${i.id || '-'}</td>
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

// Funções globais genéricas para Marcas/Subcategorias/Submarcas
window.abrirModalGenerico = (tipo, jsFunction) => {
    const html = `
        <div class="mb-2">
            <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1">Nome da ${tipo}</label>
            <input type="text" class="sig-input-dense w-full uppercase font-bold" autofocus>
        </div>
    `;
    injetarModalUI(`NOVA ${tipo.toUpperCase()}`, 'data_object', html, 'document.getElementById("base-modal").remove();');
};

// ==========================================
// MODAL FORNECEDORES
// ==========================================
window.abrirModalFornecedor = async () => {
    try {
        if (!window.htmlFornecedorCache) {
            const res = await fetch('./modais/modal_fornecedor.html');
            window.htmlFornecedorCache = await res.text();
        }
    } catch(e) {
        console.error("Erro ao carregar layout do modal fornecedor:", e);
        alert("Erro ao carregar interface. Verifique os arquivos do sistema.");
        return;
    }

    injetarModalUI('NOVO FORNECEDOR', 'local_shipping', window.htmlFornecedorCache, 'salvarBDFornecedor()');
};

window.salvarBDFornecedor = async () => {
    const documentoValue = document.getElementById('forn-documento').value || '';
    const tipo = documentoValue.replace(/\\D/g, '').length === 11 ? 'F' : 'J';

    const fornecedor = {
        ativo: true,
        tipo_pessoa: tipo,
        documento: documentoValue,
        ie: document.getElementById('forn-ie').value || '',
        razao_social: document.getElementById('forn-razao').value || '',
        fantasia: document.getElementById('forn-fantasia').value || '',
        cep: document.getElementById('forn-cep').value || '',
        endereco: document.getElementById('forn-endereco').value || '',
        numero: document.getElementById('forn-numero').value || '',
        bairro: document.getElementById('forn-bairro').value || '',
        cidade: document.getElementById('forn-cidade').value || '',
        uf: document.getElementById('forn-uf').value || '',
        contatos: JSON.stringify([])
    };

    if (!fornecedor.razao_social && !fornecedor.fantasia) {
        alert("A Razão Social ou Nome Fantasia é obrigatório.");
        return;
    }

    try {
        const engine = window.goEngine || window.go;
        if (!engine?.main?.App?.SalvarFornecedor) {
            alert("Engine offline. Não foi possível salvar.");
            return;
        }

        const res = await engine.main.App.SalvarFornecedor(fornecedor);
        if (res.startsWith("Erro")) {
            alert(res);
            return;
        }
        
        // Fechar modal e recarregar tabela
        document.getElementById('base-modal').remove();
        carregarFornecedores();
    } catch (e) {
        alert("Erro de conexão ao salvar fornecedor.");
        console.error(e);
    }
};
