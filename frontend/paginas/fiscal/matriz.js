// matriz.js
let todasRegras = [];

window.addEventListener('wails_ready', () => {
    carregarMatriz();
});

// Eventos de mudança no banco emitidos pelo Wails
window.runtime.EventsOn("db_event", (payload) => {
    if (payload === "matriz_changed") {
        carregarMatriz();
    }
});

async function carregarMatriz() {
    try {
        todasRegras = await window.go.main.App.ListarMatrizesFiscais();
        renderizarGrid(todasRegras);
    } catch (err) {
        console.error("Erro ao listar matriz:", err);
    }
}

function obterBadgePrioridade(prio) {
    if (prio === 'CRÍTICA') return { label: 'CRÍTICA', class: 'bg-rose-50 text-rose-600 border-rose-100' };
    if (prio === 'ALTA') return { label: 'ALTA', class: 'bg-amber-50 text-amber-600 border-amber-100' };
    return { label: 'PADRÃO', class: 'bg-slate-50 text-slate-500 border-slate-100' };
}

function renderizarGrid(lista) {
    const corpo = document.getElementById('grid-matriz-corpo');
    if (!corpo) return;

    if (!lista || lista.length === 0) {
        corpo.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-slate-400 italic font-medium">Nenhuma regra cadastrada na matriz.</td></tr>`;
        document.getElementById('label-count').innerText = "Total: 0 regras";
        return;
    }

    corpo.innerHTML = lista.map(r => `
        <tr class="hover:bg-slate-50 transition-all border-b border-slate-100 group">
            <!-- ID (Sem # e Sequencial) -->
            <td class="p-3 text-center font-mono text-[10px] text-slate-400 font-bold border-r border-slate-50">
                ${r.id}
            </td>
            
            <!-- Descrição (Bold) -->
            <td class="p-3">
                <div class="flex flex-col">
                    <span class="text-[10px] font-black text-slate-700 uppercase tracking-tight">${r.nome}</span>
                    <span class="text-[8px] text-slate-400 italic font-mono">CFOP: ${r.cfop} | CST: ${r.cst_csosn}</span>
                </div>
            </td>

            <!-- Operação (Badge) -->
            <td class="p-3 text-center">
                <span class="px-2 py-0.5 ${r.operacao === 'SAIDA' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'} rounded text-[8px] font-black border border-current opacity-70">
                    ${r.operacao || 'TODAS'}
                </span>
            </td>

            <!-- Tipo Destino -->
            <td class="p-3 text-center">
                <span class="px-2 py-0.5 bg-white border border-slate-200 rounded text-[8px] font-black text-slate-500 uppercase">
                    ${r.tipo_destino}
                </span>
            </td>

            <!-- Regime -->
            <td class="p-3 text-center">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    ${r.regime_tributario || 'TODOS'}
                </span>
            </td>

            <!-- Prioridade (Humanizada) -->
            <td class="p-3 text-center">
                <span class="px-2 py-0.5 rounded text-[9px] font-black border ${obterBadgePrioridade(r.prioridade).class} tracking-widest">
                    ${obterBadgePrioridade(r.prioridade).label}
                </span>
            </td>

            <!-- Status (Badge Circular) -->
            <td class="p-3 text-center">
                <div class="flex justify-center">
                    <div class="w-2 h-2 rounded-full ${r.ativa ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-300'}"></div>
                </div>
            </td>

            <!-- Ações -->
            <td class="p-3">
                <div class="flex gap-2 justify-center">
                    <button onclick="editarRegra(${r.id})" class="sig-btn-action-edit">
                        <span class="material-symbols-outlined !text-[14px]">edit</span>
                    </button>
                    <button onclick="deletarRegra(${r.id})" class="sig-btn-action-delete">
                        <span class="material-symbols-outlined !text-[14px]">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    document.getElementById('label-count').innerText = `Total: ${lista.length} regras carregadas`;
}

function filtrarGrid(termo) {
    const t = termo.toLowerCase();
    const filtrados = todasRegras.filter(r => 
        r.nome.toLowerCase().includes(t) ||
        r.ncm.toLowerCase().includes(t) ||
        r.cfop.includes(t) ||
        r.cst_csosn.includes(t)
    );
    renderizarGrid(filtrados);
}

// Escuta evento de input no filtro
document.getElementById('filtro-matriz')?.addEventListener('input', (e) => {
    filtrarGrid(e.target.value);
});

async function novaRegra() {
    abrirModalFiscal();
}

async function abrirModalFiscal(id = 0) {
    const res = await fetch('modais/modal_matriz_fiscal.html');
    const html = await res.text();
    document.getElementById('modal-container').innerHTML = html;
    
    if (id > 0) {
        document.getElementById('modal-titulo').innerText = "Editar Regra Fiscal";
        const mf = todasRegras.find(r => r.id === id);
        if (mf) preencherModal(mf);
    }
}

function fecharModalMatriz() {
    document.getElementById('modal-container').innerHTML = '';
}

function preencherModal(mf) {
    document.getElementById('form-matriz').dataset.id = mf.id;
    document.getElementById('mat-nome').value = mf.nome;
    document.getElementById('mat-prioridade').value = mf.prioridade;
    document.getElementById('mat-ativa').checked = mf.ativa;
    document.getElementById('mat-regime').value = mf.regime_tributario;
    document.getElementById('mat-operacao').value = mf.operacao;
    document.getElementById('mat-tipo-destino').value = mf.tipo_destino;
    document.getElementById('mat-incide-st-cond').value = mf.incidencia_st;
    document.getElementById('mat-ncm').value = mf.ncm;
    document.getElementById('mat-res-cfop').value = mf.cfop;
    document.getElementById('mat-res-cst').value = mf.cst_csosn;
    document.getElementById('mat-res-destaca-icms').checked = mf.destaca_icms;
    document.getElementById('mat-res-gera-credito').checked = mf.credito_icms;
    document.getElementById('mat-res-incide-ipi').checked = mf.incide_ipi;
    document.getElementById('mat-res-incide-difal').checked = mf.incide_difal;
    document.getElementById('mat-res-incide-pis').checked = mf.incide_pis;
    document.getElementById('mat-res-incide-cofins').checked = mf.incide_cofins;
}

async function salvarRegraMatriz() {
    const id = parseInt(document.getElementById('form-matriz').dataset.id || "0");
    const mf = {
        id: id,
        nome: document.getElementById('mat-nome').value,
        prioridade: document.getElementById('mat-prioridade').value,
        ativa: document.getElementById('mat-ativa').checked,
        regime_tributario: document.getElementById('mat-regime').value,
        operacao: document.getElementById('mat-operacao').value,
        tipo_destino: document.getElementById('mat-tipo-destino').value,
        incidencia_st: document.getElementById('mat-incide-st-cond').value,
        ncm: document.getElementById('mat-ncm').value,
        cfop: document.getElementById('mat-res-cfop').value,
        cst_csosn: document.getElementById('mat-res-cst').value,
        destaca_icms: document.getElementById('mat-res-destaca-icms').checked,
        credito_icms: document.getElementById('mat-res-gera-credito').checked,
        incide_ipi: document.getElementById('mat-res-incide-ipi').checked,
        incide_difal: document.getElementById('mat-res-incide-difal').checked,
        incide_pis: document.getElementById('mat-res-incide-pis').checked,
        incide_cofins: document.getElementById('mat-res-incide-cofins').checked
    };

    try {
        await window.go.main.App.SalvarMatrizFiscal(mf);
        fecharModalMatriz();
        carregarMatriz();
    } catch (err) {
        alert(err);
    }
}

function editarRegra(id) {
    abrirModalFiscal(id);
}

async function deletarRegra(id) {
    if (!confirm("Tem certeza que deseja excluir esta regra?")) return;
    const resp = await window.go.main.App.ExcluirMatrizFiscal(id);
    if (resp === "OK") {
        carregarMatriz();
    } else {
        alert("Erro ao excluir: " + resp);
    }
}
