import React, { useState } from 'react';
import { TradingPair, Portfolio } from '../types';
import { formatCurrency, formatCompactNumber, formatNumber } from '../utils/calc';
import { 
  ChevronDown, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  RotateCw,
  Star,
  Bell,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface HeaderProps {
  activePair: TradingPair;
  portfolio: Portfolio;
  onOpenPairModal: () => void;
  onOpenFaucetModal: () => void;
  onToggleAiAnalyst: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeSubTab?: string;
  onSelectSubTab?: (tab: string) => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePair,
  portfolio,
  onOpenPairModal,
  onOpenFaucetModal,
  onToggleAiAnalyst,
  soundEnabled,
  onToggleSound,
  activeSubTab = 'Chart',
  onSelectSubTab,
  onGoHome,
}) => {
  const [isStarred, setIsStarred] = useState(true);
  const [currentSubTab, setCurrentSubTab] = useState(activeSubTab);
  const isPositive = activePair.change24h >= 0;

  const handleSubTabClick = (tab: string) => {
    soundFx.playClick();
    setCurrentSubTab(tab);
    if (onSelectSubTab) onSelectSubTab(tab);
  };

  return (
    <div className="bg-[#050508]/90 backdrop-blur-xl border-b border-white/10 select-none text-zinc-100 shrink-0 z-40">
      {/* 1. Top Bar */}
      <header className="h-12 px-3 flex items-center justify-between border-b border-white/5">
        {/* Left: Back Arrow + Pair Selector Dropdown */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              if (onGoHome) onGoHome();
              else onOpenPairModal();
            }}
            className="text-zinc-300 hover:text-white transition-colors cursor-pointer p-1 -ml-1 active:scale-95"
            title="Back to Home"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-200 stroke-[2.5]" />
          </button>

          <button
            id="pair-selector-btn"
            onClick={() => {
              soundFx.playClick();
              onOpenPairModal();
            }}
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors font-sans">
              {activePair.symbol}
            </span>
            <ChevronDown className="w-4 h-4 text-zinc-300 fill-zinc-300 group-hover:text-blue-400" />
          </button>
        </div>

        {/* Right: Star, Refresh, Bell + Actions */}
        <div className="flex items-center gap-3">
          {/* Star Favorite Icon */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsStarred(!isStarred);
            }}
            className="cursor-pointer transition-transform active:scale-90"
            title="Favorite Pair"
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'}`} />
          </button>

          {/* Refresh Icon */}
          <button
            onClick={() => {
              soundFx.playClick();
            }}
            className="text-zinc-300 hover:text-white cursor-pointer active:rotate-180 transition-transform duration-300"
            title="Refresh Market Ticker"
          >
            <RotateCw className="w-4 h-4 text-zinc-200" />
          </button>

          {/* Bell Alert Icon */}
          <button
            onClick={() => {
              soundFx.playClick();
            }}
            className="text-zinc-300 hover:text-white cursor-pointer"
            title="Price Alerts"
          >
            <Bell className="w-4 h-4 text-zinc-200" />
          </button>

          {/* AI Analyst Button */}
          <button
            id="ai-analyst-btn"
            onClick={() => {
              soundFx.playClick();
              onToggleAiAnalyst();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold cursor-pointer shadow-sm shadow-blue-500/10 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Analyst</span>
          </button>

          {/* Faucet / Equity */}
          <button
            id="faucet-modal-btn"
            onClick={() => {
              soundFx.playClick();
              onOpenFaucetModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-white/10 text-xs font-mono cursor-pointer hover:border-white/20 active:scale-95 transition-all"
          >
            <Wallet className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-zinc-100 text-xs">
              ${formatCompactNumber(portfolio.usdtBalance)}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>
        </div>
      </header>

      {/* 2. Sub-Tabs Bar: Chart, Info, Parameters, Limits */}
      <div className="flex items-center gap-6 px-4 h-9 border-b border-white/5 text-sm font-semibold">
        {['Chart', 'Info', 'Parameters', 'Limits'].map((tab) => {
          const isActive = currentSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleSubTabClick(tab)}
              className={`relative py-1.5 cursor-pointer transition-colors ${
                isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200 font-medium'
              }`}
            >
              <span>{tab}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm shadow-blue-500/50" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Price & 24h Stats Header Row */}
      <div className="px-4 py-3 flex items-start justify-between gap-4 bg-transparent">
        {/* Left Column: Last price, Big Price, Equivalent $, Mark price */}
        <div className="space-y-1">
          {/* Label */}
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-sans">
            <span>Last price</span>
            <ChevronDown className="w-3 h-3 text-zinc-400 fill-zinc-400" />
          </div>

          {/* Big Bold Price */}
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">
            {formatNumber(activePair.price, activePair.precision)}
          </div>

          {/* Equivalent Price & Percentage Change */}
          <div className="flex items-center gap-2 text-xs font-mono font-medium">
            <span className="text-zinc-300 font-sans">≈ ${formatNumber(activePair.price, 2)}</span>
            <span className={`font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>
              {isPositive ? '+' : ''}{activePair.change24h.toFixed(2)}%
            </span>
          </div>

          {/* Mark Price */}
          <div className="text-[11px] text-zinc-400 font-sans pt-0.5">
            Mark price <span className="text-zinc-200 font-medium font-mono ml-1">{formatNumber(activePair.price, activePair.precision)}</span>
          </div>
        </div>

        {/* Right Column: Stacked 24h metrics (24h high, 24h low, 24h vol) */}
        <div className="text-right space-y-1 text-xs font-mono pt-1">
          <div className="flex items-center justify-end gap-3 text-[11px]">
            <span className="text-zinc-400 font-sans">24h high</span>
            <span className="text-zinc-100 font-semibold">{formatNumber(activePair.high24h, activePair.precision)}</span>
          </div>

          <div className="flex items-center justify-end gap-3 text-[11px]">
            <span className="text-zinc-400 font-sans">24h low</span>
            <span className="text-zinc-100 font-semibold">{formatNumber(activePair.low24h, activePair.precision)}</span>
          </div>

          <div className="flex items-center justify-end gap-3 text-[11px]">
            <span className="text-zinc-400 font-sans">24h vol (USDT)</span>
            <span className="text-zinc-100 font-semibold">{formatCompactNumber(activePair.volume24h)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


