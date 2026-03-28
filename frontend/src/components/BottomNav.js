import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Map, TrendingUp, PieChart, Users, BookOpen, Trophy, FlaskConical } from 'lucide-react';

const tabs = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/roadmap',   icon: Map,             label: 'Learn' },
  { path: '/trade',     icon: TrendingUp,      label: 'Trade' },
  { path: '/community', icon: Users,           label: 'Social' },
  { path: '/learn',     icon: BookOpen,        label: 'Blogs' },
];

const BottomNav = () => {
  const location = useLocation();
  const { isDark } = useApp();

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${isDark ? 'bg-[#111]/90 border-white/10' : 'bg-white/90 border-black/5'} backdrop-blur-xl border-t`}
      data-testid="bottom-nav">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link key={path} to={path} data-testid={`bottom-nav-${label.toLowerCase()}`}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                active ? 'text-[#6C63FF]' : isDark ? 'text-white/40' : 'text-[#94a3b8]'
              }`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
              {active && <div className="absolute bottom-0 w-1 h-1 rounded-full bg-[#6C63FF]" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
