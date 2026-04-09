// COMPONENTE GOLBAL: MODAL DE CADASTRO DE PRODUTO
console.log("🛠️ SIG: modal_produto.js v54 carregado.");

const ModalProdutoHTML = `
<!-- MODAL DE CADASTRO DE PRODUTO UNIFICADO -->
<div id="modal-cadastro" class="sig-modal-overlay hidden" style="z-index: 9999;">
    <div class="bg-white w-[95%] h-[90%] rounded-sm shadow-2xl overflow-hidden border border-slate-400 flex flex-col">
        <!-- CABEÇALHO DO MODAL -->
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

        <!-- CORPO DO CADASTRO -->
        <div class="flex-1 overflow-hidden flex gap-2 p-2 bg-white">
    <!-- COLUNA ESQUERDA (DADOS CADASTRAIS) -> 70% Width -->
    <div class="w-[70%] flex flex-col gap-0 h-full overflow-y-auto pr-2 custom-scrollbar">

        <!-- BLOCO 1: IDENTIFICAÇÃO -->
        <div class="sig-fieldset-blueprint mt-2 shrink-0">
            <span class="sig-legend-blueprint">Identificação do Item</span>
            <div class="flex gap-2">
                <div class="w-24">
                    <label class="sig-label-dense">Status</label>
                    <select id="prod-ativo" class="sig-input-dense w-full font-bold cursor-pointer bg-white text-green-700" onchange="this.classList.toggle('text-green-700', this.value==='true'); this.classList.toggle('text-red-700', this.value==='false');">
                        <option value="true" class="text-green-700">ATIVO</option>
                        <option value="false" class="text-red-700">INATIVO</option>
                    </select>
                </div>
                <div class="w-16">
                    <label class="sig-label-dense">ID</label>
                    <input type="text" id="prod-id"
                        class="sig-input-dense w-full bg-slate-100 font-bold text-center" value="NOVO"
                        readonly tabindex="-1">
                </div>
                <div class="w-[30%] relative">
                    <label class="sig-label-dense">Cód. Fabr. (SKU) <span class="text-red-600 font-bold">*</span></label>
                    <div class="flex gap-1">
                        <input type="text" id="prod-sku" class="sig-input-dense flex-1 uppercase border-blue-200 focus:ring-red-400" placeholder="AL-1234" oninput="window.validarCamposObrigatorios()" onblur="window.verificarSKUCadastro()">
                        <button type="button" onclick="window.abrirBuscaCatalogo()" class="sig-btn-icon !h-6 !w-8 !p-0" title="Buscar no Catálogo Online">
                            <span class="material-symbols-outlined !text-[16px]">search</span>
                        </button>
                    </div>
                </div>
                <div class="w-1/4">
                    <label class="sig-label-dense">Marca da Peça <span class="text-red-600 font-bold">*</span></label>
                    <select id="prod-marca-id"
                        class="sig-input-dense w-full bg-white cursor-pointer uppercase text-slate-700 font-bold border-blue-200"
                        onchange="window.aplicarMargemMarca(); window.validarCamposObrigatorios()">
                        <option value="0">SELECIONE...</option>
                    </select>
                </div>
                <div class="flex-1">
                    <label class="sig-label-dense">Código de Barras <span class="text-red-600 font-bold">*</span></label>
                    <input type="text" id="prod-codigo-barra" class="sig-input-dense w-full border-blue-100"
                        placeholder="Ex: 7891234567890" oninput="window.validarCamposObrigatorios()">
                </div>
            </div>

            <!-- LINHA 2: TAXONOMIA -->
            <div class="flex gap-2 mt-2">
                <div class="w-1/2">
                    <label class="sig-label-dense">Categoria <span class="text-red-600 font-bold">*</span></label>
                    <select id="prod-categoria-id" class="sig-input-dense w-full bg-white cursor-pointer font-bold uppercase border-blue-200" onchange="window.onCategoriaChange(); window.validarCamposObrigatorios()">
                        <option value="">SELECIONE...</option>
                    </select>
                </div>
                <div class="w-1/2">
                    <label class="sig-label-dense">Subcategoria <span class="text-red-600 font-bold">*</span></label>
                    <select id="prod-subcategoria-id" class="sig-input-dense w-full bg-white cursor-pointer uppercase border-blue-200" onchange="window.validarCamposObrigatorios()">
                        <option value="0">SELECIONE UMA CATEGORIA ANTES...</option>
                    </select>
                </div>
            </div>

            <!-- LINHA 3: DESCRIÇÕES -->
            <div class="flex gap-2 mt-2">
                <div class="flex-1 relative group">
                    <label class="sig-label-dense">Descrição Padrão SIG <span class="text-red-600 font-bold">*</span></label>
                    <div id="wrapper-prod-descricao" class="relative h-[24px] bg-white border border-blue-200 rounded-[2px] overflow-hidden transition-colors">
                        <div id="prod-descricao-ghost" class="absolute inset-0 px-[6px] flex items-center text-[11px] font-bold text-slate-300 pointer-events-none uppercase whitespace-pre z-0"></div>
                        <input type="text" id="prod-descricao" autocomplete="off" 
                            class="w-full h-full px-[6px] text-[11px] font-bold uppercase text-slate-900 border-none outline-none relative z-10 !bg-transparent" 
                            style="background: transparent !important; box-shadow: none !important;"
                            placeholder="DIGITE..." 
                            oninput="window.mostrarSugestoesDescricao(this.value); window.validarCamposObrigatorios()"
                            onkeydown="window.navegarSugestoesDescricao(event)"
                            onblur="setTimeout(() => window.fecharSugestoesDescricao(), 200)">
                    </div>
                    <div id="placahoard-descricoes" class="hidden absolute left-0 right-0 top-[100%] mt-1 bg-slate-900 text-white rounded shadow-2xl z-[10002] border border-slate-700 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                        <div class="bg-slate-800 px-3 py-1 flex justify-between items-center border-b border-slate-700">
                            <span class="text-[9px] font-black uppercase tracking-tighter text-slate-400">Sugestões de Cadastro</span>
                            <span class="text-[8px] text-slate-500 font-bold">[TAB] para completar</span>
                        </div>
                        <div id="lista-sugestoes-inner"></div>
                    </div>
                </div>
                <div class="w-[30%]">
                    <label class="sig-label-dense">Nome Popular <span class="text-red-600 font-bold">*</span></label>
                    <input type="text" id="prod-nome-popular" class="sig-input-dense w-full uppercase border-blue-200 bg-orange-50/10" placeholder="Ex: Campana/Burrinho" oninput="window.validarCamposObrigatorios()">
                </div>
            </div>

            <!-- LINHA 4: POSIÇÃO E LADO -->
            <div class="flex gap-2 mt-2 pb-1">
                <div class="w-1/2">
                    <label class="sig-label-dense">Posição <span class="text-red-600 font-bold">*</span></label>
                    <select id="prod-posicao" class="sig-input-dense w-full bg-white cursor-pointer uppercase" onchange="window.validarCamposObrigatorios()">
                        <option value="">SELECIONE...</option>
                        <option value="N/A">N/A</option>
                        <option value="DIANTEIRO">DIANTEIRO</option>
                        <option value="TRASEIRO">TRASEIRO</option>
                        <option value="SUPERIOR">SUPERIOR</option>
                        <option value="INFERIOR">INFERIOR</option>
                        <option value="INTERNO">INTERNO</option>
                        <option value="EXTERNO">EXTERNO</option>
                    </select>
                </div>
                <div class="w-1/2">
                    <label class="sig-label-dense">Lado <span class="text-red-600 font-bold">*</span></label>
                    <select id="prod-lado" class="sig-input-dense w-full bg-white cursor-pointer uppercase" onchange="window.validarCamposObrigatorios()">
                        <option value="">SELECIONE...</option>
                        <option value="N/A">N/A</option>
                        <option value="ESQUERDO">ESQUERDO</option>
                        <option value="DIREITO">DIREITO</option>
                        <option value="PAR / AMBOS">PAR / AMBOS</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- BLOCO 2: APLICAÇÃO TÉCNICA -->
        <div class="sig-fieldset-blueprint sig-fieldset-flush flex flex-col mt-1 shrink-0">
            <span class="sig-legend-blueprint">Aplicação Técnica Detalhada</span>
            <div id="container-app-cadastro" class="overflow-y-auto w-full bg-slate-50 relative border border-slate-200 rounded-t-sm" style="height: 100px; min-height: 80px; max-height: 450px;">
                <table class="sig-table sig-table-sm w-full border-none">
                    <thead class="sticky top-0 shadow-sm z-10 px-2 bg-slate-100">
                        <tr>
                            <th class="w-20 border-none">Marca</th>
                            <th class="border-none">Modelo</th>
                            <th class="border-none">Versão / Motor</th>
                            <th class="w-12 text-center border-none">Ini</th>
                            <th class="w-12 text-center border-none">Fim</th>
                            <th class="w-12 sig-text-center border-none">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tb-aplicacoes">
                        <tr class="bg-white"><td colspan="6" class="text-center text-slate-400 py-3 text-[10px] italic border-none">Nenhuma aplicação cadastrada</td></tr>
                    </tbody>
                </table>
            </div>
            <div class="p-1 px-2 bg-slate-50 border-x border-b border-slate-300 rounded-b-sm flex justify-between items-center">
                <button type="button" onclick="window.abrirModalAddAplicacao()" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3 py-1 text-[10px] rounded-sm shadow-sm flex items-center gap-2">
                    <span class="material-symbols-outlined !text-[12px]">add</span> Adicionar Aplicação
                </button>
                <div id="splitter-app-cadastro" class="h-3 w-12 bg-slate-200 hover:bg-blue-300 cursor-row-resize rounded-full opacity-40 transition-colors" title="Arraste para ajustar altura"></div>
            </div>
        </div>


        <!-- LINHA: LOGÍSTICA + FISCAL -->
        <div class="flex gap-2 mt-1 shrink-0">
            <!-- SUB-BLOCO: LOGÍSTICA E DIMENSÕES -->
            <div class="sig-fieldset-blueprint w-1/2 flex flex-col">
                <span class="sig-legend-blueprint flex items-center gap-1.5 font-bold"><span class="material-symbols-outlined !text-[14px]">package_2</span> Logística e Dimensões</span>
                <div class="flex gap-2 items-center bg-slate-50/50 p-1 flex-1">
                    <div class="w-24 h-20 bg-white border border-slate-200 rounded-sm shadow-inner shrink-0 relative flex items-center justify-center p-0.5 group">
                        <svg viewBox="0 0 160 120" class="w-full h-full drop-shadow-sm transition-all group-hover:scale-105 duration-300">
                            <!-- Box Paths -->
                            <path d="M48 40 L80 56 L80 96 L48 80 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1" stroke-linejoin="round"/>
                            <path d="M112 40 L112 80 L80 96 L80 56 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" stroke-linejoin="round"/>
                            <path d="M80 24 L112 40 L80 56 L48 40 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1" stroke-linejoin="round"/>
                            <!-- Indicator Lines & Texts -->
                            <line x1="30" y1="40" x2="30" y2="80" stroke="#ef4444" stroke-width="1.5" marker-start="url(#arrow-red)" marker-end="url(#arrow-red)" />
                            <text x="18" y="64" fill="#ef4444" font-size="12" font-weight="900" font-family="sans-serif">A</text>
                            
                            <line x1="42" y1="90" x2="74" y2="106" stroke="#3b82f6" stroke-width="1.5" marker-start="url(#arrow-blue)" marker-end="url(#arrow-blue)" />
                            <text x="50" y="112" fill="#3b82f6" font-size="12" font-weight="900" font-family="sans-serif">C</text>
                            
                            <line x1="118" y1="90" x2="86" y2="106" stroke="#f59e0b" stroke-width="1.5" marker-start="url(#arrow-orange)" marker-end="url(#arrow-orange)" />
                            <text x="100" y="112" fill="#f59e0b" font-size="12" font-weight="900" font-family="sans-serif">L</text>
                            <defs>
                                <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" /></marker>
                                <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" /></marker>
                                <marker id="arrow-orange" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" /></marker>
                            </defs>
                        </svg>
                    </div>
                    <div class="flex-1 grid grid-cols-2 gap-x-1.5 gap-y-1">
                        <div class="col-span-1 flex gap-1">
                            <div class="flex-1">
                                <label class="sig-label-dense text-blue-600 font-extrabold text-[8px]">UNID. <span class="text-red-600">*</span></label>
                                <select id="prod-unidade-id" class="sig-input-dense w-full font-bold bg-white border-blue-200 !text-[10px] !h-6" onchange="window.validarCamposObrigatorios()"><option value="0">UNIDADE (UN)</option></select>
                            </div>
                            <div class="w-10">
                                <label class="sig-label-dense opacity-60 !text-[8px]">FATOR</label>
                                <input type="text" id="prod-fator-conversao" class="sig-input-dense w-full text-center !h-6 !text-[10px]" value="1.0000">
                            </div>
                        </div>
                        <div class="col-span-1">
                            <label class="sig-label-dense opacity-60 !text-[8px]">PESO (KG)</label>
                            <input type="text" id="prod-peso" class="sig-input-dense w-full text-right font-mono font-bold text-blue-900 !h-6" placeholder="0.000">
                        </div>
                        <div class="col-span-2 grid grid-cols-3 gap-1">
                            <div><label class="sig-label-dense !text-[8px] text-red-500 font-bold">A - ALTURA</label><input type="text" id="prod-altura" class="sig-input-dense w-full text-right !h-6" placeholder="0.00"></div>
                            <div><label class="sig-label-dense !text-[8px] text-orange-500 font-bold">L - LARGURA</label><input type="text" id="prod-largura" class="sig-input-dense w-full text-right !h-6" placeholder="0.00"></div>
                            <div><label class="sig-label-dense !text-[8px] text-blue-500 font-bold">C - COMPRIM</label><input type="text" id="prod-comprimento" class="sig-input-dense w-full text-right !h-6" placeholder="0.00"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SUB-BLOCO: FISCAL -->
            <div class="sig-fieldset-blueprint w-1/2 border-slate-300 bg-slate-50/10">
                <span class="sig-legend-blueprint !text-slate-700 font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined !text-[15px]">balance</span> Tributação e Base Fiscal
                </span>
                <div class="grid grid-cols-3 gap-x-1.5 gap-y-1.5 p-0.5">
                    <div class="col-span-1">
                        <label class="sig-label-dense opacity-70">NCM <span class="text-red-600 font-bold">*</span></label>
                        <div class="flex gap-0.5">
                            <input type="text" id="prod-ncm" class="sig-input-dense w-full font-mono text-blue-800 !h-6 !text-[10px]" placeholder="0000.0000" oninput="window.validarCamposObrigatorios()">
                            <button onclick="window.consultarDadosFiscais()" class="sig-button-orange !p-0.5 !h-6 !w-6 shrink-0"><span class="material-symbols-outlined !text-[14px]">search</span></button>
                        </div>
                    </div>
                    <div class="col-span-1">
                        <label class="sig-label-dense opacity-70">CEST</label>
                        <input type="text" id="prod-cest" class="sig-input-dense w-full font-mono !h-6 !text-[10px]" placeholder="00.000.00">
                    </div>
                    <div class="col-span-1">
                        <label class="sig-label-dense opacity-70">ORIGEM <span class="text-red-600 font-bold">*</span></label>
                        <select id="prod-origem" class="sig-input-dense w-full !h-6 !text-[10px] border-blue-100" onchange="window.validarCamposObrigatorios()">
                            <option value="">SELECIONE...</option>
                            <option value="0">0 - NACIONAL</option>
                            <option value="1">1 - IMPORTAÇÃO DIRETA</option>
                            <option value="2">2 - IMPORTADA (INTERNA)</option>
                        </select>
                    </div>
                    <div class="col-span-3 mt-1 p-2 bg-blue-100/50 rounded border border-blue-200">
                        <label class="sig-label-dense text-blue-700 font-extrabold flex items-center gap-1 mb-1">
                            <span class="material-symbols-outlined !text-[12px]">style</span> PERFIL FISCAL <span class="text-red-600">*</span>
                        </label>
                        <div class="flex gap-1 items-center w-full">
                            <select id="prod-perfil-fiscal-id" class="sig-input-dense w-full font-bold bg-white border-blue-300 !h-7 !text-[11px] flex-1" onchange="window.validarCamposObrigatorios()">
                                <option value="0">SELECIONE O GRUPO FISCAL...</option>
                            </select>
                            <button tabindex="-1" type="button" onclick="window.exibirResumoFiscal()" class="h-7 px-3 bg-white border border-blue-300 rounded-[2px] shadow-sm hover:bg-blue-50 text-blue-600 font-bold flex items-center justify-center transition-colors shrink-0 outline-none focus:ring-2 focus:ring-blue-400" title="Ver Detalhes do Perfil">
                                <span class="material-symbols-outlined text-[16px]">info</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- LINHA: CUSTOS + CANAIS DE VENDA -->
        <div class="flex gap-2 mt-1 shrink-0 pb-2">
        <!-- SUB-BLOCO: CUSTOS -->
        <div id="painel-custos-bloco" class="sig-fieldset-blueprint flex-[2] border-slate-300 bg-slate-50/30 transition-opacity duration-300">
            <span class="sig-legend-blueprint !text-slate-700 font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined !text-[15px]">request_quote</span> Custos e Formação
                </span>
                <div class="grid grid-cols-3 gap-1.5 p-0.5">
                    <input type="hidden" id="prod-custo" value="0,00">
                    <input type="hidden" id="prod-frete" value="0.00">
                    
                    <div class="flex flex-col bg-white border border-slate-200 rounded-[3px] p-1.5 px-2 shadow-sm relative overflow-hidden">
                        <span class="text-[8px] font-black text-slate-500 uppercase tracking-wider">Último Custo</span>
                        <div class="flex items-center justify-between mt-1">
                            <span class="font-mono text-slate-800 font-black text-[12px]">R$ 0,00</span>
                            <span class="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[7px] font-bold uppercase tracking-tighter border border-slate-200">Últ. Nota</span>
                        </div>
                    </div>
                    
                    <div class="flex flex-col bg-blue-50/70 border border-blue-200 rounded-[3px] p-1.5 px-2 shadow-sm relative overflow-hidden">
                        <span class="text-[8px] font-black text-blue-700 uppercase tracking-wider">Custo Médio</span>
                        <div class="flex items-center justify-between mt-1">
                            <span class="font-mono text-blue-900 font-black text-[13px]">R$ 0,00</span>
                            <span class="px-1.5 py-0.5 bg-blue-200/50 text-blue-700 rounded-full text-[7px] font-bold uppercase tracking-tighter border border-blue-300">Estoque</span>
                        </div>
                    </div>
                    
                    <div class="flex flex-col bg-[#fff6ed] border border-orange-200 rounded-[3px] p-1.5 px-2 shadow-sm relative overflow-hidden">
                        <span class="text-[8px] font-black text-orange-700 uppercase tracking-wider">Reposição</span>
                        <div class="flex items-center justify-between mt-1">
                            <span class="font-mono text-orange-900 font-black text-[12px]">R$ 0,00</span>
                            <span class="px-1.5 py-0.5 bg-orange-200/50 text-orange-700 rounded-full text-[7px] font-bold uppercase tracking-tighter border border-orange-300">Últ. Compra</span>
                        </div>
                    </div>

                    <div class="flex flex-col bg-white border border-slate-200 rounded-[3px] p-1.5 px-2 shadow-sm relative overflow-hidden">
                        <span class="text-[8px] font-black text-slate-500 uppercase tracking-wider">Contábil</span>
                        <div class="flex items-center justify-between mt-1">
                            <span class="font-mono text-slate-800 font-black text-[11px]">R$ 0,00</span>
                            <span class="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[7px] font-bold uppercase tracking-tighter border border-slate-200">Fiscal</span>
                        </div>
                    </div>

                    <div class="flex flex-col bg-slate-50 border border-slate-200 rounded-[3px] p-1.5 px-2 shadow-sm relative overflow-hidden">
                        <span class="text-[8px] font-black text-slate-600 uppercase tracking-wider">Gerencial</span>
                        <div class="flex items-center justify-between mt-1">
                            <span class="font-mono text-slate-800 font-black text-[11px]">R$ 0,00</span>
                            <span class="px-1.5 py-0.5 bg-slate-200/50 text-slate-700 rounded-full text-[7px] font-bold uppercase tracking-tighter border border-slate-300">S/ Imposto</span>
                        </div>
                    </div>

                    <div class="flex flex-col bg-slate-50 border border-slate-200 rounded-[3px] p-1 shadow-sm justify-center">
                        <div class="flex items-center justify-between px-1">
                            <span class="text-[8px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1"><span class="material-symbols-outlined !text-[11px]">local_shipping</span> Frete</span>
                            <span class="font-mono text-slate-900 font-black text-[11px]">0.00%</span>
                        </div>
                        <div class="flex items-center justify-between border-t border-slate-200 mt-0.5 pt-0.5 px-1">
                            <span class="text-[8px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1"><span class="material-symbols-outlined !text-[11px]">receipt</span> Despesa</span>
                            <span class="font-mono text-slate-900 font-black text-[11px]">0.00%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SUB-BLOCO: CANAIS DE VENDA -->
            <div class="sig-fieldset-blueprint flex-[1] sig-fieldset-flush">
                <span class="sig-legend-blueprint">Canais de Venda / Preços</span>
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-slate-200 text-[9px] text-slate-600 font-bold border-b border-slate-300">
                            <th class="text-left py-1 pl-2">Tabela</th>
                            <th class="text-center py-1 w-12">MKP%</th>
                            <th class="text-right py-1 pr-2 w-24">Preço R$</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-slate-100">
                            <td class="py-1 px-2 text-[10px] font-semibold text-slate-700">Balcão</td>
                            <td><input type="text" id="prod-mkp-balcao" class="sig-input-dense w-12 text-center !h-6 !text-[10px]" value="100" onchange="window.recalcularPrecos()"></td>
                            <td class="px-2"><input type="text" id="prod-venda" class="sig-input-dense w-full sig-price-input sig-box-green !h-6 !text-[11px]" value="0,00" onfocus="this.select()" onchange="window.recalcularMKP('balcao')"></td>
                        </tr>
                        <tr>
                            <td class="py-1 px-2 text-[10px] font-semibold text-slate-700">Oficina</td>
                            <td><input type="text" id="prod-mkp-oficina" class="sig-input-dense w-12 text-center !h-6 !text-[10px]" value="100" onchange="window.recalcularPrecos()"></td>
                            <td class="px-2 pb-1 pt-0.5"><input type="text" id="prod-preco-oficina" class="sig-input-dense w-full sig-price-input sig-box-green !h-6 !text-[11px]" value="0,00" onchange="window.recalcularMKP('oficina')"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- HISTÓRICO DE MOVIMENTAÇÃO -->
        <div id="painel-historico-bloco" class="sig-fieldset-blueprint flex flex-col mt-1 flex-1 min-h-[5rem] relative border-slate-200 transition-opacity duration-300">
            <span class="sig-legend-blueprint flex items-center gap-1">
                <span class="material-symbols-outlined !text-[14px]">history</span> Histórico de Movimentação
            </span>
            <div class="flex-1 overflow-y-auto w-full bg-slate-50 relative border border-slate-200 rounded-sm mt-1 custom-scrollbar">
                <table class="sig-table sig-table-sm w-full table-fixed border-none">
                    <thead class="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                            <th class="w-24 text-center">Data / Hora</th>
                            <th class="w-20 text-center border-l border-slate-200">Tipo</th>
                            <th class="text-left border-l border-slate-200">Descrição / Doc Origem</th>
                            <th class="w-16 text-right border-l border-slate-200">Qtde</th>
                            <th class="w-20 text-right border-l border-slate-200">Saldo</th>
                            <th class="w-24 text-left px-2 border-l border-slate-200">Usuário</th>
                        </tr>
                    </thead>
                    <tbody id="tb-movimentacao" class="divide-y divide-slate-100">
                        <tr class="bg-white"><td colspan="6" class="text-center text-slate-400 py-6 text-[10px] italic border-none">Produto novo ou sem movimentações.</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- COLUNA DIREITA (VISUAL E INVENTÁRIO) -->
    <div class="w-[30%] flex flex-col gap-1.5 h-full overflow-y-auto pl-1 border-l border-slate-200">
        <div class="sig-fieldset-blueprint shrink-0">
            <span class="sig-legend-blueprint">Visual do Produto</span>
            <div class="flex flex-col gap-1.5 w-full">
                <div id="img-grid-produto" class="flex flex-wrap gap-2 w-full bg-slate-50 p-2 border border-slate-200 rounded-sm shadow-inner min-h-[7.5rem]">
                    <!-- Vazio será injetado pelo JS -->
                </div>
                <button type="button" onclick="window.addProdutoImg()" class="w-full bg-white border border-slate-300 border-dashed hover:bg-slate-50 hover:border-blue-400 text-slate-500 hover:text-blue-600 font-bold px-3 py-1.5 text-[10px] rounded-sm shadow-sm flex items-center justify-center gap-1.5 transition-colors">
                    <span class="material-symbols-outlined !text-[14px]">add_photo_alternate</span> Adicionar Imagem
                </button>
            </div>
        </div>

        <div id="painel-inventario-bloco" class="sig-fieldset-blueprint shrink-0 border-orange-200 bg-orange-50/20">
            <span class="sig-legend-blueprint !text-orange-600 flex items-center gap-1"><span class="material-symbols-outlined !text-[14px]">location_on</span> Inventário & Saldos</span>
            <div class="flex flex-col gap-1.5 p-1 text-slate-800">
                <div class="flex gap-1.5 items-end">
                    <div class="flex-1">
                        <label class="sig-label-dense opacity-70">Localização</label>
                        <input type="text" id="prod-localizacao" class="sig-input-dense w-full font-mono font-bold text-orange-700 bg-white uppercase text-[10px]" placeholder="G01-T01-E01-P01">
                    </div>
                </div>

                <!-- TABELA DE DISCRIMINAÇÃO DE SALDOS -->
                <div class="flex-1 overflow-y-auto w-full bg-white relative min-h-0 border border-slate-200 rounded-sm mt-0.5">
                    <table class="sig-table sig-table-sm w-full">
                        <thead class="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                            <tr>
                                <th class="text-left">Depósito / Área</th>
                                <th class="text-right border-l border-slate-200">Saldo</th>
                            </tr>
                        </thead>
                        <tbody id="tb-inventario-saldos">
                            <tr class="bg-white"><td colspan="2" class="text-center text-slate-400 py-4 text-[9px] italic border-none bg-slate-50/50">Produto novo ou sem saldo físico no momento.</td></tr>
                        </tbody>
                        <tfoot class="bg-blue-50 font-extrabold border-t-2 border-blue-200 text-blue-900">
                            <tr>
                                <td class="py-1.5 px-2 uppercase tracking-wider text-[9px]">Saldo Total em Estoque:</td>
                                <td class="py-1.5 px-2 text-right font-mono text-[11px]"><span id="prod-total-estoque" class="font-black">0</span> <span class="text-[8px] font-normal text-slate-400 unit-sigla-label">UN</span></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>

        <!-- BLOCO 3: REFERÊNCIAS CRUZADAS (SIMILARES) -> CORREÇÃO DE COR E POSIÇÃO -->
        <div class="sig-fieldset-blueprint flex flex-col mt-3 flex-1 min-h-0 !px-1 relative border-blue-200">
            <span class="sig-legend-blueprint !text-sig-blue !bg-white px-2 py-0.5 font-bold flex items-center gap-1 z-50">
                <span class="material-symbols-outlined !text-[14px]">link</span> Similares
            </span>
            <div id="container-similares-cadastro" class="flex-1 overflow-y-auto w-full bg-slate-50 relative border border-slate-200 rounded-sm mt-1">
                <table class="sig-table sig-table-sm w-full table-fixed border-none">
                    <thead class="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                            <th class="text-left">Marca</th>
                            <th class="text-left border-l border-slate-200 w-[50%]">Código</th>
                            <th class="w-8 border-l border-slate-200"></th>
                        </tr>
                    </thead>
                    <tbody id="tb-similares" class="divide-y divide-slate-100">
                        <tr class="bg-white"><td colspan="3" class="text-center text-slate-400 py-6 text-[9px] italic border-none">Nenhuma referência</td></tr>
                    </tbody>
                </table>
            </div>
            <div class="p-1 px-2 bg-slate-50 border-x border-b border-slate-300 rounded-b-sm">
                <button type="button" onclick="window.abrirModalAddSimilar()" class="w-full bg-white border border-slate-300 hover:bg-blue-50 text-sig-blue font-bold py-1 text-[9px] rounded-sm shadow-sm flex items-center justify-center gap-1 transition-colors">
                    <span class="material-symbols-outlined !text-[12px]">add_link</span> Adicionar Referência Similar
                </button>
            </div>
        </div>
    </div>
</div>

        <footer class="h-[46px] bg-[#e2e8f0] border-t border-[#cbd5e1] flex items-center justify-end px-4 gap-3">
            <button onclick="window.fecharCadastroProduto()" class="sig-btn sig-btn-neutral">
                <span class="material-symbols-outlined !text-[16px]">undo</span> Cancelar
            </button>
            <button onclick="window.salvarProduto()" class="sig-btn sig-btn-primary px-8">
                <span class="material-symbols-outlined !text-[18px]">save</span> Gravar (F5)
            </button>
        </footer>
    </div>
</div>
`;

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
            selUnid.innerHTML = units.map(u => `<option value="${u.id}">${u.sigla} - ${u.descricao}</option>`).join('');
        }

        // Perfis Fiscais (V55)
        const selPerfil = document.getElementById('prod-perfil-fiscal-id');
        if (selPerfil) {
            const perfis = await window.goEngine.main.App.ListarPerfisFiscais();
            selPerfil.innerHTML = '<option value="0">SELECIONE O GRUPO FISCAL...</option>' + 
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
    const pos = document.getElementById('prod-posicao').value;
    const lado = document.getElementById('prod-lado').value;
    const sku = document.getElementById('prod-sku').value;
    const cat = document.getElementById('prod-categoria-id').options[document.getElementById('prod-categoria-id').selectedIndex].text;
    
    let desc = "";
    if (cat && cat !== 'SELECIONE...') desc = cat;
    if (pos && pos !== 'N/A') desc += " " + pos;
    if (lado && lado !== 'N/A') desc += " " + lado;
    
    document.getElementById('prod-descricao').value = desc.trim().toUpperCase();
};

