ModalProdutoHTML = `

<div id="modal-cadastro" class="sig-modal-overlay hidden" style="z-index: 9999;">

    <div class="bg-white w-[95%] h-[95%] rounded-sm shadow-2xl overflow-hidden border border-slate-400 flex flex-col">

        <div class="bg-[#f8fafc] p-2 px-4 flex justify-between items-center border-b border-slate-300">

            <div class="flex items-center gap-2">

                <span class="material-symbols-outlined text-slate-500 text-sm">edit_note</span>

                <h3 id="titulo-cadastro" class="text-slate-700 font-bold text-[11px] uppercase tracking-wider">

                    F3 - Cadastro Master de Produto</h3>

            </div>

            <button onclick="window.fecharCadastroProduto()" class="sig-btn-close !w-7 !h-7">

                <span class="material-symbols-outlined !text-base">close</span>

            </button>

        </div>



        <!-- FORMULÁRIO INJETADO DINAMICAMENTE -->

        <div id="cadastro-form-container" class="flex-1 overflow-hidden flex flex-col">

             <div class="flex-1 flex items-center justify-center bg-slate-50">

                <div class="sig-spinner"></div>

             </div>

        </div>



        <footer class="h-[46px] bg-[#e2e8f0] border-t border-[#cbd5e1] flex items-center justify-end px-4 gap-3">

            <button onclick="window.fecharCadastroProduto()" class="sig-btn sig-btn-neutral">

                <span class="material-symbols-outlined !text-[16px]">undo</span> Cancelar

            </button>

            <button id="btn-gravar-produto" onclick="window.salvarProduto()" class="sig-btn sig-btn-primary px-8">

                <span class="material-symbols-outlined !text-[18px]">save</span> Gravar (F5)

            </button>

        </footer>

    </div>

</div>

`;



window.FragmentoCadastroHTML = "";

async function carregarFragmentoCadastro() {

    if (window.FragmentoCadastroHTML) return window.FragmentoCadastroHTML;

    try {

        const response = await fetch('../../componentes/cadastro_form_fragmento.html');

        if (!response.ok) throw new Error("Erro ao carregar fragmento.");

        window.FragmentoCadastroHTML = await response.text();

        return window.FragmentoCadastroHTML;

    } catch (e) {

        console.error("❌ SIG: Erro ao carregar fragmento:", e);

        return `<div class="p-8 text-center text-red-600 font-bold uppercase">Erro ao carregar formulário.</div>`;

    }

}



const ModalBuscaCatalogoHTML = `

<div id="modal-busca-catalogo" class="sig-modal-overlay hidden" style="z-index: 10000;">

    <div class="bg-white w-[500px] rounded-sm shadow-2xl overflow-hidden border border-slate-400 flex flex-col">

        <div class="bg-[#f8fafc] p-2 px-4 flex justify-between items-center border-b border-slate-300">

            <div class="flex items-center gap-2">

                <span class="material-symbols-outlined text-slate-500 text-sm">cloud_sync</span>

                <h3 class="text-slate-700 font-bold text-[11px] uppercase tracking-wider">Buscar no Catálogo Online</h3>

            </div>

            <button onclick="window.fecharBuscaCatalogo()" class="sig-btn-close !w-7 !h-7">

                <span class="material-symbols-outlined !text-base">close</span>

            </button>

        </div>

        <div class="p-4 flex flex-col gap-3">

            <div class="flex gap-2">

                <input type="text" id="input-busca-catalogo" class="sig-input-dense flex-1 uppercase !h-8 !text-sm font-bold" placeholder="Digite o código (ex: SYL1043)" onkeydown="if(event.key==='Enter') window.buscarCatalogo()">

                <button onclick="window.buscarCatalogo()" class="sig-btn sig-btn-primary !h-8 px-4"><span class="material-symbols-outlined !text-[18px]">search</span></button>

            </div>

            

            <div id="loading-catalogo" class="hidden flex-col items-center justify-center py-6">

                <div class="sig-spinner"></div>

                <span class="sig-text-mini mt-2">Consultando bases na API...</span>

            </div>



            <div id="resultado-catalogo" class="hidden flex-col gap-0 mt-2 border border-slate-300 rounded-sm overflow-hidden bg-white shadow-sm">

                <div class="bg-slate-100 border-b border-slate-300 flex items-center px-2 gap-1 h-8">

                    <button onclick="window.mudarAbaCatalogo('principal')" id="tab-cat-principal" class="h-full px-3 text-[10px] font-bold uppercase border-b-2 border-blue-600 text-blue-700 bg-white">Geral</button>

                    <button onclick="window.mudarAbaCatalogo('aplicacoes')" id="tab-cat-aplicacoes" class="h-full px-3 text-[10px] font-bold uppercase border-b-2 border-transparent text-slate-500 hover:bg-slate-50">Aplicações</button>

                    <button onclick="window.mudarAbaCatalogo('similares')" id="tab-cat-similares" class="h-full px-3 text-[10px] font-bold uppercase border-b-2 border-transparent text-slate-500 hover:bg-slate-50">Similares</button>

                </div>

                <div class="p-3 min-h-[160px] max-h-[300px] overflow-y-auto custom-scrollbar">

                    <div id="cat-pane-principal" class="flex flex-col gap-3"></div>

                    <div id="cat-pane-aplicacoes" class="hidden"><table class="sig-table sig-table-sm w-full"><thead class="sticky top-0 z-10 shadow-sm bg-slate-50"><tr><th>Marca</th><th>Modelo</th><th>Motor</th><th class="w-14">Ini</th><th class="w-14">Fim</th></tr></thead><tbody id="tb-cat-aplicacoes"></tbody></table></div>

                    <div id="cat-pane-similares" class="hidden"><table class="sig-table sig-table-sm w-full"><thead class="sticky top-0 z-10 shadow-sm bg-slate-50"><tr><th>Fabricante</th><th>Código</th></tr></thead><tbody id="tb-cat-similares"></tbody></table></div>

                </div>

            </div>



            <div id="erro-catalogo" class="hidden p-4 bg-red-50 border border-red-200 rounded-sm flex items-center gap-3">

                <span class="material-symbols-outlined text-red-500">error</span>

                <span id="erro-catalogo-msg" class="text-red-700 text-[10px] font-bold uppercase">Produto não localizado.</span>

            </div>

        </div>

        <div class="h-[46px] bg-[#e2e8f0] border-t border-[#cbd5e1] flex items-center justify-end px-4 gap-3">

             <button onclick="window.fecharBuscaCatalogo()" class="sig-btn sig-btn-neutral">CANCELAR</button>

             <button id="btn-importar-catalogo" onclick="window.importarDadosCatalogo()" class="hidden sig-btn sig-btn-success"><span class="material-symbols-outlined !text-[18px]">download</span> IMPORTAR</button>

        </div>

    </div>

</div>

`;





// MÓDULO APLICAÇÃO VEÍCULOS (MODAL SEPARADO)

const ModalAddAplicacaoHTML = `

<div id="modal-add-aplicacao" class="sig-modal-overlay hidden" style="z-index: 10001;">

    <div class="bg-white w-[420px] rounded-sm shadow-2xl overflow-hidden border border-slate-400 flex flex-col">

        <div class="bg-[#f8fafc] p-2 px-4 flex justify-between items-center border-b border-slate-300">

            <div class="flex items-center gap-2"><span class="material-symbols-outlined text-slate-500 text-sm">directions_car</span><h3 class="text-slate-700 font-bold text-[11px] uppercase tracking-wider">Assistente de Aplicação</h3></div>

            <button onclick="window.fecharModalAddAplicacao()" class="sig-btn-close !w-7 !h-7"><span class="material-symbols-outlined !text-base">close</span></button>

        </div>

        <div class="p-4 flex flex-col gap-3 bg-white">

            <select id="app-veiculo-marca" class="sig-input-dense w-full font-bold" onchange="window.carregarModelosVeiculo()"><option>MARCA...</option></select>

            <select id="app-veiculo-modelo" class="sig-input-dense w-full font-bold" disabled onchange="window.autoSepararVersao()"><option>MODELO...</option></select>

            <input type="text" id="app-veiculo-motor" class="sig-input-dense w-full uppercase" placeholder="VERSÃO / MOTOR">

            <div class="flex gap-2">

                <input type="number" id="app-veiculo-inicio" class="sig-input-dense flex-1 text-center" placeholder="INI" onchange="window.validarInputAno(this)">

                <input type="number" id="app-veiculo-fim" class="sig-input-dense flex-1 text-center" placeholder="FIM" onchange="window.validarInputAno(this)">

            </div>

        </div>

        <footer class="h-[46px] bg-[#e2e8f0] border-t border-[#cbd5e1] flex items-center justify-end px-4 gap-3">

            <button onclick="window.fecharModalAddAplicacao()" class="sig-btn sig-btn-neutral">CANCELAR</button>

            <button onclick="window.confirmarAddAplicacao()" class="sig-btn sig-btn-primary">ADICIONAR</button>

        </footer>

    </div>

</div>

`;



// MÓDULO REFERÊNCIAS SIMILARES (MODAL SEPARADO)

