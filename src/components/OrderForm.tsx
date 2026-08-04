import React, { useState, useEffect } from 'react';
import { 
  TradingPair, 
  Portfolio, 
  TradingMode, 
  OrderSide, 
  OrderType, 
  MarginMode 
} from '../types';
import { formatCurrency } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { ChevronDown, Plus, Minus, Zap } from 'lucide-react';

interface OrderFormProps {
  activePair: TradingPair;
  portfolio: Portfolio;
  selectedPrice: number | null;
  hideHeader?: boolean;
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
  hideHeader = false,
  onSubmitOrder,
}) => {
  const [tradingMode, setTradingMode] = useState<TradingMode>('futures');
  const [leverage, setLeverage] = useState<number>(10);
  const [marginMode, setMarginMode] = useState<MarginMode>('cross');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const [priceInput, setPriceInput] = useState<string>(activePair.price.toFixed(activePair.precision));
  const [amountInput, setAmountInput] = useState<string>('');
  const [sliderPct, setSliderPct] = useState<number>(0);

  useEffect(() => {
    if (selectedPrice !== null) {
      setPriceInput(selectedPrice.toFixed(activePair.precision));
    } else {
      setPriceInput(activePair.price.toFixed(activePair.precision));
    }
  }, [selectedPrice, activePair]);

  const priceNum = parseFloat(priceInput) || activePair.price;
  const amountNum = parseFloat(amountInput) || 0;
  const totalValue = priceNum * amountNum;

  const totalUsdtAcrossAccounts = 
    (portfolio.usdtBalance || 0) + 
    (portfolio.fundingUsdt || 0) + 
    (portfolio.spotBalances?.USDT || 0) + 
    (portfolio.copyUsdt || 0) + 
    (portfolio.earnUsdt || 0);

  const availableUSDT = tradingMode === 'futures' 
    ? (portfolio.usdtBalance || 0) 
    : (portfolio.spotBalances?.USDT || 0);
  
  const effectiveUsdtForMax = availableUSDT > 0 ? availableUSDT : (totalUsdtAcrossAccounts > 0 ? totalUsdtAcrossAccounts : 100);
  const availableAsset = portfolio.spotBalances?.[activePair.baseAsset] || 0;

  const maxAffordableAmount = tradingMode === 'futures' 
    ? (effectiveUsdtForMax * leverage) / priceNum 
    : Math.max(effectiveUsdtForMax / priceNum, availableAsset);

  const effectiveMax = maxAffordableAmount > 0 ? maxAffordableAmount : 1.0;

  const applyPercentage = (pct: number) => {
    setSliderPct(pct);
    soundFx.playClick();
    const calculatedAmount = (effectiveMax * pct) / 100;
    const prec = activePair.amountPrecision || 4;
    setAmountInput(calculatedAmount > 0 ? Number(calculatedAmount.toFixed(prec)).toString() : '0');
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    applyPercentage(val);
  };

  const handleAmountChange = (newAmt: number) => {
    const clamped = Math.max(0, newAmt);
    const prec = activePair.amountPrecision || 4;
    setAmountInput(clamped > 0 ? Number(clamped.toFixed(prec)).toString() : '');
    setSliderPct(Math.min(100, Math.round((clamped / effectiveMax) * 100)));
  };

  const handlePriceChange = (newPrice: number) => {
    const clamped = Math.max(0, newPrice);
    setPriceInput(clamped.toFixed(activePair.precision));
  };

  const handleOrderSubmit = (side: OrderSide) => {
    if (amountNum <= 0) return;

    soundFx.playOrderPlaced();

    onSubmitOrder({
      mode: tradingMode,
      side,
      type: orderType,
      price: orderType === 'market' ? activePair.price : priceNum,
      amount: amountNum,
      leverage: tradingMode === 'futures' ? leverage : 1,
      marginMode,
    });

    setAmountInput('');
    setSliderPct(0);
  };

  return (
    <div className={`w-full ${hideHeader ? 'bg-transparent border-0' : 'lg:w-72 xl:w-80 bg-[#0d1117] border-t lg:border-t-0 lg:border-l border-white/10'} flex flex-col shrink-0 text-xs font-sans select-none overflow-y-auto h-full min-h-0`}>
      {/* Header Bar matching PositionHistory */}
      {!hideHeader && (
        <div className="h-9 px-3 bg-[#181a20] border-b border-white/10 flex items-center justify-between text-zinc-100 font-bold shrink-0 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#00c076]" />
            <span>Place Order</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-sans font-medium">
            {activePair.symbol}
          </span>
        </div>
      )}

      {/* Mode Switcher: Futures vs Spot */}
      <div className="p-2 border-b border-white/10 bg-[#0d1117] flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 bg-[#181a20] p-1 rounded-lg flex-1">
          <button
            type="button"
            onClick={() => { soundFx.playClick(); setTradingMode('futures'); }}
            className={`flex-1 py-1 rounded-md text-[11px] font-extrabold cursor-pointer transition-all ${
              tradingMode === 'futures'
                ? 'bg-[#00c076] text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Futures
          </button>
          <button
            type="button"
            onClick={() => { soundFx.playClick(); setTradingMode('spot'); }}
            className={`flex-1 py-1 rounded-md text-[11px] font-extrabold cursor-pointer transition-all ${
              tradingMode === 'spot'
                ? 'bg-[#00c076] text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Spot
          </button>
        </div>
      </div>

      {/* Leverage & Margin Controls for Futures Mode */}
      {tradingMode === 'futures' && (
        <div className="px-2.5 pt-2 pb-1.5 border-b border-white/5 bg-[#12161f]/50 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => { soundFx.playClick(); setMarginMode(marginMode === 'cross' ? 'isolated' : 'cross'); }}
                className="px-2 py-0.5 rounded bg-[#181a20] border border-white/10 hover:border-white/20 text-zinc-200 font-bold capitalize cursor-pointer transition-colors text-[10px]"
              >
                {marginMode}
              </button>
              <span className="text-[#00c076] font-extrabold text-[11px] bg-[#00c076]/10 px-1.5 py-0.5 rounded border border-[#00c076]/20">
                {leverage}x
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-400 font-medium">Leverage (Max 200x)</span>
            </div>
          </div>

          {/* Quick Presets (up to 200x) */}
          <div className="grid grid-cols-5 gap-1">
            {[10, 25, 50, 100, 200].map((lev) => (
              <button
                key={lev}
                type="button"
                onClick={() => { soundFx.playClick(); setLeverage(lev); }}
                className={`py-0.5 rounded text-[10px] font-extrabold cursor-pointer transition-colors border ${
                  leverage === lev
                    ? 'bg-[#00c076]/20 text-[#00c076] border-[#00c076]/50 shadow-xs'
                    : 'bg-[#181a20] text-zinc-400 hover:text-zinc-200 border-white/10'
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>

          {/* Custom Leverage Range Slider */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="range"
              min="1"
              max="200"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full accent-[#00c076] cursor-pointer h-1 bg-[#0d1117] rounded"
            />
          </div>
        </div>
      )}

      {/* Form Content Area */}
      <div className="p-2.5 flex flex-col gap-2 flex-1">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
          {/* 1. Unified Row: Order Type Dropdown & Price Input */}
          <div className="grid grid-cols-2 gap-2 items-center">
            {/* Order Type Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { soundFx.playClick(); setIsTypeDropdownOpen(!isTypeDropdownOpen); }}
                className="w-full bg-[#181a20] border border-white/10 hover:border-white/20 rounded-lg py-1.5 px-2 flex items-center justify-between text-zinc-100 font-bold text-xs transition-all cursor-pointer h-10"
              >
                <span className="capitalize truncate">{orderType.replace('_', ' ')}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#181a20] border border-white/15 rounded-lg shadow-2xl p-1 z-50 flex flex-col gap-0.5">
                  {(['limit', 'market', 'stop_limit'] as OrderType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setOrderType(type);
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded-md text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                        orderType === type ? 'bg-[#00c076]/15 text-[#00c076] font-extrabold' : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Input Box */}
            {orderType !== 'market' ? (
              <div className="bg-[#181a20] border border-white/10 rounded-lg p-1.5 flex items-center justify-between gap-1 h-10">
                <button
                  type="button"
                  onClick={() => { soundFx.playClick(); handlePriceChange(priceNum - 0.5); }}
                  className="w-5 h-5 rounded bg-[#0d1117] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer shrink-0 transition-colors"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>

                <div className="flex-1 text-center font-sans min-w-0">
                  <div className="text-[9px] text-zinc-400 font-sans leading-none">Price</div>
                  <input
                    type="number"
                    step="0.01"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full bg-transparent text-center text-white font-bold text-xs focus:outline-none font-sans leading-tight"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => { soundFx.playClick(); handlePriceChange(priceNum + 0.5); }}
                  className="w-5 h-5 rounded bg-[#0d1117] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer shrink-0 transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <div className="bg-[#181a20] border border-white/10 rounded-lg px-2 flex flex-col justify-center text-center h-10">
                <div className="text-[9px] text-zinc-400 font-sans">Price</div>
                <div className="text-xs font-bold text-zinc-400 font-sans truncate">Market Best</div>
              </div>
            )}
          </div>

          {/* 3. Unified Row: Amount Input & Amount Slider / Presets */}
          <div className="grid grid-cols-2 gap-2 items-center">
            {/* Amount Input Box */}
            <div className="bg-[#181a20] border border-white/10 rounded-lg p-1.5 flex items-center justify-between gap-1 h-14">
              <button
                type="button"
                onClick={() => { soundFx.playClick(); handleAmountChange(amountNum - 0.01); }}
                className="w-5 h-5 rounded bg-[#0d1117] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer shrink-0 transition-colors"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>

              <div className="flex-1 text-center font-sans min-w-0">
                <div className="text-[9px] text-zinc-400 font-sans truncate leading-none mb-0.5">Amt ({activePair.baseAsset})</div>
                <input
                  type="number"
                  step="0.0001"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    const val = parseFloat(e.target.value) || 0;
                    setSliderPct(Math.min(100, Math.round((val / effectiveMax) * 100)));
                  }}
                  placeholder="0.00"
                  className="w-full bg-transparent text-center text-white font-bold text-xs focus:outline-none font-sans leading-tight"
                />
              </div>

              <button
                type="button"
                onClick={() => { soundFx.playClick(); handleAmountChange(amountNum + 0.01); }}
                className="w-5 h-5 rounded bg-[#0d1117] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer shrink-0 transition-colors"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Amount Slider & Preset Buttons */}
            <div className="bg-[#181a20] border border-white/10 rounded-lg p-1.5 flex flex-col justify-between h-14 gap-1">
              <div className="flex items-center justify-between text-[9px] text-zinc-400 font-sans leading-none">
                <span>Slider</span>
                <span className="text-[#00c076] font-bold">{sliderPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPct}
                onChange={handleSliderChange}
                className="w-full accent-[#00c076] cursor-pointer h-1 bg-[#0d1117] rounded"
              />
              <div className="grid grid-cols-4 gap-0.5">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyPercentage(pct)}
                    className={`py-0.5 rounded text-[9px] font-sans font-bold transition-colors cursor-pointer border ${
                      sliderPct === pct 
                        ? 'bg-[#00c076]/20 text-[#00c076] border-[#00c076]/40' 
                        : 'bg-[#0d1117] text-zinc-400 hover:text-zinc-200 border-white/10'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Total Box */}
          <div className="bg-[#181a20] border border-white/10 rounded-lg p-1.5 flex items-center justify-between gap-1 h-10">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                const newTotal = Math.max(0, totalValue - 100);
                handleAmountChange(newTotal / priceNum);
              }}
              className="w-5 h-5 rounded bg-[#0d1117] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer shrink-0 transition-colors"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>

            <div className="flex-1 text-center font-sans min-w-0">
              <div className="text-[9px] text-zinc-400 font-sans leading-none">Total (USDT)</div>
              <div className="text-white font-bold text-xs truncate leading-tight font-sans">
                {formatCurrency(totalValue)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                const newTotal = totalValue + 100;
                handleAmountChange(newTotal / priceNum);
              }}
              className="w-5 h-5 rounded bg-[#0d1117] hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer shrink-0 transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* 5. Available Balance */}
          <div className="flex items-center justify-between text-[10px] px-1 text-zinc-400">
            <span>Avail:</span>
            <div className="flex items-center gap-1.5 font-sans font-medium text-zinc-300">
              <span>{formatCurrency(availableUSDT)}</span>
              <span className="text-zinc-600">|</span>
              <span>{availableAsset.toFixed(activePair.amountPrecision)} {activePair.baseAsset}</span>
            </div>
          </div>

          {/* 6. Separate Buy & Sell Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              disabled={amountNum <= 0}
              onClick={() => handleOrderSubmit('buy')}
              className="order-btn-buy py-2.5 rounded-lg font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 bg-[#00c076] hover:bg-[#00d080] text-white border border-[#00c076]/40 shadow-[0_0_15px_rgba(0,192,118,0.25)] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:border-transparent disabled:shadow-none"
            >
              Buy {activePair.baseAsset}
            </button>
            <button
              type="button"
              disabled={amountNum <= 0}
              onClick={() => handleOrderSubmit('sell')}
              className="order-btn-sell py-2.5 rounded-lg font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 bg-[#f6465d] hover:bg-[#ff526a] text-white border border-[#f6465d]/40 shadow-[0_0_15px_rgba(246,70,93,0.25)] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:border-transparent disabled:shadow-none"
            >
              Sell {activePair.baseAsset}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
