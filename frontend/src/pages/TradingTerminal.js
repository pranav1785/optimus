import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, ComposedChart } from 'recharts';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import InfoButton from '../components/InfoButton';
import { Search, TrendingUp, TrendingDown, RefreshCw, AlertCircle, ChevronDown, Zap } from 'lucide-react';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y'];

const calcMA = (data, window) => {
  return data.map((d, i) => {
    if (i < window - 1) return { ...d, [`ma${window}`]: null };
    const slice = data.slice(i - window + 1, i + 1);
    const avg = slice.reduce((sum, s) => sum + s.close, 0) / window;
    return { ...d, [`ma${window}`]: parseFloat(avg.toFixed(2)) };
  });
};

const MobileWarning = ({ isDark }) => (
  <div className={`md:hidden p-6 m-4 rounded-2xl glass text-center`}>
    <AlertCircle size={40} className="mx-auto mb-3 text-[#FFB800]" />
    <h3 className="font-bold text-lg mb-2" style={{ color: isDark ? '#fff' : '#0F172A' }}>Best on Desktop</h3>
    <p className="text-sm text-white/50">The Trading Terminal is designed for desktop. Please use a larger screen for the full experience.</p>
  </div>
);

const TradingTerminal = () => {
  const { isDark, portfolio, refreshPortfolio, addXP } = useApp();
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState('3M');
  const [showMA10, setShowMA10] = useState(true);
  const [showMA30, setShowMA30] = useState(true);
  const [order, setOrder] = useState({ side: 'BUY', type: 'MARKET', qty: 1, price: '' });
  const [orderMsg, setOrderMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data } = await axios.get(`${API}/market/stocks`);
        setStocks(data);
        if (data.length > 0 && !selectedStock) setSelectedStock(data[0]);
      } catch (e) {}
    };
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchChart = useCallback(async () => {
    if (!selectedStock) return;
    try {
      const { data } = await axios.get(`${API}/market/stocks/${selectedStock.symbol}/chart?period=${timeframe}`);
      let processed = data.data.map(d => ({
        ...d,
        time: d.time.slice(5), // Show MM-DD
        change: d.close > d.open ? 1 : -1,
      }));
      if (showMA10) processed = calcMA(processed, 10);
      if (showMA30) processed = calcMA(processed, 30);
      setChartData(processed);
    } catch (e) {}
  }, [selectedStock, timeframe, showMA10, showMA30]);

  useEffect(() => { fetchChart(); }, [fetchChart]);

  const placeOrder = async () => {
    if (!selectedStock || loading) return;
    setLoading(true);
    setOrderMsg(null);
    try {
      const { data } = await axios.post(`${API}/portfolio/trade`, {
        symbol: selectedStock.symbol,
        asset_type: 'STOCK',
        side: order.side,
        order_type: order.type,
        quantity: parseFloat(order.qty),
        price: order.type === 'LIMIT' ? parseFloat(order.price) : null,
      });
      setOrderMsg({ type: 'success', text: `${order.side} order executed at ₹${data.price.toLocaleString('en-IN')} — Total: ₹${data.total.toLocaleString('en-IN')}` });
      await refreshPortfolio();
      await addXP(10, 'trade');
    } catch (e) {
      setOrderMsg({ type: 'error', text: e.response?.data?.detail || 'Order failed. Please try again.' });
    }
    setLoading(false);
  };

  const estimatedTotal = selectedStock ? parseFloat(order.qty || 0) * (order.type === 'LIMIT' ? parseFloat(order.price || 0) : (selectedStock.live_price || selectedStock.price)) : 0;
  const filteredStocks = stocks.filter(s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1]?.close : selectedStock?.price;
  const firstPrice = chartData.length > 0 ? chartData[0]?.close : selectedStock?.price;
  const chartChange = lastPrice && firstPrice ? ((lastPrice - firstPrice) / firstPrice * 100) : 0;
  const chartColor = chartChange >= 0 ? '#00FF88' : '#FF4444';

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#0a0a0a' : '#F8F9FF' }}>
      <MobileWarning isDark={isDark} />

      <div className="hidden md:flex h-screen flex-col" style={{ overflow: 'visible' }}>
        {/* Top bar */}
        <div className={`flex items-center gap-4 px-4 py-3 border-b ${isDark ? 'border-white/10 bg-black/40' : 'border-black/5 bg-white/50'} backdrop-blur-xl flex-shrink-0`}
          style={{ position: 'relative', zIndex: 100 }}>
          {/* Stock selector */}
          <div className="relative" style={{ zIndex: 200 }}>
            <button onClick={() => setShowSearch(!showSearch)} data-testid="stock-selector"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl glass glass-hover`}>
              <span className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                {selectedStock?.symbol || 'Select Stock'}
              </span>
              <ChevronDown size={14} className="text-white/40" />
            </button>
            {showSearch && (
              <div className={`absolute top-full left-0 mt-2 w-72 rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-black/5'}`}
                style={{ zIndex: 9999 }}>
                <div className="p-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                    <Search size={14} className="text-white/40" />
                    <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search stocks..." className="bg-transparent text-sm outline-none flex-1"
                      style={{ color: isDark ? '#fff' : '#0F172A' }} />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto pb-2">
                  {filteredStocks.map(s => (
                    <button key={s.symbol} onClick={() => { setSelectedStock(s); setShowSearch(false); setSearchQuery(''); }}
                      data-testid={`stock-option-${s.symbol}`}
                      className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-all ${selectedStock?.symbol === s.symbol ? 'bg-[#6C63FF]/10' : ''}`}>
                      <div className="text-left">
                        <p className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{s.symbol}</p>
                        <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{s.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: isDark ? '#fff' : '#0F172A' }}>₹{(s.live_price || s.price).toLocaleString('en-IN')}</p>
                        <p className={`text-xs ${s.change_pct >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>{s.change_pct >= 0 ? '+' : ''}{s.change_pct}%</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price display */}
          {selectedStock && (
            <div className="flex items-center gap-4">
              <div>
                <span className="text-2xl font-black" style={{ color: isDark ? '#fff' : '#0F172A', fontFamily: 'Outfit, sans-serif' }} data-testid="current-price">
                  ₹{(selectedStock.live_price || selectedStock.price).toLocaleString('en-IN')}
                </span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${chartChange >= 0 ? 'bg-[#00FF88]/15 text-[#00FF88]' : 'bg-[#FF4444]/15 text-[#FF4444]'}`}>
                {chartChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {chartChange >= 0 ? '+' : ''}{chartChange.toFixed(2)}%
              </div>
              <div className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
                52W: ₹{selectedStock.low_52w?.toLocaleString('en-IN')} – ₹{selectedStock.high_52w?.toLocaleString('en-IN')}
              </div>
            </div>
          )}

          {/* Timeframe */}
          <div className="ml-auto flex gap-1">
            {TIMEFRAMES.map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)} data-testid={`timeframe-${tf}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${timeframe === tf ? 'bg-[#6C63FF] text-white' : 'glass hover:bg-white/5 text-white/50'}`}>
                {tf}
              </button>
            ))}
          </div>

          {/* Indicator toggles */}
          <div className="flex gap-2">
            <button onClick={() => setShowMA10(v => !v)} className={`px-2 py-1 rounded text-xs font-bold transition-all ${showMA10 ? 'text-[#FFB800]' : 'text-white/20'}`}>MA10</button>
            <button onClick={() => setShowMA30(v => !v)} className={`px-2 py-1 rounded text-xs font-bold transition-all ${showMA30 ? 'text-[#00D4FF]' : 'text-white/20'}`}>MA30</button>
          </div>
        </div>

        <div className="flex flex-1" style={{ overflow: 'hidden' }}>
          {/* Chart area */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Price chart */}
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="75%">
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false}
                    tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} width={55} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    formatter={(v, name) => [
                      name === 'close' ? `₹${v?.toLocaleString('en-IN')}` : `₹${v?.toLocaleString('en-IN')}`,
                      name === 'close' ? 'Price' : name === 'ma10' ? 'MA(10)' : 'MA(30)'
                    ]} />
                  <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={1.5} fill="url(#chartGrad)" dot={false} connectNulls />
                  {showMA10 && <Area type="monotone" dataKey="ma10" stroke="#FFB800" strokeWidth={1.5} fill="none" dot={false} connectNulls />}
                  {showMA30 && <Area type="monotone" dataKey="ma30" stroke="#00D4FF" strokeWidth={1.5} fill="none" dot={false} connectNulls />}
                </ComposedChart>
              </ResponsiveContainer>
              {/* Volume chart */}
              <div style={{ height: '25%', minHeight: 80 }} className="relative">
                <div className="absolute top-1 left-2 text-[10px] font-semibold z-10 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <InfoButton term="Volume" />
                  <span>VOLUME</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(-60)} margin={{ top: 14, right: 8, left: 8, bottom: 0 }}>
                    <YAxis hide />
                    <XAxis dataKey="time" hide />
                    <Tooltip
                      contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
                      formatter={v => [typeof v === 'number' ? v.toLocaleString('en-IN') : v, 'Volume']}
                      labelFormatter={label => `Date: ${label}`}
                    />
                    <Bar dataKey="volume" name="Volume" radius={[1, 1, 0, 0]}
                      shape={({ x, y, width, height, value, index }) => {
                        const d = chartData.slice(-60)[index];
                        const color = d?.close >= d?.open ? 'rgba(0,255,136,0.4)' : 'rgba(255,68,68,0.4)';
                        return <rect x={x} y={y} width={Math.max(width, 1)} height={height} fill={color} rx={1} />;
                      }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className={`w-72 flex-shrink-0 border-l ${isDark ? 'border-white/10 bg-black/30' : 'border-black/5 bg-white/30'} flex flex-col overflow-hidden`}>
            {/* Order form */}
            <div className="p-4 border-b border-white/10 flex-shrink-0">
              <h3 className="font-bold text-sm mb-3" style={{ color: isDark ? '#fff' : '#0F172A' }}>Place Order</h3>
              
              {/* Buy/Sell toggle */}
              <div className="flex rounded-xl overflow-hidden mb-3 border border-white/10">
                {['BUY', 'SELL'].map(side => (
                  <button key={side} onClick={() => setOrder(o => ({ ...o, side }))} data-testid={`order-side-${side.toLowerCase()}`}
                    className={`flex-1 py-2 text-sm font-bold transition-all ${order.side === side
                      ? (side === 'BUY' ? 'bg-[#00FF88] text-black' : 'bg-[#FF4444] text-white')
                      : 'text-white/40 hover:text-white/70'}`}>
                    {side}
                  </button>
                ))}
              </div>

              {/* Order type */}
              <div className="flex gap-2 mb-3">
                {['MARKET', 'LIMIT'].map(type => (
                  <button key={type} onClick={() => setOrder(o => ({ ...o, type }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${order.type === type ? 'bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30' : 'glass text-white/40 hover:text-white/70'}`}>
                    {type}
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <div className="mb-3">
                <label className="text-xs text-white/40 mb-1 block">Quantity</label>
                <input type="number" value={order.qty} min="1" onChange={e => setOrder(o => ({ ...o, qty: e.target.value }))}
                  data-testid="order-qty-input"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-[#6C63FF]/50 outline-none transition-all"
                  style={{ color: isDark ? '#fff' : '#0F172A' }} />
              </div>

              {/* Limit price */}
              {order.type === 'LIMIT' && (
                <div className="mb-3">
                  <label className="text-xs text-white/40 mb-1 block flex items-center gap-1">
                    Limit Price <InfoButton term="Limit Order" definition="Executes only at your specified price or better" size="xs" />
                  </label>
                  <input type="number" value={order.price} onChange={e => setOrder(o => ({ ...o, price: e.target.value }))}
                    placeholder={`Current: ₹${selectedStock?.price?.toLocaleString('en-IN') || ''}`}
                    data-testid="order-price-input"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-[#6C63FF]/50 outline-none transition-all"
                    style={{ color: isDark ? '#fff' : '#0F172A' }} />
                </div>
              )}

              {/* Estimated total */}
              <div className="flex justify-between text-xs mb-4 px-1">
                <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>Est. Total</span>
                <span className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                  ₹{estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              <button onClick={placeOrder} disabled={!selectedStock || loading} data-testid="place-order-btn"
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 ${order.side === 'BUY' ? 'bg-[#00FF88] text-black hover:bg-[#00DD77]' : 'bg-[#FF4444] text-white hover:bg-[#DD3333]'}`}>
                {loading ? 'Placing...' : `${order.side} ${selectedStock?.symbol || ''}`}
              </button>

              {orderMsg && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 p-3 rounded-xl text-xs font-medium ${orderMsg.type === 'success' ? 'bg-[#00FF88]/10 text-[#00FF88]' : 'bg-[#FF4444]/10 text-[#FF4444]'}`}>
                  {orderMsg.text}
                </motion.div>
              )}
            </div>

            {/* Portfolio */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="font-bold text-sm mb-3" style={{ color: isDark ? '#fff' : '#0F172A' }}>Portfolio</h3>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>Cash</span>
                  <span className="font-bold text-[#00D4FF]">₹{(portfolio.cash_balance || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>Total P&L</span>
                  <span className={`font-bold ${(portfolio.total_pnl || 0) >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                    {(portfolio.total_pnl || 0) >= 0 ? '+' : ''}₹{Math.abs(portfolio.total_pnl || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {(portfolio.holdings || []).length === 0 ? (
                <p className="text-xs text-white/30 text-center py-4">No holdings yet. Place your first trade!</p>
              ) : (
                <div className="space-y-2">
                  {(portfolio.holdings || []).map((h, i) => (
                    <div key={i} className="glass p-3 rounded-xl" data-testid={`holding-${h.symbol}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{h.symbol}</p>
                          <p className="text-xs text-white/40">{h.quantity} shares</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-bold ${h.pnl >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                            {h.pnl >= 0 ? '+' : ''}₹{Math.abs(h.pnl || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </p>
                          <p className={`text-[10px] ${h.pnl_pct >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                            {h.pnl_pct >= 0 ? '+' : ''}{(h.pnl_pct || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingTerminal;
