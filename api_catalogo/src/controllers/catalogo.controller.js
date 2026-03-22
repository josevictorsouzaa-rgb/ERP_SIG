const providerService = require('../services/provider.service');
const parserService = require('../services/parser.service');
const cacheService = require('../services/cache.service');
const logger = require('../utils/logger');

async function buscarProduto(req, res, next) {
    try {
        const { codigo } = req.query;
        if (!codigo) {
            return res.status(400).json({ error: 'Código do produto é obrigatório' });
        }

        logger.info(`[REQ] GET /produto?codigo=${codigo}`);

        // Verificar Cache
        const cacheKey = `PRODUTO_${codigo.toUpperCase()}`;
        const cachedData = cacheService.get(cacheKey);
        
        if (cachedData) {
            logger.info(`[CACHE] Produto ${codigo} retornado do cache.`);
            return res.json(cachedData);
        }

        // Tentar buscar nos Provedores (Orquestrador)
        const providerResponse = await providerService.buscarEmProvedores(codigo);
        
        if (!providerResponse) {
            logger.warn(`Produto não encontrado em nenhum provedor: ${codigo}`);
            return res.status(404).json({
                codigoPesquisado: codigo,
                encontrado: false,
                mensagem: 'Produto não localizado nas bases de dados conectadas.'
            });
        }

        const { provider, data } = providerResponse;
        logger.info(`[SUCCESS] Produto ${codigo} encontrado via Provedor: ${provider}`);

        // APLICAR PARSER (Tratamento seguindo regras do usuário)
        const normalized = parserService.normalizarProduto(codigo, data);

        // Construir o JSON final estruturado para o ERP
        const result = {
            codigoPesquisado: codigo,
            encontrado: true,
            provider: provider,
            produto: normalized.produto,
            especificacoes: normalized.especificacoes,
            aplicacoes: normalized.aplicacoes,
            equivalentes: normalized.equivalentes,
            // Adicional para debug no ERP (Mantém o JSON bruto da ORIGEM conforme solicitado)
            rawResponse: data 
        };

        // Salvar no Cache (TTL 24h)
        cacheService.set(cacheKey, result);

        return res.json(result);

    } catch (error) {
        next(error);
    }
}

async function buscarLote(req, res, next) {
    try {
        const { codigos } = req.body;
        if (!codigos || !Array.isArray(codigos)) {
            return res.status(400).json({ error: 'Lista de códigos (array) é obrigatória' });
        }

        logger.info(`[REQ] POST /lote - Total de itens: ${codigos.length}`);

        const resultados = [];

        for (const codigo of codigos) {
            const cacheKey = `PRODUTO_${codigo.toUpperCase()}`;
            let cached = cacheService.get(cacheKey);

            if (cached) {
                resultados.push(cached);
            } else {
                const provRes = await providerService.buscarEmProvedores(codigo);
                if (provRes) {
                    const normalized = parserService.normalizarProduto(codigo, provRes.data);
                    const item = {
                        codigoPesquisado: codigo,
                        encontrado: true,
                        provider: provRes.provider,
                        produto: normalized.produto,
                        aplicacoes: normalized.aplicacoes,
                        equivalentes: normalized.equivalentes,
                        rawResponse: provRes.data
                    };
                    cacheService.set(cacheKey, item);
                    resultados.push(item);
                } else {
                    resultados.push({
                        codigoPesquisado: codigo,
                        encontrado: false
                    });
                }
            }
        }

        return res.json(resultados);

    } catch (error) {
        next(error);
    }
}

module.exports = {
    buscarProduto,
    buscarLote
};
