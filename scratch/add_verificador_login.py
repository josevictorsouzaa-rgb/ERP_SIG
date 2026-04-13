import sys

with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_code = f.read()

new_func = """
window.verificarLoginUsuarios = async function(el) {
    let login = el.value.trim().toLowerCase();
    if (!login) return;
    
    // Obter próprio ID se for edição para não conflitar com a si próprio
    let selfId = parseInt(document.getElementById('usr-id').value) || 0;

    try {
        const engine = window.goEngine || window.go;
        let list = await engine.main.App.ListarUsuarios() || [];
        
        // Verifica duplicidade no front ignorando o próprio id
        let dup = list.find(x => x.login.toLowerCase() === login && x.id !== selfId);
        
        if (dup) {
            if (window.Toast) window.Toast.error("Login escolhido já pertence a outro usuário!");
            el.value = '';
            setTimeout(() => el.focus(), 100);
        }
    } catch(e) {
        console.error("Erro ao validar login", e);
    }
}
"""

if "window.verificarLoginUsuarios" not in js_code:
    js_code += "\n" + new_func
    with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
        f.write(js_code)
