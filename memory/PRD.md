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
- [x] Backend: All FastAPI routes, MongoDB integration, yfinance real NSE prices (5-min cache, graceful fallback)
- [x] Frontend: All 12 pages routed and fully implemented
- [x] **Landing, Dashboard** (with daily quiz CTA quick action)
- [x] **Roadmap → "Learn"**: Island map (CoC-style), 12 towns, SVG paths, zone labels (Beach/Forest/Mountain), animated nodes, Side Quests panel, Town popup
- [x] **TownDetail**: Lesson accordion, quiz flow, lessons count capped correctly, "Side Quest Unlocked" try-out section
- [x] **TradingTerminal**: Real prices, z-index fixed stock dropdown, labeled volume chart, info buttons
- [x] **Portfolio**: Holdings table, pie chart, crash sim tab (3 historical crashes)
- [x] **Analysis**: RSI/MACD/BB charts with InfoButton, fundamental ratios with InfoButton
- [x] **AlgoLab**: Strategy picker, backtest engine, equity curve, metrics with InfoButton
- [x] **Community**: Feed, create post, like, topic filters, embedded leaderboard
- [x] **Arena**: Competitions, join/create, embedded leaderboard
- [x] **Blogs (formerly Learn)**: Daily quiz banner CTA + 3 tabs (Quiz/Articles/Glossary), full article reader
- [x] **Profile**: Read-only hero, badges, town progress, recent trades
- [x] **AIChatbot**: Claude Sonnet 4.5, markdown formatting, click-outside close
- [x] Sidebar + BottomNav: "Learn" (island) / "Blogs" (articles) correctly labeled
- [x] InfoButton on: Analysis (BB, RSI, MACD, P/E, ROE, EPS, Market Cap, etc.), AlgoLab (Sharpe, Drawdown, Win Rate, Equity Curve), Portfolio (P&L), Trade (Volume)
- [x] Full ARTICLES content (6 articles with proper markdown content + article reader)
- [x] Extended INFO_DEFINITIONS (20 terms)
- [x] **Hex Island Roadmap Redesign** (Feb 2026): Hexagonal clip-path tiles, zone-specific vibrant colors (beach=amber, forest=green, mountain=indigo, peak=gold), organic radial-gradient terrain, hex-grid ocean background, compact pill labels (no overlap), floating decorative elements
- [x] **MA10/MA30 default OFF** in TradingTerminal (cleaner default chart view)
- [x] **Volume tooltip text → white** in TradingTerminal (readability fix)
- [x] **Daily Quiz banner** on Dashboard — prominent green CTA between stats and chart

### Pending / Backlog 🔲
- [ ] P1: TATAMOTORS.NS yfinance symbol fix (currently uses fallback mock price)
- [ ] P2: Comments on community posts (UI + backend)
- [ ] P2: Multiple user simulation (real multiplayer leaderboards)
- [ ] P2: Profile editing (name/college)
- [ ] P2: Stock watchlist feature
- [ ] P3: Push/in-app notifications
- [ ] P3: PDF portfolio export
- [ ] P3: TradingView Lightweight Charts (candlestick) integration
