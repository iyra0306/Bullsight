import { newsService } from '../services/newsService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { validatePositiveInt } from '../utils/validators.js';
import { ApiError } from '../utils/apiError.js';

export async function listNews(req, res, next) {
  try {
    const page = validatePositiveInt(req.query.page, 1, 1, 1000, 'page');
    const limit = validatePositiveInt(req.query.limit, 12, 1, 50, 'limit');
    const category = req.query.category ? String(req.query.category) : undefined;
    const symbol = req.query.symbol ? String(req.query.symbol) : undefined;
    const sentiment = req.query.sentiment ? String(req.query.sentiment) : undefined;
    const q = req.query.q ? String(req.query.q) : undefined;

    const result = await newsService.listNews({
      category,
      symbol,
      sentiment,
      q,
      page,
      limit,
    });

    return sendSuccess(res, { data: result });
  } catch (error) {
    return next(error);
  }
}

export async function getNewsById(req, res, next) {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
      throw ApiError.badRequest('Invalid news article identifier.', null, 'INVALID_NEWS_ID');
    }
    const article = await newsService.getById(id);
    return sendSuccess(res, { data: article });
  } catch (error) {
    return next(error);
  }
}
