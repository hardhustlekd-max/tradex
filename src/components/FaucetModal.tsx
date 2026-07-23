import React, { useState } from 'react';
import { Portfolio } from '../types';
import { formatCurrency } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { X, Wallet, RefreshCw, Coins, Sparkles, CheckCircle } from 'lucide-react';

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  onResetBalance: (amount: number) => void;
  onClaimCrypto: (asset: string, amount: number) => void;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onResetBalance,
  onClaimCrypto,
}) => {
  const [customUsdt, setCustomUsdt] = useState<string>('100000');
  const [claimedAsset, setClaimedAsset] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = (amount: number) => {
    soundFx.playOrderFilled();
    onResetBalance(amount);
    setClaimedAsset(`USDT Reset to ${formatCurrency(amount)}`);
    setTimeout(() => setClaimedAsset(null), 2500);
  };

  const handleClaim = (asset: string, amount: number) => {
    soundFx.playOrderFilled();
    onClaimCrypto(asset, amount);
    setClaimedAsset(`Claimed +${amount} ${asset}`);
    setTimeout(() => setClaimedAsset(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden font-mono text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-950 text-teal-400 border border-teal-500/30">
              <Wallet className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold">Demo Balance Faucet</h2>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Claimed Toast Banner */}
        {claimedAsset && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{claimedAsset}</span>
          </div>
        )}

        <div className="p-5 space-y-5">
          {/* Current Equity Card */}
          <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 block">Available Demo Cash</span>
              <span className="text-lg font-bold text-emerald-400">{formatCurrency(portfolio.usdtBalance)}</span>
            </div>
            <button
              onClick={() => handleReset(100000)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset $100K</span>
            </button>
          </div>

          {/* Quick Top-Up Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">Quick Cash Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {[10000, 50000, 250000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleReset(amt)}
                  className="py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 cursor-pointer transition-colors font-mono"
                >
                  ${(amt / 1000).toFixed(0)}K USDT
                </button>
              ))}
            </div>
          </div>

          {/* Claim Demo Spot Crypto Assets */}
          <div className="space-y-2 pt-2 border-t border-zinc-900">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Claim Testnet Spot Coins</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleClaim('BTC', 1.0)}
                className="py-2 px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer transition-colors flex flex-col items-center"
              >
                <span>+1.0 BTC</span>
                <span className="text-[9px] text-amber-400/80">Bitcoin</span>
              </button>

              <button
                onClick={() => handleClaim('ETH', 10.0)}
                className="py-2 px-3 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-500/30 text-xs font-semibold cursor-pointer transition-colors flex flex-col items-center"
              >
                <span>+10.0 ETH</span>
                <span className="text-[9px] text-sky-400/80">Ethereum</span>
              </button>

              <button
                onClick={() => handleClaim('SOL', 100.0)}
                className="py-2 px-3 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs font-semibold cursor-pointer transition-colors flex flex-col items-center"
              >
                <span>+100 SOL</span>
                <span className="text-[9px] text-purple-400/80">Solana</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-zinc-900/50 border-t border-zinc-800 text-center text-[10px] text-zinc-400">
          This is a zero-risk simulated demo exchange.
        </div>
      </div>
    </div>
  );
};
