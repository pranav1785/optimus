import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { TOWNS } from '../data/mockData';
import { Lock, CheckCircle2, Circle, Star, ChevronRight, Zap, Award, Map, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const MILESTONES = [
  { after: 3, label: 'Foundations Complete', sublabel: 'You understand money, markets & basic trading', color: '#00FF88', icon: 'Sprout' },
  { after: 6, label: 'Intermediate Investor', sublabel: 'Charts, indicators, mutual funds & more', color: '#00D4FF', icon: 'TrendingUp' },
  { after: 9, label: 'Advanced Trader', sublabel: 'Derivatives, options & portfolio construction', color: '#6C63FF', icon: 'BarChart2' },
  { after: 12, label: 'Optimus Master', sublabel: 'Algo trading, advanced strategies & full expertise', color: '#FFB800', icon: 'Crown' },
];

const MilestoneBanner = ({ milestone, reached, isDark }) => {
  const MIcon = LucideIcons[milestone.icon] || LucideIcons.Star;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`col-span-2 md:col-span-3 lg:col-span-4 flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        reached
          ? 'border-opacity-40 bg-opacity-10'
          : 'border-white/5 bg-white/2'
      }`}
      style={reached ? { borderColor: `${milestone.color}40`, background: `${milestone.color}08` } : {}}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${reached ? '' : 'opacity-30'}`}
        style={{ background: `${milestone.color}20`, border: `1px solid ${milestone.color}30` }}>
        {reached ? <CheckCircle2 size={18} style={{ color: milestone.color }} /> : <Lock size={16} className="text-white/30" />}
      </div>
      <div className="flex-1">
        <p className={`font-bold text-sm transition-all ${reached ? '' : 'text-white/30'}`}
          style={reached ? { color: milestone.color } : {}}>
          {milestone.label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>{milestone.sublabel}</p>
      </div>
      {reached && (
        <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${milestone.color}15`, color: milestone.color }}>
          <CheckCircle2 size={10} /> Reached
        </div>
      )}
    </motion.div>
  );
};

const TOWN_ICON_MAP = {
  'Coins': 'Coins', 'TrendingUp': 'TrendingUp', 'BarChart2': 'BarChart2',
  'FileText': 'FileText', 'Activity': 'Activity', 'PieChart': 'PieChart',
  'Zap': 'Zap', 'GitBranch': 'GitBranch', 'Gem': 'Gem', 'Cpu': 'Cpu',
  'Layout': 'LayoutGrid', 'Code': 'Code2'
};

const ProgressRing = ({ progress, size = 48, color = '#6C63FF', completed = false }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90 absolute top-0 left-0">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={completed ? '#00FF88' : color}
        strokeWidth={4} strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" className="progress-ring-animate" />
    </svg>
  );
};

