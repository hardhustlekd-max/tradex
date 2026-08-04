import React from 'react';
import { Position } from '../types';
import { soundFx } from '../utils/audio';
import { Share2 } from 'lucide-react';

interface PositionCardProps {
  pos: Position;
  onClosePosition: (id: string) => void;
  onShare?: (pos: Position) => void;
}

export const PositionCard: React.FC<PositionCardProps> = ({
  pos,
  onClosePosition,
  onShare,
}) => {
  const isLong = pos.side === 'long';
  const isPnlPositive = pos.pnl >= 0;
  const baseAsset = pos.symbol.replace('USDT', '');
  const notionalValue = pos.positionValue 
    ? pos.positionValue 
    : (pos.size * pos.markPrice);

  const handleShareClick = () => {
    soundFx.playClick();
    if (onShare) {
      onShare(pos);
    } else if (navigator.share) {
      navigator.share({
        title: `${pos.symbol} Position on TradeX`,
        text: `My ${pos.symbol} ${pos.side.toUpperCase()} position is at ${isPnlPositive ? '+' : ''}${pos.pnlPercentage.toFixed(2)}% ROI!`,
      }).catch(() => {});
    }
  };

  return (
    <div className="p-4 bg-[#181a20] rounded-2xl border border-white/5 space-y-3.5 transition-all text-sans select-none shadow-sm hover:border-white/10">
      {/* 1. Header Row: Badge Icon + Symbol + Perp Tag + Leverage Tag + Share Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Green B / Red S Badge */}
          <div 
            className={`w-5 h-5 rounded flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
              isLong ? 'bg-[#00c076] text-black' : 'bg-[#f6465d] text-white'
            }`}
          >
            {isLong ? 'B' : 'S'}
          </div>

          {/* Pair Symbol Name */}
          <span className="font-bold text-white text-base tracking-tight leading-none">
            {pos.symbol}
          </span>

          {/* Perp Tag */}
          <span className="px-1.5 py-0.5 rounded bg-[#2b313a] text-zinc-400 text-[10px] font-medium leading-none">
            Perp
          </span>

          {/* Cross Leverage Tag */}
          <span className="px-1.5 py-0.5 rounded bg-[#2b313a] text-zinc-400 text-[10px] font-medium leading-none">
            {pos.marginMode || 'Cross'} {pos.leverage}X
          </span>
        </div>

        {/* Share Icon */}
        <button 
          onClick={handleShareClick}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
          title="Share Position"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Top Metric Row: Size / Amount vs PNL / ROI% */}
      <div className="flex items-start justify-between gap-4 pt-0.5">
        {/* Left: Size / Amount */}
        <div className="flex flex-col">
          <span className="text-[11px] sm:text-xs text-zinc-400 font-normal border-b border-dashed border-zinc-600/70 inline-block pb-0.5 self-start cursor-help">
            Size / Amount
          </span>
          <div className="text-base sm:text-lg font-bold text-white font-sans mt-1 leading-tight tracking-tight">
            {pos.size} {baseAsset}
          </div>
          <div className="text-xs text-zinc-400 font-sans mt-0.5">
            {notionalValue.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} USDT
          </div>
        </div>

        {/* Right: PNL / ROI% */}
        <div className="flex flex-col items-end text-right">
          <span className="text-[11px] sm:text-xs text-zinc-400 font-normal border-b border-dashed border-zinc-600/70 inline-block pb-0.5 text-right cursor-help">
            PNL / ROI%
          </span>
          <div className={`text-base sm:text-lg font-bold font-sans mt-1 leading-tight tracking-tight ${isPnlPositive ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
            {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
          </div>
          <div className={`text-xs sm:text-sm font-semibold font-sans mt-0.5 ${isPnlPositive ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
            {pos.pnlPercentage >= 0 ? '+' : ''}{pos.pnlPercentage.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 3. Three Columns Metric Row: Entry Price, Last Price, Liq. Price */}
      <div className="grid grid-cols-3 gap-2 pt-0.5">
        <div>
          <div className="text-[11px] sm:text-xs text-zinc-400 font-normal whitespace-nowrap">Entry Price (USDT)</div>
          <div className="text-xs sm:text-sm font-semibold text-zinc-100 mt-1 font-sans">
            {pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </div>
        </div>

        <div>
          <div className="text-[11px] sm:text-xs text-zinc-400 font-normal whitespace-nowrap">Last Price (USDT)</div>
          <div className="text-xs sm:text-sm font-semibold text-zinc-100 mt-1 font-sans">
            {pos.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] sm:text-xs text-zinc-400 font-normal whitespace-nowrap">Liq. Price (USDT)</div>
          <div className="text-xs sm:text-sm font-semibold text-zinc-100 mt-1 font-sans">
            {pos.liquidationPrice > 0 
              ? pos.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
              : '--'}
          </div>
        </div>
      </div>

      {/* 4. Action Buttons Row */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => {
            soundFx.playOrderFilled();
            onClosePosition(pos.id);
          }}
          className="flex-1 py-2.5 px-3 bg-[#2b313a] hover:bg-[#363d4a] active:scale-[0.98] text-zinc-200 hover:text-white text-xs sm:text-sm font-medium rounded-xl transition-all cursor-pointer text-center"
        >
          Market Close
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onClosePosition(pos.id);
          }}
          className="flex-1 py-2.5 px-3 bg-[#2b313a] hover:bg-[#363d4a] active:scale-[0.98] text-zinc-200 hover:text-white text-xs sm:text-sm font-medium rounded-xl transition-all cursor-pointer text-center"
        >
          Switch
        </button>
      </div>
    </div>
  );
};