const ModalAddSimilarHTML = `

<div id="modal-add-similar" class="sig-modal-overlay hidden" style="z-index: 10001;">

    <div class="bg-white w-[350px] rounded-sm shadow-2xl overflow-hidden border border-slate-400 flex flex-col">

        <div class="bg-[#f8fafc] p-2 px-4 flex justify-between items-center border-b border-slate-300">

            <div class="flex items-center gap-2"><span class="material-symbols-outlined text-slate-500 text-sm">link</span><h3 class="text-slate-700 font-bold text-[11px] uppercase tracking-wider">Adicionar Referência Similar</h3></div>

            <button onclick="window.fecharModalAddSimilar()" class="sig-btn-close !w-7 !h-7"><span class="material-symbols-outlined !text-base">close</span></button>

        </div>

        <div class="p-4 flex flex-col gap-3 bg-white">

            <input type="text" id="add-sim-marca" class="sig-input-dense w-full uppercase" placeholder="MARCA...">

            <input type="text" id="add-sim-codigo" class="sig-input-dense w-full uppercase" placeholder="CÓDIGO (REF)...">

        </div>

        <footer class="h-[46px] bg-[#e2e8f0] border-t border-[#cbd5e1] flex items-center justify-end px-4 gap-3">

            <button onclick="window.fecharModalAddSimilar()" class="sig-btn sig-btn-neutral">CANCELAR</button>

            <button onclick="window.confirmarAddSimilar()" class="sig-btn sig-btn-primary">ADICIONAR</button>

        </footer>

    </div>

</div>

`;



// MÓDULO RESUMO FISCAL (MODAL INFORMATIVO)

const ModalResumoFiscalHTML = `

<div id="modal-resumo-fiscal" class="sig-modal-overlay hidden" style="z-index: 10002;">

    <div class="bg-white w-[500px] rounded-sm shadow-2xl overflow-hidden border border-slate-400 flex flex-col">

        <div class="bg-slate-800 p-2 px-4 flex justify-between items-center border-b border-slate-700">

            <div class="flex items-center gap-2"><span class="material-symbols-outlined text-blue-400 text-sm">receipt_long</span><h3 class="text-white font-bold text-[11px] uppercase tracking-wider">Detalhamento do Perfil Fiscal</h3></div>

            <button onclick="window.fecharResumoFiscal()" class="sig-btn-close !text-slate-400 hover:!text-white !w-7 !h-7"><span class="material-symbols-outlined !text-base">close</span></button>

        </div>

        <div id="conteudo-resumo-fiscal" class="flex flex-col gap-3 bg-slate-50 overflow-y-auto w-full custom-scrollbar" style="max-height: 80vh; padding: 1rem;">

             <!-- Injetado dinamicamente -->

        </div>

        <footer class="h-[46px] bg-[#e2e8f0] border-t border-[#cbd5e1] flex items-center justify-end px-4 gap-3 shrink-0">

            <button onclick="window.fecharResumoFiscal()" class="sig-btn sig-btn-neutral font-bold rounded-sm">FECHAR</button>

        </footer>

    </div>

</div>

`;



// ==========================================

// LÓGICA DO COMPONENTE

// ==========================================



window.initFormularioProduto = async function () {

    try {

        window.goEngine = window.parent.go || window.go;

        if (!window.goEngine) return;

        window.currentMarcas = await window.goEngine.main.App.ListarMarcas();

        window.currentCategorias = await window.goEngine.main.App.ListarCategorias();

        window.currentSubcategorias = await window.goEngine.main.App.ListarSubcategorias();



        const selMarca = document.getElementById('prod-marca-id');

        if (selMarca) {

            selMarca.innerHTML = '<option value="0">SELECIONE...</option>';

            window.currentMarcas.forEach(m => selMarca.innerHTML += `<option value="${m.id}">${m.nome}</option>`);

        }

        const selCat = document.getElementById('prod-categoria-id');

        if (selCat) {

            selCat.innerHTML = '<option value="">SELECIONE...</option>';

            window.currentCategorias.forEach(c => selCat.innerHTML += `<option value="${c.id}">${c.nome}</option>`);

        }

        

        // Unidades de Medida

        const selUnid = document.getElementById('prod-unidade-id');

        if (selUnid) {

            const units = await window.goEngine.main.App.ListarUnidadesMedida();

            selUnid.innerHTML = '<option value="">SELECIONE...</option>' + 

                                units.map(u => `<option value="${u.id}">${u.sigla} - ${u.descricao}</option>`).join('');

        }



        // Perfis Fiscais (V55)

        const selPerfil = document.getElementById('prod-perfil-fiscal-id');

        if (selPerfil) {

            const perfis = await window.goEngine.main.App.ListarPerfisFiscais();

            window.currentPerfisFiscais = perfis;

            selPerfil.innerHTML = '<option value="">SELECIONE O GRUPO FISCAL...</option>' + 

                                  perfis.map(pf => `<option value="${pf.id}">${pf.nome.toUpperCase()}</option>`).join('');

        }

    } catch (e) { console.error("Erro initForm: ", e); }

};



window.onCategoriaChange = function() {

    window.popularSelectSubcategorias();

};



window.popularSelectSubcategorias = function () {

    const catId = parseInt(document.getElementById('prod-categoria-id').value);

    const selSub = document.getElementById('prod-subcategoria-id');

    selSub.innerHTML = '<option value="0">SELECIONE...</option>';

    if (!catId) return;

    const filtradas = window.currentSubcategorias.filter(s => s.categoria_id === catId);

    filtradas.forEach(s => selSub.innerHTML += `<option value="${s.id}">${s.nome}</option>`);

};



window.atualizarDescricaoPadrao = function() {

    // DESATIVADA: A descrição não é mais montada dinamicamente via outros campos

};



window.toggleAtivoProduto = function(forcar) {

    const input = document.getElementById('prod-ativo');

    if(!input) return;

    input.value = forcar ? "true" : "false";

    input.dispatchEvent(new Event('change'));

}



