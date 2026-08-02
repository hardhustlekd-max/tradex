import React, { useState } from 'react';
import { TradingPair, Candle, AiMarketAnalysis } from '../types';
import { soundFx } from '../utils/audio';
import { Sparkles, X, RefreshCw, TrendingUp, TrendingDown, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AiAnalystDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePair: TradingPair;
  candles: Candle[];
}

export const AiAnalystDrawer: React.FC<AiAnalystDrawerProps> = ({
  isOpen,
  onClose,
  activePair,
  candles,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AiMarketAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const fetchAnalysis = async () => {
    soundFx.playClick();
    setLoading(true);
    setError(null);

    try {
      const recent = candles.slice(-5);
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: activePair.symbol,
          price: activePair.price,
          change24h: activePair.change24h,
          high24h: activePair.high24h,
          low24h: activePair.low24h,
          volume24h: activePair.volume24h,
          recentCandles: recent,
          rsi: 58.2,
          ma20: activePair.price * 0.98,
          ma50: activePair.price * 0.95,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to retrieve AI market analysis.');
      }
    } catch (err: any) {
      setError('Network error connecting to Gemini AI endpoint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 transition-opacity duration-100" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md liquid-card border-l border-amber-500/15 shadow-2xl flex flex-col font-mono text-zinc-100 animate-in slide-in-from-right duration-100">
      {/* Drawer Header */}
      <div className="p-4 border-b border-amber-500/15 flex items-center justify-between bg-[#0e0b06]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span className="text-white">Nexus AI Market Analyst</span>
            </h2>
            <p className="text-[10px] text-zinc-400">{activePair.symbol} Technical Scan</p>
          </div>
        </div>
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0805]">
        {/* Run Analysis Trigger CTA if no analysis yet */}
        {!analysis && !loading && !error && (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Scan Market Structure</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">
                Generates instant Gemini AI technical sentiment, support/resistance levels, and strategy scenarios for {activePair.symbol}.
              </p>
            </div>
            <button
              onClick={fetchAnalysis}
              className="px-4 py-2 rounded-lg liquid-btn-primary font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              Run AI Analysis Now
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-12 space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs text-zinc-300 font-semibold">Analyzing {activePair.symbol} order flow & indicators...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>Analysis Error</span>
            </div>
            <p>{error}</p>
            <button
              onClick={fetchAnalysis}
              className="px-3 py-1 rounded bg-rose-900 hover:bg-rose-800 text-rose-100 font-bold cursor-pointer active:scale-95"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results View */}
        {analysis && !loading && (
          <div className="space-y-4 text-xs">
            {/* Re-run button */}
            <div className="flex justify-between items-center bg-[#141008] p-2.5 rounded-lg border border-amber-500/15">
              <span className="text-zinc-400 text-[10px]">Last updated: Just now</span>
              <button
                onClick={fetchAnalysis}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 cursor-pointer font-semibold text-[11px] border border-amber-500/30 active:scale-95"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-scan</span>
              </button>
            </div>

            {/* Bias Banner */}
            <div className="p-3 rounded-lg bg-[#141008] border border-amber-500/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Market Sentiment</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`font-bold text-base px-2 py-0.5 rounded ${
                      analysis.bias === 'Bullish'
                        ? 'bg-emerald-950/80 text-[#00c076] border border-emerald-500/30'
                        : analysis.bias === 'Bearish'
                        ? 'bg-rose-950/80 text-[#f6465d] border border-rose-500/30'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {analysis.bias}
                  </span>
                  <span className="text-zinc-400 text-[11px] font-semibold font-mono tabular-nums">
                    Confidence: {analysis.confidenceScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 rounded-lg bg-[#141008] border border-amber-500/15 space-y-1">
              <span className="text-[10px] text-amber-400/80 uppercase font-semibold">Executive Summary</span>
              <p className="text-zinc-200 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Support & Resistance */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] text-[#00c076] font-bold uppercase">Support Levels</span>
                <ul className="space-y-0.5 text-zinc-300 font-mono tabular-nums">
                  {analysis.supportLevels.map((lvl, idx) => (
                    <li key={idx}>• {lvl}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1">
                <span className="text-[10px] text-[#f6465d] font-bold uppercase">Resistance Levels</span>
                <ul className="space-y-0.5 text-zinc-300 font-mono tabular-nums">
                  {analysis.resistanceLevels.map((lvl, idx) => (
                    <li key={idx}>• {lvl}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Technical Highlights */}
            <div className="p-3 rounded-lg bg-[#141008] border border-amber-500/15 space-y-1.5">
              <span className="text-[10px] text-amber-400/80 uppercase font-semibold">Technical Highlights</span>
              <ul className="space-y-1">
                {analysis.technicalHighlights.map((hl, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategy Box */}
            <div className="p-3.5 rounded-lg bg-[#141008] border border-amber-500/30 space-y-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Suggested Trade Setup
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono tabular-nums">
                <div>
                  <span className="text-zinc-400 text-[10px] block font-sans">Action:</span>
                  <span className="font-bold text-zinc-100">{analysis.recommendedStrategy.action}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block font-sans">Entry Zone:</span>
                  <span className="font-semibold text-zinc-200">{analysis.recommendedStrategy.entryZone}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block font-sans">Target Price:</span>
                  <span className="font-bold text-[#00c076]">{analysis.recommendedStrategy.targetPrice}</span>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] block font-sans">Stop Loss:</span>
                  <span className="font-bold text-[#f6465d]">{analysis.recommendedStrategy.stopLossPrice}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
