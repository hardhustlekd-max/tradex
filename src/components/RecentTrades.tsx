import React from 'react';
import { Trade } from '../types';
import { Activity } from 'lucide-react';

interface RecentTradesProps {
  trades: Trade[];
  precision: number;
}

export const RecentTrades: React.FC<RecentTradesProps> = ({ trades, precision }) => {
  return (
    <div className="w-full lg:w-48 bg-[#131722] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col shrink-0 text-xs font-mono select-none h-full min-h-[250px] lg:min-h-0">
      <div className="h-9 px-2.5 bg-[#131722] border-b border-white/10 flex items-center justify-between text-zinc-100 font-bold shrink-0 font-sans">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#00c076]" />
          <span>Market Trades</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">Live</span>
      </div>

      <div className="px-2.5 py-1 flex items-center justify-between text-[10px] text-zinc-400 border-b border-white/10 shrink-0 font-sans font-medium">
        <span>Price</span>
        <span>Amount</span>
        <span>Time</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between px-2.5 py-1 hover:bg-[#1c2230] transition-colors"
          >
            <span className={`font-semibold ${trade.type === 'buy' ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
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