window.abrirCadastroProduto = async function (isEdit = false, p = null, isReadOnly = false) {

    console.log("🚀 Abrindo Cadastro de Produto (isEdit=" + isEdit + ")");

    const modal = document.getElementById('modal-cadastro');

    if (!modal) {

        console.error("❌ CRÍTICO: Modal #modal-cadastro não encontrado!");

        return;

    }



    try {

        document.body.style.cursor = 'wait'; // Feedback Visual de Carregamento

        window.isEditModeGlobal = isEdit;

        window.isProdutoReadOnlyGlobal = isReadOnly;

        window.goEngine = window.parent.go || window.go; // Refresh para garantir acesso

        

        // Blocos Opcionais em Modo Novo (Opacos)

        const paineisExtras = [

            document.getElementById('painel-custos-bloco'),

            document.getElementById('painel-historico-bloco'),

            document.getElementById('painel-inventario-bloco')

        ];

        paineisExtras.forEach(el => {

            if (!el) return;

            if (isEdit) {

                el.classList.remove('opacity-40', 'pointer-events-none');

            } else {

                el.classList.add('opacity-40', 'pointer-events-none');

            }

        });



        // Reset Total de campos não protegidos e Bordas

        document.querySelectorAll('#modal-cadastro input').forEach(i => {

            if (!i.readOnly && !i.id.includes('mkp-')) i.value = "";

            i.classList.remove('!border-red-500', '!ring-red-400', 'bg-red-50');

        });

        document.querySelectorAll('#modal-cadastro select').forEach(s => {

            s.selectedIndex = 0;

            s.classList.remove('!border-red-500');

        });

        

        // Limpa wrappers visuais

        const wDesc = document.getElementById('wrapper-prod-descricao');

        if (wDesc) wDesc.classList.remove('!border-red-500');

        const cApp = document.getElementById('container-app-cadastro');

        if (cApp) cApp.classList.remove('!border-red-500');

        

        // Esvazia as listas e carrossel

        const tbApp = document.getElementById('tb-aplicacoes');

        if (tbApp) tbApp.innerHTML = '<tr class="bg-white"><td colspan="6" class="text-center text-slate-400 py-6 text-[10px] italic border-none">Nenhuma aplicação técnica registrada.</td></tr>';

        

        const tbSim = document.getElementById('tb-similares');

        if (tbSim) tbSim.innerHTML = '<tr class="bg-white"><td colspan="3" class="text-center text-slate-400 py-6 text-[9px] italic border-none">Nenhuma referência</td></tr>';

        

        window.produtoImagensLocal = [];

        if(window.atualizarCarrosselVisual) window.atualizarCarrosselVisual();



        const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };

        setVal('prod-id', "NOVO");

        if(window.toggleAtivoProduto) window.toggleAtivoProduto(true);

        setVal('prod-custo', "0,00");

        setVal('prod-venda', "0,00");

        setVal('prod-mkp-balcao', "100");

        setVal('prod-mkp-externo', "100");

        setVal('prod-mkp-oficina', "100");

        setVal('prod-fator-conversao', "1.0000");

        setVal('prod-peso', "0.000");

        setVal('prod-altura', "0.00");

        setVal('prod-largura', "0.00");

        setVal('prod-comprimento', "0.00");

        

        if (isEdit && p) {

            setVal('prod-id', p.id);

            if(window.toggleAtivoProduto) window.toggleAtivoProduto(p.ativo !== false);

            setVal('prod-sku', p.sku);

            setVal('prod-descricao', p.descricao_tecnica);

            setVal('prod-nome-popular', p.nome_popular || "");

            setVal('prod-marca-id', p.marca_id);

            setVal('prod-categoria-id', p.categoria_id);

            setVal('prod-codigo-barra', p.ean || "");

            setVal('prod-localizacao', p.localizacao || "");



            if (window.onCategoriaChange) window.onCategoriaChange();

            setTimeout(() => { 

                const selSub = document.getElementById('prod-subcategoria-id');

                if (selSub) selSub.value = p.subcategoria_id;

            }, 300);



            setVal('prod-custo', p.custo.toLocaleString('pt-BR', {minimumFractionDigits: 2}));

            setVal('prod-venda', p.venda.toLocaleString('pt-BR', {minimumFractionDigits: 2}));

            

            setVal('prod-unidade-id', p.unidade_id || 0);

            setVal('prod-fator-conversao', p.fator_conversao || "1.0000");

            setVal('prod-peso', p.peso || "0.000");

            setVal('prod-altura', p.altura || "0.00");

            setVal('prod-largura', p.largura || "0.00");

            setVal('prod-comprimento', p.comprimento || "0.00");



            setVal('prod-ncm', p.ncm || "");

            setVal('prod-cest', p.cest || "");

            setVal('prod-origem', p.origem || 0);

            setVal('prod-perfil-fiscal-id', p.perfil_fiscal_id || 0);

            

            const setCheck = (id, val) => { const el = document.getElementById(id); if(el) el.checked = val; };

            setCheck('prod-tem-icms', p.tem_icms === undefined ? true : p.tem_icms);

            setCheck('prod-tem-st', p.tem_st === undefined ? false : p.tem_st);

            setCheck('prod-tem-ipi', p.tem_ipi === undefined ? false : p.tem_ipi);

            setCheck('prod-tem-pis-cofins', p.tem_pis_cofins === undefined ? true : p.tem_pis_cofins);



            // Carregar relacionais dinâmicos com Promise ALL (Espera carregar antes de abrir modal)

            if (window.goEngine && window.goEngine.main && window.goEngine.main.App) {

                // 1. Imagens

                const promImagens = window.goEngine.main.App.ObterPrimeiraImagemB64(p.id).then(img => {

                      if(img) { 

                          window.produtoImagensLocal = [img]; 

                      } else {

                          window.produtoImagensLocal = [];

                      }

                      if(window.atualizarCarrosselVisual) window.atualizarCarrosselVisual(); 

                  }).catch(e => { console.warn("Aviso ao carregar imagem principal:", e); });



                // 2. Aplicações

                const promApps = window.goEngine.main.App.ListarAplicacoesDoProduto(p.id).then(apps => {

                    apps = apps || [];

                    const tbApp = document.getElementById('tb-aplicacoes');

                    if(tbApp) {

                        tbApp.innerHTML = '';

                        if(apps.length === 0) {

                            tbApp.innerHTML = '<tr class="bg-white"><td colspan="6" class="text-center text-slate-400 py-6 text-[10px] italic border-none">Nenhuma aplicação técnica registrada.</td></tr>';

                        } else {

                            apps.forEach(a => {

                                const tr = document.createElement('tr');

                                tr.className = "bg-white border-b border-slate-100";

                                tr.innerHTML = `<td class="text-[10px] px-2 py-1">${a.marca || '-'}</td><td class="text-xs px-2 py-1 font-bold text-slate-700">${a.modelo || '-'}</td><td class="text-[10px] px-2 py-1">${a.motor || ''}</td><td class="text-xs text-center">${a.ano_inicio || ''}</td><td class="text-xs text-center">${a.ano_fim || ''}</td><td class="text-center px-1"><button onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600 border-none bg-transparent"><span class="material-symbols-outlined text-[16px]">close</span></button></td>`;

                                tbApp.appendChild(tr);

                            });

                        }

                        if (isReadOnly) {

                             tbApp.querySelectorAll('button').forEach(btn => { btn.style.pointerEvents = 'none'; btn.style.opacity = '0.3'; });

                        }

                    }

                }).catch(e => {});



                // 3. Similares / Conversões

                const promConvs = window.goEngine.main.App.ListarConversoesDoProduto(p.id).then(convs => {

                    convs = convs || [];

                    const tbSim = document.getElementById('tb-similares');

                    if(tbSim) {

                        tbSim.innerHTML = '';

                        if(convs.length === 0) {

                            tbSim.innerHTML = '<tr class="bg-white"><td colspan="3" class="text-center text-slate-400 py-6 text-[9px] italic border-none">Nenhuma referência</td></tr>';

                        } else {

                            convs.forEach(c => {

                                 const tr = document.createElement('tr');

                                 tr.className = "bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors";

                                 tr.innerHTML = `<td class="p-0 border-r border-slate-100 h-5"><input type="text" class="w-full h-full bg-transparent text-[10px] uppercase text-slate-700 font-bold px-2 py-0 border-none outline-none placeholder-slate-300 focus:bg-blue-50" value="${c.marca || ''}" placeholder="MARCA..."></td><td class="p-0 border-r border-slate-100 h-5"><input type="text" class="w-full h-full bg-transparent text-[11px] uppercase font-mono text-blue-700 font-bold px-2 py-0 border-none outline-none placeholder-slate-300 focus:bg-blue-50" value="${c.codigo || ''}" placeholder="CÓDIGO (REF)..."></td><td class="p-0 h-5 text-center"><button tabindex="-1" onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600 bg-transparent border-none flex items-center justify-center w-full h-full"><span class="material-symbols-outlined text-[14px]">close</span></button></td>`;

                                 tbSim.appendChild(tr);

                            });

                        }

                        if (isReadOnly) {

                             tbSim.querySelectorAll('input').forEach(el => el.disabled = true);

                             tbSim.querySelectorAll('button').forEach(btn => { btn.style.pointerEvents = 'none'; btn.style.opacity = '0.3'; });

                        }

                    }

                }).catch(e => {});



                // 4. Histórico de Movimentação

                const promHistorico = window.goEngine.main.App.ListarMovimentacoesProduto(p.id).then(movs => {

                    movs = movs || [];

                    const tbMov = document.getElementById('tb-movimentacao');

                    if(tbMov) {

                        tbMov.innerHTML = '';

                        if(movs.length === 0) {

                            tbMov.innerHTML = '<tr class="bg-white"><td colspan="6" class="text-center text-slate-400 py-6 text-[10px] italic border-none">Produto novo ou sem movimentações.</td></tr>';

                        } else {

                            movs.forEach(m => {

                                const tr = document.createElement('tr');

                                tr.className = "bg-white border-b border-slate-100/50 hover:bg-slate-50 transition-colors";

                                

                                let tipoVisual = `<span class="px-1.5 py-0.5 rounded-[3px] text-[9px] font-black bg-slate-100 text-slate-600">${m.tipo}</span>`;

                                if(m.tipo === 'ENTRADA') tipoVisual = `<span class="px-1.5 py-0.5 rounded-[3px] text-[9px] font-black bg-green-100 text-green-700">ENTRADA</span>`;

                                else if(m.tipo === 'VENDA' || m.tipo === 'SAIDA') tipoVisual = `<span class="px-1.5 py-0.5 rounded-[3px] text-[9px] font-black bg-blue-100 text-blue-700">${m.tipo}</span>`;

                                else if(m.tipo === 'AJUSTE MANUAL' || m.tipo.includes('AJUSTE')) tipoVisual = `<span class="px-1.5 py-0.5 rounded-[3px] text-[9px] font-black bg-orange-100 text-orange-700">${m.tipo}</span>`;



                                let qtdeStr = (m.quantidade > 0 ? "+" : "") + m.quantidade.toString().replace('.', ',');

                                let qtdeColor = m.quantidade > 0 ? "text-green-600" : (m.quantidade < 0 ? "text-red-500" : "text-slate-500");



                                tr.innerHTML = `

                                    <td class="text-center text-[10px] font-mono text-slate-500 py-1 px-1 tracking-tighter">${m.data_hora}</td>

                                    <td class="text-center px-1">${tipoVisual}</td>

                                    <td class="text-left text-[10px] font-bold text-slate-700 px-2 truncate" title="${m.descricao}">${m.descricao}</td>

                                    <td class="text-right font-mono text-[11px] font-black ${qtdeColor} px-2">${qtdeStr}</td>

                                    <td class="text-right font-mono text-[11px] font-black text-slate-800 px-2">${m.saldo_momento.toString().replace('.', ',')}</td>

                                    <td class="text-left text-[9px] font-bold text-slate-500 px-2 truncate uppercase">${m.usuario || 'SISTEMA'}</td>

                                `;

                                tbMov.appendChild(tr);

                            });

                        }

                    }

                }).catch(e => { console.warn("Erro ao carregar histórico: ", e); });



                // AGUARDA TODAS AS ROTINAS FINALIZAREM 100% PARA PODER ABRIR O MODAL

                await Promise.allSettled([promImagens, promApps, promConvs, promHistorico]);

            }

        } else {

            setVal('prod-id', "...."); // Indicador de carregamento

            if (window.goEngine && window.goEngine.main && window.goEngine.main.App) {

                try {

                    const prox = await window.goEngine.main.App.ObterProximoIdProduto();

                    setVal('prod-id', String(prox).padStart(4, '0'));

                } catch(e) { 

                    console.warn("Erro ao buscar próximo ID:", e); 

                    setVal('prod-id', "ERRO");

                }

            }

        }



        const formC = document.getElementById('cadastro-form-container');

        const btnF5 = document.querySelector('button[onclick="window.salvarProduto()"]');

        

        // Aplicação Rigorosa do Modo Visualização

        if (isReadOnly) {

            document.getElementById('titulo-cadastro').innerText = "F3 - CONSULTA PRODUTO (SOMENTE LEITURA)";

            if (formC) {

               formC.classList.add('select-none');

               // Bloquear todos elementos nativos

               formC.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);

               // Matar botões internos (como Add Imagem, Buscas) preservando apenas fechar

               formC.querySelectorAll('button').forEach(el => { el.style.pointerEvents = 'none'; el.style.opacity = '0.3'; });

            }

            if(btnF5) btnF5.classList.add('hidden');

        } else {

            document.getElementById('titulo-cadastro').innerText = isEdit ? "F3 - EDITAR PRODUTO" : "F3 - NOVO PRODUTO";

            if (formC) {

               formC.classList.remove('select-none');

               formC.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);

               formC.querySelectorAll('button').forEach(el => { el.style.pointerEvents = 'auto'; el.style.opacity = '1'; });

            }

            if(btnF5) btnF5.classList.remove('hidden');

        }



        const inv = document.getElementById('painel-inventario-bloco');

        if (inv) inv.classList.remove('hidden');



        // Exibir Modal (independente de erros de rede nos selects)

        modal.classList.remove('hidden');

        modal.classList.add('flex');

        

        setTimeout(() => { 

            const inputSku = document.getElementById('prod-sku');

            if(inputSku) inputSku.focus(); 

        }, 150);



    } catch (err) {

        console.error("🔥 Erro ao abrir cadastro:", err);

        alert("Erro ao abrir formulário de cadastro. Verifique o console ou a conexão.");

    } finally {

        document.body.style.cursor = 'default';

    }

};



