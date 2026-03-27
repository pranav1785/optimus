import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import TownDetail from './pages/TownDetail';
import TradingTerminal from './pages/TradingTerminal';
import Portfolio from './pages/Portfolio';
import Analysis from './pages/Analysis';
import AlgoLab from './pages/AlgoLab';
import Community from './pages/Community';
import Arena from './pages/Arena';
import LearnHub from './pages/LearnHub';
import Profile from './pages/Profile';
import './App.css';

const AppContent = () => {
  const { theme } = useApp();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.style.backgroundColor = theme === 'dark' ? '#0a0a0a' : '#F8F9FF';
    document.body.style.color = theme === 'dark' ? '#fff' : '#0F172A';
  }, [theme]);
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/roadmap" element={<Layout><Roadmap /></Layout>} />
      <Route path="/roadmap/:townId" element={<Layout><TownDetail /></Layout>} />
      <Route path="/trade" element={<Layout><TradingTerminal /></Layout>} />
      <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />
      <Route path="/analysis" element={<Layout><Analysis /></Layout>} />
      <Route path="/algo-lab" element={<Layout><AlgoLab /></Layout>} />
      <Route path="/community" element={<Layout><Community /></Layout>} />
      <Route path="/arena" element={<Layout><Arena /></Layout>} />
      <Route path="/learn" element={<Layout><LearnHub /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
