
import re
with open(r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe', 'rb') as f:
    data = f.read()

# We need to find the full modal_produto.js
# We know it starts with something like ModalProdutoHTML = \
# We can find ModalBuscaCatalogoHTML = \ and initModaisF3()
# Let's search for exactly window.abrirCadastroProduto = async function (isEdit = false, p = null, isReadOnly = false)
match = list(re.finditer(b'isReadOnly = false', data))
if match:
    for idx, m in enumerate(match):
        # Scan backward for the start of the JS
        start = data.rfind(b'const ModalProdutoHTML', 0, m.start())
        if start == -1: start = data.rfind(b'ModalProdutoHTML', 0, m.start())
        # Scan forward for the end of JS
        end = data.find(b'initModaisF3();', m.start()) + 15
        if end > 15:
            js = data[start:end].decode('utf-8', errors='ignore')
            with open(fr'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\componentes\modal_produto.js', 'w', encoding='utf-8') as js_out:
                js_out.write(js)
            print(f'Extracted modal_produto.js completely! Length: {len(js)}')
            break

