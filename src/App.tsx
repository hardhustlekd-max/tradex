import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  NotificationItem,
  PriceAlert
} from './types';
import { 
  INITIAL_PAIRS, 
  generateCandles, 
  generateOrderBook, 
  generateRecentTrades,
  fetchRealMarketData,
  fetchAll24hTickers,
  getBinanceSymbol
} from './data/mockMarkets';
import { calculateLiquidationPrice } from './utils/calc';
import { soundFx } from './utils/audio';

import { Header } from './components/Header';
import { TradingChart } from './components/TradingChart';
import { OrderBook } from './components/OrderBook';
import { RecentTrades } from './components/RecentTrades';
import { PositionHistory } from './components/PositionHistory';
import { OrderForm } from './components/OrderForm';
import { BottomPanels, PositionsPanel } from './components/BottomPanels';
import { HomePage } from './components/HomePage';
import { MarketsPage } from './components/MarketsPage';
import { AssetsPage } from './components/AssetsPage';
import { PairSelectorModal } from './components/PairSelectorModal';
import { FaucetModal } from './components/FaucetModal';
import { TransferModal } from './components/TransferModal';
import { TradeModal } from './components/TradeModal';
import { AiAnalystDrawer } from './components/AiAnalystDrawer';
import { PriceAlertsModal } from './components/PriceAlertsModal';
import { NotificationToast } from './components/NotificationToast';
import { LoginPage } from './components/LoginPage';

