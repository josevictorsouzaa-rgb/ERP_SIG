import sys
import re

modal_js_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\componentes\modal_produto.js'
fragment_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\componentes\cadastro_form_fragmento.html'

with open(fragment_path, 'r', encoding='utf-8') as f:
    fragment_html = f.read()

with open(modal_js_path, 'r', encoding='utf-8') as f:
    modal_js = f.read()

pattern2 = re.compile(r'(<!-- CORPO DO CADASTRO -->).*?(<footer class="h-\[46px\] bg-\[#e2e8f0\])', re.IGNORECASE | re.DOTALL)
match2 = pattern2.search(modal_js)
if match2:
    new_js = modal_js[:match2.start(1)] + '<!-- CORPO DO CADASTRO -->\n        ' + fragment_html + '\n\n        ' + modal_js[match2.start(2):]
    with open(modal_js_path, 'w', encoding='utf-8') as out:
        out.write(new_js)
    print('INJECTED PERFECTLY INSIDE JS WRAPPER')
else:
    print('Pattern not found')
