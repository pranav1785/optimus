import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { Trophy, Calendar, Users, Plus, X, Zap, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

const statusColor = { active: '#00FF88', upcoming: '#FFB800', ended: '#FF4444' };
const statusLabel = { active: 'Live', upcoming: 'Upcoming', ended: 'Ended' };

const CompCard = ({ comp, onJoin, isDark }) => {
  const startDate = new Date(comp.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const endDate = new Date(comp.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const color = statusColor[comp.status] || '#6C63FF';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass p-5 rounded-2xl" data-testid={`comp-card-${comp.comp_id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
            <span className="text-xs font-bold" style={{ color }}>{statusLabel[comp.status]}</span>
          </div>
          <h3 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{comp.name}</h3>
          <p className="text-sm mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{comp.description}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-white/40">Prize</p>
          <p className="text-sm font-bold text-[#FFB800]">{comp.prize}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
          <Calendar size={12} /> {startDate} – {endDate}
        </div>
        <div className="flex items-center gap-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
          <Users size={12} /> {comp.participant_count} participants
        </div>
        <div className="flex items-center gap-1 text-[#FFB800]">
          <Zap size={12} /> ₹{(comp.initial_balance || 100000).toLocaleString('en-IN')} virtual
        </div>
      </div>

      {/* Leaderboard preview */}
      {comp.participants?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-white/40 mb-2">Top participants</p>
          <div className="space-y-1.5">
            {comp.participants.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-4 font-black text-center ${i === 0 ? 'text-[#FFB800]' : 'text-white/40'}`}>{i + 1}</span>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>{p.username}</span>
                </div>
                <span className={`font-bold ${p.return_pct >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                  {p.return_pct >= 0 ? '+' : ''}{p.return_pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => !comp.is_joined && comp.status !== 'ended' && onJoin(comp.comp_id)}
        data-testid={`join-comp-${comp.comp_id}`}
        disabled={comp.is_joined || comp.status === 'ended'}
        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
          comp.is_joined
            ? 'bg-[#00FF88]/10 text-[#00FF88] cursor-default'
            : comp.status === 'ended'
            ? 'bg-white/5 text-white/30 cursor-not-allowed'
            : 'text-white hover:opacity-90'
        }`}
        style={!comp.is_joined && comp.status !== 'ended' ? { background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' } : {}}>
        {comp.is_joined ? <span className="flex items-center justify-center gap-2"><CheckCircle2 size={14} /> Joined</span>
         : comp.status === 'upcoming' ? <span className="flex items-center justify-center gap-2"><Clock size={14} /> Register Early</span>
         : comp.status === 'ended' ? 'Competition Ended'
         : 'Join Competition'}
      </button>
    </motion.div>
  );
};

const Arena = () => {
  const { isDark, user } = useApp();
  const [competitions, setCompetitions] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const [creating, setCreating] = useState(false);
  const [joinMsg, setJoinMsg] = useState(null);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const { data } = await axios.get(`${API}/competitions`);
      setCompetitions(data);
    } catch (e) {}
  };

  const handleJoin = async (compId) => {
    try {
      const { data } = await axios.post(`${API}/competitions/${compId}/join`);
      setJoinMsg(data.message);
      fetchCompetitions();
      setTimeout(() => setJoinMsg(null), 3000);
    } catch (e) {}
  };

  const handleCreate = async () => {
    if (!form.name || !form.start_date || !form.end_date) return;
    setCreating(true);
    try {
      const { data } = await axios.post(`${API}/competitions`, {
        ...form, max_participants: 50, asset_classes: ['stocks']
      });
      setCompetitions(prev => [...prev, { ...data, participant_count: 0, is_joined: false }]);
      setShowCreate(false);
      setForm({ name: '', description: '', start_date: '', end_date: '' });
    } catch (e) {}
    setCreating(false);
  };

  const filtered = filter === 'all' ? competitions : competitions.filter(c => c.status === filter);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
            Arena
          </h1>
          <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
            Compete with traders across India in paper trading tournaments
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} data-testid="create-competition-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
          <Plus size={16} /> Create Competition
        </button>
      </motion.div>

      {/* Join message toast */}
      <AnimatePresence>
        {joinMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-[#00FF88]/20 border border-[#00FF88]/30 text-[#00FF88] font-semibold text-sm"
            style={{ backdropFilter: 'blur(12px)' }}>
            {joinMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Competitions', value: competitions.filter(c => c.status === 'active').length, color: '#00FF88' },
          { label: 'Upcoming', value: competitions.filter(c => c.status === 'upcoming').length, color: '#FFB800' },
          { label: 'You Are Joined', value: competitions.filter(c => c.is_joined).length, color: '#6C63FF' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass p-4 rounded-2xl text-center">
            <p className="text-2xl font-black" style={{ color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {[{ id: 'all', label: 'All' }, { id: 'active', label: 'Live' }, { id: 'upcoming', label: 'Upcoming' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} data-testid={`arena-filter-${f.id}`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f.id ? 'bg-[#6C63FF] text-white' : 'glass text-white/50 hover:text-white'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Competition grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map(comp => (
          <CompCard key={comp.comp_id} comp={comp} onJoin={handleJoin} isDark={isDark} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 glass p-12 rounded-2xl text-center">
            <Trophy size={40} className="mx-auto mb-4 text-white/20" />
            <p className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>No competitions here</p>
            <p className="text-sm text-white/40 mt-1">Create one and invite your friends!</p>
          </div>
        )}
      </div>

      {/* Create Competition Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="relative glass p-6 rounded-2xl w-full max-w-md"
              style={{ background: isDark ? 'rgba(17,17,17,0.97)' : 'rgba(255,255,255,0.97)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg" style={{ color: isDark ? '#fff' : '#0F172A' }}>Create Competition</h3>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                  <X size={16} style={{ color: isDark ? '#fff' : '#0F172A' }} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Competition Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Nifty 50 Challenge" data-testid="comp-name-input"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/3 border-black/10 text-[#0F172A] placeholder-[#94a3b8]'} focus:border-[#6C63FF]/50`} />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Rules and details..." rows={2} data-testid="comp-desc-input"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/3 border-black/10 text-[#0F172A] placeholder-[#94a3b8]'} focus:border-[#6C63FF]/50`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Start Date *</label>
                    <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                      data-testid="comp-start-input"
                      className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/3 border-black/10 text-[#0F172A]'} focus:border-[#6C63FF]/50`} />
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>End Date *</label>
                    <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                      data-testid="comp-end-input"
                      className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-black/3 border-black/10 text-[#0F172A]'} focus:border-[#6C63FF]/50`} />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>
                  <Zap size={12} className="text-[#FFB800]" /> Starting balance: ₹1,00,000 virtual · Prize: Certificate + 500 XP
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl glass text-sm font-medium" style={{ color: isDark ? '#fff' : '#0F172A' }}>Cancel</button>
                <motion.button onClick={handleCreate} disabled={!form.name || !form.start_date || !form.end_date || creating}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  data-testid="submit-create-comp"
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
                  {creating ? 'Creating...' : 'Create'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Arena;
