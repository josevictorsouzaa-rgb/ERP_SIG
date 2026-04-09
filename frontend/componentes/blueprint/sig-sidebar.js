class SigSidebar extends HTMLElement {
    connectedCallback() {
        const activeItem = this.getAttribute('active-item') || '';
        
        // Helper string interpolation
        const isActive = (name) => activeItem.toUpperCase() === name.toUpperCase() ? 'ativa' : '';

        this.innerHTML = `
        <aside class="sig-sidebar-blueprint shrink-0 h-full">
            <div class="sig-sidebar-header-blueprint">
                <span class="material-symbols-outlined text-sig-brand-cyan !text-[18px] mr-2">settings_suggest</span>
                <span>Navegação Mestre</span>
            </div>
            <nav class="flex-1 overflow-y-auto pt-2">
                <div class="mt-1 px-4 py-2">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Administração</p>
                </div>
                <div class="sig-menu-item-blueprint ${isActive('Empresas')}">
                    <span>Empresas</span>
                    <span class="sig-shortcut">F2</span>
                </div>
                <div class="sig-menu-item-blueprint ${isActive('Parâmetros')}">
                    <span>Parâmetros</span>
                    <span class="sig-shortcut">F3</span>
                </div>
                <div class="sig-menu-item-blueprint ${isActive('Perfil Fiscal')}">
                    <a href="../fiscal/fiscal.html" class="flex-1">Perfil Fiscal</a>
                    <span class="sig-shortcut">F4</span>
                </div>
                <div class="mt-4 px-4 py-2 border-t border-slate-100">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Financeiro</p>
                </div>
                <div class="sig-menu-item-blueprint ${isActive('Plano Contas')}">
                    <span>Plano Contas</span>
                </div>
                <div class="sig-menu-item-blueprint ${isActive('Centros Custo')}">
                    <span>Centros Custo</span>
                </div>
                <div class="mt-4 px-4 py-2 border-t border-slate-100">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estoque & Compras</p>
                </div>
                <div class="sig-menu-item-blueprint ${isActive('Entradas')}">
                    <a href="../entradas/entradas.html" class="flex-1">Entradas e NF-e</a>
                </div>
            </nav>
        </aside>
        `;
    }
}
customElements.define('sig-sidebar', SigSidebar);
