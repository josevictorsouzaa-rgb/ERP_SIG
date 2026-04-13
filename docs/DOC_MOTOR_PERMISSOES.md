# DOC TÉCNICO: MOTOR DE GRUPOS DE ACESSO E RBAC (SIG ERP)

> **Status:** Implementado (Estilo Master/Detail Blueprint V3)
> **Arquitetura Visual:** Master-Detail (Tabs cegos + Master Checkboxes)
> **Persistência de Dados (Modelo Padrão):** Coluna JSON/JSONB atrelada ao Grupo.

---

## 1. Visão Geral da Arquitetura
O Motor de Permissões do SIG ERP utiliza um modelo de Controle de Acesso Baseado em Papéis (RBAC - Role-Based Access Control). A administração de permissões é centralizada em **Grupos de Usuário**, permitindo que múltiplos usuários herdem o mesmo perfil, facilitando a manutenção e padronizando os acessos operacionais.

## 2. Estrutura Abstrata do Permissionamento
O modelo estrutural se divide em 3 camadas lógicas rigorosas:

1. **Módulo:** Define o acesso macro a um bloco funcional do ERP (ex: `MOD_PRODUTO`). Sem essa permissão, o usuário não tem acesso à tela ou suas rotinas correspondentes.
2. **Permissões de Ação:** Definem operações específicas dentro de um módulo (ex: `PROD_VIEW`, `PROD_CREATE`). Controlam botões, salvamentos e ações de contexto interno.
3. **Parâmetros Opcionais:** Condicionam visibilidade de dados ou comportamentos direcionados na mesma interface (ex: `SOLCOM_VISAO = TODOS`), otimizando o controle.

Essa hierarquia é refletida diretamente na interface Master/Detail: a aba laterial (Master) designa a ativação estrutural do Módulo, enquanto o painel correspondente (Detail) provê o controle das Permissões e Parâmetros. Em módulos desativados, os sub-elementos adotam classes de desabilitação (`opacity-50 pointer-events-none`), oferecendo consistência visual para o gestor sem ocultar as funcionalidades disponíveis.

---

## 3. Matriz Central de Módulos (As Chaves de Fechadura)
A base principal atende ao roteiro estrutural dos componentes da Home/Hub. Atualmente possuímos:

* `MOD_PRODUTO`: Acesso ao escopo de catálogo, parametrização e cadastro unitário de produtos.
* `MOD_PARAMETRO`: Acesso restrito ao gerenciamento de empresas vinculadas, filiais e parâmetros tributários raiz.
* `MOD_PEDIDOS_COMPRA`: Acesso aos fluxogramas de cotação externa e ordens de compra logísticas (B2B).
* `MOD_SOLICITACAO_COMPRAS`: Acesso ao pipeline interno de requisições de compra, com tratamento de limite estrutural e validações gerenciais inter-setores.
* `MOD_ENDERECAMENTO`: Acesso ao bloco WMS de gestão de endereços logísticos e controle de posições.
* `MOD_ACESSOS`: Acesso à gestão formal do modelo RBAC (usuários e criação de Grupos de Acesso).
* `MOD_ENTRADA_MERCADORIA`: Acesso à interface de recepção contábil, conferência de malha fiscal (XML) e movimentação direta/saldo.

---

## 4. O Comportamento do JSON de Parametrização Flexível
Diferente de sistemas legados que carregam 50 colunas booleanas espúrias no Banco de Dados (`pode_ver_x`, `pode_apagar_y`), a nossa arquitetura centralizará a parametrização sob um único container estruturado (JSON ou JSONB), facilitando enormemente expansões do sistema, em virtude da ausência de scripts de alteração de *schemas* e *migrations*.

### 4.1. Exemplo de Serialização
```json
{
  "modulos": {
    "MOD_PRODUTO": true,
    "MOD_SOLICITACAO_COMPRAS": true,
    "MOD_ENTRADA_MERCADORIA": false
  },
  "permissoes": {
    "PROD_VIEW": true,
    "PROD_CREATE": true,
    "PROD_DELETE": false,
    
    "SOLCOM_REGISTRAR": true,
    "SOLCOM_TRATAR": false
  },
  "parametros": {
    "SOLCOM_VISAO": "MEUS",
    "ENTMERC_TIPO_MOVIMENTACAO": "REAL"
  }
}
```
* **Aba de Parâmetros:** Além de carregar **booleans (Sim/Não)**, o sistema suporta **enumerators e variáveis**. Por ex: A visão de requisições de compras possui um combobox definindo `MEUS` (Visualiza Só os Próprios) vs `TODOS` (Gestor que avalia todas as requisições da base).

---

## 5. Implementação Técnica e Feedback View
A validação de permissões segue a regra estrita de: declaração em HTML, orquestração e feedback em JS, e verificação definitiva em backend Go.

### 5.1. Camada Frontend e Uso do Toast System
O frontend tem o papel de otimizar a clareza para a operação diária:
* **HTML Declarativo:** Interações atrelam marcadores nativos ao DOM, preferencialmente via atributos como `data-modulo="MOD_PRODUTO"` ou `data-permissao="PROD_DELETE"`.
* **Adaptação Visual Inicial:** Ao montar ou despachar scripts de inicialização, a camada em JS desvia rotas inativas baseadas no modelo salvo de permissões (`disabled="true"` e ocultação de painéis).
* **Feedback Operacional Obrigatório:** Ações não autorizadas (ex. um comando em um atalho de teclado não permitido) disparam rigorosamente comunicações claras pelo sistema padronizado em tela, tal como `Toast.warning("Acesso negado: Perfil sem permissão para exclusões.")`. Adotar `alert()`, ou respostas genéricas via runtime do Browser não são autorizadas no SIG ERP.

### 5.2. Camada Backend (Segurança Definitiva em Go)
O Frontend atende a usabilidade; o componente Backend consolida a segurança sem concessões. Nenhuma rotina que altera banco de dados será processada sem averiguação técnica na memória do app (Sessão, Redis ou Context Struct injetado no Use-case). Ausência das tags requeridas finalizam a stack da operação retornando bloqueios claros para renderização no Wails.

## 6. Conclusão
O modelo baseia-se em governança corporativa e escalabilidade imediata. A persistência em JSON(B) elimina complexidades de DDL no SQL, ao mesmo tempo que a sintonia coesa entre um controle via backend (Go) e feedbacks diretos no sistema (Toast System/JS) constrói uma interface transparente e pragmática à administração sistêmica do ERP.
