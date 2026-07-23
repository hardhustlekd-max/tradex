import React, { useState } from 'react';
import { Search, SquarePen, ArrowUpDown, Flame } from 'lucide-react';
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
    if (sym.includes('BTC')) return 'bg-amber-500 text-white';
    if (sym.includes('ETH')) return 'bg-indigo-600 text-white';
    if (sym.includes('SOL')) return 'bg-teal-500 text-white';
    if (sym.includes('BLU')) return 'bg-sky-500 text-white';
    if (sym.includes('DODO')) return 'bg-yellow-400 text-black';
    if (sym.includes('SYN')) return 'bg-purple-600 text-white';
    if (sym.includes('WOO')) return 'bg-slate-700 text-white';
    if (sym.includes('OG')) return 'bg-blue-600 text-white';
    if (sym.includes('MOODENG')) return 'bg-emerald-600 text-white';
    return 'bg-zinc-800 text-zinc-200';
  };

  return (
    <div className="flex-1 bg-[#000000] text-white flex flex-col overflow-y-auto select-none pb-36 font-sans">
      {/* 1. Top Search Bar */}
      <div className="px-3 pt-3 pb-1">
        <div className="bg-[#18181b] border border-zinc-800/60 rounded-full px-3.5 py-2 flex items-center gap-2 text-sm text-zinc-300">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔥 SNDK"
            className="bg-transparent text-xs font-medium text-white placeholder-zinc-500 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* 2. Primary Header Tabs: Markets | Insights | Data | Bubbles */}
      <div className="px-4 border-b border-zinc-900 flex items-center gap-6 pt-2 text-base font-medium">
        <button
          onClick={() => setTopTab('markets')}
          className={`pb-2 transition-colors relative cursor-pointer ${
            topTab === 'markets' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Markets
          {topTab === 'markets' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full" />
          )}
        </button>

        <button
          onClick={() => setTopTab('insights')}
          className={`pb-2 transition-colors cursor-pointer ${
            topTab === 'insights' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Insights
        </button>

        <button
          onClick={() => setTopTab('data')}
          className={`pb-2 transition-colors cursor-pointer ${
            topTab === 'data' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Data
        </button>

        <button
          onClick={() => setTopTab('bubbles')}
          className={`pb-2 transition-colors flex items-center gap-1 cursor-pointer ${
            topTab === 'bubbles' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Bubbles</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* 3. Secondary Tabs: Favorites | Futures | TradFi 🔥 | Spot */}
      <div className="px-4 pt-3 flex items-center gap-5 text-sm font-medium">
        <button
          onClick={() => setSubTab('favorites')}
          className={`cursor-pointer transition-colors ${
            subTab === 'favorites' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Favorites
        </button>
        <button
          onClick={() => setSubTab('futures')}
          className={`cursor-pointer transition-colors ${
            subTab === 'futures' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Futures
        </button>
        <button
          onClick={() => setSubTab('tradfi')}
          className={`flex items-center gap-1 cursor-pointer transition-colors ${
            subTab === 'tradfi' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>TradFi</span>
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
        </button>
        <button
          onClick={() => setSubTab('spot')}
          className={`cursor-pointer transition-colors ${
            subTab === 'spot' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Spot
        </button>
      </div>

      {/* 4. Filter Pills Row & Edit Icon */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPill('futures')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              filterPill === 'futures'
                ? 'bg-[#1c1c1e] text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Futures
          </button>

          <button
            onClick={() => setFilterPill('tradfi')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              filterPill === 'tradfi'
                ? 'bg-[#1c1c1e] text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            TradFi
          </button>

          <button
            onClick={() => setFilterPill('spot')}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              filterPill === 'spot'
                ? 'bg-[#1c1c1e] text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Spot
          </button>
        </div>

        <button className="text-zinc-400 hover:text-white p-1 cursor-pointer transition-colors">
          <SquarePen className="w-4 h-4" />
        </button>
      </div>

      {/* 5. Column Table Header */}
      <div className="px-4 py-2 border-b border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
        <button
          onClick={() => handleSort('pair')}
          className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer"
        >
          <span>Pair | 24h Vol</span>
          <ArrowUpDown className="w-3 h-3 text-zinc-500" />
        </button>

        <div className="flex items-center gap-10">
          <button
            onClick={() => handleSort('price')}
            className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer"
          >
            <span>Price</span>
            <ArrowUpDown className="w-3 h-3 text-zinc-500" />
          </button>

          <button
            onClick={() => handleSort('change')}
            className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer pr-2"
          >
            <span>Change</span>
            <ArrowUpDown className="w-3 h-3 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* 6. Market Pairs List */}
      <div className="divide-y divide-zinc-900/60">
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
              className="px-4 py-3 flex items-center justify-between hover:bg-zinc-900/40 cursor-pointer transition-colors"
            >
              {/* Left: Icon, Symbol, 24h Vol */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getLogoColor(
                    pair.symbol
                  )}`}
                >
                  {pair.baseAsset.slice(0, 3)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-white tracking-wide">
                    {formattedSym}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {formatVol(pair.volume24h)}
                  </span>
                </div>
              </div>

              {/* Right: Price & Change Pill */}
              <div className="flex items-center gap-5 text-right">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-white font-mono">
                    {pair.price >= 1000
                      ? pair.price.toLocaleString('en-US', { minimumFractionDigits: 1 })
                      : pair.price.toFixed(pair.precision)}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    ${pair.price >= 1000 ? pair.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : pair.price.toFixed(2)}
                  </span>
                </div>

                <div
                  className={`min-w-[76px] py-1.5 px-2.5 rounded-lg text-xs font-bold text-center text-white transition-all ${
                    isNegative ? 'bg-[#f6465d]' : 'bg-[#0ecb81]'
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
  );
};
