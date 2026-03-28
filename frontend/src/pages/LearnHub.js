import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { GLOSSARY_TERMS, ARTICLES } from '../data/mockData';
import { BookOpen, Search, Zap, CheckCircle2, Clock, Star, ArrowLeft, ChevronRight } from 'lucide-react';

const LearnHub = () => {
  const { isDark, addXP } = useApp();
  const [tab, setTab] = useState('quiz');     // Start on quiz so it's first thing users see
  const [searchTerm, setSearchTerm] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizDone, setQuizDone] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    // Always check quiz status when component loads
    axios.get(`${API}/learn/daily-quiz`).then(r => {
      setQuiz(r.data);
      setQuizDone(r.data.already_completed);
    }).catch(() => {});
  }, []);

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
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
          Blogs &amp; Resources
        </h1>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
          Daily quiz, curated articles and investment glossary
        </p>
      </motion.div>

      {/* ── DAILY QUIZ CTA (always visible at top) ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {quizDone && quizResult ? (
          <div className="glass p-4 rounded-2xl mb-5 flex items-center gap-4 border border-[#00FF88]/20"
            style={{ background: 'rgba(0,255,136,0.05)' }}>
            <div className="w-12 h-12 rounded-xl bg-[#00FF88]/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} className="text-[#00FF88]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-[#00FF88]">Quiz Completed Today!</p>
              <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                {quizResult.correct}/{quizResult.total} correct · +{quizResult.xp_earned} XP earned · Come back tomorrow
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-[#00FF88]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {quizResult.score?.toFixed(0)}%
              </p>
            </div>
          </div>
        ) : quizDone ? (
          <div className="glass p-4 rounded-2xl mb-5 flex items-center gap-4 border border-[#00FF88]/20">
            <CheckCircle2 size={20} className="text-[#00FF88] flex-shrink-0" />
            <p className="text-sm text-[#00FF88] font-medium">Daily quiz completed — come back tomorrow for more XP!</p>
          </div>
        ) : (
          <button onClick={() => setTab('quiz')} data-testid="quiz-cta-banner"
            className={`w-full glass p-4 rounded-2xl mb-5 flex items-center gap-4 transition-all hover:bg-white/5 border ${tab === 'quiz' ? 'border-[#FFB800]/40' : 'border-transparent'}`}>
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#FFB800]/20 flex items-center justify-center">
                <Zap size={22} className="text-[#FFB800]" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF4444] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>Daily Quiz Available!</p>
              <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                5 questions · Up to +100 XP · Resets every midnight
              </p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FFB800, #FF8800)' }}>
              Take Quiz <ChevronRight size={14} />
            </div>
          </button>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl glass w-fit flex-wrap">
        {[
          { id: 'quiz', label: 'Daily Quiz', icon: Zap },
          { id: 'articles', label: 'Articles', icon: BookOpen },
          { id: 'glossary', label: 'Glossary', icon: Search },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`learn-tab-${t.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-[#6C63FF] text-white' : 'text-white/50 hover:text-white'}`}>
            <t.icon size={14} /> {t.label}
            {t.id === 'quiz' && !quizDone && <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800] animate-pulse" />}
          </button>
        ))}
      </div>

      {/* ── DAILY QUIZ TAB ── */}
      {tab === 'quiz' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass p-6 rounded-2xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#FFB800]/20 flex items-center justify-center">
                <Zap size={24} className="text-[#FFB800]" />
              </div>
              <div>
                <h2 className="font-bold text-lg" style={{ color: isDark ? '#fff' : '#0F172A' }}>Daily Quiz</h2>
                <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>
                  5 questions · Up to +100 XP · Resets every midnight
                </p>
              </div>
            </div>

            {quizDone && quizResult && (
              <div className="text-center py-8">
                <p className="text-6xl font-black mb-3" style={{ color: '#00FF88', fontFamily: 'Outfit, sans-serif' }}>
                  {quizResult.score?.toFixed(0)}%
                </p>
                <p className="text-xl font-bold mb-1" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                  {quizResult.correct}/{quizResult.total} correct
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFB800]/15 text-[#FFB800] font-bold mt-2">
                  <Zap size={14} /> +{quizResult.xp_earned} XP earned!
                </div>
                <p className="text-xs text-white/40 mt-4">Come back tomorrow for a new quiz</p>
              </div>
            )}

            {quizDone && !quizResult && (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="mx-auto mb-3 text-[#00FF88]" />
                <p className="font-bold text-lg" style={{ color: isDark ? '#fff' : '#0F172A' }}>Already completed today!</p>
                <p className="text-sm text-white/40 mt-1">Come back tomorrow for a new quiz</p>
              </div>
            )}

            {!quizDone && quiz?.questions && (
              <div className="space-y-6">
                {quiz.questions.map((q, qIdx) => (
                  <div key={qIdx} className={`pb-6 ${qIdx < quiz.questions.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <p className="font-semibold text-sm mb-4 leading-relaxed" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                      <span className="inline-block mr-2 px-2 py-0.5 rounded-lg bg-[#6C63FF]/20 text-[#6C63FF] text-xs font-bold">Q{qIdx + 1}</span>
                      {q.question}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const selected = answers[qIdx] === optIdx;
                        return (
                          <button key={optIdx} onClick={() => setAnswers(a => ({ ...a, [qIdx]: optIdx }))}
                            data-testid={`daily-quiz-q${qIdx}-opt${optIdx}`}
                            className={`text-left p-3.5 rounded-xl text-sm transition-all border-2 ${
                              selected
                                ? 'border-[#6C63FF] bg-[#6C63FF]/15 text-white font-medium'
                                : `border-white/8 ${isDark ? 'hover:border-white/20 text-white/70' : 'hover:border-[#6C63FF]/30 text-[#475569]'}`
                            }`}>
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 ${selected ? 'bg-[#6C63FF] text-white' : 'bg-white/8 text-white/40'}`}>
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
                  className="w-full py-3.5 rounded-xl font-bold text-white disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #FFB800, #FF8800)' }}>
                  <Zap size={16} />
                  {submitting ? 'Submitting...' : `Submit (${Object.keys(answers).length}/${quiz?.questions?.length || 5} answered)`}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── ARTICLES TAB ── */}
      {tab === 'articles' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {selectedArticle ? (
            <div className="max-w-3xl mx-auto">
              <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-sm text-[#6C63FF] hover:underline mb-5">
                <ArrowLeft size={14} /> Back to Articles
              </button>
              <div className="glass p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    selectedArticle.level === 'Beginner' ? 'bg-[#00FF88]/15 text-[#00FF88]' :
                    selectedArticle.level === 'Intermediate' ? 'bg-[#FFB800]/15 text-[#FFB800]' :
                    'bg-[#FF4444]/15 text-[#FF4444]'
                  }`}>{selectedArticle.level}</span>
                  <span className="text-xs text-white/40">{selectedArticle.category} · {selectedArticle.readTime}</span>
                  {selectedArticle.xpReward && (
                    <span className="text-xs text-[#FFB800] font-bold flex items-center gap-1"><Zap size={10} /> {selectedArticle.xpReward} XP</span>
                  )}
                </div>
                <h2 className="text-2xl font-black mb-6" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
                  {selectedArticle.title}
                </h2>
                <div className="prose prose-invert max-w-none">
                  {selectedArticle.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold mt-6 mb-2" style={{ color: isDark ? '#fff' : '#0F172A' }}>{line.slice(3)}</h3>;
                    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold mt-4 mb-1" style={{ color: isDark ? '#fff' : '#0F172A' }}>{line.slice(2, -2)}</p>;
                    if (line.startsWith('- ') || line.startsWith('• ')) return <li key={i} className="ml-4 text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>{line.slice(2)}</li>;
                    if (line === '') return <div key={i} className="h-2" />;
                    return <p key={i} className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : '#475569' }}>{line}</p>;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl glass">
                  <Search size={14} className="text-white/40" />
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search articles..."
                    className="bg-transparent text-sm outline-none flex-1" style={{ color: isDark ? '#fff' : '#0F172A' }} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArticles.map((a, i) => (
                  <motion.button key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedArticle(a)} data-testid={`article-${a.id}`}
                    className="glass p-5 rounded-2xl glass-hover cursor-pointer text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        a.level === 'Beginner' ? 'bg-[#00FF88]/15 text-[#00FF88]' :
                        a.level === 'Intermediate' ? 'bg-[#FFB800]/15 text-[#FFB800]' : 'bg-[#FF4444]/15 text-[#FF4444]'
                      }`}>{a.level}</span>
                      <span className="text-xs text-white/30">{a.category}</span>
                    </div>
                    <h3 className="font-bold text-sm leading-tight mb-2" style={{ color: isDark ? '#fff' : '#0F172A' }}>{a.title}</h3>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{a.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-white/30">
                      <div className="flex items-center gap-1"><Clock size={10} /> {a.readTime}</div>
                      {a.xpReward && <div className="flex items-center gap-1 text-[#FFB800]"><Zap size={10} /> {a.xpReward} XP</div>}
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ── GLOSSARY TAB ── */}
      {tab === 'glossary' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass flex-1 min-w-40">
              <Search size={14} className="text-white/40" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search investment terms..."
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
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{term.term}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#6C63FF]/10 text-[#6C63FF]">{term.category}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#475569' }}>{term.definition}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LearnHub;
