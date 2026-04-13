import re

with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_code = f.read()

# I want to replace things like:
# if(confirm("Mensagem...")) {
# to:
# if(await window.goEngine.main.App.MostrarConfirmacao("Confirmação", "Mensagem...")) {

js_code = re.sub(r'confirm\((["\'])(.*?)(["\'])\)', r'await (window.goEngine || window.go).main.App.MostrarConfirmacao("Confirmação de Ação", "\2")', js_code)

with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
    f.write(js_code)
