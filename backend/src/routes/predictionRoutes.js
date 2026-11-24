import { Router } from 'express';
import {
  createPrediction,
  getPredictionBySymbol,
  getPredictionHistory,
} from '../controllers/predictionController.js';
import { requireJsonObjectBody } from '../middleware/validateRequest.js';

const router = Router();
router.post('/', requireJsonObjectBody, createPrediction);
router.get('/:symbol/history', getPredictionHistory);
router.get('/:symbol', getPredictionBySymbol);

export default router;
