class SigTabs extends HTMLElement {
    constructor() {
        super();
        this.tabs = [];
    }

    connectedCallback() {
        if (!this.hasAttribute('rendered')) {
            this.render();
            this.setAttribute('rendered', 'true');
        }
    }

    render() {
        // Extract tabs from light DOM if they exist (ex: <sig-tab title="Tab 1" active>...</sig-tab>)
        const tabElements = Array.from(this.querySelectorAll('sig-tab-content'));
        this.tabs = tabElements.map((el, i) => ({
            id: `tab-${i}`,
            title: el.getAttribute('title') || `Aba ${i+1}`,
            subtitle: el.getAttribute('subtitle') || '',
            icon: el.getAttribute('icon') || '',
            closable: el.hasAttribute('closable'),
            active: el.hasAttribute('active'),
            content: el.innerHTML
        }));

        if (this.tabs.length > 0 && !this.tabs.some(t => t.active)) {
            this.tabs[0].active = true;
        }

        const isSmall = this.hasAttribute('small');
        const heightClass = isSmall ? 'h-10' : 'h-12';
        const textClass = isSmall ? 'text-[10px]' : 'text-[11px]';

        let headerHtml = `<div class="flex items-end gap-1 border-b border-slate-300 px-4 bg-slate-50 pt-2 w-full overflow-x-auto no-scrollbar">`;
        
        // Home/Menu Button if requested
        if (this.hasAttribute('show-home')) {
            headerHtml += `
                <button class="${heightClass} px-4 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-white rounded-t-md transition-colors border border-transparent mr-2 active-tab-element">
                    <span class="material-symbols-outlined !text-[18px]">home</span>
                </button>
            `;
        }

        this.tabs.forEach((tab, index) => {
            const activeBg = tab.active ? 'bg-white border-slate-300 border-b-transparent text-blue-700 shadow-[0_-2px_0_0_#2563eb]' : 'bg-transparent border-transparent text-slate-500 hover:bg-white/50 hover:text-slate-700';
            const iconHtml = tab.icon ? `<span class="material-symbols-outlined !text-[14px] mr-1.5 opacity-70">${tab.icon}</span>` : '';
            const closeBtn = tab.closable ? `<span class="material-symbols-outlined !text-[14px] ml-3 opacity-50 hover:opacity-100 hover:text-red-500 cursor-pointer transition-colors" onclick="arguments[0].stopPropagation(); this.closest('sig-tabs').removeTab(${index})">close</span>` : '';
            const subtitleHtml = tab.subtitle ? `<span class="block text-[8px] font-normal text-slate-400 -mt-1 uppercase tracking-widest">${tab.subtitle}</span>` : '';
            
            headerHtml += `
                <div class="cursor-pointer ${heightClass} px-4 flex items-center justify-center border-t border-l border-r rounded-t-lg transition-colors group ${activeBg}" onclick="this.closest('sig-tabs').switchTab(${index})">
                    ${iconHtml}
                    <div class="flex flex-col items-start justify-center">
                        <span class="font-black uppercase tracking-wider ${textClass}">${tab.title}</span>
                        ${subtitleHtml}
                    </div>
                    ${closeBtn}
                </div>
            `;
        });

        // Add Button
        if (this.hasAttribute('show-add')) {
            headerHtml += `
                <button class="${heightClass} px-3 ml-1 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white rounded-t-md transition-colors border border-transparent active-tab-element">
                    <span class="material-symbols-outlined !text-[18px]">add</span>
                </button>
            `;
        }

        headerHtml += `</div>`;

        let contentHtml = `<div class="p-0 bg-white min-h-[50px] w-full">`;
        this.tabs.forEach((tab, i) => {
            contentHtml += `<div id="${tab.id}" class="${tab.active ? 'block' : 'hidden'}">${tab.content}</div>`;
        });
        contentHtml += `</div>`;

        this.innerHTML = `${headerHtml}${contentHtml}`;
    }

    switchTab(index) {
        this.tabs.forEach((t, i) => t.active = (i === index));
        this.render();
    }

    removeTab(index) {
        this.tabs.splice(index, 1);
        if (this.tabs.length > 0 && !this.tabs.some(t => t.active)) {
            // Default to the last one or the previous one
            const newIndex = Math.max(0, index - 1);
            this.tabs[newIndex].active = true;
        }
        this.render();
    }
}
customElements.define('sig-tabs', SigTabs);
