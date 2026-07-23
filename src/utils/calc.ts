import { Candle } from '../types';

export function formatCurrency(value: number, precision: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

export function formatNumber(value: number, precision: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
  return value.toFixed(2);
}

// Calculate Simple Moving Average (SMA)
export function calculateSMA(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += candles[j].close;
      }
      result.push(sum / period);
    }
  }
  return result;
}

// Calculate Relative Strength Index (RSI)
export function calculateRSI(candles: Candle[], period: number = 14): (number | null)[] {
  const rsiValues: (number | null)[] = [null];
  if (candles.length <= period) return candles.map(() => null);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsiValues.push(...Array(period - 1).fill(null));
  rsiValues.push(100 - 100 / (1 + rs));

  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsiValues.push(100);
    } else {
      rs = avgGain / avgLoss;
      rsiValues.push(100 - 100 / (1 + rs));
    }
  }

  return rsiValues;
}

// Calculate Futures Liquidation Price
export function calculateLiquidationPrice(
  entryPrice: number,
  side: 'long' | 'short',
  leverage: number,
  maintenanceMargin: number = 0.005 // 0.5%
): number {
  if (side === 'long') {
    // Long Liq Price = Entry * (1 - 1/leverage + maintenanceMargin)
    return Math.max(0, entryPrice * (1 - (1 / leverage) + maintenanceMargin));
  } else {
    // Short Liq Price = Entry * (1 + 1/leverage - maintenanceMargin)
    return entryPrice * (1 + (1 / leverage) - maintenanceMargin);
  }
}
