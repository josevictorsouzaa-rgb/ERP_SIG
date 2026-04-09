import os

exe_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe'
with open(exe_path, 'rb') as f:
    data = f.read()

# Carve fiscal.js
idx = data.find(b'function carregarPerfis()')
# Procure the actual start of fiscal.js
start_idx = data.rfind(b'function mostrarSecao', 0, idx)
if start_idx == -1:
    start_idx = idx - 1000

end_idx = data.find(b'</script>', start_idx) 
if end_idx == -1 or end_idx - start_idx > 50000:
    end_idx = data.find(b'<!DOCTYPE html>', start_idx)

chunk = data[start_idx:end_idx].decode('utf-8', errors='ignore')

# Save to workspace
out_js = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\fiscal\fiscal.js'
with open(out_js, 'w', encoding='utf-8') as cout:
    cout.write(chunk)
print('fiscal.js restaurado, len:', len(chunk))

# Ler modais
m_perfil = open(r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\fiscal\modais\modal_perfil_fiscal.html', encoding='utf-8').read()
m_matriz = open(r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\fiscal\modais\modal_matriz_fiscal.html', encoding='utf-8').read()
m_aliq = open(r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\fiscal\modais\modal_aliquota_fiscal.html', encoding='utf-8').read()

# Inject into fiscal.html
fiscal_html = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\fiscal\fiscal.html'
with open(fiscal_html, 'r', encoding='utf-8') as f:
    html = f.read()

if 'id="modal-fiscal"' not in html:
    html = html.replace('</body>', m_perfil + '\n' + m_matriz + '\n' + m_aliq + '\n</body>')
    with open(fiscal_html, 'w', encoding='utf-8') as f:
        f.write(html)
    print('Modais injetados em fiscal.html')
else:
    print('Modais ja injetados')
