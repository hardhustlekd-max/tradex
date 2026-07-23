import React from 'react';
import { Trade } from '../types';
import { Activity } from 'lucide-react';

interface RecentTradesProps {
  trades: Trade[];
  precision: number;
}

export const RecentTrades: React.FC<RecentTradesProps> = ({ trades, precision }) => {
  return (
    <div className="w-full lg:w-48 bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-800/80 flex flex-col shrink-0 text-xs font-mono select-none h-full min-h-[250px] lg:min-h-0">
      <div className="h-9 px-2.5 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between text-zinc-300 font-bold shrink-0 font-sans">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Market Trades</span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono font-normal bg-zinc-800/80 px-1.5 py-0.5 rounded-full">Live</span>
      </div>

      <div className="px-2.5 py-1 flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-900 shrink-0 font-sans font-medium">
        <span>Price</span>
        <span>Amount</span>
        <span>Time</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/50">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between px-2.5 py-1 hover:bg-zinc-900/60 transition-colors"
          >
            <span className={`font-semibold ${trade.type === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trade.price.toFixed(precision)}
            </span>
            <span className="text-zinc-300 font-medium">{trade.amount.toFixed(3)}</span>
            <span className="text-zinc-400 text-[10px]">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

