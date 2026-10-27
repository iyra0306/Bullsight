const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');
const { validateSymbol } = require('../middleware/validator');

router.get('/stocks', stocksController.getCatalog);
router.get('/stocks/search', stocksController.searchCatalog);
router.get('/stocks/:symbol', validateSymbol, stocksController.getStockSummary);
router.get('/stocks/:symbol/history', validateSymbol, stocksController.getStockHistory);
router.get('/stocks/:symbol/indicators', validateSymbol, stocksController.getIndicators);
router.get('/stocks/:symbol/prediction', validateSymbol, stocksController.getPrediction);

module.exports = router;
