export namespace motor {
	
	export class AliquotaFiscal {
	    id: number;
	    nome: string;
	    regime_tributario: string;
	    tipo_destino: string;
	    incidencia_st: string;
	    ncm: string;
	    cfop: string;
	    cst_csosn: string;
	    aliquota_icms: number;
	    aliquota_icms_st: number;
	    aliquota_ipi: number;
	    aliquota_pis: number;
	    aliquota_cofins: number;
	    aliquota_difal: number;
	    aliquota_fcp: number;
	    prioridade: string;
	    ativa: boolean;
	
	    static createFrom(source: any = {}) {
	        return new AliquotaFiscal(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nome = source["nome"];
	        this.regime_tributario = source["regime_tributario"];
	        this.tipo_destino = source["tipo_destino"];
	        this.incidencia_st = source["incidencia_st"];
	        this.ncm = source["ncm"];
	        this.cfop = source["cfop"];
	        this.cst_csosn = source["cst_csosn"];
	        this.aliquota_icms = source["aliquota_icms"];
	        this.aliquota_icms_st = source["aliquota_icms_st"];
	        this.aliquota_ipi = source["aliquota_ipi"];
	        this.aliquota_pis = source["aliquota_pis"];
	        this.aliquota_cofins = source["aliquota_cofins"];
	        this.aliquota_difal = source["aliquota_difal"];
	        this.aliquota_fcp = source["aliquota_fcp"];
	        this.prioridade = source["prioridade"];
	        this.ativa = source["ativa"];
	    }
	}
	export class AplicacaoProduto {
	    id: number;
	    produto_id: number;
	    marca: string;
	    modelo: string;
	    motor: string;
	    ano_inicio: string;
	    ano_fim: string;
	
	    static createFrom(source: any = {}) {
	        return new AplicacaoProduto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.produto_id = source["produto_id"];
	        this.marca = source["marca"];
	        this.modelo = source["modelo"];
	        this.motor = source["motor"];
	        this.ano_inicio = source["ano_inicio"];
	        this.ano_fim = source["ano_fim"];
	    }
	}
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
	export class ContextoFiscal {
	    regime_tributario: string;
	    operacao: string;
	    uf_origem: string;
	    uf_destino: string;
	    tipo_destino: string;
	    incidencia_st: boolean;
	    ncm: string;
	
	    static createFrom(source: any = {}) {
	        return new ContextoFiscal(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.regime_tributario = source["regime_tributario"];
	        this.operacao = source["operacao"];
	        this.uf_origem = source["uf_origem"];
	        this.uf_destino = source["uf_destino"];
	        this.tipo_destino = source["tipo_destino"];
	        this.incidencia_st = source["incidencia_st"];
	        this.ncm = source["ncm"];
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
	    complemento: string;
	    bairro: string;
	    cidade: string;
	    uf: string;
	    cep: string;
	    telefone: string;
	    tipo: string;
	    cnae_principal: string;
	    cnae_secundarios: string;
	    is_matriz: boolean;
	    matriz_id: number;
	    usa_estoque_compartilhado: boolean;
	    estoque_id: number;
	    contatos: string;
	
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
	        this.complemento = source["complemento"];
	        this.bairro = source["bairro"];
	        this.cidade = source["cidade"];
	        this.uf = source["uf"];
	        this.cep = source["cep"];
	        this.telefone = source["telefone"];
	        this.tipo = source["tipo"];
	        this.cnae_principal = source["cnae_principal"];
	        this.cnae_secundarios = source["cnae_secundarios"];
	        this.is_matriz = source["is_matriz"];
	        this.matriz_id = source["matriz_id"];
	        this.usa_estoque_compartilhado = source["usa_estoque_compartilhado"];
	        this.estoque_id = source["estoque_id"];
	        this.contatos = source["contatos"];
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
	    unidade: string;
	    ean: string;
	    valor_unitario: number;
	    valor_desconto: number;
	    valor_total: number;
	    cfop: string;
	    cst: string;
	    base_icms: number;
	    valor_icms: number;
	    aliquota_icms: number;
	    base_st: number;
	    valor_st: number;
	    valor_ipi: number;
	    aliquota_ipi: number;
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
	        this.unidade = source["unidade"];
	        this.ean = source["ean"];
	        this.valor_unitario = source["valor_unitario"];
	        this.valor_desconto = source["valor_desconto"];
	        this.valor_total = source["valor_total"];
	        this.cfop = source["cfop"];
	        this.cst = source["cst"];
	        this.base_icms = source["base_icms"];
	        this.valor_icms = source["valor_icms"];
	        this.aliquota_icms = source["aliquota_icms"];
	        this.base_st = source["base_st"];
	        this.valor_st = source["valor_st"];
	        this.valor_ipi = source["valor_ipi"];
	        this.aliquota_ipi = source["aliquota_ipi"];
	        this.ncm = source["ncm"];
	        this.endereco_id = source["endereco_id"];
	        this.endereco_nome = source["endereco_nome"];
	    }
	}
	export class Entrada {
	    id: number;
	    numero_nota: string;
	    serie: string;
	    chave_acesso: string;
	    empresa_id: number;
	    empresa_nome: string;
	    cnpj_destino: string;
	    fornecedor_id: number;
	    fornecedor_nome: string;
	    cnpj: string;
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
	        this.chave_acesso = source["chave_acesso"];
	        this.empresa_id = source["empresa_id"];
	        this.empresa_nome = source["empresa_nome"];
	        this.cnpj_destino = source["cnpj_destino"];
	        this.fornecedor_id = source["fornecedor_id"];
	        this.fornecedor_nome = source["fornecedor_nome"];
	        this.cnpj = source["cnpj"];
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
	
