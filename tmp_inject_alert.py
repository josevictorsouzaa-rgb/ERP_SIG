
target = "frontend/paginas/hub/hub.html"
with open(target, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("} catch (e) { console.error(e); }", "} catch (e) { alert(\"ERRO no carregarOperador: \" + e); console.error(e); }")
text = text.replace("const usr = await goEngine.main.App.GetOperadorLogado();", "alert(\"Buscando usr...\"); const usr = await goEngine.main.App.GetOperadorLogado(); alert(\"usr=\" + JSON.stringify(usr));")

with open(target, "w", encoding="utf-8") as f:
    f.write(text)
