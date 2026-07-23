import React, { useState } from 'react';
import { TradingPair, MarketCategory } from '../types';
import { formatCurrency, formatCompactNumber } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { Search, X, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

interface PairSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pairs: TradingPair[];
  activeSymbol: string;
  onSelectPair: (pair: TradingPair) => void;
}

export const PairSelectorModal: React.FC<PairSelectorModalProps> = ({
  isOpen,
  onClose,
  pairs,
  activeSymbol,
  onSelectPair,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('All');

  if (!isOpen) return null;

  const categories: MarketCategory[] = ['All', 'Layer 1', 'DeFi', 'AI'];

  const filteredPairs = pairs.filter((p) => {
    const matchesSearch = p.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || p.baseAsset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-mono text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2">
            <span>Select Trading Market</span>
            <span className="text-xs font-normal text-zinc-400">({filteredPairs.length} Pairs)</span>
          </h2>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-zinc-800/80 space-y-3 bg-zinc-900/40">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search coin name (e.g. BTC, SOL, ETH)..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCategory === cat ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pairs Table */}
        <div className="flex-1 overflow-y-auto p-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] text-zinc-400">
                <th className="p-2.5">Pair</th>
                <th className="p-2.5 text-right">Last Price</th>
                <th className="p-2.5 text-right">24h Change</th>
                <th className="p-2.5 text-right">24h Volume</th>
                <th className="p-2.5 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredPairs.map((pair) => {
                const isActive = pair.symbol === activeSymbol;
                const isPositive = pair.change24h >= 0;

                return (
                  <tr
                    key={pair.symbol}
                    onClick={() => {
                      soundFx.playClick();
                      onSelectPair(pair);
                      onClose();
                    }}
                    className={`hover:bg-zinc-900/80 cursor-pointer transition-colors ${
                      isActive ? 'bg-zinc-900/90 font-bold border-l-2 border-emerald-400' : ''
                    }`}
                  >
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100">{pair.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                          {pair.category}
                        </span>
                      </div>
                    </td>

                    <td className="p-2.5 text-right font-mono text-zinc-200">
                      {formatCurrency(pair.price, pair.precision)}
                    </td>

                    <td className={`p-2.5 text-right font-mono font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{pair.change24h.toFixed(2)}%
                    </td>

                    <td className="p-2.5 text-right font-mono text-zinc-400">
                      ${formatCompactNumber(pair.volume24h)}
                    </td>

                    <td className="p-2.5 text-center">
                      <div className="w-16 h-6 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 100 30">
                          {pair.sparkline.length > 1 && (
                            <polyline
                              fill="none"
                              stroke={isPositive ? '#10b981' : '#f43f5e'}
                              strokeWidth="2"
                              points={pair.sparkline
                                .map((val, idx) => {
                                  const min = Math.min(...pair.sparkline);
                                  const max = Math.max(...pair.sparkline) || 1;
                                  const x = (idx / (pair.sparkline.length - 1)) * 100;
                                  const y = 28 - ((val - min) / (max - min || 1)) * 26;
                                  return `${x},${y}`;
                                })
                                .join(' ')}
                            />
                          )}
                        </svg>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
