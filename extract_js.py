import os

exe_path = r"C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe"
out_dir = r"C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\extracted_from_exe"

try:
    with open(exe_path, "rb") as f:
        data = f.read()

    # Search for occurrences of 'modal_produto.js'
    # Embed.FS stores filenames near their content
    
    idx = 0
    match_count = 0
    while True:
        idx = data.find(b"modal_produto.js", idx)
        if idx == -1:
            break
            
        print(f"Found signature at offset {idx}")
        start = max(0, idx - 500)
        end = min(len(data), idx + 100000)
        
        chunk = data[start:end]
        
        with open(os.path.join(out_dir, f"modal_produto_chunk_{match_count}.txt"), "wb") as out:
            out.write(chunk)
            
        match_count += 1
        idx += 10

    print("Extraction complete.")
except Exception as e:
    print(f"Error: {e}")
