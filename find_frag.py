import os

exe_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe'
with open(exe_path, 'rb') as f:
    data = f.read()

# Ache "FRAGMENTO: FORMULÁRIO DE CADASTRO MASTER"
idx = data.find(b'<!-- FRAGMENTO: FORMUL\xc3\x81RIO DE CADASTRO MASTER DE PRODUTO')
if idx == -1: idx = data.find(b'<!-- FRAGMENTO: FORMUL')

print('Encontrou FRAGMENTO em:', idx)

if idx != -1:
    chunk = data[idx:idx+8000].decode('utf-8', errors='ignore')
    # Save the chunk temporarily to investigate
    with open(r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\debug_fragment.txt', 'w', encoding='utf-8') as f:
        f.write(chunk)
    print('Salvo em debug_fragment.txt')
