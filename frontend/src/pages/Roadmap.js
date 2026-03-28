import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { TOWNS } from '../data/mockData';
import { Lock, CheckCircle2, Zap, Award, ChevronRight, X, Rocket, Swords } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// ─── Emoji per town ───
const TOWN_EMOJIS = {
  1: '💰', 2: '📈', 3: '📊', 4: '🔍', 5: '📉',
  6: '🏦', 7: '⚡', 8: '🎯', 9: '💎', 10: '🪙', 11: '🏗️', 12: '🚀',
};

// ─── Positions — 13 % vertical steps starting at y=6 %, all within visible island ───
const TOWN_POSITIONS = [
  { id: 1,  x: 50, y: 84, zone: 'beach'    },
  { id: 2,  x: 24, y: 71, zone: 'beach'    },
  { id: 3,  x: 74, y: 71, zone: 'beach'    },
  { id: 4,  x: 14, y: 58, zone: 'forest'   },
  { id: 5,  x: 50, y: 58, zone: 'forest'   },
  { id: 6,  x: 83, y: 58, zone: 'forest'   },
  { id: 7,  x: 67, y: 45, zone: 'forest'   },
  { id: 8,  x: 31, y: 45, zone: 'mountain' },
  { id: 9,  x: 50, y: 32, zone: 'mountain' },
  { id: 10, x: 20, y: 19, zone: 'mountain' },
  { id: 11, x: 78, y: 19, zone: 'mountain' },
  { id: 12, x: 50, y: 6,  zone: 'peak'     },
];

const PATHS = [
  [1,2],[1,3],[2,4],[3,6],[4,5],[5,6],[4,8],[5,7],[6,7],[7,9],[8,9],[9,10],[9,11],[10,12],[11,12],
];

const SIDE_QUESTS = [
  { id: 'first_trade',    title: 'First Paper Trade',      desc: 'Execute a BUY order in the trading terminal',  link: '/trade',     icon: 'TrendingUp',   color: '#00FF88', unlockAfter: 1 },
  { id: 'analyze_stock',  title: 'Analyze a Real Stock',   desc: 'Use RSI + MACD on any NSE stock',              link: '/analysis',  icon: 'Activity',     color: '#00D4FF', unlockAfter: 4 },
  { id: 'community_post', title: 'Post in Community',      desc: 'Share an insight with 2,800+ traders',         link: '/community', icon: 'Users',        color: '#6C63FF', unlockAfter: 2 },
  { id: 'first_backtest', title: 'Run a Strategy Backtest',desc: 'Backtest a pre-built algo on historical data',  link: '/algo-lab',  icon: 'FlaskConical', color: '#FFB800', unlockAfter: 6 },
  { id: 'join_comp',      title: 'Join a Competition',     desc: 'Compete in a paper trading tournament',         link: '/arena',     icon: 'Trophy',       color: '#FF4444', unlockAfter: 8 },
];

// ─── Zone configuration ───
const ZONE_CONFIG = {
  beach: {
    gradient:  'linear-gradient(145deg, #7A4A00 0%, #B07010 30%, #D89220 60%, #F0B030 85%, #FFD060 100%)',
    glow:      'rgba(230,160,40,0.65)',
    border:    '#E8A830',
    label:     '⚓ Beginner Beach',
    labelClr:  '#FFD060',
  },
  forest: {
    gradient:  'linear-gradient(145deg, #0A4010 0%, #166020 30%, #208A30 60%, #2AB040 85%, #40D050 100%)',
    glow:      'rgba(40,160,55,0.65)',
    border:    '#28A040',
    label:     '🌲 Knowledge Forest',
    labelClr:  '#50D865',
  },
  mountain: {
    gradient:  'linear-gradient(145deg, #0E1070 0%, #1C20A0 30%, #2C34C8 60%, #4050E0 85%, #5870F8 100%)',
    glow:      'rgba(64,80,224,0.65)',
    border:    '#4858E8',
    label:     '⛰️ Advanced Peak',
    labelClr:  '#8090FF',
  },
  peak: {
    gradient:  'linear-gradient(145deg, #604000 0%, #906000 30%, #C08800 60%, #E0AA10 85%, #FDD030 100%)',
    glow:      'rgba(230,170,16,0.75)',
    border:    '#EEB820',
    label:     '👑 Master Summit',
    labelClr:  '#FFE050',
  },
};

