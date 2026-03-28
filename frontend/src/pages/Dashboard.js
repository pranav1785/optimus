import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { TrendingUp, TrendingDown, Zap, Trophy, Map, BarChart2, FlaskConical, BookOpen, Users, Clock, Star } from 'lucide-react';
import { INVESTOR_QUOTES } from '../data/mockData';

const TICKER_STOCKS = [
  { symbol: 'RELIANCE', price: 2456.75, change: 0.51 }, { symbol: 'TCS', price: 3789.20, change: -0.62 },
  { symbol: 'HDFCBANK', price: 1642.30, change: 0.53 }, { symbol: 'INFY', price: 1456.85, change: -0.34 },
  { symbol: 'ICICIBANK', price: 1089.45, change: 1.23 }, { symbol: 'BAJFINANCE', price: 6789.20, change: -0.89 },
  { symbol: 'BHARTIARTL', price: 1234.60, change: 2.15 }, { symbol: 'SBIN', price: 789.30, change: 0.45 },
  { symbol: 'BTC', price: 6834560, change: 2.34 }, { symbol: 'ETH', price: 389450, change: 1.56 },
];

const QUICK_ACTIONS = [
  { label: "Continue Learning", icon: Map, path: "/roadmap", color: "#6C63FF", desc: "Pick up where you left off" },
  { label: "Paper Trade", icon: TrendingUp, path: "/trade", color: "#00D4FF", desc: "Simulate real trades" },
  { label: "Run a Backtest", icon: FlaskConical, path: "/algo-lab", color: "#FFB800", desc: "Test your strategy" },
  { label: "Daily Quiz", icon: BookOpen, path: "/learn#quiz", color: "#00FF88", desc: "+100 XP available" },
];

