import React, { useState, useEffect } from 'react';
import { 
  TradingPair, 
  Portfolio, 
  TradingMode, 
  OrderSide, 
  OrderType, 
  MarginMode 
} from '../types';
import { formatCurrency, calculateLiquidationPrice } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { ShieldAlert, Zap, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface OrderFormProps {
  activePair: TradingPair;
  portfolio: Portfolio;
  selectedPrice: number | null;
  onSubmitOrder: (order: {
    mode: TradingMode;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    leverage: number;
    marginMode: MarginMode;
    takeProfit?: number;
    stopLoss?: number;
  }) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  activePair,
  portfolio,
  selectedPrice,
  onSubmitOrder,
}) => {
  const [tradingMode, setTradingMode] = useState<TradingMode>('futures');
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');

  // Futures specific
  const [leverage, setLeverage] = useState<number>(10);
  const [marginMode, setMarginMode] = useState<MarginMode>('cross');

  // Input states
  const [priceInput, setPriceInput] = useState<string>(activePair.price.toFixed(activePair.precision));
  const [amountInput, setAmountInput] = useState<string>('');
  const [takeProfitInput, setTakeProfitInput] = useState<string>('');
  const [stopLossInput, setStopLossInput] = useState<string>('');

  // Update price when user clicks an orderbook price or pair changes
  useEffect(() => {
    if (selectedPrice !== null) {
      setPriceInput(selectedPrice.toFixed(activePair.precision));
    } else {
      setPriceInput(activePair.price.toFixed(activePair.precision));
    }
  }, [selectedPrice, activePair]);

  const priceNum = parseFloat(priceInput) || activePair.price;
  const amountNum = parseFloat(amountInput) || 0;
  const notionalValue = priceNum * amountNum;

  // Margin required
  const marginRequired = tradingMode === 'spot' ? notionalValue : notionalValue / leverage;

  // Available funds check
  const availableUSDT = portfolio.usdtBalance;
  const availableAsset = portfolio.spotBalances[activePair.baseAsset] || 0;
  const isBuy = orderSide === 'buy';

  const maxAffordableAmount = isBuy
    ? (tradingMode === 'spot' ? availableUSDT / priceNum : (availableUSDT * leverage) / priceNum)
    : (tradingMode === 'spot' ? availableAsset : (availableUSDT * leverage) / priceNum);

  // Handle Preset Percentages (25%, 50%, 75%, 100%)
  const handlePercentageClick = (pct: number) => {
    soundFx.playClick();
    const calculatedAmount = (maxAffordableAmount * pct) / 100;
    setAmountInput(calculatedAmount > 0 ? calculatedAmount.toFixed(activePair.amountPrecision) : '');
  };

  // Liquidation Price calculation for Futures
  const estimatedLiqPrice = tradingMode === 'futures' && priceNum > 0
    ? calculateLiquidationPrice(priceNum, isBuy ? 'long' : 'short', leverage)
    : 0;

  // Submit order handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum <= 0) return;

    soundFx.playOrderPlaced();

    onSubmitOrder({
      mode: tradingMode,
      side: orderSide,
      type: orderType,
      price: orderType === 'market' ? activePair.price : priceNum,
      amount: amountNum,
      leverage: tradingMode === 'futures' ? leverage : 1,
      marginMode,
      takeProfit: takeProfitInput ? parseFloat(takeProfitInput) : undefined,
      stopLoss: stopLossInput ? parseFloat(stopLossInput) : undefined,
    });

    // Reset amount
    setAmountInput('');
  };

  return (
    <div className="w-full lg:w-72 bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-800/80 flex flex-col shrink-0 text-xs font-mono select-none overflow-y-auto h-full">
      {/* Top Mode Selector: Spot vs Futures */}
      <div className="p-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-1 shrink-0">
        <div className="grid grid-cols-2 gap-1 w-full p-0.5 bg-zinc-950 rounded-lg border border-zinc-800">
          <button
            onClick={() => {
              soundFx.playClick();
              setTradingMode('spot');
            }}
            className={`py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              tradingMode === 'spot' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Spot
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setTradingMode('futures');
            }}
            className={`py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              tradingMode === 'futures' ? 'bg-zinc-800 text-teal-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Futures</span>
            <span className="text-[9px] px-1 rounded bg-teal-950 text-teal-300 border border-teal-500/30">
              {leverage}x
            </span>
          </button>
        </div>
      </div>

      {/* Futures Margin Mode & Leverage Selector */}
      {tradingMode === 'futures' && (
        <div className="p-2.5 bg-zinc-900/40 border-b border-zinc-800 space-y-2">
          <div className="flex items-center justify-between gap-2">
            {/* Cross / Isolated */}
            <div className="flex rounded-md bg-zinc-900 p-0.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => setMarginMode('cross')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                  marginMode === 'cross' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
                }`}
              >
                Cross
              </button>
              <button
                type="button"
                onClick={() => setMarginMode('isolated')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                  marginMode === 'isolated' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
                }`}
              >
                Isolated
              </button>
            </div>

            {/* Leverage Preset Pill */}
            <span className="text-zinc-300 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {leverage}x Leverage
            </span>
          </div>

          {/* Leverage Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="1"
              max="100"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
              <span>1x</span>
              <span>25x</span>
              <span>50x</span>
              <span>75x</span>
              <span>100x</span>
            </div>
          </div>
        </div>
      )}

      {/* Order Side Selector: Buy/Long vs Sell/Short */}
      <div className="p-2.5 space-y-3">
        <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-zinc-900 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setOrderSide('buy');
            }}
            className={`py-2 rounded-md font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              isBuy ? 'bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-600/20' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{tradingMode === 'futures' ? 'Open Long' : 'Buy ' + activePair.baseAsset}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setOrderSide('sell');
            }}
            className={`py-2 rounded-md font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              !isBuy ? 'bg-rose-600 text-zinc-950 shadow-md shadow-rose-600/20' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{tradingMode === 'futures' ? 'Open Short' : 'Sell ' + activePair.baseAsset}</span>
          </button>
        </div>

        {/* Order Type Tabs: Limit / Market / Stop Limit */}
        <div className="flex items-center justify-between gap-1 border-b border-zinc-800 pb-2">
          {(['limit', 'market', 'stop_limit'] as OrderType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                soundFx.playClick();
                setOrderType(type);
              }}
              className={`px-2 py-1 rounded text-[11px] font-semibold capitalize cursor-pointer transition-colors ${
                orderType === type ? 'text-emerald-400 bg-zinc-900 border border-emerald-500/30' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Available Balance */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>Avail Bal:</span>
          <span className="font-bold text-zinc-200 font-mono">
            {isBuy || tradingMode === 'futures'
              ? formatCurrency(availableUSDT)
              : `${availableAsset.toFixed(activePair.amountPrecision)} ${activePair.baseAsset}`}
          </span>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {/* Price Input (if not Market) */}
          {orderType !== 'market' && (
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Order Price (USDT)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:outline-none"
                  placeholder="0.00"
                />
                <span className="absolute right-2.5 top-1.5 text-[10px] text-zinc-400">USDT</span>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="text-[10px] text-zinc-400 block mb-1">Amount ({activePair.baseAsset})</label>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-zinc-100 font-mono text-xs focus:outline-none"
                placeholder="0.00"
              />
              <span className="absolute right-2.5 top-1.5 text-[10px] text-zinc-400">{activePair.baseAsset}</span>
            </div>
          </div>

          {/* Preset Percentage Quick Buttons */}
          <div className="grid grid-cols-4 gap-1">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentageClick(pct)}
                className="py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 cursor-pointer font-mono transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Take Profit & Stop Loss inputs (Optional) */}
          <div className="pt-1 border-t border-zinc-900 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>TP / SL (Optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="number"
                step="0.01"
                value={takeProfitInput}
                onChange={(e) => setTakeProfitInput(e.target.value)}
                placeholder="Take Profit"
                className="bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded px-2 py-1 text-[11px] font-mono text-zinc-200 focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                value={stopLossInput}
                onChange={(e) => setStopLossInput(e.target.value)}
                placeholder="Stop Loss"
                className="bg-zinc-900 border border-zinc-800 focus:border-rose-500 rounded px-2 py-1 text-[11px] font-mono text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Summary Details */}
          <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800/80 space-y-1.5 text-[10px]">
            <div className="flex justify-between text-zinc-400">
              <span>Order Value:</span>
              <span className="text-zinc-200 font-mono">{formatCurrency(notionalValue)}</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>Margin Required:</span>
              <span className="text-emerald-400 font-mono font-bold">{formatCurrency(marginRequired)}</span>
            </div>

            {tradingMode === 'futures' && (
              <div className="flex justify-between text-zinc-400 border-t border-zinc-850 pt-1">
                <span>Est. Liq Price:</span>
                <span className="text-rose-400 font-mono font-bold">
                  {estimatedLiqPrice > 0 ? formatCurrency(estimatedLiqPrice, activePair.precision) : 'N/A'}
                </span>
              </div>
            )}
          </div>

          {/* Insufficient Funds Warning */}
          {marginRequired > availableUSDT && isBuy && (
            <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-1.5 text-[10px]">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Insufficient Demo Balance. Use Faucet to top up!</span>
            </div>
          )}

          {/* Main Action Submit Button */}
          <button
            type="submit"
            disabled={amountNum <= 0 || (marginRequired > availableUSDT && isBuy)}
            className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md ${
              isBuy
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-emerald-500/20'
                : 'bg-rose-500 hover:bg-rose-400 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-rose-500/20'
            }`}
          >
            {isBuy
              ? tradingMode === 'futures'
                ? `Long ${activePair.baseAsset} ${leverage}x`
                : `Buy ${activePair.baseAsset}`
              : tradingMode === 'futures'
                ? `Short ${activePair.baseAsset} ${leverage}x`
                : `Sell ${activePair.baseAsset}`}
          </button>
        </form>
      </div>
    </div>
  );
};
