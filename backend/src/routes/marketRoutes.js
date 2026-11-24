import { Router } from 'express';
import { getMarketMovers, getMarketOverview } from '../controllers/marketController.js';

const router = Router();
router.get('/overview', getMarketOverview);
router.get('/movers', getMarketMovers);

export default router;
