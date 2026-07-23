import React, { useState } from 'react';
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
  LayoutGrid,
  Check,
  X
} from 'lucide-react';

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
  positions,
  orders,
  orderHistory,
  portfolio,
  pairs,
  onClosePosition,
  onCancelOrder,
  activeNavDock = 'futures',
  onSelectNavDock,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'copy'>('positions');
  const [showCurrentOnly, setShowCurrentOnly] = useState(false);

  const openOrdersCount = orders.filter((o) => o.status === 'open').length;

  // Fallback demo position if no positions exist, matching screenshot format
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
    <div className="bg-[#000000] border-t border-zinc-900 flex flex-col shrink-0 text-xs font-sans select-none overflow-hidden pb-1">
      {/* 1. Header Row Tabs: Positions (1) | Orders (0) | Copy trades */}
      <div className="h-8 px-3 bg-[#000000] border-b border-zinc-900 flex items-center justify-between text-zinc-400 shrink-0">
        <div className="flex items-center gap-4 font-medium text-xs">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('positions');
            }}
            className={`relative py-1.5 transition-colors cursor-pointer ${
              activeTab === 'positions' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Positions ({displayPositions.length})</span>
            {activeTab === 'positions' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('orders');
            }}
            className={`relative py-1.5 transition-colors cursor-pointer ${
              activeTab === 'orders' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Orders ({openOrdersCount})</span>
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('copy');
            }}
            className={`relative py-1.5 transition-colors cursor-pointer ${
              activeTab === 'copy' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Copy trades</span>
            {activeTab === 'copy' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* Right Layout Toggle Icon */}
        <button className="text-zinc-300 hover:text-white cursor-pointer p-0.5">
          <LayoutGrid className="w-3.5 h-3.5 text-zinc-300" />
        </button>
      </div>

      {/* 2. Controls Row: [ ] Show current  |  Close all button */}
      <div className="px-3 py-1.5 flex items-center justify-between bg-[#000000] shrink-0 text-xs text-zinc-300">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showCurrentOnly}
            onChange={(e) => setShowCurrentOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-white focus:ring-0 cursor-pointer accent-white"
          />
          <span className="text-zinc-300 font-medium text-[11px]">Show current</span>
        </label>

        <button
          onClick={() => {
            soundFx.playClick();
            displayPositions.forEach((p) => onClosePosition(p.id));
          }}
          className="px-2.5 py-0.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white font-medium text-[11px] transition-colors cursor-pointer"
        >
          Close all
        </button>
      </div>

      {/* 3. Position Items Content */}
      <div className="px-3 py-1 space-y-3">
        {activeTab === 'positions' && (
          <>
            {displayPositions.map((pos) => {
              const isLong = pos.side === 'long';
              const isPnlPositive = pos.pnl >= 0;
              const baseAsset = pos.symbol.replace('USDT', '');

              return (
                <div key={pos.id} className="space-y-2 pt-1 border-t border-zinc-900/80 first:border-t-0">
                  {/* Pair Header + Share Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-sans">
                      <span className="font-bold text-sm text-white tracking-tight flex items-center gap-0.5">
                        {pos.symbol}
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </span>
                    </div>

                    <button className="text-zinc-400 hover:text-white cursor-pointer p-0.5">
                      <Share2 className="w-3.5 h-3.5 text-zinc-300" />
                    </button>
                  </div>

                  {/* Badges Row: [Short] [Cross (Combined)] [20x pencil] */}
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-semibold ${
                        isLong
                          ? 'bg-[#0c3120] text-[#00c076]'
                          : 'bg-[#3b1219] text-[#f6465d]'
                      }`}
                    >
                      {isLong ? 'Long' : 'Short'}
                    </span>

                    <span className="px-1.5 py-0.5 rounded bg-[#1c1c1e] text-zinc-300 font-medium">
                      Cross (Combined)
                    </span>

                    <span className="px-1.5 py-0.5 rounded bg-[#1c1c1e] text-zinc-300 font-medium flex items-center gap-0.5">
                      <span>{pos.leverage}x</span>
                      <Pencil className="w-2.5 h-2.5 text-zinc-400" />
                    </span>
                  </div>

                  {/* Row 1: Unrealized PnL & ROI */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div>
                      <div className="text-[10px] text-zinc-400 font-sans">Unrealized PnL (USDT)</div>
                      <div className={`text-base font-bold font-sans tracking-tight mt-0.5 ${
                        isPnlPositive ? 'text-white' : 'text-[#f6465d]'
                      }`}>
                        {pos.pnl.toFixed(4)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400 font-sans">ROI</div>
                      <div className={`text-base font-bold font-sans tracking-tight mt-0.5 ${
                        isPnlPositive ? 'text-white' : 'text-[#f6465d]'
                      }`}>
                        {pos.pnlPercentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Amount | Margin | Margin ratio */}
                  <div className="grid grid-cols-3 gap-2 text-xs pt-0.5">
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
                      <div className="font-semibold text-white mt-0.5 font-mono text-xs">3.87%</div>
                    </div>
                  </div>

                  {/* Row 3: Entry price | Mark price | Liq. price */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
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
                      <div className="font-semibold text-white mt-0.5 font-mono text-xs">{pos.liquidationPrice.toFixed(4)}</div>
                    </div>
                  </div>

                  {/* Row 4: Breakeven price */}
                  <div className="text-xs">
                    <div className="text-[10px] text-zinc-400 underline decoration-dashed underline-offset-2">Breakeven price</div>
                    <div className="font-semibold text-white mt-0.5 font-mono text-xs">{(pos.entryPrice * 0.9983).toFixed(4)}</div>
                  </div>

                  {/* Action Buttons Row: [TP/SL] [Close] [Flash close] [↑↓] */}
                  <div className="flex items-center gap-1.5 pt-1.5 pb-0.5">
                    <button
                      onClick={() => soundFx.playClick()}
                      className="flex-1 py-1.5 px-2 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white font-medium text-[11px] transition-colors cursor-pointer text-center"
                    >
                      TP/SL
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playOrderFilled();
                        onClosePosition(pos.id);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white font-medium text-[11px] transition-colors cursor-pointer text-center"
                    >
                      Close
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playOrderFilled();
                        onClosePosition(pos.id);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white font-medium text-[11px] transition-colors cursor-pointer text-center"
                    >
                      Flash close
                    </button>

                    <button
                      onClick={() => soundFx.playClick()}
                      className="p-1.5 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white transition-colors cursor-pointer shrink-0"
                      title="Reverse Position"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === 'orders' && (
          <div className="py-4 text-center text-zinc-400 text-xs">
            {orders.length === 0 ? 'No active open orders' : `${orders.length} open orders available`}
          </div>
        )}

        {activeTab === 'copy' && (
          <div className="py-4 text-center text-zinc-400 text-xs">
            No active copy trading positions
          </div>
        )}
      </div>

      {/* 4. Bottom Floating Navigation Dock Bar */}
      <div className="sticky bottom-0 z-30 bg-[#000000]/95 backdrop-blur-md border-t border-zinc-900/60 px-2 pt-1 pb-1">
        <div className="bg-[#1c1c1e] backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-1 flex items-center justify-around text-zinc-400 text-[9px] font-sans">
          {/* 1. Home */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onSelectNavDock) onSelectNavDock('home');
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer px-2 py-0.5 transition-colors ${
              activeNavDock === 'home'
                ? 'bg-[#2c2c2e] text-white rounded-xl px-3 py-1 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Home className="w-4 h-4 text-current" />
            <span>Home</span>
          </button>

          {/* 2. Markets */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onSelectNavDock) onSelectNavDock('markets');
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer px-2 py-0.5 transition-colors ${
              activeNavDock === 'markets'
                ? 'bg-[#2c2c2e] text-white rounded-xl px-3 py-1 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-current" />
            <span>Markets</span>
          </button>

          {/* 3. Futures */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onSelectNavDock) onSelectNavDock('futures');
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer px-2 py-0.5 transition-colors ${
              activeNavDock === 'futures'
                ? 'bg-[#2c2c2e] text-white rounded-xl px-3 py-1 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="w-4 h-3.5 border border-current rounded-xs flex items-center justify-center p-[1px]">
              <div className="w-1.5 h-1 bg-current rounded-xs" />
            </div>
            <span>Futures</span>
          </button>

          {/* 4. Trade */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onSelectNavDock) onSelectNavDock('trade');
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer px-2 py-0.5 transition-colors ${
              activeNavDock === 'trade'
                ? 'bg-[#2c2c2e] text-white rounded-xl px-3 py-1 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4 text-current" />
            <span>Trade</span>
          </button>

          {/* 5. Assets */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (onSelectNavDock) onSelectNavDock('assets');
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer px-2 py-0.5 transition-colors ${
              activeNavDock === 'assets'
                ? 'bg-[#2c2c2e] text-white rounded-xl px-3 py-1 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wallet className="w-4 h-4 text-current" />
            <span>Assets</span>
          </button>
        </div>
      </div>
    </div>
  );
};

