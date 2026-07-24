import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Position, Order, Portfolio, TradingPair } from '../types';
import { formatCurrency, formatNumber } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { 
  ChevronRight, 
  Pencil, 
  Share2, 
  ArrowUpDown, 
  Home, 
  BarChart2, 
  ArrowLeftRight, 
  Wallet,
  Layers,
  LayoutGrid
} from 'lucide-react';

export interface PositionsPanelProps {
  positions: Position[];
  orders: Order[];
  orderHistory: Order[];
  portfolio: Portfolio;
  pairs: TradingPair[];
  onClosePosition: (positionId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

export const PositionsPanel: React.FC<PositionsPanelProps> = ({
  positions,
  orders,
  orderHistory,
  portfolio,
  pairs,
  onClosePosition,
  onCancelOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'copy'>('positions');
  const [showCurrentOnly, setShowCurrentOnly] = useState(false);

  const openOrdersCount = orders.filter((o) => o.status === 'open').length;

  // Fallback demo position if no positions exist
  const displayPositions: Position[] = positions.length > 0 ? positions : [
    {
      id: 'demo-pos-1',
      symbol: 'XRPUSDT',
      side: 'short',
      size: 40,
      entryPrice: 1.1317,
      markPrice: 1.1317,
      liquidationPrice: 1.1877,
      leverage: 20,
      margin: 2.2634,
      pnl: 0.0000,
      pnlPercentage: 0.00,
    }
  ];

  return (
    <div id="positions-section" className="w-full bg-[#131722] border-t border-white/5 flex flex-col shrink-0 text-xs font-sans select-none overflow-hidden pb-12">
      {/* Scroll Section Header Banner */}
      <div className="px-4 py-2 bg-[#1c2230]/70 border-b border-white/5 flex items-center justify-between text-zinc-400 text-[11px]">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-zinc-200">Terminal Positions & Open Orders</span>
        </div>
        <span className="text-[10px] text-amber-400/90 font-mono font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/15">
          Scroll Overview
        </span>
      </div>

      {/* 1. Header Row Tabs: Positions (1) | Orders (0) | Copy trades */}
      <div className="h-9 px-4 bg-[#131722] border-b border-white/5 flex items-center justify-between text-zinc-400 shrink-0">
        <div className="flex items-center gap-6 font-medium text-xs">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('positions');
            }}
            className={`relative py-2 transition-colors cursor-pointer ${
              activeTab === 'positions' ? 'text-amber-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Positions ({displayPositions.length})</span>
            {activeTab === 'positions' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('orders');
            }}
            className={`relative py-2 transition-colors cursor-pointer ${
              activeTab === 'orders' ? 'text-amber-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Orders ({openOrdersCount})</span>
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('copy');
            }}
            className={`relative py-2 transition-colors cursor-pointer ${
              activeTab === 'copy' ? 'text-amber-400 font-extrabold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Copy trades</span>
            {activeTab === 'copy' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Right Layout Toggle Icon */}
        <button className="text-zinc-300 hover:text-white cursor-pointer p-0.5">
          <LayoutGrid className="w-3.5 h-3.5 text-zinc-300" />
        </button>
      </div>

      {/* 2. Controls Row: [ ] Show current  |  Close all button */}
      <div className="px-4 py-2 flex items-center justify-between bg-[#131722] shrink-0 text-xs text-zinc-300 border-b border-white/5">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showCurrentOnly}
            onChange={(e) => setShowCurrentOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded bg-[#1c2230] border-white/20 text-amber-400 focus:ring-0 cursor-pointer accent-amber-400"
          />
          <span className="text-zinc-300 font-medium text-[11px]">Show current pair only</span>
        </label>

        <button
          onClick={() => {
            soundFx.playClick();
            displayPositions.forEach((p) => onClosePosition(p.id));
          }}
          className="px-3 py-1 rounded-full bg-[#1c2230] hover:bg-[#252d3d] text-white font-semibold text-[11px] transition-colors cursor-pointer border border-white/10"
        >
          Close all
        </button>
      </div>

      {/* 3. Position Items Content */}
      <div className="px-4 py-3 space-y-4">
        {activeTab === 'positions' && (
          <>
            {displayPositions.map((pos) => {
              const isLong = pos.side === 'long';
              const isPnlPositive = pos.pnl >= 0;
              const baseAsset = pos.symbol.replace('USDT', '');

              return (
                <div key={pos.id} className="space-y-2.5 p-3 rounded-xl bg-[#1c2230]/40 border border-white/5">
                  {/* Pair Header + Share Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-sans">
                      <span className="font-extrabold text-sm text-white tracking-tight flex items-center gap-0.5">
                        {pos.symbol}
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </span>
                    </div>

                    <button className="text-zinc-400 hover:text-white cursor-pointer p-1 rounded hover:bg-white/5 transition-colors">
                      <Share2 className="w-3.5 h-3.5 text-zinc-300" />
                    </button>
                  </div>

                  {/* Badges Row: [Short] [Cross (Combined)] [20x pencil] */}
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        isLong
                          ? 'bg-[#00c076]/20 text-[#00c076] border border-[#00c076]/30'
                          : 'bg-[#f6465d]/20 text-[#f6465d] border border-[#f6465d]/30'
                      }`}
                    >
                      {isLong ? 'Long' : 'Short'}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-[#1c2230] text-zinc-300 font-medium border border-white/5">
                      Cross (Combined)
                    </span>

                    <span className="px-2 py-0.5 rounded bg-[#1c2230] text-amber-400 font-bold border border-amber-400/30 flex items-center gap-1">
                      <span>{pos.leverage}x</span>
                      <Pencil className="w-2.5 h-2.5 text-amber-400" />
                    </span>
                  </div>

                  {/* Row 1: Unrealized PnL & ROI */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="text-[10px] text-zinc-400 font-sans">Unrealized PnL (USDT)</div>
                      <div className={`text-lg font-extrabold font-sans tracking-tight mt-0.5 ${
                        isPnlPositive ? 'text-[#00c076]' : 'text-[#f6465d]'
                      }`}>
                        {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(4)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400 font-sans">ROI</div>
                      <div className={`text-lg font-extrabold font-sans tracking-tight mt-0.5 ${
                        isPnlPositive ? 'text-[#00c076]' : 'text-[#f6465d]'
                      }`}>
                        {pos.pnlPercentage >= 0 ? '+' : ''}{pos.pnlPercentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Amount | Margin | Margin ratio */}
                  <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <div className="text-[10px] text-zinc-400 underline decoration-dashed underline-offset-2">Amount ({baseAsset})</div>
                      <div className="font-semibold text-white mt-0.5 font-mono text-xs">{pos.size}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-zinc-400 underline decoration-dashed underline-offset-2">Margin (USDT)</div>
                      <div className="font-semibold text-white mt-0.5 font-mono text-xs">{pos.margin.toFixed(4)}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-zinc-400">Margin ratio</div>
                      <div className="font-semibold text-emerald-400 mt-0.5 font-mono text-xs">3.87%</div>
                    </div>
                  </div>

                  {/* Row 3: Entry price | Mark price | Liq. price */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] text-zinc-400">Entry price (USDT)</div>
                      <div className="font-semibold text-white mt-0.5 font-mono text-xs">{pos.entryPrice.toFixed(4)}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-zinc-400">Mark price (USDT)</div>
                      <div className="font-semibold text-white mt-0.5 font-mono text-xs">{pos.markPrice.toFixed(4)}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-zinc-400">Liq. price</div>
                      <div className="font-semibold text-rose-400 mt-0.5 font-mono text-xs">{pos.liquidationPrice.toFixed(4)}</div>
                    </div>
                  </div>

                  {/* Row 4: Breakeven price */}
                  <div className="text-xs">
                    <div className="text-[10px] text-zinc-400 underline decoration-dashed underline-offset-2">Breakeven price</div>
                    <div className="font-semibold text-white mt-0.5 font-mono text-xs">{(pos.entryPrice * 0.9983).toFixed(4)}</div>
                  </div>

                  {/* Action Buttons Row: [TP/SL] [Close] [Flash close] [↑↓] */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => soundFx.playClick()}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#1c2230] hover:bg-[#252d3d] text-white font-bold text-[11px] transition-colors cursor-pointer text-center border border-white/10"
                    >
                      TP/SL
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playOrderFilled();
                        onClosePosition(pos.id);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-[#1c2230] hover:bg-[#252d3d] text-white font-bold text-[11px] transition-colors cursor-pointer text-center border border-white/10"
                    >
                      Close
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playOrderFilled();
                        onClosePosition(pos.id);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-400 font-bold text-[11px] transition-colors cursor-pointer text-center border border-amber-400/30"
                    >
                      Flash close
                    </button>

                    <button
                      onClick={() => soundFx.playClick()}
                      className="p-1.5 rounded-lg bg-[#1c2230] hover:bg-[#252d3d] text-white transition-colors cursor-pointer shrink-0 border border-white/10"
                      title="Reverse Position"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === 'orders' && (
          <div className="py-8 text-center text-zinc-400 text-xs">
            {orders.length === 0 ? 'No active open orders' : `${orders.length} open orders available`}
          </div>
        )}

        {activeTab === 'copy' && (
          <div className="py-8 text-center text-zinc-400 text-xs">
            No active copy trading positions
          </div>
        )}
      </div>
    </div>
  );
};

interface BottomPanelsProps {
  positions: Position[];
  orders: Order[];
  orderHistory: Order[];
  portfolio: Portfolio;
  pairs: TradingPair[];
  onClosePosition: (positionId: string) => void;
  onCancelOrder: (orderId: string) => void;
  activeNavDock?: 'home' | 'markets' | 'futures' | 'trade' | 'assets';
  onSelectNavDock?: (dock: 'home' | 'markets' | 'futures' | 'trade' | 'assets') => void;
}

export const BottomPanels: React.FC<BottomPanelsProps> = ({
  activeNavDock = 'futures',
  onSelectNavDock,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full bg-[#131722]/95 backdrop-blur-xl border-t border-white/5 select-none shadow-lg">
      <div className="max-w-lg mx-auto h-16 px-2 flex items-center justify-around text-[10px] font-sans">
        {/* 1. Home */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onSelectNavDock) onSelectNavDock('home');
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative ${
            activeNavDock === 'home'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          {activeNavDock === 'home' && (
            <motion.span
              layoutId="activeDockIndicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm shadow-amber-400/50"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Home className="w-5 h-5 text-current" />
          <span className="text-[11px] tracking-tight">Home</span>
        </button>

        {/* 2. Markets */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onSelectNavDock) onSelectNavDock('markets');
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative ${
            activeNavDock === 'markets'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          {activeNavDock === 'markets' && (
            <motion.span
              layoutId="activeDockIndicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm shadow-amber-400/50"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <BarChart2 className="w-5 h-5 text-current" />
          <span className="text-[11px] tracking-tight">Markets</span>
        </button>

        {/* 3. Futures */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onSelectNavDock) onSelectNavDock('futures');
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative ${
            activeNavDock === 'futures'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          {activeNavDock === 'futures' && (
            <motion.span
              layoutId="activeDockIndicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm shadow-amber-400/50"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <div className="w-5 h-4 border-[1.5px] border-current rounded-[2px] flex items-center justify-center p-[1px]">
            <div className="w-2 h-1.5 bg-current rounded-[1px]" />
          </div>
          <span className="text-[11px] tracking-tight">Futures</span>
        </button>

        {/* 4. Trade */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onSelectNavDock) onSelectNavDock('trade');
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative ${
            activeNavDock === 'trade'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          {activeNavDock === 'trade' && (
            <motion.span
              layoutId="activeDockIndicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm shadow-amber-400/50"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <ArrowLeftRight className="w-5 h-5 text-current" />
          <span className="text-[11px] tracking-tight">Trade</span>
        </button>

        {/* 5. Assets */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onSelectNavDock) onSelectNavDock('assets');
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative ${
            activeNavDock === 'assets'
              ? 'text-amber-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          {activeNavDock === 'assets' && (
            <motion.span
              layoutId="activeDockIndicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm shadow-amber-400/50"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Wallet className="w-5 h-5 text-current" />
          <span className="text-[11px] tracking-tight">Assets</span>
        </button>
      </div>
    </div>
  );
};
