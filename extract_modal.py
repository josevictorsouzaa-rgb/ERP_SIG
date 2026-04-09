import os
exe_path = r"C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe"
with open(exe_path, "rb") as f:
    data = f.read()

idx = data.find(b'id="modal-fiscal"')
if idx != -1:
    chunk = data[max(0, idx-5000):idx+50000].decode("utf-8", errors="ignore")
    start = chunk.rfind("<!--", 0, 5000)
    end = chunk.find("</body>", 5000)
    if start == -1: start = 4000
    if end == -1: end = 30000
    
    with open("debug_modal_fiscal.txt", "w", encoding="utf-8") as cout:
        cout.write(chunk[start:end])
    print("Escrito debug_modal_fiscal.txt")
else:
    print("Nao achou")
