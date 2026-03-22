// SIG - Módulo de Entrada de Mercadoria (V56)
// Lógica de interface e integração com Go

let itensNota = [];
let fornecedores = [];
let enderecos = [];

// Inicialização
window.onload = async () => {
    try {
        // Integração com motor Go via Wails
        window.goEngine = window.parent.go || window.go;
        if (!window.goEngine) {
            console.error("Motor Wails não encontrado.");
            return;
        }

        // Carregar Fornecedores
        fornecedores = await window.goEngine.main.App.ListarFornecedores() || [];
        popularFornecedores();

        // Carregar Endereços (Para destino da mercadoria)
        // Usamos uma lista simplificada ou a árvore? Vamos pegar a lista de endereços finais.
        const arvore = await window.goEngine.main.App.ObterArvoreLogistica(1); // Empresa 1
        enderecos = achatarArvore(arvore);
        
        console.log("Módulo de Entradas carregado com sucesso.");
    } catch (e) {
        console.error("Erro ao inicializar módulo de entradas:", e);
    }
};

// Funções de Interface
function popularFornecedores() {
    const sel = document.getElementById('ent-fornecedor-id');
    sel.innerHTML = '<option value="0">SELECIONE O FORNECEDOR...</option>';
    fornecedores.forEach(f => {
        sel.innerHTML += `<option value="${f.id}">${f.razao_social.toUpperCase()} (${f.cnpj})</option>`;
    });
}

function achatarArvore(nods) {
    let lista = [];
    nods.forEach(n => {
        lista.push({id: n.id, nome: n.endereco_logistico || n.nome});
        if (n.children && n.children.length > 0) {
            lista = lista.concat(achatarArvore(n.children));
        }
    });
    return lista;
}

window.voltar = () => {
    // No SIG, "voltar" geralmente fecha a janela atual (o Wails cuida do processo)
    if (window.runtime) window.runtime.Quit();
};

window.adicionarItem = async () => {
    const busca = document.getElementById('busca-produto').value.trim();
    if (!busca) return alert("Digite o SKU ou descrição do produto.");

    try {
        // Buscar produto no backend
        // Como ainda não temos uma "BuscarProdutoUnico", vamos filtrar da lista ou usar SKU
        const produtos = await window.goEngine.main.App.ListarProdutos() || [];
        const p = produtos.find(it => it.sku.toUpperCase() === busca.toUpperCase() || it.ean === busca);

        if (!p) {
            alert("Produto não encontrado. Verifique o SKU.");
            return;
        }

        // Adicionar ao rascunho da nota
        const novoItem = {
            id: 0,
            produto_id: p.id,
            sku: p.sku,
            nome: p.descricao_tecnica,
            quantidade: 1,
            valor_unitario: p.custo || 0,
            valor_total: p.custo || 0,
            endereco_id: p.dimensoes_id || 0, // Fallback p/ endereço padrão do produto se existir
            cfop: "5102",
            cst: "000"
        };

        itensNota.push(novoItem);
        renderizarItens();
        document.getElementById('busca-produto').value = "";
        document.getElementById('busca-produto').focus();
    } catch (e) {
        console.error(e);
    }
};

