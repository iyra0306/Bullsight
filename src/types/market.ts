export type MarketRegion = 'ALL' | 'IN' | 'US';
export type Exchange = 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE';
export type CurrencyCode = 'INR' | 'USD';
export type CurrencyPreference = 'AUTO' | 'INR' | 'USD';
export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX';
export type ForecastHorizon = '7D' | '14D' | '30D' | '90D';
export type ChartStyle = 'candlestick' | 'area';
export type SentimentType = 'Positive' | 'Neutral' | 'Cautious';

export interface OhlcBar {
  time: string; // YYYY-MM-DD or unix timestamp string
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketIndex {
  id: string;
  symbol: string;
  name: string;
  region: 'IN' | 'US';
  exchange: Exchange;
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  sessionNote: string;
  sparkline: number[];
  history: OhlcBar[];
}

export interface StockFundamentals {
  peRatio: number;
  pbRatio: number;
  eps: number;
  dividendYield: number;
  roe: number;
  debtToEquity: number;
  week52High: number;
  week52Low: number;
  avgVolume: number;
  beta: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  market: 'IN' | 'US';
  exchange: Exchange;
  sector: string;
  currency: CurrencyCode;
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCapBillions: number; // in native currency billions
  monogramBg: string;
  description: string;
  headquarters: string;
  ceo: string;
  founded: number;
  sparkline: number[];
  fundamentals: StockFundamentals;
  isSampleData: true;
}

export interface TechnicalSummary {
  rsi14: number;
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  trendBias: 'Bullish' | 'Neutral' | 'Bearish';
  volatilityRegime: 'Low' | 'Moderate' | 'Elevated';
  supportLevel: number;
  resistanceLevel: number;
}

export interface AiPredictionScenario {
  stance: 'Bullish' | 'Neutral' | 'Bearish';
  probabilityPercent: number;
  targetPrice: number;
  expectedReturnPercent: number;
  rationale: string;
}

export interface AiPredictionBundle {
  symbol: string;
  horizon: ForecastHorizon;
  currentPrice: number;
  predictedRangeLow: number;
  predictedRangeHigh: number;
  medianTarget: number;
  confidenceScore: number; // Illustrative preview score (0-100)
  maeIllustrative: number;
  rmseIllustrative: number;
  directionalMatchIllustrative: number;
  scenarios: AiPredictionScenario[];
  forecastSeries: { time: string; predicted: number; lower: number; upper: number }[];
  backtestComparison: { time: string; actual: number; predicted: number }[];
  featureDrivers: { name: string; weight: number; impact: 'Positive' | 'Negative' | 'Neutral' }[];
  historyLog: {
    id: string;
    date: string;
    horizon: ForecastHorizon;
    projectedPrice: number;
    actualPrice: number;
    variancePercent: number;
    outcome: 'Within Band' | 'Outperformed' | 'Below Band';
  }[];
  isIllustrative: true;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Equities' | 'Macro' | 'AI & Tech' | 'India Markets' | 'US Markets';
  sentiment: SentimentType;
  source: string;
  publishedAt: string;
  readTime: string;
  relatedSymbols: string[];
  imageUrl?: string;
  isDemoArticle: true;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  read: boolean;
  symbol?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  preferredRegion: MarketRegion;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  currency: CurrencyPreference;
  defaultChartStyle: ChartStyle;
  showChartGrid: boolean;
  compactTables: boolean;
  priceAlertsEnabled: boolean;
  aiDigestEnabled: boolean;
  newsAlertsEnabled: boolean;
  sessionTimeoutMinutes: number;
}
