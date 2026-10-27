const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');
const { validateSymbol } = require('../middleware/validator');

router.get('/predictions/:symbol', validateSymbol, stocksController.getPrediction);

module.exports = router;
