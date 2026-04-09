import os
import re

exe_path = r"C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe"
out_dir = r"C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\extracted_from_exe"

os.makedirs(out_dir, exist_ok=True)

try:
    with open(exe_path, "rb") as f:
        data = f.read()

    # We will search for <!DOCTYPE html> ... </html>
    # Since it might have \x00 or other bytes, we will convert to a safe string representation
    # or just use regex over bytes.

    print(f"Loaded {len(data)} bytes from executable.")
    
    # HTML carving
    pattern = re.compile(b'<!DOCTYPE html>.*?</html>', re.DOTALL | re.IGNORECASE)
    matches = pattern.findall(data)
    
    print(f"Found {len(matches)} HTML files embedded!")
    
    for i, m in enumerate(matches):
        try:
            content = m.decode('utf-8', errors='ignore')
            # Try to guess name from title
            title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
            name = f"recovered_html_{i}.html"
            if title_match:
                # clean filename
                safe_title = "".join([c for c in title_match.group(1) if c.isalpha() or c.isdigit() or c==' ']).rstrip()
                if safe_title:
                    name = f"{safe_title}_{i}.html"
                    
            out_file = os.path.join(out_dir, name)
            with open(out_file, "w", encoding="utf-8") as out:
                out.write(content)
            print(f"Saved: {name}")
            
        except Exception as e:
            print(f"Failed to save match {i}: {e}")

    # Now carve JS files
    # We can look for common JS patterns. E.g. function carregarProdutos() {}
    # Let's search for "function ", "const ", "let ", etc., but that's too broad.
    # Wails JS usually contains window.runtime.EventsOn
    js_pattern = re.compile(b'(?:function |const |let |window\.).*?(?:carregarProdutos|modals|salvar|document\.getElementById).*?}', re.DOTALL)
    
    # Actually, let's just search for the specific strings to find where the JS files begin and end.
    # We know `modal_produto.js`: "abrirModalProduto", "window.abrirModalProduto"
    idx = data.find(b"abrirModalProduto")
    if idx != -1:
        start = max(0, idx - 5000)
        end = min(len(data), idx + 25000)
        chunk = data[start:end].decode('utf-8', errors='ignore')
        with open(os.path.join(out_dir, "modal_produto_chunk.txt"), "w", encoding="utf-8") as out:
            out.write(chunk)
            print("Extracted modal_produto chunk!")

    idx2 = data.find(b"todasRegras = []")
    if idx2 != -1:
         start = max(0, idx2 - 1000)
         end = min(len(data), idx2 + 15000)
         chunk = data[start:end].decode('utf-8', errors='ignore')
         with open(os.path.join(out_dir, "matriz_js_chunk.txt"), "w", encoding="utf-8") as out:
              out.write(chunk)
              print("Extracted matriz.js chunk!")

except Exception as e:
    print(f"Error: {e}")
