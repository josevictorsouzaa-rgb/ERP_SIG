console.log('🛠️ SIG: modal_fornecedor.js carregado.');

window.ModalFornecedorHTML = `
    <!-- MODAL CADASTRO COMPLETO FORNECEDOR (ESTILO SIG OFICIAL) -->
    <div id="modal-fornecedor-rapido" class="sig-modal-overlay hidden">
        <div class="bg-white w-full max-w-[850px] rounded-md shadow-2xl overflow-hidden border border-slate-400">
            <!-- CABEÇALHO PADRÃO SIG -->
            <div class="bg-slate-50 p-2 px-4 flex justify-between items-center border-b border-slate-300">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-slate-500 text-sm">person</span>
                    <h3 class="text-slate-700 font-bold text-[11px] uppercase tracking-wider">Cadastro de Fornecedor</h3>
                </div>
                <button onclick="fecharCadastroRapidoFornecedor()" class="sig-btn-close !w-7 !h-7">
                    <span class="material-symbols-outlined !text-base">close</span>
                </button>
            </div>

            <!-- AREA DE CONTEÚDO (SEM ABAS, VISUAL ÚNICO) -->
            <div class="flex-1 overflow-hidden flex flex-col bg-slate-50">
                <div class="flex-1 p-5 grid grid-cols-12 gap-5 overflow-hidden">
                    <!-- COLUNA ESQUERDA: FOTOS E DADOS PRINCIPAIS -->
                    <div class="col-span-4 flex flex-col gap-4 overflow-hidden">
                        <!-- LOGO DO FORNECEDOR -->
                        <div class="sig-fieldset bg-white relative shrink-0">
                            <span class="sig-legend text-blue-600">Logo do Fornecedor</span>
                            <div class="flex flex-col items-center justify-center p-4 gap-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm group hover:border-sig-blue transition-colors cursor-pointer relative overflow-hidden h-[180px]"
                                onclick="document.getElementById('forn-logo-input').click()">
                                <input type="file" id="forn-logo-input" class="hidden" accept="image/*"
                                    onchange="previewLogoFornecedor(this)">
                                <img id="forn-logo-preview" class="hidden h-full w-full object-contain">
                                <div id="forn-logo-placeholder" class="flex flex-col items-center text-slate-400 group-hover:text-sig-blue">
                                    <span class="material-symbols-outlined !text-4xl">add_photo_alternate</span>
                                    <span class="text-[9px] font-black uppercase mt-1">Carregar Logotipo</span>
                                </div>
                            </div>
                        </div>

                        <!-- ID E DOCUMENTO -->
                        <div class="sig-fieldset bg-white relative">
                            <span class="sig-legend">Identificação</span>
                            <div class="space-y-3 pt-1">
                                <div class="grid grid-cols-2 gap-2">
                                    <div class="flex flex-col">
                                        <label class="sig-label">Tipo Fornecedor</label>
                                        <div class="flex bg-slate-200/60 p-0.5 rounded-sm border border-slate-300 h-8">
                                            <input type="hidden" id="forn-completo-tipo" value="J">
                                            <button id="btn-tipo-j" type="button" onclick="setTipoFornecedor('J')" class="flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all bg-white text-blue-800 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">Jurídica</button>
                                            <button id="btn-tipo-f" type="button" onclick="setTipoFornecedor('F')" class="flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all text-slate-500">Física</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="sig-label">ID Sistema</label>
                                        <input type="text" id="forn-completo-id" class="sig-input sig-input-dense w-full bg-slate-100 text-center font-mono font-black border-slate-300 text-blue-900" value="0156" readonly>
                                    </div>
                                </div>
                                <div>
                                    <label class="sig-label">CNPJ / CPF *</label>
                                    <div class="flex gap-1">
                                        <input type="text" id="forn-completo-documento" class="sig-input sig-input-dense font-mono flex-1 border-blue-200" placeholder="00.000.000/0000-00" oninput="formatarDocumento(this)">
                                        <button onclick="consultarCNPJFornecedor()" class="sig-btn btn-search-blue px-3 !h-[28px] flex items-center shadow-sm">
                                            <span class="material-symbols-outlined !text-sm">search</span>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label class="sig-label">Inscrição Estadual (IE)</label>
                                    <input type="text" id="forn-completo-ie" class="sig-input sig-input-dense w-full disabled-field" placeholder="DIGITE O NÚMERO OU ISENTO" disabled>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- COLUNA DIREITA: NOMES, ENDEREÇO E CONTATOS -->
                    <div class="col-span-8 flex flex-col gap-4 overflow-hidden">
                        <!-- NOMES -->
                        <div id="section-nomes" class="sig-fieldset bg-white relative shrink-0 sig-fieldset-bloqueado">
                            <span class="sig-legend text-blue-600">Nomes e Marcas</span>
                            <div class="grid grid-cols-2 gap-4 mt-1">
                                <div>
                                    <label class="sig-label">Nome Fantasia (Como conhecemos) *</label>
                                    <input type="text" id="forn-completo-fantasia" class="sig-input sig-input-dense uppercase font-bold text-blue-800" placeholder="EX: AUTO PEÇAS DO JOÃO">
                                </div>
                                <div>
                                    <label class="sig-label">Razão Social (Oficial)</label>
                                    <input type="text" id="forn-completo-razao" class="sig-input sig-input-dense uppercase" placeholder="EX: JOÃO DA SILVA AUTO PEÇAS LTDA">
                                </div>
                            </div>
                        </div>

                        <!-- ENDEREÇO COMPACTO -->
                        <div id="section-endereco" class="sig-fieldset bg-white relative shrink-0 sig-fieldset-bloqueado">
                            <span class="sig-legend">Localização & Logística</span>
                            <div class="grid grid-cols-12 gap-3 mt-1">
                                <div class="col-span-2">
                                    <label class="sig-label">CEP</label>
                                    <input type="text" id="forn-completo-cep" class="sig-input sig-input-dense font-mono text-center" placeholder="00000-000">
                                </div>
                                <div class="col-span-7">
                                    <label class="sig-label">Endereço (Logradouro)</label>
                                    <input type="text" id="forn-completo-endereco" class="sig-input sig-input-dense uppercase" placeholder="RUA, AVENIDA, ETC">
                                </div>
                                <div class="col-span-3">
                                    <label class="sig-label">Número</label>
                                    <input type="text" id="forn-completo-numero" class="sig-input sig-input-dense text-center" placeholder="S/N">
                                </div>
                                <div class="col-span-4">
                                    <label class="sig-label">Bairro</label>
                                    <input type="text" id="forn-completo-bairro" class="sig-input sig-input-dense uppercase" placeholder="NOME DO BAIRRO">
                                </div>
                                <div class="col-span-6">
                                    <label class="sig-label">Cidade (Município)</label>
                                    <input type="text" id="forn-completo-cidade" class="sig-input sig-input-dense uppercase" placeholder="NOME DA CIDADE">
                                </div>
                                <div class="col-span-2">
                                    <label class="sig-label">UF</label>
                                    <input type="text" id="forn-completo-uf" class="sig-input sig-input-dense uppercase text-center" placeholder="UF" maxlength="2">
                                </div>
                            </div>
                        </div>

                        <!-- CONTATOS (GRID DINÂMICO) -->
                        <div id="section-contatos" class="sig-fieldset bg-white relative flex-1 flex flex-col overflow-hidden min-h-[160px] sig-fieldset-bloqueado">
                            <span class="sig-legend text-emerald-600">Canais de Atendimento</span>
                            <div class="grid grid-cols-12 gap-2 mt-1 bg-slate-50 p-2 border border-slate-200 rounded-sm shrink-0">
                                <div class="col-span-4">
                                    <input type="text" id="contato-nome" class="sig-input sig-input-dense w-full uppercase" placeholder="NOME DO VENDEDOR">
                                </div>
                                <div class="col-span-4">
                                    <input type="text" id="contato-tel" class="sig-input sig-input-dense w-full" placeholder="(00) 00000-0000" oninput="formatarTelefone(this)">
                                </div>
                                <div class="col-span-3">
                                    <input type="text" id="contato-dept" class="sig-input sig-input-dense w-full uppercase" placeholder="EX: VENDAS / FINANC">
                                </div>
                                <div class="col-span-1">
                                    <button onclick="adicionarContato()" class="btn-incluir-verde w-full !h-[28px] flex items-center justify-center rounded-sm">
                                        <span class="material-symbols-outlined !text-sm">add</span>
                                    </button>
                                </div>
                            </div>

                            <div class="flex-1 overflow-y-auto mt-2 border border-slate-100 rounded-sm">
                                <table class="sig-table sig-table-sm w-full">
                                    <thead class="sticky top-0 z-10 bg-slate-100">
                                        <tr>
                                            <th>Nome</th>
                                            <th class="w-32 text-center">Telefone</th>
                                            <th class="w-24 text-center">Dept.</th>
                                            <th class="w-10 text-center">...</th>
                                        </tr>
                                    </thead>
                                    <tbody id="lista-contatos-fornecedor">
                                        <!-- Vazio -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 px-6">
                <button onclick="fecharCadastroRapidoFornecedor()" class="sig-btn text-slate-500 hover:bg-slate-200 uppercase text-[10px] font-bold px-6 py-2">Cancelar</button>
                <button onclick="salvarFornecedorRapido()" class="sig-btn sig-btn-primary min-w-[240px] shadow-lg flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined !text-[18px]">save</span>
                    <span class="tracking-widest font-black uppercase text-[10px]">Gravar Fornecedor (F10)</span>
                </button>
            </div>
        </div>
    </div>
`;

