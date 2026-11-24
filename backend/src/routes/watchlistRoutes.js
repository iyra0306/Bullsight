import { Router } from 'express';
import {
  addWatchlistItem,
  deleteWatchlistItem,
  getWatchlist,
} from '../controllers/watchlistController.js';
import { requireJsonObjectBody } from '../middleware/validateRequest.js';

const router = Router();
router.get('/', getWatchlist);
router.post('/', requireJsonObjectBody, addWatchlistItem);
router.delete('/:symbol', deleteWatchlistItem);

export default router;
