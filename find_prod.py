import os
import re

exe_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe'
with open(exe_path, 'rb') as f:
    data = f.read()

# Ache onde está "NOVO PRODUTO (F6)"
idx = data.find(b'NOVO PRODUTO (F6)')
if idx != -1:
    print('Achou NOVO PRODUTO (F6) em:', idx)
    chunk = data[max(0, idx-500):idx+500].decode('utf-8', errors='ignore')
    print(chunk)
else:
    print('Nao achou NOVO PRODUTO (F6)')

# Busque também o Modal de Produto
idx = data.find(b'F3 - NOVO PRODUTO')
if idx != -1:
    print('Achou Modal de Produto F3 em:', idx)
    chunk = data[max(0, idx-500):idx+500].decode('utf-8', errors='ignore')
    print(chunk)
else:
    print('Nao achou modal')
