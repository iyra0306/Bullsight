import { ApiError } from '../../utils/apiError.js';

const PROVIDER_NAME = 'mock-sample-provider';
const SAMPLE_TIMESTAMP = '2026-11-23T15:30:00.000Z';

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const PERIOD_BAR_CONFIG = {
  '1D': { count: 48, stepDays: 0 },
  '1W': { count: 35, stepDays: 0 },
  '1M': { count: 30, stepDays: 1 },
  '3M': { count: 90, stepDays: 1 },
  '6M': { count: 130, stepDays: 1 },
  '1Y': { count: 252, stepDays: 1 },
  '5Y': { count: 260, stepDays: 7 },
  MAX: { count: 320, stepDays: 14 },
};

function generateOhlcSeries(symbol, endClose, endChangePct, period = '3M', baseVolatility = 0.016) {
  const cfg = PERIOD_BAR_CONFIG[period] || PERIOD_BAR_CONFIG['3M'];
  const rand = seededRandom(hashString(`${symbol}-${period}`));
  const count = cfg.count;

  const closes = new Array(count);
  closes[count - 1] = endClose;
  const prevCloseTarget = endClose / (1 + endChangePct / 100);
  if (count >= 2) {
    closes[count - 2] = Number(prevCloseTarget.toFixed(2));
  }

  const volScale =
    period === '1D'
      ? baseVolatility * 0.25
      : period === '1W'
      ? baseVolatility * 0.45
      : period === '5Y' || period === 'MAX'
      ? baseVolatility * 1.8
      : baseVolatility;

  for (let i = count - 3; i >= 0; i--) {
    const wave = Math.sin(i * 0.14 + (hashString(symbol) % 7)) * 0.004;
    const drift = -0.0005 + wave;
    const shock = (rand() - 0.49) * volScale * 1.4;
    const factor = Math.max(0.85, Math.min(1.15, 1 + drift + shock));
    closes[i] = Math.max(10, Number((closes[i + 1] / factor).toFixed(2)));
  }

  const endDate = new Date(SAMPLE_TIMESTAMP);
  const bars = [];

  for (let i = 0; i < count; i++) {
    const close = closes[i];
    const open =
      i === 0
        ? Number((close * (1 + (rand() - 0.5) * volScale * 0.5)).toFixed(2))
        : closes[i - 1];
    const bodyMax = Math.max(open, close);
    const bodyMin = Math.min(open, close);
    const high = Number((bodyMax * (1 + rand() * volScale * 0.65)).toFixed(2));
    const low = Number((bodyMin * (1 - rand() * volScale * 0.65)).toFixed(2));

    let timeStr;
    if (period === '1D') {
      const ts = Math.floor(endDate.getTime() / 1000) - (count - 1 - i) * 600;
      timeStr = String(ts);
    } else if (period === '1W') {
      const ts = Math.floor(endDate.getTime() / 1000) - (count - 1 - i) * 3600 * 4;
      timeStr = String(ts);
    } else {
      const d = new Date(endDate);
      d.setUTCDate(d.getUTCDate() - (count - 1 - i) * cfg.stepDays);
      timeStr = d.toISOString().slice(0, 10);
    }

    const baseVol = ((hashString(symbol) % 14) + 4) * 1_000_000;
    const volume = Math.round(baseVol * (0.65 + rand() * 0.9));

    bars.push({
      time: timeStr,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return bars;
}

const SAMPLE_INDICES = [
  {
    id: 'nifty50',
    symbol: 'NIFTY 50',
    name: 'NSE Benchmark Index',
    region: 'IN',
    exchange: 'NSE',
    currency: 'INR',
    value: 24384.65,
    change: 198.4,
    changePercent: 0.82,
    high: 24412.1,
    low: 24195.8,
    sessionNote: 'Sample reference · NSE India',
    sparkline: [23890, 23945, 24010, 23980, 24095, 24160, 24210, 24186, 24310, 24384.65],
  },
  {
    id: 'sensex',
    symbol: 'SENSEX',
    name: 'BSE 30 Sensitive Index',
    region: 'IN',
    exchange: 'BSE',
    currency: 'INR',
    value: 80142.3,
    change: 542.85,
    changePercent: 0.68,
    high: 80290.5,
    low: 79620.0,
    sessionNote: 'Sample reference · BSE India',
    sparkline: [78620, 78890, 79120, 79040, 79350, 79580, 79710, 79600, 79940, 80142.3],
  },
  {
    id: 'nasdaq',
    symbol: 'NASDAQ',
    name: 'NASDAQ Composite',
    region: 'US',
    exchange: 'NASDAQ',
    currency: 'USD',
    value: 19248.92,
    change: 214.6,
    changePercent: 1.13,
    high: 19295.4,
    low: 19018.2,
    sessionNote: 'Sample reference · US Tech',
    sparkline: [18640, 18710, 18820, 18780, 18910, 18990, 19085, 19034, 19160, 19248.92],
  },
  {
    id: 'sp500',
    symbol: 'S&P 500',
    name: 'Standard & Poor’s 500',
    region: 'US',
    exchange: 'NYSE',
    currency: 'USD',
    value: 6012.45,
    change: -14.8,
    changePercent: -0.25,
    high: 6048.1,
    low: 5994.3,
    sessionNote: 'Sample reference · US Broad',
    sparkline: [5940, 5962, 5988, 6004, 6025, 6038, 6032, 6027, 6018, 6012.45],
  },
];

const SAMPLE_STOCKS = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    market: 'US',
    exchange: 'NASDAQ',
    sector: 'Semiconductors',
    currency: 'USD',
    price: 146.82,
    previousClose: 141.78,
    open: 142.4,
    high: 147.5,
    low: 141.9,
    change: 5.04,
    changePercent: 3.55,
    volume: 64_210_000,
    marketCapBillions: 3590,
    monogramBg: '#193C2A',
    description:
      'Designs accelerated computing GPUs, networking interconnects, and software platforms powering enterprise AI training, inference, and industrial simulation.',
    headquarters: 'Santa Clara, California',
    ceo: 'Jensen Huang',
    founded: 1993,
    sparkline: [131.4, 134.2, 136.8, 135.9, 138.4, 140.1, 142.3, 141.78, 144.9, 146.82],
    fundamentals: {
      peRatio: 54.2,
      pbRatio: 48.6,
      eps: 2.71,
      dividendYield: 0.03,
      roe: 118.4,
      debtToEquity: 0.16,
      week52High: 152.89,
      week52Low: 68.42,
      avgVolume: 58_400_000,
      beta: 1.66,
    },
  },
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    market: 'IN',
    exchange: 'NSE',
    sector: 'Energy & Digital',
    currency: 'INR',
    price: 1348.6,
    previousClose: 1323.1,
    open: 1326.0,
    high: 1354.2,
    low: 1321.5,
    change: 25.5,
    changePercent: 1.93,
    volume: 14_820_000,
    marketCapBillions: 18240,
    monogramBg: '#1F3A31',
    description:
      'India’s largest private sector conglomerate operating across digital services (Jio), omnichannel retail, refining, petrochemicals, and clean energy infrastructure.',
    headquarters: 'Mumbai, Maharashtra',
    ceo: 'Mukesh Ambani',
    founded: 1958,
    sparkline: [1288, 1296, 1304, 1301, 1315, 1320, 1328, 1323.1, 1339, 1348.6],
    fundamentals: {
      peRatio: 26.8,
      pbRatio: 2.24,
      eps: 50.32,
      dividendYield: 0.38,
      roe: 9.8,
      debtToEquity: 0.41,
      week52High: 1608.8,
      week52Low: 1217.0,
      avgVolume: 12_900_000,
      beta: 1.08,
    },
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    market: 'IN',
    exchange: 'NSE',
    sector: 'IT Services',
    currency: 'INR',
    price: 4186.4,
    previousClose: 4135.2,
    open: 4142.0,
    high: 4202.5,
    low: 4130.0,
    change: 51.2,
    changePercent: 1.24,
    volume: 3_420_000,
    marketCapBillions: 15140,
    monogramBg: '#183329',
    description:
      'Global enterprise IT consulting, cloud modernization, and digital engineering firm serving banking, manufacturing, and retail enterprises worldwide.',
    headquarters: 'Mumbai, Maharashtra',
    ceo: 'K. Krithivasan',
    founded: 1968,
    sparkline: [4010, 4035, 4062, 4058, 4092, 4118, 4140, 4135.2, 4165, 4186.4],
    fundamentals: {
      peRatio: 31.4,
      pbRatio: 15.8,
      eps: 133.32,
      dividendYield: 1.42,
      roe: 51.2,
      debtToEquity: 0.08,
      week52High: 4592.25,
      week52Low: 3591.5,
      avgVolume: 2_890_000,
      beta: 0.74,
    },
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    market: 'US',
    exchange: 'NASDAQ',
    sector: 'Consumer Tech',
    currency: 'USD',
    price: 232.15,
    previousClose: 229.8,
    open: 230.1,
    high: 233.4,
    low: 229.2,
    change: 2.35,
    changePercent: 1.02,
    volume: 42_150_000,
    marketCapBillions: 3510,
    monogramBg: '#1C2E26',
    description:
      'Designs consumer hardware ecosystems, custom Apple Silicon processors, operating systems, and recurring digital services across global markets.',
    headquarters: 'Cupertino, California',
    ceo: 'Tim Cook',
    founded: 1976,
    sparkline: [223.1, 224.8, 226.4, 225.9, 227.5, 228.9, 230.2, 229.8, 231.0, 232.15],
    fundamentals: {
      peRatio: 34.6,
      pbRatio: 52.1,
      eps: 6.71,
      dividendYield: 0.43,
      roe: 147.2,
      debtToEquity: 1.45,
      week52High: 237.49,
      week52Low: 164.08,
      avgVolume: 44_900_000,
      beta: 1.24,
    },
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    market: 'IN',
    exchange: 'BSE',
    sector: 'Banking & Finance',
    currency: 'INR',
    price: 1764.85,
    previousClose: 1782.4,
    open: 1780.0,
    high: 1786.9,
    low: 1758.2,
    change: -17.55,
    changePercent: -0.98,
    volume: 16_450_000,
    marketCapBillions: 13450,
    monogramBg: '#23362D',
    description:
      'India’s premier private sector bank offering retail banking, institutional lending, treasury operations, and digital payment infrastructure.',
    headquarters: 'Mumbai, Maharashtra',
    ceo: 'Sashidhar Jagdishan',
    founded: 1994,
    sparkline: [1792, 1796, 1788, 1785, 1790, 1784, 1779, 1782.4, 1771, 1764.85],
    fundamentals: {
      peRatio: 19.6,
      pbRatio: 2.86,
      eps: 90.04,
      dividendYield: 1.11,
      roe: 16.4,
      debtToEquity: 0.78,
      week52High: 1812.0,
      week52Low: 1363.55,
      avgVolume: 18_100_000,
      beta: 0.92,
    },
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    market: 'US',
    exchange: 'NASDAQ',
    sector: 'Cloud & AI Software',
    currency: 'USD',
    price: 428.9,
    previousClose: 423.1,
    open: 424.0,
    high: 430.5,
    low: 422.8,
    change: 5.8,
    changePercent: 1.37,
    volume: 21_940_000,
    marketCapBillions: 3180,
    monogramBg: '#19352A',
    description:
      'Global cloud infrastructure, enterprise productivity, and developer tools leader anchored by Azure compute and integrated enterprise AI workflows.',
    headquarters: 'Redmond, Washington',
    ceo: 'Satya Nadella',
    founded: 1975,
    sparkline: [414.2, 416.8, 419.1, 418.4, 420.5, 422.0, 424.1, 423.1, 426.4, 428.9],
    fundamentals: {
      peRatio: 35.1,
      pbRatio: 11.4,
      eps: 12.22,
      dividendYield: 0.77,
      roe: 36.2,
      debtToEquity: 0.29,
      week52High: 468.35,
      week52Low: 366.5,
      avgVolume: 20_600_000,
      beta: 0.89,
    },
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    market: 'IN',
    exchange: 'NSE',
    sector: 'IT Services',
    currency: 'INR',
    price: 1894.3,
    previousClose: 1852.7,
    open: 1858.0,
    high: 1902.0,
    low: 1855.1,
    change: 41.6,
    changePercent: 2.25,
    volume: 7_820_000,
    marketCapBillions: 7860,
    monogramBg: '#1C3B30',
    description:
      'Next-generation digital consulting and cloud automation company helping global enterprises scale AI-assisted operations and core engineering.',
    headquarters: 'Bengaluru, Karnataka',
    ceo: 'Salil Parekh',
    founded: 1981,
    sparkline: [1810, 1819, 1828, 1835, 1842, 1848, 1859, 1852.7, 1878, 1894.3],
    fundamentals: {
      peRatio: 28.9,
      pbRatio: 8.7,
      eps: 65.54,
      dividendYield: 2.01,
      roe: 31.8,
      debtToEquity: 0.09,
      week52High: 1991.45,
      week52Low: 1358.35,
      avgVolume: 6_900_000,
      beta: 0.86,
    },
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    market: 'US',
    exchange: 'NASDAQ',
    sector: 'Automotive & Energy',
    currency: 'USD',
    price: 342.18,
    previousClose: 351.4,
    open: 349.8,
    high: 353.2,
    low: 339.4,
    change: -9.22,
    changePercent: -2.62,
    volume: 88_400_000,
    marketCapBillions: 1090,
    monogramBg: '#27302B',
    description:
      'Designs electric vehicles, autonomous driving neural software, grid-scale battery storage systems, and solar energy generation hardware.',
    headquarters: 'Austin, Texas',
    ceo: 'Elon Musk',
    founded: 2003,
    sparkline: [364.2, 361.0, 358.4, 355.1, 357.2, 353.9, 352.0, 351.4, 346.5, 342.18],
    fundamentals: {
      peRatio: 92.4,
      pbRatio: 15.6,
      eps: 3.7,
      dividendYield: 0.0,
      roe: 19.8,
      debtToEquity: 0.14,
      week52High: 368.1,
      week52Low: 138.8,
      avgVolume: 79_200_000,
      beta: 2.28,
    },
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    market: 'IN',
    exchange: 'BSE',
    sector: 'Automotive & EV',
    currency: 'INR',
    price: 792.45,
    previousClose: 811.2,
    open: 809.5,
    high: 814.0,
    low: 788.3,
    change: -18.75,
    changePercent: -2.31,
    volume: 19_300_000,
    marketCapBillions: 2915,
    monogramBg: '#222F29',
    description:
      'Leading Indian automotive manufacturer producing passenger EVs, commercial mobility fleets, and luxury Jaguar Land Rover vehicles.',
    headquarters: 'Mumbai, Maharashtra',
    ceo: 'P.B. Balaji (Group CFO)',
    founded: 1945,
    sparkline: [834, 829, 825, 821, 818, 815, 813, 811.2, 801, 792.45],
    fundamentals: {
      peRatio: 9.4,
      pbRatio: 3.1,
      eps: 84.3,
      dividendYield: 0.76,
      roe: 28.4,
      debtToEquity: 1.02,
      week52High: 1179.0,
      week52Low: 668.4,
      avgVolume: 15_400_000,
      beta: 1.32,
    },
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    market: 'IN',
    exchange: 'NSE',
    sector: 'Banking & Finance',
    currency: 'INR',
    price: 1296.4,
    previousClose: 1272.8,
    open: 1275.0,
    high: 1301.2,
    low: 1271.4,
    change: 23.6,
    changePercent: 1.85,
    volume: 11_650_000,
    marketCapBillions: 9120,
    monogramBg: '#1D372B',
    description:
      'Universal banking institution across India providing retail credit, SME digital banking, corporate treasury, and wealth management.',
    headquarters: 'Mumbai, Maharashtra',
    ceo: 'Sandeep Bakhshi',
    founded: 1994,
    sparkline: [1248, 1254, 1259, 1264, 1261, 1269, 1274, 1272.8, 1286, 1296.4],
    fundamentals: {
      peRatio: 19.8,
      pbRatio: 3.35,
      eps: 65.47,
      dividendYield: 0.77,
      roe: 18.7,
      debtToEquity: 0.72,
      week52High: 1362.35,
      week52Low: 985.5,
      avgVolume: 10_400_000,
      beta: 0.96,
    },
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    market: 'US',
    exchange: 'NASDAQ',
    sector: 'Cloud & Commerce',
    currency: 'USD',
    price: 208.74,
    previousClose: 204.2,
    open: 205.1,
    high: 209.6,
    low: 204.4,
    change: 4.54,
    changePercent: 2.22,
    volume: 38_710_000,
    marketCapBillions: 2190,
    monogramBg: '#1B3429',
    description:
      'Operates global e-commerce logistics, digital advertising ecosystems, and Amazon Web Services cloud compute infrastructure.',
    headquarters: 'Seattle, Washington',
    ceo: 'Andy Jassy',
    founded: 1994,
    sparkline: [197.4, 198.9, 200.5, 201.8, 202.4, 203.9, 204.8, 204.2, 206.9, 208.74],
    fundamentals: {
      peRatio: 43.8,
      pbRatio: 8.6,
      eps: 4.77,
      dividendYield: 0.0,
      roe: 22.6,
      debtToEquity: 0.58,
      week52High: 215.9,
      week52Low: 144.05,
      avgVolume: 41_200_000,
      beta: 1.15,
    },
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    market: 'US',
    exchange: 'NASDAQ',
    sector: 'Semiconductors',
    currency: 'USD',
    price: 139.4,
    previousClose: 141.95,
    open: 141.5,
    high: 142.8,
    low: 138.2,
    change: -2.55,
    changePercent: -1.8,
    volume: 39_120_000,
    marketCapBillions: 226,
    monogramBg: '#23322B',
    description:
      'Develops high-performance EPYC data center CPUs, Instinct AI accelerators, and adaptive SoC architectures for enterprise compute.',
    headquarters: 'Santa Clara, California',
    ceo: 'Lisa Su',
    founded: 1969,
    sparkline: [147.2, 146.1, 144.8, 143.9, 144.5, 143.2, 142.4, 141.95, 140.6, 139.4],
    fundamentals: {
      peRatio: 118.4,
      pbRatio: 3.9,
      eps: 1.18,
      dividendYield: 0.0,
      roe: 3.4,
      debtToEquity: 0.04,
      week52High: 227.3,
      week52Low: 114.2,
      avgVolume: 42_500_000,
      beta: 1.71,
    },
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    market: 'IN',
    exchange: 'NSE',
    sector: 'Telecom & Digital',
    currency: 'INR',
    price: 1612.75,
    previousClose: 1581.0,
    open: 1584.2,
    high: 1621.0,
    low: 1580.4,
    change: 31.75,
    changePercent: 2.01,
    volume: 6_540_000,
    marketCapBillions: 9180,
    monogramBg: '#19362C',
    description:
      'Integrated telecommunications provider delivering 5G mobility, enterprise fiber networks, and digital cloud connectivity across India and Africa.',
    headquarters: 'New Delhi, India',
    ceo: 'Gopal Vittal',
    founded: 1995,
    sparkline: [1542, 1550, 1558, 1564, 1571, 1576, 1583, 1581.0, 1598, 1612.75],
    fundamentals: {
      peRatio: 64.2,
      pbRatio: 10.4,
      eps: 25.12,
      dividendYield: 0.5,
      roe: 14.9,
      debtToEquity: 1.85,
      week52High: 1779.0,
      week52Low: 960.0,
      avgVolume: 5_900_000,
      beta: 0.82,
    },
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    market: 'US',
    exchange: 'NASDAQ',
    sector: 'Cloud & AI Software',
    currency: 'USD',
    price: 178.45,
    previousClose: 176.2,
    open: 176.8,
    high: 179.9,
    low: 176.1,
    change: 2.25,
    changePercent: 1.28,
    volume: 25_600_000,
    marketCapBillions: 2180,
    monogramBg: '#183026',
    description:
      'Global information discovery, digital advertising, YouTube media, and Google Cloud AI infrastructure enterprise.',
    headquarters: 'Mountain View, California',
    ceo: 'Sundar Pichai',
    founded: 1998,
    sparkline: [171.2, 172.5, 173.8, 174.1, 175.0, 175.9, 176.5, 176.2, 177.4, 178.45],
    fundamentals: {
      peRatio: 23.6,
      pbRatio: 7.1,
      eps: 7.56,
      dividendYield: 0.45,
      roe: 31.4,
      debtToEquity: 0.09,
      week52High: 191.75,
      week52Low: 130.67,
      avgVolume: 26_100_000,
      beta: 1.04,
    },
  },
];

