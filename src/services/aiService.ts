import { AiPredictionBundle, ForecastHorizon } from '../types/market';
import { marketService } from './marketService';
import { buildTechnicalSummary } from '../utils/indicators';

const HORIZON_DAYS: Record<ForecastHorizon, number> = {
  '7D': 7,
  '14D': 14,
  '30D': 30,
  '90D': 90,
};

export const aiService = {
  getIllustrativePrediction(
    symbol: string,
    horizon: ForecastHorizon = '30D'
  ): AiPredictionBundle {
    const stock = marketService.getStockBySymbol(symbol) || marketService.getStocks()[0];
    const bars = marketService.getStockHistory(stock.symbol, '3M');
    const summary = buildTechnicalSummary(bars);

    const days = HORIZON_DAYS[horizon];
    const scaleFactor = Math.sqrt(days / 30);
    const bullishBias = summary.trendBias === 'Bullish' ? 0.048 : summary.trendBias === 'Bearish' ? -0.022 : 0.018;
    const medianDrift = bullishBias * scaleFactor;
    const spreadPct = 0.065 * scaleFactor;

    const currentPrice = stock.price;
    const medianTarget = Number((currentPrice * (1 + medianDrift)).toFixed(2));
    const predictedRangeLow = Number((medianTarget * (1 - spreadPct)).toFixed(2));
    const predictedRangeHigh = Number((medianTarget * (1 + spreadPct)).toFixed(2));

    const bullProb = summary.trendBias === 'Bullish' ? 58 : summary.trendBias === 'Neutral' ? 42 : 24;
    const neutralProb = 28;
    const bearProb = 100 - bullProb - neutralProb;

    const bullTarget = Number((currentPrice * (1 + (medianDrift + spreadPct * 0.95))).toFixed(2));
    const bearTarget = Number((currentPrice * (1 + (medianDrift - spreadPct * 0.95))).toFixed(2));

    const endDate = new Date('2026-11-23T00:00:00Z');
    const forecastSeries = [];
    const steps = Math.min(days, 30);
    for (let i = 1; i <= steps; i++) {
      const d = new Date(endDate);
      const dayStep = Math.round((i / steps) * days);
      d.setUTCDate(d.getUTCDate() + dayStep);
      const progress = i / steps;
      const curve = Math.sin(progress * Math.PI * 1.5) * 0.006 * scaleFactor;
      const pointMid = Number(
        (currentPrice * (1 + medianDrift * progress + curve)).toFixed(2)
      );
      const band = currentPrice * spreadPct * Math.sqrt(progress);
      forecastSeries.push({
        time: d.toISOString().slice(0, 10),
        predicted: pointMid,
        lower: Number((pointMid - band).toFixed(2)),
        upper: Number((pointMid + band).toFixed(2)),
      });
    }

    const recentBars = bars.slice(-24);
    const backtestComparison = recentBars.map((bar, idx) => {
      const offset = Math.sin(idx * 0.7) * 0.011 + (idx % 3 === 0 ? 0.005 : -0.004);
      return {
        time: bar.time,
        actual: bar.close,
        predicted: Number((bar.close * (1 + offset)).toFixed(2)),
      };
    });

    const maeIllustrative = Number((currentPrice * 0.0124).toFixed(2));
    const rmseIllustrative = Number((currentPrice * 0.0168).toFixed(2));
    const confidenceScore = summary.trendBias === 'Bullish' ? 74 : summary.trendBias === 'Neutral' ? 62 : 68;

    return {
      symbol: stock.symbol,
      horizon,
      currentPrice,
      predictedRangeLow,
      predictedRangeHigh,
      medianTarget,
      confidenceScore,
      maeIllustrative,
      rmseIllustrative,
      directionalMatchIllustrative: 68.4,
      scenarios: [
        {
          stance: 'Bullish',
          probabilityPercent: bullProb,
          targetPrice: bullTarget,
          expectedReturnPercent: Number((((bullTarget - currentPrice) / currentPrice) * 100).toFixed(2)),
          rationale: `Sustained close above SMA-20 (${summary.sma20}) paired with positive momentum continuation.`,
        },
        {
          stance: 'Neutral',
          probabilityPercent: neutralProb,
          targetPrice: medianTarget,
          expectedReturnPercent: Number((((medianTarget - currentPrice) / currentPrice) * 100).toFixed(2)),
          rationale: `Range-bound consolidation between support (${summary.supportLevel}) and near-term resistance.`,
        },
        {
          stance: 'Bearish',
          probabilityPercent: bearProb,
          targetPrice: bearTarget,
          expectedReturnPercent: Number((((bearTarget - currentPrice) / currentPrice) * 100).toFixed(2)),
          rationale: `Mean reversion toward lower Bollinger envelope (${summary.bollingerLower}) on macro risk-off flow.`,
        },
      ],
      forecastSeries,
      backtestComparison,
      featureDrivers: [
        {
          name: '20-Day Momentum Slope',
          weight: 34,
          impact: summary.trendBias === 'Bearish' ? 'Negative' : 'Positive',
        },
        {
          name: 'Volume-Weighted Liquidity Delta',
          weight: 26,
          impact: 'Positive',
        },
        {
          name: 'Bollinger Volatility Compression',
          weight: 22,
          impact: summary.volatilityRegime === 'Elevated' ? 'Negative' : 'Neutral',
        },
        {
          name: 'Cross-Sector Sentiment Index',
          weight: 18,
          impact: 'Positive',
        },
      ],
      historyLog: [
        {
          id: 'pred-01',
          date: 'Nov 10, 2026',
          horizon: '14D',
          projectedPrice: Number((currentPrice * 0.985).toFixed(2)),
          actualPrice: currentPrice,
          variancePercent: 1.52,
          outcome: 'Within Band',
        },
        {
          id: 'pred-02',
          date: 'Oct 24, 2026',
          horizon: '30D',
          projectedPrice: Number((currentPrice * 0.942).toFixed(2)),
          actualPrice: Number((currentPrice * 0.961).toFixed(2)),
          variancePercent: 2.01,
          outcome: 'Outperformed',
        },
        {
          id: 'pred-03',
          date: 'Oct 02, 2026',
          horizon: '14D',
          projectedPrice: Number((currentPrice * 0.935).toFixed(2)),
          actualPrice: Number((currentPrice * 0.924).toFixed(2)),
          variancePercent: -1.18,
          outcome: 'Within Band',
        },
        {
          id: 'pred-04',
          date: 'Sep 14, 2026',
          horizon: '30D',
          projectedPrice: Number((currentPrice * 0.915).toFixed(2)),
          actualPrice: Number((currentPrice * 0.889).toFixed(2)),
          variancePercent: -2.84,
          outcome: 'Below Band',
        },
      ],
      isIllustrative: true,
    };
  },
};