window.fecharCadastroProduto = function () {

    document.getElementById('modal-cadastro').classList.add('hidden');

    document.getElementById('modal-cadastro').classList.remove('flex');

};



window.salvarProduto = async function () {

    if (window.isProdutoReadOnlyGlobal) {

        console.warn("Bloqueado salvamento em modo Somente Leitura!");

        return;

    }

    const moneyToFloat = (v) => parseFloat(v.replace('.', '').replace(',', '.')) || 0;

    const payload = {

        id: window.isEditModeGlobal ? parseInt(document.getElementById('prod-id')?.value) || 0 : 0,

        ativo: document.getElementById('prod-ativo')?.value === "true",

        sku: document.getElementById('prod-sku')?.value.trim().toUpperCase() || "",

        ean: document.getElementById('prod-codigo-barra')?.value.trim() || "",

        descricao_tecnica: document.getElementById('prod-descricao')?.value.trim().toUpperCase() || "",

        nome_popular: document.getElementById('prod-nome-popular')?.value.trim().toUpperCase() || "",

        marca_id: parseInt(document.getElementById('prod-marca-id')?.value) || 0,

        categoria_id: parseInt(document.getElementById('prod-categoria-id')?.value) || 0,

        subcategoria_id: parseInt(document.getElementById('prod-subcategoria-id')?.value) || 0,

        custo: moneyToFloat(document.getElementById('prod-custo')?.value || "0"),

        venda: moneyToFloat(document.getElementById('prod-venda')?.value || "0"),

        localizacao: document.getElementById('prod-localizacao')?.value.trim().toUpperCase() || "",

        unidade_id: parseInt(document.getElementById('prod-unidade-id')?.value) || 0,

        fator_conversao: parseFloat(document.getElementById('prod-fator-conversao')?.value) || 1,

        peso: parseFloat(document.getElementById('prod-peso')?.value) || 0,

        altura: parseFloat(document.getElementById('prod-altura')?.value) || 0,

        largura: parseFloat(document.getElementById('prod-largura')?.value) || 0,

        comprimento: parseFloat(document.getElementById('prod-comprimento')?.value) || 0,



        // Campos Fiscais (V55 - Base Cadastral e Perfil)

        ncm: document.getElementById('prod-ncm')?.value.trim() || "",

        cest: document.getElementById('prod-cest')?.value.trim() || "",

        origem: parseInt(document.getElementById('prod-origem')?.value) || 0,

        perfil_fiscal_id: parseInt(document.getElementById('prod-perfil-fiscal-id')?.value) || 0,

        tem_icms: document.getElementById('prod-tem-icms')?.checked || false,

        tem_st: document.getElementById('prod-tem-st')?.checked || false,

        tem_ipi: document.getElementById('prod-tem-ipi')?.checked || false,

        tem_pis_cofins: document.getElementById('prod-tem-pis-cofins')?.checked || false,



        // Legados (Esvaziados na nova estrutura de pré-cadastro)

        cfop: "",

        cst_csosn: "",

        aliquota_icms: 0,

        aliquota_ipi: 0,

        aliquota_pis: 0,

        aliquota_cofins: 0,

        reducao_bc: 0

    };



    // Coletar Aplicações

    payload.aplicacoes = [];

    document.querySelectorAll('#tb-aplicacoes tr:not(:has(td[colspan]))').forEach(tr => {

        const tds = tr.querySelectorAll('td');

        if (tds.length >= 5) {

            payload.aplicacoes.push({

                marca: tds[0].innerText.trim(),

                modelo: tds[1].innerText.trim(),

                motor: tds[2].innerText.trim(),

                ano_inicio: tds[3].innerText.trim(),

                ano_fim: tds[4].innerText.trim()

            });

        }

    });



    // Coletar Similares/Conversões

    payload.conversoes = [];

    document.querySelectorAll('#tb-similares tr:not(:has(td[colspan]))').forEach(tr => {

        const inputs = tr.querySelectorAll('input');

        if (inputs.length >= 2) {

            const marca = inputs[0].value.trim().toUpperCase();

            const cod = inputs[1].value.trim().toUpperCase();

            if (marca || cod) {

                payload.conversoes.push({ marca: marca, codigo: cod });

            }

        }

    });



    // Validação de Campos Obrigatórios (Apenas borda vermelha)

    const requiridos = [

        'prod-sku', 'prod-marca-id', 'prod-categoria-id', 'prod-subcategoria-id',

        'prod-descricao', 'prod-posicao', 'prod-lado', 'prod-unidade-id',

        'prod-ncm', 'prod-origem', 'prod-perfil-fiscal-id'

    ];

    

    let temErro = false;

    requiridos.forEach(id => {

        const el = document.getElementById(id);

        if (!el) return;

        

        let visualEl = el;

        if (id === 'prod-descricao') {

            const wrapper = document.getElementById('wrapper-prod-descricao');

            if (wrapper) visualEl = wrapper;

        }

        

        el.removeEventListener('input', el._clearErrorFunc);

        el.removeEventListener('change', el._clearErrorFunc);



        const v = el.value.trim();

        let isInvalid = false;



        // Regra Geral: Vazio sempre inválido

        if (!v || v === 'SELECIONE A CATEGORIA ANTES...') {

            isInvalid = true;

        } 

        // Regra para IDs (Marca, Categoria, Subcat, Perfil, Unidade): '0' é inválido

        else if (['prod-marca-id', 'prod-categoria-id', 'prod-subcategoria-id', 'prod-perfil-fiscal-id', 'prod-unidade-id'].includes(id) && (v === '0' || v === '0,00' || v === '')) {

            isInvalid = true;

        }

        // Regra para Strings/Outros: '0' é permitido (ex: Origem, SKU etc)

        

        if (isInvalid) {

            visualEl.classList.add('!border-red-500');

            temErro = true;

            el._clearErrorFunc = () => visualEl.classList.remove('!border-red-500');

            el.addEventListener('input', el._clearErrorFunc);

            el.addEventListener('change', el._clearErrorFunc);

        } else {

            visualEl.classList.remove('!border-red-500');

        }

    });



    // Validação de Aplicação (Mínimo 1)

    const containerApp = document.getElementById('container-app-cadastro');

    if (containerApp) {

        if (payload.aplicacoes.length === 0) {

            containerApp.classList.add('!border-red-500');

            temErro = true;

            const clearAppError = () => containerApp.classList.remove('!border-red-500');

            // Só some quando adicionar alguma, ou tentar adicionar

            document.getElementById('tb-aplicacoes').addEventListener('DOMSubtreeModified', clearAppError, {once:true});

        } else {

            containerApp.classList.remove('!border-red-500');

        }

    }



    if (temErro) return;



    try {

        const res = await window.goEngine.main.App.SalvarProduto(payload);

        if (res.startsWith("ID:")) {

            const newId = parseInt(res.substring(3));

            

            // Gravar Imagens

            if (window.produtoImagensLocal && window.produtoImagensLocal.length > 0) {

                await window.goEngine.main.App.SalvarImagensProduto(newId, window.produtoImagensLocal);

            }

            

            window.fecharCadastroProduto();

            window.dispatchEvent(new CustomEvent('produtoSalvo'));

            

            // Reseta o formulário inteiro (Zero)

            window.abrirCadastroProduto(false, null);

            window.produtoImagensLocal = [];

            window.atualizarCarrosselVisual();

        } else {

            alert(res);

        }

    } catch (e) { alert("Erro: " + e); }

};



