import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import AIChatbot from './AIChatbot';
import { useApp } from '../context/AppContext';

const Layout = ({ children }) => {
  const { isDark } = useApp();
  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#F8F9FF] text-[#0F172A]'}`}>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </div>
      <BottomNav />
      <AIChatbot />
    </div>
  );
};

export default Layout;
