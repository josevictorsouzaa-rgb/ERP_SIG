import os
import re

exe_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe'
with open(exe_path, 'rb') as f:
    data = f.read()

def carve(tag_id, outfile):
    idx = data.find(('id="' + tag_id + '"').encode('utf-8'))
    if idx == -1: return 'NOT FOUND'
    chunk = data[max(0, idx-1000):idx+50000].decode('utf-8', errors='ignore')
    
    m = re.search(r'<div\s+id=[\'\"]' + tag_id + r'[\'\"].*?>', chunk)
    if not m: return 'Tag not properly found'
    start = m.start()
    
    count = 0
    end = -1
    for m_tag in re.finditer(r'</?div[^>]*>', chunk[start:]):
        tag_str = m_tag.group(0)
        if tag_str.startswith('</div'):
            count -= 1
        else:
            count += 1
            
        if count == 0:
            end = start + m_tag.end()
            break
            
    if end == -1: return 'Closing div not found'
    
    final_content = chunk[start:end]
    filepath = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\fiscal\modais\\' + outfile
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as cout:
        cout.write(final_content)
    return 'Saved to ' + outfile

print('Fiscal:', carve('modal-fiscal', 'modal_perfil_fiscal.html'))
print('Matriz:', carve('modal-matriz-fiscal', 'modal_matriz_fiscal.html'))
print('Aliquota:', carve('modal-aliquota-fiscal', 'modal_aliquota_fiscal.html'))