window.buscarCatalogo = async function() {

    const input = document.getElementById('input-busca-catalogo');

    const sku = input.value.trim();

    if (sku.length < 3) return;



    document.getElementById('loading-catalogo').classList.remove('hidden');

    document.getElementById('resultado-catalogo').classList.add('hidden');

    document.getElementById('erro-catalogo').classList.add('hidden');



    try {

        console.log("🛠️ SIG: Consultando API DPK em http://127.0.0.1:9010/api/produto...");

        const response = await fetch(`http://127.0.0.1:9010/api/produto?codigo=${sku}`);

        if (!response.ok) throw new Error("Produto não encontrado no catálogo online.");

        const rawData = await response.json();

        const p = rawData.produto || {};

        const det = rawData.detalhe || {};

        

        // Normalização DEFINITIVA (JSON DPK REAL): Mapeia a estrutura exata fornecida

        const data = {

            descricao: p.description || det.product?.description || 'NOME INDISPONÍVEL',

            fabricante: p.manufacturer || det.product?.manufacturer || '-',

            codigo: p.code || det.product?.code || '-',

            ean: det.technicalInformation?.eanCode || '',

            imagem: rawData.imagem || (p.image ? `https://cdn-superk.azureedge.net/img/${p.image}` : ''),



            // Busca aplicações (Array: det.application)

            aplicacoes: (det.application || []).map(a => {

                const partes = a.application.split(' ');

                const marca = partes[0] || '-';

                let resto = partes.slice(1).join(' ');

                

                let motor = '';

                const patterns = [/ \d\.\d/, / \d{1,2}V/i, / TURBO/i, / TB /i, / TB$/i, / AUT\./i, / AT /i, / CVT/i, / FLEX/i, / DIESEL/i];

                let idx = -1;

                patterns.forEach(p => { const m = resto.match(p); if(m && (idx === -1 || m.index < idx)) idx = m.index; });

                

                if(idx !== -1) {

                    motor = resto.substring(idx).trim().toUpperCase();

                    resto = resto.substring(0, idx).trim();

                }



                return {

                    marca: marca,

                    modelo: resto,

                    motorVersao: motor,

                    inicio: a.startDate ? a.startDate.substring(0, 4) : '',

                    fim: a.endDate ? a.endDate.substring(0, 4) : ''

                };

            }),



            // Dados Técnicos e Dimensões

            ncm: det.technicalInformation?.ncmCode || '',

            peso: det.technicalInformation?.productWeight || 0,

            altura: det.technicalInformation?.height || 0,

            largura: det.technicalInformation?.width || 0,

            comprimento: det.technicalInformation?.length || 0,



            // Busca similares (Array: det.equivalent)

            equivalentes: (det.equivalent || []).map(e => ({

                fabricante: e.equivalentProductDetail?.product?.manufacturer || '-',

                codigo: e.equivalentProductDetail?.product?.code || e.sapCode || '-'

            }))

        };

        

        window.dadosCatalogoAtual = data;



        // Render Geral

        const pane = document.getElementById('cat-pane-principal');

        pane.innerHTML = `

            <div class="flex gap-4">

                <div class="w-24 h-24 bg-slate-100 rounded border flex items-center justify-center">

                    <img src="${data.imagem || ''}" class="max-w-full max-h-full object-contain" onerror="this.src='https://placehold.co/100x100?text=S/I'">

                </div>

                <div class="flex-1">

                    <h4 class="text-blue-900 font-extrabold text-sm uppercase leading-tight">${data.descricao || 'NOME INDISPONÍVEL'}</h4>

                    <div class="flex flex-col gap-1 mt-2">

                        <p class="text-[10px] text-slate-500 font-bold uppercase">Fabricante: <span class="text-slate-700">${data.fabricante || '-'}</span></p>

                        <p class="text-[10px] text-slate-500 font-bold uppercase">Código Peça: <span class="text-blue-700 font-mono">${data.codigo || '-'}</span></p>

                        <p class="text-[10px] text-slate-500 font-bold uppercase">Código Barras (EAN): <span class="text-slate-700 font-mono">${data.ean || '-'}</span></p>

                        <p class="text-[10px] text-slate-500 font-bold uppercase">NCM: <span class="text-slate-800 font-mono bg-slate-100 px-1 rounded">${data.ncm || '-'}</span></p>

                    </div>

                    

                    <div class="mt-3 pt-2 border-t border-slate-200 grid grid-cols-4 gap-2">

                        <div class="flex flex-col text-[9px] font-bold text-slate-400 uppercase">Peso <span class="text-slate-700 text-[10px]">${data.peso}kg</span></div>

                        <div class="flex flex-col text-[9px] font-bold text-slate-400 uppercase">Alt <span class="text-slate-700 text-[10px]">${data.altura}cm</span></div>

                        <div class="flex flex-col text-[9px] font-bold text-slate-400 uppercase">Larg <span class="text-slate-700 text-[10px]">${data.largura}cm</span></div>

                        <div class="flex flex-col text-[9px] font-bold text-slate-400 uppercase">Comp <span class="text-slate-700 text-[10px]">${data.comprimento}cm</span></div>

                    </div>

                </div>

            </div>

        `;



        // Render Aplicações

        const tbApp = document.getElementById('tb-cat-aplicacoes');

        tbApp.innerHTML = "";

        (data.aplicacoes || []).forEach(a => {

            tbApp.innerHTML += `<tr><td class="text-[10px]">${a.marca}</td><td class="text-xs font-bold">${a.modelo}</td><td class="text-[10px]">${a.motorVersao || ''}</td><td class="text-center">${a.inicio || ''}</td><td class="text-center">${a.fim || ''}</td></tr>`;

        });



        // Render Similares

        const tbSim = document.getElementById('tb-cat-similares');

        tbSim.innerHTML = "";

        (data.equivalentes || []).forEach(e => {

            tbSim.innerHTML += `<tr><td class="text-[10px] font-bold">${e.fabricante}</td><td class="text-xs font-mono text-blue-700">${e.codigo}</td></tr>`;

        });



        document.getElementById('resultado-catalogo').classList.remove('hidden');

        const btnImportar = document.getElementById('btn-importar-catalogo');

        btnImportar.classList.remove('hidden');

        btnImportar.disabled = false;

        btnImportar.classList.remove('opacity-50', 'cursor-not-allowed', '!bg-slate-400');



        // Checagem Anti-Duplicidade do Catálogo

        try {

            const idAtual = parseInt(document.getElementById('prod-id').value) || 0;

            const jaExiste = await window.goEngine.main.App.VerificarSKUExistente(data.codigo, idAtual);

            if(jaExiste) {

                const painel = document.getElementById('cat-pane-principal');

                painel.innerHTML += `<div class="bg-red-50 border border-red-200 text-red-700 p-2 rounded mt-3 text-xs font-bold w-full mx-auto flex items-center justify-center gap-2">

                    <span class="material-symbols-outlined !text-[16px]">warning</span>

                    ALERTA: Este Código Fabricante (SKU ${data.codigo}) já está registrado!<br>A importação deste item foi bloqueada.

                </div>`;

                btnImportar.disabled = true;

                btnImportar.classList.add('opacity-50', 'cursor-not-allowed', '!bg-slate-400');

            }

        } catch(e) { console.error("Erro validando sku remoto", e); }

    } catch (e) {

        document.getElementById('erro-catalogo-msg').innerText = e.message;

        document.getElementById('erro-catalogo').classList.remove('hidden');

    } finally {

        document.getElementById('loading-catalogo').classList.add('hidden');

    }

};



