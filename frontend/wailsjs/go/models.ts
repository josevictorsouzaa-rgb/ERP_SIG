export namespace motor {
	
	export class Categoria {
	    id: number;
	    nome: string;
	    criado_em: string;
	
	    static createFrom(source: any = {}) {
	        return new Categoria(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nome = source["nome"];
	        this.criado_em = source["criado_em"];
	    }
	}
	export class Empresa {
	    id: number;
	    razao_social: string;
	    fantasia: string;
	    cnpj: string;
	    inscricao_estadual: string;
	    regime_tributario: string;
	    logradouro: string;
	    numero: string;
	    bairro: string;
	    cidade: string;
	    uf: string;
	    cep: string;
	    telefone: string;
	    tipo: string;
	    is_matriz: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Empresa(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.razao_social = source["razao_social"];
	        this.fantasia = source["fantasia"];
	        this.cnpj = source["cnpj"];
	        this.inscricao_estadual = source["inscricao_estadual"];
	        this.regime_tributario = source["regime_tributario"];
	        this.logradouro = source["logradouro"];
	        this.numero = source["numero"];
	        this.bairro = source["bairro"];
	        this.cidade = source["cidade"];
	        this.uf = source["uf"];
	        this.cep = source["cep"];
	        this.telefone = source["telefone"];
	        this.tipo = source["tipo"];
	        this.is_matriz = source["is_matriz"];
	    }
	}
	export class Enderecamento {
	    id: number;
	    empresa_id: number;
	    parent_id?: number;
	    nome: string;
	    codigo: string;
	    tipo: string;
	    endereco_logistico: string;
	    nivel: number;
	
	    static createFrom(source: any = {}) {
	        return new Enderecamento(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.empresa_id = source["empresa_id"];
	        this.parent_id = source["parent_id"];
	        this.nome = source["nome"];
	        this.codigo = source["codigo"];
	        this.tipo = source["tipo"];
	        this.endereco_logistico = source["endereco_logistico"];
	        this.nivel = source["nivel"];
	    }
	}
	export class EntradaItem {
	    id: number;
	    entrada_id: number;
	    produto_id: number;
	    produto_sku: string;
	    produto_nome: string;
	    quantidade: number;
	    valor_unitario: number;
	    valor_total: number;
	    cfop: string;
	    cst: string;
	    base_icms: number;
	    valor_icms: number;
	    base_st: number;
	    valor_st: number;
	    valor_ipi: number;
	    ncm: string;
	    endereco_id: number;
	    endereco_nome: string;
	
	    static createFrom(source: any = {}) {
	        return new EntradaItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.entrada_id = source["entrada_id"];
	        this.produto_id = source["produto_id"];
	        this.produto_sku = source["produto_sku"];
	        this.produto_nome = source["produto_nome"];
	        this.quantidade = source["quantidade"];
	        this.valor_unitario = source["valor_unitario"];
	        this.valor_total = source["valor_total"];
	        this.cfop = source["cfop"];
	        this.cst = source["cst"];
	        this.base_icms = source["base_icms"];
	        this.valor_icms = source["valor_icms"];
	        this.base_st = source["base_st"];
	        this.valor_st = source["valor_st"];
	        this.valor_ipi = source["valor_ipi"];
	        this.ncm = source["ncm"];
	        this.endereco_id = source["endereco_id"];
	        this.endereco_nome = source["endereco_nome"];
	    }
	}
	export class Entrada {
	    id: number;
	    numero_nota: string;
	    serie: string;
	    fornecedor_id: number;
	    fornecedor_nome: string;
	    data_emissao: string;
	    data_entrada: string;
	    valor_produtos: number;
	    valor_frete: number;
	    valor_ipi: number;
	    valor_st: number;
	    valor_total: number;
	    observacao: string;
	    status: string;
	    itens: EntradaItem[];
	    criado_em: string;
	
	    static createFrom(source: any = {}) {
	        return new Entrada(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.numero_nota = source["numero_nota"];
	        this.serie = source["serie"];
	        this.fornecedor_id = source["fornecedor_id"];
	        this.fornecedor_nome = source["fornecedor_nome"];
	        this.data_emissao = source["data_emissao"];
	        this.data_entrada = source["data_entrada"];
	        this.valor_produtos = source["valor_produtos"];
	        this.valor_frete = source["valor_frete"];
	        this.valor_ipi = source["valor_ipi"];
	        this.valor_st = source["valor_st"];
	        this.valor_total = source["valor_total"];
	        this.observacao = source["observacao"];
	        this.status = source["status"];
	        this.itens = this.convertValues(source["itens"], EntradaItem);
	        this.criado_em = source["criado_em"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Fornecedor {
	    id: number;
	    razao_social: string;
	    fantasia: string;
	    cnpj: string;
	    ie: string;
	    cidade: string;
	    uf: string;
	
	    static createFrom(source: any = {}) {
	        return new Fornecedor(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.razao_social = source["razao_social"];
	        this.fantasia = source["fantasia"];
	        this.cnpj = source["cnpj"];
	        this.ie = source["ie"];
	        this.cidade = source["cidade"];
	        this.uf = source["uf"];
	    }
	}
	export class Funcao {
	    id: number;
	    nome: string;
	
	    static createFrom(source: any = {}) {
	        return new Funcao(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nome = source["nome"];
	    }
	}
	export class Marca {
	    id: number;
	    nome: string;
	    margem: number;
	    criado_em: string;
	
	    static createFrom(source: any = {}) {
	        return new Marca(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nome = source["nome"];
	        this.margem = source["margem"];
	        this.criado_em = source["criado_em"];
	    }
	}
	export class PerfilFiscal {
	    id: number;
	    nome: string;
	    operacao: string;
	    icms_aliq: number;
	    tem_st: boolean;
	    ipi_aliq: number;
	    pis_aliq: number;
	    cofins_aliq: number;
	    cfop_padrao: string;
	
	    static createFrom(source: any = {}) {
	        return new PerfilFiscal(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nome = source["nome"];
	        this.operacao = source["operacao"];
	        this.icms_aliq = source["icms_aliq"];
	        this.tem_st = source["tem_st"];
	        this.ipi_aliq = source["ipi_aliq"];
	        this.pis_aliq = source["pis_aliq"];
	        this.cofins_aliq = source["cofins_aliq"];
	        this.cfop_padrao = source["cfop_padrao"];
	    }
	}
	export class Produto {
	    id: number;
	    sku: string;
	    ean: string;
	    descricao_tecnica: string;
	    nome_popular: string;
	    marca_id: number;
	    marca_nome: string;
	    categoria_id: number;
	    categoria_nome: string;
	    subcategoria_id: number;
	    subcategoria_nome: string;
	    unidade_id: number;
	    unidade_sigla: string;
	    fator_conversao: number;
	    peso: number;
	    altura: number;
	    largura: number;
	    comprimento: number;
	    deposito_id: number;
	    custo: number;
	    venda: number;
	    estoque_atual: number;
	    estoque_minimo: number;
	    localizacao: string;
	    criado_em: string;
	    atualizado_em: string;
	    ncm: string;
	    cest: string;
	    origem: number;
	    perfil_fiscal_id: number;
	    perfil_fiscal_nome: string;
	    tem_icms: boolean;
	    tem_st: boolean;
	    tem_ipi: boolean;
	    tem_pis_cofins: boolean;
	    cfop: string;
	    cst_csosn: string;
	    aliquota_icms: number;
	    aliquota_ipi: number;
	    aliquota_pis: number;
	    aliquota_cofins: number;
	    reducao_bc: number;
	
	    static createFrom(source: any = {}) {
	        return new Produto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sku = source["sku"];
	        this.ean = source["ean"];
	        this.descricao_tecnica = source["descricao_tecnica"];
	        this.nome_popular = source["nome_popular"];
	        this.marca_id = source["marca_id"];
	        this.marca_nome = source["marca_nome"];
	        this.categoria_id = source["categoria_id"];
	        this.categoria_nome = source["categoria_nome"];
	        this.subcategoria_id = source["subcategoria_id"];
	        this.subcategoria_nome = source["subcategoria_nome"];
	        this.unidade_id = source["unidade_id"];
	        this.unidade_sigla = source["unidade_sigla"];
	        this.fator_conversao = source["fator_conversao"];
	        this.peso = source["peso"];
	        this.altura = source["altura"];
	        this.largura = source["largura"];
	        this.comprimento = source["comprimento"];
	        this.deposito_id = source["deposito_id"];
	        this.custo = source["custo"];
	        this.venda = source["venda"];
	        this.estoque_atual = source["estoque_atual"];
	        this.estoque_minimo = source["estoque_minimo"];
	        this.localizacao = source["localizacao"];
	        this.criado_em = source["criado_em"];
	        this.atualizado_em = source["atualizado_em"];
	        this.ncm = source["ncm"];
	        this.cest = source["cest"];
	        this.origem = source["origem"];
	        this.perfil_fiscal_id = source["perfil_fiscal_id"];
	        this.perfil_fiscal_nome = source["perfil_fiscal_nome"];
	        this.tem_icms = source["tem_icms"];
	        this.tem_st = source["tem_st"];
	        this.tem_ipi = source["tem_ipi"];
	        this.tem_pis_cofins = source["tem_pis_cofins"];
	        this.cfop = source["cfop"];
	        this.cst_csosn = source["cst_csosn"];
	        this.aliquota_icms = source["aliquota_icms"];
	        this.aliquota_ipi = source["aliquota_ipi"];
	        this.aliquota_pis = source["aliquota_pis"];
	        this.aliquota_cofins = source["aliquota_cofins"];
	        this.reducao_bc = source["reducao_bc"];
	    }
	}
	export class Subcategoria {
	    id: number;
	    categoria_id: number;
	    categoria_nome: string;
	    nome: string;
	    criado_em: string;
	
	    static createFrom(source: any = {}) {
	        return new Subcategoria(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.categoria_id = source["categoria_id"];
	        this.categoria_nome = source["categoria_nome"];
	        this.nome = source["nome"];
	        this.criado_em = source["criado_em"];
	    }
	}
	export class UnidadeMedida {
	    id: number;
	    sigla: string;
	    descricao: string;
	
	    static createFrom(source: any = {}) {
	        return new UnidadeMedida(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sigla = source["sigla"];
	        this.descricao = source["descricao"];
	    }
	}
	export class Usuario {
	    id: number;
	    nome: string;
	    sobrenome: string;
	    cpf: string;
	    rg: string;
	    data_nascimento: string;
	    data_admissao: string;
	    cep: string;
	    logradouro: string;
	    numero: string;
	    complemento: string;
	    bairro: string;
	    cidade: string;
	    uf: string;
	    login: string;
	    senha: string;
	    funcao_id: number;
	    nome_funcao: string;
	    precisa_alterar_senha: boolean;
	    ativo: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Usuario(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nome = source["nome"];
	        this.sobrenome = source["sobrenome"];
	        this.cpf = source["cpf"];
	        this.rg = source["rg"];
	        this.data_nascimento = source["data_nascimento"];
	        this.data_admissao = source["data_admissao"];
	        this.cep = source["cep"];
	        this.logradouro = source["logradouro"];
	        this.numero = source["numero"];
	        this.complemento = source["complemento"];
	        this.bairro = source["bairro"];
	        this.cidade = source["cidade"];
	        this.uf = source["uf"];
	        this.login = source["login"];
	        this.senha = source["senha"];
	        this.funcao_id = source["funcao_id"];
	        this.nome_funcao = source["nome_funcao"];
	        this.precisa_alterar_senha = source["precisa_alterar_senha"];
	        this.ativo = source["ativo"];
	    }
	}

}

