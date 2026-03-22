const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Cache com TTL padrão de 24 horas (86400 segundos) e verifica vencimentos a cada 120 segundos
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

function get(key) {
    return cache.get(key);
}

function set(key, data) {
    logger.info(`[CACHE] Chave armazenada por 24h: ${key}`);
    return cache.set(key, data);
}

module.exports = {
    get,
    set,
    internalCache: cache
};
