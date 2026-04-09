import os

exe_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe'
with open(exe_path, 'rb') as f:
    data = f.read()

idx_carregar = data.find(b'function carregarPerfis()')
start_idx = data.rfind(b'function mostrarSecao', 0, idx_carregar)

# To find where the JS realistically ends, let's search for "<!-- MODAL PERFIL FISCAL" or something
# We know the first modal extracted starts with "<!--" right before <div id="modal-fiscal"
# Actually we can just search for an HTML comment that indicates the modal:
idx_comment = data.find(b'<!--', idx_carregar)
while True:
    chunk = data[idx_comment:idx_comment+200]
    if b'MODAL PERFIL FISCAL' in chunk or b'modal-fiscal' in chunk:
        end_idx = idx_comment
        break
    idx_comment = data.find(b'<!--', idx_comment+1)
    if idx_comment == -1 or idx_comment > idx_carregar + 100000:
        end_idx = idx_carregar + 50000
        break

chunk = data[start_idx:end_idx].decode('utf-8', errors='ignore')
last_brace = chunk.rfind('}')
final_js = chunk[:last_brace+1]

out_js = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\fiscal\fiscal.js'
with open(out_js, 'w', encoding='utf-8') as cout:
    cout.write(final_js)

print('JS restaurado corretamente. Len:', len(final_js))
