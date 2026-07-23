import React, { useState } from 'react';
import { Position, Order, Portfolio, TradingPair } from '../types';
import { formatCurrency, formatNumber } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { X, CheckCircle2, TrendingUp, TrendingDown, RefreshCw, Wallet } from 'lucide-react';

interface BottomPanelsProps {
  positions: Position[];
  orders: Order[];
  orderHistory: Order[];
  portfolio: Portfolio;
  pairs: TradingPair[];
  onClosePosition: (positionId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

export const BottomPanels: React.FC<BottomPanelsProps> = ({
  positions,
  orders,
  orderHistory,
  portfolio,
  pairs,
  onClosePosition,
  onCancelOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history' | 'assets'>('positions');

  const openOrdersCount = orders.filter((o) => o.status === 'open').length;

  return (
    <div className="h-56 bg-zinc-950 border-t border-zinc-800/80 flex flex-col shrink-0 text-xs font-mono select-none overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="h-9 px-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center gap-4 text-zinc-400 shrink-0">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('positions');
          }}
          className={`flex items-center gap-1.5 py-2 border-b-2 font-semibold cursor-pointer transition-colors ${
            activeTab === 'positions'
              ? 'border-emerald-400 text-emerald-400 font-bold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <span>Positions ({positions.length})</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('orders');
          }}
          className={`flex items-center gap-1.5 py-2 border-b-2 font-semibold cursor-pointer transition-colors ${
            activeTab === 'orders'
              ? 'border-emerald-400 text-emerald-400 font-bold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <span>Open Orders ({openOrdersCount})</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('history');
          }}
          className={`flex items-center gap-1.5 py-2 border-b-2 font-semibold cursor-pointer transition-colors ${
            activeTab === 'history'
              ? 'border-emerald-400 text-emerald-400 font-bold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <span>Order History ({orderHistory.length})</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveTab('assets');
          }}
          className={`flex items-center gap-1.5 py-2 border-b-2 font-semibold cursor-pointer transition-colors ${
            activeTab === 'assets'
              ? 'border-emerald-400 text-emerald-400 font-bold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Demo Wallet</span>
        </button>
      </div>

      {/* Tab Contents Area */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Tab 1: Positions */}
        {activeTab === 'positions' && (
          <div>
            {positions.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-zinc-400">
                <p>No open futures positions</p>
                <p className="text-[10px] text-zinc-400">Open a position in the right order panel to test demo leverage.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-[10px] text-zinc-400">
                    <th className="p-1.5">Symbol</th>
                    <th className="p-1.5">Size / Leverage</th>
                    <th className="p-1.5">Entry Price</th>
                    <th className="p-1.5">Mark Price</th>
                    <th className="p-1.5">Margin</th>
                    <th className="p-1.5">Liq Price</th>
                    <th className="p-1.5">Unrealized PnL (ROI %)</th>
                    <th className="p-1.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {positions.map((pos) => {
                    const isLong = pos.side === 'long';
                    const isPnlPos = pos.pnl >= 0;

                    return (
                      <tr key={pos.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="p-1.5 font-bold text-zinc-200 flex items-center gap-1.5">
                          <span
                            className={`px-1 rounded text-[10px] uppercase ${
                              isLong ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {pos.side}
                          </span>
                          <span>{pos.symbol}</span>
                        </td>
                        <td className="p-1.5 text-zinc-300">
                          {pos.size} ({pos.leverage}x)
                        </td>
                        <td className="p-1.5 text-zinc-300">${pos.entryPrice.toFixed(2)}</td>
                        <td className="p-1.5 text-zinc-300">${pos.markPrice.toFixed(2)}</td>
                        <td className="p-1.5 text-zinc-300">{formatCurrency(pos.margin)}</td>
                        <td className="p-1.5 text-rose-400 font-semibold">${pos.liquidationPrice.toFixed(2)}</td>
                        <td className={`p-1.5 font-bold ${isPnlPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPnlPos ? '+' : ''}{formatCurrency(pos.pnl)} ({isPnlPos ? '+' : ''}{pos.pnlPercentage.toFixed(2)}%)
                        </td>
                        <td className="p-1.5 text-right">
                          <button
                            onClick={() => {
                              soundFx.playOrderFilled();
                              onClosePosition(pos.id);
                            }}
                            className="px-2 py-1 rounded bg-zinc-800 hover:bg-rose-950 hover:text-rose-300 text-zinc-300 border border-zinc-700 hover:border-rose-500/40 cursor-pointer transition-colors"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Open Orders */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-zinc-400">
                <p>No open limit or stop orders</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-[10px] text-zinc-400">
                    <th className="p-1.5">Date</th>
                    <th className="p-1.5">Symbol</th>
                    <th className="p-1.5">Type</th>
                    <th className="p-1.5">Side</th>
                    <th className="p-1.5">Price</th>
                    <th className="p-1.5">Amount</th>
                    <th className="p-1.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-1.5 text-zinc-400 text-[10px]">{ord.createdAt}</td>
                      <td className="p-1.5 font-bold text-zinc-200">{ord.symbol}</td>
                      <td className="p-1.5 text-zinc-400 uppercase">{ord.type}</td>
                      <td className={`p-1.5 font-bold capitalize ${ord.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {ord.side}
                      </td>
                      <td className="p-1.5 text-zinc-200">${ord.price.toFixed(2)}</td>
                      <td className="p-1.5 text-zinc-300">{ord.amount}</td>
                      <td className="p-1.5 text-right">
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onCancelOrder(ord.id);
                          }}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Order History */}
        {activeTab === 'history' && (
          <div>
            {orderHistory.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-zinc-400">
                <p>No trade history yet</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-[10px] text-zinc-400">
                    <th className="p-1.5">Time</th>
                    <th className="p-1.5">Symbol</th>
                    <th className="p-1.5">Type / Mode</th>
                    <th className="p-1.5">Side</th>
                    <th className="p-1.5">Filled Price</th>
                    <th className="p-1.5">Amount</th>
                    <th className="p-1.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {orderHistory.map((hist) => (
                    <tr key={hist.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="p-1.5 text-zinc-400 text-[10px]">{hist.createdAt}</td>
                      <td className="p-1.5 font-bold text-zinc-200">{hist.symbol}</td>
                      <td className="p-1.5 text-zinc-400 uppercase">{hist.mode} - {hist.type}</td>
                      <td className={`p-1.5 font-bold capitalize ${hist.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {hist.side}
                      </td>
                      <td className="p-1.5 text-zinc-200">${hist.price.toFixed(2)}</td>
                      <td className="p-1.5 text-zinc-300">{hist.amount}</td>
                      <td className="p-1.5 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${hist.status === 'filled' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                          {hist.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 4: Assets / Demo Wallet Breakdown */}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-1">
            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase">USDT Cash Balance</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {formatCurrency(portfolio.usdtBalance)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase">Spot Crypto Holdings</span>
              <div className="space-y-1 font-mono text-zinc-300">
                {Object.entries(portfolio.spotBalances).map(([asset, amount]) => (
                  <div key={asset} className="flex justify-between text-xs">
                    <span>{asset}:</span>
                    <span className="font-semibold text-zinc-100">{amount.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase">Demo Status</span>
              <p className="text-[11px] text-zinc-300">
                All funds are simulated demo assets. You can reset or top up anytime using the Faucet button in the top navigation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