window.importarDadosCatalogo = async function() {

    if(!window.dadosCatalogoAtual) return;

    const d = window.dadosCatalogoAtual;

    document.getElementById('prod-sku').value = d.codigo;

    window.verificarSKUCadastro(); // Valida se importação já existe

    document.getElementById('prod-descricao').value = d.descricao;

    document.getElementById('prod-codigo-barra').value = d.ean || "";

    

    if (d.imagem) {

        if(!window.produtoImagensLocal) window.produtoImagensLocal = [];

        try {

            // Se já for base64, adiciona direto

            if(d.imagem.startsWith('data:image')) {

                window.produtoImagensLocal.push(d.imagem);

                window.produtoImagemIndex = window.produtoImagensLocal.length - 1;

                if(window.atualizarCarrosselVisual) window.atualizarCarrosselVisual();

            } else {

                // Tenta converter URL para B64 para podermos salvar ela fisica/localmente pelo Backend

                const resp = await fetch(d.imagem);

                const blob = await resp.blob();

                const reader = new FileReader();

                reader.onloadend = () => {

                    window.produtoImagensLocal.push(reader.result);

                    window.produtoImagemIndex = window.produtoImagensLocal.length - 1;

                    if(window.atualizarCarrosselVisual) window.atualizarCarrosselVisual();

                };

                reader.readAsDataURL(blob);

            }

        } catch(e) {

            console.error("Erro convertendo imagem para B64:", e);

            window.produtoImagensLocal.push(d.imagem); // fallback visual

            window.produtoImagemIndex = window.produtoImagensLocal.length - 1;

            if(window.atualizarCarrosselVisual) window.atualizarCarrosselVisual();

        }

    }



    // Novos Campos Técnicos

    if (d.ncm) document.getElementById('prod-ncm').value = d.ncm;

    if (d.peso) document.getElementById('prod-peso').value = d.peso.toString().replace('.', ',');

    if (d.altura) document.getElementById('prod-altura').value = d.altura.toString().replace('.', ',');

    if (d.largura) document.getElementById('prod-largura').value = d.largura.toString().replace('.', ',');

    if (d.comprimento) document.getElementById('prod-comprimento').value = d.comprimento.toString().replace('.', ',');



    // Mapeamento de Marca e Unidade (SIG V76.1)

    const selMarca = document.getElementById('prod-marca-id');

    if (selMarca && d.manufacturer) {

        // Busca o ID da marca pelo nome

        const marca = Array.from(selMarca.options).find(o => o.text.toUpperCase() === d.manufacturer.toUpperCase());

        if (marca) selMarca.value = marca.value;

    }



    const selUnid = document.getElementById('prod-unidade-id');

    if (selUnid) {

        if (d.measurementUnit) {

            const unit = Array.from(selUnid.options).find(o => o.text.split(' - ')[0].toUpperCase() === d.measurementUnit.toUpperCase());

            if (unit) selUnid.value = unit.value;

        } else {

            selUnid.selectedIndex = -1;

        }

    }



    // Importar Aplicações

    const tbApp = document.getElementById('tb-aplicacoes');

    if (d.aplicacoes && d.aplicacoes.length > 0) {

        if(tbApp.innerHTML.includes('Nenhuma')) tbApp.innerHTML = "";

        d.aplicacoes.forEach(a => {

            const tr = document.createElement('tr');

            tr.className = "bg-white border-b border-slate-100";

            tr.innerHTML = `

                <td class="text-[10px] px-2 py-1">${a.marca || '-'}</td>

                <td class="text-xs px-2 py-1 font-bold text-slate-700">${a.modelo || '-'}</td>

                <td class="text-[10px] px-2 py-1">${a.motorVersao || ''}</td>

                <td class="text-xs text-center">${a.inicio || ''}</td>

                <td class="text-xs text-center">${a.fim || ''}</td>

                <td class="text-center px-1"><button onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600 border-none bg-transparent"><span class="material-symbols-outlined text-[16px]">close</span></button></td>

            `;

            tbApp.appendChild(tr);

        });

    }



    // Importar Similares (Conversões)

    const tbSim = document.getElementById('tb-similares');

    if (d.equivalentes && d.equivalentes.length > 0) {

        if(tbSim.innerHTML.includes('Nenhuma')) tbSim.innerHTML = "";

        d.equivalentes.forEach(e => {

            const tr = document.createElement('tr');

            tr.className = "bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors";

            tr.innerHTML = `

                <td class="p-0 border-r border-slate-100 h-5"><input type="text" class="w-full h-full bg-transparent text-[10px] uppercase text-slate-700 font-bold px-2 py-0 border-none outline-none focus:bg-blue-50" value="${e.fabricante}"></td>

                <td class="p-0 border-r border-slate-100 h-5"><input type="text" class="w-full h-full bg-transparent text-[11px] uppercase font-mono text-blue-700 font-bold px-2 py-0 border-none outline-none focus:bg-blue-50" value="${e.codigo}"></td>

                <td class="p-0 h-5 text-center"><button tabindex="-1" onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600 bg-transparent border-none flex items-center justify-center w-full h-full"><span class="material-symbols-outlined text-[14px]">close</span></button></td>

            `;

            tbSim.appendChild(tr);

        });

    }



    window.fecharBuscaCatalogo();

};



window.verificarSKUCadastro = async function() {

    const skuEl = document.getElementById('prod-sku');

    if(!skuEl) return;

    const sku = skuEl.value.trim().toUpperCase();

    if (sku.length === 0) return;



    const idAtual = parseInt(document.getElementById('prod-id').value) || 0;

    try {

        const jaExiste = await window.goEngine.main.App.VerificarSKUExistente(sku, idAtual);

        if (jaExiste) {

            skuEl.classList.add('!border-red-500', 'bg-red-50');

            skuEl.value = ""; // Limpa para impedir o cadastro enganoso

            if(window.validarCamposObrigatorios) window.validarCamposObrigatorios();



            await window.goEngine.main.App.MostrarAlerta(

                "Gravação Bloqueada (Conflito de Arquivo)",

                `O código fabricante (SKU) '${sku}' informado já está associado permanentemente a outro produto no ERP.\n\nPara assegurar a integridade do banco de dados e evitar falsos contrapesos fiscais, o sistema cancelou a inserção imediata deste identificador.\n\nAções sugeridas:\n1) Utilize um novo código.\n2) Retorne ao painel e edite o produto já existente.`

            );

            

            setTimeout(() => {

                skuEl.focus();

            }, 100);

        } else {

            skuEl.classList.remove('!border-red-500', 'bg-red-50');

        }

    } catch(e) { console.error("Erro check SKU", e); }

};



window.abrirModalAddSimilar = () => {

    document.getElementById('modal-add-similar').classList.remove('hidden');

    document.getElementById('modal-add-similar').classList.add('flex', 'items-center', 'justify-center');

    document.getElementById('add-sim-marca').value = '';

    document.getElementById('add-sim-codigo').value = '';

    setTimeout(() => document.getElementById('add-sim-marca').focus(), 100);

};



window.fecharModalAddSimilar = () => {

    document.getElementById('modal-add-similar').classList.remove('flex', 'items-center', 'justify-center');

    document.getElementById('modal-add-similar').classList.add('hidden');

};



window.confirmarAddSimilar = () => {

    const m = document.getElementById('add-sim-marca').value.trim().toUpperCase();

    const c = document.getElementById('add-sim-codigo').value.trim().toUpperCase();

    if (m || c) {

        window.adicionarLinhaSimilar(m, c);

        window.fecharModalAddSimilar();

    }

};





window.fecharResumoFiscal = () => {

    const m = document.getElementById('modal-resumo-fiscal');

    if (m) {

        m.classList.remove('flex', 'items-center', 'justify-center');

        m.classList.add('hidden');

    }

};



