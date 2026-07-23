import React from 'react';
import { Trade } from '../types';

interface RecentTradesProps {
  trades: Trade[];
  precision: number;
}

export const RecentTrades: React.FC<RecentTradesProps> = ({ trades, precision }) => {
  return (
    <div className="w-48 bg-zinc-950 border-r border-zinc-800/80 flex flex-col shrink-0 text-xs font-mono select-none">
      <div className="h-9 px-2 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between text-zinc-300 font-semibold shrink-0">
        <span>Market Trades</span>
        <span className="text-[10px] text-zinc-400 font-normal">Real-time</span>
      </div>

      <div className="px-2 py-1 flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-900 shrink-0">
        <span>Price</span>
        <span>Amount</span>
        <span>Time</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/50">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between px-2 py-1 hover:bg-zinc-900/60 transition-colors"
          >
            <span className={`font-semibold ${trade.type === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trade.price.toFixed(precision)}
            </span>
            <span className="text-zinc-300">{trade.amount.toFixed(3)}</span>
            <span className="text-zinc-400 text-[10px]">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
