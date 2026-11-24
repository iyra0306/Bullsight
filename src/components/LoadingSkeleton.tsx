import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'chart' | 'table';
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  rows = 5,
  className = '',
}) => {
  if (variant === 'chart') {
    return (
      <div
        className={`rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C] ${className}`}
        aria-label="Loading chart"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-44 animate-pulse rounded bg-black/8 dark:bg-[#202B24]" />
          <div className="h-7 w-52 animate-pulse rounded bg-black/8 dark:bg-[#202B24]" />
        </div>
        <div className="h-72 w-full animate-pulse rounded-lg bg-black/5 dark:bg-[#141C17]" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        className={`rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C] ${className}`}
        aria-label="Loading table"
      >
        <div className="mb-3 h-8 w-full animate-pulse rounded bg-black/8 dark:bg-[#202B24]" />
        <div className="space-y-2.5">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-11 w-full animate-pulse rounded-lg bg-black/5 dark:bg-[#141C17]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C] ${className}`}
      aria-label="Loading card"
    >
      <div className="mb-3 h-4 w-28 animate-pulse rounded bg-black/8 dark:bg-[#202B24]" />
      <div className="mb-2 h-7 w-36 animate-pulse rounded bg-black/10 dark:bg-[#202B24]" />
      <div className="h-12 w-full animate-pulse rounded bg-black/5 dark:bg-[#141C17]" />
    </div>
  );
};
