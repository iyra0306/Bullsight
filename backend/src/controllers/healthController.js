import { env } from '../config/env.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { marketDataService } from '../services/marketDataService.js';
import { newsService } from '../services/newsService.js';
import { predictionService } from '../services/predictionService.js';

export function getHealth(_req, res) {
  return sendSuccess(res, {
    data: {
      application: 'BULLSIGHT API',
      status: 'ok',
      apiVersion: 'v1',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      services: {
        marketData: marketDataService.getProviderStatus(),
        news: newsService.getProviderStatus(),
        aiPrediction: predictionService.getServiceStatus(),
        database: {
          configured: false,
          status: 'planned-phase-3-mongodb',
        },
        cache: {
          configured: false,
          status: 'planned-redis',
        },
      },
    },
  });
}