	export class FiltrosProdutos {
	    descricao: string;
	    cod_fabricante: string;
	    marca_veiculo: string;
	    modelo_veiculo: string;
	    versao_veiculo: string;
	    ano_veiculo: string;
	    marca_peca: string;
	    grupo_familia: string;
	    localizacao: string;
	    cod_barras: string;
	    similar_de: string;
	    filtrar_saldo: string;
	
	    static createFrom(source: any = {}) {
	        return new FiltrosProdutos(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.descricao = source["descricao"];
	        this.cod_fabricante = source["cod_fabricante"];
	        this.marca_veiculo = source["marca_veiculo"];
	        this.modelo_veiculo = source["modelo_veiculo"];
	        this.versao_veiculo = source["versao_veiculo"];
	        this.ano_veiculo = source["ano_veiculo"];
	        this.marca_peca = source["marca_peca"];
	        this.grupo_familia = source["grupo_familia"];
	        this.localizacao = source["localizacao"];
	        this.cod_barras = source["cod_barras"];
	        this.similar_de = source["similar_de"];
	        this.filtrar_saldo = source["filtrar_saldo"];
	    }
	}
	export class Fornecedor {
	    id: number;
	    ativo: boolean;
	    tipo_pessoa: string;
	    logo: string;
	    documento: string;
	    ie: string;
	    razao_social: string;
	    fantasia: string;
	    cep: string;
	    endereco: string;
	    numero: string;
	    bairro: string;
	    cidade: string;
	    uf: string;
	    contatos: string;
	    criado_em: string;
	
