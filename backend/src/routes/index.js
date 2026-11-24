import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import marketRoutes from './marketRoutes.js';
import stockRoutes from './stockRoutes.js';
import watchlistRoutes from './watchlistRoutes.js';
import newsRoutes from './newsRoutes.js';
import predictionRoutes from './predictionRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/market', marketRoutes);
router.use('/stocks', stockRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/news', newsRoutes);
router.use('/predictions', predictionRoutes);

export default router;
