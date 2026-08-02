import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  TrendingUp,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { UserPortfolio, Position, TradingPair } from '../types';
import { soundFx } from '../utils/audio';
import { calculateTotalEquity } from '../utils/calc';

interface AssetsPageProps {
  portfolio: UserPortfolio;
  positions: Position[];
  pairs: TradingPair[];
  onOpenDeposit: () => void;
  onResetBalance?: (amount: number) => void;
  onOpenFaucet?: () => void;
}

export const AssetsPage: React.FC<AssetsPageProps> = ({
  portfolio,
  positions,
  pairs,
  onOpenDeposit,
  onResetBalance,
  onOpenFaucet,
}) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'futures' | 'copy' | 'spot' | 'funding'>('overview');

  const totalEquity = calculateTotalEquity(portfolio, positions, pairs);
  const totalPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const futuresValue = portfolio.usdtBalance + positions.reduce((acc, pos) => acc + pos.margin + pos.pnl, 0);

  let spotValue = 0;
  if (portfolio.spotBalances) {
    Object.entries(portfolio.spotBalances).forEach(([asset, val]) => {
      const amount = Number(val) || 0;
      if (amount > 0) {
        const pair = pairs.find((p) => p.baseAsset === asset && p.quoteAsset === 'USDT');
        const price = pair ? pair.price : 0;
        spotValue += amount * price;
      }
    });
  }

  return (
    <div className="flex-1 bg-[#0d1117] text-[#f0f3f8] flex flex-col overflow-y-auto select-none pb-24 font-sans relative w-full">
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 flex-1 flex flex-col space-y-3 pt-2">
        
        {/* Secondary Navigation Tabs: Overview | Futures | Copy | Spot | Funding */}
        <div className="flex items-center gap-1.5 py-1 text-xs font-semibold overflow-x-auto no-scrollbar shrink-0 bg-[#0d1117] sticky top-0 z-20 border-b border-white/5 pb-2">
          {(['overview', 'futures', 'copy', 'spot', 'funding'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab);
              }}
              className={`py-1 px-3 rounded-full transition-all capitalize whitespace-nowrap cursor-pointer text-xs ${
                activeTab === tab
                  ? 'bg-[#00c076] text-black font-extrabold shadow-xs'
                  : 'bg-[#181a20] text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Total Balance Header Card - Compact Homepage Card Style */}
        <div className="bg-[#181a20] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-xs">Total Assets</span>
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="p-0.5 hover:text-white transition-colors cursor-pointer"
                title="Toggle Balance Visibility"
              >
                {hideBalance ? <EyeOff className="w-3.5 h-3.5 text-zinc-400" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
              </button>
            </div>

            {/* Top Right Reset Button with Reset Icon */}
            <button
              onClick={() => {
                soundFx.playOrderFilled();
                if (onResetBalance) {
                  onResetBalance(100000);
                } else if (onOpenFaucet) {
                  onOpenFaucet();
                } else {
                  onOpenDeposit();
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-[#00c076]/15 hover:bg-[#00c076]/25 text-[#00c076] border border-[#00c076]/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
              title="Reset Faucet Balance to $100,000 USDT"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#00c076]" />
              <span>Reset ($100k)</span>
            </button>
          </div>

          {/* Big Balance Number */}
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
              {hideBalance ? '****' : totalEquity.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-[#00c076]">USDT</span>
          </div>

          {/* Equivalent & Live PnL pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5">
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              totalPnl >= 0 ? 'text-[#00c076] bg-[#00c076]/15' : 'text-[#f6465d] bg-[#f6465d]/15'
            }`}>
              <TrendingUp className={`w-3 h-3 ${totalPnl < 0 ? 'rotate-180' : ''}`} />
              <span>{totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(4)} USDT Today PnL</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">USDT Main Wallet</span>
          </div>
        </div>

        {/* Quick Action Grid (Buy Crypto, Deposit, Withdraw, Transfer) - Homepage compact pill style */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Buy Crypto */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenDeposit();
            }}
            className="bg-[#181a20] hover:bg-zinc-800/80 rounded-2xl p-2.5 flex flex-col items-center gap-1.5 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-[#00c076]/20 border border-[#00c076]/40 flex items-center justify-center text-[#00c076] group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-zinc-200 group-hover:text-white text-center whitespace-nowrap">
              Buy Crypto
            </span>
          </button>

          {/* Deposit */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenDeposit();
            }}
            className="bg-[#181a20] hover:bg-zinc-800/80 rounded-2xl p-2.5 flex flex-col items-center gap-1.5 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-[#00c076]/20 border border-[#00c076]/40 flex items-center justify-center text-[#00c076] group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-zinc-200 group-hover:text-white text-center whitespace-nowrap">
              Deposit
            </span>
          </button>

          {/* Withdraw */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenDeposit();
            }}
            className="bg-[#181a20] hover:bg-zinc-800/80 rounded-2xl p-2.5 flex flex-col items-center gap-1.5 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-[#00c076]/20 border border-[#00c076]/40 flex items-center justify-center text-[#00c076] group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-zinc-200 group-hover:text-white text-center whitespace-nowrap">
              Withdraw
            </span>
          </button>

          {/* Transfer */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenDeposit();
            }}
            className="bg-[#181a20] hover:bg-zinc-800/80 rounded-2xl p-2.5 flex flex-col items-center gap-1.5 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-[#00c076]/20 border border-[#00c076]/40 flex items-center justify-center text-[#00c076] group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-zinc-200 group-hover:text-white text-center whitespace-nowrap">
              Transfer
            </span>
          </button>
        </div>

        {/* Auto Earn Banner Card - Compact style */}
        <div className="bg-[#181a20] rounded-2xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00c076]/20 border border-[#00c076]/40 flex items-center justify-center text-[#00c076] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs text-white">Auto Earn Staking</span>
              <span className="text-[11px] text-zinc-400 font-medium">
                Flexible yield up to <span className="text-[#00c076] font-black">100.00%</span> APR
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenDeposit();
            }}
            className="px-3 py-1 rounded-full bg-[#00c076] hover:bg-[#00d080] text-black font-extrabold text-[11px] transition-colors cursor-pointer shrink-0"
          >
            Earn Now
          </button>
        </div>

        {/* Account Sub-Balances Section */}
        <div className="bg-[#181a20] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-sm font-extrabold text-white">Account Balances</span>
            <span className="text-[11px] text-zinc-400 font-semibold">Real-time Valuation</span>
          </div>

          <div className="divide-y divide-white/5">
            {/* Futures Account */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00c076]" />
                <span className="font-bold text-xs text-white">Futures Account</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-xs text-white block">
                  {hideBalance ? '****' : `${futuresValue.toFixed(2)} USDT`}
                </span>
              </div>
            </div>

            {/* Copy Account */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-bold text-xs text-white">Copy Trading</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-xs text-white block">
                  0.00 USDT
                </span>
              </div>
            </div>

            {/* Spot Account */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="font-bold text-xs text-white">Spot Account</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-xs text-white block">
                  {hideBalance ? '****' : `${spotValue.toFixed(2)} USDT`}
                </span>
              </div>
            </div>

            {/* Funding Account */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-bold text-xs text-white">Funding Account</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-xs text-white block">
                  0.00 USDT
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
