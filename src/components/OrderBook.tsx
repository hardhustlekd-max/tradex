import React, { useState } from 'react';
import { OrderBookEntry } from '../types';
import { formatNumber } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { BookOpen, Flame, ShieldAlert, Zap } from 'lucide-react';

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
  const [showHeatMap, setShowHeatMap] = useState<boolean>(true);

  const maxAskTotal = asks.length > 0 ? Math.max(...asks.map((a) => a.total)) : 1;
  const maxBidTotal = bids.length > 0 ? Math.max(...bids.map((b) => b.total)) : 1;

  // Calculate average amount for liquidity wall detection
  const allEntries = [...asks, ...bids];
  const avgAmount = allEntries.length > 0 ? allEntries.reduce((acc, curr) => acc + curr.amount, 0) / allEntries.length : 1;
  const liquidityThreshold = avgAmount * 2.2; // Threshold for significant liquidity wall (support/resistance)

  // Calculate spread
  const lowestAsk = asks.length > 0 ? asks[asks.length - 1].price : currentPrice;
  const highestBid = bids.length > 0 ? bids[0].price : currentPrice;
  const spread = Math.max(0, lowestAsk - highestBid);
  const spreadPercent = ((spread / currentPrice) * 100).toFixed(2);

  const visibleAsks = viewMode === 'bids' ? [] : viewMode === 'asks' ? asks.slice(0, 16) : asks.slice(-8);
  const visibleBids = viewMode === 'asks' ? [] : viewMode === 'bids' ? bids.slice(0, 16) : bids.slice(0, 8);

  return (
    <div className="w-full lg:w-64 bg-[#0d1117] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col shrink-0 text-xs font-sans tabular-nums select-none h-full min-h-[250px] lg:min-h-0">
      {/* Orderbook Header Controls */}
      <div className="h-9 px-2.5 bg-[#181a20] border-b border-white/10 flex items-center justify-between text-zinc-400 shrink-0 font-sans">
        <div className="flex items-center gap-1.5 font-bold text-zinc-100">
          <BookOpen className="w-3.5 h-3.5 text-[#00c076]" />
          <span>Order Book</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Heatmap Toggle */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowHeatMap(!showHeatMap);
            }}
            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
              showHeatMap
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-white/5 text-zinc-400 hover:text-zinc-200 border border-white/10'
            }`}
            title="Toggle Liquidity Heat Map Overlay"
          >
            <Flame className={`w-3 h-3 ${showHeatMap ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
            <span>Heatmap</span>
          </button>

          {/* View Mode Icons */}
          <div className="flex items-center gap-0.5 bg-black/30 p-0.5 rounded border border-white/10">
            <button
              onClick={() => setViewMode('both')}
              className={`p-1 rounded cursor-pointer transition-colors ${viewMode === 'both' ? 'bg-white/15 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="Show Both Asks & Bids"
            >
              <div className="w-3 h-3 flex flex-col justify-between py-0.5">
                <div className="h-1 bg-[#f6465d] rounded-xs" />
                <div className="h-1 bg-[#00c076] rounded-xs" />
              </div>
            </button>

            <button
              onClick={() => setViewMode('asks')}
              className={`p-1 rounded cursor-pointer transition-colors ${viewMode === 'asks' ? 'bg-white/15 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="Show Asks Only"
            >
              <div className="w-3 h-3 flex flex-col justify-center gap-0.5">
                <div className="h-1 bg-[#f6465d] rounded-xs" />
                <div className="h-1 bg-[#f6465d]/60 rounded-xs" />
              </div>
            </button>

            <button
              onClick={() => setViewMode('bids')}
              className={`p-1 rounded cursor-pointer transition-colors ${viewMode === 'bids' ? 'bg-white/15 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="Show Bids Only"
            >
              <div className="w-3 h-3 flex flex-col justify-center gap-0.5">
                <div className="h-1 bg-[#00c076]/60 rounded-xs" />
                <div className="h-1 bg-[#00c076] rounded-xs" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Table Column Headers */}
      <div className="px-2 py-1 flex items-center justify-between text-[10px] text-zinc-400 border-b border-white/10 shrink-0 font-sans uppercase tracking-wider font-semibold">
        <span>Price (USDT)</span>
        <span>Size</span>
        <span>Total</span>
      </div>

      {/* Main Order Book Scroll List */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* Asks (Sell Orders - Red / Resistance) */}
        <div className="flex-1 flex flex-col justify-end overflow-hidden">
          {visibleAsks.map((ask, idx) => {
            const depthPercent = Math.min(100, (ask.total / maxAskTotal) * 100);
            const isLiquidityWall = ask.amount >= liquidityThreshold;

            return (
              <div
                key={`ask-${idx}`}
                onClick={() => {
                  soundFx.playClick();
                  onSelectPrice(ask.price);
                }}
                className={`relative flex items-center justify-between px-2 py-[2px] hover:bg-[#181a20] cursor-pointer transition-colors group text-[11px] font-sans leading-none ${
                  showHeatMap && isLiquidityWall ? 'bg-rose-500/10' : ''
                }`}
                title={isLiquidityWall ? 'Resistance Liquidity Wall' : undefined}
              >
                {/* Visual Depth Bar with Heatmap Gradient Intensity */}
                <div
                  className={`absolute right-0 top-0 bottom-0 transition-all duration-300 pointer-events-none ${
                    showHeatMap
                      ? isLiquidityWall
                        ? 'bg-gradient-to-l from-rose-600/40 via-amber-500/25 to-rose-500/15 border-l-2 border-amber-400 shadow-[inset_0_0_12px_rgba(251,191,36,0.2)]'
                        : 'bg-gradient-to-l from-[#f6465d]/25 to-[#f6465d]/10 border-l border-[#f6465d]/40'
                      : 'bg-[#f6465d]/15 border-l border-[#f6465d]/30'
                  }`}
                  style={{ width: `${depthPercent}%` }}
                />

                <span className="relative z-10 text-[#f6465d] font-semibold tracking-tight flex items-center gap-1">
                  {ask.price.toFixed(precision)}
                  {showHeatMap && isLiquidityWall && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold uppercase tracking-tighter shadow-xs animate-pulse">
                      Wall
                    </span>
                  )}
                </span>
                <span className="relative z-10 text-zinc-300 font-normal">{ask.amount.toFixed(3)}</span>
                <span className="relative z-10 text-zinc-400 font-normal">{ask.total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        {/* Current Mid Price Banner */}
        <div className="py-1 px-2 bg-[#181a20] border-y border-white/10 flex items-center justify-between shrink-0 my-0.5">
          <div className="flex items-center gap-1.5 font-sans">
            <span className="text-sm font-extrabold text-[#00c076] tracking-tight">{currentPrice.toFixed(precision)}</span>
            <span className="text-[10px] text-zinc-400">USDT</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-sans">Spread: {spread.toFixed(precision)} ({spreadPercent}%)</span>
        </div>

        {/* Bids (Buy Orders - Green / Support) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {visibleBids.map((bid, idx) => {
            const depthPercent = Math.min(100, (bid.total / maxBidTotal) * 100);
            const isLiquidityWall = bid.amount >= liquidityThreshold;

            return (
              <div
                key={`bid-${idx}`}
                onClick={() => {
                  soundFx.playClick();
                  onSelectPrice(bid.price);
                }}
                className={`relative flex items-center justify-between px-2 py-[2px] hover:bg-[#181a20] cursor-pointer transition-colors group text-[11px] font-sans leading-none ${
                  showHeatMap && isLiquidityWall ? 'bg-emerald-500/10' : ''
                }`}
                title={isLiquidityWall ? 'Support Liquidity Wall' : undefined}
              >
                {/* Visual Depth Bar with Heatmap Gradient Intensity */}
                <div
                  className={`absolute right-0 top-0 bottom-0 transition-all duration-300 pointer-events-none ${
                    showHeatMap
                      ? isLiquidityWall
                        ? 'bg-gradient-to-l from-emerald-600/40 via-amber-400/25 to-emerald-500/15 border-l-2 border-amber-400 shadow-[inset_0_0_12px_rgba(251,191,36,0.2)]'
                        : 'bg-gradient-to-l from-[#00c076]/25 to-[#00c076]/10 border-l border-[#00c076]/40'
                      : 'bg-[#00c076]/15 border-l border-[#00c076]/30'
                  }`}
                  style={{ width: `${depthPercent}%` }}
                />

                <span className="relative z-10 text-[#00c076] font-semibold tracking-tight flex items-center gap-1">
                  {bid.price.toFixed(precision)}
                  {showHeatMap && isLiquidityWall && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold uppercase tracking-tighter shadow-xs animate-pulse">
                      Wall
                    </span>
                  )}
                </span>
                <span className="relative z-10 text-zinc-300 font-normal">{bid.amount.toFixed(3)}</span>
                <span className="relative z-10 text-zinc-400 font-normal">{bid.total.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap Legend Footer (when active) */}
      {showHeatMap && (
        <div className="px-2.5 py-1 bg-[#12141a] border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-amber-300 font-bold">Support/Resistance Heatmap Active</span>
          </div>
          <span className="text-[9px] text-zinc-500">Amber Glow = High Liquidity Wall</span>
        </div>
      )}
    </div>
  );
};

