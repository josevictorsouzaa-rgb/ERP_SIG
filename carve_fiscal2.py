
import os
exe_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe'
dest_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\fiscal\fiscal.js'

with open(exe_path, 'rb') as f:
    data = f.read()

idx = data.find(b'async function carregarPerfis()')
if idx != -1:
    chunk = data[max(0, idx-500):idx+30000].decode('utf-8', errors='ignore')
    
    start_idx = chunk.find('let perfis =')
    if start_idx == -1: 
        start_idx = chunk.find('// FISCAL')
    if start_idx == -1:
        start_idx = chunk.find('async function carregarPerfis')
        
    end_idx = chunk.find('</script>', start_idx)
    if end_idx != -1:
        chunk = chunk[max(0, start_idx-20):end_idx]
    else:
        # just cut it off safely 
        end_idx = chunk.find('<!DOCTYPE html>')
        if end_idx != -1:
            chunk = chunk[max(0, start_idx-20):end_idx]
        else:
            chunk = chunk[max(0, start_idx):]
            last_brace = chunk.rfind('}')
            if last_brace != -1: chunk = chunk[:last_brace+1]
        
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(chunk)
    print('Fiscal JS saved.')
else:
    print('Could not find carregarPerfis().')

