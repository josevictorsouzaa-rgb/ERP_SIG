import sys
import re

modal_js_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\componentes\modal_produto.js'
fragment_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\componentes\cadastro_form_fragmento.html'

with open(fragment_path, 'r', encoding='utf-8') as f:
    fragment_html = f.read()

with open(modal_js_path, 'r', encoding='utf-8') as f:
    modal_js = f.read()

pattern = re.compile(r'(<div class=\"flex-1 overflow-hidden flex gap-2 p-2\">).*?(<!-- RODAPÉ FIXO DO MODAL -->)', re.IGNORECASE | re.DOTALL)
match = pattern.search(modal_js)

if match:
    new_js = modal_js[:match.start(1)] + fragment_html + '\n        ' + modal_js[match.start(2):]
    with open(modal_js_path, 'w', encoding='utf-8') as out:
        out.write(new_js)
    print('INJECTED PERFECTLY INSIDE JS WRAPPER')
else:
    print('Could not find injection point inside modal_produto.js')
