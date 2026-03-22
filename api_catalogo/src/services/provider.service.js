const axios = require('axios');
const logger = require('../utils/logger');

const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'http://192.168.1.66:9010/api/produto';

/**
 * Busca em múltiplos provedores. Futuramente, pode-se adicionar 'site_secundario', etc.
 */
async function buscarEmProvedores(codigo) {
    // Provedor 1: API Local / DPK
    try {
        logger.info(`[PROVIDER] Consultando Provedor (API Local): ${codigo}`);
        const response = await axios.get(`${EXTERNAL_API_URL}?codigo=${encodeURIComponent(codigo)}`);

        if (response.data && response.data.encontrado) {
            return {
                provider: 'api_local',
                data: response.data
            };
        }
    } catch (error) {
        logger.error(`[PROVIDER] Falha no Provedor API Local: ${error.message}`);
    }

    // Se no futuro houver outro provedor:
    /*
    try {
        const res2 = await axios.get(`http://outro-site.com/api/v1/busca?sku=${codigo}`);
        if(res2.data.ok) return { provider: 'site_externo_2', data: res2.data };
    } catch(e) {}
    */

    return null;
}

module.exports = {
    buscarEmProvedores
};
