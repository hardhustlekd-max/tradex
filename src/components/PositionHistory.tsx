import React, { useState } from 'react';
import { Position, Order } from '../types';
import { soundFx } from '../utils/audio';
import { PositionCard } from './PositionCard';
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
              {positions.map((pos, idx) => (
                <PositionCard
                  key={`${pos.id}-${idx}`}
                  pos={pos}
                  onClosePosition={onClosePosition}
                />
              ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {orders.map((ord, idx) => {
                const isBuy = ord.side === 'buy';
                const baseAsset = ord.symbol.replace('USDT', '');
                return (
                  <div
                    key={`${ord.id}-${idx}`}
                    className="p-2.5 sm:p-3 rounded-lg bg-[#181a20] border border-white/5 space-y-2 transition-all text-sans select-none shadow-xs hover:border-white/10 flex flex-col justify-between"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap">
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center font-extrabold text-[9px] shrink-0 ${
                          isBuy ? 'bg-[#00c076] text-black' : 'bg-[#f6465d] text-white'
                        }`}>
                          {isBuy ? 'B' : 'S'}
                        </div>
                        <span className="font-bold text-white text-xs tracking-tight leading-none">{ord.symbol}</span>
                        <span className="px-1 py-0.5 rounded bg-[#2b313a] text-zinc-400 text-[9px] font-medium leading-none capitalize">
                          {ord.type.replace('_', ' ')}
                        </span>
                        {ord.leverage && (
                          <span className="px-1 py-0.5 rounded bg-[#2b313a] text-zinc-400 text-[9px] font-medium leading-none">
                            {ord.leverage}X
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onCancelOrder(ord.id);
                        }}
                        className="text-zinc-400 hover:text-rose-400 cursor-pointer p-1 rounded-md hover:bg-white/5 transition-all text-[10px] font-bold flex items-center gap-0.5"
                        title="Cancel Order"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metric Row */}
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-normal border-b border-dashed border-zinc-600/70 inline-block pb-0.5 self-start">
                          Order Price
                        </span>
                        <div className="text-xs font-bold text-white font-sans mt-0.5 leading-tight">
                          ${ord.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-normal border-b border-dashed border-zinc-600/70 inline-block pb-0.5 text-right">
                          Amount ({baseAsset})
                        </span>
                        <div className="text-xs font-bold text-zinc-200 font-sans mt-0.5 leading-tight">
                          {ord.amount}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Date / Status */}
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5 border-t border-white/5">
                      <span>Created: {ord.createdAt || 'Just now'}</span>
                      <span className="text-[#00c076] font-semibold uppercase">{ord.status}</span>
                    </div>
                  </div>
                );
              })}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {orderHistory.map((item: any, idx: number) => {
                const isLong = item.positionSide === 'long' || item.side === 'buy';
                const hasPnl = typeof item.pnl === 'number';
                const isPnlPos = (item.pnl || 0) >= 0;
                const baseAsset = item.symbol ? item.symbol.replace('USDT', '') : '';

                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="p-2.5 sm:p-3 rounded-lg bg-[#181a20] border border-white/5 space-y-2 transition-all text-sans select-none shadow-xs hover:border-white/10"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap">
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center font-extrabold text-[9px] shrink-0 ${
                          isLong ? 'bg-[#00c076] text-black' : 'bg-[#f6465d] text-white'
                        }`}>
                          {isLong ? 'B' : 'S'}
                        </div>
                        <span className="font-bold text-white text-xs tracking-tight leading-none">{item.symbol}</span>
                        <span className="px-1 py-0.5 rounded bg-[#2b313a] text-zinc-400 text-[9px] font-medium leading-none">
                          {isLong ? 'Long' : 'Short'}
                        </span>
                        {item.leverage && (
                          <span className="px-1 py-0.5 rounded bg-[#2b313a] text-zinc-400 text-[9px] font-medium leading-none">
                            {item.leverage}X
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[9px] text-[#00c076] font-bold bg-[#00c076]/10 px-1.5 py-0.5 rounded border border-[#00c076]/20">
                        <CheckCircle2 className="w-3 h-3 text-[#00c076]" />
                        <span className="uppercase">{item.status || 'closed'}</span>
                      </div>
                    </div>

                    {/* Metric Row: Size vs Realized PNL / ROI% */}
                    <div className="flex items-start justify-between gap-2 pt-0.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-400 font-normal border-b border-dashed border-zinc-600/70 inline-block pb-0.5 self-start">
                          Filled Size
                        </span>
                        <div className="text-xs font-bold text-white font-sans mt-0.5 leading-tight">
                          {item.amount} {baseAsset}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-sans mt-0.5">
                          @ ${item.price ? item.price.toFixed(2) : '0.00'}
                        </div>
                      </div>

                      {hasPnl && (
                        <div className="flex flex-col items-end text-right">
                          <span className="text-[10px] text-zinc-400 font-normal border-b border-dashed border-zinc-600/70 inline-block pb-0.5 text-right">
                            Realized PNL
                          </span>
                          <div className={`text-xs font-bold font-sans mt-0.5 leading-tight ${isPnlPos ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                            {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                          </div>
                          <div className={`text-[10px] font-semibold font-sans mt-0.5 ${isPnlPos ? 'text-[#00c076]' : 'text-[#f6465d]'}`}>
                            {item.pnlPercentage >= 0 ? '+' : ''}{(item.pnlPercentage || 0).toFixed(2)}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date / Time Footer */}
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5 border-t border-white/5">
                      <span>Time: {item.createdAt || 'Recent'}</span>
                      <span className="text-zinc-400">TradeX Futures</span>
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
