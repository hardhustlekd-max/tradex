import React, { useState, useEffect } from 'react';
import { 
  TradingPair, 
  Candle, 
  OrderBookEntry, 
  Trade, 
  Position, 
  Order, 
  Portfolio, 
  ChartTimeframe, 
  TradingMode, 
  OrderSide, 
  OrderType, 
  MarginMode, 
  NotificationItem 
} from './types';
import { 
  INITIAL_PAIRS, 
  generateCandles, 
  generateOrderBook, 
  generateRecentTrades 
} from './data/mockMarkets';
import { calculateLiquidationPrice } from './utils/calc';
import { soundFx } from './utils/audio';

import { Header } from './components/Header';
import { TradingChart } from './components/TradingChart';
import { OrderBook } from './components/OrderBook';
import { RecentTrades } from './components/RecentTrades';
import { OrderForm } from './components/OrderForm';
import { BottomPanels } from './components/BottomPanels';
import { HomePage } from './components/HomePage';
import { MarketsPage } from './components/MarketsPage';
import { AssetsPage } from './components/AssetsPage';
import { PairSelectorModal } from './components/PairSelectorModal';
import { FaucetModal } from './components/FaucetModal';
import { AiAnalystDrawer } from './components/AiAnalystDrawer';
import { NotificationToast } from './components/NotificationToast';

