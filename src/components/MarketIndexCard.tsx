import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { MarketIndex } from '../types/market';
import { AnimatedCounter } from './AnimatedCounter';
import { Sparkline } from './Sparkline';
import { formatPercent } from '../utils/formatters';

interface MarketIndexCardProps {
  index: MarketIndex;
  active?: boolean;
  onSelect?: (index: MarketIndex) => void;
}

export const MarketIndexCard: React.FC<MarketIndexCardProps> = ({
  index,
  active = false,
  onSelect,
}) => {
  const positive = index.change >= 0;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(index)}
      data-cursor="stock"
      className={`group w-full rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#36C982] ${
        active
          ? 'border-[#36C982]/60 bg-[#202B24]/90 dark:bg-[#202B24]'
          : 'border-black/10 bg-white hover:border-[#36C982]/40 dark:border-white/8 dark:bg-[#18211C] dark:hover:bg-[#202B24]/70'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#53645A] dark:text-[#91A197]">
            <span className="truncate">{index.exchange}</span>
            <span aria-hidden="true">·</span>
            <span>{index.region === 'IN' ? 'India' : 'United States'}</span>
          </div>
          <h3 className="mt-1 truncate font-display text-base font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA]">
            {index.symbol}
          </h3>
        </div>
        <Sparkline data={index.sparkline} positive={positive} width={76} height={28} />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <AnimatedCounter
          value={index.value}
          decimals={2}
          className="font-mono-num text-xl font-semibold text-[#101814] dark:text-[#E8F0EA]"
        />
        <div
          className={`flex items-center gap-1 font-mono-num text-xs font-medium ${
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
          <span>{formatPercent(index.changePercent)}</span>
        </div>
      </div>

      <p className="mt-2 truncate text-[11px] text-[#53645A] dark:text-[#91A197]">
        {index.sessionNote}
      </p>
    </button>
  );
};