window.abrirCadastroProduto = async function (isEdit = false, p = null) {
    console.log("🚀 Abrindo Cadastro de Produto (isEdit=" + isEdit + ")");
    const modal = document.getElementById('modal-cadastro');
    if (!modal) {
        alert("CRÍTICO: Modal #modal-cadastro não encontrado no DOM!");
        return;
    }
    window.isEditModeGlobal = isEdit;
    
    // Reset Total
    document.querySelectorAll('#modal-cadastro input').forEach(i => {
        if (!i.readOnly && !i.id.includes('mkp-')) i.value = "";
    });

    document.getElementById('prod-id').value = "NOVO";
    document.getElementById('prod-custo').value = "0,00";
    document.getElementById('prod-venda').value = "0,00";
    document.getElementById('prod-mkp-balcao').value = "100";
    if(document.getElementById('prod-mkp-externo')) document.getElementById('prod-mkp-externo').value = "100";
    document.getElementById('prod-mkp-oficina').value = "100";
    document.getElementById('prod-fator-conversao').value = "1.0000";
    document.getElementById('prod-peso').value = "0.000";
    document.getElementById('prod-altura').value = "0.00";
    document.getElementById('prod-largura').value = "0.00";
    document.getElementById('prod-comprimento').value = "0.00";
    
    if (isEdit && p) {
        document.getElementById('titulo-cadastro').innerText = "F3 - EDITAR PRODUTO";
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-sku').value = p.sku;
        document.getElementById('prod-descricao').value = p.descricao_tecnica;
        document.getElementById('prod-nome-popular').value = p.nome_popular || "";
        document.getElementById('prod-marca-id').value = p.marca_id;
        document.getElementById('prod-categoria-id').value = p.categoria_id;
        document.getElementById('prod-codigo-barra').value = p.ean || "";
        document.getElementById('prod-localizacao').value = p.localizacao || "";

        window.onCategoriaChange();
        setTimeout(() => { 
            document.getElementById('prod-subcategoria-id').value = p.subcategoria_id;
        }, 300);

        document.getElementById('prod-custo').value = p.custo.toLocaleString('pt-BR', {minimumFractionDigits: 2});
        document.getElementById('prod-venda').value = p.venda.toLocaleString('pt-BR', {minimumFractionDigits: 2});
        
        document.getElementById('prod-unidade-id').value = p.unidade_id || 0;
        document.getElementById('prod-fator-conversao').value = p.fator_conversao || "1.0000";
        document.getElementById('prod-peso').value = p.peso || "0.000";
        document.getElementById('prod-altura').value = p.altura || "0.00";
        document.getElementById('prod-largura').value = p.largura || "0.00";
        document.getElementById('prod-comprimento').value = p.comprimento || "0.00";

        // Campos Fiscais (V55)
        document.getElementById('prod-ncm').value = p.ncm || "";
        document.getElementById('prod-cest').value = p.cest || "";
        document.getElementById('prod-origem').value = p.origem || 0;
        document.getElementById('prod-perfil-fiscal-id').value = p.perfil_fiscal_id || 0;
        
        // Indicadores (Checkboxes)
        if(document.getElementById('prod-tem-icms')) document.getElementById('prod-tem-icms').checked = p.tem_icms === undefined ? true : p.tem_icms;
        if(document.getElementById('prod-tem-st')) document.getElementById('prod-tem-st').checked = p.tem_st === undefined ? false : p.tem_st;
        if(document.getElementById('prod-tem-ipi')) document.getElementById('prod-tem-ipi').checked = p.tem_ipi === undefined ? false : p.tem_ipi;
        if(document.getElementById('prod-tem-pis-cofins')) document.getElementById('prod-tem-pis-cofins').checked = p.tem_pis_cofins === undefined ? true : p.tem_pis_cofins;
    } else {
        document.getElementById('titulo-cadastro').innerText = "F3 - NOVO PRODUTO";
        try {
            const prox = await window.goEngine.main.App.ObterProximoIdProduto();
            document.getElementById('prod-id').value = String(prox).padStart(4, '0');
        } catch(e) {}
    }

    const inv = document.getElementById('painel-inventario-bloco');
    if (inv) isEdit ? inv.classList.remove('hidden') : inv.classList.add('hidden');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => { document.getElementById('prod-sku').focus(); }, 100);
};

