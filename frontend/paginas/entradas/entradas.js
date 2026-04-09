/**
 * SIG - Recepção de Mercadorias e XML
 * V70 - Confronto Operacional Front/Back
 */

let itensNota = [];
let notaCabecalho = {};

window.onload = async () => {
    try {
        window.goEngine = window.parent.go || window.go;
        if (!window.goEngine) {
            console.warn("Motor Wails offline.");
            return;
        }
        adicionarLog("[SISTEMA] Motor UI carregado e aguardando importação...");
    } catch (e) { adicionarLog("[ERRO FATAL] " + e); }
};

window.importarXML = async () => {
    try {
        if (!window.goEngine) return adicionarLog("[ERRO] Engine offline.");

        const entrada = await window.goEngine.main.App.ImportarXML();
        if (!entrada || !entrada.numero_nota) return adicionarLog("[AVISO] Seleção cancelada.");

        notaCabecalho = entrada;

        document.getElementById('ent-fornecedor-nome').value = (notaCabecalho.fornecedor_nome || "DESCONHECIDO").toUpperCase();
        document.getElementById('ent-cnpj').value = notaCabecalho.cnpj || "";
        document.getElementById('ent-numero').value = notaCabecalho.numero_nota || "";
        document.getElementById('ent-serie').value = notaCabecalho.serie || "";
        document.getElementById('ent-data-emissao').value = notaCabecalho.data_emissao || "";
        document.getElementById('ent-chave').value = notaCabecalho.chave_acesso || "";
        
        let d = new Date();
        document.getElementById('ent-data-entrada').value = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;

        adicionarLog(`[INFO] XML Verificado. Forn: ${notaCabecalho.cnpj}. Destino: ${notaCabecalho.cnpj_destino}`);

        // O SEGREDO DO CONFRONTO CEGO: produto_id INICIA ZERO (SEM VÍNCULO)
        itensNota = (notaCabecalho.itens || []).map(it => ({
            ...it,
            produto_id: it.produto_id || 0,
            cfop_interno: "",
            cst_interno: "",
            custo_calculado: it.valor_unitario
        }));

        renderizarItens();
        atualizarAuditoria();
    } catch (e) { alert("Falha na importação XML: " + e); }
};

function renderizarItens() {
    const tbody = document.getElementById('lista-itens-entrada');
    if (itensNota.length === 0) return;

    tbody.innerHTML = "";
    itensNota.forEach((it, idx) => {
        const hasVinculo = it.produto_id > 0;
        
        let badgeClass = "bg-amber-100 text-amber-800 border border-amber-300";
        let statusText = "SEM VÍNCULO";
        
        if (hasVinculo) {
            badgeClass = "bg-emerald-100 text-emerald-800 border border-emerald-300";
            statusText = "VERIFICADO";
        } else if (!it.ncm) {
            badgeClass = "bg-red-100 text-red-800 border border-red-300";
            statusText = "SEM NCM";
        }

        const tr = document.createElement('tr');
        tr.className = `hover:bg-slate-50 transition-colors border-b border-slate-200 ${!hasVinculo ? 'bg-amber-50/20' : ''}`;

        tr.innerHTML = `
            <!-- DADOS ORIGINAIS SEFAZ (BINÁRIO) -->
            <td class="text-center font-bold text-slate-600 border-r border-slate-200">${it.produto_sku || '---'}</td>
            <td class="font-bold text-slate-700 border-r border-slate-200 px-2 uppercase truncate max-w-[200px]" title="${it.produto_nome}">${it.produto_nome}</td>
            <td class="text-center font-mono border-r border-slate-200 text-slate-500">${it.ncm || '---'}</td>
            <td class="text-center font-mono border-r border-slate-200">${it.cst || '---'}</td>
            <td class="text-center font-mono border-r border-slate-200">${it.cfop || '---'}</td>
            <td class="text-center text-slate-500 border-r border-slate-200">${it.unidade || 'UN'}</td>
            <td class="text-right font-mono font-bold border-r border-slate-200 px-2">${(it.quantidade || 0).toFixed(2)}</td>
            <td class="text-right font-mono border-r border-slate-200 px-2">${(it.valor_unitario || 0).toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
            <td class="text-right font-mono font-black border-r border-slate-200 px-2">${((it.quantidade || 0) * (it.valor_unitario || 0)).toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
            <td class="text-right font-mono border-r border-slate-200 px-2 text-slate-500">${(it.valor_desconto || 0).toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
            <td class="text-right font-mono border-r border-slate-200 px-2 text-slate-500">${(it.base_icms || 0).toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
            <td class="text-right font-mono border-r border-slate-200 px-2">${(it.valor_icms || 0).toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
            <td class="text-right font-mono border-r border-slate-200 px-2">${(it.valor_ipi || 0).toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
            <td class="text-right font-mono border-r border-slate-200 px-2 text-slate-500">${(it.aliquota_icms || 0).toFixed(2)}%</td>
            <td class="text-right font-mono border-r border-slate-300 px-2 text-slate-500">${(it.aliquota_ipi || 0).toFixed(2)}%</td>
            
            <!-- DADOS DO ERP (CONFRONTO AZULADO) -->
            <td class="border-r border-slate-200 px-2 bg-blue-50/30">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold ${hasVinculo ? 'text-sig-blue' : 'text-slate-400 italic'}">
                        ${hasVinculo ? `MATRIZ ERP-${it.produto_id}` : 'REFERÊNCIA CEGA...'}
                    </span>
                    ${!hasVinculo ? `<button class="border border-slate-400 rounded bg-white w-5 h-5 flex justify-center items-center hover:bg-amber-100 cursor-pointer" title="Acoplar com o Banco" onclick="window.mapearProduto(${idx})"><span class="material-symbols-outlined !text-[12px] text-sig-blue">link</span></button>` : ''}
                </div>
            </td>
            <td class="text-center font-mono font-bold text-sig-blue border-r border-slate-200 bg-blue-50/30">${it.cfop_interno || '---'}</td>
            <td class="text-center font-mono font-bold text-sig-blue border-r border-slate-200 bg-blue-50/30">${it.cst_interno || '---'}</td>
            <td class="text-right font-mono font-black text-slate-600 border-r border-slate-200 px-2 bg-blue-50/30">${hasVinculo ? it.custo_calculado.toLocaleString('pt-br', {minimumFractionDigits: 2}) : '---'}</td>
            <td class="text-center bg-blue-50/30"><span class="rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase ${badgeClass}">${statusText}</span></td>
        `;
        tbody.appendChild(tr);
    });

    atualizarResumo();
}

