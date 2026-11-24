import React, { useEffect, useRef } from 'react';
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  IChartApi,
  LineSeries,
  LineStyle,
  Time,
  UTCTimestamp,
  createChart,
} from 'lightweight-charts';
import { useApp } from '../contexts/AppContext';
import { OhlcBar } from '../types/market';

export interface ExtraLineSeries {
  id: string;
  label: string;
  color: string;
  lineWidth?: 1 | 2 | 3 | 4;
  dashed?: boolean;
  data: { time: string; value: number }[];
}

export interface ExtraHistogramSeries {
  data: { time: string; value: number; color?: string }[];
}

interface ChartContainerProps {
  bars?: OhlcBar[];
  mode?: 'candlestick' | 'area' | 'line' | 'volume' | 'oscillator';
  height?: number;
  showVolume?: boolean;
  lineColor?: string;
  extraLines?: ExtraLineSeries[];
  histogramData?: ExtraHistogramSeries['data'];
  referenceLevels?: { value: number; color: string; title?: string }[];
  onCrosshairMove?: (bar: OhlcBar | null) => void;
  className?: string;
}

function toChartTime(t: string): Time {
  if (/^\d+$/.test(t)) {
    return Number(t) as UTCTimestamp;
  }
  return t as Time;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  bars = [],
  mode = 'area',
  height = 340,
  showVolume = false,
  lineColor = '#36C982',
  extraLines = [],
  histogramData,
  referenceLevels = [],
  onCrosshairMove,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      width: el.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: isDark ? '#91A197' : '#53645A',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: {
          visible: settings.showChartGrid,
          color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(16,24,20,0.06)',
        },
        horzLines: {
          visible: settings.showChartGrid,
          color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(16,24,20,0.06)',
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(54, 201, 130, 0.45)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#202B24' : '#137949',
        },
        horzLine: {
          color: 'rgba(54, 201, 130, 0.45)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isDark ? '#202B24' : '#137949',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,20,0.1)',
      },
      timeScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,20,0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    const barMap = new Map<string, OhlcBar>();
    bars.forEach((b) => barMap.set(b.time, b));

    let primarySeries: any = null;

    if (mode === 'candlestick' && bars.length > 0) {
      primarySeries = chart.addSeries(CandlestickSeries, {
        upColor: '#36C982',
        downColor: '#EF6461',
        borderUpColor: '#36C982',
        borderDownColor: '#EF6461',
        wickUpColor: '#36C982',
        wickDownColor: '#EF6461',
      });
      primarySeries.setData(
        bars.map((b) => ({
          time: toChartTime(b.time),
          open: b.open,
          high: b.high,
          low: b.low,
          close: b.close,
        }))
      );
    } else if (mode === 'area' && bars.length > 0) {
      primarySeries = chart.addSeries(AreaSeries, {
        lineColor,
        topColor: 'rgba(54, 201, 130, 0.28)',
        bottomColor: 'rgba(54, 201, 130, 0.0)',
        lineWidth: 2,
      });
      primarySeries.setData(
        bars.map((b) => ({
          time: toChartTime(b.time),
          value: b.close,
        }))
      );
    } else if (mode === 'volume' && bars.length > 0) {
      primarySeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
      });
      primarySeries.setData(
        bars.map((b) => ({
          time: toChartTime(b.time),
          value: b.volume,
          color: b.close >= b.open ? 'rgba(54, 201, 130, 0.65)' : 'rgba(239, 100, 97, 0.65)',
        }))
      );
    } else if (mode === 'line' && bars.length > 0) {
      primarySeries = chart.addSeries(LineSeries, {
        color: lineColor,
        lineWidth: 2,
      });
      primarySeries.setData(
        bars.map((b) => ({
          time: toChartTime(b.time),
          value: b.close,
        }))
      );
    }

    if (showVolume && mode !== 'volume' && bars.length > 0) {
      const volSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });
      volSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.78, bottom: 0 },
      });
      volSeries.setData(
        bars.map((b) => ({
          time: toChartTime(b.time),
          value: b.volume,
          color:
            b.close >= b.open
              ? 'rgba(54, 201, 130, 0.24)'
              : 'rgba(239, 100, 97, 0.24)',
        }))
      );
    }

    if (histogramData && histogramData.length > 0) {
      const histSeries = chart.addSeries(HistogramSeries, {
        color: '#36C982',
      });
      histSeries.setData(
        histogramData.map((d) => ({
          time: toChartTime(d.time),
          value: d.value,
          color: d.color,
        }))
      );
    }

    extraLines.forEach((line) => {
      if (line.data.length === 0) return;
      const lSeries = chart.addSeries(LineSeries, {
        color: line.color,
        lineWidth: line.lineWidth ?? 2,
        lineStyle: line.dashed ? LineStyle.Dashed : LineStyle.Solid,
        title: line.label,
      });
      lSeries.setData(
        line.data.map((d) => ({
          time: toChartTime(d.time),
          value: d.value,
        }))
      );

      if (!primarySeries) primarySeries = lSeries;
    });

    if (primarySeries && referenceLevels.length > 0) {
      referenceLevels.forEach((ref) => {
        primarySeries.createPriceLine({
          price: ref.value,
          color: ref.color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: ref.title || '',
        });
      });
    }

    chart.timeScale().fitContent();

    if (onCrosshairMove && bars.length > 0) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.time) {
          onCrosshairMove(null);
          return;
        }
        const key = String(param.time);
        const found = barMap.get(key) || null;
        onCrosshairMove(found);
      });
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          chart.applyOptions({ width: entry.contentRect.width });
        }
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [
    bars,
    mode,
    height,
    showVolume,
    lineColor,
    extraLines,
    histogramData,
    referenceLevels,
    isDark,
    settings.showChartGrid,
    onCrosshairMove,
  ]);

  return (
    <div
      ref={containerRef}
      data-cursor="chart"
      className={`w-full select-none ${className}`}
      style={{ height: `${height}px` }}
    />
  );
};
