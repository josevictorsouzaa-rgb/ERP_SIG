const logger = require('../utils/logger');

const MARCAS_CONHECIDAS = [
    'VOLKSWAGEN', 'VW', 'CHEVROLET', 'GM', 'FIAT', 'FORD', 'AUDI', 'BMW', 'MERCEDES', 'MERCEDES-BENZ', 'MB',
    'TOYOTA', 'HONDA', 'HYUNDAI', 'KIA', 'RENAULT', 'PEUGEOT', 'CITROEN', 'MITSUBISHI', 'NISSAN', 'CHERY', 
    'CAOA', 'JEEP', 'LAND ROVER', 'VOLVO', 'DODGE', 'CHRYSLER', 'IVECO', 'SCANIA', 'PORSCHE', 'FERRARI',
    'RAM', 'Tローラー', 'TROLLER', 'JAC', 'LIFAN', 'SUZUKI', 'SUBARU'
];

/**
 * Normaliza os dados vindos da API Local (que provê dados da DPK)
 * Baseado na estrutura PROFUNDA do JSON fornecido pelo usuário.
 */
function normalizarProduto(codigoPesquisado, rawData) {
    logger.info(`[PARSER] Aplicando mapeamento profundo para: ${codigoPesquisado}`);
    
    const rootProd = rawData.produto || {};
    const detalhe = rawData.detalhe || {};
    const p = detalhe.product || rootProd;
    const ti = detalhe.technicalInformation || {};
    const specs = detalhe.specification || [];
    const apps = detalhe.application || [];
    const equivs = detalhe.equivalent || [];

    // 1. Mapeamento do Produto
    const produto = {
        id: p.id || rootProd.id || 0,
        codigo: p.code || p.codigo || rootProd.code || '',
        descricao: p.description || p.descricao || rootProd.description || '',
        fabricante: p.manufacturer || p.fabricante || rootProd.manufacturer || '',
        grupo: p.group || p.grupo || '',
        subgrupo: p.subGroup || p.subgroup || '',
        sapCode: p.sapCode || rootProd.sapCode || '',
        ean: ti.eanCode || '',
        ncm: ti.ncmCode || '',
        imagem: rawData.imagem || p.image || rootProd.image || null
    };

    if (produto.imagem && !produto.imagem.startsWith('http')) {
        produto.imagem = `https://cdn-superk.azureedge.net/img/${produto.imagem}`;
    }

    // 2. Mapeamentos de listas
    const especificacoes = Array.isArray(specs) ? specs.map(s => ({
        campo: s.name || '',
        valor: s.description || ''
    })) : [];

    const aplicacoes = Array.isArray(apps) ? apps.map(app => {
        const fullDesc = app.application || '';
        const { marca, modelo, motorVersao } = separarAplicacao(fullDesc);
        
        return {
            textoOriginal: fullDesc,
            marca,
            modelo,
            motorVersao,
            inicio: formatarDataAno(app.startDate),
            fim: formatarDataAno(app.endDate)
        };
    }) : [];

    const equivalentes = Array.isArray(equivs) ? equivs.map(eq => {
        const eqDet = eq.equivalentProductDetail ? eq.equivalentProductDetail.product : null;
        return {
            fabricante: eqDet ? eqDet.manufacturer : (eq.manufacturer || ''),
            codigo: eqDet ? eqDet.code : (eq.code || (eq.description ? eq.description.split(' ').pop() : '')),
            descricao: eq.description || (eqDet ? eqDet.description : '')
        };
    }) : [];

    return {
        produto,
        especificacoes,
        aplicacoes,
        equivalentes
    };
}

/**
 * Separa a string de aplicação em Marca, Modelo e Motor/Versão com lógica aprimorada
 */
function separarAplicacao(texto) {
    if (!texto) return { marca: '', modelo: '', motorVersao: '' };
    
    const textoUpper = texto.toUpperCase().trim();
    let marca = '';
    let restante = '';

    // 1. Tenta encontrar marcas conhecidas no início
    for (const mCo of MARCAS_CONHECIDAS) {
        // Verifica se o texto começa com a marca seguida de espaço ou parêntese
        const regex = new RegExp(`^(${mCo})(\\s+\\(.*?\\))?\\s+`, 'i');
        const match = textoUpper.match(regex);
        if (match) {
            marca = (match[1] + (match[2] || '')).trim();
            restante = textoUpper.replace(regex, '').trim();
            break;
        }
    }

    // 2. Fallback se não bater com a lista de marcas conhecidas
    if (!marca) {
        // Procura padrão marca (apelido) -> EX: VOLKSWAGEN (VW)
        const regexPadrao = /^([^\(]+(?:\([^\)]+\))?)\s+(.*)/i;
        const match = textoUpper.match(regexPadrao);
        if (match) {
            // Se a primeira parte for muito longa (mais de 20 chars), provavelmente o regex pegou demais
            const tempMarca = match[1].trim();
            if (tempMarca.length < 25) {
                marca = tempMarca;
                restante = match[2].trim();
            }
        }
    }

    // 3. Último recurso: Marca é a primeira palavra
    if (!marca) {
        const parts = textoUpper.split(' ');
        marca = parts[0];
        restante = parts.slice(1).join(' ');
    }

    // --- SEPARAÇÃO DE MODELO ---
    const restParts = restante.split(' ');
    let modelo = restParts[0] || '';
    let motorVersao = restParts.slice(1).join(' ');

    // Se a segunda palavra for parte do modelo (curta ou padrão G5, G6, etc)
    if (restParts.length > 1) {
        const secondWord = restParts[1];
        // Critérios para ser parte do modelo: 3 letras ou menos, ou padrão G-Número, ou "A1", "A3", etc.
        const ehParteModelo = secondWord.length <= 3 || /^[GA]\d+$/.test(secondWord) || /^(HI|II|III|IV|V|VI)$/.test(secondWord);
        
        if (ehParteModelo) {
            modelo += ' ' + secondWord;
            motorVersao = restParts.slice(2).join(' ');
        }
    }

    return {
        marca: marca.trim(),
        modelo: modelo.trim(),
        motorVersao: motorVersao.trim()
    };
}

function formatarDataAno(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return isNaN(date.getFullYear()) ? '' : String(date.getFullYear());
    } catch (e) {
        return '';
    }
}

module.exports = {
    normalizarProduto
};
