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

    // Inicializar carregamentos
    if (abaId === 'usuarios') {
        renderizarMockTabela('corpo-tabela-usuarios', 6, 'Carregando painel RBAC...');
        setTimeout(() => carregarUsuariosRBAC(), 800);
    } else if (abaId === 'funcoes') {
        renderizarMockTabela('corpo-tabela-funcoes', 3, 'Analisando ACLs...');
        setTimeout(() => carregarRoles(), 800);
    } else if (abaId === 'empresa') {
        renderizarMockTabela('corpo-tabela-empresas', 6, 'Lendo unidades...');
        setTimeout(() => carregarEmpresas(), 800);
    }
};

window.mudarSubAba = (abaId) => {
    document.getElementById('sub-marcas').classList.add('hidden');
    document.getElementById('sub-categorias').classList.add('hidden');
    document.getElementById('btn-sub-marcas').classList.remove('ativa');
    document.getElementById('btn-sub-categorias').classList.remove('ativa');

    document.getElementById(`sub-${abaId}`).classList.remove('hidden');
    document.getElementById(`btn-sub-${abaId}`).classList.add('ativa');
};

// ==========================================
// RENDERIZAÇÃO ESTÉTICA DE MOCKS
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
        <div class="bg-white rounded shadow-2xl w-[600px] flex flex-col overflow-hidden animate-slide-up ring-1 ring-slate-800 border-none">
            
            <!-- HEADER V79 DARK MODE SOLID -->
            <div class="bg-slate-900 text-white p-3 flex justify-between items-center shrink-0 shadow-sm border-b border-white/10">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-sig-brand-cyan">${icon}</span>
                    <span class="font-bold text-xs uppercase tracking-widest text-slate-200">${titulo}</span>
                </div>
                <button onclick="document.getElementById('base-modal').remove()" class="w-6 h-6 rounded flex justify-center items-center hover:bg-red-500/80 hover:text-white transition-colors text-slate-400">
                    <span class="material-symbols-outlined !text-[14px]">close</span>
                </button>
            </div>

            <!-- BODY -->
            <div class="p-5 flex-1 min-h-0 overflow-auto bg-slate-50 relative">
                ${formHTML}
            </div>

            <!-- FOOTER -->
            <div class="bg-white border-t border-slate-200 p-3 flex justify-end gap-2 shrink-0">
                <button onclick="document.getElementById('base-modal').remove()" class="sig-btn border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 font-bold px-4 py-1.5 rounded uppercase tracking-wider text-[10px]">Cancelar</button>
                <button onclick="${actionScript}" class="sig-btn border border-sig-blue bg-sig-blue text-white font-bold px-6 py-1.5 rounded uppercase tracking-wider text-[10px] hover:bg-blue-700 flex gap-2 items-center shadow-lg shadow-blue-500/20">
                    <span class="material-symbols-outlined !text-[14px]">save</span> SALVAR REGISTRO
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
window.abrirSelecaoTipo = () => {
    const html = `
        <fieldset class="sig-fieldset-blueprint border-slate-300 bg-white">
            <legend class="text-[9px] font-black tracking-widest text-emerald-700 bg-white px-2">DADOS CADASTRAIS (NF-E)</legend>
            <div class="grid grid-cols-12 gap-3 py-3 px-2">
                
                <div class="col-span-4">
                    <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1">CNPJ</label>
                    <input type="text" id="emp-cnpj" class="sig-input-dense w-full font-mono font-black tracking-widest bg-emerald-50 text-emerald-800">
                </div>

                <div class="col-span-8">
                    <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1">Inscrição Estadual (I.E)</label>
                    <input type="text" id="emp-ie" class="sig-input-dense w-full font-mono text-slate-600 uppercase">
                </div>

                <div class="col-span-12">
                    <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1">Razão Social Oficial</label>
                    <input type="text" id="emp-razao" class="sig-input-dense w-full font-bold uppercase text-slate-700">
                </div>

                <div class="col-span-6">
                    <label class="text-[9px] font-bold text-slate-500 uppercase block mb-1">Regime Tributário</label>
                    <select id="emp-regime" class="sig-input-dense w-full font-bold text-slate-600">
                        <option value="1">Simples Nacional</option>
                        <option value="2">Simples (Excesso Rec.)</option>
                        <option value="3">Lucro Presumido</option>
                        <option value="4">Lucro Real</option>
                    </select>
                </div>

            </div>
        </fieldset>
    `;
    injetarModalUI('ESTRUTURA MATRIZ FILIAL', 'corporate_fare', html, 'alert("Empresa registrada na base!"); document.getElementById("base-modal").remove();');
};

// ==========================================
// 3. MOCKS DE CARREGAMENTOS (V79 PREVIEWS)
// ==========================================
function carregarUsuariosRBAC() {
    const list = [
        {id: 1, nome: "JOÃO ALMEIDA (CTO)", cpf: "555.222.111-99", funcao: "ADMIN MASTER", login: "J.ALMEIDA", acesso: "AGORA", status: "ATIVO"},
        {id: 2, nome: "MARIA TEREZA", cpf: "111.444.666-00", funcao: "ANALISTA FISCAL", login: "M.TEREZA", acesso: "ONTEM", status: "INATIVO"}
    ];
    
    let dom = "";
    list.forEach(i => {
        let stClass = i.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';
        dom += `
            <tr class="hover:bg-slate-50">
                <td class="sig-text-center font-mono font-bold text-slate-400">#${i.id}</td>
                <td class="font-bold text-xs uppercase">${i.nome}</td>
                <td class="font-mono text-slate-500">${i.cpf}</td>
                <td class="font-black text-[10px] text-amber-700 uppercase tracking-widest">${i.funcao}</td>
                <td class="font-mono font-black text-sig-blue">${i.login}</td>
                <td class="sig-text-center font-mono text-[9px]">${i.acesso}</td>
                <td class="sig-text-center"><span class="${stClass} px-1.5 py-0.5 rounded text-[8px] font-black">${i.status}</span></td>
                <td class="sig-text-center">
                    <button class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200" title="Editar"><span class="material-symbols-outlined !text-[14px]">edit</span></button>
                    <button class="w-6 h-6 rounded bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-400 ml-1" title="Revogar"><span class="material-symbols-outlined !text-[14px]">block</span></button>
                </td>
            </tr>
        `;
    });
    const tb = document.getElementById('corpo-tabela-usuarios');
    if(tb) tb.innerHTML = dom;
}

function carregarEmpresas() {
    document.getElementById('corpo-tabela-empresas').innerHTML = `
        <tr class="hover:bg-slate-50">
            <td class="sig-text-center font-mono font-bold text-slate-400">#1</td>
            <td class="font-bold text-xs uppercase">GRUPO LUBEL MANUTENÇÃO SA</td>
            <td class="font-mono text-slate-500">22.444.666/0001-99</td>
            <td class="font-black text-[9px] text-emerald-700 uppercase">DEPÓSITO CENTRAL</td>
            <td class="font-black text-[9px] text-slate-500 uppercase tracking-widest">LUCRO REAL</td>
            <td class="sig-text-center">
                <button class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200"><span class="material-symbols-outlined !text-[14px]">edit</span></button>
            </td>
        </tr>
    `;
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
