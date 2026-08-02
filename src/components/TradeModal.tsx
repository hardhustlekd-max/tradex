import React from 'react';
import { X, Zap } from 'lucide-react';
import { TradingPair, Portfolio, TradingMode, OrderSide, OrderType, MarginMode } from '../types';
import { OrderForm } from './OrderForm';
import { soundFx } from '../utils/audio';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePair: TradingPair;
  portfolio: Portfolio;
  selectedPrice: number | null;
  onSubmitOrder: (order: {
    mode: TradingMode;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    leverage: number;
    marginMode: MarginMode;
    takeProfit?: number;
    stopLoss?: number;
  }) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  activePair,
  portfolio,
  selectedPrice,
  onSubmitOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-black/35 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150" 
      onClick={onClose}
    >
      <div 
        className="bg-[#141822] border border-white/5 rounded-2xl p-4 w-full max-w-md shadow-2xl relative text-zinc-200 flex flex-col max-h-[90vh] overflow-hidden backdrop-blur-md animate-in fade-in duration-100" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Zap className="w-3.5 h-3.5 text-[#00c076]" />
            <span>Place Trade ({activePair.symbol})</span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body with Scrollable OrderForm */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
          <OrderForm
            activePair={activePair}
            portfolio={portfolio}
            selectedPrice={selectedPrice}
            hideHeader={true}
            onSubmitOrder={(ord) => {
              onSubmitOrder(ord);
              onClose(); // Auto close on successful submission
            }}
          />
        </div>
      </div>
    </div>
  );
};
