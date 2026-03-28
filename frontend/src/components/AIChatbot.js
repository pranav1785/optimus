import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { useLocation } from 'react-router-dom';
import { X, Send, Trash2, Zap, Bot } from 'lucide-react';

// Simple inline markdown renderer
const renderMarkdown = (text, isDark) => {
  if (!text) return null;
  const lines = text.split('\n');
  const result = [];
  let listBuffer = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      result.push(
        <ul key={`list-${result.length}`} className="list-disc pl-4 space-y-0.5 my-1.5">
          {listBuffer.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed">{parseInline(item, isDark)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const parseInline = (line, isDark) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**'))
        return <strong key={i} className="font-semibold" style={{ color: isDark ? '#fff' : '#1e293b' }}>{p.slice(2, -2)}</strong>;
      if (p.startsWith('`') && p.endsWith('`'))
        return <code key={i} className="px-1 py-0.5 rounded text-[#00D4FF] bg-white/5 text-xs font-mono">{p.slice(1, -1)}</code>;
      return p;
    });
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      flushList();
      const lvl = trimmed.startsWith('### ') ? 3 : trimmed.startsWith('## ') ? 2 : 1;
      const txt = trimmed.replace(/^#{1,3} /, '');
      result.push(
        <p key={i} className={`font-bold mt-2 mb-0.5 ${lvl === 1 ? 'text-[#6C63FF]' : 'text-sm'}`}
          style={{ color: lvl === 1 ? '#6C63FF' : isDark ? 'rgba(255,255,255,0.9)' : '#334155' }}>
          {txt}
        </p>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
    } else if (trimmed === '') {
      flushList();
      if (result.length > 0) result.push(<div key={i} className="h-1" />);
    } else {
      flushList();
      result.push(
        <p key={i} className="text-sm leading-relaxed">{parseInline(trimmed, isDark)}</p>
      );
    }
  });
  flushList();
  return result.length > 0 ? result : <p className="text-sm leading-relaxed">{parseInline(text, isDark)}</p>;
};

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m Optimus AI — your personal finance tutor. Ask me anything about investing, stocks, or finance terms! I\'m fluent in Indian markets. 🇮🇳' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark, chatSessionId, setChatSessionId } = useApp();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const pageContextMap = {
    '/dashboard': 'User is on the main dashboard viewing their portfolio overview',
    '/roadmap': 'User is on the gamified learning roadmap',
    '/trade': 'User is on the paper trading terminal',
    '/portfolio': 'User is viewing their portfolio holdings and P&L',
    '/analysis': 'User is using technical and fundamental analysis tools',
    '/algo-lab': 'User is in the Algo Trading Lab creating and backtesting strategies',
    '/community': 'User is on the community feed and leaderboard',
    '/arena': 'User is browsing trading competitions',
    '/learn': 'User is in the Learning Hub with articles, glossary and daily quiz',
    '/profile': 'User is viewing their profile with badges and achievements',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/chatbot/message`, {
        message: userMsg,
        session_id: chatSessionId,
        page_context: pageContextMap[location.pathname] || 'Optimus investment learning platform'
      });
      if (!chatSessionId) setChatSessionId(data.session_id);
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I had trouble connecting. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: 'bot', text: 'Chat cleared! Ask me anything about investing. 😊' }]);
    setChatSessionId(null);
  };

  return (
    <>
      {/* Click-outside backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Orb */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        data-testid="chatbot-orb"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50 w-14 h-14 rounded-full
          bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] shadow-xl chatbot-orb
          flex items-center justify-center"
        style={{ boxShadow: '0 0 20px rgba(108,99,255,0.5)' }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            data-testid="chatbot-panel"
            className={`fixed bottom-40 right-5 md:bottom-28 md:right-8 z-50 w-80 md:w-96 h-[480px] rounded-2xl flex flex-col overflow-hidden
              ${isDark ? 'bg-[#111]/95 border border-white/10' : 'bg-white/95 border border-black/5'} backdrop-blur-xl shadow-2xl`}
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(108,99,255,0.1)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#6C63FF]/20 to-[#00D4FF]/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>Optimus AI</p>
                <p className="text-xs text-[#00FF88]">Online · Finance Tutor</p>
              </div>
              <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-white/10 transition-all" title="Clear chat">
                <Trash2 size={14} className="text-white/40" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-3 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'chat-user text-white'
                      : `chat-bot ${isDark ? 'text-white/90' : 'text-[#0F172A]'}`
                  }`}>
                    {msg.role === 'bot' ? renderMarkdown(msg.text, isDark) : msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="chat-bot px-4 py-3 flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-white/10">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about investing, stocks, terms..."
                  rows={1}
                  data-testid="chatbot-input"
                  className={`flex-1 rounded-xl px-3 py-2 text-sm resize-none outline-none border transition-all
                    ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#6C63FF]/50' 
                             : 'bg-black/5 border-black/10 text-[#0F172A] placeholder-[#94a3b8] focus:border-[#6C63FF]/50'}`}
                  style={{ maxHeight: '80px' }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  data-testid="chatbot-send"
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                >
                  <Send size={14} className="text-white" />
                </motion.button>
              </div>
              <p className="text-xs text-center mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#94a3b8' }}>
                Powered by Claude · Educational only
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
