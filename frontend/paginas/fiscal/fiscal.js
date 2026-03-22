// FISCAL - Módulo de Logística e Tributação (V63)
// Lógica de interface e integração com Wails

let perfis = [];

// Inicialização
window.onload = async () => {
    try {
        // Integração com motor Go via Wails
        window.goEngine = window.parent.go || window.go;
        if (!window.goEngine) {
            console.error("Motor Wails não encontrado.");
            return;
        }

        await carregarPerfis();
    } catch (e) {
        console.error("Erro ao inicializar módulo fiscal:", e);
    }
};

async function carregarPerfis() {
    try {
        perfis = await window.goEngine.main.App.ListarPerfisFiscais() || [];
        renderizar();
    } catch (e) { console.error(e); }
}

function renderizar() {
    const tbody = document.getElementById('lista-perfis');
    tbody.innerHTML = "";

    perfis.forEach(p => {
        const isEntrada = p.operacao === 'ENTRADA';
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/50 transition-colors";
        
        tr.innerHTML = `
            <td class="font-bold text-slate-700 uppercase p-3">${p.nome}</td>
            <td class="text-center">
                <span class="inline-block px-3 py-1 rounded text-[9px] font-black uppercase ${isEntrada ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                    ${p.operacao}
                </span>
            </td>
            <td class="text-center font-mono font-bold text-blue-600">${p.icms_aliq.toFixed(2)}%</td>
            <td class="text-center font-bold ${p.tem_st ? 'text-orange-600' : 'text-slate-300'}">
                ${p.tem_st ? '<span class="text-[10px] bg-orange-100 text-orange-700 px-1 rounded">SIM</span>' : 'NÃO'}
            </td>
            <td class="text-center font-mono text-slate-500">${p.ipi_aliq.toFixed(2)}%</td>
            <td class="text-center font-mono text-slate-500">${p.pis_aliq.toFixed(2)}%</td>
            <td class="text-center font-mono text-slate-500">${p.cofins_aliq.toFixed(2)}%</td>
            <td class="text-center font-mono font-bold text-slate-700 bg-slate-50/50">${p.cfop_padrao}</td>
            <td class="text-center">
                <div class="flex justify-center gap-1">
                    <button onclick="editar(${p.id})" class="sig-btn-icon !w-8 !h-8 text-blue-600 hover:bg-blue-50">
                        <span class="material-symbols-outlined !text-[18px]">edit</span>
                    </button>
                    <button onclick="excluir(${p.id})" class="sig-btn-icon !w-8 !h-8 text-red-500 hover:bg-red-50">
                        <span class="material-symbols-outlined !text-[18px]">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (perfis.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="p-20 text-center text-slate-400 italic">Nenhum perfil fiscal cadastrado. Clique em "NOVO PERFIL" para começar.</td></tr>';
    }
}

// AÇÕES DO MODAL
window.abrirModal = () => {
    limparForm();
    document.getElementById('modal-titulo').innerText = "NOVO PERFIL FISCAL";
    document.getElementById('modal-fiscal').style.display = 'flex';
};

window.fecharModal = () => {
    document.getElementById('modal-fiscal').style.display = 'none';
};

function limparForm() {
    document.getElementById('fis-id').value = "0";
    document.getElementById('fis-nome').value = "";
    document.getElementById('fis-operacao').value = "ENTRADA";
    document.getElementById('fis-icms').value = "0";
    document.getElementById('fis-st').checked = false;
    document.getElementById('fis-ipi').value = "0";
    document.getElementById('fis-pis').value = "0";
    document.getElementById('fis-cofins').value = "0";
    document.getElementById('fis-cfop').value = "";
}

window.editar = (id) => {
    const p = perfis.find(it => it.id === id);
    if (!p) return;

    document.getElementById('fis-id').value = p.id;
    document.getElementById('fis-nome').value = p.nome;
    document.getElementById('fis-operacao').value = p.operacao;
    document.getElementById('fis-icms').value = p.icms_aliq;
    document.getElementById('fis-st').checked = p.tem_st;
    document.getElementById('fis-ipi').value = p.ipi_aliq;
    document.getElementById('fis-pis').value = p.pis_aliq;
    document.getElementById('fis-cofins').value = p.cofins_aliq;
    document.getElementById('fis-cfop').value = p.cfop_padrao;

    document.getElementById('modal-titulo').innerText = "EDITAR PERFIL: " + p.nome.toUpperCase();
    document.getElementById('modal-fiscal').style.display = 'flex';
};

window.salvar = async () => {
    const payload = {
        id: parseInt(document.getElementById('fis-id').value),
        nome: document.getElementById('fis-nome').value.trim(),
        operacao: document.getElementById('fis-operacao').value,
        icms_aliq: parseFloat(document.getElementById('fis-icms').value) || 0,
        tem_st: document.getElementById('fis-st').checked,
        ipi_aliq: parseFloat(document.getElementById('fis-ipi').value) || 0,
        pis_aliq: parseFloat(document.getElementById('fis-pis').value) || 0,
        cofins_aliq: parseFloat(document.getElementById('fis-cofins').value) || 0,
        cfop_padrao: document.getElementById('fis-cfop').value.trim()
    };

    if (!payload.nome) return alert("O nome do perfil é obrigatório.");

    try {
        const res = await window.goEngine.main.App.SalvarPerfilFiscal(payload);
        if (res === "OK") {
            fecharModal();
            carregarPerfis();
        } else alert(res);
    } catch (e) { alert(e); }
};

window.excluir = async (id) => {
    if (!confirm("Deseja realmente excluir este perfil fiscal?")) return;
    try {
        const res = await window.goEngine.main.App.ExcluirPerfilFiscal(id);
        if (res === "OK") carregarPerfis();
        else alert(res);
    } catch (e) { alert(e); }
};
