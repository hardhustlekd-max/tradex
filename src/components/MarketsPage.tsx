import React, { useState } from 'react';
import { Search, SquarePen, ArrowUpDown, Flame, Scan, Headphones, Bell } from 'lucide-react';
import { TradingPair } from '../types';
import { soundFx } from '../utils/audio';

interface MarketsPageProps {
  pairs: TradingPair[];
  onSelectPair: (pair: TradingPair) => void;
  onNavigateToFutures: () => void;
}

export const MarketsPage: React.FC<MarketsPageProps> = ({
  pairs,
  onSelectPair,
  onNavigateToFutures,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [topTab, setTopTab] = useState<'markets' | 'insights' | 'data' | 'bubbles'>('markets');
  const [subTab, setSubTab] = useState<'favorites' | 'futures' | 'tradfi' | 'spot'>('favorites');
  const [filterPill, setFilterPill] = useState<'futures' | 'tradfi' | 'spot'>('futures');
  const [sortBy, setSortBy] = useState<'pair' | 'price' | 'change'>('pair');
  const [sortAsc, setSortAsc] = useState(false);

  // Helper to format volume like 426.07K or 1.94B
  const formatVol = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toString();
  };

  // Helper to format symbol like BLUAIUSDT
  const formatSymbolName = (sym: string) => {
    return sym.replace('/', '');
  };

  // Filter & sort
  const filteredPairs = pairs.filter((p) => {
    const raw = formatSymbolName(p.symbol).toLowerCase();
    const query = searchTerm.toLowerCase().replace('/', '');
    return raw.includes(query) || p.baseAsset.toLowerCase().includes(query);
  });

  const sortedPairs = [...filteredPairs].sort((a, b) => {
    if (sortBy === 'price') {
      return sortAsc ? a.price - b.price : b.price - a.price;
    } else if (sortBy === 'change') {
      return sortAsc ? a.change24h - b.change24h : b.change24h - a.change24h;
    } else {
      return sortAsc ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
    }
  });

  const handleSort = (type: 'pair' | 'price' | 'change') => {
    soundFx.playClick();
    if (sortBy === type) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(type);
      setSortAsc(false);
    }
  };

  // Icon color helpers for pair logos
  const getLogoColor = (symbol: string) => {
    const sym = symbol.toUpperCase();
    if (sym.includes('BTC')) return 'bg-amber-500 text-black font-extrabold';
    if (sym.includes('ETH')) return 'bg-amber-600/80 text-white font-bold';
    if (sym.includes('SOL')) return 'bg-orange-500 text-white font-bold';
    if (sym.includes('BLU')) return 'bg-amber-400 text-black font-bold';
    if (sym.includes('DODO')) return 'bg-yellow-400 text-black font-bold';
    if (sym.includes('SYN')) return 'bg-amber-700/80 text-white font-bold';
    if (sym.includes('WOO')) return 'bg-zinc-800 text-zinc-200';
    if (sym.includes('OG')) return 'bg-amber-500/90 text-black font-extrabold';
    if (sym.includes('MOODENG')) return 'bg-emerald-600 text-white font-bold';
    return 'bg-zinc-800 text-zinc-200';
  };

  return (
    <div className="flex-1 bg-[#0d1117] text-[#f0f3f8] flex flex-col overflow-y-auto overflow-x-hidden select-none pb-24 font-sans relative w-full">
      <div className="max-w-5xl mx-auto w-full px-1 sm:px-6 md:px-8 flex-1 flex flex-col">
      {/* Primary Header Tabs: Markets | Insights | Data | Bubbles */}
      <div className="px-3 border-b border-white/10 flex items-center justify-between gap-2 py-1.5 text-sm font-semibold overflow-x-auto overflow-y-hidden no-scrollbar w-full max-w-full shrink-0 bg-[#0d1117] sticky top-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar min-w-0">
          <button
            onClick={() => setTopTab('markets')}
            className={`py-1.5 px-3.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              topTab === 'markets' ? 'app-tab-active' : 'app-tab-inactive'
            }`}
          >
            Markets
          </button>

          <button
            onClick={() => setTopTab('insights')}
            className={`py-1.5 px-3.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              topTab === 'insights' ? 'app-tab-active' : 'app-tab-inactive'
            }`}
          >
            Insights
          </button>

          <button
            onClick={() => setTopTab('data')}
            className={`py-1.5 px-3.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              topTab === 'data' ? 'app-tab-active' : 'app-tab-inactive'
            }`}
          >
            Data
          </button>

          <button
            onClick={() => setTopTab('bubbles')}
            className={`py-1.5 px-3.5 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              topTab === 'bubbles' ? 'app-tab-active' : 'app-tab-inactive'
            }`}
          >
            <span>Bubbles</span>
            <div className="w-2 h-2 rounded-full bg-[#00c076] animate-pulse shadow-sm shadow-[#00c076]" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="bg-[#161b22] border border-white/10 h-7 rounded-full px-2.5 flex items-center gap-1.5 text-zinc-400 text-xs shrink-0 max-w-[130px] sm:max-w-[180px]">
          <Search className="w-3 h-3 text-[#00c076] shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="bg-transparent text-[11px] font-medium text-white placeholder-zinc-500 focus:outline-none w-full min-w-0"
          />
        </div>
      </div>

      {/* 3. Secondary Subtabs: Favorites | Futures | TradFi 🔥 | Spot */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-white/5 w-full max-w-full shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium overflow-x-auto overflow-y-hidden no-scrollbar min-w-0 flex-1">
          <button
            onClick={() => setSubTab('favorites')}
            className={`px-3 py-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === 'favorites' ? 'app-subtab-active' : 'app-subtab-inactive'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setSubTab('futures')}
            className={`px-3 py-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === 'futures' ? 'app-subtab-active' : 'app-subtab-inactive'
            }`}
          >
            Futures
          </button>
          <button
            onClick={() => setSubTab('tradfi')}
            className={`px-3 py-1 flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === 'tradfi' ? 'app-subtab-active' : 'app-subtab-inactive'
            }`}
          >
            <span>TradFi</span>
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          </button>
          <button
            onClick={() => setSubTab('spot')}
            className={`px-3 py-1 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === 'spot' ? 'app-subtab-active' : 'app-subtab-inactive'
            }`}
          >
            Spot
          </button>
        </div>

        <button className="text-zinc-400 hover:text-white p-1 cursor-pointer transition-colors shrink-0">
          <SquarePen className="w-4 h-4" />
        </button>
      </div>

      {/* 5. Column Table Header */}
      <div className="px-3 sm:px-4 py-2 border-b border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-medium w-full max-w-full shrink-0">
        <button
          onClick={() => handleSort('pair')}
          className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer min-w-0 shrink"
        >
          <span className="truncate">Pair / Vol</span>
          <ArrowUpDown className="w-3 h-3 text-zinc-500 shrink-0" />
        </button>

        <div className="flex items-center gap-4 sm:gap-8 shrink-0">
          <button
            onClick={() => handleSort('price')}
            className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer"
          >
            <span>Price</span>
            <ArrowUpDown className="w-3 h-3 text-zinc-500" />
          </button>

          <button
            onClick={() => handleSort('change')}
            className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer"
          >
            <span>24h Chg</span>
            <ArrowUpDown className="w-3 h-3 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* 6. Market Pairs List */}
      <div className="divide-y divide-white/5 w-full max-w-full">
        {sortedPairs.map((pair) => {
          const formattedSym = formatSymbolName(pair.symbol);
          const isNegative = pair.change24h < 0;

          return (
            <div
              key={pair.symbol}
              onClick={() => {
                soundFx.playClick();
                onSelectPair(pair);
                onNavigateToFutures();
              }}
              className="px-3 sm:px-4 py-2.5 flex items-center justify-between hover:bg-zinc-900/40 cursor-pointer transition-colors w-full max-w-full min-w-0"
            >
              {/* Left: Icon, Symbol, 24h Vol */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-[11px] shrink-0 shadow-sm ${getLogoColor(
                    pair.symbol
                  )}`}
                >
                  {pair.baseAsset.slice(0, 3)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-white tracking-wide truncate">
                    {formattedSym}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium font-mono tabular-nums truncate">
                    Vol {formatVol(pair.volume24h)}
                  </span>
                </div>
              </div>

              {/* Right: Price & Change Pill */}
              <div className="flex items-center gap-2 sm:gap-4 text-right font-mono tabular-nums shrink-0">
                <div className="flex flex-col text-right">
                  <span className="font-extrabold text-xs text-white">
                    {pair.price >= 1000
                      ? pair.price.toLocaleString('en-US', { minimumFractionDigits: 1 })
                      : pair.price.toFixed(pair.precision)}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    ${pair.price >= 1000 ? pair.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : pair.price.toFixed(2)}
                  </span>
                </div>

                <div
                  className={`min-w-[64px] sm:min-w-[70px] py-1 px-1.5 sm:px-2 rounded-md text-[11px] font-bold text-center text-white transition-all shadow-sm shrink-0 ${
                    isNegative 
                      ? 'bg-[#f6465d] border border-red-500/30' 
                      : 'bg-[#00c076] border border-emerald-500/30'
                  }`}
                >
                  {isNegative ? '' : '+'}
                  {pair.change24h.toFixed(2)}%
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