window.fecharCadastroProduto = function () {
    document.getElementById('modal-cadastro').classList.add('hidden');
    document.getElementById('modal-cadastro').classList.remove('flex');
};

window.salvarProduto = async function () {
    const moneyToFloat = (v) => parseFloat(v.replace('.', '').replace(',', '.')) || 0;
    const payload = {
        id: window.isEditModeGlobal ? parseInt(document.getElementById('prod-id').value) : 0,
        sku: document.getElementById('prod-sku').value.trim().toUpperCase(),
        ean: document.getElementById('prod-codigo-barra').value.trim(),
        descricao_tecnica: document.getElementById('prod-descricao').value.trim().toUpperCase(),
        nome_popular: document.getElementById('prod-nome-popular').value.trim().toUpperCase(),
        marca_id: parseInt(document.getElementById('prod-marca-id').value) || 0,
        categoria_id: parseInt(document.getElementById('prod-categoria-id').value) || 0,
        subcategoria_id: parseInt(document.getElementById('prod-subcategoria-id').value) || 0,
        custo: moneyToFloat(document.getElementById('prod-custo').value),
        venda: moneyToFloat(document.getElementById('prod-venda').value),
        localizacao: document.getElementById('prod-localizacao').value.trim().toUpperCase(),
        unidade_id: parseInt(document.getElementById('prod-unidade-id').value) || 0,
        fator_conversao: parseFloat(document.getElementById('prod-fator-conversao').value) || 1,
        peso: parseFloat(document.getElementById('prod-peso').value) || 0,
        altura: parseFloat(document.getElementById('prod-altura').value) || 0,
        largura: parseFloat(document.getElementById('prod-largura').value) || 0,
        comprimento: parseFloat(document.getElementById('prod-comprimento').value) || 0,

        // Campos Fiscais (V55 - Base Cadastral e Perfil)
        ncm: document.getElementById('prod-ncm').value.trim(),
        cest: document.getElementById('prod-cest').value.trim(),
        origem: parseInt(document.getElementById('prod-origem').value) || 0,
        perfil_fiscal_id: parseInt(document.getElementById('prod-perfil-fiscal-id').value) || 0,
        tem_icms: document.getElementById('prod-tem-icms') ? document.getElementById('prod-tem-icms').checked : true,
        tem_st: document.getElementById('prod-tem-st') ? document.getElementById('prod-tem-st').checked : false,
        tem_ipi: document.getElementById('prod-tem-ipi') ? document.getElementById('prod-tem-ipi').checked : false,
        tem_pis_cofins: document.getElementById('prod-tem-pis-cofins') ? document.getElementById('prod-tem-pis-cofins').checked : true,

        // Legados (Esvaziados na nova estrutura de pré-cadastro)
        cfop: "",
        cst_csosn: "",
        aliquota_icms: 0,
        aliquota_ipi: 0,
        aliquota_pis: 0,
        aliquota_cofins: 0,
        reducao_bc: 0
    };

    if (!payload.sku || !payload.descricao_tecnica) return alert("SKU e Descrição são obrigatórios.");
    try {
        const res = await window.goEngine.main.App.SalvarProduto(payload);
        if (res.startsWith("OK")) {
            window.fecharCadastroProduto();
            window.dispatchEvent(new CustomEvent('produtoSalvo'));
        } else alert(res);
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
        const response = await fetch(`https://api.sig-blueprint.com/v1/parts/catalog/${sku}`);
        if (!response.ok) throw new Error("Produto não encontrado no catálogo online.");
        const data = await response.json();
        window.dadosCatalogoAtual = data;

        // Render Geral
        const pane = document.getElementById('cat-pane-principal');
        pane.innerHTML = `
            <div class="flex gap-4">
                <div class="w-24 h-24 bg-slate-100 rounded border flex items-center justify-center">
                    <img src="${data.imagem || ''}" class="max-w-full max-h-full object-contain" onerror="this.src='https://placehold.co/100x100?text=S/I'">
                </div>
                <div class="flex-1">
                    <h4 class="text-blue-900 font-extrabold text-sm uppercase">${data.descricao || 'NOME INDISPONÍVEL'}</h4>
                    <p class="text-[10px] text-slate-500 font-bold mt-1">FABRICANTE: <span class="text-slate-700">${data.fabricante || '-'}</span></p>
                    <p class="text-[10px] text-slate-500 font-bold">CÓDIGO: <span class="text-blue-700 font-mono">${data.codigo || '-'}</span></p>
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
        document.getElementById('btn-importar-catalogo').classList.remove('hidden');
    } catch (e) {
        document.getElementById('erro-catalogo-msg').innerText = e.message;
        document.getElementById('erro-catalogo').classList.remove('hidden');
    } finally {
        document.getElementById('loading-catalogo').classList.add('hidden');
    }
};

window.importarDadosCatalogo = function() {
    if(!window.dadosCatalogoAtual) return;
    const d = window.dadosCatalogoAtual;
    document.getElementById('prod-sku').value = d.codigo;
    document.getElementById('prod-descricao').value = d.descricao;
    document.getElementById('prod-codigo-barra').value = d.ean || "";
    
    if (d.imagem) {
        document.getElementById('img-container-produto').innerHTML = `<img src="${d.imagem}" class="w-full h-full object-contain">`;
    }

    window.fecharBuscaCatalogo();
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
    tr.innerHTML = `<td class="text-[10px] px-2 py-1 font-bold">${m}</td><td class="text-xs px-2 py-1 text-blue-900 font-bold">${core}</td><td class="text-[10px] px-2 py-1">${motor}</td><td class="text-xs text-center font-bold">${ini}</td><td class="text-xs text-center font-bold">${fim}</td><td class="text-center px-1"><button onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600"><span class="material-symbols-outlined text-[16px]">delete</span></button></td>`;
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

const initModaisF3 = () => {
    console.log("🛠️ SIG: Injetando modais F3...");
    if (document.getElementById('modal-cadastro')) return;
    
    document.body.insertAdjacentHTML('beforeend', ModalProdutoHTML);
    document.body.insertAdjacentHTML('beforeend', ModalBuscaCatalogoHTML);
    document.body.insertAdjacentHTML('beforeend', ModalAddAplicacaoHTML);
    
    if (typeof initSplittersProduto === 'function') initSplittersProduto();
    console.log("✅ SIG: Modais F3 injetados com sucesso.");
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModaisF3);
} else {
    initModaisF3();
}
