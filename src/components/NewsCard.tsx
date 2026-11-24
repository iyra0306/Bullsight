import React, { useState } from 'react';
import { ArrowUpRight, Newspaper } from 'lucide-react';
import { NewsArticle } from '../types/market';

interface NewsCardProps {
  article: NewsArticle;
  onRead?: (article: NewsArticle) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onRead }) => {
  const [imgError, setImgError] = useState(false);

  const sentimentColor =
    article.sentiment === 'Positive'
      ? 'text-[#137949] dark:text-[#36C982]'
      : article.sentiment === 'Cautious'
      ? 'text-[#D94848] dark:text-[#EF6461]'
      : 'text-[#9A6B16] dark:text-[#E5B869]';

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition-colors duration-200 hover:border-[#36C982]/40 dark:border-white/8 dark:bg-[#18211C] dark:hover:bg-[#202B24]/70">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#141C17]">
        {article.imageUrl && !imgError ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#141C17] via-[#18211C] to-[#214B37]/40 p-4 text-center">
            <Newspaper className="h-7 w-7 text-[#36C982]/70" />
            <span className="mt-2 text-xs font-medium text-[#91A197]">
              {article.category} Briefing
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#53645A] dark:text-[#91A197]">
            <span className="font-medium text-[#101814] dark:text-[#E8F0EA]">
              {article.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className={`font-medium ${sentimentColor}`}>
              Sentiment: {article.sentiment}
            </span>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
          </div>

          <h3 className="mt-2.5 font-display text-base font-bold leading-snug text-[#101814] group-hover:text-[#1EA866] dark:text-[#E8F0EA] dark:group-hover:text-[#A5EBC3]">
            {article.title}
          </h3>

          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
            {article.summary}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-black/8 pt-3.5 text-xs dark:border-white/8">
          <div className="min-w-0 truncate text-[#53645A] dark:text-[#91A197]">
            <span className="font-medium text-[#101814] dark:text-[#E8F0EA]">
              {article.source}
            </span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{article.publishedAt}</span>
          </div>

          <button
            type="button"
            onClick={() => onRead?.(article)}
            className="ml-3 inline-flex shrink-0 items-center gap-1 font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
          >
            <span>Read Brief</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
