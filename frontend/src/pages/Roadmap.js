import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { TOWNS } from '../data/mockData';
import {
  Lock, CheckCircle2, Star, Zap, Award, ChevronRight, X, Rocket,
  Swords, Map, Trophy, TrendingUp, Users
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// ─── Town positions on the island (x%, y% within the map container) ───
const TOWN_POSITIONS = [
  { id: 1,  x: 50, y: 84, zone: 'beach'    },
  { id: 2,  x: 27, y: 73, zone: 'beach'    },
  { id: 3,  x: 72, y: 71, zone: 'beach'    },
  { id: 4,  x: 16, y: 59, zone: 'forest'   },
  { id: 5,  x: 50, y: 60, zone: 'forest'   },
  { id: 6,  x: 82, y: 56, zone: 'forest'   },
  { id: 7,  x: 63, y: 44, zone: 'forest'   },
  { id: 8,  x: 32, y: 42, zone: 'mountain' },
  { id: 9,  x: 50, y: 31, zone: 'mountain' },
  { id: 10, x: 22, y: 20, zone: 'mountain' },
  { id: 11, x: 76, y: 18, zone: 'mountain' },
  { id: 12, x: 50, y: 8,  zone: 'peak'     },
];

// Path connections: [from_id, to_id]
const PATHS = [
  [1,2],[1,3],[2,4],[3,6],[4,5],[5,6],[4,8],[5,7],[6,7],[7,9],[8,9],[9,10],[9,11],[10,12],[11,12]
];

// Side quests that unlock after completing certain towns
const SIDE_QUESTS = [
  { id: 'first_trade',   title: 'First Paper Trade',       desc: 'Execute a BUY order in the trading terminal',    link: '/trade',     icon: 'TrendingUp', color: '#00FF88', unlockAfter: 1 },
  { id: 'analyze_stock', title: 'Analyze a Real Stock',    desc: 'Use RSI + MACD on any NSE stock',                link: '/analysis',  icon: 'Activity',   color: '#00D4FF', unlockAfter: 4 },
  { id: 'community_post',title: 'Post in Community',       desc: 'Share an insight with 2,800+ traders',           link: '/community', icon: 'Users',      color: '#6C63FF', unlockAfter: 2 },
  { id: 'first_backtest',title: 'Run a Strategy Backtest', desc: 'Backtest a pre-built algo on historical data',    link: '/algo-lab',  icon: 'FlaskConical', color: '#FFB800', unlockAfter: 6 },
  { id: 'join_comp',     title: 'Join a Competition',      desc: 'Compete in a paper trading tournament',           link: '/arena',     icon: 'Trophy',     color: '#FF4444', unlockAfter: 8 },
];

const ZONE_COLORS = {
  beach:    { bg: 'rgba(212,184,125,0.15)', glow: '#D4B87D' },
  forest:   { bg: 'rgba(61,122,47,0.15)',   glow: '#3d7a2f' },
  mountain: { bg: 'rgba(108,99,255,0.15)', glow: '#6C63FF' },
  peak:     { bg: 'rgba(255,184,0,0.15)',   glow: '#FFB800' },
};

const TOWN_ICON_MAP = {
  'Coins': 'Coins', 'TrendingUp': 'TrendingUp', 'BarChart2': 'BarChart2',
  'FileText': 'FileText', 'Activity': 'Activity', 'PieChart': 'PieChart',
  'Zap': 'Zap', 'GitBranch': 'GitBranch', 'Gem': 'Gem',
  'Cpu': 'Cpu', 'Layout': 'LayoutGrid', 'Code': 'Code2',
};

// ─── SVG connection paths between towns ───
const PathLines = ({ progress }) => {
  const statusMap = {};
  progress.forEach(p => { statusMap[p.town_id] = p.status; });

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {PATHS.map(([fromId, toId], i) => {
        const from = TOWN_POSITIONS.find(t => t.id === fromId);
        const to   = TOWN_POSITIONS.find(t => t.id === toId);
        if (!from || !to) return null;
        const fromStatus = statusMap[fromId] || 'locked';
        const toStatus   = statusMap[toId]   || 'locked';
        const isActive = fromStatus !== 'locked' && toStatus !== 'locked';
        const isCompleted = fromStatus === 'completed' && toStatus !== 'locked';
        return (
          <line
            key={i}
            x1={`${from.x}%`} y1={`${from.y}%`}
            x2={`${to.x}%`}   y2={`${to.y}%`}
            stroke={isCompleted ? '#00FF88' : isActive ? '#6C63FF' : 'rgba(255,255,255,0.08)'}
            strokeWidth={isActive ? 2 : 1}
            strokeDasharray={isActive ? 'none' : '4 4'}
            filter={isActive ? 'url(#glow)' : ''}
            opacity={isActive ? 0.7 : 0.3}
          />
        );
      })}
    </svg>
  );
};

