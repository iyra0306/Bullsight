const express = require('express');
const router = express.Router();
const stocksController = require('../controllers/stocksController');
const { validateAIChat } = require('../middleware/validator');
const { strictLimiter } = require('../middleware/rateLimiter');

router.post('/ai/chat', strictLimiter, validateAIChat, stocksController.askAIChat);
router.get('/model/metrics', stocksController.getModelMetrics);
router.post('/model/train', strictLimiter, stocksController.triggerTraining);

module.exports = router;
