import React, { useState } from 'react';
import { Position, Order } from '../types';
import { soundFx } from '../utils/audio';
import { Layers, History, ShieldAlert, ArrowUpDown, CheckCircle2, Clock, X } from 'lucide-react';

interface PositionHistoryProps {
  positions: Position[];
  orders: Order[];
  orderHistory: Order[];
  onClosePosition: (id: string) => void;
  onCancelOrder: (id: string) => void;
}

export const PositionHistory: React.FC<PositionHistoryProps> = ({
  positions,
  orders,
  orderHistory,
  onClosePosition,
  onCancelOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');

  const openOrdersCount = orders.filter((o) => o.status === 'open').length;

  return (
    <div className="w-full h-full bg-[#0d1117] flex flex-col text-xs font-sans select-none min-h-0">
      {/* Header Tabs Bar */}
      <div className="h-9 px-3 bg-[#181a20] border-b border-white/10 flex items-center justify-between text-zinc-100 font-bold shrink-0">
        <div className="flex items-center gap-1.5 font-medium text-[11px]">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('positions');
            }}
            className={`py-1 px-3 rounded-lg cursor-pointer transition-all ${
              activeTab === 'positions'
                ? 'bg-[#0d1117] text-white border border-white/10 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Positions ({positions.length})
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('orders');
            }}
            className={`py-1 px-3 rounded-lg cursor-pointer transition-all ${
              activeTab === 'orders'
                ? 'bg-[#0d1117] text-white border border-white/10 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Orders ({openOrdersCount})
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('history');
            }}
            className={`py-1 px-3 rounded-lg cursor-pointer transition-all ${
              activeTab === 'history'
                ? 'bg-[#0d1117] text-white border border-white/10 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            History ({orderHistory.length})
          </button>
        </div>
      </div>

      {/* Tab Content List */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {/* Positions Tab */}
        {activeTab === 'positions' && (
          positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 gap-2 h-full">
              <Layers className="w-8 h-8 text-zinc-600 stroke-[1.5]" />
              <span className="text-xs font-semibold text-zinc-400">No open positions</span>
              <span className="text-[10px] text-zinc-600">Open a Long or Short trade to track PnL here</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {positions.map((pos) => {
                const isLong = pos.side === 'long';
                const isPnlPos = pos.pnl >= 0;

                return (
                  <div
                    key={pos.id}
                    className="p-3.5 rounded-xl bg-[#181a20] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-2.5 shadow-sm"
                  >
                    {/* Symbol + Long/Short Badge + Leverage */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                        <span>{pos.symbol}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                            isLong
                              ? 'bg-[#00c076]/10 text-[#00c076] border border-[#00c076]/20'
                              : 'bg-[#f6465d]/10 text-[#f6465d] border border-[#f6465d]/20'
                          }`}
                        >
                          {isLong ? 'Long' : 'Short'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#0d1117] text-zinc-300 text-[9px] border border-white/10 font-mono">
                          {pos.leverage}x
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          soundFx.playOrderFilled();
                          onClosePosition(pos.id);
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#f6465d]/15 hover:bg-[#f6465d]/25 text-[#f6465d] text-[10px] font-bold transition-all cursor-pointer border border-[#f6465d]/20"
                      >
                        Close
                      </button>
                    </div>

                    {/* Unrealized PnL & ROI */}
                    <div className="grid grid-cols-2 gap-2 bg-[#0d1117] p-2 rounded-lg border border-white/5 font-mono">
                      <div>
                        <div className="text-[9px] text-zinc-500 font-sans font-medium">Unrealized PnL</div>
                        <div className={`text-xs font-extrabold ${isPnlPos ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                          {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} USDT
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[9px] text-zinc-500 font-sans font-medium font-mono">ROI</div>
                        <div className={`text-xs font-extrabold ${isPnlPos ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                          {pos.pnlPercentage >= 0 ? '+' : ''}{pos.pnlPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Details: Size, Entry, Mark */}
                    <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-zinc-300">
                      <div>
                        <div className="text-zinc-500 text-[9px] font-sans">Size</div>
                        <div className="font-semibold text-zinc-300">{pos.size}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-[9px] font-sans">Entry</div>
                        <div className="font-semibold text-zinc-300">${pos.entryPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-[9px] font-sans">Mark</div>
                        <div className="font-semibold text-zinc-300">${pos.markPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 gap-2 h-full">
              <Clock className="w-8 h-8 text-zinc-600 stroke-[1.5]" />
              <span className="text-xs font-semibold text-zinc-400">No active limit orders</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-xl bg-[#181a20] border border-white/10 space-y-2 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <div className="flex items-center gap-1.5">
                      <span>{ord.symbol}</span>
                      <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${ord.side === 'buy' ? 'bg-[#00c076]/10 text-[#00c076] border border-[#00c076]/20' : 'bg-[#f6465d]/10 text-[#f6465d] border border-[#f6465d]/20'}`}>
                        {ord.side}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onCancelOrder(ord.id);
                      }}
                      className="text-zinc-400 hover:text-rose-400 cursor-pointer p-1 rounded-md hover:bg-white/5 transition-all"
                      title="Cancel Order"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-300 bg-[#0d1117] p-2 rounded-lg border border-white/5">
                    <div>
                      <div className="text-[9px] text-zinc-500 font-sans">Price</div>
                      <div className="font-semibold text-zinc-300">${ord.price.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-zinc-500 font-sans">Amount</div>
                      <div className="font-semibold text-zinc-300">{ord.amount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          orderHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 gap-2 h-full">
              <History className="w-8 h-8 text-zinc-600 stroke-[1.5]" />
              <span className="text-xs font-semibold text-zinc-400">No order or position history</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {orderHistory.map((item: any) => {
                const hasPnl = typeof item.pnl === 'number';
                const isPnlPos = (item.pnl || 0) >= 0;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#181a20] border border-white/10 space-y-2 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{item.symbol}</span>
                        <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                          item.positionSide === 'long' || item.side === 'buy'
                            ? 'bg-[#00c076]/10 text-[#00c076] border border-[#00c076]/20'
                            : 'bg-[#f6465d]/10 text-[#f6465d] border border-[#f6465d]/20'
                        }`}>
                          {item.positionSide ? (item.positionSide === 'long' ? 'Long' : 'Short') : item.side}
                        </span>
                        {item.leverage && (
                          <span className="px-1.5 py-0.5 rounded bg-[#0d1117] text-zinc-400 text-[9px] border border-white/10 font-mono">
                            {item.leverage}x
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[9px] text-[#00c076] font-bold bg-[#00c076]/10 px-1.5 py-0.5 rounded border border-[#00c076]/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="uppercase">{item.status}</span>
                      </div>
                    </div>

                    {hasPnl && (
                      <div className="grid grid-cols-2 gap-2 bg-[#0d1117] p-2 rounded-lg border border-white/5 font-mono">
                        <div>
                          <div className="text-[9px] text-zinc-500 font-sans">Realized PnL</div>
                          <div className={`text-xs font-bold ${isPnlPos ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                            {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-zinc-500 font-sans">ROI</div>
                          <div className={`text-xs font-bold ${isPnlPos ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                            {item.pnlPercentage >= 0 ? '+' : ''}{(item.pnlPercentage || 0).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-0.5">
                      <span>Price: <strong className="text-zinc-200">${item.price ? item.price.toFixed(2) : '0.00'}</strong></span>
                      <span>Amount: <strong className="text-zinc-200">{item.amount}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
};
