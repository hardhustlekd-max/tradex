import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight 
} from 'lucide-react';
import { UserPortfolio } from '../types';
import { soundFx } from '../utils/audio';

interface AssetsPageProps {
  portfolio: UserPortfolio;
  onOpenDeposit: () => void;
}

export const AssetsPage: React.FC<AssetsPageProps> = ({
  portfolio,
  onOpenDeposit,
}) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'futures' | 'copy' | 'spot' | 'funding'>('overview');

  const totalUsdt = portfolio.usdtBalance;
  const futuresUsdt = (totalUsdt * 0.995).toFixed(2);

  return (
    <div className="flex-1 bg-[#050508] text-white flex flex-col overflow-y-auto select-none pb-36 font-sans relative">
      {/* Background Ambient Liquid Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Top Navigation Bar: Overview | Futures | Copy | Spot | Funding */}
      <div className="px-4 border-b border-white/10 flex items-center gap-6 pt-3 text-base font-semibold overflow-x-auto no-scrollbar shrink-0 backdrop-blur-md bg-zinc-950/40 sticky top-0 z-20">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'overview' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm shadow-blue-500/50" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('futures')}
          className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'futures' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Futures
          {activeTab === 'futures' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm shadow-blue-500/50" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('copy')}
          className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'copy' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Copy
          {activeTab === 'copy' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm shadow-blue-500/50" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('spot')}
          className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'spot' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Spot
          {activeTab === 'spot' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm shadow-blue-500/50" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('funding')}
          className={`pb-2.5 transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'funding' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Funding
          {activeTab === 'funding' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm shadow-blue-500/50" />
          )}
        </button>
      </div>

      {/* 2. Total Balance Header */}
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
          <span>Total Balance</span>
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="p-0.5 hover:text-white transition-colors cursor-pointer"
          >
            {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Big Balance Number */}
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            {hideBalance ? '****' : totalUsdt.toFixed(2)}
          </span>
          <button className="flex items-center gap-0.5 text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer ml-1">
            <span>USDT</span>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* USD Equivalent */}
        <div className="text-xs text-zinc-400 font-medium mt-0.5 font-mono">
          ≈ ${hideBalance ? '****' : totalUsdt.toFixed(2)}
        </div>

        {/* PnL Change pill */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit backdrop-blur-md">
          <span>+2.3745 USDT (+32,829.11%)</span>
          <button className="flex items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer ml-1">
            <span>1W</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* 3. Quick Action Circular Buttons (Liquid Glass Style) */}
      <div className="px-4 py-4 grid grid-cols-4 gap-3">
        {/* Buy Crypto */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenDeposit();
          }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-zinc-800/80 to-zinc-900/90 group-hover:from-blue-600/20 group-hover:to-indigo-600/30 border border-white/10 group-hover:border-blue-500/40 flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-blue-500/20 active:scale-95">
            <Wallet className="w-5 h-5 text-zinc-200 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors text-center whitespace-nowrap">
            Buy crypto
          </span>
        </button>

        {/* Deposit */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenDeposit();
          }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-zinc-800/80 to-zinc-900/90 group-hover:from-emerald-600/20 group-hover:to-teal-600/30 border border-white/10 group-hover:border-emerald-500/40 flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-emerald-500/20 active:scale-95">
            <ArrowDownLeft className="w-5 h-5 text-zinc-200 group-hover:text-emerald-400 transition-colors" />
          </div>
          <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors text-center whitespace-nowrap">
            Deposit
          </span>
        </button>

        {/* Withdraw */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenDeposit();
          }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-zinc-800/80 to-zinc-900/90 group-hover:from-purple-600/20 group-hover:to-pink-600/30 border border-white/10 group-hover:border-purple-500/40 flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-purple-500/20 active:scale-95">
            <ArrowUpRight className="w-5 h-5 text-zinc-200 group-hover:text-purple-400 transition-colors" />
          </div>
          <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors text-center whitespace-nowrap">
            Withdraw
          </span>
        </button>

        {/* Transfer */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenDeposit();
          }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-zinc-800/80 to-zinc-900/90 group-hover:from-amber-600/20 group-hover:to-orange-600/30 border border-white/10 group-hover:border-amber-500/40 flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-amber-500/20 active:scale-95">
            <ArrowLeftRight className="w-5 h-5 text-zinc-200 group-hover:text-amber-400 transition-colors" />
          </div>
          <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors text-center whitespace-nowrap">
            Transfer
          </span>
        </button>
      </div>

      {/* 4. Auto Earn Banner Card (Apple Liquid Glass) */}
      <div className="px-4 my-1">
        <div className="liquid-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-emerald-500/30 shrink-0">
              ₮
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white">Auto Earn</span>
              <span className="text-xs text-zinc-400 font-medium">
                up to <span className="text-amber-400 font-extrabold text-sm">100.00%</span> APR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Account Sub-Balances Section */}
      <div className="px-4 pt-5">
        <div className="border-b border-white/10 flex items-center">
          <div className="relative pb-2">
            <span className="text-base font-bold text-white">
              Account
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
          </div>
        </div>

        <div className="divide-y divide-white/5 mt-1">
          {/* Futures Account */}
          <div className="py-3.5 flex items-center justify-between">
            <span className="font-semibold text-sm text-white">Futures</span>
            <div className="flex flex-col text-right font-mono">
              <span className="font-bold text-sm text-white">
                {hideBalance ? '****' : `${futuresUsdt} USDT`}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {hideBalance ? '****' : `$${futuresUsdt}`}
              </span>
            </div>
          </div>

          {/* Copy Account */}
          <div className="py-3.5 flex items-center justify-between">
            <span className="font-semibold text-sm text-white">Copy</span>
            <div className="flex flex-col text-right font-mono">
              <span className="font-bold text-sm text-white">0.00 USDT</span>
              <span className="text-xs text-zinc-400 font-medium">$0.00</span>
            </div>
          </div>

          {/* Spot Account */}
          <div className="py-3.5 flex items-center justify-between">
            <span className="font-semibold text-sm text-white">Spot</span>
            <div className="flex flex-col text-right font-mono">
              <span className="font-bold text-sm text-white">0.00 USDT</span>
              <span className="text-xs text-zinc-400 font-medium">&lt;$0.01</span>
            </div>
          </div>

          {/* Funding Account */}
          <div className="py-3.5 flex items-center justify-between">
            <span className="font-semibold text-sm text-white">Funding</span>
            <div className="flex flex-col text-right font-mono">
              <span className="font-bold text-sm text-white">0.00 USDT</span>
              <span className="text-xs text-zinc-400 font-medium">&lt;$0.01</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
