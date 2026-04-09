import os
exe_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe'
with open(exe_path, 'rb') as f:
    data = f.read()

idx = 0
while True:
    idx = data.find(b"addEventListener('message'", idx)
    if idx == -1: break
    chunk = data[max(0, idx-50):idx+350].decode('utf-8', errors='ignore')
    if 'ABRIR_CADASTRO' in chunk or 'modal-cadastro' in chunk:
        print('ACHOU listener:', idx)
        print(chunk)
        print('-'*40)
    idx += 1

idx2 = 0
while True:
    idx2 = data.find(b'addEventListener("message"', idx2)
    if idx2 == -1: break
    chunk = data[max(0, idx2-50):idx2+350].decode('utf-8', errors='ignore')
    if 'ABRIR_CADASTRO' in chunk or 'modal-cadastro' in chunk:
        print('ACHOU listener (aspas duplas):', idx2)
        print(chunk)
        print('-'*40)
    idx2 += 1
