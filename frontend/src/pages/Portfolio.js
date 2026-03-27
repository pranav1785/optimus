import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, Clock, BarChart2 } from 'lucide-react';

const Portfolio = () => {
  const { isDark, portfolio, refreshPortfolio } = useApp();
  const [trades, setTrades] = useState([]);
  const [resetting, setResetting] = useState(false);
  const [showReset, setShowReset] = useState(false);

  // Deterministic history — no Math.random() to avoid re-render flicker
  const mockHistory = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i+1}`,
    value: 100000 + Math.sin(i * 0.4) * 4000 + i * 200 + Math.sin(i * 1.7) * 800
  })), []);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const { data } = await axios.get(`${API}/portfolio/trades`);
        setTrades(data);
      } catch (e) {}
    };
    fetchTrades();
    refreshPortfolio();
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      await axios.delete(`${API}/portfolio/reset`);
      await refreshPortfolio();
      setTrades([]);
      setShowReset(false);
    } catch (e) {}
    setResetting(false);
  };

  const holdings = portfolio.holdings || [];
  const pnlPositive = (portfolio.total_pnl || 0) >= 0;
  const pieData = [
    { name: 'Cash', value: portfolio.cash_balance || 0, color: '#6C63FF' },
    ...holdings.map((h, i) => ({
      name: h.symbol,
      value: h.current_value || 0,
      color: ['#00D4FF', '#00FF88', '#FFB800', '#FF4444', '#9B59B6'][i % 5]
    }))
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>Portfolio</h1>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Your paper trading holdings and performance</p>
        </div>
        <button onClick={() => setShowReset(true)} data-testid="reset-portfolio-btn"
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass glass-hover text-sm transition-all text-[#FF4444]">
          <RefreshCw size={14} /> Reset Portfolio
        </button>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Value', value: `₹${(portfolio.total_portfolio_value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#6C63FF', testid: 'total-value' },
          { label: 'Cash Available', value: `₹${(portfolio.cash_balance || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#00D4FF', testid: 'cash-available' },
          { label: 'Invested', value: `₹${(portfolio.total_invested || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#FFB800', testid: 'total-invested' },
          { label: 'Unrealized P&L', value: `${pnlPositive ? '+' : ''}₹${Math.abs(portfolio.total_pnl || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: pnlPositive ? '#00FF88' : '#FF4444', testid: 'unrealized-pnl' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass p-4 rounded-2xl" data-testid={s.testid}>
            <p className="text-xs mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b' }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
            {s.label === 'Unrealized P&L' && (
              <p className="text-xs mt-0.5" style={{ color: pnlPositive ? '#00FF88' : '#FF4444' }}>
                {pnlPositive ? '+' : ''}{(portfolio.total_pnl_pct || 0).toFixed(2)}%
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Performance chart */}
        <div className="lg:col-span-2 glass p-5 rounded-2xl">
          <h3 className="font-bold mb-4" style={{ color: isDark ? '#fff' : '#0F172A' }}>Portfolio Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockHistory}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={v => [`₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Portfolio Value']} />
              <Area type="monotone" dataKey="value" stroke="#6C63FF" strokeWidth={2} fill="url(#portGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Asset allocation */}
        <div className="glass p-5 rounded-2xl">
          <h3 className="font-bold mb-4" style={{ color: isDark ? '#fff' : '#0F172A' }}>Asset Allocation</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    formatter={v => [`₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>{d.name}</span>
                    </div>
                    <span className="font-medium" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                      {((d.value / (portfolio.total_portfolio_value || 100000)) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-white/30">
              <BarChart2 size={32} className="mx-auto mb-2" />
              <p className="text-sm">No holdings yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Holdings table */}
      <div className="glass p-5 rounded-2xl mb-6" data-testid="holdings-table">
        <h3 className="font-bold mb-4" style={{ color: isDark ? '#fff' : '#0F172A' }}>Holdings</h3>
        {holdings.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp size={32} className="mx-auto mb-2 text-white/20" />
            <p className="text-sm text-white/40">No holdings. Start trading to see your portfolio here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
                  {['Symbol', 'Qty', 'Avg Buy Price', 'Current Price', 'Invested', 'Current Value', 'P&L', 'P&L %'].map(h => (
                    <th key={h} className="text-left pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => (
                  <tr key={i} className="border-t border-white/5" data-testid={`holding-row-${h.symbol}`}>
                    <td className="py-3 pr-4 font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{h.symbol}</td>
                    <td className="py-3 pr-4" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>{h.quantity}</td>
                    <td className="py-3 pr-4" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>₹{h.avg_buy_price?.toLocaleString('en-IN')}</td>
                    <td className="py-3 pr-4" style={{ color: isDark ? '#fff' : '#0F172A' }}>₹{h.current_price?.toLocaleString('en-IN')}</td>
                    <td className="py-3 pr-4" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>₹{h.invested?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="py-3 pr-4" style={{ color: isDark ? '#fff' : '#0F172A' }}>₹{h.current_value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className={`py-3 pr-4 font-bold ${h.pnl >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                      {h.pnl >= 0 ? '+' : ''}₹{Math.abs(h.pnl || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className={`py-3 font-bold ${h.pnl_pct >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                      {h.pnl_pct >= 0 ? '+' : ''}{(h.pnl_pct || 0).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade history */}
      <div className="glass p-5 rounded-2xl" data-testid="trade-history">
        <h3 className="font-bold mb-4" style={{ color: isDark ? '#fff' : '#0F172A' }}>Trade History</h3>
        {trades.length === 0 ? (
          <div className="text-center py-6 text-white/30"><Clock size={24} className="mx-auto mb-2" /><p className="text-sm">No trades yet</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
                  {['Date', 'Symbol', 'Side', 'Qty', 'Price', 'Total'].map(h => <th key={h} className="text-left pb-3 pr-4">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="py-2.5 pr-4 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
                      {new Date(t.timestamp).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-2.5 pr-4 font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{t.symbol}</td>
                    <td className={`py-2.5 pr-4 font-bold text-xs ${t.side === 'BUY' ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>{t.side}</td>
                    <td className="py-2.5 pr-4" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>{t.quantity}</td>
                    <td className="py-2.5 pr-4" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>₹{t.price?.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 font-medium" style={{ color: isDark ? '#fff' : '#0F172A' }}>₹{t.total_value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset confirmation modal */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowReset(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}
            className="relative glass p-8 rounded-2xl max-w-sm w-full text-center"
            style={{ background: isDark ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.95)' }}>
            <AlertCircle size={40} className="mx-auto mb-4 text-[#FF4444]" />
            <h3 className="font-bold text-xl mb-2" style={{ color: isDark ? '#fff' : '#0F172A' }}>Reset Portfolio?</h3>
            <p className="text-sm text-white/50 mb-6">This will reset your portfolio to ₹1,00,000 cash and clear all trades. This cannot be undone!</p>
            <div className="flex gap-3">
              <button onClick={() => setShowReset(false)} className="flex-1 py-2.5 rounded-xl glass glass-hover text-sm font-medium" style={{ color: isDark ? '#fff' : '#0F172A' }}>Cancel</button>
              <button onClick={handleReset} disabled={resetting} data-testid="confirm-reset-btn"
                className="flex-1 py-2.5 rounded-xl bg-[#FF4444] text-white text-sm font-bold hover:bg-[#DD3333] transition-all disabled:opacity-50">
                {resetting ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
