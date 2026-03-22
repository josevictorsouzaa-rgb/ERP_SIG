# 🏗️ ARQUITETURA DO SISTEMA CORE (SIG)

> **PROPRIETÁRIO DO PROJETO:** José
> **OBJETIVO:** ERP robusto, nativo Windows, de alta performance para 80+ usuários simultâneos em rede (principalmente Auto Peças).
> **STACK:** Wails v2 (Go Backend) + HTML/CSS/JS (Frontend) + Tailwind CSS + PostgreSQL.

---

## 🛑 REGRAS DE OURO TÉCNICAS (PARA QUALQUER AGENTE)

1. **Janelas Múltiplas Nativas Estritas (Subprocessamento Clocado)**
   - O Wails v2 é *Single Window*. Para o requisito do José de janelas flutuantes individuais (multi-tela, arrastáveis fora do Hub), criamos a técnica da **Autoforja**.
   - O Hub clona o executável em disco e o executa passando uma flag paramétrica de módulo (ex: `parametros.exe`).
   - O `principal.go` verifica seu próprio nome e sabe qual módulo carregar (através da diretiva `window.onload` em `index.html`).
   - O Hub (`principal`) **DEVE ABRIR SEMPRE EM TELA CHEIA (`options.Maximised`)**.
   - O CSS de novas janelas **não deve ter modal falso, nem close falso**. A janela filha deve ser responsiva e totalmente natural de OS, sendo fechada no "X" nativo do Windows.

2. **A Regra do Laboratório (Desenvolvimento de Frontend)**
   - NUNCA crie, insira ou reajuste telas diretamente no `index.html` ou arquivos definitivos sem validação humana do José.
   - Componentes visuais primeiro devem ser prototipados de forma ISOLADA no browser ou no `sig-blueprint.html` para aprovação do José.
   - **Toda estilização deve se alimentar do Design System contido em `sig-ui.css`**, usando tokens de marca (`sig-blue`, `sig-brand-cyan`, etc). Cores hardcoded no HTML estão PROIBIDAS.
   - Interfaces devem sempre funcionar **em português**.

3. **Arquitetura Fragmentada do Go (Backend)**
   - Nenhuma lógica nova deve inchar o `ponte_principal.go` desnecessariamente.
   - Métodos específicos devem ser isolados sob pacotes `motor/{dominio}.go` (ex: `motor/estoque.go`) contendo queries SQL e validações, mantendo a ponte esbelta.
   - O repositório centralizado de dados mora na pasta `banco_de_dados` (scripts SQL puros). 
   - Ao injetar chamadas Wails no frontend (ex: `<script>`), **usar a sintaxe protetora**:
     `const goEngine = window.parent.go || window.go; await goEngine.main.App...`
     Pois as janelas filhas operam no nível da raiz de um Iframe transparente no navegador Go interno.

4. **Governança RIGOROSA de Novas Telas / Módulos (Socratic Gate)**
   - NUNCA crie uma tela nova sem ANTES cumprir este checklist perguntando ao José (Proprietário):
     - **[1] Formato de Abertura:** A tela será uma "Janela Nativa Separada" (Multi-window / Autoforja) ou será um "Pop-up / Modal interno" dentro do Hub/Master?
     - **[2] Reuso de Componentes:** Quais componentes já estão prontos no nosso Design System (`sig-blueprint.html`) que nós utilizaremos para essa tela? Ex: "Tabela de Grade", "Botão Azul de Matriz"?
   - **Proibido Componentes Novos Soltos:** AO CRIAR a tela, o Agente é OBRIGADO a reaproveitar a estrutura do Design System. Toda cor, raio da borda ou tamanho da fonte deve ser uma referência às variáveis base do `sig-ui.css`. O objetivo: **Se o José mandar mudar o Tom do Azul no futuro, todo o sistema muda em 1 segundo, sem precisarmos alterar tela a tela.**
