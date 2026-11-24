import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, ChevronRight, Star } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { marketService } from '../services/marketService';
import { newsService } from '../services/newsService';
import { aiService } from '../services/aiService';
import { ApiClientError } from '../services/apiClient';
import { MarketIndexCard } from '../components/MarketIndexCard';
import { ChartContainer } from '../components/ChartContainer';
import { StockCard } from '../components/StockCard';
import { NewsCard } from '../components/NewsCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ApiErrorState } from '../components/ApiErrorState';
import { MarketIndex, NewsArticle, StockQuote, Timeframe } from '../types/market';
import { formatCompactNumber, formatCurrency, formatPercent } from '../utils/formatters';

export const OverviewPage: React.FC = () => {
  const { region, profile, watchlistItems, watchlistLoading, watchlistError, refreshWatchlist, settings } =
    useApp();

  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [selectedIndexId, setSelectedIndexId] = useState<string>('nifty50');
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<{ message: string; code?: string } | null>(null);
  const [dataSourceLabel, setDataSourceLabel] = useState<string>('Sample Market Reference');

  const [gainers, setGainers] = useState<StockQuote[]>([]);
  const [losers, setLosers] = useState<StockQuote[]>([]);
  const [mostActive, setMostActive] = useState<StockQuote[]>([]);
  const [moversLoading, setMoversLoading] = useState(true);
  const [moversError, setMoversError] = useState<{ message: string; code?: string } | null>(null);
  const [moverTab, setMoverTab] = useState<'gainers' | 'losers' | 'active'>('gainers');

  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<{ message: string; code?: string } | null>(null);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const todayFormatted = 'Monday, November 23, 2026';

  const loadOverview = useCallback(async (signal?: AbortSignal) => {
    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const res = await marketService.fetchMarketOverview('ALL', timeframe, signal);
      setIndices(res.indices || []);
      setDataSourceLabel(
        res.isSampleData
          ? `Sample Snapshot Active (${res.dataSource})`
          : `Feed Connected (${res.dataSource})`
      );
      if (res.indices?.length && !res.indices.some((i) => i.id === selectedIndexId)) {
        setSelectedIndexId(res.indices[0].id);
      }
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'REQUEST_ABORTED') return;
      setOverviewError({
        message: error instanceof Error ? error.message : 'Failed to load market overview.',
        code: error instanceof ApiClientError ? error.code : undefined,
      });
    } finally {
      if (!signal?.aborted) setOverviewLoading(false);
    }
  }, [timeframe, selectedIndexId]);

  const loadMovers = useCallback(async (signal?: AbortSignal) => {
    setMoversLoading(true);
    setMoversError(null);
    try {
      const res = await marketService.fetchMarketMovers(region, 4, signal);
      setGainers(res.topGainers || []);
      setLosers(res.topLosers || []);
      setMostActive(res.mostActive || []);
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'REQUEST_ABORTED') return;
      setMoversError({
        message: error instanceof Error ? error.message : 'Failed to load market movers.',
        code: error instanceof ApiClientError ? error.code : undefined,
      });
    } finally {
      if (!signal?.aborted) setMoversLoading(false);
    }
  }, [region]);

  const loadNews = useCallback(async (signal?: AbortSignal) => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const res = await newsService.fetchNews({ limit: 3, page: 1 }, signal);
      setLatestNews(res.articles || []);
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'REQUEST_ABORTED') return;
      setNewsError({
        message: error instanceof Error ? error.message : 'Failed to load demonstration news.',
        code: error instanceof ApiClientError ? error.code : undefined,
      });
    } finally {
      if (!signal?.aborted) setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadOverview(controller.signal);
    return () => controller.abort();
  }, [loadOverview]);

  useEffect(() => {
    const controller = new AbortController();
    void loadMovers(controller.signal);
    return () => controller.abort();
  }, [loadMovers]);

  useEffect(() => {
    const controller = new AbortController();
    void loadNews(controller.signal);
    return () => controller.abort();
  }, [loadNews]);

  const selectedIndex = useMemo(
    () => indices.find((idx) => idx.id === selectedIndexId) || indices[0] || null,
    [indices, selectedIndexId]
  );

  const indexHistory = selectedIndex?.history || [];

  const activeMovers =
    moverTab === 'gainers' ? gainers : moverTab === 'losers' ? losers : mostActive;

  const watchlistStocks = useMemo(
    () => watchlistItems.map((item) => item.quote).filter(Boolean).slice(0, 4),
    [watchlistItems]
  );

  const aiInsightSymbols = ['NVDA', 'RELIANCE', 'INFY'];
  const aiInsights = useMemo(
    () => aiInsightSymbols.map((sym) => aiService.getIllustrativePrediction(sym, '30D')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#53645A] dark:text-[#91A197]">
            {todayFormatted} · Express API Connected · Sample Market Reference
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA] sm:text-3xl">
            Welcome back, {profile.name.split(' ')[0]}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="rounded-lg border border-black/10 bg-white px-3.5 py-2 text-[#53645A] dark:border-white/8 dark:bg-[#18211C] dark:text-[#91A197]">
            Feed Status:{' '}
            <span className="font-semibold text-[#137949] dark:text-[#36C982]">
              {dataSourceLabel}
            </span>
          </div>
          <Link
            to="/app/explore"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#36C982] px-3.5 py-2 font-semibold text-[#0B120E] transition-colors hover:bg-[#A5EBC3]"
          >
            <span>Screen Stocks</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Market Index Cards */}
      <section aria-label="Market indices">
        {overviewError ? (
          <ApiErrorState
            title="Market indices unavailable"
            message={overviewError.message}
            code={overviewError.code}
            onRetry={() => void loadOverview()}
          />
        ) : overviewLoading && indices.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {indices.map((idx) => (
              <MarketIndexCard
                key={idx.id}
                index={idx}
                active={selectedIndex?.id === idx.id}
                onSelect={(next) => setSelectedIndexId(next.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Main Market Performance Chart + AI Market Insights Preview */}
      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C] xl:col-span-8">
          {overviewLoading && !selectedIndex ? (
            <LoadingSkeleton variant="chart" />
          ) : selectedIndex ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-[#53645A] dark:text-[#91A197]">
                    Index Performance · {selectedIndex.exchange}
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#101814] dark:text-[#E8F0EA]">
                    {selectedIndex.symbol} — {selectedIndex.name}
                  </h2>
                </div>

                <div className="flex rounded-lg border border-black/10 bg-black/[0.02] p-0.5 dark:border-white/8 dark:bg-[#141C17]">
                  {(['1W', '1M', '3M', '6M', '1Y'] as Timeframe[]).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`rounded-md px-2.5 py-1 font-mono-num text-xs font-semibold transition-colors ${
                        timeframe === tf
                          ? 'bg-[#36C982] text-[#0B120E]'
                          : 'text-[#53645A] hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <ChartContainer
                bars={indexHistory}
                mode={settings.defaultChartStyle}
                showVolume
                height={330}
              />
            </>
          ) : (
            <div className="py-20 text-center text-xs text-[#53645A] dark:text-[#91A197]">
              No index chart data returned by backend.
            </div>
          )}
        </div>

        {/* Illustrative AI Market Insights Preview */}
        <div className="flex flex-col justify-between rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C] xl:col-span-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#137949] dark:text-[#36C982]" />
                <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                  AI Insights Preview
                </h2>
              </div>
              <span className="text-[11px] text-[#53645A] dark:text-[#91A197]">
                Illustrative
              </span>
            </div>
            <p className="mt-1 text-xs text-[#53645A] dark:text-[#91A197]">
              Sample 30-day directional scenario previews (Python ML service pending).
            </p>

            <div className="mt-4 space-y-3">
              {aiInsights.map((insight) => {
                const quote = marketService.getStockBySymbol(insight.symbol)!;
                const lead = insight.scenarios[0];
                return (
                  <Link
                    key={insight.symbol}
                    to={`/app/predictions?symbol=${insight.symbol}`}
                    className="block rounded-xl border border-black/8 bg-black/[0.02] p-3.5 transition-colors hover:border-[#36C982]/40 dark:border-white/8 dark:bg-[#141C17] dark:hover:bg-[#202B24]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                        {insight.symbol}
                      </span>
                      <span className="font-mono-num text-xs font-semibold text-[#137949] dark:text-[#36C982]">
                        Range {formatCurrency(insight.predictedRangeLow, quote.currency, settings.currency)} –{' '}
                        {formatCurrency(insight.predictedRangeHigh, quote.currency, settings.currency)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs text-[#53645A] dark:text-[#91A197]">
                      <span>
                        {lead.stance} weight {lead.probabilityPercent}%
                      </span>
                      <span className="font-mono-num">
                        Preview score {insight.confidenceScore}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <Link
            to="/app/predictions"
            className="mt-4 inline-flex items-center justify-between rounded-lg border border-black/10 px-4 py-2.5 text-xs font-semibold text-[#101814] transition-colors hover:border-[#36C982]/50 dark:border-white/10 dark:text-[#E8F0EA]"
          >
            <span>Open AI Prediction Centre</span>
            <ChevronRight className="h-4 w-4 text-[#36C982]" />
          </Link>
        </div>
      </section>

      {/* Movers (Top Gainers, Top Losers, Most Active) + Watchlist Preview */}
      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C] xl:col-span-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-black/10 bg-black/[0.02] p-0.5 dark:border-white/8 dark:bg-[#141C17]">
              {(
                [
                  { id: 'gainers', label: 'Top Gainers' },
                  { id: 'losers', label: 'Top Losers' },
                  { id: 'active', label: 'Most Active' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMoverTab(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    moverTab === tab.id
                      ? 'bg-[#36C982] text-[#0B120E]'
                      : 'text-[#53645A] hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              to="/app/explore"
              className="text-xs font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
            >
              View All Sample Equities →
            </Link>
          </div>

          {moversError ? (
            <ApiErrorState
              compact
              title="Movers unavailable"
              message={moversError.message}
              code={moversError.code}
              onRetry={() => void loadMovers()}
            />
          ) : moversLoading ? (
            <div className="grid gap-3.5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="card" />
              ))}
            </div>
          ) : activeMovers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/15 p-8 text-center text-xs text-[#53645A] dark:border-white/10 dark:text-[#91A197]">
              No movers matched the selected market region.
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2">
              {activeMovers.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} compact />
              ))}
            </div>
          )}
        </div>

        {/* Watchlist Preview */}
        <div className="flex flex-col justify-between rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C] xl:col-span-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[#36C982]" />
                <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                  Watchlist Preview
                </h2>
              </div>
              <Link
                to="/app/watchlist"
                className="text-xs font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
              >
                Manage
              </Link>
            </div>

            {watchlistError ? (
              <div className="mt-4">
                <ApiErrorState
                  compact
                  title="Watchlist error"
                  message={watchlistError}
                  onRetry={() => void refreshWatchlist()}
                />
              </div>
            ) : watchlistLoading ? (
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 w-full animate-pulse rounded-lg bg-black/5 dark:bg-[#141C17]"
                  />
                ))}
              </div>
            ) : watchlistStocks.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-black/15 p-5 text-center text-xs text-[#53645A] dark:border-white/10 dark:text-[#91A197]">
                No saved stocks yet. Star any equity in Explore to track it via the backend watchlist.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-black/8 dark:divide-white/8">
                {watchlistStocks.map((stock) => {
                  const pos = stock.change >= 0;
                  return (
                    <Link
                      key={stock.symbol}
                      to={`/app/stocks/${stock.symbol}`}
                      className="flex items-center justify-between py-3 transition-colors hover:opacity-85"
                    >
                      <div className="min-w-0">
                        <div className="font-display text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                          {stock.symbol}
                        </div>
                        <div className="truncate text-xs text-[#53645A] dark:text-[#91A197]">
                          Vol {formatCompactNumber(stock.volume)} · {stock.exchange}
                        </div>
                      </div>
                      <div className="text-right font-mono-num">
                        <div className="text-sm font-semibold text-[#101814] dark:text-[#E8F0EA]">
                          {formatCurrency(stock.price, stock.currency, settings.currency)}
                        </div>
                        <div
                          className={`text-xs ${
                            pos
                              ? 'text-[#137949] dark:text-[#36C982]'
                              : 'text-[#D94848] dark:text-[#EF6461]'
                          }`}
                        >
                          {formatPercent(stock.changePercent)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to="/app/watchlist"
            className="mt-4 inline-flex items-center justify-between rounded-lg border border-black/10 px-4 py-2.5 text-xs font-semibold text-[#101814] transition-colors hover:border-[#36C982]/50 dark:border-white/10 dark:text-[#E8F0EA]"
          >
            <span>Open Full Watchlist</span>
            <ChevronRight className="h-4 w-4 text-[#36C982]" />
          </Link>
        </div>
      </section>

      {/* Latest Market News */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#101814] dark:text-[#E8F0EA]">
              Latest Market News (Demonstration Articles)
            </h2>
          </div>
          <Link
            to="/app/news"
            className="text-xs font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
          >
            All News →
          </Link>
        </div>

        {newsError ? (
          <ApiErrorState
            compact
            title="News feed unavailable"
            message={newsError.message}
            code={newsError.code}
            onRetry={() => void loadNews()}
          />
        ) : newsLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {latestNews.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onRead={(art) => setActiveArticle(art)}
              />
            ))}
          </div>
        )}
      </section>

      {activeArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-white p-6 dark:bg-[#18211C]">
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs text-[#53645A] dark:text-[#91A197]">
                {activeArticle.category} · {activeArticle.source}
              </span>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="rounded-lg border border-black/10 px-2.5 py-1 text-xs font-semibold text-[#53645A] dark:border-white/10 dark:text-[#91A197]"
              >
                Close
              </button>
            </div>
            <h3 className="mt-3 font-display text-xl font-bold text-[#101814] dark:text-[#E8F0EA]">
              {activeArticle.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
              {activeArticle.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
