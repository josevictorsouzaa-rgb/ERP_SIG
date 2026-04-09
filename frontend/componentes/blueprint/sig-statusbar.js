class SigStatusbar extends HTMLElement {
    async connectedCallback() {
        const terminal = this.getAttribute('terminal') || 'HUB';
        const atalhos = this.getAttribute('atalhos') || '';
        
        let atalhosHtml = '';
        if (atalhos) {
            atalhosHtml = `<span class="text-slate-400">|</span>` + 
                atalhos.split('|').map(a => `<span>${a.trim()}</span>`).join('');
        }

        this.innerHTML = `
    <footer class="bg-slate-200 border-t border-slate-300 shrink-0 w-full mt-auto relative z-50">
        <div class="sig-progress-bar-container w-full h-[3px] bg-slate-200 absolute top-[-3px] left-0 hidden" id="sig-global-progress-bg">
            <div id="sig-global-progress" class="h-full bg-sig-blue" style="width: 0%;"></div>
        </div>
        <div class="flex flex-wrap items-center justify-between px-4 py-1.5 text-[10px] text-slate-600 font-bold uppercase tracking-tight">
            <div class="flex items-center space-x-4">
                <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">terminal</span> TERMINAL: ${terminal}
                </span>
                ${atalhosHtml}
            </div>
            <div class="flex items-center space-x-4 divide-x divide-slate-400">
                <div class="px-3 truncate max-w-[250px]">Usuário: <span id="sig-statusbar-nome" class="font-extrabold" style="color: var(--sig-blue);">CARREGANDO...</span></div>
                <div class="px-3" id="sig-statusbar-relogio">--/--/---- --:--:--</div>
                <div class="px-3">Banco: <span class="text-emerald-600 font-extrabold">PostgreSQL</span></div>
                <div class="px-3 text-slate-400 font-medium lowercase">v2.1.20</div>
            </div>
        </div>
    </footer>
        `;

        setInterval(() => {
            const el = this.querySelector('#sig-statusbar-relogio');
            if (el) el.innerText = new Date().toLocaleString('pt-br');
        }, 1000);

        try {
            const goEngine = window.parent.go || window.go;
            if (goEngine) {
                const usr = await goEngine.main.App.GetOperadorLogado();
                if (usr && usr.nome) {
                    const nomeEl = this.querySelector('#sig-statusbar-nome');
                    if (nomeEl) nomeEl.innerText = `${usr.id} - ${usr.nome} ${usr.sobrenome}`.toUpperCase();
                }
            }
        } catch(e) {}
    }
}
customElements.define('sig-statusbar', SigStatusbar);
