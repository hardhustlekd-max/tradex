import React, { useRef, useEffect, useState } from 'react';
import { Candle, ChartTimeframe, ChartMode, DrawingTool, DrawingItem } from '../types';
import { formatCurrency, calculateSMA, calculateRSI } from '../utils/calc';
import { 
  BarChart2, 
  TrendingUp, 
  Eye, 
  Pencil, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TradingChartProps {
  candles: Candle[];
  symbol: string;
  precision: number;
  timeframe: ChartTimeframe;
  onChangeTimeframe: (tf: ChartTimeframe) => void;
  currentPrice: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  symbol,
  precision,
  timeframe,
  onChangeTimeframe,
  currentPrice,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [chartMode, setChartMode] = useState<ChartMode>('candles');
  const [showMA, setShowMA] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingTool>('none');
  const [drawings, setDrawings] = useState<DrawingItem[]>([]);

  // Hover crosshair state
  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    candle: Candle | null;
    price: number | null;
  } | null>(null);

  // Drawing state
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number; price: number } | null>(null);

  // Zoom & Visible window range
  const [visibleCount, setVisibleCount] = useState<number>(60);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp canvas
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#09090b'; // zinc-950
    ctx.fillRect(0, 0, width, height);

    // Layout dimensions
    const paddingRight = 65; // Price scale margin
    const paddingBottom = showRSI ? 120 : 35; // Time scale margin or sub-chart
    const chartWidth = width - paddingRight;
    const mainChartHeight = showRSI ? height - 120 : height - 35;
    const volumeHeight = mainChartHeight * 0.2;

    // Slice visible candles
    const visibleCandles = candles.slice(-visibleCount);
    const count = visibleCandles.length;
    const candleWidth = chartWidth / count;
    const barWidth = Math.max(1, candleWidth * 0.7);

    // Min & Max Price
    let minPrice = Math.min(...visibleCandles.map((c) => c.low));
    let maxPrice = Math.max(...visibleCandles.map((c) => c.high));

    // Pad price range by 2%
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.02;
    maxPrice += priceRange * 0.02;

    const getY = (price: number) => {
      return mainChartHeight - ((price - minPrice) / (maxPrice - minPrice)) * (mainChartHeight - 20) - 10;
    };

    // 1. Draw Grid Lines
    ctx.strokeStyle = '#18181b'; // zinc-900
    ctx.lineWidth = 1;

    // Horizontal grid
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const priceVal = minPrice + (priceRange * i) / gridSteps;
      const y = getY(priceVal);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price Label
      ctx.fillStyle = '#a1a1aa'; // zinc-400
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceVal.toFixed(precision), chartWidth + 6, y + 3);
    }

    // Vertical grid
    const timeSteps = Math.min(6, count);
    for (let i = 0; i < timeSteps; i++) {
      const index = Math.floor((count / timeSteps) * i);
      const x = index * candleWidth + candleWidth / 2;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - paddingBottom);
      ctx.stroke();

      if (visibleCandles[index]) {
        const dateStr = new Date(visibleCandles[index].time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        ctx.fillStyle = '#71717a';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(dateStr, x, height - paddingBottom + 16);
      }
    }

    // 2. Draw Candlesticks or Line Chart
    if (chartMode === 'candles') {
      visibleCandles.forEach((candle, i) => {
        const x = i * candleWidth + candleWidth / 2;
        const openY = getY(candle.open);
        const closeY = getY(candle.close);
        const highY = getY(candle.high);
        const lowY = getY(candle.low);

        const isBullish = candle.close >= candle.open;
        const color = isBullish ? '#10b981' : '#f43f5e'; // Emerald vs Rose

        // High / Low Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle Body
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(openY - closeY));

        ctx.fillStyle = color;
        ctx.fillRect(x - barWidth / 2, bodyY, barWidth, bodyHeight);

        // Volume Bar
        if (showVolume) {
          const maxVol = Math.max(...visibleCandles.map((c) => c.volume)) || 1;
          const vHeight = (candle.volume / maxVol) * volumeHeight;
          const vY = mainChartHeight - vHeight;

          ctx.fillStyle = isBullish ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';
          ctx.fillRect(x - barWidth / 2, vY, barWidth, vHeight);
        }
      });
    } else if (chartMode === 'line') {
      // Smooth Line Chart
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4'; // Cyan
      ctx.lineWidth = 2;

      visibleCandles.forEach((candle, i) => {
        const x = i * candleWidth + candleWidth / 2;
        const y = getY(candle.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Area gradient
      const lastX = (visibleCandles.length - 1) * candleWidth + candleWidth / 2;
      ctx.lineTo(lastX, mainChartHeight);
      ctx.lineTo(candleWidth / 2, mainChartHeight);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, mainChartHeight);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 3. Draw Moving Averages
    if (showMA && visibleCandles.length >= 20) {
      const ma20 = calculateSMA(visibleCandles, 20);
      const ma50 = calculateSMA(visibleCandles, 50);

      // MA 20 (Cyan)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ma20.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = getY(val);
          if (i === 20 - 1) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // MA 50 (Purple)
      if (visibleCandles.length >= 50) {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ma50.forEach((val, i) => {
          if (val !== null) {
            const x = i * candleWidth + candleWidth / 2;
            const y = getY(val);
            if (i === 50 - 1) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }
    }

    // 4. Current Price Marker Line
    const currentPriceY = getY(currentPrice);
    ctx.strokeStyle = '#10b981';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, currentPriceY);
    ctx.lineTo(chartWidth, currentPriceY);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Current Price Tag
    ctx.fillStyle = '#10b981';
    ctx.fillRect(chartWidth, currentPriceY - 10, paddingRight, 20);
    ctx.fillStyle = '#09090b';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentPrice.toFixed(precision), chartWidth + paddingRight / 2, currentPriceY + 3);

    // 5. Draw User Drawings (Horizontal lines, Trendlines)
    drawings.forEach((draw) => {
      ctx.strokeStyle = draw.color || '#f59e0b';
      ctx.lineWidth = 1.5;

      if (draw.type === 'horizontal' && draw.price !== undefined) {
        const y = getY(draw.price);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = draw.color || '#f59e0b';
        ctx.font = '10px monospace';
        ctx.fillText(`H-Line: ${draw.price.toFixed(precision)}`, 10, y - 4);
      } else if (draw.type === 'trendline' && draw.startX !== undefined && draw.startY !== undefined && draw.endX !== undefined && draw.endY !== undefined) {
        ctx.beginPath();
        ctx.moveTo(draw.startX, getY(draw.startY));
        ctx.lineTo(draw.endX, getY(draw.endY));
        ctx.stroke();
      }
    });

    // 6. Draw RSI Sub-chart if active
    if (showRSI) {
      const rsiTop = mainChartHeight + 15;
      const rsiHeight = height - rsiTop - 25;

      // Divider line
      ctx.strokeStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(0, mainChartHeight);
      ctx.lineTo(width, mainChartHeight);
      ctx.stroke();

      // RSI background grid (70 overbought, 30 oversold)
      const rsi70Y = rsiTop + rsiHeight * 0.3;
      const rsi30Y = rsiTop + rsiHeight * 0.7;

      ctx.fillStyle = 'rgba(244, 63, 94, 0.05)';
      ctx.fillRect(0, rsiTop, chartWidth, rsiHeight * 0.3);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.fillRect(0, rsi30Y, chartWidth, rsiHeight * 0.3);

      ctx.strokeStyle = '#3f3f46';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, rsi70Y);
      ctx.lineTo(chartWidth, rsi70Y);
      ctx.moveTo(0, rsi30Y);
      ctx.lineTo(chartWidth, rsi30Y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px monospace';
      ctx.fillText('70', chartWidth + 6, rsi70Y + 3);
      ctx.fillText('30', chartWidth + 6, rsi30Y + 3);

      // Draw RSI line
      const rsiVals = calculateRSI(visibleCandles, 14);
      ctx.strokeStyle = '#e11d48'; // Rose
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      rsiVals.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = rsiTop + rsiHeight * (1 - val / 100);
          if (i === 14) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // RSI Title
      ctx.fillStyle = '#e11d48';
      ctx.font = 'bold 10px monospace';
      const lastRSI = rsiVals[rsiVals.length - 1];
      ctx.fillText(`RSI (14): ${lastRSI ? lastRSI.toFixed(1) : 'N/A'}`, 10, rsiTop + 12);
    }

    // 7. Hover Crosshair
    if (hoverData && hoverData.x <= chartWidth && hoverData.y <= mainChartHeight) {
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hoverData.x, 0);
      ctx.lineTo(hoverData.x, mainChartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, hoverData.y);
      ctx.lineTo(chartWidth, hoverData.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price tooltip box
      if (hoverData.price !== null) {
        ctx.fillStyle = '#27272a';
        ctx.fillRect(chartWidth, hoverData.y - 10, paddingRight, 20);
        ctx.fillStyle = '#f4f4f5';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(hoverData.price.toFixed(precision), chartWidth + paddingRight / 2, hoverData.y + 3);
      }
    }
  }, [candles, visibleCount, chartMode, showMA, showRSI, showVolume, drawings, hoverData, currentPrice, precision]);

  // Mouse move handler for hover tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const visibleCandles = candles.slice(-visibleCount);
    const chartWidth = rect.width - 65;
    const mainChartHeight = showRSI ? rect.height - 120 : rect.height - 35;

    const candleIndex = Math.floor((x / chartWidth) * visibleCandles.length);
    const candle = visibleCandles[candleIndex] || null;

    let minPrice = Math.min(...visibleCandles.map((c) => c.low));
    let maxPrice = Math.max(...visibleCandles.map((c) => c.high));
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.02;
    maxPrice += priceRange * 0.02;

    const hoveredPrice = maxPrice - (y / (mainChartHeight - 20)) * priceRange;

    setHoverData({ x, y, candle, price: hoveredPrice });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  // Click canvas for drawing placement
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeDrawingTool === 'none' || !hoverData || hoverData.price === null) return;

    if (activeDrawingTool === 'horizontal') {
      soundFx.playClick();
      setDrawings((prev) => [
        ...prev,
        {
          id: `draw-${Date.now()}`,
          type: 'horizontal',
          price: hoverData.price!,
          color: '#f59e0b',
        },
      ]);
      setActiveDrawingTool('none');
    }
  };

  const lastCandle = candles[candles.length - 1];

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 border-r border-zinc-800/80 min-w-0 select-none">
      {/* Chart Toolbar Header */}
      <div className="h-10 px-3 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0">
        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1">
          {(['1m', '5m', '15m', '1h', '4h', '1D'] as ChartTimeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                soundFx.playClick();
                onChangeTimeframe(tf);
              }}
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                timeframe === tf ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart View Modes */}
        <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
          <button
            onClick={() => setChartMode('candles')}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer ${
              chartMode === 'candles' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Candles</span>
          </button>
          <button
            onClick={() => setChartMode('line')}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer ${
              chartMode === 'line' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Line</span>
          </button>
        </div>

        {/* Indicators Toggle */}
        <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
          <button
            onClick={() => setShowMA(!showMA)}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              showMA ? 'bg-sky-950/60 text-sky-400 border border-sky-500/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MA (20/50)
          </button>
          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              showRSI ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            RSI (14)
          </button>
        </div>

        {/* Drawing Tools */}
        <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
          <button
            onClick={() => setActiveDrawingTool(activeDrawingTool === 'horizontal' ? 'none' : 'horizontal')}
            className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 cursor-pointer ${
              activeDrawingTool === 'horizontal' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Add Horizontal Support/Resistance Line"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>H-Line</span>
          </button>
          {drawings.length > 0 && (
            <button
              onClick={() => setDrawings([])}
              className="p-1 rounded text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear Drawings"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
          <button
            onClick={() => setVisibleCount((prev) => Math.min(120, prev + 15))}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setVisibleCount((prev) => Math.max(30, prev - 15))}
            className="p-1 rounded text-zinc-400 hover:text-zinc-100 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* OHLC Overlay Tooltip Bar */}
      <div className="h-7 px-3 bg-zinc-950 flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-zinc-300 font-semibold">{symbol}</span>
          {hoverData?.candle ? (
            <>
              <span>O: <strong className="text-zinc-200">{hoverData.candle.open.toFixed(precision)}</strong></span>
              <span>H: <strong className="text-zinc-200">{hoverData.candle.high.toFixed(precision)}</strong></span>
              <span>L: <strong className="text-zinc-200">{hoverData.candle.low.toFixed(precision)}</strong></span>
              <span>C: <strong className={hoverData.candle.close >= hoverData.candle.open ? 'text-emerald-400' : 'text-rose-400'}>{hoverData.candle.close.toFixed(precision)}</strong></span>
            </>
          ) : lastCandle ? (
            <>
              <span>O: <strong className="text-zinc-200">{lastCandle.open.toFixed(precision)}</strong></span>
              <span>H: <strong className="text-zinc-200">{lastCandle.high.toFixed(precision)}</strong></span>
              <span>L: <strong className="text-zinc-200">{lastCandle.low.toFixed(precision)}</strong></span>
              <span>C: <strong className={lastCandle.close >= lastCandle.open ? 'text-emerald-400' : 'text-rose-400'}>{lastCandle.close.toFixed(precision)}</strong></span>
            </>
          ) : null}
        </div>

        {activeDrawingTool === 'horizontal' && (
          <span className="text-amber-400 animate-pulse">Click anywhere on chart to place Support/Resistance line</span>
        )}
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="flex-1 relative w-full h-full min-h-[300px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
};
