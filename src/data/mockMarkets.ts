import { TradingPair, Candle, OrderBookEntry, Trade } from '../types';

export const INITIAL_PAIRS: TradingPair[] = [
  {
    symbol: 'BTC/USDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    price: 65420.30,
    change24h: -0.70,
    high24h: 66800.00,
    low24h: 64900.00,
    volume24h: 1940000000,
    precision: 2,
    amountPrecision: 4,
    category: 'Layer 1',
    sparkline: [66100, 65800, 65500, 65420.3],
  },
  {
    symbol: 'BLUAI/USDT',
    baseAsset: 'BLUAI',
    quoteAsset: 'USDT',
    price: 0.011987,
    change24h: -1.54,
    high24h: 0.0125,
    low24h: 0.0115,
    volume24h: 426070,
    precision: 6,
    amountPrecision: 2,
    category: 'AI',
    sparkline: [0.0122, 0.0121, 0.0120, 0.011987],
  },
  {
    symbol: 'DODOX/USDT',
    baseAsset: 'DODOX',
    quoteAsset: 'USDT',
    price: 0.019171,
    change24h: 0.51,
    high24h: 0.0195,
    low24h: 0.0188,
    volume24h: 595440,
    precision: 6,
    amountPrecision: 2,
    category: 'DeFi',
    sparkline: [0.0189, 0.0190, 0.0191, 0.019171],
  },
  {
    symbol: 'SYN/USDT',
    baseAsset: 'SYN',
    quoteAsset: 'USDT',
    price: 0.1504,
    change24h: -20.68,
    high24h: 0.1920,
    low24h: 0.1450,
    volume24h: 1580000,
    precision: 4,
    amountPrecision: 2,
    category: 'DeFi',
    sparkline: [0.189, 0.175, 0.160, 0.1504],
  },
  {
    symbol: 'WOO/USDT',
    baseAsset: 'WOO',
    quoteAsset: 'USDT',
    price: 0.01287,
    change24h: 0.47,
    high24h: 0.0132,
    low24h: 0.0125,
    volume24h: 54540,
    precision: 5,
    amountPrecision: 2,
    category: 'DeFi',
    sparkline: [0.0127, 0.0128, 0.01287],
  },
  {
    symbol: 'OG/USDT',
    baseAsset: 'OG',
    quoteAsset: 'USDT',
    price: 2.574,
    change24h: -0.77,
    high24h: 2.65,
    low24h: 2.52,
    volume24h: 254510,
    precision: 3,
    amountPrecision: 2,
    category: 'DeFi',
    sparkline: [2.61, 2.59, 2.574],
  },
  {
    symbol: 'MOODENG/USDT',
    baseAsset: 'MOODENG',
    quoteAsset: 'USDT',
    price: 0.03774,
    change24h: -0.71,
    high24h: 0.0392,
    low24h: 0.0368,
    volume24h: 437450,
    precision: 5,
    amountPrecision: 2,
    category: 'AI',
    sparkline: [0.0382, 0.0380, 0.03774],
  },
  {
    symbol: 'ETH/USDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    price: 3420.50,
    change24h: 2.15,
    high24h: 3490.00,
    low24h: 3310.00,
    volume24h: 1850300000,
    precision: 2,
    amountPrecision: 3,
    category: 'Layer 1',
    sparkline: [3310, 3340, 3380, 3360, 3400, 3410, 3420.5],
  },
  {
    symbol: 'SOL/USDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    price: 198.40,
    change24h: 5.80,
    high24h: 204.50,
    low24h: 186.20,
    volume24h: 940200000,
    precision: 2,
    amountPrecision: 2,
    category: 'Layer 1',
    sparkline: [186.2, 189.0, 192.5, 190.8, 195.4, 197.1, 198.4],
  },
  {
    symbol: 'AVAX/USDT',
    baseAsset: 'AVAX',
    quoteAsset: 'USDT',
    price: 38.15,
    change24h: -1.25,
    high24h: 39.80,
    low24h: 37.40,
    volume24h: 312000000,
    precision: 2,
    amountPrecision: 2,
    category: 'Layer 1',
    sparkline: [39.5, 39.1, 38.8, 38.4, 38.0, 38.3, 38.15],
  },
  {
    symbol: 'NEAR/USDT',
    baseAsset: 'NEAR',
    quoteAsset: 'USDT',
    price: 6.85,
    change24h: 4.10,
    high24h: 7.10,
    low24h: 6.45,
    volume24h: 210500000,
    precision: 3,
    amountPrecision: 2,
    category: 'AI',
    sparkline: [6.45, 6.55, 6.70, 6.62, 6.80, 6.82, 6.85],
  },
  {
    symbol: 'XRP/USDT',
    baseAsset: 'XRP',
    quoteAsset: 'USDT',
    price: 2.15,
    change24h: 8.60,
    high24h: 2.28,
    low24h: 1.95,
    volume24h: 1540800000,
    precision: 4,
    amountPrecision: 1,
    category: 'Layer 1',
    sparkline: [1.95, 2.01, 2.08, 2.05, 2.12, 2.14, 2.15],
  },
  {
    symbol: 'LINK/USDT',
    baseAsset: 'LINK',
    quoteAsset: 'USDT',
    price: 18.90,
    change24h: -0.85,
    high24h: 19.50,
    low24h: 18.40,
    volume24h: 180400000,
    precision: 2,
    amountPrecision: 2,
    category: 'DeFi',
    sparkline: [19.2, 19.0, 18.8, 18.9, 18.7, 18.85, 18.9],
  },
  {
    symbol: 'BNB/USDT',
    baseAsset: 'BNB',
    quoteAsset: 'USDT',
    price: 645.20,
    change24h: 1.15,
    high24h: 652.00,
    low24h: 638.00,
    volume24h: 520000000,
    precision: 2,
    amountPrecision: 3,
    category: 'Layer 1',
    sparkline: [638, 640, 642, 641, 644, 643.5, 645.2],
  },
];