const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

// ─── SVG connection paths ───
const PathLines = ({ progress }) => {
  const sm = {};
  progress.forEach(p => { sm[p.town_id] = p.status; });

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {PATHS.map(([a, b], i) => {
        const from = TOWN_POSITIONS.find(t => t.id === a);
        const to   = TOWN_POSITIONS.find(t => t.id === b);
        if (!from || !to) return null;
        const fSt = sm[a] || 'locked';
        const tSt = sm[b] || 'locked';
        const active    = fSt !== 'locked';
        const completed = fSt === 'completed' && tSt !== 'locked';
        const x1 = from.x, y1 = from.y, x2 = to.x, y2 = to.y;
        const mx = (x1+x2)/2, my = (y1+y2)/2;
        const dx = x2-x1, dy = y2-y1;
        const len = Math.sqrt(dx*dx+dy*dy) || 1;
        const cx = mx + (-dy/len)*2, cy = my + (dx/len)*2;
        return (
          <path key={i}
            d={`M ${x1}% ${y1}% Q ${cx}% ${cy}% ${x2}% ${y2}%`}
            stroke={completed ? '#00FF88' : active ? '#6C63FF' : 'rgba(255,255,255,0.07)'}
            strokeWidth={active ? 2.5 : 1}
            strokeDasharray={completed ? 'none' : active ? '7 4' : '3 6'}
            fill="none"
            filter={active ? 'url(#glow)' : ''}
            opacity={active ? 0.85 : 0.25}
          />
        );
      })}
    </svg>
  );
};

