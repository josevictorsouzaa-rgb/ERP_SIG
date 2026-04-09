-- schema.sql

-- Tabela de Empresas (Matriz e Filiais)
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    razao_social TEXT NOT NULL,
    fantasia TEXT,
    cnpj TEXT UNIQUE NOT NULL,
    inscricao_estadual TEXT,
    regime_tributario TEXT,
    logradouro TEXT,
    telefone TEXT,
    numero TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    is_matriz BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir uma matriz padrão se não existir
INSERT INTO empresas (razao_social, cnpj, is_matriz) 
VALUES ('MINHA EMPRESA MATRIZ', '00.000.000/0001-00', true)
ON CONFLICT (cnpj) DO NOTHING;

-- Tabela de Marcas
CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    margem DECIMAL(12, 2) DEFAULT 0.00,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Subcategorias
CREATE TABLE IF NOT EXISTS subcategorias (
    id SERIAL PRIMARY KEY,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(categoria_id, nome)
);

-- Tabela produtos: SKU (único), EAN, Descrição Técnica, Marca, Categoria, Subcategoria, Custos, Estoques, Similares
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    ean VARCHAR(13),
    descricao_tecnica TEXT NOT NULL,
    marca_id INT NOT NULL REFERENCES marcas(id),
    categoria_id INT NOT NULL REFERENCES categorias(id),
    subcategoria_id INT NOT NULL REFERENCES subcategorias(id),
    custo DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    venda DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    estoque_atual INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 0,
    localizacao VARCHAR(100), -- Prateleira/Corredor
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela produtos_similares: Auto-relacionamento N:N
CREATE TABLE IF NOT EXISTS produtos_similares (
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    similar_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    PRIMARY KEY (produto_id, similar_id)
);


-- Tabela conversoes
CREATE TABLE IF NOT EXISTS conversoes (
    id SERIAL PRIMARY KEY,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    codigo_concorrente VARCHAR(100) NOT NULL,
    marca_concorrente VARCHAR(100) NOT NULL,
    UNIQUE(produto_id, codigo_concorrente, marca_concorrente)
);

