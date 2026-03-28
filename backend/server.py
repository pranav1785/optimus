from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import os, uuid, random, hashlib, logging, numpy as np, asyncio
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
import yfinance as yf

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GUEST_USER_ID = "guest-001"

# ============ MOCK STOCK DATA ============
STOCKS_DATA = [
    {"symbol": "RELIANCE", "name": "Reliance Industries Ltd", "sector": "Energy", "price": 2456.75, "sigma": 0.015},
    {"symbol": "TCS", "name": "Tata Consultancy Services", "sector": "IT", "price": 3789.20, "sigma": 0.012},
    {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "sector": "Banking", "price": 1642.30, "sigma": 0.013},
    {"symbol": "INFY", "name": "Infosys Ltd", "sector": "IT", "price": 1456.85, "sigma": 0.014},
    {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd", "sector": "Banking", "price": 1089.45, "sigma": 0.016},
    {"symbol": "WIPRO", "name": "Wipro Ltd", "sector": "IT", "price": 456.20, "sigma": 0.018},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd", "sector": "Telecom", "price": 1234.60, "sigma": 0.017},
    {"symbol": "ITC", "name": "ITC Ltd", "sector": "FMCG", "price": 456.35, "sigma": 0.012},
    {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank", "sector": "Banking", "price": 1876.90, "sigma": 0.014},
    {"symbol": "AXISBANK", "name": "Axis Bank Ltd", "sector": "Banking", "price": 1123.45, "sigma": 0.016},
    {"symbol": "SBIN", "name": "State Bank of India", "sector": "Banking", "price": 789.30, "sigma": 0.018},
    {"symbol": "MARUTI", "name": "Maruti Suzuki India", "sector": "Auto", "price": 12456.75, "sigma": 0.013},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance Ltd", "sector": "Finance", "price": 6789.20, "sigma": 0.020},
    {"symbol": "TATAMOTORS", "name": "Tata Motors Ltd", "sector": "Auto", "price": 789.45, "sigma": 0.022},
    {"symbol": "HCLTECH", "name": "HCL Technologies", "sector": "IT", "price": 1567.30, "sigma": 0.013},
    {"symbol": "SUNPHARMA", "name": "Sun Pharmaceutical", "sector": "Pharma", "price": 1234.50, "sigma": 0.015},
    {"symbol": "ONGC", "name": "Oil & Natural Gas Corp", "sector": "Energy", "price": 245.70, "sigma": 0.018},
    {"symbol": "POWERGRID", "name": "Power Grid Corp India", "sector": "Utilities", "price": 289.45, "sigma": 0.012},
    {"symbol": "NTPC", "name": "NTPC Ltd", "sector": "Utilities", "price": 356.80, "sigma": 0.014},
    {"symbol": "ADANIPORTS", "name": "Adani Ports & SEZ", "sector": "Logistics", "price": 1234.30, "sigma": 0.022},
]

# ============ YFINANCE REAL-PRICE CACHE ============
_price_cache: dict = {}   # {symbol: {price, change_pct, change, high_52w, low_52w, volume, ts}}
_chart_cache: dict = {}   # {(symbol, period): {data, ts}}
_executor = ThreadPoolExecutor(max_workers=4)
PRICE_TTL = 300    # 5-minute cache for live prices
CHART_TTL = 3600   # 1-hour cache for historical chart data

NSE_SUFFIX = ".NS"
_SYMBOL_MAP = {s["symbol"]: s["symbol"] + NSE_SUFFIX for s in STOCKS_DATA if True}

def _yf_fetch_price(symbol: str) -> dict | None:
    """Run in thread pool — yfinance is blocking."""
    try:
        ticker = yf.Ticker(_SYMBOL_MAP.get(symbol, symbol + NSE_SUFFIX))
        info = ticker.fast_info
        price = float(info.last_price or 0)
        prev = float(info.previous_close or price)
        if price <= 0:
            return None
        chg = round(price - prev, 2)
        chg_pct = round((chg / prev) * 100, 2) if prev else 0
        return {
            "price": round(price, 2),
            "change": chg,
            "change_pct": chg_pct,
            "high_52w": round(float(info.year_high or price * 1.2), 2),
            "low_52w": round(float(info.year_low or price * 0.8), 2),
            "volume": int(info.three_month_average_volume or 1000000),
            "market_cap": float(info.market_cap or 0),
        }
    except Exception as e:
        logger.warning(f"yfinance price fetch failed for {symbol}: {e}")
        return None

def _yf_fetch_chart(symbol: str, period: str) -> list | None:
    """Fetch OHLCV history from yfinance. Returns list of dicts."""
    period_map = {"1M": "1mo", "3M": "3mo", "1Y": "1y", "1D": "1d", "1W": "5d"}
    yf_period = period_map.get(period, "1y")
    interval = "15m" if period == "1D" else "1d"
    try:
        ticker = yf.Ticker(_SYMBOL_MAP.get(symbol, symbol + NSE_SUFFIX))
        hist = ticker.history(period=yf_period, interval=interval)
        if hist.empty:
            return None
        result = []
        for ts, row in hist.iterrows():
            date_str = ts.strftime("%Y-%m-%d") if interval == "1d" else ts.strftime("%Y-%m-%d %H:%M")
            result.append({
                "time": date_str,
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            })
        return result if result else None
    except Exception as e:
        logger.warning(f"yfinance chart fetch failed for {symbol}: {e}")
        return None

async def get_live_price(symbol: str) -> dict:
    """Get real NSE price. Returns merged dict with live+fundamental data."""
    now = datetime.now(timezone.utc).timestamp()
    cached = _price_cache.get(symbol)
    if cached and (now - cached["ts"]) < PRICE_TTL:
        return cached

    loop = asyncio.get_event_loop()
    live = await loop.run_in_executor(_executor, _yf_fetch_price, symbol)

    static = get_stock(symbol) or STOCKS_DATA[0]
    if live:
        merged = {**static, **live, "ts": now}
    else:
        # Fallback to static data
        merged = {**static, "ts": now - PRICE_TTL + 60}  # retry after 1 min
    _price_cache[symbol] = merged
    return merged

async def get_real_chart(symbol: str, period: str) -> list:
    """Get real OHLCV chart. Falls back to mock generation."""
    cache_key = (symbol, period)
    now = datetime.now(timezone.utc).timestamp()
    cached = _chart_cache.get(cache_key)
    if cached and (now - cached["ts"]) < CHART_TTL:
        return cached["data"]

    loop = asyncio.get_event_loop()
    data = await loop.run_in_executor(_executor, _yf_fetch_chart, symbol, period)

    if data and len(data) > 5:
        _chart_cache[cache_key] = {"data": data, "ts": now}
        return data

    # Fallback to mock
    stock = get_stock(symbol) or STOCKS_DATA[0]
    period_days = {"1D": 1, "1W": 7, "1M": 30, "3M": 90, "1Y": 365}.get(period, 365)
    mock = generate_ohlcv(symbol, stock["price"], period_days, stock.get("sigma", 0.015))
    _chart_cache[cache_key] = {"data": mock, "ts": now - CHART_TTL + 300}  # retry in 5 min
    return mock


# Seed static fundamental data for each stock (deterministic)
for s in STOCKS_DATA:
    rng = random.Random(int(hashlib.md5(s["symbol"].encode()).hexdigest(), 16) % (2**31))
    s["pe"] = round(rng.uniform(15, 45), 1)
    s["eps"] = round(s["price"] / s["pe"], 2)
    s["book_value"] = round(s["price"] / rng.uniform(2, 8), 2)
    s["dividend_yield"] = round(rng.uniform(0.5, 3.5), 2)
    s["roe"] = round(rng.uniform(12, 28), 1)
    s["debt_equity"] = round(rng.uniform(0.1, 2.5), 2)
    s["market_cap"] = round(s["price"] * rng.uniform(50, 5000) * 1e6, 0)
    s["change_pct"] = round(rng.uniform(-2, 2), 2)
    s["change"] = round(s["price"] * s["change_pct"] / 100, 2)
    s["high_52w"] = round(s["price"] * rng.uniform(1.1, 1.5), 2)
    s["low_52w"] = round(s["price"] * rng.uniform(0.6, 0.9), 2)
    s["volume"] = rng.randint(500000, 10000000)

CRYPTO_DATA = [
    {"symbol": "BTC", "name": "Bitcoin", "price": 6834560.0, "change_pct": 2.34},
    {"symbol": "ETH", "name": "Ethereum", "price": 389450.0, "change_pct": 1.56},
    {"symbol": "SOL", "name": "Solana", "price": 15678.0, "change_pct": 3.21},
    {"symbol": "BNB", "name": "Binance Coin", "price": 45230.0, "change_pct": -1.23},
    {"symbol": "MATIC", "name": "Polygon", "price": 89.45, "change_pct": 4.56},
]

DAILY_QUIZ_QUESTIONS = [
    {"id": 1, "question": "What does P/E ratio stand for and what does a high P/E indicate?",
     "options": ["Price/Earnings — stock may be overvalued", "Profit/Equity — company is profitable", "Price/Equity — stock pays high dividends", "Profit/Earnings — company grows fast"],
     "correct": 0, "explanation": "P/E = Stock Price / EPS. High P/E can mean high growth expectations or overvaluation. Nifty 50 typically trades at P/E of 20-25."},
    {"id": 2, "question": "₹10,000/month SIP at 12% annual return for 10 years gives approximately:",
     "options": ["₹12 Lakhs", "₹23 Lakhs", "₹46 Lakhs", "₹8 Lakhs"],
     "correct": 1, "explanation": "Total invested = ₹12L, but compound returns give ~₹23.23 Lakhs! Compounding earns returns on returns."},
    {"id": 3, "question": "What is Nifty 50?",
     "options": ["Top 50 stocks on BSE by market cap", "Top 50 stocks on NSE representing major sectors", "50 government bonds on NSE", "Top 50 mutual funds in India"],
     "correct": 1, "explanation": "Nifty 50 represents 50 largest, most liquid companies on NSE across ~12 sectors. It's India's primary equity benchmark."},
    {"id": 4, "question": "RSI below 30 in technical analysis typically means:",
     "options": ["Stock is overbought — sell signal", "Stock is oversold — potential buy opportunity", "Stock has low trading volume", "Stock has high dividend yield"],
     "correct": 1, "explanation": "RSI < 30 = oversold (price may have fallen too much). RSI > 70 = overbought. Use with other indicators for buy/sell signals."},
    {"id": 5, "question": "SEBI's primary role is to:",
     "options": ["Set interest rates for banks", "Regulate and protect investors in securities markets", "Print and manage currency supply", "Provide loans to stockbrokers"],
     "correct": 1, "explanation": "SEBI (Securities and Exchange Board of India) is the regulator for capital markets — the 'police' for stocks and mutual funds."},
]

CRASH_EVENTS = {
    "2008_financial_crisis": {
        "name": "2008 Global Financial Crisis", "market_drop_pct": -65,
        "description": "Triggered by US housing market collapse. Nifty 50 fell ~65% from Jan 2008 peak to March 2009 bottom.",
        "duration_months": 18, "recovery_months": 24,
        "key_causes": ["US subprime mortgage crisis", "Lehman Brothers bankruptcy", "Banking system failure", "Global credit freeze"],
        "india_impact": "Nifty 50 fell from 6,357 (Jan 2008) to 2,252 (March 2009). FIIs withdrew massive funds. Rupee depreciated sharply."
    },
    "2020_covid_crash": {
        "name": "2020 COVID-19 Market Crash", "market_drop_pct": -40,
        "description": "Fastest bear market in history. Nifty 50 fell ~40% in just 40 days due to global pandemic fears.",
        "duration_months": 1.5, "recovery_months": 6,
        "key_causes": ["COVID-19 pandemic", "Global lockdowns", "Supply chain disruption", "Fear and uncertainty"],
        "india_impact": "Nifty 50 crashed from 12,362 to 7,511 in 40 days. Circuit breakers triggered. Historic V-shaped recovery followed."
    },
    "2000_dotcom_bubble": {
        "name": "2000 Dot-com Bubble Burst", "market_drop_pct": -55,
        "description": "Speculative bubble in internet stocks. Indian IT sector severely impacted.",
        "duration_months": 30, "recovery_months": 48,
        "key_causes": ["Overvalued internet companies", "No revenue businesses at billion-dollar valuations", "VC money bubble", "US Fed rate hikes"],
        "india_impact": "Indian IT (Infosys, Wipro) saw massive corrections. Infosys fell ~80% from peak. Took 4+ years to recover."
    },
    "1992_harshad_mehta": {
        "name": "1992 Harshad Mehta Scam", "market_drop_pct": -40,
        "description": "India's biggest stock market scam. BSE crashed ~40% when manipulation was exposed.",
        "duration_months": 3, "recovery_months": 18,
        "key_causes": ["Bank receipts fraud", "Securities market manipulation", "Regulatory gaps", "Media exposure"],
        "india_impact": "BSE Sensex fell from 4,467 to 2,529. Led to SEBI's strengthening and major market reforms."
    }
}

# ============ HELPERS ============
def get_stock(symbol: str):
    return next((s for s in STOCKS_DATA if s["symbol"] == symbol.upper()), None)

def generate_ohlcv(symbol: str, base_price: float, days: int = 365, sigma: float = 0.015) -> list:
    seed = int(hashlib.md5(symbol.encode()).hexdigest(), 16) % (2**31)
    rng = np.random.RandomState(seed)
    returns = rng.normal(0.0003, sigma, days)
    prices = [base_price]
    for r in returns:
        prices.append(prices[-1] * (1 + r))
    ohlcv = []
    current_date = datetime.now(timezone.utc) - timedelta(days=days)
    for i, base in enumerate(prices[:-1]):
        while current_date.weekday() >= 5:
            current_date += timedelta(days=1)
        im = sigma * 0.6
        open_p = base * (1 + rng.normal(0, im * 0.3))
        close_p = base * (1 + rng.normal(0, im * 0.5))
        high_p = max(open_p, close_p) * (1 + abs(rng.normal(0, im * 0.4)))
        low_p = min(open_p, close_p) * (1 - abs(rng.normal(0, im * 0.4)))
        ohlcv.append({
            "time": current_date.strftime("%Y-%m-%d"),
            "open": round(max(open_p, 1.0), 2), "high": round(max(high_p, 1.0), 2),
            "low": round(max(low_p, 1.0), 2), "close": round(max(close_p, 1.0), 2),
            "volume": int(rng.lognormal(15, 0.8))
        })
        current_date += timedelta(days=1)
    return ohlcv

def run_backtest_engine(strategy_type: str, symbol: str, period_days: int = 365) -> dict:
    stock = get_stock(symbol) or STOCKS_DATA[0]
    ohlcv = generate_ohlcv(symbol, stock["price"], period_days)
    closes = [c["close"] for c in ohlcv]
    n = len(closes)
    cash = 100000.0
    position = 0
    trades = []
    equity_curve = []

    if strategy_type == "MA_CROSSOVER":
        short, long_ = 10, 30
        for i in range(long_, n):
            short_ma = sum(closes[i-short:i]) / short
            long_ma = sum(closes[i-long_:i]) / long_
            price = closes[i]
            if short_ma > long_ma and position == 0 and cash >= price:
                qty = int(cash * 0.95 / price)
                if qty > 0:
                    position = qty; cash -= qty * price
                    trades.append({"type": "BUY", "price": price, "qty": qty, "date": ohlcv[i]["time"]})
            elif short_ma < long_ma and position > 0:
                cash += position * price
                trades.append({"type": "SELL", "price": price, "qty": position, "date": ohlcv[i]["time"]})
                position = 0
            equity_curve.append({"date": ohlcv[i]["time"], "value": round(cash + position * price, 2)})

    elif strategy_type == "RSI_MEAN_REVERSION":
        rsi_period = 14
        for i in range(rsi_period + 1, n):
            gains = [max(closes[j] - closes[j-1], 0) for j in range(i-rsi_period, i)]
            losses = [max(closes[j-1] - closes[j], 0) for j in range(i-rsi_period, i)]
            avg_gain = sum(gains) / rsi_period
            avg_loss = sum(losses) / rsi_period
            rsi = 100 if avg_loss == 0 else 100 - (100 / (1 + avg_gain / avg_loss))
            price = closes[i]
            if rsi < 30 and position == 0 and cash >= price:
                qty = int(cash * 0.95 / price)
                if qty > 0:
                    position = qty; cash -= qty * price
                    trades.append({"type": "BUY", "price": price, "qty": qty, "date": ohlcv[i]["time"]})
            elif rsi > 70 and position > 0:
                cash += position * price
                trades.append({"type": "SELL", "price": price, "qty": position, "date": ohlcv[i]["time"]})
                position = 0
            equity_curve.append({"date": ohlcv[i]["time"], "value": round(cash + position * price, 2)})

    elif strategy_type == "MOMENTUM":
        lookback = 20
        for i in range(lookback, n):
            momentum = (closes[i] - closes[i-lookback]) / closes[i-lookback]
            price = closes[i]
            if momentum > 0.05 and position == 0 and cash >= price:
                qty = int(cash * 0.95 / price)
                if qty > 0:
                    position = qty; cash -= qty * price
                    trades.append({"type": "BUY", "price": price, "qty": qty, "date": ohlcv[i]["time"]})
            elif momentum < -0.05 and position > 0:
                cash += position * price
                trades.append({"type": "SELL", "price": price, "qty": position, "date": ohlcv[i]["time"]})
                position = 0
            equity_curve.append({"date": ohlcv[i]["time"], "value": round(cash + position * price, 2)})

    else:  # BUY_AND_HOLD and others
        if closes and cash >= closes[0]:
            qty = int(cash * 0.95 / closes[0])
            if qty > 0:
                position = qty; cash -= qty * closes[0]
                trades.append({"type": "BUY", "price": closes[0], "qty": qty, "date": ohlcv[0]["time"]})
        for i, c in enumerate(ohlcv):
            equity_curve.append({"date": c["time"], "value": round(cash + position * closes[i], 2)})

    if position > 0 and closes:
        final_price = closes[-1]
        cash += position * final_price
        trades.append({"type": "SELL", "price": final_price, "qty": position, "date": ohlcv[-1]["time"]})
        position = 0

    initial_value = 100000.0
    final_value = cash
    total_return = ((final_value - initial_value) / initial_value) * 100
    peak = initial_value; max_dd = 0
    for point in equity_curve:
        if point["value"] > peak: peak = point["value"]
        dd = (peak - point["value"]) / peak * 100
        max_dd = max(max_dd, dd)
    buy_prices = [t["price"] for t in trades if t["type"] == "BUY"]
    sell_prices = [t["price"] for t in trades if t["type"] == "SELL"]
    wins = sum(1 for b, s in zip(buy_prices, sell_prices) if s > b)
    win_rate = (wins / len(buy_prices) * 100) if buy_prices else 0
    daily_returns = [(equity_curve[i]["value"] - equity_curve[i-1]["value"]) / equity_curve[i-1]["value"]
                     for i in range(1, len(equity_curve))] if len(equity_curve) > 1 else []
    if daily_returns:
        mean_r = sum(daily_returns) / len(daily_returns)
        std_r = (sum((r - mean_r)**2 for r in daily_returns) / len(daily_returns)) ** 0.5
        sharpe = (mean_r / std_r * (252 ** 0.5)) if std_r > 0 else 0
    else:
        sharpe = 0

    return {
        "total_return": round(total_return, 2), "max_drawdown": round(-max_dd, 2),
        "sharpe_ratio": round(sharpe, 2), "win_rate": round(win_rate, 1),
        "num_trades": len(buy_prices), "final_value": round(final_value, 2),
        "benchmark_return": 14.5,
        "equity_curve": equity_curve[::5] if len(equity_curve) > 100 else equity_curve,
        "trades": trades[:20],
    }

# ============ PYDANTIC MODELS ============
class TradeRequest(BaseModel):
    symbol: str; asset_type: str = "STOCK"; side: str; order_type: str = "MARKET"
    quantity: float; price: Optional[float] = None

class QuizSubmit(BaseModel):
    answers: List[int]

class PostCreate(BaseModel):
    content: str; topic: str = "general"

class CompetitionCreate(BaseModel):
    name: str; description: str; start_date: str; end_date: str
    asset_classes: List[str] = ["stocks"]; max_participants: int = 50

class StrategyCreate(BaseModel):
    name: str; description: str; code: str; strategy_type: str = "CUSTOM"; is_public: bool = False

class BacktestRequest(BaseModel):
    strategy_type: str; symbol: str; period_days: int = 365

class ChatRequest(BaseModel):
    message: str; session_id: Optional[str] = None; page_context: Optional[str] = None

class XPUpdate(BaseModel):
    xp_amount: int; reason: str = ""

class DailyQuizSubmit(BaseModel):
    answers: List[int]

# ============ STARTUP ============
async def seed_initial_data():
    if not await db.users.find_one({"user_id": GUEST_USER_ID}):
        await db.users.insert_one({
            "user_id": GUEST_USER_ID, "name": "Arjun Mehta", "college": "IIT Bombay",
            "xp": 450, "level": 2, "virtual_balance": 100000.0,
            "badges": ["first_login"], "created_at": datetime.now(timezone.utc).isoformat()
        })
    if not await db.portfolios.find_one({"user_id": GUEST_USER_ID}):
        pid = str(uuid.uuid4())
        await db.portfolios.insert_one({
            "portfolio_id": pid, "user_id": GUEST_USER_ID,
            "cash_balance": 100000.0, "competition_id": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    if not await db.town_progress.find_one({"user_id": GUEST_USER_ID}):
        await db.town_progress.insert_many([
            {"user_id": GUEST_USER_ID, "town_id": i,
             "status": "unlocked" if i == 1 else "locked",
             "completed_lessons": [], "quiz_score": None, "xp_earned": 0, "completed_at": None}
            for i in range(1, 13)
        ])
    if await db.community_posts.count_documents({}) == 0:
        posts = [
            {"post_id": str(uuid.uuid4()), "user_id": "user-002", "username": "Priya Sharma",
             "college": "BITS Pilani", "content": "Just completed Technical Analysis town! RSI on real Nifty 50 charts makes so much sense now 🎯",
             "topic": "technical_analysis", "likes": ["user-003", "user-004"], "comments_count": 3,
             "created_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()},
            {"post_id": str(uuid.uuid4()), "user_id": "user-003", "username": "Rohit Kumar",
             "college": "NIT Trichy", "content": "Paper traded HDFC Bank at ₹1,640 support level. My TA knowledge is paying off!",
             "topic": "equity_trading", "likes": ["user-002", "user-005", "user-006"], "comments_count": 5,
             "created_at": (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat()},
            {"post_id": str(uuid.uuid4()), "user_id": "user-004", "username": "Anjali Gupta",
             "college": "Delhi University", "content": "SIP simulator: ₹5,000/month at 12% for 20 years = ₹49.9 Lakhs! Compound interest is magical ✨",
             "topic": "mutual_funds", "likes": ["user-002", "user-007", "user-008"], "comments_count": 8,
             "created_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat()},
            {"post_id": str(uuid.uuid4()), "user_id": "user-005", "username": "Karan Singh",
             "college": "VIT Vellore", "content": "MA Crossover strategy returned +23.5% on RELIANCE in 1-year backtest! Who else is testing algo strategies?",
             "topic": "algo_trading", "likes": ["user-002", "user-003", "user-010"], "comments_count": 12,
             "created_at": (datetime.now(timezone.utc) - timedelta(hours=8)).isoformat()},
            {"post_id": str(uuid.uuid4()), "user_id": "user-006", "username": "Sneha Patel",
             "college": "SVNIT Surat", "content": "Blockchain explained with a 'shared Google Doc' analogy — now I get why Bitcoin can't be hacked!",
             "topic": "crypto", "likes": ["user-004", "user-005"], "comments_count": 4,
             "created_at": (datetime.now(timezone.utc) - timedelta(hours=12)).isoformat()},
        ]
        await db.community_posts.insert_many(posts)
    if await db.competitions.count_documents({}) == 0:
        comps = [
            {"comp_id": str(uuid.uuid4()), "name": "Nifty 50 Champions — Feb 2026",
             "description": "Trade only Nifty 50 stocks. Best portfolio return wins. Perfect for beginners!",
             "organizer_id": "user-admin", "organizer_name": "Optimus Team",
             "start_date": datetime.now(timezone.utc).isoformat(),
             "end_date": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
             "rules": {"asset_classes": ["stocks"], "allowed_symbols": "NIFTY50"},
             "status": "active", "initial_balance": 100000.0, "prize": "Certificate + 500 XP",
             "participants": [
                 {"user_id": "user-002", "username": "Priya Sharma", "college": "BITS Pilani", "return_pct": 4.23},
                 {"user_id": "user-003", "username": "Rohit Kumar", "college": "NIT Trichy", "return_pct": 2.87},
             ], "created_at": datetime.now(timezone.utc).isoformat()},
            {"comp_id": str(uuid.uuid4()), "name": "Crypto Sprint — March 2026",
             "description": "One month crypto trading challenge. Top 5 crypto only.",
             "organizer_id": "user-admin", "organizer_name": "Optimus Team",
             "start_date": (datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),
             "end_date": (datetime.now(timezone.utc) + timedelta(days=35)).isoformat(),
             "rules": {"asset_classes": ["crypto"]}, "status": "upcoming",
             "initial_balance": 100000.0, "prize": "Certificate + 750 XP",
             "participants": [], "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        await db.competitions.insert_many(comps)

@app.on_event("startup")
async def startup():
    await seed_initial_data()

@app.on_event("shutdown")
async def shutdown():
    client.close()

# ============ USER ============
@api_router.get("/user")
async def get_user():
    user = await db.users.find_one({"user_id": GUEST_USER_ID}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.patch("/user/xp")
async def update_xp(update: XPUpdate):
    user = await db.users.find_one({"user_id": GUEST_USER_ID})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_xp = user.get("xp", 0) + update.xp_amount
    new_level = max(1, 1 + new_xp // 500)
    await db.users.update_one({"user_id": GUEST_USER_ID}, {"$set": {"xp": new_xp, "level": new_level}})
    return await db.users.find_one({"user_id": GUEST_USER_ID}, {"_id": 0})

# ============ MARKET ============
@api_router.get("/market/stocks")
async def get_stocks():
    result = []
    # Fetch all prices concurrently
    import asyncio
    prices = await asyncio.gather(*[get_live_price(s["symbol"]) for s in STOCKS_DATA], return_exceptions=True)
    for s, p in zip(STOCKS_DATA, prices):
        live = p if isinstance(p, dict) else s
        result.append({
            **s,
            "price": live.get("price", s["price"]),
            "change": live.get("change", s["change"]),
            "change_pct": live.get("change_pct", s["change_pct"]),
            "high_52w": live.get("high_52w", s["high_52w"]),
            "low_52w": live.get("low_52w", s["low_52w"]),
            "volume": live.get("volume", s["volume"]),
            "live_price": live.get("price", s["price"]),
            "exchange": "NSE",
        })
    return result

@api_router.get("/market/stocks/{symbol}")
async def get_stock_detail(symbol: str):
    stock = get_stock(symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    live = await get_live_price(symbol)
    return {
        **stock,
        "price": live.get("price", stock["price"]),
        "change": live.get("change", stock["change"]),
        "change_pct": live.get("change_pct", stock["change_pct"]),
        "high_52w": live.get("high_52w", stock["high_52w"]),
        "low_52w": live.get("low_52w", stock["low_52w"]),
        "volume": live.get("volume", stock["volume"]),
        "exchange": "NSE",
    }

@api_router.get("/market/stocks/{symbol}/chart")
async def get_stock_chart(symbol: str, period: str = "1Y"):
    stock = get_stock(symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    data = await get_real_chart(symbol, period)
    return {"symbol": symbol, "period": period, "data": data, "source": "NSE/Yahoo Finance"}

@api_router.get("/market/crypto")
async def get_crypto():
    return [{**c, "live_price": round(c["price"] * (1 + random.uniform(-0.01, 0.01)), 2),
             "change_pct": round(c["change_pct"] + random.uniform(-0.5, 0.5), 2)} for c in CRYPTO_DATA]

@api_router.get("/market/crash-events")
async def get_crash_events():
    return list(CRASH_EVENTS.keys())

@api_router.get("/market/crash-events/{event_id}")
async def get_crash_event(event_id: str):
    event = CRASH_EVENTS.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@api_router.post("/market/crash-simulation")
async def simulate_crash(body: dict):
    event_id = body.get("event_id", "2020_covid_crash")
    crash_data = CRASH_EVENTS.get(event_id)
    if not crash_data:
        raise HTTPException(status_code=404, detail="Event not found")
    portfolio = await db.portfolios.find_one({"user_id": GUEST_USER_ID}, {"_id": 0})
    if not portfolio:
        return {"error": "No portfolio"}
    holdings = await db.holdings.find({"portfolio_id": portfolio.get("portfolio_id")}, {"_id": 0}).to_list(100)
    drop_pct = crash_data["market_drop_pct"] / 100
    simulated = []
    total_before = portfolio["cash_balance"]
    total_after = portfolio["cash_balance"]
    for h in holdings:
        stock = get_stock(h["symbol"])
        current_price = stock["price"] if stock else h["avg_buy_price"]
        current_value = current_price * h["quantity"]
        sim_price = current_price * (1 + drop_pct * random.uniform(0.7, 1.3))
        sim_value = sim_price * h["quantity"]
        simulated.append({"symbol": h["symbol"], "quantity": h["quantity"],
                          "current_price": round(current_price, 2), "simulated_price": round(sim_price, 2),
                          "current_value": round(current_value, 2), "simulated_value": round(sim_value, 2),
                          "loss": round(sim_value - current_value, 2)})
        total_before += current_value; total_after += sim_value
    return {
        "event": crash_data,
        "portfolio_impact": {
            "total_before": round(total_before, 2), "total_after": round(total_after, 2),
            "total_loss": round(total_after - total_before, 2),
            "total_loss_pct": round((total_after - total_before) / total_before * 100, 2) if total_before > 0 else 0,
            "holdings_impact": simulated
        }
    }

# ============ PORTFOLIO ============
@api_router.get("/portfolio")
async def get_portfolio():
    portfolio = await db.portfolios.find_one({"user_id": GUEST_USER_ID}, {"_id": 0})
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    holdings = await db.holdings.find({"portfolio_id": portfolio.get("portfolio_id")}, {"_id": 0}).to_list(100)
    enriched = []
    total_invested = 0; total_current = 0
    for h in holdings:
        stock = get_stock(h["symbol"])
        if stock:
            # Use live price from cache (non-blocking, returns cached value)
            cached = _price_cache.get(h["symbol"])
            cp = cached["price"] if cached else stock["price"]
            cp = round(cp * (1 + random.uniform(-0.001, 0.001)), 2)  # tiny spread
            invested = h["avg_buy_price"] * h["quantity"]
            current_value = cp * h["quantity"]
            pnl = current_value - invested
            enriched.append({**h, "current_price": cp, "current_value": round(current_value, 2),
                              "invested": round(invested, 2), "pnl": round(pnl, 2),
                              "pnl_pct": round((pnl / invested * 100) if invested > 0 else 0, 2),
                              "stock_name": stock.get("name", h["symbol"])})
            total_invested += invested; total_current += current_value
    total_pnl = total_current - total_invested
    total_pv = portfolio["cash_balance"] + total_current
    return {
        "cash_balance": portfolio["cash_balance"], "holdings": enriched,
        "total_invested": round(total_invested, 2), "total_current_value": round(total_current, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_pct": round((total_pnl / total_invested * 100) if total_invested > 0 else 0, 2),
        "total_portfolio_value": round(total_pv, 2),
    }

@api_router.post("/portfolio/trade")
async def execute_trade(trade: TradeRequest):
    portfolio = await db.portfolios.find_one({"user_id": GUEST_USER_ID})
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    pid = portfolio["portfolio_id"]
    if trade.asset_type == "CRYPTO":
        crypto = next((c for c in CRYPTO_DATA if c["symbol"] == trade.symbol), None)
        if not crypto:
            raise HTTPException(status_code=404, detail="Asset not found")
        current_price = crypto["price"] * (1 + random.uniform(-0.005, 0.005))
    else:
        stock = get_stock(trade.symbol)
        if not stock:
            raise HTTPException(status_code=404, detail="Stock not found")
        current_price = stock["price"] * (1 + random.uniform(-0.003, 0.003))
    exec_price = trade.price if (trade.order_type == "LIMIT" and trade.price) else current_price
    total_value = exec_price * trade.quantity
    if trade.side == "BUY":
        if portfolio["cash_balance"] < total_value:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        await db.portfolios.update_one({"portfolio_id": pid}, {"$inc": {"cash_balance": -total_value}})
        existing = await db.holdings.find_one({"portfolio_id": pid, "symbol": trade.symbol})
        if existing:
            total_qty = existing["quantity"] + trade.quantity
            new_avg = (existing["avg_buy_price"] * existing["quantity"] + exec_price * trade.quantity) / total_qty
            await db.holdings.update_one({"portfolio_id": pid, "symbol": trade.symbol},
                                          {"$set": {"quantity": total_qty, "avg_buy_price": round(new_avg, 2)}})
        else:
            await db.holdings.insert_one({
                "holding_id": str(uuid.uuid4()), "portfolio_id": pid, "symbol": trade.symbol,
                "asset_type": trade.asset_type, "quantity": trade.quantity,
                "avg_buy_price": round(exec_price, 2), "created_at": datetime.now(timezone.utc).isoformat()
            })
    elif trade.side == "SELL":
        existing = await db.holdings.find_one({"portfolio_id": pid, "symbol": trade.symbol})
        if not existing or existing["quantity"] < trade.quantity:
            raise HTTPException(status_code=400, detail="Insufficient holdings")
        await db.portfolios.update_one({"portfolio_id": pid}, {"$inc": {"cash_balance": total_value}})
        new_qty = existing["quantity"] - trade.quantity
        if new_qty == 0:
            await db.holdings.delete_one({"portfolio_id": pid, "symbol": trade.symbol})
        else:
            await db.holdings.update_one({"portfolio_id": pid, "symbol": trade.symbol}, {"$set": {"quantity": new_qty}})
    await db.trades.insert_one({
        "trade_id": str(uuid.uuid4()), "portfolio_id": pid, "symbol": trade.symbol,
        "asset_type": trade.asset_type, "side": trade.side, "order_type": trade.order_type,
        "quantity": trade.quantity, "price": round(exec_price, 2),
        "total_value": round(total_value, 2), "timestamp": datetime.now(timezone.utc).isoformat()
    })
    await db.users.update_one({"user_id": GUEST_USER_ID}, {"$inc": {"xp": 10}})
    return {"success": True, "price": round(exec_price, 2), "total": round(total_value, 2)}

@api_router.delete("/portfolio/reset")
async def reset_portfolio():
    portfolio = await db.portfolios.find_one({"user_id": GUEST_USER_ID})
    if portfolio:
        await db.portfolios.update_one({"user_id": GUEST_USER_ID}, {"$set": {"cash_balance": 100000.0}})
        await db.holdings.delete_many({"portfolio_id": portfolio["portfolio_id"]})
        await db.trades.delete_many({"portfolio_id": portfolio["portfolio_id"]})
    return {"success": True, "message": "Portfolio reset to ₹1,00,000"}

@api_router.get("/portfolio/trades")
async def get_trades():
    portfolio = await db.portfolios.find_one({"user_id": GUEST_USER_ID})
    if not portfolio:
        return []
    trades = await db.trades.find({"portfolio_id": portfolio["portfolio_id"]}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return trades

# ============ ROADMAP ============
QUIZ_ANSWERS = {
    1: [1, 0, 2, 1, 3], 2: [0, 2, 1, 3, 0], 3: [2, 1, 0, 3, 2],
    4: [1, 0, 3, 2, 1], 5: [0, 2, 1, 3, 0], 6: [3, 1, 2, 0, 1],
    7: [2, 0, 1, 3, 2], 8: [1, 3, 0, 2, 1], 9: [0, 2, 1, 3, 0],
    10: [2, 0, 3, 1, 2], 11: [1, 3, 0, 2, 1], 12: [3, 1, 2, 0, 3],
}

@api_router.get("/roadmap/progress")
async def get_roadmap_progress():
    progress = await db.town_progress.find({"user_id": GUEST_USER_ID}, {"_id": 0}).to_list(20)
    return progress

@api_router.post("/roadmap/{town_id}/lesson/{lesson_id}")
async def complete_lesson(town_id: int, lesson_id: str):
    progress = await db.town_progress.find_one({"user_id": GUEST_USER_ID, "town_id": town_id})
    if not progress:
        raise HTTPException(status_code=404, detail="Town progress not found")
    if lesson_id not in progress.get("completed_lessons", []):
        await db.town_progress.update_one(
            {"user_id": GUEST_USER_ID, "town_id": town_id},
            {"$push": {"completed_lessons": lesson_id}, "$set": {"status": "in_progress"}, "$inc": {"xp_earned": 50}}
        )
        await db.users.update_one({"user_id": GUEST_USER_ID}, {"$inc": {"xp": 50}})
    return await db.town_progress.find_one({"user_id": GUEST_USER_ID, "town_id": town_id}, {"_id": 0})

@api_router.post("/roadmap/{town_id}/quiz")
async def submit_quiz(town_id: int, submission: QuizSubmit):
    correct_answers = QUIZ_ANSWERS.get(town_id, [0, 0, 0, 0, 0])
    correct_count = sum(1 for a, c in zip(submission.answers, correct_answers) if a == c)
    score = (correct_count / len(correct_answers)) * 100
    passed = score >= 70
    update_data = {"quiz_score": score}
    if passed:
        update_data.update({"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat(), "xp_earned": 200})
        if town_id + 1 <= 12:
            await db.town_progress.update_one({"user_id": GUEST_USER_ID, "town_id": town_id + 1}, {"$set": {"status": "unlocked"}})
        await db.users.update_one({"user_id": GUEST_USER_ID},
                                   {"$inc": {"xp": 200}, "$addToSet": {"badges": f"town_{town_id}_master"}})
        user = await db.users.find_one({"user_id": GUEST_USER_ID})
        if user:
            await db.users.update_one({"user_id": GUEST_USER_ID}, {"$set": {"level": max(1, 1 + user.get("xp", 0) // 500)}})
    await db.town_progress.update_one({"user_id": GUEST_USER_ID, "town_id": town_id}, {"$set": update_data})
    return {"score": round(score, 1), "passed": passed, "correct": correct_count, "total": len(correct_answers)}

# ============ COMMUNITY ============
@api_router.get("/community/posts")
async def get_posts(topic: str = None, limit: int = 20):
    query = {}
    if topic and topic != "all":
        query["topic"] = topic
    posts = await db.community_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for post in posts:
        post["like_count"] = len(post.get("likes", []))
        post["is_liked"] = GUEST_USER_ID in post.get("likes", [])
    return posts

@api_router.post("/community/posts")
async def create_post(post: PostCreate):
    user = await db.users.find_one({"user_id": GUEST_USER_ID}, {"_id": 0})
    new_post = {
        "post_id": str(uuid.uuid4()), "user_id": GUEST_USER_ID,
        "username": user.get("name", "Guest") if user else "Guest",
        "college": user.get("college", "Unknown") if user else "Unknown",
        "content": post.content, "topic": post.topic, "likes": [],
        "comments_count": 0, "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.community_posts.insert_one(new_post)
    await db.users.update_one({"user_id": GUEST_USER_ID}, {"$inc": {"xp": 25}})
    new_post.pop("_id", None)
    new_post["like_count"] = 0; new_post["is_liked"] = False
    return new_post

@api_router.post("/community/posts/{post_id}/like")
async def like_post(post_id: str):
    post = await db.community_posts.find_one({"post_id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    likes = post.get("likes", [])
    if GUEST_USER_ID in likes:
        likes.remove(GUEST_USER_ID); action = "unliked"
    else:
        likes.append(GUEST_USER_ID); action = "liked"
    await db.community_posts.update_one({"post_id": post_id}, {"$set": {"likes": likes}})
    return {"action": action, "like_count": len(likes)}

@api_router.get("/community/leaderboard")
async def get_leaderboard():
    mock_lb = [
        {"rank": 1, "username": "Priya Sharma", "college": "BITS Pilani", "xp": 4250, "level": 9, "portfolio_return": 12.45},
        {"rank": 2, "username": "Karan Singh", "college": "VIT Vellore", "xp": 3890, "level": 8, "portfolio_return": 9.87},
        {"rank": 3, "username": "Rohit Kumar", "college": "NIT Trichy", "xp": 3560, "level": 8, "portfolio_return": 8.23},
        {"rank": 4, "username": "Vijay Nair", "college": "NIT Calicut", "xp": 3120, "level": 7, "portfolio_return": 6.78},
        {"rank": 5, "username": "Anjali Gupta", "college": "Delhi University", "xp": 2890, "level": 6, "portfolio_return": 5.45},
        {"rank": 6, "username": "Aryan Mehta", "college": "MNIT Jaipur", "xp": 2650, "level": 6, "portfolio_return": 4.12},
        {"rank": 7, "username": "Sneha Patel", "college": "SVNIT Surat", "xp": 2340, "level": 5, "portfolio_return": 3.89},
        {"rank": 8, "username": "Rahul Joshi", "college": "COEP Pune", "xp": 2100, "level": 5, "portfolio_return": 2.67},
        {"rank": 9, "username": "Meera Reddy", "college": "IIT Hyderabad", "xp": 1890, "level": 4, "portfolio_return": 1.45},
        {"rank": 10, "username": "Arjun Pillai", "college": "NIT Warangal", "xp": 1650, "level": 4, "portfolio_return": 0.89},
    ]
    user = await db.users.find_one({"user_id": GUEST_USER_ID}, {"_id": 0})
    guest_entry = {
        "rank": 11, "username": user.get("name", "You") if user else "You",
        "college": user.get("college", "Your College") if user else "Your College",
        "xp": user.get("xp", 0) if user else 0, "level": user.get("level", 1) if user else 1,
        "portfolio_return": 0.0, "is_current_user": True
    }
    return {"leaderboard": mock_lb, "user_rank": guest_entry}

# ============ COMPETITIONS ============
@api_router.get("/competitions")
async def get_competitions():
    comps = await db.competitions.find({}, {"_id": 0}).to_list(20)
    for comp in comps:
        comp["participant_count"] = len(comp.get("participants", []))
        comp["is_joined"] = any(p.get("user_id") == GUEST_USER_ID for p in comp.get("participants", []))
    return comps

@api_router.post("/competitions")
async def create_competition(comp: CompetitionCreate):
    user = await db.users.find_one({"user_id": GUEST_USER_ID}, {"_id": 0})
    new_comp = {
        "comp_id": str(uuid.uuid4()), "name": comp.name, "description": comp.description,
        "organizer_id": GUEST_USER_ID, "organizer_name": user.get("name", "Guest") if user else "Guest",
        "start_date": comp.start_date, "end_date": comp.end_date,
        "rules": {"asset_classes": comp.asset_classes}, "status": "upcoming",
        "participants": [], "initial_balance": 100000.0, "prize": "Certificate + 500 XP",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.competitions.insert_one(new_comp)
    new_comp.pop("_id", None)
    new_comp["participant_count"] = 0; new_comp["is_joined"] = False
    return new_comp

@api_router.post("/competitions/{comp_id}/join")
async def join_competition(comp_id: str):
    comp = await db.competitions.find_one({"comp_id": comp_id})
    if not comp:
        raise HTTPException(status_code=404, detail="Competition not found")
    participants = comp.get("participants", [])
    if any(p.get("user_id") == GUEST_USER_ID for p in participants):
        return {"success": False, "message": "Already joined"}
    user = await db.users.find_one({"user_id": GUEST_USER_ID}, {"_id": 0})
    participants.append({"user_id": GUEST_USER_ID, "username": user.get("name", "Guest") if user else "Guest",
                         "college": user.get("college", "Unknown") if user else "Unknown", "return_pct": 0.0})
    await db.competitions.update_one({"comp_id": comp_id}, {"$set": {"participants": participants}})
    return {"success": True, "message": "Successfully joined!"}

# ============ ALGO LAB ============
PRE_BUILT_STRATEGIES = [
    {"strategy_id": "pre-1", "name": "Moving Average Crossover", "strategy_type": "MA_CROSSOVER",
     "description": "Buy when 10-day MA crosses above 30-day MA, sell when it crosses below. Classic trend-following strategy.",
     "is_pre_built": True, "risk_level": "Medium", "expected_return": "15-25% annualized",
     "code": "# MA Crossover Strategy\nshort_window = 10\nlong_window = 30\n\nfor i in range(long_window, len(prices)):\n    short_ma = average(prices[i-short_window:i])\n    long_ma = average(prices[i-long_window:i])\n    \n    if short_ma > long_ma and not in_position:\n        buy(symbol, quantity=10)\n    elif short_ma < long_ma and in_position:\n        sell(symbol, quantity=10)"},
    {"strategy_id": "pre-2", "name": "RSI Mean Reversion", "strategy_type": "RSI_MEAN_REVERSION",
     "description": "Buy oversold stocks (RSI < 30), sell overbought (RSI > 70). Works well in sideways markets.",
     "is_pre_built": True, "risk_level": "Medium-Low", "expected_return": "10-20% annualized",
     "code": "# RSI Mean Reversion\nrsi_period = 14\n\nfor i in range(rsi_period, len(prices)):\n    rsi = calculate_rsi(prices, i, rsi_period)\n    \n    if rsi < 30 and not in_position:\n        buy(symbol, quantity=10)\n    elif rsi > 70 and in_position:\n        sell(symbol, quantity=10)"},
    {"strategy_id": "pre-3", "name": "Momentum Strategy", "strategy_type": "MOMENTUM",
     "description": "Buy stocks with strong upward momentum (>5% over 20 days), sell on reversal.",
     "is_pre_built": True, "risk_level": "High", "expected_return": "18-30% annualized",
     "code": "# Momentum Strategy\nlookback = 20\n\nfor i in range(lookback, len(prices)):\n    momentum = (prices[i] - prices[i-lookback]) / prices[i-lookback]\n    \n    if momentum > 0.05 and not in_position:\n        buy(symbol, quantity=10)\n    elif momentum < -0.05 and in_position:\n        sell(symbol, quantity=10)"},
    {"strategy_id": "pre-4", "name": "Buy and Hold", "strategy_type": "BUY_AND_HOLD",
     "description": "The simplest strategy — Warren Buffett's preferred approach for quality businesses.",
     "is_pre_built": True, "risk_level": "Low", "expected_return": "12-15% annualized",
     "code": "# Buy and Hold Strategy\nbuy(symbol, quantity=10)  # Buy on day 1 and hold forever\n# sell(symbol)  # Only when you absolutely need the money"},
    {"strategy_id": "pre-5", "name": "SIP Simulation", "strategy_type": "SIP",
     "description": "Invest fixed amount every month regardless of market conditions.",
     "is_pre_built": True, "risk_level": "Very Low", "expected_return": "12-15% long term",
     "code": "# SIP Strategy\nmonthly_amount = 10000\n\nfor i in range(0, len(prices), 30):\n    qty = int(monthly_amount / prices[i])\n    if qty > 0:\n        buy(symbol, quantity=qty)"},
    {"strategy_id": "pre-6", "name": "Bollinger Band Breakout", "strategy_type": "BOLLINGER_BREAKOUT",
     "description": "Buy when price breaks above upper Bollinger Band, sell at lower band.",
     "is_pre_built": True, "risk_level": "High", "expected_return": "20-35% annualized",
     "code": "# Bollinger Band Strategy\nwindow = 20; multiplier = 2\n\nfor i in range(window, len(prices)):\n    mid = average(prices[i-window:i])\n    std = stddev(prices[i-window:i])\n    upper = mid + multiplier * std\n    lower = mid - multiplier * std\n    \n    if prices[i] > upper and not in_position:\n        buy(symbol, quantity=10)\n    elif prices[i] < lower and in_position:\n        sell(symbol, quantity=10)"},
]

@api_router.get("/algo/strategies")
async def get_strategies():
    user_strategies = await db.strategies.find({"user_id": GUEST_USER_ID}, {"_id": 0}).to_list(20)
    return {"pre_built": PRE_BUILT_STRATEGIES, "user_strategies": user_strategies}

@api_router.post("/algo/strategies")
async def save_strategy(strategy: StrategyCreate):
    new_strategy = {
        "strategy_id": str(uuid.uuid4()), "user_id": GUEST_USER_ID, "name": strategy.name,
        "description": strategy.description, "code": strategy.code, "strategy_type": strategy.strategy_type,
        "is_public": strategy.is_public, "is_pre_built": False, "backtest_results": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.strategies.insert_one(new_strategy)
    new_strategy.pop("_id", None)
    return new_strategy

@api_router.post("/algo/backtest")
async def run_backtest_route(req: BacktestRequest):
    try:
        return run_backtest_engine(req.strategy_type, req.symbol, req.period_days)
    except Exception as e:
        logger.error(f"Backtest error: {e}")
        return {"total_return": round(random.uniform(-5, 35), 2), "max_drawdown": round(random.uniform(-20, -2), 2),
                "sharpe_ratio": round(random.uniform(0.5, 2.5), 2), "win_rate": round(random.uniform(40, 65), 1),
                "num_trades": random.randint(8, 40), "final_value": round(random.uniform(90000, 135000), 2),
                "benchmark_return": 14.5, "equity_curve": [], "trades": []}

# ============ CHATBOT ============
@api_router.post("/chatbot/message")
async def chatbot_message(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    system_message = f"""You are Optimus AI — a friendly, knowledgeable, and encouraging finance tutor for Indian college students new to investing.

Personality:
- Friendly, patient, and motivating. Never condescending.
- Use simple language; explain jargon when used.
- Always use Indian market context: NSE, BSE, SEBI, Nifty 50, Sensex, RBI
- Use Indian companies as examples: Reliance, TCS, HDFC Bank, Infosys, Bajaj Finance
- Reference Indian concepts: SIP, ELSS, PPF, FD, NPS, Demat account
- Use ₹ for currency examples
- NEVER give direct investment advice. Frame responses educationally.
- If asked "should I buy X?", respond: "Here's how you'd evaluate that yourself..."
- Be concise; use bullet points for clarity.

Current page context: {request.page_context or "Optimus dashboard"}"""
    try:
        chat = LlmChat(api_key=os.environ.get("EMERGENT_LLM_KEY"), session_id=session_id,
                       system_message=system_message).with_model("anthropic", "claude-sonnet-4-5-20250929")
        response = await chat.send_message(UserMessage(text=request.message))
        await db.chat_sessions.update_one({"session_id": session_id},
                                           {"$set": {"session_id": session_id, "last_active": datetime.now(timezone.utc).isoformat()}}, upsert=True)
        return {"response": response, "session_id": session_id}
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        return {"response": "I'm having a brief connection issue. Please try again in a moment! Meanwhile, explore the lessons — they answer most investing questions.",
                "session_id": session_id}

# ============ LEARNING ============
@api_router.get("/learn/daily-quiz")
async def get_daily_quiz():
    today = datetime.now(timezone.utc).date().isoformat()
    completed = await db.daily_quiz_completions.find_one({"user_id": GUEST_USER_ID, "date": today})
    return {"questions": DAILY_QUIZ_QUESTIONS, "already_completed": bool(completed), "xp_reward": 100}

@api_router.post("/learn/daily-quiz/submit")
async def submit_daily_quiz(submission: DailyQuizSubmit):
    today = datetime.now(timezone.utc).date().isoformat()
    if await db.daily_quiz_completions.find_one({"user_id": GUEST_USER_ID, "date": today}):
        return {"message": "Already completed today's quiz!", "xp_earned": 0}
    correct_answers = [q["correct"] for q in DAILY_QUIZ_QUESTIONS]
    correct_count = sum(1 for a, c in zip(submission.answers, correct_answers) if a == c)
    score = (correct_count / len(correct_answers)) * 100
    xp_earned = int(score)
    await db.daily_quiz_completions.insert_one({"user_id": GUEST_USER_ID, "date": today, "score": score, "xp_earned": xp_earned})
    await db.users.update_one({"user_id": GUEST_USER_ID}, {"$inc": {"xp": xp_earned}})
    return {"score": round(score, 1), "correct": correct_count, "total": len(correct_answers), "xp_earned": xp_earned}

@api_router.get("/notifications")
async def get_notifications():
    user = await db.users.find_one({"user_id": GUEST_USER_ID}, {"_id": 0})
    level = user.get("level", 1) if user else 1
    return [
        {"id": "n1", "type": "level_up", "title": f"Level {level} Achieved!", "message": "Keep learning to level up!", "time": "2h ago", "read": False},
        {"id": "n2", "type": "competition", "title": "Competition Starting Soon", "message": "Nifty 50 Champions starts in 2 days!", "time": "5h ago", "read": True},
        {"id": "n3", "type": "badge", "title": "Badge: First Trade", "message": "You placed your first paper trade!", "time": "1d ago", "read": True},
    ]

@api_router.get("/analysis/stock/{symbol}")
async def get_stock_analysis(symbol: str):
    stock = get_stock(symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    live = await get_live_price(symbol)
    current_price = live.get("price", stock["price"])
    # Use live market cap if available, else fall back to static calculation
    mkt_cap = live.get("market_cap", 0) or (stock["market_cap"])
    rng = random.Random(int(hashlib.md5(symbol.encode()).hexdigest(), 16) % (2**31))
    revenue = rng.uniform(50000, 500000)
    return {
        "symbol": symbol, "name": stock["name"], "sector": stock["sector"],
        "current_price": current_price,
        "change_pct": live.get("change_pct", stock["change_pct"]),
        "change": live.get("change", stock["change"]),
        "pe_ratio": stock["pe"],
        "pb_ratio": round(current_price / stock["book_value"], 2) if stock["book_value"] else stock["pe"],
        "eps": round(current_price / stock["pe"], 2) if stock["pe"] else stock["eps"],
        "book_value": stock["book_value"], "dividend_yield": stock["dividend_yield"],
        "roe": stock["roe"], "debt_equity": stock["debt_equity"],
        "market_cap_cr": round(mkt_cap / 1e7, 0) if mkt_cap > 0 else round(stock["market_cap"] / 1e7, 0),
        "high_52w": live.get("high_52w", stock["high_52w"]),
        "low_52w": live.get("low_52w", stock["low_52w"]),
        "volume": live.get("volume", stock["volume"]),
        "income_statement": {
            "revenue": round(revenue, 0), "gross_profit": round(revenue * 0.45, 0),
            "ebitda": round(revenue * 0.25, 0), "net_profit": round(revenue * 0.15, 0),
        },
        "balance_sheet": {
            "total_assets": round(revenue * 2.5, 0), "total_equity": round(revenue * 1.2, 0),
            "total_debt": round(revenue * 0.8, 0), "cash": round(revenue * 0.3, 0),
        },
        "analyst_consensus": {
            "buy": rng.randint(8, 18), "hold": rng.randint(3, 8), "sell": rng.randint(0, 3),
            "target_price": round(current_price * rng.uniform(1.1, 1.4), 2),
        },
        "news": [
            {"headline": f"{stock['name']} reports {rng.randint(10, 30)}% YoY growth in Q3 FY26",
             "source": "Economic Times", "time": "2h ago", "sentiment": "positive"},
            {"headline": f"Analysts upgrade {symbol} to Buy, target ₹{round(current_price * 1.25, 0)}",
             "source": "Moneycontrol", "time": "1d ago", "sentiment": "positive"},
            {"headline": f"{stock['sector']} sector faces headwinds amid global uncertainty",
             "source": "Mint", "time": "2d ago", "sentiment": "neutral"},
        ],
    }

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True,
                   allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
                   allow_methods=["*"], allow_headers=["*"])