const Dashboard = () => {
  const { user, portfolio, isDark } = useApp();
  const [trades, setTrades] = useState([]);
  const [towns, setTowns] = useState([]);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * INVESTOR_QUOTES.length));

  const mockPortfolioHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 100000 + (Math.sin(i * 0.3) * 3000) + (i * 150) + (Math.random() * 1000 - 500)
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tradesRes, progressRes] = await Promise.all([
          axios.get(`${API}/portfolio/trades`),
          axios.get(`${API}/roadmap/progress`)
        ]);
        setTrades(tradesRes.data.slice(0, 5));
        setTowns(progressRes.data);
      } catch (e) {}
    };
    fetchData();
  }, []);

  const completedTowns = towns.filter(t => t.status === 'completed').length;
  const pnlColor = portfolio.total_pnl >= 0 ? '#00FF88' : '#FF4444';
  const pnlSign = portfolio.total_pnl >= 0 ? '+' : '';
  const quote = INVESTOR_QUOTES[quoteIdx];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Stock Ticker */}
      <div className={`mb-6 rounded-xl overflow-hidden ${isDark ? 'bg-black/40 border border-white/5' : 'bg-white border border-black/5'}`}>
        <div className="ticker-wrap py-2.5">
          <div className="ticker-content">
            {[...TICKER_STOCKS, ...TICKER_STOCKS].map((s, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-4 text-sm">
                <span className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{s.symbol}</span>
                <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>
                  ₹{s.price.toLocaleString('en-IN')}
                </span>
                <span className={s.change >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'} style={{ fontSize: '12px' }}>
                  {s.change >= 0 ? '▲' : '▼'} {Math.abs(s.change)}%
                </span>
                <span className="text-white/10 mx-2">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
          Welcome back, {user.name?.split(' ')[0]}!
        </h1>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
          Level {user.level} · {user.xp} XP · {user.college}
        </p>
      </motion.div>

      {/* XP + Level Bar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={`glass p-5 rounded-2xl mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB800] to-[#FF8800] flex items-center justify-center font-black text-white text-lg"
              style={{ boxShadow: '0 0 16px rgba(255,184,0,0.4)' }} data-testid="user-level-badge">
              {user.level}
            </div>
            <div>
              <p className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Level {user.level}</p>
              <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
                {user.xp % 500}/{500} XP to Level {user.level + 1}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(user.badges || []).slice(0, 4).map((b, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center" title={b}>
                <Star size={12} className="text-[#FFB800]" />
              </div>
            ))}
          </div>
        </div>
        <div className="xp-bar" data-testid="xp-progress-bar">
          <motion.div className="xp-bar-fill" initial={{ width: 0 }}
            animate={{ width: `${((user.xp % 500) / 500) * 100}%` }} transition={{ duration: 1, delay: 0.5 }} />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Portfolio Value", value: `₹${(portfolio.total_portfolio_value || 100000).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: "Virtual funds", icon: TrendingUp, color: "#6C63FF", testid: "portfolio-value" },
          { label: "Cash Balance", value: `₹${(portfolio.cash_balance || 100000).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: "Available to trade", icon: Zap, color: "#00D4FF", testid: "cash-balance" },
          { label: "Unrealized P&L", value: `${pnlSign}₹${Math.abs(portfolio.total_pnl || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: `${pnlSign}${(portfolio.total_pnl_pct || 0).toFixed(2)}%`, icon: portfolio.total_pnl >= 0 ? TrendingUp : TrendingDown, color: pnlColor, testid: "unrealized-pnl" },
          { label: "Towns Completed", value: `${completedTowns}/12`, sub: "Learning progress", icon: Map, color: "#FFB800", testid: "towns-completed" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="glass p-4 rounded-2xl glass-hover" data-testid={stat.testid}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{stat.label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-xl font-bold" style={{ color: stat.label === 'Unrealized P&L' ? pnlColor : (isDark ? '#fff' : '#0F172A') }}>
              {stat.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily Quiz Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="glass rounded-2xl mb-6 p-4 sm:p-5 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.07), rgba(0,212,255,0.04))', border: '1px solid rgba(0,255,136,0.18)' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
              style={{ background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.25)' }}>
              <BookOpen size={22} style={{ color: '#00FF88' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-black text-base sm:text-lg" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
                  Daily Quiz
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black text-black" style={{ background: '#FFB800' }}>
                  +100 XP
                </span>
              </div>
              <p className="text-xs sm:text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b' }}>
                Test your market knowledge · Streak bonus available · Resets daily
              </p>
            </div>
          </div>
          <Link to="/learn" data-testid="daily-quiz-btn"
            className="flex-shrink-0 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #00FF88, #00D4FF)', color: '#000', boxShadow: '0 0 20px rgba(0,255,136,0.3)' }}>
            Take Quiz
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Portfolio Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass p-5 rounded-2xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Portfolio Performance</h3>
            <span className="text-xs px-2 py-1 rounded-full text-[#00FF88]" style={{ background: 'rgba(0,255,136,0.1)' }}>Last 30 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={mockPortfolioHistory}>
              <defs>
                <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }} itemStyle={{ color: '#6C63FF' }}
                formatter={v => [`₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Value']} />
              <Area type="monotone" dataKey="value" stroke="#6C63FF" strokeWidth={2} fill="url(#pGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass p-5 rounded-2xl">
          <h3 className="font-bold mb-4" style={{ color: isDark ? '#fff' : '#0F172A' }}>Quick Actions</h3>
          <div className="space-y-2.5">
            {QUICK_ACTIONS.map((a, i) => (
              <Link key={i} to={a.path} data-testid={`quick-action-${a.label.toLowerCase().replace(/\s/g, '-')}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${a.color}20` }}>
                  <a.icon size={15} style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: isDark ? '#fff' : '#0F172A' }}>{a.label}</p>
                  <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{a.desc}</p>
                </div>
                <TrendingUp size={14} className="text-white/20 group-hover:text-white/50 transition-all" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Recent Trades</h3>
            <Link to="/portfolio" className="text-xs text-[#6C63FF] hover:underline">View all</Link>
          </div>
          {trades.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp size={32} className="mx-auto mb-2 text-white/20" />
              <p className="text-sm text-white/40">No trades yet</p>
              <Link to="/trade" className="text-xs text-[#6C63FF] hover:underline mt-1 block">Start paper trading →</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {trades.map((t, i) => (
                <div key={i} className="flex items-center justify-between" data-testid={`trade-row-${i}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${t.side === 'BUY' ? 'bg-[#00FF88]/15 text-[#00FF88]' : 'bg-[#FF4444]/15 text-[#FF4444]'}`}>
                      {t.side === 'BUY' ? 'B' : 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{t.symbol}</p>
                      <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{t.quantity} qty @ ₹{t.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                      ₹{t.total_value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }}>
                      {new Date(t.timestamp).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Investor Quote */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass p-5 rounded-2xl flex flex-col justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.05))' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#6C63FF] mb-4">Quote of the Day</p>
            <blockquote className="text-base leading-relaxed font-medium mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#0F172A' }}>
              "{quote?.quote}"
            </blockquote>
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>— {quote?.author}</p>
            <p className="text-xs text-white/40">{quote?.role}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