// Helper to generate historical candles with coin-unique chart shapes
export function generateCandles(currentPrice: number, count: number = 80, timeframe: string = '1h', symbol: string = 'BTC/USDT'): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  let intervalMs = 3600000; // default 1h
  if (timeframe === '1m') intervalMs = 60000;
  if (timeframe === '3m') intervalMs = 180000;
  if (timeframe === '5m') intervalMs = 300000;
  if (timeframe === '15m') intervalMs = 900000;
  if (timeframe === '1h') intervalMs = 3600000;
  if (timeframe === '4h') intervalMs = 14400000;
  if (timeframe === '1d' || timeframe === '1D') intervalMs = 86400000;
  if (timeframe === '2d') intervalMs = 172800000;
  if (timeframe === '3d') intervalMs = 259200000;
  if (timeframe === '1w') intervalMs = 604800000;
  if (timeframe === '2w') intervalMs = 1209600000;
  if (timeframe === '1Month') intervalMs = 2592000000;
  if (timeframe === '2Month') intervalMs = 5184000000;
  if (timeframe === '3Month') intervalMs = 7776000000;
  if (timeframe === '1y' || timeframe === 'Iy') intervalMs = 31536000000;

  // Create seeds based on symbol and timeframe strings to give every (coin, timeframe) pair a distinct, unique chart pattern
  let symbolSeed = 0;
  for (let s = 0; s < symbol.length; s++) {
    symbolSeed += symbol.charCodeAt(s) * (s + 1) * 37;
  }

  let tfSeed = 0;
  for (let t = 0; t < timeframe.length; t++) {
    tfSeed += timeframe.charCodeAt(t) * (t + 1) * 31;
  }

  // Seeded pseudo-random generator combining symbol and timeframe
  let seed = symbolSeed + tfSeed * 137 + 12345;
  const prng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Base volatility and archetype parameters unique per symbol
  const cleanSymbol = symbol.toUpperCase().split('/')[0];
  let patternType = symbolSeed % 6; // 0: parabolic surge, 1: double bottom breakout, 2: ascending staircase, 3: deep V-recovery, 4: cup & handle, 5: macro trend channel
  
  if (cleanSymbol === 'BTC') patternType = 5;
  if (cleanSymbol === 'ETH') patternType = 1;
  if (cleanSymbol === 'SOL') patternType = 3;
  if (cleanSymbol === 'BLUAI') patternType = 0;
  if (cleanSymbol === 'SYN') patternType = 4;

  let tfVolMultiplier = 1.0;
  if (['1m', '3m', '5m'].includes(timeframe)) tfVolMultiplier = 0.5;
  if (['15m', '1h'].includes(timeframe)) tfVolMultiplier = 1.0;
  if (['4h', '1d', '2d', '3d'].includes(timeframe)) tfVolMultiplier = 1.6;
  if (['1w', '2w', '1Month', '2Month', '3Month', '1y'].includes(timeframe)) tfVolMultiplier = 2.4;

  const baseVol = (currentPrice > 1000 ? 0.007 : currentPrice > 10 ? 0.015 : 0.025) * tfVolMultiplier;

  // Pre-calculate target trend wave path
  const priceMultiplierPath: number[] = [];
  const tfWaveShift = (tfSeed % 5) * 0.2;

  for (let i = 0; i < count; i++) {
    const t = i / count;
    let wave = 0;

    switch (patternType) {
      case 0: // Parabolic surge & consolidation
        wave = Math.pow(t, 2.5) * 0.35 * (1 + tfWaveShift * 0.2) + Math.sin(t * Math.PI * (6 + (tfSeed % 4))) * 0.03;
        break;
      case 1: // Double bottom breakout
        wave = Math.sin((t - 0.2 + tfWaveShift * 0.1) * Math.PI * 2.5) * 0.18 + Math.cos(t * Math.PI * (6 + (tfSeed % 3))) * 0.04 + t * 0.12;
        break;
      case 2: // Ascending staircase
        const steps = 4 + (tfSeed % 4);
        wave = (Math.floor(t * steps) / steps) * 0.22 + Math.sin(t * Math.PI * 10) * 0.025;
        break;
      case 3: // Deep V-recovery
        wave = Math.pow(t - 0.35 - tfWaveShift * 0.05, 2) * -0.4 + (t * 0.25) + Math.sin(t * Math.PI * (10 + (tfSeed % 5))) * 0.02;
        break;
      case 4: // Cup & handle
        wave = -Math.sin(t * Math.PI * 1.2) * 0.22 + (t > 0.65 ? Math.sin((t - 0.65) * Math.PI * 10) * 0.04 + (t - 0.65) * 0.4 : 0);
        break;
      default: // Macro trend channel
        wave = Math.sin(t * Math.PI * (4 + (tfSeed % 3)) + (symbolSeed % 5)) * 0.14 + Math.cos(t * Math.PI * 9) * 0.04 + (t - 0.5) * 0.15;
        break;
    }

    priceMultiplierPath.push(1 + wave);
  }

  // Scale path so final candle close aligns with currentPrice
  const finalMult = priceMultiplierPath[count - 1] || 1;
  let prevClose = currentPrice * (priceMultiplierPath[0] / finalMult);

  for (let i = count - 1; i >= 0; i--) {
    const idx = count - 1 - i;
    const time = now - i * intervalMs;
    const targetBasePrice = currentPrice * (priceMultiplierPath[idx] / finalMult);
    
    const noise = (prng() - 0.49) * baseVol * targetBasePrice;
    const open = prevClose;
    let close = targetBasePrice + noise;
    if (i === 0) close = currentPrice; // exact current price on latest candle

    const high = Math.max(open, close) + prng() * baseVol * targetBasePrice * 0.7;
    const low = Math.min(open, close) - prng() * baseVol * targetBasePrice * 0.7;
    const volume = Math.round((prng() * 60 + 20) * (currentPrice > 1000 ? 10 : 800));

    const precision = currentPrice < 1 ? 4 : 2;

    candles.push({
      time,
      open: Number(open.toFixed(precision)),
      high: Number(high.toFixed(precision)),
      low: Number(low.toFixed(precision)),
      close: Number(close.toFixed(precision)),
      volume: Number(volume.toFixed(2)),
    });

    prevClose = close;
  }

  return candles;
}

