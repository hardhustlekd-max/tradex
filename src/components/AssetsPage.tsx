import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  TrendingUp,
  Sparkles,
  RotateCcw,
  X,
  Check,
  ChevronRight,
  Coins,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { UserPortfolio, Position, TradingPair } from '../types';
import { soundFx } from '../utils/audio';
import { calculateTotalEquity } from '../utils/calc';
import { TransferModal } from './TransferModal';
import { CoinIcon } from './CoinIcon';

interface AssetsPageProps {
  portfolio: UserPortfolio;
  positions: Position[];
  pairs: TradingPair[];
  onOpenDeposit: () => void;
  onResetBalance?: (amount: number) => void;
  onOpenFaucet?: () => void;
  onTransferAsset?: (fromAcc: string, toAcc: string, asset: string, amount: number) => void;
}

type AccountType = 'spot' | 'futures' | 'funding' | 'copy' | 'earn';

export const AssetsPage: React.FC<AssetsPageProps> = ({
  portfolio,
  positions,
  pairs,
  onOpenDeposit,
  onResetBalance,
  onOpenFaucet,
  onTransferAsset,
}) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'spot' | 'futures' | 'funding' | 'copy' | 'earn'>('overview');

  // Transfer Modal State
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState<AccountType>('spot');
  const [transferTo, setTransferTo] = useState<AccountType>('futures');
  const [transferAsset, setTransferAsset] = useState<string>('USDT');
  const [transferAmount, setTransferAmount] = useState<string>('');

  // Account Valuations
  const totalEquity = calculateTotalEquity(portfolio, positions, pairs);
  const totalPnl = positions.reduce((acc, pos) => acc + pos.pnl, 0);

  const futuresUsdt = portfolio.usdtBalance || 0;
  const futuresLockedMargin = positions.reduce((acc, pos) => acc + pos.margin, 0);
  const futuresValue = futuresUsdt + futuresLockedMargin + totalPnl;

  const fundingUsdt = portfolio.fundingUsdt || 0;
  const copyUsdt = portfolio.copyUsdt || 0;
  const earnUsdt = portfolio.earnUsdt || 0;

  // Spot balances valuation
  let spotUsdtValue = 0;
  const spotBalances = portfolio.spotBalances || {};
  Object.entries(spotBalances).forEach(([asset, val]) => {
    const amount = Number(val) || 0;
    if (amount > 0) {
      if (asset === 'USDT') {
        spotUsdtValue += amount;
      } else {
        const pair = pairs.find((p) => p.baseAsset === asset && p.quoteAsset === 'USDT');
        const price = pair ? pair.price : 0;
        spotUsdtValue += amount * price;
      }
    }
  });

  // Calculate separate balance display based on active tab
  let displayedBalance = totalEquity;
  let displayedLabel = 'Total Net Equity';

  if (activeTab === 'spot') {
    displayedBalance = spotUsdtValue;
    displayedLabel = 'Spot Wallet Net Equity';
  } else if (activeTab === 'futures') {
    displayedBalance = futuresValue;
    displayedLabel = 'Futures Account Equity';
  } else if (activeTab === 'funding') {
    displayedBalance = fundingUsdt;
    displayedLabel = 'Funding Account Balance';
  } else if (activeTab === 'copy') {
    displayedBalance = copyUsdt;
    displayedLabel = 'Copy Trading Balance';
  } else if (activeTab === 'earn') {
    displayedBalance = earnUsdt;
    displayedLabel = 'Earn Staked Balance';
  }

  // Calculate available balance for the Transfer Modal
  const getAvailableBalance = (acc: AccountType, asset: string): number => {
    if (asset === 'USDT') {
      if (acc === 'futures') return futuresUsdt;
      if (acc === 'spot') return spotBalances.USDT || 0;
      if (acc === 'funding') return fundingUsdt;
      if (acc === 'copy') return copyUsdt;
      if (acc === 'earn') return earnUsdt;
    } else {
      if (acc === 'spot') return spotBalances[asset] || 0;
    }
    return 0;
  };

  const availableForTransfer = getAvailableBalance(transferFrom, transferAsset);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(transferAmount);
    if (!num || num <= 0 || num > availableForTransfer) return;

    if (onTransferAsset) {
      onTransferAsset(transferFrom, transferTo, transferAsset, num);
    }
    setTransferAmount('');
    setIsTransferOpen(false);
  };

  const handleOpenTransferModal = (from: AccountType = 'spot', to: AccountType = 'futures', asset: string = 'USDT') => {
    soundFx.playClick();
    setTransferFrom(from);
    setTransferTo(to === from ? (from === 'spot' ? 'futures' : 'spot') : to);
    setTransferAsset(asset);
    setTransferAmount('');
    setIsTransferOpen(true);
  };

  const accountLabels: Record<AccountType, string> = {
    spot: 'Spot Wallet',
    futures: 'Futures Account',
    funding: 'Funding Account',
    copy: 'Copy Trading',
    earn: 'Earn / Staking',
  };

  return (
    <div className="flex-1 bg-[#0d1117] text-[#f0f3f8] flex flex-col overflow-y-auto select-none pb-24 font-sans relative w-full">
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 flex-1 flex flex-col space-y-3 pt-2">
        
        {/* Secondary Navigation Tabs: Overview | Spot | Futures | Funding | Copy | Earn */}
        <div className="flex items-center gap-1.5 py-1 text-xs font-semibold overflow-x-auto no-scrollbar shrink-0 bg-[#0d1117] sticky top-0 z-20 border-b border-white/5 pb-2">
          {(['overview', 'spot', 'futures', 'funding', 'copy', 'earn'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab);
              }}
              className={`py-1 px-3 rounded-full transition-all capitalize whitespace-nowrap cursor-pointer text-xs ${
                activeTab === tab
                  ? 'bg-[#00c076] text-white font-extrabold shadow-xs'
                  : 'bg-[#181a20] text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab === 'copy' ? 'Copy Trading' : tab === 'earn' ? 'Earn Yield' : tab}
            </button>
          ))}
        </div>

        {/* Total Assets Overview Header Card */}
        <div className="bg-[#181a20] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-xs font-semibold">{displayedLabel}</span>
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="p-0.5 hover:text-white transition-colors cursor-pointer"
                title="Toggle Balance Visibility"
              >
                {hideBalance ? <EyeOff className="w-3.5 h-3.5 text-zinc-400" /> : <Eye className="w-3.5 h-3.5 text-zinc-400" />}
              </button>
            </div>

            {/* Top Right Reset Button styled like Homepage button */}
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
              className="bg-[#181a20] hover:bg-[#202630] border border-white/10 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-[#00c076] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md"
              title="Reset Faucet Balance to $100,000 USDT"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#00c076]" />
              <span>Reset ($100k)</span>
            </button>
          </div>

          {/* Big Balance Number - 4 Decimal points */}
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
              {hideBalance ? '****' : displayedBalance.toFixed(4)}
            </span>
            <span className="text-xs font-bold text-[#00c076]">USDT</span>
          </div>

          {/* Equivalent & Live PnL pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5">
            <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              totalPnl >= 0 ? 'text-[#00c076] bg-[#00c076]/15' : 'text-[#f6465d] bg-[#f6465d]/15'
            }`}>
              <TrendingUp className={`w-3 h-3 ${totalPnl < 0 ? 'rotate-180' : ''}`} />
              <span>{totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(4)} USDT Positions PnL</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00c076]" />
              <span>Multi-Account Segregated Storage</span>
            </span>
          </div>
        </div>

        {/* Quick Actions Grid with exact Homepage Action buttons styles */}
        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenDeposit();
            }}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#181a20] hover:bg-[#202630] transition-all group cursor-pointer border border-white/5 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            <div className="w-9 h-9 rounded-full bg-[#00c076]/15 text-[#00c076] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-zinc-200 group-hover:text-white text-center whitespace-nowrap">
              Deposit
            </span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onOpenDeposit();
            }}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#181a20] hover:bg-[#202630] transition-all group cursor-pointer border border-white/5 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            <div className="w-9 h-9 rounded-full bg-[#00c076]/15 text-[#00c076] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-zinc-200 group-hover:text-white text-center whitespace-nowrap">
              Withdraw
            </span>
          </button>

          <button
            onClick={() => handleOpenTransferModal('spot', 'futures')}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#181a20] hover:bg-[#202630] transition-all group cursor-pointer border border-white/5 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            <div className="w-9 h-9 rounded-full bg-[#00c076]/15 text-[#00c076] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-zinc-200 group-hover:text-white text-center whitespace-nowrap">
              Transfer
            </span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('earn');
            }}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#181a20] hover:bg-[#202630] transition-all group cursor-pointer border border-white/5 active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          >
            <div className="w-9 h-9 rounded-full bg-[#00c076]/15 text-[#00c076] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-zinc-200 group-hover:text-white text-center whitespace-nowrap">
              Earn Yield
            </span>
          </button>
        </div>

        {/* --- TAB CONTENT 1: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* Account Separation Breakdown List */}
            <div className="bg-[#181a20] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/5">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-sm font-extrabold text-white">Account Balances</span>
                <span className="text-[11px] text-zinc-400 font-semibold">Real-time Valuation</span>
              </div>

              <div className="divide-y divide-white/5">
                {/* Spot Account */}
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-bold text-xs text-white">Spot Account</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-white block">
                      {hideBalance ? '****' : `${spotUsdtValue.toFixed(4)} USDT`}
                    </span>
                  </div>
                </div>

                {/* Futures Account */}
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00c076]" />
                    <span className="font-bold text-xs text-white">Futures Account</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-white block">
                      {hideBalance ? '****' : `${futuresValue.toFixed(4)} USDT`}
                    </span>
                  </div>
                </div>

                {/* Funding Account */}
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-xs text-white">Funding Account</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-white block">
                      {hideBalance ? '****' : `${fundingUsdt.toFixed(4)} USDT`}
                    </span>
                  </div>
                </div>

                {/* Copy Trading */}
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-bold text-xs text-white">Copy Trading</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-white block">
                      {hideBalance ? '****' : `${copyUsdt.toFixed(4)} USDT`}
                    </span>
                  </div>
                </div>

                {/* Earn / Staking */}
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-xs text-white">Earn / Staking</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-white block">
                      {hideBalance ? '****' : `${earnUsdt.toFixed(4)} USDT`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT 2: SPOT WALLET --- */}
        {activeTab === 'spot' && (
          <div className="space-y-3">
            <div className="bg-[#181a20] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/5">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Spot Wallet Assets</h3>
                  <p className="text-[10px] text-zinc-400">Total Spot Valuation: <span className="text-white font-bold">{spotUsdtValue.toFixed(4)} USDT</span></p>
                </div>
                <button
                  onClick={() => handleOpenTransferModal('spot', 'futures')}
                  className="px-3 py-1 rounded-xl bg-[#00c076] hover:bg-[#00d080] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Transfer All</span>
                </button>
              </div>

              {/* Spot Asset Table */}
              <div className="divide-y divide-white/5">
                {Object.entries(spotBalances).map(([asset, qty]) => {
                  const amount = Number(qty) || 0;
                  if (amount <= 0 && asset !== 'USDT') return null;

                  const pair = pairs.find((p) => p.baseAsset === asset && p.quoteAsset === 'USDT');
                  const unitPrice = asset === 'USDT' ? 1.0 : (pair ? pair.price : 0);
                  const usdtVal = amount * unitPrice;

                  return (
                    <div key={asset} className="py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <CoinIcon symbol={asset} size={32} />
                        <div>
                          <span className="font-bold text-xs text-white block">{asset}</span>
                          <span className="text-[10px] text-zinc-400">Price: ${unitPrice.toFixed(4)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-extrabold text-xs text-white block">
                            {hideBalance ? '****' : amount.toFixed(4)} {asset}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium block">
                            ≈ ${usdtVal.toFixed(4)} USDT
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenTransferModal('spot', 'futures', asset)}
                          className="px-2.5 py-1 rounded-lg bg-[#00c076]/15 hover:bg-[#00c076]/30 text-[#00c076] border border-[#00c076]/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          title={`Transfer ${asset}`}
                        >
                          <ArrowLeftRight className="w-3 h-3" />
                          <span>Transfer</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT 3: FUTURES ACCOUNT --- */}
        {activeTab === 'futures' && (
          <div className="space-y-3">
            <div className="bg-[#181a20] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/5 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Futures Account Overview</h3>
                  <p className="text-[10px] text-zinc-400">Total Futures Equity: <span className="text-white font-bold">{futuresValue.toFixed(4)} USDT</span></p>
                </div>
                <button
                  onClick={() => handleOpenTransferModal('futures', 'spot', 'USDT')}
                  className="px-3 py-1 rounded-xl bg-[#00c076] hover:bg-[#00d080] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Transfer USDT</span>
                </button>
              </div>

              {/* Futures Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-sans">
                <div className="bg-[#161b22] rounded-xl p-2.5 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block font-medium">Available Margin</span>
                  <span className="text-sm font-black text-white">{futuresUsdt.toFixed(4)} USDT</span>
                </div>

                <div className="bg-[#161b22] rounded-xl p-2.5 border border-white/5">
                  <span className="text-[10px] text-zinc-400 block font-medium">Locked Margin</span>
                  <span className="text-sm font-black text-amber-400">{futuresLockedMargin.toFixed(4)} USDT</span>
                </div>

                <div className="bg-[#161b22] rounded-xl p-2.5 border border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-zinc-400 block font-medium">Unrealized PnL</span>
                  <span className={`text-sm font-black ${totalPnl >= 0 ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                    {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(4)} USDT
                  </span>
                </div>
              </div>

              {/* Active Positions Summary */}
              <div className="pt-2">
                <span className="text-xs font-bold text-zinc-300 block mb-2">Active Futures Positions ({positions.length})</span>
                {positions.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs font-medium bg-[#161b22] rounded-xl border border-white/5">
                    No active positions open.
                  </div>
                ) : (
                  <div className="space-y-2 font-sans">
                    {positions.map((pos) => (
                      <div key={pos.id} className="bg-[#161b22] rounded-xl p-2.5 border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black uppercase ${pos.side === 'long' ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                              {pos.side} {pos.leverage}x
                            </span>
                            <span className="font-bold text-white">{pos.symbol}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">Entry: ${pos.entryPrice.toFixed(4)}</span>
                        </div>

                        <div className="text-right">
                          <span className={`font-black block ${pos.pnl >= 0 ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                            {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(4)} USDT
                          </span>
                          <span className="text-[10px] text-zinc-400">Margin: ${pos.margin.toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT 4: FUNDING ACCOUNT --- */}
        {activeTab === 'funding' && (
          <div className="space-y-3">
            <div className="bg-[#181a20] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/5 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Funding Account</h3>
                  <p className="text-[10px] text-zinc-400">Available Balance: <span className="text-white font-bold">{fundingUsdt.toFixed(4)} USDT</span></p>
                </div>
                <button
                  onClick={() => handleOpenTransferModal('funding', 'spot', 'USDT')}
                  className="px-3 py-1 rounded-xl bg-[#00c076] hover:bg-[#00d080] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Transfer</span>
                </button>
              </div>

              <div className="bg-[#161b22] p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-xs font-bold text-white block">P2P & OTC Funding Wallet</span>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Funding Account is used for P2P trading, crypto payment cards, and instant crypto purchases. You can transfer funds directly between Spot, Futures, and Funding without any fee.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT 5: COPY TRADING --- */}
        {activeTab === 'copy' && (
          <div className="space-y-3">
            <div className="bg-[#181a20] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/5 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Copy Trading Account</h3>
                  <p className="text-[10px] text-zinc-400">Allocated Balance: <span className="text-white font-bold">{copyUsdt.toFixed(4)} USDT</span></p>
                </div>
                <button
                  onClick={() => handleOpenTransferModal('copy', 'futures', 'USDT')}
                  className="px-3 py-1 rounded-xl bg-[#00c076] hover:bg-[#00d080] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Transfer</span>
                </button>
              </div>

              <div className="bg-[#161b22] p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-xs font-bold text-white block">Automated Lead Trader Replication</span>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Funds allocated to Copy Trading automatically replicate trades opened by top verified lead traders on NEXUS with zero slippage.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT 6: EARN YIELD --- */}
        {activeTab === 'earn' && (
          <div className="space-y-3">
            <div className="bg-[#181a20] rounded-2xl p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-white/5 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Auto Earn Vaults</h3>
                  <p className="text-[10px] text-zinc-400">Total Staked: <span className="text-[#00c076] font-bold">{earnUsdt.toFixed(4)} USDT</span></p>
                </div>
                <button
                  onClick={() => handleOpenTransferModal('spot', 'earn', 'USDT')}
                  className="px-3 py-1 rounded-xl bg-[#00c076] hover:bg-[#00d080] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Stake USDT</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-[#161b22] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-white block">USDT Flexible Yield</span>
                    <span className="text-[10px] text-zinc-400">Daily Distribution</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#00c076]">10.50% APR</span>
                  </div>
                </div>

                <div className="bg-[#161b22] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-white block">BTC Staking Vault</span>
                    <span className="text-[10px] text-zinc-400">Flexible Unstake</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-400">4.20% APR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
 
      {/* --- REUSABLE TRANSFER MODAL --- */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        portfolio={portfolio as any}
        initialFrom={transferFrom}
        initialTo={transferTo}
        initialAsset={transferAsset}
        initialAmount={transferAmount}
        onTransferAsset={(fromAcc, toAcc, asset, amount) => {
          if (onTransferAsset) {
            onTransferAsset(fromAcc, toAcc, asset, amount);
          }
        }}
      />
    </div>
  );
};