function atualizarAuditoria() {
    const pnlValidacao = document.getElementById('painel-validacao');
    const btnConfirmar = document.getElementById('btn-confirmar-entrada');
    
    const pendenciasVinculo = itensNota.filter(it => it.produto_id === 0).length;
    let empresaValida = (notaCabecalho.empresa_id || 0) > 0;
    
    // MOCK PARA O PROTÓTIPO EVITAR BLOQUEIO SE NÃO TEM BANCO REAL CARREGADO
    if (!window.goEngine || notaCabecalho.fornecedor_nome == "MOCK") {
        empresaValida = true;
    }

    let HTML_Audit = `<div class="w-full h-full flex flex-col justify-center px-1"><div class="grid grid-cols-2 gap-2">`;
    let erros = 0;

    if (!empresaValida) {
        HTML_Audit += `
        <div class="col-span-2 bg-red-100 border border-sig-red px-2 py-1 flex justify-between items-center shadow-sm">
            <span class="text-[9px] font-black uppercase text-red-900 flex gap-1 items-center"><span class="material-symbols-outlined !text-[12px]">gpp_bad</span> DECLÍNIO DE CNPJ DESTINATÁRIO</span>
            <span class="text-[9px] font-bold text-red-700">A Nota Fiscal foi faturada para um CNPJ de Terceiros (${notaCabecalho.cnpj_destino || 'Indefinido'})</span>
        </div>`;
        erros++;
    }

    if (pendenciasVinculo > 0) {
        HTML_Audit += `
        <div class="col-span-2 bg-amber-100 border border-amber-400 px-2 py-1 flex justify-between items-center rounded-sm">
            <span class="text-[9px] font-black text-amber-800 uppercase">ITENS ÓRFÃOS (SEM VÍNCULO NO SISTEMA)</span>
            <span class="text-xs font-black text-amber-900">${pendenciasVinculo}</span>
        </div>`;
        erros++;
    }

    HTML_Audit += `</div></div>`;

    if (erros > 0) {
        pnlValidacao.innerHTML = HTML_Audit;
        btnConfirmar.disabled = true;
        btnConfirmar.classList.add('opacity-30', 'pointer-events-none');
    } else {
        pnlValidacao.innerHTML = `<div class="text-emerald-700 font-extrabold uppercase text-[10px] tracking-wider flex flex-col items-center"><span class="material-symbols-outlined text-4xl mb-1">verified_user</span> AUDITORIA FINALIZADA.<br>PERMISSÃO DE ESCRITA NO ESTOQUE CONCEDIDA.</div>`;
        btnConfirmar.disabled = false;
        btnConfirmar.classList.remove('opacity-30', 'pointer-events-none');
    }
}

function atualizarResumo() {
    const totalProd = itensNota.reduce((sum, it) => sum + ((it.quantidade||0) * (it.valor_unitario||0)), 0);
    const pendentes = itensNota.filter(it => it.produto_id === 0).length;

    document.getElementById('res-qtd-itens').value = itensNota.length;
    document.getElementById('res-qtd-pendentes').value = pendentes;
    document.getElementById('res-total-produtos').value = "R$ " + totalProd.toLocaleString('pt-br', {minimumFractionDigits: 2});
    document.getElementById('res-total-nota').value = "R$ " + (notaCabecalho.valor_total || totalProd).toLocaleString('pt-br', {minimumFractionDigits: 2});
}

function adicionarLog(msg) {
    const logTA = document.getElementById('log-tecnico');
    if (logTA) {
        logTA.value += `\n> ${msg}`;
        logTA.scrollTop = logTA.scrollHeight;
    }
}

window.mapearProduto = (idx) => {
    alert("Abrindo Módulo Interligado de Confronto/Vínculo para o produto [" + itensNota[idx].produto_nome + "]...");
};

window.confirmarNota = async () => {
    alert("Iniciando Transação ACID no Banco de Dados...");
    if (window.runtime) window.runtime.Quit();
}
