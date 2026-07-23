import React from 'react';
import { TradingPair, Portfolio } from '../types';
import { formatCurrency, formatNumber, formatCompactNumber } from '../utils/calc';
import { 
  ChevronDown, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck,
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
    <header className="h-14 bg-zinc-950 border-b border-zinc-800/80 px-3 flex items-center justify-between select-none text-zinc-100 shrink-0">
      {/* Left section: Logo & Pair selection */}
      <div className="flex items-center gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 pr-2 border-r border-zinc-800/80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-zinc-950 font-bold font-mono tracking-tighter shadow-sm shadow-emerald-500/20">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-sm font-sans bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                NEXUS
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800/80 text-emerald-400 border border-emerald-500/30">
                PRO DEMO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 -mt-0.5 font-mono">Spot & Futures</p>
          </div>
        </div>

        {/* Active Pair Selector Trigger */}
        <button
          id="pair-selector-btn"
          onClick={() => {
            soundFx.playClick();
            onOpenPairModal();
          }}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm font-mono tracking-tight text-zinc-100 group-hover:text-emerald-400 transition-colors">
              {activePair.symbol}
            </span>
            <span className="text-xs px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
              {activePair.category}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
        </button>

        {/* Live Ticker Metrics */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono pl-2 border-l border-zinc-800/50">
          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Price</div>
            <div className={`font-semibold text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(activePair.price, activePair.precision)}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">24h Change</div>
            <div className={`flex items-center gap-1 font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{activePair.change24h.toFixed(2)}%
            </div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">24h High</div>
            <div className="text-zinc-200">{formatCurrency(activePair.high24h, activePair.precision)}</div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">24h Low</div>
            <div className="text-zinc-200">{formatCurrency(activePair.low24h, activePair.precision)}</div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">24h Volume</div>
            <div className="text-zinc-200">${formatCompactNumber(activePair.volume24h)}</div>
          </div>
        </div>
      </div>

      {/* Right section: Wallet, AI Analyst, Sound, Faucet */}
      <div className="flex items-center gap-2.5">
        {/* Gemini AI Analyst Button */}
        <button
          id="ai-analyst-btn"
          onClick={() => {
            soundFx.playClick();
            onToggleAiAnalyst();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all shadow-sm hover:shadow-emerald-500/10 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>AI Insight</span>
        </button>

        {/* Demo Faucet & Balance */}
        <button
          id="faucet-modal-btn"
          onClick={() => {
            soundFx.playClick();
            onOpenFaucetModal();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono transition-all cursor-pointer group"
        >
          <Wallet className="w-3.5 h-3.5 text-teal-400" />
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 block -mb-0.5">Demo Equity</span>
            <span className="font-semibold text-zinc-100 group-hover:text-teal-300">
              {formatCurrency(portfolio.usdtBalance)}
            </span>
          </div>
          <RefreshCw className="w-3 h-3 text-zinc-400 group-hover:rotate-180 transition-transform duration-500 ml-1" />
        </button>

        {/* Audio FX Toggle */}
        <button
          id="sound-toggle-btn"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Audio Effects' : 'Enable Audio Effects'}
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
        </button>
      </div>
    </header>
  );
};