	    static createFrom(source: any = {}) {
	        return new Fornecedor(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.ativo = source["ativo"];
	        this.tipo_pessoa = source["tipo_pessoa"];
	        this.logo = source["logo"];
	        this.documento = source["documento"];
	        this.ie = source["ie"];
	        this.razao_social = source["razao_social"];
	        this.fantasia = source["fantasia"];
	        this.cep = source["cep"];
	        this.endereco = source["endereco"];
	        this.numero = source["numero"];
	        this.bairro = source["bairro"];
	        this.cidade = source["cidade"];
	        this.uf = source["uf"];
	        this.contatos = source["contatos"];
	        this.criado_em = source["criado_em"];
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
	export class GrupoAcesso {
	    id: number;
	    nome: string;
	    descricao: string;
	    permissoes: string;
	    ativo: boolean;
	
	    static createFrom(source: any = {}) {
	        return new GrupoAcesso(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nome = source["nome"];
	        this.descricao = source["descricao"];
	        this.permissoes = source["permissoes"];
	        this.ativo = source["ativo"];
	    }
	}
	export class Marca {
	    id: number;
	    nome: string;
	    margem: number;
	    mkp_balcao: number;
	    mkp_externo: number;
	    mkp_oficina: number;
	    criado_em: string;
	
	    static createFrom(source: any = {}) {
	        return new Marca(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nome = source["nome"];
	        this.margem = source["margem"];
	        this.mkp_balcao = source["mkp_balcao"];
	        this.mkp_externo = source["mkp_externo"];
	        this.mkp_oficina = source["mkp_oficina"];
	        this.criado_em = source["criado_em"];
	    }
	}
	export class MatrizFiscal {
	    id: number;
	    nome: string;
	    ativa: boolean;
	    regime_tributario: string;
	    operacao: string;
	    tipo_destino: string;
	    incidencia_st: string;
	    ncm: string;
	    prioridade: string;
	    cfop: string;
	    cst_csosn: string;
	    destaca_icms: boolean;
	    credito_icms: boolean;
	    incide_ipi: boolean;
	    incide_pis: boolean;
	    incide_cofins: boolean;
	    incide_difal: boolean;
	
	    static createFrom(source: any = {}) {
	        return new MatrizFiscal(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nome = source["nome"];
	        this.ativa = source["ativa"];
	        this.regime_tributario = source["regime_tributario"];
	        this.operacao = source["operacao"];
	        this.tipo_destino = source["tipo_destino"];
	        this.incidencia_st = source["incidencia_st"];
	        this.ncm = source["ncm"];
	        this.prioridade = source["prioridade"];
	        this.cfop = source["cfop"];
	        this.cst_csosn = source["cst_csosn"];
	        this.destaca_icms = source["destaca_icms"];
	        this.credito_icms = source["credito_icms"];
	        this.incide_ipi = source["incide_ipi"];
	        this.incide_pis = source["incide_pis"];
	        this.incide_cofins = source["incide_cofins"];
	        this.incide_difal = source["incide_difal"];
	    }
	}
	export class MovimentacaoEstoqueDto {
	    data_hora: string;
	    tipo: string;
	    descricao: string;
	    quantidade: number;
	    saldo_momento: number;
	    usuario: string;
	
	    static createFrom(source: any = {}) {
	        return new MovimentacaoEstoqueDto(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data_hora = source["data_hora"];
	        this.tipo = source["tipo"];
	        this.descricao = source["descricao"];
	        this.quantidade = source["quantidade"];
	        this.saldo_momento = source["saldo_momento"];
	        this.usuario = source["usuario"];
	    }
	}
	export class PerfilFiscal {
	    tipo_movimentacao: string;
	    com_nota_fiscal: boolean;
	    incide_st: boolean;
	    cfop_padrao: string;
	    cfop_descricao: string;
	    tipo_item: string;
	    finalidade: string;
	    cst_icms: string;
	    tem_icms_proprio: boolean;
	    destaca_icms: boolean;
	    gera_credito_icms: boolean;
	    tem_icms_st: boolean;
	    destaca_icms_st: boolean;
	    tem_reducao_base: boolean;
	    tem_difal: boolean;
	    destaca_difal: boolean;
	    icms_tipo_calculo: string;
	    indicador_presenca: string;
	    icms_st_credito: boolean;
	    difal_responsavel: string;
	    difal_considera_fcp: boolean;
	    tem_fcp: boolean;
	    tem_ipi: boolean;
	    destaca_ipi: boolean;
	    ipi_soma_custo: boolean;
	    ipi_gera_credito: boolean;
	    cst_ipi: string;
	    ipi_tipo_calculo: string;
	    calcula_pis: boolean;
	    cst_pis: string;
	    calcula_cofins: boolean;
	    cst_cofins: string;
	    piscofins_regime: string;
	    piscofins_base: string;
	    soma_st_custo: boolean;
	    soma_ipi_custo: boolean;
	    soma_frete_custo: boolean;
	    soma_despesas_custo: boolean;
	    soma_difal_custo: boolean;
	    forma_custo_medio: boolean;
	    atualiza_estoque: boolean;
	    tipo_movimento_estoque: string;
	    gera_financeiro: boolean;
	    reserva_estoque: boolean;
	    baixa_estoque: boolean;
	    permite_venda_negativa: boolean;
	    trava_sem_ncm: boolean;
	    trava_sem_cest: boolean;
	    trava_sem_cfop: boolean;
	    trava_sem_cst: boolean;
	    id: number;
	    nome: string;
	    tipo_operacao: string;
	    natureza_operacao: string;
	    regime_empresa: string;
	    finalidade_nfe: number;
	    ativo: boolean;
	    observacao_interna: string;
	
	    static createFrom(source: any = {}) {
	        return new PerfilFiscal(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.tipo_movimentacao = source["tipo_movimentacao"];
	        this.com_nota_fiscal = source["com_nota_fiscal"];
	        this.incide_st = source["incide_st"];
	        this.cfop_padrao = source["cfop_padrao"];
	        this.cfop_descricao = source["cfop_descricao"];
	        this.tipo_item = source["tipo_item"];
	        this.finalidade = source["finalidade"];
	        this.cst_icms = source["cst_icms"];
	        this.tem_icms_proprio = source["tem_icms_proprio"];
	        this.destaca_icms = source["destaca_icms"];
	        this.gera_credito_icms = source["gera_credito_icms"];
	        this.tem_icms_st = source["tem_icms_st"];
	        this.destaca_icms_st = source["destaca_icms_st"];
	        this.tem_reducao_base = source["tem_reducao_base"];
	        this.tem_difal = source["tem_difal"];
	        this.destaca_difal = source["destaca_difal"];
	        this.icms_tipo_calculo = source["icms_tipo_calculo"];
	        this.indicador_presenca = source["indicador_presenca"];
	        this.icms_st_credito = source["icms_st_credito"];
	        this.difal_responsavel = source["difal_responsavel"];
	        this.difal_considera_fcp = source["difal_considera_fcp"];
	        this.tem_fcp = source["tem_fcp"];
	        this.tem_ipi = source["tem_ipi"];
	        this.destaca_ipi = source["destaca_ipi"];
	        this.ipi_soma_custo = source["ipi_soma_custo"];
	        this.ipi_gera_credito = source["ipi_gera_credito"];
	        this.cst_ipi = source["cst_ipi"];
	        this.ipi_tipo_calculo = source["ipi_tipo_calculo"];
	        this.calcula_pis = source["calcula_pis"];
	        this.cst_pis = source["cst_pis"];
	        this.calcula_cofins = source["calcula_cofins"];
	        this.cst_cofins = source["cst_cofins"];
	        this.piscofins_regime = source["piscofins_regime"];
	        this.piscofins_base = source["piscofins_base"];
	        this.soma_st_custo = source["soma_st_custo"];
	        this.soma_ipi_custo = source["soma_ipi_custo"];
	        this.soma_frete_custo = source["soma_frete_custo"];
	        this.soma_despesas_custo = source["soma_despesas_custo"];
	        this.soma_difal_custo = source["soma_difal_custo"];
	        this.forma_custo_medio = source["forma_custo_medio"];
	        this.atualiza_estoque = source["atualiza_estoque"];
	        this.tipo_movimento_estoque = source["tipo_movimento_estoque"];
	        this.gera_financeiro = source["gera_financeiro"];
	        this.reserva_estoque = source["reserva_estoque"];
	        this.baixa_estoque = source["baixa_estoque"];
	        this.permite_venda_negativa = source["permite_venda_negativa"];
	        this.trava_sem_ncm = source["trava_sem_ncm"];
	        this.trava_sem_cest = source["trava_sem_cest"];
	        this.trava_sem_cfop = source["trava_sem_cfop"];
	        this.trava_sem_cst = source["trava_sem_cst"];
	        this.id = source["id"];
	        this.nome = source["nome"];
	        this.tipo_operacao = source["tipo_operacao"];
	        this.natureza_operacao = source["natureza_operacao"];
	        this.regime_empresa = source["regime_empresa"];
	        this.finalidade_nfe = source["finalidade_nfe"];
	        this.ativo = source["ativo"];
	        this.observacao_interna = source["observacao_interna"];
	    }
	}
	export class ProdutoConversao {
	    id: number;
	    produto_id: number;
	    marca: string;
	    codigo: string;
	
	    static createFrom(source: any = {}) {
	        return new ProdutoConversao(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.produto_id = source["produto_id"];
	        this.marca = source["marca"];
	        this.codigo = source["codigo"];
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
	    ativo: boolean;
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
	    aplicacoes: AplicacaoProduto[];
	    conversoes: ProdutoConversao[];
	
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
	        this.ativo = source["ativo"];
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
	        this.aplicacoes = this.convertValues(source["aplicacoes"], AplicacaoProduto);
	        this.conversoes = this.convertValues(source["conversoes"], ProdutoConversao);
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
	
	export class SolicitacaoCompra {
	    id: number;
	    produto: string;
	    marca: string;
	    observacao: string;
	    quantidade: string;
	    urgencia: string;
	    tipo_solicitacao: string;
	    solicitante_id: number;
	    solicitante_nome: string;
	    data_solicitacao: string;
	    codigo_erp: string;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new SolicitacaoCompra(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.produto = source["produto"];
	        this.marca = source["marca"];
	        this.observacao = source["observacao"];
	        this.quantidade = source["quantidade"];
	        this.urgencia = source["urgencia"];
	        this.tipo_solicitacao = source["tipo_solicitacao"];
	        this.solicitante_id = source["solicitante_id"];
	        this.solicitante_nome = source["solicitante_nome"];
	        this.data_solicitacao = source["data_solicitacao"];
	        this.codigo_erp = source["codigo_erp"];
	        this.status = source["status"];
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
	    grupo_acesso_id: number;
	    nome_grupo: string;
	    precisa_alterar_senha: boolean;
	    ativo: boolean;
	    ultimo_acesso: string;
	
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
	        this.grupo_acesso_id = source["grupo_acesso_id"];
	        this.nome_grupo = source["nome_grupo"];
	        this.precisa_alterar_senha = source["precisa_alterar_senha"];
	        this.ativo = source["ativo"];
	        this.ultimo_acesso = source["ultimo_acesso"];
	    }
	}

}