// AÇÕES DE GRAVAÇÃO
window.importarXML = async () => {
    try {
        const entrada = await window.goEngine.main.App.ImportarXML();
        if (!entrada || !entrada.numero_nota) return;

        // Avisar se o fornecedor foi cadastrado agora
        console.log("XML Lido:", entrada);

        document.getElementById('ent-numero').value = entrada.numero_nota;
        document.getElementById('ent-serie').value = entrada.serie;
        document.getElementById('ent-data-emissao').value = entrada.data_emissao;
        document.getElementById('ent-obs').value = "NOTA FISCAL IMPORTADA VIA XML - AGUARDANDO CONFERÊNCIA";

        // Atualizar combo de fornecedores
        fornecedores = await window.goEngine.main.App.ListarFornecedores() || [];
        popularFornecedores();
        
        if (entrada.fornecedor_id === 0) {
            alert(`⚠️ ATENÇÃO: O fornecedor "${entrada.fornecedor_nome}" não está cadastrado no sistema.\n\nVocê precisará cadastrá-lo antes de confirmar esta nota.`);
            document.getElementById('ent-fornecedor-id').classList.add('bg-red-100', 'border-red-400', 'text-red-700');
        } else {
            document.getElementById('ent-fornecedor-id').classList.remove('bg-red-100', 'border-red-400', 'text-red-700');
            document.getElementById('ent-fornecedor-id').value = entrada.fornecedor_id;
        }

        // Mapeamento inteligente de itens
        const produtosDoBanco = await window.goEngine.main.App.ListarProdutos() || [];
        
        itensNota = entrada.itens.map(it => {
            // Tenta achar por SKU ou EAN do XML
            const p = produtosDoBanco.find(pb => 
                pb.sku.toUpperCase() === it.produto_sku.toUpperCase() || 
                (pb.ean && pb.ean === it.ncm) // Provisório
            );

            if (p) {
                return {
                    ...it,
                    produto_id: p.id,
                    sku: p.sku,
                    nome: p.descricao_tecnica,
                    endereco_id: p.dimensoes_id || 0
                };
            } else {
                return {
                    ...it,
                    produto_id: 0, // Pendente de mapeamento
                    sku: it.produto_sku,
                    nome: it.produto_nome,
                    is_new: true
                };
            }
        });

        renderizarItens();
    } catch (e) {
        alert("Erro ao importar XML: " + e);
    }
};

window.mapearProduto = async (idx) => {
    // Abrir busca de produto ou pre-cadastro
    // Por enquanto, vamos permitir que ele abra o cadastro de produto passando os dados do XML
    const it = itensNota[idx];
    if (confirm(`Produto "${it.nome}" não encontrado. Deseja cadastrar agora?`)) {
        // Integração com o componente Global ModalProduto
        if (window.abrirCadastroProduto) {
            window.abrirCadastroProduto();
            // Preencher campos básicos do XML
            setTimeout(() => {
                document.getElementById('prod-sku').value = it.sku;
                document.getElementById('prod-descricao').value = it.nome;
                // document.getElementById('prod-ncm').value = it.ncm;
            }, 500);
        }
    }
};

