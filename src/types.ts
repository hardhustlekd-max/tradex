export type MarketCategory = 'All' | 'Layer 1' | 'DeFi' | 'AI' | 'Meme' | 'Layer 2';

export interface TradingPair {
  symbol: string;           // e.g. "BTC/USDT"
  baseAsset: string;        // e.g. "BTC"
  quoteAsset: string;       // e.g. "USDT"
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;        // in USDT
  precision: number;        // decimal places for price
  amountPrecision: number;  // decimal places for order size
  category: MarketCategory;
  sparkline: number[];
}

export interface Candle {
  time: number; // timestamp in ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface Trade {
  id: string;
  price: number;
  amount: number;
  time: string;
  type: 'buy' | 'sell';
}

export type OrderType = 'limit' | 'market' | 'stop_limit';
export type OrderSide = 'buy' | 'sell';
export type TradingMode = 'spot' | 'futures';
export type MarginMode = 'cross' | 'isolated';

export interface Order {
  id: string;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  mode: TradingMode;
  marginMode?: MarginMode;
  price: number;
  amount: number;
  filled: number;
  status: 'open' | 'filled' | 'cancelled';
  createdAt: string;
  leverage?: number;
  triggerPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  leverage: number;
  entryPrice: number;
  markPrice: number;
  size: number;          // Position size in base coin (e.g. BTC)
  margin: number;        // USDT margin locked
  marginMode: MarginMode;
  pnl: number;           // USDT profit/loss
  pnlPercentage: number; // ROI %
  liquidationPrice: number;
  takeProfit?: number;
  stopLoss?: number;
  createdAt: string;
}

export interface Portfolio {
  usdtBalance: number;
  spotBalances: Record<string, number>; // e.g. { BTC: 0.25, ETH: 2.1 }
}

export type UserPortfolio = Portfolio;

export type ChartTimeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';
export type ChartMode = 'candles' | 'line' | 'depth';
export type DrawingTool = 'none' | 'trendline' | 'horizontal' | 'fibonacci';

export interface DrawingItem {
  id: string;
  type: DrawingTool;
  startX?: number; // Candle index or price/time
  startY?: number; // Price
  endX?: number;
  endY?: number;
  price?: number;  // For horizontal line
  color?: string;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
}

export interface AiMarketAnalysis {
  symbol: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  confidenceScore: number;
  summary: string;
  supportLevels: string[];
  resistanceLevels: string[];
  technicalHighlights: string[];
  recommendedStrategy: {
    action: string;
    entryZone: string;
    targetPrice: string;
    stopLossPrice: string;
    riskRewardRatio: string;
  };
}
