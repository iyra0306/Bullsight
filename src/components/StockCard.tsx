import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Star } from 'lucide-react';
import { StockQuote } from '../types/market';
import { useApp } from '../contexts/AppContext';
import { formatCurrency, formatMarketCap, formatPercent } from '../utils/formatters';
import { Sparkline } from './Sparkline';
import { StockMonogram } from './StockMonogram';

interface StockCardProps {
  stock: StockQuote;
  compact?: boolean;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, compact = false }) => {
  const { settings, isInWatchlist, toggleWatchlist } = useApp();
  const positive = stock.change >= 0;
  const saved = isInWatchlist(stock.symbol);

  return (
    <div
      data-cursor="stock"
      className="group relative flex flex-col justify-between rounded-xl border border-black/10 bg-white p-4 transition-colors duration-200 hover:border-[#36C982]/45 dark:border-white/8 dark:bg-[#18211C] dark:hover:bg-[#202B24]/75"
    >
      <div className="flex items-start justify-between gap-3">
        <Link
          to={`/app/stocks/${stock.symbol}`}
          className="flex min-w-0 flex-1 items-center gap-3 focus-visible:outline-none"
        >
          <StockMonogram symbol={stock.symbol} bg={stock.monogramBg} size={compact ? 'sm' : 'md'} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-[#53645A] dark:text-[#91A197]">
              <span>{stock.exchange}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{stock.sector}</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-display text-sm font-bold tracking-tight text-[#101814] group-hover:text-[#1EA866] dark:text-[#E8F0EA] dark:group-hover:text-[#A5EBC3]">
                {stock.symbol}
              </span>
              <span className="truncate text-xs text-[#53645A] dark:text-[#91A197]">
                {stock.name}
              </span>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => toggleWatchlist(stock.symbol)}
          aria-label={saved ? `Remove ${stock.symbol} from watchlist` : `Add ${stock.symbol} to watchlist`}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            saved
              ? 'border-[#36C982]/40 bg-[#36C982]/15 text-[#137949] dark:text-[#36C982]'
              : 'border-black/10 text-[#53645A] hover:border-[#36C982]/40 hover:text-[#101814] dark:border-white/8 dark:text-[#91A197] dark:hover:text-[#E8F0EA]'
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <Link
        to={`/app/stocks/${stock.symbol}`}
        className="mt-4 flex items-end justify-between gap-3 focus-visible:outline-none"
      >
        <div>
          <div className="font-mono-num text-lg font-semibold text-[#101814] dark:text-[#E8F0EA]">
            {formatCurrency(stock.price, stock.currency, settings.currency)}
          </div>
          <div
            className={`mt-0.5 flex items-center gap-1 font-mono-num text-xs font-medium ${
              positive
                ? 'text-[#137949] dark:text-[#36C982]'
                : 'text-[#D94848] dark:text-[#EF6461]'
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{formatPercent(stock.changePercent)}</span>
            {!compact && (
              <>
                <span aria-hidden="true" className="text-[#53645A] dark:text-[#91A197]">
                  ·
                </span>
                <span className="text-[#53645A] dark:text-[#91A197]">
                  MCap {formatMarketCap(stock.marketCapBillions, stock.currency, settings.currency)}
                </span>
              </>
            )}
          </div>
        </div>

        <Sparkline data={stock.sparkline} positive={positive} width={84} height={30} />
      </Link>
    </div>
  );
};