// CONTROLE MODAL FORNECEDOR RÁPIDO
        async function abrirCadastroRapidoFornecedor() {
            if (!document.getElementById('modal-fornecedor-rapido')) {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = window.ModalFornecedorHTML;
                document.body.appendChild(wrapper.firstElementChild);
            }
            limparCamposFornecedor();
            document.getElementById('modal-fornecedor-rapido').classList.remove('hidden');
            document.getElementById('modal-fornecedor-rapido').classList.add('flex');
            
            try {
                const goEngine = window.parent.go || window.go;
                const seqId = await goEngine.main.App.GetProximoIDFornecedor();
                document.getElementById('forn-completo-id').value = String(seqId).padStart(4, '0');
            } catch(e) {
                console.error("Erro consultando ID Fornecedor:", e);
                document.getElementById('forn-completo-id').value = "???";
            }

            document.getElementById('forn-completo-documento').focus();
            bloquearCampos(true);
        }

        function fecharCadastroRapidoFornecedor() {
            document.getElementById('modal-fornecedor-rapido').classList.add('hidden');
            document.getElementById('modal-fornecedor-rapido').classList.remove('flex');
            limparCamposFornecedor();
        }

        function bloquearCampos(lock) {
            const sections = ['section-nomes', 'section-endereco', 'section-contatos'];
            sections.forEach(id => {
                const el = document.getElementById(id);
                if (lock) el.classList.add('sig-fieldset-bloqueado');
                else el.classList.remove('sig-fieldset-bloqueado');
            });
            document.getElementById('forn-completo-ie').disabled = lock;
        }

        function setTipoFornecedor(tipo) {
            document.getElementById('forn-completo-tipo').value = tipo;

            // UI Toggle
            const btnJ = document.getElementById('btn-tipo-j');
            const btnF = document.getElementById('btn-tipo-f');

            if (tipo === 'J') {
                btnJ.className = "flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all bg-white text-blue-800 shadow-[0_1px_2px_rgba(0,0,0,0.1)]";
                btnF.className = "flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all text-slate-500";
            } else {
                btnF.className = "flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all bg-white text-blue-800 shadow-[0_1px_2px_rgba(0,0,0,0.1)]";
                btnJ.className = "flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all text-slate-500";
            }

            ajustarMascaraDocumento();
        }

        function ajustarMascaraDocumento() {
            const tipo = document.getElementById('forn-completo-tipo').value;
            const input = document.getElementById('forn-completo-documento');
            input.value = '';
            input.placeholder = tipo === 'J' ? '00.000.000/0000-00' : '000.000.000-00';
            bloquearCampos(true);
        }

        function formatarDocumento(input) {
            let v = input.value.replace(/\D/g, '');
            const tipo = document.getElementById('forn-completo-tipo').value;

            if (tipo === 'J') {
                if (v.length > 14) v = v.slice(0, 14);
                if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
                else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4}).*/, '$1.$2.$3/$4');
                else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{3}).*/, '$1.$2.$3');
                else if (v.length > 2) v = v.replace(/^(\d{2})(\d{3}).*/, '$1.$2');
            } else {
                if (v.length > 11) v = v.slice(0, 11);
                if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
                else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{3}).*/, '$1.$2.$3');
                else if (v.length > 3) v = v.replace(/^(\d{3})(\d{3}).*/, '$1.$2');
            }
            input.value = v;

            // Se atingir o tamanho, abre campos (mesmo sem consulta, caso seja CPF)
            if ((tipo === 'J' && v.replace(/\D/g, '').length === 14) ||
                (tipo === 'F' && v.replace(/\D/g, '').length === 11)) {
                // No caso de CPF, apenas liberamos
                if (tipo === 'F') bloquearCampos(false);
            }
        }

        function formatarTelefone(input) {
            let v = input.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);
            if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
            else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
            else if (v.length > 2) v = v.replace(/^(\d{2})(\d+).*/, '($1) $2');
            input.value = v;
        }

        function limparCamposFornecedor() {
            document.querySelectorAll('#modal-fornecedor-rapido input').forEach(input => input.value = '');
            document.getElementById('forn-logo-preview').classList.add('hidden');
            document.getElementById('forn-logo-placeholder').classList.remove('hidden');
            document.getElementById('lista-contatos-fornecedor').innerHTML = '';
            document.getElementById('forn-completo-tipo').value = 'J';
            ajustarMascaraDocumento();
        }

        function previewLogoFornecedor(input) {
            const preview = document.getElementById('forn-logo-preview');
            const placeholder = document.getElementById('forn-logo-placeholder');
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                    preview.classList.remove('hidden');
                    placeholder.classList.add('hidden');
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

        async function consultarCNPJFornecedor() {
            const doc = document.getElementById('forn-completo-documento').value.replace(/\D/g, '');
            const tipo = document.getElementById('forn-completo-tipo').value;

            if (tipo === 'F') {
                alert("Consulta automática disponível apenas para CNPJ. Preencha os dados manualmente.");
                bloquearCampos(false);
                return;
            }

            if (doc.length < 14) {
                alert("Por favor, digite um CNPJ completo.");
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${doc}`);
                if (!response.ok) throw new Error("CNPJ não encontrado.");

                const data = await response.json();

                bloquearCampos(false);
                document.getElementById('forn-completo-razao').value = data.razao_social;
                document.getElementById('forn-completo-fantasia').value = data.nome_fantasia || data.razao_social;
                document.getElementById('forn-completo-cep').value = data.cep;
                document.getElementById('forn-completo-endereco').value = data.logradouro;
                document.getElementById('forn-completo-numero').value = data.numero;
                document.getElementById('forn-completo-bairro').value = data.bairro;
                document.getElementById('forn-completo-cidade').value = data.municipio;
                document.getElementById('forn-completo-uf').value = data.uf;

                if (data.ddd_telefone_1) {
                    adicionarContatoManual('PRINCIPAL (FEDERAL)', '', data.ddd_telefone_1, 'GERAL');
                }
            } catch (err) {
                alert("Erro: " + err.message);
                bloquearCampos(false); // Libera mesmo se der erro para cadastro manual
            } finally {
                setLoading(false);
            }
        }

        function adicionarContato() {
            const nome = document.getElementById('contato-nome').value;
            const tel = document.getElementById('contato-tel').value;
            const dept = document.getElementById('contato-dept').value;

            if (!nome || !tel) return;

            adicionarContatoManual(nome, '', tel, dept);

            document.getElementById('contato-nome').value = '';
            document.getElementById('contato-tel').value = '';
            document.getElementById('contato-dept').value = '';
        }

        function adicionarContatoManual(nome, email, tel, dept) {
            const tbody = document.getElementById('lista-contatos-fornecedor');
            const tr = document.createElement('tr');
            tr.className = 'group hover:bg-slate-50';
            tr.innerHTML = `
                <td class="font-bold uppercase text-[9px]">${nome}</td>
                <td class="text-center font-mono text-[9px]">${tel}</td>
                <td class="text-center text-[8px] font-black uppercase text-slate-500">${dept}</td>
                <td class="text-center"><span class="material-symbols-outlined text-[14px] text-red-500 cursor-pointer opacity-0 group-hover:opacity-100" onclick="this.closest('tr').remove()">delete</span></td>
            `;
            tbody.appendChild(tr);
        }

        async function salvarFornecedorRapido() {
    setLoading(true);
    const fornecedor = {
        ativo: true,
        tipo_pessoa: document.getElementById('forn-completo-tipo').value || 'J',
        logo: document.getElementById('forn-logo-preview').src.startsWith('data:') ? document.getElementById('forn-logo-preview').src : '',
        documento: document.getElementById('forn-completo-documento').value,
        ie: document.getElementById('forn-completo-ie').value,
        razao_social: document.getElementById('forn-completo-razao').value,
        fantasia: document.getElementById('forn-completo-fantasia').value,
        cep: document.getElementById('forn-completo-cep').value,
        endereco: document.getElementById('forn-completo-endereco').value,
        numero: document.getElementById('forn-completo-numero').value,
        bairro: document.getElementById('forn-completo-bairro').value,
        cidade: document.getElementById('forn-completo-cidade').value,
        uf: document.getElementById('forn-completo-uf').value,
        contatos: JSON.stringify([])
    };

    if (!fornecedor.razao_social && !fornecedor.fantasia) {
        alert('Preencha a Razão Social ou Nome Fantasia.');
        setLoading(false);
        return;
    }

    try {
        const resp = await window.go.main.App.SalvarFornecedor(fornecedor);
        if (resp && resp.startsWith('Erro')) {
            alert(resp);
        } else {
            fecharCadastroRapidoFornecedor();
            if (window.carregarFornecedoresParametros) {
                window.carregarFornecedoresParametros();
            } else if (typeof selecionarFornecedor === 'function') {
                selecionarFornecedor({
                    id: parseInt(resp.replace('ID:', '')),
                    nome: (fornecedor.fantasia || fornecedor.razao_social).toUpperCase(),
                    documento: fornecedor.documento
                });
            }
        }
    } catch (err) {
        alert('Erro ao salvar. Verifique conexão.');
    } finally {
        setLoading(false);
    }
}
function NO_OP() {
            setLoading(true);
            const nome = document.getElementById('forn-completo-fantasia').value || document.getElementById('forn-completo-razao').value;
            const id = document.getElementById('forn-completo-id').value;

            if (!nome) {
                alert("Preencha a Razão Social ou Nome Fantasia.");
                setLoading(false);
                return;
            }

            setTimeout(() => {
                setLoading(false);
                fecharCadastroRapidoFornecedor();
                selecionarFornecedor({
                    id: id,
                    nome: nome.toUpperCase(),
                    documento: document.getElementById('forn-completo-documento').value || '00.000.000/0001-00'
                });
                proximoIdSistema++;
            }, 800);
        }

        