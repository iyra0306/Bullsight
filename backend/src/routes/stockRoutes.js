import { Router } from 'express';
import {
  getStockDetails,
  getStockHistory,
  listStocks,
  searchStocks,
} from '../controllers/stockController.js';

const router = Router();
router.get('/', listStocks);
router.get('/search', searchStocks);
router.get('/:symbol', getStockDetails);
router.get('/:symbol/history', getStockHistory);

export default router;