export const mockMarketProvider = {
  providerName: PROVIDER_NAME,
  dataStatus: 'sample',

  async getIndices(region = 'ALL', period = '3M') {
    const filtered =
      region === 'ALL' ? SAMPLE_INDICES : SAMPLE_INDICES.filter((idx) => idx.region === region);

    return filtered.map((idx) => ({
      ...idx,
      latestValue: idx.value,
      absoluteChange: idx.change,
      percentageChange: idx.changePercent,
      dataTimestamp: SAMPLE_TIMESTAMP,
      dataSource: PROVIDER_NAME,
      dataStatus: 'sample',
      isSampleData: true,
      history: generateOhlcSeries(idx.symbol, idx.value, idx.changePercent, period, 0.009),
    }));
  },

  async getStocks(filters = {}) {
    const { region = 'ALL', exchange, sector, direction } = filters;
    return SAMPLE_STOCKS.filter((s) => {
      if (region !== 'ALL' && s.market !== region) return false;
      if (exchange && exchange !== 'ALL' && s.exchange !== exchange.toUpperCase()) return false;
      if (sector && sector !== 'ALL' && s.sector.toLowerCase() !== sector.toLowerCase()) return false;
      if (direction === 'GAINERS' && s.changePercent <= 0) return false;
      if (direction === 'LOSERS' && s.changePercent >= 0) return false;
      return true;
    }).map((s) => ({
      ...s,
      dataTimestamp: SAMPLE_TIMESTAMP,
      dataSource: PROVIDER_NAME,
      dataStatus: 'sample',
      isSampleData: true,
    }));
  },

  async searchStocks(query) {
    const q = query.trim().toLowerCase();
    return SAMPLE_STOCKS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.exchange.toLowerCase().includes(q) ||
        s.market.toLowerCase() === q ||
        s.sector.toLowerCase().includes(q)
    ).map((s) => ({
      ...s,
      dataTimestamp: SAMPLE_TIMESTAMP,
      dataSource: PROVIDER_NAME,
      dataStatus: 'sample',
      isSampleData: true,
    }));
  },

  async getStockBySymbol(symbol) {
    const stock = SAMPLE_STOCKS.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (!stock) {
      throw ApiError.notFound(
        `Stock symbol "${symbol}" is not in the supported sample universe.`,
        { symbol },
        'STOCK_NOT_FOUND'
      );
    }
    return {
      ...stock,
      dataTimestamp: SAMPLE_TIMESTAMP,
      dataSource: PROVIDER_NAME,
      dataStatus: 'sample',
      isSampleData: true,
    };
  },

  async getStockHistory(symbol, { period = '3M', fromDate = null, toDate = null } = {}) {
    const stock = await this.getStockBySymbol(symbol);
    let bars = generateOhlcSeries(stock.symbol, stock.price, stock.changePercent, period);

    if (fromDate || toDate) {
      bars = bars.filter((bar) => {
        const barDate = /^\d+$/.test(bar.time)
          ? new Date(Number(bar.time) * 1000)
          : new Date(`${bar.time}T12:00:00Z`);
        if (fromDate && barDate < fromDate) return false;
        if (toDate && barDate > toDate) return false;
        return true;
      });
    }

    return {
      symbol: stock.symbol,
      market: stock.market,
      exchange: stock.exchange,
      currency: stock.currency,
      period,
      bars,
      dataTimestamp: SAMPLE_TIMESTAMP,
      dataSource: PROVIDER_NAME,
      dataStatus: 'sample',
      isSampleData: true,
    };
  },
};