export default function App() {
  // Auth state - defaults to null so LoginPage is the entry page
  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('tradex_demo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userInfo: { email: string; name: string }) => {
    setUser(userInfo);
    localStorage.setItem('tradex_demo_user', JSON.stringify(userInfo));
    setNotifications([]);
    addNotification('success', 'Demo Login Successful', `Welcome back, ${userInfo.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tradex_demo_user');
    setNotifications([]);
    addNotification('info', 'Signed Out', 'Signed out of demo session.');
  };
  // Pairs state from LocalStorage or default
  const [pairs, setPairs] = useState<TradingPair[]>(() => {
    const saved = localStorage.getItem('tradex_pairs');
    return saved ? JSON.parse(saved) : INITIAL_PAIRS;
  });

  // Active Pair from LocalStorage (defaults to BTC/USDT if none set)
  const [activePair, setActivePair] = useState<TradingPair>(() => {
    const saved = localStorage.getItem('tradex_active_pair');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.symbol) return parsed;
      } catch (e) {
        console.error('Error parsing tradex_active_pair:', e);
      }
    }
    // Default to BTC/USDT if none selected in localStorage
    return INITIAL_PAIRS.find((p) => p.symbol === 'BTC/USDT' || p.baseAsset === 'BTC') || INITIAL_PAIRS[0];
  });

  const [timeframe, setTimeframe] = useState<ChartTimeframe>(() => {
    const saved = localStorage.getItem('tradex_timeframe');
    return (saved as ChartTimeframe) || '1h';
  });

  // Market Data state (250 candles for deep zoom history)
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateCandles(activePair.price, 250, timeframe, activePair.symbol)
  );
  const [orderBook, setOrderBook] = useState<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }>(() =>
    generateOrderBook(activePair.price, activePair.precision)
  );
  const [trades, setTrades] = useState<Trade[]>(() =>
    generateRecentTrades(activePair.price, activePair.precision)
  );

  // User Portfolio & Trading state with LocalStorage persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('tradex_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'light';
  });

  // Apply theme class to document DOM
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.body.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('tradex_theme', next);
      return next;
    });
  };

  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    const saved = localStorage.getItem('tradex_portfolio');
    return saved
      ? JSON.parse(saved)
      : {
          usdtBalance: 100000.0,
          spotBalances: { BTC: 0.25, ETH: 2.5, SOL: 15.0 },
        };
  });

  const [positions, setPositions] = useState<Position[]>(() => {
    const saved = localStorage.getItem('tradex_positions');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('tradex_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    const saved = localStorage.getItem('tradex_order_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist trading platform state in LocalStorage
  useEffect(() => {
    localStorage.setItem('tradex_pairs', JSON.stringify(pairs));
  }, [pairs]);

  useEffect(() => {
    localStorage.setItem('tradex_active_pair', JSON.stringify(activePair));
  }, [activePair]);

  useEffect(() => {
    localStorage.setItem('tradex_timeframe', timeframe);
  }, [timeframe]);

  useEffect(() => {
    localStorage.setItem('tradex_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem('tradex_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('tradex_orders', JSON.stringify(orders));
  }, [orders]);

  // Selected price from orderbook click
  const [selectedBookPrice, setSelectedBookPrice] = useState<number | null>(null);

  // Dock Bar Navigation State ('home' | 'markets' | 'futures' | 'trade' | 'assets')
  const [activeDockTab, setActiveDockTab] = useState<'home' | 'markets' | 'futures' | 'trade' | 'assets'>(() => {
    const saved = localStorage.getItem('tradex_active_dock_tab');
    return (saved as any) || 'home';
  });

  // Mobile View Navigation State ('chart' | 'orderbook' | 'trades' | 'order')
  const [mobileTab, setMobileTab] = useState<'chart' | 'orderbook' | 'trades' | 'order'>(() => {
    const saved = localStorage.getItem('tradex_mobile_tab');
    return (saved as any) || 'chart';
  });

  useEffect(() => {
    localStorage.setItem('tradex_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  useEffect(() => {
    localStorage.setItem('tradex_active_dock_tab', activeDockTab);
  }, [activeDockTab]);

  useEffect(() => {
    localStorage.setItem('tradex_mobile_tab', mobileTab);
  }, [mobileTab]);

  // Redirect legacy saved tab
  useEffect(() => {
    if (mobileTab === 'order') {
      setMobileTab('chart');
    }
  }, [mobileTab]);

  // Modals & Drawers
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isFaucetModalOpen, setIsFaucetModalOpen] = useState(false);
  const [isAiAnalystOpen, setIsAiAnalystOpen] = useState(false);
  const [isPriceAlertsModalOpen, setIsPriceAlertsModalOpen] = useState(false);

  // Price Alerts State with LocalStorage persistence
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('tradex_price_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tradex_price_alerts', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  const handleAddPriceAlert = (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      symbol,
      targetPrice,
      condition,
      active: true,
      triggered: false,
      createdAt: new Date().toLocaleTimeString(),
    };
    setPriceAlerts((prev) => [newAlert, ...prev]);
    addNotification('success', 'Price Alert Set', `Alert set for ${symbol} when price goes ${condition} $${targetPrice.toLocaleString()}`);
  };

  const handleTogglePriceAlert = (id: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const handleDeletePriceAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
    addNotification('info', 'Alert Deleted', 'Price alert removed.');
  };
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean;
    initialFrom?: 'spot' | 'futures' | 'funding' | 'copy' | 'earn';
    initialTo?: 'spot' | 'futures' | 'funding' | 'copy' | 'earn';
    initialAsset?: string;
    initialAmount?: string;
  }>({
    isOpen: false,
    initialFrom: 'funding',
    initialTo: 'futures',
    initialAsset: 'USDT',
    initialAmount: '',
  });
  const [pendingOrder, setPendingOrder] = useState<{
    mode: TradingMode;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    leverage: number;
    marginMode: MarginMode;
    takeProfit?: number;
    stopLoss?: number;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Floating Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback((type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 5));
  }, []);

  const handleDismissNotif = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Fetch real 24h ticker updates for all pairs on load and periodically
  useEffect(() => {
    async function loadAllTickers() {
      const tickers = await fetchAll24hTickers();
      if (!tickers || Object.keys(tickers).length === 0) return;

      setPairs((prevPairs) =>
        prevPairs.map((p) => {
          const binSymbol = getBinanceSymbol(p.symbol);
          const t = tickers[binSymbol];
          if (t) {
            return {
              ...p,
              price: t.price,
              change24h: t.change24h,
              high24h: t.high24h,
              low24h: t.low24h,
              volume24h: t.volume24h,
            };
          }
          return p;
        })
      );
    }

    loadAllTickers();
    const interval = setInterval(loadAllTickers, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real Binance candlestick history & latest ticker whenever active pair or timeframe changes
  useEffect(() => {
    let isCancelled = false;

    async function loadMarketData() {
      setIsChartLoading(true);
      const data = await fetchRealMarketData(activePair.symbol, timeframe, 250, activePair.price);
      if (isCancelled) return;

      if (data.candles && data.candles.length > 0) {
        setCandles(data.candles);
      } else {
        setCandles(generateCandles(activePair.price, 250, timeframe, activePair.symbol));
      }

      if (data.ticker) {
        const { price, change24h, high24h, low24h, volume24h } = data.ticker;
        setActivePair((prev) => ({
          ...prev,
          price,
          change24h,
          high24h,
          low24h,
          volume24h,
        }));

        setPairs((prevPairs) =>
          prevPairs.map((p) =>
            p.symbol === activePair.symbol
              ? { ...p, price, change24h, high24h, low24h, volume24h }
              : p
          )
        );

        setOrderBook(generateOrderBook(price, activePair.precision));
        setTrades(generateRecentTrades(price, activePair.precision));
      }

      setTimeout(() => {
        if (!isCancelled) setIsChartLoading(false);
      }, 300);
    }

    loadMarketData();

    return () => {
      isCancelled = true;
    };
  }, [activePair.symbol, timeframe]);

  // Switch Active Pair
  const handleSelectPair = (pair: TradingPair) => {
    setIsChartLoading(true);
    setActivePair(pair);
    localStorage.setItem('tradex_active_pair', JSON.stringify(pair));
    setCandles(generateCandles(pair.price, 250, timeframe, pair.symbol));
    setOrderBook(generateOrderBook(pair.price, pair.precision));
    setTrades(generateRecentTrades(pair.price, pair.precision));
    setSelectedBookPrice(null);
  };

  // Change Timeframe
  const handleChangeTimeframe = (tf: ChartTimeframe) => {
    setIsChartLoading(true);
    setTimeframe(tf);
    setCandles(generateCandles(activePair.price, 250, tf, activePair.symbol));
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
        
        // Compute current 24h change based on original open price
        const initialPair = INITIAL_PAIRS.find(p => p.symbol === prev.symbol) || INITIAL_PAIRS[0];
        const openPrice = initialPair.price / (1 + initialPair.change24h / 100);
        const change24h = ((newPrice - openPrice) / openPrice) * 100;

        return {
          ...prev,
          price: newPrice,
          change24h,
          high24h,
          low24h,
          volume24h,
        };
      });

      // Update in pairs array as well
      setPairs((prev) =>
        prev.map((p) => {
          if (p.symbol === activePair.symbol) {
            const initialPair = INITIAL_PAIRS.find(ip => ip.symbol === p.symbol) || INITIAL_PAIRS[0];
            const openPrice = initialPair.price / (1 + initialPair.change24h / 100);
            const change24h = ((newPrice - openPrice) / openPrice) * 100;
            return {
              ...p,
              price: newPrice,
              change24h,
            };
          }
          return p;
        })
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
          id: `trd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
                // USDT was locked on placement; credit base asset
                setPortfolio((p) => ({
                  ...p,
                  spotBalances: {
                    ...p.spotBalances,
                    [activePair.baseAsset]: (p.spotBalances[activePair.baseAsset] || 0) + ord.amount,
                  },
                }));
              } else {
                // Base asset was locked on placement; credit USDT to Spot Wallet
                setPortfolio((p) => ({
                  ...p,
                  spotBalances: {
                    ...p.spotBalances,
                    USDT: (p.spotBalances?.USDT || 0) + ord.amount * ord.price,
                  },
                }));
              }
            } else if (ord.mode === 'futures') {
              // Create futures position (margin was locked on placement)
              const margin = (ord.amount * ord.price) / (ord.leverage || 10);
              const liqPrice = calculateLiquidationPrice(ord.price, ord.side === 'buy' ? 'long' : 'short', ord.leverage || 10);

              const newPos: Position = {
                id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                symbol: ord.symbol,
                side: ord.side === 'buy' ? 'long' : 'short',
                leverage: ord.leverage || 10,
                entryPrice: ord.price,
                markPrice: newPrice,
                size: ord.amount,
                margin,
                marginMode: ord.marginMode || 'cross',
                pnl: 0,
                pnlPercentage: 0,
                liquidationPrice: liqPrice,
                createdAt: new Date().toLocaleTimeString(),
              };
              setPositions((posList) => [newPos, ...posList]);
            }

            setOrderHistory((hist) => [{ ...ord, id: `hist-fill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, status: 'filled' }, ...hist]);
          } else {
            remaining.push(ord);
          }
        });

        return remaining;
      });

      // 7. Update Futures Positions Mark Price, PnL & Auto-close on TP/SL/Liquidation
      setPositions((prevPositions) => {
        const remainingPositions: Position[] = [];

        prevPositions.forEach((pos) => {
          if (pos.symbol !== activePair.symbol) {
            remainingPositions.push(pos);
            return;
          }

          const priceDiff = newPrice - pos.entryPrice;
          const rawPnl = pos.side === 'long' ? priceDiff * pos.size : -priceDiff * pos.size;
          const pnl = Number(rawPnl.toFixed(2));
          const pnlPercentage = Number(((pnl / pos.margin) * 100).toFixed(2));

          const updatedPos = {
            ...pos,
            markPrice: newPrice,
            pnl,
            pnlPercentage,
          };

          // Check Liquidation
          const isLiquidated =
            (pos.side === 'long' && newPrice <= pos.liquidationPrice) ||
            (pos.side === 'short' && newPrice >= pos.liquidationPrice);

          // Check TP / SL
          const isTakeProfit = pos.takeProfit
            ? (pos.side === 'long' && newPrice >= pos.takeProfit) ||
              (pos.side === 'short' && newPrice <= pos.takeProfit)
            : false;

          const isStopLoss = pos.stopLoss
            ? (pos.side === 'long' && newPrice <= pos.stopLoss) ||
              (pos.side === 'short' && newPrice >= pos.stopLoss)
            : false;

          if (isLiquidated || isTakeProfit || isStopLoss) {
            soundFx.playOrderFilled();
            const closeReason = isLiquidated
              ? 'LIQUIDATION'
              : isTakeProfit
              ? 'TAKE PROFIT'
              : 'STOP LOSS';

            const returnFunds = isLiquidated ? 0 : Math.max(0, pos.margin + pnl);
            setPortfolio((p) => ({ ...p, usdtBalance: p.usdtBalance + returnFunds }));

            setOrderHistory((hist) => [
              {
                id: `hist-auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                symbol: pos.symbol,
                positionSide: pos.side,
                leverage: pos.leverage,
                price: newPrice,
                amount: pos.size,
                pnl,
                pnlPercentage,
                status: 'closed',
                createdAt: new Date().toLocaleTimeString(),
              } as any,
              ...hist,
            ]);

            addNotification(
              isLiquidated ? 'error' : isTakeProfit ? 'success' : 'warning',
              `Position Closed (${closeReason})`,
              `${pos.symbol} ${pos.side.toUpperCase()} closed at $${newPrice.toFixed(2)} | PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
            );
          } else {
            remainingPositions.push(updatedPos);
          }
        });

        return remainingPositions;
      });

      // 8. Evaluate active price alerts
      setPriceAlerts((prevAlerts) => {
        return prevAlerts.map((alert) => {
          if (!alert.active || alert.triggered || alert.symbol !== activePair.symbol) {
            return alert;
          }

          const isMet =
            (alert.condition === 'above' && newPrice >= alert.targetPrice) ||
            (alert.condition === 'below' && newPrice <= alert.targetPrice);

          if (isMet) {
            soundFx.playOrderFilled();
            addNotification(
              'success',
              `Price Alert Triggered! (${alert.symbol})`,
              `${alert.symbol} reached $${newPrice.toFixed(2)} (Target: ${alert.condition} $${alert.targetPrice.toFixed(2)})`
            );
            return { ...alert, triggered: true, active: false };
          }
          return alert;
        });
      });
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
  }, skipBalanceCheck: boolean = false) => {
    if (transferModal.isOpen) return; // Prevent duplicate transfer modal calls
    const notional = orderData.price * orderData.amount;
    const requiredMargin = orderData.mode === 'spot' ? notional : notional / orderData.leverage;

    // Specific Account Balance Checking
    if (!skipBalanceCheck) {
      if (orderData.mode === 'spot') {
        if (orderData.side === 'buy') {
          const availableSpotUSDT = portfolio.spotBalances?.USDT || 0;
          if (availableSpotUSDT < notional) {
            const deficit = notional - availableSpotUSDT;
            const otherAccounts = [
              { name: 'futures' as const, bal: portfolio.usdtBalance || 0 },
              { name: 'funding' as const, bal: portfolio.fundingUsdt || 0 },
              { name: 'copy' as const, bal: portfolio.copyUsdt || 0 },
              { name: 'earn' as const, bal: portfolio.earnUsdt || 0 },
            ];
            const totalOtherUSDT = otherAccounts.reduce((sum, item) => sum + item.bal, 0);

            if (totalOtherUSDT >= deficit) {
              // Find account with highest USDT balance
              const sortedOther = [...otherAccounts].sort((a, b) => b.bal - a.bal);
              const bestFromAccount = sortedOther[0].name;

              addNotification(
                'warning',
                'Low Spot Wallet Balance',
                `Required: $${notional.toFixed(2)} USDT. You only have $${availableSpotUSDT.toFixed(2)} USDT in Spot. Pre-filling transfer of $${deficit.toFixed(2)} USDT to Spot Wallet.`
              );

              setPendingOrder(orderData);
              setTransferModal({
                isOpen: true,
                initialFrom: bestFromAccount,
                initialTo: 'spot',
                initialAsset: 'USDT',
                initialAmount: deficit.toFixed(2),
              });
            } else {
              addNotification(
                'error',
                'Insufficient Total Balance',
                `Required: $${notional.toFixed(2)} USDT. Total USDT across all wallets is $${(availableSpotUSDT + totalOtherUSDT).toFixed(2)}. Please claim via Faucet.`
              );
            }
            return;
          }
        } else {
          // Spot Sell: Check base asset
          const availableBaseAsset = portfolio.spotBalances?.[activePair.baseAsset] || 0;
          if (availableBaseAsset < orderData.amount) {
            addNotification(
              'error',
              'Insufficient Base Asset',
              `You do not have enough ${activePair.baseAsset} to sell. Available: ${availableBaseAsset.toFixed(4)}, Required: ${orderData.amount.toFixed(4)}.`
            );
            return;
          }
        }
      } else if (orderData.mode === 'futures') {
        const availableFuturesUSDT = portfolio.usdtBalance || 0;
        if (availableFuturesUSDT < requiredMargin) {
          const deficit = requiredMargin - availableFuturesUSDT;
          const otherAccounts = [
            { name: 'spot' as const, bal: portfolio.spotBalances?.USDT || 0 },
            { name: 'funding' as const, bal: portfolio.fundingUsdt || 0 },
            { name: 'copy' as const, bal: portfolio.copyUsdt || 0 },
            { name: 'earn' as const, bal: portfolio.earnUsdt || 0 },
          ];
          const totalOtherUSDT = otherAccounts.reduce((sum, item) => sum + item.bal, 0);

          if (totalOtherUSDT >= deficit) {
            const sortedOther = [...otherAccounts].sort((a, b) => b.bal - a.bal);
            const bestFromAccount = sortedOther[0].name;

            addNotification(
              'warning',
              'Low Futures Margin Balance',
              `Required: $${requiredMargin.toFixed(2)} USDT. You only have $${availableFuturesUSDT.toFixed(2)} USDT in Futures. Pre-filling transfer of $${deficit.toFixed(2)} USDT to Futures Account.`
            );

            setPendingOrder(orderData);
            setTransferModal({
              isOpen: true,
              initialFrom: bestFromAccount,
              initialTo: 'futures',
              initialAsset: 'USDT',
              initialAmount: deficit.toFixed(2),
            });
          } else {
            addNotification(
              'error',
              'Insufficient Total Balance',
              `Required Margin: $${requiredMargin.toFixed(2)} USDT. Total USDT across all wallets is $${(availableFuturesUSDT + totalOtherUSDT).toFixed(2)}. Please claim via Faucet.`
            );
          }
          return;
        }
      }
    }

    // Immediate execution for Market Orders
    if (orderData.type === 'market') {
      if (orderData.mode === 'spot') {
        if (orderData.side === 'buy') {
          // Spot Buy
          setPortfolio((p) => ({
            ...p,
            spotBalances: {
              ...p.spotBalances,
              USDT: Math.max(0, (p.spotBalances?.USDT || 0) - notional),
              [activePair.baseAsset]: (p.spotBalances?.[activePair.baseAsset] || 0) + orderData.amount,
            },
          }));
          addNotification('success', 'Spot Bought', `Bought ${orderData.amount} ${activePair.baseAsset} for ${notional.toFixed(2)} USDT`);
        } else {
          // Spot Sell
          setPortfolio((p) => ({
            ...p,
            spotBalances: {
              ...p.spotBalances,
              USDT: (p.spotBalances?.USDT || 0) + notional,
              [activePair.baseAsset]: Math.max(0, (p.spotBalances?.[activePair.baseAsset] || 0) - orderData.amount),
            },
          }));
          addNotification('success', 'Spot Sold', `Sold ${orderData.amount} ${activePair.baseAsset} for ${notional.toFixed(2)} USDT`);
        }

        // Record in Order History
        setOrderHistory((prev) => [
          {
            id: `hist-spot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            symbol: activePair.symbol,
            type: 'market',
            side: orderData.side,
            mode: 'spot',
            price: orderData.price,
            amount: orderData.amount,
            filled: orderData.amount,
            status: 'filled',
            createdAt: new Date().toLocaleTimeString(),
            leverage: 1,
            marginMode: 'cross',
          },
          ...prev,
        ]);
      } else if (orderData.mode === 'futures') {
        // Futures Market Position Open
        const liqPrice = calculateLiquidationPrice(
          activePair.price,
          orderData.side === 'buy' ? 'long' : 'short',
          orderData.leverage
        );

        const newPos: Position = {
          id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

        // Lock margin in Futures
        setPortfolio((p) => ({ ...p, usdtBalance: p.usdtBalance - requiredMargin }));
        setPositions((prev) => [newPos, ...prev]);

        addNotification(
          'success',
          `Futures ${orderData.side === 'buy' ? 'LONG' : 'SHORT'} Opened`,
          `${orderData.leverage}x ${activePair.symbol} position size ${orderData.amount} @ $${activePair.price.toFixed(2)}`
        );
      }
    } else {
      // Limit / Stop-Limit Order Placement
      const triggersImmediately = 
        (orderData.side === 'buy' && orderData.price >= activePair.price) ||
        (orderData.side === 'sell' && orderData.price <= activePair.price);

      if (triggersImmediately) {
        soundFx.playOrderFilled();
        const execPrice = activePair.price;
        const execNotional = execPrice * orderData.amount;

        if (orderData.mode === 'spot') {
          if (orderData.side === 'buy') {
            setPortfolio((p) => ({
              ...p,
              spotBalances: {
                ...p.spotBalances,
                USDT: Math.max(0, (p.spotBalances?.USDT || 0) - execNotional),
                [activePair.baseAsset]: (p.spotBalances?.[activePair.baseAsset] || 0) + orderData.amount,
              },
            }));
            addNotification('success', 'Limit Order Executed', `Limit Buy ${orderData.amount} ${activePair.baseAsset} filled immediately @ $${execPrice.toFixed(2)}`);
          } else {
            setPortfolio((p) => ({
              ...p,
              spotBalances: {
                ...p.spotBalances,
                USDT: (p.spotBalances?.USDT || 0) + execNotional,
                [activePair.baseAsset]: Math.max(0, (p.spotBalances?.[activePair.baseAsset] || 0) - orderData.amount),
              },
            }));
            addNotification('success', 'Limit Order Executed', `Limit Sell ${orderData.amount} ${activePair.baseAsset} filled immediately @ $${execPrice.toFixed(2)}`);
          }

          setOrderHistory((prev) => [
            {
              id: `hist-limit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              symbol: activePair.symbol,
              type: orderData.type,
              side: orderData.side,
              mode: 'spot',
              price: execPrice,
              amount: orderData.amount,
              filled: orderData.amount,
              status: 'filled',
              createdAt: new Date().toLocaleTimeString(),
              leverage: 1,
              marginMode: 'cross',
            },
            ...prev,
          ]);
        } else if (orderData.mode === 'futures') {
          const liqPrice = calculateLiquidationPrice(
            execPrice,
            orderData.side === 'buy' ? 'long' : 'short',
            orderData.leverage
          );

          const newPos: Position = {
            id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            symbol: activePair.symbol,
            side: orderData.side === 'buy' ? 'long' : 'short',
            leverage: orderData.leverage,
            entryPrice: execPrice,
            markPrice: execPrice,
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

          setPortfolio((p) => ({ ...p, usdtBalance: Math.max(0, p.usdtBalance - requiredMargin) }));
          setPositions((prev) => [newPos, ...prev]);

          setOrderHistory((prev) => [
            {
              id: `hist-limit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              symbol: activePair.symbol,
              type: orderData.type,
              side: orderData.side,
              mode: 'futures',
              price: execPrice,
              amount: orderData.amount,
              filled: orderData.amount,
              status: 'filled',
              createdAt: new Date().toLocaleTimeString(),
              leverage: orderData.leverage,
              marginMode: orderData.marginMode,
            },
            ...prev,
          ]);

          addNotification(
            'success',
            `Futures Limit ${orderData.side === 'buy' ? 'LONG' : 'SHORT'} Filled`,
            `${orderData.leverage}x ${activePair.symbol} position size ${orderData.amount} @ $${execPrice.toFixed(2)}`
          );
        }
      } else {
        // Lock funds/margin immediately for open limit order
        if (orderData.mode === 'spot') {
          if (orderData.side === 'buy') {
            setPortfolio((p) => ({
              ...p,
              spotBalances: {
                ...p.spotBalances,
                USDT: Math.max(0, (p.spotBalances?.USDT || 0) - notional),
              },
            }));
          } else {
            setPortfolio((p) => ({
              ...p,
              spotBalances: {
                ...p.spotBalances,
                [activePair.baseAsset]: Math.max(0, (p.spotBalances?.[activePair.baseAsset] || 0) - orderData.amount),
              },
            }));
          }
        } else if (orderData.mode === 'futures') {
          setPortfolio((p) => ({
            ...p,
            usdtBalance: Math.max(0, p.usdtBalance - requiredMargin),
          }));
        }

        const newOrder: Order = {
          id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
        addNotification('info', 'Limit Order Placed', `${orderData.side.toUpperCase()} ${orderData.amount} ${activePair.baseAsset} at $${orderData.price.toFixed(2)} (Funds locked)`);
      }
    }

    // Switch view to Positions tab
    setMobileTab('trades');
    setTimeout(() => {
      const posElement = document.getElementById('positions-section');
      if (posElement) {
        posElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
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

    // Refund locked funds/margin
    const notional = ord.price * ord.amount;
    if (ord.mode === 'spot') {
      if (ord.side === 'buy') {
        setPortfolio((p) => ({
          ...p,
          spotBalances: {
            ...p.spotBalances,
            USDT: (p.spotBalances?.USDT || 0) + notional,
          },
        }));
      } else {
        const baseAsset = ord.symbol.replace('USDT', '');
        setPortfolio((p) => ({
          ...p,
          spotBalances: {
            ...p.spotBalances,
            [baseAsset]: (p.spotBalances?.[baseAsset] || 0) + ord.amount,
          },
        }));
      }
    } else if (ord.mode === 'futures') {
      const margin = notional / (ord.leverage || 10);
      setPortfolio((p) => ({
        ...p,
        usdtBalance: p.usdtBalance + margin,
      }));
    }

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setOrderHistory((prev) => [{ ...ord, id: `hist-cancel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, status: 'cancelled' }, ...prev]);
    addNotification('info', 'Order Cancelled', `Cancelled ${ord.side.toUpperCase()} order for ${ord.symbol}. Funds unlocked.`);
  };

  // Reset Balance via Faucet
  const handleResetBalance = (amount: number = 100000) => {
    setPositions([]);
    setOrders([]);
    const updatedPortfolio = {
      usdtBalance: 0,
      fundingUsdt: amount,
      copyUsdt: 0,
      earnUsdt: 0,
      spotBalances: { USDT: 0, BTC: 0, ETH: 0, SOL: 0 },
    };
    setPortfolio(updatedPortfolio);
    localStorage.setItem('tradex_portfolio', JSON.stringify(updatedPortfolio));
    localStorage.removeItem('tradex_positions');
    localStorage.removeItem('tradex_orders');
    addNotification('success', 'Faucet Reset', `All opened positions closed. All accounts and spot crypto reset to 0, and Funding Account refilled to $${amount.toLocaleString()} USDT.`);
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

  // Internal Asset Transfer Between Accounts
  const handleTransferAsset = (
    fromAcc: string,
    toAcc: string,
    asset: string,
    amount: number
  ) => {
    if (fromAcc === toAcc || amount <= 0) return;

    setPortfolio((prev) => {
      const next = { ...prev };
      if (!next.spotBalances) next.spotBalances = {};
      if (next.fundingUsdt === undefined) next.fundingUsdt = 0;
      if (next.copyUsdt === undefined) next.copyUsdt = 0;
      if (next.earnUsdt === undefined) next.earnUsdt = 0;

      // Deduct from Source Account
      if (asset === 'USDT') {
        if (fromAcc === 'futures') next.usdtBalance = Math.max(0, next.usdtBalance - amount);
        else if (fromAcc === 'spot') next.spotBalances.USDT = Math.max(0, (next.spotBalances.USDT || 0) - amount);
        else if (fromAcc === 'funding') next.fundingUsdt = Math.max(0, (next.fundingUsdt || 0) - amount);
        else if (fromAcc === 'copy') next.copyUsdt = Math.max(0, (next.copyUsdt || 0) - amount);
        else if (fromAcc === 'earn') next.earnUsdt = Math.max(0, (next.earnUsdt || 0) - amount);

        // Add to Destination Account
        if (toAcc === 'futures') next.usdtBalance += amount;
        else if (toAcc === 'spot') next.spotBalances.USDT = (next.spotBalances.USDT || 0) + amount;
        else if (toAcc === 'funding') next.fundingUsdt = (next.fundingUsdt || 0) + amount;
        else if (toAcc === 'copy') next.copyUsdt = (next.copyUsdt || 0) + amount;
        else if (toAcc === 'earn') next.earnUsdt = (next.earnUsdt || 0) + amount;
      } else {
        // Non-USDT Asset (e.g. BTC, ETH, SOL)
        if (fromAcc === 'spot') {
          next.spotBalances[asset] = Math.max(0, (next.spotBalances[asset] || 0) - amount);
        }
        if (toAcc === 'spot') {
          next.spotBalances[asset] = (next.spotBalances[asset] || 0) + amount;
        }
      }

      localStorage.setItem('tradex_portfolio', JSON.stringify(next));
      return next;
    });

    soundFx.playOrderFilled();
    addNotification('success', 'Transfer Completed', `Transferred ${amount} ${asset} from ${fromAcc.toUpperCase()} to ${toAcc.toUpperCase()}`);

    // Auto-execute pending order if user was prompted to transfer margin for order placement
    if (pendingOrder) {
      const targetOrder = pendingOrder;
      setPendingOrder(null);
      setTimeout(() => {
        handleSubmitOrder(targetOrder, true);
      }, 150);
    }
  };

  if (!user) {
    return (
      <div className={theme === 'light' ? 'light-theme' : ''}>
        <LoginPage onLogin={handleLogin} />
        <NotificationToast notifications={notifications} onDismiss={handleDismissNotif} />
      </div>
    );
  }

  return (
    <div className={`h-screen w-full max-w-full bg-[#0b0e11] flex flex-col overflow-x-hidden overflow-y-hidden font-sans text-zinc-100 select-none ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* Top Main Navigation Header - Fixed at top with 0 margin across all pages */}
      <Header
        activePair={activePair}
        portfolio={portfolio}
        activeDockTab={activeDockTab}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenPairModal={() => setIsPairModalOpen(true)}
        onOpenFaucetModal={() => setIsFaucetModalOpen(true)}
        onToggleAiAnalyst={() => setIsAiAnalystOpen(!isAiAnalystOpen)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          soundFx.enabled = !soundEnabled;
          setSoundEnabled(!soundEnabled);
        }}
        onGoHome={() => setActiveDockTab('home')}
        pairs={pairs}
        onSelectPair={handleSelectPair}
        onOpenPriceAlerts={() => setIsPriceAlertsModalOpen(true)}
        activeAlertsCount={priceAlerts.filter(a => a.active && !a.triggered).length}
      />

      {/* Main Workspace Body Layout */}
      <div className="flex-1 flex flex-col min-h-0 relative w-full max-w-full overflow-x-hidden overflow-y-auto lg:overflow-hidden pb-12">
        <AnimatePresence mode="popLayout">
          {activeDockTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="flex-1 flex flex-col min-h-0 w-full"
            >
              <HomePage
                pairs={pairs}
                portfolio={portfolio}
                positions={positions}
                onSelectPair={handleSelectPair}
                onNavigateToFutures={() => setActiveDockTab('futures')}
                onOpenDeposit={() => setIsFaucetModalOpen(true)}
              />
            </motion.div>
          )}

          {activeDockTab === 'markets' && (
            <motion.div
              key="markets"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="flex-1 flex flex-col min-h-0 w-full"
            >
              <MarketsPage
                pairs={pairs}
                onSelectPair={handleSelectPair}
                onNavigateToFutures={() => setActiveDockTab('futures')}
              />
            </motion.div>
          )}

          {activeDockTab === 'assets' && (
            <motion.div
              key="assets"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="flex-1 flex flex-col min-h-0 w-full"
            >
              <AssetsPage
                portfolio={portfolio}
                positions={positions}
                pairs={pairs}
                onOpenDeposit={() => setIsFaucetModalOpen(true)}
                onResetBalance={handleResetBalance}
                onOpenFaucet={() => setIsFaucetModalOpen(true)}
                onTransferAsset={handleTransferAsset}
              />
            </motion.div>
          )}

          {(activeDockTab === 'futures' || activeDockTab === 'trade') && (
            <motion.div
              key="trading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="flex-1 flex flex-col min-h-0 w-full"
            >
              {/* Desktop Layout (lg:flex) */}
              <div className="hidden lg:flex flex-1 min-h-[calc(100vh-7rem)] shrink-0 bg-[#0b0e11]">
                {/* Left/Center Main Column: Chart on top, Positions on bottom */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-amber-500/10 h-full">
                  {/* Chart Workspace */}
                  <div className="flex-1 min-h-[440px] relative">
                    <TradingChart
                      candles={candles}
                      symbol={activePair.symbol}
                      precision={activePair.precision}
                      timeframe={timeframe}
                      onChangeTimeframe={handleChangeTimeframe}
                      currentPrice={activePair.price}
                      positions={positions}
                      isLoading={isChartLoading}
                      onOpenLong={() => setIsTradeModalOpen(true)}
                      onOpenShort={() => setIsTradeModalOpen(true)}
                      onOpenPairModal={() => setIsPairModalOpen(true)}
                    />
                  </div>

                  {/* Bottom Wide Positions Panel */}
                  <div id="positions-section" className="h-72 border-t border-amber-500/10 shrink-0">
                    <PositionHistory
                      positions={positions}
                      orders={orders}
                      orderHistory={orderHistory}
                      onClosePosition={handleClosePosition}
                      onCancelOrder={handleCancelOrder}
                    />
                  </div>
                </div>

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

                {/* Order Placement Form */}
                <OrderForm
                  activePair={activePair}
                  portfolio={portfolio}
                  selectedPrice={selectedBookPrice}
                  onSubmitOrder={handleSubmitOrder}
                />
              </div>

              {/* Mobile Layout (< lg) */}
              <div className="flex lg:hidden flex-col bg-[#0a0805] w-full relative">
                {/* 1. Mobile Navigation Tab Bar - Placed DIRECTLY under topman bar */}
                <div className="flex bg-[#0c0a06] border-b border-amber-500/10 text-[11px] font-bold shrink-0 sticky top-0 z-20 px-3 py-1.5 gap-2 overflow-x-auto no-scrollbar justify-between items-center w-full">
                  <button
                    onClick={() => setMobileTab('chart')}
                    className={`flex-1 py-1.5 text-center transition-all cursor-pointer whitespace-nowrap ${
                      mobileTab === 'chart' ? 'app-tab-active' : 'app-tab-inactive'
                    }`}
                  >
                    Chart
                  </button>
                  <button
                    onClick={() => setMobileTab('orderbook')}
                    className={`flex-1 py-1.5 text-center transition-all cursor-pointer whitespace-nowrap ${
                      mobileTab === 'orderbook' ? 'app-tab-active' : 'app-tab-inactive'
                    }`}
                  >
                    Order Book
                  </button>
                  <button
                    onClick={() => setMobileTab('trades')}
                    className={`flex-1 py-1.5 text-center transition-all cursor-pointer whitespace-nowrap ${
                      mobileTab === 'trades' ? 'app-tab-active' : 'app-tab-inactive'
                    }`}
                  >
                    Positions
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setIsTradeModalOpen(true);
                    }}
                    className="flex-1 py-1 px-3 text-center bg-[#00c076]/10 hover:bg-[#00c076]/20 text-[#00c076] transition-all font-extrabold rounded-lg cursor-pointer whitespace-nowrap shadow-xs shadow-[#00c076]/10 h-7 text-xs"
                  >
                    Trade
                  </button>
                </div>

                {/* 2. Tab content renders below the tab bar - No nested scrolling, expands naturally */}
                <div className="w-full pb-16">
                  <AnimatePresence mode="wait">
                    {mobileTab === 'chart' && (
                      <motion.div
                        key="mobile-chart"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.12 }}
                        className="w-full h-[450px]"
                      >
                        <TradingChart
                          candles={candles}
                          symbol={activePair.symbol}
                          precision={activePair.precision}
                          timeframe={timeframe}
                          onChangeTimeframe={handleChangeTimeframe}
                          currentPrice={activePair.price}
                          isLoading={isChartLoading}
                          onOpenLong={() => setIsTradeModalOpen(true)}
                          onOpenShort={() => setIsTradeModalOpen(true)}
                          onOpenPairModal={() => setIsPairModalOpen(true)}
                        />
                      </motion.div>
                    )}

                    {mobileTab === 'orderbook' && (
                      <motion.div
                        key="mobile-orderbook"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.12 }}
                        className="p-1"
                      >
                        <OrderBook
                          asks={orderBook.asks}
                          bids={orderBook.bids}
                          currentPrice={activePair.price}
                          precision={activePair.precision}
                          onSelectPrice={(price) => {
                            setSelectedBookPrice(price);
                            setIsTradeModalOpen(true);
                          }}
                        />
                      </motion.div>
                    )}

                    {mobileTab === 'trades' && (
                      <motion.div
                        key="mobile-trades"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.12 }}
                        className="p-1"
                      >
                        <PositionHistory
                          positions={positions}
                          orders={orders}
                          orderHistory={orderHistory}
                          onClosePosition={handleClosePosition}
                          onCancelOrder={handleCancelOrder}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Floating Navigation Dock (Fixed at viewport bottom) */}
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

      <TransferModal
        isOpen={transferModal.isOpen}
        onClose={() => setTransferModal((prev) => ({ ...prev, isOpen: false }))}
        portfolio={portfolio}
        initialFrom={transferModal.initialFrom}
        initialTo={transferModal.initialTo}
        initialAsset={transferModal.initialAsset}
        initialAmount={transferModal.initialAmount}
        onTransferAsset={handleTransferAsset}
      />

      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        activePair={activePair}
        portfolio={portfolio}
        selectedPrice={selectedBookPrice}
        onSubmitOrder={handleSubmitOrder}
      />

      <AiAnalystDrawer
        isOpen={isAiAnalystOpen}
        onClose={() => setIsAiAnalystOpen(false)}
        activePair={activePair}
        candles={candles}
      />

      <PriceAlertsModal
        isOpen={isPriceAlertsModalOpen}
        onClose={() => setIsPriceAlertsModalOpen(false)}
        activePair={activePair}
        priceAlerts={priceAlerts}
        onAddAlert={handleAddPriceAlert}
        onToggleAlert={handleTogglePriceAlert}
        onDeleteAlert={handleDeletePriceAlert}
      />

      {/* Floating Notification Toasts */}
      <NotificationToast notifications={notifications} onDismiss={handleDismissNotif} />
    </div>
  );
}
