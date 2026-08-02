import React from 'react';
import { PositionHistory } from './PositionHistory';
import { Position, Order } from '../types';

interface RecentTradesProps {
  trades?: any[];
  precision?: number;
  positions?: Position[];
  orders?: Order[];
  orderHistory?: Order[];
  onClosePosition?: (id: string) => void;
  onCancelOrder?: (id: string) => void;
}

export const RecentTrades: React.FC<RecentTradesProps> = ({
  positions = [],
  orders = [],
  orderHistory = [],
  onClosePosition = () => {},
  onCancelOrder = () => {},
}) => {
  return (
    <PositionHistory
      positions={positions}
      orders={orders}
      orderHistory={orderHistory}
      onClosePosition={onClosePosition}
      onCancelOrder={onCancelOrder}
    />
  );
};