// ─── Hex town node ───
const TownNode = ({ town, position, progress, onClick }) => {
  const pos      = TOWN_POSITIONS.find(p => p.id === town.id);
  const status   = progress?.status || 'locked';
  const zone     = pos?.zone || 'forest';
  const zc       = ZONE_CONFIG[zone];
  const isLocked = status === 'locked';
  const isDone   = status === 'completed';
  const isIP     = status === 'in_progress';
  const isPeak   = town.id === 12;
  const emoji    = TOWN_EMOJIS[town.id] || '🏛️';

  const inner  = isPeak ? 76 : 66;
  const outer  = inner + 10;

  const ringClr = isDone  ? '#00FF88'
                : isIP    ? '#7C73FF'
                : !isLocked ? zc.border
                : 'rgba(120,125,180,0.25)';

  const tileBg  = isLocked
    ? 'linear-gradient(145deg, #1a1c38, #242650)'
    : zc.gradient;

  const glowClr = isDone  ? 'rgba(0,255,136,0.55)'
                : isIP    ? 'rgba(108,99,255,0.6)'
                : !isLocked ? zc.glow
                : 'transparent';

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%,-50%)', zIndex: 10,
               cursor: isLocked ? 'default' : 'pointer' }}
      initial={{ opacity: 0, scale: 0.3, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: town.id * 0.055, type: 'spring', stiffness: 200, damping: 16 }}
      onClick={() => !isLocked && onClick(town)}
      whileHover={!isLocked ? { scale: 1.12, zIndex: 30 } : {}}
      whileTap={!isLocked ? { scale: 0.92 } : {}}
    >
      {/* Ambient glow */}
      {!isLocked && (
        <motion.div
          style={{ position:'absolute', width: outer+28, height: outer+28, background: glowClr,
                   filter:'blur(16px)', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                   pointerEvents:'none' }}
          animate={{ scale:[0.88,1.2,0.88], opacity:[0.65,0.2,0.65] }}
          transition={{ repeat:Infinity, duration: 2.8+town.id*0.12, ease:'easeInOut' }}
        />
      )}

      {/* Outer ring hex */}
      <div style={{ width:outer, height:outer, clipPath:HEX, background:ringClr,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    filter: !isLocked ? `drop-shadow(0 0 8px ${glowClr})` : 'none' }}>
        {/* Inner tile hex */}
        <div style={{ width:inner, height:inner, clipPath:HEX, background:tileBg,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexDirection:'column', position:'relative', overflow:'hidden' }}>

          {/* Shine overlay (top-left highlight) */}
          {!isLocked && (
            <div style={{ position:'absolute', inset:0, pointerEvents:'none',
                          background:'linear-gradient(140deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 55%)' }} />
          )}

          {/* Crown for peak */}
          {isPeak && !isLocked && (
            <div style={{ position:'absolute', top:'9%', fontSize:13, lineHeight:1 }}>👑</div>
          )}

          {/* Main icon */}
          <div style={{ position:'relative', zIndex:2, marginTop: isPeak ? 10 : 7 }}>
            {isLocked
              ? <Lock size={isPeak?22:17} style={{ color:'rgba(180,185,230,0.45)' }} />
              : isDone
                ? <CheckCircle2 size={isPeak?26:21} style={{ color:'#fff' }} />
                : <span style={{ fontSize: isPeak?24:19, lineHeight:1 }}>{emoji}</span>}
          </div>

          {/* Town number */}
          <div style={{ fontSize:7.5, fontWeight:900, letterSpacing:0.5,
                        color: isLocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)',
                        fontFamily:'Outfit,sans-serif', marginTop:3, position:'relative', zIndex:2 }}>
            {String(town.id).padStart(2,'0')}
          </div>
        </div>
      </div>

      {/* Compact pill label — fixed width prevents overlap */}
      <div style={{ marginTop:5, maxWidth:72, width:72 }}>
        <div style={{ background:'rgba(0,0,0,0.62)', backdropFilter:'blur(6px)',
                      borderRadius:20, padding:'2px 7px', textAlign:'center',
                      border: `1px solid ${isLocked?'rgba(255,255,255,0.05)':ringClr+'40'}` }}>
          <p style={{ fontSize:8.5, fontWeight:800, fontFamily:'Outfit,sans-serif',
                      color: isLocked ? 'rgba(255,255,255,0.22)' : '#fff',
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                      lineHeight:1.3 }}>
            {town.name.split(' ').slice(0,2).join(' ')}
          </p>
          {!isLocked && !isDone && (
            <p style={{ fontSize:7, color:'#FFB800', fontWeight:700, lineHeight:1.2, marginTop:0 }}>
              +{town.xpReward} XP
            </p>
          )}
          {isDone && (
            <p style={{ fontSize:7, color:'#00FF88', fontWeight:700, lineHeight:1.2 }}>✓ done</p>
          )}
        </div>
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
    <motion.div initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
      exit={{ opacity:0, scale:0.9, y:20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-3xl p-6 overflow-hidden"
        style={{ background:'rgba(10,10,20,0.97)', border:`1px solid ${town.color}30`,
                 boxShadow:`0 0 60px ${town.color}18` }}
        onClick={e => e.stopPropagation()}>
        <div className="absolute inset-0 opacity-5"
          style={{ background:`radial-gradient(circle at 50% 0%, ${town.color}, transparent 70%)` }} />
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-all">
          <X size={16} className="text-white/50" />
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background:`${town.color}18`, border:`1px solid ${town.color}30` }}>
            {status === 'completed' ? <CheckCircle2 size={24} style={{ color:'#00FF88' }} />
              : <span>{TOWN_EMOJIS[town.id] || '🏛️'}</span>}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Town {town.id}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                status==='completed'   ? 'bg-[#00FF88]/15 text-[#00FF88]' :
                status==='in_progress' ? 'bg-[#6C63FF]/15 text-[#6C63FF]' :
                status==='unlocked'    ? 'bg-[#FFB800]/15 text-[#FFB800]' :
                                         'bg-white/5 text-white/30'}`}>
                {status==='completed'   ? 'Completed' :
                 status==='in_progress' ? 'In Progress' :
                 status==='unlocked'    ? 'Unlocked' : 'Locked'}
              </span>
            </div>
            <h3 className="font-black text-xl mt-0.5" style={{ fontFamily:'Outfit,sans-serif', color:town.color }}>
              {town.name}
            </h3>
          </div>
        </div>

        <p className="text-sm mb-5" style={{ color:'rgba(255,255,255,0.55)' }}>{town.description}</p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label:'Lessons',   value:totalLessons,                                                   color:'#00D4FF' },
            { label:'XP Reward', value:`+${town.xpReward}`,                                            color:'#FFB800' },
            { label:'Completed', value:status==='completed'?'✓':`${completedLessons.length}/${totalLessons}`, color:'#00FF88' },
          ].map(s => (
            <div key={s.label} className="glass p-3 rounded-xl text-center">
              <p className="text-base font-black" style={{ color:s.color, fontFamily:'Outfit,sans-serif' }}>{s.value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {status !== 'locked' && status !== 'completed' && (
          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color:'rgba(255,255,255,0.4)' }}>Lesson progress</span>
              <span style={{ color:town.color }}>{completedLessons.length}/{totalLessons}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div className="h-full rounded-full transition-all"
                style={{ width:`${totalLessons>0?(completedLessons.length/totalLessons)*100:0}%`,
                         background:`linear-gradient(90deg,${town.color},#00D4FF)` }} />
            </div>
          </div>
        )}

        {status === 'locked' ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 text-xs text-white/30">
            <Lock size={12} /> Complete the previous town to unlock this location
          </div>
        ) : (
          <button onClick={() => onEnter(town)} data-testid={`enter-town-${town.id}`}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background:`linear-gradient(135deg,${town.color},#00D4FF)` }}>
            {status==='completed' ? <><Award size={16} /> Review Town</> :
             status==='in_progress' ? <><Zap size={16} /> Continue Journey</> :
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
  <motion.div initial={{ x:300, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:300, opacity:0 }}
    className="fixed right-0 top-0 h-full w-72 z-40 flex flex-col"
    style={{ background:'rgba(8,8,16,0.97)', borderLeft:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(20px)' }}>
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
          <div key={q.id} className={`glass p-4 rounded-2xl transition-all ${unlocked?'glass-hover':'opacity-50'}`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:unlocked?`${q.color}20`:'rgba(255,255,255,0.05)',
                         border:`1px solid ${unlocked?q.color+'30':'rgba(255,255,255,0.05)'}` }}>
                {unlocked ? <QIcon size={16} style={{ color:q.color }} /> : <Lock size={14} className="text-white/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-xs ${unlocked?'text-white':'text-white/30'}`}>{q.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{q.desc}</p>
                {!unlocked && <p className="text-[10px] mt-1 text-[#FFB800]/60">Unlock after Town {q.unlockAfter}</p>}
              </div>
            </div>
            {unlocked && (
              <Link to={q.link} className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background:`${q.color}20`, color:q.color }}>
                Go to quest <ChevronRight size={12} />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  </motion.div>
);

// ─── Main Roadmap ───
const Roadmap = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [progress, setProgress]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedTown, setSelectedTown] = useState(null);
  const [showSideQuests, setShowSideQuests] = useState(false);

  useEffect(() => {
    axios.get(`${API}/roadmap/progress`)
      .then(r => setProgress(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = progress.filter(p => p.status === 'completed').length;
  const progressPct    = Math.round((completedCount / 12) * 100);

  const handleTownClick = (town) => {
    const pos = TOWN_POSITIONS.find(p => p.id === town.id);
    setSelectedTown({ town, position: pos });
  };

  const handleEnterTown = (town) => {
    setSelectedTown(null);
    navigate(`/roadmap/${town.id}`);
  };

  return (
    <div className="relative" style={{ minHeight:'100vh', background:'linear-gradient(180deg,#04080f 0%,#060c18 50%,#080e1e 100%)' }}>

      {/* ─ Background: animated ocean + hex grid ─ */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex:0 }}>
        {/* Hex grid pattern */}
        <svg width="100%" height="100%" style={{ position:'absolute', inset:0, opacity:0.09 }}>
          <defs>
            <pattern id="hexGrid" x="0" y="0" width="72" height="83" patternUnits="userSpaceOnUse">
              <polygon points="36,0 72,21 72,62 36,83 0,62 0,21" fill="none" stroke="#4A78C8" strokeWidth="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexGrid)" />
        </svg>

        {/* Stars */}
        {[...Array(50)].map((_,i) => (
          <motion.div key={i} className="absolute rounded-full bg-white"
            style={{ width:i%7===0?2:1, height:i%7===0?2:1,
                     left:`${(i*41+13)%100}%`, top:`${(i*17+7)%70}%`,
                     opacity:0.12+(i%5)*0.1 }}
            animate={{ opacity:[0.08,0.7,0.08] }}
            transition={{ repeat:Infinity, duration:2+(i%6), delay:i*0.22 }}
          />
        ))}

        {/* Zone ambient glows */}
        {[
          { x:'22%', y:'80%', clr:'rgba(230,160,40,0.07)', sz:400 },
          { x:'65%', y:'58%', clr:'rgba(40,160,55,0.07)',  sz:450 },
          { x:'40%', y:'33%', clr:'rgba(64,80,224,0.08)',  sz:380 },
          { x:'50%', y:'7%',  clr:'rgba(230,170,16,0.1)',  sz:240 },
        ].map((o,i) => (
          <motion.div key={i}
            style={{ position:'absolute', left:o.x, top:o.y, width:o.sz, height:o.sz,
                     background:o.clr, borderRadius:'50%', filter:'blur(70px)',
                     transform:'translate(-50%,-50%)' }}
            animate={{ scale:[1,1.18,1], opacity:[0.8,1,0.8] }}
            transition={{ repeat:Infinity, duration:6+i*1.5, ease:'easeInOut' }}
          />
        ))}
      </div>

      {/* ─ Top HUD ─ */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily:'Outfit,sans-serif', color:'#fff',
              textShadow:'0 0 30px rgba(108,99,255,0.5)' }}>
            Optimus Island
          </h1>
          <p className="text-xs" style={{ color:'rgba(255,255,255,0.38)' }}>Your investment learning journey</p>
        </div>
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

      {/* ─ Island Map ─ */}
      <div className="relative z-10 mx-auto" style={{ maxWidth:980, height:'calc(100vh - 72px)', minHeight:680 }}>

        {/* Island landmass — organic zone blending */}
        <div className="absolute" style={{ left:'6%', right:'6%', top:'2%', bottom:'6%',
            borderRadius:'44% 56% 50% 50% / 48% 44% 56% 52%', overflow:'hidden',
            boxShadow:'0 0 120px rgba(20,60,15,0.25), 0 30px 90px rgba(0,0,0,0.75)' }}>
          {/* Base gradient — peak(dark top)→mountain(indigo)→forest(green)→beach(amber) */}
          <div style={{ position:'absolute', inset:0,
              background:'linear-gradient(180deg,#060a28 0%,#0e1650 14%,#182080 26%,#1e2890 38%,#142e14 51%,#1c5020 60%,#246428 70%,#4a3206 78%,#7c5210 88%,#aa7c28 100%)' }} />
          {/* Mountain radial patch */}
          <div style={{ position:'absolute', inset:0,
              background:'radial-gradient(ellipse 68% 40% at 50% 28%, rgba(28,36,150,0.92) 0%, transparent 80%)' }} />
          {/* Forest left radial */}
          <div style={{ position:'absolute', inset:0,
              background:'radial-gradient(ellipse 48% 28% at 22% 57%, rgba(22,106,30,0.84) 0%, transparent 75%)' }} />
          {/* Forest right radial */}
          <div style={{ position:'absolute', inset:0,
              background:'radial-gradient(ellipse 50% 26% at 80% 55%, rgba(20,96,26,0.80) 0%, transparent 75%)' }} />
          {/* Forest center fill */}
          <div style={{ position:'absolute', inset:0,
              background:'radial-gradient(ellipse 40% 20% at 50% 55%, rgba(24,110,32,0.78) 0%, transparent 75%)' }} />
          {/* Beach sand bottom */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'33%',
              background:'linear-gradient(180deg,transparent 0%,rgba(72,48,8,0.68) 22%,rgba(132,88,14,0.9) 52%,rgba(178,124,28,1) 78%,rgba(200,148,42,1) 100%)' }} />
          {/* Dark narrow peak cap */}
          <div style={{ position:'absolute', top:0, left:'22%', right:'22%', height:'16%',
              background:'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(4,6,32,0.95) 0%, transparent 100%)' }} />
          {/* Edge vignette */}
          <div style={{ position:'absolute', inset:0,
              background:'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 52%, rgba(0,0,0,0.52) 100%)' }} />
        </div>

        {/* Decorative elements — positioned in empty areas between hexes */}
        {[
          { e:'🌲', x:'13%', y:'50%', sz:16, dy:0    },
          { e:'🌲', x:'83%', y:'50%', sz:15, dy:0.5  },
          { e:'🌲', x:'22%', y:'63%', sz:14, dy:1    },
          { e:'🌲', x:'76%', y:'63%', sz:14, dy:1.5  },
          { e:'🌲', x:'37%', y:'50%', sz:12, dy:0.8  },
          { e:'🌲', x:'62%', y:'51%', sz:12, dy:1.2  },
          { e:'🌴', x:'18%', y:'79%', sz:18, dy:0.3  },
          { e:'🌴', x:'80%', y:'77%', sz:17, dy:0.9  },
          { e:'🌴', x:'43%', y:'88%', sz:17, dy:0.6  },
          { e:'❄️', x:'42%', y:'4%',  sz:12, dy:0    },
          { e:'⛵', x:'3%',  y:'50%', sz:19, dy:0    },
          { e:'⛵', x:'92%', y:'65%', sz:17, dy:1    },
          { e:'🌊', x:'5%',  y:'70%', sz:15, dy:0.4  },
          { e:'🌊', x:'91%', y:'82%', sz:13, dy:0.7  },
        ].map((el,i) => (
          <motion.div key={i} className="absolute select-none pointer-events-none"
            style={{ left:el.x, top:el.y, fontSize:el.sz, zIndex:2, lineHeight:1 }}
            animate={{ rotate:el.e==='🌲'?[-4,4,-4]:[], y:el.e==='⛵'?[0,-5,0]:[] }}
            transition={{ repeat:Infinity, duration:3+i*0.4, delay:el.dy, ease:'easeInOut' }}>
            {el.e}
          </motion.div>
        ))}

        {/* Floating castle — offset to avoid overlapping peak hex */}
        <motion.div className="absolute select-none pointer-events-none text-xl"
          style={{ left:'66%', top:'5%', transform:'translateX(-50%)', zIndex:3 }}
          animate={{ y:[-3,3,-3] }}
          transition={{ repeat:Infinity, duration:3.5, ease:'easeInOut' }}>
          🏰
        </motion.div>

        {/* Zone badges — placed in gap rows between hex rows, never on a hex y-level */}
        {[
          { zone:'mountain', x:'50%', y:'25.5%' },  // gap between y=19 and y=32
          { zone:'forest',   x:'50%', y:'51.5%' },  // gap between y=45 and y=58
          { zone:'beach',    x:'50%', y:'77.5%' },  // gap between y=71 and y=84
        ].map(({ zone, x, y }) => {
          const zc = ZONE_CONFIG[zone];
          return (
            <div key={zone} className="absolute pointer-events-none" style={{ left:x, top:y, transform:'translateX(-50%)', zIndex:3 }}>
              <div style={{ padding:'3px 10px', borderRadius:20, fontSize:8.5, fontWeight:800,
                            letterSpacing:'0.06em', textTransform:'uppercase',
                            background:'rgba(0,0,0,0.5)', color:zc.labelClr,
                            border:`1px solid ${zc.labelClr}28`, backdropFilter:'blur(6px)',
                            textShadow:'0 1px 3px rgba(0,0,0,0.9)', whiteSpace:'nowrap' }}>
                {zc.label}
              </div>
            </div>
          );
        })}

        {/* SVG connections */}
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
            const pos  = TOWN_POSITIONS.find(p => p.id === town.id);
            const prog = progress.find(p => p.town_id === town.id);
            return pos ? (
              <TownNode key={town.id} town={town} position={pos} progress={prog} onClick={handleTownClick} />
            ) : null;
          })
        )}
      </div>

      {/* ─ Progress bar ─ */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 py-3"
        style={{ background:'linear-gradient(to top, rgba(4,8,15,0.97), transparent)', backdropFilter:'blur(8px)' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1" style={{ color:'rgba(255,255,255,0.38)' }}>
              <span>Journey Progress</span>
              <span className="text-[#00FF88]">{progressPct}% complete</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
              <motion.div className="h-full rounded-full"
                initial={{ width:0 }} animate={{ width:`${progressPct}%` }} transition={{ duration:1.5, delay:0.5 }}
                style={{ background:'linear-gradient(90deg,#6C63FF,#00D4FF,#00FF88)' }} />
            </div>
          </div>
          <div className="flex gap-4 text-xs text-white/40">
            {[{ label:'Done', val:completedCount, color:'#00FF88' }, { label:'Level', val:user.level, color:'#6C63FF' }].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-bold text-sm" style={{ color:s.color }}>{s.val}</p>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Town popup */}
      <AnimatePresence>
        {selectedTown && (
          <TownPopup town={selectedTown.town}
            progress={progress.find(p => p.town_id === selectedTown.town.id)}
            onClose={() => setSelectedTown(null)} onEnter={handleEnterTown} />
        )}
      </AnimatePresence>

      {/* Side quests */}
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
