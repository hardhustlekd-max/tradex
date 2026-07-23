import { TradingPair, Candle, OrderBookEntry, Trade } from '../types';

export const INITIAL_PAIRS: TradingPair[] = [
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

// Helper to generate historical candles
export function generateCandles(currentPrice: number, count: number = 80, timeframe: string = '1h'): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  let intervalMs = 3600000; // default 1h
  if (timeframe === '1m') intervalMs = 60000;
  if (timeframe === '5m') intervalMs = 300000;
  if (timeframe === '15m') intervalMs = 900000;
  if (timeframe === '4h') intervalMs = 14400000;
  if (timeframe === '1D') intervalMs = 86400000;

  let lastClose = currentPrice * (1 - 0.05 * (count / 100)); // Start slightly lower for upward overall trend

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * intervalMs;
    const volatility = currentPrice * 0.008; // 0.8% volatility per bar
    const open = lastClose;
    const change = (Math.random() - 0.48) * volatility; // slight upward bias
    const close = Math.max(open + change, currentPrice * 0.2);
    const high = Math.max(open, close) + Math.random() * volatility * 0.6;
    const low = Math.min(open, close) - Math.random() * volatility * 0.6;
    const volume = Math.round(Math.random() * 50 + 10) * (currentPrice > 1000 ? 5 : 500);

    candles.push({
      time,
      open: Number(open.toFixed(4)),
      high: Number(high.toFixed(4)),
      low: Number(low.toFixed(4)),
      close: Number(close.toFixed(4)),
      volume: Number(volume.toFixed(2)),
    });

    lastClose = close;
  }

  // Set last candle close to current exact price
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = currentPrice;
    last.high = Math.max(last.high, currentPrice);
    last.low = Math.min(last.low, currentPrice);
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
