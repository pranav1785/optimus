import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { FlaskConical, Play, TrendingUp, TrendingDown, ChevronRight, Code2, BarChart2, Save, Zap } from 'lucide-react';

const SYMBOLS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'WIPRO', 'BAJFINANCE', 'TATAMOTORS', 'AXISBANK'];
const PERIODS = [{ label: '6 Months', days: 180 }, { label: '1 Year', days: 365 }, { label: '2 Years', days: 730 }];

const MetricCard = ({ label, value, sub, color, testid }) => {
  const { isDark } = useApp();
  return (
    <div className="glass p-4 rounded-2xl" data-testid={testid}>
      <p className="text-xs mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{label}</p>
      <p className="text-xl font-black" style={{ color, fontFamily: 'Outfit, sans-serif' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5 text-white/30">{sub}</p>}
    </div>
  );
};

const AlgoLab = () => {
  const { isDark, addXP } = useApp();
  const [strategies, setStrategies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [symbol, setSymbol] = useState('RELIANCE');
  const [period, setPeriod] = useState(365);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState('strategies');

  useEffect(() => {
    axios.get(`${API}/algo/strategies`).then(r => {
      setStrategies(r.data.pre_built || []);
      if (r.data.pre_built?.length > 0) setSelected(r.data.pre_built[0]);
    }).catch(() => {});
  }, []);

  const runBacktest = async () => {
    if (!selected) return;
    setRunning(true);
    setResults(null);
    try {
      const { data } = await axios.post(`${API}/algo/backtest`, {
        strategy_type: selected.strategy_type,
        symbol,
        period_days: period,
      });
      setResults(data);
      setTab('results');
      await addXP(25, 'backtest');
    } catch (e) {}
    setRunning(false);
  };

  const riskColor = (level) => {
    if (level === 'Low' || level === 'Very Low') return '#00FF88';
    if (level === 'Medium' || level === 'Medium-Low') return '#FFB800';
    return '#FF4444';
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
          Algo Lab
        </h1>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
          Select a strategy, configure the backtest, and see how it performs on historical data
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Strategy selector */}
        <div className="space-y-3">
          <h2 className="font-bold text-sm uppercase tracking-widest" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
            Strategies
          </h2>
          {strategies.map((s, i) => (
            <motion.button key={s.strategy_id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => { setSelected(s); setResults(null); setTab('strategies'); }}
              data-testid={`strategy-${s.strategy_id}`}
              className={`w-full text-left glass p-4 rounded-2xl transition-all ${selected?.strategy_id === s.strategy_id ? 'border-[#6C63FF]/40 bg-[#6C63FF]/10' : 'glass-hover'}`}
              style={selected?.strategy_id === s.strategy_id ? { borderColor: 'rgba(108,99,255,0.3)' } : {}}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{s.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${riskColor(s.risk_level)}20`, color: riskColor(s.risk_level) }}>
                      {s.risk_level}
                    </span>
                    <span className="text-[10px] text-white/30">{s.expected_return}</span>
                  </div>
                </div>
                <ChevronRight size={14} className={`mt-1 flex-shrink-0 transition-all ${selected?.strategy_id === s.strategy_id ? 'text-[#6C63FF]' : 'text-white/20'}`} />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Right: Details + Config + Results */}
        <div className="lg:col-span-2 space-y-4">
          {selected && (
            <>
              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl glass w-fit">
                {[
                  { id: 'strategies', label: 'Strategy', icon: Code2 },
                  { id: 'results', label: 'Results', icon: BarChart2 },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} data-testid={`algo-tab-${t.id}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-[#6C63FF] text-white' : 'text-white/50 hover:text-white'}`}>
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>

              {tab === 'strategies' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Strategy info */}
                  <div className="glass p-5 rounded-2xl">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center flex-shrink-0">
                        <FlaskConical size={18} className="text-[#6C63FF]" />
                      </div>
                      <div>
                        <h3 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{selected.name}</h3>
                        <p className="text-sm mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{selected.description}</p>
                      </div>
                    </div>
                    {/* Pseudo-code */}
                    <div className={`rounded-xl p-4 font-mono text-xs leading-relaxed overflow-x-auto ${isDark ? 'bg-black/40 border border-white/5' : 'bg-black/5 border border-black/5'}`}
                      style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#334155' }}>
                      <pre>{selected.code}</pre>
                    </div>
                  </div>

                  {/* Backtest config */}
                  <div className="glass p-5 rounded-2xl">
                    <h3 className="font-bold mb-4" style={{ color: isDark ? '#fff' : '#0F172A' }}>Backtest Configuration</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Stock Symbol</label>
                        <select value={symbol} onChange={e => setSymbol(e.target.value)} data-testid="backtest-symbol"
                          className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/10 text-[#0F172A]'} focus:border-[#6C63FF]/50`}>
                          {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Backtest Period</label>
                        <select value={period} onChange={e => setPeriod(parseInt(e.target.value))} data-testid="backtest-period"
                          className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/10 text-[#0F172A]'} focus:border-[#6C63FF]/50`}>
                          {PERIODS.map(p => <option key={p.days} value={p.days}>{p.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 mb-4 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                      <Zap size={12} className="text-[#FFB800]" />
                      Starting capital: ₹1,00,000 · Historical simulation only · Not financial advice
                    </div>
                    <motion.button onClick={runBacktest} disabled={running} data-testid="run-backtest-btn"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
                      <Play size={16} />
                      {running ? 'Running Backtest...' : `Run Backtest on ${symbol}`}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {tab === 'results' && results && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard label="Total Return" value={`${results.total_return >= 0 ? '+' : ''}${results.total_return}%`}
                      color={results.total_return >= 0 ? '#00FF88' : '#FF4444'} testid="backtest-return"
                      sub={`Benchmark: ${results.benchmark_return}%`} />
                    <MetricCard label="Sharpe Ratio" value={results.sharpe_ratio.toFixed(2)}
                      color={results.sharpe_ratio > 1 ? '#00FF88' : results.sharpe_ratio > 0 ? '#FFB800' : '#FF4444'}
                      testid="backtest-sharpe" sub="> 1 is good" />
                    <MetricCard label="Max Drawdown" value={`${results.max_drawdown.toFixed(1)}%`}
                      color="#FF4444" testid="backtest-drawdown" sub="Peak-to-trough loss" />
                    <MetricCard label="Win Rate" value={`${results.win_rate.toFixed(0)}%`}
                      color={results.win_rate > 55 ? '#00FF88' : '#FFB800'}
                      testid="backtest-winrate" sub={`${results.num_trades} trades`} />
                  </div>

                  {/* vs Benchmark */}
                  <div className="glass p-4 rounded-2xl flex items-center gap-4">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-white/40 mb-1">Your Strategy</p>
                      <p className={`text-2xl font-black ${results.total_return >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {results.total_return >= 0 ? '+' : ''}{results.total_return}%
                      </p>
                    </div>
                    <div className="text-white/20 text-xl">vs</div>
                    <div className="flex-1 text-center">
                      <p className="text-xs text-white/40 mb-1">Nifty 50 (Benchmark)</p>
                      <p className="text-2xl font-black text-[#6C63FF]" style={{ fontFamily: 'Outfit, sans-serif' }}>+{results.benchmark_return}%</p>
                    </div>
                    <div className={`px-3 py-2 rounded-xl text-sm font-bold ${results.total_return > results.benchmark_return ? 'bg-[#00FF88]/15 text-[#00FF88]' : 'bg-[#FF4444]/15 text-[#FF4444]'}`}>
                      {results.total_return > results.benchmark_return ? 'Outperformed' : 'Underperformed'}
                    </div>
                  </div>

                  {/* Equity curve */}
                  {results.equity_curve?.length > 0 && (
                    <div className="glass p-5 rounded-2xl">
                      <h3 className="font-bold mb-3" style={{ color: isDark ? '#fff' : '#0F172A' }}>Equity Curve</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={results.equity_curve}>
                          <defs>
                            <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false}
                            tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={50} domain={['auto', 'auto']} />
                          <ReferenceLine y={100000} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                          <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
                            formatter={v => [`₹${v?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Portfolio Value']} />
                          <Area type="monotone" dataKey="value" stroke="#6C63FF" strokeWidth={2} fill="url(#eqGrad)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Trade log */}
                  {results.trades?.length > 0 && (
                    <div className="glass p-5 rounded-2xl">
                      <h3 className="font-bold mb-3" style={{ color: isDark ? '#fff' : '#0F172A' }}>Trade Log (first 20)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
                              {['Date', 'Type', 'Qty', 'Price'].map(h => <th key={h} className="text-left pb-2 pr-4">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {results.trades.map((t, i) => (
                              <tr key={i} className="border-t border-white/5">
                                <td className="py-1.5 pr-4 text-white/40">{t.date}</td>
                                <td className={`py-1.5 pr-4 font-bold ${t.type === 'BUY' ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>{t.type}</td>
                                <td className="py-1.5 pr-4 text-white/60">{t.qty}</td>
                                <td className="py-1.5 text-white/60">₹{t.price?.toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'results' && !results && (
                <div className="glass p-12 rounded-2xl text-center">
                  <BarChart2 size={40} className="mx-auto mb-4 text-white/20" />
                  <p className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>No results yet</p>
                  <p className="text-sm text-white/40 mt-1">Configure and run a backtest to see results here</p>
                  <button onClick={() => setTab('strategies')} className="mt-4 px-4 py-2 rounded-xl bg-[#6C63FF]/20 text-[#6C63FF] text-sm font-semibold">
                    Go to Config
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlgoLab;
