import { CurrencyCode, CurrencyPreference } from '../types/market';

const USD_TO_INR_RATE = 84.35;

export function convertPrice(
  amount: number,
  sourceCurrency: CurrencyCode,
  preference: CurrencyPreference
): { value: number; currency: CurrencyCode } {
  if (preference === 'AUTO' || preference === sourceCurrency) {
    return { value: amount, currency: sourceCurrency };
  }
  if (sourceCurrency === 'USD' && preference === 'INR') {
    return { value: amount * USD_TO_INR_RATE, currency: 'INR' };
  }
  if (sourceCurrency === 'INR' && preference === 'USD') {
    return { value: amount / USD_TO_INR_RATE, currency: 'USD' };
  }
  return { value: amount, currency: sourceCurrency };
}

export function formatCurrency(
  amount: number,
  sourceCurrency: CurrencyCode,
  preference: CurrencyPreference = 'AUTO',
  decimals = 2
): string {
  const { value, currency } = convertPrice(amount, sourceCurrency, preference);
  const symbol = currency === 'INR' ? '₹' : '$';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return `${symbol}${value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatIndexValue(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number, showPlus = true): string {
  const prefix = value > 0 && showPlus ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function formatMarketCap(
  billions: number,
  sourceCurrency: CurrencyCode,
  preference: CurrencyPreference = 'AUTO'
): string {
  const { value, currency } = convertPrice(billions, sourceCurrency, preference);
  const symbol = currency === 'INR' ? '₹' : '$';
  if (currency === 'INR') {
    // In India market cap is often expressed in ₹ Lakh Cr or ₹B; keep clean ₹T / ₹B
    if (value >= 1000) return `${symbol}${(value / 1000).toFixed(2)}T`;
    return `${symbol}${value.toFixed(1)}B`;
  }
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(2)}T`;
  return `${symbol}${value.toFixed(1)}B`;
}

export function evaluatePasswordStrength(password: string): {
  score: number;
  label: 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  checks: { length: boolean; upper: boolean; number: boolean; special: boolean };
} {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const label =
    score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Strong' : 'Very Strong';
  return { score, label, checks };
}
