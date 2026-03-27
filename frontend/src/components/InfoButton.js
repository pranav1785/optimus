import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { INFO_DEFINITIONS } from '../data/mockData';
import { X, Sparkles } from 'lucide-react';

const InfoButton = ({ term, definition, formula, example, size = 'sm' }) => {
  const [open, setOpen] = useState(false);
  const { isDark } = useApp();
  
  // Look up from INFO_DEFINITIONS if not provided directly
  const info = INFO_DEFINITIONS[term] || {};
  const def = definition || info.definition || `${term} is an important financial concept used in investment analysis.`;
  const form = formula || info.formula;
  const ex = example || info.example;

  const sizeClass = size === 'xs' ? 'w-3.5 h-3.5 text-[9px]' : 'w-4 h-4 text-[10px]';

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        data-testid={`info-btn-${term?.toLowerCase().replace(/[\s/()]/g, '-')}`}
        className={`inline-flex items-center justify-center ${sizeClass} rounded-full font-bold transition-all ml-1 flex-shrink-0
          ${isDark ? 'bg-white/10 text-white/50 hover:bg-[#6C63FF]/40 hover:text-white' 
                   : 'bg-black/8 text-[#475569] hover:bg-[#6C63FF]/20 hover:text-[#6C63FF]'}`}
      >
        i
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
            <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              onClick={e => e.stopPropagation()}
              className={`relative w-full max-w-sm rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-[#18181b] border border-white/10' : 'bg-white border border-black/5'}`}
              style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(108,99,255,0.15)' }}
            >
              <button onClick={() => setOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-all">
                <X size={16} className="text-white/40" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center">
                  <Sparkles size={13} className="text-white" />
                </div>
                <h3 className="font-bold text-lg gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>{term}</h3>
              </div>

              <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-white/75' : 'text-[#475569]'}`}>{def}</p>

              {form && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1.5">Formula</p>
                  <p className="text-[#00D4FF] font-mono text-xs leading-relaxed">{form}</p>
                </div>
              )}

              {ex && (
                <div className="bg-[#6C63FF]/10 border border-[#6C63FF]/20 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[#6C63FF]/60 mb-1.5">Indian Market Example</p>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-white/70' : 'text-[#475569]'}`}>{ex}</p>
                </div>
              )}

              <button onClick={() => setOpen(false)}
                className="mt-4 w-full py-2 rounded-xl text-sm font-medium transition-all glass glass-hover"
                style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }}>
                Got it!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InfoButton;
