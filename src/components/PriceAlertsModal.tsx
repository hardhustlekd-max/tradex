import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TradingPair, PriceAlert } from '../types';
import { formatNumber } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { Bell, X, Plus, Trash2, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePair: TradingPair;
  priceAlerts: PriceAlert[];
  onAddAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
}

export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  activePair,
  priceAlerts,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
}) => {
  const [targetPriceInput, setTargetPriceInput] = useState<string>(activePair.price.toString());
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [filterSymbol, setFilterSymbol] = useState<string>('all'); // 'all' or activePair.symbol

  if (!isOpen) return null;

  const handleQuickPercent = (pct: number) => {
    soundFx.playClick();
    const calculated = activePair.price * (1 + pct / 100);
    setTargetPriceInput(calculated.toFixed(activePair.precision));
    if (pct > 0) {
      setCondition('above');
    } else {
      setCondition('below');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPriceInput);
    if (isNaN(priceNum) || priceNum <= 0) return;

    soundFx.playClick();
    onAddAlert(activePair.symbol, priceNum, condition);
  };

  const filteredAlerts = priceAlerts.filter((alert) => {
    if (filterSymbol === 'active') return alert.symbol === activePair.symbol;
    return true;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full max-w-lg rounded-3xl bg-[#181a20] border border-white/10 shadow-2xl overflow-hidden flex flex-col text-zinc-100 font-sans"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141a]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00c076]/15 border border-[#00c076]/30 flex items-center justify-center text-[#00c076]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Custom Price Alerts</h2>
                <p className="text-xs text-zinc-400">Get notified instantly when {activePair.symbol} hits your target price</p>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
            {/* Current Active Pair info card */}
            <div className="p-4 rounded-2xl bg-[#12141a] border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-zinc-400">Active Pair</div>
                <div className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  <span>{activePair.symbol}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">Spot & Futures</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold text-zinc-400">Current Market Price</div>
                <div className="text-base font-black text-[#00c076] mt-0.5">
                  ${formatNumber(activePair.price, activePair.precision)}
                </div>
              </div>
            </div>

            {/* Create Alert Form */}
            <form onSubmit={handleSubmit} className="space-y-4 bg-[#12141a] p-4 rounded-2xl border border-white/10">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Set New Alert for {activePair.symbol}</div>

              {/* Quick % buttons */}
              <div className="grid grid-cols-6 gap-1.5">
                {[-5, -2, -1, 1, 2, 5].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                      pct > 0
                        ? 'bg-[#00c076]/15 hover:bg-[#00c076]/25 text-[#00c076] border border-[#00c076]/30'
                        : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Condition */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1 font-semibold">Trigger Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => {
                      soundFx.playClick();
                      setCondition(e.target.value as 'above' | 'below');
                    }}
                    className="w-full bg-[#1b1f28] border border-white/10 focus:border-[#00c076] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="above">Price rises above (≥)</option>
                    <option value="below">Price drops below (≤)</option>
                  </select>
                </div>

                {/* Target Price */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1 font-semibold">Target Price (USDT)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={targetPriceInput}
                      onChange={(e) => setTargetPriceInput(e.target.value)}
                      placeholder="e.g. 95000"
                      className="w-full bg-[#1b1f28] border border-white/10 focus:border-[#00c076] rounded-xl pl-3 pr-8 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-[11px] text-zinc-400">$</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00c076] hover:bg-[#00b06c] text-black font-extrabold text-xs cursor-pointer shadow-lg shadow-[#00c076]/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Create Price Alert</span>
              </button>
            </form>

            {/* Existing Alerts Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white uppercase tracking-wider">Your Price Alerts ({priceAlerts.length})</div>
                <div className="flex items-center gap-1 bg-[#12141a] p-1 rounded-lg border border-white/10 text-[11px]">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setFilterSymbol('active');
                    }}
                    className={`px-2 py-1 rounded-md cursor-pointer transition-colors ${
                      filterSymbol === 'active' ? 'bg-[#00c076] text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {activePair.symbol} Only
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setFilterSymbol('all');
                    }}
                    className={`px-2 py-1 rounded-md cursor-pointer transition-colors ${
                      filterSymbol === 'all' ? 'bg-[#00c076] text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All Pairs
                  </button>
                </div>
              </div>

              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs bg-[#12141a] rounded-2xl border border-white/5">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-zinc-400" />
                  <div>No price alerts configured</div>
                  <div className="text-[10px] text-zinc-600 mt-0.5">Set a target price above to get notified instantly.</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar">
                  {filteredAlerts.map((alert) => {
                    const isAbove = alert.condition === 'above';
                    return (
                      <div
                        key={alert.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          alert.triggered
                            ? 'bg-zinc-900/40 border-white/5 opacity-60'
                            : alert.active
                            ? 'bg-[#12141a] border-white/10 hover:border-[#00c076]/40'
                            : 'bg-zinc-900/60 border-white/5 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isAbove ? 'bg-[#00c076]/15 text-[#00c076]' : 'bg-rose-500/15 text-rose-400'}`}>
                            {isAbove ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-xs">{alert.symbol}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 uppercase font-mono">
                                {alert.condition} ${alert.targetPrice.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-2">
                              <span>Created {alert.createdAt}</span>
                              {alert.triggered && <span className="text-[#00c076] font-bold">• Triggered</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Toggle Active Switch */}
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onToggleAlert(alert.id);
                            }}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
                              alert.active && !alert.triggered ? 'bg-[#00c076] justify-end' : 'bg-zinc-700 justify-start'
                            }`}
                            title={alert.active ? 'Disable Alert' : 'Enable Alert'}
                          >
                            <motion.div layout className="w-4 h-4 rounded-full bg-black shadow-md" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onDeleteAlert(alert.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Alert"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 bg-[#12141a] border-t border-white/15 flex items-center justify-between text-xs text-zinc-400">
            <span>Alerts run in real-time on price ticks</span>
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