-- Tabela movimentacao_estoque
CREATE TABLE IF NOT EXISTS movimentacao_estoque (
    id SERIAL PRIMARY KEY,
    produto_id INT NOT NULL REFERENCES produtos(id),
    quantidade INT NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'ENTRADA' ou 'SAIDA'
    motivo TEXT,
    usuario_id VARCHAR(50) NOT NULL, -- Identificação de quem realizou
    data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    login TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    id_terminal VARCHAR(50),
    precisa_alterar_senha BOOLEAN DEFAULT true,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin padrão (senha: admin123) se não existir
INSERT INTO usuarios (nome, login, senha, precisa_alterar_senha)
VALUES ('ADMINISTRADOR', 'admin', 'admin123', true)
ON CONFLICT (login) DO NOTHING;

-- Tabela de Perfis Fiscais (Motor Tributário SIG V76.1)
-- NOTA: Criação e migrações são executadas pelo Go (motor/produtos.go SetupProdutosData)
-- Esta definição serve como referência documental do schema completo.
CREATE TABLE IF NOT EXISTS perfis_fiscais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,

    -- Bloco 01: Identificação
    tipo_operacao TEXT DEFAULT 'SAIDA',           -- ENTRADA, SAIDA, DEVOLUCAO
    natureza_operacao TEXT DEFAULT 'FISCAL',       -- FISCAL, GERENCIAL, PEDIDO
    regime_empresa TEXT DEFAULT 'SIMPLES',         -- SIMPLES, PRESUMIDO, REAL
    consumidor_final BOOLEAN DEFAULT FALSE,
    finalidade_nfe INT DEFAULT 1,                  -- 1-Normal, 2-Complementar, 3-Ajuste, 4-Devolucao
    ativo BOOLEAN DEFAULT TRUE,
    observacao_interna TEXT,

    -- Bloco 02: CFOP & Classificação
    cfop_padrao VARCHAR(10) DEFAULT '',
    cfop_descricao TEXT DEFAULT '',
    tipo_item VARCHAR(50) DEFAULT 'REVENDA',       -- REVENDA, USO_CONSUMO, ATIVO
    finalidade VARCHAR(50) DEFAULT 'COMERCIALIZACAO',
    cst_icms VARCHAR(10),
    operacao VARCHAR(20) DEFAULT 'SAIDA',          -- Legado

    -- Bloco 03: ICMS & ST & DIFAL
    tem_icms_proprio BOOLEAN DEFAULT TRUE,
    destaca_icms BOOLEAN DEFAULT TRUE,
    gera_credito_icms BOOLEAN DEFAULT FALSE,
    tem_icms_st BOOLEAN DEFAULT FALSE,
    destaca_icms_st BOOLEAN DEFAULT FALSE,
    tem_reducao_base BOOLEAN DEFAULT FALSE,
    icms_st_credito BOOLEAN DEFAULT TRUE,
    icms_tipo_calculo VARCHAR(50) DEFAULT 'NORMAL',
    indicador_presenca VARCHAR(50) DEFAULT '1',
    tem_difal BOOLEAN DEFAULT FALSE,
    destaca_difal BOOLEAN DEFAULT FALSE,
    difal_responsavel VARCHAR(50) DEFAULT 'ORIGEM',
    difal_considera_fcp BOOLEAN DEFAULT TRUE,
    tem_fcp BOOLEAN DEFAULT FALSE,

    -- Bloco 04: IPI
    tem_ipi BOOLEAN DEFAULT FALSE,
    destaca_ipi BOOLEAN DEFAULT FALSE,
    ipi_soma_custo BOOLEAN DEFAULT FALSE,
    ipi_gera_credito BOOLEAN DEFAULT FALSE,
    cst_ipi VARCHAR(10),
    ipi_tipo_calculo VARCHAR(50) DEFAULT 'PERCENTUAL',

    -- Bloco 05: PIS / COFINS
    calcula_pis BOOLEAN DEFAULT TRUE,
    cst_pis VARCHAR(10),
    calcula_cofins BOOLEAN DEFAULT TRUE,
    cst_cofins VARCHAR(10),
    piscofins_regime VARCHAR(50) DEFAULT 'CUMULATIVO',
    piscofins_base VARCHAR(50) DEFAULT 'TOTAL NOTA',

    -- Bloco 06: Composição de Custo
    soma_st_custo BOOLEAN DEFAULT FALSE,
    soma_ipi_custo BOOLEAN DEFAULT FALSE,
    soma_frete_custo BOOLEAN DEFAULT FALSE,
    soma_despesas_custo BOOLEAN DEFAULT FALSE,
    soma_difal_custo BOOLEAN DEFAULT FALSE,
    forma_custo_medio BOOLEAN DEFAULT TRUE,

    -- Bloco 07: Comportamento Operacional
    atualiza_estoque BOOLEAN DEFAULT TRUE,
    tipo_movimento_estoque TEXT DEFAULT 'NAO_MOVIMENTA',
    gera_financeiro BOOLEAN DEFAULT TRUE,
    reserva_estoque BOOLEAN DEFAULT FALSE,
    baixa_estoque BOOLEAN DEFAULT FALSE,
    permite_venda_negativa BOOLEAN DEFAULT FALSE,

    -- Bloco 08: Travas de Segurança
    trava_sem_ncm BOOLEAN DEFAULT TRUE,
    trava_sem_cest BOOLEAN DEFAULT FALSE,
    trava_sem_cfop BOOLEAN DEFAULT TRUE,
    trava_sem_cst BOOLEAN DEFAULT TRUE,

    -- Flags Técnicas
    usa_matriz_fiscal BOOLEAN DEFAULT TRUE,
    permite_overwrite_cfop BOOLEAN DEFAULT TRUE,
    permite_overwrite_cst BOOLEAN DEFAULT TRUE,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_produtos_sku ON produtos(sku);
CREATE INDEX IF NOT EXISTS idx_produtos_marca ON produtos(marca);
CREATE INDEX IF NOT EXISTS idx_conversoes_codigo ON conversoes(codigo_concorrente);
CREATE INDEX IF NOT EXISTS idx_usuarios_login ON usuarios(login);

-- ---------------------------------------------------------
-- Módulo: Compras (Fornecedores e Pedidos)
-- ---------------------------------------------------------

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id SERIAL PRIMARY KEY,
    razao_social TEXT NOT NULL,
    fantasia TEXT,
    cnpj_cpf TEXT UNIQUE NOT NULL,
    inscricao_estadual TEXT,
    tipo TEXT DEFAULT 'J', -- J ou F
    logradouro TEXT,
    numero TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    telefone TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pedidos de Compra
CREATE TABLE IF NOT EXISTS pedidos_compra (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    fornecedor_id INT NOT NULL REFERENCES fornecedores(id),
    tipo_compra VARCHAR(50) NOT NULL, -- COMPRA NORMAL, BONIFICAÇÃO, GARANTIA
    previsao_entrega DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'RASCUNHO', -- RASCUNHO, PENDENTE, CONCLUIDO
    observacao TEXT,
    frete_por_conta VARCHAR(20) DEFAULT 'COMPRADOR',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens do Pedido de Compra
CREATE TABLE IF NOT EXISTS pedidos_compra_itens (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES pedidos_compra(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id),
    quantidade DECIMAL(12,2) NOT NULL,
    valor_unitario DECIMAL(12,2) NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL
);

-- Tabela de Solicitaes de Compra
CREATE TABLE IF NOT EXISTS solicitacoes_compras (
    id SERIAL PRIMARY KEY,
    codigo_produto VARCHAR(50),
    descricao_produto TEXT NOT NULL,
    marca_preferencia VARCHAR(100),
    quantidade DECIMAL(12,2) NOT NULL DEFAULT 1.0,
    unidade VARCHAR(10) DEFAULT 'UN',
    usuario_solicitante VARCHAR(100) NOT NULL,
    urgencia VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    observacao TEXT,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
