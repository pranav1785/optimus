import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { TOWNS } from '../data/mockData';
import { Award, Zap, TrendingUp, Map, Trophy, Clock, Star, CheckCircle2, Lock } from 'lucide-react';

const BADGE_ICONS = {
  first_login: { icon: Star, color: '#FFB800', label: 'First Login' },
  town_1_master: { icon: Award, color: '#6C63FF', label: 'Money Mind' },
  town_2_master: { icon: TrendingUp, color: '#00D4FF', label: 'Market Explorer' },
  town_3_master: { icon: Trophy, color: '#00FF88', label: 'First Trader' },
  town_4_master: { icon: Award, color: '#FFB800', label: 'Value Analyst' },
  town_5_master: { icon: Star, color: '#9B59B6', label: 'Chart Wizard' },
};

const LEVEL_TITLES = ['', 'Novice', 'Apprentice', 'Analyst', 'Trader', 'Strategist', 'Expert', 'Pro', 'Master', 'Legend', 'Grand Master'];

const StatCard = ({ label, value, icon: Icon, color, isDark }) => (
  <div className="glass p-5 rounded-2xl">
    <div className="flex items-start justify-between mb-2">
      <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>{label}</p>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon size={15} style={{ color }} />
      </div>
    </div>
    <p className="text-2xl font-black" style={{ color, fontFamily: 'Outfit, sans-serif' }}>{value}</p>
  </div>
);

const Profile = () => {
  const { isDark, user } = useApp();
  const [progress, setProgress] = useState([]);
  const [trades, setTrades] = useState([]);
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, tradesRes, portRes] = await Promise.all([
          axios.get(`${API}/roadmap/progress`),
          axios.get(`${API}/portfolio/trades`),
          axios.get(`${API}/portfolio`),
        ]);
        setProgress(progressRes.data);
        setTrades(tradesRes.data.slice(0, 10));
        setPortfolio(portRes.data);
      } catch (e) {}
    };
    fetchData();
  }, []);

  const completedTowns = progress.filter(p => p.status === 'completed').length;
  const xpToNext = 500 - (user.xp % 500);
  const xpProgress = ((user.xp % 500) / 500) * 100;
  const levelTitle = LEVEL_TITLES[Math.min(user.level, LEVEL_TITLES.length - 1)] || 'Investor';
  const badges = user.badges || [];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
          Profile
        </h1>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>Your learning journey and achievements</p>
      </motion.div>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass p-6 rounded-2xl mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,255,0.08))' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/5 to-transparent" />
        <div className="relative flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-3xl font-black text-white"
              style={{ fontFamily: 'Outfit, sans-serif', boxShadow: '0 0 30px rgba(108,99,255,0.4)' }}>
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#FFB800] to-[#FF8800] flex items-center justify-center font-black text-white text-sm"
              style={{ boxShadow: '0 0 12px rgba(255,184,0,0.4)' }} data-testid="profile-level-badge">
              {user.level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }} data-testid="profile-name">
              {user.name}
            </h2>
            <p className="text-sm mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{user.college}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#6C63FF]/20 text-[#6C63FF] font-semibold">Level {user.level}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50 font-semibold">{levelTitle}</span>
            </div>
            {/* XP Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
                <span>{user.xp} XP total</span>
                <span>{xpToNext} XP to Level {user.level + 1}</span>
              </div>
              <div className="xp-bar">
                <motion.div className="xp-bar-fill" initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total XP" value={user.xp?.toLocaleString() || '0'} icon={Zap} color="#FFB800" isDark={isDark} />
        <StatCard label="Level" value={user.level || 1} icon={Star} color="#6C63FF" isDark={isDark} />
        <StatCard label="Towns Completed" value={`${completedTowns}/12`} icon={Map} color="#00D4FF" isDark={isDark} />
        <StatCard label="Trades Placed" value={trades.length || 0} icon={TrendingUp} color="#00FF88" isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Badges */}
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-[#FFB800]" />
            <h3 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Badges</h3>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#FFB800]/15 text-[#FFB800] ml-auto">{badges.length} earned</span>
          </div>
          {badges.length === 0 ? (
            <div className="text-center py-6">
              <Trophy size={28} className="mx-auto mb-2 text-white/20" />
              <p className="text-sm text-white/40">Complete lessons to earn badges</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge, i) => {
                const badgeInfo = BADGE_ICONS[badge] || { icon: Award, color: '#6C63FF', label: badge.replace(/_/g, ' ') };
                const BadgeIcon = badgeInfo.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    className="glass p-3 rounded-xl text-center glass-hover" data-testid={`badge-${badge}`}>
                    <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                      style={{ background: `${badgeInfo.color}20`, border: `1px solid ${badgeInfo.color}30` }}>
                      <BadgeIcon size={18} style={{ color: badgeInfo.color }} />
                    </div>
                    <p className="text-[10px] font-semibold leading-tight" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>
                      {badgeInfo.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Town Progress */}
        <div className="glass p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Map size={16} className="text-[#00D4FF]" />
            <h3 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Learning Progress</h3>
            <Link to="/roadmap" className="text-xs text-[#6C63FF] hover:underline ml-auto">View Roadmap</Link>
          </div>
          <div className="space-y-2">
            {TOWNS.slice(0, 6).map(town => {
              const townProgress = progress.find(p => p.town_id === town.id);
              const status = townProgress?.status || 'locked';
              return (
                <div key={town.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    status === 'completed' ? 'bg-[#00FF88]/20' :
                    status === 'in_progress' ? 'bg-[#6C63FF]/20' :
                    status === 'unlocked' ? 'bg-[#FFB800]/20' : 'bg-white/5'
                  }`}>
                    {status === 'completed' ? <CheckCircle2 size={12} className="text-[#00FF88]" /> :
                     status === 'locked' ? <Lock size={10} className="text-white/20" /> :
                     <div className="w-2 h-2 rounded-full" style={{ background: town.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#334155' }}>
                      {town.name}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    status === 'completed' ? 'text-[#00FF88]' :
                    status === 'in_progress' ? 'text-[#6C63FF]' :
                    status === 'unlocked' ? 'text-[#FFB800]' : 'text-white/20'
                  }`}>
                    {status === 'completed' ? '✓ Done' :
                     status === 'in_progress' ? 'In Progress' :
                     status === 'unlocked' ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>
          {progress.filter(p => p.status === 'completed').length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${(completedTowns / 12) * 100}%` }} />
              </div>
              <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
                {completedTowns}/12 towns · {Math.round((completedTowns / 12) * 100)}% complete
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent trades */}
      <div className="glass p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-[#6C63FF]" />
          <h3 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Recent Trades</h3>
          <Link to="/portfolio" className="text-xs text-[#6C63FF] hover:underline ml-auto">View all</Link>
        </div>
        {trades.length === 0 ? (
          <div className="text-center py-6">
            <TrendingUp size={28} className="mx-auto mb-2 text-white/20" />
            <p className="text-sm text-white/40">No trades yet</p>
            <Link to="/trade" className="text-xs text-[#6C63FF] hover:underline mt-1 block">Start paper trading →</Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {trades.map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0" data-testid={`profile-trade-${i}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${t.side === 'BUY' ? 'bg-[#00FF88]/15 text-[#00FF88]' : 'bg-[#FF4444]/15 text-[#FF4444]'}`}>
                  {t.side === 'BUY' ? 'B' : 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{t.symbol}</p>
                  <p className="text-xs text-white/40">{t.quantity} qty @ ₹{t.price?.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: isDark ? '#fff' : '#0F172A' }}>₹{t.total_value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-white/30">{new Date(t.timestamp).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
