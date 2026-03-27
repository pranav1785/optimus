import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { GLOSSARY_TERMS, ARTICLES } from '../data/mockData';
import { BookOpen, Search, Zap, CheckCircle2, X, Clock, Star, TrendingDown, AlertTriangle } from 'lucide-react';

const CRASH_OPTIONS = [
  { id: '2020_covid_crash', label: '2020 COVID Crash', drop: -40, color: '#FF4444' },
  { id: '2008_financial_crisis', label: '2008 Financial Crisis', drop: -65, color: '#FF4444' },
  { id: '2000_dotcom_bubble', label: '2000 Dot-com Bubble', drop: -55, color: '#FFB800' },
  { id: '1992_harshad_mehta', label: '1992 Harshad Mehta Scam', drop: -40, color: '#FFB800' },
];

const LearnHub = () => {
  const { isDark, addXP } = useApp();
  const [tab, setTab] = useState('articles');
  const [searchTerm, setSearchTerm] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizDone, setQuizDone] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCrash, setSelectedCrash] = useState(CRASH_OPTIONS[0].id);
  const [crashResult, setCrashResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [crashEvent, setCrashEvent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (tab === 'quiz') {
      axios.get(`${API}/learn/daily-quiz`).then(r => {
        setQuiz(r.data);
        setQuizDone(r.data.already_completed);
      }).catch(() => {});
    }
  }, [tab]);

  const submitQuiz = async () => {
    if (Object.keys(answers).length < (quiz?.questions?.length || 5)) return;
    setSubmitting(true);
    try {
      const answerList = quiz.questions.map((_, i) => answers[i] ?? -1);
      const { data } = await axios.post(`${API}/learn/daily-quiz/submit`, { answers: answerList });
      setQuizResult(data);
      setQuizDone(true);
      if (data.xp_earned > 0) await addXP(0, '');
    } catch (e) {}
    setSubmitting(false);
  };

  const simulateCrash = async () => {
    setSimulating(true);
    setCrashResult(null);
    try {
      const [simRes, eventRes] = await Promise.all([
        axios.post(`${API}/market/crash-simulation`, { event_id: selectedCrash }),
        axios.get(`${API}/market/crash-events/${selectedCrash}`),
      ]);
      setCrashResult(simRes.data);
      setCrashEvent(eventRes.data);
    } catch (e) {}
    setSimulating(false);
  };

  const glossaryCategories = ['All', ...Array.from(new Set(GLOSSARY_TERMS.map(t => t.category)))];
  const filteredGlossary = GLOSSARY_TERMS.filter(t =>
    (selectedCategory === 'All' || t.category === selectedCategory) &&
    (t.term.toLowerCase().includes(searchTerm.toLowerCase()) || t.definition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredArticles = ARTICLES.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
          Learn Hub
        </h1>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
          Articles, glossary, daily quiz, and market crash simulator
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl glass w-fit flex-wrap">
        {[
          { id: 'articles', label: 'Articles', icon: BookOpen },
          { id: 'glossary', label: 'Glossary', icon: Search },
          { id: 'quiz', label: 'Daily Quiz', icon: Zap },
          { id: 'crash', label: 'Crash Sim', icon: TrendingDown },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`learn-tab-${t.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-[#6C63FF] text-white' : 'text-white/50 hover:text-white'}`}>
            <t.icon size={14} /> {t.label}
            {t.id === 'quiz' && !quizDone && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />}
          </button>
        ))}
      </div>

      {/* ARTICLES */}
      {tab === 'articles' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl glass">
              <Search size={14} className="text-white/40" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search articles..."
                className="bg-transparent text-sm outline-none flex-1" style={{ color: isDark ? '#fff' : '#0F172A' }} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="glass p-5 rounded-2xl glass-hover cursor-pointer" data-testid={`article-${a.id}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    a.level === 'Beginner' ? 'bg-[#00FF88]/15 text-[#00FF88]' :
                    a.level === 'Intermediate' ? 'bg-[#FFB800]/15 text-[#FFB800]' :
                    'bg-[#FF4444]/15 text-[#FF4444]'
                  }`}>{a.level}</span>
                  <span className="text-xs text-white/30">{a.category}</span>
                </div>
                <h3 className="font-bold text-sm leading-tight mb-2" style={{ color: isDark ? '#fff' : '#0F172A' }}>{a.title}</h3>
                <p className="text-xs leading-relaxed mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{a.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <div className="flex items-center gap-1"><Clock size={10} /> {a.readTime}</div>
                  <div className="flex items-center gap-1 text-[#FFB800]"><Zap size={10} /> {a.xpReward} XP</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* GLOSSARY */}
      {tab === 'glossary' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass flex-1 min-w-40">
              <Search size={14} className="text-white/40" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search terms..."
                className="bg-transparent text-sm outline-none flex-1" style={{ color: isDark ? '#fff' : '#0F172A' }}
                data-testid="glossary-search" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {glossaryCategories.slice(0, 6).map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${selectedCategory === cat ? 'bg-[#6C63FF] text-white' : 'glass text-white/50 hover:text-white'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/30 mb-3">{filteredGlossary.length} terms</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredGlossary.map((term, i) => (
              <motion.div key={term.term} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="glass p-4 rounded-2xl" data-testid={`glossary-${term.term}`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{term.term}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#6C63FF]/10 text-[#6C63FF]">{term.category}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#475569' }}>{term.definition}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DAILY QUIZ */}
      {tab === 'quiz' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass p-6 rounded-2xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#FFB800]/20 flex items-center justify-center">
                <Zap size={20} className="text-[#FFB800]" />
              </div>
              <div>
                <h2 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Daily Quiz</h2>
                <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>5 questions · +100 XP · Resets daily</p>
              </div>
              {quizDone && (
                <div className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#00FF88]/15 text-[#00FF88] text-xs font-bold">
                  <CheckCircle2 size={12} /> Completed today
                </div>
              )}
            </div>

            {quizDone && quizResult && (
              <div className="text-center py-6">
                <p className="text-5xl font-black mb-2" style={{ color: '#00FF88', fontFamily: 'Outfit, sans-serif' }}>
                  {quizResult.score?.toFixed(0)}%
                </p>
                <p className="text-lg font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                  {quizResult.correct}/{quizResult.total} correct
                </p>
                <p className="text-sm text-[#FFB800] mt-1">+{quizResult.xp_earned} XP earned!</p>
                <p className="text-xs text-white/40 mt-3">Come back tomorrow for a new quiz</p>
              </div>
            )}

            {quizDone && !quizResult && (
              <div className="text-center py-6">
                <CheckCircle2 size={40} className="mx-auto mb-3 text-[#00FF88]" />
                <p className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Already completed today!</p>
                <p className="text-sm text-white/40 mt-1">Come back tomorrow for a new quiz</p>
              </div>
            )}

            {!quizDone && quiz?.questions && (
              <div className="space-y-5">
                {quiz.questions.map((q, qIdx) => (
                  <div key={qIdx} className="border-b border-white/5 pb-5 last:border-0">
                    <p className="font-semibold text-sm mb-3" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                      <span className="text-[#6C63FF] mr-2">Q{qIdx + 1}.</span>{q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const selected = answers[qIdx] === optIdx;
                        return (
                          <button key={optIdx} onClick={() => setAnswers(a => ({ ...a, [qIdx]: optIdx }))}
                            data-testid={`daily-quiz-q${qIdx}-opt${optIdx}`}
                            className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${
                              selected
                                ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white font-medium'
                                : `border-white/10 ${isDark ? 'hover:bg-white/5 text-white/70' : 'hover:bg-black/5 text-[#475569]'}`
                            }`}>
                            <span className={`inline-block w-5 h-5 rounded-full border mr-2 text-xs text-center leading-5 ${selected ? 'bg-[#6C63FF] border-[#6C63FF] text-white' : 'border-white/20'}`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <motion.button onClick={submitQuiz}
                  disabled={Object.keys(answers).length < (quiz?.questions?.length || 5) || submitting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  data-testid="submit-daily-quiz"
                  className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, #FFB800, #FF8800)' }}>
                  {submitting ? 'Submitting...' : `Submit (${Object.keys(answers).length}/${quiz?.questions?.length || 5} answered)`}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* CRASH SIMULATOR */}
      {tab === 'crash' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
          <div className="glass p-6 rounded-2xl mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#FF4444]/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-[#FF4444]" />
              </div>
              <div>
                <h2 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Market Crash Simulator</h2>
                <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>
                  See how your paper portfolio would perform in historical crashes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {CRASH_OPTIONS.map(c => (
                <button key={c.id} onClick={() => setSelectedCrash(c.id)} data-testid={`crash-option-${c.id}`}
                  className={`p-4 rounded-xl text-left transition-all border glass ${selectedCrash === c.id ? 'border-[#FF4444]/40 bg-[#FF4444]/10' : 'border-white/5 hover:border-white/10'}`}>
                  <p className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{c.label}</p>
                  <p className="text-2xl font-black mt-1" style={{ color: c.color, fontFamily: 'Outfit, sans-serif' }}>{c.drop}%</p>
                </button>
              ))}
            </div>

            <motion.button onClick={simulateCrash} disabled={simulating}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              data-testid="run-crash-sim"
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #FF4444, #FF8800)' }}>
              <TrendingDown size={16} />
              {simulating ? 'Simulating...' : 'Simulate Crash on My Portfolio'}
            </motion.button>
          </div>

          {/* Crash results */}
          {crashResult && crashEvent && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass p-5 rounded-2xl border border-[#FF4444]/20">
                <h3 className="font-bold mb-1" style={{ color: isDark ? '#fff' : '#0F172A' }}>{crashEvent.name}</h3>
                <p className="text-sm mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{crashEvent.description}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Market Drop', value: `${crashEvent.market_drop_pct}%`, color: '#FF4444' },
                    { label: 'Duration', value: `${crashEvent.duration_months}mo`, color: '#FFB800' },
                    { label: 'Recovery', value: `${crashEvent.recovery_months}mo`, color: '#00FF88' },
                  ].map(s => (
                    <div key={s.label} className="glass p-3 rounded-xl text-center">
                      <p className="text-lg font-black" style={{ color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
                      <p className="text-[10px] text-white/40">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Portfolio Before', value: `₹${crashResult.portfolio_impact?.total_before?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '1,00,000'}` },
                    { label: 'Portfolio After', value: `₹${crashResult.portfolio_impact?.total_after?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '1,00,000'}` },
                  ].map(s => (
                    <div key={s.label} className="glass p-3 rounded-xl text-center">
                      <p className="text-xs text-white/40 mb-1">{s.label}</p>
                      <p className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                {(crashResult.portfolio_impact?.total_loss || 0) !== 0 && (
                  <div className="p-3 rounded-xl bg-[#FF4444]/10 border border-[#FF4444]/20 text-center">
                    <p className="text-sm font-bold text-[#FF4444]">
                      Simulated Loss: ₹{Math.abs(crashResult.portfolio_impact?.total_loss || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      {' '}({(crashResult.portfolio_impact?.total_loss_pct || 0).toFixed(1)}%)
                    </p>
                  </div>
                )}
                {crashResult.portfolio_impact?.total_invested === 0 && (
                  <div className="p-3 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-center">
                    <p className="text-sm text-[#00D4FF]">You have no stock holdings — only cash. Cash doesn't fall in market crashes!</p>
                  </div>
                )}
                <div className="mt-4 p-3 rounded-xl bg-white/3">
                  <p className="text-xs font-bold mb-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>India Impact</p>
                  <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>{crashEvent.india_impact}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LearnHub;
