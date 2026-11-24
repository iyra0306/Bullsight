import { apiClient } from './apiClient';
import { NewsArticle } from '../types/market';

export interface NewsListResponse {
  articles: NewsArticle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  dataSource: string;
  dataStatus: string;
  isDemoData: boolean;
}

export const newsService = {
  fetchNews(
    params?: {
      category?: string;
      symbol?: string;
      sentiment?: string;
      q?: string;
      page?: number;
      limit?: number;
    },
    signal?: AbortSignal
  ): Promise<NewsListResponse> {
    return apiClient.get<NewsListResponse>(
      '/news',
      {
        category: params?.category,
        symbol: params?.symbol,
        sentiment: params?.sentiment,
        q: params?.q,
        page: params?.page,
        limit: params?.limit,
      },
      signal
    );
  },

  fetchNewsById(id: string, signal?: AbortSignal): Promise<NewsArticle> {
    return apiClient.get<NewsArticle>(`/news/${encodeURIComponent(id)}`, undefined, signal);
  },
};
