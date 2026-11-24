import axios from 'axios';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';

/**
 * External Market Data Provider Adapter
 * Used ONLY when MARKET_DATA_API_KEY and MARKET_DATA_PROVIDER_URL are configured.
 * Never silently falls back to mock/sample prices if an upstream request fails.
 */
export const externalMarketProvider = {
  providerName: 'external-market-api',
  dataStatus: 'real-time-or-delayed',

  async request(path, params = {}) {
    try {
      const response = await axios.get(`${env.MARKET_DATA_PROVIDER_URL}${path}`, {
        params,
        headers: {
          Authorization: `Bearer ${env.MARKET_DATA_API_KEY}`,
          'X-API-Key': env.MARKET_DATA_API_KEY,
        },
        timeout: 8000,
      });
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 429) {
        throw ApiError.tooManyRequests(
          'External market data provider rate limit exceeded. Please retry shortly.',
          { provider: this.providerName }
        );
      }
      if (status === 404) {
        throw ApiError.notFound('Requested symbol was not found by the external provider.');
      }
      throw ApiError.badGateway(
        'External market data provider request failed.',
        {
          provider: this.providerName,
          upstreamStatus: status || 'UNREACHABLE',
        },
        'EXTERNAL_PROVIDER_ERROR'
      );
    }
  },
};
