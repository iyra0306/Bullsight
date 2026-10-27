const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');

router.get('/news', stocksController.getNews);
router.get('/news/:symbol', stocksController.getNews);

module.exports = router;
