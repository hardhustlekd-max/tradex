import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  RefreshCw,
  Search,
  Scan,
  Headphones,
  LogOut,
  User,
  X
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
  activeDockTab?: string;
  user?: { email: string; name: string } | null;
  onLogout?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  pairs?: TradingPair[];
  onSelectPair?: (pair: TradingPair) => void;
  onOpenPriceAlerts?: () => void;
  activeAlertsCount?: number;
}

const UserAvatarDropdown: React.FC<{
  user?: { email: string; name: string } | null;
  onLogout?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}> = ({ user, onLogout, theme = 'dark', onToggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, []);

  const userName = user?.name || 'Pro Trader';
  const userEmail = user?.email || 'trader@tradex.io';
  const firstInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      {/* Circular Profile Picture Avatar Button - Refined Non-Distracting Design */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          soundFx.playClick();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-1 p-0.5 rounded-full hover:ring-1 hover:ring-zinc-600 transition-all cursor-pointer group focus:outline-none"
        title="User Account Menu"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs group-hover:bg-zinc-750 transition-colors">
          {firstInitial}
        </div>
        <ChevronDown className={`w-3 h-3 text-zinc-400 group-hover:text-zinc-200 transition-transform ${isOpen ? 'rotate-180 text-zinc-200' : ''}`} />
      </button>

      {/* Popover Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[990]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#181a20] border border-white/10 shadow-2xl p-3 z-[999] text-xs select-none"
            >
            {/* User Details Header */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/10 mb-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-sm flex items-center justify-center shrink-0">
                {firstInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-xs truncate leading-tight">{userName}</div>
                <div className="text-[10px] text-zinc-400 truncate">{userEmail}</div>
              </div>
            </div>

            {/* Account Status Badge */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-1 text-[10px] font-semibold text-zinc-400">
              <span className="flex items-center gap-1 text-[#00c076]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00c076] animate-pulse" />
                Demo Trader
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#00c076]/15 text-[#00c076] font-sans border border-[#00c076]/30">
                VIP 1
              </span>
            </div>

            <div className="h-px bg-white/10 my-2" />

            {/* Theme Toggle Option */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  onToggleTheme();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-white/10 text-zinc-200 hover:text-white font-semibold cursor-pointer transition-colors mb-1"
              >
                <div className="flex items-center gap-2 text-xs">
                  {theme === 'dark' ? (
                    <span className="flex items-center gap-1.5 text-[#00c076]">
                      <span className="w-2 h-2 rounded-full bg-[#00c076]" />
                      Dark Theme
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[#00c076]">
                      <span className="w-2 h-2 rounded-full bg-[#00c076]" />
                      Light Theme
                    </span>
                  )}
                </div>

                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${theme === 'light' ? 'bg-[#00c076] justify-end' : 'bg-zinc-700 justify-start'}`}>
                  <motion.div layout className="w-3 h-3 rounded-full bg-black shadow-md" />
                </div>
              </button>
            )}

            <div className="h-px bg-white/10 my-1.5" />

            {/* Logout Action Button */}
            {onLogout && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick();
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 font-semibold cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Log Out</span>
              </button>
            )}
          </motion.div>
        </>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  activeDockTab = 'futures',
  user,
  onLogout,
  theme = 'dark',
  onToggleTheme,
  pairs = [],
  onSelectPair,
  onOpenPriceAlerts,
  activeAlertsCount = 0,
}) => {
  const [isCoinSelectorOpen, setIsCoinSelectorOpen] = useState(false);
  const [coinSearch, setCoinSearch] = useState('');
  const [coinCategory, setCoinCategory] = useState<string>('All');
  const coinSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (coinSelectorRef.current && !coinSelectorRef.current.contains(event.target as Node)) {
        setIsCoinSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, []);

  const [isStarred, setIsStarred] = useState(true);
  const [currentSubTab, setCurrentSubTab] = useState(activeSubTab);
  const isPositive = activePair.change24h >= 0;
  const isTradingView = activeDockTab === 'futures' || activeDockTab === 'trade';

  const handleSubTabClick = (tab: string) => {
    soundFx.playClick();
    setCurrentSubTab(tab);
    if (onSelectSubTab) onSelectSubTab(tab);
  };

  const hotCoin = React.useMemo(() => {
    if (!pairs || pairs.length === 0) return { symbol: 'BTC/USDT', change24h: 3.4 };
    const sorted = [...pairs].sort((a, b) => (b.change24h || 0) - (a.change24h || 0));
    return sorted[0] || { symbol: 'BTC/USDT', change24h: 3.4 };
  }, [pairs]);

  return (
    <div className="bg-[#0d1117] border-b border-white/10 select-none text-zinc-100 shrink-0 z-[60] w-full max-w-full sticky top-0 left-0 right-0 m-0 p-0">
      {/* 1. Unified Top Navbar across all pages (Home, Markets, Trading, Assets, etc.) */}
      <header className="h-12 px-3 sm:px-4 flex items-center justify-between gap-2 border-b border-white/5 w-full max-w-full">
        {/* Left: Brand Logo (Click returns to Home) */}
        <div
          onClick={() => {
            soundFx.playClick();
            if (onGoHome) onGoHome();
          }}
          className="flex items-center gap-2 cursor-pointer shrink-0 active:scale-95 transition-transform"
          title="Home"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00c076]/20 border border-[#00c076]/40 flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-4 h-4 text-[#00c076]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 12l10 10 10-10L12 2zm0 4.5l5.5 5.5L12 17.5 6.5 12 12 6.5z"/>
              </svg>
            </div>
            <span className="font-black text-white nexus-logo-text text-base tracking-wider font-sans">NEXUS</span>
          </div>
        </div>

        {/* Center: Search Bar with Muted Placeholder Text (Hidden on Assets Page) */}
        {activeDockTab !== 'assets' ? (
          <div
            onClick={() => {
              soundFx.playClick();
              onOpenPairModal();
            }}
            className="flex-1 min-w-0 bg-[#161b22] border border-white/10 h-8 rounded-full px-3 flex items-center gap-2 text-zinc-400 text-xs shadow-inner hover:border-[#00c076]/40 transition-colors cursor-pointer max-w-md mx-2"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="flex items-center gap-1.5 text-zinc-400 font-normal text-xs truncate min-w-0">
              <span>Search market</span>
              <span className="text-zinc-500 font-normal text-[11px] truncate hidden sm:inline">
                • HOT: {hotCoin.symbol} {hotCoin.change24h >= 0 ? '+' : ''}{hotCoin.change24h.toFixed(1)}%
              </span>
            </span>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right: Header Quick Icons */}
        <div className="flex items-center gap-1 sm:gap-2 text-white shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenPairModal();
            }}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-[#00c076] transition-colors active:scale-95"
            title="Markets / Pair Selector"
          >
            <Scan className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              if (onOpenPriceAlerts) onOpenPriceAlerts();
            }}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-[#00c076] transition-colors relative active:scale-95"
            title="Custom Price Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 ? (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#00c076] text-black font-extrabold text-[9px] shadow-sm">
                {activeAlertsCount}
              </span>
            ) : (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00c076]/60 shadow-sm" />
            )}
          </button>

          {isTradingView && (
            <button
              id="ai-analyst-btn"
              onClick={() => {
                soundFx.playClick();
                onToggleAiAnalyst();
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00c076]/15 hover:bg-[#00c076]/25 text-[#00c076] border border-[#00c076]/35 text-[10px] sm:text-[11px] font-semibold cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              <Sparkles className="w-3 h-3 text-[#00c076]" />
              <span className="hidden md:inline">AI Analyst</span>
            </button>
          )}

          {user && (
            <div className="pl-1 border-l border-white/10">
              <UserAvatarDropdown user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />
            </div>
          )}
        </div>
      </header>

      {/* 2. Price & 24h Stats Header Row (Shown on Trading View) */}
      {isTradingView && (
        <div className="px-3 py-1.5 flex items-center justify-between gap-3 bg-transparent">
          {/* Left Column: Coin Selector, Big Price (colored by trend), Rounded Price + Percent Change */}
          <div className="space-y-0.5">
            {/* Top: Clean Coin Selector (No button border/bg style) */}
            <div className="relative" ref={coinSelectorRef}>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsCoinSelectorOpen(!isCoinSelectorOpen);
                }}
                className="flex items-center gap-1.5 text-zinc-100 hover:text-white text-xs sm:text-sm font-extrabold cursor-pointer transition-colors shrink-0 font-sans group py-0.5"
                title="Select Trading Pair"
              >
                <span className="tracking-tight text-white font-extrabold">{activePair.symbol}</span>
                <span className="px-1 py-0.2 rounded bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-[9px] font-mono font-bold">
                  PERP
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform duration-200 ${isCoinSelectorOpen ? 'rotate-180 text-[#00c076]' : ''}`} />
              </button>

              {/* Compact Redesigned Coin Selector Popover */}
              <AnimatePresence>
                {isCoinSelectorOpen && (
                  <>
                    <div className="fixed inset-0 z-[90] bg-black/50" onClick={() => setIsCoinSelectorOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.1, ease: 'easeOut' }}
                      className="absolute left-0 mt-2 w-72 sm:w-80 md:w-96 rounded-2xl bg-[#181a20] border border-white/10 shadow-2xl p-3 z-[100] text-xs font-sans text-zinc-100"
                    >
                    {/* Search box */}
                    <div className="relative mb-2 shrink-0">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#00c076]" />
                      <input
                        type="text"
                        value={coinSearch}
                        onChange={(e) => setCoinSearch(e.target.value)}
                        placeholder="Search market symbol..."
                        className="w-full pl-8 pr-7 py-2 bg-[#161b22] border border-white/10 focus:border-[#00c076] rounded-lg text-[11px] text-zinc-100 focus:outline-none"
                      />
                      {coinSearch && (
                        <button
                          onClick={() => setCoinSearch('')}
                          className="absolute right-2 top-2 p-0.5 hover:text-white text-zinc-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Categories row */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 mb-2 border-b border-white/10 shrink-0">
                      {['All', 'Layer 1', 'DeFi', 'AI'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            soundFx.playClick();
                            setCoinCategory(cat);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all whitespace-nowrap ${
                            coinCategory === cat
                              ? 'bg-[#00c076] text-white font-extrabold'
                              : 'bg-[#161b22] text-zinc-400 border border-white/5 hover:text-zinc-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Pairs List */}
                    <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                      {pairs
                        .filter((p) => {
                          const matchesSearch = p.symbol.toLowerCase().includes(coinSearch.toLowerCase()) || p.baseAsset.toLowerCase().includes(coinSearch.toLowerCase());
                          const matchesCategory = coinCategory === 'All' || p.category === coinCategory;
                          return matchesSearch && matchesCategory;
                        })
                        .map((pair) => {
                          const isActive = pair.symbol === activePair.symbol;
                          const isPairPositive = pair.change24h >= 0;
                          return (
                            <div
                              key={pair.symbol}
                              onClick={() => {
                                soundFx.playClick();
                                if (onSelectPair) onSelectPair(pair);
                                setIsCoinSelectorOpen(false);
                              }}
                              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                                isActive ? 'bg-white/10 border border-white/15 font-bold text-white' : 'hover:bg-white/5'
                              }`}
                            >
                              {/* Left: Symbol + Category */}
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-white text-[11px]">{pair.symbol}</span>
                                  <span className="text-[8px] px-1 py-0.1 rounded bg-white/5 text-zinc-400 border border-white/10 uppercase font-sans">
                                    {pair.category}
                                  </span>
                                </div>
                                <span className="text-[10px] text-zinc-500">{pair.baseAsset} Perpetual</span>
                              </div>

                              {/* Center Sparkline */}
                              <div className="hidden xs:block w-14 h-5">
                                <svg className="w-full h-full" viewBox="0 0 100 30">
                                  {pair.sparkline.length > 1 && (
                                    <polyline
                                      fill="none"
                                      stroke={isPairPositive ? '#00c076' : '#f6465d'}
                                      strokeWidth="2.5"
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

                              {/* Right: Price + Change */}
                              <div className="text-right flex flex-col font-sans">
                                <span className="text-white text-[11px] font-bold">{formatNumber(pair.price, pair.precision)}</span>
                                <span className={`text-[10px] font-bold ${isPairPositive ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                                  {isPairPositive ? '+' : ''}{pair.change24h.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </motion.div>
                </>
                )}
              </AnimatePresence>
            </div>

            {/* Main Price directly under coin selector button, with text color changing based on trend */}
            <div className={`text-xl sm:text-2xl font-black tracking-tight font-sans ${isPositive ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
              {formatNumber(activePair.price, activePair.precision)}
            </div>

            {/* Sub-line under price: Rounded price text with price percentage text next to it */}
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-sans flex-wrap">
              <span className="font-sans text-zinc-300">≈ {formatNumber(activePair.price, 2)}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-sans ${isPositive ? 'text-[#00c076] bg-[#00c076]/10' : 'text-[#f6465d] bg-[#f6465d]/10'}`}>
                {isPositive ? '+' : ''}{activePair.change24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Right Column: Stacked 24h metrics (24h high, 24h low, 24h vol) */}
          <div className="text-right space-y-0.5 text-[11px] font-sans">
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
      )}
    </div>
  );
};


