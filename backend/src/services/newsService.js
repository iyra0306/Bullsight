import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const DEMO_ARTICLES = [
  {
    id: 'news-1',
    title: 'Institutional Compute Demand Pushes Semiconductor Equities Higher Across Global Venues',
    headline: 'Institutional Compute Demand Pushes Semiconductor Equities Higher Across Global Venues',
    summary:
      'Demonstrative editorial briefing examining how hyperscale data center capex forecasts are influencing large-cap chipmaker momentum.',
    content:
      'This demonstration market article illustrates how institutional semiconductor order books and data center capital expenditure guidance shape sector breadth across NASDAQ and Asian supply chains. Analysts observe heightened sensitivity around accelerator shipment cadences, gross margin durability, and inference efficiency metrics heading into the upcoming quarterly cycle.',
    category: 'AI & Tech',
    sentiment: 'Positive',
    source: 'BULLSIGHT Research Desk (Demo)',
    articleUrl: 'https://bullsight.preview/news/news-1',
    publishedAt: '2026-11-23T03:45:00.000Z',
    displayDate: 'Nov 23, 2026 · 09:15 IST',
    readTime: '4 min read',
    relatedSymbols: ['NVDA', 'AMD', 'MSFT'],
    imageUrl: '/src/assets/images/semiconductor_datacenter_ai_1795502352298.jpg',
    isDemoArticle: true,
    dataStatus: 'demonstration',
  },
  {
    id: 'news-2',
    title: 'Mumbai Large-Cap Financials and Energy Leaders Anchor NIFTY 50 Consolidation',
    headline: 'Mumbai Large-Cap Financials and Energy Leaders Anchor NIFTY 50 Consolidation',
    summary:
      'Sample market commentary tracking domestic institutional inflows, credit growth resilience, and telecom ARPU expansion in Indian benchmarks.',
    content:
      'In this illustrative regional market note, domestic mutual fund SIP inflows continue to cushion volatility across NIFTY 50 and BSE SENSEX constituents. Private sector lenders and digital telecom operators show constructive accumulation patterns, while energy conglomerates balance refining margins against clean-infrastructure capital allocation.',
    category: 'India Markets',
    sentiment: 'Positive',
    source: 'Dalal Street Digest (Demo)',
    articleUrl: 'https://bullsight.preview/news/news-2',
    publishedAt: '2026-11-23T03:10:00.000Z',
    displayDate: 'Nov 23, 2026 · 08:40 IST',
    readTime: '5 min read',
    relatedSymbols: ['RELIANCE', 'ICICIBANK', 'BHARTIARTL', 'HDFCBANK'],
    imageUrl: '/src/assets/images/mumbai_financial_skyline_1795502353360.jpg',
    isDemoArticle: true,
    dataStatus: 'demonstration',
  },
  {
    id: 'news-3',
    title: 'Cross-Asset Volatility Compresses Ahead of Central Bank Liquidity Minutes',
    headline: 'Cross-Asset Volatility Compresses Ahead of Central Bank Liquidity Minutes',
    summary:
      'Illustrative macro desk summary reviewing treasury yield positioning, S&P 500 breadth, and systematic fund rebalancing flows.',
    content:
      'This sample macroeconomic overview examines how bond yield stabilization near key technical bands is influencing equity risk premia across New York and European trading desks. Systematic trend-following strategies remain selectively positioned in high-cash-flow software and infrastructure leaders.',
    category: 'Macro',
    sentiment: 'Neutral',
    source: 'Global Macro Wire (Demo)',
    articleUrl: 'https://bullsight.preview/news/news-3',
    publishedAt: '2026-11-23T02:30:00.000Z',
    displayDate: 'Nov 22, 2026 · 21:30 EST',
    readTime: '3 min read',
    relatedSymbols: ['AAPL', 'GOOGL', 'AMZN'],
    imageUrl: '/src/assets/images/market_exchange_floor_1795502352451.jpg',
    isDemoArticle: true,
    dataStatus: 'demonstration',
  },
  {
    id: 'news-4',
    title: 'Enterprise IT Services Firms Expand AI Copilot Integration Contracts in North America',
    headline: 'Enterprise IT Services Firms Expand AI Copilot Integration Contracts in North America',
    summary:
      'Demonstration equity update focusing on deal pipeline conversion among Tier-1 Indian IT exporters and cloud advisory groups.',
    content:
      'Sample commentary highlighting renewed discretionary cloud migration budgets across North American banking and healthcare clients. Tier-1 Indian IT consultancies report steady total contract value bookings with an increasing proportion tied to automated data pipeline modernization.',
    category: 'Equities',
    sentiment: 'Positive',
    source: 'Tech & Markets Journal (Demo)',
    articleUrl: 'https://bullsight.preview/news/news-4',
    publishedAt: '2026-11-22T11:40:00.000Z',
    displayDate: 'Nov 22, 2026 · 17:10 IST',
    readTime: '4 min read',
    relatedSymbols: ['TCS', 'INFY'],
    imageUrl: '/src/assets/images/semiconductor_datacenter_ai_1795502352298.jpg',
    isDemoArticle: true,
    dataStatus: 'demonstration',
  },
  {
    id: 'news-5',
    title: 'Electric Mobility Margin Pressures Prompt Selective Repricing in Auto Suppliers',
    headline: 'Electric Mobility Margin Pressures Prompt Selective Repricing in Auto Suppliers',
    summary:
      'Illustrative sector note exploring battery raw material deflation versus regional EV incentive adjustments.',
    content:
      'This demonstration sector report outlines near-term margin sensitivity across global EV manufacturers as pricing competition intensifies in Europe and Asia. Investors continue to monitor free cash flow conversion and autonomous software attachment rates.',
    category: 'US Markets',
    sentiment: 'Cautious',
    source: 'Mobility Capital Brief (Demo)',
    articleUrl: 'https://bullsight.preview/news/news-5',
    publishedAt: '2026-11-22T19:05:00.000Z',
    displayDate: 'Nov 22, 2026 · 14:05 EST',
    readTime: '4 min read',
    relatedSymbols: ['TSLA', 'TATAMOTORS'],
    imageUrl: '/src/assets/images/market_exchange_floor_1795502352451.jpg',
    isDemoArticle: true,
    dataStatus: 'demonstration',
  },
  {
    id: 'news-6',
    title: 'Cloud Infrastructure Capex Cycles Enter Multi-Year Power & Grid Bottleneck Phase',
    headline: 'Cloud Infrastructure Capex Cycles Enter Multi-Year Power & Grid Bottleneck Phase',
    summary:
      'Sample thematic research brief on hyperscaler energy procurement and silicon efficiency roadmaps.',
    content:
      'Demonstration thematic note examining how power grid interconnect queues and custom silicon tape-outs are reshaping cloud margin expectations over the coming 24 months.',
    category: 'AI & Tech',
    sentiment: 'Neutral',
    source: 'Quantitative Horizon (Demo)',
    articleUrl: 'https://bullsight.preview/news/news-6',
    publishedAt: '2026-11-22T00:20:00.000Z',
    displayDate: 'Nov 21, 2026 · 19:20 EST',
    readTime: '6 min read',
    relatedSymbols: ['AMZN', 'MSFT', 'GOOGL'],
    imageUrl: '/src/assets/images/mumbai_financial_skyline_1795502353360.jpg',
    isDemoArticle: true,
    dataStatus: 'demonstration',
  },
];

