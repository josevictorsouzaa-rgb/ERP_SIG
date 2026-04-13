class SigToolbar extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute('title') || 'Painel de Operação';
        const icon = this.getAttribute('icon') || 'widgets';
        
        // Coleta o HTML de dentro da tag para inseri-lo dentro da área de botões
        const customButtons = this.innerHTML;

        this.innerHTML = `
        <div class="sig-toolbar-blueprint">
            <div class="flex items-center gap-4">
                <h1 class="text-xs font-black text-slate-700 uppercase tracking-tighter flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-700 !text-[18px]">${icon}</span>
                    ${title}
                </h1>
            </div>
            <div class="flex items-center gap-2">
                ${customButtons}
            </div>
        </div>
        `;
    }
}
customElements.define('sig-toolbar', SigToolbar);
