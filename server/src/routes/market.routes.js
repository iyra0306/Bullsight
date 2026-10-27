const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');

router.get('/market/overview', stocksController.getMarketOverview);
router.get('/screener', stocksController.getScreener);

module.exports = router;
