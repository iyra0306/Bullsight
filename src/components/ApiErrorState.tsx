import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ApiErrorStateProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const ApiErrorState: React.FC<ApiErrorStateProps> = ({
  title = 'Unable to load backend data',
  message,
  code,
  onRetry,
  compact = false,
}) => {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-[#EF6461]/30 bg-[#EF6461]/8 text-left ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#D94848] dark:text-[#EF6461]" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                {title}
              </h3>
              {code && (
                <span className="rounded bg-black/8 px-2 py-0.5 font-mono-num text-[11px] font-semibold text-[#53645A] dark:bg-white/10 dark:text-[#91A197]">
                  {code}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#53645A] dark:text-[#91A197]">
              {message}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3.5 py-2 text-xs font-semibold text-[#101814] transition-colors hover:border-[#36C982]/50 dark:border-white/10 dark:bg-[#18211C] dark:text-[#E8F0EA] dark:hover:bg-[#202B24]"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#36C982]" />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
};