// ─── Individual town node ───
const TownNode = ({ town, position, progress, onClick }) => {
  const pos = TOWN_POSITIONS.find(p => p.id === town.id);
  const status = progress?.status || 'locked';
  const iconName = TOWN_ICON_MAP[town.icon] || 'Star';
  const TownIcon = LucideIcons[iconName] || LucideIcons.Star;
  const zone = ZONE_COLORS[pos?.zone] || ZONE_COLORS.forest;
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';
  const isUnlocked = status === 'unlocked';

  const ringColor = isCompleted ? '#00FF88' : isInProgress ? '#6C63FF' : isUnlocked ? '#FFB800' : 'rgba(255,255,255,0.1)';
  const glowColor = isCompleted ? 'rgba(0,255,136,0.4)' : isInProgress ? 'rgba(108,99,255,0.5)' : isUnlocked ? 'rgba(255,184,0,0.3)' : 'transparent';
  const size = town.id === 12 ? 68 : 56;

  return (
    <motion.div
      className="absolute flex flex-col items-center cursor-pointer"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: town.id * 0.05, type: 'spring', stiffness: 200 }}
      onClick={() => !isLocked && onClick(town)}
      whileHover={!isLocked ? { scale: 1.15, zIndex: 20 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
    >
      {/* Glow ring */}
      {!isLocked && (
        <motion.div
          className="absolute rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: town.id * 0.2 }}
          style={{
            width: size + 16, height: size + 16,
            background: glowColor,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* Main circle */}
      <div
        className="relative flex items-center justify-center rounded-full transition-all"
        style={{
          width: size, height: size,
          background: isLocked
            ? 'rgba(30,30,40,0.8)'
            : `radial-gradient(circle at 30% 30%, ${town.color}40, ${town.color}15)`,
          border: `2.5px solid ${ringColor}`,
          backdropFilter: 'blur(12px)',
          boxShadow: isLocked ? 'none' : `0 0 20px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        {/* Town number badge */}
        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black"
          style={{ background: ringColor, color: isLocked ? '#666' : '#000' }}>
          {town.id}
        </div>

        {/* Icon */}
        {isLocked ? (
          <Lock size={town.id === 12 ? 22 : 18} className="text-white/20" />
        ) : isCompleted ? (
          <CheckCircle2 size={town.id === 12 ? 26 : 22} style={{ color: '#00FF88' }} />
        ) : (
          <TownIcon size={town.id === 12 ? 26 : 20} style={{ color: town.color }} />
        )}

        {/* Crown for peak */}
        {town.id === 12 && !isLocked && (
          <div className="absolute -top-5 text-base">👑</div>
        )}
      </div>

      {/* Label */}
      <div className="mt-1.5 text-center" style={{ maxWidth: 80 }}>
        <p className={`text-[10px] font-bold leading-tight ${isLocked ? 'text-white/25' : 'text-white/80'}`}
          style={!isLocked ? { textShadow: `0 0 8px ${glowColor}` } : {}}>
          {town.name.split(' ').slice(0, 2).join(' ')}
        </p>
        {!isLocked && !isCompleted && (
          <p className="text-[9px] text-[#FFB800]/70">{town.xpReward} XP</p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Town detail popup ───
const TownPopup = ({ town, progress, onClose, onEnter }) => {
  const completedLessons = (progress?.completed_lessons || []).filter(id =>
    town.lessons?.some(l => l.id === id)
  );
  const totalLessons = town.lessons?.length || 0;
  const status = progress?.status || 'locked';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 overflow-hidden"
        style={{
          background: 'rgba(12,12,20,0.97)',
          border: `1px solid ${town.color}30`,
          boxShadow: `0 0 60px ${town.color}20`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 50% 0%, ${town.color}, transparent 70%)` }} />

        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-all">
          <X size={16} className="text-white/50" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `${town.color}20`, border: `1px solid ${town.color}30` }}>
            {status === 'completed'
              ? <CheckCircle2 size={24} style={{ color: '#00FF88' }} />
              : <span className="text-2xl">{town.emoji || '🏛️'}</span>}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Town {town.id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                status === 'completed' ? 'bg-[#00FF88]/15 text-[#00FF88]' :
                status === 'in_progress' ? 'bg-[#6C63FF]/15 text-[#6C63FF]' :
                status === 'unlocked' ? 'bg-[#FFB800]/15 text-[#FFB800]' :
                'bg-white/5 text-white/30'
              }`}>
                {status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : status === 'unlocked' ? 'Unlocked' : 'Locked'}
              </span>
            </div>
            <h3 className="font-black text-xl mt-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: town.color }}>{town.name}</h3>
          </div>
        </div>

        <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>{town.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Lessons', value: totalLessons, color: '#00D4FF' },
            { label: 'XP Reward', value: `+${town.xpReward}`, color: '#FFB800' },
            { label: 'Completed', value: status === 'completed' ? '✓' : `${completedLessons.length}/${totalLessons}`, color: '#00FF88' },
          ].map(s => (
            <div key={s.label} className="glass p-3 rounded-xl text-center">
              <p className="text-base font-black" style={{ color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {status !== 'locked' && status !== 'completed' && (
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Lesson progress</span>
              <span style={{ color: town.color }}>{completedLessons.length}/{totalLessons}</span>
            </div>
            <div className="xp-bar h-2 rounded-full bg-white/5">
              <div className="h-full rounded-full transition-all" style={{ width: `${totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0}%`, background: `linear-gradient(90deg, ${town.color}, #00D4FF)` }} />
            </div>
          </div>
        )}

        {/* CTA */}
        {status === 'locked' ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 text-xs text-white/30">
            <Lock size={12} /> Complete the previous town to unlock this location
          </div>
        ) : (
          <button onClick={() => onEnter(town)}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${town.color}, #00D4FF)` }}
            data-testid={`enter-town-${town.id}`}>
            {status === 'completed' ? <><Award size={16} /> Review Town</> :
             status === 'in_progress' ? <><Zap size={16} /> Continue Journey</> :
             <><Rocket size={16} /> Enter Town</>}
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Side quests panel ───
const SideQuestsPanel = ({ completedTowns, onClose }) => (
  <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
    className="fixed right-0 top-0 h-full w-72 z-40 flex flex-col"
    style={{ background: 'rgba(8,8,16,0.97)', borderLeft: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
    <div className="flex items-center justify-between p-4 border-b border-white/10">
      <div className="flex items-center gap-2">
        <Swords size={16} className="text-[#FFB800]" />
        <h3 className="font-bold text-sm text-white">Side Quests</h3>
      </div>
      <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
        <X size={14} className="text-white/40" />
      </button>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {SIDE_QUESTS.map(q => {
        const QIcon = LucideIcons[q.icon] || LucideIcons.Star;
        const unlocked = completedTowns >= q.unlockAfter;
        return (
          <div key={q.id} className={`glass p-4 rounded-2xl transition-all ${unlocked ? 'glass-hover' : 'opacity-50'}`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: unlocked ? `${q.color}20` : 'rgba(255,255,255,0.05)', border: `1px solid ${unlocked ? q.color + '30' : 'rgba(255,255,255,0.05)'}` }}>
                {unlocked ? <QIcon size={16} style={{ color: q.color }} /> : <Lock size={14} className="text-white/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-xs ${unlocked ? 'text-white' : 'text-white/30'}`}>{q.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{q.desc}</p>
                {!unlocked && (
                  <p className="text-[10px] mt-1 text-[#FFB800]/60">Unlock after Town {q.unlockAfter}</p>
                )}
              </div>
            </div>
            {unlocked && (
              <Link to={q.link} className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
                style={{ background: `${q.color}20`, color: q.color }}>
                Go to quest <ChevronRight size={12} />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  </motion.div>
);

// ─── Main Roadmap Component ───
const Roadmap = () => {
  const { isDark, user } = useApp();
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTown, setSelectedTown] = useState(null);
  const [showSideQuests, setShowSideQuests] = useState(false);

  useEffect(() => {
    axios.get(`${API}/roadmap/progress`).then(r => {
      setProgress(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const completedCount = progress.filter(p => p.status === 'completed').length;
  const progressPct = Math.round((completedCount / 12) * 100);

  const handleTownClick = (town) => {
    const pos = TOWN_POSITIONS.find(p => p.id === town.id);
    setSelectedTown({ town, position: pos });
  };

  const handleEnterTown = (town) => {
    setSelectedTown(null);
    navigate(`/roadmap/${town.id}`);
  };

  return (
    <div className="relative" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #060d1e 0%, #0a1628 40%, #0d1f3a 100%)' }}>

      {/* Ocean animated background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-white"
            style={{ left: `${(i * 37 + 7) % 100}%`, top: `${(i * 23 + 11) % 60}%`, opacity: 0.3 + (i % 3) * 0.2 }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 + (i % 4), delay: i * 0.3 }} />
        ))}
        {/* Wave layers */}
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} className="absolute bottom-0 w-full"
            style={{ height: `${60 + i * 15}px`, background: `rgba(10,22,40,${0.3 + i * 0.2})`, borderRadius: '50% 50% 0 0 / 20px 20px 0 0' }}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4 + i, ease: 'easeInOut', delay: i * 0.7 }} />
        ))}
      </div>

      {/* Top HUD */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4 pb-0 sm:px-6">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: '#fff', textShadow: '0 0 30px rgba(108,99,255,0.5)' }}>
            Optimus Island
          </h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Your investment learning journey</p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-full flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#00FF88]" />
              <span className="text-xs font-bold text-white">{completedCount}/12</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Zap size={13} className="text-[#FFB800]" />
              <span className="text-xs font-bold text-white">{user.xp || 0} XP</span>
            </div>
          </div>
          {/* Side quests button */}
          <button onClick={() => setShowSideQuests(v => !v)} data-testid="side-quests-btn"
            className="glass px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all">
            <Swords size={14} className="text-[#FFB800]" />
            <span className="text-xs font-semibold text-white hidden sm:block">Side Quests</span>
            <div className="w-4 h-4 rounded-full bg-[#FFB800] text-black text-[9px] font-black flex items-center justify-center">
              {SIDE_QUESTS.filter(q => completedCount >= q.unlockAfter).length}
            </div>
          </button>
        </div>
      </div>

      {/* ── Island Map ── */}
      <div className="relative z-10 mx-auto" style={{ maxWidth: 900, height: 'calc(100vh - 80px)', minHeight: 600 }}>

        {/* Island landmass — layered blobs */}
        <div className="absolute" style={{
          left: '8%', right: '8%', top: '4%', bottom: '8%',
          background: 'linear-gradient(180deg, #1a3a0a 0%, #2d5a1e 25%, #3d7a2f 55%, #8b6914 80%, #c4a057 95%, #d4b87d 100%)',
          borderRadius: '42% 58% 55% 45% / 45% 42% 58% 55%',
          boxShadow: '0 0 80px rgba(45,90,30,0.4), 0 20px 60px rgba(0,0,0,0.6)',
        }}>
          {/* Beach strip at bottom of island */}
          <div className="absolute bottom-0 left-0 right-0 rounded-b-[inherit]" style={{ height: '22%', background: 'linear-gradient(180deg, transparent, rgba(196,160,87,0.7) 50%, rgba(212,184,125,0.9))', borderRadius: '0 0 42% 42%' }} />
          {/* Snow cap */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-12 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          {/* Forest texture overlay */}
          <div className="absolute inset-0 rounded-[inherit] opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(0,100,0,0.3) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(0,80,0,0.3) 0%, transparent 40%)' }} />
        </div>

        {/* Decorative trees */}
        {[
          { x: '15%', y: '42%', size: 18, delay: 0 }, { x: '82%', y: '45%', size: 16, delay: 0.5 },
          { x: '25%', y: '55%', size: 14, delay: 1 }, { x: '72%', y: '62%', size: 16, delay: 1.5 },
          { x: '38%', y: '70%', size: 12, delay: 0.8 }, { x: '60%', y: '68%', size: 13, delay: 1.2 },
          { x: '20%', y: '36%', size: 15, delay: 0.3 }, { x: '78%', y: '35%', size: 14, delay: 0.9 },
        ].map((tree, i) => (
          <motion.div key={i} className="absolute text-green-700 select-none pointer-events-none"
            style={{ left: tree.x, top: tree.y, fontSize: tree.size, zIndex: 2 }}
            animate={{ rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: tree.delay }}>
            🌲
          </motion.div>
        ))}

        {/* Palm trees on beach */}
        {[{ x: '18%', y: '80%' }, { x: '78%', y: '78%' }, { x: '45%', y: '87%' }].map((p, i) => (
          <motion.div key={i} className="absolute text-xl select-none pointer-events-none"
            style={{ left: p.x, top: p.y, zIndex: 2 }}
            animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4 + i, ease: 'easeInOut' }}>
            🌴
          </motion.div>
        ))}

        {/* Castle/flag at peak */}
        <motion.div className="absolute select-none pointer-events-none text-2xl"
          style={{ left: '50%', top: '3%', transform: 'translateX(-50%)', zIndex: 3 }}
          animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
          🏰
        </motion.div>

        {/* SVG path connections */}
        <PathLines progress={progress} />

        {/* Town nodes */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass px-6 py-4 rounded-2xl">
              <p className="text-white/60 text-sm">Loading island...</p>
            </div>
          </div>
        ) : (
          TOWNS.map(town => {
            const pos = TOWN_POSITIONS.find(p => p.id === town.id);
            const prog = progress.find(p => p.town_id === town.id);
            return pos ? (
              <TownNode key={town.id} town={town} position={pos} progress={prog}
                onClick={handleTownClick} />
            ) : null;
          })
        )}

        {/* Zone labels */}
        {[
          { label: '⚓ Beginner Beach', x: '50%', y: '92%', color: 'rgba(196,160,87,0.8)' },
          { label: '🌲 Knowledge Forest', x: '12%', y: '58%', color: 'rgba(100,180,80,0.8)' },
          { label: '⛰️ Advanced Peak', x: '50%', y: '14%', color: 'rgba(180,180,255,0.7)' },
        ].map((z, i) => (
          <div key={i} className="absolute pointer-events-none text-center" style={{ left: z.x, top: z.y, transform: 'translateX(-50%)', zIndex: 3 }}>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: z.color, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{z.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-3" style={{ background: 'linear-gradient(to top, rgba(6,13,30,0.95), transparent)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span>Journey Progress</span>
              <span className="text-[#00FF88]">{progressPct}% complete</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1.5, delay: 0.5 }}
                style={{ background: 'linear-gradient(90deg, #6C63FF, #00D4FF, #00FF88)' }} />
            </div>
          </div>
          <div className="flex gap-3 text-xs text-white/40">
            {[
              { label: 'Done', val: completedCount, color: '#00FF88' },
              { label: 'Level', val: user.level, color: '#6C63FF' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-bold text-sm" style={{ color: s.color }}>{s.val}</p>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Town popup */}
      <AnimatePresence>
        {selectedTown && (
          <TownPopup
            town={selectedTown.town}
            progress={progress.find(p => p.town_id === selectedTown.town.id)}
            onClose={() => setSelectedTown(null)}
            onEnter={handleEnterTown}
          />
        )}
      </AnimatePresence>

      {/* Side quests panel */}
      <AnimatePresence>
        {showSideQuests && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowSideQuests(false)} />
            <SideQuestsPanel completedTowns={completedCount} onClose={() => setShowSideQuests(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Roadmap;
