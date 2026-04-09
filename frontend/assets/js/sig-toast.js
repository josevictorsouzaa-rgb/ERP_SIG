const Toast = {
    icons: {
        warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
        error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
    },

    // Função interna para garantir que o container existe
    _getContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    },

    show(type, message, duration = 4000) {
        const container = this._getContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        toast.innerHTML = `
            <div class="toast__icon">${this.icons[type]}</div>
            <div class="toast__text">${message}</div>
            <button class="toast__close" aria-label="Fechar">${this.icons.close}</button>
            <div class="toast__progress-track">
                <div class="toast__progress-fill" style="animation-duration: ${duration}ms;"></div>
            </div>
        `;

        container.prepend(toast);

        const removeToast = () => {
            if (toast.classList.contains('toast--hiding')) return;
            toast.classList.add('toast--hiding');
            setTimeout(() => {
                toast.remove();
            }, 300); // Aguarda o fim da animação CSS
        };

        toast.querySelector('.toast__close').addEventListener('click', removeToast);

        if (duration > 0) {
            setTimeout(removeToast, duration);
        }
    },

    // Métodos públicos para chamada
    warning(msg, duration) { this.show('warning', msg, duration); },
    info(msg, duration)    { this.show('info', msg, duration); },
    error(msg, duration)   { this.show('error', msg, duration); },
    success(msg, duration) { this.show('success', msg, duration); }
};
