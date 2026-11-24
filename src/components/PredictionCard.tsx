import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { AiPredictionScenario, CurrencyCode } from '../types/market';
import { useApp } from '../contexts/AppContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface PredictionCardProps {
  scenario: AiPredictionScenario;
  currency: CurrencyCode;
  active?: boolean;
  onSelect?: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  scenario,
  currency,
  active = false,
  onSelect,
}) => {
  const { settings } = useApp();
  const isBull = scenario.stance === 'Bullish';
  const isBear = scenario.stance === 'Bearish';

  const toneClass = isBull
    ? 'text-[#137949] dark:text-[#36C982]'
    : isBear
    ? 'text-[#D94848] dark:text-[#EF6461]'
    : 'text-[#9A6B16] dark:text-[#E5B869]';

  const barClass = isBull
    ? 'bg-[#36C982]'
    : isBear
    ? 'bg-[#EF6461]'
    : 'bg-[#E5B869]';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col justify-between rounded-xl border p-5 text-left transition-all duration-200 ${
        active
          ? 'border-[#36C982]/60 bg-[#202B24]/90 dark:bg-[#202B24]'
          : 'border-black/10 bg-white hover:border-[#36C982]/40 dark:border-white/8 dark:bg-[#18211C]'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className={`flex items-center gap-1.5 text-sm font-semibold ${toneClass}`}>
            {isBull ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : isBear ? (
              <ArrowDownRight className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
            <span>{scenario.stance} Scenario</span>
          </div>
          <span className="font-mono-num text-xs text-[#53645A] dark:text-[#91A197]">
            Weight {scenario.probabilityPercent}%
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="font-mono-num text-2xl font-bold text-[#101814] dark:text-[#E8F0EA]">
            {formatCurrency(scenario.targetPrice, currency, settings.currency)}
          </span>
          <span className={`font-mono-num text-xs font-semibold ${toneClass}`}>
            {formatPercent(scenario.expectedReturnPercent)}
          </span>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barClass}`}
            style={{ width: `${scenario.probabilityPercent}%` }}
          />
        </div>
      </div>

      <p className="mt-3.5 text-xs leading-relaxed text-[#53645A] dark:text-[#91A197]">
        {scenario.rationale}
      </p>
    </button>
  );
};
