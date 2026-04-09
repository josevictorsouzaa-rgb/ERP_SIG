import re
path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\produtos\produtos.html'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Replace postMessage logic with standard wails href navigation
text = re.sub(
    r"onclick=\"if\(window\.parent !== window\)\{ window\.parent\.postMessage\(\{type:\s*'ABRIR_CADASTRO_PRODUTO'\},.*?\}?\"",
    r"onclick=\"window.location.href='../cadastro_produto/cadastro_produto.html'\"",
    text,
    flags=re.IGNORECASE | re.DOTALL
)

# Replace the runtime.quit on the modal close too?
path_cad = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\cadastro_produto\cadastro_produto.html'
with open(path_cad, 'r', encoding='utf-8', errors='ignore') as f:
    text_cad = f.read()

text_cad = re.sub(
    r"if\s*\(window\.runtime\s*&&\s*window\.runtime\.Quit\)\s*window\.runtime\.Quit\(\);",
    r"window.location.href='../produtos/produtos.html';",
    text_cad,
    flags=re.IGNORECASE
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
    
with open(path_cad, 'w', encoding='utf-8') as f:
    f.write(text_cad)

print('Botoes atualizados com sucesso.')
