console.log('🛠️ SIG: modal_fornecedor.js carregado.');



// CONTROLE MODAL FORNECEDOR RÁPIDO
        async function abrirCadastroRapidoFornecedor() {
            if (!document.getElementById('modal-fornecedor-rapido')) {
            const res = await fetch('../../componentes/ui_global/formulario_fornecedor_global.html');
            const html = await res.text();
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            document.body.appendChild(wrapper.firstElementChild);
        }
            limparCamposFornecedor();
            document.getElementById('modal-fornecedor-rapido').classList.remove('hidden');
            document.getElementById('modal-fornecedor-rapido').classList.add('flex');
            
            try {
                const goEngine = window.parent.go || window.go;
                const seqId = await goEngine.main.App.GetProximoIDFornecedor();
                // Sem zero a esquerda
                document.getElementById('forn-completo-id').value = String(seqId);
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
                if(document.getElementById('btn-consulta-cnpj')) document.getElementById('btn-consulta-cnpj').classList.remove('hidden');
            } else {
                btnF.className = "flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all bg-white text-blue-800 shadow-[0_1px_2px_rgba(0,0,0,0.1)]";
                btnJ.className = "flex-1 flex items-center justify-center text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-all text-slate-500";
                if(document.getElementById('btn-consulta-cnpj')) document.getElementById('btn-consulta-cnpj').classList.add('hidden');
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

        async function consultarCEPFornecedor() {
            const cepInput = document.getElementById('forn-completo-cep');
            let cep = cepInput.value.replace(/\D/g, '');
            if(cep.length === 8) {
                cepInput.value = cep.slice(0,5) + '-' + cep.slice(5);
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await res.json();
                    if(!data.erro) {
                        document.getElementById('forn-completo-endereco').value = data.logradouro.toUpperCase();
                        document.getElementById('forn-completo-bairro').value = data.bairro.toUpperCase();
                        document.getElementById('forn-completo-cidade').value = data.localidade.toUpperCase();
                        document.getElementById('forn-completo-uf').value = data.uf.toUpperCase();
                        document.getElementById('forn-completo-numero').focus();
                    } else {
                        if(window.Toast) window.Toast.error("CEP não encontrado");
                    }
                } catch(e) {}
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
        id: parseInt(document.getElementById('forn-completo-id').value) || 0,
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
        const goEngine = window.parent.go || window.go || window.top.go;

        // VALIDAÇÃO DE DUPLICIDADE DE DOCUMENTO (CNPJ/CPF)
        if (fornecedor.documento) {
            const ls = await goEngine.main.App.ListarFornecedores();
            if (ls && ls.length > 0) {
                const dup = ls.find(f => f.documento === fornecedor.documento && f.id !== fornecedor.id);
                if (dup) {
                    if (typeof Toast !== 'undefined') {
                        Toast.show('warning', `Cancelado! O CNPJ/CPF ${fornecedor.documento} já pertence a outro fornecedor.`);
                    } else {
                        alert(`O CNPJ/CPF ${fornecedor.documento} já está cadastrado por outro fornecedor!`);
                    }
                    limparCamposFornecedor();
                    setTimeout(() => document.getElementById('forn-completo-documento').focus(), 100);
                    setLoading(false);
                    return;
                }
            }
        }

        const resp = await goEngine.main.App.SalvarFornecedor(fornecedor);
        if (resp && resp.startsWith('Erro')) {
            if (typeof Toast !== 'undefined') Toast.show('error', resp);
            else alert(resp);
        } else {
            if (typeof Toast !== 'undefined') Toast.show('success', 'Fornecedor gravado com sucesso!');
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
        console.error("ERRO COMPLETO DA PONTE WAILS:", err);
        alert('Erro fatal ao salvar [' + err.message + ']. Verifique Logs.');
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

        function setLoading(ativo) {
            const btn = document.getElementById('btn-salvar-modal'); // Assuming global button, or similar
            if(btn) {
                if(ativo) {
                    btn.setAttribute('disabled', 'true');
                    btn.style.opacity = '0.5';
                } else {
                    btn.removeAttribute('disabled');
                    btn.style.opacity = '1';
                }
            }
        }