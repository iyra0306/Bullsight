import { env } from '../config/env.js';
import { mockMarketProvider } from './providers/mockMarketProvider.js';
import { externalMarketProvider } from './providers/externalMarketProvider.js';
import { ApiError } from '../utils/apiError.js';

function getActiveProvider() {
  if (env.MARKET_DATA_API_KEY && env.MARKET_DATA_PROVIDER_URL) {
    return externalMarketProvider;
  }
  return mockMarketProvider;
}

export const marketDataService = {
  getProviderStatus() {
    const active = getActiveProvider();
    return {
      provider: active.providerName,
      dataStatus: active.dataStatus,
      isLiveConfigured: Boolean(env.MARKET_DATA_API_KEY && env.MARKET_DATA_PROVIDER_URL),
    };
  },

  async getMarketOverview(region = 'ALL', period = '3M') {
    const provider = getActiveProvider();
    if (provider === externalMarketProvider) {
      const raw = await externalMarketProvider.request('/market/overview', { region, period });
      return {
        indices: Array.isArray(raw?.indices) ? raw.indices : [],
        dataSource: externalMarketProvider.providerName,
        dataStatus: externalMarketProvider.dataStatus,
        isSampleData: false,
        timestamp: new Date().toISOString(),
      };
    }

    const indices = await mockMarketProvider.getIndices(region, period);
    return {
      indices,
      dataSource: mockMarketProvider.providerName,
      dataStatus: 'sample',
      isSampleData: true,
      notice: 'Sample market indices displayed. Configure MARKET_DATA_API_KEY and MARKET_DATA_PROVIDER_URL for live market feeds.',
      timestamp: new Date().toISOString(),
    };
  },

  async getMarketMovers(region = 'ALL', limit = 4) {
    const provider = getActiveProvider();
    if (provider === externalMarketProvider) {
      const raw = await externalMarketProvider.request('/market/movers', { region, limit });
      return {
        topGainers: raw?.topGainers || [],
        topLosers: raw?.topLosers || [],
        mostActive: raw?.mostActive || [],
        dataSource: externalMarketProvider.providerName,
        dataStatus: externalMarketProvider.dataStatus,
        isSampleData: false,
        timestamp: new Date().toISOString(),
      };
    }

    const stocks = await mockMarketProvider.getStocks({ region });
    const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, limit);
    const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, limit);
    const mostActive = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, limit);

    return {
      topGainers,
      topLosers,
      mostActive,
      dataSource: mockMarketProvider.providerName,
      dataStatus: 'sample',
      isSampleData: true,
      timestamp: new Date().toISOString(),
    };
  },

  async listStocks(filters = {}) {
    const provider = getActiveProvider();
    if (provider === externalMarketProvider) {
      return externalMarketProvider.request('/stocks', filters);
    }
    return mockMarketProvider.getStocks(filters);
  },

  async searchStocks(query) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw ApiError.badRequest('Query parameter "q" is required for stock search.', null, 'MISSING_SEARCH_QUERY');
    }
    const provider = getActiveProvider();
    if (provider === externalMarketProvider) {
      return externalMarketProvider.request('/stocks/search', { q: query.trim() });
    }
    return mockMarketProvider.searchStocks(query);
  },

  async getStockDetails(symbol) {
    const provider = getActiveProvider();
    if (provider === externalMarketProvider) {
      return externalMarketProvider.request(`/stocks/${encodeURIComponent(symbol)}`);
    }
    return mockMarketProvider.getStockBySymbol(symbol);
  },

  async getStockHistory(symbol, params) {
    const provider = getActiveProvider();
    if (provider === externalMarketProvider) {
      return externalMarketProvider.request(`/stocks/${encodeURIComponent(symbol)}/history`, params);
    }
    return mockMarketProvider.getStockHistory(symbol, params);
  },
};
