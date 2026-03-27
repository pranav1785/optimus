# Optimus — Gamified Paper Trading & Investment Learning Platform
## PRD & Architecture Document

---

## Problem Statement

Build a full-stack, fully functional, production-grade web application called **"Optimus"** — a gamified paper trading and investment learning platform designed for **Indian college students**.

---

## User Persona
- **Primary User**: Indian college students (18–24) with little or no investment knowledge
- **Goal**: Learn investing through gamification, paper trading, and community
- **Context**: Zero financial risk environment with virtual ₹1,00,000 balance

---

## Core Requirements (User Decisions)

1. **AI Integration**: Emergent Universal Key (Claude Sonnet 4.5 via emergentintegrations)
2. **Market Data**: Free APIs / mock data for BSE/NSE stocks only (no crypto/international for now)
3. **Authentication**: NONE — No login/signup/JWT. Single guest user (`guest-001`)
4. **All Features**: Implement all listed features
5. **Leaderboard**: Embedded in Community and Arena pages (not a separate page)
6. **Profile**: Read-only for now

---

## Application Architecture

```
/app/
├── backend/
│   ├── server.py           # FastAPI backend with ALL API endpoints
│   └── .env                # MONGO_URL, DB_NAME, EMERGENT_LLM_KEY, CORS_ORIGINS
├── frontend/
│   ├── tailwind.config.js  # Dark glassmorphism theme
│   ├── src/
│   │   ├── index.css / App.css   # Global dark styles, glass utility classes
│   │   ├── App.js               # React Router with all 12 routes
│   │   ├── context/AppContext.js # Global state (user, portfolio, theme)
│   │   ├── data/mockData.js      # TOWNS (12), ARTICLES, GLOSSARY_TERMS, etc.
│   │   ├── components/
│   │   │   ├── Layout.js         # Sidebar + BottomNav + AIChatbot wrapper
│   │   │   ├── Sidebar.js        # Desktop navigation
│   │   │   ├── BottomNav.js      # Mobile navigation
│   │   │   ├── AIChatbot.js      # Floating AI chatbot (Claude)
│   │   │   └── InfoButton.js     # Term definition tooltips
│   │   └── pages/
│   │       ├── Landing.js        # Hero landing page
│   │       ├── Dashboard.js      # Main dashboard with metrics
│   │       ├── Roadmap.js        # 12-town learning path grid
│   │       ├── TownDetail.js     # Lesson content + quiz flow
│   │       ├── TradingTerminal.js # Paper trading with charts
│   │       ├── Portfolio.js      # Holdings, P&L, trade history
│   │       ├── Analysis.js       # Technical + Fundamental analysis
│   │       ├── AlgoLab.js        # Strategy backtest runner
│   │       ├── Community.js      # Social feed + embedded leaderboard
│   │       ├── Arena.js          # Competitions + embedded leaderboard
│   │       ├── LearnHub.js       # Articles, glossary, daily quiz, crash sim
│   │       └── Profile.js        # User stats, badges, progress (read-only)
└── memory/
    ├── PRD.md              # This file
    └── test_credentials.md  # N/A (no auth)
```

---