// Generate realistic Order Book bids and asks around current price
export function generateOrderBook(currentPrice: number, precision: number = 2): { asks: OrderBookEntry[]; bids: OrderBookEntry[] } {
  const asks: OrderBookEntry[] = [];
  const bids: OrderBookEntry[] = [];
  const step = currentPrice * 0.0003; // 0.03% spread per level

  let askTotal = 0;
  let bidTotal = 0;

  // Asks (Sells) - higher than current price
  for (let i = 1; i <= 12; i++) {
    const price = Number((currentPrice + i * step).toFixed(precision));
    const amount = Number((Math.random() * (currentPrice > 1000 ? 1.5 : 200) + 0.05).toFixed(3));
    askTotal += amount;
    asks.push({ price, amount, total: Number(askTotal.toFixed(3)) });
  }

  // Bids (Buys) - lower than current price
  for (let i = 1; i <= 12; i++) {
    const price = Number((currentPrice - i * step).toFixed(precision));
    const amount = Number((Math.random() * (currentPrice > 1000 ? 1.5 : 200) + 0.05).toFixed(3));
    bidTotal += amount;
    bids.push({ price, amount, total: Number(bidTotal.toFixed(3)) });
  }

  return { asks: asks.reverse(), bids };
}

// Generate recent trade history
export function generateRecentTrades(currentPrice: number, precision: number = 2): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();

  for (let i = 0; i < 20; i++) {
    const time = new Date(now - i * 1500).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const isBuy = Math.random() > 0.48;
    const priceOffset = (Math.random() - 0.5) * currentPrice * 0.0005;
    const price = Number((currentPrice + priceOffset).toFixed(precision));
    const amount = Number((Math.random() * (currentPrice > 1000 ? 0.8 : 120) + 0.01).toFixed(3));

    trades.push({
      id: `trd-${i}-${Math.random().toString(36).substr(2, 5)}`,
      price,
      amount,
      time,
      type: isBuy ? 'buy' : 'sell',
    });
  }

  return trades;
}

