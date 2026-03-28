import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, BarChart, Bar
} from 'recharts';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { Search, TrendingUp, TrendingDown, ChevronDown, BarChart2, FileText, Activity } from 'lucide-react';
import InfoButton from '../components/InfoButton';

const TIMEFRAMES = ['1M', '3M', '1Y'];

const calcRSI = (data, period = 14) => {
  return data.map((d, i) => {
    if (i < period) return { ...d, rsi: null };
    const slice = data.slice(i - period, i);
    const gains = slice.filter((_, j) => j > 0 && slice[j].close > slice[j - 1].close)
      .reduce((sum, s, j) => sum + (s.close - slice[j].close), 0);
    const losses = slice.filter((_, j) => j > 0 && slice[j].close < slice[j - 1].close)
      .reduce((sum, s, j) => sum + (slice[j].close - s.close), 0);
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
    return { ...d, rsi: parseFloat(rsi.toFixed(1)) };
  });
};

const calcBB = (data, period = 20, mult = 2) => {
  return data.map((d, i) => {
    if (i < period - 1) return { ...d, bbMid: null, bbUp: null, bbLow: null };
    const slice = data.slice(i - period + 1, i + 1).map(s => s.close);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(slice.reduce((sum, v) => sum + (v - mean) ** 2, 0) / period);
    return { ...d, bbMid: parseFloat(mean.toFixed(2)), bbUp: parseFloat((mean + mult * std).toFixed(2)), bbLow: parseFloat((mean - mult * std).toFixed(2)) };
  });
};

const calcMACD = (data) => {
  const ema = (arr, p) => arr.reduce((res, v, i) => {
    if (i === 0) return [v];
    const k = 2 / (p + 1);
    return [...res, v * k + res[i - 1] * (1 - k)];
  }, []);
  const closes = data.map(d => d.close);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  return data.map((d, i) => ({
    ...d,
    macd: i >= 25 ? parseFloat((ema12[i] - ema26[i]).toFixed(2)) : null,
    signal: null,
  }));
};

const RatioCard = ({ label, value, benchmark, unit = '', isDark }) => {
  const numVal = parseFloat(value);
  const numBench = parseFloat(benchmark);
  const isGood = !isNaN(numVal) && !isNaN(numBench) ? numVal <= numBench : null;
  return (
    <div className="glass p-3 rounded-xl">
      <div className="text-xs mb-1 flex items-center gap-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{label}</div>
      <p className="text-base font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{value}{unit}</p>
      {benchmark && (
        <p className="text-[10px] mt-0.5" style={{ color: isGood ? '#00FF88' : '#FFB800' }}>
          Sector avg: {benchmark}{unit}
        </p>
      )}
    </div>
  );
};

