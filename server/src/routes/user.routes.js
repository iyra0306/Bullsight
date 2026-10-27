const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateWatchlistAdd, validateHoldingAdd, validateSymbol } = require('../middleware/validator');

// Watchlist CRUD endpoints
router.get('/user/watchlist', userController.getWatchlist);
router.post('/user/watchlist', validateWatchlistAdd, userController.addWatchlist);
router.delete('/user/watchlist/:symbol', validateSymbol, userController.deleteWatchlist);

// Portfolio CRUD endpoints
router.get('/user/portfolio', userController.getPortfolio);
router.post('/user/portfolio', validateHoldingAdd, userController.addHolding);
router.delete('/user/portfolio/:identifier', userController.deleteHolding);

module.exports = router;
