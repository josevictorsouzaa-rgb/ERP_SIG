import os

html_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\produtos\produtos.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Trocar onclick do botao
html = html.replace("if(window.parent !== window){ window.parent.postMessage({type: 'ABRIR_CADASTRO_PRODUTO'}, '*'); }", "if(window.abrirCadastroProduto) { window.abrirCadastroProduto(); } else if (window.parent !== window) { window.parent.postMessage({type: 'ABRIR_CADASTRO_PRODUTO'}, '*'); }")

# Inserir o container
if 'modal-container-produto' not in html:
    injection = """
    <!-- MODAL DE CADASTRO -->
    <div id="modal-container-produto"></div>
    <script src="../../componentes/modal_produto.js"></script>

    <script>
        if (window.ModalProdutoHTML) {
            document.getElementById("modal-container-produto").innerHTML = window.ModalProdutoHTML;
        }
    </script>
</body>"""
    html = html.replace('</body>', injection)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('produtos.html corrigido!')
