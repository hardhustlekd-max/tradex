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
  const displayPositions = positions;

  return (
    <div id="positions-section" className="w-full bg-[#0e1117] border-t border-white/5 flex flex-col shrink-0 text-xs font-sans select-none overflow-hidden pb-12">
      {/* Scroll Section Header Banner */}
      <div className="px-4 py-2 bg-[#181a20]/70 border-b border-white/5 flex items-center justify-between text-zinc-400 text-[11px]">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-zinc-200">Terminal Positions & Open Orders</span>
        </div>
        <span className="text-[10px] text-amber-400/90 font-mono font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/15">
          Scroll Overview
        </span>
      </div>

      {/* 1. Header Row Tabs: Positions (1) | Orders (0) | Copy trades */}
      <div className="py-1 px-3 bg-[#0a0805] border-b border-amber-500/10 flex items-center justify-between text-zinc-400 shrink-0">
        <div className="flex items-center gap-2 font-medium text-xs">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('positions');
            }}
            className={`py-1.5 px-3 transition-all cursor-pointer ${
              activeTab === 'positions' ? 'app-tab-active' : 'app-tab-inactive'
            }`}
          >
            <span>Positions ({displayPositions.length})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('orders');
            }}
            className={`py-1.5 px-3 transition-all cursor-pointer ${
              activeTab === 'orders' ? 'app-tab-active' : 'app-tab-inactive'
            }`}
          >
            <span>Orders ({openOrdersCount})</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('copy');
            }}
            className={`py-1.5 px-3 transition-all cursor-pointer ${
              activeTab === 'copy' ? 'app-tab-active' : 'app-tab-inactive'
            }`}
          >
            <span>Copy trades</span>
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
            {displayPositions.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 font-sans space-y-1">
                <Layers className="w-7 h-7 mx-auto text-zinc-600 stroke-[1.5]" />
                <p className="text-xs font-semibold text-zinc-400">No open positions</p>
                <p className="text-[10px] text-zinc-600">Open a Long or Short trade to see real-time positions here</p>
              </div>
            ) : (
              displayPositions.map((pos) => {
                const isLong = pos.side === 'long';
                const isPnlPositive = pos.pnl >= 0;
                const baseAsset = pos.symbol.replace('USDT', '');

                return (
                  <div key={pos.id} className="p-3.5 bg-[#131722]/60 rounded-xl border border-white/5 space-y-3.5 transition-all">
                    {/* Header: Name, Side, Leverage and PnL */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white tracking-tight">{pos.symbol}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          isLong
                            ? 'bg-[#00c076]/10 text-[#00c076] border border-[#00c076]/20'
                            : 'bg-[#f6465d]/10 text-[#f6465d] border border-[#f6465d]/20'
                        }`}>
                          {isLong ? 'Long' : 'Short'} {pos.leverage}x
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`font-extrabold text-xs font-mono tabular-nums ${
                          isPnlPositive ? 'text-[#00c076]' : 'text-[#f6465d]'
                        }`}>
                          {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} USDT ({pos.pnlPercentage >= 0 ? '+' : ''}{pos.pnlPercentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>

                    {/* Simple Column Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2.5 py-1.5 border-t border-b border-white/5 text-[11px]">
                      <div>
                        <div className="text-zinc-500 font-medium">Size ({baseAsset})</div>
                        <div className="font-bold text-zinc-200 mt-0.5 font-mono">{pos.size}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 font-medium">Entry / Mark</div>
                        <div className="font-bold text-zinc-200 mt-0.5 font-mono text-zinc-300">
                          {pos.entryPrice.toFixed(2)} / {pos.markPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-zinc-500 font-medium">Est. Liq Price</div>
                        <div className="font-bold text-rose-400 mt-0.5 font-mono">{pos.liquidationPrice.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Streamlined Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-0.5">
                      <button
                        onClick={() => soundFx.playClick()}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-[11px] transition-colors cursor-pointer border border-white/5"
                      >
                        TP/SL
                      </button>
                      <button
                        onClick={() => {
                          soundFx.playOrderFilled();
                          onClosePosition(pos.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#f6465d]/15 hover:bg-[#f6465d]/25 text-[#f6465d] font-bold text-[11px] transition-colors cursor-pointer border border-[#f6465d]/20"
                      >
                        Close Position
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full bg-[#181a20] border-t border-[#2b313a]/80 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto h-14 px-1 flex items-center justify-around text-[10px] font-sans">
        {/* 1. Home */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onSelectNavDock) onSelectNavDock('home');
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative ${
            activeNavDock === 'home'
              ? 'text-[#00c076] font-bold'
              : 'text-[#848e9c] hover:text-white font-medium'
          }`}
        >
          {activeNavDock === 'home' && (
            <motion.span
              layoutId="activeDockIndicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[2.5px] bg-[#00c076] rounded-b-full shadow-[0_2px_8px_rgba(0,192,118,0.6)]"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Home className="w-5 h-5 text-current stroke-[1.8]" />
          <span className="text-[10px] tracking-tight leading-none">Home</span>
        </button>

        {/* 2. Markets */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onSelectNavDock) onSelectNavDock('markets');
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative ${
            activeNavDock === 'markets'
              ? 'text-[#00c076] font-bold'
              : 'text-[#848e9c] hover:text-white font-medium'
          }`}
        >
          {activeNavDock === 'markets' && (
            <motion.span
              layoutId="activeDockIndicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[2.5px] bg-[#00c076] rounded-b-full shadow-[0_2px_8px_rgba(0,192,118,0.6)]"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <BarChart2 className="w-5 h-5 text-current stroke-[1.8]" />
          <span className="text-[10px] tracking-tight leading-none">Markets</span>
        </button>

        {/* 3. Trade (Center Button matching Binance mobile dock) */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onSelectNavDock) onSelectNavDock('trade');
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors relative ${
            activeNavDock === 'trade'
              ? 'text-[#00c076] font-bold'
              : 'text-[#848e9c] hover:text-white font-medium'
          }`}
        >
          {activeNavDock === 'trade' && (
            <motion.span
              layoutId="activeDockIndicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[2.5px] bg-[#00c076] rounded-b-full shadow-[0_2px_8px_rgba(0,192,118,0.6)]"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            activeNavDock === 'trade'
              ? 'bg-[#00c076] text-white shadow-md shadow-[#00c076]/40 scale-105'
              : 'bg-[#2b313a]/80 text-[#848e9c] hover:bg-[#363d4a] hover:text-white'
          }`}>
            <ArrowLeftRight className="w-4 h-4 font-bold stroke-[2.2]" />
          </div>
          <span className="text-[10px] tracking-tight leading-none">Trade</span>
        </button>

        {/* 4. Futures */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onSelectNavDock) onSelectNavDock('futures');
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative ${
            activeNavDock === 'futures'
              ? 'text-[#00c076] font-bold'
              : 'text-[#848e9c] hover:text-white font-medium'
          }`}
        >
          {activeNavDock === 'futures' && (
            <motion.span
              layoutId="activeDockIndicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[2.5px] bg-[#00c076] rounded-b-full shadow-[0_2px_8px_rgba(0,192,118,0.6)]"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Layers className="w-5 h-5 text-current stroke-[1.8]" />
          <span className="text-[10px] tracking-tight leading-none">Futures</span>
        </button>

        {/* 5. Wallets / Assets */}
        <button
          onClick={() => {
            soundFx.playClick();
            if (onSelectNavDock) onSelectNavDock('assets');
          }}
          className={`flex-1 h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative ${
            activeNavDock === 'assets'
              ? 'text-[#00c076] font-bold'
              : 'text-[#848e9c] hover:text-white font-medium'
          }`}
        >
          {activeNavDock === 'assets' && (
            <motion.span
              layoutId="activeDockIndicator"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[2.5px] bg-[#00c076] rounded-b-full shadow-[0_2px_8px_rgba(0,192,118,0.6)]"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Wallet className="w-5 h-5 text-current stroke-[1.8]" />
          <span className="text-[10px] tracking-tight leading-none">Wallets</span>
        </button>
      </div>
    </div>
  );
};
