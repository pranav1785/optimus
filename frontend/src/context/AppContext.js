import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();
export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'guest-001', name: 'Arjun Mehta', college: 'IIT Bombay',
    xp: 450, level: 2, virtual_balance: 100000, badges: ['first_login']
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('optimus-theme') || 'dark');
  const [portfolio, setPortfolio] = useState({ total_portfolio_value: 100000, cash_balance: 100000, total_pnl: 0, total_pnl_pct: 0 });
  const [notifications, setNotifications] = useState([]);
  const [chatSessionId, setChatSessionId] = useState(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0a';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F8F9FF';
      document.body.style.color = '#0F172A';
    }
    localStorage.setItem('optimus-theme', theme);
  }, [theme]);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/user`);
      setUser(data);
    } catch (e) { console.error('Failed to fetch user', e); }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/portfolio`);
      setPortfolio(data);
    } catch (e) { console.error('Failed to fetch portfolio', e); }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/notifications`);
      setNotifications(data);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchUser();
    fetchPortfolio();
    fetchNotifications();
  }, [fetchUser, fetchPortfolio, fetchNotifications]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const addXP = async (amount, reason = '') => {
    try {
      const { data } = await axios.patch(`${API}/user/xp`, { xp_amount: amount, reason });
      setUser(data);
    } catch (e) {}
  };

  const refreshPortfolio = () => fetchPortfolio();
  const refreshUser = () => fetchUser();

  const isDark = theme === 'dark';
  const glassClass = isDark
    ? 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl'
    : 'bg-white/80 backdrop-blur-xl border border-black/5 rounded-2xl shadow-sm';

  return (
    <AppContext.Provider value={{
      user, setUser, theme, toggleTheme, isDark,
      portfolio, setPortfolio, refreshPortfolio, refreshUser,
      notifications, glassClass, addXP,
      chatSessionId, setChatSessionId,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