export interface RealMarketDataResult {
  candles: Candle[];
  ticker?: {
    price: number;
    change24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
  };
}

// Convert timeframe string to Binance interval string
export function mapTimeframeToBinanceInterval(tf: string): string {
  switch (tf) {
    case '1m': return '1m';
    case '3m': return '3m';
    case '5m': return '5m';
    case '15m': return '15m';
    case '1h': return '1h';
    case '4h': return '4h';
    case '1d':
    case '1D': return '1d';
    case '2d': return '3d';
    case '3d': return '3d';
    case '1w': return '1w';
    case '2w': return '1w';
    case '1Month':
    case '2Month':
    case '3Month':
    case '1y': return '1M';
    default: return '1h';
  }
}

// Helper to convert pair symbol to Binance symbol (e.g. BTC/USDT -> BTCUSDT)
export function getBinanceSymbol(symbol: string): string {
  return symbol.replace('/', '').toUpperCase();
}

// Fetch real candlestick & ticker data from Binance public API
export async function fetchRealMarketData(
  symbol: string,
  timeframe: string = '1h',
  count: number = 250,
  fallbackPrice: number = 100
): Promise<RealMarketDataResult> {
  const binanceSymbol = getBinanceSymbol(symbol);
  const interval = mapTimeframeToBinanceInterval(timeframe);

  try {
    const klinesUrl = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${count}`;
    const tickerUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`;

    const [klinesRes, tickerRes] = await Promise.all([
      fetch(klinesUrl),
      fetch(tickerUrl).catch(() => null),
    ]);

    if (!klinesRes.ok) {
      throw new Error(`Binance klines status: ${klinesRes.status}`);
    }

    const rawKlines = await klinesRes.json();
    if (!Array.isArray(rawKlines) || rawKlines.length === 0) {
      throw new Error('Empty klines returned');
    }

    const candles: Candle[] = rawKlines.map((k: any) => ({
      time: Number(k[0]),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));

    let tickerData;
    if (tickerRes && tickerRes.ok) {
      const t = await tickerRes.json();
      if (t && t.lastPrice) {
        tickerData = {
          price: parseFloat(t.lastPrice),
          change24h: parseFloat(t.priceChangePercent),
          high24h: parseFloat(t.highPrice),
          low24h: parseFloat(t.lowPrice),
          volume24h: parseFloat(t.quoteVolume || t.volume),
        };
      }
    }

    return { candles, ticker: tickerData };
  } catch (err) {
    console.warn(`[MarketData] Falling back to procedural candles for ${symbol}:`, err);
    const fallbackCandles = generateCandles(fallbackPrice, count, timeframe, symbol);
    return { candles: fallbackCandles };
  }
}

// Fetch 24h ticker updates for all pairs
export async function fetchAll24hTickers(): Promise<Record<string, { price: number; change24h: number; high24h: number; low24h: number; volume24h: number }>> {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    if (!res.ok) return {};
    const tickers = await res.json();
    const result: Record<string, { price: number; change24h: number; high24h: number; low24h: number; volume24h: number }> = {};
    if (Array.isArray(tickers)) {
      tickers.forEach((t: any) => {
        result[t.symbol] = {
          price: parseFloat(t.lastPrice),
          change24h: parseFloat(t.priceChangePercent),
          high24h: parseFloat(t.highPrice),
          low24h: parseFloat(t.lowPrice),
          volume24h: parseFloat(t.quoteVolume || t.volume),
        };
      });
    }
    return result;
  } catch (e) {
    return {};
  }
}

