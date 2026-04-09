
import re
with open(r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe', 'rb') as f:
    data = f.read()

matches = list(re.finditer(b'function carregarProdutosCentral', data))
for idx, m in enumerate(matches):
    start = data.rfind(b'<!DOCTYPE html>', 0, m.start())
    if start == -1: start = data.rfind(b'<html', 0, m.start())
    end = data.find(b'</html>', m.start()) + 7
    print(f'Match {idx}: Length: {end - start}. Starts at {start}')
    if end - start > 0 and end - start < 200000:
        with open(f'C:\\Users\\DELL G15\\Desktop\\Projetos python\\ERP_SIG\\extracted_prod_{idx}.html', 'wb') as out:
            out.write(data[start:end])

