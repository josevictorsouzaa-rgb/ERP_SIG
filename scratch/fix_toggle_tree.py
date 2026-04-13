import sys
import re

# 1. Update sig-create-kit.html toggleTree
with open("frontend/assets/design-system/sig-create-kit.html", "r", encoding="utf-8") as f:
    kit_html = f.read()

# Instead of regex for toggleTree, we can just replace the function block if it exists, or insert it.
# Actually, wait, sig-create-kit has the function defined at the end? Let's check where toggleTree is.
# I couldn't find it with grep_search earlier. Let's just define a global script snippet.
kit_html = kit_html.replace(
    "function toggleTree",
    "function old_toggleTree"
)
script_tag = """
<script>
    function toggleTree(id, row) {
        const children = document.querySelectorAll(`.tree-child-${id}`);
        // Find icon inside the clicked row
        const icon = row.querySelector('.icon-tree');
        if(!icon) return;
        
        const isExpanded = icon.classList.contains('rotate-90');
        
        if (isExpanded) {
            icon.classList.remove('rotate-90');
            children.forEach(child => child.classList.add('hidden'));
        } else {
            icon.classList.add('rotate-90');
            children.forEach(child => child.classList.remove('hidden'));
        }
    }
</script>
</body>"""
kit_html = kit_html.replace("</body>", script_tag)

with open("frontend/assets/design-system/sig-create-kit.html", "w", encoding="utf-8") as f:
    f.write(kit_html)

# 2. Update parametros.js toggleTree and HTML mapping
with open("frontend/paginas/parametros/parametros.js", "r", encoding="utf-8") as f:
    js_content = f.read()

# Replace toggleTree logic
js_content = re.sub(
    r"window\.toggleTree = window\.toggleTree \|\| function\(id, row\) \{.*?\n\}",
    """window.toggleTree = window.toggleTree || function(id, row) {
    const children = document.querySelectorAll(`.tree-child-${id}`);
    const icon = row.querySelector(`.icon-tree`);
    if(!icon) return;
    
    const isExpanded = icon.classList.contains('rotate-90');
    if (isExpanded) {
        icon.classList.remove('rotate-90');
        children.forEach(child => child.classList.add('hidden'));
    } else {
        icon.classList.add('rotate-90');
        children.forEach(child => child.classList.remove('hidden'));
    }
}""",
    js_content,
    flags=re.DOTALL
)

# And replace the master row DOM output
js_content = js_content.replace(
    """<span class="material-symbols-outlined text-[#1e40af] text-[20px] transition-transform duration-200" id="icon-cat-${c.id}">keyboard_arrow_down</span>""",
    """<span class="material-symbols-outlined text-[#1e40af] text-[20px] transition-transform duration-200 icon-tree rotate-90" id="icon-cat-${c.id}">chevron_right</span>"""
)

# Replace the master row actions to NOT be green
js_content = js_content.replace(
    """<button class="sig-btn-icon hover:!border-emerald-500 hover:!text-emerald-600 hover:!bg-emerald-50" title="Nova Subcategoria" onclick="abrirModalSubcategoria(${c.id}, '${c.nome}')"><span class="material-symbols-outlined text-[16px]">add</span></button>""",
    """<button class="sig-btn-icon" title="Nova Subcategoria" onclick="abrirModalSubcategoria(${c.id}, '${c.nome}')"><span class="material-symbols-outlined text-[18px]">add</span></button>"""
)

# Replace the master edit/delete sizes to [18px] to match kit
js_content = js_content.replace(
    """<button class="sig-btn-icon" title="Editar" onclick="editarCategoriaObj(${c.id}, '${c.nome}')"><span class="material-symbols-outlined text-[16px]">edit</span></button>""",
    """<button class="sig-btn-icon" title="Editar" onclick="editarCategoriaObj(${c.id}, '${c.nome}')"><span class="material-symbols-outlined text-[18px]">edit</span></button>"""
)
js_content = js_content.replace(
    """<button class="sig-btn-icon hover:!border-red-500 hover:!text-red-600 hover:!bg-red-50" title="Excluir" onclick="excluirCategoria(${c.id})"><span class="material-symbols-outlined text-[16px]">delete</span></button>""",
    """<button class="sig-btn-icon hover:!border-orange-500 hover:!text-orange-600 hover:!bg-orange-50" title="Desabilitar"><span class="material-symbols-outlined text-[18px]">block</span></button>\n                        <button class="sig-btn-icon hover:!border-red-500 hover:!text-red-600 hover:!bg-red-50" title="Excluir" onclick="excluirCategoria(${c.id})"><span class="material-symbols-outlined text-[18px]">delete</span></button>"""
)

# Replace child actions sizes and replace close with block/delete
js_content = js_content.replace(
    """<div class="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="sig-btn-icon hover:!text-[#1e40af] hover:!bg-blue-50 hover:!border-[#1e40af]" title="Editar Subcategoria" onclick="editarSubcategoriaObj(${s.id}, ${c.id}, '${s.nome}')">
                                <span class="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button class="sig-btn-icon hover:!text-red-500 hover:!bg-red-50 hover:!border-red-500" title="Remover Subcategoria" onclick="excluirSubcategoria(${s.id})">
                                <span class="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </div>""",
    """<div class="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button class="sig-btn-icon" title="Editar Subcategoria" onclick="editarSubcategoriaObj(${s.id}, ${c.id}, '${s.nome}')">
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button class="sig-btn-icon hover:!border-orange-500 hover:!text-orange-600 hover:!bg-orange-50" title="Desabilitar Subcategoria" onclick="event.stopPropagation()">
                                <span class="material-symbols-outlined text-[18px]">block</span>
                            </button>
                            <button class="sig-btn-icon hover:!border-red-500 hover:!text-red-600 hover:!bg-red-50" title="Remover Subcategoria" onclick="excluirSubcategoria(${s.id})">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>"""
)

# And now we ensure that the display style uses hidden instead of table-row
js_content = js_content.replace("child.style.display", "// child.style.display")

with open("frontend/paginas/parametros/parametros.js", "w", encoding="utf-8") as f:
    f.write(js_content)