window.exibirResumoFiscal = () => {

    const sel = document.getElementById('prod-perfil-fiscal-id');

    const id = parseInt(sel.value, 10);

    if (!id || id <= 0) {

        window.ShowError("Selecione um Perfil Fiscal antes de tentar exibir seu resumo.");

        return;

    }

    

    if (!window.currentPerfisFiscais) return;

    const p = window.currentPerfisFiscais.find(x => x.id === id);

    if (!p) return;



    let html = `

        <div class="text-[14px] font-black text-blue-900 border-b border-slate-200 pb-2 mb-1 uppercase">

            ${p.nome}

        </div>

        

        <div class="grid grid-cols-2 gap-2 mb-1">

            <div class="bg-white p-2 border border-slate-200 rounded-sm shadow-sm flex flex-col justify-center">

                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Natureza / Operação</span>

                <span class="block text-[10px] font-bold text-slate-700 uppercase mt-0.5">${(p.natureza_operacao || 'N/A')} - ${(p.tipo_operacao || 'N/A')}</span>

            </div>

            <div class="bg-white p-2 border border-slate-200 rounded-sm shadow-sm flex flex-col justify-center">

                <span class="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">CFOP Padrão Destino</span>

                <span class="block text-[10px] font-bold text-blue-700 uppercase mt-0.5">${p.cfop_padrao || '(SEM CFOP DEFINIDO)'}</span>

            </div>

        </div>



        <div class="sig-fieldset-blueprint !mt-1">

            <span class="sig-legend-blueprint flex items-center gap-1 font-bold text-slate-700"><span class="material-symbols-outlined !text-[13px]">percent</span> Regras de Incidência (Cálculo)</span>

            <table class="sig-table sig-table-sm w-full border-none mt-1">

                <thead class="bg-slate-50 border-b border-slate-200">

                    <tr>

                        <th class="w-20 text-left">Tributo</th>

                        <th class="text-left w-20">CST/CSOSN Base</th>

                        <th class="text-center">Calcula na NF?</th>

                    </tr>

                </thead>

                <tbody class="divide-y divide-slate-100">

                    <tr class="bg-white hover:bg-slate-50">

                        <td class="font-extrabold text-slate-700 text-[10px] uppercase">ICMS Próprio</td>

                        <td class="text-blue-700 font-bold font-mono text-[10px]">${p.cst_icms || '--'}</td>

                        <td class="text-center">${p.calcula_icms || p.tem_icms_proprio ? '<span class="text-emerald-600 font-bold"><span class="material-symbols-outlined !text-[12px] align-middle">check_circle</span> SIM</span>' : '<span class="text-slate-400 font-bold text-[9px]">NÃO</span>'}</td>

                    </tr>

                    <tr class="bg-white hover:bg-slate-50">

                        <td class="font-extrabold text-slate-700 text-[10px] uppercase">ICMS-ST</td>

                        <td class="text-slate-400 text-[10px]">--</td>

                        <td class="text-center">${p.tem_st ? '<span class="text-emerald-600 font-bold"><span class="material-symbols-outlined !text-[12px] align-middle">check_circle</span> SIM</span>' : '<span class="text-slate-400 font-bold text-[9px]">NÃO</span>'}</td>

                    </tr>

                    <tr class="bg-white hover:bg-slate-50">

                        <td class="font-extrabold text-slate-700 text-[10px] uppercase">IPI</td>

                        <td class="text-blue-700 font-bold font-mono text-[10px]">${p.cst_ipi || '--'}</td>

                        <td class="text-center">${p.calcula_ipi || p.tem_ipi ? '<span class="text-emerald-600 font-bold"><span class="material-symbols-outlined !text-[12px] align-middle">check_circle</span> SIM</span>' : '<span class="text-slate-400 font-bold text-[9px]">NÃO</span>'}</td>

                    </tr>

                    <tr class="bg-white hover:bg-slate-50">

                        <td class="font-extrabold text-slate-700 text-[10px] uppercase">PIS</td>

                        <td class="text-blue-700 font-bold font-mono text-[10px]">${p.cst_pis || '--'}</td>

                        <td class="text-center">${p.calcula_pis ? '<span class="text-emerald-600 font-bold"><span class="material-symbols-outlined !text-[12px] align-middle">check_circle</span> SIM</span>' : '<span class="text-slate-400 font-bold text-[9px]">NÃO</span>'}</td>

                    </tr>

                    <tr class="bg-white hover:bg-slate-50">

                        <td class="font-extrabold text-slate-700 text-[10px] uppercase">COFINS</td>

                        <td class="text-blue-700 font-bold font-mono text-[10px]">${p.cst_cofins || '--'}</td>

                        <td class="text-center">${p.calcula_cofins ? '<span class="text-emerald-600 font-bold"><span class="material-symbols-outlined !text-[12px] align-middle">check_circle</span> SIM</span>' : '<span class="text-slate-400 font-bold text-[9px]">NÃO</span>'}</td>

                    </tr>

                </tbody>

            </table>

        </div>



        <div class="sig-fieldset-blueprint">

            <span class="sig-legend-blueprint flex items-center gap-1 font-bold text-slate-700"><span class="material-symbols-outlined !text-[13px]">settings</span> Composição de Custo Médio</span>

            <div class="grid grid-cols-2 gap-x-6 gap-y-2 mt-2 px-1">

                <div class="flex items-center justify-between border-b border-slate-100 pb-1">

                    <span class="text-[9px] font-bold text-slate-500 uppercase">Soma ST?</span>

                    <span class="${p.soma_st_no_custo || p.soma_st_custo ? 'text-blue-600 font-bold' : 'text-slate-300'} text-[10px]">${p.soma_st_no_custo || p.soma_st_custo ? 'SIM' : 'NÃO'}</span>

                </div>

                <div class="flex items-center justify-between border-b border-slate-100 pb-1">

                    <span class="text-[9px] font-bold text-slate-500 uppercase">Soma IPI?</span>

                    <span class="${p.soma_ipi_no_custo || p.ipi_soma_custo || p.soma_ipi_custo ? 'text-blue-600 font-bold' : 'text-slate-300'} text-[10px]">${p.soma_ipi_no_custo || p.ipi_soma_custo || p.soma_ipi_custo ? 'SIM' : 'NÃO'}</span>

                </div>

                <div class="flex items-center justify-between border-b border-slate-100 pb-1">

                    <span class="text-[9px] font-bold text-slate-500 uppercase">Soma Frete?</span>

                    <span class="${p.soma_frete_no_custo || p.soma_frete_custo ? 'text-blue-600 font-bold' : 'text-slate-300'} text-[10px]">${p.soma_frete_no_custo || p.soma_frete_custo ? 'SIM' : 'NÃO'}</span>

                </div>

                <div class="flex items-center justify-between border-b border-slate-100 pb-1">

                    <span class="text-[9px] font-bold text-slate-500 uppercase">Soma Despesas?</span>

                    <span class="${p.soma_despesas_no_custo || p.soma_despesas_custo ? 'text-blue-600 font-bold' : 'text-slate-300'} text-[10px]">${p.soma_despesas_no_custo || p.soma_despesas_custo ? 'SIM' : 'NÃO'}</span>

                </div>

            </div>

        </div>

    `;

    

    document.getElementById('conteudo-resumo-fiscal').innerHTML = html;

    const m = document.getElementById('modal-resumo-fiscal');

    m.classList.remove('hidden');

    m.classList.add('flex', 'items-center', 'justify-center');

};



window.adicionarLinhaSimilar = function(fab = "", cod = "") {

    const tb = document.getElementById('tb-similares');

    if(tb.innerHTML.includes('Nenhuma')) tb.innerHTML = "";

    const tr = document.createElement('tr');

    tr.className = "bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors";

    tr.innerHTML = `

        <td class="p-0 border-r border-slate-100 h-5"><input type="text" class="w-full h-full bg-transparent text-[10px] uppercase text-slate-700 font-bold px-2 py-0 border-none outline-none placeholder-slate-300 focus:bg-blue-50" value="${fab}" placeholder="MARCA..."></td>

        <td class="p-0 border-r border-slate-100 h-5"><input type="text" class="w-full h-full bg-transparent text-[11px] uppercase font-mono text-blue-700 font-bold px-2 py-0 border-none outline-none placeholder-slate-300 focus:bg-blue-50" value="${cod}" placeholder="CÓDIGO (REF)..."></td>

        <td class="p-0 h-5 text-center"><button tabindex="-1" onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600 bg-transparent border-none flex items-center justify-center w-full h-full"><span class="material-symbols-outlined text-[14px]">close</span></button></td>

    `;

    tb.appendChild(tr);

};



window.mudarAbaCatalogo = function(tab) {

    ['principal', 'aplicacoes', 'similares'].forEach(t => {

        document.getElementById(`cat-pane-${t}`).classList.add('hidden');

        document.getElementById(`tab-cat-${t}`).classList.remove('border-blue-600', 'text-blue-700', 'bg-white');

    });

    document.getElementById(`cat-pane-${tab}`).classList.remove('hidden');

    document.getElementById(`tab-cat-${tab}`).classList.add('border-blue-600', 'text-blue-700', 'bg-white');

};



function initSplittersProduto() {

    const s = document.getElementById('splitter-app-cadastro');

    const c = document.getElementById('container-app-cadastro');

    if(!s || !c) return;

    s.onmousedown = (e) => {

        let sy = e.clientY, sh = c.offsetHeight;

        document.onmousemove = (me) => {

            let nh = sh + (me.clientY - sy);

            if(nh > 80 && nh < 450) c.style.height = nh + 'px';

        };

        document.onmouseup = () => document.onmousemove = null;

    }

}



// ADICIONAL: RECALCULO PREÇOS (VERSÃO FISCAL V44)

window.recalcularPrecos = function() {

    const moneyToFloat = (v) => parseFloat(String(v).replace('.', '').replace(',', '.')) || 0;

    const custoBase = moneyToFloat(document.getElementById('prod-custo').value);

    const ipi = parseFloat(document.getElementById('prod-aliquota-ipi').value.replace(',', '.')) || 0;

    const frete = parseFloat(document.getElementById('prod-frete').value.replace(',', '.')) || 0;

    

    // Custo Real = (Custo Base + IPI%) + Frete%

    const custoComIpi = custoBase * (1 + (ipi / 100));

    const custoReal = custoComIpi * (1 + (frete / 100));

    

    const divCustoReal = document.getElementById('label-custo-real');

    if(divCustoReal) divCustoReal.innerText = "R$ " + custoReal.toLocaleString('pt-BR', {minimumFractionDigits: 2});



    const mkp = parseFloat(document.getElementById('prod-mkp-balcao').value) || 0;

    const preco = custoReal * (1 + (mkp / 100));

    

    document.getElementById('prod-venda').value = preco.toLocaleString('pt-BR', {minimumFractionDigits: 2});

    const divVendaSugerida = document.getElementById('label-venda-sugerida');

    if(divVendaSugerida) divVendaSugerida.innerText = "R$ " + preco.toLocaleString('pt-BR', {minimumFractionDigits: 2});

};



window.recalcularMKP = function() {

    const moneyToFloat = (v) => parseFloat(String(v).replace('.', '').replace(',', '.')) || 0;

    const custoBase = moneyToFloat(document.getElementById('prod-custo').value);

    const ipi = parseFloat(document.getElementById('prod-aliquota-ipi').value.replace(',', '.')) || 0;

    const frete = parseFloat(document.getElementById('prod-frete').value.replace(',', '.')) || 0;

    const custoReal = (custoBase * (1 + (ipi / 100))) * (1 + (frete / 100));



    const preco = moneyToFloat(document.getElementById('prod-venda').value);

    if(custoReal > 0) {

        const mkp = ((preco / custoReal) - 1) * 100;

        document.getElementById('prod-mkp-balcao').value = mkp.toFixed(2);

    }

};



window.consultarDadosFiscais = async function() {

    const ncm = document.getElementById('prod-ncm').value.trim().replace(/\D/g, '');

    if(ncm.length < 4) return alert("Digite ao menos 4 dígitos do NCM para consultar.");

    

    // Simulação de consulta IBPT/Receita (Em breve integração real)

    // No futuro aqui chamaremos window.goEngine.main.App.ConsultarFiscal(ncm)

    alert("🔍 Consultando tributação para NCM: " + ncm + "\n\n(Simulação V44: Sistema em conformidade com as tabelas IBPT vigentes)");

    

    // Mock de alíquotas conforme NCM (Exemplo de lógica)

    if(ncm.startsWith('8708')) { // Partes e acessórios de veículos

        document.getElementById('prod-aliquota-ipi').value = "5.00";

        document.getElementById('prod-cst-csosn').value = "500"; // Substituição Tributária

        document.getElementById('prod-cfop').value = "5405";

    }

    window.recalcularPrecos();

};



