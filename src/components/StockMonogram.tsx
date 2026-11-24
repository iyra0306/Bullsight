import React from 'react';

interface StockMonogramProps {
  symbol: string;
  bg?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StockMonogram: React.FC<StockMonogramProps> = ({
  symbol,
  bg = '#214B37',
  size = 'md',
}) => {
  const dims =
    size === 'sm'
      ? 'h-8 w-8 text-[11px] rounded-lg'
      : size === 'lg'
      ? 'h-12 w-12 text-sm rounded-xl'
      : 'h-10 w-10 text-xs rounded-xl';

  const initials = symbol.slice(0, 3).toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-white/10 font-display font-bold tracking-tight text-[#A5EBC3] ${dims}`}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
};
