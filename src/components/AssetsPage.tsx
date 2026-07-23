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
    <div className="flex-1 bg-[#000000] text-white flex flex-col overflow-y-auto select-none pb-28 font-sans">
      {/* 1. Top Navigation Bar: Overview | Futures | Copy | Spot | Funding */}
      <div className="px-4 border-b border-zinc-900 flex items-center gap-6 pt-3 text-base font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2 transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'overview' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Overview
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('futures')}
          className={`pb-2 transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'futures' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Futures
          {activeTab === 'futures' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('copy')}
          className={`pb-2 transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'copy' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Copy
        </button>

        <button
          onClick={() => setActiveTab('spot')}
          className={`pb-2 transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'spot' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Spot
        </button>

        <button
          onClick={() => setActiveTab('funding')}
          className={`pb-2 transition-colors relative whitespace-nowrap cursor-pointer ${
            activeTab === 'funding' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Funding
        </button>
      </div>

      {/* 2. Total Balance Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
          <span>Total</span>
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="p-0.5 hover:text-white transition-colors cursor-pointer"
          >
            {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Big Balance Number */}
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {hideBalance ? '****' : totalUsdt.toFixed(2)}
          </span>
          <button className="flex items-center gap-0.5 text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer ml-1">
            <span>USDT</span>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* USD Equivalent */}
        <div className="text-xs text-zinc-400 font-medium mt-0.5">
          ≈ ${hideBalance ? '****' : totalUsdt.toFixed(2)}
        </div>

        {/* PnL Change pill */}
        <div className="flex items-center gap-1 text-xs font-semibold text-[#0ecb81] mt-2">
          <span>+2.3745 USDT (+32,829.11%)</span>
          <button className="flex items-center gap-0.5 text-zinc-400 hover:text-white cursor-pointer">
            <span>1W</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* 3. Quick Action Circular Buttons */}
      <div className="px-4 py-5 grid grid-cols-4 gap-2">
        {/* Buy Crypto */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenDeposit();
          }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-[#1c1c1e] group-hover:bg-[#2c2c2e] border border-zinc-800 flex items-center justify-center transition-colors">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors text-center">
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
          <div className="w-12 h-12 rounded-full bg-[#1c1c1e] group-hover:bg-[#2c2c2e] border border-zinc-800 flex items-center justify-center transition-colors">
            <ArrowDownLeft className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors text-center">
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
          <div className="w-12 h-12 rounded-full bg-[#1c1c1e] group-hover:bg-[#2c2c2e] border border-zinc-800 flex items-center justify-center transition-colors">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors text-center">
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
          <div className="w-12 h-12 rounded-full bg-[#1c1c1e] group-hover:bg-[#2c2c2e] border border-zinc-800 flex items-center justify-center transition-colors">
            <ArrowLeftRight className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors text-center">
            Transfer
          </span>
        </button>
      </div>

      {/* 4. Auto Earn Banner Card */}
      <div className="px-4 my-2">
        <div className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#26a17b] flex items-center justify-center text-white font-bold text-sm shrink-0">
              ₮
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white">Auto Earn</span>
              <span className="text-xs text-zinc-400 font-medium">
                up to <span className="text-[#fcd535] font-extrabold text-sm">100.00%</span> APR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Account Sub-Balances Section */}
      <div className="px-4 pt-5">
        <div className="border-b border-zinc-900 pb-2">
          <span className="text-base font-bold text-white relative pb-2 border-b-2 border-white">
            Account
          </span>
        </div>

        <div className="divide-y divide-zinc-900/80 mt-2">
          {/* Futures Account */}
          <div className="py-3.5 flex items-center justify-between">
            <span className="font-semibold text-sm text-white">Futures</span>
            <div className="flex flex-col text-right">
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
            <div className="flex flex-col text-right">
              <span className="font-bold text-sm text-white">0.00 USDT</span>
              <span className="text-xs text-zinc-400 font-medium">$0.00</span>
            </div>
          </div>

          {/* Spot Account */}
          <div className="py-3.5 flex items-center justify-between">
            <span className="font-semibold text-sm text-white">Spot</span>
            <div className="flex flex-col text-right">
              <span className="font-bold text-sm text-white">0.00 USDT</span>
              <span className="text-xs text-zinc-400 font-medium">&lt;$0.01</span>
            </div>
          </div>

          {/* Funding Account */}
          <div className="py-3.5 flex items-center justify-between">
            <span className="font-semibold text-sm text-white">Funding</span>
            <div className="flex flex-col text-right">
              <span className="font-bold text-sm text-white">0.00 USDT</span>
              <span className="text-xs text-zinc-400 font-medium">&lt;$0.01</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
