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
    <div className="bg-[#191e2b]/95 backdrop-blur-xl border-b border-white/10 select-none text-zinc-100 shrink-0 z-40">
      {/* 1. Top Bar */}
      <header className="h-11 px-3 flex items-center justify-between border-b border-white/5">
        {/* Left: Back Arrow + Pair Selector Dropdown + TradeX badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              if (onGoHome) onGoHome();
              else onOpenPairModal();
            }}
            className="text-zinc-300 hover:text-white transition-colors cursor-pointer p-1 -ml-1 active:scale-95 flex items-center gap-1"
            title="Back to Home"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-200 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden xs:inline-flex px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-extrabold font-mono">
              PERP
            </span>
            <button
              id="pair-selector-btn"
              onClick={() => {
                soundFx.playClick();
                onOpenPairModal();
              }}
              className="flex items-center gap-1.5 cursor-pointer group hover:bg-white/5 px-2 py-1 rounded-lg transition-all"
            >
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-amber-400 transition-colors font-sans">
                {activePair.symbol}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Right: Star, Refresh, Bell + Actions */}
        <div className="flex items-center gap-2.5">
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
            <RotateCw className="w-3.5 h-3.5 text-zinc-200" />
          </button>

          {/* Bell Alert Icon */}
          <button
            onClick={() => {
              soundFx.playClick();
            }}
            className="text-zinc-300 hover:text-white cursor-pointer"
            title="Price Alerts"
          >
            <Bell className="w-3.5 h-3.5 text-zinc-200" />
          </button>

          {/* AI Analyst Button */}
          <button
            id="ai-analyst-btn"
            onClick={() => {
              soundFx.playClick();
              onToggleAiAnalyst();
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold cursor-pointer shadow-sm shadow-blue-500/10 active:scale-95 transition-all"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>AI Analyst</span>
          </button>

          {/* Faucet / Equity */}
          <button
            id="faucet-modal-btn"
            onClick={() => {
              soundFx.playClick();
              onOpenFaucetModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-white/10 text-[11px] font-mono cursor-pointer hover:border-white/20 active:scale-95 transition-all"
          >
            <Wallet className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-zinc-100 text-[11px]">
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
      <div className="flex items-center gap-5 px-3 h-8 border-b border-white/5 text-xs font-semibold">
        {['Chart', 'Info', 'Parameters', 'Limits'].map((tab) => {
          const isActive = currentSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleSubTabClick(tab)}
              className={`relative py-1 cursor-pointer transition-colors ${
                isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200 font-medium'
              }`}
            >
              <span>{tab}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-sm shadow-amber-400/50" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Price & 24h Stats Header Row */}
      <div className="px-3 py-2 flex items-center justify-between gap-3 bg-transparent">
        {/* Left Column: Last price, Big Price, Equivalent $, Mark price */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {/* Price */}
            <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-sans">
              {formatNumber(activePair.price, activePair.precision)}
            </div>
            {/* Percentage Change */}
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
              {isPositive ? '+' : ''}{activePair.change24h.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-sans">
            <span>≈ ${formatNumber(activePair.price, 2)}</span>
            <span>•</span>
            <span>Mark {formatNumber(activePair.price, activePair.precision)}</span>
          </div>
        </div>

        {/* Right Column: Stacked 24h metrics (24h high, 24h low, 24h vol) */}
        <div className="text-right space-y-0.5 text-[11px] font-mono">
          <div className="flex items-center justify-end gap-2 text-[10px] sm:text-[11px]">
            <span className="text-zinc-400 font-sans">24h High</span>
            <span className="text-zinc-200 font-medium">{formatNumber(activePair.high24h, activePair.precision)}</span>
          </div>

          <div className="flex items-center justify-end gap-2 text-[10px] sm:text-[11px]">
            <span className="text-zinc-400 font-sans">24h Low</span>
            <span className="text-zinc-200 font-medium">{formatNumber(activePair.low24h, activePair.precision)}</span>
          </div>

          <div className="flex items-center justify-end gap-2 text-[10px] sm:text-[11px]">
            <span className="text-zinc-400 font-sans">24h Vol</span>
            <span className="text-zinc-200 font-medium">{formatCompactNumber(activePair.volume24h)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


