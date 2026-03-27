import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Map, BarChart2, Bot, Trophy, Users, BookOpen, FlaskConical, ArrowRight, Zap, Star, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  { icon: Map, title: "Gamified Learning Roadmap", description: "12 towns, each mastering one asset class. Earn XP, unlock badges, and progress like a game.", color: "#6C63FF" },
  { icon: TrendingUp, title: "Paper Trading Simulator", description: "Trade NSE stocks, crypto, futures & options with ₹1 Lakh virtual money. Zero risk, real experience.", color: "#00D4FF" },
  { icon: BarChart2, title: "Technical & Fundamental Analysis", description: "Professional-grade charts with RSI, MACD, Bollinger Bands. Full fundamental data for every stock.", color: "#00FF88" },
  { icon: FlaskConical, title: "Algo Trading Lab", description: "Write strategies, backtest on historical data, run Monte Carlo simulations. No PhD required.", color: "#FFB800" },
  { icon: Trophy, title: "Competitions & Tournaments", description: "Join college-level trading competitions. Show your skills. Win recognition.", color: "#FF4444" },
  { icon: Users, title: "Community & Leaderboard", description: "Share trade ideas, learn from peers, compete on the all-India leaderboard.", color: "#9B59B6" },
  { icon: Bot, title: "AI Finance Tutor", description: "Claude-powered chatbot answers every finance question in plain English, with Indian market context.", color: "#00D4FF" },
  { icon: BookOpen, title: "Learning Hub", description: "Articles, glossary, daily quizzes, and investor quotes. Knowledge that compounds.", color: "#00FF88" },
];

const STATS = [
  { value: "12", label: "Learning Towns", suffix: "" },
  { value: "1L", label: "Virtual Trading Fund", suffix: "₹" },
  { value: "20+", label: "NSE Stocks", suffix: "" },
  { value: "6", label: "Asset Classes", suffix: "" },
];

const STEPS = [
  { step: "01", title: "Pick Your Starting Point", description: "Tell us your experience level. We'll place you on the right town on the learning roadmap." },
  { step: "02", title: "Learn & Trade Simultaneously", description: "Each town teaches you a concept AND lets you practice it with paper trades. Theory meets practice." },
  { step: "03", title: "Level Up & Compete", description: "Earn XP, unlock badges, beat the leaderboard. The same principles that make games addictive, applied to investing." },
];

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-black gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>OPTIMUS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" data-testid="nav-enter-app"
              className="px-5 py-2.5 rounded-xl bg-[#6C63FF] text-white text-sm font-semibold hover:bg-[#5A52D5] transition-all hover:shadow-lg"
              style={{ boxShadow: '0 0 0 0 rgba(108,99,255,0.5)' }}>
              Start Learning Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated bg */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#6C63FF]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#00D4FF]/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C63FF]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#6C63FF]/30 text-sm text-[#6C63FF] font-medium mb-6">
              <Star size={14} className="text-[#FFB800]" />
              India's #1 Gamified Finance Learning Platform
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Invest Like a{' '}
            <span className="gradient-text">Pro</span>
            {', '}
            <br />
            Learn Like a{' '}
            <span className="gradient-text-green">Game</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Master investing from scratch — stocks, crypto, options, algo trading — through a gamified journey with paper trading, AI tutoring, and real NSE/BSE data.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/dashboard" data-testid="hero-cta-btn"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white font-bold text-lg hover:scale-105 transition-all"
              style={{ boxShadow: '0 0 40px rgba(108,99,255,0.4)' }}>
              Start Learning Free
              <ArrowRight size={20} />
            </Link>
            <Link to="/roadmap" data-testid="hero-roadmap-btn"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/15 text-white/80 font-semibold hover:bg-white/5 transition-all">
              <Map size={20} />
              View Roadmap
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-white/40"
          >
            {['No credit card required', 'Start with ₹1 Lakh virtual money', 'Zero real money at risk'].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#00FF88]" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="text-4xl font-black gradient-text mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stat.suffix}{stat.value}
                </div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Everything You Need to{' '}
              <span className="gradient-text">Master Investing</span>
            </h2>
            <p className="text-white/50 text-lg">From zero to portfolio manager, all in one place.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass p-5 rounded-2xl glass-hover">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white/2">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              How <span className="gradient-text">Optimus</span> Works
            </h2>
          </motion.div>
          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                className="glass p-6 rounded-2xl flex items-start gap-6">
                <div className="text-4xl font-black gradient-text flex-shrink-0" style={{ fontFamily: 'Outfit, sans-serif' }}>{step.step}</div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-white/55 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ready to Start Your <span className="gradient-text">Investing Journey?</span>
            </h2>
            <p className="text-white/50 mb-8">Join thousands of college students learning to invest smartly. No experience needed.</p>
            <Link to="/dashboard" data-testid="footer-cta-btn"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white font-bold text-lg hover:scale-105 transition-all"
              style={{ boxShadow: '0 0 40px rgba(108,99,255,0.4)' }}>
              Enter Optimus <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap size={14} className="text-[#6C63FF]" />
          <span className="font-semibold text-white/50">OPTIMUS</span>
        </div>
        <p>For educational purposes only. Not investment advice. Paper trading with virtual money.</p>
      </footer>
    </div>
  );
};

export default Landing;