export const newsService = {
  getProviderStatus() {
    return {
      provider: env.NEWS_API_KEY ? 'external-news-api-configured' : 'demo-news-provider',
      dataStatus: env.NEWS_API_KEY ? 'configured' : 'demonstration',
      isLiveConfigured: Boolean(env.NEWS_API_KEY),
    };
  },

  async listNews({ category, symbol, sentiment, q, page = 1, limit = 12 } = {}) {
    let items = [...DEMO_ARTICLES];

    if (category && category !== 'All') {
      const catLower = category.trim().toLowerCase();
      items = items.filter((a) => a.category.toLowerCase() === catLower);
    }

    if (symbol) {
      const symUpper = symbol.trim().toUpperCase();
      items = items.filter((a) => a.relatedSymbols.includes(symUpper));
    }

    if (sentiment && sentiment !== 'All') {
      const sentLower = sentiment.trim().toLowerCase();
      items = items.filter((a) => a.sentiment.toLowerCase() === sentLower);
    }

    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query) ||
          a.relatedSymbols.some((sym) => sym.toLowerCase().includes(query))
      );
    }

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    const paginated = items.slice(offset, offset + limit);

    return {
      articles: paginated,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
      dataSource: 'demo-news-provider',
      dataStatus: 'demonstration',
      isDemoData: true,
    };
  },

  async getById(id) {
    const article = DEMO_ARTICLES.find((a) => a.id === id);
    if (!article) {
      throw ApiError.notFound(`News article "${id}" was not found.`, { id }, 'NEWS_NOT_FOUND');
    }
    return article;
  },
};
