import { watchlistService } from '../services/watchlistService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { sanitizeSymbol } from '../utils/validators.js';

export async function getWatchlist(_req, res, next) {
  try {
    const result = await watchlistService.getAll();
    return sendSuccess(res, { data: result });
  } catch (error) {
    return next(error);
  }
}

export async function addWatchlistItem(req, res, next) {
  try {
    const symbol = sanitizeSymbol(req.body?.symbol);
    const notes = req.body?.notes;
    const result = await watchlistService.add(symbol, notes);
    return sendSuccess(res, { data: result, statusCode: 201 });
  } catch (error) {
    return next(error);
  }
}

export async function deleteWatchlistItem(req, res, next) {
  try {
    const symbol = sanitizeSymbol(req.params.symbol);
    const result = await watchlistService.remove(symbol);
    return sendSuccess(res, { data: result });
  } catch (error) {
    return next(error);
  }
}