const Analysis = () => {
  const { isDark } = useApp();
  const [stocks, setStocks] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [analysis, setAnalysis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState('3M');
  const [tab, setTab] = useState('technical');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    axios.get(`${API}/market/stocks`).then(r => setStocks(r.data)).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [chartRes, analysisRes] = await Promise.all([
        axios.get(`${API}/market/stocks/${selectedSymbol}/chart?period=${timeframe}`),
        axios.get(`${API}/analysis/stock/${selectedSymbol}`),
      ]);
      let d = chartRes.data.data.map(c => ({ ...c, time: c.time.slice(5) }));
      d = calcRSI(d);
      d = calcBB(d);
      d = calcMACD(d);
      setChartData(d);
      setAnalysis(analysisRes.data);
    } catch (e) {}
  }, [selectedSymbol, timeframe]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartColor = analysis?.change_pct >= 0 ? '#00FF88' : '#FF4444';
  const filtered = stocks.filter(s =>
    s.symbol.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>Analysis</h1>
          <p className="text-sm mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Technical & Fundamental insights for Indian stocks</p>
        </div>

        {/* Stock selector */}
        <div className="relative ml-auto">
          <button onClick={() => setShowSearch(v => !v)} data-testid="analysis-stock-selector"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass glass-hover">
            <span className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{selectedSymbol}</span>
            <ChevronDown size={14} className="text-white/40" />
          </button>
          {showSearch && (
            <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden ${isDark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-black/5'}`}>
              <div className="p-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                  <Search size={14} className="text-white/40" />
                  <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search stocks..." className="bg-transparent text-sm outline-none flex-1"
                    style={{ color: isDark ? '#fff' : '#0F172A' }} />
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto pb-2">
                {filtered.map(s => (
                  <button key={s.symbol} data-testid={`analysis-stock-${s.symbol}`}
                    onClick={() => { setSelectedSymbol(s.symbol); setShowSearch(false); setSearchQ(''); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-all ${selectedSymbol === s.symbol ? 'bg-[#6C63FF]/10' : ''}`}>
                    <div className="text-left">
                      <p className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{s.symbol}</p>
                      <p className="text-xs text-white/40">{s.name}</p>
                    </div>
                    <p className={`text-xs font-semibold ${s.change_pct >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                      {s.change_pct >= 0 ? '+' : ''}{s.change_pct}%
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeframes */}
        <div className="flex gap-1">
          {TIMEFRAMES.map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} data-testid={`tf-${tf}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${timeframe === tf ? 'bg-[#6C63FF] text-white' : 'glass text-white/50 hover:text-white'}`}>
              {tf}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Hero price bar */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass p-5 rounded-2xl mb-6 flex flex-wrap gap-6 items-center">
          <div>
            <p className="text-4xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }} data-testid="analysis-price">
              ₹{analysis.current_price?.toLocaleString('en-IN')}
            </p>
            <p className="text-sm mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{analysis.name} · {analysis.sector}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${analysis.change_pct >= 0 ? 'bg-[#00FF88]/15' : 'bg-[#FF4444]/15'}`}>
            {analysis.change_pct >= 0 ? <TrendingUp size={16} className="text-[#00FF88]" /> : <TrendingDown size={16} className="text-[#FF4444]" />}
            <span className={`font-bold ${analysis.change_pct >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
              {analysis.change_pct >= 0 ? '+' : ''}{analysis.change_pct}%
            </span>
          </div>
          <div className="flex gap-6 text-sm ml-auto flex-wrap">
            {[
              { label: '52W High', value: `₹${analysis.high_52w?.toLocaleString('en-IN')}` },
              { label: '52W Low', value: `₹${analysis.low_52w?.toLocaleString('en-IN')}` },
              { label: 'Market Cap', value: `₹${(analysis.market_cap_cr || 0).toLocaleString('en-IN')} Cr` },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{s.label}</p>
                <p className="font-semibold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl glass w-fit">
        {[
          { id: 'technical', icon: Activity, label: 'Technical' },
          { id: 'fundamental', icon: FileText, label: 'Fundamental' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`tab-${t.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-[#6C63FF] text-white' : 'text-white/50 hover:text-white'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'technical' && (
        <div className="space-y-4">
          {/* Price + BB chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-1.5" style={{ color: isDark ? '#fff' : '#0F172A' }}>Price + Bollinger Bands <InfoButton term="Bollinger Bands" /></h3>
              <div className="flex gap-3 text-xs">
                {[{ color: '#6C63FF', label: 'BB Mid' }, { color: '#00FF88', label: 'BB Upper' }, { color: '#FF4444', label: 'BB Lower' }].map(i => (
                  <div key={i.label} className="flex items-center gap-1"><div className="w-2 h-0.5" style={{ background: i.color }} /><span className="text-white/40">{i.label}</span></div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`} width={52} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
                  formatter={(v, name) => [`₹${v?.toLocaleString('en-IN')}`, name === 'close' ? 'Price' : name === 'bbUp' ? 'BB Upper' : name === 'bbLow' ? 'BB Lower' : 'BB Mid']} />
                <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={1.5} fill="url(#aGrad)" dot={false} />
                <Line type="monotone" dataKey="bbUp" stroke="#00FF88" strokeWidth={1} dot={false} strokeDasharray="4 2" connectNulls />
                <Line type="monotone" dataKey="bbLow" stroke="#FF4444" strokeWidth={1} dot={false} strokeDasharray="4 2" connectNulls />
                <Line type="monotone" dataKey="bbMid" stroke="#6C63FF" strokeWidth={1} dot={false} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* RSI */}
            <div className="glass p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ color: isDark ? '#fff' : '#0F172A' }}>RSI (14) <InfoButton term="RSI" /></h3>
                {chartData.length > 0 && (
                  <span className={`text-sm font-bold px-2 py-1 rounded-lg ${
                    (chartData[chartData.length - 1]?.rsi || 50) < 30 ? 'bg-[#00FF88]/15 text-[#00FF88]' :
                    (chartData[chartData.length - 1]?.rsi || 50) > 70 ? 'bg-[#FF4444]/15 text-[#FF4444]' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {chartData[chartData.length - 1]?.rsi?.toFixed(1) || '--'}
                    {' '}{(chartData[chartData.length - 1]?.rsi || 50) < 30 ? '· Oversold' : (chartData[chartData.length - 1]?.rsi || 50) > 70 ? '· Overbought' : '· Neutral'}
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={chartData.filter(d => d.rsi !== null)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} width={25} />
                  <ReferenceLine y={70} stroke="#FF4444" strokeDasharray="3 3" strokeWidth={1} />
                  <ReferenceLine y={30} stroke="#00FF88" strokeDasharray="3 3" strokeWidth={1} />
                  <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
                    formatter={v => [v?.toFixed(1), 'RSI']} />
                  <Area type="monotone" dataKey="rsi" stroke="#6C63FF" strokeWidth={1.5} fill="rgba(108,99,255,0.1)" dot={false} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[10px] mt-1 px-1">
                <span className="text-[#00FF88]">30 — Oversold</span>
                <span className="text-[#FF4444]">70 — Overbought</span>
              </div>
            </div>

            {/* MACD */}
            <div className="glass p-5 rounded-2xl">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5" style={{ color: isDark ? '#fff' : '#0F172A' }}>MACD <InfoButton term="MACD" /></h3>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={chartData.filter(d => d.macd !== null)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="time" hide />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} tickLine={false} axisLine={false} width={35} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip contentStyle={{ background: 'rgba(17,17,17,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }}
                    formatter={v => [v?.toFixed(2), 'MACD']} />
                  <Bar dataKey="macd" fill="#6C63FF" radius={[1, 1, 0, 0]}
                    label={false}
                    shape={(props) => {
                      const { x, y, width, height, value } = props;
                      return <rect x={x} y={value >= 0 ? y : y + height} width={width} height={Math.abs(height)} fill={value >= 0 ? '#00FF88' : '#FF4444'} rx={1} />;
                    }} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-white/30 mt-1">Green = bullish momentum · Red = bearish momentum</p>
            </div>
          </div>

          {/* News */}
          {analysis?.news && (
            <div className="glass p-5 rounded-2xl">
              <h3 className="font-bold mb-3" style={{ color: isDark ? '#fff' : '#0F172A' }}>Latest News</h3>
              <div className="space-y-3">
                {analysis.news.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-all">
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${n.sentiment === 'positive' ? 'bg-[#00FF88]' : n.sentiment === 'negative' ? 'bg-[#FF4444]' : 'bg-[#FFB800]'}`} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: isDark ? '#fff' : '#0F172A' }}>{n.headline}</p>
                      <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{n.source} · {n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'fundamental' && analysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Key ratios */}
          <div className="glass p-5 rounded-2xl">
            <h3 className="font-bold mb-4 flex items-center gap-1.5" style={{ color: isDark ? '#fff' : '#0F172A' }}>Key Ratios</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <RatioCard label={<span className="flex items-center gap-1">P/E Ratio <InfoButton term="P/E Ratio" /></span>} value={analysis.pe_ratio} benchmark="22.5" isDark={isDark} />
              <RatioCard label={<span className="flex items-center gap-1">P/B Ratio <InfoButton term="P/B Ratio" /></span>} value={analysis.pb_ratio} benchmark="3.5" isDark={isDark} />
              <RatioCard label={<span className="flex items-center gap-1">EPS <InfoButton term="EPS" /></span>} value={`₹${analysis.eps}`} isDark={isDark} />
              <RatioCard label={<span className="flex items-center gap-1">Book Value <InfoButton term="Book Value" /></span>} value={`₹${analysis.book_value}`} isDark={isDark} />
              <RatioCard label={<span className="flex items-center gap-1">ROE <InfoButton term="ROE" /></span>} value={analysis.roe} benchmark="15" unit="%" isDark={isDark} />
              <RatioCard label={<span className="flex items-center gap-1">Debt/Equity <InfoButton term="Debt/Equity" /></span>} value={analysis.debt_equity} benchmark="1.0" isDark={isDark} />
              <RatioCard label={<span className="flex items-center gap-1">Dividend Yield <InfoButton term="Dividend Yield" /></span>} value={analysis.dividend_yield} unit="%" isDark={isDark} />
              <RatioCard label={<span className="flex items-center gap-1">Market Cap <InfoButton term="Market Cap" /></span>} value={`₹${(analysis.market_cap_cr || 0).toLocaleString('en-IN')} Cr`} isDark={isDark} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Income Statement */}
            <div className="glass p-5 rounded-2xl">
              <h3 className="font-bold mb-3" style={{ color: isDark ? '#fff' : '#0F172A' }}>Income Statement (FY25)</h3>
              {analysis.income_statement && Object.entries({
                'Revenue': analysis.income_statement.revenue,
                'Gross Profit': analysis.income_statement.gross_profit,
                'EBITDA': analysis.income_statement.ebitda,
                'Net Profit': analysis.income_statement.net_profit,
              }).map(([key, val]) => (
                <div key={key} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                  <span className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{key}</span>
                  <span className="text-sm font-semibold" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                    ₹{(val / 1e7).toFixed(0)} Cr
                  </span>
                </div>
              ))}
            </div>

            {/* Analyst Consensus */}
            <div className="glass p-5 rounded-2xl">
              <h3 className="font-bold mb-4" style={{ color: isDark ? '#fff' : '#0F172A' }}>Analyst Consensus</h3>
              {analysis.analyst_consensus && (
                <>
                  <div className="flex gap-3 mb-4">
                    {[
                      { label: 'Buy', val: analysis.analyst_consensus.buy, color: '#00FF88' },
                      { label: 'Hold', val: analysis.analyst_consensus.hold, color: '#FFB800' },
                      { label: 'Sell', val: analysis.analyst_consensus.sell, color: '#FF4444' },
                    ].map(c => (
                      <div key={c.label} className="flex-1 text-center glass p-3 rounded-xl">
                        <p className="text-2xl font-black" style={{ color: c.color, fontFamily: 'Outfit, sans-serif' }}>{c.val}</p>
                        <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{c.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="glass p-3 rounded-xl flex justify-between items-center">
                    <span className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Target Price</span>
                    <span className="text-lg font-bold text-[#6C63FF]">₹{analysis.analyst_consensus.target_price?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-2 px-1">
                    <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>Current: ₹{analysis.current_price?.toLocaleString('en-IN')}</span>
                    <span className="text-[#00FF88] font-semibold">
                      {analysis.analyst_consensus.target_price > analysis.current_price ? '+' : ''}
                      {(((analysis.analyst_consensus.target_price - analysis.current_price) / analysis.current_price) * 100).toFixed(1)}% upside
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analysis;
