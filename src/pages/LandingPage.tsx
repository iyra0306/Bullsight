import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CandlestickChart,
  ChevronRight,
  Compass,
  Layers,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Navbar, BullSightLogo } from '../components/Navbar';
import { HeroThreeScene } from '../components/HeroThreeScene';
import { ChartContainer } from '../components/ChartContainer';
import { MarketIndexCard } from '../components/MarketIndexCard';
import { StockCard } from '../components/StockCard';
import { NewsCard } from '../components/NewsCard';
import { marketService, SAMPLE_INDICES } from '../services/marketService';
import { stockService } from '../services/stockService';
import { newsService } from '../services/newsService';
import { aiService } from '../services/aiService';
import { calculateBollingerBands, calculateEMA, calculateRSI, calculateSMA } from '../utils/indicators';
import { MarketIndex, NewsArticle, StockQuote, Timeframe } from '../types/market';
import { useMagnetic } from '../hooks/useMagnetic';
import { useReducedMotion } from '../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const heroScopeRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  const primaryCta = useMagnetic(0.2);
  const secondaryCta = useMagnetic(0.18);

  // Interactive market visualization state (instant initial snapshot, hydrated from Express backend)
  const [indices, setIndices] = useState<MarketIndex[]>(SAMPLE_INDICES);
  const [selectedIndex, setSelectedIndex] = useState<MarketIndex>(SAMPLE_INDICES[0]);
  const [chartTimeframe, setChartTimeframe] = useState<Timeframe>('3M');
  const [chartStyle, setChartStyle] = useState<'area' | 'candlestick'>('candlestick');

  // Global stocks explorer preview filter
  const [stockRegion, setStockRegion] = useState<'ALL' | 'IN' | 'US'>('ALL');
  const [remoteStocks, setRemoteStocks] = useState<StockQuote[] | null>(null);

  // Technical showcase indicator selector
  const [activeTechOverlay, setActiveTechOverlay] = useState<'sma' | 'bollinger' | 'rsi'>('bollinger');

  // News reader modal
  const [remoteNews, setRemoteNews] = useState<NewsArticle[] | null>(null);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    marketService
      .fetchMarketOverview('ALL', chartTimeframe, controller.signal)
      .then((res) => {
        if (res.indices?.length) {
          setIndices(res.indices);
          setSelectedIndex((prev) => res.indices.find((i) => i.id === prev.id) || res.indices[0]);
        }
      })
      .catch(() => {
        // Keep initial snapshot if offline
      });
    return () => controller.abort();
  }, [chartTimeframe]);

  useEffect(() => {
    const controller = new AbortController();
    stockService
      .fetchStocks({ region: stockRegion }, controller.signal)
      .then((res) => {
        if (res.stocks?.length) setRemoteStocks(res.stocks.slice(0, 6));
      })
      .catch(() => {
        // Keep initial snapshot if offline
      });
    return () => controller.abort();
  }, [stockRegion]);

  useEffect(() => {
    const controller = new AbortController();
    newsService
      .fetchNews({ limit: 3, page: 1 }, controller.signal)
      .then((res) => {
        if (res.articles?.length) setRemoteNews(res.articles);
      })
      .catch(() => {
        // Keep initial snapshot if offline
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (reducedMotion || !heroScopeRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-stagger', {
        y: 22,
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });

      gsap.utils.toArray<HTMLElement>('.reveal-section').forEach((section) => {
        gsap.from(section, {
          y: 24,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: section,
            start: 'top 86%',
            once: true,
          },
        });
      });
    }, heroScopeRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const indexBars = useMemo(
    () =>
      selectedIndex.history?.length
        ? selectedIndex.history
        : marketService.getIndexHistory(selectedIndex.id, chartTimeframe),
    [selectedIndex, chartTimeframe]
  );

  const previewStocks = useMemo(
    () => remoteStocks || marketService.getStocks(stockRegion).slice(0, 6),
    [remoteStocks, stockRegion]
  );

  const aiPreview = useMemo(() => aiService.getIllustrativePrediction('NVDA', '30D'), []);

  const techBars = useMemo(() => marketService.getStockHistory('RELIANCE', '6M'), []);
  const techLines = useMemo(() => {
    if (activeTechOverlay === 'sma') {
      return [
        { id: 'sma20', label: 'SMA 20', color: '#36C982', data: calculateSMA(techBars, 20) },
        { id: 'ema12', label: 'EMA 12', color: '#A5EBC3', dashed: true, data: calculateEMA(techBars, 12) },
      ];
    }
    if (activeTechOverlay === 'bollinger') {
      const bb = calculateBollingerBands(techBars, 20, 2);
      return [
        { id: 'bbU', label: 'Upper BB', color: '#A5EBC3', dashed: true, lineWidth: 1 as const, data: bb.map((b) => ({ time: b.time, value: b.upper })) },
        { id: 'bbM', label: 'Mid BB', color: '#36C982', lineWidth: 2 as const, data: bb.map((b) => ({ time: b.time, value: b.middle })) },
        { id: 'bbL', label: 'Lower BB', color: '#A5EBC3', dashed: true, lineWidth: 1 as const, data: bb.map((b) => ({ time: b.time, value: b.lower })) },
      ];
    }
    return [
      { id: 'rsi', label: 'RSI (14)', color: '#36C982', data: calculateRSI(techBars, 14) },
    ];
  }, [activeTechOverlay, techBars]);

  const featuredNews = useMemo(() => remoteNews || marketService.getNews().slice(0, 3), [remoteNews]);

  return (
    <div
      ref={heroScopeRef}
      className="min-h-screen bg-[#f4f7f5] text-[#101814] dark:bg-[#101512] dark:text-[#E8F0EA]"
    >
      <Navbar />

      {/* HERO SECTION */}
      <section
        id="hero"
        className="bg-fintech-grid relative overflow-hidden border-b border-black/10 dark:border-white/8"
      >
        <div className="mx-auto grid max-w-[1380px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:py-20 lg:px-8">
          <div className="relative z-10 lg:col-span-6">
            <p className="hero-stagger text-xs font-semibold tracking-wide text-[#137949] dark:text-[#36C982]">
              BULLSIGHT · See the Bull. Predict the Move.
            </p>

            <h1 className="hero-stagger mt-4 max-w-xl text-balance font-display text-[clamp(2.35rem,4.5vw,3.85rem)] font-extrabold leading-[1.08] tracking-tight text-[#101814] dark:text-[#E8F0EA]">
              See Beyond the Market.
            </h1>

            <p className="hero-stagger mt-5 max-w-lg text-base leading-relaxed text-[#53645A] dark:text-[#91A197] sm:text-lg">
              Explore market movements. Discover hidden patterns. Make data-driven decisions with
              AI-powered market intelligence.
            </p>

            <div className="hero-stagger mt-8 flex flex-wrap items-center gap-4">
              <Link
                ref={primaryCta.ref as React.Ref<HTMLAnchorElement>}
                onMouseMove={primaryCta.onMouseMove}
                onMouseLeave={primaryCta.onMouseLeave}
                data-cursor="magnetic"
                to="/app"
                className="inline-flex items-center gap-2 rounded-lg bg-[#36C982] px-6 py-3 text-sm font-semibold text-[#0B120E] transition-colors hover:bg-[#A5EBC3]"
              >
                <span>Explore Markets</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                ref={secondaryCta.ref as React.Ref<HTMLAnchorElement>}
                onMouseMove={secondaryCta.onMouseMove}
                onMouseLeave={secondaryCta.onMouseLeave}
                data-cursor="magnetic"
                to="/app/predictions"
                className="inline-flex items-center gap-2 rounded-lg border border-black/15 bg-white/80 px-6 py-3 text-sm font-semibold text-[#101814] transition-colors hover:border-[#36C982]/60 dark:border-white/15 dark:bg-[#18211C] dark:text-[#E8F0EA] dark:hover:bg-[#202B24]"
              >
                <span>Discover AI</span>
                <BrainCircuit className="h-4 w-4 text-[#137949] dark:text-[#36C982]" />
              </Link>
            </div>

            <div className="hero-stagger mt-10 grid grid-cols-3 gap-6 border-t border-black/10 pt-6 dark:border-white/8">
              <div>
                <div className="font-mono-num text-xl font-bold text-[#101814] dark:text-[#E8F0EA]">
                  NSE &amp; NASDAQ
                </div>
                <div className="mt-1 text-xs text-[#53645A] dark:text-[#91A197]">
                  Dual-region sample coverage
                </div>
              </div>
              <div>
                <div className="font-mono-num text-xl font-bold text-[#101814] dark:text-[#E8F0EA]">
                  8 Timeframes
                </div>
                <div className="mt-1 text-xs text-[#53645A] dark:text-[#91A197]">
                  1D intraday to MAX horizon
                </div>
              </div>
              <div>
                <div className="font-mono-num text-xl font-bold text-[#101814] dark:text-[#E8F0EA]">
                  5 Indicators
                </div>
                <div className="mt-1 text-xs text-[#53645A] dark:text-[#91A197]">
                  RSI, MACD, SMA, EMA, BB
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 3D Financial Sculpture */}
          <div className="relative h-[380px] w-full overflow-hidden rounded-2xl border border-black/10 bg-[#101512] dark:border-white/10 sm:h-[460px] lg:col-span-6 lg:h-[520px]">
            <HeroThreeScene />
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-[#91A197]">
              <span>Interactive 3D Candlestick &amp; Neural Spline</span>
              <span>Move cursor to inspect perspective</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. MARKET INTELLIGENCE INTRODUCTION */}
      <section className="reveal-section mx-auto max-w-[1380px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-balance font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA] sm:text-3xl">
              Precision equity intelligence without visual noise.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197] sm:text-base">
              BULLSIGHT consolidates multi-market index tracking, interactive candlestick telemetry,
              technical oscillator decomposition, and illustrative scenario forecasting inside a
              high-contrast workspace engineered for clarity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
              <CandlestickChart className="h-5 w-5 text-[#137949] dark:text-[#36C982]" />
              <h3 className="mt-3 font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                01. Multi-Market Terminal
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
                Inspect NIFTY 50, SENSEX, NASDAQ, and S&amp;P 500 benchmarks alongside Indian and US
                sample equities with seamless INR/USD conversion.
              </p>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
              <Activity className="h-5 w-5 text-[#137949] dark:text-[#36C982]" />
              <h3 className="mt-3 font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                02. Synchronized Technicals
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
                Real mathematical calculation of RSI(14), MACD(12,26,9), SMA, EMA, and Bollinger
                Bands directly from OHLC price series.
              </p>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
              <BrainCircuit className="h-5 w-5 text-[#137949] dark:text-[#36C982]" />
              <h3 className="mt-3 font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                03. Illustrative AI Scenarios
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
                Explore confidence envelopes, bullish/neutral/bearish scenarios, and feature
                weightings clearly labelled as frontend design previews.
              </p>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
              <Layers className="h-5 w-5 text-[#137949] dark:text-[#36C982]" />
              <h3 className="mt-3 font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                04. Production-Ready Boundary
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
                Modular service architecture prepared for Node.js, Express, MongoDB, Redis
                caching, JWT auth, and Python ML inference pipelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE MARKET VISUALIZATION */}
      <section className="reveal-section border-y border-black/10 bg-[#eaf0ec]/60 py-16 dark:border-white/8 dark:bg-[#141C17] lg:py-20">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#137949] dark:text-[#36C982]">
                Interactive Benchmark Preview · Sample Market Data
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA] sm:text-3xl">
                Live Chart Exploration
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-black/10 bg-white p-0.5 dark:border-white/8 dark:bg-[#18211C]">
                {(['candlestick', 'area'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setChartStyle(style)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      chartStyle === style
                        ? 'bg-[#36C982] text-[#0B120E]'
                        : 'text-[#53645A] dark:text-[#91A197]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>

              <div className="flex rounded-lg border border-black/10 bg-white p-0.5 dark:border-white/8 dark:bg-[#18211C]">
                {(['1W', '1M', '3M', '6M', '1Y'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setChartTimeframe(tf)}
                    className={`rounded-md px-2.5 py-1.5 font-mono-num text-xs font-semibold transition-colors ${
                      chartTimeframe === tf
                        ? 'bg-[#214B37] text-[#A5EBC3]'
                        : 'text-[#53645A] dark:text-[#91A197]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {indices.map((idx) => (
              <MarketIndexCard
                key={idx.id}
                index={idx}
                active={selectedIndex.id === idx.id}
                onSelect={setSelectedIndex}
              />
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                  {selectedIndex.symbol}
                </span>
                <span className="ml-2 text-xs text-[#53645A] dark:text-[#91A197]">
                  {selectedIndex.name} · {chartTimeframe} Sample Trajectory
                </span>
              </div>
              <Link
                to="/app"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
              >
                <span>Open Full Overview</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ChartContainer
              bars={indexBars}
              mode={chartStyle}
              showVolume
              height={320}
            />
          </div>
        </div>
      </section>

      {/* 3. EXPLORE GLOBAL STOCKS */}
      <section className="reveal-section mx-auto max-w-[1380px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#137949] dark:text-[#36C982]">
              Indian &amp; US Sample Equities
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA] sm:text-3xl">
              Explore Global Stocks
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-black/10 bg-white p-0.5 dark:border-white/8 dark:bg-[#18211C]">
              {(['ALL', 'IN', 'US'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setStockRegion(r)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    stockRegion === r
                      ? 'bg-[#36C982] text-[#0B120E]'
                      : 'text-[#53645A] dark:text-[#91A197]'
                  }`}
                >
                  {r === 'ALL' ? 'All Markets' : r === 'IN' ? 'India (NSE/BSE)' : 'US (NASDAQ)'}
                </button>
              ))}
            </div>
            <Link
              to="/app/explore"
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3.5 py-2 text-xs font-semibold text-[#101814] hover:border-[#36C982]/50 dark:border-white/8 dark:bg-[#18211C] dark:text-[#E8F0EA]"
            >
              <Compass className="h-3.5 w-3.5 text-[#36C982]" />
              <span>Screener</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewStocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </section>

      {/* 4. AI PREDICTION CAPABILITIES */}
      <section
        id="ai-intelligence"
        className="reveal-section border-y border-black/10 bg-[#eaf0ec]/60 py-16 dark:border-white/8 dark:bg-[#141C17] lg:py-20"
      >
        <div className="mx-auto grid max-w-[1380px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold text-[#137949] dark:text-[#36C982]">
              Illustrative Forecast Architecture
            </p>
            <h2 className="mt-2 text-balance font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA] sm:text-3xl">
              Scenario bands &amp; signal attribution designed for Python ML.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
              The AI Prediction Centre visualizes bullish, neutral, and bearish price envelopes,
              historical vs. projected trajectories, and MAE/RMSE evaluation structures. All values
              shown in this frontend preview are illustrative placeholders until the Python ML
              service is connected.
            </p>

            <div className="mt-6 space-y-3">
              {aiPreview.scenarios.map((s) => (
                <div
                  key={s.stance}
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/8 dark:bg-[#18211C]"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#101814] dark:text-[#E8F0EA]">
                      {s.stance} Illustrative Scenario (NVDA · 30D)
                    </div>
                    <div className="mt-0.5 text-xs text-[#53645A] dark:text-[#91A197]">
                      Weight {s.probabilityPercent}%
                    </div>
                  </div>
                  <div className="text-right font-mono-num">
                    <div className="text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                      ${s.targetPrice.toFixed(2)}
                    </div>
                    <div
                      className={`text-xs ${
                        s.expectedReturnPercent >= 0
                          ? 'text-[#137949] dark:text-[#36C982]'
                          : 'text-[#D94848] dark:text-[#EF6461]'
                      }`}
                    >
                      {s.expectedReturnPercent >= 0 ? '+' : ''}
                      {s.expectedReturnPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/app/predictions"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#36C982] px-5 py-2.5 text-sm font-semibold text-[#0B120E] transition-colors hover:bg-[#A5EBC3]"
            >
              <span>Open AI Prediction Centre</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C] lg:col-span-7">
            <div className="mb-3 flex items-center justify-between text-xs text-[#53645A] dark:text-[#91A197]">
              <span className="font-semibold text-[#101814] dark:text-[#E8F0EA]">
                NVDA · Actual vs. Illustrative Forecast Comparison
              </span>
              <span>Illustrative Preview</span>
            </div>
            <ChartContainer
              mode="line"
              height={320}
              extraLines={[
                {
                  id: 'actual',
                  label: 'Sample Actual',
                  color: '#E8F0EA',
                  lineWidth: 2,
                  data: aiPreview.backtestComparison.map((p) => ({
                    time: p.time,
                    value: p.actual,
                  })),
                },
                {
                  id: 'predicted',
                  label: 'Illustrative Forecast',
                  color: '#36C982',
                  dashed: true,
                  lineWidth: 2,
                  data: aiPreview.backtestComparison.map((p) => ({
                    time: p.time,
                    value: p.predicted,
                  })),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 5. TECHNICAL ANALYSIS FEATURES */}
      <section className="reveal-section mx-auto max-w-[1380px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#137949] dark:text-[#36C982]">
              Quantitative Indicators
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA] sm:text-3xl">
              Technical Analysis Workbench
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: 'bollinger', label: 'Bollinger Bands' },
                { key: 'sma', label: 'SMA 20 / EMA 12' },
                { key: 'rsi', label: 'RSI (14)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTechOverlay(tab.key)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                  activeTechOverlay === tab.key
                    ? 'bg-[#36C982] text-[#0B120E]'
                    : 'border border-black/10 bg-white text-[#53645A] dark:border-white/8 dark:bg-[#18211C] dark:text-[#91A197]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#53645A] dark:text-[#91A197]">
            <span>RELIANCE (NSE) · 6M Sample Series with Computed Overlays</span>
            <Link
              to="/app/technicals"
              className="font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
            >
              Launch Full Multi-Pane Technicals →
            </Link>
          </div>
          <ChartContainer
            bars={activeTechOverlay === 'rsi' ? [] : techBars}
            mode={activeTechOverlay === 'rsi' ? 'line' : 'area'}
            extraLines={techLines}
            height={300}
          />
        </div>
      </section>

      {/* 6. FINANCIAL INSIGHTS & NEWS */}
      <section className="reveal-section border-t border-black/10 bg-[#eaf0ec]/60 py-16 dark:border-white/8 dark:bg-[#141C17] lg:py-20">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#137949] dark:text-[#36C982]">
                Editorial Market Briefings · Demonstration Articles
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA] sm:text-3xl">
                Financial Insights &amp; News
              </h2>
            </div>
            <Link
              to="/app/news"
              className="text-xs font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
            >
              View All Briefings →
            </Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {featuredNews.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onRead={(art) => setActiveArticle(art)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. ARCHITECTURE & FINAL CTA */}
      <section
        id="about-architecture"
        className="reveal-section mx-auto max-w-[1380px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="rounded-2xl border border-black/10 bg-white p-8 dark:border-white/10 dark:bg-[#18211C] lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#137949] dark:text-[#36C982]">
                <ShieldCheck className="h-4 w-4" />
                <span>Modular Architecture · Backend-Ready Foundation</span>
              </div>
              <h2 className="mt-3 text-balance font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA] sm:text-4xl">
                See the Bull. Predict the Move.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#53645A] dark:text-[#91A197] sm:text-base">
                Engineered with clean service boundaries so Node.js, Express.js, MongoDB/Mongoose,
                JWT + bcrypt authentication, Redis market caching, and Python ML forecasting can
                plug in directly without rewriting a single view.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-lg bg-[#36C982] px-6 py-3 text-sm font-semibold text-[#0B120E] transition-colors hover:bg-[#A5EBC3]"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg border border-black/15 px-6 py-3 text-sm font-semibold text-[#101814] transition-colors hover:border-[#36C982]/60 dark:border-white/15 dark:text-[#E8F0EA]"
              >
                <span>Create Account</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-black/10 bg-[#eaf0ec]/70 py-10 text-xs text-[#53645A] dark:border-white/8 dark:bg-[#141C17] dark:text-[#91A197]">
        <div className="mx-auto flex max-w-[1380px] flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <BullSightLogo to="/" />
            <p className="mt-2 max-w-md leading-relaxed">
              BULLSIGHT Frontend Foundation · All stock quotes, AI scenarios, and news briefings
              displayed are deterministic sample data for interface preview only.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 font-medium">
            <Link to="/app" className="hover:text-[#101814] dark:hover:text-[#E8F0EA]">
              Overview
            </Link>
            <Link to="/app/explore" className="hover:text-[#101814] dark:hover:text-[#E8F0EA]">
              Explore Stocks
            </Link>
            <Link to="/app/predictions" className="hover:text-[#101814] dark:hover:text-[#E8F0EA]">
              AI Predictions
            </Link>
            <Link to="/app/technicals" className="hover:text-[#101814] dark:hover:text-[#E8F0EA]">
              Technicals
            </Link>
            <Link to="/login" className="hover:text-[#101814] dark:hover:text-[#E8F0EA]">
              Login
            </Link>
          </div>
        </div>
      </footer>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-white p-6 dark:bg-[#18211C]">
            <div className="flex items-start justify-between gap-4">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">
                <span>{activeArticle.category}</span>
                <span className="mx-1.5">·</span>
                <span>{activeArticle.source}</span>
                <span className="mx-1.5">·</span>
                <span>{activeArticle.publishedAt}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                aria-label="Close article"
                className="rounded-lg border border-black/10 p-1.5 text-[#53645A] hover:text-[#101814] dark:border-white/10 dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-3 font-display text-xl font-bold text-[#101814] dark:text-[#E8F0EA]">
              {activeArticle.title}
            </h3>
            {activeArticle.imageUrl && (
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                referrerPolicy="no-referrer"
                className="mt-4 aspect-[16/9] w-full rounded-xl object-cover"
              />
            )}
            <p className="mt-4 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
              {activeArticle.content}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4 text-xs dark:border-white/8">
              <span className="text-[#53645A] dark:text-[#91A197]">
                Related symbols: {activeArticle.relatedSymbols.join(', ')}
              </span>
              <Link
                to={`/app/stocks/${activeArticle.relatedSymbols[0] || 'NVDA'}`}
                className="font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
              >
                Inspect {activeArticle.relatedSymbols[0] || 'NVDA'} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
