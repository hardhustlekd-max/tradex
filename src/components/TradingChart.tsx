import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Candle, ChartTimeframe, Position } from '../types';
import { formatNumber, calculateEMA, calculateMACD, calculateRSI, calculateBollingerBands } from '../utils/calc';
import { 
  Maximize2,
  Minimize2,
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
  Sparkles,
  Star,
  Clock,
  X,
  Loader2
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TradingChartProps {
  candles: Candle[];
  symbol: string;
  precision: number;
  timeframe: ChartTimeframe;
  onChangeTimeframe: (tf: ChartTimeframe) => void;
  currentPrice: number;
  positions?: Position[];
  isLoading?: boolean;
  onOpenLong?: () => void;
  onOpenShort?: () => void;
  onOpenPairModal?: () => void;
}

interface DrawingPoint {
  x: number;
  y: number;
  price: number;
  timeIndex: number;
}

interface Drawing {
  id: string;
  type: 'line' | 'fibo' | 'text' | 'ruler';
  points: DrawingPoint[];
  text?: string;
}

const ALL_TIMEFRAMES: ChartTimeframe[] = ['1m', '3m', '5m', '15m', '1h', '4h', '1d', '2d', '3d', '1w', '2w', '1Month', '2Month', '3Month', '1y'];

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  symbol,
  precision,
  timeframe,
  onChangeTimeframe,
  currentPrice,
  positions = [],
  isLoading = false,
  onOpenLong,
  onOpenShort,
  onOpenPairModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Technical Analysis Controls & State
  const [visibleCount, setVisibleCount] = useState<number>(75);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [verticalPanOffset, setVerticalPanOffset] = useState<number>(0);
  const [priceScaleRatio, setPriceScaleRatio] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [showEMA, setShowEMA] = useState<boolean>(false);
  const [showBoll, setShowBoll] = useState<boolean>(false);
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [activeSubchart, setActiveSubchart] = useState<'MACD' | 'RSI' | 'VOL'>('MACD');
  const [activeTool, setActiveTool] = useState<'crosshair' | 'line' | 'fibo' | 'text' | 'ruler'>('crosshair');

  // Chart Display Settings State
  const [showPositions, setShowPositions] = useState<boolean>(true);
  const [showLiquidation, setShowLiquidation] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showHighLow, setShowHighLow] = useState<boolean>(true);
  const [showLivePrice, setShowLivePrice] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  // Fullscreen Horizontal Mode State
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const toggleFullScreen = () => {
    soundFx.playClick();
    if (!containerRef.current) return;

    const orientation = window.screen && window.screen.orientation ? (window.screen.orientation as any) : null;

    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().then(() => {
          setIsFullScreen(true);
          if (orientation && orientation.lock) {
            orientation.lock('landscape').catch(() => {});
          }
        }).catch(() => {
          setIsFullScreen(!isFullScreen);
        });
      } else {
        setIsFullScreen(!isFullScreen);
        if (orientation && orientation.lock) {
          orientation.lock('landscape').catch(() => {});
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
          if (orientation && orientation.unlock) {
            orientation.unlock();
          }
        }).catch(() => {
          setIsFullScreen(false);
        });
      } else {
        setIsFullScreen(false);
        if (orientation && orientation.unlock) {
          orientation.unlock();
        }
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('touchstart', handleClickOutside, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isSettingsOpen]);

  // Drawing Tools State
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [drawingStart, setDrawingStart] = useState<DrawingPoint | null>(null);

  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [hoverData, setHoverData] = useState<{ x: number; y: number; candle: Candle | null; price: number | null } | null>(null);

  // Momentum Drag & Slide Refs
  const dragHistoryRef = useRef<{ x: number; time: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Timeframe Favorites State
  const [favTimeframes, setFavTimeframes] = useState<ChartTimeframe[]>(() => {
    const saved = localStorage.getItem('tradex_fav_timeframes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing fav timeframes:', e);
      }
    }
    return ['15m', '1h', '4h', '1d'];
  });

  const [isTfDropdownOpen, setIsTfDropdownOpen] = useState(false);
  const tfDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (tfDropdownRef.current && !tfDropdownRef.current.contains(event.target as Node)) {
        setIsTfDropdownOpen(false);
      }
    };
    if (isTfDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('touchstart', handleClickOutside, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isTfDropdownOpen]);

  useEffect(() => {
    localStorage.setItem('tradex_fav_timeframes', JSON.stringify(favTimeframes));
  }, [favTimeframes]);

  const activeTimeframeTabs = useMemo(() => {
    const list = ALL_TIMEFRAMES.filter(tf => favTimeframes.includes(tf));
    if (!list.includes(timeframe)) {
      list.push(timeframe);
    }
    return list;
  }, [favTimeframes, timeframe]);

  const lastRsi = useMemo(() => {
    const rsiArray = calculateRSI(candles, 14);
    const val = rsiArray[rsiArray.length - 1];
    return val !== null && val !== undefined ? val.toFixed(1) : '50.0';
  }, [candles]);

  // Synchronized state refs for native non-passive touch event handlers
  const candlesRef = useRef(candles);
  candlesRef.current = candles;

  const visibleCountRef = useRef(visibleCount);
  visibleCountRef.current = visibleCount;

  const scrollOffsetRef = useRef(scrollOffset);
  scrollOffsetRef.current = scrollOffset;

  const verticalPanOffsetRef = useRef(verticalPanOffset);
  verticalPanOffsetRef.current = verticalPanOffset;

  const priceScaleRatioRef = useRef(priceScaleRatio);
  priceScaleRatioRef.current = priceScaleRatio;

  const dragStateRef = useRef<{
    active: boolean;
    mode: 'pan' | 'scalePrice' | 'scaleTime';
    startX: number;
    startY: number;
    scrollOffset: number;
    verticalPanOffset: number;
    priceScaleRatio: number;
    visibleCount: number;
  } | null>(null);

  const pinchStateRef = useRef<{
    startDist: number;
    startDistX: number;
    startDistY: number;
    visibleCount: number;
    priceScaleRatio: number;
    scrollOffset: number;
    centerX: number;
    centerY: number;
    midX: number;
  } | null>(null);

  // Reset chart zoom, pan, and drawings when the coin or timeframe changes to prevent empty views or stale overlays
  useEffect(() => {
    setScrollOffset(0);
    setVerticalPanOffset(0);
    setPriceScaleRatio(1.0);
    setVisibleCount(75);
    setDrawings([]);
    setHoverData(null);
    setDrawingStart(null);
    dragStateRef.current = null;
    pinchStateRef.current = null;
  }, [symbol, timeframe]);

  // Attach native non-passive touch listeners directly to canvas for robust mobile pinch zoom & multi-axis scale dragging
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleNativeTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        dragStateRef.current = null;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const distX = Math.abs(t1.clientX - t2.clientX);
        const distY = Math.abs(t1.clientY - t2.clientY);
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

        if (dist > 2) {
          const rect = canvas.getBoundingClientRect();
          const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
          const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
          pinchStateRef.current = {
            startDist: dist,
            startDistX: Math.max(10, distX),
            startDistY: Math.max(10, distY),
            visibleCount: visibleCountRef.current,
            priceScaleRatio: priceScaleRatioRef.current,
            scrollOffset: scrollOffsetRef.current,
            centerX: midX,
            centerY: midY,
            midX: (t1.clientX + t2.clientX) / 2,
          };
        }
      } else if (e.touches.length === 1) {
        pinchStateRef.current = null;
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;

        const paddingRight = 70;
        const paddingBottom = 25;
        const chartWidth = rect.width - paddingRight;
        const availableHeight = rect.height - paddingBottom;

        let mode: 'pan' | 'scalePrice' | 'scaleTime' = 'pan';
        if (x > chartWidth && y <= availableHeight) {
          mode = 'scalePrice';
        } else if (y > availableHeight) {
          mode = 'scaleTime';
        } else {
          mode = 'pan';
        }

        if (e.cancelable) e.preventDefault();
        dragStateRef.current = {
          active: true,
          mode,
          startX: x,
          startY: y,
          scrollOffset: scrollOffsetRef.current,
          verticalPanOffset: verticalPanOffsetRef.current,
          priceScaleRatio: priceScaleRatioRef.current,
          visibleCount: visibleCountRef.current,
        };
        setIsDragging(true);

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        dragHistoryRef.current = [{ x, time: Date.now() }];
      }
    };

    const handleNativeTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchStateRef.current) {
        if (e.cancelable) e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const distY = Math.abs(t1.clientY - t2.clientY);
        const midX = (t1.clientX + t2.clientX) / 2;

        if (dist > 3 && pinchStateRef.current.startDist > 0) {
          // Horizontal candle zoom
          const ratio = dist / pinchStateRef.current.startDist;
          const targetCount = Math.round(pinchStateRef.current.visibleCount / ratio);
          const totalCandles = candlesRef.current.length || 250;
          const constrainedCount = Math.max(10, Math.min(totalCandles, targetCount));

          const rect = canvas.getBoundingClientRect();
          const chartWidth = rect.width - 70;

          const k = Math.min(1, Math.max(0, pinchStateRef.current.centerX / chartWidth));
          const zoomShift = (1 - k) * (pinchStateRef.current.visibleCount - constrainedCount);

          const dx = midX - pinchStateRef.current.midX;
          const candleWidth = chartWidth / (constrainedCount + 6);
          const panShift = dx / candleWidth;

          const targetScrollOffset = pinchStateRef.current.scrollOffset + zoomShift + panShift;
          const maxScrollOffset = Math.max(0, totalCandles - constrainedCount);

          setVisibleCount(constrainedCount);
          setScrollOffset(Math.min(maxScrollOffset, Math.max(-25, targetScrollOffset)));

          // Vertical price zoom if 2-finger pinch has significant vertical gesture
          if (pinchStateRef.current.startDistY > 15 && distY > 10) {
            const ratioY = distY / pinchStateRef.current.startDistY;
            const targetPriceRatio = Math.max(0.15, Math.min(8.0, pinchStateRef.current.priceScaleRatio * ratioY));
            setPriceScaleRatio(targetPriceRatio);
          }
        }
      } else if (e.touches.length === 1 && dragStateRef.current?.active) {
        if (e.cancelable) e.preventDefault();
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;

        const chartWidth = rect.width - 70;
        const dx = x - dragStateRef.current.startX;
        const dy = y - dragStateRef.current.startY;

        if (dragStateRef.current.mode === 'pan') {
          const candleWidth = chartWidth / (visibleCountRef.current + 6);
          const indexShift = dx / candleWidth;

          const targetScrollOffset = dragStateRef.current.scrollOffset + indexShift;
          const maxScrollOffset = Math.max(0, candlesRef.current.length - visibleCountRef.current);

          setScrollOffset(Math.min(maxScrollOffset, Math.max(-25, targetScrollOffset)));
          setVerticalPanOffset(dragStateRef.current.verticalPanOffset + dy);

          dragHistoryRef.current.push({ x, time: Date.now() });
          if (dragHistoryRef.current.length > 5) {
            dragHistoryRef.current.shift();
          }
        } else if (dragStateRef.current.mode === 'scalePrice') {
          const factor = Math.exp(-dy * 0.01);
          const targetPriceRatio = Math.max(0.15, Math.min(8.0, dragStateRef.current.priceScaleRatio * factor));
          setPriceScaleRatio(targetPriceRatio);
        } else if (dragStateRef.current.mode === 'scaleTime') {
          const targetCount = Math.max(
            10,
            Math.min(candlesRef.current.length || 250, Math.round(dragStateRef.current.visibleCount - dx * 0.3))
          );
          setVisibleCount(targetCount);
        }
      }
    };

    const handleNativeTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchStateRef.current = null;
      }
      if (e.touches.length === 0) {
        if (dragStateRef.current?.active) {
          handleDragEnd();
        }
        dragStateRef.current = null;
      }
    };

    canvas.addEventListener('touchstart', handleNativeTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleNativeTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleNativeTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleNativeTouchStart);
      canvas.removeEventListener('touchmove', handleNativeTouchMove);
      canvas.removeEventListener('touchend', handleNativeTouchEnd);
      canvas.removeEventListener('touchcancel', handleNativeTouchEnd);
    };
  }, []);

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

    const isLight = document.documentElement.classList.contains('light') || document.body.classList.contains('light-theme');

    // 1. Solid Terminal Background
    ctx.fillStyle = isLight ? '#ffffff' : '#181a20';
    ctx.fillRect(0, 0, width, height);

    // Layout configuration
    const paddingRight = 70; // Price scale
    const paddingBottom = 25; // Time axis
    const chartWidth = width - paddingRight;

    // Proportionate heights (Subchart bar is removed)
    const availableHeight = height - paddingBottom - 10;
    const mainChartHeight = availableHeight * 0.82;
    const volumeHeight = availableHeight * 0.18;
    const subchartHeight = 0;

    const volumeTop = mainChartHeight + 5;
    const subchartTop = volumeTop + volumeHeight + 5;

    // Sliced Visible Candles based on scrollOffset
    const floorScroll = Math.floor(scrollOffset);
    const fracScroll = scrollOffset - floorScroll;

    const endIdx = Math.max(1, candles.length - floorScroll);
    const startIdx = Math.max(0, endIdx - visibleCount);
    const visibleCandles = candles.slice(startIdx, endIdx);
    const count = visibleCandles.length;
    const rightMarginCandles = 6;
    const candleWidth = chartWidth / (visibleCount + rightMarginCandles);
    const barWidth = Math.max(1.5, candleWidth * 0.68);

    // Min & Max Prices for Main Chart
    let rawMinPrice = Math.min(...visibleCandles.map((c) => c.low));
    let rawMaxPrice = Math.max(...visibleCandles.map((c) => c.high));

    // Calculate High & Low indices
    let maxIdx = 0;
    let minIdx = 0;
    visibleCandles.forEach((c, idx) => {
      if (c.high > visibleCandles[maxIdx].high) maxIdx = idx;
      if (c.low < visibleCandles[minIdx].low) minIdx = idx;
    });

    const priceRange = rawMaxPrice - rawMinPrice || 1;
    rawMinPrice -= priceRange * 0.04;
    rawMaxPrice += priceRange * 0.04;

    const midPrice = (rawMaxPrice + rawMinPrice) / 2;
    const scaledHalfRange = ((rawMaxPrice - rawMinPrice) / 2) / priceScaleRatio;
    const minPrice = midPrice - scaledHalfRange;
    const maxPrice = midPrice + scaledHalfRange;

    const getY = (price: number) => {
      return mainChartHeight - ((price - minPrice) / (maxPrice - minPrice)) * (mainChartHeight - 20) - 10 + verticalPanOffset;
    };

    const getX = (timeIndex: number, originalX: number) => {
      if (timeIndex === -1) return originalX;
      const targetCandle = candles[timeIndex];
      if (!targetCandle) return -999;
      const idxInVisible = visibleCandles.indexOf(targetCandle);
      if (idxInVisible === -1) return -999; // offscreen
      return (idxInVisible + fracScroll) * candleWidth + candleWidth / 2;
    };

    // Technical Indicators
    const ema5 = calculateEMA(candles, 5).slice(startIdx, endIdx);
    const ema10 = calculateEMA(candles, 10).slice(startIdx, endIdx);
    const ema20 = calculateEMA(candles, 20).slice(startIdx, endIdx);

    const boll = calculateBollingerBands(candles, 20, 2);
    const bollUpper = boll.upper.slice(startIdx, endIdx);
    const bollMiddle = boll.middle.slice(startIdx, endIdx);
    const bollLower = boll.lower.slice(startIdx, endIdx);

    const macdData = calculateMACD(candles);
    const macdLine = macdData.macdLine.slice(startIdx, endIdx);
    const signalLine = macdData.signalLine.slice(startIdx, endIdx);
    const histogram = macdData.histogram.slice(startIdx, endIdx);

    const rsiValues = calculateRSI(candles, 14).slice(startIdx, endIdx);

    const gridSteps = 6;
    const timeSteps = 5;
    const currentY = getY(currentPrice);

    // 2. Draw Faint Grid Lines (Fixed equidistant lines on the screen main area)
    if (showGrid) {
      ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.8;

      // Horizontal Price Grid
      for (let i = 0; i <= gridSteps; i++) {
        const y = 10 + ((mainChartHeight - 20) * i) / gridSteps;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
      }

      // Vertical Time Grid
      for (let i = 0; i < timeSteps; i++) {
        const index = Math.floor((count / timeSteps) * i);
        const x = index * candleWidth + candleWidth / 2;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, mainChartHeight);
        ctx.stroke();
      }
    }

    // 3. Draw Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${symbol} PERPETUAL`, chartWidth / 2, mainChartHeight / 2 + 15);

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
            const x = (i + fracScroll) * candleWidth + candleWidth / 2;
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
        const x = (i + fracScroll) * candleWidth + candleWidth / 2;
        const openY = getY(candle.open);
        const closeY = getY(candle.close);
        const highY = getY(candle.high);
        const lowY = getY(candle.low);

        const isBullish = candle.close >= candle.open;
        const color = isBullish ? (isLight ? '#009a5b' : '#00c076') : (isLight ? '#d92138' : '#f6465d');

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
        const x = (i + fracScroll) * candleWidth + candleWidth / 2;
        const y = getY(candle.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gradient Fill
      ctx.lineTo(((visibleCandles.length - 1) + fracScroll) * candleWidth + candleWidth / 2, mainChartHeight);
      ctx.lineTo((0 + fracScroll) * candleWidth + candleWidth / 2, mainChartHeight);
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
      const x = (i + fracScroll) * candleWidth + candleWidth / 2;
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
            const x = (i + fracScroll) * candleWidth + candleWidth / 2;
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
    if (showHighLow) {
      if (visibleCandles[maxIdx]) {
        const highCandle = visibleCandles[maxIdx];
        const x = (maxIdx + fracScroll) * candleWidth + candleWidth / 2;
        const y = getY(highCandle.high);

        ctx.fillStyle = isLight ? '#1e293b' : '#f3f4f6';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = x > chartWidth / 2 ? 'right' : 'left';
        const textX = x > chartWidth / 2 ? x - 8 : x + 8;
        ctx.fillText(`▲ H: ${highCandle.high.toFixed(precision)}`, textX, y - 2);
      }

      if (visibleCandles[minIdx]) {
        const lowCandle = visibleCandles[minIdx];
        const x = (minIdx + fracScroll) * candleWidth + candleWidth / 2;
        const y = getY(lowCandle.low);

        ctx.fillStyle = isLight ? '#1e293b' : '#f3f4f6';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = x > chartWidth / 2 ? 'right' : 'left';
        const textX = x > chartWidth / 2 ? x - 8 : x + 8;
        ctx.fillText(`▼ L: ${lowCandle.low.toFixed(precision)}`, textX, y + 10);
      }
    }

    // 9. Dotted Line for Current Live Price
    if (showLivePrice) {
      if (currentY >= 0 && currentY <= mainChartHeight) {
        ctx.strokeStyle = isLight ? '#009a5b' : '#00c076';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, currentY);
        ctx.lineTo(chartWidth, currentY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 9b. Render Open Positions & Liquidation Price Lines on Canvas
    if (showPositions && positions && positions.length > 0) {
      const activePositions = positions.filter(p => p.symbol === symbol);
      activePositions.forEach(pos => {
        const entryY = getY(pos.entryPrice);
        const isLong = pos.side === 'long';
        const posColor = isLong ? (isLight ? '#008f52' : '#00c076') : (isLight ? '#d92138' : '#f6465d');

        if (entryY >= 0 && entryY <= mainChartHeight) {
          ctx.strokeStyle = posColor;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([6, 3]);
          ctx.beginPath();
          ctx.moveTo(0, entryY);
          ctx.lineTo(chartWidth, entryY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Position Tag Label on Canvas
          const pnlText = pos.pnl >= 0 ? `+${pos.pnl.toFixed(2)}` : pos.pnl.toFixed(2);
          const tagLabel = `${pos.side.toUpperCase()} ${pos.leverage}x @ ${pos.entryPrice.toFixed(precision)} (${pnlText} USDT)`;

          ctx.font = 'bold 10px sans-serif';
          const textWidth = ctx.measureText(tagLabel).width;
          const bgX = 12;
          const bgY = Math.max(4, entryY - 10);

          ctx.fillStyle = isLong ? '#00a863' : '#e12d46';
          ctx.fillRect(bgX, bgY, textWidth + 12, 18);

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';
          ctx.fillText(tagLabel, bgX + 6, bgY + 13);
        }

        // Draw Liquidation Price Line if showLiquidation is enabled
        if (showLiquidation && pos.liquidationPrice > 0) {
          const liqY = getY(pos.liquidationPrice);
          if (liqY >= 0 && liqY <= mainChartHeight) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(0, liqY);
            ctx.lineTo(chartWidth, liqY);
            ctx.stroke();
            ctx.setLineDash([]);

            const liqLabel = `LIQ @ ${pos.liquidationPrice.toFixed(precision)}`;
            ctx.font = 'bold 10px sans-serif';
            const liqWidth = ctx.measureText(liqLabel).width;

            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(chartWidth - liqWidth - 18, liqY - 10, liqWidth + 12, 18);

            ctx.fillStyle = '#000000';
            ctx.textAlign = 'left';
            ctx.fillText(liqLabel, chartWidth - liqWidth - 12, liqY + 3);
          }
        }
      });
    }

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

    // 11. Render User Drawings & Annotations
    drawings.forEach((drw) => {
      if (drw.type === 'line' && drw.points.length >= 2) {
        const [p1, p2] = drw.points;
        const x1 = getX(p1.timeIndex, p1.x);
        const x2 = getX(p2.timeIndex, p2.x);
        if (x1 === -999 || x2 === -999) return;
        const y1 = getY(p1.price);
        const y2 = getY(p2.price);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // End circles
        ctx.fillStyle = '#fcd535';
        ctx.beginPath();
        ctx.arc(x1, y1, 3.5, 0, Math.PI * 2);
        ctx.arc(x2, y2, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (drw.type === 'fibo' && drw.points.length >= 2) {
        const [p1, p2] = drw.points;
        const x1 = getX(p1.timeIndex, p1.x);
        const x2 = getX(p2.timeIndex, p2.x);
        if (x1 === -999 || x2 === -999) return;
        const highP = Math.max(p1.price, p2.price);
        const lowP = Math.min(p1.price, p2.price);
        const pDiff = highP - lowP;

        const fibRatios = [
          { r: 0, color: '#f6465d' },
          { r: 0.236, color: '#f97316' },
          { r: 0.382, color: '#eab308' },
          { r: 0.5, color: '#00c076' },
          { r: 0.618, color: '#06b6d4' },
          { r: 1.0, color: '#a855f7' },
        ];

        fibRatios.forEach(({ r, color }) => {
          const levelPrice = highP - pDiff * r;
          const yLevel = getY(levelPrice);

          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 2]);
          ctx.beginPath();
          ctx.moveTo(0, yLevel);
          ctx.lineTo(chartWidth, yLevel);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = color;
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`Fib ${(r * 100).toFixed(1)}%: ${levelPrice.toFixed(precision)}`, 10, yLevel - 3);
        });
      } else if (drw.type === 'text' && drw.points.length >= 1) {
        const p1 = drw.points[0];
        const x1 = getX(p1.timeIndex, p1.x);
        if (x1 === -999) return;
        const y1 = getY(p1.price);

        ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
        ctx.fillRect(x1 - 4, y1 - 18, (drw.text?.length || 4) * 7 + 12, 22);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(drw.text || 'Note', x1 + 2, y1 - 3);
      } else if (drw.type === 'ruler' && drw.points.length >= 2) {
        const [p1, p2] = drw.points;
        const x1 = getX(p1.timeIndex, p1.x);
        const x2 = getX(p2.timeIndex, p2.x);
        if (x1 === -999 || x2 === -999) return;
        const y1 = getY(p1.price);
        const y2 = getY(p2.price);

        const leftX = Math.min(x1, x2);
        const rightX = Math.max(x1, x2);
        const topY = Math.min(y1, y2);
        const bottomY = Math.max(y1, y2);

        const priceDiff = p2.price - p1.price;
        const pctDiff = p1.price ? (priceDiff / p1.price) * 100 : 0;
        const isUp = priceDiff >= 0;

        ctx.fillStyle = isUp ? 'rgba(0, 192, 118, 0.15)' : 'rgba(246, 70, 93, 0.15)';
        ctx.fillRect(leftX, topY, Math.max(2, rightX - leftX), Math.max(2, bottomY - topY));

        ctx.strokeStyle = isUp ? '#00c076' : '#f6465d';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(leftX, topY, Math.max(2, rightX - leftX), Math.max(2, bottomY - topY));

        ctx.fillStyle = isUp ? '#00c076' : '#f6465d';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${isUp ? '+' : ''}${priceDiff.toFixed(precision)} (${isUp ? '+' : ''}${pctDiff.toFixed(2)}%)`, (leftX + rightX) / 2, topY - 5);
      }
    });

    // Draw In-Progress Line/Fibo/Ruler preview
    if (drawingStart && hoverData) {
      const xStart = getX(drawingStart.timeIndex, drawingStart.x);
      if (xStart !== -999) {
        const yStart = getY(drawingStart.price);
        ctx.strokeStyle = '#fcd535';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(hoverData.x, hoverData.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 12. Crosshair Hover Cursor Lines
    if (hoverData && hoverData.x <= chartWidth && hoverData.y <= availableHeight) {
      ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)';
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

    // ==========================================
    // MASK OFF AXES & DRAW LABELS (ANTI-BLEEDING & STABLE PANNING)
    // ==========================================
    // Right Axis Solid Background Mask
    ctx.fillStyle = isLight ? '#ffffff' : '#0a0805';
    ctx.fillRect(chartWidth, 0, paddingRight, availableHeight);

    // Bottom Axis Solid Background Mask
    ctx.fillRect(0, availableHeight, width, paddingBottom + 10);

    // Divider borders between canvas and axes
    ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartWidth, 0);
    ctx.lineTo(chartWidth, availableHeight);
    ctx.lineTo(0, availableHeight);
    ctx.stroke();

    // Right Axis Price Labels (Fixed positions on axis, dynamic computed prices based on pan & scale)
    for (let i = 0; i <= gridSteps; i++) {
      const y = 10 + ((mainChartHeight - 20) * i) / gridSteps;
      const priceVal = minPrice + (maxPrice - minPrice) * (mainChartHeight - 10 - y + verticalPanOffset) / (mainChartHeight - 20);

      ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceVal.toFixed(precision), chartWidth + 8, y + 3);
    }

    // Auto-scale 'A' Badge indicator on top of right price axis
    const isCustomScaled = priceScaleRatio !== 1.0 || verticalPanOffset !== 0;
    ctx.fillStyle = isCustomScaled ? '#fcd535' : (isLight ? '#e2e8f0' : '#1e293b');
    ctx.fillRect(chartWidth + 6, 6, 18, 14);
    ctx.fillStyle = isCustomScaled ? '#000000' : (isLight ? '#475569' : '#94a3b8');
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('A', chartWidth + 15, 16);

    // Bottom Axis Time Labels
    for (let i = 0; i < timeSteps; i++) {
      const index = Math.floor((count / timeSteps) * i);
      const x = index * candleWidth + candleWidth / 2;

      if (visibleCandles[index]) {
        const dateObj = new Date(visibleCandles[index].time);
        const dateStr = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')} ${dateObj.getHours().toString().padStart(2, '0')}:00`;
        
        ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(dateStr, x, availableHeight + 14);
      }
    }

    // Live Price Pill Tag drawn on top of the right axis mask
    if (currentY >= 0 && currentY <= mainChartHeight) {
      ctx.fillStyle = '#00c076';
      const pillHeight = 20;
      const pillWidth = paddingRight - 4;
      ctx.fillRect(chartWidth + 2, currentY - pillHeight / 2, pillWidth, pillHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${currentPrice.toFixed(precision)}`, chartWidth + 2 + pillWidth / 2, currentY + 4);
    }

    // Hover Coordinate Pill Tags
    if (hoverData && hoverData.x <= chartWidth && hoverData.y <= availableHeight) {
      const hoverY = hoverData.y;
      if (hoverY <= mainChartHeight) {
        const hoverPrice = minPrice + (maxPrice - minPrice) * (mainChartHeight - 10 - hoverY + verticalPanOffset) / (mainChartHeight - 20);

        ctx.fillStyle = isLight ? '#0f172a' : '#1f2937';
        const hPillHeight = 20;
        const hPillWidth = paddingRight - 4;
        ctx.fillRect(chartWidth + 2, hoverY - hPillHeight / 2, hPillWidth, hPillHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${hoverPrice.toFixed(precision)}`, chartWidth + 2 + hPillWidth / 2, hoverY + 4);
      }

      const hoverIndex = Math.floor((hoverData.x / chartWidth) * visibleCandles.length);
      const hoverCandle = visibleCandles[hoverIndex];
      if (hoverCandle) {
        const dateObj = new Date(hoverCandle.time);
        const dateStr = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
        
        ctx.fillStyle = isLight ? '#1e293b' : '#374151';
        const tPillWidth = 100;
        const tPillHeight = 18;
        ctx.fillRect(hoverData.x - tPillWidth / 2, availableHeight + 2, tPillWidth, tPillHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(dateStr, hoverData.x, availableHeight + 14);
      }
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
    drawings,
    drawingStart,
    scrollOffset,
    verticalPanOffset,
    priceScaleRatio,
    symbol,
  ]);

  // Non-passive wheel event listener for smooth Binance-style chart & axis zooming
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const paddingRight = 70;
      const paddingBottom = 25;
      const chartWidth = rect.width - paddingRight;
      const availableHeight = rect.height - paddingBottom;

      if (x > chartWidth && y <= availableHeight) {
        // Wheel over right price axis -> Zoom vertical price scale ratio
        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        setPriceScaleRatio((prev) => Math.max(0.15, Math.min(8.0, prev * factor)));
      } else if (y > availableHeight) {
        // Wheel over bottom time axis -> Zoom horizontal candles count
        const zoomStep = Math.max(1, Math.round(visibleCount * 0.1));
        setVisibleCount((prev) =>
          e.deltaY < 0 ? Math.max(10, prev - zoomStep) : Math.min(candles.length || 250, prev + zoomStep)
        );
      } else {
        // Wheel over main chart -> Zoom candles centered at cursor X
        const zoomStep = Math.max(1, Math.round(visibleCount * 0.1));

        setVisibleCount((prevVisible) => {
          let nextVisible;
          if (e.deltaY < 0) {
            nextVisible = Math.max(10, prevVisible - zoomStep);
          } else {
            nextVisible = Math.min(candles.length || 250, prevVisible + zoomStep);
          }

          if (x > 0 && x <= chartWidth) {
            const k = x / chartWidth;
            const deltaRight = (1 - k) * (prevVisible - nextVisible);
            setScrollOffset((prevScroll) => {
              const maxScroll = Math.max(0, (candles.length || 250) - nextVisible);
              return Math.min(maxScroll, Math.max(-25, prevScroll + deltaRight));
            });
          }
          return nextVisible;
        });
      }
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheelNative);
    };
  }, [candles.length, visibleCount]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingRight = 70;
    const paddingBottom = 25;
    const chartWidth = rect.width - paddingRight;
    const availableHeight = rect.height - paddingBottom;

    // Reset price scale if user clicks the 'A' badge on top right
    if (x > chartWidth + 4 && y <= 24) {
      soundFx.playClick();
      setPriceScaleRatio(1.0);
      setVerticalPanOffset(0);
      return;
    }

    if (x > chartWidth || y > availableHeight) return;

    const endIdx = Math.max(1, candles.length - scrollOffset);
    const startIdx = Math.max(0, endIdx - visibleCount);
    const visibleCandles = candles.slice(startIdx, endIdx);

    const minPrice = Math.min(...visibleCandles.map((c) => c.low));
    const maxPrice = Math.max(...visibleCandles.map((c) => c.high));
    const priceRange = maxPrice - minPrice || 1;
    const mainChartHeight = availableHeight * 0.82;

    const y_unpan = y - verticalPanOffset;
    const price = minPrice + ((mainChartHeight - 10 - y_unpan) / (mainChartHeight - 20)) * priceRange;

    const timeIndexInVisible = Math.floor((x / chartWidth) * visibleCandles.length);
    const targetCandle = visibleCandles[timeIndexInVisible];
    const fullTimeIndex = targetCandle ? candles.indexOf(targetCandle) : -1;

    const pt: DrawingPoint = { x, y, price, timeIndex: fullTimeIndex };

    if (activeTool === 'line' || activeTool === 'fibo' || activeTool === 'ruler') {
      soundFx.playClick();
      if (!drawingStart) {
        setDrawingStart(pt);
      } else {
        setDrawings((prev) => [
          ...prev,
          {
            id: `drw-${Date.now()}`,
            type: activeTool,
            points: [drawingStart, pt],
          },
        ]);
        setDrawingStart(null);
      }
    } else if (activeTool === 'text') {
      soundFx.playClick();
      const noteText = prompt('Enter Chart Analysis Note:', 'Support Level') || 'Note';
      if (noteText) {
        setDrawings((prev) => [
          ...prev,
          {
            id: `drw-${Date.now()}`,
            type: 'text',
            points: [pt],
            text: noteText,
          },
        ]);
      }
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingRight = 70;
    const paddingBottom = 25;
    const chartWidth = rect.width - paddingRight;
    const availableHeight = rect.height - paddingBottom;

    soundFx.playClick();
    if (x > chartWidth && y <= availableHeight) {
      // Double click on right price axis -> Reset vertical price scale
      setPriceScaleRatio(1.0);
      setVerticalPanOffset(0);
    } else if (y > availableHeight) {
      // Double click on bottom time axis -> Reset time zoom & scroll
      setVisibleCount(75);
      setScrollOffset(0);
    } else {
      // Double click on main chart canvas -> Reset full terminal scale & view
      setPriceScaleRatio(1.0);
      setVerticalPanOffset(0);
      setVisibleCount(75);
      setScrollOffset(0);
    }
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const paddingRight = 70;
    const paddingBottom = 25;
    const chartWidth = rect.width - paddingRight;
    const availableHeight = rect.height - paddingBottom;

    let mode: 'pan' | 'scalePrice' | 'scaleTime' = 'pan';
    if (x > chartWidth && y <= availableHeight) {
      mode = 'scalePrice';
    } else if (y > availableHeight) {
      mode = 'scaleTime';
    } else {
      mode = 'pan';
    }

    dragStateRef.current = {
      active: true,
      mode,
      startX: x,
      startY: y,
      scrollOffset,
      verticalPanOffset,
      priceScaleRatio,
      visibleCount,
    };
    setIsDragging(true);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    dragHistoryRef.current = [{ x, time: Date.now() }];
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const chartWidth = rect.width - 70;
    const endIdx = Math.max(1, candles.length - Math.floor(scrollOffset));
    const startIdx = Math.max(0, endIdx - visibleCount);
    const visibleCandles = candles.slice(startIdx, endIdx);

    const candleIndex = Math.floor((x / chartWidth) * visibleCandles.length);
    const candle = visibleCandles[candleIndex] || null;

    if (dragStateRef.current?.active) {
      const dx = x - dragStateRef.current.startX;
      const dy = y - dragStateRef.current.startY;

      if (dragStateRef.current.mode === 'pan') {
        const candleWidth = chartWidth / (visibleCount + 6);
        const indexShift = dx / candleWidth;

        const targetScrollOffset = dragStateRef.current.scrollOffset + indexShift;
        const maxScrollOffset = Math.max(0, candles.length - visibleCount);
        setScrollOffset(Math.min(maxScrollOffset, Math.max(-25, targetScrollOffset)));

        setVerticalPanOffset(dragStateRef.current.verticalPanOffset + dy);

        dragHistoryRef.current.push({ x, time: Date.now() });
        if (dragHistoryRef.current.length > 5) {
          dragHistoryRef.current.shift();
        }
      } else if (dragStateRef.current.mode === 'scalePrice') {
        const factor = Math.exp(-dy * 0.01);
        const targetPriceRatio = Math.max(0.15, Math.min(8.0, dragStateRef.current.priceScaleRatio * factor));
        setPriceScaleRatio(targetPriceRatio);
      } else if (dragStateRef.current.mode === 'scaleTime') {
        const targetCount = Math.max(
          10,
          Math.min(candles.length || 250, Math.round(dragStateRef.current.visibleCount - dx * 0.3))
        );
        setVisibleCount(targetCount);
      }
    } else {
      setHoverData({ x, y, candle, price: currentPrice });
    }
  };

  const handleDragEnd = () => {
    dragStateRef.current = null;
    setIsDragging(false);

    // Apply smooth momentum gliding if swipe velocity is strong enough
    if (dragHistoryRef.current.length >= 2) {
      const history = dragHistoryRef.current;
      const first = history[0];
      const last = history[history.length - 1];
      const dt = last.time - first.time;
      if (dt > 10 && dt < 200) {
        const dx = last.x - first.x;
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const chartWidth = rect.width - 70;
          const candleWidth = chartWidth / (visibleCount + 6);
          
          let velocity = (dx / candleWidth) / dt;
          
          const maxVelocity = 0.6;
          if (velocity > maxVelocity) velocity = maxVelocity;
          if (velocity < -maxVelocity) velocity = -maxVelocity;

          if (Math.abs(velocity) > 0.01) {
            let lastTime = Date.now();
            const friction = 0.94; // Natural smooth gliding decay

            const glide = () => {
              const now = Date.now();
              const frameTime = now - lastTime;
              lastTime = now;

              velocity *= Math.pow(friction, frameTime / 16);

              if (Math.abs(velocity) < 0.001) {
                animationFrameRef.current = null;
                return;
              }

              setScrollOffset((prev) => {
                const maxScrollOffset = Math.max(0, candles.length - visibleCount);
                const next = prev + velocity * frameTime;
                return Math.min(maxScrollOffset, Math.max(-25, next));
              });

              animationFrameRef.current = requestAnimationFrame(glide);
            };

            animationFrameRef.current = requestAnimationFrame(glide);
          }
        }
      }
    }
    dragHistoryRef.current = [];
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerDown(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    handleDragEnd();
    setHoverData(null);
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
    <div 
      ref={containerRef}
      className={`flex-1 flex flex-col bg-[#0a0805] min-w-0 select-none relative w-full border-r border-amber-500/10 ${
        isFullScreen
          ? 'fixed inset-0 z-[90000] w-screen h-screen bg-[#0a0805] p-1.5'
          : 'h-full min-h-0 lg:min-h-[580px] xl:min-h-[640px]'
      }`}
    >
      {/* 1. Timeframe & Analysis Toolbar */}
      <div className="h-10 px-2.5 bg-[#0a0805] border-b border-amber-500/10 flex items-center gap-1.5 text-xs font-sans text-zinc-300 shrink-0 relative z-30 w-full overflow-visible">
        {/* Left Section: Horizontally scrollable timeframe bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar scrollbar-none min-w-0 pr-1 py-1">
          {/* Favorite Timeframe Presets */}
          {activeTimeframeTabs.map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => {
                  soundFx.playClick();
                  onChangeTimeframe(tf);
                }}
                className={`shrink-0 px-2.5 py-1 text-xs cursor-pointer transition-all ${
                  isActive ? 'app-subtab-active' : 'app-subtab-inactive'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>

        {/* Timeframes Dropdown Selector - Placed outside scrollable to prevent clipping */}
        <div className="relative shrink-0" ref={tfDropdownRef}>
          <button
            onClick={() => {
              soundFx.playClick();
              setIsTfDropdownOpen(!isTfDropdownOpen);
            }}
            className={`px-2 py-1 text-xs cursor-pointer transition-all rounded-lg flex items-center gap-1 border font-sans ${
              isTfDropdownOpen
                ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 hover:border-zinc-700'
            }`}
            title="Timeframe Selector"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
            <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${isTfDropdownOpen ? 'rotate-180 text-zinc-200' : ''}`} />
          </button>
        </div>

        {/* Separator and type toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="h-4 w-[1px] bg-white/10 mx-0.5 shrink-0" />

          {/* Chart Type Toggle */}
          <button
            onClick={() => {
              soundFx.playClick();
              setChartType(chartType === 'candle' ? 'line' : 'candle');
            }}
            className="shrink-0 p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
            title="Toggle Chart Style"
          >
            {chartType === 'candle' ? <CandlestickChart className="w-4 h-4 text-[#00c076]" /> : <LineChart className="w-4 h-4 text-[#00c076]" />}
          </button>
        </div>

        {/* Right Tools: Zoom Controls + Settings Gear + Fullscreen Mode */}
        <div className="flex items-center gap-1.5 text-zinc-400 shrink-0 ml-auto bg-[#0a0805] pl-1 relative z-40 overflow-visible">
          <div className="hidden sm:flex items-center bg-[#181a20] rounded border border-white/10 p-0.5 shrink-0">
            <button
              onClick={() => {
                soundFx.playClick();
                setVisibleCount((prev) => Math.max(10, prev - 12));
              }}
              className="p-1 hover:text-[#00c076] transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setVisibleCount(65);
              }}
              className="text-[10px] px-1.5 font-sans text-[#00c076] font-bold hover:underline cursor-pointer"
              title="Reset Zoom to 65 Candles"
            >
              {visibleCount}
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setVisibleCount((prev) => Math.min(candles.length, prev + 12));
              }}
              className="p-1 hover:text-[#00c076] transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Settings Gear Dropdown */}
          <div className="relative shrink-0" ref={settingsDropdownRef}>
            <button
              onClick={() => {
                soundFx.playClick();
                setIsSettingsOpen(!isSettingsOpen);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                isSettingsOpen
                  ? 'bg-[#00c076]/20 text-[#00c076] border-[#00c076]/40 shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 hover:text-[#00c076]'
              }`}
              title="Chart Settings & Display Options"
            >
              <Settings className={`w-4 h-4 text-[#00c076] ${isSettingsOpen ? 'rotate-45' : ''} transition-transform duration-200`} />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#141822] border border-white/5 rounded-2xl shadow-2xl p-3 z-50 text-xs font-sans text-zinc-200 backdrop-blur-md animate-in fade-in duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Settings className="w-3.5 h-3.5 text-[#00c076]" />
                    Chart Display Options
                  </span>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {/* Open Positions on Chart */}
                  <label className="flex items-center justify-between cursor-pointer group hover:bg-white/5 p-1.5 rounded-lg transition-colors">
                    <span className="text-zinc-300 group-hover:text-white font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00c076]" />
                      Open Positions on Chart
                    </span>
                    <input
                      type="checkbox"
                      checked={showPositions}
                      onChange={(e) => {
                        soundFx.playClick();
                        setShowPositions(e.target.checked);
                      }}
                      className="w-3.5 h-3.5 accent-[#00c076] rounded cursor-pointer"
                    />
                  </label>

                  {/* Liquidation Price Line */}
                  <label className="flex items-center justify-between cursor-pointer group hover:bg-white/5 p-1.5 rounded-lg transition-colors">
                    <span className="text-zinc-300 group-hover:text-white font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Liquidation Price Line
                    </span>
                    <input
                      type="checkbox"
                      checked={showLiquidation}
                      onChange={(e) => {
                        soundFx.playClick();
                        setShowLiquidation(e.target.checked);
                      }}
                      className="w-3.5 h-3.5 accent-[#00c076] rounded cursor-pointer"
                    />
                  </label>

                  {/* Live Price Line */}
                  <label className="flex items-center justify-between cursor-pointer group hover:bg-white/5 p-1.5 rounded-lg transition-colors">
                    <span className="text-zinc-300 group-hover:text-white font-medium">
                      Current Price Line
                    </span>
                    <input
                      type="checkbox"
                      checked={showLivePrice}
                      onChange={(e) => {
                        soundFx.playClick();
                        setShowLivePrice(e.target.checked);
                      }}
                      className="w-3.5 h-3.5 accent-[#00c076] rounded cursor-pointer"
                    />
                  </label>

                  {/* Peak High / Low Tags */}
                  <label className="flex items-center justify-between cursor-pointer group hover:bg-white/5 p-1.5 rounded-lg transition-colors">
                    <span className="text-zinc-300 group-hover:text-white font-medium">
                      Peak High / Low Tags
                    </span>
                    <input
                      type="checkbox"
                      checked={showHighLow}
                      onChange={(e) => {
                        soundFx.playClick();
                        setShowHighLow(e.target.checked);
                      }}
                      className="w-3.5 h-3.5 accent-[#00c076] rounded cursor-pointer"
                    />
                  </label>

                  {/* Chart Grid Lines */}
                  <label className="flex items-center justify-between cursor-pointer group hover:bg-white/5 p-1.5 rounded-lg transition-colors">
                    <span className="text-zinc-300 group-hover:text-white font-medium">
                      Chart Grid Lines
                    </span>
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => {
                        soundFx.playClick();
                        setShowGrid(e.target.checked);
                      }}
                      className="w-3.5 h-3.5 accent-[#00c076] rounded cursor-pointer"
                    />
                  </label>

                  {/* Quick Indicators */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setShowEMA(!showEMA);
                      }}
                      className={`flex-1 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                        showEMA ? 'bg-[#00c076]/20 text-[#00c076] border-[#00c076]/40' : 'bg-white/5 text-zinc-400 border-white/10'
                      }`}
                    >
                      EMA Indicator
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setShowBoll(!showBoll);
                      }}
                      className={`flex-1 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                        showBoll ? 'bg-[#00c076]/20 text-[#00c076] border-[#00c076]/40' : 'bg-white/5 text-zinc-400 border-white/10'
                      }`}
                    >
                      Bollinger Bands
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Screen Horizontal Mode Toggle */}
          <button
            onClick={toggleFullScreen}
            className={`p-1.5 rounded-lg transition-all cursor-pointer border shrink-0 ${
              isFullScreen
                ? 'bg-[#00c076] text-white border-[#00c076] font-bold shadow-md shadow-[#00c076]/30'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 hover:text-[#00c076]'
            }`}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Horizontal Mode'}
          >
            {isFullScreen ? (
              <Minimize2 className="w-4 h-4 text-white shrink-0" />
            ) : (
              <Maximize2 className="w-4 h-4 text-[#00c076] shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Workspace: Left Drawing Tools Rail + Canvas */}
      <div className="flex-1 flex min-h-0 relative w-full bg-[#181a20]">
        {/* Left Vertical Drawing Toolbar */}
        <div className="w-9 bg-[#181a20] border-r border-white/10 flex flex-col items-center py-2 gap-3 text-zinc-400 shrink-0">
          <button
            onClick={() => setActiveTool('crosshair')}
            className={`p-1.5 rounded transition-colors cursor-pointer shrink-0 ${
              activeTool === 'crosshair' ? 'bg-[#00c076]/20 text-[#00c076]' : 'hover:text-white'
            }`}
            title="Crosshair Tool"
          >
            <Move className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('line')}
            className={`p-1.5 rounded transition-colors cursor-pointer shrink-0 ${
              activeTool === 'line' ? 'bg-[#00c076]/20 text-[#00c076]' : 'hover:text-white'
            }`}
            title="Trend Line"
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('fibo')}
            className={`p-1.5 rounded transition-colors cursor-pointer shrink-0 ${
              activeTool === 'fibo' ? 'bg-[#00c076]/20 text-[#00c076]' : 'hover:text-white'
            }`}
            title="Fibonacci Retracement"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('text')}
            className={`p-1.5 rounded transition-colors cursor-pointer shrink-0 ${
              activeTool === 'text' ? 'bg-[#00c076]/20 text-[#00c076]' : 'hover:text-white'
            }`}
            title="Text Note"
          >
            <Type className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('ruler')}
            className={`p-1.5 rounded transition-colors cursor-pointer shrink-0 ${
              activeTool === 'ruler' ? 'bg-[#00c076]/20 text-[#00c076]' : 'hover:text-white'
            }`}
            title="Measure Ruler"
          >
            <Ruler className="w-4 h-4" />
          </button>

          <div className="h-[1px] w-5 bg-white/10 my-1 shrink-0" />

          {/* Indicators in Trading Tools */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowEMA(!showEMA);
            }}
            className={`w-7 h-7 flex items-center justify-center rounded text-[10px] font-black cursor-pointer transition-all shrink-0 ${
              showEMA ? 'bg-[#00c076]/25 text-[#00c076] border border-[#00c076]/40 shadow-xs' : 'hover:text-white hover:bg-white/5 text-zinc-400 border border-transparent'
            }`}
            title="Toggle EMA Indicator"
          >
            EMA
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setShowBoll(!showBoll);
            }}
            className={`w-7 h-7 flex items-center justify-center rounded text-[10px] font-black cursor-pointer transition-all shrink-0 ${
              showBoll ? 'bg-[#00c076]/25 text-[#00c076] border border-[#00c076]/40 shadow-xs' : 'hover:text-white hover:bg-white/5 text-zinc-400 border border-transparent'
            }`}
            title="Toggle Bollinger Bands"
          >
            BOLL
          </button>

          <div className="mt-auto flex flex-col gap-2">
            {(scrollOffset !== 0 || verticalPanOffset !== 0) && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setScrollOffset(0);
                  setVerticalPanOffset(0);
                }}
                className="p-1.5 rounded transition-colors cursor-pointer bg-[#00c076]/20 text-[#00c076] hover:bg-[#00c076]/30 flex items-center justify-center shrink-0 border border-[#00c076]/30 animate-pulse"
                title="Recenter Chart View"
              >
                <Move className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                setDrawings([]);
                setDrawingStart(null);
                setActiveTool('crosshair');
              }}
              className="p-1.5 rounded hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear All Drawings"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Interactive Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 relative w-full h-full min-h-0 lg:min-h-[360px] xl:min-h-[420px]"
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onDoubleClick={handleCanvasDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          />

          {/* Loading Spin Animation Overlay - Single Spinner Without Text */}
          {(isLoading || candles.length === 0) && (
            <div className="absolute inset-0 z-30 bg-[#0d1117]/80 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-150">
              <div className="w-10 h-10 rounded-full border-2 border-[#00c076]/20 border-t-[#00c076] animate-spin" />
            </div>
          )}

          {/* Binance Floating Quick Zoom & Reset Scale Overlay Pill */}
          <div className="absolute bottom-9 right-20 z-20 pointer-events-auto flex items-center gap-1 bg-[#181a20] border border-white/10 rounded-lg p-1 shadow-lg text-xs font-sans">
            <button
              onClick={() => {
                soundFx.playClick();
                setVisibleCount((prev) => Math.min(candles.length || 250, prev + 12));
              }}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-zinc-300 hover:text-white font-bold transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setVisibleCount((prev) => Math.max(10, prev - 12));
              }}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-zinc-300 hover:text-white font-bold transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {(scrollOffset !== 0 || verticalPanOffset !== 0 || priceScaleRatio !== 1.0 || visibleCount !== 75) && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setScrollOffset(0);
                  setVerticalPanOffset(0);
                  setPriceScaleRatio(1.0);
                  setVisibleCount(75);
                }}
                className="px-2 py-1 bg-[#00c076] text-white font-extrabold text-[10px] rounded hover:bg-[#00d080] transition-colors cursor-pointer flex items-center gap-1 shadow-sm ml-0.5"
                title="Reset Chart Scale & Recenter (Double Click Canvas)"
              >
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Terminal Quick Trade Execution Bar */}
      <div className="px-3 py-2 bg-[#181a20] border-t border-white/10 shrink-0 flex items-center justify-center gap-3">
        <button
          onClick={() => {
            soundFx.playClick();
            if (onOpenLong) onOpenLong();
          }}
          className="flex-1 py-2.5 rounded-xl bg-[#00c076] hover:bg-[#00d080] active:scale-[0.98] text-white font-extrabold text-xs font-sans text-center transition-all cursor-pointer shadow-md shadow-[#00c076]/20 flex items-center justify-center gap-1.5"
        >
          <span>Open Long</span>
          <span className="text-[10px] opacity-90 font-sans">Buy</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            if (onOpenShort) onOpenShort();
          }}
          className="flex-1 py-2.5 rounded-xl bg-[#f6465d] hover:bg-[#f8556c] active:scale-[0.98] text-white font-extrabold text-xs font-sans text-center transition-all cursor-pointer shadow-md shadow-[#f6465d]/20 flex items-center justify-center gap-1.5"
        >
          <span>Open Short</span>
          <span className="text-[10px] opacity-90 font-sans">Sell</span>
        </button>
      </div>

      {isTfDropdownOpen && (
        <>
          {/* Backdrop Overlay to catch clicks anywhere inside the chart */}
          <div 
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-100" 
            onClick={() => setIsTfDropdownOpen(false)}
          />

          {/* Centered Modal: Styled exactly like the chart settings/display options modal */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 bg-[#141822] border border-white/5 rounded-2xl shadow-2xl p-4 text-xs font-sans text-zinc-200 backdrop-blur-md animate-in fade-in duration-100 max-h-[85%] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5 text-[#00c076]" />
                Select Timeframe
              </span>
              <button
                onClick={() => setIsTfDropdownOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Timeframe Categories Grid */}
            <div className="overflow-y-auto py-1 space-y-2.5 text-xs no-scrollbar flex-1">
              {/* Minutes */}
              <div>
                <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Minutes</div>
                <div className="grid grid-cols-4 gap-1">
                  {(['1m', '3m', '5m', '15m'] as ChartTimeframe[]).map((tf) => {
                    const isFav = favTimeframes.includes(tf);
                    const isActive = timeframe === tf;
                    return (
                      <div 
                        key={tf}
                        className={`flex items-center justify-between px-2 py-1 rounded-lg border transition-all ${
                          isActive 
                            ? 'bg-[#00c076]/20 border-[#00c076] text-[#00c076] font-bold' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onChangeTimeframe(tf);
                            setIsTfDropdownOpen(false);
                          }}
                          className="flex-1 text-left text-[11px] font-semibold cursor-pointer py-0.5"
                        >
                          {tf}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playClick();
                            setFavTimeframes((prev) => {
                              if (prev.includes(tf)) {
                                if (prev.length <= 1) return prev;
                                return prev.filter((item) => item !== tf);
                              } else {
                                return [...prev, tf];
                              }
                            });
                          }}
                          className="p-0.5 cursor-pointer hover:scale-110 transition-transform text-zinc-500 hover:text-amber-400"
                        >
                          <Star 
                            className={`w-3 h-3 ${
                              isFav ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                            }`} 
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hours */}
              <div>
                <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Hours</div>
                <div className="grid grid-cols-4 gap-1">
                  {(['1h', '4h'] as ChartTimeframe[]).map((tf) => {
                    const isFav = favTimeframes.includes(tf);
                    const isActive = timeframe === tf;
                    return (
                      <div 
                        key={tf}
                        className={`flex items-center justify-between px-2 py-1 rounded-lg border transition-all ${
                          isActive 
                            ? 'bg-[#00c076]/20 border-[#00c076] text-[#00c076] font-bold' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onChangeTimeframe(tf);
                            setIsTfDropdownOpen(false);
                          }}
                          className="flex-1 text-left text-[11px] font-semibold cursor-pointer py-0.5"
                        >
                          {tf}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playClick();
                            setFavTimeframes((prev) => {
                              if (prev.includes(tf)) {
                                if (prev.length <= 1) return prev;
                                return prev.filter((item) => item !== tf);
                              } else {
                                return [...prev, tf];
                              }
                            });
                          }}
                          className="p-0.5 cursor-pointer hover:scale-110 transition-transform text-zinc-500 hover:text-amber-400"
                        >
                          <Star 
                            className={`w-3 h-3 ${
                              isFav ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                            }`} 
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Days */}
              <div>
                <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Days</div>
                <div className="grid grid-cols-3 gap-1">
                  {(['1d', '2d', '3d'] as ChartTimeframe[]).map((tf) => {
                    const isFav = favTimeframes.includes(tf);
                    const isActive = timeframe === tf;
                    return (
                      <div 
                        key={tf}
                        className={`flex items-center justify-between px-2 py-1 rounded-lg border transition-all ${
                          isActive 
                            ? 'bg-[#00c076]/20 border-[#00c076] text-[#00c076] font-bold' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onChangeTimeframe(tf);
                            setIsTfDropdownOpen(false);
                          }}
                          className="flex-1 text-left text-[11px] font-semibold cursor-pointer py-0.5"
                        >
                          {tf}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playClick();
                            setFavTimeframes((prev) => {
                              if (prev.includes(tf)) {
                                if (prev.length <= 1) return prev;
                                return prev.filter((item) => item !== tf);
                              } else {
                                return [...prev, tf];
                              }
                            });
                          }}
                          className="p-0.5 cursor-pointer hover:scale-110 transition-transform text-zinc-500 hover:text-amber-400"
                        >
                          <Star 
                            className={`w-3 h-3 ${
                              isFav ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                            }`} 
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weeks & Months */}
              <div>
                <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Weeks & Months</div>
                <div className="grid grid-cols-3 gap-1">
                  {(['1w', '2w', '1Month', '2Month', '3Month', '1y'] as ChartTimeframe[]).map((tf) => {
                    const isFav = favTimeframes.includes(tf);
                    const isActive = timeframe === tf;
                    return (
                      <div 
                        key={tf}
                        className={`flex items-center justify-between px-2 py-1 rounded-lg border transition-all ${
                          isActive 
                            ? 'bg-[#00c076]/20 border-[#00c076] text-[#00c076] font-bold' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onChangeTimeframe(tf);
                            setIsTfDropdownOpen(false);
                          }}
                          className="flex-1 text-left text-[11px] font-semibold cursor-pointer py-0.5"
                        >
                          {tf}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playClick();
                            setFavTimeframes((prev) => {
                              if (prev.includes(tf)) {
                                if (prev.length <= 1) return prev;
                                return prev.filter((item) => item !== tf);
                              } else {
                                return [...prev, tf];
                              }
                            });
                          }}
                          className="p-0.5 cursor-pointer hover:scale-110 transition-transform text-zinc-500 hover:text-amber-400"
                        >
                          <Star 
                            className={`w-3 h-3 ${
                              isFav ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                            }`} 
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