export default function App() {
  // Pairs state
  const [pairs, setPairs] = useState<TradingPair[]>(INITIAL_PAIRS);
  const [activePair, setActivePair] = useState<TradingPair>(INITIAL_PAIRS[0]);
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1h');

  // Market Data state
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateCandles(INITIAL_PAIRS[0].price, 80, '1h')
  );
  const [orderBook, setOrderBook] = useState<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }>(() =>
    generateOrderBook(INITIAL_PAIRS[0].price, INITIAL_PAIRS[0].precision)
  );
  const [trades, setTrades] = useState<Trade[]>(() =>
    generateRecentTrades(INITIAL_PAIRS[0].price, INITIAL_PAIRS[0].precision)
  );

  // User Portfolio & Trading state
  const [portfolio, setPortfolio] = useState<Portfolio>({
    usdtBalance: 100000.0,
    spotBalances: { BTC: 0.25, ETH: 2.5, SOL: 15.0 },
  });

  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // Selected price from orderbook click
  const [selectedBookPrice, setSelectedBookPrice] = useState<number | null>(null);

  // Dock Bar Navigation State ('home' | 'markets' | 'futures' | 'trade' | 'assets')
  const [activeDockTab, setActiveDockTab] = useState<'home' | 'markets' | 'futures' | 'trade' | 'assets'>('home');

  // Mobile View Navigation State ('chart' | 'orderbook' | 'trades' | 'order')
  const [mobileTab, setMobileTab] = useState<'chart' | 'orderbook' | 'trades' | 'order'>('chart');

  // Modals & Drawers
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isFaucetModalOpen, setIsFaucetModalOpen] = useState(false);
  const [isAiAnalystOpen, setIsAiAnalystOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Floating Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 5));
  };

  const handleDismissNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Switch Active Pair
  const handleSelectPair = (pair: TradingPair) => {
    setActivePair(pair);
    setCandles(generateCandles(pair.price, 80, timeframe));
    setOrderBook(generateOrderBook(pair.price, pair.precision));
    setTrades(generateRecentTrades(pair.price, pair.precision));
    setSelectedBookPrice(null);
  };

  // Change Timeframe
  const handleChangeTimeframe = (tf: ChartTimeframe) => {
    setTimeframe(tf);
    setCandles(generateCandles(activePair.price, 80, tf));
  };

  // Real-time Tick & Order Matching Engine (runs every 800ms)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Simulate tick price movement
      const volatility = activePair.price * 0.0006; // 0.06% tick change
      const delta = (Math.random() - 0.495) * volatility;
      const newPrice = Number((activePair.price + delta).toFixed(activePair.precision));

      // 2. Update active pair price & stats
      setActivePair((prev) => {
        const high24h = Math.max(prev.high24h, newPrice);
        const low24h = Math.min(prev.low24h, newPrice);
        const volume24h = prev.volume24h + Math.abs(delta * 100);
        return {
          ...prev,
          price: newPrice,
          high24h,
          low24h,
          volume24h,
        };
      });

      // Update in pairs array as well
      setPairs((prev) =>
        prev.map((p) => (p.symbol === activePair.symbol ? { ...p, price: newPrice } : p))
      );

      // 3. Update candles
      setCandles((prevCandles) => {
        if (prevCandles.length === 0) return prevCandles;
        const updated = [...prevCandles];
        const last = { ...updated[updated.length - 1] };
        last.close = newPrice;
        last.high = Math.max(last.high, newPrice);
        last.low = Math.min(last.low, newPrice);
        last.volume += Math.random() * 5 + 0.1;
        updated[updated.length - 1] = last;
        return updated;
      });

      // 4. Regenerate orderbook
      setOrderBook(generateOrderBook(newPrice, activePair.precision));

      // 5. Append recent trade
      if (Math.random() > 0.3) {
        const newTrade: Trade = {
          id: `trd-${Date.now()}`,
          price: newPrice,
          amount: Number((Math.random() * 0.8 + 0.01).toFixed(3)),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: Math.random() > 0.48 ? 'buy' : 'sell',
        };
        setTrades((prev) => [newTrade, ...prev].slice(0, 25));
      }

      // 6. Evaluate open limit orders
      setOrders((prevOrders) => {
        const remaining: Order[] = [];

        prevOrders.forEach((ord) => {
          if (ord.symbol !== activePair.symbol || ord.status !== 'open') {
            remaining.push(ord);
            return;
          }

          const filledBuy = ord.side === 'buy' && newPrice <= ord.price;
          const filledSell = ord.side === 'sell' && newPrice >= ord.price;

          if (filledBuy || filledSell) {
            // Fill order!
            soundFx.playOrderFilled();
            addNotification('success', 'Order Filled!', `Limit ${ord.side.toUpperCase()} ${ord.amount} ${activePair.baseAsset} filled at $${ord.price.toFixed(2)}`);

            // Handle Spot balance vs Futures position created
            if (ord.mode === 'spot') {
              if (ord.side === 'buy') {
                setPortfolio((p) => ({
                  ...p,
                  spotBalances: {
                    ...p.spotBalances,
                    [activePair.baseAsset]: (p.spotBalances[activePair.baseAsset] || 0) + ord.amount,
                  },
                }));
              } else {
                setPortfolio((p) => ({
                  ...p,
                  usdtBalance: p.usdtBalance + ord.amount * ord.price,
                }));
              }
            } else if (ord.mode === 'futures') {
              // Create futures position
              const margin = (ord.amount * ord.price) / (ord.leverage || 10);
              const liqPrice = calculateLiquidationPrice(ord.price, ord.side === 'buy' ? 'long' : 'short', ord.leverage || 10);

              const newPos: Position = {
                id: `pos-${Date.now()}`,
                symbol: ord.symbol,
                side: ord.side === 'buy' ? 'long' : 'short',
                leverage: ord.leverage || 10,
                entryPrice: ord.price,
                markPrice: newPrice,
                size: ord.amount,
                margin,
                marginMode: 'cross',
                pnl: 0,
                pnlPercentage: 0,
                liquidationPrice: liqPrice,
                createdAt: new Date().toLocaleTimeString(),
              };
              setPositions((posList) => [newPos, ...posList]);
            }

            setOrderHistory((hist) => [{ ...ord, status: 'filled' }, ...hist]);
          } else {
            remaining.push(ord);
          }
        });

        return remaining;
      });

      // 7. Update Futures Positions Mark Price & PnL
      setPositions((prevPositions) =>
        prevPositions.map((pos) => {
          if (pos.symbol !== activePair.symbol) return pos;

          const priceDiff = newPrice - pos.entryPrice;
          const rawPnl = pos.side === 'long' ? priceDiff * pos.size : -priceDiff * pos.size;
          const pnl = Number(rawPnl.toFixed(2));
          const pnlPercentage = Number(((pnl / pos.margin) * 100).toFixed(2));

          return {
            ...pos,
            markPrice: newPrice,
            pnl,
            pnlPercentage,
          };
        })
      );
    }, 800);

    return () => clearInterval(interval);
  }, [activePair, timeframe]);

  // Handle Order Submission from OrderForm
  const handleSubmitOrder = (orderData: {
    mode: TradingMode;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    leverage: number;
    marginMode: MarginMode;
    takeProfit?: number;
    stopLoss?: number;
  }) => {
    const notional = orderData.price * orderData.amount;
    const requiredMargin = orderData.mode === 'spot' ? notional : notional / orderData.leverage;

    // Immediate execution for Market Orders
    if (orderData.type === 'market') {
      if (orderData.mode === 'spot') {
        if (orderData.side === 'buy') {
          // Spot Buy
          setPortfolio((p) => ({
            ...p,
            usdtBalance: p.usdtBalance - notional,
            spotBalances: {
              ...p.spotBalances,
              [activePair.baseAsset]: (p.spotBalances[activePair.baseAsset] || 0) + orderData.amount,
            },
          }));
          addNotification('success', 'Spot Bought', `Bought ${orderData.amount} ${activePair.baseAsset} for ${notional.toFixed(2)} USDT`);
        } else {
          // Spot Sell
          setPortfolio((p) => ({
            ...p,
            usdtBalance: p.usdtBalance + notional,
            spotBalances: {
              ...p.spotBalances,
              [activePair.baseAsset]: Math.max(0, (p.spotBalances[activePair.baseAsset] || 0) - orderData.amount),
            },
          }));
          addNotification('success', 'Spot Sold', `Sold ${orderData.amount} ${activePair.baseAsset} for ${notional.toFixed(2)} USDT`);
        }
      } else if (orderData.mode === 'futures') {
        // Futures Market Position Open
        const liqPrice = calculateLiquidationPrice(
          activePair.price,
          orderData.side === 'buy' ? 'long' : 'short',
          orderData.leverage
        );

        const newPos: Position = {
          id: `pos-${Date.now()}`,
          symbol: activePair.symbol,
          side: orderData.side === 'buy' ? 'long' : 'short',
          leverage: orderData.leverage,
          entryPrice: activePair.price,
          markPrice: activePair.price,
          size: orderData.amount,
          margin: requiredMargin,
          marginMode: orderData.marginMode,
          pnl: 0,
          pnlPercentage: 0,
          liquidationPrice: liqPrice,
          takeProfit: orderData.takeProfit,
          stopLoss: orderData.stopLoss,
          createdAt: new Date().toLocaleTimeString(),
        };

        // Lock margin
        setPortfolio((p) => ({ ...p, usdtBalance: p.usdtBalance - requiredMargin }));
        setPositions((prev) => [newPos, ...prev]);

        addNotification(
          'success',
          `Futures ${orderData.side === 'buy' ? 'LONG' : 'SHORT'} Opened`,
          `${orderData.leverage}x ${activePair.symbol} position size ${orderData.amount} @ $${activePair.price.toFixed(2)}`
        );
      }
    } else {
      // Limit Order Placement
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        symbol: activePair.symbol,
        type: orderData.type,
        side: orderData.side,
        mode: orderData.mode,
        price: orderData.price,
        amount: orderData.amount,
        filled: 0,
        status: 'open',
        createdAt: new Date().toLocaleTimeString(),
        leverage: orderData.leverage,
        marginMode: orderData.marginMode,
      };

      setOrders((prev) => [newOrder, ...prev]);
      addNotification('info', 'Limit Order Placed', `${orderData.side.toUpperCase()} ${orderData.amount} ${activePair.baseAsset} at $${orderData.price.toFixed(2)}`);
    }
  };

  // Close Futures Position
  const handleClosePosition = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    const returnFunds = pos.margin + pos.pnl;
    setPortfolio((p) => ({ ...p, usdtBalance: p.usdtBalance + returnFunds }));
    setPositions((prev) => prev.filter((p) => p.id !== positionId));

    addNotification(
      pos.pnl >= 0 ? 'success' : 'warning',
      'Position Closed',
      `Closed ${pos.side.toUpperCase()} ${pos.symbol} with PnL: ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl.toFixed(2)} (${pos.pnlPercentage.toFixed(2)}%)`
    );
  };

  // Cancel Limit Order
  const handleCancelOrder = (orderId: string) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setOrderHistory((prev) => [{ ...ord, status: 'cancelled' }, ...prev]);
    addNotification('info', 'Order Cancelled', `Cancelled ${ord.side.toUpperCase()} order for ${ord.symbol}`);
  };

  // Reset Balance via Faucet
  const handleResetBalance = (amount: number) => {
    setPortfolio((p) => ({ ...p, usdtBalance: amount }));
    addNotification('success', 'Faucet Reset', `Demo cash balance set to $${amount.toLocaleString()} USDT`);
  };

  // Claim Testnet Crypto
  const handleClaimCrypto = (asset: string, amount: number) => {
    setPortfolio((p) => ({
      ...p,
      spotBalances: {
        ...p.spotBalances,
        [asset]: (p.spotBalances[asset] || 0) + amount,
      },
    }));
    addNotification('success', 'Testnet Coin Claimed', `Claimed +${amount} ${asset} to demo wallet`);
  };

  return (
    <div className="h-screen w-screen bg-[#0b0e11] flex flex-col overflow-hidden font-sans text-zinc-100 select-none">
      {/* Top Main Navigation Header (Shown on Futures/Trading screens) */}
      {(activeDockTab === 'futures' || activeDockTab === 'trade') && (
        <Header
          activePair={activePair}
          portfolio={portfolio}
          onOpenPairModal={() => setIsPairModalOpen(true)}
          onOpenFaucetModal={() => setIsFaucetModalOpen(true)}
          onToggleAiAnalyst={() => setIsAiAnalystOpen(!isAiAnalystOpen)}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            soundFx.enabled = !soundEnabled;
            setSoundEnabled(!soundEnabled);
          }}
          onGoHome={() => setActiveDockTab('home')}
        />
      )}

      {/* Main Workspace Body Layout */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden">
        {activeDockTab === 'home' && (
          <HomePage
            pairs={pairs}
            onSelectPair={handleSelectPair}
            onNavigateToFutures={() => setActiveDockTab('futures')}
            onOpenDeposit={() => setIsFaucetModalOpen(true)}
          />
        )}

        {activeDockTab === 'markets' && (
          <MarketsPage
            pairs={pairs}
            onSelectPair={handleSelectPair}
            onNavigateToFutures={() => setActiveDockTab('futures')}
          />
        )}

        {activeDockTab === 'assets' && (
          <AssetsPage
            portfolio={portfolio}
            onOpenDeposit={() => setIsFaucetModalOpen(true)}
          />
        )}

        {(activeDockTab === 'futures' || activeDockTab === 'trade') && (
          <>
            {/* Mobile Navigation Tab Bar (< lg) */}
            <div className="flex lg:hidden bg-[#000000] border-b border-zinc-900 text-xs font-semibold shrink-0 sticky top-0 z-20">
              <button
                onClick={() => setMobileTab('chart')}
                className={`flex-1 py-2 text-center transition-colors border-b-2 cursor-pointer ${
                  mobileTab === 'chart' ? 'border-white text-white font-bold bg-zinc-950/80' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Chart
              </button>
              <button
                onClick={() => setMobileTab('orderbook')}
                className={`flex-1 py-2 text-center transition-colors border-b-2 cursor-pointer ${
                  mobileTab === 'orderbook' ? 'border-white text-white font-bold bg-zinc-950/80' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Order Book
              </button>
              <button
                onClick={() => setMobileTab('trades')}
                className={`flex-1 py-2 text-center transition-colors border-b-2 cursor-pointer ${
                  mobileTab === 'trades' ? 'border-white text-white font-bold bg-zinc-950/80' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Trades
              </button>
              <button
                onClick={() => setMobileTab('order')}
                className={`flex-1 py-2 text-center transition-colors border-b-2 cursor-pointer ${
                  mobileTab === 'order' ? 'border-white text-white font-bold bg-zinc-950/80' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Trade
              </button>
            </div>

            {/* Desktop Layout (lg:flex) */}
            <div className="hidden lg:flex flex-1 min-h-0 bg-[#000000]">
              {/* Main Candlestick Chart Workspace */}
              <TradingChart
                candles={candles}
                symbol={activePair.symbol}
                precision={activePair.precision}
                timeframe={timeframe}
                onChangeTimeframe={handleChangeTimeframe}
                currentPrice={activePair.price}
                onOpenLong={() => setMobileTab('order')}
                onOpenShort={() => setMobileTab('order')}
              />

              {/* Live Order Book */}
              <OrderBook
                asks={orderBook.asks}
                bids={orderBook.bids}
                currentPrice={activePair.price}
                precision={activePair.precision}
                onSelectPrice={(price) => {
                  setSelectedBookPrice(price);
                }}
              />

              {/* Recent Trades Stream */}
              <RecentTrades trades={trades} precision={activePair.precision} />

              {/* Order Placement Form */}
              <OrderForm
                activePair={activePair}
                portfolio={portfolio}
                selectedPrice={selectedBookPrice}
                onSubmitOrder={handleSubmitOrder}
              />
            </div>

            {/* Mobile View Active Tab Content (< lg) */}
            <div className="flex lg:hidden flex-col shrink-0 relative bg-[#000000]">
              {mobileTab === 'chart' && (
                <TradingChart
                  candles={candles}
                  symbol={activePair.symbol}
                  precision={activePair.precision}
                  timeframe={timeframe}
                  onChangeTimeframe={handleChangeTimeframe}
                  currentPrice={activePair.price}
                  onOpenLong={() => setMobileTab('order')}
                  onOpenShort={() => setMobileTab('order')}
                />
              )}

              {mobileTab === 'orderbook' && (
                <OrderBook
                  asks={orderBook.asks}
                  bids={orderBook.bids}
                  currentPrice={activePair.price}
                  precision={activePair.precision}
                  onSelectPrice={(price) => {
                    setSelectedBookPrice(price);
                    setMobileTab('order');
                  }}
                />
              )}

              {mobileTab === 'trades' && (
                <RecentTrades trades={trades} precision={activePair.precision} />
              )}

              {mobileTab === 'order' && (
                <OrderForm
                  activePair={activePair}
                  portfolio={portfolio}
                  selectedPrice={selectedBookPrice}
                  onSubmitOrder={(ord) => {
                    handleSubmitOrder(ord);
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom Floating Menu & Positions Panel (Fixed at viewport bottom) */}
      <BottomPanels
        positions={positions}
        orders={orders}
        orderHistory={orderHistory}
        portfolio={portfolio}
        pairs={pairs}
        onClosePosition={handleClosePosition}
        onCancelOrder={handleCancelOrder}
        activeNavDock={activeDockTab}
        onSelectNavDock={(tab) => {
          setActiveDockTab(tab);
        }}
      />

      {/* Modals & Drawers */}
      <PairSelectorModal
        isOpen={isPairModalOpen}
        onClose={() => setIsPairModalOpen(false)}
        pairs={pairs}
        activeSymbol={activePair.symbol}
        onSelectPair={handleSelectPair}
      />

      <FaucetModal
        isOpen={isFaucetModalOpen}
        onClose={() => setIsFaucetModalOpen(false)}
        portfolio={portfolio}
        onResetBalance={handleResetBalance}
        onClaimCrypto={handleClaimCrypto}
      />

      <AiAnalystDrawer
        isOpen={isAiAnalystOpen}
        onClose={() => setIsAiAnalystOpen(false)}
        activePair={activePair}
        candles={candles}
      />

      {/* Floating Notification Toasts */}
      <NotificationToast notifications={notifications} onDismiss={handleDismissNotif} />
    </div>
  );
}
