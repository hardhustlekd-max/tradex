import React, { useState } from 'react';
import { OrderBookEntry } from '../types';
import { formatNumber } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { BookOpen } from 'lucide-react';

interface OrderBookProps {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  currentPrice: number;
  precision: number;
  onSelectPrice: (price: number) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  asks,
  bids,
  currentPrice,
  precision,
  onSelectPrice,
}) => {
  const [viewMode, setViewMode] = useState<'both' | 'asks' | 'bids'>('both');

  const maxAskTotal = asks.length > 0 ? Math.max(...asks.map((a) => a.total)) : 1;
  const maxBidTotal = bids.length > 0 ? Math.max(...bids.map((b) => b.total)) : 1;

  // Calculate spread
  const lowestAsk = asks.length > 0 ? asks[asks.length - 1].price : currentPrice;
  const highestBid = bids.length > 0 ? bids[0].price : currentPrice;
  const spread = Math.max(0, lowestAsk - highestBid);
  const spreadPercent = ((spread / currentPrice) * 100).toFixed(2);

  const visibleAsks = viewMode === 'bids' ? [] : viewMode === 'asks' ? asks.slice(0, 16) : asks.slice(-8);
  const visibleBids = viewMode === 'asks' ? [] : viewMode === 'bids' ? bids.slice(0, 16) : bids.slice(0, 8);

  return (
    <div className="w-full lg:w-60 bg-zinc-950 border-b lg:border-b-0 lg:border-r border-zinc-800/80 flex flex-col shrink-0 text-xs font-mono select-none h-full min-h-[250px] lg:min-h-0">
      {/* Orderbook Header Controls */}
      <div className="h-9 px-2.5 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between text-zinc-400 shrink-0 font-sans">
        <div className="flex items-center gap-1.5 font-bold text-zinc-200">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Order Book</span>
        </div>

        {/* View Mode Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('both')}
            className={`p-1 rounded cursor-pointer ${viewMode === 'both' ? 'bg-zinc-800 text-zinc-100' : 'hover:text-zinc-200'}`}
            title="Show Both Asks & Bids"
          >
            <div className="w-3.5 h-3.5 flex flex-col justify-between py-0.5">
              <div className="h-1 bg-rose-500 rounded-xs" />
              <div className="h-1 bg-emerald-500 rounded-xs" />
            </div>
          </button>

          <button
            onClick={() => setViewMode('asks')}
            className={`p-1 rounded cursor-pointer ${viewMode === 'asks' ? 'bg-zinc-800 text-zinc-100' : 'hover:text-zinc-200'}`}
            title="Show Asks Only"
          >
            <div className="w-3.5 h-3.5 flex flex-col justify-center gap-0.5">
              <div className="h-1 bg-rose-500 rounded-xs" />
              <div className="h-1 bg-rose-500/60 rounded-xs" />
            </div>
          </button>

          <button
            onClick={() => setViewMode('bids')}
            className={`p-1 rounded cursor-pointer ${viewMode === 'bids' ? 'bg-zinc-800 text-zinc-100' : 'hover:text-zinc-200'}`}
            title="Show Bids Only"
          >
            <div className="w-3.5 h-3.5 flex flex-col justify-center gap-0.5">
              <div className="h-1 bg-emerald-500/60 rounded-xs" />
              <div className="h-1 bg-emerald-500 rounded-xs" />
            </div>
          </button>
        </div>
      </div>

      {/* Table Column Headers */}
      <div className="px-2 py-1 flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-900 shrink-0">
        <span>Price (USDT)</span>
        <span>Size</span>
        <span>Total</span>
      </div>

      {/* Main Order Book Scroll List */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* Asks (Sell Orders - Red) */}
        <div className="flex-1 flex flex-col justify-end overflow-hidden">
          {visibleAsks.map((ask, idx) => {
            const depthPercent = Math.min(100, (ask.total / maxAskTotal) * 100);
            return (
              <div
                key={`ask-${idx}`}
                onClick={() => {
                  soundFx.playClick();
                  onSelectPrice(ask.price);
                }}
                className="relative flex items-center justify-between px-2 py-0.5 hover:bg-zinc-900 cursor-pointer transition-colors group"
              >
                {/* Visual Depth Bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-rose-950/40 border-l border-rose-500/20 transition-all duration-300 pointer-events-none"
                  style={{ width: `${depthPercent}%` }}
                />

                <span className="relative z-10 text-rose-400 font-semibold group-hover:underline">
                  {ask.price.toFixed(precision)}
                </span>
                <span className="relative z-10 text-zinc-300">{ask.amount.toFixed(3)}</span>
                <span className="relative z-10 text-zinc-400">{ask.total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {/* Current Mid Price Banner */}
        <div className="py-1.5 px-2 bg-zinc-900/90 border-y border-zinc-800 flex items-center justify-between shrink-0 my-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-zinc-100">{currentPrice.toFixed(precision)}</span>
            <span className="text-[10px] text-zinc-400">USDT</span>
          </div>
          <span className="text-[10px] text-zinc-400">Spread: {spread.toFixed(precision)} ({spreadPercent}%)</span>
        </div>

        {/* Bids (Buy Orders - Green) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {visibleBids.map((bid, idx) => {
            const depthPercent = Math.min(100, (bid.total / maxBidTotal) * 100);
            return (
              <div
                key={`bid-${idx}`}
                onClick={() => {
                  soundFx.playClick();
                  onSelectPrice(bid.price);
                }}
                className="relative flex items-center justify-between px-2 py-0.5 hover:bg-zinc-900 cursor-pointer transition-colors group"
              >
                {/* Visual Depth Bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-emerald-950/40 border-l border-emerald-500/20 transition-all duration-300 pointer-events-none"
                  style={{ width: `${depthPercent}%` }}
                />

                <span className="relative z-10 text-emerald-400 font-semibold group-hover:underline">
                  {bid.price.toFixed(precision)}
                </span>
                <span className="relative z-10 text-zinc-300">{bid.amount.toFixed(3)}</span>
                <span className="relative z-10 text-zinc-400">{bid.total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