function renderizarItens() {
    const tbody = document.getElementById('lista-itens-entrada');
    if (itensNota.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center p-12 text-slate-400 italic">Nenhum item adicionado à nota ainda.</td></tr>';
        atualizarTotais();
        return;
    }

    tbody.innerHTML = "";
    itensNota.forEach((it, idx) => {
        const isPendente = it.produto_id === 0;
        const tr = document.createElement('tr');
        if (isPendente) tr.className = "bg-red-50/50";

        tr.innerHTML = `
            <td class="text-center font-mono text-slate-400">${idx + 1}</td>
            <td class="font-bold ${isPendente ? 'text-red-600' : 'text-blue-800'}">
                ${it.produto_sku}
                ${isPendente ? '<span class="text-[8px] block text-red-500 font-black">NÃO MAPEADO</span>' : ''}
            </td>
            <td class="uppercase flex items-center justify-between">
                <span>${it.produto_nome}</span>
                ${isPendente ? `<button onclick="window.mapearProduto(${idx})" class="sig-btn-mini bg-orange-500 text-white px-2 py-0 border-none rounded">VINCULAR</button>` : ''}
            </td>
            <td class="p-0">
                <input type="number" step="1" value="${it.quantidade}" onchange="window.updateItem(${idx}, 'quantidade', this.value)" class="w-full h-8 text-center bg-transparent border-none focus:ring-0 font-bold">
            </td>
            <td class="p-0">
                <input type="text" value="${it.valor_unitario.toFixed(2)}" onchange="window.updateItem(${idx}, 'valor_unitario', this.value)" class="w-full h-8 text-right bg-transparent border-none focus:ring-0 font-mono">
            </td>
            <td class="text-right font-bold pr-2 bg-slate-50">${(it.quantidade * it.valor_unitario).toFixed(2)}</td>
            <td class="p-0">
                <select onchange="window.updateItem(${idx}, 'endereco_id', this.value)" class="w-full h-8 bg-transparent border-none focus:ring-0 text-[10px] font-bold uppercase ${it.endereco_id == 0 ? 'text-red-600 animate-pulse' : ''}">
                    <option value="0">!!! SELECIONE DESTINO !!!</option>
                    ${enderecos.map(e => `<option value="${e.id}" ${it.endereco_id == e.id ? 'selected' : ''}>${e.nome}</option>`).join('')}
                </select>
            </td>
            <td class="text-center">
                <button onclick="window.removerItem(${idx})" class="text-red-400 hover:text-red-600"><span class="material-symbols-outlined !text-[16px]">delete</span></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    atualizarTotais();
}

window.updateItem = (idx, campo, valor) => {
    if (campo === 'quantidade') itensNota[idx].quantidade = parseFloat(valor) || 0;
    if (campo === 'valor_unitario') itensNota[idx].valor_unitario = parseFloat(valor.replace(',', '.')) || 0;
    if (campo === 'endereco_id') itensNota[idx].endereco_id = parseInt(valor) || 0;
    
    itensNota[idx].valor_total = itensNota[idx].quantidade * itensNota[idx].valor_unitario;
    renderizarItens();
};

window.removerItem = (idx) => {
    itensNota.splice(idx, 1);
    renderizarItens();
};

function atualizarTotais() {
    const totalProd = itensNota.reduce((sum, it) => sum + it.valor_total, 0);
    document.getElementById('ent-tot-prod').innerText = totalProd.toLocaleString('pt-br', {minimumFractionDigits: 2});
    document.getElementById('ent-tot-geral').innerText = totalProd.toLocaleString('pt-br', {minimumFractionDigits: 2});
}

// AÇÕES DE GRAVAÇÃO
window.salvarRascunho = async () => {
    const payload = coletarDadosNota();
    if (!payload.numero_nota) return alert("Número da nota é obrigatório.");
    
    try {
        const res = await window.goEngine.main.App.SalvarEntrada(payload);
        if (res.startsWith("OK")) {
            alert("Rascunho salvo com sucesso!");
        } else alert(res);
    } catch (e) { alert(e); }
};

window.confirmarNota = async () => {
    if (!confirm("Deseja confirmar esta nota? Isso irá gerar estoque e atualizar o custo médio dos produtos.")) return;
    
    const payload = coletarDadosNota();
    try {
        // Primeiro salva como rascunho para garantir integridade
        const resSalvar = await window.goEngine.main.App.SalvarEntrada(payload);
        if (!resSalvar.startsWith("OK")) return alert("Erro ao salvar rascunho antes de confirmar.");
        
        const id = parseInt(resSalvar.split('|')[1]);
        const resConf = await window.goEngine.main.App.ConfirmarEntrada(id);
        
        if (resConf === "OK") {
            alert("NOTA CONFIRMADA! Estoque atualizado.");
            window.voltar();
        } else alert(resConf);
    } catch (e) { alert(e); }
};

function coletarDadosNota() {
    return {
        id: 0, // Para rascunho novo
        numero_nota: document.getElementById('ent-numero').value,
        serie: document.getElementById('ent-serie').value,
        fornecedor_id: parseInt(document.getElementById('ent-fornecedor-id').value) || 0,
        data_emissao: document.getElementById('ent-data-emissao').value,
        valor_produtos: parseFloat(document.getElementById('ent-tot-prod').innerText.replace('.', '').replace(',', '.')) || 0,
        valor_total: parseFloat(document.getElementById('ent-tot-geral').innerText.replace('.', '').replace(',', '.')) || 0,
        observacao: document.getElementById('ent-obs').value,
        itens: itensNota.map(it => ({
            produto_id: it.produto_id,
            quantidade: it.quantidade,
            valor_unitario: it.valor_unitario,
            valor_total: it.valor_total,
            cfop: it.cfop,
            cst: it.cst,
            endereco_id: it.endereco_id,
            ncm: "" // Pode ser pego do produto se necessário
        }))
    };
}
