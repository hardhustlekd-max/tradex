import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import { Portfolio } from '../types';
import { soundFx } from '../utils/audio';

type AccountType = 'spot' | 'futures' | 'funding' | 'copy' | 'earn';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  initialFrom?: AccountType;
  initialTo?: AccountType;
  initialAsset?: string;
  initialAmount?: string;
  onTransferAsset: (fromAcc: string, toAcc: string, asset: string, amount: number) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  initialFrom = 'funding',
  initialTo = 'futures',
  initialAsset = 'USDT',
  initialAmount = '',
  onTransferAsset,
}) => {
  const [transferFrom, setTransferFrom] = useState<AccountType>(initialFrom);
  const [transferTo, setTransferTo] = useState<AccountType>(initialTo);
  const [transferAsset, setTransferAsset] = useState<string>(initialAsset);
  const [transferAmount, setTransferAmount] = useState<string>(initialAmount);

  useEffect(() => {
    if (isOpen) {
      setTransferFrom(initialFrom);
      setTransferTo(initialTo);
      setTransferAsset(initialAsset);
      setTransferAmount(initialAmount);
    }
  }, [isOpen, initialFrom, initialTo, initialAsset, initialAmount]);

  if (!isOpen) return null;

  const futuresUsdt = portfolio.usdtBalance || 0;
  const fundingUsdt = portfolio.fundingUsdt || 0;
  const copyUsdt = portfolio.copyUsdt || 0;
  const earnUsdt = portfolio.earnUsdt || 0;
  const spotBalances = portfolio.spotBalances || {};

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

    onTransferAsset(transferFrom, transferTo, transferAsset, num);
    setTransferAmount('');
    onClose();
  };

  const accountLabels: Record<AccountType, string> = {
    funding: 'Funding Account',
    spot: 'Spot Wallet',
    futures: 'Futures Account',
    copy: 'Copy Trading',
    earn: 'Earn / Staking',
  };

  return (
    <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150" onClick={onClose}>
      <div className="bg-[#181a20] border border-white/10 rounded-2xl p-5 w-full max-w-md shadow-2xl relative text-zinc-100 space-y-4" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00c076]/20 border border-[#00c076]/40 text-[#00c076]">
              <ArrowLeftRight className="w-4 h-4 text-[#00c076]" />
            </div>
            <h3 className="font-extrabold text-sm text-white">Transfer Assets</h3>
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

        <form onSubmit={handleExecuteTransfer} className="space-y-4 font-sans text-xs">
          {/* Account Swap Box */}
          <div className="bg-[#161b22] p-3 rounded-xl border border-white/10 space-y-2 relative">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                From Account
              </label>
              <select
                value={transferFrom}
                onChange={(e) => {
                  const val = e.target.value as AccountType;
                  setTransferFrom(val);
                  if (val === transferTo) {
                    setTransferTo(val === 'funding' ? 'futures' : 'funding');
                  }
                }}
                className="w-full h-9 px-2.5 bg-[#0d1117] border border-white/10 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#00c076] cursor-pointer"
              >
                {(['funding', 'spot', 'futures', 'copy', 'earn'] as AccountType[]).map((acc) => (
                  <option key={acc} value={acc}>
                    {accountLabels[acc]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center relative my-1">
              <div className="w-full border-t border-white/5" />
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  const temp = transferFrom;
                  setTransferFrom(transferTo);
                  setTransferTo(temp);
                }}
                className="absolute p-1.5 rounded-full bg-[#181a20] border border-[#00c076]/40 text-[#00c076] hover:bg-[#00c076] hover:text-white transition-colors cursor-pointer shadow-md active:scale-95"
                title="Swap Accounts"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                To Account
              </label>
              <select
                value={transferTo}
                onChange={(e) => {
                  const val = e.target.value as AccountType;
                  setTransferTo(val);
                  if (val === transferFrom) {
                    setTransferFrom(val === 'futures' ? 'funding' : 'futures');
                  }
                }}
                className="w-full h-9 px-2.5 bg-[#0d1117] border border-white/10 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#00c076] cursor-pointer"
              >
                {(['funding', 'spot', 'futures', 'copy', 'earn'] as AccountType[]).map((acc) => (
                  <option key={acc} value={acc}>
                    {accountLabels[acc]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Asset Selection */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Select Asset / Coin
            </label>
            <select
              value={transferAsset}
              onChange={(e) => setTransferAsset(e.target.value)}
              className="w-full h-9 px-3 bg-[#161b22] border border-white/10 rounded-xl text-xs font-extrabold text-white focus:outline-none focus:border-[#00c076] cursor-pointer"
            >
              <option value="USDT">USDT (Tether USD)</option>
              {Object.keys(spotBalances).filter((k) => k !== 'USDT').map((coin) => (
                <option key={coin} value={coin}>
                  {coin}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Transfer Amount
              </label>
              <span className="text-[11px] font-bold text-zinc-400">
                Available: <span className="text-[#00c076] font-extrabold">{availableForTransfer.toFixed(4)} {transferAsset}</span>
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full h-10 pl-3 pr-16 bg-[#161b22] border border-white/10 focus:border-[#00c076] rounded-xl text-sm font-bold text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setTransferAmount(availableForTransfer.toString())}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-[#00c076]/20 hover:bg-[#00c076]/30 text-[#00c076] text-[10px] font-black cursor-pointer uppercase transition-colors"
              >
                MAX
              </button>
            </div>

            {/* Quick Percentages */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTransferAmount((availableForTransfer * pct).toFixed(4))}
                  className="py-1 rounded-lg bg-[#161b22] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 text-[10px] font-bold cursor-pointer transition-colors"
                >
                  {pct * 100}%
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!parseFloat(transferAmount) || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > availableForTransfer}
            className="w-full h-11 rounded-xl bg-[#00c076] hover:bg-[#00d080] disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-lg shadow-[#00c076]/20"
          >
            Confirm Transfer
          </button>
        </form>
      </div>
    </div>
  );
};
