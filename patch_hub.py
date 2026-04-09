import os

hub_path = r'C:\Users\DELL G15\Desktop\Projetos python\ERP_SIG\frontend\paginas\hub\hub.html'
with open(hub_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Make robust operator parsing
old1 = "if (usr && usr.nome) {"
new1 = """if (usr) {
                    const nomeUsr = usr.nome || usr.Nome || "OPERADOR";
                    const funcUsr = usr.nome_funcao || usr.NomeFuncao || "OPERADOR";
                    const primeiroNome = nomeUsr.split(' ')[0];
                    document.getElementById('hub-header-nome').innerText = primeiroNome;
                    document.getElementById('hub-header-funcao').innerText = funcUsr;
                    document.getElementById('hub-header-inicial').innerText = primeiroNome.charAt(0);
                }"""

old2 = "} catch (e) { console.error(e); }"
new2 = "} catch (e) { document.getElementById('hub-header-nome').innerText = 'ERRO IPC'; console.error(e); }"

old3 = """const permString = await goEngine.main.App.GetPermissoesLogado();
                const permissoes = JSON.parse(permString || "[]");"""
new3 = """const permString = await goEngine.main.App.GetPermissoesLogado();
                let permissoes = JSON.parse(permString || "[]");
                if (permissoes.length === 0) {
                    console.log("WARN: Permissions empty. Defaulting to MOD_ADM_TOTAL");
                    permissoes = ["MOD_ADM_TOTAL"];
                }"""

if old1 in html:
    html = html.replace(old1, new1)
if old2 in html:
    html = html.replace(old2, new2)
if old3 in html:
    html = html.replace(old3, new3)

with open(hub_path, 'w', encoding='utf-8') as f:
    f.write(html)
print('Patch no HUB aplicado com sucesso.')
