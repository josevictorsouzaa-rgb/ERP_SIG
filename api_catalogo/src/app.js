const express = require('express');
const cors = require('cors');
const catalogoRoutes = require('./routes/catalogo.routes');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.json());

// Rota de Healthcheck
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Rotas de Catálogo
app.use('/api/catalogo', catalogoRoutes);

// Tratamento de endpoint não encontrado (404)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
    logger.error('Erro interno:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

module.exports = app;
