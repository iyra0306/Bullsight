import { OhlcBar, TechnicalSummary } from '../types/market';

export interface IndicatorPoint {
  time: string;
  value: number;
}

export interface BollingerPoint {
  time: string;
  upper: number;
  middle: number;
  lower: number;
}

export interface MacdPoint {
  time: string;
  macd: number;
  signal: number;
  histogram: number;
}

export function calculateSMA(bars: OhlcBar[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += bars[j].close;
    }
    result.push({
      time: bars[i].time,
      value: Number((sum / period).toFixed(2)),
    });
  }
  return result;
}

export function calculateEMA(bars: OhlcBar[], period: number): IndicatorPoint[] {
  if (bars.length < period) return [];
  const k = 2 / (period + 1);
  let ema =
    bars.slice(0, period).reduce((acc, b) => acc + b.close, 0) / period;
  const result: IndicatorPoint[] = [{ time: bars[period - 1].time, value: Number(ema.toFixed(2)) }];

  for (let i = period; i < bars.length; i++) {
    ema = bars[i].close * k + ema * (1 - k);
    result.push({
      time: bars[i].time,
      value: Number(ema.toFixed(2)),
    });
  }
  return result;
}

export function calculateRSI(bars: OhlcBar[], period = 14): IndicatorPoint[] {
  if (bars.length <= period) return [];
  const result: IndicatorPoint[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = bars[i].close - bars[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + firstRs);
  result.push({ time: bars[period].time, value: Number(firstRsi.toFixed(2)) });

  for (let i = period + 1; i < bars.length; i++) {
    const diff = bars[i].close - bars[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
    result.push({ time: bars[i].time, value: Number(rsi.toFixed(2)) });
  }
  return result;
}

export function calculateBollingerBands(
  bars: OhlcBar[],
  period = 20,
  stdDevMultiplier = 2
): BollingerPoint[] {
  const result: BollingerPoint[] = [];
  for (let i = period - 1; i < bars.length; i++) {
    const slice = bars.slice(i - period + 1, i + 1);
    const mean = slice.reduce((acc, b) => acc + b.close, 0) / period;
    const variance =
      slice.reduce((acc, b) => acc + Math.pow(b.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    result.push({
      time: bars[i].time,
      upper: Number((mean + stdDevMultiplier * stdDev).toFixed(2)),
      middle: Number(mean.toFixed(2)),
      lower: Number((mean - stdDevMultiplier * stdDev).toFixed(2)),
    });
  }
  return result;
}

export function calculateMACD(bars: OhlcBar[]): MacdPoint[] {
  const ema12 = calculateEMA(bars, 12);
  const ema26 = calculateEMA(bars, 26);
  if (ema26.length === 0) return [];

  const ema12Map = new Map(ema12.map((p) => [p.time, p.value]));
  const macdRaw: { time: string; value: number }[] = [];

  for (const p26 of ema26) {
    const v12 = ema12Map.get(p26.time);
    if (v12 !== undefined) {
      macdRaw.push({ time: p26.time, value: v12 - p26.value });
    }
  }

  if (macdRaw.length < 9) return [];
  const k = 2 / (9 + 1);
  let signal = macdRaw.slice(0, 9).reduce((acc, p) => acc + p.value, 0) / 9;

  const result: MacdPoint[] = [
    {
      time: macdRaw[8].time,
      macd: Number(macdRaw[8].value.toFixed(2)),
      signal: Number(signal.toFixed(2)),
      histogram: Number((macdRaw[8].value - signal).toFixed(2)),
    },
  ];

  for (let i = 9; i < macdRaw.length; i++) {
    signal = macdRaw[i].value * k + signal * (1 - k);
    result.push({
      time: macdRaw[i].time,
      macd: Number(macdRaw[i].value.toFixed(2)),
      signal: Number(signal.toFixed(2)),
      histogram: Number((macdRaw[i].value - signal).toFixed(2)),
    });
  }
  return result;
}

export function buildTechnicalSummary(bars: OhlcBar[]): TechnicalSummary {
  const sma20 = calculateSMA(bars, 20);
  const sma50 = calculateSMA(bars, 50);
  const ema12 = calculateEMA(bars, 12);
  const ema26 = calculateEMA(bars, 26);
  const rsi = calculateRSI(bars, 14);
  const bb = calculateBollingerBands(bars, 20, 2);
  const macd = calculateMACD(bars);

  const lastBar = bars[bars.length - 1];
  const lastRsi = rsi[rsi.length - 1]?.value ?? 52;
  const lastMacd = macd[macd.length - 1] ?? { macd: 0, signal: 0, histogram: 0 };
  const lastSma20 = sma20[sma20.length - 1]?.value ?? lastBar.close;
  const lastSma50 = sma50[sma50.length - 1]?.value ?? lastBar.close;
  const lastEma12 = ema12[ema12.length - 1]?.value ?? lastBar.close;
  const lastEma26 = ema26[ema26.length - 1]?.value ?? lastBar.close;
  const lastBb = bb[bb.length - 1] ?? {
    upper: lastBar.close * 1.04,
    middle: lastBar.close,
    lower: lastBar.close * 0.96,
  };

  let bullishSignals = 0;
  if (lastBar.close > lastSma20) bullishSignals++;
  if (lastSma20 > lastSma50) bullishSignals++;
  if (lastMacd.histogram > 0) bullishSignals++;
  if (lastRsi > 50 && lastRsi < 72) bullishSignals++;

  const trendBias =
    bullishSignals >= 3 ? 'Bullish' : bullishSignals <= 1 ? 'Bearish' : 'Neutral';

  const bandWidthPct = ((lastBb.upper - lastBb.lower) / lastBb.middle) * 100;
  const volatilityRegime =
    bandWidthPct > 11 ? 'Elevated' : bandWidthPct < 5.5 ? 'Low' : 'Moderate';

  const recent20 = bars.slice(-20);
  const supportLevel = Number(Math.min(...recent20.map((b) => b.low)).toFixed(2));
  const resistanceLevel = Number(Math.max(...recent20.map((b) => b.high)).toFixed(2));

  return {
    rsi14: lastRsi,
    macdLine: lastMacd.macd,
    macdSignal: lastMacd.signal,
    macdHistogram: lastMacd.histogram,
    sma20: lastSma20,
    sma50: lastSma50,
    ema12: lastEma12,
    ema26: lastEma26,
    bollingerUpper: lastBb.upper,
    bollingerMiddle: lastBb.middle,
    bollingerLower: lastBb.lower,
    trendBias,
    volatilityRegime,
    supportLevel,
    resistanceLevel,
  };
}
