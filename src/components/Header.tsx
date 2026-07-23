import React from 'react';
import { TradingPair, Portfolio } from '../types';
import { formatCurrency, formatCompactNumber } from '../utils/calc';
import { 
  ChevronDown, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Activity,
  Layers,
  Zap
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
}

export const Header: React.FC<HeaderProps> = ({
  activePair,
  portfolio,
  onOpenPairModal,
  onOpenFaucetModal,
  onToggleAiAnalyst,
  soundEnabled,
  onToggleSound,
}) => {
  const isPositive = activePair.change24h >= 0;

  return (
    <header className="h-14 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-3 flex items-center justify-between select-none text-zinc-100 shrink-0 sticky top-0 z-40">
      {/* Left section: Logo & Pair selection */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 pr-2 border-r border-zinc-800/80">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-zinc-950 font-black tracking-tight shadow-md shadow-emerald-500/20 shrink-0">
            <Layers className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm font-sans bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                NEXUS
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PRO DEMO
              </span>
            </div>
            <p className="hidden sm:block text-[9px] text-zinc-400 -mt-0.5 font-sans tracking-wide">Spot & Perpetual Futures</p>
          </div>
        </div>

        {/* Active Pair Selector Trigger */}
        <button
          id="pair-selector-btn"
          onClick={() => {
            soundFx.playClick();
            onOpenPairModal();
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/80 transition-all cursor-pointer group shrink-0 shadow-sm"
        >
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="font-bold text-xs sm:text-sm font-mono tracking-tight text-zinc-100 group-hover:text-emerald-400 transition-colors">
              {activePair.symbol}
            </span>
            <span className="hidden xs:inline-block text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-mono">
              {activePair.category}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
        </button>

        {/* Mobile Price Display */}
        <div className="flex lg:hidden items-center gap-1 font-mono text-xs pl-1">
          <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${activePair.price.toFixed(activePair.precision)}
          </span>
          <span className={`text-[10px] font-medium hidden xs:inline ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            ({isPositive ? '+' : ''}{activePair.change24h.toFixed(1)}%)
          </span>
        </div>

        {/* Live Ticker Metrics (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono pl-3 border-l border-zinc-800/60">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-sans font-medium">Index Price</div>
            <div className={`font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(activePair.price, activePair.precision)}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-sans font-medium">24h Change</div>
            <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3 stroke-[2.5]" /> : <TrendingDown className="w-3 h-3 stroke-[2.5]" />}
              {isPositive ? '+' : ''}{activePair.change24h.toFixed(2)}%
            </div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-sans font-medium">24h High</div>
            <div className="text-zinc-200 font-medium">{formatCurrency(activePair.high24h, activePair.precision)}</div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-sans font-medium">24h Low</div>
            <div className="text-zinc-200 font-medium">{formatCurrency(activePair.low24h, activePair.precision)}</div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-sans font-medium">24h Volume</div>
            <div className="text-zinc-200 font-medium">${formatCompactNumber(activePair.volume24h)}</div>
          </div>
        </div>
      </div>

      {/* Right section: Wallet, AI Analyst, Sound, Faucet */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Gemini AI Analyst Button */}
        <button
          id="ai-analyst-btn"
          onClick={() => {
            soundFx.playClick();
            onToggleAiAnalyst();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm hover:shadow-emerald-500/10 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="hidden xs:inline">AI Analyst</span>
        </button>

        {/* Demo Faucet & Balance */}
        <button
          id="faucet-modal-btn"
          onClick={() => {
            soundFx.playClick();
            onOpenFaucetModal();
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono transition-all cursor-pointer group shadow-sm"
        >
          <Wallet className="w-3.5 h-3.5 text-teal-400" />
          <div className="text-left">
            <span className="text-[9px] text-zinc-400 font-sans hidden sm:block -mb-0.5 font-medium">Equity</span>
            <span className="font-bold text-zinc-100 group-hover:text-teal-300 text-xs">
              {formatCompactNumber(portfolio.usdtBalance)}
            </span>
          </div>
          <RefreshCw className="w-3 h-3 text-zinc-400 group-hover:rotate-180 transition-transform duration-500 ml-0.5 hidden sm:inline-block" />
        </button>

        {/* Audio FX Toggle */}
        <button
          id="sound-toggle-btn"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Audio Effects' : 'Enable Audio Effects'}
          className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 transition-colors cursor-pointer shadow-sm"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />}
        </button>
      </div>
    </header>
  );
};

