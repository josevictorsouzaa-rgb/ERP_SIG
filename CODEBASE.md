# 🗂️ MAPA DO CÓDIGO FONTE (SIG)

> **Regra Primária:** **AO ALTERAR UM ARQUIVO, REVISE ESTAS DEPENDÊNCIAS, POIS ELAS SE CONECTAM ENTRE SI.**
> *A integridade principal repousa na separação dos fluxograma Frontend x Backend x Database.*

## 1. 📂 A PONTE GO (BACKEND)
- **`principal.go`**: Central nervosa (antigo main.go). Onde o app e a UI começam e definem a tela. Ele sabe se é Hub.exe ou Módulo.exe através de CLI args.
- **`ponte_principal.go`**: Ponte de ligação das rotinas Go <=> Frontend (antigo app.go). Ele exporta funções que o javascript consegue enxergar. NÃO DEVE abrigar queries, as queries devem ficar nos pacotes isolados de `motor/`.
- **`motor/banco.go`**: Instanciação e rotinas fundamentais do DB do PostgreSQL. Onde as conexões com DB e ponte principal acontecem.

## 2. 📂 O CÉREBRO COMPONENTE (FRONTEND)
- **`frontend/index.html`**: A página estática base do UI (Wails). Apenas container, não o modifique com classes globais quebrando módulos. Ele é agnóstico.
- **`frontend/assets/css/sig-ui.css`**: O **ÚNICO** arquivo aceito para estilização manual padronizada (Design Tokens), como botões, barras e componentes transversais do ERP.
- **`frontend/assets/design-system/sig-blueprint.html`**: O laboratório de aprovação (mockups/brincadeiras de Design).

## 3. 📂 AS PÁGINAS DO SISTEMA (MÓDULOS OPACOS)
- **`frontend/paginas/hub/hub.html`**: Tela principal de roteamento e visualização master do projeto. Não sobrepõe as outras (ela evoca as outras via `.exe` duplo com `window.go.main.App.AbrirModulo(nome)`).
- **`frontend/paginas/parametros/parametros.html`**: Módulo isolado, carrega tela total, independente da master. Suas conexões Go requerem a trava de navegação iframeless: `const goEngine = window.parent.go || window.go`. 

## 4. 📂 O BANCO (SQL/MIGRAÇÕES)
- **`banco_de_dados/`**: Pasta para despejo e documentação bruta dos `CREATE TABLES` do sistema e `sqlc`. O Go ler o esquema, mas para auditorias, deixamos scripts nativos expostos.

---
**LINGUAGEM OBRIGATÓRIA DA EQUIPE:** Português claro em comentários e código arquitetural.
