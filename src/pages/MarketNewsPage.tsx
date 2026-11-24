import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { newsService } from '../services/newsService';
import { ApiClientError } from '../services/apiClient';
import { NewsCard } from '../components/NewsCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ApiErrorState } from '../components/ApiErrorState';
import { NewsArticle, SentimentType } from '../types/market';

const CATEGORIES = ['All', 'Equities', 'Macro', 'AI & Tech', 'India Markets', 'US Markets'] as const;
const SENTIMENTS: ('All' | SentimentType)[] = ['All', 'Positive', 'Neutral', 'Cautious'];

export const MarketNewsPage: React.FC = () => {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [sentiment, setSentiment] = useState<'All' | SentimentType>('All');
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const loadNews = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await newsService.fetchNews(
        {
          category: category === 'All' ? undefined : category,
          sentiment: sentiment === 'All' ? undefined : sentiment,
          q: search.trim() || undefined,
          limit: 12,
          page: 1,
        },
        signal
      );
      setArticles(res.articles || []);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'REQUEST_ABORTED') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load news feed.',
        code: err instanceof ApiClientError ? err.code : undefined,
      });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [category, sentiment, search]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadNews(controller.signal);
    }, 150);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [loadNews]);

  const handleOpenArticle = async (article: NewsArticle) => {
    setActiveArticle(article);
    try {
      const fresh = await newsService.fetchNewsById(article.id);
      setActiveArticle(fresh);
    } catch {
      // Keep already-loaded article summary/content if detail refresh fails
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#137949] dark:text-[#36C982]">
            Backend News Endpoint · Demonstration Editorial Feed
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA]">
            Market News &amp; Insights
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  category === cat
                    ? 'bg-[#36C982] text-[#0B120E]'
                    : 'border border-black/10 text-[#53645A] hover:text-[#101814] dark:border-white/10 dark:text-[#91A197] dark:hover:text-[#E8F0EA]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#53645A] dark:text-[#91A197]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search headline or ticker..."
              className="h-9 w-full rounded-lg border border-black/10 bg-[#f4f7f5] pl-9 pr-3 text-xs text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-black/8 pt-3 text-xs dark:border-white/8">
          <span className="text-[#53645A] dark:text-[#91A197]">Sentiment filter:</span>
          {SENTIMENTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSentiment(s)}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                sentiment === s
                  ? 'bg-[#214B37] text-[#A5EBC3]'
                  : 'text-[#53645A] hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ApiErrorState
          title="Could not load market news"
          message={error.message}
          code={error.code}
          onRetry={() => void loadNews()}
        />
      ) : loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white px-6 py-14 text-center dark:border-white/8 dark:bg-[#18211C]">
          <p className="text-sm font-medium text-[#101814] dark:text-[#E8F0EA]">
            No demonstration articles match those filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('All');
              setSentiment('All');
              setSearch('');
            }}
            className="mt-3 rounded-lg bg-[#36C982] px-4 py-2 text-xs font-semibold text-[#0B120E]"
          >
            Reset News Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onRead={(art) => void handleOpenArticle(art)}
            />
          ))}
        </div>
      )}

      {activeArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-white p-6 dark:bg-[#18211C]">
            <div className="flex items-start justify-between gap-4">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">
                {activeArticle.category} · Sentiment: {activeArticle.sentiment} ·{' '}
                {activeArticle.source}
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                aria-label="Close article"
                className="rounded-lg border border-black/10 p-1.5 text-[#53645A] dark:border-white/10 dark:text-[#91A197]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-3 font-display text-xl font-bold text-[#101814] dark:text-[#E8F0EA]">
              {activeArticle.title}
            </h2>
            {activeArticle.imageUrl && (
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                referrerPolicy="no-referrer"
                className="mt-4 aspect-[16/9] w-full rounded-xl object-cover"
              />
            )}
            <p className="mt-4 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
              {activeArticle.content}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4 text-xs dark:border-white/8">
              <div className="flex flex-wrap gap-2">
                {activeArticle.relatedSymbols.map((sym) => (
                  <Link
                    key={sym}
                    to={`/app/stocks/${sym}`}
                    className="rounded-md border border-black/10 px-2.5 py-1 font-mono-num font-semibold text-[#137949] hover:border-[#36C982] dark:border-white/10 dark:text-[#A5EBC3]"
                  >
                    {sym}
                  </Link>
                ))}
              </div>
              <span className="text-[#53645A] dark:text-[#91A197]">
                {activeArticle.publishedAt}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