const TownCard = ({ town, progress, idx }) => {
  const { isDark } = useApp();
  const status = progress?.status || 'locked';
  const locked = status === 'locked';
  const completed = status === 'completed';
  const inProgress = status === 'in_progress';
  const completedLessons = progress?.completed_lessons?.length || 0;
  const totalLessons = town.lessons?.length || 3;
  const lessonProgress = (completedLessons / totalLessons) * 100;
  const displayProgress = completed ? 100 : lessonProgress;

  const iconName = TOWN_ICON_MAP[town.icon] || 'Star';
  const TownIcon = LucideIcons[iconName] || LucideIcons.Star;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.04 }}
      whileHover={!locked ? { y: -4 } : {}}
      className={`relative ${locked ? 'town-locked' : ''}`}
    >
      <Link
        to={locked ? '#' : `/roadmap/${town.id}`}
        data-testid={`town-card-${town.id}`}
        onClick={e => locked && e.preventDefault()}
        className={`block glass p-5 rounded-2xl transition-all relative overflow-hidden ${
          !locked ? 'glass-hover cursor-pointer' : 'cursor-not-allowed'
        } ${completed ? 'border-[#00FF88]/30' : inProgress ? 'border-[#6C63FF]/30' : ''}`}
        style={completed ? { borderColor: 'rgba(0,255,136,0.2)' } : inProgress ? { borderColor: 'rgba(108,99,255,0.2)' } : {}}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${town.bgGrad} opacity-30 rounded-2xl`} />

        {/* Town number */}
        <div className="absolute top-3 right-3 text-xs font-bold opacity-30"
          style={{ color: isDark ? '#fff' : '#0F172A' }}>
          {String(town.id).padStart(2, '0')}
        </div>

        {/* Icon with progress ring */}
        <div className="relative w-12 h-12 mx-auto mb-3 flex items-center justify-center">
          <ProgressRing progress={displayProgress} size={48} color={town.color} completed={completed} />
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: `${town.color}20`, border: `1px solid ${town.color}30` }}>
            {locked ? <Lock size={16} className="text-white/40" /> :
             completed ? <CheckCircle2 size={16} style={{ color: '#00FF88' }} /> :
             <TownIcon size={16} style={{ color: town.color }} />}
          </div>
        </div>

        {/* Town info */}
        <div className="relative text-center">
          <h3 className="font-bold text-sm mb-1 leading-tight" style={{ color: isDark ? '#fff' : '#0F172A' }}>
            {town.name}
          </h3>
          <p className="text-[10px] leading-tight mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>
            {town.description}
          </p>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
            completed ? 'bg-[#00FF88]/15 text-[#00FF88]' :
            inProgress ? 'bg-[#6C63FF]/15 text-[#6C63FF]' :
            locked ? 'bg-white/5 text-white/30' :
            'bg-[#FFB800]/15 text-[#FFB800]'
          }`}>
            {completed ? <><CheckCircle2 size={8} /> Completed</> :
             inProgress ? <><Circle size={8} className="animate-pulse" /> In Progress</> :
             locked ? <><Lock size={8} /> Locked</> :
             <><Star size={8} /> Unlocked</>}
          </div>

          {/* XP reward */}
          <div className="flex items-center justify-center gap-1 mt-2">
            <Zap size={10} className="text-[#FFB800]" />
            <span className="text-[10px] text-[#FFB800] font-semibold">{town.xpReward} XP</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const Roadmap = () => {
  const { isDark, user } = useApp();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await axios.get(`${API}/roadmap/progress`);
        setProgress(data);
      } catch (e) {}
      setLoading(false);
    };
    fetchProgress();
  }, []);

  const completedCount = progress.filter(p => p.status === 'completed').length;
  const inProgressTown = TOWNS.find(t => progress.find(p => p.town_id === t.id && p.status === 'in_progress'));
  const nextUnlocked = !inProgressTown && TOWNS.find(t => progress.find(p => p.town_id === t.id && p.status === 'unlocked'));
  const featuredTown = inProgressTown || nextUnlocked;
  const featuredProg = featuredTown ? progress.find(p => p.town_id === featuredTown.id) : null;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center">
            <Map size={16} className="text-white" />
          </div>
          <h1 className="text-3xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
            Learning Roadmap
          </h1>
        </div>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
          12 towns · From money basics to advanced algo trading · Earn XP and badges as you progress
        </p>
      </motion.div>

      {/* Progress overview */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass p-5 rounded-2xl mb-6">
        <div className="flex flex-wrap gap-6 items-center mb-4">
          <div className="flex-1 min-w-52">
            <p className="text-sm font-medium mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
              Overall Journey — {completedCount}/12 Towns
            </p>
            <div className="xp-bar h-3 rounded-full">
              <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                animate={{ width: `${(completedCount / 12) * 100}%` }} transition={{ duration: 1.2, delay: 0.5 }}
                style={{ background: 'linear-gradient(90deg, #6C63FF, #00D4FF, #00FF88)' }} />
            </div>
            <p className="text-xs mt-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
              {Math.round((completedCount / 12) * 100)}% complete
            </p>
          </div>
          <div className="flex gap-6">
            {[
              { value: completedCount, label: 'Completed', color: '#00FF88' },
              { value: user.xp || 0, label: 'Total XP', color: '#FFB800' },
              { value: user.level || 1, label: 'Level', color: '#6C63FF' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black" style={{ color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
                <p className="text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Featured Next Town CTA */}
      {featuredTown && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass p-5 rounded-2xl mb-6 flex items-center gap-4 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${featuredTown.color}12, rgba(0,212,255,0.05))`, borderColor: `${featuredTown.color}25` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF]/5 to-transparent" />
          <div className="relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${featuredTown.color}20`, border: `1px solid ${featuredTown.color}30` }}>
            <Zap size={20} style={{ color: featuredTown.color }} />
          </div>
          <div className="relative flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: featuredTown.color }}>
              {inProgressTown ? 'Continue Where You Left Off' : 'Up Next'}
            </p>
            <p className="font-bold text-base" style={{ color: isDark ? '#fff' : '#0F172A' }}>
              Town {featuredTown.id}: {featuredTown.name}
            </p>
            <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{featuredTown.description}</p>
            {featuredProg && (
              <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
                {featuredProg.completed_lessons?.length || 0}/{featuredTown.lessons?.length || 3} lessons · {featuredTown.xpReward} XP reward
              </p>
            )}
          </div>
          <Link to={`/roadmap/${featuredTown.id}`} data-testid="featured-town-cta"
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${featuredTown.color}, #00D4FF)` }}>
            {inProgressTown ? 'Resume' : 'Start'} <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* Towns Grid with Milestones */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {TOWNS.map((town, idx) => {
            const prog = progress.find(p => p.town_id === town.id);
            const milestone = MILESTONES.find(m => m.after === idx + 1);
            const milestoneReached = milestone ? completedCount >= milestone.after : false;
            return (
              <React.Fragment key={town.id}>
                <TownCard town={town} progress={prog} idx={idx} />
                {milestone && (
                  <MilestoneBanner milestone={milestone} reached={milestoneReached} isDark={isDark} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-4 mt-8 justify-center text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
        {[
          { color: '#00FF88', label: 'Completed' },
          { color: '#6C63FF', label: 'In Progress' },
          { color: '#FFB800', label: 'Unlocked' },
          { color: 'rgba(255,255,255,0.2)', label: 'Locked' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Roadmap;
