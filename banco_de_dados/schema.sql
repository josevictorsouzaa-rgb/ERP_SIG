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

-- Índices
CREATE INDEX IF NOT EXISTS idx_produtos_sku ON produtos(sku);
CREATE INDEX IF NOT EXISTS idx_produtos_marca ON produtos(marca);
CREATE INDEX IF NOT EXISTS idx_conversoes_codigo ON conversoes(codigo_concorrente);
CREATE INDEX IF NOT EXISTS idx_usuarios_login ON usuarios(login);

