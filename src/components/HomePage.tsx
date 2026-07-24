import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Search, 
  Scan, 
  Headphones, 
  Bell, 
  ChevronDown, 
  Zap, 
  RefreshCw, 
  Monitor, 
  UserPlus, 
  CloudRain, 
  Gift, 
  Gamepad2, 
  LayoutGrid, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Flame,
  ChevronRight
} from 'lucide-react';
import { TradingPair } from '../types';
import { soundFx } from '../utils/audio';

interface HomePageProps {
  pairs: TradingPair[];
  onSelectPair: (pair: TradingPair) => void;
  onNavigateToFutures: () => void;
  onOpenDeposit: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  pairs,
  onSelectPair,
  onNavigateToFutures,
  onOpenDeposit,
}) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [activeMarketCategory, setActiveMarketCategory] = useState<'favorites' | 'hot' | 'new' | 'gainers' | 'losers'>('favorites');
  const [activeMarketType, setActiveMarketType] = useState<'futures' | 'tradfi' | 'spot'>('futures');

  // Custom market items list to closely match the screenshot
  const marketItems = [
    { symbol: 'BLUAIUSDT', name: 'BluAI', price: '0.011982', change: -1.59, isHot: true },
    { symbol: 'DODOUSDT', name: 'DODO', price: '0.019170', change: 0.52, isHot: false },
    { symbol: 'XRPUSDT', name: 'Ripple', price: '1.131700', change: 24.15, isHot: true },
    { symbol: 'SNDKUSDT', name: 'Sundog', price: '0.341200', change: 12.80, isHot: true },
    { symbol: 'BTCUSDT', name: 'Bitcoin', price: '94320.50', change: 3.42, isHot: false },
    { symbol: 'ETHUSDT', name: 'Ethereum', price: '3410.80', change: 5.18, isHot: false },
    { symbol: 'SOLUSDT', name: 'Solana', price: '198.40', change: -0.85, isHot: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0e11] text-[#f0f3f8] font-sans px-4 pt-3 pb-36 max-w-lg mx-auto w-full select-none relative">
      {/* Background Ambient Liquid Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-4 sticky top-0 z-20 backdrop-blur-xl bg-[#0b0e11]/80 py-2">
        {/* Profile Avatar Icon */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 p-[1.5px] flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 transition-all">
          <div className="w-full h-full rounded-full bg-[#0b0e11] flex items-center justify-center overflow-hidden">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 bg-zinc-900/80 border border-white/10 h-9 rounded-full px-3.5 flex items-center gap-2 text-zinc-400 text-xs shadow-inner">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="flex items-center gap-1 text-zinc-300 font-medium">
            <span className="text-amber-400">🔥</span> SNDK
          </span>
        </div>

        {/* Right Header Icons */}
        <div className="flex items-center gap-3 text-white">
          <button onClick={() => soundFx.playClick()} className="p-1 hover:text-amber-400 transition-colors active:scale-95">
            <Scan className="w-5 h-5" />
          </button>
          <button onClick={() => soundFx.playClick()} className="p-1 hover:text-amber-400 transition-colors active:scale-95">
            <Headphones className="w-5 h-5" />
          </button>
          <button onClick={() => soundFx.playClick()} className="p-1 hover:text-amber-400 transition-colors relative active:scale-95">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
          </button>
        </div>
      </div>

      {/* 2. Total Balance & Mini Sparkline Chart */}
      <div className="flex items-start justify-between mb-4 px-1">
        <div>
          {/* Label + Eye Toggle */}
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium mb-1">
            <span>Total Balance</span>
            <button onClick={() => setHideBalance(!hideBalance)} className="hover:text-zinc-200 cursor-pointer">
              {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Amount */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-white">
              {hideBalance ? '••••' : '2.40'}
            </span>
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-0.5">
              USDT <ChevronDown className="w-3 h-3 text-zinc-400" />
            </span>
          </div>

          {/* Profit ROI Badge */}
          <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <span>+2.3745 USDT (+32,829.11%)</span>
            <span className="text-zinc-400 font-normal ml-1">1W</span>
          </div>
        </div>

        {/* Right Sparkline SVG Chart */}
        <div className="w-24 h-12 flex flex-col items-end justify-center pt-1">
          <svg className="w-full h-10 overflow-visible" viewBox="0 0 100 40">
            {/* Dot Grid Effect */}
            <pattern id="dotGrid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.8" fill="#333333" />
            </pattern>
            <rect x="0" y="15" width="100" height="25" fill="url(#dotGrid)" />

            {/* Equity Curve line */}
            <path
              d="M 0 18 L 15 18 L 25 22 L 35 15 L 45 28 L 50 10 L 60 22 L 70 8 L 85 12 L 100 2"
              fill="none"
              stroke="#fcd535"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. Big Golden Liquid Deposit Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          onOpenDeposit();
        }}
        className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] text-black font-extrabold text-base tracking-wide shadow-lg shadow-amber-500/20 border border-yellow-300/40 transition-all cursor-pointer mb-6"
      >
        Deposit
      </button>

      {/* 4. Quick Actions Grid (2 rows x 4 columns) */}
      <div className="grid grid-cols-4 gap-y-5 gap-x-2 mb-6">
        {/* Row 1 */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => soundFx.playClick()}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-600/10 flex items-center justify-center transition-all shadow-sm active:scale-95">
            <Zap className="w-5 h-5 text-zinc-200 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-[11px] text-zinc-300 font-medium">Power-up</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => soundFx.playClick()}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-600/10 flex items-center justify-center transition-all shadow-sm active:scale-95">
            <RefreshCw className="w-5 h-5 text-zinc-200 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-[11px] text-zinc-300 font-medium">P2P</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 cursor-pointer group relative" onClick={() => soundFx.playClick()}>
          <div className="absolute -top-1.5 right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-extrabold z-10 shadow-sm">
            $50K
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-600/10 flex items-center justify-center transition-all shadow-sm active:scale-95">
            <Monitor className="w-5 h-5 text-zinc-200 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-[11px] text-zinc-300 font-medium">Tradfi</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => soundFx.playClick()}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-600/10 flex items-center justify-center transition-all shadow-sm active:scale-95">
            <UserPlus className="w-5 h-5 text-zinc-200 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-[11px] text-zinc-300 font-medium">Referral</span>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => soundFx.playClick()}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-600/10 flex items-center justify-center transition-all shadow-sm active:scale-95">
            <CloudRain className="w-5 h-5 text-zinc-200 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-[11px] text-zinc-300 font-medium">Airdrops</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => soundFx.playClick()}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-600/10 flex items-center justify-center transition-all shadow-sm active:scale-95">
            <Gift className="w-5 h-5 text-zinc-200 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-[11px] text-zinc-300 font-medium">Promotions</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 cursor-pointer group relative" onClick={() => soundFx.playClick()}>
          <div className="absolute -top-1.5 right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[9px] font-extrabold z-10 shadow-sm">
            New
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-600/10 flex items-center justify-center transition-all shadow-sm active:scale-95">
            <Gamepad2 className="w-5 h-5 text-zinc-200 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-[11px] text-zinc-300 font-medium">Poker</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => soundFx.playClick()}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-600/10 flex items-center justify-center transition-all shadow-sm active:scale-95">
            <LayoutGrid className="w-5 h-5 text-zinc-200 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-[11px] text-zinc-300 font-medium">More</span>
        </div>
      </div>

      {/* 5. Promotional Hero Banner Card */}
      <div className="liquid-card rounded-2xl p-4 flex items-center justify-between gap-3 mb-6 cursor-pointer border border-white/10 hover:border-blue-500/30 transition-all">
        {/* Left Graphic Badge */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30 flex items-center justify-center relative shrink-0 overflow-hidden p-1 shadow-inner">
          <div className="text-center font-extrabold text-[10px] text-emerald-400 leading-tight">
            <span className="block text-white text-xs">NVDA</span>
            <span className="text-amber-400">TSLA</span>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Share $50K in TradFi rewards</span>
            <span className="text-zinc-500 font-mono text-[11px]">2/8</span>
          </div>
          <div className="text-sm font-bold text-white tracking-tight leading-snug">
            Trade any amount to get rewards
          </div>
        </div>
      </div>

      {/* 6. Favorites / Market Lists Section */}
      <div className="liquid-card rounded-3xl p-4 border border-white/10">
        {/* Category Header Tabs */}
        <div className="flex items-center gap-5 text-sm font-semibold border-b border-zinc-800/80 pb-3 mb-3 text-zinc-400 overflow-x-auto whitespace-nowrap no-scrollbar">
          <button
            onClick={() => setActiveMarketCategory('favorites')}
            className={`cursor-pointer transition-colors ${
              activeMarketCategory === 'favorites' ? 'text-white font-extrabold text-base' : 'hover:text-zinc-200'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveMarketCategory('hot')}
            className={`cursor-pointer transition-colors ${
              activeMarketCategory === 'hot' ? 'text-white font-extrabold text-base' : 'hover:text-zinc-200'
            }`}
          >
            Hot
          </button>
          <button
            onClick={() => setActiveMarketCategory('new')}
            className={`cursor-pointer transition-colors ${
              activeMarketCategory === 'new' ? 'text-white font-extrabold text-base' : 'hover:text-zinc-200'
            }`}
          >
            New
          </button>
          <button
            onClick={() => setActiveMarketCategory('gainers')}
            className={`cursor-pointer transition-colors ${
              activeMarketCategory === 'gainers' ? 'text-white font-extrabold text-base' : 'hover:text-zinc-200'
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setActiveMarketCategory('losers')}
            className={`cursor-pointer transition-colors ${
              activeMarketCategory === 'losers' ? 'text-white font-extrabold text-base' : 'hover:text-zinc-200'
            }`}
          >
            Losers
          </button>
        </div>

        {/* Filter Sub-Pills: [Futures] [TradFi🔥] [Spot] */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveMarketType('futures')}
            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              activeMarketType === 'futures' ? 'bg-[#2c2c2e] text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Futures
          </button>
          <button
            onClick={() => setActiveMarketType('tradfi')}
            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors flex items-center gap-0.5 ${
              activeMarketType === 'tradfi' ? 'bg-[#2c2c2e] text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>TradFi</span>
            <span>🔥</span>
          </button>
          <button
            onClick={() => setActiveMarketType('spot')}
            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              activeMarketType === 'spot' ? 'bg-[#2c2c2e] text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Spot
          </button>
        </div>

        {/* Market Items List */}
        <div className="space-y-3">
          {marketItems.map((item) => {
            const isPos = item.change >= 0;
            const matchedPair = pairs.find((p) => p.symbol === item.symbol) || pairs[0];

            return (
              <div
                key={item.symbol}
                onClick={() => {
                  soundFx.playClick();
                  onSelectPair(matchedPair);
                  onNavigateToFutures();
                }}
                className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-zinc-900/50 px-2 rounded-xl transition-colors"
              >
                {/* Left: Icon + Symbol */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                    {item.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white tracking-tight">{item.symbol}</div>
                    <div className="text-[11px] text-zinc-400">{item.name}</div>
                  </div>
                </div>

                {/* Right: Price + Percentage Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-right font-mono font-bold text-sm text-white">
                    {item.price}
                  </div>

                  <div
                    className={`w-20 py-1.5 rounded-lg text-center font-bold text-xs font-mono text-white ${
                      isPos ? 'bg-[#00c076]' : 'bg-[#f6465d]'
                    }`}
                  >
                    {isPos ? '+' : ''}{item.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
