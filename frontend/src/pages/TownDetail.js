import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { TOWNS, INVESTOR_QUOTES } from '../data/mockData';
import InfoButton from '../components/InfoButton';
import { ChevronLeft, ChevronDown, ChevronUp, CheckCircle2, Lock, Star, Zap, BookOpen, Trophy, ChevronRight, X, Award } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const TOWN_ICON_MAP = { 'Coins': 'Coins', 'TrendingUp': 'TrendingUp', 'BarChart2': 'BarChart2', 'FileText': 'FileText', 'Activity': 'Activity', 'PieChart': 'PieChart', 'Zap': 'Zap', 'GitBranch': 'GitBranch', 'Gem': 'Gem', 'Cpu': 'Cpu', 'Layout': 'LayoutGrid', 'Code': 'Code2' };

const TownDetail = () => {
  const { townId } = useParams();
  const { isDark, addXP, refreshUser } = useApp();
  const town = TOWNS.find(t => t.id === parseInt(townId));
  const [progress, setProgress] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * INVESTOR_QUOTES.length));

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await axios.get(`${API}/roadmap/progress`);
        const p = data.find(p => p.town_id === parseInt(townId));
        setProgress(p);
      } catch (e) {}
    };
    fetchProgress();
  }, [townId]);

  if (!town) return (
    <div className="p-6 text-center">
      <p className="text-white/50">Town not found</p>
      <Link to="/roadmap" className="text-[#6C63FF] hover:underline mt-2 block">← Back to Roadmap</Link>
    </div>
  );

  const iconName = TOWN_ICON_MAP[town.icon] || 'Star';
  const TownIcon = LucideIcons[iconName] || LucideIcons.Star;
  const completedLessons = progress?.completed_lessons || [];
  const isLocked = progress?.status === 'locked';
  const isCompleted = progress?.status === 'completed';
  const canTakeQuiz = completedLessons.length >= town.lessons.length && !isCompleted;

  const completeLesson = async (lessonId, xpReward) => {
    if (completedLessons.includes(lessonId)) return;
    try {
      const { data } = await axios.post(`${API}/roadmap/${town.id}/lesson/${lessonId}`);
      setProgress(data);
      await addXP(0, ''); // Refresh user
      await refreshUser();
    } catch (e) {}
  };

  const handleQuizAnswer = (qIdx, answer) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: answer }));
  };

  const submitQuiz = async () => {
    if (Object.keys(selectedAnswers).length < town.quiz.length) return;
    setLoading(true);
    try {
      const answers = town.quiz.map((_, i) => selectedAnswers[i] ?? -1);
      const { data } = await axios.post(`${API}/roadmap/${town.id}/quiz`, { answers });
      setQuizResult(data);
      setShowResult(true);
      if (data.passed) {
        const { data: prog } = await axios.get(`${API}/roadmap/progress`);
        setProgress(prog.find(p => p.town_id === parseInt(townId)));
        await refreshUser();
      }
    } catch (e) {}
    setLoading(false);
  };

  const nextQuestion = () => { if (currentQ < town.quiz.length - 1) setCurrentQ(q => q + 1); };
  const prevQuestion = () => { if (currentQ > 0) setCurrentQ(q => q - 1); };

  const renderContent = (content) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-[#6C63FF] mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 mb-1 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>
          {line.substring(2).split('**').map((part, j) => j % 2 ? <strong key={j} style={{ color: isDark ? '#fff' : '#0F172A' }}>{part}</strong> : part)}
        </li>;
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>
        {line.split('**').map((part, j) => j % 2 ? <strong key={j} style={{ color: isDark ? '#fff' : '#0F172A' }}>{part}</strong> : part)}
      </p>;
    });
  };

  if (isLocked) return (
    <div className="p-6 max-w-2xl mx-auto text-center pt-20">
      <Link to="/roadmap" className="inline-flex items-center gap-1 text-[#6C63FF] hover:underline mb-8">
        <ChevronLeft size={16} /> Back to Roadmap
      </Link>
      <div className="glass p-10 rounded-2xl">
        <Lock size={48} className="mx-auto mb-4 text-white/20" />
        <h2 className="text-xl font-bold mb-2" style={{ color: isDark ? '#fff' : '#0F172A' }}>{town.name} is Locked</h2>
        <p className="text-sm text-white/50 mb-4">Complete the previous town first to unlock this one.</p>
        <Link to="/roadmap" className="px-6 py-3 rounded-xl bg-[#6C63FF] text-white font-semibold inline-block hover:bg-[#5A52D5] transition-all">
          Go to Roadmap
        </Link>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link to="/roadmap" className="p-2 rounded-xl glass glass-hover transition-all" data-testid="back-to-roadmap">
          <ChevronLeft size={18} style={{ color: isDark ? '#fff' : '#0F172A' }} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${town.color}20`, border: `1px solid ${town.color}30` }}>
            <TownIcon size={20} style={{ color: town.color }} />
          </div>
          <div>
            <h1 className="text-xl font-black" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
              Town {town.id}: {town.name}
            </h1>
            <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}>{town.description}</p>
          </div>
        </div>
        {isCompleted && (
          <div className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full bg-[#00FF88]/15 text-[#00FF88] text-xs font-bold">
            <CheckCircle2 size={12} /> Completed
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="glass p-4 rounded-2xl mb-6">
        <div className="flex justify-between text-xs mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
          <span>{completedLessons.length}/{town.lessons.length} lessons completed</span>
          <span className="flex items-center gap-1"><Zap size={10} className="text-[#FFB800]" /> {town.xpReward} XP reward</span>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${(completedLessons.length / town.lessons.length) * 100}%`, background: `linear-gradient(90deg, ${town.color}, #00D4FF)` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lessons */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-bold text-base mb-3 flex items-center gap-2" style={{ color: isDark ? '#fff' : '#0F172A' }}>
            <BookOpen size={16} className="text-[#6C63FF]" /> Lessons
          </h2>
          {town.lessons.map((lesson, i) => {
            const done = completedLessons.includes(lesson.id);
            const isExpanded = expandedLesson === lesson.id;
            return (
              <motion.div key={lesson.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`glass rounded-2xl overflow-hidden transition-all ${done ? 'border-[#00FF88]/20' : ''}`}
                style={done ? { borderColor: 'rgba(0,255,136,0.15)' } : {}}>
                <button
                  onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                  data-testid={`lesson-toggle-${lesson.id}`}
                  className="w-full flex items-center gap-3 p-4 text-left">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${done ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-white/5 text-white/40'}`}>
                    {done ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{lesson.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>{lesson.duration}</span>
                      <span className="text-xs flex items-center gap-0.5 text-[#FFB800]"><Zap size={9} />{lesson.xpReward} XP</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 overflow-hidden">
                      <div className="p-4">
                        <div className="prose prose-sm max-w-none space-y-1">
                          {renderContent(lesson.content)}
                        </div>
                        {/* Terms with InfoButtons */}
                        {lesson.terms && lesson.terms.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {lesson.terms.map(term => (
                              <div key={term} className="flex items-center px-2 py-1 rounded-lg bg-[#6C63FF]/10 border border-[#6C63FF]/20">
                                <span className="text-xs text-[#6C63FF] font-medium">{term}</span>
                                <InfoButton term={term} size="xs" />
                              </div>
                            ))}
                          </div>
                        )}
                        {!done && (
                          <button
                            onClick={() => completeLesson(lesson.id, lesson.xpReward)}
                            data-testid={`complete-lesson-${lesson.id}`}
                            className="mt-4 w-full py-2.5 rounded-xl font-semibold text-sm transition-all text-white"
                            style={{ background: `linear-gradient(135deg, ${town.color}, #00D4FF)` }}>
                            Mark as Complete (+{lesson.xpReward} XP)
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Quiz Section */}
          <div className="glass p-5 rounded-2xl mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                <Trophy size={16} className="text-[#FFB800]" /> Knowledge Quiz
              </h2>
              <div className="text-xs px-2 py-1 rounded-full bg-[#FFB800]/15 text-[#FFB800] font-bold">
                5 Questions · +200 XP
              </div>
            </div>

            {isCompleted ? (
              <div className="text-center py-4">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-[#00FF88]" />
                <p className="font-bold text-[#00FF88]">Quiz Passed!</p>
                <p className="text-xs text-white/40 mt-1">Score: {progress?.quiz_score?.toFixed(0)}%</p>
              </div>
            ) : !canTakeQuiz ? (
              <div className="text-center py-4">
                <Lock size={24} className="mx-auto mb-2 text-white/20" />
                <p className="text-sm text-white/40">Complete all {town.lessons.length} lessons to unlock the quiz</p>
              </div>
            ) : !quizMode ? (
              <div className="text-center py-4">
                <p className="text-sm text-white/60 mb-4">Score ≥70% to complete this town and unlock the next!</p>
                <button onClick={() => { setQuizMode(true); setCurrentQ(0); setSelectedAnswers({}); setQuizResult(null); setShowResult(false); }}
                  data-testid="start-quiz-btn"
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all"
                  style={{ background: `linear-gradient(135deg, ${town.color}, #00D4FF)` }}>
                  Start Quiz
                </button>
              </div>
            ) : showResult ? (
              <div className="text-center py-4">
                <div className={`text-5xl font-black mb-2 ${quizResult?.passed ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {quizResult?.score?.toFixed(0)}%
                </div>
                <p className={`font-bold text-lg mb-2 ${quizResult?.passed ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                  {quizResult?.passed ? 'Passed! Town Unlocked!' : 'Not quite. Try again!'}
                </p>
                <p className="text-sm text-white/50 mb-4">{quizResult?.correct}/{quizResult?.total} correct answers</p>
                {!quizResult?.passed && (
                  <button onClick={() => { setQuizMode(true); setCurrentQ(0); setSelectedAnswers({}); setShowResult(false); }}
                    className="px-5 py-2.5 rounded-xl bg-[#6C63FF] text-white font-semibold text-sm transition-all hover:bg-[#5A52D5]">
                    Retry Quiz
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                  <span>Question {currentQ + 1} of {town.quiz.length}</span>
                  <span>{Object.keys(selectedAnswers).length}/{town.quiz.length} answered</span>
                </div>
                <div className="xp-bar mb-4">
                  <div className="xp-bar-fill" style={{ width: `${((currentQ + 1) / town.quiz.length) * 100}%` }} />
                </div>
                <p className="font-semibold text-sm mb-4" style={{ color: isDark ? '#fff' : '#0F172A' }}>
                  {town.quiz[currentQ]?.q}
                </p>
                <div className="space-y-2 mb-4">
                  {town.quiz[currentQ]?.options?.map((opt, optIdx) => {
                    const selected = selectedAnswers[currentQ] === optIdx;
                    return (
                      <button key={optIdx} onClick={() => handleQuizAnswer(currentQ, optIdx)}
                        data-testid={`quiz-option-${optIdx}`}
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
                <div className="flex gap-2">
                  <button onClick={prevQuestion} disabled={currentQ === 0}
                    className="p-2 rounded-xl glass glass-hover disabled:opacity-30 transition-all">
                    <ChevronLeft size={16} style={{ color: isDark ? '#fff' : '#0F172A' }} />
                  </button>
                  {currentQ < town.quiz.length - 1 ? (
                    <button onClick={nextQuestion} className="flex-1 py-2.5 rounded-xl bg-[#6C63FF]/20 text-[#6C63FF] font-semibold text-sm hover:bg-[#6C63FF]/30 transition-all">
                      Next Question
                    </button>
                  ) : (
                    <button onClick={submitQuiz} disabled={Object.keys(selectedAnswers).length < town.quiz.length || loading}
                      data-testid="submit-quiz-btn"
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-40 transition-all"
                      style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
                      {loading ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Tips & Quote */}
        <div className="space-y-4">
          {/* Investor tip */}
          <div className="glass p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.05))' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-[#6C63FF] mb-3">Investor Wisdom</p>
            <blockquote className="text-sm leading-relaxed italic" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#0F172A' }}>
              "{INVESTOR_QUOTES[quoteIdx]?.quote}"
            </blockquote>
            <p className="text-xs mt-3 font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>
              — {INVESTOR_QUOTES[quoteIdx]?.author}
            </p>
          </div>

          {/* Town badge */}
          <div className="glass p-4 rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: `${town.color}20`, border: `2px solid ${town.color}40` }}>
              <Award size={28} style={{ color: town.color }} />
            </div>
            <p className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{town.badgeName}</p>
            <p className="text-xs text-white/40 mt-1">Complete quiz to earn this badge</p>
          </div>

          {/* Quick stats */}
          <div className="glass p-4 rounded-2xl">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
              Town Stats
            </p>
            {[
              { label: 'Lessons', value: town.lessons.length },
              { label: 'Quiz Questions', value: town.quiz.length },
              { label: 'XP Reward', value: `${town.xpReward} XP` },
              { label: 'Badge', value: town.badgeName },
            ].map((s, i) => (
              <div key={i} className="flex justify-between text-sm py-2 border-b border-white/5 last:border-0">
                <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{s.label}</span>
                <span className="font-medium" style={{ color: isDark ? '#fff' : '#0F172A' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TownDetail;
