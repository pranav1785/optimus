import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useApp, API } from '../context/AppContext';
import { Heart, Send, Users, Trophy, TrendingUp, Star, Plus, X, Filter } from 'lucide-react';

const TOPICS = [
  { id: 'all', label: 'All' },
  { id: 'equity_trading', label: 'Trading' },
  { id: 'technical_analysis', label: 'Technical' },
  { id: 'mutual_funds', label: 'Mutual Funds' },
  { id: 'algo_trading', label: 'Algo' },
  { id: 'fundamental_analysis', label: 'Fundamental' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'general', label: 'General' },
];

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const PostCard = ({ post, onLike, isDark }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className="glass p-5 rounded-2xl" data-testid={`post-${post.post_id}`}>
    <div className="flex items-start gap-3 mb-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
        {post.username?.charAt(0) || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>{post.username}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#6C63FF]/10 text-[#6C63FF]">{post.college}</span>
          <span className="text-xs text-white/30 ml-auto">{timeAgo(post.created_at)}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 mt-0.5 inline-block">
          {TOPICS.find(t => t.id === post.topic)?.label || post.topic}
        </span>
      </div>
    </div>
    <p className="text-sm leading-relaxed mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : '#334155' }}>
      {post.content}
    </p>
    <div className="flex items-center gap-4">
      <button onClick={() => onLike(post.post_id)} data-testid={`like-btn-${post.post_id}`}
        className={`flex items-center gap-1.5 text-xs font-medium transition-all hover:scale-105 ${post.is_liked ? 'text-[#FF4444]' : 'text-white/40 hover:text-[#FF4444]'}`}>
        <Heart size={14} fill={post.is_liked ? '#FF4444' : 'none'} />
        {post.like_count || 0}
      </button>
      <span className="text-xs text-white/30">{post.comments_count} replies</span>
    </div>
  </motion.div>
);

const Community = () => {
  const { isDark, user } = useApp();
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [topic, setTopic] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', topic: 'general' });
  const [posting, setPosting] = useState(false);
  const [activeView, setActiveView] = useState('feed');

  useEffect(() => {
    fetchPosts();
    fetchLeaderboard();
  }, [topic]);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(`${API}/community/posts?topic=${topic}`);
      setPosts(data);
    } catch (e) {}
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get(`${API}/community/leaderboard`);
      setLeaderboard(data.leaderboard || []);
    } catch (e) {}
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await axios.post(`${API}/community/posts/${postId}/like`);
      setPosts(prev => prev.map(p => p.post_id === postId
        ? { ...p, like_count: data.like_count, is_liked: data.action === 'liked' }
        : p
      ));
    } catch (e) {}
  };

  const handlePost = async () => {
    if (!newPost.content.trim()) return;
    setPosting(true);
    try {
      const { data } = await axios.post(`${API}/community/posts`, newPost);
      setPosts(prev => [data, ...prev]);
      setNewPost({ content: '', topic: 'general' });
      setShowCreate(false);
    } catch (e) {}
    setPosting(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: isDark ? '#fff' : '#0F172A' }}>
          Community
        </h1>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
          Share insights, discuss strategies, and learn from fellow investors
        </p>
      </motion.div>

      {/* View toggle */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl glass w-fit">
        {[{ id: 'feed', icon: Users, label: 'Feed' }, { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' }].map(v => (
          <button key={v.id} onClick={() => setActiveView(v.id)} data-testid={`community-view-${v.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === v.id ? 'bg-[#6C63FF] text-white' : 'text-white/50 hover:text-white'}`}>
            <v.icon size={14} /> {v.label}
          </button>
        ))}
      </div>

      {activeView === 'feed' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Feed */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {TOPICS.map(t => (
                <button key={t.id} onClick={() => setTopic(t.id)} data-testid={`topic-filter-${t.id}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${topic === t.id ? 'bg-[#6C63FF] text-white' : 'glass hover:bg-white/8 text-white/50 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Create post button */}
            <button onClick={() => setShowCreate(true)} data-testid="create-post-btn"
              className="w-full glass p-4 rounded-2xl flex items-center gap-3 hover:bg-white/5 transition-all text-left">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                {user.name?.charAt(0) || 'A'}
              </div>
              <span className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
                Share an insight, trade idea, or question...
              </span>
              <Plus size={16} className="ml-auto text-[#6C63FF] flex-shrink-0" />
            </button>

            {/* Posts */}
            {posts.map(post => (
              <PostCard key={post.post_id} post={post} onLike={handleLike} isDark={isDark} />
            ))}
            {posts.length === 0 && (
              <div className="glass p-10 rounded-2xl text-center">
                <Users size={32} className="mx-auto mb-3 text-white/20" />
                <p className="text-sm text-white/40">No posts yet in this topic. Be the first to share!</p>
              </div>
            )}
          </div>

          {/* Mini leaderboard sidebar */}
          <div className="lg:w-72 flex-shrink-0 space-y-4">
            <div className="glass p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-[#FFB800]" />
                <h3 className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#0F172A' }}>Top Traders</h3>
              </div>
              {leaderboard.slice(0, 5).map((u, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <span className={`w-5 text-xs font-black text-center ${i === 0 ? 'text-[#FFB800]' : i === 1 ? 'text-white/60' : i === 2 ? 'text-[#F4A460]' : 'text-white/30'}`}>
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#6C63FF]/20 flex items-center justify-center text-xs font-bold text-[#6C63FF] flex-shrink-0">
                    {u.username?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: isDark ? '#fff' : '#0F172A' }}>{u.username}</p>
                    <p className="text-[10px] text-white/30 truncate">{u.college}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#00FF88]">+{u.portfolio_return}%</p>
                    <p className="text-[10px] text-[#FFB800]">{u.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="glass p-4 rounded-2xl">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>Community Stats</p>
              {[
                { label: 'Active Traders', value: '2,847' },
                { label: 'Posts Today', value: '134' },
                { label: 'Strategies Shared', value: '423' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>{s.label}</span>
                  <span className="font-bold text-[#6C63FF]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'leaderboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-[#FFB800]" />
                <h2 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Global Leaderboard</h2>
              </div>
              <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}>Ranked by portfolio returns this month</p>
            </div>
            <div className="divide-y divide-white/5">
              {leaderboard.map((u, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 transition-all hover:bg-white/3 ${i < 3 ? 'bg-gradient-to-r from-[#FFB800]/5 to-transparent' : ''}`}
                  data-testid={`leaderboard-row-${i}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    i === 0 ? 'bg-[#FFB800] text-black' : i === 1 ? 'bg-white/20 text-white' : i === 2 ? 'bg-[#F4A460]/30 text-[#F4A460]' : 'bg-white/5 text-white/40'
                  }`}>{i + 1}</div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {u.username?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: isDark ? '#fff' : '#0F172A' }}>{u.username}</p>
                    <p className="text-xs text-white/40 truncate">{u.college}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-white/40">Portfolio Return</p>
                      <p className="font-bold text-[#00FF88]">+{u.portfolio_return}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">XP</p>
                      <p className="font-bold text-[#FFB800]">{u.xp.toLocaleString()}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-white/40">Level</p>
                      <p className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>{u.level}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="relative glass p-6 rounded-2xl w-full max-w-lg"
              style={{ background: isDark ? 'rgba(17,17,17,0.97)' : 'rgba(255,255,255,0.97)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold" style={{ color: isDark ? '#fff' : '#0F172A' }}>Share with Community</h3>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                  <X size={16} style={{ color: isDark ? '#fff' : '#0F172A' }} />
                </button>
              </div>
              <textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                placeholder="Share an insight, trade idea, or question... Tag with # for better reach"
                rows={4} data-testid="post-content-input"
                className={`w-full rounded-xl px-4 py-3 text-sm resize-none outline-none border transition-all mb-4 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-[#0F172A] placeholder-[#94a3b8]'} focus:border-[#6C63FF]/50`} />
              <div className="flex gap-3 items-center">
                <select value={newPost.topic} onChange={e => setNewPost(p => ({ ...p, topic: e.target.value }))}
                  data-testid="post-topic-select"
                  className={`flex-1 px-3 py-2 rounded-xl text-sm outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/10 text-[#0F172A]'}`}>
                  {TOPICS.filter(t => t.id !== 'all').map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <motion.button onClick={handlePost} disabled={!newPost.content.trim() || posting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  data-testid="submit-post-btn"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
                  <Send size={14} />
                  {posting ? 'Posting...' : 'Post'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
