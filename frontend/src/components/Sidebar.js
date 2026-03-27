import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Map, TrendingUp, PieChart, BarChart2,
  FlaskConical, Users, Trophy, BookOpen, User, Settings,
  Sun, Moon, Bell, ChevronRight, Zap
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/roadmap', icon: Map, label: 'Roadmap' },
  { path: '/trade', icon: TrendingUp, label: 'Trade' },
  { path: '/portfolio', icon: PieChart, label: 'Portfolio' },
  { path: '/analysis', icon: BarChart2, label: 'Analysis' },
  { path: '/algo-lab', icon: FlaskConical, label: 'Algo Lab' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/arena', icon: Trophy, label: 'Arena' },
  { path: '/learn', icon: BookOpen, label: 'Learn' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, theme, toggleTheme, notifications, isDark, portfolio } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;
  const xpForNextLevel = user.level * 500;
  const xpProgress = ((user.xp % 500) / 500) * 100;
  const glassStyle = isDark
    ? 'bg-black/60 backdrop-blur-xl border-r border-white/10'
    : 'bg-white/80 backdrop-blur-xl border-r border-black/5 shadow-lg';

  return (
    <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-full w-64 z-40 ${glassStyle}`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center glow-indigo">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-xl font-black gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
            OPTIMUS
          </span>
        </Link>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="glass p-3 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center font-bold text-white text-sm">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: isDark ? '#fff' : '#0F172A' }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{user.college}</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFB800] to-[#FF8800] flex items-center justify-center text-xs font-bold text-white animate-[level-glow_3s_ease-in-out_infinite]">
              {user.level}
            </div>
          </div>
          {/* XP Bar */}
          <div className="xp-bar mb-1">
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} data-testid="xp-progress-bar" />
          </div>
          <div className="flex justify-between text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>
            <span>{user.xp} XP</span>
            <span>Level {user.level + 1}: {xpForNextLevel} XP</span>
          </div>
          {/* Balance */}
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>Balance:</span>
            <span className="text-xs font-semibold text-[#00FF88]">
              ₹{(portfolio.total_portfolio_value || 100000).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              data-testid={`sidebar-nav-${label.toLowerCase().replace(' ', '-')}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all group ${
                active
                  ? 'bg-[#6C63FF]/20 border border-[#6C63FF]/30 text-[#6C63FF]'
                  : `hover:bg-white/5 ${isDark ? 'text-white/60 hover:text-white' : 'text-[#475569] hover:text-[#0F172A]'}`
              }`}
            >
              <Icon size={18} className={active ? 'text-[#6C63FF]' : ''} />
              <span className="text-sm font-medium flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-[#6C63FF]" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-2">
        <button onClick={toggleTheme} data-testid="theme-toggle"
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all glass glass-hover ${isDark ? 'text-white/60' : 'text-[#475569]'}`}>
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div className="relative">
          <button className={`p-2 rounded-xl glass glass-hover transition-all ${isDark ? 'text-white/60' : 'text-[#475569]'}`}
            data-testid="notifications-btn">
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF4444] text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
