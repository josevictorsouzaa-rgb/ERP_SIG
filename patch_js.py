import sys

modal_js_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\componentes\modal_produto.js'

with open(modal_js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Fix prod-mkp-externo in abrirCadastroProduto
js = js.replace(
    "document.getElementById('prod-mkp-externo').value = \"100\";",
    "if(document.getElementById('prod-mkp-externo')) document.getElementById('prod-mkp-externo').value = \"100\";"
)

# Fix open checkboxes
js = js.replace(
    "document.getElementById('prod-tem-icms').checked = p.tem_icms === undefined ? true : p.tem_icms;",
    "if(document.getElementById('prod-tem-icms')) document.getElementById('prod-tem-icms').checked = p.tem_icms === undefined ? true : p.tem_icms;"
)
js = js.replace(
    "document.getElementById('prod-tem-st').checked = p.tem_st === undefined ? false : p.tem_st;",
    "if(document.getElementById('prod-tem-st')) document.getElementById('prod-tem-st').checked = p.tem_st === undefined ? false : p.tem_st;"
)
js = js.replace(
    "document.getElementById('prod-tem-ipi').checked = p.tem_ipi === undefined ? false : p.tem_ipi;",
    "if(document.getElementById('prod-tem-ipi')) document.getElementById('prod-tem-ipi').checked = p.tem_ipi === undefined ? false : p.tem_ipi;"
)
js = js.replace(
    "document.getElementById('prod-tem-pis-cofins').checked = p.tem_pis_cofins === undefined ? true : p.tem_pis_cofins;",
    "if(document.getElementById('prod-tem-pis-cofins')) document.getElementById('prod-tem-pis-cofins').checked = p.tem_pis_cofins === undefined ? true : p.tem_pis_cofins;"
)

# Fix saving checkboxes
js = js.replace(
    "tem_icms: document.getElementById('prod-tem-icms').checked,",
    "tem_icms: document.getElementById('prod-tem-icms') ? document.getElementById('prod-tem-icms').checked : true,"
)
js = js.replace(
    "tem_st: document.getElementById('prod-tem-st').checked,",
    "tem_st: document.getElementById('prod-tem-st') ? document.getElementById('prod-tem-st').checked : false,"
)
js = js.replace(
    "tem_ipi: document.getElementById('prod-tem-ipi').checked,",
    "tem_ipi: document.getElementById('prod-tem-ipi') ? document.getElementById('prod-tem-ipi').checked : false,"
)
js = js.replace(
    "tem_pis_cofins: document.getElementById('prod-tem-pis-cofins').checked,",
    "tem_pis_cofins: document.getElementById('prod-tem-pis-cofins') ? document.getElementById('prod-tem-pis-cofins').checked : true,"
)

with open(modal_js_path, 'w', encoding='utf-8') as out:
    out.write(js)
print("JS patches applyed successfully")