window.toggleFiscalAvancado = () => {

    const d = document.getElementById('fiscal-advanced');

    const t = document.getElementById('fiscal-advanced-text');

    const i = document.getElementById('fiscal-advanced-icon');

    if(d) {

        const isHidden = d.classList.toggle('hidden');

        if(t) t.innerText = isHidden ? "Opções Avançadas" : "Recolher Opções";

        if(i) i.style.transform = isHidden ? "rotate(0deg)" : "rotate(180deg)";

    }

};



window.abrirBuscaCatalogo = () => {

    document.getElementById('modal-busca-catalogo').classList.remove('hidden');

    document.getElementById('modal-busca-catalogo').classList.add('flex', 'items-center', 'justify-center');

};

window.fecharBuscaCatalogo = () => document.getElementById('modal-busca-catalogo').classList.add('hidden');





window.abrirModalAddAplicacao = () => {

    document.getElementById('modal-add-aplicacao').classList.remove('hidden');

    document.getElementById('modal-add-aplicacao').classList.add('flex', 'items-center', 'justify-center');

    if(document.getElementById('app-veiculo-marca').options.length <= 1) window.carregarMarcasVeiculo();

};

window.fecharModalAddAplicacao = () => document.getElementById('modal-add-aplicacao').classList.add('hidden');



window.carregarMarcasVeiculo = async () => {

    const s = document.getElementById('app-veiculo-marca');

    try {

        const r = await fetch('https://parallelum.com.br/fipe/api/v1/carros/marcas');

        const m = await r.json();

        s.innerHTML = '<option value="">MARCA...</option>';

        m.forEach(i => s.innerHTML += `<option value="${i.codigo}">${i.nome.toUpperCase()}</option>`);

    } catch(e) {}

};



window.carregarModelosVeiculo = async () => {

    const mId = document.getElementById('app-veiculo-marca').value;

    const s = document.getElementById('app-veiculo-modelo');

    if(!mId) return;

    try {

        const r = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${mId}/modelos`);

        const d = await r.json();

        s.innerHTML = '<option value="">MODELO...</option>';

        d.modelos.forEach(i => {

           let o = document.createElement('option'); o.value = i.codigo; o.dataset.nomeCompleto = i.nome; o.textContent = i.nome.toUpperCase();

           s.appendChild(o);

        });

        s.disabled = false;

    } catch(e) {}

};



window.autoSepararVersao = async () => {

    const s = document.getElementById('app-veiculo-modelo');

    const full = s.options[s.selectedIndex].dataset.nomeCompleto;

    if(!full) return;

    const patterns = [/ \d\.\d/, / \d{1,2}V/, / TURBO/i, / TB /i, / TB$/i, / AUT\./i, / AT /i, / CVT/i, / FLEX/i, / DIESEL/i];

    let idx = -1;

    patterns.forEach(p => { const m = full.match(p); if(m && (idx === -1 || m.index < idx)) idx = m.index; });

    if(idx !== -1) {

        document.getElementById('app-veiculo-motor').value = full.substring(idx).trim().toUpperCase();

        s.dataset.coreModel = full.substring(0, idx).trim();

    } else {

        document.getElementById('app-veiculo-motor').value = "";

        s.dataset.coreModel = full;

    }

};



window.confirmarAddAplicacao = () => {

    const m = document.getElementById('app-veiculo-marca').options[document.getElementById('app-veiculo-marca').selectedIndex].text;

    const s = document.getElementById('app-veiculo-modelo');

    const core = s.dataset.coreModel || s.options[s.selectedIndex].text;

    const motor = document.getElementById('app-veiculo-motor').value;

    const ini = document.getElementById('app-veiculo-inicio').value;

    const fim = document.getElementById('app-veiculo-fim').value;



    const tb = document.getElementById('tb-aplicacoes');

    if(tb.innerHTML.includes('Nenhuma')) tb.innerHTML = "";

    const tr = document.createElement('tr');

    tr.className = "bg-white border-b border-slate-100";

    tr.innerHTML = `<td class="text-[10px] px-2 py-1">${m}</td><td class="text-xs px-2 py-1 font-bold text-slate-700">${core}</td><td class="text-[10px] px-2 py-1">${motor}</td><td class="text-xs text-center">${ini}</td><td class="text-xs text-center">${fim}</td><td class="text-center px-1"><button onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600 border-none bg-transparent"><span class="material-symbols-outlined text-[16px]">close</span></button></td>`;

    tb.appendChild(tr);

    window.fecharModalAddAplicacao();

};





window.validarInputAno = (i) => {

    const v = parseInt(i.value), min = parseInt(i.min), max = parseInt(i.max);

    if(min && v < min) i.value = min; if(max && v > max) i.value = max;

};





window.currentMarcas = [];

window.currentCategorias = [];

window.currentSubcategorias = [];



const initModaisF3 = async () => {

    console.log("🛠️ SIG: Injetando modais F3...");

    if (document.getElementById('modal-cadastro')) return;

    

    document.body.insertAdjacentHTML('beforeend', ModalProdutoHTML);

    document.body.insertAdjacentHTML('beforeend', ModalBuscaCatalogoHTML);

    document.body.insertAdjacentHTML('beforeend', ModalAddAplicacaoHTML);

    document.body.insertAdjacentHTML('beforeend', ModalAddSimilarHTML);

    document.body.insertAdjacentHTML('beforeend', ModalResumoFiscalHTML);

    

    // Carrega e Injeta o fragmento do formulário

    const container = document.getElementById('cadastro-form-container');

    if (container) {

        const fragmento = await carregarFragmentoCadastro();

        container.innerHTML = fragmento;

        

        // Inicializa componentes do formulário se necessário

        if (typeof initSplittersProduto === 'function') initSplittersProduto();

        

        // Inicializa selects e dados

        if (window.initFormularioProduto) await window.initFormularioProduto();

    }

    

    console.log("✅ SIG: Modais F3 injetados com sucesso.");

};

window.produtoImagensLocal = [];

window.produtoImagemIndex = 0;



window.atualizarCarrosselVisual = () => {

    const grid = document.getElementById('img-grid-produto');

    if (!grid) return;

    grid.innerHTML = '';

    

    if (window.produtoImagensLocal.length === 0) {

        grid.innerHTML = `

            <div class="w-full h-28 shrink-0 bg-slate-100 border border-dash border-slate-200 rounded-sm flex flex-col items-center justify-center text-slate-300">

                <span class="material-symbols-outlined text-[24px] opacity-40">image</span>

                <span class="text-[8px] font-bold uppercase mt-1">Carregado</span>

            </div>

        `;

        return;

    }



    window.produtoImagensLocal.forEach((imgUrl, index) => {

        const div = document.createElement('div');

        div.className = 'w-48 h-48 mx-auto shrink-0 border border-slate-300 rounded-sm relative group cursor-pointer bg-white overflow-hidden shadow-sm hover:border-blue-400 transition-colors';

        div.innerHTML = `

            <img src="${imgUrl}" class="w-full h-full object-contain p-1" onclick="event.stopPropagation(); window.zoomProdutoImgIndex(${index})">

            <div class="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <button type="button" onclick="event.stopPropagation(); window.delProdutoImgIndex(${index})" class="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl-sm opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10 shadow-sm border-none">

                <span class="material-symbols-outlined !text-[12px] font-bold">close</span>

            </button>

        `;

        grid.appendChild(div);

    });

};



window.zoomProdutoImgIndex = (index) => {

    const imgUrl = window.produtoImagensLocal[index];

    const zm = document.createElement('div');

    zm.className = 'fixed inset-0 z-[9999] bg-black/80 flex flex-col items-center justify-center p-8 backdrop-blur-sm animate-fade-in';

    zm.innerHTML = `

        <button onclick="this.parentElement.remove()" class="absolute top-4 right-6 text-white bg-red-600 hover:bg-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors border-none"><span class="material-symbols-outlined text-[24px]">close</span></button>

        <img src="${imgUrl}" class="max-w-[90vw] max-h-[85vh] object-contain drop-shadow-2xl rounded-sm bg-white p-2">

    `;

    zm.onclick = (e) => { if(e.target === zm) zm.remove(); };

    document.body.appendChild(zm);

};



window.addProdutoImg = () => {

    const inpt = document.createElement('input');

    inpt.type = 'file'; inpt.accept = 'image/*';

    inpt.onchange = (e) => {

        const file = e.target.files[0];

        if(!file) return;

        const reader = new FileReader();

        reader.onload = (re) => {

            window.produtoImagensLocal.push(re.target.result);

            window.atualizarCarrosselVisual();

        };

        reader.readAsDataURL(file);

    };

    inpt.click();

};



window.delProdutoImgIndex = (index) => {

    window.produtoImagensLocal.splice(index, 1);

    window.atualizarCarrosselVisual();

};



if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', () => initModaisF3());

} else {

    initModaisF3();
}
