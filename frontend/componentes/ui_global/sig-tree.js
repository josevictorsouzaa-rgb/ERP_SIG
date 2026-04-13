class SigTree extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        if (!this.hasAttribute('rendered')) {
            this.render();
            this.setAttribute('rendered', 'true');
        }
    }

    render() {
        // Find all sig-tree-node elements and wrap them
        this.querySelectorAll('sig-tree-node').forEach(node => {
            const label = node.getAttribute('label') || 'Node';
            const icon = node.getAttribute('icon') || 'folder';
            const isOpen = node.hasAttribute('open');
            const hasChildren = node.querySelector('sig-tree-node') !== null;
            
            // Extract children html before wiping
            const childrenHtml = node.innerHTML;
            
            const expandIcon = hasChildren ? 
                `<span class="material-symbols-outlined !text-[16px] text-slate-400 select-none transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}">chevron_right</span>` : 
                `<span class="w-[16px]"></span>`;

            node.innerHTML = `
                <div class="flex items-center gap-1 py-1 px-2 hover:bg-slate-100 cursor-pointer rounded transition-colors group sig-tree-header" onclick="${hasChildren ? 'this.closest(\'sig-tree-node\').toggle()' : ''}">
                    ${expandIcon}
                    <span class="material-symbols-outlined !text-[16px] text-blue-500">${icon}</span>
                    <span class="text-[11px] font-bold text-slate-700 uppercase tracking-widest ml-1 group-hover:text-blue-700">${label}</span>
                </div>
                <div class="sig-tree-children pl-6 border-l border-slate-200 ml-3 mt-1 ${isOpen ? 'block' : 'hidden'}">
                    ${childrenHtml}
                </div>
            `;
            
            // Add toggle method directly to the element instance
            node.toggle = function() {
                const headerSpan = this.querySelector('.sig-tree-header > span:first-child');
                const childrenContainer = this.querySelector('.sig-tree-children');
                
                if (childrenContainer.classList.contains('hidden')) {
                    childrenContainer.classList.remove('hidden');
                    childrenContainer.classList.add('block');
                    if(headerSpan) headerSpan.classList.add('rotate-90');
                } else {
                    childrenContainer.classList.remove('block');
                    childrenContainer.classList.add('hidden');
                    if(headerSpan) headerSpan.classList.remove('rotate-90');
                }
            };
        });

        // Wrap the whole tree in a clean container
        this.classList.add('block', 'w-full', 'bg-white', 'p-2');
    }
}
customElements.define('sig-tree', SigTree);

class SigTreeNode extends HTMLElement {
    // Just a placeholder for the logic inside SigTree
}
customElements.define('sig-tree-node', SigTreeNode);
