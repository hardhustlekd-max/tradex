import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight, AlertTriangle, Zap, Wallet, PlusCircle } from 'lucide-react';
import { Portfolio, TradingMode, OrderSide, OrderType, MarginMode } from '../types';
import { soundFx } from '../utils/audio';
import { formatCurrency } from '../utils/calc';

type AccountType = 'spot' | 'futures' | 'funding' | 'copy' | 'earn';

interface PendingOrderInfo {
  mode: TradingMode;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  leverage: number;
  marginMode: MarginMode;
  takeProfit?: number;
  stopLoss?: number;
  symbol?: string;
}

interface InsufficientFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  pendingOrder: PendingOrderInfo | null;
  requiredAmount: number;
  currentBalance: number;
  deficit: number;
  targetAccount: AccountType;
  symbol: string;
  onTransferAndExecute: (
    fromAcc: AccountType,
    toAcc: AccountType,
    asset: string,
    amount: number
  ) => void;
  onFaucetRefillAndExecute?: (amount: number) => void;
}

export const InsufficientFundsModal: React.FC<InsufficientFundsModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  pendingOrder,
  requiredAmount,
  currentBalance,
  deficit,
  targetAccount = 'futures',
  symbol,
  onTransferAndExecute,
  onFaucetRefillAndExecute,
}) => {
  // Accounts for source selector
  const otherAccounts: { type: AccountType; name: string; balance: number }[] = [
    { type: 'funding' as AccountType, name: 'Funding Account', balance: portfolio.fundingUsdt || 0 },
    { type: 'spot' as AccountType, name: 'Spot Wallet', balance: portfolio.spotBalances?.USDT || 0 },
    { type: 'futures' as AccountType, name: 'Futures Account', balance: portfolio.usdtBalance || 0 },
    { type: 'copy' as AccountType, name: 'Copy Trading', balance: portfolio.copyUsdt || 0 },
    { type: 'earn' as AccountType, name: 'Earn / Staking', balance: portfolio.earnUsdt || 0 },
  ].filter((acc) => acc.type !== targetAccount);

  // Pick default 'from' account with highest USDT balance
  const bestFromAccount = [...otherAccounts].sort((a, b) => b.balance - a.balance)[0]?.type || 'funding';

  const [transferFrom, setTransferFrom] = useState<AccountType>(bestFromAccount);
  const [transferAsset, setTransferAsset] = useState<string>('USDT');
  const [transferAmount, setTransferAmount] = useState<string>(deficit.toFixed(2));
  const [useFaucetFallback, setUseFaucetFallback] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const best = [...otherAccounts].sort((a, b) => b.balance - a.balance)[0]?.type || 'funding';
      setTransferFrom(best);
      setTransferAmount(deficit > 0 ? deficit.toFixed(2) : '100');
      setTransferAsset('USDT');
      setUseFaucetFallback(false);
    }
  }, [isOpen, deficit]);

  if (!isOpen || !pendingOrder) return null;

  const getSourceAvailable = (acc: AccountType): number => {
    if (acc === 'futures') return portfolio.usdtBalance || 0;
    if (acc === 'spot') return portfolio.spotBalances?.USDT || 0;
    if (acc === 'funding') return portfolio.fundingUsdt || 0;
    if (acc === 'copy') return portfolio.copyUsdt || 0;
    if (acc === 'earn') return portfolio.earnUsdt || 0;
    return 0;
  };

  const availableInSource = getSourceAvailable(transferFrom);
  const numTransferAmount = parseFloat(transferAmount) || 0;
  const isSourceSufficient = availableInSource >= numTransferAmount;

  const totalOtherUSDT = otherAccounts.reduce((sum, item) => sum + item.balance, 0);
  const totalUsdtAllWallets = (portfolio.usdtBalance || 0) + totalOtherUSDT;

  const accountLabels: Record<AccountType, string> = {
    funding: 'Funding Account',
    spot: 'Spot Wallet',
    futures: 'Futures Account',
    copy: 'Copy Trading',
    earn: 'Earn / Staking',
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();

    if (useFaucetFallback && onFaucetRefillAndExecute) {
      const refillAmt = Math.max(1000, Math.ceil(deficit * 1.5));
      onFaucetRefillAndExecute(refillAmt);
      onClose();
      return;
    }

    if (!numTransferAmount || numTransferAmount <= 0) return;

    onTransferAndExecute(transferFrom, targetAccount, transferAsset, numTransferAmount);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#141822] border border-amber-500/30 rounded-2xl p-5 w-full max-w-lg shadow-2xl relative text-zinc-100 space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-wide">
                Insufficient Funds Alert
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                Transfer or deposit funds to execute your pending order
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Prominent Insufficient Fund Alert Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-red-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Pending {pendingOrder.mode === 'futures' ? `${pendingOrder.leverage}x Futures` : 'Spot'} {pendingOrder.side.toUpperCase()}
            </span>
            <span className="text-xs font-extrabold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
              {symbol}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5 text-center">
            <div>
              <div className="text-[10px] text-zinc-400 font-medium">Required Margin</div>
              <div className="text-xs font-extrabold text-white mt-0.5">
                {formatCurrency(requiredAmount)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 font-medium">Available Balance</div>
              <div className="text-xs font-bold text-red-400 mt-0.5">
                {formatCurrency(currentBalance)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-amber-300 font-medium">Shortfall / Deficit</div>
              <div className="text-xs font-black text-amber-400 mt-0.5">
                +{formatCurrency(deficit)}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-amber-200/90 leading-snug">
            ⚠️ You do not have enough {transferAsset} in your <strong className="text-white">{accountLabels[targetAccount]}</strong> to open this position. Transfer funds below to auto-execute your pending trade!
          </p>
        </div>

        {/* 2. Transfer Form or Faucet Fallback Toggle */}
        <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
          {/* Account Swap Box */}
          <div className="bg-[#181d28] p-3.5 rounded-xl border border-white/10 space-y-3 relative">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  From Account
                </label>
                <span className="text-[11px] font-bold text-zinc-300">
                  Avail: <span className="text-[#00c076] font-extrabold">{formatCurrency(availableInSource)}</span>
                </span>
              </div>
              <select
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value as AccountType)}
                className="w-full h-10 px-3 bg-[#0d1117] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#00c076] cursor-pointer"
              >
                {otherAccounts.map((acc) => (
                  <option key={acc.type} value={acc.type}>
                    {acc.name} (Bal: ${acc.balance.toFixed(2)} USDT)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center relative my-1">
              <div className="w-full border-t border-white/10" />
              <div className="absolute p-1.5 rounded-full bg-[#141822] border border-[#00c076]/40 text-[#00c076]">
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                To Target Account (Destination)
              </label>
              <div className="w-full h-10 px-3 bg-[#0d1117]/80 border border-[#00c076]/30 rounded-xl text-xs font-extrabold text-[#00c076] flex items-center justify-between">
                <span>{accountLabels[targetAccount]}</span>
                <span className="text-[10px] bg-[#00c076]/20 px-2 py-0.5 rounded font-mono uppercase">Target</span>
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Transfer Amount
              </label>
              <span className="text-[10px] text-amber-400 font-bold">
                Deficit needed: ${deficit.toFixed(2)} USDT
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                required={!useFaucetFallback}
                className="w-full h-10 pl-3 pr-20 bg-[#181d28] border border-white/10 focus:border-[#00c076] rounded-xl text-sm font-bold text-white focus:outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTransferAmount(deficit.toFixed(2))}
                  className="px-1.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[9px] font-black cursor-pointer uppercase transition-colors"
                  title="Set exact needed deficit"
                >
                  Deficit
                </button>
                <button
                  type="button"
                  onClick={() => setTransferAmount(availableInSource.toString())}
                  className="px-1.5 py-1 rounded-md bg-[#00c076]/20 hover:bg-[#00c076]/30 text-[#00c076] text-[9px] font-black cursor-pointer uppercase transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Quick Percentage Presets */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTransferAmount((availableInSource * pct).toFixed(2))}
                  className="py-1 rounded-lg bg-[#181d28] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 text-[10px] font-bold cursor-pointer transition-colors"
                >
                  {pct * 100}%
                </button>
              ))}
            </div>
          </div>

          {/* Fallback Option if source account is low */}
          {!isSourceSufficient && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-white">Source account is also low</p>
                  <p className="text-zinc-400 text-[10px]">
                    Total USDT across all wallets: ${totalUsdtAllWallets.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUseFaucetFallback(!useFaucetFallback)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1 ${
                  useFaucetFallback
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/40'
                }`}
              >
                <PlusCircle className="w-3 h-3" />
                <span>{useFaucetFallback ? 'Using Faucet Deposit' : 'Deposit via Faucet'}</span>
              </button>
            </div>
          )}

          {/* Action Button */}
          {useFaucetFallback ? (
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Deposit Testnet USDT & Execute Trade</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!numTransferAmount || numTransferAmount <= 0 || numTransferAmount > availableInSource}
              className="w-full h-11 rounded-xl bg-[#00c076] hover:bg-[#00d080] disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-lg shadow-[#00c076]/25 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                Transfer ${numTransferAmount.toFixed(2)} USDT & Execute Trade
              </span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
