import { apiClient } from './apiClient';
import { Exchange, MarketRegion, OhlcBar, StockQuote, Timeframe } from '../types/market';

export interface StocksListResponse {
  stocks: StockQuote[];
  count: number;
  dataSource: string;
  dataStatus: string;
}

export interface StockSearchResponse {
  query: string;
  stocks: StockQuote[];
  count: number;
  dataSource: string;
  dataStatus: string;
}

export interface StockHistoryResponse {
  symbol: string;
  market: 'IN' | 'US';
  exchange: Exchange;
  currency: 'INR' | 'USD';
  period: Timeframe;
  bars: OhlcBar[];
  dataTimestamp: string;
  dataSource: string;
  dataStatus: string;
  isSampleData?: boolean;
}

export interface WatchlistEntry {
  symbol: string;
  addedAt: string;
  notes: string;
  quote: StockQuote;
}

export interface WatchlistResponse {
  items: WatchlistEntry[];
  symbols: string[];
  storageMode: string;
  isPersistentDatabase: boolean;
  persistenceNotice: string;
}

export const stockService = {
  fetchStocks(
    filters?: {
      region?: MarketRegion;
      exchange?: 'ALL' | Exchange;
      sector?: string;
      direction?: 'ALL' | 'GAINERS' | 'LOSERS';
    },
    signal?: AbortSignal
  ): Promise<StocksListResponse> {
    return apiClient.get<StocksListResponse>(
      '/stocks',
      {
        region: filters?.region,
        exchange: filters?.exchange,
        sector: filters?.sector,
        direction: filters?.direction,
      },
      signal
    );
  },

  searchStocks(query: string, signal?: AbortSignal): Promise<StockSearchResponse> {
    return apiClient.get<StockSearchResponse>('/stocks/search', { q: query }, signal);
  },

  fetchStockBySymbol(symbol: string, signal?: AbortSignal): Promise<StockQuote> {
    return apiClient.get<StockQuote>(`/stocks/${encodeURIComponent(symbol)}`, undefined, signal);
  },

  fetchStockHistory(
    symbol: string,
    params: { period?: Timeframe; interval?: string; from?: string; to?: string } = {},
    signal?: AbortSignal
  ): Promise<StockHistoryResponse> {
    return apiClient.get<StockHistoryResponse>(
      `/stocks/${encodeURIComponent(symbol)}/history`,
      {
        period: params.period || '3M',
        interval: params.interval,
        from: params.from,
        to: params.to,
      },
      signal
    );
  },

  fetchWatchlist(signal?: AbortSignal): Promise<WatchlistResponse> {
    return apiClient.get<WatchlistResponse>('/watchlist', undefined, signal);
  },

  addToWatchlist(
    symbol: string,
    notes = '',
    signal?: AbortSignal
  ): Promise<{ item: WatchlistEntry; storageMode: string; persistenceNotice: string }> {
    return apiClient.post('/watchlist', { symbol, notes }, signal);
  },

  removeFromWatchlist(
    symbol: string,
    signal?: AbortSignal
  ): Promise<{ removedSymbol: string; storageMode: string }> {
    return apiClient.delete(`/watchlist/${encodeURIComponent(symbol)}`, signal);
  },
};
