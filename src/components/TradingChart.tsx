import React, { useRef, useEffect, useState } from 'react';
import { Candle, ChartTimeframe } from '../types';
import { formatNumber, calculateEMA, calculateMACD, calculateRSI, calculateBollingerBands } from '../utils/calc';
import { 
  Maximize2,
  Settings,
  ChevronDown,
  Plus,
  Minus,
  Layers,
  LineChart,
  CandlestickChart,
  Move,
  TrendingUp,
  Type,
  Ruler,
  Trash2,
  Activity,
  Sliders,
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

  // Technical Analysis Controls & State
  const [visibleCount, setVisibleCount] = useState<number>(75);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showBoll, setShowBoll] = useState<boolean>(false);
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [activeSubchart, setActiveSubchart] = useState<'MACD' | 'RSI' | 'VOL'>('MACD');
  const [activeTool, setActiveTool] = useState<'crosshair' | 'line' | 'fibo' | 'text' | 'ruler'>('crosshair');

  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [hoverData, setHoverData] = useState<{ x: number; y: number; candle: Candle | null; price: number | null } | null>(null);

  // ResizeObserver for responsive canvas dimensions
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

  // Main Canvas Technical Analysis Rendering Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth || containerDimensions.width || 360;
    const height = container.clientHeight || containerDimensions.height || 520;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 1. Solid Terminal Background
    ctx.fillStyle = '#131722';
    ctx.fillRect(0, 0, width, height);

    // Layout configuration
    const paddingRight = 70; // Price scale
    const paddingBottom = 25; // Time axis
    const chartWidth = width - paddingRight;

    // Proportionate heights
    const availableHeight = height - paddingBottom - 10;
    const mainChartHeight = availableHeight * 0.62;
    const volumeHeight = availableHeight * 0.15;
    const subchartHeight = availableHeight * 0.18;

    const volumeTop = mainChartHeight + 5;
    const subchartTop = volumeTop + volumeHeight + 5;

    // Sliced Visible Candles
    const visibleCandles = candles.slice(-visibleCount);
    const count = visibleCandles.length;
    const candleWidth = chartWidth / count;
    const barWidth = Math.max(1.5, candleWidth * 0.68);

    // Min & Max Prices for Main Chart
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
    minPrice -= priceRange * 0.04;
    maxPrice += priceRange * 0.04;

    const getY = (price: number) => {
      return mainChartHeight - ((price - minPrice) / (maxPrice - minPrice)) * (mainChartHeight - 20) - 10;
    };

    // Technical Indicators
    const ema5 = calculateEMA(candles, 5).slice(-visibleCount);
    const ema10 = calculateEMA(candles, 10).slice(-visibleCount);
    const ema20 = calculateEMA(candles, 20).slice(-visibleCount);

    const boll = calculateBollingerBands(candles, 20, 2);
    const bollUpper = boll.upper.slice(-visibleCount);
    const bollMiddle = boll.middle.slice(-visibleCount);
    const bollLower = boll.lower.slice(-visibleCount);

    const macdData = calculateMACD(candles);
    const macdLine = macdData.macdLine.slice(-visibleCount);
    const signalLine = macdData.signalLine.slice(-visibleCount);
    const histogram = macdData.histogram.slice(-visibleCount);

    const rsiValues = calculateRSI(candles, 14).slice(-visibleCount);

    // 2. Draw Faint Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 0.8;

    // Horizontal Price Grid
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const priceVal = minPrice + (priceRange * i) / gridSteps;
      const y = getY(priceVal);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right Axis Price Labels
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceVal.toFixed(precision), chartWidth + 8, y + 3);
    }

    // Vertical Time Grid
    const timeSteps = 5;
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
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(dateStr, x, height - 4);
      }
    }

    // 3. Draw Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.font = '900 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRADEX TERMINAL', chartWidth / 2, mainChartHeight / 2 + 15);

    // 4. Draw Bollinger Bands Overlay (if enabled)
    if (showBoll) {
      // Area shading
      ctx.beginPath();
      let started = false;
      bollUpper.forEach((val, i) => {
        if (val !== null && bollLower[i] !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const yUpper = getY(val);
          if (!started) {
            ctx.moveTo(x, yUpper);
            started = true;
          } else {
            ctx.lineTo(x, yUpper);
          }
        }
      });

      for (let i = bollLower.length - 1; i >= 0; i--) {
        const val = bollLower[i];
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const yLower = getY(val);
          ctx.lineTo(x, yLower);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.fill();

      // Lines: Upper, Middle, Lower
      const drawBollLine = (data: (number | null)[], color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        let st = false;
        data.forEach((val, i) => {
          if (val !== null) {
            const x = i * candleWidth + candleWidth / 2;
            const y = getY(val);
            if (!st) {
              ctx.moveTo(x, y);
              st = true;
            } else ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      };

      drawBollLine(bollUpper, 'rgba(59, 130, 246, 0.7)');
      drawBollLine(bollMiddle, 'rgba(245, 158, 11, 0.7)');
      drawBollLine(bollLower, 'rgba(59, 130, 246, 0.7)');
    }

    // 5. Draw Candlesticks or Area Line Chart
    if (chartType === 'candle') {
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
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(openY - closeY));

        ctx.fillStyle = color;
        ctx.fillRect(x - barWidth / 2, bodyY, barWidth, bodyHeight);
      });
    } else {
      // Smooth Area Line Chart
      ctx.beginPath();
      visibleCandles.forEach((candle, i) => {
        const x = i * candleWidth + candleWidth / 2;
        const y = getY(candle.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gradient Fill
      ctx.lineTo((visibleCandles.length - 1) * candleWidth + candleWidth / 2, mainChartHeight);
      ctx.lineTo(candleWidth / 2, mainChartHeight);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, mainChartHeight);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // 6. Draw Volume Sub-chart
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(0, volumeTop);
    ctx.lineTo(chartWidth, volumeTop);
    ctx.stroke();

    const maxVol = Math.max(...visibleCandles.map((c) => c.volume)) || 1;
    visibleCandles.forEach((candle, i) => {
      const x = i * candleWidth + candleWidth / 2;
      const vHeight = (candle.volume / maxVol) * (volumeHeight - 5);
      const vY = volumeTop + volumeHeight - vHeight;

      const isBullish = candle.close >= candle.open;
      ctx.fillStyle = isBullish ? 'rgba(0, 192, 118, 0.45)' : 'rgba(246, 70, 93, 0.45)';
      ctx.fillRect(x - barWidth / 2, vY, barWidth, vHeight);
    });

    // 7. Draw EMA Overlay Lines (if enabled)
    if (showEMA) {
      const drawEMALine = (data: (number | null)[], strokeColor: string) => {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.3;
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
    }

    // 8. Peak High & Low Pointer Labels
    if (visibleCandles[maxIdx]) {
      const highCandle = visibleCandles[maxIdx];
      const x = maxIdx * candleWidth + candleWidth / 2;
      const y = getY(highCandle.high);

      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = x > chartWidth / 2 ? 'right' : 'left';
      const textX = x > chartWidth / 2 ? x - 8 : x + 8;
      ctx.fillText(`▲ H: ${highCandle.high.toFixed(precision)}`, textX, y - 2);
    }

    if (visibleCandles[minIdx]) {
      const lowCandle = visibleCandles[minIdx];
      const x = minIdx * candleWidth + candleWidth / 2;
      const y = getY(lowCandle.low);

      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = x > chartWidth / 2 ? 'right' : 'left';
      const textX = x > chartWidth / 2 ? x - 8 : x + 8;
      ctx.fillText(`▼ L: ${lowCandle.low.toFixed(precision)}`, textX, y + 10);
    }

    // 9. Dotted Line for Current Live Price
    const currentY = getY(currentPrice);
    ctx.strokeStyle = '#fcd535';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(chartWidth, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Price Pill Tag
    ctx.fillStyle = '#fcd535';
    const pillHeight = 22;
    const pillWidth = paddingRight - 4;
    ctx.fillRect(chartWidth + 2, currentY - pillHeight / 2, pillWidth, pillHeight);

    ctx.fillStyle = '#000000';
    ctx.font = 'black 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentPrice.toFixed(precision)}`, chartWidth + 2 + pillWidth / 2, currentY + 4);

    // 10. Subchart Section (MACD / RSI)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(0, subchartTop);
    ctx.lineTo(chartWidth, subchartTop);
    ctx.stroke();

    if (activeSubchart === 'MACD') {
      // MACD Histogram
      const maxMacd = Math.max(...histogram.map((v) => Math.abs(v || 0))) || 1;
      histogram.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const h = (val / maxMacd) * (subchartHeight / 2 - 4);
          const y = subchartTop + subchartHeight / 2 - h;

          ctx.fillStyle = val >= 0 ? 'rgba(0, 192, 118, 0.65)' : 'rgba(246, 70, 93, 0.65)';
          ctx.fillRect(x - barWidth / 2, Math.min(subchartTop + subchartHeight / 2, y), barWidth, Math.abs(h));
        }
      });

      // MACD Line
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let mStarted = false;
      macdLine.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = subchartTop + subchartHeight / 2 - (val / maxMacd) * (subchartHeight / 2 - 4);
          if (!mStarted) {
            ctx.moveTo(x, y);
            mStarted = true;
          } else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Signal Line
      ctx.strokeStyle = '#facc15';
      ctx.beginPath();
      let sStarted = false;
      signalLine.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = subchartTop + subchartHeight / 2 - (val / maxMacd) * (subchartHeight / 2 - 4);
          if (!sStarted) {
            ctx.moveTo(x, y);
            sStarted = true;
          } else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    } else if (activeSubchart === 'RSI') {
      // RSI Lines & Reference Levels (70 overbought, 30 oversold)
      const rsiTop = subchartTop;
      const rsiBottom = subchartTop + subchartHeight;

      // 70 Line
      const y70 = rsiBottom - (70 / 100) * subchartHeight;
      const y30 = rsiBottom - (30 / 100) * subchartHeight;

      ctx.strokeStyle = 'rgba(246, 70, 93, 0.4)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, y70);
      ctx.lineTo(chartWidth, y70);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 192, 118, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, y30);
      ctx.lineTo(chartWidth, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI Curve
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let rStarted = false;
      rsiValues.forEach((val, i) => {
        if (val !== null) {
          const x = i * candleWidth + candleWidth / 2;
          const y = rsiBottom - (val / 100) * subchartHeight;
          if (!rStarted) {
            ctx.moveTo(x, y);
            rStarted = true;
          } else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // 11. Crosshair Hover Cursor & Tooltip
    if (hoverData && hoverData.x <= chartWidth && hoverData.y <= availableHeight) {
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 2]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hoverData.x, 0);
      ctx.lineTo(hoverData.x, availableHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, hoverData.y);
      ctx.lineTo(chartWidth, hoverData.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [
    candles,
    visibleCount,
    containerDimensions,
    currentPrice,
    precision,
    showEMA,
    showBoll,
    chartType,
    activeSubchart,
    hoverData,
  ]);

  const handlePointerMove = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

  // Determine active candle for OHLC Header
  const activeCandle = (hoverData && hoverData.candle) 
    ? hoverData.candle 
    : candles[candles.length - 1] || { open: 0, high: 0, low: 0, close: 0, volume: 0, time: 0 };

  const activeChangePct = activeCandle.open ? ((activeCandle.close - activeCandle.open) / activeCandle.open) * 100 : 0;
  const isCandleBullish = activeCandle.close >= activeCandle.open;

  const ema5Val = calculateEMA(candles, 5).pop() || currentPrice;
  const ema10Val = calculateEMA(candles, 10).pop() || currentPrice;
  const ema20Val = calculateEMA(candles, 20).pop() || currentPrice;

  return (
    <div className="flex-1 flex flex-col bg-[#131722] min-w-0 select-none relative h-full min-h-[540px] sm:min-h-[600px] lg:min-h-[660px] w-full border-r border-white/10">
      
      {/* 1. Timeframe & Analysis Top Toolbar */}
      <div className="h-10 px-3 bg-[#131722] border-b border-white/10 flex items-center justify-between gap-2 text-xs font-sans text-zinc-300 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Timeframe Presets */}
          {(['Live', '15m', '1h', '4h', '1D'] as ChartTimeframe[]).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => {
                  soundFx.playClick();
                  onChangeTimeframe(tf);
                }}
                className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                  isActive ? 'bg-[#1c2230] text-amber-400 font-extrabold border border-amber-400/30' : 'text-zinc-400 hover:text-zinc-200 font-medium'
                }`}
              >
                {tf}
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

          {/* Indicator Toggles */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowEMA(!showEMA);
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all border ${
              showEMA ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-white/5 text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            EMA
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowBoll(!showBoll);
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all border ${
              showBoll ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-white/5 text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            BOLL
          </button>

          {/* Chart Type Toggle */}
          <button
            onClick={() => {
              soundFx.playClick();
              setChartType(chartType === 'candle' ? 'line' : 'candle');
            }}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
            title="Toggle Chart Style"
          >
            {chartType === 'candle' ? <CandlestickChart className="w-4 h-4 text-amber-400" /> : <LineChart className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        {/* Right Tools: Zoom Controls + Subchart Toggle */}
        <div className="flex items-center gap-2 text-zinc-400 shrink-0">
          <div className="flex items-center bg-[#1c2230] rounded border border-white/10 p-0.5">
            <button
              onClick={() => setVisibleCount(Math.max(30, visibleCount - 15))}
              className="p-1 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] px-1 font-mono text-zinc-300">{visibleCount}</span>
            <button
              onClick={() => setVisibleCount(Math.min(120, visibleCount + 15))}
              className="p-1 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button className="hover:text-white cursor-pointer p-1" title="Terminal Settings">
            <Settings className="w-4 h-4 text-zinc-300" />
          </button>
        </div>
      </div>

      {/* 2. Full OHLC Price Status Header Banner */}
      <div className="px-3 py-1.5 bg-[#131722] border-b border-white/5 flex items-center justify-between gap-4 text-[11px] font-mono shrink-0 overflow-x-auto">
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-bold text-white font-sans">{symbol}</span>
          <span>O: <span className={isCandleBullish ? 'text-[#00c076]' : 'text-[#f6465d]'}>{formatNumber(activeCandle.open, precision)}</span></span>
          <span>H: <span className="text-white">{formatNumber(activeCandle.high, precision)}</span></span>
          <span>L: <span className="text-white">{formatNumber(activeCandle.low, precision)}</span></span>
          <span>C: <span className={isCandleBullish ? 'text-[#00c076]' : 'text-[#f6465d]'}>{formatNumber(activeCandle.close, precision)}</span></span>
          <span className={`font-bold ${isCandleBullish ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
            {activeChangePct >= 0 ? '+' : ''}{activeChangePct.toFixed(2)}%
          </span>
        </div>

        {/* EMA Indicator Legend Values */}
        {showEMA && (
          <div className="hidden md:flex items-center gap-3 text-[10px] shrink-0">
            <span className="text-[#f59e0b]">EMA(5): {formatNumber(ema5Val, 1)}</span>
            <span className="text-[#facc15]">EMA(10): {formatNumber(ema10Val, 1)}</span>
            <span className="text-[#d946ef]">EMA(20): {formatNumber(ema20Val, 1)}</span>
          </div>
        )}
      </div>

      {/* 3. Main Workspace: Left Drawing Tools Rail + Canvas */}
      <div className="flex-1 flex min-h-0 relative w-full bg-[#131722]">
        
        {/* Left Vertical Drawing Toolbar */}
        <div className="w-9 bg-[#131722] border-r border-white/10 flex flex-col items-center py-2 gap-3 text-zinc-400 shrink-0">
          <button
            onClick={() => setActiveTool('crosshair')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              activeTool === 'crosshair' ? 'bg-amber-400/20 text-amber-400' : 'hover:text-white'
            }`}
            title="Crosshair Tool"
          >
            <Move className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('line')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              activeTool === 'line' ? 'bg-amber-400/20 text-amber-400' : 'hover:text-white'
            }`}
            title="Trend Line"
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('fibo')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              activeTool === 'fibo' ? 'bg-amber-400/20 text-amber-400' : 'hover:text-white'
            }`}
            title="Fibonacci Retracement"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('text')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              activeTool === 'text' ? 'bg-amber-400/20 text-amber-400' : 'hover:text-white'
            }`}
            title="Text Note"
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('ruler')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              activeTool === 'ruler' ? 'bg-amber-400/20 text-amber-400' : 'hover:text-white'
            }`}
            title="Measure Ruler"
          >
            <Ruler className="w-4 h-4" />
          </button>

          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={() => setActiveTool('crosshair')}
              className="p-1.5 rounded hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear Tools"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Interactive Canvas Area */}
        <div ref={containerRef} className="flex-1 relative w-full h-full min-h-[360px] sm:min-h-[420px]">
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverData(null)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setHoverData(null)}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          />
        </div>
      </div>

      {/* 4. Sub-chart Controls Bar (MACD / RSI / VOL Toggles) */}
      <div className="px-3 py-1.5 bg-[#131722] flex items-center justify-between gap-3 text-[11px] font-mono text-zinc-400 shrink-0 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-sans font-medium text-xs">Subchart:</span>
          {(['MACD', 'RSI', 'VOL'] as const).map((sc) => (
            <button
              key={sc}
              onClick={() => {
                soundFx.playClick();
                setActiveSubchart(sc);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                activeSubchart === sc ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-white/5 hover:text-white'
              }`}
            >
              {sc}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          {activeSubchart === 'MACD' && (
            <>
              <span className="text-amber-400">MACD(12,26,9)</span>
              <span className="text-yellow-400">Signal</span>
            </>
          )}
          {activeSubchart === 'RSI' && (
            <span className="text-[#c084fc]">RSI(14): {rsiValues.slice(-1)[0]?.toFixed(1) || '50.0'}</span>
          )}
          {activeSubchart === 'VOL' && (
            <span className="text-emerald-400">Vol: {activeCandle.volume.toFixed(2)}</span>
          )}
        </div>
      </div>

      {/* 5. Terminal Quick Trade Execution Bar */}
      <div className="px-3 py-2 bg-[#131722] border-t border-white/10 shrink-0 flex items-center justify-center gap-3">
        <button
          onClick={() => {
            soundFx.playClick();
            if (onOpenLong) onOpenLong();
          }}
          className="flex-1 py-2.5 rounded-xl bg-[#00c076] hover:bg-[#00d080] active:scale-[0.98] text-white font-extrabold text-xs font-sans text-center transition-all cursor-pointer shadow-md shadow-[#00c076]/20 flex items-center justify-center gap-1.5"
        >
          <span>Open Long</span>
          <span className="text-[10px] opacity-80 font-mono">Buy</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            if (onOpenShort) onOpenShort();
          }}
          className="flex-1 py-2.5 rounded-xl bg-[#f6465d] hover:bg-[#f8556c] active:scale-[0.98] text-white font-extrabold text-xs font-sans text-center transition-all cursor-pointer shadow-md shadow-[#f6465d]/20 flex items-center justify-center gap-1.5"
        >
          <span>Open Short</span>
          <span className="text-[10px] opacity-80 font-mono">Sell</span>
        </button>
      </div>

    </div>
  );
};
