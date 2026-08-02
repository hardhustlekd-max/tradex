import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Send, 
  ChevronRight,
  ArrowRightLeft,
  Star
} from 'lucide-react';
import { TradingPair, Portfolio, Position } from '../types';
import { soundFx } from '../utils/audio';
import { calculateTotalEquity } from '../utils/calc';

interface HomePageProps {
  pairs: TradingPair[];
  portfolio: Portfolio;
  positions: Position[];
  onSelectPair: (pair: TradingPair) => void;
  onNavigateToFutures: () => void;
  onOpenDeposit: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  pairs,
  portfolio,
  positions,
  onSelectPair,
  onNavigateToFutures,
  onOpenDeposit,
}) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [activeMarketTab, setActiveMarketTab] = useState<'favorites' | 'hot' | 'gainers' | 'losers' | 'vol'>('hot');
  const [favorites, setFavorites] = useState<string[]>(['BTC/USDT', 'SOL/USDT', 'ETH/USDT']);

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    if (favorites.includes(symbol)) {
      setFavorites(favorites.filter(s => s !== symbol));
    } else {
      setFavorites([...favorites, symbol]);
    }
  };

  const totalEquity = calculateTotalEquity(portfolio, positions, pairs);
  const spotBalance = portfolio.usdtBalance || 12456.89;
  const futuresBalance = positions.reduce((acc, pos) => acc + pos.margin + pos.pnl, 0);
  const earnBalance = 1250.00;
  const btcEq = (totalEquity / 69870.50).toFixed(4);

  const assetItems = [
    { base: 'BTC', name: 'Bitcoin', amount: '0.1250 BTC', price: 69870.50, pnl: '+15.89 (1.03%)', iconBg: 'bg-amber-500 text-black' },
    { base: 'ETH', name: 'Ethereum', amount: '0.9400 ETH', price: 3590.89, pnl: '-1.05%', iconBg: 'bg-indigo-600 text-white' },
    { base: 'SOL', name: 'Solana', amount: '1.3400 SOL', price: 221.70, pnl: '+4.56%', iconBg: 'bg-purple-600 text-white' },
    { base: 'USDT', name: 'Tether', amount: '150.00 USDT', price: 1.00, pnl: '0.00%', iconBg: 'bg-emerald-600 text-white' },
  ];

  // Map market display pairs from pairs prop
  const displayPairs = pairs.filter((p) => {
    if (activeMarketTab === 'favorites') return favorites.includes(p.symbol);
    if (activeMarketTab === 'gainers') return p.change24h > 0;
    if (activeMarketTab === 'losers') return p.change24h < 0;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0d1117] dark:bg-[#0d1117] text-zinc-100 font-sans px-3 sm:px-4 pt-2 pb-24 max-w-4xl mx-auto w-full select-none relative">
      
      {/* 1. Total Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#181a20] p-3.5 sm:p-4 mb-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium mb-1">
              <span>Total Balance</span>
              <button 
                onClick={() => { soundFx.playClick(); setHideBalance(!hideBalance); }}
                className="hover:text-zinc-200 cursor-pointer transition-colors"
              >
                {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
                {hideBalance ? '••••••' : totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-[#00c076]">USD</span>
            </div>

            <div className="text-xs text-zinc-400 font-medium font-sans">
              ≈ {hideBalance ? '••••' : btcEq} BTC
            </div>
          </div>

          <div className="text-right text-[11px] text-zinc-300 space-y-1 bg-black/40 px-3 py-2 rounded-xl">
            <div className="flex justify-between gap-3">
              <span className="text-zinc-400">Spot</span>
              <span className="font-bold text-white">{spotBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-zinc-400">Futures</span>
              <span className="font-bold text-white">{futuresBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-zinc-400">Earn</span>
              <span className="font-bold text-[#00c076]">{earnBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="absolute right-2 bottom-2 w-32 h-16 pointer-events-none opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 40">
            <path
              d="M 0 32 L 15 28 L 30 35 L 45 22 L 60 28 L 75 12 L 90 18 L 100 6"
              fill="none"
              stroke="#00c076"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 2. Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-2.5 mb-3.5">
        <button
          onClick={() => { soundFx.playClick(); onOpenDeposit(); }}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#181a20] hover:bg-[#202630] transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[#00c076]/15 text-[#00c076] flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownToLine className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-200">Deposit</span>
        </button>

        <button
          onClick={() => { soundFx.playClick(); onNavigateToFutures(); }}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#181a20] hover:bg-[#202630] transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[#00c076]/15 text-[#00c076] flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-200">Trade</span>
        </button>

        <button
          onClick={() => { soundFx.playClick(); onOpenDeposit(); }}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#181a20] hover:bg-[#202630] transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[#00c076]/15 text-[#00c076] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Send className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-200">Send</span>
        </button>

        <button
          onClick={() => { soundFx.playClick(); onOpenDeposit(); }}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#181a20] hover:bg-[#202630] transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[#00c076]/15 text-[#00c076] flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpFromLine className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-200">Withdraw</span>
        </button>
      </div>

      {/* 3. Markets & Favorites Section */}
      <div className="mb-4">
        {/* Binance Mobile Tab Headers */}
        <div className="flex items-center justify-between border-b border-white/10 mb-3 pb-0.5">
          <div className="flex items-center gap-5 overflow-x-auto no-scrollbar pt-1">
            <button
              onClick={() => { soundFx.playClick(); setActiveMarketTab('favorites'); }}
              className={`cursor-pointer transition-colors pb-2 flex items-center gap-1.5 text-xs font-bold shrink-0 relative ${
                activeMarketTab === 'favorites' 
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#00c076] after:rounded-full' 
                  : 'text-[#848e9c] hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${activeMarketTab === 'favorites' ? 'text-[#00c076] fill-[#00c076]' : 'text-[#848e9c]'}`} />
              <span>Favorites</span>
            </button>
            <button
              onClick={() => { soundFx.playClick(); setActiveMarketTab('hot'); }}
              className={`cursor-pointer transition-colors pb-2 text-xs font-bold shrink-0 relative ${
                activeMarketTab === 'hot' 
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#00c076] after:rounded-full' 
                  : 'text-[#848e9c] hover:text-white'
              }`}
            >
              Hot
            </button>
            <button
              onClick={() => { soundFx.playClick(); setActiveMarketTab('gainers'); }}
              className={`cursor-pointer transition-colors pb-2 text-xs font-bold shrink-0 relative ${
                activeMarketTab === 'gainers' 
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#00c076] after:rounded-full' 
                  : 'text-[#848e9c] hover:text-white'
              }`}
            >
              Gainers
            </button>
            <button
              onClick={() => { soundFx.playClick(); setActiveMarketTab('losers'); }}
              className={`cursor-pointer transition-colors pb-2 text-xs font-bold shrink-0 relative ${
                activeMarketTab === 'losers' 
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#00c076] after:rounded-full' 
                  : 'text-[#848e9c] hover:text-white'
              }`}
            >
              Losers
            </button>
            <button
              onClick={() => { soundFx.playClick(); setActiveMarketTab('vol'); }}
              className={`cursor-pointer transition-colors pb-2 text-xs font-bold shrink-0 relative ${
                activeMarketTab === 'vol' 
                  ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#00c076] after:rounded-full' 
                  : 'text-[#848e9c] hover:text-white'
              }`}
            >
              24h Vol
            </button>
          </div>

          <button 
            onClick={() => { soundFx.playClick(); onNavigateToFutures(); }}
            className="text-xs text-[#848e9c] hover:text-[#00c076] flex items-center gap-1 font-semibold transition-colors shrink-0 pb-2 pl-2"
          >
            <span>More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Markets Carousel Cards */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2 mb-3">
          {displayPairs.slice(0, 6).map((pair) => {
            const isPos = pair.change24h >= 0;
            const isFav = favorites.includes(pair.symbol);
            return (
              <div
                key={pair.symbol}
                onClick={() => { soundFx.playClick(); onSelectPair(pair); onNavigateToFutures(); }}
                className="min-w-[145px] flex-1 bg-[#181a20] rounded-xl p-3 hover:bg-[#202630] transition-all cursor-pointer group shrink-0 relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-white group-hover:text-[#00c076] transition-colors">{pair.symbol}</span>
                  </div>
                  <button 
                    onClick={(e) => toggleFavorite(pair.symbol, e)}
                    className="text-zinc-500 hover:text-[#00c076] transition-colors p-0.5"
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'text-[#00c076] fill-[#00c076]' : ''}`} />
                  </button>
                </div>

                <div className="font-bold text-sm text-white mb-1">
                  {pair.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPos ? 'text-[#00c076] bg-[#00c076]/15' : 'text-[#f6465d] bg-[#f6465d]/15'}`}>
                    {isPos ? '+' : ''}{pair.change24h.toFixed(2)}%
                  </span>
                </div>

                {/* SVG Sparkline with Area Fill */}
                <div className="w-full h-6">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={`grad-${pair.symbol.replace('/', '-')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPos ? '#00c076' : '#f6465d'} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={isPos ? '#00c076' : '#f6465d'} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={isPos 
                        ? "M 0 25 L 20 20 L 40 22 L 60 12 L 80 16 L 100 5 L 100 30 L 0 30 Z" 
                        : "M 0 5 L 20 12 L 40 10 L 60 22 L 80 18 L 100 28 L 100 30 L 0 30 Z"
                      }
                      fill={`url(#grad-${pair.symbol.replace('/', '-')})`}
                    />
                    <path
                      d={isPos ? "M 0 25 L 20 20 L 40 22 L 60 12 L 80 16 L 100 5" : "M 0 5 L 20 12 L 40 10 L 60 22 L 80 18 L 100 28"}
                      fill="none"
                      stroke={isPos ? "#00c076" : "#f6465d"}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Markets List Table */}
        <div className="bg-[#181a20] rounded-2xl p-2.5 space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-zinc-400 border-b border-white/5">
            <span>Name / 24h Vol</span>
            <div className="flex items-center gap-8">
              <span>Last Price</span>
              <span>24h Change</span>
            </div>
          </div>

          {displayPairs.map((pair) => {
            const isPos = pair.change24h >= 0;
            const isFav = favorites.includes(pair.symbol);
            return (
              <div
                key={pair.symbol}
                onClick={() => { soundFx.playClick(); onSelectPair(pair); onNavigateToFutures(); }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={(e) => toggleFavorite(pair.symbol, e)}
                    className="text-zinc-500 hover:text-[#00c076] transition-colors p-1"
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'text-[#00c076] fill-[#00c076]' : ''}`} />
                  </button>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-sm text-white group-hover:text-[#00c076] transition-colors">{pair.baseAsset}</span>
                      <span className="text-[10px] text-zinc-400 font-semibold">/{pair.quoteAsset}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-sans">Vol {(pair.volume24h / 1e6).toFixed(1)}M</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="font-bold text-sm text-white">{pair.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
                    <div className="text-[10px] text-zinc-400 font-sans">≈ {pair.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  </div>

                  <div className={`min-w-[72px] px-2.5 py-1.5 rounded-lg text-xs font-bold text-center text-white ${isPos ? 'bg-[#00c076]' : 'bg-[#f6465d]'}`}>
                    {isPos ? '+' : ''}{pair.change24h.toFixed(2)}%
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
