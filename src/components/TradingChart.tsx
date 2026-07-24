import React, { useRef, useEffect, useState } from 'react';
import { Candle, ChartTimeframe } from '../types';
import { formatNumber, calculateEMA, calculateMACD } from '../utils/calc';
import { 
  Maximize2,
  Settings,
  ChevronDown,
  Plus
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TradingChartProps {
  candles: Candle[];
  symbol: string;
  precision: number;
  timeframe: ChartTimeframe;
  onChangeTimeframe: (tf: ChartTimeframe) => void;
  currentPrice: number;
  onOpenLong?: () => void;
  onOpenShort?: () => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  symbol,
  precision,
  timeframe,
  onChangeTimeframe,
  currentPrice,
  onOpenLong,
  onOpenShort,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [visibleCount] = useState<number>(65);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [hoverData, setHoverData] = useState<{ x: number; y: number; candle: Candle | null; price: number | null } | null>(null);

  // ResizeObserver for responsive canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Main Canvas Rendering Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth || containerDimensions.width || 360;
    const height = container.clientHeight || containerDimensions.height || 420;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 1. Solid Dark Slate Background
    ctx.fillStyle = '#131722';
    ctx.fillRect(0, 0, width, height);

    // Layout configuration
    const paddingRight = 70; // Price scale
    const paddingBottom = 75; // Time scale + MACD/Volume subcharts
    const chartWidth = width - paddingRight;
    const mainChartHeight = height - paddingBottom - 40;
    const volumeHeight = 35;
    const macdHeight = 35;

    // Sliced Visible Candles
    const visibleCandles = candles.slice(-visibleCount);
    const count = visibleCandles.length;
    const candleWidth = chartWidth / count;
    const barWidth = Math.max(1.5, candleWidth * 0.65);

    // Min & Max Prices
    let minPrice = Math.min(...visibleCandles.map((c) => c.low));
    let maxPrice = Math.max(...visibleCandles.map((c) => c.high));

    // Calculate High & Low indices
    let maxIdx = 0;
    let minIdx = 0;
    visibleCandles.forEach((c, idx) => {
      if (c.high > visibleCandles[maxIdx].high) maxIdx = idx;
      if (c.low < visibleCandles[minIdx].low) minIdx = idx;
    });

    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.03;
    maxPrice += priceRange * 0.03;

    const getY = (price: number) => {
      return mainChartHeight - ((price - minPrice) / (maxPrice - minPrice)) * (mainChartHeight - 20) - 10;
    };

    // Calculate Indicators
    const ema5 = calculateEMA(candles, 5).slice(-visibleCount);
    const ema10 = calculateEMA(candles, 10).slice(-visibleCount);
    const ema20 = calculateEMA(candles, 20).slice(-visibleCount);
    const macdData = calculateMACD(candles);
    const macdLine = macdData.macdLine.slice(-visibleCount);
    const signalLine = macdData.signalLine.slice(-visibleCount);
    const histogram = macdData.histogram.slice(-visibleCount);

    // 2. Draw Faint Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 0.8;

    // Horizontal grid
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const priceVal = minPrice + (priceRange * i) / gridSteps;
      const y = getY(priceVal);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right Axis Price Labels
      ctx.fillStyle = '#8e8e93';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(priceVal.toFixed(precision), chartWidth + 8, y + 3);
    }

    // Vertical grid
    const timeSteps = 4;
    for (let i = 0; i < timeSteps; i++) {
      const index = Math.floor((count / timeSteps) * i);
      const x = index * candleWidth + candleWidth / 2;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 15);
      ctx.stroke();

      if (visibleCandles[index]) {
        const dateObj = new Date(visibleCandles[index].time);
        const dateStr = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')} ${dateObj.getHours().toString().padStart(2, '0')}:00`;
        ctx.fillStyle = '#636366';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dateStr, x, mainChartHeight + volumeHeight + macdHeight + 16);
      }
    }

    // 3. Draw Watermark Emblem in Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WEX', chartWidth / 2, mainChartHeight / 2 + 15);

    // 4. Draw Candlesticks
    visibleCandles.forEach((candle, i) => {
      const x = i * candleWidth + candleWidth / 2;
      const openY = getY(candle.open);
      const closeY = getY(candle.close);
      const highY = getY(candle.high);
      const lowY = getY(candle.low);

      const isBullish = candle.close >= candle.open;
      const color = isBullish ? '#00c076' : '#f6465d';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      const bodyY = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(openY - closeY));

      ctx.fillStyle = color;
      ctx.fillRect(x - barWidth / 2, bodyY, barWidth, bodyHeight);

      // Volume Bar (at bottom of main chart area)
      const maxVol = Math.max(...visibleCandles.map((c) => c.volume)) || 1;
      const vHeight = (candle.volume / maxVol) * volumeHeight;
      const vY = mainChartHeight + volumeHeight - vHeight;

      ctx.fillStyle = isBullish ? 'rgba(0, 192, 118, 0.4)' : 'rgba(246, 70, 93, 0.4)';
      ctx.fillRect(x - barWidth / 2, vY, barWidth, vHeight);
    });

    // 5. Draw EMA Overlay Lines
    const drawEMALine = (data: (number | null)[], strokeColor: string) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let started = false;

      data.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    };

    drawEMALine(ema5, '#f59e0b'); // EMA 5 Amber
    drawEMALine(ema10, '#facc15'); // EMA 10 Yellow
    drawEMALine(ema20, '#d946ef'); // EMA 20 Magenta

    // 6. Peak High & Low Pointer Labels
    if (visibleCandles[maxIdx]) {
      const highCandle = visibleCandles[maxIdx];
      const x = maxIdx * candleWidth + candleWidth / 2;
      const y = getY(highCandle.high);

      ctx.fillStyle = '#d1d5db';
      ctx.font = '10px sans-serif';
      ctx.textAlign = x > chartWidth / 2 ? 'right' : 'left';
      const textX = x > chartWidth / 2 ? x - 8 : x + 8;
      ctx.fillText(`— ${highCandle.high.toFixed(precision)}`, textX, y);
    }

    if (visibleCandles[minIdx]) {
      const lowCandle = visibleCandles[minIdx];
      const x = minIdx * candleWidth + candleWidth / 2;
      const y = getY(lowCandle.low);

      ctx.fillStyle = '#d1d5db';
      ctx.font = '10px sans-serif';
      ctx.textAlign = x > chartWidth / 2 ? 'right' : 'left';
      const textX = x > chartWidth / 2 ? x - 8 : x + 8;
      ctx.fillText(`— ${lowCandle.low.toFixed(precision)}`, textX, y + 8);
    }

    // 7. Dotted Horizontal Line for Current Price
    const currentY = getY(currentPrice);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Current Price Pill Tag on Right Y-Axis (Exact match: `+ 65,545.5`)
    ctx.fillStyle = '#ffffff';
    const pillHeight = 22;
    const pillWidth = paddingRight - 4;
    ctx.fillRect(chartWidth + 2, currentY - pillHeight / 2, pillWidth, pillHeight);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+ ${currentPrice.toFixed(precision)}`, chartWidth + 2 + pillWidth / 2, currentY + 4);

    // 8. Draw MACD Sub-chart (bottom area)
    const macdTop = mainChartHeight + volumeHeight + 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(0, macdTop);
    ctx.lineTo(chartWidth, macdTop);
    ctx.stroke();

    // MACD Histogram
    const maxMacd = Math.max(...histogram.map((v) => Math.abs(v || 0))) || 1;
    histogram.forEach((val, i) => {
      if (val !== null) {
        const x = i * candleWidth + candleWidth / 2;
        const h = (val / maxMacd) * (macdHeight / 2);
        const y = macdTop + macdHeight / 2 - h;

        ctx.fillStyle = val >= 0 ? 'rgba(0, 192, 118, 0.6)' : 'rgba(246, 70, 93, 0.6)';
        ctx.fillRect(x - barWidth / 2, Math.min(macdTop + macdHeight / 2, y), barWidth, Math.abs(h));
      }
    });

    // MACD & Signal Line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    let macdStarted = false;
    macdLine.forEach((val, i) => {
      if (val !== null) {
        const x = i * candleWidth + candleWidth / 2;
        const y = macdTop + macdHeight / 2 - (val / maxMacd) * (macdHeight / 2);
        if (!macdStarted) {
          ctx.moveTo(x, y);
          macdStarted = true;
        } else ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    ctx.strokeStyle = '#eab308';
    ctx.beginPath();
    let sigStarted = false;
    signalLine.forEach((val, i) => {
      if (val !== null) {
        const x = i * candleWidth + candleWidth / 2;
        const y = macdTop + macdHeight / 2 - (val / maxMacd) * (macdHeight / 2);
        if (!sigStarted) {
          ctx.moveTo(x, y);
          sigStarted = true;
        } else ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 9. Hover Crosshair Tooltip
    if (hoverData && hoverData.x <= chartWidth && hoverData.y <= mainChartHeight) {
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(hoverData.x, 0);
      ctx.lineTo(hoverData.x, mainChartHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, hoverData.y);
      ctx.lineTo(chartWidth, hoverData.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candles, visibleCount, currentPrice, precision, containerDimensions, hoverData]);

  const handlePointerMove = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const visibleCandles = candles.slice(-visibleCount);
    const chartWidth = rect.width - 70;
    const candleIndex = Math.floor((x / chartWidth) * visibleCandles.length);
    const candle = visibleCandles[candleIndex] || null;

    setHoverData({ x, y, candle, price: currentPrice });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const lastCandle = candles[candles.length - 1] || { open: 0, high: 0, low: 0, close: 0 };
  const ema5Val = calculateEMA(candles, 5).pop() || currentPrice;
  const ema10Val = calculateEMA(candles, 10).pop() || currentPrice;
  const ema20Val = calculateEMA(candles, 20).pop() || currentPrice;

  return (
    <div className="flex-1 flex flex-col bg-[#131722] min-w-0 select-none relative h-[420px] lg:h-auto lg:flex-1 shrink-0">
      {/* 1. Timeframe Navigation Toolbar */}
      <div className="h-9 px-3 bg-[#131722] border-b border-white/10 flex items-center justify-between gap-1 text-xs font-sans text-zinc-300 shrink-0">
        <div className="flex items-center gap-4">
          {(['Live', '15m', '1h', '4h', '1D'] as ChartTimeframe[]).map((tf) => {
            const isActive = timeframe === tf || (tf === '1h' && timeframe === '1h');
            return (
              <button
                key={tf}
                onClick={() => {
                  soundFx.playClick();
                  onChangeTimeframe(tf);
                }}
                className={`py-1 text-xs cursor-pointer transition-colors ${
                  isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tf}
              </button>
            );
          })}

          <button className="flex items-center gap-0.5 text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer">
            <span>More</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Right Toolbar Icons: Fullscreen + Settings */}
        <div className="flex items-center gap-3 text-zinc-400">
          <button className="hover:text-white cursor-pointer" title="Expand View">
            <Maximize2 className="w-3.5 h-3.5 text-zinc-300" />
          </button>
          <button className="hover:text-white cursor-pointer" title="Chart Settings">
            <Settings className="w-3.5 h-3.5 text-zinc-300" />
          </button>
        </div>
      </div>

      {/* 2. Indicator Legend Header Row (EMA 5, EMA 10, EMA 20) */}
      <div className="px-3 py-1 bg-[#131722] flex items-center gap-3 text-[11px] font-mono shrink-0 border-b border-white/5">
        <span className="text-[#f59e0b]">EMA5:{formatNumber(ema5Val, 1)}</span>
        <span className="text-[#facc15]">EMA10:{formatNumber(ema10Val, 1)}</span>
        <span className="text-[#d946ef]">EMA20:{formatNumber(ema20Val, 1)}</span>
      </div>

      {/* 3. Main Chart Canvas */}
      <div ref={containerRef} className="flex-1 relative w-full h-full min-h-[220px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverData(null)}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setHoverData(null)}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />
      </div>

      {/* 4. Sub-chart Indicators Text (VOL & MACD) */}
      <div className="px-3 py-1 bg-[#131722] flex items-center gap-3 text-[10px] font-mono text-zinc-400 shrink-0 border-t border-white/10">
        <span>VOL:3.7056K</span>
        <span className="text-[#f59e0b]">MACD(12,26,9)</span>
        <span className="text-[#38bdf8]">DIF:-110.4</span>
        <span className="text-[#facc15]">DEA:-92.4</span>
      </div>

      {/* 5. Floating Action Buttons (Open long / Open short) */}
      <div className="px-3 py-2 bg-[#131722] border-t border-white/10 shrink-0 flex items-center justify-center gap-2">
        <button
          onClick={() => {
            soundFx.playClick();
            if (onOpenLong) onOpenLong();
          }}
          className="flex-1 py-2 rounded-xl bg-[#00c076] hover:bg-[#00d080] active:scale-[0.98] text-white font-bold text-xs font-sans text-center transition-all cursor-pointer shadow-sm"
        >
          Open long
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            if (onOpenShort) onOpenShort();
          }}
          className="flex-1 py-2 rounded-xl bg-[#f6465d] hover:bg-[#f8556c] active:scale-[0.98] text-white font-bold text-xs font-sans text-center transition-all cursor-pointer shadow-sm"
        >
          Open short
        </button>
      </div>
    </div>
  );
};