## Tech Stack
- **Frontend**: React.js, TailwindCSS, Framer Motion, Recharts, Lucide React
- **Backend**: FastAPI (Python), Motor (async MongoDB)
- **Database**: MongoDB (Motor Async)
- **AI**: emergentintegrations → Claude Sonnet 4.5 (via Emergent LLM Key)
- **Charts**: Recharts (AreaChart, BarChart, PieChart)
- **Design**: Dark mode first (#0a0a0a), Glassmorphism, Outfit + Inter fonts

---

## Design System
- **Colors**: 
  - Brand: `#6C63FF` (Indigo), `#00D4FF` (Cyan)
  - Signal: `#00FF88` (Green/Profit), `#FF4444` (Red/Loss), `#FFB800` (Amber/XP)
  - Background: `#0a0a0a` (dark), `#F8F9FF` (light)
- **Glass**: `.glass` class — backdrop-blur, semi-transparent border
- **Fonts**: Outfit (headings), Inter (body), JetBrains Mono (code)

---

## Key API Endpoints (Backend `/api/` prefix)

| Endpoint | Method | Description |
|---|---|---|
| `/user` | GET | Get guest user profile |
| `/user/xp` | PATCH | Update XP + recalculate level |
| `/market/stocks` | GET | All NSE stocks with live prices |
| `/market/stocks/{symbol}/chart` | GET | OHLCV data (1D/1W/1M/3M/1Y) |
| `/analysis/stock/{symbol}` | GET | Technical + fundamental analysis |
| `/portfolio` | GET | Holdings, P&L, cash balance |
| `/portfolio/trade` | POST | Execute BUY/SELL paper trade |
| `/portfolio/trades` | GET | Trade history |
| `/portfolio/reset` | DELETE | Reset to ₹1,00,000 |
| `/roadmap/progress` | GET | All 12 towns progress |
| `/roadmap/{id}/lesson/{lid}` | POST | Complete a lesson (+50 XP) |
| `/roadmap/{id}/quiz` | POST | Submit quiz (pass ≥70% → unlock next) |
| `/community/posts` | GET | Filtered community posts |
| `/community/posts` | POST | Create new post (+25 XP) |
| `/community/posts/{id}/like` | POST | Like/unlike toggle |
| `/community/leaderboard` | GET | Top 10 traders |
| `/competitions` | GET | All competitions |
| `/competitions` | POST | Create competition |
| `/competitions/{id}/join` | POST | Join a competition |
| `/algo/strategies` | GET | Pre-built + user strategies |
| `/algo/backtest` | POST | Run historical backtest |
| `/learn/daily-quiz` | GET | Today's quiz questions |
| `/learn/daily-quiz/submit` | POST | Submit quiz (+XP) |
| `/market/crash-simulation` | POST | Portfolio crash impact simulation |
| `/chatbot/message` | POST | AI chatbot (Claude Sonnet 4.5) |
| `/notifications` | GET | User notifications |

---

## Database Schema (MongoDB)

```
users: { user_id, name, college, xp, level, badges[], virtual_balance, created_at }
portfolios: { portfolio_id, user_id, cash_balance, competition_id }
holdings: { holding_id, portfolio_id, symbol, asset_type, quantity, avg_buy_price }
trades: { trade_id, portfolio_id, symbol, side, order_type, quantity, price, total_value, timestamp }
town_progress: { user_id, town_id, status[locked|unlocked|in_progress|completed], completed_lessons[], quiz_score, xp_earned, completed_at }
community_posts: { post_id, user_id, username, college, content, topic, likes[], comments_count, created_at }
competitions: { comp_id, name, description, start_date, end_date, status, participants[], prize }
strategies: { strategy_id, user_id, name, code, strategy_type, backtest_results }
daily_quiz_completions: { user_id, date, score, xp_earned }
chat_sessions: { session_id, last_active }
```

---

## Gamification System

| Action | XP Earned |
|---|---|
| Complete a lesson | +50 XP |
| Pass town quiz (≥70%) | +200 XP |
| Execute a paper trade | +10 XP |
| Create community post | +25 XP |
| Daily quiz completion | Up to +100 XP |
| Run a backtest | +25 XP |

**Leveling**: `level = 1 + (total_xp // 500)`  
**Badges**: Earned per town completion → `town_{N}_master`

---

## Implementation Status (Updated: March 2026)

### Completed ✅
- [x] Backend: All FastAPI routes, MongoDB integration, mock data engine
- [x] Frontend: App.js routing for all 12 pages
- [x] Landing page (hero)
- [x] Dashboard (portfolio metrics, XP card, quick actions, ticker)
- [x] Roadmap (12-town grid with progress rings)
- [x] TownDetail (lesson accordion, quiz flow, badge reward)
- [x] TradingTerminal (stock chart, order form, MA indicators)
- [x] Portfolio (holdings table, pie chart, trade history, reset)
- [x] Analysis (technical: RSI/MACD/BB; fundamental: ratios/income/analysts)
- [x] AlgoLab (strategy picker, backtest config, equity curve, trade log)
- [x] Community (feed, create post, topic filters, like, embedded leaderboard)
- [x] Arena (competitions, join, create, embedded leaderboard)
- [x] LearnHub (articles, glossary search, daily quiz, crash simulator)
- [x] Profile (user hero, stats, badges, town progress, recent trades)
- [x] AIChatbot (floating chatbot, Claude Sonnet 4.5, context-aware)
- [x] Sidebar + BottomNav navigation

### Pending / Backlog 🔲
- [ ] P1: Real NSE/BSE API integration (currently using deterministic mock data)
- [ ] P1: Article content expansion (full articles currently just excerpts)
- [ ] P2: Comments on community posts (UI + backend)
- [ ] P2: Multiple user simulation (multiplayer leaderboard with real data)
- [ ] P2: Profile editing (name/college edit form)
- [ ] P2: Stock watchlist feature
- [ ] P3: Push notifications
- [ ] P3: PDF export for portfolio/trade history
- [ ] P3: Advanced candlestick chart (TradingView widget integration)
