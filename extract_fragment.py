import sys
import re

exe_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\SIG_V79_SOLUCAO_CNPJ.exe'
with open(exe_path, 'rb') as f:
    data = f.read()

start_marker = b'<!-- FRAGMENTO: FORMUL'
start_pos = data.find(start_marker)

if start_pos == -1:
    print('Start marker not found')
    sys.exit(1)

# Find the exact opening div of the fragment
start_html = data.find(b'<div class="flex-1', start_pos)

# Find the exact closing div. We know it ends before <!DOCTYPE html>
end_search_limit = data.find(b'<!DOCTYPE html>', start_html)
if end_search_limit == -1: end_search_limit = start_html + 30000

# To avoid corrupted trailing bytes, let's find the last </div> before the limit!
last_div = data.rfind(b'</div>', start_html, end_search_limit)

clean_bytes = data[start_html:last_div + 6]
try:
    clean_str = clean_bytes.decode('utf-8')
except Exception as e:
    print('Still UTF-8 Error:', e)
    clean_str = clean_bytes.decode('utf-8', errors='replace')

with open(r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\componentes\cadastro_form_fragmento.html', 'w', encoding='utf-8') as out:
    out.write(clean_str.strip())
print('PERFECT FRAGMENT EXTRACTED')
