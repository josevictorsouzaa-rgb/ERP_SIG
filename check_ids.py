import re
from bs4 import BeautifulSoup
with open(r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\produtos\produtos.html', 'r', encoding='utf-8') as f:
    data = f.read()

script_contents = ''.join(re.findall(r'<script>(.*?)</script>', data, flags=re.DOTALL | re.IGNORECASE))
js_ids = re.findall(r'document\.getElementById\([\'\"]([^\'\"]+)[\'\"]\)', script_contents)

soup = BeautifulSoup(data, 'html.parser')
html_ids = [tag.get('id') for tag in soup.find_all(id=True)]

missing_in_html = set(js_ids) - set(html_ids)
print('IDs referenced by JS but MISSING in HTML DOM:')
for i in missing_in_html:
    print(' -', i)
