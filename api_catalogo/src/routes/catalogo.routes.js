const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogo.controller');

router.get('/produto', catalogoController.buscarProduto);
router.post('/lote', catalogoController.buscarLote);

module.exports = router;
